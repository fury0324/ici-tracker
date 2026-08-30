import admin from 'firebase-admin';

function initializeFirebase(): admin.app.App {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  const usingEmulator = Boolean(process.env.FIRESTORE_EMULATOR_HOST);

  if (usingEmulator) {
    // The emulator doesn't validate credentials, so a placeholder project id is enough.
    return admin.initializeApp({ projectId: process.env.FIREBASE_PROJECT_ID ?? 'ici-tracker-dev' });
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      'Missing Firebase Admin credentials. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and ' +
        'FIREBASE_PRIVATE_KEY in server/.env, or set FIRESTORE_EMULATOR_HOST to run against the ' +
        'local emulator. See server/README.md for setup instructions.'
    );
  }

  return admin.initializeApp({
    credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
  });
}

export const firebaseApp = initializeFirebase();
export const db = firebaseApp.firestore();

export const COLLECTIONS = {
  users: 'users',
  products: 'products',
  transactions: 'transactions',
} as const;
