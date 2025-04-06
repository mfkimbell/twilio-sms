// src/app/api/sms-incoming/route.ts

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const from = formData.get('From');
  const body = formData.get('Body');

  console.log(`💬 Incoming from ${from}: ${body}`);

  return new NextResponse(`<Response><Message>Thanks, got it!</Message></Response>`, {
    headers: {
      'Content-Type': 'text/xml',
    },
  });
}
