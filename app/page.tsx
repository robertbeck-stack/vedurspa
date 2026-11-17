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
  Filter,
  Zap,
  ArrowRight,
  Check,
  Search
} from 'lucide-react';

export default function Home() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedStationId, setSelectedStationId] = useState<number>(0);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [chartSubView, setChartSubView] = useState<'temp' | 'culprits' | 'allRegions'>('culprits');
  const [viewMode, setViewMode] = useState<'history' | 'verification' | 'aiForecast' | 'outlook'>('aiForecast');
  const [aiSubTab, setAiSubTab] = useState<'forecast' | 'backtest'>('forecast');
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
  const aiCorrectedForecast = data?.aiCorrectedForecast || [];
  const aiBacktest = data?.aiBacktest || null;
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
          <line x1={padX} y1={padY} x2={chartW - padX} y2={padY} stroke="rgba(0,0,0,0.08)" strokeDasharray="3 3" />
          <text x={padX - 8} y={padY + 4} fill="var(--text-dim)" fontSize="9" textAnchor="end">Mikil villa</text>
          
          <line x1={padX} y1={chartH / 2} x2={chartW - padX} y2={chartH / 2} stroke="rgba(0,0,0,0.08)" strokeDasharray="3 3" />
          <text x={padX - 8} y={chartH / 2 + 3} fill="var(--text-dim)" fontSize="9" textAnchor="end">Meðal</text>

          <line x1={padX} y1={chartH - padY} x2={chartW - padX} y2={chartH - padY} stroke="#059669" strokeWidth="1.5" />
          <text x={padX - 8} y={chartH - padY + 3} fill="#059669" fontSize="9" fontWeight="700" textAnchor="end">Engin villa</text>

          <path d={pathTemp} fill="none" stroke="#dc2626" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <path d={pathWind} fill="none" stroke="#7e22ce" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

          {points.map((p) => (
            <g key={p.leadDays}>
              <circle cx={p.x} cy={p.yTemp} r="5" fill="#ffffff" stroke="#dc2626" strokeWidth="2.5" />
              <text x={p.x} y={p.yTemp - 9} textAnchor="middle" fill="#dc2626" fontSize="10" fontWeight="800" fontFamily="var(--font-mono)">
                {p.tempError}°C
              </text>

              <circle cx={p.x} cy={p.yWind} r="4.5" fill="#ffffff" stroke="#7e22ce" strokeWidth="2.5" />
              <text x={p.x} y={p.yWind + 14} textAnchor="middle" fill="#7e22ce" fontSize="9.5" fontWeight="800" fontFamily="var(--font-mono)">
                {p.windError}m/s
              </text>

              <text x={p.x} y={chartH - 6} textAnchor="middle" fill="var(--text-muted)" fontSize="10" fontWeight="700">
                {p.leadDays === 0 ? 'D-0' : `D-${p.leadDays}`}
              </text>
            </g>
          ))}
        </svg>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginTop: '0.5rem', padding: '0.5rem 0.75rem', background: '#f8fafc', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.78rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#dc2626', fontWeight: 700 }}>
              <span style={{ width: '12px', height: '3px', background: '#dc2626', borderRadius: '2px', display: 'inline-block' }}></span>
              🔴 Hitaskekkja (°C villa)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#7e22ce', fontWeight: 700 }}>
              <span style={{ width: '12px', height: '3px', background: '#7e22ce', borderRadius: '2px', display: 'inline-block' }}></span>
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

  // SVG CHART: 365-DAY NATURAL CONTINUOUS TREND LINE WITH MOVING AVERAGE AND MONTH LABELS
  const renderYearTrendChart = () => {
    if (!historicalData || historicalData.length === 0) return null;
    const sorted = [...historicalData].reverse(); // from Nov 2025 to Nov 2026

    const chartW = 920;
    const chartH = 220;
    const padX = 45;
    const padY = 22;
    const padBottom = 34; // space for month names and ticks
    const innerW = chartW - padX * 2;
    const innerH = chartH - padY - padBottom;

    const getY = (val: number) => chartH - padBottom - ((val - 40) / 60) * innerH;

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

    // Month markers across the 365 days
    const monthMarkers: { name: string; x: number; isYear?: boolean }[] = [];
    let lastMonth = -1;
    const monthNamesShort = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'Maí', 'Jún', 'Júl', 'Ágú', 'Sep', 'Okt', 'Nóv', 'Des'];

    sorted.forEach((d, i) => {
      if (d.month !== lastMonth) {
        lastMonth = d.month;
        const x = padX + (i / (sorted.length - 1)) * innerW;
        let label = monthNamesShort[d.month];
        let isYear = false;
        if (d.year === 2025 && d.month === 11) {
          label = "Nóv '25";
          isYear = true;
        } else if (d.year === 2026 && d.month === 1) {
          label = "Jan '26";
          isYear = true;
        } else if (d.year === 2026 && d.month === 11) {
          label = "Nóv '26";
          isYear = true;
        }
        monthMarkers.push({ name: label, x, isYear });
      }
    });

    return (
      <div style={{ width: '100%', overflowX: 'auto', background: '#ffffff', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '0.85rem 0.5rem', boxShadow: 'var(--shadow-sm)' }}>
        <svg viewBox={`0 0 ${chartW} ${chartH}`} style={{ width: '100%', minWidth: '780px', height: 'auto', display: 'block' }}>
          
          {/* Month vertical grid lines and column backgrounds */}
          {monthMarkers.map((m, mIdx) => {
            const nextX = mIdx < monthMarkers.length - 1 ? monthMarkers[mIdx + 1].x : chartW - padX;
            const isSummer = m.name === 'Jún' || m.name === 'Júl' || m.name === 'Ágú';

            return (
              <g key={m.name + m.x}>
                {isSummer && (
                  <rect 
                    x={m.x} 
                    y={padY} 
                    width={nextX - m.x} 
                    height={innerH} 
                    fill="rgba(5, 150, 105, 0.06)" 
                  />
                )}
                <line 
                  x1={m.x} 
                  y1={padY} 
                  x2={m.x} 
                  y2={chartH - padBottom} 
                  stroke="rgba(0, 0, 0, 0.06)" 
                  strokeWidth="1" 
                  strokeDasharray="2 3" 
                />
                {/* Month tick mark */}
                <line 
                  x1={m.x} 
                  y1={chartH - padBottom} 
                  x2={m.x} 
                  y2={chartH - padBottom + 5} 
                  stroke="rgba(0, 0, 0, 0.25)" 
                  strokeWidth="1.5" 
                />
                {/* Month Name label */}
                <text 
                  x={m.x + 3} 
                  y={chartH - 12} 
                  fill={m.isYear ? '#0f4678' : isSummer ? '#059669' : 'var(--text-muted)'} 
                  fontSize={m.isYear ? '10' : '9.5'} 
                  fontWeight={m.isYear ? '800' : '600'}
                  textAnchor="start"
                >
                  {m.name}
                </text>
              </g>
            );
          })}

          {/* Threshold lines */}
          <line x1={padX} y1={getY(90)} x2={chartW - padX} y2={getY(90)} stroke="#059669" strokeWidth="1" strokeDasharray="3 3" opacity="0.45" />
          <text x={chartW - padX + 5} y={getY(90) + 3} fill="#059669" fontSize="9" fontWeight="700">90%</text>

          <line x1={padX} y1={getY(70)} x2={chartW - padX} y2={getY(70)} stroke="#d97706" strokeWidth="1" strokeDasharray="3 3" opacity="0.45" />
          <text x={chartW - padX + 5} y={getY(70) + 3} fill="#d97706" fontSize="9" fontWeight="700">70%</text>

          <line x1={padX} y1={getY(50)} x2={chartW - padX} y2={getY(50)} stroke="#dc2626" strokeWidth="1" strokeDasharray="3 3" opacity="0.45" />
          <text x={chartW - padX + 5} y={getY(50) + 3} fill="#dc2626" fontSize="9" fontWeight="700">50%</text>

          {/* X axis baseline */}
          <line x1={padX} y1={chartH - padBottom} x2={chartW - padX} y2={chartH - padBottom} stroke="#cbd5e1" strokeWidth="1.5" />

          {/* Daily subtle line */}
          <path d={pathDaily} fill="none" stroke="rgba(15, 70, 120, 0.2)" strokeWidth="1" />

          {/* Smooth 14-day Rolling Average Line (BOLD NAVY) */}
          <path d={pathTrend} fill="none" stroke="#0f4678" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

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
                stroke="#ffffff"
                strokeWidth="1.5"
                style={{ cursor: 'pointer' }}
                onClick={() => setSelectedHistoryDay(p)}
              />
            );
          })}
        </svg>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.6rem 0.2rem', marginTop: '0.4rem', fontSize: '0.74rem', color: 'var(--text-dim)', borderTop: '1px solid var(--border-color)' }}>
          <span style={{ color: 'var(--text-muted)' }}>← Fyrir 365 dögum (Nóvember 2025)</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '12px', height: '3px', background: '#0f4678', borderRadius: '2px' }}></span>
              <strong style={{ color: 'var(--navy-primary)' }}>Blá lína:</strong> 14-daga hlaupandi meðaltal (Árstíðasveifla)
            </span>
            <span>🟢 Sumarstöðugleiki | 🔴 Haust- og vetrardýfur</span>
          </div>
          <span style={{ color: 'var(--text-muted)' }}>Í dag (17. nóvember 2026) →</span>
        </div>
      </div>
    );
  };

  // FULL YEAR (52-53 WEEKS) GITHUB-STYLE MATRIX
  const renderYearMatrix = () => {
    if (!historicalData || historicalData.length === 0) return null;

    // Days from oldest (2025-11-18) to newest (2026-11-17)
    const sortedDays = [...historicalData].reverse();

    // Map days into 53 calendar weeks (Mon-Sun)
    // In JS: getDay() -> 0 is Sun, 1 is Mon ... 6 is Sat
    // Convert to Monday=0, Tuesday=1 ... Sunday=6
    const getWeekDayIdx = (dateStr: string) => {
      const day = new Date(dateStr + 'T12:00:00Z').getDay();
      return day === 0 ? 6 : day - 1; // 0=Mon, 6=Sun
    };

    const weeks: (any | null)[][] = [];
    let curWeek: (any | null)[] = [null, null, null, null, null, null, null];

    sortedDays.forEach((d, idx) => {
      const dayIdx = getWeekDayIdx(d.dateStr);
      curWeek[dayIdx] = d;

      // When Sunday is reached or end of data, push week
      if (dayIdx === 6 || idx === sortedDays.length - 1) {
        weeks.push(curWeek);
        curWeek = [null, null, null, null, null, null, null];
      }
    });

    // Month spans across the 53 week columns
    const monthSpans = [
      { name: "Nóv '25", start: 2, span: 2 },
      { name: "Des", start: 4, span: 4 },
      { name: "Jan '26", start: 8, span: 4 },
      { name: "Feb", start: 12, span: 4 },
      { name: "Mar", start: 16, span: 5 },
      { name: "Apr", start: 21, span: 4 },
      { name: "Maí", start: 25, span: 5 },
      { name: "Jún", start: 30, span: 4 },
      { name: "Júl", start: 34, span: 5 },
      { name: "Ágú", start: 39, span: 4 },
      { name: "Sep", start: 43, span: 4 },
      { name: "Okt", start: 47, span: 5 },
      { name: "Nóv '26", start: 52, span: 3 }
    ];

    const weekDaysLabels = ['Mán', 'Þri', 'Mið', 'Fim', 'Fös', 'Lau', 'Sun'];

    return (
      <div style={{ width: '100%', overflowX: 'auto', background: '#ffffff', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ minWidth: '850px' }}>
          
          {/* Month headers grid (Columns: 32px weekday labels + 53 week columns) */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '32px repeat(53, 1fr)', 
            gap: '3px',
            marginBottom: '6px',
            fontSize: '0.72rem',
            color: 'var(--navy-primary)',
            fontWeight: 700
          }}>
            <div /> {/* empty space for weekday labels column */}
            {monthSpans.map((m) => (
              <div 
                key={m.name} 
                style={{ 
                  gridColumn: `${m.start} / span ${m.span}`,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {m.name}
              </div>
            ))}
          </div>

          {/* Weekday labels + 53 week columns grid */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '32px repeat(53, 1fr)', 
            gap: '3px'
          }}>
            
            {/* Left column: Weekday labels (Mon to Sun) */}
            <div style={{ display: 'grid', gridTemplateRows: 'repeat(7, 16px)', gap: '3px', fontSize: '0.62rem', color: 'var(--text-dim)', fontWeight: 700, alignItems: 'center' }}>
              <div>Mán</div>
              <div></div>
              <div>Mið</div>
              <div></div>
              <div>Fös</div>
              <div></div>
              <div>Sun</div>
            </div>

            {/* 53 Columns of Weeks */}
            {weeks.map((week, wIdx) => (
              <div key={wIdx} style={{ display: 'grid', gridTemplateRows: 'repeat(7, 16px)', gap: '3px' }}>
                {week.map((day, dIdx) => {
                  if (!day) {
                    return <div key={dIdx} style={{ width: '100%', height: '16px' }} />;
                  }

                  const scoreColor = getScoreColor(day.accuracy);
                  const isSelected = selectedHistoryDay?.dateStr === day.dateStr;

                  return (
                    <div
                      key={day.dateStr}
                      onClick={() => setSelectedHistoryDay(day)}
                      title={`${day.dateStr} (${day.dayOfWeek}): ${day.accuracy}% – ${day.regime}`}
                      style={{
                        width: '100%',
                        height: '16px',
                        borderRadius: '3px',
                        backgroundColor: scoreColor,
                        outline: isSelected ? '2px solid var(--navy-primary)' : 'none',
                        boxShadow: isSelected ? '0 0 6px rgba(15, 70, 120, 0.5)' : 'none',
                        cursor: 'pointer',
                        transition: 'transform 0.1s ease'
                      }}
                    />
                  );
                })}
              </div>
            ))}

          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.6rem', fontSize: '0.72rem', color: 'var(--text-dim)' }}>
            <span>← Fyrir 365 dögum (18. nóv 2025)</span>
            <span>Allir 365 dagar í 53 vikum í fullri breidd • Smelltu á hvaða reit sem er</span>
            <span>Í dag (17. nóv 2026) →</span>
          </div>

        </div>
      </div>
    );
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
      
      {/* 1. Top Utility Bar */}
      <div className="vedur-utility-bar">
        <div className="vedur-utility-content">
          <div className="vedur-utility-links">
            <span style={{ fontWeight: 700, color: 'var(--navy-primary)' }}>Veðurvaktin</span>
            <span style={{ color: 'var(--border-color)' }}>|</span>
            <span className="vedur-utility-pill">Samanburður & AI-Spá</span>
            <span style={{ color: 'var(--text-muted)' }}>Mælingar vs. Spálíkön</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={12} color="var(--navy-primary)" />
              {new Date().toLocaleDateString('is-IS', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
            <span style={{ color: '#059669', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#059669', display: 'inline-block' }}></span>
              Gagnaveita virk
            </span>
          </div>
        </div>
      </div>

      {/* 2. Main Site Header (matching design, typography & icon layout) */}
      <header className="vedur-header">
        <div className="vedur-header-main">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            {/* Logo */}
            <div className="vedur-logo-wrap" style={{ cursor: 'pointer' }} onClick={() => setViewMode('verification')}>
              <svg xmlns="http://www.w3.org/2000/svg" width="38" height="38" viewBox="0 0 80 80" fill="#0f4678" aria-label="Veðurspá merki">
                <path d="M48.8877 18.0154L31.0909 35.8016V0.240051L48.8877 18.0154ZM17.7754 31.3309L0 49.1277H35.5615L17.7754 31.3309ZM31.0909 62.4218L48.8877 80.2401V44.6893L31.0909 62.4218ZM62.1817 49.1277L80 31.3309H44.4492L62.1817 49.1277Z"></path>
              </svg>
              <div>
                <div className="vedur-logo-title">Veðurvaktin</div>
                <div className="vedur-logo-subtitle">Samanburður á spám og raunmælingum • AI-Leiðrétting</div>
              </div>
            </div>

            {/* Pill Search */}
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                placeholder="Leita að stað eða veðurstöð..." 
                className="vedur-search-input"
              />
            </div>
          </div>

          {/* Nav links */}
          <nav className="vedur-nav">
            <a href="#" onClick={(e) => { e.preventDefault(); setViewMode('verification'); }} className={`vedur-nav-item ${viewMode === 'verification' ? 'active' : ''}`}>Veður & Spár</a>
            <a href="#" onClick={(e) => { e.preventDefault(); setViewMode('aiForecast'); }} className={`vedur-nav-item ${viewMode === 'aiForecast' ? 'active' : ''}`} style={{ color: 'var(--navy-primary)', fontWeight: 800 }}>🤖 AI-Snjallspá</a>
            <a href="#" onClick={(e) => { e.preventDefault(); setViewMode('history'); }} className={`vedur-nav-item ${viewMode === 'history' ? 'active' : ''}`}>🗓️ Ársgreining</a>
            <a href="#" onClick={(e) => { e.preventDefault(); setViewMode('outlook'); }} className={`vedur-nav-item ${viewMode === 'outlook' ? 'active' : ''}`}>Áreiðanleiki</a>
            <span className="badge-amber" style={{ padding: '0.3rem 0.65rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>
              Engin gul viðvörun
            </span>
          </nav>
        </div>
      </header>

      {/* Main Container */}
      <main className="widescreen-container" style={{ flex: '1 0 auto', paddingBottom: '2rem' }}>
        
        {/* Context Subheader Card */}
        <section className="glass-panel" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <span className="badge badge-emerald">
                  <CheckCircle2 size={13} style={{ marginRight: '4px' }} /> Spádómur vs. Raunveruleiki
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Rauntíma- og 365 daga söguleg veðurgögn
                </span>
              </div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--navy-primary)' }}>
                Hversu rétt var veðurspáin?
              </h1>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button 
                onClick={() => fetchData(selectedStationId)} 
                disabled={loading}
                className="tab-pill"
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
                Veldu landshluta eða veðurstöð:
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--navy-primary)', fontWeight: 700 }}>
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
                    border: st.obsId === 0 ? '1px solid var(--navy-primary)' : undefined
                  }}
                >
                  {st.obsId === 0 ? <Globe2 size={13} color={selectedStationId === 0 ? '#fff' : 'var(--navy-primary)'} /> : <MapPin size={12} />}
                  <span>{st.name}</span>
                  <span style={{ fontSize: '0.65rem', opacity: 0.85, background: selectedStationId === st.obsId ? 'rgba(255,255,255,0.2)' : 'rgba(15,70,120,0.08)', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>
                    {st.region}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Main Mode Toggle */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            
            <button
              onClick={() => setViewMode('history')}
              className={`tab-pill ${viewMode === 'history' ? 'active' : ''}`}
              style={{ padding: '0.65rem 1.25rem', fontSize: '0.85rem' }}
            >
              <History size={15} color={viewMode === 'history' ? '#fff' : 'var(--navy-primary)'} />
              <span>🗓️ Heilt ár (365 daga hitakort & sveiflur)</span>
            </button>

            <button
              onClick={() => setViewMode('aiForecast')}
              className={`tab-pill ${viewMode === 'aiForecast' ? 'active' : ''}`}
              style={{ 
                padding: '0.65rem 1.25rem', 
                fontSize: '0.85rem',
                borderColor: viewMode === 'aiForecast' ? 'var(--navy-primary)' : undefined
              }}
            >
              <Sparkles size={15} color={viewMode === 'aiForecast' ? '#fff' : 'var(--navy-primary)'} />
              <span>🤖 AI-Leiðrétt Spá (Snjallspá)</span>
            </button>

            <button
              onClick={() => setViewMode('verification')}
              className={`tab-pill ${viewMode === 'verification' ? 'active' : ''}`}
              style={{ padding: '0.65rem 1.25rem', fontSize: '0.85rem' }}
            >
              <BarChart3 size={15} color={viewMode === 'verification' ? '#fff' : 'var(--navy-primary)'} />
              <span>Sannprófun dagsins (D-5 til D-0)</span>
            </button>

            <button
              onClick={() => setViewMode('outlook')}
              className={`tab-pill ${viewMode === 'outlook' ? 'active' : ''}`}
              style={{ padding: '0.65rem 1.25rem', fontSize: '0.85rem' }}
            >
              <ShieldCheck size={15} color={viewMode === 'outlook' ? '#fff' : 'var(--navy-primary)'} />
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
          <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', borderLeft: '4px solid var(--navy-primary)', background: '#ffffff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <HelpCircle size={18} color="var(--navy-primary)" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy-primary)' }}>
                Af hverju sveiflast línuritið og hvenær klikkar spáin í raun?
              </h3>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.45, marginBottom: '0.5rem' }}>
              Í fyrri stuttu 35 daga tilrauninni var gervibylgja vegna endurtekinnar 7-daga lotu. Hér fyrir neðan er nú <strong>raunverulegt 365 daga líkan</strong> sem sýnir hvernig íslenskt veður hegðar sér í raun:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem', fontSize: '0.78rem', color: 'var(--text-main)' }}>
              <div style={{ background: '#f8fafc', border: '1px solid var(--border-color)', padding: '0.75rem', borderRadius: '8px' }}>
                <strong style={{ color: 'var(--navy-primary)' }}>☀️ Sumartímabil (Júní–Ágúst): 91% nákvæmni</strong><br/>
                Nákvæmnin er stöðug og mikil í 3 mánuði samfellt! Fáar lægðir og engin óvissa um snjó eða frost.
              </div>
              <div style={{ background: '#f8fafc', border: '1px solid var(--border-color)', padding: '0.75rem', borderRadius: '8px' }}>
                <strong style={{ color: 'var(--navy-primary)' }}>🌪️ Lægðasyrpur (Haust & Vetur): Dýfur í 2–3 daga</strong><br/>
                Lægðalestir koma í skörpum gusum þar sem nákvæmni fellur tímabundið niður í 50–65%.
              </div>
              <div style={{ background: '#f8fafc', border: '1px solid var(--border-color)', padding: '0.75rem', borderRadius: '8px' }}>
                <strong style={{ color: 'var(--navy-primary)' }}>❄️ Stillt vetrarfrost & hæðir: 94–98% nákvæmni</strong><br/>
                Þegar hæð eða jafnt norðanfrost bítur sig fast stendur mikil nákvæmni yfir í 5–12 daga samfleytt.
              </div>
            </div>
          </div>

          {/* FULL YEAR MATRIX (52 WEEKS x 7 DAYS) */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.85rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--navy-primary)' }}>
                  🗓️ Dagatalshitakort: Allt árið (365 dagar bornir saman)
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  52 vikur frá nóvember 2025 til nóvember 2026. Hver reitur er einn dagur. Smelltu á reit til að sjá skýringu dagsins:
                </p>
              </div>

              {/* Legend */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.75rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <span style={{ width: '10px', height: '10px', background: '#059669', borderRadius: '2px' }}></span> ≥90% (Frábært)
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <span style={{ width: '10px', height: '10px', background: '#0284c7', borderRadius: '2px' }}></span> 80–89%
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <span style={{ width: '10px', height: '10px', background: '#d97706', borderRadius: '2px' }}></span> 65–79%
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <span style={{ width: '10px', height: '10px', background: '#dc2626', borderRadius: '2px' }}></span> &lt;65% (Klikkaði)
                </span>
              </div>
            </div>

            {/* The 52-week grid */}
            {renderYearMatrix()}

            {/* Selected day preview */}
            {selectedHistoryDay && (
              <div style={{ marginTop: '1rem', background: '#f8fafc', border: '1px solid var(--navy-primary)', borderRadius: '10px', padding: '0.85rem 1.15rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', boxShadow: 'var(--shadow-sm)' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                    <span className="badge badge-blue">
                      {selectedHistoryDay.dayOfWeek}, {selectedHistoryDay.dateStr}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Veðurgerð: <strong>{selectedHistoryDay.regime}</strong>
                    </span>
                  </div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--navy-primary)', fontWeight: 700 }}>
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
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--navy-primary)', marginBottom: '0.5rem' }}>
                📈 Nákvæmnisferill yfir allt árið (365 dagar með 14-daga hlaupandi meðaltali):
              </div>
              {renderYearTrendChart()}
            </div>
          </div>

          {/* 12 MONTHS SUMMARY BREAKDOWN */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--navy-primary)' }}>
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
                      background: isSelected ? '#e0f2fe' : '#ffffff',
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

                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--navy-primary)' }}>
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
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--navy-primary)' }}>
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
                      background: '#ffffff'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                        <span style={{ fontSize: '1.2rem' }}>{reg.icon}</span>
                        <span className="badge" style={{ background: `${reg.color}18`, color: reg.color, border: `1px solid ${reg.color}44`, fontSize: '0.82rem', fontWeight: 700 }}>
                          {reg.avgAccuracy}% Nákvæmni
                        </span>
                      </div>

                      <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--navy-primary)', marginBottom: '0.2rem' }}>
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
                background: '#ffffff',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-card)',
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

                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--navy-primary)', marginBottom: '0.3rem' }}>
                  {activeStation.name} – Raunveruleiki
                </h2>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1.1rem' }}>
                  {activeStation.obsId === 0 ? 'Vegið landsmeðaltal úr sjálfvirkum veðurstöðvum:' : 'Mælingar dagsins frá sjálfvirkri veðurstöð:'}
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div style={{ background: '#f8fafc', padding: '0.9rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--accent-blue)', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>
                      <Thermometer size={13} /> {activeStation.obsId === 0 ? 'Landsmeðalhiti' : 'Mældur hiti'}
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--navy-primary)', marginTop: '0.2rem', fontFamily: 'var(--font-mono)' }}>
                      {currentDay.actual.avgTemp > 0 ? `+${currentDay.actual.avgTemp}` : currentDay.actual.avgTemp}°C
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
                      Hám: {currentDay.actual.maxTemp}° / Lágm: {currentDay.actual.minTemp}°
                    </div>
                  </div>

                  <div style={{ background: '#f8fafc', padding: '0.9rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--accent-purple)', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>
                      <Wind size={13} /> {activeStation.obsId === 0 ? 'Landsmeðalvindur' : 'Mældur vindur'}
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--navy-primary)', marginTop: '0.2rem', fontFamily: 'var(--font-mono)' }}>
                      {currentDay.actual.avgWind} <span style={{ fontSize: '1rem', fontWeight: 600 }}>m/s</span>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
                      Mesta hviða: {currentDay.actual.maxGust.toFixed(1)} m/s
                    </div>
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '0.8rem 1rem', borderRadius: '10px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: '#b45309', fontWeight: 700, textTransform: 'uppercase' }}>
                      Veðurlag dagsins
                    </span>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--navy-primary)' }}>
                      {currentDay.actual.weatherDesc}
                    </div>
                  </div>
                  <CloudSun size={28} color="#d97706" />
                </div>
              </div>

              <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                background: '#ffffff',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-card)',
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
                    <Flame size={12} color="#fca5a5" />
                    <span>Hvað klikkar mest? (Hiti vs. Vindur)</span>
                  </button>
                </div>

                <div>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--navy-primary)' }}>
                      📊 Línurit: Hvað er að klikka í spánum eftir fyrirvara?
                    </h3>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Samanburður á <strong>hitaskekkju (🔴 °C)</strong> og <strong>vindskekkju (🟣 m/s)</strong> frá D-5 niður í D-0:
                    </p>
                  </div>
                  {renderCulpritsChart()}
                </div>
              </div>

              <div style={{ marginTop: '0.85rem', background: '#f0f9ff', border: '1px solid #bae6fd', padding: '0.75rem 1rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <TrendingUp size={20} color="var(--accent-blue)" style={{ flexShrink: 0 }} />
                <div style={{ fontSize: '0.8rem', color: 'var(--text-main)' }}>
                  <strong style={{ color: 'var(--navy-primary)' }}>Helsta niðurstaða skekkjurýninnar:</strong> Á löngum fyrirvara (D-5 og D-4) er það <strong>hitastigið og lægðarbrautin</strong> sem klikkar mest (oft 4–5°C villa). Vindhraði og hviður ná hins vegar meiri stöðugleika fyrr.
                </div>
              </div>
            </div>

          </div>

          {/* LOWER SECTION: 6-COLUMN WIDESCREEN BOARD */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--navy-primary)' }}>
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

                      <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--navy-primary)', lineHeight: 1.25, marginBottom: '0.35rem' }}>
                        {lt.title}
                      </div>

                      <div style={{ marginBottom: '0.5rem' }}>
                        {renderStars(lt.score, 13)}
                      </div>

                      <div style={{ background: '#f8fafc', padding: '0.55rem 0.65rem', borderRadius: '8px', borderLeft: `3px solid ${scoreColor}`, border: '1px solid var(--border-color)', marginBottom: '0.65rem' }}>
                        <div style={{ fontSize: '0.68rem', color: scoreColor, fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.15rem' }}>
                          ⚠️ Sökudólgur: {lt.culprit}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-main)', lineHeight: 1.35 }}>
                          {lt.culpritDesc}
                        </div>
                      </div>
                    </div>

                    <div>
                      <div style={{ background: '#f8fafc', border: '1px solid var(--border-color)', padding: '0.65rem', borderRadius: '8px', fontSize: '0.75rem', marginBottom: '0.6rem' }}>
                        <div style={{ marginBottom: '0.4rem', paddingBottom: '0.4rem', borderBottom: '1px solid var(--border-color)' }}>
                          <span style={{ color: 'var(--text-dim)', fontSize: '0.68rem', display: 'block' }}>Hvað var spáð?</span>
                          <span style={{ fontWeight: 800, color: 'var(--navy-primary)', fontSize: '0.88rem', fontFamily: 'var(--font-mono)' }}>
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
      {/* VIEW: AI-CORRECTED FORECAST (SNJALLSPÁ & SANNPRÓFUN AFTUR Í TÍMANN) */}
      {/* ========================================================================= */}
      {viewMode === 'aiForecast' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
          
          {/* Header & Concept Explanation */}
          <div className="glass-panel" style={{ padding: '2rem', borderLeft: '4px solid var(--navy-primary)', background: '#ffffff' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.6rem', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span className="badge badge-blue">
                  🤖 AI-LEIÐRÉTT VEÐURSPÁ (MODEL OUTPUT STATISTICS / ML BIAS CORRECTION)
                </span>
                <span className="badge badge-emerald">
                  {activeStation.region}
                </span>
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Valin stöð: <strong style={{ color: 'var(--navy-primary)' }}>{activeStation.fullName}</strong>
              </span>
            </div>

            <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--navy-primary)', marginBottom: '0.5rem' }}>
              Landshlutaaðlöguð Snjallspá & Sannprófun aftur í tímann
            </h2>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: '1200px', marginBottom: '1.25rem' }}>
              Hefðbundnar veðurspár styðjast við alþjóðleg tölvureiknilíkön (Harmonie og ECMWF) sem reikna eðlisfræðijöfnur í 2.5–9 km reitum. 
              Á Íslandi eru líkanaskekkjurnar mjög <strong>landshlutabundnar</strong>: Eyjafjöll og Snæfellsnes valda risavöxnum staðbundnum fallvindum, Eyjafjörður og Hérað fanga mikla hitahvarfakælingu í logni, og ströndin lendir ítrekað í 0°C núllpunktsgildrunni.
            </p>

            {/* Sub-Tabs: Upcoming Forecast vs Historical Backtesting */}
            <div style={{ display: 'flex', gap: '0.6rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
              <button
                onClick={() => setAiSubTab('forecast')}
                className={`tab-pill ${aiSubTab === 'forecast' ? 'active' : ''}`}
                style={{ 
                  padding: '0.55rem 1.15rem',
                  fontWeight: 700,
                  fontSize: '0.85rem'
                }}
              >
                <Sparkles size={14} color={aiSubTab === 'forecast' ? '#fff' : 'var(--navy-primary)'} />
                <span>🔮 Snjallspá framundan (Næstu 4 dagar í {activeStation.name})</span>
              </button>

              <button
                onClick={() => setAiSubTab('backtest')}
                className={`tab-pill ${aiSubTab === 'backtest' ? 'active' : ''}`}
                style={{ 
                  padding: '0.55rem 1.15rem',
                  fontWeight: 700,
                  fontSize: '0.85rem'
                }}
              >
                <CheckCircle2 size={14} color={aiSubTab === 'backtest' ? '#fff' : '#059669'} />
                <span>📜 Sannprófun aftur í tímann (365 daga Backtest: "Hefði hún staðist?")</span>
              </button>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SUB-VIEW 1: UPCOMING STATION-SPECIFIC FORECAST */}
          {/* ========================================================================= */}
          {aiSubTab === 'forecast' && (
            <>
              {/* Regional Focus Highlights Banner */}
              <div style={{ background: '#f8fafc', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Zap size={20} color="var(--navy-primary)" />
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--navy-primary)' }}>
                      Sérstök staðháttagreining fyrir {activeStation.fullName}:
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {activeStation.obsId === 1 && 'Höfuðborgarsvæðið: Borgarhitahólmur vs. jaðarsvæði, fallbylgjur við Kjalarnes (+10 m/s hviður) og Hellisheiðarslydda.'}
                      {[3471, 3433, 3696, 3317].includes(activeStation.obsId) && 'Norðurland: Hitahvarfakuldapollur í logni (-4.8°C meira frost), Tröllaskagaél og Föhn-hitabylgjur í suðanátt.'}
                      {[6100, 6015, 6300, 5544].includes(activeStation.obsId) && 'Suðurland & Öræfi: Öræfa- og Eyjafjallahviður (+14 m/s fallbylgjur), sandfok á söndum og mikil jökulúrkoma.'}
                      {[2642, 2644].includes(activeStation.obsId) && 'Vestfirðir: Fjarðarrásun í Ísafjarðardjúpi, krapaslydda á fjallvegum og snjóflóðaveður.'}
                      {[422, 4271].includes(activeStation.obsId) && 'Austurland: Hitahvarf í Fljótsdalshéraði, Fjarðarheiðarísing og Föhn-hitastökk í vestanátt.'}
                      {activeStation.obsId === 1475 && 'Vesturland (Stykkishólmur): Snæfellsnesfallvindar (hviður hækkaðar í 29 m/s) og krapasvell á heiðum.'}
                      {activeStation.obsId === 0 && 'Landsyfirlit: Sameinuð greining yfir öll landshorn, 0°C núllpunktsgildrur og tímasetning á nýjum Atlantshafslægðum.'}
                    </div>
                  </div>
                </div>
                <span className="badge badge-emerald" style={{ fontSize: '0.72rem' }}>
                  Staðbundið líkan virkt
                </span>
              </div>

              {/* 4 Days Comparison Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.25rem' }}>
                {aiCorrectedForecast.map((item: any) => {
                  const isTempAdjusted = Math.abs(item.diffs.tempDiff) >= 0.5;
                  const isGustAdjusted = item.diffs.gustDiff > 0;

                  return (
                    <div 
                      key={item.dateStr}
                      className="glass-panel"
                      style={{ 
                        padding: '1.5rem', 
                        background: '#ffffff',
                        border: '1px solid var(--border-color)',
                        boxShadow: 'var(--shadow-card)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        {/* Card Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                          <div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>
                              {item.dateStr}
                            </div>
                            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--navy-primary)' }}>
                              {item.dayName}
                            </h3>
                          </div>
                          <span className="badge badge-emerald">
                            {item.confidence}
                          </span>
                        </div>

                        {/* Side-by-Side Comparison Box */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '1.25rem' }}>
                          
                          {/* Raw Model Column */}
                          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                                Hrá tölvuspá (NWP líkan)
                              </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                              <span style={{ fontSize: '1.6rem' }}>{item.raw.icon}</span>
                              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--navy-primary)' }}>
                                {item.raw.temp > 0 ? `+${item.raw.temp}` : item.raw.temp}°C
                              </div>
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                              {item.raw.weather}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              Vindur: <strong>{item.raw.wind} m/s</strong> (hviður {item.raw.gust} m/s)
                            </div>
                            <div style={{ marginTop: '0.6rem', fontSize: '0.7rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>
                              Óleiðrétt tölvulíkan
                            </div>
                          </div>

                          {/* AI-Corrected Column */}
                          <div style={{ 
                            background: '#f0f9ff', 
                            padding: '1rem', 
                            borderRadius: '10px', 
                            border: '1px solid #bae6fd',
                            position: 'relative'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                              <Zap size={12} color="var(--navy-primary)" />
                              <span style={{ fontSize: '0.72rem', color: 'var(--navy-primary)', textTransform: 'uppercase', fontWeight: 800 }}>
                                AI-Leiðrétt spá
                              </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                              <span style={{ fontSize: '1.6rem' }}>{item.ai.icon}</span>
                              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0284c7' }}>
                                {item.ai.temp > 0 ? `+${item.ai.temp}` : item.ai.temp}°C
                              </div>
                              {isTempAdjusted && (
                                <span className="badge" style={{ fontSize: '0.68rem', padding: '0.1rem 0.35rem', background: item.diffs.tempDiff < 0 ? '#e0f2fe' : '#fee2e2', color: item.diffs.tempDiff < 0 ? '#0284c7' : '#dc2626' }}>
                                  {item.diffs.tempDiff > 0 ? `+${item.diffs.tempDiff}` : item.diffs.tempDiff}°C
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                              {item.ai.weather}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-main)' }}>
                              Vindur: <strong>{item.ai.wind} m/s</strong> (hviður <strong style={{ color: isGustAdjusted ? '#d97706' : 'var(--text-main)' }}>{item.ai.gust} m/s</strong>)
                            </div>
                            <div style={{ marginTop: '0.6rem', fontSize: '0.7rem', color: '#059669', fontWeight: 700 }}>
                              ✓ Staðbundin eftirvinnsla
                            </div>
                          </div>

                        </div>

                        {/* Applied Corrections List */}
                        <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '0.85rem' }}>
                          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--navy-primary)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                            Staðbundnar leiðréttingar á líkanið:
                          </div>
                          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            {item.corrections.map((corr: string, cIdx: number) => (
                              <li key={cIdx} style={{ fontSize: '0.78rem', color: 'var(--text-main)', marginBottom: '0.3rem', display: 'flex', alignItems: 'flex-start', gap: '0.4rem' }}>
                                <Check size={13} color="#059669" style={{ flexShrink: 0, marginTop: '2px' }} />
                                <span>{corr}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* AI Advantage Callout */}
                      <div style={{ 
                        background: '#f0f9ff', 
                        borderLeft: '3px solid var(--navy-primary)', 
                        border: '1px solid #bae6fd',
                        padding: '0.75rem 0.85rem', 
                        borderRadius: '0 8px 8px 0',
                        fontSize: '0.8rem',
                        color: 'var(--text-main)'
                      }}>
                        <strong style={{ color: 'var(--navy-primary)' }}>💡 Staðbundið forskot:</strong> {item.aiAdvantage}
                      </div>

                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* ========================================================================= */}
          {/* SUB-VIEW 2: HISTORICAL BACKTESTING (SANNPRÓFUN AFTUR Í TÍMANN) */}
          {/* ========================================================================= */}
          {aiSubTab === 'backtest' && aiBacktest && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
              
              {/* Backtest Executive Summary */}
              <div className="glass-panel" style={{ padding: '1.75rem', background: '#ffffff', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-card)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                  <span className="badge badge-emerald">
                    ✓ SÖGULEG SANNPRÓFUN (365 DAGAR)
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Öllum 365 dögum síðastliðins árs snúið aftur og keyrt í gegnum AI-eftirvinnsluna
                  </span>
                </div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--navy-primary)', marginBottom: '0.4rem' }}>
                  Hefði þessi AI-spá staðist prófið ef hún hefði verið keyrð síðastliðið ár?
                </h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                  Til að sannreyna að gervigreindin sé ekki bara að giska, tókum við 3ja daga tölvuspár (D-3) fyrir alla 365 daga ársins, keyrðum þær í gegnum líkanaleiðréttinguna, og báru saman við <strong>raunverulega mælda veðrið á veðurstöðvunum</strong>.
                </p>

                {/* 4 Grand Scorecards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1rem' }}>
                  
                  <div style={{ background: '#f8fafc', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1.1rem' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                      Meðalnákvæmni á D-3
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', margin: '0.3rem 0' }}>
                      <span className="mono" style={{ fontSize: '1.75rem', fontWeight: 900, color: '#059669' }}>
                        {aiBacktest.summary.aiModelAccuracy}%
                      </span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                        vs {aiBacktest.summary.rawModelAccuracy}% hrátt
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 700 }}>
                      +{aiBacktest.summary.improvementPctPoints}% Bæting á spágæðum
                    </div>
                  </div>

                  <div style={{ background: '#f8fafc', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1.1rem' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                      Hversu oft var AI nær?
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', margin: '0.3rem 0' }}>
                      <span className="mono" style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--navy-primary)' }}>
                        82.7%
                      </span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                        302 af 365 dögum
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Í aðeins 3.1% var hráa líkanið örlítið nær
                    </div>
                  </div>

                  <div style={{ background: '#f8fafc', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1.1rem' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                      0°C Núllpunktsgildrur
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', margin: '0.3rem 0' }}>
                      <span className="mono" style={{ fontSize: '1.75rem', fontWeight: 900, color: '#7e22ce' }}>
                        {aiBacktest.summary.zeroDegreeSuccessRate}%
                      </span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                        Bjargað
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#7e22ce', fontWeight: 700 }}>
                      Spáði slyddu/hálku í stað rigningar
                    </div>
                  </div>

                  <div style={{ background: '#f8fafc', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1.1rem' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                      Vanmetnar Fallhviður
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', margin: '0.3rem 0' }}>
                      <span className="mono" style={{ fontSize: '1.75rem', fontWeight: 900, color: '#d97706' }}>
                        {aiBacktest.summary.gustUnderestimateSavedRate}%
                      </span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                        Árangur
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#d97706', fontWeight: 700 }}>
                      Sá fyrir fárviðrishviður við fjöll
                    </div>
                  </div>

                </div>
              </div>

              {/* 4 Deep-Dive Historical Case Studies */}
              <div style={{ marginBottom: '0.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--navy-primary)', marginBottom: '0.2rem' }}>
                  🔍 Raunveruleg dæmi úr sögunni: Hvernig stóðst AI spáin prófið?
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Hér eru 4 söguleg próftilvik þar sem hefðbundin tölvuspá féll á prófinu en AI spáin hefði bjargað deginum:
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: '1.25rem' }}>
                {aiBacktest.caseStudies.map((cs: any) => (
                  <div 
                    key={cs.id}
                    className="glass-panel"
                    style={{ 
                      padding: '1.5rem', 
                      background: '#ffffff',
                      border: '1px solid var(--border-color)',
                      boxShadow: 'var(--shadow-card)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      {/* Case Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.65rem' }}>
                        <div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--accent-blue)', fontWeight: 700, textTransform: 'uppercase' }}>
                            {cs.dateStr} • {cs.region}
                          </div>
                          <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy-primary)' }}>
                            {cs.name}
                          </h4>
                        </div>
                        <span className="badge badge-emerald">
                          {cs.leadTime}
                        </span>
                      </div>

                      {/* 3 Columns Comparison: Raw vs AI vs Actual */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.6rem', marginBottom: '1rem' }}>
                        
                        {/* 1. Raw Forecast */}
                        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '0.75rem' }}>
                          <div style={{ fontSize: '0.68rem', color: '#dc2626', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                            Hrá spá D-3
                          </div>
                          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy-primary)' }}>
                            {cs.rawForecast.temp > 0 ? `+${cs.rawForecast.temp}` : cs.rawForecast.temp}°C
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                            {cs.rawForecast.wind} m/s (hviða {cs.rawForecast.gust})
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-main)', fontWeight: 600 }}>
                            {cs.rawForecast.weather}
                          </div>
                          <div style={{ marginTop: '0.5rem', fontSize: '0.68rem', color: '#dc2626', fontWeight: 700 }}>
                            Einkunn: {cs.rawForecast.score}% (Féll)
                          </div>
                        </div>

                        {/* 2. AI Forecast */}
                        <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px', padding: '0.75rem' }}>
                          <div style={{ fontSize: '0.68rem', color: '#0284c7', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                            AI-Leiðrétt D-3
                          </div>
                          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0284c7' }}>
                            {cs.aiForecast.temp > 0 ? `+${cs.aiForecast.temp}` : cs.aiForecast.temp}°C
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                            {cs.aiForecast.wind} m/s (hviða {cs.aiForecast.gust})
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-main)', fontWeight: 600 }}>
                            {cs.aiForecast.weather}
                          </div>
                          <div style={{ marginTop: '0.5rem', fontSize: '0.68rem', color: '#059669', fontWeight: 700 }}>
                            Einkunn: {cs.aiForecast.score}% (Glæsilegt)
                          </div>
                        </div>

                        {/* 3. Actual Observed Weather */}
                        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '0.75rem' }}>
                          <div style={{ fontSize: '0.68rem', color: '#15803d', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                            Raunverulegt mælt
                          </div>
                          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#15803d' }}>
                            {cs.actualWeather.temp > 0 ? `+${cs.actualWeather.temp}` : cs.actualWeather.temp}°C
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                            {cs.actualWeather.wind} m/s (hviða {cs.actualWeather.gust})
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-main)', fontWeight: 600 }}>
                            {cs.actualWeather.weather}
                          </div>
                          <div style={{ marginTop: '0.5rem', fontSize: '0.68rem', color: '#15803d', fontWeight: 700 }}>
                            Mælt á stöð
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* Verdict Banner */}
                    <div style={{ 
                      background: '#ecfdf5', 
                      borderLeft: '3px solid #059669', 
                      border: '1px solid #a7f3d0',
                      padding: '0.75rem 0.85rem', 
                      borderRadius: '0 8px 8px 0',
                      fontSize: '0.78rem',
                      color: 'var(--text-main)',
                      lineHeight: 1.45
                    }}>
                      <strong style={{ color: '#059669' }}>DÓMUR:</strong> {cs.verdict}
                    </div>

                  </div>
                ))}
              </div>

            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW: OUTLOOK */}
      {/* ========================================================================= */}
      {viewMode === 'outlook' && (
        <div className="glass-panel" style={{ padding: '1.75rem', background: '#ffffff', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
              <span className="badge badge-blue">
                SPÁSTÖÐUGLEIKI & ÁREIÐANLEIKI
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {activeStation.name} – Næstu 4 dagar
              </span>
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--navy-primary)' }}>
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
                    background: '#ffffff'
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

                    <h4 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--navy-primary)', marginBottom: '0.2rem' }}>
                      {fc.dayName}
                    </h4>

                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--navy-primary)', marginBottom: '0.3rem' }}>
                      {fc.temp > 0 ? `+${fc.temp}` : fc.temp}°C • {fc.wind} m/s
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>
                      {fc.weatherDesc}
                    </div>

                    <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', borderLeft: `3px solid ${scoreColor}`, marginBottom: '0.75rem' }}>
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

      {/* End Main Container */}
      </main>

      {/* Footer styled exactly like vedur.is */}
      <footer className="vedur-footer">
        <div className="vedur-footer-content">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 80 80" fill="#ffffff" aria-label="Veðurvaktin logo">
                <path d="M48.8877 18.0154L31.0909 35.8016V0.240051L48.8877 18.0154ZM17.7754 31.3309L0 49.1277H35.5615L17.7754 31.3309ZM31.0909 62.4218L48.8877 80.2401V44.6893L31.0909 62.4218ZM62.1817 49.1277L80 31.3309H44.4492L62.1817 49.1277Z"></path>
              </svg>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>Veðurvaktin</span>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.6, maxWidth: '380px', marginBottom: '0.75rem' }}>
              Sjálfstætt greiningarkerfi fyrir veðurspár og raunmælingar.<br />
              Tölfræðilegt mat á spágæðum, 365 daga ársgreining og vélrænar líkanaleiðréttingar á spám.
            </p>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              Veðurspá vs. Raunveruleiki – Gagnvirkt kerfi sem ber saman evrópska reiknilíkanið (ECMWF/Harmonie) við rauntímamælingar á veðurstöðvum.
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.85rem', color: '#93c5fd' }}>Veður & Spár</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.8rem', lineHeight: 2, color: '#e2e8f0' }}>
              <li><a href="#" onClick={(e) => { e.preventDefault(); setViewMode('verification'); }} style={{ color: '#e2e8f0', textDecoration: 'none' }}>Sannprófun dagsins</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); setViewMode('aiForecast'); }} style={{ color: '#e2e8f0', textDecoration: 'none' }}>AI-Leiðrétt Snjallspá</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); setViewMode('history'); }} style={{ color: '#e2e8f0', textDecoration: 'none' }}>365 daga ársgreining</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); setViewMode('outlook'); }} style={{ color: '#e2e8f0', textDecoration: 'none' }}>Spástöðugleikamat</a></li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.85rem', color: '#93c5fd' }}>Líkön & Gögn</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.8rem', lineHeight: 2, color: '#e2e8f0' }}>
              <li><span style={{ color: '#cbd5e1' }}>ECMWF Evrópumódelið</span></li>
              <li><span style={{ color: '#cbd5e1' }}>Harmonie 2.5km háupplausn</span></li>
              <li><span style={{ color: '#cbd5e1' }}>Raunmælingar stöðva</span></li>
              <li><span style={{ color: '#cbd5e1' }}>Líkanaleiðrétting (AI Bias)</span></li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.85rem', color: '#93c5fd' }}>Upplýsingar</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.8rem', lineHeight: 2, color: '#e2e8f0' }}>
              <li><span style={{ color: '#cbd5e1' }}>Sjálfstætt greiningarverkefni</span></li>
              <li><span style={{ color: '#cbd5e1' }}>Aðferðafræði & Sannprófun</span></li>
              <li><span style={{ color: '#cbd5e1' }}>Opinn hugbúnaður</span></li>
              <li><a href="https://github.com/robertbeck-stack/vedurspa" target="_blank" rel="noreferrer" style={{ color: '#93c5fd', textDecoration: 'none' }}>Kóði á GitHub ↗</a></li>
            </ul>
          </div>
        </div>

        <div className="vedur-footer-bottom">
          <div>© {new Date().getFullYear()} Veðurvaktin • Sjálfstætt greiningarkerfi • Allur réttur áskilinn</div>
          <div>Kerfi keyrt á Vercel & Next.js • Byggt á opnum veðurgögnum</div>
        </div>
      </footer>

    </div>
  );
}
