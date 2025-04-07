const admin = require('firebase-admin');
const serviceAccount = {
  type: 'service_account',
  project_id: process.env.FIREBASE_PROJECT_ID, // ensure this is set (could be same as NEXT_PUBLIC_FIREBASE_PROJECT_ID)
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
};


if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

async function seedFirestore() {
  const userId1 = '1';
  const userId2 = '2';

  // USERS
  await db.collection('users').doc(userId1).set({
    uid: userId1,
    name: 'Mitchell',
    email: 'mfkimbell@gmail.com',
    cell: '+12053128982',
    img: 'https://media.licdn.com/dms/image/v2/D4E03AQFsP3S1WURMag/profile-displayphoto-shrink_100_100/profile-displayphoto-shrink_100_100/0/1720643781530?e=1749686400&v=beta&t=CSKXLuq_ddFU0hNsqyTPwrGSHnLvTkFxDzTvUP1G81E',
    role: 'admin',
  });

  await db.collection('users').doc(userId2).set({
    uid: userId2,
    name: 'Alex',
    email: 'alex@example.com',
    cell: '+12051112222',
    img: 'https://media.licdn.com/dms/image/v2/C4E03AQGq3MlnM8_0vA/profile-displayphoto-shrink_100_100/profile-displayphoto-shrink_100_100/0/1661566311132?e=1749686400&v=beta&t=Fkq7druEqn0kUNq8pgqLOtDDIDwE7dvK9rVLhvXrM60',
    role: 'admin',
  });

  const contacts = [
    {
      name: 'Anna',
      phoneNumber: '+12053128982',
      profilePictureUrl: 'https://media.licdn.com/dms/image/v2/D4E03AQFGXJVGhNdxpw/profile-displayphoto-shrink_100_100/profile-displayphoto-shrink_100_100/0/1709772478587?e=1749686400&v=beta&t=lukgVCK4LnjC5KDx5hMzSA5lizQvhfZvYRrnZP-jxzQ',
    },
    {
      name: 'Ben',
      phoneNumber: '+12053128982',
      profilePictureUrl: 'https://media.licdn.com/dms/image/v2/D5603AQGWMj-C1-cHcg/profile-displayphoto-shrink_100_100/profile-displayphoto-shrink_100_100/0/1696177669468?e=1749686400&v=beta&t=wfIEvnG8rXc11rSmHSwqFQoP8O5qRqbgPMJVuS7Qi3U'    
    },
  ];

  for (const contact of contacts) {
    const contactRef = db.collection('contacts').doc();
    const contactId = contactRef.id;
    const { name, phoneNumber, profilePictureUrl } = contact;

    // Save contact
    await contactRef.set({
      contactId,
      name,
      phoneNumber,
      profilePictureUrl,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    const adminUsers = [userId1, userId2];

    for (const adminId of adminUsers) {
      const conversationRef = db.collection('conversations').doc();
      const conversationId = conversationRef.id;

      await conversationRef.set({
        conversationId,
        participants: [adminId, contactId],
        contactId,
        contactName: name,
        contactAvatar: profilePictureUrl,
        lastMessageText: `Last message with ${name}`,
        lastMessageTime: admin.firestore.FieldValue.serverTimestamp(),
        lastMessageOutgoing: Math.random() > 0.5,
        unreadCount: Math.floor(Math.random() * 3),
      });

      const messages = [
        {
          senderId: adminId,
          recipientId: contactId,
          body: `Hey ${name}, just checking in.`,
          direction: 'outgoing',
        },
        {
          senderId: contactId,
          recipientId: adminId,
          body: `Hey ${adminId === userId1 ? 'Mitchell' : 'Alex'}! All good here.`,
          direction: 'incoming',
        },
        {
          senderId: adminId,
          recipientId: contactId,
          body: `Cool, let's sync up later.`,
          direction: 'outgoing',
        },
      ];

      for (const msg of messages) {
        const messageRef = db.collection('messages').doc();
        await messageRef.set({
          ...msg,
          messageId: messageRef.id,
          conversationId,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
    }
  }

  console.log('✅ Firestore seeded with randomly generated conversationIds!');
}

seedFirestore().catch(console.error);