/* De hele app is één lus: vraag → antwoord → uitsluitsel → volgende vraag.
 *
 * Er is geen startscherm, geen inhoudsopgave, geen dashboard. Je opent het
 * bestand en je bent bezig. De planning (spreiding, mengen, foute items die
 * terugkomen) draait onzichtbaar op de achtergrond in store.js en engine.js.
 *
 * Enter doet alles. 1–4 kiest bij meerkeuze. Spatie toont de uitleg als je die
 * wil. Esc pauzeert.
 */
window.OK_APP = (function () {
  var S = window.OK_STORE, E = window.OK_ENGINE, G = window.OK_GRADE, M = window.OK_MAP;

  var root, bar, stage;
  var queue = [], cur = null;
  var answered = false, given = null, res = null;
  var requeued = {};
  var run = { n: 0, ok: 0, rij: 0, best: 0, start: Date.now() };
  var filter = { topic: null, src: null };
  var paused = false;

  /* ---------------- dom ---------------- */
  function h(tag, attrs) {
    var e = document.createElement(tag), i, k;
    if (attrs) for (k in attrs) {
      if (!Object.prototype.hasOwnProperty.call(attrs, k)) continue;
      var v = attrs[k];
      if (v == null || v === false) continue;
      if (k === "class") e.className = v;
      else if (k === "html") e.innerHTML = v;
      else if (k.slice(0, 2) === "on" && typeof v === "function") e.addEventListener(k.slice(2), v);
      else e.setAttribute(k, v === true ? "" : v);
    }
    for (i = 2; i < arguments.length; i++) {
      var c = arguments[i];
      if (c == null || c === false) continue;
      if (Array.isArray(c)) c.forEach(function (x) { if (x) e.appendChild(typeof x === "string" ? document.createTextNode(x) : x); });
      else e.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    }
    return e;
  }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function fmt(s) {
    return esc(s)
      .replace(/&lt;(\/?)(b|i|em|strong|code|br)&gt;/g, "<$1$2>")
      .replace(/___/g, '<span class="gap">_____</span>')
      .replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");
  }
  function clear(e) { while (e.firstChild) e.removeChild(e.firstChild); }

  /* ---------------- spraak ---------------- */
  var voice = null, tried = false;
  function speak(t) {
    if (!window.speechSynthesis) return;
    if (!tried) { tried = true; voice = (speechSynthesis.getVoices() || []).filter(function (v) { return /^nl/i.test(v.lang); })[0] || null; }
    var u = new SpeechSynthesisUtterance(String(t).replace(/_+/g, " ... "));
    u.lang = "nl-NL"; if (voice) u.voice = voice; u.rate = .95;
    speechSynthesis.cancel(); speechSynthesis.speak(u);
  }
  function ear(t) {
    if (!window.speechSynthesis || !t) return null;
    return h("button", { class: "ear", title: "voorlezen", onclick: function (e) { e.stopPropagation(); speak(t); } }, "▶");
  }

  /* ---------------- de wachtrij ---------------- */
  function refill() {
    if (queue.length > 4) return;
    var vers = E.buildSession({ mode: "gemengd", n: 24, topic: filter.topic, src: filter.src });
    if (!vers.length) vers = E.buildSession({ mode: "nieuw", n: 24, topic: filter.topic, src: filter.src });
    var have = {};
    queue.forEach(function (x) { have[x.id] = 1; });
    vers.forEach(function (x) { if (!have[x.id]) queue.push(x); });
  }

  function next() {
    refill();
    cur = queue.shift() || null;
    answered = false; given = null; res = null;
    paint();
  }

  /* ---------------- bovenbalk ---------------- */
  function paintBar() {
    clear(bar);
    var d = S.state().days[S.today()] || { n: 0, ok: 0 };
    var doel = 40;
    var pips = h("div", { class: "pips" });
    for (var i = 0; i < 20; i++) {
      pips.appendChild(h("i", { class: d.n >= (i + 1) * (doel / 20) ? "on" : "" }));
    }
    bar.appendChild(pips);
    bar.appendChild(h("div", { class: "tally" },
      h("span", null, d.n + " vandaag"),
      run.rij > 2 ? h("span", { class: "hot" }, run.rij + " op rij") : null,
      filter.topic ? h("button", { class: "flt", onclick: function () { filter.topic = null; queue = []; next(); } },
        (E.topicsById[filter.topic] || {}).title + " ✕") : null,
      h("button", { class: "gear", title: "pauze (esc)", onclick: pause }, "≡")
    ));
  }

  /* ---------------- de vraagkaart ---------------- */
  function paint() {
    paintBar();
    clear(stage);
    if (!cur) {
      stage.appendChild(h("div", { class: "card" },
        h("p", { class: "vraag" }, "Niets meer te oefenen met deze instellingen."),
        h("button", { class: "btn", onclick: function () { filter.topic = null; filter.src = null; queue = []; next(); } }, "Alles weer aanzetten")));
      return;
    }
    var it = cur;
    var card = h("div", { class: "card" });

    card.appendChild(h("div", { class: "hint" },
      h("span", null, (it.level || "") + " · " + label(it)),
      ear(it.src === "voc" && it.mode !== "produceren" ? it.q : (it.cue || null))));

    if (it.inst) card.appendChild(h("p", { class: "opdracht" }, it.inst));
    if (it.cue) card.appendChild(h("p", { class: "cue" }, it.cue, it.en ? h("small", null, " · " + it.en) : null));

    if (it.src === "voc" && it.mode === "produceren") {
      card.appendChild(h("p", { class: "vraag en" }, it.q));
    } else {
      card.appendChild(h("p", { class: "vraag", html: fmt(it.q) }));
    }
    if (it.src === "voc" && it.mode === "herkennen") card.appendChild(h("p", { class: "sub" }, "wat betekent dit?"));
    if (it.src === "voc" && it.mode === "in context" && it.hintEn) card.appendChild(h("p", { class: "sub en" }, it.hintEn));
    if (!it.cue && it.en && it.t !== "mc" && it.src !== "voc") card.appendChild(h("p", { class: "sub en" }, it.en));
    if (it.note) card.appendChild(h("p", { class: "sub" }, it.note));

    card.appendChild(inputFor(it));
    stage.appendChild(card);

    if (answered) stage.appendChild(feedback(it));
    else if (run.n < 3) stage.appendChild(h("p", { class: "keys" }, "typ je antwoord · Enter"));
  }

  function label(it) {
    if (it.src === "voc") return it.cat.toLowerCase();
    var t = E.topicsById[it.topic];
    return (t ? t.title.replace(/ —.*/, "") : it.topic).toLowerCase();
  }

  /* ---------------- invoer per soort ---------------- */
  var inputs = [], picked = [];

  function inputFor(it) {
    var wrap = h("div", { class: "in" + (answered ? " done" : "") });
    inputs = [];

    if (it.t === "mc" || it.t === "jn" || it.t === "vocmc") {
      var opts = it.t === "jn" ? ["goed", "fout"]
        : it.t === "vocmc" ? (it.__opts || (it.__opts = E.shuffle([it.a].concat(E.vocDistractors(it, 3)))))
        : it.o;
      opts.forEach(function (o, i) {
        var cls = "opt";
        if (answered) {
          if (G.norm(o) === G.norm(it.a)) cls += " goed";
          else if (o === given) cls += " mis";
        }
        wrap.appendChild(h("button", { class: cls, onclick: function () { submit(o); } },
          h("kbd", null, String(i + 1)), h("span", { html: fmt(o) })));
      });
      cur.__keys = function (e) {
        var n = parseInt(e.key, 10);
        if (!answered && n >= 1 && n <= opts.length) { submit(opts[n - 1]); return true; }
      };
      return wrap;
    }

    if (it.t === "order") {
      if (!answered) {
        var pool = it.__pool || (it.__pool = E.shuffle(it.o.slice()));
        var line = h("div", { class: "regel" });
        var bank = h("div", { class: "bank" });
        function teken() {
          clear(line); clear(bank);
          picked.forEach(function (c, i) {
            line.appendChild(h("button", { class: "blok op", onclick: function () { picked.splice(i, 1); teken(); } }, c));
          });
          if (!picked.length) line.appendChild(h("span", { class: "sub" }, "klik de blokjes in volgorde"));
          var telling = {};
          picked.forEach(function (c) { telling[c] = (telling[c] || 0) + 1; });
          var gebruikt = {};
          pool.forEach(function (c) {
            gebruikt[c] = (gebruikt[c] || 0) + 1;
            if ((telling[c] || 0) >= gebruikt[c]) return;
            bank.appendChild(h("button", { class: "blok", onclick: function () { picked.push(c); teken(); } }, c));
          });
        }
        teken();
        wrap.appendChild(line); wrap.appendChild(bank);
        cur.__keys = function (e) {
          if (e.key === "Enter" && !answered) { submit(picked.join(" ")); return true; }
        };
      } else {
        wrap.appendChild(h("div", { class: "regel" }, h("span", { class: "jouw" }, given || "—")));
      }
      return wrap;
    }

    /* invullen */
    var gaten = it.multi ? it.multi.length : 1;
    for (var i = 0; i < gaten; i++) {
      var inp = h("input", { class: "veld", type: "text", autocomplete: "off", autocapitalize: "off",
        autocorrect: "off", spellcheck: "false", placeholder: gaten > 1 ? "gat " + (i + 1) : "" });
      if (answered) { inp.value = (given || "").split("|")[i] || ""; inp.disabled = true; }
      inputs.push(inp); wrap.appendChild(inp);
    }
    if (!answered) setTimeout(function () { if (inputs[0]) inputs[0].focus(); }, 0);
    cur.__keys = function (e) {
      if (e.key === "Enter" && !answered) {
        submit(inputs.map(function (x) { return x.value; }).join("|"));
        return true;
      }
    };
    return wrap;
  }

  /* ---------------- nakijken ---------------- */
  function judge(it, val) {
    if (it.multi) {
      var deel = String(val == null ? "" : val).split("|"), verw = it.a.split("|");
      var alles = true, opm = [];
      verw.forEach(function (e, i) {
        var r = G.check(deel[i] || "", [e]);
        if (!r.ok) alles = false;
        if (r.note) opm.push(r.note);
      });
      return { ok: alles, expect: verw.join(" … "), note: opm.join(" ") };
    }
    var r = G.check(val, [it.a].concat(it.acc || []));
    return { ok: r.ok, near: r.near, note: r.note, expect: it.a };
  }

  function submit(val) {
    if (answered || !cur) return;
    answered = true; given = val;
    res = judge(cur, val);
    S.grade(cur.id, res.ok, 2, { topic: cur.topic, kind: cur.src });
    run.n++;
    if (res.ok) { run.ok++; run.rij++; if (run.rij > run.best) run.best = run.rij; }
    else {
      run.rij = 0;
      if (!requeued[cur.id]) {                     // fout? binnen een paar vragen terug
        requeued[cur.id] = 1;
        queue.splice(Math.min(queue.length, 3), 0, cur);
      }
    }
    paint();
  }

  function feedback(it) {
    var fb = h("div", { class: "fb " + (res.ok ? "goed" : "mis") });
    var kop = h("div", { class: "fbkop" },
      h("b", null, res.ok ? (res.near ? "goed — bijna letterlijk" : "goed") : "nee"),
      !res.ok || res.near ? h("span", { class: "opl" }, String(res.expect).replace(/\|/g, " … ")) : null,
      ear(String(res.expect).replace(/\|/g, " ")));
    fb.appendChild(kop);
    if (res.note) fb.appendChild(h("p", { class: "sub" }, res.note));
    if (it.w) fb.appendChild(h("p", { class: "waarom", html: fmt(it.w) }));
    if (it.src === "voc" && it.xn) {
      fb.appendChild(h("p", { class: "vb" }, h("i", null, it.xn), it.xe ? h("small", null, " " + it.xe) : null, ear(it.xn)));
    }

    var rij = h("div", { class: "fbrij" },
      h("button", { class: "btn primair", onclick: next }, "verder  ⏎"));
    if (!res.ok) {
      rij.appendChild(h("button", { class: "btn", onclick: function () {
        S.grade(it.id, true, 2, { topic: it.topic, kind: it.src, redo: true });
        res.ok = true; run.ok++; paint();
      } }, "toch goed"));
    }
    if (it.src !== "voc" && E.topicsById[it.topic]) {
      rij.appendChild(h("button", { class: "btn stil", onclick: function () { toonMeer(it); } }, "meer  ␣"));
      rij.appendChild(h("button", { class: "btn stil", onclick: function () {
        filter.topic = it.topic; queue = []; next();
      } }, "alleen dit oefenen"));
    }
    fb.appendChild(rij);
    return fb;
  }

  /* ---------------- uitleg op verzoek (geen aparte pagina) ---------------- */
  function toonMeer(it) {
    var t = E.topicsById[it.topic];
    if (!t) return;
    var oud = stage.querySelector(".meer");
    if (oud) { oud.remove(); return; }
    var box = h("div", { class: "meer" });
    box.appendChild(h("p", { class: "kern" }, t.kern));
    box.appendChild(h("ul", null, t.tips.map(function (x) { return h("li", { html: fmt(x) }); })));
    box.appendChild(h("h4", null, "valkuilen"));
    box.appendChild(h("ul", { class: "val" }, t.val.map(function (x) { return h("li", { html: fmt(x) }); })));
    if (t.map) {
      var kaart = h("div", { class: "kaart" });
      box.appendChild(kaart);
      setTimeout(function () { M.tree(kaart, t.map); }, 10);
    }
    var ref = window.OK_REFERENCE[t.id];
    if (ref) {
      box.appendChild(h("details", { class: "ref" }, h("summary", null, "volledige uitleg"),
        h("div", { class: "refbody hoofdstuk", html: ref.h })));
    }
    stage.appendChild(box);
    box.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  /* ---------------- pauze: cijfers en knoppen, geen menu ---------------- */
  function pause() {
    paused = true;
    var d = S.state().days[S.today()] || { n: 0, ok: 0 };
    var o = E.overview();
    var box = h("div", { class: "pauze" });
    var kaart = h("div", { class: "card breed" });

    kaart.appendChild(h("div", { class: "cijfers" },
      cijfer(d.n, "vandaag"), cijfer(d.n ? Math.round(d.ok / d.n * 100) + "%" : "—", "goed"),
      cijfer(S.streak(), "dagen op rij"), cijfer(o.due, "staat open")));

    /* zwakste onderwerpen — als oefenknop, niet als link */
    var zwak = window.OK_TOPICS.map(function (t) { return { t: t, s: E.topicStats(t.id) }; })
      .filter(function (x) { return x.s.seen > 3; })
      .sort(function (a, b) { return a.s.mastery - b.s.mastery; }).slice(0, 5);
    if (zwak.length) {
      kaart.appendChild(h("h4", null, "zakt het snelst weg — klik om er alleen dát te oefenen"));
      var rij = h("div", { class: "zwak" });
      zwak.forEach(function (x) {
        rij.appendChild(h("button", { class: "btn", onclick: function () {
          filter.topic = x.t.id; queue = []; paused = false; box.remove(); next();
        } }, x.t.title.replace(/ —.*/, ""), h("small", null, " " + Math.round(x.s.mastery * 100) + "%")));
      });
      kaart.appendChild(rij);
    }

    /* waar oefen je uit */
    kaart.appendChild(h("h4", null, "waaruit"));
    var bron = h("div", { class: "zwak" },
      keuze("alles", null), keuze("alleen grammatica", "gram"), keuze("alleen woorden", "voc"));
    kaart.appendChild(bron);
    function keuze(naam, v) {
      return h("button", { class: "btn" + (filter.src === v ? " aan" : ""), onclick: function () {
        filter.src = v; queue = []; paused = false; box.remove(); next();
      } }, naam);
    }

    /* niveaus */
    kaart.appendChild(h("h4", null, "niveaus"));
    var niv = h("div", { class: "zwak" });
    ["A1", "A2", "B1", "B2"].forEach(function (l) {
      var b = h("button", { class: "btn" + (S.settings().levels[l] ? " aan" : ""), onclick: function () {
        S.settings().levels[l] = !S.settings().levels[l]; S.save(true);
        b.className = "btn" + (S.settings().levels[l] ? " aan" : ""); queue = [];
      } }, l);
      niv.appendChild(b);
    });
    niv.appendChild(h("button", { class: "btn" + (S.settings().vocabBonus ? " aan" : ""), onclick: function (e) {
      S.settings().vocabBonus = !S.settings().vocabBonus; S.save(true);
      e.target.className = "btn" + (S.settings().vocabBonus ? " aan" : ""); queue = [];
    } }, "C1-woorden"));
    kaart.appendChild(niv);

    /* gegevens */
    var data = h("div", { class: "zwak klein" },
      h("button", { class: "btn stil", onclick: function () {
        var a = h("a", { href: URL.createObjectURL(new Blob([S.exportJSON()], { type: "application/json" })),
          download: "oefenkamer-voortgang.json" });
        document.body.appendChild(a); a.click(); a.remove();
      } }, "exporteer"),
      h("button", { class: "btn stil", onclick: function () { bestand.click(); } }, "importeer"));
    var bestand = h("input", { type: "file", accept: ".json", style: "display:none", onchange: function () {
      var f = bestand.files[0]; if (!f) return;
      var fr = new FileReader();
      fr.onload = function () { try { S.importJSON(fr.result); queue = []; box.remove(); paused = false; next(); } catch (e) { alert(e.message); } };
      fr.readAsText(f);
    } });
    data.appendChild(bestand);
    kaart.appendChild(data);

    if (!S.persistent()) kaart.appendChild(h("p", { class: "waarschuwing" },
      "Deze browser bewaart niets — je voortgang verdwijnt als je het tabblad sluit."));

    kaart.appendChild(h("div", { class: "fbrij" },
      h("button", { class: "btn primair", onclick: function () { paused = false; box.remove(); if (inputs[0]) inputs[0].focus(); } }, "verder  ⏎")));

    box.appendChild(kaart);
    box.addEventListener("click", function (e) { if (e.target === box) { paused = false; box.remove(); } });
    root.appendChild(box);
  }

  function cijfer(v, l) { return h("div", { class: "cijfer" }, h("b", null, String(v)), h("span", null, l)); }

  /* ---------------- toetsenbord ---------------- */
  function onKey(e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (paused) {
      if (e.key === "Escape" || e.key === "Enter") {
        var b = root.querySelector(".pauze"); if (b) b.remove();
        paused = false; e.preventDefault();
      }
      return;
    }
    if (e.key === "Escape") { pause(); e.preventDefault(); return; }
    if (answered) {
      if (e.key === "Enter") { next(); e.preventDefault(); return; }
      if (e.key === " " && cur && cur.src !== "voc") { toonMeer(cur); e.preventDefault(); return; }
      return;
    }
    if (cur && cur.__keys && cur.__keys(e)) { e.preventDefault(); }
  }

  function boot() {
    root = document.getElementById("app");
    bar = h("div", { class: "balk" });
    stage = h("div", { class: "stage" });
    root.appendChild(bar); root.appendChild(stage);
    document.addEventListener("keydown", onKey);
    if (window.speechSynthesis) speechSynthesis.onvoiceschanged = function () { tried = false; };
    next();
  }

  return { boot: boot };
})();
