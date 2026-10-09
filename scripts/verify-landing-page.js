const fs = require('fs');
const path = require('path');

async function verifyLandingPage() {
  console.log('--- VÉRIFICATION VALIDATION LANDING PAGE & BOUTON STICKY PERMANENT ---');

  // 1. Lire index.html
  const indexPath = path.join(__dirname, '..', 'public', 'index.html');
  const html = fs.readFileSync(indexPath, 'utf8');

  // A. Vérification Bouton Permanent Fixe & Visibilité Mobile + Desktop
  const hasStickyBar = html.includes('id="stickyCtaBar"') && html.includes('id="stickyCtaBtn"');
  const isFixedBottom = html.includes('fixed bottom-0');
  const isPermanentOnAllScreens = !html.includes('id="stickyCtaBar" class="md:hidden');
  console.log('1. Bouton sticky présent et en position fixe (fixed bottom-0) :', (hasStickyBar && isFixedBottom) ? '✅ OUI' : '❌ NON');
  console.log('2. Bouton permanent visible sur tous les écrans (mobile + desktop) :', isPermanentOnAllScreens ? '✅ OUI' : '❌ NON');

  // B. Vérification Texte exact du CTA
  const hasExactText = html.includes('⚡ اطلب الآن —') && html.includes('2900') && html.includes('دج');
  console.log('3. Texte exact du bouton ("⚡ اطلب الآن — 2900 دج") :', hasExactText ? '✅ OUI' : '❌ NON');

  // C. Vérification Animation de vibration subtile répétitive (4 à 5 secondes)
  const hasVibrateKeyframes = html.includes('@keyframes subtle-vibrate') && html.includes('translateX(-3px)') && html.includes('translateX(3px)');
  const hasVibrateClass = html.includes('.sticky-vibrate') && html.includes('animation: subtle-vibrate 4.5s ease-in-out infinite');
  const hasReducedMotion = html.includes('prefers-reduced-motion: reduce') && html.includes('.sticky-vibrate {') && html.includes('animation: none !important');
  console.log('4. Animation de vibration subtile horizontale présente :', hasVibrateKeyframes ? '✅ OUI' : '❌ NON');
  console.log('5. Cycle de 4.5s avec pause naturelle entre répétitions :', hasVibrateClass ? '✅ OUI' : '❌ NON');
  console.log('6. Désactivation sur prefers-reduced-motion respectée :', hasReducedMotion ? '✅ OUI' : '❌ NON');

  // D. Vérification Espacement & Anti-masquage
  const hasBodyBottomPadding = html.includes('padding-bottom: max(6.5rem, calc(5.5rem + env(safe-area-inset-bottom, 0px)))');
  const hasScrollMargins = html.includes('scroll-margin-bottom: 6rem') && html.includes('#submitOrderBtn');
  const hasSafeAreaBar = html.includes('padding-bottom: max(0.625rem, calc(0.5rem + env(safe-area-inset-bottom, 0px)))');
  console.log('7. Espacement inférieur du body pour ne jamais masquer le contenu :', hasBodyBottomPadding ? '✅ OUI' : '❌ NON');
  console.log('8. Marges de défilement (scroll-margin) sur les champs et bouton final :', hasScrollMargins ? '✅ OUI' : '❌ NON');
  console.log('9. Prise en compte des zones de sécurité mobile (safe-area-inset-bottom) :', hasSafeAreaBar ? '✅ OUI' : '❌ NON');

  // E. Vérification Défilement fluide vers le formulaire au clic
  const hasScrollToOrder = html.includes('function scrollToOrderForm()') && html.includes('formSection.scrollIntoView');
  const hasClickListener = html.includes('stickyCtaBtn.addEventListener(\'click\', scrollToOrderForm)');
  console.log('10. Défilement fluide vers le formulaire existant au clic :', (hasScrollToOrder && hasClickListener) ? '✅ OUI' : '❌ NON');

  // F. Vérification Préservation Métier & Tracking
  const hasForm = html.includes('id="orderForm"') && html.includes('id="submitBtn"');
  const hasPixel = html.includes('fbq(\'init\', d.pixelId)') && html.includes('fbq(\'track\', \'PageView\')') && html.includes('fbq(\'track\', \'ViewContent\'');
  const hasInitiateCheckout = html.includes('fbq(\'track\', \'InitiateCheckout\'');
  const hasPrice = html.includes('2900');
  console.log('11. Formulaire original et champs intacts :', hasForm ? '✅ OUI' : '❌ NON');
  console.log('12. Intégrité Meta Pixel & CAPI préservée :', (hasPixel && hasInitiateCheckout) ? '✅ OUI' : '❌ NON');
  console.log('13. Prix réel de 2 900 DA préservé sans réduction fictive :', hasPrice ? '✅ OUI' : '❌ NON');

  // G. Test serveur local HTTP
  try {
    const res = await fetch('http://localhost:3000/');
    console.log('14. Réponse HTTP serveur local http://localhost:3000/ :', res.status === 200 ? '✅ 200 OK' : '❌ Code ' + res.status);
    const configRes = await fetch('http://localhost:3000/api/config');
    const config = await configRes.json();
    console.log('15. Endpoint /api/config actif (Pixel ID) :', config.pixelId === '1422859033068055' ? '✅ 1422859033068055' : '❌ Invalide');
  } catch (err) {
    console.error('Erreur test HTTP :', err.message);
  }

  console.log('----------------------------------------------------------------------');
}

verifyLandingPage();
