#!/usr/bin/env python3
"""Wikimedia Commons helper (data only, generic User-Agent, throttled).
  fetch_commons.py search "query" [n]        -> print candidate titles (+ size, licence)
  fetch_commons.py fetch <images_dir>        -> download every title in <images_dir>/titles.txt (one 'File:...' per line,
                                                '#' comments) as 960 px thumbs + credits.json. Re-runnable; skips done files.
Run with plain python3. Standard widths only (960/1280); 1600 triggers heavy 429s."""
import json, sys, os, re, time, urllib.request, urllib.parse, html, hashlib
UA = {"User-Agent": "learning-notes/1.0"}
def get(u):
    for k in range(4):
        try: return urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=60).read()
        except Exception as e: time.sleep(5 * (k + 1))
def strip(s): return html.unescape(re.sub("<[^>]+>", "", s or "")).strip()
def slug(t): return re.sub(r"[^a-z0-9]+", "_", os.path.splitext(t[5:])[0].lower()).strip("_")[:40] + "_" + hashlib.md5(t.replace("_", " ").encode()).hexdigest()[:4] + ".jpg"
def search(q, n=12):
    u = "https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode(dict(action="query", format="json", generator="search", gsrsearch=q + " filetype:bitmap", gsrnamespace=6, gsrlimit=n, prop="imageinfo", iiprop="size|extmetadata"))
    d = json.loads(get(u) or "{}")
    for p in sorted(d.get("query", {}).get("pages", {}).values(), key=lambda p: p.get("index", 0)):
        ii = p.get("imageinfo", [{}])[0]; m = ii.get("extmetadata", {})
        print(f'{p["title"]} | {ii.get("width")}x{ii.get("height")} | {strip(m.get("LicenseShortName", {}).get("value", ""))}')
def fetch(HERE):
    TITLES = [l.strip() for l in open(HERE + "/titles.txt") if l.strip() and not l.startswith("#")]
    cj = HERE + "/credits.json"; cred = json.load(open(cj)) if os.path.exists(cj) else {}
    todo = [t for t in TITLES if slug(t) not in cred or not os.path.exists(f"{HERE}/{slug(t)}")]
    for i in range(0, len(todo), 10):
        b = todo[i:i + 10]
        u = "https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode(dict(action="query", format="json", prop="imageinfo", iiprop="url|extmetadata|size", iiurlwidth=960, titles="|".join(b)))
        d = json.loads(get(u) or "{}"); time.sleep(2)
        for p in d.get("query", {}).get("pages", {}).values():
            if "imageinfo" not in p: print("MISSING", p["title"]); continue
            ii = p["imageinfo"][0]; m = ii["extmetadata"]; fn = slug(p["title"]); data = get(ii["thumburl"])
            if not data: print("FAIL", p["title"]); continue
            open(f"{HERE}/{fn}", "wb").write(data)
            cred[fn] = dict(title=p["title"], artist=strip(m.get("Artist", {}).get("value", "")) or "unknown", lic=strip(m.get("LicenseShortName", {}).get("value", "")),
                page=ii["descriptionurl"], desc=strip(m.get("ImageDescription", {}).get("value", ""))[:140], w=ii["thumbwidth"], h=ii["thumbheight"])
            json.dump(cred, open(cj, "w"), ensure_ascii=False, indent=1); print("ok", fn, flush=True); time.sleep(1.2)
if __name__ == "__main__":
    if sys.argv[1] == "search": search(sys.argv[2], int(sys.argv[3]) if len(sys.argv) > 3 else 12)
    else: fetch(os.path.abspath(sys.argv[2]))
