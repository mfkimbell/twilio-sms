'use client';

import Image from 'next/image';

interface Conversation {
  conversationId: string;
  contactName: string;
  contactAvatar: string;
  lastMessageText: string;
  unreadCount: number;
  lastRead?: any; // Firestore Timestamp or Date; optional
}

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
}

export default function ConversationItem({
  conversation,
  isActive,
  onClick,
}: ConversationItemProps) {
  const { contactName, contactAvatar, lastMessageText, unreadCount, lastRead } = conversation;

  // Format lastRead date if available
  const lastReadFormatted = lastRead
    ? new Date(lastRead.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'Not read';

  return (
    <div
      onClick={onClick}
      className={`flex items-center p-3 cursor-pointer border-b border-gray-700 hover:bg-gray-700 ${
        isActive ? 'bg-gray-700' : ''
      }`}
    >
      <div className="mr-3">
        <Image
          src={contactAvatar || '/default-avatar.png'}
          alt={contactName}
          width={40}
          height={40}
          className="rounded-full object-cover"
        />
      </div>
      <div className="flex-1 overflow-hidden">
        <div className="flex justify-between">
          <div className="font-medium text-gray-100 truncate">{contactName}</div>
          <div className="text-xs text-gray-400">{lastReadFormatted}</div>
        </div>
        <div className="text-sm text-gray-400 truncate">
          {lastMessageText}
        </div>
      </div>
      {unreadCount > 0 && (
        <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full ml-2">
          {unreadCount}
        </span>
      )}
    </div>
  );
}
