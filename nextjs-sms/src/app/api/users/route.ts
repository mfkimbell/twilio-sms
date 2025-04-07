import { NextResponse } from 'next/server';
import { UserRepository } from '@/repositories/userRepository';

export async function GET(request: Request) {
  // Example: /api/users?uid=some-user-id
  const { searchParams } = new URL(request.url);
  const uid = searchParams.get('uid');
  if (!uid) {
    return NextResponse.json({ error: 'Missing uid' }, { status: 400 });
  }
  
  const user = await UserRepository.getUserById(uid);
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
  
  return NextResponse.json(user);
}

export async function POST(request: Request) {
  try {
    const userData = await request.json();
    // userData should follow the User interface shape
    const uid = await UserRepository.createUser(userData);
    return NextResponse.json({ uid }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
