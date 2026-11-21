import re,sys
t=open('script.txt').read()
bad=[l[:80] for l in t.split('\n') if re.search(r'\{',l) and any(len(m.split('|'))!=3 for m in re.findall(r'\{([^{}]*)\}',l))]
print('bad cards',bad)
body=[l for l in t.split('\n') if re.match(r'^(ashok|claire|owen|ellie|alan|malcolm|hammond):',l)]
txt=' '.join(body); txt=re.sub(r'\{([^|{}]*)\|[^{}]*\}',r'\1',txt); txt=re.sub(r'\[\[[a-z0-9_]*\]\]','',txt)
txt=re.sub(r'^\w+: ','',txt)
print('turns',len(body),'words',len(txt.split()),'cards',t.count('{'))
import imgmap
ks=set(re.findall(r'\[\[([a-z0-9_]+)\]\]',t)); print('missing keys',[k for k in ks if k not in imgmap.IMG])
