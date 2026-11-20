/* Onderwerpen A1 → B2 (+ bijlages).
 *
 * Per onderwerp:
 *   id      sleutel, komt overeen met het hoofdstuk-id in reference.js
 *   level   A1 | A2 | B1 | B2 | Bijlage
 *   title   titel in de app
 *   kern    één zin: de regel die je moet kunnen opzeggen
 *   tips    korte, bruikbare vuistregels
 *   val     valkuilen — precies de fouten die terugkomen als je even niet oefent
 *   recall  vragen voor vrije reproductie ("wat weet je nog?") vóór het lezen
 *   map     boomstructuur voor de d3-kaart van dit onderwerp
 *   gen     optioneel: naam van een generator uit app/generators.js
 */
window.OK_TOPICS = [
/* ================================ A1 ================================ */
{
  id:"a1-lidwoorden", level:"A1", nr:1, title:"Lidwoorden — de, het, een",
  kern:"Bepaald = de/het (geslacht per woord leren), onbepaald = een; meervoud bepaald is altijd de.",
  tips:[
    "Elk verkleinwoord is een het-woord: de man → het mannetje.",
    "Woorden op -ing, -heid, -te, -ie, -iek, -isme, -aar, -er (persoon) → de.",
    "Woorden op -um, -ment, -sel, talen, sporten, metalen → het.",
    "Leer een zelfstandig naamwoord nooit kaal: leer 'het station', niet 'station'."
  ],
  val:[
    "Meervoud onbepaald krijgt géén lidwoord: 'Ik zie ∅ kinderen', niet 'een kinderen'.",
    "Het-woord in het meervoud wordt de: het huis → de huizen.",
    "Beroepen na 'zijn/worden' krijgen wél een lidwoord in het Nederlands: 'Hij is ingenieur' — maar 'Hij is een goede ingenieur'."
  ],
  recall:["Welke drie lidwoorden bestaan er?","Noem drie uitgangen die altijd 'de' krijgen.","Wat is het lidwoord van een verkleinwoord?"],
  gen:"dehet",
  map:{name:"Lidwoorden",children:[
    {name:"bepaald",children:[{name:"de · de-woord"},{name:"het · onzijdig"},{name:"de · alle meervouden"}]},
    {name:"onbepaald",children:[{name:"een · enkelvoud"},{name:"∅ · meervoud"}]},
    {name:"heuristiek",children:[{name:"-ing/-heid/-te → de"},{name:"-je → het"},{name:"-um/-ment/-sel → het"}]}
  ]}
},
{
  id:"a1-pronomina", level:"A1", nr:2, title:"Persoonlijke voornaamwoorden",
  kern:"Onderwerpsvorm doet iets (ik, jij, hij), voorwerpsvorm ondergaat iets (mij, jou, hem).",
  tips:[
    "Onbeklemtoond in spreektaal: je, ze, we, 'm — beklemtoond bij nadruk: jou, hen, ons.",
    "Na een voorzetsel altijd de voorwerpsvorm: met mij, voor hem, naar hen.",
    "In Vlaanderen hoor je 'ge/gij' informeel; schrijf 'je/jij'."
  ],
  val:[
    "'hen' = lijdend voorwerp en na voorzetsel; 'hun' = meewerkend voorwerp. In de praktijk: 'Ik zie hen', 'Ik geef hun een boek'.",
    "'u' is enkelvoud én meervoud en krijgt de vorm van hij: 'u is/u bent' — 'u bent' is de veilige keuze.",
    "'het' als voorwerp verdwijnt vaak naar voren: 'Ik heb het gezien' — niet '*Ik heb gezien het'."
  ],
  recall:["Geef alle onderwerpsvormen op.","Wat is de voorwerpsvorm van wij, jullie, zij?","Wanneer hen, wanneer hun?"],
  map:{name:"Voornaamwoorden",children:[
    {name:"onderwerp",children:[{name:"ik · jij/u · hij/zij/het"},{name:"wij · jullie · zij"}]},
    {name:"voorwerp",children:[{name:"mij/me · jou/je · hem/haar"},{name:"ons · jullie · hen/hun"}]},
    {name:"gebruik",children:[{name:"na voorzetsel → voorwerp"},{name:"nadruk → beklemtoonde vorm"}]}
  ]}
},
{
  id:"a1-bezit", level:"A1", nr:3, title:"Bezittelijke voornaamwoorden",
  kern:"mijn, jouw/je, uw, zijn, haar, ons/onze, jullie, hun — alleen ons/onze verandert.",
  tips:[
    "onze bij de-woorden, ons bij het-woorden: onze auto, ons huis. In het meervoud altijd onze.",
    "Zelfstandig gebruikt: de mijne, de jouwe, het onze.",
    "'z'n' en 'd'r' zijn spreektaal voor zijn en haar."
  ],
  val:[
    "'hun' als bezit is correct (hun huis); 'hun' als onderwerp ('hun hebben') is fout.",
    "Bij lichaamsdelen gebruikt het Nederlands vaak een bezittelijk vnw waar het Engels dat ook doet — maar met wederkerend werkwoord verdwijnt het: 'Ik was me' niet '*Ik was mijn handen' als je jezelf bedoelt.",
    "jouw = bezit, jou = voorwerp. 'Is dat jouw jas?' vs 'Dit is voor jou.'"
  ],
  recall:["Wanneer ons en wanneer onze?","Wat is het verschil tussen jou en jouw?","Hoe zeg je 'theirs' zelfstandig?"],
  map:{name:"Bezit",children:[
    {name:"vast",children:[{name:"mijn · jouw · uw"},{name:"zijn · haar"},{name:"jullie · hun"}]},
    {name:"variabel",children:[{name:"onze + de-woord"},{name:"ons + het-woord"}]},
    {name:"zelfstandig",children:[{name:"de mijne / het onze"}]}
  ]}
},
{
  id:"a1-tt", level:"A1", nr:4, title:"Tegenwoordige tijd",
  kern:"ik = stam, jij/u/hij/zij/het = stam + t, meervoud = infinitief.",
  tips:[
    "Stam = infinitief min -en, daarna spelling herstellen: maken → maak, lezen → lees.",
    "Inversie kost de t: jij werkt → werk jij?",
    "Stam eindigt al op -t? Dan geen tweede t: zitten → hij zit."
  ],
  val:[
    "Verdubbeling en verenkeling: schrijven → ik schrijf, zwemmen → ik zwem, maar hij zwemt.",
    "v → f en z → s aan het eind van de stam: leven → ik leef, reizen → ik reis.",
    "Onregelmatig kernrijtje: zijn (ben/bent/is), hebben (heb/hebt/heeft), kunnen (kan/kunt/kan), zullen (zal/zult/zal)."
  ],
  recall:["Geef de drie uitgangsregels.","Vervoeg zijn, hebben en kunnen volledig.","Wat gebeurt er met de -t bij inversie?"],
  gen:"tt",
  map:{name:"Tegenwoordige tijd",children:[
    {name:"regel",children:[{name:"ik = stam"},{name:"jij/hij = stam+t"},{name:"wij/jullie/zij = infinitief"}]},
    {name:"spelling",children:[{name:"aa/ee bewaren"},{name:"medeklinker verdubbelen"},{name:"v→f · z→s"}]},
    {name:"uitzonderingen",children:[{name:"zijn · hebben"},{name:"kunnen · zullen · gaan"},{name:"inversie: werk jij?"}]}
  ]}
},
{
  id:"a1-zijn-hebben", level:"A1", nr:5, title:"Zijn en hebben",
  kern:"Twee werkwoorden die je nooit mag missen — als zelfstandig werkwoord én als hulpwerkwoord.",
  tips:[
    "zijn: ben, bent, is, zijn. hebben: heb, hebt/heeft, heeft, hebben.",
    "Hulpwerkwoord zijn bij verandering van toestand of plaats: gaan, komen, worden, blijven, gebeuren, beginnen, stoppen.",
    "Bij 'zijn' als hulpwerkwoord is de nadruk resultaat: 'Ik ben naar Gent gegaan' (ik ben er geweest)."
  ],
  val:[
    "'u heeft' en 'u hebt' zijn allebei correct; 'jij heeft' is fout.",
    "Beweging mét doel → zijn, beweging als activiteit → hebben: 'Ik ben naar huis gefietst' vs 'Ik heb de hele dag gefietst'.",
    "'zijn geweest' niet '*hebben geweest'."
  ],
  recall:["Vervoeg zijn en hebben in tt en ovt.","Noem vijf werkwoorden met hulpwerkwoord zijn.","Wanneer kan hetzelfde werkwoord beide hulpwerkwoorden hebben?"],
  map:{name:"zijn & hebben",children:[
    {name:"zijn",children:[{name:"ben/bent/is/zijn"},{name:"was/waren · geweest"},{name:"hulpww bij verandering"}]},
    {name:"hebben",children:[{name:"heb/hebt/heeft/hebben"},{name:"had/hadden · gehad"},{name:"standaard hulpww"}]}
  ]}
},
{
  id:"a1-volgorde", level:"A1", nr:6, title:"Basis woordvolgorde (V2)",
  kern:"In de hoofdzin staat de persoonsvorm altijd op plaats twee; de rest van de werkwoordsgroep gaat naar het einde.",
  tips:[
    "Denk in een tang: persoonsvorm vooraan, infinitief/deelwoord achteraan, de rest ertussen.",
    "Middenveld-volgorde: tijd — manier — plaats (TMP). 'Ik ga morgen met de trein naar Brussel.'",
    "Wat op plaats 1 staat, bepaalt niet de betekenis maar de nadruk."
  ],
  val:[
    "Twee werkwoorden? Alleen de persoonsvorm blijft vooraan: 'Ik wil vanavond een film kijken.'",
    "Nooit twee zinsdelen vóór de persoonsvorm: '*Morgen ik ga' → 'Morgen ga ik'.",
    "Het lijdend voorwerp met lidwoord komt ná de tijd- en plaatsbepaling niet: 'Ik heb gisteren een boek gekocht'."
  ],
  recall:["Waar staat de persoonsvorm in een hoofdzin?","Wat is de TMP-volgorde?","Wat gebeurt er als de zin met een bepaling begint?"],
  map:{name:"V2 hoofdzin",children:[
    {name:"plaats 1",children:[{name:"onderwerp"},{name:"bepaling → inversie"}]},
    {name:"plaats 2",children:[{name:"persoonsvorm"}]},
    {name:"middenveld",children:[{name:"tijd"},{name:"manier"},{name:"plaats"}]},
    {name:"eindveld",children:[{name:"infinitief"},{name:"voltooid deelwoord"},{name:"scheidbaar deel"}]}
  ]}
},
{
  id:"a1-vragen", level:"A1", nr:7, title:"Vragen vormen",
  kern:"Ja/nee-vraag = werkwoord vooraan; open vraag = vraagwoord + werkwoord + onderwerp.",
  tips:[
    "Geen hulpwerkwoord zoals het Engelse 'do': 'Werk je?' niet '*Doe je werken?'.",
    "Vraagwoorden: wie, wat, waar, wanneer, waarom, hoe, welk(e), hoeveel, hoelang.",
    "Voorzetsel + wat wordt waar + voorzetsel: waarover, waarmee, waarvan."
  ],
  val:[
    "De -t verdwijnt bij inversie met jij: 'Kom je?' niet '*Komt je?' — maar bij u en hij blijft hij: 'Komt u?'.",
    "welk bij het-woorden, welke bij de-woorden en meervoud.",
    "Indirecte vraag is een bijzin: 'Ik weet niet waar hij woont' — werkwoord achteraan."
  ],
  recall:["Hoe maak je een ja/nee-vraag?","Noem acht vraagwoorden.","Wat gebeurt er met 'met wat'?"],
  map:{name:"Vragen",children:[
    {name:"ja/nee",children:[{name:"persoonsvorm op 1"},{name:"jij verliest -t"}]},
    {name:"open",children:[{name:"vraagwoord + pv + ond."},{name:"welk / welke"}]},
    {name:"voorzetsel",children:[{name:"waar + over/mee/van"},{name:"personen: met wie"}]},
    {name:"indirect",children:[{name:"bijzin → ww achteraan"}]}
  ]}
},
{
  id:"a1-ontkenning", level:"A1", nr:8, title:"Ontkenning — niet vs geen",
  kern:"geen vóór onbepaalde zelfstandige naamwoorden, niet in alle andere gevallen.",
  tips:[
    "Test: staat er 'een' of niets vóór het naamwoord? → geen. Staat er de/het/mijn/dit? → niet.",
    "niet staat vóór het woord dat je ontkent: bijvoeglijk naamwoord, bijwoord, voorzetselgroep.",
    "Ontken je de hele zin? Dan staat niet zo laat mogelijk, maar vóór de werkwoordsgroep aan het einde."
  ],
  val:[
    "'Ik heb niet een auto' → 'Ik heb geen auto'.",
    "Vaste uitdrukkingen zonder lidwoord nemen ook geen: geen tijd, geen zin, geen honger, geen geld.",
    "'niet' vóór het voltooid deelwoord: 'Ik heb hem niet gezien'."
  ],
  recall:["Geef de test voor niet vs geen.","Waar staat 'niet' in 'Ik ken die man niet'?","Wat doe je bij 'Ik heb tijd'?"],
  map:{name:"Ontkenning",children:[
    {name:"geen",children:[{name:"+ onbepaald zn"},{name:"vaste uitdrukkingen"}]},
    {name:"niet",children:[{name:"bij bepaald zn"},{name:"bij adj/bijwoord"},{name:"hele zin → laat"}]}
  ]}
},
{
  id:"a1-meervoud", level:"A1", nr:9, title:"Meervoud",
  kern:"Standaard -en; -s na onbeklemtoonde lettergreep (-el, -em, -en, -er, -je) en na klinker met apostrof.",
  tips:[
    "Spelling: open lettergreep bewaren (raam → ramen), medeklinker verdubbelen (bal → ballen).",
    "f → v en s → z tussen klinkers: brief → brieven, huis → huizen.",
    "Apostrof bij a, i, o, u, y: foto's, taxi's, menu's — maar niet bij e: cafés."
  ],
  val:[
    "Onregelmatig: kind → kinderen, ei → eieren, stad → steden, schip → schepen, koe → koeien.",
    "Woorden op -heid → -heden: mogelijkheid → mogelijkheden.",
    "museum → musea/museums, medium → media — Latijnse restanten."
  ],
  recall:["Wanneer -s en wanneer -en?","Geef vijf onregelmatige meervouden.","Wanneer schrijf je een apostrof?"],
  gen:"meervoud",
  map:{name:"Meervoud",children:[
    {name:"-en",children:[{name:"standaard"},{name:"spelling: ramen/ballen"},{name:"f→v · s→z"}]},
    {name:"-s",children:[{name:"-el -em -en -er"},{name:"-je"},{name:"klinker + 's"}]},
    {name:"onregelmatig",children:[{name:"kind → kinderen"},{name:"stad → steden"},{name:"-heid → -heden"}]}
  ]}
},
{
  id:"a1-getallen", level:"A1", nr:10, title:"Getallen, tijd en datum",
  kern:"Eenheden vóór tientallen (eenentwintig) en de klok telt naar het volgende uur toe.",
  tips:[
    "half tien = 9:30 — je bent halverwege op weg naar tien.",
    "kwart over / kwart voor, en tien voor half zeven = 6:20.",
    "Datum: 3 maart 2026 → 'de derde maart'; jaartallen: negentienhonderdtachtig / tweeduizend zes."
  ],
  val:[
    "Nooit 'twintig-een': altijd eenentwintig, tweeëntwintig (met trema).",
    "Officiële tijd (station, afspraak) gebruikt gewoon 'negen uur dertig'.",
    "Rangtelwoorden: -de tot 19, -ste vanaf 20; uitzonderingen eerste, derde, achtste."
  ],
  recall:["Hoe zeg je 7:45 en 6:20?","Hoe schrijf je 21, 22, 33?","Wanneer -de en wanneer -ste?"],
  map:{name:"Getallen & tijd",children:[
    {name:"getallen",children:[{name:"eenheid + en + tiental"},{name:"trema: tweeëntwintig"},{name:"honderd/duizend"}]},
    {name:"klok",children:[{name:"half = -30 vooruit"},{name:"kwart over/voor"},{name:"x voor/over half"}]},
    {name:"datum",children:[{name:"rangtelwoord + maand"},{name:"-de / -ste"}]}
  ]}
},
/* ================================ A2 ================================ */
{
  id:"a2-imperfectum", level:"A2", nr:11, title:"Imperfectum (ovt)",
  kern:"Zwak: stam + te(n)/de(n) volgens 't kofschip; sterk: klinkerwisseling die je uit je hoofd kent.",
  tips:[
    "'t kofschip / 't fokschaap: eindigt de stam op t, k, f, s, ch, p → -te(n), anders -de(n).",
    "Kijk naar de stam, niet naar de infinitief: verhuizen → stam verhuis → maar de z hoort er eigenlijk bij → verhuisde.",
    "Meervoud = enkelvoud + n: werkte → werkten, liep → liepen."
  ],
  val:[
    "Bij v en z hoor je f/s maar de oorspronkelijke letter telt: leven → leefde, reizen → reisde.",
    "Verwar ovt niet met perfectum in verhalen: Nederlands vertelt in de ovt, niet in het perfectum zoals spreektaal-Engels.",
    "Sterke werkwoorden hebben een apart meervoud: ik was → wij waren, ik zag → wij zagen."
  ],
  recall:["Zeg 't kofschip op.","Geef de ovt van werken, leven, reizen, praten.","Wat is het verschil tussen ik zag en wij zagen?"],
  gen:"ovt",
  map:{name:"Imperfectum",children:[
    {name:"zwak",children:[{name:"'t kofschip → -te"},{name:"anders → -de"},{name:"v/z tellen als d-groep"}]},
    {name:"sterk",children:[{name:"klinkerwisseling"},{name:"eigen meervoud"},{name:"lopen → liep/liepen"}]},
    {name:"gebruik",children:[{name:"verhalen"},{name:"gewoonte vroeger"},{name:"na 'toen'"}]}
  ]}
},
{
  id:"a2-perfectum", level:"A2", nr:12, title:"Perfectum — ge- + d/t",
  kern:"hebben/zijn + voltooid deelwoord; zwak deelwoord = ge + stam + d/t volgens 't kofschip.",
  tips:[
    "Het deelwoord staat aan het einde van de zin.",
    "Sterk deelwoord eindigt op -en: gelopen, geschreven, gedronken.",
    "Kies het hulpwerkwoord bij het werkwoord, niet bij de tijd."
  ],
  val:[
    "'t kofschip geldt ook hier: werken → gewerkt, maar leren → geleerd.",
    "Stam eindigt op d? Dan geen dubbele d: antwoorden → geantwoord, niet '*geantwoordd'.",
    "Onregelmatig: brengen → gebracht, denken → gedacht, kopen → gekocht, zoeken → gezocht."
  ],
  recall:["Hoe bouw je een zwak voltooid deelwoord?","Wanneer hebben en wanneer zijn?","Geef vijf sterke deelwoorden."],
  gen:"vd",
  map:{name:"Perfectum",children:[
    {name:"hulpww",children:[{name:"hebben (standaard)"},{name:"zijn (verandering/beweging)"}]},
    {name:"deelwoord zwak",children:[{name:"ge + stam + t ('t kofschip)"},{name:"ge + stam + d"},{name:"geen dubbele d/t"}]},
    {name:"deelwoord sterk",children:[{name:"ge + ... + en"},{name:"klinkerwisseling"}]},
    {name:"plaats",children:[{name:"einde hoofdzin"}]}
  ]}
},
{
  id:"a2-zonder-ge", level:"A2", nr:13, title:"Werkwoorden zonder ge-",
  kern:"Werkwoorden met een onbeklemtoond voorvoegsel (be-, ge-, her-, ont-, ver-, er-) krijgen geen ge- in het deelwoord.",
  tips:[
    "Ezelsbruggetje: BE-GE-HER-ONT-VER-ER.",
    "Ook werkwoorden op -eren van vreemde herkomst met klemtoon achteraan houden hun ge-: studeren → gestudeerd (wel ge-!).",
    "Test: hoor je de klemtoon op het voorvoegsel? Dan is het scheidbaar en komt ge- ertussen."
  ],
  val:[
    "betalen → betaald (niet '*gebetaald'), vertellen → verteld, ontmoeten → ontmoet, herhalen → herhaald.",
    "ontmoeten en verwachten eindigen al op t: het deelwoord krijgt er geen tweede bij.",
    "Voorvoegsel over-/onder-/door- kan beide: ómkijken (scheidbaar) vs overtréffen (onscheidbaar)."
  ],
  recall:["Noem de zes voorvoegsels zonder ge-.","Wat is het deelwoord van vertellen, ontmoeten, herhalen?","Waarom heeft studeren wél ge-?"],
  map:{name:"Zonder ge-",children:[
    {name:"voorvoegsels",children:[{name:"be- · ge- · her-"},{name:"ont- · ver- · er-"}]},
    {name:"gevolg",children:[{name:"deelwoord zonder ge-"},{name:"onscheidbaar"},{name:"klemtoon op stam"}]},
    {name:"contrast",children:[{name:"scheidbaar: opgebeld"},{name:"-eren: gestudeerd"}]}
  ]}
},
{
  id:"a2-scheidbaar", level:"A2", nr:14, title:"Scheidbare en onscheidbare werkwoorden",
  kern:"Klemtoon op het voorvoegsel → scheidbaar; klemtoon op de stam → onscheidbaar.",
  tips:[
    "Scheidbaar in de hoofdzin: het deel schuift naar het einde. 'Ik bel je morgen op.'",
    "Deelwoord van scheidbaar: voorvoegsel + ge + stam: opgebeld, meegenomen, aangekomen.",
    "Met 'te': het te komt ertussen — 'om op te bellen'."
  ],
  val:[
    "In de bijzin blijft alles samen: 'Ik zei dat ik je morgen opbel.'",
    "Onscheidbaar blijft altijd één woord: vertellen, begrijpen, ondergaan (ondergáán).",
    "Sommige paren verschillen alleen in klemtoon en betekenis: óndergaan (zinken) vs ondergáán (ervaren)."
  ],
  recall:["Hoe test je scheidbaarheid?","Waar staat het voorvoegsel in een hoofdzin?","Hoe ziet het deelwoord eruit?"],
  map:{name:"Scheidbaarheid",children:[
    {name:"scheidbaar",children:[{name:"klemtoon op voorvoegsel"},{name:"hoofdzin: deel naar einde"},{name:"op-ge-beld"},{name:"om op te bellen"}]},
    {name:"onscheidbaar",children:[{name:"klemtoon op stam"},{name:"blijft samen"},{name:"geen ge-"}]},
    {name:"bijzin",children:[{name:"altijd weer samen"}]}
  ]}
},
{
  id:"a2-verkleinwoord", level:"A2", nr:15, title:"Verkleinwoorden",
  kern:"-je met varianten -tje, -etje, -pje, -kje; het resultaat is altijd een het-woord.",
  tips:[
    "Na klinker, l, n, r, w → -tje: autootje, stoeltje, deurtje.",
    "Na korte klinker + l, m, n, ng, r → -etje: balletje, mannetje, ringetje.",
    "Na lange klinker/l/r + m → -pje: raampje, filmpje, bloempje. Na -ing → -kje: koninkje."
  ],
  val:[
    "Verkleinwoord ≠ altijd klein: 'een biertje', 'een uurtje', 'even een vraagje' — het is toon, geen formaat.",
    "Meervoud is altijd -s: huisjes, kopjes.",
    "Bepaalde woorden hebben een vaste betekenis: toetje (dessert), broodje (sandwich)."
  ],
  recall:["Noem de vijf vormen met een voorbeeld.","Welk lidwoord krijgt een verkleinwoord?","Wat is het meervoud van kopje?"],
  gen:"verkleinwoord",
  map:{name:"Verkleinwoord",children:[
    {name:"-je",children:[{name:"standaard: boekje"}]},
    {name:"-tje",children:[{name:"na klinker/l/n/r/w"}]},
    {name:"-etje",children:[{name:"korte klinker + l/m/n/ng/r"}]},
    {name:"-pje / -kje",children:[{name:"na m → -pje"},{name:"na -ing → -kje"}]},
    {name:"gevolgen",children:[{name:"altijd het-woord"},{name:"meervoud -s"},{name:"toon/nuance"}]}
  ]}
},
{
  id:"a2-bijvoeglijk", level:"A2", nr:16, title:"Bijvoeglijk naamwoord + verbuiging",
  kern:"Het adjectief krijgt -e, behalve bij 'een + het-woord' zonder lidwoord-bepaaldheid.",
  tips:[
    "de grote man · het grote huis · een grote man · een groot huis · grote huizen.",
    "Na 'geen', 'elk', 'ieder', 'zo'n' + het-woord blijft het adjectief ook kaal: geen groot huis.",
    "Predicatief (na zijn/worden/blijven) nooit een -e: 'Het huis is groot'."
  ],
  val:[
    "Materiaaladjectieven op -en verbuigen niet: een houten tafel, het gouden horloge.",
    "Adjectieven op -e blijven onveranderd: een oranje jas.",
    "Bij vergelijkende trap gelden dezelfde regels: een groter huis, het grotere huis."
  ],
  recall:["Wanneer géén -e?","Wat gebeurt er na 'zijn'?","Geef het patroon voor de/het/een × groot."],
  map:{name:"Adjectief",children:[
    {name:"met -e",children:[{name:"de-woord altijd"},{name:"het-woord met 'het'"},{name:"meervoud altijd"}]},
    {name:"zonder -e",children:[{name:"een + het-woord"},{name:"geen/elk/zo'n + het-woord"},{name:"predicatief"}]},
    {name:"nooit",children:[{name:"materiaal: houten"},{name:"eindigt op -e: oranje"}]}
  ]}
},
{
  id:"a2-trappen", level:"A2", nr:17, title:"Comparatief en superlatief",
  kern:"-er en -st; onregelmatig goed/beter/best, veel/meer/meest, weinig/minder/minst.",
  tips:[
    "Na -r komt -der: duur → duurder, zwaar → zwaarder.",
    "Lange woorden en woorden op -st(e) gebruiken meer/meest: meer geïnteresseerd, meest complex.",
    "Vergelijking gelijk: net zo ... als. Ongelijk: ...-er dan."
  ],
  val:[
    "'groter als' is spreektaal en fout in schrijftaal: gebruik 'groter dan'.",
    "Superlatief met lidwoord: 'de mooiste stad', predicatief vaak 'het mooist'.",
    "graag → liever → liefst; dat is een bijwoord, geen adjectief."
  ],
  recall:["Geef de drie onregelmatige rijtjes.","Wanneer -der?","Dan of als?"],
  map:{name:"Trappen",children:[
    {name:"comparatief",children:[{name:"+ -er"},{name:"na -r → -der"},{name:"meer + lang woord"}]},
    {name:"superlatief",children:[{name:"+ -st"},{name:"meest + lang woord"},{name:"de ...-ste / het ...-st"}]},
    {name:"onregelmatig",children:[{name:"goed/beter/best"},{name:"veel/meer/meest"},{name:"graag/liever/liefst"}]},
    {name:"vergelijken",children:[{name:"-er dan"},{name:"net zo ... als"}]}
  ]}
},
{
  id:"a2-modaal", level:"A2", nr:18, title:"Modale werkwoorden",
  kern:"kunnen, moeten, mogen, willen, zullen (+ hoeven te) sturen een infinitief naar het einde.",
  tips:[
    "Geen 'te' na modale werkwoorden — behalve na hoeven: 'Je hoeft niet te komen'.",
    "moeten = verplichting; niet hoeven = geen verplichting; niet mogen = verbod.",
    "zullen voor voorstellen ('Zullen we gaan?') en beloftes."
  ],
  val:[
    "'Ik moet niet' betekent in Vlaanderen vaak 'ik hoef niet', in Nederland 'ik mag niet' — schrijf duidelijk 'hoef niet'.",
    "Perfectum van modale werkwoorden gebruikt de infinitief: 'Ik heb het niet kunnen doen' (niet '*gekund' als er een tweede werkwoord staat).",
    "kunnen = in staat zijn én mogelijkheid; mogen = toestemming."
  ],
  recall:["Noem de zes modale werkwoorden.","Welk werkwoord vraagt 'te'?","Wat is het verschil tussen 'niet moeten' en 'niet mogen'?"],
  map:{name:"Modaal",children:[
    {name:"vormen",children:[{name:"kan/kunt · moet · mag"},{name:"wil · zal · hoeft"}]},
    {name:"betekenis",children:[{name:"vermogen: kunnen"},{name:"verplichting: moeten"},{name:"toestemming: mogen"},{name:"wens: willen"}]},
    {name:"syntaxis",children:[{name:"infinitief achteraan"},{name:"geen te (behalve hoeven)"},{name:"perfectum met infinitief"}]}
  ]}
},
{
  id:"a2-voorzetsel", level:"A2", nr:19, title:"Voorzetsels (basis)",
  kern:"Plaats, tijd en richting: in/op/aan/bij/naar/van/voor/achter/onder/met/zonder/door/over/uit.",
  tips:[
    "naar = richting, in/op = positie: 'Ik ga naar school' vs 'Ik ben op school'.",
    "op voor dagen en oppervlakken (op maandag, op tafel), in voor maanden/jaren/steden (in mei, in Gent).",
    "om + uur, van ... tot, sinds + startpunt, al + duur."
  ],
  val:[
    "'op de trein' (BE) vs 'in de trein' (NL) — beide hoor je in Vlaanderen, kies bewust.",
    "bij = in de buurt/bij iemand thuis; met = middel of gezelschap.",
    "Verwar 'voor' (tijd: vóór 6 uur / doel: voor jou) niet met 'vóór' (plaats)."
  ],
  recall:["op of in bij dagen, maanden, jaren?","Wat is het verschil tussen naar en in?","Geef vijf voorzetsels van plaats."],
  map:{name:"Voorzetsels",children:[
    {name:"plaats",children:[{name:"in · op · aan · bij"},{name:"onder · boven · naast"}]},
    {name:"richting",children:[{name:"naar · van · door · uit"}]},
    {name:"tijd",children:[{name:"om · op · in"},{name:"sinds · vanaf · tot"}]},
    {name:"overig",children:[{name:"met · zonder · voor"}]}
  ]}
},
{
  id:"a2-er", level:"A2", nr:20, title:"Er-constructie (intro)",
  kern:"er als plaatsaanduiding ('daar') en als voorlopig onderwerp ('there is/are').",
  tips:[
    "'Er staat een fiets voor de deur' — onbepaald onderwerp vraagt om er.",
    "Bepaald onderwerp? Dan geen er: 'De fiets staat voor de deur'.",
    "In de bijzin blijft er vlak na het voegwoord/onderwerp staan."
  ],
  val:[
    "Vergeet er niet bij onbepaalde onderwerpen — zonder er klinkt de zin onaf.",
    "Bij inversie verschuift er: 'Vandaag zijn er veel mensen'.",
    "Meervoud verandert niets aan er: 'Er zijn drie redenen'."
  ],
  recall:["Wanneer heb je er nodig als voorlopig onderwerp?","Wat gebeurt er bij een bepaald onderwerp?","Waar staat er in een bijzin?"],
  map:{name:"er (intro)",children:[
    {name:"plaats-er",children:[{name:"vervangt daar"},{name:"'Ik woon er'"}]},
    {name:"voorlopig onderwerp",children:[{name:"onbepaald onderwerp"},{name:"Er is / Er zijn"},{name:"niet bij bepaald onderwerp"}]}
  ]}
},
/* ================================ B1 ================================ */
{
  id:"b1-bijzin", level:"B1", nr:21, title:"Bijzinnen — werkwoord op het einde",
  kern:"Na een onderschikkend voegwoord gaat de hele werkwoordsgroep naar het einde van de bijzin.",
  tips:[
    "Voegwoorden: dat, omdat, terwijl, hoewel, als, toen, zodat, of, voordat, nadat, sinds, zolang.",
    "Staat de bijzin vooraan? Dan volgt inversie in de hoofdzin: 'Omdat het regende, bleven we thuis.'",
    "De bijzin telt als één zinsdeel — samen goed voor plaats 1."
  ],
  val:[
    "'want' is nevenschikkend (gewone volgorde), 'omdat' onderschikkend (werkwoord achteraan).",
    "Scheidbaar werkwoord blijft in de bijzin één woord: '... dat hij mij opbelt'.",
    "Bij twee werkwoorden mag de volgorde beide kanten op: '... dat ik het gedaan heb / heb gedaan'."
  ],
  recall:["Noem acht onderschikkende voegwoorden.","Waar staat het werkwoord in de bijzin?","Wat gebeurt er in de hoofdzin als de bijzin vooropstaat?"],
  map:{name:"Bijzin",children:[
    {name:"voegwoord",children:[{name:"dat · of"},{name:"omdat · doordat"},{name:"toen · als · wanneer"},{name:"hoewel · terwijl · zodat"}]},
    {name:"volgorde",children:[{name:"ww-groep achteraan"},{name:"scheidbaar blijft samen"},{name:"rood/groen bij 2 ww"}]},
    {name:"vooropplaatsing",children:[{name:"bijzin = plaats 1"},{name:"→ inversie hoofdzin"}]}
  ]}
},
{
  id:"b1-inversie", level:"B1", nr:22, title:"Inversie",
  kern:"Staat er iets anders dan het onderwerp op plaats 1, dan komt het onderwerp direct na de persoonsvorm.",
  tips:[
    "Typische starters: tijdsbepalingen, plaatsbepalingen, bijzinnen, 'toch', 'daarom', 'dus'.",
    "Inversie geeft nadruk aan wat vooraan staat — gebruik het om je tekst te laten stromen.",
    "Na een nevenschikkend voegwoord (en, maar, want, of, dus) is er géén inversie."
  ],
  val:[
    "'Daarom ik ga' is fout → 'Daarom ga ik'.",
    "Na 'want' blijft de volgorde normaal: 'want ik ben moe' — na 'daarom' niet.",
    "Bij inversie verliest jij zijn -t niet in een mededelende zin: 'Morgen werk jij' — inversie in een vraag wél: 'Werk jij?'"
  ],
  recall:["Wat triggert inversie?","Geef drie starters die inversie veroorzaken.","Waarom is er geen inversie na 'en'?"],
  map:{name:"Inversie",children:[
    {name:"trigger",children:[{name:"bepaling op plaats 1"},{name:"bijzin op plaats 1"},{name:"vraagwoord"}]},
    {name:"gevolg",children:[{name:"pv → onderwerp"}]},
    {name:"geen inversie",children:[{name:"na en/maar/want/of/dus"}]}
  ]}
},
{
  id:"b1-conditioneel", level:"B1", nr:23, title:"Voorwaardelijke wijs — zou",
  kern:"zou(den) + infinitief: beleefdheid, hypothese en toekomst-in-het-verleden.",
  tips:[
    "'Zou je me kunnen helpen?' is de beleefdste vorm.",
    "Onvervulde voorwaarde: 'Als ik tijd had, zou ik komen.' — ovt in de als-zin.",
    "In het verleden: 'Als ik het geweten had, was ik gekomen / zou ik gekomen zijn.'"
  ],
  val:[
    "Na 'als' geen 'zou': '*Als ik zou tijd hebben' → 'Als ik tijd had'.",
    "'zouden' bij meervoud: 'Zij zouden komen'.",
    "'zou moeten' = advies; 'moest' in de als-zin is Vlaams-informeel."
  ],
  recall:["Geef de drie functies van zou.","Welke tijd staat er in de als-zin?","Hoe maak je een beleefd verzoek?"],
  map:{name:"zou",children:[
    {name:"beleefd",children:[{name:"Zou u ...?"},{name:"Ik zou graag ..."}]},
    {name:"hypothese",children:[{name:"Als + ovt, zou + inf"},{name:"irrealis verleden"}]},
    {name:"toekomst in verleden",children:[{name:"Hij zei dat hij zou komen"}]}
  ]}
},
{
  id:"b1-reflexief", level:"B1", nr:24, title:"Wederkerende werkwoorden",
  kern:"me/je/zich/ons/je/zich hoort verplicht bij bepaalde werkwoorden en staat vroeg in de zin.",
  tips:[
    "Kernlijst: zich herinneren, zich vergissen, zich vervelen, zich haasten, zich voelen, zich bevinden, zich concentreren.",
    "Het wederkerend voornaamwoord staat direct na de persoonsvorm (of na het onderwerp in de bijzin).",
    "Nadrukkelijk: mezelf, jezelf, zichzelf."
  ],
  val:[
    "Vergeet 'zich' niet: '*Ik herinner dat niet' → 'Ik herinner me dat niet'.",
    "Sommige werkwoorden zijn optioneel wederkerend met betekenisverschil: wassen vs zich wassen.",
    "In de infinitiefgroep blijft het voornaamwoord vooraan: 'Ik probeer me te concentreren'."
  ],
  recall:["Noem zes wederkerende werkwoorden.","Waar staat 'me' in de zin?","Wanneer gebruik je 'zichzelf'?"],
  map:{name:"Wederkerend",children:[
    {name:"vormen",children:[{name:"me · je · zich"},{name:"ons · je · zich"},{name:"-zelf voor nadruk"}]},
    {name:"vaste werkwoorden",children:[{name:"zich herinneren"},{name:"zich vergissen"},{name:"zich vervelen"},{name:"zich haasten"}]},
    {name:"plaats",children:[{name:"vlak na de pv"},{name:"bijzin: na onderwerp"}]}
  ]}
},
{
  id:"b1-plusquam", level:"B1", nr:25, title:"Plusquamperfectum",
  kern:"had(den)/was(waren) + voltooid deelwoord: het verleden vóór het verleden.",
  tips:[
    "Gebruik het na 'nadat' en 'toen' om volgorde te verduidelijken.",
    "'Nadat ik gegeten had, ging ik weg.' — eerst eten, dan weggaan.",
    "Hulpwerkwoord kiest hetzelfde als in het perfectum."
  ],
  val:[
    "Na 'nadat' hoort plusquamperfectum, na 'voordat' meestal geen: 'Voordat ik ging, belde ik hem'.",
    "Niet gebruiken waar het perfectum volstaat — het markeert alleen voorafgaandelijkheid.",
    "In irreële zinnen: 'Als ik dat geweten had, was ik gebleven.'"
  ],
  recall:["Hoe vorm je het plusquamperfectum?","Bij welk voegwoord hoort het?","Wat is het verschil met perfectum?"],
  map:{name:"Plusquamperfectum",children:[
    {name:"vorm",children:[{name:"had + vd"},{name:"was + vd"}]},
    {name:"gebruik",children:[{name:"na nadat"},{name:"volgorde verduidelijken"},{name:"irrealis verleden"}]}
  ]}
},
{
  id:"b1-passief", level:"B1", nr:26, title:"Lijdende vorm",
  kern:"worden + voltooid deelwoord (proces), zijn + voltooid deelwoord (resultaat/perfectum), dader met 'door'.",
  tips:[
    "tt: 'De brief wordt geschreven.' ovt: 'werd geschreven'. perfectum: 'is geschreven' (Vlaams ook 'is geworden' vermijden).",
    "Het lijdend voorwerp van de actieve zin wordt onderwerp.",
    "Onpersoonlijk passief bestaat: 'Er wordt gedanst.'"
  ],
  val:[
    "Perfectum passief laat 'geworden' weg: 'De brief is verstuurd', niet '*is verstuurd geworden'.",
    "Alleen werkwoorden met een lijdend voorwerp kunnen passief.",
    "Formeel schrijven leunt op het passief; in spreektaal is 'je/men' vaak natuurlijker."
  ],
  recall:["Geef het passief in tt, ovt en perfectum.","Hoe noem je de dader?","Wat is onpersoonlijk passief?"],
  map:{name:"Passief",children:[
    {name:"worden + vd",children:[{name:"tt: wordt"},{name:"ovt: werd"},{name:"proces"}]},
    {name:"zijn + vd",children:[{name:"perfectum"},{name:"resultaat"},{name:"geen 'geworden'"}]},
    {name:"dader",children:[{name:"door + persoon"},{name:"vaak weggelaten"}]},
    {name:"onpersoonlijk",children:[{name:"Er wordt gewerkt"}]}
  ]}
},
{
  id:"b1-te", level:"B1", nr:27, title:"te + infinitief / om te",
  kern:"Veel werkwoorden vragen 'te' vóór de infinitief; 'om te' drukt doel uit.",
  tips:[
    "Met te: proberen, beginnen, hopen, vergeten, beloven, weigeren, durven, besluiten, verwachten.",
    "Zonder te: modale werkwoorden, gaan, komen, blijven, zien, horen, laten, helpen.",
    "Doel = om te: 'Ik studeer om beter te worden.'"
  ],
  val:[
    "Scheidbaar werkwoord splitst rond te: 'om op te bellen', 'om mee te gaan'.",
    "'Het is moeilijk om dat te doen' — na een adjectief gebruik je om te.",
    "Na 'zonder' en 'in plaats van' ook te: 'zonder iets te zeggen'."
  ],
  recall:["Noem zes werkwoorden met te.","Noem vijf zonder te.","Waar staat te bij een scheidbaar werkwoord?"],
  map:{name:"te + infinitief",children:[
    {name:"met te",children:[{name:"proberen · beginnen"},{name:"hopen · beloven"},{name:"vergeten · weigeren"}]},
    {name:"zonder te",children:[{name:"modale ww"},{name:"gaan · komen · blijven"},{name:"zien · horen · laten"}]},
    {name:"om te",children:[{name:"doel"},{name:"na adjectief"},{name:"zonder/in plaats van + te"}]},
    {name:"scheidbaar",children:[{name:"op te bellen"}]}
  ]}
},
{
  id:"b1-relatief", level:"B1", nr:28, title:"Relatieve bijzinnen — die, dat, wat, waar+",
  kern:"die bij de-woorden, dat bij het-woorden, wat na onbepaalde woorden, waar+voorzetsel bij zaken.",
  tips:[
    "'De man die daar staat' · 'Het huis dat te koop staat'.",
    "Zaken met voorzetsel: 'de stoel waarop ik zit', 'het boek waarover ik sprak'.",
    "Personen met voorzetsel: 'de vrouw met wie ik werk'."
  ],
  val:[
    "Na alles, niets, iets, het mooiste → wat: 'Alles wat ik zei'.",
    "'*het boek dat ik over sprak' → 'waarover ik sprak' of 'waar ik over sprak' (splitsen mag).",
    "Het werkwoord van de relatieve bijzin staat achteraan."
  ],
  recall:["die of dat — hoe kies je?","Wanneer 'wat'?","Hoe maak je 'de tafel op ... ' relatief?"],
  map:{name:"Relatief",children:[
    {name:"die",children:[{name:"de-woorden"},{name:"alle meervouden"}]},
    {name:"dat",children:[{name:"het-woorden"}]},
    {name:"wat",children:[{name:"alles/niets/iets"},{name:"overtreffende trap"},{name:"hele zin"}]},
    {name:"waar + vz",children:[{name:"zaken: waarover"},{name:"splitsbaar: waar ... over"},{name:"personen: met wie"}]}
  ]}
},
{
  id:"b1-voegwoord", level:"B1", nr:29, title:"Voegwoorden: neven- of onderschikkend",
  kern:"en, maar, of, want, dus laten de volgorde staan; alle andere sturen het werkwoord naar achteren.",
  tips:[
    "Ezelsbruggetje voor nevenschikkend: EMOWD — en, maar, of, want, dus.",
    "want geeft reden vanuit de spreker, omdat geeft objectieve oorzaak — 'Waarom?' beantwoord je met omdat.",
    "'dus' kan ook bijwoord zijn en dan volgt er inversie: 'Ik was ziek, dus ben ik thuisgebleven.'"
  ],
  val:[
    "'*want ik was moe, ging ik slapen' — want verbindt twee hoofdzinnen, geen inversie erna.",
    "'als' = voorwaarde of herhaling in het verleden; 'toen' = één moment in het verleden; 'wanneer' = vraag of toekomst.",
    "'of' als onderschikkend voegwoord betekent 'whether': 'Ik weet niet of hij komt.'"
  ],
  recall:["Geef EMOWD.","Toen of als?","Wat is het volgordeverschil tussen want en omdat?"],
  map:{name:"Voegwoorden",children:[
    {name:"nevenschikkend",children:[{name:"en · maar · of"},{name:"want · dus"},{name:"volgorde blijft"}]},
    {name:"onderschikkend",children:[{name:"omdat · doordat"},{name:"toen · als · wanneer"},{name:"hoewel · terwijl"},{name:"ww achteraan"}]},
    {name:"valkuilen",children:[{name:"want vs omdat"},{name:"toen vs als"},{name:"of = whether"}]}
  ]}
},
/* ================================ B2 ================================ */
{
  id:"b2-er", level:"B2", nr:30, title:"De vier functies van er",
  kern:"plaats-er, voorlopig onderwerp, voornaamwoordelijk bijwoord (er + voorzetsel) en getal-er.",
  tips:[
    "Voornaamwoordelijk bijwoord: 'Ik denk eraan' — zaken kunnen niet na een voorzetsel staan.",
    "Getal-er: 'Hoeveel boeken heb je?' — 'Ik heb er drie.'",
    "Splitsen mag en klinkt natuurlijker: 'Ik denk er vaak aan.'"
  ],
  val:[
    "Nooit 'aan het' voor zaken: '*Ik denk aan het' → 'Ik denk eraan'.",
    "Meerdere er's stapelen niet: kies de belangrijkste functie.",
    "Bij mensen blijft het voorzetsel + voornaamwoord: 'Ik denk aan hem', niet 'eraan'."
  ],
  recall:["Noem de vier functies met een voorbeeld.","Wat gebeurt er met 'op het' bij een zaak?","Hoe antwoord je op 'Hoeveel heb je er?'"],
  map:{name:"er ×4",children:[
    {name:"plaats",children:[{name:"= daar"},{name:"Ik woon er"}]},
    {name:"voorlopig onderwerp",children:[{name:"Er staat een man"},{name:"onbepaald"}]},
    {name:"vnw-bijwoord",children:[{name:"er + aan/over/mee"},{name:"splitsbaar"},{name:"alleen zaken"}]},
    {name:"getal",children:[{name:"Ik heb er drie"}]}
  ]}
},
{
  id:"b2-partikels", level:"B2", nr:31, title:"Modale partikels",
  kern:"toch, maar, eens, even, wel, nou, dan, hoor, zeker — kleine woorden die toon dragen, geen betekenis.",
  tips:[
    "'Doe maar' = geruststellend. 'Kom eens' = uitnodigend. 'Even' = kleine moeite.",
    "Ze staan in het middenveld, na het onderwerp en de persoonsvorm.",
    "Stapelen mag en klinkt heel natuurlijk: 'Doe dat maar eens even.'"
  ],
  val:[
    "Letterlijk vertalen werkt niet: 'toch' is niet 'still' maar 'contrary to expectation'.",
    "Zonder partikels klinkt je Nederlands correct maar bot — dit is precies wat B2 van B1 onderscheidt.",
    "'hoor' staat achteraan en verzacht: 'Dat is niet erg, hoor.'"
  ],
  recall:["Noem zes partikels met hun toon.","Waar in de zin staan ze?","Wat doet 'even' met een verzoek?"],
  map:{name:"Partikels",children:[
    {name:"verzachten",children:[{name:"maar"},{name:"even"},{name:"hoor"}]},
    {name:"nadruk",children:[{name:"toch"},{name:"wel"},{name:"zeker"}]},
    {name:"uitnodigen",children:[{name:"eens"},{name:"nou"},{name:"dan"}]},
    {name:"plaats",children:[{name:"middenveld"},{name:"stapelbaar"}]}
  ]}
},
{
  id:"b2-indirect", level:"B2", nr:32, title:"Indirecte rede",
  kern:"De tijd schuift een stap terug, voornaamwoorden en tijdsaanduidingen schuiven mee, en er komt een bijzin.",
  tips:[
    "tt → ovt, perfectum → plusquamperfectum, zal → zou.",
    "Ja/nee-vraag wordt 'of': 'Komt hij?' → 'Hij vroeg of hij kwam.'",
    "vandaag → die dag, morgen → de volgende dag, hier → daar."
  ],
  val:[
    "Vergeet de bijzinvolgorde niet: '*Hij zei dat hij kwam morgen' → '... dat hij de volgende dag kwam'.",
    "Bij algemeen geldige waarheden mag de tijd blijven staan.",
    "Open vraag houdt het vraagwoord: 'Hij vroeg waar ik woonde.'"
  ],
  recall:["Hoe schuiven de tijden?","Wat gebeurt er met een ja/nee-vraag?","Hoe verandert 'morgen'?"],
  map:{name:"Indirecte rede",children:[
    {name:"tijdverschuiving",children:[{name:"tt → ovt"},{name:"perf → plusquam"},{name:"zal → zou"}]},
    {name:"vragen",children:[{name:"ja/nee → of"},{name:"open → vraagwoord"}]},
    {name:"deiktisch",children:[{name:"vandaag → die dag"},{name:"hier → daar"},{name:"ik → hij"}]}
  ]}
},
{
  id:"b2-voegwoord", level:"B2", nr:33, title:"Geavanceerde voegwoorden",
  kern:"nadat, voordat, zodra, zolang, naarmate, indien, mits, tenzij, aangezien, opdat, doordat.",
  tips:[
    "mits = op voorwaarde dát wel; tenzij = behalve als niet.",
    "doordat = oorzaak zonder wil, omdat = reden; 'De trein was laat doordat er sneeuw lag.'",
    "naarmate = in dezelfde mate als; 'Naarmate hij ouder werd, ...'"
  ],
  val:[
    "'indien' en 'opdat' zijn formeel — niet in een gesprek.",
    "'zodra' + voltooide tijd voor toekomst: 'Zodra ik klaar ben, bel ik je.'",
    "Al deze voegwoorden zijn onderschikkend: werkwoord achteraan."
  ],
  recall:["Wat is het verschil tussen mits en tenzij?","doordat of omdat?","Noem drie formele voegwoorden."],
  map:{name:"Voegwoorden B2",children:[
    {name:"tijd",children:[{name:"nadat · voordat"},{name:"zodra · zolang"},{name:"naarmate"}]},
    {name:"voorwaarde",children:[{name:"indien"},{name:"mits"},{name:"tenzij"}]},
    {name:"oorzaak",children:[{name:"aangezien"},{name:"doordat"},{name:"opdat (doel)"}]}
  ]}
},
{
  id:"b2-volgorde", level:"B2", nr:34, title:"Werkwoordsvolgorde — rood en groen",
  kern:"In de bijzin mag de tweedelige werkwoordsgroep beide volgordes hebben: 'gedaan heeft' (rood) of 'heeft gedaan' (groen).",
  tips:[
    "Groen (hulpwerkwoord eerst) klinkt Nederlands-modern; rood is in Vlaanderen gebruikelijker.",
    "Bij drie werkwoorden staat het hulpwerkwoord meestal vooraan: '... dat hij het heeft kunnen doen'.",
    "Een infinitief zonder te in een groep dwingt de volgorde: 'dat ik het moet doen' (nooit 'doen moet' in NL-standaard)."
  ],
  val:[
    "Kies één stijl per tekst en blijf consequent.",
    "Bij scheidbaar werkwoord met deelwoord: '... dat hij mij heeft opgebeld' of '... opgebeld heeft'.",
    "Het lijdend voorwerp blijft vóór de werkwoordsgroep."
  ],
  recall:["Wat is rood en wat is groen?","Wat gebeurt er bij drie werkwoorden?","Welke volgorde is Vlaams gebruikelijker?"],
  map:{name:"Rood & groen",children:[
    {name:"rood",children:[{name:"vd + hulpww"},{name:"... gedaan heeft"},{name:"BE-gebruikelijk"}]},
    {name:"groen",children:[{name:"hulpww + vd"},{name:"... heeft gedaan"},{name:"NL-gebruikelijk"}]},
    {name:"3 werkwoorden",children:[{name:"hulpww vooraan"},{name:"heeft kunnen doen"}]}
  ]}
},
{
  id:"b2-vaste", level:"B2", nr:35, title:"Vaste voorzetselcombinaties",
  kern:"Werkwoorden en adjectieven hebben een vast voorzetsel dat je per stuk leert.",
  tips:[
    "denken aan, wachten op, houden van, zorgen voor, bestaan uit, deelnemen aan, rekenen op.",
    "Adjectieven ook: trots op, bang voor, gewend aan, verantwoordelijk voor, geïnteresseerd in.",
    "Bij zaken wordt het voorzetsel een er-vorm: 'Ik reken erop.'"
  ],
  val:[
    "Vertaal het voorzetsel niet uit het Engels: 'wachten op' ≠ 'wait for' letterlijk — leer het paar.",
    "lijden aan (ziekte) vs lijden onder (omstandigheden).",
    "slagen voor (examen) vs slagen in (poging)."
  ],
  recall:["Geef het voorzetsel bij wachten, denken, houden, zorgen, bestaan.","Wat is het verschil tussen lijden aan en onder?","Hoe verwijs je naar een zaak na een vast voorzetsel?"],
  gen:"vz",
  map:{name:"Vaste voorzetsels",children:[
    {name:"aan",children:[{name:"denken · deelnemen"},{name:"lijden · gewend"}]},
    {name:"op",children:[{name:"wachten · rekenen"},{name:"trots · reageren"}]},
    {name:"van",children:[{name:"houden · genieten"},{name:"afhangen"}]},
    {name:"voor",children:[{name:"zorgen · bang"},{name:"slagen · kiezen"}]},
    {name:"in",children:[{name:"geloven · geïnteresseerd"},{name:"slagen in"}]}
  ]}
},
/* ============================== Bijlages ============================== */
{
  id:"bijlage-onregelmatig", level:"Bijlage", nr:42, title:"Onregelmatige werkwoorden",
  kern:"De kernlijst sterk en onregelmatig — infinitief, ovt enkelvoud/meervoud, deelwoord, hulpwerkwoord.",
  tips:["Oefen in rijtjes van klankgroepen: ij → ee → e (blijven, bleef, gebleven).","Leer het hulpwerkwoord altijd mee.","Zeg ze hardop; het is spierwerk, geen begrip."],
  val:["kunnen → kon/konden/gekund, maar met tweede werkwoord: 'heb kunnen doen'.","liggen/leggen en zitten/zetten verwarren is klassiek.","zoeken → zocht, maar spreken → sprak."],
  recall:["Geef de rij van blijven, schrijven, rijden.","Wat is de ovt-meervoud van zien?","Welke nemen 'zijn'?"],
  gen:"ovt", map:{name:"Onregelmatig",children:[
    {name:"ij → ee",children:[{name:"blijven · schrijven · kijken"}]},
    {name:"ie → oo",children:[{name:"vliegen · verliezen"}]},
    {name:"i → o",children:[{name:"drinken · vinden · zingen"}]},
    {name:"e → a → o",children:[{name:"nemen · spreken · breken"}]},
    {name:"echt onregelmatig",children:[{name:"zijn · hebben · gaan · doen"}]}
  ]}
},
{
  id:"bijlage-voorzetsel", level:"Bijlage", nr:43, title:"Vaste voorzetsels per werkwoord",
  kern:"Alfabetische lijst van werkwoord/adjectief + voorzetsel om te drillen.",
  tips:["Leer ze in zinnen, niet als paren.","Groepeer per voorzetsel: alles met 'op' samen.","Vervang de zaak door er+voorzetsel om te controleren."],
  val:["denken aan (herinneren) vs denken over (mening).","spreken met (persoon) vs spreken over (onderwerp).","vragen naar (informatie) vs vragen om (verzoek)."],
  recall:["Noem tien vaste combinaties uit je hoofd.","Welk voorzetsel bij 'zich ergeren'?","Welk voorzetsel bij 'gewend'?"],
  gen:"vz", map:{name:"Voorzetselparen",children:[
    {name:"aan",children:[{name:"denken · wennen · ergeren"}]},
    {name:"op",children:[{name:"wachten · rekenen · letten"}]},
    {name:"over",children:[{name:"praten · klagen · nadenken"}]},
    {name:"met",children:[{name:"beginnen · stoppen · trouwen"}]},
    {name:"naar",children:[{name:"luisteren · kijken · vragen"}]}
  ]}
},
{
  id:"bijlage-dehet", level:"Bijlage", nr:44, title:"Heuristieken voor de of het",
  kern:"Patronen die het geslacht voorspellen — geen wet, wel houvast.",
  tips:["Alle verkleinwoorden, talen, sporten, metalen en windrichtingen: het.","-ing, -heid, -te, -ij, -ie, -tie, -iek, -isme, -aar, -er: de.","Twijfel? Het is statistisch vaker de (±75%)."],
  val:["het bedrijf, het gebouw, het gebeuren — ge- + stam is vaak het.","de tijd, de kans, de reden zijn hoogfrequente de-woorden die je makkelijk fout doet.","Samenstellingen nemen het lidwoord van het láátste deel: de stad + het huis → het stadhuis."],
  recall:["Noem vijf uitgangen met de.","Noem vijf categorieën met het.","Welk lidwoord bij een samenstelling?"],
  gen:"dehet", map:{name:"de / het",children:[
    {name:"altijd het",children:[{name:"verkleinwoorden"},{name:"talen & sporten"},{name:"-um · -ment · -sel"}]},
    {name:"meestal de",children:[{name:"-ing · -heid · -te"},{name:"-ie · -tie · -iek"},{name:"personen & beroepen"}]},
    {name:"regels",children:[{name:"meervoud → de"},{name:"samenstelling → laatste deel"}]}
  ]}
}
];
