#!/usr/bin/env python3
"""Insert [[key]] photo markers into script.txt so that no photo is visible longer than ~MAXGAP seconds.
Needs audio/timeline.json (run episode_audio.py first), episode `imgpools.py` with  POOLS = {chapter_number: [imgkeys...]}  (keys exist in imgmap.py).
At each sentence start where the current photo has been on screen >= MAXGAP s, the next unused key of the chapter's pool is inserted
(skipping the key currently on screen). Idempotent-ish: run once on a script with only hand-placed markers, then re-run audio (cached).
Usage: python3 engine/autoimg.py <episode_dir> [MAXGAP=10]"""
import re, sys, json, pathlib
EP = pathlib.Path(sys.argv[1]).resolve(); MAXGAP = float(sys.argv[2]) if len(sys.argv) > 2 else 10.0
sys.path.insert(0, str(EP)); from imgpools import POOLS
TL = json.load(open(EP / 'audio' / 'timeline.json')); say = [i for i in TL['items'] if i['kind'] == 'say']
lines = open(EP / 'script.txt', encoding='utf-8').read().split('\n'); out = []; k = 0; chap = 0; cur = None; cur_t = 0.0; pi = {}
ATOM = re.compile(r'\{[^{}]*\}|\[\[[^\]]*\]\]|\S+|\s+')
for ln in lines:
    if ln.startswith('=='):
        chap += 1; out.append(ln); m = re.search(r'bg:\s*(\w+)', ln); cur = m.group(1) if m else cur; continue
    if ln.startswith(('#', '@')) or not ln.strip(): out.append(ln); continue
    who, text = ln.split(':', 1); it = say[k]; k += 1
    atoms = ATOM.findall(text.strip()); w = 0; new = []; sent_start = True; glued = False
    for a in atoms:
        if a.isspace(): new.append(a); glued = False; continue
        if a.startswith('[['):
            cur = a[2:-2]; idx = min(w, len(it['wt']) - 1); cur_t = it['wt'][idx]; new.append(a); continue
        if glued and not a.startswith('{'):
            new.append(a); sent_start = bool(re.search(r'[.!?]["»”]?$', a)); continue
        nwords = len(a[1:-1].split('|')[0].split()) if a.startswith('{') else 1
        t = it['wt'][min(w, len(it['wt']) - 1)]
        if sent_start and t - cur_t >= MAXGAP and POOLS.get(chap):
            pool = POOLS[chap]; j = pi.get(chap, 0)
            for _ in range(len(pool)):
                key = pool[j % len(pool)]; j += 1
                if key != cur: break
            pi[chap] = j; new.append(f'[[{key}]]'); cur = key; cur_t = t
        new.append(a); w += nwords; glued = True
        last = a[1:-1].split('|')[0] if a.startswith('{') else a
        sent_start = bool(re.search(r'[.!?]["»”]?$', last))
    out.append(f'{who}: ' + ''.join(new))
open(EP / 'script.txt', 'w', encoding='utf-8').write('\n'.join(out)); print('markers now', sum(l.count('[[') for l in out))
