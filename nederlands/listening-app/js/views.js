/* All views render into #view. */
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
  function relTime(iso) {
    if (!iso) return "—";
    const diff = (Date.now() - new Date(iso).getTime()) / 1000;
    if (diff < 60) return "nu";
    if (diff < 3600) return Math.floor(diff / 60) + "m";
    if (diff < 86400) return Math.floor(diff / 3600) + "u";
    return Math.floor(diff / 86400) + "d";
  }

  /* ============ Welcome / empty state ============ */
  function renderEmpty(mount) {
    mount.innerHTML = "";
    if (!window.Store.getSettings().apiKey) {
      mount.append(el("div", { class: "empty-state" },
        el("div", { class: "big-ico" }, "🎧"),
        el("h2", { class: "view-title" }, "Welkom bij Luisteren"),
        el("p", null, "Configureer eerst je OpenAI API-sleutel."),
        el("button", { class: "btn-primary", onClick: () => { location.hash = "#/settings"; } }, "Naar Instellingen"),
      ));
      return;
    }
    mount.append(el("div", { class: "empty-state" },
      el("div", { class: "big-ico" }, "🎧"),
      el("h2", { class: "view-title" }, "Begin met luisteren"),
      el("p", null, "Maak een nieuwe oefening, geef een onderwerp, en de AI schrijft + spreekt een fragment in voor je."),
      el("button", { class: "btn-primary", onClick: () => { location.hash = "#/new"; } }, "+ Nieuwe oefening"),
    ));
  }

  /* ============ New exercise ============ */
  function renderNew(mount) {
    mount.innerHTML = "";
    if (!window.Store.getSettings().apiKey) {
      mount.append(el("p", { class: "ai-error" }, "Stel eerst je API-sleutel in via Instellingen."));
      return;
    }
    const form = el("div", { class: "new-form" });
    form.append(
      el("h2", { class: "view-title" }, "Nieuwe oefening"),
      el("p", { class: "view-sub" }, "Geef een onderwerp op hoog niveau. De AI schrijft een natuurlijk fragment, leest het in, en stelt 5 vragen."),
    );

    const topicInput = el("textarea", {
      placeholder: "bv. 'A.R. Rahman's Oscar-moment' of 'de geschiedenis van de Belgische bierbrouwers' of 'wat is filterbubble?'",
      autofocus: true,
    });

    const settings = window.Store.getSettings();
    const langSel = el("select", null,
      el("option", { value: "Dutch (Belgian / Standard Dutch register)", selected: settings.outputLanguage.includes("Dutch") ? "" : undefined }, "Nederlands (BE Standaard)"),
      el("option", { value: "Dutch (Netherlands register)" }, "Nederlands (NL)"),
      el("option", { value: "English" }, "English"),
      el("option", { value: "German" }, "Deutsch"),
      el("option", { value: "French" }, "Français"),
      el("option", { value: "Spanish" }, "Español"),
    );
    langSel.value = settings.outputLanguage;

    const durSel = el("select", null,
      el("option", { value: "1.5" }, "~1,5 min"),
      el("option", { value: "2" }, "~2 min"),
      el("option", { value: "2.5" }, "~2,5 min"),
      el("option", { value: "3" }, "~3 min"),
      el("option", { value: "4" }, "~4 min"),
    );
    durSel.value = String(settings.durationMinutes || 2.5);

    form.append(
      el("div", { class: "field" },
        el("label", null, "Onderwerp"),
        topicInput,
        el("p", { class: "hint" }, "Specifiek of breed. Een naam, een gebeurtenis, een concept."),
      ),
      el("div", { class: "field" },
        el("label", null, "Taal"),
        langSel,
      ),
      el("div", { class: "field" },
        el("label", null, "Lengte"),
        durSel,
      ),
    );

    const status = el("p", { class: "hint" });

    form.append(
      el("div", { class: "new-actions" },
        el("button", { class: "btn-primary", onClick: () => start() }, "Genereer"),
        el("button", { class: "btn-subtle", onClick: () => { location.hash = "#/"; } }, "Annuleer"),
      ),
      status,
    );

    async function start() {
      const topic = topicInput.value.trim();
      if (!topic) { status.innerHTML = '<span class="ai-error">Onderwerp is leeg.</span>'; return; }
      window.Store.patchSettings({ outputLanguage: langSel.value, durationMinutes: parseFloat(durSel.value) });
      const ex = window.Store.create(topic);
      location.hash = "#/ex/" + ex.id;
      // The exercise view picks up status="new" and starts generation
    }

    mount.append(form);
  }

  /* ============ Exercise view ============ */
  async function renderExercise(mount, id) {
    mount.innerHTML = "";
    let ex = window.Store.get(id);
    if (!ex) { renderEmpty(mount); return; }

    // Title row (clickable to rename)
    const titleNode = el("h2", null, ex.title || "Naamloos");
    titleNode.addEventListener("click", () => renameTitle(titleNode, ex));
    const header = el("div", { class: "ex-header" },
      titleNode,
      el("span", { class: "topic" }, "· " + (ex.topic || "")),
    );
    mount.append(header);

    // If still generating or empty, run the generation flow
    if (ex.status !== "ready") {
      const genHost = el("div", { class: "gen-state" });
      mount.append(genHost);
      await runGeneration(ex.id, genHost);
      ex = window.Store.get(ex.id);
      if (!ex || ex.status !== "ready") return;
      // Re-render with the ready exercise
      mount.removeChild(genHost);
    }

    // Player
    const playerHost = el("div", { class: "player" });
    mount.append(playerHost);
    if (ex.audioKey) {
      window.BlobStore.getURL(ex.audioKey).then((url) => {
        if (url) window.Player.makePlayer(playerHost, url);
        else playerHost.innerHTML = '<p class="ai-error">Audio niet gevonden — genereer opnieuw.</p>';
      });
    }

    // Tabs — always read fresh from store so user-answer changes are visible
    const tabBar = el("div", { class: "tabs" });
    const tabBody = el("div", { class: "tab-body" });

    const tabs = [
      { key: "questions", label: "Vragen", render: () => renderQuestions(id, paintBody) },
      { key: "transcript", label: "Transcript", render: () => renderTranscript(window.Store.get(id)) },
      { key: "vocab", label: "Woordenschat & grammatica", render: () => renderVocabGrammar(window.Store.get(id)) },
      { key: "practice", label: "Oefen woordenschat", render: () => renderVocabPractice(id, paintBody) },
    ];
    let active = "questions";
    function paintTabs() {
      tabBar.innerHTML = "";
      tabs.forEach((t) => {
        tabBar.append(el("button", {
          class: "tab" + (active === t.key ? " active" : ""),
          onClick: () => { active = t.key; paintTabs(); paintBody(); },
        }, t.label));
      });
    }
    function paintBody() {
      tabBody.innerHTML = "";
      const t = tabs.find((t) => t.key === active);
      tabBody.append(t.render());
    }
    paintTabs(); paintBody();
    mount.append(tabBar, tabBody);
  }

  function renderQuestions(id, repaint) {
    const ex = window.Store.get(id);
    const host = el("div", { class: "q-list" });
    const userAnswers = ex.userAnswers || [];
    const allAnswered = ex.questions.every((_, i) => typeof userAnswers[i] === "number");

    ex.questions.forEach((q, i) => {
      const card = el("div", { class: "q-card" });
      card.append(el("p", { class: "q-prompt" }, (i + 1) + ". " + q.q));
      q.options.forEach((opt, idx) => {
        const isChecked = userAnswers[i] === idx;
        const optionEl = el("label", { class: "q-option" + (allAnswered && idx === q.correctIndex ? " correct" : (allAnswered && isChecked && idx !== q.correctIndex ? " wrong" : "")) },
          el("input", {
            type: "radio", name: "q" + i,
            checked: isChecked || undefined,
            disabled: allAnswered || undefined,
            onChange: () => pickAnswer(i, idx),
          }),
          opt
        );
        card.append(optionEl);
      });
      if (allAnswered) {
        const correct = userAnswers[i] === q.correctIndex;
        const expl = q.explanation || {};
        card.append(el("div", { class: "q-feedback" },
          el("p", null, el("span", { class: "label" }, correct ? "✓ Goed " : "✗ Niet juist "), "— ", expl.nl || ""),
          expl.en ? el("p", { style: "color:var(--ink-faint);font-size:.82rem;margin-top:.2rem" }, expl.en) : null,
        ));
      }
      host.append(card);
    });

    function pickAnswer(qIdx, optIdx) {
      const cur = window.Store.get(id);
      const ua = (cur.userAnswers || []).slice();
      ua[qIdx] = optIdx;
      window.Store.update(id, { userAnswers: ua });
      if (repaint) repaint();
    }

    if (allAnswered) {
      const right = ex.questions.reduce((a, q, i) => a + (userAnswers[i] === q.correctIndex ? 1 : 0), 0);
      const wrap = el("div", { class: "q-summary" },
        el("p", { class: "big-num" }, right + "/" + ex.questions.length),
        el("p", null, right === ex.questions.length ? "Perfect!" : (right >= 3 ? "Mooi werk." : "Beluister nog eens en probeer opnieuw.")),
      );
      const reset = el("button", { class: "btn-subtle", style: "margin-top:.8rem", onClick: () => {
        window.Store.update(id, { userAnswers: [] });
        if (repaint) repaint();
      } }, "Opnieuw proberen");
      wrap.append(reset);
      host.append(wrap);
    }

    return host;
  }

  function renderTranscript(ex) {
    if (!ex.script) return el("p", { class: "ai-error" }, "Transcript niet beschikbaar.");
    return el("article", { class: "transcript" }, ex.script);
  }

  function renderVocabGrammar(ex) {
    const wrap = el("div");
    if (ex.vocab && ex.vocab.length) {
      wrap.append(el("h3", { class: "section-h" }, "Woordenschat · vocabulary"));
      const ul = el("ul", { class: "vocab-list" });
      ex.vocab.forEach((v) => {
        ul.append(el("li", { class: "vocab-item" },
          el("span", { class: "v-nl" }, v.dutch || v.word || ""),
          el("span", { class: "v-en" }, v.english || v.en || ""),
          v.note ? el("span", { class: "v-note" }, v.note) : null,
        ));
      });
      wrap.append(ul);
    }
    if (ex.grammar && ex.grammar.length) {
      wrap.append(el("h3", { class: "section-h" }, "Grammatica · grammar"));
      const ul = el("ul", { class: "grammar-list" });
      ex.grammar.forEach((g) => {
        ul.append(el("li", { class: "grammar-item" },
          el("p", { class: "g-point" }, g.point || ""),
          el("p", { class: "g-explanation" }, g.explanation || ""),
        ));
      });
      wrap.append(ul);
    }
    if (!wrap.children.length) wrap.append(el("p", { class: "ai-error" }, "Geen woordenschat of grammatica beschikbaar."));
    return wrap;
  }

  /* ============ Vocab practice (flashcards + test in context) ============ */
  // Find the first sentence in the transcript that contains the vocab item, so the
  // user sees the word in its original context.
  function findContext(script, word) {
    if (!script || !word) return "";
    // Use the first significant token of the word
    const tok = word.split(/[\s/·,]/)[0].toLowerCase();
    if (!tok) return "";
    const sentences = script.split(/(?<=[.!?])\s+/);
    const hit = sentences.find((s) => s.toLowerCase().includes(tok));
    return hit || "";
  }

  function highlightWord(sentence, word) {
    if (!sentence || !word) return escapeHTML(sentence || "");
    const tok = word.split(/[\s/·,]/)[0];
    if (!tok) return escapeHTML(sentence);
    // Case-insensitive whole-ish word match
    const esc = tok.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return escapeHTML(sentence).replace(
      new RegExp("(\\b" + esc + "\\w*)", "ig"),
      '<mark>$1</mark>'
    );
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function renderVocabPractice(id, repaint) {
    const ex = window.Store.get(id);
    const vocab = (ex.vocab || []).filter((v) => (v.dutch || v.word) && (v.english || v.en));
    if (!vocab.length) {
      return el("p", { class: "ai-error" }, "Geen woordenschat in deze oefening.");
    }
    // Mode persists per-exercise in localStorage state
    const stateKey = "vp:" + id;
    const persisted = (function () {
      try { return JSON.parse(localStorage.getItem(stateKey) || "null") || {}; }
      catch (e) { return {}; }
    })();
    const state = Object.assign({
      mode: "flash",      // "flash" | "test"
      direction: "nl-en", // "nl-en" | "en-nl"
      flashIndex: 0,
      flashFlipped: false,
      flashOrder: shuffle(vocab.map((_, i) => i)),
      testIndex: 0,
      testFlipped: false,
      testInput: "",
      testRight: 0,
      testWrong: 0,
      testOrder: shuffle(vocab.map((_, i) => i)),
    }, persisted);

    function save() { localStorage.setItem(stateKey, JSON.stringify(state)); }
    function paint() {
      save();
      if (repaint) repaint();
    }

    const wrap = el("div", { class: "practice" });

    // Mode toggle bar
    const modeBar = el("div", { class: "practice-bar" },
      el("div", { class: "speed-pill" },
        el("button", { class: state.mode === "flash" ? "active" : "",
          onClick: () => { state.mode = "flash"; paint(); } }, "Flashcards"),
        el("button", { class: state.mode === "test" ? "active" : "",
          onClick: () => { state.mode = "test"; paint(); } }, "Test"),
      ),
      el("div", { class: "speed-pill" },
        el("button", { class: state.direction === "nl-en" ? "active" : "",
          onClick: () => { state.direction = "nl-en"; paint(); } }, "NL → EN"),
        el("button", { class: state.direction === "en-nl" ? "active" : "",
          onClick: () => { state.direction = "en-nl"; paint(); } }, "EN → NL"),
      ),
      el("button", { class: "btn-subtle", title: "Schud opnieuw", onClick: () => {
        state.flashOrder = shuffle(vocab.map((_, i) => i));
        state.testOrder = shuffle(vocab.map((_, i) => i));
        state.flashIndex = 0; state.flashFlipped = false;
        state.testIndex = 0; state.testFlipped = false; state.testInput = "";
        state.testRight = 0; state.testWrong = 0;
        paint();
      } }, "↻ Schud"),
    );
    wrap.append(modeBar);

    if (state.mode === "flash") {
      wrap.append(renderFlashMode(ex, vocab, state, paint));
    } else {
      wrap.append(renderTestMode(ex, vocab, state, paint));
    }
    return wrap;
  }

  function renderFlashMode(ex, vocab, state, paint) {
    const wrap = el("div");
    if (state.flashIndex >= state.flashOrder.length) {
      state.flashIndex = 0; state.flashFlipped = false;
    }
    const i = state.flashOrder[state.flashIndex];
    const v = vocab[i];
    const prompt = state.direction === "nl-en" ? (v.dutch || v.word) : (v.english || v.en);
    const answer = state.direction === "nl-en" ? (v.english || v.en) : (v.dutch || v.word);
    const context = findContext(ex.script, v.dutch || v.word);

    const card = el("div", { class: "fc-card" });
    card.append(
      el("p", { class: "fc-meta" }, (state.flashIndex + 1) + " / " + state.flashOrder.length + " · " + (state.direction === "nl-en" ? "NL → EN" : "EN → NL")),
      el("p", { class: "fc-prompt" }, prompt),
    );
    if (state.flashFlipped) {
      card.append(el("p", { class: "fc-answer" }, answer));
      if (v.note) card.append(el("p", { class: "fc-note" }, v.note));
      if (context) {
        const cx = el("p", { class: "fc-context" });
        cx.innerHTML = '<span class="fc-ctx-label">In context:</span> ' + highlightWord(context, v.dutch || v.word);
        card.append(cx);
      }
    }
    const actions = el("div", { class: "fc-actions" });
    if (!state.flashFlipped) {
      actions.append(el("button", { onClick: () => { state.flashFlipped = true; paint(); } }, "Omdraaien"));
    } else {
      actions.append(
        el("button", { class: "btn-subtle", onClick: () => {
          state.flashIndex = (state.flashIndex - 1 + state.flashOrder.length) % state.flashOrder.length;
          state.flashFlipped = false; paint();
        } }, "← Vorige"),
        el("button", { onClick: () => {
          state.flashIndex = (state.flashIndex + 1) % state.flashOrder.length;
          state.flashFlipped = false; paint();
        } }, "Volgende →"),
      );
    }
    card.append(actions);
    wrap.append(card);
    return wrap;
  }

  function renderTestMode(ex, vocab, state, paint) {
    const wrap = el("div");
    if (state.testIndex >= state.testOrder.length) {
      // Final summary
      const total = state.testOrder.length;
      const right = state.testRight;
      wrap.append(el("div", { class: "q-summary" },
        el("p", { class: "big-num" }, right + "/" + total),
        el("p", null, right === total ? "Volmaakt." : (right >= total * 0.7 ? "Mooi." : "Doe nog een ronde.")),
        el("div", { style: "display:flex;gap:.4rem;justify-content:center;margin-top:.8rem" },
          el("button", { onClick: () => {
            state.testOrder = shuffle(vocab.map((_, i) => i));
            state.testIndex = 0; state.testFlipped = false; state.testInput = "";
            state.testRight = 0; state.testWrong = 0; paint();
          } }, "Opnieuw"),
        ),
      ));
      return wrap;
    }
    const i = state.testOrder[state.testIndex];
    const v = vocab[i];
    const prompt = state.direction === "nl-en" ? (v.dutch || v.word) : (v.english || v.en);
    const answer = state.direction === "nl-en" ? (v.english || v.en) : (v.dutch || v.word);
    const context = findContext(ex.script, v.dutch || v.word);

    const card = el("div", { class: "fc-card" });
    card.append(
      el("p", { class: "fc-meta" }, (state.testIndex + 1) + " / " + state.testOrder.length + " · " + (state.direction === "nl-en" ? "NL → EN" : "EN → NL")),
      el("p", { class: "fc-prompt" }, prompt),
    );
    if (context && !state.testFlipped) {
      const cx = el("p", { class: "fc-context" });
      cx.innerHTML = '<span class="fc-ctx-label">Hint — context:</span> ' + highlightWord(context, v.dutch || v.word);
      card.append(cx);
    }

    const input = el("input", {
      type: "text", class: "fc-input",
      placeholder: "Type je antwoord…",
      autocomplete: "off", spellcheck: "false",
      disabled: state.testFlipped || undefined,
      onInput: (e) => { state.testInput = e.target.value; },
    });
    input.value = state.testInput || "";

    const feedback = el("div", { class: "fc-feedback" });
    if (state.testFlipped) {
      const ok = looseEqual(state.testInput, answer);
      feedback.innerHTML = ok
        ? '<span style="color:var(--groen);font-weight:600">✓ Goed</span> — ' + escapeHTML(answer)
        : '<span style="color:var(--rood);font-weight:600">✗ Niet juist</span> — antwoord: <em>' + escapeHTML(answer) + '</em>';
      if (v.note) feedback.innerHTML += '<br><span style="color:var(--ink-soft);font-style:italic">' + escapeHTML(v.note) + '</span>';
      if (context) {
        const cx = el("p", { class: "fc-context", style: "margin-top:.6rem" });
        cx.innerHTML = '<span class="fc-ctx-label">In context:</span> ' + highlightWord(context, v.dutch || v.word);
        feedback.append(cx);
      }
    }
    card.append(input, feedback);

    const actions = el("div", { class: "fc-actions" });
    if (!state.testFlipped) {
      actions.append(
        el("button", { onClick: () => check() }, "Controleer"),
        el("button", { class: "btn-subtle", onClick: () => { state.testFlipped = true; paint(); markWrong(false); } }, "Ik weet het niet"),
      );
    } else {
      actions.append(el("button", { onClick: () => next() }, "Volgende →"));
    }
    card.append(actions);

    function check() {
      const ok = looseEqual(state.testInput, answer);
      state.testFlipped = true;
      if (ok) state.testRight += 1; else state.testWrong += 1;
      paint();
    }
    function markWrong(advance) { state.testWrong += 1; }
    function next() {
      state.testIndex += 1; state.testFlipped = false; state.testInput = "";
      paint();
    }
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !state.testFlipped) { e.preventDefault(); check(); }
      else if (e.key === "Enter" && state.testFlipped) { e.preventDefault(); next(); }
    });
    setTimeout(() => { if (!state.testFlipped) input.focus(); }, 30);

    wrap.append(card);
    return wrap;
  }

  function looseEqual(a, b) {
    const norm = (s) => String(s || "").toLowerCase()
      .normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/^(de |het |een |the |a |an )/, "")
      .replace(/[.,;:!?'"„""()…]/g, "")
      .replace(/\s+/g, " ").trim();
    const A = norm(a);
    if (!A) return false;
    // Allow OR-style answers separated by / or ; or ,
    const candidates = String(b || "").split(/[\/;,]/).map(norm).filter(Boolean);
    if (candidates.includes(A)) return true;
    // Tiny levenshtein tolerance
    return candidates.some((c) => lev(A, c) <= (c.length <= 6 ? 1 : 2));
  }
  function lev(a, b) {
    if (a === b) return 0;
    const m = a.length, n = b.length;
    if (!m) return n; if (!n) return m;
    const v = new Array(n + 1);
    for (let j = 0; j <= n; j++) v[j] = j;
    for (let i = 1; i <= m; i++) {
      let prev = i - 1; v[0] = i;
      for (let j = 1; j <= n; j++) {
        const tmp = v[j];
        v[j] = a[i - 1] === b[j - 1] ? prev : 1 + Math.min(prev, v[j], v[j - 1]);
        prev = tmp;
      }
    }
    return v[n];
  }

  function renameTitle(node, ex) {
    const input = document.createElement("input");
    input.type = "text";
    input.value = ex.title || "";
    input.className = "title-edit";
    node.replaceWith(input);
    input.focus(); input.select();
    function commit() {
      const v = input.value.trim() || ex.title;
      window.Store.update(ex.id, { title: v, autoTitled: true });
      window.App.refresh();
    }
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") { e.preventDefault(); commit(); }
      else if (e.key === "Escape") { window.App.refresh(); }
    });
    input.addEventListener("blur", commit);
  }

  async function runGeneration(exId, host) {
    function step(html) { host.innerHTML += '<p class="gen-step">' + html + '</p>'; }
    function setActive(html) { host.innerHTML += '<p class="gen-step"><span class="active">' + html + '…</span></p>'; }

    host.innerHTML = '<h3>Genereren</h3><p>Dit duurt 20–60 seconden.</p>';

    window.Store.update(exId, { status: "generating" });
    setActive("Script + vragen schrijven");

    let ex = window.Store.get(exId);
    let content;
    try {
      content = await window.AI.generateExercise({ topic: ex.topic });
    } catch (err) {
      host.innerHTML += '<p class="ai-error">' + escapeHTML(err.message) + '</p>';
      window.Store.update(exId, { status: "error", error: err.message });
      return;
    }
    // Replace last active step with done marker
    const steps = host.querySelectorAll(".gen-step");
    if (steps.length) steps[steps.length - 1].innerHTML = '<span class="done">✓ Script + vragen klaar</span>';

    const title = content.title && content.title.trim() ? content.title.trim() : ex.title;
    window.Store.update(exId, {
      title,
      autoTitled: true,
      script: content.script || "",
      questions: content.questions || [],
      vocab: content.vocab || [],
      grammar: content.grammar || [],
    });

    const provider = (window.Store.getSettings().ttsProvider || "openai");
    setActive("Audio inspreken (" + (provider === "azure" ? "Azure · Vlaams" : "OpenAI") + ")");
    let blob;
    try {
      blob = await window.AI.generateSpeech(content.script);
    } catch (err) {
      host.innerHTML += '<p class="ai-error">' + escapeHTML(err.message) + '</p>';
      window.Store.update(exId, { status: "error", error: err.message });
      return;
    }
    const audioKey = "audio-" + exId;
    await window.BlobStore.put(audioKey, blob);
    const steps2 = host.querySelectorAll(".gen-step");
    if (steps2.length) steps2[steps2.length - 1].innerHTML = '<span class="done">✓ Audio opgeslagen</span>';

    window.Store.update(exId, { audioKey, status: "ready", userAnswers: [] });
    window.App.refresh();
  }

  /* ============ Settings ============ */
  function renderSettings(mount) {
    mount.innerHTML = "";
    const s = window.Store.getSettings();
    const root = el("div", { class: "settings-page" });
    root.append(el("h2", { class: "view-title" }, "Instellingen"));

    // API key
    const sec1 = el("div", { class: "settings-section" });
    sec1.append(el("h3", null, "OpenAI"));
    const keyInput = el("input", { type: "password", value: s.apiKey, placeholder: "sk-..." });
    keyInput.addEventListener("input", () => window.Store.patchSettings({ apiKey: keyInput.value.trim() }));
    const showBtn = el("button", { class: "btn-subtle", onClick: () => { keyInput.type = keyInput.type === "password" ? "text" : "password"; } }, "Toon");
    const testBtn = el("button", { class: "btn-subtle", onClick: async () => {
      testBtn.disabled = true; testBtn.textContent = "testen…";
      try {
        const r = await window.AI.testKey();
        testResult.innerHTML = '<span style="color:var(--groen)">✓ Verbonden — antwoord: <em>' + escapeHTML(r) + '</em></span>';
      } catch (err) {
        testResult.innerHTML = '<span class="ai-error">' + escapeHTML(err.message) + '</span>';
      } finally {
        testBtn.disabled = false; testBtn.textContent = "Test verbinding";
      }
    } }, "Test verbinding");
    const testResult = el("p", { class: "hint" });

    sec1.append(
      el("div", { class: "field" },
        el("label", null, "API-sleutel"),
        keyInput,
        el("div", { style: "display:flex;gap:.4rem;margin-top:.3rem" }, showBtn, testBtn),
        testResult,
      ),
    );

    // Chat model
    const chatSel = el("select", null,
      el("option", { value: "gpt-5-nano" }, "gpt-5-nano  ·  goedkoopst"),
      el("option", { value: "gpt-5-mini" }, "gpt-5-mini  ·  aanbevolen"),
      el("option", { value: "gpt-5" }, "gpt-5  ·  diepste analyse"),
    );
    chatSel.value = s.chatModel;
    chatSel.addEventListener("change", () => window.Store.patchSettings({ chatModel: chatSel.value }));
    sec1.append(el("div", { class: "field" },
      el("label", null, "Tekstmodel (script + vragen)"),
      chatSel,
      el("p", { class: "hint" }, "Per oefening ~$0,003 met gpt-5-mini."),
    ));

    root.append(sec1);

    /* ============ TTS provider section ============ */
    const ttsSec = el("div", { class: "settings-section" });
    ttsSec.append(el("h3", null, "Audio (TTS)"));

    const providerSel = el("select", null,
      el("option", { value: "openai" }, "OpenAI  ·  neutraal Standaardnederlands"),
      el("option", { value: "azure" }, "Azure Speech  ·  Vlaams (BE) accent ★"),
    );
    providerSel.value = s.ttsProvider || "openai";
    providerSel.addEventListener("change", () => {
      window.Store.patchSettings({ ttsProvider: providerSel.value });
      renderSettings(mount); // re-render so the right provider section shows
    });

    ttsSec.append(el("div", { class: "field" },
      el("label", null, "TTS-provider"),
      providerSel,
      el("p", { class: "hint" }, "Kies welk audio-platform de luisterfragmenten inspreekt."),
    ));

    // OpenAI sub-section
    if ((s.ttsProvider || "openai") === "openai") {
      const ttsModelSel = el("select", null,
        el("option", { value: "gpt-4o-mini-tts" }, "gpt-4o-mini-tts  ·  natuurlijk (aanbevolen)"),
        el("option", { value: "tts-1" }, "tts-1  ·  klassiek, snel"),
        el("option", { value: "tts-1-hd" }, "tts-1-hd  ·  hogere kwaliteit"),
      );
      ttsModelSel.value = s.ttsModel;
      ttsModelSel.addEventListener("change", () => window.Store.patchSettings({ ttsModel: ttsModelSel.value }));

      const voiceSel = el("select", null,
        ...["alloy","echo","fable","onyx","nova","shimmer","sage","ash"].map((v) =>
          el("option", { value: v }, v))
      );
      voiceSel.value = s.ttsVoice;
      voiceSel.addEventListener("change", () => window.Store.patchSettings({ ttsVoice: voiceSel.value }));

      ttsSec.append(
        el("div", { class: "field" }, el("label", null, "OpenAI TTS-model"), ttsModelSel,
          el("p", { class: "hint" }, "Per 2,5 min ~$0,03. Stem klinkt neutraal, niet specifiek Vlaams.")),
        el("div", { class: "field" }, el("label", null, "Stem"), voiceSel),
      );
    } else {
      // Azure sub-section
      const azKeyInput = el("input", { type: "password", value: s.azureKey || "", placeholder: "Azure subscription key" });
      azKeyInput.addEventListener("input", () => window.Store.patchSettings({ azureKey: azKeyInput.value.trim() }));
      const azShowBtn = el("button", { class: "btn-subtle", onClick: () => { azKeyInput.type = azKeyInput.type === "password" ? "text" : "password"; } }, "Toon");

      const azRegions = ["westeurope","northeurope","francecentral","swedencentral","germanywestcentral","uksouth","eastus","westus2"];
      const azRegionSel = el("select", null, ...azRegions.map((r) => el("option", { value: r }, r)));
      azRegionSel.value = s.azureRegion || "westeurope";
      azRegionSel.addEventListener("change", () => window.Store.patchSettings({ azureRegion: azRegionSel.value }));

      const azVoiceSel = el("select", null,
        el("option", { value: "nl-BE-DenaNeural" }, "nl-BE-DenaNeural  ·  Vlaams (vrouw)  ★"),
        el("option", { value: "nl-BE-ArnaudNeural" }, "nl-BE-ArnaudNeural  ·  Vlaams (man)  ★"),
        el("option", { value: "nl-NL-FennaNeural" }, "nl-NL-FennaNeural  ·  Hollands (vrouw)"),
        el("option", { value: "nl-NL-MaartenNeural" }, "nl-NL-MaartenNeural  ·  Hollands (man)"),
        el("option", { value: "nl-NL-ColetteNeural" }, "nl-NL-ColetteNeural  ·  Hollands (vrouw)"),
      );
      azVoiceSel.value = s.azureVoice || "nl-BE-DenaNeural";
      azVoiceSel.addEventListener("change", () => window.Store.patchSettings({ azureVoice: azVoiceSel.value }));

      const azRateSel = el("select", null,
        el("option", { value: "-20%" }, "Heel rustig (-20%)"),
        el("option", { value: "-10%" }, "Rustig (-10%)"),
        el("option", { value: "0%" }, "Normaal (0%)"),
        el("option", { value: "+10%" }, "Snel (+10%)"),
      );
      azRateSel.value = s.azureRate || "0%";
      azRateSel.addEventListener("change", () => window.Store.patchSettings({ azureRate: azRateSel.value }));

      const azTestBtn = el("button", { class: "btn-subtle", onClick: async () => {
        azTestBtn.disabled = true; azTestBtn.textContent = "testen…";
        try {
          await window.AI.testAzureKey();
          azTestResult.innerHTML = '<span style="color:var(--groen)">✓ Azure-verbinding OK</span>';
        } catch (err) {
          azTestResult.innerHTML = '<span class="ai-error">' + escapeHTML(err.message) + '</span>';
        } finally {
          azTestBtn.disabled = false; azTestBtn.textContent = "Test verbinding";
        }
      } }, "Test verbinding");
      const azTestResult = el("p", { class: "hint" });

      ttsSec.append(
        el("div", { class: "field" },
          el("label", null, "Azure subscription key"),
          azKeyInput,
          el("div", { style: "display:flex;gap:.4rem;margin-top:.3rem" }, azShowBtn, azTestBtn),
          azTestResult,
          el("p", { class: "hint" }, "Vrij F0-tarief geeft je 500.000 tekens/maand gratis (≈5 uur audio)."),
        ),
        el("div", { class: "field" },
          el("label", null, "Regio"),
          azRegionSel,
          el("p", { class: "hint" }, "Kies de regio die je in Azure portal hebt aangemaakt. West Europe geeft de beste latentie vanuit België."),
        ),
        el("div", { class: "field" },
          el("label", null, "Stem"),
          azVoiceSel,
          el("p", { class: "hint" }, "Dena en Arnaud zijn echte Vlaams-Belgische stemmen."),
        ),
        el("div", { class: "field" },
          el("label", null, "Spreektempo"),
          azRateSel,
        ),
      );
    }

    root.append(ttsSec);

    // Storage section
    const sec2 = el("div", { class: "settings-section" });
    sec2.append(el("h3", null, "Opslag"));
    const usage = el("p", { class: "usage-bar" }, "berekenen…");
    window.BlobStore.list().then((rows) => {
      const total = rows.reduce((a, r) => a + (r.size || 0), 0);
      const mb = (total / 1024 / 1024).toFixed(2);
      usage.textContent = rows.length + " audio-bestand" + (rows.length === 1 ? "" : "en") + "  ·  " + mb + " MB";
    });
    sec2.append(usage);
    root.append(sec2);

    mount.append(root);
  }

  window.Views = {
    empty: renderEmpty,
    new: renderNew,
    exercise: renderExercise,
    settings: renderSettings,
  };
})();
