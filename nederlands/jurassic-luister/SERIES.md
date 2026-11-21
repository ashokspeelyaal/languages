# Jurassic Luisteren: Nederlands B2 en C1 luisteren met Jurassic Park / Jurassic World

Privé luistervideo's voor één leerder (iCloud, nooit publiek). Pure luister- en observatietraining: GEEN grammatica-uitleg, geen bordjes, geen oefeningen. Nederlandse ondertitels met karaoke-highlight en vocabulaire-kaartjes (Nederlandse uitleg + Engels) voor geavanceerde woorden, uitdrukkingen en collocaties. Engelse ondertitels zijn er niet; de kaartjes dragen het Engels.

## De leerder
Ashok: uit Kulithalai (Tamil Nadu, India, aan de Kaveri), woont in Genk (Belgisch Limburg), IT-ingenieur en fan van de zes films. Nu B1+/B2-, doel B2+ en op termijn C1 luisteren. Kijkt in de sportzaal op een iPhone: de audio moet het verhaal dragen, tekst groot en leesbaar.

## Twee sets van zes (zelfde thema, zelfde films)
| | B2-set | C1-set |
|---|---|---|
| Doel | B2 naar B2+ | B2+ naar C1 |
| Tempo | natuurlijk (Azure rate 0%) | natuurlijk tot vlot (rate +6%) |
| Beurten | max ~4 zinnen | langere beurten (5-8 zinnen), impliciete betekenis, ironie |
| Kaartjes | 1-2 per zin, ~300 per 25 min | minder, moeilijker: C1-C2 woorden, nuanceparen, idioom, registerverschil (formeel/informeel), ~100-150 per 25 min |
| Verhaal | volgt de film scène voor scène, Ashok doet mee | zelfde film, ander perspectief: panel, hoorzitting, debat, onderzoekscommissie of parallel verhaal |
| Lengte | ~25 min (3.600-3.700 woorden; B2-afleveringen 2-4 met ~3.200 woorden werden maar 20-23 min) | ~25 min (4.500-4.800 woorden; Azure spreekt ~180-193 woorden/min bij +6%) |
| iCloud | `DutchVideos/B2/NN-<film-slug>.mp4` | `DutchVideos/C1/NN-<film-slug>.mp4` |
| Map | `episodes/b2-epNN-<slug>/` | `episodes/c1-epNN-<slug>/` |

Het niveau staat in `script.txt` (`@meta level=B2` of `C1`) en stuurt tempo, pauze tussen beurten, kaartduur en uitvoermap (engine/levels.py).

## Regels (van de gebruiker)
- Alle dialoog is origineel Nederlands. Nooit filmcitaten, vertaalde filmzinnen of beroemde slogans. Scènes volgen de film wel nauw: dezelfde situaties in dezelfde volgorde, herkenbare sleutelmomenten, maar met eigen zinnen.
- Geen filmstills, logo's, posters of muziek. Alleen echte Wikimedia Commons-foto's (skeletten, fossielen, jungle, Kauai, Costa Rica, labs, barnsteen, storm, helikopters...). Elke foto moet passen bij wat er gezegd wordt; museumskeletten en illustraties benoemen als foto ("op deze foto").
- Disclaimerkaart van ~4 s bij de start (na de titelkaart) en aan het einde vóór de foto-credits. Tekst (vast): « Privé leermateriaal. Gebaseerd op de Jurassic Park/Jurassic World-films (Universal Pictures, Amblin Entertainment). Personages en verhaal © hun rechthebbenden. Niet voor verspreiding. »
- Feiten over de plot controleren (Wikipedia), `research.md` per aflevering, niets verzinnen.
- Geen grafisch geweld; spanning en humor.

## Personages (eigen getekende bustes uit `engine/characters.py`, geen acteursgezichten)
| Sleutel | Persoonlijkheid in ons verhaal | Typisch taalgebruik |
|---|---|---|
| ashok | nieuwsgierig, bescheiden, praktisch IT-ingenieur, vergelijkt graag België en India, droge humor, vader zegt wijze dingen over de rivier | spreekt Vlaams-vriendelijk standaardnederlands, soms een IT-beeld (code, systeem, bug) |
| hammond | warme, enthousiaste gastheer, trots, koppig optimistisch, weigert risico te zien tot het te laat is, later nederiger | beleefd, "vrienden", grote woorden |
| alan | brommerig, houdt van fossielen, wantrouwt computers en commercie, zachter naarmate de film vordert | kort, nuchter, droog |
| ellie | warm, praktisch, plantenkundige, ziet gevaren vroeg, humor | helder, vragend, gelijkwaardig |
| malcolm | ironisch, chaostheorie, uitweidingen, speelt graag advocaat van de duivel | lange zinnen, stellingen, sarcasme |
| owen | kalm, ervaren dierentrainer, spreekt weinig maar raak, respecteert dieren | korte zinnen, praktisch |
| claire | georganiseerd, zakelijk, leert bij, zorgt voor de mensen en later voor de dieren | formeel naar informeel |

## Stemtabel (getest op 2026-11-21; alle stemmen leveren viseme- en woordgrens-events voor Nederlandse tekst)
| Personage | Stem | Opmerking |
|---|---|---|
| Ashok | nl-BE-ArnaudNeural | vast: woont in Vlaanderen |
| Claire | nl-BE-DenaNeural | Vlaamse vrouw; past bij een zakelijke Claire |
| Ellie | nl-NL-FennaNeural | helder, vrouwelijk |
| Owen | nl-NL-MaartenNeural | kalme mannenstem, native Nederlands |
| Alan | en-US-AndrewMultilingualNeural | via `<lang xml:lang="nl-NL">`, licht Amerikaans accent past |
| Malcolm | en-US-BrianMultilingualNeural | idem |
| Hammond | en-GB-OllieMultilingualNeural | Brits accent, warme oudere gastheer |
Getest en gereserveerd: nl-NL-ColetteNeural (extra vrouw), en-AU-WilliamMultilingualNeural, de-DE-FlorianMultilingualNeural (extra mannenstem). Alle stemmen geven 92 visemes op dezelfde testzin, dus lipbeweging werkt overal. Het accent van multilinguale stemmen is niet door de agent beluisterd; de gebruiker moet bevestigen of het goed klinkt. Vaste uitspraakaliassen per aflevering via `@alias` (alleen losse woorden).

## Ashok zit IN de film
Elke aflevering beleeft Ashok het verhaal samen met de personages, in het heden. Reflectie en thema-gesprekken horen daarbij (in de jeep, tijdens de lunch, 's nachts in een boom, in de helikopter).

## Zesdelig plan

### 1. Jurassic Park (1993). GEMAAKT als pilot (B2)
- **Cast:** Hammond, Alan, Ellie, Malcolm, Ashok.
- **B2 (gemaakt):** Ashok is de IT-ingenieur die Hammond uitnodigt om de beveiliging te controleren. Aankomst per helikopter, eerste Brachiosaurus, barnsteen en DNA, kwekerij en raptors, lunchdebat (ethiek, chaostheorie), tour en zieke Triceratops, storm, stroomuitval en T. rex aan het hek, nacht in een boom, sabotage in de controlekamer, raptors in de keuken, helikopter. Thema's: genetische manipulatie, chaostheorie, hebzucht, verantwoordelijkheid, voedselzekerheid. Woordvelden: onderzoek en ethiek, beveiliging/IT, storm en vlucht.
- **C1-hoek:** een publieke hoorzitting enkele maanden later (onderzoekscommissie over het park): Ashok getuigt als technisch deskundige, Alan en Ellie als getuigen-deskundigen, Malcolm als sceptische adviseur, Hammond verdedigt zich. Thema's: aansprakelijkheid, de ethiek van de-extinctie, wetenschap versus commerciële druk, verantwoordelijkheid van de programmeur. Woordvelden: juridisch en bestuurlijk (aansprakelijkheid, toezicht, naar eer en geweten, zich verschuilen achter), nuanceparen (aansprakelijk/verantwoordelijk, risico/gevaar).

### 2. The Lost World: Jurassic Park (1997)
- **Cast:** Malcolm, Hammond, Ashok (Ellie als korte cameo in een telefoongesprek, optioneel).
- **B2:** op Isla Sorna ("Site B") wordt een expeditie gestuurd; een rivaliserend bedrijfsteam vangt dieren, en een T. rex komt in een stad terecht. Ashok is de communicatie-/trackingingenieur in de mobiele basis. Thema's: natuurbehoud versus uitbuiting, jacht, dierenhandel, dierenrechten, bedrijfsrivaliteit. Woordvelden: expeditie en uitrusting, behoud, jagen en vangen.
- **C1-hoek:** een mediadebat/talkshow en een bestuurlijke hoorzitting over de gebeurtenissen in de stad; Ashok getuigt over de tracking-data. Thema's: media en framing, bedrijfsverantwoordelijkheid, soevereiniteit (wie heeft gezag over het eiland), voorzorgsprincipe.

### 3. Jurassic Park III (2001)
- **Cast:** Alan, Ellie (telefoon/cameo), Ashok.
- **B2:** Alan wordt misleid om als gids mee te gaan naar Isla Sorna; zoektocht naar een vermist kind, Spinosaurus, volière met pterosauriërs, raptoreieren. Ashok is de gps-/satelliettelefoon-ingenieur. Thema's: misleiding, redding, intelligentie van roofdieren, communicatie, overleven. Woordvelden: navigatie, overleven, misleiden.
- **C1-hoek:** een gesprek of paneldiscussie achteraf over misleiding en toestemming ("informed consent"), rouw en verantwoordelijkheid; Ashok vertelt de gps-logs.

### 4. Jurassic World (2015)
- **Cast:** Owen, Claire, Ashok.
- **B2:** het werkende park, de genetisch ontworpen hybride Indominus rex, commerciële druk en sponsors, raptortraining. Ashok werkt als IT-ingenieur in de controlekamer (parallel met aflevering 1, maar nu een echt park). Thema's: hybriden en ontwerp, entertainment en commercie, dierentraining, beveiliging. Woordvelden: marketing, sponsoring, trainen, hybride.
- **C1-hoek:** een onderzoekscommissie over "spektakel versus veiligheid": aandachtseconomie, sponsoring, militair gebruik van dieren (geloofwaardig als thema), toestemming van dieren; Ashok getuigt.

### 5. Fallen Kingdom (2018)
- **Cast:** Owen, Claire, Malcolm, Ashok.
- **B2:** vulkaanuitbarsting op Isla Nublar, een reddingsmissie, een veiling op een landgoed, de Indoraptor, de beslissing om dieren los te laten. Ashok zit in het team van Claire's dierenbeschermingsgroep als IT-specialist. Thema's: moeten we ze redden, uitsterven versus de-extinctie, dierenrechten, veiling en wapenhandel. Woordvelden: natuurrampen, redden, veilingen.
- **C1-hoek:** een parlementaire hoorzitting over de-extinctie (Malcolm als getuige, Ashok als deskundige); thema's: ethiek van ingrijpen, speciesisme, bestuurlijke afweging, "wie beslist".

### 6. Dominion (2022)
- **Cast:** Owen, Claire, Alan, Ellie, Malcolm, Ashok (zes personen: beperk tot vier per scène).
- **B2:** dinosaurussen leven nu wereldwijd; sprinkhanen (locusts) bedreigen gewassen; het bedrijf Biosyn; zwarte markt in Malta; Alan en Ellie komen terug. Ashok is landbouw- en data-analist uit Tamil Nadu en volgt de oogstmislukkingen. Thema's: voedselzekerheid, monopolie op zaden, biotechnologie, handel in dieren. Woordvelden: landbouw, oogst, monopolie, handelsroutes.
- **C1-hoek:** een topconferentie over biotechnologie en voedselzekerheid met een keynote van Ashok vanuit Indisch perspectief; thema's: zadenmonopolie, intellectueel eigendom, "dual use", bestuur van biotech.

(De details per film moeten bij elke aflevering opnieuw op Wikipedia gecontroleerd worden; dit plan is een leidraad op hoofdlijnen.)

## Continuïteit
- Ashok kent Hammond, Alan, Ellie en Malcolm sinds aflevering 1 (Isla Nublar). Zijn vader zegt dat je een rivier niet kunt dwingen, alleen begeleiden; zijn familie woont langs de Kaveri.
- Ashok vergelijkt vaak met België (strenge regels voor genetisch gewijzigde gewassen) en India (honger, voedselzekerheid).
- Maximaal 5 bustes tegelijk in beeld.

## Bestanden
`engine/` (gedeelde code, zie ENGINE.md), `episodes/b2-epNN-slug/` en `episodes/c1-epNN-slug/`. Pas NOOIT iets aan in `francais/jurassic-serie/` (andere agents gebruiken dat).
