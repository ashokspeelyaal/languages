/* Metrics view + D3 charts.
 * Reads from window.Store.state.
 * Exposes window.Metrics.render(mount). */
(function () {
  const d3 = window.d3;

  /* ====== Tooltip singleton ====== */
  let tip;
  function ensureTip() {
    if (tip) return tip;
    tip = d3.select("body").append("div").attr("class", "d3-tooltip");
    return tip;
  }
  function showTip(ev, html) {
    ensureTip()
      .classed("show", true)
      .html(html)
      .style("left", ev.clientX + 12 + "px")
      .style("top", ev.clientY + 12 + "px");
  }
  function hideTip() { if (tip) tip.classed("show", false); }

  /* ====== Aggregations ====== */
  function aggregate() {
    const s = window.Store.state;
    const items = window.VOCAB_DATA.items;
    const today = window.Store.today();

    // Per-item progress
    const seen = items.filter((it) => s.items[it.id] && s.items[it.id].seen > 0);
    const mastered = items.filter((it) => s.items[it.id] && s.items[it.id].box === 5);

    // Leitner box distribution: items in each box (unseen counted in box 1)
    const boxes = [0, 0, 0, 0, 0]; // index = box-1
    items.forEach((it) => {
      const p = s.items[it.id];
      const b = p ? p.box : 1;
      boxes[Math.min(5, Math.max(1, b)) - 1] += 1;
    });

    // Activity: last 90 days
    const days = [];
    const todayD = new Date(today);
    for (let i = 89; i >= 0; i--) {
      const d = new Date(todayD); d.setDate(d.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      const h = s.history[iso] || { right: 0, wrong: 0 };
      days.push({ date: d, iso, right: h.right, wrong: h.wrong, total: h.right + h.wrong });
    }

    // Daily accuracy: last 30 days, only on days with attempts
    const accSeries = days.slice(-30).map((d) => ({
      date: d.date,
      acc: d.total ? d.right / d.total : null,
      n: d.total,
    }));

    // Category strength: % correct among seen items in each category
    const catMap = {};
    items.forEach((it) => {
      const p = s.items[it.id];
      if (!p || p.seen < 1) return;
      if (!catMap[it.category]) catMap[it.category] = { right: 0, total: 0, items: 0 };
      catMap[it.category].right += p.correct;
      catMap[it.category].total += p.seen;
      catMap[it.category].items += 1;
    });
    const catBars = Object.entries(catMap)
      .map(([cat, x]) => ({ cat, acc: x.right / x.total, n: x.total, items: x.items }))
      .filter((x) => x.n >= 3)
      .sort((a, b) => b.acc - a.acc)
      .slice(0, 12);

    // Forgetting curve: items due in next 14 days
    const dueBuckets = [];
    for (let i = 0; i < 14; i++) {
      const d = new Date(todayD); d.setDate(d.getDate() + i);
      const iso = d.toISOString().slice(0, 10);
      dueBuckets.push({ date: d, iso, count: 0 });
    }
    items.forEach((it) => {
      const p = s.items[it.id];
      if (!p || !p.due) return;
      const idx = dueBuckets.findIndex((b) => b.iso === p.due);
      if (idx >= 0) dueBuckets[idx].count += 1;
      else if (p.due < dueBuckets[0].iso) dueBuckets[0].count += 1; // overdue → today
    });

    // Totals
    const totalRetrievals = Object.values(s.history).reduce((a, h) => a + h.right + h.wrong, 0);
    const last7 = days.slice(-7);
    const last7Right = last7.reduce((a, d) => a + d.right, 0);
    const last7Total = last7.reduce((a, d) => a + d.total, 0);
    const last7Acc = last7Total ? last7Right / last7Total : 0;

    return {
      items, seen, mastered, boxes, days, accSeries, catBars, dueBuckets,
      totalRetrievals, last7Acc, last7Total,
    };
  }

  /* ====== Charts ====== */
  function drawHeatmap(mount, days) {
    mount.innerHTML = "";
    const cell = 14, gap = 3, cellSize = cell + gap;
    // 90 days → group into weeks (cols)
    const weeks = [];
    let week = new Array(7).fill(null);
    days.forEach((d) => {
      const dow = (d.date.getDay() + 6) % 7; // Mon=0 .. Sun=6
      if (dow === 0 && week.some(Boolean)) { weeks.push(week); week = new Array(7).fill(null); }
      week[dow] = d;
    });
    weeks.push(week);
    const w = weeks.length * cellSize + 40;
    const h = 7 * cellSize + 30;

    const svg = d3.select(mount).append("svg").attr("viewBox", `0 0 ${w} ${h}`);

    // Day-of-week labels
    ["Ma", "", "Wo", "", "Vr", "", "Zo"].forEach((lbl, i) => {
      if (!lbl) return;
      svg.append("text")
        .attr("x", 0)
        .attr("y", 16 + i * cellSize + cell - 2)
        .attr("font-size", "9px")
        .attr("fill", "var(--ink-faint)")
        .text(lbl);
    });

    // Cells
    const max = d3.max(days, (d) => d.total) || 1;
    const level = (n) => n === 0 ? 0 : n <= max * 0.25 ? 1 : n <= max * 0.5 ? 2 : n <= max * 0.8 ? 3 : 4;

    weeks.forEach((wk, wi) => {
      wk.forEach((d, di) => {
        if (!d) return;
        svg.append("rect")
          .attr("class", `heat-day l${level(d.total)}`)
          .attr("x", 24 + wi * cellSize)
          .attr("y", 16 + di * cellSize)
          .attr("width", cell)
          .attr("height", cell)
          .attr("rx", 2)
          .on("mouseenter", (ev) => showTip(ev,
            `<strong>${d.iso}</strong><br>${d.total} ophaal · ${d.right} ✓ · ${d.wrong} ✗`))
          .on("mousemove", (ev) => showTip(ev,
            `<strong>${d.iso}</strong><br>${d.total} ophaal · ${d.right} ✓ · ${d.wrong} ✗`))
          .on("mouseleave", hideTip);
      });
    });

    // Month labels along the top
    const monthLabels = {};
    weeks.forEach((wk, wi) => {
      const firstD = wk.find(Boolean);
      if (!firstD) return;
      const m = firstD.date.toLocaleString("nl-NL", { month: "short" });
      if (!(m in monthLabels)) monthLabels[m] = wi;
    });
    Object.entries(monthLabels).forEach(([m, wi]) => {
      svg.append("text")
        .attr("class", "heat-month-label")
        .attr("x", 24 + wi * cellSize)
        .attr("y", 10)
        .text(m);
    });

    // Legend (right side)
    const lx = 24 + weeks.length * cellSize + 8;
    svg.append("text").attr("x", lx).attr("y", 16).attr("font-size", "9px")
      .attr("fill", "var(--ink-faint)").text("min");
    for (let i = 0; i < 5; i++) {
      svg.append("rect")
        .attr("class", `heat-day l${i}`)
        .attr("x", lx).attr("y", 20 + i * (cell + 2))
        .attr("width", cell).attr("height", cell).attr("rx", 2);
    }
    svg.append("text").attr("x", lx).attr("y", 20 + 5 * (cell + 2) + 9)
      .attr("font-size", "9px").attr("fill", "var(--ink-faint)").text("max");
  }

  function drawLeitnerWaterfall(mount, boxes) {
    mount.innerHTML = "";
    const w = 480, h = 240, m = { top: 18, right: 16, bottom: 38, left: 36 };
    const innerW = w - m.left - m.right;
    const innerH = h - m.top - m.bottom;
    const svg = d3.select(mount).append("svg").attr("viewBox", `0 0 ${w} ${h}`);
    const g = svg.append("g").attr("transform", `translate(${m.left},${m.top})`);

    const x = d3.scaleBand().domain([1, 2, 3, 4, 5]).range([0, innerW]).padding(0.22);
    const y = d3.scaleLinear().domain([0, d3.max(boxes) || 1]).nice().range([innerH, 0]);
    const colors = ["#A23B2B", "#C56A3F", "#D8A93B", "#7C8C46", "#5A7A3F"];

    // Grid
    g.append("g").attr("class", "grid")
      .call(d3.axisLeft(y).ticks(4).tickSize(-innerW).tickFormat(""));
    // Axes
    g.append("g").attr("class", "axis").attr("transform", `translate(0,${innerH})`)
      .call(d3.axisBottom(x).tickFormat((d) => "Vak " + d));
    g.append("g").attr("class", "axis").call(d3.axisLeft(y).ticks(4));

    g.selectAll(".bar")
      .data(boxes)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (_d, i) => x(i + 1))
      .attr("width", x.bandwidth())
      .attr("y", innerH)
      .attr("height", 0)
      .attr("rx", 2)
      .attr("fill", (_d, i) => colors[i])
      .on("mouseenter", (ev, d) => showTip(ev, `<strong>${d}</strong> items`))
      .on("mousemove", (ev, d) => showTip(ev, `<strong>${d}</strong> items`))
      .on("mouseleave", hideTip)
      .transition().duration(800).delay((_d, i) => i * 80).ease(d3.easeCubicOut)
      .attr("y", (d) => y(d))
      .attr("height", (d) => innerH - y(d));

    g.selectAll(".barlabel")
      .data(boxes)
      .enter()
      .append("text")
      .attr("class", "label")
      .attr("text-anchor", "middle")
      .attr("x", (_d, i) => x(i + 1) + x.bandwidth() / 2)
      .attr("y", (d) => y(d) - 6)
      .style("opacity", 0)
      .text((d) => d)
      .transition().duration(800).delay((_d, i) => i * 80 + 200)
      .style("opacity", 1);
  }

  function drawAccuracyLine(mount, series) {
    mount.innerHTML = "";
    const hasData = series.some((s) => s.acc !== null);
    if (!hasData) {
      mount.innerHTML = `<div class="empty-chart">Nog geen sessiegegevens. Doe een ronde — dit vult vanzelf.</div>`;
      return;
    }
    const w = 480, h = 240, m = { top: 18, right: 16, bottom: 30, left: 32 };
    const innerW = w - m.left - m.right, innerH = h - m.top - m.bottom;
    const svg = d3.select(mount).append("svg").attr("viewBox", `0 0 ${w} ${h}`);
    const g = svg.append("g").attr("transform", `translate(${m.left},${m.top})`);

    const x = d3.scaleTime().domain(d3.extent(series, (d) => d.date)).range([0, innerW]);
    const y = d3.scaleLinear().domain([0, 1]).range([innerH, 0]);

    g.append("g").attr("class", "grid")
      .call(d3.axisLeft(y).ticks(4).tickSize(-innerW).tickFormat(""));
    g.append("g").attr("class", "axis").attr("transform", `translate(0,${innerH})`)
      .call(d3.axisBottom(x).ticks(6).tickFormat(d3.timeFormat("%d %b")));
    g.append("g").attr("class", "axis")
      .call(d3.axisLeft(y).ticks(4).tickFormat((d) => Math.round(d * 100) + "%"));

    // Defined area only for days with data
    const defined = (d) => d.acc !== null;
    const area = d3.area()
      .defined(defined)
      .x((d) => x(d.date))
      .y0(innerH)
      .y1((d) => y(d.acc))
      .curve(d3.curveMonotoneX);
    g.append("path")
      .datum(series)
      .attr("fill", "rgba(31,71,117,.15)")
      .attr("d", area);

    const line = d3.line()
      .defined(defined)
      .x((d) => x(d.date))
      .y((d) => y(d.acc))
      .curve(d3.curveMonotoneX);
    const path = g.append("path")
      .datum(series)
      .attr("fill", "none")
      .attr("stroke", "var(--delft)")
      .attr("stroke-width", 2)
      .attr("d", line);
    // Animate the line draw
    const totalLength = path.node().getTotalLength();
    path
      .attr("stroke-dasharray", totalLength + " " + totalLength)
      .attr("stroke-dashoffset", totalLength)
      .transition().duration(900).ease(d3.easeCubicOut)
      .attr("stroke-dashoffset", 0);

    g.selectAll(".dot")
      .data(series.filter(defined))
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("cx", (d) => x(d.date))
      .attr("cy", (d) => y(d.acc))
      .attr("r", 3)
      .attr("fill", "var(--delft)")
      .on("mouseenter", (ev, d) => showTip(ev,
        `<strong>${d3.timeFormat("%d %b")(d.date)}</strong><br>${Math.round(d.acc * 100)}% · ${d.n} vragen`))
      .on("mousemove", (ev, d) => showTip(ev,
        `<strong>${d3.timeFormat("%d %b")(d.date)}</strong><br>${Math.round(d.acc * 100)}% · ${d.n} vragen`))
      .on("mouseleave", hideTip);
  }

  function drawCategoryBars(mount, bars) {
    mount.innerHTML = "";
    if (!bars.length) {
      mount.innerHTML = `<div class="empty-chart">Nog te weinig data per categorie.</div>`;
      return;
    }
    const m = { top: 8, right: 60, bottom: 18, left: 200 };
    const rowH = 22;
    const innerH = bars.length * rowH;
    const w = 560;
    const h = innerH + m.top + m.bottom;
    const innerW = w - m.left - m.right;

    const svg = d3.select(mount).append("svg").attr("viewBox", `0 0 ${w} ${h}`);
    const g = svg.append("g").attr("transform", `translate(${m.left},${m.top})`);

    const y = d3.scaleBand().domain(bars.map((d) => d.cat)).range([0, innerH]).padding(0.25);
    const x = d3.scaleLinear().domain([0, 1]).range([0, innerW]);

    // Category labels (left)
    g.selectAll(".catlabel")
      .data(bars).enter()
      .append("text")
      .attr("class", "catlabel")
      .attr("x", -10)
      .attr("y", (d) => y(d.cat) + y.bandwidth() / 2 + 3)
      .attr("text-anchor", "end")
      .attr("font-size", "11px")
      .attr("fill", "var(--ink)")
      .text((d) => d.cat.length > 28 ? d.cat.slice(0, 26) + "…" : d.cat);

    // Background bars (rule)
    g.selectAll(".bg")
      .data(bars).enter()
      .append("rect")
      .attr("class", "bg")
      .attr("x", 0)
      .attr("y", (d) => y(d.cat))
      .attr("width", innerW)
      .attr("height", y.bandwidth())
      .attr("rx", 2)
      .attr("fill", "var(--rule)");

    // Filled bars
    g.selectAll(".acc")
      .data(bars).enter()
      .append("rect")
      .attr("class", "acc")
      .attr("x", 0)
      .attr("y", (d) => y(d.cat))
      .attr("width", 0)
      .attr("height", y.bandwidth())
      .attr("rx", 2)
      .attr("fill", (d) => d.acc >= 0.8 ? "var(--groen)" : d.acc >= 0.6 ? "var(--geel)" : "var(--rood)")
      .on("mouseenter", (ev, d) => showTip(ev,
        `<strong>${d.cat}</strong><br>${Math.round(d.acc * 100)}% · ${d.n} ophaal · ${d.items} items`))
      .on("mousemove", (ev, d) => showTip(ev,
        `<strong>${d.cat}</strong><br>${Math.round(d.acc * 100)}% · ${d.n} ophaal · ${d.items} items`))
      .on("mouseleave", hideTip)
      .transition().duration(700).delay((_d, i) => i * 40)
      .attr("width", (d) => x(d.acc));

    // Pct text (right)
    g.selectAll(".pct")
      .data(bars).enter()
      .append("text")
      .attr("x", innerW + 8)
      .attr("y", (d) => y(d.cat) + y.bandwidth() / 2 + 4)
      .attr("font-size", "11px")
      .attr("font-variant-numeric", "tabular-nums")
      .attr("fill", "var(--ink-soft)")
      .text((d) => Math.round(d.acc * 100) + "%");
  }

  function drawForgettingCurve(mount, buckets) {
    mount.innerHTML = "";
    const w = 480, h = 200, m = { top: 18, right: 16, bottom: 38, left: 32 };
    const innerW = w - m.left - m.right, innerH = h - m.top - m.bottom;
    const svg = d3.select(mount).append("svg").attr("viewBox", `0 0 ${w} ${h}`);
    const g = svg.append("g").attr("transform", `translate(${m.left},${m.top})`);

    const x = d3.scaleBand().domain(buckets.map((b) => b.iso)).range([0, innerW]).padding(0.15);
    const max = d3.max(buckets, (b) => b.count) || 1;
    const y = d3.scaleLinear().domain([0, max]).nice().range([innerH, 0]);

    g.append("g").attr("class", "grid")
      .call(d3.axisLeft(y).ticks(4).tickSize(-innerW).tickFormat(""));
    g.append("g").attr("class", "axis").attr("transform", `translate(0,${innerH})`)
      .call(d3.axisBottom(x).tickValues(buckets.filter((_, i) => i % 2 === 0).map((b) => b.iso))
        .tickFormat((iso) => {
          const d = new Date(iso);
          return d3.timeFormat("%d/%m")(d);
        }))
      .selectAll("text").attr("transform", "rotate(-30)").attr("text-anchor", "end").attr("dx", "-.6em").attr("dy", ".2em");
    g.append("g").attr("class", "axis").call(d3.axisLeft(y).ticks(4));

    g.selectAll(".duebar")
      .data(buckets).enter()
      .append("rect")
      .attr("class", "duebar")
      .attr("x", (b) => x(b.iso))
      .attr("y", innerH)
      .attr("width", x.bandwidth())
      .attr("height", 0)
      .attr("rx", 2)
      .attr("fill", (_b, i) => i === 0 ? "var(--rood)" : "var(--delft-soft)")
      .on("mouseenter", (ev, b) => showTip(ev,
        `<strong>${b.iso}</strong><br>${b.count} kaarten verwacht`))
      .on("mousemove", (ev, b) => showTip(ev,
        `<strong>${b.iso}</strong><br>${b.count} kaarten verwacht`))
      .on("mouseleave", hideTip)
      .transition().duration(700).delay((_b, i) => i * 30)
      .attr("y", (b) => y(b.count))
      .attr("height", (b) => innerH - y(b.count));
  }

  /* ====== Badges grid ====== */
  function drawBadges(mount) {
    const defs = window.Store.ACHIEVEMENT_DEFS;
    const ach = window.Store.state.achievements;
    mount.innerHTML = "";
    defs.forEach((b) => {
      const unlocked = !!ach[b.id];
      const seal = b.name[0];
      const wrap = document.createElement("div");
      wrap.className = "badge " + (unlocked ? "unlocked" : "locked");
      wrap.innerHTML = `
        <div class="seal">${seal}</div>
        <p class="b-name">${b.name} <span class="en">· ${b.en}</span></p>
        <p class="b-desc">${b.desc}<br><em>${b.enDesc}</em></p>
        ${unlocked ? `<p class="b-date">${ach[b.id].date.slice(0, 10)}</p>` : ""}
      `;
      mount.append(wrap);
    });
  }

  /* ====== Main render ====== */
  function render(mount) {
    const a = aggregate();
    const s = window.Store.state;
    const { current: lvl, next: lvlNext } = window.Store.levelFor(s.xp);
    const xpInLevel = s.xp - lvl.xp;
    const xpToNext = lvlNext ? lvlNext.xp - lvl.xp : 1;
    const lvlPct = lvlNext ? Math.min(100, (xpInLevel / xpToNext) * 100) : 100;

    const masteredPct = Math.round((a.mastered.length / a.items.length) * 100);
    const seenPct = Math.round((a.seen.length / a.items.length) * 100);

    mount.innerHTML = `
      <h2 class="view-title">Metrics <span class="accent">· je voortgang</span></h2>
      <p class="view-sub">Alle data is lokaal opgeslagen. Niets verlaat je browser.</p>

      <div class="metrics-grid">
        <div class="level-card">
          <div class="lvl-num">${lvl.level}</div>
          <div class="lvl-text">
            <h3>${lvl.name} <span style="color:var(--ink-faint);font-weight:400;font-size:.85rem">· level ${lvl.level}</span></h3>
            <p>${lvlNext ? `${xpToNext - xpInLevel} XP tot ${lvlNext.name} (lvl ${lvlNext.level})` : "Hoogste niveau bereikt."}</p>
            <div class="level-bar"><span style="width:${lvlPct}%"></span></div>
          </div>
          <div class="xp-big"><small>Totaal XP</small>${s.xp.toLocaleString("nl-NL")}</div>
        </div>

        <div class="kpi" style="--fill:${Math.min(100, (s.streak.count / 30) * 100)}%">
          <p class="kpi-label">Huidige reeks</p>
          <p class="kpi-value">${s.streak.count}<span class="unit">dag${s.streak.count === 1 ? "" : "en"}</span></p>
          <p class="kpi-sub">Beste: ${s.streak.best || s.streak.count} · laatst actief ${s.streak.lastDay || "—"}</p>
        </div>

        <div class="kpi delft" style="--fill:${seenPct}%">
          <p class="kpi-label">Gezien</p>
          <p class="kpi-value">${a.seen.length}<span class="unit">/ ${a.items.length}</span></p>
          <p class="kpi-sub">${seenPct}% van het corpus minstens één keer</p>
        </div>

        <div class="kpi groen" style="--fill:${masteredPct}%">
          <p class="kpi-label">Gemeesterd</p>
          <p class="kpi-value">${a.mastered.length}<span class="unit">in vak 5</span></p>
          <p class="kpi-sub">${masteredPct}% van het corpus</p>
        </div>

        <div class="kpi geel" style="--fill:${Math.round(a.last7Acc * 100)}%">
          <p class="kpi-label">Nauwkeurigheid (7 dagen)</p>
          <p class="kpi-value">${a.last7Total ? Math.round(a.last7Acc * 100) + "%" : "—"}</p>
          <p class="kpi-sub">${a.last7Total} ophaal in de laatste week</p>
        </div>

        <div class="kpi" style="--fill:${Math.min(100, (a.totalRetrievals / 1000) * 100)}%">
          <p class="kpi-label">Totale ophaal</p>
          <p class="kpi-value">${a.totalRetrievals.toLocaleString("nl-NL")}</p>
          <p class="kpi-sub">${Math.round(Math.min(100, (a.totalRetrievals / 1000) * 100))}% naar 1.000</p>
        </div>
      </div>

      <div class="chart-row full">
        <div class="chart-card">
          <h3>Activiteit · last 90 days</h3>
          <p class="sub">Eén vakje per dag — donker = meer ophaalbeurten. Hover voor detail.</p>
          <div id="m-heatmap"></div>
        </div>
      </div>

      <div class="chart-row">
        <div class="chart-card">
          <h3>Leitner-vakken · box distribution</h3>
          <p class="sub">Items per vak. Het doel: alles richting vak 5 schuiven.</p>
          <div id="m-leitner"></div>
        </div>
        <div class="chart-card">
          <h3>Nauwkeurigheid · 30 days accuracy</h3>
          <p class="sub">Percentage correct per dag. Lege dagen = geen sessie.</p>
          <div id="m-accuracy"></div>
        </div>
      </div>

      <div class="chart-row">
        <div class="chart-card">
          <h3>Categorie-sterkte · category strength</h3>
          <p class="sub">Top categorieën, gesorteerd op nauwkeurigheid (min. 3 ophaal).</p>
          <div id="m-categories"></div>
        </div>
        <div class="chart-card">
          <h3>Vergeetcurve · forgetting-curve preview</h3>
          <p class="sub">Aantal kaarten dat de komende 14 dagen vervalt (rood = vandaag).</p>
          <div id="m-forgetting"></div>
        </div>
      </div>

      <div class="chart-card" style="margin-top:1rem">
        <h3>Verdiensten · achievements</h3>
        <p class="sub">${Object.keys(s.achievements).length} van de ${window.Store.ACHIEVEMENT_DEFS.length} ontgrendeld.</p>
        <div class="badges" id="m-badges"></div>
      </div>
    `;

    drawHeatmap(document.getElementById("m-heatmap"), a.days);
    drawLeitnerWaterfall(document.getElementById("m-leitner"), a.boxes);
    drawAccuracyLine(document.getElementById("m-accuracy"), a.accSeries);
    drawCategoryBars(document.getElementById("m-categories"), a.catBars);
    drawForgettingCurve(document.getElementById("m-forgetting"), a.dueBuckets);
    drawBadges(document.getElementById("m-badges"));
  }

  window.Metrics = { render };
})();
