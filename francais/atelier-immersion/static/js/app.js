/* Boot: confirm session then hand off to the router. */
(async function () {
  try {
    await window.API.get("/api/auth/me");
  } catch (e) {
    // api.js already redirected on 401; anything else surfaces inline.
    document.getElementById("view").innerHTML =
      `<div class="empty" style="color:#b91c1c">Erreur d'authentification : ${e.message}</div>`;
    return;
  }
  if (!location.hash) location.hash = "#/";
  window.Views.navigate();
})();
