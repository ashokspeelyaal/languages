#!/usr/bin/env python3
"""Episode audio: script.txt -> audio/narration.wav + audio/timeline.json (Azure TTS, per-turn cache).
Azure venv:  nederlands/eurostar-video/.venv/bin/python nederlands/jurassic-luister/engine/episode_audio.py <episode_dir>
Key is read only here (never printed). Pace/gap from levels.py (META level). Prints duration, word count, card count, alignment warnings."""
import json, wave, re, pathlib, sys, hashlib, io
from concurrent.futures import ThreadPoolExecutor
from xml.sax.saxutils import escape
import azure.cognitiveservices.speech as speechsdk
ENG = pathlib.Path(__file__).resolve().parent; EP = pathlib.Path(sys.argv[1]).resolve(); sys.path.insert(0, str(ENG))
from voices import VOICE, MULTILINGUAL, LOCALE
from levels import LEVELS
import dsl
dsl.load(EP / 'script.txt'); SEQ, META, ALIAS = dsl.SEQ, dsl.META, dsl.ALIAS
LV = LEVELS[META.get('level', 'B2')]
KEY = (ENG.parents[2] / '.secrets' / 'azuretts-key').read_text().strip()
REGION, SR = 'francecentral', 24000
LEAD = 8.0; GAP = LV['gap']; TAIL = 1.5; RATE = META.get('rate', LV['rate'])
AUDIO = EP / 'audio'; CACHE = AUDIO / 'cache'; CACHE.mkdir(parents=True, exist_ok=True)

def parse(text):
    plain = ''; cards = []; marks = []
    for part in re.split(r'(\{[^{}]*\}|\[\[[^\]]+\]\])', text):
        if not part: continue
        ntok = len(plain.split()); idx = ntok if (not plain or plain.endswith(' ')) else ntok - 1
        if part.startswith('[['): marks.append((idx, part[2:-2]))
        elif part.startswith('{'):
            w, nl, en = part[1:-1].split('|'); cards.append((idx, w, nl, en)); plain += w
        else: plain += part
    plain = re.sub(r'\s+', ' ', plain).strip()
    return plain, plain.split(), cards, marks

def alias_text(t):
    if not ALIAS: return t
    keys = sorted(ALIAS, key=len, reverse=True)
    return re.sub(r'(?<!\w)(' + '|'.join(re.escape(k) for k in keys) + r')(?!\w)', lambda m: ALIAS[m.group(1)], t)

def ssml(who, plain):
    loc = LOCALE.get(who, 'nl-NL'); t = escape(alias_text(plain))
    body = f'<prosody rate="{RATE}">{t}</prosody>'
    if who in MULTILINGUAL: body = f'<lang xml:lang="nl-NL">{body}</lang>'
    return f'<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="{loc}"><voice name="{VOICE[who]}">{body}</voice></speak>'

def synth(s_ml):
    h = hashlib.md5(s_ml.encode()).hexdigest(); cj, cw = CACHE / f'{h}.json', CACHE / f'{h}.wav'
    if cj.exists() and cw.exists():
        d = json.loads(cj.read_text()); return cw.read_bytes(), d['vis'], d['words']
    cfg = speechsdk.SpeechConfig(subscription=KEY, region=REGION)
    cfg.set_speech_synthesis_output_format(speechsdk.SpeechSynthesisOutputFormat.Riff24Khz16BitMonoPcm)
    for attempt in range(4):
        s = speechsdk.SpeechSynthesizer(speech_config=cfg, audio_config=None); vis, words = [], []
        s.viseme_received.connect(lambda e: vis.append((e.audio_offset / 1e7, e.viseme_id)))
        def wb(e):
            d = e.duration; d = d.total_seconds() if hasattr(d, 'total_seconds') else d / 1e7
            if e.boundary_type == speechsdk.SpeechSynthesisBoundaryType.Word: words.append((e.audio_offset / 1e7, d, e.text))
        s.synthesis_word_boundary.connect(wb)
        r = s.speak_ssml_async(s_ml).get()
        if r.reason == speechsdk.ResultReason.SynthesizingAudioCompleted: break
        print('retry', attempt, r.reason, speechsdk.SpeechSynthesisCancellationDetails(r).error_details[:200] if r.reason == speechsdk.ResultReason.Canceled else '', flush=True)
    else: raise RuntimeError('synthesis failed: ' + s_ml[:200])
    cw.write_bytes(r.audio_data); cj.write_text(json.dumps({'vis': vis, 'words': words}))
    return r.audio_data, vis, words

def align(toks, words):
    """word start per token. Counts normally match 1:1 (aliases are single words); otherwise match on first letters."""
    if len(words) == len(toks): return [w[0] for w in words], 0
    N = lambda s: re.sub(r'[\W_]', '', s.lower())
    out = []; j = 0; bad = 0
    for t in toks:
        key = N(t)[:3]
        for look in range(0, 4):
            if j + look < len(words) and N(words[j + look][2]).startswith(key): j += look; break
        else: bad += 1
        out.append(words[min(j, len(words) - 1)][0]); j += 1
    return out, bad

def main():
    prep = []
    for n, it in enumerate(SEQ):
        if it['kind'] == 'say':
            p = parse(it['text']); prep.append((n, p, ssml(it['who'], p[0])))
    with ThreadPoolExecutor(6) as ex: results = list(ex.map(lambda pr: synth(pr[2]), prep))
    R = {pr[0]: (pr[1], res) for pr, res in zip(prep, results)}
    pcm = bytearray(b'\x00\x00' * int(LEAD * SR)); t = LEAD; items = []; chapters = []; warn = 0
    def addpcm(data):
        nonlocal pcm, t
        with wave.open(io.BytesIO(data)) as w:
            assert w.getframerate() == SR and w.getnchannels() == 1
            fr_ = w.readframes(w.getnframes()); dur = w.getnframes() / SR
        pcm += fr_; t0 = t; t += dur; return t0, dur
    def silence(sec):
        nonlocal pcm, t
        pcm += b'\x00\x00' * int(sec * SR); t += sec
    first = True
    for n, it in enumerate(SEQ):
        if it['kind'] == 'chapter':
            if not first: silence(0.5)
            chapters.append(dict(title=it['title'], cast=it['cast'], start=round(t, 3), bg=it['bg']))
            items.append(dict(kind='chapter', start=round(t, 3), end=round(t, 3), title=it['title'], cast=it['cast'], bg=it['bg'])); first = False; continue
        (plain, toks, cards, marks), (data, vis, words) = R[n]
        t0, dur = addpcm(data); wt, bad = align(toks, words)
        if bad > 2: print('WARN align', bad, plain[:50]); warn += 1
        wt = [round(t0 + x, 3) for x in wt]; at = lambda i: wt[min(i, len(wt) - 1)]
        items.append(dict(kind='say', who=it['who'], tokens=toks, wt=wt, start=round(t0, 3), end=round(t0 + dur, 3), vis=[[round(t0 + o, 3), v] for o, v in vis],
                          cards=[dict(t=at(i), w=w, nl=nl, en=en) for i, w, nl, en in cards], imgs=[dict(t=at(i), n=k_) for i, k_ in marks])); silence(GAP)
    silence(TAIL)
    with wave.open(str(AUDIO / 'narration.wav'), 'wb') as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(bytes(pcm))
    dur = len(pcm) / 2 / SR
    (AUDIO / 'timeline.json').write_text(json.dumps(dict(duration=round(dur, 3), lead=LEAD, meta=META, level=META.get('level', 'B2'), chapters=chapters, items=items), ensure_ascii=False, indent=1))
    nw = sum(len(i['tokens']) for i in items if i['kind'] == 'say'); nc = sum(len(i['cards']) for i in items if i['kind'] == 'say')
    print(f"duration {(dur-LEAD)/60:.1f} min speech (+{LEAD:.0f}s lead) | words {nw} | cards {nc} | turns {sum(1 for i in items if i['kind']=='say')} | align warns {warn}")
main()
