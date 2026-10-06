const express = require('express');
const path = require('path');
const fs = require('fs');

// Chargement des variables d'environnement depuis .env
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [key, ...values] = trimmed.split('=');
      process.env[key.trim()] = values.join('=').trim();
    }
  });
}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Configuration NOEST
const NOEST_BASE_URL = process.env.NOEST_BASE_URL || 'https://app.noest-dz.com';
const NOEST_API_TOKEN = process.env.NOEST_API_TOKEN || 'JlLZKsPRF6eClTd4v2NaDfS60JZLbgxtWfd';
const NOEST_USER_GUID = process.env.NOEST_USER_GUID || 'UHGCDOGE';

const crypto = require('crypto');

// Configuration Meta Pixel & Conversions API (CAPI)
const META_PIXEL_ID = process.env.META_PIXEL_ID || '1422859033068055';
const META_CAPI_TOKEN = process.env.META_CAPI_TOKEN || '';
const META_TEST_EVENT_CODE = process.env.META_TEST_EVENT_CODE || '';

// Fonction de hachage SHA-256 pour les données client Meta
function hashSha256(val) {
  if (!val) return null;
  return crypto.createHash('sha256').update(val.toString().trim().toLowerCase()).digest('hex');
}

// Fonction d'envoi d'événement Meta Conversions API (CAPI)
async function sendMetaCapiEvent({
  eventName,
  eventId,
  value,
  currency = 'DZD',
  client = '',
  phone = '',
  city = '',
  ip = '',
  userAgent = '',
  sourceUrl = ''
}) {
  if (!META_PIXEL_ID || !META_CAPI_TOKEN) {
    console.warn('[Meta CAPI] Pixel ID ou Token CAPI manquant, envoi ignoré.');
    return { success: false, reason: 'missing_credentials' };
  }

  // Normalisation du téléphone algérien au format international E.164 (ex: 213550123456)
  let cleanPhone = phone.replace(/\s+/g, '').replace(/^(\+213|00213)/, '0');
  let intlPhone = cleanPhone;
  if (cleanPhone.startsWith('0')) {
    intlPhone = '213' + cleanPhone.slice(1);
  }

  // Découpage Prénom / Nom
  const nameParts = client.trim().split(/\s+/);
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || firstName;

  const userData = {};
  if (intlPhone) userData.ph = [hashSha256(intlPhone)];
  if (firstName) userData.fn = [hashSha256(firstName)];
  if (lastName) userData.ln = [hashSha256(lastName)];
  if (city) userData.ct = [hashSha256(city)];
  if (ip && ip !== '::1' && ip !== '127.0.0.1') userData.client_ip_address = ip;
  if (userAgent) userData.client_user_agent = userAgent;

  const eventData = {
    event_name: eventName,
    event_time: Math.floor(Date.now() / 1000),
    event_id: eventId, // Identique à { eventID: eventId } dans le Pixel JS pour la déduplication
    action_source: 'website',
    event_source_url: sourceUrl || undefined,
    user_data: userData,
    custom_data: {
      currency: currency,
      value: parseFloat(value) || 0,
      content_name: 'نظارات رياضية للأطفال (<12 سنة)',
      content_ids: ['KIDS-OPTIC-SPORT'],
      content_type: 'product'
    }
  };

  const payload = {
    data: [eventData]
  };

  if (META_TEST_EVENT_CODE) {
    payload.test_event_code = META_TEST_EVENT_CODE;
  }

  try {
    const metaUrl = `https://graph.facebook.com/v19.0/${META_PIXEL_ID}/events?access_token=${META_CAPI_TOKEN}`;
    const res = await fetch(metaUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    console.log(`[Meta CAPI] Événement '${eventName}' envoyé avec succès (event_id: ${eventId}) ! Réponse Graph API:`, data);
    return { success: res.ok, data };
  } catch (err) {
    console.error(`[Meta CAPI Error] Échec de transmission '${eventName}':`, err.message);
    return { success: false, error: err.message };
  }
}

// Cache mémoire des données NOEST
let cachedWilayas = [];
let cachedFees = {};
let cachedDesks = {};
let lastFetchTime = 0;

async function fetchNoestReferenceData() {
  const now = Date.now();
  // Mise à jour du cache toutes les 30 minutes
  if (cachedWilayas.length > 0 && (now - lastFetchTime) < 30 * 60 * 1000) {
    return;
  }

  try {
    const headers = {
      'Authorization': `Bearer ${NOEST_API_TOKEN}`,
      'Content-Type': 'application/json'
    };

    const [wilayasRes, feesRes, desksRes] = await Promise.all([
      fetch(`${NOEST_BASE_URL}/api/public/get/wilayas`, { headers }),
      fetch(`${NOEST_BASE_URL}/api/public/fees`, { headers }),
      fetch(`${NOEST_BASE_URL}/api/public/desks`, { headers })
    ]);

    if (wilayasRes.ok) cachedWilayas = await wilayasRes.json();
    if (feesRes.ok) {
      const feesJson = await feesRes.json();
      cachedFees = feesJson.tarifs?.delivery || {};
    }
    if (desksRes.ok) cachedDesks = await desksRes.json();

    lastFetchTime = now;
    console.log('[NOEST API] Données de référence synchronisées avec succès en direct !');
  } catch (err) {
    console.error('[NOEST API] Erreur synchronisation des données de référence:', err.message);
  }
}

// Endpoint Configuration publique
app.get('/api/config', (req, res) => {
  res.json({
    pixelId: process.env.META_PIXEL_ID || ''
  });
});

// Endpoint Données de Livraison Réelles (Wilayas + Vrais tarifs + Vrais bureaux)
app.get('/api/delivery-data', async (req, res) => {
  await fetchNoestReferenceData();

  // Mapping des wilayas avec leurs tarifs contractuels NOEST
  const enrichedWilayas = cachedWilayas.map(w => {
    const feeInfo = cachedFees[w.code.toString()] || {};
    return {
      code: w.code,
      nom: w.nom,
      tarif_domicile: parseInt(feeInfo.tarif, 10) || 700,
      tarif_stopdesk: parseInt(feeInfo.tarif_stopdesk, 10) || 450
    };
  });

  // Groupement des Stop Desks par wilaya
  const desksByWilaya = {};
  Object.values(cachedDesks).forEach(desk => {
    // Extraction du code wilaya à partir du code de desk (ex: 1A -> 1, 16B -> 16)
    const match = desk.code ? desk.code.match(/^(\d+)/) : null;
    const wCode = match ? parseInt(match[1], 10) : null;
    if (wCode) {
      if (!desksByWilaya[wCode]) desksByWilaya[wCode] = [];
      desksByWilaya[wCode].push({
        code: desk.code,
        nom: desk.name || desk.commune,
        adresse: desk.address,
        commune: desk.commune
      });
    }
  });

  res.json({
    wilayas: enrichedWilayas,
    desks: desksByWilaya
  });
});

// Endpoint Communes réelles depuis l'API NOEST
app.get('/api/communes/:wilayaId', async (req, res) => {
  const wilayaId = parseInt(req.params.wilayaId, 10);
  if (isNaN(wilayaId) || wilayaId < 1 || wilayaId > 58) {
    return res.status(400).json({ error: 'Wilaya invalide' });
  }

  try {
    const response = await fetch(`${NOEST_BASE_URL}/api/public/get/communes/${wilayaId}`, {
      headers: {
        'Authorization': `Bearer ${NOEST_API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const communes = await response.json();
      return res.json(communes);
    }
  } catch (err) {
    console.warn(`[NOEST API] Erreur communes pour wilaya ${wilayaId}:`, err.message);
  }

  res.json([{ nom: 'Centre', wilaya_id: wilayaId, is_active: 1 }]);
});

// Stockage temporaire en mémoire des commandes créées pour sécuriser l'événement Purchase
// Structure: Map(token -> { tracking, montant, createdAt, pixelFired: boolean })
const confirmedOrdersCache = new Map();

// Nettoyage régulier des anciens tokens (après 24h)
setInterval(() => {
  const now = Date.now();
  for (const [token, data] of confirmedOrdersCache.entries()) {
    if (now - data.createdAt > 24 * 60 * 60 * 1000) {
      confirmedOrdersCache.delete(token);
    }
  }
}, 60 * 60 * 1000);

// Endpoint sécurisé de vérification pour l'événement Purchase Meta Pixel & CAPI
app.post('/api/verify-purchase', async (req, res) => {
  const { token, tracking } = req.body;

  if (!token || !tracking) {
    return res.json({ canTrack: false, reason: 'missing_credentials' });
  }

  const orderData = confirmedOrdersCache.get(token);

  if (!orderData) {
    // Aucune commande réelle associée à ce token (accès direct interdit)
    return res.json({ canTrack: false, reason: 'order_not_found' });
  }

  if (orderData.tracking !== tracking) {
    return res.json({ canTrack: false, reason: 'tracking_mismatch' });
  }

  if (orderData.pixelFired) {
    // Déjà déclenché ! Blocage strict du double comptage
    return res.json({ canTrack: false, reason: 'already_fired', alreadyTracked: true });
  }

  // Marquer comme consommé immédiatement
  orderData.pixelFired = true;
  confirmedOrdersCache.set(token, orderData);

  console.log(`[Meta Pixel Security] Autorisation Purchase accordée pour la commande ${tracking} (Valeur: ${orderData.montant} DZD). Token consommé.`);

  // Déclenchement de Meta Conversions API (CAPI) côté serveur avec le même event_id que le navigateur
  const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || '';
  const userAgent = req.headers['user-agent'] || '';
  const referer = req.headers['referer'] || '';

  const capiResult = await sendMetaCapiEvent({
    eventName: 'Purchase',
    eventId: orderData.tracking,
    value: orderData.montant,
    currency: 'DZD',
    client: orderData.client,
    phone: orderData.phone,
    city: orderData.city,
    ip: clientIp,
    userAgent: userAgent,
    sourceUrl: referer
  });

  console.log(`[Meta CAPI] Purchase envoyé côté serveur pour commande ${tracking}. Succès: ${capiResult.success}`);

  return res.json({
    canTrack: true,
    tracking: orderData.tracking,
    value: orderData.montant,
    currency: 'DZD',
    reference: orderData.reference,
    capiSent: capiResult.success
  });
});

// Endpoint de test de diagnostic Meta CAPI
app.post('/api/test-meta-event', async (req, res) => {
  const { eventName = 'Purchase', value = 2900, testCode } = req.body || {};
  const testId = `TEST_${Date.now()}`;
  
  const savedTestCode = process.env.META_TEST_EVENT_CODE;
  if (testCode) {
    process.env.META_TEST_EVENT_CODE = testCode;
  }

  const result = await sendMetaCapiEvent({
    eventName: eventName,
    eventId: testId,
    value: value,
    currency: 'DZD',
    client: 'Mohamed Test',
    phone: '0555000000',
    city: 'Alger',
    ip: '105.106.12.34',
    userAgent: req.headers['user-agent'] || 'Mozilla/5.0 Test Agent',
    sourceUrl: 'http://localhost:3000/'
  });

  if (testCode) {
    process.env.META_TEST_EVENT_CODE = savedTestCode;
  }

  res.json({
    eventId: testId,
    metaResponse: result
  });
});

// Endpoint Création & Validation de Commande Automatisée
app.post('/api/order', async (req, res) => {
  const {
    client,
    phone,
    wilaya_id,
    commune,
    adresse,
    couleur,
    quantite,
    stop_desk,
    station_code,
    montant
  } = req.body;

  const isStopDesk = parseInt(stop_desk, 10) === 1 ? 1 : 0;

  // Validation conditionnelle stricte :
  // Domicile => Nom, Téléphone, Wilaya, Commune, Adresse
  // Stop Desk => Nom, Téléphone, Wilaya, Station Code (PAS de Commune)
  if (!client || !phone || !wilaya_id) {
    return res.status(400).json({
      success: false,
      message: 'يرجى ملء جميع الحقول المطلوبة.'
    });
  }

  if (isStopDesk) {
    if (!station_code) {
      return res.status(400).json({
        success: false,
        message: 'يرجى اختيار مكتب التوصيل (Stop Desk) التابع لولايتك.'
      });
    }
  } else {
    if (!commune || !adresse) {
      return res.status(400).json({
        success: false,
        message: 'يرجى تحديد البلدية والعنوان الدقيق للتوصيل إلى باب المنزل.'
      });
    }
  }

  const cleanPhone = phone.replace(/\s+/g, '').replace(/^(\+213|00213)/, '0');
  if (!/^0[567][0-9]{8}$/.test(cleanPhone)) {
    return res.status(400).json({
      success: false,
      message: 'رقم الهاتف غير صحيح، يرجى إدخال رقم هاتف جزائري صالح مكون من 10 أرقام (05, 06 أو 07).'
    });
  }

  const qty = parseInt(quantite, 10) || 1;
  const reference = `KIDS-${Date.now().toString().slice(-6)}`;
  const produitDesignation = `نظارات رياضية للأطفال (<12 سنة) - اللون: ${couleur || 'أسود رياضي'} - الكمية: ${qty}`;

  // En Stop Desk : pas de commune transmise (géré par station_code NOEST)
  const orderPayload = {
    user_guid: NOEST_USER_GUID,
    reference: reference,
    client: client.trim(),
    phone: cleanPhone,
    adresse: isStopDesk ? (adresse || `Bureau NOEST [${station_code}]`).trim() : adresse.trim(),
    wilaya_id: parseInt(wilaya_id, 10),
    montant: parseFloat(montant) || (2900 * qty),
    produit: produitDesignation,
    type_id: 1, // 1 = Livraison avec encaissement
    stop_desk: isStopDesk,
    station_code: isStopDesk ? station_code : undefined,
    remarque: isStopDesk ? 'استلام من مكتب التوصيل (Stop Desk)' : 'الاتصال قبل التوصيل للباب'
  };

  // N'inclure commune QUE si livraison à domicile
  if (!isStopDesk && commune) {
    orderPayload.commune = commune.trim();
  }

  try {
    console.log('[NOEST API] Création commande en cours...', {
      reference,
      client,
      wilaya_id: orderPayload.wilaya_id,
      stop_desk: isStopDesk,
      montant: orderPayload.montant
    });

    // 1. Création de la commande sur l'API NOEST
    const createRes = await fetch(`${NOEST_BASE_URL}/api/public/create/order`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NOEST_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderPayload)
    });

    const createData = await createRes.json();

    if (!createRes.ok || !createData.success) {
      console.error('[NOEST API] Échec création:', createData);
      let errorMsg = 'تعذر تسجيل الطلب لدى شركة التوصيل، يرجى التأكد من المعلومات والمحاولة مجدداً.';
      if (createData.message) errorMsg = createData.message;
      return res.status(422).json({
        success: false,
        message: errorMsg,
        details: createData
      });
    }

    const trackingNumber = createData.tracking;
    console.log(`[NOEST API] Commande enregistrée au statut 'Prêt à expédier' ! Tracking: ${trackingNumber}`);

    // 3. Génération d'un jeton d'autorisation unique pour le Meta Pixel Purchase
    const purchaseToken = `tok_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const wilayaObj = cachedWilayas.find(w => w.code == orderPayload.wilaya_id);
    const cityName = isStopDesk ? (wilayaObj?.nom || '') : (orderPayload.commune || wilayaObj?.nom || '');

    confirmedOrdersCache.set(purchaseToken, {
      tracking: trackingNumber,
      reference: reference,
      montant: orderPayload.montant,
      client: orderPayload.client,
      phone: orderPayload.phone,
      city: cityName,
      createdAt: Date.now(),
      pixelFired: false
    });

    return res.json({
      success: true,
      tracking: trackingNumber,
      reference: reference,
      montant: orderPayload.montant,
      token: purchaseToken,
      client: client,
      produit: produitDesignation
    });

  } catch (error) {
    console.error('[API Order Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ في الاتصال، يرجى إعادة المحاولة.'
    });
  }
});

// Démarrage initial
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  fetchNoestReferenceData().then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Serveur actif sur http://localhost:${PORT}`);
    });
  });
}

module.exports = app;
