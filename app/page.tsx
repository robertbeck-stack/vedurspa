'use client';

import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  MapPin, 
  RotateCw, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Thermometer, 
  Wind, 
  CloudSun, 
  CloudRain, 
  Snowflake, 
  ShieldCheck, 
  TrendingUp, 
  HelpCircle,
  ArrowRight
} from 'lucide-react';

export default function Home() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedStationId, setSelectedStationId] = useState<number>(1475);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'verification' | 'outlook'>('verification');

  const fetchData = async (stationId: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/vedur?stationId=${stationId}`);
      if (!res.ok) throw new Error('Ekki náðist samband við vefþjón');
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(selectedStationId);
  }, [selectedStationId]);

  const stations = data?.allStations || [];
  const activeStation = data?.station || { name: 'Reykjavík', fullName: 'Reykjavík (Bústaðav.)', region: 'Höfuðborgarsvæðið' };
  const verificationDays = data?.verificationDays || [];
  const currentDay = verificationDays[selectedDayIndex] || verificationDays[0];
  const upcomingForecast = data?.upcomingForecast || [];

  return (
    <div style={{ maxWidth: '1160px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      
      {/* Header */}
      <header className="glass-panel" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <span className="badge badge-emerald">
                <CheckCircle2 size={13} style={{ marginRight: '4px' }} /> Raunprófun veðurspáa
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Veðurstofa Íslands (vedur.is)
              </span>
            </div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#fff' }}>
              Hversu rétt var veðurspáin?
            </h1>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.25rem', maxWidth: '650px' }}>
              Borið saman hvernig Veðurstofan spáði með <strong>5, 4, 3, 2 og 1 dags fyrirvara</strong> áður en dagurinn rann upp, við það sem <strong>raunverulega úr varð</strong> á mælum veðurstöðva.
            </p>
          </div>

          <button 
            onClick={() => fetchData(selectedStationId)} 
            disabled={loading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.6rem 1.1rem',
              borderRadius: '12px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-surface-elevated)',
              color: 'var(--text-main)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            <RotateCw size={14} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Sæki gögn...' : 'Uppfæra'}
          </button>
        </div>

        {/* Station Navigation */}
        <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
            Veldu veðurstöð á landinu:
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
            {stations.map((st: any) => (
              <button
                key={st.obsId}
                onClick={() => setSelectedStationId(st.obsId)}
                className={`tab-pill ${selectedStationId === st.obsId ? 'active' : ''}`}
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

      {/* Mode Switcher: Days Verification vs Upcoming Outlook */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setViewMode('verification')}
          className={`tab-pill ${viewMode === 'verification' ? 'active' : ''}`}
          style={{ padding: '0.65rem 1.25rem', fontSize: '0.875rem' }}
        >
          <Calendar size={15} />
          <span>Sannprófun liðinna daga (Hvernig spáin stóðst)</span>
        </button>

        <button
          onClick={() => setViewMode('outlook')}
          className={`tab-pill ${viewMode === 'outlook' ? 'active' : ''}`}
          style={{ padding: '0.65rem 1.25rem', fontSize: '0.875rem' }}
        >
          <ShieldCheck size={15} />
          <span>Næstu dagar framundan (Spástöðugleiki & Áreiðanleiki)</span>
        </button>
      </div>

      {viewMode === 'verification' ? (
        <>
          {/* Day Selector Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', marginBottom: '1.5rem', paddingBottom: '0.25rem' }}>
            {verificationDays.map((d: any, idx: number) => (
              <button
                key={d.dateStr}
                onClick={() => setSelectedDayIndex(idx)}
                className={`tab-pill ${selectedDayIndex === idx ? 'active' : ''}`}
              >
                <Clock size={13} />
                <span>{d.displayDate}</span>
                <span className="badge badge-emerald" style={{ fontSize: '0.6875rem', padding: '0.1rem 0.4rem' }}>
                  {d.overallAccuracy}% rétt
                </span>
              </button>
            ))}
          </div>

          {currentDay && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
              
              {/* THE TRUTH CARD: WHAT ACTUALLY HAPPENED ON THIS DAY */}
              <div 
                className="glass-panel" 
                style={{ 
                  padding: '1.75rem', 
                  background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%)',
                  border: '1px solid rgba(56, 189, 248, 0.3)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="badge badge-blue">
                        MÆLT Á VEÐURSTÖÐ #{activeStation.obsId}
                      </span>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                        {currentDay.dayOfWeek}, {currentDay.dateStr}
                      </span>
                    </div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginTop: '0.3rem' }}>
                      Hvað varð úr í raun og veru í {activeStation.name}?
                    </h2>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                      Meðalspágæði dagsins
                    </span>
                    <div style={{ fontSize: '2.25rem', fontWeight: 900, color: 'var(--accent-emerald)' }}>
                      {currentDay.overallAccuracy}%
                    </div>
                  </div>
                </div>

                {/* Actual Weather Metrics Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-blue)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                      <Thermometer size={14} /> Mældur hiti
                    </div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', marginTop: '0.2rem' }}>
                      {currentDay.actual.avgTemp > 0 ? `+${currentDay.actual.avgTemp}` : currentDay.actual.avgTemp}°C
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      Hámark: {currentDay.actual.maxTemp}°C | Lágmark: {currentDay.actual.minTemp}°C
                    </div>
                  </div>

                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-purple)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                      <Wind size={14} /> Mældur vindur
                    </div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', marginTop: '0.2rem' }}>
                      {currentDay.actual.avgWind} m/s
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      Mesta hviða: {currentDay.actual.maxGust.toFixed(1)} m/s
                    </div>
                  </div>

                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-amber)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                      <CloudSun size={14} /> Veðurlag
                    </div>
                    <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff', marginTop: '0.2rem' }}>
                      {currentDay.actual.weatherDesc}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      Skýjahula og úrkomumat
                    </div>
                  </div>
                </div>
              </div>

              {/* LEAD-TIME VERIFICATION TIMELINE: 5 DAYS -> 4 DAYS -> 3 DAYS -> 2 DAYS -> 1 DAY -> SAME DAY */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>
                      Hvað spáði Veðurstofan dagana á undan?
                    </h3>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      Fylgstu með hvernig spáin þróaðist og hvenær hún fór að hitta í mark miðað við raunveruleikann.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
                  {currentDay.leadTimes.map((lt: any) => {
                    const gradeClass = lt.score >= 90 ? 'grade-excellent' : lt.score >= 80 ? 'grade-good' : lt.score >= 65 ? 'grade-fair' : 'grade-poor';
                    const scoreColor = lt.score >= 90 ? 'var(--accent-emerald)' : lt.score >= 80 ? 'var(--accent-blue)' : lt.score >= 65 ? 'var(--accent-amber)' : 'var(--accent-rose)';
                    const badgeClass = lt.score >= 90 ? 'badge-emerald' : lt.score >= 80 ? 'badge-blue' : lt.score >= 65 ? 'badge-amber' : 'badge-rose';

                    const tempDiff = Math.round((lt.temp - currentDay.actual.avgTemp) * 10) / 10;
                    const windDiff = Math.round((lt.wind - currentDay.actual.avgWind) * 10) / 10;

                    return (
                      <div key={lt.leadDays} className={`lead-card ${gradeClass}`}>
                        
                        {/* Card Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                          <div>
                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                              {lt.leadDesc}
                            </div>
                            <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', marginTop: '0.1rem' }}>
                              {lt.title}
                            </h4>
                          </div>

                          <div style={{ textAlign: 'right' }}>
                            <span className={`badge ${badgeClass}`}>
                              {lt.score}% Rétt
                            </span>
                          </div>
                        </div>

                        {/* Forecast Prediction vs Reality Readout */}
                        <div style={{ background: 'rgba(0,0,0,0.25)', padding: '0.85rem', borderRadius: '10px', marginBottom: '0.75rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', fontSize: '0.8125rem' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Spáði hita:</span>
                            <span style={{ fontWeight: 700, color: 'var(--accent-blue)' }}>
                              {lt.temp > 0 ? `+${lt.temp}` : lt.temp}°C 
                              <span style={{ fontSize: '0.75rem', color: Math.abs(tempDiff) > 2 ? 'var(--accent-rose)' : 'var(--text-dim)', marginLeft: '6px' }}>
                                ({tempDiff > 0 ? `+${tempDiff}` : tempDiff}° frá raun)
                              </span>
                            </span>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', fontSize: '0.8125rem' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Spáði vindi:</span>
                            <span style={{ fontWeight: 700, color: 'var(--accent-purple)' }}>
                              {lt.wind} m/s
                              <span style={{ fontSize: '0.75rem', color: Math.abs(windDiff) > 2 ? 'var(--accent-rose)' : 'var(--text-dim)', marginLeft: '6px' }}>
                                ({windDiff > 0 ? `+${windDiff}` : windDiff} m/s)
                              </span>
                            </span>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8125rem' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Spáð veðurlag:</span>
                            <span style={{ fontWeight: 600, color: '#fff' }}>
                              {lt.weather}
                            </span>
                          </div>
                        </div>

                        {/* Visual Accuracy Bar */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                            <span>Nákvæmni spár</span>
                            <span style={{ fontWeight: 700, color: scoreColor }}>Einkunn {lt.grade} ({lt.score}%)</span>
                          </div>
                          <div className="accuracy-bar-track">
                            <div 
                              className="accuracy-bar-fill" 
                              style={{ width: `${lt.score}%`, backgroundColor: scoreColor }}
                            />
                          </div>
                        </div>

                        {/* Plain Icelandic Verdict */}
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem', lineHeight: 1.5, borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.6rem' }}>
                          💡 <strong>Niðurstaða:</strong> {lt.verdict}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SUMMARY INSIGHT BOX */}
              <div className="glass-panel" style={{ padding: '1.5rem', background: 'var(--bg-surface-elevated)' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <TrendingUp size={16} color="var(--accent-blue)" /> Hvenær má treysta veðurspánni á Íslandi?
                </h4>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  Rannsóknir á íslenskum veðurspám sýna að spár með <strong>5 daga fyrirvara</strong> ná oft aðeins um 35–50% nákvæmni vegna hraðra lægðabrauta á Norður-Atlantshafi. 
                  Hins vegar þegar komið er í <strong>48 klukkustundir (2 daga)</strong> stökkva spágæðin upp í yfir <strong>80–90%</strong> og verða mjög áreiðanlegar.
                </p>
              </div>

            </div>
          )}
        </>
      ) : (
        /* OUTLOOK VIEW: HOW CONFIDENT CAN WE BE IN UPCOMING DAYS? */
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff', marginBottom: '0.3rem' }}>
              Spástöðugleiki og áreiðanleiki fram í tímann
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Hversu stöðug hefur spá Veðurstofunnar verið síðustu daga fyrir dagana sem eru framundan? (Ef spáin er á sífelldu flökti milli hlaupa er áreiðanleikinn lágur).
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
              {upcomingForecast.map((item: any, idx: number) => {
                const badgeClass = item.stabilityScore >= 85 ? 'badge-emerald' : item.stabilityScore >= 70 ? 'badge-blue' : item.stabilityScore >= 55 ? 'badge-amber' : 'badge-rose';
                const scoreColor = item.stabilityScore >= 85 ? 'var(--accent-emerald)' : item.stabilityScore >= 70 ? 'var(--accent-blue)' : item.stabilityScore >= 55 ? 'var(--accent-amber)' : 'var(--accent-rose)';

                return (
                  <div key={idx} className="lead-card" style={{ background: 'var(--bg-surface)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#fff' }}>
                        {item.dayName}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                        {item.dateStr.slice(5)}
                      </span>
                    </div>

                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: '0.2rem' }}>
                      {item.temp > 0 ? `+${item.temp}` : item.temp}°C • {item.wind} m/s
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--accent-blue)', marginBottom: '1rem' }}>
                      {item.weatherDesc}
                    </div>

                    <div style={{ background: 'rgba(0,0,0,0.25)', padding: '0.75rem', borderRadius: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.3rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Áreiðanleiki:</span>
                        <span className={`badge ${badgeClass}`}>{item.stabilityScore}%</span>
                      </div>
                      <div className="accuracy-bar-track">
                        <div className="accuracy-bar-fill" style={{ width: `${item.stabilityScore}%`, backgroundColor: scoreColor }} />
                      </div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: scoreColor, marginTop: '0.4rem' }}>
                        {item.confidence}
                      </div>
                    </div>

                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem', lineHeight: 1.5 }}>
                      💡 {item.note}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-dim)', fontSize: '0.75rem', borderTop: '1px solid var(--border-color)', marginTop: '2rem' }}>
        <div>Gögn og veðurupplýsingar koma beint frá <a href="https://www.vedur.is" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-blue)', textDecoration: 'underline' }}>Veðurstofu Íslands</a>.</div>
        <div style={{ marginTop: '0.3rem' }}>Sannprófun veðurspáa eftir fyrirvara (Lead-Time Forecast Verification).</div>
      </footer>

    </div>
  );
}
