#!/usr/bin/env python3
"""Episode renderer: audio/timeline.json + images -> master_720.mp4 (1280x720, 30 fps; laid out at 1920x1080, resized per frame).
Pillow python:  /opt/homebrew/bin/python3.13 nederlands/jurassic-luister/engine/episode_render.py <episode_dir> [still 95s 300s ...]
Layout: photo (Ken Burns, crossfade 0.6 s), cast busts bottom-left (speaker highlighted, visemes, blinks), Dutch karaoke subtitles bottom
(current sentence, max 3 lines), vocab cards top-right (Dutch item + Dutch explanation + English, max 2 stacked), chapter chip top-left,
title card + disclaimer card at the start, disclaimer card + photo credits at the end. No English subtitles (cards carry the English)."""
import json, math, subprocess, sys, os, re, time, pathlib, textwrap
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from multiprocessing import Pool
ENG = pathlib.Path(__file__).resolve().parent; EP = pathlib.Path(sys.argv[1]).resolve(); sys.path.insert(0, str(ENG)); sys.path.insert(0, str(EP))
import characters as CH
from levels import LEVELS, DISCLAIMER
from imgmap import IMG as IMGMAP
IMGD = EP / 'images'; TL = json.load(open(EP / 'audio' / 'timeline.json')); ITEMS = TL['items']; META = TL['meta']; LV = LEVELS[TL['level']]
FPS = 30; W, H = 1920, 1080; OW, OH = 1280, 720; ADUR = TL['duration']; LEAD = TL['lead']
DISC_END = 4.5; CRED = 11.0; DUR = ADUR + DISC_END + CRED
OUT = EP / 'master_720.mp4'; AUDIO_WAV = EP / 'audio' / 'narration.wav'; CARD_LEN = LV['card_len']
TITLE_T = 3.5   # title card 0..3.5, disclaimer 3.5..LEAD
HEL = '/System/Library/Fonts/Helvetica.ttc'
_f = {}
def font(s, b=False):
    k = (s, b)
    if k not in _f: _f[k] = ImageFont.truetype(HEL, s, index=1 if b else 0)
    return _f[k]
NAVY = (20, 24, 38); GOLD = (255, 214, 64); YEL = (255, 226, 70); CYAN = (127, 216, 255); WHITE = (255, 255, 255)
SAY = [i for i in ITEMS if i['kind'] == 'say']; CHAPS = [i for i in ITEMS if i['kind'] == 'chapter']
def item_at(t):
    cur = SAY[0]
    for it in SAY:
        if it['start'] - 0.3 <= t: cur = it
        else: break
    return cur
def chap_at(t):
    cur = CHAPS[0]
    for c in CHAPS:
        if c['start'] <= t + 0.05: cur = c
    return cur
MARKS = []
for it in ITEMS:
    if it['kind'] == 'chapter' and it.get('bg'): MARKS.append((it['start'] if it['start'] > LEAD + 1 else 0, it['bg']))
    for m in it.get('imgs', []): MARKS.append((m['t'], m['n']))
MARKS.sort(key=lambda x: x[0])
SLOTS = []
for t, n in MARKS:
    if SLOTS and SLOTS[-1][2] == n: continue
    if SLOTS and t - SLOTS[-1][0] < 0.3: SLOTS[-1] = (SLOTS[-1][0], 0, n); continue
    SLOTS.append((t, 0, n))
SLOTS = [(a if k else 0, (SLOTS[k + 1][0] if k + 1 < len(SLOTS) else ADUR), n) for k, (a, _, n) in enumerate(SLOTS)]
def check():
    for a, b, n in SLOTS:
        if n not in IMGMAP or not (IMGD / IMGMAP[n]).exists(): print('MISSING IMAGE', n)
        if b - a > 20 and a > 0: print('WARN long photo hold', n, round(a), round(b - a), 's')
_cache = {}; _bgc = {}
def load(n):
    if n not in _cache: _cache[n] = Image.open(IMGD / IMGMAP[n]).convert('RGB')
    return _cache[n]
def cover(src):
    sw, sh = src.size; s = max(W / sw, H / sh); r = src.resize((int(sw * s) + 1, int(sh * s) + 1), Image.BILINEAR)
    l = (r.width - W) // 2; tp = (r.height - H) // 2; return r.crop((l, tp, l + W, tp + H))
def photo(idx, t):
    t0, t1, name = SLOTS[idx]; src = load(name); sw, sh = src.size
    p = min(1, max(0, (t - t0) / max(1.0, t1 - t0)))
    if idx % 2: p = 1 - p
    if sw / sh < 1.3:
        if name not in _bgc: _bgc[name] = cover(src).filter(ImageFilter.GaussianBlur(30)).point(lambda v: int(v * 0.55))
        out = _bgc[name].copy(); fh = int(800 * (1 + 0.03 * p)); fw = int(fh * sw / sh); out.paste(src.resize((fw, fh), Image.BILINEAR), ((W - fw) // 2, 20)); return out
    z = 1.04 + 0.10 * p; cw = min(sw, sh * W / H) / z; ch = cw * H / W
    px = 0.5 + 0.12 * (p - 0.5) * (1 if idx % 3 else -1); py = 0.5 + 0.06 * (p - 0.5)
    x0 = (sw - cw) * min(1, max(0, px)); y0 = (sh - ch) * min(1, max(0, py))
    return src.resize((W, H), Image.BILINEAR, box=(x0, y0, x0 + cw, y0 + ch))
XF = 0.6
def background(t):
    idx = 0
    for k, (a, b, _) in enumerate(SLOTS):
        if t >= a - XF / 2: idx = k
    im = photo(idx, min(t, ADUR))
    if idx > 0:
        a = SLOTS[idx][0]
        if t < a + XF / 2:
            k = min(1, max(0, (t - (a - XF / 2)) / XF)); k = k * k * (3 - 2 * k); im = Image.blend(photo(idx - 1, t), im, k)
    return im
def comp(im, layer):
    im.paste(layer.convert('RGB'), mask=layer.getchannel('A')); return im
def blink_at(t, k): return ((t + k * 1.7) % 3.6) < 0.13
def mouth_at(it, t):
    m = 'closed'
    for vt, v in it['vis']:
        if vt <= t: m = CH.mouth_shape(v)
        else: break
    return m
BW, BH, BY = 214, 272, 548
def draw_bust_box(im, who, x, y, w, h, active, mouth, t, bh):
    d = ImageDraw.Draw(im, 'RGBA'); c = CH.COLOR[who]
    d.rounded_rectangle([x, y, x + w, y + h], 30, fill=(20, 24, 38, 165 if active else 205), outline=c + (255 if active else 90,), width=6 if active else 3)
    bob = math.sin(t * 9) * 3 if active else math.sin(t * 1.6) * 1.5
    spr = CH.bust(who, mouth if active else 'closed', blink_at(t, sum(map(ord, who)) % 3), bh)
    layer = Image.new('RGBA', im.size, (0, 0, 0, 0)); layer.paste(spr, (x + (w - spr.width) // 2, int(y + 12 + bob)))
    mask = Image.new('L', im.size, 0); ImageDraw.Draw(mask).rounded_rectangle([x + 2, y + 2, x + w - 2, y + h - 2], 28, fill=255)
    la = np.minimum(np.array(layer.getchannel('A')), np.array(mask))
    if not active: la = (la * 0.6).astype(np.uint8)
    layer.putalpha(Image.fromarray(la)); comp(im, layer)
    d = ImageDraw.Draw(im, 'RGBA'); nm = CH.NAMES[who]; tw = d.textlength(nm, font=font(24, True)); nx = x + w / 2
    d.rounded_rectangle([nx - tw / 2 - 16, y + h - 40, nx + tw / 2 + 16, y + h - 8], 16, fill=c + (255 if active else 150,)); d.text((nx, y + h - 24), nm, font=font(24, True), fill=(20, 24, 38, 255), anchor='mm')
def wrap(d, toks, fn, fbn, maxw):
    lines = [[]]; w = 0; sp = d.textlength(' ', font=fn)
    for k, tk in enumerate(toks):
        tw = d.textlength(tk, font=fbn)
        if lines[-1] and w + tw > maxw: lines.append([]); w = 0
        lines[-1].append(k); w += tw + sp
    return lines
def sentence_window(it, t):
    toks = it['tokens']; wt = it['wt']; ci = max([k for k in range(len(toks)) if wt[k] <= t] or [0]); sents = []; a = 0
    for k, tk in enumerate(toks):
        if re.search(r'[.!?:…]["»”]?$', tk) or k == len(toks) - 1: sents.append((a, k + 1)); a = k + 1
    a, b = [r for r in sents if r[0] <= ci < r[1]][0]; return a, b, ci
def draw_tokens(d, it, t, x_center, y_top, maxw, sizes, hi, base_col, maxlines=3):
    a, b, ci = sentence_window(it, t); st = it['tokens'][a:b]
    for fs in sizes:
        fn, fb = font(fs), font(fs, True); lines = wrap(d, st, fn, fb, maxw)
        if len(lines) <= maxlines: break
    cur = ci - a
    if len(lines) > maxlines:
        li = [i for i, ln in enumerate(lines) if cur in ln][0]; lo = min(max(0, li - 1), len(lines) - maxlines); lines = lines[lo:lo + maxlines]
    lh = int(fs * 1.16); y = y_top; sp = d.textlength(' ', font=fn)
    for ln in lines:
        wd = sum(d.textlength(st[k], font=fb if k == cur else fn) + sp for k in ln) - sp; x = x_center - wd / 2
        for k in ln:
            curw = k == cur; ff = fb if curw else fn
            d.text((x, y), st[k], font=ff, fill=(hi if curw else base_col) + (255,)); x += d.textlength(st[k], font=ff) + sp
        y += lh
def card_sched():
    cards = sorted([(c['t'], c) for it in SAY for c in it['cards']], key=lambda x: x[0]); free = [0.0, 0.0]; out = []
    for t, c in cards:
        k = 0 if free[0] <= free[1] else 1; st = max(t - 0.2, free[k]); free[k] = st + CARD_LEN + 0.12; out.append(dict(c, st=st, slot=k))
    return out
CARDS = card_sched()
def wrap_text(d, text, f, maxw):
    lines = []; cur = ''
    for w in text.split():
        if cur and d.textlength(cur + ' ' + w, font=f) > maxw: lines.append(cur); cur = w
        else: cur = (cur + ' ' + w).strip()
    return lines + [cur]
def draw_card(im, c, age):
    a = int(255 * min(1, age / 0.3, (CARD_LEN - age) / 0.4)); slide = int((1 - min(1, age / 0.3)) * 40)
    cw, chh = 700, 262; x0 = W - cw - 30 + slide; y0 = 28 + c['slot'] * 280; d = ImageDraw.Draw(im, 'RGBA')
    d.rounded_rectangle([x0, y0, x0 + cw, y0 + chh], 24, fill=(255, 250, 235, int(a * 0.97)), outline=GOLD + (a,), width=5)
    d.rounded_rectangle([x0 + 8, y0 + 12, x0 + 26, y0 + chh - 12], 9, fill=GOLD + (a,))
    size = 62
    while size > 24 and d.textlength(c["w"], font=font(size, True)) > cw - 70: size -= 2
    d.text((x0 + 46, y0 + 12), c['w'], font=font(size, True), fill=(30, 40, 70, a))
    f = font(34, False); ls = wrap_text(d, c['nl'], f, cw - 70)[:2]
    for i, ln in enumerate(ls): d.text((x0 + 46, y0 + 86 + i * 41), ln, font=f, fill=(70, 70, 80, a))
    d.text((x0 + 46, y0 + chh - 62), c['en'], font=fit_font(d, c['en'], 40, cw - 70), fill=(20, 105, 160, a))
def fit_font(d, text, size, maxw):
    while size > 24 and d.textlength(text, font=font(size, True)) > maxw: size -= 2
    return font(size, True)
def sub_bar(im, it, t):
    d = ImageDraw.Draw(im, 'RGBA'); y0 = 830; d.rectangle([0, y0, W, H], fill=NAVY + (240,)); c = CH.COLOR[it['who']]
    d.text((60, y0 + 8), CH.FULL[it['who']].upper(), font=font(26, True), fill=c + (255,))
    draw_tokens(d, it, t, W / 2, y0 + 42, W - 200, (64, 58, 52, 48, 44, 40), YEL, WHITE)
def pill(d, x, y, text, f, fill, fg=(255, 255, 255), a=255):
    tw = d.textlength(text, font=f); h = f.size
    d.rounded_rectangle([x, y, x + tw + 52, y + h + 24], (h + 24) // 2, fill=fill + (a,)); d.text((x + 26, y + 12 + h / 2), text, font=f, fill=fg + (a,), anchor='lm')
def disclaimer(im, a):
    o = Image.new('RGBA', (W, H), NAVY + (int(255 * a),)); im = comp(im, o); d = ImageDraw.Draw(im, 'RGBA'); A = int(255 * a)
    d.text((W / 2, 250), 'Let op', font=font(60, True), fill=GOLD + (A,), anchor='mm')
    f = font(52); y = 360
    for ln in wrap_text(d, DISCLAIMER, f, 1500): d.text((W / 2, y), ln, font=f, fill=(255, 255, 255, A), anchor='mm'); y += 78
    return im
def credits():
    c = json.load(open(IMGD / 'credits.json')); used = {IMGMAP[n] for _, _, n in SLOTS}; seen = {}
    for f, m in c.items():
        if f in used: seen.setdefault(m['artist'][:40], m['lic'])
    return list(seen.items())
CR = None
def frame(n):
    global CR
    t = n / FPS; im = background(t).convert('RGB')
    if LEAD - 0.4 <= t < ADUR - 0.5:
        it = item_at(max(t, LEAD)); ch = chap_at(max(t, LEAD)); talk = it['start'] <= t < it['end'] + 0.05; sp = it['who']
        d = ImageDraw.Draw(im, 'RGBA')
        for y in range(690, 830, 4): d.rectangle([0, y, W, y + 4], fill=(0, 0, 0, int(90 * (y - 690) / 140)))
        cast = list(ch['cast'])
        if sp not in cast: cast.append(sp)
        for i, who in enumerate(cast): draw_bust_box(im, who, 24 + i * (BW + 12), BY, BW, BH, talk and who == sp, mouth_at(it, t) if (talk and who == sp) else 'closed', t, BH - 20)
        sub_bar(im, it, t)
        d = ImageDraw.Draw(im, 'RGBA'); age = t - (ch['start'] + 0.2)
        if 0 <= age < 4.8:
            a = int(255 * min(1, age / 0.4, (4.8 - age) / 0.5)); pill(d, 36, 32, ch['title'], font(46, True), (30, 110, 160), a=a)
        for c in CARDS:
            age = t - c['st']
            if 0 <= age < CARD_LEN: draw_card(im, c, age)
    if t < LEAD:
        if t < TITLE_T:
            a = 1.0 if t < TITLE_T - 0.6 else max(0, (TITLE_T - t) / 0.6)
            o = Image.new('RGBA', (W, H), NAVY + (int(255 * a),)); im = comp(im, o); d = ImageDraw.Draw(im, 'RGBA'); A = int(255 * a)
            d.text((W / 2, H / 2 - 170), 'Jurassic Luisteren', font=font(112, True), fill=(255, 255, 255, A), anchor='mm')
            d.text((W / 2, H / 2 - 50), f"Aflevering {META['num']} · {META['title']}", font=font(72, True), fill=GOLD + (A,), anchor='mm')
            d.text((W / 2, H / 2 + 40), f"Niveau {META.get('level','B2')}  ·  Nederlands luisteren met Ashok", font=font(44), fill=CYAN + (A,), anchor='mm')
            for i, who in enumerate(['ashok', 'hammond', 'alan', 'ellie', 'malcolm']):
                sp_ = CH.bust(who, 'closed', False, 220); lay = Image.new('RGBA', (W, H), (0, 0, 0, 0)); lay.paste(sp_, (int(W // 2 - 2.5 * 210 + i * 210 + 10), H // 2 + 120))
                la = np.array(lay.getchannel('A')); lay.putalpha(Image.fromarray((la * a).astype(np.uint8))); im = comp(im, lay)
        else:
            a = min(1, (t - TITLE_T) / 0.4, (LEAD - t) / 0.4 + 0.0); im = disclaimer(im, max(0, min(1, a)) if t > TITLE_T + 0.4 and t < LEAD - 0.4 else max(0, min(1, a)))
    te = ADUR - 0.5
    if t > te:
        if t < te + DISC_END:
            a = min(1, (t - te) / 0.5, (te + DISC_END - t) / 0.5); im = disclaimer(im, max(0, a))
        else:
            a = min(1, (t - te - DISC_END) / 0.6); A = int(255 * a); o = Image.new('RGBA', (W, H), NAVY + (A,)); im = comp(im, o); d = ImageDraw.Draw(im, 'RGBA')
            if CR is None: CR = credits()
            d.text((W / 2, 90), 'Tot de volgende keer, Ashok!', font=font(76, True), fill=(255, 255, 255, A), anchor='mm')
            d.text((W / 2, 170), f"Aflevering {META['num']} · {META['title']}", font=font(40), fill=GOLD + (A,), anchor='mm')
            d.text((W / 2, 240), 'Foto\'s: Wikimedia Commons – auteurs (licentie)', font=font(30), fill=CYAN + (A,), anchor='mm')
            nc = 4 if len(CR) > 36 else 3; per = (len(CR) + nc - 1) // nc; fs = 22 if nc == 4 else 26; cwid = W // nc
            for ci in range(nc):
                for r, (au, li) in enumerate(CR[ci * per:(ci + 1) * per]):
                    au = au if len(au) <= 24 else au[:23] + '…'; x = 40 + ci * cwid; y = 290 + r * (fs + 18)
                    d.text((x, y), au, font=font(fs), fill=(255, 255, 255, A)); d.text((x + d.textlength(au, font=font(fs)) + 8, y + 3), f'({li})', font=font(fs - 6), fill=(160, 190, 230, A))
            d.text((W / 2, 1035), 'Stemmen: Azure Neural (Dutch + multilingual)  ·  personages getekend voor dit project', font=font(26), fill=(160, 190, 230, A), anchor='mm')
    return im.convert('RGB')
def render(n): return frame(n).resize((OW, OH), Image.LANCZOS).tobytes()
if __name__ == '__main__':
    check()
    if len(sys.argv) > 2 and sys.argv[2] == 'still':
        (EP / 'qa').mkdir(exist_ok=True)
        for a in sys.argv[3:]:
            n = int(float(a[:-1]) * FPS) if a.endswith('s') else int(a); frame(n).resize((OW, OH), Image.LANCZOS).save(EP / 'qa' / f'still_{n}.png')
        sys.exit()
    N = int(DUR * FPS); t0 = time.time()
    ff = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{OW}x{OH}', '-r', str(FPS), '-i', '-',
        '-i', str(AUDIO_WAV), '-af', f'apad=pad_dur={DISC_END + CRED + 1}', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-pix_fmt', 'yuv420p',
        '-c:a', 'aac', '-b:a', '128k', '-t', f'{DUR:.3f}', str(OUT)], stdin=subprocess.PIPE)
    with Pool(int(os.environ.get("RENDER_PROCS", os.cpu_count()))) as p:
        for i, b in enumerate(p.imap(render, range(N), chunksize=8)):
            ff.stdin.write(b)
            if i % 900 == 0: print(i, N, round(time.time() - t0), 's', flush=True)
    ff.stdin.close(); ff.wait(); print('render time', round(time.time() - t0), 's')
