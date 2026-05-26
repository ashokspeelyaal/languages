/* Spreken view.
 *
 * You record audio → AI:
 *   1. Encodes a 16kHz WAV (in-browser via WavEncoder)
 *   2. POSTs it to /api/ai/pronounce for Azure Pronunciation Assessment
 *   3. POSTs the WebM original to /api/ai/transcribe for word-timed Whisper text
 *   4. Sends that transcript through correctEssay for grammar/style correction
 *   5. TTS-reads the corrected text back via Azure Dena (or your selected voice)
 *   6. Saves both audios + scores + per-word accuracy to SprekenStore
 *
 * Tabs:
 *   Origineel       — your audio + transcript with per-word colour-coded accuracy
 *   Correcties      — sentence-by-sentence corrections (Schrijven-style)
 *   Gecorrigeerd    — AI-rewritten text + Dena reads it (karaoke sync)
 *   Vergelijk       — your audio + Dena's audio side by side
 *   Woordenschat & grammatica
 *   Oefen           — vocab quiz on the corpus pulled from this exercise
 */
(function () {
  function el(tag, props, ...children) {
    const e = document.createElement(tag);
    if (props) {
      for (const [k, v] of Object.entries(props)) {
        if (v == null) continue;
        if (k === "class") e.className = v;
        else if (k === "style") e.setAttribute("style", v);
        else if (k.startsWith("on") && typeof v === "function") e.addEventListener(k.slice(2).toLowerCase(), v);
        else e.setAttribute(k, v);
      }
    }
    for (const c of children) {
      if (c == null || c === false) continue;
      if (Array.isArray(c)) c.forEach((cc) => cc != null && e.append(cc));
      else if (typeof c === "string" || typeof c === "number") e.append(document.createTextNode(c));
      else e.append(c);
    }
    return e;
  }

  function fmtTime(s) {
    if (!isFinite(s)) return "0:00";
    s = Math.max(0, s | 0);
    return (s / 60 | 0) + ":" + String(s % 60).padStart(2, "0");
  }
  function escapeHTML(s) {
    return String(s || "").replace(/[&<>]/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;"}[c]));
  }

  /* ---------- Top-level render ---------- */
  function render(mount) {
    mount.innerHTML = "";
    // Responsive: sidebar stacks above main on narrow screens.
    const wrap = el("div", { class: "luisteren-page", style: "display:grid;grid-template-columns:minmax(0,260px) 1fr;gap:1.4rem" });
    if (window.matchMedia && window.matchMedia("(max-width: 760px)").matches) {
      wrap.setAttribute("style", "display:grid;grid-template-columns:1fr;gap:1rem");
    }
    const side = el("div");
    const main = el("div");
    wrap.append(side, main);
    mount.append(wrap);

    let activeId = window.SprekenStore.getActiveId();
    function refresh() {
      paintSidebar(side, activeId, (id) => { activeId = id; window.SprekenStore.setActiveId(id); refresh(); });
      const ex = activeId ? window.SprekenStore.get(activeId) : null;
      paintMain(main, ex, refresh);
    }
    refresh();

    // Cleanup: stop any in-flight recording if the user navigates away.
    return function cleanup() {
      if (recTimer) { clearInterval(recTimer); recTimer = null; }
      if (activeRec) {
        // stop() resolves with a blob we don't need; we just want the
        // mic stream released. Swallow any errors silently.
        try { activeRec.stop().catch(() => {}); } catch (e) {}
        activeRec = null;
      }
    };
  }

  /* ---------- Sidebar ---------- */
  function paintSidebar(host, activeId, onSelect) {
    host.innerHTML = "";
    host.append(el("button", {
      class: "primary",
      style: "width:100%;margin-bottom:.8rem",
      onClick: () => {
        const ex = window.SprekenStore.create();
        onSelect(ex.id);
      },
    }, "+ Nieuwe opname"));

    const items = window.SprekenStore.list();
    if (!items.length) {
      host.append(el("p", { class: "stat-note", style: "color:var(--ink-faint)" }, "Nog geen opnames."));
      return;
    }
    items.forEach((ex) => {
      const card = el("div", {
        class: "side-card" + (ex.id === activeId ? " active" : ""),
        style: "padding:.55rem .7rem;border:1px solid var(--rule);border-radius:4px;margin-bottom:.3rem;cursor:pointer;" + (ex.id === activeId ? "border-color:var(--rood);background:var(--paper-2)" : ""),
        onClick: () => onSelect(ex.id),
      });
      const score = (ex.pronunciation && ex.pronunciation.pron) || (ex.score && ex.score.overall);
      card.append(
        el("div", { style: "font-family:var(--serif);font-size:.95rem;color:var(--ink);font-weight:600" }, ex.title || "—"),
        el("div", { style: "font-family:var(--mono);font-size:.7rem;color:var(--ink-faint);letter-spacing:.06em;margin-top:.15rem" },
          (ex.level || "B2") + " · " + ex.status + (score != null ? " · " + score : "")),
        el("button", {
          class: "subtle",
          style: "margin-top:.35rem;font-size:.7rem;padding:.1rem .45rem;min-height:auto",
          onClick: (e) => {
            e.stopPropagation();
            if (!confirm("Verwijder deze opname?")) return;
            if (ex.originalAudioKey && window.BlobStore) window.BlobStore.remove(ex.originalAudioKey).catch(() => {});
            if (ex.correctedAudioKey && window.BlobStore) window.BlobStore.remove(ex.correctedAudioKey).catch(() => {});
            window.SprekenStore.remove(ex.id);
            onSelect(window.SprekenStore.getActiveId());
          },
        }, "Verwijder"),
      );
      host.append(card);
    });
  }

  /* ---------- Main column ---------- */
  function paintMain(host, ex, refresh) {
    host.innerHTML = "";
    if (!ex) {
      host.append(el("div", { class: "empty", style: "padding:48px;text-align:center;color:var(--ink-faint)" },
        el("h3", null, "Kies of begin een opname"),
        el("p", { class: "stat-note" }, "Spreek vrijuit in het Nederlands. De AI scoort je uitspraak, geeft een transcript, corrigeert grammatica en spreekt de gecorrigeerde versie terug.")));
      return;
    }

    if (ex.status === "new") return renderNewForm(host, ex, refresh);
    if (ex.status === "recording") return renderRecording(host, ex, refresh);
    if (ex.status === "processing") return renderProcessing(host, ex, refresh);
    if (ex.status === "error") return renderError(host, ex, refresh);
    if (ex.status === "ready") return renderReady(host, ex, refresh);
    host.append(el("p", null, "Onbekende status: " + ex.status));
  }

  /* ---------- New form ---------- */
  function renderNewForm(host, ex, refresh) {
    const card = el("div", { class: "card card-pad" });
    card.append(el("h3", { style: "margin:0 0 .5rem;font-family:var(--serif);font-weight:600" },
      "Nieuwe opname  ·  ", el("span", { style: "color:var(--ink-faint)" }, ex.level || "B2")));
    card.append(el("p", { class: "stat-note" },
      "Spreek vrijuit in het Nederlands. Een minuut is ideaal. De AI doet de rest."));

    const topicInput = el("input", { type: "text", placeholder: "Onderwerp (optioneel)", value: ex.topic || "" });
    topicInput.addEventListener("input", () => window.SprekenStore.update(ex.id, { topic: topicInput.value }));

    const levelSel = el("select", { class: "select-input" },
      el("option", { value: "B1" }, "B1 · lenient"),
      el("option", { value: "B2" }, "B2 · medium"),
      el("option", { value: "C1" }, "C1 · streng"),
    );
    levelSel.value = ex.level || "B2";
    levelSel.addEventListener("change", () => window.SprekenStore.update(ex.id, { level: levelSel.value }));

    card.append(
      el("div", { class: "field" }, el("label", null, "Onderwerp"), topicInput),
      el("div", { class: "field" }, el("label", null, "Niveau"), levelSel),
      el("button", {
        style: "margin-top:.7rem",
        onClick: () => startRecording(ex.id, refresh),
      }, "🎙 Start opname"),
    );
    host.append(card);
  }

  /* ---------- Recording ---------- */
  let activeRec = null;
  let recTimer = null;

  async function startRecording(exId, refresh) {
    if (!window.Audio2) { alert("Audio module ontbreekt."); return; }
    if (!window.WavEncoder) { alert("WAV encoder ontbreekt."); return; }
    try {
      activeRec = window.Audio2.recorder();
      await activeRec.start();
    } catch (e) {
      alert("Microfoon niet beschikbaar: " + e.message);
      activeRec = null;
      return;
    }
    window.SprekenStore.update(exId, { status: "recording" });
    refresh();
  }

  function renderRecording(host, ex, refresh) {
    const card = el("div", { class: "card card-pad", style: "text-align:center" });
    const seconds = el("div", { style: "font-family:var(--serif);font-size:3rem;font-weight:600;color:var(--rood);margin:.5rem 0;font-variant-numeric:tabular-nums" }, "0:00");
    const pulse = el("div", { style: "width:14px;height:14px;border-radius:50%;background:var(--rood);margin:0 auto;animation:pulse 1.2s ease-in-out infinite" });
    card.append(
      el("h3", { style: "margin:0;font-family:var(--serif);font-weight:600" }, "Aan het opnemen…"),
      pulse,
      seconds,
      el("p", { class: "stat-note" }, "Spreek vrijuit. Druk op stop wanneer je klaar bent."),
      el("button", {
        class: "primary",
        style: "margin-top:.6rem",
        onClick: async () => {
          clearInterval(recTimer); recTimer = null;
          if (!activeRec) return;
          try {
            const blob = await activeRec.stop();
            activeRec = null;
            window.SprekenStore.update(ex.id, { status: "processing", error: null });
            refresh();
            runPipeline(ex.id, blob, refresh);
          } catch (e) {
            window.SprekenStore.update(ex.id, { status: "error", error: e.message });
            refresh();
          }
        },
      }, "⏹ Stop opname"),
    );
    host.append(card);

    const t0 = Date.now();
    clearInterval(recTimer);
    recTimer = setInterval(() => { seconds.textContent = fmtTime((Date.now() - t0) / 1000); }, 250);
  }

  /* ---------- Processing pipeline ---------- */
  async function runPipeline(exId, webmBlob, refresh) {
    const ex = window.SprekenStore.get(exId);
    if (!ex) return;
    const stepsHost = document.querySelector(".spreken-steps");
    function step(msg, state) {
      if (!stepsHost) return;
      const last = stepsHost.querySelector(".gen-step.active");
      if (last && state === "done") last.classList.remove("active");
      const node = el("p", { class: "gen-step" + (state === "active" ? " active" : "") });
      node.innerHTML = state === "active" ? '<span class="ai-loading">' + msg + '</span>' : msg;
      stepsHost.append(node);
    }
    function markDone(text) {
      if (!stepsHost) return;
      const active = stepsHost.querySelector(".gen-step.active");
      if (active) { active.classList.remove("active"); active.innerHTML = '<span style="color:var(--groen)">✓ ' + text + '</span>'; }
    }
    function markFail(text) {
      if (!stepsHost) return;
      const active = stepsHost.querySelector(".gen-step.active");
      if (active) { active.classList.remove("active"); active.innerHTML = '<span class="ai-error">' + escapeHTML(text) + '</span>'; }
    }

    try {
      // 1. Save original audio
      step("Originele opname opslaan", "active");
      const originalAudioKey = "spreken-" + exId + "/original";
      await window.BlobStore.put(originalAudioKey, webmBlob);
      window.SprekenStore.update(exId, { originalAudioKey });
      markDone("Origineel bewaard");

      // 2. Whisper transcription with word timings
      step("Transcriberen (Whisper)", "active");
      const tr = await window.AI.transcribeWithTimestamps(webmBlob, { language: "nl" });
      window.SprekenStore.update(exId, { originalTranscript: tr.text || "", originalWordTimings: tr.words || [] });
      markDone(tr.text ? ((tr.words || []).length + " woorden getranscribeerd") : "geen transcript");

      // 3. Pronunciation assessment (needs WAV 16k)
      step("Uitspraak beoordelen (Azure)", "active");
      try {
        const wavBlob = await window.WavEncoder.blobToWav16k(webmBlob);
        const form = new FormData();
        form.append("file", wavBlob, "audio.wav");
        form.append("language", "nl-NL");  // BE-specific scoring isn't supported by the assessment endpoint; nl-NL is closest
        const az = await window.API.postForm("/api/ai/pronounce", form);
        const pron = normalisePronunciation(az);
        window.SprekenStore.update(exId, { pronunciation: pron });
        markDone(pron.pron != null ? ("PronScore " + pron.pron + "/100") : "voltooid");
      } catch (e) {
        markFail("Uitspraakbeoordeling overgeslagen: " + e.message);
      }

      // 4. Grammar / style correction on the transcript
      step("Tekst corrigeren", "active");
      const transcriptText = (window.SprekenStore.get(exId) || {}).originalTranscript || "";
      if (!transcriptText.trim()) throw new Error("Geen transcript om te corrigeren.");
      const corr = await window.AI.correctEssay({ essay: transcriptText, level: ex.level || "B2" });
      const title = corr.title && corr.title.trim() ? corr.title.trim() : ex.title;
      window.SprekenStore.update(exId, {
        title, autoTitled: true,
        correctedText: corr.correctedFull || "",
        sentences: corr.sentences || [],
        score: corr.score || null,
        vocab: corr.vocab || [],
        grammar: corr.grammar || [],
      });
      markDone((corr.sentences || []).length + " zinnen · " + (corr.vocab || []).length + " woordenschat");

      // 5. TTS of corrected text
      if ((corr.correctedFull || "").trim()) {
        step("Gecorrigeerde versie inspreken (Azure)", "active");
        try {
          const ttsBlob = await window.AI.generateSpeech(corr.correctedFull);
          const correctedAudioKey = "spreken-" + exId + "/corrected";
          await window.BlobStore.put(correctedAudioKey, ttsBlob);
          window.SprekenStore.update(exId, { correctedAudioKey });
          markDone("Audio bewaard");

          // 6. Word timings for the corrected audio so we can karaoke-sync
          step("Synchronisatie (gecorrigeerde audio)", "active");
          try {
            const tr2 = await window.AI.transcribeWithTimestamps(ttsBlob, { language: "nl" });
            window.SprekenStore.update(exId, { correctedWordTimings: tr2.words || [] });
            markDone((tr2.words || []).length + " woorden");
          } catch (e) {
            markFail("Sync overgeslagen: " + e.message);
          }
        } catch (e) {
          markFail("TTS overgeslagen: " + e.message);
        }
      }

      window.SprekenStore.update(exId, { status: "ready" });
      refresh();
    } catch (err) {
      markFail(err.message);
      window.SprekenStore.update(exId, { status: "error", error: err.message });
      setTimeout(refresh, 600);
    }
  }

  function normalisePronunciation(az) {
    const nb = (az && az.NBest && az.NBest[0]) || {};
    const pa = nb.PronunciationAssessment || {};
    return {
      pron:         pa.PronScore,
      accuracy:     pa.AccuracyScore,
      fluency:      pa.FluencyScore,
      completeness: pa.CompletenessScore,
      prosody:      pa.ProsodyScore,
      displayText:  az.DisplayText || nb.Display || "",
      words: (nb.Words || []).map((w) => ({
        word:     w.Word,
        accuracy: (w.PronunciationAssessment || {}).AccuracyScore,
        errorType:(w.PronunciationAssessment || {}).ErrorType,
        phonemes: (w.Phonemes || []).map((p) => ({
          phoneme:  p.Phoneme,
          accuracy: (p.PronunciationAssessment || {}).AccuracyScore,
        })),
      })),
    };
  }

  /* ---------- Processing view ---------- */
  function renderProcessing(host, ex, refresh) {
    const card = el("div", { class: "card card-pad" });
    card.append(
      el("h3", { style: "margin:0 0 .3rem;font-family:var(--serif);font-weight:600" }, "Bezig met verwerken"),
      el("p", { class: "stat-note" }, "Dit duurt 20-60 seconden."),
      el("div", { class: "spreken-steps", style: "margin-top:.6rem" }),
    );
    host.append(card);
  }

  /* ---------- Error ---------- */
  function renderError(host, ex, refresh) {
    host.append(el("div", { class: "card card-pad" },
      el("h3", { style: "color:var(--rood)" }, "Er ging iets mis"),
      el("p", null, ex.error || "Onbekende fout."),
      el("button", {
        onClick: () => { window.SprekenStore.update(ex.id, { status: "new", error: null }); refresh(); },
      }, "Opnieuw proberen"),
    ));
  }

  /* ---------- Ready: score card + tabs ---------- */
  function renderReady(host, ex, refresh) {
    host.append(renderScoreCard(ex));

    const stickyWrap = el("div", { class: "audio-tabs-sticky" });
    const tabBar = el("div", { class: "exam-tabs" });
    const tabBody = el("div");
    const tabs = [
      { key: "original",  label: "Origineel (jij)",       render: () => renderOriginal(ex) },
      { key: "corr",      label: "Correcties",            render: () => renderCorrections(ex) },
      { key: "corrected", label: "Gecorrigeerd (AI)",     render: () => renderCorrected(ex) },
      { key: "compare",   label: "Vergelijk",             render: () => renderCompare(ex) },
      { key: "vocab",     label: "Woordenschat & grammatica", render: () => renderVocabGrammar(ex, refresh) },
    ];
    let active = "original";
    function paintTabs() {
      tabBar.innerHTML = "";
      tabs.forEach((t) => {
        tabBar.append(el("button", {
          class: "exam-tab" + (active === t.key ? " active" : ""),
          onClick: () => { active = t.key; paintTabs(); paintBody(); },
        }, t.label));
      });
    }
    function paintBody() {
      tabBody.innerHTML = "";
      const t = tabs.find((t) => t.key === active);
      if (t) tabBody.append(t.render());
    }
    paintTabs(); paintBody();
    stickyWrap.append(tabBar);
    host.append(stickyWrap, tabBody);
  }

  /* ---------- Score card ---------- */
  function renderScoreCard(ex) {
    const card = el("div", { class: "card card-pad", style: "margin-bottom:1rem;display:grid;grid-template-columns:auto 1fr;gap:1.2rem;align-items:center" });
    const p = ex.pronunciation || {};
    // Big number is the 0-100 PronScore from Azure. Don't fall back to
    // ex.score.overall (1-10 scale) — color thresholds would mis-fire.
    const pron = p.pron;
    const color = pron == null ? "var(--ink-faint)" : (pron >= 80 ? "var(--groen)" : pron >= 60 ? "var(--geel)" : "var(--rood)");
    card.append(
      el("div", { style: "text-align:center;min-width:90px" },
        el("div", { style: "font-family:var(--serif);font-size:2.6rem;font-weight:600;line-height:1;color:" + color }, pron != null ? String(pron) : "—"),
        el("div", { style: "font-family:var(--mono);font-size:.7rem;letter-spacing:.14em;text-transform:uppercase;color:var(--ink-faint);margin-top:.15rem" }, "uitspraak"),
      ),
      (function() {
        const right = el("div", { style: "min-width:0" });
        const mini = el("div", { style: "display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:.4rem .8rem" });
        [
          ["Accuracy",     p.accuracy],
          ["Fluency",      p.fluency],
          ["Completeness", p.completeness],
          ["Prosody",      p.prosody],
        ].forEach(([lbl, v]) => {
          if (v == null) return;
          const c = v >= 80 ? "var(--groen)" : v >= 60 ? "var(--geel)" : "var(--rood)";
          mini.append(el("div", null,
            el("div", { style: "display:flex;justify-content:space-between;font-size:.72rem;color:var(--ink-soft);font-family:var(--mono);letter-spacing:.04em;margin-bottom:2px" },
              el("span", null, lbl),
              el("span", { style: "color:" + c + ";font-weight:600" }, v + "/100")),
            el("div", { style: "height:4px;background:var(--rule);border-radius:2px;overflow:hidden" },
              el("div", { style: "height:100%;width:" + v + "%;background:" + c }))
          ));
        });
        right.append(mini);
        // Text-correction score (Schrijven-style 1-10) shown as a chip on
        // its own line — not as the big number, since the scale differs.
        if (ex.score && typeof ex.score.overall === "number") {
          const tcol = ex.score.overall >= 8 ? "var(--groen)" : ex.score.overall >= 6 ? "var(--geel)" : "var(--rood)";
          right.append(el("p", { style: "margin:.5rem 0 0;font-family:var(--mono);font-size:.74rem;letter-spacing:.04em;color:var(--ink-soft)" },
            "Tekstcorrectie: ",
            el("strong", { style: "color:" + tcol + ";font-weight:600" }, ex.score.overall + "/10"),
          ));
        }
        if (ex.score && ex.score.summary) {
          const s = ex.score.summary;
          const summaryNL = (typeof s === "object" ? s.nl : s) || "";
          if (summaryNL) right.append(el("p", { style: "margin:.4rem 0 0;font-style:italic;color:var(--ink-soft);font-size:.9rem" }, '"' + summaryNL + '"'));
        }
        return right;
      })(),
    );
    return card;
  }

  /* ---------- Tab: Origineel ---------- */
  function renderOriginal(ex) {
    const wrap = el("div");
    if (!ex.originalAudioKey) {
      wrap.append(el("p", { class: "stat-note" }, "Geen originele audio."));
      return wrap;
    }
    const playerHost = el("div", { style: "background:var(--card);border:1px solid var(--rule);border-radius:4px;padding:.9rem 1.1rem;margin-bottom:1rem" });
    wrap.append(playerHost);
    window.BlobStore.getURL(ex.originalAudioKey).then((url) => {
      if (url) buildBasicPlayer(playerHost, url, "Jouw opname");
      else playerHost.innerHTML = '<p class="ai-error">Audio niet gevonden.</p>';
    });

    // Transcript with per-word colour by accuracy score
    const tHost = el("div", { style: "background:var(--paper-2);border:1px solid var(--rule);border-radius:4px;padding:1rem 1.2rem;line-height:1.9;font-family:var(--serif);font-size:1.05rem" });
    const transcript = ex.originalTranscript || "(geen transcript)";
    const wordScores = (ex.pronunciation && ex.pronunciation.words) || [];
    if (wordScores.length) {
      const lower = transcript.toLowerCase();
      // Greedy left-to-right match of each scored word to the transcript.
      let cursor = 0;
      wordScores.forEach((w) => {
        const needle = (w.word || "").toLowerCase();
        if (!needle) return;
        const idx = lower.indexOf(needle, cursor);
        if (idx < 0) return;
        if (idx > cursor) tHost.append(document.createTextNode(transcript.slice(cursor, idx)));
        const a = w.accuracy != null ? w.accuracy : 100;
        const color = a >= 80 ? "var(--groen)" : a >= 60 ? "var(--geel)" : "var(--rood)";
        const span = el("span", {
          style: "border-bottom:2px solid " + color + ";padding-bottom:1px;cursor:help",
          title: w.word + " · " + a + "/100" + (w.errorType && w.errorType !== "None" ? " · " + w.errorType : ""),
        }, transcript.substr(idx, needle.length));
        tHost.append(span);
        cursor = idx + needle.length;
      });
      if (cursor < transcript.length) tHost.append(document.createTextNode(transcript.slice(cursor)));
    } else {
      tHost.textContent = transcript;
    }
    wrap.append(tHost);

    // Legend
    wrap.append(el("p", { class: "stat-note", style: "margin-top:.5rem;font-family:var(--mono);font-size:.72rem;letter-spacing:.06em" },
      "Onderstreping = uitspraak-score per woord. ",
      el("span", { style: "color:var(--groen)" }, "groen ≥80"),
      "  ·  ",
      el("span", { style: "color:var(--geel)" }, "geel ≥60"),
      "  ·  ",
      el("span", { style: "color:var(--rood)" }, "rood <60"),
      ".  Hover een woord voor exacte score + fouttype."));
    return wrap;
  }

  /* ---------- Tab: Correcties ---------- */
  function renderCorrections(ex) {
    const wrap = el("div");
    const sentences = ex.sentences || [];
    if (!sentences.length) { wrap.append(el("p", { class: "stat-note" }, "Geen correcties.")); return wrap; }
    sentences.forEach((s) => {
      const card = el("div", { style: "padding:.7rem .9rem;border:1px solid var(--rule);border-radius:4px;margin-bottom:.5rem;background:var(--card)" });
      card.append(el("div", { style: "font-family:var(--serif);font-size:1rem;color:var(--ink-soft)" }, s.original || ""));
      if (s.needed && s.corrected && s.corrected !== s.original) {
        card.append(el("div", { style: "font-family:var(--serif);font-size:1rem;color:var(--groen);margin-top:.25rem" }, "→ " + s.corrected));
      }
      (s.notes || []).forEach((n) => {
        card.append(el("div", { style: "margin-top:.35rem;padding:.4rem .6rem;background:var(--paper-2);border-left:3px solid var(--rood);font-size:.85rem" },
          el("strong", null, n.error || ""), " → ",
          el("strong", { style: "color:var(--groen)" }, n.fix || ""),
          el("div", { style: "color:var(--ink-soft);margin-top:.2rem" }, n.rule || ""),
          el("span", { style: "font-family:var(--mono);font-size:.7rem;color:var(--ink-faint);letter-spacing:.06em" }, n.rubric || ""),
        ));
      });
      wrap.append(card);
    });
    return wrap;
  }

  /* ---------- Tab: Gecorrigeerd ---------- */
  function renderCorrected(ex) {
    const wrap = el("div");
    const playerHost = el("div", { style: "background:var(--card);border:1px solid var(--rule);border-radius:4px;padding:.9rem 1.1rem;margin-bottom:1rem" });
    wrap.append(playerHost);
    if (ex.correctedAudioKey) {
      window.BlobStore.getURL(ex.correctedAudioKey).then((url) => {
        if (url) buildBasicPlayer(playerHost, url, "AI-versie (Dena)");
      });
    } else {
      playerHost.innerHTML = '<p class="stat-note">Geen audio gegenereerd.</p>';
    }
    wrap.append(el("div", { style: "background:var(--paper-2);border:1px solid var(--rule);border-radius:4px;padding:1rem 1.2rem;line-height:1.9;font-family:var(--serif);font-size:1.05rem;white-space:pre-wrap" },
      ex.correctedText || "—"));
    return wrap;
  }

  /* ---------- Tab: Vergelijk ---------- */
  function renderCompare(ex) {
    const wrap = el("div", { style: "display:grid;grid-template-columns:repeat(auto-fit, minmax(280px, 1fr));gap:1rem" });
    const left  = el("div", { style: "background:var(--card);border:1px solid var(--rule);border-radius:4px;padding:.9rem 1.1rem" });
    const right = el("div", { style: "background:var(--card);border:1px solid var(--rule);border-radius:4px;padding:.9rem 1.1rem" });
    left.append(el("p", { class: "stat-note", style: "font-family:var(--mono);font-size:.72rem;letter-spacing:.12em;text-transform:uppercase;color:var(--ink-faint);margin-bottom:.3rem" }, "Jij"));
    right.append(el("p", { class: "stat-note", style: "font-family:var(--mono);font-size:.72rem;letter-spacing:.12em;text-transform:uppercase;color:var(--ink-faint);margin-bottom:.3rem" }, "AI (Dena)"));
    if (ex.originalAudioKey) window.BlobStore.getURL(ex.originalAudioKey).then((u) => { if (u) buildBasicPlayer(left, u, ""); });
    if (ex.correctedAudioKey) window.BlobStore.getURL(ex.correctedAudioKey).then((u) => { if (u) buildBasicPlayer(right, u, ""); });
    wrap.append(left, right);

    // Side-by-side transcripts
    const texts = el("div", { style: "display:grid;grid-template-columns:repeat(auto-fit, minmax(280px, 1fr));gap:1rem;margin-top:1rem" });
    texts.append(
      el("div", { style: "background:var(--paper-2);border-left:3px solid var(--ink-soft);padding:.7rem .9rem;font-family:var(--serif);line-height:1.7;white-space:pre-wrap" },
        ex.originalTranscript || "—"),
      el("div", { style: "background:var(--paper-2);border-left:3px solid var(--groen);padding:.7rem .9rem;font-family:var(--serif);line-height:1.7;white-space:pre-wrap" },
        ex.correctedText || "—"),
    );
    wrap.append(texts);
    return wrap;
  }

  /* ---------- Tab: Woordenschat & grammatica ---------- */
  function renderVocabGrammar(ex, refresh) {
    const wrap = el("div");
    const vocab = ex.vocab || [];
    const grammar = ex.grammar || [];

    // Push-to-corpus button
    const actions = el("div", { style: "display:flex;align-items:center;gap:.6rem;margin-bottom:.8rem" });
    if (!ex.pushedToCorpus && vocab.length) {
      const pushBtn = el("button", { class: "subtle", style: "font-size:.85rem" }, "Voeg " + vocab.length + " woorden toe aan corpus");
      pushBtn.addEventListener("click", () => {
        if (!confirm(`Voeg ${vocab.length} woordenschat-items toe aan je corpus?`)) return;
        const r = window.CustomVocab.addBatch(vocab.map((i) => ({
          dutch: i.dutch, english: i.english, level: i.level, core: i.core, exampleNL: i.note || "",
        })), { source: "spreken", sourceId: ex.id, category: "Spreken" });
        window.SprekenStore.update(ex.id, { pushedToCorpus: true });
        alert(`${r.added} toegevoegd · ${r.skipped} overgeslagen (al aanwezig).`);
        refresh();
      });
      actions.append(pushBtn);
    } else if (ex.pushedToCorpus) {
      actions.append(el("span", { class: "stat-note", style: "color:var(--groen)" }, "✓ Toegevoegd aan corpus"));
    }
    wrap.append(actions);

    if (vocab.length) {
      const table = el("div", { style: "display:grid;grid-template-columns:1fr 1fr auto auto;gap:.3rem .9rem;font-size:.9rem;margin-bottom:1.4rem" });
      vocab.forEach((v) => {
        table.append(
          el("div", { style: "font-family:var(--serif);color:var(--ink)" }, v.dutch || ""),
          el("div", { style: "color:var(--ink-soft)" }, v.english || ""),
          el("span", { style: "font-family:var(--mono);font-size:.7rem;color:var(--ink-faint);letter-spacing:.06em" }, v.level || ""),
          el("span", { style: "font-family:var(--mono);font-size:.7rem;color:" + (v.core ? "var(--rood)" : "var(--ink-faint)") + ";letter-spacing:.06em" }, v.core ? "core" : ""),
        );
      });
      wrap.append(el("h4", { style: "margin:0 0 .4rem" }, "Woordenschat"), table);
    }
    if (grammar.length) {
      wrap.append(el("h4", { style: "margin:0 0 .4rem" }, "Grammatica"));
      grammar.forEach((g) => {
        wrap.append(el("div", { style: "background:var(--paper-2);border:1px solid var(--rule);border-radius:4px;padding:.6rem .85rem;margin-bottom:.4rem" },
          el("strong", null, g.point || ""),
          el("p", { style: "margin:.3rem 0 0;font-size:.9rem;color:var(--ink-soft)" }, g.explanation || ""),
        ));
      });
    }
    return wrap;
  }

  /* ---------- Helpers ---------- */
  function buildBasicPlayer(host, url, label) {
    host.innerHTML = "";
    const audio = new Audio(url);
    audio.preload = "metadata";
    audio.style.display = "none";
    host.appendChild(audio);
    const playBtn = el("button", { class: "subtle", style: "font-size:1.1rem;padding:.35rem .8rem;min-width:48px" }, "▶");
    const time = el("span", { style: "font-family:var(--mono);font-size:.78rem;color:var(--ink-faint);margin-left:.6rem" }, "0:00 / 0:00");
    const speed = el("select", { class: "select-input", style: "margin-left:auto;min-width:auto;padding:.2rem .4rem" },
      ...[0.7, 0.85, 1.0, 1.15, 1.3].map((s) => el("option", { value: s, selected: s === 1 || undefined }, s + "×")));
    speed.addEventListener("change", () => { audio.playbackRate = parseFloat(speed.value); });
    const bar = el("div", { style: "flex:1;height:4px;background:var(--rule);border-radius:2px;cursor:pointer;margin:0 .8rem;position:relative" },
      el("div", { class: "fill", style: "height:100%;width:0;background:var(--rood);border-radius:2px" }));
    const fill = bar.querySelector(".fill");
    playBtn.addEventListener("click", () => { if (audio.paused) audio.play(); else audio.pause(); });
    audio.addEventListener("play",  () => { playBtn.textContent = "❚❚"; });
    audio.addEventListener("pause", () => { playBtn.textContent = "▶"; });
    audio.addEventListener("loadedmetadata", () => { time.textContent = "0:00 / " + fmtTime(audio.duration); });
    audio.addEventListener("timeupdate", () => {
      const pct = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
      fill.style.width = pct + "%";
      time.textContent = fmtTime(audio.currentTime) + " / " + fmtTime(audio.duration);
    });
    bar.addEventListener("click", (e) => {
      const r = bar.getBoundingClientRect();
      const ratio = (e.clientX - r.left) / r.width;
      audio.currentTime = Math.max(0, Math.min(audio.duration || 0, ratio * (audio.duration || 0)));
    });
    const row = el("div", { style: "display:flex;align-items:center" }, playBtn, bar, time, speed);
    host.append(row);
    if (label) host.prepend(el("div", { style: "font-family:var(--mono);font-size:.72rem;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-faint);margin-bottom:.4rem" }, label));
  }

  window.SprekenViews = { render };
})();
