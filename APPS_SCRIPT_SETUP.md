# Apps Script Setup (NeverMissBirthdays)

## 1) Create the Google Sheet

- Create a Google Sheet.
- Create a tab named `birthdays`.
- You can leave it empty; the script auto-writes headers.

## 2) Create Apps Script Web App

- Open [script.new](https://script.new) and replace contents with:
  - `apps-script/Code.gs`
- In Apps Script: `Project Settings` -> `Script properties`, set:
  - `SPREADSHEET_ID` = `1chI7njem0d2aqiwarItNtzzIHfILuwNnkHHBl7yjGHA`
  - `SHEET_NAME` = `birthdays`
  - `ACCESS_ID_SALT` = long random secret
  - `CLIENT_KEY` = optional random string (lightweight spam guard)
- Deploy -> `New deployment` -> type `Web app`.
- Execute as: `Me`.
- Who has access: `Anyone`.
- Copy the deployment URL.

## 3) Vercel env vars

Set these in Vercel Project Settings -> Environment Variables:

- `APPS_SCRIPT_URL=<deployment url>`
- `APPS_SCRIPT_CLIENT_KEY=<same as HARDCODED_CLIENT_KEY in Code.gs>`

## 4) Run local

For local frontend + local proxy testing:

- Set `.env` from `.env.example`:
  - `APPS_SCRIPT_URL=...`
  - `APPS_SCRIPT_CLIENT_KEY=...`
- Frontend: `npm run dev`
- Proxy route exists at `/api/birthdays` (Vercel function in `api/birthdays.mjs`)

The browser now calls `/api/birthdays` (same-origin), and that function calls Apps Script server-to-server to avoid CORS.
