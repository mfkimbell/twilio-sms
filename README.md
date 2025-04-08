# twilio-sms


## Admin UI

<img width="667" alt="Screenshot 2025-04-08 at 12 08 35 AM" src="https://github.com/user-attachments/assets/e25fe8de-9393-47b6-824f-6a882ff55129" />

## Client View

![IMG_5279](h)

<img width="167" alt="Screenshot 2025-04-08 at 12 08 35 AM" src="https://github.com/user-attachments/assets/f92e3a4d-fbbe-485b-ab9f-3f09d7f72cf6" />


## Architechture

<img width="1300" alt="sms_arch" src="https://github.com/user-attachments/assets/95ab688d-c8de-4d37-b686-09cdf1b6e49f" />


OnSnapshot sits on the frontend waiting for the database to change, when it detects a change, it cauess a component rerender. If we did it on the backend, we would have to notify the frontend in some way, 

Firestore security is primarily enforced via its **Security Rules**, not by obscuring your API keys. Here’s how it remains secure:

- **Public Firebase Config is Safe:**  
  The Firebase config (e.g. `apiKey`) is intended to be public. These keys don't grant full access—they only allow your app to connect. The real security comes from the rules you set in Firestore.

- **Firestore Security Rules:**  
  You write rules that define which authenticated users (or users with certain properties) can read or write to each collection. For example, you might require that a user can only read messages in a conversation if their UID is included in the `participants` field.

  ```js
  service cloud.firestore {
    match /databases/{database}/documents {
      match /conversations/{conversationId} {
        allow read, write: if request.auth != null
          && request.auth.uid in resource.data.participants;
      }
      match /messages/{messageId} {
        allow read, write: if request.auth != null
          && request.auth.uid in get(/databases/$(database)/documents/conversations/$(request.resource.data.conversationId)).data.participants;
      }
    }
  }
  ```

- **Authentication:**  
  When you integrate Firebase Auth, only authenticated users can access data. Your client-side code then gets an ID token that Firestore verifies against your security rules.

- **Server-Side API Routes (Optional):**  
  For additional security, you can route sensitive data operations through Next.js API routes using the Admin SDK. That way, the client never directly interacts with Firestore—your server enforces extra logic and validation.

- **Real-Time Listeners:**  
  Using `onSnapshot` in client components is secure as long as your Firestore Security Rules are correctly configured. Even if a user tries to listen to a collection, they will only receive data they’re permitted to see.

In summary, your CRUD operations and real-time subscriptions are secure as long as you:
1. Properly set up **Firestore Security Rules**.
2. Use **Firebase Auth** to authenticate users.
3. Optionally use server-side API routes to wrap sensitive operations.

This separation of concerns keeps your app both dynamic and secure.
We may initialize some data in Redux after login, for instance loading the contacts into Redux state or simply using Firestore hooks to feed components. Redux could also hold the currentUser object after login so that non-Firebase-aware components can easily access user info. We will likely set up a Redux slice for auth that gets populated on login. If using Next.js App Router, some of this can be done in a client context or by using the useAuthState hook from Firebase. The Redux store will continue to serve as a convenient client-state container, but Firestore’s own state (which is essentially the server state) doesn’t need to be duplicated in Redux unless we want caching; we can often use local component state for Firestore data or a lightweight state management for things like the active tab, etc.


eventually, i want to add a queue and workers, and i want to use firestore to automatically update the frontend to see message status updates without refreshing the page or using longpolling

can't use longpolling because...

Next.js API Routes (on Vercel, Netlify, etc.) can't do long polling
Serverless functions time out after ~10 seconds and can’t keep a connection open indefinitely.

lets use redux for toast notifications

`.env` for secrets

maybe use prisma orm, lets not use an ORM, since we need to refresh on SQL


lets try to add redis caching eventually

✅ Sessions
Server-side authentication.

Server stores session data (e.g., in memory, Redis, or a database).

The client stores only a session ID (usually in a cookie).


store secrets in .env file, nextJS loads this automatically


we could use `jest` for testing


we are going to be using Redux because that's what tilio uses
