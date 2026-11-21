# Episode 8 · Les raptors (A2).  Markup: see jurassic-serie/dsl.py
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
from dsl import *

meta(num=8, title="Les raptors", level='A2', slug='les-raptors', rate='-15%',
     goal="pouvoir · vouloir · devoir  ·  finir, attendre  ·  plus … que  ·  mon, ma, mes")
alias({'Blue': 'Blou', 'Echo': 'Écho'})

# ---------------------------------------------------------------- boards
board('rappel7', "RAPPEL  ·  Épisode 7", [
 "<s>je</s> <w>me</w> <v>lève</v> · <s>tu</s> <w>te</w> <v>lèves</v> · <s>il</s> <w>se</w> <v>lève</v>",
 "<s>je</s> <w>ne</w> <w>me</w> <v>lève</v> <w>pas</w>", "# I don't get up",
 "<e>du</e> café · <e>de la</e> viande · <e>de l'</e>eau · <e>des</e> fruits",
 "<w>pas de</w> café", "# after a negative: only « de »",
 "<v>bois</v> · <v>bois</v> · <v>boit</v> · <v>buvons</v> · <v>buvez</v> · <v>boivent</v>", "# boire: Malcolm's chaos in a glass"])
board('tutoie', "Tu ou vous ?", [
 "<s>Vous</s> <v>êtes</v> Ashok ?", "# formal: episode 1 and episode 7",
 "<s>Tu</s> <v>es</v> Ashok ?", "# friends, colleagues, young people",
 "On se <v>tutoie</v> ?", "# shall we use « tu » with each other?"])
board('modaux1', "pouvoir  ·  vouloir", [
 "<s>je</s> <v>peux</v> · <s>tu</s> <v>peux</v> · <s>il</s> <v>peut</v>", "+<s>nous</s> <v>pouvons</v> · <s>vous</s> <v>pouvez</v> · <s>ils</s> <v>peuvent</v>", "# pouvoir = can",
 "<s>je</s> <v>veux</v> · <s>tu</s> <v>veux</v> · <s>il</s> <v>veut</v>", "+<s>nous</s> <v>voulons</v> · <s>vous</s> <v>voulez</v> · <s>ils</s> <v>veulent</v>", "# vouloir = to want",
 "<y>pouvoir · vouloir</y> + <e>INFINITIF</e>", "+Tu <v>peux</v> <e>attendre</e> · Je <v>veux</v> <e>voir</e> Blue"])
board('modaux2', "devoir  ·  la négation", [
 "<s>je</s> <v>dois</v> · <s>tu</s> <v>dois</v> · <s>il</s> <v>doit</v>", "+<s>nous</s> <v>devons</v> · <s>vous</s> <v>devez</v> · <s>ils</s> <v>doivent</v>", "# devoir = must · to have to",
 "<s>Nous</s> <v>devons</v> <e>faire attention</e>",
 "<s>Tu</s> <w>ne</w> <v>peux</v> <w>pas</w> <e>entrer</e>", "+<s>Tu</s> <w>ne</w> <v>dois</v> <w>pas</w> <e>courir</e>",
 "<s>Je</s> <v>voudrais</v> <e>un café</e>", "# I would like: polite"])
board('irre', "Les verbes en -ir et en -re", [
 "<s>je</s> fin<e>is</e> · <s>tu</s> fin<e>is</e> · <s>il</s> fin<e>it</e>", "+<s>nous</s> fin<e>issons</e> · <s>vous</s> fin<e>issez</e> · <s>ils</s> fin<e>issent</e>",
 "<s>j'</s>attend<e>s</e> · <s>tu</s> attend<e>s</e> · <s>il</s> attend", "+<s>nous</s> attend<e>ons</e> · <s>vous</s> attend<e>ez</e> · <s>ils</s> attend<e>ent</e>",
 "choisir · réussir · grandir", "+répondre · entendre · perdre", "# same endings as finir / attendre"])
board('compar', "Comparer", [
 "<w>plus</w> · <w>moins</w> · <w>aussi</w> + <e>ADJECTIF</e> + <w>que</w>", "# more · less · as … as",
 "Le T. rex est <w>plus</w> <e>grand</e> <w>que</w> le raptor", "+Delta est <w>moins</w> <e>calme</e> <w>que</w> Blue",
 "<m>le</m> / <f>la</f> / les <w>plus</w> + <e>ADJECTIF</e>", "+Le T. rex est <m>le</m> <w>plus</w> <e>grand</e>", "+Blue est <f>la</f> <w>plus</w> <e>intelligent</e><f>e</f>"])
board('meilleur', "Chaos : bon = meilleur", [
 "bon = good · <v>meilleur</v> = better",
 "Ce café est <v>meilleur</v> que le thé",
 "<m>le</m> <v>meilleur</v> · <f>la</f> <v>meilleure</v>", "# never « plus bon »"])
board('poss', "Les possessifs", [
 "<y>mon</y> · <y>ma</y> · <y>mes</y>", "<y>ton</y> · <y>ta</y> · <y>tes</y>", "<y>son</y> · <y>sa</y> · <y>ses</y>",
 "<y>notre</y> · <y>nos</y>   <y>votre</y> · <y>vos</y>   <y>leur</y> · <y>leurs</y>",
 "<m>mon</m> chapeau · <f>ma</f> clé · mes clés", "# the word matches the THING, not the owner",
 "<e>mon</e> amie  (ma + vowel = mon)",
 "le chapeau <w>d'</w>Alan = <y>son</y> chapeau"])
board('resume8', "RÉSUMÉ  ·  Épisode 8", [
 "<v>peux</v> · <v>veux</v> · <v>dois</v> + <e>INFINITIF</e>", "# Tu peux attendre · Je veux voir · Nous devons partir",
 "<w>ne</w> <v>peux</v> <w>pas</w> + inf.", "# the negative wraps the first verb",
 "fin<e>is</e> · attend<e>s</e> · attend<e>ent</e>",
 "<w>plus</w> / <w>moins</w> / <w>aussi</w> + ADJ + <w>que</w>", "+<m>le</m> / <f>la</f> <w>plus</w> + ADJ · <v>meilleur</v>",
 "<y>mon</y> · <y>ma</y> · <y>mes</y> · <y>son</y> · <y>sa</y> · <y>ses</y>", "# the thing owned decides"])
board('resume9', "10 mots clés", [
 "<y>le dresseur</y> = the trainer", "+<y>l'enclos</y> = the paddock",
 "<y>entrer</y> = to enter", "+<y>attendre</y> = to wait",
 "<y>finir</y> = to finish", "+<y>entendre</y> = to hear",
 "<y>rapide</y> = fast", "+<y>calme</y> = calm",
 "<y>le bruit</y> = the noise", "+<y>faire attention</y> = to be careful"])

# ---------------------------------------------------------------- intro + rappel
chapter("Bienvenue !", ['ellie', 'ashok'], bg='trail')
explain('ellie', "[[trail]]Bonjour, Ashok! Welcome to A2, and welcome to episode eight. Today you meet Owen, the raptor trainer. You will learn to say what you can, want and must do, to compare things, and to say whose things they are. "
 "[[forest]]But first, the «Rappel» of episode seven.")
chapter("Rappel · Épisode 7", ['ellie'], bg='forest')
explain('ellie', "Look at the board. "
 "[[+]]The reflexive verbs: «je me lève, tu te lèves, il se lève.»² "
 "[[+]]In the negative: «Je ne me lève pas.»² "
 "[[+]]The partitive: «du café, de la viande, de l'eau, des fruits.»² "
 "[[+]]After a negative, only «de»: «Je ne bois pas de café.»² "
 "[[+]]And the verb «boire»: «je bois, nous buvons, ils boivent.»² Three quick questions.", board='rappel7')
atoi("Say: I get up at seven.", "Je me lève à sept heures.", img='forest')
atoi("Say: I don't drink coffee.", "Je ne bois pas de café.", img='trail', by='ashok')
atoi("Say: There is a lot of water.", "Il y a beaucoup d'eau.", img='jungle1')

# ---------------------------------------------------------------- scene 1
chapter("Scène 1 · Voici mes raptors", ['owen', 'ashok', 'claire'], bg='raptor', id='s1')
fr('owen', "[[raptor]]{Bonjour|x|hello}, Ashok. Je suis Owen. Je suis {dresseur|x|trainer} de raptors.", "Hello, Ashok. I am Owen. I am a raptor trainer.")
fr('owen', "[[raptor2]]Voici mes raptors. Ils s'appellent Blue, Charlie, Delta et Echo.", "Here are my raptors. They are called Blue, Charlie, Delta and Echo.")
fr('owen', "[[raptor3]]Blue est la plus intelligente. Elle est très calme.", "Blue is the most intelligent. She is very calm.")
fr('ashok', "[[raptor]]Bonjour, Owen. Je suis Ashok. Je suis de Kulithalai, en Inde, mais j'habite à Genk, en Belgique. Je suis ingénieur informatique.", "Hello, Owen. I am Ashok. I am from Kulithalai, in India, but I live in Genk, in Belgium. I am an IT engineer.")
fr('ashok', "[[raptor2]]J'adore les films de dinosaures ! Mais j'ai un peu peur.", "I love dinosaur films! But I am a little scared.")
fr('claire', "[[raptor3]]Ashok, {on se tutoie|x|shall we use tu} ? Je m'appelle Claire.", "Ashok, shall we use tu? My name is Claire.")
fr('ashok', "[[raptor]]D'accord, Claire. Avec plaisir !", "OK, Claire. With pleasure!")

chapter("Pause ! · Tu ou vous ?", ['ellie'])
explain('ellie', "Pause! A tiny one, but important. In the last episode, Claire said «Vous êtes Ashok?», very formal. Today she asks: «On se tutoie?»² Shall we say «tu» to each other? "
 "[[+]]«Vous» is formal. «Vous êtes Ashok?»² "
 "[[+]]«Tu» is for friends, colleagues and young people. «Tu es Ashok?»² Once someone proposes, you both switch, and you keep it. "
 "[[+]]«On se tutoie?»² The verb is «tutoyer», to use «tu». And «on» means «we» in everyday speech. A good rule: wait for the older or senior person to suggest it. From now on, Claire says «tu» to you.", board='tutoie')
atoi("Say: Shall we use tu?", "On se tutoie ?", img='raptor3', by='ashok')
replay('s1')

# ---------------------------------------------------------------- scene 2
chapter("Scène 2 · L'enclos", ['owen', 'ashok', 'claire'], bg='fence', id='s2')
fr('owen', "[[fence]]Voici {l'enclos|m|the paddock}. Tu ne peux pas {entrer|x|to enter}.", "Here is the paddock. You cannot enter.")
fr('ashok', "Pourquoi ? Je veux voir Blue !", "Why? I want to see Blue!")
fr('owen', "[[claw]]Tu dois {attendre|x|to wait} ici. Je finis mon travail dans dix minutes.", "You must wait here. I finish my work in ten minutes.")
fr('ashok', "[[fence]]D'accord. Mais je veux voir Blue {maintenant|x|now} !", "OK. But I want to see Blue now!")
fr('owen', "[[raptor4]]Tu veux voir Blue ? Alors, tu dois {faire attention|x|be careful}. Tu ne dois pas courir.", "You want to see Blue? Then you must be careful. You must not run.")
fr('claire', "[[fence]]Les raptors {entendent|x|they hear} tout. Écoute ! Blue entend {un bruit|m|a noise}.", "The raptors hear everything. Listen! Blue hears a noise.")
fr('ashok', "[[claw]]Moi, j'entends mon cœur ! Je suis un peu {nerveux|x|nervous}.", "Me, I hear my heart! I am a little nervous.")

chapter("Pause ! · Pouvoir, vouloir, devoir", ['malcolm'])
explain('malcolm', "Ian Malcolm here. Owen said: «Tu ne peux pas entrer.»² «Tu dois attendre.»² «Tu veux voir Blue?»² Three verbs, three exceptions, and I adore them. «Pouvoir», can. «Vouloir», to want. «Devoir», must. "
 "[[+]]First «pouvoir»: «je peux, tu peux, il peut, nous pouvons, vous pouvez, ils peuvent.»² Notice: «je» and «tu» are the same, «peux». "
 "[[+]]Now «vouloir»: «je veux, tu veux, il veut, nous voulons, vous voulez, ils veulent.»² Same pattern: x, x, t. "
 "[[+]]And now the good news. The formula for all of them is simple: the verb, conjugated, plus an infinitive. Exactly like English: I can wait. «Tu peux attendre.»² «Je veux voir Blue.»² The second verb never changes.", board='modaux1')
explain('malcolm', "Next, «devoir», must, or to have to. "
 "[[+]]«Je dois, tu dois, il doit, nous devons, vous devez, ils doivent.»² "
 "[[+]]«Nous devons faire attention.»² We must be careful. «Je dois partir.»² I must leave. «Faire attention» is an expression: to be careful. "
 "[[+]]The negative wraps around the first verb, the conjugated one. «Tu ne peux pas entrer.»² You cannot enter. «Tu ne dois pas courir.»² You must not run. "
 "[[+]]And a polite bonus, an expression: «Je voudrais un café.»² I would like a coffee. It is softer than «je veux». Use it in a café!", board='modaux2')
atoi("Say: I want to see the raptors.", "Je veux voir les raptors.", img='raptor2', by='ashok')
atoi("Say: Can you wait?", "Tu peux attendre ?", img='fence')
atoi("Say: We must be careful.", "Nous devons faire attention.", img='claw')

chapter("Pause ! · Finir et attendre", ['ellie'])
explain('ellie', "Pause! Owen said: «Je finis mon travail.»² And Claire said: «Les raptors entendent tout.»² Two new families of regular verbs: the verbs in -ir, like «finir», and the verbs in -re, like «attendre». "
 "[[+]]«Finir», to finish: «je finis, tu finis, il finit.»² Then «nous finissons, vous finissez, ils finissent.»² The plural gets «iss», in the middle. "
 "[[+]]«Attendre», to wait. Careful with the first form: «j'attends.»² Now all of it: «j'attends, tu attends, il attend.»² Then «nous attendons, vous attendez, ils attendent.»² Look: «il attend» has no ending, the D is silent. "
 "[[+]]And many verbs follow the same patterns. Like «finir»: «choisir», to choose, «réussir», to succeed, «grandir», to grow. Like «attendre»: «répondre», to answer, «entendre», to hear, «perdre», to lose. Same endings, nothing new to learn.", board='irre')
atoi("Say: They are waiting.", "Ils attendent.", img='fence')
atoi("Say: I finish my work.", "Je finis mon travail.", img='raptor4', by='ashok')
replay('s2')

# ---------------------------------------------------------------- scene 3
chapter("Scène 3 · Qui est le plus grand ?", ['owen', 'ashok', 'malcolm'], bg='trex', id='s3')
fr('owen', "[[trex]]Regarde le T. rex. Il est plus grand que le raptor.", "Look at the T. rex. He is bigger than the raptor.")
fr('owen', "[[raptor]]Mais le raptor est plus {rapide|x|fast} que le T. rex. Il est aussi plus intelligent.", "But the raptor is faster than the T. rex. He is also more intelligent.")
fr('ashok', "[[raptor3]]Et Blue ? Elle est plus intelligente que Charlie ?", "And Blue? Is she more intelligent than Charlie?")
fr('owen', "[[raptor2]]Oui. Blue est la plus intelligente. Delta est moins calme que Blue. Echo est aussi rapide que Charlie.", "Yes. Blue is the most intelligent. Delta is less calm than Blue. Echo is as fast as Charlie.")
fr('ashok', "[[trex2]]Et le T. rex ? C'est le plus grand ?", "And the T. rex? Is he the biggest?")
fr('owen', "Oui. Il est le plus grand, mais il n'est pas le plus {lent|x|slow}.", "Yes. He is the biggest, but he is not the slowest.")
fr('malcolm', "[[uta]]Pour moi, le chaos est {meilleur|x|better} que l'ordre. Et le café est meilleur que le thé !", "For me, chaos is better than order. And coffee is better than tea!")

chapter("Pause ! · Comparer", ['ellie'])
explain('ellie', "Pause! Owen compared the dinosaurs: «Il est plus grand que le raptor.»² More big than. It is one single formula. "
 "[[+]]The formula: «plus», more, «moins», less, or «aussi», as, then the adjective, then «que», than. «Plus grand que.»² «Moins calme que.»² «Aussi rapide que.»² "
 "[[+]]Examples. «Le T. rex est plus grand que le raptor.»² «Delta est moins calme que Blue.»² «Echo est aussi rapide que Charlie.»² Easy: always «que» to finish. "
 "[[+]]Now the superlative, the biggest: add «le», «la» or «les», in front of «plus». The formula: «le, la, les», plus «plus», plus the adjective. "
 "«Le T. rex est le plus grand.»² "
 "And the adjective still agrees, as in episode three. This raptor is female, so «Blue est la plus intelligente.»² With an E at the end.", board='compar')
explain('malcolm', "Malcolm, of course, with the exception. In English, good, better, best. French too! [[+]]«Bon» means good. But «better» is «meilleur», not «plus bon». "
 "[[+]]«Ce café est meilleur que le thé.»² "
 "[[+]]And the best: «le meilleur», and for a feminine noun, «la meilleure.»² «Le meilleur café.»² «La meilleure idée.»² One exception only, so it is a good deal.", board='meilleur')
atoi("Say: Blue is more intelligent than Charlie.", "Blue est plus intelligente que Charlie.", img='raptor3')
atoi("Say: The T. rex is the biggest.", "Le T. rex est le plus grand.", img='trex2', by='ashok')
atoi("Say: This coffee is better than tea.", "Ce café est meilleur que le thé.", img='uta')

chapter("Oups !", ['malcolm', 'ashok'], bg='uta')
fr('ashok', "[[uta]]Le café est plus bon que le thé !", "Coffee is more good than tea! (wrong)")
fr('malcolm', "[[raptor4]]Non, Ashok. On ne dit pas « plus bon ». On dit : meilleur. Le café est meilleur que le thé.", "No, Ashok. We don't say 'plus bon'. We say: meilleur. Coffee is better than tea.")
fr('ashok', "[[trex2]]Ah oui. Le café est meilleur que le thé. Merci !", "Ah yes. Coffee is better than tea. Thanks!")
replay('s3')

# ---------------------------------------------------------------- scene 4
chapter("Scène 4 · C'est à qui ?", ['owen', 'ashok', 'claire'], bg='hat', id='s4')
fr('ashok', "[[hat]]Regarde, {un chapeau|m|a hat} ! C'est ton chapeau, Owen ?", "Look, a hat! Is it your hat, Owen?")
fr('owen', "Non, ce n'est pas mon chapeau. C'est le chapeau d'Alan. C'est son chapeau.", "No, it is not my hat. It is Alan's hat. It is his hat.")
fr('claire', "[[keys]]Ashok, où sont tes {clés|f|keys} ? Et ta tablette ?", "Ashok, where are your keys? And your tablet?")
fr('ashok', "[[bag]]Mes clés sont dans mon sac. Ma tablette est sur la table.", "My keys are in my bag. My tablet is on the table.")
fr('owen', "[[raptor2]]Voici mon amie Claire. C'est notre parc.", "Here is my friend Claire. It is our park.")
fr('claire', "[[fence]]Et ce sont nos raptors. Ils aiment leur enclos.", "And they are our raptors. They like their paddock.")

chapter("Pause ! · Mon, ma, mes", ['ellie'])
explain('ellie', "Pause! Look at what Owen and Claire said: «mon chapeau, ton chapeau, son chapeau, ma tablette, mes clés, notre parc, leur enclos.» These are the possessives. It is just like English «my, your, his», but with one big difference. "
 "[[+]]«My» has three forms: «mon, ma, mes.»² Masculine singular, feminine singular, and plural. «Mon chapeau.»² «Ma clé.»² «Mes clés.»² "
 "[[+]]Same for «your», to a friend: «ton, ta, tes.»² «Ton chapeau.»² «Ta tablette.»² «Ta clé.»² «Tes clés.»² "
 "[[+]]And for «his» or «her»: «son, sa, ses.»² «Son chapeau.»² «Sa tablette.»² «Sa clé.»² «Ses œufs.»² "
 "[[+]]For «our», «your» to several people, and «their», only singular and plural: «notre, nos.»² «Votre, vos.»² «Leur, leurs.»² «Notre parc.»² «Nos raptors.»² «Leur enclos.»² "
 "[[+]]Now the big difference. The word agrees with the thing owned, not with the owner. «Son chapeau» can mean his hat or her hat. Alan owns it, but the hat is masculine, so «son». "
 "[[+]]The exception: before a vowel, «ma» becomes «mon», for the sound. «Mon amie.»² «Son amie.»² My friend, his friend, even for a girl. "
 "[[+]]And to say whose it is, with a name, use «de»: «Le chapeau d'Alan.»² Or just: «Son chapeau.»²", board='poss')
atoi("Say: It is his hat.", "C'est son chapeau.", img='hat')
atoi("Say: It is her friend.", "C'est son amie.", img='raptor2')
atoi("Say: Where are your keys?", "Où sont tes clés ?", img='keys', by='ashok')

chapter("Oups !", ['owen', 'ashok'], bg='raptor3')
fr('ashok', "[[raptor3]]Voici ma amie Claire.", "Here is my friend Claire. (wrong)")
fr('owen', "[[raptor2]]Attention, Ashok. Devant une voyelle, on dit mon. Mon amie Claire.", "Careful, Ashok. Before a vowel, we say mon. Mon amie Claire.")
fr('ashok', "Mon amie Claire. D'accord, Owen !", "Mon amie Claire. OK, Owen!")
replay('s4')

# ---------------------------------------------------------------- résumé
chapter("Résumé", ['ellie'], bg='kauai1')
explain('ellie', "Résumé of episode eight. "
 "[[+]]«Peux, veux, dois», plus an infinitive: «Tu peux attendre.»² "
 "[[+]]The negative wraps the first verb: «Tu ne peux pas entrer.»² "
 "[[+]]The verbs «finir» and «attendre»: «je finis», «ils attendent.»² "
 "[[+]]Comparing: «plus», «moins» or «aussi», the adjective, «que.»² «Le plus grand», «la plus intelligente.»² And «meilleur». "
 "[[+]]And the possessives: «mon, ma, mes, son, sa, ses.»² The thing owned decides.", board='resume8')
explain('ellie', "And ten key words. "
 "[[+]]«Le dresseur», the trainer. «L'enclos», the paddock. [[+]]«Entrer», to enter. «Attendre», to wait. [[+]]«Finir», to finish. «Entendre», to hear. "
 "[[+]]«Rapide», fast. «Calme», calm. [[+]]«Le bruit», the noise. «Faire attention», to be careful.", board='resume9')

chapter("À bientôt !", ['owen', 'ashok', 'ellie'], bg='trail')
fr('owen', "[[trail]]Bravo, Ashok ! Tu peux revenir demain. Tu veux voir Blue ?", "Bravo, Ashok! You can come back tomorrow. Do you want to see Blue?")
fr('ashok', "[[raptor3]]Oui ! Mais je dois d'abord attendre. Et je dois faire attention !", "Yes! But first I must wait. And I must be careful!")
explain('ellie', "[[forest]]Well done, Ashok! [[kauai1]]Next time, something has escaped in the park, and Alan investigates. You will learn to tell what happened: the past tense. [[trail]]Until then, say «je peux, je veux, je dois» ten times a day. À bientôt!")
