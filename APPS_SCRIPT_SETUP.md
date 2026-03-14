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

## 3) Frontend env (`.env`)

Create `.env` from `.env.example` and set:

- `VITE_APPS_SCRIPT_URL=<deployment url>`
- `VITE_APPS_SCRIPT_CLIENT_KEY=<same CLIENT_KEY script property>` (optional)

## 4) Run

- Frontend: `npm run dev`

## 5) Vercel env vars (Production)

Set these in Vercel Project Settings -> Environment Variables:

- `VITE_APPS_SCRIPT_URL` = your Apps Script web app URL
- `VITE_APPS_SCRIPT_CLIENT_KEY` = same as Apps Script `CLIENT_KEY` (optional)
