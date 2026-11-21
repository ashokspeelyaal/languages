# Episode 5 · Au centre des visiteurs (A1).  Markup: see jurassic-serie/dsl.py
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
from dsl import *

meta(num=5, title="Au centre des visiteurs", level='A1', slug='au-centre-des-visiteurs', rate='-25%',
     goal="aller · faire · venir · prendre  ·  au / du  ·  en / au / aux  ·  l'heure")

# ---------------------------------------------------------------- boards
board('rappel', "RAPPEL  ·  Épisode 4", [
 "<s>je</s> mang<e>e</e> · <s>tu</s> mang<e>es</e> · <s>il</s> mang<e>e</e>", "+<s>nous</s> mang<e>ons</e> · <s>vous</s> mang<e>ez</e> · <s>ils</s> mang<e>ent</e>",
 "<s>je</s> <y>ne</y> <v>mange</v> <y>pas</y> de viande", "# ne + VERBE + pas · pas de",
 "Est-ce que <s>tu</s> <v>aimes</v> l'île ?", "# three ways to ask a question"])
board('posit', "Où est… ?  ·  La position", [
 "<y>devant</y> = in front of", "+<y>derrière</y> = behind", "# le squelette est devant la porte",
 "<y>dans</y> = in", "+<y>sur</y> = on", "+<y>sous</y> = under",
 "<y>entre</y> = between",
 "<y>à côté de</y> = next to", "+<y>en face de</y> = opposite", "# these two end in DE: next board!"])
board('contr', "Les contractions  ·  à et de", [
 "<w>à</w> + <w>le</w> = <e>au</e>", "+<w>à</w> + <w>les</w> = <e>aux</e>", "# au restaurant · aux laboratoires",
 "<w>à la</w> · <w>à l'</w> = no change", "# à la porte · à l'île",
 "<w>de</w> + <w>le</w> = <e>du</e>", "+<w>de</w> + <w>les</w> = <e>des</e>", "# à côté du restaurant · des laboratoires",
 "<w>de la</w> · <w>de l'</w> = no change", "# à côté de la salle · de l'île"])
board('aller', "ALLER  ·  to go", [
 "<s>je</s> <v>vais</v>", "+<s>tu</s> <v>vas</v>", "+<s>il/elle</s> <v>va</v>",
 "<s>nous</s> <v>allons</v>", "+<s>vous</s> <v>allez</v>", "<s>ils/elles</s> <v>vont</v>"])
board('prendre', "PRENDRE  ·  to take, to have", [
 "<s>je</s> <v>prends</v>", "+<s>tu</s> <v>prends</v>", "+<s>il/elle</s> <v>prend</v>",
 "<s>nous</s> <v>prenons</v>", "+<s>vous</s> <v>prenez</v>", "<s>ils/elles</s> <v>prennent</v>"])
board('venir', "VENIR  ·  to come", [
 "<s>je</s> <v>viens</v>", "+<s>tu</s> <v>viens</v>", "+<s>il/elle</s> <v>vient</v>",
 "<s>nous</s> <v>venons</v>", "+<s>vous</s> <v>venez</v>", "<s>ils/elles</s> <v>viennent</v>"])
board('pays', "Les pays  ·  Où ? D'où ?", [
 "<e>en</e> France · <e>en</e> Belgique · <e>en</e> Inde", "# feminine country: en",
 "<e>au</e> Canada · <e>au</e> Japon", "# masculine country: au",
 "<e>aux</e> États-Unis · <e>aux</e> Pays-Bas", "# plural country: aux",
 "<e>à</e> Genk · <e>à</e> Paris", "# a city: à, no article",
 "je viens <e>de</e> France · <e>d'</e>Inde", "+je viens <e>du</e> Canada · <e>des</e> États-Unis", "# coming from: de · d' · du · des"])
board('faire', "FAIRE  ·  to do, to make", [
 "<s>je</s> <v>fais</v>", "+<s>tu</s> <v>fais</v>", "+<s>il/elle</s> <v>fait</v>",
 "<s>nous</s> <v>faisons</v>", "<s>vous</s> <v>faites</v>", "<s>ils/elles</s> <v>font</v>"])
board('heure', "L'heure  ·  Les heures", [
 "Quelle heure <v>est</v>-il ?", "+<s>Il</s> <v>est</v> <e>une heure</e>.", "+<s>Il</s> <v>est</v> <e>trois heures</e>.", "# always « il est » · une heure, trois heures",
 "<s>Il</s> <v>est</v> <e>midi</e>", "+<s>Il</s> <v>est</v> <e>minuit</e>", "# noon · midnight: no word « heure »",
 "<w>à</w> trois heures", "# at three o'clock"])
board('minutes', "Les minutes", [
 "trois heures <e>dix</e>", "# 3:10 · just add the minutes",
 "trois heures <e>et quart</e>", "# 3:15",
 "trois heures <e>et demie</e>", "# 3:30  (midi et demi: masculine)",
 "quatre heures <e>moins le quart</e>", "# 3:45 = four minus a quarter",
 "quatre heures <e>moins cinq</e>", "# 3:55"])
board('resume1', "RÉSUMÉ  ·  Les quatre verbes", [
 "<v>aller</v> : vais · vas · va", "+allons · allez · vont",
 "<v>prendre</v> : prends · prends · prend", "+prenons · prenez · prennent",
 "<v>venir</v> : viens · viens · vient", "+venons · venez · viennent",
 "<v>faire</v> : fais · fais · fait", "+faisons · faites · font"])
board('resume2', "RÉSUMÉ  ·  Au, du, en, l'heure", [
 "à + le = <e>au</e> · à + les = <e>aux</e>", "+de + le = <e>du</e> · de + les = <e>des</e>",
 "<e>en</e> Inde · <e>au</e> Canada · <e>aux</e> États-Unis · <e>à</e> Genk",
 "je viens <e>d'</e>Inde · <e>du</e> Canada · <e>de</e> Genk",
 "devant · derrière · sur · sous · dans", "+à côté <e>de</e> · en face <e>de</e> · entre",
 "il est <e>trois heures et demie</e>", "+il est <e>midi</e> · il est <e>minuit</e>"])
board('resume3', "10 mots clés", [
 "<y>le squelette</y> = the skeleton", "+<y>la porte</y> = the door",
 "<y>devant</y> = in front of", "+<y>derrière</y> = behind",
 "<y>à côté de</y> = next to", "+<y>sur · sous</y> = on · under",
 "<y>la carte</y> = the map", "+<y>le café</y> = the coffee",
 "<y>midi</y> = noon", "+<y>une pause</y> = a break"])

# ---------------------------------------------------------------- intro
chapter("Bienvenue !", ['ellie'], bg='visitor')
explain('ellie', "[[visitor]]Bonjour, Ashok! Ellie here. Today we visit the visitor centre. [[hall1]]You will say where things are, where you go and where you come from, and you will order a coffee and tell the time. "
 "[[brachio_hall]]For that we need four irregular verbs. Ian Malcolm calls them the «chaos club»: «aller», to go; «prendre», to take or to have; «venir», to come; and «faire», to do or to make. [[kauai2]]First, a quick recap of last time.")

# ---------------------------------------------------------------- rappel
chapter("Rappel · Épisode 4", ['ellie', 'ashok'], bg='trex', id='rap')
fr('ellie', "[[trex]]Bonjour, Ashok ! {Est-ce que|x|(question phrase)} tu aimes les dinosaures ?", "Hello, Ashok! Do you like dinosaurs?")
fr('ashok', "Oui, j'adore les dinosaures ! {Mais|x|but} je n'aime pas les raptors.", "Yes, I love dinosaurs! But I don't like raptors.")
explain('ellie', "[[+]]That was last week's French. The «er» verbs: stem plus «e, es, e, ons, ez, ent». «Je mange, tu manges, nous mangeons.»² "
 "[[+]]The negation: «ne», verb, «pas». «Je ne mange pas de viande.»² "
 "[[+]]And «est-ce que» makes a question: «Est-ce que tu aimes l'île?»² Three quick questions for you.", board='rappel')
atoi("Say: I like dinosaurs.", "J'aime les dinosaures.", img='raptor')
atoi("Say: I don't eat meat.", "Je ne mange pas de viande.", img='trice')
atoi("Say: Do you like the island?", "Est-ce que tu aimes l'île ?", img='kauai1')

# ---------------------------------------------------------------- scene 1
chapter("Scène 1 · La grande salle", ['ellie', 'alan', 'ashok'], bg='visitor', id='s1')
fr('ellie', "[[visitor]]{Bienvenue|x|welcome} au {centre des visiteurs|m|the visitor centre}, Ashok !", "Welcome to the visitor centre, Ashok!")
fr('ellie', "[[hall1]]Voici la grande salle. {Le squelette|m|the skeleton} est {devant|x|in front of} {la porte|f|the door}.", "Here is the big hall. The skeleton is in front of the door.")
fr('alan', "[[hall2]]Le {restaurant|m|the restaurant} est {à côté du|x|next to the} {laboratoire|m|the lab}.", "The restaurant is next to the lab.")
fr('ashok', "[[brachio_hall]]{Où|x|where} est {la salle de contrôle|f|the control room} ?", "Where is the control room?")
fr('alan', "[[hall3]]Elle est {derrière|x|behind} le laboratoire. Hum.", "It is behind the lab. Hmm.")
fr('ellie', "[[globe]]Voici {la carte|f|the map}. Elle est {sur|x|on} la table.", "Here is the map. It is on the table.")
fr('ellie', "[[hall1]]Et {là|x|there}, {sous|x|under} la table, {il y a|x|there is} un chapeau !", "And there, under the table, there is a hat!")
fr('alan', "Ah, oui. Merci.", "Ah, yes. Thank you.")
fr('ashok', "[[visitor]]La salle est grande ! Je suis {content|x|happy} !", "The hall is big! I am happy!")

chapter("Pause ! · La position", ['ellie'])
explain('ellie', "Pause! Where is something? «Où est…?», and then a position word. "
 "[[+]]«Devant», in front of. «Derrière», behind. «Le squelette est devant la porte.»² «Le laboratoire est derrière le restaurant.»² "
 "[[+]]«Dans», in. «Sur», on. «Sous», under. «La carte est sur la table.»² «Le chapeau est sous la table.»² "
 "[[+]]«Entre», between. «Le restaurant est entre la salle et le laboratoire.» "
 "[[+]]And two longer ones: «à côté de», next to, and «en face de», opposite. «Le restaurant est à côté de la salle.»² «La porte est en face de la table.» "
 "Watch the little word «de» at the end. It is going to change.", board='posit')
explain('ellie', "Alan said: «Le restaurant est à côté DU laboratoire.»² Not «de le». French does not like «de» followed by «le», so the two melt into one. This is a contraction, and it is a pure formula. "
 "[[+]]«À», to, at or in. «À» plus «le» becomes «au»: «Je suis au restaurant.»² «À» plus «les» becomes «aux»: «Nous sommes aux laboratoires.»² "
 "[[+]]But «à la» and «à l'» never change: «à la porte», «à l'île». "
 "[[+]]Same for «de». «De» plus «le» becomes «du»: «à côté du restaurant.»² «De» plus «les» becomes «des»: «la porte des laboratoires.»² "
 "[[+]]And «de la», «de l'»: no change. «À côté de la salle.» "
 "Remember: only masculine «le» and plural «les» merge.", board='contr')
atoi("Say: The skeleton is in front of the door.", "Le squelette est devant la porte.", img='hall2')
atoi("Say: The map is on the table.", "La carte est sur la table.", img='globe')
atoi("Say: The lab is next to the restaurant.", "Le laboratoire est à côté du restaurant.", img='lab')
replay('s1')

# ---------------------------------------------------------------- scene 2
chapter("Scène 2 · Au restaurant", ['malcolm', 'ashok', 'ellie'], bg='resto', id='s2')
fr('malcolm', "[[resto]]{Tu as faim|x|are you hungry?}, Ashok ? Moi, j'ai faim. Nous {allons|x|we go} au restaurant !", "Are you hungry, Ashok? I am hungry. We are going to the restaurant!")
fr('ashok', "[[table]]Oui, j'ai très faim !", "Yes, I am very hungry!")
fr('malcolm', "[[resto]]{Qu'est-ce que tu prends|x|what are you having?} ?", "What are you having?")
fr('ashok', "[[coffee]]Je {prends|x|I take, I have} {un café|m|a coffee} et {un sandwich|m|a sandwich}.", "I'll have a coffee and a sandwich.")
fr('ellie', "[[snack]]Moi, je prends {un thé|m|a tea}. Ian, tu prends un café ?", "Me, I'll have a tea. Ian, are you having a coffee?")
fr('malcolm', "Moi ? Je ne prends pas de café. Je prends un thé aussi.", "Me? I'm not having coffee. I'll have a tea too.")
fr('ellie', "[[resto]]Alors, Ashok prend un café et un sandwich, et nous prenons un thé.", "So, Ashok has a coffee and a sandwich, and we have a tea.")
fr('malcolm', "Après, nous allons au laboratoire. Tu {viens|x|you come}, Ashok ?", "After, we are going to the lab. Are you coming, Ashok?")
fr('ashok', "[[table]]Oui ! Je vais à le laboratoire !", "Yes! I am going to the lab!")
fr('ellie', "[[resto]]{Attention|x|careful} ! Au laboratoire. Pas « à le ».", "Careful! To the lab: « au laboratoire », not « à le ».")
fr('ashok', "Ah oui ! Je vais au laboratoire !", "Ah yes! I'm going to the lab!")

chapter("Pause ! · Aller et prendre", ['malcolm'])
explain('malcolm', "Ian Malcolm here. Welcome to the chaos club. Irregular verbs do not follow the pattern of the «er» verbs. First, «aller», to go. "
 "[[+]]«Je vais, tu vas, il va.»² Three short forms, and they sound almost the same. «Je vais au restaurant.»² «Elle va à la salle.»² "
 "[[+]]«Nous allons, vous allez»: the stem «all» comes back. «Nous allons au restaurant.»² «Vous allez au centre.» "
 "[[+]]«Ils vont.»² The t is silent. «Ils vont aux laboratoires.»² "
 "Now all six, slowly: «je vais, tu vas, il va, nous allons, vous allez, ils vont.»²", board='aller')
explain('malcolm', "Second verb: «prendre». It means to take, and in a restaurant, to have: to order. «Qu'est-ce que tu prends?»² "
 "[[+]]«Je prends, tu prends, il prend.»² The d and the s are silent, so the three sound the same. «Je prends un café.»² «Elle prend un thé.»² "
 "[[+]]«Nous prenons, vous prenez.»² The stem «pren» comes back. "
 "[[+]]And «ils prennent», with two n's and a pronounced ending. «Il prend, ils prennent.»² «Ils prennent un thé.»² That is your restaurant lesson. Chaos, but useful.", board='prendre')
atoi("Say: I am going to the restaurant.", "Je vais au restaurant.", img='snack')
atoi("Say: I'll have a coffee.", "Je prends un café.", img='coffee')
atoi("Say: We are going to the labs.", "Nous allons aux laboratoires.", img='fossilab')
replay('s2')

# ---------------------------------------------------------------- scene 3
chapter("Scène 3 · D'où viens-tu ?", ['hammond', 'ashok', 'ellie'], bg='globe2', id='s3')
fr('hammond', "[[globe2]]Ashok, tu {viens d'où|x|where do you come from?} ? Moi, je {viens|x|I come} d'Écosse.", "Ashok, where do you come from? Me, I come from Scotland.")
fr('ashok', "[[kuli1]]Je viens en Inde.", "I come in India.")
fr('ellie', "D'Inde, Ashok ! Je viens d'Inde. Pas « en ».", "From India, Ashok! I come from India. Not « en ».")
fr('ashok', "[[kuli2]]Ah oui. Je viens d'Inde, de {Kulithalai|x|Ashok's home town}. J'habite à Genk, en Belgique.", "Ah yes. I come from India, from Kulithalai. I live in Genk, in Belgium.")
fr('hammond', "[[genk1]]Ah ! Tu habites en Belgique, et tu viens d'Inde. Moi, je viens d'Écosse, mais j'habite ici.", "Ah! You live in Belgium, and you come from India. Me, I come from Scotland, but I live here.")
fr('ellie', "[[globe2]]Moi, je viens des {États-Unis|x|the United States}. Alan et Ian viennent des États-Unis aussi.", "Me, I come from the United States. Alan and Ian come from the United States too.")
fr('hammond', "[[hall1]]Je vais au {Canada|m|Canada}. Ellie et Alan vont aux États-Unis.", "I am going to Canada. Ellie and Alan are going to the United States.")
fr('hammond', "Et toi, Ashok ? Tu vas en France ?", "And you, Ashok? Are you going to France?")
fr('ashok', "[[genk2]]Oui, je vais en France. Et je vais au Canada aussi !", "Yes, I'm going to France. And I'm going to Canada too!")

chapter("Pause ! · Venir", ['malcolm'])
explain('malcolm', "Ian Malcolm again. Verb number three: «venir», to come. «Je viens d'Inde.»² "
 "[[+]]«Je viens, tu viens, il vient.»² Nasal vowel, and all three sound the same. «Tu viens d'où?»² «Elle vient de Paris.»² "
 "[[+]]«Nous venons, vous venez»: the stem «ven» comes back, like «all» in «aller». «Nous venons de Belgique.»² "
 "[[+]]«Ils viennent.»² Two n's again. «Il vient, ils viennent.»² «Ils viennent des États-Unis.»² "
 "Same pattern as «prendre»: singular nasal, plural with «nn». Now the countries.", board='venir')
explain('ellie', "Ellie here. Countries and towns. Which little word do I use? "
 "[[+]]A feminine country takes «en»: «en France», «en Belgique», «en Inde.»² Tip: almost every country ending in E is feminine. "
 "[[+]]A masculine country takes «au»: «au Canada», «au Japon.»² "
 "[[+]]A plural country takes «aux»: «aux États-Unis», «aux Pays-Bas.»² "
 "[[+]]A city takes «à», with no article: «à Paris», «à Genk.» «J'habite à Genk, en Belgique.»² City first, then country. "
 "[[+]]Coming from: «de», or «d'» before a vowel: «Je viens de France.» «Je viens d'Inde.»² «Du» for a masculine country: «Il vient du Canada.»² «Des» for a plural one: «Ils viennent des États-Unis.»² A city: just «de»: «Je viens de Kulithalai.»² "
 "And Ashok's mistake, «je viens en Inde», is very common. Going to is «en Inde»; coming from is «d'Inde».", board='pays')
atoi("Say: I come from India.", "Je viens d'Inde.", img='kuli3')
atoi("Say: I live in Genk, in Belgium.", "J'habite à Genk, en Belgique.", img='genk1')
atoi("Say: Where do you come from?", "Tu viens d'où ?", img='globe')
replay('s3')

# ---------------------------------------------------------------- scene 4
chapter("Scène 4 · La salle de contrôle", ['malcolm', 'ashok', 'hammond'], bg='ctrl1', id='s4')
fr('malcolm', "[[ctrl1]]Voici {la salle de contrôle|f|the control room}. Il y a un grand {ordinateur|m|computer}.", "Here is the control room. There is a big computer.")
fr('malcolm', "Tu es ingénieur, Ashok. Tu aimes les ordinateurs ?", "You are an engineer, Ashok. Do you like computers?")
fr('ashok', "[[ctrl2]]Oui ! Je suis {ingénieur informatique|m|IT engineer}. J'adore les ordinateurs !", "Yes! I am an IT engineer. I love computers!")
fr('malcolm', "{Qu'est-ce que tu fais|x|what are you doing?}, Ashok ?", "What are you doing, Ashok?")
fr('ashok', "Je {fais|x|I do, I make} {une pause|f|a break} !", "I'm taking a break!")
fr('ashok', "[[ctrl3]]Ellie et Alan faisent un café.", "Ellie and Alan are making a coffee.")
fr('malcolm', "Non ! Ils font un café. Chaos !", "No! They are making a coffee. Chaos!")
fr('malcolm', "[[clock]]{Quelle heure est-il|x|what time is it?} ?", "What time is it?")
fr('hammond', "Il est {trois heures et demie|x|half past three}.", "It is half past three.")
fr('malcolm', "[[ctrl2]]Trois heures et demie ! À quatre heures, nous allons au laboratoire.", "Half past three! At four o'clock, we are going to the lab.")
fr('ashok', "Et moi, je fais une pause à quatre heures !", "And me, I am taking a break at four o'clock!")

chapter("Pause ! · Faire", ['malcolm'])
explain('malcolm', "Ian Malcolm. The last member of the chaos club: «faire», to do, or to make. «Qu'est-ce que tu fais?»² «Je fais une pause.»² "
 "[[+]]«Je fais, tu fais, il fait.»² Again, all three sound the same: «fè». «Je fais un café.»² «Il fait un sandwich.»² "
 "[[+]]«Nous faisons.»² Spelled «ai», pronounced «e»: nous fezons. Nobody knows why. "
 "[[+]]«Vous faites.»² A rare pattern: «vous êtes», «vous faites». "
 "[[+]]«Ils font.»² It rhymes with «ils vont». «Ils font un café.»² Ashok said «ils faisent». Logical, and wrong. That is chaos! "
 "Congratulations: you now know all four. Aller, prendre, venir, faire. Say them ten times a day.", board='faire')
explain('ellie', "Ellie again, with the time. «Quelle heure est-il?»² What time is it? "
 "[[+]]The answer starts with «il est». «Il est une heure.»² «Il est trois heures.»² Note the S: «une heure», singular; «trois heures», plural. "
 "[[+]]Two special ones: «midi», noon, and «minuit», midnight. «Il est midi.»² «Il est minuit.»² "
 "[[+]]To say at what time, use «à»: «à quatre heures.»² «Nous allons au laboratoire à quatre heures.»", board='heure')
explain('ellie', "[[+]]Minutes: say the hour, then the number. «Trois heures dix.»² "
 "[[+]]A quarter past: «et quart». «Trois heures et quart.»² "
 "[[+]]Half past: «et demie». «Il est trois heures et demie.»² That is what Hammond said. You cannot hear the E. For noon it is masculine: «midi et demi.» "
 "[[+]]A quarter to: «moins le quart». «Quatre heures moins le quart.»² It is four o'clock, minus a quarter: 3:45. "
 "[[+]]And «quatre heures moins cinq.»", board='minutes')
atoi("Say: What are you doing?", "Qu'est-ce que tu fais ?", img='ctrl1')
atoi("Say: It is half past three.", "Il est trois heures et demie.", img='clock2')
atoi("Say: It is noon.", "Il est midi.", img='clock')
replay('s4')

# ---------------------------------------------------------------- résumé
chapter("Résumé", ['ellie'], bg='visitor')
explain('ellie', "Résumé! First, the four chaos verbs. "
 "[[+]]«Je vais, tu vas, il va, nous allons, vous allez, ils vont.»² [[+]]«Je prends, tu prends, il prend, nous prenons, vous prenez, ils prennent.»² "
 "[[+]]«Je viens, tu viens, il vient, nous venons, vous venez, ils viennent.»² [[+]]«Je fais, tu fais, il fait, nous faisons, vous faites, ils font.»²", board='resume1')
explain('ellie', "Second board. [[+]]Contractions: «au», «aux», «du», «des». [[+]]Countries: «en Inde», «au Canada», «aux États-Unis», «à Genk». [[+]]«Je viens d'Inde.» "
 "[[+]]Position words: «devant, derrière, sur, sous, dans.» With «de»: «à côté de», «en face de», and «entre.» "
 "[[+]]And the time: «Il est trois heures et demie.» «Il est midi.»", board='resume2')
explain('ellie', "And ten key words. "
 "[[+]]«Le squelette», the skeleton. «La porte», the door. [[+]]«Devant», in front of. «Derrière», behind. [[+]]«À côté de», next to. «Sur» and «sous». "
 "[[+]]«La carte», the map. «Le café», the coffee. [[+]]«Midi», noon. «Une pause», a break. "
 "Well done, Ashok!", board='resume3')

chapter("À bientôt !", ['hammond', 'ellie', 'ashok'], bg='kauai1')
fr('hammond', "[[kauai1]]Bravo, Ashok ! Tu {parles|x|you speak} très bien !", "Bravo, Ashok! You are doing very well!")
fr('ashok', "[[napali]]Merci ! Je suis fatigué, mais content !", "Thank you! I am tired, but happy!")
explain('ellie', "[[kauai3]]Next episode is the last one of the first course: the storm! The power goes out, and you will need «aller» again: with «aller» plus a verb, you will say what is going to happen. You will learn commands, the weather, and how to say «il faut». [[kauai4]]Until then, repeat the chaos club ten times a day. À bientôt!")
