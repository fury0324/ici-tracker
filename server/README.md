# ICI Tracker API

Node.js + Express backend for the Sari-Sari Store POS app. Firestore (via the
Firebase Admin SDK) is the database; authentication is handled by this server
itself (bcrypt + JWT), so the Expo app never needs the Firebase client SDK.

## Architecture

```
src/
├── index.ts              Express app entry
├── config/firebase.ts    Firebase Admin SDK initialization
├── middleware/
│   ├── auth.ts           JWT verification (requireAuth)
│   └── errorHandler.ts   Central error formatting (ApiError, Zod errors)
├── routes/                auth / products / transactions routers
├── controllers/           request validation (zod) + response shaping
├── services/               Firestore reads/writes
├── types/                  Product, Transaction, User etc. (mirrors the app's src/types)
└── utils/                  JWT signing/verification, id generation
```

Every `products` and `transactions` document carries a `userId` field, and
every query/mutation is scoped to `req.user.sub` (the authenticated user's id)
— one user can never read or write another user's data.

Checkout (`POST /api/transactions/checkout`) runs as a single Firestore
`runTransaction`: it decrements stock, bumps `unitsSold`, appends a stock
history entry on each affected product, and creates the transaction document
— all atomically, so a crash mid-checkout can't leave stock and transactions
out of sync.

## Setup

### 1. Install dependencies

```bash
cd server
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

You have two options for `.env`:

**A) Real Firebase project** (for actual deployment)
1. Create a project at https://console.firebase.google.com
2. Enable **Firestore Database** (production or test mode).
3. Project Settings → Service Accounts → **Generate new private key** — this
   downloads a JSON file.
4. Fill in `.env` from that file: `FIREBASE_PROJECT_ID` (`project_id`),
   `FIREBASE_CLIENT_EMAIL` (`client_email`), `FIREBASE_PRIVATE_KEY`
   (`private_key`, keep the `\n` sequences as literal text — the app
   converts them back to real newlines).
5. Set `JWT_SECRET` to a long random string.

**B) Local Firestore emulator** (no Google account or billing needed)
1. Leave `FIREBASE_PROJECT_ID` as any placeholder string.
2. Uncomment `FIRESTORE_EMULATOR_HOST=127.0.0.1:8080`.
3. Run the emulator in one terminal: `npm run emulator`
4. Run the API in another: `npm run dev`

Data in the emulator lives only in memory for that run — restarting it wipes
everything, which is convenient for testing but not for a persistent demo.

### 3. Run

```bash
npm run dev     # ts-node/tsx with hot reload, http://localhost:4000
npm run build   # compile to dist/
npm start       # run the compiled build
```

## API Reference

All request/response bodies are JSON. Protected routes require
`Authorization: Bearer <token>`.

### Auth

| Method | Path | Body | Notes |
|---|---|---|---|
| POST | `/api/auth/register` | `{ email, password, storeName }` | password ≥ 6 chars. Returns `{ token, user }`. |
| POST | `/api/auth/login` | `{ email, password }` | Returns `{ token, user }`. |
| GET | `/api/auth/me` | — | Protected. Returns `{ user }` for the current token. |

### Products (all protected)

| Method | Path | Body |
|---|---|---|
| GET | `/api/products` | — |
| GET | `/api/products/:id` | — |
| POST | `/api/products` | `{ name, price, stock, category, imageUri? }` |
| PUT | `/api/products/:id` | any subset of the above fields |
| DELETE | `/api/products/:id` | — |

`category` must be one of `Drinks` \| `Food` \| `Snacks` \| `Others`.
Creating a product with `stock > 0` seeds one "Stock added" history entry;
updating `stock` directly appends a "Stock adjusted" entry.

### Transactions (all protected)

| Method | Path | Body |
|---|---|---|
| GET | `/api/transactions` | — (newest first) |
| POST | `/api/transactions/checkout` | `{ items: [{ productId, quantity }], paymentMethod, amountReceived? }` |

`paymentMethod` is `Cash` \| `GCash` \| `Card`. For `Cash`, `amountReceived`
must cover the computed subtotal or the request is rejected with 400.

## Connecting the Expo app

The app is wired to this API:

- `src/api/` — `client.ts` (fetch wrapper + `ApiClientError`), plus
  `auth.ts` / `products.ts` / `transactions.ts` request functions.
- `src/store/authStore.tsx` — calls `/api/auth/*`, persists the JWT with
  `@react-native-async-storage/async-storage`, and re-validates it via
  `/api/auth/me` on app launch.
- `src/store/appStore.tsx` — fetches products/transactions from the API on
  login and after every mutation; cart stays local-only (no server endpoint
  for it, since it's just in-progress state until checkout).

The app's base URL comes from `EXPO_PUBLIC_API_URL` (see the app's
`.env.example`) and defaults to `http://localhost:4000/api`, which only
resolves correctly for web preview and the iOS simulator — set it to your
machine's LAN IP for Expo Go on a physical device or an Android emulator.
