## Plan: Invite-only toegang

### Database
- **`allowed_users`** tabel: `email` (uniek), `expires_at` (default `now() + 1 jaar`), `note`, `invited_by`, `created_at`.
- **`app_role` enum** + **`user_roles`** tabel (email-koppeling via `user_id`), met security-definer `has_role()` functie — verplicht patroon om recursie te voorkomen.
- RLS:
  - `allowed_users`: alleen admins kunnen lezen/schrijven.
  - `user_roles`: alleen admins kunnen rollen toekennen; iedereen mag zijn eigen rol lezen.
- Helper-functie `public.email_has_access(email text)` → `boolean` (security definer): checkt of e-mail in `allowed_users` staat én niet verlopen is.

### Server functions
- `requestLoginCode({ email })` — publieke server fn:
  1. Checkt `email_has_access`.
  2. Zo niet → `{ ok: false, reason: 'not_allowed' | 'expired' }`.
  3. Zo wel → roept `supabase.auth.admin.inviteUserByEmail` of `signInWithOtp` (server-side) aan en geeft `{ ok: true }`.
- `verifyAccessOnLogin` (middleware in `_authenticated`): bij elke beschermde request opnieuw check; verlopen → forceer sign-out en redirect naar `/auth?reason=expired`.

### Frontend
- `/auth`: bestaande OTP-flow gebruikt nu `requestLoginCode`; bij `not_allowed`/`expired` een duidelijke melding ("Geen toegang — vraag een uitnodiging aan").
- `/admin` (alleen rol `admin`, via `_authenticated/_admin/` layout):
  - Tabel met deelnemers: e-mail, verloopdatum, status (actief/verlopen), laatste login.
  - Acties: toevoegen (default +1 jaar), verlengen (+1 jaar / custom datum), verwijderen.
- Eerste admin: jij. Wordt via één migratie-insert gezet op basis van je e-mail (vraag ik hieronder).

### Auth-instellingen
- Signups uitzetten in Lovable Cloud Auth (geen open registratie).
- `shouldCreateUser: false` bij OTP-aanvraag in de client; account-aanmaak gebeurt server-side ná whitelist-check.

### Eén vraag voor ik begin
Wat is jouw e-mailadres? Dat zet ik direct als eerste admin in de migratie.
