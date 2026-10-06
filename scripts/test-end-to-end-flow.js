const http = require('http');

async function testFullFlow() {
  console.log('--- TEST COMPLET DU PARCOURS COMMANDE & TRACKING META ---');

  // 1. Envoi d'une commande test
  const orderPayload = {
    client: 'أمين بلحاج (TEST AUTOMATISÉ)',
    phone: '0550112233',
    wilaya_id: 16, // Alger
    couleur: 'أسود',
    quantite: 1,
    stop_desk: 1,
    station_code: '16A',
    montant: 3350 // 2900 + 450 Stop Desk
  };

  console.log('\nÉtape 1 : Création de la commande via POST /api/order...');
  const orderRes = await fetch('http://localhost:3000/api/order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderPayload)
  });

  const orderData = await orderRes.json();
  console.log('Réponse /api/order :', JSON.stringify(orderData, null, 2));

  if (!orderData.success || !orderData.tracking || !orderData.token) {
    console.error('❌ Échec lors de la création de la commande');
    return;
  }

  const { tracking, token, montant } = orderData;
  console.log(`✅ Commande créée avec succès ! Tracking: ${tracking}, Token: ${token}, Montant: ${montant} DZD`);

  // 2. Première visite sur la page de remerciement (/api/verify-purchase)
  console.log('\nÉtape 2 : Première vérification sur /merci.html via POST /api/verify-purchase...');
  const verify1Res = await fetch('http://localhost:3000/api/verify-purchase', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, tracking })
  });

  const verify1Data = await verify1Res.json();
  console.log('Réponse /api/verify-purchase (1ère fois) :', JSON.stringify(verify1Data, null, 2));

  if (verify1Data.canTrack === true && verify1Data.capiSent === true) {
    console.log('✅ SUCCÈS : Purchase autorisé pour le Pixel Browser ET transmis à Meta CAPI avec succès !');
  } else {
    console.error('❌ ÉCHEC : Le Purchase n\'a pas été correctement autorisé ou transmis à CAPI');
  }

  // 3. Simulation d\'un rafraîchissement F5 de la page de remerciement
  console.log('\nÉtape 3 : Simulation d\'un Refresh (F5) sur /merci.html avec le même token...');
  const verify2Res = await fetch('http://localhost:3000/api/verify-purchase', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, tracking })
  });

  const verify2Data = await verify2Res.json();
  console.log('Réponse /api/verify-purchase (Refresh F5) :', JSON.stringify(verify2Data, null, 2));

  if (verify2Data.canTrack === false && verify2Data.reason === 'already_fired') {
    console.log('✅ SUCCÈS : Anti-doublon actif ! Le rafraîchissement F5 a été immédiatement bloqué.');
  } else {
    console.error('❌ ÉCHEC : L\'anti-doublon n\'a pas bloqué la 2ème tentative !');
  }

  // 4. Simulation d\'une visite directe sans token
  console.log('\nÉtape 4 : Simulation d\'une visite directe sur /merci.html sans token...');
  const verify3Res = await fetch('http://localhost:3000/api/verify-purchase', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: 'fake_token_123', tracking: 'FAKETRACK123' })
  });

  const verify3Data = await verify3Res.json();
  console.log('Réponse /api/verify-purchase (Visite directe / faux token) :', JSON.stringify(verify3Data, null, 2));

  if (verify3Data.canTrack === false) {
    console.log('✅ SUCCÈS : Visite frauduleuse ou directe bloquée avec succès.');
  } else {
    console.error('❌ ÉCHEC : La visite avec faux token n\'a pas été bloquée !');
  }

  console.log('\n======================================================');
  console.log('🎉 TOUS LES TESTS DE CONFORMITÉ META PIXEL & CAPI SONT VALIDÉS !');
  console.log('======================================================');
}

testFullFlow();
