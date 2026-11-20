# -*- coding: utf-8 -*-
"""Shared helpers + stylesheet for Ashok's French revision books (EN + தமிழ்)."""
import base64, os, html as _h

IMG_DIR = os.path.join(os.path.dirname(__file__), '..', 'img')

def b64(name):
    p = os.path.join(IMG_DIR, name)
    ext = 'jpeg' if name.endswith('jpeg') else 'png'
    with open(p, 'rb') as f:
        return 'data:image/%s;base64,%s' % (ext, base64.b64encode(f.read()).decode())

CSS = """
:root{
  --ink:#17202b; --muted:#5d6b7a; --brand:#12386e; --accent:#b32131;
  --gold:#8a5a00; --line:#d5dce4; --soft:#f2f6fa; --chip:#eaf0f7;
  --rule-bg:#f5f9fd; --rule-edge:#12386e;
  --key-bg:#f4f7f2; --key-edge:#2c6b3f;
  --do-bg:#fffaf0; --do-edge:#b8860b;
  --warn-bg:#fdf2f2; --warn-edge:#b32131;
  --write:#c6d2de;
}
*{box-sizing:border-box;margin:0;padding:0}
html,body{background:#fff}
body{font-family:"Helvetica Neue",Arial,"Noto Sans","Noto Sans Tamil","Tamil MN","InaiMathi","Latha",sans-serif;
  color:var(--ink);font-size:9.1pt;line-height:1.36}
.page{max-width:194mm;margin:0 auto;padding:6mm 4mm}
@media print{
  @page{size:A4;margin:9mm 8mm}
  .page{max-width:none;padding:0}
  .card,.rule,.key,.fig,.masthead,.tip,.warn,.dialog,.plan,.conj,.txt{break-inside:avoid}
  tr,.numline,.qline,.figrow,.toc .r,.plan .d,h2.section,h3,h4,.sepbox,.sepline,
  .trace .row,.dialog .ln,.wl .l{break-inside:avoid}
  .trace .t,.drill .h{break-after:avoid}
  thead{display:table-header-group}
  .pb{break-before:page}
  h2.section{break-after:avoid}
  h3{break-after:avoid}
}
/* ---------- masthead ---------- */
.masthead{border-bottom:3px solid var(--brand);padding-bottom:5mm;margin-bottom:5mm}
.kicker{color:var(--accent);font-weight:700;letter-spacing:.09em;font-size:8.2pt;text-transform:uppercase}
.masthead h1{font-size:20pt;line-height:1.18;margin-top:2mm;color:var(--brand)}
.masthead h1 .ta{display:block;font-size:12.5pt;color:var(--muted);font-weight:600;margin-top:1.5mm}
.masthead .meta{color:var(--muted);font-size:9pt;margin-top:3mm;line-height:1.45}
.flagbar{height:4px;display:flex;margin-bottom:3mm}
.flagbar i{flex:1}
.flagbar i:nth-child(1){background:#12386e}
.flagbar i:nth-child(2){background:#e9edf2}
.flagbar i:nth-child(3){background:#b32131}
/* ---------- structure ---------- */
h2.section{font-size:12pt;color:var(--brand);background:#e8eff7;border-radius:4px;
  border-left:1.4mm solid var(--brand);border-bottom:.5mm solid #c3d5e8;
  padding:1.4mm 2.6mm;margin:5mm 0 2.6mm;line-height:1.25}
h2.section .ta{display:block;color:#4c6a8c;font-weight:600;font-size:10pt;margin-top:.4mm}
h2.section .num{background:var(--brand);color:#fff;border-radius:3px;padding:0 5px;margin-right:5px;font-size:10.5pt}
h3{font-size:10.2pt;color:var(--brand);margin:3.2mm 0 1.7mm;border-bottom:1px solid var(--line);padding-bottom:.8mm}
h3 .ta{color:var(--muted);font-weight:600;font-size:9.8pt}
h4{font-size:9.8pt;color:var(--accent);margin:2.8mm 0 1.4mm}
h4 .ta{color:var(--muted);font-weight:600;font-size:9.2pt}
p{margin-bottom:1.4mm}
.lang-tag{display:inline-block;background:var(--chip);color:var(--brand);border-radius:3px;font-size:7.2pt;
  font-weight:700;padding:1px 6px;margin-bottom:1.2mm;letter-spacing:.05em}
.duo{display:flex;gap:5mm;margin-bottom:2.5mm}
.duo>div{flex:1;min-width:0}
.ta-col{color:#33414d}
.grid{display:flex;gap:4mm;margin-bottom:3mm}
.grid>div{flex:1;min-width:0}
/* ---------- boxes ---------- */
.card{border:1px solid var(--line);border-radius:8px;padding:4mm;margin-bottom:4mm;background:#fff}
.rule{background:var(--rule-bg);border:1px solid #cddcee;border-left:5px solid var(--rule-edge);
  border-radius:6px;padding:2.4mm 3mm;margin:2.4mm 0}
.rule .h{font-size:9.2pt;font-weight:800;color:var(--brand);margin-bottom:1.5mm;text-transform:uppercase;letter-spacing:.04em}
.rule .h .ta{color:#4b6a8e;font-weight:700;text-transform:none;letter-spacing:0}
.tip{background:var(--do-bg);border:1px solid #eeddb0;border-left:5px solid var(--do-edge);
  border-radius:6px;padding:2.4mm 3mm;margin:2.4mm 0}
.tip .h{font-size:9.2pt;font-weight:800;color:var(--gold);margin-bottom:1.2mm}
.warn{background:var(--warn-bg);border:1px solid #f0cdcd;border-left:5px solid var(--warn-edge);
  border-radius:6px;padding:2.4mm 3mm;margin:2.4mm 0}
.warn .h{font-size:9.2pt;font-weight:800;color:var(--accent);margin-bottom:1.2mm}
.key{background:var(--key-bg);border:1px solid #cfe0d4;border-left:5px solid var(--key-edge);
  border-radius:6px;padding:2.4mm 3mm;margin:2.4mm 0;font-size:8.8pt}
.key .h{font-size:9pt;font-weight:800;color:var(--key-edge);margin-bottom:1.2mm}
.drill{background:#fff;border:1.5px dashed #b9c6d4;border-radius:7px;padding:2.8mm;margin:2.4mm 0}
.drill .h{font-size:9.4pt;font-weight:800;color:var(--brand);margin-bottom:2mm;line-height:1.35}
.drill .h:before{content:"✎ ";font-size:11pt;color:var(--accent)}
.drill .h .ta{color:var(--muted);font-weight:700;font-size:8.8pt}
/* ---------- french text ---------- */
.fr{color:var(--brand);font-weight:700}
.fr-i{color:var(--brand);font-weight:700;font-style:italic}
.en{color:var(--ink)}
.ta{color:var(--muted)}
.gloss{color:var(--muted);font-size:9pt}
.txt{background:var(--soft);border-radius:6px;padding:2.2mm 2.6mm;margin:1.8mm 0;
  font-size:9.4pt;line-height:1.45;border:1px solid #e2e9f1}
.txt b{color:var(--brand)}
.src{font-size:8pt;color:var(--muted);margin-top:1.5mm;word-break:break-all}
.src a{color:var(--muted)}
/* ---------- tables ---------- */
.tblwrap{margin:2.5mm 0}
table{width:100%;border-collapse:collapse;font-size:8.3pt}
th{background:#e8eff7;color:var(--brand);text-align:left;padding:.8mm 1.3mm .9mm;font-size:7.8pt;
  font-weight:800;letter-spacing:.03em;border-bottom:.6mm solid var(--brand)}
th .ta{color:#4c6a8c;font-weight:600;display:block;font-size:7.4pt}
td{border:1px solid var(--line);padding:.85mm 1.3mm;vertical-align:top}
tr:nth-child(even) td{background:#fbfcfd}
td.fr{color:var(--brand);font-weight:700;white-space:nowrap}
td.w,tr:nth-child(even) td.w{min-width:30mm;padding:1mm 1.3mm .6mm;background:#fff}
td.w .ln{border-bottom:0.3mm solid var(--write);height:5.8mm}
.mini td,.mini th{font-size:7.8pt;padding:.6mm 1.1mm}
table.gl td{font-size:7.7pt;padding:.5mm 1mm}
table.gl td.fr{white-space:normal}
/* conjugation block */
.conj{display:inline-block;border:1px solid var(--line);border-radius:6px;padding:1.6mm 2.4mm;margin:0 2.4mm 2mm 0;
  background:#fbfdff;vertical-align:top;min-width:44mm}
.conj .t{font-weight:800;color:var(--accent);font-size:9.6pt;margin-bottom:1mm;border-bottom:1px solid var(--line);padding-bottom:.8mm}
.conj .t .ta{color:var(--muted);font-weight:600;font-size:8.4pt}
.conj div.l{font-size:9.1pt;line-height:1.5}
.conj div.l b{color:var(--brand)}
/* ---------- writing lines ---------- */
.wl{margin:2mm 0}
.wl .l{border-bottom:1px solid var(--write);height:6.3mm}
.wl.tight .l{height:6mm}
.wl.wide .l{height:8.5mm}
.numline{margin-bottom:1.2mm}
.numline .n{font-weight:800;color:var(--accent);font-size:9.2pt;margin-right:1.5mm}
.numline .q{font-size:9.4pt;display:inline}
.numline .q .ta{color:var(--muted);font-size:8.4pt}
.numline .b{border-bottom:1px solid var(--write);height:6.2mm;margin-top:.4mm}
.qline{margin-bottom:1.5mm}
.qline .q{font-size:9.4pt}
.qline .q b{color:var(--brand)}
.qline .q .ta{display:block;color:var(--muted);font-size:8.5pt}
.qline .b{border-bottom:1px solid var(--write);height:6.2mm;margin-top:.6mm}
/* trace boxes */
.trace{border:1px solid var(--line);border-radius:6px;padding:2.5mm 3mm;margin:2.5mm 0;background:#fcfdff}
.trace .t{font-size:8.2pt;font-weight:800;color:var(--brand);text-transform:uppercase;letter-spacing:.04em;margin-bottom:1.5mm}
.trace .row{display:flex;align-items:baseline;gap:3mm;padding:.9mm 0;border-bottom:1px dotted #dfe6ee}
.trace .row:last-child{border-bottom:0}
.trace .row .m{color:var(--brand);font-weight:700;font-size:10pt;min-width:38mm}
.trace .row .g{color:#b9c6d4;font-size:10pt;font-weight:700;letter-spacing:.02em}
.trace .row .s{flex:1;border-bottom:1px solid var(--write);height:5mm}
/* ---------- figures ---------- */
.fig{border:1px solid var(--line);border-radius:8px;padding:1.8mm;margin:2mm 0;background:#fff;text-align:center}
.fig img{max-width:100%;border-radius:5px;border:1px solid #e6ecf3}
.fig .cap{margin-top:2mm;font-size:8.6pt;color:var(--muted);text-align:left;line-height:1.45}
.fig .cap b{color:var(--brand)}
.fig .cap .ta{display:block;color:var(--muted)}
.fig .tagline{font-size:7.4pt;font-weight:800;color:var(--accent);text-transform:uppercase;
  letter-spacing:.06em;text-align:left;margin-bottom:1.5mm}
.figrow{display:flex;gap:3mm;margin:3mm 0}
.figrow .fig{flex:1;margin:0;min-width:0}
.figbig img{max-width:94mm}
.figsm img{max-width:50mm}
.figwide img{max-width:100%}
/* ---------- chips / misc ---------- */
.chip{display:inline-block;border:1px solid #c3d2e2;background:#fff;border-radius:20px;
  font-size:8.4pt;padding:1px 8px;margin:1.5px 3px 1.5px 0;color:var(--brand);font-weight:600}
.chip.r{border-color:#eec3c3;color:var(--accent)}
.chip.g{border-color:#c6ddc9;color:#2c6b3f}
ul,ol{margin:1.5mm 0 2mm 5mm}
li{margin-bottom:1.2mm}
li .ta{display:block;color:var(--muted);font-size:8.8pt}
.dialog{background:#fbfdff;border:1px solid var(--line);border-radius:7px;padding:3mm;margin:2.5mm 0}
.dialog .ln{padding:.8mm 0;border-bottom:1px dotted #e3e9f0;font-size:9.1pt}
.dialog .ln:last-child{border-bottom:0}
.dialog .sp{font-weight:800;color:var(--accent);min-width:14mm;display:inline-block}
.dialog .ta{display:block;color:var(--muted);font-size:8.5pt;margin-left:14mm}
.toc{border:1px solid var(--line);border-radius:8px;padding:4mm;background:#fbfdff}
.toc .r{display:flex;gap:3mm;padding:1.4mm 0;border-bottom:1px dotted #e3e9f0;font-size:9.4pt}
.toc .r:last-child{border-bottom:0}
.toc .r .n{font-weight:800;color:var(--accent);min-width:8mm}
.toc .r .t{flex:1}
.toc .r .t .ta{display:block;color:var(--muted);font-size:8.5pt}
.foot{margin-top:7mm;border-top:2px solid var(--brand);padding-top:2.5mm;color:var(--muted);font-size:8pt}
.plan{border:1px solid var(--line);border-radius:8px;overflow:hidden;margin:3mm 0}
.plan .d{display:flex;border-bottom:1px solid var(--line)}
.plan .d:last-child{border-bottom:0}
.plan .d>.day{background:#e8eff7;color:var(--brand);font-weight:800;font-size:8.8pt;padding:2mm;border-right:.7mm solid var(--brand);
  min-width:26mm;display:flex;flex-direction:column;justify-content:center}
.plan .d>.day .sub{font-weight:600;font-size:7.6pt;color:var(--muted)}
.plan .d>.body{padding:2mm 3mm;font-size:9pt;flex:1}
.plan .d>.body .ta{display:block;color:var(--muted);font-size:8.3pt;margin-top:.4mm}
.plan .d:nth-child(even)>.body{background:#fafcfe}
.badge{display:inline-block;background:#fbeaec;color:var(--accent);border:.6pt solid #e6b9bf;border-radius:4px;
  font-size:7.6pt;font-weight:800;padding:0 5px;letter-spacing:.04em;text-transform:uppercase}
.badge.b{background:#e8eff7;color:var(--brand);border-color:#bcd0e6}
.badge.g{background:#eaf4ed;color:#2c6b3f;border-color:#bfdcc7}
.sepbox{border:3px solid var(--accent);border-radius:10px;padding:5mm 5.5mm;margin:0 0 6mm;background:#fdf4f4}
.sepbox .t{font-size:13pt;font-weight:800;color:var(--accent);letter-spacing:.02em;margin-bottom:1mm}
.sepbox .t .ta{display:block;font-size:10.5pt;color:#8d4a52;font-weight:700;margin-top:.8mm}
.sepbox .b{font-size:9.6pt;margin-top:2.5mm}
.sepbox .b .ta-col{color:#4a3a3c}
.sepline{border-top:3px double var(--accent);margin:6mm 0 4mm;padding-top:2.5mm;
  font-size:9.4pt;color:var(--accent);font-weight:700;text-align:center}
.sepline .ta{display:block;color:var(--muted);font-weight:600;font-size:8.8pt;margin-top:.6mm}
"""

def head(title, subtitle_ta, comment=''):
    return """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>%s</title>
<!-- %s -->
<style>%s</style>
</head>
<body>
<div class="page">
""" % (_h.escape(title), comment, CSS)

FOOT_TPL = """
  <div class="foot">%s</div>
</div>
</body>
</html>
"""

# ---------------- helpers ----------------
def duo(en, ta, tag_en='ENGLISH', tag_ta='தமிழ்'):
    return ('<div class="duo"><div><span class="lang-tag">%s</span><div>%s</div></div>'
            '<div><span class="lang-tag">%s</span><div class="ta-col">%s</div></div></div>' % (tag_en, en, tag_ta, ta))

def sec(num, en, ta):
    return '<h2 class="section"><span class="num">%s</span>%s<span class="ta">%s</span></h2>' % (num, en, ta)

def h3(en, ta):
    return '<h3>%s <span class="ta">· %s</span></h3>' % (en, ta)

def h4(en, ta):
    return '<h4>%s <span class="ta">· %s</span></h4>' % (en, ta)

def rule(title_en, title_ta, body):
    return '<div class="rule"><div class="h">%s <span class="ta">· %s</span></div>%s</div>' % (title_en, title_ta, body)

def tip(title, body, body2=None):
    if body2 is not None:
        title = '%s <span class="ta">· %s</span>' % (title, body); body = body2
    return '<div class="tip"><div class="h">%s</div>%s</div>' % (title, body)

def warn(title, body, body2=None):
    if body2 is not None:
        title = '%s <span class="ta">· %s</span>' % (title, body); body = body2
    return '<div class="warn"><div class="h">%s</div>%s</div>' % (title, body)

def key(body, title='Answer key · விடைகள்'):
    return '<div class="key"><div class="h">%s</div>%s</div>' % (title, body)

def drill(title_en, title_ta, body):
    return '<div class="drill"><div class="h">%s <span class="ta">· %s</span></div>%s</div>' % (title_en, title_ta, body)

def txt(body, src=''):
    s = '<div class="src">%s</div>' % src if src else ''
    return '<div class="txt">%s%s</div>' % (body, s)

def vocab(rows, headers=('French · பிரெஞ்சு', 'English', 'தமிழ்'), write=True, mini=False):
    """rows: list of (fr, en, ta) — adds a 'write it 2×' ruled column."""
    th = ''.join('<th>%s</th>' % x for x in headers)
    if write:
        th += '<th>Write it <span class="ta">எழுதுங்கள்</span></th>'
    body = ''
    for r in rows:
        cells = '<td class="fr">%s</td>' % r[0]
        cells += ''.join('<td>%s</td>' % c for c in r[1:])
        if write:
            cells += '<td class="w"><div class="ln"></div></td>'
        body += '<tr>%s</tr>' % cells
    cls = 'mini' if mini else ''
    return ('<div class="tblwrap"><table class="%s"><thead><tr>%s</tr></thead><tbody>%s</tbody></table></div>'
            % (cls, th, body))

def vocab2up(rows):
    """Reference glossary, two entries per printed row, no writing column."""
    th = ('<th>French</th><th>English</th><th>தமிழ்</th>'
          '<th>French</th><th>English</th><th>தமிழ்</th>')
    body = ''
    half = (len(rows) + 1) // 2
    for l, r in zip(rows[:half], rows[half:] + [('', '', '')] * (half - len(rows[half:]))):
        body += ('<tr><td class="fr">%s</td><td>%s</td><td>%s</td>'
                 '<td class="fr">%s</td><td>%s</td><td>%s</td></tr>' % (l[0], l[1], l[2], r[0], r[1], r[2]))
    return ('<div class="tblwrap"><table class="mini gl"><thead><tr>%s</tr></thead><tbody>%s</tbody></table></div>'
            % (th, body))

def table(headers, rows, mini=False):
    th = ''.join('<th>%s</th>' % x for x in headers)
    body = ''.join('<tr>%s</tr>' % ''.join('<td>%s</td>' % c for c in r) for r in rows)
    cls = 'mini' if mini else ''
    return ('<div class="tblwrap"><table class="%s"><thead><tr>%s</tr></thead><tbody>%s</tbody></table></div>'
            % (cls, th, body))

def lines(n, cls=''):
    return '<div class="wl %s">%s</div>' % (cls, '<div class="l"></div>' * n)

def numlines(items):
    """items: list of prompt strings (may include .ta spans) -> numbered ruled answer lines"""
    out = ''
    for i, q in enumerate(items, 1):
        out += ('<div class="numline"><span class="n">%d.</span><span class="q">%s</span>'
                '<div class="b"></div></div>' % (i, q))
    return out

def qlines(items, n=1):
    out = ''
    for q in items:
        out += '<div class="qline"><div class="q">%s</div>%s</div>' % (q, '<div class="b"></div>' * n)
    return out

def trace(title, rows):
    """rows: list of (french, gloss) — model, faded guide, blank line"""
    r = ''
    for fr, g in rows:
        r += ('<div class="row"><div class="m">%s</div><div class="g">%s</div><div class="s"></div></div>'
              % (fr, fr))
        del g
    return '<div class="trace"><div class="t">%s</div>%s</div>' % (title, r)

def fig(name, tagline, cap_en, cap_ta, size='figbig'):
    return ('<div class="fig %s"><div class="tagline">%s</div><img src="%s">'
            '<div class="cap"><b>%s</b><span class="ta">%s</span></div></div>'
            % (size, tagline, b64(name), cap_en, cap_ta))

def figrow(items):
    """items: list of (name, tagline, cap_en, cap_ta)"""
    inner = ''
    for name, tag, ce, ta in items:
        inner += ('<div class="fig"><div class="tagline">%s</div><img src="%s">'
                  '<div class="cap"><b>%s</b><span class="ta">%s</span></div></div>' % (tag, b64(name), ce, ta))
    return '<div class="figrow">%s</div>' % inner

def conj(title_fr, title_ta, forms):
    ls = ''.join('<div class="l">%s</div>' % f for f in forms)
    return '<div class="conj"><div class="t">%s <span class="ta">%s</span></div>%s</div>' % (title_fr, title_ta, ls)

def dialog(title, lines_):
    out = ''
    for sp, fr, ta in lines_:
        out += '<div class="ln"><span class="sp">%s</span>%s<span class="ta">%s</span></div>' % (sp, fr, ta)
    return '<div class="dialog"><div class="h" style="font-weight:800;color:#12386e;margin-bottom:2mm">%s</div>%s</div>' % (title, out)

def pb():
    return '<div class="pb"></div>'
