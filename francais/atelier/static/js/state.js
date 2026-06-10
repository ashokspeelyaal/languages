/* Server-backed state store with synchronous local cache.
 *
 * Boot pulls /api/auth/me + /api/settings + /api/ai/config + /api/srs/state
 * + /api/progress + /api/vocab in parallel and populates window.Store.state.
 * After that, views read state synchronously and mutations call PUTs with
 * fire-and-forget POSTs.
 *
 * Phase 1: active_level, settings, voice_pref, register, simple_ui.
 * Phase 2: items (SRS state), xp, streak, achievements, history,
 *          markSeen mutation with XP back-sync, vocabulary cache.
 */
(function () {
  const TODAY = () => new Date().toISOString().slice(0, 10);

  const LEVELS = ["A1", "A2", "B1", "B2", "C1"];
  const LEVEL_META = {
    A1: { id: "A1", label: "A1", title: "Débutant",         color: "#22c55e" },
    A2: { id: "A2", label: "A2", title: "Élémentaire",      color: "#84cc16" },
    B1: { id: "B1", label: "B1", title: "Intermédiaire",    color: "#eab308" },
    B2: { id: "B2", label: "B2", title: "Avancé",           color: "#f97316" },
    C1: { id: "C1", label: "C1", title: "Autonome",         color: "#ef4444" },
  };

  const XP_RULES = { easy: 5, good: 3, correct: 3, hard: 1, wrong: 1 };
  const XP_DAILY_BONUS = 10;

  const ACHIEVEMENT_DEFS = [
    // A1-tier (§B.10 of the implementation plan)
    { id: "bonjour",         name: "Bonjour",           desc: "Première connexion." },
    { id: "premier-mot",     name: "Premier mot",       desc: "1 item correctement noté." },
    { id: "cinquante-mots",  name: "Cinquante mots",    desc: "50 items maîtrisés (vak ≥ 3)." },
    { id: "cent-mots",       name: "Cent mots",         desc: "100 items maîtrisés." },
    { id: "une-semaine",     name: "Une semaine",       desc: "7 jours d'affilée." },
    { id: "premier-er",      name: "Premier -er",       desc: "Premier verbe -er entièrement conjugué." },
    // Cross-level
    { id: "first-session",   name: "Première session",  desc: "Un item récupéré." },
    { id: "month-streak",    name: "Un mois",           desc: "30 jours d'affilée." },
    { id: "vault-50",        name: "Coffre I",          desc: "50 items en boîte 5." },
    { id: "vault-250",       name: "Coffre II",         desc: "250 items en boîte 5." },
    { id: "perfectionist",   name: "Sans faute",        desc: "100 % sur un test mélangé (≥ 10 questions)." },
    { id: "daily-goal",      name: "Objectif atteint",  desc: "20 + récupérations en un seul jour." },
    { id: "thousand",        name: "Mille",             desc: "1000 récupérations au total." },
    { id: "polyglot",        name: "Tous niveaux",      desc: "Items vus aux niveaux A1, A2, B1." },
  ];

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
    // Phase 2 additions:
    items: {},                    // SRS state: itemId → {box, seen, correct, wrong, lastSeen, due, starred}
    xp: 0,
    streak: { lastDay: null, count: 0, best: 0 },
    achievements: {},
    history: {},                  // day → {right, wrong, sessions, modes}
    sessionStats: { today: { right: 0, wrong: 0, day: TODAY() } },
    vocab: [],                    // flat list pulled from /api/vocab
  };

  const state = structuredClone(defaultState);

  async function boot() {
    const [me, settings, aiConfig, srs, progress, vocab] = await Promise.all([
      window.API.get("/api/auth/me"),
      window.API.get("/api/settings"),
      window.API.get("/api/ai/config").catch(() => defaultState.aiConfig),
      window.API.get("/api/srs/state").catch(() => ({ items: {} })),
      window.API.get("/api/progress").catch(() => ({ xp: 0, streak: defaultState.streak, achievements: {}, history: {} })),
      window.API.get("/api/vocab?page_size=500").catch(() => ({ items: [] })),
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
    state.items = srs.items || {};
    state.xp = progress.xp || 0;
    state.streak = progress.streak || defaultState.streak;
    state.achievements = progress.achievements || {};
    state.history = progress.history || {};
    state.vocab = vocab.items || [];

    applyBodyClass();
    document.dispatchEvent(new CustomEvent("store-ready", { detail: { state } }));

    // First-login achievement (cheap fire-and-forget, idempotent).
    unlockAchievement("bonjour");
  }

  // ---- Vocab cache helpers ----
  function vocabFiltered({ levelsAllowed, strict, coreOnly } = {}) {
    let arr = state.vocab;
    if (strict) {
      arr = arr.filter((it) => it.level === state.activeLevel);
    } else if (levelsAllowed) {
      arr = arr.filter((it) => levelsAllowed.includes(it.level));
    } else {
      // Default: at-or-below active level — you don't forget A1 once you're at B1.
      const idx = LEVELS.indexOf(state.activeLevel);
      const allowed = LEVELS.slice(0, idx + 1);
      arr = arr.filter((it) => allowed.includes(it.level));
    }
    if (coreOnly) arr = arr.filter((it) => it.core);
    return arr;
  }

  // ---- SRS item helpers ----
  function getItem(id) {
    if (!state.items[id]) {
      state.items[id] = {
        box: 1, seen: 0, correct: 0, wrong: 0,
        lastSeen: null, due: TODAY(), starred: false,
      };
    }
    return state.items[id];
  }

  function dayBucket(day) {
    if (!state.history[day]) {
      state.history[day] = { right: 0, wrong: 0, sessions: 0, modes: {} };
    }
    return state.history[day];
  }

  // ---- markSeen: the core mutation ----
  function markSeen(id, outcome) {
    const p = getItem(id);
    p.seen += 1;
    p.lastSeen = new Date().toISOString();
    if (outcome === "hard" || outcome === "wrong") {
      p.wrong += 1;
      p.box = 1;
    } else if (outcome === "good" || outcome === "correct") {
      p.correct += 1;
      p.box = Math.min(5, p.box + 1);
    } else if (outcome === "easy") {
      p.correct += 1;
      p.box = Math.min(5, p.box + 2);
    }
    p.due = window.SRS.nextDueFor(p.box);

    const today = TODAY();
    const bucket = dayBucket(today);
    const firstOfDay = bucket.right + bucket.wrong === 0;
    const xpDelta = (XP_RULES[outcome] || 0) + (firstOfDay ? XP_DAILY_BONUS : 0);
    state.xp += xpDelta;

    if (state.sessionStats.today.day !== today) {
      state.sessionStats.today = { right: 0, wrong: 0, day: today };
    }
    if (outcome === "easy" || outcome === "good" || outcome === "correct") {
      bucket.right += 1;
      state.sessionStats.today.right += 1;
    } else {
      bucket.wrong += 1;
      state.sessionStats.today.wrong += 1;
    }

    bumpStreakLocal();
    checkAchievements();

    // Fire-and-forget sync to server (server is authoritative for XP / streak).
    window.API.post("/api/srs/review", { itemId: id, outcome }).catch(() => {});
    if (xpDelta) {
      window.API.post("/api/progress/bump-xp", { add: xpDelta }).then((r) => {
        if (r && typeof r.xp === "number") state.xp = r.xp;
        if (r && r.streak) state.streak = r.streak;
        document.dispatchEvent(new CustomEvent("xp-changed", { detail: { xp: state.xp, streak: state.streak } }));
      }).catch(() => {});
    }
  }

  function recordSessionStart(mode) {
    const today = TODAY();
    const bucket = dayBucket(today);
    bucket.sessions += 1;
    bucket.modes[mode] = (bucket.modes[mode] || 0) + 1;
    window.API.post("/api/srs/session-start", { mode }).catch(() => {});
  }

  function toggleStar(id) {
    const p = getItem(id);
    p.starred = !p.starred;
    window.API.post("/api/srs/star", { itemId: id }).catch(() => {});
    return p.starred;
  }

  function bumpStreakLocal() {
    const today = TODAY();
    if (state.streak.lastDay === today) return;
    if (!state.streak.lastDay) {
      state.streak = { lastDay: today, count: 1, best: 1 };
      return;
    }
    const last = new Date(state.streak.lastDay);
    const t = new Date(today);
    const days = Math.round((t - last) / 86400000);
    const count = days === 1 ? state.streak.count + 1 : 1;
    state.streak = {
      lastDay: today, count,
      best: Math.max(state.streak.best || 0, count),
    };
  }

  function unlockAchievement(id) {
    if (state.achievements[id]) return false;
    state.achievements[id] = { date: new Date().toISOString() };
    window.API.post("/api/progress/unlock", { ids: [id] }).catch(() => {});
    document.dispatchEvent(new CustomEvent("achievement", { detail: { id } }));
    return true;
  }

  function checkAchievements() {
    const items = state.vocab;
    const seen = items.filter((it) => state.items[it.id] && state.items[it.id].seen > 0);
    const mastered = items.filter((it) => state.items[it.id] && state.items[it.id].box >= 3);
    const masteredHigh = items.filter((it) => state.items[it.id] && state.items[it.id].box === 5);
    const today = TODAY();
    const todayBucket = state.history[today];

    if (seen.length >= 1) unlockAchievement("premier-mot");
    if (seen.length >= 1) unlockAchievement("first-session");
    if (mastered.length >= 50) unlockAchievement("cinquante-mots");
    if (mastered.length >= 100) unlockAchievement("cent-mots");
    if (state.streak.count >= 7) unlockAchievement("une-semaine");
    if (state.streak.count >= 30) unlockAchievement("month-streak");
    if (masteredHigh.length >= 50) unlockAchievement("vault-50");
    if (masteredHigh.length >= 250) unlockAchievement("vault-250");
    if (todayBucket && (todayBucket.right + todayBucket.wrong) >= 20) unlockAchievement("daily-goal");
    const totalRetrievals = Object.values(state.history).reduce((a, h) => a + h.right + h.wrong, 0);
    if (totalRetrievals >= 1000) unlockAchievement("thousand");
    const levelsSeen = new Set(seen.map((it) => it.level));
    if (["A1", "A2", "B1"].every((l) => levelsSeen.has(l))) unlockAchievement("polyglot");
  }

  // ---- Active level ----
  async function setActiveLevel(level) {
    const prev = state.activeLevel;
    if (!LEVELS.includes(level) || level === prev) return;
    state.activeLevel = level;
    applyBodyClass();
    // Bump playback rate up when leaving A1/A2 — beginners get slow speech.
    if (["B1","B2","C1"].includes(level) && state.settings.playbackRate < 1.0) {
      state.settings.playbackRate = 1.0;
    } else if (["A1","A2"].includes(level) && state.settings.playbackRate >= 1.0) {
      state.settings.playbackRate = 0.85;
    }
    document.dispatchEvent(new CustomEvent("level-changed", { detail: { level, prev } }));
    try {
      await window.API.put("/api/settings/active_level", { level });
    } catch (e) {
      state.activeLevel = prev;
      applyBodyClass();
      document.dispatchEvent(new CustomEvent("level-changed", { detail: { level: prev, prev: level } }));
      throw e;
    }
  }

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
    document.dispatchEvent(new CustomEvent("simple-ui-changed"));
    try { await window.API.put("/api/settings/simple_ui", { simple_ui: state.simpleUi }); }
    catch (e) {}
  }

  async function setRegister(reg) {
    if (!["tu", "vous"].includes(reg) || reg === state.register) return;
    state.register = reg;
    document.dispatchEvent(new CustomEvent("register-changed"));
    try { await window.API.put("/api/settings/register", { register: reg }); }
    catch (e) {}
  }

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
    getItem, markSeen, toggleStar, recordSessionStart, unlockAchievement,
    vocabFiltered,
    today: TODAY,
    LEVELS, LEVEL_META, ACHIEVEMENT_DEFS,
  };
})();
