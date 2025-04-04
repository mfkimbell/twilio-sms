# twilio-sms

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
