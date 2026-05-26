/* Hash router + boot orchestration.
 *
 * Boot order (all blocking before first render):
 *  1. GET /api/auth/me  — confirm cookie is good, else redirect to /login
 *  2. In parallel: load vocab + custom vocab + all stores + state
 *  3. Render whatever route is in the URL hash
 */
(function () {
  // Initialise VOCAB_DATA early so view IIFE's that capture a reference
  // to .items get the SAME array that boot mutates in place.
  if (!window.VOCAB_DATA) window.VOCAB_DATA = { items: [] };

  const ROUTES = ["dashboard", "browse", "flashcards", "typed", "cloze", "mixed",
                  "metrics", "chat", "schrijven", "exam", "luisteren",
                  "settings", "help", "logout"];
  let cleanupFn = null;
  let booted = false;

  function currentRoute() {
    const h = location.hash || "#/dashboard";
    const r = h.replace(/^#\//, "");
    return ROUTES.includes(r) ? r : "dashboard";
  }

  function navHighlight(route) {
    document.querySelectorAll(".nav a").forEach((a) => {
      a.classList.toggle("active", a.dataset.route === route);
    });
  }

  function render() {
    if (!booted) return; // boot() finishes then re-renders
    if (typeof cleanupFn === "function") {
      try { cleanupFn(); } catch (e) {}
      cleanupFn = null;
    }
    const route = currentRoute();
    if (route === "logout") {
      window.API.post("/api/auth/logout", {}).finally(() => location.replace("/login"));
      return;
    }
    navHighlight(route);
    const mount = document.getElementById("view");
    mount.innerHTML = "";
    try {
      cleanupFn = window.Views[route](mount);
    } catch (e) {
      console.error("View error:", e);
      mount.innerHTML = `<div class="empty"><h3>Er ging iets mis.</h3><p>${e.message}</p></div>`;
    }
    refreshStreak();
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function refreshStreak() {
    const s = window.Store && window.Store.state.streak;
    const el = document.getElementById("streak-count");
    if (el) el.textContent = (s && s.count) || 0;
  }

  async function loadVocab() {
    const r = await window.API.get("/api/vocab");
    // Mutate items in place so any captured reference stays valid.
    window.VOCAB_DATA.items.length = 0;
    (r.items || []).forEach((it) => window.VOCAB_DATA.items.push(it));
  }

  async function boot() {
    // 1. Check auth — redirect to /login on 401.
    try { await window.API.get("/api/auth/me"); }
    catch (e) {
      if (!location.pathname.startsWith("/login")) {
        location.replace("/login?next=" + encodeURIComponent(location.pathname + location.hash));
      }
      return;
    }

    // 2. Eagerly hydrate every store + the main state.
    await Promise.all([
      loadVocab(),
      window.Store.boot(),
      window.ChatStore.boot(),
      window.ListeningStore.boot(),
      window.WritingStore.boot(),
      window.ExamStore.boot(),
      window.CustomVocab.boot(),
    ]);

    booted = true;
    if (!location.hash) location.hash = "#/dashboard";
    render();
  }

  window.addEventListener("hashchange", render);
  document.addEventListener("DOMContentLoaded", boot);

  // Global keyboard: ? opens shortcuts dialog.
  document.addEventListener("keydown", (e) => {
    if (e.key === "?" && !e.target.matches("input, textarea, select")) {
      e.preventDefault();
      const dlg = document.getElementById("shortcuts");
      if (dlg && !dlg.open) dlg.showModal();
    }
  });
})();
