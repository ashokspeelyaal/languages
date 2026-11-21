# Episode 12 · Le retour (A2, end).  Markup: see jurassic-serie/dsl.py
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
from dsl import *

meta(num=12, title="Le retour", level='A2', slug='le-retour', rate='-15%',
     goal="Le futur simple  ·  lui / leur  ·  y et en  ·  Donner son opinion  ·  Révision A2")

# ---------------------------------------------------------------- boards
board('rappel11', "RAPPEL  ·  Épisode 11", [
 "<s>je</s> regard<e>ais</e> · <s>tu</s> regard<e>ais</e> · <s>il</s> regard<e>ait</e>", "+<s>nous</s> regard<e>ions</e> · <s>vous</s> regard<e>iez</e> · <s>ils</s> regard<e>aient</e>",
 "<v>être</v> = <s>j'</s><e>étais</e>", "# the only irregular stem",
 "<y>imparfait</y> = the stage", "+<y>passé composé</y> = the event",
 "<y>il y a</y> + time = ago", "# il y a soixante-cinq millions d'années"])
board('futur', "Le futur simple", [
 "<y>INFINITIF</y> + <e>ai · as · a · ons · ez · ont</e>",
 "<s>je</s> parler<e>ai</e> · <s>tu</s> parler<e>as</e> · <s>il</s> parler<e>a</e>", "+<s>nous</s> parler<e>ons</e> · <s>vous</s> parler<e>ez</e> · <s>ils</s> parler<e>ont</e>",
 "-re verbs: <v>prendre</v> = <s>je</s> prendr<e>ai</e>", "# the final E disappears",
 "<y>Demain</y>, <s>je</s> rentrer<e>ai</e> en Belgique", "+Le bateau partir<e>a</e> à sept heures",
 "# je vais partir = soon, planned · je partirai = will leave"])
board('futirr', "Chaos du futur  (Ian Malcolm)", [
 "<v>être</v> = <e>ser-</e> · <v>avoir</v> = <e>aur-</e>", "+<v>aller</v> = <e>ir-</e> · <v>faire</v> = <e>fer-</e>",
 "<v>venir</v> = <e>viendr-</e> · <v>voir</v> = <e>verr-</e>", "+<v>pouvoir</v> = <e>pourr-</e>",
 "<v>vouloir</v> = <e>voudr-</e> · <v>devoir</v> = <e>devr-</e>",
 "<s>je</s> <e>ser</e>ai · <s>j'</s><e>ir</e>ai · <s>nous</s> <e>verr</e>ons", "# same endings: only the stem changes",
 "# the future always has an R before the ending"])
board('luileur', "lui  ·  leur", [
 "<y>à</y> + person = <e>lui</e> (him, her) · <e>leur</e> (them)",
 "<s>Je</s> parle <y>à Claire</y> = <s>je</s> <e>lui</e> parle", "+<s>Je</s> parle <y>à Owen</y> = <s>je</s> <e>lui</e> parle",
 "<s>Je</s> téléphone <y>à Alan et Ellie</y>", "+= <s>je</s> <e>leur</e> téléphone",
 "<s>Je</s> <w>ne</w> <e>lui</e> parle <w>pas</w>", "# before the verb, between ne and the verb",
 "<s>Je</s> <e>lui</e> écris une carte"])
board('y', "Le pronom  y", [
 "<y>y</y> = there  (à, en, dans + place)",
 "Tu vas <y>à Paris</y> ? = Oui, <s>j'</s><e>y</e> vais", "# I go there",
 "Il habite <y>en Belgique</y> = il <e>y</e> habite",
 "<s>Je</s> <w>n'</w><e>y</e> vais <w>pas</w>", "# I am not going there",
 "# y comes before the verb, like lui and leur"])
board('en', "Le pronom  en", [
 "<y>en</y> = some / of it / of them",
 "Tu veux <y>des œufs</y> ? = Oui, <s>j'</s><e>en</e> veux deux", "# keep the number!",
 "Tu as <y>des frères</y> ? = <s>J'</s><e>en</e> ai un",
 "Tu bois <y>du café</y> ? = <s>Je</s> <w>n'</w><e>en</e> bois <w>pas</w>", "# en before the verb"])
board('avis', "Donner son opinion", [
 "<w>Je pense que</w> + phrase", "+<w>Je trouve que</w> + phrase",
 "<y>À mon avis</y>, + phrase", "# in my opinion",
 "<s>Je</s> <v>préfère</v> + nom", "+<w>Mon film préféré</w>, c'est…",
 "<w>Quel est</w> ton film préféré ?", "# préféré agrees: ma couleur préférée",
 "<s>Je</s> pense <w>que</w> les raptors sont <e>fantastiques</e>"])
board('timeline', "LA LIGNE DU TEMPS", [
 "<y>il y a longtemps</y> : <e>imparfait</e>", "# je mangeais · il faisait chaud (ep. 11)",
 "<y>hier</y> : <e>passé composé</e>", "# j'ai mangé · je suis parti (ep. 9, 10)",
 "<y>maintenant</y> : <e>présent</e>", "# je mange · je me lève (ep. 1 à 8)",
 "<y>bientôt</y> : <e>futur proche</e>", "# je vais manger (ep. 6)",
 "<y>demain</y> : <e>futur simple</e>", "# je mangerai (ep. 12)"])
board('rev1', "RÉVISION A2  ·  (1)", [
 "<s>je</s> <e>me</e> lève · <s>tu</s> <e>te</e> lèves · <s>il</s> <e>se</e> lève", "# ep. 7 · reflexive verbs",
 "<w>du</w> pain · <w>de la</w> viande · <w>des</w> œufs", "+<w>pas de</w> café",
 "<v>peux · veux · dois</v> + infinitif", "# ep. 8",
 "<w>plus</w> grand <w>que</w> · <w>le plus</w> grand · <e>meilleur</e>",
 "<w>mon · ma · mes</w> · <w>son · sa · ses</w>"])
board('rev2', "RÉVISION A2  ·  (2)", [
 "<s>j'</s><v>ai</v> <e>mangé</e> · <s>j'</s><v>ai</v> <e>vu</e>", "# ep. 9 · avoir + participe",
 "<s>je</s> <v>suis</v> <e>parti</e> · <s>elle</s> <v>est</v> parti<e>e</e>", "# ep. 10 · être + agreement",
 "Je <e>le</e> vois · je <e>l'</e>ai vu", "# le · la · les before the verb",
 "<s>je</s> regard<e>ais</e> · <s>il</s> <e>faisait</e> chaud", "# ep. 11 · imparfait",
 "<s>je</s> parler<e>ai</e> · <e>lui</e> · <e>leur</e> · <e>y</e> · <e>en</e>", "# ep. 12"])
board('resume12', "RÉSUMÉ  ·  Épisode 12", [
 "<y>infinitif</y> + <e>ai · as · a · ons · ez · ont</e>", "# futur simple",
 "<v>ser- · aur- · ir- · fer- · viendr- · verr-</v>", "# irregular stems",
 "<e>lui</e> = à lui, à elle · <e>leur</e> = à eux",
 "<e>y</e> = there · <e>en</e> = some, of it",
 "<w>Je pense que</w> · <w>Je trouve que</w> · <y>À mon avis</y>"])
board('resume13', "10 mots clés", [
 "<y>le retour</y> = the return", "+<y>rentrer</y> = to go home",
 "<y>le bateau</y> = the boat", "+<y>un jour</y> = one day",
 "<y>la carte postale</y> = the postcard", "+<y>le souvenir</y> = the souvenir",
 "<y>préféré(e)</y> = favourite", "+<y>à mon avis</y> = in my opinion",
 "<y>la suite</y> = the sequel", "+<y>sympa</y> = nice"])

# ---------------------------------------------------------------- intro + rappel
chapter("Bienvenue !", ['ellie', 'ashok'], bg='heli_land')
explain('ellie', "[[heli_land]]Bonjour, Ashok! This is the last episode of A2. Today: the future, the little words «lui» and «leur», the pronouns «y» and «en», and how to give your opinion. [[kauai1]]Then we review the whole level. But first, the «Rappel» of episode eleven.")
chapter("Rappel · Épisode 11", ['ellie'], bg='kauai1')
explain('ellie', "Look at the board. "
 "[[+]]The imparfait: take «nous», drop «ons», and add «ais, ais, ait, ions, iez, aient.» «Je regardais.»² "
 "[[+]]Only «être» is irregular: «j'étais.»² "
 "[[+]]The imparfait is the stage. The passé composé is the event. «Je dormais quand le T. rex est arrivé.»² "
 "[[+]]And «il y a» plus a time means ago. Now three quick questions.", board='rappel11')
atoi("Say: It was hot.", "Il faisait chaud.", img='kauai1')
atoi("Say: The raptors had feathers.", "Les raptors avaient des plumes.", img='raptor')
atoi("Say: Sixty-five million years ago.", "Il y a soixante-cinq millions d'années.", img='jura')

# ---------------------------------------------------------------- scene 1
chapter("Scène 1 · Le départ", ['hammond', 'claire', 'ashok'], bg='boat1', id='s1')
fr('hammond', "[[boat1]]Ashok, {demain|x|tomorrow}, tu rentreras en Belgique. Le {bateau|m|the boat} partira à sept heures.", "Ashok, tomorrow you will go home to Belgium. The boat will leave at seven.")
fr('ashok', "[[genk]]Oui. Je rentrerai à Genk. Je serai fatigué, mais content.", "Yes. I will go home to Genk. I will be tired, but happy.")
fr('claire', "[[kauai1]]Tu reviendras un jour ?", "Will you come back one day?")
fr('ashok', "[[boat1]]Oui, je reviendrai {un jour|x|one day} ! Je reviendrai avec mon frère.", "Yes, I will come back one day! I will come back with my brother.")
fr('hammond', "[[boat2]]Tu verras, le {retour|m|the return trip} sera long. Bateau, avion, train. Nous verrons.", "You will see, the trip back will be long. Boat, plane, train. We will see.")

chapter("Pause ! · Le futur simple", ['ellie'])
explain('ellie', "Pause! Mr Hammond and Ashok used a new tense: the simple future. In English: I will. And it is very easy, because there is no stem to learn. You take the whole infinitive, and you add the endings. "
 "[[+]]«Infinitif», plus: «ai, as, a, ons, ez, ont.» Do these look familiar? They are the verb «avoir»! The future is the infinitive plus «avoir». "
 "[[+]]«Je parlerai.»² «Tu parleras.»² «Il parlera.»² «Nous parlerons.»² «Vous parlerez.»² «Ils parleront.»² "
 "[[+]]Verbs in «re» lose the last E: «prendre» becomes «je prendrai.»² «Nous prendrons le bateau.»² "
 "[[+]]«Demain, je rentrerai en Belgique.»² «Le bateau partira à sept heures.»² "
 "One last tip. «Je vais partir» is the near future: soon, planned. «Je partirai» is the simple future: it will happen, a bit further away. Both are correct.", board='futur')
atoi("Say: Tomorrow I will go back to Belgium.", "Demain, je rentrerai en Belgique.", img='genk', by='ashok')
atoi("Say: I will come back one day.", "Je reviendrai un jour.", img='boat1', by='ashok')

chapter("Pause ! · Le chaos du futur", ['malcolm'])
explain('malcolm', "Ian Malcolm. Chaos, once more! Some verbs have a special stem in the future. But the endings are always the same, so you only learn the stem. "
 "[[+]]«Être»: «ser». «Je serai.»² «Avoir»: «aur». «J'aurai.»² «Aller»: «ir». «J'irai.»² «Faire»: «fer». «Je ferai.»² "
 "[[+]]«Venir»: «viendr». «Je viendrai.»² «Tu reviendras», that is what Ashok said. «Voir»: «verr». «Nous verrons.»² "
 "«Pouvoir»: «pourr». «Je pourrai.»² "
 "[[+]]«Vouloir»: «voudr». «Je voudrai.»² «Devoir»: «devr». «Je devrai.»² "
 "[[+]]So: «je serai, j'irai, nous verrons.»² Here is the pattern. The future always has an R sound before the ending. If you hear an R, it is the future.", board='futirr')
atoi("Say: We will see.", "Nous verrons.", img='boat2')
atoi("Say: I will be happy.", "Je serai content.", img='kauai2', by='ashok')
replay('s1')

# ---------------------------------------------------------------- scene 2
chapter("Scène 2 · Des messages", ['owen', 'ashok', 'ellie'], bg='harbour', id='s2')
fr('owen', "[[harbour]]Ashok, tu écris à tes amis ?", "Ashok, are you writing to your friends?")
fr('ashok', "[[sunset]]Oui. J'écris à mon frère.", "Yes. I am writing to my brother.")
fr('ashok', "Je parle à lui tous les jours.", "I talk to him every day.", mistake=True)
fr('owen', "[[harbour]]Non, on dit : je lui parle.", "No, we say: I talk to him.", mistake=True)
fr('ashok', "[[harbour]]Ah oui ! Je lui parle tous les jours.", "Ah yes! I talk to him every day.")
fr('owen', "[[sunset]]Et ta mère ? Tu lui téléphones ?", "And your mother? Do you phone her?")
fr('ashok', "[[harbour]]Oui, je lui téléphone ce soir. Je leur écris une {carte postale|f|postcard}, à mes amis de Genk.", "Yes, I phone her tonight. I write them a postcard, to my friends in Genk.")
fr('ellie', "[[sunset]]Après la Belgique, tu vas à Paris ?", "After Belgium, are you going to Paris?")
fr('ashok', "[[harbour]]Oui, j'y vais en mars. Mon ami y habite.", "Yes, I am going there in March. My friend lives there.")

chapter("Pause ! · lui et leur", ['ellie'])
explain('ellie', "Pause! Ashok made a mistake, and Owen corrected him. Owen's topic is pronouns, so here is the pronoun for «to someone». In English: I talk TO him. In French: «je parle À Claire.» [[+]]When you replace «à» plus a person, you use «lui» for one person, and «leur» for several people. "
 "[[+]]«Lui» is for him and for her. «Je parle à Claire.» becomes «je lui parle.»² "
 "«Je parle à Owen.» also becomes «je lui parle.»² The same word for a man or a woman. "
 "[[+]]«Je téléphone à Alan et Ellie.» There are two people. So: «je leur téléphone.»² "
 "[[+]]The pronoun goes before the verb. In the negative, it sits between «ne» and the verb: «Je ne lui parle pas.»² "
 "[[+]]And «écrire», to write. «J'écris une carte à mon frère» becomes «je lui écris une carte.»² Never say «je parle à lui.»", board='luileur')
atoi("Say: I talk to him.", "Je lui parle.", img='sunset', by='ashok')
atoi("Say: I phone them.", "Je leur téléphone.", img='harbour', by='ashok')

chapter("Pause ! · Le pronom y", ['ellie'])
explain('ellie', "Pause! Owen asked: «Tu vas à Paris?» Ashok answered: «Oui, j'y vais.» This little «y» means: there. It replaces «à» or «en» or «dans», plus a place. "
 "[[+]]You know the sentence «Tu vas à Paris?» «Oui, j'y vais.»² I go there. "
 "[[+]]«Il habite en Belgique.» «Il y habite.»² He lives there. "
 "[[+]]In the negative: «Je n'y vais pas.»² Notice «ne» becomes «n'». "
 "[[+]]And again: «y» comes before the verb, just like «lui» and «leur».", board='y')
atoi("Are you going to Paris? Say: Yes, I am going there.", "Oui, j'y vais.", img='boat1', by='ashok')
atoi("Say: I am not going there.", "Je n'y vais pas.", img='jura', by='ashok')
replay('s2')

# ---------------------------------------------------------------- scene 3
chapter("Scène 3 · Les souvenirs", ['hammond', 'ashok', 'alan'], bg='stall1', id='s3')
fr('hammond', "[[stall1]]Bonjour, Ashok ! Tu cherches des {souvenirs|m|souvenirs} ?", "Hello, Ashok! Are you looking for souvenirs?")
fr('ashok', "[[stall2]]Oui. Je voudrais des cartes postales, s'il vous plaît.", "Yes. I would like some postcards, please.")
fr('hammond', "[[eggs]]Voilà. Tu veux des œufs en chocolat ? Ils coûtent cinq euros.", "Here you go. Do you want some chocolate eggs? They cost five euros.")
fr('ashok', "[[stall2]]Oui, j'en veux deux !", "Yes, I want two!")
fr('alan', "[[stall1]]Tu as des frères, Ashok ?", "Do you have brothers, Ashok?")
fr('ashok', "J'en ai un. Il aime beaucoup les dinosaures.", "I have one. He likes dinosaurs a lot.")
fr('alan', "[[stall2]]Alors, achète un fossile pour lui ! Tu as assez d'argent ?", "Then buy a fossil for him! Do you have enough money?")
fr('ashok', "Oui, j'en ai assez. Merci !", "Yes, I have enough. Thanks!")

chapter("Pause ! · Le pronom en", ['ellie'])
explain('ellie', "Pause! Ashok said: «J'en veux deux.» [[+]]The pronoun «en» means: some of it, or some of them. It replaces a noun with «des», «du», or «de la». "
 "[[+]]«Tu veux des œufs?» «Oui, j'en veux deux.»² I want two of them. Important: when you use «en», keep the number. Never say «je veux» alone, say «j'en veux deux.» "
 "[[+]]«Tu as des frères?» «J'en ai un.»² I have one. "
 "[[+]]And the negative: «Tu bois du café?» «Non, je n'en bois pas.»² I do not drink any. «En» comes before the verb, like all these little pronouns.", board='en')
atoi("Do you want eggs? Say: Yes, I want two.", "Oui, j'en veux deux.", img='eggs', by='ashok')
atoi("Say: I have one.", "J'en ai un.", img='stall1', by='ashok')

# ---------------------------------------------------------------- scene 4
chapter("Scène 4 · Le film préféré", ['ellie', 'alan', 'ashok'], bg='terrace', id='s4')
fr('ellie', "[[terrace]]Ashok, quel est ton {film|m|film} préféré ?", "Ashok, which is your favourite film?")
fr('ashok', "Mon film préféré, c'est le premier film. Je l'ai vu cinq fois !", "My favourite film is the first film. I have seen it five times!")
fr('alan', "[[kauai2]]À mon {avis|m|opinion}, le premier film est le meilleur.", "In my opinion, the first film is the best.")
fr('ellie', "Moi, je préfère {la suite|f|the sequel}. Je pense que les paysages sont fantastiques.", "Me, I prefer the sequel. I think the landscapes are fantastic.")
fr('ashok', "[[terrace]]Je pense que les raptors sont fantastiques ! Et Owen est très {sympa|x|nice}.", "I think the raptors are fantastic! And Owen is very nice.")
fr('alan', "Je trouve que les ordinateurs sont moins sympa. Mais je regarde les films avec plaisir.", "I find that computers are less nice. But I watch the films with pleasure.")

chapter("Scène 5 · Le dernier soir", ['malcolm', 'owen', 'ashok'], bg='sunset', id='s5')
fr('malcolm', "[[sunset]]Moi, je trouve que les films sont trop longs. Mais les {acteurs|m|actors} sont fantastiques.", "Me, I find that the films are too long. But the actors are fantastic.")
fr('owen', "[[harbour]]Mon film préféré, c'est le dernier. Je l'ai vu trois fois.", "My favourite film is the last one. I have seen it three times.")
fr('ashok', "[[kuli]]Quand j'étais petit, à Kulithalai, je regardais les films avec mon frère. [[genk]]Maintenant, à Genk, je les regarde le soir.", "When I was little, in Kulithalai, I watched the films with my brother. Now, in Genk, I watch them in the evening.")
fr('malcolm', "Tu es ingénieur informatique, Ashok. À mon avis, tu aimes aussi les ordinateurs !", "You are an IT engineer, Ashok. In my opinion, you like computers too!")

chapter("Pause ! · L'opinion", ['ellie'])
explain('ellie', "Pause! Everybody gave an opinion. You can do it too, with a few fixed blocks. "
 "[[+]]«Je pense que», plus a full sentence: «Je pense que les raptors sont fantastiques.»² «Je trouve que», I find that: «Je trouve que Blue est intelligente.»² "
 "[[+]]«À mon avis», in my opinion, then a sentence: «À mon avis, le premier film est le meilleur.»² "
 "[[+]]To say what you like best: «Je préfère», plus a noun: «Je préfère la suite.»² "
 "[[+]]And «mon film préféré, c'est…»² «Quel est ton film préféré?»² "
 "«Préféré» is an adjective, so it agrees: «ma couleur préférée.» "
 "[[+]]A last example, and keep «que»: «Je pense qu'Owen est sympa.»² «Que» becomes «qu'» before a vowel. In English you can say: I think Owen is nice. In French, never drop «que».", board='avis')
atoi("Say: In my opinion, the first film is the best.", "À mon avis, le premier film est le meilleur.", img='terrace', by='ashok')
atoi("Say: I think that Owen is nice.", "Je pense qu'Owen est sympa.", img='kauai2', by='ashok')
atoi("Say: My favourite film is the first film.", "Mon film préféré, c'est le premier film.", img='sunset', by='ashok')
replay('s4')

# ---------------------------------------------------------------- A2 review
chapter("Révision A2", ['ellie', 'alan', 'malcolm'], bg='kauai2')
explain('ellie', "Ashok, you have finished the six episodes of A2. This is the review of everything. Look at the timeline. "
 "[[+]]Long ago, the imparfait: «je mangeais.» [[+]]Yesterday, the passé composé: «j'ai mangé», «je suis parti.» "
 "[[+]]Now, the present: «je mange.» [[+]]Soon, the near future: «je vais manger.» [[+]]Tomorrow, the simple future: «je mangerai.» Five tenses, one line. "
 "This is the whole of A2.", board='timeline')
explain('ellie', "First board. "
 "[[+]]Episode seven: reflexive verbs: «je me lève.»² "
 "[[+]]The partitive: «du pain, de la viande, des œufs», and «pas de café.»² "
 "[[+]]Episode eight: «peux, veux, dois», plus an infinitive. "
 "[[+]]The comparative, the superlative and «meilleur». [[+]]And «mon, ma, mes», «son, sa, ses.»", board='rev1')
explain('ellie', "Second board. "
 "[[+]]Episode nine: the passé composé with «avoir.» «J'ai mangé.» «J'ai vu.»² "
 "[[+]]Episode ten: «être», and the agreement: «elle est partie.»² "
 "[[+]]And «le, la, les» before the verb: «je le vois, je l'ai vu.» "
 "[[+]]Episode eleven: the imparfait. [[+]]And today: the future, «lui», «leur», «y», «en.» Now ten review questions.", board='rev2')
atoi("Say: I get up at seven.", "Je me lève à sept heures.", img='lab', by='ashok')
atoi("Say: I don't drink coffee.", "Je ne bois pas de café.", img='stall2', by='ashok')
atoi("Say: I want to see the raptors.", "Je veux voir les raptors.", img='raptor', by='ashok')
atoi("Say: The T. rex is the biggest.", "Le T. rex est le plus grand.", img='trex')
atoi("Say: It's his hat.", "C'est son chapeau.", img='jackets')
atoi("Say: We heard a noise.", "Nous avons entendu un bruit.", img='jungle1')
atoi("Say: She left.", "Elle est partie.", img='boat1')
atoi("Do you see the T. rex? Say: Yes, I see it.", "Oui, je le vois.", img='trex', by='ashok')
atoi("Say: I was sleeping when the T. rex arrived.", "Je dormais quand le T. rex est arrivé.", img='hall1', by='ashok')
atoi("Say: I did not see anything.", "Je n'ai rien vu.", img='quarry', by='ashok')

# ---------------------------------------------------------------- résumé
chapter("Résumé", ['ellie'], bg='sunset')
explain('ellie', "Résumé of episode twelve. "
 "[[+]]The simple future: the infinitive, plus «ai, as, a, ons, ez, ont.» «Je parlerai.»² "
 "[[+]]The irregular stems: «ser, aur, ir, fer, viendr, verr.» «Nous verrons.»² "
 "[[+]]«Lui» and «leur»: «je lui parle, je leur téléphone.»² "
 "[[+]]«Y» for there, «en» for some: «j'y vais, j'en veux deux.»² "
 "[[+]]And opinions: «je pense que, je trouve que, à mon avis.»²", board='resume12')
explain('ellie', "And ten key words. "
 "[[+]]«Le retour», the return. «Rentrer», to go home. [[+]]«Le bateau», the boat. «Un jour», one day. [[+]]«La carte postale», the postcard. «Le souvenir», the souvenir. "
 "[[+]]«Préféré», favourite. «À mon avis», in my opinion. [[+]]«La suite», the sequel. «Sympa», nice.", board='resume13')

chapter("Au revoir !", ['hammond', 'claire', 'ashok'], bg='boat2')
fr('hammond', "[[boat2]]Au revoir, Ashok ! Tu reviendras !", "Goodbye, Ashok! You will come back!")
fr('claire', "[[kauai1]]Bon voyage, Ashok. Je t'écrirai une carte.", "Have a good trip, Ashok. I will write you a card.")
fr('ashok', "[[boat1]]Merci à tous ! Je reviendrai. Et j'irai en France !", "Thanks everyone! I will come back. And I will go to France!")
chapter("Félicitations !", ['ellie', 'alan', 'ashok'], bg='kauai2')
fr('alan', "[[kauai2]]Bravo, Ashok ! Tu parles bien français !", "Bravo, Ashok! You speak French well!")
fr('ellie', "[[sunset]]Félicitations, Ashok ! Tu as fini le niveau A2 !", "Congratulations, Ashok! You have finished level A2!")
fr('ashok', "[[kauai1]]Merci ! Je suis très content ! À bientôt !", "Thank you! I am very happy! See you soon!")
