// src/lib/seedFirestore.js

const admin = require('firebase-admin');
const serviceAccount = require('../../service-account.json');

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

async function seedFirestore() {
  const contactId = 'contact_001';

  // USERS
  await db.collection('users').doc('1').set({
    uid: '1',
    name: 'Mitchell',
    email: 'mfkimbell@gmail.com',
    cell: '+12053128982',
    img: 'https://your-image-url.com/avatar.jpg',
    role: 'admin',
  });

  // CONTACTS
  await db.collection('contacts').doc(contactId).set({
    contactId,
    name: 'Jenny',
    phoneNumber: '+15558675309',
    profilePictureUrl: 'https://your-image-url.com/jenny.jpg',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  // CONVERSATIONS
  await db.collection('conversations').doc(contactId).set({
    conversationId: contactId,
    contactId,
    contactName: 'Jenny',
    contactAvatar: 'https://your-image-url.com/jenny.jpg',
    lastMessageText: 'Hello Jenny!',
    lastMessageTime: admin.firestore.FieldValue.serverTimestamp(),
    lastMessageOutgoing: true,
    unreadCount: 0,
    userId: '1',
  });

  // MESSAGES
  const messageRef = db.collection('messages').doc();
  await messageRef.set({
    messageId: messageRef.id,
    conversationId: contactId,
    senderId: '1',
    recipientId: contactId,
    body: 'Hello Jenny!',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    direction: 'outgoing',
  });

  console.log('✅ Firestore seeded successfully!');
}

seedFirestore().catch(console.error);
