'use client';

import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  MapPin, 
  RotateCw, 
  CheckCircle2, 
  Clock, 
  Thermometer, 
  Wind, 
  CloudSun, 
  ShieldCheck, 
  TrendingUp, 
  Star,
  AlertTriangle,
  XCircle,
  HelpCircle
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

  // Helper to render stars based on score
  const renderStars = (score: number) => {
    let starsCount = 1;
    if (score >= 90) starsCount = 5;
    else if (score >= 80) starsCount = 4;
    else if (score >= 68) starsCount = 3;
    else if (score >= 50) starsCount = 2;

    return (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Star 
            key={i} 
            size={16} 
            fill={i <= starsCount ? '#fbbf24' : 'none'} 
            color={i <= starsCount ? '#fbbf24' : 'rgba(255,255,255,0.2)'} 
          />
        ))}
      </div>
    );
  };

  return (
    <div style={{ maxWidth: '1140px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      
      {/* Header */}
      <header className="glass-panel" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <span className="badge badge-emerald">
                <CheckCircle2 size={13} style={{ marginRight: '4px' }} /> Spádómur vs. Raunveruleiki
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Veðurstofa Íslands (vedur.is)
              </span>
            </div>
            <h1 style={{ fontSize: '1.9rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#fff' }}>
              Hversu rétt var veðurspáin?
            </h1>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.25rem', maxWidth: '650px' }}>
              Skoðaðu hvernig spáin þróaðist dagana á undan (<strong>5, 4, 3, 2 og 1 dags fyrirvari</strong>) með stjörnugjöf og dómi á mannamáli miðað við það sem raunverulega gekk eftir.
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
            {loading ? 'Uppfæri...' : 'Endurnýja'}
          </button>
        </div>

        {/* Station Selection */}
        <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
            Veldu veðurstöð:
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

      {/* Mode Navigation */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setViewMode('verification')}
          className={`tab-pill ${viewMode === 'verification' ? 'active' : ''}`}
          style={{ padding: '0.65rem 1.25rem', fontSize: '0.875rem' }}
        >
          <Calendar size={15} />
          <span>Sannprófun liðinna daga (Tímalína & Dómar)</span>
        </button>

        <button
          onClick={() => setViewMode('outlook')}
          className={`tab-pill ${viewMode === 'outlook' ? 'active' : ''}`}
          style={{ padding: '0.65rem 1.25rem', fontSize: '0.875rem' }}
        >
          <ShieldCheck size={15} />
          <span>Næstu dagar framundan (Spástöðugleiki)</span>
        </button>
      </div>

      {viewMode === 'verification' ? (
        <>
          {/* Day Tabs */}
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
                  {d.overallAccuracy}%
                </span>
              </button>
            ))}
          </div>

          {currentDay && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
              
              {/* THE REALITY CARD: WHAT ACTUALLY HAPPENED */}
              <div 
                className="glass-panel" 
                style={{ 
                  padding: '1.75rem', 
                  background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.95) 100%)',
                  border: '1px solid rgba(56, 189, 248, 0.35)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="badge badge-blue">
                        RAUNMÆLING DAGSINS
                      </span>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                        {currentDay.dayOfWeek}, {currentDay.dateStr}
                      </span>
                    </div>
                    <h2 style={{ fontSize: '1.55rem', fontWeight: 800, color: '#fff', marginTop: '0.3rem' }}>
                      Hvað varð úr í raun og veru í {activeStation.name}?
                    </h2>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                      Heildareinkunn spáa
                    </span>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <span style={{ fontSize: '2.4rem', fontWeight: 900, color: 'var(--accent-emerald)' }}>
                        {currentDay.overallAccuracy}%
                      </span>
                      <span className="badge badge-emerald">Toppur</span>
                    </div>
                  </div>
                </div>

                {/* Actual Weather Key Facts */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div style={{ background: 'rgba(0,0,0,0.35)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-blue)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                      <Thermometer size={14} /> Mældur hiti
                    </div>
                    <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#fff', marginTop: '0.2rem' }}>
                      {currentDay.actual.avgTemp > 0 ? `+${currentDay.actual.avgTemp}` : currentDay.actual.avgTemp}°C
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      Hámark: {currentDay.actual.maxTemp}°C | Lágmark: {currentDay.actual.minTemp}°C
                    </div>
                  </div>

                  <div style={{ background: 'rgba(0,0,0,0.35)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-purple)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                      <Wind size={14} /> Mældur vindur
                    </div>
                    <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#fff', marginTop: '0.2rem' }}>
                      {currentDay.actual.avgWind} m/s
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      Mesta hviða: {currentDay.actual.maxGust.toFixed(1)} m/s
                    </div>
                  </div>

                  <div style={{ background: 'rgba(0,0,0,0.35)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-amber)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                      <CloudSun size={14} /> Veðurlag
                    </div>
                    <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff', marginTop: '0.2rem' }}>
                      {currentDay.actual.weatherDesc}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      Sjálfvirk veðurathugun
                    </div>
                  </div>
                </div>
              </div>

              {/* TIMELINE (1) + MANNAMÁL-DÓMAR MEÐ STJÖRNUM (5) */}
              <div>
                <div style={{ marginBottom: '1.25rem' }}>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff' }}>
                    Þróun veðurspárinnar dag frá degi (D-5 til D-0)
                  </h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    Hér er dómurinn á mannamáli: Hversu mörgum stjörnum og prósentum náði Veðurstofan eftir því hvenær spáin var gerð?
                  </p>
                </div>

                {/* Vertical Timeline with Cards */}
                <div style={{ position: 'relative', paddingLeft: '1.75rem', borderLeft: '2px solid rgba(255,255,255,0.1)', marginLeft: '0.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  
                  {currentDay.leadTimes.map((lt: any) => {
                    const gradeClass = lt.score >= 90 ? 'grade-excellent' : lt.score >= 80 ? 'grade-good' : lt.score >= 65 ? 'grade-fair' : 'grade-poor';
                    const scoreColor = lt.score >= 90 ? 'var(--accent-emerald)' : lt.score >= 80 ? 'var(--accent-blue)' : lt.score >= 65 ? 'var(--accent-amber)' : 'var(--accent-rose)';
                    const badgeClass = lt.score >= 90 ? 'badge-emerald' : lt.score >= 80 ? 'badge-blue' : lt.score >= 65 ? 'badge-amber' : 'badge-rose';

                    const tempDiff = Math.round((lt.temp - currentDay.actual.avgTemp) * 10) / 10;
                    const windDiff = Math.round((lt.wind - currentDay.actual.avgWind) * 10) / 10;

                    return (
                      <div key={lt.leadDays} style={{ position: 'relative' }}>
                        {/* Dot on Timeline */}
                        <div 
                          style={{
                            position: 'absolute',
                            left: '-36px',
                            top: '20px',
                            width: '16px',
                            height: '16px',
                            borderRadius: '50%',
                            backgroundColor: scoreColor,
                            boxShadow: `0 0 0 4px rgba(255,255,255,0.06), 0 0 12px ${scoreColor}`
                          }}
                        />

                        {/* Combined Card (1 + 5) */}
                        <div className={`lead-card ${gradeClass}`} style={{ padding: '1.4rem' }}>
                          
                          {/* Card Header with Stars and Score */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.85rem' }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                                  {lt.leadDesc}
                                </span>
                                {renderStars(lt.score)}
                              </div>
                              <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', marginTop: '0.15rem' }}>
                                {lt.title}
                              </h4>
                            </div>

                            <div style={{ textAlign: 'right' }}>
                              <span className={`badge ${badgeClass}`} style={{ fontSize: '0.85rem', padding: '0.25rem 0.7rem' }}>
                                {lt.score}% Spágæði
                              </span>
                            </div>
                          </div>

                          {/* Plain Icelandic Verdict Banner (From Concept 5) */}
                          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.85rem 1rem', borderRadius: '10px', borderLeft: `3px solid ${scoreColor}`, marginBottom: '0.85rem' }}>
                            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#fff' }}>
                              Dómur: {lt.verdict}
                            </div>
                          </div>

                          {/* Detailed Numbers & Deviations */}
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', background: 'rgba(255,255,255,0.02)', padding: '0.75rem 1rem', borderRadius: '10px', fontSize: '0.8125rem' }}>
                            <div>
                              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Hvað spáði líkanið?</span>
                              <span style={{ fontWeight: 700, color: 'var(--accent-blue)', fontSize: '0.95rem' }}>
                                {lt.temp > 0 ? `+${lt.temp}` : lt.temp}°C • {lt.wind} m/s
                              </span>
                              <span style={{ display: 'block', color: 'var(--text-dim)', fontSize: '0.75rem' }}>
                                {lt.weather}
                              </span>
                            </div>

                            <div>
                              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Hver var munurinn?</span>
                              <div style={{ fontWeight: 700 }}>
                                <span style={{ color: Math.abs(tempDiff) > 2 ? 'var(--accent-rose)' : 'var(--accent-emerald)', marginRight: '8px' }}>
                                  Hitaskekkja: {tempDiff > 0 ? `+${tempDiff}` : tempDiff}°C
                                </span>
                                <span style={{ color: Math.abs(windDiff) > 2.5 ? 'var(--accent-rose)' : 'var(--text-main)' }}>
                                  Vindur: {windDiff > 0 ? `+${windDiff}` : windDiff} m/s
                                </span>
                              </div>
                              <span style={{ display: 'block', color: 'var(--text-dim)', fontSize: '0.75rem' }}>
                                {Math.abs(tempDiff) <= 1 ? 'Mjög vel hitt á hitann' : Math.abs(tempDiff) <= 2.5 ? 'Viðunandi skekkja' : 'Verulegt hitamisræmi'}
                              </span>
                            </div>
                          </div>

                          {/* Progress Meter */}
                          <div style={{ marginTop: '0.85rem' }}>
                            <div className="accuracy-bar-track">
                              <div 
                                className="accuracy-bar-fill" 
                                style={{ width: `${lt.score}%`, backgroundColor: scoreColor }}
                              />
                            </div>
                          </div>

                        </div>
                      </div>
                    );
                  })}

                </div>
              </div>

              {/* ICELANDIC METEOROLOGY RULE (FROST & WIND) */}
              <div className="glass-panel" style={{ padding: '1.5rem', background: 'var(--bg-surface-elevated)', borderLeft: '4px solid var(--accent-blue)' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <TrendingUp size={17} color="var(--accent-blue)" /> 48-klukkustunda reglan á Íslandi
                </h4>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  Eins og tímalínan sýnir eru <strong>5 og 4 daga spár</strong> á Íslandi oftast aðeins grófar vísbendingar (35–55% nákvæmni). 
                  Þegar komið er niður í <strong>48 klukkustundir (2 daga)</strong> og sérstaklega <strong>24 klst. (í gær)</strong> hækkar nákvæmnin verulega upp í <strong>85–95%</strong>. 
                  Ef þú ert að skipuleggja ferðalag eða útivist er óhætt að treysta spánni 2 dögum áður.
                </p>
              </div>

            </div>
          )}
        </>
      ) : (
        /* OUTLOOK VIEW */
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff', marginBottom: '0.3rem' }}>
              Spástöðugleiki og áreiðanleiki fram í tímann
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Hversu mikið má treysta spá Veðurstofunnar fyrir næstu daga? (Reiknað út frá því hversu mikið reiknilíkanið hefur verið að flökta síðustu 3 daga).
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
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: scoreColor, marginTop: '0.4rem' }}>
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
        <div style={{ marginTop: '0.3rem' }}>Tímalína og mannamáls-dómar yfir veðurspágæði (Lead-Time Forecast Verification).</div>
      </footer>

    </div>
  );
}
