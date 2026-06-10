/* Onboarding wizard — 3 screens, runs once per user.
 *
 * 1. Diagnostic — 12 multiple-choice items spanning A1 → C1.
 *    Score determines suggested active_level (user can override).
 * 2. Goal     — daily minutes slider.
 * 3. Voice    — Camille/Antoine, dialect, register (tu/vous).
 *
 * On finish: PUT /api/settings with the combined patch + onboarding_done=true.
 * Caller (app.js) then refreshes Store and dispatches into the router.
 *
 * Skippable at any point — safe defaults (A1, 15 min, Camille FR-FR, vous).
 */
(function () {
  const DIAGNOSTIC = [
    // 1 — article (A1)
    { q: "Quel article ? ___ chat dort.", opts: ["le", "la", "l'", "les"], correct: 0, level: "A1", hint: "« chat » est masculin." },
    // 2 — article (A1)
    { q: "Quel article ? ___ maison est blanche.", opts: ["le", "la", "l'", "les"], correct: 1, level: "A1", hint: "« maison » est féminin." },
    // 3 — être present (A1)
    { q: "Je ___ étudiant.", opts: ["suis", "es", "est", "sommes"], correct: 0, level: "A1" },
    // 4 — avoir present (A1)
    { q: "Elle ___ vingt ans.", opts: ["a", "as", "ai", "ont"], correct: 0, level: "A1" },
    // 5 — regular -er (A2)
    { q: "Nous ___ français.", opts: ["parle", "parlons", "parlez", "parlent"], correct: 1, level: "A2" },
    // 6 — negation (A2)
    { q: "Je ___ pas le temps.", opts: ["ai", "n'ai", "n'as", "n'a"], correct: 1, level: "A2" },
    // 7 — passé composé (A2)
    { q: "Hier, j' ___ vu un film.", opts: ["ai", "suis", "avais", "étais"], correct: 0, level: "A2" },
    // 8 — pronoun order (B1)
    { q: "Je ___ donne. (le livre, à lui)", opts: ["le lui", "lui le", "la lui", "lui la"], correct: 0, level: "B1" },
    // 9 — imparfait (B1)
    { q: "Quand j'étais petit, je ___ tous les jours.", opts: ["jouais", "joué", "joue", "jouerai"], correct: 0, level: "B1" },
    // 10 — subjonctif présent (B2)
    { q: "Il faut que tu ___ patient.", opts: ["es", "sois", "soit", "serais"], correct: 1, level: "B2" },
    // 11 — conditionnel passé (B2)
    { q: "Si j'avais su, je ___.", opts: ["serais venu", "suis venu", "venais", "viendrais"], correct: 0, level: "B2" },
    // 12 — subjonctif passé (C1)
    { q: "Je doute qu'il ___ déjà fini.", opts: ["a", "ait", "aura", "avait"], correct: 1, level: "C1" },
  ];

  // Score → suggested level. The breakpoints are calibrated to the
  // difficulty distribution above (4 × A1, 3 × A2, 2 × B1, 2 × B2, 1 × C1).
  function levelFromScore(score) {
    if (score <= 2) return "A1";
    if (score <= 5) return "A2";
    if (score <= 8) return "B1";
    if (score <= 10) return "B2";
    return "C1";
  }

  const state = {
    step: 1,
    answers: new Array(DIAGNOSTIC.length).fill(-1),
    suggestedLevel: "A1",
    pickedLevel: "A1",
    dailyGoal: 15,
    voice: "nova",      // Camille
    dialect: "fr-FR",
    register: "vous",
  };

  function host() {
    return document.getElementById("view");
  }

  function start() {
    state.step = 1;
    render();
  }

  function render() {
    if (state.step === 1) renderDiagnostic();
    else if (state.step === 2) renderResult();
    else if (state.step === 3) renderGoal();
    else if (state.step === 4) renderVoice();
    else finish();
  }

  // ------------------------------------------------------------- diagnostic
  function renderDiagnostic() {
    host().innerHTML = `
      <section class="wizard">
        <div class="wizard-progress"><span style="width:25%"></span></div>
        <h2>Bienvenue dans Atelier !</h2>
        <p class="muted">D'abord, un mini-test de 12 questions pour deviner votre niveau. Si vous débutez complètement, choisissez au hasard ou cliquez « Je débute ».</p>
        <form id="diag-form" class="diag-form">
          ${DIAGNOSTIC.map((d, i) => `
            <fieldset class="diag-q">
              <legend><span class="diag-num">${i + 1}</span> ${escapeHtml(d.q)}</legend>
              <div class="diag-opts">
                ${d.opts.map((opt, j) => `
                  <label>
                    <input type="radio" name="q${i}" value="${j}" ${state.answers[i] === j ? "checked" : ""}>
                    <span>${escapeHtml(opt)}</span>
                  </label>
                `).join("")}
              </div>
            </fieldset>
          `).join("")}
          <div class="wizard-actions">
            <button type="button" class="btn" id="skip-diag">Je débute (passer au niveau A1)</button>
            <button type="submit" class="btn btn-primary">Voir mon niveau</button>
          </div>
        </form>
      </section>
    `;
    document.getElementById("diag-form").addEventListener("submit", (ev) => {
      ev.preventDefault();
      const f = new FormData(ev.target);
      let score = 0;
      DIAGNOSTIC.forEach((d, i) => {
        const v = parseInt(f.get("q" + i), 10);
        state.answers[i] = isNaN(v) ? -1 : v;
        if (state.answers[i] === d.correct) score += 1;
      });
      state.score = score;
      state.suggestedLevel = levelFromScore(score);
      state.pickedLevel = state.suggestedLevel;
      state.step = 2;
      render();
    });
    document.getElementById("skip-diag").addEventListener("click", () => {
      state.answers.fill(-1);
      state.score = 0;
      state.suggestedLevel = "A1";
      state.pickedLevel = "A1";
      state.step = 2;
      render();
    });
  }

  function renderResult() {
    const meta = window.Store.LEVEL_META[state.suggestedLevel];
    host().innerHTML = `
      <section class="wizard">
        <div class="wizard-progress"><span style="width:50%"></span></div>
        <h2>Votre niveau : <strong style="color:${meta.color}">${meta.label} — ${meta.title}</strong></h2>
        <p class="muted">Score : ${state.score} / ${DIAGNOSTIC.length}. Si ça ne correspond pas à votre ressenti, choisissez ci-dessous.</p>
        <div class="level-radio-grid">
          ${window.Store.LEVELS.map((lvl) => {
            const m = window.Store.LEVEL_META[lvl];
            return `<label class="level-radio">
              <input type="radio" name="picked" value="${lvl}" ${lvl === state.pickedLevel ? "checked" : ""}>
              <span class="level-radio-pill" style="--pill-color:${m.color}">
                <strong>${m.label}</strong>
                <small>${m.title}</small>
              </span>
            </label>`;
          }).join("")}
        </div>
        <div class="wizard-actions">
          <button type="button" class="btn" id="back-to-diag">← Refaire le test</button>
          <button type="button" class="btn btn-primary" id="next-from-result">Continuer →</button>
        </div>
      </section>
    `;
    document.querySelectorAll("input[name='picked']").forEach((r) => {
      r.addEventListener("change", (e) => { state.pickedLevel = e.target.value; });
    });
    document.getElementById("back-to-diag").addEventListener("click", () => { state.step = 1; render(); });
    document.getElementById("next-from-result").addEventListener("click", () => { state.step = 3; render(); });
  }

  // ------------------------------------------------------------- goal
  function renderGoal() {
    host().innerHTML = `
      <section class="wizard">
        <div class="wizard-progress"><span style="width:75%"></span></div>
        <h2>Combien de temps par jour ?</h2>
        <p class="muted">Un objectif quotidien aide à entretenir une série (streak). Vous pouvez le changer à tout moment dans Paramètres.</p>
        <div class="goal-slider-row">
          <input type="range" id="goal-slider" min="5" max="60" step="5" value="${state.dailyGoal}">
          <output id="goal-out">${state.dailyGoal} minutes</output>
        </div>
        <div class="goal-presets">
          ${[5, 10, 15, 20, 30, 45].map((v) => `
            <button type="button" class="btn ${v === state.dailyGoal ? "btn-primary" : ""}" data-goal="${v}">${v} min</button>
          `).join("")}
        </div>
        <div class="wizard-actions">
          <button type="button" class="btn" id="goal-back">← Retour</button>
          <button type="button" class="btn btn-primary" id="goal-next">Continuer →</button>
        </div>
      </section>
    `;
    const slider = document.getElementById("goal-slider");
    const out = document.getElementById("goal-out");
    slider.addEventListener("input", () => {
      state.dailyGoal = parseInt(slider.value, 10);
      out.textContent = state.dailyGoal + " minutes";
    });
    document.querySelectorAll("[data-goal]").forEach((b) => {
      b.addEventListener("click", () => {
        state.dailyGoal = parseInt(b.dataset.goal, 10);
        slider.value = state.dailyGoal;
        out.textContent = state.dailyGoal + " minutes";
        document.querySelectorAll("[data-goal]").forEach((x) => x.classList.toggle("btn-primary", x === b));
      });
    });
    document.getElementById("goal-back").addEventListener("click", () => { state.step = 2; render(); });
    document.getElementById("goal-next").addEventListener("click", () => { state.step = 4; render(); });
  }

  // ------------------------------------------------------------- voice & register
  function renderVoice() {
    host().innerHTML = `
      <section class="wizard">
        <div class="wizard-progress"><span style="width:100%"></span></div>
        <h2>Voix et registre</h2>
        <p class="muted">À régler à votre goût — modifiable à tout moment.</p>

        <fieldset class="wizard-fieldset">
          <legend>Voix par défaut</legend>
          <label class="big-radio">
            <input type="radio" name="voice" value="nova" ${state.voice === "nova" ? "checked" : ""}>
            <span><strong>Camille</strong> — voix féminine, claire</span>
          </label>
          <label class="big-radio">
            <input type="radio" name="voice" value="echo" ${state.voice === "echo" ? "checked" : ""}>
            <span><strong>Antoine</strong> — voix masculine</span>
          </label>
        </fieldset>

        <fieldset class="wizard-fieldset">
          <legend>Dialecte</legend>
          <label class="big-radio">
            <input type="radio" name="dialect" value="fr-FR" ${state.dialect === "fr-FR" ? "checked" : ""}>
            <span><strong>Français de France</strong> — par défaut</span>
          </label>
          <label class="big-radio">
            <input type="radio" name="dialect" value="fr-CA" ${state.dialect === "fr-CA" ? "checked" : ""}>
            <span><strong>Français du Canada</strong> — accent québécois</span>
          </label>
        </fieldset>

        <fieldset class="wizard-fieldset">
          <legend>Tutoiement / vouvoiement</legend>
          <label class="big-radio">
            <input type="radio" name="register" value="vous" ${state.register === "vous" ? "checked" : ""}>
            <span><strong>vous</strong> — formel (recommandé au début)</span>
          </label>
          <label class="big-radio">
            <input type="radio" name="register" value="tu" ${state.register === "tu" ? "checked" : ""}>
            <span><strong>tu</strong> — informel (style ami)</span>
          </label>
        </fieldset>

        <div class="wizard-actions">
          <button type="button" class="btn" id="voice-back">← Retour</button>
          <button type="button" class="btn btn-primary" id="voice-finish">Terminer ✓</button>
        </div>
      </section>
    `;
    document.querySelectorAll("input[name='voice']").forEach((r) => r.addEventListener("change", () => { state.voice = r.value; }));
    document.querySelectorAll("input[name='dialect']").forEach((r) => r.addEventListener("change", () => { state.dialect = r.value; }));
    document.querySelectorAll("input[name='register']").forEach((r) => r.addEventListener("change", () => { state.register = r.value; }));
    document.getElementById("voice-back").addEventListener("click", () => { state.step = 3; render(); });
    document.getElementById("voice-finish").addEventListener("click", finish);
  }

  async function finish() {
    host().innerHTML = `<div class="empty" style="padding:48px;text-align:center;color:#5a627a">Enregistrement…</div>`;
    const patch = {
      active_level: state.pickedLevel,
      register: state.register,
      voice_pref: { provider: "openai", voice: state.voice, dialect: state.dialect },
      simple_ui: ["A1", "A2"].includes(state.pickedLevel),
      auto_article: ["A1", "A2"].includes(state.pickedLevel),
      daily_goal: state.dailyGoal,
      onboarding_done: true,
    };
    try {
      await window.Store.saveSettings(patch);
      // Re-pull aiConfig + jump into the app.
      await window.Store.boot();
      location.hash = "#/dashboard";
    } catch (e) {
      host().innerHTML = `<div class="empty" style="padding:48px;color:#b3261e">
        Erreur lors de l'enregistrement : ${escapeHtml(e.message)}
        <br><br><button class="btn btn-primary" onclick="location.reload()">Réessayer</button></div>`;
    }
  }

  function escapeHtml(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));
  }

  window.Onboarding = { start };
})();
