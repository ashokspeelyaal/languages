/* Router + sidebar + global wiring. */
(function () {
  const view = document.getElementById("view");
  const sidebar = document.getElementById("sidebar");
  const scrim = document.getElementById("scrim");
  const exList = document.getElementById("ex-list");
  const search = document.getElementById("search");

  /* ============ Sidebar drawer ============ */
  function openSidebar() {
    sidebar.classList.add("open");
    scrim.classList.add("open");
  }
  function closeSidebar() {
    sidebar.classList.remove("open");
    scrim.classList.remove("open");
  }
  document.getElementById("menu-toggle").addEventListener("click", openSidebar);
  document.getElementById("sidebar-close").addEventListener("click", closeSidebar);
  scrim.addEventListener("click", closeSidebar);
  document.getElementById("new-btn").addEventListener("click", () => { location.hash = "#/new"; closeSidebar(); });
  document.getElementById("new-btn-side").addEventListener("click", () => { location.hash = "#/new"; closeSidebar(); });
  document.getElementById("settings-btn").addEventListener("click", () => { location.hash = "#/settings"; closeSidebar(); });

  /* ============ Sidebar list ============ */
  let searchQuery = "";
  search.addEventListener("input", () => { searchQuery = search.value.toLowerCase(); paintList(); });

  function paintList() {
    exList.innerHTML = "";
    let all = window.Store.list();
    if (searchQuery) {
      all = all.filter((e) =>
        (e.title || "").toLowerCase().includes(searchQuery) ||
        (e.topic || "").toLowerCase().includes(searchQuery)
      );
    }
    if (!all.length) {
      exList.append(document.createElement("li")).className = "ex-empty";
      exList.lastChild.textContent = searchQuery ? "Geen resultaten." : "Nog geen oefeningen.";
      return;
    }
    const activeId = currentExId();
    all.forEach((e) => {
      const li = document.createElement("li");
      li.className = "ex-item" + (e.id === activeId ? " active" : "") + (!e.autoTitled ? " untitled" : "");
      li.addEventListener("click", (ev) => {
        if (ev.target && ev.target.classList && ev.target.classList.contains("ex-del")) return;
        location.hash = "#/ex/" + e.id;
        closeSidebar();
      });

      const title = document.createElement("span");
      title.className = "ex-title";
      title.textContent = e.title || "Naamloos";
      const meta = document.createElement("span");
      meta.className = "ex-meta";
      const status = e.status === "ready" ? "✓ klaar" :
                     e.status === "generating" ? "⏳ genereren" :
                     e.status === "error" ? "✗ fout" : "nieuw";
      meta.textContent = status + " · " + relTime(e.updatedAt);

      const del = document.createElement("button");
      del.className = "ex-del";
      del.textContent = "✕";
      del.title = "Verwijderen";
      del.addEventListener("click", (ev) => {
        ev.stopPropagation();
        if (!confirm("\"" + (e.title || "Naamloos") + "\" verwijderen?")) return;
        if (e.audioKey) window.BlobStore.remove(e.audioKey).catch(() => {});
        window.Store.remove(e.id);
        if (currentExId() === e.id) location.hash = "#/";
        paintList();
      });

      li.append(title, meta, del);
      exList.append(li);
    });
  }
  function relTime(iso) {
    if (!iso) return "—";
    const diff = (Date.now() - new Date(iso).getTime()) / 1000;
    if (diff < 60) return "nu";
    if (diff < 3600) return Math.floor(diff / 60) + "m";
    if (diff < 86400) return Math.floor(diff / 3600) + "u";
    return Math.floor(diff / 86400) + "d";
  }

  /* ============ Router ============ */
  function currentExId() {
    const m = (location.hash || "").match(/#\/ex\/(.+)$/);
    return m ? m[1] : null;
  }

  function route() {
    const h = (location.hash || "").replace(/^#/, "");
    if (h.startsWith("/ex/")) {
      const id = h.slice(4);
      window.Views.exercise(view, id);
    } else if (h === "/new") {
      window.Views.new(view);
    } else if (h === "/settings") {
      window.Views.settings(view);
    } else {
      // Default: show the most recent exercise if any, otherwise empty state
      const all = window.Store.list();
      if (all.length) {
        location.hash = "#/ex/" + all[0].id;
        return;
      }
      window.Views.empty(view);
    }
    paintList();
    closeSidebar();
  }

  window.App = {
    refresh: () => { paintList(); route(); },
  };

  window.addEventListener("hashchange", route);
  document.addEventListener("DOMContentLoaded", () => {
    if (!location.hash) location.hash = "#/";
    route();
  });

  // Fire route() now in case DOMContentLoaded already passed
  if (document.readyState !== "loading") {
    if (!location.hash) location.hash = "#/";
    route();
  }

  /* ============ Service Worker registration ============ */
  // Only register over http(s) — service workers don't work on file://
  if ("serviceWorker" in navigator && /^https?:$/.test(location.protocol)) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./service-worker.js").catch(() => {
        // Silent — non-fatal if SW fails
      });
    });
  }
})();
