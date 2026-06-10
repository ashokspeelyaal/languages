/* Boot orchestrator.
 *
 *   1. Pull /api/auth/me + /api/settings + /api/ai/config in parallel.
 *   2. If onboarding_done === false → start the wizard.
 *   3. Otherwise → render the level picker and dispatch to the router.
 *
 * Any error along the way:
 *   - 401 → api.js already redirected to /login.
 *   - anything else → in-place error card with a Retry button.
 */
(async function () {
  const view = document.getElementById("view");

  try {
    await window.Store.boot();
  } catch (e) {
    // api.js already redirected on 401; anything reaching here is non-auth.
    view.innerHTML = `<div class="empty" style="padding:48px;text-align:center;color:#b3261e">
      Erreur au démarrage : ${escapeHtml(e.message)}<br><br>
      <button class="btn btn-primary" onclick="location.reload()">Réessayer</button>
    </div>`;
    return;
  }

  if (!window.Store.state.onboardingDone) {
    window.Onboarding.start();
    return;
  }

  // Onboarding done → into the app. The router is already wired to
  // "store-ready" + "hashchange" inside views.js, so booting Store
  // earlier in the function already kicked off the first render. But
  // if location.hash is empty, force #/dashboard so the URL is honest.
  if (!location.hash) location.hash = "#/dashboard";
  else window.Views.navigate();

  function escapeHtml(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));
  }
})();
