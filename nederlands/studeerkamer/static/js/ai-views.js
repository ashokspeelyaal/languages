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
      maxTokens: 700,
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
    aiSec.append(el("p", { class: "sub" },
      "Sleutel wordt in SQLite bewaard (per gebruiker). Als je hier niets invult, valt de server terug op de .env-waarde (OPENAI_API_KEY)."));

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

    // Full model catalogue. Prices per 1M tokens (input / output) in USD.
    // Tweak this object when OpenAI ships new tiers.
    // Only GPT-5 family is supported — they require max_completion_tokens and
    // reject custom temperature. Keeping the codepath uniform avoids edge cases.
    // ★ = my recommendation for this app.
    const MODEL_FAMILIES = [
      { label: "GPT-5.4 family (latest)", models: [
        { id: "gpt-5.4-nano",  in: 0.20,  out: 1.25,   note: "snelste, goedkoopste — voor licht werk" },
        { id: "gpt-5.4-mini",  in: 0.75,  out: 4.50,   note: "★ chat / lichte taken — sweet spot" },
        { id: "gpt-5.4",       in: 2.50,  out: 15.00,  note: "★ generatie + correctie — aanbevolen content-model" },
        { id: "gpt-5.4-pro",   in: 30.00, out: 180.00, note: "agentic / zwaar — overkill voor vocab" },
      ]},
      { label: "GPT-5.5 family", models: [
        { id: "gpt-5.5",       in: 5.00,  out: 30.00,  note: "topkwaliteit, 2× duurder dan 5.4 voor marginale winst" },
        { id: "gpt-5.5-pro",   in: 30.00, out: 180.00, note: "agentic flagship — extreem duur" },
      ]},
      { label: "GPT-5 family (vorige generatie)", models: [
        { id: "gpt-5-nano",    in: 0.05,  out: 0.40,   note: "goedkoopste solide keuze" },
        { id: "gpt-5-mini",    in: 0.25,  out: 2.00,   note: "ouder dan 5.4-mini, vergelijkbare prijs" },
        { id: "gpt-5",         in: 1.25,  out: 10.00,  note: "stabiel — 5.4 is nieuwer, scherper" },
        { id: "gpt-5.1",       in: 1.25,  out: 10.00,  note: "tweak van gpt-5" },
        { id: "gpt-5.2",       in: 1.75,  out: 14.00,  note: "voorlaatste 5-serie" },
        { id: "gpt-5-pro",     in: 15.00, out: 120.00, note: "agentic" },
        { id: "gpt-5.2-pro",   in: 21.00, out: 168.00, note: "agentic" },
      ]},
    ];
    const MODEL_LOOKUP = {};
    MODEL_FAMILIES.forEach((f) => f.models.forEach((m) => { MODEL_LOOKUP[m.id] = m; }));

    // Migrate any pre-existing setting that points to an unknown model.
    if (!MODEL_LOOKUP[s.aiModel]) {
      window.Store.state.settings.aiModel = "gpt-5.4-mini";
      window.Store.save();
      s.aiModel = "gpt-5.4-mini";
    }
    if (!s.aiContentModel || !MODEL_LOOKUP[s.aiContentModel]) {
      window.Store.state.settings.aiContentModel = "gpt-5.4";
      window.Store.save();
      s.aiContentModel = "gpt-5.4";
    }

    function fmtPrice(p) {
      return p < 1 ? `$${p.toFixed(2)}` : `$${p.toFixed(2)}`;
    }
    function modelLabel(m) {
      const note = m.note ? "  ·  " + m.note : "";
      return `${m.id}  ·  in ${fmtPrice(m.in)} / out ${fmtPrice(m.out)}${note}`;
    }

    // Build a model picker bound to a given settings key. The cost estimate
    // refreshes off the CHAT model only — that's the one that runs in most
    // interactive paths.
    function buildModelSelect(settingsKey, currentValue, onChangeExtra) {
      const sel = el("select", { class: "select-input", onChange: (e) => {
        window.Store.state.settings[settingsKey] = e.target.value;
        window.Store.save();
        if (onChangeExtra) onChangeExtra();
      } });
      MODEL_FAMILIES.forEach((fam) => {
        const og = document.createElement("optgroup");
        og.label = fam.label;
        fam.models.forEach((m) => {
          const opt = document.createElement("option");
          opt.value = m.id;
          opt.textContent = modelLabel(m);
          if (m.id === currentValue) opt.selected = true;
          og.appendChild(opt);
        });
        sel.appendChild(og);
      });
      return sel;
    }
    const modelSel        = buildModelSelect("aiModel",        s.aiModel,        updateCostEstimate);
    const contentModelSel = buildModelSelect("aiContentModel", s.aiContentModel, null);

    // Live cost estimate based on typical Dutch-coaching call shapes.
    // Numbers based on observed token counts in our prompts.
    const TYPICAL_CALLS = [
      { kind: "Uitleg / Meer voorbeelden",  inTokens: 280,  outTokens: 350 },
      { kind: "Mistake coach (Waarom?)",    inTokens: 200,  outTokens: 220 },
      { kind: "Chat turn (richting C1)",    inTokens: 700,  outTokens: 400 },
      { kind: "Essay grade (CNaVT-rubric)", inTokens: 900,  outTokens: 1100 },
      { kind: "Adaptieve quiz",             inTokens: 350,  outTokens: 900 },
    ];
    const costMount = el("div", { id: "cost-estimate", style: "margin-top:.7rem;background:var(--paper-2);border:1px solid var(--rule);border-radius:3px;padding:.7rem .9rem;font-size:.82rem" });

    function updateCostEstimate() {
      const id = modelSel.value;
      const m = MODEL_LOOKUP[id];
      if (!m) { costMount.innerHTML = ""; return; }
      let rows = TYPICAL_CALLS.map((c) => {
        const cost = (c.inTokens / 1e6) * m.in + (c.outTokens / 1e6) * m.out;
        const usdPer100 = cost * 100;
        return `<tr><td style="padding:.18rem .8rem .18rem 0;color:var(--ink-soft)">${c.kind}</td>` +
               `<td style="text-align:right;font-variant-numeric:tabular-nums;color:var(--ink)">$${cost.toFixed(5)}</td>` +
               `<td style="text-align:right;font-variant-numeric:tabular-nums;color:var(--ink-faint);padding-left:1rem">$${usdPer100.toFixed(3)}/100</td></tr>`;
      }).join("");
      costMount.innerHTML = `
        <p style="margin:0 0 .35rem;font-family:var(--mono);font-size:.66rem;letter-spacing:.14em;text-transform:uppercase;color:var(--ink-faint)">
          Schatting · estimate met <strong style="color:var(--rood)">${id}</strong>
        </p>
        <table style="width:100%;border-collapse:collapse;font-size:.82rem">
          <thead><tr style="color:var(--ink-faint);font-size:.7rem;text-transform:uppercase;letter-spacing:.1em">
            <th style="text-align:left;font-weight:normal;padding-bottom:.25rem">type call</th>
            <th style="text-align:right;font-weight:normal">per call</th>
            <th style="text-align:right;font-weight:normal;padding-left:1rem">per 100</th>
          </tr></thead>
          <tbody>${rows}</tbody>
        </table>
        <p style="margin:.55rem 0 0;font-size:.74rem;color:var(--ink-faint);font-style:italic">
          Token-schattingen op basis van typische promptgroottes. Werkelijke kosten variëren ± 20%.
        </p>
      `;
    }

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
        el("label", null, "Chat-model"),
        modelSel,
        costMount,
        el("p", { class: "hint" },
          "Voor lichte taken: chat, woord-uitleg via selectie, vertalen. Voor gewone gebruikers volstaat gpt-5.4-mini. " +
          "De kostenschatting hieronder gebruikt dit model."),
      ),
      el("div", { class: "field" },
        el("label", null, "Content-model"),
        contentModelSel,
        el("p", { class: "hint" },
          "Voor zware generatie: Luisteren-script schrijven, spelling- en grammaticacontrole, essay-correctie. " +
          "Hier wint kwaliteit van prijs — aanbevolen: gpt-5.4. Werkt onafhankelijk van het chat-model."),
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
      "  ·  zachte waarschuwing vanaf ", String(limit),
      "  ·  zie ", el("strong", null, "Schatting"), " hierboven voor kost per call met je gekozen model."
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

    // --- Audio models section (TTS + STT, for exam) ---
    const audioSec = el("div", { class: "settings-section" });
    audioSec.append(el("h3", null, "Audio · TTS & STT"));
    audioSec.append(el("p", { class: "sub" },
      "TTS = tekst-naar-spraak voor de Luister- en Examen-modules. STT = spraak-naar-tekst voor de Spreek-sectie van het examen."
    ));

    const STT_MODELS = [
      { id: "gpt-4o-mini-transcribe", in: 3.00, out: 5.00,  note: "★ aanbevolen — goedkoop, accuraat" },
      { id: "gpt-4o-transcribe",      in: 6.00, out: 10.00, note: "scherper, duurder" },
      { id: "whisper-1",              perMin: 0.006,        note: "klassiek, vast tarief per minuut" },
    ];
    function sttLabel(m) {
      if (m.perMin != null) return `${m.id}  ·  $${m.perMin.toFixed(3)}/min  ·  ${m.note}`;
      return `${m.id}  ·  in $${m.in.toFixed(2)} / out $${m.out.toFixed(2)} per 1M  ·  ${m.note}`;
    }

    /* --- TTS provider selector --- */
    const providerSel = el("select", { class: "select-input", onChange: (e) => {
      window.Store.state.settings.ttsProvider = e.target.value;
      window.Store.save();
      renderSettings(mount);   // re-render: show the right provider's fields
    } },
      el("option", { value: "openai", selected: (s.ttsProvider || "openai") === "openai" || undefined }, "OpenAI  ·  neutraal Standaardnederlands"),
      el("option", { value: "azure",  selected: s.ttsProvider === "azure"  || undefined }, "Azure Speech  ·  Vlaams (BE) accent  ★"),
    );

    audioSec.append(el("div", { class: "field" },
      el("label", null, "TTS-provider"),
      providerSel,
      el("p", { class: "hint" }, "Kies welk audio-platform de luister- en examenfragmenten inspreekt."),
    ));

    if ((s.ttsProvider || "openai") === "openai") {
      /* OpenAI TTS sub-section */
      const TTS_MODELS = [
        { id: "gpt-4o-mini-tts", in: 0.60, audio: 12.00, note: "★ aanbevolen — natuurlijk, instruction-aware" },
        { id: "tts-1",           charPrice: 15.00,       note: "klassiek, snel, lagere kwaliteit" },
        { id: "tts-1-hd",        charPrice: 30.00,       note: "hogere kwaliteit, dubbele prijs" },
      ];
      const TTS_VOICES = ["alloy", "echo", "fable", "onyx", "nova", "shimmer", "sage", "ash"];
      function ttsLabel(m) {
        if (m.charPrice != null) {
          const perMin = (m.charPrice / 1e6 * 1000);
          return `${m.id}  ·  $${m.charPrice.toFixed(2)}/1M chars  (~$${perMin.toFixed(3)}/min)  ·  ${m.note}`;
        }
        return `${m.id}  ·  in $${m.in.toFixed(2)} / audio out $${m.audio.toFixed(2)}/1M (~$0.015/min)  ·  ${m.note}`;
      }
      const ttsSel = el("select", { class: "select-input", onChange: (e) => {
        window.Store.state.settings.ttsModel = e.target.value; window.Store.save();
      } }, ...TTS_MODELS.map((m) => el("option", { value: m.id, selected: m.id === (s.ttsModel || "gpt-4o-mini-tts") || undefined }, ttsLabel(m))));
      const voiceSel = el("select", { class: "select-input", onChange: (e) => {
        window.Store.state.settings.ttsVoice = e.target.value; window.Store.save();
      } }, ...TTS_VOICES.map((v) => el("option", { value: v, selected: v === (s.ttsVoice || "shimmer") || undefined }, v)));

      audioSec.append(
        el("div", { class: "field" }, el("label", null, "OpenAI TTS-model"), ttsSel,
          el("p", { class: "hint" }, "Per 2,5 min ~$0,03. Stem klinkt neutraal, niet specifiek Vlaams.")),
        el("div", { class: "field" }, el("label", null, "Stem"), voiceSel,
          el("p", { class: "hint" }, "'shimmer' / 'nova' klinken het warmst.")),
      );
    } else {
      /* Azure Speech sub-section */
      const azKey = el("input", { type: "password", value: s.azureKey || "", placeholder: "Azure subscription key" });
      azKey.addEventListener("input", () => window.Store.patchSettings ? window.Store.patchSettings({ azureKey: azKey.value.trim() }) : (window.Store.state.settings.azureKey = azKey.value.trim(), window.Store.save()));
      // Main app's Store doesn't have patchSettings — use direct write
      azKey.addEventListener("input", () => {
        window.Store.state.settings.azureKey = azKey.value.trim();
        window.Store.save();
      });
      const azShow = el("button", { class: "subtle", onClick: () => { azKey.type = azKey.type === "password" ? "text" : "password"; } }, "Toon");

      const REGIONS = ["westeurope","northeurope","francecentral","swedencentral","germanywestcentral","uksouth","eastus","westus2"];
      const azRegion = el("select", { class: "select-input", onChange: (e) => {
        window.Store.state.settings.azureRegion = e.target.value; window.Store.save();
      } }, ...REGIONS.map((r) => el("option", { value: r, selected: r === (s.azureRegion || "westeurope") || undefined }, r)));

      const VOICES = [
        ["nl-BE-DenaNeural", "nl-BE-DenaNeural  ·  Vlaams (vrouw)  ★"],
        ["nl-BE-ArnaudNeural", "nl-BE-ArnaudNeural  ·  Vlaams (man)  ★"],
        ["nl-NL-FennaNeural", "nl-NL-FennaNeural  ·  Hollands (vrouw)"],
        ["nl-NL-MaartenNeural", "nl-NL-MaartenNeural  ·  Hollands (man)"],
        ["nl-NL-ColetteNeural", "nl-NL-ColetteNeural  ·  Hollands (vrouw)"],
      ];
      const azVoice = el("select", { class: "select-input", onChange: (e) => {
        window.Store.state.settings.azureVoice = e.target.value; window.Store.save();
      } }, ...VOICES.map(([v, lbl]) => el("option", { value: v, selected: v === (s.azureVoice || "nl-BE-DenaNeural") || undefined }, lbl)));

      const RATES = [["-20%","Heel rustig (-20%)"],["-10%","Rustig (-10%)"],["0%","Normaal (0%)"],["+10%","Snel (+10%)"]];
      const azRate = el("select", { class: "select-input", onChange: (e) => {
        window.Store.state.settings.azureRate = e.target.value; window.Store.save();
      } }, ...RATES.map(([v, lbl]) => el("option", { value: v, selected: v === (s.azureRate || "-10%") || undefined }, lbl)));

      const azTestResult = el("p", { class: "hint" });
      const azTestBtn = el("button", { class: "subtle", onClick: async () => {
        azTestBtn.disabled = true; azTestBtn.textContent = "testen…";
        try {
          await window.AI.testAzureKey();
          azTestResult.innerHTML = '<span style="color:var(--groen)">✓ Azure-verbinding OK</span>';
        } catch (err) {
          azTestResult.innerHTML = `<span class="ai-error">${err.message}</span>`;
        } finally {
          azTestBtn.disabled = false; azTestBtn.textContent = "Test verbinding";
        }
      } }, "Test verbinding");

      audioSec.append(
        el("div", { class: "field" },
          el("label", null, "Azure subscription key"),
          azKey,
          el("div", { style: "display:flex;gap:.4rem;margin-top:.3rem" }, azShow, azTestBtn),
          azTestResult,
          el("p", { class: "hint" },
            "Maak een Speech-resource aan in portal.azure.com (Free F0 tier). KEY 1 + Region komen uit 'Keys and Endpoint'. " +
            "Free tier = 500.000 tekens/maand gratis (≈10 uur audio, ≈260 oefeningen)."),
        ),
        el("div", { class: "field" },
          el("label", null, "Regio"),
          azRegion,
          el("p", { class: "hint" }, "West Europe geeft de beste latentie vanuit België."),
        ),
        el("div", { class: "field" },
          el("label", null, "Stem"),
          azVoice,
          el("p", { class: "hint" }, "Dena en Arnaud zijn echte Vlaams-Belgische stemmen — het verschil met OpenAI is hoorbaar groot."),
        ),
        el("div", { class: "field" },
          el("label", null, "Spreektempo"),
          azRate,
          el("p", { class: "hint" }, "Rustiger tempo is beter voor luisteroefeningen op niveau."),
        ),
      );
    }

    /* STT (separate, unchanged behaviour) */
    const sttSel = el("select", { class: "select-input", onChange: (e) => {
      window.Store.state.settings.sttModel = e.target.value; window.Store.save();
    } }, ...STT_MODELS.map((m) => el("option", { value: m.id, selected: m.id === (s.sttModel || "gpt-4o-mini-transcribe") || undefined }, sttLabel(m))));

    audioSec.append(el("div", { class: "field" },
      el("label", null, "STT-model (Spreek-sectie van examen)"),
      sttSel,
      el("p", { class: "hint" }, "Voor een 60-90s opname ≈ $0,003–$0,01. STT loopt altijd via OpenAI."),
    ));

    root.append(audioSec);

    // --- Audio storage section (IndexedDB) ---
    const blobSec = el("div", { class: "settings-section" });
    blobSec.append(el("h3", null, "Audio-opslag · audio storage"));
    blobSec.append(el("p", { class: "sub" },
      "TTS-fragmenten en jouw spreekopnames worden bewaard in IndexedDB (binair, geen localStorage-druk)."
    ));
    const blobStatus = el("p", { class: "hint", style: "font-family:var(--mono);font-size:.78rem" }, "berekenen…");
    blobSec.append(blobStatus);

    function refreshBlobStats() {
      if (!window.BlobStore) { blobStatus.textContent = "BlobStore niet beschikbaar."; return; }
      window.BlobStore.list().then((rows) => {
        const total = rows.reduce((a, r) => a + (r.size || 0), 0);
        const mb = (total / 1024 / 1024).toFixed(2);
        blobStatus.innerHTML =
          `<strong>${rows.length}</strong> audio-bestand${rows.length === 1 ? "" : "en"}  ·  ` +
          `<strong>${mb} MB</strong>  ·  IDB-quota in deze browser is meestal &gt;50 MB.`;
      }).catch(() => { blobStatus.textContent = "Kon IDB niet lezen."; });
    }
    refreshBlobStats();

    blobSec.append(el("div", { class: "field actions" },
      el("button", { class: "subtle", title: "Audio van verwijderde examens opruimen", onClick: async () => {
        // Active keys = audio referenced by an existing exam
        const exams = window.ExamStore ? window.ExamStore.list() : [];
        const active = [];
        exams.forEach((e) => {
          if (e.sections.luisteren.audioKey) active.push(e.sections.luisteren.audioKey);
          if (e.sections.spreken.recordingKey) active.push(e.sections.spreken.recordingKey);
        });
        const n = await window.BlobStore.purgeOrphans(active);
        alert(`${n} ouderloze audio-bestand${n === 1 ? "" : "en"} verwijderd.`);
        refreshBlobStats();
      } }, "Wezen opruimen · purge orphans"),
      el("button", { class: "subtle danger", onClick: async () => {
        if (!confirm("Alle opgeslagen audio (TTS én opnames) wissen?")) return;
        await window.BlobStore.clearAll();
        alert("Audio-opslag leeggemaakt.");
        refreshBlobStats();
      } }, "Alle audio wissen"),
    ));
    root.append(blobSec);

    // --- General app section ---
    const appSec = el("div", { class: "settings-section" });
    appSec.append(el("h3", null, "App · algemene voorkeuren"));
    appSec.append(el("div", { class: "field actions" },
      el("button", { class: "subtle", onClick: window.Store.exportJSON }, "Exporteer voortgang"),
      el("button", { class: "subtle danger", onClick: window.Store.reset }, "Reset alles"),
    ));
    root.append(appSec);

    mount.append(root);
    updateCostEstimate();
  }

  /* ============ Chat view (multi-thread) ============ */
  function renderChat(mount) {
    mount.innerHTML = "";
    const root = el("div", { class: "chat-page" });
    root.append(el("div", { class: "chat-head" },
      el("h2", { class: "view-title" }, "Chat ", el("span", { class: "accent" }, "· conversatiepartner")),
      el("p", { class: "view-sub" }, "Praat in het Nederlands. De AI verbetert je fouten zachtjes door correcte herhaling. Elk gesprek wordt automatisch een titel gegeven.")
    ));

    if (!window.AI.isConfigured()) {
      root.append(el("div", { class: "empty-ai", style: "grid-column:1/-1" },
        "AI nog niet geconfigureerd. ", el("a", { href: "#/settings" }, "Stel je sleutel in"), " om te chatten."));
      mount.append(root);
      return;
    }

    // Active chat — get-or-create the most recent one
    let activeChat = window.ChatStore.getOrCreateActive();

    // Sidebar
    const sidebar = el("aside", { class: "chat-sidebar" });
    root.append(sidebar);

    // Main pane
    const main = el("div", { class: "chat-main" });
    root.append(main);

    const scroll = el("div", { class: "chat-scroll" });
    const input = el("textarea", { placeholder: "Typ in het Nederlands… (Enter = verstuur, Shift+Enter = nieuwe regel)" });
    const sendBtn = el("button", { onClick: send }, "Verstuur");
    const clearBtn = el("button", { class: "subtle", title: "Berichten in dit gesprek wissen (gesprek blijft bestaan)", onClick: () => {
      if (!confirm("Berichten in dit gesprek wissen?")) return;
      activeChat = window.ChatStore.update(activeChat.id, { messages: [], autoTitled: false, title: "Nieuw gesprek" });
      renderHistory();
      renderSidebar();
    } }, "Wis");

    function escapeHTML(s) {
      return String(s || "").replace(/[&<>]/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;"}[c]));
    }

    // Highlight differences between user's original and the corrected version
    // by wrapping changed tokens in <strong>. Crude but effective.
    function highlightDiff(orig, fixed) {
      const oTokens = (orig || "").split(/(\s+)/);
      const fTokens = (fixed || "").split(/(\s+)/);
      const oSet = new Set(oTokens.map((t) => t.toLowerCase().replace(/[.,!?;:]/g, "")));
      return fTokens.map((t) => {
        if (/^\s+$/.test(t)) return t;
        const norm = t.toLowerCase().replace(/[.,!?;:]/g, "");
        if (!norm) return escapeHTML(t);
        return oSet.has(norm) ? escapeHTML(t) : `<strong>${escapeHTML(t)}</strong>`;
      }).join("");
    }

    function correctionCard(userMsg, correction) {
      if (!correction || correction.pending) {
        return el("div", { class: "chat-annot correction pending" },
          el("p", { class: "annot-head" }, "Correctie · correction"),
          "wachten op AI…");
      }
      if (correction.needed === false) {
        return el("div", { class: "chat-annot correction clean" },
          el("p", { class: "annot-head" }, "Correctie · correction"),
          el("span", { class: "ok-msg" }, "✓ Goed Nederlands"),
        );
      }
      const card = el("div", { class: "chat-annot correction" },
        el("p", { class: "annot-head" }, "Correctie · correction"),
      );
      if (correction.corrected) {
        const inner = el("span", { class: "corrected" });
        inner.innerHTML = highlightDiff(userMsg, correction.corrected);
        card.append(inner);
      }
      if (correction.notes && correction.notes.length) {
        const ul = el("ul", { class: "notes-rich" });
        correction.notes.forEach((n) => {
          // Backward-compat: notes may be plain strings (old format) or
          // {error, fix, rule, rubric} objects (new format).
          if (typeof n === "string") {
            ul.append(el("li", { class: "note-simple" }, n));
          } else {
            ul.append(richNote(n));
          }
        });
        card.append(ul);
      }
      return card;
    }

    function richNote(n) {
      const li = el("li", { class: "note-rich" });
      const head = el("div", { class: "note-head" });
      if (n.error || n.fix) {
        head.append(
          n.error ? el("span", { class: "note-error" }, n.error) : null,
          (n.error && n.fix) ? el("span", { class: "note-arrow" }, "→") : null,
          n.fix ? el("span", { class: "note-fix" }, n.fix) : null,
        );
      }
      if (n.rubric) {
        head.append(el("span", { class: "rubric-chip rubric-" + (n.rubric || "").toLowerCase() }, n.rubric));
      }
      li.append(head);
      if (n.rule) li.append(el("p", { class: "note-rule" }, n.rule));
      return li;
    }

    function vocabCard(vocab) {
      if (!vocab || !vocab.length) {
        return el("div", { class: "chat-annot vocab pending" },
          el("p", { class: "annot-head" }, "Woordenschat · vocab"),
          "—");
      }
      const card = el("div", { class: "chat-annot vocab" },
        el("p", { class: "annot-head" }, "Woordenschat · vocab"),
      );
      const ul = el("ul");
      vocab.forEach((v) => {
        const li = el("li", null,
          el("span", { class: "nl-word" }, v.dutch || v.nl || ""),
          el("span", { class: "en-gloss" }, v.english || v.en || ""),
          v.note ? el("span", { class: "vocab-note" }, v.note) : null,
        );
        ul.append(li);
      });
      card.append(ul);
      return card;
    }

    function renderHistory() {
      scroll.innerHTML = "";
      const history = activeChat.messages || [];
      if (history.length === 0) {
        scroll.append(el("div", { class: "empty-ai" },
          "Begin met iets als ", el("em", null, "\"Hoi, ik woon in Limburg en wil mijn Nederlands oefenen.\""),
          " Rechts verschijnt feedback op je Nederlands en de woordenschat uit de antwoorden."));
        return;
      }
      history.forEach((m, idx) => {
        if (m.role === "user") {
          const next = history[idx + 1];
          const correction = (next && next.role === "assistant" && next.correctionForUser)
            ? next.correctionForUser
            : (next && next.role === "assistant" ? null : { pending: true });
          scroll.append(el("div", { class: "chat-msg user" },
            el("div", { class: "who" }, "jij"),
            el("div", { class: "body" }, m.content),
            correctionCard(m.content, correction),
          ));
        } else {
          scroll.append(el("div", { class: "chat-msg ai" },
            el("div", { class: "who" }, "AI"),
            el("div", { class: "body", html: format(m.content) }),
            vocabCard(m.vocab),
          ));
        }
      });
      scroll.scrollTop = scroll.scrollHeight;
    }

    /* ============ Sidebar ============ */
    function renderSidebar() {
      sidebar.innerHTML = "";

      const actions = el("div", { class: "chat-side-actions" },
        el("button", { onClick: () => {
          activeChat = window.ChatStore.create();
          renderSidebar();
          renderHistory();
          setTimeout(() => input.focus(), 30);
        } }, "+ Nieuw gesprek"),
      );
      sidebar.append(actions);

      const all = window.ChatStore.list();
      const listMount = el("div", { class: "chat-side-list" });
      if (!all.length) {
        listMount.append(el("div", { class: "chat-empty-state" }, "Geen gesprekken nog."));
      }
      all.forEach((c) => {
        const isActive = c.id === activeChat.id;
        const titleSpan = el("span", { class: "ci-title" }, c.title || "Naamloos");
        const item = el("button", {
          class: "chat-item" + (isActive ? " active" : "") + (c.autoTitled ? "" : " untitled"),
          title: c.title,
          onClick: () => {
            if (c.id === activeChat.id) return;
            activeChat = window.ChatStore.get(c.id);
            window.ChatStore.setActiveId(c.id);
            renderSidebar();
            renderHistory();
          },
        },
          titleSpan,
          el("span", { class: "ci-meta" }, relTime(c.updatedAt) + " · " + (c.messages || []).length + " ber."),
          el("button", {
            class: "ci-del", title: "Gesprek verwijderen",
            onClick: (e) => {
              e.stopPropagation();
              if (!confirm(`"${c.title}" verwijderen?`)) return;
              window.ChatStore.remove(c.id);
              if (c.id === activeChat.id) {
                activeChat = window.ChatStore.getOrCreateActive();
              }
              renderSidebar();
              renderHistory();
            },
          }, "✕"),
        );
        // Double-click title to rename inline
        titleSpan.addEventListener("dblclick", (e) => {
          e.stopPropagation();
          startRename(item, c);
        });
        listMount.append(item);
      });
      sidebar.append(listMount);

      sidebar.append(el("div", { class: "chat-side-foot" },
        el("button", { class: "subtle", title: "Exporteer alle gesprekken als JSON", onClick: () => window.ChatStore.exportAll() }, "Export"),
        el("button", { class: "subtle", title: "Importeer een JSON-bestand", onClick: triggerImport }, "Import"),
      ));
    }

    function startRename(itemEl, chat) {
      const titleSpan = itemEl.querySelector(".ci-title");
      const original = chat.title;
      const inp = document.createElement("input");
      inp.type = "text";
      inp.value = original;
      inp.className = "chat-side-title-input";
      titleSpan.replaceWith(inp);
      inp.focus(); inp.select();
      function commit() {
        const v = inp.value.trim() || original;
        window.ChatStore.update(chat.id, { title: v, autoTitled: true });
        if (activeChat.id === chat.id) activeChat.title = v;
        renderSidebar();
      }
      function cancel() { renderSidebar(); }
      inp.addEventListener("keydown", (e) => {
        if (e.key === "Enter") { e.preventDefault(); commit(); }
        else if (e.key === "Escape") { e.preventDefault(); cancel(); }
      });
      inp.addEventListener("blur", commit);
    }

    function triggerImport() {
      const fi = document.createElement("input");
      fi.type = "file"; fi.accept = "application/json,.json";
      fi.onchange = async () => {
        const file = fi.files && fi.files[0];
        if (!file) return;
        try {
          const txt = await file.text();
          const json = JSON.parse(txt);
          const mode = confirm("OK = TOEVOEGEN aan bestaande gesprekken. Annuleer = VERVANGEN.") ? "merge" : "replace";
          const n = window.ChatStore.importChats(json, mode);
          alert(`${n} gesprek${n === 1 ? "" : "ken"} geïmporteerd.`);
          activeChat = window.ChatStore.getOrCreateActive();
          renderSidebar();
          renderHistory();
        } catch (err) {
          alert("Import mislukt: " + err.message);
        }
      };
      fi.click();
    }

    function relTime(iso) {
      if (!iso) return "—";
      const d = new Date(iso);
      const diff = (Date.now() - d.getTime()) / 1000;
      if (diff < 60) return "nu";
      if (diff < 3600) return Math.floor(diff / 60) + "m";
      if (diff < 86400) return Math.floor(diff / 3600) + "u";
      if (diff < 86400 * 7) return Math.floor(diff / 86400) + "d";
      return d.toISOString().slice(5, 10);
    }

    /* ============ Auto-title generation ============ */
    async function autoTitleIfNeeded() {
      if (activeChat.autoTitled) return;
      const msgs = activeChat.messages || [];
      // Only after we have at least one user + one AI turn
      const hasUser = msgs.some((m) => m.role === "user");
      const hasAI = msgs.some((m) => m.role === "assistant");
      if (!hasUser || !hasAI) return;
      try {
        const first = msgs.find((m) => m.role === "user");
        const firstAI = msgs.find((m) => m.role === "assistant");
        const r = await window.AI.complete({
          kind: "chat-title",
          model: "gpt-5-nano", // titles are tiny, use cheapest
          system: "Je geeft een korte, beschrijvende titel van 3 tot 6 woorden in het Nederlands voor een conversatie. Geen aanhalingstekens, geen punt, geen emoji — alleen de titel zelf.",
          user: `Gebruiker: ${first.content}\nAI: ${(firstAI.content || "").slice(0, 200)}`,
          maxTokens: 40,
          reasoning: "minimal",
        });
        const title = (r.text || "").trim().replace(/^["'`]|["'`.]$/g, "").slice(0, 80);
        if (title) {
          activeChat = window.ChatStore.setTitle(activeChat.id, title);
          renderSidebar();
        }
      } catch (e) {
        // Auto-title is best-effort; ignore errors
        console.warn("Auto-title failed:", e);
      }
    }

    async function send() {
      const txt = input.value.trim();
      if (!txt) return;
      activeChat = window.ChatStore.appendMessage(activeChat.id, { role: "user", content: txt });
      input.value = "";
      renderHistory();
      renderSidebar();
      sendBtn.disabled = true;

      // Add placeholder AI message row
      const aiMsg = el("div", { class: "chat-msg ai" },
        el("div", { class: "who" }, "AI"),
        el("div", { class: "body" }, el("span", { class: "ai-loading" }, "denkt na…")),
        el("div", { class: "chat-annot vocab pending" },
          el("p", { class: "annot-head" }, "Woordenschat · vocab"),
          "—"),
      );
      scroll.append(aiMsg);
      scroll.scrollTop = scroll.scrollHeight;

      const system = `Je bent een Nederlandse conversatiepartner én een CNaVT-examinator (niveau C1 Educatief Professioneel) in Vlaams-België. Spreek natuurlijk Nederlands op B2-C1 niveau. Houd je gespreksantwoord tot 3-4 zinnen.

Antwoord ALTIJD met geldig JSON — geen markdown, geen extra tekst — in deze structuur:
{
  "reply": "<je natuurlijke gespreksantwoord in het Nederlands. NOOIT beginnen met 'AI:' of een rolprefix>",
  "correctionForUser": {
    "needed": true|false,
    "corrected": "<de volledig herschreven correcte versie van de zin van de gebruiker>",
    "notes": [
      {
        "error": "<exact citaat van de foute frase uit de oorspronkelijke zin>",
        "fix": "<de juiste vervanging>",
        "rule": "<1-2 zinnen Nederlandse uitleg van de onderliggende regel of het principe — waarom dit fout is op CNaVT C1-niveau>",
        "rubric": "<één van: Grammatica | Lexicaal | Register | Coherentie | Spelling>"
      }
    ]
  },
  "vocab": [
    {"dutch": "<woord/uitdrukking uit JOUW reply>", "english": "<korte Engelse vertaling>", "note": "<optionele korte gebruiksnoot>"}
  ]
}

KEY RULE — GEEN OVERELABORATIE:
Je corrigeert ALLEEN wat fout is. Vervang een correcte eenvoudige zin NOOIT door een complexere variant. "Mooier" of "academischer" is geen reden om iets te wijzigen. Behoud het complexiteitsniveau, register en stijl van de gebruiker. Als de gebruiker B1-stijl schrijft maar grammaticaal correct, blijft dat zo — alleen reële fouten worden gecorrigeerd.

CORRECTIEREGELS (strikt — een CNaVT-examinator zou ze allemaal signaleren):
Markeer 'needed' = true bij ELKE van deze fouten in het bericht van de gebruiker:
  • Subject-werkwoord-congruentie ("C-mine en X ZIJN", niet "is")
  • Woordvolgorde, vooral in bijzinnen met die/dat/wat/waar/omdat/hoewel (werkwoord naar het einde)
  • Ontbrekende of foute voorzetsel-collocaties ("leuk vinden AAN [plaats]", "denken AAN", "bang VOOR")
  • Missing 'het' in superlatieven ("het leukst", "het best")
  • Foute of ontbrekende lidwoorden (de/het/een)
  • Hoofdlettergebruik: eigennamen (Genk, België) en begin van zinnen
  • Ontbrekende reflexieve voornaamwoorden (me/je/zich): "ik voel ME moe"
  • Foute werkwoordtijden, vormen of stam (sterke werkwoorden)
  • Foute woordkeuze (false friends, woord bestaat niet in NL, verkeerd register voor de context)
  • Onnatuurlijke woordvolgorde of vreemde collocaties

Markeer 'needed' = false ALLEEN als de zin grammaticaal én lexicaal én register-gepast is. 'corrected' bevat ALTIJD de correcte versie (bij needed=false: dezelfde zin).

CNaVT-RUBRIC-CRITERIA voor 'rubric':
  • "Grammatica"  — congruentie, woordvolgorde, werkwoordtijden, lidwoorden, reflexieven, naamval
  • "Lexicaal"    — verkeerd woord, false friend, woord bestaat niet, foute collocatie
  • "Register"    — informeel/formeel niet passend bij context
  • "Coherentie"  — verkeerd connector, onlogische opbouw
  • "Spelling"    — tikfout, hoofdletters, diakritische tekens

VOORBEELD 1 — meerdere fouten:
Gebruikersbericht: "c-mine en multicultuur is wat vind ik leukst in genk"
correctionForUser = {
  "needed": true,
  "corrected": "C-mine en de multiculturele sfeer zijn wat ik het leukst vind aan Genk.",
  "notes": [
    { "error": "is", "fix": "zijn", "rule": "Bij een meervoudig onderwerp staat het werkwoord in het meervoud.", "rubric": "Grammatica" },
    { "error": "wat vind ik leukst", "fix": "wat ik het leukst vind", "rule": "In een bijzin met 'wat' staat de persoonsvorm aan het EINDE. De overtreffende trap vereist 'het'.", "rubric": "Grammatica" },
    { "error": "in genk", "fix": "aan Genk", "rule": "Vaste collocatie 'leuk vinden AAN [plaats]'. Plaatsnamen krijgen altijd een hoofdletter.", "rubric": "Lexicaal" }
  ]
}

VOORBEELD 2 — ALLEEN hoofdletter, verder grammaticaal correct:
Gebruikersbericht: "ik woon in genk"
correctionForUser = {
  "needed": true,
  "corrected": "Ik woon in Genk.",
  "notes": [
    { "error": "ik", "fix": "Ik", "rule": "Een zin begint altijd met een hoofdletter.", "rubric": "Spelling" },
    { "error": "genk", "fix": "Genk", "rule": "Eigennamen — plaatsnamen, landen, voornamen — krijgen altijd een hoofdletter. CNaVT-correctoren rekenen dit aan.", "rubric": "Spelling" }
  ]
}

VOORBEELD 3 — werkelijk correcte zin:
Gebruikersbericht: "Ik woon in Genk."
correctionForUser = { "needed": false, "corrected": "Ik woon in Genk.", "notes": [] }

LEER hieruit: missing hoofdletter op een eigennaam = ALTIJD needed=true. Geen uitzonderingen.

VOCAB-REGELS:
- 'vocab' bevat 2 tot 4 nuttige Nederlandse woorden/uitdrukkingen uit JOUW eigen reply
- Kies C1-niveau items: collocaties, idiomen, register-markeerders, abstracte concepten — niet basale woorden zoals 'het', 'is', 'maar'`;

      // Build proper OpenAI messages array. For richer turns we serialise the
      // assistant content (which was JSON internally) as just the visible reply text.
      const recent = (activeChat.messages || []).slice(-16);
      const messages = [{ role: "system", content: system }];
      recent.forEach((m) => {
        messages.push({
          role: m.role === "user" ? "user" : "assistant",
          content: m.content,
        });
      });
      try {
        const r = await window.AI.complete({
          kind: "chat",
          messages,
          maxTokens: 1500,
          reasoning: "minimal",
          json: true,
          noCache: true,
        });
        let parsed;
        try { parsed = JSON.parse(r.text); }
        catch (e) {
          parsed = { reply: r.text, correctionForUser: { needed: false }, vocab: [] };
        }
        activeChat = window.ChatStore.appendMessage(activeChat.id, {
          role: "assistant",
          content: parsed.reply || r.text,
          correctionForUser: parsed.correctionForUser || { needed: false },
          vocab: parsed.vocab || [],
        });
        renderHistory();
        renderSidebar();
        // Fire-and-forget auto-title (won't block UI)
        autoTitleIfNeeded();
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

    const inputRow = el("div", { class: "chat-input-row" }, input,
      el("div", { style: "display:flex;flex-direction:column;gap:.4rem" }, sendBtn, clearBtn));

    main.append(scroll, inputRow);
    mount.append(root);
    renderSidebar();
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
    chat: renderChat,
    explainWord,
    moreExamples,
    explainMistake,
    generateAdaptiveQuiz,
    format,
  };
})();
