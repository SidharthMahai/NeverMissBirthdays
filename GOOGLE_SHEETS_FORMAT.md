# Google Sheets Format (NeverMissBirthdays)

Use one shared sheet tab named `birthdays` with this exact header row in `A1:L1`:

1. `record_id`
2. `user_hash`
3. `name`
4. `relation`
5. `birthday_type`
6. `date_iso`
7. `month`
8. `day`
9. `email`
10. `notes`
11. `created_at`
12. `updated_at`

## Rules

- `user_hash`: SHA-256 hash of `ACCESS_ID_SALT + ':' + accessId`.
- `birthday_type`: `full` or `monthDay`.
- If `birthday_type = full`:
  - `date_iso` must be `YYYY-MM-DD`.
  - `month` and `day` should be empty.
- If `birthday_type = monthDay`:
  - `month` and `day` are required.
  - `date_iso` should be empty.
- `relation`: `friend`, `family`, `colleague`, `other`.
- `record_id`: UUID.
- Timestamps are ISO strings in UTC.

## Security Notes

- Do not expose service-account keys or sheet IDs in client JavaScript.
- Keep all Google Sheets calls on the backend (`server/index.mjs`).
- Never store plain access IDs in the sheet; store `user_hash` only.
- Use HTTPS in production and restrict `ALLOWED_ORIGIN`.
- Choose access IDs that are long/unpredictable (passphrase style).
