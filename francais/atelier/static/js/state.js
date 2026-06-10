/* Server-backed state store with synchronous local cache.
 *
 * Boot pulls /api/settings + /api/ai/config in parallel and populates
 * window.Store.state. After that, views read state synchronously and
 * mutations call PUT /api/settings/* with fire-and-forget POSTs.
 *
 * Phase 1 keeps the state surface deliberately small — active_level,
 * settings, voice_pref, register, simple_ui. SRS / xp / achievements /
 * history land in Phase 2 when the SRS routes exist.
 */
(function () {
  const LEVELS = ["A1", "A2", "B1", "B2", "C1"];
  const LEVEL_META = {
    A1: { id: "A1", label: "A1", title: "Débutant",         color: "#22c55e" },
    A2: { id: "A2", label: "A2", title: "Élémentaire",      color: "#84cc16" },
    B1: { id: "B1", label: "B1", title: "Intermédiaire",    color: "#eab308" },
    B2: { id: "B2", label: "B2", title: "Avancé",           color: "#f97316" },
    C1: { id: "C1", label: "C1", title: "Autonome",         color: "#ef4444" },
  };

  const defaultState = {
    me: { username: "" },
    activeLevel: "A1",
    register: "vous",
    voicePref: { provider: "openai", voice: "nova", rate: "0%", region: "francecentral", dialect: "fr-FR" },
    simpleUi: true,
    autoArticle: true,
    dailyGoal: 15,
    onboardingDone: false,
    settings: {
      direction: "fr-en",
      strictMatch: false,
      theme: "auto",
      sessionSize: 15,
      playbackRate: 0.85,
      outputLanguage: "Français (français de France)",
      durationMinutes: 2.5,
    },
    aiConfig: { openai: false, azure: false, azureRegion: "francecentral" },
  };

  const state = structuredClone(defaultState);

  async function boot() {
    const [me, settings, aiConfig] = await Promise.all([
      window.API.get("/api/auth/me"),
      window.API.get("/api/settings"),
      window.API.get("/api/ai/config").catch(() => defaultState.aiConfig),
    ]);
    state.me = me || { username: "" };
    if (settings) {
      state.activeLevel = settings.active_level || "A1";
      state.register = settings.register || "vous";
      state.voicePref = { ...defaultState.voicePref, ...(settings.voice_pref || {}) };
      state.simpleUi = !!settings.simple_ui;
      state.autoArticle = !!settings.auto_article;
      state.dailyGoal = settings.daily_goal || 15;
      state.onboardingDone = !!settings.onboarding_done;
      state.settings = { ...defaultState.settings, ...(settings.settings || {}) };
    }
    state.aiConfig = aiConfig || defaultState.aiConfig;
    applyBodyClass();
    document.dispatchEvent(new CustomEvent("store-ready", { detail: { state } }));
  }

  // ---- Active level ----
  async function setActiveLevel(level) {
    const prev = state.activeLevel;
    if (!LEVELS.includes(level) || level === prev) return;
    state.activeLevel = level;
    applyBodyClass();
    document.dispatchEvent(new CustomEvent("level-changed", { detail: { level, prev } }));
    try {
      await window.API.put("/api/settings/active_level", { level });
    } catch (e) {
      // Roll back on failure.
      state.activeLevel = prev;
      applyBodyClass();
      document.dispatchEvent(new CustomEvent("level-changed", { detail: { level: prev, prev: level } }));
      throw e;
    }
  }

  // ---- Simple-mode (auto-flips off at B1+ unless user pinned) ----
  function applyBodyClass() {
    const b = document.body;
    if (!b) return;
    b.classList.toggle("simple-ui", !!state.simpleUi);
    b.classList.toggle("level-A1", state.activeLevel === "A1");
    b.classList.toggle("level-A2", state.activeLevel === "A2");
    b.classList.toggle("level-B1", state.activeLevel === "B1");
    b.classList.toggle("level-B2", state.activeLevel === "B2");
    b.classList.toggle("level-C1", state.activeLevel === "C1");
  }

  async function setSimpleUi(on) {
    state.simpleUi = !!on;
    applyBodyClass();
    document.dispatchEvent(new CustomEvent("simple-ui-changed", { detail: { on: state.simpleUi } }));
    try { await window.API.put("/api/settings/simple_ui", { simple_ui: state.simpleUi }); }
    catch (e) {}
  }

  // ---- Register (tu/vous) ----
  async function setRegister(reg) {
    if (!["tu", "vous"].includes(reg) || reg === state.register) return;
    state.register = reg;
    document.dispatchEvent(new CustomEvent("register-changed", { detail: { register: reg } }));
    try { await window.API.put("/api/settings/register", { register: reg }); }
    catch (e) {}
  }

  // ---- Bulk PUT (used by Onboarding finish + Paramètres) ----
  async function saveSettings(patch) {
    Object.assign(state, mapPatchToState(patch));
    applyBodyClass();
    await window.API.put("/api/settings", patch);
    document.dispatchEvent(new CustomEvent("settings-changed", { detail: { patch } }));
  }

  function mapPatchToState(patch) {
    const out = {};
    if ("active_level" in patch) out.activeLevel = patch.active_level;
    if ("register" in patch) out.register = patch.register;
    if ("voice_pref" in patch) out.voicePref = { ...state.voicePref, ...patch.voice_pref };
    if ("simple_ui" in patch) out.simpleUi = !!patch.simple_ui;
    if ("auto_article" in patch) out.autoArticle = !!patch.auto_article;
    if ("daily_goal" in patch) out.dailyGoal = patch.daily_goal;
    if ("onboarding_done" in patch) out.onboardingDone = !!patch.onboarding_done;
    if ("settings" in patch) out.settings = { ...state.settings, ...patch.settings };
    return out;
  }

  window.Store = {
    state, boot,
    setActiveLevel, setSimpleUi, setRegister, saveSettings,
    LEVELS, LEVEL_META,
  };
})();
