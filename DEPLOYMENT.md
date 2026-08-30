 # Deploying: Render (API) + Vercel (web app)

This repo has two deployable pieces: the Node/Express API in `server/`, and
the Expo app at the root (deployed as a static web export). Deploy the API
first — the web app's build needs its URL.

## 0. Prerequisites

- A real Firebase project with Firestore enabled (the emulator is dev-only —
  see `server/README.md` if you haven't set this up yet).
- This repo pushed to GitHub (both Render and Vercel deploy from a git repo):
  ```bash
  git add -A
  git commit -m "Prepare for deployment"
  git remote add origin <your-github-repo-url>
  git push -u origin master
  ```

## 1. Deploy the API to Render

1. [dashboard.render.com](https://dashboard.render.com) → **New** → **Web Service** → connect this repo.
2. Render should pick up `server/render.yaml` automatically (it's a Blueprint).
   If it doesn't, set these manually:
   - **Root Directory**: `server`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
3. Add environment variables (Render's dashboard → Environment):
   | Key | Value |
   |---|---|
   | `JWT_SECRET` | a long random string |
   | `JWT_EXPIRES_IN` | `7d` |
   | `FIREBASE_PROJECT_ID` | from your service account JSON |
   | `FIREBASE_CLIENT_EMAIL` | from your service account JSON |
   | `FIREBASE_PRIVATE_KEY` | from your service account JSON (keep the `\n` sequences as-is) |
   | `CORS_ORIGIN` | leave unset for now — you'll add your Vercel URL after step 2 |

   Don't set `PORT` — Render injects it automatically and the server already reads it.
4. Deploy. Note the resulting URL, e.g. `https://ici-tracker-api.onrender.com`.
5. Confirm it's live: `curl https://ici-tracker-api.onrender.com/api/health`

**Free-tier note:** Render's free plan spins the service down after ~15 minutes
of inactivity. The first request after that takes 30–50s to wake it up — not
a bug, just something to expect on the free tier.

## 2. Deploy the web app to Vercel

1. [vercel.com/new](https://vercel.com/new) → import this repo.
2. Vercel should read `vercel.json` at the repo root automatically (build
   command `npx expo export --platform web`, output directory `dist`). Root
   directory should be `.` (the repo root, not `server`).
3. Add an environment variable **before the first deploy** (Vercel dashboard
   → Settings → Environment Variables):
   | Key | Value |
   |---|---|
   | `EXPO_PUBLIC_API_URL` | `https://ici-tracker-api.onrender.com/api` (your Render URL from step 1, + `/api`) |

   This gets baked into the JS bundle at build time — if you add or change it
   later, you must redeploy for it to take effect.
4. Deploy. Vercel gives you a URL like `https://ici-tracker.vercel.app`.

## 3. Lock down CORS

Now that you have the Vercel URL, go back to Render → Environment → set
`CORS_ORIGIN` to it (e.g. `https://ici-tracker.vercel.app`), and redeploy the
API. Until you do this, the API accepts requests from any origin, which is
fine for getting things working but worth tightening afterward.

## 4. Build a downloadable Android APK

Steps 1–3 deploy the **web** version. For a real installable Android app
people can download and tap to install (not a Play Store listing — just a
`.apk` file), use EAS Build, Expo's cloud build service.

1. Create a free account at [expo.dev](https://expo.dev) if you don't have one.
2. Update `eas.json`'s `build.preview.env.EXPO_PUBLIC_API_URL` to your real
   Render URL from step 1 (it currently has a placeholder) — the APK needs a
   real backend to talk to, since `localhost` means nothing on someone else's
   phone.
3. Log in (this needs your own credentials, so run it yourself in a terminal):
   ```bash
   npx eas-cli login
   ```
4. Link this project to your Expo account (only needed once):
   ```bash
   npx eas-cli build:configure
   ```
5. Start the build:
   ```bash
   npx eas-cli build --platform android --profile preview
   ```
   This uploads your code and builds it on Expo's servers — typically 10–20
   minutes, depending on the queue. You can watch progress at the URL it
   prints, or on [expo.dev](https://expo.dev) under your project's Builds tab.
6. When it finishes, EAS gives you a download URL for the `.apk` (also
   visible on the Builds page). That link works for anyone — share it
   directly, or link to it from your Vercel site.

**Installing it:** Android blocks installs from outside the Play Store by
default. Whoever downloads the APK will need to allow "Install unknown apps"
for their browser/file manager when prompted — this is normal for
non-Play-Store APKs, not a bug.

**Note:** this APK is unsigned by a Play-Store-registered key (EAS
auto-generates a signing key for you the first time you build) — fine for
direct distribution, but if you ever move to publishing on the Play Store
later, that's a separate signing/setup step.

## Notes

- Both Render and Vercel redeploy automatically on every push to your
  connected branch, once set up. The Android APK does **not** auto-rebuild —
  you re-run step 4's `eas build` command whenever you want an updated APK.
- If you change the API URL later (e.g. Render URL changes), both the Vercel
  env var and `eas.json`'s value need updating, followed by a redeploy/rebuild
  of whichever one changed.
