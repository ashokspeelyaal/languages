/* Hash router + view renderers.
 *
 * Phase 1 implements Vue d'ensemble (#/dashboard) and Parcourir (#/browse).
 * Every other nav target renders a "Phase X stub" card pointing at the
 * implementation plan — this keeps the nav clickable without lying about
 * what's built.
 */
(function () {
  const view = () => document.getElementById("view");

  const ROUTES = {
    dashboard:   () => window.FlashcardsView.renderDashboard(),
    browse:      renderBrowse,
    flashcards:  () => window.FlashcardsView.renderFlashcards(),
    pictures:    () => window.FlashcardsView.renderPictures(),
    genre:       () => window.GenderView.render(),
    nombres:     () => window.NumbersView.render(),
    alphabet:    () => window.AlphabetView.render(),
    conjugaison: () => window.ConjugaisonView.render(),
    grammaire:   () => window.GrammaireView.render(),
    typed:       () => window.PracticeView.renderGeneration(),
    cloze:       () => window.PracticeView.renderCloze(),
    mixed:       () => window.PracticeView.renderMixed(),
    chat:        stub("Chat",        7,  "Tuteur français en chat libre. Phase 7."),
    ecrire:      stub("Écrire",      8,  "Correction d'écrits + score DELF. Phase 8."),
    ecouter:     stub("Écouter",     8,  "Compréhension orale avec audio. Phase 8."),
    parler:      stub("Parler",      8,  "Évaluation de prononciation. Phase 8."),
    examen:      stub("Examen",      9,  "Examens blancs DELF A1-B2 + DALF C1. Phase 9."),
    radio:       stub("Radio",       10, "Stations FR / CA / BE avec sous-titres. Phase 10."),
    metrics:     stub("Métriques",   10, "Graphiques de progression. Phase 10."),
    aide:        renderHelp,
    parametres:  renderSettings,
    logout:      renderLogout,
  };

  function navigate() {
    const hash = (location.hash || "#/dashboard").replace(/^#\//, "");
    const route = hash.split("/")[0] || "dashboard";
    const fn = ROUTES[route] || renderDashboard;
    try {
      fn();
    } catch (e) {
      view().innerHTML = `<div class="empty" style="padding:48px;color:#b3261e">
        Erreur : ${escapeHtml(e.message)}</div>`;
    }
    document.querySelectorAll(".nav a[data-route]").forEach((a) => {
      a.classList.toggle("active", a.dataset.route === route);
    });
  }

  window.addEventListener("hashchange", navigate);
  document.addEventListener("store-ready", navigate);
  document.addEventListener("level-changed", () => {
    // Re-render the active view if it's level-sensitive.
    const hash = (location.hash || "#/dashboard").replace(/^#\//, "");
    const route = hash.split("/")[0];
    if (route === "browse" || route === "dashboard") navigate();
  });

  // ---------------------------------------------------------------- browse
  async function renderBrowse() {
    view().innerHTML = `<div class="empty" style="padding:48px;text-align:center;color:#5a627a">Chargement du vocabulaire…</div>`;
    const s = window.Store.state;
    const params = parseFilterHash();

    // Default: items at-or-below active level, unless URL has explicit level=.
    const queryLevel = params.get("level");
    const queryUpto = params.get("upto") || (queryLevel ? null : s.activeLevel);
    const queryPos = params.get("pos") || "";
    const queryGender = params.get("gender") || "";
    const queryCategory = params.get("cat") || "";
    const q = params.get("q") || "";
    const strict = params.get("strict") === "1";

    const qs = new URLSearchParams();
    if (strict) qs.set("level", s.activeLevel);
    else if (queryLevel) qs.set("level", queryLevel);
    else if (queryUpto) qs.set("upto", queryUpto);
    if (queryPos) qs.set("pos", queryPos);
    if (queryGender) qs.set("gender", queryGender);
    if (queryCategory) qs.set("category", queryCategory);
    if (q) qs.set("q", q);
    qs.set("page_size", "500");

    let data;
    try {
      data = await window.API.get("/api/vocab?" + qs.toString());
    } catch (e) {
      view().innerHTML = `<div class="empty" style="padding:48px;color:#b3261e">
        Erreur : ${escapeHtml(e.message)}</div>`;
      return;
    }

    const levelCounts = data.level_counts || {};
    const meta = window.Store.LEVEL_META[s.activeLevel];

    view().innerHTML = `
      <section class="browse">
        <header class="browse-head">
          <div>
            <h2>Parcourir le vocabulaire</h2>
            <p class="muted">
              ${data.total} mots affichés ·
              <strong style="color:${meta.color}">niveau actif ${meta.label}</strong>
              ${strict ? " (mode strict)" : " (≤ niveau actif)"}
            </p>
          </div>
          <label class="toggle">
            <input type="checkbox" id="strict-toggle" ${strict ? "checked" : ""}>
            <span>Strict : uniquement ${meta.label}</span>
          </label>
        </header>

        <nav class="filter-chips" aria-label="Niveau">
          ${window.Store.LEVELS.map((lvl) => {
            const m = window.Store.LEVEL_META[lvl];
            const n = levelCounts[lvl] || 0;
            const isActive = lvl === s.activeLevel;
            return `<a class="chip${isActive ? " chip-active" : ""}"
                      style="--chip-color:${m.color}"
                      href="#/browse?strict=1"
                      data-jump-level="${lvl}"
                      title="Passer au niveau ${lvl}">
                      ${lvl}<span class="chip-count">${n}</span>
                    </a>`;
          }).join("")}
        </nav>

        <form class="browse-filters" id="browse-filters">
          <input type="search" name="q" value="${escapeHtml(q)}" placeholder="Rechercher…" autocomplete="off">
          <select name="pos">
            <option value="">Toutes catégories</option>
            ${[["noun","Noms"],["verb","Verbes"],["adj","Adjectifs"],["adv","Adverbes"],["prep","Prépositions"],["conj","Conjonctions"],["pron","Pronoms"],["det","Déterminants"]]
              .map(([v,l]) => `<option value="${v}" ${queryPos===v?"selected":""}>${l}</option>`).join("")}
          </select>
          <select name="gender">
            <option value="">Tous genres</option>
            <option value="m" ${queryGender==="m"?"selected":""}>masculin</option>
            <option value="f" ${queryGender==="f"?"selected":""}>féminin</option>
            <option value="mf" ${queryGender==="mf"?"selected":""}>m. ou f.</option>
          </select>
          <button type="submit">Filtrer</button>
        </form>

        <ul class="vocab-list">
          ${data.items.map(renderItem).join("") || `<li class="empty">Aucun résultat. Essayez un autre filtre.</li>`}
        </ul>
      </section>
    `;

    // Strict toggle
    document.getElementById("strict-toggle").addEventListener("change", (e) => {
      const u = new URLSearchParams(parseFilterHashString(location.hash));
      if (e.target.checked) u.set("strict", "1");
      else u.delete("strict");
      location.hash = "#/browse?" + u.toString();
    });

    // Level chip jump
    document.querySelectorAll("[data-jump-level]").forEach((a) => {
      a.addEventListener("click", async (ev) => {
        ev.preventDefault();
        try { await window.Store.setActiveLevel(a.dataset.jumpLevel); }
        catch (e) { alert(e.message); }
        location.hash = "#/browse?strict=1";
      });
    });

    // Filter form
    document.getElementById("browse-filters").addEventListener("submit", (ev) => {
      ev.preventDefault();
      const f = new FormData(ev.target);
      const u = new URLSearchParams(parseFilterHashString(location.hash));
      ["q","pos","gender"].forEach((k) => {
        const v = (f.get(k) || "").toString().trim();
        if (v) u.set(k, v); else u.delete(k);
      });
      location.hash = "#/browse?" + u.toString();
    });
  }

  function renderItem(it) {
    const emoji = it.emoji ? `<span class="vocab-emoji" aria-hidden="true">${escapeHtml(it.emoji)}</span>` : "";
    const articleChip = it.article ? `<span class="article-chip gender-${it.gender || "x"}">${escapeHtml(it.article)}</span>` : "";
    const genderTag = it.gender && !it.article ? `<span class="gender-tag gender-${it.gender}">${it.gender}</span>` : "";
    const posTag = it.pos ? `<span class="pos-tag">${escapeHtml(it.pos)}</span>` : "";
    const levelTag = `<span class="level-tag" style="background:${(window.Store.LEVEL_META[it.level]||{}).color || "#9ca3af"}">${escapeHtml(it.level)}</span>`;
    const customTag = it.custom ? `<span class="custom-tag">perso</span>` : "";
    const cognateTag = it.cognate ? `<span class="cognate-tag" title="Mot proche de l'anglais — vous le connaissez peut-être déjà">≈ EN</span>` : "";
    const example = it.exampleFR
      ? `<div class="vocab-ex"><span class="ex-fr">${escapeHtml(it.exampleFR)}</span><span class="ex-en">${escapeHtml(it.exampleEN || "")}</span></div>`
      : "";
    return `
      <li class="vocab-item">
        <div class="vocab-row">
          ${emoji}
          ${articleChip}
          <span class="vocab-fr">${escapeHtml(it.french)}</span>
          ${genderTag}
          ${posTag}
          ${cognateTag}
          ${levelTag}
          ${customTag}
          <span class="vocab-en">${escapeHtml(it.english)}</span>
        </div>
        ${example}
      </li>
    `;
  }

  // -------------------------------------------------------------- stubs/help
  function stub(title, phase, desc) {
    return function () {
      view().innerHTML = `
        <section class="stub">
          <h2>${escapeHtml(title)}</h2>
          <p class="muted">Phase ${phase} — pas encore livré.</p>
          <p>${escapeHtml(desc)}</p>
          <p>Cette section apparaîtra lorsque la phase ${phase} sera construite. Voir
            <code>IMPLEMENTATION_PLAN.md</code> dans le dépôt pour la séquence complète.</p>
          <p><a class="btn" href="#/dashboard">← Retour à la vue d'ensemble</a></p>
        </section>
      `;
    };
  }

  function renderHelp() {
    view().innerHTML = `
      <section class="stub">
        <h2>Aide</h2>
        <p>Atelier est en construction par phases. Aujourd'hui (phase 1) vous pouvez :</p>
        <ul>
          <li>Choisir votre niveau (A1 → C1) dans la barre du haut.</li>
          <li>Parcourir le vocabulaire fondamental filtré par niveau, catégorie, genre.</li>
          <li>Refaire l'onboarding depuis Paramètres.</li>
        </ul>
        <p>Les autres fonctionnalités (flashcards, conjugaison, grammaire, chat,
          écouter, parler, examen) arriveront aux phases suivantes du plan.</p>
        <p><a class="btn" href="#/dashboard">← Retour</a></p>
      </section>
    `;
  }

  function renderSettings() {
    const s = window.Store.state;
    view().innerHTML = `
      <section class="stub">
        <h2>Paramètres</h2>
        <form id="settings-form" class="settings-form">
          <fieldset>
            <legend>Niveau actif</legend>
            <p class="muted">Aussi accessible par les pastilles en haut.</p>
            <select name="active_level">
              ${window.Store.LEVELS.map((l) => `<option value="${l}" ${l===s.activeLevel?"selected":""}>${l} — ${window.Store.LEVEL_META[l].title}</option>`).join("")}
            </select>
          </fieldset>
          <fieldset>
            <legend>Registre</legend>
            <label><input type="radio" name="register" value="vous" ${s.register==="vous"?"checked":""}> vous (formel)</label>
            <label><input type="radio" name="register" value="tu" ${s.register==="tu"?"checked":""}> tu (informel)</label>
          </fieldset>
          <fieldset>
            <legend>Confort A1 / A2</legend>
            <label><input type="checkbox" name="simple_ui" ${s.simpleUi?"checked":""}> Interface simplifiée</label>
            <label><input type="checkbox" name="auto_article" ${s.autoArticle?"checked":""}> Préfixer le / la automatiquement</label>
          </fieldset>
          <fieldset>
            <legend>Objectif quotidien</legend>
            <input type="number" name="daily_goal" min="1" max="240" value="${s.dailyGoal}"> minutes
          </fieldset>
          <fieldset>
            <legend>Onboarding</legend>
            <p class="muted">L'assistant initial (placement, voix, registre).</p>
            <button type="button" id="redo-onboarding">Refaire l'onboarding</button>
          </fieldset>
          <button type="submit" class="btn btn-primary">Enregistrer</button>
          <span id="settings-msg" class="muted"></span>
        </form>
      </section>
    `;
    document.getElementById("settings-form").addEventListener("submit", async (ev) => {
      ev.preventDefault();
      const f = new FormData(ev.target);
      const patch = {
        active_level: f.get("active_level"),
        register: f.get("register"),
        simple_ui: f.get("simple_ui") === "on",
        auto_article: f.get("auto_article") === "on",
        daily_goal: parseInt(f.get("daily_goal"), 10) || 15,
      };
      try {
        await window.Store.saveSettings(patch);
        document.getElementById("settings-msg").textContent = "Enregistré.";
      } catch (e) {
        document.getElementById("settings-msg").textContent = "Erreur : " + e.message;
      }
    });
    document.getElementById("redo-onboarding").addEventListener("click", async () => {
      try {
        await window.API.put("/api/settings/onboarding_done", { done: false });
        location.replace("/");
      } catch (e) { alert(e.message); }
    });
  }

  async function renderLogout() {
    try { await window.API.post("/api/auth/logout", {}); } catch (e) {}
    location.replace("/login");
  }

  // ---- utils ----
  function parseFilterHashString(h) {
    const idx = (h || "").indexOf("?");
    return idx === -1 ? "" : h.slice(idx + 1);
  }
  function parseFilterHash() {
    return new URLSearchParams(parseFilterHashString(location.hash));
  }
  function escapeHtml(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));
  }

  window.Views = { navigate };
})();
