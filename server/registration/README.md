# TEMPO Mail registration service

Small dependency-free Node.js API for invite-only self-service registration on the default Stalwart domain.

- Binds to `127.0.0.1:8015`; OpenResty exposes only the registration route.
- Uses a restricted Stalwart service account.
- Stores rate-limit counters in SQLite.
- Accepts only the configured domain and validates names/passwords server-side.
- Stores only a SHA-256 digest of the invite code in the service environment.

The production environment and plaintext invite are server-only under `/opt/tempo-mail/secrets` and must not be committed.

Production paths:

- Program: `/opt/tempo-mail/registration/server.mjs`
- Environment: `/opt/tempo-mail/secrets/registration.env`
- Invite recovery copy: `/opt/tempo-mail/secrets/registration-invite.txt`
- State: `/var/lib/tempo-mail-registration/registration.sqlite`
- OpenResty include: `/opt/1panel/www/sites/mail.darker.one/proxy/01-registration-api.conf`
