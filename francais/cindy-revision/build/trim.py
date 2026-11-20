# -*- coding: utf-8 -*-
"""Strip *instructional* Tamil from generated HTML, keep Tamil that glosses French.

Protected regions (Tamil kept): tables, dialogues, drill prompts (numline/qline),
copy-and-trace blocks, conjugation boxes. Everywhere else the Tamil column /
span is explanatory prose and is removed.
"""
import re

PROTECT = [
    ('<table', '</table>', 'table'),
    ('<div class="dialog"', None, 'div'),
    ('<div class="numline"', None, 'div'),
    ('<div class="qline"', None, 'div'),
    ('<div class="trace"', None, 'div'),
    ('<div class="conj"', None, 'div'),
]

def _match_div(s, i):
    """i points at '<div'. Return index just past its balanced '</div>'."""
    depth = 0
    j = i
    while j < len(s):
        if s.startswith('<div', j):
            depth += 1; j += 4
        elif s.startswith('</div>', j):
            depth -= 1; j += 6
            if depth == 0:
                return j
        else:
            j += 1
    return len(s)

def _match_span(s, i):
    """i points at '<span'. Return index just past its balanced '</span>'."""
    depth = 0; j = i
    while j < len(s):
        if s.startswith('<span', j):
            depth += 1; j += 5
        elif s.startswith('</span>', j):
            depth -= 1; j += 7
            if depth == 0:
                return j
        else:
            j += 1
    return len(s)

def _drop_ta_spans(c):
    pat = re.compile(r'''<span class=["']ta["'][ >]''')
    out = []; i = 0
    while i < len(c):
        m = pat.search(c, i)
        if not m:
            out.append(c[i:]); break
        out.append(c[i:m.start()])
        i = _match_span(c, m.start())
    return ''.join(out)

def _strip_chunk(c):
    # 1. drop <div class="ta-col"> … </div>  (balanced)
    out = []
    i = 0
    while i < len(c):
        k = c.find('<div class="ta-col">', i)
        if k < 0:
            out.append(c[i:]); break
        end = _match_div(c, k)
        blk = c[k:end]
        if 'மொழிபெயர்ப்பு' in blk:          # translation of one of her French texts — keep
            out.append(c[i:end])
        else:
            out.append(c[i:k])
        i = end
    c = ''.join(out)
    # 2. drop the Tamil half of a hand-written .duo: <div><span class="lang-tag">தமிழ்</span> … </div>
    out = []
    i = 0
    while i < len(c):
        m = re.search(r'<div><span class="lang-tag">தமிழ்</span>', c[i:])
        if not m:
            out.append(c[i:]); break
        k = i + m.start()
        end = _match_div(c, k)
        if 'மொழிபெயர்ப்பு' in c[k:end]:
            out.append(c[i:end])
        else:
            out.append(c[i:k])
        i = end
    c = ''.join(out)
    # 3. drop explanatory <span class="ta">…</span>  (balanced — they may nest .fr spans)
    c = _drop_ta_spans(c)
    c = c.replace('<span class="lang-tag">ENGLISH</span>', '')
    # 4. tidy empty leftovers
    c = c.replace('<div class="duo"></div>', '')
    c = re.sub(r'<div class="duo"><div>(.*?)</div></div>', r'<div>\1</div>', c, flags=re.S)
    return c

def trim(html):
    head, sep, body = html.partition('<body>')
    out = []
    i = 0
    while i < len(body):
        nxt, kind, close = None, None, None
        for op, cl, k in PROTECT:
            p = body.find(op, i)
            if p >= 0 and (nxt is None or p < nxt):
                nxt, kind, close = p, k, cl
        if nxt is None:
            out.append(_strip_chunk(body[i:])); break
        out.append(_strip_chunk(body[i:nxt]))
        end = (body.find(close, nxt) + len(close)) if close else _match_div(body, nxt)
        out.append(body[nxt:end])
        i = end
    return head + sep + ''.join(out)
