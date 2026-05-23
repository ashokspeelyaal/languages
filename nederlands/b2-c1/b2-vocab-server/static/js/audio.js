/* Audio helpers — TTS / STT delegate to the AI module (server proxy).
 * The browser MediaRecorder for mic capture stays here since it's pure
 * client-side. */
(function () {
  async function tts(text, opts = {}) {
    return window.AI.openaiTTS(text, opts);
  }

  async function stt(blob, opts = {}) {
    // Original returned { text } from a plain JSON Whisper call. Our
    // /api/ai/transcribe returns { text, words } — we drop words here for
    // callers that only need text. Karaoke-sync uses AI.transcribeWithTimestamps
    // directly.
    const form = new FormData();
    form.append("file", blob, "recording.webm");
    form.append("language", opts.language || "nl");
    form.append("word_timings", "false");
    if (opts.prompt) form.append("prompt", opts.prompt);
    const data = await window.API.postForm("/api/ai/transcribe", form);
    return { text: data.text || "" };
  }

  /* ============ Microphone recording (browser MediaRecorder) ============ */
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
