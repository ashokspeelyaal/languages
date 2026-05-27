/* Handwriting capture + OCR for the Schrijven exam section.
 * - File upload (multi-image) OR webcam capture (Apple-Notes-style multi-page scan)
 * - Per-page crop UI
 * - OCR via GPT-5 vision: returns full transcription combining all pages */
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

  function blobToDataURL(blob) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = reject;
      r.readAsDataURL(blob);
    });
  }

  /* ============ Capture / Upload modal ============ */
  // pages is an array of { blob, name }. Resolves with the final array (or null on cancel).
  function openCaptureModal(initialPages) {
    return new Promise((resolve) => {
      let pages = (initialPages || []).slice();
      let stream = null;
      let videoEl = null;

      const overlay = el("div", { class: "hw-overlay" });
      const modal = el("div", { class: "hw-modal" });
      overlay.append(modal);
      document.body.append(overlay);

      function close(result) {
        if (stream) stream.getTracks().forEach((t) => t.stop());
        overlay.remove();
        resolve(result);
      }

      // Two modes: 'choose' (initial), 'webcam' (live capture)
      let mode = "choose";

      function renderShell() {
        modal.innerHTML = "";
        modal.append(
          el("div", { class: "hw-head" },
            el("h3", null, "Handgeschreven pagina's"),
            el("button", { class: "hw-close", onClick: () => close(null) }, "✕"),
          ),
          renderMain(),
          renderThumbStrip(),
          renderFooter(),
        );
      }

      function renderMain() {
        if (mode === "webcam") return renderWebcam();
        return renderChoose();
      }

      function renderChoose() {
        const upload = el("button", { class: "hw-big-btn", onClick: () => triggerUpload() },
          el("span", { class: "hw-big-ico" }, "📄"),
          el("span", null, "Upload bestanden"),
          el("span", { class: "hw-big-sub" }, "JPG, PNG, HEIC — meerdere mogelijk"),
        );
        const camera = el("button", { class: "hw-big-btn", onClick: () => switchToWebcam() },
          el("span", { class: "hw-big-ico" }, "📷"),
          el("span", null, "Webcam-scan"),
          el("span", { class: "hw-big-sub" }, "neem pagina's op met je Mac-camera"),
        );
        return el("div", { class: "hw-choose" }, upload, camera);
      }

      function renderWebcam() {
        const wrap = el("div", { class: "hw-webcam-wrap" });
        videoEl = el("video", { autoplay: true, playsinline: true, class: "hw-video" });
        const captureBtn = el("button", { class: "hw-capture-btn", onClick: () => captureFrame() },
          el("span", { class: "hw-capture-ico" }, "●"));
        wrap.append(videoEl, captureBtn);
        return wrap;
      }

      function renderThumbStrip() {
        const strip = el("div", { class: "hw-thumbs" });
        if (!pages.length) {
          strip.append(el("span", { class: "hw-thumbs-empty" }, "Geen pagina's nog."));
          return strip;
        }
        pages.forEach((p, i) => {
          const url = URL.createObjectURL(p.blob);
          const thumb = el("div", { class: "hw-thumb" },
            el("img", { src: url, alt: "page " + (i + 1) }),
            el("span", { class: "hw-thumb-num" }, String(i + 1)),
            el("div", { class: "hw-thumb-actions" },
              el("button", { title: "Bijsnijden", onClick: () => cropPage(i) }, "✂"),
              el("button", { title: "Verwijderen", onClick: () => deletePage(i) }, "✕"),
            ),
          );
          strip.append(thumb);
        });
        return strip;
      }

      function renderFooter() {
        const foot = el("div", { class: "hw-foot" });
        if (mode === "webcam") {
          foot.append(el("button", { class: "subtle", onClick: () => { switchToChoose(); } }, "← Terug"));
        } else if (pages.length) {
          foot.append(el("button", { class: "subtle", onClick: () => { mode = "choose"; renderShell(); } }, "+ Meer toevoegen"));
        }
        foot.append(el("span", { style: "flex:1" }));
        if (pages.length) {
          foot.append(el("button", { onClick: () => close(pages) },
            `Klaar — ${pages.length} pagina${pages.length === 1 ? "" : "'s"}`));
        }
        return foot;
      }

      async function switchToWebcam() {
        mode = "webcam";
        renderShell();
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } },
            audio: false,
          });
          videoEl.srcObject = stream;
        } catch (err) {
          alert("Kon de camera niet openen: " + err.message);
          switchToChoose();
        }
      }
      function switchToChoose() {
        if (stream) { stream.getTracks().forEach((t) => t.stop()); stream = null; }
        mode = "choose";
        renderShell();
      }

      function captureFrame() {
        if (!videoEl) return;
        const w = videoEl.videoWidth, h = videoEl.videoHeight;
        if (!w || !h) return;
        const canvas = document.createElement("canvas");
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(videoEl, 0, 0, w, h);
        canvas.toBlob((blob) => {
          if (!blob) return;
          pages.push({ blob, name: `webcam-${pages.length + 1}.jpg` });
          renderShell();
          // re-attach stream because renderShell rebuilt the video element
          if (videoEl) videoEl.srcObject = stream;
        }, "image/jpeg", 0.9);
      }

      function triggerUpload() {
        const fi = document.createElement("input");
        fi.type = "file";
        fi.accept = "image/*";
        fi.multiple = true;
        fi.onchange = () => {
          if (!fi.files) return;
          Array.from(fi.files).forEach((f) => pages.push({ blob: f, name: f.name }));
          renderShell();
        };
        fi.click();
      }

      function deletePage(i) {
        pages.splice(i, 1);
        renderShell();
        if (videoEl && stream) videoEl.srcObject = stream;
      }

      async function cropPage(i) {
        const cropped = await openCropModal(pages[i].blob);
        if (cropped) pages[i].blob = cropped;
        renderShell();
        if (videoEl && stream) videoEl.srcObject = stream;
      }

      renderShell();
    });
  }

  /* ============ Crop modal ============ */
  function openCropModal(blob) {
    return new Promise((resolve) => {
      const overlay = el("div", { class: "hw-overlay" });
      const modal = el("div", { class: "hw-modal hw-crop-modal" });
      overlay.append(modal);
      document.body.append(overlay);

      const img = new Image();
      const url = URL.createObjectURL(blob);
      img.src = url;
      img.onload = () => init();

      function close(result) {
        URL.revokeObjectURL(url);
        overlay.remove();
        resolve(result);
      }

      function init() {
        // Fit image inside a max viewport while preserving aspect
        const maxW = Math.min(window.innerWidth - 80, 900);
        const maxH = Math.min(window.innerHeight - 220, 600);
        const scale = Math.min(maxW / img.width, maxH / img.height, 1);
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);

        modal.innerHTML = "";
        modal.append(el("div", { class: "hw-head" },
          el("h3", null, "Bijsnijden · crop"),
          el("button", { class: "hw-close", onClick: () => close(null) }, "✕"),
        ));

        const stage = el("div", { class: "hw-crop-stage", style: `width:${w}px;height:${h}px` });
        const canvasImg = el("img", { src: url, style: `width:${w}px;height:${h}px;display:block` });
        stage.append(canvasImg);

        // Crop rectangle state (in displayed coords)
        const crop = { x: 0, y: 0, w, h };
        const rect = el("div", { class: "hw-crop-rect" });
        const handles = ["nw", "ne", "sw", "se"].map((dir) => {
          const h = el("div", { class: "hw-crop-handle hw-handle-" + dir, "data-dir": dir });
          rect.append(h);
          return h;
        });
        stage.append(rect);
        updateRect();

        function updateRect() {
          rect.style.left = crop.x + "px";
          rect.style.top = crop.y + "px";
          rect.style.width = crop.w + "px";
          rect.style.height = crop.h + "px";
        }

        // Dragging
        let drag = null;
        stage.addEventListener("mousedown", (e) => {
          const t = e.target;
          const bounds = stage.getBoundingClientRect();
          const x = e.clientX - bounds.left;
          const y = e.clientY - bounds.top;
          if (t.classList.contains("hw-crop-handle")) {
            drag = { type: "resize", dir: t.dataset.dir, startX: x, startY: y, crop: { ...crop } };
          } else if (t === rect) {
            drag = { type: "move", startX: x, startY: y, crop: { ...crop } };
          } else {
            // Click outside rect → start drawing a new rect
            crop.x = x; crop.y = y; crop.w = 0; crop.h = 0;
            drag = { type: "draw", startX: x, startY: y };
            updateRect();
          }
          e.preventDefault();
        });
        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup", onUp);
        function onMove(e) {
          if (!drag) return;
          const bounds = stage.getBoundingClientRect();
          const x = Math.max(0, Math.min(w, e.clientX - bounds.left));
          const y = Math.max(0, Math.min(h, e.clientY - bounds.top));
          if (drag.type === "move") {
            const dx = x - drag.startX, dy = y - drag.startY;
            crop.x = Math.max(0, Math.min(w - crop.w, drag.crop.x + dx));
            crop.y = Math.max(0, Math.min(h - crop.h, drag.crop.y + dy));
          } else if (drag.type === "draw") {
            crop.w = Math.abs(x - drag.startX);
            crop.h = Math.abs(y - drag.startY);
            crop.x = Math.min(x, drag.startX);
            crop.y = Math.min(y, drag.startY);
          } else if (drag.type === "resize") {
            const c = drag.crop;
            let nx = c.x, ny = c.y, nw = c.w, nh = c.h;
            if (drag.dir.includes("w")) { nx = x; nw = c.x + c.w - x; }
            if (drag.dir.includes("n")) { ny = y; nh = c.y + c.h - y; }
            if (drag.dir.includes("e")) { nw = x - c.x; }
            if (drag.dir.includes("s")) { nh = y - c.y; }
            if (nw > 20 && nh > 20) { crop.x = nx; crop.y = ny; crop.w = nw; crop.h = nh; }
          }
          updateRect();
        }
        function onUp() { drag = null; }

        modal.append(stage);
        modal.append(el("p", { class: "hw-hint" },
          "Sleep een rechthoek of pas de hoeken aan. Klik buiten de huidige selectie om opnieuw te beginnen."));
        modal.append(el("div", { class: "hw-foot" },
          el("button", { class: "subtle", onClick: () => close(null) }, "Annuleren"),
          el("span", { style: "flex:1" }),
          el("button", { onClick: () => apply() }, "Toepassen"),
        ));

        function apply() {
          // Map displayed-coord crop back to original image
          const inv = 1 / scale;
          const sx = Math.round(crop.x * inv);
          const sy = Math.round(crop.y * inv);
          const sw = Math.max(20, Math.round(crop.w * inv));
          const sh = Math.max(20, Math.round(crop.h * inv));
          const canvas = document.createElement("canvas");
          canvas.width = sw; canvas.height = sh;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
          canvas.toBlob((b) => { close(b); window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); }, "image/jpeg", 0.92);
        }
      }
    });
  }

  /* ============ OCR via GPT-5 vision ============ */
  async function transcribePages(pages, opts = {}) {
    if (!pages || !pages.length) throw new Error("Geen pagina's om te transcriberen.");
    if (!window.AI || !window.AI.isConfigured()) throw new Error("Stel je OpenAI sleutel in via Instellingen.");

    // CRITICAL: vision models will silently auto-correct handwriting unless
    // explicitly told not to. For CNaVT/exam purposes the transcription MUST
    // preserve every spelling and grammar error exactly as written, or the
    // downstream essay grader becomes worthless.
    const systemPrompt = [
      "Je bent een strikt LETTERLIJKE OCR-engine voor handgeschreven Nederlands.",
      "Je taak: transcribeer EXACT wat er op het papier staat, woord voor woord, teken voor teken.",
      "",
      "ABSOLUTE REGELS — overtreed ze nooit:",
      "1. CORRIGEER NIETS. Schrijf elke spelfout, grammaticale fout, ontbrekende hoofdletter, ontbrekend lidwoord, fout voorzetsel, verkeerde werkwoordsvorm exact zoals geschreven over.",
      "2. Voorbeelden van wat je NIET mag doen:",
      "   • 'genk' → NIET wijzigen naar 'Genk' als de schrijver kleine letter gebruikte.",
      "   • 'ik woont' → NIET wijzigen naar 'ik woon'.",
      "   • 'in plaats van aan' → NIET wijzigen omdat het toevallig fout is.",
      "   • 'wat vind ik leukst' → NIET herschikken naar 'wat ik het leukst vind'.",
      "   • Ontbrekende komma's of punten → NIET toevoegen.",
      "3. Verzin geen woorden. Als handschrift werkelijk onleesbaar is, schrijf [?] op die plek.",
      "4. Doorgehaalde tekst → laat weg ALS duidelijk doorgehaald; bij twijfel transcribeer je het wel en omhul je het met ~~zo~~.",
      "5. Behoud regeleinden alleen wanneer ze een nieuwe alinea markeren (lege regel ertussen).",
      "6. Behoud de oorspronkelijke volgorde van de pagina's.",
      "",
      "OUTPUT: alleen de getranscribeerde tekst, niets anders. Geen 'Hier is de transcriptie:', geen samenvatting, geen commentaar.",
      "",
      "Vergeet niet: deze transcriptie wordt gebruikt om de schrijver z'n fouten aan te leren. Als je stilletjes corrigeert, verliest het z'n waarde.",
    ].join("\n");

    const userContent = [{
      type: "text",
      text: "Hieronder volgen " + pages.length + " foto" + (pages.length === 1 ? "" : "'s") +
        " van een handgeschreven essay. Transcribeer letterlijk, zonder correctie, in de gegeven volgorde.",
    }];
    for (const p of pages) {
      const dataUrl = await blobToDataURL(p.blob);
      userContent.push({
        type: "image_url",
        image_url: { url: dataUrl, detail: "high" },
      });
    }

    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userContent },
    ];

    const r = await window.AI.complete({
      kind: "ocr",
      messages,
      maxTokens: 3000,
      reasoning: "low",
      noCache: true,
    });
    return r.text;
  }

  window.Handwriting = { openCaptureModal, transcribePages };
})();
