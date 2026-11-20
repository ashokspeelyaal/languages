# -*- coding: utf-8 -*-
"""VOLUME 3 — Le Cahier d'écriture: pure writing practice on Cindy's material."""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from kit import *
P = []; A = P.append
A(head("Le Cahier d'écriture — Volume 3", "", "Volume 3 of 3. Print again and again."))
A("""
<div class="flagbar"><i></i><i></i><i></i></div>
<div class="masthead">
  <div class="kicker">Volume 3 of 3 · print it again as often as you like</div>
  <h1>Le Cahier d'écriture
    <span class="ta">எழுத்துப் பயிற்சிப் புத்தகம்</span></h1>
  <div class="meta">
    No new grammar. Nothing here that is not already in Volume 1. This is the same material turned into pure
    pen-work — copying, dictation, transformation, translation and free writing — so that you can print it and
    do it again as many times as you want.<br>
    <span class="ta">புதிய இலக்கணம் இல்லை. தொகுதி 1-இல் இல்லாத எதுவும் இங்கே இல்லை. அதே பாடப்பொருளே முழுக்க
    முழுக்க பேனா வேலையாக மாற்றப்பட்டுள்ளது — நகலெடுத்தல், சொல்லக் கேட்டு எழுதுதல், மாற்றியமைத்தல்,
    மொழிபெயர்த்தல், சுதந்திரமாக எழுதுதல். விரும்பும் அளவு முறை அச்சிட்டுச் செய்யுங்கள்.</span>
  </div>
</div>""")
A(tip("The method — five passes over the same sentence", "முறை — ஒரே வாக்கியத்தின் மேல் ஐந்து சுற்றுகள்",
  """<div class="duo"><div><b>1 · Copy</b> it while saying it aloud. <b>2 · Cover</b> the model and write it from
  memory. <b>3 · Check</b> letter by letter — especially the endings, <i>la désinence</i>. <b>4 · Change</b> one
  thing (make it feminine, plural, negative, past). <b>5 · Use</b> it about your own life.<br>
  Cindy made four spelling corrections in eight lessons; every one was an <b>ending</b>.</div>
  <div class="ta-col"><b>1 · நகலெடுங்கள்</b> — சத்தமாகச் சொல்லிக்கொண்டே. <b>2 · மூடி</b> நினைவிலிருந்து
  எழுதுங்கள். <b>3 · சரிபாருங்கள்</b> — எழுத்துக்கு எழுத்து, குறிப்பாக விகுதிகள். <b>4 · ஒன்றை மாற்றுங்கள்</b>
  (பெண்பால், பன்மை, மறுப்பு, இறந்தகாலம்). <b>5 · பயன்படுத்துங்கள்</b> — உங்கள் சொந்த வாழ்க்கையைப் பற்றி.<br>
  எட்டு பாடங்களில் சிண்டி நான்கு எழுத்துத் திருத்தங்கள் செய்தார்; ஒவ்வொன்றும் ஒரு <b>விகுதியே</b>.</div></div>"""))

# ---- 1 copy & trace ----
A(sec("1", "Copy and say — the sixty words you must never hesitate on", "நகலெடுத்துச் சொல்லுங்கள் — தயங்கக் கூடாத அறுபது சொற்கள்"))
BLOCKS = [
 ("PEOPLE & FAMILY · மக்களும் குடும்பமும்", [
   "un frère","une sœur","le père","la mère","le grand-père","la grand-mère","la petite-fille","le petit-fils",
   "un oncle","une tante","un neveu","une nièce","la belle-mère","la demi-sœur","l'aîné","le cadet"]),
 ("DESCRIBING · விவரித்தல்", [
   "il est grand","elle est grande","il est gros","elle est grosse","il est roux","elle est rousse",
   "il est mince","elle est mince","il est vieux","elle est vieille","les cheveux courts","les cheveux frisés",
   "il porte des lunettes","elle porte une natte","je suis jeune","vous êtes de taille moyenne"]),
 ("EVERYDAY VERBS · அன்றாட வினைச்சொற்கள்", [
   "j'habite","tu habites","il travaille","nous parlons","vous êtes","ils ont","je vais","elle fait",
   "il met","je viens","j'aime","je préfère","je reste","je regarde","j'écris","je me promène"]),
 ("FOOD & ARTICLES · உணவும் இடைச்சொற்களும்", [
   "un potiron","une cerise","des abricots","des carottes","du melon","du céleri","de la salade",
   "de la pêche","de l'ananas","de l'orange","des choux-fleurs","des petits pois","des pommes de terre",
   "des haricots","un chou de Bruxelles","une pomme"]),
]
for title, ws in BLOCKS:
    A(trace(title, [(w, "") for w in ws]))
A(pb())

# ---- 2 dictation ----
A(sec("2", "Dictation — her own sentences, read to yourself", "சொல்லக் கேட்டு எழுதுதல் — அவரது சொந்த வாக்கியங்கள்"))
A(duo("""<p>Read each sentence aloud once, slowly. Then cover it with your hand and write it on the line. Then
  uncover and check. Every one of these was typed by Cindy or built directly from her texts.</p>""",
  """<p>ஒவ்வொரு வாக்கியத்தையும் ஒரு முறை மெதுவாகச் சத்தமாகப் படியுங்கள். கையால் மூடி, கோட்டில் எழுதுங்கள்.
  பிறகு திறந்து சரிபாருங்கள். இவை அனைத்தும் சிண்டி தட்டச்சு செய்தவை அல்லது அவரது உரைகளிலிருந்து நேரடியாக
  உருவானவை.</p>"""))
DICT = [
 ("Paul a trente-trois ans et il est professeur.", "Paul-க்கு 33 வயது; அவர் ஆசிரியர்."),
 ("Il habite à Rambouillet, c'est à côté de Paris.", "Rambouillet-இல் வசிக்கிறார்; அது பாரிஸ் அருகில்."),
 ("Mélanie ne travaille pas, elle est étudiante.", "Mélanie வேலை செய்யவில்லை; மாணவி."),
 ("Obélix est grand, gros et fort.", "Obélix உயரமானவர், பருமனானவர், பலசாலி."),
 ("Il a les cheveux roux et il porte des nattes.", "செம்பட்டை முடி; பின்னல் போடுகிறார்."),
 ("Astérix est petit et mince.", "Astérix குட்டையானவர், மெலிந்தவர்."),
 ("Une pomme et une poire vertes.", "பச்சை ஆப்பிளும் பேரிக்காயும்."),
 ("Un couteau et une fourchette gris.", "சாம்பல் நிற கத்தியும் முள்கரண்டியும்."),
 ("Madame Dubois a envie d'aller au cinéma.", "திருமதி Dubois திரையரங்கிற்குச் செல்ல விரும்புகிறார்."),
 ("Son mari n'a pas envie de sortir.", "அவரது கணவருக்கு வெளியே செல்ல விருப்பமில்லை."),
 ("Les enfants font du piano tous les jours.", "குழந்தைகள் தினமும் பியானோ கற்கிறார்கள்."),
 ("Elle a horreur des insectes.", "அவளுக்குப் பூச்சிகளைக் கண்டால் பயம்."),
 ("Il met une araignée dans la chambre de sa sœur.", "சகோதரியின் அறையில் ஒரு சிலந்தியை வைக்கிறான்."),
 ("Sa femme est mexicaine et son père est italien.", "மனைவி மெக்சிகன், தந்தை இத்தாலியர்."),
 ("Son frère est né aux États-Unis.", "சகோதரர் அமெரிக்காவில் பிறந்தார்."),
 ("Son oncle et sa tante ont vécu un an en Grèce.", "மாமாவும் அத்தையும் ஓராண்டு கிரேக்கத்தில் வாழ்ந்தார்கள்."),
 ("Je viens du sud de l'Inde et je parle tamoul.", "தென்னிந்தியாவிலிருந்து வருகிறேன்; தமிழ் பேசுகிறேன்."),
 ("Je ne parle pas hindi.", "நான் இந்தி பேசுவதில்லை."),
 ("Nous avons toujours une batte à la maison.", "வீட்டில் எப்போதும் ஒரு மட்டை உண்டு."),
 ("J'achète des carottes, du céleri et un chou-fleur.", "கேரட், செலரி, ஒரு காலிஃபிளவர் வாங்குகிறேன்."),
]
A(qlines(["<b class='fr'>%s</b> <span class='ta'>%s</span>" % (f, t) for f, t in DICT], n=1))
A(pb())

# ---- 3 transformation ----
A(sec("3", "Transformation — change one thing, rewrite the whole sentence", "மாற்றியமைத்தல் — ஒன்றை மாற்றி, முழு வாக்கியத்தையும் மீண்டும் எழுதுங்கள்"))
A(h3("A · Make it feminine", "A · பெண்பாலாக்குங்கள்"))
A(numlines(["<span class='fr'>Il est grand, blond et frisé.</span>",
            "<span class='fr'>Mon frère est vieux et roux.</span>",
            "<span class='fr'>Ce garçon est paresseux et agressif.</span>",
            "<span class='fr'>Il est souriant et bavard.</span>",
            "<span class='fr'>Marc est créatif et original.</span>",
            "<span class='fr'>Le lycéen est timide.</span>"]))
A(key("""1. <span class="fr">Elle est grande, blonde et frisée.</span> · 2. <span class="fr">Ma sœur est vieille et rousse.</span> ·
3. <span class="fr">Cette fille est paresseuse et agressive.</span> · 4. <span class="fr">Elle est souriante et bavarde.</span> ·
5. <span class="fr">Marie est créative et originale.</span> · 6. <span class="fr">La lycéenne est timide.</span>"""))
A(h3("B · Make it plural", "B · பன்மையாக்குங்கள்"))
A(numlines(["<span class='fr'>Le chou est vert.</span>", "<span class='fr'>Un genou lavé.</span>",
            "<span class='fr'>Le chou-fleur est délicieux.</span>", "<span class='fr'>La prune est juteuse.</span>",
            "<span class='fr'>Ce livre est nouveau.</span>", "<span class='fr'>L'enfant est gentil.</span>"]))
A(key("""1. <span class="fr">Les choux sont verts.</span> · 2. <span class="fr">Des genoux lavés.</span> ·
3. <span class="fr">Les choux-fleurs sont délicieux.</span> · 4. <span class="fr">Les prunes sont juteuses.</span> ·
5. <span class="fr">Ces livres sont nouveaux.</span> · 6. <span class="fr">Les enfants sont gentils.</span>"""))
A(h3("C · Make it negative", "C · மறுப்பாக்குங்கள்"))
A(numlines(["<span class='fr'>Je mange des champignons.</span>", "<span class='fr'>Elle travaille à Nantes.</span>",
            "<span class='fr'>Il porte des nattes.</span>", "<span class='fr'>Nous avons un frère.</span>",
            "<span class='fr'>Tu bois du café.</span>", "<span class='fr'>C'est une casquette.</span>"]))
A(key("""1. <span class="fr">Je ne mange pas de champignons.</span> · 2. <span class="fr">Elle ne travaille pas à Nantes.</span> ·
3. <span class="fr">Il ne porte pas de nattes.</span> · 4. <span class="fr">Nous n'avons pas de frère.</span> ·
5. <span class="fr">Tu ne bois pas de café.</span> · 6. <span class="fr">Ce n'est pas une casquette.</span> — <b>être keeps the article.</b>"""))
A(h3("D · Ask the question three ways", "D · மூன்று வழிகளில் கேள்வி கேளுங்கள்"))
A(qlines(["<span class='fr'>Il s'appelle Paul.</span> <span class='ta'>(பெயர் என்ன?)</span>",
          "<span class='fr'>Elle habite à Nantes.</span> <span class='ta'>(எங்கே வசிக்கிறாள்?)</span>",
          "<span class='fr'>Il a vingt-cinq ans.</span> <span class='ta'>(என்ன வயது?)</span>",
          "<span class='fr'>Elle est française.</span> <span class='ta'>(என்ன தேசியம்?)</span>",
          "<span class='fr'>Il aime le cinéma.</span> <span class='ta'>(எது பிடிக்கும்?)</span>"], n=3))
A(pb())

# ---- 4 translation ----
A(sec("4", "Translation — from English and from Tamil", "மொழிபெயர்ப்பு — ஆங்கிலத்திலிருந்தும் தமிழிலிருந்தும்"))
A(duo("""<p>Every sentence below can be built entirely from words Cindy gave you. Nothing new is needed. Translating
  <b>from Tamil</b> is harder and more valuable than from English, because Tamil word order is not French word
  order — remember <b>SVO</b>.</p>""",
  """<p>கீழே உள்ள ஒவ்வொரு வாக்கியத்தையும் சிண்டி கொடுத்த சொற்களைக் கொண்டே முழுமையாக உருவாக்கலாம். புதிதாக
  எதுவும் தேவையில்லை. <b>தமிழிலிருந்து</b> மொழிபெயர்ப்பது ஆங்கிலத்திலிருந்து மொழிபெயர்ப்பதை விடக்
  கடினமானது, பயனுள்ளது — தமிழ்ச் சொல் வரிசை பிரெஞ்சு வரிசை அல்ல. <b>SVO</b> நினைவிருக்கட்டும்.</p>"""))
A(h3("A · From English", "A · ஆங்கிலத்திலிருந்து"))
EN = ["My sister is small and slim. She has long black hair.",
 "I do not speak Hindi, but I speak Tamil and Dutch.",
 "How old are you? — I am forty-five years old.",
 "Where were you born? — I was born in India.",
 "My father's brother is my uncle; his daughter is my cousin.",
 "She feels like going to the cinema, but her husband prefers to stay at home.",
 "We play football on Saturday and we do sport every day.",
 "I buy some carrots, a cauliflower and some celery.",
 "They lived one year in Greece. — Ils ont …",
 "I am going to write every day."]
A(qlines(["%s <span class='ta'></span>" % e for e in EN], n=2))
A(key("""1. <span class="fr">Ma sœur est petite et mince. Elle a les cheveux noirs et longs.</span> ·
2. <span class="fr">Je ne parle pas hindi, mais je parle tamoul et néerlandais.</span> ·
3. <span class="fr">Quel âge as-tu ? — J'ai quarante-cinq ans.</span> ·
4. <span class="fr">Où es-tu né ? — Je suis né en Inde.</span> ·
5. <span class="fr">Le frère de mon père est mon oncle ; sa fille est ma cousine.</span> ·
6. <span class="fr">Elle a envie d'aller au cinéma, mais son mari préfère rester chez lui.</span> ·
7. <span class="fr">Nous jouons au football le samedi et nous faisons du sport tous les jours.</span> ·
8. <span class="fr">J'achète des carottes, un chou-fleur et du céleri.</span> ·
9. <span class="fr">Ils ont vécu un an en Grèce.</span> ·
10. <span class="fr">Je vais écrire tous les jours.</span>"""))
A(h3("B · From Tamil", "B · தமிழிலிருந்து"))
TA = ["என் தாத்தாவின் பெயர் என்ன?",
 "அவள் இளையவள்; அவளுக்கு பத்தொன்பது வயது.",
 "நான் தென்னிந்தியாவிலிருந்து வருகிறேன், பெல்ஜியத்தில் வசிக்கிறேன்.",
 "அவர் ஆசிரியர் அல்ல; அவர் மாணவர்.",
 "எனக்கு ஒரு சகோதரனும் இரண்டு சகோதரிகளும் உண்டு.",
 "இந்த ஆரஞ்சுகளும் அல்லிப்பழங்களும் சுவையானவை.",
 "நாளை நான் நீச்சல் குளத்திற்குச் செல்லப் போகிறேன்.",
 "அவர்கள் ஜப்பானில் வேலை செய்தார்கள்.",
 "எனக்கு இறைச்சி வேண்டாம்; நான் சைவம்.",
 "பேத்தி பாட்டியுடன் இருக்கிறாள்."]
A(qlines(["<span class='ta' style='font-size:9.8pt'>%s</span>" % t for t in TA], n=2))
A(key("""1. <span class="fr">Comment s'appelle mon grand-père ?</span> (or <span class="fr">Quel est le prénom de mon grand-père ?</span>) ·
2. <span class="fr">Elle est jeune ; elle a dix-neuf ans.</span> ·
3. <span class="fr">Je viens du sud de l'Inde et j'habite en Belgique.</span> ·
4. <span class="fr">Il n'est pas professeur ; il est étudiant.</span> ·
5. <span class="fr">J'ai un frère et deux sœurs.</span> ·
6. <span class="fr">Ces oranges et ces prunes sont délicieuses.</span> ·
7. <span class="fr">Demain, je vais aller à la piscine.</span> ·
8. <span class="fr">Ils ont travaillé au Japon.</span> ·
9. <span class="fr">Je ne veux pas de viande ; je suis végétarien.</span> ·
10. <span class="fr">La petite-fille est avec sa grand-mère.</span>"""))
A(pb())

# ---- 5 free writing ----
A(sec("5", "Free writing — ten prompts, one page each", "சுதந்திரமாக எழுதுதல் — பத்துத் தூண்டுதல்கள்"))
A(duo("""<p>Sixty to a hundred words each, by hand. Print this section again whenever you finish it. Under every
  prompt is the short list of things Cindy will look for.</p>""",
  """<p>ஒவ்வொன்றும் அறுபது முதல் நூறு சொற்கள், கையால். முடித்ததும் இந்தப் பகுதியை மீண்டும் அச்சிடுங்கள்.
  ஒவ்வொரு தூண்டுதலுக்கும் கீழே சிண்டி எதைத் தேடுவார் என்ற சிறு பட்டியல் உள்ளது.</p>"""))
PROMPTS = [
 ("Je me présente", "என்னை அறிமுகம் செய்கிறேன்",
  "name · age · city · job · languages · nationality · one negative",
  "பெயர் · வயது · ஊர் · வேலை · மொழிகள் · தேசியம் · ஒரு மறுப்பு"),
 ("Ma famille", "என் குடும்பம்",
  "six hyphenated words · aîné / cadet · maternel / paternel · possessives",
  "ஆறு இணைப்புக்கோடு சொற்கள் · aîné / cadet · maternel / paternel · உடைமைச் சொற்கள்"),
 ("Mon meilleur ami", "என் நெருங்கிய நண்பர்",
  "être + avoir + porter · four adjectives with correct agreement · hair and eyes",
  "être + avoir + porter · சரியான ஒப்புமையுடன் நான்கு பெயரடைகள்"),
 ("Mon week-end", "என் வார இறுதி",
  "avoir envie de ×2 · faire du · jouer à · demain · aujourd'hui",
  "avoir envie de ×2 · faire du · jouer à · demain · aujourd'hui"),
 ("Mes loisirs", "என் பொழுதுபோக்குகள்",
  "faire du / de la · jouer à / de · four -er verbs · one hobby you dislike (negative)",
  "faire du / de la · jouer à / de · நான்கு -er வினைச்சொற்கள் · ஒரு மறுப்பு"),
 ("Une famille internationale", "ஒரு சர்வதேசக் குடும்பம்",
  "six countries with the right article · six nationalities · capital letters correct",
  "சரியான இடைச்சொல்லுடன் ஆறு நாடுகள் · ஆறு தேசியங்கள் · பெரிய எழுத்து சரியாக"),
 ("Au marché", "சந்தையில்",
  "fifteen items · un / une / des / du / de la / de l' · one negative with de",
  "பதினைந்து பொருட்கள் · எல்லா இடைச்சொற்களும் · de-உடன் ஒரு மறுப்பு"),
 ("Un repas chez moi", "என் வீட்டில் ஒரு உணவு",
  "les repas vocabulary · partitives · avoir faim / avoir soif · délicieux",
  "உணவுச் சொற்கள் · பகுதி இடைச்சொற்கள் · avoir faim / soif"),
 ("Mes quarante jours sans français", "பிரெஞ்சு இல்லாத என் நாற்பது நாட்கள்",
  "passé composé ×6 · two with être · one ne … pas · one ne … plus",
  "passé composé ×6 · இரண்டு être-உடன் · ஒரு ne … pas · ஒரு ne … plus"),
 ("Mes projets pour le français", "பிரெஞ்சுக்கான என் திட்டங்கள்",
  "futur proche ×6 · numbers written in words · two questions to ask Cindy",
  "futur proche ×6 · எண்கள் சொற்களில் · சிண்டியிடம் கேட்க இரு கேள்விகள்"),
]
for i, (fr, ta, ck_en, ck_ta) in enumerate(PROMPTS, 1):
    A('<div class="drill"><div class="h">%d · <span class="fr" style="font-size:11pt">%s</span> '
      '<span class="ta">· %s</span></div>'
      '<p class="gloss" style="margin-bottom:2mm"><b>Cindy will look for:</b> %s'
      '<span class="ta" style="display:block">%s</span></p>%s</div>'
      % (i, fr, ta, ck_en, ck_ta, lines(11)))
    if i % 2 == 0 and i < len(PROMPTS):
        A(pb())
A(pb())

# ---- 6 self-check ----
A(sec("6", "The self-check — mark your own work the way she would", "சுய சரிபார்ப்பு — அவர் திருத்துவது போல உங்கள் வேலையைத் திருத்துங்கள்"))
A(duo("""<p>After every text you write, run this list. Cindy's four corrections in eight lessons were
  <i>êtes</i>, <i>je suis jeune</i>, <i>agressive</i> and <i>reconstitute</i> — three endings and one spelling.
  Check the endings first.</p>""",
  """<p>எழுதும் ஒவ்வொரு உரைக்குப் பிறகும் இந்தப் பட்டியலைச் செய்யுங்கள். எட்டு பாடங்களில் சிண்டியின் நான்கு
  திருத்தங்கள்: <i>êtes</i>, <i>je suis jeune</i>, <i>agressive</i>, <i>reconstitute</i> — மூன்று விகுதிகள்,
  ஒரு எழுத்துப்பிழை. முதலில் விகுதிகளைச் சரிபாருங்கள்.</p>"""))
A(table(("#", "Check <span class='ta'>சரிபார்ப்பு</span>", "Why it costs marks <span class='ta'>ஏன் மதிப்பெண் இழக்கிறது</span>"),
 [("1","<b>Every adjective</b> — does it match the noun in gender <b>and</b> number?","Cindy's Lesson 3. Silent in speech, visible on paper. <span class='ta'>பேச்சில் ஒலிக்காது, காகிதத்தில் தெரியும்.</span>"),
  ("2","<b>Every verb ending</b> — <i>la désinence</i>. <i>-e, -es, -e, -ons, -ez, -ent</i>.","Her correction of <i>je sui jeun</i>. <span class='ta'>அவரது திருத்தம்.</span>"),
  ("3","<b>Every accent</b> — é è ê on the right vowel; ç where you need [s].","<i>sur</i> vs <i>sûr</i> changes the word. <span class='ta'>வார்த்தையையே மாற்றும்.</span>"),
  ("4","<b>Every article</b> — un/une/le/la/du/de la/de l'/des, and <b>de</b> after a negative.","Her Lesson 8. <span class='ta'>அவரது பாடம் 8.</span>"),
  ("5","<b>Every country</b> — le/la/les, and en/au/aux when you are <i>in</i> it.","Her Lesson 7. <span class='ta'>அவரது பாடம் 7.</span>"),
  ("6","<b>Every nationality</b> — capital for the person, small for the adjective and the language.","Her Lesson 6. <span class='ta'>அவரது பாடம் 6.</span>"),
  ("7","<b>Every hyphen</b> — <i>grand-père</i>, <i>petite-fille</i>, <i>chou-fleur</i>, <i>petit-déjeuner</i>.","<i>la petite-fille</i> vs <i>la fille petite</i>. <span class='ta'>அர்த்தமே மாறும்.</span>"),
  ("8","<b>Word order</b> — S V O, and the adjective before or after by the BAGS rule.","<i>un homme grand</i> vs <i>un grand homme</i>. <span class='ta'>தமிழ் வரிசை அல்ல.</span>"),
  ("9","<b>Read it aloud.</b> If you cannot say it, you cannot write it.","Her very first lesson was pronunciation. <span class='ta'>அவரது முதல் பாடமே உச்சரிப்பு.</span>")]))
A(drill("Your error log — write down every mistake she corrects, and the correct form beside it",
        "உங்கள் தவறுப் பதிவேடு — அவர் திருத்தும் ஒவ்வொரு தவறையும், அருகில் சரியான வடிவத்தையும் எழுதுங்கள்",
  """<p class="gloss">The four she has already given you are filled in. Keep adding. Re-read this page before
  every lesson.</p>""" +
  table(("Date", "What I wrote <span class='ta'>நான் எழுதியது</span>", "Correct <span class='ta'>சரியானது</span>", "Why <span class='ta'>ஏன்</span>"),
   [("15 Jun","<i>vous etes moyens</i>","<b class='fr'>vous êtes</b>","circumflex is part of the spelling"),
    ("15 Jun","<i>Je sui jeun</i>","<b class='fr'>je suis jeune</b>","la désinence — the endings"),
    ("18 Jun","<i>aggressive</i>","<b class='fr'>agressive</b>","French has one g"),
    ("22 Jun","<i>recounstitute</i>","<b class='fr'>reconstitute</b>","spelling"),
    ("8 Jul","<i>La fille petite</i>","<b class='fr'>la petite-fille</b>","hyphen changes the meaning"),
    ("13 Jul","<i>Wallis et Foutouna</i>","<b class='fr'>Wallis-et-Futuna</b>","spelling + hyphens"),
    ("","","",""),("","","",""),("","","",""),("","","",""),
    ("","","",""),("","","",""),("","","",""),("","","",""),
    ("","","",""),("","","",""),("","","",""),("","","",""),
   ])))

A("""<div class="foot">
<b>Le Cahier d'écriture — Volume 3.</b> Practice only: every sentence, word and rule drilled here comes from
Volume 1 (Cindy's material) or Volume 2 (the small extra). Print it again whenever you want it.<br>
<span class="ta">பயிற்சி மட்டுமே: இங்கே பயிற்சி செய்யப்படும் ஒவ்வொரு வாக்கியமும், சொல்லும், விதியும் தொகுதி 1
(சிண்டியின் பாடம்) அல்லது தொகுதி 2 (சிறிய கூடுதல்) இலிருந்து வந்தவை. விரும்பும்போது மீண்டும் அச்சிடுங்கள்.</span>
</div></div></body></html>""")
out = os.path.join(os.path.dirname(__file__), '..', '03-cahier-decriture.html')
open(out, 'w', encoding='utf-8').write(''.join(P))
print('wrote', out)
