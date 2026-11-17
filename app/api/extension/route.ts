import { NextResponse } from 'next/server';
import { resolveStation, getStationSpecificAiForecast, REGIONS_DATA, corsHeaders } from '@/lib/weather-data';

export const dynamic = 'force-dynamic';

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  // Extract station query from any parameter or URL
  const queryParam = 
    searchParams.get('station') || 
    searchParams.get('station_id') || 
    searchParams.get('stationId') || 
    searchParams.get('id') || 
    searchParams.get('name') || 
    searchParams.get('slug') || 
    searchParams.get('url') || 
    '1';

  const station = resolveStation(queryParam);
  const now = new Date();

  // Find regional stats
  const regionMeta = REGIONS_DATA.find(r => 
    r.station.toLowerCase().includes(station.name.toLowerCase()) || 
    r.region.toLowerCase() === station.region.toLowerCase()
  ) || REGIONS_DATA[0];

  // Get AI corrections
  const aiForecast = getStationSpecificAiForecast(station, now);
  const tomorrow = aiForecast[0];

  // Compute grade
  const score = regionMeta.score;
  const grade = score >= 90 ? 'A+' : score >= 85 ? 'A' : score >= 75 ? 'B' : score >= 65 ? 'C' : 'D';
  const gradeColor = score >= 85 ? '#059669' : score >= 75 ? '#d97706' : '#dc2626';

  // Icelandic weekday names
  const weekdaysShort = ['Sun', 'Mán', 'Þri', 'Mið', 'Fim', 'Fös', 'Lau'];
  const weekdaysLong = ['Sunnudagur', 'Mánudagur', 'Þriðjudagur', 'Miðvikudagur', 'Fimmtudagur', 'Föstudagur', 'Laugardagur'];

  const formattedDays = aiForecast.map((day, idx) => {
    const d = new Date(day.dateStr);
    const dayOfWeek = isNaN(d.getTime()) ? '' : weekdaysLong[d.getDay()];
    const dayOfWeekShort = isNaN(d.getTime()) ? '' : weekdaysShort[d.getDay()];
    const displayDate = day.dateStr.includes('-') ? day.dateStr.slice(5).replace('-', '/') : day.dateStr;
    return {
      ...day,
      index: idx,
      dayOfWeek,
      dayOfWeekShort,
      displayDate,
      fullTitle: `${dayOfWeek ? dayOfWeek + ' – ' : ''}${day.dayName}`
    };
  });

  // Construct ready-to-inject multi-day HTML widget for Chrome Extension
  const extensionHtml = `
<div id="vedurvaktin-ext-widget" style="margin: 16px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #ffffff; border: 1px solid #cbd5e1; border-top: 3px solid #0f4678; border-radius: 8px; box-shadow: 0 4px 12px rgba(15, 70, 120, 0.08); padding: 14px 18px; color: #1e293b;">
  <!-- Header Bar -->
  <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 12px; gap: 8px;">
    <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
      <span style="background: #0f4678; color: #ffffff; font-size: 10px; font-weight: 800; padding: 2px 7px; border-radius: 4px; letter-spacing: 0.5px;">AI VEÐURVAKTIN</span>
      <strong style="font-size: 14px; color: #0f4678;">${station.name} (${station.region})</strong>
      <span style="font-size: 11px; color: #64748b; background: #f1f5f9; padding: 2px 6px; border-radius: 4px;">4 daga Snjallspá</span>
    </div>
    <div style="display: flex; align-items: center; gap: 10px;">
      <div style="display: flex; align-items: center; gap: 5px;">
        <span style="font-size: 11px; color: #64748b;">Spágæði:</span>
        <span style="background: ${gradeColor}18; color: ${gradeColor}; font-weight: 800; font-size: 12px; padding: 2px 8px; border-radius: 12px; border: 1px solid ${gradeColor}40;">
          ${score}% (${grade})
        </span>
      </div>
      <a href="https://vedurspa-eta.vercel.app" target="_blank" style="color: #0f4678; text-decoration: none; font-size: 11px; font-weight: 700; background: #eff6ff; padding: 3px 8px; border-radius: 4px; border: 1px solid #bfdbfe;">
        Skoða alla greiningu ↗
      </a>
    </div>
  </div>

  <!-- Multi-day Quick Overview Strip (Clickable pills) -->
  <div style="margin-bottom: 12px;">
    <div style="font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; margin-bottom: 6px; display: flex; justify-content: space-between;">
      <span>🗓️ Næstu 4 dagar – Veldu dag til að sjá AI-leiðréttingu:</span>
      <span style="font-size: 10px; color: #94a3b8; font-weight: normal;">Smelltu á dag</span>
    </div>
    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px;">
      ${formattedDays.map((d, i) => {
        const tempDiffStr = d.diffs.tempDiff > 0 ? `+${d.diffs.tempDiff}°C` : `${d.diffs.tempDiff}°C`;
        const tempBadgeBg = Math.abs(d.diffs.tempDiff) >= 2 ? '#fef2f2' : '#f0fdf4';
        const tempBadgeCol = Math.abs(d.diffs.tempDiff) >= 2 ? '#b91c1c' : '#15803d';
        return `
        <button type="button" class="vedurvaktin-summary-card" data-index="${i}" onclick="(function(){
          var c=document.getElementById('vedurvaktin-ext-widget'); if(!c)return;
          c.querySelectorAll('.vedurvaktin-day-tab').forEach(function(b,idx){ b.style.background=(idx===${i}?'#0f4678':'#ffffff'); b.style.color=(idx===${i}?'#ffffff':'#475569'); b.style.borderColor=(idx===${i}?'#0f4678':'#cbd5e1'); b.style.fontWeight=(idx===${i}?'800':'600'); });
          c.querySelectorAll('.vedurvaktin-summary-card').forEach(function(k,idx){ k.style.borderColor=(idx===${i}?'#0f4678':'#e2e8f0'); k.style.background=(idx===${i}?'#eff6ff':'#ffffff'); k.style.boxShadow=(idx===${i}?'0 2px 6px rgba(15,70,120,0.15)':'none'); });
          c.querySelectorAll('.vedurvaktin-day-panel').forEach(function(p,idx){ p.style.display=(idx===${i}?'block':'none'); });
        })()" style="background: ${i === 0 ? '#eff6ff' : '#ffffff'}; border: 1.5px solid ${i === 0 ? '#0f4678' : '#e2e8f0'}; border-radius: 6px; padding: 6px 4px; text-align: center; cursor: pointer; transition: all 0.15s ease; box-shadow: ${i === 0 ? '0 2px 6px rgba(15,70,120,0.15)' : 'none'};">
          <div style="font-size: 11px; font-weight: 800; color: #0f4678; line-height: 1.2;">${d.dayOfWeekShort || d.dayName}</div>
          <div style="font-size: 9px; color: #64748b; margin-bottom: 4px;">${d.displayDate}</div>
          <div style="font-size: 15px; margin: 2px 0;">${d.ai.icon}</div>
          <div style="font-size: 12px; font-weight: 800; color: #1e293b;">${d.ai.temp > 0 ? '+' : ''}${d.ai.temp}°C</div>
          <div style="font-size: 9px; margin-top: 3px; background: ${tempBadgeBg}; color: ${tempBadgeCol}; padding: 1px 3px; border-radius: 3px; font-weight: 700;">
            ${tempDiffStr}
          </div>
        </button>
        `;
      }).join('')}
    </div>
  </div>

  <!-- Day Tabs Navigation -->
  <div style="display: flex; gap: 6px; border-bottom: 2px solid #e2e8f0; margin-bottom: 12px; overflow-x: auto; padding-bottom: 4px;">
    ${formattedDays.map((d, i) => `
      <button type="button" class="vedurvaktin-day-tab" data-index="${i}" onclick="(function(){
        var c=document.getElementById('vedurvaktin-ext-widget'); if(!c)return;
        c.querySelectorAll('.vedurvaktin-day-tab').forEach(function(b,idx){ b.style.background=(idx===${i}?'#0f4678':'#ffffff'); b.style.color=(idx===${i}?'#ffffff':'#475569'); b.style.borderColor=(idx===${i}?'#0f4678':'#cbd5e1'); b.style.fontWeight=(idx===${i}?'800':'600'); });
        c.querySelectorAll('.vedurvaktin-summary-card').forEach(function(k,idx){ k.style.borderColor=(idx===${i}?'#0f4678':'#e2e8f0'); k.style.background=(idx===${i}?'#eff6ff':'#ffffff'); k.style.boxShadow=(idx===${i}?'0 2px 6px rgba(15,70,120,0.15)':'none'); });
        c.querySelectorAll('.vedurvaktin-day-panel').forEach(function(p,idx){ p.style.display=(idx===${i}?'block':'none'); });
      })()" style="background: ${i === 0 ? '#0f4678' : '#ffffff'}; color: ${i === 0 ? '#ffffff' : '#475569'}; border: 1px solid ${i === 0 ? '#0f4678' : '#cbd5e1'}; font-size: 11px; font-weight: ${i === 0 ? '800' : '600'}; padding: 5px 10px; border-radius: 6px; cursor: pointer; white-space: nowrap; transition: all 0.15s ease;">
        📅 ${d.dayOfWeek ? d.dayOfWeek + ' (' + d.dayName + ')' : d.dayName}
      </button>
    `).join('')}
  </div>

  <!-- Day Panels (Only active day visible) -->
  ${formattedDays.map((d, i) => {
    const tempDiffStr = d.diffs.tempDiff > 0 ? `+${d.diffs.tempDiff}°C` : `${d.diffs.tempDiff}°C`;
    const windDiffStr = d.diffs.windDiff > 0 ? `+${d.diffs.windDiff} m/s` : `${d.diffs.windDiff} m/s`;
    const gustDiffStr = d.diffs.gustDiff > 0 ? `+${d.diffs.gustDiff} m/s` : `${d.diffs.gustDiff} m/s`;
    return `
    <div class="vedurvaktin-day-panel" data-index="${i}" style="display: ${i === 0 ? 'block' : 'none'};">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <span style="font-size: 12px; font-weight: 800; color: #0f4678;">${d.fullTitle} (${d.displayDate})</span>
        <span style="font-size: 11px; background: #eff6ff; color: #1d4ed8; font-weight: 700; padding: 2px 8px; border-radius: 4px; border: 1px solid #bfdbfe;">
          Öryggi AI spár: ${d.confidence}
        </span>
      </div>

      <!-- Comparison side-by-side -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
        <!-- Raw NWP -->
        <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 3px;">
            <span style="font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase;">Hrá tölvuspá (NWP líkan)</span>
            <span style="font-size: 9px; color: #94a3b8;">Óleiðrétt</span>
          </div>
          <div style="font-size: 16px; font-weight: 800; color: #334155;">
            ${d.raw.icon} ${d.raw.temp > 0 ? '+' : ''}${d.raw.temp}°C • ${d.raw.wind} m/s
          </div>
          <div style="font-size: 11px; color: #475569; margin-top: 3px; line-height: 1.3;">
            ${d.raw.weather}
          </div>
          <div style="font-size: 10px; color: #64748b; margin-top: 4px;">
            Spáðar hviður: <strong>${d.raw.gust} m/s</strong>
          </div>
        </div>

        <!-- AI Correction -->
        <div style="background: #f0f7ff; border: 1.5px solid #3b82f6; border-radius: 6px; padding: 10px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 3px;">
            <span style="font-size: 10px; font-weight: 800; color: #1d4ed8; text-transform: uppercase;">AI-Leiðrétt Snjallspá</span>
            <span style="font-size: 9px; background: #2563eb; color: #ffffff; padding: 1px 5px; border-radius: 3px; font-weight: 700;">Betri nákvæmni</span>
          </div>
          <div style="font-size: 16px; font-weight: 800; color: #1e3a8a;">
            ${d.ai.icon} ${d.ai.temp > 0 ? '+' : ''}${d.ai.temp}°C • ${d.ai.wind} m/s
          </div>
          <div style="font-size: 11px; color: #1e40af; font-weight: 600; margin-top: 3px; line-height: 1.3;">
            ${d.ai.weather}
          </div>
          <div style="font-size: 10px; color: #1e3a8a; margin-top: 4px;">
            AI metnar hviður: <strong>${d.ai.gust} m/s</strong>
          </div>
        </div>
      </div>

      <!-- Diff Metric Badges -->
      <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px;">
        <span style="font-size: 10px; background: #f1f5f9; color: #334155; padding: 3px 8px; border-radius: 4px; border: 1px solid #e2e8f0;">
          Hitaleiðrétting: <strong>${tempDiffStr}</strong>
        </span>
        <span style="font-size: 10px; background: #f1f5f9; color: #334155; padding: 3px 8px; border-radius: 4px; border: 1px solid #e2e8f0;">
          Vindhraðaleiðrétting: <strong>${windDiffStr}</strong>
        </span>
        <span style="font-size: 10px; background: #f1f5f9; color: #334155; padding: 3px 8px; border-radius: 4px; border: 1px solid #e2e8f0;">
          Hviðufrávik: <strong>${gustDiffStr}</strong>
        </span>
      </div>

      <!-- Meteorological explanation -->
      <div style="background: #f8fafc; border-left: 3px solid #0f4678; padding: 8px 12px; border-radius: 0 6px 6px 0; font-size: 11px; color: #334155; line-height: 1.4; margin-bottom: 8px;">
        <strong style="color: #0f4678;">Staðbundin eðlisfræðileg greining:</strong>
        <ul style="margin: 4px 0 0 16px; padding: 0;">
          ${d.corrections.map(c => `<li>${c}</li>`).join('')}
        </ul>
      </div>

      <!-- AI Advantage note -->
      <div style="font-size: 11px; color: #047857; background: #f0fdf4; border: 1px solid #bbf7d0; padding: 6px 10px; border-radius: 6px;">
        <strong>Hvers vegna skiptir þetta máli?</strong> ${d.aiAdvantage}
      </div>
    </div>
    `;
  }).join('')}

  <!-- Footer Info -->
  <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px; padding-top: 8px; border-top: 1px solid #f1f5f9; font-size: 10px; color: #94a3b8;">
    <span>Byggt á 365 daga tölfræðimælingum Veðurstofunnar & staðfræðilegu líkani</span>
    <a href="https://vedurspa-eta.vercel.app" target="_blank" style="color: #0f4678; text-decoration: none; font-weight: 700;">Opna Veðurvaktina ↗</a>
  </div>
</div>
`.trim();

  return NextResponse.json({
    status: 'ok',
    timestamp: now.toISOString(),
    station: {
      id: station.obsId,
      forecastId: station.fcId,
      name: station.name,
      fullName: station.fullName,
      region: station.region,
      slug: station.slug,
      vedurSlug: station.vedurSlug
    },
    scorecard: {
      overallAccuracy: score,
      grade,
      gradeColor,
      tempAccuracy: regionMeta.tempAcc,
      windAccuracy: regionMeta.windAcc,
      precipAccuracy: regionMeta.precipAcc,
      label: score >= 85 ? 'Mjög góð spá' : score >= 75 ? 'Viðunandi spá' : 'Oft skekkjur',
      mainIssue: regionMeta.mainIssue,
      note: regionMeta.note
    },
    aiForecastTomorrow: {
      date: tomorrow.dateStr,
      dayName: tomorrow.dayName,
      rawModel: tomorrow.raw,
      aiModel: tomorrow.ai,
      differences: {
        tempDiff: (tomorrow.diffs.tempDiff > 0 ? '+' : '') + tomorrow.diffs.tempDiff + '°C',
        windDiff: (tomorrow.diffs.windDiff > 0 ? '+' : '') + tomorrow.diffs.windDiff + ' m/s',
        gustDiff: (tomorrow.diffs.gustDiff > 0 ? '+' : '') + tomorrow.diffs.gustDiff + ' m/s'
      },
      corrections: tomorrow.corrections,
      aiAdvantage: tomorrow.aiAdvantage,
      confidence: tomorrow.confidence
    },
    aiForecastMultiDay: formattedDays,
    extensionHtml
  }, {
    headers: corsHeaders
  });
}

