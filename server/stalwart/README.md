# Stalwart persistence override

The 1Panel template previously mounted only `/opt/stalwart`, which is not a
persistence path used by Stalwart 0.16. The production override binds the two
paths declared by the official image:

- `./data/config` → `/etc/stalwart`
- `./data/state` → `/var/lib/stalwart`

`STALWART_RECOVERY_ADMIN` is supplied from the server-only `recovery.env` file
and must never be committed. Host directories must remain owned by UID/GID
`2000`.
