# Episode 3 · Grand ou petit ? (A1).  Markup: see jurassic-serie/dsl.py
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
from dsl import *

meta(num=3, title="Grand ou petit ?", level='A1', slug='grand-ou-petit', rate='-25%',
     goal="grand · grande · grands · grandes  ·  c'est un… / il est…  ·  20 → 100")

# ---------------------------------------------------------------- boards
board('rappel', "RAPPEL  ·  Épisode 2", [
 "<s>j'</s><v>ai</v> · <s>tu</s> <v>as</v> · <s>il/elle</s> <v>a</v>", "+<s>nous</s> <v>avons</v> · <s>vous</s> <v>avez</v> · <s>ils/elles</s> <v>ont</v>",
 "<m>le dinosaure</m> · <f>la queue</f>", "+<w>un / une = a</w>  ·  <w>le / la = the</w>",
 "<w>un / une = des</w>", "+<w>le / la = les</w>", "# l' before a vowel: l'œuf, l'île",
 "<y>il y a</y> = there is / there are", "# j'ai trente ans · j'ai peur"])
board('accord', "L'accord  ·  agreement", [
 "<m>le dinosaure</m> est <m>grand</m>", "<f>la plante</f> est <f>grande</f><e>+e</e>", "# feminine = + e",
 "<m>les dinosaures</m> sont <m>grands</m><e>+s</e>", "# plural = + s",
 "<f>les plantes</f> sont <f>grandes</f><e>+es</e>", "# feminine plural = + es",
 "<m>grand</m> · <f>grande</f> · <m>grands</m> · <f>grandes</f>", "# all four: the adjective copies the noun"])
board('couleurs', "Les couleurs", [
 "<m>vert</m> = <f>verte</f>", "+<m>bleu</m> = <f>bleue</f>",
 "<m>noir</m> = <f>noire</f>", "+<m>gris</m> = <f>grise</f>",
 "<w>rouge · jaune · orange</w>", "# end in -e: same for both",
 "<m>blanc</m> = <f>blanche</f>", "# chaos! see next board",
 "<y>marron</y>", "# never changes: la plante marron, les œufs marron"])
board('chaos', "Chaos !  (Ian Malcolm)", [
 "<m>sérieux</m> = <f>sérieuse</f>", "# -eux = -euse",
 "<m>sportif</m> = <f>sportive</f>", "# -if = -ive",
 "<m>indien</m> = <f>indienne</f>", "+<m>italien</m> = <f>italienne</f>", "# -ien = -ienne",
 "<m>blanc</m> = <f>blanche</f>", "+<m>vieux</m> = <f>vieille</f>", "+<m>beau</m> = <f>belle</f>",
 "# few, but common: learn them by heart"])
board('bags', "Où mettre l'adjectif ?", [
 "<w>une plante</w> <f>verte</f>", "+<w>un dinosaure</w> <m>dangereux</m>", "# most adjectives: AFTER the noun",
 "<y>BAGS</y>  =  Beauty · Age · Goodness · Size", "# these come BEFORE the noun",
 "<w>beau · jeune · vieux · bon · mauvais · petit · grand · joli</w>", "+un <m>grand</m> dinosaure", "+une <f>petite</f> tête", "+un <m>vieux</m> chapeau", "+une <f>jolie</f> fougère",
 "<y>colour after · size before</y>"])
board('cest', "c'est  ou  il est ?", [
 "<y>c'est</y> + <w>un / une</w> + <w>nom</w>", "# c'est un dinosaure · c'est une plante",
 "<y>c'est</y> un <m>grand</m> dinosaure", "# article + noun: c'est",
 "<s>il / elle</s> <v>est</v> + <e>adjectif</e>", "# il est grand · elle est contente",
 "<s>il / elle</s> <v>est</v> + <e>métier</e>", "# il est paléontologue (no article!)",
 "<y>c'est</y> Ian · <y>c'est</y> moi", "# c'est + a name"])
board('nombres1', "Les nombres  ·  20 → 69", [
 "<y>20 vingt</y> · <y>30 trente</y>", "<y>40 quarante</y> · <y>50 cinquante</y>", "<y>60 soixante</y>",
 "vingt-<e>deux</e> · trente-<e>cinq</e> · quarante-<e>huit</e>", "# tens + hyphen + unit",
 "vingt <e>et</e> un · trente <e>et</e> un · soixante <e>et</e> un", "# 21, 31, 41…: « et un »  (not 22, 23!)"])
board('nombres2', "70 · 80 · 90 · 100", [
 "<y>70</y> soixante-dix", "+<w>= 60 + 10</w>",
 "<y>80</y> quatre-vingts", "+<w>= 4 × 20</w>",
 "<y>90</y> quatre-vingt-dix", "+<w>= 4 × 20 + 10</w>", "+<y>99</y> quatre-vingt-dix-neuf",
 "<y>100</y> cent",
 "<y>En Belgique :</y> <e>septante</e> · <w>quatre-vingts</w> · <e>nonante</e>", "+<e>septante-cinq</e> · <e>nonante-neuf</e>", "# 70 and 90 are simple here!"])
board('resume1', "RÉSUMÉ  ·  Épisode 3", [
 "<m>grand</m> · <f>grande</f><e>+e</e> · <m>grands</m><e>+s</e> · <f>grandes</f><e>+es</e>",
 "<m>sérieux</m> = <f>sérieuse</f>  ·  <m>blanc</m> = <f>blanche</f>  ·  <m>vieux</m> = <f>vieille</f>",
 "<w>une plante verte</w>  ·  <y>BAGS</y> avant: <w>un grand dinosaure</w>",
 "<y>c'est</y> un dinosaure  ·  <s>il</s> <v>est</v> grand  ·  <s>il</s> <v>est</v> paléontologue",
 "<y>20 vingt · 30 trente · 40 quarante · 50 cinquante · 60 soixante</y>",
 "+<y>70 soixante-dix / septante · 90 quatre-vingt-dix / nonante</y>"])
board('resume2', "10 mots clés", [
 "<y>grand(e)</y> = big", "+<y>petit(e)</y> = small",
 "<y>vert(e)</y> = green", "+<y>rouge</y> = red",
 "<y>vieux / vieille</y> = old", "+<y>jeune</y> = young",
 "<y>drôle</y> = funny", "+<y>sérieux</y> = serious",
 "<y>le mètre</y> = metre", "+<y>cent</y> = 100"])

# ---------------------------------------------------------------- intro
chapter("Bienvenue !", ['ellie'], bg='trex')
explain('ellie', "[[trex]]Bonjour, Ashok! Ellie here. Today we learn to describe things: big, small, green, old, funny. Dinosaurs, plants, and people. "
 "[[raptor]]And we count up to one hundred. In Belgium, where you live, there are two special numbers that make life easier. But first, a quick review of last time.")

chapter("Rappel · Épisode 2", ['ellie', 'ashok'], bg='brachio')
explain('ellie', "[[brachio]]Review time! Ashok, you will help me. "
 "[[+]]The verb «avoir», to have: «j'ai, tu as, il a, nous avons, vous avez, ils ont.»² "
 "[[+]]Every noun is masculine or feminine, so we learn it with its article: «le dinosaure»², «la queue»². "
 "[[+]]Plural: «un» and «une» become «des». «Le» and «la» become «les». «Des dinosaures.»² «Les dinosaures.»² "
 "[[+]]«Il y a» means: there is, or there are. «Il y a un dinosaure.»² «Il y a trois œufs.»² And age uses «avoir»: «j'ai trente ans.»² «J'ai peur.»² Easy. Two quick questions, Ashok.", board='rappel')
atoi("Say: I have a hat.", "J'ai un chapeau.", img='hall1')
atoi("Say: There are three eggs.", "Il y a trois œufs.", img='egg')

# ---------------------------------------------------------------- scene 1
chapter("Scène 1 · Sur la colline", ['alan', 'malcolm', 'ashok'], bg='trex', id='s1')
fr('alan', "[[trex]]Regarde, Ashok ! {Le tyrannosaure|m|the tyrannosaurus} est {grand|x|big, tall}. Il est très {fort|x|strong}.", "Look, Ashok! The tyrannosaurus is big. He is very strong.")
fr('ashok', "Oui ! Il est grand ! Moi, je suis {petit|x|small, short}.", "Yes! He is big! Me, I am small.")
fr('malcolm', "[[raptor]]Et {le vélociraptor|m|the velociraptor} ? Il est petit, {mais|x|but} il est très {dangereux|x|dangerous}.", "And the velociraptor? He is small, but he is very dangerous.")
fr('ashok', "[[brachio]]Les dinosaures {sont|x|are} grands et petits. Et la dinosaure est {gentil|x|kind, nice}.", "The dinosaurs are big and small. And the dinosaur is kind.")
fr('alan', "[[trice]]Non, Ashok. {Le dinosaure|m|the dinosaur} est masculin. Le dinosaure est gentil. Le tricératops est gentil, et il est gris.", "No, Ashok. «Dinosaure» is masculine. The dinosaur is kind. The triceratops is kind, and it is grey.")
fr('ashok', "[[stego]]Ah oui. Le dinosaure est gentil. Merci, Alan !", "Ah yes. The dinosaur is kind. Thank you, Alan!")

chapter("Pause ! · L'accord", ['ellie'])
explain('ellie', "Pause! Did you hear the little correction? Ashok said «la dinosaure», but «dinosaure» is masculine: «le dinosaure». That is why we always learn the article with the noun. And now the main rule of today: adjectives. An adjective describes a noun: big, small, green. In French, the adjective copies the noun. If the noun is feminine, the adjective changes. If the noun is plural, the adjective changes. This is called agreement. "
 "[[+]]Start with the masculine singular: «Le dinosaure est grand.»² That is the form you find in a dictionary. "
 "[[+]]Now a feminine noun. Add an E. «La plante est grande.»² The formula: adjective, plus E. Listen: «grand», the d is silent. «Grande», now you hear the d. Many adjectives work like that: the final consonant wakes up. "
 "[[+]]Now the plural, masculine: add an S. «Les dinosaures sont grands.»² The S is silent: you can't hear it, you only see it. «Grand» and «grands» sound exactly the same. "
 "[[+]]And the feminine plural: E and S together, «es». «Les plantes sont grandes.»² «Les feuilles sont grandes.»² "
 "[[+]]So the adjective has four forms: «grand, grande, grands, grandes.»² Two sounds, four spellings. Same for «petit, petite», «content, contente»: adjectives ending in E, like «jeune» and «drôle», never change in the feminine.", board='accord')
atoi("Say: The dinosaur is big.", "Le dinosaure est grand.", img='trex')
atoi("Say: Ellie is happy.", "Ellie est contente.", img='ferns2')
atoi("Say: The dinosaurs are small.", "Les dinosaures sont petits.", img='raptor')
replay('s1')

# ---------------------------------------------------------------- scene 2
chapter("Scène 2 · Les plantes vertes", ['ellie', 'alan', 'ashok'], bg='ferns', id='s2')
fr('ellie', "[[ferns]]Regarde, Ashok ! {La fougère|f|the fern} est {verte|x|green}. {C'est|x|this is, it is} une {plante|f|plant} très {vieille|x|old}.", "Look, Ashok! The fern is green. It is a very old plant.")
fr('ashok', "La plante est vert ?", "The plant is green?")
fr('ellie', "[[ferns2]]Presque, Ashok ! La plante est {verte|x|green}. Plante, c'est féminin : alors, verte.", "Almost, Ashok! The plant is green. «Plante» is feminine: so, «verte».")
fr('ashok', "[[canopy]]Ah oui ! La plante est verte. Et les {feuilles|f|the leaves} sont vertes aussi !", "Ah yes! The plant is green. And the leaves are green too!")
fr('alan', "[[bromeliad]]Oui. Les feuilles sont vertes et {belles|x|beautiful}. La plante est grande, mais la feuille est petite.", "Yes. The leaves are green and beautiful. The plant is big, but the leaf is small.")

chapter("Pause ! · Les couleurs", ['ellie'])
explain('ellie', "Pause! Colours are adjectives too, so they agree. "
 "[[+]]«Vert», green: «le dinosaure est vert»², «la plante est verte»². «Bleu», blue: «bleu, bleue.»² "
 "[[+]]«Noir», black: «noir, noire.»² «Gris», grey: «gris, grise.»² «Il est gris. Elle est grise.»² "
 "[[+]]«Rouge», red, «jaune», yellow, and «orange», orange, end in E already. They don't change. «Le chapeau est rouge.»² «La plante est rouge.»² "
 "[[+]]«Blanc», white, becomes «blanche». «Le dinosaure est blanc.»² «La plante est blanche.»² Ian will explain this one in a minute. "
 "[[+]]And one colour never changes at all: «marron», brown. «Les œufs sont marron.»² Good.", board='couleurs')
explain('malcolm', "Ian Malcolm. Ellie gave you the neat rule: plus E. I am here for the exceptions, as always. Some adjectives refuse to add just an E. They change their ending. There are only a few groups, so let's tame the chaos. "
 "[[+]]Adjectives in «-eux» become «-euse». «Sérieux, sérieuse.»² «Il est sérieux.»² «Elle est sérieuse.»² Same for «dangereux, dangereuse.»² "
 "[[+]]Adjectives in «-if» become «-ive». «Sportif, sportive.»² «Il est sportif.»² «Elle est sportive.»² "
 "[[+]]Adjectives in «-ien» become «-ienne». You know this one from episode one: «indien, indienne.»² And «italien, italienne.»² "
 "[[+]]And three famous individuals. «Blanc» becomes «blanche»: «blanc, blanche.»² «Vieux» becomes «vieille»: «vieux, vieille.»² «Beau», beautiful, becomes «belle»: «beau, belle.»² "
 "That is the whole list. Few groups, but very common words. Learn them like songs.", board='chaos')
explain('alan', "Alan here. Where does the adjective go? In English it is always before the noun: a green plant. In French, most adjectives go after the noun. "
 "[[+]]«Une plante verte.»² «Un dinosaure dangereux.»² The colour comes second. "
 "[[+]]But a short group of very common adjectives comes before the noun. Remember the word BAGS: Beauty, Age, Goodness, Size. "
 "[[+]]Beauty: «beau, joli.» Age: «jeune, vieux, nouveau.» Goodness: «bon, mauvais.» Size: «grand, petit.» So: «un grand dinosaure.»² «Une petite tête.»² «Un vieux chapeau.»² «Une jolie fougère.»² "
 "[[+]]To sum up: «une plante verte», but «une grande plante». Colour after, size before. When in doubt, put it after.", board='bags')
atoi("Say: The plant is green.", "La plante est verte.", img='jungle2')
atoi("Say: It's a small dinosaur.", "C'est un petit dinosaure.", img='raptor')
atoi("Say: The eggs are white.", "Les œufs sont blancs.", img='egg')
atoi("Say: The leaves are green.", "Les feuilles sont vertes.", img='forest')
replay('s2')

# ---------------------------------------------------------------- scene 3
chapter("Scène 3 · Les nombres de Hammond", ['hammond', 'malcolm', 'ashok'], bg='hall1', id='s3')
fr('hammond', "[[hall1]]Bienvenue dans le hall, Ashok ! {Le brachiosaure|m|the brachiosaurus} {mesure|x|measures, is ... tall} {vingt-cinq|x|twenty-five} {mètres|m|metres} !", "Welcome to the hall, Ashok! The brachiosaurus is twenty-five metres tall!")
fr('ashok', "Vingt-cinq mètres ! C'est grand !", "Twenty-five metres! It is big!")
fr('hammond', "[[hall2]]Le tyrannosaure mesure douze mètres. {Il y a|x|there is, there are} quarante dinosaures sur l'île, et {soixante|x|sixty} œufs.", "The tyrannosaurus is twelve metres tall. There are forty dinosaurs on the island, and sixty eggs.")
fr('ashok', "[[hall2]]Moi, j'ai trente-cinq ans. Et je mesure un mètre soixante-quinze !", "Me, I am thirty-five years old. And I am one metre seventy-five tall!")
fr('malcolm', "[[hall3]]Soixante-quinze ? Soixante, plus quinze ! {Soixante-dix|x|seventy}, {quatre-vingts|x|eighty}, {quatre-vingt-dix|x|ninety}... Quel chaos !", "Seventy-five? Sixty, plus fifteen! Seventy, eighty, ninety... What chaos!")
fr('hammond', "[[wall]]Ah, mais en Belgique, c'est {septante|x|seventy (Belgium)} et {nonante|x|ninety (Belgium)}. C'est {facile|x|easy} ! Cent, cent dinosaures !", "Ah, but in Belgium, it is septante and nonante. It is easy! One hundred, one hundred dinosaurs!")

chapter("Pause ! · Les nombres", ['ellie'])
explain('ellie', "Pause! Last episode: zero to twenty. Today: twenty to one hundred. Good news, the system is regular for a while. "
 "[[+]]The tens: «vingt»², twenty. «Trente»², thirty. [[+]]«Quarante»², forty. «Cinquante»², fifty. [[+]]«Soixante»², sixty. "
 "[[+]]For the numbers in between, tens, hyphen, unit. «Vingt-deux.»² «Trente-cinq.»² «Quarante-huit.»² Easy. "
 "[[+]]One exception: with «un», you add «et», and no hyphen. «Vingt et un.»² «Trente et un.»² «Soixante et un.»² Only for 21, 31, 41, 51, 61. For two, three, four, always hyphens: «vingt-deux, vingt-trois.»² "
 "So: «Il mesure vingt-cinq mètres.»² «Il y a quarante dinosaures.»² And your age: «J'ai trente-cinq ans.»² «Mesure» is an expression: it measures.", board='nombres1')
explain('malcolm', "And now my favourite. French counting beyond sixty is chaos. Look at the board. "
 "[[+]]Seventy is «soixante-dix»²: sixty plus ten. Literally. "
 "[[+]]Eighty is «quatre-vingts»²: four twenties. Four times twenty. Yes. "
 "[[+]]Ninety is «quatre-vingt-dix»²: four twenties plus ten. «Quatre-vingt-dix-neuf»²: ninety-nine. Four twenties and nineteen. "
 "[[+]]One hundred: «cent»². Very simple, after all that. "
 "[[+]]Now, Ashok, here is something useful for you. In Belgium, they say «septante» for seventy and «nonante» for ninety. «Septante»², «nonante»². So «septante-cinq»² and «nonante-neuf»². Simple! Eighty stays «quatre-vingts». Learn both systems, and use «septante» and «nonante» in Genk.", board='nombres2')
atoi("Say: Seventy. First in France, then in Belgium.", "Soixante-dix. Septante.", img='hall3')
atoi("Say: Ninety-nine. In France.", "Quatre-vingt-dix-neuf.", img='wall')
atoi("Say: Ninety-nine. In Belgium.", "Nonante-neuf.", img='hall2')

# ---------------------------------------------------------------- scene 4
chapter("Scène 4 · Les amis", ['ellie', 'alan', 'ashok'], bg='path', id='s4')
fr('ellie', "[[path]]Ashok, {voici|x|here is} mes amis. {C'est|x|this is} Alan. Il est paléontologue. Il est {sérieux|x|serious}.", "Ashok, here are my friends. This is Alan. He is a palaeontologist. He is serious.")
fr('alan', "[[canopy]]C'est Ellie. Elle est {intelligente|x|intelligent}. Elle est aussi très {gentille|x|kind}.", "This is Ellie. She is intelligent. She is also very kind.")
fr('ashok', "[[jungle3]]Et Ian Malcolm? Il est {drôle|x|funny}. C'est un mathématicien drôle !", "And Ian Malcolm? He is funny. He is a funny mathematician!")
fr('ellie', "[[jungle1]]Oui ! Et toi, Ashok ? Tu es ingénieur. Tu es {sportif|x|sporty} ?", "Yes! And you, Ashok? You are an engineer. Are you sporty?")
fr('ashok', "[[canopy]]Moi ? Je suis ingénieur, et je suis {de Kulithalai|x|from Kulithalai}. J'habite à Genk. Je suis sportif, un peu !", "Me? I am an engineer, and I am from Kulithalai. I live in Genk. I am sporty, a little!")
fr('alan', "[[jungle2]]Et il est un grand fan des dinosaures. C'est un jeune paléontologue !", "And he is a big fan of dinosaurs. He is a young palaeontologist!")

chapter("Pause ! · C'est ou il est ?", ['ellie'])
explain('ellie', "Last Pause. A classic trap: «c'est» or «il est»? In English you always say «it is» or «he is». In French you must choose, and there is a simple formula. "
 "[[+]]After «c'est», you put an article and a noun: «un» or «une», plus the noun. «C'est un dinosaure.»² «C'est une plante.»² «C'est un mathématicien.»² «C'est» is also used with a name: «C'est Alan.»² «C'est moi.»² "
 "[[+]]With an adjective after the article, still «c'est»: «C'est un grand dinosaure.»² «C'est une petite plante.»² "
 "[[+]]Now «il est» or «elle est», with an adjective alone, no article. «Il est grand.»² «Elle est intelligente.»² Remember the agreement from earlier: «elle est contente.»² "
 "[[+]]And a job: «il est paléontologue.»² «Elle est ingénieur.»² No article, as in episode one. "
 "[[+]]The formula to carry away: article means «c'est»; no article means «il est» or «elle est». «C'est un dinosaure. Il est grand.»² «C'est une plante. Elle est verte.»²", board='cest')
atoi("Say: Ellie is intelligent.", "Ellie est intelligente.", img='canopy')
atoi("Say: He is a palaeontologist.", "Il est paléontologue.", img='jungle1')
atoi("Say: It is a big plant.", "C'est une grande plante.", img='ferns')

# ---------------------------------------------------------------- résumé
chapter("Résumé", ['ellie'], bg='trex')
explain('ellie', "Résumé! Everything on one board. "
 "[[+]]The adjective copies the noun: «grand, grande, grands, grandes.»² Feminine, plus E. Plural, plus S. "
 "[[+]]The exceptions: «sérieux, sérieuse», «blanc, blanche», «vieux, vieille.»² "
 "[[+]]Position: after the noun, «une plante verte», but BAGS before: «un grand dinosaure.»² "
 "[[+]]«C'est un dinosaure.»² «Il est grand.»² «Il est paléontologue.»² "
 "[[+]]And the numbers: «vingt, trente, quarante, cinquante, soixante.»² «Soixante-dix, quatre-vingts, quatre-vingt-dix, cent.»² In Belgium, «septante» and «nonante.»²", board='resume1')
explain('ellie', "Ten key words. "
 "[[+]]«Grand», big. «Petit», small. [[+]]«Vert», green. «Rouge», red. [[+]]«Vieux», old. «Jeune», young. "
 "[[+]]«Drôle», funny. «Sérieux», serious. [[+]]«Le mètre», the metre. «Cent», one hundred. Well done, Ashok!", board='resume2')

chapter("À bientôt !", ['hammond', 'ashok'], bg='hall1')
fr('hammond', "[[hall1]]Bravo, Ashok ! {Tu es|x|you are} très {fort|x|strong} ! À bientôt !", "Bravo, Ashok! You are very strong! See you soon!")
fr('ashok', "Merci, Monsieur Hammond ! À bientôt !", "Thank you, Mr Hammond! See you soon!")
explain('ellie', "[[trice]]Next episode: the visit! You will learn the regular verbs in «-er», to say what you do and what you don't do, and to ask questions. [[brachio]]Until then, say «grand, grande, grands, grandes», ten times a day. À bientôt!")
