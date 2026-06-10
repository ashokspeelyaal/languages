/* Conjugaison view (#/conjugaison).
 *
 * Two modes selectable via tab:
 *   Lookup — pick a verb + tense, see the full 6-person table with TTS.
 *   Drill  — cycle through persons for a chosen tense, type each form,
 *             accent-folded match.
 *
 * Tenses available depend on activeLevel — present + imperatif at A1,
 * the full set at C1 — per the §2.3 unlocking schedule.
 *
 * Data is fetched once via GET /api/conjugation/data and cached on
 * window.ConjugaisonData (keyed by user session, refreshed on level
 * change since the lemma list grows with higher levels).
 */
(function () {
  function escapeHtml(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));
  }

  let dataCache = null;

  async function getData() {
    if (dataCache) return dataCache;
    dataCache = await window.API.get("/api/conjugation/data");
    return dataCache;
  }

  // Reset cache when user changes level — the lemma list for level<=A2
  // is a subset of B1's. We re-pull on next view render.
  document.addEventListener("level-changed", () => { dataCache = null; });

  // -------- Router ------------------------------------------------------
  async function render() {
    const view = document.getElementById("view");
    view.innerHTML = `<div class="empty" style="padding:48px;text-align:center;color:#5a627a">Chargement…</div>`;
    let data;
    try {
      data = await getData();
    } catch (e) {
      view.innerHTML = `<div class="empty" style="padding:48px;color:#b3261e">Erreur : ${escapeHtml(e.message)}</div>`;
      return;
    }
    const s = window.Store.state;
    const lvlIdx = window.Store.LEVELS.indexOf(s.activeLevel);
    const allowedLevels = window.Store.LEVELS.slice(0, lvlIdx + 1);
    const lemmas = data.lemmas.filter((l) => allowedLevels.includes(l.level));

    if (lemmas.length === 0) {
      view.innerHTML = `
        <section class="stub">
          <h2>Conjugaison — pas encore de verbes</h2>
          <p>Aucun verbe disponible au niveau <strong>${s.activeLevel}</strong>.</p>
          <p><a class="btn btn-primary" href="#/browse?pos=verb">Voir les verbes</a></p>
        </section>
      `;
      return;
    }

    view.innerHTML = `
      <section class="conj">
        <header class="conj-head">
          <div>
            <h2 style="margin:0">Conjugaison</h2>
            <p class="muted">${lemmas.length} verbe${lemmas.length > 1 ? "s" : ""} disponibles au niveau ${s.activeLevel}.</p>
          </div>
          <nav class="conj-tabs">
            <button class="conj-tab active" data-mode="lookup">Tableau</button>
            <button class="conj-tab"        data-mode="drill">Drill</button>
          </nav>
        </header>
        <div id="conj-stage"></div>
      </section>
    `;
    document.querySelectorAll(".conj-tab").forEach((b) => {
      b.addEventListener("click", () => {
        document.querySelectorAll(".conj-tab").forEach((x) => x.classList.toggle("active", x === b));
        if (b.dataset.mode === "lookup") renderLookup(data, lemmas);
        else renderDrill(data, lemmas);
      });
    });
    renderLookup(data, lemmas);
  }

  // -------- Lookup mode -------------------------------------------------
  function renderLookup(data, lemmas) {
    const stage = document.getElementById("conj-stage");
    const s = window.Store.state;
    const tenses = window.Conjugation.TENSES_BY_LEVEL[s.activeLevel] || ["present"];

    // Persisted picks for the session
    if (!window.__conjPick) {
      window.__conjPick = { lemma: lemmas[0].lemma, tense: tenses[0] };
    }
    // Reset if the current pick is now out of range (level changed)
    if (!lemmas.find((l) => l.lemma === window.__conjPick.lemma)) {
      window.__conjPick.lemma = lemmas[0].lemma;
    }
    if (!tenses.includes(window.__conjPick.tense)) {
      window.__conjPick.tense = tenses[0];
    }

    stage.innerHTML = `
      <div class="conj-pickrow">
        <label>Verbe
          <select id="conj-lemma">
            ${lemmas.map((l) =>
              `<option value="${escapeHtml(l.lemma)}" ${l.lemma === window.__conjPick.lemma ? "selected" : ""}
                 data-group="${escapeHtml(l.verb_group)}" data-level="${escapeHtml(l.level)}">
                 ${escapeHtml(l.lemma)} — ${escapeHtml(l.english)}
               </option>`
            ).join("")}
          </select>
        </label>
        <label>Temps
          <select id="conj-tense">
            ${tenses.map((t) =>
              `<option value="${t}" ${t === window.__conjPick.tense ? "selected" : ""}>${window.Conjugation.TENSE_LABELS[t] || t}</option>`
            ).join("")}
          </select>
        </label>
      </div>
      <div id="conj-table-wrap"></div>
    `;

    document.getElementById("conj-lemma").addEventListener("change", (e) => {
      window.__conjPick.lemma = e.target.value;
      drawTable();
    });
    document.getElementById("conj-tense").addEventListener("change", (e) => {
      window.__conjPick.tense = e.target.value;
      drawTable();
    });
    drawTable();

    function drawTable() {
      const sel = document.getElementById("conj-lemma");
      const opt = sel.selectedOptions[0];
      const group = opt.dataset.group;
      const lemma = window.__conjPick.lemma;
      const tenseName = window.__conjPick.tense;
      const forms = window.Conjugation.tense(lemma, group, tenseName, data.irregulars);
      const wrap = document.getElementById("conj-table-wrap");
      if (!forms) {
        wrap.innerHTML = `<p class="muted">Aucune forme disponible pour ce temps.</p>`;
        return;
      }
      const isIrreg = !!(data.irregulars[lemma] && data.irregulars[lemma].tenses && data.irregulars[lemma].tenses[tenseName]);
      const ir = data.irregulars[lemma];
      const persons = window.Conjugation.PERSONS;
      // Impératif only has tu/nous/vous
      const showPersons = tenseName === "imperatif" ? ["tu", "nous", "vous"] : persons;

      wrap.innerHTML = `
        <article class="card">
          <header class="conj-meta">
            <h3 style="margin:0">${escapeHtml(lemma)} · ${escapeHtml(window.Conjugation.TENSE_LABELS[tenseName])}</h3>
            <span class="conj-flags">
              <span class="pos-tag">groupe ${escapeHtml(group)}</span>
              ${isIrreg ? `<span class="custom-tag">irrégulier</span>` : `<span class="cognate-tag">régulier</span>`}
              ${ir ? `<span class="muted" style="margin-left:8px">auxiliaire : <strong>${escapeHtml(ir.auxiliary)}</strong> · participe : <strong>${escapeHtml(ir.past_participle)}</strong></span>` : ""}
            </span>
          </header>
          <table class="conj-table">
            <tbody>
              ${showPersons.map((p) => `
                <tr>
                  <td class="conj-person">${escapeHtml(window.Conjugation.PERSON_LABELS[p])}</td>
                  <td class="conj-form">${escapeHtml(tenseName === "imperatif" ? forms[p] : window.Conjugation.elide(p, forms[p]))}</td>
                  <td class="conj-voice">
                    <button class="voice-btn" data-text="${escapeHtml(forms[p])}" title="Camille">▶</button>
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </article>
      `;
      document.querySelectorAll(".voice-btn").forEach((b) => {
        b.addEventListener("click", () => window.Speech.speak(b.dataset.text, { voiceKey: "nova" }));
      });
    }
  }

  // -------- Drill mode --------------------------------------------------
  function renderDrill(data, lemmas) {
    const stage = document.getElementById("conj-stage");
    const s = window.Store.state;
    const tenses = window.Conjugation.TENSES_BY_LEVEL[s.activeLevel] || ["present"];

    if (!window.__conjDrill) {
      window.__conjDrill = { lemma: null, tense: "present" };
    }
    if (!tenses.includes(window.__conjDrill.tense)) {
      window.__conjDrill.tense = tenses[0];
    }

    stage.innerHTML = `
      <div class="conj-pickrow">
        <label>Verbe
          <select id="drill-lemma">
            <option value="__random__">— aléatoire à chaque ronde —</option>
            ${lemmas.map((l) =>
              `<option value="${escapeHtml(l.lemma)}" data-group="${escapeHtml(l.verb_group)}">${escapeHtml(l.lemma)} — ${escapeHtml(l.english)}</option>`
            ).join("")}
          </select>
        </label>
        <label>Temps
          <select id="drill-tense">
            ${tenses.map((t) =>
              `<option value="${t}" ${t === window.__conjDrill.tense ? "selected" : ""}>${window.Conjugation.TENSE_LABELS[t] || t}</option>`
            ).join("")}
          </select>
        </label>
        <button class="btn btn-primary" id="drill-start">Commencer ▸</button>
      </div>
      <div id="drill-stage"></div>
    `;

    document.getElementById("drill-tense").addEventListener("change", (e) => {
      window.__conjDrill.tense = e.target.value;
    });
    document.getElementById("drill-start").addEventListener("click", start);

    function pickRoundLemma() {
      const sel = document.getElementById("drill-lemma");
      if (sel.value === "__random__") {
        return lemmas[Math.floor(Math.random() * lemmas.length)];
      }
      return lemmas.find((l) => l.lemma === sel.value);
    }

    function start() {
      const tenseName = window.__conjDrill.tense;
      const persons = tenseName === "imperatif" ? ["tu", "nous", "vous"] : window.Conjugation.PERSONS;
      const lemma = pickRoundLemma();
      if (!lemma) return;
      const forms = window.Conjugation.tense(lemma.lemma, lemma.verb_group, tenseName, data.irregulars);
      if (!forms) {
        document.getElementById("drill-stage").innerHTML = `<p class="muted">Pas de forme disponible.</p>`;
        return;
      }
      window.Store.recordSessionStart("conjugaison");

      let i = 0;
      let correct = 0;

      function tick() {
        const drillStage = document.getElementById("drill-stage");
        if (i >= persons.length) return summary(drillStage);
        const person = persons[i];
        const gold = forms[person];
        drillStage.innerHTML = `
          <article class="card conj-drill-card">
            <p class="muted" style="margin:0">
              ${escapeHtml(lemma.lemma)} · ${escapeHtml(window.Conjugation.TENSE_LABELS[tenseName])}
            </p>
            <p class="conj-prompt">
              <span class="conj-person-big">${escapeHtml(window.Conjugation.PERSON_LABELS[person])}</span>
              <span class="conj-ellipsis">…</span>
            </p>
            <form id="drill-form" autocomplete="off">
              <input type="text" id="drill-in" autofocus placeholder="(votre forme)">
              <button class="btn btn-primary" type="submit">Valider</button>
            </form>
            <p class="muted" style="margin-top:8px;font-size:12px">
              ${i + 1} / ${persons.length} · accents tolérés (jecris ≈ j'écris)
            </p>
            <div id="drill-fb" class="num-fb"></div>
          </article>
        `;
        document.getElementById("drill-form").addEventListener("submit", (ev) => {
          ev.preventDefault();
          const v = document.getElementById("drill-in").value;
          const ok = window.Conjugation.check(v, gold);
          const fb = document.getElementById("drill-fb");
          if (ok) {
            correct += 1;
            fb.innerHTML = `<span class="fb-good">✓ ${escapeHtml(gold)}</span>`;
          } else {
            fb.innerHTML = `<span class="fb-bad">✗ ${escapeHtml(gold)}</span>`;
          }
          setTimeout(() => { i += 1; tick(); }, ok ? 600 : 1500);
        });
      }

      function summary(stageEl) {
        const pct = Math.round((correct / persons.length) * 100);
        stageEl.innerHTML = `
          <div class="fc-summary">
            <p class="big-num">${pct}%</p>
            <h3>${correct} / ${persons.length} correctes — ${escapeHtml(lemma.lemma)}</h3>
            <p class="muted">Verbe ${lemma.verb_group === "3" ? "irrégulier" : "régulier (groupe " + lemma.verb_group + ")"}.</p>
            <div class="hero-actions">
              <button class="btn btn-primary" id="drill-again">Un autre verbe ▸</button>
              <a class="btn" href="#/conjugaison">Choisir</a>
            </div>
          </div>
        `;
        document.getElementById("drill-again").addEventListener("click", start);
      }

      tick();
    }
  }

  window.ConjugaisonView = { render };
})();
