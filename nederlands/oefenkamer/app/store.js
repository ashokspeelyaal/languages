/* Opslag + planning (spaced repetition).
 *
 * Alles staat in localStorage onder één sleutel. Werkt ook vanaf file://;
 * lukt dat niet (privacymodus, sommige browsers), dan draait de app op
 * geheugen en waarschuwt de UI dat je moet exporteren.
 *
 * Planning = SM-2, licht aangepast:
 *   - fout  -> zelfde sessie opnieuw (successive relearning) + interval terug naar 0
 *   - goed  -> 1 dag, 3 dagen, daarna interval * easefactor
 *   - hoge zekerheid + fout = "illusie van kennen": extra strafpunt, want dat
 *     is precies het gat dat Make It Stick wil blootleggen.
 */
window.OK_STORE = (function () {
  var KEY = "oefenkamer.v1";
  var DAY = 86400000;

  var mem = null;           // fallback als localStorage niet mag
  var persistent = true;

  function blank() {
    return {
      v: 1,
      created: Date.now(),
      items: {},            // id -> record
      days: {},             // 'YYYY-MM-DD' -> {n, ok}
      sessions: [],         // laatste 200 sessies
      notes: {},            // topic -> eigen aantekening
      recall: {},           // topic -> laatste vrije reproductie
      reflect: [],          // reflecties na een sessie
      settings: {
        levels: { A1: true, A2: true, B1: true, B2: true },
        theme: "auto",
        vocabBonus: false,  // C1-woorden meenemen
        askConf: "soms",    // hoe vaak vragen we naar je zekerheid
        elaborate: true,
        newPerSession: 8
      }
    };
  }

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) {
        var d = JSON.parse(raw);
        var b = blank();
        for (var k in b) if (!(k in d)) d[k] = b[k];
        for (var s in b.settings) if (!(s in d.settings)) d.settings[s] = b.settings[s];
        return d;
      }
      localStorage.setItem(KEY, JSON.stringify(blank()));
    } catch (e) {
      persistent = false;
    }
    return blank();
  }

  var state = load();
  if (!persistent) mem = state;

  var saveTimer = null;
  function save(now) {
    if (!persistent) return;
    if (now) { flush(); return; }
    clearTimeout(saveTimer);
    saveTimer = setTimeout(flush, 400);
  }
  function flush() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); }
    catch (e) { persistent = false; }
  }

  function today() {
    var d = new Date();
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  }
  function pad(n) { return n < 10 ? "0" + n : "" + n; }

  function rec(id) {
    var r = state.items[id];
    if (!r) {
      r = state.items[id] = {
        n: 0,          // aantal geslaagde herhalingen op rij
        ef: 2.5,       // easefactor
        iv: 0,         // interval in dagen
        due: 0,        // timestamp
        seen: 0,       // totaal gezien
        ok: 0,         // totaal goed
        lapse: 0,      // aantal keer teruggevallen
        ill: 0,        // "wist het zeker" maar fout
        last: 0,
        conf: 0        // laatste zekerheid 1..3
      };
    }
    return r;
  }

  /* conf: 1 = gokje, 2 = twijfel, 3 = zeker */
  function grade(id, ok, conf, meta) {
    var r = rec(id), now = Date.now();
    conf = conf || 2;
    r.seen++; r.last = now; r.conf = conf;
    if (meta && meta.topic) r.t = meta.topic;
    if (meta && meta.kind) r.k = meta.kind;

    if (ok) {
      r.ok++;
      r.n++;
      r.ef = Math.max(1.3, r.ef + (conf === 3 ? 0.08 : conf === 2 ? 0.0 : -0.08));
      r.iv = r.n === 1 ? 1 : r.n === 2 ? 3 : Math.round(r.iv * r.ef);
      if (r.iv > 240) r.iv = 240;
      r.due = now + r.iv * DAY;
    } else {
      r.lapse++;
      if (conf === 3) { r.ill++; r.ef = Math.max(1.3, r.ef - 0.35); }
      else r.ef = Math.max(1.3, r.ef - 0.2);
      r.n = 0;
      r.iv = 0;
      r.due = now + 6 * 60000;   // binnen dezelfde zitting terug
    }

    if (!(meta && meta.redo)) {
      var d = state.days[today()] || (state.days[today()] = { n: 0, ok: 0 });
      d.n++; if (ok) d.ok++;
    }
    save();
    return r;
  }

  function isDue(id, now) {
    var r = state.items[id];
    if (!r || !r.seen) return false;
    return r.due <= (now || Date.now());
  }
  function isNew(id) { var r = state.items[id]; return !r || !r.seen; }

  /* 0..1 — hoe stevig zit dit item? */
  function strength(id) {
    var r = state.items[id];
    if (!r || !r.seen) return 0;
    var iv = Math.min(r.iv, 60) / 60;
    var acc = r.ok / r.seen;
    return Math.max(0, Math.min(1, 0.45 * acc + 0.55 * iv));
  }

  function streak() {
    var n = 0, d = new Date();
    for (;;) {
      var key = d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
      var day = state.days[key];
      if (day && day.n > 0) { n++; }
      else if (n > 0 || key !== today()) { break; }
      d.setDate(d.getDate() - 1);
      if (n > 3650) break;
    }
    return n;
  }

  function calibration() {
    // per zekerheidsniveau: hoe vaak had je gelijk?
    var out = { 1: { n: 0, ok: 0 }, 2: { n: 0, ok: 0 }, 3: { n: 0, ok: 0 } };
    state.sessions.forEach(function (s) {
      (s.conf || []).forEach(function (c) {
        if (!out[c[0]]) return;
        out[c[0]].n++; if (c[1]) out[c[0]].ok++;
      });
    });
    return out;
  }

  function addSession(s) {
    state.sessions.push(s);
    if (state.sessions.length > 200) state.sessions.shift();
    save(true);
  }

  function exportJSON() { return JSON.stringify(state, null, 1); }

  function importJSON(txt) {
    var d = JSON.parse(txt);
    if (!d || !d.items) throw new Error("Dat bestand bevat geen voortgang.");
    state = d;
    var b = blank();
    for (var k in b) if (!(k in state)) state[k] = b[k];
    save(true);
    return true;
  }

  function reset() { state = blank(); save(true); }

  return {
    state: function () { return state; },
    settings: function () { return state.settings; },
    rec: rec, grade: grade, isDue: isDue, isNew: isNew, strength: strength,
    streak: streak, calibration: calibration, addSession: addSession,
    save: save, today: today,
    exportJSON: exportJSON, importJSON: importJSON, reset: reset,
    persistent: function () { return persistent; }
  };
})();
