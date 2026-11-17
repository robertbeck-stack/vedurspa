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

  // Construct ready-to-inject HTML widget for Chrome Extension
  const extensionHtml = `
<div id="vedurvaktin-ext-widget" style="margin: 16px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #ffffff; border: 1px solid #cbd5e1; border-top: 3px solid #0f4678; border-radius: 8px; box-shadow: 0 4px 12px rgba(15, 70, 120, 0.08); padding: 14px 18px; color: #1e293b;">
  <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 10px; margin-bottom: 12px;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="background: #0f4678; color: #ffffff; font-size: 10px; font-weight: 800; padding: 2px 7px; border-radius: 4px; letter-spacing: 0.5px;">AI VEÐURVAKTIN</span>
      <strong style="font-size: 13px; color: #0f4678;">${station.name} (${station.region})</strong>
    </div>
    <div style="display: flex; align-items: center; gap: 6px;">
      <span style="font-size: 11px; color: #64748b;">Spágæði stöðvar:</span>
      <span style="background: ${gradeColor}18; color: ${gradeColor}; font-weight: 800; font-size: 12px; padding: 2px 8px; border-radius: 12px; border: 1px solid ${gradeColor}40;">
        ${score}% (${grade})
      </span>
    </div>
  </div>

  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
    <!-- Raw NWP -->
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px;">
      <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 4px;">Hrá tölvuspá (NWP líkan)</div>
      <div style="font-size: 16px; font-weight: 800; color: #0f4678;">${tomorrow.raw.icon} ${tomorrow.raw.temp > 0 ? '+' : ''}${tomorrow.raw.temp}°C • ${tomorrow.raw.wind} m/s</div>
      <div style="font-size: 11px; color: #475569; margin-top: 3px;">${tomorrow.raw.weather} (Hviður: ${tomorrow.raw.gust} m/s)</div>
    </div>

    <!-- AI Bias Correction -->
    <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 10px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
        <span style="font-size: 10px; font-weight: 800; color: #1d4ed8; text-transform: uppercase;">AI-Leiðrétt Snjallspá</span>
        <span style="font-size: 9px; background: #2563eb; color: #ffffff; padding: 1px 5px; border-radius: 3px; font-weight: 700;">Áreiðanleiki</span>
      </div>
      <div style="font-size: 16px; font-weight: 800; color: #1e3a8a;">${tomorrow.ai.icon} ${tomorrow.ai.temp > 0 ? '+' : ''}${tomorrow.ai.temp}°C • ${tomorrow.ai.wind} m/s</div>
      <div style="font-size: 11px; color: #1e40af; font-weight: 600; margin-top: 3px;">${tomorrow.ai.weather}</div>
    </div>
  </div>

  <div style="background: #f8fafc; border-left: 3px solid #0f4678; padding: 8px 12px; border-radius: 0 6px 6px 0; font-size: 11px; color: #334155; line-height: 1.4;">
    <strong>Staðbundin innsýn:</strong> ${tomorrow.corrections[0]}
  </div>

  <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px; font-size: 10px; color: #94a3b8;">
    <span>Tölfræðilegt mat unnið úr 365 daga gagnasöfnum</span>
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
    aiForecastMultiDay: aiForecast,
    extensionHtml
  }, {
    headers: corsHeaders
  });
}
