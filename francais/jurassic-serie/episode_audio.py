#!/usr/bin/env python3
"""Episode audio: script_data.py -> audio/narration.wav + audio/timeline.json (Azure TTS, per-item cache).
Run with the Azure venv:  nederlands/eurostar-video/.venv/bin/python francais/jurassic-serie/episode_audio.py <episode_dir>
The key is read only here. Slow French (META rate, default -25%), 900 ms after each French sentence, 1.5 s between turns,
`«x»²` said twice, À toi = English prompt, 4 s silence, answer slower then at scene speed."""
import json, wave, re, pathlib, sys, hashlib, io, os
from concurrent.futures import ThreadPoolExecutor
from xml.sax.saxutils import escape
import azure.cognitiveservices.speech as speechsdk
SERIE = pathlib.Path(__file__).resolve().parent; EP = pathlib.Path(sys.argv[1]).resolve()
sys.path.insert(0, str(SERIE)); sys.path.insert(0, str(EP))
from voices import VOICE, MULTILINGUAL
import script_data as SD
from dsl import SEQ, BOARDS, META, SSML_ALIAS
KEY = next(p for p in [SERIE.parent.parent / '.secrets' / 'azuretts-key'] if p.exists()).read_text().strip()
REGION, SR = 'francecentral', 24000
LEAD, GAP, WAIT, TAIL, FRBREAK = 1.0, 1.5, 4.0, 2.0, 900
RATE = META.get('rate', '-25%'); EN_RATE = '-5%'
AUDIO = EP / 'audio'; CACHE = AUDIO / 'cache'; CACHE.mkdir(parents=True, exist_ok=True)

def parse(text, base):
    text = re.sub(r'«([^»]*)»²', lambda m: '«' + m.group(1) + '» «' + m.group(1) + '»', text)
    chars, langs, cards, marks = [], [], [], []; lang = base
    def add(s):
        chars.extend(s); langs.extend([lang] * len(s))
    for part in re.split(r'(\{[^{}]*\}|\[\[[^\]]+\]\]|«|»)', text):
        if not part: continue
        if part == '«': lang = 'fr'; continue
        if part == '»': lang = base; continue
        plain = ''.join(chars); ntok = len(plain.split()); mid = plain and not plain.endswith(' ')
        idx = ntok - 1 if mid else ntok
        if part.startswith('[['): marks.append((idx, part[2:-2]))
        elif part.startswith('{'):
            w, g, e = part[1:-1].split('|'); cards.append((idx if not mid else idx + 1 if False else idx, w, g, e)); add(w)
        else: add(part)
    plain = ''.join(chars); plain = re.sub(r'\s+', ' ', plain)
    # rebuild langs after whitespace collapse
    out_c, out_l = [], []
    for c, l in zip(chars, langs):
        if c.isspace() and out_c and out_c[-1] == ' ': continue
        out_c.append(' ' if c.isspace() else c); out_l.append(l)
    plain = ''.join(out_c).strip(); lead = len(''.join(out_c)) - len(''.join(out_c).lstrip()); out_l = out_l[lead:lead + len(plain)]
    toks = [(m.group(), out_l[m.start()]) for m in re.finditer(r'\S+', plain)]
    return plain, out_l, toks, cards, marks

def alias_text(t):
    """Single regex pass, longest key first; aliases are one word so the token count (subtitle alignment) is unchanged."""
    if not SSML_ALIAS: return t
    keys = sorted(SSML_ALIAS, key=len, reverse=True)
    return re.sub(r'(?<!\w)(' + '|'.join(re.escape(k) for k in keys) + r')(?!\w)', lambda m: SSML_ALIAS[m.group(1)], t)

def ssml(who, plain, langs, fr_rate, final_break):
    runs = []
    for c, l in zip(plain, langs):
        if runs and runs[-1][0] == l: runs[-1][1] += c
        else: runs.append([l, c])
    ml = who in MULTILINGUAL; body = ''
    for i, (l, t) in enumerate(runs):
        t = escape(alias_text(t.strip()) + ' ')
        if l == 'fr':
            t = re.sub(r'([.!?…])\s+(?=\S)', r'\1<break time="%dms"/> ' % FRBREAK, t)
            seg = f'<prosody rate="{fr_rate}">{t}</prosody>'
            if ml: seg = f'<lang xml:lang="fr-FR">{seg}</lang>'
            body += seg + (f'<break time="{FRBREAK}ms"/>' if (i < len(runs) - 1 or final_break) else '')
        else:
            assert ml, f'{who} cannot speak English'
            body += f'<lang xml:lang="en-US"><prosody rate="{EN_RATE}">{t}</prosody></lang>'
    return ('<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="fr-FR">' f'<voice name="{VOICE[who]}">{body}</voice></speak>')

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
    keep = [i for i, (t, _) in enumerate(toks) if re.sub(r'[\W_]', '', t)]   # skip bare punctuation tokens such as '?'
    sub, tms_ = align2([toks[i] for i in keep], words); full = []; k = 0; last = sub[0] if sub else 0.0
    for i in range(len(toks)):
        if k < len(keep) and keep[k] == i: last = sub[k]; k += 1
        full.append(last)
    return full, tms_
def align2(toks, words):
    if len(words) == len(toks): return [w[0] for w in words], 0   # event text is garbled inside <lang> runs, but counts match 1:1
    N = lambda s: re.sub(r'[\W_]', '', s.lower())
    if len(words) != len(toks):   # extra events appear around <lang> switches: greedy match on the first letters
        out = []; j = 0; bad = 0
        for t, _ in toks:
            key = N(t)[:3]
            for look in range(0, 4):
                if j + look < len(words) and N(words[j + look][2]).startswith(key): j += look; break
            else: bad += 1
            out.append(words[min(j, len(words) - 1)][0]); j += 1
        return out, 0 if bad < 3 else 99
    L = lambda s: len(re.sub(r'[\W_]', '', s)); ws = [w for w in words if L(w[2])]
    tl = sum(L(t) for t, _ in toks) or 1; el = sum(L(w[2]) for w in ws) or 1; sc = el / tl
    offs = []; a = 0
    for w in ws: offs.append(a); a += L(w[2])
    out = []; a = 0
    for t, _ in toks:
        x = a * sc; j = max([i for i, o in enumerate(offs) if o <= x + 1e-6] or [0]); out.append(ws[j][0] if ws else 0.0); a += L(t)
    return out, abs(el - tl)

def main():
    jobs = []   # (key, who, ssml) in order
    prep = []
    for n, it in enumerate(SEQ):
        k = it['kind']
        if k == 'fr':
            p = parse(it['text'], 'fr'); prep.append((n, 'fr', p, [synth_args(it['who'], p, RATE, False)]))
        elif k == 'explain':
            p = parse(it['text'], 'en'); prep.append((n, 'ex', p, [synth_args(it['who'], p, RATE, True)]))
        elif k == 'atoi':
            by = it.get('by') or it['who']; pp = parse(it['prompt'], 'en'); pa = parse(it['answer'], 'fr')
            prep.append((n, 'atoi', (pp, pa), [synth_args(it['who'], pp, RATE, False), synth_args(by, pa, '-35%', False), synth_args(by, pa, RATE, False)]))
    with ThreadPoolExecutor(6) as ex: results = list(ex.map(lambda pr: [synth(a) for a in pr[3]], prep))
    R = {pr[0]: (pr, res) for pr, res in zip(prep, results)}
    pcm = bytearray(b'\x00\x00' * int(LEAD * SR)); t = LEAD; items, chapters = [], []; board_groups = {}; warn = 0
    def addpcm(data):
        nonlocal pcm, t
        with wave.open(io.BytesIO(data)) as w:
            assert w.getframerate() == SR and w.getnchannels() == 1
            fr_ = w.readframes(w.getnframes()); dur = w.getnframes() / SR
        pcm += fr_; t0 = t; t += dur; return t0, dur
    def silence(sec):
        nonlocal pcm, t
        pcm += b'\x00\x00' * int(sec * SR); t += sec
    def entry(kind, who, p, res, **extra):
        nonlocal warn
        plain, langs, toks, cards, marks = p; data, vis, words = res
        t0, dur = addpcm(data); wt, miss = align(toks, words)
        if miss > 3: print('WARN align letters differ by', miss, plain[:50]); warn += 1
        wt = [round(t0 + x, 3) for x in wt]; at = lambda i: wt[min(i, len(wt) - 1)] if i > 0 else t0
        d = dict(kind=kind, who=who, tokens=[a for a, _ in toks], langs=[b for _, b in toks], wt=wt, start=round(t0, 3), end=round(t0 + dur, 3),
                 vis=[[round(t0 + o, 3), v] for o, v in vis], cards=[dict(t=at(i), w=w, g=g, en=e) for i, w, g, e in cards],
                 imgs=[dict(t=at(i), n=k_) for i, k_ in marks if k_ != '+'], reveals=[round(at(i), 3) for i, k_ in marks if k_ == '+']); d.update(extra); items.append(d); return d
    first = True
    for n, it in enumerate(SEQ):
        k = it['kind']
        if k == 'chapter':
            if not first: silence(0.6 if not it.get('replay') else 0.8)
            chapters.append(dict(title=it['title'], cast=it['cast'], start=round(t, 3), replay=bool(it.get('replay')), bg=it.get('bg'))); items.append(dict(kind='chapter', start=round(t, 3), end=round(t, 3), title=it['title'], cast=it['cast'], replay=bool(it.get('replay')), bg=it.get('bg'))); first = False; continue
        pr, res = R[n]
        if k == 'fr':
            entry('fr', it['who'], pr[2], res[0], en=it['en'], replay=bool(it.get('replay'))); silence(GAP)
        elif k == 'explain':
            d = entry('ex', it['who'], pr[2], res[0], board=it['board'])
            if it['board']:
                g = board_groups.setdefault(it['board'], 0); board_groups[it['board']] = g + len(d['reveals']); d['first_group'] = g
            silence(GAP)
        else:
            pp, pa = pr[2]; by = it.get('by') or it['who']
            d = entry('ap', it['who'], pp, res[0], prompt=it['prompt'], answer=it['answer'], img=it.get('img')); silence(0.4)
            items.append(dict(kind='aw', who=it['who'], start=round(t, 3), end=round(t + WAIT, 3), prompt=it['prompt'], answer=it['answer'], img=it.get('img'))); silence(WAIT)
            entry('aa', by, pa, res[1], prompt=it['prompt'], answer=it['answer'], n=1, img=it.get('img')); silence(1.0)
            entry('aa', by, pa, res[2], prompt=it['prompt'], answer=it['answer'], n=2, img=it.get('img')); silence(GAP)
    silence(TAIL - GAP if TAIL > GAP else 0)
    for bid, b in BOARDS.items():
        ng = sum(1 for l in b['lines'] if not l.startswith('#') and not l.startswith('+'))
        if board_groups.get(bid, 0) != ng: print('WARN board', bid, 'groups', ng, 'reveals', board_groups.get(bid, 0))
    with wave.open(str(AUDIO / 'narration.wav'), 'wb') as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(bytes(pcm))
    dur = len(pcm) / 2 / SR
    (AUDIO / 'timeline.json').write_text(json.dumps(dict(duration=round(dur, 3), meta=META, chapters=chapters, boards=BOARDS, items=items), ensure_ascii=False, indent=1))
    # stats
    words = lambda kinds: sum(len(i['tokens']) for i in items if i['kind'] in kinds)
    bt = sum(i['end'] - i['start'] for i in items if i['kind'] == 'ex'); at_ = sum(i['end'] - i['start'] for i in items if i['kind'] in ('ap', 'aw', 'aa'))
    print(f"duration {dur/60:.1f} min | explain {bt/60:.1f} min ({100*bt/dur:.0f}%), atoi {at_/60:.1f} min | words fr {words(['fr'])} ex {words(['ex'])} atoi {words(['ap','aa'])} | cards {sum(len(i.get('cards', [])) for i in items)} | align warns {warn}")

def synth_args(who, p, rate, final_break): return ssml(who, p[0], p[1], rate, final_break)
main()
