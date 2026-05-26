/* WAV encoder.
 *
 * Browser MediaRecorder gives us WebM/opus. Azure Pronunciation Assessment
 * needs WAV 16kHz mono 16-bit PCM. We decode the WebM in an AudioContext,
 * resample via OfflineAudioContext, then write a WAV file by hand.
 *
 * Returns a Blob ready to POST to /api/ai/pronounce.
 */
(function () {
  async function blobToWav16k(blob) {
    const ab = await blob.arrayBuffer();
    const tmpCtx = new (window.AudioContext || window.webkitAudioContext)();
    let decoded;
    try {
      decoded = await tmpCtx.decodeAudioData(ab.slice(0));
    } finally {
      tmpCtx.close().catch(() => {});
    }
    // Resample to 16 kHz mono.
    const targetRate = 16000;
    const length = Math.ceil(decoded.duration * targetRate);
    const off = new OfflineAudioContext(1, length, targetRate);
    const src = off.createBufferSource();
    if (decoded.numberOfChannels === 1) {
      src.buffer = decoded;
    } else {
      // Downmix to mono by averaging channels into a new buffer first.
      const mono = off.createBuffer(1, decoded.length, decoded.sampleRate);
      const out = mono.getChannelData(0);
      for (let ch = 0; ch < decoded.numberOfChannels; ch++) {
        const data = decoded.getChannelData(ch);
        for (let i = 0; i < data.length; i++) out[i] += data[i] / decoded.numberOfChannels;
      }
      src.buffer = mono;
    }
    src.connect(off.destination);
    src.start();
    const rendered = await off.startRendering();
    return encodeWav(rendered.getChannelData(0), targetRate);
  }

  function encodeWav(samples, sampleRate) {
    const buf = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buf);
    writeString(view,  0, "RIFF");
    view.setUint32(    4, 36 + samples.length * 2, true);
    writeString(view,  8, "WAVE");
    writeString(view, 12, "fmt ");
    view.setUint32(   16, 16, true);          // chunk size
    view.setUint16(   20, 1, true);           // PCM
    view.setUint16(   22, 1, true);           // mono
    view.setUint32(   24, sampleRate, true);
    view.setUint32(   28, sampleRate * 2, true);
    view.setUint16(   32, 2, true);           // block align
    view.setUint16(   34, 16, true);          // bits per sample
    writeString(view, 36, "data");
    view.setUint32(   40, samples.length * 2, true);
    let o = 44;
    for (let i = 0; i < samples.length; i++) {
      let s = Math.max(-1, Math.min(1, samples[i]));
      view.setInt16(o, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
      o += 2;
    }
    return new Blob([buf], { type: "audio/wav" });
  }

  function writeString(view, offset, str) {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  }

  window.WavEncoder = { blobToWav16k };
})();
