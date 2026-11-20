/* Wat je gezien hebt en wanneer het terugkomt.
 *
 * Eén sleutel in localStorage. Werkt ook vanaf file://; lukt dat niet, dan
 * draait alles op geheugen en zegt de app dat je moet exporteren.
 *
 * Teksten hebben geen score maar een SLIJTAGE (0 t/m 4). Elke ontmoeting haalt
 * er meer woorden uit. De tussenpozen lopen op:
 *   0 lezen        -> 10 minuten later terug, nog in dezelfde zitting
 *   1 zes gaten    -> 1 dag
 *   2 twaalf gaten -> 3 dagen
 *   3 alles weg    -> 8 dagen
 *   4 herbouwen    -> 21 dagen
 * Losse woorden en vormen volgen een gewone SM-2-achtige planning.
 */
window.T_GEHEUGEN = (function () {
  var SLEUTEL = "terughalen.v1";
  var MIN = 60000, DAG = 86400000;
  var TUSSENPOZEN = [10 * MIN, 1 * DAG, 3 * DAG, 8 * DAG, 21 * DAG];

  var bewaart = true;

  function leeg() {
    return {
      v: 1, begonnen: Date.now(),
      teksten: {},        // id -> {s: slijtage, due, keer, geholpen:[]}
      dingen: {},         // sleutel -> {n, ef, iv, due, gezien, goed, mis}
      dagen: {},          // 'JJJJ-MM-DD' -> {n, goed, sec}
      records: { snelvuur: 0, gaten: {} },
      onbekend: {},       // woorden die je in een tekst hebt aangeklikt
      schrijfsels: [],    // je eigen zinnen
      voorkeur: { niveaus: { B1: true, B2: true }, extra: false, tempo: 45 }
    };
  }

  function laden() {
    try {
      var rauw = localStorage.getItem(SLEUTEL);
      if (rauw) {
        var d = JSON.parse(rauw), b = leeg(), k;
        for (k in b) if (!(k in d)) d[k] = b[k];
        for (k in b.voorkeur) if (!(k in d.voorkeur)) d.voorkeur[k] = b.voorkeur[k];
        return d;
      }
      localStorage.setItem(SLEUTEL, JSON.stringify(leeg()));
    } catch (e) { bewaart = false; }
    return leeg();
  }

  var staat = laden();
  var timer = null;
  function bewaar(nu) {
    if (!bewaart) return;
    if (nu) { spoel(); return; }
    clearTimeout(timer); timer = setTimeout(spoel, 400);
  }
  function spoel() {
    try { localStorage.setItem(SLEUTEL, JSON.stringify(staat)); } catch (e) { bewaart = false; }
  }

  function vandaag() {
    var d = new Date();
    return d.getFullYear() + "-" + p2(d.getMonth() + 1) + "-" + p2(d.getDate());
  }
  function p2(n) { return n < 10 ? "0" + n : "" + n; }

  /* ---------------- teksten ---------------- */
  function tekst(id) {
    return staat.teksten[id] || (staat.teksten[id] = { s: 0, due: 0, keer: 0, geholpen: [] });
  }
  function tekstKlaar(id, geholpen) {
    var t = tekst(id);
    t.keer++;
    t.geholpen = geholpen || [];
    t.due = Date.now() + TUSSENPOZEN[Math.min(t.s, TUSSENPOZEN.length - 1)];
    t.s = Math.min(4, t.s + 1);
    bewaar(true);
    return t;
  }

  /* ---------------- losse dingen (woorden, vormen) ---------------- */
  function ding(k) {
    return staat.dingen[k] || (staat.dingen[k] = { n: 0, ef: 2.5, iv: 0, due: 0, gezien: 0, goed: 0, mis: 0 });
  }
  function scoor(k, goed, snel) {
    var r = ding(k), nu = Date.now();
    r.gezien++;
    if (goed) {
      r.goed++; r.n++;
      r.ef = Math.max(1.3, r.ef + (snel ? 0.06 : -0.02));
      r.iv = r.n === 1 ? 1 : r.n === 2 ? 3 : Math.min(240, Math.round(r.iv * r.ef));
      r.due = nu + r.iv * DAG;
    } else {
      r.mis++; r.n = 0; r.iv = 0;
      r.ef = Math.max(1.3, r.ef - 0.2);
      r.due = nu + 6 * MIN;          // binnen dezelfde zitting terug
    }
    return r;
  }
  function open(k) { var r = staat.dingen[k]; return r && r.gezien && r.due <= Date.now(); }
  function nieuw(k) { var r = staat.dingen[k]; return !r || !r.gezien; }
  function kracht(k) {
    var r = staat.dingen[k];
    if (!r || !r.gezien) return 0;
    return Math.max(0, Math.min(1, 0.45 * (r.goed / r.gezien) + 0.55 * Math.min(r.iv, 60) / 60));
  }

  /* ---------------- dagteller ---------------- */
  function tel(goed, sec) {
    var d = staat.dagen[vandaag()] || (staat.dagen[vandaag()] = { n: 0, goed: 0, sec: 0 });
    d.n++; if (goed) d.goed++; d.sec += sec || 0;
    bewaar();
  }
  function reeks() {
    var n = 0, d = new Date();
    for (;;) {
      var k = d.getFullYear() + "-" + p2(d.getMonth() + 1) + "-" + p2(d.getDate());
      if (staat.dagen[k] && staat.dagen[k].n) n++;
      else if (n > 0 || k !== vandaag()) break;
      d.setDate(d.getDate() - 1);
      if (n > 3650) break;
    }
    return n;
  }

  return {
    staat: function () { return staat; },
    voorkeur: function () { return staat.voorkeur; },
    tekst: tekst, tekstKlaar: tekstKlaar,
    ding: ding, scoor: scoor, open: open, nieuw: nieuw, kracht: kracht,
    tel: tel, reeks: reeks, vandaag: vandaag, bewaar: bewaar,
    bewaart: function () { return bewaart; },
    uitvoer: function () { return JSON.stringify(staat, null, 1); },
    invoer: function (txt) {
      var d = JSON.parse(txt);
      if (!d || !d.teksten) throw new Error("Dat bestand hoort niet bij deze app.");
      staat = d; var b = leeg();
      for (var k in b) if (!(k in staat)) staat[k] = b[k];
      bewaar(true); return true;
    },
    wis: function () { staat = leeg(); bewaar(true); }
  };
})();
