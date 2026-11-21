# Languages – learning repo

Personal language-learning tools and material: `nederlands/` (Dutch, level B1+/B2-, goal B2+ and eventually C1 listening), `francais/` (French, A1), `english/`, `tamil/`.

## Agents (`.claude/agents/`)
- **`nl-luistervideo`**: makes long (15+ min) Dutch listening-training videos for the gym on iPhone.
  - Use it for any "make a Dutch video about X" request.
  - Format: a two-person Q&A dialogue (Ashok from the place, Christine from Belgium).
  - Sources: real Wikimedia Commons photos matched to what is said, Azure nl-BE voices, cartoon speakers with lip sync, and karaoke subtitles.
  - Learning layer: dense vocabulary and phrase pop-up cards at B2-stretch level.
  - Output: 720p encode copied to iCloud Drive → `LeerVideos/`.
  - Reference implementation: `nederlands/kulithalai-video/`. The agent file holds the full spec plus its Learnings.
- **`fr-jurassic-video`**: makes one episode of the private French A1→A2 series « Français Jurassique », in which Jurassic Park / Jurassic World characters (cartoon) teach grammar.
  - Format: slow French, blackboard grammar in English, « À toi ! » speaking pauses, and French + English subtitles.
  - Each episode also gets a cumulative "listen" companion (conversations only).
  - Everything lives in `francais/jurassic-serie/`:
    - `SERIES.md`: the concept.
    - `LESSON_PLAN.md`: all 12 episodes and the voice table.
    - `ENGINE.md` plus the engine code.
    - `episodes/epNN-slug/`: the episodes.
  - Output: iCloud Drive → `FrenchVideos/A1/` (ep 1–6) and `FrenchVideos/A2/` (ep 7–12).
- **`unreal-metahuman-video`**: MetaHuman/Unreal Engine route (verified setup, but the look was rejected as not cinematic enough). Keep for reference.

## Conventions
- Video work lives in `nederlands/<topic>-video/` or `francais/<topic>-video/`. These folders are git-ignored (large media, venvs, node_modules).
- Secrets live in `.secrets/` (git-ignored). The Azure TTS key is `.secrets/azuretts-key`, region `francecentral`. Read it only inside scripts, and never print it or copy it.
- Use Sonnet subagents for generation work.
- Personal tools are standalone HTML (double-click `index.html`, no server).
