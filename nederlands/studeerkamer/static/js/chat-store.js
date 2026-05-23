/* ChatStore — server-backed. Same surface as the original.
 *
 * Hydrated on boot via ChatStore.boot(). After that:
 * - list/get return synchronously from the in-memory cache
 * - create/update/remove update the cache + fire background server calls
 * - appendMessage updates the cache + POSTs the single message to the server
 *
 * For now the active chat id is also kept in localStorage just for UI
 * persistence across reloads — it's a UI hint, not data. */
(function () {
  const ACTIVE_KEY = "studeerkamer.chats.active";
  let chats = [];          // sorted desc by updatedAt
  let booted = false;

  function nowISO() { return new Date().toISOString(); }
  function makeId() { return "chat-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 7); }
  function bg(p) { return Promise.resolve(p).catch(() => {}); }

  async function boot() {
    if (booted) return;
    booted = true;
    try {
      const r = await window.API.get("/api/chats");
      // Server's list endpoint now returns chats with their full message
      // arrays, matching the original localStorage-blob behaviour.
      chats = (r.chats || []).map((c) => ({ ...c, messages: c.messages || [], _messagesLoaded: true }));
    } catch (e) { chats = []; }
  }

  // List doesn't fetch messages; full chat (with messages) is loaded on demand.
  function list() {
    return chats.slice().sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
  }
  function get(id) { return chats.find((c) => c.id === id) || null; }

  async function loadMessages(id) {
    const c = get(id);
    if (!c) return null;
    if (c._messagesLoaded) return c;
    try {
      const r = await window.API.get("/api/chats/" + encodeURIComponent(id));
      if (r && r.chat) {
        c.messages = r.chat.messages || [];
        c.title = r.chat.title;
        c.updatedAt = r.chat.updatedAt;
        c.autoTitled = r.chat.autoTitled;
        c._messagesLoaded = true;
      }
    } catch (e) {}
    return c;
  }

  function create(title) {
    const chat = {
      id: makeId(),
      title: title || "Nieuw gesprek",
      createdAt: nowISO(),
      updatedAt: nowISO(),
      messages: [],
      autoTitled: false,
      _messagesLoaded: true,
    };
    chats.unshift(chat);
    setActiveId(chat.id);
    bg(window.API.post("/api/chats", { id: chat.id, title: chat.title }));
    return chat;
  }

  function update(id, patch) {
    const c = get(id);
    if (!c) return null;
    Object.assign(c, patch, { updatedAt: nowISO() });
    const allowed = { title: c.title, autoTitled: !!c.autoTitled };
    bg(window.API.patch("/api/chats/" + encodeURIComponent(id), allowed));
    // The "Wis" button passes { messages: [] } to clear history. Server
    // PATCH only accepts title/autoTitled, so we must also call the
    // dedicated clear endpoint to persist the wipe.
    if (Array.isArray(patch.messages) && patch.messages.length === 0) {
      bg(window.API.del("/api/chats/" + encodeURIComponent(id) + "/messages"));
    }
    return c;
  }

  function remove(id) {
    chats = chats.filter((c) => c.id !== id);
    if (getActiveId() === id) setActiveId(chats[0] ? chats[0].id : null);
    bg(window.API.del("/api/chats/" + encodeURIComponent(id)));
  }

  function appendMessage(id, msg) {
    const c = get(id);
    if (!c) return null;
    c.messages = c.messages || [];
    c.messages.push(msg);
    c.updatedAt = nowISO();
    bg(window.API.post("/api/chats/" + encodeURIComponent(id) + "/messages", msg));
    return c;
  }

  function setTitle(id, title) { return update(id, { title: (title || "").slice(0, 80), autoTitled: true }); }
  function getActiveId() { return localStorage.getItem(ACTIVE_KEY); }
  function setActiveId(id) {
    if (id) localStorage.setItem(ACTIVE_KEY, id);
    else localStorage.removeItem(ACTIVE_KEY);
  }

  function getOrCreateActive() {
    const id = getActiveId();
    if (id) { const c = get(id); if (c) return c; }
    const all = list();
    if (all.length) { setActiveId(all[0].id); return all[0]; }
    return create();
  }

  function exportAll() {
    const data = { schema: "b2vocab-chats", version: 1, exportedAt: nowISO(), chats };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `b2vocab-chats-${nowISO().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }
  function deleteAll() {
    chats = [];
    setActiveId(null);
    bg(window.API.del("/api/chats"));
  }
  function importChats(json, mode) {
    let chatsIn;
    if (Array.isArray(json)) chatsIn = json;
    else if (json && Array.isArray(json.chats)) chatsIn = json.chats;
    else throw new Error("Onbekend exportformaat.");
    const valid = chatsIn.filter((c) => c && typeof c === "object" && Array.isArray(c.messages));
    if (!valid.length) throw new Error("Geen geldige chats gevonden.");
    if (mode === "replace") { chats = []; }
    let added = 0;
    valid.forEach((c) => {
      const id = c.id || makeId();
      const local = {
        id,
        title: c.title || "Geïmporteerd gesprek",
        createdAt: c.createdAt || nowISO(),
        updatedAt: c.updatedAt || nowISO(),
        messages: c.messages,
        autoTitled: !!c.autoTitled,
        _messagesLoaded: true,
      };
      chats.unshift(local);
      bg(window.API.post("/api/chats", { id, title: local.title }).then(() => {
        // Replay messages individually.
        (c.messages || []).forEach((m) => {
          bg(window.API.post("/api/chats/" + encodeURIComponent(id) + "/messages", m));
        });
      }));
      added += 1;
    });
    return added;
  }

  window.ChatStore = {
    boot, list, get, loadMessages, create, update, remove,
    appendMessage, setTitle, getActiveId, setActiveId, getOrCreateActive,
    exportAll, deleteAll, importChats,
  };
})();
