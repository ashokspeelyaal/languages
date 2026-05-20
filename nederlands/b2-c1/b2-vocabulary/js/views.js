/* All views render into #view. Each view export is a function that takes the
 * mount node and any params; it returns an optional cleanup function. */
(function () {
  const $ = (sel, root) => (root || document).querySelector(sel);
  const el = (tag, props, ...children) => {
    const n = document.createElement(tag);
    if (props) {
      Object.entries(props).forEach(([k, v]) => {
        if (k === "class") n.className = v;
        else if (k === "html") n.innerHTML = v;
        else if (k.startsWith("on") && typeof v === "function") n.addEventListener(k.slice(2).toLowerCase(), v);
        else if (k === "for") n.htmlFor = v;
        else if (v === true) n.setAttribute(k, "");
        else if (v != null && v !== false) n.setAttribute(k, v);
      });
    }
    for (const c of children.flat()) {
      if (c == null || c === false) continue;
      n.append(c.nodeType ? c : document.createTextNode(c));
    }
    return n;
  };

  const ITEMS = window.VOCAB_DATA.items;

  function levelBadge(lvl) {
    return el("span", { class: `level-badge l-${lvl}` }, lvl);
  }

  function categoryList() {
    const cats = new Set();
    ITEMS.forEach((it) => cats.add(it.category));
    return Array.from(cats).sort();
  }

  function activeItems() {
    const s = window.Store.state.settings;
    return ITEMS.filter((it) => {
      if (!s.levels.includes(it.level)) return false;
      if (s.categoryFilter && it.category !== s.categoryFilter) return false;
      return true;
    });
  }
  // Comparison-pair items use ≠ (e.g. "groei ≠ ontwikkeling"); they're not
  // a single typeable answer. Strip them from modes that require typed input.
  function isComparisonItem(it) {
    return /[≠]/.test(it.dutch) || /[≠]/.test(it.english || "");
  }
  function typeableItems() {
    return activeItems().filter((it) => !isComparisonItem(it));
  }

  /* ============ Dashboard ============ */
  function renderDashboard(mount) {
    const s = window.Store.state;
    const items = ITEMS;
    const counts = window.SRS.boxCounts(items);
    const totalSeen = items.filter((it) => s.items[it.id] && s.items[it.id].seen > 0).length;
    const mastered = items.filter((it) => s.items[it.id] && s.items[it.id].box === 5).length;
    const starred = items.filter((it) => s.items[it.id] && s.items[it.id].starred).length;
    const todayStats = s.sessionStats.today;
    const todayTotal = todayStats.right + todayStats.wrong;
    const todayAcc = todayTotal ? Math.round((todayStats.right / todayTotal) * 100) : 0;

    // Weakest categories: highest wrong-rate among seen
    const catStats = {};
    items.forEach((it) => {
      const p = s.items[it.id];
      if (!p || p.seen < 2) return;
      if (!catStats[it.category]) catStats[it.category] = { wrong: 0, total: 0 };
      catStats[it.category].wrong += p.wrong;
      catStats[it.category].total += p.seen;
    });
    const weak = Object.entries(catStats)
      .map(([cat, x]) => ({ cat, rate: x.wrong / x.total, n: x.total }))
      .filter((x) => x.n >= 3)
      .sort((a, b) => b.rate - a.rate)
      .slice(0, 5);

    mount.innerHTML = "";
    mount.append(
      el("h2", { class: "view-title" }, "Goedendag.", el("span", { class: "accent" }, " Begin een sessie.")),
      el("p", { class: "view-sub" },
        "Korte ophaaltjes, vaak herhaald. Je vergeet en haalt het terug — dat is waar het stikt."
      ),

      // Stat row
      el("div", { class: "dash-grid" },
        statTile("Vandaag", `${todayStats.right}/${todayTotal}`, `${todayAcc}% raak`, ""),
        statTile("Reeks", s.streak.count + " dagen", lastSeenNote(s.streak.lastDay), "delft"),
        statTile("Gezien", `${totalSeen}`, `van ${items.length}`, "geel"),
        statTile("Gemeesterd", `${mastered}`, `${Math.round((mastered / items.length) * 100)}% in vak 5`, "groen"),
      ),

      // Session card + Leitner state
      el("div", { class: "dash-row" },
        el("div", { class: "session-card" },
          el("h3", null, "Begin een ophaalsessie"),
          el("p", null, `${counts.dueToday} kaarten staan klaar — daarvan ${counts.unseen} nog niet eerder gezien.`),
          el("div", { class: "session-actions" },
            el("a", { class: "btn", href: "#/flashcards" }, "Flashcards"),
            el("a", { class: "btn subtle", href: "#/typed" }, "Generation"),
            el("a", { class: "btn subtle", href: "#/cloze" }, "Cloze"),
            el("a", { class: "btn subtle", href: "#/mixed" }, "Gemengde toets"),
          ),
          el("div", { class: "leitner-bar" },
            leitnerBox(1, counts[1], counts.dueToday > 0),
            leitnerBox(2, counts[2]),
            leitnerBox(3, counts[3]),
            leitnerBox(4, counts[4]),
            leitnerBox(5, counts[5]),
          ),
          el("p", { class: "stat-note", style: "margin-top:.5rem" },
            "Vak 1 → 1 dag · Vak 2 → 2 d · Vak 3 → 4 d · Vak 4 → 9 d · Vak 5 → 19 d"
          ),
        ),
        el("div", { class: "card card-pad" },
          el("h3", { style: "font-family:var(--serif);margin:.1rem 0 1rem" }, "Zwakke plekken"),
          weak.length === 0
            ? el("p", { class: "stat-note" }, "Nog niet genoeg data. Blijf oefenen — dit vult zich vanzelf.")
            : el("ul", { class: "weak-list" },
                weak.map((w) => el("li", null,
                  el("span", null, w.cat),
                  el("span", { class: "weak-bar" }, el("span", { style: `width:${Math.round(w.rate * 100)}%` })),
                  el("span", { class: "weak-pct" }, `${Math.round(w.rate * 100)}%`),
                ))
              )
        ),
      ),

      // Settings card
      el("div", { class: "card card-pad", style: "margin-top:1rem" },
        el("h3", { style: "font-family:var(--serif);margin:.1rem 0 1rem" }, "Instellingen"),
        el("div", { class: "browse-toolbar" },
          el("label", { for: "lvl" }, "Niveaus:"),
          ...["A2", "B1", "B2", "C1"].map((lvl) => {
            const checked = s.settings.levels.includes(lvl);
            return el("label", { style: "display:flex;align-items:center;gap:.3rem;margin-right:.6rem" },
              el("input", {
                type: "checkbox", value: lvl, checked: checked || undefined,
                onChange: (e) => {
                  if (e.target.checked) s.settings.levels.push(lvl);
                  else s.settings.levels = s.settings.levels.filter((x) => x !== lvl);
                  window.Store.save();
                },
              }),
              lvl
            );
          }),
          el("label", { for: "size", style: "margin-left:1rem" }, "Per sessie:"),
          el("select", {
            class: "select-input", id: "size",
            onChange: (e) => { s.settings.sessionSize = parseInt(e.target.value, 10); window.Store.save(); },
          },
            ...[10, 15, 20, 30, 50].map((n) =>
              el("option", { value: n, selected: n === s.settings.sessionSize || undefined }, n))
          ),
        ),
        el("div", { style: "display:flex;gap:.5rem;flex-wrap:wrap;margin-top:.5rem" },
          el("button", { class: "subtle", onClick: window.Store.exportJSON }, "Exporteer voortgang"),
          el("button", { class: "subtle danger", onClick: window.Store.reset }, "Reset alle voortgang"),
        ),
      ),
    );
  }

  function statTile(label, value, note, variant) {
    return el("div", { class: `stat ${variant || ""}` },
      el("p", { class: "stat-label" }, label),
      el("p", { class: "stat-value" }, value),
      el("p", { class: "stat-note" }, note),
    );
  }
  function leitnerBox(n, count, highlight) {
    return el("div", { class: `leitner-box ${highlight ? "due" : ""}` },
      el("span", { class: "box-num" }, String(count)),
      el("span", { class: "box-label" }, `vak ${n}`),
    );
  }
  function lastSeenNote(day) {
    if (!day) return "Begin vandaag";
    if (day === window.Store.today()) return "vandaag actief";
    return `laatst: ${day}`;
  }

  /* ============ Browse ============ */
  function renderBrowse(mount) {
    let search = "";
    let levelF = new Set(window.Store.state.settings.levels);
    let catF = window.Store.state.settings.categoryFilter || "";

    mount.innerHTML = "";
    mount.append(
      el("h2", { class: "view-title" }, "Bladeren"),
      el("p", { class: "view-sub" },
        "De volledige woordenlijst. Klik op een rij voor het voorbeeld. Markeer met ★ voor extra herhaling."
      ),
    );

    const toolbar = el("div", { class: "browse-toolbar" });
    const searchInput = el("input", {
      type: "search", class: "search-input", placeholder: "Zoek Nederlands of Engels...",
      onInput: (e) => { search = e.target.value; render(); },
    });

    const levelSel = el("div", { style: "display:flex;gap:.3rem" },
      ...["A2", "B1", "B2", "C1"].map((lvl) =>
        el("label", { style: "display:flex;align-items:center;gap:.3rem;font-size:.88rem" },
          el("input", {
            type: "checkbox", checked: levelF.has(lvl) || undefined,
            onChange: (e) => {
              if (e.target.checked) levelF.add(lvl); else levelF.delete(lvl);
              render();
            },
          }),
          lvl
        ))
    );

    const cats = categoryList();
    const catSel = el("select", { class: "select-input",
      onChange: (e) => { catF = e.target.value; render(); },
    },
      el("option", { value: "" }, "Alle categorieën"),
      ...cats.map((c) => el("option", { value: c, selected: c === catF || undefined }, c))
    );

    const countChip = el("span", { class: "count-chip" }, "");
    toolbar.append(searchInput, levelSel, catSel, countChip);

    const listMount = el("ul", { class: "entry-list card", style: "padding:0;list-style:none" });
    mount.append(toolbar, listMount);

    function render() {
      const q = window.Match.strip(search);
      const filtered = ITEMS.filter((it) => {
        if (!levelF.has(it.level)) return false;
        if (catF && it.category !== catF) return false;
        if (!q) return true;
        return (
          window.Match.strip(it.dutch).includes(q) ||
          window.Match.strip(it.english).includes(q) ||
          (it.exampleNL && window.Match.strip(it.exampleNL).includes(q))
        );
      });
      countChip.textContent = `${filtered.length} items`;
      listMount.innerHTML = "";
      // Cap at 400 rows to keep DOM snappy
      const display = filtered.slice(0, 400);
      display.forEach((it) => listMount.append(entryRow(it)));
      if (filtered.length > display.length) {
        listMount.append(el("li", { class: "entry", style: "justify-content:center" },
          el("span", { class: "entry-cat", style: "grid-column:1/-1;text-align:center" },
            `... en ${filtered.length - display.length} meer. Verfijn je zoekopdracht.`)));
      }
      if (filtered.length === 0) {
        listMount.append(el("li", { class: "empty" },
          el("h3", null, "Niets gevonden"),
          el("p", null, "Probeer een ander woord of zet filters terug.")));
      }
    }

    function entryRow(it) {
      const p = window.Store.state.items[it.id] || {};
      const row = el("li", { class: "entry" });
      row.append(
        el("div", { class: "entry-nl" }, levelBadge(it.level), it.dutch),
        el("div", { class: "entry-en" }, it.english),
        el("div", { class: "entry-cat" }, it.category),
        el("div", { class: "entry-actions" },
          el("button", {
            class: "icon-btn" + (p.starred ? " active" : ""),
            title: "Markeren voor herhaling",
            onClick: (e) => {
              e.stopPropagation();
              const on = window.Store.toggleStar(it.id);
              e.currentTarget.classList.toggle("active", on);
            },
          }, "★"),
        ),
        el("div", { class: "entry-detail" },
          el("p", { class: "nl" }, it.exampleNL),
          el("p", { class: "en" }, it.exampleEN),
          it.subcategory ? el("p", { class: "en", style: "font-size:.78rem;margin-top:.4rem" }, "— " + it.subcategory) : null,
        ),
      );
      row.addEventListener("click", () => row.classList.toggle("open"));
      return row;
    }

    render();
  }

  /* ============ Voice button helpers (Ellen / Xander) ============ */
  function voiceBtn(voiceName, flag, text, size) {
    const sp = window.Speech;
    const disabled = !sp || !sp.supported;
    const btn = el("button", {
      class: "voice-btn",
      "data-voice": voiceName,
      title: disabled ? "Spraak niet beschikbaar" : `Uitspraak (${voiceName}, ${flag})`,
      disabled: disabled || undefined,
      onClick: (e) => {
        e.stopPropagation();
        if (sp && sp.supported) sp.speak(text, voiceName);
      },
    },
      el("span", { class: "speaker" }, "▶"),
      el("span", null, voiceName),
      el("span", { class: "flag" }, flag),
    );
    return btn;
  }
  function voiceRow(text) {
    return el("div", { class: "fc-voices" },
      voiceBtn("Ellen", "BE", text),
      voiceBtn("Xander", "NL", text),
    );
  }

  /* ============ Flashcards (Leitner) ============ */
  function renderFlashcards(mount) {
    window.Store.recordSessionStart("flashcards");
    const session = window.SRS.pickDue(activeItems(), window.Store.state.settings.sessionSize);
    if (session.length === 0) {
      mount.innerHTML = "";
      mount.append(emptyState("Niets te herhalen", "Geen kaarten staan vandaag klaar. Begin een gemengde toets om vooruit te lopen.", "#/mixed"));
      return;
    }
    let i = 0;
    let flipped = false;
    let direction = window.Store.state.settings.direction;

    mount.innerHTML = "";
    const stage = el("div", { class: "fc-stage" });
    mount.append(el("h2", { class: "view-title" }, "Flashcards"),
      el("p", { class: "view-sub" }, "Probeer eerst zelf het antwoord op te halen. Daarna pas omdraaien."));
    mount.append(stage);

    function rng() {
      // Mixed direction: half items NL→EN, half EN→NL
      if (direction === "mixed") return i % 2 === 0 ? "nl-en" : "en-nl";
      return direction;
    }

    function render() {
      const it = session[i];
      if (!it) return finish();
      const d = rng();
      const prompt = d === "nl-en" ? it.dutch : it.english;
      const answer = d === "nl-en" ? it.english : it.dutch;
      const promptEx = d === "nl-en" ? it.exampleNL : it.exampleEN;
      const answerEx = d === "nl-en" ? it.exampleEN : it.exampleNL;

      stage.innerHTML = "";
      // The Dutch text on this side of the card (for the voice buttons to speak)
      const dutchOnThisSide = d === "nl-en" ? it.dutch : (flipped ? it.dutch : null);
      const card = el("div", { class: "fc" + (flipped ? " back" : "") },
        el("span", { class: "fc-progress" }, `${i + 1} / ${session.length}`),
        el("p", { class: "fc-meta" },
          el("span", { class: "level" }, it.level), " · ", it.category, " · ", d === "nl-en" ? "NL → EN" : "EN → NL"),
        el("p", { class: "fc-prompt" }, prompt),
        // Voice buttons for the prompt: only if there's Dutch text visible to pronounce
        dutchOnThisSide ? voiceRow(dutchOnThisSide) : null,
        flipped ? el("p", { class: "fc-answer" }, answer) : null,
        // If EN→NL and flipped, the answer is Dutch — add voice buttons for it too
        (flipped && d === "en-nl") ? voiceRow(it.dutch) : null,
        flipped ? el("div", { class: "fc-examples" },
          el("p", { class: "fc-example" },
            el("span", { class: "lab" }, "NL"),
            el("span", { class: "nl" }, it.exampleNL),
            el("span", { class: "row-voices" },
              voiceBtn("Ellen", "BE", it.exampleNL, "klein"),
              voiceBtn("Xander", "NL", it.exampleNL, "klein"),
            ),
          ),
          el("p", { class: "fc-example" }, el("span", { class: "lab" }, "EN"),
            el("span", { class: "en" }, it.exampleEN)),
        ) : null,
        flipped
          ? el("div", { class: "fc-actions" },
              el("button", { class: "danger", onClick: () => rate("hard") }, "Moeilijk (1)"),
              el("button", { class: "warn", onClick: () => rate("good") }, "Goed (2)"),
              el("button", { class: "good", onClick: () => rate("easy") }, "Makkelijk (3)"),
            )
          : el("div", { class: "fc-actions" },
              el("button", { onClick: flip }, "Omdraaien · Space"),
            ),
      );
      stage.append(card);
    }

    function flip() { flipped = true; render(); }
    function rate(outcome) {
      window.Store.markSeen(session[i].id, outcome);
      i += 1; flipped = false; render();
    }
    function finish() {
      stage.innerHTML = "";
      stage.append(el("div", { class: "summary" },
        el("p", { class: "big-num" }, "✓"),
        el("h3", { class: "view-title", style: "margin-top:.5rem" }, "Sessie klaar."),
        el("p", null, `${session.length} kaarten herhaald. Kom morgen terug voor de volgende ronde.`),
        el("div", { class: "summary-actions" },
          el("a", { class: "btn", href: "#/flashcards" }, "Nog een ronde"),
          el("a", { class: "btn subtle", href: "#/dashboard" }, "Overzicht"),
        ),
      ));
    }

    const keys = (e) => {
      if (e.target.matches && e.target.matches("input, textarea")) return;
      if (e.key === " " ) {
        e.preventDefault();
        if (!flipped) flip();
        return;
      }
      // E / X → play current Dutch text with Ellen / Xander
      if (e.key === "e" || e.key === "E" || e.key === "x" || e.key === "X") {
        const it = session[i];
        if (!it) return;
        const d = rng();
        // Dutch is visible: as prompt if NL→EN, or as answer once flipped if EN→NL
        const dutch = d === "nl-en" ? it.dutch : (flipped ? it.dutch : null);
        if (dutch && window.Speech) {
          const v = (e.key === "e" || e.key === "E") ? "Ellen" : "Xander";
          window.Speech.speak(dutch, v);
        }
        return;
      }
      if (flipped) {
        if (e.key === "1") rate("hard");
        else if (e.key === "2") rate("good");
        else if (e.key === "3") rate("easy");
      }
    };
    document.addEventListener("keydown", keys);
    render();
    return () => document.removeEventListener("keydown", keys);
  }

  /* ============ Typed (generation) ============ */
  function renderTyped(mount) {
    window.Store.recordSessionStart("typed");
    const session = window.SRS.shuffle(typeableItems().slice()).slice(0, window.Store.state.settings.sessionSize);
    if (!session.length) { mount.innerHTML = ""; mount.append(emptyState("Geen items", "Selecteer een niveau in de instellingen.")); return; }
    let i = 0;
    let revealed = false;

    mount.innerHTML = "";
    mount.append(
      el("h2", { class: "view-title" }, "Generation"),
      el("p", { class: "view-sub" }, "Type het antwoord vóór je controleert. Diacritics, lidwoorden en kleine typo's zijn vergeven."),
    );
    const progressBar = el("div", { class: "session-progress" },
      el("span", { id: "pg-num" }, ""),
      el("span", { class: "bar" }, el("span", { id: "pg-fill" })));
    mount.append(progressBar);

    const stage = el("div", { class: "card card-pad", style: "max-width:640px;margin:0 auto" });
    mount.append(stage);

    function dir() {
      const d = window.Store.state.settings.direction;
      if (d === "mixed") return i % 2 === 0 ? "en-nl" : "nl-en";
      // Default to en-nl for typed practice (productive recall is harder/more useful)
      return d === "nl-en" ? "nl-en" : "en-nl";
    }

    function render() {
      const it = session[i];
      if (!it) return finish();
      const d = dir();
      const prompt = d === "en-nl" ? it.english : it.dutch;
      const answer = d === "en-nl" ? it.dutch : it.english;

      $("#pg-num", mount).textContent = `${i + 1} / ${session.length}`;
      $("#pg-fill", mount).style.width = `${(i / session.length) * 100}%`;

      stage.innerHTML = "";
      stage.append(
        el("p", { class: "fc-meta" },
          el("span", { class: "level" }, it.level), " · ", it.category, " · ", d === "en-nl" ? "EN → NL" : "NL → EN"),
        el("p", { class: "typed-prompt" }, prompt),
      );
      const box = el("div", { class: "typed-box" });
      const input = el("input", { type: "text", class: "typed-input", autofocus: true, autocomplete: "off", spellcheck: "false" });
      const feedback = el("div", { class: "typed-feedback" });
      const actions = el("div", { class: "typed-actions" });
      box.append(input, feedback, actions);
      stage.append(box);

      function submit() {
        if (revealed) return next();
        const res = window.Match.check(input.value, answer);
        revealed = true;
        if (res.ok) {
          input.classList.add("correct");
          feedback.innerHTML = `<span class="ok">Goed${res.kind === "fuzzy" ? " (typo vergeven)" : ""}</span> — <span class="nl" style="font-family:var(--serif)">${answer}</span>`;
          window.Store.markSeen(it.id, "correct");
        } else {
          input.classList.add("wrong");
          feedback.innerHTML = `<span class="no">Niet helemaal</span> — antwoord: <span class="nl" style="font-family:var(--serif)">${answer}</span>`;
          window.Store.markSeen(it.id, "wrong");
        }
        feedback.append(
          el("div", { class: "fc-examples", style: "border:none;padding-top:.6rem;margin-top:.6rem" },
            el("p", { class: "fc-example" }, el("span", { class: "lab" }, "NL"),
              el("span", { class: "nl" }, it.exampleNL)),
            el("p", { class: "fc-example" }, el("span", { class: "lab" }, "EN"),
              el("span", { class: "en" }, it.exampleEN)),
          )
        );
        actions.innerHTML = "";
        actions.append(el("button", { onClick: next }, "Volgende · Enter"));
      }
      function next() { revealed = false; i += 1; render(); }

      actions.append(el("button", { onClick: submit }, "Controleer · Enter"));
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") { e.preventDefault(); submit(); }
      });
      setTimeout(() => input.focus(), 10);
    }

    function finish() {
      const today = window.Store.state.sessionStats.today;
      stage.innerHTML = "";
      stage.append(el("div", { class: "summary" },
        el("p", { class: "big-num" }, today.right + "/" + (today.right + today.wrong)),
        el("h3", { class: "view-title", style: "margin-top:.5rem" }, "Sessie klaar."),
        el("p", null, "Je vrije ophaal-spier is even gebruikt — het werk zit erop."),
        el("div", { class: "summary-actions" },
          el("a", { class: "btn", href: "#/typed" }, "Nog een ronde"),
          el("a", { class: "btn subtle", href: "#/flashcards" }, "Flashcards"),
          el("a", { class: "btn subtle", href: "#/dashboard" }, "Overzicht"),
        ),
      ));
      $("#pg-fill", mount).style.width = "100%";
    }

    render();
  }

  /* ============ Cloze ============ */
  function renderCloze(mount) {
    window.Store.recordSessionStart("cloze");
    const candidates = typeableItems().filter((it) => {
      if (!it.exampleNL || !it.dutch) return false;
      const t = window.Match.strip(it.dutch).split(" ")[0];
      return t && window.Match.strip(it.exampleNL).includes(t);
    });
    if (!candidates.length) {
      mount.innerHTML = "";
      mount.append(emptyState("Geen geschikte cloze-items", "Wijzig je filters of probeer een andere modus."));
      return;
    }
    const session = window.SRS.shuffle(candidates.slice()).slice(0, window.Store.state.settings.sessionSize);
    let i = 0;
    let revealed = false;

    mount.innerHTML = "";
    mount.append(
      el("h2", { class: "view-title" }, "Cloze · Vul de leemte"),
      el("p", { class: "view-sub" }, "Type het ontbrekende Nederlandse woord in zijn natuurlijke context."),
      el("div", { class: "session-progress" },
        el("span", { id: "cl-num" }, ""),
        el("span", { class: "bar" }, el("span", { id: "cl-fill" })))
    );
    const stage = el("div", { class: "card card-pad", style: "max-width:680px;margin:0 auto" });
    mount.append(stage);

    function render() {
      const it = session[i];
      if (!it) return finish();
      $("#cl-num", mount).textContent = `${i + 1} / ${session.length}`;
      $("#cl-fill", mount).style.width = `${(i / session.length) * 100}%`;

      // Replace the (case-insensitive) target Dutch word in the example with a blank.
      // Use first word of the entry (works for multi-word targets too: blank one token).
      const target = it.dutch.split(/[\s·→/|]/)[0];
      const escaped = target.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const re = new RegExp("(\\b" + escaped + "\\w*\\b)", "i");
      const sentence = it.exampleNL.replace(re, "___BLANK___");

      stage.innerHTML = "";
      stage.append(
        el("p", { class: "fc-meta" },
          el("span", { class: "level" }, it.level), " · ", it.category),
        renderClozeSentence(sentence),
        el("p", { class: "cloze-en" }, "“" + it.exampleEN + "”"),
      );

      const input = el("input", { type: "text", class: "typed-input", autofocus: true, autocomplete: "off", spellcheck: "false", placeholder: "type het woord" });
      const feedback = el("div", { class: "typed-feedback" });
      const actions = el("div", { class: "typed-actions" });

      function submit() {
        if (revealed) return next();
        const res = window.Match.check(input.value, target);
        revealed = true;
        if (res.ok) {
          input.classList.add("correct");
          feedback.innerHTML = `<span class="ok">Goed</span> — <em>${it.dutch}</em>`;
          window.Store.markSeen(it.id, "correct");
        } else {
          input.classList.add("wrong");
          feedback.innerHTML = `<span class="no">Bijna</span> — antwoord: <em>${it.dutch}</em> (${it.english})`;
          window.Store.markSeen(it.id, "wrong");
        }
        actions.innerHTML = "";
        actions.append(el("button", { onClick: next }, "Volgende · Enter"));
      }
      function next() { revealed = false; i += 1; render(); }

      actions.append(el("button", { onClick: submit }, "Controleer · Enter"));
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") { e.preventDefault(); submit(); }
      });
      stage.append(input, feedback, actions);
      setTimeout(() => input.focus(), 10);
    }

    function renderClozeSentence(s) {
      const wrap = el("p", { class: "cloze-sentence" });
      const parts = s.split("___BLANK___");
      parts.forEach((p, idx) => {
        wrap.append(document.createTextNode(p));
        if (idx < parts.length - 1) wrap.append(el("span", { class: "cloze-blank" }, "_____"));
      });
      return wrap;
    }

    function finish() {
      stage.innerHTML = "";
      stage.append(el("div", { class: "summary" },
        el("p", { class: "big-num" }, "✓"),
        el("h3", { class: "view-title", style: "margin-top:.5rem" }, "Klaar voor nu."),
        el("p", null, "Context vasthouden is wat de retentie scherp maakt."),
        el("div", { class: "summary-actions" },
          el("a", { class: "btn", href: "#/cloze" }, "Nog een ronde"),
          el("a", { class: "btn subtle", href: "#/mixed" }, "Gemengd"),
        ),
      ));
      $("#cl-fill", mount).style.width = "100%";
    }

    render();
  }

  /* ============ Mixed quiz: interleaved, multi-mode ============ */
  function renderMixed(mount) {
    window.Store.recordSessionStart("mixed");
    const pool = typeableItems();
    if (pool.length < 4) { mount.innerHTML = ""; mount.append(emptyState("Te weinig items", "Activeer meer niveaus of categorieën.")); return; }
    const session = window.SRS.shuffle(pool.slice()).slice(0, window.Store.state.settings.sessionSize);
    const modes = ["mc-nl-en", "mc-en-nl", "type", "cloze"];
    let i = 0;
    let revealed = false;
    let right = 0;

    mount.innerHTML = "";
    mount.append(
      el("h2", { class: "view-title" }, "Gemengde toets"),
      el("p", { class: "view-sub" }, "Categorieën door elkaar, modus per vraag wisselend. Moeilijker — en blijvender."),
      el("div", { class: "session-progress" },
        el("span", { id: "mx-num" }, ""),
        el("span", { class: "bar" }, el("span", { id: "mx-fill" })),
        el("span", { id: "mx-score" })),
    );
    const stage = el("div", { class: "card card-pad", style: "max-width:680px;margin:0 auto" });
    mount.append(stage);

    function render() {
      const it = session[i];
      if (!it) return finish();
      const mode = modes[i % modes.length];
      $("#mx-num", mount).textContent = `${i + 1} / ${session.length}`;
      $("#mx-fill", mount).style.width = `${(i / session.length) * 100}%`;
      $("#mx-score", mount).textContent = `${right} ✓`;
      stage.innerHTML = "";
      stage.append(el("p", { class: "fc-meta" },
        el("span", { class: "level" }, it.level), " · ", it.category, " · ", modeLabel(mode)));

      if (mode === "mc-nl-en") renderMC(it, "nl-en");
      else if (mode === "mc-en-nl") renderMC(it, "en-nl");
      else if (mode === "type") renderType(it);
      else if (mode === "cloze") renderClozeInline(it);
    }

    function modeLabel(m) {
      return { "mc-nl-en": "Meerkeuze NL→EN", "mc-en-nl": "Meerkeuze EN→NL", "type": "Type het", "cloze": "Cloze" }[m];
    }

    function renderMC(it, dir) {
      const prompt = dir === "nl-en" ? it.dutch : it.english;
      const answer = dir === "nl-en" ? it.english : it.dutch;
      // 3 distractors from same level if possible, else any
      const distractors = drawDistractors(it, dir);
      const options = window.SRS.shuffle([answer, ...distractors].map((s, idx) => ({ s, k: idx })));

      stage.append(el("p", { class: "typed-prompt" }, prompt));
      const optWrap = el("div", { class: "mc-options" });
      const keysMap = ["A", "B", "C", "D"];
      options.forEach((opt, idx) => {
        const btn = el("button", {
          class: "mc-option",
          onClick: () => pick(btn, opt.s === answer),
        }, el("span", { class: "kbd-hint" }, keysMap[idx]), opt.s);
        optWrap.append(btn);
      });
      stage.append(optWrap);
      const feedback = el("div", { class: "typed-feedback" });
      const actions = el("div", { class: "typed-actions" });
      stage.append(feedback, actions);

      function pick(btn, isRight) {
        if (revealed) return;
        revealed = true;
        if (isRight) {
          btn.classList.add("correct");
          right += 1;
          window.Store.markSeen(it.id, "correct");
          feedback.innerHTML = `<span class="ok">Klopt</span>`;
        } else {
          btn.classList.add("wrong");
          // Mark the correct option green too
          optWrap.querySelectorAll(".mc-option").forEach((b) => {
            if (b.textContent.endsWith(answer)) b.classList.add("correct");
          });
          window.Store.markSeen(it.id, "wrong");
          feedback.innerHTML = `<span class="no">Niet helemaal</span> — <em>${answer}</em>`;
        }
        feedback.append(
          el("p", { class: "fc-example", style: "margin-top:.6rem" },
            el("span", { class: "lab" }, "NL"),
            el("span", { class: "nl" }, it.exampleNL)),
          el("p", { class: "fc-example" },
            el("span", { class: "lab" }, "EN"),
            el("span", { class: "en" }, it.exampleEN)),
        );
        actions.append(el("button", { onClick: next }, "Volgende · Enter"));
      }
      // Keyboard A/B/C/D
      const onkey = (e) => {
        const idx = keysMap.indexOf(e.key.toUpperCase());
        if (idx >= 0 && idx < options.length) {
          const btn = optWrap.querySelectorAll(".mc-option")[idx];
          if (btn && !revealed) btn.click();
        }
        if (e.key === "Enter" && revealed) next();
      };
      document.addEventListener("keydown", onkey, { once: false });
      stage._cleanup = () => document.removeEventListener("keydown", onkey);
    }

    function renderType(it) {
      const prompt = it.english;
      const answer = it.dutch;
      stage.append(el("p", { class: "typed-prompt" }, prompt));
      const input = el("input", { type: "text", class: "typed-input", autocomplete: "off", spellcheck: "false", placeholder: "type Nederlands..." });
      const feedback = el("div", { class: "typed-feedback" });
      const actions = el("div", { class: "typed-actions" });
      stage.append(input, feedback, actions);

      function submit() {
        if (revealed) return next();
        revealed = true;
        const res = window.Match.check(input.value, answer);
        if (res.ok) {
          input.classList.add("correct"); right += 1;
          window.Store.markSeen(it.id, "correct");
          feedback.innerHTML = `<span class="ok">Goed</span> — <em>${answer}</em>`;
        } else {
          input.classList.add("wrong");
          window.Store.markSeen(it.id, "wrong");
          feedback.innerHTML = `<span class="no">Niet helemaal</span> — antwoord: <em>${answer}</em>`;
        }
        actions.innerHTML = "";
        actions.append(el("button", { onClick: next }, "Volgende · Enter"));
      }
      actions.append(el("button", { onClick: submit }, "Controleer · Enter"));
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") { e.preventDefault(); submit(); }
      });
      setTimeout(() => input.focus(), 10);
    }

    function renderClozeInline(it) {
      const target = it.dutch.split(/[\s·→/|]/)[0];
      const escaped = target.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const re = new RegExp("(\\b" + escaped + "\\w*\\b)", "i");
      const sentence = it.exampleNL.replace(re, "___BLANK___");
      const parts = sentence.split("___BLANK___");

      const p = el("p", { class: "cloze-sentence" });
      parts.forEach((part, idx) => {
        p.append(document.createTextNode(part));
        if (idx < parts.length - 1) p.append(el("span", { class: "cloze-blank" }, "_____"));
      });
      stage.append(p, el("p", { class: "cloze-en" }, "“" + it.exampleEN + "”"));
      const input = el("input", { type: "text", class: "typed-input", autocomplete: "off", spellcheck: "false" });
      const feedback = el("div", { class: "typed-feedback" });
      const actions = el("div", { class: "typed-actions" });
      stage.append(input, feedback, actions);

      function submit() {
        if (revealed) return next();
        revealed = true;
        const res = window.Match.check(input.value, target);
        if (res.ok) {
          input.classList.add("correct"); right += 1;
          window.Store.markSeen(it.id, "correct");
          feedback.innerHTML = `<span class="ok">Goed</span> — <em>${it.dutch}</em>`;
        } else {
          input.classList.add("wrong");
          window.Store.markSeen(it.id, "wrong");
          feedback.innerHTML = `<span class="no">Bijna</span> — antwoord: <em>${it.dutch}</em>`;
        }
        actions.innerHTML = "";
        actions.append(el("button", { onClick: next }, "Volgende · Enter"));
      }
      actions.append(el("button", { onClick: submit }, "Controleer · Enter"));
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") { e.preventDefault(); submit(); }
      });
      setTimeout(() => input.focus(), 10);
    }

    function drawDistractors(item, dir) {
      const sameLevel = pool.filter((x) => x.id !== item.id && x.level === item.level);
      const src = sameLevel.length >= 3 ? sameLevel : pool;
      const candidates = window.SRS.shuffle(src.slice()).slice(0, 8);
      // Take first 3 unique
      const out = [];
      const seen = new Set();
      const want = dir === "nl-en" ? "english" : "dutch";
      for (const c of candidates) {
        const v = c[want];
        if (v && !seen.has(v) && v !== item[want]) {
          out.push(v);
          seen.add(v);
          if (out.length === 3) break;
        }
      }
      return out;
    }

    function next() {
      if (stage._cleanup) { stage._cleanup(); stage._cleanup = null; }
      revealed = false; i += 1; render();
    }
    function finish() {
      const total = session.length;
      const pct = total ? Math.round((right / total) * 100) : 0;
      window.Store.recordQuizResult("mixed", total, right);
      stage.innerHTML = "";
      stage.append(el("div", { class: "summary" },
        el("p", { class: "big-num" }, `${pct}%`),
        el("h3", { class: "view-title", style: "margin-top:.5rem" }, `${right} van ${total} goed`),
        el("p", null,
          pct >= 80 ? "Sterk. Verleng de intervallen — laat ze maar wat verzakken voor de volgende ophaal."
          : pct >= 60 ? "Solide. Nog een ronde scherpt het verder aan."
          : "Bouw rustig op — herhaling boven moeilijkheid."),
        el("div", { class: "summary-actions" },
          el("a", { class: "btn", href: "#/mixed" }, "Nog een ronde"),
          el("a", { class: "btn subtle", href: "#/flashcards" }, "Flashcards"),
          el("a", { class: "btn subtle", href: "#/dashboard" }, "Overzicht"),
        ),
      ));
      $("#mx-fill", mount).style.width = "100%";
    }

    const enterToNext = (e) => { if (e.key === "Enter" && revealed) next(); };
    document.addEventListener("keydown", enterToNext);
    render();
    return () => document.removeEventListener("keydown", enterToNext);
  }

  function emptyState(title, msg, href) {
    return el("div", { class: "empty" },
      el("h3", null, title),
      el("p", null, msg),
      href ? el("a", { class: "btn", href }, "Verder") : null,
    );
  }

  /* ============ Help / Instructions ============ */
  function renderHelp(mount) {
    mount.innerHTML = `
      <div class="help-wrap">
        <h2 class="view-title">Uitleg <span class="accent">· How this works</span></h2>
        <p class="view-sub">
          Twee kolommen: Nederlands links, Engels rechts — lees beide.
          <em>Two columns: Dutch on the left, English on the right — read both.</em>
        </p>

        <div class="help-intro">
          <div class="bilingual">
            <div class="nl">
              <span class="lang-tag">NL</span>
              Deze app is geen woordenlijst om passief door te bladeren. Het is een <strong>ophaalgereedschap</strong>:
              je probeert eerst zelf het antwoord te produceren, en pas daarna controleer je. Die kleine moeite —
              dat is waar geheugen wordt gemaakt. Werk er liever vijftien minuten per dag mee dan twee uur op zondag.
            </div>
            <div class="en">
              <span class="lang-tag">EN</span>
              This app isn't a word list to flip through passively. It's a <strong>retrieval tool</strong>:
              you try to produce the answer yourself first, then check. That small effort
              is where memory is actually built. Better fifteen minutes a day than two hours on Sunday.
            </div>
          </div>
        </div>

        <h3 style="font-family:var(--serif);font-weight:600;font-size:1.15rem;margin:0 0 .8rem">
          Snel naar · Jump to
        </h3>
        <ul class="toc">
          <li><a href="#help-flow"><strong>Daagse routine</strong><span class="small">Daily flow · 15 min</span></a></li>
          <li><a href="#help-views"><strong>De zes vensters</strong><span class="small">The six views</span></a></li>
          <li><a href="#help-principles"><strong>Make-it-stick-principes</strong><span class="small">The eight principles</span></a></li>
          <li><a href="#help-keys"><strong>Sneltoetsen</strong><span class="small">Keyboard shortcuts</span></a></li>
          <li><a href="#help-faq"><strong>Veelgestelde vragen</strong><span class="small">FAQ</span></a></li>
        </ul>

        <!-- ============ DAILY FLOW ============ -->
        <section class="help-section" id="help-flow" style="margin-top:2.6rem">
          <h3><span class="num">01</span> Daagse routine <span class="principle-en">Daily flow</span></h3>
          <div class="bilingual">
            <div class="nl">
              <span class="lang-tag">NL</span>
              Begin altijd op <strong>Overzicht</strong>. Daar zie je hoeveel kaarten vandaag klaarstaan en welke
              categorieën je het vaakst fout hebt. Doe eerst een ronde <strong>Flashcards</strong> (de
              spaced-repetition motor), daarna één ronde <strong>Generation</strong> of <strong>Cloze</strong>
              voor diepere ophaal. Sluit, één keer per week, af met een <strong>Gemengde toets</strong> — die is
              expres het moeilijkst, en daardoor het meest waard.
            </div>
            <div class="en">
              <span class="lang-tag">EN</span>
              Always start on <strong>Overzicht</strong> (Dashboard). It tells you how many cards are due today
              and which categories you fail most often. Do one round of <strong>Flashcards</strong> (the
              spaced-repetition engine), then one round of <strong>Generation</strong> or <strong>Cloze</strong>
              for deeper retrieval. Once a week, close with a <strong>Mixed quiz</strong> — it's intentionally
              the hardest, which is exactly why it's worth the most.
            </div>
          </div>
        </section>

        <!-- ============ THE SIX VIEWS ============ -->
        <section class="help-section" id="help-views">
          <h3><span class="num">02</span> De zes vensters <span class="principle-en">The six views</span></h3>

          <h4 style="font-family:var(--serif);color:var(--rood);margin:1.4rem 0 .4rem">Overzicht · Dashboard</h4>
          <div class="bilingual">
            <div class="nl"><span class="lang-tag">NL</span>
              Toont je <strong>reeks</strong> (aantal dagen op rij), Leitner-vakken (1 t/m 5), totale voortgang en
              de zwakste categorieën. Hier wijzig je ook de instellingen: welke niveaus (A2/B1/B2), aantal kaarten
              per sessie, en je kunt voortgang exporteren of resetten.
            </div>
            <div class="en"><span class="lang-tag">EN</span>
              Shows your <strong>streak</strong> (consecutive days), Leitner boxes (1–5), overall progress and
              your weakest categories. Settings live here too: which levels (A2/B1/B2), session size, and you
              can export or reset progress.
            </div>
          </div>

          <h4 style="font-family:var(--serif);color:var(--rood);margin:1.4rem 0 .4rem">Bladeren · Browse</h4>
          <div class="bilingual">
            <div class="nl"><span class="lang-tag">NL</span>
              De volledige woordenlijst. Zoek op Nederlands of Engels, filter op niveau of categorie, klik een
              rij voor het voorbeeld. Druk op het <strong>★</strong> om een woord te markeren voor extra
              herhaling. Gebruik dit venster om te verkennen — niet om uit het hoofd te leren.
            </div>
            <div class="en"><span class="lang-tag">EN</span>
              The full lexicon. Search in Dutch or English, filter by level or category, click a row for the
              example. Press <strong>★</strong> to mark a word for extra review. Use this view to <em>explore</em> —
              not to cram.
            </div>
          </div>

          <h4 style="font-family:var(--serif);color:var(--rood);margin:1.4rem 0 .4rem">Flashcards</h4>
          <div class="bilingual">
            <div class="nl"><span class="lang-tag">NL</span>
              Klassieke kaarten met Leitner-doos systeem. Je ziet een woord, je probeert het antwoord <em>in je
              hoofd</em> te formuleren, en dan draai je om met <kbd>Space</kbd>. Beoordeel eerlijk: <kbd>1</kbd>
              moeilijk (terug naar vak 1), <kbd>2</kbd> goed (één vak omhoog), <kbd>3</kbd> makkelijk (twee vakken
              omhoog). De volgende keer dat je een kaart ziet hangt af van het vak: vak 1 → morgen, vak 2 → over
              2 dagen, vak 5 → over 19 dagen.
            </div>
            <div class="en"><span class="lang-tag">EN</span>
              Classic flashcards with a Leitner-box system. A word appears, you try to form the answer <em>in
              your head</em>, then flip with <kbd>Space</kbd>. Be honest when you rate: <kbd>1</kbd> hard (back
              to box 1), <kbd>2</kbd> good (one box up), <kbd>3</kbd> easy (skip a box). When you'll see the
              card next depends on the box: box 1 → tomorrow, box 2 → in 2 days, box 5 → in 19 days.
            </div>
          </div>

          <h4 style="font-family:var(--serif);color:var(--rood);margin:1.4rem 0 .4rem">Generation · Type het antwoord</h4>
          <div class="bilingual">
            <div class="nl"><span class="lang-tag">NL</span>
              Veel moeilijker dan flashcards en dáárom waardevol. Je typt het antwoord zelf in.
              Diacrieten (é, ö, ï), lidwoorden (de/het/een) en kleine typefouten worden vergeven. Voor
              uitdrukkingen zoals “houden van” of “bang voor” moet je het hele frase typen — de prepositie is
              deel van het woord in het Nederlands.
            </div>
            <div class="en"><span class="lang-tag">EN</span>
              Much harder than flashcards, and valuable for exactly that reason. You type the answer yourself.
              Diacritics (é, ö, ï), articles (de/het/een) and small typos are forgiven. For collocations like
              “houden van” or “bang voor” you must type the whole phrase — the preposition is part of the word
              in Dutch.
            </div>
          </div>

          <h4 style="font-family:var(--serif);color:var(--rood);margin:1.4rem 0 .4rem">Cloze · Vul de leemte</h4>
          <div class="bilingual">
            <div class="nl"><span class="lang-tag">NL</span>
              Het doelwoord wordt uit zijn voorbeeldzin weggehaald; jij vult het in. Hier oefen je niet alleen
              het woord, maar ook <strong>de context</strong> waarin het gebruikt wordt. De Engelse vertaling
              staat eronder als hint — niet als oplossing.
            </div>
            <div class="en"><span class="lang-tag">EN</span>
              The target word is removed from its example sentence; you type it in. Here you practise not just
              the word but <strong>its context</strong>. The English translation sits underneath as a hint —
              not as the solution.
            </div>
          </div>

          <h4 style="font-family:var(--serif);color:var(--rood);margin:1.4rem 0 .4rem">Gemengde toets · Mixed quiz</h4>
          <div class="bilingual">
            <div class="nl"><span class="lang-tag">NL</span>
              De zwaarste modus, en daarom de meest blijvende. Vier soorten vragen door elkaar (meerkeuze NL→EN,
              meerkeuze EN→NL, type-het, cloze), categorieën door elkaar geschud. Je krijgt aan het eind een
              percentage. Doe deze één keer per week — niet vaker.
            </div>
            <div class="en"><span class="lang-tag">EN</span>
              The hardest mode, and therefore the most durable. Four question types mixed together (multiple
              choice NL→EN, multiple choice EN→NL, typed, cloze), categories shuffled. You get a percentage at
              the end. Run this once a week — no more.
            </div>
          </div>
        </section>

        <!-- ============ MAKE IT STICK PRINCIPLES ============ -->
        <section class="help-section" id="help-principles">
          <h3><span class="num">03</span> Make-it-stick-principes <span class="principle-en">The eight principles</span></h3>
          <div class="bilingual" style="margin-bottom:1.6rem">
            <div class="nl"><span class="lang-tag">NL</span>
              <em>“Make It Stick”</em> (Brown, Roediger, McDaniel, 2014) bundelt decennia onderzoek naar wat
              werkelijk leren oplevert. De acht principes hieronder zitten allemaal in deze app verwerkt — niet
              als slogan, maar als knopjes.
            </div>
            <div class="en"><span class="lang-tag">EN</span>
              <em>“Make It Stick”</em> (Brown, Roediger, McDaniel, 2014) gathers decades of research on what
              actually produces learning. The eight principles below are all baked into this app — not as
              slogans, but as buttons.
            </div>
          </div>

          <h4 style="font-family:var(--serif);color:var(--delft);margin:1.4rem 0 .4rem">
            ① Ophaal-oefening · Retrieval practice
          </h4>
          <div class="bilingual">
            <div class="nl"><span class="lang-tag">NL</span>
              <strong>Wat:</strong> Iets uit je hoofd terughalen is veel krachtiger dan het opnieuw lezen.
              Herlezen voelt vlot — maar dat gevoel ís de valstrik. <br>
              <strong>Hier:</strong> Elke modus dwingt je <em>eerst</em> te produceren. De Flashcards laten het
              antwoord niet zien tot je op Space drukt. Generation en Cloze laten je typen voordat je
              controleert.
            </div>
            <div class="en"><span class="lang-tag">EN</span>
              <strong>What:</strong> Pulling something from memory is far stronger than re-reading it. Re-reading
              feels fluent — but that very fluency <em>is</em> the trap. <br>
              <strong>Here:</strong> Every mode forces you to produce <em>first</em>. Flashcards hide the answer
              until you press Space. Generation and Cloze make you type before you check.
            </div>
          </div>

          <h4 style="font-family:var(--serif);color:var(--delft);margin:1.4rem 0 .4rem">
            ② Spaced repetition · Verspreide herhaling
          </h4>
          <div class="bilingual">
            <div class="nl"><span class="lang-tag">NL</span>
              <strong>Wat:</strong> Een woord vier keer op één avond is bijna verspilling. Vier keer over twee
              weken — verspreid op het moment dat je het bijna vergeten was — bouwt blijvend geheugen. <br>
              <strong>Hier:</strong> Het Leitner-systeem met vijf vakken (1 dag · 2 d · 4 d · 9 d · 19 d). Faal
              je een woord, dan duikelt het terug naar vak 1. Slaag je, dan groeit het interval. Vandaar de
              voortgangsbalk op het Overzicht.
            </div>
            <div class="en"><span class="lang-tag">EN</span>
              <strong>What:</strong> Drilling a word four times in one evening is nearly wasted. Four times over
              two weeks — spaced so you nearly forget between exposures — builds lasting memory. <br>
              <strong>Here:</strong> A five-box Leitner system (1 day · 2 d · 4 d · 9 d · 19 d). Fail a word and
              it drops back to box 1. Succeed and the interval widens. That's what the progress bar on the
              Dashboard tracks.
            </div>
          </div>

          <h4 style="font-family:var(--serif);color:var(--delft);margin:1.4rem 0 .4rem">
            ③ Verweven · Interleaving
          </h4>
          <div class="bilingual">
            <div class="nl"><span class="lang-tag">NL</span>
              <strong>Wat:</strong> Categorie A heel doen en daarna pas B is gemakkelijk maar slecht voor het
              geheugen. Door elkaar schudden voelt rommelig en is dáárom effectiever — je leert ook <em>welk</em>
              gereedschap bij welk probleem hoort. <br>
              <strong>Hier:</strong> De Gemengde toets schudt categorieën én vraagtypen door elkaar. Ook de
              Flashcards-sessie put uit alle actieve categorieën tegelijk — geen blokken.
            </div>
            <div class="en"><span class="lang-tag">EN</span>
              <strong>What:</strong> Blocking — finish category A, then start B — feels easy but harms memory.
              Shuffling feels messy, and is therefore more effective: you also learn <em>which</em> tool fits
              which problem. <br>
              <strong>Here:</strong> The Mixed quiz interleaves categories <em>and</em> question types. Flashcard
              sessions also draw from all active categories at once — no blocks.
            </div>
          </div>

          <h4 style="font-family:var(--serif);color:var(--delft);margin:1.4rem 0 .4rem">
            ④ Generatie-effect · Generation effect
          </h4>
          <div class="bilingual">
            <div class="nl"><span class="lang-tag">NL</span>
              <strong>Wat:</strong> Een antwoord zelf produceren — ook als je het verkeerd hebt — leert je meer
              dan het antwoord zien. De moeite van het zoeken zet de juiste verbinding sterker neer dan een
              passieve herhaling.
              <br>
              <strong>Hier:</strong> De <em>Generation</em>-modus is precies dit: typen vóór reveal. De
              fuzzy-matcher is genereus zodat je niet op tikfouten faalt, maar nooit zo genereus dat je
              wegkomt zonder het echte antwoord te formuleren.
            </div>
            <div class="en"><span class="lang-tag">EN</span>
              <strong>What:</strong> Producing an answer yourself — even one you get wrong — teaches more than
              seeing the answer does. The effort of searching lays down the connection more strongly than
              passive repetition. <br>
              <strong>Here:</strong> The <em>Generation</em> mode is exactly this: type before reveal. The
              fuzzy matcher is generous so you don't fail on typos, but never so generous that you escape
              without forming the actual answer.
            </div>
          </div>

          <h4 style="font-family:var(--serif);color:var(--delft);margin:1.4rem 0 .4rem">
            ⑤ Verdieping · Elaboration
          </h4>
          <div class="bilingual">
            <div class="nl"><span class="lang-tag">NL</span>
              <strong>Wat:</strong> Verbind een nieuw woord met iets dat je al weet — een context, een
              voorbeeld, een woordfamilie. Hoe meer haakjes, hoe makkelijker te vinden. <br>
              <strong>Hier:</strong> Elk item heeft een Nederlandse <em>en</em> Engelse voorbeeldzin. Na elk
              antwoord verschijnen beide. Op Bladeren zie je de categorie en subcategorie — zo wordt elk woord
              ingebed.
            </div>
            <div class="en"><span class="lang-tag">EN</span>
              <strong>What:</strong> Connect a new word to something you already know — a context, an example,
              a word family. The more hooks, the easier the retrieval. <br>
              <strong>Here:</strong> Every item carries a Dutch <em>and</em> an English example sentence. Both
              appear after each answer. In Browse, you also see the category and subcategory — every word
              gets embedded.
            </div>
          </div>

          <h4 style="font-family:var(--serif);color:var(--delft);margin:1.4rem 0 .4rem">
            ⑥ Reflectie · Reflection
          </h4>
          <div class="bilingual">
            <div class="nl"><span class="lang-tag">NL</span>
              <strong>Wat:</strong> Even stilstaan na een sessie — “wat ging goed, wat ging mis, waarom?” — werkt
              als een extra ophaal-ronde. <br>
              <strong>Hier:</strong> Na elke sessie zie je een samenvatting met percentage en een korte
              opmerking. Op het Overzicht laat de <em>Zwakke plekken</em>-lijst zien waar je het meest faalt —
              een uitnodiging om te reflecteren, niet alleen te drillen.
            </div>
            <div class="en"><span class="lang-tag">EN</span>
              <strong>What:</strong> Pausing after a session — “what worked, what didn't, why?” — works as a
              free extra retrieval round. <br>
              <strong>Here:</strong> After each session you see a summary with a percentage and a short note.
              On the Dashboard, the <em>Weak spots</em> list surfaces where you fail most — an invitation to
              reflect, not just drill.
            </div>
          </div>

          <h4 style="font-family:var(--serif);color:var(--delft);margin:1.4rem 0 .4rem">
            ⑦ IJking · Calibration
          </h4>
          <div class="bilingual">
            <div class="nl"><span class="lang-tag">NL</span>
              <strong>Wat:</strong> Mensen overschatten chronisch wat ze weten. <em>Voorspel</em> je antwoord
              voordat je kijkt — pas dan zie je het verschil tussen <em>denken te weten</em> en <em>weten</em>. <br>
              <strong>Hier:</strong> Beoordeel jezelf eerlijk met <kbd>1</kbd>/<kbd>2</kbd>/<kbd>3</kbd> in
              Flashcards. Klik niet automatisch op “Makkelijk” — als het pas met moeite kwam, was het “Goed” of
              “Moeilijk”. Anders straft het Leitner-systeem je later.
            </div>
            <div class="en"><span class="lang-tag">EN</span>
              <strong>What:</strong> People chronically overestimate what they know. <em>Predict</em> your
              answer before you look — only then do you see the gap between <em>thinking you know</em> and
              <em>knowing</em>. <br>
              <strong>Here:</strong> Rate yourself honestly with <kbd>1</kbd>/<kbd>2</kbd>/<kbd>3</kbd> in
              Flashcards. Don't auto-click “Easy” — if it took effort, it was “Good” or “Hard”. Otherwise the
              Leitner system will punish you later.
            </div>
          </div>

          <h4 style="font-family:var(--serif);color:var(--delft);margin:1.4rem 0 .4rem">
            ⑧ Gewenste moeite · Desirable difficulty
          </h4>
          <div class="bilingual">
            <div class="nl"><span class="lang-tag">NL</span>
              <strong>Wat:</strong> Leren dat <em>gemakkelijk</em> voelt, vergeet je morgen. Leren dat een beetje
              moeite kost — net niet kunnen, dan tóch — blijft. Een paar fouten per sessie is een goed teken,
              geen slecht. <br>
              <strong>Hier:</strong> Generation en Cloze zijn met opzet zwaarder dan Flashcards. De Gemengde
              toets is met opzet de zwaarste. Streef niet naar 100 % — streef naar 70–85 %. Daar leer je.
            </div>
            <div class="en"><span class="lang-tag">EN</span>
              <strong>What:</strong> Learning that feels <em>easy</em> is forgotten by tomorrow. Learning that
              takes a little effort — almost-but-not-quite, then getting there — sticks. A few mistakes per
              session is a <em>good</em> sign, not a bad one. <br>
              <strong>Here:</strong> Generation and Cloze are deliberately harder than Flashcards. The Mixed
              quiz is deliberately the hardest of all. Don't aim for 100% — aim for 70–85%. That's where you
              learn.
            </div>
          </div>
        </section>

        <!-- ============ SHORTCUTS ============ -->
        <section class="help-section" id="help-keys">
          <h3><span class="num">04</span> Sneltoetsen <span class="principle-en">Keyboard shortcuts</span></h3>
          <div class="help-keys">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:.6rem 2rem">
              <div><kbd>Space</kbd> — kaart omdraaien / flip card</div>
              <div><kbd>Enter</kbd> — antwoord indienen / submit answer</div>
              <div><kbd>1</kbd> — moeilijk / hard (back to box 1)</div>
              <div><kbd>2</kbd> — goed / good (one box up)</div>
              <div><kbd>3</kbd> — makkelijk / easy (skip a box)</div>
              <div><kbd>A</kbd>/<kbd>B</kbd>/<kbd>C</kbd>/<kbd>D</kbd> — meerkeuze / multiple choice</div>
              <div><kbd>?</kbd> — dit overzicht / this overview</div>
              <div><kbd>Esc</kbd> — dialoog sluiten / close dialog</div>
            </div>
          </div>
        </section>

        <!-- ============ FAQ ============ -->
        <section class="help-section" id="help-faq">
          <h3><span class="num">05</span> Veelgestelde vragen <span class="principle-en">FAQ</span></h3>

          <div class="bilingual">
            <div class="nl"><span class="lang-tag">NL</span>
              <strong>Hoe lang per dag?</strong><br>
              Vijftien minuten is meer dan genoeg, mits dagelijks. Twee uur op zaterdag is bijna waardeloos
              vergeleken met 15 × 7 = 105 minuten verspreid.
            </div>
            <div class="en"><span class="lang-tag">EN</span>
              <strong>How long per day?</strong><br>
              Fifteen minutes is more than enough — provided it's daily. Two hours on a Saturday is nearly
              worthless compared to 15 × 7 = 105 minutes spread out.
            </div>
          </div>

          <div class="bilingual" style="margin-top:1rem">
            <div class="nl"><span class="lang-tag">NL</span>
              <strong>Waar wordt mijn voortgang opgeslagen?</strong><br>
              Lokaal in de browser (<em>localStorage</em>). Niets verlaat je computer. Op het Overzicht kun je
              <em>exporteren</em> als JSON-bestand voor je eigen back-up.
            </div>
            <div class="en"><span class="lang-tag">EN</span>
              <strong>Where is my progress stored?</strong><br>
              Locally in the browser (<em>localStorage</em>). Nothing leaves your machine. From the Dashboard
              you can <em>export</em> a JSON file as your own backup.
            </div>
          </div>

          <div class="bilingual" style="margin-top:1rem">
            <div class="nl"><span class="lang-tag">NL</span>
              <strong>Ik vergeet vooral kleine prepositie-verschillen (op/in/aan).</strong><br>
              Filter op de categorieën <em>Tricky Prepositions</em> en <em>Prepositional Phrases</em>, en doe
              alleen die in Generation-modus. De prepositie hoort bij het werkwoord — dwing jezelf hem mee te
              typen.
            </div>
            <div class="en"><span class="lang-tag">EN</span>
              <strong>I keep losing the small preposition (op/in/aan).</strong><br>
              Filter to <em>Tricky Prepositions</em> and <em>Prepositional Phrases</em> only, and run them
              through Generation mode. The preposition <em>is</em> part of the verb — make yourself type it.
            </div>
          </div>

          <div class="bilingual" style="margin-top:1rem">
            <div class="nl"><span class="lang-tag">NL</span>
              <strong>Wat als ik een paar dagen mis?</strong><br>
              De reeks valt terug naar 1 — niet erg. Wat overgeslagen kaarten worden gewoon weer zichtbaar in
              vak 1. Stop niet helemaal, dat is het enige risico.
            </div>
            <div class="en"><span class="lang-tag">EN</span>
              <strong>What if I miss a few days?</strong><br>
              The streak resets to 1 — no big deal. Skipped cards simply resurface in box 1. The only real risk
              is quitting altogether.
            </div>
          </div>

          <div class="bilingual" style="margin-top:1rem">
            <div class="nl"><span class="lang-tag">NL</span>
              <strong>Hoe voeg ik nieuwe woorden toe?</strong><br>
              Bewerk <code>dutch_b2_vocabulary_table.md</code> in de map erboven, en draai dan
              <code>python3 parse_md.py &amp;&amp; python3 build_data_js.py</code> in de
              <code>data/</code>-map. Ververs de pagina — klaar.
            </div>
            <div class="en"><span class="lang-tag">EN</span>
              <strong>How do I add new words?</strong><br>
              Edit <code>dutch_b2_vocabulary_table.md</code> in the folder above, then run
              <code>python3 parse_md.py &amp;&amp; python3 build_data_js.py</code> in the
              <code>data/</code> folder. Reload the page — done.
            </div>
          </div>

          <div class="bilingual" style="margin-top:1.4rem">
            <div class="nl"><span class="lang-tag">NL</span>
              <em>Veel succes — en denk eraan: de moeite ís het werk.</em>
            </div>
            <div class="en"><span class="lang-tag">EN</span>
              <em>Good luck — and remember: the effort <strong>is</strong> the work.</em>
            </div>
          </div>
        </section>
      </div>
    `;
  }

  window.Views = {
    dashboard: renderDashboard,
    browse: renderBrowse,
    flashcards: renderFlashcards,
    typed: renderTyped,
    cloze: renderCloze,
    mixed: renderMixed,
    metrics: (mount) => window.Metrics.render(mount),
    help: renderHelp,
  };
})();
