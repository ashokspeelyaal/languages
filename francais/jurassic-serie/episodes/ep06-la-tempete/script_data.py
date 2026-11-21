# Episode 6 · La tempête (A1, end).  Markup: see jurassic-serie/dsl.py
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
from dsl import *

meta(num=6, title="La tempête", level='A1', slug='la-tempete', rate='-25%',
     goal="je vais + infinitif  ·  Regarde !  ·  Il faut + infinitif  ·  J'ai froid  ·  Révision A1")

# ---------------------------------------------------------------- boards
board('rappel5', "RAPPEL  ·  Épisode 5", [
 "<s>je</s> <v>vais</v> · <s>tu</s> <v>vas</v> · <s>il</s> <v>va</v>", "+<s>nous</s> <v>allons</v> · <s>vous</s> <v>allez</v> · <s>ils</s> <v>vont</v>",
 "à + le = <e>au</e>", "+à + les = <e>aux</e>", "+de + le = <e>du</e>",
 "<s>je</s> <v>viens</v> <e>d'</e>Inde", "# I come from India",
 "<s>il</s> <v>est</v> trois heures <e>et demie</e>", "# it is half past three",
 "devant · derrière · dans · sur · sous", "+à côté <e>de</e> · entre · en face <e>de</e>"])
board('meteo', "La météo  ·  the weather", [
 "<w>il fait</w> <e>beau</e>", "+<w>il fait</w> <e>mauvais</e>", "# nice weather · bad weather",
 "<w>il fait</w> <e>chaud</e>", "+<w>il fait</w> <e>froid</e>", "# hot · cold",
 "<w>il</w> <v>pleut</v>", "# it rains · it is raining",
 "il y a <e>du vent</e>", "+il y a <e>un orage</e>", "# there is wind · there is a thunderstorm",
 "# always « il »: nobody is doing the weather!"])
board('futur', "Le futur proche", [
 "<s>je</s> <v>vais</v> <e>manger</e>", "# I am going to eat",
 "<s>tu</s> <v>vas</v> <e>rester</e>", "+<s>il</s> <v>va</v> <e>attendre</e>",
 "<s>nous</s> <v>allons</v> <e>partir</e>", "+<s>ils</s> <v>vont</v> <e>revenir</e>",
 "<y>aller</y> + <e>INFINITIF</e>", "# only aller changes: the 2nd verb stays as it is",
 "<s>je</s> <w>ne</w> <v>vais</v> <w>pas</w> <e>manger</e>", "# the negative wraps around aller"])
board('imper', "L'impératif  ·  orders", [
 "<s>tu</s> regardes = <v>Regarde</v> !", "# drop « tu »  and the S of -er verbs",
 "<s>tu</s> restes = <v>Reste</v> !", "+<s>tu</s> écoutes = <v>Écoute</v> !",
 "<s>nous</s> regardons = <v>Regardons</v> !", "# let's look",
 "<s>vous</s> regardez = <v>Regardez</v> !", "# polite / several people",
 "<w>Ne</w> <v>bouge</v> <w>pas</w> !", "+<w>Ne</w> <v>bougez</v> <w>pas</w> !", "# negative: ne + imperative + pas"])
board('chaos', "Chaos !  (Ian Malcolm)", [
 "<v>Viens</v> ! · <v>Cours</v> !", "# these keep their S: not -er verbs",
 "<v>Va</v> !  ·  <v>Allons-y</v> !", "# aller: tu vas = Va ! (S dropped) · let's go!",
 "<v>Sois</v> calme !  ·  <v>Soyez</v> calmes !", "# être: pure chaos again"])
board('ilfaut', "Il faut + infinitif", [
 "<w>Il faut</w> <e>courir</e>", "# we must run · you have to run",
 "<w>Il faut</w> <e>attendre</e>", "+<w>Il faut</w> <e>rester</e>",
 "<w>Il ne faut pas</w> <e>bouger</e>", "# you must not move",
 "# il faut never changes: no je, no tu"])
board('avoir', "Les sensations  ·  avoir !", [
 "<s>j'</s><v>ai</v> <e>froid</e>", "+<s>j'</s><v>ai</v> <e>chaud</e>", "# I am cold · I am hot", "# English: I AM cold. French: I HAVE cold!",
 "<s>j'</s><v>ai</v> <e>faim</e>", "+<s>j'</s><v>ai</v> <e>soif</e>", "# I am hungry · I am thirsty",
 "<s>j'</s><v>ai</v> <e>peur</e>", "# I am afraid"])
board('demain', "Demain  ·  ce soir", [
 "<y>Demain</y>, <s>nous</s> <v>allons</v> <e>quitter</e> l'île", "# tomorrow we are going to leave",
 "<y>Ce soir</y>, <s>je</s> <v>vais</v> <e>manger</e>", "# tonight I am going to eat",
 "<y>Demain</y>, <s>il</s> <w>ne</w> <v>va</v> <w>pas</w> <e>pleuvoir</e>", "# tomorrow it is not going to rain",
 "<s>Tu</s> <v>vas</v> <e>revenir</e> ?", "# are you going to come back?"])
board('rev1', "RÉVISION A1  ·  (1)", [
 "<s>je</s> <v>suis</v> · <s>tu</s> <v>es</v> · <s>il</s> <v>est</v>", "# ep. 1 · être · no article before a job",
 "<s>j'</s><v>ai</v> · <s>tu</s> <v>as</v> · <s>il</s> <v>a</v>", "# ep. 2 · avoir",
 "<m>le</m> / <f>la</f> / l' = les · un / une = des", "+il y a un dinosaure · il y a trois œufs",
 "grand <e>+e</e> · <e>+s</e> · <e>+es</e>", "# ep. 3 · agreement",
 "<w>c'est</w> un dinosaure · <w>il est</w> grand"])
board('rev2', "RÉVISION A1  ·  (2)", [
 "<s>je</s> mang<e>e</e> · <s>tu</s> mang<e>es</e>", "+<s>nous</s> mang<e>eons</e> · <s>ils</s> mang<e>ent</e>", "# ep. 4 · -er verbs",
 "<w>ne</w> mange <w>pas</w> de viande", "# ne + verbe + pas · pas de",
 "<w>Est-ce que</w> tu aimes l'île ?", "# three ways to ask",
 "aller · faire · venir · prendre", "# ep. 5 · au · aux · du · des · devant · derrière",
 "<v>je vais</v> + inf. · <v>Reste</v> ! · <w>Il faut</w> + inf. · <v>J'ai</v> froid", "# ep. 6"])
board('resume6', "RÉSUMÉ  ·  Épisode 6", [
 "<s>je</s> <v>vais</v> <e>partir</e>", "# aller + infinitive = near future",
 "<s>tu</s> regardes = <v>Regarde</v> !", "# imperative: no pronoun, no S",
 "<w>Ne</w> <v>bouge</v> <w>pas</w> !", "# negative orders",
 "<w>Il faut</w> <e>courir</e>", "# you must · we must",
 "<s>j'</s><v>ai</v> froid · faim · soif · peur", "# avoir, not être",
 "<w>il fait</w> beau · <w>il</w> pleut · il y a du vent"])
board('resume7', "10 mots clés", [
 "<y>la tempête</y> = the storm", "+<y>l'orage</y> = the thunderstorm",
 "<y>la pluie</y> = the rain", "+<y>le vent</y> = the wind",
 "<y>l'électricité</y> = electricity", "+<y>marcher</y> = to work (machine)",
 "<y>bouger</y> = to move", "+<y>rester</y> = to stay",
 "<y>attendre</y> = to wait", "+<y>demain</y> = tomorrow"])

# ---------------------------------------------------------------- intro + rappel
chapter("Bienvenue !", ['ellie', 'ashok'], bg='storm1')
explain('ellie', "[[storm1]]Bonjour, Ashok! This is the last episode of A1, so today is special. Clouds are coming over the island. Today: the weather, what we are going to do, and orders in an emergency. "
 "[[storm2]]At the end, we review all of A1. But first, the «Rappel» of episode five.")
chapter("Rappel · Épisode 5", ['ellie'], bg='storm2')
explain('ellie', "Look at the board. "
 "[[+]]The verb «aller», to go: «je vais, tu vas, il va, nous allons, vous allez, ils vont.»² "
 "[[+]]The contractions: «à» plus «le» makes «au». «Je vais au restaurant.»² «À» plus «les» makes «aux». «De» plus «le» makes «du»: «le laboratoire est à côté du restaurant.»² "
 "[[+]]Where you come from: «Je viens d'Inde.»² "
 "[[+]]The time: «Il est trois heures et demie.»² "
 "[[+]]And the position words: «devant, derrière, dans, sur, sous.»² Now three quick questions.", board='rappel5')
atoi("Say: I am going to the restaurant.", "Je vais au restaurant.", img='storm2')
atoi("Say: I come from India.", "Je viens d'Inde.", img='clouds2')
atoi("Say: It is half past three.", "Il est trois heures et demie.", img='storm1')

# ---------------------------------------------------------------- scene 1
chapter("Scène 1 · L'orage arrive", ['hammond', 'ellie', 'ashok'], bg='storm1', id='s1')
fr('hammond', "[[storm1]]{Il fait mauvais|x|the weather is bad}, Ashok. {Il pleut|x|it is raining}.", "The weather is bad, Ashok. It is raining.")
fr('ellie', "[[rain]]Il y a {du vent|x|(some) wind}. Il y a un {orage|m|thunderstorm}.", "There is wind. There is a thunderstorm.")
fr('ashok', "[[clouds1]]Je suis de Kulithalai. {Là-bas|x|over there}, il fait chaud. {Ici|x|here}, il fait mauvais !", "I am from Kulithalai. Over there, it is hot. Here, the weather is bad!")
fr('ellie', "[[lightning]]Oui. Il va y avoir {une tempête|f|a storm}.", "Yes. There is going to be a storm.")
fr('hammond', "[[storm2]]Nous allons au centre des visiteurs. {Vite|x|quickly} !", "We are going to the visitor centre. Quickly!")

chapter("Pause ! · La météo", ['ellie'])
explain('ellie', "Pause! Weather, in French, is easy, because it always uses «il». Nobody is doing the weather. It is just «il». "
 "[[+]]First, the verb «faire», that Ian taught you. «Il fait beau.»² It is nice weather. «Il fait mauvais.»² It is bad weather. "
 "[[+]]«Il fait chaud.»² It is hot. «Il fait froid.»² It is cold. "
 "[[+]]Rain is a real verb: «il pleut.»² It rains, or it is raining. «La pluie» is the noun, the rain. "
 "[[+]]And with «il y a», there is: «Il y a du vent.»² There is wind. «Il y a un orage.»² There is a thunderstorm. Learn «du vent» as a block for now.", board='meteo')
atoi("Say: It is raining.", "Il pleut.", img='rain')
atoi("Say: The weather is bad.", "Il fait mauvais.", img='lightning')
replay('s1')

# ---------------------------------------------------------------- scene 2
chapter("Scène 2 · Plus d'électricité", ['malcolm', 'ellie', 'ashok'], bg='dark', id='s2')
fr('malcolm', "[[dark]]Oh, oh ! {L'électricité|f|electricity, power} ne {marche|x|works (machine)} pas !", "Oh, oh! The power is not working!")
fr('ellie', "Les ordinateurs ne marchent pas. La clôture ne marche pas {non plus|x|either}.", "The computers are not working. The fence is not working either.")
fr('ashok', "[[night]]Qu'est-ce que {nous allons|x|we are going to} faire ?", "What are we going to do?")
fr('malcolm', "[[dark]]Moi, je vais {attendre|x|to wait} ici. Je ne vais pas courir !", "Me, I am going to wait here. I am not going to run!")
fr('ellie', "[[lightning]]Ashok, tu vas rester avec Alan. Je vais chercher une lampe.", "Ashok, you are going to stay with Alan. I am going to look for a lamp.")
fr('ashok', "[[night]]{D'accord|x|OK, agreed}. Je ne vais pas {bouger|x|to move}. Je n'ai pas peur ! Euh... {un peu|x|a little} peur.", "OK. I am not going to move. I am not scared! Er... a little scared.")

chapter("Pause ! · Le futur proche", ['ellie'])
explain('ellie', "Pause! Ashok asked: «Qu'est-ce que nous allons faire?»² What are we going to do? This is the near future. It works exactly like English: I am going to eat. You know «aller», so you know the formula. "
 "[[+]]«Je vais manger.»² The first verb is «aller», conjugated. The second verb stays in the infinitive. "
 "[[+]]«Tu vas rester.»² «Il va attendre.»² You change «aller», and only «aller». "
 "[[+]]«Nous allons partir.»² «Ils vont revenir.»² "
 "[[+]]So the formula is: «aller», plus the infinitive. Never conjugate both verbs. "
 "[[+]]And the negative wraps around «aller», like brackets: «Je ne vais pas manger.»² And before a vowel, «ne» becomes «n'»: «Nous n'allons pas partir.»² Good.", board='futur')
atoi("Say: I am going to wait.", "Je vais attendre.", img='dark')
atoi("Say: What are we going to do?", "Qu'est-ce que nous allons faire ?", img='night')
atoi("Say: Tomorrow, the weather is going to be nice.", "Demain, il va faire beau.", img='sunrise1')
replay('s2')

# ---------------------------------------------------------------- scene 3
chapter("Scène 3 · Cachés avec Alan", ['alan', 'ashok', 'malcolm'], bg='roots1', id='s3')
fr('alan', "[[roots1]]{Ne bouge pas|x|don't move} ! {Reste|x|stay} derrière moi !", "Don't move! Stay behind me!")
fr('ashok', "[[roots2]]Je suis froid ! Et j'ai faim.", "I am cold (wrong!) And I am hungry.")
fr('alan', "[[jungle_n]]Non, non. On dit : j'ai froid. Tu as froid, tu as faim.", "No, no. We say: I have cold. You have cold, you have hunger.")
fr('ashok', "Ah oui ! J'ai froid. J'ai {faim|f|hunger}. Et j'ai {soif|f|thirst}.", "Ah yes! I am cold. I am hungry. And I am thirsty.")
fr('malcolm', "[[dark]]Moi aussi, j'ai soif. Mais {il faut|x|we have to} attendre.", "Me too, I am thirsty. But we have to wait.")
fr('alan', "[[roots1]]{Chut|x|shh} ! {Écoute|x|listen} !", "Shh! Listen!")
fr('ashok', "Qu'est-ce que c'est ?", "What is it?")
fr('alan', "[[roots2]]C'est le vent, Ashok. Il n'y a pas de dinosaure. Reste ici, sous l'arbre.", "It is the wind, Ashok. There is no dinosaur. Stay here, under the tree.")

chapter("Pause ! · L'impératif", ['ellie'])
explain('ellie', "Pause! Alan gave orders: «Ne bouge pas!»² «Reste derrière moi!»² «Écoute!»² This is the imperative. The formula is simple: take the «tu» form of the verb, and remove the pronoun. "
 "[[+]]«Tu regardes» becomes «Regarde!»² The pronoun «tu» disappears. And look closely: «regardes» has an S, but «Regarde!» has none. The rule: with -er verbs, the S of the «tu» form is dropped. "
 "[[+]]«Tu restes», «Reste!»² «Tu écoutes», «Écoute!»² "
 "[[+]]For «nous», it means «let's»: «Regardons!»² Let's look. "
 "[[+]]For «vous», you give a polite order, or you speak to several people: «Regardez!»² «Écoutez!»² «Restez ici!»² "
 "[[+]]And the negative order. Wrap the verb in brackets: «ne», plus the imperative, plus «pas». «Ne bouge pas!»² «Ne bougez pas!»² «N'écoute pas!»² ", board='imper')
atoi("Say: Don't move!", "Ne bouge pas !", img='roots1')
atoi("Say: Look! To several people.", "Regardez !", img='jungle_n')

chapter("Pause ! · Le chaos des ordres", ['malcolm'])
explain('malcolm', "Ian Malcolm here. Of course there are exceptions, Ashok. Chaos never sleeps. "
 "[[+]]First: only the -er verbs lose their S. «Viens!»² «Cours!»² Come! Run! These verbs keep their S, because they are not -er verbs. "
 "[[+]]And «aller» looks like an -er verb, but it is irregular, so it is chaos too. «Tu vas» becomes «Va!»² Go! Without the S. And «Allons-y!»² Let's go! Learn it as one word. "
 "[[+]]And «être», of course, is wild: «Sois calme!»² Be calm. «Soyez calmes!»² Nothing like «tu es». "
 "Now repeat, with energy: «Viens! Cours! Allons-y!»²", board='chaos')
atoi("Say: Come here!", "Viens ici !", img='roots2')
atoi("Say: Let's go!", "Allons-y !", img='jungle_n')

chapter("Pause ! · Il faut", ['ellie'])
explain('ellie', "Pause! Malcolm said: «Il faut attendre.»² We have to wait. «Il faut» means: it is necessary, you must, we must. "
 "[[+]]It is followed by an infinitive. «Il faut courir.»² We have to run. "
 "[[+]]«Il faut attendre.»² «Il faut rester.»² "
 "[[+]]And the negative: «Il ne faut pas bouger.»² You must not move. «Il ne faut pas courir.»² "
 "It is a block: «il faut» never changes. No «je», no «tu». Very practical.", board='ilfaut')
atoi("Say: We have to run.", "Il faut courir.", img='dark')

chapter("Pause ! · J'ai froid", ['malcolm'])
explain('malcolm', "Malcolm again, with Ashok's mistake. He said: «Je suis froid.» In English you say: I AM cold. A French person hears: I am a cold object, like an ice cube. Not good. "
 "[[+]]In French, feelings use «avoir», to have. You do not «are» cold, you «have» cold. «J'ai froid.»² «J'ai chaud.»² "
 "[[+]]«J'ai faim.»² I have hunger, so I am hungry. «J'ai soif.»² I am thirsty. "
 "[[+]]And you already know: «J'ai peur.»² I am afraid. And «Tu as peur?»² "
 "Say it: «J'ai froid, j'ai faim, j'ai soif, j'ai peur.»² "
 "So «Il fait froid» is the weather, and «J'ai froid» is you.", board='avoir')
atoi("Say: I am cold.", "J'ai froid.", img='roots2')
atoi("Say: I am hungry.", "J'ai faim.", img='roots1')
replay('s3')

# ---------------------------------------------------------------- scene 4
chapter("Scène 4 · Le lendemain", ['hammond', 'ellie', 'ashok'], bg='sunrise1', id='s4')
fr('hammond', "[[sunrise1]]{Bonjour|x|good morning}, Ashok ! {Il fait beau|x|the weather is nice} !", "Good morning, Ashok! The weather is nice!")
fr('ellie', "[[sunrise2]]Il ne pleut pas. Il n'y a pas de vent. C'est {la fin|f|the end} de la tempête.", "It is not raining. There is no wind. It is the end of the storm.")
fr('ashok', "J'ai faim ! Je vais manger un sandwich.", "I am hungry! I am going to eat a sandwich.")
fr('hammond', "{Demain|x|tomorrow}, nous allons quitter l'île.", "Tomorrow, we are going to leave the island.")
fr('ashok', "[[sunrise3]]Je suis {ingénieur informatique|x|IT engineer}. J'habite à Genk, en Belgique. Je suis fatigué, mais content !", "I am an IT engineer. I live in Genk, in Belgium. I am tired, but happy!")
fr('hammond', "[[sunrise1]]Tu vas revenir, Ashok ? Il y a un {nouveau|x|new} parc, très loin d'ici.", "Are you going to come back, Ashok? There is a new park, very far from here.")
fr('ashok', "[[sunrise2]]Un nouveau parc ? Avec des raptors ? Euh... j'ai un peu peur !", "A new park? With raptors? Er... I am a little scared!")

chapter("Pause ! · Demain", ['ellie'])
explain('ellie', "Pause! A short one. In the scene, Mr Hammond said it. The near future loves time words. "
 "[[+]]«Demain, nous allons quitter l'île.»² Tomorrow, we are going to leave the island. «Demain» means tomorrow. "
 "[[+]]«Ce soir» means tonight. «Ce soir, je vais manger.»² Tonight I am going to eat. "
 "[[+]]The negative works the same way: «Demain, il ne va pas pleuvoir.»² Tomorrow it is not going to rain. "
 "[[+]]And a question for you: «Tu vas revenir?»² Are you going to come back? Very simple: the verb «aller», plus the infinitive «revenir».", board='demain')
atoi("Say: We are going to leave the island.", "Nous allons quitter l'île.", img='sunrise2')
atoi("Say: I am going to come back.", "Je vais revenir.", img='sunrise3')
replay('s4')

# ---------------------------------------------------------------- A1 review
chapter("Révision A1", ['ellie', 'alan', 'malcolm'], bg='sunrise3')
explain('ellie', "Ashok, you have finished the six episodes of A1. This is the review of everything. "
 "[[+]]Episode one: the verb «être», «je suis, tu es, il est». We say a job with no article: «Je suis ingénieur.»² "
 "[[+]]Episode two: «avoir», «j'ai, tu as, il a». "
 "[[+]]The articles «le, la, les, un, une, des.» And «il y a». «Il y a trois œufs.»² "
 "[[+]]Episode three: agreement. A feminine adjective adds an E, plural adds an S. «La plante est verte.»² "
 "[[+]]And «c'est» for a noun, «il est» for an adjective.", board='rev1')
explain('ellie', "Second board. "
 "[[+]]Episode four: the -er verbs. «Je mange, tu manges, il mange, nous mangeons, vous mangez, ils mangent.»² "
 "[[+]]The negative: «ne», plus the verb, plus «pas». «Je ne mange pas de viande.»² "
 "[[+]]And questions: «Est-ce que tu aimes l'île?»² "
 "[[+]]Episode five: «aller, faire, venir, prendre», «au, aux, du, des», and the position words. "
 "[[+]]And today: «je vais», plus an infinitive. «Reste!» «Il faut courir.» «J'ai froid.» Now ten review questions.", board='rev2')
atoi("Say: I am from Kulithalai.", "Je suis de Kulithalai.", img='kauai1')
atoi("Say: I have a hat.", "J'ai un chapeau.", img='jackets')
atoi("Say: There are three eggs.", "Il y a trois œufs.", img='egg')
atoi("Say: The plant is green.", "La plante est verte.", img='ferns')
atoi("Say: I do not eat meat.", "Je ne mange pas de viande.", img='trice')
atoi("Say: Do you like the island?", "Est-ce que tu aimes l'île ?", img='napali')
atoi("Say: We are going to the restaurant.", "Nous allons au restaurant.", img='hall1')
atoi("Say: The lab is next to the restaurant.", "Le laboratoire est à côté du restaurant.", img='lab')
atoi("Say: It is half past three.", "Il est trois heures et demie.", img='brachio_hall')
atoi("Say: I live in Belgium.", "J'habite en Belgique.", img='jungle1')

# ---------------------------------------------------------------- résumé
chapter("Résumé", ['ellie'], bg='sunrise2')
explain('ellie', "Résumé of episode six. "
 "[[+]]The near future: «je vais», plus the infinitive. «Je vais partir.»² "
 "[[+]]The imperative: no pronoun, and no S for -er verbs. «Regarde!»² "
 "[[+]]Negative orders: «Ne bouge pas!»² "
 "[[+]]«Il faut», plus the infinitive: «Il faut courir.»² "
 "[[+]]Feelings with «avoir»: «J'ai froid, faim, soif, peur.»² "
 "[[+]]And the weather: «il fait beau», «il pleut», «il y a du vent.»²", board='resume6')
explain('ellie', "And ten key words. "
 "[[+]]«La tempête», the storm. «L'orage», the thunderstorm. [[+]]«La pluie», the rain. «Le vent», the wind. [[+]]«L'électricité», electricity. «Marcher», to work, for a machine. "
 "[[+]]«Bouger», to move. «Rester», to stay. [[+]]«Attendre», to wait. «Demain», tomorrow.", board='resume7')

chapter("À bientôt !", ['hammond', 'ashok', 'ellie'], bg='sunrise3')
fr('hammond', "[[sunrise3]]Bravo, Ashok ! Tu es très bon !", "Bravo, Ashok! You are very good!")
fr('ashok', "Merci ! Je suis content. Je vais revenir !", "Thank you! I am happy. I am going to come back!")
explain('ellie', "[[heli_land]]Congratulations, Ashok! You can now speak, in simple French, about yourself, about things, about actions and about the future. [[kauai1]]Next time we start A2 in the new park. You will meet Claire, who runs the schedule, and you will learn the French daily routine. Until then, say «je vais, tu vas, il va» ten times a day. À bientôt!")
