/* De motor: welke vraag krijg je nu, en waarom die?
 *
 * Uitgangspunten uit Make It Stick:
 *   ophalen  — je krijgt altijd eerst een vraag, nooit eerst de regel
 *   spreiden — items komen terug op oplopende intervallen (zie store.js)
 *   mengen   — nooit twee vragen op rij uit hetzelfde hoofdstuk als het anders kan
 *   variëren — hetzelfde onderwerp komt in verschillende vormen terug
 *              (meerkeuze, invullen, zin bouwen, fout zoeken, omzetten)
 */
window.OK_ENGINE = (function () {
  var S = window.OK_STORE;
  var RANK = { A1: 1, A2: 2, B1: 3, B2: 4, C1: 5 };

  var topicsById = {};
  window.OK_TOPICS.forEach(function (t) { topicsById[t.id] = t; });

  function topicLevel(id) {
    var t = topicsById[id];
    if (t && RANK[t.level]) return t.level;
    return "B1";                                  // bijlages
  }

  /* --- alle grammatica-items, handgeschreven + gegenereerd --- */
  var grammar = null;
  function grammarItems() {
    if (grammar) return grammar;
    grammar = [];
    (window.OK_ITEMS || []).forEach(function (it) {
      it.level = it.level || topicLevel(it.topic);
      it.kind = it.kind || "grammatica";
      it.src = "gram";
      grammar.push(it);
    });
    window.OK_GEN.all().forEach(function (it) { it.src = "gram"; grammar.push(it); });
    return grammar;
  }

  /* --- woordenschat: elk woord levert meerdere ophaalvormen op --- */
  var vocab = null;
  function vocabItems() {
    if (vocab) return vocab;
    vocab = [];
    (window.OK_VOCAB || []).forEach(function (w) {
      var base = { src: "voc", level: w.l, cat: w.c, nl: w.nl, en: w.en, xn: w.xn, xe: w.xe, bonus: !!w.b };
      // herkennen: NL -> EN (makkelijkst, eerste kennismaking)
      vocab.push(assign({}, base, {
        id: "v:" + w.id + ":r", mode: "herkennen", t: "vocmc",
        q: w.nl, a: w.en, topic: "woorden"
      }));
      // produceren: EN -> NL (moeilijker, typen)
      vocab.push(assign({}, base, {
        id: "v:" + w.id + ":p", mode: "produceren", t: "voccloze",
        q: w.en, a: w.nl, topic: "woorden"
      }));
      // in context: gat in de voorbeeldzin
      if (w.xn && gapable(w.xn, w.nl)) {
        vocab.push(assign({}, base, {
          id: "v:" + w.id + ":c", mode: "in context", t: "voccloze",
          q: gap(w.xn, w.nl), a: w.nl, topic: "woorden", hintEn: w.xe
        }));
      }
    });
    return vocab;
  }

  function assign(t) {
    for (var i = 1; i < arguments.length; i++) {
      var s = arguments[i];
      for (var k in s) if (Object.prototype.hasOwnProperty.call(s, k)) t[k] = s[k];
    }
    return t;
  }
  function esc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
  function gapable(sentence, word) {
    if (/[ ]/.test(word)) return sentence.toLowerCase().indexOf(word.toLowerCase()) >= 0;
    return new RegExp("\\b" + esc(word) + "\\b", "i").test(sentence);
  }
  function gap(sentence, word) {
    if (/[ ]/.test(word)) {
      var i = sentence.toLowerCase().indexOf(word.toLowerCase());
      return sentence.slice(0, i) + "___" + sentence.slice(i + word.length);
    }
    return sentence.replace(new RegExp("\\b" + esc(word) + "\\b", "i"), "___");
  }

  function all() { return grammarItems().concat(vocabItems()); }

  /* --- filters --- */
  function levelOK(it, levels) {
    if (it.src === "voc" && it.bonus && !S.settings().vocabBonus) return false;
    if (it.level === "C1") return !!S.settings().vocabBonus;
    return !!levels[it.level];
  }

  /* Een woord dat je nog nooit zag, vraag je niet meteen productief.
     Volgorde: herkennen (NL->EN) -> produceren (EN->NL) -> invullen in een zin. */
  function unlocked(it) {
    if (it.src !== "voc" || it.mode === "herkennen") return true;
    var own = S.state().items[it.id];
    if (own && own.seen) return true;                       // al mee bezig
    var base = S.state().items[it.id.replace(/:[pc]$/, ":r")];
    if (!base || !base.seen) return false;
    if (it.mode === "in context") {
      var prod = S.state().items[it.id.replace(/:c$/, ":p")];
      return !!(prod && prod.seen);
    }
    return true;
  }

  function pool(opts) {
    opts = opts || {};
    var levels = opts.levels || S.settings().levels;
    var src = opts.src;                 // 'gram' | 'voc' | undefined
    var topic = opts.topic;
    var list = src === "voc" ? vocabItems() : src === "gram" ? grammarItems() : all();
    return list.filter(function (it) {
      if (topic && it.topic !== topic && !inTopic(it, topic)) return false;
      if (opts.cat && it.cat !== opts.cat) return false;
      if (!levelOK(it, levels)) return false;
      return opts.all ? true : unlocked(it);
    });
  }

  /* generatoritems horen ook bij het hoofdstuk waar hun rijtje thuishoort */
  var GENPREFIX = {
    tt: ["g:tt3:", "g:ttj:"], ovt: ["g:ovt:", "g:ovtp:"], vd: ["g:vd:", "g:aux:"],
    vz: ["g:vz:", "g:vzm:"], dehet: ["g:dh:"], meervoud: ["g:mv:"], verkleinwoord: ["g:vk:"]
  };
  function inTopic(it, topicId) {
    var t = topicsById[topicId];
    if (!t || !t.gen) return false;
    var pre = GENPREFIX[t.gen] || [];
    for (var i = 0; i < pre.length; i++) if (it.id.indexOf(pre[i]) === 0) return true;
    return false;
  }

  /* --- sessie samenstellen --- */
  function buildSession(opts) {
    opts = opts || {};
    var n = opts.n || 20;
    var now = Date.now();
    var cand = pool(opts);

    var due = [], fresh = [], weak = [], rest = [];
    cand.forEach(function (it) {
      var r = S.state().items[it.id];
      if (!r || !r.seen) { fresh.push(it); return; }
      if (r.due <= now) { due.push(it); return; }
      if (r.ok / r.seen < 0.7) { weak.push(it); return; }
      rest.push(it);
    });

    // oudste schuld eerst
    due.sort(function (a, b) { return S.state().items[a.id].due - S.state().items[b.id].due; });
    shuffle(fresh); shuffle(weak); shuffle(rest);

    var maxNew = opts.mode === "nieuw" ? n : Math.min(S.settings().newPerSession, Math.ceil(n / 2));
    var picked = [];
    if (opts.mode === "herhalen") {
      picked = due.slice(0, n);
      if (picked.length < n) picked = picked.concat(weak.slice(0, n - picked.length));
    } else if (opts.mode === "nieuw") {
      picked = fresh.slice(0, n);
    } else {                                        // gemengd: schuld eerst, dan zwak, dan nieuw
      picked = due.slice(0, Math.ceil(n * 0.6));
      picked = picked.concat(weak.slice(0, Math.max(0, Math.ceil(n * 0.25))));
      picked = picked.concat(fresh.slice(0, Math.max(0, maxNew)));
      if (picked.length < n) picked = picked.concat(rest.slice(0, n - picked.length));
      if (picked.length < n) picked = picked.concat(fresh.slice(maxNew, maxNew + (n - picked.length)));
      picked = picked.slice(0, n);
    }
    return interleave(picked);
  }

  /* nooit twee keer hetzelfde onderwerp achter elkaar als het te vermijden is */
  function interleave(list) {
    var buckets = {}, order = [];
    list.forEach(function (it) {
      var k = it.topic + "|" + (it.cat || "");
      if (!buckets[k]) { buckets[k] = []; order.push(k); }
      buckets[k].push(it);
    });
    var out = [], last = null, lastSrc = null, guard = 0;
    while (out.length < list.length && guard++ < 10000) {
      var best = null, bestScore = -1;
      for (var i = 0; i < order.length; i++) {
        var k = order[i];
        if (!buckets[k].length) continue;
        if (k === last && order.some(function (o) { return o !== k && buckets[o].length; })) continue;
        // grootste stapel eerst, maar wissel liefst ook van soort (grammatica <-> woorden)
        var score = buckets[k].length + (buckets[k][0].src !== lastSrc ? 1000 : 0);
        if (score > bestScore) { bestScore = score; best = k; }
      }
      if (!best) break;
      lastSrc = buckets[best][0].src;
      out.push(buckets[best].shift());
      last = best;
    }
    return out;
  }

  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  /* --- meerkeuze-afleiders voor woordenschat --- */
  function vocDistractors(item, k) {
    var same = vocabItems().filter(function (v) {
      return v.mode === item.mode && v.cat === item.cat && v.id !== item.id;
    });
    if (same.length < k) {
      same = same.concat(vocabItems().filter(function (v) {
        return v.mode === item.mode && v.id !== item.id;
      }));
    }
    var out = [], seen = {};
    shuffle(same);
    for (var i = 0; i < same.length && out.length < k; i++) {
      if (same[i].a === item.a || seen[same[i].a]) continue;
      seen[same[i].a] = 1; out.push(same[i].a);
    }
    return out;
  }

  /* --- statistiek --- */
  function topicStats(topicId) {
    var items = pool({ topic: topicId, all: true, levels: { A1: 1, A2: 1, B1: 1, B2: 1, C1: 1 } });
    var seen = 0, str = 0, due = 0, now = Date.now();
    items.forEach(function (it) {
      var r = S.state().items[it.id];
      if (r && r.seen) { seen++; str += S.strength(it.id); if (r.due <= now) due++; }
    });
    return { total: items.length, seen: seen, due: due, mastery: items.length ? str / items.length : 0 };
  }

  function overview() {
    var now = Date.now(), levels = S.settings().levels;
    var o = { due: 0, dueVoc: 0, dueGram: 0, seen: 0, total: 0, newLeft: 0 };
    all().forEach(function (it) {
      if (!levelOK(it, levels)) return;
      o.total++;
      var r = S.state().items[it.id];
      if (r && r.seen) {
        o.seen++;
        if (r.due <= now) { o.due++; if (it.src === "voc") o.dueVoc++; else o.dueGram++; }
      } else o.newLeft++;
    });
    return o;
  }

  function leeches(n) {
    var st = S.state().items, out = [];
    for (var id in st) {
      var r = st[id];
      if (r.lapse >= 3 && r.ok / Math.max(1, r.seen) < 0.6) out.push({ id: id, r: r });
    }
    out.sort(function (a, b) { return b.r.lapse - a.r.lapse; });
    return out.slice(0, n || 12);
  }

  function byId(id) {
    var list = all();
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }

  return {
    all: all, pool: pool, buildSession: buildSession, interleave: interleave,
    shuffle: shuffle, vocDistractors: vocDistractors, topicStats: topicStats,
    overview: overview, leeches: leeches, byId: byId, topicsById: topicsById,
    grammarItems: grammarItems, vocabItems: vocabItems
  };
})();
