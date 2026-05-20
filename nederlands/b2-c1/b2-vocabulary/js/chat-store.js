/* ChatStore — multi-thread chat persistence, localStorage-backed.
 * All chat reads/writes go through this module. Swap the backend here later
 * (IndexedDB, OPFS, …) without touching ai-views.js. */
(function () {
  const CHATS_KEY  = "b2vocab.chats.v1";
  const ACTIVE_KEY = "b2vocab.chats.active";
  const LEGACY_KEY = "b2vocab.chatHistory"; // pre-multi-chat single thread

  function nowISO() { return new Date().toISOString(); }
  function makeId() {
    return "chat-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 7);
  }

  function readChats() {
    try {
      const raw = localStorage.getItem(CHATS_KEY);
      if (!raw) return [];
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch (e) {
      console.warn("ChatStore read failed:", e);
      return [];
    }
  }

  function writeChats(chats) {
    localStorage.setItem(CHATS_KEY, JSON.stringify(chats));
  }

  function migrateLegacy() {
    // One-time: if the old single-history exists, lift it into a chat
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (!legacy) return;
    try {
      const messages = JSON.parse(legacy);
      if (Array.isArray(messages) && messages.length) {
        const chats = readChats();
        chats.push({
          id: makeId(),
          title: "Eerste gesprek",
          createdAt: nowISO(),
          updatedAt: nowISO(),
          messages,
          autoTitled: false,
        });
        writeChats(chats);
      }
    } catch (e) {}
    localStorage.removeItem(LEGACY_KEY);
  }

  function list() {
    const chats = readChats();
    return chats.slice().sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
  }

  function get(id) {
    return readChats().find((c) => c.id === id) || null;
  }

  function create(title) {
    const chats = readChats();
    const chat = {
      id: makeId(),
      title: title || "Nieuw gesprek",
      createdAt: nowISO(),
      updatedAt: nowISO(),
      messages: [],
      autoTitled: false,
    };
    chats.push(chat);
    writeChats(chats);
    setActiveId(chat.id);
    return chat;
  }

  function update(id, patch) {
    const chats = readChats();
    const i = chats.findIndex((c) => c.id === id);
    if (i < 0) return null;
    chats[i] = Object.assign({}, chats[i], patch, { updatedAt: nowISO() });
    writeChats(chats);
    return chats[i];
  }

  function remove(id) {
    const chats = readChats().filter((c) => c.id !== id);
    writeChats(chats);
    if (getActiveId() === id) {
      const first = chats[0];
      setActiveId(first ? first.id : null);
    }
  }

  function appendMessage(id, msg) {
    const chat = get(id);
    if (!chat) return null;
    chat.messages = chat.messages || [];
    chat.messages.push(msg);
    return update(id, { messages: chat.messages });
  }

  function setTitle(id, title) {
    return update(id, { title: title.slice(0, 80), autoTitled: true });
  }

  function getActiveId() {
    return localStorage.getItem(ACTIVE_KEY);
  }

  function setActiveId(id) {
    if (id) localStorage.setItem(ACTIVE_KEY, id);
    else localStorage.removeItem(ACTIVE_KEY);
  }

  // Get-or-create the currently active chat
  function getOrCreateActive() {
    const id = getActiveId();
    if (id) {
      const c = get(id);
      if (c) return c;
    }
    // Fall back to most-recent existing chat, else create one
    const all = list();
    if (all.length) {
      setActiveId(all[0].id);
      return all[0];
    }
    return create();
  }

  /* ============ Export / Import ============ */
  function exportAll() {
    const data = {
      schema: "b2vocab-chats",
      version: 1,
      exportedAt: nowISO(),
      chats: readChats(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `b2vocab-chats-${nowISO().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Import: merge|replace. Returns count imported.
   * Format: { schema:"b2vocab-chats", chats:[...] } OR a bare array of chats.
   */
  function importChats(json, mode) {
    let chatsIn;
    if (Array.isArray(json)) chatsIn = json;
    else if (json && Array.isArray(json.chats)) chatsIn = json.chats;
    else throw new Error("Onbekend exportformaat.");

    const valid = chatsIn.filter((c) => c && typeof c === "object" && Array.isArray(c.messages));
    if (!valid.length) throw new Error("Geen geldige chats gevonden in dit bestand.");

    let current = mode === "replace" ? [] : readChats();
    const existingIds = new Set(current.map((c) => c.id));
    let added = 0;
    valid.forEach((c) => {
      // Re-id collisions to avoid duplicates
      let id = c.id || makeId();
      while (existingIds.has(id)) id = makeId();
      existingIds.add(id);
      current.push({
        id,
        title: c.title || "Geïmporteerd gesprek",
        createdAt: c.createdAt || nowISO(),
        updatedAt: c.updatedAt || nowISO(),
        messages: c.messages,
        autoTitled: !!c.autoTitled,
      });
      added += 1;
    });
    writeChats(current);
    return added;
  }

  function deleteAll() {
    writeChats([]);
    setActiveId(null);
  }

  // Run migration once on load
  migrateLegacy();

  window.ChatStore = {
    list, get, create, update, remove,
    appendMessage, setTitle,
    getActiveId, setActiveId, getOrCreateActive,
    exportAll, importChats, deleteAll,
  };
})();
