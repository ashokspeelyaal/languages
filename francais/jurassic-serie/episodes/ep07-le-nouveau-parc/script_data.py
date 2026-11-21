# Episode 7 · Le nouveau parc (A2).  Markup: see jurassic-serie/dsl.py
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
from dsl import *

meta(num=7, title="Le nouveau parc", level='A2', slug='le-nouveau-parc', rate='-15%',
     goal="Verbes pronominaux  ·  Ma journée  ·  du / de la / des  ·  pas de  ·  boire  ·  vous  ·  mille")

# ---------------------------------------------------------------- boards
board('rappel6', "RAPPEL  ·  Épisode 6", [
 "<s>je</s> <v>vais</v> <e>attendre</e>", "# aller + infinitive",
 "<v>Regarde</v> ! · <w>Ne</w> <v>bouge</v> <w>pas</w> !", "# orders",
 "<w>Il faut</w> <e>rester</e>", "# you must",
 "<s>j'</s><v>ai</v> froid · faim · soif · peur", "# avoir for feelings",
 "<w>il fait</w> beau · <w>il</w> pleut", "# the weather: always « il »"])
board('vous', "Tu ou vous ?", [
 "<s>tu</s> <v>es</v> · <s>tu</s> <v>aimes</v>", "# friends, family, children",
 "<s>vous</s> <v>êtes</v> · <s>vous</s> <v>aimez</v>", "# boss, stranger, older person, or several people",
 "Bonjour, <y>monsieur</y> · Bonjour, <y>madame</y>", "+<w>s'il vous plaît</w> = please",
 "# keep « vous » until they say: « On se tutoie ? »"])
board('reflex1', "Les verbes pronominaux", [
 "<s>SUJET</s> + <e>me / te / se</e> + <v>VERBE</v>", "# an extra little word: me, te, se, nous, vous, se",
 "<s>je</s> <e>me</e> <v>lève</v>", "# I get up (I raise myself)",
 "<s>je</s> <e>m'</e><v>appelle</v>", "# you knew one already!",
 "<s>je</s> <e>m'</e><v>habille</v>", "+<s>il</s> <e>s'</e><v>habille</v>", "# me, te, se become m', t', s' before a vowel or h"])
board('lever', "Se lever  ·  to get up", [
 "<s>je</s> <e>me</e> <v>lève</v>", "+<s>tu</s> <e>te</e> <v>lèves</v>",
 "<s>il</s> <e>se</e> <v>lève</v>", "+<s>nous</s> <e>nous</e> <v>levons</v>",
 "<s>vous</s> <e>vous</e> <v>levez</v>", "+<s>ils</s> <e>se</e> <v>lèvent</v>", "# è in lève, lèves, lèvent · plain e in levons, levez"])
board('neg_ref', "Le négatif  ·  pas et jamais", [
 "<s>je</s> <w>ne</w> <e>me</e> <v>lève</v> <w>pas</w>", "# ne goes before « me »",
 "<s>il</s> <w>ne</w> <e>se</e> <v>couche</v> <w>jamais</w> tôt", "# jamais = never, same place as pas",
 "<s>je</s> <w>ne</w> <e>m'</e><v>habille</v> <w>pas</w>", "# ne + m' : ne m'habille pas",
 "<s>vous</s> <e>vous</e> <v>levez</v> tôt ?", "+<w>Est-ce que</w> <s>vous</s> <e>vous</e> <v>levez</v> tôt ?"])
board('routine', "Ma journée  ·  Claire", [
 "se <v>réveiller</v> · se <v>lever</v>", "+se <v>laver</v> · s'<v>habiller</v>", "# wake up · get up · wash · get dressed",
 "se <v>préparer</v> · se <v>coucher</v>", "# get ready · go to bed",
 "<y>tôt</y> = early · <y>tard</y> = late",
 "<y>d'abord</y> · <y>ensuite</y> · <y>après</y> · <y>enfin</y>", "# first · then · afterwards · finally",
 "<y>D'abord</y>, <s>je</s> <e>me</e> <v>réveille</v>.", "+<y>Enfin</y>, <s>je</s> <e>me</e> <v>couche</v>."])
board('partitif', "Le partitif  ·  some", [
 "<m>du</m> café · <m>du</m> pain", "# masculine: du",
 "<f>de la</f> viande · <f>de la</f> soupe", "# feminine: de la",
 "<w>de l'</w>eau · <w>de l'</w>électricité", "# before a vowel: de l'",
 "<w>des</w> plantes · <w>des</w> légumes", "# plural: des",
 "# an unknown amount. English says nothing: I drink coffee"])
board('partneg', "Pas de !", [
 "Je bois <w>du</w> café.", "+Il mange <w>de la</w> viande.",
 "Je <w>ne</w> bois <w>pas de</w> café.", "+Il <w>ne</w> mange <w>pas de</w> viande.", "# after a negation: du, de la, des = de",
 "Il y a <w>de l'</w>eau.", "+Il n'y a pas <w>d'</w>eau.", "# de becomes d' before a vowel"])
board('quant', "Les quantités  +  de", [
 "<w>beaucoup de</w> café · <w>beaucoup d'</w>eau", "# a lot of",
 "<w>un peu de</w> lait · <w>assez de</w> pain", "# a little · enough",
 "<w>trop de</w> sucre · <w>trop de</w> visiteurs", "# too much · too many",
 "<w>une tasse de</w> café · <w>un verre d'</w>eau", "# a cup of · a glass of",
 "# after a quantity: just « de ». No du, no des!"])
board('boire', "Boire  ·  chaos in a glass", [
 "<s>je</s> <v>bois</v> · <s>tu</s> <v>bois</v>", "# the same sound",
 "<s>il</s> <v>boit</v> · <s>nous</s> <v>buvons</v>",
 "<s>vous</s> <v>buvez</v> · <s>ils</s> <v>boivent</v>", "# stem: boi · buv · boiv",
 "Je <v>bois</v> <w>du</w> café.", "+Je <w>ne</w> <v>bois</v> <w>pas de</w> thé."])
board('nombres', "Les grands nombres", [
 "1 000 = <v>mille</v>", "+2 000 = deux <v>mille</v>", "# mille never takes an S",
 "20 000 = vingt <v>mille</v>", "+100 000 = cent <v>mille</v>",
 "1 000 000 = un <v>million</v>", "+2 000 000 = deux <v>millions</v>", "# million is a noun: it takes an S",
 "un million <e>de</e> visiteurs", "# million + de + noun, but: mille visiteurs"])
board('resume7', "RÉSUMÉ  ·  Épisode 7", [
 "<s>je</s> <e>me</e> <v>lève</v> · <s>tu</s> <e>te</e> <v>lèves</v>", "# me · te · se · nous · vous · se",
 "<s>je</s> <w>ne</w> <e>me</e> <v>lève</v> <w>pas</w>",
 "<m>du</m> café · <f>de la</f> viande · <w>de l'</w>eau · <w>des</w> plantes",
 "<w>pas de</w> café · <w>beaucoup de</w> café",
 "<s>je</s> <v>bois</v> · <s>nous</s> <v>buvons</v> · <s>ils</s> <v>boivent</v>",
 "<s>vous</s> <v>êtes</v> = polite · vingt <v>mille</v> · un <v>million</v> de"])
board('resume8', "10 mots clés", [
 "<y>la directrice</y> = the director", "+<y>le visiteur</y> = the visitor",
 "<y>le pain</y> = bread", "+<y>la viande</y> = meat",
 "<y>le thé</y> = tea", "+<y>l'eau</y> = water",
 "<y>la tasse</y> = cup", "+<y>le verre</y> = glass",
 "<y>tôt</y> = early", "+<y>tard</y> = late"])

# ---------------------------------------------------------------- intro + rappel
chapter("Bienvenue !", ['ellie', 'ashok'], bg='lagoon')
explain('ellie', "[[lagoon]]Bonjour, Ashok! Welcome to A2, and to the new park. Everything here is modern, and you will meet a new person: Claire, who runs the park. "
 "[[resort]]Today: reflexive verbs for the daily routine, food and quantities, the verb «boire», and the polite «vous». First, the «Rappel» of episode six.")
chapter("Rappel · Épisode 6", ['ellie'], bg='storm1')
explain('ellie', "Look at the board. "
 "[[+]]The near future: «aller» plus the infinitive. «Je vais attendre.»² "
 "[[+]]Orders: «Regarde!»² And «Ne bouge pas!»² "
 "[[+]]«Il faut rester.»² "
 "[[+]]Feelings use «avoir»: «J'ai froid, j'ai faim, j'ai soif, j'ai peur.»² "
 "[[+]]And the weather: «il fait beau, il pleut.»² Three quick questions.", board='rappel6')
atoi("Say: I am going to wait.", "Je vais attendre.", img='lightning', by='ashok')
atoi("Say: I am cold.", "J'ai froid.", img='clouds1', by='ashok')
atoi("Say: Don't move!", "Ne bouge pas !", img='rain', by='ashok')

# ---------------------------------------------------------------- scene 1
chapter("Scène 1 · Bienvenue", ['claire', 'ashok'], bg='resort', id='s1')
fr('claire', "[[resort]]{Bonjour|x|hello}, monsieur. Vous êtes Ashok ? {Bienvenue|x|welcome} dans le nouveau parc. Je m'appelle Claire. Je suis {la directrice|f|the director} du parc.", "Hello, sir. Are you Ashok? Welcome to the new park. My name is Claire. I am the director of the park.")
fr('ashok', "[[lagoon]]Bonjour, madame. Oui, je suis Ashok. Je suis ingénieur. Je suis de Kulithalai, en Inde, mais j'habite à Genk, en Belgique.", "Hello, madam. Yes, I am Ashok. I am an engineer. I am from Kulithalai, in India, but I live in Genk, in Belgium.")
fr('claire', "[[resort]]Vous aimez les films, {n'est-ce pas|x|right?} ? Vous allez voir le parc. Venez avec moi, {s'il vous plaît|x|please}.", "You like films, right? You are going to see the park. Come with me, please.")
fr('ashok', "[[lagoon]]Oui, j'adore les films ! Je suis très content, mais j'ai un peu peur.", "Yes, I love films! I am very happy, but I am a little scared.")

chapter("Pause ! · Tu ou vous ?", ['ellie'])
explain('ellie', "Pause! Did you hear it? Claire said «Vous êtes Ashok?»² Not «tu es». Claire is the boss, and you have just met. That is the polite «vous». "
 "[[+]]«Tu» is for friends, family and children. «Vous» is for a boss, a stranger, an older person, and also for several people. The verb follows: «vous êtes», «vous aimez». And Ashok answers «vous» too. "
 "[[+]]Add «monsieur» for a man, «madame» for a woman: «Bonjour, madame.»² And «s'il vous plaît»² means please. "
 "[[+]]In France and Belgium, you stay with «vous» until the other person says: «On se tutoie?»² Shall we use tu? Then you switch.", board='vous')
atoi("Say, politely: Are you Ashok?", "Vous êtes Ashok ?", img='resort', by='claire')
atoi("Say: Hello, madam.", "Bonjour, madame.", img='lagoon', by='ashok')
replay('s1')

# ---------------------------------------------------------------- scene 2
chapter("Scène 2 · La journée de Claire", ['claire', 'ashok'], bg='office', id='s2')
fr('claire', "[[office]]Voici mon bureau. {Je me lève|x|I get up} à cinq heures. {Je me prépare|x|I get ready} vite. Je ne me couche {jamais|x|never} avant minuit.", "Here is my office. I get up at five. I get ready quickly. I never go to bed before midnight.")
fr('ashok', "[[alarm]]Vous vous levez à cinq heures ? Moi, je me lève à sept heures.", "You get up at five? Me, I get up at seven.")
fr('claire', "[[sunrise1]]{D'abord|x|first}, je me réveille. {Ensuite|x|then}, je me lave. {Après|x|afterwards}, je m'habille. {Enfin|x|finally}, je bois un café.", "First, I wake up. Then, I wash. Afterwards, I get dressed. Finally, I drink a coffee.")
fr('ashok', "[[office]]Et le soir, vous vous couchez tôt ?", "And in the evening, do you go to bed early?")
fr('claire', "[[alarm]]Non. Je me couche {tard|x|late}. Il y a {beaucoup de|x|a lot of} travail !", "No. I go to bed late. There is a lot of work!")
chapter("Oups ! · Une petite erreur", ['claire', 'ashok'], bg='alarm')
fr('ashok', "[[alarm]]Moi, je lève à sept heures.", "Me, I get up at seven. (wrong!)", mistake=True)
fr('claire', "[[office]]Non, monsieur. On dit : je me lève. Avec « me ».", "No, sir. We say: je me lève. With « me ».", mistake=True)

chapter("Pause ! · Les verbes pronominaux", ['ellie'])
explain('ellie', "Pause! Ashok forgot something small, and big. Claire said: «Je me lève.»² Literally: I raise myself. This is a reflexive verb. "
 "[[+]]The formula: the subject, plus a little extra word, «me, te, se, nous, vous, se», plus the verb. The little word is the same person as the subject. "
 "[[+]]«Je me lève.»² It means: I get up. "
 "[[+]]And you already knew one! «Je m'appelle.»² Literally: I call myself. "
 "[[+]]Before a vowel or an H, «me» becomes «m'», «se» becomes «s'». «Je m'habille.»² «Il s'habille.»²", board='reflex1')
explain('ellie', "Now the whole verb, «se lever». Note the small spelling change: «lever» takes a grave accent in some forms. "
 "[[+]]«Je me lève.»² «Tu te lèves.»² "
 "[[+]]«Il se lève.»² «Nous nous levons.»² "
 "[[+]]«Vous vous levez.»² «Ils se lèvent.»² "
 "Accent for «lève, lèves, lèvent», where the ending is silent; no accent for «levons» and «levez». Say the whole line once more: «je me lève, tu te lèves, il se lève, nous nous levons, vous vous levez, ils se lèvent.»", board='lever')
atoi("Say: I get up at seven.", "Je me lève à sept heures.", img='sunrise1', by='ashok')
atoi("Say: She goes to bed late.", "Elle se couche tard.", img='alarm', by='ashok')
explain('ellie', "Now the negative. «Ne» goes before the little word, and «pas» goes after the verb. "
 "[[+]]«Je ne me lève pas.»² The little word stays glued to the verb. "
 "[[+]]With «jamais», never, same place as «pas»: «Il ne se couche jamais tôt.»² "
 "[[+]]Before a vowel: «Je ne m'habille pas.»² "
 "[[+]]For a question, use intonation, or «est-ce que»: «Vous vous levez tôt?»² «Est-ce que vous vous levez tôt?»² Polite, because it is «vous».", board='neg_ref')
atoi("Say, politely: Do you get up early?", "Vous vous levez tôt ?", img='office', by='claire')
chapter("Pause ! · La journée de Claire", ['ellie', 'claire'])
explain('ellie', "Claire's routine, in six verbs. "
 "[[+]]«Se réveiller», to wake up. «Se lever», to get up. «Se laver», to wash. «S'habiller», to get dressed. "
 "[[+]]«Se préparer», to get ready. «Se coucher», to go to bed. "
 "[[+]]«Tôt», early. «Tard», late. "
 "[[+]]And four words to put things in order: «d'abord», first. «Ensuite», then. «Après», afterwards. «Enfin», finally. "
 "[[+]]«D'abord, je me réveille.»² «Enfin, je me couche.»² It also works for other people: «Claire se lève tôt.»² «Elle se couche tard.»² «Nous nous levons à six heures.»² Now your turn.", board='routine')
atoi("Say: First I wake up, then I get dressed.", "D'abord, je me réveille, ensuite je m'habille.", img='sunrise2', by='ashok')
atoi("Say: I do not go to bed early.", "Je ne me couche pas tôt.", img='alarm', by='ashok')
replay('s2')

# ---------------------------------------------------------------- scene 3
chapter("Scène 3 · L'heure du repas", ['claire', 'ashok'], bg='herb1', id='s3')
fr('claire', "[[herb1]]C'est l'heure du repas. {Les herbivores|m|herbivores} mangent beaucoup de plantes. {Les carnivores|m|carnivores} mangent de la viande.", "It is mealtime. The herbivores eat a lot of plants. The carnivores eat meat.")
fr('ashok', "[[meadow]]Et vous, madame ? Vous mangez du {pain|m|bread} le matin ?", "And you, madam? Do you eat bread in the morning?")
fr('claire', "[[bread]]Oui, je mange du pain et un peu de {fromage|m|cheese}. Je bois du café. Je ne bois pas de {thé|m|tea}.", "Yes, I eat bread and a little cheese. I drink coffee. I do not drink tea.")
fr('ashok', "[[tea]]Moi, je bois du thé, avec du {lait|m|milk}. Et je bois beaucoup d'eau.", "Me, I drink tea, with milk. And I drink a lot of water.")
fr('claire', "[[lagoon]]Il y a {de l'eau|f|water} dans le lagon. Un {verre|m|glass} d'eau, {s'il vous plaît|x|please} ? Et une {tasse|f|cup} de café pour moi.", "There is water in the lagoon. A glass of water, please? And a cup of coffee for me.")
chapter("Oups ! · Une autre erreur", ['claire', 'ashok'], bg='tea')
fr('ashok', "[[tea]]Je ne bois pas du thé.", "I do not drink tea. (wrong!)", mistake=True)
fr('claire', "[[bread]]Non, monsieur. Après « pas », on dit : pas de thé.", "No, sir. After « pas », we say: pas de thé.", mistake=True)

chapter("Pause ! · Le partitif", ['ellie'])
explain('ellie', "Pause! In English you say: I drink coffee. No article. In French you cannot: you need «du», «de la», «de l'» or «des». That means some, an unknown amount. It is called the partitive. "
 "[[+]]With a masculine noun: «du». «Je mange du pain.»² «Je bois du café.»² "
 "[[+]]With a feminine noun: «de la». «Il mange de la viande.»² «De la soupe.»² "
 "[[+]]Before a vowel, «de l'», for both genders: «de l'eau»² and «de l'électricité.»² "
 "[[+]]And for a plural: «des». «Les herbivores mangent des plantes.»² "
 "So: du, de la, de l', des. Four forms, depending on the noun.", board='partitif')
atoi("Say: I drink coffee.", "Je bois du café.", img='coffee', by='ashok')
atoi("Say: We eat bread.", "Nous mangeons du pain.", img='bread', by='ashok')
explain('ellie', "Now the big rule, and Ashok's mistake. After a negation, du, de la and des all become «de». "
 "[[+]]«Je bois du café.»² «Il mange de la viande.»² "
 "[[+]]«Je ne bois pas de café.»² «Il ne mange pas de viande.»² No more «du», no more «de la». You said in episode four: «pas de viande»; same rule. "
 "[[+]]Before a vowel, «de» becomes «d'»: «Il y a de l'eau.»² «Il n'y a pas d'eau.»² And «Elle ne mange pas de pain.»² "
 "That is why Claire corrected Ashok: «pas de thé.»²", board='partneg')
atoi("Say: I don't drink coffee.", "Je ne bois pas de café.", img='stego', by='ashok')
explain('ellie', "Next, quantities. They are also followed by «de». "
 "[[+]]«Beaucoup de café.»² A lot of coffee. «Beaucoup d'eau.»² "
 "[[+]]«Un peu de lait.»² A little milk. «Assez de pain.»² Enough bread. "
 "[[+]]«Trop de sucre.»² Too much sugar. «Trop de visiteurs.»² Too many visitors. "
 "[[+]]«Une tasse de café.»² A cup of coffee. «Un verre d'eau.»² A glass of water. "
 "After a quantity, only «de». Never «du», never «des». «Il y a trop de visiteurs.»² «Je bois beaucoup de thé.»²", board='quant')
atoi("Say: There is a lot of water.", "Il y a beaucoup d'eau.", img='lagoon', by='ashok')
chapter("Pause ! · Boire", ['malcolm'])
explain('malcolm', "Ian Malcolm here. «Boire», to drink. Chaos in a glass, but with a pattern. "
 "[[+]]«Je bois, tu bois.»² Same sound. "
 "[[+]]«Il boit, nous buvons.»² "
 "[[+]]«Vous buvez, ils boivent.»² Three stems: «boi», «buv», «boiv». The forms with an ending you say, «nous» and «vous», use «buv». "
 "[[+]]And now with what you know: «Je bois du café.»² «Je ne bois pas de thé.»² Cheers.", board='boire')
atoi("Say: We drink water.", "Nous buvons de l'eau.", img='water', by='ashok')
replay('s3')

# ---------------------------------------------------------------- scene 4
chapter("Scène 4 · Les visiteurs", ['claire', 'hammond', 'ashok'], bg='crowd', id='s4')
fr('claire', "[[crowd]]Voici l'entrée du parc. Il y a {vingt mille|x|twenty thousand} visiteurs {par jour|x|per day}.", "Here is the entrance of the park. There are twenty thousand visitors per day.")
fr('hammond', "[[crowd2]]Bonjour, Ashok ! Dans le nouveau parc, il y a {mille|x|a thousand} chambres à l'hôtel. Et il y a {un million|x|a million} de visiteurs par an !", "Hello, Ashok! In the new park, there are a thousand rooms at the hotel. And there is a million visitors per year!")
fr('ashok', "[[crowd]]Un million ! Vingt mille par jour ! C'est beaucoup de monde !", "A million! Twenty thousand per day! That is a lot of people!")
fr('claire', "[[resort]]Oui. Et ils mangent trop de pain ! Il faut beaucoup de travail.", "Yes. And they eat too much bread! It takes a lot of work.")

chapter("Pause ! · Les grands nombres", ['ellie'])
explain('ellie', "Pause! Mr Hammond loves big numbers, so here they are. You know up to one hundred. Now: «mille», one thousand. "
 "[[+]]«Mille.»² «Deux mille.»² And «mille» never takes an S. "
 "[[+]]«Vingt mille.»² «Cent mille.»² Twenty thousand, a hundred thousand. "
 "[[+]]«Un million.»² «Deux millions.»² But «million» is a noun, so it takes an S. "
 "[[+]]And after «million», you need «de»: «un million de visiteurs.»² But «mille visiteurs», with no «de». «Il y a vingt mille visiteurs.»² «Il y a un million de visiteurs.»²", board='nombres')
atoi("Say: Twenty thousand visitors.", "Vingt mille visiteurs.", img='crowd', by='ashok')
atoi("Say: A million visitors.", "Un million de visiteurs.", img='crowd2', by='ashok')
replay('s4')

# ---------------------------------------------------------------- résumé
chapter("Résumé", ['ellie'], bg='sunrise2')
explain('ellie', "Résumé of episode seven. "
 "[[+]]Reflexive verbs: a little extra word. «Je me lève, tu te lèves.»² "
 "[[+]]The negative wraps around both: «Je ne me lève pas.»² "
 "[[+]]The partitive: «du café, de la viande, de l'eau, des plantes.»² "
 "[[+]]After a negation or a quantity: only «de». «Pas de café.»² «Beaucoup de café.»² "
 "[[+]]«Boire»: «je bois, nous buvons, ils boivent.»² "
 "[[+]]And «vous» for politeness, with big numbers: «vingt mille», «un million de».", board='resume7')
explain('ellie', "And ten key words. "
 "[[+]]«La directrice», the director. «Le visiteur», the visitor. [[+]]«Le pain», bread. «La viande», meat. [[+]]«Le thé», tea. «L'eau», water. "
 "[[+]]«La tasse», the cup. «Le verre», the glass. [[+]]«Tôt», early. «Tard», late.", board='resume8')

chapter("À bientôt !", ['claire', 'ashok', 'ellie'], bg='lagoon')
fr('claire', "[[lagoon]]Merci, monsieur. {À demain|x|see you tomorrow}, à sept heures !", "Thank you, sir. See you tomorrow, at seven o'clock!")
fr('ashok', "{Avec plaisir|x|with pleasure}, madame. Je vais me coucher tôt !", "With pleasure, madam. I am going to go to bed early!")
explain('ellie', "[[kauai1]]Next time, you will meet Owen and his raptors. You will learn to say what you can, want and must do, and how to compare. [[sunrise1]]Until then, tell yourself your day in French, every morning: «D'abord, je me lève.» À bientôt!")
