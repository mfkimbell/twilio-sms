// src/app/api/incoming-sms/route.ts

import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';

console.log("🔍 send-sms route loaded");


export async function POST(req: NextRequest) {
  const { message, to } = await req.json();

  const accountSid = process.env.TWILIO_ACCOUNT_SID!;
  const authToken = process.env.TWILIO_AUTH_TOKEN!;


  console.log("✅ TWILIO_ACCOUNT_SID:", accountSid);
  console.log("✅ TWILIO_AUTH_TOKEN:", authToken ? "Loaded ✅" : "Missing ❌");


  const client = twilio(accountSid, authToken);

  try {
    const sentMessage = await client.messages.create({
      body: message,
      from: 'whatsapp:+14155238886', // Twilio sandbox number
      to: `whatsapp:${to}`, // your verified WhatsApp number
      // statusCallback: 'https://localhost:3000/api/twilio/status'
    });

    return NextResponse.json({ success: true, sid: sentMessage.sid });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
