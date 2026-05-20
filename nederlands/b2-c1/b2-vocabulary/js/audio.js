/* OpenAI Audio: TTS (text-to-speech) and STT (speech-to-text).
 * Browser-direct; uses the same apiKey/aiEnabled as the chat AI. */
(function () {
  const TTS_URL = "https://api.openai.com/v1/audio/speech";
  const STT_URL = "https://api.openai.com/v1/audio/transcriptions";

  function settings() { return window.Store.state.settings; }

  function bumpCounter(kind) {
    const today = new Date().toISOString().slice(0, 10);
    const log = window.Store.state.aiCallsByDay;
    if (!log[today]) log[today] = { total: 0, byKind: {} };
    log[today].total += 1;
    log[today].byKind[kind] = (log[today].byKind[kind] || 0) + 1;
    window.Store.save();
  }

  /**
   * Generate audio from text.
   * Returns a Blob (audio/mpeg or audio/wav depending on model).
   */
  async function tts(text, opts = {}) {
    const key = settings().apiKey;
    if (!key) throw new Error("Geen API-sleutel ingesteld. Ga naar Instellingen.");
    const model = opts.model || settings().ttsModel || "gpt-4o-mini-tts";
    const voice = opts.voice || settings().ttsVoice || "shimmer";
    const body = {
      model,
      input: text,
      voice,
      // gpt-4o-mini-tts supports an `instructions` field for tone/accent guidance
      ...(model === "gpt-4o-mini-tts" && opts.instructions ? { instructions: opts.instructions } : {}),
      response_format: opts.format || "mp3",
    };
    const resp = await fetch(TTS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + key },
      body: JSON.stringify(body),
    });
    if (!resp.ok) {
      const txt = await resp.text().catch(() => "");
      throw new Error(`TTS fout ${resp.status}: ${txt.slice(0, 200)}`);
    }
    const blob = await resp.blob();
    bumpCounter("tts");
    return blob;
  }

  /**
   * Transcribe audio Blob/File to text.
   * Returns { text } object.
   */
  async function stt(blob, opts = {}) {
    const key = settings().apiKey;
    if (!key) throw new Error("Geen API-sleutel ingesteld. Ga naar Instellingen.");
    const model = opts.model || settings().sttModel || "gpt-4o-mini-transcribe";
    const language = opts.language || "nl";

    const form = new FormData();
    form.append("file", blob, "recording.webm");
    form.append("model", model);
    form.append("language", language);
    if (opts.prompt) form.append("prompt", opts.prompt);
    form.append("response_format", "json");

    const resp = await fetch(STT_URL, {
      method: "POST",
      headers: { Authorization: "Bearer " + key },
      body: form,
    });
    if (!resp.ok) {
      const txt = await resp.text().catch(() => "");
      throw new Error(`STT fout ${resp.status}: ${txt.slice(0, 200)}`);
    }
    const data = await resp.json();
    bumpCounter("stt");
    return data;
  }

  /* ============ Microphone recording (browser MediaRecorder) ============ */
  // Returns a {start, stop} pair. stop() resolves with the recorded Blob.
  function recorder() {
    let mediaRecorder = null;
    let chunks = [];
    let stream = null;

    async function start() {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : (MediaRecorder.isTypeSupported("audio/mp4") ? "audio/mp4" : "");
      mediaRecorder = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
      chunks = [];
      mediaRecorder.ondataavailable = (e) => { if (e.data && e.data.size) chunks.push(e.data); };
      mediaRecorder.start();
    }

    function stop() {
      return new Promise((resolve, reject) => {
        if (!mediaRecorder) return reject(new Error("Niet aan het opnemen."));
        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: mediaRecorder.mimeType || "audio/webm" });
          if (stream) stream.getTracks().forEach((t) => t.stop());
          resolve(blob);
        };
        mediaRecorder.stop();
      });
    }

    function state() { return mediaRecorder ? mediaRecorder.state : "inactive"; }

    return { start, stop, state };
  }

  window.Audio2 = { tts, stt, recorder };
})();
