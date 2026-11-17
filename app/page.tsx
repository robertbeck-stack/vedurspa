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
  Compass,
  ArrowRight,
  Eye,
  BarChart3
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
  const renderStars = (score: number, size = 15) => {
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
            size={size} 
            fill={i <= starsCount ? '#fbbf24' : 'none'} 
            color={i <= starsCount ? '#fbbf24' : 'rgba(255,255,255,0.2)'} 
          />
        ))}
      </div>
    );
  };

  // Helper for color coding scores
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'var(--accent-emerald)';
    if (score >= 80) return 'var(--accent-blue)';
    if (score >= 65) return 'var(--accent-amber)';
    return 'var(--accent-rose)';
  };

  const getBadgeClass = (score: number) => {
    if (score >= 90) return 'badge-emerald';
    if (score >= 80) return 'badge-blue';
    if (score >= 65) return 'badge-amber';
    return 'badge-rose';
  };

  const getGradeClass = (score: number) => {
    if (score >= 90) return 'grade-excellent';
    if (score >= 80) return 'grade-good';
    if (score >= 65) return 'grade-fair';
    return 'grade-poor';
  };

  // SVG Convergence Chart Calculations
  const renderVisualConvergence = () => {
    if (!currentDay || !currentDay.leadTimes || currentDay.leadTimes.length === 0) return null;

    const actualT = currentDay.actual.avgTemp;
    // Reverse so it goes from D-5 (left) to D-0 (right)
    const sortedLeads = [...currentDay.leadTimes].sort((a, b) => b.leadDays - a.leadDays);

    const allTemps = [...sortedLeads.map(l => l.temp), actualT];
    const minT = Math.floor(Math.min(...allTemps) - 1.5);
    const maxT = Math.ceil(Math.max(...allTemps) + 1.5);
    const tempRange = Math.max(maxT - minT, 4);

    const chartW = 740;
    const chartH = 190;
    const padX = 55;
    const padY = 25;
    const innerW = chartW - padX * 2;
    const innerH = chartH - padY * 2;

    const getY = (temp: number) => {
      const norm = (temp - minT) / tempRange;
      return chartH - padY - norm * innerH;
    };

    const actualY = getY(actualT);

    const points = sortedLeads.map((lt, idx) => {
      const x = padX + (idx / (sortedLeads.length - 1)) * innerW;
      const y = getY(lt.temp);
      return { ...lt, x, y };
    });

    const pathD = points.reduce((acc, pt, idx) => {
      return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
    }, '');

    return (
      <div style={{ position: 'relative', width: '100%', overflowX: 'auto' }}>
        <svg 
          viewBox={`0 0 ${chartW} ${chartH}`} 
          style={{ width: '100%', minWidth: '600px', height: 'auto', display: 'block' }}
        >
          <defs>
            <linearGradient id="curveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f43f5e" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="85%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Grid lines */}
          <line x1={padX} y1={padY} x2={chartW - padX} y2={padY} stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
          <line x1={padX} y1={chartH / 2} x2={chartW - padX} y2={chartH / 2} stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
          <line x1={padX} y1={chartH - padY} x2={chartW - padX} y2={chartH - padY} stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />

          {/* REALITY REFERENCE LINE (Target) */}
          <line 
            x1={padX} 
            y1={actualY} 
            x2={chartW - padX} 
            y2={actualY} 
            stroke="var(--accent-emerald)" 
            strokeWidth="2.5" 
            strokeDasharray="6 4"
            opacity="0.85"
          />
          <text 
            x={chartW - padX + 8} 
            y={actualY + 4} 
            fill="var(--accent-emerald)" 
            fontSize="10" 
            fontWeight="700"
            fontFamily="var(--font-mono)"
          >
            RAUN {actualT > 0 ? `+${actualT}` : actualT}°C
          </text>

          {/* FORECAST CONVERGENCE PATH */}
          <path 
            d={pathD} 
            fill="none" 
            stroke="url(#curveGradient)" 
            strokeWidth="3.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            filter="url(#glow)"
          />

          {/* DATA POINTS (D-5 to D-0) */}
          {points.map((pt) => {
            const tempDiff = Math.round((pt.temp - actualT) * 10) / 10;
            const ptColor = getScoreColor(pt.score);

            return (
              <g key={pt.leadDays}>
                {/* Vertical drop line to reality */}
                <line 
                  x1={pt.x} 
                  y1={pt.y} 
                  x2={pt.x} 
                  y2={actualY} 
                  stroke="rgba(255,255,255,0.15)" 
                  strokeWidth="1" 
                  strokeDasharray="2 2" 
                />

                {/* Point circle */}
                <circle 
                  cx={pt.x} 
                  cy={pt.y} 
                  r="7" 
                  fill="#0f172a" 
                  stroke={ptColor} 
                  strokeWidth="3" 
                />
                <circle 
                  cx={pt.x} 
                  cy={pt.y} 
                  r="3" 
                  fill={ptColor} 
                />

                {/* Forecast temp label above */}
                <text 
                  x={pt.x} 
                  y={pt.y - 12} 
                  textAnchor="middle" 
                  fill="#ffffff" 
                  fontSize="12" 
                  fontWeight="800"
                  fontFamily="var(--font-mono)"
                >
                  {pt.temp > 0 ? `+${pt.temp}` : pt.temp}°C
                </text>

                {/* Delta label */}
                <text 
                  x={pt.x} 
                  y={pt.y + 22} 
                  textAnchor="middle" 
                  fill={Math.abs(tempDiff) <= 1 ? '#10b981' : Math.abs(tempDiff) <= 2.5 ? '#f59e0b' : '#f43f5e'} 
                  fontSize="9.5" 
                  fontWeight="700"
                >
                  {tempDiff > 0 ? `+${tempDiff}°C` : `${tempDiff}°C`}
                </text>

                {/* X-axis lead name below */}
                <text 
                  x={pt.x} 
                  y={chartH - 4} 
                  textAnchor="middle" 
                  fill="var(--text-muted)" 
                  fontSize="10" 
                  fontWeight="700"
                >
                  {pt.leadDays === 0 ? 'D-0 (Samd.)' : `D-${pt.leadDays} (${pt.leadDays}d)`}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Legend */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.4rem', padding: '0 0.5rem', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ width: '12px', height: '3px', background: 'var(--accent-emerald)', borderRadius: '2px', display: 'inline-block' }}></span>
              Græn strikalína: Raunverulegur mældur hiti dagsins
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ width: '12px', height: '3px', background: 'linear-gradient(90deg, #f43f5e, #10b981)', borderRadius: '2px', display: 'inline-block' }}></span>
              Ferill: Hvernig hitaspáin lagaðist eftir því sem nær dró
            </span>
          </div>
          <span style={{ fontStyle: 'italic' }}>
            ← Eldri spá (óvissa) | Nýrri spá (nákvæm) →
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="widescreen-container">
      
      {/* Top Header & Controls */}
      <header className="glass-panel" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span className="badge badge-emerald">
                <CheckCircle2 size={13} style={{ marginRight: '4px' }} /> Spádómur vs. Raunveruleiki
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Gögn frá Veðurstofu Íslands (vedur.is)
              </span>
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#fff' }}>
              Hversu rétt var veðurspáin?
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button 
              onClick={() => fetchData(selectedStationId)} 
              disabled={loading}
              className="tab-pill"
              style={{ background: 'var(--bg-surface-elevated)' }}
            >
              <RotateCw size={14} className={loading ? 'animate-spin' : ''} />
              <span>{loading ? 'Uppfæri...' : 'Endurnýja gögn'}</span>
            </button>
          </div>
        </div>

        {/* Station Selection Chips Bar */}
        <div style={{ marginTop: '1rem', paddingTop: '0.85rem', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
              Veldu veðurstöð (10 stöðvar hringinn í kringum landið):
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--accent-blue)', fontWeight: 600 }}>
              Valin stöð: {activeStation.fullName}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '0.2rem' }}>
            {stations.map((st: any) => (
              <button
                key={st.obsId}
                onClick={() => setSelectedStationId(st.obsId)}
                className={`tab-pill ${selectedStationId === st.obsId ? 'active' : ''}`}
                style={{ padding: '0.45rem 0.8rem', fontSize: '0.78rem' }}
              >
                <MapPin size={12} />
                <span>{st.name}</span>
                <span style={{ fontSize: '0.65rem', opacity: 0.8, background: 'rgba(0,0,0,0.25)', padding: '0.1rem 0.3rem', borderRadius: '4px' }}>
                  {st.region}
                </span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Mode Toggle & Day Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setViewMode('verification')}
            className={`tab-pill ${viewMode === 'verification' ? 'active' : ''}`}
            style={{ padding: '0.6rem 1.15rem' }}
          >
            <BarChart3 size={15} />
            <span>Sannprófun liðinna daga (Tímalína D-5 til D-0)</span>
          </button>

          <button
            onClick={() => setViewMode('outlook')}
            className={`tab-pill ${viewMode === 'outlook' ? 'active' : ''}`}
            style={{ padding: '0.6rem 1.15rem' }}
          >
            <ShieldCheck size={15} />
            <span>Spástöðugleiki framundan (Næstu 4 dagar)</span>
          </button>
        </div>

        {/* Day Selectors */}
        {viewMode === 'verification' && (
          <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto' }}>
            {verificationDays.map((d: any, idx: number) => (
              <button
                key={d.dateStr}
                onClick={() => setSelectedDayIndex(idx)}
                className={`tab-pill ${selectedDayIndex === idx ? 'active' : ''}`}
                style={{ padding: '0.45rem 0.8rem', fontSize: '0.78rem' }}
              >
                <Clock size={12} />
                <span>{d.displayDate}</span>
                <span className="badge badge-emerald" style={{ fontSize: '0.65rem', padding: '0.1rem 0.35rem' }}>
                  {d.overallAccuracy}%
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {viewMode === 'verification' && currentDay && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* UPPER SECTION: SIDE-BY-SIDE ON WIDESCREEN (Reality Card on Left + Visual Chart on Right) */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'minmax(340px, 1fr) 2fr', 
            gap: '1.25rem',
            alignItems: 'stretch'
          }}>
            
            {/* LEFT: THE REALITY ANCHOR */}
            <div 
              className="glass-panel" 
              style={{ 
                padding: '1.4rem', 
                background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.8) 100%)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span className="badge badge-blue">
                    RAUNMÆLING DAGSINS
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {currentDay.dayOfWeek}, {currentDay.dateStr}
                  </span>
                </div>

                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff', marginBottom: '0.4rem' }}>
                  {activeStation.name} – Raunveður
                </h2>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1.1rem' }}>
                  Hér er það sem sjálfvirka veðurstöðin mældi í raun allan daginn:
                </p>

                {/* Big Visual Gauges */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  {/* Temp Gauge */}
                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.9rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--accent-blue)', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>
                      <Thermometer size={13} /> Mældur hiti
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 900, color: '#fff', marginTop: '0.2rem', fontFamily: 'var(--font-mono)' }}>
                      {currentDay.actual.avgTemp > 0 ? `+${currentDay.actual.avgTemp}` : currentDay.actual.avgTemp}°C
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
                      Hám: {currentDay.actual.maxTemp}° / Lágm: {currentDay.actual.minTemp}°
                    </div>
                  </div>

                  {/* Wind Gauge */}
                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.9rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--accent-purple)', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>
                      <Wind size={13} /> Mældur vindur
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 900, color: '#fff', marginTop: '0.2rem', fontFamily: 'var(--font-mono)' }}>
                      {currentDay.actual.avgWind} <span style={{ fontSize: '1rem', fontWeight: 600 }}>m/s</span>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
                      Hviða: {currentDay.actual.maxGust.toFixed(1)} m/s
                    </div>
                  </div>
                </div>

                {/* Weather condition */}
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.8rem 1rem', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--accent-amber)', fontWeight: 700, textTransform: 'uppercase' }}>
                      Veðurlag dagsins
                    </span>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>
                      {currentDay.actual.weatherDesc}
                    </div>
                  </div>
                  <CloudSun size={28} color="var(--accent-amber)" />
                </div>
              </div>

              {/* Overall Accuracy rating for the day */}
              <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, display: 'block' }}>
                    Heildargæði spáa
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                    {renderStars(currentDay.overallAccuracy, 17)}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--accent-emerald)', fontFamily: 'var(--font-mono)', lineHeight: 1 }}>
                    {currentDay.overallAccuracy}%
                  </span>
                  <span className="badge badge-emerald" style={{ display: 'block', marginTop: '0.2rem', textAlign: 'center' }}>
                    Frábær spá
                  </span>
                </div>
              </div>
            </div>

            {/* RIGHT: SJÓNRÆNT SAMANBURÐARGRAF (Visual Convergence Board) */}
            <div 
              className="glass-panel" 
              style={{ 
                padding: '1.4rem', 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Eye size={16} color="var(--accent-blue)" />
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>
                      Sjónræn samleitni spárinnar: Hvernig sveigðist hún að raunveruleikanum?
                    </h3>
                  </div>
                  <span className="badge badge-blue">
                    Sjónrænt hitarit
                  </span>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                  Sjáðu með berum augum hvernig spáin hófst fimm dögum áður (D-5) og hvernig líkön Veðurstofunnar færðust nær raunhitanum (græna strikalínan) eftir því sem nær dró:
                </p>

                {/* SVG Visual Chart */}
                {renderVisualConvergence()}
              </div>

              {/* Bottom Quick Insight Banner */}
              <div style={{ marginTop: '1rem', background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.2)', padding: '0.75rem 1rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <TrendingUp size={20} color="var(--accent-blue)" style={{ flexShrink: 0 }} />
                <div style={{ fontSize: '0.8rem', color: 'var(--text-main)' }}>
                  <strong>Mannamáls-samantekt:</strong> Langtímaspáin (D-5 til D-4) sýndi töluvert frávik eins og algengt er á Íslandi, en frá og með <strong>D-2 (48 klst. fyrirvara)</strong> náðu líkönin mikilli nákvæmni og morgunspáin samdægurs hitti nánast fullkomlega á bæði hita og vind.
                </div>
              </div>
            </div>

          </div>

          {/* LOWER SECTION: 6-COLUMN WIDESCREEN BOARD (D-5 to D-0 Side-by-Side Across the Screen!) */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff' }}>
                  Þróun spárinnar eftir fyrirvara (D-5 til D-0 hlið við hlið)
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Öll 6 spjöldin hlið við hlið yfir allan skjáinn – stjörnur, frávik og mannamálsdómur fyrir hvern fyrirvara:
                </p>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>
                6 dálkar yfir allan skjáinn
              </span>
            </div>

            {/* 6-Column Responsive Grid */}
            <div className="lead-grid-6">
              {currentDay.leadTimes.map((lt: any) => {
                const gradeClass = getGradeClass(lt.score);
                const scoreColor = getScoreColor(lt.score);
                const badgeClass = getBadgeClass(lt.score);

                const tempDiff = Math.round((lt.temp - currentDay.actual.avgTemp) * 10) / 10;
                const windDiff = Math.round((lt.wind - currentDay.actual.avgWind) * 10) / 10;

                return (
                  <div key={lt.leadDays} className={`lead-col-card ${gradeClass}`}>
                    
                    {/* Header */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                          {lt.leadDays === 0 ? 'D-0' : `D-${lt.leadDays}`}
                        </span>
                        <span className={`badge ${badgeClass}`} style={{ fontSize: '0.75rem', padding: '0.15rem 0.45rem' }}>
                          {lt.score}%
                        </span>
                      </div>

                      <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#fff', lineHeight: 1.25, marginBottom: '0.35rem' }}>
                        {lt.title}
                      </div>

                      <div style={{ marginBottom: '0.6rem' }}>
                        {renderStars(lt.score, 13)}
                      </div>

                      {/* Plain Icelandic Verdict */}
                      <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.6rem 0.65rem', borderRadius: '8px', borderLeft: `3px solid ${scoreColor}`, marginBottom: '0.75rem' }}>
                        <div style={{ fontSize: '0.76rem', color: '#fff', lineHeight: 1.35, fontWeight: 500 }}>
                          {lt.verdict}
                        </div>
                      </div>
                    </div>

                    {/* Numeric Facts & Differences */}
                    <div>
                      <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.65rem', borderRadius: '8px', fontSize: '0.75rem', marginBottom: '0.6rem' }}>
                        
                        {/* Spáð */}
                        <div style={{ marginBottom: '0.4rem', paddingBottom: '0.4rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                          <span style={{ color: 'var(--text-dim)', fontSize: '0.68rem', display: 'block' }}>Hvað var spáð?</span>
                          <span style={{ fontWeight: 800, color: 'var(--accent-blue)', fontSize: '0.88rem', fontFamily: 'var(--font-mono)' }}>
                            {lt.temp > 0 ? `+${lt.temp}` : lt.temp}°C • {lt.wind} m/s
                          </span>
                          <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                            {lt.weather}
                          </span>
                        </div>

                        {/* Frávik */}
                        <div>
                          <span style={{ color: 'var(--text-dim)', fontSize: '0.68rem', display: 'block' }}>Mismunur við raun:</span>
                          <div style={{ fontWeight: 700, fontSize: '0.78rem' }}>
                            <span style={{ color: Math.abs(tempDiff) > 2 ? 'var(--accent-rose)' : Math.abs(tempDiff) > 1 ? 'var(--accent-amber)' : 'var(--accent-emerald)', marginRight: '6px' }}>
                              Hiti: {tempDiff > 0 ? `+${tempDiff}` : tempDiff}°C
                            </span>
                            <span style={{ color: Math.abs(windDiff) > 2.5 ? 'var(--accent-rose)' : 'var(--text-muted)' }}>
                              Vind: {windDiff > 0 ? `+${windDiff}` : windDiff}
                            </span>
                          </div>
                        </div>

                      </div>

                      {/* Accuracy Bar */}
                      <div>
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

        </div>
      )}

      {/* OUTLOOK VIEW (Next 4 Days Stability) */}
      {viewMode === 'outlook' && (
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
              <span className="badge badge-blue">
                SPÁSTÖÐUGLEIKI & ÁREIÐANLEIKI
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {activeStation.name} – Næstu 4 dagar
              </span>
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>
              Hversu mikið má treysta veðurspánni næstu daga?
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', maxWidth: '750px' }}>
              Metur hvort spálíkön (ECMWF, Harmonie, GFS) séu sammála eða hvort spáin sé enn að sveiflast mikið milli reiknihlaupa.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {upcomingForecast.map((fc: any) => {
              const scoreColor = getScoreColor(fc.stabilityScore);
              const badgeClass = getBadgeClass(fc.stabilityScore);

              return (
                <div 
                  key={fc.dateStr} 
                  className="lead-col-card" 
                  style={{ 
                    borderTop: `4px solid ${scoreColor}`,
                    background: 'var(--bg-surface-elevated)'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                        {fc.dateStr}
                      </span>
                      <span className={`badge ${badgeClass}`}>
                        {fc.stabilityScore}% Stöðugleiki
                      </span>
                    </div>

                    <h4 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', marginBottom: '0.2rem' }}>
                      {fc.dayName}
                    </h4>

                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-blue)', marginBottom: '0.3rem' }}>
                      {fc.temp > 0 ? `+${fc.temp}` : fc.temp}°C • {fc.wind} m/s
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>
                      {fc.weatherDesc}
                    </div>

                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '8px', borderLeft: `3px solid ${scoreColor}`, marginBottom: '0.75rem' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: scoreColor, marginBottom: '0.15rem' }}>
                        {fc.confidence}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-main)' }}>
                        {fc.note}
                      </div>
                    </div>
                  </div>

                  <div className="accuracy-bar-track">
                    <div 
                      className="accuracy-bar-fill" 
                      style={{ width: `${fc.stabilityScore}%`, backgroundColor: scoreColor }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{ marginTop: '2.5rem', padding: '1.25rem', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.78rem', borderTop: '1px solid var(--border-color)' }}>
        Veðurspá vs. Raunveruleiki • Samanburður byggður á rauntímamælingum og spám frá Veðurstofu Íslands (vedur.is) • Keyrt á Vercel & Next.js
      </footer>

    </div>
  );
}
