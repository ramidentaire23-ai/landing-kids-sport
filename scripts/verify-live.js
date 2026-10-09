async function checkLive() {
  try {
    const res = await fetch('https://landing-kids-sport.vercel.app/?t=' + Date.now());
    const t = await res.text();
    console.log('--- STATUT PRODUCTION VERCEL EN DIRECT ---');
    console.log('1. subtle-vibrate en production :', t.includes('subtle-vibrate') ? '✅ OUI' : '❌ NON');
    console.log('2. sticky-vibrate en production :', t.includes('sticky-vibrate') ? '✅ OUI' : '❌ NON');
    console.log('3. Permanent sur desktop & mobile (sans md:hidden) :', !t.includes('id="stickyCtaBar" class="md:hidden') ? '✅ OUI' : '❌ NON');
    console.log('4. Marges anti-masquage (scroll-margin 6rem) :', t.includes('scroll-margin-bottom: 6rem') ? '✅ OUI' : '❌ NON');
    console.log('5. Code HTTP :', res.status);
    console.log('------------------------------------------');
  } catch(e) {
    console.error('Erreur :', e.message);
  }
}

checkLive();
