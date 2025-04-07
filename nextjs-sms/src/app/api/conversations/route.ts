import { NextResponse } from 'next/server';
import { ConversationRepository } from '@/repositories/conversationRepository';

export async function GET(request: Request) {
  // Example: /api/conversations?userId=1
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }
  
  const conversations = await ConversationRepository.getConversationsByUser(userId);
  return NextResponse.json(conversations);
}

export async function POST(request: Request) {
  try {
    const conversationData = await request.json();
    // conversationData should follow the Conversation interface shape
    const conversationId = await ConversationRepository.createConversation(conversationData);
    return NextResponse.json({ conversationId }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
