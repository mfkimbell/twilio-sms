// src/app/api/sms-incoming/route.ts

import { NextRequest, NextResponse } from 'next/server';
import admin from 'firebase-admin';

// Initialize firebase-admin only if not already initialized.
if (!admin.apps.length) {
  // Only include the required keys.
  const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID!,
    // Replace escaped newline characters with real newlines
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')!,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
  };

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

export async function POST(req: NextRequest) {
  // Twilio sends SMS data as form-data.
  const formData = await req.formData();
  const from = formData.get('From')?.toString();
  const to = formData.get('To')?.toString();
  const body = formData.get('Body')?.toString();

  // Expected Twilio sandbox number that the admin uses.
  const twilioSandbox = 'whatsapp:+14155238886';

  // Validate that the message is sent to your expected Twilio sandbox number.
  if (!to || to !== twilioSandbox) {
    console.warn(`Received SMS for unexpected 'To' number: ${to}`);
    return NextResponse.json(
      { error: 'Message not sent to the sandbox number' },
      { status: 400 }
    );
  }

  // Validate required fields.
  if (!from || !body) {
    return NextResponse.json(
      { error: 'Missing required fields from the SMS request' },
      { status: 400 }
    );
  }

  // Extract the sender's number (the external contact).
  let incomingNumber = from;
  if (incomingNumber.startsWith('whatsapp:')) {
    incomingNumber = incomingNumber.replace('whatsapp:', '');
  }

  // The message comes from an external contact.
  // We want the admin (user "1") to see it.
  // Look for an existing contact based on the incoming number.
  const contactsSnapshot = await db
    .collection('contacts')
    .where('phoneNumber', '==', incomingNumber)
    .get();

  let contactId = '';
  let conversationId = '';
  const adminId = '1'; // Admin's ID

  if (!contactsSnapshot.empty) {
    // Contact exists.
    const contactDoc = contactsSnapshot.docs[0];
    contactId = contactDoc.id;

    // Look for an existing conversation between the admin and this contact.
    const convSnapshot = await db
      .collection('conversations')
      .where('participants', 'array-contains', adminId)
      .where('contactId', '==', contactId)
      .get();

    if (!convSnapshot.empty) {
      conversationId = convSnapshot.docs[0].id;
    } else {
      // Create a new conversation if it doesn't exist.
      const newConvRef = db.collection('conversations').doc();
      conversationId = newConvRef.id;
      const contactData = contactDoc.data();
      await newConvRef.set({
        conversationId,
        participants: [adminId, contactId],
        contactId,
        contactName: contactData.name,
        contactAvatar: contactData.profilePictureUrl || '/default-avatar.png',
        lastMessageText: '',
        lastMessageTime: admin.firestore.FieldValue.serverTimestamp(),
        unreadCount: 0,
      });
    }
  } else {
    // No contact exists: create a new one using the incoming number as the default name.
    const newContactRef = db.collection('contacts').doc();
    contactId = newContactRef.id;
    await newContactRef.set({
      contactId,
      name: incomingNumber,
      phoneNumber: incomingNumber,
      profilePictureUrl: '/default-avatar.png',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Create a new conversation between the admin and this new contact.
    const newConvRef = db.collection('conversations').doc();
    conversationId = newConvRef.id;
    await newConvRef.set({
      conversationId,
      participants: [adminId, contactId],
      contactId,
      contactName: incomingNumber,
      contactAvatar: '/default-avatar.png',
      lastMessageText: '',
      lastMessageTime: admin.firestore.FieldValue.serverTimestamp(),
      unreadCount: 0,
    });
  }

  // Record the incoming message into Firestore.
  const messageRef = db.collection('messages').doc();
  await messageRef.set({
    messageId: messageRef.id,
    senderId: contactId, // The sender is the external contact.
    recipientId: adminId, // The admin is the recipient.
    body,
    direction: 'incoming',
    conversationId,
    to: twilioSandbox, // Record the Twilio sandbox number for clarity.
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  // Update the conversation with the latest message.
  await db.collection('conversations').doc(conversationId).update({
    lastMessageText: body,
    lastMessageTime: admin.firestore.FieldValue.serverTimestamp(),
    unreadCount: admin.firestore.FieldValue.increment(1),
  });

  console.log(
    `Incoming message from ${incomingNumber} recorded in conversation: ${conversationId}`
  );

  // Respond with a valid TwiML response.
  return new NextResponse(
    '<Response><Message>Thanks, got it!</Message></Response>',
    { headers: { 'Content-Type': 'text/xml' } }
  );
}
