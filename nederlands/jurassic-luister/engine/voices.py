"""Fixed voice table for « Jurassic Luisteren » (Dutch B2/C1 series). Pure Python (importable from the Azure venv).
Native Dutch voices speak plainly; MULTILINGUAL voices speak Dutch through <lang xml:lang="nl-NL"> (slight foreign accent = fitting for American/Scottish characters).
All voices were tested 2026-11-21: every one emits viseme + word-boundary events with Dutch text."""
VOICE = {
    'ashok':   'nl-BE-ArnaudNeural',                 # fixed: lives in Flanders
    'claire':  'nl-BE-DenaNeural',
    'ellie':   'nl-NL-FennaNeural',
    'owen':    'nl-NL-MaartenNeural',
    'alan':    'en-US-AndrewMultilingualNeural',     # American, gruff
    'malcolm': 'en-US-BrianMultilingualNeural',      # American, ironic
    'hammond': 'en-GB-OllieMultilingualNeural',      # British/Scottish-ish, warm old host
}
SPARE = ['nl-NL-ColetteNeural', 'en-AU-WilliamMultilingualNeural', 'de-DE-FlorianMultilingualNeural']   # tested, free for extra characters
MULTILINGUAL = {'alan', 'malcolm', 'hammond'}
LOCALE = {'ashok': 'nl-BE', 'claire': 'nl-BE'}   # xml:lang for the <speak>/<lang> element; default nl-NL
