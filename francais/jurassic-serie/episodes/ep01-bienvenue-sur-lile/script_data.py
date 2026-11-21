# Episode 1 · Bienvenue sur l'île (A1).  Markup: see jurassic-serie/dsl.py
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'jurassic-serie'))
from dsl import *

meta(num=1, title="Bienvenue sur l'île", level='A1', slug='bienvenue-sur-lile', rate='-25%',
     goal="Je suis · tu es · il/elle est  ·  nous sommes · vous êtes · ils/elles sont")

# ---------------------------------------------------------------- boards
board('etre1', "ÊTRE  ·  to be", [
 "<s>je</s> <v>suis</v>", "# I am",
 "<s>tu</s> <v>es</v>", "# you are (one friend)",
 "<s>il</s> <v>est</v>", "+<s>elle</s> <v>est</v>", "# he is · she is"])
board('pron', "Les pronoms sujets", [
 "<s>je</s> = I", "+<s>tu</s> = you (friend)",
 "<s>il</s> = he", "+<s>elle</s> = she",
 "<s>on</s> = one / we", "+<s>nous</s> = we",
 "<s>vous</s> = you (polite / plural)",
 "<s>ils</s> = they (m. or mixed)", "+<s>elles</s> = they (f. only)"])
board('appelle', "Se présenter", [
 "<s>je</s> <v>m'appelle</v> Ashok", "# my name is Ashok",
 "Comment <s>tu</s> <v>t'appelles</v> ?", "# what is your name?",
 "<s>je</s> <v>suis</v> <e>ingénieur</e>", "# I am an engineer", "# NO « un » or « une » before a job!",
 "<s>il</s> <v>est</v> <e>paléontologue</e>", "+<s>elle</s> <v>est</v> <e>paléobotaniste</e>"])
board('malcolm', "Chaos !  (Ian Malcolm)", [
 "je <v>suis</v> · tu <v>es</v> · il <v>est</v>", "# suis · es · est: nothing in common!",
 "nous <v>sommes</v> · vous <v>êtes</v> · ils <v>sont</v>", "# no pattern to find: sing it, ten times a day"])
board('nation', "Nationalités", [
 "<m>il est indien</m>", "+<f>elle est indienne</f>", "# masculine + <e>E</e> = feminine",
 "<m>il est américain</m>", "+<f>elle est américaine</f>",
 "<m>il est écossais</m>", "+<f>elle est écossaise</f>",
 "<w>il est belge · elle est belge</w>", "# already ends in -e: no change", "# no capital letter: indien, belge"])
board('habite', "D'où ? · Où ?", [
 "Tu es <e>d'où</e> ?", "+<s>je</s> <v>suis</v> <e>de</e> Kulithalai", "# where are you from? · I am from Kulithalai", "# or: je <v>viens</v> de Kulithalai (I come from)",
 "<s>j'</s><v>habite</v> <e>à</e> Genk", "# I live in Genk  (je = j' before a vowel or h)",
 "<e>à</e> + <w>ville</w> :  à Genk · à Bruxelles", "# city = à",
 "<e>en</e> + <w>pays</w> :  en Belgique · en Inde · en France", "# feminine country = en"])
board('cava', "Ça va ?", [
 "Comment ça va ?", "+<y>Ça va bien, merci.</y>", "# how are you? · fine, thanks",
 "Et <e>toi</e> ?  ·  Et <e>vous</e> ?", "# and you? (friend · polite)",
 "<s>je</s> <v>suis</v> content", "+<s>je</s> <v>suis</v> fatigué", "# or use être!"])
board('etre2', "ÊTRE  ·  complet", [
 "<s>je</s> <v>suis</v> · <s>tu</s> <v>es</v> · <s>il/elle</s> <v>est</v>",
 "<s>nous</s> <v>sommes</v>", "+<s>on</s> <v>est</v>",
 "<s>vous</s> <v>êtes</v>",
 "<s>ils</s> <v>sont</v>", "+<s>elles</s> <v>sont</v>"])
board('tuvous', "tu  ou  vous ?", [
 "<s>tu</s> <v>es</v> …", "# one friend · family · a child",
 "<s>vous</s> <v>êtes</v> …", "# polite: a stranger · a boss · an older person",
 "<s>vous</s> <v>êtes</v> …", "# also: simply MORE THAN ONE person",
 "<y>in doubt? = vous</y>"])
board('resume1', "RÉSUMÉ  ·  Épisode 1", [
 "<s>je</s> <v>suis</v> · <s>tu</s> <v>es</v> · <s>il/elle</s> <v>est</v>", "+<s>nous</s> <v>sommes</v> · <s>vous</s> <v>êtes</v> · <s>ils</s> <v>sont</v>",
 "<s>je</s> <v>suis</v> <e>ingénieur</e>", "# job: no article",
 "indien <e>+e</e> = indienne", "# feminine = masculine + e",
 "je m'appelle… · j'habite à Genk, en Belgique · ça va ?",
 "<s>tu</s> = friend · <s>vous</s> = polite or plural"])
board('resume2', "10 mots clés", [
 "<y>bonjour</y> = hello", "+<y>bienvenue</y> = welcome",
 "<y>je m'appelle</y> = my name is", "+<y>ça va ?</y> = how are you?",
 "<y>merci</y> = thank you", "+<y>ici</y> = here",
 "<y>content(e)</y> = happy", "+<y>fatigué(e)</y> = tired",
 "<y>paléontologue</y> = palaeontologist", "+<y>indien(ne)</y> = Indian"])

# ---------------------------------------------------------------- intro
chapter("Bienvenue !", ['ellie'], bg='heli_cab')
explain('ellie', "[[heli_cab]]Bonjour, Ashok! Hello, and welcome to «Français Jurassique». I'm Ellie. You are the newest visitor on Isla Nublar, and we are going to teach you French, in twenty-five slow minutes. "
 "[[heli_sky]]Here is how every episode works. First, a short scene in slow French. Then the picture freezes, and a blackboard appears: that is the «Pause». This is where we learn the rule, step by step, with many examples. "
 "[[kauai1]]After the rule comes «À toi!». «À toi» means: your turn. I say a sentence in English, you get four seconds to say it in French, out loud, and then you hear the answer twice. Yes, even in the gym! "
 "[[napali]]Today you learn the most important verb in French: «être», to be. With it you say who you are, where you are from, and how you feel. Let's go!")

# ---------------------------------------------------------------- scene 1
chapter("Scène 1 · L'arrivée", ['hammond', 'ashok'], bg='heli_land', id='s1')
fr('hammond', "[[heli_land]]{Bonjour|x|hello}, Ashok ! {Bienvenue|x|welcome} sur {l'île|f|the island} !", "Hello, Ashok! Welcome to the island!")
fr('hammond', "{Je suis|x|I am} John Hammond. Je suis {écossais|m|Scottish}.", "I am John Hammond. I am Scottish.")
fr('hammond', "[[kauai1]]{Et toi|x|and you? (friend)} ? {Tu es|x|you are} Ashok. Tu es {indien|m|Indian}, {oui|x|yes} ?", "And you? You are Ashok. You are Indian, yes?")
fr('ashok', "{Oui|x|yes}, je suis Ashok. Je suis indien.", "Yes, I am Ashok. I am Indian.")
fr('hammond', "[[kauai3]]Tu es {fatigué|m|tired} ? Moi, je suis {content|m|happy} ! Tu es {ici|x|here} !", "Are you tired? Me, I am happy! You are here!")
fr('hammond', "[[heli_grass]]{Alors|x|so, well}, tu es {prêt|m|ready} ? {Voici|x|here is} l'île !", "So, are you ready? Here is the island!")

chapter("Pause ! · Être", ['ellie'], id=None)
explain('ellie', "Pause! Let's look at the board. Hammond said: «Je suis John Hammond.»² The word «suis» comes from the verb «être», which means: to be. It is the most important verb in French. "
 "We build it one person at a time. And a colour code: blue is the subject, orange is the verb. "
 "[[+]]First: «je suis». I am. «Je suis Ashok.»² «Je suis fatigué.»² «Je suis content.»² "
 "[[+]]Now «tu es». You are, to one friend. «Tu es Ashok.»² «Tu es indien.»² «Tu es ici.»² A pronunciation tip: the s at the end of «es» is silent. So «tu es» sounds like «tu è». "
 "[[+]]Finally «il est» and «elle est». He is, she is. The verb is the same for both. «Il est écossais.»² «Elle est ici.»² Here too the t of «est» is silent. So «tu es» and «il est» sound exactly alike: è. "
 "Let's say the three together, slowly: «je suis, tu es, il est.»² Very good.", board='etre1')
explain('ellie', "Before we continue, let's name all the little blue words. They are called subject pronouns: they tell you who does the verb. "
 "[[+]]«Je» means I. «Tu» means you, to one friend or one child. «Je, tu.»² "
 "[[+]]«Il» means he, and «elle» means she. «Il, elle.»² "
 "[[+]]«On» means one, and in everyday speech it also means we: «On est ici» means: we are here. The proper word for we is «nous». «On, nous.»² "
 "[[+]]«Vous» means you, but polite, or more than one person. «Vous.»² "
 "[[+]]And in the plural, they: «ils» for men, or for a mixed group, and «elles» only for a group of women. A hundred women and one man? Still «ils». Surprising, but true. «Ils, elles.»² ", board='pron')

atoi("Say: I am Ashok.", "Je suis Ashok.", img='kauai2')
atoi("Say: Are you tired?", "Tu es fatigué ?", img='kauai4')
atoi("Say: I am happy.", "Je suis content.", img='napali')
replay('s1')

# ---------------------------------------------------------------- scene 2
chapter("Scène 2 · Ellie et Alan", ['ellie', 'alan', 'ashok'], bg='jackets', id='s2')
fr('ellie', "[[jackets]]Bonjour, Ashok ! {Je m'appelle|x|my name is} Ellie. Je suis {paléobotaniste|x|palaeobotanist (fossil plants)}.", "Hello, Ashok! My name is Ellie. I am a palaeobotanist.")
fr('alan', "[[quarry]]{Salut|x|hi (informal)}. {Moi, c'est|x|me, I'm (informal)} Alan. Je suis {paléontologue|x|palaeontologist (fossil animals)}.", "Hi. Me, I'm Alan. I am a palaeontologist.")
fr('ellie', "[[vertebrae]]Et toi, tu es {ingénieur|m|engineer} ?", "And you, are you an engineer?")
fr('ashok', "Oui, je suis ingénieur.", "Yes, I am an engineer.")
fr('alan', "Ah, {il est|x|he is} ingénieur ! Bravo.", "Ah, he is an engineer! Bravo.")
fr('hammond', "[[wall]]Alan est paléontologue, {et|x|and} Ellie est paléobotaniste. {Ils sont|x|they are} ici !", "Alan is a palaeontologist, and Ellie is a palaeobotanist. They are here!")

chapter("Pause ! · Se présenter", ['ellie'])
explain('ellie', "Pause! Ellie again. Two things in this scene. "
 "[[+]]First, my name. «Je m'appelle Ellie.»² It means: my name is Ellie. Literally: I call myself Ellie. Learn it as one block: «je m'appelle», plus your name. «Je m'appelle Ashok.»² [[+]]And to ask the question: «Comment tu t'appelles?»² What is your name? «Comment» sounds like «komon», and «tu t'appelles» like «tu tapel». Again: «Comment tu t'appelles?»² "
 "[[+]]Second, jobs. Alan said: «Je suis paléontologue.»² Here is the rule of this board, and English speakers get it wrong all the time. In English you say: I am AN engineer. In French, you say «je suis», then the job, with nothing in between. No «un», no «une». "
 "«Je suis ingénieur.»² «Tu es ingénieur.»² «Je suis paléontologue.»² Subject, plus «être», plus job. No article. "
 "[[+]]It works with «il» and «elle» too. «Il est paléontologue.»² «Elle est paléobotaniste.»² A palaeontologist studies fossil animals; a palaeobotanist studies fossil plants. "
 "And good news: «paléontologue» and «paléobotaniste» end in e, so they are the same for a man and a woman.", board='appelle')
atoi("Say: My name is Ashok.", "Je m'appelle Ashok.", img='cleaning')
atoi("Say: I am an engineer.", "Je suis ingénieur.", img='lab')
atoi("Say: She is a palaeobotanist.", "Elle est paléobotaniste.", img='ferns')
atoi("Say: He is a palaeontologist.", "Il est paléontologue.", img='quarry')
replay('s2')

# ---------------------------------------------------------------- scene 3
chapter("Scène 3 · Ian arrive", ['malcolm', 'ellie', 'ashok'], bg='path', id='s3')
fr('malcolm', "[[path]]Bonjour ! Je suis Ian Malcolm. Je suis {mathématicien|m|mathematician}.", "Hello! I am Ian Malcolm. I am a mathematician.")
fr('malcolm', "Et toi ? Tu es {d'où|x|from where?} ?", "And you? Where are you from?")
fr('ashok', "[[canopy]]Je m'appelle Ashok. Je suis indien. Je {viens de|x|I come from} Kulithalai, en {Inde|f|India}.", "My name is Ashok. I am Indian. I come from Kulithalai, in India.")
fr('ashok', "[[jungle1]]{J'habite|x|I live} {à|x|in (a city)} Genk, en {Belgique|f|Belgium}. Je suis ingénieur.", "I live in Genk, in Belgium. I am an engineer.")
fr('ellie', "[[canopy]]Il est indien. Il habite à Genk, en Belgique.", "He is Indian. He lives in Genk, in Belgium.")
fr('malcolm', "Ah, tu es indien ! Moi, je suis américain.", "Ah, you are Indian! Me, I am American.")
fr('ellie', "[[ferns2]]Moi {aussi|x|also, too}, je suis {américaine|f|American}. Alan est américain aussi.", "Me too, I am American. Alan is American too.")
fr('alan', "[[jungle2]]Et Hammond est écossais. {Nous sommes|x|we are} ici sur l'île.", "And Hammond is Scottish. We are here on the island.")

chapter("Pause ! · Le chaos", ['malcolm'])
explain('malcolm', "Hello, Ashok. Ian Malcolm. Mathematician, and professional pessimist. Ellie showed you three forms of «être»: «je suis, tu es, il est.» Did you notice the problem? Look at the board. "
 "[[+]]«Suis.» «Es.» «Est.» They have nothing in common. A regular verb keeps the same stem and only changes its ending. «Être» does not. People who study the history of French say that it was stitched together from several different old verbs, which is why its forms look like strangers. In my field, we call this chaos. "
 "[[+]]But chaos has patterns, if you stay long enough. My advice: don't analyse it. Sing it. «Je suis, tu es, il est, nous sommes, vous êtes, ils sont.»² Ten times a day. The good news is that only a handful of verbs are this wild. And «être» is the one you will use most, so every minute you spend on it pays you back.", board='malcolm')

chapter("Pause ! · Les nationalités", ['ellie'])
explain('ellie', "Ellie again. Let's look at nationalities, because there is something new in this scene. Ian said: «Je suis américain.»² And I said: «Je suis américaine.»² Listen to the end of the word. It changes. This is called agreement: the adjective follows the gender of the person. "
 "[[+]]«Indien» is the masculine form. For a woman, add an E: «indienne». The formula: masculine, plus E, equals feminine. «Il est indien.»² «Elle est indienne.»² Listen to the difference: in «indien», the n is silent, and the vowel is nasal. In «indienne», the E makes the n audible. «Indien. Indienne.»² "
 "[[+]]The same with «américain», «américaine». «Il est américain.»² «Elle est américaine.»² "
 "[[+]]And «écossais», Scottish, becomes «écossaise». «Il est écossais.»² «Elle est écossaise.»² Notice: the s of «écossais» is silent, but in «écossaise» it sounds like a z. "
 "[[+]]And if the masculine already ends in E, nothing changes. «Belge», Belgian, is the same for both. «Il est belge.»² «Elle est belge.»² "
 "Also: in French, nationalities have no capital letter. And you, Ashok, are a man, so you say: «Je suis indien.»²", board='nation')
explain('ellie', "Next: where you are from, and where you live. "
 "[[+]]«Tu es d'où?»² Where are you from? It is «de», plus «où», and «de» shrinks to «d'» in front of a vowel. The answer: «Je suis de Kulithalai.»² «Je suis de Bruxelles.»² «Je suis de», plus a city. You can also say «Je viens de Kulithalai.»² It means: I come from. Learn it as a block. "
 "[[+]]Where you live: «J'habite.»² I live. «Je» becomes «j'» before a vowel, and also before an h, because the h is silent. «J'habite à Genk.»² «J'habite à Bruxelles.»² "
 "[[+]]The little word for a city is «à». «À Genk.»² «À Bruxelles.»² The formula: «à» plus a city. "
 "[[+]]For a country, a feminine one, use «en»: «en Belgique», «en Inde», «en France.»² The formula: «en» plus a country. So Ashok says: «J'habite à Genk, en Belgique.»² «Habite» is a new verb. For today, simply learn «j'habite» as an expression.", board='habite')
atoi("Say: I am Indian.", "Je suis indien.", img='kauai1')
atoi("Say: I live in Genk.", "J'habite à Genk.", img='napali')
atoi("Say: I live in Belgium.", "J'habite en Belgique.", img='beach1')
atoi("Say: She is American.", "Elle est américaine.", img='hall1')
atoi("Say: Where are you from?", "Tu es d'où ?", img='jungle1')
replay('s3')

# ---------------------------------------------------------------- scene 4
chapter("Scène 4 · Ça va ?", ['hammond', 'ellie', 'ashok'], bg='palms', id='s4')
fr('hammond', "[[palms]]Alors, {comment ça va|x|how are you?} ?", "So, how are you?")
fr('ellie', "Ça va {bien|x|well, fine}, {merci|x|thank you}. Et vous ?", "I'm fine, thank you. And you?")
fr('hammond', "[[beach2]]Moi, ça va {très bien|x|very well} !", "Me, I'm very well!")
fr('ashok', "Ça va bien, merci. Je suis content !", "I'm fine, thank you. I am happy!")
fr('alan', "Ça va, {mais|x|but} je suis fatigué.", "I'm OK, but I am tired.")
fr('hammond', "[[beach1]]{Vous êtes|x|you are (plural / polite)} fatigués ? Ah {non|x|no} ! Nous sommes ici, sur l'île ! Nous sommes contents !", "You are tired? Oh no! We are here, on the island! We are happy!")
fr('ellie', "[[forest]]Oui, nous sommes contents. Ashok et Ian, ils sont ici aussi.", "Yes, we are happy. Ashok and Ian, they are here too.")

chapter("Pause ! · Ça va ?", ['ellie'])
explain('ellie', "Pause! First, the question you will hear a hundred times a day. "
 "[[+]]«Comment ça va?»² How are you? Literally: how does it go? The answers: «Ça va bien, merci.»² Fine, thank you. Or simply: «Ça va.»² «Ça» sounds like «sa»: the little tail under the c, called a cedilla, makes it an s. "
 "[[+]]Then you give the question back. To a friend: «Et toi?»² To someone you respect: «Et vous?»² "
 "[[+]]Or use «être», as we learned: «Je suis content.»² «Je suis fatigué.»² Easy.", board='cava')
explain('ellie', "Now the plural of «être». The singular is already on the board. [[+]]Now the new forms. "
 "[[+]]«Nous sommes.» We are. «Nous sommes ici.»² «Nous sommes contents.»² Two m's, and the s of «nous» is silent. In everyday speech, people often say «on est» instead: «On est ici.»² Same meaning. "
 "[[+]]«Vous êtes.» You are, polite or plural. «Vous êtes fatigués.»² Note the little hat on the ê. And when «vous» means several people, the adjective takes an s in writing: «fatigués», «contents». You don't hear it, but you see it. "
 "[[+]]«Ils sont», «elles sont.» They are. «Ils sont ici.»² «Elles sont américaines.»² "
 "Now all six, slowly: «je suis, tu es, il est, nous sommes, vous êtes, ils sont.»²", board='etre2')
explain('ellie', "Last point of the day: «tu» or «vous»? "
 "[[+]]«Tu» is for one friend, family, a child. «Tu es fatigué?»² "
 "[[+]]«Vous» is polite. Use it with a stranger, a boss, an older person, a shop assistant. «Vous êtes fatigué?»² "
 "[[+]]And «vous» is also simply the plural, for several people, even close friends. «Vous êtes contents?»² "
 "[[+]]A rule of thumb for France and Belgium: when in doubt, use «vous». People will often propose: let's use «tu». That is a friendly moment. In our story, we all say «tu» to you, Ashok, because we are colleagues.", board='tuvous')
atoi("Say: We are on the island.", "Nous sommes sur l'île.", img='beach2')
atoi("Say: You are a palaeontologist. Polite form.", "Vous êtes paléontologue.", img='trex')
atoi("Say: How are you?", "Comment ça va ?", img='palms')
atoi("Say: They are here.", "Ils sont ici.", img='forest')
replay('s4')

# ---------------------------------------------------------------- résumé
chapter("Résumé", ['ellie'], bg='kauai2')
explain('ellie', "Résumé! Let's put the whole episode on one board. "
 "[[+]]The verb «être», all six forms: «je suis, tu es, il est, nous sommes, vous êtes, ils sont.»² [[+]]A job, with no article: «Je suis ingénieur.»² «Elle est paléobotaniste.»² "
 "[[+]]Feminine: masculine plus e. «Il est indien.»² «Elle est indienne.»² [[+]]Three blocks to learn by heart: «Je m'appelle Ashok.»² «J'habite à Genk.»² «Ça va?»² "
 "[[+]]And «tu» for a friend, «vous» for politeness, or for several people. «Tu es fatigué.» «Vous êtes fatigués.»", board='resume1')
explain('ellie', "And now ten key words. "
 "[[+]]«Bonjour», hello. «Bienvenue», welcome. [[+]]«Je m'appelle», my name is. «Ça va?», how are you? [[+]]«Merci», thank you. «Ici», here. "
 "[[+]]«Content», happy. «Fatigué», tired. [[+]]«Paléontologue», palaeontologist. «Indien», Indian. "
 "Well done, Ashok!", board='resume2')

chapter("À bientôt !", ['hammond', 'ellie'], bg='heli_land')
fr('hammond', "[[heli_land]]Bravo, Ashok ! Merci, et à bientôt !", "Bravo, Ashok! Thank you, and see you soon!")
explain('ellie', "[[brachio_hall]]Next episode: the dinosaurs! You will meet the verb «avoir», to have, and learn how to say «a» and «the» in French, with masculine and feminine nouns. [[heli_grass]]Until then, repeat «je suis, tu es, il est», ten times a day. À bientôt!")
