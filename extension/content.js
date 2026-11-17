// =========================================================================
// VEÐURVAKTIN AI – CHROME EXTENSION CONTENT SCRIPT
// Keyrir sjálfkrafa á vefsíðu vedur.is og sprautar AI-veðurgreiningu inn
// =========================================================================

(function initVedurvaktin() {
  let lastInjectedKey = '';
  let isFetching = false;

  async function checkAndInject() {
    const currentUrl = window.location.href;
    
    // Finna hvort við séum á forsíðu eða stöðvasíðu (t.d. /spar/1/ eða /spar/3471/)
    const idMatch = currentUrl.match(/\/(\d{1,5})(\/|\?|#|$)/);
    const stationId = idMatch ? idMatch[1] : '';
    const pageTitle = document.title || '';
    const currentKey = `${currentUrl}|${stationId}|${pageTitle}`;

    // Athuga hvort spjaldið sé þegar til staðar í DOM fyrir núverandi stöð
    const existingWidget = document.getElementById('vedurvaktin-ext-widget');
    if (existingWidget && lastInjectedKey === currentKey) {
      return;
    }

    if (isFetching) return;

    // Finna heppilegan stað til að sprauta spjaldinu
    // Á stöðvasíðum (/vedur/spar/1/ og /vedur/spar/3471/):
    // 1. div[role="radiogroup"] (hnappastika fyrir dagana rétt fyrir ofan töfluna)
    // 2. table (veðurtaflan sjálf)
    // 3. h3 eða h4 fyrirsagnir
    // Á forsíðu eða eldri síðum:
    // 4. #page, main, .content
    const target = 
      document.querySelector('div[role="radiogroup"]') ||
      document.querySelector('table') ||
      document.querySelector('#readContentWeatherDetails') ||
      document.querySelector('#page') ||
      document.querySelector('main') ||
      document.querySelector('.content') ||
      document.querySelector('#__next');

    if (!target) {
      // Síðan er líklega enn að hlaðast í Next.js, bíðum eftir næsta tékki
      return;
    }

    isFetching = true;
    try {
      console.log('[Veðurvaktin AI] Sæki AI-gögn fyrir:', currentUrl, 'Stöð:', stationId || pageTitle);
      
      const apiUrl = `https://vedurspa-eta.vercel.app/api/extension?url=${encodeURIComponent(currentUrl)}&station=${encodeURIComponent(stationId)}&name=${encodeURIComponent(pageTitle)}`;
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

      // Fjarlægja gamalt spjald ef það er til staðar
      const old = document.getElementById('vedurvaktin-ext-container');
      if (old) old.remove();

      // Búa til nýjan kassa utan um spjaldið
      const container = document.createElement('div');
      container.id = 'vedurvaktin-ext-container';
      container.style.maxWidth = '1120px';
      container.style.margin = '16px auto';
      container.style.padding = '0 12px';
      container.style.boxSizing = 'border-box';
      container.innerHTML = data.extensionHtml;

      // Tengja smell-atburði (event listeners) beint fyrir dagaval / flipa
      try {
        const tabBtns = container.querySelectorAll('.vedurvaktin-day-tab');
        const summaryCards = container.querySelectorAll('.vedurvaktin-summary-card');
        const panels = container.querySelectorAll('.vedurvaktin-day-panel');

        function selectDay(index) {
          tabBtns.forEach((btn, i) => {
            if (i === index) {
              btn.style.background = '#0f4678';
              btn.style.color = '#ffffff';
              btn.style.borderColor = '#0f4678';
              btn.style.fontWeight = '800';
            } else {
              btn.style.background = '#ffffff';
              btn.style.color = '#475569';
              btn.style.borderColor = '#cbd5e1';
              btn.style.fontWeight = '600';
            }
          });

          summaryCards.forEach((card, i) => {
            if (i === index) {
              card.style.borderColor = '#0f4678';
              card.style.background = '#eff6ff';
              card.style.boxShadow = '0 2px 6px rgba(15,70,120,0.15)';
            } else {
              card.style.borderColor = '#e2e8f0';
              card.style.background = '#ffffff';
              card.style.boxShadow = 'none';
            }
          });

          panels.forEach((p, i) => {
            p.style.display = i === index ? 'block' : 'none';
          });
        }

        tabBtns.forEach((btn, idx) => {
          btn.addEventListener('click', (e) => {
            e.preventDefault();
            selectDay(idx);
          });
        });

        summaryCards.forEach((card, idx) => {
          card.addEventListener('click', (e) => {
            e.preventDefault();
            selectDay(idx);
          });
        });
      } catch (e) {
        console.warn('[Veðurvaktin AI] Villa við að tengja flipa:', e);
      }

      // Sprauta fyrir ofan markstakið
      let insertPoint = target;
      if (target.matches('table')) {
        insertPoint = target.closest('div') || target;
      } else if (target.matches('div[role="radiogroup"]')) {
        insertPoint = target.closest('div') || target;
      }

      if (insertPoint && insertPoint.parentNode) {
        insertPoint.parentNode.insertBefore(container, insertPoint);
        lastInjectedKey = currentKey;
        console.log(`[Veðurvaktin AI] AI-veðurkorti sprautað inn fyrir ${data.station?.name || 'stöð'}!`);
      } else if (document.body) {
        document.body.prepend(container);
        lastInjectedKey = currentKey;
      }
    } catch (err) {
      console.error('[Veðurvaktin AI] Villa við að sækja eða sprauta spjaldi:', err);
    } finally {
      isFetching = false;
    }
  }

  // 1. Keyra strax
  checkAndInject();

  // 2. Fylgjast með DOM breytingum (vegna þess að vedur.is notar Next.js sem hleður töflum ósamstillt)
  const observer = new MutationObserver(() => {
    checkAndInject();
  });

  if (document.body) {
    observer.observe(document.body, { childList: true, subtree: true });
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      observer.observe(document.body, { childList: true, subtree: true });
    });
  }

  // 3. Reglulegt tékk á 600ms fresti (grípur öll SPA slóðaskipti og flakk milli stöðva á vedur.is)
  setInterval(checkAndInject, 600);
})();
