/* De tekst zelf: ontleden, gaten prikken, en de gaten laten dichtgroeien.
 *
 * Het idee: je typt en het woord springt op zijn plaats zodra het klopt. Geen
 * knop, geen nakijken achteraf. Fout blijft rood staan tot je het hebt, Tab
 * geeft je één letter, Enter geeft het antwoord weg. De alinea staat aan het
 * eind weer heel op je scherm — dat beeld is de beloning.
 */
window.T_TEKST = (function () {

  /* ---------- ontleden ---------- */
  /* Levert een lijst brokken: {t:"vast", s:"..."} of {t:"gat", s:"woord", rang:1|2} */
  function ontleed(rauw) {
    var brokken = [], i = 0, n = rauw.length;
    var buffer = "";
    function spoel() { if (buffer) { brokken.push({ t: "vast", s: buffer }); buffer = ""; } }
    while (i < n) {
      if (rauw[i] === "[" && rauw[i + 1] === "[") {
        var e = rauw.indexOf("]]", i + 2);
        if (e < 0) { buffer += rauw[i++]; continue; }
        spoel(); brokken.push({ t: "gat", s: rauw.slice(i + 2, e), rang: 1 });
        i = e + 2; continue;
      }
      if (rauw[i] === "[") {
        var e2 = rauw.indexOf("]", i + 1);
        if (e2 < 0) { buffer += rauw[i++]; continue; }
        spoel(); brokken.push({ t: "gat", s: rauw.slice(i + 1, e2), rang: 2 });
        i = e2 + 1; continue;
      }
      buffer += rauw[i++];
    }
    spoel();
    return brokken;
  }

  function kaal(rauw) { return rauw.replace(/\[\[|\]\]|\[|\]/g, ""); }

  /* ---------- welke gaten staan open bij welke slijtage ---------- */
  /* 1: de helft van de eerste orde · 2: alle eerste orde · 3: + tweede orde
     4: alles, en je krijgt alleen de beginletter */
  function kiesGaten(brokken, slijtage, zaad) {
    var eerste = [], tweede = [], i;
    for (i = 0; i < brokken.length; i++) {
      if (brokken[i].t !== "gat") continue;
      (brokken[i].rang === 1 ? eerste : tweede).push(i);
    }
    var uit = {};
    function neem(lijst, hoeveel) {
      // stabiel door de tekst heen, maar niet altijd dezelfde helft
      var stap = zaad % Math.max(1, lijst.length);
      for (var k = 0; k < hoeveel && k < lijst.length; k++) uit[lijst[(k + stap) % lijst.length]] = 1;
    }
    if (slijtage <= 1) neem(eerste, Math.ceil(eerste.length / 2));
    else if (slijtage === 2) neem(eerste, eerste.length);
    else { neem(eerste, eerste.length); neem(tweede, tweede.length); }
    return uit;
  }

  function normaliseer(s) {
    return (s || "").toString().toLowerCase()
      .replace(/[’ʼ]/g, "'").replace(/\s+/g, " ").trim();
  }
  function ontdaan(s) { return normaliseer(s).normalize("NFD").replace(/[̀-ͯ]/g, ""); }

  /* ---------- het scherm ---------- */
  /* opties: {slijtage, beginletter, opKlaar(rapport), opWoord(woord)} */
  function toon(doel, ruweTekst, opties) {
    opties = opties || {};
    var brokken = ontleed(ruweTekst);
    var zaad = (opties.zaad || 0) + (opties.slijtage || 0) * 3;
    var open = opties.slijtage > 0 ? kiesGaten(brokken, opties.slijtage, zaad) : {};
    var velden = [], geholpen = [], weggegeven = [], begonnen = Date.now();
    var totaal = 0;

    var alinea = document.createElement("div");
    alinea.className = "tekst" + (opties.slijtage > 0 ? " metgaten" : "");

    brokken.forEach(function (br, idx) {
      if (br.t === "vast" || !open[idx]) {
        var woord = br.t === "gat" ? br.s : br.s;
        alinea.appendChild(schrijfVast(woord, opties));
        return;
      }
      totaal++;
      alinea.appendChild(maakGat(br.s, velden.length));
    });

    function schrijfVast(s, o) {
      var frag = document.createDocumentFragment();
      // regeleindes bewaren, en losse woorden aanklikbaar maken voor de vertaling
      s.split(/(\n)/).forEach(function (stuk) {
        if (stuk === "\n") { frag.appendChild(document.createElement("br")); return; }
        if (!stuk) return;
        if (!o.opWoord) { frag.appendChild(document.createTextNode(stuk)); return; }
        stuk.split(/(\s+)/).forEach(function (w) {
          if (!w) return;
          if (/^\s+$/.test(w)) { frag.appendChild(document.createTextNode(w)); return; }
          var sp = document.createElement("span");
          sp.className = "w"; sp.textContent = w;
          sp.addEventListener("click", function () { o.opWoord(w.replace(/[.,!?;:—"'()]/g, ""), sp); });
          frag.appendChild(sp);
        });
      });
      return frag;
    }

    function maakGat(antwoord, i) {
      var houder = document.createElement("span");
      houder.className = "gat";
      var inp = document.createElement("input");
      inp.type = "text";
      inp.className = "gatveld";
      inp.setAttribute("autocomplete", "off");
      inp.setAttribute("autocapitalize", "off");
      inp.setAttribute("autocorrect", "off");
      inp.setAttribute("spellcheck", "false");
      inp.style.width = breedte(antwoord);
      if (opties.beginletter) inp.placeholder = antwoord[0] + "…";
      inp.dataset.antwoord = antwoord;

      var hulp = 0;                              // aantal onthulde letters
      var vast = false;

      inp.addEventListener("input", function () {
        if (vast) return;
        var w = normaliseer(inp.value), a = normaliseer(antwoord);
        if (w === a || ontdaan(inp.value) === ontdaan(antwoord)) { zetVast(true); return; }
        inp.classList.toggle("mis", w.length >= a.length);
        inp.classList.toggle("bezig", w.length > 0 && a.indexOf(w) === 0);
      });

      inp.addEventListener("keydown", function (e) {
        if (vast) return;
        if (e.key === "Tab" && !e.shiftKey) {     // één letter erbij
          e.preventDefault();
          hulp = Math.min(antwoord.length, Math.max(hulp, inp.value.length) + 1);
          inp.value = antwoord.slice(0, hulp);
          if (geholpen.indexOf(antwoord) < 0) geholpen.push(antwoord);
          if (normaliseer(inp.value) === normaliseer(antwoord)) zetVast(false);
          else { inp.classList.add("bezig"); inp.classList.remove("mis"); }
          return;
        }
        if (e.key === "Enter") {                  // geef het maar weg
          e.preventDefault();
          if (normaliseer(inp.value) === normaliseer(antwoord)) { zetVast(true); return; }
          weggegeven.push(antwoord);
          inp.value = antwoord;
          zetVast(false);
        }
      });

      function zetVast(zelf) {
        if (vast) return;
        vast = true;
        var sp = document.createElement("span");
        sp.className = "hersteld" + (zelf ? "" : " hulp");
        sp.textContent = antwoord;
        houder.replaceChild(sp, inp);
        setTimeout(function () { sp.classList.add("rustig"); }, 420);
        volgende(i);
        klaarAls();
      }

      houder.appendChild(inp);
      velden.push({ inp: inp, antwoord: antwoord, houder: houder, isVast: function () { return vast; } });
      return houder;
    }

    function volgende(i) {
      for (var k = i + 1; k < velden.length; k++) {
        if (!velden[k].isVast()) { velden[k].inp.focus(); return; }
      }
      for (var j = 0; j < i; j++) {
        if (!velden[j].isVast()) { velden[j].inp.focus(); return; }
      }
    }

    var afgerond = false;
    function klaarAls() {
      if (afgerond) return;
      for (var i = 0; i < velden.length; i++) if (!velden[i].isVast()) return;
      afgerond = true;
      var sec = Math.round((Date.now() - begonnen) / 1000);
      if (opties.opKlaar) setTimeout(function () {
        opties.opKlaar({ totaal: totaal, geholpen: geholpen, weggegeven: weggegeven, sec: sec });
      }, 500);
    }

    doel.appendChild(alinea);
    if (velden.length) setTimeout(function () { velden[0].inp.focus(); }, 60);
    else if (opties.opKlaar) setTimeout(function () {
      opties.opKlaar({ totaal: 0, geholpen: [], weggegeven: [], sec: 0 });
    }, 0);

    return {
      focus: function () { for (var i = 0; i < velden.length; i++) if (!velden[i].isVast()) { velden[i].inp.focus(); return; } },
      aantal: totaal
    };
  }

  /* breedte van een invulvak: iets ruimer dan het woord, zodat de regel niet springt */
  function breedte(w) {
    return Math.max(3.2, w.length * 0.62 + 1.1) + "ch";
  }

  return { ontleed: ontleed, kaal: kaal, toon: toon, normaliseer: normaliseer, kiesGaten: kiesGaten };
})();
