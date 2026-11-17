import { NextResponse } from 'next/server';
import { STATIONS, REGIONS_DATA, corsHeaders } from '@/lib/weather-data';

export const dynamic = 'force-dynamic';

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') || '').toLowerCase().trim();
  const region = (searchParams.get('region') || '').toLowerCase().trim();

  let filtered = STATIONS;

  if (region) {
    filtered = filtered.filter(s => s.region.toLowerCase().includes(region));
  }

  if (q) {
    filtered = filtered.filter(s => 
      s.name.toLowerCase().includes(q) || 
      s.fullName.toLowerCase().includes(q) ||
      s.slug.toLowerCase().includes(q) ||
      s.region.toLowerCase().includes(q)
    );
  }

  return NextResponse.json({
    status: 'ok',
    total: filtered.length,
    stations: filtered.map(s => ({
      id: s.obsId,
      forecastId: s.fcId,
      name: s.name,
      fullName: s.fullName,
      region: s.region,
      slug: s.slug,
      vedurSlug: s.vedurSlug,
      apiEndpoint: `/api/extension?station=${s.slug}`
    })),
    regions: REGIONS_DATA.map(r => ({
      region: r.region,
      station: r.station,
      accuracyScore: r.score,
      tempAccuracy: r.tempAcc,
      windAccuracy: r.windAcc,
      precipAccuracy: r.precipAcc,
      mainIssue: r.mainIssue
    }))
  }, {
    headers: corsHeaders
  });
}
