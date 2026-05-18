# CyberTap Game Monorepo

Monorepo-ul conține o aplicație WebApp React și un backend Node.js pentru jocul CyberTap.

## Arhitectura logică

### Frontend

- `frontend/` - React + Vite + Tailwind pentru interfata de joc.
- `frontend/src/App.jsx` - fluxul principal al jocului: tap, energie, upgrade-uri, leaderboard, wallet, daily reward.
- `frontend/src/lib/api.js` - clientul API pentru backend.
- `frontend/src/index.html` - entrypoint-ul folosit de Vite.

### Backend

- `backend/` - server Express cu PostgreSQL și integrare Telegram/Wallet.
- `backend/src/routes/apiRoutes.js` - rutele HTTP publice.
- `backend/src/controllers/apiController.js` - stratul de control pentru request-uri.
- `backend/src/services/gameService.js` - economie de joc: tap, collect, upgrade, daily reward, wheel.
- `backend/src/services/userService.js` - profil, leaderboard, rank, stare utilizator.
- `backend/src/services/solanaService.js` - challenge-response pentru wallet, verificare semnături și claim on-chain.

### Flux de încredere Web3

1. Utilizatorul pornește jocul din Telegram WebApp.
2. Frontend-ul trimite acțiunile de joc către backend prin API.
3. Backend-ul validează acțiunile și actualizează DB.
4. Pentru operațiile sensibile, backend-ul cere semnătură de wallet prin challenge nonce.
5. La claim sau link de wallet, semnătura este verificată server-side înainte de orice efect economic.

Notă: implementarea curentă folosește semnături Solana pentru wallet linking. Dacă adaugi suport EVM, păstrează aceeași limită de încredere și înlocuiește verifier-ul cu un adaptor EIP-712 fără să schimbi contractul API.

## Module funcționale existente

- Tap & Balance
- Energy management
- Upgrade shop
- Daily reward și wheel spin
- Leaderboard și rank
- Wallet link și revenue claim
- Referral flow prin Telegram bot

## Module țintă pentru extindere

Acestea trebuie implementate ca module separate, cu validare server-side și stări persistate în DB sau on-chain, în funcție de risc:

- Leaderboard & Leagues: ranking bazat pe Tap Power și recompense de sezon.
- Blockchain Rewards: raffle și loot boxes pentru NFT/token drops.
- Social-to-Earn: follow missions, referral thresholds și reward gating.
- Monetizare: ads pentru energy refill și multi-token payments pentru skins/boosters.
- Auto-Clicker: upgrade cu logică off-chain pe server și sync periodic.

## API existent

- `GET /api/health`
- `GET /api/user/:telegramId`
- `POST /api/tap`
- `POST /api/collect`
- `POST /api/upgrade`
- `GET /api/leaderboard`
- `POST /api/daily`
- `POST /api/wheel_spin`
- `GET /api/rank/:telegramId`
- `GET /api/botinfo`
- `GET /api/wallet/challenge/:telegramId`
- `GET /api/wallet/status/:telegramId`
- `POST /api/wallet/verify`
- `POST /api/wallet/claim`

## Model de date

Tabelele principale sunt:

- `users` - profil, puncte, energie, wallet și revenue.
- `upgrades` - catalogul de upgrade-uri.
- `user_upgrades` - nivelul fiecărui upgrade per utilizator.
- `daily_rewards` - streak și last claim.
- `wheel_spins` - istoric spin pe zi.

## Variabile `.env`

### Backend

`backend/.env`

```env
BOT_TOKEN=your_telegram_bot_token
DATABASE_URL=postgresql://user:password@localhost:5432/cybertap
DATABASE_URL_PUBLIC=postgresql://user:password@host:5432/cybertap
PORT=3000
WEBAPP_URL=https://your-frontend-domain.example
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_TREASURY_SECRET_KEY=your_treasury_secret_key
```

`DATABASE_URL_PUBLIC` este util când rulezi migrațiile local împotriva unei baze Railway publice. `WEBAPP_URL` trebuie să fie URL-ul public al frontend-ului construit.

### Frontend

`frontend/.env`

```env
BACKEND_URL=http://localhost:3000
VITE_TELEGRAM_BOT_NAME=your_bot_username
VITE_APP_NAME=CyberTap
VITE_DEMO_TELEGRAM_ID=123456789
```

## Rulare locală

1. Instalează dependențele din rădăcina proiectului:

```sh
npm install
```

2. Rulează migrațiile backend-ului:

```sh
cd backend
npm run migrate
```

3. Pornește aplicațiile:

```sh
npm run dev
```

4. Dacă vrei separare pe servicii:

```sh
npm run dev:backend
npm run dev:frontend
```

## Observație

Nu publica valori reale pentru token, private key sau connection string. În repo păstrează doar placeholder-ele sau un fișier example.
