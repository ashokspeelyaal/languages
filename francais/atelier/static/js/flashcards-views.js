/* Flashcards view + Dashboard renderer.
 *
 * Mounted by views.js when the user navigates to #/flashcards or
 * #/dashboard. The dashboard reads SRS / XP / streak; flashcards runs
 * the actual review loop.
 *
 * Keyboard:
 *   Space        flip card / next
 *   1            difficile (back to box 1)
 *   2            bien      (next box)
 *   3            facile    (skip a box)
 *   C            play with Camille (nova)
 *   A            play with Antoine (echo)
 *   T            cycle direction (FR→EN / EN→FR / mixed)
 *   ?            shortcut help (handled in app.js, optional)
 */
(function () {
  function escapeHtml(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));
  }

  // ============================================================ Dashboard
  function renderDashboard() {
    const s = window.Store.state;
    const meta = window.Store.LEVEL_META[s.activeLevel];
    const view = document.getElementById("view");

    // Items the user is currently studying (at-or-below active level).
    const items = window.Store.vocabFiltered();
    const counts = window.SRS.boxCounts(items);
    const totalSeen = items.filter((it) => s.items[it.id] && s.items[it.id].seen > 0).length;
    const mastered = items.filter((it) => s.items[it.id] && s.items[it.id].box === 5).length;
    const stars = items.filter((it) => s.items[it.id] && s.items[it.id].starred).length;
    const todayStats = s.sessionStats.today;
    const todayTotal = todayStats.right + todayStats.wrong;
    const todayAcc = todayTotal ? Math.round((todayStats.right / todayTotal) * 100) : 0;

    // Per-level vocabulary counts at every level (independent of activeLevel filter).
    const perLevel = {};
    window.Store.LEVELS.forEach((l) => { perLevel[l] = 0; });
    s.vocab.forEach((it) => { if (perLevel[it.level] != null) perLevel[it.level] += 1; });

    view.innerHTML = `
      <section class="dashboard-grid">
        <article class="card card-hero">
          <div class="hero-eyebrow" style="color:${meta.color}">Niveau ${meta.label} · ${meta.title}</div>
          <h2>Bonjour, ${escapeHtml(s.me.username)}.</h2>
          <p class="card-lead">
            ${counts.dueToday > 0
              ? `<strong>${counts.dueToday} carte${counts.dueToday > 1 ? "s" : ""}</strong> à réviser aujourd'hui sur ${items.length} disponibles.`
              : `Aucune carte due aujourd'hui à ce niveau. Vous pouvez monter de niveau ou parcourir le vocabulaire.`
            }
          </p>
          <div class="hero-actions">
            ${counts.dueToday > 0
              ? `<a class="btn btn-primary" href="#/flashcards">Commencer une session ▸</a>`
              : `<a class="btn btn-primary" href="#/browse">Parcourir le vocabulaire</a>`
            }
            <a class="btn" href="#/browse">Tout voir</a>
          </div>
        </article>

        <article class="card">
          <h3>Aujourd'hui</h3>
          <div class="big-stat">
            <span class="big-stat-num">${todayStats.right}/${todayTotal || 0}</span>
            <span class="big-stat-sub">${todayAcc}% de réussite</span>
          </div>
          <ul class="kv-list">
            <li><span>Série</span><strong>${s.streak.count} jour${s.streak.count > 1 ? "s" : ""}</strong></li>
            <li><span>XP</span><strong>${s.xp}</strong></li>
            <li><span>Objectif</span><strong>${s.dailyGoal} min</strong></li>
          </ul>
        </article>

        <article class="card">
          <h3>Progression Leitner</h3>
          <div class="box-bars">
            ${[1,2,3,4,5].map((b) => {
              const n = counts[b] || 0;
              const pct = items.length ? Math.round((n / items.length) * 100) : 0;
              return `<div class="box-row">
                <span class="box-num">Boîte ${b}</span>
                <span class="box-bar"><span class="box-fill box-fill-${b}" style="width:${pct}%"></span></span>
                <span class="box-count">${n}</span>
              </div>`;
            }).join("")}
          </div>
          <p class="muted" style="margin-top:8px">
            ${totalSeen} vus · ${mastered} maîtrisés · ${stars} étoilés
          </p>
        </article>

        <article class="card">
          <h3>Vocabulaire par niveau</h3>
          <div class="filter-chips" style="margin:8px 0 0">
            ${window.Store.LEVELS.map((lvl) => {
              const m = window.Store.LEVEL_META[lvl];
              const n = perLevel[lvl] || 0;
              const isActive = lvl === s.activeLevel;
              return `<a class="chip${isActive ? " chip-active" : ""}"
                        style="--chip-color:${m.color}"
                        href="#/browse?strict=1"
                        data-jump-level="${lvl}">
                        ${lvl}<span class="chip-count">${n}</span>
                      </a>`;
            }).join("")}
          </div>
          <p class="muted" style="margin-top:10px">
            Cliquez sur une pastille pour passer à ce niveau et n'afficher que ses mots.
          </p>
        </article>
      </section>
    `;

    document.querySelectorAll("[data-jump-level]").forEach((a) => {
      a.addEventListener("click", async (ev) => {
        ev.preventDefault();
        try { await window.Store.setActiveLevel(a.dataset.jumpLevel); }
        catch (e) { alert(e.message); }
        location.hash = "#/browse?strict=1";
      });
    });
  }

  // ============================================================ Flashcards
  function renderFlashcards() {
    const view = document.getElementById("view");
    const s = window.Store.state;
    const items = window.Store.vocabFiltered();
    const sessionSize = s.settings.sessionSize || 15;
    const session = window.SRS.pickDue(items, sessionSize);

    if (session.length === 0) {
      view.innerHTML = `
        <section class="stub">
          <h2>Rien à réviser à ce niveau</h2>
          <p>Aucune carte n'est due aujourd'hui pour le niveau <strong>${s.activeLevel}</strong>.</p>
          <p>Essayez un autre niveau (pastilles en haut), ou parcourez le vocabulaire pour découvrir de nouveaux mots.</p>
          <p><a class="btn btn-primary" href="#/browse">Parcourir</a> <a class="btn" href="#/dashboard">Tableau de bord</a></p>
        </section>
      `;
      return;
    }

    window.Store.recordSessionStart("flashcards");

    let i = 0;
    let flipped = false;
    let directionMode = s.settings.direction || "fr-en"; // 'fr-en' | 'en-fr' | 'mixed'

    view.innerHTML = `
      <section class="fc-session">
        <header class="fc-head">
          <div>
            <h2 style="margin:0">Flashcards</h2>
            <p class="muted">Tentez d'abord de récupérer la réponse. Puis retournez la carte.</p>
          </div>
          <div class="dir-toggle" role="radiogroup" aria-label="Direction">
            ${[["fr-en","FR → EN"],["en-fr","EN → FR"],["mixed","Mélangé"]].map(([k,l]) =>
              `<button type="button" class="dir-btn ${directionMode === k ? "active" : ""}" data-dir="${k}">${l}</button>`
            ).join("")}
          </div>
        </header>
        <div id="fc-stage" class="fc-stage"></div>
      </section>
    `;

    function currentDirection() {
      if (directionMode === "mixed") return i % 2 === 0 ? "fr-en" : "en-fr";
      return directionMode;
    }

    function render() {
      const it = session[i];
      if (!it) return finish();
      const d = currentDirection();
      const prompt = d === "fr-en" ? it.french : it.english;
      const answer = d === "fr-en" ? it.english : it.french;
      const showArticleOnAnswer = d === "en-fr" && it.pos === "noun" && it.article;

      const stage = document.getElementById("fc-stage");
      const metaLine = [
        `<span class="level-tag" style="background:${(window.Store.LEVEL_META[it.level]||{}).color || "#9ca3af"}">${escapeHtml(it.level)}</span>`,
        escapeHtml(it.category || ""),
        d === "fr-en" ? "FR → EN" : "EN → FR",
      ].filter(Boolean).join(" · ");

      const articleChip = it.pos === "noun" && it.article
        ? `<span class="article-chip gender-${it.gender || "x"}">${escapeHtml(it.article)}</span>`
        : "";
      const genderTag = it.pos === "noun" && it.gender && !it.article
        ? `<span class="gender-tag gender-${it.gender}">${it.gender}</span>` : "";

      stage.innerHTML = `
        <div class="fc ${flipped ? "back" : "front"}">
          <span class="fc-progress">${i + 1} / ${session.length}</span>
          <p class="fc-meta">${metaLine}</p>
          ${!flipped ? `
            <p class="fc-prompt">${escapeHtml(prompt)}</p>
            ${d === "fr-en" ? voiceRow(it.french) : ""}
            <div class="fc-actions">
              <button class="btn btn-primary" id="fc-flip">Retourner · Espace</button>
            </div>
          ` : `
            <p class="fc-prompt">${escapeHtml(prompt)}</p>
            ${d === "fr-en" ? voiceRow(it.french) : ""}
            <div class="fc-answer-block">
              ${showArticleOnAnswer ? articleChip : ""}
              <p class="fc-answer">${escapeHtml(answer)}</p>
              ${d === "en-fr" ? voiceRow(it.french) : ""}
              ${genderTag}
              ${it.pos === "verb" && it.verb_group ? `<span class="pos-tag">groupe ${escapeHtml(it.verb_group)}</span>` : ""}
            </div>
            ${it.exampleFR ? `
              <div class="fc-examples">
                <p class="fc-example"><span class="lab">FR</span>
                  <span class="ex">${escapeHtml(it.exampleFR)}</span>
                  ${voiceRow(it.exampleFR, "small")}
                </p>
                ${it.exampleEN ? `<p class="fc-example"><span class="lab">EN</span>
                  <span class="ex en">${escapeHtml(it.exampleEN)}</span></p>` : ""}
              </div>` : ""}
            <div class="fc-actions">
              <button class="btn fc-grade fc-hard" data-grade="hard">Difficile (1)</button>
              <button class="btn fc-grade fc-good" data-grade="good">Bien (2)</button>
              <button class="btn fc-grade fc-easy" data-grade="easy">Facile (3)</button>
            </div>
          `}
        </div>
      `;

      if (!flipped) {
        document.getElementById("fc-flip").addEventListener("click", flip);
      } else {
        document.querySelectorAll(".fc-grade").forEach((b) =>
          b.addEventListener("click", () => rate(b.dataset.grade))
        );
      }
      document.querySelectorAll(".voice-btn").forEach((b) => {
        b.addEventListener("click", () => {
          window.Speech.speak(b.dataset.text, { voiceKey: b.dataset.voice });
        });
      });
    }

    function voiceRow(text, size) {
      const cls = size === "small" ? "voice-row voice-row-small" : "voice-row";
      return `<span class="${cls}">
        <button type="button" class="voice-btn" data-voice="nova" data-text="${escapeHtml(text)}" title="Camille (féminin) · touche C">▶ Camille</button>
        <button type="button" class="voice-btn" data-voice="echo" data-text="${escapeHtml(text)}" title="Antoine (masculin) · touche A">▶ Antoine</button>
      </span>`;
    }

    function flip() { flipped = true; render(); }
    function rate(outcome) {
      window.Store.markSeen(session[i].id, outcome);
      i += 1; flipped = false; render();
    }
    function finish() {
      const stage = document.getElementById("fc-stage");
      stage.innerHTML = `
        <div class="fc-summary">
          <p class="big-num">✓</p>
          <h3>Session terminée.</h3>
          <p>${session.length} cartes révisées. Reviens demain pour la prochaine ronde.</p>
          <div class="hero-actions">
            <a class="btn btn-primary" href="#/flashcards" onclick="setTimeout(()=>location.reload(),50)">Une autre ronde</a>
            <a class="btn" href="#/dashboard">Tableau de bord</a>
          </div>
        </div>
      `;
    }

    // Direction toggle
    document.querySelectorAll(".dir-btn").forEach((b) => {
      b.addEventListener("click", async () => {
        directionMode = b.dataset.dir;
        document.querySelectorAll(".dir-btn").forEach((x) =>
          x.classList.toggle("active", x.dataset.dir === directionMode)
        );
        try {
          await window.Store.saveSettings({ settings: { direction: directionMode } });
        } catch (e) {}
        flipped = false;
        render();
      });
    });

    // Keyboard
    const keys = (e) => {
      if (e.target.matches && e.target.matches("input, textarea, select")) return;
      if (e.key === " ") {
        e.preventDefault();
        if (!flipped) flip();
        return;
      }
      if (flipped) {
        if (e.key === "1") rate("hard");
        else if (e.key === "2") rate("good");
        else if (e.key === "3") rate("easy");
      }
      const it = session[i];
      if (!it) return;
      if (e.key === "c" || e.key === "C") {
        window.Speech.speak(it.french, { voiceKey: "nova" });
      } else if (e.key === "a" || e.key === "A") {
        window.Speech.speak(it.french, { voiceKey: "echo" });
      } else if (e.key === "t" || e.key === "T") {
        directionMode = directionMode === "fr-en" ? "en-fr"
                      : directionMode === "en-fr" ? "mixed" : "fr-en";
        document.querySelectorAll(".dir-btn").forEach((x) =>
          x.classList.toggle("active", x.dataset.dir === directionMode)
        );
        flipped = false;
        render();
      }
    };
    document.addEventListener("keydown", keys);

    // Tear-down: views.js re-renders on hash change which calls render again,
    // so the listener accumulates. Track + remove on next navigation.
    if (window.__atelierFlashKeyHandler) {
      document.removeEventListener("keydown", window.__atelierFlashKeyHandler);
    }
    window.__atelierFlashKeyHandler = keys;

    render();
  }

  window.FlashcardsView = { renderDashboard, renderFlashcards };
})();
