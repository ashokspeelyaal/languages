# Episode 10 · L'évasion (A2).  Markup: see jurassic-serie/dsl.py
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
from dsl import *

meta(num=10, title="L'évasion", level='A2', slug='levasion', rate='-15%',
     goal="passé composé avec être  ·  accord du participe  ·  verbes pronominaux au passé  ·  le / la / l' / les")

# ---------------------------------------------------------------- boards
board('rappel9', "RAPPEL  ·  Épisode 9", [
 "<s>j'</s><v>ai</v> <e>trouvé</e> · <s>tu</s> <v>as</v> <e>vu</e>", "# avoir + past participle",
 "-er = <e>é</e> · -ir = <e>i</e> · -re = <e>u</e>", "+<w>faire</w> fait · <w>prendre</w> pris · <w>voir</w> vu",
 "<s>je</s> <w>n'</w><v>ai</v> <w>pas</w> vu", "+<s>je</s> <w>n'</w><v>ai</v> <w>rien</w> vu",
 "<y>hier</y> · <y>ce matin</y> · <y>cette nuit</y>", "+<y>il y a</y> deux heures"])
board('maison', "LA MAISON D'ÊTRE", [
 "<v>être</v> + <e>PARTICIPE</e>", "# movement verbs: être, NOT avoir",
 "<y>entrer</y> <e>entré</e> · <y>sortir</y> <e>sorti</e>", "# in the door · out the door",
 "<y>monter</y> <e>monté</e> · <y>descendre</y> <e>descendu</e>", "# up the stairs · down the stairs",
 "<y>arriver</y> <e>arrivé</e> · <y>partir</y> <e>parti</e>",
 "<y>aller</y> <e>allé</e> · <y>venir</y> <e>venu</e>", "+<y>revenir</y> <e>revenu</e> · <y>retourner</y> <e>retourné</e>",
 "<y>tomber</y> <e>tombé</e> · <y>rester</y> <e>resté</e>",
 "<y>devenir</y> <e>devenu</e> · <y>naître</y> <e>né</e>"])
board('accord', "L'accord  ·  agreement", [
 "<w>participe</w> = comme un adjectif", "# it agrees with the SUBJECT",
 "<m>il</m> est parti", "+<f>elle</f> est parti<e>e</e>",
 "<m>ils</m> sont parti<e>s</e>", "+<f>elles</f> sont parti<e>es</e>",
 "<s>nous</s> sommes arrivé<e>s</e>", "# a mixed group = masculine plural",
 "<s>je</s> suis tombé · <f>je</f> suis tombé<e>e</e>", "# a man writes tombé · a woman writes tombée"])
board('refl', "Le réfléchi au passé", [
 "<s>je</s> <w>me</w> <v>suis</v> levé(<e>e</e>)", "+<s>tu</s> <w>t'</w><v>es</v> levé(<e>e</e>)",
 "<m>il</m> <w>s'</w><v>est</v> levé", "+<f>elle</f> <w>s'</w><v>est</v> levé<e>e</e>",
 "<s>nous</s> <w>nous</w> <v>sommes</v> levé<e>s</e>", "+<s>ils</s> <w>se</w> <v>sont</v> levé<e>s</e>",
 "<m>il</m> <w>s'</w><v>est</v> échappé", "# every reflexive verb takes être",
 "<w>me · te · se · nous · vous · se</w> + être"])
board('pron', "Le, la, l', les  ·  it, them", [
 "<m>le</m> · <f>la</f> · l' · <w>les</w>", "# replace a noun · BEFORE the verb",
 "je vois <m>le raptor</m>", "+je <m>le</m> vois",
 "je vois <f>la jeep</f>", "+je <f>la</f> vois",
 "je vois <w>les</w> traces", "+je <w>les</w> vois",
 "je <w>ne</w> <m>le</m> vois <w>pas</w>", "# ne goes before le/la/les",
 "j'ai vu = je <w>l'</w>ai vu", "# past: before avoir · il faut <m>le</m> trouver"])
board('chaos', "Chaos !  (Ian Malcolm)", [
 "j'ai vu <m>le raptor</m> = je <m>l'</m>ai vu", "# masculine: nothing changes",
 "j'ai vu <f>la jeep</f> = je <f>l'</f>ai vu<e>e</e>", "# feminine: add E (you can't hear it)",
 "j'ai vu <w>les</w> raptors = je <w>les</w> ai vu<e>s</e>", "+j'ai vu <f>les</f> jeeps = je <f>les</f> ai vu<e>es</e>",
 "<y>accord</y> avec le / la / les devant le verbe", "# the pronoun comes first, so the participle agrees"])
board('choix', "Avoir ou être ?  ·  la négation", [
 "<v>avoir</v>: <w>j'ai mangé · j'ai vu · j'ai fait</w>", "# most verbs",
 "<v>être</v>: <w>je suis sorti · je suis allé</w>", "# the house of être",
 "<v>être</v>: <w>je me suis levé</w>", "# all reflexive verbs",
 "<s>je</s> <w>ne</w> <v>suis</v> <w>pas</w> <e>tombé</e>", "+<s>elle</s> <w>n'</w><v>est</v> <w>pas</w> <e>partie</e>",
 "<s>je</s> <w>ne</w> <v>suis</v> <w>jamais</w> <e>tombé</e>", "# ne + être + pas + participe"])
board('resume10', "RÉSUMÉ  ·  Épisode 10", [
 "<v>être</v> + participe : <y>aller · venir · partir · arriver</y>", "# the house of être",
 "<s>elle</s> est parti<e>e</e> · <s>ils</s> sont parti<e>s</e>", "# agree with the subject",
 "<s>je</s> <w>me</w> <v>suis</v> levé(<e>e</e>)", "# reflexive = être",
 "<s>je</s> <m>le</m> vois · <s>je</s> <f>l'</f>ai vu<e>e</e>", "# le · la · l' · les before the verb",
 "<s>je</s> <w>ne</w> <v>suis</v> <w>pas</w> <e>sorti</e>"])
board('resume11', "10 mots clés", [
 "<y>l'évasion</y> = the escape", "+<y>s'échapper</y> = to escape",
 "<y>l'enclos</y> = the pen", "+<y>la forêt</y> = the forest",
 "<y>la rivière</y> = the river", "+<y>la vallée</y> = the valley",
 "<y>monter</y> = to go up", "+<y>descendre</y> = to go down",
 "<y>tomber</y> = to fall", "+<y>en sécurité</y> = safe"])

# ---------------------------------------------------------------- intro + rappel
chapter("Bienvenue !", ['ellie', 'ashok'], bg='fence')
explain('ellie', "[[fence]]Bonjour, Ashok! In episode nine we looked for a missing dinosaur. Today it is the chase: the escape! You will learn the second way to build the past, with «être». You will use the past with reflexive verbs. And you will learn «le, la, les»: how to say «it» and «them». "
 "[[jungle]]But first, the «Rappel» of episode nine.")
chapter("Rappel · Épisode 9", ['alan'], bg='quarry')
explain('alan', "Alan here. Look at the board. "
 "[[+]]The past with «avoir»: «J'ai trouvé une trace.»² «Tu as vu le dinosaure.»² The participle: «é» for -er verbs, «i» for -ir verbs, «u» for -re verbs. "
 "[[+]]And Ian's chaos list: «fait, pris, vu.»² "
 "[[+]]The negative wraps around «avoir»: «Je n'ai pas vu.»² «Je n'ai rien vu.»² "
 "[[+]]And the time words: «hier», «ce matin», «cette nuit», «il y a deux heures.»² Two quick questions.", board='rappel9')
atoi("Say: I found a track.", "J'ai trouvé une trace.", img='mist')
atoi("Say: I didn't see anything.", "Je n'ai rien vu.", img='dark', by='ashok')

# ---------------------------------------------------------------- scene 1
chapter("Scène 1 · L'évasion", ['claire', 'owen', 'ashok'], bg='fence', id='s1')
fr('claire', "[[fence]]Ashok, nous avons un problème. {L'enclos|m|the pen, enclosure} est vide !", "Ashok, we have a problem. The pen is empty!")
fr('owen', "[[jungle]]Le petit dinosaure {s'est échappé|x|escaped}. Il est sorti de l'enclos. Il est allé dans la {forêt|f|forest}.", "The little dinosaur escaped. He went out of the pen. He went into the forest.")
fr('ashok', "Il est parti ? Quand ?", "He left? When?")
fr('owen', "[[fence]]Il est parti cette nuit. La porte est ouverte.", "He left tonight. The door is open.")
fr('claire', "[[jungle2]]Il n'est pas dangereux. Il est petit. Mais il faut le trouver !", "He is not dangerous. He is small. But we have to find him!")
fr('ashok', "[[jungle]]Je suis ingénieur, pas chasseur ! Mais je viens avec vous.", "I am an engineer, not a hunter! But I am coming with you.")

chapter("Pause ! · La maison d'être", ['alan'])
explain('alan', "Pause! Listen again to Owen. «Il est sorti de l'enclos.»² «Il est allé dans la forêt.»² In episode nine the past used «avoir». Now look: «il est», not «il a». "
 "[[+]]Here is the rule. A small group of verbs, mostly verbs of movement, use «être» in the past, not «avoir». The formula: «être», plus the participle. Picture a house, the house of être. Why these verbs? Because they describe going somewhere, or a change: you enter, you leave, you fall, you are born. Many come in pairs of opposites, which makes them easy to remember. "
 "[[+]]At the door: «entrer», «entré». «Sortir», «sorti».² In, and out. "
 "[[+]]On the stairs: «monter», «monté». «Descendre», «descendu».² Up, and down. "
 "[[+]]The road: «arriver», «arrivé». «Partir», «parti».² Arrive, and leave. "
 "[[+]]«Aller», «allé». «Venir», «venu». «Revenir», «revenu». «Retourner», «retourné».² To go, to come, to come back, to go back. "
 "[[+]]«Tomber», «tombé». «Rester», «resté».² To fall, to stay. "
 "[[+]]And two for life: «devenir», «devenu», to become. «Naître», «né», to be born. "
 "The negative wraps around «être»: «Je ne suis pas sorti.»² Everything else, you know: «j'ai mangé», «j'ai vu», with «avoir». Learn the house, and you know the exceptions. Say the pairs aloud: «entrer, sortir; monter, descendre; arriver, partir; aller, venir.»² Remember: the house is small, and everything outside it uses «avoir».", board='maison')
atoi("Say: She left.", "Elle est partie.", img='jungle2')
atoi("Say: I fell.", "Je suis tombé.", img='roots1', by='ashok')
atoi("Say: Claire came back.", "Claire est revenue.", img='path')
replay('s1')

# ---------------------------------------------------------------- scene 2
chapter("Scène 2 · La poursuite", ['claire', 'alan', 'ashok'], bg='jeep', id='s2')
fr('claire', "[[jeep]]Alan, Ashok, {montez|x|get in} dans la jeep ! Nous partons.", "Alan, Ashok, get in the jeep! We are leaving.")
fr('alan', "Owen est resté au laboratoire avec les raptors. Nous sommes partis.", "Owen stayed at the lab with the raptors. We left.")
fr('ashok', "[[jeep2]]Ce matin, je me suis {levé|x|got up} à six heures. Et maintenant, je suis dans la jeep !", "This morning, I got up at six. And now I am in the jeep!")
fr('claire', "[[river]]Nous sommes arrivés à la {rivière|f|river}. Regardez : les traces !", "We have arrived at the river. Look: the tracks!")
fr('alan', "[[valley]]Elles sont {fraîches|x|fresh}. Le dinosaure est descendu dans la {vallée|f|valley} il y a deux heures.", "They are fresh. The dinosaur went down into the valley two hours ago.")
fr('claire', "Je suis montée sur la colline, mais il n'est pas là. Il est entré dans la forêt.", "I went up the hill, but he is not there. He went into the forest.")
fr('ashok', "[[jungle]]Dans la forêt ? Alors, nous allons entrer dans la forêt !", "In the forest? Then we are going to go into the forest!")

chapter("Oups !", ['ellie', 'ashok'], bg='valley')
fr('ashok', "[[valley]]Claire est monté sur la colline.", "Claire went up the hill. (mistake)")
fr('ellie', "Claire est une femme, Ashok. Alors : elle est montée. Avec un e.", "Claire is a woman, Ashok. So: elle est montée. With an e.")
fr('ashok', "[[kauai]]Ah oui ! Claire est montée sur la colline. Merci !", "Ah yes! Claire went up the hill. Thanks!")

chapter("Pause ! · L'accord", ['ellie'])
explain('ellie', "Pause! Ashok forgot an «e». Here is the big difference from «avoir». With «être», the participle agrees with the subject, exactly like an adjective. "
 "[[+]]You already know adjectives: add «e» for feminine, «s» for plural. The participle is like an adjective that describes the subject. "
 "[[+]]«Il est parti.»² But: «Elle est partie.»² With an «e». "
 "[[+]]«Ils sont partis.»² «Elles sont parties.»² With «s» and «es». "
 "[[+]]«Nous sommes arrivés.»² Here, Alan, Claire and Ashok: a mixed group is masculine plural, so «arrivés». Even one man in a group of ten women makes it masculine: «Ils sont arrivés.»² Only an all-female group is feminine: «Claire et Ellie sont arrivées.»² "
 "[[+]]And «je»? It depends on who speaks. Ashok says: «Je suis tombé.»² A woman says: «Je suis tombée.»² In speech you cannot hear the «e», but in writing you must add it. Same idea for «tu»: «Tu es arrivé»² for a man, «tu es arrivée»² for a woman. «Il est parti» and «elle est partie» sound the same: only your writing shows the difference.", board='accord')
atoi("Say: They stayed in the jeep. Ils, masculine.", "Ils sont restés dans la jeep.", img='jeep')
atoi("Say: We arrived at the lab.", "Nous sommes arrivés au laboratoire.", img='lab', by='ashok')
atoi("Say: The women left. Elles.", "Elles sont parties.", img='river')

chapter("Pause ! · Le réfléchi", ['ellie'])
explain('ellie', "Pause! Ashok also said: «Je me suis levé à six heures.»² I got up at six. You know reflexive verbs from episode seven: «se lever», «je me lève.» In the past, there is one rule: all reflexive verbs use «être», never «avoir». "
 "[[+]]«Je me suis levé.»² The reflexive pronoun «me» comes first, then «être», then the participle. «Tu t'es levé.»² "
 "[[+]]«Il s'est levé.»² «Elle s'est levée.»² With «e», because the subject is feminine. "
 "[[+]]«Nous nous sommes levés.»² «Ils se sont levés.»² "
 "[[+]]And Owen's sentence: «Le dinosaure s'est échappé.»² The dinosaur escaped. «S'échapper», to escape, is reflexive, so it takes «être». "
 "[[+]]The pronouns: «me, te, se, nous, vous, se», plus the right form of «être».", board='refl')
atoi("Say: I got up at six.", "Je me suis levé à six heures.", img='jeep2', by='ashok')
atoi("Say: The dinosaur escaped.", "Le dinosaure s'est échappé.", img='fence')
replay('s2', title="Encore une fois !")

# ---------------------------------------------------------------- scene 3
chapter("Scène 3 · Caché dans la forêt", ['alan', 'ashok', 'claire'], bg='roots1', id='s3')
fr('alan', "[[roots1]]{Chut|x|shh} ! Tu vois le dinosaure ?", "Shh! Do you see the dinosaur?")
fr('ashok', "[[roots2]]Oui, je le vois ! Il est derrière l'arbre.", "Yes, I see him! He is behind the tree.")
fr('claire', "[[canopy]]Et la jeep ? Tu la vois ?", "And the jeep? Do you see it?")
fr('ashok', "Non, je ne la vois pas. Elle est loin.", "No, I don't see it. It is far.")
fr('alan', "[[cloud]]Et les traces ? Tu les vois ?", "And the tracks? Do you see them?")
fr('ashok', "Oui, je les vois ! Elles sont petites.", "Yes, I see them! They are small.")
fr('claire', "[[roots1]]Tu as vu la jeep, tout à l'heure ?", "Did you see the jeep, a moment ago?")
fr('ashok', "[[canopy]]Oui, je l'ai vue ! Et je l'ai vu, lui, derrière l'arbre. Il est très petit.", "Yes, I saw it! And I saw him, behind the tree. He is very small.")
fr('alan', "[[roots2]]Il a peur, lui aussi. Il ne faut pas bouger.", "He is afraid too. We must not move.")

chapter("Oups !", ['owen', 'ashok'], bg='path')
fr('ashok', "[[path]]Je vois la jeep. Je le vois !", "I see the jeep. I see it! (mistake)")
fr('owen', "La jeep est féminine, Ashok. Alors : je la vois. La jeep, la.", "The jeep is feminine, Ashok. So: je la vois. La jeep, la.")
fr('ashok', "[[jungle2]]Ah oui ! La jeep, je la vois. Merci, Owen !", "Ah yes! The jeep, I see it. Thanks, Owen!")

chapter("Pause ! · Le, la, les", ['ellie'])
explain('ellie', "Pause! Ashok said: «Je le vois.»² «Je la vois.»² «Je les vois.»² These little words replace a noun, so you do not repeat it. «Le, la, l', les» are direct object pronouns. "
 "[[+]]And there is one big surprise for English speakers: they go before the verb. "
 "[[+]]«Je vois le raptor.»² becomes «Je le vois.»² «Le» replaces a masculine word. It means him, or it. "
 "[[+]]«Je vois la jeep.»² becomes «Je la vois.»² «La» is feminine: her, or it. "
 "[[+]]«Je vois les traces.»² becomes «Je les vois.»² «Les» is plural: them. "
 "[[+]]The negative wraps around the whole block: «Je ne le vois pas.»² Pronoun after «ne», verb, then «pas». "
 "[[+]]In the past, the pronoun stays before «avoir»: «Je l'ai vu.»² «Le» becomes «l'» before a vowel. And with an infinitive, it goes before the infinitive: «Il faut le trouver.»² We must find him. And for a question, nothing special: «Tu le vois?»² Do you see him? «Tu la vois?»² «Tu les vois?»² Same order as the statement: pronoun, then verb.", board='pron')
atoi("Say: Do you see the T. rex? Yes, I see it.", "Oui, je le vois.", img='trex')
atoi("Say: Do you see the jeep? No, I don't see it.", "Non, je ne la vois pas.", img='jeep', by='ashok')

chapter("Pause ! · Le chaos", ['malcolm'])
explain('malcolm', "Ian Malcolm. A little chaos for you, Ashok. You said: «Je l'ai vue.» With an «e». Why? "
 "[[+]]With «le», masculine, nothing changes: «Je l'ai vu.»² "
 "[[+]]But with «la», feminine, the participle gets an «e»: «Je l'ai vue.»² You will not hear it. You will see it. "
 "[[+]]With «les»: «Je les ai vus.»² And feminine plural: «Je les ai vues.»² "
 "[[+]]The rule: with «avoir», the participle agrees with the pronoun only when the pronoun comes BEFORE the verb. Good news: in speech, almost nobody can hear it. Chaos with a pattern, as always.", board='chaos')
atoi("Say: I saw it. The jeep.", "Je l'ai vue.", img='canopy')
replay('s3')

# ---------------------------------------------------------------- scene 4
chapter("Scène 4 · En sécurité", ['claire', 'owen', 'ashok'], bg='sunset', id='s4')
fr('owen', "[[sunset]]Vous êtes revenus ! Moi, je suis resté au laboratoire.", "You came back! Me, I stayed at the lab.")
fr('ashok', "Nous sommes arrivés au centre. Je suis tombé dans la jeep, mais {ça va|x|I'm fine} !", "We arrived at the centre. I fell in the jeep, but I'm fine!")
fr('claire', "[[sunrise]]Alan l'a pris dans la jeep. Le dinosaure est dans l'enclos. Il est {en sécurité|x|safe}.", "Alan took him in the jeep. The dinosaur is in the pen. He is safe.")
fr('owen', "[[jeep2]]Et toi, Ashok ? Tu es sorti de la jeep ?", "And you, Ashok? Did you get out of the jeep?")
fr('ashok', "[[sunset]]Non, je ne suis pas sorti ! Je suis ingénieur informatique, pas explorateur.", "No, I didn't go out! I am an IT engineer, not an explorer.")
fr('claire', "[[sunrise]]Tu es de Kulithalai, mais tu habites à Genk. Là-bas, il n'y a pas de dinosaures !", "You are from Kulithalai, but you live in Genk. There are no dinosaurs there!")
fr('ashok', "J'aime les films de dinosaures. Mais à Genk, je les regarde sur le {canapé|m|sofa} !", "I like dinosaur films. But in Genk, I watch them on the sofa!")

chapter("Oups !", ['alan', 'ashok'], bg='roots1')
fr('ashok', "[[roots1]]J'ai tombé dans la jeep !", "I fell in the jeep! (mistake)")
fr('alan', "Tomber est dans la maison d'être, Ashok. Alors : je suis tombé.", "Tomber is in the house of être, Ashok. So: je suis tombé.")
fr('ashok', "[[canopy]]Ah oui ! Je suis tombé. Je ne suis pas tombé dans la rivière !", "Ah yes! I fell. I didn't fall in the river!")

chapter("Pause ! · Avoir ou être ?", ['alan'])
explain('alan', "Pause! Last board. How do you choose? «Avoir» or «être»? "
 "[[+]]Most verbs use «avoir»: «J'ai mangé.»² «J'ai vu.»² «J'ai fait.»² "
 "[[+]]The movement verbs of the house use «être»: «Je suis sorti.»² «Je suis allé.»² "
 "[[+]]And all reflexive verbs use «être»: «Je me suis levé.»² "
 "[[+]]The negative wraps around the auxiliary, whichever it is: «Je ne suis pas tombé.»² «Elle n'est pas partie.»² "
 "[[+]]And «jamais», never, works like «pas»: «Je ne suis jamais tombé.»² I never fell.", board='choix')
atoi("Say: I didn't go out.", "Je ne suis pas sorti.", img='lab', by='ashok')
replay('s4')

# ---------------------------------------------------------------- résumé
chapter("Résumé", ['ellie'], bg='sunrise')
explain('ellie', "Résumé of episode ten. "
 "[[+]]The house of être: «aller, venir, partir, arriver, entrer, sortir, monter, descendre, tomber, rester.»² «Il est parti.»² "
 "[[+]]The participle agrees with the subject: «elle est partie, ils sont partis.»² "
 "[[+]]Reflexive verbs take «être»: «Je me suis levé.»² "
 "[[+]]«Le, la, l', les» go before the verb: «Je le vois», «je l'ai vue.»² "
 "[[+]]And the negative wraps around «être»: «Je ne suis pas sorti.»²", board='resume10')
explain('ellie', "And ten key words. "
 "[[+]]«L'évasion», the escape. «S'échapper», to escape. [[+]]«L'enclos», the pen. «La forêt», the forest. [[+]]«La rivière», the river. «La vallée», the valley. "
 "[[+]]«Monter», to go up. «Descendre», to go down. [[+]]«Tomber», to fall. «En sécurité», safe.", board='resume11')

chapter("À bientôt !", ['claire', 'ashok', 'ellie'], bg='sunset')
fr('claire', "[[sunset]]Bravo, Ashok ! Tu es arrivé, tu es resté calme. Et tu es revenu avec nous !", "Bravo, Ashok! You arrived, you stayed calm. And you came back with us!")
fr('ashok', "Merci, Claire ! Je suis fatigué, mais content.", "Thank you, Claire! I am tired, but happy.")
explain('ellie', "[[sunrise]]Congratulations, Ashok! Now you can tell a story in the past, with «avoir» and with «être». [[napali]]Next time, Alan tells the story of the dinosaurs, with a new past tense: the «imparfait». [[kauai]]Until then, say ten times a day: «je suis allé, je suis arrivé, je suis parti.» À bientôt!")
