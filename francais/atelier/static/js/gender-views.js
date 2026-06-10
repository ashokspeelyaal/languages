/* Genre drill (#/genre) — le or la?
 *
 * A1 mini-mode that drills the single bit of information per noun. Pulls
 * gendered nouns from the active-level vocab slice, asks le/la (or l'/les
 * for vowel-initial/plural), color-codes the answer.
 *
 * Scoring back-syncs to SRS:
 *   correct → POST /api/srs/review {outcome:'good'}  (box bump)
 *   wrong   → POST /api/srs/review {outcome:'hard'}  (back to box 1)
 *
 * So getting genders wrong in this drill puts those nouns at the front
 * of tomorrow's flashcard queue. That's the intended feedback loop:
 * shaky genders surface in regular review, not just in this view.
 */
(function () {
  const ROUND_SIZE = 20;
  function escapeHtml(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));
  }

  function articleFor(noun) {
    // Returns the gold article for a noun based on its declared article
    // (preferred) or, failing that, on the gender. The drill displays
    // the noun WITHOUT article; the user picks the correct one.
    if (noun.article) return noun.article;
    if (noun.gender === "m") return "le";
    if (noun.gender === "f") return "la";
    return null;
  }

  function gendered(items) {
    return items.filter((it) =>
      it.pos === "noun" && (it.gender === "m" || it.gender === "f") && articleFor(it)
    );
  }

  function pickRound(items, prevSrsState) {
    // Prefer items the user has gotten wrong before, then unseen, then
    // everything else. Stable across renders within a session — we
    // shuffle once and the order persists.
    const scored = items.map((it) => {
      const p = prevSrsState[it.id] || { box: 1, wrong: 0, seen: 0 };
      const score = (p.wrong * 3) - p.box + (p.seen === 0 ? 1 : 0);
      return { it, score };
    });
    scored.sort((a, b) => b.score - a.score);
    // Take top 50 candidates then shuffle for variety
    const pool = scored.slice(0, Math.max(ROUND_SIZE * 3, 50)).map((x) => x.it);
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, ROUND_SIZE);
  }

  function render() {
    const s = window.Store.state;
    const view = document.getElementById("view");
    const nouns = gendered(window.Store.vocabFiltered());

    if (nouns.length === 0) {
      view.innerHTML = `
        <section class="stub">
          <h2>Genre — pas encore de noms à exercer</h2>
          <p>Aucun nom genré n'est disponible au niveau <strong>${s.activeLevel}</strong>.</p>
          <p>Essayez un autre niveau (pastilles en haut).</p>
          <p><a class="btn btn-primary" href="#/browse?pos=noun&strict=1">Parcourir les noms</a></p>
        </section>
      `;
      return;
    }

    const session = pickRound(nouns, s.items);
    let i = 0;
    let correct = 0;
    let wrong = 0;
    let locked = false;  // true while the result animation plays

    window.Store.recordSessionStart("genre");

    view.innerHTML = `
      <section class="genre">
        <header class="genre-head">
          <div>
            <h2 style="margin:0">Genre — le ou la ?</h2>
            <p class="muted">Identifiez l'article. ${ROUND_SIZE} questions par tour. Les erreurs reviendront en flashcards.</p>
          </div>
          <div class="genre-score">
            <span class="gs-num"><span id="gs-correct">0</span>/<span id="gs-total">0</span></span>
            <span class="gs-sub">bonnes réponses</span>
          </div>
        </header>
        <div id="genre-stage"></div>
      </section>
    `;

    function rerender() {
      const stage = document.getElementById("genre-stage");
      if (i >= session.length) {
        return finish(stage);
      }
      const noun = session[i];
      const correctArt = articleFor(noun);
      const options = ["le", "la", "l'", "les"];
      // For 'mf'-gender items (rare) or items where article is "l'" or "les",
      // make sure the gold answer is in the options.
      if (!options.includes(correctArt)) options.push(correctArt);

      stage.innerHTML = `
        <div class="genre-card">
          <span class="genre-progress">${i + 1} / ${session.length}</span>
          ${noun.emoji ? `<div class="genre-emoji">${noun.emoji}</div>` : ""}
          <p class="genre-noun">__ ${escapeHtml(noun.french)}</p>
          <p class="genre-hint muted">${escapeHtml(noun.english)}</p>
          <div class="genre-opts">
            ${options.map((opt) => `<button type="button" class="genre-opt" data-art="${escapeHtml(opt)}">${escapeHtml(opt)}</button>`).join("")}
          </div>
          <div id="genre-feedback" class="genre-feedback"></div>
        </div>
      `;

      document.querySelectorAll(".genre-opt").forEach((btn) => {
        btn.addEventListener("click", () => answer(btn.dataset.art, btn));
      });
    }

    function answer(picked, btn) {
      if (locked) return;
      locked = true;
      const noun = session[i];
      const gold = articleFor(noun);
      const isRight = picked === gold;

      // Color all options.
      document.querySelectorAll(".genre-opt").forEach((b) => {
        if (b.dataset.art === gold) b.classList.add("genre-opt-correct");
        else if (b === btn) b.classList.add("genre-opt-wrong");
        b.disabled = true;
      });

      const fb = document.getElementById("genre-feedback");
      fb.innerHTML = isRight
        ? `<span class="fb-good">✓ ${escapeHtml(gold)} ${escapeHtml(noun.french)} (${noun.gender === "m" ? "masculin" : "féminin"})</span>`
        : `<span class="fb-bad">✗ correct : ${escapeHtml(gold)} ${escapeHtml(noun.french)} (${noun.gender === "m" ? "masculin" : "féminin"})</span>`;

      if (isRight) {
        correct += 1;
        window.Store.markSeen(noun.id, "good");
      } else {
        wrong += 1;
        window.Store.markSeen(noun.id, "hard");
      }
      document.getElementById("gs-correct").textContent = correct;
      document.getElementById("gs-total").textContent = i + 1;

      // Advance after a short delay so the feedback lands.
      setTimeout(() => {
        i += 1;
        locked = false;
        rerender();
      }, isRight ? 700 : 1500);
    }

    function finish(stage) {
      const pct = Math.round((correct / session.length) * 100);
      stage.innerHTML = `
        <div class="fc-summary">
          <p class="big-num">${pct}%</p>
          <h3>${correct} / ${session.length} correctes.</h3>
          <p>Les ${wrong} erreurs reviendront en flashcards demain.</p>
          <div class="hero-actions">
            <a class="btn btn-primary" href="#/genre" onclick="setTimeout(()=>location.reload(),50)">Encore un tour</a>
            <a class="btn" href="#/dashboard">Tableau de bord</a>
          </div>
        </div>
      `;
    }

    // Keyboard: 1=le, 2=la, 3=l', 4=les
    const KEYS = { "1": "le", "2": "la", "3": "l'", "4": "les" };
    const onKey = (e) => {
      if (e.target.matches && e.target.matches("input, textarea")) return;
      const art = KEYS[e.key];
      if (!art) return;
      const btn = document.querySelector(`.genre-opt[data-art="${art}"]`);
      if (btn) btn.click();
    };
    document.addEventListener("keydown", onKey);
    if (window.__atelierGenderKey) document.removeEventListener("keydown", window.__atelierGenderKey);
    window.__atelierGenderKey = onKey;

    rerender();
  }

  window.GenderView = { render };
})();
