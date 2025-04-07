import { NextResponse } from 'next/server';
import { MessageRepository } from '@/repositories/messageRepository';

export async function GET(request: Request) {
  // Example: /api/messages?conversationId=abc123
  const { searchParams } = new URL(request.url);
  const conversationId = searchParams.get('conversationId');
  if (!conversationId) {
    return NextResponse.json({ error: 'Missing conversationId' }, { status: 400 });
  }
  
  const messages = await MessageRepository.getMessagesByConversation(conversationId);
  return NextResponse.json(messages);
}

export async function POST(request: Request) {
  try {
    const messageData = await request.json();
    // messageData should follow the Message interface shape
    const messageId = await MessageRepository.createMessage(messageData);
    return NextResponse.json({ messageId }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
