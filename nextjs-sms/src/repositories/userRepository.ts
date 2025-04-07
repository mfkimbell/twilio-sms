import { db } from '@/lib/firebase';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  DocumentReference,
  DocumentData,
} from 'firebase/firestore';
import { v4 as uuid } from 'uuid';

export interface User {
  uid?: string; // optional; generated if missing
  name: string;
  email: string;
  cell: string;
  img: string;
  role: string;
}

export class UserRepository {
  static getUserDocRef(uid: string): DocumentReference<DocumentData> {
    return doc(db, 'users', uid);
  }

  static async createUser(user: User): Promise<string> {
    const uid = user.uid || uuid();
    const ref = this.getUserDocRef(uid);
    await setDoc(ref, { ...user, uid });
    return uid;
  }

  static async getUserById(uid: string): Promise<User | null> {
    const ref = this.getUserDocRef(uid);
    const snapshot = await getDoc(ref);
    if (!snapshot.exists()) return null;
    return snapshot.data() as User;
  }

  static async updateUser(uid: string, partial: Partial<User>): Promise<void> {
    const ref = this.getUserDocRef(uid);
    await updateDoc(ref, partial);
  }

  static async deleteUser(uid: string): Promise<void> {
    const ref = this.getUserDocRef(uid);
    await deleteDoc(ref);
  }
}
