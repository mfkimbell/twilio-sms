'use client';

import { useState } from 'react';
import ConversationsList from './components/ConversationsList';
import ChatWindow from './components/ChatWindow';

export default function DashboardPage() {
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  return (
    <div className="h-screen flex bg-gray-900 text-gray-100">
      {/* Left sidebar */}
      <div className="w-1/4 border-r border-gray-700">
        <ConversationsList 
          activeConversationId={activeConversationId}
          onSelectConversation={(id: any) => setActiveConversationId(id)}
        />
      </div>

      {/* Right chat panel */}
      <div className="flex-1">
        {activeConversationId ? (
          <ChatWindow conversationId={activeConversationId} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            Select a conversation
          </div>
        )}
      </div>
    </div>
  );
}
