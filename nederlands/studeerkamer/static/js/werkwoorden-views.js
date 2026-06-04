/* Werkwoorden — verb browser + drill.
 *
 * Data: static/data/verbs.json
 *   - tp="zwak":     only stem + aux stored; conjugator derives all forms via 't kofschip.
 *   - tp="zwak-vz":  same but underlying stem ends in v/z → uses -de regardless.
 *   - tp="sterk":    stem (present), impSing, impPl, vd stored; conjugator only builds person endings.
 *   - tp="onreg":    full pres array stored (7 values: ik/jij/u/hij/wij/jullie/zij).
 *
 * Scaling to thousands of verbs: just add more rows to verbs.json. The
 * conjugator handles regular ones algorithmically; you only hand-curate
 * irregular forms (~5% of Dutch verbs).
 */
(function () {
  const PERSONS = [
    { key: "ik",     label: "ik" },
    { key: "jij",    label: "jij" },
    { key: "u",      label: "u" },
    { key: "hij",    label: "hij/zij/het" },
    { key: "wij",    label: "wij" },
    { key: "jullie", label: "jullie" },
    { key: "zij",    label: "zij (mv.)" },
  ];

  let VERBS = [];        // loaded from JSON
  let docLoaded = false;

  function el(tag, props, ...children) {
    const e = document.createElement(tag);
    if (props) for (const [k, v] of Object.entries(props)) {
      if (v == null) continue;
      if (k === "class") e.className = v;
      else if (k === "style") e.setAttribute("style", v);
      else if (k.startsWith("on") && typeof v === "function") e.addEventListener(k.slice(2).toLowerCase(), v);
      else e.setAttribute(k, v);
    }
    for (const c of children) {
      if (c == null || c === false) continue;
      if (Array.isArray(c)) c.forEach((cc) => cc != null && e.append(cc));
      else if (typeof c === "string" || typeof c === "number") e.append(document.createTextNode(c));
      else e.append(c);
    }
    return e;
  }
  function esc(s) { return String(s || "").replace(/[&<>]/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;"}[c])); }

  /* ---------- Conjugator ---------- */
  const KOFSCHIP = /[tkfspchx]$/i;
  function conjugate(v) {
    if (v.tp === "onreg") {
      const pres = (v.pres || "").split(",");
      return {
        ...v,
        pres,
        imp: [v.impSing, v.impSing, v.impSing, v.impSing, v.impPl, v.impPl, v.impPl],
        vd: v.vd,
      };
    }
    if (v.tp === "sterk") {
      // Present: same as zwak (stem + uitgang). Scheidbare ww have a particle
      // in the stem like "sta op" — we split it for stem manipulation.
      const stemFull = v.stem;
      const m = stemFull.match(/^(.+?)(\s+\S+)$/);    // "sta op" → ["sta", " op"]
      const stem = m ? m[1] : stemFull;
      const tail = m ? m[2] : "";
      const stemT = /t$/.test(stem) ? stem : (stem + "t");
      const inf = v.inf.replace(/^.+?(?= )/, "").trim() ? v.inf : v.inf; // keep as-is
      const wij = v.inf;
      return {
        ...v,
        pres: [stem + tail, stemT + tail, stemT + tail, stemT + tail, wij, wij, wij],
        imp: [v.impSing, v.impSing, v.impSing, v.impSing, v.impPl, v.impPl, v.impPl],
        vd: v.vd,
      };
    }
    // zwak / zwak-vz
    const stem = v.stem;
    const stemT = /t$/.test(stem) ? stem : (stem + "t");
    const wij = v.inf;
    // 't kofschip for past/VD. For zwak-vz: underlying stem ends in v/z (not in kofschip), use -de.
    const useT = v.tp === "zwak-vz" ? false : KOFSCHIP.test(stem);
    const past = stem + (useT ? "te" : "de");
    const pastPl = past + "n";
    const noGe = !!v.noGe;
    const vd = (noGe ? "" : "ge") + stem + (useT ? "t" : "d");
    return {
      ...v,
      pres: [stem, stemT, stemT, stemT, wij, wij, wij],
      imp: [past, past, past, past, pastPl, pastPl, pastPl],
      vd,
    };
  }

  async function loadVerbs() {
    if (docLoaded) return VERBS;
    const r = await fetch("/static/data/verbs.json", { credentials: "same-origin" });
    const data = await r.json();
    VERBS = (data.verbs || []).map(conjugate);
    docLoaded = true;
    return VERBS;
  }

  /* ---------- Top-level ---------- */
  let state = { q: "", level: "all", type: "all", view: "list", activeInf: null };

  function render(mount) {
    mount.innerHTML = "";
    const wrap = el("div");
    wrap.append(
      el("h2", { class: "view-title" }, "Werkwoorden ",
        el("span", { class: "accent" }, "· vervoegen en oefenen")),
      el("p", { class: "view-sub" },
        "Doorzoek de werkwoordenlijst, bekijk de volledige vervoeging en oefen op tegenwoordige tijd, imperfectum en voltooid deelwoord."),
    );

    // Toolbar: search + filters + drill button
    const toolbar = el("div", { style: "display:flex;flex-wrap:wrap;gap:.5rem;align-items:center;margin-bottom:1rem" });
    const search = el("input", { type: "text", placeholder: "Zoek (infinitief of vertaling)…", value: state.q,
      style: "flex:1;min-width:180px;padding:.45rem .7rem;border-radius:3px;border:1px solid var(--rule);background:var(--paper-2)" });
    search.addEventListener("input", () => { state.q = search.value; paintList(); });
    const levelSel = el("select", { class: "select-input", onChange: (e) => { state.level = e.target.value; paintList(); } },
      el("option", { value: "all" }, "Alle niveaus"),
      ...["A1","A2","B1","B2","C1"].map((l) => el("option", { value: l, selected: state.level === l || undefined }, l)));
    const typeSel = el("select", { class: "select-input", onChange: (e) => { state.type = e.target.value; paintList(); } },
      el("option", { value: "all" }, "Alle types"),
      el("option", { value: "zwak" }, "zwak"),
      el("option", { value: "zwak-vz" }, "zwak (v/z)"),
      el("option", { value: "sterk" }, "sterk"),
      el("option", { value: "onreg" }, "onregelmatig"));
    const drillBtn = el("button", { onClick: () => openDrill() }, "🎯 Oefenen");
    toolbar.append(search, levelSel, typeSel, drillBtn);
    wrap.append(toolbar);

    const status = el("p", { class: "stat-note", id: "verb-status" }, "");
    const list = el("div", { id: "verb-list" });
    wrap.append(status, list);
    mount.append(wrap);

    function paintList() {
      const q = state.q.trim().toLowerCase();
      const filtered = VERBS.filter((v) => {
        if (state.level !== "all" && v.lvl !== state.level) return false;
        if (state.type !== "all" && v.tp !== state.type) return false;
        if (q && !v.inf.toLowerCase().includes(q) && !(v.tr || "").toLowerCase().includes(q)) return false;
        return true;
      });
      status.textContent = filtered.length + " werkwoord" + (filtered.length === 1 ? "" : "en");
      list.innerHTML = "";
      const grid = el("div", { style: "display:grid;grid-template-columns:repeat(auto-fill, minmax(260px, 1fr));gap:.5rem" });
      filtered.forEach((v) => {
        const card = el("div", {
          style: "background:var(--card);border:1px solid var(--rule);border-radius:4px;padding:.55rem .85rem;cursor:pointer;display:flex;flex-direction:column",
          onClick: () => openDetail(v),
        });
        card.append(
          el("div", { style: "display:flex;justify-content:space-between;align-items:baseline" },
            el("span", { style: "font-family:var(--serif);font-size:1.05rem;font-weight:600;color:var(--ink)" }, v.inf),
            el("span", { style: "font-family:var(--mono);font-size:.7rem;letter-spacing:.06em;color:var(--ink-faint)" }, v.lvl + " · " + v.tp)),
          el("div", { style: "color:var(--ink-soft);font-size:.85rem;margin-top:.1rem" }, v.tr || ""),
          el("div", { style: "margin-top:.25rem;font-family:var(--mono);font-size:.72rem;color:var(--ink-faint)" },
            "vd: " + v.vd + "  ·  aux: " + v.aux),
        );
        grid.append(card);
      });
      list.append(grid);
    }

    loadVerbs().then(() => { paintList(); }).catch((e) => {
      status.innerHTML = '<span class="ai-error">Kon werkwoordenlijst niet laden: ' + esc(e.message) + '</span>';
    });
  }

  /* ---------- Detail modal ---------- */
  function openDetail(v) {
    const ov = el("div", {
      style: "position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:9999;display:flex;align-items:center;justify-content:center;padding:1.5rem",
      onClick: (e) => { if (e.target === ov) document.body.removeChild(ov); },
    });
    const panel = el("div", {
      style: "background:var(--paper);border-radius:6px;max-width:680px;width:100%;max-height:90vh;overflow:auto;padding:1.4rem 1.6rem",
    });
    ov.append(panel);
    document.body.append(ov);

    panel.append(
      el("div", { style: "display:flex;justify-content:space-between;align-items:baseline" },
        el("h3", { style: "margin:0;font-family:var(--serif);font-weight:600;font-size:1.6rem" }, v.inf),
        el("button", { class: "subtle", onClick: () => document.body.removeChild(ov) }, "sluiten ✕")),
      el("p", { class: "stat-note", style: "margin:.2rem 0 1rem" },
        v.tr + " · " + v.lvl + " · " + v.tp + " · hulpwerkwoord: " + v.aux + (v.scheidbaar ? " · scheidbaar" : "")),
    );

    // Volledige vervoegingstabel
    const table = el("table", { style: "width:100%;border-collapse:collapse;font-size:.92rem" });
    table.append(el("thead", null,
      el("tr", null,
        el("th", { style: "text-align:left;padding:.35rem .6rem;background:var(--paper-2);border-bottom:1px solid var(--rule)" }, "Persoon"),
        el("th", { style: "text-align:left;padding:.35rem .6rem;background:var(--paper-2);border-bottom:1px solid var(--rule)" }, "Tegenwoordige tijd"),
        el("th", { style: "text-align:left;padding:.35rem .6rem;background:var(--paper-2);border-bottom:1px solid var(--rule)" }, "Imperfectum"))));
    const tbody = el("tbody");
    PERSONS.forEach((p, i) => {
      tbody.append(el("tr", null,
        el("td", { style: "padding:.3rem .6rem;border-bottom:1px solid var(--rule);font-family:var(--mono);font-size:.85rem;color:var(--ink-faint)" }, p.label),
        el("td", { style: "padding:.3rem .6rem;border-bottom:1px solid var(--rule);font-family:var(--serif)" }, v.pres[i] || "—"),
        el("td", { style: "padding:.3rem .6rem;border-bottom:1px solid var(--rule);font-family:var(--serif)" }, v.imp[i] || "—")));
    });
    table.append(tbody);
    panel.append(table);

    // Perfectum / hulpwerkwoord
    panel.append(
      el("div", { style: "margin-top:1rem;background:var(--paper-2);border-left:3px solid var(--rood);padding:.6rem .9rem;font-family:var(--serif)" },
        el("strong", null, "Perfectum: "),
        v.aux.split("/")[0] + " + " + v.vd,
        v.aux.includes("/") ? el("span", { style: "color:var(--ink-faint);font-size:.85rem;margin-left:.5rem" }, "(of " + v.aux.split("/")[1] + " bij beweging)") : null),
      el("div", { style: "margin-top:.6rem;font-family:var(--mono);font-size:.78rem;color:var(--ink-faint);letter-spacing:.04em" },
        "Voltooid deelwoord: ", el("strong", { style: "color:var(--ink)" }, v.vd)),
    );

    // Voorbeeldzinnen vanuit AI (lazy on-demand)
    const exHost = el("div", { style: "margin-top:1.2rem" });
    const exBtn = el("button", { class: "subtle", style: "font-size:.85rem",
      onClick: async () => {
        exBtn.disabled = true;
        exBtn.textContent = "AI bedenkt voorbeeldzinnen…";
        try {
          const r = await window.AI.complete({
            kind: "verb-examples",
            system: "Je geeft 3 korte voorbeeldzinnen voor het werkwoord '" + v.inf + "' (vertaling: " + v.tr + "). Eén in tegenwoordige tijd, één in imperfectum, één in perfectum. Antwoord ALLEEN met geldige JSON: {\"voorbeelden\": [{\"tijd\": \"tt|imp|perf\", \"zin\": \"...\"}]}. Houd zinnen kort (max 10 woorden).",
            user: v.inf,
            maxTokens: 400,
            json: true,
            reasoning: "low",
          });
          const obj = JSON.parse(r.text);
          exHost.innerHTML = "";
          (obj.voorbeelden || []).forEach((e2) => {
            exHost.append(el("div", { style: "padding:.4rem .7rem;background:var(--paper-2);border-left:3px solid var(--ink-faint);margin-bottom:.3rem;font-family:var(--serif)" },
              el("span", { style: "font-family:var(--mono);font-size:.7rem;color:var(--ink-faint);margin-right:.5rem;letter-spacing:.06em" }, (e2.tijd || "").toUpperCase()),
              e2.zin || ""));
          });
        } catch (e) {
          exHost.innerHTML = '<p class="ai-error">' + esc(e.message) + '</p>';
        }
      },
    }, "✦ AI voorbeeldzinnen");
    exHost.append(exBtn);
    panel.append(exHost);
  }

  /* ---------- Drill mode ---------- */
  function openDrill() {
    if (!VERBS.length) { alert("Werkwoorden nog niet geladen."); return; }
    const ov = el("div", {
      style: "position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:9999;display:flex;align-items:center;justify-content:center;padding:1.5rem",
      onClick: (e) => { if (e.target === ov) document.body.removeChild(ov); },
    });
    const panel = el("div", {
      style: "background:var(--paper);border-radius:6px;max-width:560px;width:100%;max-height:90vh;overflow:auto;padding:1.4rem 1.6rem",
    });
    ov.append(panel);
    document.body.append(ov);

    panel.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:.6rem">
        <h3 style="margin:0;font-family:var(--serif);font-weight:600">Oefenen · werkwoordvormen</h3>
        <button class="subtle" id="drill-close" style="font-size:.85rem">sluiten ✕</button>
      </div>
      <div id="drill-body"></div>
    `;
    panel.querySelector("#drill-close").addEventListener("click", () => document.body.removeChild(ov));

    const body = panel.querySelector("#drill-body");
    const pool = filterPool();
    if (pool.length < 5) {
      body.innerHTML = '<p class="ai-error">Niet genoeg werkwoorden in de huidige filter. Zet "Alle niveaus" en "Alle types" aan.</p>';
      return;
    }
    runDrill(body, pool);
  }

  function filterPool() {
    return VERBS.filter((v) => {
      if (state.level !== "all" && v.lvl !== state.level) return false;
      if (state.type !== "all" && v.tp !== state.type) return false;
      return true;
    });
  }

  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  function makeQuestion(pool) {
    const v = pick(pool);
    const types = ["form", "vd", "type", "identify"];
    const t = pick(types);
    if (t === "form") {
      const tenseIdx = Math.random() < 0.5 ? "pres" : "imp";
      const personIdx = Math.floor(Math.random() * PERSONS.length);
      const answer = v[tenseIdx][personIdx];
      if (!answer || answer === "—") return makeQuestion(pool);
      return {
        type: "fill",
        prompt: `Vorm: ${v.inf} (${v.tr})  ·  ${PERSONS[personIdx].label}, ${tenseIdx === "pres" ? "tegenwoordige tijd" : "imperfectum"}`,
        answer,
        explain: "Stam: " + v.stem + (v.tp.startsWith("zwak") ? " (zwak, " + (KOFSCHIP.test(v.stem) && v.tp !== "zwak-vz" ? "kofschip → -te" : "→ -de") + ")" : (v.tp === "sterk" ? " (sterk)" : " (onregelmatig)")),
      };
    }
    if (t === "vd") {
      return {
        type: "fill",
        prompt: `Voltooid deelwoord van: ${v.inf}  (${v.tr})`,
        answer: v.vd,
        explain: v.tp === "zwak" || v.tp === "zwak-vz"
          ? `Zwak werkwoord. Stam=${v.stem}, ${KOFSCHIP.test(v.stem) && v.tp !== "zwak-vz" ? "stem eindigt op kofschip-letter → -t" : "→ -d"}.`
          : v.tp === "sterk" ? "Sterk werkwoord: leer de vorm uit het hoofd." : "Onregelmatig werkwoord.",
      };
    }
    if (t === "type") {
      return {
        type: "mc",
        prompt: `Wat voor type werkwoord is "${v.inf}"?`,
        options: ["zwak", "sterk", "onregelmatig"],
        answer: v.tp === "zwak-vz" ? "zwak" : (v.tp === "onreg" ? "onregelmatig" : v.tp),
        explain: "Werkwoord: " + v.inf + " · vd: " + v.vd + " · imperf: " + v.imp[0] + " / " + v.imp[4],
      };
    }
    // identify: given a form, name infinitive + tense
    const tenseIdx2 = Math.random() < 0.5 ? "pres" : "imp";
    const personIdx2 = Math.floor(Math.random() * PERSONS.length);
    const form = v[tenseIdx2][personIdx2];
    if (!form || form === "—") return makeQuestion(pool);
    return {
      type: "fill",
      prompt: `Welke infinitief hoort bij "${form}" ?`,
      answer: v.inf,
      explain: `${form} = ${v.inf}, ${PERSONS[personIdx2].label}, ${tenseIdx2 === "pres" ? "tegenwoordige tijd" : "imperfectum"}.`,
    };
  }

  function runDrill(host, pool) {
    const QUESTIONS = 10;
    let idx = 0, right = 0;
    const items = Array.from({ length: QUESTIONS }, () => makeQuestion(pool));

    function paint() {
      if (idx >= QUESTIONS) return finish();
      const item = items[idx];
      host.innerHTML = "";
      host.append(
        el("p", { style: "font-family:var(--mono);font-size:.72rem;color:var(--ink-faint);letter-spacing:.06em;margin:0 0 .3rem" },
          "VRAAG " + (idx + 1) + " van " + QUESTIONS),
        el("p", { style: "font-family:var(--serif);font-size:1.05rem;margin:0 0 .8rem" }, item.prompt),
      );
      if (item.type === "fill") {
        const inp = el("input", { type: "text",
          style: "padding:.45rem .65rem;border-radius:3px;border:1px solid var(--rule);background:var(--paper-2);font-family:var(--serif);font-size:1rem;min-width:200px" });
        host.append(inp);
        const submit = el("button", { style: "margin-left:.5rem", onClick: () => check(inp.value, item) }, "Controleer");
        host.append(submit, el("div", { id: "drill-fb", style: "margin-top:.7rem" }));
        inp.addEventListener("keydown", (e) => { if (e.key === "Enter") submit.click(); });
        setTimeout(() => inp.focus(), 30);
      } else {
        const opts = el("div", { style: "display:flex;flex-direction:column;gap:.3rem;margin:.4rem 0" });
        (item.options || []).forEach((o) => {
          opts.append(el("button", { class: "subtle", style: "text-align:left;padding:.45rem .8rem;font-family:var(--serif)", onClick: () => check(o, item) }, o));
        });
        host.append(opts, el("div", { id: "drill-fb", style: "margin-top:.7rem" }));
      }
    }

    function check(answer, item) {
      const norm = (s) => String(s || "").toLowerCase().trim().replace(/[.,;:!?'"]/g, "");
      const ok = norm(answer) === norm(item.answer);
      if (ok) right += 1;
      const fb = host.querySelector("#drill-fb");
      fb.innerHTML = `
        <div style="padding:.5rem .75rem;border-radius:3px;background:${ok ? "rgba(0,128,0,.08)" : "rgba(176,0,32,.08)"};border-left:3px solid ${ok ? "var(--groen)" : "var(--rood)"}">
          <strong style="color:${ok ? "var(--groen)" : "var(--rood)"}">${ok ? "✓ Goed!" : "✗ Niet correct"}</strong>
          ${ok ? "" : `<div><strong>Antwoord:</strong> ${esc(item.answer)}</div>`}
          <div style="margin-top:.25rem;font-size:.86rem;color:var(--ink-soft)">${esc(item.explain || "")}</div>
        </div>
      `;
      host.querySelectorAll("button").forEach((b) => { if (!b.matches("[data-next]")) b.disabled = true; });
      host.querySelectorAll("input").forEach((i) => { i.disabled = true; });
      const next = el("button", { "data-next": "1", style: "margin-top:.6rem", onClick: () => { idx += 1; paint(); } },
        idx + 1 >= QUESTIONS ? "Resultaat" : "Volgende →");
      host.append(next);
      setTimeout(() => next.focus(), 30);
    }

    function finish() {
      const pct = Math.round((right / QUESTIONS) * 100);
      const c = pct >= 80 ? "var(--groen)" : pct >= 60 ? "var(--geel)" : "var(--rood)";
      host.innerHTML = "";
      host.append(
        el("h3", { style: "margin:0 0 .5rem;font-family:var(--serif);font-weight:600" }, "Klaar!"),
        el("p", { style: "font-family:var(--serif);font-size:2rem;font-weight:600;color:" + c + ";margin:.1rem 0" },
          right + " / " + QUESTIONS + "  (" + pct + "%)"),
        el("div", { style: "margin-top:.7rem;display:flex;gap:.5rem;flex-wrap:wrap" },
          el("button", { onClick: () => runDrill(host, pool) }, "Nieuwe ronde"),
          el("button", { class: "subtle", onClick: () => {
            const ov = host.closest("[style*='position:fixed']");
            if (ov && ov.parentNode) ov.parentNode.removeChild(ov);
          } }, "Sluiten"),
        ));
    }

    paint();
  }

  window.WerkwoordenViews = { render };
})();
