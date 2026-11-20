# -*- coding: utf-8 -*-
"""VOLUME 1 — Tout ce que Cindy m'a appris (everything Cindy taught), EN + தமிழ்."""
import sys, os, math
sys.path.insert(0, os.path.dirname(__file__))
from kit import *

P = []
A = P.append

A(head("Tout ce que Cindy m'a appris — Volume 1 · Révision complète",
       "", "Volume 1 of 3. Built from the italki chat log with Cindy CHENE (Jun 11 - Jul 13, 2026)."))

# ============================ COVER ============================
A("""
<div class="flagbar"><i></i><i></i><i></i></div>
<div class="masthead">
  <div class="kicker">Volume 1 of 3 · italki with Cindy CHENE · lessons of 11 June – 13 July</div>
  <h1>Tout ce que Cindy m'a appris
    <span class="ta">சிண்டி எனக்குக் கற்றுக் கொடுத்த அனைத்தும் — முழுமையான மறுபார்வை</span></h1>
  <div class="meta">
    Complete revision book — every word, every rule, every image and every homework from the eight lessons,
    rebuilt in English and Tamil with writing practice on every page.<br>
    <span class="ta">எட்டு பாடங்களிலும் சிண்டி சொன்ன ஒவ்வொரு வார்த்தை, விதி, படம், வீட்டுப்பாடம் — அனைத்தும்
    ஆங்கிலம் மற்றும் தமிழில், ஒவ்வொரு பக்கத்திலும் எழுதும் பயிற்சியுடன்.</span>
  </div>
</div>
""")

A(duo(
  """<p><b>Scope.</b> Eight lessons with Cindy CHENE, 11 June to 13 July 2026, rebuilt from the raw italki
  chat into a course: lesson by lesson, in her order, with her examples, her images and her corrections.</p>
  <p>Everything Cindy typed is preserved. Where she wrote a word without explaining it, the explanation has been
  filled in — grammar, gender, plural, pronunciation.</p>
  <p><b>Three volumes:</b> <span class="chip">1 · Révision</span> what she taught ·
  <span class="chip r">2 · Au-delà</span> what she has not taught ·
  <span class="chip g">3 · Cahier</span> writing drills.</p>""",
  """<p><b>பரப்பு.</b> சிண்டி CHENE-உடன் எட்டு பாடங்கள், 11 ஜூன் – 13 ஜூலை 2026. italki உரையாடலிலிருந்து
  மீண்டும் ஒரு பாடத்திட்டமாக: அவர் சொன்ன வரிசையிலேயே, அவரது எடுத்துக்காட்டுகள், படங்கள், திருத்தங்களுடன்.</p>
  <p>சிண்டி தட்டச்சு செய்த ஒவ்வொன்றும் இங்கே உள்ளது. அவர் விளக்கம் சொல்லாமல் எழுதிய வார்த்தைகளுக்கு —
  இலக்கணம், பால், பன்மை, உச்சரிப்பு — விளக்கம் சேர்க்கப்பட்டுள்ளது.</p>
  <p><b>மூன்று தொகுதிகள்:</b> <span class="chip">1 · மறுபார்வை</span> அவர் கற்பித்தது ·
  <span class="chip r">2 · அதற்கு அப்பால்</span> அவர் கற்பிக்காதவை ·
  <span class="chip g">3 · எழுத்துப் பயிற்சி</span> எழுத்துப் பயிற்சிகள்.</p>"""))

# ---- the eight lessons at a glance ----
A(h3("The eight lessons, at a glance", "எட்டு பாடங்கள் — ஒரே பார்வையில்"))
A("""<div class="toc">
<div class="r"><div class="n">1</div><div class="t"><b>11 June</b> — Trial lesson. The sounds of French: accents é è ê, ç, œ, the silent h, c + e / c + a.
  <span class="ta">முதல் பாடம். பிரெஞ்சு ஒலிகள்: உச்சரிப்புக் குறியீடுகள், ç, œ, ஒலிக்காத h.</span></div></div>
<div class="r"><div class="n">2</div><div class="t"><b>13 June</b> — Presenting a person: Paul & Mélanie. The three ways to ask a question. <i>Quel / quelle / quels / quelles</i>. <i>Aimer</i>.
  <span class="ta">ஒருவரை அறிமுகம் செய்தல்: Paul & Mélanie. கேள்வி கேட்கும் மூன்று வழிகள்.</span></div></div>
<div class="r"><div class="n">3</div><div class="t"><b>15 June</b> — Physical description with Astérix & Obélix. Adjective agreement, colours, adjective position.
  <span class="ta">உடல் தோற்ற விவரிப்பு. பெயரடை ஒப்புமை, நிறங்கள், பெயரடையின் இடம்.</span></div></div>
<div class="r"><div class="n">4</div><div class="t"><b>18 June</b> — <i>La famille Dubois</i>. <i>Avoir envie de</i>, <i>faire du</i> / <i>jouer à</i>, hobbies, à + le = au.
  <span class="ta">Dubois குடும்பம். பொழுதுபோக்குகள், à + le = au.</span></div></div>
<div class="r"><div class="n">5</div><div class="t"><b>22 June</b> — <i>Les enfants Dubois</i>. Insects, the extended family, the hyphen that changes meaning, SVO.
  <span class="ta">Dubois குழந்தைகள். பூச்சிகள், விரிவான குடும்பம், அர்த்தத்தை மாற்றும் இணைப்புக்கோடு.</span></div></div>
<div class="r"><div class="n">6</div><div class="t"><b>2 July</b> — <i>Une famille internationale</i>. Countries, nationalities, the <i>gentilé</i>, capital letters.
  <span class="ta">சர்வதேசக் குடும்பம். நாடுகள், தேசிய அடைமொழிகள், பெரிய எழுத்து விதி.</span></div></div>
<div class="r"><div class="n">7</div><div class="t"><b>8 July</b> — The gender of country names. <i>La petite-fille</i> vs <i>la fille petite</i>. (Lesson taken while ill.)
  <span class="ta">நாட்டுப் பெயர்களின் பால். la petite-fille vs la fille petite.</span></div></div>
<div class="r"><div class="n">8</div><div class="t"><b>13 July</b> — Partitive articles <i>du / de la / de l' / des</i>. Fruits and vegetables. Plurals in -x.
  <span class="ta">பகுதி இடைச்சொற்கள். பழங்கள், காய்கறிகள். -x பன்மை.</span></div></div>
</div>""")

# ---- the real exam anchor ----
A(h3("The exam she had in mind for you", "அவர் உங்களுக்காக நினைத்திருந்த தேர்வு"))
A(fig('image33.png', 'Image Cindy sent — the official DELF session',
  "The DELF exam calendar she posted into the chat, unprompted. The top row is the one she meant for you: "
  "<b>A1 and A2</b> — written paper, with the oral spread over the days around it. The four papers are "
  "listening, reading, writing and speaking, 25 points each; the pass mark is 50 out of 100, with a minimum "
  "of 5 in every paper.",
  "அவர் தானாகவே உரையாடலில் இட்ட DELF தேர்வு நாட்காட்டி. முதல் வரிசைதான் அவர் உங்களுக்காக நினைத்தது: "
  "<b>A1 மற்றும் A2</b>. நான்கு பகுதிகள் — கேட்டல், படித்தல், எழுதுதல், பேசுதல்; தலா 25 மதிப்பெண். "
  "தேர்ச்சி 100-க்கு 50; ஒவ்வொரு பகுதியிலும் குறைந்தது 5.", size='figwide'))
A(duo(
  """<p>The four papers are <b>listening</b>, <b>reading</b>, <b>writing</b> and <b>speaking</b>, 25 points
  each. Pass mark 50 out of 100, with a minimum of 5 in each paper.</p>
  <p>Two questions for her if you want to pursue it: <span class="fr">« Est-ce qu'on peut préparer le DELF A2
  ensemble ? »</span> and <span class="fr">« Qu'est-ce que je dois travailler en priorité ? »</span></p>""",
  """<p>நான்கு பகுதிகள்: <b>கேட்டல்</b>, <b>படித்தல்</b>, <b>எழுதுதல்</b>, <b>பேசுதல்</b> — தலா 25 மதிப்பெண்.
  தேர்ச்சி 100-க்கு 50; ஒவ்வொரு பகுதியிலும் குறைந்தது 5.</p>
  <p>தொடர விரும்பினால் அவரிடம் கேட்க இரு கேள்விகள்: <span class="fr">« Est-ce qu'on peut préparer le DELF A2
  ensemble ? »</span> மற்றும் <span class="fr">« Qu'est-ce que je dois travailler en priorité ? »</span></p>"""))

A(pb())

A(tip("How to use every page in this book · இந்தப் புத்தகத்தின் ஒவ்வொரு பக்கத்தையும் பயன்படுத்தும் முறை",
  """<div class="duo"><div>
  <b>Blue</b> is always French. <b>Grey</b> is always Tamil. Boxes with a dashed border and a ✎ are for you to
  fill in — write in the book, it is yours. Green boxes are answer keys: <b>cover them with a sheet of paper
  before you start</b>. Every table has a right-hand column ruled for you to copy the word twice: once looking,
  once not looking. That second copy is where the learning happens.</div>
  <div class="ta-col"><b>நீலம்</b> எப்போதும் பிரெஞ்சு. <b>சாம்பல்</b> எப்போதும் தமிழ். புள்ளிக்கோடு
  எல்லையும் ✎ குறியும் உள்ள பெட்டிகள் நீங்கள் நிரப்புவதற்கு — புத்தகத்திலேயே எழுதுங்கள், இது உங்களுடையது.
  பச்சைப் பெட்டிகள் விடைகள்: <b>தொடங்கும் முன் ஒரு காகிதத்தால் மூடுங்கள்</b>. ஒவ்வொரு அட்டவணையின் வலது
  பக்கத்திலும் வார்த்தையை இரண்டு முறை எழுதக் கோடுகள்: ஒருமுறை பார்த்து, ஒருமுறை பார்க்காமல். இரண்டாவது
  முறைதான் கற்றல் நடக்கும் இடம்.</div></div>"""))

A(pb())

# ============================ LESSON 1 ============================
A(sec("1", "11 June — The sounds of French", "ஜூன் 11 — பிரெஞ்சு ஒலிகள்"))
A(duo("""<p>Your very first message to her said it: <i>"Especially pronunciations!"</i> So she began there, and
  she began with the sentence that unlocks French spelling:</p>""",
  """<p>அவருக்கு நீங்கள் அனுப்பிய முதல் செய்தியிலேயே சொன்னீர்கள்: <i>"குறிப்பாக உச்சரிப்பு!"</i> எனவே அவர்
  அங்கிருந்தே தொடங்கினார் — பிரெஞ்சு எழுத்துமுறையைத் திறக்கும் வாக்கியத்துடன்:</p>"""))

A(rule("« Only vowels have sounds »", "« உயிரெழுத்துகளுக்கு மட்டுமே ஒலி உண்டு »",
  """<div class="duo"><div>This was her opening line, and it is the key to everything that follows. In French
  the accents (é è ê) never sit on consonants — they only ever sit on vowels, because only vowels carry the
  sound that the accent is describing. When you see a mark in a French word, look at the vowel underneath it
  and ask: <i>is this mark telling me how to say it, or only how to spell it?</i></div>
  <div class="ta-col">இதுவே அவரது முதல் வரி, மேலும் இதுவே அனைத்திற்கும் திறவுகோல். பிரெஞ்சில் உச்சரிப்புக்
  குறியீடுகள் (é è ê) மெய்யெழுத்துகளின் மேல் ஒருபோதும் வராது — உயிரெழுத்துகளின் மேல் மட்டுமே, ஏனெனில்
  அக்குறியீடு விவரிக்கும் ஒலியை உயிரெழுத்துகளே சுமக்கின்றன. ஒரு பிரெஞ்சு வார்த்தையில் குறியீட்டைக் கண்டால்,
  கீழே உள்ள உயிரெழுத்தைப் பாருங்கள்: <i>இது எப்படிச் சொல்வது என்கிறதா, அல்லது எப்படி எழுதுவது என்கிறதா?</i></div></div>"""))

A(h3("The five accents she wrote out for you", "அவர் உங்களுக்கு எழுதிக் காட்டிய ஐந்து குறியீடுகள்"))
A(table(("Accent <span class='ta'>குறியீடு</span>", "Her name for it <span class='ta'>அவரது பெயர்</span>",
         "What it does <span class='ta'>என்ன செய்கிறது</span>", "Say it like <span class='ta'>இப்படிச் சொல்லுங்கள்</span>",
         "Examples <span class='ta'>எடுத்துக்காட்டுகள்</span>"),
  [("<b class='fr'>é</b>", "e accent <b>aigu</b><br><span class='ta'>கூர்மையான குறி</span>",
    "<b>High-pitched</b> accent — her words. Closes the mouth, sharpens the sound.<br><span class='ta'>உயர் ஒலிக்குறி. வாயை மூடி ஒலியைக் கூர்மையாக்கும்.</span>",
    "English <i>“ay”</i> in <i>day</i>, but short and clipped — no glide.<br><span class='ta'>தமிழ் <b>ஏ</b> (குறுகியது)</span>",
    "<span class='fr'>ombré, café, parlé, étudiant, écouter, préféré</span>"),
   ("<b class='fr'>è</b>", "e accent <b>grave</b><br><span class='ta'>தாழ்ந்த குறி</span>",
    "<b>Low-pitched</b> accent — her words. Opens the mouth wider.<br><span class='ta'>தாழ் ஒலிக்குறி. வாயை அகலமாகத் திறக்கும்.</span>",
    "English <i>“e”</i> in <i>bed</i>, held slightly longer.<br><span class='ta'>தமிழ் <b>எ</b> (சற்று நீளம்)</span>",
    "<span class='fr'>père, mère, frère, très, après, élève</span>"),
   ("<b class='fr'>ê</b>", "e accent <b>circonflexe</b><br><span class='ta'>கூரைக் குறி</span>",
    "A <b>spelling</b> accent — her words. It marks a letter (usually <i>s</i>) that disappeared centuries ago. Sound = same as <b>è</b>.<br><span class='ta'>இது <b>எழுத்துக்</b> குறி. முன்பு இருந்து மறைந்த எழுத்தை (பொதுவாக s) குறிக்கும். ஒலி è போலவே.</span>",
    "Same as <b>è</b>.<br><span class='ta'>è போலவே</span>",
    "<span class='fr'>être</span> (was <i>estre</i>), <span class='fr'>fenêtre</span> (<i>fenestre</i>), <span class='fr'>forêt</span> (<i>forest</i>), <span class='fr'>hôpital</span>"),
   ("<b class='fr'>ç</b>", "c <b>cédille</b><br><span class='ta'>சிடில்லா</span>",
    "Forces a hard <b>c</b> to be soft before a, o, u.<br><span class='ta'>a, o, u முன் கடின c-ஐ மென்மையாக்கும்.</span>",
    "<b>[s]</b> — like <i>s</i> in <i>sun</i>.<br><span class='ta'>தமிழ் <b>ஸ்</b></span>",
    "<span class='fr'>maçon, français, ça, garçon, leçon, reçu</span>"),
   ("<b class='fr'>œ</b>", "<b>o e dans l'o</b><br><span class='ta'>“o-வுக்குள் o e”</span>",
    "A single letter fused from o+e — she told you it comes from <b>Latin</b>.<br><span class='ta'>o+e இணைந்த ஒரே எழுத்து — <b>லத்தீனிலிருந்து</b> வந்தது என அவர் சொன்னார்.</span>",
    "Rounded <i>“uh”</i>: lips as for <b>o</b>, tongue as for <b>e</b>.<br><span class='ta'>உதடு o போல, நாக்கு e போல</span>",
    "<span class='fr'>un œuf, une sœur, un cœur, un bœuf, une œuvre</span>")]))

A(warn("The one that catches everybody · எல்லோரையும் தடுக்கும் ஒன்று",
  """<div class="duo"><div>Cindy gave you the classic minimal pair. <b>The accent changes the word, not just the sound:</b>
  <br><span class="fr">sur</span> = <b>on</b> (a preposition) — <i>Le livre est <b>sur</b> la table.</i>
  <br><span class="fr">sûr</span> = <b>sure, certain</b> (an adjective) — <i>Je suis <b>sûr</b>.</i>
  <br>Two more of the same family worth knowing now: <span class="fr">a</span> (has) vs <span class="fr">à</span> (to/at);
  <span class="fr">ou</span> (or) vs <span class="fr">où</span> (where) — she used <i>où</i> in <i>Tu habites où ?</i></div>
  <div class="ta-col">சிண்டி இந்த இணையைக் கொடுத்தார். <b>குறியீடு ஒலியை மட்டுமல்ல, வார்த்தையையே மாற்றுகிறது:</b>
  <br><span class="fr">sur</span> = <b>மேல்</b> (இடைச்சொல்)<br><span class="fr">sûr</span> = <b>உறுதி</b> (பெயரடை)
  <br>இதே குடும்பத்தில் இன்னும் இரண்டு: <span class="fr">a</span> (உள்ளது) / <span class="fr">à</span> (-க்கு);
  <span class="fr">ou</span> (அல்லது) / <span class="fr">où</span> (எங்கே).</div></div>"""))

A(h3("c + e, c + a — the rule behind the cédille", "c + e, c + a — சிடில்லாவின் பின்னால் உள்ள விதி"))
A(duo("""<p>She wrote you two short lines that look cryptic in a chat log but are in fact a complete rule:</p>
  <p style="margin-left:4mm"><span class="fr">c + e = se</span> &nbsp;·&nbsp; <span class="fr">c + a = ka</span></p>
  <p>The letter <b>c</b> has two jobs, and the vowel that follows decides which one:</p>""",
  """<p>உரையாடலில் புதிராகத் தோன்றும் இரு வரிகள், உண்மையில் ஒரு முழு விதி:</p>
  <p style="margin-left:4mm"><span class="fr">c + e = se</span> &nbsp;·&nbsp; <span class="fr">c + a = ka</span></p>
  <p><b>c</b> எழுத்துக்கு இரண்டு வேலைகள்; அதன் பின் வரும் உயிரெழுத்து எதைச் செய்வது என்று முடிவு செய்யும்:</p>"""))
A(table(("Followed by <span class='ta'>பின் வருவது</span>", "Sound <span class='ta'>ஒலி</span>",
         "Examples <span class='ta'>எடுத்துக்காட்டுகள்</span>", "Why it matters <span class='ta'>ஏன் முக்கியம்</span>"),
  [("<b>e, i, y</b>", "<b>[s]</b> soft <span class='ta'>மென்மை — ஸ்</span>",
    "<span class='fr'>ce, ceci, cerise, citron, cinéma, cycle</span>",
    "<span class='fr'>une cerise</span> (a cherry) and <span class='fr'>un citron</span> (a lemon) both appeared in Lesson 3.<br><span class='ta'>இரண்டும் பாடம் 3-இல் வந்தன.</span>"),
   ("<b>a, o, u</b>", "<b>[k]</b> hard <span class='ta'>கடினம் — க்</span>",
    "<span class='fr'>car, comme, cube, casquette, couteau, école</span>",
    "<span class='fr'>une casquette</span> (a cap), <span class='fr'>un couteau</span> (a knife), <span class='fr'>l'école</span> — all hers.<br><span class='ta'>இவை அனைத்தும் அவர் கொடுத்தவை.</span>"),
   ("<b>a, o, u</b> but you <i>want</i> [s]", "add the <b>cédille → ç</b> <span class='ta'>சிடில்லா சேர்க்கவும்</span>",
    "<span class='fr'>maçon, garçon, français, ça, leçon, reçu, façade</span>",
    "Her example was <span class='fr'>maçon</span> (a bricklayer). Without the tail it would be <i>ma-kon</i>.<br><span class='ta'>வால் இல்லாவிட்டால் <i>ma-kon</i> ஆகிவிடும்.</span>")]))

A(rule("The same logic runs on g", "இதே தர்க்கம் g-க்கும் பொருந்தும்",
  """<div class="duo"><div>Cindy did not say this, but it is the twin of what she taught and it costs you nothing to
  learn today: <b>g + e/i/y = [ʒ]</b> (soft, like the <i>s</i> in <i>measure</i>) — <span class="fr">gentil, girafe, gymnase</span>;
  <b>g + a/o/u = [g]</b> (hard) — <span class="fr">gare, gomme, légume</span>. And where French wants the soft sound
  before a/o, it inserts an <b>e</b>: <span class="fr">nous man<b>ge</b>ons</span>, <span class="fr">un pi<b>ge</b>on</span>.
  Her word <span class="fr">gentil</span> (kind, Lesson 5) is exactly this.</div>
  <div class="ta-col">சிண்டி இதைச் சொல்லவில்லை, ஆனால் இது அவர் கற்பித்ததின் இரட்டை; இன்றே கற்றுக்கொள்ளலாம்:
  <b>g + e/i/y = [ʒ]</b> (மென்மை) — <span class="fr">gentil, girafe</span>; <b>g + a/o/u = [g]</b> (கடினம்) —
  <span class="fr">gare, légume</span>. a/o முன் மென்மை வேண்டுமானால் <b>e</b> சேர்க்கப்படும்:
  <span class="fr">nous man<b>ge</b>ons</span>. அவர் கொடுத்த <span class="fr">gentil</span> இதற்கு உதாரணம்.</div></div>"""))

A(h3("The silent h — « no h sound »", "ஒலிக்காத h — « h ஒலி இல்லை »"))
A(duo("""<p>She wrote it in four words: <b>no h sound</b>. French has the letter but not the breath. <span class="fr">Un homme</span>
  is <i>“un-omm”</i>. <span class="fr">L'hôpital</span> is <i>“lo-pital”</i>. <span class="fr">Habiter</span> — the verb she used
  constantly in Lesson 2 — is <i>“a-bi-té”</i>.</p>
  <p>There is a second layer she did not have time for. French has <b>two</b> kinds of silent h:</p>
  <ul><li><b>h muet</b> (mute h) — behaves as if the letter were not there. The article contracts:
    <span class="fr">l'homme, l'hôtel, l'heure, l'hiver</span>.</li>
  <li><b>h aspiré</b> (aspirated h) — still silent, but it <i>blocks</i> contraction and liaison:
    <span class="fr">le héros, la haine, le hibou, les / haricots</span> (no linking sound).</li></ul>
  <p>Her Lesson 8 word <span class="fr">des haricots</span> (beans) is an <b>h aspiré</b> — you say <i>“dé-arico”</i>,
  never <i>“dé-zarico”</i>. It is a detail even advanced learners get wrong.</p>""",
  """<p>அவர் நான்கு வார்த்தைகளில் எழுதினார்: <b>h ஒலி இல்லை</b>. பிரெஞ்சில் எழுத்து உண்டு, மூச்சு இல்லை.
  <span class="fr">Un homme</span> = “அன்-ஒம்”. <span class="fr">Habiter</span> = “அ-பி-தே”.</p>
  <p>அவருக்கு நேரம் இல்லாத இரண்டாம் அடுக்கு: பிரெஞ்சில் <b>இரண்டு</b> வகை ஒலிக்காத h உண்டு:</p>
  <ul><li><b>h muet</b> — எழுத்தே இல்லாதது போல. இடைச்சொல் சுருங்கும்: <span class="fr">l'homme, l'heure</span>.</li>
  <li><b>h aspiré</b> — ஒலிக்காது, ஆனால் சுருக்கத்தையும் இணைப்பையும் <b>தடுக்கும்</b>:
    <span class="fr">le héros, les / haricots</span>.</li></ul>
  <p>பாடம் 8-இல் வந்த <span class="fr">des haricots</span> — இது <b>h aspiré</b>. “தே-அரிகோ” என்று சொல்ல வேண்டும்,
  “தே-ஸரிகோ” அல்ல. நல்ல மாணவர்களே தவறும் இடம் இது.</p>"""))

A(h3("The words she used to demonstrate", "அவர் விளக்கப் பயன்படுத்திய வார்த்தைகள்"))
A(vocab([
  ("une loupe", "a magnifying glass", "பூதக்கண்ணாடி"),
  ("un parfum", "a perfume (final <i>m</i> silent, nasal <i>un</i>)", "வாசனைத் திரவியம்"),
  ("ombré", "shaded, shadowed — her example of <b>é</b>", "நிழலிடப்பட்ட"),
  ("un maçon", "a bricklayer, a mason — her example of <b>ç</b>", "கொத்தனார்"),
  ("sur", "on, upon (preposition)", "மேல்"),
  ("sûr", "sure, certain (adjective)", "உறுதியான"),
  ("un œuf", "an egg — the <b>œ</b> letter", "முட்டை"),
  ("une sœur", "a sister — <b>œ</b> again, and her word from Lesson 2", "சகோதரி"),
  ("la SNCF", "the French national railway company — <i>Société Nationale des Chemins de fer Français</i>. Say the letters: <i>ess-enn-cé-eff</i>.", "பிரெஞ்சு தேசிய இரயில்வே"),
]))

A(tip("She sent you three links that day · அன்று அவர் அனுப்பிய மூன்று இணைப்புகள்",
  """<div class="duo"><div><b>The sound chart (PDF, red):</b> podcastfrancaisfacile.com/wp-content/uploads/2016/11/les-sons-du-francais-rouge2.pdf
  — print it and pin it above your desk.<br>
  <b>The interactive table of French sounds:</b> podcastfrancaisfacile.com/phonetique-prononciation/tableau-des-sons-du-francais.html
  — click each sound, repeat it five times.<br>
  <b>Course 3c-2:</b> podcastfrancaisfacile.com/cours/cours-3c-2.html<br>
  Do fifteen minutes of these before every writing session — the sound has to be in your ear before it comes out of your pen.</div>
  <div class="ta-col"><b>ஒலி அட்டவணை (PDF):</b> அச்சிட்டு மேசைக்கு மேல் ஒட்டுங்கள்.<br>
  <b>ஊடாடும் ஒலி அட்டவணை:</b> ஒவ்வொரு ஒலியையும் சொடுக்கி ஐந்து முறை திரும்பச் சொல்லுங்கள்.<br>
  ஒவ்வொரு எழுத்துப் பயிற்சிக்கும் முன் பதினைந்து நிமிடங்கள் — பேனாவிலிருந்து வருவதற்கு முன் ஒலி காதில்
  இருக்க வேண்டும்.</div></div>"""))

A(drill("Writing drill 1.1 — copy each word three times, saying it aloud",
        "எழுத்துப் பயிற்சி 1.1 — ஒவ்வொரு வார்த்தையையும் சத்தமாகச் சொல்லி மூன்று முறை எழுதுங்கள்",
  trace("ACCENTS · உச்சரிப்புக் குறியீடுகள்", [
    ("é — un café, ombré, étudiant", ""), ("è — mon père, très, après", ""),
    ("ê — être, la fenêtre, la forêt", ""), ("ç — un maçon, français, un garçon", ""),
    ("œ — un œuf, ma sœur, le cœur", ""), ("sur / sûr — Je suis sûr.", ""),
  ])))

A(drill("Writing drill 1.2 — put the missing accent on every underlined vowel, then rewrite the whole sentence",
        "எழுத்துப் பயிற்சி 1.2 — விடுபட்ட குறியீட்டைச் சேர்த்து, முழு வாக்கியத்தையும் மீண்டும் எழுதுங்கள்",
  qlines([
    "1. Mon p<b>e</b>re est tr<b>e</b>s g<b>e</b>n<b>e</b>reux. <span class='ta'>என் தந்தை மிகவும் தாராளமானவர்.</span>",
    "2. Je suis <b>e</b>tudiant et j'habite <b>a</b> Bruxelles. <span class='ta'>நான் மாணவன், பிரஸ்ஸல்ஸில் வசிக்கிறேன்.</span>",
    "3. Le gar<b>c</b>on fran<b>c</b>ais mange un <b>oe</b>uf. <span class='ta'>பிரெஞ்சு சிறுவன் ஒரு முட்டை சாப்பிடுகிறான்.</span>",
    "4. Ma s<b>oe</b>ur pr<b>e</b>f<b>e</b>re la for<b>e</b>t. <span class='ta'>என் சகோதரி காட்டை விரும்புகிறாள்.</span>",
    "5. Es-tu s<b>u</b>r que le livre est s<b>u</b>r la table ? <span class='ta'>புத்தகம் மேசை மேல் இருப்பது உறுதியா?</span>",
    "6. Il y a une f<b>e</b>n<b>e</b>tre dans l'h<b>o</b>pital. <span class='ta'>மருத்துவமனையில் ஒரு ஜன்னல் உள்ளது.</span>",
  ])))
A(key("""1. Mon <b class="fr">père</b> est <b class="fr">très généreux</b>. &nbsp; 2. Je suis <b class="fr">étudiant</b> et j'habite <b class="fr">à</b> Bruxelles. &nbsp;
3. Le <b class="fr">garçon français</b> mange un <b class="fr">œuf</b>. &nbsp; 4. Ma <b class="fr">sœur préfère</b> la <b class="fr">forêt</b>. &nbsp;
5. Es-tu <b class="fr">sûr</b> que le livre est <b class="fr">sur</b> la table ? &nbsp; 6. Il y a une <b class="fr">fenêtre</b> dans <b class="fr">l'hôpital</b>."""))

A(drill("Writing drill 1.3 — soft or hard? Write [s] or [k] beside each c, then copy the word",
        "எழுத்துப் பயிற்சி 1.3 — மென்மையா கடினமா? ஒவ்வொரு c-க்கும் [s] அல்லது [k] எழுதி, வார்த்தையை நகலெடுங்கள்",
  numlines(["une <b class='fr'>c</b>erise", "une <b class='fr'>c</b>asquette", "un <b class='fr'>c</b>outeau",
            "un <b class='fr'>c</b>itron", "un gar<b class='fr'>ç</b>on", "l'é<b class='fr'>c</b>ole",
            "le <b class='fr'>c</b>inéma", "fran<b class='fr'>ç</b>ais", "un <b class='fr'>c</b>afard",
            "une le<b class='fr'>ç</b>on"])))
A(key("1 [s] · 2 [k] · 3 [k] · 4 [s] · 5 [s] · 6 [k] · 7 [s] · 8 [s] · 9 [k] · 10 [s]"))

A(drill("Writing drill 1.4 — free writing", "எழுத்துப் பயிற்சி 1.4 — சுதந்திரமாக எழுதுங்கள்",
  """<p>Write five sentences of your own, each containing at least two accented letters. Underline every accent.
  <span class="ta">உங்கள் சொந்த ஐந்து வாக்கியங்கள் எழுதுங்கள் — ஒவ்வொன்றிலும் குறைந்தது இரண்டு
  உச்சரிப்புக் குறியீடுகள். ஒவ்வொரு குறியீட்டையும் அடிக்கோடிடுங்கள்.</span></p>""" + lines(6)))
A(pb())

# ============================ LESSON 2 ============================
A(sec("2", "13 June — Presenting a person, and asking questions", "ஜூன் 13 — ஒருவரை அறிமுகம் செய்தல், கேள்வி கேட்டல்"))
A(duo("""<p>She opened with the greeting she would use at the start of every single lesson after this one. Learn
  it as a reflex — she will use it again, and you should answer without a pause.</p>""",
  """<p>இதற்குப் பிறகு ஒவ்வொரு பாடத்தின் தொடக்கத்திலும் அவர் பயன்படுத்திய வாழ்த்துடன் தொடங்கினார். இதை ஒரு
  தன்னிச்சையான பதிலாகக் கற்றுக்கொள்ளுங்கள் — அடுத்த முறையும் அவர் இதைக் கேட்பார்.</p>"""))
A(dialog("Her opening — and your answer · அவரது தொடக்கம் — உங்கள் பதில்", [
  ("Cindy :", "<span class='fr'>Bonjour ! Quoi de neuf ?</span> &nbsp; <span class='gloss'>Hello! What's new?</span>",
   "வணக்கம்! புதிதாக என்ன?"),
  ("Vous :", "<span class='fr'>Rien de neuf, et vous ?</span> &nbsp; <span class='gloss'>Nothing new, and you?</span>",
   "புதிதாக ஒன்றுமில்லை, நீங்கள்?"),
  ("Vous :", "<span class='fr'>Beaucoup de choses, en fait !</span> &nbsp; <span class='gloss'>Actually, a lot!</span> — save this one for your next lesson.",
   "உண்மையில், நிறைய! — அடுத்த வகுப்புக்கு இதை வைத்திருங்கள்."),
]))

A(h3("Text 1 — Paul (she typed this out for you word for word)", "உரை 1 — Paul (அவர் வார்த்தைக்கு வார்த்தை எழுதியது)"))
A(txt("""<b>Paul a 33 ans. Il travaille. Il est professeur. Il habite à Rambouillet. C'est à côté de Paris.
  Il parle anglais et espagnol. Il parle aussi italien. Il n'est pas français. Il est canadien.</b>"""))
A(duo("""<p><b>Translation.</b> Paul is 33. He works. He is a teacher. He lives in Rambouillet. It's next to Paris.
  He speaks English and Spanish. He also speaks Italian. He is not French. He is Canadian.</p>
  <p><b>Notice three things.</b> (1) Age is not "is" but <b>has</b>: <span class="fr">il <b>a</b> 33 ans</span> —
  literally <i>he has 33 years</i>. Never <i>il est 33</i>. (2) Professions take <b>no article</b> after
  <i>être</i>: <span class="fr">il est professeur</span>, not <i>il est un professeur</i>. (3) Languages and
  nationalities as adjectives take <b>no capital letter</b>: <span class="fr">anglais, espagnol, italien,
  canadien</span> — small letters. This becomes a whole lesson on 2 July.</p>""",
  """<p><b>மொழிபெயர்ப்பு.</b> Paul-க்கு 33 வயது. அவர் வேலை செய்கிறார். ஆசிரியர். Rambouillet-இல் வசிக்கிறார்.
  அது பாரிஸுக்கு அருகில். ஆங்கிலமும் ஸ்பானிஷும் பேசுகிறார். இத்தாலியனும் பேசுகிறார். அவர் பிரெஞ்சுக்காரர் அல்ல.
  கனடியர்.</p>
  <p><b>மூன்று விஷயங்களைக் கவனியுங்கள்.</b> (1) வயதுக்கு "இருக்கிறார்" அல்ல, <b>வைத்திருக்கிறார்</b>:
  <span class="fr">il <b>a</b> 33 ans</span>. (2) தொழிலுக்கு முன் <b>இடைச்சொல் இல்லை</b>:
  <span class="fr">il est professeur</span>. (3) மொழி/தேசிய அடைமொழிகளுக்கு <b>பெரிய எழுத்து இல்லை</b>.</p>"""))
A(vocab([
  ("trente-trois (33)", "thirty-three — she spelled it out for you", "முப்பத்து மூன்று"),
  ("à côté de", "next to, beside", "அருகில்"),
  ("aussi", "also, too", "மேலும், கூட"),
  ("travailler", "to work — <i>il travaille</i>", "வேலை செய்ய"),
  ("habiter", "to live (somewhere) — <i>il habite</i>", "வசிக்க"),
  ("parler", "to speak — <i>il parle</i>", "பேச"),
  ("la profession", "the job, occupation", "தொழில்"),
  ("la nationalité", "nationality", "தேசியம்"),
]))

A(h3("The six questions she asked about Paul", "Paul பற்றி அவர் கேட்ட ஆறு கேள்விகள்"))
A(table(("Her question <span class='ta'>அவரது கேள்வி</span>", "English", "தமிழ்", "The answer in the text <span class='ta'>உரையில் விடை</span>"),
 [("<span class='fr'>Comment il s'appelle ?</span>", "What is his name?", "அவர் பெயர் என்ன?", "<span class='fr'>Il s'appelle Paul.</span>"),
  ("<span class='fr'>Quel âge il a ?</span>", "How old is he?", "அவருக்கு என்ன வயது?", "<span class='fr'>Il a 33 ans.</span>"),
  ("<span class='fr'>Quelle est sa profession ?</span>", "What is his job?", "அவரது தொழில் என்ன?", "<span class='fr'>Il est professeur.</span>"),
  ("<span class='fr'>Il habite où ?</span>", "Where does he live?", "எங்கே வசிக்கிறார்?", "<span class='fr'>Il habite à Rambouillet.</span>"),
  ("<span class='fr'>Il parle quelle langue ?</span>", "What language does he speak?", "எந்த மொழி பேசுகிறார்?", "<span class='fr'>Il parle anglais, espagnol et italien.</span>"),
  ("<span class='fr'>Quelle est sa nationalité ?</span>", "What is his nationality?", "அவரது தேசியம் என்ன?", "<span class='fr'>Il est canadien.</span>")]))

A(h3("Text 2 — Mélanie", "உரை 2 — Mélanie"))
A(txt("""<b>Mélanie est jeune. Elle a 19 ans. Elle ne travaille pas. Elle n'est pas lycéenne. Elle est étudiante.
  Elle parle anglais et coréen. Elle habite à Nantes. Elle est française.</b>"""))
A(duo("""<p><b>Translation.</b> Mélanie is young. She is 19. She does not work. She is not a high-school student.
  She is a university student. She speaks English and Korean. She lives in Nantes. She is French.</p>
  <p>This text exists to teach you <b>the negative</b>. French wraps the verb in two pieces:
  <b>ne … pas</b>. <span class="fr">Elle <b>ne</b> travaille <b>pas</b>.</span> Before a vowel <i>ne</i> becomes
  <i>n'</i>: <span class="fr">Elle <b>n'</b>est <b>pas</b> lycéenne.</span> You did this yourself in the chat —
  you wrote <span class="fr">je ne parle pas hindi</span>, and it was right.</p>""",
  """<p><b>மொழிபெயர்ப்பு.</b> Mélanie இளையவள். 19 வயது. வேலை செய்யவில்லை. மேல்நிலைப் பள்ளி மாணவி அல்ல.
  பல்கலைக்கழக மாணவி. ஆங்கிலமும் கொரியனும் பேசுகிறாள். Nantes-இல் வசிக்கிறாள். பிரெஞ்சுக்காரி.</p>
  <p>இந்த உரை <b>மறுப்பு</b> வடிவத்தைக் கற்பிக்கிறது. பிரெஞ்சு வினைச்சொல்லை இரண்டு துண்டுகளால் சுற்றுகிறது:
  <b>ne … pas</b>. உயிரெழுத்துக்கு முன் <i>ne</i> → <i>n'</i>. நீங்களே உரையாடலில் <span class="fr">je ne parle
  pas hindi</span> என்று சரியாக எழுதினீர்கள்.</p>"""))
A(vocab([
  ("dix-neuf (19)", "nineteen — she spelled it out", "பத்தொன்பது"),
  ("jeune", "young (same form for m. and f.)", "இளம், இளையவர்"),
  ("une lycéenne", "a high-school girl (<i>un lycéen</i> = boy)", "மேல்நிலைப் பள்ளி மாணவி"),
  ("une étudiante", "a (female) university student (<i>un étudiant</i>)", "பல்கலைக்கழக மாணவி"),
  ("ne … pas", "the negative wrapper", "மறுப்புச் சட்டகம்"),
  ("Est-elle étudiante ?", "Is she a student? — her inversion example", "அவள் மாணவியா?"),
]))

A(h3("The three ways to ask a question — her core lesson", "கேள்வி கேட்கும் மூன்று வழிகள் — அவரது மையப் பாடம்"))
A(duo("""<p>This is the most useful single page in the whole book. French offers three registers for the same
  question, and Cindy ranked them for you: <b>inversion is the most polite</b> — her exact words.</p>""",
  """<p>இந்தப் புத்தகத்தின் மிக முக்கியமான பக்கம் இது. ஒரே கேள்விக்கு பிரெஞ்சு மூன்று நிலைகளைத் தருகிறது;
  சிண்டி வரிசைப்படுத்தினார்: <b>தலைகீழ் வடிவமே மிகவும் மரியாதையானது</b> — அவரது சொற்களே.</p>"""))
A(table(("Register <span class='ta'>நிலை</span>", "How it is built <span class='ta'>அமைப்பு</span>",
         "Example: “What's your name?” <span class='ta'>எடுத்துக்காட்டு</span>",
         "Example: “Where do you live?”", "Use it when <span class='ta'>எப்போது</span>"),
 [("<b>1 · Intonation</b><br><span class='ta'>ஏற்ற இறக்கம்</span>",
   "Statement order, question word at the <b>end</b>, voice rises.<br><span class='ta'>சாதாரண வரிசை, கேள்விச்சொல் <b>இறுதியில்</b>.</span>",
   "<span class='fr'>Tu t'appelles <b>comment</b> ?</span>", "<span class='fr'>Tu habites <b>où</b> ?</span>",
   "Friends, family, speaking fast.<br><span class='ta'>நண்பர்கள், குடும்பம்.</span>"),
  ("<b>2 · Est-ce que</b><br><span class='ta'>நடுநிலை</span>",
   "Question word + <b>est-ce que</b> + normal order.<br><span class='ta'>கேள்விச்சொல் + est-ce que + சாதாரண வரிசை.</span>",
   "<span class='fr'>Comment <b>est-ce que</b> tu t'appelles ?</span>", "<span class='fr'>Où <b>est-ce que</b> tu habites ?</span>",
   "Neutral, always safe, easiest to build.<br><span class='ta'>நடுநிலை, எப்போதும் பாதுகாப்பானது.</span>"),
  ("<b>3 · Inversion</b><br><span class='ta'>தலைகீழ் — <b>மிக மரியாதை</b></span>",
   "Question word + <b>verb-subject</b> joined by a hyphen.<br><span class='ta'>கேள்விச்சொல் + <b>வினை-எழுவாய்</b>, இணைப்புக்கோட்டுடன்.</span>",
   "<span class='fr'>Comment <b>t'appelles-tu</b> ?</span>", "<span class='fr'>Où <b>habites-tu</b> ?</span>",
   "Writing, exams, strangers, formal speech. <b>Use this in the DELF.</b><br><span class='ta'>எழுத்து, தேர்வு, அறிமுகமில்லாதவர். <b>DELF-இல் இதைப் பயன்படுத்துங்கள்.</b></span>")]))

A(rule("est-ce que has a second job", "est-ce que-வுக்கு இரண்டாவது வேலையும் உண்டு",
  """<div class="duo"><div>Cindy noted it in three words: <i>est-ce que &gt; yes / no</i>. On its own, with
  <b>no question word in front</b>, <b>est-ce que</b> turns any statement into a yes/no question:
  <br><span class="fr">Tu as un frère.</span> → <span class="fr"><b>Est-ce que</b> tu as un frère ?</span>
  <br><span class="fr">Tu es marié.</span> → <span class="fr"><b>Est-ce que</b> tu es marié ?</span>
  <br>That is the exact question you tried to write on 15 June — you wrote <i>Tu es marié?</i>, which is
  correct at register 1. At register 2 it becomes <span class="fr">Est-ce que tu es marié ?</span>, and at
  register 3 <span class="fr">Es-tu marié ?</span></div>
  <div class="ta-col">சிண்டி மூன்று வார்த்தைகளில் குறித்தார்: <i>est-ce que &gt; yes / no</i>. முன்னால்
  <b>கேள்விச்சொல் இல்லாமல்</b> தனியாக வந்தால், <b>est-ce que</b> எந்த வாக்கியத்தையும் ஆம்/இல்லை கேள்வியாக
  மாற்றும். ஜூன் 15 அன்று நீங்கள் எழுதிய <i>Tu es marié?</i> — நிலை 1-இல் சரி. நிலை 2:
  <span class="fr">Est-ce que tu es marié ?</span> நிலை 3: <span class="fr">Es-tu marié ?</span></div></div>"""))

A(fig('image2.png', 'Image Cindy sent — the seven questions',
  "The seven questions of a first conversation, in the intonation register: "
  "<span class='fr'>Comment tu t'appelles ? / Quel âge as-tu ? / Où est-ce que tu habites ? / Tu es née où ? / "
  "Quelle est ta nationalité ? / Quelle est la date de ton anniversaire ? / Qu'est-ce que tu aimes ?</span>",
  "முதல் உரையாடலின் ஏழு கேள்விகள். இவற்றை மனப்பாடம் செய்யுங்கள் — DELF வாய்மொழித் தேர்வின் முதல் பகுதி இதுவே."))

A(h3("Tu, and the verb that comes with it", "Tu — அதனுடன் வரும் வினைச்சொல்"))
A(duo("""<p>She noted: <b>tu &gt; you, singular, familiar</b>. And she warned you about a trap that is invisible
  in speech: <span class="fr">tu</span> (you) and <span class="fr">tout</span> (all) sound almost identical but
  are different words. She wrote them side by side for exactly that reason.</p>
  <p>She also gave you the second-person forms of the questions:</p>""",
  """<p>அவர் குறித்தார்: <b>tu &gt; நீ, ஒருமை, நெருக்கம்</b>. பேச்சில் தெரியாத ஒரு கண்ணியை எச்சரித்தார்:
  <span class="fr">tu</span> (நீ) மற்றும் <span class="fr">tout</span> (எல்லாம்) — ஒலி கிட்டத்தட்ட ஒன்று,
  வார்த்தைகள் வேறு. அதனாலேயே இரண்டையும் அருகருகே எழுதினார்.</p>"""))
A(table(("Intonation <span class='ta'>ஏற்ற இறக்கம்</span>", "Inversion (polite) <span class='ta'>தலைகீழ் (மரியாதை)</span>", "English", "தமிழ்"),
 [("<span class='fr'>Tu t'appelles comment ?</span>", "<span class='fr'>Comment t'appelles-tu ?</span>", "What's your name?", "உன் பெயர் என்ன?"),
  ("<span class='fr'>Tu as quel âge ?</span>", "<span class='fr'>Quel âge as-tu ?</span>", "How old are you?", "உனக்கு என்ன வயது?"),
  ("<span class='fr'>Tu habites où ?</span>", "<span class='fr'>Où habites-tu ?</span>", "Where do you live?", "நீ எங்கே வசிக்கிறாய்?"),
  ("<span class='fr'>Tu es né(e) où ?</span>", "<span class='fr'>Où es-tu né(e) ?</span>", "Where were you born?", "நீ எங்கே பிறந்தாய்?"),
  ("<span class='fr'>Tu veux quoi ?</span>", "<span class='fr'>Que veux-tu ?</span>", "What do you want?", "உனக்கு என்ன வேண்டும்?"),
  ("<span class='fr'>Tu aimes quoi ?</span>", "<span class='fr'>Qu'est-ce que tu aimes ?</span>", "What do you like?", "உனக்கு எது பிடிக்கும்?")]))
A(vocab([
  ("naître", "to be born (infinitive) — she wrote <i>née &gt; naître</i>", "பிறக்க"),
  ("né / née", "born (m. / f.) — <i>Je suis <b>né</b> en Inde.</i>", "பிறந்த"),
  ("ta / ton / tes", "your (f. sing. / m. sing. / plural) — <i>ta</i> goes with <i>tu</i>", "உன்னுடைய"),
  ("tout", "all, everything — <b>not</b> <i>tu</i>", "எல்லாம்"),
]))

A(h3("Quel — the word that has to agree", "Quel — ஒப்புமை கொள்ள வேண்டிய சொல்"))
A(rule("Quel + noun. Four forms, and you must pick the right one.", "Quel + பெயர்ச்சொல். நான்கு வடிவங்கள்.",
 """<div class="duo"><div>Cindy laid this out as a square, and it is worth memorising as a square. <b>Quel</b> is an
 adjective, so it copies the gender and number of the noun that follows it. It never stands alone.</div>
 <div class="ta-col">சிண்டி இதை ஒரு சதுரமாக எழுதினார்; சதுரமாகவே மனப்பாடம் செய்யுங்கள். <b>Quel</b> ஒரு பெயரடை;
 எனவே அதன் பின் வரும் பெயர்ச்சொல்லின் பாலையும் எண்ணிக்கையையும் நகலெடுக்கிறது. தனியாக நிற்காது.</div></div>""" +
 table(("", "Masculine <span class='ta'>ஆண்பால்</span>", "Feminine <span class='ta'>பெண்பால்</span>"),
  [("<b>Singular</b><br><span class='ta'>ஒருமை</span>",
    "<b class='fr'>quel</b><br><span class='fr'>Quel âge as-tu ?</span> <span class='gloss'>What age?</span>",
    "<b class='fr'>quelle</b><br><span class='fr'>Quelle est ta profession ?</span> <span class='gloss'>What job?</span>"),
   ("<b>Plural</b><br><span class='ta'>பன்மை</span>",
    "<b class='fr'>quels</b><br><span class='fr'>Quels livres aimes-tu ?</span> <span class='gloss'>Which books?</span>",
    "<b class='fr'>quelles</b><br><span class='fr'>Quelles langues parles-tu ?</span> <span class='gloss'>Which languages?</span>")]) +
 """<p style="margin-top:2mm"><b>All four are pronounced identically — [kɛl].</b> The difference exists only on
 paper, which is exactly why it costs marks in a written exam and nothing at all in conversation.
 <span class="ta">நான்கும் ஒரே மாதிரி உச்சரிக்கப்படுகின்றன — [kɛl]. வேறுபாடு காகிதத்தில் மட்டுமே; அதனால்தான்
 எழுத்துத் தேர்வில் மதிப்பெண் இழக்க வைக்கிறது.</span></p>"""))

A(h3("Quoi, que, qu'est-ce que — three ways to say “what”", "Quoi, que, qu'est-ce que — “என்ன” சொல்ல மூன்று வழிகள்"))
A(duo("""<p>Cindy's note was compact: <i>quoi / que : what — quoi &gt; at the end of the sentence, or alone.</i>
  Unpacked, the rule is:</p>
  <ul>
  <li><b>quoi</b> — at the <b>end</b>, or standing alone, or after a preposition.
    <span class="fr">Tu veux quoi ? · Quoi ?! · Avec quoi ?</span></li>
  <li><b>que</b> — at the <b>beginning</b>, followed by inversion. Formal.
    <span class="fr">Que veux-tu ?</span></li>
  <li><b>qu'est-ce que</b> — at the beginning, followed by normal order. The everyday workhorse.
    <span class="fr">Qu'est-ce que tu veux ?</span></li>
  </ul>
  <p>Her two examples were the same question in two registers: <span class="fr">Tu veux quoi ?</span> and
  <span class="fr">Qu'est-ce que tu veux ?</span> — both “What do you want?”</p>""",
  """<p>சிண்டியின் குறிப்பு சுருக்கமானது: <i>quoi &gt; வாக்கியத்தின் இறுதியில், அல்லது தனியாக.</i> விரிவாக:</p>
  <ul>
  <li><b>quoi</b> — <b>இறுதியில்</b>, தனியாக, அல்லது இடைச்சொல்லுக்குப் பின்.</li>
  <li><b>que</b> — <b>தொடக்கத்தில்</b>, தலைகீழ் வடிவத்துடன். முறையானது.</li>
  <li><b>qu'est-ce que</b> — தொடக்கத்தில், சாதாரண வரிசையுடன். அன்றாடப் பயன்பாடு.</li>
  </ul>
  <p>அவரது இரு எடுத்துக்காட்டுகள் ஒரே கேள்வியின் இரு நிலைகள்: <span class="fr">Tu veux quoi ?</span> /
  <span class="fr">Qu'est-ce que tu veux ?</span></p>"""))

A(fig('image3.png', 'Image Cindy sent — Les mots interrogatifs',
  "Her poster of the question words: <span class='fr'>combien (de)</span> how much/many · <span class='fr'>qui</span> who · "
  "<span class='fr'>comment</span> how · <span class='fr'>quand</span> when · <span class='fr'>où</span> where · "
  "<span class='fr'>pourquoi</span> why · <span class='fr'>que / qu' / quoi</span> what · "
  "<span class='fr'>quel-quels-quelle-quelles</span> which. Note the footnote: <i>quoi</i> is never used at the "
  "start of a question — use <i>que</i> at the beginning and <i>quoi</i> at the end or alone.",
  "கேள்விச் சொற்களின் சுவரொட்டி. கீழே உள்ள குறிப்பைக் கவனியுங்கள்: கேள்வியின் தொடக்கத்தில் <i>quoi</i> வராது — "
  "தொடக்கத்தில் <i>que</i>, இறுதியில் அல்லது தனியாக <i>quoi</i>."))

A(h4("The eight question words, with a model sentence each", "எட்டு கேள்விச் சொற்கள் — ஒவ்வொன்றுக்கும் ஒரு மாதிரி வாக்கியம்"))
A(vocab([
  ("qui", "who — <span class='fr'>Qui est-ce ? / Qui parle français ?</span>", "யார்"),
  ("que / qu'est-ce que / quoi", "what — <span class='fr'>Qu'est-ce que c'est ?</span>", "என்ன"),
  ("quand", "when — <span class='fr'>Quand arrives-tu ?</span>", "எப்போது"),
  ("où", "where — <span class='fr'>Où habites-tu ?</span>", "எங்கே"),
  ("comment", "how — <span class='fr'>Comment ça va ?</span>", "எப்படி"),
  ("pourquoi", "why — <span class='fr'>Pourquoi es-tu ici ?</span>", "ஏன்"),
  ("combien (de)", "how much, how many — <span class='fr'>Combien de frères as-tu ?</span>", "எத்தனை, எவ்வளவு"),
  ("quel / quelle / quels / quelles", "which, what + noun — <span class='fr'>Quelle heure est-il ?</span>", "எந்த"),
]))

A(rule("Qu'est-ce que c'est ? — her last line of the lesson", "Qu'est-ce que c'est ? — பாடத்தின் கடைசி வரி",
  """<div class="duo"><div><span class="fr" style="font-size:11pt">Qu'est-ce que c'est ?</span> = <b>What is it?</b>
  This is the single most useful sentence a beginner owns. Point at anything you cannot name and say it. The
  answer will always start <span class="fr">C'est …</span> (It's …) or <span class="fr">Ce sont …</span> (They
  are …). Cindy used it to make you name the objects in her pictures.</div>
  <div class="ta-col"><span class="fr" style="font-size:11pt">Qu'est-ce que c'est ?</span> = <b>இது என்ன?</b>
  தொடக்கநிலை மாணவருக்கு மிகவும் பயனுள்ள வாக்கியம். பெயர் தெரியாத எதையும் சுட்டிக்காட்டிச் சொல்லுங்கள். விடை
  எப்போதும் <span class="fr">C'est …</span> அல்லது <span class="fr">Ce sont …</span> என்று தொடங்கும்.</div></div>"""))

A(h3("The vocabulary of this lesson", "இந்தப் பாடத்தின் சொற்கள்"))
A(vocab([
  ("aimer", "to love, to like — <i>j'aime, tu aimes, il aime</i>", "விரும்ப, நேசிக்க"),
  ("une apostrophe (')", "an apostrophe — she named the mark for you", "மேற்கோள் புள்ளி"),
  ("un frère", "a brother", "சகோதரன்"),
  ("une sœur", "a sister", "சகோதரி"),
  ("une auto", "a car (Swiss / Belgian usage)", "கார் (சுவிஸ்)"),
  ("une voiture", "a car (standard French usage)", "கார் (பிரான்சு)"),
  ("un véhicule", "a vehicle", "வாகனம்"),
  ("célibataire", "single, unmarried (same form m. and f.)", "திருமணமாகாத"),
  ("marié / mariée", "married (m. / f.)", "திருமணமான"),
  ("un appartement", "a flat, an apartment", "குடியிருப்பு"),
  ("vingt-cinq (25)", "twenty-five", "இருபத்தைந்து"),
  ("suisse", "Swiss — <span class='fr'>Je suis suisse.</span>", "சுவிஸ்"),
  ("informaticien / informaticienne", "IT specialist — from the André card", "தகவல் தொழில்நுட்பர்"),
]))

A(fig('image4.png', 'Image Cindy sent — the André exercise (your homework of 13 June)',
  "André answers eight times; you had to write the eight <b>questions</b>. His answers: "
  "<span class='fr'>1. Je suis suisse. 2. Oui, j'ai un frère et une sœur. 3. J'aime le cinéma et le sport. "
  "4. Oui, j'ai une auto et un appartement. 5. Non, je ne suis pas marié, je suis célibataire. 6. J'ai 25 ans. "
  "7. Je m'appelle André. 8. Je suis informaticien.</span> Cindy's note at the end of that lesson: "
  "<b>“finish the written questions to André”</b>. The full key is on the next page.",
  "André எட்டு பதில்கள் தருகிறார்; நீங்கள் எட்டு <b>கேள்விகளை</b> எழுத வேண்டும். அந்தப் பாடத்தின் "
  "இறுதியில் சிண்டியின் குறிப்பு: <b>“André-க்கான கேள்விகளை முடிக்கவும்”</b>. முழு விடை அடுத்த பக்கத்தில்."))

A(fig('image5.jpeg', 'Your own handwriting, 15 June — the homework, half done',
  "You wrote: <i>3. Qu'est-ce que tu aim? 4. Tu as une auto et un apartment? 5. es tu marie? 6. Tu as quel âge? "
  "8. comment t'appelles tu? 9. …</i> — three numbers missing, four spellings to fix. That is what we finish now.",
  "உங்கள் சொந்தக் கையெழுத்து, ஜூன் 15 — வீட்டுப்பாடம், பாதி முடிந்தது. மூன்று எண்கள் விடுபட்டன, நான்கு "
  "எழுத்துப்பிழைகள். இப்போது அதை முடிப்போம்.", size='figsm'))

A(drill("Writing drill 2.1 — finish André's interview properly, all eight, in the polite register",
        "எழுத்துப் பயிற்சி 2.1 — André-வின் நேர்காணலை முறையாக முடியுங்கள் — எட்டும், மரியாதை நிலையில்",
  qlines([
    "1. <span class='fr'>Je suis suisse.</span> <span class='ta'>நான் சுவிஸ்காரன்.</span>",
    "2. <span class='fr'>Oui, j'ai un frère et une sœur.</span> <span class='ta'>ஆம், ஒரு சகோதரனும் ஒரு சகோதரியும்.</span>",
    "3. <span class='fr'>J'aime le cinéma et le sport.</span> <span class='ta'>சினிமாவும் விளையாட்டும் பிடிக்கும்.</span>",
    "4. <span class='fr'>Oui, j'ai une auto et un appartement.</span> <span class='ta'>ஆம், கார், குடியிருப்பு உண்டு.</span>",
    "5. <span class='fr'>Non, je ne suis pas marié, je suis célibataire.</span> <span class='ta'>இல்லை, திருமணமாகவில்லை.</span>",
    "6. <span class='fr'>J'ai 25 ans.</span> <span class='ta'>எனக்கு 25 வயது.</span>",
    "7. <span class='fr'>Je m'appelle André.</span> <span class='ta'>என் பெயர் André.</span>",
    "8. <span class='fr'>Je suis informaticien.</span> <span class='ta'>நான் தகவல் தொழில்நுட்பர்.</span>",
  ])))
A(key("""<b>Inversion (the register Cindy called most polite):</b>
1. <span class="fr">Quelle est ta nationalité ?</span> · 2. <span class="fr">As-tu des frères et sœurs ?</span> ·
3. <span class="fr">Qu'aimes-tu ?</span> / <span class="fr">Qu'est-ce que tu aimes ?</span> ·
4. <span class="fr">As-tu une voiture et un appartement ?</span> · 5. <span class="fr">Es-tu marié ?</span> ·
6. <span class="fr">Quel âge as-tu ?</span> · 7. <span class="fr">Comment t'appelles-tu ?</span> ·
8. <span class="fr">Quelle est ta profession ?</span><br>
<b>Two spellings to fix from your sheet:</b> <i>aim</i> → <span class="fr">aimes</span>;
<i>apartment</i> → <span class="fr">appartement</span> (two p's, an <i>e</i>, and a final <i>-ment</i>);
<i>marie</i> → <span class="fr">marié</span>; and remember the hyphen in <span class="fr">t'appelles-tu</span>."""))

A(drill("Writing drill 2.2 — write each question in all three registers",
        "எழுத்துப் பயிற்சி 2.2 — ஒவ்வொரு கேள்வியையும் மூன்று நிலைகளிலும் எழுதுங்கள்",
  """<p class="gloss">Model / மாதிரி: <i>where do you live?</i> → <span class="fr">Tu habites où ? / Où est-ce que tu habites ? / Où habites-tu ?</span></p>""" +
  qlines([
    "a. What is your name? <span class='ta'>உங்கள் பெயர் என்ன?</span>",
    "b. How old are you? <span class='ta'>உங்கள் வயது என்ன?</span>",
    "c. What is your nationality? <span class='ta'>உங்கள் தேசியம் என்ன?</span>",
    "d. What languages do you speak? <span class='ta'>எந்த மொழிகள் பேசுகிறீர்கள்?</span>",
    "e. Do you have a brother? <span class='ta'>உங்களுக்கு சகோதரன் உண்டா?</span>",
    "f. What do you like? <span class='ta'>உங்களுக்கு எது பிடிக்கும்?</span>",
  ], n=3)))
A(key("""a. <span class="fr">Tu t'appelles comment ? / Comment est-ce que tu t'appelles ? / Comment t'appelles-tu ?</span><br>
b. <span class="fr">Tu as quel âge ? / Quel âge est-ce que tu as ? / Quel âge as-tu ?</span><br>
c. <span class="fr">Ta nationalité, c'est quoi ? / Quelle est ta nationalité ? / Quelle est ta nationalité ?</span><br>
d. <span class="fr">Tu parles quelles langues ? / Quelles langues est-ce que tu parles ? / Quelles langues parles-tu ?</span><br>
e. <span class="fr">Tu as un frère ? / Est-ce que tu as un frère ? / As-tu un frère ?</span><br>
f. <span class="fr">Tu aimes quoi ? / Qu'est-ce que tu aimes ? / Qu'aimes-tu ?</span>"""))

A(drill("Writing drill 2.3 — your own fiche, five times",
        "எழுத்துப் பயிற்சி 2.3 — உங்கள் சொந்த அறிமுகம், ஐந்து முறை",
  """<div class="duo"><div>Write a Paul-style paragraph about <b>yourself</b>, then about four people you know.
  Six sentences each: name · age · work · city · languages · nationality. Then, at the bottom, write the same
  paragraph about yourself <b>in the negative</b> for two of the sentences (<span class="fr">Je ne parle pas
  hindi. Je ne suis pas belge.</span>) — Cindy will notice the negation immediately.</div>
  <div class="ta-col">Paul பாணியில் <b>உங்களைப் பற்றி</b> ஒரு பத்தி எழுதுங்கள், பிறகு உங்களுக்குத் தெரிந்த
  நான்கு பேர் பற்றி. ஒவ்வொன்றிலும் ஆறு வாக்கியங்கள்: பெயர் · வயது · வேலை · ஊர் · மொழிகள் · தேசியம்.
  இறுதியில் இரண்டு வாக்கியங்களை <b>மறுப்பு</b> வடிவில் எழுதுங்கள் — சிண்டி உடனே கவனிப்பார்.</div></div>
  <p class="gloss" style="margin-top:2mm">Starter you can reuse — she already accepted these from you in the chat:
  <span class="fr">Je viens du sud de l'Inde. Je parle tamoul. Je ne parle pas hindi.</span></p>""" + lines(16)))
A(pb())

# ============================ LESSON 3 ============================
A(sec("3", "15 June — Describing people, and the agreement of adjectives", "ஜூன் 15 — நபர்களை விவரித்தல், பெயரடை ஒப்புமை"))
A(duo("""<p>This is the longest lesson in the whole log and the most important one. Everything Cindy did afterwards —
  families, nationalities, fruit — rests on the rule she taught here. She began, as French teachers have begun
  for fifty years, with two Gauls.</p>""",
  """<p>உரையாடல் முழுவதிலும் இதுவே மிக நீளமான, மிக முக்கியமான பாடம். இதற்குப் பிறகு சிண்டி செய்த அனைத்தும் —
  குடும்பம், தேசியம், பழங்கள் — இங்கே கற்பித்த விதியின் மேலேயே நிற்கின்றன. ஐம்பது ஆண்டுகளாக பிரெஞ்சு
  ஆசிரியர்கள் தொடங்குவது போலவே, இரு கால்களுடன் தொடங்கினார்.</p>"""))

A(figrow([
  ('image6.png', 'Image Cindy sent', "Astérix — the poster she opened with.", "அவர் தொடங்கிய சுவரொட்டி."),
  ('image7.png', 'Image Cindy sent — the model text', "The two model descriptions, learn them by heart.", "இரு மாதிரி விவரிப்புகள் — மனப்பாடம் செய்யுங்கள்."),
]))
A(txt("""<b>Obélix est grand, gros et fort. Il a les cheveux roux et il porte des nattes.</b><br>
  <span class="gloss">Obélix is tall, fat and strong. He has ginger hair and he wears braids.</span><br>
  <span class="ta">Obélix உயரமானவர், பருமனானவர், பலசாலி. அவருக்கு செம்பட்டை முடி; பின்னல் போடுகிறார்.</span><br><br>
  <b>Astérix est petit et mince. Il a les cheveux blonds et courts. Il ne porte pas de nattes.</b><br>
  <span class="gloss">Astérix is short and slim. He has blond, short hair. He does not wear braids.</span><br>
  <span class="ta">Astérix குட்டையானவர், மெலிந்தவர். பொன்னிற, குறுகிய முடி. பின்னல் போடுவதில்லை.</span>"""))

A(rule("The two verbs of description — être and avoir", "விவரிப்பின் இரு வினைச்சொற்கள் — être, avoir",
  """<div class="duo"><div>French splits description between two verbs, and getting them the wrong way round is the
  most common beginner mistake. <b>You <i>are</i> a quality; you <i>have</i> a body part.</b><br>
  <span class="fr">Il <b>est</b> grand.</span> He is tall. — a quality of the whole person.<br>
  <span class="fr">Il <b>a</b> les cheveux roux.</span> He has ginger hair. — a part, plus its colour.<br>
  Note also: French says <span class="fr">il a <b>les</b> cheveux</span> (the hair), not <i>ses cheveux</i>.
  The definite article does the work that English does with a possessive.</div>
  <div class="ta-col">பிரெஞ்சு விவரிப்பை இரு வினைச்சொற்களாகப் பிரிக்கிறது; இதைத் தலைகீழாக்குவதே தொடக்கநிலை
  மாணவரின் மிகப் பொதுவான தவறு. <b>ஒரு பண்பாக நீங்கள் <i>இருக்கிறீர்கள்</i>; ஓர் உறுப்பை <i>வைத்திருக்கிறீர்கள்</i>.</b><br>
  <span class="fr">Il <b>est</b> grand.</span> — முழு நபரின் பண்பு.<br>
  <span class="fr">Il <b>a</b> les cheveux roux.</span> — உறுப்பு + நிறம்.<br>
  மேலும்: பிரெஞ்சு <span class="fr">les cheveux</span> என்கிறது, <i>ses cheveux</i> அல்ல.</div></div>"""))

A(h4("être — she made you conjugate it in the chat", "être — உரையாடலில் அவர் உங்களை மாற்றச் சொன்னது"))
A(conj("être <span class='gloss'>to be</span>", "இருத்தல்",
  ["je <b>suis</b>", "tu <b>es</b>", "il / elle <b>est</b>", "nous <b>sommes</b>", "vous <b>êtes</b>", "ils / elles <b>sont</b>"]))
A(conj("avoir <span class='gloss'>to have</span>", "வைத்திருத்தல்",
  ["j'<b>ai</b>", "tu <b>as</b>", "il / elle <b>a</b>", "nous <b>avons</b>", "vous <b>avez</b>", "ils / elles <b>ont</b>"]))
A(conj("porter <span class='gloss'>to wear (regular -er)</span>", "அணிதல்",
  ["je <b>porte</b>", "tu <b>portes</b>", "il / elle <b>porte</b>", "nous <b>portons</b>", "vous <b>portez</b>", "ils / elles <b>portent</b>"]))
A('<div style="clear:both"></div>')
A(warn("The two corrections she made to you that day · அன்று அவர் செய்த இரு திருத்தங்கள்",
  """<div class="duo"><div>You wrote <i>vous etes moyens</i> — she replied with one word: <b>êtes</b>. The circumflex
  is not decoration, it is the spelling. And you wrote <i>Je sui jeun</i>; she answered <b>la désinence</b>
  (“the ending”) and then wrote the correct form: <span class="fr">je suis jeune</span>. Her point was general:
  in French the <b>ending of the word carries the grammar</b>. Drop the ending and you have dropped the meaning,
  even when the sound is unchanged.</div>
  <div class="ta-col">நீங்கள் <i>vous etes moyens</i> என்று எழுதினீர்கள் — அவர் ஒரே வார்த்தையில் பதிலளித்தார்:
  <b>êtes</b>. கூரைக் குறி அலங்காரம் அல்ல, அதுவே சரியான எழுத்து. <i>Je sui jeun</i> என்று எழுதியபோது
  <b>la désinence</b> (“விகுதி”) என்று சொல்லி <span class="fr">je suis jeune</span> எனத் திருத்தினார்.
  அவரது கருத்து பொதுவானது: பிரெஞ்சில் <b>வார்த்தையின் விகுதியே இலக்கணத்தைச் சுமக்கிறது</b>.</div></div>
  <p style="margin-top:2mm"><b>La désinence</b> = the inflectional ending. Remember the word — she will use it again.
  <span class="ta">விகுதி — இந்த வார்த்தையை நினைவில் வையுங்கள்.</span></p>"""))

A(h3("The agreement rule, exactly as she built it", "ஒப்புமை விதி — அவர் கட்டியபடியே"))
A(rule("-e for feminine, -s for plural. Both if both.", "பெண்பாலுக்கு -e, பன்மைக்கு -s. இரண்டும் இருந்தால் இரண்டும்.",
  """<div class="duo"><div>Cindy wrote it as two arrows: <b>-s &gt; plural</b>, <b>-e &gt; féminin</b>. An adjective in
  French is not one word but a small family of up to four. You choose the member that matches the noun.</div>
  <div class="ta-col">சிண்டி இரு அம்புக்குறிகளாக எழுதினார்: <b>-s &gt; பன்மை</b>, <b>-e &gt; பெண்பால்</b>.
  பிரெஞ்சில் ஒரு பெயரடை என்பது ஒரு வார்த்தை அல்ல, நான்கு உறுப்பினர்கள் கொண்ட சிறு குடும்பம்.</div></div>""" +
  table(("Adjective <span class='ta'>பெயரடை</span>", "m. sing.", "f. sing. <span class='ta'>+e</span>",
         "m. plur. <span class='ta'>+s</span>", "f. plur. <span class='ta'>+es</span>", "Note <span class='ta'>குறிப்பு</span>"),
   [("<b>grand</b> tall", "grand", "grand<b>e</b>", "grand<b>s</b>", "grand<b>es</b>", "The regular pattern. <span class='ta'>வழக்கமான வடிவம்.</span>"),
    ("<b>petit</b> short/small", "petit", "petit<b>e</b>", "petit<b>s</b>", "petit<b>es</b>", "Regular."),
    ("<b>fort</b> strong", "fort", "fort<b>e</b>", "fort<b>s</b>", "fort<b>es</b>", "Regular."),
    ("<b>vert</b> green", "vert", "vert<b>e</b>", "vert<b>s</b>", "vert<b>es</b>", "Regular — you got <i>vertes</i> right in the chat."),
    ("<b>gros</b> fat", "gros", "gro<b>sse</b>", "gros", "gro<b>sses</b>", "Cindy: <i>gros, gros : sing, plur</i> — the masculine already ends in -s, so <b>nothing is added</b>. <span class='ta'>ஆண்பால் ஏற்கனவே -s-இல் முடிவதால் எதுவும் சேர்க்கப்படுவதில்லை.</span>"),
    ("<b>roux</b> ginger", "roux", "rou<b>sse</b>", "roux", "rou<b>sses</b>", "Cindy: <i>roux, roux : sing, plur</i> — same reason, ends in -x."),
    ("<b>mince</b> slim", "mince", "mince", "mince<b>s</b>", "mince<b>s</b>", "Cindy: <i>mince, mince : fém sing, masc sing / minces, minces : plural</i> — already ends in <b>-e</b>, so <b>no feminine change</b>. <span class='ta'>ஏற்கனவே -e-இல் முடிவதால் பெண்பால் மாற்றமில்லை.</span>"),
    ("<b>jeune</b> young", "jeune", "jeune", "jeune<b>s</b>", "jeune<b>s</b>", "Same family as <i>mince</i>."),
    ("<b>court</b> short (things)", "court", "court<b>e</b>", "court<b>s</b>", "court<b>es</b>", "Regular. Used for hair: <i>les cheveux courts</i>."),
    ("<b>vieux</b> old", "vieux", "<b>vieille</b>", "vieux", "<b>vieilles</b>", "Fully irregular. Cindy made you write both: <i>Elle est vieille / Elles sont vieilles</i>."),
    ("<b>délicieux</b> delicious", "délicieux", "délicieu<b>se</b>", "délicieux", "délicieu<b>ses</b>", "Cindy wrote all four out for you: <i>délicieux, délicieuse, délicieux, délicieuses</i>. The <b>-eux → -euse</b> family."),
    ("<b>juteux</b> juicy", "juteux", "juteu<b>se</b>", "juteux", "juteu<b>ses</b>", "Same -eux family. <i>des prunes juteuses</i>."),
    ("<b>paresseux</b> lazy", "paresseux", "paresseu<b>se</b>", "paresseux", "paresseu<b>ses</b>", "Same family — from the homework sentences."),
   ])))

A(tip("The three families you now own · உங்களுக்குச் சொந்தமான மூன்று குடும்பங்கள்",
  """<div class="duo"><div><b>1 · Regular</b> — add -e / -s / -es. <i>grand, petit, vert, court, fort.</i><br>
  <b>2 · Already ends in -s or -x</b> — the masculine plural adds nothing. <i>gros, roux, vieux, délicieux, français.</i><br>
  <b>3 · Already ends in -e</b> — the feminine adds nothing. <i>mince, jeune, rouge, jaune, célibataire, timide.</i><br>
  Everything else is an exception you meet one at a time.</div>
  <div class="ta-col"><b>1 · வழக்கமானது</b> — -e / -s / -es சேர்க்கவும்.<br>
  <b>2 · ஏற்கனவே -s அல்லது -x-இல் முடிவது</b> — ஆண்பால் பன்மையில் எதுவும் சேராது.<br>
  <b>3 · ஏற்கனவே -e-இல் முடிவது</b> — பெண்பாலில் எதுவும் சேராது.<br>
  மற்றவை ஒவ்வொன்றாகச் சந்திக்கும் விதிவிலக்குகள்.</div></div>"""))

A(warn("« Masculine always wins » — her exact phrase", "« ஆண்பாலே எப்போதும் வெல்லும் » — அவரது சொற்களே",
  """<div class="duo"><div>When one adjective describes a mixed group — even one man among a hundred women — the
  adjective goes <b>masculine plural</b>.<br>
  <span class="fr">Paul et Marie sont <b>grands</b>.</span> (not <i>grandes</i>)<br>
  <span class="fr">Une pomme et un citron sont <b>verts</b>.</span><br>
  This is why exercise sentence 1 on her worksheet — <i>une pomme (f.) et une poire (f.)</i> — takes
  <b>vertes</b>: both are feminine, so the feminine survives. Change <i>une poire</i> to <i>un citron</i> and
  the answer becomes <b>verts</b>.</div>
  <div class="ta-col">ஒரே பெயரடை கலப்புக் குழுவை விவரிக்கும்போது — நூறு பெண்களுக்கு நடுவே ஒரு ஆண் இருந்தாலும் —
  பெயரடை <b>ஆண்பால் பன்மை</b> ஆகும்.<br>
  <span class="fr">Paul et Marie sont <b>grands</b>.</span><br>
  அதனால்தான் <i>une pomme + une poire</i> (இரண்டும் பெண்பால்) → <b>vertes</b>. <i>une poire</i>-ஐ
  <i>un citron</i> ஆக்கினால் விடை <b>verts</b> ஆகும்.</div></div>"""))

A(h3("Hair, and the words that go with it", "முடி — அதனுடன் வரும் சொற்கள்"))
A(vocab([
  ("les cheveux (m. plur.)", "hair on the head — <b>always plural</b> in French", "தலைமுடி"),
  ("un cheveu", "a single hair (rare)", "ஒரு முடி"),
  ("les poils (m. plur.)", "body hair — never use <i>cheveux</i> for this", "உடல் ரோமம்"),
  ("roux / rousse", "ginger, red-haired", "செம்பட்டை"),
  ("blond / blonde", "blond", "பொன்னிறம்"),
  ("brun / brune", "brown-haired, dark", "பழுப்பு முடி"),
  ("châtain", "chestnut brown", "கஷ்கொட்டை நிறம்"),
  ("noir / noire", "black", "கருப்பு"),
  ("gris / grise", "grey", "சாம்பல்"),
  ("lisse / lisses", "smooth, sleek", "மென்மையான, நேரான"),
  ("raide / raides", "straight (stiff-straight)", "நேரான (விறைப்பான)"),
  ("frisé / frisée", "curly", "சுருள் முடி"),
  ("bouclé / bouclée", "wavy, in curls", "அலை அலையான"),
  ("court / courte", "short", "குட்டை"),
  ("long / longue", "long (note the irregular feminine)", "நீளம்"),
  ("une natte", "a braid, a plait", "பின்னல்"),
  ("porter", "to wear", "அணிய"),
  ("des lunettes (f. plur.)", "glasses — always plural", "கண்ணாடி"),
  ("une moustache", "a moustache", "மீசை"),
  ("une barbe", "a beard", "தாடி"),
]))
A(figrow([
  ('image8.png', 'Image Cindy sent', "<span class='fr'>lisse</span> — smooth, sleek hair.", "<span class='fr'>lisse</span> — மென்மையான, பளபளப்பான முடி."),
  ('image9.png', 'Image Cindy sent', "<span class='fr'>raide</span> — straight hair. Her sentence: <span class='fr'>les cheveux sont lisses</span>.", "<span class='fr'>raide</span> — நேரான முடி."),
]))
A(fig('image11.png', 'Image Cindy sent — La description physique',
  "The whole grammar of describing a person on one sheet: <b>l'âge</b> (jeune, adulte, vieux) · <b>la taille</b> "
  "(grand, moyen, petit) · <b>le poids</b> (mince, gros) · <b>les cheveux</b> (longs, courts, raides, frisés, "
  "bouclés / blonds, bruns, roux, blancs) · <b>autres caractéristiques</b> (une moustache, une barbe, des lunettes). "
  "Down the right: <b>être + adjectif</b>, <b>avoir</b>, <b>porter</b> — the three verbs, conjugated.",
  "ஒரு நபரை விவரிக்கும் முழு இலக்கணமும் ஒரே தாளில்: வயது · உயரம் · எடை · முடி · பிற அடையாளங்கள். "
  "வலதுபுறம் மூன்று வினைச்சொற்கள் — être + பெயரடை, avoir, porter."))

A(h3("Colours — and the two that never change", "நிறங்கள் — ஒருபோதும் மாறாத இரண்டு"))
A(fig('image14.png', 'Image Cindy sent — Les couleurs',
  "Every colour with its four forms. The ⚠ warning triangles mark the invariable ones: "
  "<span class='fr'>orange</span> and <span class='fr'>marron</span> never change.",
  "ஒவ்வொரு நிறமும் அதன் நான்கு வடிவங்களுடன். ⚠ குறியீடு மாறாத நிறங்களைக் காட்டுகிறது: "
  "<span class='fr'>orange</span>, <span class='fr'>marron</span> — ஒருபோதும் மாறாது."))
A(rule("Cindy's rule: « when a colour is a fruit, no change »", "சிண்டியின் விதி: « நிறம் ஒரு பழமாக இருந்தால், மாற்றம் இல்லை »",
  """<div class="duo"><div>She showed you a photograph of chestnuts and wrote: <span class="fr">les marrons</span> =
  the fruit (plural, takes -s), <span class="fr">le marron</span> = the colour. Then the rule:
  <b>a colour borrowed from a noun does not agree.</b><br>
  <span class="fr">des chaussures <b>marron</b></span> — brown shoes (no -s)<br>
  <span class="fr">des robes <b>orange</b></span> — orange dresses (no -s)<br>
  <span class="fr">des yeux <b>noisette</b></span> — hazel eyes<br>
  But: <span class="fr">des pommes <b>rouges</b></span> — <i>rouge</i> is a true adjective, so it agrees.<br>
  <b>Exceptions to the exception:</b> <span class="fr">rose, mauve, fauve, écarlate, pourpre</span> have been
  French adjectives so long that they <i>do</i> agree — <span class="fr">des fleurs roses</span>.</div>
  <div class="ta-col">கஷ்கொட்டைப் படத்தைக் காட்டி எழுதினார்: <span class="fr">les marrons</span> = பழம் (பன்மை, -s),
  <span class="fr">le marron</span> = நிறம். விதி: <b>பெயர்ச்சொல்லிலிருந்து கடன் வாங்கிய நிறம் ஒப்புமை
  கொள்ளாது.</b><br>
  <span class="fr">des chaussures <b>marron</b></span>, <span class="fr">des robes <b>orange</b></span><br>
  ஆனால் <span class="fr">des pommes <b>rouges</b></span> — <i>rouge</i> உண்மையான பெயரடை, எனவே ஒப்புமை கொள்ளும்.<br>
  <b>விதிவிலக்கின் விதிவிலக்கு:</b> <span class="fr">rose, mauve</span> — இவை நீண்ட காலமாகப் பெயரடைகளாக
  இருப்பதால் ஒப்புமை கொள்ளும்.</div></div>"""))
A(figrow([
  ('image10.png', 'Image Cindy sent', "<span class='fr'>les marrons</span> — the chestnuts (fruit). The colour is <span class='fr'>marron</span>, invariable.", "கஷ்கொட்டைகள் (பழம்). நிறம் <span class='fr'>marron</span> — மாறாது."),
  ('image15.png', 'Image Cindy sent', "<span class='fr'>une violette</span> — a violet (the flower). The colour <span class='fr'>violet / violette</span> does agree.", "<span class='fr'>une violette</span> — ஒரு வயலெட் மலர்."),
  ('image16.png', 'Image Cindy sent', "<span class='fr'>une mauve</span> — a mallow flower. The colour <span class='fr'>mauve</span> comes from it.", "<span class='fr'>une mauve</span> — மால்லோ மலர்."),
]))
A(vocab([
  ("blanc / blanche", "white", "வெள்ளை"), ("noir / noire", "black", "கருப்பு"),
  ("rouge / rouge", "red — already ends in -e", "சிவப்பு"), ("bleu / bleue", "blue", "நீலம்"),
  ("vert / verte", "green", "பச்சை"), ("jaune / jaune", "yellow", "மஞ்சள்"),
  ("gris / grise", "grey", "சாம்பல்"), ("brun / brune", "brown", "பழுப்பு"),
  ("beige / beige", "beige", "மங்கல் மஞ்சள்"), ("violet / violette", "purple, violet", "ஊதா"),
  ("rose / rose", "pink — agrees, despite being a flower", "இளஞ்சிவப்பு"),
  ("mauve / mauve", "mauve — agrees", "மௌவ்"),
  ("orange", "orange — <b>never changes</b>", "ஆரஞ்சு"),
  ("marron", "brown — <b>never changes</b>", "பழுப்பு"),
]))

A(h3("Where does the adjective go? — her most subtle point", "பெயரடை எங்கே வரும்? — அவரது நுட்பமான கருத்து"))
A(rule("noun + adjective = dictionary meaning · adjective + noun = personal meaning",
       "பெயர்ச்சொல் + பெயரடை = அகராதி அர்த்தம் · பெயரடை + பெயர்ச்சொல் = தனிப்பட்ட அர்த்தம்",
  """<div class="duo"><div>Cindy wrote these two lines almost as a riddle: <i>noun + adj &gt; dictionnary</i>,
  <i>adj + noun &gt; personnal</i>. Here is what she meant, with her own examples:<br><br>
  <span class="fr">un homme <b>grand</b></span> = a <b>tall</b> man — measurable, literal, dictionary.<br>
  <span class="fr">un <b>grand</b> homme</span> = a <b>great</b> man — a judgement, figurative, personal.<br><br>
  <span class="fr">un livre <b>neuf</b></span> = a book that is <b>brand new</b> — never used by anyone.<br>
  <span class="fr">un <b>nouveau</b> livre</span> = a book that is <b>new to me</b> — possibly second-hand.<br><br>
  Her aside: <b>Louvain-la-Neuve</b>, the Belgian town you know, is literally “Louvain the New (one)” —
  <span class="fr">neuve</span> being the feminine of <i>neuf</i>. You spotted it yourself in the chat and she
  confirmed: <i>neuve &gt; fém</i>.</div>
  <div class="ta-col">சிண்டி இரு வரிகளை கிட்டத்தட்ட புதிராக எழுதினார். அவர் சொன்னதன் பொருள்:<br><br>
  <span class="fr">un homme <b>grand</b></span> = <b>உயரமான</b> மனிதன் — அளவிடக்கூடியது, நேரடி அர்த்தம்.<br>
  <span class="fr">un <b>grand</b> homme</span> = <b>மகத்தான</b> மனிதன் — மதிப்பீடு, தனிப்பட்ட அர்த்தம்.<br><br>
  <span class="fr">un livre <b>neuf</b></span> = முற்றிலும் <b>புதிய</b> புத்தகம்.<br>
  <span class="fr">un <b>nouveau</b> livre</span> = <b>எனக்குப் புதிய</b> புத்தகம் — பழையதாகவும் இருக்கலாம்.<br><br>
  அவரது குறிப்பு: <b>Louvain-la-Neuve</b> = “புதிய Louvain”; <span class="fr">neuve</span> என்பது
  <i>neuf</i>-இன் பெண்பால். நீங்களே கண்டுபிடித்தீர்கள், அவர் உறுதிப்படுத்தினார்.</div></div>"""))
A(tip("BAGS — the short adjectives that go in front · முன்னால் வரும் குறுகிய பெயரடைகள்",
  """<div class="duo"><div>Cindy did not give you this memory hook, but it makes her rule usable. Most French
  adjectives go <b>after</b> the noun. A small closed set goes <b>before</b> — remember <b>BAGS</b>:
  <b>B</b>eauty (<span class="fr">beau, joli</span>), <b>A</b>ge (<span class="fr">jeune, vieux, nouveau</span>),
  <b>G</b>oodness (<span class="fr">bon, mauvais, gentil</span>), <b>S</b>ize (<span class="fr">grand, petit,
  gros, long</span>). Everything else — colours, nationalities, shapes, moods — goes after.<br>
  <span class="fr">une <b>jolie petite</b> maison <b>blanche</b></span> — two BAGS in front, colour behind.</div>
  <div class="ta-col">சிண்டி இந்த நினைவூட்டியைத் தரவில்லை, ஆனால் இது அவரது விதியைப் பயன்படுத்த உதவும்.
  பெரும்பாலான பிரெஞ்சு பெயரடைகள் பெயர்ச்சொல்லுக்குப் <b>பின்</b> வரும். ஒரு சிறு தொகுப்பு <b>முன்</b> வரும் —
  <b>BAGS</b>: அழகு · வயது · நன்மை · அளவு. மற்றவை — நிறம், தேசியம், வடிவம், மனநிலை — பின்னால்.</div></div>"""))

A(h3("The vocabulary she taught through the fruit exercise", "பழப் பயிற்சி மூலம் அவர் கற்பித்த சொற்கள்"))
A(vocab([
  ("une pomme", "an apple", "ஆப்பிள்"), ("une poire", "a pear", "பேரிக்காய்"),
  ("une prune", "a plum", "உலர் திராட்சை வகை / அல்லிப்பழம்"),
  ("une framboise", "a raspberry", "ராஸ்பெர்ரி"), ("un ananas", "a pineapple", "அன்னாசி"),
  ("un citron", "a lemon", "எலுமிச்சை"), ("une cerise", "a cherry", "செர்ரி"),
  ("une fraise", "a strawberry", "ஸ்ட்ராபெர்ரி"), ("une orange", "an orange", "ஆரஞ்சு"),
  ("un buffet", "a sideboard, a dresser (furniture)", "பாத்திரப் பேழை"),
  ("un couteau", "a knife (plural <i>couteaux</i>)", "கத்தி"),
  ("une fourchette", "a fork", "முள்கரண்டி"),
  ("une table", "a table", "மேசை"),
  ("un genou", "a knee (plural <i>genoux</i>)", "முழங்கால்"),
  ("une main", "a hand", "கை"),
  ("lavé / lavée", "washed (past participle of <i>laver</i>)", "கழுவப்பட்ட"),
  ("juteux / juteuse", "juicy", "சாறு நிறைந்த"),
  ("délicieux / délicieuse", "delicious", "சுவையான"),
  ("un képi", "a French military cap (flat-topped)", "இராணுவத் தொப்பி"),
  ("une casquette", "a cap (with a peak)", "தொப்பி"),
]))
A(fig('image12.png', 'Image Cindy sent', "<span class='fr'>un buffet</span> — a sideboard. She used it in exercise 2: <span class='fr'>Une table et un buffet <b>bruns</b></span> — one feminine, one masculine, so <b>masculine wins</b>.",
  "<span class='fr'>un buffet</span> — பாத்திரப் பேழை. பயிற்சி 2-இல்: ஒன்று பெண்பால், ஒன்று ஆண்பால் — எனவே <b>ஆண்பாலே வெல்லும்</b>.", size='figsm'))

A(fig('image13.png', 'Image Cindy sent — the ten-sentence agreement exercise you did together',
  "Cindy's worksheet. Each sentence gives the adjective in brackets in its dictionary form; you write the form "
  "that agrees. Do it again below, covering the key.",
  "சிண்டியின் பயிற்சித் தாள். ஒவ்வொரு வாக்கியத்திலும் அடைப்புக்குறிக்குள் பெயரடை அகராதி வடிவில் உள்ளது; "
  "ஒப்புமை கொண்ட வடிவத்தை நீங்கள் எழுத வேண்டும். கீழே விடையை மூடி மீண்டும் செய்யுங்கள்."))

A(drill("Writing drill 3.1 — the ten sentences again, from scratch",
        "எழுத்துப் பயிற்சி 3.1 — பத்து வாக்கியங்களும் மீண்டும்",
  qlines([
    "1. Une pomme et une poire (<b>vert</b>) <span class='ta'>ஒரு ஆப்பிளும் ஒரு பேரிக்காயும் — பச்சை</span>",
    "2. Une table et un buffet (<b>brun</b>) <span class='ta'>ஒரு மேசையும் ஒரு பேழையும் — பழுப்பு</span>",
    "3. Un couteau et une fourchette (<b>gris</b>) <span class='ta'>ஒரு கத்தியும் ஒரு முள்கரண்டியும் — சாம்பல்</span>",
    "4. De (<b>gros</b>) oranges et prunes <span class='ta'>பெரிய ஆரஞ்சுகளும் பழங்களும்</span>",
    "5. Des genoux et des mains bien (<b>lavé</b>) <span class='ta'>நன்கு கழுவப்பட்ட முழங்கால்களும் கைகளும்</span>",
    "6. Des prunes et des framboises (<b>délicieux</b>) <span class='ta'>சுவையான பழங்களும் ராஸ்பெர்ரிகளும்</span>",
    "7. Je mange des prunes et des ananas (<b>juteux</b>) <span class='ta'>சாறு நிறைந்தவற்றைச் சாப்பிடுகிறேன்</span>",
    "8. Un citron et une banane (<b>jaune</b>) <span class='ta'>ஒரு எலுமிச்சையும் ஒரு வாழைப்பழமும் — மஞ்சள்</span>",
    "9. Des cerises et des fraises (<b>rouge</b>) <span class='ta'>செர்ரிகளும் ஸ்ட்ராபெர்ரிகளும் — சிவப்பு</span>",
    "10. Un képi et une casquette (<b>noir</b>) <span class='ta'>ஒரு இராணுவத் தொப்பியும் ஒரு தொப்பியும் — கருப்பு</span>",
  ])))
A(key("""1. <b class="fr">vertes</b> (two feminines) · 2. <b class="fr">bruns</b> (mixed → masculine) ·
3. <b class="fr">gris</b> (mixed → masculine; already ends in -s, so no change) ·
4. <b class="fr">grosses</b> (oranges and prunes are both feminine) ·
5. <b class="fr">lavés</b> (genoux m. + mains f. → masculine) ·
6. <b class="fr">délicieuses</b> (two feminines, -eux → -euses) ·
7. <b class="fr">juteux</b> (prunes f. + ananas m. → masculine; -x stays) ·
8. <b class="fr">jaunes</b> (mixed → masculine plural, but <i>jaune</i> ends in -e so only -s) ·
9. <b class="fr">rouges</b> (two feminines; <i>rouge</i> ends in -e so only -s) ·
10. <b class="fr">noirs</b> (mixed → masculine).<br>
<span class="gloss">Sentences 3, 7, 8, 9 are the ones that trap people: the adjective already ends in -s, -x or -e,
so the plural or the feminine adds nothing or almost nothing. Look at the <b>ending you start with</b> before you
add anything.</span>"""))

A(h3("Her homework of 15 June — « switch the gender of the sentences »", "ஜூன் 15 வீட்டுப்பாடம் — « வாக்கியங்களின் பாலை மாற்றுங்கள் »"))
A(txt("""<b>1. Paul est timide. 2. Marc est créatif et original. 3. Ce garçon est paresseux et agressif.
  4. Il est souriant et bavard. 5. Je voudrais qu'il soit blond et frisé.</b>"""))
A(fig('image17.png', 'Your own handwriting, 18 June — the homework done',
  "You turned every sentence feminine: <i>1. Christine est timide. 2. Ruby est créative et originale. "
  "3. Cette fille est paresseuse et agressive. 4. Elle est souriante et bavarde. 5. Je voudrais qu'elle soit "
  "blonde et frisée.</i> Cindy's only correction, typed the next morning: <b>3. agressive</b> — you had written "
  "<i>aggressive</i> with two g's, the English spelling. French has one: <span class='fr'>agressif / agressive</span>.",
  "ஒவ்வொரு வாக்கியத்தையும் பெண்பாலாக மாற்றினீர்கள். சிண்டியின் ஒரே திருத்தம்: <b>agressive</b> — நீங்கள் "
  "ஆங்கில எழுத்துமுறையில் இரண்டு g போட்டீர்கள். பிரெஞ்சில் ஒரே g."))
A(vocab([
  ("timide", "shy — ends in -e, no feminine change", "கூச்ச சுபாவம்"),
  ("créatif / créative", "creative — the <b>-if → -ive</b> family", "படைப்பாற்றல் மிக்க"),
  ("original / originale", "original — plural m. is irregular: <b>originaux</b>", "தனித்துவமான"),
  ("paresseux / paresseuse", "lazy — the <b>-eux → -euse</b> family", "சோம்பேறி"),
  ("agressif / agressive", "aggressive — <b>one g</b> in French", "ஆக்ரோஷமான"),
  ("souriant / souriante", "smiling, cheerful", "புன்னகைக்கும்"),
  ("bavard / bavarde", "talkative, chatty", "அதிகம் பேசும்"),
  ("blond / blonde", "blond", "பொன்னிற முடி"),
  ("frisé / frisée", "curly", "சுருள் முடி"),
  ("Je voudrais qu'il soit…", "I would like him to be… (subjunctive — B1, just recognise it)", "அவர் … ஆக இருக்க விரும்புகிறேன்"),
]))

A(drill("Writing drill 3.2 — reverse the exercise: turn these feminine sentences masculine",
        "எழுத்துப் பயிற்சி 3.2 — தலைகீழ்: இந்தப் பெண்பால் வாக்கியங்களை ஆண்பாலாக்குங்கள்",
  qlines([
    "1. <span class='fr'>Julie est vieille et rousse.</span> <span class='ta'>Julie வயதானவள், செம்பட்டை முடி.</span>",
    "2. <span class='fr'>Ma sœur est mince, sportive et heureuse.</span> <span class='ta'>என் சகோதரி மெலிந்தவள், விளையாட்டுப் பிரியை, மகிழ்ச்சியானவள்.</span>",
    "3. <span class='fr'>Ces filles sont créatives et originales.</span> <span class='ta'>இந்தப் பெண்கள் படைப்பாற்றல் மிக்கவர்கள்.</span>",
    "4. <span class='fr'>Elle est grande, blonde et frisée.</span> <span class='ta'>அவள் உயரமானவள், பொன்னிற சுருள் முடி.</span>",
    "5. <span class='fr'>Les Belges sont gentilles et bavardes.</span> <span class='ta'>பெல்ஜியப் பெண்கள் அன்பானவர்கள், அதிகம் பேசுபவர்கள்.</span>",
  ])))
A(key("""1. <span class="fr">Julien est <b>vieux</b> et <b>roux</b>.</span> · 2. <span class="fr">Mon frère est <b>mince</b>, <b>sportif</b> et <b>heureux</b>.</span> ·
3. <span class="fr">Ces garçons sont <b>créatifs</b> et <b>originaux</b>.</span> (watch the -al → -aux plural) ·
4. <span class="fr">Il est <b>grand</b>, <b>blond</b> et <b>frisé</b>.</span> ·
5. <span class="fr">Les Belges sont <b>gentils</b> et <b>bavards</b>.</span>"""))

A(drill("Writing drill 3.3 — describe six people you actually know",
        "எழுத்துப் பயிற்சி 3.3 — உங்களுக்கு உண்மையில் தெரிந்த ஆறு பேரை விவரியுங்கள்",
  """<div class="duo"><div>Three sentences each, using all three verbs: <b>être</b> for qualities, <b>avoir</b> for
  hair and eyes, <b>porter</b> for glasses, a beard, clothes. At least three of the six must be women, so the
  agreement has to work. Model: <span class="fr">Ma sœur est petite et mince. Elle a les cheveux noirs et longs.
  Elle porte des lunettes.</span></div>
  <div class="ta-col">ஒவ்வொருவருக்கும் மூன்று வாக்கியங்கள், மூன்று வினைச்சொற்களையும் பயன்படுத்தி: பண்புகளுக்கு
  <b>être</b>, முடி/கண்களுக்கு <b>avoir</b>, கண்ணாடி/தாடி/ஆடைக்கு <b>porter</b>. ஆறில் குறைந்தது மூவர்
  பெண்களாக இருக்க வேண்டும் — ஒப்புமை வேலை செய்யட்டும்.</div></div>""" + lines(20)))
A(pb())

# ============================ LESSON 4 ============================
A(sec("4", "18 June — La famille Dubois, wanting and doing", "ஜூன் 18 — Dubois குடும்பம், விருப்பமும் செயலும்"))
A(duo("""<p>She began with a warm-up list of ten nouns — deliberately mixed genders, to make you look at the article
  and not the word. Then she gave you the text that would carry the next two lessons.</p>""",
  """<p>பத்து பெயர்ச்சொற்களுடன் தொடங்கினார் — பால் வேண்டுமென்றே கலந்தது, நீங்கள் வார்த்தையை அல்ல, இடைச்சொல்லைப்
  பார்க்க வேண்டும் என்பதற்காக. பிறகு அடுத்த இரு பாடங்களைச் சுமக்கும் உரையைக் கொடுத்தார்.</p>"""))
A(vocab([
  ("une maison", "a house", "வீடு"), ("un stylo", "a pen", "பேனா"),
  ("l'école (f.)", "the school — she marked the gender for you: <b>f</b>", "பள்ளி"),
  ("une sœur", "a sister", "சகோதரி"), ("ma mère", "my mother", "என் தாய்"),
  ("un livre", "a book", "புத்தகம்"), ("content / contente", "happy, pleased", "மகிழ்ச்சியான"),
  ("un élève / une élève", "a pupil (school)", "பள்ளி மாணவர்"),
  ("la tante", "the aunt", "அத்தை / சித்தி"),
]))
A(tip("The wordwall link she sent that day · அன்று அவர் அனுப்பிய இணைப்பு",
  """<b>wordwall.net/resource/26226295/avoir-etre</b> — a drag-and-drop game on <i>avoir</i> vs <i>être</i>.
  Five minutes a day. It is the single fastest way to make the two verbs automatic.
  <span class="ta">avoir / être பயிற்சி விளையாட்டு. தினமும் ஐந்து நிமிடங்கள். இரு
  வினைச்சொற்களையும் தானாக வரவழைக்கும் விரைவான வழி இதுவே.</span>"""))

A(h3("Text 3 — Madame Dubois", "உரை 3 — Madame Dubois"))
A(txt("""<b>Madame Dubois a envie de faire quelque chose ce week-end. Elle a envie d'aller au cinéma, il y a un
  film policier à la séance de 17 heures. Mais son mari n'a pas envie de sortir. Demain il va à la piscine et
  aujourd'hui, il préfère rester chez lui pour écrire des lettres ou regarder la télévision. Madame Dubois va
  donc faire une promenade seule. Les Dubois ont deux enfants : Paul et Julie.</b>""",
  'podcastfrancaisfacile.com/texte/la-famille-dubois.html — she sent this link twice, on 18 and 22 June.'))
A(duo("""<p><b>Translation.</b> Mrs Dubois feels like doing something this weekend. She feels like going to the
  cinema; there is a detective film at the 5 p.m. showing. But her husband does not feel like going out.
  Tomorrow he is going to the swimming pool, and today he prefers to stay at home to write letters or watch
  television. So Mrs Dubois is going to go for a walk alone. The Dubois have two children: Paul and Julie.</p>""",
  """<p><b>மொழிபெயர்ப்பு.</b> திருமதி Dubois-க்கு இந்த வார இறுதியில் ஏதாவது செய்ய ஆசை. திரைப்படத்திற்குச் செல்ல
  ஆசை; மாலை 5 மணிக் காட்சியில் ஒரு துப்பறியும் படம் உள்ளது. ஆனால் அவரது கணவருக்கு வெளியே செல்ல விருப்பமில்லை.
  நாளை அவர் நீச்சல் குளத்திற்குச் செல்கிறார்; இன்று வீட்டிலேயே இருந்து கடிதங்கள் எழுதவோ தொலைக்காட்சி பார்க்கவோ
  விரும்புகிறார். எனவே திருமதி Dubois தனியாக நடைப்பயணம் செல்கிறார். Dubois தம்பதிக்கு இரு குழந்தைகள்:
  Paul, Julie.</p>"""))
A(vocab([
  ("avoir envie de + infinitive", "to feel like (doing) — <b>her key structure</b>. <i>J'ai envie de manger.</i>", "… செய்ய ஆசைப்பட"),
  ("faire", "to do, to make", "செய்ய"),
  ("quelque chose", "something", "ஏதாவது"),
  ("aller", "to go", "செல்ல"),
  ("policier (adj.)", "police, detective — <i>un film policier</i> = a detective film", "துப்பறியும் (படம்)"),
  ("la séance", "the showing, the time-slot (cinema)", "காட்சி நேரம்"),
  ("dix-sept (17)", "seventeen — <i>17 heures</i> = 5 p.m.", "பதினேழு"),
  ("le mari", "the husband", "கணவர்"),
  ("sortir", "to go out", "வெளியே செல்ல"),
  ("demain", "tomorrow", "நாளை"),
  ("aujourd'hui", "today", "இன்று"),
  ("la piscine", "the swimming pool", "நீச்சல் குளம்"),
  ("rester", "to stay, to remain", "தங்க, இருக்க"),
  ("chez (prép.)", "at the home of — <i>chez lui</i> = at his place, <i>chez moi</i> = at mine", "… வீட்டில்"),
  ("écrire", "to write", "எழுத"),
  ("une lettre", "a letter", "கடிதம்"),
  ("regarder", "to watch, to look at", "பார்க்க"),
  ("une promenade", "a walk", "நடைப்பயணம்"),
  ("seul / seule", "alone", "தனியாக"),
  ("donc", "so, therefore", "எனவே"),
  ("voir", "to see — she added it while questioning you", "காண"),
  ("à votre avis", "in your opinion", "உங்கள் கருத்தில்"),
  ("je suis d'accord", "I agree", "நான் ஒப்புக்கொள்கிறேன்"),
  ("paresseux", "lazy — your verdict on Monsieur Dubois", "சோம்பேறி"),
  ("triste", "sad", "சோகமான"),
]))
A(h4("The questions she asked you on this text", "இந்த உரையில் அவர் கேட்ட கேள்விகள்"))
A(table(("Her question", "English", "தமிழ்", "Model answer <span class='ta'>மாதிரி விடை</span>"),
 [("<span class='fr'>Qu'est-ce que Madame Dubois a envie de faire ce week-end ?</span>", "What does Mrs Dubois feel like doing this weekend?", "இந்த வார இறுதியில் அவர் என்ன செய்ய விரும்புகிறார்?", "<span class='fr'>Elle a envie d'aller au cinéma.</span>"),
  ("<span class='fr'>Pour voir quoi ?</span>", "To see what?", "எதைப் பார்க்க?", "<span class='fr'>Pour voir un film policier.</span>"),
  ("<span class='fr'>Qu'est-ce que Monsieur Dubois a envie de faire ?</span>", "What does Mr Dubois feel like doing?", "திரு. Dubois என்ன செய்ய விரும்புகிறார்?", "<span class='fr'>Il a envie de rester chez lui, d'écrire des lettres et de regarder la télévision.</span>"),
  ("<span class='fr'>À votre avis, comment est Monsieur Dubois ?</span>", "In your opinion, what is Mr Dubois like?", "உங்கள் கருத்தில் அவர் எப்படிப்பட்டவர்?", "<span class='fr'>À mon avis, il est paresseux. — Je suis d'accord !</span> (Cindy's reply)")]))

A(h3("faire du / jouer à — the rule that trips up every learner", "faire du / jouer à — ஒவ்வொரு மாணவரையும் தடுக்கும் விதி"))
A(rule("à + le = au. de + le = du. This contraction is compulsory.", "à + le = au. de + le = du. இந்தச் சுருக்கம் கட்டாயம்.",
  """<div class="duo"><div>Cindy wrote it as bare arithmetic: <b>à + le = au</b>. It is not a style choice — writing
  <i>à le cinéma</i> is simply wrong, the way <i>“I are”</i> is wrong. The full set:</div>
  <div class="ta-col">சிண்டி இதைக் கணிதம் போல எழுதினார்: <b>à + le = au</b>. இது பாணித் தேர்வு அல்ல —
  <i>à le cinéma</i> என்று எழுதுவது வெறுமனே தவறு. முழுத் தொகுப்பு:</div></div>""" +
  table(("", "+ le (m.)", "+ la (f.)", "+ l' (vowel)", "+ les (plural)"),
   [("<b>à</b> (to, at)", "<b class='fr'>au</b> — <span class='fr'>au cinéma</span>", "<span class='fr'>à la</span> — <span class='fr'>à la piscine</span>", "<span class='fr'>à l'</span> — <span class='fr'>à l'école</span>", "<b class='fr'>aux</b> — <span class='fr'>aux enfants</span>"),
    ("<b>de</b> (of, from, some)", "<b class='fr'>du</b> — <span class='fr'>du sport</span>", "<span class='fr'>de la</span> — <span class='fr'>de la musique</span>", "<span class='fr'>de l'</span> — <span class='fr'>de l'eau</span>", "<b class='fr'>des</b> — <span class='fr'>des amis</span>")])))
A(rule("Sport and hobbies: faire + de, jouer + à", "விளையாட்டும் பொழுதுபோக்கும்: faire + de, jouer + à",
  """<div class="duo"><div><b>faire du / de la / de l'</b> = to <b>practise</b> an activity — sports you do, instruments
  you play, activities in general.<br>
  <span class="fr">faire <b>du</b> sport, faire <b>du</b> vélo, faire <b>de la</b> natation, faire <b>de l'</b>escalade,
  faire <b>une</b> randonnée, faire <b>une</b> promenade</span><br><br>
  <b>jouer à</b> = to play a <b>game or sport with rules</b>.<br>
  <span class="fr">jouer <b>au</b> football, jouer <b>au</b> tennis, jouer <b>aux</b> cartes, jouer <b>à</b> un jeu</span>
  — your own sentence in the chat was <span class="fr">je joue au football</span>, and it was right.<br><br>
  <b>jouer de</b> = to play an <b>instrument</b>.<br>
  <span class="fr">jouer <b>du</b> piano, jouer <b>de la</b> guitare, jouer <b>de l'</b>accordéon</span></div>
  <div class="ta-col"><b>faire du / de la / de l'</b> = ஒரு செயலைப் <b>பயிற்சி செய்தல்</b> — விளையாட்டு,
  பொது நடவடிக்கைகள்.<br>
  <b>jouer à</b> = <b>விதிகளுடன் கூடிய விளையாட்டை</b> ஆடுதல். உரையாடலில் நீங்கள் எழுதிய
  <span class="fr">je joue au football</span> சரியானது.<br>
  <b>jouer de</b> = ஒரு <b>இசைக்கருவியை</b> வாசித்தல்.<br>
  வேறுபாட்டை நினைவில் வையுங்கள்: <b>à</b> = விளையாட்டு, <b>de</b> = கருவி.</div></div>"""))
A(figrow([
  ('image18.png', 'Image Cindy sent — A1 sports & leisure', "The A1 sheet: <b>faire du sport</b> vs <b>jouer à un sport</b>, with the contracted articles in the right-hand columns.", "A1 தாள்: faire du sport / jouer à un sport, சுருங்கிய இடைச்சொற்களுடன்."),
  ('image19.png', 'Image Cindy sent — A2 leisure', "The A2 version, with more sports and the reminder <b>jouer au / à la / à l' / aux + NOM</b> and <b>jouer du / de la / de l' + NOM</b>.", "A2 பதிப்பு — அதிக விளையாட்டுகளுடன்."),
]))
A(vocab([
  ("un loisir", "a hobby, a leisure activity — she glossed it as <i>un hobby</i>", "பொழுதுபோக்கு"),
  ("faire du sport", "to do sport", "விளையாட்டு விளையாட"),
  ("jouer à un jeu", "to play a game", "விளையாட்டு ஆட"),
  ("une randonnée", "a hike, hiking", "நடைப்பயணம் (மலை)"),
  ("le roller", "roller-skating — <i>faire du roller</i>", "ரோலர் ஸ்கேட்டிங்"),
  ("dessiner", "to draw", "வரைய"),
  ("tricoter", "to knit", "பின்ன"),
  ("la lecture", "reading (the activity)", "வாசிப்பு"),
  ("lire", "to read (the verb)", "படிக்க"),
  ("se promener", "to go for a walk — <i>je me promène</i> (reflexive)", "உலாவ"),
  ("les vacances (f. plur.)", "the holidays — <b>always plural</b>", "விடுமுறை"),
  ("la télévision", "television", "தொலைக்காட்சி"),
  ("le cinéma", "the cinema", "திரையரங்கு"),
]))
A(tip("« -er- » — the note she left you hanging · அவர் விட்டுச் சென்ற குறிப்பு",
  """<div class="duo"><div>In the middle of the hobbies list she typed just <b>-er-</b>. She meant: almost every verb
  in that list belongs to the <b>first group</b>, the <i>-er</i> verbs, and they all conjugate identically.
  Learn one, you have learnt eight hundred: <span class="fr">dessiner, tricoter, regarder, écouter, jouer,
  parler, habiter, travailler, aimer, préférer, rester, porter, chanter, danser, nager, marcher</span>.<br>
  Endings: <b>-e, -es, -e, -ons, -ez, -ent</b>. The last one, <i>-ent</i>, is <b>silent</b> —
  <span class="fr">ils dessinent</span> sounds exactly like <span class="fr">il dessine</span>.</div>
  <div class="ta-col">பொழுதுபோக்குப் பட்டியலின் நடுவே <b>-er-</b> என்று மட்டும் எழுதினார். அவர் சொன்னது:
  அப்பட்டியலின் கிட்டத்தட்ட ஒவ்வொரு வினைச்சொல்லும் <b>முதல் குழு</b> — <i>-er</i> வினைச்சொற்கள்; அனைத்தும்
  ஒரே மாதிரி மாறும். ஒன்றைக் கற்றால் எண்ணூறு கற்றது.<br>
  விகுதிகள்: <b>-e, -es, -e, -ons, -ez, -ent</b>. கடைசி <i>-ent</i> <b>ஒலிக்காது</b>.</div></div>""" +
  conj("dessiner <span class='gloss'>to draw — the model -er verb</span>", "வரைதல்",
   ["je dessin<b>e</b>", "tu dessin<b>es</b>", "il/elle dessin<b>e</b>", "nous dessin<b>ons</b>", "vous dessin<b>ez</b>", "ils/elles dessin<b>ent</b>"]) +
  conj("aller <span class='gloss'>to go — irregular, learn it now</span>", "செல்லுதல்",
   ["je <b>vais</b>", "tu <b>vas</b>", "il/elle <b>va</b>", "nous <b>allons</b>", "vous <b>allez</b>", "ils/elles <b>vont</b>"]) +
  conj("faire <span class='gloss'>to do/make — irregular</span>", "செய்தல்",
   ["je <b>fais</b>", "tu <b>fais</b>", "il/elle <b>fait</b>", "nous <b>faisons</b>", "vous <b>faites</b>", "ils/elles <b>font</b>"]) +
  '<div style="clear:both"></div>'))

A(fig('image20.png', 'Image Cindy sent — the exercise, blank',
  "<span class='fr'>Qu'est-ce qu'ils aiment faire ? Écris des phrases.</span> — five people, five objects: a tennis "
  "racket, a football, a laptop, a guitar, roller skates. Ten points.",
  "<span class='fr'>அவர்கள் என்ன செய்ய விரும்புகிறார்கள்? வாக்கியங்கள் எழுதுங்கள்.</span> — ஐந்து பேர், ஐந்து பொருட்கள்."))
A(fig('image21.png', 'Image Cindy sent — the same exercise, filled in with you',
  "The answers you built together: <span class='fr'>a. Sandrine aime <b>faire du tennis</b>. b. Pascal <b>fait du "
  "football</b>. c. Luc <b>aime l'ordinateur</b>. d. Paul <b>joue de la guitare</b>. e. Sophie <b>aime faire du "
  "roller</b>.</span> Note how <b>d</b> uses <i>jouer de</i> (an instrument) while <b>a</b> and <b>e</b> use "
  "<i>faire du</i> (an activity) — the whole rule in one exercise.",
  "நீங்கள் இருவரும் சேர்ந்து உருவாக்கிய விடைகள். <b>d</b> இசைக்கருவிக்கு <i>jouer de</i>; <b>a</b>, <b>e</b> "
  "செயலுக்கு <i>faire du</i> — முழு விதியும் ஒரே பயிற்சியில்."))

A(drill("Writing drill 4.1 — faire, jouer à, or jouer de? Fill in and write the full sentence",
        "எழுத்துப் பயிற்சி 4.1 — faire, jouer à, அல்லது jouer de? நிரப்பி முழு வாக்கியத்தை எழுதுங்கள்",
  numlines([
    "Je ______ vélo tous les jours. <span class='ta'>தினமும் சைக்கிள் ஓட்டுகிறேன்.</span>",
    "Elle ______ piano depuis dix ans. <span class='ta'>பத்து ஆண்டுகளாக பியானோ வாசிக்கிறாள்.</span>",
    "Nous ______ football le samedi. <span class='ta'>சனிக்கிழமை கால்பந்து ஆடுகிறோம்.</span>",
    "Ils ______ natation à la piscine. <span class='ta'>நீச்சல் குளத்தில் நீந்துகிறார்கள்.</span>",
    "Tu ______ guitare ou ______ accordéon ? <span class='ta'>கிட்டார் வாசிக்கிறாயா அக்கார்டியனா?</span>",
    "Vous ______ cartes le soir ? <span class='ta'>மாலையில் சீட்டு ஆடுகிறீர்களா?</span>",
    "Mon frère ______ escalade et ______ randonnée. <span class='ta'>என் சகோதரர் மலையேற்றமும் நடைப்பயணமும்.</span>",
    "Julie ______ tennis avec sa sœur. <span class='ta'>Julie தன் சகோதரியுடன் டென்னிஸ் ஆடுகிறாள்.</span>",
  ])))
A(key("""1. <span class="fr">fais du</span> · 2. <span class="fr">joue du</span> · 3. <span class="fr">jouons au</span> ·
4. <span class="fr">font de la</span> · 5. <span class="fr">joues de la … de l'</span> ·
6. <span class="fr">jouez aux</span> · 7. <span class="fr">fait de l' … de la</span> ·
8. <span class="fr">joue au</span>."""))

A(drill("Writing drill 4.2 — rewrite the Madame Dubois text about yourself and your own weekend",
        "எழுத்துப் பயிற்சி 4.2 — Madame Dubois உரையை உங்கள் சொந்த வார இறுதி பற்றி மீண்டும் எழுதுங்கள்",
  """<div class="duo"><div>Same structure, your life. Use <b>avoir envie de</b> at least twice, <b>ne … pas</b> once,
  <b>demain</b> and <b>aujourd'hui</b> once each, and finish with what you are going to do
  (<span class="fr">Je vais donc…</span>). Eight sentences.</div>
  <div class="ta-col">அதே அமைப்பு, உங்கள் வாழ்க்கை. <b>avoir envie de</b> குறைந்தது இரு முறை,
  <b>ne … pas</b> ஒரு முறை, <b>demain</b>, <b>aujourd'hui</b> தலா ஒரு முறை; இறுதியில் நீங்கள் என்ன செய்யப்
  போகிறீர்கள் என்று முடியுங்கள். எட்டு வாக்கியங்கள்.</div></div>""" + lines(14)))
A(pb())

# ============================ LESSON 5 ============================
A(sec("5", "22 June — Les enfants Dubois, and the whole family", "ஜூன் 22 — Dubois குழந்தைகள், முழுக் குடும்பம்"))
A(vocab([("dans les réunions", "in the meetings — the phrase you needed for work that day", "கூட்டங்களில்")]))
A(h3("Text 4 — Les enfants Dubois", "உரை 4 — Dubois குழந்தைகள்"))
A(txt("""<b>Les Dubois ont deux enfants : Paul et Julie. Ils font du piano tous les deux. Ils ont leur leçon de
  piano de 5 heures à 6 heures. Ils étudient le piano tous les jours pendant environ une heure. Ils sont très
  gentils et ils travaillent beaucoup à l'école. Ils vont au collège. Leur rêve, c'est de devenir professeur de
  piano. Paul aime bien embêter sa sœur. Comme elle a horreur des insectes, il met de temps en temps un cafard
  ou une araignée dans la chambre de sa sœur. Et c'est toujours pareil. Elle crie très fort et son frère rit
  beaucoup.</b>""", 'podcastfrancaisfacile.com/texte/la-famille-dubois.html'))
A(duo("""<p><b>Translation.</b> The Dubois have two children: Paul and Julie. They both play the piano. They have
  their piano lesson from 5 to 6 o'clock. They study the piano every day for about an hour. They are very kind
  and they work hard at school. They go to middle school. Their dream is to become a piano teacher. Paul rather
  likes annoying his sister. As she has a horror of insects, he now and then puts a cockroach or a spider in his
  sister's bedroom. And it is always the same. She screams very loudly and her brother laughs a lot.</p>
  <p><b>Notice:</b> <span class="fr">ils font <b>du</b> piano</span> (they practise it, as an activity) and
  <span class="fr">leur leçon <b>de</b> piano</span> — while to play it as an instrument you would say
  <span class="fr">ils jouent <b>du</b> piano</span>. All three are correct French; they are simply different
  angles on the same activity.</p>""",
  """<p><b>மொழிபெயர்ப்பு.</b> Dubois தம்பதிக்கு இரு குழந்தைகள்: Paul, Julie. இருவரும் பியானோ கற்கிறார்கள்.
  5 மணி முதல் 6 மணி வரை பியானோ பாடம். தினமும் சுமார் ஒரு மணி நேரம் பயிற்சி. மிகவும் அன்பானவர்கள், பள்ளியில்
  நன்றாகப் படிக்கிறார்கள். இடைநிலைப் பள்ளிக்குச் செல்கிறார்கள். அவர்களின் கனவு பியானோ ஆசிரியராவது. Paul தன்
  சகோதரியை சீண்டுவதை விரும்புகிறான். அவளுக்குப் பூச்சிகளைக் கண்டால் பயம் என்பதால், அவ்வப்போது ஒரு கரப்பான்
  பூச்சியையோ சிலந்தியையோ அவள் அறையில் வைக்கிறான். எப்போதும் அதுவே நடக்கும் — அவள் உரக்கக் கத்துகிறாள், அவன்
  வெகுவாகச் சிரிக்கிறான்.</p>"""))
A(vocab([
  ("cinq (5) / six (6)", "five / six — she spelled both out", "ஐந்து / ஆறு"),
  ("tous les deux", "both of them", "இருவரும்"),
  ("tous les jours", "every day", "தினமும்"),
  ("tous", "all — she noted it separately", "எல்லாம்"),
  ("pendant", "during, for (a duration)", "… நேரம்"),
  ("environ", "about, approximately — she wrote it as <b>+/-</b>", "சுமார்"),
  ("gentil / gentille", "kind, nice", "அன்பான"),
  ("beaucoup", "a lot, much", "நிறைய"),
  ("le collège", "middle school — she specified: <b>12 to 15 years old</b>", "இடைநிலைப் பள்ளி"),
  ("un rêve", "a dream", "கனவு"),
  ("devenir", "to become", "ஆக, மாற"),
  ("embêter", "to annoy, to bother, to pester", "சீண்ட, தொந்தரவு செய்ய"),
  ("avoir horreur de", "to loathe, to have a horror of", "வெறுக்க, பயப்பட"),
  ("mettre", "to put — <i>il met</i>", "வைக்க"),
  ("de temps en temps", "from time to time", "அவ்வப்போது"),
  ("un cafard", "a cockroach", "கரப்பான் பூச்சி"),
  ("une araignée", "a spider", "சிலந்தி"),
  ("la chambre", "the bedroom", "படுக்கையறை"),
  ("pareil / pareille", "the same, alike", "ஒரே மாதிரி"),
  ("toujours", "always", "எப்போதும்"),
  ("crier", "to scream, to shout", "கத்த"),
  ("fort", "loudly, strongly", "உரக்க, பலமாக"),
  ("le frère", "the brother", "சகோதரன்"),
  ("rire", "to laugh — she typo'd “maugh”, she meant <b>to laugh</b>", "சிரிக்க"),
  ("un papillon", "a butterfly — from your own sentence <i>j'aime les papillons</i>", "வண்ணத்துப்பூச்சி"),
  ("dangereux / dangereuse", "dangerous", "ஆபத்தான"),
  ("un serpent", "a snake — <i>un serpent dans le jardin</i>", "பாம்பு"),
  ("le jardin", "the garden", "தோட்டம்"),
  ("une batte", "a bat (the stick)", "மட்டை"),
  ("un insecticide", "an insecticide", "பூச்சிக்கொல்லி"),
  ("plus", "more, plus — she wrote it as <b>+</b>", "மேலும்"),
]))
A(fig('image22.png', 'Image Cindy sent', "<span class='fr'>un lucane</span> — a stag beetle. It came up when you told her about the Golden Birdwing, India's largest butterfly (<i>Troides aeacus</i>, wingspan up to 194 mm). Her reply: <span class='fr'>un troides aeacus</span> — you had earned an article.",
  "<span class='fr'>un lucane</span> — கொம்பு வண்டு. இந்தியாவின் மிகப்பெரிய வண்ணத்துப்பூச்சி பற்றி நீங்கள் சொன்னபோது வந்தது.", size='figsm'))
A(warn("Two of your own sentences she corrected that day · அன்று அவர் திருத்திய உங்கள் இரு வாக்கியங்கள்",
  """<div class="duo"><div>You wrote <i>venir à l'intérieur</i> for “to come inside” — she accepted it and gave you the
  gloss. And you wrote <i>recounstitute</i>; she replied <b>reconstitute</b>. Small, but it shows the habit worth
  keeping: <b>write it, get it corrected, write it again correctly.</b> That third step is the one most learners
  skip.<br><br>Your other sentences from that day, worth keeping as models:<br>
  <span class="fr">Nous avons toujours une batte à la maison.</span> <span class="gloss">We always have a bat at home.</span><br>
  <span class="fr">Un serpent dans le jardin.</span> <span class="gloss">A snake in the garden.</span><br>
  <span class="fr">J'aime les papillons.</span> <span class="gloss">I like butterflies.</span></div>
  <div class="ta-col">“உள்ளே வர” என்பதற்கு <i>venir à l'intérieur</i> என எழுதினீர்கள் — அவர் ஏற்றுக்கொண்டார்.
  <i>recounstitute</i> என எழுதியதை <b>reconstitute</b> எனத் திருத்தினார். சிறியது, ஆனால் வைத்துக்கொள்ள
  வேண்டிய பழக்கத்தைக் காட்டுகிறது: <b>எழுதுங்கள், திருத்தம் பெறுங்கள், சரியாக மீண்டும் எழுதுங்கள்.</b>
  மூன்றாவது படியைத்தான் பெரும்பாலானோர் தவறவிடுகிறார்கள்.</div></div>"""))

A(h3("The hyphen that changes everything", "எல்லாவற்றையும் மாற்றும் இணைப்புக்கோடு"))
A(rule("« la grand-mère — the hyphen is important »", "« la grand-mère — இணைப்புக்கோடு முக்கியம் »",
  """<div class="duo"><div>She named the mark first — <span class="fr">le tiret</span> (the hyphen, written <b>-</b>) —
  and then made the point twice, once on 22 June and again on 8 July. In French the hyphen <b>welds two words
  into one new word</b> with its own meaning:<br><br>
  <span class="fr">la <b>petite-fille</b></span> = the <b>granddaughter</b> (one word, one idea)<br>
  <span class="fr">la <b>fille petite</b></span> = the <b>small girl</b> (two words, literal)<br><br>
  On 8 July you wrote <i>La fille petite</i> and she answered with the correction in a single line:
  <b>La petite-fille</b>. Same three words, entirely different family member.</div>
  <div class="ta-col">முதலில் குறியீட்டுக்குப் பெயரிட்டார் — <span class="fr">le tiret</span> (இணைப்புக்கோடு) —
  பிறகு இரு முறை வலியுறுத்தினார். பிரெஞ்சில் இணைப்புக்கோடு <b>இரு வார்த்தைகளை ஒரே புதிய வார்த்தையாக</b>
  இணைக்கிறது:<br><br>
  <span class="fr">la <b>petite-fille</b></span> = <b>பேத்தி</b><br>
  <span class="fr">la <b>fille petite</b></span> = <b>சிறிய பெண்</b><br><br>
  ஜூலை 8 அன்று நீங்கள் <i>La fille petite</i> என எழுதியபோது ஒரே வரியில் திருத்தினார்: <b>La petite-fille</b>.
  அதே வார்த்தைகள், முற்றிலும் வேறு உறவினர்.</div></div>"""))
A(vocab([
  ("le tiret ( - )", "the hyphen", "இணைப்புக்கோடு"),
  ("la grand-mère", "the grandmother", "பாட்டி"),
  ("le grand-père", "the grandfather", "தாத்தா"),
  ("les grands-parents", "the grandparents", "தாத்தா பாட்டி"),
  ("la petite-fille", "the granddaughter", "பேத்தி"),
  ("le petit-fils", "the grandson", "பேரன்"),
  ("les petits-enfants", "the grandchildren", "பேரக்குழந்தைகள்"),
  ("la grand-tante", "the great-aunt", "பாட்டியின் சகோதரி"),
  ("le grand-oncle", "the great-uncle", "தாத்தாவின் சகோதரர்"),
  ("la belle-mère", "the step-mother <b>or</b> the mother-in-law — French uses one word for both", "மாற்றாந்தாய் / மாமியார்"),
  ("le beau-père", "the step-father or the father-in-law", "மாற்றாந்தந்தை / மாமனார்"),
  ("la belle-sœur", "the sister-in-law", "நாத்தனார் / மைத்துனி"),
  ("le beau-frère", "the brother-in-law", "மைத்துனர்"),
  ("la demi-sœur", "the half-sister", "ஒன்றுவிட்ட சகோதரி"),
  ("le demi-frère", "the half-brother", "ஒன்றுவிட்ட சகோதரன்"),
]))
A(tip("« une baguette et demie » — her aside on <i>demi</i>", "« une baguette et demie » — <i>demi</i> பற்றிய குறிப்பு",
  """<div class="duo"><div>She slipped this in beside <i>demi-sœur</i>. <b>demi</b> = half. Before the noun, joined by a
  hyphen, it never changes: <span class="fr">une demi-heure, une demi-baguette, un demi-frère</span>. After the
  noun, joined by <i>et</i>, it agrees: <span class="fr">une baguette <b>et demie</b>, une heure <b>et demie</b>,
  un kilo <b>et demi</b></span>. You will need the second form the moment you tell the time —
  <span class="fr">Il est deux heures et demie.</span></div>
  <div class="ta-col"><i>demi-sœur</i> அருகே இதைச் சொன்னார். <b>demi</b> = அரை. பெயர்ச்சொல்லுக்கு முன்,
  இணைப்புக்கோட்டுடன் — ஒருபோதும் மாறாது. பெயர்ச்சொல்லுக்குப் பின், <i>et</i>-உடன் — ஒப்புமை கொள்ளும்.
  நேரம் சொல்லும்போது இரண்டாவது வடிவம் தேவைப்படும்: <span class="fr">Il est deux heures et demie.</span></div></div>"""))
A(h4("Birth order and the rest of the family", "பிறப்பு வரிசையும் மற்ற உறவினர்களும்"))
A(vocab([
  ("l'aîné / l'aînée", "the eldest (m. / f.)", "மூத்தவர்"),
  ("le benjamin / la benjamine", "the middle one of three (as Cindy used it) — more usually the youngest", "நடுவிலுள்ளவர் / இளையவர்"),
  ("le cadet / la cadette", "the younger, the last-born of three", "இளையவர்"),
  ("une fille unique", "an only child (daughter)", "ஒரே மகள்"),
  ("un fils unique", "an only child (son)", "ஒரே மகன்"),
  ("maternel / maternelle", "maternal, on the mother's side", "தாய்வழி"),
  ("paternel / paternelle", "paternal, on the father's side", "தந்தைவழி"),
  ("un cousin éloigné", "a distant cousin", "தூர உறவினர்"),
  ("un neveu", "a nephew (plural <i>neveux</i>)", "மருமகன்"),
  ("une nièce", "a niece", "மருமகள்"),
  ("un oncle", "an uncle", "மாமா"),
  ("une tante", "an aunt", "அத்தை"),
  ("un cousin / une cousine", "a cousin", "உறவுச் சகோதரர்"),
  ("les parents", "the parents (also: relatives)", "பெற்றோர்"),
  ("un enfant / une enfant", "a child", "குழந்தை"),
]))
A(figrow([
  ('image23.png', 'Image Cindy sent', "The family picture with every member labelled: <span class='fr'>la famille, le père, la mère, le grand-père, la grand-mère, la tante, l'oncle, le frère, la sœur, le cousin, la cousine</span>.", "ஒவ்வொரு உறுப்பினரும் பெயரிடப்பட்ட குடும்பப் படம்."),
  ('image24.png', 'Image Cindy sent — the riddle cards', "<span class='fr'>Les membres de la famille</span> — each card describes a relative (<i>Il est le père de mon père</i> = my grandfather) and you name them.", "ஒவ்வொரு அட்டையும் ஓர் உறவினரை விவரிக்கிறது; நீங்கள் பெயரிட வேண்டும்."),
]))
A(fig('image25.png', 'Image Cindy sent — the same cards, answered with you',
  "Your answers written in: <span class='fr'>c'est mon grand-père · c'est mon grand-oncle · c'est mon père ou "
  "mon oncle · c'est mon oncle · c'est ma cousine</span> …",
  "நீங்கள் இருவரும் சேர்ந்து நிரப்பிய விடைகள்.", size='figwide'))
A(fig('image26.png', 'Image Cindy sent — the family tree (Didier & Marie)',
  "The three-generation tree: <b>les grands-parents</b> Didier and Marie · <b>les parents</b> Pierre &amp; Annette "
  "and Claudie &amp; Jacques · <b>les enfants</b> Berthe, Bernard, Zoé, Gaston. She also sent the colour version: "
  "images.jedessine.com/…/full-6688-la-famille-1-source_2wf.jpg",
  "மூன்று தலைமுறை மரம்: தாத்தா பாட்டி Didier, Marie · பெற்றோர் · குழந்தைகள்."))
A(fig('image27.png', 'Your own handwriting — the family-tree homework',
  "You wrote: <i>Didier est le grand-père. Marie est la grand-mère. Pierre est le père. Annette est la mère. "
  "Claudie est la tante. Jacques est l'oncle. Berthe est la petite-fille de Didier et Marie. Bernard est le "
  "petit-fils de Didier et Marie.</i> Eight correct sentences, in ink, with the hyphens in the right places.",
  "நீங்கள் எழுதிய எட்டு சரியான வாக்கியங்கள் — இணைப்புக்கோடுகள் சரியான இடத்தில்.", size='figsm'))
A(fig('image28.png', 'Your own handwriting — the two she asked for next',
  "<i>Gaston est le neveu de Pierre et Annette. Zoé est la nièce de Pierre et Annette.</i> Correct. Note that "
  "you had to choose between <b>neveu</b> and <b>nièce</b> — the gender of the person, not of the word.",
  "<i>Gaston மருமகன், Zoé மருமகள்.</i> சரி. வார்த்தையின் பாலல்ல, நபரின் பாலைத் தேர்ந்தெடுக்க வேண்டியிருந்தது.", size='figsm'))

A(rule("SVO — « une phrase »", "SVO — « ஒரு வாக்கியம் »",
  """<div class="duo"><div>She wrote three letters and one word: <b>SVO : une phrase</b>. A French sentence is
  <b>S</b>ubject + <b>V</b>erb + <b>O</b>bject, in that order, and unlike Tamil the order is not negotiable —
  it is what tells you who is doing what.<br><br>
  <span class="fr"><b>Paul</b> (S) <b>met</b> (V) <b>une araignée</b> (O) dans la chambre.</span><br>
  Change the order and you change the meaning, or you produce nonsense. Tamil marks the roles with case endings
  and can move the words freely; French marks them with <b>position</b>. This one difference causes more
  beginner errors for Tamil speakers than any other single thing.</div>
  <div class="ta-col">மூன்று எழுத்துகளும் ஒரு வார்த்தையும் எழுதினார்: <b>SVO : une phrase</b>. பிரெஞ்சு வாக்கியம்
  = <b>எழுவாய் + வினை + செயப்படுபொருள்</b>, அதே வரிசையில். தமிழைப் போலல்லாமல் இந்த வரிசை மாற்ற முடியாதது —
  யார் என்ன செய்கிறார் என்பதைச் சொல்வதே அதுதான்.<br><br>
  தமிழ் வேற்றுமை உருபுகளால் பங்குகளைக் குறிக்கிறது; சொற்களை எப்படியும் நகர்த்தலாம். பிரெஞ்சு
  <b>இடத்தால்</b> குறிக்கிறது. தமிழ் பேசுபவர்களுக்கு மற்ற எதையும் விட இந்த ஒரு வேறுபாடே அதிகத் தவறுகளை
  உருவாக்குகிறது.</div></div>"""))

A(drill("Writing drill 5.1 — your own family tree, in French",
        "எழுத்துப் பயிற்சி 5.1 — உங்கள் சொந்தக் குடும்ப மரம், பிரெஞ்சில்",
  """<div class="duo"><div>Twelve sentences. Use <b>at least six hyphenated words</b> (grand-père, belle-mère,
  petits-enfants…). Start each with the person's name, as you did with Didier and Marie. Then add two sentences
  using <b>maternel</b> and <b>paternel</b>, and one using <b>aîné</b> or <b>cadet</b>.</div>
  <div class="ta-col">பன்னிரண்டு வாக்கியங்கள். <b>குறைந்தது ஆறு இணைப்புக்கோடு வார்த்தைகள்</b>
  பயன்படுத்துங்கள். Didier, Marie-யுடன் செய்ததுபோல ஒவ்வொன்றையும் நபரின் பெயருடன் தொடங்குங்கள். பிறகு
  <b>maternel</b>, <b>paternel</b> கொண்ட இரு வாக்கியங்கள்; <b>aîné</b> அல்லது <b>cadet</b> கொண்ட ஒன்று.</div></div>"""
  + lines(16)))
A(drill("Writing drill 5.2 — retell the story of Paul and the spider in your own words",
        "எழுத்துப் பயிற்சி 5.2 — Paul மற்றும் சிலந்தியின் கதையை உங்கள் சொற்களில் சொல்லுங்கள்",
  """<p class="gloss">Six to eight sentences, present tense. Compulsory words: <span class="fr">avoir horreur de ·
  de temps en temps · toujours · pareil · crier · rire · embêter</span>.
  <span class="ta">ஆறு முதல் எட்டு வாக்கியங்கள், நிகழ்காலம். கட்டாயச் சொற்கள் மேலே.</span></p>""" + lines(10)))
A(pb())

# ============================ LESSON 6 ============================
A(sec("6", "2 July — Countries, nationalities and the gentilé", "ஜூலை 2 — நாடுகள், தேசியங்கள், gentilé"))
A(h3("Text 5 — Une famille internationale", "உரை 5 — சர்வதேசக் குடும்பம்"))
A(txt("""<b>Lucas a une famille internationale. En France, ce n'est pas rare aujourd'hui d'avoir un parent d'origine
  étrangère mais dans le cas de Lucas, c'est quand même un peu spécial. Sa femme est mexicaine, son père est
  italien et sa mère est française d'origine espagnole. Son frère est né aux États-Unis, il a donc la double
  nationalité. Le père de Lucas a longtemps travaillé en Égypte et en Indonésie. Il a aussi un oncle marié avec
  une Grecque. Son oncle et sa tante ont vécu un an en Grèce. Lucas a aussi de nombreux neveux et nièces. Un de
  ses neveux est marié avec une Portugaise.</b>""",
  'podcastfrancaisfacile.com/texte/une_famille_internationale.html'))
A(duo("""<p><b>Translation.</b> Lucas has an international family. In France it is not rare today to have a parent of
  foreign origin, but in Lucas's case it is still a little special. His wife is Mexican, his father is Italian
  and his mother is French of Spanish origin. His brother was born in the United States, so he has dual
  nationality. Lucas's father worked for a long time in Egypt and in Indonesia. He also has an uncle married to
  a Greek woman. His uncle and aunt lived a year in Greece. Lucas also has numerous nephews and nieces. One of
  his nephews is married to a Portuguese woman.</p>
  <p><b>This text is quietly teaching you the past.</b> <span class="fr">est né</span>, <span class="fr">a
  travaillé</span>, <span class="fr">ont vécu</span> — that is the <b>passé composé</b>, and Cindy pointed at
  <span class="fr">vécu &gt; vivre</span> without stopping to explain the whole tense. Volume 2 §3 explains it
  properly. Learn it and you will be able to talk about the gap in your own words.</p>""",
  """<p><b>மொழிபெயர்ப்பு.</b> Lucas-க்கு ஒரு சர்வதேசக் குடும்பம். இன்று பிரான்சில் வெளிநாட்டு வம்சாவளிப்
  பெற்றோர் இருப்பது அரிதல்ல; ஆனால் Lucas-இன் நிலை சற்று சிறப்பானது. அவரது மனைவி மெக்சிகன், தந்தை இத்தாலியர்,
  தாய் ஸ்பானிஷ் வம்சாவளிப் பிரெஞ்சுக்காரர். சகோதரர் அமெரிக்காவில் பிறந்ததால் இரட்டைக் குடியுரிமை. தந்தை
  எகிப்திலும் இந்தோனேசியாவிலும் நீண்ட காலம் பணியாற்றினார். ஒரு கிரேக்கப் பெண்ணை மணந்த மாமாவும் உண்டு.
  மாமாவும் அத்தையும் ஓராண்டு கிரேக்கத்தில் வாழ்ந்தார்கள். ஏராளமான மருமகன்கள், மருமகள்கள். ஒரு மருமகன்
  போர்த்துகீசியப் பெண்ணை மணந்திருக்கிறார்.</p>
  <p><b>இந்த உரை அமைதியாக இறந்தகாலத்தைக் கற்பிக்கிறது.</b> <span class="fr">est né, a travaillé, ont vécu</span> —
  இது <b>passé composé</b>. சிண்டி <span class="fr">vécu &gt; vivre</span> என்று சுட்டிக்காட்டினார், முழுக்
  காலத்தையும் விளக்கவில்லை. தொகுதி 2 §3-இல் முழு விளக்கம். இதைக் கற்றுக்கொண்டால், இடைவெளியைப் பற்றி உங்கள் சொந்த வார்த்தைகளில் பேச முடியும்.</p>"""))
A(vocab([
  ("étranger / étrangère", "foreign, a foreigner", "வெளிநாட்டு"),
  ("d'origine étrangère", "of foreign origin", "வெளிநாட்டு வம்சாவளி"),
  ("rare", "rare", "அரிதான"),
  ("quand même", "nonetheless, all the same, still", "இருந்தாலும்"),
  ("un peu", "a little", "கொஞ்சம்"),
  ("spécial / spéciale", "special", "சிறப்பான"),
  ("la femme", "the wife (also: the woman)", "மனைவி / பெண்"),
  ("travailler", "to work — <i>a longtemps travaillé</i> = worked for a long time", "வேலை செய்ய"),
  ("longtemps", "for a long time", "நீண்ட காலம்"),
  ("vivre → vécu", "to live → lived — she gave you the past participle", "வாழ → வாழ்ந்த"),
  ("nombreux / nombreuse", "numerous, many", "ஏராளமான"),
  ("la double nationalité", "dual nationality", "இரட்டைக் குடியுரிமை"),
  ("franco-américain", "Franco-American — the hyphen again", "பிரெஞ்சு-அமெரிக்க"),
  ("par mariage", "by marriage", "திருமணத்தின் மூலம்"),
  ("un gentilé", "a demonym — the noun naming the people of a place", "மக்கள் பெயர்"),
  ("un pays", "a country (same in singular and plural)", "நாடு"),
  ("un neveu / une nièce", "a nephew / a niece", "மருமகன் / மருமகள்"),
]))

A(h3("Capital letter or not? — the rule that decides everything here", "பெரிய எழுத்தா இல்லையா? — இங்கே எல்லாவற்றையும் தீர்மானிக்கும் விதி"))
A(rule("article + Nationality = noun (capital). être + nationality = adjective (small).",
       "இடைச்சொல் + தேசியம் = பெயர்ச்சொல் (பெரிய எழுத்து). être + தேசியம் = பெயரடை (சிறிய எழுத்து).",
  """<div class="duo"><div>Cindy compressed it into one line: <b>article (le, un…) + Nationality Adjective</b>. What
  she meant is that the <b>same word</b> does two jobs, and the capital letter tells you which:<br><br>
  <b>Noun — the person. Capital letter.</b><br>
  <span class="fr">une <b>Grecque</b></span> a Greek woman · <span class="fr">une <b>Portugaise</b></span> a
  Portuguese woman · <span class="fr">un <b>Français</b></span> a Frenchman · <span class="fr">les
  <b>Indiens</b></span> the Indians<br><br>
  <b>Adjective — the quality. Small letter.</b><br>
  <span class="fr">Elle est <b>grecque</b>.</span> · <span class="fr">Il est <b>portugais</b>.</span> ·
  <span class="fr">Je suis <b>indien</b>.</span> · <span class="fr">un film <b>français</b></span><br><br>
  <b>The language — always small.</b> <span class="fr">Je parle <b>français</b>, <b>anglais</b>, <b>tamoul</b>
  et <b>néerlandais</b>.</span><br><br>
  Her two examples were exactly the two nouns in the text: <span class="fr">une Grecque, une Portugaise</span>.</div>
  <div class="ta-col">சிண்டி இதை ஒரே வரியில் சுருக்கினார்: <b>இடைச்சொல் + தேசிய அடைமொழி</b>. அவர் சொன்னது:
  <b>ஒரே வார்த்தை</b> இரு வேலைகளைச் செய்கிறது; பெரிய எழுத்து எது என்பதைச் சொல்கிறது:<br><br>
  <b>பெயர்ச்சொல் — நபர். பெரிய எழுத்து.</b> <span class="fr">une <b>Grecque</b>, un <b>Français</b></span><br>
  <b>பெயரடை — பண்பு. சிறிய எழுத்து.</b> <span class="fr">Elle est <b>grecque</b>. Je suis <b>indien</b>.</span><br>
  <b>மொழி — எப்போதும் சிறிய எழுத்து.</b> <span class="fr">Je parle <b>tamoul</b>.</span><br><br>
  ஆங்கிலத்தில் எப்போதும் பெரிய எழுத்து; பிரெஞ்சில் இல்லை. இதுவே ஆங்கிலம் அறிந்தவர் செய்யும் பொதுத் தவறு.</div></div>"""))

A(h4("The nationality endings — the four families", "தேசிய விகுதிகள் — நான்கு குடும்பங்கள்"))
A(table(("Family <span class='ta'>குடும்பம்</span>", "Masculine", "Feminine", "Examples <span class='ta'>எடுத்துக்காட்டுகள்</span>"),
 [("<b>1 · add -e</b>", "-ais / -ain / -an / -ois", "+ <b>e</b>",
   "<span class='fr'>français → française · américain → américaine · marocain → marocaine · chinois → chinoise · portugais → portugaise · anglais → anglaise</span>"),
  ("<b>2 · double the consonant + e</b>", "-ien / -on", "-ienne / -onne",
   "<span class='fr'>italien → italienne · indien → indienne · canadien → canadienne · brésilien → brésilienne · breton → bretonne</span>"),
  ("<b>3 · -c → -que</b>", "-c", "-que",
   "<span class='fr'>turc → turque · grec → grecque</span> — both of hers"),
  ("<b>4 · already ends in -e: no change</b>", "-e", "-e",
   "<span class='fr'>belge, suisse, russe, slovaque, tchèque, arabe</span>")]))
A(warn("The correction of 13 July · ஜூலை 13 திருத்தம்",
  """<div class="duo"><div>You wrote <i>Un Turc</i> — correct, capital T, it is the noun. Then
  <span class="fr">Il est turc</span> — correct again, small t, adjective. Then she wrote a single word:
  <b>turque</b>. She was giving you the feminine, because <i>turc</i> is one of the very few adjectives that
  changes its consonant: <span class="fr">un Turc / une Turque · il est turc / elle est turque</span>. Same for
  <span class="fr">grec / grecque</span> — the feminine is built by adding <b>-que</b> to <i>grec</i>, so it is spelt with <b>cq</b>: <span class="fr">grecque</span>.</div>
  <div class="ta-col">நீங்கள் <i>Un Turc</i> என்று எழுதினீர்கள் — சரி, பெயர்ச்சொல், பெரிய T.
  <span class="fr">Il est turc</span> — சரி, பெயரடை, சிறிய t. பிறகு அவர் ஒரே வார்த்தை எழுதினார்: <b>turque</b>.
  பெண்பாலைக் கொடுத்தார் — <i>turc</i> மெய்யெழுத்தையே மாற்றும் அரிய பெயரடைகளில் ஒன்று.
  <span class="fr">grec / grecque</span>-க்கும் இதுவே.</div></div>"""))
A(fig('image29.png', 'Image Cindy sent — Les noms de pays en français',
  "Two questions to ask of every country name: <b>1 · Quel genre ?</b> — if it ends in <b>-e</b> it is feminine "
  "(<span class='fr'>la France, la Belgique, l'Inde</span>), otherwise masculine (<span class='fr'>le Japon, le "
  "Brésil</span>). <b>2 · Quel article ?</b> — <b>LA</b> feminine, <b>LE</b> masculine, <b>LES</b> plural "
  "(<span class='fr'>les Pays-Bas, les Philippines</span>). The two footnotes: the exceptions ending in -e that "
  "are still masculine, and the countries that take <b>no article at all</b>.",
  "ஒவ்வொரு நாட்டுப் பெயருக்கும் இரு கேள்விகள்: <b>1 · என்ன பால்?</b> -e-இல் முடிந்தால் பெண்பால், இல்லையேல் "
  "ஆண்பால். <b>2 · என்ன இடைச்சொல்?</b> LA / LE / LES."))
A(fig('image32.png', 'Image Cindy sent — Pays et nationalités (your unfinished homework)',
  "The worksheet she sent on 2 July with the note <b>“fill it in, beware the errors”</b> — the sheet contains "
  "deliberate mistakes. Countries down the left, nationalities to complete on the right. This is the homework "
  "the gap swallowed. Finish it; the complete key is below.",
  "ஜூலை 2 அன்று <b>“நிரப்புங்கள், தவறுகளைக் கவனியுங்கள்”</b> என்ற குறிப்புடன் அனுப்பிய பயிற்சித் தாள் — "
  "தாளில் வேண்டுமென்றே தவறுகள் உள்ளன. இடைவெளி விழுங்கிய வீட்டுப்பாடம் இதுவே. முடியுங்கள்; முழு விடை கீழே."))
A(fig('image34.jpeg', 'Your own handwriting, 13 July — the list you began',
  "<i>L'Algérie : algérien / algérienne · Les États-Unis : américain / américaine · Le Brésil : brésilien / "
  "brésilienne · Le Canada : canadien / canadienne · L'Irlande : irlandais / irlandaise · La France : français / "
  "française · La Grèce : grec / grecque · La Hollande : hollandais / hollandaise · L'Israël : israélien / "
  "israélienne · Le Japon : japonais / japonaise · Le Mexique : mexicain / mexicaine · Le Portugal : portugais / "
  "portugaise · L'Espagne : espagnol / espagnole · La Suisse : suisse / suisse · La Turquie : turc / turque.</i> "
  "Fifteen lines, written by hand, all correct.",
  "பதினைந்து வரிகள், கையெழுத்தில் — அனைத்தும் சரி.", size='figsm'))

A(h3("The complete key to that worksheet", "அந்தப் பயிற்சித் தாளின் முழு விடை"))
A(table(("Le pays <span class='ta'>நாடு</span>", "Masculin", "Féminin", "Le pays", "Masculin", "Féminin"),
 [("<span class='fr'>l'Afrique du Sud</span>", "sud-africain", "sud-africaine", "<span class='fr'>l'Italie</span>", "italien", "italienne"),
  ("<span class='fr'>l'Algérie</span>", "algérien", "algérienne", "<span class='fr'>le Japon</span>", "japonais", "japonaise"),
  ("<span class='fr'>l'Allemagne</span>", "allemand", "allemande", "<span class='fr'>le Maroc</span>", "marocain", "marocaine"),
  ("<span class='fr'>l'Angleterre</span>", "anglais", "anglaise", "<span class='fr'>le Mexique</span>", "mexicain", "mexicaine"),
  ("<span class='fr'>la Belgique</span>", "belge", "belge", "<span class='fr'>la Norvège</span>", "norvégien", "norvégienne"),
  ("<span class='fr'>le Brésil</span>", "brésilien", "brésilienne", "<span class='fr'>les Pays-Bas</span>", "néerlandais", "néerlandaise"),
  ("<span class='fr'>le Canada</span>", "canadien", "canadienne", "<span class='fr'>le Portugal</span>", "portugais", "portugaise"),
  ("<span class='fr'>la Chine</span>", "chinois", "chinoise", "<span class='fr'>la Pologne</span>", "polonais", "polonaise"),
  ("<span class='fr'>la Corée</span>", "coréen", "coréenne", "<span class='fr'>la Roumanie</span>", "roumain", "roumaine"),
  ("<span class='fr'>l'Écosse</span>", "écossais", "écossaise", "<span class='fr'>la Russie</span>", "russe", "russe"),
  ("<span class='fr'>l'Égypte</span>", "égyptien", "égyptienne", "<span class='fr'>la Suède</span>", "suédois", "suédoise"),
  ("<span class='fr'>l'Espagne</span>", "espagnol", "espagnole", "<span class='fr'>la Suisse</span>", "suisse", "suisse"),
  ("<span class='fr'>les États-Unis</span>", "américain", "américaine", "<span class='fr'>la Tunisie</span>", "tunisien", "tunisienne"),
  ("<span class='fr'>la France</span>", "français", "française", "<span class='fr'>la Turquie</span>", "turc", "turque"),
  ("<span class='fr'>la Grèce</span>", "grec", "grecque", "<span class='fr'>l'Inde</span>", "indien", "indienne"),
  ("<span class='fr'>la Hollande</span>", "hollandais", "hollandaise", "<span class='fr'>l'Indonésie</span>", "indonésien", "indonésienne"),
  ("<span class='fr'>la Hongrie</span>", "hongrois", "hongroise", "<span class='fr'>l'Irlande</span>", "irlandais", "irlandaise"),
  ("<span class='fr'>Israël</span> (no article)", "israélien", "israélienne", "<span class='fr'>le Sri Lanka</span>", "sri-lankais", "sri-lankaise"),
 ], mini=True))

A(warn("Israël — the distinction she took care to make", "Israël — அவர் கவனமாகச் செய்த வேறுபாடு",
  """<div class="duo"><div>Cindy separated three words that English speakers often blur:<br>
  <span class="fr"><b>un Israélien / une Israélienne</b></span> — a <b>citizen</b> of the State of Israel. This is
  the nationality, and it is the word you want in the country/nationality exercise.<br>
  <span class="fr"><b>un israélite</b></span> — an old, literary word for a <b>believer</b>, a member of the
  people of Israel. She wrote <i>&gt; belief</i> and <i>&gt; believer</i> against it. It is dated; do not use it
  casually.<br>
  <span class="fr"><b>un juif / une juive</b></span> — a Jewish person (religion / people). Small letter as an
  adjective, capital as a noun of a people.<br>
  She also wrote <span class="fr">la Palestine</span> beside them, without comment. And you wrote
  <span class="fr">Je crois en l'Israël</span> — the correct forms are <span class="fr">Je crois en Israël</span>
  (no article: Israël is one of the countries that takes none).</div>
  <div class="ta-col">ஆங்கிலம் பேசுபவர்கள் பெரும்பாலும் கலக்கும் மூன்று சொற்களை சிண்டி பிரித்தார்:<br>
  <span class="fr"><b>un Israélien</b></span> — இஸ்ரேல் நாட்டின் <b>குடிமகன்</b>. இதுவே தேசியம்.<br>
  <span class="fr"><b>un israélite</b></span> — <b>நம்பிக்கையாளர்</b> என்ற பழைய, இலக்கிய வார்த்தை. அவர்
  <i>&gt; belief</i>, <i>&gt; believer</i> என எழுதினார். காலாவதியானது; சாதாரணமாகப் பயன்படுத்த வேண்டாம்.<br>
  <span class="fr"><b>un juif / une juive</b></span> — யூத நபர்.<br>
  நீங்கள் <span class="fr">Je crois en l'Israël</span> என்று எழுதினீர்கள் — சரியானது
  <span class="fr">Je crois en Israël</span> (இடைச்சொல் இல்லை).</div></div>"""))
A(tip("Two more links from that day · அன்றைய இரு இணைப்புகள்",
  """<b>francaisfacile.com</b> exercise 116852 — nationalities, multiple choice.<br>
  <b>quizlet.com/390312426/french-a1-a2-verbs-flash-cards</b> — <b>the A1–A2 verb deck.</b> This one matters:
  it is the exact vocabulary the DELF A2 will test. Ten minutes a day.<br>
  <b>wordwall.net/fr/resource/5720422/les-nationalités</b> — the nationalities game.
  <span class="ta">A1–A2 வினைச்சொல் அட்டைகள் — DELF A2 சோதிக்கும் அதே சொற்கள். தினமும் பத்து நிமிடங்கள்.</span>"""))

A(drill("Writing drill 6.1 — noun or adjective? Write each sentence with the correct capitalisation",
        "எழுத்துப் பயிற்சி 6.1 — பெயர்ச்சொல்லா பெயரடையா? சரியான எழுத்துடன் எழுதுங்கள்",
  numlines([
    "Ma femme est (mexicain) ______ . <span class='ta'>என் மனைவி மெக்சிகன்.</span>",
    "Il a épousé une (grec) ______ . <span class='ta'>அவர் ஒரு கிரேக்கப் பெண்ணை மணந்தார்.</span>",
    "Je parle (tamoul) ______ et (néerlandais) ______ . <span class='ta'>நான் தமிழும் டச்சும் பேசுகிறேன்.</span>",
    "Les (belge) ______ aiment les frites. <span class='ta'>பெல்ஜியர்கள் பொரியலை விரும்புகிறார்கள்.</span>",
    "C'est un film (turc) ______ . <span class='ta'>இது ஒரு துருக்கியப் படம்.</span>",
    "Elle est (portugais) ______ , et lui est un (italien) ______ . <span class='ta'>அவள் போர்த்துகீசியர், அவர் இத்தாலியர்.</span>",
    "Nous sommes (indien) ______ . <span class='ta'>நாங்கள் இந்தியர்கள்.</span>",
    "Ma mère est (français) ______ d'origine (espagnol) ______ . <span class='ta'>என் தாய் ஸ்பானிஷ் வம்சாவளிப் பிரெஞ்சுக்காரர்.</span>",
  ])))
A(key("""1. <span class="fr">mexicaine</span> (adj., small) · 2. <span class="fr">Grecque</span> (noun, capital) ·
3. <span class="fr">tamoul … néerlandais</span> (languages, always small) · 4. <span class="fr">Belges</span> (noun, capital) ·
5. <span class="fr">turc</span> (adj., small) · 6. <span class="fr">portugaise … Italien</span> (adj. then noun) ·
7. <span class="fr">indiens</span> (adj., small) · 8. <span class="fr">française … espagnole</span> (both adj., small)."""))
A(pb())

# ============================ LESSON 7 ============================
A(sec("7", "8 July — The gender of countries", "ஜூலை 8 — நாடுகளின் பால்"))
A(duo("""<p>You began that day with <span class="fr">Un peu malade</span> — “a bit ill”. She carried on gently, and the
  whole lesson turned on a single question: <b>which article does this country take?</b> She fed you country
  names one by one and you supplied the article. Here is the full list of what passed between you, corrected.</p>""",
  """<p>அன்று நீங்கள் <span class="fr">Un peu malade</span> — “சற்று உடல்நலமில்லை” — என்று தொடங்கினீர்கள். அவர்
  மென்மையாகத் தொடர்ந்தார்; முழுப் பாடமும் ஒரே கேள்வியில் சுழன்றது: <b>இந்த நாடு எந்த இடைச்சொல்லை
  எடுக்கிறது?</b> ஒவ்வொரு நாட்டுப் பெயராகச் சொன்னார், நீங்கள் இடைச்சொல்லைக் கொடுத்தீர்கள். நடந்ததின்
  முழுப் பட்டியல், திருத்தத்துடன்:</p>"""))
A(table(("What she said <span class='ta'>அவர் சொன்னது</span>", "What you answered <span class='ta'>நீங்கள் சொன்னது</span>",
         "Correct form <span class='ta'>சரியான வடிவம்</span>", "Why <span class='ta'>ஏன்</span>"),
 [("<span class='fr'>Italie</span>", "—", "<b class='fr'>l'Italie</b> (f.)", "Ends in -e → feminine; before a vowel the article elides to <b>l'</b>."),
  ("<span class='fr'>Inde</span>", "—", "<b class='fr'>l'Inde</b> (f.)", "Ends in -e → feminine; vowel → <b>l'</b>."),
  ("<span class='fr'>Chine</span>", "—", "<b class='fr'>la Chine</b> (f.)", "Ends in -e → feminine."),
  ("<span class='fr'>Le Mexique</span>", "—", "<b class='fr'>le Mexique</b> (m.)", "<b>Exception.</b> Ends in -e but is masculine. The famous five: <span class='fr'>le Mexique, le Mozambique, le Cambodge, le Zimbabwe, le Belize</span>."),
  ("<span class='fr'>Philippines</span>", "<span class='fr'>Les Philippines</span>", "<b class='fr'>les Philippines</b>", "An archipelago — plural name, plural article. You corrected yourself."),
  ("<span class='fr'>Martinique</span>", "<span class='fr'>La Martinique</span>", "<b class='fr'>la Martinique</b>", "Island, ends in -e → feminine. You got it."),
  ("<span class='fr'>Wallis et Futuna</span>", "<span class='fr'>Wallis et Foutouna</span>", "<b class='fr'>Wallis-et-Futuna</b>", "<b>No article</b>, and note the spelling: <i>Futuna</i>, not <i>Foutouna</i>. Small territories and islands often take none."),
  ("<span class='fr'>Israël</span>", "<span class='fr'>Un Israélite</span>", "<b class='fr'>Israël</b> (no article) → <b class='fr'>un Israélien</b>", "Israel takes no article. And the nationality is <i>Israélien</i> — see the note in Lesson 6.")]))
A(rule("The country-gender rule in three lines", "நாட்டுப் பால் விதி — மூன்று வரிகளில்",
  """<div class="duo"><div><b>1 · Ends in -e → feminine → la.</b> <span class="fr">la France, la Belgique, la Chine,
  la Suisse, l'Inde, l'Italie, la Turquie, la Russie, la Grèce.</span><br>
  <b>2 · Ends in anything else → masculine → le.</b> <span class="fr">le Japon, le Brésil, le Canada, le Portugal,
  le Maroc, le Danemark, le Sri Lanka.</span><br>
  <b>3 · Plural name → les.</b> <span class="fr">les Pays-Bas, les États-Unis, les Philippines, les Seychelles.</span><br><br>
  <b>Exceptions to learn as a block:</b> <span class="fr">le Mexique, le Mozambique, le Cambodge, le Zimbabwe,
  le Belize</span> (end in -e, still masculine); and the countries with <b>no article at all</b> —
  <span class="fr">Israël, Cuba, Madagascar, Singapour, Monaco, Chypre, Haïti, Taïwan</span>.</div>
  <div class="ta-col"><b>1 · -e-இல் முடிந்தால் → பெண்பால் → la.</b><br>
  <b>2 · வேறு எதிலும் முடிந்தால் → ஆண்பால் → le.</b><br>
  <b>3 · பன்மைப் பெயர் → les.</b><br><br>
  <b>ஒரே தொகுப்பாகக் கற்க வேண்டிய விதிவிலக்குகள்:</b> <span class="fr">le Mexique, le Mozambique, le Cambodge,
  le Zimbabwe, le Belize</span> — -e-இல் முடிந்தும் ஆண்பால்; மேலும் <b>இடைச்சொல்லே இல்லாத</b> நாடுகள் —
  <span class="fr">Israël, Cuba, Madagascar, Singapour, Monaco, Chypre, Haïti, Taïwan</span>.</div></div>"""))
A(fig('image30.png', 'Image Cindy sent on 2 July — the fruit sheet she asked you to describe',
  "Her instruction: <b>“what to put in front of these fruits to describe the picture?”</b> Her two worked "
  "examples: <span class='fr'>des abricots</span> (masc.) — <i>des &gt; 2, 5 abricots</i>; and "
  "<span class='fr'>un potiron</span> — <i>un &gt; 1</i>. That question is answered in full in Lesson 8.",
  "அவரது வழிமுறை: <b>“படத்தை விவரிக்க இந்தப் பழங்களுக்கு முன் என்ன வைப்பது?”</b> முழு விடை பாடம் 8-இல்."))
A(drill("Writing drill 7.1 — write the article, then a full sentence: « J'habite en / au / aux … »",
        "எழுத்துப் பயிற்சி 7.1 — இடைச்சொல்லை எழுதி, பிறகு முழு வாக்கியம்",
  """<p class="gloss">The <b>en / au / aux</b> rule for “in a country” is taught in Volume 2 §7 — she has not
  reached it yet. Preview: feminine → <b>en France</b>, masculine → <b>au Japon</b>, plural → <b>aux États-Unis</b>.
  <span class="ta">“ஒரு நாட்டில்” என்பதற்கான en / au / aux விதி தொகுதி 2 §7-இல். அவர் இன்னும் அதை
  அடையவில்லை.</span></p>""" +
  numlines(["____ Inde", "____ Japon", "____ Belgique", "____ Pays-Bas", "____ Mexique", "____ Chine",
            "____ Portugal", "____ Philippines", "____ Israël", "____ Suisse", "____ Brésil", "____ Turquie"])))
A(key("""1. <span class="fr">l'Inde</span> (f.) · 2. <span class="fr">le Japon</span> · 3. <span class="fr">la Belgique</span> ·
4. <span class="fr">les Pays-Bas</span> · 5. <span class="fr">le Mexique</span> (exception) · 6. <span class="fr">la Chine</span> ·
7. <span class="fr">le Portugal</span> · 8. <span class="fr">les Philippines</span> · 9. <span class="fr">Israël</span> (none) ·
10. <span class="fr">la Suisse</span> · 11. <span class="fr">le Brésil</span> · 12. <span class="fr">la Turquie</span>.<br>
<b>Sentences:</b> <span class="fr">J'habite en Inde. Je vais au Japon. J'habite en Belgique. Je vais aux Pays-Bas.
Je vais au Mexique. Je vais en Chine. Je vais au Portugal. Je vais aux Philippines. Je vais en Israël.
J'habite en Suisse. Je vais au Brésil. Je vais en Turquie.</span>"""))
A(pb())

# ============================ LESSON 8 ============================
A(sec("8", "13 July — du, de la, de l', des: how much of it?", "ஜூலை 13 — du, de la, de l', des: எவ்வளவு?"))
A(duo("""<p>Cindy showed fruit and vegetables one at a time and asked for the article. After the corrections,
  <b>you wrote out the rule in your own words in the chat</b> and she let it stand uncorrected.</p>""",
  """<p>சிண்டி பழங்களையும் காய்கறிகளையும் ஒவ்வொன்றாகக் காட்டி இடைச்சொல் கேட்டார். திருத்தங்களுக்குப் பிறகு,
  <b>உரையாடலிலேயே நீங்களே அந்த விதியை உங்கள் சொற்களில் எழுதினீர்கள்</b>; அவர் அதைத் திருத்தாமல் விட்டார்.</p>"""))
A(rule("Your own rule, written in the chat on 13 July — and it is correct",
       "ஜூலை 13 அன்று உரையாடலில் நீங்களே எழுதிய விதி — அது சரியானது",
  """<div class="duo"><div style="font-style:italic">“if we have only one: based on gender it is Un or Une.<br>
  if we have two or more (rounded number): Des.<br>
  if we have fractional number (like 2,5. 3,5): based on gender Du: masculine, De la: feminine.
  if vowel: no matter gender we put de l'…”</div>
  <div class="ta-col">உங்கள் சொந்த வார்த்தைகளில்: ஒன்று மட்டும் என்றால் பாலைப் பொறுத்து <b>un / une</b>.
  இரண்டு அல்லது அதற்கு மேல் (முழு எண்) என்றால் <b>des</b>. பின்ன எண் (2,5 · 3,5) என்றால் பாலைப் பொறுத்து
  <b>du</b> (ஆண்பால்) / <b>de la</b> (பெண்பால்). உயிரெழுத்து என்றால் பால் எதுவானாலும் <b>de l'</b>.</div></div>
  <p style="margin-top:2.5mm"><b>What that rule really is.</b> You had discovered the distinction between
  <b>countable</b> and <b>uncountable</b>. French, unlike English, insists on marking it every single time:
  <span class="ta">நீங்கள் கண்டுபிடித்தது <b>எண்ணக்கூடியது</b> / <b>எண்ண முடியாதது</b> என்ற வேறுபாடு. ஆங்கிலத்தைப்
  போலல்லாமல் பிரெஞ்சு ஒவ்வொரு முறையும் இதைக் குறிக்க வலியுறுத்துகிறது.</span></p>"""))
A(table(("Situation <span class='ta'>நிலை</span>", "Article", "Example <span class='ta'>எடுத்துக்காட்டு</span>", "In English", "தமிழ்"),
 [("<b>One whole item</b><br><span class='ta'>ஒரு முழுப் பொருள்</span>", "<b class='fr'>un / une</b>",
   "<span class='fr'>un potiron · une cerise · un artichaut · un poireau</span>", "a pumpkin, a cherry", "ஒரு பூசணி, ஒரு செர்ரி"),
  ("<b>Several whole items</b> (a countable number)<br><span class='ta'>பல முழுப் பொருட்கள்</span>", "<b class='fr'>des</b>",
   "<span class='fr'>des abricots · des carottes · des framboises · des radis</span>", "some apricots, some carrots", "சில ஆப்ரிகாட்டுகள்"),
  ("<b>Part of a thing</b>, an unmeasured quantity — masculine<br><span class='ta'>ஒரு பொருளின் பகுதி — ஆண்பால்</span>", "<b class='fr'>du</b>",
   "<span class='fr'>du melon · du citron · du kiwi · du céleri · du raisin</span>", "some melon", "கொஞ்சம் முலாம்பழம்"),
  ("<b>Part of a thing</b> — feminine<br><span class='ta'>பகுதி — பெண்பால்</span>", "<b class='fr'>de la</b>",
   "<span class='fr'>de la pêche · de la pomme · de la poire · de la salade · de la nectarine</span>", "some peach", "கொஞ்சம் பீச்"),
  ("<b>Part of a thing</b> — before a vowel or mute h, <b>either gender</b><br><span class='ta'>உயிரெழுத்து முன் — இரு பாலும்</span>", "<b class='fr'>de l'</b>",
   "<span class='fr'>de l'abricot · de l'orange · de l'ananas</span>", "some apricot", "கொஞ்சம் ஆப்ரிகாட்"),
 ]))
A(tip("Her way of testing it: « 2,5 abricots »", "அவரது சோதனை முறை: « 2,5 abricots »",
  """<div class="duo"><div>Cindy's trick was brilliant and it is the reason your rule mentions decimals.
  <b>Two and a half apricots is not two apricots.</b> You cannot count half an apricot, so it stops being
  countable and becomes matter — and matter takes the partitive:<br>
  <span class="fr">3 abricots → <b>des</b> abricots</span> (three whole ones)<br>
  <span class="fr">2,5 abricots → <b>de l'</b>abricot</span> (apricot as a substance)<br>
  <span class="fr">2 oranges → <b>des</b> oranges</span> · <span class="fr">1,5 orange → <b>de l'</b>orange</span><br><br>
  She did the same with grapes: <span class="fr"><b>des raisins</b></span> = different <i>types</i> of grape;
  <span class="fr"><b>du raisin</b></span> = the grains, grapes as food. And with lettuce:
  <span class="fr">une salade</span> = one whole lettuce, <span class="fr">de la salade</span> = some salad on
  your plate. She sent you the photograph of a Greek salad to make the point.</div>
  <div class="ta-col">சிண்டியின் தந்திரம் அற்புதமானது; உங்கள் விதியில் தசம எண்கள் வருவதற்குக் காரணமும் அதுவே.
  <b>இரண்டரை ஆப்ரிகாட் என்பது இரண்டு ஆப்ரிகாட் அல்ல.</b> அரை ஆப்ரிகாட்டை எண்ண முடியாது; எனவே அது எண்ணக்
  கூடியதாக இல்லாமல் பொருளாக மாறுகிறது — பொருளுக்குப் பகுதி இடைச்சொல்.<br><br>
  திராட்சையிலும் அதையே செய்தார்: <span class="fr">des raisins</span> = வெவ்வேறு <i>வகை</i>;
  <span class="fr">du raisin</span> = உணவாகத் திராட்சை. சாலட்டிலும்: <span class="fr">une salade</span> = ஒரு
  முழுக் கீரை, <span class="fr">de la salade</span> = தட்டில் கொஞ்சம் சாலட்.</div></div>"""))
A(figrow([
  ('image35.jpeg', 'Image Cindy sent — les fruits', "The fruit sheet she worked through with you, item by item.", "ஒவ்வொன்றாக அவர் உங்களுடன் பணியாற்றிய பழத் தாள்."),
  ('image37.jpeg', 'Image Cindy sent — la salade', "<span class='fr'>= de la salade</span> — her own caption. One lettuce is <i>une salade</i>; what is in the bowl is <i>de la salade</i>.", "<span class='fr'>= de la salade</span> — அவரது சொந்தத் தலைப்பு."),
]))
A(fig('image36.jpeg', 'Image Cindy sent — les légumes',
  "The vegetable sheet. She went through it with you and you named: <span class='fr'>des carottes, des aubergines, "
  "des courgettes, des haricots, des asperges, un artichaut, un poireau, un potiron, une salade, des choux de "
  "Bruxelles, un concombre, un chou-fleur, des champignons, des petits pois, des radis, des pommes de terre, "
  "du céleri, des topinambours, un bulbe de fenouil.</span>",
  "காய்கறித் தாள். நீங்கள் ஒவ்வொன்றாகப் பெயரிட்டீர்கள்."))
A(fig('image31.png', 'Image Cindy sent on 2 July — the same vegetables, labelled',
  "The labelled version she had already sent you on 2 July, with <span class='fr'>un potiron</span> circled as her "
  "example of <b>un &gt; 1</b>.", "ஜூலை 2 அன்று அவர் ஏற்கனவே அனுப்பிய பெயரிடப்பட்ட பதிப்பு."))

A(h3("Fruits — the complete list, with genders", "பழங்கள் — முழுப் பட்டியல், பாலுடன்"))
A(vocab([
  ("un abricot", "an apricot", "ஆப்ரிகாட்"), ("un melon", "a melon", "முலாம்பழம்"),
  ("une banane", "a banana", "வாழைப்பழம்"), ("une pêche", "a peach", "குழிப்பேரி"),
  ("un citron", "a lemon", "எலுமிச்சை"), ("une pomme", "an apple", "ஆப்பிள்"),
  ("une orange", "an orange", "ஆரஞ்சு"), ("un kiwi", "a kiwi", "கிவி"),
  ("un ananas", "a pineapple", "அன்னாசி"), ("une poire", "a pear", "பேரிக்காய்"),
  ("le raisin / les raisins", "grape (food) / types of grape", "திராட்சை"),
  ("une nectarine", "a nectarine", "நெக்டரின்"), ("une fraise", "a strawberry", "ஸ்ட்ராபெர்ரி"),
  ("une cerise", "a cherry", "செர்ரி"), ("une framboise", "a raspberry", "ராஸ்பெர்ரி"),
  ("une prune", "a plum", "அல்லிப்பழம்"),
]))
A(h3("Vegetables — the complete list, with genders", "காய்கறிகள் — முழுப் பட்டியல், பாலுடன்"))
A(vocab([
  ("une carotte", "a carrot", "கேரட்"), ("une aubergine", "an aubergine", "கத்தரிக்காய்"),
  ("une courgette", "a courgette", "சுரைக்காய் வகை"), ("un haricot", "a bean — <b>h aspiré</b>: <i>les / haricots</i>", "பீன்ஸ்"),
  ("une asperge", "an asparagus", "அஸ்பாரகஸ்"), ("un artichaut", "an artichoke", "ஆர்ட்டிசோக்"),
  ("un poireau", "a leek (plural <i>poireaux</i>)", "லீக்"), ("un potiron", "a pumpkin", "பூசணி"),
  ("une salade", "a lettuce / a salad", "கீரை / சாலட்"),
  ("un chou de Bruxelles", "a Brussels sprout (plural <i>des choux de Bruxelles</i>)", "பிரஸ்ஸல்ஸ் முட்டைக்கோஸ்"),
  ("un concombre", "a cucumber", "வெள்ளரி"),
  ("un chou-fleur", "a cauliflower (plural <i>des choux-fleurs</i>)", "காலிஃபிளவர்"),
  ("un champignon", "a mushroom", "காளான்"),
  ("un petit pois", "a pea — plural <b>des petits pois</b>, and she flagged it: the <b>-s</b> goes on <i>petit</i> too", "பட்டாணி"),
  ("un radis", "a radish (already ends in -s)", "முள்ளங்கி"),
  ("une pomme de terre", "a potato (literally “apple of the earth”)", "உருளைக்கிழங்கு"),
  ("le céleri", "celery", "செலரி"),
  ("un topinambour", "a Jerusalem artichoke", "ஜெருசலேம் ஆர்ட்டிசோக்"),
  ("un bulbe de fenouil", "a fennel bulb", "பெருஞ்சீரகக் கிழங்கு"),
  ("un navet", "a turnip", "டர்னிப்"), ("un épinard / des épinards", "spinach", "கீரை"),
  ("un brocoli", "broccoli", "ப்ரோக்கோலி"), ("un poivron", "a bell pepper", "குடைமிளகாய்"),
]))
A(rule("Two plural rules she gave you that day", "அன்று அவர் கொடுத்த இரு பன்மை விதிகள்",
  """<div class="duo"><div><b>1 · Words ending in -ou often take -x, not -s.</b> Her words: <i>“Words ending in -ou
  tend to make the plural with -x.”</i> There are exactly seven, and French children learn them as a list:<br>
  <span class="fr">bijou, caillou, chou, genou, hibou, joujou, pou</span> →
  <span class="fr">bijou<b>x</b>, caillou<b>x</b>, chou<b>x</b>, genou<b>x</b>, hibou<b>x</b>, joujou<b>x</b>,
  pou<b>x</b></span>.<br>
  Two of these you already met: <span class="fr">un genou</span> (a knee, Lesson 3) and <span class="fr">un
  chou</span> (a cabbage, in <i>choux de Bruxelles</i>). Every other -ou word takes a normal -s:
  <span class="fr">des trous, des clous, des fous</span>.<br><br>
  <b>2 · A compound noun of two nouns: both parts take the plural.</b> Her example was
  <span class="fr">un chou-fleur → des chou<b>x</b>-fleur<b>s</b></span>, and she wrote the reason beside it:
  <i>“2 nouns”</i>. Compare <span class="fr">une pomme de terre → des pomme<b>s</b> de terre</span> (only the
  first, because <i>de terre</i> is a phrase, not a second noun).<br>
  And her <b>Attention</b>: <span class="fr">des petit<b>s</b> pois</span> — the adjective agrees too.</div>
  <div class="ta-col"><b>1 · -ou-இல் முடியும் சொற்கள் பெரும்பாலும் -s அல்ல, -x எடுக்கும்.</b> அவரது சொற்கள்.
  சரியாக ஏழு சொற்கள்; பிரெஞ்சுக் குழந்தைகள் இதைப் பட்டியலாகக் கற்கிறார்கள்:
  <span class="fr">bijou, caillou, chou, genou, hibou, joujou, pou</span>.<br>
  இவற்றில் இரண்டை ஏற்கனவே சந்தித்தீர்கள்: <span class="fr">genou</span> (முழங்கால்),
  <span class="fr">chou</span> (முட்டைக்கோஸ்). மற்ற -ou சொற்கள் வழக்கமான -s எடுக்கும்.<br><br>
  <b>2 · இரு பெயர்ச்சொற்கள் சேர்ந்த கூட்டுச்சொல்: இரு பகுதிகளும் பன்மை பெறும்.</b>
  <span class="fr">un chou-fleur → des choux-fleurs</span> — அவர் காரணத்தையும் எழுதினார்: <i>“2 nouns”</i>.
  ஒப்பிடுங்கள்: <span class="fr">des pommes de terre</span> — முதல் பகுதி மட்டும்.<br>
  அவரது <b>Attention</b>: <span class="fr">des petits pois</span> — பெயரடையும் ஒப்புமை கொள்கிறது.</div></div>"""))
A(warn("The trap Volume 2 will finish: after a negative, everything becomes « de »",
       "தொகுதி 2 முடிக்கும் கண்ணி: மறுப்புக்குப் பின் அனைத்தும் « de » ஆகும்",
  """<div class="duo"><div>Cindy did not reach this, but it belongs to her lesson and it is a guaranteed DELF A2 point.
  After <b>ne … pas</b>, the articles <b>un, une, du, de la, de l', des</b> all collapse into a bare <b>de</b>:<br>
  <span class="fr">Je mange <b>des</b> carottes.</span> → <span class="fr">Je <b>ne</b> mange <b>pas de</b> carottes.</span><br>
  <span class="fr">J'ai <b>un</b> frère.</span> → <span class="fr">Je <b>n'</b>ai <b>pas de</b> frère.</span><br>
  <span class="fr">Il boit <b>du</b> café.</span> → <span class="fr">Il <b>ne</b> boit <b>pas de</b> café.</span><br>
  <b>Except after être</b>, where nothing changes: <span class="fr">Ce n'est pas <b>un</b> chou-fleur.</span></div>
  <div class="ta-col">சிண்டி இதை அடையவில்லை, ஆனால் இது அவரது பாடத்தையே சேர்ந்தது; DELF A2-இல் நிச்சயம் வரும்.
  <b>ne … pas</b>-க்குப் பின் <b>un, une, du, de la, de l', des</b> அனைத்தும் வெறும் <b>de</b> ஆக மாறும்.<br>
  <b>être-க்குப் பின் மட்டும் விதிவிலக்கு</b> — எதுவும் மாறாது.</div></div>"""))

A(drill("Writing drill 8.1 — put the right article in front of each, then say why",
        "எழுத்துப் பயிற்சி 8.1 — ஒவ்வொன்றுக்கும் சரியான இடைச்சொல், பிறகு ஏன் என்று சொல்லுங்கள்",
  numlines(["____ carottes (5)", "____ melon (a slice)", "____ artichaut (1)", "____ salade (in the bowl)",
            "____ ananas (half)", "____ petits pois (many)", "____ potiron (1)", "____ pêche (a piece)",
            "____ choux-fleurs (3)", "____ raisin (as food)", "____ orange (1,5)", "____ pommes de terre (6)",
            "____ céleri (a stick)", "____ radis (4)", "____ abricot (2,5)", "____ concombre (1)"])))
A(key("""1. <span class="fr">des</span> · 2. <span class="fr">du</span> · 3. <span class="fr">un</span> ·
4. <span class="fr">de la</span> · 5. <span class="fr">de l'</span> · 6. <span class="fr">des</span> ·
7. <span class="fr">un</span> · 8. <span class="fr">de la</span> · 9. <span class="fr">des</span> ·
10. <span class="fr">du</span> · 11. <span class="fr">de l'</span> · 12. <span class="fr">des</span> ·
13. <span class="fr">du</span> · 14. <span class="fr">des</span> · 15. <span class="fr">de l'</span> ·
16. <span class="fr">un</span>."""))
A(drill("Writing drill 8.2 — write your shopping list twice",
        "எழுத்துப் பயிற்சி 8.2 — உங்கள் கடைப் பட்டியலை இரு முறை எழுதுங்கள்",
  """<div class="duo"><div>Twenty items, each with its article, as a full sentence:
  <span class="fr">J'achète des carottes, du céleri, un chou-fleur…</span> Then close the book and write the same
  twenty from memory. Compare. The words you lost the second time are the only ones you still have to learn.</div>
  <div class="ta-col">இருபது பொருட்கள், ஒவ்வொன்றுக்கும் இடைச்சொல்லுடன், ஒரு முழு வாக்கியமாக. பிறகு புத்தகத்தை
  மூடி, அதே இருபதையும் நினைவிலிருந்து எழுதுங்கள். ஒப்பிடுங்கள். இரண்டாவது முறை தவறவிட்டவை மட்டுமே இன்னும்
  கற்க வேண்டியவை.</div></div>""" + lines(12)))
A(drill("Writing drill 8.3 — the negative, ten times",
        "எழுத்துப் பயிற்சி 8.3 — மறுப்பு வடிவம், பத்து முறை",
  """<p class="gloss">Rewrite each in the negative. Remember: <b>un / une / du / de la / des → de</b>.</p>""" +
  numlines(["<span class='fr'>Je mange des champignons.</span>", "<span class='fr'>Il achète du céleri.</span>",
            "<span class='fr'>Nous avons des poireaux.</span>", "<span class='fr'>Tu veux une pomme ?</span>",
            "<span class='fr'>Elle prend de la salade.</span>", "<span class='fr'>Ils mangent des petits pois.</span>",
            "<span class='fr'>J'ai un frère.</span>", "<span class='fr'>Vous buvez du café.</span>",
            "<span class='fr'>C'est un chou-fleur.</span> <span class='ta'>(கவனம் — être!)</span>",
            "<span class='fr'>Elle a des lunettes.</span>"])))
A(key("""1. <span class="fr">Je ne mange pas de champignons.</span> · 2. <span class="fr">Il n'achète pas de céleri.</span> ·
3. <span class="fr">Nous n'avons pas de poireaux.</span> · 4. <span class="fr">Tu ne veux pas de pomme ?</span> ·
5. <span class="fr">Elle ne prend pas de salade.</span> · 6. <span class="fr">Ils ne mangent pas de petits pois.</span> ·
7. <span class="fr">Je n'ai pas de frère.</span> · 8. <span class="fr">Vous ne buvez pas de café.</span> ·
9. <span class="fr">Ce n'est pas <b>un</b> chou-fleur.</span> — <b>être keeps the article</b> ·
10. <span class="fr">Elle n'a pas de lunettes.</span>"""))
A(tip("Her last link, and her last instruction · அவரது கடைசி இணைப்பும் கடைசி வழிமுறையும்",
  """<b>podcastfrancaisfacile.com/texte/les_repas.html</b> — <i>les repas</i>, meals. And her final homework, typed
  just before the silence: <b>“learn fruits et légumes”</b>. It is done — the two complete lists are on the
  previous pages. Tell her so.
  <span class="ta">அவரது கடைசி வீட்டுப்பாடம், மௌனத்திற்கு முன் தட்டச்சு செய்தது: <b>“பழங்களையும்
  காய்கறிகளையும் கற்றுக்கொள்ளுங்கள்”</b>. முடிந்துவிட்டது — முழுப் பட்டியல்கள் முந்தைய பக்கங்களில். அவரிடம் சொல்லுங்கள்.</span>"""))
A(pb())

# ============================ HOMEWORK LEDGER ============================
A(sec("9", "Everything she asked you to do — the ledger", "அவர் கேட்ட அனைத்தும் — பதிவேடு"))
A(duo("""<p>Cindy marked her homework in the chat with a double arrow: <b>&gt;&gt;</b>. Here is every one of them,
  with its status. Four were never returned. All four are finished in this book — tick them off and show her the
  page.</p>""",
  """<p>சிண்டி வீட்டுப்பாடங்களை உரையாடலில் <b>&gt;&gt;</b> என்ற இரட்டை அம்புக்குறியால் குறித்தார். ஒவ்வொன்றும்
  அதன் நிலையுடன் இங்கே. நான்கு திரும்பத் தரப்படவில்லை. நான்கும் இந்தப் புத்தகத்தில் முடிக்கப்பட்டுள்ளன —
  குறியிட்டு அவருக்குப் பக்கத்தைக் காட்டுங்கள்.</p>"""))
A(table(("Date <span class='ta'>தேதி</span>", "What she asked <span class='ta'>அவர் கேட்டது</span>",
         "Status <span class='ta'>நிலை</span>", "Where it is finished <span class='ta'>எங்கே முடிந்தது</span>"),
 [("13 June", "<b>&gt;&gt; finish the written questions to André</b> — eight questions for eight answers.",
   "<span class='badge'>half done</span> You wrote 6 of 8 on 15 June, with four spelling slips.",
   "Lesson 2, drill 2.1 — all eight, in the polite register, with the spellings fixed."),
  ("15 June", "<b>&gt;&gt; switch the gender of the sentences</b> — the five Paul/Marc sentences.",
   "<span class='badge g'>done</span> Handed in 18 June. One correction: <i>agressive</i>.",
   "Lesson 3 — plus drill 3.2, the reverse exercise she never set."),
  ("18 June", "<b>&gt;&gt; enfants Dubois + 5 phrases</b> — read the children's text and write five sentences.",
   "<span class='badge g'>done</span> Covered in the lesson of 22 June.",
   "Lesson 5 — plus drill 5.2, retelling the spider story."),
  ("22 June", "<b>&gt;&gt; devoir : fill in the blanks</b> — the family-tree worksheet (Didier &amp; Marie).",
   "<span class='badge g'>done</span> Your handwriting, 2 July — ten correct sentences.",
   "Lesson 5 — plus drill 5.1, your own family tree."),
  ("2 July", "<b>&gt;&gt; what to put in front of these fruits to describe the picture?</b>",
   "<span class='badge'>started</span> Answered piecemeal on 13 July.",
   "Lesson 8 — the full partitive table and drill 8.1."),
  ("2 July", "<b>&gt;&gt; fill it in, beware the errors</b> — the pays &amp; nationalités sheet.",
   "<span class='badge b'>never returned</span> Fifteen lines written on 13 July, then the gap.",
   "Lesson 6 — the complete 36-country key, and drill 6.1."),
  ("13 July", "<b>&gt;&gt; learn fruits et légumes</b> — her last instruction before the silence.",
   "<span class='badge b'>never returned</span>",
   "Lesson 8 — both complete lists with genders, and drills 8.1–8.3."),
  ("13 July", "<b>les repas</b> — the meals text she linked but never used.",
   "<span class='badge b'>never opened</span>",
   "<b>Volume 2 §8</b> — meals, the café dialogue, and ordering food. She will not expect this."),
 ]))

# ============================ GLOSSARY ============================
A(pb())
A(sec("10", "Master glossary — every word she taught you", "முதன்மைச் சொற்களஞ்சியம் — அவர் கற்பித்த ஒவ்வொரு சொல்லும்"))
A(duo("""<p>Alphabetical, with gender, English and Tamil, laid out two columns to a page. Roughly two
  hundred and sixty entries — all of them hers. Work down it in blocks of twenty. When you can write a block from
  the Tamil alone, move on.</p>""",
  """<p>அகர வரிசையில் — பால், ஆங்கிலம், தமிழ், மற்றும் ஒவ்வொரு சொல்லையும் இரு முறை எழுதக் கோடிட்ட நெடுவரிசை.
  சுமார் இருநூற்று அறுபது சொற்கள் — அனைத்தும் அவருடையவை. இருபது இருபதாகச் செய்யுங்கள். தமிழிலிருந்து மட்டுமே
  ஒரு தொகுதியை எழுத முடிந்தால், அடுத்ததற்குச் செல்லுங்கள்.</p>"""))

GLOSS = [
 ("à côté de","next to, beside","அருகில்"),("à votre avis","in your opinion","உங்கள் கருத்தில்"),
 ("un abricot","an apricot","ஆப்ரிகாட்"),("agressif / agressive","aggressive (one g)","ஆக்ரோஷமான"),
 ("aimer","to love, to like","விரும்ப"),("l'aîné / l'aînée","the eldest","மூத்தவர்"),
 ("aller","to go","செல்ல"),("un ananas","a pineapple","அன்னாசி"),
 ("une apostrophe","an apostrophe","மேற்கோள் புள்ளி"),("un appartement","a flat","குடியிருப்பு"),
 ("une araignée","a spider","சிலந்தி"),("un artichaut","an artichoke","ஆர்ட்டிசோக்"),
 ("une asperge","an asparagus","அஸ்பாரகஸ்"),("une aubergine","an aubergine","கத்தரிக்காய்"),
 ("aujourd'hui","today","இன்று"),("aussi","also, too","மேலும்"),
 ("une auto","a car (Swiss/Belgian)","கார்"),("avoir","to have","வைத்திருக்க"),
 ("avoir envie de","to feel like (doing)","ஆசைப்பட"),("avoir horreur de","to loathe","வெறுக்க"),
 ("une baguette","a baguette","பேகெட் ரொட்டி"),("une banane","a banana","வாழைப்பழம்"),
 ("une barbe","a beard","தாடி"),("une batte","a bat (stick)","மட்டை"),
 ("bavard / bavarde","talkative","அதிகம் பேசும்"),("beaucoup","a lot","நிறைய"),
 ("beige","beige","மங்கல் மஞ்சள்"),("la belle-mère","step-mother / mother-in-law","மாமியார்"),
 ("le benjamin","the middle / youngest child","இளையவர்"),("blanc / blanche","white","வெள்ளை"),
 ("bleu / bleue","blue","நீலம்"),("blond / blonde","blond","பொன்னிறம்"),
 ("bouclé / bouclée","wavy, curly","அலை அலையான"),("brun / brune","brown","பழுப்பு"),
 ("un buffet","a sideboard","பாத்திரப் பேழை"),("un cadet / une cadette","the younger one","இளையவர்"),
 ("un cafard","a cockroach","கரப்பான் பூச்சி"),("une carotte","a carrot","கேரட்"),
 ("une casquette","a cap","தொப்பி"),("célibataire","single, unmarried","திருமணமாகாத"),
 ("le céleri","celery","செலரி"),("une cerise","a cherry","செர்ரி"),
 ("la chambre","the bedroom","படுக்கையறை"),("un champignon","a mushroom","காளான்"),
 ("châtain","chestnut brown (hair)","கஷ்கொட்டை நிறம்"),("les cheveux (m. pl.)","hair","தலைமுடி"),
 ("chez","at the home of","… வீட்டில்"),("un chou / des choux","a cabbage","முட்டைக்கோஸ்"),
 ("un chou-fleur","a cauliflower","காலிஃபிளவர்"),("un chou de Bruxelles","a Brussels sprout","பிரஸ்ஸல்ஸ் முட்டைக்கோஸ்"),
 ("cinq (5)","five","ஐந்து"),("un citron","a lemon","எலுமிச்சை"),
 ("le collège","middle school (12–15)","இடைநிலைப் பள்ளி"),("combien (de)","how much, how many","எத்தனை"),
 ("comment","how","எப்படி"),("un concombre","a cucumber","வெள்ளரி"),
 ("content / contente","happy, pleased","மகிழ்ச்சியான"),("un couteau / des couteaux","a knife","கத்தி"),
 ("une courgette","a courgette","சுரைக்காய் வகை"),("court / courte","short","குட்டை"),
 ("un cousin éloigné","a distant cousin","தூர உறவினர்"),("créatif / créative","creative","படைப்பாற்றல் மிக்க"),
 ("crier","to scream","கத்த"),("dangereux / dangereuse","dangerous","ஆபத்தான"),
 ("de temps en temps","from time to time","அவ்வப்போது"),("délicieux / délicieuse","delicious","சுவையான"),
 ("demain","tomorrow","நாளை"),("la demi-sœur","the half-sister","ஒன்றுவிட்ட சகோதரி"),
 ("la désinence","the grammatical ending","விகுதி"),("dessiner","to draw","வரைய"),
 ("devenir","to become","ஆக"),("dix-neuf (19)","nineteen","பத்தொன்பது"),
 ("dix-sept (17)","seventeen","பதினேழு"),("donc","so, therefore","எனவே"),
 ("la double nationalité","dual nationality","இரட்டைக் குடியுரிமை"),("l'école (f.)","the school","பள்ளி"),
 ("écrire","to write","எழுத"),("un élève / une élève","a pupil","பள்ளி மாணவர்"),
 ("embêter","to annoy, to pester","சீண்ட"),("un enfant","a child","குழந்தை"),
 ("environ","about, approximately","சுமார்"),("un épinard","spinach","கீரை"),
 ("être","to be","இருக்க"),("étranger / étrangère","foreign","வெளிநாட்டு"),
 ("un étudiant / une étudiante","a university student","மாணவர்"),("faire","to do, to make","செய்ய"),
 ("faire du sport","to do sport","விளையாட்டு விளையாட"),("la famille","the family","குடும்பம்"),
 ("la femme","the wife, the woman","மனைவி, பெண்"),("un fenouil","fennel","பெருஞ்சீரகம்"),
 ("une fenêtre","a window","ஜன்னல்"),("une fille unique","an only daughter","ஒரே மகள்"),
 ("un fils unique","an only son","ஒரே மகன்"),("fort / forte","strong; loudly","பலசாலி; உரக்க"),
 ("une fourchette","a fork","முள்கரண்டி"),("une fraise","a strawberry","ஸ்ட்ராபெர்ரி"),
 ("une framboise","a raspberry","ராஸ்பெர்ரி"),("le frère","the brother","சகோதரன்"),
 ("frisé / frisée","curly","சுருள் முடி"),("un genou / des genoux","a knee","முழங்கால்"),
 ("gentil / gentille","kind, nice","அன்பான"),("un gentilé","a demonym","மக்கள் பெயர்"),
 ("le grand-père","the grandfather","தாத்தா"),("la grand-mère","the grandmother","பாட்டி"),
 ("la grand-tante","the great-aunt","பாட்டியின் சகோதரி"),("grand / grande","tall, big","உயரமான"),
 ("gris / grise","grey","சாம்பல்"),("gros / grosse","fat, big","பருமனான"),
 ("habiter","to live (somewhere)","வசிக்க"),("un haricot","a bean (h aspiré)","பீன்ஸ்"),
 ("un homme","a man","மனிதன்"),("un insecticide","an insecticide","பூச்சிக்கொல்லி"),
 ("un israélien / une israélienne","an Israeli (citizen)","இஸ்ரேலியர்"),
 ("un israélite","an Israelite (believer, dated)","இஸ்ரேலைட்"),
 ("le jardin","the garden","தோட்டம்"),("jaune","yellow","மஞ்சள்"),
 ("jeune","young","இளம்"),("jouer à","to play (a game/sport)","ஆட"),
 ("jouer de","to play (an instrument)","வாசிக்க"),("un juif / une juive","a Jewish person","யூதர்"),
 ("juteux / juteuse","juicy","சாறு நிறைந்த"),("un képi","a military cap","இராணுவத் தொப்பி"),
 ("laver / lavé","to wash / washed","கழுவ"),("la lecture","reading","வாசிப்பு"),
 ("une leçon","a lesson","பாடம்"),("une lettre","a letter","கடிதம்"),
 ("lire","to read","படிக்க"),("lisse / lisses","smooth, sleek","மென்மையான"),
 ("un livre","a book","புத்தகம்"),("long / longue","long","நீளம்"),
 ("longtemps","for a long time","நீண்ட காலம்"),("une loupe","a magnifying glass","பூதக்கண்ணாடி"),
 ("un loisir","a hobby","பொழுதுபோக்கு"),("un lucane","a stag beetle","கொம்பு வண்டு"),
 ("un lycéen / une lycéenne","a high-school pupil","மேல்நிலை மாணவர்"),
 ("un maçon","a bricklayer","கொத்தனார்"),("une main","a hand","கை"),
 ("une maison","a house","வீடு"),("le mari","the husband","கணவர்"),
 ("marié / mariée","married","திருமணமான"),("le marron / marron","chestnut / brown (invariable)","கஷ்கொட்டை / பழுப்பு"),
 ("maternel / maternelle","maternal","தாய்வழி"),("mauve","mauve","மௌவ்"),
 ("un melon","a melon","முலாம்பழம்"),("ma mère","my mother","என் தாய்"),
 ("mettre","to put","வைக்க"),("mince","slim","மெலிந்த"),
 ("une moustache","a moustache","மீசை"),("naître / né(e)","to be born / born","பிறக்க"),
 ("une natte","a braid","பின்னல்"),("un navet","a turnip","டர்னிப்"),
 ("une nectarine","a nectarine","நெக்டரின்"),("neuf / neuve","brand new","முற்றிலும் புதிய"),
 ("un neveu / des neveux","a nephew","மருமகன்"),("une nièce","a niece","மருமகள்"),
 ("noir / noire","black","கருப்பு"),("nombreux / nombreuse","numerous","ஏராளமான"),
 ("nouveau / nouvelle","new (to me)","புதிய"),("un œuf","an egg","முட்டை"),
 ("un oncle","an uncle","மாமா"),("orange","orange (invariable)","ஆரஞ்சு"),
 ("une orange","an orange","ஆரஞ்சு"),("original / originale","original","தனித்துவமான"),
 ("un pays","a country","நாடு"),("un papillon","a butterfly","வண்ணத்துப்பூச்சி"),
 ("pareil / pareille","the same","ஒரே மாதிரி"),("paresseux / paresseuse","lazy","சோம்பேறி"),
 ("un parfum","a perfume","வாசனைத் திரவியம்"),("parler","to speak","பேச"),
 ("paternel / paternelle","paternal","தந்தைவழி"),("une pêche","a peach","குழிப்பேரி"),
 ("pendant","during, for","… நேரம்"),("la petite-fille","the granddaughter","பேத்தி"),
 ("le petit-fils","the grandson","பேரன்"),("petit / petite","small, short","சிறிய"),
 ("des petits pois","peas","பட்டாணி"),("la piscine","the swimming pool","நீச்சல் குளம்"),
 ("policier (adj.)","police, detective","துப்பறியும்"),("un poireau / des poireaux","a leek","லீக்"),
 ("une poire","a pear","பேரிக்காய்"),("un poivron","a bell pepper","குடைமிளகாய்"),
 ("une pomme","an apple","ஆப்பிள்"),("une pomme de terre","a potato","உருளைக்கிழங்கு"),
 ("porter","to wear","அணிய"),("un potiron","a pumpkin","பூசணி"),
 ("préférer","to prefer","விரும்ப"),("une profession","a job","தொழில்"),
 ("une promenade","a walk","நடைப்பயணம்"),("une prune","a plum","அல்லிப்பழம்"),
 ("quand","when","எப்போது"),("quand même","nonetheless","இருந்தாலும்"),
 ("quel / quelle / quels / quelles","which, what","எந்த"),("quelque chose","something","ஏதாவது"),
 ("qui","who","யார்"),("quoi de neuf ?","what's new?","புதிதாக என்ன?"),
 ("un radis","a radish","முள்ளங்கி"),("raide / raides","straight (hair)","நேரான"),
 ("le raisin / les raisins","grape / types of grape","திராட்சை"),("une randonnée","a hike","மலை நடைப்பயணம்"),
 ("rare","rare","அரிதான"),("regarder","to watch","பார்க்க"),
 ("une réunion","a meeting","கூட்டம்"),("rester","to stay","இருக்க"),
 ("un rêve","a dream","கனவு"),("rien de neuf","nothing new","புதிதாக ஒன்றுமில்லை"),
 ("rire","to laugh","சிரிக்க"),("le roller","roller-skating","ரோலர் ஸ்கேட்டிங்"),
 ("rose","pink","இளஞ்சிவப்பு"),("rouge","red","சிவப்பு"),
 ("roux / rousse","ginger, red-haired","செம்பட்டை"),("une salade","a lettuce / salad","கீரை, சாலட்"),
 ("la séance","the showing, time-slot","காட்சி நேரம்"),("seul / seule","alone","தனியாக"),
 ("un serpent","a snake","பாம்பு"),("six (6)","six","ஆறு"),
 ("la SNCF","French national railway","பிரெஞ்சு இரயில்வே"),("une sœur","a sister","சகோதரி"),
 ("sortir","to go out","வெளியே செல்ல"),("souriant / souriante","smiling","புன்னகைக்கும்"),
 ("spécial / spéciale","special","சிறப்பான"),("un stylo","a pen","பேனா"),
 ("sur","on, upon","மேல்"),("sûr / sûre","sure, certain","உறுதியான"),
 ("une table","a table","மேசை"),("une tante","an aunt","அத்தை"),
 ("la télévision","television","தொலைக்காட்சி"),("le tiret ( - )","the hyphen","இணைப்புக்கோடு"),
 ("timide","shy","கூச்ச சுபாவம்"),("un topinambour","a Jerusalem artichoke","ஜெருசலேம் ஆர்ட்டிசோக்"),
 ("toujours","always","எப்போதும்"),("tous / tous les jours","all / every day","எல்லாம் / தினமும்"),
 ("travailler","to work","வேலை செய்ய"),("trente-trois (33)","thirty-three","முப்பத்து மூன்று"),
 ("tricoter","to knit","பின்ன"),("triste","sad","சோகமான"),
 ("un turc / une turque","a Turk / Turkish (f.)","துருக்கியர்"),("les vacances (f. pl.)","the holidays","விடுமுறை"),
 ("un véhicule","a vehicle","வாகனம்"),("vert / verte","green","பச்சை"),
 ("vieux / vieille","old","வயதான"),("vingt-cinq (25)","twenty-five","இருபத்தைந்து"),
 ("violet / violette","purple / a violet","ஊதா"),("vivre / vécu","to live / lived","வாழ"),
 ("voir","to see","காண"),("une voiture","a car","கார்"),
]
import unicodedata
def _sortkey(r):
    w = r[0].lower()
    for pre in ("l'", "le ", "la ", "les ", "un ", "une ", "des ", "du ", "de la ", "ma ", "mon "):
        if w.startswith(pre):
            w = w[len(pre):]
            break
    w = ''.join(c for c in unicodedata.normalize('NFD', w) if unicodedata.category(c) != 'Mn')
    return ''.join(c for c in w if c.isalnum() or c == ' ')
GLOSS.sort(key=_sortkey)
CH = len(GLOSS) // 3 + 1
_np = max(1, math.ceil(len(GLOSS) / 124))          # ~62 printed rows per page
_ch = math.ceil(len(GLOSS) / _np)
for i in range(0, len(GLOSS), _ch):
    A(vocab2up(GLOSS[i:i+_ch]))
    if i + _ch < len(GLOSS):
        A(pb())

A("""
<div class="sepline">— END OF CINDY'S MATERIAL —
  <span class="ta">— சிண்டியின் பாடப்பொருள் இத்துடன் முடிகிறது —</span></div>
<div class="sepbox">
  <div class="t">Everything above this line came from her. Nothing below it does.
    <span class="ta">இந்தக் கோட்டுக்கு மேலே உள்ள அனைத்தும் அவரிடமிருந்து வந்தவை. கீழே உள்ள எதுவும் அல்ல.</span></div>
  <div class="b"><div class="duo">
    <div>Every French word, sentence, correction, link and image in this volume was typed or sent by Cindy CHENE
    between 11 June and 13 July 2026. The English and Tamil explanations, the tables and the writing drills were
    built around them, but the <b>content</b> is hers.<br><br>
    <b>Volume 2 is different, and it is deliberately kept separate.</b> It contains a small amount of extra
    material — about a quarter of what is here — that she has <i>not</i> taught, though every piece of it grows
    out of something she left half-said.</div>
    <div class="ta-col">இந்தத் தொகுதியில் உள்ள ஒவ்வொரு பிரெஞ்சு சொல், வாக்கியம், திருத்தம், இணைப்பு, படம்
    அனைத்தையும் 11 ஜூன் – 13 ஜூலை 2026 இடையே சிண்டி CHENE தட்டச்சு செய்தார் அல்லது அனுப்பினார். ஆங்கில-தமிழ்
    விளக்கங்கள், அட்டவணைகள், எழுத்துப் பயிற்சிகள் அவற்றைச் சுற்றிக் கட்டப்பட்டவை; ஆனால் <b>உள்ளடக்கம்</b>
    அவருடையது.<br><br>
    <b>தொகுதி 2 வேறானது; வேண்டுமென்றே தனியாக வைக்கப்பட்டுள்ளது.</b> அதில் கூடுதலாக ஒரு சிறிய அளவு —
    இங்குள்ளதில் கால்வாசி அளவு — பாடப்பொருள் உள்ளது; அவற்றை அவர் கற்பிக்க<i>வில்லை</i>.</div>
  </div></div>
</div>
<div class="foot">
<b>Tout ce que Cindy m'a appris — Volume 1 · Révision complète.</b>
Built for Ashok Kumar Krishnamoorthy from the italki chat log with Cindy CHENE, lessons of 11, 13, 15, 18, 22 June
and 2, 8, 13 July 2026. Every French word, sentence, correction, link and image in this volume is hers; the
English and Tamil explanations, the tables and all the writing drills were added around them.
Continue with <b>Volume 2 — Au-delà de Cindy</b> (the small extra, kept separate) and
<b>Volume 3 — Le Cahier d'écriture</b> (the writing workbook).<br>
<span class="ta">சிண்டியுடனான italki உரையாடலிலிருந்து அசோக் குமார் கிருஷ்ணமூர்த்திக்காக உருவாக்கப்பட்டது.
இந்தத் தொகுதியில் உள்ள ஒவ்வொரு பிரெஞ்சு சொல், வாக்கியம், திருத்தம், இணைப்பு, படம் அனைத்தும் அவருடையவை;
ஆங்கில-தமிழ் விளக்கங்களும் பயிற்சிகளும் அவற்றைச் சுற்றிச் சேர்க்கப்பட்டவை.</span>
</div></div></body></html>""")

out = os.path.join(os.path.dirname(__file__), '..', '01-revision-cindy.html')
open(out, 'w', encoding='utf-8').write(''.join(P))
print('wrote', out, len(''.join(P)))
