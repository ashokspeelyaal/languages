/* Werkwoorden — verb browser + drill.
 *
 * Data: static/data/verbs.json
 *   - tp="zwak":     only stem + aux stored; conjugator derives all forms via 't kofschip.
 *   - tp="zwak-vz":  same but underlying stem ends in v/z → uses -de regardless.
 *   - tp="sterk":    stem (present), impSing, impPl, vd stored; conjugator only builds person endings.
 *   - tp="onreg":    full pres array stored (7 values: ik/jij/u/hij/wij/jullie/zij).
 *
 * Scaling to thousands of verbs: just add more rows to verbs.json. The
 * conjugator handles regular ones algorithmically; you only hand-curate
 * irregular forms (~5% of Dutch verbs).
 */
(function () {
  const PERSONS = [
    { key: "ik",     label: "ik" },
    { key: "jij",    label: "jij" },
    { key: "u",      label: "u" },
    { key: "hij",    label: "hij/zij/het" },
    { key: "wij",    label: "wij" },
    { key: "jullie", label: "jullie" },
    { key: "zij",    label: "zij (mv.)" },
  ];

  let VERBS = [];        // loaded from JSON
  let docLoaded = false;

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
  function esc(s) { return String(s || "").replace(/[&<>]/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;"}[c])); }

  /* ---------- Conjugator ---------- */
  const KOFSCHIP = /[tkfspchx]$/i;
  function conjugate(v) {
    if (v.tp === "onreg") {
      const pres = (v.pres || "").split(",");
      return {
        ...v,
        pres,
        imp: [v.impSing, v.impSing, v.impSing, v.impSing, v.impPl, v.impPl, v.impPl],
        vd: v.vd,
      };
    }
    if (v.tp === "sterk") {
      // Present: same as zwak (stem + uitgang). Scheidbare ww have a particle
      // in the stem like "sta op" — we split it for stem manipulation.
      const stemFull = v.stem;
      const m = stemFull.match(/^(.+?)(\s+\S+)$/);    // "sta op" → ["sta", " op"]
      const stem = m ? m[1] : stemFull;
      const tail = m ? m[2] : "";
      const stemT = /t$/.test(stem) ? stem : (stem + "t");
      const inf = v.inf.replace(/^.+?(?= )/, "").trim() ? v.inf : v.inf; // keep as-is
      const wij = v.inf;
      return {
        ...v,
        pres: [stem + tail, stemT + tail, stemT + tail, stemT + tail, wij, wij, wij],
        imp: [v.impSing, v.impSing, v.impSing, v.impSing, v.impPl, v.impPl, v.impPl],
        vd: v.vd,
      };
    }
    // zwak / zwak-vz
    const stem = v.stem;
    const stemT = /t$/.test(stem) ? stem : (stem + "t");
    const wij = v.inf;
    // 't kofschip for past/VD. For zwak-vz: underlying stem ends in v/z (not in kofschip), use -de.
    const useT = v.tp === "zwak-vz" ? false : KOFSCHIP.test(stem);
    const past = stem + (useT ? "te" : "de");
    const pastPl = past + "n";
    const noGe = !!v.noGe;
    const vd = (noGe ? "" : "ge") + stem + (useT ? "t" : "d");
    return {
      ...v,
      pres: [stem, stemT, stemT, stemT, wij, wij, wij],
      imp: [past, past, past, past, pastPl, pastPl, pastPl],
      vd,
    };
  }

  async function loadVerbs() {
    if (docLoaded) return VERBS;
    const r = await fetch("/static/data/verbs.json", { credentials: "same-origin" });
    const data = await r.json();
    VERBS = (data.verbs || []).map(conjugate);
    docLoaded = true;
    return VERBS;
  }

  /* ---------- Top-level ---------- */
  let state = { q: "", level: "all", type: "all", view: "list", activeInf: null };

  function render(mount) {
    mount.innerHTML = "";
    const wrap = el("div");
    wrap.append(
      el("h2", { class: "view-title" }, "Werkwoorden ",
        el("span", { class: "accent" }, "· vervoegen en oefenen")),
      el("p", { class: "view-sub" },
        "Doorzoek de werkwoordenlijst, bekijk de volledige vervoeging en oefen op tegenwoordige tijd, imperfectum en voltooid deelwoord."),
    );

    // Toolbar: search + filters + drill button
    const toolbar = el("div", { style: "display:flex;flex-wrap:wrap;gap:.5rem;align-items:center;margin-bottom:1rem" });
    const search = el("input", { type: "text", placeholder: "Zoek (infinitief of vertaling)…", value: state.q,
      style: "flex:1;min-width:180px;padding:.45rem .7rem;border-radius:3px;border:1px solid var(--rule);background:var(--paper-2)" });
    search.addEventListener("input", () => { state.q = search.value; paintList(); });
    const levelSel = el("select", { class: "select-input", onChange: (e) => { state.level = e.target.value; paintList(); } },
      el("option", { value: "all" }, "Alle niveaus"),
      ...["A1","A2","B1","B2","C1"].map((l) => el("option", { value: l, selected: state.level === l || undefined }, l)));
    const typeSel = el("select", { class: "select-input", onChange: (e) => { state.type = e.target.value; paintList(); } },
      el("option", { value: "all" }, "Alle types"),
      el("option", { value: "zwak" }, "zwak"),
      el("option", { value: "zwak-vz" }, "zwak (v/z)"),
      el("option", { value: "sterk" }, "sterk"),
      el("option", { value: "onreg" }, "onregelmatig"));
    const grammarBtn = el("button", { class: "subtle", onClick: () => openVerbGrammar() }, "📖 Grammatica");
    const drillBtn = el("button", { onClick: () => openDrill() }, "🎯 Oefenen");
    toolbar.append(search, levelSel, typeSel, grammarBtn, drillBtn);
    wrap.append(toolbar);

    const status = el("p", { class: "stat-note", id: "verb-status" }, "");
    const list = el("div", { id: "verb-list" });
    wrap.append(status, list);
    mount.append(wrap);

    function paintList() {
      const q = state.q.trim().toLowerCase();
      const filtered = VERBS.filter((v) => {
        if (state.level !== "all" && v.lvl !== state.level) return false;
        if (state.type !== "all" && v.tp !== state.type) return false;
        if (q && !v.inf.toLowerCase().includes(q) && !(v.tr || "").toLowerCase().includes(q)) return false;
        return true;
      });
      status.textContent = filtered.length + " werkwoord" + (filtered.length === 1 ? "" : "en");
      list.innerHTML = "";
      const grid = el("div", { style: "display:grid;grid-template-columns:repeat(auto-fill, minmax(260px, 1fr));gap:.5rem" });
      filtered.forEach((v) => {
        const card = el("div", {
          style: "background:var(--card);border:1px solid var(--rule);border-radius:4px;padding:.55rem .85rem;cursor:pointer;display:flex;flex-direction:column",
          onClick: () => openDetail(v),
        });
        card.append(
          el("div", { style: "display:flex;justify-content:space-between;align-items:baseline" },
            el("span", { style: "font-family:var(--serif);font-size:1.05rem;font-weight:600;color:var(--ink)" }, v.inf),
            el("span", { style: "font-family:var(--mono);font-size:.7rem;letter-spacing:.06em;color:var(--ink-faint)" }, v.lvl + " · " + v.tp)),
          el("div", { style: "color:var(--ink-soft);font-size:.85rem;margin-top:.1rem" }, v.tr || ""),
          el("div", { style: "margin-top:.25rem;font-family:var(--mono);font-size:.72rem;color:var(--ink-faint)" },
            "vd: " + v.vd + "  ·  aux: " + v.aux),
        );
        grid.append(card);
      });
      list.append(grid);
    }

    loadVerbs().then(() => { paintList(); }).catch((e) => {
      status.innerHTML = '<span class="ai-error">Kon werkwoordenlijst niet laden: ' + esc(e.message) + '</span>';
    });
  }

  /* ---------- Detail modal ---------- */
  function openDetail(v) {
    const ov = el("div", {
      style: "position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:9999;display:flex;align-items:center;justify-content:center;padding:1.5rem",
      onClick: (e) => { if (e.target === ov) document.body.removeChild(ov); },
    });
    const panel = el("div", {
      style: "background:var(--paper);border-radius:6px;max-width:680px;width:100%;max-height:90vh;overflow:auto;padding:1.4rem 1.6rem",
    });
    ov.append(panel);
    document.body.append(ov);

    panel.append(
      el("div", { style: "display:flex;justify-content:space-between;align-items:baseline" },
        el("h3", { style: "margin:0;font-family:var(--serif);font-weight:600;font-size:1.6rem" }, v.inf),
        el("button", { class: "subtle", onClick: () => document.body.removeChild(ov) }, "sluiten ✕")),
      el("p", { class: "stat-note", style: "margin:.2rem 0 1rem" },
        v.tr + " · " + v.lvl + " · " + v.tp + " · hulpwerkwoord: " + v.aux + (v.scheidbaar ? " · scheidbaar" : "")),
    );

    // Volledige vervoegingstabel
    const table = el("table", { style: "width:100%;border-collapse:collapse;font-size:.92rem" });
    table.append(el("thead", null,
      el("tr", null,
        el("th", { style: "text-align:left;padding:.35rem .6rem;background:var(--paper-2);border-bottom:1px solid var(--rule)" }, "Persoon"),
        el("th", { style: "text-align:left;padding:.35rem .6rem;background:var(--paper-2);border-bottom:1px solid var(--rule)" }, "Tegenwoordige tijd"),
        el("th", { style: "text-align:left;padding:.35rem .6rem;background:var(--paper-2);border-bottom:1px solid var(--rule)" }, "Imperfectum"))));
    const tbody = el("tbody");
    PERSONS.forEach((p, i) => {
      tbody.append(el("tr", null,
        el("td", { style: "padding:.3rem .6rem;border-bottom:1px solid var(--rule);font-family:var(--mono);font-size:.85rem;color:var(--ink-faint)" }, p.label),
        el("td", { style: "padding:.3rem .6rem;border-bottom:1px solid var(--rule);font-family:var(--serif)" }, v.pres[i] || "—"),
        el("td", { style: "padding:.3rem .6rem;border-bottom:1px solid var(--rule);font-family:var(--serif)" }, v.imp[i] || "—")));
    });
    table.append(tbody);
    panel.append(table);

    // Perfectum / hulpwerkwoord
    panel.append(
      el("div", { style: "margin-top:1rem;background:var(--paper-2);border-left:3px solid var(--rood);padding:.6rem .9rem;font-family:var(--serif)" },
        el("strong", null, "Perfectum: "),
        v.aux.split("/")[0] + " + " + v.vd,
        v.aux.includes("/") ? el("span", { style: "color:var(--ink-faint);font-size:.85rem;margin-left:.5rem" }, "(of " + v.aux.split("/")[1] + " bij beweging)") : null),
      el("div", { style: "margin-top:.6rem;font-family:var(--mono);font-size:.78rem;color:var(--ink-faint);letter-spacing:.04em" },
        "Voltooid deelwoord: ", el("strong", { style: "color:var(--ink)" }, v.vd)),
    );

    // Voorbeeldzinnen vanuit AI (lazy on-demand)
    const exHost = el("div", { style: "margin-top:1.2rem" });
    const exBtn = el("button", { class: "subtle", style: "font-size:.85rem",
      onClick: async () => {
        exBtn.disabled = true;
        exBtn.textContent = "AI bedenkt voorbeeldzinnen…";
        try {
          const r = await window.AI.complete({
            kind: "verb-examples",
            system: "Je geeft 3 korte voorbeeldzinnen voor het werkwoord '" + v.inf + "' (vertaling: " + v.tr + "). Eén in tegenwoordige tijd, één in imperfectum, één in perfectum. Antwoord ALLEEN met geldige JSON: {\"voorbeelden\": [{\"tijd\": \"tt|imp|perf\", \"zin\": \"...\"}]}. Houd zinnen kort (max 10 woorden).",
            user: v.inf,
            maxTokens: 400,
            json: true,
            reasoning: "low",
          });
          const obj = JSON.parse(r.text);
          exHost.innerHTML = "";
          (obj.voorbeelden || []).forEach((e2) => {
            exHost.append(el("div", { style: "padding:.4rem .7rem;background:var(--paper-2);border-left:3px solid var(--ink-faint);margin-bottom:.3rem;font-family:var(--serif)" },
              el("span", { style: "font-family:var(--mono);font-size:.7rem;color:var(--ink-faint);margin-right:.5rem;letter-spacing:.06em" }, (e2.tijd || "").toUpperCase()),
              e2.zin || ""));
          });
        } catch (e) {
          exHost.innerHTML = '<p class="ai-error">' + esc(e.message) + '</p>';
        }
      },
    }, "✦ AI voorbeeldzinnen");
    exHost.append(exBtn);
    panel.append(exHost);
  }

  /* ---------- Drill mode ---------- */
  function openDrill() {
    if (!VERBS.length) { alert("Werkwoorden nog niet geladen."); return; }
    const ov = el("div", {
      style: "position:fixed;inset:0;background:rgba(0,0,0,.65);z-index:9999;display:flex;align-items:center;justify-content:center;padding:1.5rem;backdrop-filter:blur(2px)",
      onClick: (e) => { if (e.target === ov) document.body.removeChild(ov); },
    });
    const panel = el("div", {
      style: "background:var(--paper);border-radius:6px;max-width:640px;width:100%;max-height:90vh;overflow:auto;padding:1.4rem 1.8rem;box-shadow:0 16px 48px -8px rgba(0,0,0,.4)",
    });
    ov.append(panel);
    document.body.append(ov);

    panel.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:.4rem">
        <h3 style="margin:0;font-family:var(--serif);font-weight:600">Werkwoorden oefenen</h3>
        <button class="subtle" id="drill-close" style="font-size:.85rem">sluiten ✕</button>
      </div>
      <div id="drill-body"></div>
    `;
    panel.querySelector("#drill-close").addEventListener("click", () => document.body.removeChild(ov));

    const body = panel.querySelector("#drill-body");
    const pool = filterPool();
    if (pool.length < 5) {
      body.innerHTML = '<p class="ai-error">Niet genoeg werkwoorden in de huidige filter. Zet "Alle niveaus" en "Alle types" aan.</p>';
      return;
    }
    // Mode picker
    body.innerHTML = `
      <p class="stat-note" style="margin-top:.4rem">Kies een oefenmodus:</p>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:.6rem;margin-top:.5rem">
        <button id="mode-context" style="padding:.7rem 1rem;text-align:left;background:var(--paper-2);border:1.5px solid var(--rood);border-radius:4px;cursor:pointer;font-family:var(--sans)">
          <div style="font-weight:600;color:var(--ink)">🤖 Met context</div>
          <div style="font-size:.78rem;color:var(--ink-soft);margin-top:.2rem">10 Nederlandse zinnen met blanco's, gemixte tijden en personen.</div>
        </button>
        <button id="mode-topic" style="padding:.7rem 1rem;text-align:left;background:var(--paper-2);border:1.5px solid var(--rood);border-radius:4px;cursor:pointer;font-family:var(--sans)">
          <div style="font-weight:600;color:var(--ink)">🎯 Per onderwerp</div>
          <div style="font-size:.78rem;color:var(--ink-soft);margin-top:.2rem">Kies één werkwoord-categorie (perfectum, modaal, scheidbaar, …) en oefen gericht.</div>
        </button>
        <button id="mode-quick" style="padding:.7rem 1rem;text-align:left;background:var(--paper-2);border:1px solid var(--rule);border-radius:4px;cursor:pointer;font-family:var(--sans)">
          <div style="font-weight:600;color:var(--ink)">⚡ Snelle vragen</div>
          <div style="font-size:.78rem;color:var(--ink-soft);margin-top:.2rem">Directe vormvragen zonder zinscontext. Geen AI.</div>
        </button>
      </div>
    `;
    body.querySelector("#mode-context").addEventListener("click", () => runContextDrill(body, pool));
    body.querySelector("#mode-topic").addEventListener("click", () => showTopicPicker(body, pool));
    body.querySelector("#mode-quick").addEventListener("click", () => runDrill(body, pool));
  }

  /* ---------- Topic-focused drill ---------- */
  const TOPICS = [
    {
      id: "tt", label: "Tegenwoordige tijd", lvl: "A1",
      blurb: "stam + uitgang, ik/jij/u/hij — spelling (v→f, z→s, dubbele medeklinker)",
      chapterId: "a1-tt",
      prompt: "Focus EXCLUSIEF op vervoeging in de tegenwoordige tijd. Mix de personen ik / jij / u / hij / zij / het (skip wij/jullie/zij want die zijn gewoon de infinitief — triviaal). Test de stam-regel + de t-regel (jij/hij + t) + spelling (verlies → verlies/verliest, leef → leef/leeft, fiets → fiets/fietst).",
    },
    {
      id: "imp-zwak", label: "Imperfectum (zwak)", lvl: "A2",
      blurb: "'t kofschip — -te(n) of -de(n)",
      chapterId: "a2-imperfectum",
      prompt: "Focus EXCLUSIEF op imperfectum van ZWAKKE werkwoorden. Test de 't kofschip-regel: stem eindigt op t/k/f/s/ch/p → -te(n); anders -de(n). Mix singular en plural. Include moeilijke gevallen: stems met v/z (leven → leefde, NIET leefte).",
    },
    {
      id: "imp-sterk", label: "Imperfectum (sterk)", lvl: "A2",
      blurb: "klinkerwisseling — lopen→liep, vinden→vond",
      chapterId: "a2-imperfectum",
      prompt: "Focus EXCLUSIEF op imperfectum van STERKE werkwoorden. Vraagt om vormen waarvan de klinker verandert: lopen → liep, vinden → vond, schrijven → schreef, drinken → dronk, komen → kwam, helpen → hielp.",
    },
    {
      id: "vd-ge", label: "Voltooid deelwoord (ge- + d/t)", lvl: "A2",
      blurb: "ge-werkt vs ge-woond — kofschip toegepast op vd",
      chapterId: "a2-perfectum",
      prompt: "Focus EXCLUSIEF op voltooid deelwoorden van ZWAKKE werkwoorden met ge- voorvoegsel + d/t einde. Test 't kofschip: gewerkt vs gewoond, gefietst vs geleerd. Zin moet steeds 'hebben/zijn + ___ ' bevatten zodat het blank het vd is.",
    },
    {
      id: "vd-geen-ge", label: "Voltooid deelwoord zonder ge-", lvl: "A2",
      blurb: "verteld, ontmoet, herhaald, begrepen",
      chapterId: "a2-zonder-ge",
      prompt: "Focus EXCLUSIEF op voltooid deelwoorden VAN werkwoorden met onbeklemtoond voorvoegsel (be-, ge-, her-, ont-, ver-, er-). Deze krijgen GEEN ge- in vd: vertellen → verteld, ontmoeten → ontmoet, herhalen → herhaald, begrijpen → begrepen, verkopen → verkocht.",
    },
    {
      id: "perfectum-aux", label: "Perfectum: hebben of zijn?", lvl: "A2",
      blurb: "hulpwerkwoord-keuze: beweging/verandering → zijn",
      chapterId: "a2-perfectum",
      prompt: "Focus EXCLUSIEF op hulpwerkwoord-keuze in perfectum. De zin moet ___ HUL + voltooid deelwoord bevatten waarbij de gebruiker hebben/zijn moet kiezen. Beweging/verandering = zijn (gaan, komen, blijven, worden, vallen, sterven, beginnen). Anders hebben.",
    },
    {
      id: "scheidbaar", label: "Scheidbare werkwoorden", lvl: "A2",
      blurb: "opstaan → ik sta op — partikel naar het einde",
      chapterId: "a2-scheidbaar",
      prompt: "Focus EXCLUSIEF op scheidbare werkwoorden in hoofdzin (partikel naar het einde): opstaan, aankomen, meenemen, uitgaan, afsluiten, voorstellen, opbellen. Antwoord moet de gescheiden vorm zijn, bv. 'sta ... op' met blanco voor 'sta'. Mix tt + imperfectum.",
    },
    {
      id: "modaal", label: "Modale werkwoorden", lvl: "A2",
      blurb: "kunnen/moeten/mogen/willen + infinitief",
      chapterId: "a2-modaal",
      prompt: "Focus EXCLUSIEF op modale werkwoorden (kunnen, moeten, mogen, willen, zullen, hoeven) gevolgd door infinitief aan het einde. Test ofwel de modaal-vervoeging (ik kan, jij kunt, hij mag, …) ofwel de infinitief positie. Mix tegenwoordige en imperfectum (kon, moest, mocht, wilde, zou).",
    },
    {
      id: "reflexief", label: "Wederkerende werkwoorden", lvl: "B1",
      blurb: "zich vergissen, me herinneren, je voorstellen",
      chapterId: "b1-reflexief",
      prompt: "Focus EXCLUSIEF op wederkerende werkwoorden. Test de juiste wederkerende voornaamwoord (me/je/zich/ons): zich vergissen, zich herinneren, zich vervelen, zich voorstellen, zich aanmelden, zich wassen. Het blank kan het voornaamwoord zijn OF de werkwoordsvorm.",
    },
    {
      id: "te-infinitief", label: "Te + infinitief / om te", lvl: "B1",
      blurb: "proberen te, beginnen te, om te (doel)",
      chapterId: "b1-te",
      prompt: "Focus EXCLUSIEF op constructies met 'te + infinitief' of 'om te + infinitief'. Werkwoorden die 'te' vragen: proberen, beginnen, durven, vergeten, beloven, hopen, van plan zijn. 'Om te' voor doel. Bij scheidbare ww komt 'te' tussen partikel en stam: 'om op te staan'.",
    },
    {
      id: "zou", label: "Voorwaardelijke wijs (zou)", lvl: "B1",
      blurb: "ik zou willen, als ik tijd had zou ik komen",
      chapterId: "b1-conditioneel",
      prompt: "Focus EXCLUSIEF op de constructie 'zou(den) + infinitief'. Beleefdheid (ik zou graag…), hypothese (als ik tijd had, zou ik…), toekomst-in-verleden (hij zei dat hij zou komen). Test ook de imperfectum-conditie (als-zin met imperfectum gekoppeld aan zou-hoofdzin).",
    },
    {
      id: "plusquam", label: "Plusquamperfectum", lvl: "B1",
      blurb: "had + voltooid deelwoord — verleden vóór verleden",
      chapterId: "b1-plusquam",
      prompt: "Focus EXCLUSIEF op plusquamperfectum: 'had(den)' of 'was(en)' + voltooid deelwoord. Gebruik bij verhalen waar iets eerder gebeurd was. Zin moet duidelijk twee tijdpunten in verleden hebben: 'Toen ik thuiskwam, ___ hij al gegeten.'",
    },
    {
      id: "passief", label: "Lijdende vorm", lvl: "B1",
      blurb: "worden + voltooid deelwoord",
      chapterId: "b1-passief",
      prompt: "Focus EXCLUSIEF op de lijdende vorm. Tegenwoordige tijd: worden + vd. Imperfectum: werd + vd. Perfectum: zijn + vd (geen 'is geworden' — alleen 'is'). Test alle drie de tijden. Door + dader kan optioneel aanwezig zijn.",
    },
  ];

  function showTopicPicker(host, pool) {
    host.innerHTML = "";
    host.append(el("p", { class: "stat-note", style: "margin:.4rem 0" }, "Kies een werkwoord-categorie. AI genereert 10 zinnen specifiek over dat onderwerp."));
    const grid = el("div", { style: "display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:.4rem" });
    TOPICS.forEach((t) => {
      const card = el("button", {
        style: "text-align:left;padding:.6rem .8rem;background:var(--paper-2);border:1px solid var(--rule);border-radius:4px;cursor:pointer;font-family:var(--sans);transition:border-color .12s",
        onClick: () => runTopicDrill(host, pool, t),
        onMouseEnter: function() { this.style.borderColor = "var(--rood)"; },
        onMouseLeave: function() { this.style.borderColor = "var(--rule)"; },
      });
      card.append(
        el("div", { style: "display:flex;align-items:baseline;justify-content:space-between;gap:.4rem" },
          el("div", { style: "font-family:var(--serif);font-weight:600;color:var(--ink);font-size:.95rem" }, t.label),
          el("span", { style: "font-family:var(--mono);font-size:.65rem;color:var(--rood);letter-spacing:.06em" }, t.lvl)),
        el("div", { style: "color:var(--ink-soft);font-size:.78rem;margin-top:.2rem;line-height:1.35" }, t.blurb),
      );
      grid.append(card);
    });
    host.append(grid);
    host.append(el("p", { style: "margin-top:.7rem", class: "stat-note" },
      el("button", { class: "subtle", style: "font-size:.82rem", onClick: () => {
        // Back to mode picker
        const ev = new Event("click");
        location.hash = location.hash; // no-op to satisfy linter
        host.parentElement.parentElement.querySelector("#drill-close").parentElement.parentElement.remove();
        openDrill();
      } }, "← terug")));
  }

  async function runTopicDrill(host, pool, topic) {
    if (!window.AI || !window.AI.isConfigured()) {
      host.innerHTML = '<p class="ai-error">AI nog niet geconfigureerd (Instellingen → API-sleutel).</p>';
      return;
    }
    // Pool may be filtered by user; for topics like "vd-geen-ge" we
    // restrict further to relevant types.
    let topicPool = pool.slice();
    if (topic.id === "imp-zwak" || topic.id === "vd-ge") {
      topicPool = topicPool.filter((v) => v.tp === "zwak" || v.tp === "zwak-vz");
    } else if (topic.id === "imp-sterk") {
      topicPool = topicPool.filter((v) => v.tp === "sterk");
    } else if (topic.id === "vd-geen-ge") {
      topicPool = topicPool.filter((v) => /^(be|ge|her|ont|ver|er)/.test(v.inf));
    } else if (topic.id === "scheidbaar") {
      topicPool = topicPool.filter((v) => v.scheidbaar);
    } else if (topic.id === "modaal") {
      topicPool = topicPool.filter((v) => ["kunnen","moeten","mogen","willen","zullen","hoeven"].includes(v.inf));
    }
    if (topicPool.length < 5) {
      // Fallback: use full pool but bias AI toward topic via prompt
      topicPool = pool.slice();
    }
    const shuffled = topicPool.sort(() => Math.random() - 0.5);
    const chosen = shuffled.slice(0, Math.min(10, topicPool.length));

    host.innerHTML = '<p class="stat-note"><span class="ai-loading">10 zinnen genereren over "' + topic.label + '"…</span></p>';

    const verbList = chosen.map((v) => `- ${v.inf} (${v.tr || "?"}) — ${v.tp}, ${v.aux}, vd=${v.vd}, imp=${v.imp[0]}/${v.imp[4]}`).join("\n");
    const sys = [
      "Je bent een Nederlandse grammatica-leraar voor CNaVT-niveau.",
      "GERICHT ONDERWERP: " + topic.label + ".",
      topic.prompt,
      "",
      "Maak EXACT 10 oefeningen met natuurlijke Nederlandse zinnen die specifiek dit grammatica-onderwerp testen.",
      "Elke zin: max 14 woorden, EXACT één ____ op de plek van de vervoegde werkwoordsvorm.",
      "Gebruik werkwoorden uit de lijst, maar je mag andere zinscontextwoorden vrij kiezen.",
      "Het antwoord moet steeds één woord zijn (of korte vorm).",
      "",
      "Antwoord ALLEEN met geldige JSON:",
      "{",
      '  "oefeningen": [',
      "    {",
      '      "inf": "<infinitief van het gebruikte werkwoord>",',
      '      "zin": "<Nederlandse zin met ____>",',
      '      "antwoord": "<correcte ingevulde vorm>",',
      '      "persoon": "ik|jij|u|hij|wij|jullie|zij",',
      '      "tijd": "tegenwoordige tijd|imperfectum|perfectum|plusquamperfectum|voorwaardelijk|infinitief",',
      '      "uitleg": "<1 korte zin uitleg waarom deze vorm correct is, gericht op het onderwerp>"',
      "    }",
      "  ]",
      "}",
    ].join("\n");

    let items;
    try {
      const r = await window.AI.complete({
        kind: "verb-topic-drill",
        system: sys,
        user: "Werkwoorden:\n" + verbList,
        maxTokens: 2500,
        json: true,
        noCache: true,
      });
      const parsed = JSON.parse(r.text);
      items = (parsed.oefeningen || []).filter((q) => q && q.zin && q.antwoord && q.zin.includes("____"));
    } catch (e) {
      host.innerHTML = '<p class="ai-error">Kon oefeningen niet genereren: ' + esc(e.message) + '</p>';
      return;
    }
    if (!items.length) {
      host.innerHTML = '<p class="ai-error">AI gaf geen bruikbare zinnen terug. Probeer opnieuw.</p>';
      return;
    }
    // Show topic banner above quiz
    const banner = el("div", { style: "padding:.5rem .8rem;background:var(--paper-2);border-left:3px solid var(--rood);border-radius:3px;margin-bottom:.7rem;font-size:.85rem" },
      el("strong", { style: "color:var(--ink)" }, "🎯 " + topic.label),
      el("span", { style: "color:var(--ink-soft);margin-left:.5rem" }, "· " + topic.blurb));
    runTopicQuiz(host, items, pool, topic, banner);
  }

  function runTopicQuiz(host, items, pool, topic, banner) {
    let idx = 0, right = 0;

    function paint() {
      if (idx >= items.length) return finish();
      const item = items[idx];
      const parts = item.zin.split("____");
      host.innerHTML = "";
      host.append(banner.cloneNode(true));
      const bar = el("div", { style: "height:3px;background:var(--rule);border-radius:2px;margin-bottom:.7rem;overflow:hidden" },
        el("div", { style: "height:100%;width:" + ((idx / items.length) * 100) + "%;background:var(--rood)" }));
      host.append(bar);
      host.append(el("p", { style: "font-family:var(--mono);font-size:.72rem;color:var(--ink-faint);letter-spacing:.06em;margin:0 0 .2rem" },
        "VRAAG " + (idx + 1) + " van " + items.length + "  ·  " + (item.tijd || "?") + "  ·  " + (item.persoon || "?")));
      host.append(el("p", { style: "font-family:var(--mono);font-size:.75rem;color:var(--ink-faint);margin:0 0 .8rem" },
        "werkwoord: ", el("strong", { style: "color:var(--ink)" }, item.inf)));
      const inputBox = el("input", { type: "text",
        style: "border:1.5px solid var(--rood);background:var(--paper-2);padding:.45rem .7rem;border-radius:3px;min-width:160px;font-family:var(--serif);font-size:1.05rem" });
      const sentenceWrap = el("p", { style: "font-family:var(--serif);font-size:1.15rem;line-height:1.9;margin:.4rem 0 .9rem" });
      sentenceWrap.append(document.createTextNode(parts[0] || ""), inputBox, document.createTextNode(parts[1] || ""));
      host.append(sentenceWrap);
      const submit = el("button", { onClick: () => check(inputBox.value, item) }, "Controleer");
      const feedback = el("div", { id: "fb", style: "margin-top:.6rem" });
      host.append(submit, feedback);
      inputBox.addEventListener("keydown", (e) => { if (e.key === "Enter") submit.click(); });
      setTimeout(() => inputBox.focus(), 30);
    }

    function check(answer, item) {
      const norm = (s) => String(s || "").toLowerCase().trim().replace(/[.,;:!?'"]/g, "");
      const ok = norm(answer) === norm(item.antwoord);
      if (ok) right += 1;
      const v = pool.find((vv) => vv.inf === item.inf);
      const fullForms = v ? `tt: ${v.pres.split(",")[0]}/${v.pres.split(",")[1]}  ·  imp: ${v.imp[0]}/${v.imp[4]}  ·  vd: ${v.vd}` : "";
      const fb = host.querySelector("#fb");
      fb.innerHTML = `
        <div style="padding:.55rem .8rem;border-radius:3px;background:${ok ? "rgba(0,128,0,.08)" : "rgba(176,0,32,.08)"};border-left:3px solid ${ok ? "var(--groen)" : "var(--rood)"}">
          <strong style="color:${ok ? "var(--groen)" : "var(--rood)"}">${ok ? "✓ Goed!" : "✗ Niet correct"}</strong>
          ${ok ? "" : `<div style="margin-top:.2rem"><strong>Antwoord:</strong> ${esc(item.antwoord)}</div>`}
          <div style="margin-top:.25rem;font-size:.86rem;color:var(--ink-soft)">${esc(item.uitleg || "")}</div>
          ${fullForms ? `<div style="margin-top:.35rem;font-family:var(--mono);font-size:.7rem;color:var(--ink-faint);letter-spacing:.04em">${esc(fullForms)}</div>` : ""}
        </div>
      `;
      host.querySelectorAll("button").forEach((b) => { if (!b.matches("[data-next]")) b.disabled = true; });
      host.querySelectorAll("input").forEach((i) => { i.disabled = true; });
      const next = el("button", { "data-next": "1", style: "margin-top:.6rem", onClick: () => { idx += 1; paint(); } },
        idx + 1 >= items.length ? "Resultaat" : "Volgende →");
      host.append(next);
      setTimeout(() => next.focus(), 30);
    }

    function finish() {
      const pct = Math.round((right / items.length) * 100);
      const c = pct >= 80 ? "var(--groen)" : pct >= 60 ? "var(--geel)" : "var(--rood)";
      host.innerHTML = "";
      host.append(banner.cloneNode(true));
      host.append(
        el("h3", { style: "margin:0 0 .5rem;font-family:var(--serif);font-weight:600" }, "Klaar!"),
        el("p", { style: "font-family:var(--serif);font-size:2rem;font-weight:600;color:" + c + ";margin:.1rem 0" },
          right + " / " + items.length + "  (" + pct + "%)"),
        el("p", { class: "stat-note" }, pct >= 80 ? "Sterk! Dit onderwerp beheers je goed." : pct >= 60 ? "Goed bezig — lees de uitleg bij wat je miste." : "Even het hoofdstuk doornemen kan helpen."),
        el("div", { style: "margin-top:.7rem;display:flex;gap:.5rem;flex-wrap:wrap" },
          el("button", { onClick: () => runTopicDrill(host, pool, topic) }, "Nieuwe set (zelfde onderwerp)"),
          el("button", { class: "subtle", onClick: () => showTopicPicker(host, pool) }, "← Ander onderwerp"),
          topic.chapterId ? el("button", { class: "subtle", onClick: () => {
            // Close drill overlay, open grammar primer at this chapter.
            const ov = host.closest("[style*='position:fixed']");
            if (ov && ov.parentNode) ov.parentNode.removeChild(ov);
            setTimeout(() => {
              // Re-trigger grammar opener with this chapter pre-selected
              openVerbGrammar();
              // Find and click the chapter — best-effort
              setTimeout(() => {
                const btn = document.querySelector(".verb-grammar-overlay button");
                // simpler: user can find it; the chapter title is shown
              }, 100);
            }, 50);
          } }, "📖 Lees hoofdstuk") : null,
        ));
    }

    paint();
  }

  async function runContextDrill(host, pool) {
    if (!window.AI || !window.AI.isConfigured()) {
      host.innerHTML = '<p class="ai-error">AI nog niet geconfigureerd (Instellingen → API-sleutel). Probeer "Snelle vragen" in plaats daarvan.</p>';
      return;
    }
    // Pick 10 random verbs, prefer those with non-trivial conjugation
    const shuffled = pool.slice().sort(() => Math.random() - 0.5);
    const chosen = shuffled.slice(0, 10);
    host.innerHTML = '<p class="stat-note"><span class="ai-loading">10 contextzinnen genereren met AI…</span></p>';

    const verbList = chosen.map((v) => `- ${v.inf} (${v.tr || "?"}) — ${v.tp}, ${v.aux}, vd=${v.vd}, imp=${v.imp[0]}/${v.imp[4]}`).join("\n");
    const sys = [
      "Je bent een Nederlandse grammatica-leraar voor CNaVT-niveau.",
      "Maak EXACT 10 oefeningen — één per werkwoord uit de lijst. Voor elk werkwoord:",
      "- Schrijf één NATUURLIJKE, INHOUDELIJK ZINVOLLE Nederlandse zin die past bij de betekenis van het werkwoord.",
      "- De zin moet EXACT één ____ bevatten op de plek van de vervoegde werkwoordsvorm.",
      "- Varieer per oefening de tijd (mix: tegenwoordige tijd, imperfectum, perfectum) en de persoon (ik / jij / hij / wij / zij).",
      "- Voor PERFECTUM: schrijf het hulpwerkwoord apart in de zin (bv. 'Ik heb ____ gisteren.') zodat de leerder alleen het voltooid deelwoord invult.",
      "- Vermijd triviale gevallen zoals 'wij ____ vandaag' bij tegenwoordige tijd (antwoord = infinitief, te makkelijk).",
      "- Zorg dat de zin BETEKENISVOL is voor het werkwoord — gebruik geen 'ik ____' filler.",
      "",
      "Antwoord ALLEEN met geldige JSON, geen markdown:",
      "{",
      '  "oefeningen": [',
      "    {",
      '      "inf": "<infinitief uit de lijst>",',
      '      "zin": "<volledige Nederlandse zin met ____ op één plek>",',
      '      "antwoord": "<exact het correcte ingevulde woord (zonder spaties errond)>",',
      '      "persoon": "ik|jij|u|hij|wij|jullie|zij",',
      '      "tijd": "tegenwoordige tijd|imperfectum|perfectum",',
      '      "uitleg": "<1 korte zin uitleg waarom deze vorm: bv. \'1e persoon ev = stam zonder -t\' of \'sterk: vond is imperfectum singular\'>"',
      "    }",
      "  ]",
      "}",
      "",
      "Houd elke zin onder 14 woorden. Antwoorden moeten één woord zijn (of een korte werkwoordsgroep bij scheidbare werkwoorden).",
    ].join("\n");

    let items;
    try {
      const r = await window.AI.complete({
        kind: "verb-context-drill",
        system: sys,
        user: "Werkwoorden:\n" + verbList,
        maxTokens: 2500,
        json: true,
        noCache: true,
      });
      const parsed = JSON.parse(r.text);
      items = (parsed.oefeningen || []).filter((q) => q && q.zin && q.antwoord && q.zin.includes("____"));
    } catch (e) {
      host.innerHTML = '<p class="ai-error">Kon oefeningen niet genereren: ' + esc(e.message) + '</p>';
      return;
    }
    if (!items.length) {
      host.innerHTML = '<p class="ai-error">AI gaf geen bruikbare zinnen terug. Probeer opnieuw.</p>';
      return;
    }
    runContextQuiz(host, items, pool);
  }

  function runContextQuiz(host, items, pool) {
    let idx = 0, right = 0;

    function paint() {
      if (idx >= items.length) return finish();
      const item = items[idx];
      const parts = item.zin.split("____");
      host.innerHTML = "";
      // Progress bar
      const bar = el("div", { style: "height:3px;background:var(--rule);border-radius:2px;margin-bottom:.7rem;overflow:hidden" },
        el("div", { style: "height:100%;width:" + ((idx / items.length) * 100) + "%;background:var(--rood);transition:width .2s" }));
      host.append(bar);
      host.append(el("p", { style: "font-family:var(--mono);font-size:.72rem;color:var(--ink-faint);letter-spacing:.06em;margin:0 0 .2rem" },
        "VRAAG " + (idx + 1) + " van " + items.length + "  ·  " + (item.tijd || "?") + "  ·  " + (item.persoon || "?")));
      host.append(el("p", { style: "font-family:var(--mono);font-size:.75rem;color:var(--ink-faint);margin:0 0 .9rem" },
        "werkwoord: ", el("strong", { style: "color:var(--ink)" }, item.inf)));

      const inputBox = el("input", { type: "text",
        style: "border:1.5px solid var(--rood);background:var(--paper-2);padding:.45rem .7rem;border-radius:3px;min-width:160px;font-family:var(--serif);font-size:1.05rem" });
      const sentenceWrap = el("p", { style: "font-family:var(--serif);font-size:1.15rem;line-height:1.9;margin:.4rem 0 .9rem" });
      sentenceWrap.append(document.createTextNode(parts[0] || ""), inputBox, document.createTextNode(parts[1] || ""));
      host.append(sentenceWrap);
      const submit = el("button", { onClick: () => check(inputBox.value, item) }, "Controleer");
      const feedback = el("div", { id: "fb", style: "margin-top:.6rem" });
      host.append(submit, feedback);
      inputBox.addEventListener("keydown", (e) => { if (e.key === "Enter") submit.click(); });
      setTimeout(() => inputBox.focus(), 30);
    }

    function check(answer, item) {
      const norm = (s) => String(s || "").toLowerCase().trim().replace(/[.,;:!?'"]/g, "");
      const ok = norm(answer) === norm(item.antwoord);
      if (ok) right += 1;
      const v = pool.find((vv) => vv.inf === item.inf);
      const fullForms = v ? `tt: ${v.pres.split(",")[0]}/${v.pres.split(",")[1]}  ·  imp: ${v.imp[0]}/${v.imp[4]}  ·  vd: ${v.vd}` : "";
      const fb = host.querySelector("#fb");
      fb.innerHTML = `
        <div style="padding:.55rem .8rem;border-radius:3px;background:${ok ? "rgba(0,128,0,.08)" : "rgba(176,0,32,.08)"};border-left:3px solid ${ok ? "var(--groen)" : "var(--rood)"}">
          <strong style="color:${ok ? "var(--groen)" : "var(--rood)"}">${ok ? "✓ Goed!" : "✗ Niet correct"}</strong>
          ${ok ? "" : `<div style="margin-top:.2rem"><strong>Antwoord:</strong> ${esc(item.antwoord)}</div>`}
          <div style="margin-top:.25rem;font-size:.86rem;color:var(--ink-soft)">${esc(item.uitleg || "")}</div>
          ${fullForms ? `<div style="margin-top:.35rem;font-family:var(--mono);font-size:.7rem;color:var(--ink-faint);letter-spacing:.04em">${esc(fullForms)}</div>` : ""}
        </div>
      `;
      host.querySelectorAll("button").forEach((b) => { if (!b.matches("[data-next]")) b.disabled = true; });
      host.querySelectorAll("input").forEach((i) => { i.disabled = true; });
      const next = el("button", { "data-next": "1", style: "margin-top:.6rem", onClick: () => { idx += 1; paint(); } },
        idx + 1 >= items.length ? "Resultaat" : "Volgende →");
      host.append(next);
      setTimeout(() => next.focus(), 30);
    }

    function finish() {
      const pct = Math.round((right / items.length) * 100);
      const c = pct >= 80 ? "var(--groen)" : pct >= 60 ? "var(--geel)" : "var(--rood)";
      host.innerHTML = "";
      host.append(
        el("h3", { style: "margin:0 0 .5rem;font-family:var(--serif);font-weight:600" }, "Klaar!"),
        el("p", { style: "font-family:var(--serif);font-size:2rem;font-weight:600;color:" + c + ";margin:.1rem 0" },
          right + " / " + items.length + "  (" + pct + "%)"),
        el("div", { style: "margin-top:.7rem;display:flex;gap:.5rem;flex-wrap:wrap" },
          el("button", { onClick: () => runContextDrill(host, pool) }, "Nieuwe AI-set"),
          el("button", { class: "subtle", onClick: () => runDrill(host, pool) }, "⚡ Snelle ronde"),
          el("button", { class: "subtle", onClick: () => {
            const ov = host.closest("[style*='position:fixed']");
            if (ov && ov.parentNode) ov.parentNode.removeChild(ov);
          } }, "Sluiten"),
        ));
    }

    paint();
  }

  function filterPool() {
    return VERBS.filter((v) => {
      if (state.level !== "all" && v.lvl !== state.level) return false;
      if (state.type !== "all" && v.tp !== state.type) return false;
      return true;
    });
  }

  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  function makeQuestion(pool) {
    const v = pick(pool);
    // Gewogen vraagtype-selectie: focus op wat moeilijk is (vd + imperfectum),
    // minder op trivial gevallen (wij/jullie/zij in tegenwoordige tijd = infinitief).
    const r = Math.random();
    let t;
    if      (r < 0.35) t = "vd";          // voltooid deelwoord — moeilijkst, hoogste gewicht
    else if (r < 0.55) t = "imp_sing";    // imperfectum singular (ik/hij)
    else if (r < 0.70) t = "imp_pl";      // imperfectum plural (wij/zij)
    else if (r < 0.85) t = "pres_sing";   // tt singular — alleen ik/jij/hij (waar stam+t kwestie speelt)
    else if (r < 0.95) t = "aux";         // hebben of zijn
    else               t = "type";        // zwak/sterk/onreg

    if (t === "vd") {
      return {
        type: "fill",
        prompt: `Voltooid deelwoord van: ${v.inf}  (${v.tr})`,
        answer: v.vd,
        explain: v.tp === "zwak"
          ? `Zwak. Stam=${v.stem}, ${KOFSCHIP.test(v.stem.split(" ")[0]) ? "kofschip → ge-...-t" : "→ ge-...-d"}.`
          : v.tp === "zwak-vz" ? `Zwak met onderliggende v/z → -d (geen -t ondanks oppervlaktevorm).`
          : v.tp === "sterk" ? "Sterk werkwoord — leer de vorm uit het hoofd."
          : "Onregelmatig werkwoord.",
      };
    }

    if (t === "imp_sing") {
      const ans = v.imp[0]; // alle singular forms zijn identiek (ik/jij/u/hij)
      if (!ans || ans === "—") return makeQuestion(pool);
      const lbl = pick(["ik", "jij", "u", "hij"]);
      return {
        type: "fill",
        prompt: `Imperfectum: ${v.inf} (${v.tr})  ·  ${lbl}`,
        answer: ans,
        explain: v.tp === "zwak" ? `Zwak. Stam+${KOFSCHIP.test(v.stem.split(" ")[0]) ? "te" : "de"}.`
          : v.tp === "zwak-vz" ? `Zwak (v/z): stam+de.` : `${v.tp} werkwoord.`,
      };
    }

    if (t === "imp_pl") {
      const ans = v.imp[4]; // wij/jullie/zij — alle plural forms identiek
      if (!ans || ans === "—") return makeQuestion(pool);
      const lbl = pick(["wij", "jullie", "zij (mv.)"]);
      return {
        type: "fill",
        prompt: `Imperfectum: ${v.inf} (${v.tr})  ·  ${lbl}`,
        answer: ans,
        explain: `Meervoudsvorm = singular + n.`,
      };
    }

    if (t === "pres_sing") {
      // Alleen ik/jij/hij — wij/jullie/zij is gewoon de infinitief (trivial).
      const persons = [
        { i: 0, lbl: "ik" },
        { i: 1, lbl: "jij" },
        { i: 3, lbl: "hij / zij / het" },
      ];
      const p = pick(persons);
      const ans = v.pres.split(",")[p.i];
      if (!ans || ans === "—") return makeQuestion(pool);
      return {
        type: "fill",
        prompt: `Tegenwoordige tijd: ${v.inf} (${v.tr})  ·  ${p.lbl}`,
        answer: ans,
        explain: p.i === 0 ? "1e persoon = stam (zonder -t)." : "2e/3e persoon = stam + t.",
      };
    }

    if (t === "aux") {
      // hebben of zijn voor perfectum
      const auxFirst = v.aux.split("/")[0];
      const opt = ["hebben", "zijn"];
      // Sommige werkwoorden zijn "—" (zullen) — skip
      if (!["hebben", "zijn"].includes(auxFirst)) return makeQuestion(pool);
      return {
        type: "mc",
        prompt: `Welk hulpwerkwoord bij "${v.inf}" in het perfectum?`,
        options: opt,
        answer: auxFirst,
        explain: v.aux.includes("/")
          ? `Beide kunnen (${v.aux}). Bij beweging/verandering: zijn. Anders: hebben.`
          : (v.aux === "zijn" ? "Beweging of verandering → zijn." : "Standaard → hebben."),
      };
    }

    // type
    return {
      type: "mc",
      prompt: `Wat voor type werkwoord is "${v.inf}"?`,
      options: ["zwak", "sterk", "onregelmatig"],
      answer: v.tp === "zwak-vz" ? "zwak" : (v.tp === "onreg" ? "onregelmatig" : v.tp),
      explain: "vd: " + v.vd + "  ·  imperf: " + v.imp[0] + " / " + v.imp[4],
    };
  }

  function runDrill(host, pool) {
    const QUESTIONS = 10;
    let idx = 0, right = 0;
    const items = Array.from({ length: QUESTIONS }, () => makeQuestion(pool));

    function paint() {
      if (idx >= QUESTIONS) return finish();
      const item = items[idx];
      host.innerHTML = "";
      host.append(
        el("p", { style: "font-family:var(--mono);font-size:.72rem;color:var(--ink-faint);letter-spacing:.06em;margin:0 0 .3rem" },
          "VRAAG " + (idx + 1) + " van " + QUESTIONS),
        el("p", { style: "font-family:var(--serif);font-size:1.05rem;margin:0 0 .8rem" }, item.prompt),
      );
      if (item.type === "fill") {
        const inp = el("input", { type: "text",
          style: "padding:.45rem .65rem;border-radius:3px;border:1px solid var(--rule);background:var(--paper-2);font-family:var(--serif);font-size:1rem;min-width:200px" });
        host.append(inp);
        const submit = el("button", { style: "margin-left:.5rem", onClick: () => check(inp.value, item) }, "Controleer");
        host.append(submit, el("div", { id: "drill-fb", style: "margin-top:.7rem" }));
        inp.addEventListener("keydown", (e) => { if (e.key === "Enter") submit.click(); });
        setTimeout(() => inp.focus(), 30);
      } else {
        const opts = el("div", { style: "display:flex;flex-direction:column;gap:.3rem;margin:.4rem 0" });
        (item.options || []).forEach((o) => {
          opts.append(el("button", { class: "subtle", style: "text-align:left;padding:.45rem .8rem;font-family:var(--serif)", onClick: () => check(o, item) }, o));
        });
        host.append(opts, el("div", { id: "drill-fb", style: "margin-top:.7rem" }));
      }
    }

    function check(answer, item) {
      const norm = (s) => String(s || "").toLowerCase().trim().replace(/[.,;:!?'"]/g, "");
      const ok = norm(answer) === norm(item.answer);
      if (ok) right += 1;
      const fb = host.querySelector("#drill-fb");
      fb.innerHTML = `
        <div style="padding:.5rem .75rem;border-radius:3px;background:${ok ? "rgba(0,128,0,.08)" : "rgba(176,0,32,.08)"};border-left:3px solid ${ok ? "var(--groen)" : "var(--rood)"}">
          <strong style="color:${ok ? "var(--groen)" : "var(--rood)"}">${ok ? "✓ Goed!" : "✗ Niet correct"}</strong>
          ${ok ? "" : `<div><strong>Antwoord:</strong> ${esc(item.answer)}</div>`}
          <div style="margin-top:.25rem;font-size:.86rem;color:var(--ink-soft)">${esc(item.explain || "")}</div>
        </div>
      `;
      host.querySelectorAll("button").forEach((b) => { if (!b.matches("[data-next]")) b.disabled = true; });
      host.querySelectorAll("input").forEach((i) => { i.disabled = true; });
      const next = el("button", { "data-next": "1", style: "margin-top:.6rem", onClick: () => { idx += 1; paint(); } },
        idx + 1 >= QUESTIONS ? "Resultaat" : "Volgende →");
      host.append(next);
      setTimeout(() => next.focus(), 30);
    }

    function finish() {
      const pct = Math.round((right / QUESTIONS) * 100);
      const c = pct >= 80 ? "var(--groen)" : pct >= 60 ? "var(--geel)" : "var(--rood)";
      host.innerHTML = "";
      host.append(
        el("h3", { style: "margin:0 0 .5rem;font-family:var(--serif);font-weight:600" }, "Klaar!"),
        el("p", { style: "font-family:var(--serif);font-size:2rem;font-weight:600;color:" + c + ";margin:.1rem 0" },
          right + " / " + QUESTIONS + "  (" + pct + "%)"),
        el("div", { style: "margin-top:.7rem;display:flex;gap:.5rem;flex-wrap:wrap" },
          el("button", { onClick: () => runDrill(host, pool) }, "Nieuwe ronde"),
          el("button", { class: "subtle", onClick: () => {
            const ov = host.closest("[style*='position:fixed']");
            if (ov && ov.parentNode) ov.parentNode.removeChild(ov);
          } }, "Sluiten"),
        ));
    }

    paint();
  }

  /* ---------- Verb grammar primer (modal) ----------
   * Curated subset of /grammatica chapters focused on werkwoorden:
   * vervoeging, ge-/d/t, prefix-regels, scheidbaarheid, modale ww,
   * passive, infinitief-constructies, plusquamperfectum, onregelmatige.
   * Content gefetched uit /static/grammatica-overzicht.html zodat de
   * single source of truth daar blijft.
   */
  const VERB_GRAMMAR_CHAPTERS = [
    { id: "a1-tt",            lvl: "A1", title: "Tegenwoordige tijd",                     subtitle: "Stam + uitgang, onregelmatige zijn/hebben/kunnen" },
    { id: "a1-zijn-hebben",   lvl: "A1", title: "Zijn en hebben",                         subtitle: "Vervoeging + hulpwerkwoordkeuze bij perfectum" },
    { id: "a2-imperfectum",   lvl: "A2", title: "Imperfectum",                            subtitle: "Zwak (-te/-de) en sterk (klinkerwisseling), 't kofschip" },
    { id: "a2-perfectum",     lvl: "A2", title: "Perfectum — ge- + d/t",                  subtitle: "Voltooid deelwoord, hulpwerkwoord hebben/zijn" },
    { id: "a2-zonder-ge",     lvl: "A2", title: "Werkwoorden zonder ge-",                 subtitle: "be-, ge-, her-, ont-, ver-, er- voorvoegsels" },
    { id: "a2-scheidbaar",    lvl: "A2", title: "Scheidbare / onscheidbare werkwoorden",  subtitle: "Klemtoonregel, opstaan vs vertellen" },
    { id: "a2-modaal",        lvl: "A2", title: "Modale werkwoorden",                     subtitle: "kunnen/moeten/mogen/willen/zullen/hoeven" },
    { id: "b1-conditioneel",  lvl: "B1", title: "Voorwaardelijke wijs — zou",             subtitle: "Beleefdheid, hypothese, toekomst-in-verleden" },
    { id: "b1-reflexief",     lvl: "B1", title: "Wederkerende werkwoorden",               subtitle: "zich vergissen/herinneren/vervelen" },
    { id: "b1-plusquam",      lvl: "B1", title: "Plusquamperfectum",                      subtitle: "had/was + voltooid deelwoord (verleden vóór verleden)" },
    { id: "b1-passief",       lvl: "B1", title: "Lijdende vorm — worden",                 subtitle: "worden + vd / zijn + vd in perfectum" },
    { id: "b1-te",            lvl: "B1", title: "Te + infinitief / om te + infinitief",   subtitle: "proberen/beginnen/durven + te; doel met om te" },
    { id: "bijlage-onregelmatig", lvl: "Bijlage", title: "Onregelmatige werkwoorden",     subtitle: "Volledige lijst sterk + onregelmatig" },
  ];

  let _activeGrammarChapter = null;

  function openVerbGrammar() {
    const ov = el("div", {
      class: "verb-grammar-overlay",
      style: "position:fixed;inset:0;background:rgba(0,0,0,.65);z-index:9999;display:flex;align-items:center;justify-content:center;padding:1.2rem;backdrop-filter:blur(2px)",
      onClick: (e) => { if (e.target === ov) document.body.removeChild(ov); },
    });
    const isNarrow = window.matchMedia && window.matchMedia("(max-width: 760px)").matches;
    const panel = el("div", {
      style: "background:var(--paper);border-radius:6px;width:100%;" +
             (isNarrow ? "max-width:100%;max-height:100vh;height:100vh;" : "max-width:820px;max-height:90vh;") +
             "overflow:hidden;display:flex;flex-direction:column;box-shadow:0 16px 48px -8px rgba(0,0,0,.4)",
    });
    ov.append(panel);
    document.body.append(ov);

    function close() { if (ov.parentNode) document.body.removeChild(ov); }
    document.addEventListener("keydown", function esc(e) { if (e.key === "Escape") { close(); document.removeEventListener("keydown", esc); } });

    // Header
    const header = el("div", { style: "padding:1rem 1.4rem;border-bottom:1px solid var(--rule);display:flex;align-items:baseline;justify-content:space-between;gap:1rem;flex-shrink:0" });
    const title = el("h3", { style: "margin:0;font-family:var(--serif);font-weight:600;font-size:1.2rem" }, "Werkwoord-grammatica");
    const back = el("button", { class: "subtle", style: "font-size:.85rem;display:none", onClick: () => paintList() }, "← terug");
    const closeBtn = el("button", { class: "subtle", style: "font-size:.85rem", onClick: close }, "sluiten ✕");
    header.append(title, back, closeBtn);
    panel.append(header);

    const body = el("div", { style: "padding:1rem 1.4rem;overflow-y:auto;flex:1;min-height:0" });
    panel.append(body);

    function paintList() {
      back.style.display = "none";
      title.textContent = "Werkwoord-grammatica";
      _activeGrammarChapter = null;
      body.innerHTML = "";
      body.append(el("p", { class: "stat-note", style: "margin:0 0 .7rem" },
        "Snelle naslag — kies een hoofdstuk om te bekijken. Voor alles in één doorlopend document: ",
        el("a", { href: "#/grammatica", onClick: close, style: "color:var(--rood)" }, "open volledige grammatica"), "."));

      const groups = {};
      VERB_GRAMMAR_CHAPTERS.forEach((c) => { (groups[c.lvl] = groups[c.lvl] || []).push(c); });
      ["A1", "A2", "B1", "Bijlage"].forEach((lvl) => {
        if (!groups[lvl]) return;
        body.append(el("div", { style: "font-family:var(--mono);font-size:.72rem;letter-spacing:.14em;text-transform:uppercase;color:var(--ink-faint);margin:1rem 0 .35rem" }, lvl));
        groups[lvl].forEach((c) => {
          const card = el("button", {
            style: "display:block;width:100%;text-align:left;padding:.7rem .9rem;border:1px solid var(--rule);border-radius:4px;margin-bottom:.35rem;background:var(--paper-2);cursor:pointer;font-family:var(--sans);transition:border-color .12s",
            onClick: () => paintChapter(c),
            onMouseEnter: function() { this.style.borderColor = "var(--rood)"; },
            onMouseLeave: function() { this.style.borderColor = "var(--rule)"; },
          });
          card.append(
            el("div", { style: "font-family:var(--serif);font-size:1rem;color:var(--ink);font-weight:600" }, c.title),
            el("div", { style: "color:var(--ink-soft);font-size:.82rem;margin-top:.15rem" }, c.subtitle),
          );
          body.append(card);
        });
      });
    }

    async function paintChapter(c) {
      back.style.display = "inline-block";
      title.textContent = c.title;
      _activeGrammarChapter = c.id;
      body.innerHTML = '<p class="stat-note"><span class="ai-loading">Laden…</span></p>';
      try {
        if (!window.GrammaticaViews || !window.GrammaticaViews.getChapterContent) {
          throw new Error("Grammatica-module nog niet geladen.");
        }
        const article = await window.GrammaticaViews.getChapterContent(c.id);
        if (!article) { body.innerHTML = '<p class="ai-error">Hoofdstuk niet gevonden in grammatica-overzicht.html</p>'; return; }
        body.innerHTML = "";
        const firstH2 = article.querySelector("h2");
        if (firstH2) firstH2.remove();
        body.append(article);
        // Tap "open volledige" links should close modal first
        body.querySelectorAll("a[href^='#/']").forEach((a) => a.addEventListener("click", close));
        body.scrollTop = 0;
      } catch (e) {
        body.innerHTML = '<p class="ai-error">' + esc(e.message) + '</p>';
      }
    }

    paintList();
  }

  window.WerkwoordenViews = { render };
})();
