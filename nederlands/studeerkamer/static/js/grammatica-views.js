/* Grammatica-sectie.
 *
 * Twee delen:
 *   1. Lezen — sidebar met alle 44 hoofdstukken (gegroepeerd per CEFR-niveau);
 *      hoofdinhoud rendert het geselecteerde hoofdstuk uit
 *      /static/grammatica-overzicht.html (fetch + DOMParser, in-place insertie).
 *   2. Oefenen — knop per hoofdstuk roept een AI-call op die 6 oefeningen
 *      genereert (mix van fill-in en meerkeuze) over precies dat onderwerp.
 *      Eén vraag tegelijk, directe feedback, score aan het einde.
 *
 * Geen server-side opslag: oefeningen zijn ephemeral. SRS van vocab blijft
 * leidend; grammatica is gericht oefenmateriaal per zitting.
 */
(function () {
  const CHAPTERS = [
    // A1 — Fundamenten
    { id: "a1-lidwoorden",   nr:  1, level: "A1", title: "Lidwoorden — de, het, een",                        topic: "de/het/een gebruik en heuristieken" },
    { id: "a1-pronomina",    nr:  2, level: "A1", title: "Persoonlijke voornaamwoorden",                    topic: "ik/jij/u/hij/zij/wij/jullie + onderwerp- vs voorwerpsvorm" },
    { id: "a1-bezit",        nr:  3, level: "A1", title: "Bezittelijke voornaamwoorden",                    topic: "mijn/jouw/zijn/haar/ons/onze/hun" },
    { id: "a1-tt",           nr:  4, level: "A1", title: "Tegenwoordige tijd",                              topic: "stam + uitgang, spelling, onregelmatige zijn/hebben/kunnen/gaan/zullen" },
    { id: "a1-zijn-hebben",  nr:  5, level: "A1", title: "Zijn en hebben",                                  topic: "vervoeging + hulpwerkwoordkeuze bij perfectum" },
    { id: "a1-volgorde",     nr:  6, level: "A1", title: "Basis woordvolgorde (V2)",                        topic: "persoonsvorm op positie 2, infinitief/voltooid dlw op einde" },
    { id: "a1-vragen",       nr:  7, level: "A1", title: "Vragen vormen",                                   topic: "ja/nee-vragen, vraagwoorden, waar+voorzetsel" },
    { id: "a1-ontkenning",   nr:  8, level: "A1", title: "Ontkenning — niet vs geen",                       topic: "wanneer niet, wanneer geen + plaats van niet" },
    { id: "a1-meervoud",     nr:  9, level: "A1", title: "Meervoud",                                        topic: "-en vs -s regels, spellingaanpassingen, onregelmatige" },
    { id: "a1-getallen",     nr: 10, level: "A1", title: "Getallen, tijd en datum",                         topic: "getallen 1-100, klok (half tien = 9:30), dagen/maanden" },
    // A2 — Uitbreiden
    { id: "a2-imperfectum",  nr: 11, level: "A2", title: "Imperfectum",                                     topic: "zwak (-te/-de + 't kofschip) en sterk (klinkerwisseling)" },
    { id: "a2-perfectum",    nr: 12, level: "A2", title: "Perfectum — ge- + d/t",                           topic: "voltooid deelwoord, hulpwerkwoord hebben/zijn" },
    { id: "a2-zonder-ge",    nr: 13, level: "A2", title: "Werkwoorden zonder ge-",                          topic: "be-, ge-, her-, ont-, ver-, er- voorvoegsels" },
    { id: "a2-scheidbaar",   nr: 14, level: "A2", title: "Scheidbare en onscheidbare werkwoorden",          topic: "klemtoonregel, opstaan vs vertellen, scheiden in hoofd-/bijzin" },
    { id: "a2-verkleinwoord",nr: 15, level: "A2", title: "Verkleinwoorden",                                 topic: "-je/-tje/-etje/-pje/-kje, altijd het-woord" },
    { id: "a2-bijvoeglijk",  nr: 16, level: "A2", title: "Bijvoeglijk naamwoord + verbuiging",              topic: "wel/geen -e, uitzondering een+adj+het-woord, materiaal-adj" },
    { id: "a2-trappen",      nr: 17, level: "A2", title: "Comparatief en superlatief",                      topic: "-er/-st, onregelmatige (goed/beter/best), dan vs als" },
    { id: "a2-modaal",       nr: 18, level: "A2", title: "Modale werkwoorden",                              topic: "kunnen/moeten/mogen/willen/zullen/hoeven (te)" },
    { id: "a2-voorzetsel",   nr: 19, level: "A2", title: "Voorzetsels (basis)",                             topic: "in/op/aan/naar/van/voor/achter/onder/met/zonder/door/over/uit" },
    { id: "a2-er",           nr: 20, level: "A2", title: "Er-constructie (intro)",                          topic: "plaats-er en voorlopig onderwerp" },
    // B1 — Middenniveau
    { id: "b1-bijzin",       nr: 21, level: "B1", title: "Bijzinnen en werkwoord op het einde",             topic: "onderschikkende voegwoorden, werkwoordsgroep achteraan" },
    { id: "b1-inversie",     nr: 22, level: "B1", title: "Inversie",                                        topic: "iets anders op positie 1 → onderwerp na werkwoord" },
    { id: "b1-conditioneel", nr: 23, level: "B1", title: "Voorwaardelijke wijs — zou",                      topic: "beleefdheid, hypothese, toekomst-in-verleden" },
    { id: "b1-reflexief",    nr: 24, level: "B1", title: "Wederkerende werkwoorden",                        topic: "zich vergissen/herinneren/vervelen + me/je/zich/ons" },
    { id: "b1-plusquam",     nr: 25, level: "B1", title: "Plusquamperfectum",                               topic: "had(den)/was(en) + voltooid dlw, voorvoegsel voor ander verleden" },
    { id: "b1-passief",      nr: 26, level: "B1", title: "Lijdende vorm — worden",                          topic: "worden + vd / zijn + vd (perfectum), door + dader" },
    { id: "b1-te",           nr: 27, level: "B1", title: "Te + infinitief / om te + infinitief",            topic: "proberen/beginnen/durven + te; doel met om te" },
    { id: "b1-relatief",     nr: 28, level: "B1", title: "Relatieve bijzinnen — die/dat/waar/wat",          topic: "die voor de-woorden, dat voor het-woorden, waar+voorzetsel" },
    { id: "b1-voegwoord",    nr: 29, level: "B1", title: "Voegwoorden: neven- of onderschikkend",           topic: "en/maar/of/want/dus vs dat/omdat/als/hoewel/terwijl; want vs omdat" },
    // B2 — Gevorderd
    { id: "b2-er",           nr: 30, level: "B2", title: "De vier functies van er",                         topic: "plaats / voorlopig onderwerp / vnw-bijwoord / getal-er" },
    { id: "b2-partikels",    nr: 31, level: "B2", title: "Modale partikels",                                topic: "toch/maar/eens/even/wel/nou/dan/hoor/zeker — stapelen" },
    { id: "b2-indirect",     nr: 32, level: "B2", title: "Indirecte rede",                                  topic: "tijd schuift terug, of voor ja/nee-vragen, vandaag→die dag" },
    { id: "b2-voegwoord",    nr: 33, level: "B2", title: "Geavanceerde voegwoorden",                        topic: "nadat/voordat/zodra/zolang/naarmate/indien/mits/tenzij/aangezien/opdat/doordat" },
    { id: "b2-volgorde",     nr: 34, level: "B2", title: "Werkwoordsvolgorde — rood/groen",                 topic: "hulpww + vd vs vd + hulpww in bijzin, beide correct" },
    { id: "b2-vaste",        nr: 35, level: "B2", title: "Vaste voorzetselcombinaties",                     topic: "denken aan, wachten op, houden van, lijden aan/onder, slagen voor/in" },
    // C1 — Verfijnd
    { id: "c1-afleiding",    nr: 36, level: "C1", title: "Afleidingen en samenstellingen",                  topic: "-ig/-lijk/-baar/-loos + -ing/-heid/-tie/-isme + voorvoegsels" },
    { id: "c1-nominaal",     nr: 37, level: "C1", title: "Nominale stijl",                                  topic: "werkwoord → zelfstandig naamwoord, formeel schrijven" },
    { id: "c1-tang",         nr: 38, level: "C1", title: "Tangconstructies",                                topic: "afstand tussen samenhorende woorden vermijden" },
    { id: "c1-register",     nr: 39, level: "C1", title: "Register en stijl",                               topic: "spreektaal vs schrijftaal, Vlaams vs Nederlands" },
    { id: "c1-connector",    nr: 40, level: "C1", title: "Academische connectoren",                         topic: "bovendien/echter/derhalve/aangezien/teneinde/kortom/vervolgens" },
    { id: "c1-zekerheid",    nr: 41, level: "C1", title: "Mate van zekerheid en nuancering",                topic: "ongetwijfeld/wellicht/uitgesloten, litotes, hedging" },
    // Bijlages
    { id: "bijlage-onregelmatig", nr: 42, level: "Bijlage", title: "Onregelmatige werkwoorden",             topic: "kernlijst sterk + onregelmatig" },
    { id: "bijlage-voorzetsel",   nr: 43, level: "Bijlage", title: "Vaste voorzetsels per werkwoord",       topic: "alfabetische lijst" },
    { id: "bijlage-dehet",        nr: 44, level: "Bijlage", title: "Heuristieken voor de of het",            topic: "patronen voor de-/het-woorden" },
  ];

  let docCache = null;        // parsed full reference doc
  let activeChapter = null;   // id

  function el(tag, props, ...children) {
    const e = document.createElement(tag);
    if (props) for (const [k, v] of Object.entries(props)) {
      if (v == null) continue;
      if (k === "class") e.className = v;
      else if (k === "style") e.setAttribute("style", v);
      else if (k.startsWith("on") && typeof v === "function") e.addEventListener(k.slice(2).toLowerCase(), v);
      else e.setAttribute(k, v);
    }
    for (const c of children) {
      if (c == null || c === false) continue;
      if (Array.isArray(c)) c.forEach((cc) => cc != null && e.append(cc));
      else if (typeof c === "string" || typeof c === "number") e.append(document.createTextNode(c));
      else e.append(c);
    }
    return e;
  }
  function escapeHTML(s) {
    return String(s || "").replace(/[&<>]/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;"}[c]));
  }

  async function loadDoc() {
    if (docCache) return docCache;
    const r = await fetch("/static/grammatica-overzicht.html", { credentials: "same-origin" });
    const html = await r.text();
    docCache = new DOMParser().parseFromString(html, "text/html");
    return docCache;
  }

  async function getChapterContent(id) {
    const doc = await loadDoc();
    const article = doc.getElementById(id);
    return article ? article.cloneNode(true) : null;
  }

  function render(mount) {
    mount.innerHTML = "";
    const wrap = el("div", { class: "luisteren-page", style: "display:grid;grid-template-columns:minmax(0,280px) 1fr;gap:1.4rem" });
    if (window.matchMedia && window.matchMedia("(max-width: 760px)").matches) {
      wrap.setAttribute("style", "display:grid;grid-template-columns:1fr;gap:1rem");
    }
    const side = el("div");
    const main = el("div");
    wrap.append(side, main);
    mount.append(wrap);

    function pickFirst() {
      const hash = location.hash.match(/^#\/grammatica\/(.+)$/);
      if (hash && CHAPTERS.find((c) => c.id === hash[1])) return hash[1];
      return "a1-lidwoorden";
    }
    activeChapter = pickFirst();

    paintSidebar(side, activeChapter, (id) => {
      activeChapter = id;
      location.hash = "#/grammatica/" + id;
      paintSidebar(side, activeChapter, arguments.callee);
      paintMain(main, id);
    });
    paintMain(main, activeChapter);
  }

  function paintSidebar(host, activeId, onSelect) {
    host.innerHTML = "";
    host.append(el("h3", { style: "margin:0 0 .5rem;font-family:var(--serif);font-weight:600" }, "Hoofdstukken"));
    const groups = {};
    CHAPTERS.forEach((c) => { (groups[c.level] = groups[c.level] || []).push(c); });
    ["A1", "A2", "B1", "B2", "C1", "Bijlage"].forEach((lvl) => {
      if (!groups[lvl]) return;
      const head = el("div", { style: "font-family:var(--mono);font-size:.72rem;letter-spacing:.14em;text-transform:uppercase;color:var(--ink-faint);margin:.6rem 0 .25rem" }, lvl);
      host.append(head);
      groups[lvl].forEach((c) => {
        const item = el("button", {
          class: "subtle" + (c.id === activeId ? " active" : ""),
          style: "display:block;width:100%;text-align:left;font-size:.85rem;padding:.32rem .55rem;border-radius:3px;margin-bottom:1px;" +
                 "background:" + (c.id === activeId ? "var(--paper-2)" : "transparent") + ";" +
                 "border:1px solid " + (c.id === activeId ? "var(--rood)" : "transparent") + ";" +
                 "color:var(--ink);font-family:var(--sans)",
          onClick: () => onSelect(c.id),
        });
        item.append(
          el("span", { style: "font-family:var(--mono);color:var(--ink-faint);font-size:.7rem;margin-right:.4rem" }, String(c.nr).padStart(2, "0")),
          c.title,
        );
        host.append(item);
      });
    });
  }

  async function paintMain(host, chapterId) {
    host.innerHTML = "";
    const ch = CHAPTERS.find((c) => c.id === chapterId);
    if (!ch) { host.append(el("p", null, "Hoofdstuk niet gevonden.")); return; }

    // Header met titel + niveau + Oefen-knop
    const head = el("div", { style: "display:flex;align-items:baseline;gap:1rem;flex-wrap:wrap;margin-bottom:1rem;padding-bottom:.6rem;border-bottom:1px solid var(--rule)" });
    head.append(
      el("span", { style: "display:inline-block;font-family:var(--mono);font-size:.72rem;background:var(--rood);color:#fff;padding:2px 9px;border-radius:2px;letter-spacing:.06em" }, ch.level),
      el("h2", { class: "view-title", style: "margin:0;flex:1;min-width:0" }, ch.title),
      el("button", {
        onClick: () => openOefenModal(ch, host),
      }, "🎯 Oefen dit hoofdstuk"),
    );
    host.append(head);

    // Inhoud
    const contentHost = el("div", { class: "grammar-content" });
    contentHost.innerHTML = '<p class="stat-note"><span class="ai-loading">Bezig met laden…</span></p>';
    host.append(contentHost);
    try {
      const article = await getChapterContent(chapterId);
      if (article) {
        contentHost.innerHTML = "";
        // Strip the original h2 — we already showed it in the header.
        const firstH2 = article.querySelector("h2");
        if (firstH2) firstH2.remove();
        contentHost.append(article);
      } else {
        contentHost.innerHTML = '<p class="ai-error">Inhoud niet gevonden in grammatica-overzicht.html</p>';
      }
    } catch (e) {
      contentHost.innerHTML = '<p class="ai-error">' + escapeHTML(e.message) + '</p>';
    }
  }

  /* ---------- Oefen-modus ---------- */
  function openOefenModal(ch, host) {
    if (!window.AI || !window.AI.isConfigured()) {
      alert("Stel je OpenAI-sleutel in via Instellingen.");
      return;
    }
    const overlay = el("div", {
      class: "oefen-overlay",
      style: "position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:9999;display:flex;align-items:center;justify-content:center;padding:1.5rem",
    });
    const panel = el("div", {
      style: "background:var(--paper);border-radius:6px;max-width:640px;width:100%;max-height:90vh;overflow:auto;padding:1.4rem 1.6rem;box-shadow:0 12px 40px rgba(0,0,0,.4)",
    });
    overlay.append(panel);
    overlay.addEventListener("click", (e) => { if (e.target === overlay) document.body.removeChild(overlay); });
    document.body.append(overlay);

    panel.innerHTML = `
      <div style="display:flex;align-items:baseline;justify-content:space-between;margin-bottom:.6rem">
        <h3 style="margin:0;font-family:var(--serif);font-weight:600">Oefenen · ${escapeHTML(ch.title)}</h3>
        <button class="subtle" id="oef-close" style="font-size:.8rem">sluiten ✕</button>
      </div>
      <p class="stat-note">Niveau: ${ch.level}. De AI maakt 6 oefeningen op maat. Even geduld…</p>
      <div id="oef-body"><p><span class="ai-loading">Oefeningen genereren…</span></p></div>
    `;
    panel.querySelector("#oef-close").addEventListener("click", () => document.body.removeChild(overlay));

    generateExercises(ch).then((list) => {
      runQuiz(panel.querySelector("#oef-body"), list, ch, () => generateExercises(ch).then((l2) => runQuiz(panel.querySelector("#oef-body"), l2, ch)));
    }).catch((e) => {
      panel.querySelector("#oef-body").innerHTML = '<p class="ai-error">' + escapeHTML(e.message) + '</p>';
    });
  }

  async function generateExercises(ch) {
    const sys = [
      "Je bent een Nederlandse grammatica-leraar. Maak oefeningen voor een leerder.",
      `Onderwerp: "${ch.title}". Niveau: ${ch.level}. Focus: ${ch.topic}.`,
      "Antwoord ALLEEN met geldige JSON, geen markdown, geen extra tekst:",
      "{",
      '  "exercises": [',
      "    {",
      '      "type": "fill" | "mc",',
      '      "prompt": "<context of korte vraag in NL>",',
      '      "sentence": "<zin met ____ op de plek van het ontbrekende deel; alleen voor type fill>",',
      '      "options": ["a", "b", "c", "d"],     // alleen voor type mc',
      '      "answer": "<exact het correcte antwoord (voor fill: het ontbrekende woord/de ontbrekende vorm; voor mc: één van de options letterlijk)>",',
      '      "explanation": "<1-2 zinnen uitleg in NL waarom dit correct is>"',
      "    }",
      "  ]",
      "}",
      "Maak precies 6 oefeningen, mix van fill-in en meerkeuze (3 + 3 ongeveer).",
      "De oefeningen moeten EXACT op dit grammatica-onderwerp focussen, niet op iets anders.",
      "Gebruik realistische, niet-triviale voorbeeldzinnen. Vermijd duidelijke begin-niveau-oefeningen.",
      "Voor fill-in: de ____ vervangt EXACT één woord of vorm. Geen leestekens binnen het blanco.",
      "Voor mc: één duidelijk correct antwoord. Geen 'alle bovenstaande' of 'geen van bovenstaande'.",
      "Hou de zinnen kort (max 12 woorden).",
    ].join("\n");
    const r = await window.AI.complete({
      kind: "grammar-quiz",
      system: sys,
      user: "Genereer 6 oefeningen.",
      maxTokens: 2500,
      json: true,
      noCache: true,
    });
    const parsed = JSON.parse(r.text);
    return Array.isArray(parsed.exercises) ? parsed.exercises.filter((e) => e && e.prompt && e.answer) : [];
  }

  function runQuiz(host, list, ch, regenerate) {
    if (!list.length) {
      host.innerHTML = '<p class="ai-error">De AI gaf geen oefeningen terug. Probeer opnieuw.</p>';
      return;
    }
    let idx = 0;
    let right = 0;

    function painted() {
      host.innerHTML = "";
      const item = list[idx];
      if (!item) return finish();

      host.append(el("p", { style: "font-family:var(--mono);font-size:.72rem;color:var(--ink-faint);letter-spacing:.06em;margin:0 0 .3rem" },
        "VRAAG " + (idx + 1) + " van " + list.length + " · " + (item.type === "mc" ? "meerkeuze" : "vul in")));
      host.append(el("p", { style: "font-family:var(--serif);font-size:1rem;margin:.3rem 0 .8rem" }, item.prompt || ""));

      if (item.type === "fill") {
        const sentence = item.sentence || "____";
        const parts = sentence.split("____");
        const inputBox = el("input", { type: "text", style: "border:1px solid var(--rule);background:var(--paper-2);padding:.3rem .5rem;border-radius:3px;min-width:140px;font-family:var(--serif);font-size:1rem" });
        const wrap = el("p", { style: "font-family:var(--serif);font-size:1.05rem;line-height:1.9" });
        wrap.append(document.createTextNode(parts[0] || ""), inputBox, document.createTextNode(parts[1] || ""));
        host.append(wrap);
        const submit = el("button", { onClick: () => check(inputBox.value, item) }, "Controleer");
        const feedback = el("div", { id: "fb", style: "margin-top:.6rem" });
        host.append(submit, feedback);
        inputBox.addEventListener("keydown", (e) => { if (e.key === "Enter") submit.click(); });
        setTimeout(() => inputBox.focus(), 50);
      } else {
        const opts = el("div", { style: "display:flex;flex-direction:column;gap:.3rem;margin:.5rem 0" });
        (item.options || []).forEach((o) => {
          opts.append(el("button", {
            class: "subtle",
            style: "text-align:left;padding:.5rem .8rem;font-family:var(--serif);font-size:.95rem",
            onClick: () => check(o, item),
          }, o));
        });
        host.append(opts);
        const feedback = el("div", { id: "fb", style: "margin-top:.6rem" });
        host.append(feedback);
      }
    }

    function check(answer, item) {
      const fb = host.querySelector("#fb");
      const norm = (s) => String(s || "").toLowerCase().trim().replace(/[.,;:!?'"]/g, "");
      const ok = norm(answer) === norm(item.answer);
      if (ok) right += 1;
      fb.innerHTML = `
        <div style="padding:.6rem .8rem;border-radius:3px;background:${ok ? "rgba(0,128,0,.08)" : "rgba(176,0,32,.08)"};border-left:3px solid ${ok ? "var(--groen)" : "var(--rood)"}">
          <strong style="color:${ok ? "var(--groen)" : "var(--rood)"}">${ok ? "✓ Goed!" : "✗ Niet correct"}</strong>
          ${ok ? "" : `<div style="margin-top:.2rem"><strong>Juiste antwoord:</strong> ${escapeHTML(item.answer)}</div>`}
          <div style="margin-top:.3rem;font-size:.9rem;color:var(--ink-soft)">${escapeHTML(item.explanation || "")}</div>
        </div>
      `;
      // Disable inputs
      host.querySelectorAll("button").forEach((b) => { if (!b.matches("[data-next]")) b.disabled = true; });
      host.querySelectorAll("input").forEach((i) => { i.disabled = true; });
      const next = el("button", { "data-next": "1", style: "margin-top:.6rem", onClick: () => { idx += 1; painted(); } },
        idx + 1 >= list.length ? "Resultaat" : "Volgende →");
      host.append(next);
      setTimeout(() => next.focus(), 50);
    }

    function finish() {
      host.innerHTML = "";
      const pct = Math.round((right / list.length) * 100);
      const c = pct >= 80 ? "var(--groen)" : pct >= 60 ? "var(--geel)" : "var(--rood)";
      host.append(
        el("h3", { style: "margin:0 0 .5rem;font-family:var(--serif);font-weight:600" }, "Klaar!"),
        el("p", { style: "font-family:var(--serif);font-size:2rem;font-weight:600;color:" + c + ";margin:.2rem 0" },
          right + " / " + list.length + "  (" + pct + "%)"),
        el("p", { class: "stat-note" }, pct >= 80 ? "Sterk werk." : pct >= 60 ? "Goed bezig — kijk de uitleg bij wat je miste." : "Even het hoofdstuk opnieuw lezen kan helpen."),
        el("div", { style: "margin-top:1rem;display:flex;gap:.5rem;flex-wrap:wrap" },
          el("button", { onClick: () => regenerate && regenerate() }, "🎯 Nieuwe set"),
          el("button", { class: "subtle", onClick: () => {
            const ov = document.querySelector(".oefen-overlay");
            if (ov) document.body.removeChild(ov);
          } }, "Sluiten"),
        ),
      );
    }

    painted();
  }

  // Public helper for selection-bar.js: when the user highlights text on
  // a grammar page, the Uitleg-call can include "you're reading about X
  // at level Y" so the explanation focuses on the rule, not just the word.
  function getActiveChapter() {
    const m = (location.hash || "").match(/^#\/grammatica\/(.+)$/);
    if (!m) return null;
    return CHAPTERS.find((c) => c.id === m[1]) || null;
  }

  window.GrammaticaViews = { render, getActiveChapter };
})();
