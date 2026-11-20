# -*- coding: utf-8 -*-
"""Trim instructional Tamil from the three volumes and merge them into one PDF-ready HTML."""
import io, os, re, sys
sys.path.insert(0, os.path.dirname(__file__))
from kit import CSS, head
import trim

ROOT = os.path.join(os.path.dirname(__file__), '..')
VOLS = [
    ('01-revision-cindy.html', 'PART ONE', "Tout ce que Cindy m'a appris",
     "சிண்டி கற்றுக் கொடுத்த அனைத்தும்", "Everything from the eight italki lessons — her texts, her images, her corrections."),
    ('02-au-dela.html', 'PART TWO', "Au-delà de Cindy",
     "சிண்டிக்கு அப்பால்", "Nine short chapters she has not taught."),
    ('03-cahier-decriture.html', 'PART THREE', "Le Cahier d'écriture",
     "எழுத்துப் பயிற்சிப் புத்தகம்", "Writing drills only — no new content."),
]

def inner(html):
    """Pull out everything between the opening <div class="page"> and the final </div></body>."""
    i = html.index('<div class="page">') + len('<div class="page">')
    j = html.rindex('</div></body>')
    return html[i:j]

parts = []
for fn, kicker, title, ta, blurb in VOLS:
    raw = io.open(os.path.join(ROOT, fn), encoding='utf-8').read()
    body = inner(trim.trim(raw))
    # the volume's own masthead becomes a part divider
    parts.append('<div class="pb"></div>' if parts else '')
    parts.append(body)

out = head("Tout ce que Cindy m'a appris — le livre complet", "",
           "All three volumes merged; instructional Tamil removed, French glosses kept.")
out += ''.join(parts) + '\n</div>\n</body>\n</html>\n'
dest = os.path.join(ROOT, 'cindy-complet.html')
io.open(dest, 'w', encoding='utf-8').write(out)
print('wrote', dest, len(out))
