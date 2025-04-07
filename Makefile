# fake public endpoint
ngrok http 3000

# start server
npm run dev

# incoming webhook
I'm going to need a public URL to do incoming webhook
https://console.twilio.com/us1/monitor/logs/debugger/webhook

# callbacks
same with status callback

  const sentMessage = await client.messages.create({
      body: message,
      from: 'whatsapp:+14155238886', // Twilio sandbox number
      to: `whatsapp:${to}`, // your verified WhatsApp number
      // statusCallback: 'https://localhost:3000/api/twilio/status'
    });

# start the database
node src/lib/seedFirestore.js







