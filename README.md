# CyberTap Game Monorepo

Monorepo-ul este împărțit clar în două aplicații:DASJDaDAS

- `backend/` - server Node.js cu Express, PostgreSQL și Telegraf
- `frontend/` - aplicația React + Vite + Tailwind pentru WebApp
- `frontend/src/index.html` - entrypoint-ul Vite pentru frontend-ul nou

## Ce variabile `.env` ai nevoie

### Backend

`backend/.env`

```env
BOT_TOKEN=your_telegram_bot_token
DATABASE_URL=postgresql://user:password@localhost:5432/cybertap
DATABASE_URL_PUBLIC=postgresql://user:password@host:5432/cybertap
PORT=3000
WEBAPP_URL=https://your-frontend-domain.example
```

If your backend `.env` contains the Railway internal Postgres host, that value works only inside Railway. For local migration runs, keep `DATABASE_URL` for deployment and add `DATABASE_URL_PUBLIC` with the public Railway Postgres connection string, then run `cd backend && npm run migrate`.

### Frontend

`frontend/.env`

```env
BACKEND_URL=http://localhost:3000
VITE_TELEGRAM_BOT_NAME=your_bot_username
VITE_APP_NAME=CyberTap
VITE_DEMO_TELEGRAM_ID=123456789
```

`WEBAPP_URL` trebuie să fie URL-ul public unde ai publicat frontend-ul construit, nu linkul către repo și nu localhost. Botul deschide exact adresa asta când apeși butonul Play.

Frontend-ul React folosește entrypoint-ul [frontend/src/index.html](frontend/src/index.html) și se construiește cu Vite în `frontend/dist`.

## Cum rulezi local

1. Copiază fișierele example în `.env` locale și completează valorile.
2. Instalează dependențele la rădăcina proiectului:

```sh
npm install
```

3. Pornește ambele aplicații:

```sh
npm run dev
```

4. Dacă vrei să le pornești separat:

```sh
npm run dev:backend
npm run dev:frontend
```

## Structura actuală

- frontend-ul nou este construit ca proiect React/Vite/Tailwind și se ocupă de UI
- backend-ul rămâne funcțional, dar îl voi reorganiza separat în pașii următori

## Observație

Dacă ai deja un token real în `backend/.env`, nu-l posta public. În repo păstrează doar placeholder-ele sau un fișier example.
