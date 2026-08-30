import { db, COLLECTIONS } from '../config/firebase';
import { generateId } from '../utils/ids';
import { User } from '../types';

export async function findUserByEmail(email: string): Promise<User | null> {
  const snapshot = await db
    .collection(COLLECTIONS.users)
    .where('email', '==', email.toLowerCase())
    .limit(1)
    .get();

  if (snapshot.empty) return null;
  return snapshot.docs[0].data() as User;
}

export async function findUserById(id: string): Promise<User | null> {
  const doc = await db.collection(COLLECTIONS.users).doc(id).get();
  return doc.exists ? (doc.data() as User) : null;
}

export async function createUser(params: {
  email: string;
  passwordHash: string;
  storeName: string;
}): Promise<User> {
  const user: User = {
    id: generateId(),
    email: params.email.toLowerCase(),
    passwordHash: params.passwordHash,
    storeName: params.storeName,
    createdAt: new Date().toISOString(),
  };

  await db.collection(COLLECTIONS.users).doc(user.id).set(user);
  return user;
}
