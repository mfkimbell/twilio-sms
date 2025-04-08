// src/app/api/incoming-sms/route.ts

import { NextRequest, NextResponse } from 'next/server';
import admin from 'firebase-admin';

// Initialize firebase-admin if not already initialized.
if (!admin.apps.length) {
  const serviceAccount = {
    type: 'service_account',
    project_id: process.env.FIREBASE_PROJECT_ID, // ensure this is set
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: process.env.FIREBASE_AUTH_URI,
    token_uri: process.env.FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
    client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
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

  // Expected Twilio sandbox number (used by your admin).
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

  // Extract the incoming sender's number by stripping the "whatsapp:" prefix.
  let incomingNumber = from;
  if (incomingNumber.startsWith('whatsapp:')) {
    incomingNumber = incomingNumber.replace('whatsapp:', '');
  }

  // In your case, the incoming number represents the customer sending the message.
  // You want this message to appear on the admin's incoming side.
  // Check if there is already a contact for this incoming number.
  const contactsSnapshot = await db
    .collection('contacts')
    .where('phoneNumber', '==', incomingNumber)
    .get();

  let contactId = '';
  let conversationId = '';
  const adminId = '1'; // The admin's user ID

  if (!contactsSnapshot.empty) {
    // Contact exists, use it.
    const contactDoc = contactsSnapshot.docs[0];
    contactId = contactDoc.id;

    // Look for a conversation between the admin and this contact.
    const convSnapshot = await db
      .collection('conversations')
      .where('participants', 'array-contains', adminId)
      .where('contactId', '==', contactId)
      .get();

    if (!convSnapshot.empty) {
      conversationId = convSnapshot.docs[0].id;
    } else {
      // No conversation exists yet, create one.
      const newConvRef = db.collection('conversations').doc();
      conversationId = newConvRef.id;
      const contactData = contactDoc.data();
      await newConvRef.set({
        conversationId,
        participants: [adminId, contactId],
        contactId,
        contactName: contactData.name, // or use incomingNumber if you prefer
        contactAvatar: contactData.profilePictureUrl || '/default-avatar.png',
        lastMessageText: '',
        lastMessageTime: admin.firestore.FieldValue.serverTimestamp(),
        unreadCount: 0,
      });
    }
  } else {
    // No contact found. Create a new contact using the incoming number.
    const newContactRef = db.collection('contacts').doc();
    contactId = newContactRef.id;
    // Use the incoming number as the default name.
    await newContactRef.set({
      contactId,
      name: incomingNumber,
      phoneNumber: incomingNumber,
      profilePictureUrl: '/default-avatar.png',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Create a new conversation between admin and this new contact.
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

  // Record the incoming message in the "messages" collection.
  // This message is from the customer (incomingNumber) to the admin.
  const messageRef = db.collection('messages').doc();
  await messageRef.set({
    messageId: messageRef.id,
    senderId: contactId, // The sender is the customer (represented by their contact record)
    recipientId: adminId, // The admin is the recipient
    body,
    direction: 'incoming',
    conversationId,
    // Optionally, store the intended "to" number for audit purposes
    to: twilioSandbox,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  // Update the conversation with the latest message info.
  await db.collection('conversations').doc(conversationId).update({
    lastMessageText: body,
    lastMessageTime: admin.firestore.FieldValue.serverTimestamp(),
    unreadCount: admin.firestore.FieldValue.increment(1),
  });

  console.log(
    `Incoming message from ${incomingNumber} recorded in conversation: ${conversationId}`
  );

  // Respond with a valid TwiML response to Twilio.
  return new NextResponse(
    '<Response><Message>Thanks, got it!</Message></Response>',
    { headers: { 'Content-Type': 'text/xml' } }
  );
}
