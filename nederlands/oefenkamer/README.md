# Oefenkamer · Nederlands A1 → B2

Eén map, geen server. **Dubbelklik `index.html`** en je bent bezig — ook zonder
internet, ook op een USB-stick, ook over vijf jaar nog.

Bedoeld voor het geval dat je kent: je zit tussen B1 en B2, maar na een paar
weken zonder oefening zakken de rijtjes weg. Dit is geen cursus die je doorleest;
het is een ophaalmachine.

## Wat erin zit

| | |
|---|---|
| 38 grammaticahoofdstukken | A1 → B2 plus drie bijlages, met uitleg, vuistregels, valkuilen en een begripskaart |
| 472 oefeningen in context | meerkeuze, invullen, zin bouwen, fout zoeken, omzetten, goed/fout |
| ~1.260 rijtjes-drills | vervoegingen, de/het, meervouden, verkleinwoorden, vaste voorzetsels — automatisch uit `data/lexicon.js` |
| 1.476 woorden | met voorbeeldzinnen, elk in drie ophaalvormen (herkennen · produceren · invullen) |
| Kaarten | stralenkaart van de hele grammatica en bellenkaart van de woordthema's (d3), gekleurd naar hoe stevig iets zit |

Samen ruim 5.500 items die individueel worden ingepland.

## De methode

Zes principes uit *Make It Stick*, en ze zitten in de mechaniek, niet in een
tekstje op het startscherm:

1. **Ophalen, niet herlezen** — elk hoofdstuk begint met vragen; de volledige
   uitleg staat ingeklapt eronder.
2. **Eerst proberen** — je antwoordt altijd vóór je iets ziet. Een mislukte
   poging maakt de uitleg erna beter plakken.
3. **Spreiden** — SM-2-planning: 1 dag, 3 dagen, dan steeds langer. Fout? Het
   item komt in dezelfde zitting terug (successive relearning) en het interval
   begint opnieuw.
4. **Mengen** — sessies springen bewust tussen hoofdstukken én tussen grammatica
   en woorden. Nooit twee vragen op rij uit hetzelfde hoofdstuk als het te
   vermijden is.
5. **Kalibreren** — je geeft aan hoe zeker je was (standaard bij één op drie
   vragen). Bij *Voortgang* zie je of dat gevoel klopte. "Zeker" plus fout is het
   nuttigste signaal in de app.
6. **Uitleggen** — om de zeven vragen vraagt de app je de regel in je eigen
   woorden te formuleren. Dat wordt bewaard bij het hoofdstuk.

Woorden worden bovendien getrapt vrijgespeeld: eerst herkennen (NL→EN), daarna
produceren (EN→NL), daarna invullen in een voorbeeldzin.

## Gebruik

- **Vandaag** — wat er openstaat, plus je reeks en een heatmap van twaalf weken.
- **Grammatica** — 38 hoofdstukken; open er één en begin bovenaan met *Wat weet
  je nog?* (vrije reproductie) vóór je iets leest.
- **Woorden** — thema's, zoekvenster, sessies.
- **Kaart** — klik een knoop om er meteen in te duiken. Scrollen zoomt.
- **Voortgang** — kalibratie, hardnekkige items, instellingen, export/import.

Sneltoetsen: `1`–`4` kiezen een antwoord, `Enter` kijkt na en gaat door, `Esc`
breekt de sessie af.

Alles staat in `localStorage` van deze browser. Er is geen account en er gaat
niets het net op. Exporteer af en toe via *Voortgang → Exporteer voortgang* als
je op een andere machine verder wil.

## Onderhoud

```
nederlands/oefenkamer/
  index.html          alles begint hier
  app/                store (planning) · grade (nakijken) · generators · engine · mindmap · ui · styles
  data/
    topics.js         38 hoofdstukken: kern, tips, valkuilen, kaart      ← met de hand
    items-a1..b2.js   472 oefeningen in context                          ← met de hand
    lexicon.js        werkwoorden, voorzetsels, de/het, meervouden       ← met de hand
    reference.js      uitlegteksten                                      ← GEGENEREERD
    vocab.js          woordenlijst                                       ← GEGENEREERD
  vendor/d3.v7.min.js lokale kopie, geen CDN
  build/build-data.py regenereert de twee GEGENEREERDE bestanden
```

Bronnen voor de gegenereerde bestanden (die blijven onaangeroerd):
`../studiemateriaal/grammatica-overzicht.html` en `../studeerkamer/seeds/*.json`.
Werk je die bij, draai dan:

```bash
cd nederlands/oefenkamer && python3 build/build-data.py
```

Nieuwe oefeningen toevoegen gaat rechtstreeks in `data/items-*.js`. Het patroon:

```js
{ t:"cloze", q:"Ik ___ gisteren de hele dag. (werken)", a:"werkte",
  acc:["heb gewerkt"], w:"Zwak: stam + -te ('t kofschip)." }
```

`t` is `mc` · `cloze` · `order` · `fout` · `omzet` · `jn`. Verder: `inst`
(opdracht), `o` (keuzes of blokjes), `acc` (ook goed), `multi` (twee gaten),
`w` (waarom), `h` (hint). Id's worden automatisch afgeleid van het hoofdstuk,
dus voeg toe aan het einde van een lijst — dan blijft je voortgang kloppen.

Nieuwe werkwoorden of voorzetsels toevoegen aan `data/lexicon.js` levert
meteen nieuwe drills op; daar hoeft verder niets voor te gebeuren.
