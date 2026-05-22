/* Luisteren view inside b2-vocabulary. */
(function () {
  function el(tag, props, ...children) {
    const n = document.createElement(tag);
    if (props) Object.entries(props).forEach(([k, v]) => {
      if (k === "class") n.className = v;
      else if (k === "html") n.innerHTML = v;
      else if (k.startsWith("on") && typeof v === "function") n.addEventListener(k.slice(2).toLowerCase(), v);
      else if (v === true) n.setAttribute(k, "");
      else if (v != null && v !== false) n.setAttribute(k, v);
    });
    for (const c of children.flat()) {
      if (c == null || c === false) continue;
      n.append(c.nodeType ? c : document.createTextNode(c));
    }
    return n;
  }
  function escapeHTML(s) {
    return String(s || "").replace(/[&<>]/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;"}[c]));
  }
  function fmtTime(s) {
    if (!isFinite(s) || s < 0) return "0:00";
    return Math.floor(s / 60) + ":" + Math.floor(s % 60).toString().padStart(2, "0");
  }
  function relTime(iso) {
    if (!iso) return "—";
    const diff = (Date.now() - new Date(iso).getTime()) / 1000;
    if (diff < 60) return "nu";
    if (diff < 3600) return Math.floor(diff / 60) + "m";
    if (diff < 86400) return Math.floor(diff / 3600) + "u";
    return Math.floor(diff / 86400) + "d";
  }
  function shuffleArr(a) { const x = a.slice(); for (let i = x.length-1; i>0; i--) { const j = Math.floor(Math.random()*(i+1)); [x[i],x[j]]=[x[j],x[i]]; } return x; }

  /* ============ Main render ============ */
  function render(mount) {
    mount.innerHTML = "";
    if (!window.AI.isConfigured()) {
      mount.append(el("div", { class: "empty" },
        el("h3", null, "AI nog niet geconfigureerd"),
        el("p", null, "Open ", el("a", { href: "#/settings" }, "Instellingen"), " om je sleutel in te stellen.")));
      return;
    }

    const root = el("div", { class: "exam-page" });
    root.append(el("div", { class: "exam-head" },
      el("h2", { class: "view-title" }, "Luisteren ", el("span", { class: "accent" }, "· listening practice")),
      el("p", { class: "view-sub" }, "Geef een onderwerp op. De AI schrijft een fragment, leest het in, en stelt vragen. Bewaar nieuwe woorden naar je eigen corpus.")
    ));
    const sidebar = el("aside", { class: "exam-sidebar" });
    const main = el("div", { class: "exam-main" });
    root.append(sidebar, main);
    mount.append(root);

    let activeEx = getOrCreateActive();
    function getOrCreateActive() {
      const id = window.ListeningStore.getActiveId();
      if (id) { const e = window.ListeningStore.get(id); if (e) return e; }
      const all = window.ListeningStore.list();
      if (all.length) { window.ListeningStore.setActiveId(all[0].id); return all[0]; }
      return null;
    }

    function refresh() {
      const id = activeEx && activeEx.id;
      if (id) activeEx = window.ListeningStore.get(id);
      renderSidebar();
      renderMain();
    }

    function renderSidebar() {
      sidebar.innerHTML = "";
      sidebar.append(el("div", { class: "chat-side-actions" },
        el("button", { onClick: () => { showNewExerciseForm(); } }, "+ Nieuwe oefening"),
      ));
      const all = window.ListeningStore.list();
      const listEl = el("div", { class: "chat-side-list" });
      if (!all.length) listEl.append(el("div", { class: "chat-empty-state" }, "Geen oefeningen nog."));
      all.forEach((e) => {
        const active = activeEx && e.id === activeEx.id;
        const lvl = (e.level || "B2").toUpperCase();
        const item = el("button", {
          class: "chat-item" + (active ? " active" : "") + (e.autoTitled ? "" : " untitled"),
          onClick: () => {
            window.ListeningStore.setActiveId(e.id);
            activeEx = window.ListeningStore.get(e.id);
            refresh();
          },
        },
          el("span", { class: "ci-title" },
            el("span", { class: "level-badge l-" + lvl, style: "margin-right:.45rem;vertical-align:1px" }, lvl),
            e.title || "Naamloos"),
          el("span", { class: "ci-meta" },
            (e.status === "ready" ? "✓" : (e.status === "generating" ? "⏳" : (e.status === "error" ? "✗" : "○"))) +
            " · " + relTime(e.updatedAt) + (e.vocab ? " · " + e.vocab.length + " woorden" : "")),
          el("button", {
            class: "ci-del",
            onClick: (ev) => {
              ev.stopPropagation();
              if (!confirm(`"${e.title}" verwijderen?`)) return;
              if (e.audioKey && window.BlobStore) window.BlobStore.remove(e.audioKey).catch(() => {});
              window.ListeningStore.remove(e.id);
              activeEx = getOrCreateActive();
              refresh();
            },
          }, "✕"),
        );
        listEl.append(item);
      });
      sidebar.append(listEl);
      sidebar.append(el("div", { class: "chat-side-foot" },
        el("button", { class: "subtle", onClick: () => window.ListeningStore.exportAll() }, "Export"),
      ));
    }

    function showNewExerciseForm() {
      // Activate a "blank" mode: clear active, show form in main
      activeEx = null;
      window.ListeningStore.setActiveId(null);
      renderSidebar();
      renderNewForm();
    }

    function renderNewForm() {
      main.innerHTML = "";
      const s = window.Store.state.settings;
      const card = el("div", { class: "card card-pad" });
      const topicInput = el("textarea", {
        placeholder: "bv. 'A.R. Rahman's Oscar-moment' of 'de geschiedenis van de Belgische bierbrouwers'",
        rows: 3,
        style: "width:100%;font-family:var(--serif);font-size:1rem;padding:.7rem .9rem;background:var(--paper-2);border:1px solid var(--rule-strong);border-radius:4px;color:var(--ink);resize:vertical",
      });

      const langSel = el("select", { class: "select-input" },
        el("option", { value: "Dutch (Belgian / Standard Dutch register)" }, "Nederlands (BE Standaard)"),
        el("option", { value: "Dutch (Netherlands register)" }, "Nederlands (NL)"),
        el("option", { value: "English" }, "English"),
        el("option", { value: "German" }, "Deutsch"),
        el("option", { value: "French" }, "Français"),
      );
      langSel.value = s.outputLanguage || "Dutch (Belgian / Standard Dutch register)";

      const durSel = el("select", { class: "select-input" },
        el("option", { value: "1.5" }, "~1,5 min"),
        el("option", { value: "2" }, "~2 min"),
        el("option", { value: "2.5" }, "~2,5 min"),
        el("option", { value: "3" }, "~3 min"),
        el("option", { value: "4" }, "~4 min"),
      );
      durSel.value = String(s.durationMinutes || 2.5);

      // Level picker — affects script complexity and vocab density
      const levelSel = el("select", { class: "select-input" },
        el("option", { value: "B1" }, "B1 · intermediate (eenvoudiger zinsbouw)"),
        el("option", { value: "B2" }, "B2 · upper-intermediate (aanbevolen voor CNaVT prep)"),
        el("option", { value: "C1" }, "C1 · advanced (academisch, idiomatisch)"),
      );
      levelSel.value = s.lastExerciseLevel || "B2";

      const status = el("p", { class: "stat-note" });

      card.append(
        el("h3", { style: "font-family:var(--serif);font-weight:600;margin:0 0 .3rem" }, "Nieuwe luisteroefening"),
        el("p", { class: "stat-note", style: "margin-bottom:1rem" }, "Specifiek onderwerp. AI schrijft, spreekt in en stelt vragen op het gekozen niveau."),
        el("div", { class: "field" }, el("label", null, "Onderwerp"), topicInput),
        el("div", { class: "field" }, el("label", null, "Niveau"), levelSel,
          el("p", { class: "hint" }, "B1 = eenvoudige zinnen + alledaagse woorden. C1 = complexe syntaxis + abstract.")),
        el("div", { class: "field" }, el("label", null, "Taal"), langSel),
        el("div", { class: "field" }, el("label", null, "Lengte"), durSel),
        el("div", { style: "display:flex;gap:.5rem;margin-top:.6rem" },
          el("button", { onClick: () => start() }, "Genereer"),
          el("button", { class: "subtle", onClick: () => { activeEx = getOrCreateActive(); refresh(); } }, "Annuleer"),
        ),
        status,
      );
      main.append(card);

      async function start() {
        const topic = topicInput.value.trim();
        if (!topic) { status.innerHTML = '<span class="ai-error">Onderwerp is leeg.</span>'; return; }
        window.Store.state.settings.outputLanguage = langSel.value;
        window.Store.state.settings.durationMinutes = parseFloat(durSel.value);
        window.Store.state.settings.lastExerciseLevel = levelSel.value;
        window.Store.save();
        const newEx = window.ListeningStore.create(topic, { level: levelSel.value });
        activeEx = newEx;
        refresh();
      }
    }

    function renderMain() {
      main.innerHTML = "";
      if (!activeEx) {
        main.append(el("div", { class: "empty" },
          el("h3", null, "Begin met luisteren"),
          el("p", null, "Maak een nieuwe oefening — links of via de + knop."),
          el("button", { onClick: showNewExerciseForm }, "+ Nieuwe oefening")));
        return;
      }
      renderExerciseBody(activeEx);
    }

    async function renderExerciseBody(ex) {
      main.innerHTML = "";
      // Title row
      const titleNode = el("h3", { style: "font-family:var(--serif);font-weight:600;font-size:1.3rem;margin:0;flex:1;cursor:pointer", title: "Klik om te hernoemen" }, ex.title || "Naamloos");
      titleNode.addEventListener("click", () => renameTitleInline(titleNode, ex));
      const lvl = (ex.level || "B2").toUpperCase();
      main.append(el("div", { style: "display:flex;align-items:baseline;gap:.5rem;padding:1.2rem 1.4rem;border-bottom:1px solid var(--rule)" },
        el("span", { class: "level-badge l-" + lvl, style: "vertical-align:2px" }, lvl),
        titleNode,
        el("span", { class: "fc-meta", style: "margin:0" }, ex.topic ? "· " + ex.topic : ""),
      ));

      const body = el("div", { class: "exam-body" });
      main.append(body);

      // If still generating or new, run flow
      if (ex.status !== "ready") {
        const genHost = el("div", { class: "gen-state", style: "background:var(--paper-2);border:1px dashed var(--rule-strong);border-radius:4px;padding:1.6rem;text-align:center;margin:1rem 0" });
        body.append(genHost);
        await runGeneration(ex.id, genHost);
        const updated = window.ListeningStore.get(ex.id);
        if (!updated || updated.status !== "ready") return;
        return renderExerciseBody(updated);
      }

      // Player
      const playerHost = el("div", { class: "player", style: "background:var(--card);border:1px solid var(--rule);border-radius:4px;padding:1rem 1.2rem;margin:0 0 1.2rem" });
      body.append(playerHost);
      if (ex.audioKey && window.BlobStore) {
        window.BlobStore.getURL(ex.audioKey).then((url) => {
          if (url) buildPlayer(playerHost, url);
          else playerHost.innerHTML = '<p class="ai-error">Audio niet gevonden.</p>';
        });
      }

      // Tabs
      const tabBar = el("div", { class: "exam-tabs" });
      const tabBody = el("div");
      const tabs = [
        { key: "questions", label: "Vragen", render: () => renderQuestions(ex.id, paintBody) },
        { key: "transcript", label: "Transcript", render: () => renderTranscript(window.ListeningStore.get(ex.id)) },
        { key: "vocab", label: "Woordenschat & grammatica", render: () => renderVocabGrammar(ex.id, refresh) },
        { key: "practice", label: "Oefen woordenschat", render: () => renderVocabPractice(ex.id, paintBody) },
      ];
      let active = "questions";
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
      body.append(tabBar, tabBody);
    }

    function renameTitleInline(node, ex) {
      const input = document.createElement("input");
      input.type = "text"; input.value = ex.title || "";
      input.style.cssText = "font-family:var(--serif);font-weight:600;font-size:1.3rem;background:var(--card);border:1px solid var(--rood-soft);border-radius:3px;padding:.15rem .3rem;color:var(--ink);width:100%";
      node.replaceWith(input);
      input.focus(); input.select();
      function commit() {
        const v = input.value.trim() || ex.title;
        window.ListeningStore.update(ex.id, { title: v, autoTitled: true });
        refresh();
      }
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") { e.preventDefault(); commit(); }
        else if (e.key === "Escape") { refresh(); }
      });
      input.addEventListener("blur", commit);
    }

    /* ---- Player ---- */
    function buildPlayer(host, url) {
      host.innerHTML = "";
      const audio = new Audio(url);
      audio.preload = "metadata";
      // Attach to DOM so the karaoke highlighter can find it via querySelector.
      // Without controls + display:none it stays invisible.
      audio.style.display = "none";
      host.appendChild(audio);
      const playBtn = el("button", { class: "danger", style: "width:48px;height:48px;border-radius:50%;font-size:1.2rem;padding:0" }, "▶");
      const back10 = el("button", { class: "subtle", style: "min-height:auto;padding:.3rem .6rem;font-size:.8rem;font-family:var(--mono)" }, "-10");
      const back5 = el("button", { class: "subtle", style: "min-height:auto;padding:.3rem .6rem;font-size:.8rem;font-family:var(--mono)" }, "-5");
      const time = el("span", { style: "font-family:var(--mono);font-size:.85rem;color:var(--ink-faint);margin-left:auto;font-variant-numeric:tabular-nums" }, "0:00 / —");
      const row = el("div", { style: "display:flex;align-items:center;gap:.6rem;margin-bottom:.7rem" }, playBtn, back10, back5, time);

      const progress = el("div", { style: "width:100%;height:6px;background:var(--rule);border-radius:3px;cursor:pointer;overflow:hidden" });
      const fill = el("span", { style: "display:block;height:100%;background:var(--rood);width:0" });
      progress.append(fill);

      const speeds = el("div", { style: "display:inline-flex;background:var(--paper-2);border:1px solid var(--rule);border-radius:999px;padding:2px;gap:1px" });
      [0.75, 1, 1.25, 1.5].forEach((sp) => {
        const b = el("button", { class: sp === 1 ? "" : "subtle", style: "min-height:auto;padding:.2rem .65rem;font-size:.75rem;border-radius:999px;background:" + (sp===1?"var(--ink)":"transparent") + ";color:" + (sp===1?"var(--paper)":"var(--ink-soft)") + ";border:none" }, sp + "×");
        b.addEventListener("click", () => {
          audio.playbackRate = sp;
          speeds.querySelectorAll("button").forEach((x) => {
            x.style.background = x === b ? "var(--ink)" : "transparent";
            x.style.color = x === b ? "var(--paper)" : "var(--ink-soft)";
          });
        });
        speeds.append(b);
      });
      const loopBtn = el("button", { class: "subtle", style: "min-height:auto;padding:.3rem .8rem;font-size:.78rem;border-radius:999px" }, "↻ Herhaal");
      loopBtn.addEventListener("click", () => {
        audio.loop = !audio.loop;
        loopBtn.style.color = audio.loop ? "var(--rood)" : "";
        loopBtn.style.borderColor = audio.loop ? "var(--rood)" : "";
      });
      const extras = el("div", { style: "display:flex;gap:.5rem;align-items:center;margin-top:.8rem;flex-wrap:wrap" }, speeds, loopBtn);

      host.append(row, progress, extras);

      playBtn.addEventListener("click", () => { if (audio.paused) audio.play(); else audio.pause(); });
      back10.addEventListener("click", () => { audio.currentTime = Math.max(0, audio.currentTime - 10); });
      back5.addEventListener("click", () => { audio.currentTime = Math.max(0, audio.currentTime - 5); });
      audio.addEventListener("play", () => { playBtn.textContent = "❚❚"; });
      audio.addEventListener("pause", () => { playBtn.textContent = "▶"; });
      audio.addEventListener("loadedmetadata", () => { time.textContent = fmtTime(audio.currentTime) + " / " + fmtTime(audio.duration); });
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
    }

    /* ---- Tabs renderers ---- */
    function renderQuestions(id, repaint) {
      const ex = window.ListeningStore.get(id);
      const host = el("div", { class: "exam-questions" });
      const userAnswers = ex.userAnswers || [];
      const allAnswered = ex.questions.every((_, i) => typeof userAnswers[i] === "number");
      ex.questions.forEach((q, i) => {
        const card = el("div", { class: "exam-q" });
        card.append(el("p", { class: "exam-q-prompt" }, (i + 1) + ". " + q.q));
        q.options.forEach((opt, idx) => {
          const isChecked = userAnswers[i] === idx;
          card.append(el("label", { class: "exam-opt" +
              (allAnswered && idx === q.correctIndex ? " correct" : (allAnswered && isChecked && idx !== q.correctIndex ? " wrong" : "")) },
            el("input", {
              type: "radio", name: "q" + i,
              checked: isChecked || undefined,
              disabled: allAnswered || undefined,
              onChange: () => pickAnswer(i, idx),
            }),
            " " + opt));
        });
        if (allAnswered) {
          const correct = userAnswers[i] === q.correctIndex;
          const expl = q.explanation || {};
          card.append(el("div", { style: "margin-top:.5rem;font-size:.88rem;color:var(--ink-soft);font-style:italic" },
            el("strong", { style: "color:var(--ink);font-style:normal" }, correct ? "✓ Goed " : "✗ Niet juist "), "— ",
            expl.nl || "",
            expl.en ? el("div", { style: "color:var(--ink-faint);font-size:.78rem;margin-top:.2rem" }, expl.en) : null,
          ));
        }
        host.append(card);
      });
      function pickAnswer(qIdx, optIdx) {
        const cur = window.ListeningStore.get(id);
        const ua = (cur.userAnswers || []).slice();
        ua[qIdx] = optIdx;
        window.ListeningStore.update(id, { userAnswers: ua });
        if (repaint) repaint();
      }
      if (allAnswered) {
        const right = ex.questions.reduce((a, q, i) => a + (userAnswers[i] === q.correctIndex ? 1 : 0), 0);
        const summary = el("div", { class: "summary", style: "padding:1rem;text-align:center;background:var(--paper-2);border:1px solid var(--rule);border-radius:4px;margin-top:1rem" },
          el("p", { class: "big-num" }, right + "/" + ex.questions.length),
          el("p", { class: "stat-note" }, right === ex.questions.length ? "Perfect." : "Beluister nog eens als je wil."),
          el("button", { class: "subtle", style: "margin-top:.5rem", onClick: () => {
            window.ListeningStore.update(id, { userAnswers: [] });
            if (repaint) repaint();
          } }, "Opnieuw"),
        );
        host.append(summary);
      }
      return host;
    }

    function renderTranscript(ex) {
      const wrap = el("div");
      // Toolbar — Sync audio button when we don't yet have wordTimings
      const toolbar = el("div", { style: "display:flex;align-items:center;gap:.6rem;padding:.5rem .7rem;margin:0 0 .8rem;background:var(--paper-2);border:1px solid var(--rule);border-radius:4px;flex-wrap:wrap" });
      const status = el("span", { style: "font-family:var(--mono);font-size:.78rem;letter-spacing:.04em;color:var(--ink-faint)" });
      const hasTimings = Array.isArray(ex.wordTimings) && ex.wordTimings.length > 0;
      toolbar.append(el("span", { style: "font-family:var(--mono);font-size:.78rem;color:var(--ink-faint);letter-spacing:.04em" },
        hasTimings ? "✓ audio-sync aan" : "geen audio-sync"));
      if (!hasTimings && ex.audioKey) {
        const syncBtn = el("button", { class: "subtle", style: "font-size:.82rem;padding:.35rem .8rem;min-height:auto;margin-left:auto", onClick: async () => {
          syncBtn.disabled = true;
          status.innerHTML = '<span class="ai-loading">audio synchroniseren…</span>';
          try {
            const blob = await window.BlobStore.get(ex.audioKey);
            if (!blob) throw new Error("Audio niet gevonden in opslag.");
            const tr = await window.AI.transcribeWithTimestamps(blob, { language: "nl" });
            if (!tr.words.length) throw new Error("Geen woord-tijdstempels terug.");
            window.ListeningStore.update(ex.id, { wordTimings: tr.words, sttText: tr.text });
            status.innerHTML = '<span style="color:var(--groen)">✓ ' + tr.words.length + ' woorden gesync</span>';
            refresh();
          } catch (err) {
            status.innerHTML = '<span class="ai-error">' + escapeHTML(err.message) + '</span>';
            syncBtn.disabled = false;
          }
        } }, "↻ Synchroniseer audio");
        toolbar.append(syncBtn);
      }
      toolbar.append(status);
      wrap.append(toolbar);

      // Body
      const body = el("article", {
        class: "transcript-body" + (hasTimings ? " synced" : ""),
        style: "background:var(--card);border:1px solid var(--rule);border-radius:4px;padding:1.3rem 1.6rem;font-family:var(--serif);font-size:1.05rem;line-height:1.85;white-space:pre-wrap",
      });
      if (!hasTimings) {
        body.textContent = ex.script || "—";
      } else {
        // Render each word as a span with start/end attributes
        const audioEl = mount.querySelector("audio");
        ex.wordTimings.forEach((w, i) => {
          const span = el("span", {
            class: "ts-word",
            "data-start": String(w.start),
            "data-end": String(w.end),
            "data-idx": String(i),
            title: w.start.toFixed(2) + "s",
            onClick: () => {
              const a = mount.querySelector("audio");
              if (a) { a.currentTime = Math.max(0, w.start - 0.05); a.play().catch(() => {}); }
            },
          }, w.word);
          body.append(span);
          // Re-insert a space (the API strips between-word spaces inconsistently)
          body.append(document.createTextNode(" "));
        });
      }
      wrap.append(body);

      // Live highlighter — poll for the audio element since it loads async from
      // IndexedDB and may not exist when this render runs.
      if (hasTimings) {
        let attempts = 0;
        const poll = setInterval(() => {
          const audio = mount.querySelector("audio");
          if (audio) {
            clearInterval(poll);
            attachHighlighter(audio, body, ex.wordTimings);
          } else if (++attempts > 50) {
            clearInterval(poll);
            console.warn("Audio element niet gevonden voor sync-highlighter.");
          }
        }, 100);
      }
      return wrap;
    }

    function attachHighlighter(audio, body, timings) {
      // Guard against attaching multiple listeners to the same audio element
      // when the user switches tabs and triggers another render.
      if (audio.__tsHookedBody === body) return;
      audio.__tsHookedBody = body;
      let lastIdx = -1;

      function tick() {
        const t = audio.currentTime;
        // Binary search for current word
        let lo = 0, hi = timings.length - 1, found = -1;
        while (lo <= hi) {
          const mid = (lo + hi) >> 1;
          const w = timings[mid];
          if (t < w.start) hi = mid - 1;
          else if (t > w.end) lo = mid + 1;
          else { found = mid; break; }
        }
        // If between words, hold the most recent one
        if (found < 0 && t > 0) {
          let i = timings.length - 1;
          while (i >= 0 && timings[i].start > t) i--;
          found = i;
        }
        if (found === lastIdx) return;
        if (lastIdx >= 0) {
          const prev = body.querySelector(`.ts-word[data-idx="${lastIdx}"]`);
          if (prev) prev.classList.remove("active");
        }
        if (found >= 0) {
          const cur = body.querySelector(`.ts-word[data-idx="${found}"]`);
          if (cur) {
            cur.classList.add("active");
            if (!audio.paused) cur.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }
        lastIdx = found;
      }
      audio.addEventListener("timeupdate", tick);
      audio.addEventListener("seeked", tick);
      audio.addEventListener("loadedmetadata", tick);
      tick();   // run once now in case audio is already at a non-zero position
    }

    function renderVocabGrammar(id, refresh) {
      const ex = window.ListeningStore.get(id);
      const wrap = el("div");
      if (ex.script) {
        const status = el("span", { style: "font-family:var(--mono);font-size:.78rem;letter-spacing:.04em;color:var(--ink-faint)" });
        const reBtn = el("button", { class: "subtle", style: "font-size:.82rem;padding:.35rem .8rem;min-height:auto", onClick: async () => {
          if (!confirm("Vocabulary opnieuw extraheren?")) return;
          reBtn.disabled = true; status.innerHTML = '<span class="ai-loading">opnieuw extraheren…</span>';
          try {
            const vocab = await window.AI.extractVocab({ script: ex.script });
            window.ListeningStore.update(id, { vocab });
            status.innerHTML = '<span style="color:var(--groen)">✓ ' + vocab.length + ' items</span>';
            refresh();
          } catch (err) {
            status.innerHTML = '<span class="ai-error">' + escapeHTML(err.message) + '</span>';
          } finally {
            reBtn.disabled = false;
          }
        } }, "↻ Vocab opnieuw");
        const corpusBtn = el("button", { style: "font-size:.82rem;padding:.35rem .9rem;min-height:auto", onClick: () => openCorpusImport(ex) }, "+ Voeg toe aan corpus");
        wrap.append(el("div", { style: "display:flex;align-items:center;gap:.6rem;padding:.5rem .7rem;margin:0 0 1rem;background:var(--paper-2);border:1px solid var(--rule);border-radius:4px;flex-wrap:wrap" },
          el("span", { style: "font-family:var(--mono);font-size:.78rem;color:var(--ink-faint);letter-spacing:.04em" }, (ex.vocab || []).length + " woorden" + (ex.pushedToCorpus ? " · ✓ in corpus" : "")),
          reBtn,
          corpusBtn,
          status,
        ));
      }
      if (ex.vocab && ex.vocab.length) {
        wrap.append(el("h3", { style: "font-family:var(--serif);font-weight:600;font-size:1.05rem;margin:1.2rem 0 .6rem;color:var(--ink-soft)" }, "Woordenschat · vocabulary"));
        const ul = el("ul", { style: "list-style:none;margin:0;padding:0;display:grid;gap:.6rem" });
        ex.vocab.forEach((v) => {
          ul.append(el("li", { style: "background:var(--card);border:1px solid var(--rule);border-left:3px solid " + (v.core ? "var(--rood)" : "var(--delft)") + ";border-radius:4px;padding:.7rem 1rem" },
            el("span", { style: "font-family:var(--serif);font-weight:600;color:var(--ink)" }, v.dutch || ""),
            v.level ? el("span", { class: "level-badge l-" + v.level, style: "margin-left:.5rem" }, v.level) : null,
            v.core ? el("span", { style: "margin-left:.4rem;font-family:var(--mono);font-size:.62rem;letter-spacing:.12em;text-transform:uppercase;color:var(--rood);background:rgba(154,58,44,.08);padding:.05rem .4rem;border-radius:2px" }, "core") : null,
            el("span", { style: "display:block;color:var(--delft);font-style:italic;margin-top:.15rem;font-size:.92rem" }, v.english || ""),
            v.note ? el("span", { style: "display:block;font-size:.82rem;color:var(--ink-soft);margin-top:.3rem;line-height:1.5" }, v.note) : null,
          ));
        });
        wrap.append(ul);
      }
      if (ex.grammar && ex.grammar.length) {
        wrap.append(el("h3", { style: "font-family:var(--serif);font-weight:600;font-size:1.05rem;margin:1.2rem 0 .6rem;color:var(--ink-soft)" }, "Grammatica · grammar"));
        const ul = el("ul", { style: "list-style:none;margin:0;padding:0;display:grid;gap:.7rem" });
        ex.grammar.forEach((g) => {
          ul.append(el("li", { style: "background:var(--card);border:1px solid var(--rule);border-radius:4px;padding:.85rem 1.05rem" },
            el("p", { style: "font-family:var(--serif);font-weight:600;color:var(--rood);margin:0 0 .35rem" }, g.point || ""),
            el("p", { style: "margin:0;color:var(--ink-soft);font-size:.93rem;line-height:1.55" }, g.explanation || ""),
          ));
        });
        wrap.append(ul);
      }
      return wrap;
    }

    /* ---- Vocab practice tab (flashcards + test, with context) ---- */
    function renderVocabPractice(id, repaint) {
      const ex = window.ListeningStore.get(id);
      const vocab = (ex.vocab || []).filter((v) => v.dutch && v.english);
      if (!vocab.length) return el("p", { class: "ai-error" }, "Geen vocabulary beschikbaar.");
      const stateKey = "lvp:" + id;
      const persisted = (() => { try { return JSON.parse(localStorage.getItem(stateKey) || "null") || {}; } catch (e) { return {}; } })();
      const state = Object.assign({
        mode: "flash", direction: "nl-en",
        flashIndex: 0, flashFlipped: false,
        flashOrder: shuffleArr(vocab.map((_, i) => i)),
        testIndex: 0, testFlipped: false, testInput: "",
        testRight: 0, testWrong: 0,
        testOrder: shuffleArr(vocab.map((_, i) => i)),
      }, persisted);
      function save() { localStorage.setItem(stateKey, JSON.stringify(state)); }
      function paint() { save(); if (repaint) repaint(); }
      const wrap = el("div");
      wrap.append(el("div", { style: "display:flex;gap:.5rem;flex-wrap:wrap;align-items:center;margin-bottom:.6rem" },
        modeToggle("flash", "Flashcards"), modeToggle("test", "Test"),
        dirToggle("nl-en", "NL → EN"), dirToggle("en-nl", "EN → NL"),
        el("button", { class: "subtle", style: "font-size:.78rem;padding:.3rem .6rem;min-height:auto", onClick: () => {
          state.flashOrder = shuffleArr(vocab.map((_, i) => i));
          state.testOrder = shuffleArr(vocab.map((_, i) => i));
          state.flashIndex = 0; state.flashFlipped = false; state.testIndex = 0; state.testFlipped = false; state.testInput = "";
          state.testRight = 0; state.testWrong = 0; paint();
        } }, "↻ Schud"),
      ));
      if (state.mode === "flash") wrap.append(renderFlash(ex, vocab, state, paint));
      else wrap.append(renderTest(ex, vocab, state, paint));
      return wrap;

      function modeToggle(val, label) {
        return el("button", { class: state.mode === val ? "" : "subtle", style: "font-size:.78rem;padding:.3rem .8rem;min-height:auto;border-radius:999px",
          onClick: () => { state.mode = val; paint(); } }, label);
      }
      function dirToggle(val, label) {
        return el("button", { class: state.direction === val ? "" : "subtle", style: "font-size:.78rem;padding:.3rem .8rem;min-height:auto;border-radius:999px",
          onClick: () => { state.direction = val; paint(); } }, label);
      }
    }
    function findContext(script, word) {
      if (!script || !word) return "";
      const tok = word.split(/[\s/·,]/)[0].toLowerCase();
      if (!tok) return "";
      const sentences = script.split(/(?<=[.!?])\s+/);
      return sentences.find((s) => s.toLowerCase().includes(tok)) || "";
    }
    function highlightWord(sentence, word) {
      if (!sentence) return "";
      const tok = (word || "").split(/[\s/·,]/)[0];
      if (!tok) return escapeHTML(sentence);
      const esc = tok.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return escapeHTML(sentence).replace(new RegExp("(\\b" + esc + "\\w*)", "ig"), '<mark style="background:rgba(216,169,59,.35);padding:0 .1em;border-radius:2px;color:var(--ink)">$1</mark>');
    }
    function renderFlash(ex, vocab, state, paint) {
      if (state.flashIndex >= state.flashOrder.length) { state.flashIndex = 0; state.flashFlipped = false; }
      const v = vocab[state.flashOrder[state.flashIndex]];
      const prompt = state.direction === "nl-en" ? v.dutch : v.english;
      const answer = state.direction === "nl-en" ? v.english : v.dutch;
      const ctx = findContext(ex.script, v.dutch);
      const card = el("div", { class: "fc", style: "padding:2rem" });
      card.append(
        el("p", { class: "fc-meta" }, (state.flashIndex + 1) + " / " + state.flashOrder.length + " · " + (state.direction === "nl-en" ? "NL → EN" : "EN → NL")),
        el("p", { class: "fc-prompt" }, prompt),
      );
      if (state.flashFlipped) {
        card.append(el("p", { class: "fc-answer" }, answer));
        if (v.note) card.append(el("p", { style: "font-size:.85rem;color:var(--ink-soft);font-style:italic;margin:0 0 .6rem" }, v.note));
        if (ctx) {
          const c = el("p", { style: "font-family:var(--serif);font-size:.95rem;line-height:1.55;background:var(--paper-2);padding:.7rem .9rem;border-radius:4px;border-left:3px solid var(--delft);text-align:left;margin:.5rem 0" });
          c.innerHTML = '<span style="display:block;font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--ink-faint);margin-bottom:.2rem">In context:</span>' + highlightWord(ctx, v.dutch);
          card.append(c);
        }
      }
      const acts = el("div", { class: "fc-actions" });
      if (!state.flashFlipped) acts.append(el("button", { onClick: () => { state.flashFlipped = true; paint(); } }, "Omdraaien"));
      else acts.append(
        el("button", { class: "subtle", onClick: () => { state.flashIndex = (state.flashIndex - 1 + state.flashOrder.length) % state.flashOrder.length; state.flashFlipped = false; paint(); } }, "← Vorige"),
        el("button", { onClick: () => { state.flashIndex = (state.flashIndex + 1) % state.flashOrder.length; state.flashFlipped = false; paint(); } }, "Volgende →"),
      );
      card.append(acts);
      return card;
    }
    function renderTest(ex, vocab, state, paint) {
      if (state.testIndex >= state.testOrder.length) {
        const total = state.testOrder.length, right = state.testRight;
        return el("div", { class: "fc", style: "padding:1.8rem;text-align:center" },
          el("p", { class: "big-num" }, right + "/" + total),
          el("p", { class: "stat-note" }, right >= total * 0.7 ? "Mooi." : "Doe nog een ronde."),
          el("button", { style: "margin-top:.6rem", onClick: () => {
            state.testOrder = shuffleArr(vocab.map((_, i) => i));
            state.testIndex = 0; state.testFlipped = false; state.testInput = ""; state.testRight = 0; state.testWrong = 0; paint();
          } }, "Opnieuw"),
        );
      }
      const v = vocab[state.testOrder[state.testIndex]];
      const prompt = state.direction === "nl-en" ? v.dutch : v.english;
      const answer = state.direction === "nl-en" ? v.english : v.dutch;
      const ctx = findContext(ex.script, v.dutch);
      const card = el("div", { class: "fc", style: "padding:1.8rem" });
      card.append(
        el("p", { class: "fc-meta" }, (state.testIndex + 1) + " / " + state.testOrder.length + " · " + (state.direction === "nl-en" ? "NL → EN" : "EN → NL")),
        el("p", { class: "fc-prompt", style: "font-size:1.7rem" }, prompt),
      );
      if (ctx && !state.testFlipped) {
        const c = el("p", { style: "font-family:var(--serif);font-size:.9rem;background:var(--paper-2);padding:.6rem .8rem;border-radius:4px;border-left:3px solid var(--delft);text-align:left;margin:0 0 .6rem" });
        c.innerHTML = '<span style="display:block;font-family:var(--mono);font-size:.62rem;letter-spacing:.12em;text-transform:uppercase;color:var(--ink-faint);margin-bottom:.2rem">Hint:</span>' + highlightWord(ctx, v.dutch);
        card.append(c);
      }
      const input = el("input", { type: "text", class: "typed-input", autocomplete: "off", spellcheck: "false", disabled: state.testFlipped || undefined,
        onInput: (e) => { state.testInput = e.target.value; } });
      input.value = state.testInput || "";
      const fb = el("div", { class: "typed-feedback" });
      if (state.testFlipped) {
        const ok = looseEq(state.testInput, answer);
        fb.innerHTML = ok
          ? '<span style="color:var(--groen);font-weight:600">✓ Goed</span> — ' + escapeHTML(answer)
          : '<span style="color:var(--rood);font-weight:600">✗ Niet juist</span> — ' + escapeHTML(answer);
      }
      const acts = el("div", { class: "fc-actions" });
      if (!state.testFlipped) acts.append(
        el("button", { onClick: () => check() }, "Controleer"),
        el("button", { class: "subtle", onClick: () => { state.testFlipped = true; state.testWrong += 1; paint(); } }, "Weet niet"),
      );
      else acts.append(el("button", { onClick: () => next() }, "Volgende →"));
      function check() {
        state.testFlipped = true;
        if (looseEq(state.testInput, answer)) state.testRight += 1; else state.testWrong += 1;
        paint();
      }
      function next() { state.testIndex += 1; state.testFlipped = false; state.testInput = ""; paint(); }
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !state.testFlipped) { e.preventDefault(); check(); }
        else if (e.key === "Enter" && state.testFlipped) { e.preventDefault(); next(); }
      });
      setTimeout(() => { if (!state.testFlipped) input.focus(); }, 30);
      card.append(input, fb, acts);
      return card;
    }
    function looseEq(a, b) {
      const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
        .replace(/^(de |het |een |the |a |an )/, "").replace(/[.,;:!?'"„""()…]/g, "").replace(/\s+/g, " ").trim();
      const A = norm(a);
      if (!A) return false;
      return String(b || "").split(/[\/;,]/).map(norm).filter(Boolean).some((c) => c === A || lev(A, c) <= (c.length <= 6 ? 1 : 2));
    }
    function lev(a, b) {
      if (a === b) return 0; const m = a.length, n = b.length;
      if (!m) return n; if (!n) return m;
      const v = new Array(n + 1); for (let j = 0; j <= n; j++) v[j] = j;
      for (let i = 1; i <= m; i++) {
        let prev = i - 1; v[0] = i;
        for (let j = 1; j <= n; j++) { const tmp = v[j]; v[j] = a[i-1] === b[j-1] ? prev : 1 + Math.min(prev, v[j], v[j-1]); prev = tmp; }
      }
      return v[n];
    }

    /* ---- Corpus import modal ---- */
    function openCorpusImport(ex) {
      const overlay = el("div", { class: "hw-overlay" });
      const modal = el("div", { class: "hw-modal" });
      overlay.append(modal); document.body.append(overlay);
      function close() { overlay.remove(); }

      const items = (ex.vocab || []).map((v, idx) => ({
        idx,
        dutch: v.dutch, english: v.english, note: v.note || "",
        level: v.level || "B2",
        core: !!v.core,
        selected: true,
      }));
      const defaultCategory = "Listening · " + (ex.title || ex.topic || "custom");

      modal.append(el("div", { class: "hw-head" },
        el("h3", null, "Voeg toe aan corpus  ·  " + items.length + " woorden"),
        el("button", { class: "hw-close", onClick: close }, "✕"),
      ));

      const body = el("div", { style: "padding:1rem 1.4rem;max-height:60vh;overflow-y:auto" });
      const summary = el("p", { style: "color:var(--ink-soft);font-size:.88rem;margin:0 0 1rem" });

      function updateSummary() {
        const selected = items.filter((i) => i.selected);
        const core = selected.filter((i) => i.core).length;
        summary.textContent = `${selected.length} geselecteerd  ·  ${core} core  ·  ${selected.length - core} content`;
      }

      const bulkRow = el("div", { style: "display:flex;gap:.4rem;flex-wrap:wrap;margin-bottom:1rem" },
        el("button", { class: "subtle", style: "font-size:.78rem;padding:.3rem .7rem;min-height:auto",
          onClick: () => { items.forEach((i) => i.selected = true); rerenderItems(); } }, "Alles aan"),
        el("button", { class: "subtle", style: "font-size:.78rem;padding:.3rem .7rem;min-height:auto",
          onClick: () => { items.forEach((i) => i.selected = false); rerenderItems(); } }, "Alles uit"),
        el("button", { class: "subtle", style: "font-size:.78rem;padding:.3rem .7rem;min-height:auto",
          onClick: () => { items.forEach((i) => { if (i.core) i.selected = true; }); rerenderItems(); } }, "Alleen core selecteren"),
      );
      body.append(summary, bulkRow);

      const itemsHost = el("div", { style: "display:grid;gap:.3rem" });
      body.append(itemsHost);

      function rerenderItems() {
        itemsHost.innerHTML = "";
        items.forEach((it) => {
          const row = el("div", { style: "display:grid;grid-template-columns:auto 2fr 2fr auto auto;gap:.5rem;align-items:center;padding:.4rem .6rem;background:var(--paper-2);border:1px solid var(--rule);border-radius:3px;font-size:.86rem" });
          const cb = el("input", { type: "checkbox", checked: it.selected ? "" : undefined,
            onChange: (e) => { it.selected = e.target.checked; updateSummary(); } });
          if (!it.selected) cb.removeAttribute("checked");
          row.append(
            cb,
            el("span", { style: "font-family:var(--serif);font-weight:600" }, it.dutch),
            el("span", { style: "color:var(--ink-soft);font-style:italic" }, it.english),
            (function() {
              const sel = el("select", { class: "select-input", style: "font-size:.78rem;padding:.2rem .35rem" },
                el("option", { value: "A2" }, "A2"), el("option", { value: "B1" }, "B1"),
                el("option", { value: "B2" }, "B2"), el("option", { value: "C1" }, "C1"));
              sel.value = it.level;
              sel.addEventListener("change", () => { it.level = sel.value; });
              return sel;
            })(),
            (function() {
              const coreBtn = el("button", { class: it.core ? "" : "subtle",
                style: "font-size:.72rem;padding:.18rem .55rem;min-height:auto;border-radius:999px",
                onClick: () => { it.core = !it.core; coreBtn.className = it.core ? "" : "subtle"; coreBtn.textContent = it.core ? "★ core" : "core"; updateSummary(); } },
                it.core ? "★ core" : "core");
              return coreBtn;
            })(),
          );
          itemsHost.append(row);
        });
        updateSummary();
      }
      rerenderItems();

      modal.append(body);
      modal.append(el("div", { class: "hw-foot" },
        el("span", { style: "flex:1;font-size:.82rem;color:var(--ink-faint)" }, "Categorie: " + defaultCategory),
        el("button", { class: "subtle", onClick: close }, "Annuleren"),
        el("button", { onClick: () => apply() }, "Voeg toe"),
      ));

      function apply() {
        const selected = items.filter((i) => i.selected);
        if (!selected.length) { close(); return; }
        const toAdd = selected.map((i) => ({
          dutch: i.dutch,
          english: i.english,
          note: i.note,
          level: i.level,
          core: i.core,
          exampleNL: findContext(ex.script, i.dutch) || "",
          exampleEN: "",
        }));
        const result = window.CustomVocab.addBatch(toAdd, {
          category: defaultCategory,
          source: "listening",
          sourceId: ex.id,
          subcategory: ex.title || ex.topic,
        });
        window.ListeningStore.update(ex.id, { pushedToCorpus: true });
        alert(`${result.added} toegevoegd · ${result.skipped} overgeslagen (al aanwezig).`);
        close();
        refresh();
      }
    }

    /* ---- Generation flow ---- */
    async function runGeneration(exId, host) {
      function step(html) { host.innerHTML += '<p class="gen-step">' + html + '</p>'; }
      function setActive(html) { host.innerHTML += '<p class="gen-step"><span class="ai-loading">' + html + '</span></p>'; }
      host.innerHTML = '<h3 style="font-family:var(--serif);font-weight:600;margin:0 0 .5rem">Genereren</h3><p class="stat-note">Dit duurt 30-90 seconden.</p>';
      window.ListeningStore.update(exId, { status: "generating" });
      let ex = window.ListeningStore.get(exId);

      setActive("Script + vragen + woordenschat schrijven (" + (ex.level || "B2") + ")");
      let content;
      try {
        content = await window.AI.generateListeningExercise({ topic: ex.topic, level: ex.level || "B2" });
      } catch (err) {
        host.innerHTML += '<p class="ai-error">' + escapeHTML(err.message) + '</p>';
        window.ListeningStore.update(exId, { status: "error", error: err.message });
        return;
      }
      const steps = host.querySelectorAll(".gen-step");
      if (steps.length) steps[steps.length - 1].innerHTML = '<span style="color:var(--groen)">✓ Script + ' + ((content.vocab || []).length) + ' vocab + ' + ((content.questions || []).length) + ' vragen</span>';

      const title = content.title && content.title.trim() ? content.title.trim() : ex.title;
      window.ListeningStore.update(exId, {
        title, autoTitled: true,
        script: content.script || "",
        questions: content.questions || [],
        vocab: content.vocab || [],
        grammar: content.grammar || [],
      });

      const provider = window.Store.state.settings.ttsProvider || "openai";
      setActive("Audio inspreken (" + (provider === "azure" ? "Azure · Vlaams" : "OpenAI") + ")");
      let blob;
      try {
        blob = await window.AI.generateSpeech(content.script);
      } catch (err) {
        host.innerHTML += '<p class="ai-error">' + escapeHTML(err.message) + '</p>';
        window.ListeningStore.update(exId, { status: "error", error: err.message });
        return;
      }
      const audioKey = "listening-" + exId;
      if (window.BlobStore) await window.BlobStore.put(audioKey, blob);
      const steps2 = host.querySelectorAll(".gen-step");
      if (steps2.length) steps2[steps2.length - 1].innerHTML = '<span style="color:var(--groen)">✓ Audio opgeslagen</span>';

      window.ListeningStore.update(exId, { audioKey, userAnswers: [] });

      // Word-level alignment for karaoke-style transcript highlighting
      setActive("Audio synchroniseren (woord-tijdstempels)");
      try {
        const tr = await window.AI.transcribeWithTimestamps(blob, { language: "nl" });
        if (tr.words && tr.words.length) {
          window.ListeningStore.update(exId, { wordTimings: tr.words, sttText: tr.text });
          const steps3 = host.querySelectorAll(".gen-step");
          if (steps3.length) steps3[steps3.length - 1].innerHTML = '<span style="color:var(--groen)">✓ ' + tr.words.length + ' woorden gesynchroniseerd</span>';
        } else {
          const steps3 = host.querySelectorAll(".gen-step");
          if (steps3.length) steps3[steps3.length - 1].innerHTML = '<span style="color:var(--ink-faint)">— sync overgeslagen, geen woorden terug</span>';
        }
      } catch (e) {
        // Sync is non-fatal — exercise is still usable without it
        const steps3 = host.querySelectorAll(".gen-step");
        if (steps3.length) steps3[steps3.length - 1].innerHTML = '<span style="color:var(--ink-faint)">— sync overgeslagen (' + escapeHTML(e.message) + ')</span>';
      }

      window.ListeningStore.update(exId, { status: "ready" });
    }

    refresh();
  }

  window.ListeningViews = { render };
})();
