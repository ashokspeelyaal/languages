# Episode 11 · Il y a 65 millions d'années (A2).  Markup: see jurassic-serie/dsl.py
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
from dsl import *

meta(num=11, title="Il y a 65 millions d'années", level='A2', slug='il-y-a-65-millions-dannees', rate='-15%',
     goal="L'imparfait  ·  imparfait ou passé composé ?  ·  il y a + durée")
alias({'T.': 'Té'})

# ---------------------------------------------------------------- boards
board('rappel10', "RAPPEL  ·  Épisode 10", [
 "<s>elle</s> <v>est</v> <e>partie</e>", "+<s>nous</s> <v>sommes</v> <e>arrivés</e>", "# the house of être: aller, venir, partir, arriver, sortir...",
 "<s>ils</s> <v>sont</v> <e>restés</e>", "+<s>elles</s> <v>sont</v> <e>sorties</e>", "# the participle agrees with the subject",
 "<s>je</s> <w>le</w> vois", "+<s>je</s> <w>l'</w><v>ai</v> vu", "# le / la / les go before the verb"])
board('form', "L'imparfait  ·  formation", [
 "<s>nous</s> regard<e>ons</e>", "# 1. take the « nous » form, drop -ons",
 "regard<w>-</w> + <e>ais · ais · ait · ions · iez · aient</e>", "# 2. add the endings",
 "<s>je</s> regard<e>ais</e> · <s>tu</s> regard<e>ais</e> · <s>il</s> regard<e>ait</e>", "+<s>nous</s> regard<e>ions</e> · <s>vous</s> regard<e>iez</e> · <s>ils</s> regard<e>aient</e>",
 "<s>nous</s> finiss<e>ons</e> = <s>je</s> finiss<e>ais</e>", "+<s>nous</s> avons = <s>j'</s><v>av</v><e>ais</e>", "# the same for every verb"])
board('etre', "Chaos !  (Ian Malcolm)", [
 "<s>nous</s> sommes", "# the « nous » form of être does not work",
 "<v>ét</v><e>ais</e> · <v>ét</v><e>ais</e> · <v>ét</v><e>ait</e>", "+<v>ét</v><e>ions</e> · <v>ét</v><e>iez</e> · <v>ét</v><e>aient</e>",
 "<s>j'</s><v>ét</v><e>ais</e> petit", "# I was small",
 "# only ONE exception. The endings stay the same!"])
board('usage', "Quand utiliser l'imparfait ?", [
 "<y>1.</y> la description", "+il <v>faisait</v> chaud · il y <v>avait</v> des forêts", "# it was hot · there were forests",
 "<y>2.</y> l'habitude", "+tous les jours, je <v>creusais</v>", "# every day I dug · I used to dig",
 "<y>3.</y> le décor", "+je <v>regardais</v> la télé...", "# I was watching TV... (the stage)"])
board('signaux', "Les mots-signaux", [
 "<e>IMPARFAIT</e>", "+tous les jours · toujours · souvent · d'habitude", "# habits, repeated",
 "<v>PASSÉ COMPOSÉ</v>", "+un jour · soudain · hier · tout à coup", "# one event, one moment"])
board('contraste', "Imparfait  +  passé composé", [
 "<e>imparfait</e> = le décor (the stage)", "+<e>=======================</e>",
 "<v>passé composé</v> = l'événement", "+<v>o</v>  (a dot, one moment)",
 "<s>Je</s> <e>dormais</e> quand le T. rex <v>est arrivé</v>.", "# I was sleeping when the T. rex arrived",
 "<s>Il</s> <e>pleuvait</e> quand nous <v>sommes sortis</v>.", "# it was raining when we went out"])
board('neg', "L'imparfait  ·  négatif et questions", [
 "<s>le T. rex</s> <w>ne</w> <v>vivait</v> <w>pas</w> au Jurassique", "# ne + imparfait + pas, like the present",
 "<s>je</s> <w>ne</w> <v>regardais</v> <w>pas</w>", "+<s>nous</s> <w>n'</w><v>avions</v> <w>pas</w> d'eau",
 "<w>Il n'y avait pas</w> de montagnes", "# there were no mountains",
 "<w>Est-ce que</w> <s>tu</s> <v>aimais</v> ça ?", "# did you like that?",
 "<s>Tu</s> <v>habitais</v> à Genk ?", "# did you live in Genk?"])
board('quiz', "Le décor ou l'événement ?", [
 "Alan <e>creusait</e> quand il <v>a trouvé</v> un fossile", "# stage . event",
 "Ashok <e>regardait</e> le film quand l'électricité <v>est partie</v>", "# stage . event",
 "Il <e>faisait</e> chaud. Soudain, un dinosaure <v>est arrivé</v>", "# stage . event",
 "<e>j'avais</e> un chien. Un jour, il <v>est parti</v>", "# habit . one moment"])
board('ilya', "il y a + durée  =  ago", [
 "il y a <y>deux jours</y>", "# two days ago",
 "il y a <y>trois ans</y>", "+il y a <y>cent ans</y>",
 "il y a <y>soixante-six millions d'années</y>", "# 66 million years ago: il y a = ago",
 "<w>il y a</w> + <w>un dinosaure</w> = there is...", "+<w>il y a</w> + <w>deux jours</w> = ... ago"])
board('resume11', "RÉSUMÉ  ·  Épisode 11", [
 "nous regard<w>ons</w> = <s>je</s> regard<e>ais</e>", "# endings: ais ais ait ions iez aient",
 "<v>ét</v><e>ais</e> : the only exception",
 "<e>imparfait</e> = description · habit · stage", "# il faisait chaud · tous les jours · je dormais",
 "<v>passé composé</v> = event", "# ... quand le T. rex est arrivé",
 "il y a + durée = ago"])
board('resume12', "10 mots clés", [
 "<y>le Jurassique</y> = the Jurassic", "+<y>le Crétacé</y> = the Cretaceous",
 "<y>l'époque</y> = the era", "+<y>longtemps</y> = a long time",
 "<y>la plume</y> = the feather", "+<y>le fossile</y> = the fossil",
 "<y>la montagne</y> = the mountain", "+<y>la météorite</y> = the meteorite",
 "<y>creuser</y> = to dig", "+<y>tous les jours</y> = every day"])

# ---------------------------------------------------------------- intro + rappel
chapter("Bienvenue !", ['alan', 'ashok'], bg='bones')
explain('alan', "[[bones]]Hello, Ashok. This is Alan. Today I am telling you a story, the oldest story there is: the story of the dinosaurs. And to tell a story about the past, you need a second past tense. "
 "[[trex]]Today: the imparfait, and how it works together with the passé composé. First, the «Rappel» of episode ten.")
chapter("Rappel · Épisode 10", ['alan'], bg='trex')
explain('alan', "Look at the board. "
 "[[+]]Movement verbs use «être»: «Elle est partie.»² «Nous sommes arrivés.»² "
 "[[+]]The participle agrees with the subject: «Ils sont restés.»² «Elles sont sorties.»² "
 "[[+]]And the pronouns «le, la, les» go before the verb: «Je le vois.»² «Je l'ai vu.»² Three quick questions.", board='rappel10')
atoi("Say: She left.", "Elle est partie.", img='bones', by='ashok')
atoi("Say: We arrived at the lab.", "Nous sommes arrivés au laboratoire.", img='trex', by='ashok')
atoi("Say: I saw it.", "Je l'ai vu.", img='bones', by='ashok')

# ---------------------------------------------------------------- scene 1
chapter("Scène 1 · L'histoire d'Alan", ['alan', 'ashok', 'ellie'], bg='forest', id='s1')
fr('alan', "[[forest]]Il y a {très longtemps|x|a very long time ago}, les dinosaures {vivaient|x|lived} partout. Il {faisait|x|it was (weather)} chaud. Il y {avait|x|there were} des forêts immenses.", "A very long time ago, dinosaurs lived everywhere. It was hot. There were huge forests.")
fr('ashok', "[[brachio]]Et qu'est-ce qu'ils {mangeaient|x|they ate} ?", "And what did they eat?")
fr('alan', "Les herbivores mangeaient des plantes. Les brachiosaures étaient très grands. Ils {mangeaient|x|ate} des feuilles tous les jours.", "The herbivores ate plants. The brachiosaurs were very big. They ate leaves every day.")
fr('ellie', "[[fossil]]Et toi, Alan ? Qu'est-ce que tu {faisais|x|you did} dans le désert ?", "And you, Alan? What did you do in the desert?")
fr('alan', "Moi, je {creusais|x|I dug} tous les jours. Je cherchais des {fossiles|m|fossils}. {Nous avions|x|we had} peu d'eau, mais nous étions contents.", "Me, I dug every day. I looked for fossils. We had little water, but we were happy.")

chapter("Pause ! · L'imparfait", ['ellie'])
explain('ellie', "Pause! Look at the verbs Alan used: «vivaient, faisait, avait, mangeaient, creusais.» All end in «ai» or «ait» or «aient». This is the imparfait: the tense for describing the past. And it is the easiest tense in French to build. "
 "[[+]]Step one: take the «nous» form of the present. «Nous regardons.» Remove the «ons»: you keep «regard». "
 "[[+]]Step two: add the endings: «ais, ais, ait, ions, iez, aient.»² Say it with me: «ais, ais, ait, ions, iez, aient.»² "
 "[[+]]So: «je regardais, tu regardais, il regardait»² and «nous regardions, vous regardiez, ils regardaient.»² Careful: the endings «ais», «ais», «ait», and «aient» sound the same! Only «ions» and «iez» sound different. "
 "[[+]]Same recipe for every verb. «Nous finissons» gives «je finissais.»² «Nous avons» gives «j'avais.»² «Nous faisons» gives «je faisais.»² And «nous vivons» gives «ils vivaient.»² Remember the spelling: with «nous», the ending «ions» is a «nous» ending, so «nous regardions» keeps the «ons» sound inside it.", board='form')
atoi("Say: I was watching.", "Je regardais.", img='forest', by='ashok')
atoi("Say: The dinosaurs lived in forests.", "Les dinosaures vivaient dans des forêts.", img='brachio', by='ashok')

chapter("Pause ! · Un seul chaos", ['malcolm'])
explain('malcolm', "Ian Malcolm here. You expect chaos, right? Good news: for once, there is almost none. "
 "[[+]]Only one verb breaks the recipe: «être». «Nous sommes» does not work. "
 "[[+]]The stem is «ét»: «j'étais, tu étais, il était, nous étions, vous étiez, ils étaient.»² "
 "[[+]]«J'étais petit.»² I was small. «Les brachiosaures étaient grands.»² "
 "Only the stem is chaotic. The endings are always the same. That is the most boring chaos in history.", board='etre')
atoi("Say: When I was little, I liked dinosaurs.", "Quand j'étais petit, j'aimais les dinosaures.", img='fossil', by='ashok')
atoi("Say: It was hot.", "Il faisait chaud.", img='forest', by='ashok')

chapter("Pause ! · Quand l'utiliser ?", ['alan'])
explain('alan', "Alan again. When do we use the imparfait? Three uses. "
 "[[+]]One: description. How things were. «Il faisait chaud.»² «Il y avait des forêts immenses.»² It is a photo of the past. "
 "[[+]]Two: habits. What you used to do, again and again. «Tous les jours, je creusais.»² Every day I dug, or I used to dig. «Nous avions un chien.»² We had a dog. "
 "[[+]]Three: the stage, the background, an action in progress. «Je regardais la télé...»² I was watching TV. Keep that third one in mind: it will be very useful in a minute.", board='usage')
atoi("Say: Every day, Alan dug.", "Tous les jours, Alan creusait.", img='fossil', by='ashok')
atoi("Say: We had a dog.", "Nous avions un chien.", img='forest', by='ashok')
chapter("Pause ! · Négatif et questions", ['ellie'])
explain('ellie', "Pause! Two small things, and you already know both. The negative and the question work exactly as in the present. "
 "[[+]]The negative wraps around the verb: «ne», the imparfait, «pas». «Le T. rex ne vivait pas au Jurassique.»² The T. rex did not live in the Jurassic. "
 "[[+]]«Je ne regardais pas.»² «Nous n'avions pas d'eau.»² Before a vowel, «ne» becomes «n'», and after a negative, «de l'eau» becomes «pas d'eau». "
 "[[+]]And «il y avait» becomes «il n'y avait pas»: «Il n'y avait pas de montagnes.»² There were no mountains. "
 "[[+]]Questions: «Est-ce que tu aimais ça?»² Did you like that? "
 "[[+]]Or just raise your voice: «Tu habitais à Genk?»² Did you live in Genk? One verb form in the imparfait translates «did», «was» and «used to». Nice and simple.", board='neg')
atoi("Say: T. rex did not live in the Jurassic.", "Le T. rex ne vivait pas au Jurassique.", img='trex', by='ashok')
replay('s1')

# ---------------------------------------------------------------- scene 2
chapter("Scène 2 · D'où vient le mot ?", ['ellie', 'ashok'], bg='jura1', id='s2')
fr('ashok', "[[jura1]]Ellie, c'est quoi, le Jurassique ? Pourquoi ce {mot|x|word} ?", "Ellie, what is the Jurassic? Why this word?")
fr('ellie', "Le mot « jurassique » vient du Jura. Ce sont des {montagnes|f|mountains} en France et en Suisse.", "The word “Jurassic” comes from the Jura. They are mountains in France and Switzerland.")
fr('ashok', "[[jura2]]Il y avait des dinosaures dans le Jura ?", "Were there dinosaurs in the Jura?")
fr('ellie', "Il y avait des {fossiles|m|fossils} dans les roches ! Un savant français a donné ce nom il y a presque deux cents ans.", "There were fossils in the rocks! A French scientist gave this name almost two hundred years ago.")
fr('ellie', "[[jura2]]Le {Jurassique|m|the Jurassic} a commencé il y a deux cents millions d'années. [[crater]]Le {Crétacé|m|the Cretaceous} a fini il y a soixante-six millions d'années.", "The Jurassic began two hundred million years ago. The Cretaceous ended sixty-six million years ago.")

chapter("Pause ! · Il y a + durée", ['ellie'])
explain('ellie', "Pause! You know «il y a» means «there is». But «il y a», plus a length of time, means «ago». "
 "[[+]]«Il y a deux jours.»² Two days ago. [[+]]«Il y a trois ans.»² Three years ago. «Il y a cent ans.»² "
 "[[+]]«Il y a soixante-six millions d'années.»² Sixty-six million years ago. Notice «d'années»: after a big number like «million», you say «de» or «d'». "
 "[[+]]Remember the two jobs of «il y a»: «Il y a un dinosaure»: there is a dinosaur. «Il y a deux jours»: two days ago. And the expression is not changing: it is always «il y a».", board='ilya')
atoi("Say: Sixty-five million years ago.", "Il y a soixante-cinq millions d'années.", img='crater', by='ashok')
atoi("Say: Two days ago.", "Il y a deux jours.", img='jura2', by='ashok')
replay('s2')

# ---------------------------------------------------------------- scene 3
chapter("Scène 3 · La correction de Malcolm", ['malcolm', 'ashok', 'alan'], bg='trex', id='s3')
fr('ashok', "[[trex]]Le T. rex vivait au Jurassique, non ?", "T. rex lived in the Jurassic, right?", id='m1')
fr('malcolm', "Attention ! Non. Le T. rex ne vivait pas au Jurassique. Il vivait au Crétacé, il y a environ soixante-six millions d'années.", "Careful! No. T. rex did not live in the Jurassic. It lived in the Cretaceous, about sixty-six million years ago.")
fr('ashok', "[[raptor]]Et les raptors étaient grands comme des hommes, non ?", "And the raptors were as big as men, right?")
fr('malcolm', "Pas les vrais ! Les vrais {vélociraptors|m|velociraptors} étaient petits, comme des {dindes|f|turkeys}. Et ils avaient des {plumes|f|feathers}.", "Not the real ones! The real velociraptors were small, like turkeys. And they had feathers.")
fr('ashok', "Des plumes ? Comme les oiseaux ?", "Feathers? Like birds?")
fr('alan', "[[fossil2]]Oui, Ashok. Les oiseaux sont les {cousins|x|cousins} des dinosaures. Il y a soixante-six millions d'années, une {météorite|f|meteorite} est tombée. Les dinosaures ont {disparu|x|disappeared}.", "Yes, Ashok. Birds are the cousins of dinosaurs. Sixty-six million years ago, a meteorite fell. The dinosaurs disappeared.")

chapter("Pause ! · Le décor et l'événement", ['alan'])
explain('alan', "Pause! Now the big idea of the episode. Two past tenses, two jobs. "
 "[[+]]The imparfait is the stage. It sets the scene: it is long, it is in progress, you do not see its start or its end. Imagine a long line. "
 "[[+]]The passé composé is the event. It is short. It happens at one moment. Imagine a dot on that line. "
 "[[+]]Put them together: «Je dormais quand le T. rex est arrivé.»² I was sleeping, that is the long line, when the T. rex arrived, that is the dot. The stage, then the event. "
 "[[+]]Another one: «Il pleuvait quand nous sommes sortis.»² It was raining, the stage, when we went out, the event. The little word «quand» often joins them. "
 "Ask yourself one question: is it the stage, or is it something that happened? Stage: imparfait. Happened: passé composé.", board='contraste')
explain('alan', "A tip: signal words. Some small words tell you the tense before you even read the verb. "
 "[[+]]Words for repetition: «tous les jours, toujours, souvent, d'habitude.»² «Toujours» is always, «souvent» is often, «d'habitude» is usually. These call for the imparfait, because a habit repeats. "
 "[[+]]Words for one moment: «un jour, soudain, hier, tout à coup.»² «Soudain» is suddenly. These call for the passé composé, because an event happens once. "
 "Compare: «Un jour, le T. rex est arrivé.»² One day, the T. rex arrived. And: «Tous les jours, le T. rex arrivait.»² Every day, the T. rex arrived. Same verb, different meaning, and the tense is how you hear it.", board='signaux')
explain('alan', "Let us practise the choice, with four examples. "
 "[[+]]«Alan creusait quand il a trouvé un fossile.»² Alan was digging, the long line, when he found a fossil, the dot. "
 "[[+]]«Ashok regardait le film quand l'électricité est partie.»² The film is the stage, the power cut is the event. "
 "[[+]]«Il faisait chaud et il y avait du soleil. Soudain, un dinosaure est arrivé.»² Two descriptions, then one event. "
 "[[+]]And a habit, then a single moment: «Quand j'étais petit, j'avais un chien. Un jour, il est parti.»² Look: «avais» is a habit and a description, «est parti» is the event. Notice that «parti» is the verb «partir», with «être», as in episode ten.", board='quiz')
atoi("Say: Alan was digging when he found a fossil.", "Alan creusait quand il a trouvé un fossile.", img='bones', by='ashok')
atoi("Say: I was sleeping when the T. rex arrived.", "Je dormais quand le T. rex est arrivé.", img='trex', by='ashok')
atoi("Say: The raptors had feathers.", "Les raptors avaient des plumes.", img='raptor', by='ashok')
atoi("Say: There were huge forests.", "Il y avait des forêts immenses.", img='forest', by='ashok')
replay('s3', skip=['m1'])

# ---------------------------------------------------------------- scene 4
chapter("Scène 4 · Quand j'étais petit", ['ashok', 'ellie', 'alan'], bg='kaveri', id='s4')
fr('ashok', "[[kaveri]]Quand j'étais {petit|x|little}, à Kulithalai, je regardais les films de dinosaures avec mon {frère|m|brother}.", "When I was little, in Kulithalai, I watched dinosaur films with my brother.")
fr('ellie', "Tu aimais ça ?", "Did you like that?")
fr('ashok', "[[tamil]]Oui ! J'aimais beaucoup les dinosaures. Nous avions un petit {cinéma|m|cinema} près de la maison. Il faisait chaud et il y avait beaucoup de monde.", "Yes! I liked dinosaurs a lot. We had a small cinema near the house. It was hot and there were lots of people.")
fr('alan', "Et ensuite ?", "And then?")
fr('ashok', "[[kaveri]]Un jour, je regardais le film quand l'électricité est partie ! Mon frère et moi, nous avons attendu dans le noir.", "One day, I was watching the film when the power went out! My brother and I waited in the dark.")
fr('ellie', "C'est une belle histoire, Ashok.", "That is a lovely story, Ashok.")

chapter("Oups ! · Les erreurs d'Ashok", ['ashok', 'alan'], bg='tamil')
fr('ashok', "[[tamil]]Hier, je regardais le film et l'électricité partait.", "Yesterday, I was watching the film and the power went out. (wrong)", mistake=True)
fr('alan', "Non, Ashok. Un événement, un moment : l'électricité est partie. Je regardais, mais l'électricité est partie.", "No, Ashok. An event, one moment: the power went out. I was watching, but the power went out.", mistake=True)
fr('ashok', "[[kaveri]]Et tous les jours, j'ai regardé la télé.", "And every day, I watched TV. (wrong)", mistake=True)
fr('alan', "Non. Une habitude : tous les jours, je regardais la télé.", "No. A habit: every day, I watched TV.", mistake=True)
atoi("Say: Every day, I watched TV.", "Tous les jours, je regardais la télé.", img='tamil', by='ashok')
atoi("Say: One day, the power went out.", "Un jour, l'électricité est partie.", img='kaveri', by='ashok')
replay('s4')

# ---------------------------------------------------------------- review À toi
chapter("Révision", ['ellie', 'alan'], bg='bones')
explain('ellie', "A last quick round, to be sure. Listen to the English, and answer in French, using the imparfait.")
atoi("Say: Alan was digging every day.", "Alan creusait tous les jours.", img='bones', by='ashok')
atoi("Say: It was hot and there were many dinosaurs.", "Il faisait chaud et il y avait beaucoup de dinosaures.", img='forest', by='ashok')

# ---------------------------------------------------------------- résumé
chapter("Résumé", ['ellie'], bg='jura2')
explain('ellie', "Résumé of episode eleven. "
 "[[+]]The imparfait: take the «nous» form, remove «ons», add «ais, ais, ait, ions, iez, aient.»² "
 "[[+]]The only exception: «être», stem «ét»: «j'étais.»² "
 "[[+]]Use it for description, habits and the stage: «Il faisait chaud.»² «Tous les jours, je creusais.»² "
 "[[+]]The passé composé is the event, the dot: «Je dormais quand le T. rex est arrivé.»² "
 "[[+]]And «il y a», plus a length of time, means «ago»: «Il y a soixante-six millions d'années.»²", board='resume11')
explain('ellie', "And ten key words. "
 "[[+]]«Le Jurassique», «le Crétacé.» [[+]]«L'époque», the era. «Longtemps», a long time. [[+]]«La plume», the feather. «Le fossile.» "
 "[[+]]«La montagne.» «La météorite.» [[+]]«Creuser», to dig. «Tous les jours», every day.", board='resume12')

chapter("À bientôt !", ['alan', 'ashok', 'ellie'], bg='kaveri')
fr('alan', "[[jura1]]Bravo, Ashok ! Maintenant, tu sais raconter le passé.", "Bravo, Ashok! Now you know how to tell the past.")
fr('ashok', "Merci, Alan ! Il y a quelques mois, je ne parlais pas français. Maintenant, je raconte des histoires !", "Thank you, Alan! A few months ago, I did not speak French. Now I tell stories!")
explain('ellie', "[[crater]]Next time, the last episode of A2: the future, «lui» and «leur», «y» and «en», and your opinion of the films. [[jura1]]Until then, tell a little story in the past every day, with the stage and the event. À bientôt!")
