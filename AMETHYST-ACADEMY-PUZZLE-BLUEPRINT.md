# Amethyst Crescent Academy — The Grand Mystery
Status: design blueprint; not yet wired into gameplay. Preserve all existing puzzles, birthday locks, chapter unlocks, and browser saves until each replacement is tested.

## Principle
Every puzzle must emerge naturally from the room: its objects, characters, symbols, and story. Solving a room earns a **Crescent Sigil**, a unique symbol and a fragment of a final sentence. Players cannot lose an earned sigil. The final challenge combines clues from every room, not a guessed password.

## Existing Poetry Vault chapters
1. **Heart Chamber — Heart Sigil (❤️)**: A black-to-red enchanted heart and four love letters. Arrange the letters by the emotional arc in the room's poetry; reveal the heart sigil and a word fragment. Keep the existing chapter puzzle as the actual gate until the themed mechanic is implemented.
2. **Shattered Mirror — Reflection Sigil (🪞)**: Rotate mirror shards to reveal a coherent reflection and hidden phrase. Existing mirror chapter completion remains the unlock source.
3. **Midnight Labyrinth — Moon Sigil (🌙)**: Follow constellation and owl clues to find the correct path through the maze. Existing labyrinth chapter completion remains authoritative.
4. **Door to Tomorrow — Dawn Sigil (🌅)**: Align dawnlight through stained glass to reveal a hopeful phrase. Existing dawn chapter completion remains authoritative.
5. **Keepers' Hall — Owl Sigil (🦉)**: Interpret the four completed chapters in the correct story sequence. The existing all-chapters requirement stays intact.
6. **Amethyst Gateway (current Fifth Door) — Amethyst Sigil (🔮)**: Set the existing four seals into the correct arrangement. Keep the original seal and Fifth Door checks.
7. **Author's Study — The Grand Crescent Puzzle (👑)**: Place every earned sigil into a crescent-shaped mechanism and connect each fragment to the corresponding room. The sequence tells one story: love → reflection → night → dawn → remembrance → transformation. The conclusion reveals the academy's final message, without bypassing the existing author's birthday lock or Bre Pass.

## Five fantasy realms (future content; not implemented)
- **Enchanted Kingdom**: Repair a royal crest and distinguish true from false enchanted hearts.
- **Court of Champions**: A basketball court puzzle using passing routes and teamwork.
- **Kingdom of Forgotten Toys**: Reunite toys with their memories and match meaningful details.
- **Moonfang Forest**: Follow wolf tracks, moon phases, and forest sounds.
- **Celestial Observatory**: Align planets and constellations to open a star map.

Each fantasy realm eventually grants one **Realm Star**. The Grand Crescent Puzzle should have a core ending for the original Poetry Vault and an expanded optional ending for all five Realm Stars. This avoids blocking original visitors while realms are under construction.

## Implementation safety
- Existing source-of-truth for chapter completion remains vault-society.js; never unlock by writing arbitrary values.
- Save newly earned cosmetic sigils under a separate versioned key, and derive eligibility from existing completion records.
- Never expose the final answer in an accessible HTML data attribute or plain text before the puzzle is unlocked.
- Provide keyboard controls, text alternatives, hints, and reduced-motion support.
- Test reload/resume, fresh visitor, completed visitor, mobile, and locked-route scenarios before merging.
