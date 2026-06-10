/* Same-origin fetch wrapper. 401 → redirect to /login. */
(function () {
  async function request(method, path, opts = {}) {
    const init = {
      method,
      credentials: "same-origin",
      headers: { "X-Requested-With": "fetch", ...(opts.headers || {}) },
    };
    if (opts.body !== undefined) {
      if (opts.body instanceof FormData) init.body = opts.body;
      else {
        init.headers["Content-Type"] = "application/json";
        init.body = JSON.stringify(opts.body);
      }
    }
    const resp = await fetch(path, init);
    if (resp.status === 401 && !opts.allow401) {
      if (!location.pathname.startsWith("/login")) {
        const next = encodeURIComponent(location.pathname + location.hash);
        location.replace("/login?next=" + next);
      }
      throw new Error("Non connecté");
    }
    if (!resp.ok) {
      let detail = "";
      try { detail = (await resp.json()).detail || ""; } catch (_) {}
      throw new Error(`${resp.status} ${detail.slice(0, 240)}`);
    }
    if (opts.raw) return resp;
    if (resp.status === 204) return null;
    const ct = resp.headers.get("content-type") || "";
    if (ct.includes("application/json")) return resp.json();
    return resp;
  }

  window.API = {
    get:   (p, o)    => request("GET",    p, o),
    post:  (p, b, o) => request("POST",   p, { ...(o || {}), body: b }),
    patch: (p, b, o) => request("PATCH",  p, { ...(o || {}), body: b }),
    del:   (p, o)    => request("DELETE", p, o),
  };
})();
