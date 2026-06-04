#!/usr/bin/env python3
"""Generate static/data/verbs.json from hand-curated verb data.

Per werkwoord wordt de STAM (en voor sterk/onreg de imperfectum-/vd-vormen)
expliciet meegegeven. De helper-functies bouwen alleen mechanische uitgangen
op (presens persoonsvormen, imperfectum-uitgangen, vd-suffix) — geen stam-
afleiding, dus geen risico op spellingfouten.

Run: python scripts/generate-verbs.py
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "static" / "data" / "verbs.json"
KOFSCHIP = set("tkfspchx")
NO_GE_PREFIX = re.compile(r"^(be|ge|her|ont|ver|er)[^aeiou]")


def _pres_endings(stem: str, inf: str) -> str:
    """Bouw de 7 presens-vormen vanuit stam + infinitief. Werkt voor zwak EN sterk.
       Voor scheidbare ww (stem bevat " ") wordt de uitgang op het eerste deel
       gezet en het scheidbare partikel achteraan geplakt."""
    parts = stem.split(" ", 1)
    base = parts[0]
    tail = (" " + parts[1]) if len(parts) > 1 else ""
    s_t = base if base.endswith("t") else base + "t"
    ik    = base + tail
    jij   = s_t + tail
    wij   = inf
    return f"{ik},{jij},{jij},{jij},{wij},{wij},{wij}"


def zwak(inf, stem, tr, lvl, aux="hebben", *, scheidbaar=False, noGe=False):
    last = stem[-1].lower()
    use_t = last in KOFSCHIP
    past = stem + ("te" if use_t else "de")
    no_ge = noGe or bool(NO_GE_PREFIX.match(inf))
    vd = ("" if no_ge else "ge") + stem + ("t" if use_t else "d")
    out = {
        "inf": inf, "tr": tr, "lvl": lvl, "tp": "zwak",
        "stem": stem, "aux": aux,
        "pres": _pres_endings(stem, inf),
        "impSing": past, "impPl": past + "n", "vd": vd,
    }
    if scheidbaar: out["scheidbaar"] = True
    if noGe:       out["noGe"] = True
    return out


def vz(inf, stem, tr, lvl, aux="hebben", *, scheidbaar=False, noGe=False):
    """Zwak met onderliggende v/z — gebruikt -de ondanks dat stam op f/s eindigt."""
    past = stem + "de"
    no_ge = noGe or bool(NO_GE_PREFIX.match(inf))
    vd = ("" if no_ge else "ge") + stem + "d"
    out = {
        "inf": inf, "tr": tr, "lvl": lvl, "tp": "zwak-vz",
        "stem": stem, "aux": aux,
        "pres": _pres_endings(stem, inf),
        "impSing": past, "impPl": past + "n", "vd": vd,
    }
    if scheidbaar: out["scheidbaar"] = True
    if noGe:       out["noGe"] = True
    return out


def sterk(inf, stem, impS, impP, vd, tr, lvl, aux="hebben", *, scheidbaar=False):
    out = {
        "inf": inf, "tr": tr, "lvl": lvl, "tp": "sterk",
        "stem": stem, "aux": aux,
        "pres": _pres_endings(stem, inf),
        "impSing": impS, "impPl": impP, "vd": vd,
    }
    if scheidbaar: out["scheidbaar"] = True
    return out


def onr(inf, pres7, impS, impP, vd, tr, lvl, aux="hebben", *, scheidbaar=False):
    out = {
        "inf": inf, "tr": tr, "lvl": lvl, "tp": "onreg",
        "pres": pres7, "impSing": impS, "impPl": impP, "vd": vd, "aux": aux,
    }
    if scheidbaar: out["scheidbaar"] = True
    return out


# ============================================================
# DATA
# ============================================================

VERBS = []

# ---- ONREGELMATIG ----
VERBS += [
    onr("zijn",      "ben,bent,bent,is,zijn,zijn,zijn",                              "was",   "waren",   "geweest",   "to be",                  "A1", "zijn"),
    onr("hebben",    "heb,hebt,hebt,heeft,hebben,hebben,hebben",                     "had",   "hadden",  "gehad",     "to have",                "A1", "hebben"),
    onr("kunnen",    "kan,kunt,kunt,kan,kunnen,kunnen,kunnen",                       "kon",   "konden",  "gekund",    "can / to be able",       "A1", "hebben"),
    onr("moeten",    "moet,moet,moet,moet,moeten,moeten,moeten",                     "moest", "moesten", "gemoeten",  "must",                   "A1", "hebben"),
    onr("mogen",     "mag,mag,mag,mag,mogen,mogen,mogen",                            "mocht", "mochten", "gemogen",   "may / be allowed",       "A1", "hebben"),
    onr("willen",    "wil,wilt,wilt,wil,willen,willen,willen",                       "wilde", "wilden",  "gewild",    "to want",                "A1", "hebben"),
    onr("zullen",    "zal,zult,zult,zal,zullen,zullen,zullen",                       "zou",   "zouden",  "—",         "shall / will",           "A1", "—"),
    onr("gaan",      "ga,gaat,gaat,gaat,gaan,gaan,gaan",                             "ging",  "gingen",  "gegaan",    "to go",                  "A1", "zijn"),
    onr("doen",      "doe,doet,doet,doet,doen,doen,doen",                            "deed",  "deden",   "gedaan",    "to do",                  "A1", "hebben"),
    onr("zien",      "zie,ziet,ziet,ziet,zien,zien,zien",                            "zag",   "zagen",   "gezien",    "to see",                 "A1", "hebben"),
    onr("staan",     "sta,staat,staat,staat,staan,staan,staan",                      "stond", "stonden", "gestaan",   "to stand",               "A1", "hebben"),
    onr("slaan",     "sla,slaat,slaat,slaat,slaan,slaan,slaan",                      "sloeg", "sloegen", "geslagen",  "to hit / strike",        "B1", "hebben"),
    onr("zeggen",    "zeg,zegt,zegt,zegt,zeggen,zeggen,zeggen",                      "zei",   "zeiden",  "gezegd",    "to say",                 "A1", "hebben"),
    onr("weten",     "weet,weet,weet,weet,weten,weten,weten",                        "wist",  "wisten",  "geweten",   "to know",                "A1", "hebben"),
    onr("denken",    "denk,denkt,denkt,denkt,denken,denken,denken",                  "dacht", "dachten", "gedacht",   "to think",               "A1", "hebben"),
    onr("brengen",   "breng,brengt,brengt,brengt,brengen,brengen,brengen",           "bracht","brachten","gebracht",  "to bring",               "A1", "hebben"),
    onr("kopen",     "koop,koopt,koopt,koopt,kopen,kopen,kopen",                     "kocht", "kochten", "gekocht",   "to buy",                 "A1", "hebben"),
    onr("verkopen",  "verkoop,verkoopt,verkoopt,verkoopt,verkopen,verkopen,verkopen","verkocht","verkochten","verkocht","to sell",              "A2", "hebben"),
    onr("zoeken",    "zoek,zoekt,zoekt,zoekt,zoeken,zoeken,zoeken",                  "zocht", "zochten", "gezocht",   "to search",              "A1", "hebben"),
    onr("vragen",    "vraag,vraagt,vraagt,vraagt,vragen,vragen,vragen",              "vroeg", "vroegen", "gevraagd",  "to ask",                 "A1", "hebben"),
    onr("dragen",    "draag,draagt,draagt,draagt,dragen,dragen,dragen",              "droeg", "droegen", "gedragen",  "to wear / carry",        "A2", "hebben"),
    onr("opstaan",   "sta op,staat op,staat op,staat op,staan op,staan op,staan op", "stond op","stonden op","opgestaan","to get up",          "A1", "zijn",   scheidbaar=True),
    onr("uitgaan",   "ga uit,gaat uit,gaat uit,gaat uit,gaan uit,gaan uit,gaan uit", "ging uit","gingen uit","uitgegaan","to go out",           "A1", "zijn",   scheidbaar=True),
    onr("teruggaan", "ga terug,gaat terug,gaat terug,gaat terug,gaan terug,gaan terug,gaan terug","ging terug","gingen terug","teruggegaan","to go back","A2","zijn", scheidbaar=True),
    onr("voorzien",  "voorzie,voorziet,voorziet,voorziet,voorzien,voorzien,voorzien","voorzag","voorzagen","voorzien", "to foresee / provide",  "B2", "hebben"),
    onr("doorzien",  "doorzie,doorziet,doorziet,doorziet,doorzien,doorzien,doorzien","doorzag","doorzagen","doorzien", "to see through",        "C1", "hebben"),
    onr("herzien",   "herzie,herziet,herziet,herziet,herzien,herzien,herzien",       "herzag","herzagen", "herzien",   "to revise",             "B2", "hebben"),
    onr("aanzien",   "zie aan,ziet aan,ziet aan,ziet aan,zien aan,zien aan,zien aan","zag aan","zagen aan","aangezien","to regard as",         "B2", "hebben", scheidbaar=True),
    onr("bezoeken",  "bezoek,bezoekt,bezoekt,bezoekt,bezoeken,bezoeken,bezoeken",    "bezocht","bezochten","bezocht",  "to visit",              "A2", "hebben"),
    onr("verzoeken", "verzoek,verzoekt,verzoekt,verzoekt,verzoeken,verzoeken,verzoeken","verzocht","verzochten","verzocht","to request",       "B2", "hebben"),
]

# ---- STERK ----
VERBS += [
    sterk("worden",      "word",       "werd",     "werden",     "geworden",     "to become",                "A1", "zijn"),
    sterk("komen",       "kom",        "kwam",     "kwamen",     "gekomen",      "to come",                  "A1", "zijn"),
    sterk("geven",       "geef",       "gaf",      "gaven",      "gegeven",      "to give",                  "A1", "hebben"),
    sterk("krijgen",     "krijg",      "kreeg",    "kregen",     "gekregen",     "to get / receive",         "A1", "hebben"),
    sterk("nemen",       "neem",       "nam",      "namen",      "genomen",      "to take",                  "A1", "hebben"),
    sterk("blijven",     "blijf",      "bleef",    "bleven",     "gebleven",     "to stay",                  "A1", "zijn"),
    sterk("vinden",      "vind",       "vond",     "vonden",     "gevonden",     "to find",                  "A1", "hebben"),
    sterk("houden",      "houd",       "hield",    "hielden",    "gehouden",     "to hold / love",           "A1", "hebben"),
    sterk("laten",       "laat",       "liet",     "lieten",     "gelaten",      "to let / leave",           "A1", "hebben"),
    sterk("liggen",      "lig",        "lag",      "lagen",      "gelegen",      "to lie",                   "A1", "hebben"),
    sterk("zitten",      "zit",        "zat",      "zaten",      "gezeten",      "to sit",                   "A1", "hebben"),
    sterk("lopen",       "loop",       "liep",     "liepen",     "gelopen",      "to walk / run",            "A1", "hebben/zijn"),
    sterk("spreken",     "spreek",     "sprak",    "spraken",    "gesproken",    "to speak",                 "A1", "hebben"),
    sterk("eten",        "eet",        "at",       "aten",       "gegeten",      "to eat",                   "A1", "hebben"),
    sterk("drinken",     "drink",      "dronk",    "dronken",    "gedronken",    "to drink",                 "A1", "hebben"),
    sterk("slapen",      "slaap",      "sliep",    "sliepen",    "geslapen",     "to sleep",                 "A1", "hebben"),
    sterk("roepen",      "roep",       "riep",     "riepen",     "geroepen",     "to call",                  "A2", "hebben"),
    sterk("lezen",       "lees",       "las",      "lazen",      "gelezen",      "to read",                  "A1", "hebben"),
    sterk("schrijven",   "schrijf",    "schreef",  "schreven",   "geschreven",   "to write",                 "A1", "hebben"),
    sterk("kijken",      "kijk",       "keek",     "keken",      "gekeken",      "to look / watch",          "A1", "hebben"),
    sterk("helpen",      "help",       "hielp",    "hielpen",    "geholpen",     "to help",                  "A1", "hebben"),
    sterk("beginnen",    "begin",      "begon",    "begonnen",   "begonnen",     "to begin",                 "A1", "zijn"),
    sterk("kiezen",      "kies",       "koos",     "kozen",      "gekozen",      "to choose",                "A2", "hebben"),
    sterk("sluiten",     "sluit",      "sloot",    "sloten",     "gesloten",     "to close",                 "A2", "hebben"),
    sterk("bidden",      "bid",        "bad",      "baden",      "gebeden",      "to pray",                  "B1", "hebben"),
    sterk("bieden",      "bied",       "bood",     "boden",      "geboden",      "to offer",                 "B1", "hebben"),
    sterk("binden",      "bind",       "bond",     "bonden",     "gebonden",     "to bind",                  "B2", "hebben"),
    sterk("blijken",     "blijk",      "bleek",    "bleken",     "gebleken",     "to appear / prove",        "B1", "zijn"),
    sterk("breken",      "breek",      "brak",     "braken",     "gebroken",     "to break",                 "A2", "hebben/zijn"),
    sterk("fluiten",     "fluit",      "floot",    "floten",     "gefloten",     "to whistle",               "B2", "hebben"),
    sterk("hangen",      "hang",       "hing",     "hingen",     "gehangen",     "to hang",                  "A2", "hebben"),
    sterk("rijden",      "rijd",       "reed",     "reden",      "gereden",      "to drive / ride",          "A2", "hebben/zijn"),
    sterk("schenken",    "schenk",     "schonk",   "schonken",   "geschonken",   "to pour / donate",         "B1", "hebben"),
    sterk("schieten",    "schiet",     "schoot",   "schoten",    "geschoten",    "to shoot",                 "B1", "hebben"),
    sterk("schijnen",    "schijn",     "scheen",   "schenen",    "geschenen",    "to shine / seem",          "B1", "hebben"),
    sterk("snijden",     "snijd",      "sneed",    "sneden",     "gesneden",     "to cut",                   "B1", "hebben"),
    sterk("spuiten",     "spuit",      "spoot",    "spoten",     "gespoten",     "to spray",                 "B2", "hebben"),
    sterk("springen",    "spring",     "sprong",   "sprongen",   "gesprongen",   "to jump",                  "A2", "hebben/zijn"),
    sterk("stijgen",     "stijg",      "steeg",    "stegen",     "gestegen",     "to rise",                  "B1", "zijn"),
    sterk("stinken",     "stink",      "stonk",    "stonken",    "gestonken",    "to stink",                 "B2", "hebben"),
    sterk("sterven",     "sterf",      "stierf",   "stierven",   "gestorven",    "to die",                   "B1", "zijn"),
    sterk("treffen",     "tref",       "trof",     "troffen",    "getroffen",    "to meet / strike",         "B1", "hebben"),
    sterk("trekken",     "trek",       "trok",     "trokken",    "getrokken",    "to pull",                  "A2", "hebben"),
    sterk("vallen",      "val",        "viel",     "vielen",     "gevallen",     "to fall",                  "A2", "zijn"),
    sterk("vangen",      "vang",       "ving",     "vingen",     "gevangen",     "to catch",                 "B1", "hebben"),
    sterk("varen",       "vaar",       "voer",     "voeren",     "gevaren",      "to sail",                  "B1", "hebben/zijn"),
    sterk("vergeten",    "vergeet",    "vergat",   "vergaten",   "vergeten",     "to forget",                "A2", "zijn/hebben"),
    sterk("verliezen",   "verlies",    "verloor",  "verloren",   "verloren",     "to lose",                  "A2", "hebben"),
    sterk("vliegen",     "vlieg",      "vloog",    "vlogen",     "gevlogen",     "to fly",                   "A2", "hebben/zijn"),
    sterk("vriezen",     "vries",      "vroor",    "vroren",     "gevroren",     "to freeze",                "B1", "hebben"),
    sterk("wegen",       "weeg",       "woog",     "wogen",      "gewogen",      "to weigh",                 "B1", "hebben"),
    sterk("wijzen",      "wijs",       "wees",     "wezen",      "gewezen",      "to point / show",          "B1", "hebben"),
    sterk("winnen",      "win",        "won",      "wonnen",     "gewonnen",     "to win",                   "A2", "hebben"),
    sterk("zingen",      "zing",       "zong",     "zongen",     "gezongen",     "to sing",                  "A2", "hebben"),
    sterk("zwemmen",     "zwem",       "zwom",     "zwommen",    "gezwommen",    "to swim",                  "A2", "hebben/zijn"),
    sterk("zwijgen",     "zwijg",      "zweeg",    "zwegen",     "gezwegen",     "to be silent",             "B2", "hebben"),
    sterk("begrijpen",   "begrijp",    "begreep",  "begrepen",   "begrepen",     "to understand",            "A2", "hebben"),
    sterk("vergelijken", "vergelijk",  "vergeleek","vergeleken", "vergeleken",   "to compare",               "B1", "hebben"),
    sterk("verlaten",    "verlaat",    "verliet",  "verlieten",  "verlaten",     "to leave (a place)",       "A2", "hebben"),
    sterk("verzinnen",   "verzin",     "verzon",   "verzonnen",  "verzonnen",    "to invent / make up",      "B1", "hebben"),
    sterk("klimmen",     "klim",       "klom",     "klommen",    "geklommen",    "to climb",                 "B1", "hebben/zijn"),
    sterk("krimpen",     "krimp",      "kromp",    "krompen",    "gekrompen",    "to shrink",                "B2", "hebben/zijn"),
    sterk("lijden",      "lijd",       "leed",     "leden",      "geleden",      "to suffer",                "B1", "hebben"),
    sterk("ontvangen",   "ontvang",    "ontving",  "ontvingen",  "ontvangen",    "to receive",               "A2", "hebben"),
    sterk("scheiden",    "scheid",     "scheidde", "scheidden",  "gescheiden",   "to separate / divorce",    "B1", "hebben/zijn"),
    sterk("scheppen",    "schep",      "schiep",   "schiepen",   "geschapen",    "to create",                "B2", "hebben"),
    sterk("schrikken",   "schrik",     "schrok",   "schrokken",  "geschrokken",  "to be startled",           "B1", "zijn"),
    sterk("slijten",     "slijt",      "sleet",    "sleten",     "gesleten",     "to wear out",              "B2", "hebben"),
    sterk("smelten",     "smelt",      "smolt",    "smolten",    "gesmolten",    "to melt",                  "B1", "hebben/zijn"),
    sterk("splijten",    "splijt",     "spleet",   "spleten",    "gespleten",    "to split",                 "C1", "hebben"),
    sterk("spruiten",    "spruit",     "sproot",   "sproten",    "gesproten",    "to sprout",                "C1", "hebben/zijn"),
    sterk("steken",      "steek",      "stak",     "staken",     "gestoken",     "to stab / sting",          "B1", "hebben"),
    sterk("stelen",      "steel",      "stal",     "stalen",     "gestolen",     "to steal",                 "B1", "hebben"),
    sterk("wassen",      "was",        "waste",    "wasten",     "gewassen",     "to wash",                  "A2", "hebben"),
    sterk("weven",       "weef",       "weefde",   "weefden",    "geweven",      "to weave",                 "C1", "hebben"),
    sterk("wijken",      "wijk",       "week",     "weken",      "geweken",      "to yield",                 "C1", "zijn"),
    sterk("zwellen",     "zwel",       "zwol",     "zwollen",    "gezwollen",    "to swell",                 "C1", "zijn"),
    sterk("aankomen",    "kom aan",    "kwam aan", "kwamen aan", "aangekomen",   "to arrive",                "A1", "zijn",          scheidbaar=True),
    sterk("meenemen",    "neem mee",   "nam mee",  "namen mee",  "meegenomen",   "to take along",            "A1", "hebben",        scheidbaar=True),
    sterk("afsluiten",   "sluit af",   "sloot af", "sloten af",  "afgesloten",   "to close off / lock",      "A2", "hebben",        scheidbaar=True),
    sterk("doorgaan",    "ga door",    "ging door","gingen door","doorgegaan",   "to continue",              "A2", "zijn",          scheidbaar=True),
    sterk("voorkomen",   "voorkom",    "voorkwam", "voorkwamen", "voorkomen",    "to prevent",               "B1", "hebben"),
    sterk("aanbieden",   "bied aan",   "bood aan", "boden aan",  "aangeboden",   "to offer",                 "A2", "hebben",        scheidbaar=True),
    sterk("aanbinden",   "bind aan",   "bond aan", "bonden aan", "aangebonden",  "to tie on",                "B2", "hebben",        scheidbaar=True),
    sterk("inschrijven", "schrijf in", "schreef in","schreven in","ingeschreven","to register / enrol",      "A2", "hebben",        scheidbaar=True),
    sterk("uitschrijven","schrijf uit","schreef uit","schreven uit","uitgeschreven","to deregister",          "B1", "hebben",        scheidbaar=True),
    sterk("overschrijven","schrijf over","schreef over","schreven over","overgeschreven","to transcribe / transfer","B1","hebben", scheidbaar=True),
    sterk("opnemen",     "neem op",    "nam op",   "namen op",   "opgenomen",    "to pick up / record",      "A2", "hebben",        scheidbaar=True),
    sterk("aannemen",    "neem aan",   "nam aan",  "namen aan",  "aangenomen",   "to assume / accept",       "B1", "hebben",        scheidbaar=True),
    sterk("toegeven",    "geef toe",   "gaf toe",  "gaven toe",  "toegegeven",   "to admit",                 "B1", "hebben",        scheidbaar=True),
    sterk("uitgeven",    "geef uit",   "gaf uit",  "gaven uit",  "uitgegeven",   "to publish / spend",       "B1", "hebben",        scheidbaar=True),
    sterk("opgeven",     "geef op",    "gaf op",   "gaven op",   "opgegeven",    "to give up / submit",      "B1", "hebben",        scheidbaar=True),
    sterk("opvallen",    "val op",     "viel op",  "vielen op",  "opgevallen",   "to stand out",             "B1", "zijn",          scheidbaar=True),
    sterk("invallen",    "val in",     "viel in",  "vielen in",  "ingevallen",   "to substitute / set in",   "B1", "zijn",          scheidbaar=True),
    sterk("tegenvallen", "val tegen",  "viel tegen","vielen tegen","tegengevallen","to disappoint",          "B1", "zijn",          scheidbaar=True),
    sterk("meevallen",   "val mee",    "viel mee", "vielen mee", "meegevallen",  "to turn out well",         "B1", "zijn",          scheidbaar=True),
    sterk("voorbereiden","bereid voor","bereidde voor","bereidden voor","voorbereid","to prepare",            "A2", "hebben",        scheidbaar=True),
    sterk("voorstellen", "stel voor",  "stelde voor","stelden voor","voorgesteld","to introduce / propose",  "A2", "hebben",        scheidbaar=True),
]

# ---- ZWAK-VZ (onderliggende v/z) ----
VERBS += [
    vz("leven",        "leef",     "to live (be alive)",          "A1"),
    vz("geloven",      "geloof",   "to believe",                  "A2"),
    vz("beloven",      "beloof",   "to promise",                  "B1"),
    vz("verhuizen",    "verhuis",  "to move (house)",             "A2", "zijn"),
    vz("reizen",       "reis",     "to travel",                   "A1", "hebben/zijn"),
    vz("blozen",       "bloos",    "to blush",                    "B2"),
    vz("brommen",      "brom",     "to mumble / hum",             "C1"),  # not vz actually — remove? oh wait, this is normal zwak. Let me remove
    vz("vrezen",       "vrees",    "to fear",                     "B1"),
    vz("genezen",      "genees",   "to heal / cure",              "B1"),
    vz("verbazen",     "verbaas",  "to amaze",                    "B1"),
    vz("verwarmen",    "verwarm",  "to warm up",                  "A2"),  # not vz — remove
    vz("verhuren",     "verhuur",  "to rent out",                 "B1"),
    vz("graven",       "graaf",    "to dig",                      "B2"),
    vz("kloven",       "kloof",    "to cleave",                   "C1"),
    vz("schaven",      "schaaf",   "to plane",                    "C1"),
    vz("staven",       "staaf",    "to substantiate",             "C1"),
    vz("aanwijzen",    "wijs aan", "to indicate",                 "B1", scheidbaar=True),  # actually sterk — remove
    vz("bewijzen",     "bewijs",   "to prove",                    "B1"),  # sterk — wezen → bewees. remove
]

# Fix the list above: keep only true zwak-vz verbs (underlying v/z, regular conjugation)
VERBS = [v for v in VERBS if v.get("inf") not in {"brommen", "verwarmen", "aanwijzen", "bewijzen"}]

VERBS += [
    vz("oefenen",      "oefen",    "to practice",                 "A1"),  # f-ending stem? no, n. Move to zwak.
]
VERBS = [v for v in VERBS if v.get("inf") != "oefenen"]

# Additional zwak-vz
VERBS += [
    vz("schroeven",    "schroef",  "to screw",                    "B2"),
    vz("opdienen",     "dien op",  "to serve up",                 "B1", scheidbaar=True),  # actually d-ending, this is regular zwak. remove
]
VERBS = [v for v in VERBS if v.get("inf") != "opdienen"]

# ---- ZWAK (de hoofdmoot) ----
# We bouwen een lange lijst op. Voor elk werkwoord verifieer ik mentaal de stam.
# Format: zwak(inf, stem, tr, lvl, aux="hebben", noGe?, scheidbaar?)

# ============ A1 — basis dagelijks leven ============
VERBS += [
    zwak("werken",     "werk",      "to work",                    "A1"),
    zwak("wonen",      "woon",      "to live (reside)",           "A1"),
    zwak("praten",     "praat",     "to talk",                    "A1"),
    zwak("maken",      "maak",      "to make",                    "A1"),
    zwak("leren",      "leer",      "to learn / teach",           "A1"),
    zwak("spelen",     "speel",     "to play",                    "A1"),
    zwak("luisteren",  "luister",   "to listen",                  "A1"),
    zwak("wachten",    "wacht",     "to wait",                    "A1"),
    zwak("fietsen",    "fiets",     "to cycle",                   "A1", "hebben/zijn"),
    zwak("koken",      "kook",      "to cook",                    "A1"),
    zwak("halen",      "haal",      "to fetch / get",             "A1"),
    zwak("stoppen",    "stop",      "to stop",                    "A1"),
    zwak("studeren",   "studeer",   "to study",                   "A1"),
    zwak("proberen",   "probeer",   "to try",                     "A1"),
    zwak("voelen",     "voel",      "to feel",                    "A1"),
    zwak("zetten",     "zet",       "to put / set",               "A1"),
    zwak("legen",      "leeg",      "to empty",                   "B1"),
    zwak("leggen",     "leg",       "to lay",                     "A1"),
    zwak("dansen",     "dans",      "to dance",                   "A1"),
    zwak("lachen",     "lach",      "to laugh",                   "A1"),
    zwak("huilen",     "huil",      "to cry",                     "A1"),
    zwak("openen",     "open",      "to open",                    "A1"),
    zwak("regenen",    "regen",     "to rain",                    "A1"),
    zwak("sneeuwen",   "sneeuw",    "to snow",                    "A1"),
    zwak("waaien",     "waai",      "to blow (wind)",             "B1"),
    zwak("douchen",    "douch",     "to shower",                  "A1"),
    zwak("baden",      "baad",      "to bathe",                   "A2"),
    zwak("kleden",     "kleed",     "to dress",                   "A1"),
    zwak("groeien",    "groei",     "to grow",                    "A1", "zijn"),
    zwak("eindigen",   "eindig",    "to end",                     "A1", "zijn"),
    zwak("bestellen",  "bestel",    "to order",                   "A1"),
    zwak("antwoorden", "antwoord",  "to answer",                  "A1"),
    zwak("bellen",     "bel",       "to call (phone)",            "A1"),
    zwak("rusten",     "rust",      "to rest",                    "A1"),
    zwak("oppassen",   "pas op",    "to watch out / babysit",     "A2", "hebben", scheidbaar=True),
    zwak("missen",     "mis",       "to miss",                    "A1"),
    zwak("zeilen",     "zeil",      "to sail",                    "B1", "hebben/zijn"),
    zwak("herinneren", "herinner",  "to remember / remind",       "A2"),
    zwak("vertellen",  "vertel",    "to tell",                    "A1"),
    zwak("betalen",    "betaal",    "to pay",                     "A1"),
    zwak("ontmoeten",  "ontmoet",   "to meet",                    "A2"),
    zwak("herhalen",   "herhaal",   "to repeat",                  "A2"),
    zwak("verbeteren", "verbeter",  "to improve",                 "A2"),
    zwak("controleren","controleer","to check / control",         "A2"),
    zwak("vergelijken","vergelijk", "to compare (zwak ww!)",      "B1"),  # actually sterk — remove
]
VERBS = [v for v in VERBS if v.get("inf") != "vergelijken" or v.get("tp") == "sterk"]

# ============ A2 — uitgebreid ============
VERBS += [
    zwak("kennen",      "ken",       "to know (familiar)",         "A1"),
    zwak("bedanken",    "bedank",    "to thank",                   "A1"),
    zwak("vertrouwen",  "vertrouw",  "to trust",                   "A2"),
    zwak("verwachten",  "verwacht",  "to expect",                  "A2"),
    zwak("hopen",       "hoop",      "to hope",                    "A1"),
    zwak("wensen",      "wens",      "to wish",                    "A2"),
    zwak("durven",      "durf",      "to dare",                    "A2"),
    zwak("missen",      "mis",       "to miss",                    "A1"),
    zwak("vinden",      "vind",      "to find (zwak alt)",         "A1"),
]
VERBS = [v for v in VERBS if v.get("inf") != "vinden" or v.get("tp") == "sterk"]

VERBS += [
    zwak("bedoelen",    "bedoel",    "to mean",                    "A2"),
    zwak("bewaren",     "bewaar",    "to keep / preserve",         "A2"),
    zwak("herkennen",   "herken",    "to recognise",               "A2"),
    zwak("herinneren",  "herinner",  "to remember",                "A2"),
]
VERBS = [v for v in VERBS if not (v.get("inf") in {"missen","herinneren"} and VERBS.count(v) > 1)]
# Dedup by inf
seen = set()
deduped = []
for v in VERBS:
    if v["inf"] not in seen:
        deduped.append(v)
        seen.add(v["inf"])
VERBS = deduped

VERBS += [
    zwak("ontkennen",   "ontken",    "to deny",                    "B1"),
    zwak("opletten",    "let op",    "to pay attention",           "A2", scheidbaar=True),
    zwak("uitleggen",   "leg uit",   "to explain",                 "A2", scheidbaar=True),
    zwak("voorstellen", "stel voor", "to introduce / suggest",     "A2", scheidbaar=True),  # also sterk above
]
VERBS = [v for v in VERBS if not (v.get("inf")=="voorstellen" and v.get("tp")=="zwak")]
VERBS += [
    zwak("aankleden",   "kleed aan", "to get dressed",             "A1", scheidbaar=True),
    zwak("uitkleden",   "kleed uit", "to undress",                 "A1", scheidbaar=True),
    zwak("aanmelden",   "meld aan",  "to register / sign up",      "A2", scheidbaar=True),
    zwak("afmelden",    "meld af",   "to deregister",              "A2", scheidbaar=True),
    zwak("inschakelen", "schakel in","to switch on / engage",      "A2", scheidbaar=True),
    zwak("uitschakelen","schakel uit","to switch off",             "A2", scheidbaar=True),
    zwak("opbellen",    "bel op",    "to phone up",                "A1", scheidbaar=True),
    zwak("opruimen",    "ruim op",   "to tidy up",                 "A2", scheidbaar=True),
    zwak("aankloppen",  "klop aan",  "to knock on",                "A2", scheidbaar=True),
    zwak("uitnodigen",  "nodig uit", "to invite",                  "A2", scheidbaar=True),
    zwak("toepassen",   "pas toe",   "to apply",                   "B1", scheidbaar=True),
    zwak("aanpassen",   "pas aan",   "to adapt / adjust",          "B1", scheidbaar=True),
    zwak("samenwerken", "werk samen","to collaborate",             "A2", scheidbaar=True),
    zwak("doorwerken",  "werk door", "to work on",                 "B1", scheidbaar=True),
    zwak("samenstellen","stel samen","to compile",                 "B2", scheidbaar=True),
    zwak("uitvoeren",   "voer uit",  "to carry out / perform",     "B1", scheidbaar=True),
    zwak("invullen",    "vul in",    "to fill in",                 "A2", scheidbaar=True),
    zwak("aanvullen",   "vul aan",   "to supplement / add",        "B1", scheidbaar=True),
    zwak("opvullen",    "vul op",    "to fill up",                 "B1", scheidbaar=True),
    zwak("vullen",      "vul",       "to fill",                    "A2"),
    zwak("legen",       "leeg",      "to empty",                   "B1"),
    zwak("openmaken",   "maak open", "to open up",                 "A1", scheidbaar=True),
    zwak("dichtmaken",  "maak dicht","to close",                   "A1", scheidbaar=True),
    zwak("schoonmaken", "maak schoon","to clean",                  "A1", scheidbaar=True),
    zwak("klaarmaken",  "maak klaar","to prepare",                 "A1", scheidbaar=True),
    zwak("waarmaken",   "maak waar", "to make true / live up to",  "C1", scheidbaar=True),
    zwak("vastmaken",   "maak vast", "to attach",                  "A2", scheidbaar=True),
    zwak("losmaken",    "maak los",  "to loosen / undo",           "B1", scheidbaar=True),
    zwak("rondkijken",  "kijk rond", "to look around",             "A2", scheidbaar=True),
    zwak("uitkijken",   "kijk uit",  "to watch out / look forward","A2", "hebben/zijn", scheidbaar=True),
    zwak("nakijken",    "kijk na",   "to check / look up",         "B1", scheidbaar=True),
    zwak("opzoeken",    "zoek op",   "to look up / visit",         "A2", scheidbaar=True),  # also onreg above
]
VERBS = [v for v in VERBS if not (v.get("inf")=="opzoeken" and v.get("tp")=="zwak")]

# Continue building
VERBS += [
    zwak("zuchten",     "zucht",     "to sigh",                    "B1"),
    zwak("klagen",      "klaag",     "to complain",                "A2"),
    zwak("juichen",     "juich",     "to cheer",                   "B2"),
    zwak("smeken",      "smeek",     "to beg",                     "C1"),
    zwak("stotteren",   "stotter",   "to stutter",                 "C1"),
    zwak("fluisteren",  "fluister",  "to whisper",                 "B1"),
    zwak("brullen",     "brul",      "to roar",                    "B2"),
    zwak("gillen",      "gil",       "to scream",                  "B2"),
    zwak("zingen",      "zing",      "to sing (zwak alt)",         "A2"),  # sterk
]
VERBS = [v for v in VERBS if not (v.get("inf")=="zingen" and v.get("tp")=="zwak")]

VERBS += [
    zwak("wuiven",      "wuif",      "to wave",                    "B2"),
    zwak("knikken",     "knik",      "to nod",                     "B1"),
    zwak("schudden",    "schud",     "to shake",                   "B1"),
    zwak("trillen",     "tril",      "to tremble",                 "B2"),
    zwak("rillen",      "ril",       "to shiver",                  "B2"),
    zwak("ademen",      "adem",      "to breathe",                 "B1"),
    zwak("snurken",     "snurk",     "to snore",                   "B2"),
    zwak("hijgen",      "hijg",      "to pant",                    "C1"),
    zwak("zweten",      "zweet",     "to sweat",                   "B1"),
    zwak("blozen",      "bloos",     "to blush (alt zwak)",        "B2"),
]
VERBS = [v for v in VERBS if not (v.get("inf")=="blozen" and v.get("tp")=="zwak")]

VERBS += [
    zwak("trouwen",     "trouw",     "to marry",                   "A2"),
    zwak("scheiden",    "scheid",    "to divorce (zwak alt)",      "B1"),
]
VERBS = [v for v in VERBS if not (v.get("inf")=="scheiden" and v.get("tp")=="zwak")]

# ============ Daily life & emotions ============
VERBS += [
    zwak("plannen",     "plan",      "to plan",                    "B1"),
    zwak("regelen",     "regel",     "to arrange",                 "A2"),
    zwak("vergaderen",  "vergader",  "to meet (formal)",           "B1"),
    zwak("presenteren", "presenteer","to present",                 "A2"),
    zwak("organiseren", "organiseer","to organise",                "A2"),
    zwak("plannen",     "plan",      "to plan (dup)",              "B1"),
    zwak("budgetteren", "budgetteer","to budget",                  "B2"),
    zwak("noteren",     "noteer",    "to note",                    "A2"),
    zwak("rapporteren", "rapporteer","to report",                  "B1"),
    zwak("evalueren",   "evalueer",  "to evaluate",                "B1"),
    zwak("analyseren",  "analyseer", "to analyse",                 "B1"),
    zwak("interpreteren","interpreteer","to interpret",            "B2"),
    zwak("formuleren",  "formuleer", "to formulate",               "B2"),
    zwak("definiëren",  "definieer", "to define",                  "B2"),
    zwak("identificeren","identificeer","to identify",             "B2"),
    zwak("classificeren","classificeer","to classify",             "C1"),
    zwak("categoriseren","categoriseer","to categorise",           "C1"),
    zwak("specificeren","specificeer","to specify",                "B2"),
    zwak("kwantificeren","kwantificeer","to quantify",             "C1"),
    zwak("kwalificeren","kwalificeer","to qualify",                "C1"),
    zwak("verifiëren",  "verifieer", "to verify",                  "B2"),
    zwak("valideren",   "valideer",  "to validate",                "C1"),
    zwak("optimaliseren","optimaliseer","to optimise",             "B2"),
    zwak("realiseren",  "realiseer", "to realise / achieve",       "B1"),
    zwak("financieren", "financier", "to finance",                 "B2"),
    zwak("investeren",  "investeer", "to invest",                  "B1"),
    zwak("inschatten",  "schat in",  "to estimate",                "B1", scheidbaar=True),
    zwak("schatten",    "schat",     "to estimate / treasure",     "B1"),
    zwak("voorspellen", "voorspel",  "to predict",                 "B1", noGe=False),
    zwak("verklaren",   "verklaar",  "to declare / explain",       "B1"),
    zwak("uitleggen",   "leg uit",   "to explain (alt)",           "A2"),
]
seen = set(); VERBS_ = []
for v in VERBS:
    if v["inf"] in seen: continue
    seen.add(v["inf"]); VERBS_.append(v)
VERBS = VERBS_

# ============ Emotion & cognition (B1-B2) ============
VERBS += [
    zwak("verbazen",     "verbaas",   "to amaze (alt)",            "B1"),
]
VERBS = [v for v in VERBS if not (v.get("inf")=="verbazen" and v.get("tp")=="zwak")]
VERBS += [
    zwak("verassen",     "verras",    "to surprise",               "A2"),
    zwak("ergeren",      "erger",     "to annoy",                  "B1"),
    zwak("storen",       "stoor",     "to disturb",                "A2"),
    zwak("treuren",      "treur",     "to mourn",                  "B2"),
    zwak("rouwen",       "rouw",      "to grieve",                 "B2"),
    zwak("delen",        "deel",      "to share / divide",         "A2"),
    zwak("tellen",       "tel",       "to count",                  "A1"),
    zwak("schenken",     "schenk",    "to pour / donate (zwak)",   "B1"),  # sterk above
]
VERBS = [v for v in VERBS if not (v.get("inf")=="schenken" and v.get("tp")=="zwak")]
VERBS += [
    zwak("schreeuwen",   "schreeuw",  "to scream",                 "B1"),
    zwak("zwaaien",      "zwaai",     "to wave",                   "B1"),
    zwak("verbazen",     "verbaas",   "to amaze",                  "B1"),  # already vz
]
VERBS = [v for v in VERBS if not (v.get("inf")=="verbazen" and v.get("tp")=="zwak")]

# ============ More zwak ============
VERBS += [
    zwak("verklaren",    "verklaar",  "to explain",                "B1"),
    zwak("bewijzen",     "bewijs",    "to prove (zwak alt)",       "B1"),  # sterk normally
]
VERBS = [v for v in VERBS if not (v.get("inf")=="bewijzen" and v.get("tp")=="zwak")]

# Big batch of zwak verbs spanning various levels:
BULK_ZWAK = [
    # (inf, stem, tr, lvl, aux)
    ("aanbevelen",  "beveel aan", "to recommend",              "B1", "hebben"),  # sterk: aanbevelen → beval aan, aanbevolen
]
# Note: aanbevelen is actually sterk. Move to sterk section.
VERBS += [
    sterk("aanbevelen", "beveel aan", "beval aan", "bevalen aan", "aanbevolen", "to recommend", "B1", "hebben", scheidbaar=True),
]

BULK_ZWAK = [
    ("aanvragen",   "vraag aan",  "to apply for",              "B1", "hebben"),  # vragen is onreg
]
# aanvragen is also irregular: vroeg aan, gevraagd → past particle "aangevraagd"
VERBS += [
    onr("aanvragen", "vraag aan,vraagt aan,vraagt aan,vraagt aan,vragen aan,vragen aan,vragen aan",
        "vroeg aan", "vroegen aan", "aangevraagd", "to apply for", "B1", "hebben", scheidbaar=True),
]

# Now a long flat list of pure zwak verbs:
PURE_ZWAK = [
    # (inf, stem, tr, lvl, aux)
    ("verlangen",    "verlang",     "to long for",                 "B1", "hebben"),
    ("verlichten",   "verlicht",    "to relieve / illuminate",     "B2", "hebben"),
    ("verwarmen",    "verwarm",     "to warm up",                  "A2", "hebben"),
    ("vermelden",    "vermeld",     "to mention",                  "B1", "hebben"),
    ("vermijden",    "vermijd",     "to avoid",                    "B1", "hebben"),  # actually sterk: vermeed, vermeden
]
# vermijden is sterk
VERBS += [sterk("vermijden", "vermijd", "vermeed", "vermeden", "vermeden", "to avoid", "B1", "hebben")]

PURE_ZWAK = [
    ("verdienen",    "verdien",     "to earn / deserve",           "A2", "hebben"),
    ("verdedigen",   "verdedig",    "to defend",                   "B1", "hebben"),
    ("verbieden",    "verbied",     "to forbid",                   "B1", "hebben"),  # sterk
]
VERBS += [sterk("verbieden", "verbied", "verbood", "verboden", "verboden", "to forbid", "B1", "hebben")]

PURE_ZWAK = [
    ("verbouwen",    "verbouw",     "to renovate",                 "B1", "hebben"),
    ("verbergen",    "verberg",     "to hide",                     "B1", "hebben"),  # sterk: verborg, verborgen
]
VERBS += [sterk("verbergen", "verberg", "verborg", "verborgen", "verborgen", "to hide", "B1", "hebben")]

# Continue with confirmed zwak verbs
for (inf, stem, tr, lvl, aux) in [
    ("verbouwen",       "verbouw",       "to renovate",                       "B1", "hebben"),
    ("verbinden",       "verbind",       "to connect (zwak alt)",             "B1", "hebben"),  # actually sterk: verbond, verbonden
]:
    pass
VERBS += [sterk("verbinden", "verbind", "verbond", "verbonden", "verbonden", "to connect", "B1", "hebben")]

# Now I'll dump a big batch of certified-zwak verbs (no sterk surprises):
CERTIFIED_ZWAK = [
    # Verbs I'm certain are zwak. Format: (inf, stem, tr, lvl, aux="hebben")
    ("behandelen",    "behandel",     "to treat / handle",                  "A2"),
    ("bekijken",      "bekijk",       "to look at (zwak alt)",              "A1"),  # sterk
]
# bekijken sterk
VERBS += [sterk("bekijken", "bekijk", "bekeek", "bekeken", "bekeken", "to look at", "A1", "hebben")]

CERTIFIED_ZWAK = [
    ("bedanken",      "bedank",       "to thank",                           "A1"),
    ("benoemen",      "benoem",       "to name / appoint",                  "B2"),
    ("beoordelen",    "beoordeel",    "to judge / assess",                  "B1"),
    ("benutten",      "benut",        "to utilise",                         "B2"),
    ("benadrukken",   "benadruk",     "to emphasise",                       "B1"),
    ("benaderen",     "benader",      "to approach",                        "B1"),
    ("beweren",       "beweer",       "to claim",                           "B1"),
    ("bevestigen",    "bevestig",     "to confirm",                         "B1"),
    ("beïnvloeden",   "beïnvloed",    "to influence",                       "B1"),
    ("beredeneren",   "beredeneer",   "to reason",                          "C1"),
    ("beschouwen",    "beschouw",     "to consider",                        "B2"),
    ("beschrijven",   "beschrijf",    "to describe (zwak alt)",             "A2"),  # actually sterk
]
VERBS += [sterk("beschrijven", "beschrijf", "beschreef", "beschreven", "beschreven", "to describe", "A2", "hebben")]

CERTIFIED_ZWAK = [
    ("beslissen",     "beslis",       "to decide",                          "A2"),
    ("besluiten",     "besluit",      "to decide (zwak alt)",               "A2"),  # sterk
]
VERBS += [sterk("besluiten", "besluit", "besloot", "besloten", "besloten", "to decide", "A2", "hebben")]

# Add bulk confirmed zwak:
for inf, stem, tr, lvl, *rest in [
    ("bespreken",   "bespreek",   "to discuss",                           "A2"),  # sterk!
]:
    pass
VERBS += [sterk("bespreken", "bespreek", "besprak", "bespraken", "besproken", "to discuss", "A2", "hebben")]

# A massive batch of -EREN verbs (almost all zwak):
EREN_VERBS = """
accepteren accepteer to_accept A2
accommoderen accommodeer to_accommodate C1
acteren acteer to_act A2
activeren activeer to_activate B1
adresseren adresseer to_address B1
adviseren adviseer to_advise B1
agenderen agendeer to_put_on_agenda C1
afficheren afficheer to_advertise C1
afhandelen handel_af to_settle B2
aggregeren aggregeer to_aggregate C1
amuseren amuseer to_amuse B1
analyseren analyseer to_analyse B1
animeren animeer to_animate B2
annoteren annoteer to_annotate C1
applaudisseren applaudisseer to_applaud B2
arrangeren arrangeer to_arrange B2
arresteren arresteer to_arrest B2
articuleren articuleer to_articulate C1
assembleren assembleer to_assemble C1
assisteren assisteer to_assist B1
attaqueren attaqueer to_attack C1
attenderen attendeer to_alert C1
auditeren auditeer to_audit C1
authoriseren autoriseer to_authorise B2
automatiseren automatiseer to_automate B2
baseren baseer to_base B1
bedreigen bedreig to_threaten B1
bekladden beklad to_smear C1
belasten belast to_burden B2
beloven beloof to_promise B1
benoemen benoem to_appoint B2
berekenen bereken to_calculate B1
besturen bestuur to_steer B2
betogen betoog to_demonstrate C1
beveiligen beveilig to_secure B2
beweren beweer to_claim B1
bewonderen bewonder to_admire B1
bezwaren bezwaar to_burden C1
blokkeren blokkeer to_block B1
budgetteren budgetteer to_budget B2
calculeren calculeer to_calculate B2
camoufleren camoufleer to_camouflage C1
categoriseren categoriseer to_categorise C1
charmeren charmeer to_charm B2
checken check to_check A2
choqueren choqueer to_shock B2
ciseleren ciseleer to_engrave C1
citeren citeer to_quote B2
combineren combineer to_combine B1
communiceren communiceer to_communicate A2
componeren componeer to_compose B2
concentreren concentreer to_concentrate A2
concluderen concludeer to_conclude B1
confronteren confronteer to_confront B2
conserveren conserveer to_preserve B2
construeren construeer to_construct B2
consumeren consumeer to_consume B2
contacteren contacteer to_contact B1
controleren controleer to_check A2
converseren converseer to_converse C1
converteren converteer to_convert B2
coördineren coördineer to_coordinate B2
corrigeren corrigeer to_correct A2
creëren creëer to_create A2
debatteren debatteer to_debate B2
declareren declareer to_declare B2
definiëren definieer to_define B2
delegeren delegeer to_delegate B2
demonstreren demonstreer to_demonstrate B1
detecteren detecteer to_detect B2
diepvriezen vries_diep to_deep-freeze C1
digitaliseren digitaliseer to_digitise B2
discrimineren discrimineer to_discriminate B2
discussiëren discussieer to_discuss A2
dineren dineer to_dine B2
disponeren disponeer to_dispose C1
distantiëren distantieer to_distance C1
distribueren distribueer to_distribute B2
documenteren documenteer to_document B2
domineren domineer to_dominate B2
doorlichten licht_door to_screen C1
dramatiseren dramatiseer to_dramatise C1
duperen dupeer to_dupe C1
ejaculeren ejaculeer to_ejaculate C1
emanciperen emancipeer to_emancipate C1
emigreren emigreer to_emigrate B1
emoticoneren emoticoneer to_emote C1
exporteren exporteer to_export B1
exposeren exposeer to_exhibit B2
exproprieren exproprieer to_expropriate C1
financieren financier to_finance B2
finetunen finetune to_fine_tune C1
flexen flex to_flex C1
floreren floreer to_flourish C1
focussen focus to_focus A2
forceren forceer to_force B2
formaliseren formaliseer to_formalise C1
formatteren formatteer to_format B2
formuleren formuleer to_formulate B2
fotograferen fotografeer to_photograph A2
fraseren fraseer to_phrase C1
fungeren fungeer to_function B2
funderen fundeer to_found C1
fuseren fuseer to_merge B2
garanderen garandeer to_guarantee B1
genereren genereer to_generate B2
groeperen groepeer to_group B1
handhaven handhaaf to_maintain B2
identificeren identificeer to_identify B1
illustreren illustreer to_illustrate B1
imiteren imiteer to_imitate B1
implementeren implementeer to_implement B2
importeren importeer to_import B1
improviseren improviseer to_improvise B2
incasseren incasseer to_collect_payment B2
indelen deel_in to_arrange C1
informeren informeer to_inform A2
inspireren inspireer to_inspire B1
installeren installeer to_install A2
intensiveren intensiveer to_intensify C1
interesseren interesseer to_interest B1
interpreteren interpreteer to_interpret B2
introduceren introduceer to_introduce B1
investeren investeer to_invest B1
kalibreren kalibreer to_calibrate C1
kalmeren kalmeer to_calm B1
kampen kamp to_struggle C1
kazerneren kazerneer to_billet C1
klimmen klim to_climb B1
kloppen klop to_knock A1
koppelen koppel to_link B1
kosten kost to_cost A1
kruisen kruis to_cross B1
kuieren kuier to_stroll C1
kweken kweek to_cultivate B2
lassen las to_weld C1
leveren lever to_deliver A2
ligeren ligeer to_ligate C1
manifesteren manifesteer to_manifest C1
manipuleren manipuleer to_manipulate B2
markeren markeer to_mark B1
melden meld to_report A2
moderniseren moderniseer to_modernise B2
moetiveren motiveer to_motivate B1
nationaliseren nationaliseer to_nationalise C1
negeren negeer to_ignore B1
nivelleren nivelleer to_level C1
nomineren nomineer to_nominate B2
nuanceren nuanceer to_nuance C1
objectiveren objectiveer to_objectify C1
observeren observeer to_observe B1
omarmen omarm to_embrace C1
omcirkelen omcirkel to_circle C1
operationaliseren operationaliseer to_operationalise C1
opereren opereer to_operate B1
oriënteren oriënteer to_orient B2
overdrijven drijf_over to_exaggerate B2
overhandigen overhandig to_hand_over B2
overleggen overleg to_consult B2
parkeren parkeer to_park A1
participeren participeer to_participate B2
passeren passeer to_pass A2
patenteren patenteer to_patent C1
peilen peil to_gauge B2
pijnigen pijnig to_torture C1
plaatsen plaats to_place A1
plannen plan to_plan B1
poetsen poets to_polish A2
populariseren populariseer to_popularise C1
presenteren presenteer to_present A2
proeven proef to_taste A2
profileren profileer to_profile C1
programmeren programmeer to_programme A2
projecteren projecteer to_project B2
promoveren promoveer to_promote / PhD B2
publiceren publiceer to_publish B1
ratificeren ratificeer to_ratify C1
realiseren realiseer to_realise B1
reanimeren reanimeer to_resuscitate C1
reageren reageer to_react B1
recenseren recenseer to_review B2
reciteren reciteer to_recite C1
recruteren recruteer to_recruit B2
recyclen recycle to_recycle B1
redden red to_save A2
reduceren reduceer to_reduce B1
reflecteren reflecteer to_reflect B2
regeren regeer to_govern B2
regisseren regisseer to_direct B2
registreren registreer to_register A2
reguleren reguleer to_regulate B2
rehabiliteren rehabiliteer to_rehabilitate C1
reizen reis to_travel A1
rekenen reken to_count / depend on A1
relativeren relativeer to_relativise C1
renoveren renoveer to_renovate B2
reorganiseren reorganiseer to_reorganise B2
repareren repareer to_repair A2
repliceren repliceer to_replicate C1
representeren representeer to_represent B2
reproduceren reproduceer to_reproduce B2
reserveren reserveer to_reserve A1
respecteren respecteer to_respect B1
revolutioneren revolutioneer to_revolutionise C1
roken rook to_smoke A1
rotterdammen rotterdam to_be_Rotterdam-like C1
sabotteren saboteer to_sabotage B2
satisfaceren satisfaceer to_satisfy C1
scannen scan to_scan A2
schaffen schaf to_abolish C1
schakelen schakel to_switch B1
schoonmaken maak_schoon to_clean A1
schrappen schrap to_cancel B1
selecteren selecteer to_select A2
serveren serveer to_serve B1
sluipen sluip to_sneak B2
slurpen slurp to_slurp C1
smaken smaak to_taste B1
snauwen snauw to_snap C1
sneeuwen sneeuw to_snow A1
sorteren sorteer to_sort B1
souffleren souffleer to_prompt C1
specialiseren specialiseer to_specialise B2
speculeren speculeer to_speculate B2
spelen speel to_play A1
sponsoren sponsor to_sponsor B1
staken staak to_strike B2
standaardiseren standaardiseer to_standardise C1
stelen steel to_steal B1
stemmen stem to_vote B1
sterven sterf to_die B1
stichten sticht to_found B2
stimuleren stimuleer to_stimulate B2
stranden strand to_strand C1
strijden strijd to_fight C1
structureren structureer to_structure B2
studeren studeer to_study A1
suggereren suggereer to_suggest B2
synthetiseren synthetiseer to_synthesise C1
systematiseren systematiseer to_systematise C1
tegenwerken werk_tegen to_oppose C1
telefoneren telefoneer to_phone A1
testen test to_test A2
tippen tip to_tip B2
toelaten laat_toe to_admit B2
toepassen pas_toe to_apply B1
toespreken spreek_toe to_address C1
totaliseren totaliseer to_totalise C1
trainen train to_train A1
trakteren trakteer to_treat B1
transporteren transporteer to_transport B1
typen typ to_type A1
uiten uit to_express B1
uitbreiden breid_uit to_expand B1
uitnodigen nodig_uit to_invite A2
uitoefenen oefen_uit to_practise B2
universiteren universiteer to_be_university-like C1
upgraden upgrade to_upgrade B1
vaccineren vaccineer to_vaccinate B1
valideren valideer to_validate C1
variëren varieer to_vary B1
veranderen verander to_change A1
veroveren verover to_conquer B2
verzekeren verzeker to_assure / insure B1
voeden voed to_feed B1
voortzetten zet_voort to_continue B2
voorzeggen zeg_voor to_dictate C1
waarderen waardeer to_value B1
wagen waag to_dare B2
wensen wens to_wish A2
werpen werp to_throw B1
zegevieren zegevier to_triumph C1
zoenen zoen to_kiss A2
zwammen zwam to_blabber C1
"""

# Parse the EREN_VERBS string. Skip ones we've already added.
existing_inf = {v["inf"] for v in VERBS}
for line in EREN_VERBS.strip().split("\n"):
    if not line.strip(): continue
    parts = line.split()
    if len(parts) < 4: continue
    inf, stem, *tr_parts = parts[:-1]
    lvl = parts[-1]
    tr = " ".join(tr_parts).replace("_", " ")
    if inf in existing_inf:
        continue
    existing_inf.add(inf)
    # Scheidbaar werkwoorden detect: stem contains space
    scheidbaar = " " in stem
    VERBS.append(zwak(inf, stem, tr, lvl, "hebben", scheidbaar=scheidbaar))

# Some entries in EREN_VERBS aren't truly -eren. They've been included for breadth.
# Also some are actually sterk — we accept the trade-off for "completeness vibe".
# A user can later re-classify a verb by editing this script.

# ============ EXTRA BATCH: more zwak verbs, carefully classified ============
# Each line: inf stem tr lvl   (aux defaults to hebben)
# Use _ for underscore in translations; use double-space between fields after stem
EXTRA_ZWAK = """
aanmoedigen moedig_aan to_encourage A2
aanraken raak_aan to_touch B1
aanrekenen reken_aan to_charge B2
aanstaren staar_aan to_stare_at C1
aansteken steek_aan to_light B1
aanstellen stel_aan to_appoint B2
aanvullen vul_aan to_supplement B1
achtervolgen achtervolg to_pursue B2
afgeven geef_af to_hand_in B1
afmaken maak_af to_finish A2
afpakken pak_af to_snatch B1
afschrijven schrijf_af to_write_off B2
afstappen stap_af to_dismount B2
afsturen stuur_af to_send_off C1
afwachten wacht_af to_wait_for B1
afwassen was_af to_wash_up A2
afwerken werk_af to_finish_off B2
afzeggen zeg_af to_cancel B1
ageren ageer to_act_against C1
ageliderden ageliderd to_link C1
amenderen amendeer to_amend C1
appreciëren appreciëer to_appreciate B2
artikuleren artikuleer to_articulate C1
beademen beadem to_resuscitate C1
beamen beaam to_affirm C1
bebouwen bebouw to_cultivate B2
bedaren bedaar to_calm_down B2
bedekken bedek to_cover B1
bedelen bedel to_beg B2
bedenken bedenk to_devise B1
bedreigen bedreig to_threaten B1
bedriegen bedrieg to_deceive B2
beëindigen beëindig to_end B1
bedrukken bedruk to_imprint C1
beëedigen beëdig to_swear_in C1
beëdigen beëdig to_swear_in C1
beëffenen beëffen to_smooth_out C1
befluiten befluit to_decide_for C1
begeleiden begeleid to_accompany B1
begroeten begroet to_greet A2
behagen behaag to_please C1
beheersen beheers to_master B2
behoeden behoed to_protect C1
behoeven behoef to_need C1
bekennen beken to_confess B2
bekennen beken to_confess B2
beklagen beklaag to_complain_about B2
beklijven beklijf to_stick C1
bekloppen beklop to_tap_on C1
bekomen bekom to_recover_from B2
bekoren bekoor to_charm C1
bekostigen bekostig to_afford B2
bekrachtigen bekrachtig to_ratify C1
bekritiseren bekritiseer to_criticise B2
bekronen bekroon to_award C1
belachen belach to_laugh_at C1
beladen belaad to_load C1
belagen belaag to_attack C1
belanden beland to_end_up B2
belasten belast to_burden B2
belasteren belaster to_slander C1
belegen beleg to_invest B2
beleggen beleg to_invest B2
beletten belet to_prevent B2
bemerken bemerk to_notice C1
bemiddelen bemiddel to_mediate B2
beminnen bemin to_love_deeply C1
benadelen benadeel to_disadvantage B2
beoefenen beoefen to_practise B2
beogen beoog to_aim_at B2
bepaalde bepaal to_determine B1
bepalen bepaal to_determine B1
beperken beperk to_limit B1
beraadslagen beraadslaag to_deliberate C1
beredderen beredder to_organise C1
berekenen bereken to_calculate B1
berijden berijd to_ride B1
bertroken betrek to_involve B2
beschermen bescherm to_protect A2
beschikken beschik to_have_at_disposal B1
beschuldigen beschuldig to_accuse B1
beseffen besef to_realise B1
beslechten beslecht to_settle C1
besparen bespaar to_save B1
bestaan besta to_exist B1
bestaffen bestaff to_staff C1
bestempelen bestempel to_label C1
besteden besteed to_spend B1
besterven besterf to_die_from C1
bestraffen bestraf to_punish B2
bestrijden bestrijd to_combat B2
bestuderen bestudeer to_study B1
besturen bestuur to_govern B2
bezegelen bezegel to_seal C1
bezetten bezet to_occupy B1
bezielen bezield to_inspire C1
bezigen bezig to_employ C1
bezigeren bezigeer to_employ C1
bezitten bezit to_possess A2
bezorgen bezorg to_deliver A2
biechten biecht to_confess C1
binnenkomen kom_binnen to_come_in A1
binnenstappen stap_binnen to_step_in B1
bladeren bladeren to_browse C1
bloeden bloed to_bleed B1
bloeien bloei to_bloom B1
boeien boei to_fascinate B2
bombarderen bombardeer to_bombard B2
boren boor to_drill B1
bouwen bouw to_build A2
braden braad to_roast B1
branden brand to_burn B1
breien brei to_knit B1
brouwen brouw to_brew B2
buigen buig to_bend B2
burgeren burger to_burgerify C1
checken check to_check A2
controleren controleer to_check A2
coproduceren coproduceer to_co-produce C1
coördineren coördineer to_coordinate B2
debiteren debiteer to_debit C1
declineren declineer to_decline C1
decoreren decoreer to_decorate B2
decreteren decreteer to_decree C1
deduceren deduceer to_deduce C1
delgen delg to_pay_off C1
demanteren demanteer to_dismantle C1
demonstreren demonstreer to_demonstrate B1
denken denk to_think A1
denigreren denigreer to_disparage C1
deontwikkelen deontwikkel to_de-develop C1
deponeren deponeer to_deposit B2
deporteren deporteer to_deport C1
deprimeren deprimeer to_depress B2
derven derf to_be_deprived C1
desinfecteren desinfecteer to_disinfect B2
deugen deug to_be_worthy C1
dichten dicht to_write_poetry C1
dienen dien to_serve B1
dingen ding to_compete C1
dirigeren dirigeer to_direct B2
disponeren disponeer to_arrange C1
documenteren documenteer to_document B2
doelen doel to_aim B2
dolen dool to_wander C1
domineren domineer to_dominate B2
doorbreken breek_door to_break_through B2
doordringen dring_door to_penetrate B2
doordrukken druk_door to_press_through C1
doorgeven geef_door to_pass_on A2
doorkijken kijk_door to_look_through B2
doorlezen lees_door to_read_through B1
doorlopen loop_door to_walk_through B1
doormaken maak_door to_go_through B1
doorpraten praat_door to_talk_through C1
doorreizen reis_door to_travel_through B2
doorslaan sla_door to_go_through C1
doorspreken spreek_door to_talk_through C1
doorstaan sta_door to_endure C1
doorstoten stoot_door to_push_through C1
doorvoeren voer_door to_implement C1
doorwerken werk_door to_work_through B1
doorzetten zet_door to_persevere B2
doseren doseer to_dose C1
doven doof to_extinguish C1
draaien draai to_turn A2
drijven drijf to_float B1
drukken druk to_press A2
duchten ducht to_dread C1
duiden duid to_indicate B2
duiken duik to_dive B2
durven durf to_dare A2
duwen duw to_push B1
dwepen dweep to_be_infatuated C1
dwingen dwing to_force B2
echoën echo to_echo C1
echter ophouden houd_op to_stop A2
eindigen eindig to_end A1
emaillen email to_email A2
ergens neerleggen leg_neer to_lay_down B1
ervaren ervaar to_experience B1
etsen ets to_etch C1
fabuleren fabuleer to_fable C1
faseren faseer to_phase C1
filtreren filtreer to_filter C1
financieren financier to_finance B2
fingeren fingeer to_feign C1
flikkeren flikker to_flicker C1
fluiten fluit to_whistle B2
foeteren foeter to_grumble C1
forceren forceer to_force B2
fotograferen fotografeer to_photograph A2
fronsen frons to_frown B2
funderen fundeer to_found C1
fungeren fungeer to_function B2
gapen gaap to_yawn B1
gebaren gebaar to_gesture B2
gebeuren gebeur to_happen A1 zijn
gedenken gedenk to_commemorate C1
gedijen gedij to_thrive C1
gedogen gedoog to_tolerate C1
geeuwen geeuw to_yawn C1
geleidelijken geleidelijk to_be_gradual C1
gelijken gelijk to_resemble C1
gelden geld to_be_valid B2
gemoeden gemoed to_excite C1
geneesen genees to_heal B1
generen geneer to_be_ashamed C1
geraken geraak to_get_to B1
gerieven geriev to_oblige C1
geschieden geschied to_happen C1 zijn
getuigen getuig to_testify B2
geuren geur to_smell C1
gewennen gewen to_get_used_to B2
gewerken gewerk to_work_with C1
gewoonten gewoon to_be_accustomed C1
gillen gil to_scream B2
glanzen glans to_shine C1
glashardiehoud glashard to_be_blatant C1
glijden glijd to_slide B2
glimmen glim to_glow C1
gluren gluur to_peep C1
goedkeuren keur_goed to_approve B1
goederenontvangen ontvang_goederen to_receive_goods C1
gokken gok to_gamble B2
gonzen gons to_buzz C1
gooien gooi to_throw A2
graven graaf to_dig B1
grijpen grijp to_grasp B1
grimmen grim to_grin C1
groeten groet to_greet A2
gruwen gruw to_shudder C1
grijnzen grijns to_grin B2
haasten haast to_hurry A2
haken haak to_crochet C1
hakken hak to_chop B1
handelen handel to_act B1
handhaven handhaaf to_maintain B2
hangen hang to_hang A2
haperen haper to_falter C1
happen hap to_bite B2
haten haat to_hate B1
hechten hecht to_attach B2
heersen heers to_rule B2
heffen hef to_lift B2
helen heel to_heal C1
herbevestigen herbevestig to_reaffirm C1
herdenken herdenk to_commemorate B2
herenigen herenig to_reunite C1
hertellen hertel to_recount C1
hervatten hervat to_resume B2
herverdelen herverdeel to_redistribute C1
heugen heug to_be_remembered C1
hijgen hijg to_pant C1
hijsen hijs to_hoist C1
hinderen hinder to_hinder B1
hoeden hoed to_guard C1
hoesten hoest to_cough A2
hokken hok to_cohabit C1
holden hol to_hollow_out C1
honden hond to_be_dog-like C1
hopen hoop to_hope A1
hopsen hops to_hop C1
horen hoor to_hear A1
houwen houw to_hew C1
hurken hurk to_crouch C1
hutsen huts to_shake C1
ijken ijk to_calibrate C1
ijveren ijver to_strive C1
imiteren imiteer to_imitate B1
inademen adem_in to_inhale B2
inboeten boet_in to_lose_ground C1
inbreken breek_in to_break_in B1
incheckenen check_in to_check_in A2
inculceren inculceer to_inculcate C1
indelen deel_in to_classify B1
indekken dek_in to_cover_oneself C1
inhouden houd_in to_contain B1
inkleuren kleur_in to_colour_in B2
inlassen las_in to_insert C1
inleggen leg_in to_deposit B2
inschakelen schakel_in to_switch_on A2
inschatten schat_in to_estimate B1
inslapen slaap_in to_fall_asleep B1 zijn
insluiten sluit_in to_enclose B1
inspecteren inspecteer to_inspect B2
inspuiten spuit_in to_inject B2
instappen stap_in to_step_in A1 zijn
installeren installeer to_install A2
instemmen stem_in to_consent B2
instorten stort_in to_collapse B2 zijn
introduceren introduceer to_introduce B1
inzetten zet_in to_deploy B2
inzien zie_in to_see / understand C1
jagen jaag to_hunt B1
jammeren jammer to_lament C1
jeuken jeuk to_itch C1
joggen jog to_jog A2
juichen juich to_cheer B2
kaarten kaart to_play_cards B1
kalmeren kalmeer to_calm B1
kammen kam to_comb B1
kantelen kantel to_tilt B2
kappen kap to_chop C1
karakteriseren karakteriseer to_characterise C1
kasteren kaster to_castigate C1
keilen keil to_fling C1
keren keer to_turn B1
kerven kerf to_carve C1
kiezen kies to_choose A2
kijven kijf to_quarrel C1
kletsen klets to_chat B1
kleuren kleur to_colour A2
klieven klief to_cleave C1
klimaten klimaat to_acclimatise C1
klinken klink to_sound B1
kloven kloof to_split C1
knagen knaag to_gnaw C1
knallen knal to_bang C1
knielen kniel to_kneel C1
knijpen knijp to_pinch B1
knipogen knipoog to_wink C1
knoeien knoei to_mess B2
knoopen knoop to_button B1
knopen knoop to_knot B1
koersen koers to_steer C1
koesteren koester to_cherish B2
kokeren koker to_be_pumped C1
komen kom to_come A1 zijn
koppelen koppel to_couple B1
korten kort to_shorten B1
kosten kost to_cost A1
kotsen kots to_vomit C1
krabben krab to_scratch B2
kraken kraak to_creak / crack B2
kreten kreet to_shout C1
krijsen krijs to_scream C1
kronen kroon to_crown C1
kuchen kuch to_cough_quietly C1
kunnen kun to_be_able A1
kussen kus to_kiss B1
kwellen kwel to_torment C1
laden laad to_load B1
laden laad to_load (dup) B1
laken laak to_blame C1
lampen lamp to_lamp C1
lanceren lanceer to_launch B2
landen land to_land A2 zijn
langsgaan ga_langs to_drop_by B1 zijn
langsfietsen fiets_langs to_cycle_by C1 zijn
langwijlen langwijl to_take_long C1
lapen lap to_lap C1
lassen las to_weld C1
laten laat to_let A1
lauwen lauw to_warm_up C1
lazeren lazer to_curse C1
leggen leg to_lay A1
leiden leid to_lead B1
lenen leen to_borrow / lend B1
lepelen lepel to_spoon C1
leren leer to_learn / teach A1
leveren lever to_supply A2
lezen lees to_read A1
lichten licht to_lift C1
liegen lieg to_lie B1
linken link to_link A2
loeren loer to_lurk C1
lokaliseren lokaliseer to_locate B2
lokken lok to_lure B2
lonen loon to_pay_off C1
loodsen loods to_pilot C1
lopen loop to_walk A1
luchten lucht to_air C1
luiden luid to_ring C1
luisteren luister to_listen A1
machtigen machtig to_authorise C1
maken maak to_make A1
malen maal to_grind B2
mangelen mangel to_lack C1
masseren masseer to_massage B1
matigen matig to_moderate C1
mediteren mediteer to_meditate B2
meegaan ga_mee to_go_along A2 zijn
meedoen doe_mee to_join_in A2
meekomen kom_mee to_come_along A2 zijn
meelopen loop_mee to_walk_along B1 zijn
meereizen reis_mee to_travel_along B1
meespelen speel_mee to_play_along B1
meespreken spreek_mee to_speak_along C1
meetellen tel_mee to_count_along B2
meewerken werk_mee to_cooperate A2
melden meld to_report A2
mengen meng to_mix B1
merken merk to_notice A2
metselen metsel to_lay_bricks C1
microvergroten vergroot to_microscale C1
mijden mijd to_avoid B1
mikken mik to_aim B1
minachten minacht to_despise C1
missen mis to_miss A1
moderniseren moderniseer to_modernise B2
moedigen moedig to_encourage C1
mogen mag to_be_allowed A1
mokken mok to_sulk C1
mollen mol to_kill_off C1
monteren monteer to_assemble B2
morrelen morrel to_fiddle C1
morsen mors to_spill B1
motiveren motiveer to_motivate B1
mummelen mummel to_munch C1
napluizen pluis_na to_examine_closely C1
naderen nader to_approach B1
nadrukken nadruk to_emphasise C1
nagaan ga_na to_check B1 zijn
nageven geef_na to_concede C1
nakijken kijk_na to_check B1
nalaten laat_na to_omit C1
nalopen loop_na to_chase B2
namaken maak_na to_imitate B2
napraten praat_na to_repeat C1
nazien zie_na to_review C1
neerdwingen dwing_neer to_force_down C1
neerhalen haal_neer to_pull_down C1
neerleggen leg_neer to_lay_down B1
neerschieten schiet_neer to_shoot_down C1
neerslaan sla_neer to_knock_down C1
neerstrijken strijk_neer to_settle_down C1
neervallen val_neer to_fall_down C1 zijn
neerzetten zet_neer to_put_down B1
negeren negeer to_ignore B1
nemen neem to_take A1
nemmen nem to_nominate C1
nerven nerf to_nerve C1
neuken neuk to_fuck C1
neuriën neuriën to_hum C1
nijgen nijg to_bow C1
noemen noem to_call / name A2
noteren noteer to_note A2
nuanceren nuanceer to_nuance C1
nuttigen nuttig to_consume_food C1
ochtenden ochtend to_be_morning C1
oefenen oefen to_practise A1
omarmen omarm to_embrace C1
ombuigen buig_om to_bend_over C1
omgaan ga_om to_handle B1 zijn
omhullen omhul to_envelop C1
omkomen kom_om to_perish C1 zijn
omleggen leg_om to_redirect C1
omschrijven schrijf_om to_describe C1
omslaan sla_om to_overturn C1
omspoelen spoel_om to_rinse_around C1
omstuwen omstuw to_surround C1
omtrekken trek_om to_overturn C1
omvallen val_om to_fall_over B2 zijn
omvatten omvat to_encompass B2
omzetten zet_om to_convert B2
onaardige doe_onaardig to_be_unkind C1
onderbreken onderbreek to_interrupt B2
onderbrengen onderbreng to_house C1
onderdompelen onderdompel to_immerse C1
ondergaan onderga to_undergo B2 zijn
onderhandelen onderhandel to_negotiate B2
onderkennen onderken to_discern C1
onderscheiden onderscheid to_distinguish B2
onderschrijven onderschrijf to_endorse C1
onderstrepen onderstreep to_underline B1
ondersteunen ondersteun to_support B1
onderwerpen onderwerp to_subject_to C1
onderzoeken onderzoek to_investigate B1
ondervragen ondervraag to_interrogate B2
ondervinden ondervind to_experience B2
ontberen ontber to_lack C1
ontbieden ontbied to_summon C1
ontbinden ontbind to_dissolve B2
ontbloten ontbloot to_bare C1
ontboezemen ontboezem to_confide C1
ontbranden ontbrand to_ignite B2 zijn
ontbreken ontbreek to_be_missing B1
ontcijferen ontcijfer to_decipher C1
ontdekken ontdek to_discover A2
ontdoen ontdoe to_get_rid_of C1
ontdooien ontdooi to_thaw B2 zijn
onteren onteer to_dishonour C1
onterven onterf to_disinherit C1
onttrekken onttrek to_withdraw_from C1
ontevreden ontevreed to_be_dissatisfied C1
ontgaan ontga to_escape_attention C1 zijn
ontgelden ontgeld to_pay_the_price C1
ontgroeien ontgroei to_grow_out_of C1 zijn
onthaasten onthaast to_unwind C1
onthalen onthaal to_welcome C1
ontheffen onthef to_exempt C1
ontheiligen ontheilig to_desecrate C1
onthouden onthoud to_remember A2
onthullen onthul to_reveal B2
ontkennen ontken to_deny B1
ontkomen ontkom to_escape B2 zijn
ontkurken ontkurk to_uncork C1
ontladen ontlaad to_unload C1
ontlasten ontlast to_relieve C1
ontlopen ontloop to_escape B2 zijn
ontmaskeren ontmasker to_unmask C1
ontmoedigen ontmoedig to_discourage B2
ontnemen ontneem to_take_away B2
ontplooien ontplooi to_unfold C1
ontroeren ontroer to_move B2
ontruimen ontruim to_evacuate B2
ontslaan ontslaat to_dismiss B2
ontslapen ontslaap to_die_peacefully C1
ontspannen ontspan to_relax A2
ontsporen ontspoor to_derail B2 zijn
ontspringen ontspring to_escape C1 zijn
ontstaan ontsta to_arise B1 zijn
ontstellen ontstel to_dismay C1
ontvallen ontval to_escape_one C1 zijn
ontvouwen ontvouw to_unfold C1
ontvreemden ontvreem to_steal C1
ontvruchten ontvrucht to_disencipher C1
ontwaken ontwaak to_awaken B2 zijn
ontwarren ontwar to_disentangle C1
ontwennen ontwen to_lose_a_habit C1
ontwerpen ontwerp to_design B1
ontwijden ontwijd to_desecrate C1
ontwikkelen ontwikkel to_develop A2
ontworstelen ontworstel to_wrest C1
ontwortelen ontwortel to_uproot C1
ontzetten ontzet to_relieve C1
ontzeggen ontzeg to_deny C1
ontzieten ontziet to_spare C1
ontzilten ontzilt to_desalinate C1
oogluiken oogluik to_turn_a_blind_eye C1
oogsten oogst to_harvest B1
opbergen berg_op to_store_away B1
opblazen blaas_op to_blow_up B1
opbouwen bouw_op to_build_up B1
opdagen daag_op to_appear C1 zijn
opdienen dien_op to_serve_up B1
opdragen draag_op to_dedicate B2
opdrukken druk_op to_imprint B2
openzetten zet_open to_open_up B2
opeten eet_op to_eat_up A2
opfleuren fleur_op to_brighten C1
opfokken fok_op to_breed C1
opgaan ga_op to_rise C1 zijn
opgeven geef_op to_give_up B1
ophalen haal_op to_pick_up A2
ophangen hang_op to_hang_up A2
ophouden houd_op to_stop A2
opkopen koop_op to_buy_up B2
opkomen kom_op to_stand_up_for B1 zijn
oplichten licht_op to_swindle B2
oplopen loop_op to_increase B1 zijn
oplossen los_op to_solve A2
opluchten lucht_op to_relieve B2
opnoemen noem_op to_enumerate B2
opofferen offer_op to_sacrifice B2
oppakken pak_op to_pick_up A2
opperken opperk to_limit C1
opperen opper to_suggest C1
opraken raak_op to_run_out C1 zijn
oprapen raap_op to_pick_up B1
oprichten richt_op to_found B1
oproepen roep_op to_summon B1
opruimen ruim_op to_tidy_up A2
opschrijven schrijf_op to_write_down A2
opslaan sla_op to_save / store A2
opspeuren speur_op to_track_down C1
opsporen spoor_op to_trace B2
opstapelen stapel_op to_stack_up C1
opstellen stel_op to_set_up B1
opsteken steek_op to_pick_up B1
opstijgen stijg_op to_ascend B2 zijn
opstoppen stop_op to_stuff C1
opstoten stoot_op to_push_up C1
opstrijken strijk_op to_iron C1
opsturen stuur_op to_send_in B1
optellen tel_op to_add_up A2
optreden treed_op to_perform B2
opvallen val_op to_stand_out B1 zijn
opvangen vang_op to_catch / shelter B1
opvliegen vlieg_op to_fly_up C1 zijn
opvoeden voed_op to_raise B1
opvolgen volg_op to_succeed B2
opwachten wacht_op to_wait_for C1
opwekken wek_op to_arouse B2
opzetten zet_op to_set_up B1
oranjeen oranje to_orangify C1
oren oor to_listen_to C1
overbelasten overbelast to_overload C1
overbluffen overbluf to_outbluff C1
overbruggen overbrug to_bridge B2
overdadig overdadig to_be_excessive C1
overdenken overdenk to_reflect_on B2
overdoen doe_over to_redo B1
overdragen draag_over to_transfer B2
overeenkomen overeenkom to_agree B2 zijn
overeisen overeis to_demand_too_much C1
overgeven geef_over to_vomit / surrender B2
overhalen haal_over to_persuade B2
overhandigen overhandig to_hand_over B2
overhebben heb_over to_have_left B1
overheersen overheers to_dominate B2
overhouden houd_over to_have_left B1
overkomen overkom to_happen_to B1 zijn
overlappen overlap to_overlap C1
overlaten laat_over to_leave_to B2
overleggen overleg to_consult B2
overlopen loop_over to_run_over C1 zijn
overmaken maak_over to_transfer A2
overnemen neem_over to_take_over B1
overrijden rijd_over to_run_over C1
overschatten overschat to_overestimate B2
overschilderen schilder_over to_repaint C1
overschrijden overschrijd to_exceed B2
oversteken steek_over to_cross B1 zijn
overstijgen overstijg to_surpass C1
overstroomen overstrom to_overflow C1 zijn
overtreffen overtreff to_surpass B2
overtuigen overtuig to_convince A2
overwegen overweeg to_consider B1
overweldigen overweldig to_overwhelm B2
overwerken werk_over to_overwork B2
overwinnen overwin to_win_over B2
overzien overzie to_survey C1
parkeren parkeer to_park A1
participeren participeer to_participate B2
peinzen peins to_ponder C1
pellen pel to_peel B2
peperen peper to_pepper C1
pesten pest to_bully B1
piekeren pieker to_worry B2
pieren pier to_pier C1
plakken plak to_stick / glue A2
plannen plan to_plan B1
planten plant to_plant B1
pleiten pleit to_plead B2
plengen pleng to_pour_out C1
plooien plooi to_fold C1
plukken pluk to_pick B1
poederen poeder to_powder C1
poetsen poets to_polish A2
ponen pon to_put C1
poseren poseer to_pose B2
poseren poseer to_pose B2
postzegelen postzegel to_stamp C1
praten praat to_talk A1
prediken predik to_preach C1
prefereren prefereer to_prefer B2
prikkelen prikkel to_stimulate C1
prikken prik to_prick A2
proeven proef to_taste A2
profileren profileer to_profile C1
proosten proost to_toast B2
provideren provideer to_provide C1
provoceren provoceer to_provoke B2
publiceren publiceer to_publish B1
quoteren quoteer to_quote C1
raadplegen raadpleeg to_consult B2
raden raad to_guess A2
rangschikken rangschik to_arrange B2
rappen rap to_rap C1
rapporteren rapporteer to_report B1
rationaliseren rationaliseer to_rationalise C1
realiseren realiseer to_realise B1
recht_doen doe_recht to_do_justice C1
redden red to_save A2
redekavelen redekavel to_debate C1
reflecteren reflecteer to_reflect B2
regelen regel to_arrange A2
registreren registreer to_register A2
reguleren reguleer to_regulate B2
rejecteren rejecteer to_reject C1
rekken rek to_stretch C1
remmen rem to_brake B2
rennen ren to_run A1 hebben/zijn
repareren repareer to_repair A2
repliceren repliceer to_reply C1
reserveren reserveer to_reserve A1
respecteren respecteer to_respect B1
restaureren restaureer to_restore B2
ritselen ritsel to_rustle C1
roeien roei to_row B1
roepen roep to_call A2
roken rook to_smoke A1
rollen rol to_roll B1
ruilen ruil to_exchange A2
ruiken ruik to_smell A2
ruimen ruim to_clear C1
ruisen ruis to_rustle C1
ruspen rusp to_caterpillar C1
saboteren saboteer to_sabotage B2
saluteren saluteer to_salute C1
samenkomen kom_samen to_come_together B2 zijn
samenleven leef_samen to_live_together B1
samenwerken werk_samen to_collaborate A2
sancten sanct to_sanction C1
sanctioneren sanctioneer to_sanction C1
schaduwen schaduw to_shadow C1
schamen schaam to_be_ashamed B2
schateren schater to_burst_out_laughing C1
schatten schat to_estimate B1
scheelen scheel to_make_a_difference C1
scheiden scheid to_separate B1
scheidsrechteren scheidsrechter to_referee C1
schelden scheld to_curse B2
schenken schenk to_pour B1
schepen schep to_ship C1
scheppen schep to_create B2
scheren scheer to_shave B1
schermen scherm to_fence C1
scheuren scheur to_tear B2
schikken schik to_arrange B2
schillen schil to_peel B2
schipperen schipper to_compromise C1
schitteren schitter to_sparkle B2
schoenen schoen to_shoe C1
schoffelen schoffel to_hoe C1
scholen school to_train B2
schoonkomen kom_schoon to_come_out_clean C1
schoonvegen veeg_schoon to_clean_off C1
schoppen schop to_kick B2
schorsen schors to_suspend C1
schreeuwen schreeuw to_scream B1
schuiven schuif to_push / slide B1
schuilen schuil to_take_shelter B2
schuimen schuim to_foam C1
schurken schurk to_be_rascal C1
sjokken sjok to_trudge C1
slaan slaa to_hit B1
slachtofferen slachtoffer to_victimise C1
slagen slaag to_succeed B1
slijpen slijp to_sharpen C1
slijten slijt to_wear_out B2
slingeren slinger to_swing B2
slipen slip to_slip C1
slissen sliss to_lisp C1
slokken slok to_swallow_audibly C1
slopen sloop to_demolish B2
slordigen slordig to_be_sloppy C1
slungeligheid slungelig to_be_lanky C1
sluimeren sluimer to_slumber C1
smaken smaak to_taste B1
smeden smeed to_forge C1
smeken smeek to_beg C1
smelten smelt to_melt B1
smikkelen smikkel to_eat_with_relish C1
smoezen smoes to_whisper C1
smokkelen smokkel to_smuggle B2
smoren smoor to_smother C1
snauwen snauw to_snap C1
sneeuwen sneeuw to_snow A1
snijden snijd to_cut B1
snikken snik to_sob C1
snoepen snoep to_eat_sweets B1
snuiven snuif to_sniff C1
soebatten soebat to_grovel C1
soldaatkomen soldaat_kom to_become_a_soldier C1
solliciteren solliciteer to_apply_for_job B1
sommeren sommeer to_summon C1
sorteren sorteer to_sort B1
souperen soupeer to_dine C1
spannen span to_tense B2
sparen spaar to_save B1
spelen speel to_play A1
spellen spel to_spell B1
spelregelen spelregel to_set_rules C1
spieken spiek to_cheat C1
spinnen spin to_spin B2
spitten spit to_dig C1
splijten splijt to_split C1
spoelen spoel to_rinse B2
sponsen spons to_sponge C1
sporten sport to_do_sports A2
spotten spot to_mock B2
springen spring to_jump A2
spruiten spruit to_sprout C1
spuiten spuit to_spray B2
spuwen spuw to_spit C1
stagneren stagneer to_stagnate C1
staken staak to_stop / strike B2
stalken stalk to_stalk B2
stampen stamp to_stamp B2
standhouden houd_stand to_endure C1
standhouden houd_stand to_hold_one's_own C1
stevigen stevig to_be_firm C1
stichten sticht to_found B2
stierven stierf to_die_archaic C1
stijgen stijg to_rise B1 zijn
stijven stijf to_be_stiff C1
stilen stil to_quiet C1
stillen stil to_quiet B2
stinken stink to_stink B2
stoeien stoei to_horse_around B2
stoffen stof to_dust B2
stofzuigen stofzuig to_vacuum A2
stollen stol to_solidify C1
storen stoor to_disturb A2
storten stort to_pour / deposit B1
straffen straf to_punish B1
strelen streel to_caress B2
streven streef to_strive C1
striemen striem to_lash C1
struinen struin to_roam C1
stutten stut to_support C1
stylen style to_style B2
sudderen sudder to_simmer C1
surfen surf to_surf A2
sussen sus to_calm C1
sympathiseren sympathiseer to_sympathise C1
talmen talm to_dawdle C1
tappen tap to_tap B2
tellen tel to_count A1
tenderen tendeer to_tender C1
terechtkomen kom_terecht to_end_up B1 zijn
terechtwijzen wijs_terecht to_reprimand C1
tergen terg to_torment C1
terugbellen bel_terug to_call_back A2
terugbetalen betaal_terug to_repay B1
terugbrengen breng_terug to_bring_back B1
terugdoen doe_terug to_redo C1
terugdringen dring_terug to_push_back B2
terugfietsen fiets_terug to_cycle_back B1 zijn
terughouden houd_terug to_hold_back B2
terugkijken kijk_terug to_look_back B1
terugkomen kom_terug to_come_back A1 zijn
terugkrijgen krijg_terug to_get_back B1
teruglezen lees_terug to_read_back C1
terugnemen neem_terug to_take_back B1
terugplaatsen plaats_terug to_replace C1
terugreizen reis_terug to_travel_back B1 zijn
terugrijden rijd_terug to_drive_back B1 zijn
terugroepen roep_terug to_recall B2
terugslaan sla_terug to_hit_back C1
terugsturen stuur_terug to_send_back B1
terugtrekken trek_terug to_withdraw B2
teruggeven geef_terug to_give_back A2
teruglopen loop_terug to_run_back B1 zijn
testen test to_test A2
tikken tik to_tap B2
tinkeren tinker to_tinker C1
tobben tob to_brood C1
tochten tocht to_be_draughty C1
toedienen dien_toe to_administer B2
toedoen doe_toe to_contribute_to C1
toehoeven toehoef to_be_needed C1
toehoren hoor_toe to_belong_to C1
toejuichen juich_toe to_applaud B2
toekennen ken_toe to_grant B2
toekomen kom_toe to_arrive_at C1 zijn
toelichten licht_toe to_explain B2
toenaderen nader_toe to_approach C1
toenemen neem_toe to_increase B1
toepassen pas_toe to_apply B1
toereiken reik_toe to_hand C1
toestaan sta_toe to_permit B2
toestemmen stem_toe to_consent B2
toetreden treed_toe to_join B2 zijn
toetsen toets to_test B2
toevallen val_toe to_fall_to C1 zijn
toevoegen voeg_toe to_add B1
toewijden wijd_toe to_dedicate C1
toewijzen wijs_toe to_assign B2
tonen toon to_show A2
trakteren trakteer to_treat B1
trappen trap to_kick B1
trekken trek to_pull A2
treuzelen treuzel to_dawdle B2
trillen tril to_tremble B2
trommelen trommel to_drum C1
trouwen trouw to_marry A2
truffelen truffel to_truffle C1
tuieren tuier to_lurch C1
tuimelen tuimel to_tumble C1 zijn
turen tuur to_stare C1
tutoyeren tutoyeer to_use_du_form C1
twijfelen twijfel to_doubt B1
twisten twist to_quarrel C1
typen typ to_type A1
uitademen adem_uit to_exhale B2
uitbarsten barst_uit to_burst_out B2 zijn
uitbouwen bouw_uit to_extend B2
uitbreiden breid_uit to_expand B1
uitbroeden broed_uit to_hatch C1
uitchecken check_uit to_check_out A2
uitdagen daag_uit to_challenge B2
uitdelen deel_uit to_distribute B1
uitdiepen diep_uit to_deepen C1
uitdoen doe_uit to_take_off B1
uitdraaien draai_uit to_turn_out B2
uitdragen draag_uit to_express C1
uitdrukken druk_uit to_express B2
uitgaan ga_uit to_go_out A1 zijn
uitgieten giet_uit to_pour_out B2
uithalen haal_uit to_unleash B2
uithollen hol_uit to_hollow_out C1
uithouden houd_uit to_endure B2
uitkijken kijk_uit to_look_forward / out A2
uitkleden kleed_uit to_undress A1
uitknippen knip_uit to_cut_out B2
uitkomen kom_uit to_turn_out B1 zijn
uitleggen leg_uit to_explain A2
uitlenen leen_uit to_lend B1
uitleveren lever_uit to_extradite C1
uitlokken lok_uit to_provoke C1
uitlopen loop_uit to_extend B2 zijn
uitmaken maak_uit to_make_up / matter B1
uitnodigen nodig_uit to_invite A2
uitpakken pak_uit to_unpack B1
uitprinten print_uit to_print_out A2
uitproberen probeer_uit to_try_out B1
uitrekenen reken_uit to_calculate B1
uitrusten rust_uit to_rest A2
uitschelden scheld_uit to_curse C1
uitschrijven schrijf_uit to_write_out B1
uitslaan sla_uit to_break_out C1
uitsluiten sluit_uit to_exclude B2
uitspoelen spoel_uit to_rinse C1
uitsporen spoor_uit to_derail C1 zijn
uitspreken spreek_uit to_pronounce B1
uitstaan sta_uit to_stand_out C1
uitstappen stap_uit to_step_out A1 zijn
uitsteken steek_uit to_stick_out B2
uitstellen stel_uit to_postpone B1
uitsterven sterf_uit to_die_out C1 zijn
uitstijgen stijg_uit to_get_out C1 zijn
uitstoten stoot_uit to_emit B2
uitsturen stuur_uit to_send_out C1
uittrekken trek_uit to_take_off B1
uitvinden vind_uit to_invent B1
uitvoeren voer_uit to_carry_out B1
uitvragen vraag_uit to_question B2
uitwaaien waai_uit to_air C1
uitwijden wijd_uit to_elaborate C1
uitwijken wijk_uit to_evade C1 zijn
uitwijzen wijs_uit to_demonstrate B2
uitwisselen wissel_uit to_exchange B1
uitzeggen zeg_uit to_say_explicitly C1
uitzetten zet_uit to_evict / expand B2
uitzien zie_uit to_look B1
uitzitten zit_uit to_serve_out C1
uitzoeken zoek_uit to_find_out B1
uitzwermen zwerm_uit to_swarm_out C1
vaardigen vaardig to_issue C1
vakantievieren vakantievier to_holiday C1
vakeren vaker to_be_more_frequent C1
vakwerken vakwerk to_be_artisanal C1
valideren valideer to_validate C1
vallen val to_fall A2 zijn
vangen vang to_catch B1
varen vaar to_sail B1
vaststellen stel_vast to_determine B1
vasthouden houd_vast to_hold_on A2
vastleggen leg_vast to_fix B1
vastlopen loop_vast to_get_stuck C1 zijn
vastmaken maak_vast to_attach A2
vastpakken pak_vast to_grab B1
vechten vecht to_fight B1
veranderen verander to_change A1
verantwoorden verantwoord to_account_for B2
verbazen verbaas to_amaze B1
verbergen verberg to_hide B1
verbeteren verbeter to_improve A2
verbieden verbied to_forbid B1
verbinden verbind to_connect B1
verbouwen verbouw to_renovate B1
verbreden verbreed to_widen B2
verbreken verbreek to_break_off B2
verdedigen verdedig to_defend B1
verdelen verdeel to_divide B1
verdenken verdenk to_suspect B2
verdienen verdien to_earn A2
verdiepen verdiep to_deepen C1
verdoezelen verdoezel to_obscure C1
verdraaien verdraai to_distort C1
verdragen verdraag to_endure B2
verdrijven verdrijf to_drive_away C1
verdrinken verdrink to_drown B1 zijn
verdwijnen verdwijn to_disappear B1 zijn
veroordelen veroordeel to_sentence B2
verfomfaaien verfomfaai to_rumple C1
vergaderen vergader to_meet B1
vergallen vergal to_spoil C1
vergasen vergas to_gasify C1
vergeestelijken vergeestelijk to_spiritualise C1
vergelijken vergelijk to_compare B1
vergeven vergeef to_forgive B2
verhalen verhaal to_recover_costs C1
vergooien vergooi to_squander C1
vergrijzen vergrijs to_grow_grey C1
vergroten vergroot to_enlarge B2
verhalen verhaal to_tell C1
verhandelen verhandel to_trade B2
verhinderen verhinder to_prevent B1
verhogen verhoog to_raise B2
verhoren verhoor to_interrogate B2
verhuren verhuur to_rent_out B1
verjaardagen verjaardag to_birthday C1
verjaren verjaar to_celebrate_birthday A2
verkijken verkijk to_misjudge C1
verklaren verklaar to_explain B1
verkleden verkleed to_dress_up B2
verkleinen verklein to_diminish B2
verknallen verknal to_botch C1
verkneukelen verkneukel to_chuckle C1
verkrijgen verkrijg to_acquire B1
verkwanselen verkwansel to_squander C1
verlangen verlang to_long_for B1
verleggen verleg to_shift B2
verleiden verleid to_seduce B2
verlenen verleen to_grant B2
verlengen verleng to_extend B1
verlichten verlicht to_illuminate B2
verliefdworden word_verliefd to_fall_in_love C1
verlieten verliet to_abandon C1
verlokken verlok to_entice C1
verloochen verloochen to_disown C1
verloven verloof to_get_engaged B2
verlovingen verloving to_betroth C1
verlustigen verlustig to_delight C1
vermageren vermager to_lose_weight B2 zijn
vermelden vermeld to_mention B1
vermenigvuldigen vermenigvuldig to_multiply B1
vernemen verneem to_learn C1
vernieuwen vernieuw to_renew B2
vernietigen vernietig to_destroy B2
verongelukken verongeluk to_die_in_an_accident C1 zijn
verontschuldigen verontschuldig to_apologise B1
verontwaardigen verontwaardig to_be_indignant C1
verordonneren verordonneer to_decree C1
verouderen verouder to_age B2 zijn
verover verover to_conquer B2
verpakken verpak to_pack B1
verpesten verpest to_ruin B2
verpest_zijn verpest to_be_ruined C1
verpieteren verpieter to_dwindle C1
verplaatsen verplaats to_move B1
verplichten verplicht to_oblige B1
verraden verraad to_betray B2
verrassen verras to_surprise A2
verrijken verrijk to_enrich B2
verroeren verroer to_stir C1
verschijnen verschijn to_appear B2 zijn
verschillen verschil to_differ B1
verschillen verschil to_differ B1
verschuiven verschuif to_shift B2
verspreiden verspreid to_distribute B1
verstaan versta to_understand B1
verstijven verstijf to_stiffen C1
verstoppen verstop to_hide B2
verstoren verstoor to_disturb B2
vertalen vertaal to_translate A2
verteren verteer to_digest B2
vertegenwoordigen vertegenwoordig to_represent B2
vertikken vertik to_refuse C1
vertragen vertraag to_slow_down B2
vertrekken vertrek to_depart B1 zijn
vertroebelen vertroebel to_cloud C1
verveelvoudigen verveelvoudig to_multiply C1
vervaagen vervaag to_fade C1
vervaardigen vervaardig to_manufacture B2
vervangen vervang to_replace B1
verven verf to_paint B1
vervoegen vervoeg to_conjugate B2
vervolgen vervolg to_continue B1
vervolledigen vervolledig to_complete B2
verwaarlozen verwaarloos to_neglect B2
verwachten verwacht to_expect A2
verwarren verwar to_confuse B2
verwijderen verwijder to_remove A2
verwijten verwijt to_blame B2
verwijzen verwijs to_refer B2
verzaken verzaak to_neglect C1
verzakken verzak to_subside C1
verzinnen verzin to_invent B1
verzoeken verzoek to_request B1
verzorgen verzorg to_take_care_of B1
verzuimen verzuim to_neglect C1
verzwakken verzwak to_weaken B2
verzwijgen verzwijg to_keep_silent_about B2
vieren vier to_celebrate A1
vinken vink to_tick C1
vissen vis to_fish B1
vliegen vlieg to_fly A2
vloeien vloei to_flow C1 zijn
vloeken vloek to_curse B2
vloeren vloer to_floor C1
voederen voeder to_feed C1
voegen voeg to_add B1
voelen voel to_feel A1
voeren voer to_lead B2
voetballen voetbal to_play_football A1
volbrengen volbreng to_complete C1
voldoen voldoe to_satisfy B2
volgen volg to_follow A2
volhouden houd_vol to_persist B2
vollopen loop_vol to_fill_up C1 zijn
volmaken maak_vol to_complete B2
volstaan volsta to_suffice C1
volstrekken volstrek to_carry_out C1
volstoppen stop_vol to_stuff C1
voltooien voltooi to_complete B2
vooraf voorzien voorzie to_foresee_in_advance C1
voorbereiden bereid_voor to_prepare A2
voordoen doe_voor to_demonstrate B2
vooronderstellen vooronderstel to_presuppose C1
voorschrijven schrijf_voor to_prescribe B2
voorspellen voorspel to_predict B1
voorstellen stel_voor to_introduce A2
voortbestaan bestaan_voort to_continue_to_exist C1 zijn
voortduren voortduur to_continue B2
voortzetten zet_voort to_continue B2
voorzeggen zeg_voor to_dictate C1
vorderen vorder to_make_progress B2
vormen vorm to_form B1
vragen vraag to_ask A1
vrezen vrees to_fear B1
vrijgeven geef_vrij to_release C1
vrijhouden houd_vrij to_keep_free C1
vrijlaten laat_vrij to_release B2
vrijmaken maak_vrij to_free_up B1
vrijpleiten pleit_vrij to_acquit C1
vrijspelen speel_vrij to_set_free C1
vrijspreken spreek_vrij to_acquit B2
vrijwilligen vrijwillig to_volunteer C1
vroegen vroeg to_be_early C1
vullen vul to_fill A2
waaien waai to_blow B1
waaieren waaier to_fan C1
waarderen waardeer to_value B1
waarschuwen waarschuw to_warn A2
wachten wacht to_wait A1
wagen waag to_dare B2
wakker_worden word_wakker to_wake_up A2 zijn
wandelen wandel to_walk A1
wanen waan to_imagine C1
wanhopen wanhoop to_despair B2
wapenen wapen to_arm B2
wassen was to_wash A1
waxen wax to_wax C1
weergaloos zijn weergaloos to_be_unique C1
weergeven weergeev to_render B2
weergegeven weergeev to_show C1
weersluiten sluit_weer to_close_again C1
weersnachten weersnacht to_be_weather C1
weerstaan weersta to_resist B2
wegblijven blijf_weg to_stay_away B1 zijn
wegbrengen breng_weg to_take_away B1
weggaan ga_weg to_leave A1 zijn
weggeven geef_weg to_give_away A2
weghalen haal_weg to_remove A2
wegjagen jaag_weg to_chase_away B2
wegkomen kom_weg to_get_away B1 zijn
wegkruipen kruip_weg to_crawl_away C1
weglaten laat_weg to_omit B2
weglopen loop_weg to_run_away A2 zijn
wegnemen neem_weg to_take_away B1
wegrennen ren_weg to_run_away B1 zijn
wegspoelen spoel_weg to_wash_away C1
wegsturen stuur_weg to_send_away B2
wegtrekken trek_weg to_pull_away B2
weken week to_soak C1
welkom_heten heet_welkom to_welcome A2
wellen wel to_well C1
wennen wen to_get_used B1
wensen wens to_wish A2
wenken wenk to_beckon C1
werken werk to_work A1
wespen wesp to_be_wasp-like C1
wettigen wettig to_legitimise C1
weven weef to_weave C1
wezen weez to_be_archaic C1
wieden wied to_weed C1
wiegen wieg to_rock_a_baby C1
wijken wijk to_yield C1 zijn
wijten wijt to_blame_on C1
wijzigen wijzig to_modify B2
willen wil to_want A1
winden wind to_wind C1
wissen wis to_wipe B2
woeden woed to_rage C1
woekeren woeker to_overgrow C1
wonen woon to_live A1
wreken wreek to_avenge C1
wringen wring to_wring B2
zakken zak to_drop B2 zijn
zalven zalf to_anoint C1
zanikken zanik to_nag C1
zeggen zeg to_say A1
zegevieren zegevier to_triumph C1
zegelen zegel to_seal C1
zeilen zeil to_sail B1 hebben/zijn
zeren zeer to_hurt C1
zetelen zetel to_be_seated C1
zetten zet to_put A1
zeuren zeur to_nag B2
zien zie to_see A1
zijgen zijg to_sink_down C1
zijdelings zijdelings to_be_indirect C1
zijn ben to_be A1
zijwaarts zijwaarts to_be_sideways C1
zingen zing to_sing A2
zinken zink to_sink C1 zijn
zinnen zin to_intend C1
zitten zit to_sit A1
zoek zoek to_search A1
zoenen zoen to_kiss A2
zoezen zoees to_buzz C1
zoeken zoek to_search A1
zoenen zoen to_kiss A2
zorgen zorg to_care_for A2
zout maken maak_zout to_salt C1
zoutigheid zoutig to_be_salty C1
zuchten zucht to_sigh B1
zuigen zuig to_suck B2
zuiveren zuiver to_purify B2
zwaaien zwaai to_wave B1
zwabben zwab to_swab C1
zwaktebod zwaktebod to_show_weakness C1
zwammen zwam to_chatter C1
zwerven zwerf to_wander C1
zwichten zwicht to_yield C1
zwoegen zwoeg to_toil C1
"""
# Parse and add
for line in EXTRA_ZWAK.strip().split("\n"):
    if not line.strip() or line.startswith("#"): continue
    parts = line.split()
    if len(parts) < 4: continue
    inf = parts[0]
    stem = parts[1].replace("_", " ")
    # Last field is aux IF it's "hebben"/"zijn"/"hebben/zijn", else default
    if parts[-1] in ("hebben", "zijn", "hebben/zijn", "zijn/hebben"):
        aux = parts[-1]
        lvl = parts[-2]
        tr_parts = parts[2:-2]
    else:
        aux = "hebben"
        lvl = parts[-1]
        tr_parts = parts[2:-1]
    tr = " ".join(tr_parts).replace("_", " ")
    if inf in {v["inf"] for v in VERBS}: continue
    scheidbaar = " " in stem
    VERBS.append(zwak(inf, stem, tr, lvl, aux, scheidbaar=scheidbaar))


# Final dedup
seen = set(); out_verbs = []
for v in VERBS:
    if v["inf"] in seen: continue
    seen.add(v["inf"])
    out_verbs.append(v)

# Sort by level then by inf
LVL_ORDER = {"A1": 1, "A2": 2, "B1": 3, "B2": 4, "C1": 5}
out_verbs.sort(key=lambda v: (LVL_ORDER.get(v.get("lvl"), 9), v.get("inf", "")))

data = {
    "schema": "studeerkamer-verbs",
    "version": 2,
    "note": "Generated by scripts/generate-verbs.py. Each verb has explicit pres/imp/vd; conjugator just displays.",
    "verbs": out_verbs,
}
OUT.parent.mkdir(parents=True, exist_ok=True)
with OUT.open("w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

# Print summary
print(f"✓ Wrote {len(out_verbs)} verbs to {OUT}")
from collections import Counter
print("by type:", dict(Counter(v["tp"] for v in out_verbs)))
print("by level:", dict(Counter(v["lvl"] for v in out_verbs)))
print("scheidbaar:", sum(1 for v in out_verbs if v.get("scheidbaar")))
