"""Level settings (META level = 'B2' | 'C1'): speaking pace, gap between turns, card length, iCloud folder, file prefix."""
LEVELS = {
    'B2': dict(rate='0%',  gap=0.4,  card_len=4.0, folder='B2', epdir='b2'),   # natural speed, 1-2 cards per sentence (~200-280 cards / 25 min)
    'C1': dict(rate='+6%', gap=0.3,  card_len=4.6, folder='C1', epdir='c1'),   # natural-to-brisk, fewer but harder cards (~90-140 cards / 25 min), longer turns
}
ICLOUD = '~/Library/Mobile Documents/com~apple~CloudDocs/DutchVideos'
DISCLAIMER = ("Privé leermateriaal. Gebaseerd op de Jurassic Park/Jurassic World-films (Universal Pictures, Amblin Entertainment). "
              "Personages en verhaal © hun rechthebbenden. Niet voor verspreiding.")
