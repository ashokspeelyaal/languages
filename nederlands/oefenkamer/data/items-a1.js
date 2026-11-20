/* A1 — oefeningen in context.
 * t: mc | cloze | order | fout | omzet | jn
 * inst = opdracht, q = materiaal, a = antwoord, acc = ook goed, w = waarom, h = hint
 */
(function () {
  var out = window.OK_ITEMS = window.OK_ITEMS || [];
  function T(topic, arr) {
    arr.forEach(function (it, i) { it.topic = topic; it.id = topic + ":" + (i + 1); out.push(it); });
  }

  T("a1-lidwoorden", [
    { t:"mc", q:"___ meisje speelt in de tuin.", o:["De","Het","Een"], a:"Het",
      w:"Elk verkleinwoord is een het-woord — ook als het over een persoon gaat." },
    { t:"mc", q:"Ik heb gisteren ___ nieuwe fiets gekocht.", o:["de","het","een"], a:"een",
      w:"Onbepaald: je introduceert de fiets voor het eerst." },
    { t:"cloze", q:"___ kinderen spelen buiten op straat.", a:"De",
      w:"Meervoud bepaald is altijd de, ook bij het-woorden: het kind → de kinderen." },
    { t:"cloze", q:"Weet jij waar ___ station is?", a:"het",
      w:"het station — woorden op -ion/-ie kunnen beide, maar station is onzijdig. Leer het lidwoord mee." },
    { t:"jn", q:"Ik zie een kinderen op het plein.", a:"fout",
      w:"Meervoud onbepaald krijgt géén lidwoord: 'Ik zie kinderen op het plein.'" },
    { t:"mc", q:"___ Nederlands leer je sneller met oefening.", o:["De","Het","Een"], a:"Het",
      w:"Namen van talen en sporten zijn het-woorden: het Nederlands, het voetbal." },
    { t:"cloze", q:"Mijn zus werkt bij ___ gemeente.", a:"de", w:"de gemeente — een de-woord." },
    { t:"mc", q:"Dat is ___ groot probleem.", o:["een","de","het"], a:"een",
      w:"Let ook op het adjectief: een groot probleem (geen -e bij een + het-woord)." },
    { t:"fout", inst:"Verbeter de zin.", q:"Het tafel staat in de keuken.",
      a:"De tafel staat in de keuken.", w:"de tafel — een de-woord." },
    { t:"cloze", q:"'s Avonds luister ik naar ___ radio.", a:"de", w:"de radio." },
    { t:"mc", q:"___ verkeer is vandaag heel druk.", o:["De","Het","Een"], a:"Het",
      w:"Ontelbare verzamelnamen zijn vaak het-woorden: het verkeer, het weer, het geld." },
    { t:"jn", q:"Zij is een goede dokter.", a:"goed",
      w:"Met een adjectief erbij komt er wél een lidwoord: 'Zij is dokter' maar 'Zij is een goede dokter'." },
    { t:"cloze", q:"Kun je ___ raam even dichtdoen?", a:"het", w:"het raam." },
    { t:"mc", q:"Ik heb ___ antwoord nog niet gekregen.", o:["de","het","een"], a:"het",
      w:"het antwoord — vergelijk: de vraag." }
  ]);

  T("a1-pronomina", [
    { t:"cloze", q:"Kun je ___ helpen? Ik snap deze oefening niet. (ik)", a:"me", acc:["mij"],
      w:"Voorwerpsvorm: me (onbeklemtoond) of mij (met nadruk)." },
    { t:"mc", q:"Dit cadeau is voor ___.", o:["jij","jou","jouw"], a:"jou",
      w:"Na een voorzetsel altijd de voorwerpsvorm: voor jou." },
    { t:"cloze", q:"Mijn ouders bellen ___ elke zondag. (wij)", a:"ons", w:"wij → ons." },
    { t:"mc", q:"Ik heb ___ gisteren op de markt gezien.", o:["zij","haar","hun"], a:"haar",
      w:"Lijdend voorwerp, vrouwelijk enkelvoud: haar." },
    { t:"cloze", q:"___ bent te laat, meneer De Vos.", a:"U", w:"Formeel enkelvoud: u." },
    { t:"fout", inst:"Verbeter de zin.", q:"Hun hebben het gisteren gedaan.",
      a:"Zij hebben het gisteren gedaan.", acc:["Ze hebben het gisteren gedaan."],
      w:"'hun' is nooit onderwerp. Gebruik zij of ze." },
    { t:"mc", q:"Ik geef ___ morgen het rapport.", o:["hen","hun","zij"], a:"hun",
      w:"Meewerkend voorwerp (aan wie?) → hun. 'Ik zie hen' is lijdend voorwerp." },
    { t:"cloze", q:"Waar is mijn sleutel? Ik kan ___ niet vinden.", a:"hem", acc:["het","'m"],
      w:"De sleutel is een de-woord → hem." },
    { t:"jn", q:"Zij en ik gaan samen naar de les.", a:"goed",
      w:"Onderwerpsvormen, dus zij en ik — samen is dat 'wij'." },
    { t:"cloze", q:"Hebben jullie het gehoord? Ja, wij hebben ___ gehoord.", a:"het",
      w:"het als voorwerp blijft het." },
    { t:"mc", q:"Zeg maar tegen ___ dat de vergadering verzet is.", o:["zij","ze","hen"], a:"hen",
      w:"Na een voorzetsel: hen (of in spreektaal 'ze')." },
    { t:"cloze", q:"Ik heb geen tijd; kun jij ___ doen? (het)", a:"het", w:"Onzijdig voorwerp: het." },
    { t:"fout", inst:"Verbeter de zin.", q:"Met ik gaat het goed.",
      a:"Met mij gaat het goed.", w:"Na 'met' hoort de voorwerpsvorm mij." },
    { t:"mc", q:"___ ken ik al jaren.", o:["Hij","Hem","Zijn"], a:"Hem",
      w:"Vooropgeplaatst lijdend voorwerp blijft de voorwerpsvorm: 'Hem ken ik al jaren.'" }
  ]);

  T("a1-bezit", [
    { t:"cloze", q:"Dat is ___ huis; we wonen hier al tien jaar. (wij)", a:"ons",
      w:"het huis → ons huis. Bij een de-woord: onze buurt." },
    { t:"mc", q:"___ auto staat voor de deur. (wij)", o:["Ons","Onze","Onzes"], a:"Onze",
      w:"de auto → onze auto." },
    { t:"cloze", q:"Is dit ___ jas of die van je broer? (jij)", a:"jouw", acc:["je"],
      w:"jouw = bezit, jou = voorwerp." },
    { t:"fout", inst:"Verbeter de zin.", q:"Zij hebben hun huis verkocht en hun zijn nu blij.",
      a:"Zij hebben hun huis verkocht en zij zijn nu blij.", acc:["Zij hebben hun huis verkocht en ze zijn nu blij."],
      w:"'hun huis' is correct (bezit), 'hun zijn' niet (onderwerp)." },
    { t:"cloze", q:"Meneer, mag ik ___ paspoort even zien? (u)", a:"uw", w:"Formeel bezit: uw." },
    { t:"mc", q:"Deze fiets is van mij, die is ___.", o:["de jouwe","jouw","van jouw"], a:"de jouwe",
      w:"Zelfstandig gebruikt: de mijne, de jouwe, het onze." },
    { t:"cloze", q:"Anna is ___ boek vergeten. (zij)", a:"haar", w:"Vrouwelijk bezit: haar." },
    { t:"cloze", q:"De hond kwispelt met ___ staart. (hij)", a:"zijn", w:"Mannelijk/onzijdig bezit: zijn." },
    { t:"jn", q:"Onze kind zit in het derde leerjaar.", a:"fout",
      w:"het kind → ons kind. Onze hoort bij de-woorden." },
    { t:"mc", q:"Hebben jullie ___ tickets al?", o:["jullie","jullies","van jullie"], a:"jullie",
      w:"jullie is zowel onderwerp als bezittelijk voornaamwoord." },
    { t:"cloze", q:"Ik ben ___ sleutels kwijt. (ik)", a:"mijn", w:"mijn — onveranderlijk." },
    { t:"fout", inst:"Verbeter de zin.", q:"Ik heb jou nummer niet meer.",
      a:"Ik heb jouw nummer niet meer.", w:"Bezit = jouw met w." }
  ]);

  T("a1-tt", [
    { t:"cloze", q:"Hij ___ elke dag naar het werk. (fietsen)", a:"fietst",
      w:"Stam fiets + t." },
    { t:"cloze", q:"___ jij morgen mee naar Gent? (gaan)", a:"Ga",
      w:"Bij inversie verdwijnt de -t: jij gaat → ga jij?" },
    { t:"cloze", q:"Wij ___ elke zomer naar de kust. (rijden)", a:"rijden",
      w:"Meervoud = infinitief." },
    { t:"cloze", q:"Ik ___ liever thuis. (werken)", a:"werk", w:"ik = kale stam." },
    { t:"mc", q:"Jij ___ heel goed Nederlands.", o:["spreek","spreekt","spreken"], a:"spreekt",
      w:"jij vóór het werkwoord → stam + t." },
    { t:"cloze", q:"Zij ___ in Antwerpen. (wonen)", a:"woont", h:"één persoon", w:"Stam woon + t." },
    { t:"fout", inst:"Verbeter de zin.", q:"Komt jij vanavond ook?",
      a:"Kom jij vanavond ook?", w:"Inversie met jij kost de -t." },
    { t:"cloze", q:"Hij ___ een broer in Rotterdam. (hebben)", a:"heeft", w:"Onregelmatig: heb/hebt/heeft." },
    { t:"cloze", q:"Wat ___ jij van dat voorstel? (vinden)", a:"vind",
      w:"Stam vind, en na inversie zonder -t. Let op: 'jij vindt' mét t als jij vooraan staat." },
    { t:"jn", q:"Hij zit al een uur in de wachtzaal.", a:"goed",
      w:"Stam zit eindigt al op -t, dus geen tweede t." },
    { t:"cloze", q:"Ik ___ elke ochtend de krant. (lezen)", a:"lees",
      w:"Spelling: lez → lees, want de klinker blijft lang." },
    { t:"cloze", q:"Mijn collega ___ vaak te laat. (komen)", a:"komt", w:"kom + t." },
    { t:"omzet", inst:"Zet in de tegenwoordige tijd (hij).", q:"Ik geef les op maandag.",
      a:"Hij geeft les op maandag.", w:"geef + t = geeft." },
    { t:"cloze", q:"U ___ toch morgen ook? (komen)", a:"komt", w:"u krijgt de hij-vorm." },
    { t:"cloze", q:"Ik ___ dat we het redden. (geloven)", a:"geloof",
      w:"Stam eindigt op -f: geloven → ik geloof (v wordt f)." }
  ]);

  T("a1-zijn-hebben", [
    { t:"cloze", q:"Wij ___ gisteren in Brugge geweest.", a:"zijn", w:"geweest gaat altijd met zijn." },
    { t:"cloze", q:"Hij ___ nog geen antwoord gekregen.", a:"heeft", w:"krijgen → hebben." },
    { t:"mc", q:"Ik ___ met de trein naar Brussel gegaan.", o:["heb","ben","was"], a:"ben",
      w:"gaan = verplaatsing met doel → zijn." },
    { t:"cloze", q:"___ jij moe? Je ziet er niet fit uit.", a:"Ben", w:"jij bent → ben jij?" },
    { t:"jn", q:"Ik heb de hele middag gefietst.", a:"goed",
      w:"Fietsen als activiteit → hebben. Met een doel: 'Ik ben naar huis gefietst.'" },
    { t:"cloze", q:"De vergadering ___ vorige week begonnen.", a:"is", w:"beginnen → zijn." },
    { t:"fout", inst:"Verbeter de zin.", q:"Ik heb vorig jaar in Gent geweest.",
      a:"Ik ben vorig jaar in Gent geweest.", w:"geweest neemt altijd zijn." },
    { t:"cloze", q:"Wij ___ het rapport net afgewerkt.", a:"hebben", w:"afwerken → hebben." },
    { t:"mc", q:"Zij ___ ziek geworden na de reis.", o:["heeft","is","was"], a:"is",
      w:"worden = verandering van toestand → zijn." },
    { t:"cloze", q:"Vroeger ___ ik veel meer tijd. (hebben, ovt)", a:"had", w:"had/hadden." },
    { t:"cloze", q:"Waar ___ jullie gisteravond? (zijn, ovt)", a:"waren", w:"was/waren." },
    { t:"omzet", inst:"Zet in het perfectum.", q:"Hij blijft thuis.",
      a:"Hij is thuis gebleven.", w:"blijven → zijn + gebleven." },
    { t:"mc", q:"U ___ gelijk.", o:["heb","hebt","hebben"], a:"hebt",
      w:"'u hebt' en 'u heeft' zijn allebei correct; 'u hebben' niet." }
  ]);

  T("a1-volgorde", [
    { t:"order", inst:"Maak een correcte zin.", o:["morgen","ik","naar de dokter","ga"],
      a:"Morgen ga ik naar de dokter.", w:"Bepaling op 1 → persoonsvorm op 2 → onderwerp." },
    { t:"order", inst:"Maak een correcte zin.", o:["een film","willen","we","vanavond","kijken"],
      a:"We willen vanavond een film kijken.", w:"Persoonsvorm op 2, infinitief helemaal achteraan." },
    { t:"fout", inst:"Verbeter de zin.", q:"Morgen ik ga naar Brussel.",
      a:"Morgen ga ik naar Brussel.", w:"Er mag maar één zinsdeel vóór de persoonsvorm staan." },
    { t:"order", inst:"Maak een correcte zin (TMP).", o:["ik","met de fiets","naar het werk","ga","meestal"],
      a:"Ik ga meestal met de fiets naar het werk.", w:"Tijd — manier — plaats." },
    { t:"jn", q:"Ik heb gisteren een nieuwe laptop gekocht.", a:"goed",
      w:"Persoonsvorm op 2, deelwoord achteraan." },
    { t:"fout", inst:"Verbeter de zin.", q:"Hij heeft gekocht een nieuwe auto.",
      a:"Hij heeft een nieuwe auto gekocht.", w:"Het deelwoord staat helemaal achteraan." },
    { t:"order", inst:"Maak een correcte zin.", o:["kan","ik","je","helpen","daarmee"],
      a:"Ik kan je daarmee helpen.", w:"Modaal werkwoord op 2, infinitief achteraan." },
    { t:"omzet", inst:"Begin de zin met 'Vanavond'.", q:"Ik kook pasta.",
      a:"Vanavond kook ik pasta.", w:"Inversie na een bepaling op plaats 1." },
    { t:"order", inst:"Maak een correcte zin.", o:["heeft","mijn collega","in Leuven","twee jaar","gewerkt"],
      a:"Mijn collega heeft twee jaar in Leuven gewerkt.", w:"Tijd vóór plaats, deelwoord achteraan." },
    { t:"fout", inst:"Verbeter de zin.", q:"Ik ga naar de winkel morgen.",
      a:"Ik ga morgen naar de winkel.", w:"Tijd komt vóór plaats in het middenveld." },
    { t:"order", inst:"Maak een correcte zin.", o:["moet","je","dat formulier","invullen","eerst"],
      a:"Je moet dat formulier eerst invullen.", acc:["Je moet eerst dat formulier invullen."],
      w:"Twee werkwoorden: modaal op 2, infinitief op het einde." },
    { t:"jn", q:"Daarom ik blijf thuis.", a:"fout",
      w:"Na 'daarom' volgt inversie: 'Daarom blijf ik thuis.'" }
  ]);

  T("a1-vragen", [
    { t:"cloze", q:"___ woon je precies?", a:"Waar", w:"Vraag naar plaats." },
    { t:"cloze", q:"___ ben je vandaag zo laat?", a:"Waarom", w:"Vraag naar reden." },
    { t:"fout", inst:"Verbeter de vraag.", q:"Doe jij werken op zaterdag?",
      a:"Werk jij op zaterdag?", w:"Nederlands kent geen hulpwerkwoord 'doen' bij vragen." },
    { t:"mc", q:"___ boek heb je gelezen?", o:["Welk","Welke","Wat"], a:"Welk",
      w:"welk bij het-woorden, welke bij de-woorden en meervoud." },
    { t:"cloze", q:"___ ken jij die man? — Van het werk.", a:"Waarvan", acc:["Hoe"],
      w:"Voorzetsel + wat wordt waar + voorzetsel: waarvan, waarmee, waarover." },
    { t:"omzet", inst:"Maak er een ja/nee-vraag van.", q:"Je komt vanavond langs.",
      a:"Kom je vanavond langs?", w:"Werkwoord vooraan, jij verliest de -t." },
    { t:"cloze", q:"___ mensen komen er morgen?", a:"Hoeveel", w:"Vraag naar aantal." },
    { t:"omzet", inst:"Maak een indirecte vraag met 'Ik weet niet'.", q:"Waar woont hij?",
      a:"Ik weet niet waar hij woont.", w:"Indirecte vraag = bijzin, werkwoord achteraan." },
    { t:"mc", q:"___ gaat het met je moeder?", o:["Hoe","Wat","Welke"], a:"Hoe", w:"Vaste uitdrukking." },
    { t:"cloze", q:"___ heeft mijn pen gepakt?", a:"Wie", w:"Vraag naar persoon." },
    { t:"fout", inst:"Verbeter de vraag.", q:"Waar jij woont?",
      a:"Waar woon jij?", w:"Na het vraagwoord komt meteen de persoonsvorm." },
    { t:"cloze", q:"Met ___ ga je op reis?", a:"wie", w:"Bij personen blijft het voorzetsel + wie." },
    { t:"jn", q:"Komt u morgen ook?", a:"goed", w:"Bij u blijft de -t staan, ook na inversie." }
  ]);

  T("a1-ontkenning", [
    { t:"mc", q:"Ik heb ___ auto.", o:["niet","geen","geen een"], a:"geen",
      w:"Onbepaald zelfstandig naamwoord → geen." },
    { t:"mc", q:"Ik ken die man ___.", o:["niet","geen"], a:"niet",
      w:"Bepaald ('die man') → niet, en het staat achteraan." },
    { t:"cloze", q:"Sorry, ik heb vandaag ___ tijd.", a:"geen",
      w:"Vaste uitdrukking zonder lidwoord → geen tijd, geen zin, geen honger." },
    { t:"fout", inst:"Verbeter de zin.", q:"Ik heb niet een fiets.",
      a:"Ik heb geen fiets.", w:"niet + een wordt geen." },
    { t:"cloze", q:"Het is vandaag ___ koud.", a:"niet", w:"Vóór een bijvoeglijk naamwoord: niet." },
    { t:"omzet", inst:"Maak ontkennend.", q:"Ik heb je bericht gezien.",
      a:"Ik heb je bericht niet gezien.", w:"niet staat vóór het voltooid deelwoord." },
    { t:"omzet", inst:"Maak ontkennend.", q:"Zij drinkt koffie.",
      a:"Zij drinkt geen koffie.", w:"Onbepaald zonder lidwoord → geen." },
    { t:"jn", q:"Hij woont niet in Gent.", a:"goed", w:"Ontkenning van een plaatsbepaling: niet ervoor." },
    { t:"mc", q:"Dat is ___ mijn jas.", o:["niet","geen"], a:"niet", w:"Bezittelijk = bepaald → niet." },
    { t:"cloze", q:"Ik wil ___ problemen.", a:"geen", w:"Onbepaald meervoud → geen." },
    { t:"omzet", inst:"Maak ontkennend.", q:"Ik ga vanavond naar de film.",
      a:"Ik ga vanavond niet naar de film.", w:"niet vóór de bepaling die je ontkent." },
    { t:"fout", inst:"Verbeter de zin.", q:"Ik heb geen de sleutel gevonden.",
      a:"Ik heb de sleutel niet gevonden.", w:"Bij een bepaald zelfstandig naamwoord gebruik je niet." }
  ]);

  T("a1-meervoud", [
    { t:"cloze", q:"één stad → twee ___", a:"steden", w:"Onregelmatig: stad → steden." },
    { t:"cloze", q:"één kind → drie ___", a:"kinderen", w:"Onregelmatig meervoud op -eren." },
    { t:"cloze", q:"één foto → vier ___", a:"foto's", w:"Na een losse klinker komt een apostrof." },
    { t:"cloze", q:"één brief → twee ___", a:"brieven", w:"f wordt v tussen klinkers." },
    { t:"cloze", q:"één huis → drie ___", a:"huizen", w:"s wordt z tussen klinkers." },
    { t:"cloze", q:"één appel → vijf ___", a:"appels", w:"Onbeklemtoonde -el → meervoud op -s." },
    { t:"cloze", q:"één raam → twee ___", a:"ramen", w:"Open lettergreep: de dubbele a wordt enkel." },
    { t:"cloze", q:"één bal → drie ___", a:"ballen", w:"Korte klinker: medeklinker verdubbelen." },
    { t:"mc", q:"Wat is het meervoud van 'museum'?", o:["museums","musea","museumen"], a:"musea",
      w:"Latijns meervoud; 'museums' hoor je ook, 'musea' is standaard." },
    { t:"cloze", q:"één mogelijkheid → veel ___", a:"mogelijkheden", w:"-heid wordt -heden." },
    { t:"cloze", q:"één ei → zes ___", a:"eieren", w:"Onregelmatig: ei → eieren." },
    { t:"fout", inst:"Verbeter de zin.", q:"Ik heb twee broers en drie zussens.",
      a:"Ik heb twee broers en drie zussen.", w:"zus → zussen (korte klinker, verdubbeling)." },
    { t:"cloze", q:"één café → twee ___", a:"cafés", w:"Na -é geen apostrof maar gewoon -s." },
    { t:"cloze", q:"één collega → drie ___", a:"collega's", w:"Klinker + apostrof + s." }
  ]);

  T("a1-getallen", [
    { t:"cloze", q:"Schrijf voluit: 21 = ___", a:"eenentwintig", w:"Eenheid vóór tiental, aan elkaar." },
    { t:"cloze", q:"Schrijf voluit: 22 = ___", a:"tweeëntwintig", w:"Trema op de e: tweeëntwintig." },
    { t:"mc", q:"'Half tien' betekent:", o:["10:30","9:30","10:15"], a:"9:30",
      w:"Half telt naar het volgende uur toe." },
    { t:"cloze", q:"Hoe laat is 07:45? Het is kwart ___ acht.", a:"voor", w:"kwart voor acht." },
    { t:"mc", q:"18:20 in spreektaal:", o:["tien voor half zeven","tien over half zeven","twintig over half zes"], a:"tien voor half zeven",
      w:"Half zeven is 18:30; tien minuten daarvoor is 18:20." },
    { t:"cloze", q:"3 maart is de ___ maart.", a:"derde", w:"Onregelmatig rangtelwoord." },
    { t:"cloze", q:"De 20e is de ___.", a:"twintigste", w:"Vanaf 20 komt -ste." },
    { t:"cloze", q:"De 8e is de ___.", a:"achtste", w:"acht + ste (geen extra t)." },
    { t:"mc", q:"Hoe spreek je 1980 uit?", o:["een duizend negenhonderd tachtig","negentienhonderdtachtig","negentien tachtig"], a:"negentienhonderdtachtig",
      w:"Jaartallen in honderdtallen." },
    { t:"cloze", q:"Ik werk van negen ___ vijf.", a:"tot", w:"van ... tot voor een periode." },
    { t:"fout", inst:"Verbeter de zin.", q:"De trein vertrekt om half elf, dus om 11:30.",
      a:"De trein vertrekt om half elf, dus om 10:30.", w:"half elf = 10:30." },
    { t:"cloze", q:"Ik woon hier ___ 2019. (startpunt)", a:"sinds", w:"sinds + startpunt, al + duur." }
  ]);
})();
