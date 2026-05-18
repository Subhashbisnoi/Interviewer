import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Link } from 'react-router-dom';
import {
  TrendingUp, TrendingDown, Award, Target, BarChart3, Zap,
  RefreshCw, ArrowRight, Minus, AlertTriangle, CheckCircle2,
  Flame, Brain, MessageSquare, Users, Lightbulb, GitBranch,
} from 'lucide-react';

const API = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const CACHE_TTL = 30 * 60 * 1000;

const DIMS = [
  { key: 'score_technical',         label: 'Technical',         icon: Brain,        color: '#6366f1' },
  { key: 'score_communication',     label: 'Communication',     icon: MessageSquare,color: '#0ea5e9' },
  { key: 'score_leadership',        label: 'Leadership',        icon: Users,        color: '#f59e0b' },
  { key: 'score_critical_thinking', label: 'Critical Thinking', icon: Lightbulb,    color: '#10b981' },
  { key: 'score_decision_making',   label: 'Decision Making',   icon: GitBranch,    color: '#f43f5e' },
  { key: 'score_project_knowledge', label: 'Project Knowledge', icon: Zap,          color: '#8b5cf6' },
];

// ─── micro components ────────────────────────────────────────────────────────

const Sparkline = ({ values, color = '#6366f1', w = 80, h = 28 }) => {
  if (!values || values.length < 2) return null;
  const mn = Math.min(...values), mx = Math.max(...values), rng = mx - mn || 1;
  const pad = 3;
  const pts = values.map((v, i) => {
    const x = pad + (i / (values.length - 1)) * (w - pad * 2);
    const y = pad + ((mx - v) / rng) * (h - pad * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  return (
    <svg width={w} height={h}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.8}
        strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
};

const TrendBadge = ({ delta }) => {
  if (delta == null || Math.abs(delta) < 0.05)
    return <span className="flex items-center gap-0.5 text-xs text-slate-400"><Minus className="w-3 h-3" />0.0</span>;
  const up = delta > 0;
  return (
    <span className={`flex items-center gap-0.5 text-xs font-bold ${up ? 'text-emerald-500' : 'text-red-500'}`}>
      {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {up ? '+' : ''}{delta.toFixed(1)}
    </span>
  );
};

const ScorePill = ({ score }) => {
  const color = score >= 7.5 ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
    : score >= 5 ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
    : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
  return <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${color}`}>{score.toFixed(1)}</span>;
};

// Radar chart – pure SVG
const RadarChart = ({ dims, size = 220 }) => {
  const n = dims.length;
  const cx = size / 2, cy = size / 2;
  const maxR = size * 0.38;
  const angle = (i) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const pt = (i, r) => [cx + r * Math.cos(angle(i)), cy + r * Math.sin(angle(i))];

  const rings = [2, 4, 6, 8, 10];
  return (
    <svg width={size} height={size} className="block mx-auto">
      {/* grid rings */}
      {rings.map(v => (
        <polygon key={v}
          points={Array.from({ length: n }, (_, i) => pt(i, (v / 10) * maxR).join(',')).join(' ')}
          fill="none" stroke="currentColor" strokeWidth={0.5}
          className="text-slate-200 dark:text-slate-700" />
      ))}
      {/* axes */}
      {Array.from({ length: n }, (_, i) => {
        const [x, y] = pt(i, maxR);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="currentColor"
          strokeWidth={0.5} className="text-slate-200 dark:text-slate-700" />;
      })}
      {/* data polygon */}
      <polygon
        points={dims.map((d, i) => pt(i, ((d.avg ?? 0) / 10) * maxR).join(',')).join(' ')}
        fill="#6366f1" fillOpacity={0.18} stroke="#6366f1" strokeWidth={2}
        strokeLinejoin="round" />
      {/* dots */}
      {dims.map((d, i) => {
        const [x, y] = pt(i, ((d.avg ?? 0) / 10) * maxR);
        return <circle key={i} cx={x} cy={y} r={3.5} fill={d.color} stroke="white" strokeWidth={1.5} />;
      })}
      {/* labels */}
      {dims.map((d, i) => {
        const [x, y] = pt(i, maxR + 18);
        const anchor = x < cx - 4 ? 'end' : x > cx + 4 ? 'start' : 'middle';
        return (
          <text key={i} x={x} y={y} textAnchor={anchor} fontSize={9} fontWeight={600}
            className="fill-slate-500 dark:fill-slate-400">{d.label.split(' ')[0]}</text>
        );
      })}
    </svg>
  );
};

// Trend line chart with gradient fill
const TrendLine = ({ data }) => {
  if (!data || data.length < 2) return (
    <div className="flex items-center justify-center h-40 text-slate-400 text-sm">
      Complete more interviews to see your trend
    </div>
  );
  const W = 480, H = 140, PL = 32, PR = 8, PT = 12, PB = 24;
  const iW = W - PL - PR, iH = H - PT - PB;
  const xOf = i => PL + (i / (data.length - 1)) * iW;
  const yOf = v => PT + ((10 - v) / 10) * iH;
  const pts = data.map((d, i) => `${xOf(i).toFixed(1)},${yOf(d.score).toFixed(1)}`).join(' ');
  const area = `M${xOf(0)},${yOf(data[0].score)} ` +
    data.slice(1).map((d, i) => `L${xOf(i+1)},${yOf(d.score)}`).join(' ') +
    ` L${xOf(data.length-1)},${PT+iH} L${xOf(0)},${PT+iH} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="none" style={{ height: H }}>
      <defs>
        <linearGradient id="tg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 2.5, 5, 7.5, 10].map(v => (
        <g key={v}>
          <line x1={PL} x2={W-PR} y1={yOf(v)} y2={yOf(v)}
            stroke="currentColor" strokeWidth={0.5} className="text-slate-200 dark:text-slate-700" />
          <text x={PL-4} y={yOf(v)} textAnchor="end" dominantBaseline="middle"
            fontSize={8} className="fill-slate-400">{v}</text>
        </g>
      ))}
      <path d={area} fill="url(#tg)" />
      <polyline points={pts} fill="none" stroke="#6366f1" strokeWidth={2.5}
        strokeLinejoin="round" strokeLinecap="round" />
      {data.map((d, i) => (
        <g key={i}>
          <circle cx={xOf(i)} cy={yOf(d.score)} r={3.5} fill="#6366f1" stroke="white" strokeWidth={1.5} />
          <text x={xOf(i)} y={H - 6} textAnchor="middle" fontSize={8} className="fill-slate-400">
            #{d.n}
          </text>
        </g>
      ))}
    </svg>
  );
};

// Skeleton
const Skeleton = () => (
  <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4 animate-pulse">
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="h-7 w-56 bg-slate-200 dark:bg-slate-700 rounded" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[0,1,2,3].map(i => <div key={i} className="h-24 rounded-2xl bg-slate-200 dark:bg-slate-700" />)}
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="h-64 rounded-2xl bg-slate-200 dark:bg-slate-700" />
        <div className="h-64 rounded-2xl bg-slate-200 dark:bg-slate-700" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[0,1,2,3,4,5].map(i => <div key={i} className="h-28 rounded-2xl bg-slate-200 dark:bg-slate-700" />)}
      </div>
    </div>
  </div>
);

// ─── main ────────────────────────────────────────────────────────────────────
const Dashboard = () => {
  const { user } = useAuth();
  const toast = useToast();
  const hasFetched = useRef(false);

  const fromCache = (key) => {
    try { return JSON.parse(localStorage.getItem(key) || '{}'); } catch { return {}; }
  };
  const isFresh = (key) => {
    try { return Date.now() - JSON.parse(localStorage.getItem(key) || '{}').ts < CACHE_TTL; } catch { return false; }
  };

  const [sessions, setSessions] = useState(() => fromCache('cache_sessions').data || []);
  const [analytics, setAnalytics] = useState(() => fromCache('cache_analytics').data || {});
  const [loading, setLoading] = useState(() => !localStorage.getItem('cache_sessions'));

  useEffect(() => {
    if (!user || hasFetched.current) return;
    hasFetched.current = true;
    fetchAll(isFresh('cache_sessions') && isFresh('cache_analytics'));
  }, [user]); // eslint-disable-line

  const fetchAll = async (background = false) => {
    if (!background) setLoading(true);
    try {
      const h = { Authorization: `Bearer ${localStorage.getItem('token')}` };
      const [ar, sr] = await Promise.all([
        fetch(`${API}/interview/analytics`, { headers: h }),
        fetch(`${API}/interview/sessions`, { headers: h }),
      ]);
      if (ar.ok) {
        const d = await ar.json();
        localStorage.setItem('cache_analytics', JSON.stringify({ data: d, ts: Date.now() }));
        setAnalytics(d);
      }
      if (sr.ok) {
        const d = await sr.json();
        const list = d.sessions || [];
        localStorage.setItem('cache_sessions', JSON.stringify({ data: list, ts: Date.now() }));
        setSessions(list);
      }
    } catch {
      if (!background) toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  // ── derived ────────────────────────────────────────────────────────────────
  const completed = useMemo(() =>
    sessions.filter(s => s.status === 'completed' && s.average_score > 0)
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at)),
    [sessions]
  );

  const trendData = useMemo(() =>
    completed.slice(-12).map((s, i, arr) => ({
      n: completed.length - arr.length + i + 1,
      score: s.average_score,
    })), [completed]
  );

  const dimStats = useMemo(() => DIMS.map(d => {
    const series = completed.map(s => s[d.key]).filter(v => v != null);
    const avg = series.length ? series.reduce((a, b) => a + b, 0) / series.length : null;
    const last3 = series.slice(-3), prev3 = series.slice(-6, -3);
    const avgL = last3.length ? last3.reduce((a, b) => a + b, 0) / last3.length : null;
    const avgP = prev3.length ? prev3.reduce((a, b) => a + b, 0) / prev3.length : null;
    const delta = avgL != null && avgP != null ? avgL - avgP : null;
    return { ...d, avg, delta, spark: series.slice(-8) };
  }), [completed]);

  // Weakest & strongest dim
  const scoredDims = dimStats.filter(d => d.avg != null);
  const weakest  = scoredDims.length ? [...scoredDims].sort((a, b) => a.avg - b.avg)[0] : null;
  const strongest = scoredDims.length ? [...scoredDims].sort((a, b) => b.avg - a.avg)[0] : null;

  // Improvement (first 3 vs last 3)
  const improvement = useMemo(() => {
    const s = completed.filter(s => s.average_score > 0);
    if (s.length < 6) return null;
    const f = s.slice(0, 3).reduce((a, x) => a + x.average_score, 0) / 3;
    const l = s.slice(-3).reduce((a, x) => a + x.average_score, 0) / 3;
    return ((l - f) / f) * 100;
  }, [completed]);

  // Consistency score (1 - coeff of variation of last 5)
  const consistency = useMemo(() => {
    const recent = completed.slice(-5).map(s => s.average_score);
    if (recent.length < 3) return null;
    const mean = recent.reduce((a, b) => a + b, 0) / recent.length;
    const std = Math.sqrt(recent.reduce((a, v) => a + (v - mean) ** 2, 0) / recent.length);
    return Math.max(0, Math.round((1 - std / (mean || 1)) * 100));
  }, [completed]);

  // Insight messages
  const insights = useMemo(() => {
    const out = [];
    if (weakest && weakest.avg < 5)
      out.push({ type: 'warn', text: `${weakest.label} is your weakest area (${weakest.avg.toFixed(1)}/10). Focus on this next session.` });
    if (strongest && strongest.avg >= 7)
      out.push({ type: 'good', text: `${strongest.label} is your strength (${strongest.avg.toFixed(1)}/10). Keep building on it.` });
    if (improvement != null && improvement > 10)
      out.push({ type: 'good', text: `You've improved ${improvement.toFixed(1)}% since you started. Momentum is building.` });
    if (improvement != null && improvement < -5)
      out.push({ type: 'warn', text: `Your last few sessions are below your early average. Take time to review feedback.` });
    if (consistency != null && consistency >= 80)
      out.push({ type: 'good', text: `You're consistent — ${consistency}% score stability across your last 5 sessions.` });
    if (completed.length >= 1 && completed.length < 5)
      out.push({ type: 'info', text: `${5 - completed.length} more sessions unlock your full KPI trend analysis.` });
    return out.slice(0, 3);
  }, [weakest, strongest, improvement, consistency, completed.length]);

  const stats = {
    total:     analytics.total_interviews || sessions.length,
    avg:       analytics.average_score || 0,
    best:      analytics.best_score || 0,
  };

  if (loading) return <Skeleton />;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Performance Dashboard</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {completed.length} completed sessions · last updated {new Date().toLocaleDateString()}
            </p>
          </div>
          <button onClick={() => fetchAll(false)}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {/* Insight strip */}
        {insights.length > 0 && (
          <div className="space-y-2">
            {insights.map((ins, i) => {
              const styles = {
                warn: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700 text-amber-800 dark:text-amber-200',
                good: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200',
                info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 text-blue-800 dark:text-blue-200',
              };
              const icons = { warn: AlertTriangle, good: CheckCircle2, info: Zap };
              const Icon = icons[ins.type];
              return (
                <div key={i} className={`flex items-start gap-2.5 px-4 py-3 rounded-xl border text-sm font-medium ${styles[ins.type]}`}>
                  <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  {ins.text}
                </div>
              );
            })}
          </div>
        )}

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: BarChart3, label: 'Total Sessions', value: stats.total, sub: `${sessions.filter(s=>s.status==='completed').length} completed`, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30' },
            { icon: Target,    label: 'Average Score',  value: `${stats.avg.toFixed(1)}/10`, sub: improvement != null ? `${improvement>=0?'+':''}${improvement.toFixed(1)}% vs start` : 'Keep going', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-900/30' },
            { icon: Award,     label: 'Best Score',     value: `${stats.best.toFixed(1)}/10`, sub: strongest ? `↑ ${strongest.label}` : '–', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
            { icon: Flame,     label: 'Consistency',    value: consistency != null ? `${consistency}%` : '–', sub: consistency == null ? 'Need 3+ sessions' : consistency >= 80 ? 'Very consistent' : consistency >= 60 ? 'Getting there' : 'Needs work', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/30' },
          ].map(({ icon: Icon, label, value, sub, color, bg }) => (
            <div key={label} className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${bg}`}>
                <Icon className={`w-4.5 h-4.5 ${color}`} style={{ width: 18, height: 18 }} />
              </div>
              <div className="text-xl font-extrabold text-slate-900 dark:text-white">{value}</div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">{label}</div>
              {sub && <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{sub}</div>}
            </div>
          ))}
        </div>

        {/* Trend line + Radar */}
        <div className="grid md:grid-cols-5 gap-4">
          <div className="md:col-span-3 bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-900 dark:text-white text-sm">Score over time</h2>
              {trendData.length >= 2 && (
                <TrendBadge delta={trendData.length >= 2 ? trendData[trendData.length-1].score - trendData[0].score : null} />
              )}
            </div>
            <TrendLine data={trendData} />
          </div>

          <div className="md:col-span-2 bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col">
            <h2 className="font-bold text-slate-900 dark:text-white text-sm mb-1">Skill radar</h2>
            <p className="text-xs text-slate-400 mb-3">Average across all sessions</p>
            {scoredDims.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">No data yet</div>
            ) : (
              <RadarChart dims={dimStats} />
            )}
          </div>
        </div>

        {/* KPI dimension cards */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900 dark:text-white">Dimension KPIs</h2>
            <span className="text-xs text-slate-400">trend = last 3 vs previous 3 sessions</span>
          </div>
          {completed.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-slate-100 dark:border-slate-700">
              <Zap className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
                Complete your first interview to unlock dimension KPIs.
              </p>
              <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                Start an interview <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {dimStats.map(d => {
                const Icon = d.icon;
                const isWeak = weakest?.key === d.key;
                const isStrong = strongest?.key === d.key;
                return (
                  <div key={d.key}
                    className={`bg-white dark:bg-slate-800 rounded-2xl p-5 border shadow-sm relative overflow-hidden
                      ${isWeak ? 'border-amber-300 dark:border-amber-700' : isStrong ? 'border-emerald-300 dark:border-emerald-700' : 'border-slate-100 dark:border-slate-700'}`}>
                    {isWeak && <span className="absolute top-2 right-2 text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full font-semibold">Focus</span>}
                    {isStrong && <span className="absolute top-2 right-2 text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full font-semibold">Strength</span>}
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="w-4 h-4" style={{ color: d.color }} />
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{d.label}</span>
                    </div>
                    <div className="flex items-end justify-between mb-2">
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                          {d.avg != null ? d.avg.toFixed(1) : '–'}
                        </span>
                        <span className="text-xs text-slate-400">/10</span>
                      </div>
                      <TrendBadge delta={d.delta} />
                    </div>
                    {/* progress bar */}
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full mb-2 overflow-hidden">
                      <div className="h-full rounded-full transition-all"
                        style={{ width: `${((d.avg ?? 0) / 10) * 100}%`, background: d.color }} />
                    </div>
                    <Sparkline values={d.spark} color={d.color} />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent sessions — minimal, just enough context */}
        {completed.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700">
              <h2 className="font-bold text-slate-900 dark:text-white text-sm">Recent Sessions</h2>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {[...completed].reverse().slice(0, 5).map((s, i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 capitalize truncate">{s.role}</div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {new Date(s.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      {s.plan_type && <span className="ml-2 capitalize">{s.plan_type}</span>}
                    </div>
                  </div>
                  <ScorePill score={s.average_score} />
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Dashboard;
