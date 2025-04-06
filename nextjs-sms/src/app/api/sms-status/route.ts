// src/app/api/sms-status/route.ts

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const data = await req.formData();

  console.log('📬 Status Callback:', {
    messageSid: data.get('MessageSid'),
    messageStatus: data.get('MessageStatus'),
  });

  return NextResponse.json({ received: true });
}
