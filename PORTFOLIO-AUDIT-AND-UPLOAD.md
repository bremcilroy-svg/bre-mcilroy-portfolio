# Portfolio health and speed audit

Source: bre-mcilroy-portfolio-main (3).zip. This audit is static; it does not prove the deployed site is working.

## Changes made
- Fixed missing Gizmo companion JS and CSS in `poetry-vault.html`, loading the companion before the original artwork and visibility scripts.
- Removed a reference to absent `vault-phase9-mirror.css` from the Author Room (the corresponding JS remains unchanged).
- Added asynchronous image decoding to 3 already-lazy image tags; this reduces main-thread image decoding pressure without changing content.
- Left existing puzzles, progress storage, room navigation, author authentication and video logic unchanged.

## Issues needing your original files
The ZIP does not contain the following images referenced by the acting/modeling pages. These cannot be restored from code, so please add the actual original photos/posters rather than substituting unrelated pictures:
- `acting-modeling.html` → `blm-photo-002.jpg`
- `acting.html` → `bla-poster-004.jpg`
- `acting.html` → `bla-poster-008.jpg`
- `acting.html` → `bla-poster-015.jpg`
- `acting.html` → `bla-poster-016.jpg`
- `acting.html` → `bla-poster-021.jpg`
- `acting.html` → `bla-poster-024.jpg`

## Performance priorities
- The archive includes many MP4 performance videos, which dominate transfer size. The acting player already uses `preload="none"`; keep it that way. For larger gains, re-encode source MP4 files with H.264/AAC and a lower bitrate, retaining originals offline. This package does not recompress your work to avoid reducing quality without your approval.
- Galleries already use lazy image loading extensively.
- Test the live GitHub Pages deployment in a private browser window after upload; local static checks cannot detect cache issues or all runtime JavaScript failures.
- Upload extracted files into the repository root, not the enclosing ZIP folder.
- If Gizmo still does not appear, inspect the deployed `poetry-vault.html` page source for `vault-gizmo-companion.js?v=4`, then check browser console errors.

## Verification
- Missing relative src/href file references after repair: 7 unique references (listed above).
