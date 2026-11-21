# Episode 2 · Les dinosaures (A1).  Markup: see jurassic-serie/dsl.py
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
from dsl import *

meta(num=2, title="Les dinosaures", level='A1', slug='les-dinosaures', rate='-25%',
     goal="j'ai · tu as · il/elle a  ·  un/une/des  ·  le/la/l'/les  ·  il y a  ·  0 à 20")

# ---------------------------------------------------------------- boards
board('rappel', "RAPPEL  ·  Épisode 1", [
 "<s>je</s> <v>suis</v> · <s>tu</s> <v>es</v> · <s>il/elle</s> <v>est</v>", "+<s>nous</s> <v>sommes</v> · <s>vous</s> <v>êtes</v> · <s>ils</s> <v>sont</v>",
 "<s>je</s> <v>suis</v> <e>ingénieur</e>", "# a job: no article",
 "indien <e>+e</e> = indienne", "# feminine = masculine + e"])
board('avoir1', "AVOIR  ·  to have", [
 "<s>j'</s><v>ai</v>", "# I have  (je = j' before a vowel)",
 "<s>tu</s> <v>as</v>", "# you have (one friend)",
 "<s>il</s> <v>a</v>", "+<s>elle</s> <v>a</v>", "# he has · she has"])
board('genre', "Masculin ou féminin ?", [
 "<m>le dinosaure</m>", "+<f>la queue</f>", "# every noun is masculine or feminine",
 "<m>le cou · le chapeau</m>", "+<f>la tête · la patte</f>", "# learn the article WITH the noun",
 "<w>un</w> = <m>masculine</m>   <w>une</w> = <f>feminine</f>", "# <m>un cou</m> · <f>une tête</f>",
 "<f>-e</f> at the end: <w>often</w> feminine", "# but not always: <m>le dinosaure</m>!"])
board('ilya', "IL Y A  ·  there is / there are", [
 "<y>il y a</y> un dinosaure", "# there is a dinosaur",
 "<y>il y a</y> trois œufs", "# there are three eggs",
 "<y>il y a</y> = singular AND plural", "# one form, never changes",
 "<y>Il y a</y> un laboratoire ?", "# a question: just raise your voice"])
board('nombres', "Les nombres  0 à 20", [
 "<y>0</y> zéro · <y>1</y> un · <y>2</y> deux", "<y>3</y> trois · <y>4</y> quatre · <y>5</y> cinq",
 "<y>6</y> six · <y>7</y> sept · <y>8</y> huit", "<y>9</y> neuf · <y>10</y> dix",
 "<y>11</y> onze · <y>12</y> douze · <y>13</y> treize", "<y>14</y> quatorze · <y>15</y> quinze · <y>16</y> seize",
 "<y>17</y> dix-sept · <y>18</y> dix-huit", "+<y>19</y> dix-neuf · <y>20</y> vingt"])
board('articles', "Les articles", [
 "<m>un</m> dinosaure · <f>une</f> queue", "# a / an",
 "<m>le</m> dinosaure · <f>la</f> queue", "# the",
 "<w>des</w> dinosaures · <w>des</w> queues", "# some / plural of un, une  (noun + <e>s</e>, silent)",
 "<w>les</w> dinosaures · <w>les</w> queues", "# the, plural: masculine and feminine",
 "<w>l'</w>œuf · <w>l'</w>île", "# le / la + vowel or h = l'"])
board('avoir2', "AVOIR  ·  complet", [
 "<s>j'</s><v>ai</v> · <s>tu</s> <v>as</v> · <s>il/elle</s> <v>a</v>",
 "<s>nous</s> <v>avons</v>", "+<s>on</s> <v>a</v>",
 "<s>vous</s> <v>avez</v>",
 "<s>ils</s> <v>ont</v>", "+<s>elles</s> <v>ont</v>"])
board('age', "L'âge  ·  avoir + ans", [
 "I <w>am</w> 35  =  <f>je suis 35 ans</f>", "# WRONG in French: English logic!",
 "<s>j'</s><v>ai</v> <e>35 ans</e>", "# I HAVE 35 years",
 "Tu <v>as</v> quel âge ?", "+Le bébé <v>a</v> <e>deux jours</e>", "# how old are you? · the baby is two days old"])
board('peur', "J'ai peur  (expression)", [
 "<s>j'</s><v>ai</v> <e>peur</e>", "# I'm afraid = I have fear",
 "Tu <v>as</v> peur ?", "+Il <v>a</v> peur", "# are you afraid? · he is afraid",
 "<s>je</s> <w>n'</w><v>ai</v> <w>pas</w> peur", "# I'm not afraid: ne + verb + pas (episode 4!)"])
board('resume1', "RÉSUMÉ  ·  Épisode 2", [
 "<s>j'</s><v>ai</v> · <s>tu</s> <v>as</v> · <s>il/elle</s> <v>a</v>", "+<s>nous</s> <v>avons</v> · <s>vous</s> <v>avez</v> · <s>ils</s> <v>ont</v>",
 "<m>un · le</m>   <f>une · la</f>", "+<w>des · les</w> = plural", "+<w>l'</w> before a vowel",
 "<m>le chapeau</m> · <f>la brosse</f>", "# learn the article with the noun",
 "<y>il y a</y> = there is / there are",
 "<s>j'</s><v>ai</v> 35 ans · <s>j'</s><v>ai</v> peur", "# avoir for age and fear"])
board('resume2', "10 mots clés", [
 "<m>le dinosaure</m> = the dinosaur", "+<f>la queue</f> = the tail",
 "<f>la tête</f> = the head", "+<m>l'œuf</m> = the egg",
 "<m>le bébé</m> = the baby", "+<m>le laboratoire</m> = the lab",
 "<m>le chapeau</m> = the hat", "+<f>la brosse</f> = the brush",
 "<y>regarde</y> = look!", "+<y>j'ai peur</y> = I'm afraid"])

# ---------------------------------------------------------------- intro
chapter("Bienvenue !", ['ellie', 'ashok'], bg='brachio_hall')
explain('ellie', "[[brachio_hall]]Bonjour, Ashok! Welcome back to «Français Jurassique». Ellie here. Today we meet the dinosaurs! "
 "[[brachio]]With them you learn the second most important verb in French: «avoir», to have. You also learn how to say «a» and «the», because every French noun is masculine or feminine. "
 "[[egg_c]]You learn «il y a», there is and there are. You count from zero to twenty. And you learn why, in French, you do not say how old you are: you have your age. "
 "But first, a quick review of episode one.")

# ---------------------------------------------------------------- rappel
chapter("Rappel · Épisode 1", ['ellie', 'ashok'], bg='kauai1')
fr('ellie', "[[kauai1]]Bonjour, Ashok ! Tu es d'où ?", "Hello, Ashok! Where are you from?")
fr('ashok', "Je suis de Kulithalai, en Inde. J'habite en Belgique, à Genk.", "I am from Kulithalai, in India. I live in Belgium, in Genk.")
fr('ellie', "[[napali]]Et tu es ingénieur, oui ?", "And you are an engineer, yes?")
fr('ashok', "Oui, je suis ingénieur. Et je suis très content !", "Yes, I am an engineer. And I am very happy!")
chapter("Pause ! · Rappel", ['ellie'])
explain('ellie', "Very good, Ashok! Let's check what you remember. Three things. "
 "[[+]]First, «être»: «je suis, tu es, il est, nous sommes, vous êtes, ils sont.»² Ashok said: «Je suis de Kulithalai.»² "
 "[[+]]Second, a job has no article: «Je suis ingénieur.»² Not «un ingénieur». "
 "[[+]]Third, the feminine adds an e: «Il est indien.»² «Elle est indienne.»² Now, three quick questions for you.", board='rappel')
atoi("Say: We are here.", "Nous sommes ici.", img='kauai2')
atoi("Say: I live in Belgium.", "J'habite en Belgique.", img='beach1')

# ---------------------------------------------------------------- scene 1
chapter("Scène 1 · Un brachiosaure", ['alan', 'ashok', 'ellie'], bg='brachio_hall', id='s1')
fr('alan', "[[brachio_hall]]{Regarde|x|look} ! Il y a {un dinosaure|m|a dinosaur} !", "Look! There is a dinosaur!")
fr('ashok', "Oh ! {Un brachiosaure|m|a brachiosaur} ! Il est {grand|x|big, tall} !", "Oh! A brachiosaur! He is big!")
fr('alan', "[[brachio]]Oui. Il a {une petite tête|f|a small head} et {une longue queue|f|a long tail}.", "Yes. He has a small head and a long tail.")
fr('ellie', "[[brachio_leg]]Il a quatre {pattes|f|legs}. Et il a {un long cou|m|a long neck}.", "He has four legs. And he has a long neck.")
fr('ashok', "[[brachio_tall]]Il a {des dents|f|teeth} ?", "Does he have teeth?")
fr('alan', "Oui, il a des dents. Tu as {une photo|f|a photo} ?", "Yes, he has teeth. Do you have a photo?")
fr('ashok', "Oui, j'ai une photo ! Je suis {fan|x|fan} !", "Yes, I have a photo! I am a fan!")

chapter("Oups !", ['alan', 'ashok'], bg='diplo')
fr('ashok', "[[diplo]]Il a un petite tête.", "He has a small head. (mistake)")
fr('alan', "Une tête, Ashok. La tête est féminine : une tête, une petite tête.", "A head, Ashok. The head is feminine: une tête.")
fr('ashok', "[[brachio]]Ah oui ! Une petite tête. Merci !", "Ah yes! A small head. Thanks!")

chapter("Pause ! · Avoir", ['ellie'])
explain('ellie', "Pause! Alan said: «Il a une petite tête.»² The word «a» comes from the verb «avoir», to have. It is the second most important verb in French, after «être».  "
 "[[+]]First: «j'ai». I have. «Je» becomes «j'» in front of a vowel, and «ai» sounds like «é». So «j'ai» sounds like «jé». «J'ai une photo.»² «J'ai un chapeau.»² "
 "[[+]]Next: «tu as». You have, to a friend. The s is silent, so it sounds like «tu a». «Tu as une photo?»² «Tu as une question?»² "
 "[[+]]Then «il a» and «elle a». He has, she has. «Il a une longue queue.»² «Elle a un chapeau.»² Don't mix up «il est», he is, and «il a», he has. "
 "Together, slowly: «j'ai, tu as, il a.»²", board='avoir1')
explain('ellie', "Now, Ashok's mistake. He said «un petite tête», and Alan corrected him: «une tête». In French, every noun is masculine or feminine, even a head, a tail or a hat. There is no logic to it, so the rule is simple: learn the article together with the noun. "
 "[[+]]«Le dinosaure»: masculine, blue. «La queue»: feminine, red. «Le» is the masculine «the», «la» is the feminine «the». «Le dinosaure.»² «La queue.»² "
 "[[+]]So never learn «queue» alone. Learn «la queue». "
 "[[+]]And for «a», it is «un» for masculine and «une» for feminine. «Un cou.»² «Une tête.»² "
 "[[+]]A small tip: nouns ending in e are often feminine. «La tête», «la queue», «la patte», «la brosse». But not always! «Le dinosaure» is masculine, and so is «le laboratoire». Blue means masculine and red means feminine.", board='genre')
atoi("Say: He has a small head.", "Il a une petite tête.", img='brachio_leg')
atoi("Say: Do you have a photo? Ask a friend.", "Tu as une photo ?", img='brachio_tall')
atoi("Say: She has a long neck.", "Elle a un long cou.", img='diplo')
replay('s1')

# ---------------------------------------------------------------- scene 2
chapter("Scène 2 · Le laboratoire", ['hammond', 'ellie', 'ashok'], bg='lab', id='s2')
fr('hammond', "[[lab]]{Voici|x|here is} {le laboratoire|m|the laboratory}, Ashok ! Il y a {des œufs|m|eggs} ici !", "Here is the laboratory, Ashok! There are eggs here!")
fr('ellie', "[[egg_c]]Regarde ! Il y a {trois œufs|m|three eggs}. {L'œuf|m|the egg} est grand !", "Look! There are three eggs. The egg is big!")
fr('hammond', "[[egg_a]]Nous avons aussi {un bébé|m|a baby}. Le bébé a deux jours.", "We also have a baby. The baby is two days old.")
fr('ashok', "[[egg_b]]J'ai une question : il y a des dinosaures ici ?", "I have a question: are there dinosaurs here?")
fr('hammond', "[[lab]]Oui ! Il y a des dinosaures, des œufs et des bébés !", "Yes! There are dinosaurs, eggs and babies!")
fr('ellie', "Vous avez des questions ? {Tu as|x|you have} le nom du bébé ?", "Do you have questions? Do you have the baby's name?")

chapter("Oups !", ['ellie', 'ashok'], bg='egg_c')
fr('ashok', "[[egg_b]]Le œuf est grand !", "The egg is big! (mistake)")
fr('ellie', "L'œuf, Ashok ! L'œuf, avec une voyelle.", "L'œuf, Ashok! L'œuf, before a vowel.")
fr('ashok', "[[lab]]L'œuf. Oui ! L'œuf est grand.", "L'œuf. Yes! The egg is big.")

chapter("Pause ! · Il y a", ['alan'])
explain('alan', "Alan here. Short and practical, as always. Hammond said: «Il y a des œufs.»² «Il y a» means there is, and also there are. Learn it as one block, in one breath. "
 "[[+]]«Il y a un dinosaure.»² There is a dinosaur. "
 "[[+]]«Il y a trois œufs.»² There are three eggs. "
 "[[+]]Notice: nothing changes. «Il y a» is the same for one thing or for many. "
 "[[+]]And for a question, just raise your voice at the end: «Il y a un laboratoire?»² This is how you describe any scene.", board='ilya')
explain('ellie', "Ellie again. Hammond was counting eggs, so let's count too. Zero to twenty. Say each line after me, slowly. "
 "[[+]]«Zéro, un, deux.»² «Un» is also the masculine «a». "
 "[[+]]«Trois, quatre, cinq.»² "
 "[[+]]«Six, sept, huit.»² Say «huit» like «weet». "
 "[[+]]«Neuf, dix.»² "
 "[[+]]«Onze, douze, treize.»² These all end in «ze». "
 "[[+]]«Quatorze, quinze, seize.»² "
 "[[+]]«Dix-sept, dix-huit, dix-neuf, vingt.»² «Vingt» sounds like «van». "
 "Before a vowel, a number links with a «z»: «deux œufs»: «deu-zeuf.»²", board='nombres')
explain('ellie', "Now the articles, all together. Ashok said «le œuf», and I fixed it to «l'œuf». Here is the full picture. "
 "[[+]]«Un» and «une» mean a. «Un dinosaure.»² «Une queue.»² "
 "[[+]]«Le» and «la» mean the. «Le dinosaure.»² «La queue.»² "
 "[[+]]For the plural of «un» and «une» there is only one word: «des». «Des dinosaures.»² «Des queues.»² It means some, or nothing in English: there are eggs. The written s is silent. "
 "[[+]]For the plural of «le» and «la» there is also one word: «les». «Les dinosaures.»² «Les queues.»²  "
 "[[+]]Finally the shortcut. Before a vowel or a silent h, «le» and «la» both become «l'». «L'œuf.»² «L'île.»²", board='articles')
atoi("Say: There is a dinosaur.", "Il y a un dinosaure.", img='hall1')
atoi("Say: There are three eggs.", "Il y a trois œufs.", img='egg_c')
atoi("Say: the island. Then: the eggs.", "L'île. Les œufs.", img='kauai1')
replay('s2')

# ---------------------------------------------------------------- scene 3
chapter("Scène 3 · L'équipement", ['alan', 'ellie', 'ashok'], bg='quarry', id='s3')
fr('alan', "[[quarry]]Moi, j'ai {un chapeau|m|a hat}, {une brosse|f|a brush} et {des outils|m|tools}.", "Me, I have a hat, a brush and tools.")
fr('ellie', "[[jackets]]Nous avons {une jeep|f|a jeep}, Ashok ! Alan a le chapeau. J'ai les outils.", "We have a jeep, Ashok! Alan has the hat. I have the tools.")
fr('ashok', "[[cleaning]]Moi, j'ai {un ordinateur|m|a computer} !", "Me, I have a computer!")
fr('alan', "Un ordinateur ? Hum. Non, merci.", "A computer? Hmm. No, thank you.")
fr('ellie', "[[vertebrae]]Alan, Ashok, vous avez le chapeau et l'ordinateur. Nous avons la jeep !", "Alan, Ashok, you have the hat and the computer. We have the jeep!")

chapter("Oups !", ['ellie', 'ashok'], bg='jackets')
fr('ashok', "[[quarry]]Alan et Ellie, ils a une jeep !", "Alan and Ellie, he have a jeep! (mistake)")
fr('ellie', "Ils ont, Ashok ! Ils ont une jeep. Ils ont, avec un t.", "Ils ont, Ashok! They have a jeep.")
fr('ashok', "[[jackets]]Ils ont une jeep. Et nous avons des questions !", "They have a jeep. And we have questions!")

chapter("Pause ! · Avoir (suite)", ['ellie'])
explain('ellie', "Pause! Let's finish «avoir». You already know the singular. [[+]]Now the new forms. "
 "[[+]]«Nous avons.» We have. «Nous avons une jeep.»² «Nous avons des outils.»² In everyday French people also say «on a»: «On a une jeep.»² "
 "[[+]]«Vous avez.» You have, polite or plural. «Vous avez des questions?»² "
 "[[+]]And «ils ont», «elles ont.» They have. «Ils ont une jeep.»² Ashok said «ils a». That is the classic mistake: «ils» needs «ont», and «ont» sounds like «on». Listen: «ils ont»: «il-zon».² Now all six, slowly: «j'ai, tu as, il a, nous avons, vous avez, ils ont.»²", board='avoir2')
atoi("Say: I have a hat.", "J'ai un chapeau.", img='quarry')
atoi("Say: We have a jeep.", "Nous avons une jeep.", img='jackets')
atoi("Say: They have a laboratory.", "Ils ont un laboratoire.", img='lab')
replay('s3')

# ---------------------------------------------------------------- scene 4
chapter("Scène 4 · J'ai peur !", ['malcolm', 'ashok', 'alan'], bg='jungle1', id='s4')
fr('malcolm', "[[jungle1]]Ashok ! Tu as {peur|f|fear: avoir peur = to be afraid} ?", "Ashok! Are you afraid?")
fr('ashok', "Oui, j'ai peur ! Il y a des dinosaures ici !", "Yes, I am afraid! There are dinosaurs here!")
fr('malcolm', "[[jungle2]]Moi, je n'ai pas peur. Hum... {Tu as quel âge|x|how old are you} ?", "Me, I am not afraid. Hmm... How old are you?")
fr('alan', "[[jungle3]]Regarde ! Il y a un dinosaure !", "Look! There is a dinosaur!")
fr('malcolm', "Ah ! J'ai peur ! J'ai très peur !", "Ah! I am afraid! I am very afraid!")
fr('ashok', "[[path]]Ha ha ! Ian, tu as peur aussi !", "Ha ha! Ian, you are afraid too!")

chapter("Oups !", ['malcolm', 'ashok'], bg='jungle1')
fr('malcolm', "[[path]]Alors, Ashok, tu as quel âge ?", "So, Ashok, how old are you?")
fr('ashok', "Je suis trente-cinq ans.", "I am 35 years. (mistake)")
fr('malcolm', "Non, non, non ! J'ai trente-cinq ans. Avec le verbe avoir.", "No, no, no! I have 35. With the verb avoir.")
fr('ashok', "[[jungle1]]Ah oui ! J'ai trente-cinq ans. Et j'ai peur !", "Ah yes! I have 35. And I am afraid!")

chapter("Pause ! · L'âge", ['malcolm'])
explain('malcolm', "Ian Malcolm. You made the classic mistake, Ashok, and I love it, because it shows how your brain works. In English you ARE thirty-five. You think: «être», so, «je suis trente-cinq ans». "
 "[[+]]Wrong! French logic is different. "
 "[[+]]You do not are your age. You HAVE it. «J'ai trente-cinq ans.»² Literally: I have thirty-five years. The word is «ans», years, and the s is silent. «J'ai trente-cinq ans.»² "
 "[[+]]The question is: «Tu as quel âge?»² Which age do you have? And the baby from the lab? «Le bébé a deux jours.»² The baby has two days. Numbers past twenty come later: treat «trente-cinq ans» as a block.", board='age')
explain('malcolm', "One more block, and it is my favourite: fear. In English, you ARE afraid. In French, you HAVE fear. "
 "[[+]]«J'ai peur.»² I'm afraid. Learn it as a block. "
 "[[+]]«Tu as peur?»² Are you afraid? «Il a peur.»² He's afraid."
 "[[+]]And Ian Malcolm, of course, never has fear. «Je n'ai pas peur.»² I'm not afraid. The «n'» and «pas» around the verb make it negative. Just an expression for now: negation comes in episode four. «Je n'ai pas peur.»² Say it with confidence.", board='peur')
atoi("Say: The baby is two days old.", "Le bébé a deux jours.", img='egg_a')
atoi("Say: I'm afraid.", "J'ai peur.", img='jungle3')
atoi("Say: I'm not afraid.", "Je n'ai pas peur.", img='jungle2')
replay('s4')

# ---------------------------------------------------------------- résumé
chapter("Résumé", ['ellie'], bg='brachio_tall')
explain('ellie', "Résumé! The whole episode on one board. "
 "[[+]]The verb «avoir», all six forms: «j'ai, tu as, il a, nous avons, vous avez, ils ont.»² "
 "[[+]]The articles: «un» and «une», «le» and «la». The plural: «des» and «les». «L'» before a vowel. «Un dinosaure, une queue, des dinosaures, les queues.»² And «l'œuf», «l'île.»² "
 "[[+]]Learn the article with the noun: «le chapeau», «la brosse.»² "
 "[[+]]«Il y a», there is, there are: «Il y a un dinosaure.» «Il y a trois œufs.» "
 "[[+]]And «avoir» for age and for fear: «J'ai trente-cinq ans.» «J'ai peur.»", board='resume1')
explain('ellie', "And ten key words. "
 "[[+]]«Le dinosaure», the dinosaur. «La queue», the tail. [[+]]«La tête», the head. «L'œuf», the egg. [[+]]«Le bébé», the baby. «Le laboratoire», the lab. "
 "[[+]]«Le chapeau», the hat. «La brosse», the brush. [[+]]«Regarde», look. «J'ai peur», I'm afraid. "
 "Well done, Ashok!", board='resume2')

chapter("À bientôt !", ['hammond', 'ashok', 'ellie'], bg='brachio_hall')
fr('hammond', "[[brachio_hall]]Bravo, Ashok ! Il y a des dinosaures, des œufs et des bébés. Et toi, tu as une nouvelle langue !", "Bravo, Ashok! There are dinosaurs, eggs and babies. And you, you have a new language!")
fr('ashok', "Merci ! J'ai peur, mais je suis content !", "Thank you! I'm afraid, but I'm happy!")
explain('ellie', "[[diplo]]Next episode: «Grand ou petit?» You will learn adjectives, big and small, and colours, and how they change with masculine and feminine. [[brachio]]Until then, count from zero to twenty, and say «j'ai, tu as, il a» ten times a day. À bientôt!")
