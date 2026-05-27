/* CNaVT C1 Exam page — Lezen, Luisteren, Schrijven, Spreken with AI grading. */
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

  const SECTIONS = [
    { key: "lezen",     label: "Lezen",     en: "reading" },
    { key: "luisteren", label: "Luisteren", en: "listening" },
    { key: "schrijven", label: "Schrijven", en: "writing" },
    { key: "spreken",   label: "Spreken",   en: "speaking" },
  ];

  function statusGlyph(status) {
    if (status === "graded") return "✓";
    if (status === "submitted") return "…";
    if (status === "generated" || status === "in-progress") return "●";
    return "○";
  }

  function relTime(iso) {
    if (!iso) return "—";
    const diff = (Date.now() - new Date(iso).getTime()) / 1000;
    if (diff < 60) return "nu";
    if (diff < 3600) return Math.floor(diff / 60) + "m";
    if (diff < 86400) return Math.floor(diff / 3600) + "u";
    return Math.floor(diff / 86400) + "d";
  }

  /* ============ Main render ============ */
  function render(mount) {
    mount.innerHTML = "";

    if (!window.AI || !window.AI.isConfigured()) {
      mount.append(el("div", { class: "empty-ai" },
        "AI nog niet geconfigureerd. ", el("a", { href: "#/settings" }, "Stel je sleutel in"), " om een examen te starten."));
      return;
    }

    const root = el("div", { class: "exam-page" });
    root.append(el("div", { class: "exam-head" },
      el("h2", { class: "view-title" }, "Examen ", el("span", { class: "accent" }, "· CNaVT C1 Educatief Professioneel")),
      el("p", { class: "view-sub" }, "Vier secties: Lezen, Luisteren, Schrijven, Spreken. De AI genereert je examenmateriaal en beoordeelt elke sectie volgens CNaVT-criteria.")
    ));

    const sidebar = el("aside", { class: "exam-sidebar" });
    const main = el("div", { class: "exam-main" });
    root.append(sidebar, main);
    mount.append(root);

    let activeExam = getOrCreateActive();

    function getOrCreateActive() {
      const id = window.ExamStore.getActiveId();
      if (id) {
        const e = window.ExamStore.get(id);
        if (e) return e;
      }
      const all = window.ExamStore.list();
      if (all.length) { window.ExamStore.setActiveId(all[0].id); return all[0]; }
      return null;
    }

    function refresh() {
      const id = activeExam && activeExam.id;
      if (id) activeExam = window.ExamStore.get(id);
      renderSidebar();
      renderMain();
    }

    function renderSidebar() {
      sidebar.innerHTML = "";
      sidebar.append(el("div", { class: "chat-side-actions" },
        el("button", { onClick: () => { activeExam = window.ExamStore.create(); refresh(); } }, "+ Nieuw examen"),
      ));
      const all = window.ExamStore.list();
      const list = el("div", { class: "chat-side-list" });
      if (!all.length) list.append(el("div", { class: "chat-empty-state" }, "Geen examens nog."));
      all.forEach((e) => {
        const active = activeExam && e.id === activeExam.id;
        const done = e.completedAt;
        const progress = SECTIONS.filter((s) => e.sections[s.key].status === "graded").length;
        list.append(el("button", {
          class: "chat-item" + (active ? " active" : ""),
          onClick: () => {
            window.ExamStore.setActiveId(e.id);
            activeExam = window.ExamStore.get(e.id);
            refresh();
          },
        },
          el("span", { class: "ci-title" }, e.title),
          el("span", { class: "ci-meta" },
            (done ? "voltooid · " : "") + `${progress}/4 secties · ${relTime(e.updatedAt)}`),
          el("button", {
            class: "ci-del",
            onClick: (ev) => { ev.stopPropagation();
              if (!confirm(`"${e.title}" verwijderen? (incl. audio-opnamen)`)) return;
              // Remove any audio blobs belonging to this exam
              if (window.BlobStore) window.BlobStore.removeByPrefix(`exam-${e.id}-`).catch(() => {});
              window.ExamStore.remove(e.id);
              activeExam = getOrCreateActive();
              refresh();
            },
          }, "✕"),
        ));
      });
      sidebar.append(list);
      sidebar.append(el("div", { class: "chat-side-foot" },
        el("button", { class: "subtle", onClick: () => window.ExamStore.exportAll() }, "Export"),
      ));
    }

    function renderMain() {
      main.innerHTML = "";
      if (!activeExam) {
        main.append(el("div", { class: "exam-start" },
          el("h3", { style: "font-family:var(--serif);font-weight:600" }, "Klaar voor je eerste examen?"),
          el("p", null, "Klik op ", el("strong", null, "+ Nieuw examen"), " links om te beginnen."),
        ));
        return;
      }
      // Section tabs
      const tabs = el("div", { class: "exam-tabs" });
      SECTIONS.forEach((s) => {
        const sec = activeExam.sections[s.key];
        const isCurrent = activeExam.currentSection === s.key;
        tabs.append(el("button", {
          class: "exam-tab" + (isCurrent ? " active" : "") + " status-" + sec.status,
          onClick: () => {
            window.ExamStore.setCurrentSection(activeExam.id, s.key);
            activeExam = window.ExamStore.get(activeExam.id);
            refresh();
          },
        },
          el("span", { class: "tab-status" }, statusGlyph(sec.status)),
          el("span", { class: "tab-label" }, s.label),
          el("span", { class: "tab-en" }, s.en),
        ));
      });
      main.append(tabs);

      // Body for current section
      const body = el("div", { class: "exam-body" });
      main.append(body);
      const current = activeExam.currentSection;
      if (current === "lezen")     renderLezen(body, activeExam);
      else if (current === "luisteren") renderLuisteren(body, activeExam);
      else if (current === "schrijven") renderSchrijven(body, activeExam);
      else if (current === "spreken")   renderSpreken(body, activeExam);
      else if (current === "done")      renderReport(body, activeExam);
    }

    /* ============ Common: status pill + grading rendering ============ */
    function statusPill(text, kind) {
      return el("span", { class: "exam-pill exam-pill-" + (kind || "neutral") }, text);
    }
    function renderRubric(host, grading) {
      if (!grading) return;
      const avg = grading.score != null ? grading.score : null;
      if (avg != null) {
        host.append(el("p", { class: "exam-score" }, `Score: ${avg}/5`));
      }
      if (grading.feedback) {
        const fb = grading.feedback;
        host.append(el("div", { class: "bilingual", style: "margin-top:.7rem;gap:.7rem 1.4rem" },
          el("div", { class: "nl" }, el("span", { class: "lang-tag" }, "NL"), fb.nl || ""),
          el("div", { class: "en" }, el("span", { class: "lang-tag" }, "EN"), fb.en || ""),
        ));
      }
      if (grading.criteria && grading.criteria.length) {
        const rubric = el("div", { class: "rubric", style: "margin-top:1rem" });
        grading.criteria.forEach((c) => {
          rubric.append(el("div", { class: "rubric-row score-" + c.score },
            el("span", { class: "name" }, c.name),
            el("span", { class: "score" }, c.score + "/5"),
            el("p", { class: "feedback" }, (c.feedback && c.feedback.nl) || c.feedback || ""),
          ));
        });
        host.append(rubric);
      }
    }

    /* ============ Lezen ============ */
    function renderLezen(host, exam) {
      const sec = exam.sections.lezen;
      host.append(el("h3", { class: "exam-section-title" }, "Lezen · reading"));

      if (sec.status === "pending") {
        host.append(el("p", { class: "exam-instr" }, "Klik op start: de AI genereert een Nederlandse passage (~400 woorden) en vragen op CNaVT C1-niveau."));
        host.append(el("button", { onClick: () => generateLezen(exam) }, "Start sectie"));
        return;
      }
      const content = sec.content;
      if (!content) return;
      host.append(el("article", { class: "exam-passage" }, el("p", { html: format(content.passage) })));
      // Questions
      const qHost = el("div", { class: "exam-questions" });
      content.questions.forEach((q, i) => {
        const block = el("div", { class: "exam-q" });
        block.append(el("p", { class: "exam-q-prompt" }, `${i + 1}. ${q.q}`));
        if (q.type === "mc" && Array.isArray(q.options)) {
          q.options.forEach((opt, idx) => {
            const id = `lz-q${i}-o${idx}`;
            const checked = sec.answers && sec.answers[i] === idx;
            const label = el("label", { class: "exam-opt" },
              el("input", { type: "radio", name: `lz-q${i}`, value: String(idx), checked: checked || undefined,
                disabled: sec.status === "graded" || undefined,
                onChange: () => setAnswer(exam, "lezen", i, idx) }),
              " " + opt,
            );
            block.append(label);
          });
        } else {
          const ta = el("textarea", { class: "exam-textarea", rows: "2", placeholder: "Jouw antwoord…",
            disabled: sec.status === "graded" || undefined,
            onInput: (e) => setAnswer(exam, "lezen", i, e.target.value),
          }, (sec.answers && sec.answers[i]) || "");
          block.append(ta);
        }
        qHost.append(block);
      });
      host.append(qHost);

      if (sec.status === "graded") {
        renderRubric(host, sec.grading);
      } else {
        host.append(el("div", { class: "exam-actions" },
          el("button", { onClick: () => gradeLezen(exam) }, "Indienen · submit"),
        ));
      }
    }

    /* ============ Luisteren ============ */
    function renderLuisteren(host, exam) {
      const sec = exam.sections.luisteren;
      host.append(el("h3", { class: "exam-section-title" }, "Luisteren · listening"));

      if (sec.status === "pending") {
        host.append(el("p", { class: "exam-instr" }, "Klik op start: de AI schrijft een dialoog of monoloog van ~120-180 woorden, spreekt die in (TTS), en stelt 5 vragen."));
        host.append(el("button", { onClick: () => generateLuisteren(exam) }, "Start sectie"));
        return;
      }
      const content = sec.content;
      if (!content) return;

      const audioHost = el("div", { class: "exam-audio-host" });
      host.append(audioHost);
      const audioKey = `exam-${exam.id}-luisteren-audio`;
      if (sec.audioKey || sec.audioDataUrl) {
        // Legacy support for old data-URL records; new ones use IDB
        if (sec.audioDataUrl) {
          audioHost.append(el("audio", { controls: true, src: sec.audioDataUrl, style: "width:100%" }));
        } else {
          // Asynchronously hydrate from IDB
          audioHost.append(el("span", { class: "ai-loading" }, "audio laden…"));
          window.BlobStore.getURL(audioKey).then((url) => {
            audioHost.innerHTML = "";
            if (url) {
              audioHost.append(el("audio", { controls: true, src: url, style: "width:100%" }));
            } else {
              audioHost.append(el("button", { onClick: () => generateLuisterenAudio(exam) }, "Audio genereren · generate audio"));
            }
          });
        }
      } else {
        audioHost.append(el("button", { onClick: () => generateLuisterenAudio(exam) }, "Audio genereren · generate audio"));
      }

      // Transcript reveal (hidden by default — listening exam)
      const trWrap = el("details", { class: "exam-transcript" });
      trWrap.append(el("summary", null, "Transcript tonen (alleen na luisteren)"));
      trWrap.append(el("p", null, content.script));
      host.append(trWrap);

      const qHost = el("div", { class: "exam-questions" });
      content.questions.forEach((q, i) => {
        const block = el("div", { class: "exam-q" });
        block.append(el("p", { class: "exam-q-prompt" }, `${i + 1}. ${q.q}`));
        if (q.type === "mc" && Array.isArray(q.options)) {
          q.options.forEach((opt, idx) => {
            block.append(el("label", { class: "exam-opt" },
              el("input", { type: "radio", name: `ls-q${i}`,
                checked: (sec.answers && sec.answers[i] === idx) || undefined,
                disabled: sec.status === "graded" || undefined,
                onChange: () => setAnswer(exam, "luisteren", i, idx) }),
              " " + opt));
          });
        } else {
          block.append(el("textarea", { class: "exam-textarea", rows: "2",
            disabled: sec.status === "graded" || undefined,
            onInput: (e) => setAnswer(exam, "luisteren", i, e.target.value),
          }, (sec.answers && sec.answers[i]) || ""));
        }
        qHost.append(block);
      });
      host.append(qHost);

      if (sec.status === "graded") {
        renderRubric(host, sec.grading);
      } else {
        host.append(el("div", { class: "exam-actions" },
          el("button", { onClick: () => gradeLuisteren(exam) }, "Indienen · submit"),
        ));
      }
    }

    /* ============ Schrijven ============ */
    function renderSchrijven(host, exam) {
      const sec = exam.sections.schrijven;
      host.append(el("h3", { class: "exam-section-title" }, "Schrijven · writing"));

      if (sec.status === "pending") {
        host.append(el("p", { class: "exam-instr" }, "Klik op start: de AI geeft je een CNaVT-stijl schrijfopdracht."));
        host.append(el("button", { onClick: () => generateSchrijven(exam) }, "Start sectie"));
        return;
      }
      const content = sec.content;
      if (!content) return;
      host.append(el("div", { class: "exam-prompt-box" },
        el("p", { class: "exam-prompt-meta" },
          `${content.type || "Schrijfopdracht"} · doelpubliek: ${content.audience || "—"} · ${content.expectedLength || "200-400 woorden"}`),
        el("p", { class: "exam-prompt-text" }, content.prompt),
      ));

      const ta = el("textarea", { class: "essay-area",
        placeholder: "Begin met schrijven… of upload/scan handgeschreven pagina's hieronder.",
        disabled: sec.status === "graded" || undefined,
        onInput: (e) => { sec.response = e.target.value; setSectionField(exam, "schrijven", { response: e.target.value }); updateWC(); },
      }, sec.response || "");

      // Upload / capture toolbar — only when not yet graded
      if (sec.status !== "graded" && window.Handwriting) {
        const ocrStatus = el("span", { class: "exam-status", style: "margin-left:.5rem" });
        const toolbar = el("div", { class: "schrijven-actions" },
          el("button", { class: "subtle", title: "Scan met je Mac-webcam of upload foto's van handgeschreven pagina's",
            onClick: async () => {
              try {
                const pages = await window.Handwriting.openCaptureModal();
                if (!pages || !pages.length) return;
                ocrStatus.innerHTML = `<span class="ai-loading">${pages.length} pagina${pages.length === 1 ? "" : "'s"} transcriberen…</span>`;
                const text = await window.Handwriting.transcribePages(pages);
                // Append (or replace) — confirm if textarea already has content
                let newVal = text;
                if (ta.value.trim()) {
                  const append = confirm("Bestaande tekst behouden en transcriptie eronder zetten?\nOK = toevoegen.  Annuleer = vervangen.");
                  newVal = append ? (ta.value.trimEnd() + "\n\n" + text) : text;
                }
                ta.value = newVal;
                sec.response = newVal;
                setSectionField(exam, "schrijven", { response: newVal });
                updateWC();
                ocrStatus.textContent = "✓ Transcriptie ingevoegd — controleer en bewerk waar nodig.";
              } catch (err) {
                ocrStatus.innerHTML = `<span class="ai-error">${err.message}</span>`;
              }
            },
          }, "📷 Scan / upload pagina's"),
          el("span", { class: "or" }, "— of typ direct hieronder"),
          ocrStatus,
        );
        host.append(toolbar);
      }

      host.append(ta);
      const meta = el("p", { class: "essay-meta" }, el("span", { id: "schr-wc" }, "0 woorden"));
      host.append(meta);
      function updateWC() {
        const wc = (ta.value.match(/\b[\w'-]+\b/g) || []).length;
        meta.querySelector("#schr-wc").textContent = wc + " woord" + (wc === 1 ? "" : "en");
      }
      updateWC();

      if (sec.status === "graded") {
        renderRubric(host, sec.grading);
      } else {
        host.append(el("div", { class: "exam-actions" },
          el("button", { onClick: () => gradeSchrijven(exam) }, "Indienen · submit"),
        ));
      }
    }

    /* ============ Spreken ============ */
    function renderSpreken(host, exam) {
      const sec = exam.sections.spreken;
      host.append(el("h3", { class: "exam-section-title" }, "Spreken · speaking"));

      if (sec.status === "pending") {
        host.append(el("p", { class: "exam-instr" }, "Klik op start: de AI geeft je een spreekopdracht. Vervolgens neem je je antwoord op via je microfoon."));
        host.append(el("button", { onClick: () => generateSpreken(exam) }, "Start sectie"));
        return;
      }
      const content = sec.content;
      if (!content) return;

      host.append(el("div", { class: "exam-prompt-box" },
        el("p", { class: "exam-prompt-meta" }, `Verwachte duur: ${content.expectedDuration || "60-90 seconden"}`),
        el("p", { class: "exam-prompt-text" }, content.prompt),
        content.tips && content.tips.length ? el("ul", { class: "exam-tips" },
          ...content.tips.map((t) => el("li", null, t))) : null,
      ));

      // Recorder
      const recState = { rec: null, recording: false, startedAt: 0, timer: null };
      const timeLbl = el("span", { class: "exam-timer" }, "00:00");
      const recBtn = el("button", null, sec.recordingKey ? "● Opnieuw opnemen" : "● Opnemen");
      const transcribeBtn = el("button", { class: "subtle", disabled: !sec.recordingKey }, "Transcribeer & beoordeel");
      const audioHost = el("div", { style: "margin:.6rem 0" });
      const status = el("span", { class: "exam-status" });

      // If we already have a stored recording, hydrate the playback element
      const recordingKey = sec.recordingKey || `exam-${exam.id}-spreken-recording`;
      if (sec.recordingKey) {
        window.BlobStore.getURL(sec.recordingKey).then((url) => {
          if (url) {
            audioHost.innerHTML = "";
            audioHost.append(el("audio", { controls: true, src: url, style: "width:100%" }));
          }
        });
      }

      recBtn.addEventListener("click", async () => {
        if (!recState.recording) {
          try {
            recState.rec = window.Audio2.recorder();
            await recState.rec.start();
            recState.recording = true;
            recState.startedAt = Date.now();
            recState.timer = setInterval(() => {
              const s = Math.floor((Date.now() - recState.startedAt) / 1000);
              timeLbl.textContent = `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
            }, 200);
            recBtn.textContent = "■ Stop";
            recBtn.classList.add("recording");
          } catch (err) {
            status.textContent = "Geen microfoontoegang: " + err.message;
          }
        } else {
          recState.recording = false;
          clearInterval(recState.timer);
          recBtn.disabled = true;
          status.innerHTML = '<span class="ai-loading">opname opslaan…</span>';
          try {
            const blob = await recState.rec.stop();
            // Persist to IndexedDB so it survives reloads / page switches
            await window.BlobStore.put(recordingKey, blob, { kind: "speech", examId: exam.id });
            window.ExamStore.updateSection(exam.id, "spreken", { recordingKey, recordedAt: new Date().toISOString() });
            audioHost.innerHTML = "";
            const url = URL.createObjectURL(blob);
            audioHost.append(el("audio", { controls: true, src: url, style: "width:100%" }));
            sec.audioBlob = blob; // keep in-memory ref for transcribe call
            transcribeBtn.disabled = false;
            recBtn.textContent = "● Opnieuw opnemen";
            recBtn.classList.remove("recording");
            recBtn.disabled = false;
            status.textContent = "Opname opgeslagen. Druk op 'Transcribeer & beoordeel'.";
          } catch (err) {
            status.textContent = "Opname mislukt: " + err.message;
            recBtn.disabled = false;
          }
        }
      });

      transcribeBtn.addEventListener("click", () => transcribeAndGrade(exam, sec, status));

      host.append(
        el("div", { class: "exam-record-row" }, recBtn, timeLbl, status),
        audioHost,
        el("div", { class: "exam-actions" }, transcribeBtn),
      );

      if (sec.transcription) {
        host.append(el("div", { class: "exam-transcription" },
          el("p", { class: "exam-transcription-head" }, "Jouw transcriptie · your transcription"),
          el("p", null, sec.transcription),
        ));
      }
      if (sec.status === "graded") renderRubric(host, sec.grading);
    }

    /* ============ Section-completion → done report ============ */
    function renderReport(host, exam) {
      host.append(el("h3", { class: "exam-section-title" }, "Eindrapport · final report"));
      const overall = SECTIONS.map((s) => {
        const g = exam.sections[s.key].grading;
        return { label: s.label, score: g && g.score != null ? g.score : null };
      });
      const valid = overall.filter((x) => x.score != null);
      const avg = valid.length ? (valid.reduce((a, x) => a + x.score, 0) / valid.length).toFixed(1) : "—";
      host.append(el("div", { class: "exam-report-overall" },
        el("span", { class: "big-num" }, avg + " / 5"),
        el("span", null, valid.length + "/" + SECTIONS.length + " secties beoordeeld"),
      ));
      const grid = el("div", { class: "exam-report-grid" });
      SECTIONS.forEach((s) => {
        const sec = exam.sections[s.key];
        const g = sec.grading;
        grid.append(el("div", { class: "exam-report-card score-" + (g ? g.score : 0) },
          el("p", { class: "exam-report-card-head" }, s.label),
          el("p", { class: "exam-report-card-score" }, g && g.score != null ? g.score + "/5" : "—"),
          g && g.feedback && g.feedback.nl ? el("p", { class: "exam-report-card-fb" }, g.feedback.nl) : null,
        ));
      });
      host.append(grid);
    }

    /* ============ Helpers — write back to store ============ */
    function setAnswer(exam, sectionKey, qIdx, value) {
      const sec = exam.sections[sectionKey];
      if (!sec.answers) sec.answers = (sec.content.questions || []).map(() => null);
      sec.answers[qIdx] = value;
      window.ExamStore.updateSection(exam.id, sectionKey, { answers: sec.answers, status: "in-progress" });
    }
    function setSectionField(exam, sectionKey, patch) {
      window.ExamStore.updateSection(exam.id, sectionKey, patch);
    }

    /* ============ AI calls for each section ============ */
    async function generateLezen(exam) {
      window.ExamStore.updateSection(exam.id, "lezen", { status: "generating" });
      refresh();
      const sys = "Je genereert examenmateriaal voor CNaVT C1 Educatief Professioneel (Vlaams-Belgisch). Geef ALLEEN geldige JSON terug:\n{\n  \"passage\": \"<350-450 woorden Nederlandse tekst, journalistiek/redactioneel register, over een actueel maatschappelijk thema in België of Vlaanderen>\",\n  \"questions\": [\n    {\"type\":\"mc\", \"q\":\"vraag\", \"options\":[\"a\",\"b\",\"c\",\"d\"], \"correctIndex\":0},\n    {\"type\":\"mc\", \"q\":\"...\", \"options\":[...], \"correctIndex\":1},\n    {\"type\":\"mc\", \"q\":\"...\", \"options\":[...], \"correctIndex\":2},\n    {\"type\":\"open\", \"q\":\"open vraag waarin de leerder een mening of analyse moet geven\", \"modelAnswer\":\"verwacht antwoord, ~2 zinnen\"},\n    {\"type\":\"open\", \"q\":\"...\", \"modelAnswer\":\"...\"}\n  ]\n}";
      try {
        const r = await window.AI.complete({
          kind: "exam-lezen-gen",
          system: sys, user: "Genereer een nieuw passage. Sessie-id: " + exam.id.slice(-6),
          maxTokens: 2200, json: true, reasoning: "low", noCache: true,
        });
        const content = JSON.parse(r.text);
        window.ExamStore.updateSection(exam.id, "lezen", { status: "generated", content });
        activeExam = window.ExamStore.get(exam.id);
        refresh();
      } catch (e) {
        alert("Genereren mislukt: " + e.message);
        window.ExamStore.updateSection(exam.id, "lezen", { status: "pending" });
        refresh();
      }
    }
    async function gradeLezen(exam) {
      const sec = exam.sections.lezen;
      const sys = "Je beoordeelt antwoorden op een CNaVT C1-leestoets. Voor MC-vragen vergelijk je gewoon met correctIndex. Voor open vragen evalueer je inhoud (was de tekst correct begrepen), volledigheid en beknoptheid. Geef JSON:\n{\n  \"score\": <gemiddelde over 5 vragen, 1 decimaal, schaal 1-5>,\n  \"perQuestion\": [{\"correct\": true|false, \"feedback\": {\"nl\":\"...\", \"en\":\"...\"}}],\n  \"feedback\": {\"nl\":\"globaal in 2 zinnen\", \"en\":\"global in 2 sentences\"}\n}";
      const user = JSON.stringify({ passage: sec.content.passage, questions: sec.content.questions, answers: sec.answers });
      window.ExamStore.updateSection(exam.id, "lezen", { status: "submitted" });
      refresh();
      try {
        const r = await window.AI.complete({
          kind: "exam-lezen-grade",
          system: sys, user, maxTokens: 1500, json: true, reasoning: "low", noCache: true,
        });
        const grading = JSON.parse(r.text);
        window.ExamStore.updateSection(exam.id, "lezen", { status: "graded", grading });
        activeExam = window.ExamStore.get(exam.id);
        refresh();
      } catch (e) {
        alert("Beoordeling mislukt: " + e.message);
        window.ExamStore.updateSection(exam.id, "lezen", { status: "generated" });
        refresh();
      }
    }

    async function generateLuisteren(exam) {
      window.ExamStore.updateSection(exam.id, "luisteren", { status: "generating" });
      refresh();
      const sys = "Je genereert luistermateriaal voor CNaVT C1 Educatief Professioneel. Schrijf een dialoog of korte monoloog die ~90 seconden duurt voorgelezen (~140-180 woorden), in BE Standaardnederlands, op een actueel/professioneel thema. Geef ALLEEN JSON:\n{\n  \"script\": \"<de tekst om voor te lezen — natuurlijk gesproken Nederlands>\",\n  \"questions\": [\n    {\"type\":\"mc\",\"q\":\"...\",\"options\":[\"a\",\"b\",\"c\",\"d\"],\"correctIndex\":0},\n    {\"type\":\"mc\",\"q\":\"...\",\"options\":[...],\"correctIndex\":1},\n    {\"type\":\"mc\",\"q\":\"...\",\"options\":[...],\"correctIndex\":2},\n    {\"type\":\"open\",\"q\":\"...\",\"modelAnswer\":\"...\"},\n    {\"type\":\"open\",\"q\":\"...\",\"modelAnswer\":\"...\"}\n  ]\n}";
      try {
        const r = await window.AI.complete({
          kind: "exam-luisteren-gen",
          system: sys, user: "Genereer luistermateriaal. Sessie-id: " + exam.id.slice(-6),
          maxTokens: 2000, json: true, reasoning: "low", noCache: true,
        });
        const content = JSON.parse(r.text);
        window.ExamStore.updateSection(exam.id, "luisteren", { status: "generated", content, audioDataUrl: null });
        activeExam = window.ExamStore.get(exam.id);
        refresh();
      } catch (e) {
        alert("Genereren mislukt: " + e.message);
        window.ExamStore.updateSection(exam.id, "luisteren", { status: "pending" });
        refresh();
      }
    }
    async function generateLuisterenAudio(exam) {
      const sec = exam.sections.luisteren;
      if (!sec.content || !sec.content.script) return;
      try {
        const blob = await window.Audio2.tts(sec.content.script, {
          instructions: "Spreek het Nederlands in een neutraal Standaardnederlands accent met natuurlijke prosodie, alsof je een Vlaams radioprogramma inleest. Tempo: rustig, helder.",
        });
        const audioKey = `exam-${exam.id}-luisteren-audio`;
        await window.BlobStore.put(audioKey, blob, { kind: "tts", examId: exam.id });
        window.ExamStore.updateSection(exam.id, "luisteren", { audioKey, audioDataUrl: null });
        activeExam = window.ExamStore.get(exam.id);
        refresh();
      } catch (e) {
        alert("Audio-generatie mislukt: " + e.message);
      }
    }
    async function gradeLuisteren(exam) {
      const sec = exam.sections.luisteren;
      const sys = "Je beoordeelt antwoorden op een CNaVT C1-luistertoets. Voor MC vergelijk met correctIndex. Voor open evalueer of de luisteraar de inhoud correct heeft begrepen. Geef JSON: {score, perQuestion:[{correct, feedback:{nl,en}}], feedback:{nl,en}}.";
      const user = JSON.stringify({ script: sec.content.script, questions: sec.content.questions, answers: sec.answers });
      window.ExamStore.updateSection(exam.id, "luisteren", { status: "submitted" });
      refresh();
      try {
        const r = await window.AI.complete({
          kind: "exam-luisteren-grade",
          system: sys, user, maxTokens: 1500, json: true, reasoning: "low", noCache: true,
        });
        const grading = JSON.parse(r.text);
        window.ExamStore.updateSection(exam.id, "luisteren", { status: "graded", grading });
        activeExam = window.ExamStore.get(exam.id);
        refresh();
      } catch (e) {
        alert("Beoordeling mislukt: " + e.message);
        window.ExamStore.updateSection(exam.id, "luisteren", { status: "generated" });
        refresh();
      }
    }

    async function generateSchrijven(exam) {
      window.ExamStore.updateSection(exam.id, "schrijven", { status: "generating" });
      refresh();
      const sys = "Je geeft een CNaVT C1 Educatief Professioneel schrijfopdracht. Kies één type: essay, formele brief, of rapport. Maak het concreet (specifieke context, doelpubliek, doel). Geef JSON: {type, prompt, audience, expectedLength}.";
      try {
        const r = await window.AI.complete({
          kind: "exam-schrijven-gen",
          system: sys, user: "Geef een nieuwe schrijfopdracht. Sessie-id: " + exam.id.slice(-6),
          maxTokens: 700, json: true, reasoning: "low", noCache: true,
        });
        const content = JSON.parse(r.text);
        window.ExamStore.updateSection(exam.id, "schrijven", { status: "generated", content, response: "" });
        activeExam = window.ExamStore.get(exam.id);
        refresh();
      } catch (e) {
        alert("Genereren mislukt: " + e.message);
        window.ExamStore.updateSection(exam.id, "schrijven", { status: "pending" });
        refresh();
      }
    }
    async function gradeSchrijven(exam) {
      const sec = exam.sections.schrijven;
      if (!sec.response || sec.response.trim().length < 50) {
        alert("Te kort om te beoordelen — schrijf eerst minstens 50 woorden.");
        return;
      }
      const sys = "Je bent een CNaVT-examinator op niveau C1 EP. Beoordeel het essay volgens de rubric. Antwoord in JSON:\n{\n  \"score\": <gemiddelde 1-5, 1 decimaal>,\n  \"criteria\": [\n    {\"name\":\"Inhoud & taakvervulling\",\"score\":1-5,\"feedback\":{\"nl\":\"...\",\"en\":\"...\"}},\n    {\"name\":\"Coherentie & samenhang\",\"score\":1-5,\"feedback\":{\"nl\":\"...\",\"en\":\"...\"}},\n    {\"name\":\"Lexicale rijkdom\",\"score\":1-5,\"feedback\":{\"nl\":\"...\",\"en\":\"...\"}},\n    {\"name\":\"Grammaticale correctheid\",\"score\":1-5,\"feedback\":{\"nl\":\"...\",\"en\":\"...\"}},\n    {\"name\":\"Register & stijl\",\"score\":1-5,\"feedback\":{\"nl\":\"...\",\"en\":\"...\"}}\n  ],\n  \"feedback\":{\"nl\":\"globaal in 2 zinnen\",\"en\":\"global in 2 sentences\"}\n}";
      const user = "Opdracht:\n" + JSON.stringify(sec.content) + "\n\nEssay:\n" + sec.response;
      window.ExamStore.updateSection(exam.id, "schrijven", { status: "submitted" });
      refresh();
      try {
        const r = await window.AI.complete({
          kind: "exam-schrijven-grade",
          system: sys, user, maxTokens: 1800, json: true, reasoning: "low", noCache: true,
        });
        const grading = JSON.parse(r.text);
        window.ExamStore.updateSection(exam.id, "schrijven", { status: "graded", grading });
        activeExam = window.ExamStore.get(exam.id);
        refresh();
      } catch (e) {
        alert("Beoordeling mislukt: " + e.message);
        window.ExamStore.updateSection(exam.id, "schrijven", { status: "generated" });
        refresh();
      }
    }

    async function generateSpreken(exam) {
      window.ExamStore.updateSection(exam.id, "spreken", { status: "generating" });
      refresh();
      const sys = "Je geeft een CNaVT C1 EP spreekopdracht. Concrete situatie waarin de kandidaat een standpunt verdedigt, een professionele situatie bespreekt of een mening geeft. Houd antwoord-duur 60-90 seconden. Geef JSON: {prompt, expectedDuration, tips:[\"...\",\"...\"]}.";
      try {
        const r = await window.AI.complete({
          kind: "exam-spreken-gen",
          system: sys, user: "Geef een nieuwe spreekopdracht. Sessie-id: " + exam.id.slice(-6),
          maxTokens: 500, json: true, reasoning: "low", noCache: true,
        });
        const content = JSON.parse(r.text);
        window.ExamStore.updateSection(exam.id, "spreken", { status: "generated", content, transcription: null });
        activeExam = window.ExamStore.get(exam.id);
        refresh();
      } catch (e) {
        alert("Genereren mislukt: " + e.message);
        window.ExamStore.updateSection(exam.id, "spreken", { status: "pending" });
        refresh();
      }
    }
    async function transcribeAndGrade(exam, sec, status) {
      // Prefer the in-memory blob (fresh recording); otherwise hydrate from IDB
      let blob = sec.audioBlob;
      if (!blob && sec.recordingKey) {
        blob = await window.BlobStore.get(sec.recordingKey);
      }
      if (!blob) { status.textContent = "Geen opname."; return; }
      status.innerHTML = '<span class="ai-loading">transcriberen…</span>';
      try {
        const tr = await window.Audio2.stt(blob, { language: "nl" });
        sec.transcription = tr.text;
        window.ExamStore.updateSection(exam.id, "spreken", { transcription: tr.text, status: "submitted" });
        status.innerHTML = '<span class="ai-loading">beoordelen…</span>';

        const sys = "Je beoordeelt een CNaVT C1 EP spreekopname op basis van de transcriptie. Criteria: 1) Inhoud & taakvervulling, 2) Coherentie & samenhang, 3) Lexicale rijkdom, 4) Grammaticale correctheid, 5) Register. Houd er rekening mee dat dit een transcriptie is — uitspraak/intonatie kan je niet beoordelen, vermeld dat indien relevant. Geef JSON: {score, criteria:[{name, score, feedback:{nl,en}}], feedback:{nl,en}}.";
        const user = "Opdracht:\n" + JSON.stringify(sec.content) + "\n\nTranscriptie:\n" + tr.text;
        const r = await window.AI.complete({
          kind: "exam-spreken-grade",
          system: sys, user, maxTokens: 1500, json: true, reasoning: "low", noCache: true,
        });
        const grading = JSON.parse(r.text);
        window.ExamStore.updateSection(exam.id, "spreken", { status: "graded", grading });
        activeExam = window.ExamStore.get(exam.id);
        status.textContent = "Klaar.";
        refresh();
      } catch (e) {
        status.innerHTML = `<span class="ai-error">${escapeHTML(e.message)}</span>`;
      }
    }

    /* ============ Misc ============ */
    function blobToDataURL(blob) {
      return new Promise((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(r.result);
        r.onerror = reject;
        r.readAsDataURL(blob);
      });
    }
    function format(s) {
      return escapeHTML(s).replace(/\n/g, "<br>");
    }

    refresh();
  }

  window.ExamViews = { render };
})();
