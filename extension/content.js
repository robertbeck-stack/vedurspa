// =========================================================================
// VEÐURVAKTIN AI – CHROME EXTENSION CONTENT SCRIPT
// Fellur 100% inn í snið vedur.is og sprautar AI-upplýsingum undir hvern dag
// =========================================================================

(function initVedurvaktin() {
  let cachedData = null;
  let cachedKey = '';
  let isFetching = false;

  // Hreinsa gamla spjaldið ef það situr í tækjastikunni
  function removeLegacyWidget() {
    const oldContainer = document.getElementById('vedurvaktin-ext-container');
    if (oldContainer) oldContainer.remove();
    const oldWidget = document.getElementById('vedurvaktin-ext-widget');
    if (oldWidget && !oldWidget.classList.contains('vedurvaktin-native-keep')) {
      oldWidget.remove();
    }
  }

  // Sprauta AI upplýsingum undir hvern dag í sniði vedur.is
  function injectUnderDays(data) {
    if (!data || !data.aiForecastMultiDay || !data.aiForecastMultiDay.length) return;

    // 1. TOP STATUS BAR (Heildarstöðustika efst – fellur fullkomlega inn í síðuna)
    if (!document.getElementById('vedurvaktin-top-status')) {
      const topTarget = 
        document.querySelector('h3') || 
        document.querySelector('#readContentWeatherDetails') || 
        document.querySelector('main');

      if (topTarget) {
        const topBar = document.createElement('div');
        topBar.id = 'vedurvaktin-top-status';
        topBar.style.cssText = 'width: 100%; box-sizing: border-box; margin: 10px 0 16px 0; background: #ffffff; border: 1px solid #cbd5e1; border-left: 4px solid #0f4678; border-radius: 6px; padding: 8px 14px; display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 8px; font-family: inherit; font-size: 12px; color: #1e293b; box-shadow: 0 1px 4px rgba(15,70,120,0.05); clear: both;';
        
        const gradeColor = data.scorecard?.gradeColor || '#059669';
        const score = data.scorecard?.overallAccuracy || 89;
        const grade = data.scorecard?.grade || 'A';

        topBar.innerHTML = `
          <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
            <span style="background: #0f4678; color: #ffffff; font-size: 10px; font-weight: 800; padding: 2px 7px; border-radius: 4px; letter-spacing: 0.5px;">AI VEÐURVAKTIN</span>
            <strong style="color: #0f4678; font-size: 13px;">${data.station?.name || 'Reykjavík'} (${data.station?.region || 'Höfuðborgarsvæðið'})</strong>
            <span style="font-size: 11px; color: #64748b;">AI-Leiðréttingar virkar undir hverjum degi í spánni hér að neðan</span>
            <span style="background: ${gradeColor}18; color: ${gradeColor}; font-weight: 800; font-size: 11px; padding: 1px 7px; border-radius: 10px; border: 1px solid ${gradeColor}40;">
              Spágæði: ${score}% (${grade})
            </span>
          </div>
          <a href="https://vedurspa-eta.vercel.app" target="_blank" style="color: #0f4678; text-decoration: none; font-size: 11px; font-weight: 700; background: #eff6ff; padding: 3px 8px; border-radius: 4px; border: 1px solid #bfdbfe;">
            Opna Veðurvaktina ↗
          </a>
        `;

        if (topTarget.matches('h3')) {
          const wrapper = topTarget.closest('div') || topTarget;
          wrapper.parentNode.insertBefore(topBar, wrapper);
        } else {
          topTarget.prepend(topBar);
        }
      }
    }

    // 2. UNDIR HVERN DAG Í TÖFLU ("Næstu dagar" yfirlit)
    // Finnum öll h4 sem eru inni í töflu
    const tableH4s = document.querySelectorAll('table td h4, table th h4');
    tableH4s.forEach(h4 => {
      const dayText = h4.textContent.trim().toLowerCase();
      const dayData = data.aiForecastMultiDay.find(d => 
        dayText.includes(d.dayOfWeek.toLowerCase()) || 
        d.dayOfWeek.toLowerCase().includes(dayText)
      );

      if (!dayData) return;

      const parentDiv = h4.closest('div');
      if (parentDiv && !parentDiv.querySelector('.vedurvaktin-table-pill')) {
        const pill = document.createElement('div');
        pill.className = 'vedurvaktin-table-pill';
        pill.style.cssText = 'margin-top: 6px; padding: 4px 8px; background: #f0f7ff; border: 1px solid #bfdbfe; border-left: 3px solid #0f4678; border-radius: 4px; font-size: 11px; line-height: 1.35; font-family: inherit; box-sizing: border-box; text-align: left;';

        const tempDiffStr = dayData.diffs.tempDiff > 0 ? `+${dayData.diffs.tempDiff}°C` : `${dayData.diffs.tempDiff}°C`;
        const tempBadgeBg = Math.abs(dayData.diffs.tempDiff) >= 2 ? '#fef2f2' : '#f0fdf4';
        const tempBadgeCol = Math.abs(dayData.diffs.tempDiff) >= 2 ? '#b91c1c' : '#15803d';

        pill.innerHTML = `
          <div style="display: flex; align-items: center; gap: 4px; flex-wrap: wrap;">
            <span style="background: #0f4678; color: #ffffff; font-size: 9px; font-weight: 800; padding: 1px 4px; border-radius: 3px;">AI</span>
            <strong style="color: #1e3a8a; font-size: 12px;">${dayData.ai.temp > 0 ? '+' : ''}${dayData.ai.temp}°C</strong>
            <span style="color: #475569; font-size: 11px;">• ${dayData.ai.wind} m/s</span>
            <span style="font-size: 9px; background: ${tempBadgeBg}; color: ${tempBadgeCol}; padding: 1px 4px; border-radius: 3px; font-weight: 700;">${tempDiffStr}</span>
          </div>
          <div style="font-size: 10px; color: #334155; margin-top: 2px;">
            ${dayData.corrections[0]}
          </div>
        `;
        parentDiv.appendChild(pill);
      }

      // Einnig: Bæta við AI hitagildi í hitadálkinn ("Lægsti / Hæsti hiti" í dálki 5) og vindgildi í dálki 6
      const tr = h4.closest('tr');
      if (tr) {
        const cells = tr.querySelectorAll('td');
        // Í töflunni er hiti í dálki 5 (0-indexed)
        if (cells.length >= 6 && !cells[5].querySelector('.vedurvaktin-cell-ai')) {
          const tempDiffStr = dayData.diffs.tempDiff > 0 ? `+${dayData.diffs.tempDiff}°C` : `${dayData.diffs.tempDiff}°C`;
          const tempBadgeBg = Math.abs(dayData.diffs.tempDiff) >= 2 ? '#fef2f2' : '#f0fdf4';
          const tempBadgeCol = Math.abs(dayData.diffs.tempDiff) >= 2 ? '#b91c1c' : '#15803d';

          const aiTempNote = document.createElement('div');
          aiTempNote.className = 'vedurvaktin-cell-ai';
          aiTempNote.style.cssText = 'font-size: 11px; font-weight: 700; color: #1d4ed8; margin-top: 2px; line-height: 1.2;';
          aiTempNote.innerHTML = `AI: ${dayData.ai.temp > 0 ? '+' : ''}${dayData.ai.temp} °C <span style="font-size: 9px; font-weight: 600; background: ${tempBadgeBg}; color: ${tempBadgeCol}; padding: 0 4px; border-radius: 3px; margin-left: 2px;">(${tempDiffStr})</span>`;
          cells[5].appendChild(aiTempNote);
        }

        // Í töflunni er vindur í dálki 6 (0-indexed)
        if (cells.length >= 7 && !cells[6].querySelector('.vedurvaktin-cell-wind')) {
          const isGusty = dayData.ai.gust >= 20;
          const aiWindNote = document.createElement('div');
          aiWindNote.className = 'vedurvaktin-cell-wind';
          aiWindNote.style.cssText = `font-size: 10px; margin-top: 2px; line-height: 1.2; ${isGusty ? 'color: #dc2626; font-weight: 700;' : 'color: #475569;'}`;
          aiWindNote.textContent = `AI: ${dayData.ai.wind} m/s (hviða ${dayData.ai.gust})`;
          cells[6].appendChild(aiWindNote);
        }
      }
    });

    // 3. UNDIR HVERN DAG Í DAGSYFIRLITINU ("Næstu klst" sundurliðun)
    const allH4s = document.querySelectorAll('h4');
    allH4s.forEach(h4 => {
      // Sleppa þeim sem eru inni í töflu (þau eru afgreidd í skrefi 2)
      if (h4.closest('table')) return;

      const txt = h4.textContent.trim().toLowerCase();
      const dayData = data.aiForecastMultiDay.find(d => 
        txt.includes(d.dayOfWeek.toLowerCase())
      );

      if (!dayData) return;

      // Finna stað til að sprauta kortinu rétt undir dagsfyrirsögnina
      const headerDiv = h4.closest('div');
      if (!headerDiv) return;

      const dayParent = headerDiv.parentElement;
      if (!dayParent || dayParent.querySelector(`.vedurvaktin-accordion-${dayData.index}`)) return;

      const card = document.createElement('div');
      card.className = `vedurvaktin-accordion-card vedurvaktin-accordion-${dayData.index}`;
      card.style.cssText = 'margin: 8px 0 14px 0; background: #ffffff; border: 1px solid #e2e8f0; border-left: 3px solid #0f4678; border-radius: 6px; padding: 10px 14px; font-family: inherit; font-size: 12px; color: #1e293b; box-shadow: 0 1px 4px rgba(15,70,120,0.04);';

      card.innerHTML = dayData.accordionCardHtml || `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="background: #0f4678; color: #ffffff; font-size: 9px; font-weight: 800; padding: 1px 5px; border-radius: 3px;">AI VEÐURVAKTIN</span>
            <strong style="color: #0f4678; font-size: 12px;">AI-Leiðrétting (${dayData.dayOfWeek})</strong>
          </div>
          <span style="font-size: 10px; background: #eff6ff; color: #1d4ed8; font-weight: 700; padding: 1px 6px; border-radius: 3px;">
            Öryggi: ${dayData.confidence}
          </span>
        </div>
        <div style="font-size: 11px; color: #334155; line-height: 1.35; background: #f8fafc; padding: 5px 8px; border-radius: 4px; margin-bottom: 4px;">
          <strong style="color: #0f4678;">Staðbundin innsýn:</strong> ${dayData.corrections[0]}
        </div>
      `;

      if (headerDiv.nextSibling) {
        dayParent.insertBefore(card, headerDiv.nextSibling);
      } else {
        dayParent.appendChild(card);
      }
    });
  }

  async function checkAndInject() {
    removeLegacyWidget();

    const currentUrl = window.location.href;
    const idMatch = currentUrl.match(/\/(\d{1,5})(\/|\?|#|$)/);
    const stationId = idMatch ? idMatch[1] : '';
    const pageTitle = document.title || '';
    const currentKey = `${currentUrl}|${stationId}|${pageTitle}`;

    // Ef við höfum nú þegar gögn fyrir þessa slóð/stöð, sprautum við í ný DOM-tök
    if (cachedData && cachedKey === currentKey) {
      injectUnderDays(cachedData);
      return;
    }

    if (isFetching) return;
    isFetching = true;

    try {
      console.log('[Veðurvaktin AI] Sæki gögn fyrir snið-samþættingu:', currentUrl);
      const apiUrl = `https://vedurspa-eta.vercel.app/api/extension?url=${encodeURIComponent(currentUrl)}&station=${encodeURIComponent(stationId)}&name=${encodeURIComponent(pageTitle)}`;
      const res = await fetch(apiUrl);
      if (!res.ok) {
        isFetching = false;
        return;
      }

      const data = await res.json();
      if (!data) {
        isFetching = false;
        return;
      }

      cachedData = data;
      cachedKey = currentKey;

      injectUnderDays(data);
    } catch (err) {
      console.error('[Veðurvaktin AI] Villa við að sækja eða sprauta gögnum:', err);
    } finally {
      isFetching = false;
    }
  }

  // 1. Keyra strax
  checkAndInject();

  // 2. Fylgjast með DOM breytingum (Next.js síðu- og töfluskipti)
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

  // 3. Reglulegt tékk á 600ms fresti (fylgist með flipaskiptum "Næstu klst" vs "Næstu dagar")
  setInterval(checkAndInject, 600);
})();

