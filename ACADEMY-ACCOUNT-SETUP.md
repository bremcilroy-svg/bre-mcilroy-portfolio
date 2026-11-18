# Academy student account setup

Status: source code committed; **not activated**. The owner must configure Supabase and test the flow before calling it live.

1. Create a Supabase project. In Authentication, enable Email (password) and configure confirmation emails. Enable Google OAuth with your own Google Cloud OAuth client and the callback URL supplied by Supabase.
2. Set Site URL to the published GitHub Pages site. Add `https://bremcilroy-svg.github.io/bre-mcilroy-portfolio/academy-student-login.html` to the allowed redirect URLs.
3. Execute `academy-student-saves.sql` in Supabase SQL Editor and verify row-level security policies. If policies already exist, review before rerunning SQL.
4. Edit `academy-auth-config.js` with **only** the public project URL and Supabase publishable/anon key. Never commit a service_role key, database password, Google OAuth client secret, or any private credential.
5. Test email confirmation, Google sign-in, sign-out, two independent student accounts, RLS isolation, save backup and restore, and mobile navigation on the development branch before merging.
6. Backups are currently **manual**, not automatic cloud syncing. Existing local saves remain unchanged until a student explicitly restores a cloud snapshot. Only the keys in `SAVE_KEYS` are included; audit original game save keys before promising complete cross-device continuation.
7. Guest users can continue playing without an account. The live `main` branch remains unchanged until approved.

Security: never accept a client-supplied user ID for authorization; the database policy compares it to `auth.uid()`. Public keys are expected in frontend code, private keys are not.

## Verified core save keys

The cloud snapshot now explicitly includes the original chapter keys from `vault-state.js`, `vault-mirror-state.js`, `vault-labyrinth-state.js`, and `vault-dawn-state.js`:

- `bre-poetry-vault-heart-v1`
- `bre-poetry-vault-mirror-v1`
- `bre-poetry-vault-labyrinth-v1`
- `bre-poetry-vault-dawn-v1`

These complement existing society, bookmark, fifth-door, house, character, inventory, and secret chest keys. Backups are manual; never claim automatic cross-device syncing. Before activating the service, test a completed chapter, a partially completed chapter, a secret chest, and an enrollment record with two separate user accounts.
