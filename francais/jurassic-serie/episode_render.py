#!/usr/bin/env python3
"""Episode renderer: audio/timeline.json + images -> master_720.mp4 (1280x720, 30 fps), then encode.
Run with Pillow python:  /opt/homebrew/bin/python3.13 francais/jurassic-serie/episode_render.py <episode_dir> [still <frame|seconds>s ...]
  (no extra args = full render with multiprocessing; `still 95s 300s` writes qa/still_<n>.png)  `encode` = iPhone encode + copy to iCloud.
Modes per timeline item: fr -> photo scene (FR karaoke white->yellow, EN cyan under it, cards top-right, cast busts bottom-left);
 ex+board -> green chalkboard + speaker bust (English subtitles, French in gold); ex without board -> photo + English subtitles;
 ap/aw/aa -> À toi card (prompt, 4-3-2-1 countdown ring, answer twice)."""
import json, math, subprocess, sys, os, re, time, pathlib
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from multiprocessing import Pool
SERIE = pathlib.Path(__file__).resolve().parent; EP = pathlib.Path(sys.argv[1]).resolve()
sys.path.insert(0, str(SERIE)); sys.path.insert(0, str(EP))
import characters as CH
from imgmap import IMG as IMGMAP
IMGD = EP / 'images'; TL = json.load(open(EP / 'audio' / 'timeline.json')); ITEMS = TL['items']; BOARDS = TL['boards']; META = TL['meta']
FPS = 30; W, H = 1920, 1080; OW, OH = 1280, 720; END_EXTRA = 12.0; ADUR = TL['duration']; DUR = ADUR + END_EXTRA
OUT = EP / 'master_720.mp4'
HEL = '/System/Library/Fonts/Helvetica.ttc'; CHALK = '/System/Library/Fonts/Supplemental/ChalkboardSE.ttc'
_f = {}
def font(s, b=False):
    k = ('h', s, b)
    if k not in _f: _f[k] = ImageFont.truetype(HEL, s, index=1 if b else 0)
    return _f[k]
def chalk(s):
    if ('c', s) not in _f: _f[('c', s)] = ImageFont.truetype(CHALK, s, index=2)
    return _f[('c', s)]
NAVY = (20, 24, 38); GOLD = (255, 214, 64); YEL = (255, 226, 70); CYAN = (127, 216, 255); WHITE = (255, 255, 255)
GC = {'m': (70, 130, 235), 'f': (232, 80, 96), 'x': (240, 190, 60)}
CHK = dict(s=(140, 205, 255), v=(255, 172, 72), e=(130, 232, 130), m=(140, 205, 255), f=(255, 128, 144), w=(246, 246, 240), y=(255, 230, 100))

# ------------------------------------------------------------------ timeline indexes
TIT = [i for i in ITEMS if i['kind'] != 'chapter']; CHAPS = [i for i in ITEMS if i['kind'] == 'chapter']
STARTS = [i['start'] for i in TIT]
def item_at(t):
    cur = TIT[0]
    for it in TIT:
        if it['start'] - 0.5 <= t: cur = it
        else: break
    return cur
def chap_at(t):
    cur = CHAPS[0]
    for c in CHAPS:
        if c['start'] <= t + 0.05: cur = c
    return cur
MARKS = []
for it in ITEMS:
    if it['kind'] == 'chapter' and it.get('bg'): MARKS.append((it['start'], it['bg']))
    for m in it.get('imgs', []): MARKS.append((m['t'], m['n']))
    if it['kind'] == 'ap' and it.get('img'): MARKS.append((it['start'], it['img']))
MARKS.sort(key=lambda x: x[0])
SLOTS = []
for t, n in MARKS:
    if SLOTS and SLOTS[-1][2] == n: continue
    if SLOTS and t - SLOTS[-1][0] < 0.3: SLOTS[-1] = (SLOTS[-1][0], 0, n); continue
    SLOTS.append((t, 0, n))
SLOTS = [(a, (SLOTS[k + 1][0] if k + 1 < len(SLOTS) else DUR), n) for k, (a, _, n) in enumerate(SLOTS)]
BOARD_T = {}   # board id -> list of reveal times (global group order)
for it in TIT:
    if it['kind'] == 'ex' and it.get('board'): BOARD_T.setdefault(it['board'], []).extend(it['reveals'])
def check():
    for a, b, n in SLOTS:
        if n not in IMGMAP or not (IMGD / IMGMAP[n]).exists(): print('MISSING IMAGE', n)
        vis = (b - a) - sum(max(0, min(b, i['end']) - max(a, i['start'])) for i in TIT if i['kind'] == 'ex' and i.get('board'))
        if vis > 24: print('WARN long photo hold', n, round(a), round(vis), 's')
# ------------------------------------------------------------------ photos
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
    im = photo(idx, t)
    if idx > 0:
        a = SLOTS[idx][0]
        if t < a + XF / 2:
            k = min(1, max(0, (t - (a - XF / 2)) / XF)); k = k * k * (3 - 2 * k); im = Image.blend(photo(idx - 1, t), im, k)
    return im
# ------------------------------------------------------------------ chalkboard
_bb = None
def board_bg():
    global _bb
    if _bb is None:
        rng = np.random.default_rng(5); bw, bh = 1290, 790
        yy = np.linspace(0, 1, bh)[:, None, None]; xx = np.linspace(0, 1, bw)[None, :, None]
        base = np.array([30, 74, 56], float) * (1.0 - 0.18 * ((xx - .5) ** 2 + (yy - .5) ** 2) * 2)
        noise = rng.normal(0, 4, (bh, bw, 1)); arr = np.clip(base + noise, 0, 255).astype(np.uint8)
        im = Image.fromarray(arr, 'RGB'); d = ImageDraw.Draw(im, 'RGBA')
        for _ in range(26): x = rng.integers(0, bw); y = rng.integers(0, bh); d.ellipse([x - 90, y - 30, x + 90, y + 30], fill=(255, 255, 255, 4))
        _bb = im
    return _bb
def rich(line, dflt='w'):
    segs = []; pos = 0
    for m in re.finditer(r'<(s|v|e|m|f|w|y)>(.*?)</\1>', line):
        if m.start() > pos: segs.append((line[pos:m.start()], dflt))
        segs.append((m.group(2), m.group(1))); pos = m.end()
    if pos < len(line): segs.append((line[pos:], dflt))
    return segs
def layout_board(bid):
    b = BOARDS[bid]; rows = []; g = -1
    for ln in b['lines']:
        if ln.startswith('#'): rows.append(dict(note=True, text=ln[1:].strip(), g=g))
        elif ln.startswith('+'): rows.append(dict(note=False, text=ln[1:], g=g))
        else: g += 1; rows.append(dict(note=False, text=ln, g=g))
    nm = sum(1 for r in rows if not r['note']); nn = sum(1 for r in rows if r['note'])
    avail = 790 - 40 - 150; ms = int(max(44, min(92, (avail - nn * 54 - 20) / (nm * 1.28)))); y = 160
    for r in rows:
        r['size'] = 38 if r['note'] else ms; segs = rich(r['text'], 'n' if r['note'] else 'w')
        d = ImageDraw.Draw(Image.new('RGB', (4, 4)))
        while True:
            wd = sum(d.textlength(s_, font=chalk(r['size'])) for s_, _ in segs)
            if wd <= 1160 or r['size'] <= 30: break
            r['size'] -= 2
        r['w'] = wd; r['y'] = y; r['segs'] = segs; y += int(r['size'] * (1.3 if not r['note'] else 1.45))
    off = max(0, (790 - 30 - y) // 2 - 10)
    for r in rows: r['y'] += off
    return rows
_bl = {}
def draw_board(im, bid, t):
    if bid not in _bl: _bl[bid] = layout_board(bid)
    rows = _bl[bid]; bd = board_bg().copy(); d = ImageDraw.Draw(bd, 'RGBA')
    d.text((645, 70), BOARDS[bid]['title'], font=chalk(62), fill=YEL + (255,), anchor='mm'); d.line([(160, 118), (1130, 118)], fill=(255, 255, 255, 110), width=3)
    rv = BOARD_T.get(bid, []); shown = sum(1 for x in rv if x <= t); ng = max(r['g'] for r in rows) + 1
    if shown == 0 and not rv: shown = ng
    for r in rows:
        if r['g'] >= shown or r['g'] < 0 and shown == 0: continue
        age = t - rv[r['g']] if rv else 9; a = int(255 * min(1, max(0, age / 0.5))); dim = 0.82 if (r['g'] < shown - 1) else 1.0
        x = 645 - r['w'] / 2
        for s_, c in r['segs']:
            col = (200, 205, 200) if c == 'n' else CHK[c]
            d.text((x, r['y']), s_, font=chalk(r['size']), fill=tuple(int(v * dim) for v in col) + (a,)); x += d.textlength(s_, font=chalk(r['size']))
    fr_ = Image.new('RGB', (1290 + 28, 790 + 28), (116, 78, 44)); fr_.paste(bd, (14, 14)); ImageDraw.Draw(fr_).rectangle([0, 0, 1317, 817], outline=(80, 52, 28), width=6)
    im.paste(fr_, (26, 26))
    ImageDraw.Draw(im).rounded_rectangle([160, 836 - 14, 1180, 846], 6, fill=(140, 100, 60)) if False else None
# ------------------------------------------------------------------ busts / text helpers
def comp(im, layer):
    im.paste(layer.convert('RGB'), mask=layer.getchannel('A'))
    return im
def blink_at(t, k): return ((t + k * 1.7) % 3.6) < 0.13
def mouth_at(it, t):
    m = 'closed'
    for vt, v in it['vis']:
        if vt <= t: m = CH.mouth_shape(v)
        else: break
    return m
def draw_bust_box(im, who, x, y, w, h, active, mouth, t, bh, label=True):
    d = ImageDraw.Draw(im, 'RGBA'); c = CH.COLOR[who]
    d.rounded_rectangle([x, y, x + w, y + h], 34, fill=(20, 24, 38, 165 if active else 205), outline=c + (255 if active else 90,), width=6 if active else 3)
    bob = math.sin(t * 9) * 3 if active else math.sin(t * 1.6) * 1.5
    spr = CH.bust(who, mouth if active else 'closed', blink_at(t, hash(who) % 3), bh)
    layer = Image.new('RGBA', im.size, (0, 0, 0, 0)); layer.paste(spr, (x + (w - spr.width) // 2, int(y + 14 + bob)))
    mask = Image.new('L', im.size, 0); ImageDraw.Draw(mask).rounded_rectangle([x + 2, y + 2, x + w - 2, y + h - 2], 32, fill=255)
    la = np.minimum(np.array(layer.getchannel('A')), np.array(mask))
    if not active: la = (la * 0.6).astype(np.uint8)
    layer.putalpha(Image.fromarray(la)); comp(im, layer)
    if label:
        d = ImageDraw.Draw(im, 'RGBA'); nm = CH.NAMES[who]; tw = d.textlength(nm, font=font(26, True)); nx = x + w / 2
        d.rounded_rectangle([nx - tw / 2 - 18, y + h - 44, nx + tw / 2 + 18, y + h - 8], 18, fill=c + (255 if active else 150,)); d.text((nx, y + h - 26), nm, font=font(26, True), fill=(20, 24, 38, 255), anchor='mm')
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
        if re.search(r'[.!?:]$', tk) or k == len(toks) - 1: sents.append((a, k + 1)); a = k + 1
        elif tk in ('?', '!', ':') and k > a: sents.append((a, k + 1)); a = k + 1
    a, b = [r for r in sents if r[0] <= ci < r[1]][0]; return a, b, ci
def draw_tokens(d, it, t, x_center, y_top, maxw, sizes, hi, base_col, fr_col=None, maxlines=2, hi_all=True):
    a, b, ci = sentence_window(it, t); st = it['tokens'][a:b]; lg = it['langs'][a:b]
    for fs in sizes:
        fn, fb = font(fs), font(fs, True); lines = wrap(d, st, fn, fb, maxw)
        if len(lines) <= maxlines: break
    cur = ci - a
    if len(lines) > maxlines:
        li = [i for i, ln in enumerate(lines) if cur in ln][0]; lo = min(max(0, li - 1), len(lines) - maxlines); lines = lines[lo:lo + maxlines]
    lh = int(fs * 1.18); y = y_top; sp = d.textlength(' ', font=fn)
    for ln in lines:
        wd = sum(d.textlength(st[k], font=fb if k == cur else fn) + sp for k in ln) - sp; x = x_center - wd / 2
        for k in ln:
            curw = k == cur; ff = fb if curw else fn
            col = hi if curw else ((fr_col if (fr_col and lg[k] == 'fr') else base_col))
            d.text((x, y), st[k], font=ff, fill=col + (255,)); x += d.textlength(st[k], font=ff) + sp
        y += lh
    return y, fs
def fit(d, text, size, maxw, b=True):
    while size > 28 and d.textlength(text, font=font(size, b)) > maxw: size -= 2
    return font(size, b)
def pill(d, x, y, text, f, fill, fg=(255, 255, 255), a=255):
    tw = d.textlength(text, font=f); h = f.size
    d.rounded_rectangle([x, y, x + tw + 52, y + h + 24], (h + 24) // 2, fill=fill + (a,)); d.text((x + 26, y + 12 + h / 2), text, font=f, fill=fg + (a,), anchor='lm')
CARD_LEN = 3.6
def card_sched():
    cards = sorted([(c['t'], c) for it in TIT if it['kind'] == 'fr' and not it.get('replay') for c in it['cards']], key=lambda x: x[0]); free = [0.0, 0.0]; out = []
    for t, c in cards:
        k = 0 if free[0] <= free[1] else 1; st = max(t - 0.2, free[k]); free[k] = st + CARD_LEN + 0.15; out.append(dict(c, st=st, slot=k))
    return out
CARDS = card_sched()
def draw_card(im, c, age):
    a = int(255 * min(1, age / 0.3, (CARD_LEN - age) / 0.4)); slide = int((1 - min(1, age / 0.3)) * 40)
    cw, chh = 560, 168; x0 = W - cw - 36 + slide; y0 = 36 + c['slot'] * 190; d = ImageDraw.Draw(im, 'RGBA'); col = GC.get(c['g'], GC['x'])
    d.rounded_rectangle([x0, y0, x0 + cw, y0 + chh], 24, fill=(255, 250, 235, int(a * 0.97)), outline=col + (a,), width=5)
    d.rounded_rectangle([x0 + 8, y0 + 12, x0 + 28, y0 + chh - 12], 9, fill=col + (a,))
    d.text((x0 + 52, y0 + 12), {'m': 'MASCULIN · le', 'f': 'FÉMININ · la', 'x': 'NOUVEAU'}.get(c['g'], 'NOUVEAU'), font=font(20, True), fill=col + (a,))
    d.text((x0 + 52, y0 + 40), c['w'], font=fit(d, c['w'], 62, cw - 80), fill=(30, 40, 70, a))
    d.text((x0 + 52, y0 + chh - 50), c['en'], font=fit(d, c['en'], 34, cw - 80, False), fill=(20, 105, 160, a))
# ------------------------------------------------------------------ frame
def sub_bar(im, it, t, sp):
    d = ImageDraw.Draw(im, 'RGBA'); y0 = 840; d.rectangle([0, y0, W, H], fill=NAVY + (240,)); c = CH.COLOR[sp]
    d.text((60, y0 + 10), CH.FULL[sp].upper(), font=font(22, True), fill=c + (255,))
    if it['kind'] == 'fr':
        y, fs = draw_tokens(d, it, t, W / 2, y0 + 36, W - 220, (64, 56, 50), YEL, WHITE)
        if not it.get('replay') and it.get('en'):
            f = font(40, False)
            while d.textlength(it['en'], font=f) > W - 200 and f.size > 30: f = font(f.size - 2)
            lines = [it['en']]
            if d.textlength(it['en'], font=f) > W - 200:
                w_ = it['en'].split(); h = len(w_) // 2; lines = [' '.join(w_[:h]), ' '.join(w_[h:])]
            yy = max(y + 4, y0 + 36 + 70 if y < y0 + 110 else y + 4)
            for ln in lines: d.text((W / 2, yy), ln, font=f, fill=CYAN + (255,), anchor='ma'); yy += f.size + 6
    else:
        draw_tokens(d, it, t, W / 2, y0 + 44, W - 220, (58, 52, 46), YEL, WHITE, fr_col=GOLD)
def frame(n):
    t = n / FPS; it = item_at(t); ch = chap_at(t); k = it['kind']; im = background(t).convert('RGB')
    board_mode = k == 'ex' and it.get('board'); atoi = k in ('ap', 'aw', 'aa'); sp = it.get('who')
    talk = k in ('fr', 'ex', 'ap', 'aa') and it['start'] <= t < it['end'] + 0.05
    if board_mode:
        im = Image.new('RGB', (W, H), (54, 40, 30)); draw_board(im, it['board'], t)
        d = ImageDraw.Draw(im, 'RGBA'); d.rectangle([0, 840, W, H], fill=NAVY + (255,))
        draw_bust_box(im, sp, 1360, 150, 520, 660, True, mouth_at(it, t) if talk else 'closed', t, 560)
        sub_bar(im, it, t, sp)
        age = t - ch['start']
        if 0 <= age < 3.5 and ch['title'].startswith('Pause'):
            a = int(255 * min(1, age / 0.3, (3.5 - age) / 0.5)); d = ImageDraw.Draw(im, 'RGBA'); pill(d, 1360, 40, 'PAUSE !', font(60, True), (214, 60, 60), a=a)
    elif atoi:
        ov = Image.new('RGBA', (W, H), NAVY + (190,)); im = comp(im, ov); d = ImageDraw.Draw(im, 'RGBA')
        d.rounded_rectangle([110, 70, W - 110, H - 70], 48, fill=(16, 22, 40, 235), outline=GOLD + (255,), width=6)
        pill(d, 170, 110, 'À toi !', font(56, True), (214, 150, 20), fg=(20, 24, 38))
        draw_bust_box(im, sp, W - 110 - 40 - 250, 100, 250, 300, k != 'aw', mouth_at(it, t) if talk else 'closed', t, 250, label=False)
        d = ImageDraw.Draw(im, 'RGBA'); big = k != 'aa'
        pf = font(84 if big else 56, True); lines = wrap(d, it['prompt'].split(), pf, pf, 1050); y = 240 if big else 230
        for ln in lines:
            d.text((170, y), ' '.join(it['prompt'].split()[i] for i in ln), font=pf, fill=WHITE + (255,)); y += int(pf.size * 1.18)
        if k == 'ap': d.text((170, 700), 'Écoute…  then say it in French', font=font(44), fill=GOLD + (255,))
        if k == 'aw':
            rem = it['end'] - t; num = max(1, math.ceil(rem - 1e-6)); cx, cy = W // 2, 730; r = 130
            d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(30, 40, 70, 255), outline=(255, 255, 255, 60), width=10)
            d.arc([cx - r, cy - r, cx + r, cy + r], -90, -90 + 360 * (1 - rem / 4.0), fill=GOLD + (255,), width=16)
            d.text((cx, cy - 6), str(num), font=font(170, True), fill=WHITE + (255,), anchor='mm')
            d.text((cx, 920), 'Dis-le à voix haute !', font=font(46), fill=GOLD + (255,), anchor='mm')
        if k == 'aa':
            d.text((170, 450), f"RÉPONSE  {it['n']}/2", font=font(34, True), fill=CYAN + (255,))
            draw_tokens(d, it, t, W / 2, 520, W - 400, (112, 96, 84, 72), YEL, WHITE, maxlines=3)
    else:
        d = ImageDraw.Draw(im, 'RGBA')
        for y in range(700, 840, 4): d.rectangle([0, y, W, y + 4], fill=(0, 0, 0, int(90 * (y - 700) / 140)))
        cast = list(ch['cast'])
        if sp and sp not in cast: cast = (cast + [sp])[-3:]
        for i, who in enumerate(cast): draw_bust_box(im, who, 24 + i * 262, 520, 250, 308, talk and who == sp, mouth_at(it, t) if (talk and who == sp) else 'closed', t, 250)
        sub_bar(im, it, t, sp)
        d = ImageDraw.Draw(im, 'RGBA'); age = t - (ch['start'] + 0.2)
        if 0 <= age < 4.8:
            a = int(255 * min(1, age / 0.4, (4.8 - age) / 0.5)); pill(d, 36, 32, ch['title'], font(46, True), (214, 90, 40) if ch['replay'] else (30, 110, 160), a=a)
        for c in CARDS:
            age = t - c['st']
            if 0 <= age < CARD_LEN: draw_card(im, c, age)
    if t < 4.0:
        a = 1.0 if t < 3.0 else max(0, 1 - (t - 3.0))
        o = Image.new('RGBA', (W, H), NAVY + (int(215 * a),)); im = comp(im, o); d = ImageDraw.Draw(im, 'RGBA'); A = int(255 * a)
        d.text((W / 2, H / 2 - 150), 'Français Jurassique', font=font(110, True), fill=(255, 255, 255, A), anchor='mm')
        d.text((W / 2, H / 2 - 30), f"Épisode {META['num']} · {META['title']}", font=font(70, True), fill=GOLD + (A,), anchor='mm')
        d.text((W / 2, H / 2 + 60), f"Niveau {META['level']}  ·  français pour Ashok", font=font(44), fill=CYAN + (A,), anchor='mm')
        for i, who in enumerate(['ellie', 'alan', 'malcolm', 'hammond', 'owen', 'claire']):
            sp_ = CH.bust(who, 'closed', False, 200); lay = Image.new('RGBA', (W, H), (0, 0, 0, 0)); lay.paste(sp_, (W // 2 - 3 * 190 + i * 190, H // 2 + 130))
            la = np.array(lay.getchannel('A')); lay.putalpha(Image.fromarray((la * a).astype(np.uint8))); im = comp(im, lay)
        d = ImageDraw.Draw(im, 'RGBA')
    te = ADUR - 0.5
    if t > te:
        a = min(1, (t - te) / 0.9); A = int(255 * a); o = Image.new('RGBA', (W, H), NAVY + (A,)); im = comp(im, o); d = ImageDraw.Draw(im, 'RGBA')
        d.text((W / 2, 110), 'À bientôt, Ashok !', font=font(84, True), fill=(255, 255, 255, A), anchor='mm')
        d.text((W / 2, 200), f"Épisode {META['num']} · {META['title']}  ·  Prochain épisode : Les dinosaures", font=font(40), fill=GOLD + (A,), anchor='mm')
        d.text((W / 2, 280), "Photos : Wikimedia Commons – auteurs (licence)", font=font(32), fill=CYAN + (A,), anchor='mm')
        cr = credits(); nc = 3; per = (len(cr) + nc - 1) // nc
        for ci in range(nc):
            for r, (au, li) in enumerate(cr[ci * per:(ci + 1) * per]):
                au = au if len(au) <= 30 else au[:29] + '…'; x = 60 + ci * 620; y = 330 + r * 44
                d.text((x, y), au, font=font(26), fill=(255, 255, 255, A)); d.text((x + d.textlength(au, font=font(26)) + 10, y + 3), f'({li})', font=font(20), fill=(160, 190, 230, A))
        d.text((W / 2, 1030), 'Voix : Azure fr-FR (Vivienne, Rémy, Lucien, Maurice)  ·  personnages dessinés pour ce projet', font=font(26), fill=(160, 190, 230, A), anchor='mm')
    return im.convert('RGB')
_CR = None
def credits():
    global _CR
    if _CR is None:
        c = json.load(open(IMGD / 'credits.json')); used = {IMGMAP[n] for _, _, n in SLOTS}; seen = {}
        for f, m in c.items():
            if f in used: seen.setdefault(m['artist'], m['lic'])
        _CR = list(seen.items())
    return _CR
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
        '-i', str(EP / 'audio' / 'narration.wav'), '-af', f'apad=pad_dur={END_EXTRA + 1}', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-pix_fmt', 'yuv420p',
        '-c:a', 'aac', '-b:a', '128k', '-t', f'{DUR:.3f}', str(OUT)], stdin=subprocess.PIPE)
    with Pool(os.cpu_count()) as p:
        for i, b in enumerate(p.imap(render, range(N), chunksize=8)):
            ff.stdin.write(b)
            if i % 900 == 0: print(i, N, round(time.time() - t0), 's', flush=True)
    ff.stdin.close(); ff.wait(); print('render time', round(time.time() - t0), 's')
