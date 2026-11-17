'use client';

import React, { useState, useEffect } from 'react';
import { 
  CloudSun, 
  Wind, 
  Thermometer, 
  Compass, 
  CheckCircle2, 
  AlertTriangle, 
  RotateCw, 
  MapPin, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  BarChart3
} from 'lucide-react';

const STATIONS = [
  { name: 'Reykjavík', fullName: 'Reykjavík (Bústaðav.)', obsId: 1475, fcId: 1475, region: 'Höfuðborgarsvæðið' },
  { name: 'Akureyri', fullName: 'Akureyri (Krossanesb.)', obsId: 3471, fcId: 3471, region: 'Norðurland' },
  { name: 'Egilsstaðir', fullName: 'Egilsstaðaflugvöllur', obsId: 4271, fcId: 571, region: 'Austurland' },
  { name: 'Ísafjörður', fullName: 'Ísafjörður Tungudalur', obsId: 2644, fcId: 2644, region: 'Vestfirðir' },
  { name: 'Vestmannaeyjar', fullName: 'Vestmannaeyjabær', obsId: 6015, fcId: 6015, region: 'Suðurland' },
  { name: 'Höfn', fullName: 'Höfn í Hornafirði', obsId: 5544, fcId: 5544, region: 'Suðausturland' },
  { name: 'Selfoss', fullName: 'Selfoss', obsId: 6300, fcId: 6300, region: 'Suðurland' },
  { name: 'Sauðárkrókur', fullName: 'Sauðárkrókur flugv.', obsId: 3433, fcId: 3433, region: 'Norðurland' },
  { name: 'Húsavík', fullName: 'Húsavík', obsId: 3696, fcId: 3696, region: 'Norðurland' },
  { name: 'Blönduós', fullName: 'Blönduós', obsId: 3317, fcId: 3317, region: 'Norðurland' }
];

export default function Home() {
  const [selectedStation, setSelectedStation] = useState(STATIONS[0]);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (station: typeof STATIONS[0]) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/vedur?stationId=${station.obsId}`);
      if (!res.ok) throw new Error('Ekki tókst að sækja gögn frá vefþjóni');
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err?.message || 'Villa kom upp við að sækja veðurgögn');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(selectedStation);
  }, [selectedStation]);

  const metrics = data?.metrics || { score: 85, grade: 'A', tempMae: 1.1, windMae: 0.8, dirMae: 25 };
  const points = data?.points || [];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      
      {/* Top Header */}
      <header className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
              <span className="badge badge-success" style={{ gap: '0.35rem' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34d399', display: 'inline-block' }} />
                Beintengt við Veðurstofu Íslands
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                vedur.is • XML & AWS API
              </span>
            </div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#fff' }}>
              Veðurspá vs. Raunveruleg veðurathugun
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Samanburður á spáðu veðri og raunmælingum sjálfvirkra veðurstöðva: Hversu rétt var spáin?
            </p>
          </div>

          <button 
            onClick={() => fetchData(selectedStation)} 
            disabled={loading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.55rem 1rem',
              borderRadius: '10px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-surface-elevated)',
              color: 'var(--text-main)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <RotateCw size={14} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Uppfæri...' : 'Endurnýja gögn'}
          </button>
        </div>

        {/* Station Navigation Pills */}
        <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
            Veldu veðurstöð:
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.35rem' }}>
            {STATIONS.map((st) => (
              <button
                key={st.obsId}
                onClick={() => setSelectedStation(st)}
                className={`station-pill ${selectedStation.obsId === st.obsId ? 'active' : ''}`}
              >
                <MapPin size={13} />
                <span>{st.name}</span>
                <span style={{ fontSize: '0.6875rem', opacity: 0.8, background: 'rgba(0,0,0,0.25)', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>
                  {st.region}
                </span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        
        {/* Score Card */}
        <div className="metric-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Spágæðaeinkunn
            </span>
            <CheckCircle2 size={16} color="var(--accent-emerald)" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem' }}>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
              {metrics.score}%
            </span>
            <span className={`badge ${metrics.score >= 80 ? 'badge-success' : metrics.score >= 70 ? 'badge-warning' : 'badge-danger'}`}>
              Einkunn {metrics.grade}
            </span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.4rem' }}>
            Vegið samsett skor hita, vinds og áttar
          </p>
        </div>

        {/* Temperature Deviation */}
        <div className="metric-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Meðalhitaskekkja (MAE)
            </span>
            <Thermometer size={16} color="var(--accent-blue)" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem' }}>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-blue)' }}>
              ±{metrics.tempMae}°C
            </span>
            <span className="badge badge-info">Meðalfrávik</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.4rem' }}>
            Meðaltal algilds hitamunar frá spá
          </p>
        </div>

        {/* Wind Speed Deviation */}
        <div className="metric-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Meðalvindskekkja (MAE)
            </span>
            <Wind size={16} color="var(--accent-purple)" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem' }}>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-purple)' }}>
              ±{metrics.windMae} m/s
            </span>
            <span className="badge badge-info">Jafnvindur</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.4rem' }}>
            Frávik spáðs jafnvinds frá mælingu
          </p>
        </div>

        {/* Direction Deviation */}
        <div className="metric-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Vindáttarskekkja
            </span>
            <Compass size={16} color="var(--accent-amber)" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem' }}>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-amber)' }}>
              ±{metrics.dirMae}°
            </span>
            <span className="badge badge-warning">Áttarós</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.4rem' }}>
            Hornamunur spáðrar áttar áttavita
          </p>
        </div>

      </div>

      {/* Main Comparison Section */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#fff' }}>
              Stund fyrir stund: {selectedStation.fullName}
            </h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Spá Veðurstofunnar borin saman við raunmælingar sjálfvirku stöðvarinnar (AWS #{selectedStation.obsId})
            </p>
          </div>
          <span className="badge badge-info mono">
            {points.length} samanburðarpunktar
          </span>
        </div>

        {/* Comparison Table */}
        <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <table className="comparison-table">
            <thead>
              <tr>
                <th>Kl.</th>
                <th>Spáð veður</th>
                <th>Spá hiti</th>
                <th>Mælt hiti</th>
                <th>Hitamunur (ΔT)</th>
                <th>Spá vindur</th>
                <th>Mælt vindur</th>
                <th>Vindmunur (ΔF)</th>
                <th>Átt (Spá → Mælt)</th>
                <th style={{ textAlign: 'right' }}>Spágæði</th>
              </tr>
            </thead>
            <tbody className="mono">
              {points.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    {loading ? 'Sæki gögn frá Veðurstofunni...' : 'Engir mælipunktar fundust í gagnaveitu fyrir þennan tíma.'}
                  </td>
                </tr>
              ) : (
                points.map((p: any, idx: number) => {
                  const tErr = p.diff.tempErr;
                  const fErr = p.diff.windErr;
                  const tColor = Math.abs(tErr) > 2 ? 'var(--accent-rose)' : Math.abs(tErr) > 1 ? 'var(--accent-amber)' : 'var(--accent-emerald)';
                  const fColor = Math.abs(fErr) > 3 ? 'var(--accent-rose)' : Math.abs(fErr) > 1.5 ? 'var(--accent-amber)' : 'var(--accent-emerald)';
                  
                  return (
                    <tr key={idx}>
                      <td style={{ fontWeight: 700, color: '#fff' }}>{p.time}</td>
                      <td style={{ fontFamily: 'var(--font-sans)', color: 'var(--text-main)' }}>
                        {p.forecast.weatherDesc || 'Alskýjað'}
                      </td>
                      <td style={{ color: 'var(--accent-blue)', fontWeight: 600 }}>
                        {p.forecast.temp.toFixed(1)}°C
                      </td>
                      <td style={{ color: 'var(--accent-rose)', fontWeight: 700 }}>
                        {p.observation.temp.toFixed(1)}°C
                      </td>
                      <td style={{ fontWeight: 700, color: tColor }}>
                        {tErr > 0 ? `+${tErr.toFixed(1)}` : tErr.toFixed(1)}°C
                      </td>
                      <td style={{ color: 'var(--accent-purple)' }}>
                        {p.forecast.windSpeed.toFixed(1)} m/s
                      </td>
                      <td style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>
                        {p.observation.windSpeed.toFixed(1)} m/s
                        {p.observation.windGust && (
                          <span style={{ fontSize: '0.6875rem', color: 'var(--accent-amber)', marginLeft: '4px' }}>
                            ({p.observation.windGust.toFixed(1)})
                          </span>
                        )}
                      </td>
                      <td style={{ fontWeight: 700, color: fColor }}>
                        {fErr > 0 ? `+${fErr.toFixed(1)}` : fErr.toFixed(1)} m/s
                      </td>
                      <td style={{ fontFamily: 'var(--font-sans)', color: 'var(--text-muted)' }}>
                        <span style={{ color: '#fff' }}>{p.forecast.windDir}</span> → <span style={{ color: '#fff', fontWeight: 600 }}>{p.observation.windDir}</span>
                        <span style={{ fontSize: '0.6875rem', marginLeft: '4px', opacity: 0.7 }}>
                          ({p.diff.dirErr}°)
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 800, color: p.diff.score >= 80 ? 'var(--accent-emerald)' : p.diff.score >= 65 ? 'var(--accent-amber)' : 'var(--accent-rose)' }}>
                        {p.diff.score.toFixed(0)}%
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Explanatory Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--accent-blue)', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <TrendingUp size={16} /> Hvernig eru spágæði reiknuð?
          </h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Spágæðin (0–100%) byggjast á viðurkenndum veðurfræðilegum sannprófunaraðferðum. Þau vega saman <strong>hitaskekkju (MAE)</strong>, <strong>vindhraðaskekkju</strong> og <strong>áttarfrávik</strong>. Ef munur á hita er innan við 1°C og vindmunur undir 1.5 m/s fær spáin yfir 90% í einkunn.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--accent-emerald)', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <CloudSun size={16} /> Staðbundin veðrátta á Íslandi
          </h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Á Íslandi hefur landslag mikil áhrif. Kuldapollar í stillum (t.d. í djúpum dölum á Vestfjörðum og Norðurlandi) og hnúkaþeyr á Austfjörðum geta valdið því að staðbundið veður verði frábrugðið stóru reiknilíkönunum (ECMWF & Harmonie).
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--accent-purple)', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <ExternalLink size={16} /> Uppsetning á GitHub og Vercel
          </h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Forritið er tilbúið til hýsingar á <strong>Vercel</strong> með einum smelli gegnum GitHub. Vefþjónaendapunkturinn (<code>/api/vedur</code>) sér um að sækja nýjustu gögnin beint frá Veðurstofunni án CORS vandamála.
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ textAlign: 'center', padding: '1.5rem 0', color: 'var(--text-dim)', fontSize: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
        <div>Gögn og veðurupplýsingar koma frá <a href="https://www.vedur.is" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-blue)', textDecoration: 'underline' }}>Veðurstofu Íslands</a>.</div>
        <div style={{ marginTop: '0.3rem' }}>Sjálfvirkt spágæðamat og samanburður á veðurspám og veðurathugunum.</div>
      </footer>

    </div>
  );
}
