#!/usr/bin/env python3
"""Generate guide-<voice>.mp3 from guide.txt via Azure TTS REST (ta-IN, formal).
Run: python3 generate.py [female|male]   (default: both). Key read from languages/.secrets/azuretts-key."""
import pathlib, sys, urllib.request, html, re
HERE = pathlib.Path(__file__).resolve().parent
KEY = (HERE.parents[1] / ".secrets" / "azuretts-key").read_text().strip()
REGION = "francecentral"
VOICES = {"female": "ta-IN-PallaviNeural", "male": "ta-IN-ValluvarNeural"}
lines = [l.strip() for l in (HERE / "guide.txt").read_text().splitlines() if l.strip()]

# Pronunciation fixes: spoken form (Tamil script) for the brand and letter-by-letter acronyms.
LETTERS = dict(A="ஏ", B="பி", C="சி", E="இ", F="எஃப்", G="ஜி", I="ஐ", N="என்", O="ஓ",
               P="பி", Q="க்யூ", R="ஆர்", S="எஸ்", U="யு")
BRAND = "Campus Zee-us"
SPELL = ["NIRF", "IQAC", "AQAR", "SSR", "CBSE", "UPI", "GPS", "AI"]
SUBS = [(r"Campus Zeus", BRAND), (r"campuszeus dot in", BRAND + " டாட் இன்"), (r"iOS", "ஐ ஓ எஸ்")]
SUBS += [(rf"\b{a}\b", " ".join(LETTERS[c] for c in a)) for a in SPELL]

def to_ssml(line):
    t = html.escape(line)
    for pat, alias in SUBS:
        t = re.sub(pat, lambda m: f"<sub alias='{alias}'>{m.group(0)}</sub>", t)
    return t

body = "".join(f"<p>{to_ssml(l)}</p><break time='700ms'/>" for l in lines)

def synth(voice, out):
    ssml = (f"<speak version='1.0' xml:lang='ta-IN'><voice name='{voice}'>"
            f"<prosody rate='-5%'>{body}</prosody></voice></speak>")
    req = urllib.request.Request(
        f"https://{REGION}.tts.speech.microsoft.com/cognitiveservices/v1",
        data=ssml.encode(), method="POST", headers={
            "Ocp-Apim-Subscription-Key": KEY, "Content-Type": "application/ssml+xml",
            "X-Microsoft-OutputFormat": "audio-48khz-192kbitrate-mono-mp3", "User-Agent": "tts-script"})
    with urllib.request.urlopen(req) as r:
        out.write_bytes(r.read())
    print("wrote", out.name)

for k in (sys.argv[1:] or VOICES):
    synth(VOICES[k], HERE / f"guide-{k}.mp3")
