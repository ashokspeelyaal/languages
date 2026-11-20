/* Antwoorden nakijken.
 *
 * Streng op grammatica, mild op typfouten: één letter verschil telt als goed
 * maar wordt wel getoond, want anders straf je je typvaardigheid in plaats van
 * je Nederlands. Diakrieten (ë, é) worden gemeld, niet afgestraft.
 */
window.OK_GRADE = (function () {
  function norm(s) {
    return (s || "")
      .toString()
      .toLowerCase()
      .replace(/[‘’ʼ]/g, "'")
      .replace(/[“”]/g, '"')
      .replace(/[.,!?;:"()]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }
  function strip(s) {
    return norm(s).normalize("NFD").replace(/[̀-ͯ]/g, "");
  }
  function lev(a, b) {
    if (a === b) return 0;
    var m = a.length, n = b.length;
    if (!m) return n; if (!n) return m;
    var prev = new Array(n + 1), cur = new Array(n + 1), i, j;
    for (j = 0; j <= n; j++) prev[j] = j;
    for (i = 1; i <= m; i++) {
      cur[0] = i;
      for (j = 1; j <= n; j++) {
        cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1,
          prev[j - 1] + (a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1));
      }
      var t = prev; prev = cur; cur = t;
    }
    return prev[n];
  }

  /* accepted: string of array. Geeft {ok, near, note, expect} */
  function check(given, accepted) {
    var list = [].concat(accepted).filter(function (x) { return x != null; });
    var g = norm(given);
    if (!g) return { ok: false, near: false, expect: list[0] };
    var i, a;
    for (i = 0; i < list.length; i++) {
      if (g === norm(list[i])) return { ok: true, near: false, expect: list[i] };
    }
    for (i = 0; i < list.length; i++) {
      if (strip(given) === strip(list[i])) {
        return { ok: true, near: true, note: "Let op de puntjes: " + list[i], expect: list[i] };
      }
    }
    for (i = 0; i < list.length; i++) {
      a = norm(list[i]);
      if (a.length >= 5 && lev(g, a) === 1) {
        return { ok: true, near: true, note: "Typfout — juist is: " + list[i], expect: list[i] };
      }
    }
    return { ok: false, near: false, expect: list[0] };
  }

  /* markeert per woord goed/fout, voor zinsoefeningen */
  function diff(given, expect) {
    var g = norm(given).split(" "), e = norm(expect).split(" "), out = [], i;
    for (i = 0; i < e.length; i++) out.push({ w: e[i], ok: g[i] === e[i] });
    return out;
  }

  return { norm: norm, check: check, diff: diff, lev: lev };
})();
