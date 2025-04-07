'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import ConversationItem from './ConversationItem';

interface ConversationsListProps {
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
}

interface Conversation {
  conversationId: string;
  contactName: string;
  contactAvatar: string;
  lastMessageText: string;
  lastMessageTime: any;
  unreadCount: number;
}

export default function ConversationsList({
  activeConversationId,
  onSelectConversation,
}: ConversationsListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', '1'),
      orderBy('lastMessageTime', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const results = snapshot.docs.map((doc) => doc.data() as Conversation);
      setConversations(results);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="h-full overflow-y-auto bg-gray-800">
      {conversations.map((conv) => (
        <ConversationItem
          key={conv.conversationId}
          conversation={conv}
          isActive={conv.conversationId === activeConversationId}
          onClick={() => onSelectConversation(conv.conversationId)}
        />
      ))}
    </div>
  );
}
