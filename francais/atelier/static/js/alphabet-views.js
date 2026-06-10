/* Alphabet + IPA primer (#/alphabet).
 *
 * Static reference page. Three sections:
 *   1. The 26 letters with French letter-names ("ah, bay, say, day, …").
 *   2. The 6 diacritics + cédille + ligatures with audio.
 *   3. French nasal vowels — the A1 cliff. IPA + audio.
 *
 * Each row has a TTS button that speaks the relevant sound via
 * window.Speech. Pure reference: no scoring, no SRS interaction.
 */
(function () {
  function escapeHtml(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));
  }

  // The "say" column is the way native French speakers name the letter
  // out loud (e.g. "F" is "èffe", not "ef"). The "ipa" column is the
  // IPA of that letter name.
  const LETTERS = [
    ["A", "a",   "/a/"],   ["B", "bé",  "/be/"],   ["C", "cé",  "/se/"],
    ["D", "dé",  "/de/"],  ["E", "e",   "/ə/"],    ["F", "effe","/ɛf/"],
    ["G", "gé",  "/ʒe/"],  ["H", "ache","/aʃ/"],   ["I", "i",   "/i/"],
    ["J", "ji",  "/ʒi/"],  ["K", "ka",  "/ka/"],   ["L", "elle","/ɛl/"],
    ["M", "emme","/ɛm/"],  ["N", "enne","/ɛn/"],   ["O", "o",   "/o/"],
    ["P", "pé",  "/pe/"],  ["Q", "ku",  "/ky/"],   ["R", "erre","/ɛʁ/"],
    ["S", "esse","/ɛs/"],  ["T", "té",  "/te/"],   ["U", "u",   "/y/"],
    ["V", "vé",  "/ve/"],  ["W", "double vé", "/dubləve/"],
    ["X", "iks", "/iks/"], ["Y", "i grec", "/iɡʁɛk/"], ["Z", "zède", "/zɛd/"],
  ];

  const DIACRITICS = [
    ["é", "accent aigu",       "/e/",  "été, café, école"],
    ["è", "accent grave",      "/ɛ/",  "mère, près, frère"],
    ["ê", "accent circonflexe","/ɛ/",  "fête, hôtel, île"],
    ["ë", "tréma",             "/ɛ/",  "Noël, naïf"],
    ["à", "accent grave (a)",  "/a/",  "là, déjà, voilà"],
    ["â", "circonflexe (a)",   "/ɑ/",  "pâte, théâtre"],
    ["ç", "cédille",           "/s/",  "ça, garçon, leçon"],
    ["œ", "e dans l'o",        "/œ/",  "cœur, sœur, œuf"],
  ];

  const NASALS = [
    ["an / en", "/ɑ̃/", "encha · enfant, blanc, dans, lent"],
    ["on",      "/ɔ̃/", "ohnnn · bon, son, nom, blond"],
    ["in / ain / ein", "/ɛ̃/", "enh · vin, pain, plein, demain"],
    ["un",      "/œ̃/", "uhnh · un, brun, parfum (fading in modern French — merges with /ɛ̃/)"],
  ];

  const ROUNDED_FRONT = [
    ["u",  "/y/",   "rue, tu, vu, lune (front 'i' with rounded lips)"],
    ["eu", "/ø/",   "deux, peu, bleu, mieux (closed)"],
    ["œu", "/œ/",   "cœur, sœur, neuf (open)"],
  ];

  function letterRow([letter, name, ipa]) {
    return `<tr>
      <td class="al-letter">${escapeHtml(letter)} ${escapeHtml(letter.toLowerCase())}</td>
      <td>${escapeHtml(name)}</td>
      <td class="al-ipa">${escapeHtml(ipa)}</td>
      <td><button class="voice-btn" data-text="${escapeHtml(name)}">▶</button></td>
    </tr>`;
  }

  function diacriticRow([sym, name, ipa, examples]) {
    return `<tr>
      <td class="al-letter">${escapeHtml(sym)}</td>
      <td>${escapeHtml(name)}</td>
      <td class="al-ipa">${escapeHtml(ipa)}</td>
      <td class="al-ex">${escapeHtml(examples)}</td>
      <td><button class="voice-btn" data-text="${escapeHtml(examples)}">▶</button></td>
    </tr>`;
  }

  function soundRow([sym, ipa, examples]) {
    return `<tr>
      <td class="al-letter">${escapeHtml(sym)}</td>
      <td class="al-ipa">${escapeHtml(ipa)}</td>
      <td class="al-ex">${escapeHtml(examples)}</td>
      <td><button class="voice-btn" data-text="${escapeHtml(examples)}">▶</button></td>
    </tr>`;
  }

  function render() {
    const view = document.getElementById("view");
    view.innerHTML = `
      <section class="alphabet">
        <header style="margin-bottom:14px">
          <h2 style="margin:0">Alphabet & sons français</h2>
          <p class="muted">Référence pour absolus débutants. Cliquez sur ▶ pour entendre.</p>
        </header>

        <article class="card">
          <h3>Les 26 lettres</h3>
          <p class="muted">La colonne « se prononce » est la façon dont on nomme la lettre à l'oral (pas le son qu'elle fait dans un mot).</p>
          <table class="al-table">
            <thead><tr><th>Lettre</th><th>Se prononce</th><th>IPA</th><th></th></tr></thead>
            <tbody>${LETTERS.map(letterRow).join("")}</tbody>
          </table>
        </article>

        <article class="card">
          <h3>Accents, cédille, ligatures</h3>
          <p class="muted">Chaque accent change la prononciation OU le sens du mot (ex. « ou » vs « où »).</p>
          <table class="al-table">
            <thead><tr><th>Symbole</th><th>Nom</th><th>IPA</th><th>Exemples</th><th></th></tr></thead>
            <tbody>${DIACRITICS.map(diacriticRow).join("")}</tbody>
          </table>
        </article>

        <article class="card">
          <h3>Voyelles nasales (la falaise A1)</h3>
          <p class="muted">Quatre sons spécifiquement français. L'air passe par le nez ET la bouche. Pas de N final prononcé.</p>
          <table class="al-table">
            <thead><tr><th>Orthographe</th><th>IPA</th><th>Exemples</th><th></th></tr></thead>
            <tbody>${NASALS.map(soundRow).join("")}</tbody>
          </table>
        </article>

        <article class="card">
          <h3>Voyelles arrondies (autre piège anglophone)</h3>
          <p class="muted">L'anglais n'a pas ces sons. La position de la langue est en /i/ ou /e/ mais les lèvres sont arrondies comme pour /u/.</p>
          <table class="al-table">
            <thead><tr><th>Orthographe</th><th>IPA</th><th>Exemples</th><th></th></tr></thead>
            <tbody>${ROUNDED_FRONT.map(soundRow).join("")}</tbody>
          </table>
        </article>

        <article class="card">
          <h3>Conseils de prononciation</h3>
          <ul style="line-height:1.7;padding-left:20px;color:#2d3344">
            <li>Les <strong>consonnes finales</strong> ne se prononcent généralement pas : <em>petit</em> /pə.ti/, <em>gros</em> /ɡʁo/.</li>
            <li>Sauf « <strong>c, r, f, l</strong> » (mnémo : <em>careful</em>) : <em>parc</em>, <em>mer</em>, <em>chef</em>, <em>poil</em>.</li>
            <li>Le <strong>H</strong> est toujours muet : <em>hôtel</em> /o.tɛl/, <em>homme</em> /ɔm/.</li>
            <li>La <strong>liaison</strong> reconnecte une consonne finale au mot suivant si celui-ci commence par une voyelle : <em>les_amis</em>, <em>un_enfant</em>.</li>
            <li>L'<strong>élision</strong> remplace une voyelle finale par une apostrophe : <em>le ami → l'ami</em>, <em>je ai → j'ai</em>.</li>
          </ul>
        </article>

        <p style="text-align:center;margin-top:18px">
          <a class="btn btn-primary" href="#/genre">Maintenant : drill le / la →</a>
        </p>
      </section>
    `;

    document.querySelectorAll(".voice-btn").forEach((b) => {
      b.addEventListener("click", () => window.Speech.speak(b.dataset.text));
    });
  }

  window.AlphabetView = { render };
})();
