"""Script DSL for an episode.  script_data.py does `from dsl import *` and calls these in order; the engine reads SEQ/BOARDS/META.
Text markup (all item types):
  {word|g|English}    vocab card. g = m (blue stripe) | f (red) | x (gold, phrase/adjective/other). Include the article in the word for nouns.
  [[imgkey]]          switch photo (key in imgmap.IMG) at the next word.
  [[+]]               (explain only) reveal the next board group at the next word.
  «french»            (explain/atoi prompt only) a French run inside English text; spoken slowly, shown in yellow. «x»² = said twice.
Board line markup: <s>subject</s> blue, <v>verb</v> orange, <e>ending</e> green, <m>masc</m> blue, <f>fem</f> red, <w>chalk white</w>, <y>yellow</y>.
Board lines: a line starting with '#' is a small annotation, '+' attaches the line to the previous group, any other line starts a new group.
Each [[+]] reveals one group."""
import re
SEQ = []; BOARDS = {}; META = {}; SSML_ALIAS = {}
_scenes = {}; _cur = [None]

def meta(**k): META.update(k)
def chapter(title, cast, bg=None, id=None):
    """A scene/section header chip + the cast of busts shown (max 3) + the starting photo."""
    SEQ.append(dict(kind='chapter', title=title, cast=list(cast), bg=bg)); _cur[0] = id
    if id: _scenes[id] = dict(title=title, cast=list(cast), bg=bg, items=[])
def fr(who, text, en):
    """A French line (slow voice). en = English translation shown under the French."""
    it = dict(kind='fr', who=who, text=text, en=en); SEQ.append(it)
    if _cur[0]: _scenes[_cur[0]]['items'].append(it)
def explain(who, text, board=None):
    """English explanation by a multilingual character, with French runs in «guillemets». board = id from board()."""
    SEQ.append(dict(kind='explain', who=who, text=text, board=board))
def atoi(prompt, answer, who='ellie', img=None):
    """À toi ! English prompt (Ellie), 4 s silence + countdown, French answer twice (answer: plain French)."""
    SEQ.append(dict(kind='atoi', who=who, prompt=prompt, answer=answer, img=img))
def board(id, title, lines): BOARDS[id] = dict(title=title, lines=lines)
def replay(id, title='Encore une fois !'):
    """Replays every `fr` line of scene `id` (French only, no cards, no English) under a new chapter chip."""
    sc = _scenes[id]; SEQ.append(dict(kind='chapter', title=title, cast=sc['cast'], bg=sc['bg'], replay=True))
    for it in sc['items']:
        t = re.sub(r'\{([^{}|]*)\|[^{}|]*\|[^{}]*\}', r'\1', it['text'])
        SEQ.append(dict(kind='fr', who=it['who'], text=t, en=it['en'], replay=True))
