# Episode 4 · La visite (A1).  Markup: see jurassic-serie/dsl.py
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
import dsl
from dsl import *
import re as _re
def replay_fixed(id, fix):
    """Like replay(), but corrects or drops the lines where Ashok makes a deliberate learner mistake."""
    sc = dsl._scenes[id]; SEQ.append(dict(kind='chapter', title='Encore une fois !', cast=sc['cast'], bg=sc['bg'], replay=True))
    for it in sc['items']:
        t = _re.sub(r'\{([^{}|]*)\|[^{}|]*\|[^{}]*\}', r'\1', it['text']); drop = False
        for k, v in fix.items():
            if k in t:
                if v is None: drop = True
                elif v == "" : t = t.replace(k, "")
                elif k in ("Je aime", "pas des animaux"): t = v
                else: t = t.replace(k, v)
        if not drop: SEQ.append(dict(kind='fr', who=it['who'], text=t, en=it['en'], replay=True))

meta(num=4, title="La visite", level='A1', slug='la-visite', rate='-25%',
     goal="radical + e · es · e · ons · ez · ent  ·  ne + VERBE + pas  ·  est-ce que …?")

# ---------------------------------------------------------------- boards
board('rappel', "RAPPEL  ·  Épisode 3", [
 "grand <e>+e</e> = grande", "+grand <e>+s</e> = grands", "+grand <e>+es</e> = grandes",
 "une plante <m>verte</m>", "# most adjectives: AFTER the noun",
 "un <f>petit</f> dinosaure", "# BAGS: before the noun",
 "<w>c'est</w> un dinosaure", "+<s>il</s> <v>est</v> grand", "# c'est + noun · il est + adjective"])
board('er1', "Les verbes en -ER", [
 "regard<w>er</w>", "# remove -er = the radical: regard-",
 "<s>je</s> regard<e>e</e>", "+<s>tu</s> regard<e>es</e>", "+<s>il/elle</s> regard<e>e</e>",
 "<s>nous</s> regard<e>ons</e>",
 "<s>vous</s> regard<e>ez</e>",
 "<s>ils/elles</s> regard<e>ent</e>", "# -e · -es · -e · -ons · -ez · -ent",
 "<y>je · tu · il · ils  =  same sound!</y>"])
board('er2', "Chaos ! petits détails", [
 "<s>nous</s> mang<e>eons</e>", "# keep the E: the G stays soft",
 "<s>je</s> + aime = <y>j'aime</y>", "+<s>j'</s>adore · <s>j'</s>habite", "# je = j' before a vowel or silent h",
 "<s>ils</s> mangent", "# the -ent is silent: ils mangent = il mange"])
board('neg', "La négation  ·  ne … pas", [
 "<w>ne</w> + <v>VERBE</v> + <w>pas</w>", "# like brackets around the verb",
 "<s>je</s> <w>ne</w> <v>mange</v> <w>pas</w>", "# I don't eat",
 "<s>tu</s> <w>ne</w> <v>regardes</v> <w>pas</w>", "+<s>nous</s> <w>ne</w> <v>mangeons</v> <w>pas</w>",
 "<s>je</s> <w>n'</w><v>aime</v> <w>pas</w>", "# n' before a vowel", "+<s>je</s> <w>n'</w><v>ai</v> <w>pas</w> peur"])
board('negde', "Après « pas » : un, une, des = de", [
 "Je mange <f>des</f> plantes", "+Je ne mange pas <y>de</y> plantes",
 "J'ai <f>une</f> jeep", "+Je n'ai pas <y>de</y> jeep",
 "Il mange <f>des</f> animaux", "+Il ne mange pas <y>d'</y>animaux", "# de = d' before a vowel",
 "<w>le · la · les</w> do NOT change", "+Je n'aime pas <w>les</w> raptors",
 "<w>c'est</w> un T. rex", "+Ce n'est pas <w>un</w> T. rex", "# after être: no change"])
board('aimer', "aimer · adorer · détester", [
 "<s>j'</s><v>aime</v> <m>les</m> dinosaures", "# I like dinosaurs (in general)",
 "<s>j'</s><v>adore</v> <f>la</f> jungle", "+<s>je</s> <v>déteste</v> <f>la</f> viande",
 "<y>aimer / adorer / détester + le · la · l' · les</y>", "# never un · une · des",
 "<s>je</s> <v>mange</v> <f>des</f> plantes", "# eat = des  ·  like = les"])
board('quest', "Trois façons de poser une question", [
 "1.  <s>Tu</s> <v>aimes</v> l'île <y>?</y>", "# voice goes UP",
 "2.  <y>Est-ce que</y> <s>tu</s> <v>aimes</v> l'île ?", "# est-ce que + normal sentence",
 "3.  mot interrogatif + est-ce que …", "# question word first",
 "<s>tu</s> <v>aimes</v> l'île ?  =  <y>Est-ce que</y> tu aimes l'île ?"])
board('qword', "Les mots interrogatifs", [
 "<y>où</y> = where",
 "<y>quand</y> = when", "+<y>comment</y> = how",
 "<y>pourquoi</y> = why", "+<y>parce que</y> = because",
 "<y>combien</y> = how much / many", "+<y>qui</y> = who",
 "<y>qu'est-ce que</y> = what", "# Qu'est-ce que <s>tu</s> <v>regardes</v> ?",
 "# Où est le T. rex ?  ·  Pourquoi tu as peur ?"])
board('phrases', "Des phrases complètes", [
 "<s>je</s> <v>regarde</v> le brachiosaure", "+<s>tu</s> <v>manges</v> des feuilles", "+<s>nous</s> <v>visitons</v> le parc",
 "<s>je</s> <w>ne</w> <v>regarde</v> <w>pas</w> le raptor", "+<s>je</s> <w>ne</w> <v>mange</v> <w>pas</w> <y>de</y> viande",
 "<y>Est-ce que</y> <s>tu</s> <v>regardes</v> le brachiosaure ?", "+<y>Qu'est-ce que</y> <s>tu</s> <v>regardes</v> ?"])
board('resume1', "RÉSUMÉ  ·  Épisode 4", [
 "regard<w>er</w> = regard<e>e · es · e · ons · ez · ent</e>",
 "nous mang<e>eons</e> · j'aime · j'habite",
 "<w>ne</w> + <v>VERBE</v> + <w>pas</w>  ·  n' + voyelle",
 "pas <y>de</y> / <y>d'</y>  (un · une · des)",
 "aimer + <m>le</m> · <f>la</f> · les",
 "<s>Tu</s> aimes ? · <y>Est-ce que</y> … ? · <y>où · pourquoi · qu'est-ce que</y>"])
board('resume2', "10 mots clés", [
 "<y>regarder</y> = to look", "+<y>manger</y> = to eat",
 "<y>aimer</y> = to like, love", "+<y>chercher</y> = to look for",
 "<y>la viande</y> = meat", "+<y>la plante</y> = plant",
 "<y>où ?</y> = where?", "+<y>pourquoi ?</y> = why?",
 "<y>parce que</y> = because", "+<y>je n'ai pas peur</y> = I'm not scared"])

# ---------------------------------------------------------------- intro + rappel
chapter("Rappel · Épisode 3", ['ellie'], bg='kauai1')
explain('ellie', "[[kauai1]]Bonjour, Ashok! Welcome back. Today is the jeep tour of the park, and you learn how to talk about actions: what you do, what you don't do, and how to ask questions. This is a big episode, so let's start with a quick recap of episode three. "
 "[[+]]Adjectives agree. Feminine: add an e. Plural: add an s. Both: es. «Grand, grande, grands, grandes.»² "
 "[[+]]Most adjectives come after the noun: «une plante verte.»² [[+]]But the BAGS adjectives come before: «un petit dinosaure.»² "
 "[[+]]And «c'est» goes with a noun, «il est» goes with an adjective. «C'est un dinosaure.»² «Il est grand.»² Now your turn.", board='rappel')
atoi("Say: The plants are green.", "Les plantes sont vertes.", img='ferns')
atoi("Say: It's a small dinosaur.", "C'est un petit dinosaure.", img='trice')
atoi("Say: Ellie is happy.", "Ellie est contente.", img='path')
atoi("Say: Seventy, as they say in Belgium.", "Septante.", img='forest')

# ---------------------------------------------------------------- scene 1
chapter("Scène 1 · La jeep", ['hammond', 'ashok', 'malcolm'], bg='jeep', id='s1')
fr('hammond', "[[jeep]]Bonjour, Ashok ! {Nous visitons|x|we visit} {le parc|m|the park} {aujourd'hui|x|today}.", "Hello, Ashok! We are visiting the park today.")
fr('ashok', "Bonjour, monsieur Hammond ! Je suis de Kulithalai, en Inde. J'habite {à|x|in (a city)} Genk, en Belgique.", "Hello, Mr Hammond! I am from Kulithalai, in India. I live in Genk, in Belgium.")
fr('hammond', "[[safari2]]Très bien ! Nous {regardons|x|we watch}, nous écoutons, nous {parlons|x|we talk}. Tu aimes {les dinosaures|m|the dinosaurs} ?", "Very good! We watch, we listen, we talk. Do you like dinosaurs?")
fr('ashok', "[[path]]Oui ! Je aime les dinosaures !", "Yes! I like dinosaurs!")
fr('malcolm', "[[forest]]J'aime ! {Je + aime|x|j' before a vowel}, c'est j'aime. {Chaos|m|chaos}, Ashok !", "J'aime! Je plus aime is j'aime. Chaos, Ashok!")
fr('ashok', "[[trail]]Ah oui ! J'aime les dinosaures. J'adore les dinosaures. Je suis {ingénieur|m|engineer}, mais j'adore les dinosaures.", "Ah yes! I like dinosaurs. I love dinosaurs. I am an engineer, but I love dinosaurs.")
fr('malcolm', "[[road]]{Moi|x|me}, j'aime la route. Elle est {longue|f|long}. Nous visitons le parc, et nous regardons.", "Me, I like the road. It is long. We visit the park, and we watch.")

chapter("Pause ! · Les verbes en -er", ['ellie'])
explain('ellie', "Pause! The most important board of the day. Hammond said: «Nous visitons le parc.»² «Nous regardons les dinosaures.»² These are verbs that end in «er» in the dictionary: «visiter», «regarder», «parler», «manger». "
 "More than ninety percent of French verbs end in «er», and they all follow the same pattern. Learn it once, and you know thousands of verbs. We take «regarder», to look at, to watch. "
 "[[+]]Step one: remove the «er». What is left is the radical: «regard». Step two: add an ending. The endings are: e, es, e, ons, ez, ent. Say it with me: «e, es, e, ons, ez, ent.»² "
 "[[+]]«Je regarde.»² I look. «Tu regardes.»² «Il regarde.»² «Elle regarde.»² [[+]]«Nous regardons.»² [[+]]«Vous regardez.»² [[+]]«Ils regardent.»² «Elles regardent.»² "
 "[[+]]Now listen to the sound. The endings e, es and ent are silent! «Je regarde, tu regardes, il regarde, ils regardent»: four forms, and they all sound the same. Only «nous regardons» and «vous regardez» sound different. So in speech, this is easier than it looks. "
 "Another one: «manger», to eat. «Je mange.»² «Tu manges.»² «Il mange.»² «Ils mangent.»² Another: «parler», to speak. «Je parle.»² «Nous parlons.»² «Vous parlez.»² Beautiful.", board='er1')
atoi("Say: We are watching the dinosaurs.", "Nous regardons les dinosaures.", img='safari2')
atoi("Say: They are looking for the raptor.", "Ils cherchent le raptor.", img='raptor')

chapter("Pause ! · Le petit chaos", ['malcolm'])
explain('malcolm', "Ian Malcolm here. «-er» verbs are the orderly part of French. But even order has two little wrinkles. Look at the board. "
 "[[+]]First wrinkle: «nous mangeons.»² The verb «manger» keeps an e before «ons». Why? Because a g before the letter o would sound hard, like in «go». The e keeps the g soft, like the s in «measure». «Nous mangeons.»² «Nous mangeons des plantes.»² The same trick works for «voyager»: «nous voyageons.» "
 "[[+]]Second wrinkle: «j'aime.»² Ashok said: «Je aime.» Two vowels bump into each other, and French hates that. So «je» loses its e and becomes «j'», with an apostrophe. «J'aime.»² «J'adore.»² «J'habite.»² The h is silent, so it counts as a vowel. «J'écoute.»² «J'étudie.»² Every verb that starts with a vowel or a silent h does this. "
 "[[+]]And one last reminder: «ils mangent» sounds exactly like «il mange». The «ent» is a ghost. You write it; you don't say it.", board='er2')
atoi("Say: We eat plants.", "Nous mangeons des plantes.", img='trail')
replay_fixed('s1', {"Je aime": "Oui ! J'aime les dinosaures !", "Je + aime": None, "Ah oui ! ": ""})

# ---------------------------------------------------------------- scene 2
chapter("Scène 2 · Les herbivores", ['alan', 'ashok', 'ellie'], bg='trice', id='s2')
fr('alan', "[[trice]]Regarde, Ashok. {Le tricératops|m|the triceratops} mange des plantes. Il ne mange pas de {viande|f|meat}.", "Look, Ashok. The triceratops eats plants. It doesn't eat meat.")
fr('ashok', "[[trice2]]Il ne mange pas {des animaux|x|animals}, alors ?", "It doesn't eat animals, then?")
fr('alan', "Attention ! Pas « des », mais « d' ». Il ne mange pas d'animaux.", "Careful! Not des, but d'. It doesn't eat animals.")
fr('ellie', "[[ferns]]C'est {un herbivore|m|a herbivore}. Il aime {les plantes|f|the plants}. Il a trois {cornes|f|horns}.", "It's a herbivore. It likes plants. It has three horns.")
fr('ashok', "Un herbivore ne chasse pas. {Un carnivore|m|a carnivore} chasse. Le T. rex est un carnivore.", "A herbivore doesn't hunt. A carnivore hunts. The T. rex is a carnivore.")
fr('alan', "[[trex]]Oui. Le T. rex mange de la viande. Il {chasse|x|he hunts} les herbivores. Mais le tricératops ne {déteste|x|he hates} pas le T. rex !", "Yes. The T. rex eats meat. It hunts herbivores. But the triceratops doesn't hate the T. rex!")

chapter("Pause ! · La négation", ['ellie'])
explain('ellie', "Pause! Ellie again. Alan said: «Il ne mange pas de viande.»² «Il ne mange pas.» He doesn't eat. This is the French negation, and it is a formula. "
 "[[+]]Two little words wrap around the verb, like brackets: «ne», then the verb, then «pas». «Ne, verbe, pas.»² [[+]]Take «je mange». It becomes «je ne mange pas.»² I don't eat. «Ne» goes before the verb, «pas» goes after it. [[+]]«Tu ne regardes pas.»² «Nous ne mangeons pas.»² «Ils ne chassent pas.»² "
 "A pronunciation tip: in speech, many French people drop the «ne». But you must write it, and you should say it for now. "
 "[[+]]What if the verb starts with a vowel? Same as before: «ne» becomes «n'». «Je n'aime pas.»² I don't like. «Je n'ai pas peur.»² I'm not scared. Yes! Do you remember? «J'ai peur», «je n'ai pas peur.» «Il n'est pas ici.»² He isn't here. «Je ne suis pas fatigué.»² I'm not tired. «Être» and «avoir» work with «ne… pas» too. Let's say a few together: «Je ne suis pas fatigué.»² «Je n'ai pas peur.»² «Je ne mange pas.»² Excellent.", board='neg')
chapter("Pause ! · Après pas", ['malcolm'])
explain('malcolm', "Malcolm again, with an exception that is also a pattern. Ashok said: «Il ne mange pas des animaux.» Alan corrected: «pas d'animaux.» "
 "[[+]]After «pas», the words «un», «une», «des» become «de». I eat plants: «Je mange des plantes.»² I don't eat plants: «Je ne mange pas de plantes.»² [[+]]I have a jeep: «J'ai une jeep.»² I don't have a jeep: «Je n'ai pas de jeep.»² [[+]]And before a vowel, «de» becomes «d'»: «Il ne mange pas d'animaux.»² Logic: «de» means «of». «Not any of». Zero quantity, so no «un», no «des». "
 "[[+]]But the definite articles do not change. «Je n'aime pas les raptors.»² [[+]]And after «être»: no change, because «c'est un T. rex» is identity, not quantity. «Ce n'est pas un T. rex.»² «C'est» becomes «ce n'est pas». Chaos? No. Two rules.", board='negde')
atoi("Say: I don't eat meat.", "Je ne mange pas de viande.", img='trice')
atoi("Say: I'm not scared.", "Je n'ai pas peur.", img='trail')
atoi("Say: The triceratops eats plants.", "Le tricératops mange des plantes.", img='ferns')

chapter("Pause ! · Aimer", ['ellie'])
explain('ellie', "A small but important rule, from the verbs of liking. Ashok said: «J'aime les dinosaures.»² «J'adore les dinosaures.»² Three verbs for feelings: «aimer», to like or to love, «adorer», to love, and «détester», to hate. They are all regular «er» verbs. "
 "[[+]]«J'aime les dinosaures.»² [[+]]«J'adore la jungle.»² «Je déteste la viande.»² "
 "[[+]]And the rule: with these verbs, you use the definite article: «le», «la», «l'», «les». Never «un», «une» or «des». Even when English has no article: «I like dinosaurs» is «j'aime les dinosaures», with «les». "
 "[[+]]Compare. To eat: «je mange des plantes.»² To like: «j'aime les plantes.»² With «manger», an amount: «des». With «aimer», the idea in general: «les». Two verbs, two articles. «Tu aimes les plantes?» «Non, je n'aime pas les plantes.»²", board='aimer')
atoi("Say: I like dinosaurs.", "J'aime les dinosaures.", img='trex')
replay_fixed('s2', {"pas des animaux": "Il ne mange pas d'animaux, alors ?", "Attention": None})

# ---------------------------------------------------------------- scene 3
chapter("Scène 3 · Où est le T. rex ?", ['malcolm', 'ashok', 'ellie'], bg='fence', id='s3')
fr('malcolm', "[[fence]]{Où|x|where} est le T. rex ? Il ne mange pas ? Il ne chasse pas ?", "Where is the T. rex? He isn't eating? He isn't hunting?")
fr('ellie', "[[forest]]Nous {cherchons|x|we look for} le T. rex. Nous regardons. Nous écoutons.", "We are looking for the T. rex. We are watching. We are listening.")
fr('ashok', "[[fence]]Je ne pas ai peur !", "I am not scared!")
fr('ellie', "Presque ! Je n'ai pas peur. « Ne » avant, « pas » après.", "Almost! I am not scared. Ne before, pas after.")
fr('ashok', "[[road]]Ah oui. Je n'ai pas peur ! Mais je ne suis pas content. Où est le T. rex ?", "Ah yes. I am not scared! But I am not happy. Where is the T. rex?")
fr('malcolm', "[[trail]]Il n'est pas ici. Il {a|x|he has} peut-être faim, mais il ne chasse pas !", "He is not here. Maybe he is hungry, but he isn't hunting!")
fr('ellie', "[[path]]Tu ne regardes pas la route, Ian. Je cherche, tu cherches, nous cherchons.", "You are not watching the road, Ian. I search, you search, we search.")

chapter("Pause ! · Les questions", ['ellie'])
explain('ellie', "Pause! In this scene, Ian asked: «Où est le T. rex?»² Let's learn how to ask questions. There are three ways, from easiest to most careful. "
 "[[+]]Way number one: intonation. Take a normal sentence and raise your voice at the end. «Tu aimes l'île.» is a statement. «Tu aimes l'île?»² is a question. Nothing else changes. In everyday speech, this is the most common way. «Tu regardes le T. rex?»² «Vous mangez?»² "
 "[[+]]Way number two: put «est-ce que» in front of a normal sentence. «Est-ce que tu aimes l'île?»² It is a little marker, almost like «is it true that». «Est-ce que» sounds like «esker». Before a vowel it becomes «est-ce qu'»: «Est-ce qu'il mange?»² «Est-ce qu'elle aime les plantes?»² «Est-ce que vous cherchez le raptor?»² "
 "[[+]]Way number three: a question word in front, like «où», where. «Où est le T. rex?»² «Tu habites où?»² A question word can start the sentence, or come at the end. "
 "[[+]]And the same meaning: «Tu aimes l'île?», «Est-ce que tu aimes l'île?»² Pick whichever you like.", board='quest')
explain('ellie', "Here are the question words. Say each one with me. "
 "[[+]]«Où?»² Where? «Où est le parc?»² [[+]]«Quand?»² When? «Comment?»² How? «Comment tu t'appelles?»² You know that one already! "
 "[[+]]«Pourquoi?»² Why? And the answer starts with «parce que»,² because. «Pourquoi tu regardes?» «Parce que j'aime les dinosaures.»² [[+]]«Combien?»² How much, or how many? «Combien de dinosaures?»² «Qui?»² Who? "
 "[[+]]And the big one, «qu'est-ce que», which means: what. «Qu'est-ce que tu regardes?»² What are you looking at? «Qu'est-ce que tu manges?»² «Qu'est-ce que tu aimes?»² «Qu'est-ce que», plus a normal sentence. It sounds like «kess ke». Learn it as one block. "
 "Now you can ask about almost anything: «Où est le T. rex?»² «Pourquoi tu as peur?»²", board='qword')
atoi("Say: Where is the T. rex?", "Où est le T. rex ?", img='trex')
atoi("Say: Do you like the island?", "Est-ce que tu aimes l'île ?", img='kauai1')
atoi("Say: What are you looking at?", "Qu'est-ce que tu regardes ?", img='road')
atoi("Say: Why? Because I like dinosaurs.", "Pourquoi ? Parce que j'aime les dinosaures.", img='trice')
replay_fixed('s3', {"Je ne pas ai": None, "Presque": None, "Ah oui. ": ""})

# ---------------------------------------------------------------- scene 4
chapter("Scène 4 · Dans la jeep", ['ellie', 'ashok', 'malcolm'], bg='safari2', id='s4')
fr('ellie', "[[safari2]]Ashok, est-ce que tu aimes {l'île|f|the island} ?", "Ashok, do you like the island?")
fr('ashok', "Oui, j'aime l'île. Elle est {belle|f|beautiful} !", "Yes, I like the island. It is beautiful!")
fr('malcolm', "Qu'est-ce que tu regardes, Ashok ?", "What are you looking at, Ashok?")
fr('ashok', "[[brachio]]Je regarde le {brachiosaure|m|brachiosaur}. Il est très grand. Il mange des feuilles.", "I'm looking at the brachiosaur. He is very big. He eats leaves.")
fr('ellie', "Pourquoi tu aimes les dinosaures ?", "Why do you like dinosaurs?")
fr('ashok', "Parce que je suis ingénieur, et les dinosaures sont {incroyables|x|incredible} !", "Because I am an engineer, and dinosaurs are incredible!")
fr('malcolm', "[[kauai2]]Et nous ? Est-ce que nous aimons Ashok ? Oui ! Nous aimons Ashok. Il parle {bien|x|well} français !", "And us? Do we like Ashok? Yes! We like Ashok. He speaks French well!")

chapter("Pause ! · Parler en phrases", ['ellie'])
explain('ellie', "Last pause of the episode. Let's build real sentences with what we know, like Ashok did. Take a pronoun from episode one, an «er» verb from today, and an article from episode two. "
 "[[+]]«Je regarde le brachiosaure.»² «Tu manges des feuilles.»² «Nous visitons le parc.»² «Ils cherchent le raptor.»² "
 "[[+]]Make it negative: «ne», verb, «pas». «Je ne regarde pas le raptor.»² «Je ne mange pas de viande.»² "
 "[[+]]Make it a question: «Est-ce que tu regardes le brachiosaure?»² «Qu'est-ce que tu regardes?»² "
 "Everything fits together. Say them aloud as you run, or lift weights, or walk. That is how a pattern becomes a reflex.", board='phrases')
atoi("Say: Do you like dinosaurs?", "Est-ce que tu aimes les dinosaures ?", img='raptor')
atoi("Say: I am from Kulithalai and I live in Belgium.", "Je suis de Kulithalai et j'habite en Belgique.", img='kauai4')
replay('s4')

# ---------------------------------------------------------------- résumé
chapter("Résumé", ['ellie'], bg='kauai2')
explain('ellie', "Résumé! First the formulas. [[+]]«-Er» verbs: take off the «er», add «e, es, e, ons, ez, ent.» «Je regarde, nous regardons.»² [[+]]Two details: «nous mangeons», and «j'aime» before a vowel. "
 "[[+]]The negation: «ne», verb, «pas.» «Je ne mange pas.»² [[+]]After «pas»: «de». «Je ne mange pas de viande.»² [[+]]With «aimer»: «les». «J'aime les dinosaures.»² "
 "[[+]]Questions: raise your voice, or «est-ce que», or a question word like «où», «pourquoi», «qu'est-ce que».", board='resume1')
explain('ellie', "And now ten key words. [[+]]«Regarder», to look. «Manger», to eat. [[+]]«Aimer», to like. «Chercher», to look for. [[+]]«La viande», meat. «La plante», plant. "
 "[[+]]«Où», where. «Pourquoi», why. [[+]]«Parce que», because. «Je n'ai pas peur», I'm not scared. Well done, Ashok!", board='resume2')

chapter("À bientôt !", ['hammond', 'ashok'], bg='jeep')
fr('hammond', "[[jeep]]Bravo, Ashok ! Merci pour la visite !", "Bravo, Ashok! Thank you for the visit!")
fr('ashok', "Merci à vous ! J'adore l'île, et j'adore les dinosaures !", "Thank you! I love the island, and I love dinosaurs!")
explain('ellie', "[[kauai3]]Next episode: the visitor centre. You will learn the verbs «aller» and «faire», the little words «au» and «du», where things are, and how to tell the time. [[kauai4]]Until then, say «je regarde, tu regardes, il regarde» ten times a day. À bientôt!")
