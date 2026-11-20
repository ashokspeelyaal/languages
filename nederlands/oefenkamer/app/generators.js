/* Automatische rijtjes-drills uit data/lexicon.js.
 *
 * Dit is bewust mechanisch materiaal: vervoegingen, lidwoorden, meervouden,
 * vaste voorzetsels. Precies het soort kennis dat als eerste wegzakt en dat
 * alleen terugkomt door ophalen, niet door herlezen.
 *
 * Elk item krijgt een stabiel id, zodat je voortgang bewaard blijft ook als de
 * lijsten later groeien.
 */
window.OK_GEN = (function () {
  var L = window.OK_LEX;

  // onregelmatige tegenwoordige tijd: [ik, jij (na inversie), hij]
  var TT_IRR = {
    zijn:    ["ben", "ben", "is"],
    hebben:  ["heb", "heb", "heeft"],
    kunnen:  ["kan", "kun", "kan"],
    mogen:   ["mag", "mag", "mag"],
    willen:  ["wil", "wil", "wil"],
    zullen:  ["zal", "zul", "zal"]
  };

  function derde(inf, stem) {
    if (TT_IRR[inf]) return TT_IRR[inf][2];
    if (/t$/.test(stem)) return stem;                 // zit -> zit, wacht -> wacht
    // korte stam op één losse klinker rekt: sta -> staat, ga -> gaat, sla -> slaat
    // (doe en zie niet: oe en ie zijn tweetekenklanken)
    if (/[^aeiou][aou]$/.test(stem)) return stem + stem.slice(-1) + "t";
    return stem + "t";
  }
  function jijNaInversie(inf, stem) {
    if (TT_IRR[inf]) return TT_IRR[inf][1];
    return stem;
  }

  function auxWoord(a) { return a === "z" ? "is" : a === "hz" ? "heeft/is" : "heeft"; }

  function shuffleDistract(correct, pool, n) {
    var out = [correct], i, c;
    var bag = pool.filter(function (x) { return x !== correct; });
    for (i = 0; i < bag.length && out.length < n; i++) {
      c = bag[(i * 7 + correct.length * 3) % bag.length];
      if (out.indexOf(c) < 0) out.push(c);
    }
    // deterministisch schudden op basis van het antwoord
    var seed = 0, k;
    for (k = 0; k < correct.length; k++) seed += correct.charCodeAt(k);
    for (k = out.length - 1; k > 0; k--) {
      var j = (seed + k * 13) % (k + 1), t = out[k]; out[k] = out[j]; out[j] = t;
    }
    return out;
  }

  var PREPS = ["aan", "op", "van", "voor", "in", "met", "over", "naar", "tot", "uit", "tegen", "om"];

  var RANK = { A1: 1, A2: 2, B1: 3, B2: 4, C1: 5 };
  function topicLevel(id) {
    var p = id.slice(0, 2).toUpperCase();
    return RANK[p] ? p : "B1";        // bijlages tellen als B1
  }
  /* Een rijtje uit een A1-werkwoord in een A2-hoofdstuk blijft A2-materiaal. */
  function lvl(verbLevel, topic) {
    var a = RANK[verbLevel] || 1, b = RANK[topicLevel(topic)] || 1;
    return a >= b ? verbLevel : topicLevel(topic);
  }

  function build() {
    var out = [];
    var i, v;

    /* --- tegenwoordige tijd --- */
    for (i = 0; i < L.verbs.length; i++) {
      v = L.verbs[i];
      if (v[8]) continue;                     // scheidbaar apart behandeld
      out.push({
        id: "g:tt3:" + v[0], topic: "a1-tt", level: lvl(v[7], "a1-tt"), kind: "rijtje", t: "cloze",
        q: "hij / zij ___", cue: v[0], en: v[6],
        a: derde(v[0], v[1]),
        w: TT_IRR[v[0]]
          ? "Onregelmatig: " + v[0] + " → ik " + TT_IRR[v[0]][0] + " · jij " + (v[0] === "hebben" ? "hebt" : TT_IRR[v[0]][1] + "t").replace("bent", "bent") + " · hij " + TT_IRR[v[0]][2] + "."
          : "Stam <b>" + v[1] + "</b> + t. Eindigt de stam al op -t, dan komt er geen tweede bij."
      });
      if (i % 2 === 0) {
        out.push({
          id: "g:ttj:" + v[0], topic: "a1-tt", level: lvl(v[7], "a1-tt"), kind: "rijtje", t: "cloze",
          q: "___ jij vandaag?", cue: v[0], en: v[6],
          a: jijNaInversie(v[0], v[1]),
          acc: TT_IRR[v[0]] ? [TT_IRR[v[0]][1], TT_IRR[v[0]][0]] : null,
          w: "Bij inversie verliest de jij-vorm de -t: jij " + derde(v[0], v[1]) + " → " + jijNaInversie(v[0], v[1]) + " jij?"
        });
      }
    }

    /* --- imperfectum --- */
    for (i = 0; i < L.verbs.length; i++) {
      v = L.verbs[i];
      if (v[2] === "—") continue;
      var sterk = v[3] !== v[2] + "n";
      out.push({
        id: "g:ovt:" + v[0], topic: sterk ? "bijlage-onregelmatig" : "a2-imperfectum",
        level: lvl(v[7], "a2"), kind: "rijtje", t: "cloze",
        q: "ovt enkelvoud — ik ___", cue: v[0], en: v[6],
        a: v[2],
        w: sterk ? "Sterk werkwoord: klinkerwisseling. " + v[0] + " · " + v[2] + " / " + v[3] + " · " + v[4]
                 : "Zwak: stam + " + (/te$/.test(v[2]) ? "-te ('t kofschip)" : "-de") + "."
      });
      if (sterk) {
        out.push({
          id: "g:ovtp:" + v[0], topic: "bijlage-onregelmatig", level: lvl(v[7], "a2"), kind: "rijtje", t: "cloze",
          q: "ovt meervoud — wij ___", cue: v[0], en: v[6], a: v[3],
          w: "Sterke werkwoorden hebben een eigen meervoud: " + v[2] + " → " + v[3] + "."
        });
      }
    }

    /* --- voltooid deelwoord + hulpwerkwoord --- */
    for (i = 0; i < L.verbs.length; i++) {
      v = L.verbs[i];
      if (v[4] === "—") continue;
      out.push({
        id: "g:vd:" + v[0], topic: v[8] ? "a2-scheidbaar" : "a2-perfectum", level: lvl(v[7], "a2"),
        kind: "rijtje", t: "cloze",
        q: "voltooid deelwoord — hij " + auxWoord(v[5]) + " ___", cue: v[0], en: v[6],
        a: v[4],
        w: v[8] ? "Scheidbaar: voorvoegsel + ge + stam → " + v[4] + "."
                : (/^ge/.test(v[4]) ? "Deelwoord met ge-: " + v[4] + "." : "Onbeklemtoond voorvoegsel (be-, ge-, her-, ont-, ver-, er-) → géén ge-.")
      });
      if (v[5] !== "hz" && i % 2 === 1) {
        out.push({
          id: "g:aux:" + v[0], topic: "a1-zijn-hebben", level: lvl(v[7], "a2"), kind: "rijtje", t: "mc",
          q: "Welk hulpwerkwoord bij <b>" + v[0] + "</b>?", cue: v[0], en: v[6],
          o: ["hebben", "zijn"], a: v[5] === "z" ? "zijn" : "hebben",
          w: v[5] === "z" ? "Verandering van plaats of toestand → zijn: hij is " + v[4] + "."
                          : "Standaard → hebben: hij heeft " + v[4] + "."
        });
      }
    }

    /* --- vaste voorzetsels --- */
    for (i = 0; i < L.prep.length; i++) {
      var p = L.prep[i];
      out.push({
        id: "g:vz:" + p[0].replace(/\s+/g, "_") + ":" + p[1],
        topic: "b2-vaste", level: "B2", kind: "vast voorzetsel", t: "cloze",
        q: p[2], cue: p[0], en: p[3], a: p[1],
        w: "<b>" + p[0] + " " + p[1] + "</b> — " + p[3] + ". Vaste combinatie: leer het paar, vertaal niet."
      });
      if (i % 3 === 0) {
        out.push({
          id: "g:vzm:" + p[0].replace(/\s+/g, "_"),
          topic: "bijlage-voorzetsel", level: "B2", kind: "vast voorzetsel", t: "mc",
          q: p[2], cue: p[0], en: p[3],
          o: shuffleDistract(p[1], PREPS, 4), a: p[1],
          w: "<b>" + p[0] + " " + p[1] + "</b> — " + p[3] + "."
        });
      }
    }

    /* --- de of het --- */
    for (i = 0; i < L.dehet.length; i++) {
      var d = L.dehet[i];
      out.push({
        id: "g:dh:" + d[0], topic: i % 2 ? "a1-lidwoorden" : "bijlage-dehet", level: "A1",
        kind: "lidwoord", t: "mc",
        q: "___ " + d[0], en: d[2], o: ["de", "het"], a: d[1],
        w: d[1] === "het"
          ? "<b>het " + d[0] + "</b> — onzijdig. Meervoud krijgt weer de."
          : "<b>de " + d[0] + "</b>."
      });
    }

    /* --- meervoud --- */
    var seenM = {};
    for (i = 0; i < L.plural.length; i++) {
      var m = L.plural[i];
      if (seenM[m[0]]) continue; seenM[m[0]] = 1;
      out.push({
        id: "g:mv:" + m[0], topic: "a1-meervoud", level: "A1", kind: "meervoud", t: "cloze",
        q: "meervoud van ___", cue: m[0], en: m[2], a: m[1],
        w: /s$/.test(m[1]) && !/en$/.test(m[1])
          ? "Meervoud op -s (onbeklemtoonde lettergreep of klinker)."
          : "Meervoud op -en; let op de spelling: " + m[0] + " → " + m[1] + "."
      });
    }

    /* --- verkleinwoorden --- */
    for (i = 0; i < L.dim.length; i++) {
      var k = L.dim[i];
      if (k[1] === "—") continue;
      out.push({
        id: "g:vk:" + k[0], topic: "a2-verkleinwoord", level: "A2", kind: "verkleinwoord", t: "cloze",
        q: "verkleinwoord van ___", cue: k[0], a: k[1],
        w: k[2] + ". En vergeet niet: elk verkleinwoord is een <b>het</b>-woord."
      });
    }

    return out;
  }

  var cache = null;
  return {
    all: function () { return cache || (cache = build()); }
  };
})();
