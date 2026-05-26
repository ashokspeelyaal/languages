/* Global selection toolbar.
 * Highlight any text outside inputs → a floating pill bar appears with
 * "Uitleg" and "Vertaal" buttons. Results show in a fixed bottom-right panel. */
(function () {
  let bar = null;
  let chip = null;          // iOS-only floating ✦ button anchored near the selection
  let panel = null;
  let lastText = "";

  // iOS native callout (Copy / Translate / Look Up) wants to own touch-end
  // gestures on selected text, so on iOS we don't auto-show our bar on
  // mouseup. Instead we show a tiny floating "✦ AI" chip near the selection;
  // tapping it opens the full toolbar. Native callout still works in parallel.
  const IS_IOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
                 (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

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
    return climbContains(node, (n) => n.classList && (
      n.classList.contains("sel-bar") || n.classList.contains("sel-panel") || n.classList.contains("sel-chip")
    ));
  }

  function hideBar() { if (bar) { bar.remove(); bar = null; } }
  function hideChip() { if (chip) { chip.remove(); chip = null; } }
  function hidePanel() { if (panel) { panel.remove(); panel = null; } }
  function hide() { hideBar(); hideChip(); hidePanel(); }

  // iOS chip: a small floating "✦" pill positioned just below the selection
  // (so iOS's own callout, which appears above, isn't covered). Tapping
  // opens the full sel-bar with Uitleg / Vertaal.
  function showChip(rect, text) {
    hideChip();
    chip = document.createElement("button");
    chip.className = "sel-chip";
    chip.setAttribute("aria-label", "AI-uitleg / vertaal");
    chip.innerHTML = '<span class="sel-chip-ico">✦</span><span class="sel-chip-lbl">AI</span>';

    document.body.appendChild(chip);
    const cr = chip.getBoundingClientRect();
    let top = rect.bottom + window.scrollY + 8;
    let left = rect.left + window.scrollX + (rect.width - cr.width) / 2;
    if (left < 8) left = 8;
    if (left + cr.width > window.innerWidth - 8) left = window.innerWidth - cr.width - 8;
    if (top + cr.height > window.innerHeight + window.scrollY - 8) {
      // No room below — place above the selection.
      top = rect.top + window.scrollY - cr.height - 8;
    }
    chip.style.top = top + "px";
    chip.style.left = left + "px";

    chip.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const r = getSelectionRect();
      hideChip();
      if (r && text) show(r, text);
    });
  }

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
        if (e && bar && bar.contains(e.target)) return;
        if (e && panel && panel.contains(e.target)) return;
        if (e && chip && chip.contains(e.target)) return;
        hideBar();
        hideChip();
        if (text !== lastText) lastText = text;
        return;
      }
      if (text === lastText && (bar || chip)) return;
      lastText = text;
      if (text.length > 400) return;
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;
      const node = sel.anchorNode;
      if (isInInput(node)) return;
      if (isInOurUI(node)) return;
      const rect = getSelectionRect();
      if (!rect) return;
      // Desktop: show the full bar immediately. iOS: show the small chip
      // so the native callout (Copy / Translate / Look Up) stays usable.
      if (IS_IOS) showChip(rect, text);
      else show(rect, text);
    }, 10);
  }

  if (!IS_IOS) {
    // Desktop: mouseup is reliable.
    document.addEventListener("mouseup", handleSelection);
    document.addEventListener("keyup", (e) => {
      if (e.shiftKey || e.key === "Shift") handleSelection(e);
    });
  } else {
    // iOS: mouseup is unreliable (touch events don't synthesise it
    // consistently around the native callout). Use selectionchange,
    // debounced so we don't flicker while the user drags the handles.
    let pending = null;
    document.addEventListener("selectionchange", () => {
      clearTimeout(pending);
      pending = setTimeout(() => handleSelection(null), 220);
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") hide();
  });

  // Hide on scroll (anchors would be wrong)
  window.addEventListener("scroll", () => {
    hideBar();
    hideChip();
    // Don't auto-hide panel; user might want to read it while scrolling
  }, true);

  window.SelectionBar = { hide };
})();
