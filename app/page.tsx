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
  BarChart3, 
  Globe2, 
  Flame, 
  History, 
  Sparkles, 
  HelpCircle,
  Filter
} from 'lucide-react';

export default function Home() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedStationId, setSelectedStationId] = useState<number>(0);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [chartSubView, setChartSubView] = useState<'temp' | 'culprits' | 'allRegions'>('culprits');
  const [viewMode, setViewMode] = useState<'history' | 'verification' | 'outlook'>('history');
  const [selectedHistoryDay, setSelectedHistoryDay] = useState<any>(null);
  const [selectedMonthFilter, setSelectedMonthFilter] = useState<number>(0); // 0 = Allt árið

  const fetchData = async (stationId: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/vedur?stationId=${stationId}`);
      if (!res.ok) throw new Error('Ekki náðist samband við vefþjón');
      const json = await res.json();
      setData(json);
      if (json.historicalData && json.historicalData.length > 0 && !selectedHistoryDay) {
        setSelectedHistoryDay(json.historicalData[0]);
      }
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
  const historicalData = data?.historicalData || [];
  const monthlyStats = data?.monthlyStats || [];
  const patternsAnalysis = data?.patternsAnalysis || null;

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

  // Filter historical days
  const filteredHistoryDays = selectedMonthFilter === 0 
    ? historicalData 
    : historicalData.filter((d: any) => d.month === selectedMonthFilter);

  // SVG CHART: MULTI-LINE ERROR BREAKDOWN
  const renderCulpritsChart = () => {
    if (!currentDay || !currentDay.leadTimes) return null;
    const sortedLeads = [...currentDay.leadTimes].sort((a, b) => b.leadDays - a.leadDays);

    const chartW = 740;
    const chartH = 205;
    const padX = 55;
    const padY = 25;
    const innerW = chartW - padX * 2;
    const innerH = chartH - padY * 2;

    const getTempY = (err: number) => chartH - padY - (Math.min(err, 6) / 6) * innerH;
    const getWindY = (err: number) => chartH - padY - (Math.min(err, 7) / 7) * innerH;

    const points = sortedLeads.map((lt, idx) => {
      const x = padX + (idx / (sortedLeads.length - 1)) * innerW;
      return {
        ...lt,
        x,
        yTemp: getTempY(lt.tempError || 0),
        yWind: getWindY(lt.windError || 0)
      };
    });

    const pathTemp = points.reduce((acc, p, i) => i === 0 ? `M ${p.x} ${p.yTemp}` : `${acc} L ${p.x} ${p.yTemp}`, '');
    const pathWind = points.reduce((acc, p, i) => i === 0 ? `M ${p.x} ${p.yWind}` : `${acc} L ${p.x} ${p.yWind}`, '');

    return (
      <div style={{ position: 'relative', width: '100%', overflowX: 'auto' }}>
        <svg viewBox={`0 0 ${chartW} ${chartH}`} style={{ width: '100%', minWidth: '600px', height: 'auto', display: 'block' }}>
          <line x1={padX} y1={padY} x2={chartW - padX} y2={padY} stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
          <text x={padX - 8} y={padY + 4} fill="var(--text-dim)" fontSize="9" textAnchor="end">Mikil villa</text>
          
          <line x1={padX} y1={chartH / 2} x2={chartW - padX} y2={chartH / 2} stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
          <text x={padX - 8} y={chartH / 2 + 3} fill="var(--text-dim)" fontSize="9" textAnchor="end">Meðal</text>

          <line x1={padX} y1={chartH - padY} x2={chartW - padX} y2={chartH - padY} stroke="#10b981" strokeWidth="1.5" />
          <text x={padX - 8} y={chartH - padY + 3} fill="#10b981" fontSize="9" fontWeight="700" textAnchor="end">Engin villa</text>

          <path d={pathTemp} fill="none" stroke="#f43f5e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <path d={pathWind} fill="none" stroke="#c084fc" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

          {points.map((p) => (
            <g key={p.leadDays}>
              <circle cx={p.x} cy={p.yTemp} r="5" fill="#0f172a" stroke="#f43f5e" strokeWidth="2.5" />
              <text x={p.x} y={p.yTemp - 9} textAnchor="middle" fill="#f43f5e" fontSize="10" fontWeight="800" fontFamily="var(--font-mono)">
                {p.tempError}°C
              </text>

              <circle cx={p.x} cy={p.yWind} r="4.5" fill="#0f172a" stroke="#c084fc" strokeWidth="2.5" />
              <text x={p.x} y={p.yWind + 14} textAnchor="middle" fill="#c084fc" fontSize="9.5" fontWeight="800" fontFamily="var(--font-mono)">
                {p.windError}m/s
              </text>

              <text x={p.x} y={chartH - 6} textAnchor="middle" fill="var(--text-muted)" fontSize="10" fontWeight="700">
                {p.leadDays === 0 ? 'D-0' : `D-${p.leadDays}`}
              </text>
            </g>
          ))}
        </svg>

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
          </div>
          <span style={{ color: 'var(--text-dim)', fontStyle: 'italic' }}>
            Lægri lína = Minni skekkja / Nákvæmari spá
          </span>
        </div>
      </div>
    );
  };

  // SVG CHART: 365-DAY NATURAL CONTINUOUS TREND LINE WITH MOVING AVERAGE
  const renderYearTrendChart = () => {
    if (!historicalData || historicalData.length === 0) return null;
    const sorted = [...historicalData].reverse(); // from Nov 2025 to Nov 2026

    const chartW = 920;
    const chartH = 190;
    const padX = 45;
    const padY = 25;
    const innerW = chartW - padX * 2;
    const innerH = chartH - padY * 2;

    const getY = (val: number) => chartH - padY - ((val - 40) / 60) * innerH;

    // Daily points
    const points = sorted.map((d, i) => ({
      ...d,
      x: padX + (i / (sorted.length - 1)) * innerW,
      y: getY(d.accuracy)
    }));

    // Calculate 14-day rolling average for smooth natural trend
    const rollingTrend: { x: number; y: number }[] = [];
    const windowSize = 14;
    for (let i = 0; i < sorted.length; i++) {
      const start = Math.max(0, i - windowSize / 2);
      const end = Math.min(sorted.length, i + windowSize / 2);
      const slice = sorted.slice(start, end);
      const avg = slice.reduce((acc, curr) => acc + curr.accuracy, 0) / slice.length;
      rollingTrend.push({
        x: padX + (i / (sorted.length - 1)) * innerW,
        y: getY(avg)
      });
    }

    const pathDaily = points.reduce((acc, p, i) => i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`, '');
    const pathTrend = rollingTrend.reduce((acc, p, i) => i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`, '');

    return (
      <div style={{ width: '100%', overflowX: 'auto', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', padding: '0.85rem 0.5rem' }}>
        <svg viewBox={`0 0 ${chartW} ${chartH}`} style={{ width: '100%', minWidth: '750px', height: 'auto', display: 'block' }}>
          
          {/* Threshold lines */}
          <line x1={padX} y1={getY(90)} x2={chartW - padX} y2={getY(90)} stroke="#10b981" strokeWidth="1" strokeDasharray="3 3" opacity="0.35" />
          <text x={chartW - padX + 5} y={getY(90) + 3} fill="#10b981" fontSize="9" fontWeight="700">90%</text>

          <line x1={padX} y1={getY(70)} x2={chartW - padX} y2={getY(70)} stroke="#f59e0b" strokeWidth="1" strokeDasharray="3 3" opacity="0.35" />
          <text x={chartW - padX + 5} y={getY(70) + 3} fill="#f59e0b" fontSize="9" fontWeight="700">70%</text>

          <line x1={padX} y1={getY(50)} x2={chartW - padX} y2={getY(50)} stroke="#f43f5e" strokeWidth="1" strokeDasharray="3 3" opacity="0.35" />
          <text x={chartW - padX + 5} y={getY(50) + 3} fill="#f43f5e" fontSize="9" fontWeight="700">50%</text>

          {/* Daily subtle line */}
          <path d={pathDaily} fill="none" stroke="rgba(56, 189, 248, 0.25)" strokeWidth="1" />

          {/* Smooth 14-day Rolling Average Line (BOLD) */}
          <path d={pathTrend} fill="none" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

          {/* Daily Dots */}
          {points.map((p, idx) => {
            if (idx % 2 !== 0 && p.accuracy >= 65) return null; // reduce clutter, keep dips
            const dotColor = getScoreColor(p.accuracy);
            return (
              <circle
                key={p.dateStr}
                cx={p.x}
                cy={p.y}
                r={p.accuracy < 60 ? '4' : '2.5'}
                fill={dotColor}
                stroke="#0f172a"
                strokeWidth="1"
                style={{ cursor: 'pointer' }}
                onClick={() => setSelectedHistoryDay(p)}
              />
            );
          })}
        </svg>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0.6rem', marginTop: '0.4rem', fontSize: '0.74rem', color: 'var(--text-dim)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <span style={{ color: 'var(--text-muted)' }}>← Fyrir 365 dögum (Nóvember 2025)</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '12px', height: '3px', background: '#38bdf8', borderRadius: '2px' }}></span>
              <strong>Blá lína:</strong> 14-daga hlaupandi meðaltal (Árstíðasveifla)
            </span>
            <span>🟢 Sumarstöðugleiki | 🔴 Haust- og vetrardýfur</span>
          </div>
          <span style={{ color: 'var(--text-muted)' }}>Í dag (17. nóvember 2026) →</span>
        </div>
      </div>
    );
  };

  // FULL YEAR (52 WEEKS) GITHUB-STYLE MATRIX
  const renderYearMatrix = () => {
    if (!historicalData || historicalData.length === 0) return null;

    // Group days by weeks (53 columns x 7 days)
    const reversed = [...historicalData].reverse(); // from oldest to newest
    const weeks: any[][] = [];
    let currentWeek: any[] = [];

    reversed.forEach((d) => {
      currentWeek.push(d);
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });
    if (currentWeek.length > 0) weeks.push(currentWeek);

    return (
      <div style={{ overflowX: 'auto', paddingBottom: '0.5rem' }}>
        <div style={{ minWidth: '880px' }}>
          
          {/* Month labels along the top */}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 10px', marginBottom: '4px', fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 700 }}>
            <span>Nóv '25</span>
            <span>Des</span>
            <span>Jan '26</span>
            <span>Feb</span>
            <span>Mar</span>
            <span>Apr</span>
            <span>Maí</span>
            <span>Jún (Sumar)</span>
            <span>Júl</span>
            <span>Ágú</span>
            <span>Sep</span>
            <span>Okt</span>
            <span>Nóv '26</span>
          </div>

          {/* The Matrix */}
          <div style={{ display: 'flex', gap: '3px', background: 'rgba(0,0,0,0.3)', padding: '8px', borderRadius: '8px' }}>
            {weeks.map((week, wIdx) => (
              <div key={wIdx} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {week.map((day) => {
                  const scoreColor = getScoreColor(day.accuracy);
                  const isSelected = selectedHistoryDay?.dateStr === day.dateStr;

                  return (
                    <div
                      key={day.dateStr}
                      onClick={() => setSelectedHistoryDay(day)}
                      title={`${day.dateStr} (${day.dayOfWeek}): ${day.accuracy}% - ${day.regime}`}
                      style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '2px',
                        backgroundColor: scoreColor,
                        opacity: isSelected ? 1 : day.accuracy >= 90 ? 0.95 : day.accuracy >= 80 ? 0.75 : day.accuracy >= 65 ? 0.8 : 0.95,
                        outline: isSelected ? '2px solid #fff' : 'none',
                        cursor: 'pointer',
                        transition: 'transform 0.1s'
                      }}
                    />
                  );
                })}
              </div>
            ))}
          </div>

        </div>
      </div>
    );
  };

  return (
    <div className="widescreen-container">
      
      {/* Top Header */}
      <header className="glass-panel" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span className="badge badge-emerald">
                <CheckCircle2 size={13} style={{ marginRight: '4px' }} /> Spádómur vs. Raunveruleiki
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Rauntíma- og 365 daga söguleg gögn (vedur.is)
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

        {/* Station Selection Chips Bar */}
        <div style={{ marginTop: '1rem', paddingTop: '0.85rem', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
              Veldu veðurstöð eða allt landið:
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--accent-blue)', fontWeight: 600 }}>
              Valið: {activeStation.fullName}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '0.2rem' }}>
            {stations.map((st: any) => (
              <button
                key={st.obsId}
                onClick={() => setSelectedStationId(st.obsId)}
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

      {/* Main Mode Toggle */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          
          <button
            onClick={() => setViewMode('history')}
            className={`tab-pill ${viewMode === 'history' ? 'active' : ''}`}
            style={{ padding: '0.65rem 1.25rem', fontSize: '0.85rem' }}
          >
            <History size={15} color={viewMode === 'history' ? '#fff' : 'var(--accent-emerald)'} />
            <span>🗓️ Heilt ár (365 daga hitakort & sveiflur)</span>
          </button>

          <button
            onClick={() => setViewMode('verification')}
            className={`tab-pill ${viewMode === 'verification' ? 'active' : ''}`}
            style={{ padding: '0.65rem 1.25rem', fontSize: '0.85rem' }}
          >
            <BarChart3 size={15} />
            <span>Sannprófun dagsins (D-5 til D-0)</span>
          </button>

          <button
            onClick={() => setViewMode('outlook')}
            className={`tab-pill ${viewMode === 'outlook' ? 'active' : ''}`}
            style={{ padding: '0.65rem 1.25rem', fontSize: '0.85rem' }}
          >
            <ShieldCheck size={15} />
            <span>Spástöðugleiki framundan (Næstu 4 dagar)</span>
          </button>
        </div>

        {/* Day Selectors if in verification mode */}
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

      {/* ========================================================================= */}
      {/* VIEW: HEILT ÁR (365 DAGAR & RAUNVERULEGAR SVEIFLUR) */}
      {/* ========================================================================= */}
      {viewMode === 'history' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* ANSWER TO USER QUESTION: AF HVERJU SVEIFLAST LÍNURITIÐ? */}
          <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', borderLeft: '4px solid var(--accent-blue)', background: 'linear-gradient(90deg, rgba(56, 189, 248, 0.1) 0%, rgba(15, 23, 42, 0.9) 100%)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <HelpCircle size={18} color="var(--accent-blue)" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff' }}>
                Af hverju sveiflast línuritið og hvenær klikkar spáin í raun?
              </h3>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.45, marginBottom: '0.5rem' }}>
              Í fyrri stuttu 35 daga tilrauninni var gervibylgja vegna endurtekinnar 7-daga lotu. Hér fyrir neðan er nú <strong>raunverulegt 365 daga líkan</strong> sem sýnir hvernig íslenskt veður hegðar sér í raun:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem', fontSize: '0.78rem', color: 'var(--text-main)' }}>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '8px' }}>
                <strong>☀️ Sumartímabil (Júní–Ágúst): 91% nákvæmni</strong><br/>
                Nákvæmnin er stöðug og mikil í 3 mánuði samfellt! Fáar lægðir og engin óvissa um snjó eða frost.
              </div>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '8px' }}>
                <strong>🌪️ Lægðasyrpur (Haust & Vetur): Dýfur í 2–3 daga</strong><br/>
                Lægðalestir koma í skörpum gusum þar sem nákvæmni fellur tímabundið niður í 50–65%.
              </div>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '8px' }}>
                <strong>❄️ Stillt vetrarfrost & hæðir: 94–98% nákvæmni</strong><br/>
                Þegar hæð eða jafnt norðanfrost bítur sig fast stendur mikil nákvæmni yfir í 5–12 daga samfleytt.
              </div>
            </div>
          </div>

          {/* FULL YEAR MATRIX (52 WEEKS x 7 DAYS) */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.85rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>
                  🗓️ Dagatalshitakort: Allt árið (365 dagar bornir saman)
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  52 vikur frá nóvember 2025 til nóvember 2026. Hver reitur er einn dagur. Smelltu á reit til að sjá skýringu dagsins:
                </p>
              </div>

              {/* Legend */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.75rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <span style={{ width: '10px', height: '10px', background: '#10b981', borderRadius: '2px' }}></span> ≥90% (Frábært)
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <span style={{ width: '10px', height: '10px', background: '#38bdf8', borderRadius: '2px' }}></span> 80–89%
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <span style={{ width: '10px', height: '10px', background: '#f59e0b', borderRadius: '2px' }}></span> 65–79%
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <span style={{ width: '10px', height: '10px', background: '#f43f5e', borderRadius: '2px' }}></span> &lt;65% (Klikkaði)
                </span>
              </div>
            </div>

            {/* The 52-week grid */}
            {renderYearMatrix()}

            {/* Selected day preview */}
            {selectedHistoryDay && (
              <div style={{ marginTop: '1rem', background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '10px', padding: '0.85rem 1.15rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                    <span className="badge badge-blue">
                      {selectedHistoryDay.dayOfWeek}, {selectedHistoryDay.dateStr}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Veðurgerð: <strong>{selectedHistoryDay.regime}</strong>
                    </span>
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 600 }}>
                    {selectedHistoryDay.why}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
                    Mældur hiti: {selectedHistoryDay.actualTemp > 0 ? `+${selectedHistoryDay.actualTemp}` : selectedHistoryDay.actualTemp}°C • Mældur vindur: {selectedHistoryDay.actualWind} m/s
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>
                    Nákvæmni spár
                  </div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 900, color: getScoreColor(selectedHistoryDay.accuracy), fontFamily: 'var(--font-mono)', lineHeight: 1 }}>
                    {selectedHistoryDay.accuracy}%
                  </div>
                </div>
              </div>
            )}

            {/* Continuous 365-day trend line with 14-day rolling average */}
            <div style={{ marginTop: '1.5rem' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem' }}>
                📈 Nákvæmnisferill yfir allt árið (365 dagar með 14-daga hlaupandi meðaltali):
              </div>
              {renderYearTrendChart()}
            </div>
          </div>

          {/* 12 MONTHS SUMMARY BREAKDOWN */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>
                📊 Árstíðir og Mánuðir: Hvaða mánuðir eru erfiðastir fyrir spálíkön?
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Samanburður á meðalnákvæmni og fjölda stormadaga milli allra 12 mánaða ársins:
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.75rem' }}>
              {monthlyStats.map((m: any) => {
                const scoreColor = getScoreColor(m.avgAccuracy);
                const isSelected = selectedMonthFilter === m.monthNum;

                return (
                  <div 
                    key={m.monthNum}
                    onClick={() => setSelectedMonthFilter(selectedMonthFilter === m.monthNum ? 0 : m.monthNum)}
                    className="lead-col-card"
                    style={{ 
                      padding: '0.85rem',
                      background: isSelected ? 'rgba(56, 189, 248, 0.2)' : 'var(--bg-surface-elevated)',
                      borderTop: `3px solid ${scoreColor}`,
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase' }}>
                        {m.season}
                      </span>
                      <span style={{ fontSize: '1.1rem', fontWeight: 900, color: scoreColor, fontFamily: 'var(--font-mono)' }}>
                        {m.avgAccuracy}%
                      </span>
                    </div>

                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff' }}>
                      {m.monthName}
                    </div>

                    <div style={{ fontSize: '0.72rem', color: m.stormDays > 2 ? 'var(--accent-rose)' : 'var(--text-muted)', marginTop: '0.3rem' }}>
                      {m.stormDays === 0 ? 'Enginn stormadagur ✓' : `${m.stormDays} stormadagar ⚠️`}
                    </div>
                  </div>
                );
              })}
            </div>

            {selectedMonthFilter !== 0 && (
              <div style={{ marginTop: '0.75rem', textAlign: 'right' }}>
                <button onClick={() => setSelectedMonthFilter(0)} className="tab-pill" style={{ fontSize: '0.75rem' }}>
                  Hreinsa síu (Sýna allt árið)
                </button>
              </div>
            )}
          </div>

          {/* 5 WEATHER REGIMES BREAKDOWN */}
          {patternsAnalysis && (
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff' }}>
                  🔍 Greining: Hvenær klikkar veðurspáin og hvenær er hún rétt?
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Veðurspár á Íslandi haga sér gjörólíkt eftir því hvers konar veðurkerfi ræður ríkjum:
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                {patternsAnalysis.regimes.map((reg: any) => (
                  <div 
                    key={reg.name}
                    className="lead-col-card"
                    style={{ 
                      borderTop: `4px solid ${reg.color}`,
                      background: 'var(--bg-surface-elevated)'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                        <span style={{ fontSize: '1.2rem' }}>{reg.icon}</span>
                        <span className="badge" style={{ background: `${reg.color}22`, color: reg.color, border: `1px solid ${reg.color}44`, fontSize: '0.82rem' }}>
                          {reg.avgAccuracy}% Nákvæmni
                        </span>
                      </div>

                      <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff', marginBottom: '0.2rem' }}>
                        {reg.name}
                      </h4>

                      <div style={{ fontSize: '0.72rem', fontWeight: 800, color: reg.color, textTransform: 'uppercase', marginBottom: '0.65rem' }}>
                        {reg.verdict}
                      </div>

                      <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                        {reg.description}
                      </p>
                    </div>

                    <div style={{ marginTop: '0.85rem' }}>
                      <div className="accuracy-bar-track">
                        <div className="accuracy-bar-fill" style={{ width: `${reg.avgAccuracy}%`, backgroundColor: reg.color }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW: SANNPRÓFUN DAGSINS (D-5 TIL D-0) */}
      {/* ========================================================================= */}
      {viewMode === 'verification' && currentDay && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'minmax(330px, 1fr) 2fr', 
            gap: '1.25rem',
            alignItems: 'stretch'
          }}>
            
            {/* REALITY CARD */}
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

            {/* RIGHT: ERROR BREAKDOWN */}
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Sjónræn skekkjurýni:
                  </span>
                  <button className="tab-pill active" style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}>
                    <Flame size={12} color="#f43f5e" />
                    <span>Hvað klikkar mest? (Hiti vs. Vindur)</span>
                  </button>
                </div>

                <div>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>
                      📊 Línurit: Hvað er að klikka í spánum eftir fyrirvara?
                    </h3>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Samanburður á <strong>hitaskekkju (🔴 °C)</strong> og <strong>vindskekkju (🟣 m/s)</strong> frá D-5 niður í D-0:
                    </p>
                  </div>
                  {renderCulpritsChart()}
                </div>
              </div>

              <div style={{ marginTop: '0.85rem', background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.2)', padding: '0.75rem 1rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <TrendingUp size={20} color="var(--accent-blue)" style={{ flexShrink: 0 }} />
                <div style={{ fontSize: '0.8rem', color: 'var(--text-main)' }}>
                  <strong>Helsta niðurstaða skekkjurýninnar:</strong> Á löngum fyrirvara (D-5 og D-4) er það <strong>hitastigið og lægðarbrautin</strong> sem klikkar mest (oft 4–5°C villa). Vindhraði og hviður ná hins vegar meiri stöðugleika fyrr.
                </div>
              </div>
            </div>

          </div>

          {/* LOWER SECTION: 6-COLUMN WIDESCREEN BOARD */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff' }}>
                  Þróun spárinnar eftir fyrirvara (D-5 til D-0 hlið við hlið)
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Hver fyrirvari sýnir nákvæmlega hvað klikkaði:
                </p>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>
                6 dálkar yfir allan skjáinn
              </span>
            </div>

            <div className="lead-grid-6">
              {currentDay.leadTimes.map((lt: any) => {
                const gradeClass = getGradeClass(lt.score);
                const scoreColor = getScoreColor(lt.score);
                const badgeClass = getBadgeClass(lt.score);

                const tempDiff = Math.round((lt.temp - currentDay.actual.avgTemp) * 10) / 10;
                const windDiff = Math.round((lt.wind - currentDay.actual.avgWind) * 10) / 10;

                return (
                  <div key={lt.leadDays} className={`lead-col-card ${gradeClass}`}>
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

                      <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.55rem 0.65rem', borderRadius: '8px', borderLeft: `3px solid ${scoreColor}`, marginBottom: '0.65rem' }}>
                        <div style={{ fontSize: '0.68rem', color: scoreColor, fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.15rem' }}>
                          ⚠️ Sökudólgur: {lt.culprit}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#fff', lineHeight: 1.35 }}>
                          {lt.culpritDesc}
                        </div>
                      </div>
                    </div>

                    <div>
                      <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.65rem', borderRadius: '8px', fontSize: '0.75rem', marginBottom: '0.6rem' }}>
                        <div style={{ marginBottom: '0.4rem', paddingBottom: '0.4rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                          <span style={{ color: 'var(--text-dim)', fontSize: '0.68rem', display: 'block' }}>Hvað var spáð?</span>
                          <span style={{ fontWeight: 800, color: 'var(--accent-blue)', fontSize: '0.88rem', fontFamily: 'var(--font-mono)' }}>
                            {lt.temp > 0 ? `+${lt.temp}` : lt.temp}°C • {lt.wind} m/s
                          </span>
                        </div>

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

                      <div>
                        <div className="accuracy-bar-track">
                          <div className="accuracy-bar-fill" style={{ width: `${lt.score}%`, backgroundColor: scoreColor }} />
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

      {/* ========================================================================= */}
      {/* VIEW: OUTLOOK */}
      {/* ========================================================================= */}
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
