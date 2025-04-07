import { db } from '@/lib/firebase';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  DocumentReference,
  DocumentData,
} from 'firebase/firestore';
import { v4 as uuid } from 'uuid';

export interface Contact {
  contactId?: string; // generated if missing
  name: string;
  phoneNumber: string;
  profilePictureUrl: string;
  createdAt?: any; // Firestore Timestamp (or Date)
}

export class ContactRepository {
  static getContactDocRef(contactId: string): DocumentReference<DocumentData> {
    return doc(db, 'contacts', contactId);
  }

  static async createContact(contact: Contact): Promise<string> {
    const contactId = contact.contactId || uuid();
    const ref = this.getContactDocRef(contactId);
    await setDoc(ref, { ...contact, contactId, createdAt: new Date() });
    return contactId;
  }

  static async getContactById(contactId: string): Promise<Contact | null> {
    const ref = this.getContactDocRef(contactId);
    const snapshot = await getDoc(ref);
    if (!snapshot.exists()) return null;
    return snapshot.data() as Contact;
  }

  static async updateContact(contactId: string, partial: Partial<Contact>): Promise<void> {
    const ref = this.getContactDocRef(contactId);
    await updateDoc(ref, partial);
  }

  static async deleteContact(contactId: string): Promise<void> {
    const ref = this.getContactDocRef(contactId);
    await deleteDoc(ref);
  }

  static async getAllContacts(): Promise<Contact[]> {
    const snapshot = await getDocs(collection(db, 'contacts'));
    return snapshot.docs.map(doc => doc.data() as Contact);
  }
}
