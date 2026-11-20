/* De lus. Je opent het bestand en je bent bezig; er valt niets te kiezen.
 *
 * Een cyclus draait om één tekst:
 *   lezen of gaten vullen  ->  begrijpen of zelf schrijven  ->  snelvuur
 * en dan de volgende tekst. Teksten komen dagen later kaler terug.
 */
window.T_APP = (function () {
  var G = window.T_GEHEUGEN, TK = window.T_TEKST;
  var wortel, balk, veld;
  var rest = [], nu = null, gepauzeerd = false;
  var zitting = { rondes: 0, start: Date.now() };

  /* ---------------- dom ---------------- */
  function h(tag, at) {
    var e = document.createElement(tag), i, k;
    if (at) for (k in at) {
      if (!Object.prototype.hasOwnProperty.call(at, k)) continue;
      var v = at[k];
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
  function leeg(e) { while (e.firstChild) e.removeChild(e.firstChild); }
  function norm(s) { return TK.normaliseer(s); }

  /* ---------------- welke tekst is aan de beurt ---------------- */
  function toegestaan(t) {
    var v = G.voorkeur().niveaus;
    return v[t.niveau] !== false;
  }
  var NIEUW_PER_DAG = 4;

  function nieuweVandaag() {
    var dag = G.vandaag(), n = 0, T = G.staat().teksten;
    for (var id in T) if (T[id].eerst === dag) n++;
    return n;
  }

  /* Eerst wat vervallen is. Pas als er niets openstaat een nieuwe tekst, en
     hooguit een paar per dag — anders lees je alles op één avond en heb je
     nergens iets aan teruggehaald. Zit je aan dat plafond, dan komt de tekst
     die het dichtst bij zijn beurt is gewoon wat vroeger terug. */
  function kiesTekst() {
    var alles = window.T_TEKSTEN.filter(toegestaan), tijd = Date.now();
    var open = alles.filter(function (t) {
      var s = G.staat().teksten[t.id];
      return s && s.keer > 0 && s.due <= tijd;
    }).sort(function (a, b) { return G.staat().teksten[a.id].due - G.staat().teksten[b.id].due; });
    if (open.length) return open[0];

    if (nieuweVandaag() < NIEUW_PER_DAG) {
      var vers = alles.filter(function (t) {
        var s = G.staat().teksten[t.id];
        return !s || !s.keer;
      });
      if (vers.length) {
        G.tekst(vers[0].id).eerst = G.vandaag();
        G.bewaar();
        return vers[0];
      }
    }
    var bezig = alles.filter(function (t) {
      var s = G.staat().teksten[t.id];
      return s && s.keer > 0;
    }).sort(function (a, b) { return G.staat().teksten[a.id].due - G.staat().teksten[b.id].due; });
    if (bezig.length) return bezig[0];
    return alles[0] || null;
  }

  function bouwCyclus() {
    var t = kiesTekst();
    if (!t) return [{ soort: "snelvuur" }];
    var st = G.tekst(t.id);
    var rij = [];
    if (st.s === 0) rij.push({ soort: "lezen", t: t });
    else rij.push({ soort: "gaten", t: t, slijtage: st.s });
    rij.push(st.s % 2 === 0 ? { soort: "vragen", t: t } : { soort: "schrijf", t: t });
    rij.push({ soort: "snelvuur", uit: t });
    return rij;
  }

  function verder() {
    if (!rest.length) rest = bouwCyclus();
    nu = rest.shift();
    zitting.rondes++;
    teken();
  }

  /* ---------------- bovenbalk ---------------- */
  function tekenBalk() {
    leeg(balk);
    var d = G.staat().dagen[G.vandaag()] || { n: 0, goed: 0 };
    var doel = 60, deel = Math.min(1, d.n / doel);
    balk.appendChild(h("div", { class: "voortgang" }, h("i", { style: "width:" + (deel * 100) + "%" })));
    balk.appendChild(h("div", { class: "balkrij" },
      h("span", { class: "tel" }, d.n + " vandaag"),
      G.reeks() > 1 ? h("span", { class: "reeks" }, G.reeks() + " dagen op rij") : null,
      h("span", { class: "rek" }),
      nu && nu.t ? h("span", { class: "waar" }, nu.t.titel) : null,
      h("button", { class: "menu", title: "pauze · esc", onclick: pauze }, "≡")));
  }

  /* ---------------- ronde tekenen ---------------- */
  function teken() {
    tekenBalk();
    leeg(veld);
    if (!nu) return;
    if (nu.soort === "lezen") return rondeLezen(nu.t);
    if (nu.soort === "gaten") return rondeGaten(nu.t, nu.slijtage);
    if (nu.soort === "vragen") return rondeVragen(nu.t);
    if (nu.soort === "schrijf") return rondeSchrijf(nu.t);
    return rondeSnelvuur(nu.uit);
  }

  /* ---------------- 1. lezen ---------------- */
  function rondeLezen(t) {
    var kaart = h("div", { class: "blad" });
    kaart.appendChild(h("div", { class: "etiket" },
      h("span", null, t.soort + " · " + t.niveau),
      h("span", { class: "rek" }),
      h("span", { class: "zacht" }, "klik een woord dat je niet kent")));
    kaart.appendChild(h("h1", null, t.titel));

    var doos = h("div", { class: "lees" });
    TK.toon(doos, t.tekst, {
      slijtage: 0,
      opWoord: function (w, el) { toonBetekenis(w, el, t); }
    });
    kaart.appendChild(doos);

    var gist = h("p", { class: "gist", style: "display:none" }, t.gist);
    kaart.appendChild(gist);
    kaart.appendChild(h("div", { class: "rij" },
      h("button", { class: "knop hoofd", onclick: gelezen }, "ik heb het gelezen  ⏎"),
      h("button", { class: "knop stil", onclick: function () {
        gist.style.display = gist.style.display === "none" ? "block" : "none";
      } }, "waar gaat het over?")));
    kaart.appendChild(h("p", { class: "voet" },
      "Lees één keer aandachtig. Deze tekst komt straks terug met gaten erin — dat terughalen doet het werk, niet het herlezen."));
    veld.appendChild(kaart);
    G.tekst(t.id);                                   // aanmaken zodat hij bestaat

    function gelezen() {
      G.tel(true);
      G.tekstKlaar(t.id, []);                        // slijtage 0 -> 1, over tien minuten terug
      (t.woorden || []).forEach(function (p) {       // de doelwoorden gaan mee in de planning
        var k = "w:" + norm(p[0]);
        if (G.nieuw(k)) G.ding(k);
      });
      verder();
    }
  }

  function toonBetekenis(woord, el, t) {
    var w = norm(woord);
    var uit = (t.woorden || []).filter(function (p) {
      var n = norm(p[0]).replace(/^(de|het) /, "");
      return n === w || w.indexOf(n) === 0 || n.indexOf(w) === 0;
    })[0];
    if (!uit) {
      var b = (window.T_WOORDEN || []).filter(function (x) {
        var n = norm(x.nl).replace(/^(de|het) /, "");
        return n === w;
      })[0];
      if (b) uit = [b.nl, b.en];
    }
    el.classList.add("gemarkeerd");
    G.staat().onbekend[w] = { en: uit ? uit[1] : null, op: Date.now() };
    G.bewaar();
    var oud = veld.querySelector(".ballon");
    if (oud) oud.remove();
    var ballon = h("span", { class: "ballon" }, uit ? uit[1] : "— staat niet in de lijst, noteer hem zelf —");
    el.appendChild(ballon);
    setTimeout(function () { if (ballon.parentNode) ballon.remove(); }, 2600);
  }

  /* ---------------- 2. gaten ---------------- */
  function rondeGaten(t, slijtage) {
    var kaart = h("div", { class: "blad" });
    kaart.appendChild(h("div", { class: "etiket" },
      h("span", null, "terughalen · ronde " + slijtage + " van 4"),
      h("span", { class: "rek" }),
      h("span", { class: "zacht" }, "Tab = één letter · Enter = geef op")));
    kaart.appendChild(h("h1", null, t.titel));

    if (slijtage >= 4) kaart.appendChild(h("p", { class: "gist zicht" }, t.gist));

    var doos = h("div", { class: "lees" });
    kaart.appendChild(doos);
    var uitslag = h("div", { class: "uitslag" });
    kaart.appendChild(uitslag);
    veld.appendChild(kaart);

    var w = TK.toon(doos, t.tekst, {
      slijtage: slijtage,
      beginletter: slijtage >= 3,
      zaad: t.id.charCodeAt(1) + t.id.charCodeAt(2),
      opKlaar: function (rap) {
        rap.geholpen.forEach(function (x) { G.scoor("g:" + t.id + ":" + x, false); G.tel(false); });
        rap.weggegeven.forEach(function (x) { G.scoor("g:" + t.id + ":" + x, false); G.tel(false); });
        var zelf = rap.totaal - rap.geholpen.length - rap.weggegeven.length;
        for (var i = 0; i < zelf; i++) G.tel(true);
        G.tekstKlaar(t.id, rap.geholpen.concat(rap.weggegeven));

        var beste = G.staat().records.gaten[t.id];
        if (!beste || rap.sec < beste) G.staat().records.gaten[t.id] = rap.sec;
        G.bewaar(true);

        leeg(uitslag);
        uitslag.appendChild(h("p", { class: "score" },
          h("b", null, zelf + " van " + rap.totaal + " zelf"),
          h("span", null, " · " + rap.sec + " seconden"),
          beste && rap.sec >= beste ? h("span", { class: "zacht" }, " · je beste was " + beste + "s") : null));
        if (rap.geholpen.length || rap.weggegeven.length) {
          uitslag.appendChild(h("p", { class: "zacht" },
            "nog niet paraat: " + rap.geholpen.concat(rap.weggegeven).join(", ") +
            " — die komen zo terug in het snelvuur"));
          rap.geholpen.concat(rap.weggegeven).forEach(function (x) { zetVoorSnelvuur(t, x); });
        }
        uitslag.appendChild(h("div", { class: "rij" },
          h("button", { class: "knop hoofd", onclick: verder }, "verder  ⏎")));
        uitslag.querySelector(".knop").focus();
      }
    });
    if (!w.aantal) verder();
  }

  var extraSnelvuur = [];
  function zetVoorSnelvuur(t, woord) {
    var p = (t.woorden || []).filter(function (x) {
      return norm(x[0]).replace(/^(de|het) /, "") === norm(woord);
    })[0];
    extraSnelvuur.push({ sleutel: "w:" + norm(woord), vraag: p ? p[1] : "uit « " + t.titel + " »",
      antwoord: woord, bron: t.titel });
  }

  /* ---------------- 3. begripsvragen ---------------- */
  function rondeVragen(t) {
    var i = 0;
    var kaart = h("div", { class: "blad" });
    veld.appendChild(kaart);

    function stel() {
      leeg(kaart);
      if (i >= t.vragen.length) { verder(); return; }
      var v = t.vragen[i];
      kaart.appendChild(h("div", { class: "etiket" },
        h("span", null, "begrepen? · vraag " + (i + 1) + " van " + t.vragen.length),
        h("span", { class: "rek" }),
        h("span", { class: "zacht" }, t.titel)));
      kaart.appendChild(h("p", { class: "vraag" }, v.v));
      var inp = h("input", { class: "antwoordveld", type: "text", placeholder: "in je eigen woorden…",
        autocomplete: "off", spellcheck: "false" });
      kaart.appendChild(inp);
      var uit = h("div", { class: "uitslag" });
      kaart.appendChild(uit);
      var af = false;
      function kijk() {
        if (af) return; af = true;
        var mijn = norm(inp.value);
        var goed = v.sleutel.some(function (s) { return mijn.indexOf(norm(s)) >= 0; });
        G.scoor("v:" + t.id + ":" + i, goed); G.tel(goed);
        inp.disabled = true;
        inp.className = "antwoordveld " + (goed ? "goed" : "mis");
        uit.appendChild(h("p", { class: goed ? "oordeel goed" : "oordeel mis" },
          goed ? "ja, dat staat er" : "dat is het niet helemaal"));
        uit.appendChild(h("p", { class: "modelzin" }, v.a));
        var kn = h("button", { class: "knop hoofd", onclick: function () { i++; stel(); } }, "verder  ⏎");
        uit.appendChild(h("div", { class: "rij" }, kn));
        kn.focus();
      }
      inp.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); kijk(); } });
      setTimeout(function () { inp.focus(); }, 40);
    }
    stel();
  }

  /* ---------------- 4. zelf schrijven ---------------- */
  function rondeSchrijf(t) {
    var kaart = h("div", { class: "blad" });
    kaart.appendChild(h("div", { class: "etiket" },
      h("span", null, "zelf formuleren"), h("span", { class: "rek" }), h("span", { class: "zacht" }, t.titel)));
    kaart.appendChild(h("p", { class: "vraag" }, t.schrijf.op));
    var ta = h("textarea", { class: "schrijfveld", rows: 3, placeholder: "één zin volstaat…" });
    kaart.appendChild(ta);
    var uit = h("div", { class: "uitslag" });
    kaart.appendChild(uit);

    var kn = h("button", { class: "knop hoofd", onclick: toon }, "laat de modelzin zien  ⏎");
    kaart.appendChild(h("div", { class: "rij" }, kn));
    veld.appendChild(kaart);
    setTimeout(function () { ta.focus(); }, 40);

    function toon() {
      if (uit.firstChild) return;
      G.staat().schrijfsels.push({ t: t.id, mijn: ta.value.trim(), op: Date.now() });
      G.tel(true); G.bewaar(true);
      ta.disabled = true; kn.remove();
      uit.appendChild(h("p", { class: "zacht" }, "een mogelijke formulering:"));
      uit.appendChild(h("p", { class: "modelzin" }, t.schrijf.model));
      if (t.focus) uit.appendChild(h("p", { class: "focus" }, t.focus));
      var door = h("button", { class: "knop hoofd", onclick: verder }, "verder  ⏎");
      uit.appendChild(h("div", { class: "rij" }, door));
      door.focus();
    }
    kaart.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); toon(); }
    });
  }

  /* ---------------- 5. snelvuur ---------------- */
  function bouwSnelvuur(uitTekst) {
    var lijst = [], gezien = {};
    function voegtoe(x) {
      if (!x || gezien[x.sleutel]) return;
      gezien[x.sleutel] = 1; lijst.push(x);
    }
    /* eerst wat je net niet wist */
    extraSnelvuur.splice(0, 6).forEach(voegtoe);
    /* dan de woorden uit de tekst die je net las */
    if (uitTekst) (uitTekst.woorden || []).forEach(function (p) {
      voegtoe({ sleutel: "w:" + norm(p[0]), vraag: p[1], antwoord: p[0].replace(/^(de|het) /, ""),
        lid: /^(de|het) /.test(p[0]) ? p[0].split(" ")[0] : null });
    });
    /* dan wat vervallen is */
    var W = (window.T_WOORDEN || []).filter(function (w) {
      return G.voorkeur().extra || !w.x;
    });
    var open = [], vers = [];
    W.forEach(function (w) {
      var k = "w:" + norm(w.nl);
      if (G.open(k)) open.push(w); else if (G.nieuw(k)) vers.push(w);
    });
    schud(open); schud(vers);
    open.slice(0, 25).forEach(function (w) {
      voegtoe({ sleutel: "w:" + norm(w.nl), vraag: w.en, antwoord: w.nl.replace(/^(de|het) /, ""), zin: w.z });
    });
    /* vormen: werkwoorden en vaste voorzetsels */
    var V = window.T_VORMEN;
    var vormen = [];
    V.verbs.forEach(function (v) {
      if (v[8]) return;
      vormen.push({ sleutel: "f:ovt:" + v[0], vraag: v[0] + " → ovt (ik)", antwoord: v[2], zacht: v[6] });
      vormen.push({ sleutel: "f:vd:" + v[0], vraag: v[0] + " → voltooid deelwoord", antwoord: v[4], zacht: v[6] });
    });
    V.prep.forEach(function (p) {
      vormen.push({ sleutel: "f:vz:" + p[0], vraag: p[0] + " + ?", antwoord: p[1], zacht: p[3] });
    });
    var vOpen = vormen.filter(function (x) { return G.open(x.sleutel); });
    var vNieuw = vormen.filter(function (x) { return G.nieuw(x.sleutel); });
    schud(vOpen); schud(vNieuw);
    vOpen.slice(0, 15).forEach(voegtoe);
    vers.slice(0, 10).forEach(function (w) {
      voegtoe({ sleutel: "w:" + norm(w.nl), vraag: w.en, antwoord: w.nl.replace(/^(de|het) /, ""), zin: w.z });
    });
    vNieuw.slice(0, 10).forEach(voegtoe);
    schud(lijst);
    return lijst;
  }
  function schud(a) {
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }

  function rondeSnelvuur(uitTekst) {
    var lijst = bouwSnelvuur(uitTekst);
    var tempo = G.voorkeur().tempo || 45;
    var i = 0, goed = 0, fout = 0, gemist = [];
    var start = Date.now(), gestopt = false;

    var kaart = h("div", { class: "blad snel" });
    var klok = h("div", { class: "klok" }, h("i", null));
    var teller = h("div", { class: "snelteller" }, "0");
    var vak = h("div", { class: "snelvak" });
    kaart.appendChild(h("div", { class: "etiket" },
      h("span", null, "snelvuur · " + tempo + " seconden"),
      h("span", { class: "rek" }),
      h("span", { class: "zacht" }, "typ — het springt vanzelf door")));
    kaart.appendChild(klok);
    kaart.appendChild(vak);
    kaart.appendChild(teller);
    veld.appendChild(kaart);

    var tik = setInterval(function () {
      var over = tempo - (Date.now() - start) / 1000;
      klok.firstChild.style.width = Math.max(0, over / tempo * 100) + "%";
      if (over <= 0) stop();
    }, 100);

    function volgende() {
      if (gestopt) return;
      leeg(vak);
      if (i >= lijst.length) { stop(); return; }
      var x = lijst[i];
      vak.appendChild(h("p", { class: "snelvraag" }, x.vraag));
      if (x.lid) vak.appendChild(h("p", { class: "zacht" }, "(zonder lidwoord)"));
      var inp = h("input", { class: "snelveld", type: "text", autocomplete: "off",
        autocapitalize: "off", autocorrect: "off", spellcheck: "false" });
      vak.appendChild(inp);
      var af = false;
      inp.addEventListener("input", function () {
        if (af) return;
        if (norm(inp.value) === norm(x.antwoord)) {
          af = true; goed++; i++;
          G.scoor(x.sleutel, true, true); G.tel(true);
          inp.classList.add("raak"); teller.textContent = String(goed);
          setTimeout(volgende, 180);
        }
      });
      inp.addEventListener("keydown", function (e) {
        if (e.key !== "Enter" || af) return;
        e.preventDefault();
        af = true; fout++; i++;
        gemist.push(x);
        G.scoor(x.sleutel, false); G.tel(false);
        inp.classList.add("naast");
        vak.appendChild(h("p", { class: "snelantwoord" }, x.antwoord, x.zacht ? h("small", null, " · " + x.zacht) : null));
        setTimeout(volgende, 900);
      });
      setTimeout(function () { inp.focus(); }, 20);
    }

    function stop() {
      if (gestopt) return;
      gestopt = true; clearInterval(tik);
      leeg(vak); klok.remove(); teller.remove();
      var record = G.staat().records.snelvuur || 0;
      if (goed > record) { G.staat().records.snelvuur = goed; G.bewaar(true); }
      vak.appendChild(h("p", { class: "score" },
        h("b", null, goed + " goed"), h("span", null, " · " + fout + " gemist"),
        goed > record ? h("span", { class: "record" }, " nieuw record") :
          record ? h("span", { class: "zacht" }, " · record " + record) : null));
      if (gemist.length) {
        var ul = h("ul", { class: "gemist" });
        gemist.slice(0, 8).forEach(function (x) {
          ul.appendChild(h("li", null, h("b", null, x.antwoord), " — ", x.vraag));
        });
        vak.appendChild(ul);
      }
      var kn = h("button", { class: "knop hoofd", onclick: verder }, "verder  ⏎");
      vak.appendChild(h("div", { class: "rij" }, kn));
      kn.focus();
    }
    volgende();
  }

  /* ---------------- pauze ---------------- */
  function pauze() {
    if (gepauzeerd) return;
    gepauzeerd = true;
    var d = G.staat().dagen[G.vandaag()] || { n: 0, goed: 0 };
    var doos = h("div", { class: "schaduw" });
    var k = h("div", { class: "blad" });

    k.appendChild(h("div", { class: "cijfers" },
      cijfer(d.n, "vandaag"), cijfer(d.n ? Math.round(d.goed / d.n * 100) + "%" : "—", "goed"),
      cijfer(G.reeks(), "dagen op rij"), cijfer(G.staat().records.snelvuur || 0, "snelvuurrecord")));

    /* teksten en hun slijtage */
    var rij = h("div", { class: "tekstlijst" });
    window.T_TEKSTEN.forEach(function (t) {
      var s = G.staat().teksten[t.id];
      var trap = s ? s.s : 0;
      var pun = h("span", { class: "trap" });
      for (var i = 0; i < 5; i++) pun.appendChild(h("i", { class: i < trap ? "aan" : "" }));
      rij.appendChild(h("div", { class: "tr" }, pun, h("span", null, t.titel),
        h("small", null, s && s.due > Date.now() ? " terug " + datum(s.due) : (s && s.keer ? " staat open" : " nog niet gelezen"))));
    });
    k.appendChild(h("h3", null, "teksten"));
    k.appendChild(rij);

    k.appendChild(h("h3", null, "instellingen"));
    var kn = h("div", { class: "rij" });
    ["B1", "B2"].forEach(function (n) {
      var b = h("button", { class: "knop" + (G.voorkeur().niveaus[n] !== false ? " aan" : ""), onclick: function () {
        G.voorkeur().niveaus[n] = G.voorkeur().niveaus[n] === false; G.bewaar(true);
        b.className = "knop" + (G.voorkeur().niveaus[n] !== false ? " aan" : "");
      } }, n);
      kn.appendChild(b);
    });
    var be = h("button", { class: "knop" + (G.voorkeur().extra ? " aan" : ""), onclick: function () {
      G.voorkeur().extra = !G.voorkeur().extra; G.bewaar(true);
      be.className = "knop" + (G.voorkeur().extra ? " aan" : "");
    } }, "ook C1-woorden");
    kn.appendChild(be);
    [30, 45, 60, 90].forEach(function (s) {
      var b = h("button", { class: "knop" + (G.voorkeur().tempo === s ? " aan" : ""), onclick: function () {
        G.voorkeur().tempo = s; G.bewaar(true);
        Array.prototype.forEach.call(kn.querySelectorAll(".tempoknop"), function (x) { x.className = "knop tempoknop"; });
        b.className = "knop tempoknop aan";
      } }, s + "s");
      b.classList.add("tempoknop");
      kn.appendChild(b);
    });
    k.appendChild(kn);

    var gg = h("div", { class: "rij" },
      h("button", { class: "knop stil", onclick: function () {
        var a = h("a", { href: URL.createObjectURL(new Blob([G.uitvoer()], { type: "application/json" })),
          download: "terughalen-voortgang.json" });
        document.body.appendChild(a); a.click(); a.remove();
      } }, "exporteer"),
      h("button", { class: "knop stil", onclick: function () { best.click(); } }, "importeer"));
    var best = h("input", { type: "file", accept: ".json", style: "display:none", onchange: function () {
      var f = best.files[0]; if (!f) return;
      var fr = new FileReader();
      fr.onload = function () {
        try { G.invoer(fr.result); doos.remove(); gepauzeerd = false; rest = []; verder(); }
        catch (e) { alert(e.message); }
      };
      fr.readAsText(f);
    } });
    gg.appendChild(best);
    k.appendChild(gg);
    if (!G.bewaart()) k.appendChild(h("p", { class: "let" },
      "Deze browser bewaart niets op deze pagina — exporteer voor je afsluit."));

    k.appendChild(h("div", { class: "rij" },
      h("button", { class: "knop hoofd", onclick: sluit }, "verder  ⏎")));
    function sluit() { doos.remove(); gepauzeerd = false; }
    doos.addEventListener("click", function (e) { if (e.target === doos) sluit(); });
    doos.appendChild(k);
    wortel.appendChild(doos);
  }
  function cijfer(v, l) { return h("div", { class: "cijfer" }, h("b", null, String(v)), h("span", null, l)); }
  function datum(ms) {
    var d = new Date(ms), nu = new Date();
    var dagen = Math.round((d - nu) / 86400000);
    if (dagen <= 0) return "vandaag";
    if (dagen === 1) return "morgen";
    return "over " + dagen + " dagen";
  }

  /* ---------------- toetsen ---------------- */
  function toets(e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (gepauzeerd) {
      if (e.key === "Escape" || e.key === "Enter") {
        var s = wortel.querySelector(".schaduw"); if (s) s.remove();
        gepauzeerd = false; e.preventDefault();
      }
      return;
    }
    if (e.key === "Escape") { pauze(); e.preventDefault(); return; }
    if (e.key === "Enter") {
      var doel = document.activeElement;
      if (doel && /^(INPUT|TEXTAREA)$/.test(doel.tagName)) return;   // die regelen zichzelf
      var kn = veld.querySelector(".knop.hoofd");
      if (kn) { kn.click(); e.preventDefault(); }
    }
  }

  function start() {
    wortel = document.getElementById("app");
    balk = h("div", { class: "balk" });
    veld = h("div", { class: "veld" });
    wortel.appendChild(balk); wortel.appendChild(veld);
    document.addEventListener("keydown", toets);
    verder();
  }

  return { start: start };
})();
