# Poetry Vault — final release test plan

**Status:** NOT YET TESTED IN A BROWSER. This is a reproducible QA plan, not a claim that tests passed.

**Branch:** `phase-19-2-connected-castle`. Do not merge to `main` without owner approval.

## Before testing

- Use a desktop browser and an Android/mobile browser.
- Start in a **new browser profile** for fresh-save testing. Use a separate profile with existing saves for resume testing. **Do not clear the owner's saved progress.**
- Open the browser console; record errors, broken assets, and failing actions with screenshots.
- Test pointer/touch, keyboard Tab/Enter/Space, and back/forward navigation.

## 1. Entrance and chapter sequence

- [ ] `poetry-vault-entrance.html`: Gizmo appears, entrance controls work, and new visitors reach Chapter I.
- [ ] `poetry-vault.html` Heart: collect all four letters; unlock desk/drawer; solve diary symbols; verify poems stay locked before solution and become readable afterward; inspect optional bookmark; open Heart exit.
- [ ] Heart → Mirror: wrong code rejected; correct code `1231` proceeds; returning visitor's completed-chapter welcome shortcut still uses exit/lock.
- [ ] `poetry-vault-mirror.html`: collect four fragments, place and rotate them, solve ECHO; verify poems and gear; inspect bookmark; open Mirror exit.
- [ ] Mirror → Labyrinth: wrong code rejected; `0702` proceeds; returning shortcut still uses lock.
- [ ] `poetry-vault-labyrinth.html`: read note, install gear, set clock to 3:00, collect dated pages, order ledger, read poems, collect bookmark, open exit.
- [ ] Labyrinth → Dawn: wrong code rejected; `0215` proceeds; returning shortcut still uses lock.
- [ ] `poetry-vault-dawn.html`: place emblem, align window, collect four pages, bind final book, read poems, collect bookmark, open final door.
- [ ] After resetting an *earlier* chapter in a disposable test profile, confirm later rooms cannot be entered by direct URL, castle map, or physical exit.

## 2. Keepers' Hall and Fifth Door

- [ ] `poetry-vault-society.html`: invitation and seal counters reflect saved chapter/bookmark progress.
- [ ] Explore all four Keepers' alcoves; inspection does not itself grant missing bookmarks or bypass chapter gates.
- [ ] `poetry-vault-fifth-door.html`: missing chapter or bookmark keeps the gate closed.
- [ ] With four chapters and bookmarks, solve seals in Heart → Mirror → Labyrinth → Dawn order.
- [ ] Solve star dials, then word sequence; confirm incorrect solutions do not advance.
- [ ] Finish epilogue, verify completion survives refresh, then enter Author's Study.
- [ ] Reset Fifth Door puzzle in disposable profile; original chapter and bookmark progress remains.

## 3. Author's Study

- [ ] `poetry-vault-author-room.html`: direct URL remains gated without original completion, four seals, and Fifth Door (except separately verified owner access).
- [ ] Full September calendar displays Friday 13 as Kimmi's Birthday.
- [ ] Birthday lock starts with cakes; incorrect code fails; `0913` unlocks.
- [ ] Earn Owlkeeper Pass; return later and verify pass restores birthday-lock access only when original Author access is still allowed.
- [ ] Discover letter, books, music, photography; download Author's Mark; refresh and back/forward restore progress.
- [ ] Grandfather clock displays local time and hands correctly; opt-in chime control works. Confirm actual three-hour boundary only in a controlled clock test; do not change production time.
- [ ] Gizmo appears with correct gray-and-white original artwork; pet/follow/rest controls work in each room; no overlay blocks puzzle buttons.
- [ ] Confirm recorded cat sounds are **optional** and currently unavailable until `audio/gizmo-meow.mp3` and `audio/gizmo-purr.mp3` are supplied.

## 4. Mobile and accessibility

- [ ] Portrait and landscape: no offscreen primary controls or overlapping dialogs.
- [ ] Touch navigation, door locks, dial wheels, fragment rotation and puzzle dropdowns work.
- [ ] Focus remains visible; dialogs can close with Escape; focus returns to appropriate control.
- [ ] Reduced-motion mode is usable; sound is off unless explicitly enabled.
- [ ] Reload and browser back/forward do not show stale progress or broken audio.
- [ ] No missing JS/CSS/images or console errors. Binary images must be checked in browser, not inferred missing from a text fetch.

## Release decision

**Do not merge yet.** Mark each checkbox only after hands-on testing, record defects with exact page and steps, fix and retest. Owner explicitly approves merge to `main` after successful verification.
