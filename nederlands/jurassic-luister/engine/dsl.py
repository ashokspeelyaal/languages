"""Script loader. An episode has `script.txt` (single source) and a tiny script_data.py that calls `load(path)`.
script.txt format:
  # comment
  @meta num=1 title=Jurassic Park level=B2 slug=jurassic-park      (key=value, rest of line = value after the first '=' of each key; use ';' between pairs)
  @alias Nublar=Noeblar ; Kulithalai=Koelietalai                    (spoken-only; ONE word each side)
  == 1 · Chapter title | cast: hammond alan ashok | bg: imgkey
  hammond: Tekst met [[imgkey]]foto-wissel en {kaartje|Nederlandse uitleg|English meaning}.
  Markers sit at the START of a word. [[key]] = photo change; {item|NL|EN} = vocab card (item may be several words).
Level (B2/C1) comes from @meta level=...  (levels.py)."""
import re
SEQ = []; META = {}; ALIAS = {}
def load(path):
    SEQ.clear(); META.clear(); ALIAS.clear()
    for ln in open(path, encoding='utf-8'):
        ln = ln.rstrip('\n')
        if not ln.strip() or ln.startswith('#'): continue
        if ln.startswith('@meta'):
            for kv in ln[5:].split(';'):
                k, v = kv.strip().split('=', 1); META[k.strip()] = v.strip()
        elif ln.startswith('@alias'):
            for kv in ln[6:].split(';'):
                k, v = kv.strip().split('=', 1); assert ' ' not in k.strip() and ' ' not in v.strip(); ALIAS[k.strip()] = v.strip()
        elif ln.startswith('=='):
            parts = [p.strip() for p in ln[2:].split('|')]; d = dict(kind='chapter', title=parts[0], cast=[], bg=None)
            for p in parts[1:]:
                if p.startswith('cast:'): d['cast'] = p[5:].split()
                if p.startswith('bg:'): d['bg'] = p[3:].strip()
            SEQ.append(d)
        else:
            who, text = ln.split(':', 1); SEQ.append(dict(kind='say', who=who.strip(), text=text.strip()))
    META['num'] = int(META.get('num', 1)); return SEQ
