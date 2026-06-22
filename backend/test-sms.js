require('dotenv').config();

const apiKey     = process.env.SEMAPHORE_API_KEY;
const senderName = process.env.SEMAPHORE_SENDER_NAME || 'SEMAPHORE';
const to         = '09231640368'; // test number

console.log('API Key:', apiKey ? apiKey.slice(0, 6) + '...' : 'NOT SET');
console.log('Sender: ', senderName);
console.log('To:     ', to);

fetch('https://api.semaphore.co/api/v4/messages', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    apikey:     apiKey,
    number:     to,
    message:    'Test SMS from Trophe system',
    sendername: senderName,
  }),
})
  .then(r => r.text())
  .then(text => {
    console.log('Raw response:', text);
    try {
      const data = JSON.parse(text);
      if (data[0]?.message_id) {
        console.log('✅ Success! message_id:', data[0].message_id, '| status:', data[0].status);
      } else {
        console.error('❌ Error:', JSON.stringify(data));
      }
    } catch {
      console.error('❌ Non-JSON response:', text);
    }
  })
  .catch(err => console.error('❌ Fetch error:', err.message));
