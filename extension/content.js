// =========================================================================
// VEÐURVAKTIN AI – CHROME EXTENSION CONTENT SCRIPT
// Keyrir sjálfkrafa á vefsíðu vedur.is og sprautar AI-veðurgreiningu inn
// =========================================================================

(function initVedurvaktin() {
  let lastInjectedUrl = '';
  let isFetching = false;

  async function tryInjectCard() {
    const currentUrl = window.location.href;
    
    // Athuga hvort við höfum þegar sprautað inn fyrir þessa slóð
    const existingWidget = document.getElementById('vedurvaktin-ext-widget');
    if (existingWidget && lastInjectedUrl === currentUrl) {
      return;
    }

    if (isFetching) return;

    // 1. Finna hvar veðurtaflan eða aðalefnið er í DOM
    // Á vedur.is (Next.js) er veðurtaflan <table> eða inni í #readContentWeatherDetails
    const targetElement = 
      document.querySelector('table') ||
      document.querySelector('#readContentWeatherDetails') ||
      document.querySelector('.table-responsive') || 
      document.querySelector('#station-table') ||
      document.querySelector('#forecast-table') ||
      document.querySelector('.forecast-day-wrapper');

    if (!targetElement) {
      // Taflan er enn að hlaðast í Next.js SPA, reynum aftur þegar hún birtist
      return;
    }

    // 2. Finna staðarheiti eða stöðvarnúmer úr URL eða titli síðu
    const idMatch = currentUrl.match(/\/(\d{1,5})(\/|\?|#|$)/);
    const stationId = idMatch ? idMatch[1] : '';
    const pageTitle = document.title || '';
    const heading = document.querySelector('h1, h2, h3, h4');
    const headingText = heading ? heading.innerText.trim() : '';

    isFetching = true;
    try {
      console.log('[Veðurvaktin AI] Sæki AI-spá fyrir:', currentUrl, 'Stöð ID:', stationId || 'sjálfvirkt');
      
      const apiUrl = `https://vedurspa-eta.vercel.app/api/extension?url=${encodeURIComponent(currentUrl)}&station=${encodeURIComponent(stationId)}&name=${encodeURIComponent(pageTitle || headingText)}`;
      const res = await fetch(apiUrl);
      if (!res.ok) {
        isFetching = false;
        return;
      }

      const data = await res.json();
      if (!data || !data.extensionHtml) {
        isFetching = false;
        return;
      }

      // Fjarlægja gamalt spjald ef það er til
      const oldContainer = document.getElementById('vedurvaktin-ext-container');
      if (oldContainer) oldContainer.remove();

      // Búa til nýjan kassa utan um spjaldið
      const container = document.createElement('div');
      container.id = 'vedurvaktin-ext-container';
      container.style.maxWidth = '1120px';
      container.style.margin = '16px auto';
      container.style.padding = '0 12px';
      container.style.boxSizing = 'border-box';
      container.innerHTML = data.extensionHtml;

      // Finna réttan stað til að sprauta: fyrir ofan töfluna
      const insertTarget = targetElement.closest('section') || 
                           targetElement.closest('[class*="_1br7ayeb"]') || 
                           targetElement.closest('.table-responsive') || 
                           targetElement;

      if (insertTarget && insertTarget.parentNode) {
        insertTarget.parentNode.insertBefore(container, insertTarget);
        lastInjectedUrl = currentUrl;
        console.log(`[Veðurvaktin AI] AI-korti sprautað inn fyrir ${data.station?.name || 'veðurstöð'}!`);
      }
    } catch (err) {
      console.error('[Veðurvaktin AI] Villa við að sprauta gögnum:', err);
    } finally {
      isFetching = false;
    }
  }

  // Reyna strax
  tryInjectCard();

  // Fylgjast með DOM breytingum (vegna þess að vedur.is notar Next.js sem hleður töflum ósamstillt)
  const observer = new MutationObserver(() => {
    tryInjectCard();
  });

  if (document.body) {
    observer.observe(document.body, { childList: true, subtree: true });
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      observer.observe(document.body, { childList: true, subtree: true });
    });
  }

  // Fylgjast með slóðabreytingum ef notandi smellir milli stöðva án endurhleðslu
  let currentHref = window.location.href;
  setInterval(() => {
    if (window.location.href !== currentHref) {
      currentHref = window.location.href;
      tryInjectCard();
    }
  }, 400);
})();
