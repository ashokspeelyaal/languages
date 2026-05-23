/* Global selection toolbar.
 * Highlight any text outside inputs → a floating pill bar appears with
 * "Uitleg" and "Vertaal" buttons. Results show in a fixed bottom-right panel. */
(function () {
  let bar = null;
  let panel = null;
  let lastText = "";

  // Rough Dutch vs English detection by counting function words.
  const NL_WORDS = new Set("de het een en van niet ook dat dit ik je jij u hij zij wij jullie zich met voor op aan bij om door over uit in is zijn was waren heeft hebben wat wie waar wanneer hoe waarom omdat maar want toch wel zonder mij jou hem haar ons hun zo nu dan daar hier".split(" "));
  const EN_WORDS = new Set("the a an and of to is are was were have has had do does did this that these those for from with about what where when why how because but yet without my your his her our their which whose into upon onto out".split(" "));

  function detectLang(text) {
    const tokens = text.toLowerCase().split(/[^a-záéíóúëïöüäêîôû']+/i).filter(Boolean);
    let nl = 0, en = 0;
    for (const t of tokens) {
      if (NL_WORDS.has(t)) nl++;
      if (EN_WORDS.has(t)) en++;
    }
    if (en > nl) return "en";
    if (nl > en) return "nl";
    // Tie-breaker: presence of Dutch-only diacritics or "ij" / "aa" / "oo" / "uu" patterns
    if (/[ëïöü]|ij|aa|oo|uu|eu/i.test(text)) return "nl";
    return "nl"; // default to Dutch
  }

  function getSelectionRect() {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return null;
    const range = sel.getRangeAt(0);
    if (range.collapsed) return null;
    const rect = range.getBoundingClientRect();
    if ((rect.width === 0 && rect.height === 0) || isNaN(rect.top)) return null;
    return rect;
  }

  function getSelectedText() {
    const s = window.getSelection();
    return s ? s.toString().trim() : "";
  }

  function climbContains(node, predicate) {
    while (node) {
      if (node.nodeType === 1 && predicate(node)) return true;
      node = node.parentNode;
    }
    return false;
  }
  function isInInput(node) {
    return climbContains(node, (n) => {
      const tag = n.tagName;
      return tag === "INPUT" || tag === "TEXTAREA" || n.isContentEditable;
    });
  }
  function isInOurUI(node) {
    return climbContains(node, (n) => n.classList && (n.classList.contains("sel-bar") || n.classList.contains("sel-panel")));
  }

  function hideBar() { if (bar) { bar.remove(); bar = null; } }
  function hidePanel() { if (panel) { panel.remove(); panel = null; } }
  function hide() { hideBar(); hidePanel(); }

  function escapeHTML(s) {
    return String(s || "").replace(/[&<>]/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;"}[c]));
  }

  function show(rect, text) {
    hideBar();
    const lang = detectLang(text);
    const transTo = lang === "nl" ? "EN" : "NL";

    bar = document.createElement("div");
    bar.className = "sel-bar";
    bar.innerHTML = `
      <button class="sel-btn" data-action="explain" title="AI-uitleg in NL + EN">
        <span class="sel-ico">✦</span> Uitleg
        <span class="sel-sub">explain</span>
      </button>
      <span class="sel-divider"></span>
      <button class="sel-btn" data-action="translate" title="Vertaal naar ${transTo}">
        <span class="sel-ico">✦</span> Vertaal
        <span class="sel-sub">→ ${transTo}</span>
      </button>
    `;
    document.body.appendChild(bar);

    // Position the bar above (or below) the selection
    const barRect = bar.getBoundingClientRect();
    let top = rect.top + window.scrollY - barRect.height - 8;
    let left = rect.left + window.scrollX + (rect.width - barRect.width) / 2;
    if (top < window.scrollY + 8) top = rect.bottom + window.scrollY + 8;
    if (left < 8) left = 8;
    if (left + barRect.width > window.innerWidth - 8) left = window.innerWidth - barRect.width - 8;
    bar.style.top = top + "px";
    bar.style.left = left + "px";

    bar.querySelector('[data-action="explain"]').addEventListener("click", (e) => {
      e.preventDefault(); e.stopPropagation();
      runAction("explain", text, lang);
    });
    bar.querySelector('[data-action="translate"]').addEventListener("click", (e) => {
      e.preventDefault(); e.stopPropagation();
      runAction("translate", text, lang);
    });
  }

  async function runAction(action, text, lang) {
    if (!window.AI || !window.AI.isConfigured()) {
      alert("Stel je OpenAI API-sleutel in via Instellingen.");
      return;
    }
    hideBar();
    hidePanel();

    panel = document.createElement("div");
    panel.className = "sel-panel";
    const headLabel = action === "explain" ? "Uitleg · explain" : `Vertaal · translate → ${lang === "nl" ? "EN" : "NL"}`;
    panel.innerHTML = `
      <button class="sel-panel-close" title="Sluiten (Esc)">✕</button>
      <p class="sel-panel-head"><span class="badge">AI</span> ${headLabel}</p>
      <p class="sel-panel-source">"${escapeHTML(text.length > 200 ? text.slice(0, 200) + "…" : text)}"</p>
      <div class="sel-panel-body"><span class="ai-loading">denkt na…</span></div>
    `;
    document.body.appendChild(panel);
    panel.querySelector(".sel-panel-close").addEventListener("click", hidePanel);

    try {
      if (action === "explain") {
        const sys = "Je bent een Nederlandse taalcoach voor Vlaams-België (CNaVT C1). Leg de geselecteerde tekst uit in 2-3 korte zinnen: betekenis, nuance, gebruik, register. Antwoord in geldige JSON: {\"nl\": \"...uitleg in helder Nederlands...\", \"en\": \"...same explanation in clear English...\"}. ALLEEN JSON terug.";
        const r = await window.AI.complete({
          kind: "sel-explain",
          system: sys,
          user: text,
          maxTokens: 700,
          json: true,
          reasoning: "minimal",
        });
        const obj = JSON.parse(r.text);
        panel.querySelector(".sel-panel-body").innerHTML = `
          <div class="bilingual" style="margin:0;gap:.7rem 1.4rem">
            <div class="nl"><span class="lang-tag">NL</span>${escapeHTML(obj.nl || "")}</div>
            <div class="en"><span class="lang-tag">EN</span>${escapeHTML(obj.en || "")}</div>
          </div>
          ${r.cached ? '<p class="sel-cached">uit cache</p>' : ''}
        `;
      } else {
        const target = lang === "nl" ? "English" : "Dutch (Belgian / Standard Dutch register)";
        const sys = `You are a precise translator. Translate the user's text into ${target}. Preserve register, tone and meaning. Output ONLY the translation, no commentary, no quotes.`;
        const r = await window.AI.complete({
          kind: "sel-translate",
          system: sys,
          user: text,
          maxTokens: 500,
          reasoning: "minimal",
        });
        panel.querySelector(".sel-panel-body").innerHTML = `
          <p class="sel-translation">${escapeHTML(r.text)}</p>
          ${r.cached ? '<p class="sel-cached">uit cache</p>' : ''}
        `;
      }
    } catch (err) {
      panel.querySelector(".sel-panel-body").innerHTML = `<div class="ai-error">${escapeHTML(err.message)}</div>`;
    }
  }

  function handleSelection(e) {
    // Defer so the browser finalises the selection
    setTimeout(() => {
      const text = getSelectedText();
      if (!text || text.length < 2) {
        // Empty selection: hide bar but keep panel (user might be reading it)
        if (e && bar && bar.contains(e.target)) return;
        if (e && panel && panel.contains(e.target)) return;
        hideBar();
        if (text !== lastText) lastText = text;
        return;
      }
      if (text === lastText && bar) return; // already shown
      lastText = text;
      if (text.length > 400) return; // too long for inline AI
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;
      const node = sel.anchorNode;
      if (isInInput(node)) return;
      if (isInOurUI(node)) return;
      const rect = getSelectionRect();
      if (rect) show(rect, text);
    }, 10);
  }

  document.addEventListener("mouseup", handleSelection);
  document.addEventListener("keyup", (e) => {
    // For shift+arrow selections via keyboard
    if (e.shiftKey || e.key === "Shift") handleSelection(e);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") hide();
  });

  // Hide on scroll (the bar would be in the wrong place)
  let scrollTimer;
  window.addEventListener("scroll", () => {
    hideBar();
    // Don't auto-hide panel; user might want to read it while scrolling
  }, true);

  window.SelectionBar = { hide };
})();
