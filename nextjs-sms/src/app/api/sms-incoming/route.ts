// src/app/api/sms-incoming/route.ts

import { NextRequest, NextResponse } from 'next/server';
import admin from 'firebase-admin';

// Initialize Firebase Admin only once using the minimal required keys.
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID!,
      // Replace literal "\n" with actual newline characters.
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')!,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
    }),
  });
}

const db = admin.firestore();

export async function POST(req: NextRequest) {
  // Parse incoming Twilio form-data.
  const formData = await req.formData();
  const from = formData.get('From')?.toString(); // external sender's number
  const to = formData.get('To')?.toString();     // should equal the sandbox number
  const body = formData.get('Body')?.toString();

  // Define the expected Twilio sandbox number that represents the admin's number.
  const twilioSandbox = 'whatsapp:+14155238886';

  // Validate that the "To" field matches the sandbox number.
  if (!to || to !== twilioSandbox) {
    console.warn(`Received SMS for unexpected 'To' number: ${to}`);
    return NextResponse.json(
      { error: 'Message not sent to the sandbox number' },
      { status: 400 }
    );
  }

  // Ensure required fields are present.
  if (!from || !body) {
    return NextResponse.json(
      { error: 'Missing required fields from the SMS request' },
      { status: 400 }
    );
  }

  // The "From" field is the external (customer) number.
  // Remove the "whatsapp:" prefix if present.
  let customerNumber = from;
  if (customerNumber.startsWith('whatsapp:')) {
    customerNumber = customerNumber.replace('whatsapp:', '');
  }

  // Look for an existing contact matching the customer's phone number.
  const contactsSnapshot = await db
    .collection('contacts')
    .where('phoneNumber', '==', customerNumber)
    .get();

  let contactId = '';
  let conversationId = '';
  const adminId = '1'; // Hard-coded admin user ID.

  if (!contactsSnapshot.empty) {
    // Use the existing contact.
    const contactDoc = contactsSnapshot.docs[0];
    contactId = contactDoc.id;
  } else {
    // No contact exists for this number; create one.
    const newContactRef = db.collection('contacts').doc();
    contactId = newContactRef.id;
    await newContactRef.set({
      contactId,
      name: customerNumber, // Default name is the number; you can update later.
      phoneNumber: customerNumber,
      profilePictureUrl: '/default-avatar.png',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  // Check for an existing conversation between the admin and this contact.
  const convSnapshot = await db
    .collection('conversations')
    .where('participants', 'array-contains', adminId)
    .where('contactId', '==', contactId)
    .get();

  if (!convSnapshot.empty) {
    conversationId = convSnapshot.docs[0].id;
  } else {
    // No conversation exists, so create a new one.
    const newConvRef = db.collection('conversations').doc();
    conversationId = newConvRef.id;
    await newConvRef.set({
      conversationId,
      participants: [adminId, contactId],
      contactId,
      contactName: customerNumber, // Default name from the number.
      contactAvatar: '/default-avatar.png',
      lastMessageText: '',
      lastMessageTime: admin.firestore.FieldValue.serverTimestamp(),
      unreadCount: 0,
    });
  }

  // Record the incoming message in the "messages" collection.
  // The sender is the external contact; the recipient is the admin.
  const messageRef = db.collection('messages').doc();
  await messageRef.set({
    messageId: messageRef.id,
    senderId: contactId, // Represents the external sender.
    recipientId: adminId, // Represents the admin.
    body,
    direction: 'incoming',
    conversationId,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  // Update the conversation's latest message data and increment the unread count.
  await db.collection('conversations').doc(conversationId).update({
    lastMessageText: body,
    lastMessageTime: admin.firestore.FieldValue.serverTimestamp(),
    unreadCount: admin.firestore.FieldValue.increment(1),
  });

  console.log(`Incoming message from ${customerNumber} recorded in conversation ${conversationId}`);

  // Return a valid TwiML response to Twilio.
  return new NextResponse(
    '<Response><Message>Thanks, got it!</Message></Response>',
    { headers: { 'Content-Type': 'text/xml' } }
  );
}
