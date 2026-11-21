import re
t=open('script.txt').read()
C=[
("meer vermag dan","meer bereikt dan","accomplishes more than"),
("ingewikkelde plannen","plannen met veel haken en ogen","convoluted plans"),
("mijn vragen ingeslikt","niets gezegd terwijl ik wilde vragen","swallowed my questions"),
("in stukjes snijdt","verdeelt in kleine delen","carve up"),
("een schuilplaats","een plek om je te verbergen","a hiding place"),
("het onderhandelen","praten over een ruil, een deal sluiten","negotiating"),
("de woede","hevige boosheid","the fury"),
("uitzwaaide","afscheid nam door te wuiven","waved us off"),
("een merkwaardig","vreemd, opmerkelijk","remarkable"),
("een prachtig en een vreemd gezicht","","")  ,
("in een rechtszaal","","")  ,
("laakbaar","moreel af te keuren","reprehensible"),
("eigenzinnige","","") ,
("het recht om zelf te beslissen","zelf mogen kiezen","the right to decide for oneself"),
("een hulpmiddel","een instrument om iets makkelijker te doen","an aid"),
("erkenning","dat anderen je werk waarderen","recognition"),
("geen enkele herinnering","helemaal niets weten van wat er gebeurde","no memory at all"),
("geen details","","")  ,
("een deskundige aan boord","iemand met veel kennis die meegaat","an expert on board"),
("een organisatie met mensen en machines","","")  ,
("kunnen handelen","","") ,
("ik wil het graag verdiepen","ik wil er dieper op ingaan","I'd like to explore it further"),
("een inbreuk","","")  ,
("de technologie van de eenentwintigste eeuw","","") ,
("een lange nacht","","")  ,
("in zo veel woorden","precies zo uitgedrukt, zonder omweg","in so many words"),
("een gezelschap","een groep mensen die samen iets doen","a party"),
("misleiding","bewust een verkeerd beeld geven","deception"),
("op afstand","","") ,
("verantwoordelijkheid","de plicht om te antwoorden voor je daden","responsibility"),
("ik ben voorzichtig met die vraag","ik wil niet te snel antwoorden","I'm careful with that question"),
("klopt","","") ,
]
for p,nl,en in C:
    if not nl: continue
    pos=0
    while True:
        i=t.find(p,pos)
        if i<0: print('miss',p); break
        if t.rfind('{',0,i)>t.rfind('}',0,i) or t.rfind('[[',0,i)>t.rfind(']]',0,i): pos=i+1; continue
        t=t[:i]+'{'+p+'|'+nl+'|'+en+'}'+t[i+len(p):]; break
open('script.txt','w').write(t)
print(len(re.findall(r'\{[^{}]*\}',t)))
