/* De teksten zijn de kern van deze app. Een kaartje met één woord erop leert je
 * weinig; een woord dat je uit een zin moet terughalen die ergens over gaat,
 * blijft wel hangen.
 *
 * Opmaak in het tekstveld:
 *   [[woord]]  gat van de eerste orde — de doelwoorden en de grammaticale kern.
 *              Deze verdwijnen als eerste.
 *   [woord]    gat van de tweede orde — verdwijnt pas bij een hogere slijtage.
 *   Alles daarbuiten blijft altijd staan.
 *
 * Slijtage loopt van 0 (je leest de tekst heel) tot 4 (je bouwt hem terug op uit
 * de Engelse samenvatting). Elke ontmoeting wordt kaler.
 *
 * vragen: begripsvragen. Je typt een antwoord; goed zodra een van de sleutels
 * erin voorkomt. Streng nakijken op begrip heeft geen zin — het gaat om lezen.
 */
window.T_TEKSTEN = [
{
  id:"t01", niveau:"B1", thema:"werk", soort:"e-mail",
  titel:"De vergadering is verzet",
  tekst:
"Beste Ashok,\n\n" +
"Zoals [[afgesproken]] hebben we de vergadering [verzet] naar donderdagvoormiddag. " +
"De reden is dat twee collega's uit Antwerpen pas later [[beschikbaar]] zijn.\n\n" +
"Kun jij tegen woensdagavond de [cijfers] van het vorige kwartaal [[klaarzetten]]? " +
"Het hoeft niet [uitgebreid] te zijn; een [overzicht] van de belangrijkste [[afwijkingen]] [[volstaat]]. " +
"[[Loop]] je ergens tegenaan, laat het me dan [[gerust]] weten.\n\n" +
"Met vriendelijke groeten,\nKatrien",
  gist:"Your manager has moved the meeting to Thursday morning because two colleagues from Antwerp are only available later. She asks you to prepare last quarter's figures by Wednesday evening — an overview of the main deviations is enough.",
  woorden:[["afgesproken","agreed"],["beschikbaar","available"],["klaarzetten","to get ready / prepare"],
           ["de afwijking","deviation, discrepancy"],["gerust","freely, don't hesitate"],["volstaan","to suffice"]],
  vragen:[
    {v:"Waarom is de vergadering verzet?", sleutel:["later","beschikbaar","antwerpen","collega"],
     a:"Omdat twee collega's uit Antwerpen pas later beschikbaar zijn."},
    {v:"Wat moet je klaarzetten, en tegen wanneer?", sleutel:["cijfer","woensdag"],
     a:"De cijfers van het vorige kwartaal, tegen woensdagavond."}
  ],
  schrijf:{op:"Antwoord Katrien in één zin: het lukt je, maar pas donderdagochtend vroeg.",
           model:"Dat is geen probleem, maar het lukt me pas donderdagochtend vroeg."},
  focus:"Let op 'hoeft niet ... te zijn' — na hoeven komt altijd te, na de andere modale werkwoorden nooit."
},
{
  id:"t02", niveau:"B1", thema:"vervoer", soort:"nieuwsbericht",
  titel:"Werken aan het spoor",
  tekst:
"Reizigers tussen Gent en Brussel moeten dit weekend [[rekening houden]] met vertragingen. " +
"Door werken aan het spoor rijden er [[minder]] treinen dan gewoonlijk, en op zondag rijdt er " +
"tussen tien en veertien uur [helemaal geen] trein.\n\n" +
"De spoorwegbeheerder [[raadt aan]] om vooraf de app te [raadplegen]. " +
"Wie toch moet reizen, kan [[gebruikmaken]] van vervangbussen die aan de achterkant van het " +
"station [vertrekken]. De rit duurt ongeveer [twintig] minuten langer.\n\n" +
"De werken [[kaderen]] in een groter project dat de reistijd op termijn juist moet [[verkorten]].",
  gist:"Track works this weekend mean fewer trains between Ghent and Brussels, and none at all on Sunday between 10:00 and 14:00. Replacement buses leave from the back of the station and take about twenty minutes longer. The works are part of a larger project meant to shorten journey times eventually.",
  woorden:[["rekening houden met","to take into account"],["aanraden","to recommend"],["raadplegen","to consult"],
           ["gebruikmaken van","to make use of"],["kaderen in","to be part of"],["verkorten","to shorten"],
           ["op termijn","in the longer run"]],
  vragen:[
    {v:"Wat gebeurt er op zondag tussen tien en twee?", sleutel:["geen trein","geen","niets","bus"],
     a:"Dan rijdt er helemaal geen trein."},
    {v:"Waarom worden de werken uitgevoerd?", sleutel:["reistijd","verkort","sneller","project"],
     a:"Ze horen bij een project dat de reistijd op termijn moet verkorten."}
  ],
  schrijf:{op:"Schrijf één zin waarin je een collega waarschuwt, met 'rekening houden met'.",
           model:"Hou er rekening mee dat er dit weekend minder treinen rijden tussen Gent en Brussel."},
  focus:"'rekening houden met' splitst in de hoofdzin: hou er rekening mee dat ..."
},
{
  id:"t03", niveau:"B1", thema:"gezondheid", soort:"gesprek",
  titel:"Bij de huisarts",
  tekst:
"— Vertel eens, wat [[scheelt]] er?\n" +
"— Ik heb al twee weken last van mijn rug. Vooral 's ochtends is het [[hevig]].\n" +
"— Is er iets [veranderd] in uw werk of uw houding?\n" +
"— Ik werk sinds kort [[voltijds]] van thuis uit, aan de keukentafel.\n" +
"— Dat [[verklaart]] veel. Uw rug is die houding niet [[gewend]]. " +
"Ik schrijf voorlopig geen medicatie voor; probeer eerst elk uur even [recht] te staan " +
"en zorg voor een [degelijke] stoel.\n" +
"— En als het niet [[overgaat]]?\n" +
"— Dan maakt u over drie weken een nieuwe [afspraak] en [[verwijs]] ik u door naar de kinesist.",
  gist:"At the GP: two weeks of back pain, worst in the mornings, since starting to work full-time from home at the kitchen table. The doctor prescribes no medication yet — stand up every hour, get a decent chair — and will refer the patient to a physiotherapist in three weeks if it hasn't cleared up.",
  woorden:[["schelen","to be the matter"],["hevig","severe, intense"],["voltijds","full-time"],
           ["verklaren","to explain"],["gewend zijn aan","to be used to"],["overgaan","to pass, to clear up"],
           ["doorverwijzen","to refer on"],["degelijk","solid, decent"]],
  vragen:[
    {v:"Wat is volgens de arts de oorzaak?", sleutel:["houding","thuis","keukentafel","werk"],
     a:"De nieuwe houding: voltijds thuiswerken aan de keukentafel."},
    {v:"Wat gebeurt er als de klachten blijven?", sleutel:["kinesist","doorverwijz","verwijs","afspraak"],
     a:"Dan verwijst de arts hem door naar de kinesist."}
  ],
  schrijf:{op:"Beschrijf in één zin een klacht, met 'last hebben van'.",
           model:"Ik heb sinds een week last van mijn schouder, vooral als ik lang aan de computer zit."},
  focus:"'gewend zijn aan' + zelfstandig naamwoord, 'gewend zijn te' + werkwoord."
},
{
  id:"t04", niveau:"B1", thema:"wonen", soort:"brief",
  titel:"Opzeg van de huur",
  tekst:
"Geachte mevrouw Peeters,\n\n" +
"Met deze brief [[zeg]] ik de huurovereenkomst voor het appartement in de Lange Steenstraat [[op]]. " +
"Zoals in het contract [[bepaald]] is, [[respecteer]] ik een [opzegtermijn] van drie maanden. " +
"De huur [[loopt]] dus [[af]] op 31 mei.\n\n" +
"Ik [stel] voor om de [plaatsbeschrijving] samen te [[overlopen]] in de laatste week van mei. " +
"De kleine [[beschadiging]] aan de keukendeur zal ik [[voordien]] laten herstellen.\n\n" +
"Mag ik u vragen de [[waarborg]] na de [oplevering] over te schrijven op mijn rekening?\n\n" +
"Met de meeste hoogachting,\nA. Krishnamoorthy",
  gist:"A formal letter terminating a flat lease with the contractual three months' notice, ending 31 May. The writer proposes to go through the inventory together in the last week of May, will have a small bit of damage to the kitchen door repaired beforehand, and asks for the deposit to be transferred after handover.",
  woorden:[["opzeggen","to terminate (a contract)"],["de opzegtermijn","notice period"],["bepalen","to stipulate"],
           ["de plaatsbeschrijving","inventory of fixtures (BE)"],["de beschadiging","damage"],
           ["voordien","beforehand"],["de waarborg","deposit (BE)"]],
  vragen:[
    {v:"Wanneer loopt de huur af?", sleutel:["31 mei","mei","eenendertig"], a:"Op 31 mei."},
    {v:"Wat vraagt de schrijver aan de eigenaar?", sleutel:["waarborg","rekening","overschrijv","terug"],
     a:"De waarborg na de oplevering op zijn rekening over te schrijven."}
  ],
  schrijf:{op:"Schrijf de openingszin van een formele brief waarin je een abonnement opzegt.",
           model:"Met deze brief zeg ik mijn abonnement op vanaf 1 juli."},
  focus:"Scheidbaar werkwoord in de hoofdzin: 'ik zeg de overeenkomst op' — het voorvoegsel gaat naar het einde."
},
{
  id:"t05", niveau:"B2", thema:"milieu", soort:"nieuwsbericht",
  titel:"Minder plastic in de winkelkar",
  tekst:
"Een [[proefproject]] in vijftien Vlaamse supermarkten laat zien dat klanten hun gedrag wel degelijk " +
"[[aanpassen]], op voorwaarde dat het alternatief niet duurder is. In de deelnemende winkels werd " +
"groenten en fruit uitsluitend [los] aangeboden; wie toch een zakje wilde, betaalde [[voortaan]] " +
"tien cent.\n\n" +
"Het [[verbruik]] van plastic zakjes daalde in drie maanden met bijna zeventig procent. " +
"Opvallend is dat de verkoop van groenten [[nauwelijks]] [terugliep], iets wat de sector vooraf " +
"had [[gevreesd]].\n\n" +
"De onderzoekers [[waarschuwen]] wel voor te veel optimisme: het effect is gemeten in winkels " +
"waar de klanten [op voorhand] waren [ingelicht]. Of dezelfde daling [[stand houdt]] zonder " +
"campagne, moet nog blijken.",
  gist:"A pilot in fifteen Flemish supermarkets shows customers do change behaviour if the alternative isn't more expensive: loose fruit and veg only, ten cents for a bag. Plastic bag use fell by nearly 70% in three months and vegetable sales barely dropped, which the sector had feared. Researchers warn the customers had been informed in advance, so it's unclear whether the drop holds without a campaign.",
  woorden:[["het proefproject","pilot project"],["aanpassen","to adjust"],["voortaan","from now on"],
           ["het verbruik","consumption"],["nauwelijks","hardly"],["teruglopen","to decline"],
           ["vrezen","to fear"],["stand houden","to hold up"],["inlichten","to inform"]],
  vragen:[
    {v:"Onder welke voorwaarde passen klanten hun gedrag aan?", sleutel:["niet duurder","duurder","prijs","goedkoop"],
     a:"Als het alternatief niet duurder is."},
    {v:"Waarom zijn de onderzoekers voorzichtig?", sleutel:["ingelicht","campagne","vooraf","op voorhand","gewaarschuwd"],
     a:"De klanten waren vooraf ingelicht; zonder campagne is het effect onzeker."}
  ],
  schrijf:{op:"Vat het resultaat samen in één zin met 'daalde met'.",
           model:"Het verbruik van plastic zakjes daalde in drie maanden met bijna zeventig procent."},
  focus:"'wel degelijk' versterkt: het gebeurt écht, tegen de twijfel in."
},
{
  id:"t06", niveau:"B2", thema:"werk", soort:"gesprek",
  titel:"Een lastig functioneringsgesprek",
  tekst:
"— Ik wil het even hebben over de [[samenwerking]] met het team in Praag. Er is twee keer een " +
"deadline [[gemist]].\n" +
"— Dat [[klopt]], maar de opdracht was pas [halverwege] de week duidelijk.\n" +
"— Daar heb je een punt. Toch had ik graag [[vernomen]] dat het niet ging lukken, en liefst " +
"voordat de klant erom vroeg.\n" +
"— [[Terecht]]. Ik heb het te lang [voor me] gehouden omdat ik dacht dat ik het nog kon " +
"[[rechttrekken]].\n" +
"— Dat [[waardeer]] ik, maar het maakt het voor mij moeilijk om [[bij te sturen]]. " +
"Laten we [afspreken] dat je het meldt zodra je twijfelt, ook als je nog geen oplossing hebt.",
  gist:"A performance conversation about two missed deadlines with the Prague team. The employee points out the assignment only became clear midweek; the manager accepts that but wanted to hear earlier that it wouldn't work, ideally before the client asked. They agree the employee will flag doubts immediately, even without a solution ready.",
  woorden:[["de samenwerking","cooperation"],["vernemen","to learn, be told"],["terecht","fair enough, rightly"],
           ["rechttrekken","to put right"],["waarderen","to appreciate"],["bijsturen","to adjust course"],
           ["kloppen","to be correct"]],
  vragen:[
    {v:"Waarom heeft de medewerker niets gezegd?", sleutel:["rechttrekken","zelf","oplossen","dacht"],
     a:"Hij dacht dat hij het nog zelf kon rechttrekken."},
    {v:"Wat spreken ze af?", sleutel:["meld","twijfel","zodra","laten weten"],
     a:"Dat hij het meldt zodra hij twijfelt, ook zonder oplossing."}
  ],
  schrijf:{op:"Geef in één zin toe dat iemand gelijk heeft, zonder je excuses te overdrijven.",
           model:"Daar heb je een punt; ik had het eerder moeten melden."},
  focus:"'graag' + voltooid deelwoord in 'ik had graag vernomen' — beleefde spijt over iets wat niet gebeurde."
},
{
  id:"t07", niveau:"B2", thema:"media", soort:"opinie",
  titel:"Het thuiswerk is niet gratis",
  tekst:
"Sinds werkgevers [[massaal]] op thuiswerk zijn [overgeschakeld], wordt de winst vooral in " +
"[[bespaarde]] reistijd uitgedrukt. Dat is begrijpelijk, maar het [[verhult]] een verschuiving: " +
"kosten die vroeger bij het bedrijf lagen, [[belanden]] nu bij de werknemer. Verwarming, " +
"elektriciteit, een [degelijke] bureaustoel — het [[telt op]].\n\n" +
"Wie [[erop wijst]], krijgt te horen dat er [toch] een vergoeding bestaat. Die is er, maar ze " +
"dekt zelden meer dan een [fractie]. Bovendien [[gaat]] ze uit van een werknemer met een aparte " +
"kamer, en precies wie dat niet heeft, [[draagt]] de zwaarste last.\n\n" +
"Thuiswerk blijft [[winst]] voor wie het aankan. Maar laten we ophouden te doen alsof het " +
"[niemand] iets kost.",
  gist:"An opinion piece arguing that the gains from home working are measured in saved commuting time while costs — heating, electricity, a decent chair — quietly shift from employer to employee. The allowance that exists covers only a fraction and assumes a separate room; those without one carry the heaviest burden.",
  woorden:[["massaal","en masse"],["overschakelen op","to switch to"],["verhullen","to conceal"],
           ["belanden","to end up"],["optellen","to add up"],["wijzen op","to point out"],
           ["de vergoeding","allowance, compensation"],["de fractie","a fraction"],["de last","burden"]],
  vragen:[
    {v:"Welke verschuiving beschrijft de auteur?", sleutel:["kosten","werknemer","bedrijf","werkgever"],
     a:"Kosten die vroeger bij het bedrijf lagen, komen nu bij de werknemer terecht."},
    {v:"Wie draagt volgens de tekst de zwaarste last?", sleutel:["geen aparte kamer","kamer","geen ruimte","klein"],
     a:"Wie geen aparte werkkamer heeft."}
  ],
  schrijf:{op:"Formuleer één zin met 'het verhult dat ...' over een onderwerp naar keuze.",
           model:"Die mooie cijfers verhullen dat de wachttijden voor patiënten juist langer zijn geworden."},
  focus:"Nominale stijl en 'wie ..., die ...': 'precies wie dat niet heeft, draagt de zwaarste last'."
},
{
  id:"t08", niveau:"B2", thema:"geld", soort:"brief",
  titel:"Bericht van de verzekeraar",
  tekst:
"Geachte heer Krishnamoorthy,\n\n" +
"Uw polis wordt op 1 januari [[stilzwijgend]] verlengd. De premie stijgt met 4,2 procent, " +
"wat [[voortvloeit]] uit de indexering die in de algemene voorwaarden is [[opgenomen]].\n\n" +
"Wenst u de overeenkomst niet te verlengen, dan dient u [[uiterlijk]] drie maanden voor de " +
"vervaldag schriftelijk op te zeggen. Een [aangetekende] brief [volstaat]; een e-mail wordt " +
"[[niet aanvaard]].\n\n" +
"Wij [[vestigen]] er uw aandacht op dat de dekking voor [waterschade] ongewijzigd blijft, " +
"maar dat de [[vrijstelling]] per schadegeval verhoogt naar 250 euro.",
  gist:"An insurer's letter: the policy renews automatically on 1 January, the premium rises 4.2% through contractual indexation, cancellation must be in writing by registered letter at least three months before the renewal date (email not accepted), water damage cover is unchanged but the excess per claim rises to €250.",
  woorden:[["stilzwijgend","tacitly, automatically"],["voortvloeien uit","to follow from"],
           ["opnemen in","to include in"],["uiterlijk","at the latest"],["de vervaldag","expiry date"],
           ["aangetekend","registered (post)"],["de vrijstelling","excess, deductible"],
           ["de aandacht vestigen op","to draw attention to"]],
  vragen:[
    {v:"Hoe moet je opzeggen?", sleutel:["aangetekend","schriftelijk","brief"],
     a:"Schriftelijk, met een aangetekende brief — een e-mail wordt niet aanvaard."},
    {v:"Wat verandert er aan de waterschadedekking?", sleutel:["vrijstelling","250","niets aan de dekking","dekking blijft"],
     a:"De dekking blijft gelijk, maar de vrijstelling stijgt naar 250 euro."}
  ],
  schrijf:{op:"Schrijf één formele zin met 'uiterlijk' over een termijn.",
           model:"Wij verwachten uw antwoord uiterlijk op 15 maart."},
  focus:"Formeel register: 'dient u ... op te zeggen' in plaats van 'moet u opzeggen'."
},
{
  id:"t09", niveau:"B1", thema:"onderwijs", soort:"gesprek",
  titel:"Op het oudercontact",
  tekst:
"— Uw dochter doet het goed, maar ze [[durft]] weinig te zeggen in de klas.\n" +
"— Thuis is ze net [[het tegenovergestelde]], hoor.\n" +
"— Dat hoor ik vaker. Ik denk dat ze [bang] is om een fout te maken waar iedereen bij is.\n" +
"— Kunnen we daar iets aan doen?\n" +
"— Ik laat haar [[voortaan]] eerst in [duo] antwoorden, en pas daarna voor de klas. " +
"Zo [[bouwt]] ze het rustig [[op]].\n" +
"— En haar [wiskunde]?\n" +
"— Daar [[hapert]] het bij de breuken. Niet [[onoverkomelijk]], maar ze moet er wekelijks aan " +
"werken in plaats van alles voor de toets te [[proppen]].",
  gist:"Parents' evening: the daughter does well but rarely speaks in class, apparently afraid of making mistakes in front of everyone, though she's the opposite at home. The teacher will let her answer in pairs first. Maths is sticking at fractions — not insurmountable, but she needs weekly work rather than cramming before the test.",
  woorden:[["durven","to dare"],["het tegenovergestelde","the opposite"],["voortaan","from now on"],
           ["opbouwen","to build up"],["haperen","to falter, get stuck"],["onoverkomelijk","insurmountable"],
           ["proppen","to cram"]],
  vragen:[
    {v:"Waarom zegt het meisje weinig in de klas?", sleutel:["bang","fout","angst"],
     a:"Ze is bang om een fout te maken waar iedereen bij is."},
    {v:"Wat stelt de leerkracht voor?", sleutel:["duo","twee","samen","eerst"],
     a:"Dat ze eerst in duo antwoordt en pas daarna voor de klas."}
  ],
  schrijf:{op:"Schrijf één zin met 'in plaats van ... te ...'.",
           model:"Ze moet elke week een beetje oefenen in plaats van alles voor de toets te proppen."},
  focus:"'durven' met of zonder te: beide bestaan, maar 'ze durft weinig te zeggen' is het gewoonst."
},
{
  id:"t10", niveau:"B2", thema:"technologie", soort:"nieuwsbericht",
  titel:"De gemeente schrapt het papieren formulier",
  tekst:
"Vanaf september kunnen inwoners hun aanvraag alleen nog [[digitaal]] indienen. De gemeente " +
"[[verwacht]] daarmee jaarlijks zo'n vierduizend uur administratie te [[besparen]].\n\n" +
"Niet iedereen is [[gerustgesteld]]. De seniorenraad [[betwijfelt]] of de begeleiding [volstaat]: " +
"in de bibliotheek staat één medewerker klaar, en dat [[uitgerekend]] op dinsdagvoormiddag, " +
"wanneer er ook al [zitdag] is.\n\n" +
"Het bestuur [[erkent]] het probleem en belooft de openingsuren te [[verruimen]] " +
"[[zodra]] de eerste maanden [geëvalueerd]  zijn. Wie echt niet [overweg kan] met de computer, " +
"kan een afspraak aan huis vragen — al is die dienst [[voorlopig]] beperkt tot vijftig gezinnen.",
  gist:"From September the council only accepts applications digitally, expecting to save some 4,000 hours of admin a year. The seniors' council doubts the support is enough: one staff member in the library, on Tuesday mornings, when there's already a walk-in surgery. The council acknowledges this, promises longer hours once the first months are evaluated, and offers home appointments — limited for now to fifty households.",
  woorden:[["indienen","to submit"],["besparen","to save (resources)"],["gerustgesteld","reassured"],
           ["betwijfelen","to doubt"],["uitgerekend","of all times / precisely"],["erkennen","to acknowledge"],
           ["verruimen","to widen, extend"],["overweg kunnen met","to cope with"],["voorlopig","for the time being"]],
  vragen:[
    {v:"Waarom is de seniorenraad niet gerust?", sleutel:["begeleiding","één medewerker","hulp","dinsdag"],
     a:"Er is maar één medewerker, uitgerekend op het moment dat er ook zitdag is."},
    {v:"Wat belooft het bestuur?", sleutel:["openingsuren","verruim","meer uren","evalu"],
     a:"De openingsuren te verruimen zodra de eerste maanden geëvalueerd zijn."}
  ],
  schrijf:{op:"Schrijf één zin met 'zodra' over iets wat jij gaat doen.",
           model:"Zodra het formulier online staat, dien ik mijn aanvraag in."},
  focus:"'zodra' is onderschikkend: de persoonsvorm gaat naar het einde van de bijzin."
}
,
{
  id:"t11", niveau:"B1", thema:"wonen", soort:"gesprek",
  titel:"Bij de garagist",
  tekst:
"— Ik hoor een raar geluid als ik [[rem]]. Vooral bij lage snelheid.\n" +
"— Even kijken. Wanneer is de wagen voor het laatst [[nagekeken]]?\n" +
"— Bij de [keuring] in maart, maar sindsdien niet meer.\n" +
"— Dat verklaart het. De remblokken zijn [[versleten]]. Op zich niet [[dringend]], " +
"maar ik zou er niet te lang mee [[wachten]].\n" +
"— Wat [[kost]] dat ongeveer?\n" +
"— Reken op tweehonderd euro, [[inclusief]] werkuren. Ik kan het [donderdag] doen, " +
"tenzij u de wagen nodig hebt.\n" +
"— Donderdag [lukt]. Kunt u me [bellen] zodra hij klaar is?",
  gist:"At the garage: a strange noise when braking at low speed. The brake pads are worn — not urgent, but not to be left too long. Around two hundred euros including labour, and it can be done Thursday.",
  woorden:[["remmen","to brake"],["nakijken","to check over"],["de keuring","vehicle inspection (BE)"],
           ["versleten","worn out"],["dringend","urgent"],["inclusief","including"],["tenzij","unless"]],
  vragen:[
    {v:"Wat is er kapot?", sleutel:["remblok","rem","blokken"], a:"De remblokken zijn versleten."},
    {v:"Wat kost de herstelling?", sleutel:["tweehonderd","200"], a:"Ongeveer tweehonderd euro, inclusief werkuren."}
  ],
  schrijf:{op:"Vraag in één zin of iets tegen vrijdag klaar kan zijn.",
           model:"Zou het tegen vrijdag klaar kunnen zijn, of is dat te krap?"},
  focus:"'tenzij' = behalve als. Het is onderschikkend, dus de persoonsvorm gaat naar achteren."
},
{
  id:"t12", niveau:"B2", thema:"geld", soort:"nieuwsbericht",
  titel:"Zonnepanelen leveren minder op",
  tekst:
"Wie vandaag zonnepanelen legt, [[verdient]] ze trager terug dan vijf jaar geleden. " +
"Dat komt niet doordat de panelen duurder zijn — die zijn juist [[goedkoper]] geworden — " +
"maar doordat de [[terugverdientijd]] afhangt van wat je zelf [[verbruikt]].\n\n" +
"Sinds de [afschaffing] van de terugdraaiende teller [[loont]] het vooral om stroom te " +
"gebruiken op het moment dat de zon [schijnt]. Wie overdag werkt en 's avonds kookt, " +
"[[levert]] het grootste deel aan het net [[terug]] tegen een lage vergoeding.\n\n" +
"Een thuisbatterij [[biedt]] een uitweg, maar kost al snel vierduizend euro. " +
"[[Volgens]] de sector is de investering pas [interessant] wanneer je [verbruik] " +
"hoog en [voorspelbaar] is.",
  gist:"Solar panels pay back more slowly than five years ago — not because panels cost more (they're cheaper) but because payback now depends on how much you consume yourself. Since the net-metering change, it pays to use power while the sun shines. A home battery is a way out but costs around €4,000 and only makes sense with high, predictable consumption.",
  woorden:[["terugverdienen","to earn back"],["de terugverdientijd","payback period"],["verbruiken","to consume"],
           ["de afschaffing","abolition"],["lonen","to be worth it"],["terugleveren","to feed back"],
           ["de vergoeding","compensation"],["voorspelbaar","predictable"]],
  vragen:[
    {v:"Waarom duurt het terugverdienen langer?", sleutel:["zelf verbruik","verbruik","teller","eigen"],
     a:"Omdat het afhangt van hoeveel je zelf verbruikt, sinds de terugdraaiende teller is afgeschaft."},
    {v:"Wanneer is een thuisbatterij interessant?", sleutel:["hoog","voorspelbaar","veel verbruik"],
     a:"Als je verbruik hoog en voorspelbaar is."}
  ],
  schrijf:{op:"Schrijf één zin met 'het loont om ... te ...'.",
           model:"Het loont om de wasmachine overdag te laten draaien."},
  focus:"'doordat' geeft een oorzaak zonder wil; 'omdat' geeft een reden. Hier is het gevolg van een regel, dus doordat."
},
{
  id:"t13", niveau:"B1", thema:"werk", soort:"e-mail",
  titel:"Klacht over een levering",
  tekst:
"Geachte mevrouw,\n\n" +
"Op 3 maart heb ik een bureaustoel [[besteld]] met [bestelnummer] 88-4471. " +
"Volgens de bevestiging zou de levering [[binnen]] tien werkdagen [[plaatsvinden]]. " +
"Intussen zijn we drie weken verder en heb ik nog [[niets]] ontvangen.\n\n" +
"Op mijn twee eerdere e-mails heb ik geen [[antwoord]] gekregen. Ik vraag u daarom " +
"om me [[uiterlijk]] deze week te laten weten wanneer de stoel wordt geleverd. " +
"Lukt dat niet, dan [[annuleer]] ik de bestelling en verwacht ik het [bedrag] " +
"binnen veertien dagen [terug].\n\n" +
"In afwachting van uw [reactie],\nA. Krishnamoorthy",
  gist:"A complaint email: an office chair ordered 3 March should have arrived within ten working days, but three weeks on nothing has come and two earlier emails went unanswered. The writer asks for a delivery date this week at the latest, otherwise cancels and expects a refund within fourteen days.",
  woorden:[["bestellen","to order"],["plaatsvinden","to take place"],["uiterlijk","at the latest"],
           ["annuleren","to cancel"],["het bedrag","the amount"],["in afwachting van","pending, awaiting"]],
  vragen:[
    {v:"Wat gebeurt er als er deze week geen antwoord komt?", sleutel:["annuleer","annuleren","geld terug","bestelling"],
     a:"Dan annuleert hij de bestelling en wil hij het bedrag terug."},
    {v:"Hoe lang wacht hij al?", sleutel:["drie weken","3 weken","drie"], a:"Drie weken."}
  ],
  schrijf:{op:"Schrijf de slotzin van een klachtmail waarin je een termijn stelt.",
           model:"Graag ontvang ik uiterlijk vrijdag een bevestiging van de nieuwe leverdatum."},
  focus:"'Lukt dat niet, dan ...' — een voorwaarde zonder 'als', met inversie. Heel gewoon in zakelijke taal."
},
{
  id:"t14", niveau:"B2", thema:"media", soort:"opinie",
  titel:"Elke vergadering had een mail kunnen zijn",
  tekst:
"Er wordt veel [[geklaagd]] over vergaderingen, en meestal [[terecht]]. " +
"Maar de oplossing die je overal hoort — minder vergaderen — [[lost]] het probleem niet " +
"[[op]]. Wat er misgaat, is zelden het aantal; het is het [[gebrek]] aan een besluit.\n\n" +
"Een vergadering zonder [[knoop]] die wordt doorgehakt, [[verplaatst]] het werk alleen maar " +
"naar de volgende week. Iedereen [is het eens] dat er iets moet gebeuren, niemand weet " +
"[[wie]] wat doet, en drie weken later zit dezelfde groep [opnieuw] rond de tafel.\n\n" +
"Wie het echt wil [[aanpakken]], begint niet met de agenda maar met de vraag: welke " +
"[beslissing] moet aan het eind van dit uur [genomen] zijn? Alles wat daar niet aan " +
"[[bijdraagt]], kan inderdaad een mail worden.",
  gist:"An opinion piece: complaining about meetings is fair, but 'meet less' misses the point. The problem is rarely the number of meetings but the absence of a decision — a meeting without one just pushes work to next week. Start not from the agenda but from which decision must be made by the end of the hour.",
  woorden:[["klagen over","to complain about"],["terecht","justified"],["oplossen","to solve"],
           ["het gebrek aan","the lack of"],["een knoop doorhakken","to cut the knot, decide"],
           ["aanpakken","to tackle"],["bijdragen aan","to contribute to"]],
  vragen:[
    {v:"Wat is volgens de auteur het echte probleem?", sleutel:["besluit","beslissing","knoop","geen besluit"],
     a:"Dat er geen besluit valt."},
    {v:"Waarmee moet je volgens hem beginnen?", sleutel:["beslissing","welke beslissing","besluit","vraag"],
     a:"Met de vraag welke beslissing aan het eind genomen moet zijn."}
  ],
  schrijf:{op:"Formuleer in één zin wat er aan het eind van jouw volgende vergadering beslist moet zijn.",
           model:"Aan het eind van dit uur moet vastliggen wie de migratie uitvoert en tegen wanneer."},
  focus:"Scheidbaar werkwoord over een lange zin: 'lost het probleem niet op' — het voorvoegsel wacht helemaal achteraan."
},
{
  id:"t15", niveau:"B2", thema:"gezondheid", soort:"nieuwsbericht",
  titel:"Personeelstekort in de woonzorgcentra",
  tekst:
"Bijna een op de vijf plaatsen in de Vlaamse woonzorgcentra blijft [leeg], niet [[bij gebrek aan]] " +
"bewoners maar [[bij gebrek aan]] personeel. Directies [[schrappen]] bedden omdat ze de zorg " +
"anders niet [[kunnen garanderen]].\n\n" +
"Het probleem is niet nieuw, maar het [[verscherpt]]. Wie afstudeert, kiest [[steeds vaker]] " +
"voor het ziekenhuis, waar de [uurroosters] voorspelbaarder zijn en de [[verloning]] hoger " +
"ligt. Daar komt bij dat een [aanzienlijk] deel van het huidige personeel binnen tien jaar " +
"met [pensioen] gaat.\n\n" +
"De sector [[dringt aan]] op hogere lonen, maar [[wijst]] ook [[op]] iets wat minder geld " +
"kost: wie [[inspraak]] krijgt in zijn eigen rooster, blijft langer.",
  gist:"Nearly one in five places in Flemish care homes stays empty — for lack of staff, not residents. Graduates increasingly choose hospitals for more predictable rosters and better pay, and a large share of current staff retires within ten years. The sector wants higher wages but also points to something cheaper: staff who get a say in their own roster stay longer.",
  woorden:[["bij gebrek aan","for lack of"],["schrappen","to scrap, cut"],["garanderen","to guarantee"],
           ["verscherpen","to sharpen, worsen"],["de verloning","pay, remuneration"],["aanzienlijk","considerable"],
           ["aandringen op","to press for"],["de inspraak","a say, participation"]],
  vragen:[
    {v:"Waarom blijven de plaatsen leeg?", sleutel:["personeel","tekort","niemand","gebrek"],
     a:"Er is te weinig personeel."},
    {v:"Welke goedkope oplossing noemt de sector?", sleutel:["inspraak","rooster","zelf","mee bepalen"],
     a:"Personeel inspraak geven in het eigen rooster."}
  ],
  schrijf:{op:"Schrijf één zin met 'bij gebrek aan'.",
           model:"Bij gebrek aan tijd hebben we het punt naar de volgende vergadering verschoven."},
  focus:"'wijzen op' is een vaste combinatie; met een zaak wordt dat 'erop wijzen'."
},
{
  id:"t16", niveau:"B1", thema:"werk", soort:"gesprek",
  titel:"Het sollicitatiegesprek",
  tekst:
"— U werkt nu vier jaar bij dezelfde werkgever. Waarom wilt u [[veranderen]]?\n" +
"— Ik heb er veel geleerd, maar de laatste tijd doe ik vooral [[hetzelfde]]. " +
"Ik zoek een plek waar ik meer [[verantwoordelijkheid]] kan nemen.\n" +
"— Wat zou u hier als eerste willen [[aanpakken]]?\n" +
"— Ik zou eerst een maand [[meekijken]]. Ik heb geleerd dat je zonder die tijd de " +
"verkeerde dingen [[verbetert]].\n" +
"— En uw [[zwakke]] punt?\n" +
"— Ik neem te veel [zelf] op me. Daar ben ik mee bezig: ik [spreek] nu bewust af wie wat doet, " +
"ook als ik het [sneller] alleen zou kunnen.\n" +
"— Wanneer zou u kunnen [[beginnen]]?\n" +
"— Mijn [opzegtermijn] is één maand.",
  gist:"A job interview: four years with the same employer, now doing the same things and looking for more responsibility. The candidate would first spend a month observing, names taking on too much personally as a weakness, and has one month's notice.",
  woorden:[["de verantwoordelijkheid","responsibility"],["aanpakken","to tackle"],["meekijken","to observe, look along"],
           ["verbeteren","to improve"],["het zwakke punt","weak point"],["de opzegtermijn","notice period"]],
  vragen:[
    {v:"Waarom wil hij weg?", sleutel:["hetzelfde","verantwoordelijkheid","meer","leren"],
     a:"Hij doet vooral hetzelfde en wil meer verantwoordelijkheid."},
    {v:"Wat doet hij aan zijn zwakke punt?", sleutel:["afspreken","wie wat","delegeer","verdeel"],
     a:"Hij spreekt bewust af wie wat doet."}
  ],
  schrijf:{op:"Beantwoord in één zin: waarom wil jij van job veranderen?",
           model:"Ik zoek een rol waarin ik dichter bij de gebruikers sta dan nu het geval is."},
  focus:"'zou ... willen' en 'zou ... kunnen' maken een antwoord voorzichtiger en beleefder."
},
{
  id:"t17", niveau:"B2", thema:"milieu", soort:"nieuwsbericht",
  titel:"Water sparen wordt de norm",
  tekst:
"Na drie droge zomers [[verplicht]] de Vlaamse regering nieuwe woningen tot een " +
"[[regenwaterput]] van minstens vijfduizend liter. Wie [[verbouwt]], valt onder dezelfde " +
"regel [[zodra]] het dak volledig wordt [vernieuwd].\n\n" +
"Critici [[betwijfelen]] of dat volstaat. Het grootste verlies zit niet bij gezinnen maar " +
"in het [[lekverlies]] van het leidingnet, dat op sommige plaatsen [[oploopt]] tot twintig " +
"procent. De drinkwaterbedrijven [[erkennen]] dat, maar [[voeren aan]] dat het vervangen van " +
"leidingen decennia [duurt].\n\n" +
"Wat wél snel [effect] heeft, is de prijs. Sinds de invoering van een hoger tarief boven " +
"een bepaald verbruik is het gemiddelde [[verbruik]] per gezin met zeven procent " +
"[[gedaald]] — zonder dat iemand er iets van [merkte].",
  gist:"After three dry summers, Flanders requires new homes to have a rainwater tank of at least 5,000 litres, and the same applies to renovations once the roof is fully replaced. Critics doubt it's enough: the biggest loss is leakage in the mains, up to 20% in places, which would take decades to replace. What works fast is price — a higher tariff above a certain level cut average household use by 7%.",
  woorden:[["verplichten tot","to oblige to"],["verbouwen","to renovate"],["betwijfelen","to doubt"],
           ["het lekverlies","leakage loss"],["oplopen tot","to run up to"],["erkennen","to acknowledge"],
           ["aanvoeren","to argue, put forward"],["dalen","to fall"]],
  vragen:[
    {v:"Waar zit het grootste waterverlies?", sleutel:["leiding","net","lek"],
     a:"In het lekverlies van het leidingnet."},
    {v:"Wat had het snelste effect?", sleutel:["prijs","tarief","duurder","geld"],
     a:"De prijs: een hoger tarief boven een bepaald verbruik."}
  ],
  schrijf:{op:"Schrijf één zin met 'oplopen tot'.",
           model:"De wachttijd kan in het weekend oplopen tot vier uur."},
  focus:"'zodra' opent een bijzin; let op de persoonsvorm helemaal achteraan."
},
{
  id:"t18", niveau:"B1", thema:"wonen", soort:"e-mail",
  titel:"Een vraag aan de syndicus",
  tekst:
"Beste,\n\n" +
"Sinds vorige week [[werkt]] de verlichting in de [traphal] niet meer. Ik heb de lamp zelf " +
"[[vervangen]], maar dat [[haalde]] niets [[uit]]; vermoedelijk ligt het aan de " +
"[[schakelaar]].\n\n" +
"Kunt u een elektricien [[langs laten komen]]? Het gaat om een gemeenschappelijk deel, " +
"dus ik [[neem aan]] dat de kosten via de [vereniging] lopen.\n\n" +
"Nog een tweede punt: in de [[fietsenberging]] staan al maanden twee fietsen zonder " +
"[eigenaar]. Kan daar bij de volgende [algemene vergadering] iets over [afgesproken] worden?\n\n" +
"Alvast [[bedankt]],\nAshok — appartement 3B",
  gist:"An email to the building manager: the stairwell light has been out since last week, replacing the bulb changed nothing so it's probably the switch. Since it's a common area, the writer assumes the cost goes through the owners' association. Second point: two abandoned bikes in the bike store for months — can it go on the AGM agenda?",
  woorden:[["vervangen","to replace"],["uithalen","to achieve, have effect"],["de schakelaar","the switch"],
           ["langskomen","to come round"],["aannemen","to assume"],["gemeenschappelijk","communal"],
           ["de algemene vergadering","general meeting"]],
  vragen:[
    {v:"Wat is er waarschijnlijk stuk?", sleutel:["schakelaar","knop"], a:"Waarschijnlijk de schakelaar."},
    {v:"Wat is het tweede punt?", sleutel:["fiets","berging","eigenaar"],
     a:"Twee fietsen zonder eigenaar in de fietsenberging."}
  ],
  schrijf:{op:"Vraag in één beleefde zin of iemand iets kan laten herstellen.",
           model:"Zou u een technieker kunnen laten langskomen om de deurbel na te kijken?"},
  focus:"'laten' + infinitief: 'iemand laten komen', 'iets laten herstellen' — je doet het niet zelf."
},
{
  id:"t19", niveau:"B2", thema:"technologie", soort:"opinie",
  titel:"De computer schrijft mee",
  tekst:
"Sinds taalmodellen [[ingeburgerd]] zijn, is de vraag niet meer óf collega's ze gebruiken, " +
"maar [[waarvoor]]. En daar zit het [[onderscheid]] dat er echt toe doet: het verschil tussen " +
"iets laten [[opstellen]] en iets laten [[nakijken]].\n\n" +
"Wie een tekst laat schrijven over een onderwerp dat hij zelf niet [[beheerst]], kan niet " +
"[[beoordelen]] wat er fout aan is. Wie zijn eigen tekst laat [nalezen], houdt de controle " +
"en [[wint]] tijd.\n\n" +
"Voor wie een taal leert geldt hetzelfde, maar scherper. Een zin die je zelf [[moeizaam]] " +
"[bouwt] en daarna laat verbeteren, [blijft] hangen. Een zin die kant-en-klaar [verschijnt], " +
"[[verdwijnt]] even snel als hij kwam.",
  gist:"An opinion piece on language models at work: the question is no longer whether colleagues use them but what for. The real distinction is between having something drafted and having something checked. Someone who has text written on a subject they don't master can't judge what's wrong with it. For language learners this is sharper still: a sentence you build with effort and then have corrected sticks; one that appears ready-made disappears as fast as it came.",
  woorden:[["ingeburgerd","established, part of daily life"],["het onderscheid","the distinction"],
           ["opstellen","to draft"],["beheersen","to master"],["beoordelen","to judge"],
           ["moeizaam","laboriously"],["kant-en-klaar","ready-made"]],
  vragen:[
    {v:"Welk onderscheid maakt de auteur?", sleutel:["opstellen","nakijken","schrijven","verbeteren"],
     a:"Tussen iets laten opstellen en iets laten nakijken."},
    {v:"Waarom blijft een zelfgebouwde zin hangen?", sleutel:["moeizaam","zelf","moeite","inspanning"],
     a:"Omdat je hem zelf met moeite gebouwd hebt."}
  ],
  schrijf:{op:"Schrijf één zin over wanneer jij hulp van een computer wél nuttig vindt.",
           model:"Ik laat mijn tekst pas nakijken nadat ik hem zelf helemaal geschreven heb."},
  focus:"'laten' + infinitief opnieuw, maar nu in de tegenstelling opstellen / nakijken."
},
{
  id:"t20", niveau:"B1", thema:"vervoer", soort:"gesprek",
  titel:"Een afspraak verzetten",
  tekst:
"— Goedemiddag, met Ashok Krishnamoorthy. Ik heb donderdag om tien uur een [[afspraak]], " +
"maar het [[lukt]] me niet.\n" +
"— Geen probleem. Wilt u [[annuleren]] of [[verplaatsen]]?\n" +
"— Verplaatsen, [liefst] volgende week.\n" +
"— Even kijken… dinsdag om kwart over negen, of woensdag [[in de late namiddag]]?\n" +
"— Woensdag [[schikt]] beter. Hoe laat precies?\n" +
"— Zestien uur veertig. U krijgt een [bevestiging] per mail.\n" +
"— Prima. En als ik toch niet [[zou]] kunnen, tot wanneer kan ik dan nog [[afzeggen]]?\n" +
"— Tot [[vierentwintig]] uur op voorhand, anders [rekenen] we de afspraak aan.",
  gist:"A phone call rescheduling an appointment: Thursday at ten doesn't work, the caller wants to move rather than cancel, prefers next week, takes Wednesday 16:40 over Tuesday 9:15, will get an email confirmation, and can cancel up to 24 hours in advance or be charged.",
  woorden:[["verplaatsen","to move (an appointment)"],["schikken","to suit"],["afzeggen","to cancel"],
           ["op voorhand","in advance (BE)"],["aanrekenen","to charge"],["de bevestiging","confirmation"]],
  vragen:[
    {v:"Wanneer is de nieuwe afspraak?", sleutel:["woensdag","16","kwart voor vijf","zestien"],
     a:"Woensdag om 16.40 uur."},
    {v:"Tot wanneer kun je nog kosteloos afzeggen?", sleutel:["24","vierentwintig","dag ervoor","een dag"],
     a:"Tot vierentwintig uur op voorhand."}
  ],
  schrijf:{op:"Vraag telefonisch in één zin of een afspraak verplaatst kan worden.",
           model:"Zou ik mijn afspraak van donderdag naar volgende week kunnen verplaatsen?"},
  focus:"Kloktijd: 'zestien uur veertig' is officieel, 'twintig voor vijf' is spreektaal."
}
,
{
  id:"t21", niveau:"B2", thema:"geld", soort:"brief",
  titel:"Een laatste herinnering",
  tekst:
"Geachte heer,\n\n" +
"Ondanks onze eerdere herinnering [[stellen]] wij vast dat factuur 2024-1187 " +
"ten bedrage van 342,50 euro nog steeds [[openstaat]]. De [vervaldag] was 14 februari.\n\n" +
"Wij verzoeken u het [[verschuldigde]] bedrag binnen tien dagen over te schrijven. " +
"[[Blijft]] betaling uit, dan zijn wij [[genoodzaakt]] het dossier over te dragen aan " +
"een incassobureau, waarbij de [[kosten]] te uwen laste [komen].\n\n" +
"Mocht de factuur intussen [[betaald]] zijn, dan kunt u deze brief als " +
"[[onbestaande]] beschouwen. Bij [betwisting] vragen wij u binnen dezelfde termijn " +
"schriftelijk te [[reageren]].\n\n" +
"Met hoogachting,\nDe boekhouding",
  gist:"A final payment reminder: invoice 2024-1187 for €342.50 is still outstanding since the due date of 14 February. Pay within ten days or the file goes to a collection agency at the debtor's cost. If already paid, ignore the letter; if disputed, respond in writing within the same period.",
  woorden:[["vaststellen","to establish, note"],["openstaan","to be outstanding"],["verschuldigd","owed, due"],
           ["genoodzaakt zijn","to be forced to"],["te uwen laste","at your expense"],
           ["de betwisting","dispute"],["beschouwen als","to regard as"]],
  vragen:[
    {v:"Wat gebeurt er als er niet betaald wordt?", sleutel:["incasso","overgedragen","bureau","dossier"],
     a:"Het dossier gaat naar een incassobureau, op kosten van de klant."},
    {v:"Wat moet je doen als je de factuur betwist?", sleutel:["schriftelijk","brief","reageren","mail"],
     a:"Binnen dezelfde termijn schriftelijk reageren."}
  ],
  schrijf:{op:"Schrijf één zin waarin je beleefd maar duidelijk om betaling vraagt.",
           model:"Wij verzoeken u het openstaande bedrag binnen veertien dagen over te schrijven."},
  focus:"Formeel register: 'wij verzoeken u ... te ...' en 'mocht ... zijn, dan ...' (voorwaarde zonder als)."
},
{
  id:"t22", niveau:"B1", thema:"onderwijs", soort:"nieuwsbericht",
  titel:"Meer volwassenen leren Nederlands",
  tekst:
"Het aantal [[inschrijvingen]] voor Nederlands als tweede taal is dit jaar met elf procent " +
"[[gestegen]]. De centra [[merken]] vooral meer mensen die al [[jaren]] in het land wonen " +
"en werken, maar hun taal willen [[bijschaven]] voor een [promotie] of een studie.\n\n" +
"Dat vraagt iets anders dan een klassieke [beginnerscursus]. \"Wie hier al tien jaar woont, " +
"[[begrijpt]] alles\", zegt een [lesgever] in Gent, \"maar [[durft]] niet te schrijven. " +
"Die mensen hebben geen [woordenlijsten] nodig, wel [[oefening]] in het formuleren.\"\n\n" +
"De centra [[spelen]] daarop [[in]] met korte modules rond schrijven en spreken " +
"op het werk. De [wachtlijsten] blijven [[niettemin]] lang: in de grote steden loopt de " +
"[[wachttijd]] op tot vier maanden.",
  gist:"Enrolments for Dutch as a second language are up 11%. Centres see more people who have lived and worked here for years but want to polish their language for a promotion or study — they understand everything but don't dare write, and need practice in formulating rather than word lists. Short modules are being offered, but waiting lists in the big cities run to four months.",
  woorden:[["de inschrijving","enrolment"],["bijschaven","to polish up"],["de lesgever","teacher (BE)"],
           ["durven","to dare"],["inspelen op","to respond to"],["niettemin","nevertheless"],
           ["de wachttijd","waiting time"]],
  vragen:[
    {v:"Wat hebben die cursisten vooral nodig?", sleutel:["formuleren","schrijven","oefening","spreken"],
     a:"Oefening in het formuleren, niet nog meer woordenlijsten."},
    {v:"Wat is het probleem in de grote steden?", sleutel:["wachttijd","wachtlijst","vier maanden","lang"],
     a:"De wachttijd loopt op tot vier maanden."}
  ],
  schrijf:{op:"Schrijf één zin over wat jou in het Nederlands het meest hindert.",
           model:"Ik begrijp alles wat er gezegd wordt, maar ik twijfel te lang voor ik zelf iets schrijf."},
  focus:"'inspelen op' splitst: 'de centra spelen daarop in'."
},
{
  id:"t23", niveau:"B2", thema:"wonen", soort:"gesprek",
  titel:"Bemiddeling tussen buren",
  tekst:
"— U hebt allebei [[ingestemd]] met een gesprek. Meneer Aerts, wat [[stoort]] u?\n" +
"— Het geluid. Drie keer per week tot na middernacht.\n" +
"— Mevrouw Dorne?\n" +
"— Ik werk in de horeca. Als ik thuiskom is het één uur; ik ga niet [[meteen]] slapen.\n" +
"— Dus het gaat niet om lawaai [[op zich]], maar om het [[tijdstip]].\n" +
"— [[Precies]]. Ik heb niets tegen muziek om acht uur.\n" +
"— Mevrouw, wat zou u [[haalbaar]] vinden?\n" +
"— De wasmachine kan [[wachten]] tot de ochtend. Voor de televisie [koop] ik wel een " +
"[[koptelefoon]].\n" +
"— Meneer, [volstaat] dat?\n" +
"— Als dat [[lukt]], hoor ik u nooit meer [klagen].\n" +
"— Laten we het over drie weken [[evalueren]].",
  gist:"A neighbour mediation: the complaint is not noise as such but its timing — three times a week past midnight. She works in hospitality and gets home at one. She agrees the washing machine can wait until morning and will buy headphones for the TV. They will review in three weeks.",
  woorden:[["instemmen met","to agree to"],["storen","to bother"],["op zich","as such"],
           ["het tijdstip","the moment, timing"],["haalbaar","feasible"],["evalueren","to evaluate"]],
  vragen:[
    {v:"Waar gaat het conflict eigenlijk over?", sleutel:["tijdstip","uur","laat","wanneer","middernacht"],
     a:"Niet om het lawaai op zich, maar om het tijdstip."},
    {v:"Wat stelt mevrouw Dorne voor?", sleutel:["koptelefoon","wasmachine","ochtend"],
     a:"De wasmachine 's ochtends draaien en een koptelefoon kopen."}
  ],
  schrijf:{op:"Stel in één zin een compromis voor aan iemand.",
           model:"Zou het lukken als ik de muziek na elf uur met een koptelefoon beluister?"},
  focus:"'op zich' = op zichzelf beschouwd. Handig om een verwijt te nuanceren."
},
{
  id:"t24", niveau:"B1", thema:"vervoer", soort:"nieuwsbericht",
  titel:"Meer fietspaden, minder ongevallen",
  tekst:
"Op de plaatsen waar de stad de afgelopen drie jaar [[afgescheiden]] fietspaden aanlegde, " +
"[[daalde]] het aantal ongevallen met fietsers met bijna een [[derde]]. Dat blijkt uit cijfers " +
"die de politie gisteren [[vrijgaf]].\n\n" +
"Opvallend is dat het aantal fietsers op diezelfde wegen juist sterk [[toenam]]. " +
"Er gebeuren dus niet alleen [[minder]] ongevallen, er gebeuren er minder [[terwijl]] er " +
"meer fietsers zijn.\n\n" +
"De schepen [[waarschuwt]] wel dat de cijfers [[vertekend]] kunnen zijn: op de gevaarlijkste " +
"kruispunten is nog niets [veranderd], en precies daar gebeurt bijna de [helft] van de " +
"[[ongevallen]]. Die kruispunten [[staan]] voor volgend jaar op de [planning].",
  gist:"Where the city built separated cycle paths over the past three years, accidents involving cyclists fell by almost a third, while cyclist numbers on those same roads rose sharply. The alderman warns the figures may be skewed: nothing has changed yet at the most dangerous junctions, where almost half of accidents happen. Those are scheduled for next year.",
  woorden:[["afgescheiden","separated"],["vrijgeven","to release (figures)"],["toenemen","to increase"],
           ["vertekend","skewed, distorted"],["het kruispunt","junction"],["de schepen","alderman (BE)"]],
  vragen:[
    {v:"Wat is er opvallend aan de daling?", sleutel:["meer fietsers","toenam","meer mensen","terwijl"],
     a:"Er zijn minder ongevallen terwijl er juist meer fietsers zijn."},
    {v:"Waarom kunnen de cijfers vertekend zijn?", sleutel:["kruispunt","gevaarlijk","niets veranderd"],
     a:"Op de gevaarlijkste kruispunten is nog niets veranderd."}
  ],
  schrijf:{op:"Beschrijf een daling in één zin met 'met bijna een derde'.",
           model:"Het aantal klachten daalde vorig jaar met bijna een derde."},
  focus:"'terwijl' kan tegenstelling betekenen, niet alleen gelijktijdigheid."
},
{
  id:"t25", niveau:"B2", thema:"werk", soort:"e-mail",
  titel:"Slecht nieuws netjes brengen",
  tekst:
"Dag Bram,\n\n" +
"Ik kom [[terug]] op je voorstel van vorige week. We hebben het intern [[besproken]] en " +
"komen tot de conclusie dat we er dit jaar [[niet mee doorgaan]].\n\n" +
"Dat heeft niets te maken met de [[kwaliteit]] van je uitwerking — die was [[degelijk]] " +
"en goed [onderbouwd]. Het [[knelpunt]] is de timing: het budget voor deze [post] is " +
"in januari al [[vastgelegd]], en herverdelen zou twee andere projecten [[stilleggen]].\n\n" +
"Ik zou het [[jammer]] vinden om het hierbij te laten. Zou je het voorstel willen " +
"[[bewaren]] voor de begrotingsronde van [oktober]? Dan sta ik [[mee]] achter de aanvraag.\n\n" +
"Groeten,\nSofie",
  gist:"An email declining a proposal: not because of its quality, which was solid and well argued, but because the budget for that line was fixed in January and reallocating would stall two other projects. She asks him to keep the proposal for October's budget round, when she'll back the request herself.",
  woorden:[["terugkomen op","to come back to"],["doorgaan met","to proceed with"],["degelijk","solid"],
           ["onderbouwen","to substantiate"],["het knelpunt","the sticking point"],["vastleggen","to fix, lock in"],
           ["stilleggen","to halt"],["de begrotingsronde","budget round"]],
  vragen:[
    {v:"Waarom gaat het voorstel niet door?", sleutel:["budget","timing","vastgelegd","geld"],
     a:"Het budget lag al vast in januari; herverdelen zou andere projecten stilleggen."},
    {v:"Wat stelt Sofie voor?", sleutel:["oktober","bewaren","opnieuw","begroting"],
     a:"Het voorstel bewaren voor de begrotingsronde van oktober."}
  ],
  schrijf:{op:"Wijs in één zin een voorstel af zonder de ander af te schrijven.",
           model:"Inhoudelijk zit het goed, maar dit jaar krijgen we het budgettair niet rond."},
  focus:"Zacht afwijzen: eerst wat wél klopt, dan het knelpunt, dan een opening."
},
{
  id:"t26", niveau:"B1", thema:"gezondheid", soort:"gesprek",
  titel:"In de apotheek",
  tekst:
"— Ik kom dit [[voorschrift]] afhalen.\n" +
"— Even kijken… Het [[merk]] dat de dokter opschreef, hebben we niet meer. " +
"Er is wel een [[gelijkwaardig]] middel met dezelfde [[werkzame stof]].\n" +
"— Werkt dat even goed?\n" +
"— Precies hetzelfde. Alleen de [verpakking] verschilt, en het is [[goedkoper]].\n" +
"— Prima. Moet ik [[iets]] in de gaten houden?\n" +
"— Neem het [[bij]] de maaltijd, anders kan het op je maag [[liggen]]. En [[stop]] niet " +
"vroeger, ook al [voel] je je na drie dagen beter.\n" +
"— En als ik een dag [[vergeet]]?\n" +
"— Gewoon [verder] doen, niet [[verdubbelen]].",
  gist:"At the pharmacy: the brand the doctor prescribed is no longer stocked, but there's an equivalent with the same active ingredient — identical effect, different packaging, cheaper. Take it with food or it may upset the stomach, don't stop early even if you feel better after three days, and if you miss a day just carry on without doubling up.",
  woorden:[["het voorschrift","prescription (BE)"],["gelijkwaardig","equivalent"],["de werkzame stof","active ingredient"],
           ["in de gaten houden","to keep an eye on"],["op je maag liggen","to sit heavily on the stomach"],
           ["verdubbelen","to double"]],
  vragen:[
    {v:"Waarom krijgt hij een ander middel?", sleutel:["merk","niet meer","voorraad","gelijkwaardig"],
     a:"Het voorgeschreven merk is er niet meer; dit is gelijkwaardig."},
    {v:"Wat moet je doen als je een dag vergeet?", sleutel:["verder","gewoon","niet verdubbel"],
     a:"Gewoon verder doen, niet verdubbelen."}
  ],
  schrijf:{op:"Vraag in één zin of een geneesmiddel met eten ingenomen moet worden.",
           model:"Moet ik dit bij de maaltijd innemen of maakt dat niet uit?"},
  focus:"'ook al' + gewone volgorde: 'ook al voel je je beter'. Vergelijk met 'hoewel je je beter voelt'."
},
{
  id:"t27", niveau:"B2", thema:"media", soort:"nieuwsbericht",
  titel:"Winkelketen sluit veertien filialen",
  tekst:
"De keten [[kondigde]] gisteren [[aan]] veertien van de zesentachtig winkels te sluiten. " +
"Ongeveer honderdtwintig medewerkers [[komen]] daardoor [[op straat te staan]], al belooft " +
"de directie dat een deel [[herplaatst]] wordt in [nabijgelegen] filialen.\n\n" +
"De vakbonden [[reageren]] scherp. Volgens hen was de kaart al [[getrokken]] voor het " +
"[[overleg]] begon, en zijn de [criteria] voor de selectie van de winkels nooit " +
"[[verduidelijkt]].\n\n" +
"De directie [[wijt]] de sluiting aan de gestegen huurprijzen en aan een [verschuiving] " +
"naar online. [Analisten] [[nuanceren]] dat: de keten [investeerde] jarenlang [[nauwelijks]] " +
"in haar winkels, [terwijl] concurrenten dat wel deden.",
  gist:"A retail chain is closing fourteen of its eighty-six shops, putting some 120 staff out of work, though management promises to redeploy some. Unions react sharply: the decision was taken before consultation began and the selection criteria were never clarified. Management blames rents and the shift online; analysts note the chain barely invested in its shops for years while competitors did.",
  woorden:[["aankondigen","to announce"],["op straat komen te staan","to lose one's job"],
           ["herplaatsen","to redeploy"],["het overleg","consultation"],["verduidelijken","to clarify"],
           ["wijten aan","to blame on"],["nuanceren","to qualify, nuance"],["nauwelijks","hardly"]],
  vragen:[
    {v:"Wat verwijten de vakbonden de directie?", sleutel:["op voorhand","al beslist","getrokken","criteria","overleg"],
     a:"Dat alles al beslist was voor het overleg, en dat de criteria nooit duidelijk waren."},
    {v:"Wat zeggen de analisten?", sleutel:["investeer","nauwelijks","niet geïnvesteerd","concurrent"],
     a:"Dat de keten jarenlang nauwelijks in haar winkels investeerde."}
  ],
  schrijf:{op:"Schrijf één zin met 'wijten aan'.",
           model:"De directie wijt de vertraging aan een tekort aan onderdelen."},
  focus:"'wijten aan' heeft een negatieve lading (schuld geven); 'danken aan' is de positieve tegenhanger."
},
{
  id:"t28", niveau:"B1", thema:"media", soort:"opinie",
  titel:"Over het weer praten is niet dom",
  tekst:
"Nieuwkomers [[verbazen]] zich er vaak over hoeveel Belgen over het weer praten. " +
"Het lijkt [[inhoudsloos]], en dat is het [[in zekere zin]] ook. Maar dat is precies de " +
"[[bedoeling]].\n\n" +
"Een gesprek over regen [[verplicht]] niemand tot een [[mening]]. Je kunt [[instemmen]] " +
"zonder iets [prijs] te geven, en je kunt [afhaken] zonder onbeleefd te zijn. " +
"Het is een [[opwarmertje]]: het [[test]] of de ander zin heeft in een gesprek.\n\n" +
"Wie de taal leert, [[onderschat]] dat soort zinnen. Toch zijn ze [[nuttiger]] dan " +
"een [ingewikkelde] zin over de politiek. Ze [[leveren]] je iets [[op]] wat je uit geen " +
"enkel boek haalt: de kans om de volgende zin te [zeggen].",
  gist:"A light column: newcomers are surprised how much Belgians talk about the weather. It seems contentless, and in a sense it is — but that's the point. Talking about rain forces no one into an opinion; you can agree without giving anything away and drop out without being rude. It's a warm-up that tests whether the other person feels like talking, and it earns you something no book gives: the chance to say the next sentence.",
  woorden:[["zich verbazen over","to be surprised at"],["inhoudsloos","without content"],
           ["in zekere zin","in a sense"],["instemmen","to agree"],["prijsgeven","to give away"],
           ["afhaken","to drop out"],["onderschatten","to underestimate"],["opleveren","to yield"]],
  vragen:[
    {v:"Waarom is praten over het weer nuttig?", sleutel:["mening","opwarm","test","veilig","gesprek"],
     a:"Het verplicht niemand tot een mening en test of de ander zin heeft in een gesprek."},
    {v:"Wat levert zo'n zin je op?", sleutel:["volgende zin","doorpraten","gesprek","kans"],
     a:"De kans om de volgende zin te zeggen."}
  ],
  schrijf:{op:"Schrijf één zin waarmee jij een gesprek zou beginnen aan een bushalte.",
           model:"Het valt goed mee vandaag, na al die regen van gisteren."},
  focus:"'zich verbazen over' — wederkerend én met een vast voorzetsel."
},
{
  id:"t29", niveau:"B2", thema:"geld", soort:"gesprek",
  titel:"Bij de bank over een lening",
  tekst:
"— U wilt lenen voor een [[verbouwing]]. Over welk bedrag [[gaat]] het?\n" +
"— Vijfendertigduizend, voor de isolatie en het [dak].\n" +
"— Dan komt u mogelijk in [[aanmerking]] voor een renovatiekrediet, dat is [[voordeliger]] " +
"dan een gewone lening. [[Voorwaarde]] is wel dat u de facturen [[voorlegt]].\n" +
"— En de [looptijd]?\n" +
"— Tien jaar is [[gebruikelijk]]. Bij vijftien jaar [[daalt]] uw maandlast, maar u betaalt " +
"in totaal [[aanzienlijk]] meer [rente].\n" +
"— Kan ik [[vervroegd]] terugbetalen?\n" +
"— Dat kan, tegen een [vergoeding] van drie maanden rente. Zal ik een simulatie " +
"[[opmaken]]? Dan ziet u beide [scenario's] naast elkaar.",
  gist:"At the bank about a €35,000 renovation loan for insulation and the roof. A renovation credit may apply — cheaper than an ordinary loan, provided invoices are submitted. Ten years is usual; fifteen lowers the monthly payment but costs considerably more interest overall. Early repayment is possible against three months' interest.",
  woorden:[["in aanmerking komen voor","to qualify for"],["voordelig","favourable, cheap"],
           ["de voorwaarde","condition"],["voorleggen","to submit"],["de looptijd","term, duration"],
           ["aanzienlijk","considerable"],["vervroegd","early, ahead of schedule"],["opmaken","to draw up"]],
  vragen:[
    {v:"Wat is de voorwaarde voor het renovatiekrediet?", sleutel:["factu","bewijs","voorleg"],
     a:"Dat hij de facturen voorlegt."},
    {v:"Wat is het nadeel van vijftien jaar?", sleutel:["rente","meer","duurder","totaal"],
     a:"Je betaalt in totaal aanzienlijk meer rente."}
  ],
  schrijf:{op:"Vraag in één zin naar de voorwaarden van iets.",
           model:"Onder welke voorwaarden kom ik voor die premie in aanmerking?"},
  focus:"'in aanmerking komen voor' — een vaste combinatie die je in elk formulier tegenkomt."
},
{
  id:"t30", niveau:"B2", thema:"werk", soort:"opinie",
  titel:"Wat je onthoudt is wat je terughaalt",
  tekst:
"De hardnekkigste [[misvatting]] over leren is dat herhaald lezen werkt. Het [[voelt]] " +
"goed: de tekst wordt [[vlotter]], je herkent alles, je [[concludeert]] dat je het kent. " +
"Precies daar zit de [[val]] — je meet je kennis aan de [[vlotheid]] van het herlezen, " +
"niet aan wat je zonder tekst nog kunt [[oproepen]].\n\n" +
"Wat wél werkt, voelt onaangenaam. Iets uit je hoofd [[terughalen]] terwijl het [moeite] " +
"kost, [[versterkt]] het spoor. Even [wachten] tot je het bijna vergeten bent, versterkt het " +
"[[nog meer]]. En door elkaar oefenen [[voelt]] rommeliger dan één ding tegelijk, maar " +
"[[levert]] meer [[op]].\n\n" +
"Kortom: wie zich comfortabel voelt tijdens het studeren, [[vergist]] zich waarschijnlijk.",
  gist:"The most persistent misconception about learning is that rereading works. It feels good — the text flows, you recognise everything, you conclude you know it — and that's the trap: you measure knowledge by fluency of rereading rather than by what you can recall without the text. What works feels unpleasant: retrieving with effort strengthens the trace, waiting until you've nearly forgotten strengthens it more, and mixing topics feels messier but yields more.",
  woorden:[["de misvatting","misconception"],["vlot","fluent, smooth"],["de val","the trap"],
           ["oproepen","to call up, recall"],["terughalen","to retrieve"],["versterken","to strengthen"],
           ["zich vergissen","to be mistaken"],["kortom","in short"]],
  vragen:[
    {v:"Waarom is herlezen misleidend?", sleutel:["vlot","herken","voelt","gemakkelijk","vlotheid"],
     a:"Je meet je kennis aan de vlotheid van het lezen, niet aan wat je kunt oproepen."},
    {v:"Wat versterkt het geheugenspoor het meest?", sleutel:["moeite","wachten","vergeten","terughalen"],
     a:"Terughalen met moeite, en wachten tot je het bijna vergeten bent."}
  ],
  schrijf:{op:"Schrijf in één zin wat jij na deze tekst anders gaat doen.",
           model:"Ik ga na elke tekst eerst opschrijven wat ik nog weet, voor ik hem opnieuw open."},
  focus:"Dit is het principe achter deze app: 'wat je onthoudt is wat je terughaalt'."
}
];
