/* Radio — luister naar Vlaamse en Nederlandse zenders.
 *
 * Eén persistente <audio> die aan document.body hangt, NIET aan #view —
 * zodat de stream blijft spelen wanneer je naar een andere route navigeert.
 * View toont alleen controls. Lock-screen / Bluetooth-knoppen werken via
 * MediaSession API.
 */
(function () {
  let stations = [];
  let docLoaded = false;
  let playerEl = null;            // singleton <audio>
  let currentId = null;
  let currentStation = null;
  let volume = parseFloat(localStorage.getItem("studeerkamer.radio.vol") || "0.9");

  function el(tag, props, ...children) {
    const e = document.createElement(tag);
    if (props) for (const [k, v] of Object.entries(props)) {
      if (v == null) continue;
      if (k === "class") e.className = v;
      else if (k === "style") e.setAttribute("style", v);
      else if (k.startsWith("on") && typeof v === "function") e.addEventListener(k.slice(2).toLowerCase(), v);
      else e.setAttribute(k, v);
    }
    for (const c of children) {
      if (c == null || c === false) continue;
      if (Array.isArray(c)) c.forEach((cc) => cc != null && e.append(cc));
      else if (typeof c === "string" || typeof c === "number") e.append(document.createTextNode(c));
      else e.append(c);
    }
    return e;
  }
  function esc(s) { return String(s || "").replace(/[&<>]/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;"}[c])); }
  function flag(country) { return country === "BE" ? "🇧🇪" : country === "NL" ? "🇳🇱" : ""; }

  async function loadStations() {
    if (docLoaded) return stations;
    const r = await fetch("/static/data/radios.json", { credentials: "same-origin" });
    const data = await r.json();
    stations = data.stations || [];
    docLoaded = true;
    return stations;
  }

  function ensurePlayer() {
    if (playerEl) return playerEl;
    playerEl = document.createElement("audio");
    playerEl.id = "studeerkamer-radio-audio";
    playerEl.style.display = "none";
    playerEl.preload = "none";
    playerEl.volume = volume;
    // For iOS PWA: keep audio session active when locked.
    playerEl.setAttribute("playsinline", "");
    // Surface playback events to whoever's currently rendering controls.
    ["play", "pause", "loadstart", "playing", "waiting", "error"].forEach((evt) => {
      playerEl.addEventListener(evt, () => {
        document.dispatchEvent(new CustomEvent("studeerkamer-radio-state"));
      });
    });
    document.body.appendChild(playerEl);
    return playerEl;
  }

  function setupMediaSession(s) {
    if (!("mediaSession" in navigator)) return;
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: s.name,
        artist: s.broadcaster + (s.genre ? " · " + s.genre : ""),
        album: s.country === "BE" ? "Vlaamse radio" : s.country === "NL" ? "Nederlandse radio" : "Radio",
        artwork: [
          { src: "/static/icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/static/icons/icon-512.png", sizes: "512x512", type: "image/png" },
        ],
      });
      navigator.mediaSession.setActionHandler("play",  () => playerEl && playerEl.play().catch(() => {}));
      navigator.mediaSession.setActionHandler("pause", () => playerEl && playerEl.pause());
      navigator.mediaSession.setActionHandler("stop",  () => stop());
      navigator.mediaSession.setActionHandler("nexttrack",     () => switchOffset(1));
      navigator.mediaSession.setActionHandler("previoustrack", () => switchOffset(-1));
    } catch (e) { /* ignore: not all browsers support all actions */ }
  }

  function switchOffset(delta) {
    if (!currentId) return;
    const i = stations.findIndex((s) => s.id === currentId);
    if (i < 0) return;
    const next = stations[(i + delta + stations.length) % stations.length];
    play(next);
  }

  function play(s) {
    const audio = ensurePlayer();
    if (currentId === s.id && !audio.paused) return;
    // Hard reset to drop any buffered data from the previous stream.
    audio.pause();
    audio.src = s.url;
    audio.volume = volume;
    audio.load();
    audio.play().catch((err) => {
      console.warn("Radio play failed:", err);
      alert("Kon stream niet starten: " + err.message + "\n\nMogelijke oorzaken: zender ligt eruit, of je browser blokkeert autoplay (klik nogmaals op de zender).");
    });
    currentId = s.id;
    currentStation = s;
    setupMediaSession(s);
    document.dispatchEvent(new CustomEvent("studeerkamer-radio-state"));
  }

  function pauseResume() {
    if (!playerEl) return;
    if (playerEl.paused) playerEl.play().catch(() => {});
    else playerEl.pause();
  }

  function stop() {
    if (!playerEl) return;
    playerEl.pause();
    playerEl.src = "";
    currentId = null;
    currentStation = null;
    if ("mediaSession" in navigator) navigator.mediaSession.metadata = null;
    document.dispatchEvent(new CustomEvent("studeerkamer-radio-state"));
  }

  function setVolume(v) {
    volume = Math.max(0, Math.min(1, v));
    if (playerEl) playerEl.volume = volume;
    localStorage.setItem("studeerkamer.radio.vol", String(volume));
  }

  /* ---------- View ---------- */
  function render(mount) {
    mount.innerHTML = "";
    const wrap = el("div");
    wrap.append(
      el("h2", { class: "view-title" }, "Radio ", el("span", { class: "accent" }, "· Vlaams en Nederlands")),
      el("p", { class: "view-sub" },
        "Luister live naar publieke omroepen. De stream blijft spelen wanneer je naar een andere sectie navigeert.",
        " Op iPhone: voeg de PWA toe aan het beginscherm voor lock-screen bedieningen."),
    );

    // Player bar
    const playerBar = el("div", { id: "radio-player-bar", class: "radio-player-bar" });
    wrap.append(playerBar);

    // Station list
    const listHost = el("div", { id: "radio-list", style: "margin-top:1.2rem" });
    listHost.innerHTML = '<p class="stat-note"><span class="ai-loading">Zenders laden…</span></p>';
    wrap.append(listHost);

    mount.append(wrap);

    function paintPlayer() {
      playerBar.innerHTML = "";
      const isPlaying = playerEl && !playerEl.paused && !!currentId;
      const isLoading = playerEl && playerEl.readyState < 2 && currentId && !playerEl.paused;

      if (!currentStation) {
        playerBar.append(el("p", { class: "stat-note", style: "margin:0;padding:.6rem .9rem;background:var(--card);border:1px solid var(--rule);border-radius:4px;color:var(--ink-faint)" },
          "Kies een zender hieronder."));
        return;
      }
      const row = el("div", { style: "display:flex;align-items:center;gap:.8rem;padding:.7rem 1rem;background:var(--card);border:1px solid var(--rood);border-radius:4px;flex-wrap:wrap" });
      const playBtn = el("button", { class: "primary", style: "min-width:48px;font-size:1.1rem",
        onClick: () => pauseResume() }, isPlaying ? "❚❚" : "▶");
      const info = el("div", { style: "flex:1;min-width:0" },
        el("div", { style: "font-family:var(--serif);font-size:1.05rem;color:var(--ink);font-weight:600" },
          flag(currentStation.country) + " " + currentStation.name),
        el("div", { style: "font-family:var(--mono);font-size:.72rem;color:var(--ink-faint);letter-spacing:.06em;margin-top:.1rem" },
          currentStation.broadcaster + " · " + currentStation.genre + (isLoading ? " · buffering…" : (isPlaying ? " · live" : " · gepauzeerd"))));
      const volWrap = el("div", { style: "display:flex;align-items:center;gap:.4rem;font-size:.8rem;color:var(--ink-soft)" },
        el("span", null, "🔈"),
        (() => {
          const slider = el("input", { type: "range", min: "0", max: "1", step: "0.01", value: String(volume),
            style: "width:120px" });
          slider.addEventListener("input", () => setVolume(parseFloat(slider.value)));
          return slider;
        })());
      const stopBtn = el("button", { class: "subtle", style: "font-size:.85rem", onClick: () => stop() }, "stop");
      row.append(playBtn, info, volWrap, stopBtn);
      playerBar.append(row);
    }

    function paintList(list) {
      listHost.innerHTML = "";
      const groups = {};
      list.forEach((s) => { (groups[s.country] = groups[s.country] || []).push(s); });
      const order = ["BE", "NL"];
      const labels = { BE: "Vlaanderen", NL: "Nederland" };
      order.forEach((cc) => {
        if (!groups[cc]) return;
        listHost.append(el("h3", { style: "margin:1.2rem 0 .5rem;font-family:var(--serif);font-weight:600" },
          flag(cc) + "  " + labels[cc]));
        const grid = el("div", { style: "display:grid;grid-template-columns:repeat(auto-fill, minmax(220px, 1fr));gap:.5rem" });
        groups[cc].forEach((s) => {
          const isActive = s.id === currentId;
          const card = el("button", {
            style: "text-align:left;padding:.7rem .9rem;background:var(--card);border:1.5px solid " + (isActive ? "var(--rood)" : "var(--rule)") +
                   ";border-radius:4px;cursor:pointer;font-family:var(--sans);display:flex;flex-direction:column;gap:.2rem;color:var(--ink)",
            onClick: () => { play(s); },
          });
          card.append(
            el("div", { style: "font-family:var(--serif);font-size:1rem;font-weight:600;color:var(--ink);display:flex;align-items:baseline;justify-content:space-between;gap:.5rem" },
              el("span", null, s.name),
              isActive ? el("span", { style: "font-family:var(--mono);font-size:.65rem;color:var(--rood);letter-spacing:.08em" }, "ACTIEF") : null),
            el("div", { style: "font-family:var(--mono);font-size:.7rem;color:var(--ink-faint);letter-spacing:.04em" }, s.broadcaster + " · " + s.genre),
            el("div", { style: "color:var(--ink-soft);font-size:.82rem;margin-top:.15rem;line-height:1.35" }, s.description || ""),
          );
          grid.append(card);
        });
        listHost.append(grid);
      });
    }

    function refresh() { paintPlayer(); }
    // Re-paint on radio state changes (play/pause/load) from anywhere.
    document.addEventListener("studeerkamer-radio-state", refresh);

    loadStations().then((list) => {
      paintPlayer();
      paintList(list);
    }).catch((e) => {
      listHost.innerHTML = '<p class="ai-error">Kon zenderlijst niet laden: ' + esc(e.message) + '</p>';
    });

    // Cleanup on unmount: detach state listener but DON'T stop the stream
    // (user might be listening while navigating). Stream stops only via
    // the stop button or by switching to a different station.
    return function cleanup() {
      document.removeEventListener("studeerkamer-radio-state", refresh);
    };
  }

  window.RadioViews = { render, play, stop };
})();
