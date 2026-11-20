/* A2 — oefeningen in context. */
(function () {
  var out = window.OK_ITEMS = window.OK_ITEMS || [];
  function T(topic, arr) {
    arr.forEach(function (it, i) { it.topic = topic; it.id = topic + ":" + (i + 1); out.push(it); });
  }

  T("a2-imperfectum", [
    { t:"cloze", q:"Vorig jaar ___ ik nog in Leuven. (werken)", a:"werkte", w:"Stam werk eindigt op k → 't kofschip → -te." },
    { t:"cloze", q:"Als kind ___ ik elke zomer bij mijn oma. (logeren)", a:"logeerde", w:"Stam logeer, geen kofschip-letter → -de." },
    { t:"cloze", q:"Wij ___ vroeger vaak naar zee. (reizen)", a:"reisden",
      w:"Kijk naar de infinitief: reizen heeft een z → -de(n), ook al hoor je een s." },
    { t:"cloze", q:"Hij ___ zijn hele leven in dat dorp. (leven)", a:"leefde",
      w:"leven heeft een v → -de, ondanks de f in de stam." },
    { t:"cloze", q:"Zij ___ het probleem meteen. (begrijpen)", a:"begreep", w:"Sterk: ij → ee." },
    { t:"cloze", q:"Wij ___ gisteren twee uur op de trein. (wachten)", a:"wachtten",
      w:"Stam wacht + ten. Twee t's: één van de stam, één van de uitgang." },
    { t:"mc", q:"Welke vorm is juist?", o:["Hij antwoordde niet.","Hij antwoorde niet.","Hij antwoordte niet."], a:"Hij antwoordde niet.",
      w:"Stam antwoord + de = antwoordde." },
    { t:"cloze", q:"Toen ___ ik hem voor het eerst. (zien)", a:"zag", w:"Sterk: zien → zag / zagen." },
    { t:"cloze", q:"De kinderen ___ in de tuin. (spelen)", a:"speelden", w:"Stam speel + den." },
    { t:"omzet", inst:"Zet in de onvoltooid verleden tijd.", q:"Ik verhuis naar Antwerpen.",
      a:"Ik verhuisde naar Antwerpen.", w:"verhuizen → z → -de." },
    { t:"fout", inst:"Verbeter de zin.", q:"Wij praatte de hele avond.",
      a:"Wij praatten de hele avond.", w:"Meervoud krijgt -n: praatte → praatten." },
    { t:"cloze", q:"Hij ___ het huis vorige maand. (verkopen)", a:"verkocht", w:"Onregelmatig: verkopen → verkocht." },
    { t:"cloze", q:"Zij ___ me een lang verhaal. (vertellen)", a:"vertelde", w:"Stam vertel + de." },
    { t:"jn", q:"Ik studeerde in 2010 af in Chennai.", a:"goed", w:"studeren → studeerde (geen kofschip-letter)." },
    { t:"cloze", q:"Wij ___ elkaar op een congres. (ontmoeten)", a:"ontmoetten",
      w:"Stam ontmoet + ten → ontmoetten (meervoud)." }
  ]);

  T("a2-perfectum", [
    { t:"cloze", q:"Ik heb het rapport gisteren ___. (afmaken)", a:"afgemaakt",
      w:"Scheidbaar: af + ge + maakt." },
    { t:"cloze", q:"Zij is om zeven uur ___. (vertrekken)", a:"vertrokken",
      w:"Sterk deelwoord op -en, en ver- krijgt geen ge-." },
    { t:"cloze", q:"Hebben jullie al ___? (eten)", a:"gegeten", w:"Onregelmatig sterk deelwoord." },
    { t:"mc", q:"Ik heb hem gisteren ___.", o:["gebeld","gebelt","belde"], a:"gebeld",
      w:"Stam bel eindigt niet op een kofschip-letter → -d." },
    { t:"cloze", q:"Wij hebben twee uur ___. (werken)", a:"gewerkt", w:"k uit 't kofschip → -t." },
    { t:"cloze", q:"Hij heeft niet ___. (antwoorden)", a:"geantwoord",
      w:"Stam eindigt al op d — er komt geen tweede bij." },
    { t:"fout", inst:"Verbeter de zin.", q:"Ik heb mijn sleutels verlooren.",
      a:"Ik heb mijn sleutels verloren.", w:"verliezen → verloren, zonder ge-." },
    { t:"cloze", q:"De trein is te laat ___. (aankomen)", a:"aangekomen", w:"Scheidbaar + sterk: aan-ge-komen." },
    { t:"mc", q:"Wat is juist?", o:["Ik heb geblijven.","Ik ben gebleven.","Ik heb gebleven."], a:"Ik ben gebleven.",
      w:"blijven neemt zijn." },
    { t:"omzet", inst:"Zet in het perfectum.", q:"Ik betaal de rekening.",
      a:"Ik heb de rekening betaald.", w:"be- krijgt geen ge-." },
    { t:"omzet", inst:"Zet in het perfectum.", q:"Wij fietsen naar het station.",
      a:"Wij zijn naar het station gefietst.", w:"Fietsen met een doel → zijn." },
    { t:"cloze", q:"Ze hebben het contract ___. (ondertekenen)", a:"ondertekend",
      w:"onder- is hier onbeklemtoond en onscheidbaar → geen ge-." },
    { t:"cloze", q:"Wat is er ___? (gebeuren)", a:"gebeurd", w:"ge- zit al in de stam: gebeuren → gebeurd." },
    { t:"jn", q:"Hij heeft gisteren naar Gent gereden.", a:"fout",
      w:"Met een doel is rijden een verplaatsing: 'Hij is naar Gent gereden.'" },
    { t:"cloze", q:"Ik heb het je toch ___! (zeggen)", a:"gezegd", w:"Onregelmatig: zeggen → gezegd." }
  ]);

  T("a2-zonder-ge", [
    { t:"cloze", q:"Ik heb de rekening al ___. (betalen)", a:"betaald", w:"be- → geen ge-." },
    { t:"cloze", q:"Hij heeft het hele verhaal ___. (vertellen)", a:"verteld", w:"ver- → geen ge-." },
    { t:"cloze", q:"We hebben elkaar op het werk ___. (ontmoeten)", a:"ontmoet",
      w:"ont- → geen ge-, en de stam eindigt al op t." },
    { t:"cloze", q:"Kun je dat nog eens ___? (herhalen)", a:"herhalen", h:"infinitief", w:"her- hoort bij de zes." },
    { t:"mc", q:"Wat is het deelwoord van 'geloven'?", o:["gegeloofd","geloofd","geloven"], a:"geloofd",
      w:"ge- zit al vooraan, er komt geen tweede bij." },
    { t:"cloze", q:"Ik heb drie jaar in Delft ___. (studeren)", a:"gestudeerd",
      w:"Let op: studeren begint niet met een onbeklemtoond voorvoegsel, dus wél ge-." },
    { t:"fout", inst:"Verbeter de zin.", q:"Ik heb het gebetaald.",
      a:"Ik heb het betaald.", w:"be- krijgt nooit ge-." },
    { t:"cloze", q:"Zij heeft het probleem ___. (begrijpen)", a:"begrepen", w:"be- + sterk deelwoord." },
    { t:"mc", q:"Welke rij klopt?", o:["be-, ge-, her-, ont-, ver-, er-","aan-, op-, mee-, uit-","in-, om-, over-, door-"], a:"be-, ge-, her-, ont-, ver-, er-",
      w:"Dat zijn de zes onbeklemtoonde voorvoegsels." },
    { t:"cloze", q:"Het contract is gisteren ___. (vernieuwen)", a:"vernieuwd", w:"ver- → geen ge-." },
    { t:"cloze", q:"De les is ___. (beginnen)", a:"begonnen", w:"be- + sterk deelwoord op -en." },
    { t:"jn", q:"Ik heb dat niet geverwacht.", a:"fout", w:"verwachten → verwacht, zonder ge-." }
  ]);

  T("a2-scheidbaar", [
    { t:"omzet", inst:"Zet in de tegenwoordige tijd (ik).", q:"opstaan om zes uur",
      a:"Ik sta om zes uur op.", w:"Scheidbaar: het voorvoegsel gaat naar het einde." },
    { t:"cloze", q:"Ik ___ je morgenavond wel ___. (opbellen)", a:"bel|op",
      multi:["bel","op"], w:"Twee gaten: bel ... op." },
    { t:"fout", inst:"Verbeter de zin.", q:"Ik opbel je morgen.",
      a:"Ik bel je morgen op.", w:"In de hoofdzin splitst het werkwoord." },
    { t:"jn", q:"Hij zei dat hij mij morgen opbelt.", a:"goed",
      w:"In de bijzin blijft het werkwoord één woord." },
    { t:"cloze", q:"Ze heeft haar zus ___. (meenemen)", a:"meegenomen", w:"mee + ge + nomen." },
    { t:"order", inst:"Maak een correcte zin.", o:["ik","de kinderen","om vier uur","haal","af"],
      a:"Ik haal de kinderen om vier uur af.", w:"Het voorvoegsel af staat helemaal achteraan." },
    { t:"mc", q:"Welk werkwoord is onscheidbaar?", o:["opbellen","vertellen","meegaan"], a:"vertellen",
      w:"De klemtoon ligt op de stam: vertéllen." },
    { t:"cloze", q:"Ik probeer je later nog eens ___ te ___. (opbellen)", a:"op|bellen",
      multi:["op","bellen"], w:"Bij 'te' komt het ertussen: om op te bellen." },
    { t:"omzet", inst:"Maak er een bijzin van met 'omdat'.", q:"Hij staat altijd vroeg op.",
      a:"omdat hij altijd vroeg opstaat", acc:["Omdat hij altijd vroeg opstaat."],
      w:"In de bijzin schuift alles weer samen en naar achteren." },
    { t:"mc", q:"Welke zin is juist?", o:["De vergadering begint om tien uur.","De vergadering be om tien uur gint.","De vergadering gint om tien uur be."], a:"De vergadering begint om tien uur.",
      w:"beginnen is onscheidbaar: de klemtoon ligt op de stam (begínnen), dus er splitst niets." },
    { t:"cloze", q:"Wanneer ___ de trein ___? (aankomen)", a:"komt|aan", multi:["komt","aan"],
      w:"Vraagvolgorde: persoonsvorm vooraan, voorvoegsel achteraan." },
    { t:"jn", q:"Ik heb gisteren mijn kamer opgeruimd.", a:"goed", w:"op + ge + ruimd." },
    { t:"mc", q:"Wat is juist?", o:["Ik wil vroeg opstaan.","Ik wil vroeg op staan.","Ik wil op vroeg staan."], a:"Ik wil vroeg opstaan.",
      w:"In de infinitief blijft het samen." }
  ]);

  T("a2-verkleinwoord", [
    { t:"cloze", q:"Wil je een ___? (kop koffie → kop)", a:"kopje", w:"-je na een medeklinker." },
    { t:"cloze", q:"Er staat een klein ___ in de tuin. (boom)", a:"boompje", w:"Na lange klinker + m → -pje." },
    { t:"cloze", q:"Zij heeft een lief ___. (man)", a:"mannetje", w:"Korte klinker + n → -etje." },
    { t:"mc", q:"Verkleinwoord van 'koning':", o:["koningje","koninkje","koningetje"], a:"koninkje",
      w:"Na -ing wordt het -kje." },
    { t:"cloze", q:"Zullen we nog een ___ drinken? (bier)", a:"biertje", w:"Na r → -tje." },
    { t:"cloze", q:"Ik neem een ___ pauze. (uur)", a:"uurtje", w:"-tje na r; hier betekent het 'ongeveer een uur'." },
    { t:"jn", q:"Het meisje is klein.", a:"goed", w:"meisje is zelf al een verkleinwoord en dus een het-woord." },
    { t:"cloze", q:"Er ligt een ___ op tafel. (blad)", a:"blaadje", w:"Klinkerrek: blad → blaadje." },
    { t:"mc", q:"Wat is het meervoud van 'huisje'?", o:["huisjen","huisjes","huisjeën"], a:"huisjes",
      w:"Verkleinwoorden krijgen altijd -s in het meervoud." },
    { t:"cloze", q:"Doe je even een ___ open? (raam)", a:"raampje", w:"Lange klinker + m → -pje." },
    { t:"cloze", q:"Wat een schattig ___! (ding)", a:"dingetje", w:"Na -ng → -etje." },
    { t:"fout", inst:"Verbeter de zin.", q:"De meisje speelt buiten.",
      a:"Het meisje speelt buiten.", w:"Verkleinwoord = het-woord." },
    { t:"cloze", q:"Ik heb nog een ___ over. (auto)", a:"autootje", w:"Na een klinker: rekken + -tje." }
  ]);

  T("a2-bijvoeglijk", [
    { t:"cloze", q:"Dat is een ___ huis. (groot)", a:"groot", w:"een + het-woord → geen -e." },
    { t:"cloze", q:"Dat is een ___ man. (groot)", a:"grote", w:"de-woord → altijd -e." },
    { t:"cloze", q:"Het ___ huis staat te koop. (groot)", a:"grote", w:"Met 'het' erbij komt de -e terug." },
    { t:"cloze", q:"Ik zie ___ huizen. (mooi)", a:"mooie", w:"Meervoud → altijd -e." },
    { t:"cloze", q:"Het huis is ___. (groot)", a:"groot", w:"Predicatief (na zijn) → nooit een -e." },
    { t:"mc", q:"Kies de juiste vorm.", o:["een houten tafel","een houtene tafel","een hout tafel"], a:"een houten tafel",
      w:"Materiaaladjectieven op -en verbuigen nooit." },
    { t:"cloze", q:"Zij draagt een ___ jas. (oranje)", a:"oranje", w:"Adjectieven die al op -e eindigen blijven gelijk." },
    { t:"cloze", q:"Er is geen ___ probleem. (groot)", a:"groot", w:"geen + het-woord → kaal." },
    { t:"fout", inst:"Verbeter de zin.", q:"Dat is een interessante boek.",
      a:"Dat is een interessant boek.", w:"het boek + een → geen -e." },
    { t:"cloze", q:"Ik heb een ___ idee. (goed)", a:"goed", w:"het idee + een → kaal." },
    { t:"cloze", q:"Dit is het ___ moment. (juist)", a:"juiste", w:"het + adjectief → -e." },
    { t:"jn", q:"Zo'n groot huis kan ik niet betalen.", a:"goed", w:"Na zo'n + het-woord blijft het adjectief kaal." },
    { t:"cloze", q:"Hij heeft een ___ auto gekocht. (duur)", a:"dure", w:"de auto → dure (spelling: uu wordt u)." },
    { t:"cloze", q:"Het weer wordt ___. (slecht)", a:"slecht", w:"Na 'worden' geen verbuiging." }
  ]);

  T("a2-trappen", [
    { t:"cloze", q:"Deze fiets is ___ dan die van mij. (duur)", a:"duurder", w:"Na -r komt -der." },
    { t:"cloze", q:"Dit is de ___ oplossing. (goed, superlatief)", a:"beste", w:"goed → beter → best." },
    { t:"mc", q:"Wat is correct?", o:["Hij is groter als ik.","Hij is groter dan ik.","Hij is grotere dan ik."], a:"Hij is groter dan ik.",
      w:"Bij ongelijkheid altijd 'dan'." },
    { t:"cloze", q:"Ik heb ___ tijd dan vorige week. (veel)", a:"meer", w:"veel → meer → meest." },
    { t:"cloze", q:"Hij heeft ___ ervaring dan zijn collega. (weinig)", a:"minder", w:"weinig → minder → minst." },
    { t:"cloze", q:"Ik drink ___ thee dan koffie. (graag)", a:"liever", w:"graag → liever → liefst." },
    { t:"cloze", q:"Zij is net zo lang ___ haar broer.", a:"als", w:"Gelijkheid: net zo ... als." },
    { t:"cloze", q:"Dit is het ___ boek dat ik ooit las. (mooi)", a:"mooiste", w:"-st + verbuiging na het." },
    { t:"mc", q:"Welke vorm hoort bij lange woorden?", o:["interessanter","meer interessant","interessantst"], a:"meer interessant",
      w:"Lange of vreemde woorden nemen meer/meest." },
    { t:"fout", inst:"Verbeter de zin.", q:"Zij loopt sneller als hij.",
      a:"Zij loopt sneller dan hij.", w:"dan bij ongelijkheid." },
    { t:"cloze", q:"Van alle steden vind ik Gent het ___. (leuk)", a:"leukst", acc:["leukste"],
      w:"Predicatief: het leukst; met een zelfstandig naamwoord: de leukste stad." },
    { t:"cloze", q:"Hoe ___ hoe beter. (snel)", a:"sneller", w:"Vaste constructie: hoe ...-er, hoe ...-er." },
    { t:"cloze", q:"Het weer wordt steeds ___. (slecht)", a:"slechter", w:"steeds + comparatief = toenemend." }
  ]);

  T("a2-modaal", [
    { t:"cloze", q:"Je ___ niet te komen als je ziek bent. (hoeven)", a:"hoeft",
      w:"hoeven is het enige dat 'te' meeneemt." },
    { t:"mc", q:"Welke zin betekent 'er is geen verplichting'?", o:["Je moet niet komen.","Je hoeft niet te komen.","Je mag niet komen."], a:"Je hoeft niet te komen.",
      w:"niet hoeven = geen verplichting; niet mogen = verbod." },
    { t:"cloze", q:"___ we vanavond samen koken? (zullen)", a:"Zullen", w:"Voorstel doen met zullen." },
    { t:"cloze", q:"Ik ___ hier niet roken. (mogen — verbod)", a:"mag", w:"'Ik mag hier niet roken' = het is verboden." },
    { t:"fout", inst:"Verbeter de zin.", q:"Ik kan te zwemmen.",
      a:"Ik kan zwemmen.", w:"Na modale werkwoorden geen 'te'." },
    { t:"cloze", q:"Hij ___ het gisteren niet doen. (kunnen, ovt)", a:"kon", w:"kunnen → kon/konden." },
    { t:"mc", q:"Perfectum van 'Ik kan het doen':", o:["Ik heb het kunnen doen.","Ik heb het gekund doen.","Ik heb het doen gekund."], a:"Ik heb het kunnen doen.",
      w:"Met een tweede werkwoord gebruik je de infinitief, niet het deelwoord." },
    { t:"cloze", q:"___ ik u even storen? (mogen)", a:"Mag", w:"Beleefd om toestemming vragen." },
    { t:"order", inst:"Maak een correcte zin.", o:["moet","ik","dit formulier","invullen","nog"],
      a:"Ik moet dit formulier nog invullen.", w:"Modaal op 2, infinitief achteraan." },
    { t:"cloze", q:"Zij ___ graag naar Spanje verhuizen. (willen)", a:"wil", acc:["wilt"],
      w:"zij wil — 'wilt' hoort bij jij/u." },
    { t:"jn", q:"Je moet niet komen als je geen zin hebt.", a:"goed",
      w:"Grammaticaal juist, maar dubbelzinnig: in Vlaanderen 'hoeft niet', in Nederland eerder 'mag niet'. Schrijf liever 'hoeft niet te komen'." },
    { t:"cloze", q:"We ___ morgen om acht uur vertrekken. (moeten)", a:"moeten", w:"Meervoud = infinitiefvorm." },
    { t:"cloze", q:"___ jij dit even voor mij doen? (kunnen)", a:"Kun", acc:["Kan"],
      w:"'Kun jij' en 'Kan jij' zijn allebei gangbaar; 'Kunt u' is formeel." }
  ]);

  T("a2-voorzetsel", [
    { t:"cloze", q:"Ik ga ___ school met de fiets.", a:"naar", w:"Richting → naar." },
    { t:"cloze", q:"Mijn dochter zit ___ school.", a:"op", w:"Positie/instelling → op school." },
    { t:"cloze", q:"De vergadering is ___ maandag.", a:"op", w:"Dagen krijgen op." },
    { t:"cloze", q:"Ik ben ___ mei jarig.", a:"in", w:"Maanden en jaren krijgen in." },
    { t:"cloze", q:"De film begint ___ acht uur.", a:"om", w:"Kloktijden krijgen om." },
    { t:"cloze", q:"Ik werk hier ___ 2021.", a:"sinds", w:"sinds + startpunt." },
    { t:"cloze", q:"We blijven ___ vrijdag ___ zondag.", a:"van|tot", multi:["van","tot"], w:"van ... tot voor een periode." },
    { t:"mc", q:"Kies het juiste voorzetsel: 'Ik woon ___ Gent.'", o:["in","op","aan"], a:"in", w:"Steden krijgen in." },
    { t:"cloze", q:"Het boek ligt ___ de tafel.", a:"op", w:"Op een oppervlak." },
    { t:"cloze", q:"De sleutel zit ___ mijn zak.", a:"in", w:"Binnenin." },
    { t:"cloze", q:"Ik kom ___ India.", a:"uit", w:"Herkomst → uit." },
    { t:"cloze", q:"Ik ga ___ de fiets naar het werk.", a:"met", w:"Vervoermiddel → met." },
    { t:"fout", inst:"Verbeter de zin.", q:"Ik ben in vakantie geweest.",
      a:"Ik ben op vakantie geweest.", w:"Vaste combinatie: op vakantie, op reis." },
    { t:"cloze", q:"Ik wacht ___ het station.", a:"in", acc:["op","aan"],
      w:"'in het station' (binnen), 'op het station' (bij het gebouw), 'aan het station' (ervoor) — alle drie bestaan." }
  ]);

  T("a2-er", [
    { t:"cloze", q:"___ staat een man voor de deur.", a:"Er", w:"Onbepaald onderwerp → voorlopig onderwerp er." },
    { t:"jn", q:"Er staat de man voor de deur.", a:"fout",
      w:"Bij een bepaald onderwerp geen er: 'De man staat voor de deur.'" },
    { t:"cloze", q:"___ zijn vandaag veel mensen op de markt.", a:"Er", w:"Meervoud verandert niets." },
    { t:"omzet", inst:"Vervang 'in Gent' door er.", q:"Ik woon in Gent.",
      a:"Ik woon er.", w:"Plaats-er vervangt daar." },
    { t:"cloze", q:"Vandaag zijn ___ geen lessen.", a:"er", w:"Na inversie schuift er mee naar achteren." },
    { t:"mc", q:"Wat is juist?", o:["Er is drie redenen.","Er zijn drie redenen.","Zijn er drie redenen."], a:"Er zijn drie redenen.",
      w:"Het werkwoord richt zich naar het echte onderwerp (drie redenen)." },
    { t:"cloze", q:"Hij zei dat ___ een probleem was.", a:"er", w:"In de bijzin staat er vlak na het onderwerp." },
    { t:"cloze", q:"___ wordt hier veel gewerkt.", a:"Er", w:"Onpersoonlijk passief begint met er." },
    { t:"omzet", inst:"Maak een zin met er.", q:"Een kat zit op het dak.",
      a:"Er zit een kat op het dak.", w:"Onbepaald onderwerp verhuist naar achteren, er neemt plaats 1." },
    { t:"cloze", q:"Is ___ nog koffie?", a:"er", w:"Vraag met voorlopig onderwerp." },
    { t:"jn", q:"Er is de oplossing simpel.", a:"fout", w:"'De oplossing is simpel' — bepaald onderwerp." },
    { t:"cloze", q:"Ik ben ___ nog nooit geweest.", a:"er", w:"Plaats-er in het middenveld." }
  ]);
})();
