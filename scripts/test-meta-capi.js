const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');

let pixelId = '';
let capiToken = '';

envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed.startsWith('META_PIXEL_ID=')) {
    pixelId = trimmed.split('=')[1].trim();
  }
  if (trimmed.startsWith('META_CAPI_TOKEN=')) {
    capiToken = trimmed.split('=')[1].trim();
  }
});

console.log('Testing Meta CAPI with Pixel ID:', pixelId);
console.log('Token Prefix:', capiToken.substring(0, 15) + '...');

async function testMetaEvent() {
  const eventId = 'TEST_ORDER_' + Date.now();
  const testPhone = '0555123456';
  const cleanPhone = '213' + testPhone.substring(1);
  const hashedPhone = crypto.createHash('sha256').update(cleanPhone).digest('hex');

  const payload = {
    data: [
      {
        event_name: 'Purchase',
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId,
        action_source: 'website',
        event_source_url: 'http://localhost:3000/merci.html',
        user_data: {
          ph: [hashedPhone],
          fn: [crypto.createHash('sha256').update('mohamed').digest('hex')],
          ln: [crypto.createHash('sha256').update('benali').digest('hex')],
          ct: [crypto.createHash('sha256').update('alger').digest('hex')]
        },
        custom_data: {
          currency: 'DZD',
          value: 3350,
          content_name: 'نظارات رياضية للأطفال (<12 سنة)',
          content_ids: ['KIDS-OPTIC-SPORT'],
          content_type: 'product'
        }
      }
    ]
  };

  const url = `https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${capiToken}`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    console.log('HTTP Status:', res.status);
    console.log('Response body:', JSON.stringify(data, null, 2));

    if (res.ok && data.events_received > 0) {
      console.log('✅ SUCCÈS : Meta a bien reçu et validé l\'événement CAPI !');
    } else {
      console.error('❌ ÉCHEC : Erreur retournée par Meta Graph API');
    }
  } catch (err) {
    console.error('Erreur réseau / fetch:', err);
  }
}

testMetaEvent();
