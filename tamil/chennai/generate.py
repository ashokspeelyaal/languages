#!/usr/bin/env python3
"""Generate chennai.mp3 from chennai.txt via Azure TTS REST (ta-IN). Key read from languages/.secrets/azuretts-key."""
import pathlib, urllib.request, html
HERE = pathlib.Path(__file__).resolve().parent
KEY = (HERE.parents[1] / ".secrets" / "azuretts-key").read_text().strip()
REGION, VOICE = "francecentral", "ta-IN-PallaviNeural"
lines = [l.strip() for l in (HERE / "chennai.txt").read_text().splitlines() if l.strip()]
body = "".join(f"<p>{html.escape(l)}</p><break time='500ms'/>" for l in lines)
ssml = (f"<speak version='1.0' xml:lang='ta-IN'><voice name='{VOICE}'>"
        f"<prosody rate='-8%'>{body}</prosody></voice></speak>")
req = urllib.request.Request(
    f"https://{REGION}.tts.speech.microsoft.com/cognitiveservices/v1",
    data=ssml.encode(), method="POST", headers={
        "Ocp-Apim-Subscription-Key": KEY, "Content-Type": "application/ssml+xml",
        "X-Microsoft-OutputFormat": "audio-24khz-96kbitrate-mono-mp3", "User-Agent": "tts-script"})
with urllib.request.urlopen(req) as r:
    (HERE / "chennai.mp3").write_bytes(r.read())
print("wrote chennai.mp3")
