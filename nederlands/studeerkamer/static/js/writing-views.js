/* Schrijven (writing-correction) view — mirrors Luisteren's shell. */
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
      el("h2", { class: "view-title" }, "Schrijven ", el("span", { class: "accent" }, "· essay-correctie")),
      el("p", { class: "view-sub" }, "Plak een essay in het Nederlands. De AI corrigeert zin voor zin, extraheert woordenschat, en kan op verzoek je gecorrigeerde tekst inspreken.")
    ));
    const sidebar = el("aside", { class: "exam-sidebar" });
    const main = el("div", { class: "exam-main" });
    root.append(sidebar, main);
    mount.append(root);

    let activeEx = getOrCreateActive();
    function getOrCreateActive() {
      const id = window.WritingStore.getActiveId();
      if (id) { const e = window.WritingStore.get(id); if (e) return e; }
      const all = window.WritingStore.list();
      if (all.length) { window.WritingStore.setActiveId(all[0].id); return all[0]; }
      return null;
    }

    function refresh() {
      const id = activeEx && activeEx.id;
      if (id) activeEx = window.WritingStore.get(id);
      renderSidebar();
      renderMain();
    }

    function renderSidebar() {
      sidebar.innerHTML = "";
      sidebar.append(el("div", { class: "chat-side-actions" },
        el("button", { onClick: () => showNewExerciseForm() }, "+ Nieuwe correctie"),
      ));
      const all = window.WritingStore.list();
      const listEl = el("div", { class: "chat-side-list" });
      if (!all.length) listEl.append(el("div", { class: "chat-empty-state" }, "Geen correcties nog."));
      all.forEach((e) => {
        const active = activeEx && e.id === activeEx.id;
        const lvl = (e.level || "B2").toUpperCase();
        const item = el("button", {
          class: "chat-item" + (active ? " active" : "") + (e.autoTitled ? "" : " untitled"),
          onClick: () => {
            window.WritingStore.setActiveId(e.id);
            activeEx = window.WritingStore.get(e.id);
            refresh();
          },
        },
          el("span", { class: "ci-title" },
            el("span", { class: "level-badge l-" + lvl, style: "margin-right:.45rem;vertical-align:1px" }, lvl),
            e.title || "Naamloos"),
          el("span", { class: "ci-meta" },
            (e.status === "ready" ? "✓" : (e.status === "generating" ? "⏳" : (e.status === "error" ? "✗" : "○"))) +
            " · " + relTime(e.updatedAt) +
            (e.vocab ? " · " + e.vocab.length + " woorden" : "") +
            (e.audioKey ? " · 🔊" : "")),
          el("button", {
            class: "ci-del",
            onClick: (ev) => {
              ev.stopPropagation();
              if (!confirm(`"${e.title}" verwijderen?`)) return;
              if (e.audioKey && window.BlobStore) window.BlobStore.remove(e.audioKey).catch(() => {});
              window.WritingStore.remove(e.id);
              activeEx = getOrCreateActive();
              refresh();
            },
          }, "✕"),
        );
        listEl.append(item);
      });
      sidebar.append(listEl);
      sidebar.append(el("div", { class: "chat-side-foot" },
        el("button", { class: "subtle", onClick: () => window.WritingStore.exportAll() }, "Export"),
      ));
    }

    function showNewExerciseForm() {
      activeEx = null;
      window.WritingStore.setActiveId(null);
      renderSidebar();
      renderNewForm();
    }

    function renderNewForm() {
      main.innerHTML = "";
      const s = window.Store.state.settings;
      const card = el("div", { class: "card card-pad" });

      const essayInput = el("textarea", {
        placeholder: "Plak hier je essay in het Nederlands (200-500 woorden werkt het best).",
        rows: 12,
        style: "width:100%;font-family:var(--serif);font-size:1rem;padding:.7rem .9rem;background:var(--paper-2);border:1px solid var(--rule-strong);border-radius:4px;color:var(--ink);resize:vertical;min-height:240px;line-height:1.6",
      });

      const levelSel = el("select", { class: "select-input" },
        el("option", { value: "B1" }, "B1 · lenient (alleen duidelijke fouten)"),
        el("option", { value: "B2" }, "B2 · gemiddeld (grammatica + collocaties + register)"),
        el("option", { value: "C1" }, "C1 · streng (CNaVT-stijl, alle nuances)"),
      );
      levelSel.value = s.lastEssayLevel || "B2";

      const wcEl = el("p", { class: "stat-note", style: "font-family:var(--mono);font-size:.78rem" }, "0 woorden · richt op 200–400 voor C1");
      function updateWC() {
        const wc = (essayInput.value.match(/\b[\w'-]+\b/g) || []).length;
        const label = wc + " woord" + (wc === 1 ? "" : "en");
        let hint = "";
        if (wc === 0) hint = " · richt op 200–400 voor C1";
        else if (wc < 150) hint = " · te kort voor C1 (richt op 200–400)";
        else if (wc > 500) hint = " · lang — een kortere essay scoort gerichter";
        wcEl.textContent = label + hint;
        if (wc < 100 || wc > 600) wcEl.style.color = "var(--rood)";
        else if (wc < 200 || wc > 400) wcEl.style.color = "var(--geel)";
        else wcEl.style.color = "var(--groen)";
      }
      essayInput.addEventListener("input", updateWC);

      const status = el("p", { class: "stat-note" });

      // Handwriting capture toolbar: same flow as Examen Schrijven section
      const ocrStatus = el("span", { class: "stat-note", style: "margin-left:.5rem;font-family:var(--sans)" });
      const scanToolbar = el("div", { class: "schrijven-actions", style: "margin-bottom:.4rem" });
      if (window.Handwriting) {
        const scanBtn = el("button", { class: "subtle", title: "Scan met je Mac-webcam of upload foto's van handgeschreven pagina's",
          style: "font-size:.85rem;padding:.5rem 1rem;min-height:auto",
          onClick: async () => {
            try {
              const pages = await window.Handwriting.openCaptureModal();
              if (!pages || !pages.length) return;
              scanBtn.disabled = true;
              ocrStatus.innerHTML = `<span class="ai-loading">${pages.length} pagina${pages.length === 1 ? "" : "'s"} transcriberen…</span>`;
              const text = await window.Handwriting.transcribePages(pages);
              let newVal = text;
              if (essayInput.value.trim()) {
                const append = confirm("Bestaande tekst behouden en transcriptie eronder zetten?\nOK = toevoegen.  Annuleer = vervangen.");
                newVal = append ? (essayInput.value.trimEnd() + "\n\n" + text) : text;
              }
              essayInput.value = newVal;
              updateWC();
              ocrStatus.innerHTML = '<span style="color:var(--groen)">✓ Transcriptie ingevoegd — controleer en bewerk waar nodig.</span>';
            } catch (err) {
              ocrStatus.innerHTML = `<span class="ai-error">${err.message}</span>`;
            } finally {
              scanBtn.disabled = false;
            }
          },
        }, "📷 Scan / upload pagina's");
        scanToolbar.append(
          scanBtn,
          el("span", { class: "or", style: "font-size:.78rem;color:var(--ink-faint);font-style:italic;padding:0 .3rem" }, "— of typ direct hieronder"),
          ocrStatus,
        );
      }

      card.append(
        el("h3", { style: "font-family:var(--serif);font-weight:600;margin:0 0 .3rem" }, "Nieuwe essay-correctie"),
        el("p", { class: "stat-note", style: "margin-bottom:1rem" }, "Je essay → AI corrigeert zin voor zin + extraheert woordenschat. Audio kan je later op verzoek genereren."),
        el("div", { class: "field" }, el("label", null, "Essay"), scanToolbar, essayInput, wcEl),
        el("div", { class: "field" }, el("label", null, "Strengheid"), levelSel,
          el("p", { class: "hint" }, "B1 = alleen klare fouten · B2 = ook collocaties/register · C1 = pedantisch CNaVT-stijl")),
        el("div", { style: "display:flex;gap:.5rem;margin-top:.6rem" },
          el("button", { onClick: () => start() }, "Corrigeer"),
          el("button", { class: "subtle", onClick: () => { activeEx = getOrCreateActive(); refresh(); } }, "Annuleer"),
        ),
        status,
      );
      main.append(card);
      updateWC();
      setTimeout(() => essayInput.focus(), 30);

      async function start() {
        const essay = essayInput.value.trim();
        if (essay.length < 50) { status.innerHTML = '<span class="ai-error">Essay te kort (min. 50 karakters).</span>'; return; }
        window.Store.state.settings.lastEssayLevel = levelSel.value;
        window.Store.save();
        const newEx = window.WritingStore.create(essay, { level: levelSel.value });
        activeEx = newEx;
        refresh();
      }
    }

    function renderMain() {
      main.innerHTML = "";
      if (!activeEx) {
        main.append(el("div", { class: "empty" },
          el("h3", null, "Schrijf en laat corrigeren"),
          el("p", null, "Plak je essay en pak gerichte feedback per zin."),
          el("button", { onClick: showNewExerciseForm }, "+ Nieuwe correctie")));
        return;
      }
      renderExerciseBody(activeEx);
    }

    async function renderExerciseBody(ex) {
      main.innerHTML = "";
      const lvl = (ex.level || "B2").toUpperCase();
      const titleNode = el("h3", { style: "font-family:var(--serif);font-weight:600;font-size:1.3rem;margin:0;flex:1;cursor:pointer", title: "Klik om te hernoemen" }, ex.title || "Naamloos");
      titleNode.addEventListener("click", () => renameTitleInline(titleNode, ex));
      main.append(el("div", { style: "display:flex;align-items:baseline;gap:.5rem;padding:1.2rem 1.4rem;border-bottom:1px solid var(--rule)" },
        el("span", { class: "level-badge l-" + lvl, style: "vertical-align:2px" }, lvl),
        titleNode,
      ));

      const body = el("div", { class: "exam-body" });
      main.append(body);

      if (ex.status !== "ready") {
        const genHost = el("div", { class: "gen-state", style: "background:var(--paper-2);border:1px dashed var(--rule-strong);border-radius:4px;padding:1.6rem;text-align:center;margin:1rem 0" });
        body.append(genHost);
        await runCorrection(ex.id, genHost);
        const updated = window.WritingStore.get(ex.id);
        if (!updated || updated.status !== "ready") return;
        return renderExerciseBody(updated);
      }

      // Tabs
      const tabBar = el("div", { class: "exam-tabs" });
      const tabBody = el("div");
      const tabs = [
        { key: "original",    label: "Origineel",                   render: () => renderOriginal(ex.id, refresh) },
        { key: "corrections", label: "Correcties",                  render: () => renderCorrections(ex.id, paintBody) },
        { key: "transcript",  label: "Gecorrigeerd",                render: () => renderTranscript(ex.id, refresh) },
        { key: "vocab",       label: "Woordenschat & grammatica",   render: () => renderVocabGrammar(ex.id, refresh) },
        { key: "practice",    label: "Oefen woordenschat",          render: () => renderVocabPractice(ex.id, paintBody) },
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
        window.WritingStore.update(ex.id, { title: v, autoTitled: true });
        refresh();
      }
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") { e.preventDefault(); commit(); }
        else if (e.key === "Escape") { refresh(); }
      });
      input.addEventListener("blur", commit);
    }

    /* ============ Origineel tab — verbatim source + score + re-actions ============ */
    function renderOriginal(id, refreshFn) {
      const ex = window.WritingStore.get(id);
      const wrap = el("div");
      const score = ex.score || null;

      // Helper: render NL+EN side-by-side, accepting either a string
      // (backwards-compat with pre-bilingual exercises) or {nl, en}.
      function bilingualBlock(v, opts = {}) {
        if (v && typeof v === "object" && (v.nl || v.en)) {
          return el("div", { class: "bilingual", style: "margin:0;gap:.4rem 1rem;" + (opts.style || "") },
            el("div", { class: "nl" }, el("span", { class: "lang-tag" }, "NL"), v.nl || ""),
            el("div", { class: "en" }, el("span", { class: "lang-tag" }, "EN"), v.en || ""),
          );
        }
        return el("p", { style: opts.style || "" }, v || "");
      }

      // Criteria entries may be either a number (old format) or {score, nl, en}.
      function criterionScore(v) { return typeof v === "number" ? v : (v && typeof v.score === "number" ? v.score : null); }
      function criterionFeedback(v) {
        if (v && typeof v === "object" && (v.nl || v.en)) return { nl: v.nl, en: v.en };
        return null;
      }

      /* ----- Score card ----- */
      if (score && typeof score.overall === "number") {
        const overall = score.overall;
        const max = 10;
        const color = overall >= 8 ? "var(--groen)" : overall >= 6 ? "var(--geel)" : "var(--rood)";
        const card = el("div", { style: "background:var(--card);border:1px solid var(--rule);border-radius:6px;padding:1.1rem 1.3rem;margin:0 0 1.2rem;display:grid;grid-template-columns:auto 1fr;gap:1.2rem;align-items:start" },
          el("div", { style: "text-align:center;padding-top:.3rem" },
            el("div", { style: "font-family:var(--serif);font-size:2.6rem;font-weight:600;line-height:1;color:" + color }, String(overall)),
            el("div", { style: "font-family:var(--mono);font-size:.7rem;letter-spacing:.14em;text-transform:uppercase;color:var(--ink-faint);margin-top:.15rem" }, "van " + max + " · " + (ex.level || "B2")),
          ),
          (function() {
            const right = el("div");
            if (score.summary) {
              const isObj = typeof score.summary === "object";
              if (isObj) {
                right.append(el("div", { style: "margin:0 0 .8rem;font-style:italic;font-family:var(--serif);color:var(--ink)" },
                  bilingualBlock(score.summary, { style: "font-family:var(--serif);font-size:1rem" })));
              } else {
                right.append(el("p", { style: "font-family:var(--serif);font-size:1rem;color:var(--ink);margin:0 0 .6rem;font-style:italic" }, '"' + score.summary + '"'));
              }
            }
            if (score.criteria) {
              const grid = el("div", { style: "display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:.7rem 1rem" });
              const labels = { grammatica: "Grammatica", lexicaal: "Lexicaal", coherentie: "Coherentie", register: "Register", spelling: "Spelling" };
              Object.entries(labels).forEach(([k, lbl]) => {
                const raw = score.criteria[k];
                const v = criterionScore(raw);
                if (typeof v !== "number") return;
                const c = v >= 8 ? "var(--groen)" : v >= 6 ? "var(--geel)" : "var(--rood)";
                const cell = el("div", { style: "min-width:0" },
                  el("div", { style: "display:flex;justify-content:space-between;font-size:.72rem;color:var(--ink-soft);font-family:var(--mono);letter-spacing:.04em;margin-bottom:2px" },
                    el("span", null, lbl),
                    el("span", { style: "color:" + c + ";font-weight:600" }, v + "/10"),
                  ),
                  el("div", { style: "height:4px;background:var(--rule);border-radius:2px;overflow:hidden" },
                    el("div", { style: "height:100%;width:" + (v * 10) + "%;background:" + c }),
                  ),
                );
                const fb = criterionFeedback(raw);
                if (fb) {
                  cell.append(el("div", { style: "margin-top:.35rem;font-size:.74rem;line-height:1.45;color:var(--ink-soft)" },
                    bilingualBlock(fb, { style: "font-size:.74rem" })));
                }
                grid.append(cell);
              });
              right.append(grid);
            }
            return right;
          })(),
        );
        wrap.append(card);

        // 3 strategic improvements (migrated from old /essay view).
        const imps = Array.isArray(score.improvements) ? score.improvements
                   : Array.isArray(ex.improvements) ? ex.improvements
                   : null;
        if (imps && imps.length) {
          const impBox = el("div", { style: "background:var(--paper-2);border:1px solid var(--rule);border-radius:6px;padding:1rem 1.2rem;margin:0 0 1.2rem" },
            el("h4", { style: "margin:0 0 .6rem;font-family:var(--sans);font-size:.78rem;letter-spacing:.14em;text-transform:uppercase;color:var(--ink-faint)" },
              "Drie concrete verbeterpunten · three concrete improvements"),
          );
          const ol = el("ol", { style: "margin:0;padding-left:1.3rem" });
          imps.forEach((imp) => {
            ol.append(el("li", { style: "margin-bottom:.6rem;line-height:1.5" }, bilingualBlock(imp)));
          });
          impBox.append(ol);
          wrap.append(impBox);
        }
      }

      /* ----- Re-actions toolbar ----- */
      const actionStatus = el("span", { class: "stat-note", style: "margin-left:.5rem;font-family:var(--sans)" });
      const levelSel = el("select", { class: "select-input", style: "min-width:0;flex:0 0 auto" },
        el("option", { value: "B1" }, "B1 · lenient"),
        el("option", { value: "B2" }, "B2 · medium"),
        el("option", { value: "C1" }, "C1 · strict"),
      );
      levelSel.value = ex.level || "B2";
      levelSel.addEventListener("change", () => {
        window.WritingStore.update(id, { level: levelSel.value });
      });

      const reBtn = el("button", { class: "subtle", style: "font-size:.85rem;padding:.45rem 1rem;min-height:auto",
        onClick: async () => {
          if (!confirm(`Hercorrigeer op ${levelSel.value}-strengheid? Bestaande correcties, woordenschat en grammatica worden vervangen.`)) return;
          window.WritingStore.update(id, { level: levelSel.value });
          reBtn.disabled = true;
          actionStatus.innerHTML = '<span class="ai-loading">hercorrigeren…</span>';
          try {
            const result = await window.AI.correctEssay({ essay: window.WritingStore.get(id).sourceEssay, level: levelSel.value });
            window.WritingStore.update(id, {
              sentences: result.sentences || [],
              correctedFull: result.correctedFull || "",
              vocab: result.vocab || [],
              grammar: result.grammar || [],
              score: result.score || null,
              // Audio of the OLD corrected version no longer matches — clear it
              audioKey: null,
              wordTimings: null,
              sttText: null,
            });
            // Remove the stale audio blob
            if (window.BlobStore) window.BlobStore.remove("writing-" + id).catch(() => {});
            actionStatus.innerHTML = '<span style="color:var(--groen)">✓ klaar</span>';
            refreshFn();
          } catch (err) {
            actionStatus.innerHTML = '<span class="ai-error">' + escapeHTML(err.message) + '</span>';
          } finally {
            reBtn.disabled = false;
          }
        },
      }, "↻ Hercorrigeer");

      const editBtn = el("button", { class: "subtle", style: "font-size:.85rem;padding:.45rem 1rem;min-height:auto" }, "✎ Bewerk origineel");

      const clearAudioBtn = ex.audioKey ? el("button", { class: "subtle", style: "font-size:.85rem;padding:.45rem 1rem;min-height:auto",
        onClick: async () => {
          if (!confirm("Audio verwijderen? Je kunt later opnieuw genereren op het tabblad Gecorrigeerd.")) return;
          if (window.BlobStore) window.BlobStore.remove("writing-" + id).catch(() => {});
          window.WritingStore.update(id, { audioKey: null, wordTimings: null, sttText: null });
          actionStatus.innerHTML = '<span style="color:var(--groen)">✓ audio verwijderd</span>';
          refreshFn();
        },
      }, "🔊 Verwijder audio") : null;

      const toolbar = el("div", { style: "display:flex;flex-wrap:wrap;gap:.5rem;align-items:center;padding:.7rem .9rem;margin:0 0 1rem;background:var(--paper-2);border:1px solid var(--rule);border-radius:4px" },
        el("span", { style: "font-family:var(--mono);font-size:.72rem;letter-spacing:.12em;text-transform:uppercase;color:var(--ink-faint);margin-right:.3rem" }, "Strengheid"),
        levelSel,
        reBtn,
        editBtn,
        clearAudioBtn,
        actionStatus,
      );
      wrap.append(toolbar);

      /* ----- The source essay itself ----- */
      const sourceBox = el("div", { style: "background:var(--card);border:1px solid var(--rule);border-left:3px solid var(--delft);border-radius:4px;padding:1.3rem 1.6rem;font-family:var(--serif);font-size:1.05rem;line-height:1.8;white-space:pre-wrap" });
      sourceBox.textContent = ex.sourceEssay || "—";
      wrap.append(sourceBox);

      /* ----- Edit mode toggle ----- */
      editBtn.addEventListener("click", () => {
        if (editBtn.dataset.mode === "edit") return;
        editBtn.dataset.mode = "edit";
        editBtn.textContent = "✓ Bewerken klaar (verwerk opnieuw)";
        const ta = document.createElement("textarea");
        ta.value = ex.sourceEssay || "";
        ta.style.cssText = "width:100%;font-family:var(--serif);font-size:1.05rem;line-height:1.8;padding:1.3rem 1.6rem;background:var(--card);border:1px solid var(--rood-soft);border-left:3px solid var(--rood);border-radius:4px;color:var(--ink);resize:vertical;min-height:240px";
        sourceBox.replaceWith(ta);
        ta.focus();
        // One-time click for the commit handler
        const commitHandler = async () => {
          editBtn.removeEventListener("click", commitHandler);
          const newText = ta.value.trim();
          if (newText === (ex.sourceEssay || "").trim()) {
            // No change — just exit edit mode
            ta.replaceWith(sourceBox);
            editBtn.dataset.mode = "view";
            editBtn.textContent = "✎ Bewerk origineel";
            return;
          }
          if (!confirm("Origineel bijwerken en alle correcties opnieuw uitvoeren?")) return;
          window.WritingStore.update(id, { sourceEssay: newText });
          editBtn.disabled = true;
          actionStatus.innerHTML = '<span class="ai-loading">opnieuw verwerken…</span>';
          try {
            const result = await window.AI.correctEssay({ essay: newText, level: levelSel.value });
            const title = result.title && result.title.trim() ? result.title.trim() : ex.title;
            window.WritingStore.update(id, {
              title, autoTitled: true,
              sentences: result.sentences || [],
              correctedFull: result.correctedFull || "",
              vocab: result.vocab || [],
              grammar: result.grammar || [],
              score: result.score || null,
              audioKey: null, wordTimings: null, sttText: null,
            });
            if (window.BlobStore) window.BlobStore.remove("writing-" + id).catch(() => {});
            actionStatus.innerHTML = '<span style="color:var(--groen)">✓ klaar</span>';
            refreshFn();
          } catch (err) {
            actionStatus.innerHTML = '<span class="ai-error">' + escapeHTML(err.message) + '</span>';
            editBtn.disabled = false;
          }
        };
        // Attach inside a single-shot listener
        editBtn.addEventListener("click", commitHandler);
      });

      /* ----- Word count footer ----- */
      const wc = (ex.sourceEssay || "").match(/\b[\w'-]+\b/g) || [];
      wrap.append(el("p", { style: "font-family:var(--mono);font-size:.72rem;color:var(--ink-faint);letter-spacing:.04em;margin:.5rem 0 0;text-align:right" },
        wc.length + " woorden in origineel · ingediend " + new Date(ex.createdAt).toLocaleString("nl-BE", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })));

      return wrap;
    }

    /* ============ Corrections tab — sentence by sentence ============ */
    function renderCorrections(id, repaint) {
      const ex = window.WritingStore.get(id);
      const wrap = el("div");
      if (!ex.sentences || !ex.sentences.length) {
        wrap.append(el("p", { class: "ai-error" }, "Geen correcties beschikbaar."));
        return wrap;
      }
      const errCount = ex.sentences.reduce((a, s) => a + (s.needed ? 1 : 0), 0);
      wrap.append(el("p", { style: "color:var(--ink-soft);margin-bottom:1rem;font-size:.92rem" },
        ex.sentences.length + " zinnen · ",
        errCount === 0
          ? el("strong", { style: "color:var(--groen)" }, "alles goed ✓")
          : el("strong", { style: "color:var(--rood)" }, errCount + " met opmerkingen"),
      ));

      ex.sentences.forEach((s, idx) => {
        const card = el("div", {
          style: "background:var(--card);border:1px solid var(--rule);border-left:3px solid " + (s.needed ? "var(--rood)" : "var(--groen)") + ";border-radius:4px;padding:.85rem 1.1rem;margin-bottom:.7rem",
        });
        // Sentence number + status
        card.append(el("p", { style: "font-family:var(--mono);font-size:.68rem;letter-spacing:.14em;text-transform:uppercase;color:var(--ink-faint);margin:0 0 .4rem" },
          "Zin " + (idx + 1) + (s.needed ? " · met correctie" : " · ✓ goed")));
        // Original sentence
        if (s.needed) {
          card.append(el("p", {
            style: "font-family:var(--serif);font-size:.95rem;color:var(--ink-faint);text-decoration:line-through;font-style:italic;margin:0 0 .35rem;line-height:1.5",
          }, s.original));
          card.append(el("p", {
            style: "font-family:var(--serif);font-size:1.02rem;color:var(--ink);margin:0 0 .6rem;line-height:1.55",
          }, s.corrected));
        } else {
          card.append(el("p", {
            style: "font-family:var(--serif);font-size:1.02rem;color:var(--ink);margin:0 0 .4rem;line-height:1.55",
          }, s.original));
        }
        // Notes
        if (s.notes && s.notes.length) {
          const ul = el("ul", { class: "notes-rich" });
          s.notes.forEach((n) => {
            const li = el("li", { class: "note-rich" });
            const head = el("div", { class: "note-head" });
            if (n.error || n.fix) {
              head.append(
                n.error ? el("span", { class: "note-error" }, n.error) : null,
                (n.error && n.fix) ? el("span", { class: "note-arrow" }, "→") : null,
                n.fix ? el("span", { class: "note-fix" }, n.fix) : null,
              );
            }
            if (n.rubric) head.append(el("span", { class: "rubric-chip rubric-" + (n.rubric || "").toLowerCase() }, n.rubric));
            li.append(head);
            if (n.rule) li.append(el("p", { class: "note-rule" }, n.rule));
            ul.append(li);
          });
          card.append(ul);
        }
        wrap.append(card);
      });
      return wrap;
    }

    /* ============ Transcript tab — fully corrected, with on-demand audio ============ */
    function renderTranscript(id, refreshFn) {
      const ex = window.WritingStore.get(id);
      const wrap = el("div");

      // Audio toolbar
      const status = el("span", { style: "font-family:var(--mono);font-size:.78rem;letter-spacing:.04em;color:var(--ink-faint)" });
      const toolbar = el("div", { style: "display:flex;align-items:center;gap:.6rem;padding:.5rem .7rem;margin:0 0 1rem;background:var(--paper-2);border:1px solid var(--rule);border-radius:4px;flex-wrap:wrap" });

      if (!ex.audioKey) {
        const genBtn = el("button", { onClick: async () => {
          genBtn.disabled = true;
          status.innerHTML = '<span class="ai-loading">audio genereren…</span>';
          try {
            await generateAudioForExercise(ex.id, status);
            refreshFn();
          } catch (err) {
            status.innerHTML = '<span class="ai-error">' + escapeHTML(err.message) + '</span>';
            genBtn.disabled = false;
          }
        } }, "🔊 Genereer audio");
        toolbar.append(genBtn, status,
          el("span", { style: "font-size:.78rem;color:var(--ink-faint);font-style:italic;margin-left:auto" },
            "TTS via " + ((window.Store.state.settings.ttsProvider || "openai") === "azure" ? "Azure (Vlaams)" : "OpenAI")));
      } else {
        toolbar.append(el("span", { style: "font-family:var(--mono);font-size:.78rem;color:var(--ink-faint);letter-spacing:.04em" }, "✓ audio aanwezig"));
        if (!ex.wordTimings) {
          const syncBtn = el("button", { class: "subtle", style: "font-size:.82rem;padding:.35rem .8rem;min-height:auto", onClick: async () => {
            syncBtn.disabled = true; status.innerHTML = '<span class="ai-loading">synchroniseren…</span>';
            try {
              const blob = await window.BlobStore.get(ex.audioKey);
              if (!blob) throw new Error("Audio niet gevonden.");
              const tr = await window.AI.transcribeWithTimestamps(blob, { language: "nl" });
              window.WritingStore.update(ex.id, { wordTimings: tr.words || [], sttText: tr.text || "" });
              status.innerHTML = '<span style="color:var(--groen)">✓ ' + (tr.words || []).length + ' woorden gesynchroniseerd</span>';
              refreshFn();
            } catch (err) {
              status.innerHTML = '<span class="ai-error">' + escapeHTML(err.message) + '</span>';
              syncBtn.disabled = false;
            }
          } }, "↻ Synchroniseer");
          toolbar.append(syncBtn);
        }
        toolbar.append(status);
      }
      wrap.append(toolbar);

      // Audio player (if audio exists)
      if (ex.audioKey && window.BlobStore) {
        const playerHost = el("div", { style: "background:var(--card);border:1px solid var(--rule);border-radius:4px;padding:.85rem 1.1rem;margin:0 0 1.2rem" });
        wrap.append(playerHost);
        window.BlobStore.getURL(ex.audioKey).then((url) => {
          if (url) buildPlayer(playerHost, url);
        });
      }

      // Body
      const hasTimings = Array.isArray(ex.wordTimings) && ex.wordTimings.length > 0;
      const body = el("article", {
        class: "transcript-body" + (hasTimings ? " synced" : ""),
        style: "background:var(--card);border:1px solid var(--rule);border-radius:4px;padding:1.3rem 1.6rem;font-family:var(--serif);font-size:1.05rem;line-height:1.85;white-space:pre-wrap",
      });
      if (!hasTimings) {
        body.textContent = ex.correctedFull || "—";
      } else {
        renderTimedSpans(body, ex.sttText || ex.correctedFull || "", ex.wordTimings);
      }
      wrap.append(body);

      if (hasTimings) setTimeout(() => attachHighlighter(body, ex.wordTimings), 30);

      return wrap;
    }

    /* ============ Player (compact, same as Luisteren) ============ */
    function buildPlayer(host, url) {
      host.innerHTML = "";
      const audio = new Audio(url);
      audio.preload = "metadata";
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
        const b = el("button", { style: "min-height:auto;padding:.2rem .65rem;font-size:.75rem;border-radius:999px;background:" + (sp===1?"var(--ink)":"transparent") + ";color:" + (sp===1?"var(--paper)":"var(--ink-soft)") + ";border:none" }, sp + "×");
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
      host.append(row, progress, el("div", { style: "display:flex;gap:.5rem;align-items:center;margin-top:.8rem;flex-wrap:wrap" }, speeds, loopBtn));

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

    /* ============ Timed spans + highlighter (same logic as Luisteren) ============ */
    function renderTimedSpans(body, text, timings) {
      const seek = (start) => {
        const a = mount.querySelector("audio");
        if (a) { a.currentTime = Math.max(0, start - 0.05); a.play().catch(() => {}); }
      };
      let cursor = 0, placed = 0;
      timings.forEach((w, idx) => {
        if (!w.word) return;
        const raw = String(w.word).replace(/^\s+|\s+$/g, "");
        if (!raw) return;
        let at = text.indexOf(raw, cursor);
        if (at < 0) {
          const core = raw.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "");
          if (!core) return;
          at = text.indexOf(core, cursor);
          if (at < 0) return;
        }
        if (at > cursor) body.appendChild(document.createTextNode(text.slice(cursor, at)));
        const matched = text.slice(at, at + raw.length);
        const span = el("span", {
          class: "ts-word",
          "data-start": String(w.start),
          "data-end": String(w.end),
          "data-idx": String(idx),
          title: w.start.toFixed(2) + "s",
          onClick: () => seek(w.start),
        }, matched);
        body.appendChild(span);
        cursor = at + raw.length;
        placed += 1;
      });
      if (cursor < text.length) body.appendChild(document.createTextNode(text.slice(cursor)));
      if (placed === 0) body.textContent = text;
    }

    function attachHighlighter(body, timings) {
      let attempts = 0;
      const poll = setInterval(() => {
        const audio = mount.querySelector("audio");
        if (audio) { clearInterval(poll); install(audio); }
        else if (++attempts > 50) clearInterval(poll);
      }, 100);
      function install(audio) {
        if (audio.__wsHookedBody === body) return;
        audio.__wsHookedBody = body;
        let lastIdx = -1;
        function tick() {
          const t = audio.currentTime;
          let lo = 0, hi = timings.length - 1, found = -1;
          while (lo <= hi) {
            const mid = (lo + hi) >> 1;
            const w = timings[mid];
            if (t < w.start) hi = mid - 1;
            else if (t > w.end) lo = mid + 1;
            else { found = mid; break; }
          }
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
        tick();
      }
    }

    /* ============ Vocab & grammar tab (with re-extract + corpus import) ============ */
    function renderVocabGrammar(id, refreshFn) {
      const ex = window.WritingStore.get(id);
      const wrap = el("div");
      if (ex.correctedFull) {
        const status = el("span", { style: "font-family:var(--mono);font-size:.78rem;letter-spacing:.04em;color:var(--ink-faint)" });
        const reBtn = el("button", { class: "subtle", style: "font-size:.82rem;padding:.35rem .8rem;min-height:auto", onClick: async () => {
          if (!confirm("Vocabulary opnieuw extraheren?")) return;
          reBtn.disabled = true; status.innerHTML = '<span class="ai-loading">opnieuw extraheren…</span>';
          try {
            const vocab = await window.AI.extractVocab({ script: ex.correctedFull });
            window.WritingStore.update(id, { vocab });
            status.innerHTML = '<span style="color:var(--groen)">✓ ' + vocab.length + ' items</span>';
            refreshFn();
          } catch (err) {
            status.innerHTML = '<span class="ai-error">' + escapeHTML(err.message) + '</span>';
          } finally {
            reBtn.disabled = false;
          }
        } }, "↻ Vocab opnieuw");
        const corpusBtn = el("button", { style: "font-size:.82rem;padding:.35rem .9rem;min-height:auto", onClick: () => openCorpusImport(ex) }, "+ Voeg toe aan corpus");
        wrap.append(el("div", { style: "display:flex;align-items:center;gap:.6rem;padding:.5rem .7rem;margin:0 0 1rem;background:var(--paper-2);border:1px solid var(--rule);border-radius:4px;flex-wrap:wrap" },
          el("span", { style: "font-family:var(--mono);font-size:.78rem;color:var(--ink-faint);letter-spacing:.04em" }, (ex.vocab || []).length + " woorden" + (ex.pushedToCorpus ? " · ✓ in corpus" : "")),
          reBtn, corpusBtn, status,
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

    /* ============ Vocab practice tab (flashcards + test, mirrors Luisteren) ============ */
    function renderVocabPractice(id, repaint) {
      const ex = window.WritingStore.get(id);
      const vocab = (ex.vocab || []).filter((v) => v.dutch && v.english);
      if (!vocab.length) return el("p", { class: "ai-error" }, "Geen vocabulary beschikbaar.");
      const stateKey = "wvp:" + id;
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
      function modeToggle(val, label) { return el("button", { class: state.mode === val ? "" : "subtle", style: "font-size:.78rem;padding:.3rem .8rem;min-height:auto;border-radius:999px", onClick: () => { state.mode = val; paint(); } }, label); }
      function dirToggle(val, label) { return el("button", { class: state.direction === val ? "" : "subtle", style: "font-size:.78rem;padding:.3rem .8rem;min-height:auto;border-radius:999px", onClick: () => { state.direction = val; paint(); } }, label); }
    }
    function findContext(text, word) {
      if (!text || !word) return "";
      const tok = word.split(/[\s/·,]/)[0].toLowerCase();
      if (!tok) return "";
      return text.split(/(?<=[.!?])\s+/).find((s) => s.toLowerCase().includes(tok)) || "";
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
      const ctx = findContext(ex.correctedFull, v.dutch);
      const card = el("div", { class: "fc", style: "padding:2rem" });
      card.append(el("p", { class: "fc-meta" }, (state.flashIndex + 1) + " / " + state.flashOrder.length + " · " + (state.direction === "nl-en" ? "NL → EN" : "EN → NL")),
        el("p", { class: "fc-prompt" }, prompt));
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
      const ctx = findContext(ex.correctedFull, v.dutch);
      const card = el("div", { class: "fc", style: "padding:1.8rem" });
      card.append(el("p", { class: "fc-meta" }, (state.testIndex + 1) + " / " + state.testOrder.length + " · " + (state.direction === "nl-en" ? "NL → EN" : "EN → NL")),
        el("p", { class: "fc-prompt", style: "font-size:1.7rem" }, prompt));
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

    /* ============ Corpus import ============ */
    function openCorpusImport(ex) {
      const overlay = el("div", { class: "hw-overlay" });
      const modal = el("div", { class: "hw-modal" });
      overlay.append(modal); document.body.append(overlay);
      function close() { overlay.remove(); }

      const items = (ex.vocab || []).map((v, idx) => ({
        idx, dutch: v.dutch, english: v.english, note: v.note || "",
        level: v.level || "B2", core: !!v.core, selected: true,
      }));
      const defaultCategory = "Schrijven · " + (ex.title || "essay");

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
          row.append(cb,
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
          dutch: i.dutch, english: i.english, note: i.note,
          level: i.level, core: i.core,
          exampleNL: findContext(ex.correctedFull, i.dutch) || "",
          exampleEN: "",
        }));
        const result = window.CustomVocab.addBatch(toAdd, {
          category: defaultCategory, source: "writing", sourceId: ex.id,
          subcategory: ex.title || null,
        });
        window.WritingStore.update(ex.id, { pushedToCorpus: true });
        alert(`${result.added} toegevoegd · ${result.skipped} overgeslagen.`);
        close();
        refresh();
      }
    }

    /* ============ Correction flow ============ */
    async function runCorrection(exId, host) {
      function setActive(html) { host.innerHTML += '<p class="gen-step"><span class="ai-loading">' + html + '</span></p>'; }
      host.innerHTML = '<h3 style="font-family:var(--serif);font-weight:600;margin:0 0 .5rem">Corrigeren</h3><p class="stat-note">Dit duurt 20-60 seconden.</p>';
      window.WritingStore.update(exId, { status: "generating" });
      let ex = window.WritingStore.get(exId);

      setActive("Zin voor zin nakijken (" + (ex.level || "B2") + ")");
      let result;
      try {
        result = await window.AI.correctEssay({ essay: ex.sourceEssay, level: ex.level || "B2" });
      } catch (err) {
        host.innerHTML += '<p class="ai-error">' + escapeHTML(err.message) + '</p>';
        window.WritingStore.update(exId, { status: "error", error: err.message });
        return;
      }
      const steps = host.querySelectorAll(".gen-step");
      if (steps.length) steps[steps.length - 1].innerHTML =
        '<span style="color:var(--groen)">✓ ' + (result.sentences || []).length + ' zinnen gecontroleerd · ' + (result.vocab || []).length + ' woordenschat-items</span>';

      const title = result.title && result.title.trim() ? result.title.trim() : ex.title;
      window.WritingStore.update(exId, {
        title, autoTitled: true,
        sentences: result.sentences || [],
        correctedFull: result.correctedFull || "",
        vocab: result.vocab || [],
        grammar: result.grammar || [],
        score: result.score || null,
        status: "ready",
      });
    }

    /* ============ Audio generation (on-demand) ============ */
    async function generateAudioForExercise(exId, statusNode) {
      const ex = window.WritingStore.get(exId);
      if (!ex.correctedFull) throw new Error("Geen gecorrigeerde tekst om in te spreken.");
      const blob = await window.AI.generateSpeech(ex.correctedFull);
      const audioKey = "writing-" + exId;
      await window.BlobStore.put(audioKey, blob);
      window.WritingStore.update(exId, { audioKey });
      if (statusNode) statusNode.innerHTML = '<span class="ai-loading">audio synchroniseren…</span>';
      // Word-level sync (non-fatal if it fails)
      try {
        const tr = await window.AI.transcribeWithTimestamps(blob, { language: "nl" });
        if (tr.words && tr.words.length) {
          window.WritingStore.update(exId, { wordTimings: tr.words, sttText: tr.text || "" });
        }
      } catch (e) {
        // sync fails are OK, audio still works
      }
      if (statusNode) statusNode.innerHTML = '<span style="color:var(--groen)">✓ audio klaar</span>';
    }

    refresh();

    /* ============ Keyboard: Space = play/pause if audio loaded ============ */
    function onKey(e) {
      if (e.key !== " " && e.code !== "Space") return;
      const t = e.target;
      if (t && t.matches && t.matches("input, textarea, select, [contenteditable='true']")) return;
      const audio = mount.querySelector("audio");
      if (!audio || !audio.src) return;
      e.preventDefault();
      if (audio.paused) audio.play().catch(() => {});
      else audio.pause();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }

  window.WritingViews = { render };
})();
