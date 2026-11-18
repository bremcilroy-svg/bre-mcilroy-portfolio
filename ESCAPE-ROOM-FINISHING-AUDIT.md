# Poetry Vault escape-room finishing audit

Development branch: `phase-19-2-connected-castle`. Do not merge to main without owner approval.

## Verified by source inspection

- Four chapter routes and save normalizers are connected in `vault-journey.js`: Heart, Mirror, Labyrinth, Dawn. The first incomplete chapter is authoritative, so later saved chapters cannot skip an earlier unfinished chapter.
- `vault-society.js` derives earned seals from **both** completed chapters and collected bookmark keepsakes. The Fifth Door requires all four.
- `vault-fifth-door.js` has three puzzle stages (ordered seals, constellation dials, ordered words), a completion epilogue, and a certificate download. Stage four records `society.fifth`.
- `vault-author-state.js` only allows Author's Room access when all four chapters are complete, all four seals are earned, and the Fifth Door has been completed.
- `vault-walkable-doors.js` implements three four-digit locks for chapter-to-chapter passage and listens for castle-map door requests.
- `academy-keepers-hall.js` is described in source as **cosmetic exploration**, not a replacement for chapter puzzles.

## Repair made during audit

- Fifth Door now reloads its saved puzzle state when the page is restored from browser history / page cache, and malformed storage resets the in-memory puzzle state to a safe initial state instead of retaining stale progress. No chapter or gate requirements changed.

## Phase 2: Sequential door gate repair\n\n- Castle map and Castle Passage now require **all** preceding chapters to be completed for entry into Mirror, Labyrinth, and Dawn, not just the immediately preceding chapter. This prevents a later chapter's old save from bypassing a reset earlier chapter.\n- Physical door locks now check the same full prerequisite chain.\n- Removed unreachable duplicate Castle Passage click interception; shared `pv192:door-request` remains the single passage-lock integration.\n- No chapter saves or lock codes were changed. Browser testing remains pending.\n\n## Follow-up work before calling the escape rooms finished

1. **Chapter playthroughs:** Verify Heart → Mirror → Labyrinth → Dawn with fresh saves and with partially completed saves; inspect puzzle interactions and actual completion writes.
2. **Door transitions:** Test each physical exit and castle-map passage on desktop and mobile, including incorrect lock codes, already-unlocked session doors, and resetting a chapter. The Castle Passage click handler in `vault-walkable-doors.js` currently contains an early return that makes its subsequent fallback logic unreachable; verify the separate shared door-request integration before changing it.
3. **Society and Fifth Door:** Test missing bookmarks, all bookmarks, puzzle reset, refresh after each stage, and access to the Author's Room.
4. **Author's Study:** Test birthday lock 0913, birthday calendar, owl Bre Pass, Gizmo companion, clock, and saved discoveries. Inspect linked scripts and missing media dependencies.
5. **Quality assurance:** Check keyboard focus, mobile layout, back/forward navigation, broken links, and missing audio/image assets.
6. **Release:** Only after browser playthroughs pass and the owner approves, merge to main and verify GitHub Pages deployment.

## Status boundaries

This is a source-level audit, **not** an end-to-end browser test. Do not mark chapters or rooms as fully finished based only on the presence of scripts. Preserve all existing saves, chapter gates, birthday lock, and owner login.
