/* Hash router + global keyboard hooks. */
(function () {
  const ROUTES = ["dashboard", "browse", "flashcards", "typed", "cloze", "mixed", "metrics", "chat", "essay", "settings", "help"];
  let cleanupFn = null;

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
    if (typeof cleanupFn === "function") {
      try { cleanupFn(); } catch (e) {}
      cleanupFn = null;
    }
    const route = currentRoute();
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
    const s = window.Store.state.streak;
    const el = document.getElementById("streak-count");
    if (el) el.textContent = s.count || 0;
  }

  window.addEventListener("hashchange", render);
  document.addEventListener("DOMContentLoaded", () => {
    if (!location.hash) location.hash = "#/dashboard";
    render();
  });

  // Global keyboard: ? opens shortcuts
  document.addEventListener("keydown", (e) => {
    if (e.key === "?" && !e.target.matches("input, textarea, select")) {
      e.preventDefault();
      const dlg = document.getElementById("shortcuts");
      if (dlg && !dlg.open) dlg.showModal();
    }
  });
})();
