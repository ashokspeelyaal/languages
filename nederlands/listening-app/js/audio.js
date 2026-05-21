/* Audio player wrapper — controls a single <audio> element with skip/speed/loop. */
(function () {
  function fmtTime(s) {
    if (!isFinite(s) || s < 0) return "0:00";
    const m = Math.floor(s / 60);
    const ss = Math.floor(s % 60).toString().padStart(2, "0");
    return m + ":" + ss;
  }

  function makePlayer(mount, audioUrl) {
    mount.innerHTML = "";
    const audio = new Audio(audioUrl);
    audio.preload = "metadata";

    const playBtn = document.createElement("button");
    playBtn.className = "play-btn";
    playBtn.setAttribute("aria-label", "Afspelen");
    playBtn.textContent = "▶";

    const back10 = document.createElement("button");
    back10.className = "skip-btn";
    back10.setAttribute("aria-label", "Tien seconden terug");
    back10.textContent = "-10";

    const back5 = document.createElement("button");
    back5.className = "skip-btn";
    back5.setAttribute("aria-label", "Vijf seconden terug");
    back5.textContent = "-5";

    const time = document.createElement("span");
    time.className = "player-time";
    time.textContent = "0:00 / —";

    const row1 = document.createElement("div");
    row1.className = "player-row1";
    row1.append(playBtn, back10, back5, time);

    const progress = document.createElement("div");
    progress.className = "player-progress";
    const fill = document.createElement("span");
    progress.append(fill);

    // Speed
    const speedPill = document.createElement("div");
    speedPill.className = "speed-pill";
    [0.75, 1.0, 1.25, 1.5].forEach((s) => {
      const b = document.createElement("button");
      b.textContent = s + "×";
      if (s === 1.0) b.classList.add("active");
      b.addEventListener("click", () => {
        audio.playbackRate = s;
        speedPill.querySelectorAll("button").forEach((x) => x.classList.toggle("active", x === b));
      });
      speedPill.append(b);
    });

    // Repeat (loop)
    const repeatBtn = document.createElement("button");
    repeatBtn.className = "repeat-btn";
    repeatBtn.textContent = "↻ Herhaal";
    repeatBtn.addEventListener("click", () => {
      audio.loop = !audio.loop;
      repeatBtn.classList.toggle("active", audio.loop);
    });

    const extras = document.createElement("div");
    extras.className = "player-extra";
    extras.append(speedPill, repeatBtn);

    mount.append(row1, progress, extras);

    // Events
    playBtn.addEventListener("click", () => {
      if (audio.paused) audio.play();
      else audio.pause();
    });
    back10.addEventListener("click", () => { audio.currentTime = Math.max(0, audio.currentTime - 10); });
    back5.addEventListener("click", () => { audio.currentTime = Math.max(0, audio.currentTime - 5); });
    audio.addEventListener("play", () => { playBtn.textContent = "❚❚"; playBtn.setAttribute("aria-label", "Pauze"); });
    audio.addEventListener("pause", () => { playBtn.textContent = "▶"; playBtn.setAttribute("aria-label", "Afspelen"); });
    audio.addEventListener("ended", () => { playBtn.textContent = "▶"; });
    audio.addEventListener("loadedmetadata", () => {
      time.textContent = fmtTime(audio.currentTime) + " / " + fmtTime(audio.duration);
    });
    audio.addEventListener("timeupdate", () => {
      const pct = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
      fill.style.width = pct + "%";
      time.textContent = fmtTime(audio.currentTime) + " / " + fmtTime(audio.duration);
    });
    progress.addEventListener("click", (e) => {
      const r = progress.getBoundingClientRect();
      const ratio = (e.clientX - r.left) / r.width;
      audio.currentTime = Math.max(0, Math.min(audio.duration, ratio * audio.duration));
    });

    return {
      audio,
      destroy: () => {
        audio.pause();
        audio.src = "";
        URL.revokeObjectURL(audioUrl);
      },
    };
  }

  window.Player = { makePlayer, fmtTime };
})();
