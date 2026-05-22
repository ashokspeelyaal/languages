/* Persistent state in localStorage. */
(function () {
  const KEY = "b2vocab.v1"; // keep same key; we forward-fill new fields
  const TODAY = () => new Date().toISOString().slice(0, 10);

  // XP per outcome (capped at 5 to keep gains modest and honest)
  const XP_RULES = { easy: 5, good: 3, correct: 3, hard: 1, wrong: 1 };
  const XP_DAILY_BONUS = 10; // once per day, first retrieval
  const LEVELS = [
    { level: 1, name: "Beginnend", xp: 0 },
    { level: 2, name: "Lezer", xp: 100 },
    { level: 3, name: "Spreker", xp: 500 },
    { level: 4, name: "Verteller", xp: 1500 },
    { level: 5, name: "Meester", xp: 4000 },
    { level: 6, name: "Geleerde", xp: 10000 },
  ];

  const defaultState = {
    schemaVersion: 2,
    items: {},
    streak: { lastDay: null, count: 0, best: 0 },
    history: {}, // ISO date -> { right, wrong, sessions, modes: {mode:n} }
    xp: 0,
    achievements: {}, // id -> { date: ISO }
    settings: {
      direction: "nl-en",
      levels: ["A2", "B1", "B2", "C1"],
      sessionSize: 15,
      categoryFilter: null,
      coreOnly: false,
      // AI
      apiKey: "",
      aiModel: "gpt-5-mini",
      aiEnabled: true,
      aiSoftLimit: 50, // soft warning threshold per day
      // Audio (exam + listening)
      ttsProvider: "openai",          // "openai" | "azure"
      ttsModel: "gpt-4o-mini-tts",
      ttsVoice: "shimmer",
      sttModel: "gpt-4o-mini-transcribe",
      // Azure Speech (for Vlaams voices)
      azureKey: "",
      azureRegion: "westeurope",
      azureVoice: "nl-BE-DenaNeural",
      azureRate: "-10%",
      // Listening defaults
      outputLanguage: "Dutch (Belgian / Standard Dutch register)",
      durationMinutes: 2.5,
    },
    sessionStats: { today: { right: 0, wrong: 0, day: TODAY() } },
    aiCallsByDay: {}, // ISO date → { total, byKind: { explain: n, ... } }
    aiCache: {}, // hash → { response, ts, model }
  };

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return structuredClone(defaultState);
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return structuredClone(defaultState);
      const merged = Object.assign(structuredClone(defaultState), parsed, {
        settings: Object.assign({}, defaultState.settings, parsed.settings || {}),
        sessionStats: Object.assign({}, defaultState.sessionStats, parsed.sessionStats || {}),
        items: (parsed.items && typeof parsed.items === "object") ? parsed.items : {},
        streak: Object.assign({}, defaultState.streak, parsed.streak || {}),
        history: (parsed.history && typeof parsed.history === "object") ? parsed.history : {},
        achievements: (parsed.achievements && typeof parsed.achievements === "object") ? parsed.achievements : {},
        xp: typeof parsed.xp === "number" ? parsed.xp : 0,
        aiCallsByDay: (parsed.aiCallsByDay && typeof parsed.aiCallsByDay === "object") ? parsed.aiCallsByDay : {},
        aiCache: (parsed.aiCache && typeof parsed.aiCache === "object") ? parsed.aiCache : {},
      });
      // Forward-migration: ensure any newly added levels are enabled by default
      const lvls = new Set(merged.settings.levels || []);
      ["A2", "B1", "B2", "C1"].forEach((l) => {
        if (!parsed.settings || !parsed.settings.levels || !parsed.settings.levels.includes(l)) {
          // Only auto-add if this level wasn't explicitly disabled (i.e. settings.levels didn't exist yet for it)
          if (!parsed.settings || !parsed.settings.levels) lvls.add(l);
          else if (l === "C1" && !parsed.settings.levels.includes("C1")) lvls.add(l);
        }
      });
      merged.settings.levels = Array.from(lvls);
      return merged;
    } catch (e) {
      console.warn("State load failed, resetting:", e);
      return structuredClone(defaultState);
    }
  }

  function save() {
    localStorage.setItem(KEY, JSON.stringify(state));
  }

  const state = load();

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

    // XP
    const today = TODAY();
    const bucket = dayBucket(today);
    const firstOfDay = bucket.right + bucket.wrong === 0;
    state.xp += (XP_RULES[outcome] || 0) + (firstOfDay ? XP_DAILY_BONUS : 0);

    // daily history
    if (outcome === "easy" || outcome === "good" || outcome === "correct") {
      bucket.right += 1;
      state.sessionStats.today = state.sessionStats.today.day === today
        ? state.sessionStats.today
        : { right: 0, wrong: 0, day: today };
      state.sessionStats.today.right += 1;
    } else {
      bucket.wrong += 1;
      state.sessionStats.today = state.sessionStats.today.day === today
        ? state.sessionStats.today
        : { right: 0, wrong: 0, day: today };
      state.sessionStats.today.wrong += 1;
    }

    bumpStreak();
    checkAchievements();
    save();
  }

  function recordSessionStart(mode) {
    const today = TODAY();
    const bucket = dayBucket(today);
    bucket.sessions += 1;
    bucket.modes[mode] = (bucket.modes[mode] || 0) + 1;
    save();
  }

  function recordQuizResult(mode, total, right) {
    // Track perfect-mixed-quiz achievement
    if (mode === "mixed" && total > 0 && right === total && total >= 10) {
      unlockAchievement("perfectionist");
    }
    save();
  }

  function toggleStar(id) {
    const p = getItem(id);
    p.starred = !p.starred;
    save();
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
      lastDay: today,
      count,
      best: Math.max(state.streak.best || 0, count),
    };
  }

  /* ====== Achievements ====== */
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

  function unlockAchievement(id) {
    if (state.achievements[id]) return false;
    state.achievements[id] = { date: new Date().toISOString() };
    return true;
  }

  function checkAchievements() {
    const items = window.VOCAB_DATA.items;
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

    // Mode explorer: did we ever run all four modes?
    const allModes = new Set();
    Object.values(state.history).forEach((h) => Object.keys(h.modes || {}).forEach((m) => allModes.add(m)));
    if (["flashcards", "typed", "cloze", "mixed"].every((m) => allModes.has(m))) {
      unlockAchievement("mode-explorer");
    }

    // Tri-level
    const levelsSeen = new Set(seen.map((it) => it.level));
    if (["A2", "B1", "B2"].every((l) => levelsSeen.has(l))) {
      unlockAchievement("polyglot");
    }

    // Comeback: lastDay before today wasn't yesterday, but a streak existed
    if (state.streak.count === 1 && state.streak.best >= 2) {
      // streak just reset → user is returning
      unlockAchievement("comeback");
    }
  }

  function levelFor(xp) {
    let cur = LEVELS[0];
    let next = LEVELS[1] || null;
    for (let i = 0; i < LEVELS.length; i++) {
      if (xp >= LEVELS[i].xp) {
        cur = LEVELS[i];
        next = LEVELS[i + 1] || null;
      }
    }
    return { current: cur, next };
  }

  function reset() {
    if (!confirm("Echt alles wissen? Alle voortgang gaat verloren.")) return;
    localStorage.removeItem(KEY);
    location.reload();
  }

  function exportJSON() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `b2-vocab-progress-${TODAY()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  window.Store = {
    state, save, load,
    getItem, markSeen, toggleStar,
    recordSessionStart, recordQuizResult,
    levelFor, ACHIEVEMENT_DEFS, LEVELS,
    reset, exportJSON,
    today: TODAY,
  };
})();
