"""The 6 flat cartoon busts of « Français Jurassique » (our own designs, not actor look-alikes).
Pillow only.  bust(name, mouth, blink, height) -> RGBA image (head + shoulders).
names: ellie alan malcolm hammond owen claire.  mouths: closed wide mid open round fv (from Azure viseme ids, see mouth_shape)."""
import math
from PIL import Image, ImageDraw

NAMES = {'ellie': 'ELLIE', 'alan': 'ALAN', 'malcolm': 'IAN', 'hammond': 'JOHN', 'owen': 'OWEN', 'claire': 'CLAIRE'}
FULL = {'ellie': 'Ellie Sattler', 'alan': 'Alan Grant', 'malcolm': 'Ian Malcolm', 'hammond': 'John Hammond', 'owen': 'Owen Grady', 'claire': 'Claire Dearing'}
COLOR = {'ellie': (255, 150, 140), 'alan': (110, 190, 255), 'malcolm': (190, 160, 255), 'hammond': (250, 222, 120), 'owen': (130, 215, 125), 'claire': (255, 105, 105)}
from voices import VOICE, MULTILINGUAL

def mouth_shape(i):
    """Azure viseme id -> mouth drawing."""
    if i in (0, 21): return 'closed'
    if i == 18: return 'fv'
    if i in (2, 9, 11, 1): return 'open'
    if i in (3, 4, 5): return 'mid'
    if i in (7, 8, 10): return 'round'
    return 'wide'

S2 = 2; CW, CH = 480, 560; CX, CY = 240, 210
LOOK = dict(
    ellie=dict(skin=(244, 208, 178), hair=(232, 196, 96), brow=(190, 150, 70), shirt=(242, 138, 124), collar=(214, 108, 98)),
    alan=dict(skin=(214, 168, 130), hair=(96, 66, 44), brow=(80, 55, 38), shirt=(58, 108, 190), collar=(40, 82, 152)),
    malcolm=dict(skin=(226, 184, 154), hair=(26, 22, 24), brow=(26, 22, 24), shirt=(32, 32, 38), collar=(60, 60, 70)),
    hammond=dict(skin=(238, 198, 172), hair=(242, 242, 242), brow=(220, 220, 220), shirt=(246, 246, 240), collar=(205, 205, 200)),
    owen=dict(skin=(212, 168, 134), hair=(92, 64, 42), brow=(80, 56, 38), shirt=(198, 178, 138), collar=(170, 150, 112)),
    claire=dict(skin=(244, 212, 188), hair=(190, 52, 42), brow=(150, 40, 34), shirt=(248, 248, 250), collar=(214, 214, 222)),
)

def raw(who, mouth, blink):
    L = LOOK[who]; s = S2; skin, hair = L['skin'], L['hair']
    im = Image.new('RGBA', (CW * s, CH * s), (0, 0, 0, 0)); d = ImageDraw.Draw(im); cx, cy = CX, CY
    def E(x0, y0, x1, y1, **k): d.ellipse([x0 * s, y0 * s, x1 * s, y1 * s], **k)
    def R(x0, y0, x1, y1, r=0, **k): d.rounded_rectangle([x0 * s, y0 * s, x1 * s, y1 * s], r * s, **k)
    def P(pts, **k): d.polygon([(x * s, y * s) for x, y in pts], **k)
    # ---- hair behind
    if who == 'ellie':
        E(cx + 70, cy - 130, cx + 190, cy + 90, fill=hair); R(cx - 118, cy - 110, cx + 118, cy + 40, 60, fill=hair)
    if who == 'claire': R(cx - 132, cy - 125, cx + 132, cy + 100, 70, fill=hair)
    # ---- body
    R(cx - 190, cy + 130, cx + 190, cy + 760, 90, fill=L['shirt'])
    if who == 'owen':
        R(cx - 190, cy + 130, cx + 190, cy + 760, 90, fill=L['shirt'])
        P([(cx - 190, cy + 230), (cx - 70, cy + 150), (cx - 22, cy + 560), (cx - 190, cy + 560)], fill=(106, 120, 66)); P([(cx + 190, cy + 230), (cx + 70, cy + 150), (cx + 22, cy + 560), (cx + 190, cy + 560)], fill=(106, 120, 66))
        R(cx - 150, cy + 300, cx - 80, cy + 350, 8, outline=(80, 92, 48), width=4); R(cx + 80, cy + 300, cx + 150, cy + 350, 8, outline=(80, 92, 48), width=4)
    if who == 'malcolm':
        P([(cx - 190, cy + 220), (cx - 60, cy + 150), (cx - 30, cy + 560), (cx - 190, cy + 560)], fill=(18, 18, 22)); P([(cx + 190, cy + 220), (cx + 60, cy + 150), (cx + 30, cy + 560), (cx + 190, cy + 560)], fill=(18, 18, 22))
    if who == 'hammond':
        P([(cx - 190, cy + 220), (cx - 60, cy + 150), (cx - 25, cy + 560), (cx - 190, cy + 560)], fill=(232, 232, 226)); P([(cx + 190, cy + 220), (cx + 60, cy + 150), (cx + 25, cy + 560), (cx + 190, cy + 560)], fill=(232, 232, 226))
    # neck + collar
    R(cx - 38, cy + 70, cx + 38, cy + 150, 20, fill=skin)
    P([(cx - 62, cy + 128), (cx + 62, cy + 128), (cx, cy + 210)], fill=skin)
    P([(cx - 70, cy + 126), (cx - 8, cy + 215), (cx - 100, cy + 235)], fill=L['collar']); P([(cx + 70, cy + 126), (cx + 8, cy + 215), (cx + 100, cy + 235)], fill=L['collar'])
    if who == 'hammond': P([(cx - 12, cy + 190), (cx + 12, cy + 190), (cx + 18, cy + 330), (cx, cy + 350), (cx - 18, cy + 330)], fill=(60, 90, 150))
    if who == 'claire': E(cx - 40, cy + 150, cx + 40, cy + 235, outline=(230, 200, 120), width=4)
    # ears, head
    E(cx - 122, cy - 15, cx - 92, cy + 35, fill=skin); E(cx + 92, cy - 15, cx + 122, cy + 35, fill=skin)
    E(cx - 108, cy - 120, cx + 108, cy + 112, fill=skin)
    # beards
    if who == 'alan':
        d.pieslice([(cx - 110) * s, (cy - 10) * s, (cx + 110) * s, (cy + 135) * s], 0, 180, fill=hair)
        E(cx - 70, cy + 30, cx + 70, cy + 70, fill=skin)       # face opening above mouth
        E(cx - 34, cy + 52, cx + 34, cy + 100, fill=hair)
    if who == 'hammond':
        d.pieslice([(cx - 110) * s, (cy - 10) * s, (cx + 110) * s, (cy + 140) * s], 0, 180, fill=(246, 246, 246))
        E(cx - 66, cy + 30, cx + 66, cy + 66, fill=skin); E(cx - 36, cy + 50, cx + 36, cy + 98, fill=(246, 246, 246))
    if who == 'owen': d.pieslice([(cx - 104) * s, (cy + 10) * s, (cx + 104) * s, (cy + 128) * s], 0, 180, fill=(150, 112, 86, 120))
    # ---- hair front
    if who == 'ellie':
        d.pieslice([(cx - 116) * s, (cy - 138) * s, (cx + 116) * s, (cy + 58) * s], 180, 360, fill=hair)
        P([(cx - 116, cy - 40), (cx - 50, cy - 100), (cx + 20, cy - 112), (cx - 80, cy - 10)], fill=hair)
        E(cx + 112, cy - 92, cx + 142, cy - 62, fill=(230, 90, 120))
    elif who == 'alan':
        pass
    elif who == 'malcolm':
        for k in range(11):
            a = math.radians(188 + k * 16.4); x = cx + 108 * math.cos(a); y = cy - 18 + 112 * math.sin(a); E(x - 26, y - 26, x + 26, y + 26, fill=hair)
        E(cx - 80, cy - 150, cx + 80, cy - 60, fill=hair)
    elif who == 'hammond':
        d.pieslice([(cx - 112) * s, (cy - 134) * s, (cx + 112) * s, (cy + 20) * s], 180, 360, fill=hair); R(cx - 116, cy - 70, cx - 96, cy - 5, 8, fill=hair); R(cx + 96, cy - 70, cx + 116, cy - 5, 8, fill=hair)
    elif who == 'owen':
        d.pieslice([(cx - 112) * s, (cy - 136) * s, (cx + 112) * s, (cy + 10) * s], 180, 360, fill=hair)
    elif who == 'claire':
        d.pieslice([(cx - 120) * s, (cy - 140) * s, (cx + 120) * s, (cy + 50) * s], 180, 360, fill=hair)
        P([(cx - 120, cy - 60), (cx + 30, cy - 125), (cx + 120, cy - 60), (cx + 118, cy - 10), (cx + 40, cy - 70), (cx - 120, cy - 20)], fill=hair)
        R(cx - 126, cy - 66, cx - 100, cy + 70, 10, fill=hair); R(cx + 100, cy - 66, cx + 126, cy + 70, 10, fill=hair)
    # cheeks
    E(cx - 84, cy + 28, cx - 48, cy + 52, fill=(238, 160, 140, 190)); E(cx + 48, cy + 28, cx + 84, cy + 52, fill=(238, 160, 140, 190))
    # eyes
    if who == 'malcolm':
        R(cx - 78, cy - 30, cx - 8, cy + 10, 12, fill=(14, 14, 18)); R(cx + 8, cy - 30, cx + 78, cy + 10, 12, fill=(14, 14, 18)); R(cx - 10, cy - 24, cx + 10, cy - 16, 3, fill=(14, 14, 18))
        P([(cx - 66, cy - 24), (cx - 46, cy - 24), (cx - 62, cy - 8)], fill=(70, 80, 100)); P([(cx + 20, cy - 24), (cx + 40, cy - 24), (cx + 24, cy - 8)], fill=(70, 80, 100))
    else:
        for ex in (-42, 42):
            x = cx + ex
            if blink: R(x - 17, cy - 8, x + 17, cy - 2, 3, fill=(60, 40, 35))
            else:
                E(x - 19, cy - 26, x + 19, cy + 10, fill=(255, 255, 255)); E(x - 9, cy - 20, x + 9, cy + 3, fill=(55, 35, 28)); E(x - 4, cy - 17, x + 1, cy - 11, fill=(255, 255, 255))
            R(x - 22, cy - 44, x + 22, cy - 38, 3, fill=L['brow'])
    d.arc([(cx - 9) * s, (cy + 6) * s, (cx + 15) * s, (cy + 38) * s], 20, 160, fill=(200, 140, 110), width=5)
    # hat (Alan) over everything on the head
    if who == 'alan':
        d.pieslice([(cx - 104) * s, (cy - 170) * s, (cx + 104) * s, (cy - 40) * s], 180, 360, fill=(158, 116, 62))
        R(cx - 104, cy - 82, cx + 104, cy - 66, 4, fill=(90, 64, 36))
        E(cx - 172, cy - 92, cx + 172, cy - 44, fill=(140, 100, 52)); E(cx - 160, cy - 90, cx + 160, cy - 58, fill=(170, 128, 72))
    # mouth
    mx, my = cx, cy + 68; lip = (170, 70, 70) if who in ('alan', 'owen', 'malcolm') else (205, 80, 95); dark = (90, 25, 35)
    if who in ('alan', 'hammond'): lip = (235, 175, 160)
    if mouth == 'closed': d.arc([(mx - 22) * s, (my - 12) * s, (mx + 22) * s, (my + 10) * s], 10, 170, fill=lip, width=6)
    elif mouth == 'wide': E(mx - 26, my - 8, mx + 26, my + 10, fill=dark); R(mx - 22, my - 8, mx + 22, my - 1, 3, fill=(255, 255, 255))
    elif mouth == 'mid': E(mx - 22, my - 12, mx + 22, my + 20, fill=dark); E(mx - 12, my + 8, mx + 12, my + 22, fill=(200, 95, 95))
    elif mouth == 'open': E(mx - 28, my - 14, mx + 28, my + 34, fill=dark); E(mx - 15, my + 16, mx + 15, my + 36, fill=(205, 100, 100)); R(mx - 22, my - 13, mx + 22, my - 4, 3, fill=(255, 255, 255))
    elif mouth == 'round': E(mx - 14, my - 14, mx + 14, my + 22, fill=dark); E(mx - 14, my - 14, mx + 14, my + 22, outline=lip, width=5)
    elif mouth == 'fv': E(mx - 24, my - 8, mx + 24, my + 10, fill=dark); R(mx - 20, my - 8, mx + 20, my - 1, 3, fill=(255, 255, 255)); R(mx - 20, my + 1, mx + 20, my + 9, 4, fill=lip)
    if who == 'hammond':  # cane (gold hook, dark shaft) at the right shoulder
        R(cx + 150, cy + 300, cx + 166, cy + 560, 6, fill=(70, 46, 30)); d.arc([(cx + 120) * s, (cy + 262) * s, (cx + 170) * s, (cy + 316) * s], 180, 360, fill=(230, 180, 60), width=14)
    return im
_c = {}
def bust(who, mouth='closed', blink=False, height=300):
    k = (who, mouth, bool(blink), height)
    if k not in _c: _c[k] = raw(who, mouth, bool(blink)).resize((int(CW * height / CH), height), Image.LANCZOS)
    return _c[k]
if __name__ == '__main__':
    import sys
    names = list(NAMES); sheet = Image.new('RGB', (len(names) * 300, 330), (40, 50, 70))
    for i, n in enumerate(names): b = bust(n, 'mid', False, 320); sheet.paste(b, (i * 300, 5), b)
    sheet.save(sys.argv[1] if len(sys.argv) > 1 else 'characters_sheet.png')
