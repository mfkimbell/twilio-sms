'use client';

interface Message {
  messageId?: string;
  senderId: string;
  recipientIds?: string[];
  body: string;
  direction: 'incoming' | 'outgoing';
}

interface MessageItemProps {
  message: Message;
}

export default function MessageItem({ message }: MessageItemProps) {
  const isOutgoing = message.direction === 'outgoing';

  return (
    <div className={`flex my-2 ${isOutgoing ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`rounded-3xl px-3 py-2 max-w-xs ${
          isOutgoing
            ? 'bg-blue-600 text-white'
            : 'bg-gray-700 text-gray-100'
        }`}
      >
        {message.body}
      </div>
    </div>
  );
}
