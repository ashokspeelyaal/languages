# Episode 9 · Qu'est-ce qui s'est passé ? (A2).  Markup: see jurassic-serie/dsl.py
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
from dsl import *

meta(num=9, title="Qu'est-ce qui s'est passé ?", level='A2', slug='quest-ce-qui-sest-passe', rate='-15%',
     goal="passé composé avec avoir  ·  participes réguliers et irréguliers  ·  ne…pas / rien / jamais  ·  hier, cette nuit, il y a…")

# ---------------------------------------------------------------- boards
board('rappel8', "RAPPEL  ·  Épisode 8", [
 "<s>je</s> <v>veux</v> · <s>tu</s> <v>peux</v> · <s>il</s> <v>doit</v>", "# vouloir · pouvoir · devoir + infinitive",
 "<w>plus</w> grand <w>que</w> · <w>moins</w> · <w>aussi</w>", "+le <w>plus</w> grand · le <w>meilleur</w>",
 "<y>mon</y> chapeau · <y>ma</y> tente · <y>mes</y> notes", "+<y>son</y> chapeau · <y>sa</y> tente · <y>ses</y> notes",
 "# the possessive agrees with the thing, not the owner"])
board('pc', "Le passé composé  ·  avec avoir", [
 "<s>j'</s><v>ai</v> <e>trouvé</e> des traces", "# I found / I have found tracks",
 "<s>tu</s> <v>as</v> <e>trouvé</e> · <s>il</s> <v>a</v> <e>trouvé</e>",
 "<s>nous</s> <v>avons</v> <e>trouvé</e> · <s>vous</s> <v>avez</v> <e>trouvé</e>", "+<s>ils</s> <v>ont</v> <e>trouvé</e>",
 "<v>AVOIR</v> (présent) + <e>PARTICIPE PASSÉ</e>", "# only avoir changes · the participle stays the same",
 "<w>Qu'est-ce qui s'est passé ?</w>", "# what happened? · a fixed question for now"])
board('part', "Le participe passé  ·  réguliers", [
 "<w>-er</w>  =  <e>é</e>", "+trouv<w>er</w> = trouv<e>é</e> · mesur<w>er</w> = mesur<e>é</e>",
 "<w>-ir</w>  =  <e>i</e>", "+fin<w>ir</w> = fin<e>i</e> · dorm<w>ir</w> = dorm<e>i</e>",
 "<w>-re</w>  =  <e>u</e>", "+entend<w>re</w> = entend<e>u</e> · attend<w>re</w> = attend<e>u</e>",
 "<s>nous</s> <v>avons</v> entend<e>u</e> un bruit", "# the same participle for every person"])
board('chaos1', "Chaos !  (Ian Malcolm)  ·  1", [
 "faire = <e>fait</e>", "+prendre = <e>pris</e>", "+voir = <e>vu</e>",
 "avoir = <e>eu</e>", "+être = <e>été</e>", "+boire = <e>bu</e>",
 "# prendre family: comprendre = compris · apprendre = appris"])
board('chaos2', "Chaos !  (Ian Malcolm)  ·  2", [
 "dire = <e>dit</e>", "+écrire = <e>écrit</e>",
 "ouvrir = <e>ouvert</e>", "# an -ir verb, but not -i!",
 "mettre = <e>mis</e>", "+pouvoir = <e>pu</e>",
 "vouloir = <e>voulu</e>", "+devoir = <e>dû</e>",
 "# learn them as 13 small blocks"])
board('neg', "La négation  ·  les questions", [
 "<s>je</s> <w>n'</w><v>ai</v> <w>pas</w> <e>vu</e>", "# the brackets go around AVOIR",
 "<s>je</s> <w>n'</w><v>ai</v> <w>rien</w> <e>vu</e>", "# I saw nothing",
 "<s>je</s> <w>n'</w><v>ai</v> <w>jamais</w> <e>vu</e>", "# I never saw",
 "<s>Tu</s> <v>as</v> <e>vu</e> le dinosaure ?", "+<w>Qu'est-ce que</w> <s>tu</s> <v>as</v> <e>fait</e> ?"])
board('temps', "Les mots du temps", [
 "<y>hier</y> · <y>hier soir</y>", "# yesterday · last night",
 "<y>ce matin</y> · <y>cette nuit</y>", "# this morning · tonight / last night",
 "<y>la semaine dernière</y>", "# last week",
 "<w>il y a</w> <y>deux heures</y>", "# two hours ago",
 "<y>Hier</y>, <s>j'</s><v>ai</v> <e>regardé</e> un film"])
board('resume9', "RÉSUMÉ  ·  Épisode 9", [
 "<v>avoir</v> + <e>participe</e>", "# j'ai trouvé · tu as vu · ils ont fini",
 "<w>-er</w> = <e>é</e> · <w>-ir</w> = <e>i</e> · <w>-re</w> = <e>u</e>",
 "<e>fait · pris · vu · eu · été · bu</e>", "+<e>dit · écrit · ouvert · mis · pu · voulu · dû</e>",
 "<s>je</s> <w>n'</w><v>ai</v> <w>pas</w> / <w>rien</w> / <w>jamais</w> <e>vu</e>",
 "<y>hier · ce matin · cette nuit · il y a</y> deux heures"])
board('resume10', "10 mots clés", [
 "<y>la trace</y> = the track", "+<y>l'empreinte</y> = the footprint",
 "<y>l'enquête</y> = the investigation", "+<y>le témoin</y> = the witness",
 "<y>trouver</y> = to find", "+<y>ouvrir</y> = to open",
 "<y>fermer</y> = to close", "+<y>dormir</y> = to sleep",
 "<y>rien</y> = nothing", "+<y>jamais</y> = never"])

# ---------------------------------------------------------------- intro + rappel
chapter("Bienvenue !", ['alan', 'ashok'], bg='track1')
explain('alan', "[[track1]]Bonjour, Ashok. Alan here. Today we talk about the past. I am a palaeontologist, so the past is my job. [[fence]]Today something happened in the park. We are going to say what happened: «j'ai trouvé», «tu as vu», «ils ont ouvert». First, the «Rappel» of episode eight, with Ellie.")
chapter("Rappel · Épisode 8", ['ellie'], bg='raptor')
explain('ellie', "[[raptor]]Hello again. Look at the board. "
 "[[+]]Three irregular verbs with an infinitive: «je veux voir les raptors»², «tu peux attendre»², «il doit rester.»² "
 "[[+]]Comparing: «plus grand que», «le plus grand», and the exception «le meilleur.»² "
 "[[+]]And possessives: «mon chapeau», «ma tente», «mes notes»², «son chapeau.»² Three questions.", board='rappel8')
atoi("Say: I want to see the raptors.", "Je veux voir les raptors.", img='raptor')
atoi("Say: Blue is more intelligent than Charlie.", "Blue est plus intelligente que Charlie.", img='trex', by='ashok')
atoi("Say: It's his hat.", "C'est son chapeau.", img='hall1')

# ---------------------------------------------------------------- scene 1
chapter("Scène 1 · Quelque chose ne va pas", ['claire', 'owen', 'ashok'], bg='fence', id='s1')
fr('claire', "[[fence]]{Qu'est-ce qui s'est passé|x|what happened} ? Owen, il y a un problème ?", "What happened? Owen, is there a problem?")
fr('owen', "[[fence_b]]Cette nuit, {j'ai entendu|x|I heard} un {bruit|m|noise}. Un grand bruit.", "Tonight, I heard a noise. A big noise.")
fr('claire', "Tu as vu le dinosaure ?", "Did you see the dinosaur?")
fr('owen', "[[fence]]Non. {J'ai regardé|x|I looked at} l'{enclos|m|enclosure}. {La porte est ouverte|x|the door is open} !", "No. I looked at the enclosure. The door is open!")
fr('ashok', "[[fence_b]]Ouverte ? Et il n'y a pas de raptor dans l'enclos !", "Open? And there is no raptor in the enclosure!")
fr('claire', "[[fence]]Oh là là. Appelons Alan. Il est {paléontologue|x|palaeontologist}. Il va {chercher|x|to look for} des {traces|f|tracks, traces}.", "Oh dear. Let's call Alan. He is a palaeontologist. He is going to look for tracks.")

chapter("Pause ! · Le passé composé", ['alan'])
explain('alan', "Pause! Owen said: «J'ai entendu un bruit.»² I heard a noise. And Claire asked: «Tu as vu le dinosaure?»² Did you see the dinosaur? This is the passé composé, the main past tense. "
 "[[+]][[fence_b]]Look at «j'ai trouvé des traces.»² I found tracks, or: I have found tracks. French has just one tense for both. "
 "[[+]]«Tu as trouvé.»² «Il a trouvé.»² You can see two parts. First «avoir», in the present: «j'ai, tu as, il a.» Then the participle: «trouvé.» "
 "[[+]][[track4]]«Nous avons trouvé.»² «Vous avez trouvé.»² «Ils ont trouvé.»² "
 "[[+]]So the formula is: «avoir», in the present, plus the past participle. Only «avoir» changes. The participle stays the same for every person. "
 "[[+]][[fence]]And one fixed question for now: «Qu'est-ce qui s'est passé?»² What happened? Learn it as a block. We will explain it in the next episode.", board='pc')
atoi("Say: We heard a noise.", "Nous avons entendu un bruit.", img='fence_b')
atoi("Say: They found an egg.", "Ils ont trouvé un œuf.", img='egg')
replay('s1')

# ---------------------------------------------------------------- scene 2
chapter("Scène 2 · Alan enquête", ['alan', 'ashok'], bg='track1', id='s2')
fr('alan', "[[track1]]Bonjour. {J'ai trouvé|x|I found} des traces. J'ai {mesuré|x|measured} les traces. Elles sont grandes.", "Hello. I found tracks. I measured the tracks. They are big.")
fr('ashok', "[[track2]]Tu as trouvé les traces devant l'enclos ?", "Did you find the tracks in front of the enclosure?")
fr('alan', "Oui. J'ai {photographié|x|photographed} les traces. J'ai pris des {notes|f|notes}.", "Yes. I photographed the tracks. I took notes.")
fr('alan', "[[track3]]Regarde : un {doigt|m|toe, finger}, deux doigts, trois doigts. C'est un raptor.", "Look: one toe, two toes, three toes. It is a raptor.")
fr('alan', "[[fence_b]]Il a {sauté|x|jumped} la clôture ? Non. Il a {cassé|x|broke} la clôture.", "Did he jump the fence? No. He broke the fence.")
fr('ashok', "Il a eu faim ?", "Was he hungry?")
fr('alan', "[[track4]]{Je ne sais pas|x|I don't know}. Nous allons chercher.", "I don't know. We are going to look.")

chapter("Pause ! · Les participes réguliers", ['alan'])
explain('alan', "Pause! How do you make the participle? For regular verbs, look at the ending of the infinitive. "
 "[[+]][[track2]]First, the big family, the -er verbs. «Er» becomes «é.»² «Trouver», «trouvé.»² «Mesurer», «mesuré.»² «Photographier», «photographié.»² "
 "[[+]]Second, the -ir verbs. «Ir» becomes «i.»² «Finir», «fini.»² «Dormir», «dormi.»² «J'ai dormi.»² I slept. "
 "[[+]][[track3]]Third, the -re verbs. «Re» becomes «u.»² «Entendre», «entendu.»² «Attendre», «attendu.»² «Répondre», «répondu.»² "
 "[[+]]So: «Nous avons entendu un bruit.»² The participle is the same for every person. For the pronunciation, remember: «trouvé», «fini», «entendu»: each ends in one simple sound.", board='part')
atoi("Say: Did you eat?", "Tu as mangé ?", img='track2')
atoi("Say: I slept.", "J'ai dormi.", img='track3', by='ashok')

chapter("Pause ! · Le chaos du passé", ['malcolm'])
explain('malcolm', "Ian Malcolm. Of course there is chaos, Ashok. Many very common verbs do not follow the rule. But the good news: there are only thirteen to learn, and you already know the verbs. "
 "[[+]]First, «faire», «fait»: «j'ai fait.»² «Prendre», «pris»: «j'ai pris un café.»² «Voir», «vu»: «j'ai vu un raptor.»² "
 "[[+]]«Avoir», «eu»: «j'ai eu peur.»² Yes, even «avoir» uses «avoir»! «Être», «été»: «j'ai été content.»² «Boire», «bu»: «j'ai bu de l'eau.»² "
 "And the family of «prendre»: «comprendre» gives «compris», «apprendre» gives «appris.»² Never say «prendu», it is chaos.", board='chaos1')
explain('malcolm', "Second part of the chaos list. "
 "[[+]]«Dire», «dit»: «j'ai dit non.»² «Écrire», «écrit»: «j'ai écrit une note.»² "
 "[[+]]«Ouvrir», «ouvert»: «elle a ouvert la porte.»² «Ouvrir» is an -ir verb, but its participle is not «i.» Chaos! "
 "[[+]]«Mettre», «mis»: «j'ai mis le chapeau.»² «Pouvoir», «pu»: «il a pu entrer.»² "
 "[[+]]«Vouloir», «voulu»: «j'ai voulu voir Blue.»² «Devoir», «dû»: «j'ai dû attendre.»² Thirteen blocks. Say them with me: «fait, pris, vu, eu, été, bu. Dit, écrit, ouvert, mis, pu, voulu, dû.»²", board='chaos2')
atoi("Say: I saw a raptor.", "J'ai vu un raptor.", img='raptor')
atoi("Say: She opened the door.", "Elle a ouvert la porte.", img='fence')
atoi("Say: I took a coffee.", "J'ai pris un café.", img='lab', by='ashok')

# ---------------------------------------------------------------- scene 3
chapter("Scène 3 · Les témoins", ['alan', 'hammond', 'ashok'], bg='lab', id='s3')
fr('alan', "[[lab]]Monsieur Hammond, {tu as vu|x|did you see} le dinosaure ?", "Mr Hammond, did you see the dinosaur?")
fr('hammond', "[[cleaning]]Non, je n'ai {rien|x|nothing} vu. J'ai {dormi|x|slept}.", "No, I saw nothing. I slept.")
fr('alan', "[[fossilab]]Tu as entendu un bruit ?", "Did you hear a noise?")
fr('hammond', "[[lab]]Non, je n'ai pas entendu de bruit. Je n'ai {jamais|x|never} de problème !", "No, I did not hear a noise. I never have problems!")
fr('alan', "[[ctrl1]]Ashok, et toi ? Qu'est-ce que tu as fait {hier soir|x|last night} ?", "Ashok, and you? What did you do last night?")
fr('ashok', "[[ctrl2]]J'ai regardé un {film|m|film}. Un film sur les dinosaures !", "I watched a film. A film about dinosaurs!")
fr('ashok', "[[ctrl1]]J'ai prendu un café et j'ai mangé un sandwich.", "I prendu a coffee and I ate a sandwich. (wrong: prendu)", id='m1', mistake=True)
fr('alan', "[[lab]]Attention : prendre, c'est le chaos. On dit : j'ai pris un café.", "Careful: prendre is chaos. We say: I took a coffee.", mistake=True)
fr('ashok', "[[ctrl2]]Ah oui ! J'ai pris un café. Et je n'ai vu pas le raptor.", "Ah yes! I took a coffee. And I saw not the raptor. (wrong word order)", mistake=True)
fr('alan', "[[lab]]Non : je n'ai pas vu le raptor. Le « pas » est après « ai ».", "No: I did not see the raptor. The « pas » comes after « ai ».", mistake=True)
fr('ashok', "Je n'ai pas vu le raptor. Merci !", "I did not see the raptor. Thanks!")

chapter("Pause ! · La négation", ['ellie'])
explain('ellie', "Pause! Hammond said: «Je n'ai rien vu.»² And Ashok made a small mistake: «je n'ai vu pas.» The negative has brackets, like «ne, pas». In the passé composé, the brackets go around the auxiliary, «avoir». "
 "[[+]]«Je n'ai pas vu.»² Not «vu pas». «Ne» becomes «n'» before «ai». «Il n'a pas dormi.»² «Nous n'avons pas entendu.»² The participle comes last. "
 "[[+]]Replace «pas» with «rien», and you get nothing: «Je n'ai rien vu.»² «Elle n'a rien entendu.»² "
 "[[+]]Replace «pas» with «jamais», and you get never: «Je n'ai jamais vu de raptor.»² "
 "[[+]]And questions. Simply raise your voice: «Tu as vu le dinosaure?»² Or use «qu'est-ce que»: «Qu'est-ce que tu as fait?»² What did you do? The participle «fait» comes at the end.", board='neg')
atoi("Say: I did not sleep.", "Je n'ai pas dormi.", img='fossilab')
atoi("Say: I saw nothing.", "Je n'ai rien vu.", img='cleaning', by='ashok')
atoi("Say: What did you do?", "Qu'est-ce que tu as fait ?", img='ctrl1')
replay('s3')

chapter("Pause ! · Hier, cette nuit", ['alan'])
explain('alan', "Pause! The past needs time words. Here are the ones from today. "
 "[[+]]«Hier»² means yesterday. «Hier soir»² is last night, or yesterday evening. "
 "[[+]][[ctrl1]]«Ce matin»² is this morning. «Cette nuit»² means tonight, or during the night that just passed. Owen said: «Cette nuit, j'ai entendu un bruit.»² "
 "[[+]]«La semaine dernière»² is last week. Notice that «dernière» comes after the noun here. "
 "[[+]][[clock]]And a very useful block: «il y a», plus a time. «Il y a deux heures.»² Two hours ago. «Il y a trois jours»² is three days ago. «Il y a» means ago. "
 "[[+]][[ctrl2]]Put it together: «Hier, j'ai regardé un film.»² Yesterday I watched a film. The time word goes first, or at the end. Both are fine.", board='temps')
atoi("Say: Yesterday I watched the film.", "Hier, j'ai regardé le film.", img='ctrl2')
atoi("Say: Two hours ago.", "Il y a deux heures.", img='clock', by='ashok')

# ---------------------------------------------------------------- scene 4
chapter("Scène 4 · Le verdict de Malcolm", ['malcolm', 'owen', 'ashok'], bg='dark', id='s4')
fr('malcolm', "[[dark]]{J'ai dit|x|I said} : le chaos ! Vous n'avez pas {écouté|x|listened} !", "I said: chaos! You did not listen!")
fr('owen', "[[track4]]Nous avons écouté, Ian. {J'ai fermé|x|I closed} la porte hier soir.", "We listened, Ian. I closed the door last night.")
fr('malcolm', "[[fence]]Et alors ? Qu'est-ce qui s'est passé ?", "And so? What happened?")
fr('owen', "[[raptor]]Blue a ouvert la porte. Elle a pris le sandwich d'Alan.", "Blue opened the door. She took Alan's sandwich.")
fr('ashok', "[[jungle]]Blue a ouvert la porte ? Elle a été très intelligente !", "Blue opened the door? She was very intelligent!")
fr('malcolm', "[[dark]]Le chaos a un plan, Ashok.", "Chaos has a plan, Ashok.")
fr('ashok', "Maintenant, j'ai compris ! J'ai {compris|x|understood} le passé composé !", "Now I understand! I understood the passé composé!")

# ---------------------------------------------------------------- résumé
chapter("Résumé", ['alan'], bg='sunrise1')
explain('alan', "Résumé of episode nine. "
 "[[+]]The passé composé: «avoir», plus the participle. «J'ai trouvé.»² «Ils ont fini.»² "
 "[[+]]Regular participles: «er» gives «é», «ir» gives «i», «re» gives «u.»² "
 "[[+]]Thirteen chaos participles: «fait, pris, vu, eu, été, bu.»² «Dit, écrit, ouvert, mis, pu, voulu, dû.»² "
 "[[+]]The negative goes around «avoir»: «Je n'ai pas vu.»² «Je n'ai rien vu.»² «Je n'ai jamais vu.»² "
 "[[+]]And the time words: «hier, ce matin, cette nuit, il y a deux heures.»²", board='resume9')
explain('alan', "And ten key words. "
 "[[+]]«La trace», the track. «L'empreinte», the footprint. [[+]]«L'enquête», the investigation. «Le témoin», the witness. "
 "[[+]]«Trouver», to find. «Ouvrir», to open. [[+]]«Fermer», to close. «Dormir», to sleep. "
 "[[+]]«Rien», nothing. «Jamais», never.", board='resume10')

chapter("À bientôt !", ['alan', 'ashok', 'owen'], bg='sunrise3')
fr('owen', "[[sunrise3]]Bravo, Ashok ! Tu as bien travaillé !", "Bravo, Ashok! You worked well!")
fr('ashok', "Merci ! Hier, j'ai appris le passé. Il y a une heure, j'ai fait des erreurs. Maintenant, j'ai fini !", "Thanks! Yesterday I learned the past. An hour ago I made mistakes. Now I have finished!")
explain('alan', "[[heli_land]]Very good, Ashok. Next time, the chase! [[jungle]]The dinosaur is running through the park. [[kauai1]]You will learn the second family of the passé composé, the verbs that use «être», for movement, and the little words «le, la, les.» [[sunrise3]]Until then, say «j'ai, tu as, il a» plus a participle, ten times a day. À bientôt!")
