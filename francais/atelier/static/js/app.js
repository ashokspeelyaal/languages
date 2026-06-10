/* Phase 0 boot: confirm we're logged in, render a placeholder dashboard.
 *
 * Feature views (browse, flashcards, conjugaison, grammaire, chat,
 * écrire, écouter, parler, examen, métriques, paramètres) land in
 * subsequent phases. For now we just verify the session round-trip
 * and the static SPA shell are healthy.
 */
(async function () {
  const view = document.getElementById("view");
  const logoutLink = document.getElementById("logout-link");

  let me;
  try {
    me = await window.API.get("/api/auth/me");
  } catch (e) {
    // api.js already redirected to /login on 401; for anything else
    // surface the error in-place rather than spinning forever.
    view.innerHTML = `<div class="empty" style="padding:48px;text-align:center;color:#b3261e">
      Erreur d'authentification : ${escapeHtml(e.message)}
    </div>`;
    return;
  }

  if (logoutLink) {
    logoutLink.addEventListener("click", async (ev) => {
      ev.preventDefault();
      try {
        await window.API.post("/api/auth/logout", {});
      } catch (e) {}
      location.replace("/login");
    });
  }

  view.innerHTML = `
    <section style="max-width:720px;margin:48px auto;padding:0 24px">
      <div style="background:#fff;border:1px solid #e3e6f0;border-radius:14px;padding:28px 32px;box-shadow:0 4px 14px rgba(29,78,216,0.06)">
        <h2 style="margin:0 0 8px;color:#1d4ed8">Bienvenue, ${escapeHtml(me.username)}.</h2>
        <p style="margin:0 0 16px;color:#5a627a">
          Atelier — phase 0 du squelette en ligne. L'authentification, le
          proxy IA et la coquille SPA fonctionnent. Les fonctionnalités
          d'apprentissage (vocabulaire, flashcards, conjugaison, grammaire,
          chat, écrire, écouter, parler, examen) arrivent dans les phases
          suivantes selon <code>IMPLEMENTATION_PLAN.md</code>.
        </p>
        <ul style="margin:0;padding-left:20px;color:#2d3344;line-height:1.7">
          <li>Phase 1 : niveau actif (A1→C1) + vocabulaire de base</li>
          <li>Phase 2 : flashcards + SRS au niveau A1</li>
          <li>Phase 3 : mini-modes débutant (genre, nombres, alphabet)</li>
          <li>Phase 4 : conjugaison</li>
          <li>…</li>
        </ul>
      </div>
    </section>
  `;

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));
  }
})();
