/* Topbar level chooser — 5-pill segmented control.
 *
 * Rendered into #level-picker on every page. Listens to "level-changed"
 * so external changes (e.g. onboarding finish) keep the pills in sync.
 */
(function () {
  function render() {
    const root = document.getElementById("level-picker");
    if (!root || !window.Store) return;
    const active = window.Store.state.activeLevel;
    const html = window.Store.LEVELS.map((id) => {
      const meta = window.Store.LEVEL_META[id];
      const isActive = id === active;
      return `<button type="button" class="level-pill${isActive ? " is-active" : ""}"
                data-level="${id}" title="${meta.title}"
                style="${isActive ? `--pill-color:${meta.color};` : ""}"
              >${meta.label}</button>`;
    }).join("");
    root.innerHTML = html;
    root.querySelectorAll(".level-pill").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const lvl = btn.dataset.level;
        try {
          await window.Store.setActiveLevel(lvl);
        } catch (e) {
          alert("Impossible de changer de niveau : " + e.message);
        }
      });
    });
  }

  document.addEventListener("store-ready", render);
  document.addEventListener("level-changed", render);
})();
