/* Three views, hash-routed:
 *   #/              list (all immersions)
 *   #/new           create form
 *   #/i/{id}        detail (audio + vocab + exercises)
 *   #/logout        log out + redirect
 *
 * View functions take no args; they read location.hash for params.
 */
(function () {
  function escapeHtml(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));
  }
  function view() { return document.getElementById("view"); }

  // ============================================================ ROUTER
  async function navigate() {
    const hash = location.hash || "#/";
    const path = hash.replace(/^#\/?/, "");
    document.querySelectorAll(".nav a[data-route]").forEach((a) => {
      a.classList.toggle("active",
        (a.dataset.route === "list" && (path === "" || path === "/")) ||
        (a.dataset.route === "new"  && path.startsWith("new"))
      );
    });
    try {
      if (path === "" || path === "/") return await renderList();
      if (path === "new") return await renderNew();
      if (path.startsWith("i/")) return await renderDetail(path.slice(2));
      if (path === "logout") {
        try { await window.API.post("/api/auth/logout", {}); } catch (_) {}
        return location.replace("/login");
      }
      view().innerHTML = `<div class="empty">Route inconnue : ${escapeHtml(path)}</div>`;
    } catch (e) {
      view().innerHTML = `<div class="empty" style="color:#b91c1c">Erreur : ${escapeHtml(e.message)}</div>`;
    }
  }
  window.addEventListener("hashchange", navigate);

  // ============================================================ LIST
  async function renderList() {
    view().innerHTML = `<div class="empty">Chargement…</div>`;
    const data = await window.API.get("/api/immersion");
    const exs = data.exercises || [];
    if (exs.length === 0) {
      view().innerHTML = `
        <div class="container">
          <div class="empty">
            <h2 style="color:#7c3aed">Pas encore d'immersion</h2>
            <p>Collez un transcrit en français, choisissez votre niveau, et l'IA construit votre matériel d'apprentissage.</p>
            <p style="margin-top:18px"><a class="btn btn-primary" href="#/new">Nouvelle immersion ▸</a></p>
          </div>
        </div>
      `;
      return;
    }
    view().innerHTML = `
      <div class="container">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
          <h2 style="margin:0">Mes immersions <small style="color:#6b7280">(${exs.length})</small></h2>
          <a class="btn btn-primary" href="#/new">+ Nouveau</a>
        </div>
        <div class="list-grid">
          ${exs.map(exCard).join("")}
        </div>
      </div>
    `;
    view().querySelectorAll("[data-del]").forEach((b) =>
      b.addEventListener("click", async (e) => {
        e.preventDefault();
        if (!confirm("Supprimer cette immersion ? L'audio et les exercices seront perdus.")) return;
        try {
          await window.API.del("/api/immersion/" + b.dataset.del);
          renderList();
        } catch (e) { alert(e.message); }
      })
    );
  }
  function exCard(ex) {
    const when = new Date(ex.updatedAt).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" });
    const charcount = (ex.transcript || "").length;
    return `
      <div class="ex-card">
        <div style="flex:1;min-width:0">
          <h3><a href="#/i/${escapeHtml(ex.id)}">${escapeHtml(ex.title)}</a></h3>
          <div class="ex-meta">
            <span class="level-pill">${escapeHtml(ex.level)}</span>
            <span class="status-pill status-${escapeHtml(ex.status)}">${escapeHtml(ex.status)}</span>
            · ${charcount} caractères · ${when}
          </div>
        </div>
        <div class="ex-actions">
          <a class="btn" href="#/i/${escapeHtml(ex.id)}">Ouvrir</a>
          <button class="btn btn-danger" data-del="${escapeHtml(ex.id)}">Supprimer</button>
        </div>
      </div>
    `;
  }

  // ============================================================ NEW
  async function renderNew() {
    const config = await window.API.get("/api/ai/config").catch(() => ({ openai: false }));
    view().innerHTML = `
      <div class="container">
        <h2>Nouvelle immersion</h2>
        <p class="muted">Collez un transcrit en français (article, dialogue, post, transcription d'un podcast…) et choisissez votre niveau. L'IA génère vocabulaire, exercices et audio.</p>
        ${!config.openai ? `<div class="gen-progress" style="background:#fee2e2;border-color:#fecaca;color:#b91c1c">
          ⚠️ Aucune clé OpenAI configurée dans <code>.env</code>. Vous pouvez créer une immersion en mode brouillon, mais l'IA ne pourra pas générer de contenu.
        </div>` : ""}
        <form class="create-form" id="new-form">
          <div class="row">
            <label for="title">Titre (optionnel)</label>
            <input type="text" id="title" name="title" placeholder="Laisser vide pour générer automatiquement">
          </div>
          <div class="row">
            <label>Niveau CEFR</label>
            <div class="level-picker" id="level-picker">
              ${["A1","A2","B1","B2","C1"].map((l) =>
                `<button type="button" class="level-pick-btn ${l === "A2" ? "active" : ""}" data-l="${l}">${l}</button>`
              ).join("")}
            </div>
          </div>
          <div class="row">
            <label for="tr">Transcrit en français</label>
            <textarea id="tr" name="transcript" placeholder="Coller votre transcrit ici…" required></textarea>
            <div class="char-counter" id="counter">0 / 6000</div>
          </div>
          <div style="display:flex;gap:8px;align-items:center">
            <button class="btn btn-primary" type="submit" id="submit-btn">Créer + Générer (≈ 60s)</button>
            <button class="btn" type="button" id="submit-draft">Brouillon (sans IA)</button>
            <a class="btn" href="#/">Annuler</a>
          </div>
          <div id="gen-status"></div>
        </form>
      </div>
    `;

    let pickedLevel = "A2";
    view().querySelectorAll(".level-pick-btn").forEach((b) => {
      b.addEventListener("click", () => {
        pickedLevel = b.dataset.l;
        view().querySelectorAll(".level-pick-btn").forEach((x) => x.classList.toggle("active", x === b));
      });
    });
    const counter = view().querySelector("#counter");
    const ta = view().querySelector("#tr");
    ta.addEventListener("input", () => {
      counter.textContent = `${ta.value.length} / 6000`;
      counter.style.color = ta.value.length > 6000 ? "#b91c1c" : "#6b7280";
    });

    async function submit(runAI) {
      const transcript = ta.value.trim();
      if (!transcript) { alert("Transcrit requis"); return; }
      if (transcript.length > 6000) { alert("Trop long (max 6000 caractères)"); return; }
      const title = view().querySelector("#title").value.trim() || null;
      const status = view().querySelector("#gen-status");
      const btn = view().querySelector("#submit-btn");
      const btn2 = view().querySelector("#submit-draft");
      btn.disabled = true; btn2.disabled = true;
      try {
        status.innerHTML = `<div class="gen-progress"><div class="gen-spin"></div><div>Création…</div></div>`;
        const created = await window.API.post("/api/immersion", { transcript, level: pickedLevel, title });
        const id = created.exercise.id;
        if (!runAI) { location.hash = `#/i/${id}`; return; }
        status.innerHTML = `<div class="gen-progress"><div class="gen-spin"></div><div>Analyse IA (vocabulaire + exercices)… environ 30 s.</div></div>`;
        await window.API.post(`/api/immersion/${id}/analyze`);
        status.innerHTML = `<div class="gen-progress"><div class="gen-spin"></div><div>Génération audio (TTS)… environ 10 s.</div></div>`;
        await window.API.post(`/api/immersion/${id}/audio`);
        status.innerHTML = `<div class="gen-progress"><div class="gen-spin"></div><div>Synchronisation karaoke (Whisper)… environ 15 s.</div></div>`;
        await window.API.post(`/api/immersion/${id}/timings`);
        status.innerHTML = `<div class="gen-progress" style="background:#dcfce7;border-color:#bbf7d0;color:#166534">✓ Prêt ! Redirection…</div>`;
        setTimeout(() => { location.hash = `#/i/${id}`; }, 500);
      } catch (e) {
        status.innerHTML = `<div class="gen-progress" style="background:#fee2e2;border-color:#fecaca;color:#b91c1c">⚠️ ${escapeHtml(e.message)}</div>`;
        btn.disabled = false; btn2.disabled = false;
      }
    }
    view().querySelector("#new-form").addEventListener("submit", (e) => { e.preventDefault(); submit(true); });
    view().querySelector("#submit-draft").addEventListener("click", () => submit(false));
  }

  // ============================================================ DETAIL
  async function renderDetail(id) {
    view().innerHTML = `<div class="empty">Chargement…</div>`;
    const data = await window.API.get(`/api/immersion/${encodeURIComponent(id)}`);
    const ex = data.exercise;
    let tab = "listen";

    function paint() {
      view().innerHTML = `
        <div class="container">
          <div class="detail-head">
            <a class="btn" href="#/">← Retour</a>
            <h2 style="margin:0">${escapeHtml(ex.title)}</h2>
            <span class="level-pill">${escapeHtml(ex.level)}</span>
            <span class="status-pill status-${escapeHtml(ex.status)}">${escapeHtml(ex.status)}</span>
          </div>
          ${ex.error ? `<div class="gen-progress" style="background:#fee2e2;border-color:#fecaca;color:#b91c1c">⚠️ ${escapeHtml(ex.error)} <button class="btn" id="retry" style="margin-left:auto">Relancer</button></div>` : ""}
          ${ex.status !== "done" && !ex.error ? renderInProgress(ex) : ""}
          <nav class="tabs">
            <button class="tab ${tab === "listen" ? "active" : ""}" data-t="listen">▶ Écouter</button>
            <button class="tab ${tab === "vocab" ? "active" : ""}" data-t="vocab">Vocabulaire <small>(${(ex.vocab || []).length})</small></button>
            <button class="tab ${tab === "exer" ? "active" : ""}" data-t="exer">Exercices <small>(${(ex.sentences || []).reduce((a, s) => a + (s.exercises || []).length, 0)})</small></button>
            <button class="tab ${tab === "transcript" ? "active" : ""}" data-t="transcript">Transcrit</button>
          </nav>
          <div id="pane"></div>
        </div>
      `;
      view().querySelectorAll(".tab").forEach((b) => b.addEventListener("click", () => {
        tab = b.dataset.t;
        paint();
      }));
      const retry = view().querySelector("#retry");
      retry?.addEventListener("click", async () => {
        try {
          if (ex.status === "error" || ex.status === "analyzing") await window.API.post(`/api/immersion/${id}/analyze`);
          else if (ex.status === "tts") await window.API.post(`/api/immersion/${id}/audio`);
          else if (ex.status === "timings") await window.API.post(`/api/immersion/${id}/timings`);
          renderDetail(id);
        } catch (e) { alert(e.message); }
      });
      const pane = view().querySelector("#pane");
      if (tab === "listen")     renderListen(pane, ex, id);
      else if (tab === "vocab") renderVocab(pane, ex);
      else if (tab === "exer")  renderExercises(pane, ex);
      else                       renderTranscript(pane, ex);
    }
    paint();
  }

  function renderInProgress(ex) {
    const stepLabel = {
      new: "En attente — cliquez Générer pour lancer.",
      analyzing: "Analyse IA en cours…",
      analyzed: "Analyse terminée. En attente d'audio.",
      tts: "Génération audio (TTS) en cours…",
      audio_ready: "Audio prêt. En attente de synchronisation.",
      timings: "Synchronisation karaoke (Whisper)…",
    };
    return `<div class="gen-progress">
      ${["analyzing","tts","timings"].includes(ex.status) ? `<div class="gen-spin"></div>` : ""}
      <div>${escapeHtml(stepLabel[ex.status] || ex.status)}</div>
    </div>`;
  }

  // -------- tab: listen (karaoke)
  function renderListen(pane, ex, id) {
    if (!ex.hasAudio || !ex.wordTimings || ex.wordTimings.length === 0) {
      pane.innerHTML = `
        <div class="empty">
          <p>Audio ou synchronisation pas encore prête.</p>
          ${ex.status !== "done" && !ex.error
            ? `<p>Génération en cours — patientez puis rechargez.</p>`
            : `<p><button class="btn btn-primary" id="run-now">Lancer la génération IA</button></p>`}
        </div>
      `;
      pane.querySelector("#run-now")?.addEventListener("click", async () => {
        try {
          if (!ex.vocab || ex.vocab.length === 0) await window.API.post(`/api/immersion/${id}/analyze`);
          if (!ex.hasAudio) await window.API.post(`/api/immersion/${id}/audio`);
          await window.API.post(`/api/immersion/${id}/timings`);
          location.reload();
        } catch (e) { alert(e.message); }
      });
      return;
    }
    pane.innerHTML = "";
    window.Karaoke.mount(pane, {
      transcript: ex.transcript,
      audioUrl: `/api/immersion/${encodeURIComponent(id)}/audio?_=${Date.now()}`,
      wordTimings: ex.wordTimings,
    });
  }

  // -------- tab: vocab
  function renderVocab(pane, ex) {
    const v = ex.vocab || [];
    if (v.length === 0) {
      pane.innerHTML = `<div class="empty"><p>Vocabulaire pas encore généré.</p></div>`;
      return;
    }
    pane.innerHTML = `<div class="vocab-grid">${v.map(vocabCard).join("")}</div>`;
    pane.querySelectorAll(".voice-btn").forEach((b) =>
      b.addEventListener("click", async () => {
        try {
          const resp = await fetch("/api/ai/tts", {
            method: "POST",
            headers: { "Content-Type": "application/json", "X-Requested-With": "fetch" },
            credentials: "same-origin",
            body: JSON.stringify({ text: b.dataset.text, voice: "nova" }),
          });
          if (!resp.ok) return;
          const blob = await resp.blob();
          const a = new Audio(URL.createObjectURL(blob));
          a.play();
        } catch (_) {}
      })
    );
  }
  function vocabCard(item) {
    const art = item.article ? `<span class="vc-art ${item.gender === "f" ? "gender-f" : ""}">${escapeHtml(item.article)}</span>` : "";
    const pos = item.pos ? `<span class="vc-pos">${escapeHtml(item.pos)}</span>` : "";
    const ipa = item.ipa ? `<span class="vc-ipa">${escapeHtml(item.ipa)}</span>` : "";
    return `
      <div class="vocab-card">
        <div class="vc-head">
          ${art}
          <span class="vc-fr">${escapeHtml(item.french)}</span>
          ${pos}
          ${ipa}
          <button class="voice-btn" type="button" data-text="${escapeHtml(item.french)}">▶</button>
        </div>
        <div class="vc-en">${escapeHtml(item.english)}</div>
        ${item.hint ? `<div class="vc-hint">${escapeHtml(item.hint)}</div>` : ""}
      </div>
    `;
  }

  // -------- tab: exercises
  function renderExercises(pane, ex) {
    const sents = ex.sentences || [];
    if (sents.length === 0) {
      pane.innerHTML = `<div class="empty"><p>Exercices pas encore générés.</p></div>`;
      return;
    }
    pane.innerHTML = sents.map(sentBlock).join("");
    // Wire each exercise widget.
    pane.querySelectorAll("[data-exhost]").forEach((host) => {
      const sidx = parseInt(host.dataset.sidx, 10);
      const eidx = parseInt(host.dataset.eidx, 10);
      const item = sents[sidx].exercises[eidx];
      window.ExerciseWidgets.mount(host, item, (ok) => {
        // No SRS in this app — but we can persist progress to the row.
        // Keep it local for now; future enhancement.
      });
    });
  }
  function sentBlock(s, sidx) {
    return `
      <div class="sent-block">
        <div class="sent-orig">${escapeHtml(s.text)}</div>
        ${s.translation ? `<div class="sent-trans">→ ${escapeHtml(s.translation)}</div>` : ""}
        ${(s.exercises || []).map((it, eidx) =>
          `<div data-exhost data-sidx="${sidx}" data-eidx="${eidx}"></div>`
        ).join("")}
      </div>
    `;
  }

  // -------- tab: transcript
  function renderTranscript(pane, ex) {
    pane.innerHTML = `
      <div class="karaoke-wrap">
        <h3 style="margin-top:0">Transcrit original</h3>
        <div class="karaoke-text" style="cursor:auto">${escapeHtml(ex.transcript || "").replace(/\n/g, "<br>")}</div>
      </div>
    `;
  }

  window.Views = { navigate };
})();
