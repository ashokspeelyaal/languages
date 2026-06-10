/* Grammaire view (#/grammaire).
 *
 * Two-pane layout: topic tree on the left (filtered to ≤ activeLevel by
 * default; toggle reveals locked higher-level topics), lesson body on
 * the right with embedded drill runner.
 *
 * Lessons above the active level are visually locked but still
 * clickable — they render with a "débloque X d'abord" banner and the
 * drill submit button is disabled.
 *
 * The lesson body is a tiny markdown subset (## headers, **bold**,
 * *italic*, `code`, --- rules, simple bullet/table). We render
 * client-side so the API stays a static JSON file.
 */
(function () {
  function escapeHtml(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));
  }

  let dataCache = null;
  let selectedTopicId = null;
  let showAllLevels = false;

  async function ensureData() {
    if (dataCache) return dataCache;
    dataCache = await window.API.get("/api/grammar/topics");
    return dataCache;
  }

  document.addEventListener("level-changed", () => {
    // Keep the cached tree; selection may now be out-of-scope.
    if (dataCache) {
      const t = dataCache.topics.find((t) => t.id === selectedTopicId);
      if (!t) selectedTopicId = null;
    }
  });

  // ----------------------------------------------------------- markdown
  function renderMarkdown(src) {
    if (!src) return "";
    // Tables first (simple |a|b|c| with --- separator)
    src = src.replace(/((?:^\|.*\|\s*$\n)+)/gm, (block) => {
      const lines = block.trim().split("\n");
      // Identify separator row (---)
      const sepIdx = lines.findIndex((l) => /^\|[\s\-:]+\|/.test(l));
      if (sepIdx < 0) return block;
      const head = lines[0].split("|").slice(1, -1).map((c) => c.trim());
      const body = lines.slice(sepIdx + 1).map((row) => row.split("|").slice(1, -1).map((c) => c.trim()));
      return `<table class="md-table"><thead><tr>${head.map((h) => `<th>${escapeHtml(h)}</th>`).join("")}</tr></thead>`
           + `<tbody>${body.map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
    });

    const lines = src.split("\n");
    const out = [];
    let inUl = false;
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      const ulMatch = line.match(/^- (.+)$/);
      const h2 = line.match(/^## (.+)$/);
      const h3 = line.match(/^### (.+)$/);
      const hr = /^---+$/.test(line.trim());
      if (ulMatch) {
        if (!inUl) { out.push("<ul>"); inUl = true; }
        out.push(`<li>${inline(ulMatch[1])}</li>`);
        continue;
      } else if (inUl) {
        out.push("</ul>"); inUl = false;
      }
      if (h2) { out.push(`<h3 class="md-h2">${inline(h2[1])}</h3>`); continue; }
      if (h3) { out.push(`<h4 class="md-h3">${inline(h3[1])}</h4>`); continue; }
      if (hr) { out.push("<hr>"); continue; }
      if (line.trim().startsWith("<")) { out.push(line); continue; }   // already HTML (tables)
      if (line.trim() === "") { out.push(""); continue; }
      out.push(`<p>${inline(line)}</p>`);
    }
    if (inUl) out.push("</ul>");
    return out.join("\n");
  }

  function inline(s) {
    return escapeHtml(s)
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/`([^`]+)`/g, "<code>$1</code>");
  }

  // ----------------------------------------------------------- render
  async function render() {
    const view = document.getElementById("view");
    view.innerHTML = `<div class="empty" style="padding:48px;text-align:center;color:#5a627a">Chargement…</div>`;
    let data;
    try { data = await ensureData(); }
    catch (e) {
      view.innerHTML = `<div class="empty" style="padding:48px;color:#b3261e">Erreur : ${escapeHtml(e.message)}</div>`;
      return;
    }
    const s = window.Store.state;
    const lvlIdx = window.Store.LEVELS.indexOf(s.activeLevel);
    if (!selectedTopicId) {
      // Default: first topic at the user's active level.
      const t = data.topics.find((t) => t.level === s.activeLevel) || data.topics[0];
      selectedTopicId = t.id;
    }

    view.innerHTML = `
      <section class="grammaire">
        <aside class="grammaire-tree" id="grammaire-tree"></aside>
        <article class="grammaire-pane" id="grammaire-pane"></article>
      </section>
    `;

    renderTree(data);
    renderPane(data);
  }

  function renderTree(data) {
    const s = window.Store.state;
    const lvlIdx = window.Store.LEVELS.indexOf(s.activeLevel);
    const allowed = window.Store.LEVELS.slice(0, lvlIdx + 1);
    const tree = document.getElementById("grammaire-tree");

    const groups = {};
    for (const t of data.topics) {
      (groups[t.level] = groups[t.level] || []).push(t);
    }

    tree.innerHTML = `
      <div class="tree-head">
        <strong>Curriculum</strong>
        <label class="tree-toggle">
          <input type="checkbox" id="show-all-lvls" ${showAllLevels ? "checked" : ""}>
          <span>Tous niveaux</span>
        </label>
      </div>
      ${window.Store.LEVELS.map((lvl) => {
        const m = window.Store.LEVEL_META[lvl];
        const ts = groups[lvl] || [];
        const locked = !allowed.includes(lvl);
        if (locked && !showAllLevels) return "";
        return `
          <div class="tree-group ${locked ? "tree-locked" : ""}">
            <h4 style="color:${m.color}">${m.label} · ${m.title} ${locked ? "🔒" : ""}</h4>
            <ul>
              ${ts.map((t) => `
                <li>
                  <a href="#" class="tree-topic ${t.id === selectedTopicId ? "tree-active" : ""}"
                     data-topic="${escapeHtml(t.id)}">
                    ${t.progress.mastered ? `<span class="tree-check">✓</span>` : ""}
                    ${escapeHtml(t.title)}
                    ${t.progress.seen > 0 ? `<small>${t.progress.correct}/${t.progress.seen}</small>` : ""}
                  </a>
                </li>
              `).join("")}
            </ul>
          </div>
        `;
      }).join("")}
    `;
    document.getElementById("show-all-lvls").addEventListener("change", (e) => {
      showAllLevels = e.target.checked;
      renderTree(data);
    });
    tree.querySelectorAll(".tree-topic").forEach((a) => {
      a.addEventListener("click", (ev) => {
        ev.preventDefault();
        selectedTopicId = a.dataset.topic;
        renderTree(data);
        renderPane(data);
      });
    });
  }

  function renderPane(data) {
    const s = window.Store.state;
    const lvlIdx = window.Store.LEVELS.indexOf(s.activeLevel);
    const allowed = window.Store.LEVELS.slice(0, lvlIdx + 1);
    const pane = document.getElementById("grammaire-pane");
    const topic = data.topics.find((t) => t.id === selectedTopicId);
    if (!topic) {
      pane.innerHTML = `<p class="muted">Sélectionnez un sujet à gauche.</p>`;
      return;
    }
    const locked = !allowed.includes(topic.level);
    const meta = window.Store.LEVEL_META[topic.level];

    pane.innerHTML = `
      <header class="lesson-head">
        <div>
          <span class="level-tag" style="background:${meta.color}">${escapeHtml(topic.level)}</span>
          <h2>${escapeHtml(topic.title)}</h2>
          <p class="muted">${escapeHtml(topic.summary)}</p>
        </div>
        ${topic.progress.mastered ? `<span class="cognate-tag" style="font-size:14px;padding:4px 10px">✓ Maîtrisé</span>` : ""}
      </header>
      ${locked ? `<div class="lesson-lock">
        🔒 Ce sujet est au niveau <strong>${topic.level}</strong>. Vous êtes au niveau <strong>${s.activeLevel}</strong>. Vous pouvez le lire, mais les drills sont désactivés.
      </div>` : ""}
      <section class="lesson-body tappable-fr">${renderMarkdown(topic.body)}</section>
      <hr>
      <section class="lesson-drill">
        <h3>Drills (${topic.items.length})</h3>
        <p class="muted">
          Maîtrise : ${topic.progress.correct} bonnes / ${topic.progress.seen} essais
          ${topic.progress.seen ? `(${Math.round(topic.progress.ratio * 100)}%)` : ""}
          — palier : ${data.thresholds.seen} essais à ${Math.round(data.thresholds.accuracy * 100)}%.
        </p>
        <div id="drill-runner"></div>
      </section>
    `;
    runDrills(topic, locked);
  }

  function runDrills(topic, locked) {
    const root = document.getElementById("drill-runner");
    let i = 0;
    let correct = 0;
    function tick() {
      if (i >= topic.items.length) return done();
      const item = topic.items[i];
      root.innerHTML = `
        <article class="drill-card">
          <p class="drill-num">${i + 1} / ${topic.items.length}</p>
          <p class="drill-text">${escapeHtml(item.text).replace(/___/, '<input type="text" id="drill-in" autocomplete="off" autofocus placeholder="…">')}</p>
          ${item.hint ? `<p class="drill-hint">${escapeHtml(item.hint)}</p>` : ""}
          <div class="drill-actions">
            <button class="btn btn-primary" id="drill-check" ${locked ? "disabled" : ""}>Vérifier</button>
            ${locked ? `<p class="muted" style="margin:8px 0 0">Drill désactivé — niveau verrouillé.</p>` : ""}
          </div>
          <div id="drill-fb" class="num-fb"></div>
        </article>
      `;
      if (locked) return;
      document.getElementById("drill-in").addEventListener("keydown", (e) => {
        if (e.key === "Enter") { e.preventDefault(); validate(); }
      });
      document.getElementById("drill-check").addEventListener("click", validate);

      async function validate() {
        const v = document.getElementById("drill-in").value;
        const ok = matches(v, item);
        const fb = document.getElementById("drill-fb");
        if (ok) {
          correct += 1;
          fb.innerHTML = `<span class="fb-good">✓ ${escapeHtml(item.answer)}</span>`;
        } else {
          fb.innerHTML = `<span class="fb-bad">✗ réponse : ${escapeHtml(item.answer)}</span>`;
        }
        // Back-sync this attempt — fire-and-forget.
        try {
          const r = await window.API.post("/api/grammar/answer", { topic_id: topic.id, correct: ok });
          if (r && r.progress) {
            topic.progress = r.progress;
          }
        } catch (e) {}
        setTimeout(() => { i += 1; tick(); }, ok ? 600 : 1500);
      }
    }
    function done() {
      const pct = Math.round((correct / topic.items.length) * 100);
      root.innerHTML = `
        <div class="fc-summary">
          <p class="big-num">${pct}%</p>
          <h3>${correct} / ${topic.items.length} correctes</h3>
          ${topic.progress.mastered ? `<p class="muted">✓ sujet maîtrisé</p>` : ""}
          <div class="hero-actions">
            <button class="btn btn-primary" id="drill-redo">Recommencer</button>
            <a class="btn" href="#/grammaire">Choisir un autre sujet</a>
          </div>
        </div>
      `;
      document.getElementById("drill-redo").addEventListener("click", () => {
        i = 0; correct = 0; tick();
      });
      // Refresh the topic in the tree so the counter updates without a refetch.
      renderTree(dataCache);
    }
    tick();
  }

  // Lenient match: same accent-folding as Conjugation. Accept any alt.
  function matches(input, item) {
    if (window.Conjugation && window.Conjugation.check) {
      const candidates = [item.answer, ...(item.alts || [])];
      return candidates.some((c) => window.Conjugation.check(input, c));
    }
    // Fallback if conjugation-rules.js isn't loaded.
    const fold = (s) => (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[’']/g, "'").trim();
    return fold(input) === fold(item.answer) || (item.alts || []).some((a) => fold(input) === fold(a));
  }

  window.GrammaireView = { render };
})();
