# Owner-only Academy publishing

This development-branch feature is **not active** until the database migration is applied and tested.

1. Use the existing **owner-authentication Supabase project**, not a separate student project. Verify `vault_is_owner()` works and denies nonowners.
2. In Supabase SQL Editor review and apply `academy-publications.sql` (on a new installation; check existing policies before rerunning).
3. Sign into the existing Owner Login. Open the Headmaster's Office and test the Publishing Desk. Test saving unpublished server drafts, publishing, unpublishing and deleting.
4. Verify from an incognito browser that only published content appears at `academy-announcements.html`. Verify an ordinary signed-in student cannot insert, update or delete publications via the API. Check RLS with two different accounts.
5. Do not merge into `main` until the database and browser tests pass.

This is plain-text publishing only; do not paste HTML or sensitive student data. Local browser drafts are separate from server publications. Public links are not security controls; RLS is the actual enforcement.
