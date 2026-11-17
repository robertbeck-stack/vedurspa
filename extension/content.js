// =========================================================================
// VEÐURVAKTIN AI – CHROME EXTENSION CONTENT SCRIPT
// Keyrir sjálfkrafa á vefsíðu vedur.is og sprautar AI-veðurgreiningu inn
// =========================================================================

(async function initVedurvaktinExtension() {
  // 1. Koma í veg fyrir að kortið bætist við tvisvar
  if (document.getElementById('vedurvaktin-ext-widget')) return;

  const currentUrl = window.location.href;
  console.log('[Veðurvaktin AI] Athuga spágæði fyrir vefslóð:', currentUrl);

  // 2. Finna hvaða heiti eða staðsetning er á síðunni
  let detectedName = '';
  const heading = document.querySelector('h1, h2, .station-title, .breadcrumb');
  if (heading) {
    detectedName = heading.innerText.trim();
  }

  try {
    // 3. Sækja AI-leiðréttingu og spágæði frá Vercel bakenda
    const apiUrl = `https://vedurspa-eta.vercel.app/api/extension?url=${encodeURIComponent(currentUrl)}&name=${encodeURIComponent(detectedName)}`;
    const res = await fetch(apiUrl);
    if (!res.ok) {
      console.warn('[Veðurvaktin AI] Ekki náðist samband við bakenda:', res.status);
      return;
    }

    const data = await res.json();
    if (!data || !data.extensionHtml) {
      console.warn('[Veðurvaktin AI] Engin gögn bárust frá API.');
      return;
    }

    // 4. Finna bestu staðsetningu á síðunni til að sprauta spjaldinu
    // Reynum töflur, aðalefni eða forsíðuyfirlit á vedur.is
    const targetElement = 
      document.querySelector('.table-responsive') || 
      document.querySelector('#station-table') ||
      document.querySelector('#forecast-table') ||
      document.querySelector('.forecast-day-wrapper') ||
      document.querySelector('#page') ||
      document.querySelector('main') ||
      document.querySelector('.content') ||
      document.body.firstChild;

    if (targetElement) {
      const container = document.createElement('div');
      container.id = 'vedurvaktin-ext-container';
      container.style.maxWidth = '1000px';
      container.style.margin = '16px auto';
      container.style.padding = '0 10px';
      container.innerHTML = data.extensionHtml;

      targetElement.parentNode.insertBefore(container, targetElement);
      console.log(`[Veðurvaktin AI] AI-veðurkorti sprautað inn fyrir ${data.station?.name || 'veðurstöð'}!`);
    } else {
      console.log('[Veðurvaktin AI] Fann ekki viðeigandi DOM stak til að sprauta inn í.');
    }
  } catch (err) {
    console.error('[Veðurvaktin AI] Villa við vinnslu:', err);
  }
})();
