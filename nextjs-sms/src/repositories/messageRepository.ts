import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  DocumentReference,
  DocumentData,
} from 'firebase/firestore';
import { v4 as uuid } from 'uuid';

export interface Message {
  messageId?: string;
  conversationId: string;
  senderId: string;
  recipientId: string;
  body: string;
  direction: 'incoming' | 'outgoing';
  createdAt?: any; // Firestore Timestamp (or Date)
}

export class MessageRepository {
  static messagesCol = collection(db, 'messages');

  static async createMessage(message: Message): Promise<string> {
    const docRef = await addDoc(this.messagesCol, {
      ...message,
      createdAt: new Date(),
    });
    return docRef.id;
  }

  static async getMessagesByConversation(conversationId: string): Promise<Message[]> {
    const q = query(
      this.messagesCol,
      where('conversationId', '==', conversationId),
      orderBy('createdAt', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ messageId: doc.id, ...doc.data() })) as Message[];
  }

  static async updateMessage(messageId: string, partial: Partial<Message>): Promise<void> {
    const ref: DocumentReference<DocumentData> = doc(db, 'messages', messageId);
    await updateDoc(ref, partial);
  }

  static async deleteMessage(messageId: string): Promise<void> {
    const ref: DocumentReference<DocumentData> = doc(db, 'messages', messageId);
    await deleteDoc(ref);
  }
}
