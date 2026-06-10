/* Conjugation rules for regular French verbs + composite tenses.
 *
 * Three regular groups in the verb_group column on vocab_items:
 *   '1'  = -er verbs (parler, manger, …)        ~80% of all French verbs
 *   '2'  = -ir/-iss verbs (finir, choisir, …)   ~10%
 *   '3'  = irregular / -re / -oir / other -ir   ~10% — covered by irregular table
 *
 * Per-tense unlocking by activeLevel:
 *   A1 = present, imperatif
 *   A2 = + passe_compose, futur_proche, imparfait
 *   B1 = + futur, conditionnel
 *   B2 = + subjonctif_present, plus_que_parfait
 *   C1 = + conditionnel_passe, subjonctif_passe
 *
 * Orthographic variants we handle for group 1:
 *   -ger (manger)       → "ge" before a/o:  nous mangeons, je mangeais
 *   -cer (commencer)    → "ç" before a/o:   nous commençons, je commençais
 *   -yer (payer)        → "i" before silent e: je paie  (variant: paye)
 *   -eler (appeler)     → double consonant: j'appelle (variant: -èle for a few)
 *   -e_er (acheter,lever) → "è" before silent e: j'achète, je lève
 *   -é_er (espérer)     → "è" when stem stressed: j'espère
 */
(function () {
  const TENSES_BY_LEVEL = {
    A1: ["present", "imperatif"],
    A2: ["present", "imperatif", "passe_compose", "futur_proche", "imparfait"],
    B1: ["present", "imperatif", "passe_compose", "futur_proche", "imparfait", "futur", "conditionnel"],
    B2: ["present", "imperatif", "passe_compose", "futur_proche", "imparfait", "futur", "conditionnel", "subjonctif_present", "plus_que_parfait"],
    C1: ["present", "imperatif", "passe_compose", "futur_proche", "imparfait", "futur", "conditionnel", "subjonctif_present", "plus_que_parfait", "conditionnel_passe", "subjonctif_passe"],
  };

  const TENSE_LABELS = {
    present:            "Présent",
    imperatif:          "Impératif",
    passe_compose:      "Passé composé",
    futur_proche:       "Futur proche",
    imparfait:          "Imparfait",
    futur:              "Futur simple",
    conditionnel:       "Conditionnel présent",
    subjonctif_present: "Subjonctif présent",
    plus_que_parfait:   "Plus-que-parfait",
    conditionnel_passe: "Conditionnel passé",
    subjonctif_passe:   "Subjonctif passé",
  };

  const PERSONS = ["je", "tu", "il", "nous", "vous", "ils"];
  const PERSON_LABELS = {
    je: "je", tu: "tu", il: "il / elle", nous: "nous", vous: "vous", ils: "ils / elles",
  };

  // -------- Helpers -------------------------------------------------------
  function elide(person, form) {
    // je + voyel/h → j'
    if (person !== "je") return person + " " + form;
    if (/^[aeiouéèêëàâîïôùûhAEIOUÉÈÊËÀÂÎÏÔÙÛH]/.test(form)) return "j'" + form;
    return "je " + form;
  }

  function isErEnding(lemma) { return /er$/.test(lemma); }
  function isIrEnding(lemma) { return /ir$/.test(lemma); }
  function isReEnding(lemma) { return /re$/.test(lemma); }

  // Identify orthographic subclasses for -er verbs
  function erSubtype(lemma) {
    // Stem = lemma without "er"
    const stem = lemma.slice(0, -2);
    if (/g$/.test(stem)) return "ger";       // manger
    if (/c$/.test(stem)) return "cer";       // commencer
    if (/y$/.test(stem)) return "yer";       // payer, essuyer
    // -eler, -eter: double-consonant variant (default). A small set
    // (acheter, geler, peler, fureter, …) use è instead but we treat
    // appeler-style as default; can extend later.
    if (/el$/.test(stem)) return "eler";     // appeler
    if (/et$/.test(stem)) {
      // acheter, racheter use è (not double t). Hard-code a small list.
      if (/^(achet|rachet|hal|crochet)$/.test(stem)) return "eAccent";
      return "eter";                         // jeter
    }
    // e + single consonant + er → stem-stress causes è. e.g. lever → je lève.
    // Approximation: penultimate vowel is plain 'e' (not é/è/ê), no double letter.
    const pen = lemma.length - 3;
    if (pen >= 0 && lemma[pen] === "e" && /[bcdfghjklmnpqrstvwxz]/.test(lemma[pen + 1])) {
      // Filter out the cases caught above (-eler, -eter)
      if (!/el$|et$/.test(stem)) return "eAccent";
    }
    // é + consonant(s) + er → é→è on stem-stress (espérer, préférer, …)
    if (pen >= 0 && lemma[pen] === "é") return "eAigu";
    return "plain";
  }

  // For -er verbs, the present stem differs from the infinitive stem in
  // 1ps/2ps/3ps/3pp for certain subtypes (yer/eler/eter/eAccent/eAigu).
  // nous/vous use the infinitive stem unchanged.
  function erStems(lemma) {
    const stem = lemma.slice(0, -2);
    const sub = erSubtype(lemma);
    let stressed = stem;  // stem used for je/tu/il/ils
    let unstressed = stem; // stem used for nous/vous
    if (sub === "yer") {
      stressed = stem.slice(0, -1) + "i";  // pay → pai
    } else if (sub === "eler") {
      stressed = stem + "l";               // appel → appell
    } else if (sub === "eter") {
      stressed = stem + "t";               // jet → jett
    } else if (sub === "eAccent") {
      // lever → lèv (e → è on penultimate)
      stressed = stem.slice(0, -1).replace(/e$/, "è") + stem.slice(-1);
      // For acheter etc., stem ends in 't' or other consonant: achet → achèt
      // Simpler: walk back to find 'e' and turn it into 'è'.
      const lastE = stem.lastIndexOf("e");
      if (lastE !== -1) {
        stressed = stem.slice(0, lastE) + "è" + stem.slice(lastE + 1);
      }
    } else if (sub === "eAigu") {
      const lastE = stem.lastIndexOf("é");
      if (lastE !== -1) {
        stressed = stem.slice(0, lastE) + "è" + stem.slice(lastE + 1);
      }
    }
    // -ger and -cer differ in nous (mangeons / commençons) and in
    // imparfait stem (mangea-, commença-). The "unstressed" stem ends
    // in 'g' / 'c'. For nous-present (-ons) we DON'T apply the softening
    // — we'll handle it in the present-nous form specifically.
    return { stressed, unstressed, sub };
  }

  // -------- Regular conjugation: présent ----------------------------------
  function presentReg(lemma, group) {
    if (group === "1") {
      const { stressed, unstressed, sub } = erStems(lemma);
      const nousStem = sub === "ger" ? unstressed + "e"        // mange + ons → mangeons
                    : sub === "cer" ? unstressed.slice(0, -1) + "ç" // commenc + ons → commençons
                    : unstressed;
      return {
        je:   stressed + "e",
        tu:   stressed + "es",
        il:   stressed + "e",
        nous: nousStem + "ons",
        vous: unstressed + "ez",
        ils:  stressed + "ent",
      };
    }
    if (group === "2") {
      const stem = lemma.slice(0, -2);
      return {
        je: stem + "is", tu: stem + "is", il: stem + "it",
        nous: stem + "issons", vous: stem + "issez", ils: stem + "issent",
      };
    }
    if (group === "3") {
      // Regular -re: rendre → rends/rends/rend/rendons/rendez/rendent
      const stem = lemma.slice(0, -2);
      return {
        je: stem + "s", tu: stem + "s", il: stem,
        nous: stem + "ons", vous: stem + "ez", ils: stem + "ent",
      };
    }
    return null;
  }

  // -------- Regular conjugation: imparfait -------------------------------
  // Imparfait stem = present-nous stem minus -ons.
  function imparfaitReg(lemma, group) {
    if (group === "1") {
      const { unstressed, sub } = erStems(lemma);
      // -cer: stem softens to ç before a → commenç-
      // -ger: stem softens to ge before a → mange-
      const stem = sub === "cer" ? unstressed.slice(0, -1) + "ç"
                 : sub === "ger" ? unstressed + "e"
                 : unstressed;
      return {
        je: stem + "ais", tu: stem + "ais", il: stem + "ait",
        nous: unstressed + "ions", vous: unstressed + "iez",  // nous/vous keep plain stem (no softening)
        ils: stem + "aient",
      };
    }
    if (group === "2") {
      const stem = lemma.slice(0, -2);
      return {
        je: stem + "issais", tu: stem + "issais", il: stem + "issait",
        nous: stem + "issions", vous: stem + "issiez", ils: stem + "issaient",
      };
    }
    if (group === "3") {
      const stem = lemma.slice(0, -2);
      return {
        je: stem + "ais", tu: stem + "ais", il: stem + "ait",
        nous: stem + "ions", vous: stem + "iez", ils: stem + "aient",
      };
    }
    return null;
  }

  // -------- Regular conjugation: futur simple + conditionnel -------------
  function futurStemReg(lemma, group) {
    if (group === "1" || group === "2") return lemma;  // parler-, finir-
    if (group === "3") return lemma.slice(0, -1);      // rendre → rendr-
    return null;
  }

  function futurReg(lemma, group) {
    const stem = futurStemReg(lemma, group);
    if (!stem) return null;
    return {
      je: stem + "ai", tu: stem + "as", il: stem + "a",
      nous: stem + "ons", vous: stem + "ez", ils: stem + "ont",
    };
  }

  function conditionnelReg(lemma, group) {
    const stem = futurStemReg(lemma, group);
    if (!stem) return null;
    return {
      je: stem + "ais", tu: stem + "ais", il: stem + "ait",
      nous: stem + "ions", vous: stem + "iez", ils: stem + "aient",
    };
  }

  // -------- Regular conjugation: subjonctif présent ----------------------
  function subjonctifReg(lemma, group) {
    if (group === "1") {
      const { stressed, unstressed } = erStems(lemma);
      return {
        je: stressed + "e", tu: stressed + "es", il: stressed + "e",
        nous: unstressed + "ions", vous: unstressed + "iez", ils: stressed + "ent",
      };
    }
    if (group === "2") {
      const stem = lemma.slice(0, -2);
      return {
        je: stem + "isse", tu: stem + "isses", il: stem + "isse",
        nous: stem + "issions", vous: stem + "issiez", ils: stem + "issent",
      };
    }
    if (group === "3") {
      const stem = lemma.slice(0, -2);
      return {
        je: stem + "e", tu: stem + "es", il: stem + "e",
        nous: stem + "ions", vous: stem + "iez", ils: stem + "ent",
      };
    }
    return null;
  }

  // -------- Past participle ---------------------------------------------
  function pastParticipleReg(lemma, group) {
    if (group === "1") return lemma.slice(0, -2) + "é";
    if (group === "2") return lemma.slice(0, -2) + "i";
    if (group === "3") return lemma.slice(0, -2) + "u";
    return null;
  }

  // -------- Aux choice ---------------------------------------------------
  // 17 être-verbs (Mrs Vandertramp) + all reflexives. Reflexive detection
  // happens in conjugate() if needed; here we only flag the canonical 17.
  const ETRE_VERBS = new Set([
    "aller","venir","arriver","partir","entrer","sortir",
    "monter","descendre","naître","mourir","retourner","rester",
    "tomber","devenir","revenir","passer", // passer can use avoir too — context
    "rentrer",
  ]);

  function auxiliaryFor(lemma, group, irregulars) {
    if (irregulars && irregulars[lemma] && irregulars[lemma].auxiliary) {
      return irregulars[lemma].auxiliary;
    }
    if (ETRE_VERBS.has(lemma)) return "être";
    return "avoir";
  }

  // -------- Impératif ----------------------------------------------------
  function imperatifReg(lemma, group) {
    const pres = presentReg(lemma, group);
    if (!pres) return null;
    // tu (drop final 's' for -er verbs; keep for -ir/-re), nous, vous
    let tuForm = pres.tu;
    if (group === "1") tuForm = pres.tu.replace(/s$/, "");
    return { tu: tuForm, nous: pres.nous, vous: pres.vous };
  }

  // -------- Composite tenses --------------------------------------------
  function tense(lemma, group, tenseName, irregulars) {
    const ir = irregulars && irregulars[lemma];
    // Irregular: pull from the table.
    if (ir && ir.tenses && ir.tenses[tenseName]) return ir.tenses[tenseName];

    // Simple regular tenses.
    if (tenseName === "present")            return presentReg(lemma, group);
    if (tenseName === "imparfait")          return imparfaitReg(lemma, group);
    if (tenseName === "futur")              return futurReg(lemma, group);
    if (tenseName === "conditionnel")       return conditionnelReg(lemma, group);
    if (tenseName === "subjonctif_present") return subjonctifReg(lemma, group);

    if (tenseName === "imperatif")          return imperatifReg(lemma, group);

    // Composite: passé composé = aux present + past participle.
    if (tenseName === "passe_compose") {
      return composite(lemma, group, "present", irregulars);
    }
    // Plus-que-parfait = aux imparfait + PP
    if (tenseName === "plus_que_parfait") {
      return composite(lemma, group, "imparfait", irregulars);
    }
    // Conditionnel passé = aux conditionnel + PP
    if (tenseName === "conditionnel_passe") {
      return composite(lemma, group, "conditionnel", irregulars);
    }
    // Subjonctif passé = aux subj-present + PP
    if (tenseName === "subjonctif_passe") {
      return composite(lemma, group, "subjonctif_present", irregulars);
    }
    // Futur proche = aller present + infinitive (not a real tense — included for A2 drills)
    if (tenseName === "futur_proche") {
      const aller = irregulars && irregulars["aller"];
      if (!aller || !aller.tenses || !aller.tenses.present) return null;
      const p = aller.tenses.present;
      const out = {};
      PERSONS.forEach((per) => { out[per] = p[per] + " " + lemma; });
      return out;
    }
    return null;
  }

  function composite(lemma, group, auxTenseName, irregulars) {
    const aux = auxiliaryFor(lemma, group, irregulars);
    const pp = (irregulars && irregulars[lemma] && irregulars[lemma].past_participle)
             || pastParticipleReg(lemma, group);
    if (!pp) return null;
    const auxForms = tense(aux, "3", auxTenseName, irregulars);
    if (!auxForms) return null;
    const out = {};
    PERSONS.forEach((per) => {
      out[per] = auxForms[per] + " " + pp;
    });
    return out;
  }

  // -------- Tense matrix for a verb at a level --------------------------
  function buildTable(lemma, group, level, irregulars) {
    const tenses = TENSES_BY_LEVEL[level] || TENSES_BY_LEVEL.A1;
    const out = {};
    for (const t of tenses) {
      const forms = tense(lemma, group, t, irregulars);
      if (forms) out[t] = forms;
    }
    return out;
  }

  // -------- Match helper: accent-folded comparison ----------------------
  function fold(s) {
    return (s || "")
      .toLowerCase()
      .normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/[œ]/g, "oe").replace(/[æ]/g, "ae")
      .replace(/[’']/g, "'")
      .replace(/\s+/g, " ")
      .trim();
  }

  function check(userAnswer, goldForm, { strict } = {}) {
    if (!strict) return fold(userAnswer) === fold(goldForm);
    return (userAnswer || "").trim() === goldForm;
  }

  window.Conjugation = {
    TENSES_BY_LEVEL, TENSE_LABELS, PERSONS, PERSON_LABELS,
    tense, buildTable, check, fold,
    presentReg, imparfaitReg, futurReg, conditionnelReg, subjonctifReg,
    imperatifReg, pastParticipleReg, auxiliaryFor, composite, erSubtype, erStems,
    elide,
  };
})();
