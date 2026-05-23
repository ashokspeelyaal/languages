/* Web Speech API wrapper with explicit Ellen (BE) + Xander (NL) voices.
 * Voices load async in some browsers — we wait for the voiceschanged event. */
(function () {
  const supported = typeof window !== "undefined" && "speechSynthesis" in window;
  let cachedVoices = [];

  function refresh() {
    if (!supported) return [];
    cachedVoices = window.speechSynthesis.getVoices() || [];
    return cachedVoices;
  }
  if (supported) {
    refresh();
    window.speechSynthesis.addEventListener?.("voiceschanged", refresh);
  }

  // Find a voice by name, falling back to any matching lang code
  function findByNameOrLang(name, langPrefix) {
    const list = refresh();
    let v = list.find((v) => v.name === name);
    if (v) return v;
    // Fall back to first voice of the desired lang (handle nl-BE / nl_BE / nl-NL)
    const lang = langPrefix.toLowerCase();
    v = list.find((v) => v.lang.toLowerCase().replace("_", "-").startsWith(lang));
    if (v) return v;
    // Last resort: any Dutch voice
    v = list.find((v) => /^nl/i.test(v.lang));
    return v || null;
  }

  function speak(text, voiceName) {
    if (!supported || !text) return;
    try {
      window.speechSynthesis.cancel(); // stop any prior utterance
      const u = new SpeechSynthesisUtterance(text);
      let voice;
      if (voiceName === "Ellen") voice = findByNameOrLang("Ellen", "nl-BE");
      else if (voiceName === "Xander") voice = findByNameOrLang("Xander", "nl-NL");
      else voice = findByNameOrLang(null, "nl-BE");

      if (voice) {
        u.voice = voice;
        u.lang = voice.lang;
      } else {
        u.lang = "nl-BE";
      }
      const rate = (window.Store && window.Store.state.settings.speechRate) || 0.95;
      u.rate = rate;
      u.pitch = 1.0;
      u.volume = 1.0;
      window.speechSynthesis.speak(u);
    } catch (e) {
      console.warn("Speech failed:", e);
    }
  }

  function available(voiceName) {
    if (!supported) return false;
    const v = findByNameOrLang(voiceName, voiceName === "Ellen" ? "nl-BE" : "nl-NL");
    return !!v;
  }

  function stop() { if (supported) window.speechSynthesis.cancel(); }

  window.Speech = { supported, speak, stop, available, voices: () => cachedVoices, refresh };
})();
