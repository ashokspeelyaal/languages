/* Central fetch wrapper. All store + AI calls go through here so we
 * have one place for: credentials, CSRF header, JSON parsing, 401 redirect.
 *
 * On 401 we hard-redirect to /login (the server returns 401 if the
 * cookie is missing or expired). Other errors throw with a Dutch message.
 */

// Initialise VOCAB_DATA before any view IIFE captures a reference to .items.
// app.js's boot() populates it later by pushing items into the SAME array,
// so the reference captured at IIFE-time stays valid.
if (!window.VOCAB_DATA) window.VOCAB_DATA = { items: [] };

(function () {
  const BASE = ""; // same-origin

  function url(path) {
    return BASE + path;
  }

  async function request(method, path, opts = {}) {
    const init = {
      method,
      credentials: "same-origin",
      headers: {
        "X-Requested-With": "fetch",
        ...(opts.headers || {}),
      },
    };
    if (opts.body !== undefined) {
      if (opts.body instanceof FormData) {
        init.body = opts.body;
      } else {
        init.headers["Content-Type"] = "application/json";
        init.body = JSON.stringify(opts.body);
      }
    }
    const resp = await fetch(url(path), init);
    if (resp.status === 401 && !opts.allow401) {
      if (!location.pathname.startsWith("/login")) {
        const next = encodeURIComponent(location.pathname + location.hash);
        location.replace("/login?next=" + next);
      }
      throw new Error("Niet ingelogd");
    }
    if (!resp.ok) {
      let detail = "";
      try { detail = (await resp.json()).detail || ""; } catch (e) {}
      if (!detail) {
        try { detail = await resp.text(); } catch (e) {}
      }
      throw new Error(`${resp.status} ${detail.slice(0, 240)}`);
    }
    if (opts.raw) return resp;
    if (resp.status === 204) return null;
    const ct = resp.headers.get("content-type") || "";
    if (ct.includes("application/json")) return resp.json();
    return resp;
  }

  const API = {
    get:    (p, opts)       => request("GET",    p, opts),
    post:   (p, body, opts) => request("POST",   p, { ...(opts||{}), body }),
    put:    (p, body, opts) => request("PUT",    p, { ...(opts||{}), body }),
    patch:  (p, body, opts) => request("PATCH",  p, { ...(opts||{}), body }),
    del:    (p, opts)       => request("DELETE", p, opts),

    // Convenience: POST FormData (for audio upload / OCR file)
    postForm: (p, form, opts) => request("POST", p, { ...(opts||{}), body: form }),

    // Convenience: POST JSON and return a Blob (for TTS audio responses)
    async postBlob(p, body) {
      const resp = await request("POST", p, { body, raw: true });
      return resp.blob();
    },

    // For audio fetch — server returns audio/mpeg. We return a blob-URL for <audio src>.
    async audioURL(audioKey) {
      if (!audioKey) return null;
      const resp = await fetch(url("/api/audio/" + audioKey), { credentials: "same-origin" });
      if (!resp.ok) return null;
      const blob = await resp.blob();
      return URL.createObjectURL(blob);
    },
  };

  window.API = API;
})();
