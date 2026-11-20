/* De schil: navigatie, schermen en de oefenloop.
 *
 * De volgorde in elk hoofdstuk is bewust: eerst ophalen, dan pas lezen.
 * Wie eerst de uitleg leest, herkent alles en denkt dat hij het kan.
 */
window.OK_UI = (function () {
  var S = window.OK_STORE, E = window.OK_ENGINE, G = window.OK_GRADE, M = window.OK_MAP;
  var view, nav;

  /* ---------------- kleine DOM-hulpjes ---------------- */
  function h(tag, attrs) {
    var e = document.createElement(tag), i, k, c;
    if (attrs) for (k in attrs) {
      if (!Object.prototype.hasOwnProperty.call(attrs, k)) continue;
      var v = attrs[k];
      if (v == null || v === false) continue;
      if (k === "class") e.className = v;
      else if (k === "html") e.innerHTML = v;
      else if (k === "text") e.textContent = v;
      else if (k.slice(0, 2) === "on" && typeof v === "function") e.addEventListener(k.slice(2), v);
      else e.setAttribute(k, v === true ? "" : v);
    }
    for (i = 2; i < arguments.length; i++) {
      c = arguments[i];
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
  function pct(x) { return Math.round(x * 100) + "%"; }
  function clear(e) { while (e.firstChild) e.removeChild(e.firstChild); }
  function go(hash) { location.hash = hash; }

  /* markeert ___ als invulplek en zet **vet** om */
  function fmt(s) {
    return esc(s)
      .replace(/&lt;(\/?)(b|i|em|strong|code|br)&gt;/g, "<$1$2>")   // eigen opmaak toelaten
      .replace(/___/g, '<span class="gapmark">_____</span>')
      .replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");
  }

  /* ---------------- spraak (optioneel, offline stem van het systeem) ------- */
  var voice = null, voiceTried = false;
  function pickVoice() {
    if (voiceTried || !window.speechSynthesis) return voice;
    voiceTried = true;
    var vs = speechSynthesis.getVoices() || [];
    voice = vs.filter(function (v) { return /^nl/i.test(v.lang); })[0] || null;
    return voice;
  }
  function speak(txt) {
    if (!window.speechSynthesis) return;
    pickVoice();
    var u = new SpeechSynthesisUtterance(String(txt).replace(/_+/g, " ... "));
    u.lang = "nl-NL"; if (voice) u.voice = voice; u.rate = 0.95;
    speechSynthesis.cancel(); speechSynthesis.speak(u);
  }
  function speakBtn(txt) {
    if (!window.speechSynthesis) return null;
    return h("button", { class: "iconbtn", title: "Voorlezen", onclick: function (e) { e.stopPropagation(); speak(txt); } }, "🔊");
  }

  /* =========================================================
     Navigatie
     ========================================================= */
  var ROUTES = [
    ["#/", "Vandaag"],
    ["#/grammatica", "Grammatica"],
    ["#/woorden", "Woorden"],
    ["#/kaart", "Kaart"],
    ["#/voortgang", "Voortgang"],
    ["#/help", "Methode"]
  ];

  function renderNav() {
    clear(nav);
    var cur = location.hash || "#/";
    ROUTES.forEach(function (r) {
      var active = cur === r[0] || (r[0] !== "#/" && cur.indexOf(r[0]) === 0);
      nav.appendChild(h("a", { href: r[0], class: "navlink" + (active ? " on" : "") }, r[1]));
    });
  }

  /* =========================================================
     Scherm: Vandaag
     ========================================================= */
  function viewDashboard() {
    var o = E.overview(), st = S.streak();
    var box = h("div", { class: "wrap" });

    box.appendChild(h("section", { class: "hero" },
      h("div", null,
        h("h1", null, "Wat kun je nu ophalen?"),
        h("p", { class: "lead" },
          "Niet herlezen — proberen. Elke vraag die je met moeite beantwoordt, zet steviger vast dan een bladzijde die je drie keer leest.")
      ),
      h("div", { class: "herostats" },
        stat(o.due, "te herhalen"),
        stat(st, st === 1 ? "dag op rij" : "dagen op rij"),
        stat(o.seen, "items in omloop"),
        stat(o.total - o.seen, "nog nieuw")
      )
    ));

    var actions = h("div", { class: "actions" });
    actions.appendChild(bigBtn("Herhaalronde", o.due ? o.due + " items staan open" : "niets open — kies gemengd",
      "#/sessie?mode=herhalen&n=" + Math.min(30, Math.max(10, o.due)), o.due > 0));
    actions.appendChild(bigBtn("Gemengde sessie", "20 vragen door elkaar — grammatica én woorden", "#/sessie?mode=gemengd&n=20", true));
    actions.appendChild(bigBtn("Alleen grammatica", "15 vragen, A1 → B2 door elkaar", "#/sessie?mode=gemengd&src=gram&n=15"));
    actions.appendChild(bigBtn("Alleen woorden", "20 woorden, herkennen én produceren", "#/sessie?mode=gemengd&src=voc&n=20"));
    actions.appendChild(bigBtn("Zwakke plekken", "de items waar je blijft struikelen", "#/sessie?mode=zwak&n=15"));
    actions.appendChild(bigBtn("Toets", "25 vragen, feedback pas op het einde", "#/sessie?mode=toets&n=25"));
    box.appendChild(actions);

    /* zwakste hoofdstukken */
    var weak = window.OK_TOPICS.map(function (t) {
      var s = E.topicStats(t.id); return { t: t, s: s };
    }).filter(function (x) { return x.s.seen > 0; })
      .sort(function (a, b) { return a.s.mastery - b.s.mastery; }).slice(0, 6);

    if (weak.length) {
      var list = h("div", { class: "cardgrid" });
      weak.forEach(function (x) {
        list.appendChild(h("a", { class: "card mini", href: "#/grammatica/" + x.t.id },
          h("div", { class: "lvl" }, x.t.level),
          h("h4", null, x.t.title),
          bar(x.s.mastery),
          h("small", null, pct(x.s.mastery) + " ingesleten · " + x.s.due + " open")
        ));
      });
      box.appendChild(h("section", null, h("h2", null, "Zakt het snelst weg"), list));
    } else {
      box.appendChild(h("section", { class: "note" },
        h("p", null, "Nog geen geschiedenis. Begin met een gemengde sessie — de app leert vanzelf waar je zwak staat en plant dat vaker in.")));
    }

    box.appendChild(heatmap());

    if (!S.persistent()) {
      box.appendChild(h("div", { class: "warn" },
        "Deze browser bewaart niets op deze pagina (localStorage geblokkeerd). Je voortgang verdwijnt als je het tabblad sluit — exporteer bij Voortgang."));
    }
    return box;
  }

  function stat(n, label) {
    return h("div", { class: "stat" }, h("b", null, String(n)), h("span", null, label));
  }
  function bigBtn(title, sub, href, primary) {
    return h("a", { class: "bigbtn" + (primary ? " primary" : ""), href: href },
      h("strong", null, title), h("span", null, sub));
  }
  function bar(v) {
    return h("div", { class: "bar" }, h("i", { style: "width:" + Math.round(v * 100) + "%" }));
  }

  function heatmap() {
    var days = S.state().days, wrap = h("div", { class: "heat" });
    var d = new Date(); d.setHours(12, 0, 0, 0);
    var cells = [];
    for (var i = 83; i >= 0; i--) {
      var dd = new Date(d.getTime() - i * 86400000);
      var key = dd.getFullYear() + "-" + p2(dd.getMonth() + 1) + "-" + p2(dd.getDate());
      var v = days[key];
      var lvl = !v ? 0 : v.n >= 40 ? 4 : v.n >= 20 ? 3 : v.n >= 8 ? 2 : 1;
      cells.push(h("i", { class: "hc l" + lvl, title: key + (v ? " — " + v.n + " vragen, " + pct(v.ok / v.n) + " goed" : " — niets") }));
    }
    wrap.appendChild(h("div", { class: "heatgrid" }, cells));
    return h("section", null, h("h2", null, "Twaalf weken"), wrap,
      h("small", { class: "muted" }, "Spreiding verslaat volume: liever elke dag tien minuten dan één keer per week een uur."));
  }
  function p2(n) { return n < 10 ? "0" + n : "" + n; }

  /* =========================================================
     Scherm: Grammatica-overzicht
     ========================================================= */
  function viewGrammar() {
    var box = h("div", { class: "wrap" });
    box.appendChild(h("h1", null, "Grammatica A1 → B2"));
    box.appendChild(h("p", { class: "lead" },
      "38 hoofdstukken. Open er één en begin met de vragen — de uitleg staat eronder, niet erboven."));

    ["A1", "A2", "B1", "B2", "Bijlage"].forEach(function (lv) {
      var ts = window.OK_TOPICS.filter(function (t) { return t.level === lv; });
      if (!ts.length) return;
      var grid = h("div", { class: "cardgrid" });
      ts.forEach(function (t) {
        var s = E.topicStats(t.id);
        grid.appendChild(h("a", { class: "card", href: "#/grammatica/" + t.id },
          h("div", { class: "lvl" }, t.level + " · " + s.total + " vragen"),
          h("h4", null, t.title),
          h("p", { class: "kern" }, t.kern),
          bar(s.mastery),
          h("small", null, s.seen ? pct(s.mastery) + " ingesleten · " + s.due + " open" : "nog niet begonnen")
        ));
      });
      box.appendChild(h("section", null, h("h2", null, lv === "Bijlage" ? "Bijlages" : lv), grid));
    });
    return box;
  }

  /* =========================================================
     Scherm: één hoofdstuk
     ========================================================= */
  function viewTopic(id) {
    var t = E.topicsById[id];
    var box = h("div", { class: "wrap" });
    if (!t) { box.appendChild(h("p", null, "Onbekend hoofdstuk.")); return box; }
    var s = E.topicStats(id);

    box.appendChild(h("div", { class: "crumb" }, h("a", { href: "#/grammatica" }, "← alle hoofdstukken")));
    box.appendChild(h("h1", null, t.title));
    box.appendChild(h("p", { class: "kern big" }, t.kern));
    box.appendChild(h("div", { class: "rowbtns" },
      h("a", { class: "bigbtn primary", href: "#/sessie?mode=gemengd&topic=" + id + "&n=12" },
        h("strong", null, "Oefenen"), h("span", null, "12 vragen uit dit hoofdstuk")),
      h("a", { class: "bigbtn", href: "#/sessie?mode=herhalen&topic=" + id + "&n=15" },
        h("strong", null, "Herhalen"), h("span", null, s.due + " open van " + s.total)),
      h("a", { class: "bigbtn", href: "#/sessie?mode=nieuw&topic=" + id + "&n=12" },
        h("strong", null, "Nieuw materiaal"), h("span", null, (s.total - s.seen) + " nog niet gezien"))
    ));
    box.appendChild(bar(s.mastery));

    /* vrije reproductie vóór de uitleg */
    box.appendChild(recallBox(t));

    /* tips en valkuilen */
    var tips = h("div", { class: "twocol" },
      h("div", { class: "panel" }, h("h3", null, "Vuistregels"),
        h("ul", null, t.tips.map(function (x) { return h("li", { html: fmt(x) }); }))),
      h("div", { class: "panel warnpanel" }, h("h3", null, "Valkuilen"),
        h("ul", null, t.val.map(function (x) { return h("li", { html: fmt(x) }); })))
    );
    box.appendChild(h("section", null, tips));

    /* kaart */
    if (t.map) {
      var mapEl = h("div", { class: "mapbox" });
      box.appendChild(h("section", null, h("h2", null, "Kaart van dit hoofdstuk"), mapEl));
      setTimeout(function () { M.tree(mapEl, t.map); }, 20);
    }

    /* uitleg, ingeklapt: pas lezen ná het proberen */
    var ref = window.OK_REFERENCE[t.id];
    if (ref) {
      var det = h("details", { class: "ref" },
        h("summary", null, "Volledige uitleg (open pas na de vragen)"),
        h("div", { class: "refbody hoofdstuk", html: ref.h }));
      box.appendChild(det);
    }

    /* eigen aantekening */
    var note = h("textarea", { class: "note-area", rows: 3, placeholder: "Eigen aantekening — schrijf de regel in je eigen woorden op. Dat is elaboratie en het werkt." });
    note.value = S.state().notes[id] || "";
    note.addEventListener("input", function () { S.state().notes[id] = note.value; S.save(); });
    box.appendChild(h("section", null, h("h2", null, "Jouw formulering"), note));

    return box;
  }

  function recallBox(t) {
    var ta = h("textarea", { rows: 3, placeholder: "Schrijf op wat je nog weet — zonder terug te kijken." });
    ta.value = (S.state().recall[t.id] || {}).txt || "";
    var answers = h("div", { class: "recallanswers", style: "display:none" },
      h("ul", null, t.recall.map(function (q) { return h("li", null, q); })));
    var btn = h("button", { class: "btn", onclick: function () {
      answers.style.display = answers.style.display === "none" ? "block" : "none";
      btn.textContent = answers.style.display === "none" ? "Toon de controlevragen" : "Verberg";
    } }, "Toon de controlevragen");
    ta.addEventListener("input", function () {
      S.state().recall[t.id] = { txt: ta.value, at: Date.now() }; S.save();
    });
    return h("section", { class: "panel recall" },
      h("h3", null, "Eerst: wat weet je nog?"),
      h("p", { class: "muted" }, "Leeg je hoofd op papier vóór je iets leest. Wat je nu niet kunt ophalen, is precies wat je moet oefenen."),
      ta, btn, answers);
  }

  /* =========================================================
     Scherm: Woorden
     ========================================================= */
  function catStats(cat) {
    var items = E.pool({ src: "voc", cat: cat, all: true, levels: { A1: 1, A2: 1, B1: 1, B2: 1, C1: 1 } });
    var str = 0, seen = 0, due = 0, now = Date.now();
    items.forEach(function (it) {
      var r = S.state().items[it.id];
      if (r && r.seen) { seen++; str += S.strength(it.id); if (r.due <= now) due++; }
    });
    return { n: items.length, seen: seen, due: due, mastery: items.length ? str / items.length : 0 };
  }

  function categories() {
    var seen = {}, out = [];
    (window.OK_VOCAB || []).forEach(function (w) {
      if (w.b && !S.settings().vocabBonus) return;
      if (!seen[w.c]) { seen[w.c] = { cat: w.c, words: 0, lvl: w.l }; out.push(seen[w.c]); }
      seen[w.c].words++;
    });
    out.forEach(function (c) { var s = catStats(c.cat); c.n = c.words; c.mastery = s.mastery; c.due = s.due; c.seen = s.seen; });
    out.sort(function (a, b) { return b.n - a.n; });
    return out;
  }

  function viewVocab() {
    var box = h("div", { class: "wrap" });
    var words = (window.OK_VOCAB || []).filter(function (w) { return !w.b || S.settings().vocabBonus; });
    box.appendChild(h("h1", null, "Woorden"));
    box.appendChild(h("p", { class: "lead" },
      words.length + " woorden met voorbeeldzinnen. Elk woord komt in drie vormen terug: herkennen (NL→EN), produceren (EN→NL) en invullen in een zin."));

    box.appendChild(h("div", { class: "rowbtns" },
      h("a", { class: "bigbtn primary", href: "#/sessie?mode=gemengd&src=voc&n=20" },
        h("strong", null, "20 woorden"), h("span", null, "gemengd, met context")),
      h("a", { class: "bigbtn", href: "#/sessie?mode=herhalen&src=voc&n=30" },
        h("strong", null, "Herhalen"), h("span", null, E.overview().dueVoc + " open")),
      h("a", { class: "bigbtn", href: "#/sessie?mode=nieuw&src=voc&n=15" },
        h("strong", null, "Nieuwe woorden"), h("span", null, "15 die je nog nooit zag"))
    ));

    /* zoeken en bladeren */
    var results = h("div", { class: "wordlist" });
    var input = h("input", { class: "search", type: "search", placeholder: "Zoek een woord (Nederlands of Engels)…" });
    function search() {
      clear(results);
      var q = G.norm(input.value);
      if (q.length < 2) { results.appendChild(h("p", { class: "muted" }, "Typ minstens twee letters.")); return; }
      var hits = words.filter(function (w) {
        return G.norm(w.nl).indexOf(q) >= 0 || G.norm(w.en).indexOf(q) >= 0;
      }).slice(0, 60);
      if (!hits.length) { results.appendChild(h("p", { class: "muted" }, "Niets gevonden.")); return; }
      hits.forEach(function (w) { results.appendChild(wordRow(w)); });
    }
    input.addEventListener("input", search);
    box.appendChild(h("section", null, h("h2", null, "Opzoeken"), input, results));

    /* thema's */
    var cats = categories();
    var grid = h("div", { class: "cardgrid" });
    cats.forEach(function (c) {
      grid.appendChild(h("a", { class: "card mini", href: "#/woorden/" + encodeURIComponent(c.cat) },
        h("div", { class: "lvl" }, c.n + " woorden"),
        h("h4", null, c.cat),
        bar(c.mastery),
        h("small", null, c.seen ? pct(c.mastery) + " ingesleten · " + c.due + " open" : "nog niet begonnen")));
    });
    box.appendChild(h("section", null, h("h2", null, "Thema's"), grid));
    return box;
  }

  function wordRow(w) {
    return h("div", { class: "wrow" },
      h("div", null, h("b", null, w.nl), " ", speakBtn(w.nl), h("span", { class: "en" }, w.en)),
      w.xn ? h("div", { class: "ex" }, h("i", null, w.xn), speakBtn(w.xn), w.xe ? h("span", { class: "en" }, w.xe) : null) : null,
      h("div", { class: "tag" }, w.c + " · " + w.l));
  }

  function viewVocabCat(cat) {
    var box = h("div", { class: "wrap" });
    var words = (window.OK_VOCAB || []).filter(function (w) { return w.c === cat; });
    box.appendChild(h("div", { class: "crumb" }, h("a", { href: "#/woorden" }, "← alle thema's")));
    box.appendChild(h("h1", null, cat));
    var s = catStats(cat);
    box.appendChild(h("p", { class: "lead" }, words.length + " woorden · " + pct(s.mastery) + " ingesleten · " + s.due + " te herhalen"));
    box.appendChild(h("div", { class: "rowbtns" },
      h("a", { class: "bigbtn primary", href: "#/sessie?mode=gemengd&src=voc&cat=" + encodeURIComponent(cat) + "&n=15" },
        h("strong", null, "Oefen dit thema"), h("span", null, "15 vragen")),
      h("a", { class: "bigbtn", href: "#/sessie?mode=nieuw&src=voc&cat=" + encodeURIComponent(cat) + "&n=15" },
        h("strong", null, "Nieuwe woorden"), h("span", null, "eerst herkennen, dan produceren"))
    ));
    var list = h("div", { class: "wordlist" });
    words.forEach(function (w) { list.appendChild(wordRow(w)); });
    box.appendChild(h("details", { class: "ref" }, h("summary", null, "Toon de woordenlijst (kijk pas na het oefenen)"), list));
    return box;
  }

  /* =========================================================
     Scherm: Kaart
     ========================================================= */
  function viewMap() {
    var box = h("div", { class: "wrap" });
    box.appendChild(h("h1", null, "Kaart"));
    box.appendChild(h("p", { class: "lead" },
      "Kleur = hoe stevig het zit: grijs is onaangeroerd, rood wankel, groen ingesleten. Klik op een hoofdstuk om er meteen in te duiken. Scrollen zoomt."));
    var m1 = h("div", { class: "mapbox tall" });
    box.appendChild(h("section", null, h("h2", null, "Grammatica"), m1));
    var m2 = h("div", { class: "mapbox tall" });
    box.appendChild(h("section", null, h("h2", null, "Woordenschat per thema"), m2));
    setTimeout(function () {
      M.radial(m1, function (id) { go("#/grammatica/" + id); });
      M.bubbles(m2, categories(), function (cat) { go("#/woorden/" + encodeURIComponent(cat)); });
    }, 30);
    return box;
  }

  /* =========================================================
     Scherm: Voortgang
     ========================================================= */
  function viewProgress() {
    var box = h("div", { class: "wrap" });
    var o = E.overview(), cal = S.calibration();
    box.appendChild(h("h1", null, "Voortgang"));

    box.appendChild(h("div", { class: "herostats wide" },
      stat(o.seen, "items in omloop"), stat(o.due, "open"), stat(S.streak(), "dagen op rij"),
      stat(S.state().sessions.length, "sessies")
    ));

    /* kalibratie: dacht je het te weten? */
    var rows = [3, 2, 1].map(function (c) {
      var x = cal[c], label = { 3: "zeker", 2: "twijfel", 1: "gokje" }[c];
      var acc = x.n ? x.ok / x.n : 0;
      return h("div", { class: "calrow" },
        h("span", { class: "callabel" }, label),
        bar(acc),
        h("small", null, x.n ? pct(acc) + " goed van " + x.n : "nog geen data"));
    });
    box.appendChild(h("section", null, h("h2", null, "Klopt je gevoel?"),
      h("p", { class: "muted" }, "Je zekerheid tegenover je score. Als 'zeker' onder de 90% zit, herken je materiaal wel maar beheers je het niet — dat is de illusie waar Make It Stick voor waarschuwt."),
      h("div", { class: "cal" }, rows)));

    /* per niveau */
    var lv = h("div", { class: "cardgrid" });
    ["A1", "A2", "B1", "B2"].forEach(function (l) {
      var items = E.all().filter(function (i) { return i.level === l; });
      var str = 0, seen = 0;
      items.forEach(function (i) { var r = S.state().items[i.id]; if (r && r.seen) { seen++; str += S.strength(i.id); } });
      lv.appendChild(h("div", { class: "card mini" }, h("h4", null, l),
        bar(items.length ? str / items.length : 0),
        h("small", null, seen + " van " + items.length + " aangeraakt")));
    });
    box.appendChild(h("section", null, h("h2", null, "Per niveau"), lv));

    /* hardnekkig */
    var lee = E.leeches(15);
    if (lee.length) {
      var ul = h("ul", { class: "leech" });
      lee.forEach(function (x) {
        var it = E.byId(x.id);
        ul.appendChild(h("li", null,
          h("b", null, it ? (it.q || it.cue || x.id) : x.id),
          h("span", { class: "muted" }, " → " + (it ? [].concat(it.a).join(" / ") : "?")),
          h("small", null, " (" + x.r.lapse + "× fout)")));
      });
      box.appendChild(h("section", null, h("h2", null, "Hardnekkig"),
        h("p", { class: "muted" }, "Deze blijven terugkomen. Schrijf ze een keer met de hand uit — dat doorbreekt de blokkade sneller dan nog een herhaling."),
        ul,
        h("a", { class: "btn", href: "#/sessie?mode=zwak&n=15" }, "Oefen deze nu")));
    }

    box.appendChild(settingsPanel());
    box.appendChild(dataPanel());
    return box;
  }

  function settingsPanel() {
    var s = S.settings();
    var levelRow = h("div", { class: "chips" });
    ["A1", "A2", "B1", "B2"].forEach(function (l) {
      var b = h("button", { class: "chip" + (s.levels[l] ? " on" : ""), onclick: function () {
        s.levels[l] = !s.levels[l]; S.save(true); b.className = "chip" + (s.levels[l] ? " on" : "");
      } }, l);
      levelRow.appendChild(b);
    });
    var bonus = h("button", { class: "chip" + (s.vocabBonus ? " on" : ""), onclick: function () {
      s.vocabBonus = !s.vocabBonus; S.save(true); bonus.className = "chip" + (s.vocabBonus ? " on" : "");
    } }, "C1-woorden meenemen");

    var conf = h("select", { class: "sel", onchange: function () { s.askConf = conf.value; S.save(true); } },
      opt("soms", "soms (1 op 3)"), opt("altijd", "altijd"), opt("nooit", "nooit"));
    conf.value = s.askConf || "soms";

    var nw = h("input", { class: "num", type: "number", min: 0, max: 30, value: s.newPerSession,
      onchange: function () { s.newPerSession = Math.max(0, Math.min(30, +nw.value || 0)); S.save(true); } });

    var elab = h("button", { class: "chip" + (s.elaborate !== false ? " on" : ""), onclick: function () {
      s.elaborate = s.elaborate === false; S.save(true); elab.className = "chip" + (s.elaborate !== false ? " on" : "");
    } }, "om de zeven vragen");

    return h("section", { class: "panel" }, h("h3", null, "Instellingen"),
      h("div", { class: "setrow" }, h("label", null, "Niveaus in de sessies"), levelRow),
      h("div", { class: "setrow" }, h("label", null, "Vraag om uitleg in eigen woorden"), elab),
      h("div", { class: "setrow" }, h("label", null, "Woordenschat boven B2"), bonus),
      h("div", { class: "setrow" }, h("label", null, "Vraag hoe zeker je bent"), conf),
      h("div", { class: "setrow" }, h("label", null, "Nieuwe items per sessie"), nw));
  }
  function opt(v, t) { var o = h("option", { value: v }, t); return o; }

  function dataPanel() {
    var out = h("div", { class: "setrow" });
    var dl = h("button", { class: "btn", onclick: function () {
      var blob = new Blob([S.exportJSON()], { type: "application/json" });
      var a = h("a", { href: URL.createObjectURL(blob), download: "oefenkamer-voortgang.json" });
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
    } }, "Exporteer voortgang");
    var file = h("input", { type: "file", accept: ".json", style: "display:none", onchange: function () {
      var f = file.files[0]; if (!f) return;
      var fr = new FileReader();
      fr.onload = function () {
        try { S.importJSON(fr.result); alert("Voortgang geladen."); render(); }
        catch (e) { alert("Kon dit bestand niet lezen: " + e.message); }
      };
      fr.readAsText(f);
    } });
    var up = h("button", { class: "btn", onclick: function () { file.click(); } }, "Importeer");
    var rs = h("button", { class: "btn danger", onclick: function () {
      if (confirm("Alle voortgang wissen? Dit kan niet ongedaan gemaakt worden.")) { S.reset(); render(); }
    } }, "Wis alles");
    out.appendChild(dl); out.appendChild(up); out.appendChild(file); out.appendChild(rs);
    return h("section", { class: "panel" }, h("h3", null, "Gegevens"),
      h("p", { class: "muted" }, "Alles staat in deze browser. Exporteer af en toe — dan kun je op een andere machine verder."), out);
  }

  /* =========================================================
     Scherm: Methode
     ========================================================= */
  function viewHelp() {
    var box = h("div", { class: "wrap prose" });
    box.appendChild(h("h1", null, "Hoe deze oefenkamer werkt"));
    box.appendChild(h("p", null, "Deze app volgt een handvol principes uit <i>Make It Stick</i>. Ze voelen alle vijf onprettig — dat is het punt. Wat vlot gaat, blijft niet hangen."));
    var items = [
      ["Ophalen in plaats van herlezen", "Elk hoofdstuk begint met vragen. De uitleg staat ingeklapt eronder. Herlezen voelt productief en levert bijna niets op; iets uit je hoofd terughalen wel."],
      ["Eerst proberen, dan horen", "Je typt of kiest altijd eerst een antwoord, ook als je twijfelt. Een mislukte poging maakt de uitleg erna beter plakken dan diezelfde uitleg zonder poging."],
      ["Spreiden", "Items komen terug op groeiende intervallen: één dag, drie dagen, dan steeds langer. Fout? Dan komt het item nog in dezelfde zitting terug en begint het interval opnieuw."],
      ["Mengen", "Sessies springen bewust tussen hoofdstukken en tussen grammatica en woorden. Blokoefenen (twintig keer hetzelfde) voelt beter en werkt slechter."],
      ["Kalibreren", "Je geeft aan hoe zeker je was. Bij Voortgang zie je of dat gevoel klopte. 'Zeker' plus fout is het waardevolste signaal in de hele app."],
      ["Uitleggen", "Af en toe vraagt de app je om in één zin te zeggen waarom iets zo is. In eigen woorden formuleren (elaboratie) bindt nieuwe kennis aan wat je al weet."]
    ];
    var dl = h("div", { class: "cardgrid" });
    items.forEach(function (x) { dl.appendChild(h("div", { class: "card mini" }, h("h4", null, x[0]), h("p", null, x[1]))); });
    box.appendChild(dl);

    box.appendChild(h("h2", null, "Sneltoetsen"));
    box.appendChild(h("ul", null,
      h("li", null, h("kbd", null, "1"), "–", h("kbd", null, "4"), " kies een meerkeuzeantwoord"),
      h("li", null, h("kbd", null, "Enter"), " nakijken en daarna door naar de volgende"),
      h("li", null, h("kbd", null, "Esc"), " sessie afbreken")
    ));

    box.appendChild(h("h2", null, "Waar komt de inhoud vandaan?"));
    box.appendChild(h("p", null, "De uitleg per hoofdstuk komt uit je eigen <code>studiemateriaal/grammatica-overzicht.html</code>; de woordenlijsten uit de seeds van <code>studeerkamer</code>. De oefeningen en rijtjes zijn voor deze app geschreven. Draai <code>python3 build/build-data.py</code> als je de bronbestanden bijwerkt."));
    return box;
  }

  /* =========================================================
     De oefenloop
     ========================================================= */
  var run = null;

  function parseQuery(hash) {
    var q = {}, i = hash.indexOf("?");
    if (i < 0) return q;
    hash.slice(i + 1).split("&").forEach(function (p) {
      var kv = p.split("="); q[kv[0]] = decodeURIComponent(kv[1] || "");
    });
    return q;
  }

  function startSession(q, key) {
    var opts = {
      mode: q.mode || "gemengd", n: +q.n || 20,
      topic: q.topic || null, src: q.src || null, cat: q.cat || null
    };
    var queue;
    if (opts.mode === "zwak") {
      queue = E.leeches(opts.n).map(function (x) { return E.byId(x.id); }).filter(Boolean);
      if (queue.length < opts.n) {
        var extra = E.buildSession({ mode: "herhalen", n: opts.n - queue.length, topic: opts.topic, src: opts.src, cat: opts.cat });
        queue = queue.concat(extra);
      }
      queue = E.interleave(queue);
    } else if (opts.mode === "toets") {
      queue = E.buildSession({ mode: "gemengd", n: opts.n, topic: opts.topic, src: opts.src, cat: opts.cat });
    } else {
      queue = E.buildSession(opts);
    }
    run = {
      queue: queue, i: 0, mode: opts.mode, delayed: opts.mode === "toets",
      log: [], conf: [], started: Date.now(), requeued: {}, opts: opts,
      key: key || JSON.stringify(opts)
    };
  }

  function viewSession(q, key) {
    if (!run || run.key !== key) startSession(q, key);
    var box = h("div", { class: "wrap session" });
    if (!run.queue.length) {
      box.appendChild(h("h1", null, "Niets te doen"));
      box.appendChild(h("p", { class: "lead" }, "Er staat niets open met deze filters. Kies een andere sessie of zet meer niveaus aan bij Voortgang."));
      box.appendChild(h("a", { class: "btn", href: "#/" }, "Terug"));
      run = null;
      return box;
    }
    if (run.i >= run.queue.length) return sessionEnd(box);

    box.appendChild(sessionHeader());
    if (run.pendingElab) {
      box.appendChild(elaborateCard(run.pendingElab));
      return box;
    }
    box.appendChild(itemCard(run.queue[run.i]));
    return box;
  }

  function sessionHeader() {
    var p = run.i / run.queue.length;
    return h("div", { class: "shead" },
      h("div", { class: "bar big" }, h("i", { style: "width:" + Math.round(p * 100) + "%" })),
      h("div", { class: "sheadrow" },
        h("span", null, (run.i + 1) + " / " + run.queue.length),
        h("span", { class: "muted" }, run.mode === "toets" ? "toets — feedback op het einde" : "sessie"),
        h("button", { class: "linkbtn", onclick: function () {
          if (run.log.length && !confirm("Sessie afbreken? Je antwoorden tot nu toe zijn al bewaard.")) return;
          finishEarly();
        } }, "stoppen")));
  }

  function finishEarly() {
    run.queue = run.queue.slice(0, run.i);
    render();
  }

  function topicName(it) {
    if (it.src === "voc") return it.cat + " · " + it.mode;
    var t = E.topicsById[it.topic];
    return (t ? t.title : it.topic) + (it.kind && it.kind !== "grammatica" ? " · " + it.kind : "");
  }

  function itemCard(it) {
    var card = h("div", { class: "qcard" });
    var answered = false;
    var chosen = null;          // huidig antwoord
    var confRow = null;

    card.appendChild(h("div", { class: "qmeta" },
      h("span", { class: "lvl" }, it.level || ""),
      h("a", { class: "muted", href: it.src === "voc" ? "#/woorden/" + encodeURIComponent(it.cat) : "#/grammatica/" + it.topic },
        topicName(it))));

    if (it.inst) card.appendChild(h("p", { class: "inst" }, it.inst));

    /* ---- de vraag ---- */
    var body = h("div", { class: "qbody" });
    if (it.src === "voc") {
      if (it.mode === "produceren") {
        body.appendChild(h("p", { class: "prompt" }, h("span", { class: "en big" }, it.q)));
        body.appendChild(h("p", { class: "muted" }, "Schrijf het Nederlandse woord."));
      } else if (it.mode === "in context") {
        body.appendChild(h("p", { class: "prompt", html: fmt(it.q) }));
        if (it.hintEn) body.appendChild(h("p", { class: "muted en" }, it.hintEn));
      } else {
        body.appendChild(h("p", { class: "prompt" }, it.q, " ", speakBtn(it.q)));
        body.appendChild(h("p", { class: "muted" }, "Wat betekent dit?"));
      }
    } else {
      if (it.cue) {
        body.appendChild(h("p", { class: "cue" },
          h("b", null, it.cue), it.en ? h("span", { class: "en" }, " · " + it.en) : null,
          speakBtn(it.cue)));
      }
      body.appendChild(h("p", { class: "prompt", html: fmt(it.q) }));
      if (!it.cue && it.en && it.t !== "mc") body.appendChild(h("p", { class: "muted en" }, it.en));
      if (it.note) body.appendChild(h("p", { class: "muted" }, it.note));
    }
    card.appendChild(body);

    /* ---- de invoer ---- */
    var inputWrap = h("div", { class: "answers" });
    var inputs = [];
    var chunks = null;

    function submit(val) {
      if (answered) return;
      chosen = val;
      var ask = S.settings().askConf || "soms";
      var wants = ask === "altijd" || (ask === "soms" && (run.i % 3 === 1));
      if (wants) askConfidence(); else reveal(2);
    }

    function askConfidence() {
      inputWrap.classList.add("locked");
      confRow = h("div", { class: "confrow" },
        h("span", null, "Hoe zeker was je?"),
        cbtn("Gokje", 1), cbtn("Twijfel", 2), cbtn("Zeker", 3));
      card.appendChild(confRow);
      confRow.querySelectorAll("button")[1].focus();
    }
    function cbtn(label, v) {
      return h("button", { class: "btn conf c" + v, onclick: function () { reveal(v); } }, label);
    }

    function reveal(conf) {
      if (answered) return;
      answered = true;
      if (confRow) confRow.remove();
      inputWrap.classList.add("locked");

      var res = judge(it, chosen);
      S.grade(it.id, res.ok, conf, { topic: it.topic, kind: it.src });
      run.log.push({ id: it.id, ok: res.ok, conf: conf, item: it, given: chosen, res: res });
      run.conf.push([conf, res.ok]);

      /* fout? dan komt het item verderop in deze sessie terug */
      if (!res.ok && !run.requeued[it.id] && run.mode !== "toets") {
        run.requeued[it.id] = 1;
        var at = Math.min(run.queue.length, run.i + 4);
        run.queue.splice(at, 0, it);
      }

      if (run.delayed) { next(); return; }
      card.appendChild(feedback(it, res, conf));
      markInputs(res);
      var nb = card.querySelector(".nextbtn");
      if (nb) nb.focus();
    }

    function markInputs(res) {
      if (it.t === "mc" || it.t === "vocmc" || it.t === "jn") {
        Array.prototype.forEach.call(inputWrap.querySelectorAll("button"), function (b) {
          if (G.norm(b.dataset.val) === G.norm([].concat(res.expect)[0])) b.classList.add("good");
          else if (b.dataset.val === chosen) b.classList.add("bad");
        });
      }
    }

    function next() {
      run.i++;
      if (run.i > 0 && run.i % 7 === 0 && run.i < run.queue.length && S.settings().elaborate !== false) {
        run.pendingElab = it;
      }
      render(true);
    }

    /* per type */
    if (it.t === "mc" || it.t === "jn" || it.t === "vocmc") {
      var opts;
      if (it.t === "jn") opts = ["goed", "fout"];
      else if (it.t === "vocmc") {
        opts = E.shuffle([it.a].concat(E.vocDistractors(it, 3)));
      } else opts = it.o;
      opts.forEach(function (o, idx) {
        var b = h("button", { class: "opt", "data-val": o, onclick: function () { submit(o); } },
          h("kbd", null, String(idx + 1)), h("span", { html: fmt(o) }));
        inputWrap.appendChild(b);
      });
      card.__keys = function (e) {
        var n = parseInt(e.key, 10);
        if (n >= 1 && n <= opts.length && !answered) { submit(opts[n - 1]); return true; }
      };
    } else if (it.t === "order") {
      var picked = [], pool = E.shuffle(it.o.slice());
      var line = h("div", { class: "orderline" });
      var bank = h("div", { class: "orderbank" });
      function redraw() {
        clear(line); clear(bank);
        picked.forEach(function (c, i) {
          line.appendChild(h("button", { class: "chunk on", onclick: function () {
            if (answered) return; picked.splice(i, 1); redraw();
          } }, c));
        });
        if (!picked.length) line.appendChild(h("span", { class: "muted" }, "Klik de blokjes in de juiste volgorde."));
        pool.forEach(function (c, i) {
          if (picked.indexOf(c) >= 0 && picked.filter(function (x) { return x === c; }).length >= pool.filter(function (x) { return x === c; }).length) return;
          bank.appendChild(h("button", { class: "chunk", onclick: function () {
            if (answered) return; picked.push(c); redraw();
          } }, c));
        });
      }
      redraw();
      inputWrap.appendChild(line); inputWrap.appendChild(bank);
      inputWrap.appendChild(h("button", { class: "btn primary", onclick: function () { submit(picked.join(" ")); } }, "Nakijken"));
    } else {
      var gaps = it.multi ? it.multi.length : 1;
      var row = h("div", { class: "inputrow" });
      for (var gi = 0; gi < gaps; gi++) {
        var inp = h("input", { class: "answer", type: "text", autocomplete: "off",
          autocapitalize: "off", spellcheck: "false", placeholder: gaps > 1 ? "gat " + (gi + 1) : "jouw antwoord" });
        inputs.push(inp); row.appendChild(inp);
      }
      inputWrap.appendChild(row);
      inputWrap.appendChild(h("button", { class: "btn primary", onclick: function () {
        submit(inputs.map(function (x) { return x.value; }).join("|"));
      } }, "Nakijken"));
      setTimeout(function () { inputs[0].focus(); }, 10);
      card.__keys = function (e) {
        if (e.key === "Enter" && !answered) {
          submit(inputs.map(function (x) { return x.value; }).join("|"));
          return true;
        }
      };
    }
    card.appendChild(inputWrap);
    card.__next = function () {
      if (!answered) return false;
      next(); return true;
    };
    return card;
  }

  /* tussendoor: leg het in je eigen woorden uit (elaboratie) */
  function elaborateCard(it) {
    var t = E.topicsById[it.topic];
    var card = h("div", { class: "qcard elab" });
    card.appendChild(h("div", { class: "qmeta" }, h("span", { class: "lvl" }, "tussendoor"),
      h("span", { class: "muted" }, "elaboratie")));
    card.appendChild(h("p", { class: "prompt" },
      it.src === "voc"
        ? "Maak zelf een zin met \u201c" + it.nl + "\u201d."
        : "Leg in één zin uit waarom het antwoord hierboven klopt" + (t ? " (" + t.title + ")" : "") + "."));
    card.appendChild(h("p", { class: "muted" },
      "In je eigen woorden formuleren koppelt nieuwe kennis aan wat je al weet. Niemand kijkt dit na — het opschrijven is het werk."));
    var ta = h("textarea", { rows: 3, placeholder: "In je eigen woorden…" });
    card.appendChild(ta);
    card.appendChild(h("div", { class: "fbbtns" },
      h("button", { class: "btn primary nextbtn", onclick: function () {
        if (ta.value.trim()) {
          var key = it.topic || "algemeen";
          var prev = S.state().notes[key] || "";
          S.state().notes[key] = (prev ? prev + "\n" : "") + ta.value.trim();
          S.save(true);
        }
        run.pendingElab = null; render(true);
      } }, "Verder  ⏎"),
      h("button", { class: "btn ghost", onclick: function () { run.pendingElab = null; render(true); } }, "Overslaan")));
    card.__next = function () { run.pendingElab = null; render(true); return true; };
    setTimeout(function () { ta.focus(); }, 20);
    return card;
  }

  /* nakijken per type */
  function judge(it, given) {
    if (it.multi) {
      var parts = String(given == null ? "" : given).split("|");
      var exp = it.a.split("|");
      var allOK = true, notes = [];
      exp.forEach(function (e, i) {
        var r = G.check(parts[i] || "", [e]);
        if (!r.ok) allOK = false;
        if (r.note) notes.push(r.note);
      });
      return { ok: allOK, expect: exp.join(" … "), note: notes.join(" ") };
    }
    var accepted = [it.a].concat(it.acc || []);
    var r = G.check(given, accepted);
    return { ok: r.ok, near: r.near, note: r.note, expect: it.a };
  }

  function feedback(it, res, conf) {
    var fb = h("div", { class: "fb " + (res.ok ? "ok" : "no") });
    fb.appendChild(h("div", { class: "fbhead" },
      h("b", null, res.ok ? (res.near ? "Goed — bijna letterlijk" : "Goed") : "Niet juist"),
      !res.ok || res.near ? h("span", { class: "sol" }, [].concat(res.expect).join(" … ")) : null,
      it.src === "voc" || it.t !== "mc" ? speakBtn(String(res.expect).replace(/\|/g, " ")) : null
    ));
    if (res.note) fb.appendChild(h("p", { class: "muted" }, res.note));
    if (!res.ok && conf === 3) {
      fb.appendChild(h("p", { class: "illus" },
        "Je wist het zeker en het klopte niet — dat is het nuttigste signaal van vandaag. Dit item komt zo terug."));
    }
    if (it.w) fb.appendChild(h("p", { class: "why", html: fmt(it.w) }));
    if (it.src === "voc" && it.xn) {
      fb.appendChild(h("p", { class: "ex" }, h("i", null, it.xn), it.xe ? h("span", { class: "en" }, it.xe) : null));
    }

    var btns = h("div", { class: "fbbtns" },
      h("button", { class: "btn primary nextbtn", onclick: function () {
        var card = fb.closest(".qcard"); if (card && card.__next) card.__next();
      } }, "Volgende  ⏎"));

    if (!res.ok) {
      btns.appendChild(h("button", { class: "btn", onclick: function () {
        // je vond je antwoord toch goed: herstel de beoordeling
        var last = run.log[run.log.length - 1];
        if (last && !last.corrected) {
          last.corrected = true; last.ok = true;
          S.grade(it.id, true, conf, { topic: it.topic, kind: it.src, redo: true });
          fb.className = "fb ok";
        }
      } }, "Toch goed rekenen"));
    }
    var lnk = it.src === "voc" ? "#/woorden/" + encodeURIComponent(it.cat) : "#/grammatica/" + it.topic;
    btns.appendChild(h("a", { class: "btn ghost", href: lnk }, "Uitleg"));
    fb.appendChild(btns);
    return fb;
  }

  /* ---------------- einde van een sessie ---------------- */
  function sessionEnd(box) {
    var log = run.log, n = log.length;
    var ok = log.filter(function (x) { return x.ok; }).length;
    var dur = Math.round((Date.now() - run.started) / 1000);

    S.addSession({ at: Date.now(), n: n, ok: ok, mode: run.mode, sec: dur, conf: run.conf });

    box.appendChild(h("h1", null, "Klaar"));
    box.appendChild(h("div", { class: "herostats wide" },
      stat(n ? Math.round(ok / n * 100) + "%" : "—", "goed"),
      stat(ok + "/" + n, "vragen"),
      stat(Math.floor(dur / 60) + "m " + (dur % 60) + "s", "tijd"),
      stat(S.streak(), "dagen op rij")));

    /* kalibratie van deze sessie */
    var zeker = run.conf.filter(function (c) { return c[0] === 3; });
    if (zeker.length >= 3) {
      var zok = zeker.filter(function (c) { return c[1]; }).length;
      box.appendChild(h("p", { class: "lead" },
        "Je was " + zeker.length + " keer zeker en had " + zok + " keer gelijk" +
        (zok / zeker.length < 0.9 ? " — daar zit je blinde vlek." : " — je gevoel klopt.")));
    }

    /* fouten op een rij */
    var fout = log.filter(function (x) { return !x.ok; });
    if (fout.length) {
      var ul = h("div", { class: "reviewlist" });
      fout.forEach(function (x) {
        var vraag = x.item.q || (x.item.o ? x.item.o.join(" · ") : "") || x.item.cue || "";
        ul.appendChild(h("div", { class: "rev" },
          x.item.inst ? h("div", { class: "muted" }, x.item.inst) : null,
          h("div", { class: "revq", html: fmt(vraag) }),
          x.item.cue && x.item.q ? h("div", { class: "muted" }, x.item.cue) : null,
          h("div", null, h("span", { class: "bad" }, x.given || "(leeg)"), " → ",
            h("b", null, [].concat(x.res.expect).join(" … "))),
          x.item.w ? h("div", { class: "muted", html: fmt(x.item.w) }) : null));
      });
      box.appendChild(h("section", null, h("h2", null, "Wat misging (" + fout.length + ")"), ul));
    } else if (n) {
      box.appendChild(h("p", { class: "lead" }, "Alles juist. Volgende keer plant de app moeilijker of nieuwer materiaal in."));
    }

    /* reflectie */
    var ta = h("textarea", { rows: 3, placeholder: "Welke regel ga je morgen bewust toepassen? Waar bleef je haperen?" });
    var saveR = h("button", { class: "btn", onclick: function () {
      if (!ta.value.trim()) return;
      S.state().reflect.push({ at: Date.now(), txt: ta.value.trim(), mode: run.mode });
      S.save(true); saveR.textContent = "Bewaard";
    } }, "Bewaar");
    box.appendChild(h("section", { class: "panel" }, h("h3", null, "Reflectie"),
      h("p", { class: "muted" }, "Twee zinnen volstaan. Terugkijken hoort bij het ophalen — het is geen extraatje."),
      ta, saveR));

    var again = h("div", { class: "rowbtns" },
      h("a", { class: "bigbtn primary", href: "#/", onclick: function () { run = null; } },
        h("strong", null, "Terug naar Vandaag"), h("span", null, "kijk wat er nog openstaat")),
      h("button", { class: "bigbtn", onclick: function () {
        var o = run.opts, k = run.key; run = null;
        startSession({ mode: o.mode, n: o.n, topic: o.topic, src: o.src, cat: o.cat }, k);
        render(true);
      } }, h("strong", null, "Nog een ronde"), h("span", null, "zelfde instellingen")));
    box.appendChild(again);
    return box;
  }

  /* =========================================================
     Router
     ========================================================= */
  function render(keepRun) {
    var hash = location.hash || "#/";
    if (hash.indexOf("#/sessie") !== 0 && !keepRun) run = null;
    renderNav();
    clear(view);
    var base = hash.split("?")[0];
    var el;
    if (base === "#/" || base === "") el = viewDashboard();
    else if (base === "#/grammatica") el = viewGrammar();
    else if (base.indexOf("#/grammatica/") === 0) el = viewTopic(base.slice(13));
    else if (base === "#/woorden") el = viewVocab();
    else if (base.indexOf("#/woorden/") === 0) el = viewVocabCat(decodeURIComponent(base.slice(10)));
    else if (base === "#/kaart") el = viewMap();
    else if (base === "#/voortgang") el = viewProgress();
    else if (base === "#/help") el = viewHelp();
    else if (base === "#/sessie") el = viewSession(parseQuery(hash), hash);
    else el = viewDashboard();
    view.appendChild(el);
    if (!keepRun) window.scrollTo(0, 0);
  }

  function onKey(e) {
    if (location.hash.indexOf("#/sessie") !== 0) return;
    var card = view.querySelector(".qcard");
    if (!card) return;
    if (e.key === "Escape") { finishEarly(); return; }
    if (card.__keys && card.__keys(e)) { e.preventDefault(); return; }
    if (e.key === "Enter" && card.__next && card.__next()) { e.preventDefault(); }
  }

  function boot() {
    view = document.getElementById("view");
    nav = document.getElementById("nav");
    window.addEventListener("hashchange", function () { render(); });
    document.addEventListener("keydown", onKey);
    if (window.speechSynthesis) speechSynthesis.onvoiceschanged = function () { voiceTried = false; pickVoice(); };
    render();
  }

  return { boot: boot, render: render };
})();
