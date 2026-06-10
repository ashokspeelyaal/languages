/* Karaoke transcript player.
 *
 * Given:
 *   - transcript text (canonical, may differ slightly from Whisper output)
 *   - audio URL (mp3)
 *   - word timings: [{word, start, end}] from Whisper
 *
 * Renders the transcript with every word wrapped in <span.kw>, builds a
 * sparse index mapping span → (start, end), and advances `.active`
 * highlighting in sync with the <audio>'s currentTime via timeupdate.
 *
 * Click any word → seek there. Click the same word twice → repeat that
 * one word (slight overshoot included so the next word doesn't catch).
 *
 * Whisper's word splitting is good but not identical to the original
 * (punctuation joins, contractions split differently). We align by
 * walking both sequences and matching on accent-folded equality with
 * length tolerance; unmatched canonical tokens are just untimed (no
 * highlight, but still clickable).
 */
(function () {
  function escapeHtml(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));
  }
  function fold(s) {
    return (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[’']/g, "'").replace(/[^\w']/g, "").trim();
  }

  // Tokenize the canonical transcript into word + non-word runs so we
  // can reconstruct exact spacing/punctuation after wrapping words.
  function tokenize(text) {
    const out = [];
    const re = /(\s+|[.,;:!?…«»"\(\)\[\]\-—]+)/g;
    let lastIdx = 0, m;
    while ((m = re.exec(text)) !== null) {
      if (m.index > lastIdx) out.push({ kind: "word", text: text.slice(lastIdx, m.index) });
      out.push({ kind: "sep", text: m[0] });
      lastIdx = re.lastIndex;
    }
    if (lastIdx < text.length) out.push({ kind: "word", text: text.slice(lastIdx) });
    return out.filter((t) => t.text.length > 0);
  }

  // Walk word tokens and Whisper words in parallel, matching by folded
  // equality. Returns the canonical token list with .start/.end set
  // when matched. Tolerates 1 skip on either side for misalignment.
  function alignTimings(canonical, whisperWords) {
    const wTok = canonical.filter((t) => t.kind === "word");
    let wi = 0; // whisper index
    for (let ci = 0; ci < wTok.length; ci++) {
      const can = fold(wTok[ci].text);
      if (!can) continue;
      // Try to match within the next 3 whisper words.
      let matched = false;
      for (let k = 0; k < 3 && wi + k < whisperWords.length; k++) {
        const ws = fold(whisperWords[wi + k].word);
        if (!ws) continue;
        if (ws === can || ws.startsWith(can) || can.startsWith(ws)) {
          const w = whisperWords[wi + k];
          wTok[ci].start = w.start;
          wTok[ci].end = w.end;
          wi += k + 1;
          matched = true;
          break;
        }
      }
      if (!matched) {
        // leave start/end undefined → no highlight, but token still rendered
      }
    }
    return canonical;
  }

  function mount(container, { transcript, audioUrl, wordTimings, onSeek }) {
    const tokens = alignTimings(tokenize(transcript || ""), wordTimings || []);
    const spans = [];
    const parts = [];
    let wi = 0;
    for (const t of tokens) {
      if (t.kind === "sep") {
        parts.push(escapeHtml(t.text));
      } else {
        const id = `kw${wi++}`;
        spans.push({ id, start: t.start, end: t.end });
        const dataT = t.start != null ? ` data-start="${t.start}" data-end="${t.end}"` : ``;
        parts.push(`<span class="kw" id="${id}"${dataT}>${escapeHtml(t.text)}</span>`);
      }
    }

    container.innerHTML = `
      <div class="karaoke-wrap">
        <div class="karaoke-text" id="kara-text">${parts.join("")}</div>
        <div class="audio-controls">
          <audio id="kara-audio" controls preload="metadata" src="${audioUrl}"></audio>
          <div>
            <button type="button" class="rate-pill" data-rate="0.7">0.7×</button>
            <button type="button" class="rate-pill active" data-rate="1">1×</button>
            <button type="button" class="rate-pill" data-rate="1.25">1.25×</button>
          </div>
        </div>
      </div>
    `;

    const audio = container.querySelector("#kara-audio");
    const textRoot = container.querySelector("#kara-text");
    let lastActive = -1;

    audio.addEventListener("timeupdate", () => {
      const t = audio.currentTime;
      // Find the span whose [start, end] contains t. spans are sorted by
      // file order — linear scan is fine for < 1000 words.
      let idx = -1;
      for (let i = 0; i < spans.length; i++) {
        const s = spans[i];
        if (s.start == null) continue;
        if (t >= s.start && t <= (s.end || s.start + 0.4)) { idx = i; break; }
        if (s.start > t) break;
      }
      if (idx === lastActive) return;
      if (lastActive >= 0) {
        const prev = document.getElementById(spans[lastActive].id);
        prev?.classList.remove("active");
        prev?.classList.add("spoken");
      }
      if (idx >= 0) {
        const el = document.getElementById(spans[idx].id);
        el?.classList.add("active");
        // Auto-scroll active word into view if it's off-screen.
        const r = el?.getBoundingClientRect();
        if (r && (r.top < 80 || r.bottom > window.innerHeight - 40)) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
      lastActive = idx;
    });

    audio.addEventListener("ended", () => {
      spans.forEach((s) => document.getElementById(s.id)?.classList.remove("active"));
    });

    // Click a word to seek.
    textRoot.addEventListener("click", (e) => {
      const t = e.target;
      if (!t.classList?.contains("kw")) return;
      const start = parseFloat(t.dataset.start);
      if (!isFinite(start)) return;
      audio.currentTime = Math.max(0, start - 0.05);
      audio.play();
      onSeek?.(start);
    });

    // Rate buttons.
    container.querySelectorAll(".rate-pill").forEach((b) => {
      b.addEventListener("click", () => {
        const r = parseFloat(b.dataset.rate);
        audio.playbackRate = r;
        container.querySelectorAll(".rate-pill").forEach((x) => x.classList.toggle("active", x === b));
      });
    });

    return {
      audio,
      seekTo(start) { audio.currentTime = Math.max(0, start - 0.05); audio.play(); },
      destroy() { audio.pause(); container.innerHTML = ""; },
    };
  }

  window.Karaoke = { mount, tokenize, alignTimings };
})();
