'use client';

import { useEffect, useState } from 'react';
import { db,  } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  addDoc,
  getDoc,
  doc,
} from 'firebase/firestore';
import MessageItem from './MessageItem';

interface ChatWindowProps {
  conversationId: string;
}

export interface Message {
  messageId?: string;
  senderId: string;
  // For group messages, we can store recipientIds as an array
  recipientIds?: string[];
  body: string;
  direction: 'incoming' | 'outgoing';
  createdAt: any; // Firestore timestamp
}

export default function ChatWindow({ conversationId }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    async function markConversationRead() {
      const conversationRef = doc(db, 'conversations', conversationId);
      await updateDoc(conversationRef, {
        unreadCount: 0,
        lastRead: new Date(), // optional: store when it was last read
      });
    }
  
    if (conversationId) {
      markConversationRead();
    }
  }, [conversationId]);

  // Listen for live updates for messages in this conversation
  useEffect(() => {
    const q = query(
      collection(db, 'messages'),
      where('conversationId', '==', conversationId),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: Message[] = [];
      snapshot.forEach((doc) => {
        msgs.push({ messageId: doc.id, ...doc.data() } as Message);
      });
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [conversationId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      // 1. Fetch the conversation document to know participants
      const conversationRef = doc(db, 'conversations', conversationId);
      const conversationSnap = await getDoc(conversationRef);
      if (!conversationSnap.exists()) {
        throw new Error('Conversation not found');
      }
      const conversation = conversationSnap.data() as {
        participants: string[];
      };

      // 2. Filter out the admin (assumed ID is "1") to get recipients
      const recipientIds = conversation.participants.filter((id) => id !== '1');

      // 3. For each recipient, fetch their phone number from the contacts collection
      const phoneNumbers: string[] = [];
      for (const recipientId of recipientIds) {
        const contactRef = doc(db, 'contacts', recipientId);
        const contactSnap = await getDoc(contactRef);
        if (contactSnap.exists()) {
          const contact = contactSnap.data() as { phoneNumber: string };
          if (contact.phoneNumber) {
            phoneNumbers.push(contact.phoneNumber);
          }
        }
      }

      // 4. Send the SMS via the API route for each recipient
      //    Your API route /api/sms-send uses POST with { message, to }
      for (const to of phoneNumbers) {
        const response = await fetch('/api/sms-send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: newMessage.trim(),
            to, // Recipient phone number
          }),
        });
        const result = await response.json();
        if (!result.success) {
          console.error(`Error sending message to ${to}:`, result.error);
        } else {
          console.log(`Message sent to ${to} with SID:`, result.sid);
        }
      }

      // 5. If the messages were sent successfully via Twilio,
      //    add one message document to Firestore to record the sent message.
      await addDoc(collection(db, 'messages'), {
        senderId: '1', // admin
        recipientIds,  // group recipients as an array
        body: newMessage.trim(),
        direction: 'outgoing',
        conversationId,
        createdAt: new Date(),
      });

      setNewMessage('');
    } catch (err: any) {
      console.error('Failed to send message:', err);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-900 text-gray-100">
      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((msg) => (
          <MessageItem key={msg.messageId} message={msg} />
        ))}
      </div>

      {/* Input Box */}
      <div className="border-t border-gray-700 p-3">
        <div className="flex">
          <input
            className="flex-1 border border-gray-700 rounded-l px-3 py-2 outline-none bg-gray-800 text-gray-100"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-r"
            onClick={handleSendMessage}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
