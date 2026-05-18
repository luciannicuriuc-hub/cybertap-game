# CyberTap Game Monorepo

Telegram WebApp tap-to-earn game cu economie off-chain pe Postgres și payout
on-chain pe Solana. Frontend React + Vite, backend Express + Telegraf.

---

## 📊 Status implementare

| Feature | Backend | Frontend | DB | Plată / SC | Notes |
| --- | --- | --- | --- | --- | --- |
| Tap & balance | ✅ | ✅ | ✅ | n/a | boost multiplier server-validated |
| Energy / regen / crit | ✅ | ✅ | ✅ | n/a | |
| Upgrades (tap / passive / special) | ✅ | ✅ | ✅ | n/a | inclusiv `auto_clicker` upgrade |
| Daily reward + wheel | ✅ | ✅ | ✅ | n/a | |
| Wallet link & SOL revenue claim | ✅ | ✅ | ✅ | nacl verify (real) | |
| **Leaderboard cu premii (season)** | ✅ | ✅ | ✅ | 🟡 payout queued, settle off-chain | tabela `season_scores` + `leaderboard_prizes` |
| **Tournaments** | ✅ | ✅ | ✅ | 🟡 entry/payout queued | metric=`taps`; scor incrementat la fiecare tap |
| **Follow missions** (TG/X/YT/TT/Discord) | ✅ | ✅ | ✅ | n/a | verificare = `manual` (deep-link). TODO real-verify |
| **Reclame rewarded** | ✅ | ✅ | ✅ | n/a | provider = `mock`. TODO integrate Adsgram/Onclicka |
| **Cufere (chests)** | ✅ | ✅ | ✅ | 🟡 plătite via stub `mock_sig_*` | drop_table JSON; rolling fair pe server |
| **Plată multi-token (SOL + SPL)** | ✅ catalog + payment table | ✅ vizibil | ✅ tabel `tokens` + `token_payments` | 🔴 SC TBD | flag `enabled` controlează ce e activ |
| **Referral tiers (cu praguri)** | ✅ | ✅ | ✅ | 🟡 token reward → queued payout | tabel `referral_tiers` + `referral_tier_claims` |
| **Auto-clicker (boost server-side)** | ✅ catch-up + activate | ✅ overlay | ✅ coloane în `users` | 🟡 plata = stub | rulează pe server, colectabil periodic |
| **Caractere/skin-uri/league groups** | ✅ | ✅ | ✅ | n/a (drop din chest sau referral) | season-leaderboard filtrat după `league_group` |
| **Raffles** | ✅ buy + draw | ✅ overlay | ✅ `raffles`, `raffle_tickets` | 🟡 prize queued, draw admin-gated | random server-side (NU VRF) |

Legendă: ✅ implementat · 🟡 partial / stub · 🔴 TODO

---

## 🧱 Arhitectura logică

### Frontend
- `frontend/src/App.jsx` — flow principal (tap, energie, upgrade-uri, daily, wheel, leaderboard, wallet)
- `frontend/src/components/FeatureIcon.jsx` — buton iconic stil arcade pentru hub-ul de feature-uri din Home
- `frontend/src/components/FeatureOverlay.jsx` — overlay/modal full-screen care apare peste joc (nu adăugăm tab nou)
- `frontend/src/components/FeaturePanels.jsx` — panourile: prizes, turnee, follow missions, ads, chests, raffles, referrals, autoclicker, characters, tokens
- `frontend/src/lib/api.js` — client API care acoperă toate endpoint-urile noi

### Backend
- `backend/src/services/gameService.js` — tap (cu boost server-side), upgrade, daily, wheel
- `backend/src/services/userService.js` — profil (include `characters` + `boost_active`)
- `backend/src/services/solanaService.js` — challenge/verify wallet + SOL revenue claim
- `backend/src/services/tokenService.js` — catalog SOL + SPL + `verifyOnchainPayment` (STUB)
- `backend/src/services/seasonService.js` — season scoring + prize pool
- `backend/src/services/tournamentService.js` — tournaments + join (cu plată/puncte) + scoring live la tap
- `backend/src/services/followMissionService.js` — start/claim missions
- `backend/src/services/adService.js` — rewarded ads (provider=mock); cap zilnic + cooldown
- `backend/src/services/chestService.js` — drop tables ponderate cu `crypto.randomInt`
- `backend/src/services/referralService.js` — referral tiers + claims (token reward → `queued_payout`)
- `backend/src/services/autoClickerService.js` — activate boost + collect catch-up
- `backend/src/services/characterService.js` — listare/owned/select; folosit pentru league groups
- `backend/src/services/raffleService.js` — buy tickets (puncte sau token) + draw winner
- `backend/src/controllers/featuresController.js` — fațada HTTP pentru toate cele de mai sus
- `backend/src/routes/apiRoutes.js` — toate rutele

---

## 🌐 API endpoints (extras)

### Core
- `GET /api/health`
- `GET /api/user/:telegramId` → include `characters`, `boost_active`, etc.
- `POST /api/tap` — payload `{ telegramId, taps, tapValue }`
- `POST /api/collect`
- `POST /api/upgrade`
- `GET /api/leaderboard?limit=50`
- `POST /api/daily`
- `POST /api/wheel_spin`
- `GET /api/rank/:telegramId`

### Wallet / Solana
- `GET /api/wallet/challenge/:telegramId`
- `GET /api/wallet/status/:telegramId`
- `POST /api/wallet/verify`
- `POST /api/wallet/claim`

### Tokens
- `GET /api/tokens`

### Season + leaderboard prizes
- `GET /api/season` — sezon activ + prizes
- `GET /api/season/leaderboard?league=global&limit=100`
- `GET /api/season/rank/:telegramId?league=global`

### Tournaments
- `GET /api/tournaments`
- `GET /api/tournaments/:id`
- `GET /api/tournaments/me/:telegramId`
- `POST /api/tournaments/join` — `{ telegramId, tournamentId, signature?, senderAddress? }`

### Follow missions
- `GET /api/follow_missions/:telegramId`
- `POST /api/follow_missions/start` — `{ telegramId, missionId }`
- `POST /api/follow_missions/claim` — `{ telegramId, missionId }`

### Ads
- `GET /api/ads/config/:telegramId`
- `POST /api/ads/reward` — `{ telegramId, placement, rewardId, provider, providerRef }`

### Chests
- `GET /api/chests`
- `POST /api/chests/open` — `{ telegramId, chestId, signature, senderAddress }`
- `GET /api/chests/history/:telegramId`

### Referrals
- `GET /api/referrals/:telegramId`
- `POST /api/referrals/claim` — `{ telegramId, tier }`

### Auto-clicker
- `GET /api/autoclicker/:telegramId`
- `POST /api/autoclicker/activate` — `{ telegramId, signature, senderAddress, level }`
- `POST /api/autoclicker/collect`

### Characters
- `GET /api/characters`
- `GET /api/characters/mine/:telegramId`
- `POST /api/characters/select` — `{ telegramId, characterId }`

### Raffles
- `GET /api/raffles`
- `GET /api/raffles/:id?telegramId=...`
- `POST /api/raffles/buy` — `{ telegramId, raffleId, ticketCount, payWith: 'points'|'token', signature?, senderAddress? }`
- `POST /api/raffles/:id/draw` — header `X-Admin-Key: $ADMIN_KEY`

---

## 💾 Model de date (tabele noi)

- `tokens` — catalog SPL/SOL: `id, symbol, name, icon, mint, decimals, enabled, kind`
- `characters` — `id, name, icon, league_group, tap_bonus, passive_bonus, rarity, description`
- `user_characters` — ownership (PK pe `(telegram_id, character_id)`)
- `seasons` — `id, name, starts_at, ends_at, status`
- `season_scores` — scor pe sezon și per `league_group`
- `leaderboard_prizes` — premiile (rank range, token, amount, points, label)
- `tournaments` — entry fee, prize pool, metric, status, intervale
- `tournament_entries` — scor live + dovada plății
- `follow_missions` + `user_follow_missions` — sociale + status per user
- `ad_views` — istoric ad-uri (per zi pentru cap zilnic)
- `chests` (drop_table JSON) + `user_chests` (istoric reward)
- `referral_tiers` + `referral_tier_claims`
- `raffles` + `raffle_tickets`
- `token_payments` — tabel central de plăți on-chain și **payout-uri queued**

`users` are coloane noi: `active_character_id`, `auto_clicker_level`, `auto_clicker_until`, `boost_multiplier`, `boost_until`, `ads_watched_today`, `ads_last_watched_at`, `ads_date`, `highest_referral_tier_claimed`, `raffle_tickets`.

---

## 🔐 Smart contracts — ce trebuie scris și unde se conectează

Implementarea actuală merge cu un **treasury wallet** clasic (deja există în
`solanaService.js`). Pentru a închide cercul Web3, recomandat este să muți
plățile și payout-urile pe smart contracts. Lista — în ordine de prioritate:

### 1. **Payment Verifier on-chain (HIGH)**
- **Where:** `backend/src/services/tokenService.js → verifyOnchainPayment()`
- **De ce:** acum acceptă orice signature non-empty (stub). Trebuie să:
  1. cheme `Connection.getParsedTransaction(signature)`,
  2. confirme că tranzacția e finalizată,
  3. verifice destinatarul = treasury,
  4. verifice mint = `token.mint` (pentru SPL) sau system transfer (pentru SOL),
  5. confirme suma ≥ `expectedAmount`,
  6. respingă signatures deja folosite (există deja gate-ul DB).
- **SC necesar:** *opțional*. Pentru "intent-based payments" se poate scrie un
  program Anchor care emite un eveniment `PaymentReceived { user, purpose, amount }`,
  ușor de indexat. Dacă rămâi pe treasury wallet simplu, doar verificarea RPC
  este suficientă.

### 2. **Chest Vault** (treasury → user)
- **Where:** `backend/src/services/chestService.js → openChest()`
- **De ce:** când utilizatorul plătește un cufăr cu SPL, payout-ul (token sau
  NFT) trebuie să iasă din treasury determinist.
- **SC necesar:** Program Anchor `chest_vault` cu:
  - `open_chest(chest_id, payment_proof)` — transfer SPL în treasury + emite
    eveniment cu rewardul rolled off-chain, **sau**
  - VRF-driven version: păstrează drop-tables on-chain și folosește
    Switchboard VRF pentru determinare provably-fair.
- Frontend: în `FeaturePanels.jsx → ChestsPanel.open()` înlocuiește
  `signature = mock_sig_*` cu o tranzacție reală.

### 3. **Raffle Program** (HIGH)
- **Where:** `backend/src/services/raffleService.js → buyTickets / drawWinner`
- **De ce:** draw-ul actual folosește `crypto.randomInt` cu seed din `ends_at +
  Date.now()` — fair-ish, dar NU provably fair.
- **SC necesar:** program Anchor `raffle` cu:
  - PDA per raffle (`raffles[raffle_id]`),
  - `buy_tickets(raffle_id, ticket_count)` — transfer SPL/SOL, emit
    `TicketBought`,
  - `request_randomness(raffle_id)` + `consume_randomness(raffle_id)` cu
    Switchboard VRF (canonical),
  - `claim_prize(raffle_id)` — winner-only transfer.
- Backend devine doar un indexer: ascultă evenimentele și updatează `raffles` și
  `raffle_tickets`.

### 4. **Tournament Pool** (MEDIUM)
- **Where:** `backend/src/services/tournamentService.js → joinTournament`
- **De ce:** entry fees în SPL/SOL ar trebui să intre într-o escrow on-chain, ca
  payout-ul la final să fie verificabil de oricine.
- **SC necesar:** program Anchor `tournament_pool` cu:
  - `create_tournament(metadata)` (admin),
  - `join(tournament_id)` — transfer SPL → vault PDA,
  - `settle(tournament_id, winners[])` — admin signs, payout-uri proporționale.
- Backend menține scoring-ul (rapid, off-chain), iar la final apelează
  `settle()` cu lista de winners.

### 5. **Leaderboard Season Vault** (MEDIUM)
- **Where:** `backend/src/services/seasonService.js`
- **De ce:** premiile sezonului sunt deja descrise în `leaderboard_prizes`.
  Pentru transparență, fondul ar trebui să stea într-un vault on-chain.
- **SC necesar:** poate refolosi același program ca `tournament_pool` cu un
  `purpose = "season"` sau un program separat `season_vault`.

### 6. **Auto-clicker Boost Payment** (LOW)
- **Where:** `backend/src/services/autoClickerService.js → activate()`
- **De ce:** acum doar înregistrează un payment cu signature stub. Verificarea
  reală se face automat odată ce **#1 (Payment Verifier)** e gata.
- **SC necesar:** niciun program nou — doar `verifyOnchainPayment` rezolvă tot.

### 7. **Multi-token Settler / Batch Payouts** (MEDIUM)
- **Where:** rândurile din `token_payments` cu `status = 'queued_payout'`
  (referral tier rewards, raffle prize, season prize) trebuie să fie procesate
  ulterior.
- **SC necesar:** poate fi un simplu cron/script Node care:
  - selectează rândurile `queued_payout`,
  - construiește transfer-uri SPL/SOL din treasury,
  - marchează `status = 'confirmed'` cu `signature`.
  - **SAU** un program Anchor `payout_vault` unde utilizatorii claim-uiesc
    singuri (pull-based, mai sigur pentru treasury).

### 8. **NFT / Character Mint (OPTIONAL)**
- Skin-urile rare (din `characters` + `user_characters`) pot deveni NFT-uri
  Metaplex. Atunci `user_characters` devine doar un cache, iar `ownership`-ul
  real e on-chain.

---

## ⚙️ Variabile `.env`

### Backend (`backend/.env`)
```env
BOT_TOKEN=your_telegram_bot_token
DATABASE_URL=postgresql://user:password@localhost:5432/cybertap
DATABASE_URL_PUBLIC=postgresql://user:password@host:5432/cybertap   # pentru migrate local cu Railway
PORT=3000
WEBAPP_URL=https://your-frontend-domain.example
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_TREASURY_SECRET_KEY=...   # JSON array | base58 | mnemonic
SOLANA_TREASURY_DERIVATION_PATH=m/44'/501'/0'/0'
SOLANA_REVENUE_LAMPORTS_PER_POINT=10
SOLANA_MIN_CLAIM_LAMPORTS=10

# Admin gate pentru POST /api/raffles/:id/draw
ADMIN_KEY=put_a_long_random_string_here

# Auto-clicker tuning
AUTOCLICKER_TAPS_PER_SEC_PER_LEVEL=1
AUTOCLICKER_MAX_CATCHUP_HOURS=4
AUTOCLICKER_BOOST_TOKEN=sol
AUTOCLICKER_BOOST_AMOUNT=10000000
AUTOCLICKER_BOOST_DURATION_SEC=14400

# Ads tuning
MAX_ADS_PER_DAY=20
AD_COOLDOWN_SECONDS=30
```

### Frontend (`frontend/.env`)
```env
BACKEND_URL=http://localhost:3000
VITE_TELEGRAM_BOT_NAME=your_bot_username
VITE_APP_NAME=CyberTap
VITE_DEMO_TELEGRAM_ID=123456789
```

---

## 🛠 Rulare locală

```sh
npm install
cd frontend && npm install
cd ../backend && npm install
cd ..

# rulează migrațiile (creează toate tabelele noi)
cd backend && npm run migrate

# pornește totul
cd .. && npm run dev
```

Sau separat: `npm run dev:backend` / `npm run dev:frontend`.

---

## 🎮 Note despre UI (game-ish, fără tab-uri noi)

- Bara de jos **NU** s-a extins. Toate feature-urile noi apar ca **iconițe
  arcade** într-un grid pe Home (vezi `FeatureIcon`).
- Clic pe o iconiță deschide un **overlay full-screen** peste joc — modelul
  Clash Royale / Hamster Kombat, fără navigare.
- Badge-urile galbene (`!`, număr) marchează feature-urile cu acțiuni
  disponibile (de ex. tier de referral disponibil).
- Personajul activ vine de la `/api/characters/select` și determină
  `league_group` pentru leaderboard-uri separate.
- Boost-urile (din wheel, ads, chests, autoclicker) sunt **server-validated**:
  fiecare tap înmulțește cu `boost_multiplier` doar dacă `boost_until > now`.

---

## ⚠️ De ținut minte

- Nu publica valori reale pentru `BOT_TOKEN`, `SOLANA_TREASURY_SECRET_KEY` sau
  `DATABASE_URL`. Foloseste `.env` exclus din git.
- Endpoint-ul `POST /api/raffles/:id/draw` cere `X-Admin-Key`. Setează
  `ADMIN_KEY` în prod.
- Stub-urile de plată (`mock_sig_*`) **trebuie** înlocuite înainte de mainnet —
  vezi secțiunea Smart contracts.
- Switchboard VRF este recomandat pentru raffle & loot pentru a oferi
  provably-fair randomness.
