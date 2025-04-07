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

export interface Conversation {
  conversationId?: string; // generated if missing
  participants: string[];  // e.g. [adminId, contactId]
  contactId: string;       // primary contact for display
  contactName: string;
  contactAvatar: string;
  lastMessageText: string;
  lastMessageTime?: any;   // Firestore Timestamp (or Date)
  lastMessageOutgoing: boolean;
  unreadCount: number;
  userId: string;          // the admin user id
}

export class ConversationRepository {
  static getConversationDocRef(conversationId: string): DocumentReference<DocumentData> {
    return doc(db, 'conversations', conversationId);
  }

  static async createConversation(conversation: Conversation): Promise<string> {
    const conversationId = conversation.conversationId || uuid();
    const ref = this.getConversationDocRef(conversationId);
    await setDoc(ref, {
      ...conversation,
      conversationId,
      lastMessageTime: new Date(),
    });
    return conversationId;
  }

  static async getConversationById(conversationId: string): Promise<Conversation | null> {
    const ref = this.getConversationDocRef(conversationId);
    const snapshot = await getDoc(ref);
    if (!snapshot.exists()) return null;
    return snapshot.data() as Conversation;
  }

  static async updateConversation(conversationId: string, partial: Partial<Conversation>): Promise<void> {
    const ref = this.getConversationDocRef(conversationId);
    await updateDoc(ref, partial);
  }

  static async deleteConversation(conversationId: string): Promise<void> {
    const ref = this.getConversationDocRef(conversationId);
    await deleteDoc(ref);
  }

  static async getConversationsByUser(userId: string): Promise<Conversation[]> {
    // Ideally, you should query where 'participants' array contains the userId.
    // For simplicity, here we fetch all and filter in code.

    const snapshot = await getDocs(collection(db, 'conversations'));
console.log('Fetched docs:', snapshot.docs.length);
snapshot.docs.forEach(doc => {
  console.log('Doc data:', doc.data());
});


    return snapshot.docs
      .map(doc => doc.data() as Conversation)
      .filter(convo => convo.participants.includes(userId));
  }
}
