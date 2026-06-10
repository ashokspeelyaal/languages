/* Exercise widgets. Each factory returns a function(host, item, onResult)
 * that mounts the widget into `host` and calls `onResult(isRight)` once
 * the user answers. All widgets are stateless from the caller's view —
 * re-mounting renders fresh.
 *
 * Lenient match: accent-folded, lower-cased, whitespace-collapsed,
 * trailing punctuation stripped.
 */
(function () {
  function escapeHtml(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));
  }
  function fold(s) {
    return (s || "")
      .toLowerCase()
      .normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/[œ]/g, "oe").replace(/[æ]/g, "ae")
      .replace(/[’']/g, "'")
      .replace(/[.,;:!?…«»"]+$/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }
  function looseEq(a, b) {
    return fold(a) === fold(b);
  }

  // ----------------------------------------------- mc: multiple choice
  function mountMC(host, item, onResult) {
    const q = item.question || "—";
    host.innerHTML = `
      <div class="ex-tile">
        <div class="ex-label">QCM</div>
        <p>${escapeHtml(q)}</p>
        <div class="ex-opts">
          ${(item.options || []).map((opt, i) =>
            `<button type="button" class="ex-opt" data-i="${i}">${escapeHtml(opt)}</button>`
          ).join("")}
        </div>
        <div class="ex-fb"></div>
      </div>
    `;
    let locked = false;
    host.querySelectorAll(".ex-opt").forEach((b) => {
      b.addEventListener("click", () => {
        if (locked) return; locked = true;
        const picked = parseInt(b.dataset.i, 10);
        const correct = picked === item.correct;
        host.querySelectorAll(".ex-opt").forEach((x, i) => {
          if (i === item.correct) x.classList.add("correct");
          else if (i === picked && !correct) x.classList.add("wrong");
        });
        host.querySelector(".ex-fb").className = "ex-fb " + (correct ? "good" : "bad");
        host.querySelector(".ex-fb").textContent = correct ? "✓ Bonne réponse" : `✗ Réponse : ${item.options[item.correct]}`;
        onResult?.(correct);
      });
    });
  }

  // ----------------------------------------------- blank: fill-in
  function mountBlank(host, item, onResult) {
    const masked = (item.masked || "").replace(/_+/, '<input type="text" class="ex-input" id="blank-in" autocomplete="off">');
    host.innerHTML = `
      <div class="ex-tile">
        <div class="ex-label">Trou à combler</div>
        <p>${escapeHtml(masked).replace(/&lt;input([^&]*?)&gt;/, "<input$1>")}</p>
        ${item.hint ? `<p class="muted" style="font-size:12px;font-style:italic">${escapeHtml(item.hint)}</p>` : ""}
        <button class="btn btn-primary" type="button" id="blank-go">Vérifier</button>
        <div class="ex-fb"></div>
      </div>
    `;
    // The escapeHtml clobbered the <input>; rebuild it cleanly:
    const tile = host.querySelector(".ex-tile p");
    tile.innerHTML = escapeHtml(item.masked || "").replace(/_+/, '<input type="text" class="ex-input" id="blank-in" autocomplete="off">');

    const input = host.querySelector("#blank-in");
    const fb = host.querySelector(".ex-fb");
    let locked = false;
    function check() {
      if (locked) return; locked = true;
      const ok = looseEq(input.value, item.answer);
      fb.className = "ex-fb " + (ok ? "good" : "bad");
      fb.textContent = ok ? `✓ ${item.answer}` : `✗ Réponse : ${item.answer}`;
      input.disabled = true;
      onResult?.(ok);
    }
    input?.focus();
    input?.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); check(); } });
    host.querySelector("#blank-go").addEventListener("click", check);
  }

  // ----------------------------------------------- reorder
  function mountReorder(host, item, onResult) {
    const scrambled = (item.scrambled || []).slice();
    const correct = item.correct || [];
    // Shuffle scrambled if it happens to equal correct.
    if (scrambled.join("|") === correct.join("|") && scrambled.length > 2) {
      for (let i = scrambled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [scrambled[i], scrambled[j]] = [scrambled[j], scrambled[i]];
      }
    }
    host.innerHTML = `
      <div class="ex-tile">
        <div class="ex-label">Remettre en ordre</div>
        <div class="reorder-built" id="re-built"></div>
        <div class="reorder-pool" id="re-pool">
          ${scrambled.map((w, i) => `<button type="button" class="reorder-tile" data-i="${i}">${escapeHtml(w)}</button>`).join("")}
        </div>
        <div style="display:flex;gap:6px;margin-top:8px">
          <button class="btn" type="button" id="re-reset">Effacer</button>
          <button class="btn btn-primary" type="button" id="re-go">Vérifier</button>
        </div>
        <div class="ex-fb"></div>
      </div>
    `;
    const pool = host.querySelector("#re-pool");
    const built = host.querySelector("#re-built");
    const fb = host.querySelector(".ex-fb");
    let chosen = []; // array of indices into scrambled
    let locked = false;

    function render() {
      built.innerHTML = chosen.map((i, k) =>
        `<button type="button" class="reorder-tile" data-pop="${k}">${escapeHtml(scrambled[i])}</button>`
      ).join("");
      pool.querySelectorAll(".reorder-tile").forEach((t) => {
        const i = parseInt(t.dataset.i, 10);
        t.classList.toggle("used", chosen.includes(i));
      });
      built.querySelectorAll(".reorder-tile").forEach((t) =>
        t.addEventListener("click", () => {
          if (locked) return;
          const k = parseInt(t.dataset.pop, 10);
          chosen.splice(k, 1); render();
        })
      );
    }
    render();
    pool.querySelectorAll(".reorder-tile").forEach((t) =>
      t.addEventListener("click", () => {
        if (locked) return;
        const i = parseInt(t.dataset.i, 10);
        if (chosen.includes(i)) return;
        chosen.push(i); render();
      })
    );
    host.querySelector("#re-reset").addEventListener("click", () => { if (!locked) { chosen = []; render(); } });
    host.querySelector("#re-go").addEventListener("click", () => {
      if (locked) return; locked = true;
      const built = chosen.map((i) => scrambled[i]);
      const ok = built.join(" ") === correct.join(" ") ||
                 fold(built.join(" ")) === fold(correct.join(" "));
      fb.className = "ex-fb " + (ok ? "good" : "bad");
      fb.textContent = ok ? "✓ Ordre correct" : `✗ Ordre attendu : ${correct.join(" ")}`;
      onResult?.(ok);
    });
  }

  // ----------------------------------------------- tf: true / false
  function mountTF(host, item, onResult) {
    host.innerHTML = `
      <div class="ex-tile">
        <div class="ex-label">Vrai ou faux ?</div>
        <p>${escapeHtml(item.statement || "")}</p>
        <div class="tf-row">
          <button type="button" class="tf-btn" data-v="true">Vrai</button>
          <button type="button" class="tf-btn" data-v="false">Faux</button>
        </div>
        <div class="ex-fb"></div>
      </div>
    `;
    let locked = false;
    host.querySelectorAll(".tf-btn").forEach((b) => {
      b.addEventListener("click", () => {
        if (locked) return; locked = true;
        const picked = b.dataset.v === "true";
        const ok = picked === !!item.answer;
        host.querySelectorAll(".tf-btn").forEach((x) => {
          const xv = x.dataset.v === "true";
          if (xv === !!item.answer) x.classList.add("correct");
          else if (x === b) x.classList.add("wrong");
        });
        const fb = host.querySelector(".ex-fb");
        fb.className = "ex-fb " + (ok ? "good" : "bad");
        fb.textContent = ok ? "✓" : `✗ Réponse : ${item.answer ? "vrai" : "faux"}`;
        onResult?.(ok);
      });
    });
  }

  // ----------------------------------------------- translate (EN → FR)
  function mountTranslate(host, item, onResult) {
    host.innerHTML = `
      <div class="ex-tile">
        <div class="ex-label">Traduire en français</div>
        <p>${escapeHtml(item.prompt_en || item.prompt || "")}</p>
        <textarea class="ex-input" id="tr-in" rows="2" style="width:100%;font:14px sans-serif" autocomplete="off"></textarea>
        <button class="btn btn-primary" type="button" id="tr-go" style="margin-top:6px">Vérifier</button>
        <div class="ex-fb"></div>
      </div>
    `;
    const input = host.querySelector("#tr-in");
    input?.focus();
    let locked = false;
    host.querySelector("#tr-go").addEventListener("click", () => {
      if (locked) return; locked = true;
      const gold = item.answer_fr || item.answer || "";
      const ok = looseEq(input.value, gold);
      const fb = host.querySelector(".ex-fb");
      fb.className = "ex-fb " + (ok ? "good" : "bad");
      fb.innerHTML = ok ? `✓` : `✗ Une réponse correcte : <em>${escapeHtml(gold)}</em>`;
      input.disabled = true;
      onResult?.(ok);
    });
  }

  const FACTORIES = {
    mc: mountMC,
    blank: mountBlank,
    reorder: mountReorder,
    tf: mountTF,
    translate: mountTranslate,
  };

  function mount(host, item, onResult) {
    const f = FACTORIES[item.type];
    if (!f) {
      host.innerHTML = `<div class="ex-tile"><div class="ex-label">${escapeHtml(item.type || "?")}</div><p class="muted">Type d'exercice non reconnu.</p></div>`;
      return;
    }
    return f(host, item, onResult);
  }

  window.ExerciseWidgets = { mount, FACTORIES };
})();
