# Terughalen · Nederlands B1 → B2

**Dubbelklik `index.html`.** Geen server, geen account, geen internet. Je bent
meteen bezig — er valt niets te kiezen en er is geen inhoudsopgave.

## Het idee

Een woordkaartje leert je weinig. Een woord dat je moet terughalen uit een zin
die ergens over gaat, blijft wel hangen.

Daarom is een **tekst** hier de eenheid, geen kaartje. Je leest hem één keer.
Tien minuten later komt hij terug met een paar woorden eruit. Morgen met meer.
Volgende week met alles eruit. Uiteindelijk bouw je hem terug op uit niets meer
dan de Engelse samenvatting.

**De tekst geneest terwijl je typt.** Er is geen knop en geen nakijken achteraf:
zodra je het juiste woord getypt hebt, springt het op zijn plaats en gaat de
cursor naar het volgende gat. Aan het eind staat de alinea weer heel op je
scherm.

## De lus

Eén cyclus draait om één tekst en herhaalt zich eindeloos:

```
lezen  of  gaten vullen   →   begrijpen  of  zelf schrijven   →   snelvuur
```

| ronde | wat je doet |
|---|---|
| **lezen** | de tekst één keer aandachtig; klik een woord dat je niet kent en de vertaling verschijnt |
| **gaten** | dezelfde tekst met woorden eruit — typen tot hij weer heel is |
| **begrepen?** | twee vragen over de inhoud, in je eigen woorden getypt |
| **zelf formuleren** | één zin schrijven, daarna een modelzin ter vergelijking |
| **snelvuur** | 45 seconden lang losse woorden en werkwoordsvormen, springt vanzelf door zodra je het goed hebt |

Woorden die je in de gatenronde níét wist, staan in het snelvuur dat er direct
op volgt. Wat je net niet kon, komt binnen de minuut terug.

### Slijtage

Elke tekst heeft vijf trappen. Elke ontmoeting is kaler dan de vorige:

| trap | wat je ziet | terug na |
|---|---|---|
| 0 | de hele tekst | 10 minuten |
| 1 | de helft van de kernwoorden weg | 1 dag |
| 2 | alle kernwoorden weg | 3 dagen |
| 3 | alles weg, alleen beginletters | 8 dagen |
| 4 | idem, met de Engelse samenvatting als houvast | 21 dagen |

### Toetsen

| | |
|---|---|
| typen | het gat sluit vanzelf zodra het klopt |
| `Tab` | één letter erbij (telt als hulp) |
| `Enter` in een gat | geef het antwoord weg |
| `Enter` elders | verder |
| `Esc` | pauze: cijfers, teksten, instellingen |

## Waarom het zo onprettig is

Uit *Make It Stick*, en het is opzet:

- **Terughalen, niet herlezen.** Herlezen voelt vlot en levert weinig op. De
  tekst verdwijnt daarom altijd voor je hem moet reproduceren.
- **Moeite is het punt.** Een woord dat je met inspanning terughaalt, zit daarna
  vaster. Vandaar `Tab` in plaats van meteen het antwoord.
- **Spreiden.** De tussenpozen lopen op tot je het bijna vergeten bent. Precies
  dán is terughalen het meest waard.
- **Mengen.** Snelvuur haalt oude woorden en werkwoordsvormen door elkaar; dat
  voelt rommeliger dan één ding tegelijk en werkt beter.
- **Zelf formuleren.** Een zin bouwen en pas daarna een model zien, hecht beter
  dan het model lezen.

## Wat erin zit

- **30 teksten**, B1 en B2, ± 2.900 woorden Nederlands: e-mails, brieven,
  nieuwsberichten, gesprekken en opiniestukken. Vlaamse context.
- **219 doelwoorden** met vertaling, **60 begripsvragen**, 30 schrijfopdrachten.
- **1.423 woorden** in het snelvuur, met voorbeeldzinnen.
- **177 werkwoorden** (ovt en voltooid deelwoord) en **117 vaste
  voorzetselcombinaties**, met de hand nagekeken en machinaal getoetst aan
  't kofschip.

## Onderhoud

```
nederlands/terughalen/
  index.html
  app/  geheugen.js (planning) · tekst.js (gaten) · app.js (de lus) · stijl.css
  data/ teksten.js    30 teksten                        ← met de hand
        vormen.js     werkwoorden en voorzetsels        ← met de hand
        woordbank.js  woordenlijst                      ← GEGENEREERD
  build/bouw-woorden.py
```

`woordbank.js` komt uit `../studeerkamer/seeds/*.json` (die blijven
onaangeroerd). Werk je die bij, draai dan:

```bash
cd nederlands/terughalen && python3 build/bouw-woorden.py
```

### Zelf een tekst toevoegen

Achteraan in `data/teksten.js`. In het tekstveld markeer je de gaten:

```js
{
  id:"t31", niveau:"B2", thema:"werk", soort:"e-mail",
  titel:"...",
  tekst:"Zoals [[afgesproken]] stuur ik je de [cijfers].",
  //      [[woord]] = kernwoord, gaat er als eerste uit
  //      [woord]   = tweede orde, pas bij hogere slijtage
  gist:"English one-paragraph summary — dit is je houvast op trap 4.",
  woorden:[["afgesproken","agreed"]],
  vragen:[{ v:"...?", sleutel:["kernwoord","synoniem"], a:"modelantwoord" }],
  schrijf:{ op:"...", model:"..." },
  focus:"één grammaticale opmerking"
}
```

Begripsvragen worden mild nagekeken: je antwoord is goed zodra er één sleutel in
voorkomt. Dat is met opzet — het gaat om lezen, niet om formuleren.

Je voortgang staat in `localStorage` van deze browser. Exporteer af en toe via
`Esc → exporteer` als je op een andere machine verder wil.
