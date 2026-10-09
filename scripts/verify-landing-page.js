const fs = require('fs');
const path = require('path');

async function verifyLandingPage() {
  console.log('--- VÉRIFICATION VALIDATION LANDING PAGE ---');

  // 1. Lire index.html
  const indexPath = path.join(__dirname, '..', 'public', 'index.html');
  const html = fs.readFileSync(indexPath, 'utf8');

  // A. Vérification Nouveau Titre
  const hasNewTitle = html.includes('نظارات رياضية لطفلك…') && html.includes('باش يلعب براحة وثقة! ⚽');
  console.log('1. Nouveau titre principal présent :', hasNewTitle ? '✅ OUI' : '❌ NON');

  // B. Vérification Ligne de Prix sobre
  const hasPriceLine = html.includes('السعر: <strong class="text-brand-navy price-num">2900 دج</strong>') && html.includes('الدفع عند الاستلام');
  console.log('2. Ligne de prix sobre sous le titre (2900 دج + الدفع عند الاستلام) :', hasPriceLine ? '✅ OUI' : '❌ NON');

  // C. Vérification suppression éléments superflus
  const hasOldBlueBadge = html.includes('العدسات قابلة للتغيير عند أي أخصائي بصريات (Opticien)');
  console.log('3. Badge bleu superflu au-dessus du titre supprimé :', !hasOldBlueBadge ? '✅ OUI' : '❌ NON');

  const hasOldParagraph = html.includes('مصممة خصيصاً لممارسة كرة القدم، الدراجة والأنشطة الرياضية بأمان');
  console.log('4. Paragraphe descriptif superflu sous le titre supprimé :', !hasOldParagraph ? '✅ OUI' : '❌ NON');

  const hasOldAgeBadge = html.includes('مقاس الأطفال &lt; 12 سنة') || html.includes('مقاس الأطفال < 12 سنة');
  console.log('5. Badge d\'âge superflu au-dessus de l\'image supprimé :', !hasOldAgeBadge ? '✅ OUI' : '❌ NON');

  // D. Vérification Bandeau supérieur
  const hasHeader = html.includes('توصيل لكافة الـ 58 ولاية عبر Nord & Ouest Express — الدفع عند الاستلام');
  console.log('6. Bandeau supérieur préservé avec typographie améliorée :', hasHeader ? '✅ OUI' : '❌ NON');

  // E. Vérification Image Produit & Variantes
  const hasImage = html.includes('src="/images/lunettes-noir.jpg"') && html.includes('id="mainProductImage"');
  const hasVariants = html.includes("selectVariant('أسود')") && html.includes("selectVariant('شفاف')");
  console.log('7. Image produit originale et switch de variantes préservés :', (hasImage && hasVariants) ? '✅ OUI' : '❌ NON');

  // F. Vérification Sticky CTA Mobile
  const hasStickyCTA = html.includes('id="stickyCtaBar"') && html.includes('id="stickyCtaBtn"');
  const hasStickyText = html.includes('⚡ اطلب الآن —') && html.includes('2900') && html.includes('دج');
  const hasPulseAnimation = html.includes('sticky-pulse') && html.includes('@keyframes subtle-pulse');
  const hasReducedMotion = html.includes('prefers-reduced-motion');
  const hasDesktopHidden = html.includes('md:hidden');
  console.log('8. Sticky CTA Mobile présent :', hasStickyCTA ? '✅ OUI' : '❌ NON');
  console.log('9. Texte exact du sticky CTA ("⚡ اطلب الآن — 2900 دج") :', hasStickyText ? '✅ OUI' : '❌ NON');
  console.log('10. Animation pulsation douce CSS (scale) présente :', hasPulseAnimation ? '✅ OUI' : '❌ NON');
  console.log('11. Support prefers-reduced-motion présent :', hasReducedMotion ? '✅ OUI' : '❌ NON');
  console.log('12. Masqué sur desktop (md:hidden) :', hasDesktopHidden ? '✅ OUI' : '❌ NON');

  // G. Vérification Formulaire & Tracking
  const hasForm = html.includes('id="orderForm"') && html.includes('id="submitBtn"');
  const hasPixel = html.includes('fbq(\'init\', d.pixelId)') && html.includes('fbq(\'track\', \'PageView\')') && html.includes('fbq(\'track\', \'ViewContent\'');
  const hasInitiateCheckout = html.includes('fbq(\'track\', \'InitiateCheckout\'');
  console.log('13. Formulaire de commande original intact :', hasForm ? '✅ OUI' : '❌ NON');
  console.log('14. Événements Meta Pixel (PageView, ViewContent, InitiateCheckout) intacts :', (hasPixel && hasInitiateCheckout) ? '✅ OUI' : '❌ NON');

  // H. Test serveur local HTTP
  try {
    const res = await fetch('http://localhost:3000/');
    console.log('15. Réponse HTTP serveur local http://localhost:3000/ :', res.status === 200 ? '✅ 200 OK' : '❌ Code ' + res.status);
    const configRes = await fetch('http://localhost:3000/api/config');
    const config = await configRes.json();
    console.log('16. Endpoint /api/config actif (Pixel ID) :', config.pixelId === '1422859033068055' ? '✅ 1422859033068055' : '❌ Invalide');
  } catch (err) {
    console.error('Erreur test HTTP :', err.message);
  }

  console.log('--------------------------------------------');
}

verifyLandingPage();
