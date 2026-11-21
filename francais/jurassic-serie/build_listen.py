#!/usr/bin/env python3
"""Cumulative listen video: python3 francais/jurassic-serie/build_listen.py N
Joins episodes/ep01*/listen.mp4 ... epNN*/listen.mp4 (ffmpeg concat demuxer, -c copy) into
~/Library/Mobile Documents/com~apple~CloudDocs/FrenchVideos/A1|A2/NN-listen-ep01-NN.mp4  (A2 for N >= 7; N=1 -> 01-listen-ep01.mp4)."""
import sys, pathlib, subprocess, tempfile
N = int(sys.argv[1]); SERIE = pathlib.Path(__file__).resolve().parent; files = []; missing = []
for n in range(1, N + 1):
    d = sorted((SERIE / 'episodes').glob(f'ep{n:02d}-*'))
    f = d[0] / 'listen.mp4' if d else None
    if f and f.exists(): files.append(f)
    else: missing.append(f'episode {n}: ' + (str(f) if f else 'no episodes/ep%02d-* folder' % n))
if missing: sys.exit('MISSING listen.mp4:\n  ' + '\n  '.join(missing))
lvl = 'A1' if N <= 6 else 'A2'; out_dir = pathlib.Path.home() / 'Library/Mobile Documents/com~apple~CloudDocs/FrenchVideos' / lvl; out_dir.mkdir(parents=True, exist_ok=True)
out = out_dir / (f'{N:02d}-listen-ep01.mp4' if N == 1 else f'{N:02d}-listen-ep01-{N:02d}.mp4')
with tempfile.NamedTemporaryFile('w', suffix='.txt', delete=False) as t:
    t.write(''.join("file '%s'\n" % str(f).replace("'", "'\\''") for f in files)); lst = t.name
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', lst, '-c', 'copy', '-movflags', '+faststart', str(out)], check=True)
print(out)
