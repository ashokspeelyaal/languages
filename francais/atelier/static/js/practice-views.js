/* Practice modes: Generation (typed), Cloze, Mixed.
 *
 * All three share:
 *   - SRS picking from vocabFiltered() (active level + at-or-below).
 *   - Accent-folded match (Conjugation.check / fold).
 *   - markSeen back-sync → SRS box update + history + XP.
 *   - The same summary screen + key bindings.
 *
 * Per-mode quirks:
 *   - Generation: FR→EN / EN→FR / Mixed direction. Auto-prefix article
 *     for nouns when state.autoArticle and direction is EN→FR.
 *   - Cloze: uses each item's exampleFR/EN. Mask the target word with
 *     ___ in the FR sentence; user types the missing word. Falls back
 *     to skipping items without an example.
 *   - Mixed: randomly picks Flashcards / Generation / Cloze per item.
 *
 * No tense/conjugation logic — Conjugaison.drill (#/conjugaison) covers
 * that. These three are vocab-only.
 */
(function () {
  function escapeHtml(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));
  }

  function fold(s) {
    return (s || "")
      .toLowerCase()
      .normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/[œ]/g, "oe").replace(/[æ]/g, "ae")
      .replace(/[’']/g, "'")
      .replace(/\s+/g, " ")
      .trim();
  }

  // Strip the article from a French answer when auto_article is on and
  // we're prompting the user with "le ___ / la ___". Accepts either the
  // user typing the noun alone or with the article — generous on input.
  function stripArticle(s) {
    return (s || "").replace(/^(le|la|les|l'|un|une|des)\s+/i, "").trim();
  }

  function pickSession(size) {
    const items = window.Store.vocabFiltered();
    if (items.length === 0) return [];
    return window.SRS.pickDue(items, size || (window.Store.state.settings.sessionSize || 15));
  }

  // ---- Shared empty-state ----
  function emptyView(msg) {
    return `
      <section class="stub">
        <h2>Rien à pratiquer</h2>
        <p>${escapeHtml(msg)}</p>
        <p><a class="btn btn-primary" href="#/browse">Parcourir le vocabulaire</a>
           <a class="btn" href="#/dashboard">Tableau de bord</a></p>
      </section>
    `;
  }

  // ---- Shared summary ----
  function summary(stage, correct, total, againHash) {
    const pct = total ? Math.round((correct / total) * 100) : 0;
    stage.innerHTML = `
      <div class="fc-summary">
        <p class="big-num">${pct}%</p>
        <h3>${correct} / ${total} correctes</h3>
        <p class="muted">Les erreurs reviendront dans Flashcards demain.</p>
        <div class="hero-actions">
          <a class="btn btn-primary" href="${againHash}" onclick="setTimeout(()=>location.reload(),50)">Une autre ronde</a>
          <a class="btn" href="#/dashboard">Tableau de bord</a>
        </div>
      </div>
    `;
  }

  // =====================================================================
  //                          GENERATION (typed)
  // =====================================================================
  function renderGeneration() {
    const view = document.getElementById("view");
    const s = window.Store.state;
    const session = pickSession();
    if (session.length === 0) { view.innerHTML = emptyView("Aucune carte due à ce niveau."); return; }

    window.Store.recordSessionStart("typed");
    let i = 0, correct = 0;
    let direction = s.settings.direction || "fr-en"; // 'fr-en' | 'en-fr' | 'mixed'

    view.innerHTML = `
      <section class="prac">
        <header class="prac-head">
          <div>
            <h2 style="margin:0">Generation</h2>
            <p class="muted">Tapez la traduction. Accents tolérés ; appuyez sur Entrée pour valider.</p>
          </div>
          <div class="dir-toggle" role="radiogroup" aria-label="Direction">
            ${[["fr-en","FR → EN"],["en-fr","EN → FR"],["mixed","Mélangé"]].map(([k,l]) =>
              `<button type="button" class="dir-btn ${direction === k ? "active" : ""}" data-dir="${k}">${l}</button>`
            ).join("")}
          </div>
        </header>
        <div id="prac-stage"></div>
      </section>
    `;

    document.querySelectorAll(".dir-btn").forEach((b) => {
      b.addEventListener("click", async () => {
        direction = b.dataset.dir;
        document.querySelectorAll(".dir-btn").forEach((x) => x.classList.toggle("active", x.dataset.dir === direction));
        try { await window.Store.saveSettings({ settings: { direction } }); } catch (e) {}
        tick();
      });
    });

    function currentDir() {
      if (direction === "mixed") return i % 2 === 0 ? "fr-en" : "en-fr";
      return direction;
    }

    function tick() {
      const stage = document.getElementById("prac-stage");
      if (i >= session.length) return summary(stage, correct, session.length, "#/typed");
      const it = session[i];
      const d = currentDir();
      const promptText = d === "fr-en" ? it.french : it.english;
      const goldFull = d === "fr-en" ? it.english : it.french;
      const promptLang = d === "fr-en" ? "FR" : "EN";
      const answerLang = d === "fr-en" ? "EN" : "FR";

      // Auto-article: only EN → FR, A1/A2 student, noun with article.
      const useAutoArticle = (
        d === "en-fr" && s.autoArticle && it.pos === "noun" && it.article
        && ["A1", "A2"].includes(s.activeLevel)
      );
      const articleChip = useAutoArticle
        ? `<span class="article-chip gender-${it.gender || "x"}">${escapeHtml(it.article)}</span>`
        : "";
      const goldForInput = useAutoArticle ? stripArticle(goldFull) : goldFull;

      stage.innerHTML = `
        <article class="prac-card">
          <span class="prac-progress">${i + 1} / ${session.length}</span>
          <p class="prac-meta">
            <span class="level-tag" style="background:${(window.Store.LEVEL_META[it.level]||{}).color || "#9ca3af"}">${escapeHtml(it.level)}</span>
            · ${escapeHtml(it.category || "")}
            · <span class="dir-arrow">${promptLang} → ${answerLang}</span>
          </p>
          <p class="prac-prompt">${d === "fr-en" ? voiceRow(it.french, "small") : ""}${escapeHtml(promptText)}</p>
          <form id="prac-form" autocomplete="off">
            ${articleChip}
            <input type="text" id="prac-in" autofocus placeholder="${useAutoArticle ? "(nom seulement)" : "votre réponse"}">
            <button class="btn btn-primary" type="submit">Valider</button>
          </form>
          <div id="prac-fb" class="num-fb"></div>
        </article>
      `;
      document.querySelectorAll(".voice-btn").forEach((b) => {
        b.addEventListener("click", () => window.Speech?.speak(b.dataset.text, { voiceKey: b.dataset.voice }));
      });
      document.getElementById("prac-form").addEventListener("submit", (ev) => {
        ev.preventDefault();
        const v = document.getElementById("prac-in").value;
        // Accept either bare-noun or article-prefixed, when auto-article is on.
        let ok = fold(v) === fold(goldForInput);
        if (!ok && useAutoArticle) ok = fold(v) === fold(goldFull);
        const fb = document.getElementById("prac-fb");
        fb.innerHTML = ok
          ? `<span class="fb-good">✓ ${escapeHtml(goldFull)}</span>`
          : `<span class="fb-bad">✗ réponse : ${escapeHtml(goldFull)}</span>`;
        if (ok) correct += 1;
        window.Store.markSeen(it.id, ok ? "good" : "hard");
        setTimeout(() => { i += 1; tick(); }, ok ? 600 : 1500);
      });
    }

    function voiceRow(text, size) {
      const cls = size === "small" ? "voice-row voice-row-small" : "voice-row";
      return `<span class="${cls}">
        <button type="button" class="voice-btn" data-voice="nova" data-text="${escapeHtml(text)}">▶ Camille</button>
      </span>`;
    }

    tick();
  }

  // =====================================================================
  //                                  CLOZE
  // =====================================================================
  function renderCloze() {
    const view = document.getElementById("view");
    const s = window.Store.state;
    // Only items with a French example we can mask.
    const candidates = window.Store.vocabFiltered().filter((it) =>
      it.exampleFR && containsTarget(it.exampleFR, it.french)
    );
    if (candidates.length === 0) {
      view.innerHTML = emptyView("Aucun item avec une phrase d'exemple à ce niveau.");
      return;
    }
    const session = window.SRS.pickDue(candidates, s.settings.sessionSize || 15);
    if (session.length === 0) { view.innerHTML = emptyView("Aucune carte due."); return; }

    window.Store.recordSessionStart("cloze");
    let i = 0, correct = 0;

    view.innerHTML = `
      <section class="prac">
        <header class="prac-head">
          <div>
            <h2 style="margin:0">Cloze</h2>
            <p class="muted">Complétez la phrase. Le mot manquant est l'item du jour.</p>
          </div>
        </header>
        <div id="prac-stage"></div>
      </section>
    `;

    function tick() {
      const stage = document.getElementById("prac-stage");
      if (i >= session.length) return summary(stage, correct, session.length, "#/cloze");
      const it = session[i];
      const masked = maskWord(it.exampleFR, it.french);
      const gold = it.french;

      stage.innerHTML = `
        <article class="prac-card">
          <span class="prac-progress">${i + 1} / ${session.length}</span>
          <p class="prac-meta">
            <span class="level-tag" style="background:${(window.Store.LEVEL_META[it.level]||{}).color || "#9ca3af"}">${escapeHtml(it.level)}</span>
            · ${escapeHtml(it.category || "")}
          </p>
          <p class="prac-prompt prac-cloze">${escapeHtml(masked).replace(/_____/, '<input type="text" id="prac-in" autofocus autocomplete="off" placeholder="…">')}</p>
          <p class="prac-hint">${escapeHtml(it.english)}</p>
          <form id="prac-form" autocomplete="off" style="margin-top:6px">
            <button class="btn btn-primary" type="submit">Valider</button>
          </form>
          <div id="prac-fb" class="num-fb"></div>
        </article>
      `;
      const input = document.getElementById("prac-in");
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") { e.preventDefault(); document.getElementById("prac-form").dispatchEvent(new Event("submit", { cancelable: true })); }
      });
      document.getElementById("prac-form").addEventListener("submit", (ev) => {
        ev.preventDefault();
        const v = document.getElementById("prac-in").value;
        const ok = fold(v) === fold(gold);
        const fb = document.getElementById("prac-fb");
        fb.innerHTML = ok
          ? `<span class="fb-good">✓ ${escapeHtml(gold)}</span>`
          : `<span class="fb-bad">✗ réponse : ${escapeHtml(gold)}</span>`;
        if (ok) correct += 1;
        window.Store.markSeen(it.id, ok ? "good" : "hard");
        setTimeout(() => { i += 1; tick(); }, ok ? 600 : 1600);
      });
    }
    tick();
  }

  // Crude case-insensitive substring search that accepts the canonical
  // lemma OR its first-word substring (some examples conjugate the verb).
  function containsTarget(example, target) {
    const e = fold(example);
    const t = fold(target);
    if (!t) return false;
    if (e.includes(t)) return true;
    // For verbs we tolerate finding any morphological cousin of the stem
    // (lemma minus the last 2 chars). Keeps Cloze pool large at A1.
    if (t.length > 4) {
      const stem = t.slice(0, -2);
      if (stem.length >= 3 && e.includes(stem)) return true;
    }
    return false;
  }

  function maskWord(example, target) {
    const t = fold(target);
    // Try to find the original (case-preserved) word in the example.
    // We walk word boundaries and accent-fold each token.
    const re = /\S+/g;
    let m, out = "", lastIdx = 0;
    let replaced = false;
    while ((m = re.exec(example)) !== null) {
      const w = m[0];
      const stripped = w.replace(/^[«"\(\[]+|[.,;:!?…\)\]»"]+$/g, "");
      const fold_w = fold(stripped);
      if (!replaced && (fold_w === t || (t.length > 4 && fold_w.startsWith(t.slice(0, -2))))) {
        out += example.slice(lastIdx, m.index);
        const prefix = w.slice(0, w.indexOf(stripped));
        const suffix = w.slice(w.indexOf(stripped) + stripped.length);
        out += prefix + "_____" + suffix;
        lastIdx = m.index + w.length;
        replaced = true;
      }
    }
    out += example.slice(lastIdx);
    if (!replaced) {
      // Fallback: regex-replace the lemma in the example.
      const re2 = new RegExp(target.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      out = example.replace(re2, "_____");
    }
    return out;
  }

  // =====================================================================
  //                                  MIXED
  // =====================================================================
  function renderMixed() {
    const view = document.getElementById("view");
    const s = window.Store.state;
    const session = pickSession();
    if (session.length === 0) { view.innerHTML = emptyView("Aucune carte due à ce niveau."); return; }

    window.Store.recordSessionStart("mixed");
    let i = 0, correct = 0;

    view.innerHTML = `
      <section class="prac">
        <header class="prac-head">
          <div>
            <h2 style="margin:0">Mélangé</h2>
            <p class="muted">Flashcards, Generation, Cloze — au hasard pour chaque carte.</p>
          </div>
        </header>
        <div id="prac-stage"></div>
      </section>
    `;

    function tick() {
      const stage = document.getElementById("prac-stage");
      if (i >= session.length) return summary(stage, correct, session.length, "#/mixed");
      const it = session[i];
      const modes = ["flash", "typed", "cloze"];
      // Drop cloze for items with no usable example.
      const filtered = modes.filter((m) => m !== "cloze" || (it.exampleFR && containsTarget(it.exampleFR, it.french)));
      const mode = filtered[Math.floor(Math.random() * filtered.length)];
      renderSingle(stage, it, mode, (ok) => {
        if (ok) correct += 1;
        window.Store.markSeen(it.id, ok ? "good" : "hard");
        setTimeout(() => { i += 1; tick(); }, ok ? 700 : 1600);
      });
    }
    tick();
  }

  // Single-item renderer used by Mixed.
  function renderSingle(stage, it, mode, onDone) {
    const lvlColor = (window.Store.LEVEL_META[it.level] || {}).color || "#9ca3af";
    const metaLine = `<span class="level-tag" style="background:${lvlColor}">${escapeHtml(it.level)}</span> · ${escapeHtml(it.category || "")} · <span class="dir-arrow">${mode}</span>`;

    if (mode === "flash") {
      stage.innerHTML = `
        <article class="prac-card">
          <p class="prac-meta">${metaLine}</p>
          <p class="prac-prompt">${escapeHtml(it.french)}</p>
          <div class="voice-row"><button type="button" class="voice-btn" data-voice="nova" data-text="${escapeHtml(it.french)}">▶ Camille</button></div>
          <p class="prac-cloze-answer" id="prac-answer" style="opacity:0">${escapeHtml(it.english)}</p>
          <div class="fc-actions">
            <button class="btn" id="reveal">Retourner · Espace</button>
            <div id="rate-row" style="display:none">
              <button class="btn fc-hard" data-grade="hard">Difficile</button>
              <button class="btn fc-good" data-grade="good">Bien</button>
              <button class="btn fc-easy" data-grade="easy">Facile</button>
            </div>
          </div>
        </article>
      `;
      document.querySelectorAll(".voice-btn").forEach((b) => b.addEventListener("click", () => window.Speech?.speak(b.dataset.text, { voiceKey: b.dataset.voice })));
      function flip() {
        document.getElementById("prac-answer").style.opacity = "1";
        document.getElementById("reveal").style.display = "none";
        document.getElementById("rate-row").style.display = "inline-flex";
      }
      document.getElementById("reveal").addEventListener("click", flip);
      document.querySelectorAll("[data-grade]").forEach((b) =>
        b.addEventListener("click", () => onDone(b.dataset.grade !== "hard"))
      );
      return;
    }

    if (mode === "typed") {
      const s = window.Store.state;
      const d = s.settings.direction === "en-fr" ? "en-fr" : "fr-en";
      const promptText = d === "fr-en" ? it.french : it.english;
      const gold = d === "fr-en" ? it.english : it.french;
      stage.innerHTML = `
        <article class="prac-card">
          <p class="prac-meta">${metaLine}</p>
          <p class="prac-prompt">${escapeHtml(promptText)}</p>
          <form id="prac-form" autocomplete="off">
            <input type="text" id="prac-in" autofocus placeholder="votre réponse">
            <button class="btn btn-primary" type="submit">Valider</button>
          </form>
          <div id="prac-fb" class="num-fb"></div>
        </article>
      `;
      document.getElementById("prac-form").addEventListener("submit", (ev) => {
        ev.preventDefault();
        const v = document.getElementById("prac-in").value;
        const ok = fold(v) === fold(gold);
        const fb = document.getElementById("prac-fb");
        fb.innerHTML = ok ? `<span class="fb-good">✓ ${escapeHtml(gold)}</span>` : `<span class="fb-bad">✗ ${escapeHtml(gold)}</span>`;
        onDone(ok);
      });
      return;
    }

    if (mode === "cloze") {
      const masked = maskWord(it.exampleFR, it.french);
      const gold = it.french;
      stage.innerHTML = `
        <article class="prac-card">
          <p class="prac-meta">${metaLine}</p>
          <p class="prac-prompt prac-cloze">${escapeHtml(masked).replace(/_____/, '<input type="text" id="prac-in" autofocus autocomplete="off" placeholder="…">')}</p>
          <p class="prac-hint">${escapeHtml(it.english)}</p>
          <form id="prac-form" autocomplete="off" style="margin-top:6px">
            <button class="btn btn-primary" type="submit">Valider</button>
          </form>
          <div id="prac-fb" class="num-fb"></div>
        </article>
      `;
      const input = document.getElementById("prac-in");
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") { e.preventDefault(); document.getElementById("prac-form").dispatchEvent(new Event("submit", { cancelable: true })); }
      });
      document.getElementById("prac-form").addEventListener("submit", (ev) => {
        ev.preventDefault();
        const v = document.getElementById("prac-in").value;
        const ok = fold(v) === fold(gold);
        const fb = document.getElementById("prac-fb");
        fb.innerHTML = ok ? `<span class="fb-good">✓ ${escapeHtml(gold)}</span>` : `<span class="fb-bad">✗ ${escapeHtml(gold)}</span>`;
        onDone(ok);
      });
    }
  }

  window.PracticeView = {
    renderGeneration, renderCloze, renderMixed,
  };
})();
