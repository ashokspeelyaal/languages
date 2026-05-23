/* Fuzzy answer matching tolerant of articles, diacritics, separable-verb prefixes,
 * and the / synonym separator used in the dataset. */
(function () {
  const ARTICLES = /^(de|het|een|the|a|an)\s+/i;
  const PUNCT = /[.,;:!?'"„""()…]/g;

  function strip(s) {
    return s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(PUNCT, "")
      .replace(ARTICLES, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  // Acceptable answers for a target string that may contain `/` synonyms,
  // e.g. "to ask / to enquire", or "kwam/kwamen · gekomen".
  function variants(target) {
    // strip arrow / dot / not-equal decorations to comparable separators
    const cleaned = target
      .replace(/→/g, "/")
      .replace(/·/g, "/")
      .replace(/≠/g, "/");
    return cleaned.split(/[\/|]/).map((s) => strip(s)).filter(Boolean);
  }

  function levenshtein(a, b) {
    if (a === b) return 0;
    const al = a.length, bl = b.length;
    if (!al) return bl;
    if (!bl) return al;
    const v = new Array(bl + 1);
    for (let j = 0; j <= bl; j++) v[j] = j;
    for (let i = 1; i <= al; i++) {
      let prev = i - 1;
      v[0] = i;
      for (let j = 1; j <= bl; j++) {
        const tmp = v[j];
        v[j] = a[i - 1] === b[j - 1]
          ? prev
          : 1 + Math.min(prev, v[j], v[j - 1]);
        prev = tmp;
      }
    }
    return v[bl];
  }

  function check(input, target) {
    const guess = strip(input);
    if (!guess) return { ok: false, kind: "empty" };
    const alts = variants(target);
    for (const alt of alts) {
      if (guess === alt) return { ok: true, kind: "exact" };
    }
    // Tolerate small typos: 1 edit on words ≤6, 2 edits otherwise
    for (const alt of alts) {
      const tol = alt.length <= 6 ? 1 : 2;
      if (levenshtein(guess, alt) <= tol) return { ok: true, kind: "fuzzy" };
    }
    return { ok: false, kind: "miss" };
  }

  window.Match = { strip, variants, check, levenshtein };
})();
