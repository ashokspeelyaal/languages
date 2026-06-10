/* Numbers / time / date trainer (#/nombres).
 *
 * Three sub-drills, each a quick 10-round mini-session:
 *   1. Number → French word ("47" → "quarante-sept")
 *   2. Analog clock → French time phrase ("14:30" → "deux heures et demie")
 *   3. Today's date → spoken form ("le 15 mai 2026")
 *
 * Lenient match (accent-folded, lowercased, whitespace-tolerant). The
 * goal is recognition, not orthography drilling — the gender drill and
 * flashcards handle precision.
 */
(function () {
  function escapeHtml(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));
  }

  // -------- French number-to-word generator (0..1000) --------
  const UNITS = ["zéro","un","deux","trois","quatre","cinq","six","sept","huit","neuf"];
  const TEENS = ["dix","onze","douze","treize","quatorze","quinze","seize","dix-sept","dix-huit","dix-neuf"];
  const TENS = [null, null, "vingt","trente","quarante","cinquante","soixante", null, "quatre-vingt", null];

  function numberToFr(n) {
    if (n < 0 || n > 1000) return String(n);
    if (n === 0) return "zéro";
    if (n === 1000) return "mille";
    if (n === 100) return "cent";
    if (n < 10) return UNITS[n];
    if (n < 20) return TEENS[n - 10];
    if (n < 70) {
      const t = Math.floor(n / 10);
      const u = n % 10;
      if (u === 0) return TENS[t];
      if (u === 1) return TENS[t] + " et un";
      return TENS[t] + "-" + UNITS[u];
    }
    if (n < 80) {
      // 70..79 = soixante + 10..19
      const u = n - 60;
      if (u === 11) return "soixante et onze";
      return "soixante-" + TEENS[u - 10];
    }
    if (n < 100) {
      // 80..99 = quatre-vingt + 0..19   (no "et" before 81)
      const u = n - 80;
      if (u === 0) return "quatre-vingts";
      if (u < 10) return "quatre-vingt-" + UNITS[u];
      return "quatre-vingt-" + TEENS[u - 10];
    }
    if (n < 1000) {
      const h = Math.floor(n / 100);
      const rest = n % 100;
      const hPart = h === 1 ? "cent" : UNITS[h] + " cent" + (rest === 0 ? "s" : "");
      if (rest === 0) return hPart;
      return hPart + " " + numberToFr(rest);
    }
    return String(n);
  }

  function foldFr(s) {
    return (s || "")
      .toLowerCase()
      .normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/[œ]/g, "oe").replace(/[æ]/g, "ae")
      .replace(/[’']/g, "'")
      .replace(/\s+/g, " ")
      .replace(/[-‐‒–—]/g, " ")
      .trim();
  }

  // -------- Time-of-day to French phrase --------
  function timeToFr(h, m) {
    // 12-hour-ish French. 24h → adjust: 13h = "treize heures" formal, but
    // for A1 we use 12-hour with "de l'après-midi" etc. Simpler: use
    // 24h formal style which is taught from day one.
    const hWord = h === 0 ? "minuit"
                : h === 12 ? "midi"
                : numberToFr(h) + " heure" + (h > 1 ? "s" : "");
    if (m === 0) return hWord;
    if (m === 15) return hWord + " et quart";
    if (m === 30) return hWord + " et demie";
    if (m === 45) return numberToFr((h % 12) + 1 || 12) + " heure" + (((h % 12) + 1) > 1 ? "s" : "") + " moins le quart";
    return hWord + " " + numberToFr(m);
  }

  // -------- Today's date in French --------
  const MONTHS = ["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"];
  function dateInFr(d) {
    const day = d.getDate();
    const dayWord = day === 1 ? "premier" : numberToFr(day);
    return "le " + dayWord + " " + MONTHS[d.getMonth()] + " " + numberToFr(Math.floor(d.getFullYear() / 1000) * 1000)
            .replace(/^mille$/, "mille") + " " + numberToFr(d.getFullYear() % 1000).replace(/^cent$/, "cent");
  }
  // The above is messy for years > 1000. Use a simpler whole-year form:
  function yearToFr(y) {
    // 2026 → "deux mille vingt-six"; 1999 → "mille neuf cent quatre-vingt-dix-neuf"
    if (y >= 2000 && y < 3000) {
      const rest = y - 2000;
      if (rest === 0) return "deux mille";
      return "deux mille " + numberToFr(rest);
    }
    if (y >= 1000 && y < 2000) {
      const rest = y - 1000;
      if (rest === 0) return "mille";
      // 1XXX usually spoken as "mille X cent Y" rather than computed —
      // but for the drill, "mille " + numberToFr(rest) is acceptable.
      return "mille " + numberToFr(rest);
    }
    return String(y);
  }
  function dateInFrV2(d) {
    const day = d.getDate();
    const dayWord = day === 1 ? "premier" : numberToFr(day);
    return "le " + dayWord + " " + MONTHS[d.getMonth()] + " " + yearToFr(d.getFullYear());
  }

  // ----------------------------------------------------------- ROUTER
  function render() {
    const view = document.getElementById("view");
    view.innerHTML = `
      <section class="numbers">
        <header style="margin-bottom:16px">
          <h2 style="margin:0">Nombres, heure, date</h2>
          <p class="muted">Trois mini-drills A1.</p>
        </header>
        <nav class="num-tabs">
          <button class="num-tab" data-tab="digit">Nombre → mot</button>
          <button class="num-tab" data-tab="time">Quelle heure ?</button>
          <button class="num-tab" data-tab="date">Date d'aujourd'hui</button>
        </nav>
        <div id="num-stage"></div>
      </section>
    `;
    document.querySelectorAll(".num-tab").forEach((b) => {
      b.addEventListener("click", () => switchTab(b.dataset.tab));
    });
    switchTab("digit");
  }

  function switchTab(tab) {
    document.querySelectorAll(".num-tab").forEach((b) => b.classList.toggle("active", b.dataset.tab === tab));
    const stage = document.getElementById("num-stage");
    stage.innerHTML = "";
    if (tab === "digit") return drillDigits(stage);
    if (tab === "time") return drillTime(stage);
    if (tab === "date") return drillDate(stage);
  }

  // ----------------------------------------------------------- digit drill
  function drillDigits(stage) {
    const rounds = 10;
    let i = 0, correct = 0;
    window.Store.recordSessionStart("nombres-digit");

    const session = Array.from({ length: rounds }, () => {
      // Mix of ranges: 0..20 (45%), 20..69 (35%), 70..100 (20%)
      const r = Math.random();
      if (r < 0.45) return Math.floor(Math.random() * 21);
      if (r < 0.8)  return 20 + Math.floor(Math.random() * 50);
      return 70 + Math.floor(Math.random() * 31);
    });

    function tick() {
      if (i >= rounds) return summary(correct, rounds);
      const n = session[i];
      const gold = numberToFr(n);
      stage.innerHTML = `
        <div class="num-card">
          <span class="num-prog">${i + 1} / ${rounds}</span>
          <p class="num-prompt">Écrivez en lettres :</p>
          <p class="num-big">${n}</p>
          <form id="num-form" autocomplete="off">
            <input type="text" id="num-in" placeholder="ex. : vingt-trois" autofocus>
            <button class="btn btn-primary" type="submit">Valider</button>
          </form>
          <div id="num-fb" class="num-fb"></div>
        </div>
      `;
      document.getElementById("num-form").addEventListener("submit", (ev) => {
        ev.preventDefault();
        const v = document.getElementById("num-in").value;
        const ok = foldFr(v) === foldFr(gold);
        const fb = document.getElementById("num-fb");
        if (ok) {
          correct += 1;
          fb.innerHTML = `<span class="fb-good">✓ ${escapeHtml(gold)}</span>`;
        } else {
          fb.innerHTML = `<span class="fb-bad">✗ ${escapeHtml(gold)}</span>`;
        }
        setTimeout(() => { i += 1; tick(); }, ok ? 600 : 1400);
      });
    }
    tick();
  }

  // ----------------------------------------------------------- time drill
  function drillTime(stage) {
    const rounds = 10;
    let i = 0, correct = 0;
    window.Store.recordSessionStart("nombres-time");

    const session = Array.from({ length: rounds }, () => {
      // Mix easy quarters and arbitrary minutes
      const h = Math.floor(Math.random() * 12) + 1;
      const choices = [0, 15, 30, 45, 5, 10, 20, 25, 35, 40];
      const m = choices[Math.floor(Math.random() * choices.length)];
      return { h, m };
    });

    function tick() {
      if (i >= rounds) return summary(correct, rounds);
      const t = session[i];
      const gold = timeToFr(t.h, t.m);
      const clock = clockSvg(t.h, t.m);
      stage.innerHTML = `
        <div class="num-card">
          <span class="num-prog">${i + 1} / ${rounds}</span>
          <div class="num-clock-wrap">${clock}</div>
          <form id="num-form" autocomplete="off">
            <input type="text" id="num-in" placeholder="ex. : trois heures et quart" autofocus>
            <button class="btn btn-primary" type="submit">Valider</button>
          </form>
          <div id="num-fb" class="num-fb"></div>
        </div>
      `;
      document.getElementById("num-form").addEventListener("submit", (ev) => {
        ev.preventDefault();
        const v = document.getElementById("num-in").value;
        const ok = foldFr(v) === foldFr(gold);
        const fb = document.getElementById("num-fb");
        if (ok) {
          correct += 1;
          fb.innerHTML = `<span class="fb-good">✓ ${escapeHtml(gold)}</span>`;
        } else {
          fb.innerHTML = `<span class="fb-bad">✗ ${escapeHtml(gold)}</span>`;
        }
        setTimeout(() => { i += 1; tick(); }, ok ? 700 : 1700);
      });
    }
    tick();
  }

  function clockSvg(h, m) {
    const cx = 70, cy = 70, r = 60;
    const hAngle = ((h % 12) + m / 60) * 30 - 90;
    const mAngle = m * 6 - 90;
    const hxe = cx + Math.cos(hAngle * Math.PI / 180) * (r * 0.5);
    const hye = cy + Math.sin(hAngle * Math.PI / 180) * (r * 0.5);
    const mxe = cx + Math.cos(mAngle * Math.PI / 180) * (r * 0.8);
    const mye = cy + Math.sin(mAngle * Math.PI / 180) * (r * 0.8);
    const ticks = Array.from({ length: 12 }, (_, k) => {
      const a = k * 30 - 90;
      const x1 = cx + Math.cos(a * Math.PI / 180) * (r - 6);
      const y1 = cy + Math.sin(a * Math.PI / 180) * (r - 6);
      const x2 = cx + Math.cos(a * Math.PI / 180) * r;
      const y2 = cy + Math.sin(a * Math.PI / 180) * r;
      return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#94a3b8" stroke-width="1.5"/>`;
    }).join("");
    return `<svg viewBox="0 0 140 140" width="160" height="160" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="#fff" stroke="#1d4ed8" stroke-width="2"/>
      ${ticks}
      <line x1="${cx}" y1="${cy}" x2="${hxe}" y2="${hye}" stroke="#1d4ed8" stroke-width="4" stroke-linecap="round"/>
      <line x1="${cx}" y1="${cy}" x2="${mxe}" y2="${mye}" stroke="#1d4ed8" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="${cx}" cy="${cy}" r="3" fill="#1d4ed8"/>
    </svg>`;
  }

  // ----------------------------------------------------------- date drill
  function drillDate(stage) {
    window.Store.recordSessionStart("nombres-date");
    const today = new Date();
    const goldOptions = [dateInFrV2(today)];
    // For known dates the user may write "le 1er janvier" vs "le premier janvier" — accept both
    if (today.getDate() === 1) {
      goldOptions.push(dateInFrV2(today).replace("premier", "1er"));
    }
    stage.innerHTML = `
      <div class="num-card">
        <p class="num-prompt">Écrivez la date d'aujourd'hui en toutes lettres :</p>
        <p class="num-big">${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}</p>
        <form id="num-form" autocomplete="off">
          <input type="text" id="num-in" placeholder="ex. : le quinze mai deux mille vingt-six" autofocus style="width:100%;max-width:480px">
          <button class="btn btn-primary" type="submit">Valider</button>
        </form>
        <div id="num-fb" class="num-fb"></div>
        <p class="muted" style="margin-top:14px">
          Format attendu : <em>le [jour] [mois] [année]</em>. Pour le 1<sup>er</sup> jour, on dit <em>premier</em>.
        </p>
      </div>
    `;
    document.getElementById("num-form").addEventListener("submit", (ev) => {
      ev.preventDefault();
      const v = document.getElementById("num-in").value;
      const folded = foldFr(v);
      const ok = goldOptions.some((g) => foldFr(g) === folded);
      const fb = document.getElementById("num-fb");
      if (ok) {
        fb.innerHTML = `<span class="fb-good">✓ Parfait !</span>`;
      } else {
        fb.innerHTML = `<span class="fb-bad">✗ Réponse attendue : ${escapeHtml(goldOptions[0])}</span>`;
      }
    });
  }

  // ----------------------------------------------------------- summary
  function summary(correct, total) {
    const stage = document.getElementById("num-stage");
    const pct = Math.round((correct / total) * 100);
    stage.innerHTML = `
      <div class="fc-summary">
        <p class="big-num">${pct}%</p>
        <h3>${correct} / ${total} correctes.</h3>
        <div class="hero-actions">
          <button class="btn btn-primary" onclick="window.NumbersView.render()">Encore</button>
          <a class="btn" href="#/dashboard">Tableau de bord</a>
        </div>
      </div>
    `;
  }

  window.NumbersView = { render, numberToFr, timeToFr, dateInFrV2, foldFr };
})();
