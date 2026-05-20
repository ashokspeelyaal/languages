/* AI-powered views and helpers.
 * Reuses the `el` DOM helper attached to window via views.js bootstrap. */
(function () {
  // Tiny DOM builder (mirror of the one in views.js; kept local so this file
  // is independent and can be loaded before views.js if needed).
  function el(tag, props, ...children) {
    const n = document.createElement(tag);
    if (props) {
      Object.entries(props).forEach(([k, v]) => {
        if (k === "class") n.className = v;
        else if (k === "html") n.innerHTML = v;
        else if (k.startsWith("on") && typeof v === "function") n.addEventListener(k.slice(2).toLowerCase(), v);
        else if (v === true) n.setAttribute(k, "");
        else if (v != null && v !== false) n.setAttribute(k, v);
      });
    }
    for (const c of children.flat()) {
      if (c == null || c === false) continue;
      n.append(c.nodeType ? c : document.createTextNode(c));
    }
    return n;
  }

  // Light formatting: bold **text**, italics *text*, line breaks.
  function format(text) {
    return text
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/(?<!\*)\*([^*]+?)\*(?!\*)/g, "<em>$1</em>")
      .replace(/\n/g, "<br>");
  }

  /* ============ Generic AI button + panel ============ */
  // Creates a button that, on click, requests an AI completion and renders
  // the result in a panel beneath the button's parent.
  function aiButton({ label, labelEn, kind, system, user, maxTokens = 350, parent, json, onResult }) {
    if (!window.AI.isConfigured()) {
      return el("a", {
        class: "ai-btn", href: "#/settings",
        title: "Stel je API-sleutel in om AI te gebruiken",
      },
        label, labelEn ? el("span", { class: "label-en" }, "· " + labelEn) : null
      );
    }
    let panel = null;
    const btn = el("button", {
      class: "ai-btn",
      onClick: async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (panel) { panel.remove(); panel = null; return; }
        const host = parent || btn.parentElement;
        panel = el("div", { class: "ai-panel" },
          el("div", { class: "ai-panel-head" },
            el("span", { class: "badge" }, "AI"),
            el("span", null, label),
          ),
          el("button", { class: "ai-panel-close", title: "Sluiten", onClick: () => { panel.remove(); panel = null; } }, "✕"),
          el("div", { class: "ai-panel-body" },
            el("span", { class: "ai-loading" }, "denkt na…"),
          ),
        );
        host.append(panel);
        try {
          const r = await window.AI.complete({ kind, system, user, maxTokens, json });
          if (!panel) return; // closed before response arrived
          const body = panel.querySelector(".ai-panel-body");
          body.innerHTML = "";
          if (json) {
            try {
              const obj = JSON.parse(r.text);
              if (onResult) onResult(body, obj, r);
              else body.innerHTML = format(JSON.stringify(obj, null, 2));
            } catch (e) {
              body.innerHTML = format(r.text);
            }
          } else {
            body.innerHTML = format(r.text);
          }
          if (r.cached) {
            panel.querySelector(".ai-panel-head").append(el("span", { class: "cached" }, "uit cache"));
          }
        } catch (err) {
          if (!panel) return;
          panel.querySelector(".ai-panel-body").innerHTML =
            `<div class="ai-error">${format(err.message)}</div>`;
        }
      },
    },
      label,
      labelEn ? el("span", { class: "label-en" }, "· " + labelEn) : null
    );
    return btn;
  }

  /* ============ Bilingual renderer (NL + EN side by side) ============ */
  function renderBilingual(host, obj) {
    host.innerHTML = "";
    const wrap = el("div", { class: "bilingual" });
    wrap.append(
      el("div", { class: "nl" },
        el("span", { class: "lang-tag" }, "NL"),
        el("span", { html: format(obj.nl || "") }),
      ),
      el("div", { class: "en" },
        el("span", { class: "lang-tag" }, "EN"),
        el("span", { html: format(obj.en || "") }),
      ),
    );
    host.append(wrap);
  }

  /* ============ Specific coaches ============ */
  function explainWord(item) {
    const sys = "Je bent een Nederlandse taalcoach voor een gevorderde leerder in Vlaams-België (CNaVT C1-niveau). Leg het Nederlandse woord/uitdrukking uit in 3 à 4 korte zinnen: nuance, register, wanneer wel/niet gebruiken, en — alleen als relevant — verschil tussen BE-NL en NL-NL gebruik. Geef de uitleg in TWEE talen, in geldige JSON: {\"nl\": \"...uitleg in helder Nederlands...\", \"en\": \"...same explanation, in clear English...\"}. Geen opsomming, gewoon lopende tekst. ALLEEN JSON terug — geen markdown, geen toelichting eromheen.";
    const user = `Woord: ${item.dutch}\nEngels: ${item.english}\nCategorie: ${item.category}\nVoorbeeld: ${item.exampleNL}`;
    return aiButton({
      label: "Uitleg",
      labelEn: "explain",
      kind: "explain",
      system: sys,
      user,
      maxTokens: 600,
      json: true,
      onResult: renderBilingual,
    });
  }

  function moreExamples(item) {
    const sys = "Je bent een Nederlandse taalcoach voor Vlaams-België. Geef drie nieuwe voorbeeldzinnen voor het opgegeven woord/uitdrukking: één informeel/dagelijks, één neutraal/journalistiek, één formeel/academisch. Vermeld bij elke zin het register tussen haakjes. Antwoord in geldige JSON met twee talen: {\"nl\": \"Informeel: ...\\n\\nNeutraal: ...\\n\\nFormeel: ...\", \"en\": \"Informal: ...(English translation)\\n\\nNeutral: ...\\n\\nFormal: ...\"}. Houd zinnen kort (max 15 woorden). ALLEEN JSON terug.";
    const user = `Woord: ${item.dutch}\nBetekenis: ${item.english}\nBestaande voorbeeldzin: ${item.exampleNL}`;
    return aiButton({
      label: "Meer voorbeelden",
      labelEn: "more examples",
      kind: "examples",
      system: sys,
      user,
      maxTokens: 500,
      json: true,
      onResult: renderBilingual,
    });
  }

  function explainMistake(item, userAnswer) {
    const sys = "Je bent een vriendelijke Nederlandse taalcoach. De leerder typte een fout antwoord. Leg bondig (2-3 zinnen) uit waarom hun antwoord niet juist is en wat het correcte antwoord betekent. Geen verwijten. Antwoord in geldige JSON met twee talen: {\"nl\": \"...uitleg in helder Nederlands...\", \"en\": \"...same explanation in clear English...\"}. ALLEEN JSON terug.";
    const user = `Vraag (Engels of context): ${item.english}\nCorrect Nederlands: ${item.dutch}\nMijn antwoord: ${userAnswer || "(leeg)"}\nVoorbeeld: ${item.exampleNL}`;
    return aiButton({
      label: "Waarom?",
      labelEn: "why?",
      kind: "mistake",
      system: sys,
      user,
      maxTokens: 400,
      json: true,
      onResult: renderBilingual,
    });
  }

  /* ============ Settings view ============ */
  function renderSettings(mount) {
    const s = window.Store.state.settings;
    mount.innerHTML = "";
    const root = el("div", { class: "settings-page" });

    root.append(el("h2", { class: "view-title" }, "Instellingen ", el("span", { class: "accent" }, "· AI & app")));
    root.append(el("p", { class: "view-sub" },
      "Je API-sleutel wordt uitsluitend lokaal bewaard (in je browser). Niets gaat ergens anders heen dan rechtstreeks naar OpenAI."
    ));

    // --- AI access section ---
    const aiSec = el("div", { class: "settings-section" });
    aiSec.append(el("h3", null, "OpenAI toegang"));
    aiSec.append(el("p", { class: "sub" }, "Plak hier je OpenAI API-sleutel. Hij blijft in localStorage op deze computer."));

    let showing = false;
    const keyField = el("input", {
      type: "password",
      value: s.apiKey || "",
      placeholder: "sk-...",
      autocomplete: "off",
      spellcheck: "false",
    });
    keyField.addEventListener("input", () => {
      window.Store.state.settings.apiKey = keyField.value.trim();
      window.Store.save();
    });

    const showBtn = el("button", { class: "subtle", onClick: () => {
      showing = !showing;
      keyField.type = showing ? "text" : "password";
      showBtn.textContent = showing ? "verberg" : "toon";
    } }, "toon");

    const testBtn = el("button", { onClick: async () => {
      testBtn.disabled = true;
      testBtn.textContent = "testen…";
      const out = aiSec.querySelector(".key-test-result");
      out.textContent = "";
      try {
        const r = await window.AI.testKey();
        out.innerHTML = `<span style="color:var(--groen)">✓ Verbinding OK</span> — antwoord: <em>${r}</em>`;
      } catch (err) {
        out.innerHTML = `<span class="ai-error">✗ ${err.message}</span>`;
      } finally {
        testBtn.disabled = false;
        testBtn.textContent = "Test verbinding";
      }
    } }, "Test verbinding");

    const modelSel = el("select", { class: "select-input", onChange: (e) => {
      window.Store.state.settings.aiModel = e.target.value;
      window.Store.save();
    } },
      ...[
        ["gpt-4o-mini", "gpt-4o-mini  · snel & goedkoop (aanbevolen)"],
        ["gpt-4o", "gpt-4o  · sterker, duurder"],
        ["gpt-4.1-mini", "gpt-4.1-mini · nog scherper"],
        ["gpt-4.1", "gpt-4.1 · krachtigst, duurst"],
      ].map(([v, lbl]) => el("option", { value: v, selected: v === s.aiModel || undefined }, lbl))
    );

    aiSec.append(
      el("div", { class: "field" },
        el("label", { for: "apikey" }, "API-sleutel"),
        keyField,
        el("div", { class: "field actions" },
          showBtn,
          testBtn,
          el("span", { class: "key-test-result", style: "font-size:.85rem;margin-left:.5rem" }, ""),
        ),
        el("p", { class: "hint" }, "Aanmaken: platform.openai.com/api-keys"),
      ),
      el("div", { class: "field" },
        el("label", null, "Model"),
        modelSel,
        el("p", { class: "hint" }, "gpt-4o-mini volstaat ruim voor woordencoaching. Stap naar gpt-4o als de uitleg te kort is."),
      ),
      el("div", { class: "field" },
        el("label", null, "AI ingeschakeld"),
        el("label", { style: "display:flex;align-items:center;gap:.5rem;font-family:var(--sans);font-size:.95rem" },
          el("input", {
            type: "checkbox", checked: s.aiEnabled || undefined,
            onChange: (e) => {
              window.Store.state.settings.aiEnabled = e.target.checked;
              window.Store.save();
            },
          }),
          "Toon AI-knoppen in de app"
        ),
      ),
    );
    root.append(aiSec);

    // --- Usage section ---
    const useSec = el("div", { class: "settings-section" });
    useSec.append(el("h3", null, "Gebruik · usage"));
    const used = window.AI.todayCount();
    const limit = s.aiSoftLimit || 50;
    const chipCls = used >= limit ? "ai-counter-chip warn" : "ai-counter-chip";
    useSec.append(el("p", { class: "sub" },
      "Vandaag: ", el("span", { class: chipCls }, `${used} oproep${used === 1 ? "" : "en"}`),
      "  ·  zachte waarschuwing vanaf ", String(limit), ". Schat: ≈ $0,00018/oproep voor gpt-4o-mini."
    ));

    const days = window.AI.recentCalls(14);
    const max = Math.max(1, ...days.map((d) => d.total));
    const bar = el("div", { class: "usage-bar" });
    days.forEach((d, i) => {
      const last = i === days.length - 1;
      bar.append(el("div", { class: "bar" + (last ? " today" : ""), title: `${d.iso}: ${d.total}` },
        el("span", { style: `height:${(d.total / max) * 100}%` })));
    });
    useSec.append(bar);
    useSec.append(el("p", { class: "hint" }, "Laatste 14 dagen — hover voor totaal per dag."));

    useSec.append(el("div", { class: "field actions", style: "margin-top:1rem" },
      el("button", { class: "subtle", onClick: () => {
        window.AI.clearCache();
        renderSettings(mount);
      } }, `Cache wissen (${window.AI.cacheSize()})`),
      el("span", { class: "hint" }, "AI-antwoorden worden gecachet zodat herhaalde klikken gratis zijn."),
    ));
    root.append(useSec);

    // --- General app section ---
    const appSec = el("div", { class: "settings-section" });
    appSec.append(el("h3", null, "App · algemene voorkeuren"));
    appSec.append(el("div", { class: "field actions" },
      el("button", { class: "subtle", onClick: window.Store.exportJSON }, "Exporteer voortgang"),
      el("button", { class: "subtle danger", onClick: window.Store.reset }, "Reset alles"),
    ));
    root.append(appSec);

    mount.append(root);
  }

  /* ============ Essay grader view ============ */
  function renderEssay(mount) {
    mount.innerHTML = "";
    const root = el("div", { class: "essay-page" });
    root.append(
      el("h2", { class: "view-title" }, "Essay grader ", el("span", { class: "accent" }, "· CNaVT-rubric")),
      el("p", { class: "view-sub" },
        "Plak je essay (Nederlands, 200–400 woorden). De AI scoort op de officiële CNaVT C1-criteria en geeft drie concrete verbeterpunten."
      ),
    );

    if (!window.AI.isConfigured()) {
      root.append(el("div", { class: "empty-ai" },
        "AI nog niet geconfigureerd. ", el("a", { href: "#/settings" }, "Stel je sleutel in"), " om essays te laten beoordelen."));
      mount.append(root);
      return;
    }

    const area = el("textarea", { class: "essay-area", placeholder: "Plak hier je essay…", spellcheck: "false" });
    const meta = el("div", { class: "essay-meta" },
      el("span", { id: "essay-wc" }, "0 woorden"),
      el("span", { id: "essay-warn", class: "warn" }, ""),
    );
    function updateMeta() {
      const wc = (area.value.match(/\b[\w'-]+\b/g) || []).length;
      meta.querySelector("#essay-wc").textContent = `${wc} woord${wc === 1 ? "" : "en"}`;
      const w = meta.querySelector("#essay-warn");
      if (wc < 150) w.textContent = "te kort voor C1 (richt op 200–400)";
      else if (wc > 500) w.textContent = "lang — een kortere essay scoort gerichter";
      else w.textContent = "";
    }
    area.addEventListener("input", updateMeta);
    root.append(area, meta);

    const actions = el("div", { style: "display:flex;gap:.5rem;margin-top:1rem;align-items:center" });
    const submitBtn = el("button", { onClick: grade }, "Beoordeel · grade");
    const status = el("span", { style: "font-size:.85rem;color:var(--ink-faint)" });
    actions.append(submitBtn, status);
    root.append(actions);

    const resultMount = el("div");
    root.append(resultMount);

    async function grade() {
      const essay = area.value.trim();
      if (essay.length < 80) {
        status.textContent = "te kort om zinvol te beoordelen";
        return;
      }
      submitBtn.disabled = true;
      status.innerHTML = '<span class="ai-loading">beoordelen…</span>';
      resultMount.innerHTML = "";
      const system = "Je bent een CNaVT-examinator op niveau C1 Educatief Professioneel (Vlaams-Belgisch Nederlands). Beoordeel het essay volgens de rubric. Geef alleen geldige JSON terug — geen markdown, geen extra tekst. Alle feedback-tekst in TWEE talen (Nederlands + Engels). Structuur:\n{\n  \"scores\": [\n    {\"criterion\": \"Inhoud & taakvervulling\", \"score\": 1-5, \"feedback\": {\"nl\": \"...\", \"en\": \"...\"}},\n    {\"criterion\": \"Coherentie & samenhang\", \"score\": 1-5, \"feedback\": {\"nl\": \"...\", \"en\": \"...\"}},\n    {\"criterion\": \"Lexicale rijkdom\", \"score\": 1-5, \"feedback\": {\"nl\": \"...\", \"en\": \"...\"}},\n    {\"criterion\": \"Grammaticale correctheid\", \"score\": 1-5, \"feedback\": {\"nl\": \"...\", \"en\": \"...\"}},\n    {\"criterion\": \"Register & stijl\", \"score\": 1-5, \"feedback\": {\"nl\": \"...\", \"en\": \"...\"}}\n  ],\n  \"improvements\": [\n    {\"nl\": \"verbeterpunt 1 in Nederlands\", \"en\": \"improvement 1 in English\"},\n    {\"nl\": \"...\", \"en\": \"...\"},\n    {\"nl\": \"...\", \"en\": \"...\"}\n  ],\n  \"overall\": {\"nl\": \"globale beoordeling in 1-2 zinnen\", \"en\": \"overall in 1-2 sentences\"}\n}";
      const user = "Essay:\n\n" + essay;
      try {
        const r = await window.AI.complete({
          kind: "essay",
          system, user,
          maxTokens: 1500,
          json: true,
          noCache: true, // each essay is unique
        });
        const obj = JSON.parse(r.text);
        status.textContent = "klaar.";
        renderRubric(resultMount, obj);
      } catch (err) {
        status.innerHTML = `<span class="ai-error">${err.message}</span>`;
      } finally {
        submitBtn.disabled = false;
      }
    }
    // Helper: render either a string or {nl, en} as bilingual block
    function bilingualBlock(value) {
      if (value && typeof value === "object" && (value.nl || value.en)) {
        return el("div", { class: "bilingual", style: "margin:0;gap:.7rem 1.4rem" },
          el("div", { class: "nl" }, el("span", { class: "lang-tag" }, "NL"), value.nl || ""),
          el("div", { class: "en" }, el("span", { class: "lang-tag" }, "EN"), value.en || ""),
        );
      }
      return el("p", null, value || "");
    }
    function renderRubric(host, obj) {
      host.innerHTML = "";
      const avg = obj.scores.reduce((a, s) => a + s.score, 0) / obj.scores.length;
      const overallNl = (obj.overall && typeof obj.overall === "object") ? (obj.overall.nl || "") : (obj.overall || "");
      const overallEn = (obj.overall && typeof obj.overall === "object") ? (obj.overall.en || "") : "";
      host.append(el("div", { style: "margin-top:1.4rem" },
        el("div", { style: "display:flex;align-items:baseline;gap:1rem" },
          el("span", { style: "font-family:var(--serif);font-size:2rem;font-weight:600;color:var(--rood)" }, avg.toFixed(1) + " / 5"),
        ),
        overallNl || overallEn ? el("div", { style: "margin-top:.5rem" },
          bilingualBlock({ nl: overallNl, en: overallEn })) : null,
      ));
      const rubric = el("div", { class: "rubric" });
      obj.scores.forEach((s) => {
        const row = el("div", { class: "rubric-row score-" + s.score },
          el("span", { class: "name" }, s.criterion),
          el("span", { class: "score" }, s.score + "/5"),
        );
        const fbHost = el("div", { class: "feedback", style: "grid-column:1/-1" });
        fbHost.append(bilingualBlock(s.feedback));
        row.append(fbHost);
        rubric.append(row);
      });
      host.append(rubric);
      if (obj.improvements && obj.improvements.length) {
        const ul = el("ol", null);
        obj.improvements.forEach((imp) => {
          ul.append(el("li", { style: "margin-bottom:.8rem" }, bilingualBlock(imp)));
        });
        host.append(el("div", { class: "improvements" },
          el("h4", null, "Drie concrete verbeterpunten · three concrete improvements"),
          ul,
        ));
      }
    }

    mount.append(root);
    updateMeta();
  }

  /* ============ Chat view ============ */
  function renderChat(mount) {
    mount.innerHTML = "";
    const root = el("div", { class: "chat-page" });
    root.append(el("div", { class: "chat-head" },
      el("h2", { class: "view-title" }, "Chat ", el("span", { class: "accent" }, "· conversatiepartner")),
      el("p", { class: "view-sub" }, "Praat in het Nederlands. De AI verbetert je fouten zachtjes door correcte herhaling.")
    ));

    if (!window.AI.isConfigured()) {
      root.append(el("div", { class: "empty-ai" },
        "AI nog niet geconfigureerd. ", el("a", { href: "#/settings" }, "Stel je sleutel in"), " om te chatten."));
      mount.append(root);
      return;
    }

    // Persist history per session in localStorage
    const key = "b2vocab.chatHistory";
    let history;
    try { history = JSON.parse(localStorage.getItem(key) || "[]"); }
    catch (e) { history = []; }

    const scroll = el("div", { class: "chat-scroll" });
    const input = el("textarea", { placeholder: "Typ in het Nederlands… (Enter = verstuur, Shift+Enter = nieuwe regel)" });
    const sendBtn = el("button", { onClick: send }, "Verstuur");
    const clearBtn = el("button", { class: "subtle", onClick: () => {
      if (!confirm("Gespreksgeschiedenis wissen?")) return;
      history = [];
      localStorage.removeItem(key);
      renderHistory();
    } }, "Wis");

    function renderHistory() {
      scroll.innerHTML = "";
      if (history.length === 0) {
        scroll.append(el("div", { class: "empty-ai" },
          "Begin met iets als ", el("em", null, "\"Hoi, ik woon in Limburg en wil mijn Nederlands oefenen.\""),
          " De AI antwoordt natuurlijk."));
        return;
      }
      history.forEach((m) => {
        scroll.append(el("div", { class: "chat-msg " + (m.role === "user" ? "user" : "ai") },
          el("div", { class: "who" }, m.role === "user" ? "jij" : "AI"),
          el("div", { class: "body", html: format(m.content) }),
        ));
      });
      scroll.scrollTop = scroll.scrollHeight;
    }

    async function send() {
      const txt = input.value.trim();
      if (!txt) return;
      history.push({ role: "user", content: txt });
      localStorage.setItem(key, JSON.stringify(history));
      input.value = "";
      renderHistory();
      sendBtn.disabled = true;

      // Add a placeholder AI message
      const aiMsg = el("div", { class: "chat-msg ai" },
        el("div", { class: "who" }, "AI"),
        el("div", { class: "body" }, el("span", { class: "ai-loading" }, "denkt na…")),
      );
      scroll.append(aiMsg);
      scroll.scrollTop = scroll.scrollHeight;

      const system = "Je bent een Nederlandse conversatiepartner in Vlaams-België. Spreek natuurlijk en idiomatisch Nederlands op B2-C1 niveau. Verbeter fouten van de gebruiker subtiel door het correcte alternatief in jouw antwoord te gebruiken (zonder uitleg te geven, tenzij gevraagd). Stel follow-up-vragen om het gesprek levendig te houden. Houd antwoorden tot 3-4 zinnen, tenzij meer nodig is.";
      // Provide last ~10 turns as context
      const context = history.slice(-10).map((m) => `${m.role === "user" ? "Gebruiker" : "AI"}: ${m.content}`).join("\n");
      try {
        const r = await window.AI.complete({
          kind: "chat",
          system,
          user: context,
          maxTokens: 350,
          noCache: true,
        });
        history.push({ role: "assistant", content: r.text });
        localStorage.setItem(key, JSON.stringify(history));
        renderHistory();
      } catch (err) {
        aiMsg.querySelector(".body").innerHTML = `<span class="ai-error">${format(err.message)}</span>`;
      } finally {
        sendBtn.disabled = false;
        input.focus();
      }
    }

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
    });

    const inputRow = el("div", { class: "chat-input-row" }, input, el("div", { style: "display:flex;flex-direction:column;gap:.4rem" }, sendBtn, clearBtn));

    root.append(scroll, inputRow);
    mount.append(root);
    renderHistory();
    setTimeout(() => input.focus(), 50);
  }

  /* ============ Adaptive Quizzer (called from Dashboard) ============ */
  function generateAdaptiveQuiz(weakCats, host) {
    if (!window.AI.isConfigured()) {
      host.innerHTML = `<div class="empty-ai">AI nog niet geconfigureerd. <a href="#/settings">Stel je sleutel in</a>.</div>`;
      return;
    }
    if (!weakCats.length) {
      host.innerHTML = `<div class="empty-ai">Nog niet genoeg data om zwakke plekken te bepalen. Doe eerst een paar sessies.</div>`;
      return;
    }
    host.innerHTML = `<div class="ai-loading" style="padding:1rem">vragen worden gegenereerd…</div>`;
    const system = "Je bent een Nederlandse taalcoach voor Vlaams-België (CNaVT C1). Genereer 5 korte multiple-choice-vragen die de leerder helpen oefenen op de opgegeven zwakke categorieën. Antwoord ALLEEN met geldige JSON:\n{\n  \"questions\": [\n    {\"prompt\":\"...\",\"options\":[\"a\",\"b\",\"c\",\"d\"],\"correctIndex\":0,\"explanation\":{\"nl\":\"korte uitleg waarom dat antwoord juist is\",\"en\":\"short explanation why that answer is correct\"}}\n  ]\n}\nDe vraag mag in het Nederlands of Engels zijn, options altijd in het Nederlands. Explanation is verplicht TWEETALIG. Maak elke vraag concreet (niet over grammatica-regels, wel over een specifiek woord of frase in context).";
    const user = "Zwakke categorieën:\n" + weakCats.map((w) => `- ${w.cat} (${Math.round(w.rate * 100)}% fout)`).join("\n");
    window.AI.complete({ kind: "quiz", system, user, maxTokens: 1400, json: true, noCache: true })
      .then((r) => {
        const obj = JSON.parse(r.text);
        renderQuiz(host, obj.questions || []);
      })
      .catch((err) => { host.innerHTML = `<div class="ai-error">${err.message}</div>`; });
  }

  function renderQuiz(host, questions) {
    host.innerHTML = "";
    if (!questions.length) {
      host.innerHTML = `<div class="empty-ai">Geen vragen gegenereerd. Probeer opnieuw.</div>`;
      return;
    }
    let i = 0, right = 0;
    const stage = el("div", { style: "padding:1.2rem 0" });
    host.append(stage);

    function render() {
      stage.innerHTML = "";
      if (i >= questions.length) {
        stage.append(el("div", { class: "summary", style: "padding:1rem 0" },
          el("p", { class: "big-num" }, `${right}/${questions.length}`),
          el("p", null, "Adaptieve quiz klaar."),
          el("div", { class: "summary-actions" },
            el("button", { onClick: () => { i = 0; right = 0; render(); } }, "Opnieuw"),
          ),
        ));
        return;
      }
      const q = questions[i];
      stage.append(
        el("p", { style: "font-family:var(--serif);font-size:1.15rem;font-weight:600" }, `Vraag ${i + 1} / ${questions.length}`),
        el("p", { style: "font-family:var(--serif);font-size:1.05rem;margin:.4rem 0 1rem" }, q.prompt),
      );
      const opts = el("div", { class: "mc-options" });
      q.options.forEach((opt, idx) => {
        const btn = el("button", { class: "mc-option", onClick: () => pick(btn, idx) }, opt);
        opts.append(btn);
      });
      stage.append(opts);
      const fb = el("div", { class: "typed-feedback" });
      stage.append(fb);

      function pick(btn, idx) {
        if (btn.disabled) return;
        opts.querySelectorAll("button").forEach((b) => b.disabled = true);
        const correct = idx === q.correctIndex;
        if (correct) {
          btn.classList.add("correct"); right += 1;
          fb.innerHTML = `<span class="ok">Goed</span>`;
        } else {
          btn.classList.add("wrong");
          opts.querySelectorAll("button")[q.correctIndex]?.classList.add("correct");
          fb.innerHTML = `<span class="no">Niet juist</span>`;
        }
        // Bilingual explanation block
        const exp = q.explanation;
        if (exp) {
          if (typeof exp === "object" && (exp.nl || exp.en)) {
            const wrap = document.createElement("div");
            wrap.style.marginTop = ".7rem";
            const bi = document.createElement("div");
            bi.className = "bilingual";
            bi.style.margin = "0";
            bi.style.gap = ".5rem 1.4rem";
            bi.innerHTML = `
              <div class="nl"><span class="lang-tag">NL</span>${(exp.nl || "").replace(/</g,"&lt;")}</div>
              <div class="en"><span class="lang-tag">EN</span>${(exp.en || "").replace(/</g,"&lt;")}</div>
            `;
            wrap.appendChild(bi);
            fb.appendChild(wrap);
          } else {
            fb.innerHTML += ` — ${exp}`;
          }
        }
        stage.append(el("div", { class: "typed-actions" },
          el("button", { onClick: () => { i += 1; render(); } }, "Volgende"),
        ));
      }
    }
    render();
  }

  window.AIViews = {
    settings: renderSettings,
    essay: renderEssay,
    chat: renderChat,
    explainWord,
    moreExamples,
    explainMistake,
    generateAdaptiveQuiz,
    format,
  };
})();
