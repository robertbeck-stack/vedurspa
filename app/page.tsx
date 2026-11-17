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
  Eye,
  BarChart3,
  Layers,
  Globe2,
  SlidersHorizontal,
  Flame,
  CloudRain
} from 'lucide-react';

export default function Home() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedStationId, setSelectedStationId] = useState<number>(0); // 0 = Allt landið
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [chartSubView, setChartSubView] = useState<'temp' | 'culprits' | 'allRegions'>('culprits');
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
  const activeStation = data?.station || { name: 'Allt landið', fullName: 'Allt landið (Landsyfirlit)', region: 'Ísland allt' };
  const verificationDays = data?.verificationDays || [];
  const currentDay = verificationDays[selectedDayIndex] || verificationDays[0];
  const upcomingForecast = data?.upcomingForecast || [];
  const regionsSummary = data?.regionsSummary || [];

  // Helper to render stars
  const renderStars = (score: number, size = 14) => {
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

  // SVG CHART 1: TEMPERATURE CONVERGENCE
  const renderTempChart = () => {
    if (!currentDay || !currentDay.leadTimes) return null;
    const actualT = currentDay.actual.avgTemp;
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

    const getY = (temp: number) => chartH - padY - ((temp - minT) / tempRange) * innerH;
    const actualY = getY(actualT);

    const points = sortedLeads.map((lt, idx) => ({
      ...lt,
      x: padX + (idx / (sortedLeads.length - 1)) * innerW,
      y: getY(lt.temp)
    }));

    const pathD = points.reduce((acc, pt, idx) => idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`, '');

    return (
      <div style={{ position: 'relative', width: '100%', overflowX: 'auto' }}>
        <svg viewBox={`0 0 ${chartW} ${chartH}`} style={{ width: '100%', minWidth: '600px', height: 'auto', display: 'block' }}>
          <defs>
            <linearGradient id="curveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f43f5e" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="85%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>

          {/* Reference line */}
          <line x1={padX} y1={actualY} x2={chartW - padX} y2={actualY} stroke="#10b981" strokeWidth="2.5" strokeDasharray="6 4" opacity="0.85" />
          <text x={chartW - padX + 8} y={actualY + 4} fill="#10b981" fontSize="10.5" fontWeight="800" fontFamily="var(--font-mono)">
            RAUN {actualT > 0 ? `+${actualT}` : actualT}°C
          </text>

          {/* Curve */}
          <path d={pathD} fill="none" stroke="url(#curveGradient)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Points */}
          {points.map((pt) => {
            const tempDiff = Math.round((pt.temp - actualT) * 10) / 10;
            const ptColor = getScoreColor(pt.score);
            return (
              <g key={pt.leadDays}>
                <line x1={pt.x} y1={pt.y} x2={pt.x} y2={actualY} stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="2 2" />
                <circle cx={pt.x} cy={pt.y} r="7" fill="#0f172a" stroke={ptColor} strokeWidth="3" />
                <circle cx={pt.x} cy={pt.y} r="3" fill={ptColor} />
                <text x={pt.x} y={pt.y - 12} textAnchor="middle" fill="#fff" fontSize="12" fontWeight="800" fontFamily="var(--font-mono)">
                  {pt.temp > 0 ? `+${pt.temp}` : pt.temp}°C
                </text>
                <text x={pt.x} y={pt.y + 22} textAnchor="middle" fill={Math.abs(tempDiff) <= 1 ? '#10b981' : Math.abs(tempDiff) <= 2.5 ? '#f59e0b' : '#f43f5e'} fontSize="9.5" fontWeight="700">
                  {tempDiff > 0 ? `+${tempDiff}°C` : `${tempDiff}°C`}
                </text>
                <text x={pt.x} y={chartH - 4} textAnchor="middle" fill="var(--text-muted)" fontSize="10" fontWeight="700">
                  {pt.leadDays === 0 ? 'D-0 (Samd.)' : `D-${pt.leadDays}`}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  // SVG CHART 2: MULTI-LINE ERROR BREAKDOWN (HVAÐ ER AÐ KLIKKA: HITI VS. VINDUR VS. ÚRKOMA)
  const renderCulpritsChart = () => {
    if (!currentDay || !currentDay.leadTimes) return null;
    const sortedLeads = [...currentDay.leadTimes].sort((a, b) => b.leadDays - a.leadDays);

    const chartW = 740;
    const chartH = 205;
    const padX = 55;
    const padY = 25;
    const innerW = chartW - padX * 2;
    const innerH = chartH - padY * 2;

    // Scale errors to 0..100% of max severity
    // Max temp error ~6°C, Max wind error ~7 m/s, Max precip error ~70%
    const getTempY = (err: number) => chartH - padY - (Math.min(err, 6) / 6) * innerH;
    const getWindY = (err: number) => chartH - padY - (Math.min(err, 7) / 7) * innerH;
    const getPrecipY = (err: number) => chartH - padY - (Math.min(err, 70) / 70) * innerH;

    const points = sortedLeads.map((lt, idx) => {
      const x = padX + (idx / (sortedLeads.length - 1)) * innerW;
      return {
        ...lt,
        x,
        yTemp: getTempY(lt.tempError || 0),
        yWind: getWindY(lt.windError || 0),
        yPrecip: getPrecipY(lt.precipError || 0)
      };
    });

    const pathTemp = points.reduce((acc, p, i) => i === 0 ? `M ${p.x} ${p.yTemp}` : `${acc} L ${p.x} ${p.yTemp}`, '');
    const pathWind = points.reduce((acc, p, i) => i === 0 ? `M ${p.x} ${p.yWind}` : `${acc} L ${p.x} ${p.yWind}`, '');
    const pathPrecip = points.reduce((acc, p, i) => i === 0 ? `M ${p.x} ${p.yPrecip}` : `${acc} L ${p.x} ${p.yPrecip}`, '');

    return (
      <div style={{ position: 'relative', width: '100%', overflowX: 'auto' }}>
        <svg viewBox={`0 0 ${chartW} ${chartH}`} style={{ width: '100%', minWidth: '600px', height: 'auto', display: 'block' }}>
          {/* Grid lines */}
          <line x1={padX} y1={padY} x2={chartW - padX} y2={padY} stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
          <text x={padX - 8} y={padY + 4} fill="var(--text-dim)" fontSize="9" textAnchor="end">Mikil villa</text>
          
          <line x1={padX} y1={chartH / 2} x2={chartW - padX} y2={chartH / 2} stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
          <text x={padX - 8} y={chartH / 2 + 3} fill="var(--text-dim)" fontSize="9" textAnchor="end">Meðal</text>

          <line x1={padX} y1={chartH - padY} x2={chartW - padX} y2={chartH - padY} stroke="#10b981" strokeWidth="1.5" />
          <text x={padX - 8} y={chartH - padY + 3} fill="#10b981" fontSize="9" fontWeight="700" textAnchor="end">Engin villa</text>

          {/* 1. Temp Error Line (Red) */}
          <path d={pathTemp} fill="none" stroke="#f43f5e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          
          {/* 2. Wind Error Line (Purple) */}
          <path d={pathWind} fill="none" stroke="#c084fc" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

          {/* 3. Precip Error Line (Amber) */}
          <path d={pathPrecip} fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeDasharray="5 3" strokeLinecap="round" strokeLinejoin="round" />

          {/* Points */}
          {points.map((p) => (
            <g key={p.leadDays}>
              {/* Temp Point */}
              <circle cx={p.x} cy={p.yTemp} r="5" fill="#0f172a" stroke="#f43f5e" strokeWidth="2.5" />
              <text x={p.x} y={p.yTemp - 9} textAnchor="middle" fill="#f43f5e" fontSize="10" fontWeight="800" fontFamily="var(--font-mono)">
                {p.tempError}°C
              </text>

              {/* Wind Point */}
              <circle cx={p.x} cy={p.yWind} r="4.5" fill="#0f172a" stroke="#c084fc" strokeWidth="2.5" />
              <text x={p.x} y={p.yWind + 14} textAnchor="middle" fill="#c084fc" fontSize="9.5" fontWeight="800" fontFamily="var(--font-mono)">
                {p.windError}m/s
              </text>

              {/* X label */}
              <text x={p.x} y={chartH - 6} textAnchor="middle" fill="var(--text-muted)" fontSize="10" fontWeight="700">
                {p.leadDays === 0 ? 'D-0' : `D-${p.leadDays}`}
              </text>
            </g>
          ))}
        </svg>

        {/* Dynamic Legend */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginTop: '0.5rem', padding: '0.4rem 0.5rem', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', fontSize: '0.78rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#f43f5e', fontWeight: 700 }}>
              <span style={{ width: '12px', height: '3px', background: '#f43f5e', borderRadius: '2px', display: 'inline-block' }}></span>
              🔴 Hitaskekkja (°C villa)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#c084fc', fontWeight: 700 }}>
              <span style={{ width: '12px', height: '3px', background: '#c084fc', borderRadius: '2px', display: 'inline-block' }}></span>
              🟣 Vindskekkja (m/s villa)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#f59e0b', fontWeight: 700 }}>
              <span style={{ width: '12px', height: '3px', background: '#f59e0b', borderRadius: '2px', display: 'inline-block' }}></span>
              🟡 Úrkomu-/Veðurlagsvilla (%)
            </span>
          </div>
          <span style={{ color: 'var(--text-dim)', fontStyle: 'italic' }}>
            Lægri lína = Minni skekkja / Betri spá
          </span>
        </div>
      </div>
    );
  };

  // NATIONWIDE REGIONAL VIEW (ALLT LANDIÐ - 6 REGIONS COMPARISON)
  const renderAllRegionsView = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff' }}>
              🇮🇸 Hvar klikkar veðurspáin helst á Íslandi?
            </h4>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Samanburður á spágæðum og helstu veikleikum spálíkana milli landshluta:
            </p>
          </div>
          <span className="badge badge-blue">
            Landsmeðaltal: 83% spágæði
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.85rem' }}>
          {regionsSummary.map((reg: any) => {
            const scoreColor = getScoreColor(reg.score);
            const badgeClass = getBadgeClass(reg.score);

            return (
              <div 
                key={reg.region}
                className="lead-col-card"
                style={{ 
                  background: 'var(--bg-surface-elevated)',
                  borderTop: `4px solid ${scoreColor}`,
                  padding: '1rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>
                      {reg.station}
                    </span>
                    <h5 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>
                      {reg.region}
                    </h5>
                  </div>
                  <span className={`badge ${badgeClass}`} style={{ fontSize: '0.82rem', padding: '0.2rem 0.55rem' }}>
                    {reg.score}%
                  </span>
                </div>

                {/* Sub-metrics: Temp, Wind, Precip Accuracy */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.4rem', margin: '0.6rem 0', background: 'rgba(0,0,0,0.3)', padding: '0.5rem', borderRadius: '8px', fontSize: '0.72rem', textAlign: 'center' }}>
                  <div>
                    <span style={{ color: 'var(--text-dim)', display: 'block' }}>Hiti</span>
                    <strong style={{ color: '#f43f5e' }}>{reg.tempAcc}%</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-dim)', display: 'block' }}>Vindur</span>
                    <strong style={{ color: '#c084fc' }}>{reg.windAcc}%</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-dim)', display: 'block' }}>Úrkoma</span>
                    <strong style={{ color: '#f59e0b' }}>{reg.precipAcc}%</strong>
                  </div>
                </div>

                {/* What Fails Most */}
                <div style={{ background: 'rgba(244, 63, 94, 0.08)', border: '1px solid rgba(244, 63, 94, 0.2)', padding: '0.55rem 0.75rem', borderRadius: '8px', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.68rem', color: 'var(--accent-rose)', fontWeight: 800, textTransform: 'uppercase', display: 'block' }}>
                    ⚠️ Helsti veikleiki:
                  </span>
                  <div style={{ fontSize: '0.78rem', color: '#fff', fontWeight: 700 }}>
                    {reg.mainIssue}
                  </div>
                </div>

                <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', lineHeight: 1.35 }}>
                  {reg.note}
                </p>
              </div>
            );
          })}
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
                Rauntímagögn frá Veðurstofu Íslands (vedur.is)
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
              <span>{loading ? 'Uppfæri...' : 'Endurnýja'}</span>
            </button>
          </div>
        </div>

        {/* Station Selection Chips (With "Allt landið" prominent first) */}
        <div style={{ marginTop: '1rem', paddingTop: '0.85rem', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
              Veldu veðurstöð eða skoðaðu allt landið:
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--accent-blue)', fontWeight: 600 }}>
              Valið: {activeStation.fullName}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '0.2rem' }}>
            {stations.map((st: any) => (
              <button
                key={st.obsId}
                onClick={() => {
                  setSelectedStationId(st.obsId);
                  if (st.obsId === 0) setChartSubView('allRegions');
                }}
                className={`tab-pill ${selectedStationId === st.obsId ? 'active' : ''}`}
                style={{ 
                  padding: '0.45rem 0.85rem', 
                  fontSize: '0.8rem',
                  fontWeight: st.obsId === 0 ? 800 : 600,
                  border: st.obsId === 0 ? '1px solid rgba(56, 189, 248, 0.4)' : undefined
                }}
              >
                {st.obsId === 0 ? <Globe2 size={13} color="var(--accent-blue)" /> : <MapPin size={12} />}
                <span>{st.name}</span>
                <span style={{ fontSize: '0.65rem', opacity: 0.8, background: 'rgba(0,0,0,0.25)', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>
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
            <span>Sannprófun & Skekkjugreining (D-5 til D-0)</span>
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
          
          {/* UPPER SECTION: SIDE-BY-SIDE (Reality Card Left + Interactive Visual Chart Right) */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'minmax(330px, 1fr) 2fr', 
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
                    {activeStation.obsId === 0 ? 'LANDSYFIRLIT' : 'RAUNMÆLING'}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {currentDay.dayOfWeek}, {currentDay.dateStr}
                  </span>
                </div>

                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff', marginBottom: '0.3rem' }}>
                  {activeStation.name} – Raunveruleiki
                </h2>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1.1rem' }}>
                  {activeStation.obsId === 0 ? 'Vegið landsmeðaltal úr sjálfvirkum veðurstöðvum:' : 'Mælingar dagsins frá sjálfvirkri veðurstöð:'}
                </p>

                {/* Gauges */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.9rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--accent-blue)', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>
                      <Thermometer size={13} /> {activeStation.obsId === 0 ? 'Landsmeðalhiti' : 'Mældur hiti'}
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 900, color: '#fff', marginTop: '0.2rem', fontFamily: 'var(--font-mono)' }}>
                      {currentDay.actual.avgTemp > 0 ? `+${currentDay.actual.avgTemp}` : currentDay.actual.avgTemp}°C
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
                      Hám: {currentDay.actual.maxTemp}° / Lágm: {currentDay.actual.minTemp}°
                    </div>
                  </div>

                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.9rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--accent-purple)', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>
                      <Wind size={13} /> {activeStation.obsId === 0 ? 'Landsmeðalvindur' : 'Mældur vindur'}
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 900, color: '#fff', marginTop: '0.2rem', fontFamily: 'var(--font-mono)' }}>
                      {currentDay.actual.avgWind} <span style={{ fontSize: '1rem', fontWeight: 600 }}>m/s</span>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
                      Mesta hviða: {currentDay.actual.maxGust.toFixed(1)} m/s
                    </div>
                  </div>
                </div>

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

              {/* Accuracy rating */}
              <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, display: 'block' }}>
                    Heildargæði spáa
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                    {renderStars(currentDay.overallAccuracy, 16)}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--accent-emerald)', fontFamily: 'var(--font-mono)', lineHeight: 1 }}>
                    {currentDay.overallAccuracy}%
                  </span>
                  <span className="badge badge-emerald" style={{ display: 'block', marginTop: '0.2rem', textAlign: 'center' }}>
                    Toppgæði
                  </span>
                </div>
              </div>
            </div>

            {/* RIGHT: THE INTERACTIVE LÍNURIT & BREAKDOWN */}
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
                
                {/* SUB-VIEW TABS (Switch between: Hvað klikkar mest?, Hitastigsferill, Allt landið) */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Veldu línurit / greiningu:
                  </span>
                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    <button
                      onClick={() => setChartSubView('culprits')}
                      className={`tab-pill ${chartSubView === 'culprits' ? 'active' : ''}`}
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                    >
                      <Flame size={12} color="#f43f5e" />
                      <span>Hvað klikkar mest? (Hiti vs. Vindur)</span>
                    </button>

                    <button
                      onClick={() => setChartSubView('temp')}
                      className={`tab-pill ${chartSubView === 'temp' ? 'active' : ''}`}
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                    >
                      <Thermometer size={12} color="var(--accent-blue)" />
                      <span>Hitastigsferill (°C)</span>
                    </button>

                    <button
                      onClick={() => setChartSubView('allRegions')}
                      className={`tab-pill ${chartSubView === 'allRegions' ? 'active' : ''}`}
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                    >
                      <Globe2 size={12} color="var(--accent-emerald)" />
                      <span>Allt landið (6 landshlutar)</span>
                    </button>
                  </div>
                </div>

                {/* Subview 1: What is failing? (Error breakdown line chart) */}
                {chartSubView === 'culprits' && (
                  <div>
                    <div style={{ marginBottom: '0.5rem' }}>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>
                        📊 Línurit: Hvað er að klikka í spánum eftir fyrirvara?
                      </h3>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        Samanburður á <strong>hitaskekkju (🔴 °C)</strong>, <strong>vindskekkju (🟣 m/s)</strong> og <strong>veðurlagsskekkju (🟡 %)</strong> frá D-5 niður í D-0:
                      </p>
                    </div>
                    {renderCulpritsChart()}
                  </div>
                )}

                {/* Subview 2: Temp convergence curve */}
                {chartSubView === 'temp' && (
                  <div>
                    <div style={{ marginBottom: '0.5rem' }}>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>
                        📈 Hitastigsferill: Hvernig sveigðist spáin að raunveruleikanum?
                      </h3>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        Sýnir spáðan hita fyrir hvern fyrirvara miðað við raunmælda hitann (græna strikalínan):
                      </p>
                    </div>
                    {renderTempChart()}
                  </div>
                )}

                {/* Subview 3: All regions breakdown */}
                {chartSubView === 'allRegions' && renderAllRegionsView()}

              </div>

              {/* Bottom Quick Insight Banner */}
              <div style={{ marginTop: '0.85rem', background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.2)', padding: '0.75rem 1rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <TrendingUp size={20} color="var(--accent-blue)" style={{ flexShrink: 0 }} />
                <div style={{ fontSize: '0.8rem', color: 'var(--text-main)' }}>
                  <strong>Helsta niðurstaða skekkjurýninnar:</strong> Á löngum fyrirvara (D-5 og D-4) er það <strong>hitastigið og lægðarbrautin</strong> sem klikkar mest (oft 4–5°C villa). Vindhraði og hviður ná hins vegar meiri stöðugleika fyrr, en eru erfiðastar á Vestfjörðum og Suðausturlandi.
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
                  Hver fyrirvari sýnir nú nákvæmlega <strong>hvað klikkaði</strong> (hiti, vindur eða úrkoma):
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

                      <div style={{ marginBottom: '0.5rem' }}>
                        {renderStars(lt.score, 13)}
                      </div>

                      {/* What failed banner */}
                      <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.55rem 0.65rem', borderRadius: '8px', borderLeft: `3px solid ${scoreColor}`, marginBottom: '0.65rem' }}>
                        <div style={{ fontSize: '0.68rem', color: scoreColor, fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.15rem' }}>
                          ⚠️ Sökudólgur: {lt.culprit}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#fff', lineHeight: 1.35 }}>
                          {lt.culpritDesc}
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
                          <div style={{ fontWeight: 700, fontSize: '0.76rem' }}>
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

      {/* OUTLOOK VIEW */}
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
