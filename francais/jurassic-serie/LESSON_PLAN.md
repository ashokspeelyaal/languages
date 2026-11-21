# « Français Jurassique », complete lesson plan A1 → A2 (12 episodes)

This is the full content plan, so any episode can be made later or in any order. It goes with `SERIES.md` (concept, characters, format, rules) and the agent `.claude/agents/fr-jurassic-video.md`.

**Priority 1: grammar teaching.** Every scene exists to set up a « Pause ! » board, and the boards get the most time: about 50–60 % of each episode. Explain step by step, build the formula visibly, give many examples, and repeat.
**Priority 2: slow pace.** Speed makes memorising hard; 25 min per episode is fine.

Each episode has 20–25 min of audio, built from the following segments:
- Rappel (recap)
- 3–4 scenes
- a « Pause ! » blackboard after each scene
- « À toi ! » prompts (4 s countdown, then the answer twice)
- a scene replay
- a Résumé
- vocabulary cards (with a gender colour)

The French in episode N may only use grammar from episodes 1..N. Fixed chunks are allowed if they are flagged as « expression ».

---

## Voices (Azure TTS, francecentral, verified 2026-11-21)

| Character | Voice | Why |
|---|---|---|
| **Ellie Sattler** | `fr-FR-VivienneMultilingualNeural` | Warm female voice; **multilingual**, so she speaks French in scenes and explains the rules in English (`<lang xml:lang="en-US">`). Main teacher. |
| **Alan Grant** | `fr-FR-RemyMultilingualNeural` | Calm male voice; multilingual, so he gives the English explanations of past tenses. |
| **Ian Malcolm** | `fr-FR-LucienMultilingualNeural` | Distinct male voice; multilingual, so he explains the irregular verbs and exceptions in English. |
| **John Hammond** | `fr-FR-MauriceNeural` | Older-sounding male voice for the host. |
| **Owen Grady** (A2) | `fr-FR-HenriNeural` | Steady male voice; style `cheerful` is available. |
| **Claire Dearing** (A2) | `fr-FR-DeniseNeural` | Crisp, professional female voice. |
| **Ashok** (the learner) | `fr-FR-AlainNeural` | Ashok's own voice: a learner from Kulithalai (Tamil Nadu, India) who lives in **Genk**, Belgium. He answers and practises the new structures. |
| *Spare: Maisie or a child* | `fr-FR-EloiseNeural` | Child voice, if needed. |
| *Spare: lab scientist* | `fr-FR-ClaudeNeural` | Extra male voice. |
| **« À toi ! » prompt (English)** | Ellie's voice in en-US | One consistent "teacher" voice for the prompts. |

**Pacing**
- **Slow is the priority** (the user memorises better at low speed; 25 min per episode is fine):
  - French in scenes and examples: `<prosody rate="-25%">` in A1 and `-15%` in A2.
  - Add `<break time="900ms"/>` after every French sentence, and 1.5 s between turns.
  - Every new grammar example is said **twice** (slow, then a 1 s pause, then slow again).
- The answer after « À toi ! » is spoken twice: first slow, then at the normal scene speed.

**Notes**
- The HD voices (`:DragonHDLatestNeural`) and MAI voices may not emit viseme events. Use the `…Neural` voices above, which support visemes for the lip sync.
- If a voice sounds wrong for a character, change it here and record the change in Learnings in the agent file, so all episodes stay consistent.

---

# A1 — Jurassic Park (Isla Nublar)

## Episode 1 · Bienvenue sur l'île
**Can-do:** greet people, say your name, nationality, where you live and your job, ask "how are you?".

**Scenes**
1. **Helicopter arrival** (photo: tropical island coast, helicopter). Hammond: « Bonjour, Ashok ! Bienvenue sur l'île ! Je suis John Hammond. Je suis écossais. »
2. **Meeting Ellie and Alan** (photo: jungle, palaeontology dig). « Je m'appelle Ellie. Je suis paléobotaniste. » / « Moi, c'est Alan. Je suis paléontologue. » / « Et toi, tu es ingénieur ? » / « Oui, je suis ingénieur. »
3. **Malcolm arrives** (photo: island road). « Je suis Ian Malcolm. Je suis mathématicien. Tu es d'où ? » / « Je suis indien. J'habite en Belgique. »
4. **"Ça va ?"** (photo: visitor area, palms). « Comment ça va ? » / « Ça va bien, merci. Et vous ? » / « Nous sommes contents ! »

**« Pause ! » boards**
- **Ellie: être**
  - `je suis · tu es · il/elle/on est`
  - `nous sommes · vous êtes · ils/elles sont`
- **Ellie: subject pronouns.** `on` = "we", informal. `ils` covers a mixed group; `elles` covers only women.
- **Ellie: tu or vous.** `tu` for one friend; `vous` for polite address or for several people.
- **Malcolm: "être is irregular — pure chaos. Learn it as a song."**
- **Ellie: expressions.** `je m'appelle…` · `j'habite en Belgique` · `ça va ?`
- **Ellie: nationality, a first look at agreement.** `indien → indienne`, `américain → américaine`, `belge → belge`.

**« À toi ! »** (English prompt → French answer)
1. I am Ashok. → Je suis Ashok.
2. I am Indian. → Je suis indien.
3. I live in Belgium. → J'habite en Belgique.
4. She is American. → Elle est américaine.
5. We are on the island. → Nous sommes sur l'île.
6. You (formal) are a paleontologist. → Vous êtes paléontologue.
7. How are you? → Comment ça va ?
8. Are you tired? → Tu es fatigué ?
9. They are here. → Ils sont ici.

**Vocabulary**
- **Greetings:** bonjour, salut, bienvenue, merci, au revoir
- **Island words:** l'île (f), l'hélicoptère (m), ici
- **Expressions:** je m'appelle, j'habite
- **Nationalities:** indien/indienne, belge, américain/américaine, écossais/écossaise
- **Jobs:** paléontologue, paléobotaniste, mathématicien, ingénieur
- **Adjectives:** fatigué(e), content(e)

---

## Episode 2 · Les dinosaures
**Can-do:** say what you have, name things with the right article, say what there is, count to 20, give your age.

**Scenes**
1. **First brachiosaurus** (photo: brachiosaurus skeleton or reconstruction). Alan: « Regarde ! Il y a un dinosaure ! » (« regarde » is flagged as an expression.) « Il a une petite tête et une longue queue. » (Adjectives are flagged as chunks here and taught in episode 3.)
2. **The lab and the eggs** (photo: lab, eggs or fossil eggs). « Il y a trois œufs. » / « Le bébé a deux jours. »
3. **Alan's equipment** (photo: fossil dig tools, hat). « J'ai un chapeau, une brosse et des outils. »
4. **"J'ai peur !"** (photo: dense jungle). Malcolm: « Tu as peur ? » / « Non, je n'ai pas peur ! » (Negation is flagged as a chunk here and taught in episode 4.)

**« Pause ! » boards**
- **Ellie: avoir**
  - `j'ai · tu as · il/elle a`
  - `nous avons · vous avez · ils/elles ont`
- **Ellie: gender.** Every noun is masculine or feminine. Learn the article together with the noun: `le dinosaure` (blue), `la queue` (red).
- **Ellie: articles.** Formulas:
  - `un / une → des`
  - `le / la → les`
  - `le / la + voyelle → l'` (l'œuf, l'île)
- **Hammond: il y a = there is / there are.** One form for singular and plural.
- **Hammond: numbers 0–20.**
- **Malcolm: age uses avoir.** "In English you ARE 35. In French you HAVE 35 years: j'ai 35 ans." (35 is a chunk here; the numbers come in episode 3.) He adds: « j'ai peur » = "I have fear".

**« À toi ! »**
1. I have a hat. → J'ai un chapeau.
2. There is a dinosaur. → Il y a un dinosaure.
3. There are three eggs. → Il y a trois œufs.
4. We have a jeep. → Nous avons une jeep.
5. Do you have a question? → Tu as une question ?
6. the island / the eggs → l'île / les œufs
7. The baby is two days old. → Le bébé a deux jours.
8. I'm scared. → J'ai peur.
9. They have a laboratory. → Ils ont un laboratoire.

**Vocabulary**
- **Dinosaur body:** le dinosaure, la tête, la queue, la dent / les dents, la patte, le cou
- **Lab:** l'œuf (m), le bébé, le laboratoire
- **Equipment:** le chapeau, la brosse, l'outil (m), la jeep
- **Park:** l'arbre (m), la feuille, la clôture
- **Expressions:** il y a, avoir peur, avoir … ans
- **Numbers:** zéro to vingt

---

## Episode 3 · Grand ou petit ?
**Can-do:** describe dinosaurs and people (size, colour, character), use c'est vs il est, count to 100.

**Scenes**
1. **Comparing on the hill** (photo: T. rex skeleton). « Le T. rex est grand. Il est très fort. » / « Le compsognathus est petit. »
2. **The green plants** (photo: ferns, cycads). Ellie: « C'est une plante très vieille. Les feuilles sont vertes. »
3. **Hammond's numbers** (photo: visitor centre or skeleton hall). « Le brachiosaure mesure vingt-cinq mètres. Il y a quinze dinosaures. » (« mesure » is flagged as an expression.)
4. **Describing friends** (photo: jungle path). « Ellie est intelligente. Alan est sérieux. Malcolm est drôle. »

**« Pause ! » boards**
- **Ellie: agreement formula.**
  - `adjectif + e` (feminine)
  - `adjectif + s` (plural)
  - `+ es` (feminine plural)
  - Examples: `grand → grande → grands → grandes`
- **Malcolm: chaos endings.**
  - `-eux → -euse` (sérieux → sérieuse)
  - `-if → -ive` (sportif → sportive)
  - `-ien → -ienne`
  - `blanc → blanche`
  - `vieux → vieille`
- **Ellie: position.** Most adjectives come after the noun: `une plante verte`. **BAGS** adjectives come before: beauty, age, goodness, size (`beau, jeune, vieux, bon, mauvais, petit, grand, joli, nouveau`), so `un grand dinosaure`.
- **Ellie: c'est vs il est.**
  - `c'est + un/une + nom` (c'est un dinosaure)
  - `il/elle est + adjectif` (il est grand)
  - `il est + métier` without an article (il est paléontologue)
- **Hammond: numbers 20–100.**
  - vingt, trente, quarante, cinquante, soixante, soixante-dix, quatre-vingts, quatre-vingt-dix, cent
  - **In Belgium:** septante (70) and nonante (90). "Useful for you!"
- **Colours:** vert, rouge, bleu, jaune, noir, blanc, gris, marron (invariable).

**« À toi ! »**
1. The dinosaur is big. → Le dinosaure est grand.
2. The plant is green. → La plante est verte.
3. It's a small dinosaur. → C'est un petit dinosaure.
4. The eggs are white. → Les œufs sont blancs.
5. Ellie is happy. → Ellie est contente.
6. He is a paleontologist. → Il est paléontologue.
7. Seventy, in France and in Belgium. → soixante-dix / septante
8. Ninety-nine. → quatre-vingt-dix-neuf (Belgium: nonante-neuf)
9. The leaves are green. → Les feuilles sont vertes.

**Vocabulary**
- **Adjectives:** grand, petit, fort, gentil/gentille, dangereux/dangereuse, vieux/vieille, jeune, intelligent, sérieux, drôle, beau/belle
- **Colours:** see the board above
- **Nouns:** le mètre, la plante, la fougère
- **Numbers:** 20–100

---

## Episode 4 · La visite
**Can-do:** talk about actions in the present, say what you do and don't do, ask questions.

**Scenes**
1. **The jeep tour starts** (photo: jungle road, safari-type vehicle without branding). « Nous visitons le parc. Nous regardons les dinosaures. »
2. **Herbivores** (photo: triceratops skeleton). « Le tricératops mange des plantes. Il ne mange pas de viande. »
3. **Waiting for the T. rex** (photo: tall fence or jungle edge). Malcolm: « Où est le T. rex ? Il ne mange pas ? Il ne chasse pas ? »
4. **Questions in the jeep.** « Est-ce que tu aimes les dinosaures ? » / « Oui, j'adore les dinosaures ! » / « Qu'est-ce que tu regardes ? »

**« Pause ! » boards**
- **Ellie: -er verbs.**
  - Formula: `radical + e · es · e · ons · ez · ent`
  - Example: `je mange, tu manges, il mange, nous mangeons, vous mangez, ils mangent`
  - Note: the endings -e, -es and -ent are **silent**, so four forms sound identical.
- **Malcolm: little chaos.**
  - `nous mangeons` keeps an e, so the g stays soft.
  - `j'aime`: je becomes j' before a vowel.
- **Ellie: negation.**
  - `ne + VERBE + pas` works like brackets: `je ne mange pas`.
  - `n'` before a vowel: `je n'aime pas`.
- **Malcolm: after "pas", un/une/des becomes de.** `Je mange des plantes → Je ne mange pas de plantes.`
- **Ellie: aimer + le/la/les.** `j'aime les dinosaures` always takes the definite article.
- **Ellie: questions, three ways.**
  1. Intonation: `Tu aimes l'île ?`
  2. `Est-ce que tu aimes l'île ?`
  3. Question words: où, quand, comment, pourquoi, combien, qui, `qu'est-ce que`

**« À toi ! »**
1. I like dinosaurs. → J'aime les dinosaures.
2. The triceratops eats plants. → Le tricératops mange des plantes.
3. I don't eat meat. → Je ne mange pas de viande.
4. Where is the T. rex? → Où est le T. rex ?
5. Do you like the island? → Est-ce que tu aimes l'île ?
6. We are watching the dinosaurs. → Nous regardons les dinosaures.
7. I'm not scared. → Je n'ai pas peur.
8. What are you looking at? → Qu'est-ce que tu regardes ?
9. Why? Because… → Pourquoi ? Parce que…
10. They are looking for the raptor. → Ils cherchent le raptor.

**Vocabulary**
- **Verbs:** manger, regarder, chercher, chasser, aimer, adorer, détester, parler, écouter, visiter
- **Nouns:** la viande, la plante, le carnivore, l'herbivore (m), la visite, le guide, la voiture
- **Question words:** où, quand, comment, pourquoi, combien, qui
- **Linker:** parce que

---

## Episode 5 · Au centre des visiteurs
**Can-do:** say where you go and where you come from, order something, give the position of things, tell the time.

**Scenes**
1. **The big hall** (photo: museum hall with a dinosaur skeleton). « Le squelette est devant la porte. Le restaurant est à côté du laboratoire. »
2. **At the restaurant** (photo: café or terrace, no branding). « Qu'est-ce que tu prends ? » / « Je prends un café et un sandwich. »
3. **Where do you come from?** Hammond: « Je viens d'Écosse. Et toi ? » / « Je viens d'Inde, mais j'habite en Belgique. » / « Nous allons au Canada et aux États-Unis. »
4. **The control room, what time is it?** (photo: computer or control room). Malcolm: « Qu'est-ce que tu fais ? » / « Je fais une pause. » / « Quelle heure est-il ? » / « Il est trois heures et demie. »

**« Pause ! » boards**
- **Malcolm: four irregular verbs ("the chaos club")**

  | | je | tu | il | nous | vous | ils |
  |---|---|---|---|---|---|---|
  | **aller** | vais | vas | va | allons | allez | vont |
  | **faire** | fais | fais | fait | faisons | faites | font |
  | **venir** | viens | viens | vient | venons | venez | viennent |
  | **prendre** | prends | prends | prend | prenons | prenez | prennent |

- **Ellie: contractions.**
  - `à + le = au` · `à + les = aux` (à la and à l' stay as they are)
  - `de + le = du` · `de + les = des`
- **Ellie: countries.**
  - `en` + feminine country: en Belgique, en Inde, en France
  - `au` + masculine country: au Canada
  - `aux` + plural country: aux États-Unis
  - Coming from: `je viens de France / d'Inde / du Canada`
- **Ellie: position words.** devant, derrière, dans, sur, sous, à côté de, entre, en face de.
- **Hammond: telling the time.**
  - `Il est … heure(s)`
  - `et quart` · `et demie` · `moins le quart`
  - `midi` · `minuit`

**« À toi ! »**
1. I'm going to the restaurant. → Je vais au restaurant.
2. I come from India. → Je viens d'Inde.
3. I'll have a coffee. → Je prends un café.
4. What are you doing? → Qu'est-ce que tu fais ?
5. The skeleton is in front of the door. → Le squelette est devant la porte.
6. It's half past three. → Il est trois heures et demie.
7. We're going to the labs. → Nous allons aux laboratoires.
8. The map is on the table. → La carte est sur la table.
9. The lab is next to the restaurant. → Le laboratoire est à côté du restaurant.
10. It's noon. → Il est midi.

**Vocabulary**
- **Places:** le centre des visiteurs, le restaurant, la porte, la salle, la salle de contrôle, la table
- **Things:** le squelette, la carte, le café, le sandwich, l'ordinateur (m)
- **Phrases:** faire une pause
- **Time:** l'heure (f), midi, minuit
- **Countries:** see the board above

---

## Episode 6 · La tempête *(end of A1)*
**Can-do:** talk about the near future, give instructions and warnings, say what is necessary, talk about the weather and how you feel. Review all of A1.

**Scenes**
1. **The storm comes** (photo: tropical storm or dark clouds). « Il fait mauvais. Il pleut. Il y a du vent. Il va y avoir un orage. » (« du vent » is flagged as an expression; the partitive comes in episode 7.)
2. **The power goes out** (photo: dark control room or a night jungle). « L'électricité ne marche pas ! » / « Qu'est-ce que nous allons faire ? »
3. **Hiding with Alan** (photo: big tree roots or dense jungle at night). « Ne bouge pas ! Reste derrière moi ! » / « J'ai froid. J'ai faim. » / « Il faut attendre. »
4. **The next morning** (photo: sunrise over the island). « Il fait beau. Demain, nous allons quitter l'île. » / Hammond: « Tu vas revenir, Ashok ? » This is the cliffhanger into A2: the new park.

**« Pause ! » boards**
- **Ellie: futur proche.**
  - Formula: `aller (présent) + INFINITIF` (je vais manger, nous allons partir)
  - Negative: `je ne vais pas manger`
- **Ellie: imperative.** Take the tu, nous or vous form and drop the pronoun:
  - `Regarde ! Regardons ! Regardez !`
  - **The -er verbs lose the s in the tu form:** `tu regardes → Regarde !`
- **Malcolm: chaos commands.**
  - `Viens ! · Cours ! · Reste ici ! · Allons-y !`
  - Negative: `Ne bouge pas !`
- **Ellie: il faut + infinitif** = "you have to / we must": `Il faut courir.`
- **Ellie: weather.**
  - `il fait beau / mauvais / chaud / froid`
  - `il pleut`
  - `il y a du vent / un orage`
- **Malcolm: feelings with avoir (not être!).** avoir peur, froid, chaud, faim, soif.
- **A1 review board.** The complete formulas from episodes 1–6 on one screen, with 10 mixed « À toi ! » prompts.

**« À toi ! »**
1. It's raining. → Il pleut.
2. I'm cold. → J'ai froid.
3. Don't move! → Ne bouge pas !
4. Come here! → Viens ici !
5. We are going to leave the island. → Nous allons quitter l'île.
6. We have to run. → Il faut courir.
7. Tomorrow the weather is going to be nice. → Demain, il va faire beau.
8. I'm hungry. → J'ai faim.
9. Let's go! → Allons-y !
10. Look! (to several people) → Regardez !

Plus 10 review prompts drawn from episodes 1–5.

**Vocabulary**
- **Weather:** la tempête, l'orage (m), la pluie, le vent
- **Power:** l'électricité (f), marcher (= to work, for machines)
- **Verbs:** bouger, rester, courir, attendre, quitter, revenir
- **Time words:** demain, ce soir
- **Feelings:** avoir faim, avoir soif, avoir froid, avoir chaud

---

# A2 — Jurassic World (the new park; Alan, Ellie and Malcolm make cameos)

## Episode 7 · Le nouveau parc
**Can-do:** describe a daily routine, talk about food and quantities, use the polite vous with confidence.

**Scenes**
1. **Welcome from Claire** (photo: modern resort or lagoon, no branding). Claire, using vous: « Bonjour, monsieur. Vous êtes Ashok ? Bienvenue. Je m'appelle Claire. Je suis la directrice du parc. »
2. **Claire's day** (photo: modern office or control room). « Je me lève à cinq heures. Je me prépare vite. Je ne me couche jamais avant minuit. »
3. **Feeding time** (photo: herbivore skeleton or a meadow). « Les herbivores mangent beaucoup de plantes. Les carnivores mangent de la viande. » / « Je bois du café. Je ne bois pas de thé. »
4. **Big numbers** (photo: crowded visitor area). « Il y a vingt mille visiteurs par jour. »

**« Pause ! » boards**
- **Ellie: reflexive verbs.**
  - Formula: `SUJET + me/te/se/nous/vous/se + VERBE`
  - Example: `je me lève, tu te lèves, il se lève, nous nous levons, vous vous levez, ils se lèvent`
  - Callback: "You already knew one: **je m'appelle**!"
- **Ellie: negation with reflexives.** `je ne me lève pas`.
- **Claire: daily routine.** se réveiller, se lever, se laver, s'habiller, se préparer, se coucher. Time markers: tôt, tard, d'abord, ensuite, après, enfin.
- **Ellie: partitive (an unknown amount).**
  - `du + masc.` · `de la + fem.` · `de l' + vowel` · `des + plural`
  - After a negation everything becomes `de`: `pas de café`.
- **Ellie: quantities + de.** beaucoup de, un peu de, assez de, trop de, un kilo de, une tasse de.
- **Malcolm: boire.** `bois, bois, boit, buvons, buvez, boivent`, "chaos in a glass".
- **Claire: vous for politeness.** When to use it, and how to respond.
- **Hammond (memory): big numbers.** mille, deux mille, un million.

**« À toi ! »**
1. I get up at seven. → Je me lève à sept heures.
2. She goes to bed late. → Elle se couche tard.
3. I drink coffee. → Je bois du café.
4. I don't drink coffee. → Je ne bois pas de café.
5. There is a lot of water. → Il y a beaucoup d'eau.
6. Do you (formal) get up early? → Vous vous levez tôt ?
7. We eat bread. → Nous mangeons du pain.
8. Twenty thousand visitors. → vingt mille visiteurs
9. First I wake up, then I get dressed. → D'abord, je me réveille, ensuite je m'habille.

**Vocabulary**
- **People and roles:** la directrice / le directeur, le visiteur
- **Food:** le pain, le thé, l'eau (f), la viande, le poisson
- **Containers:** la tasse, le verre
- **Routine verbs:** see the board above
- **Time words:** tôt, tard, jamais
- **Numbers:** mille

---

## Episode 8 · Les raptors
**Can-do:** say what you can, want or must do, compare things, talk about whose things they are.

**Scenes**
1. **Owen and his raptors** (photo: velociraptor skeleton or model). Owen: « Voici mes raptors. Blue est la plus intelligente. »
2. **Rules of the paddock** (photo: fence or enclosure). « Tu ne peux pas entrer. Tu dois attendre ici. Tu veux voir Blue ? »
3. **Comparing** (photos: raptor, T. rex). « Le T. rex est plus grand que le raptor, mais le raptor est plus rapide. »
4. **Whose is it?** « C'est ton chapeau ? » / « Non, c'est le chapeau d'Alan. C'est son chapeau. » / « Ce sont nos œufs. »

**« Pause ! » boards**
- **Malcolm: pouvoir, vouloir, devoir.** All three are irregular, and all three take an infinitive.
  - `peux, peux, peut, pouvons, pouvez, peuvent`
  - `veux, veux, veut, voulons, voulez, veulent`
  - `dois, dois, doit, devons, devez, doivent`
- **Ellie: -ir and -re verbs.**
  - `finir`: `finis, finis, finit, finissons, finissez, finissent`
  - `attendre`: `attends, attends, attend, attendons, attendez, attendent`
- **Ellie: comparison formula.**
  - `plus / moins / aussi + ADJ + que`
  - Superlative: `le/la/les plus + ADJ`
  - Exception: `bon → meilleur` (Malcolm)
- **Ellie: possessives.** The possessive matches the **thing owned**, not the owner:
  - mon/ma/mes, ton/ta/tes, son/sa/ses, notre/nos, votre/vos, leur/leurs
  - Before a vowel, `ma` becomes `mon`: `mon amie`.

**« À toi ! »**
1. I want to see the raptors. → Je veux voir les raptors.
2. Can you wait? → Tu peux attendre ?
3. We must be careful. → Nous devons faire attention.
4. Blue is more intelligent than Charlie. → Blue est plus intelligente que Charlie.
5. The T. rex is the biggest. → Le T. rex est le plus grand.
6. It's his hat. → C'est son chapeau.
7. her friend (female) → son amie
8. They are waiting. → Ils attendent.
9. I hear a noise. → J'entends un bruit.
10. This film is better. → Ce film est meilleur.

**Vocabulary**
- **Training:** le dresseur, l'enclos (m), entrer, faire attention
- **Adjectives:** rapide, lent, intelligent, calme, nerveux
- **Verbs:** attendre, entendre, répondre, finir, choisir
- **Nouns:** le bruit, l'ami / l'amie

---

## Episode 9 · Qu'est-ce qui s'est passé ?
**Can-do:** tell what happened (past events with avoir), ask about the past, use time markers.

**Scenes**
1. **Something is wrong** (photo: empty enclosure or a broken fence). Claire: « Qu'est-ce qui s'est passé ? » (flagged as an expression) / Owen: « J'ai entendu un bruit cette nuit. »
2. **Alan investigates like a palaeontologist** (photo: footprints or a trackway). « J'ai trouvé des traces. J'ai mesuré les traces. Elles sont grandes. »
3. **Interviewing the staff** (photo: lab). « Tu as vu le dinosaure ? » / « Non, je n'ai rien vu. J'ai dormi. »
4. **Malcolm's verdict.** « J'ai dit : le chaos ! Vous n'avez pas écouté ! »

**« Pause ! » boards**
- **Alan: passé composé with avoir.**
  - Formula: `avoir (présent) + PARTICIPE PASSÉ`
  - Participle formula: `-er → é · -ir → i · -re → u`
  - Examples: `trouver → trouvé`, `finir → fini`, `entendre → entendu`
- **Malcolm: irregular participles (the chaos list).**
  - `faire → fait · prendre → pris · voir → vu`
  - `avoir → eu · être → été · boire → bu`
  - `dire → dit · écrire → écrit · ouvrir → ouvert · mettre → mis`
  - `pouvoir → pu · vouloir → voulu · devoir → dû`
- **Ellie: negation in the passé composé.** The brackets go around the auxiliary: `je n'ai pas vu`. Also `ne … rien` (nothing) and `ne … jamais` (never).
- **Alan: time markers.** hier, ce matin, cette nuit, la semaine dernière, `il y a deux heures` (= two hours ago).

**« À toi ! »**
1. I saw a raptor. → J'ai vu un raptor.
2. We heard a noise. → Nous avons entendu un bruit.
3. Did you eat? → Tu as mangé ?
4. She opened the door. → Elle a ouvert la porte.
5. I didn't sleep. → Je n'ai pas dormi.
6. They found an egg. → Ils ont trouvé un œuf.
7. Yesterday I watched the film. → Hier, j'ai regardé le film.
8. What did you do? → Qu'est-ce que tu as fait ?
9. I saw nothing. → Je n'ai rien vu.
10. Two hours ago. → Il y a deux heures.

**Vocabulary**
- **Investigation:** la trace, l'empreinte (f), l'enquête (f), le témoin
- **Verbs:** trouver, ouvrir, fermer, dormir
- **Time markers:** hier, cette nuit, dernier/dernière
- **Negation:** rien, jamais

---

## Episode 10 · L'évasion
**Can-do:** tell a story with movement verbs in the past, use reflexive verbs in the past, replace nouns with le/la/les.

**Scenes**
1. **The escape** (photo: jungle or broken fence). « Le dinosaure s'est échappé ! Il est sorti de l'enclos. Il est allé dans la forêt. »
2. **The chase** (photo: jungle river or valley). « Nous sommes partis en jeep. Claire est montée dans la jeep. Owen est resté au laboratoire. »
3. **Hiding** (photo: dense forest). « Tu vois le dinosaure ? » / « Oui, je le vois ! » / « Je l'ai vu derrière l'arbre ! »
4. **Back to safety** (photo: control room or sunset). « Nous sommes arrivés au centre. Je suis tombé, mais ça va ! » / « Claire est revenue avec Owen. »

**« Pause ! » boards**
- **Alan: passé composé with être.**
  - Movement verbs and "the house of être": aller, venir, arriver, partir, entrer, sortir, monter, descendre, tomber, rester, retourner, revenir, devenir, naître
  - Draw it as a house: up the stairs, in the door, out the door…
- **Ellie: agreement with être.** The participle agrees with the subject like an adjective: `elle est partie`, `ils sont arrivés`, `elles sont sorties`.
- **Ellie: reflexives in the past always take être.** `je me suis levé(e)`, `il s'est échappé`.
- **Owen: direct object pronouns.**
  - `le / la / l' / les` go **before** the verb: `je vois le raptor → je le vois`
  - In the past: `je l'ai vu`
  - Negative: `je ne le vois pas`
- **Malcolm (bonus chaos):** `je l'ai vue` gets an e when "la" is feminine. "You won't hear it, but you'll see it."

**« À toi ! »**
1. The dinosaur escaped. → Le dinosaure s'est échappé.
2. She left. → Elle est partie.
3. We arrived at the lab. → Nous sommes arrivés au laboratoire.
4. I fell. → Je suis tombé.
5. They stayed in the jeep. → Ils sont restés dans la jeep.
6. Do you see the T. rex? Yes, I see it. → Oui, je le vois.
7. I didn't go out. → Je ne suis pas sorti.
8. Claire came back. → Claire est revenue.
9. I got up at six. → Je me suis levé à six heures.
10. I saw it (the jeep). → Je l'ai vue.

**Vocabulary**
- **Escape:** l'évasion (f), s'échapper
- **Nature:** la forêt, la rivière, la vallée
- **Movement verbs:** monter, descendre, sortir, entrer, tomber, revenir
- **Safety:** en sécurité

---

## Episode 11 · Il y a 65 millions d'années
**Can-do:** describe the past (what things were like, habits), and combine background and events (imparfait vs passé composé).

**Scenes**
1. **Alan's story** (photos: Jurassic and Cretaceous landscapes, fossils). « Il y a très longtemps, les dinosaures vivaient partout. Il faisait chaud. Il y avait des forêts immenses. »
2. **Where the word comes from** (photo: the Jura mountains, France/Switzerland). Ellie: « Le mot « jurassique » vient du Jura, des montagnes en France et en Suisse. »
3. **Malcolm's correction** (photos: T. rex, velociraptor fossils). « Attention ! Le T. rex ne vivait pas au Jurassique. Il vivait au Crétacé ! Et les vrais vélociraptors étaient petits et avaient des plumes. »
4. **Ashok's childhood** (photo: Tamil Nadu town or cinema, or Indian countryside). « Quand j'étais petit, en Inde, j'aimais les dinosaures. Je regardais les films avec mon frère. » / « Un jour, je regardais le film quand l'électricité est partie ! »

**« Pause ! » boards**
- **Ellie: imparfait formation.**
  - Formula: `nous-form − ons + ais · ais · ait · ions · iez · aient`
  - Example: `nous regardons → je regardais`
- **Malcolm: only one exception.** `être → ét-` (j'étais). "For once there's almost no chaos!"
- **Alan: when to use the imparfait.** Description (it was hot), habits (every day I…), background (I was watching…).
- **Alan: imparfait vs passé composé.**
  - The imparfait is the **stage**; the passé composé is the **event**.
  - Example: `Je dormais (stage) quand le T. rex est arrivé (event).`
  - Draw it as a timeline: a long line for the imparfait, a dot for the passé composé.
- **Ellie: il y a + time = ago.** `il y a 65 millions d'années`.

**Facts to verify in the agent's research.md before use:**
- The Jurassic lasted about 201–145 million years ago, and the Cretaceous about 145–66 million years ago.
- T. rex lived about 68–66 million years ago (Cretaceous).
- Velociraptor lived in the Late Cretaceous, was small (turkey-sized), and had feathers.
- Brachiosaurus lived in the Late Jurassic.
- "Jurassic" is named after the Jura mountains.

**« À toi ! »**
1. When I was little, I liked dinosaurs. → Quand j'étais petit, j'aimais les dinosaures.
2. The dinosaurs lived in forests. → Les dinosaures vivaient dans des forêts.
3. It was hot. → Il faisait chaud.
4. I was sleeping when the T. rex arrived. → Je dormais quand le T. rex est arrivé.
5. Every day, Alan dug. → Tous les jours, Alan creusait.
6. We had a dog. → Nous avions un chien.
7. The raptors had feathers. → Les raptors avaient des plumes.
8. There were huge forests. → Il y avait des forêts immenses.
9. 65 million years ago. → Il y a soixante-cinq millions d'années.

**Vocabulary**
- **Time periods:** le Trias, le Jurassique, le Crétacé, l'époque (f), longtemps
- **Fossils:** la plume, le fossile, la météorite
- **Verbs:** creuser, vivre (vivait), disparaître
- **Nature:** la montagne
- **Expression:** tous les jours

---

## Episode 12 · Le retour *(end of A2)*
**Can-do:** talk about future plans, use lui/leur, y and en, and give your opinion. Talk about your favourite film in French. Review all of A2.

**Scenes**
1. **Leaving the island** (photo: boat or helicopter over the sea). « Demain, je rentrerai en Belgique. Je reviendrai un jour ! »
2. **Messages to friends** (photo: harbour or sunset). « Je lui téléphone. Je leur écris une carte. » / « Tu vas à Paris ? » / « Oui, j'y vais en mars. »
3. **The souvenir shop, no branding** (photo: market stall or shop). « Tu veux des œufs en chocolat ? » / « Oui, j'en veux deux ! »
4. **Favourite films**, a conversation with all the characters. « Quel est ton film préféré ? » / « À mon avis, le premier film est le meilleur. Je l'ai vu cinq fois. Je pense que les raptors sont fantastiques. » This talks *about* the films; it doesn't quote them.

**« Pause ! » boards**
- **Ellie: futur simple.**
  - Formula: `INFINITIF + ai · as · a · ons · ez · ont`
  - -re verbs drop the e: `prendre → je prendrai`
- **Malcolm: irregular future stems.**
  - `être → ser- · avoir → aur- · aller → ir- · faire → fer-`
  - `venir → viendr- · pouvoir → pourr- · voir → verr-`
  - `vouloir → voudr- · devoir → devr-`
- **Owen: indirect pronouns.**
  - `à + person → lui / leur`, placed before the verb
  - Example: `je parle à Claire → je lui parle`
- **Ellie: y and en.**
  - `y` = to/at that place: `j'y vais`
  - `en` = some of it / of them: `j'en veux deux`
- **Everyone: giving an opinion.** je pense que, je trouve que, à mon avis, je préfère, mon film préféré, c'est…
- **A2 review board.** All tenses on one timeline (passé composé · imparfait · présent · futur proche · futur simple), with 10 mixed « À toi ! » prompts.
- **End:** « Félicitations, Ashok ! Tu as fini le niveau A2 ! »

**« À toi ! »**
1. Tomorrow I will go back to Belgium. → Demain, je rentrerai en Belgique.
2. We will see. → Nous verrons.
3. I talk to him. → Je lui parle.
4. I phone them. → Je leur téléphone.
5. Are you going to Paris? Yes, I'm going there. → Oui, j'y vais.
6. Do you want eggs? I want two. → Oui, j'en veux deux.
7. In my opinion, the first film is the best. → À mon avis, le premier film est le meilleur.
8. I think that Owen is nice. → Je pense qu'Owen est sympa.
9. My favourite film is… → Mon film préféré, c'est…
10. I will come back one day. → Je reviendrai un jour.

Plus 10 review prompts drawn from episodes 7–11.

**Vocabulary**
- **Travel:** le retour, rentrer, le bateau
- **Messages and shopping:** la carte postale, le souvenir
- **Opinion and films:** préféré(e), à mon avis, le film, la suite, l'acteur / l'actrice
- **Adjectives:** fantastique, sympa
- **Time:** un jour

---

## Continuity checklist (for every episode agent)
- **Recap:** start with a recap of the previous episode's formulas and 3–4 À toi prompts. Episode 1 instead opens with "who are these people".
- **Re-use:** reuse at least 5 earlier vocabulary items in the new dialogues.
- **Tu/vous:** the learner is always « Ashok » and addressed with **tu**. Claire uses **vous** until episode 8, then switches: « On se tutoie ? »
- **Character roles:** keep each character's grammar role (SERIES.md).
- **Copyright:** no quotes from the films, no film images, logo or music.
