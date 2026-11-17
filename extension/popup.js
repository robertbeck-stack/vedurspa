document.addEventListener('DOMContentLoaded', () => {
  const select = document.getElementById('station-select');
  const contentArea = document.getElementById('content-area');

  async function loadStation(slug) {
    contentArea.innerHTML = '<div class="loading">Sæki AI-veðurgreiningu...</div>';
    try {
      const res = await fetch(`https://vedurspa-eta.vercel.app/api/extension?station=${slug}`);
      if (!res.ok) throw new Error('Villa við að sækja gögn');
      const data = await res.json();

      const sc = data.scorecard;
      const ai = data.aiForecastTomorrow;

      contentArea.innerHTML = `
        <div class="card" style="border-left: 3px solid ${sc.gradeColor};">
          <div class="row">
            <span style="font-size: 11px; font-weight: 700; color: #475569;">Spágæði (D-3):</span>
            <span style="font-size: 12px; font-weight: 900; color: ${sc.gradeColor};">
              ${sc.overallAccuracy}% (${sc.grade})
            </span>
          </div>
          <div style="font-size: 11px; color: #334155; margin-bottom: 8px;">
            ${sc.mainIssue}
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 11px;">
            <div style="background: #f8fafc; padding: 6px; border-radius: 4px; border: 1px solid #e2e8f0;">
              <span style="color: #64748b; font-size: 9px; display: block; font-weight: 700;">Hrá spá</span>
              <strong>${ai.rawModel.temp > 0 ? '+' : ''}${ai.rawModel.temp}°C</strong> • ${ai.rawModel.wind} m/s
            </div>
            <div style="background: #eff6ff; padding: 6px; border-radius: 4px; border: 1px solid #bfdbfe;">
              <span style="color: #1d4ed8; font-size: 9px; display: block; font-weight: 700;">AI-Leiðrétt</span>
              <strong style="color: #1e3a8a;">${ai.aiModel.temp > 0 ? '+' : ''}${ai.aiModel.temp}°C</strong> • ${ai.aiModel.wind} m/s
            </div>
          </div>
        </div>
      `;
    } catch (e) {
      contentArea.innerHTML = '<div style="color: #dc2626; font-size: 11px; text-align: center; padding: 10px;">Gat ekki sótt gögn. Athugaðu nettengingu.</div>';
    }
  }

  select.addEventListener('change', (e) => {
    loadStation(e.target.value);
  });

  loadStation(select.value);
});
