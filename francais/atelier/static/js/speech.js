/* TTS wrapper with two backends:
 *   1. Web Speech API (free, offline, instant) — preferred when an FR voice
 *      is present (every recent browser + OS combo ships one or two).
 *   2. OpenAI /api/ai/tts proxy — fallback when no FR Web Speech voice.
 *      Returns an audio blob URL that views can <audio src> directly.
 *
 * The Atelier voice contract:
 *   Camille = nova   (OpenAI female-clear, fr-FR default)
 *   Antoine = echo   (OpenAI male, fr-FR)
 *   Sylvie  = onyx   (OpenAI fr-CA-ish — we use the dialect setting)
 *
 * For Web Speech, we try to map a Camille/Antoine request to a fr-FR voice
 * the browser knows, preferring female/male names if voice metadata hints
 * at gender (Apple voices include "Amélie", "Thomas"; Chrome on Linux uses
 * generic "Google français").
 */
(function () {
  const supported = typeof window !== "undefined" && "speechSynthesis" in window;
  let cached = [];

  function refresh() {
    if (!supported) return [];
    cached = window.speechSynthesis.getVoices() || [];
    return cached;
  }
  if (supported) {
    refresh();
    window.speechSynthesis.addEventListener?.("voiceschanged", refresh);
  }

  // Find a voice for a given dialect + preferred gender hint.
  function pickWebSpeechVoice(dialect, voiceKey) {
    const list = refresh();
    if (!list.length) return null;
    const dialectLower = (dialect || "fr-FR").toLowerCase();
    const frVoices = list.filter((v) =>
      v.lang.toLowerCase().replace("_", "-").startsWith(dialectLower)
    );
    // If no exact dialect, fall back to any fr-* voice.
    const pool = frVoices.length ? frVoices
      : list.filter((v) => /^fr/i.test(v.lang));
    if (!pool.length) return null;

    // Hint on gender from voice name when possible.
    const femaleHints = /am(é|e)lie|aurélie|virginie|julie|camille|denise|sylvie|female/i;
    const maleHints = /thomas|nicolas|henri|antoine|paul|olivier|male/i;
    if (voiceKey === "nova") {
      const f = pool.find((v) => femaleHints.test(v.name));
      if (f) return f;
    } else if (voiceKey === "echo") {
      const m = pool.find((v) => maleHints.test(v.name));
      if (m) return m;
    }
    return pool[0];
  }

  // Public API: speak text. Resolves when audio starts playing (or
  // immediately for synchronous Web Speech backends).
  async function speak(text, { voiceKey, dialect, rate } = {}) {
    if (!text) return;
    const pref = window.Store?.state.voicePref || {};
    voiceKey = voiceKey || pref.voice || "nova";
    dialect = dialect || pref.dialect || "fr-FR";
    rate = rate ?? (window.Store?.state.settings.playbackRate ?? 1.0);

    // 1. Web Speech first.
    if (supported) {
      const voice = pickWebSpeechVoice(dialect, voiceKey);
      if (voice) {
        try {
          window.speechSynthesis.cancel();
          const u = new SpeechSynthesisUtterance(text);
          u.voice = voice;
          u.lang = voice.lang;
          u.rate = rate;
          u.pitch = 1.0;
          u.volume = 1.0;
          window.speechSynthesis.speak(u);
          return { backend: "webspeech", voice: voice.name };
        } catch (e) {
          // fall through to OpenAI
        }
      }
    }

    // 2. OpenAI fallback. Only available if /api/ai/config.openai is true.
    if (!window.Store?.state.aiConfig?.openai) {
      console.warn("[speech] no Web Speech FR voice and no OpenAI key configured");
      return null;
    }
    try {
      const blob = await window.API.postBlob("/api/ai/tts", {
        text,
        provider: "openai",
        voice: voiceKey,
        model: "gpt-4o-mini-tts",
      });
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.playbackRate = rate;
      audio.addEventListener("ended", () => URL.revokeObjectURL(url));
      await audio.play();
      return { backend: "openai", voice: voiceKey };
    } catch (e) {
      console.warn("[speech] OpenAI TTS failed:", e.message);
      return null;
    }
  }

  function stop() {
    if (supported) window.speechSynthesis.cancel();
  }

  // Does Web Speech have any FR voice at all?
  function hasFrenchWebSpeech() {
    if (!supported) return false;
    return refresh().some((v) => /^fr/i.test(v.lang));
  }

  window.Speech = { supported, speak, stop, hasFrenchWebSpeech, refresh };
})();
