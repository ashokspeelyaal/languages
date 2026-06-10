/* Tap-translate enhancer (§B.9).
 *
 * Any element with class `tappable-fr` gets its plain-text content
 * word-wrapped, and clicks on a word pop a bubble showing:
 *   - gender + article (if a noun in Store.vocab)
 *   - English gloss
 *   - audio button (Camille)
 *   - "Pas dans le corpus" if the word isn't a vocab item
 *
 * Designed to layer on top of:
 *   - Chat assistant messages (Phase 7)
 *   - Lesson bodies (Phase 5)
 *   - Listening transcript (Phase 8)
 *   - Reading sections of DELF templates (Phase 9)
 *
 * Word-segmentation is rough: split on whitespace + strip trailing
 * punctuation. Reconstruction preserves the original spacing.
 */
(function () {
  const BUBBLE_ID = "tap-bubble";
  let activeBubble = null;

  function escapeHtml(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));
  }

  // Word lookup by lowercased + accent-folded lemma.
  // The Store.vocab cache holds {french, english, article, gender, pos, …}.
  // We index it lazily on first hit and cache.
  let _idx = null;
  function buildIndex() {
    _idx = new Map();
    const fold = (s) => (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[’']/g, "'").trim();
    for (const it of (window.Store?.state?.vocab || [])) {
      const k = fold(it.french);
      if (!_idx.has(k)) _idx.set(k, it);
      // Also index without the trailing apostrophe (l' → l)
      const k2 = k.replace(/'$/, "");
      if (k2 !== k && !_idx.has(k2)) _idx.set(k2, it);
    }
  }
  document.addEventListener("store-ready", () => { _idx = null; });

  function lookup(word) {
    if (!_idx) buildIndex();
    const fold = (s) => (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[’']/g, "'").trim();
    return _idx.get(fold(word));
  }

  // Decorate one element (idempotent — skips if already decorated).
  function decorate(el) {
    if (el.dataset.tapped === "1") return;
    el.dataset.tapped = "1";
    // Walk text nodes only; preserve existing HTML descendants.
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.nodeValue || !/\S/.test(node.nodeValue)) return NodeFilter.FILTER_REJECT;
        // Skip text inside code/pre/buttons.
        let p = node.parentElement;
        while (p && p !== el) {
          if (/^(CODE|PRE|BUTTON|INPUT|TEXTAREA|SELECT)$/.test(p.tagName)) return NodeFilter.FILTER_REJECT;
          p = p.parentElement;
        }
        return NodeFilter.FILTER_ACCEPT;
      },
    });
    const targets = [];
    let n;
    while ((n = walker.nextNode())) targets.push(n);
    for (const t of targets) {
      const frag = wrapText(t.nodeValue);
      t.parentNode.replaceChild(frag, t);
    }
    el.addEventListener("click", onWordClick);
  }

  function wrapText(text) {
    // Tokenize keeping punctuation + spaces separate so reconstruction is faithful.
    const frag = document.createDocumentFragment();
    const tokens = text.split(/(\s+|[.,;:!?…\(\)\[\]«»"]+)/);
    for (const tok of tokens) {
      if (!tok) continue;
      if (/^\s+$/.test(tok) || /^[.,;:!?…\(\)\[\]«»"]+$/.test(tok)) {
        frag.appendChild(document.createTextNode(tok));
        continue;
      }
      const span = document.createElement("span");
      span.className = "tap-word";
      span.textContent = tok;
      frag.appendChild(span);
    }
    return frag;
  }

  function onWordClick(ev) {
    const t = ev.target;
    if (!t.classList || !t.classList.contains("tap-word")) return;
    showBubble(t);
  }

  function showBubble(wordEl) {
    closeBubble();
    const raw = wordEl.textContent;
    const stripped = raw.replace(/['’]/g, "'");  // normalize apostrophes
    const item = lookup(stripped);

    const bubble = document.createElement("div");
    bubble.id = BUBBLE_ID;
    bubble.className = "tap-bubble";
    if (item) {
      const articleChip = item.article ? `<span class="article-chip gender-${item.gender || "x"}">${escapeHtml(item.article)}</span>` : "";
      const genderTag = item.gender && !item.article ? `<span class="gender-tag gender-${item.gender}">${escapeHtml(item.gender)}</span>` : "";
      bubble.innerHTML = `
        <div class="tap-row">
          ${articleChip}
          <strong>${escapeHtml(item.french)}</strong>
          ${genderTag}
          <span class="pos-tag">${escapeHtml(item.pos || "")}</span>
        </div>
        <div class="tap-gloss">${escapeHtml(item.english)}</div>
        <div class="tap-actions">
          <button class="voice-btn tap-voice" data-voice="nova" data-text="${escapeHtml(item.french)}">▶ Camille</button>
          <button class="voice-btn tap-voice" data-voice="echo" data-text="${escapeHtml(item.french)}">▶ Antoine</button>
        </div>
      `;
    } else {
      bubble.innerHTML = `
        <div class="tap-row"><strong>${escapeHtml(raw)}</strong></div>
        <div class="tap-gloss muted">Pas dans le corpus (mot fléchi, nom propre, ou non encore ajouté).</div>
        <div class="tap-actions">
          <button class="voice-btn tap-voice" data-voice="nova" data-text="${escapeHtml(raw)}">▶ Camille</button>
        </div>
      `;
    }

    document.body.appendChild(bubble);
    positionBubble(bubble, wordEl);
    activeBubble = bubble;

    bubble.querySelectorAll(".tap-voice").forEach((b) => {
      b.addEventListener("click", (e) => {
        e.stopPropagation();
        window.Speech?.speak(b.dataset.text, { voiceKey: b.dataset.voice });
      });
    });
    setTimeout(() => document.addEventListener("click", closeOnOutside), 0);
  }

  function positionBubble(bubble, wordEl) {
    const r = wordEl.getBoundingClientRect();
    const bw = 260;
    let left = window.scrollX + r.left + r.width / 2 - bw / 2;
    left = Math.max(8, Math.min(left, window.scrollX + window.innerWidth - bw - 8));
    const top = window.scrollY + r.bottom + 6;
    bubble.style.left = left + "px";
    bubble.style.top = top + "px";
    bubble.style.width = bw + "px";
  }

  function closeBubble() {
    document.removeEventListener("click", closeOnOutside);
    if (activeBubble) { activeBubble.remove(); activeBubble = null; }
  }
  function closeOnOutside(e) {
    if (activeBubble && !activeBubble.contains(e.target) && !e.target.classList?.contains("tap-word")) {
      closeBubble();
    }
  }

  // Auto-decorate on view changes. Views just need to give their target
  // element class="tappable-fr" and TapTranslate.decorate(el) will run
  // on the next idle tick. For lesson bodies, we call directly.
  function decorateAll(root) {
    const r = root || document;
    r.querySelectorAll(".tappable-fr").forEach(decorate);
  }

  // Observe DOM for newly inserted tappable elements.
  const observer = new MutationObserver((muts) => {
    for (const m of muts) {
      for (const n of m.addedNodes) {
        if (n.nodeType !== 1) continue;
        if (n.classList?.contains("tappable-fr")) decorate(n);
        n.querySelectorAll?.(".tappable-fr").forEach(decorate);
      }
    }
  });
  document.addEventListener("DOMContentLoaded", () => {
    observer.observe(document.body, { childList: true, subtree: true });
    decorateAll();
  });
  // Also decorate on hash changes (views.js re-renders into #view).
  window.addEventListener("hashchange", () => setTimeout(decorateAll, 50));

  window.TapTranslate = { decorate, decorateAll, closeBubble };
})();
