/* State store — server-backed with synchronous local cache.
 *
 * Design: on boot, Store.boot() pulls /api/srs/state, /api/settings,
 * /api/progress, and /api/ai/config in parallel and populates Store.state.
 * After that, views read Store.state synchronously like before. Mutations
 * (markSeen, save) update the cache and fire-and-forget POSTs to the server.
 * If a POST fails the local cache is still consistent; we'll re-sync on next boot.
 *
 * VOCAB_DATA.items is populated similarly from /api/vocab + /api/custom-vocab.
 */
(function () {
  const TODAY = () => new Date().toISOString().slice(0, 10);

  const XP_RULES = { easy: 5, good: 3, correct: 3, hard: 1, wrong: 1 };
  const XP_DAILY_BONUS = 10;
  const LEVELS = [
    { level: 1, name: "Beginnend", xp: 0 },
    { level: 2, name: "Lezer", xp: 100 },
    { level: 3, name: "Spreker", xp: 500 },
    { level: 4, name: "Verteller", xp: 1500 },
    { level: 5, name: "Meester", xp: 4000 },
    { level: 6, name: "Geleerde", xp: 10000 },
  ];

  const ACHIEVEMENT_DEFS = [
    { id: "first-session",  name: "Eerste stap",       en: "First steps",         desc: "Eén item opgehaald.",                    enDesc: "Your first retrieval." },
    { id: "week-streak",    name: "Weekvast",          en: "Week strong",         desc: "Zeven dagen op rij.",                    enDesc: "Seven days in a row." },
    { id: "month-streak",   name: "Maandvast",         en: "Month strong",        desc: "Dertig dagen op rij.",                   enDesc: "Thirty days in a row." },
    { id: "century",        name: "Honderd gezien",    en: "Centurion",           desc: "100 unieke items minstens één keer gezien.", enDesc: "100 unique items seen at least once." },
    { id: "vault-50",       name: "Kluis I",           en: "Vault keeper",        desc: "50 items in vak 5.",                     enDesc: "50 items in box 5." },
    { id: "vault-250",      name: "Kluis II",          en: "Master vault",        desc: "250 items in vak 5.",                    enDesc: "250 items in box 5." },
    { id: "mode-explorer",  name: "Veelzijdig",        en: "Mode explorer",       desc: "Alle vier de oefenmodi geprobeerd.",     enDesc: "Tried all four practice modes." },
    { id: "perfectionist",  name: "Perfect",           en: "Perfectionist",       desc: "100% op een Gemengde toets (≥10 vragen).", enDesc: "100% on a Mixed quiz (≥10 questions)." },
    { id: "daily-goal",     name: "Dagdoel",           en: "Daily goal",          desc: "20+ ophaalbeurten op één dag.",          enDesc: "20+ retrievals in a single day." },
    { id: "thousand",       name: "Duizendmaal",       en: "Thousandfold",        desc: "1000 ophaalbeurten totaal.",             enDesc: "1000 total retrievals." },
    { id: "comeback",       name: "Terug van weggeweest", en: "Comeback",         desc: "Hervat na minstens 3 dagen pauze.",      enDesc: "Returned after a 3+ day break." },
    { id: "polyglot",       name: "Drietalig",         en: "Tri-level",           desc: "Items op A2, B1 én B2 gezien.",          enDesc: "Items seen at A2, B1 and B2 levels." },
  ];

  const defaultState = {
    items: {},
    streak: { lastDay: null, count: 0, best: 0 },
    history: {},
    xp: 0,
    achievements: {},
    settings: {
      direction: "nl-en",
      levels: ["A2", "B1", "B2", "C1"],
      sessionSize: 15,
      categoryFilter: null,
      coreOnly: false,
      aiModel: "gpt-5.4-mini",
      aiContentModel: "gpt-5.4",
      aiEnabled: true,
      aiSoftLimit: 50,
      ttsProvider: "openai",
      ttsModel: "gpt-4o-mini-tts",
      ttsVoice: "shimmer",
      sttModel: "gpt-4o-mini-transcribe",
      azureRegion: "westeurope",
      azureVoice: "nl-BE-DenaNeural",
      azureRate: "-10%",
      outputLanguage: "Dutch (Belgian / Standard Dutch register)",
      durationMinutes: 2.5,
      speechRate: 0.95,
    },
    sessionStats: { today: { right: 0, wrong: 0, day: TODAY() } },
    aiCallsByDay: {},
    aiCache: {},  // in-memory only — not persisted
    aiConfig: { openai: false, azure: false, azureRegion: "westeurope" },
  };

  const state = structuredClone(defaultState);

  // Debounced settings PUT so a flurry of toggles doesn't spam the server.
  let settingsTimer = null;
  function persistSettingsSoon() {
    clearTimeout(settingsTimer);
    settingsTimer = setTimeout(() => {
      window.API.put("/api/settings", state.settings).catch(() => {});
    }, 500);
  }

  // Same for progress (xp / achievements / aiCallsByDay).
  function bumpXpSoon(add) {
    window.API.post("/api/progress/bump-xp", { add }).then((r) => {
      if (r && typeof r.xp === "number") state.xp = r.xp;
      if (r && r.streak) state.streak = r.streak;
    }).catch(() => {});
  }

  async function boot() {
    const [srs, settings, progress, aiConfig, usage] = await Promise.all([
      window.API.get("/api/srs/state").catch(() => ({ items: {} })),
      window.API.get("/api/settings").catch(() => ({ settings: defaultState.settings })),
      window.API.get("/api/progress").catch(() => ({ xp: 0, streak: defaultState.streak, achievements: {}, history: {} })),
      window.API.get("/api/ai/config").catch(() => defaultState.aiConfig),
      window.API.get("/api/ai/usage").catch(() => ({ byDay: {}, todayTotal: 0 })),
    ]);
    state.items = srs.items || {};
    Object.assign(state.settings, defaultState.settings, settings.settings || {});
    state.xp = progress.xp || 0;
    state.streak = progress.streak || defaultState.streak;
    state.achievements = progress.achievements || {};
    state.history = progress.history || {};
    state.aiConfig = aiConfig || defaultState.aiConfig;
    state.aiCallsByDay = usage.byDay || {};
  }

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

    if (outcome === "easy" || outcome === "good" || outcome === "correct") {
      bucket.right += 1;
      if (state.sessionStats.today.day !== today) state.sessionStats.today = { right: 0, wrong: 0, day: today };
      state.sessionStats.today.right += 1;
    } else {
      bucket.wrong += 1;
      if (state.sessionStats.today.day !== today) state.sessionStats.today = { right: 0, wrong: 0, day: today };
      state.sessionStats.today.wrong += 1;
    }

    bumpStreak();
    checkAchievements();

    // Fire-and-forget background sync to the server.
    window.API.post("/api/srs/review", { itemId: id, outcome }).catch(() => {});
    if (xpDelta) bumpXpSoon(xpDelta);
  }

  function recordSessionStart(mode) {
    const today = TODAY();
    const bucket = dayBucket(today);
    bucket.sessions += 1;
    bucket.modes[mode] = (bucket.modes[mode] || 0) + 1;
    window.API.post("/api/srs/session-start", { mode }).catch(() => {});
  }

  function recordQuizResult(mode, total, right) {
    if (mode === "mixed" && total > 0 && right === total && total >= 10) {
      unlockAchievement("perfectionist");
    }
  }

  function toggleStar(id) {
    const p = getItem(id);
    p.starred = !p.starred;
    window.API.post("/api/srs/star", { itemId: id }).catch(() => {});
    return p.starred;
  }

  function bumpStreak() {
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
    return true;
  }

  function checkAchievements() {
    const items = (window.VOCAB_DATA && window.VOCAB_DATA.items) || [];
    const seen = items.filter((it) => state.items[it.id] && state.items[it.id].seen > 0);
    const mastered = items.filter((it) => state.items[it.id] && state.items[it.id].box === 5);
    const today = TODAY();
    const todayBucket = state.history[today];

    if (seen.length >= 1) unlockAchievement("first-session");
    if (state.streak.count >= 7) unlockAchievement("week-streak");
    if (state.streak.count >= 30) unlockAchievement("month-streak");
    if (seen.length >= 100) unlockAchievement("century");
    if (mastered.length >= 50) unlockAchievement("vault-50");
    if (mastered.length >= 250) unlockAchievement("vault-250");
    if (todayBucket && (todayBucket.right + todayBucket.wrong) >= 20) unlockAchievement("daily-goal");
    const totalRetrievals = Object.values(state.history).reduce((a, h) => a + h.right + h.wrong, 0);
    if (totalRetrievals >= 1000) unlockAchievement("thousand");
    const allModes = new Set();
    Object.values(state.history).forEach((h) => Object.keys(h.modes || {}).forEach((m) => allModes.add(m)));
    if (["flashcards", "typed", "cloze", "mixed"].every((m) => allModes.has(m))) {
      unlockAchievement("mode-explorer");
    }
    const levelsSeen = new Set(seen.map((it) => it.level));
    if (["A2", "B1", "B2"].every((l) => levelsSeen.has(l))) {
      unlockAchievement("polyglot");
    }
    if (state.streak.count === 1 && state.streak.best >= 2) {
      unlockAchievement("comeback");
    }
  }

  function levelFor(xp) {
    let cur = LEVELS[0]; let next = LEVELS[1] || null;
    for (let i = 0; i < LEVELS.length; i++) {
      if (xp >= LEVELS[i].xp) { cur = LEVELS[i]; next = LEVELS[i + 1] || null; }
    }
    return { current: cur, next };
  }

  // save() is preserved as a no-op for compatibility — most call sites
  // were just nudging localStorage. Settings have their own debounced sync.
  function save() {
    persistSettingsSoon();
  }

  async function reset() {
    if (!confirm("Echt alles wissen? Alle voortgang gaat verloren.")) return;
    await window.API.post("/api/progress/reset", {}).catch(() => {});
    location.reload();
  }

  function exportJSON() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `b2-vocab-progress-${TODAY()}.json`; a.click();
    URL.revokeObjectURL(url);
  }

  window.Store = {
    state, save, boot,
    getItem, markSeen, toggleStar,
    recordSessionStart, recordQuizResult,
    levelFor, ACHIEVEMENT_DEFS, LEVELS,
    reset, exportJSON,
    today: TODAY,
    persistSettingsSoon,
  };
})();
