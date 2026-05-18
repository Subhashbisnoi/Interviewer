import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import {
  User, Briefcase, Code, Globe, Github, Linkedin, FileText,
  Plus, Edit3, Save, X, Eye, EyeOff, Upload, Flame, Sparkles,
  RefreshCw, Loader2, CheckCircle2, Circle,
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';

const API = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// ── tiny UI primitives ───────────────────────────────────────────────────

const Section = ({ title, icon: Icon, children, right }) => (
  <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <Icon className="w-5 h-5 text-blue-500" />
        <h3 className="font-bold text-slate-900 dark:text-white">{title}</h3>
      </div>
      {right}
    </div>
    {children}
  </div>
);

// Circular progress ring
const CompletionRing = ({ pct, size = 160, stroke = 14 }) => {
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (Math.max(0, Math.min(100, pct)) / 100) * circ;
  const color = pct >= 60 ? '#10b981' : pct >= 40 ? '#f59e0b' : '#ef4444';
  return (
    <svg width={size} height={size} className="block">
      <circle cx={size / 2} cy={size / 2} r={radius} stroke="#e2e8f0" strokeWidth={stroke} fill="none" className="dark:stroke-slate-700" />
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        stroke={color} strokeWidth={stroke} fill="none"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
      />
      <text
        x="50%" y="50%" textAnchor="middle" dy="0.05em"
        style={{ fontSize: size * 0.22, fontWeight: 800, fill: color }}
      >
        {Math.round(pct)}%
      </text>
      <text
        x="50%" y="50%" textAnchor="middle" dy="1.6em"
        className="fill-slate-500 dark:fill-slate-400"
        style={{ fontSize: size * 0.08, fontWeight: 600 }}
      >
        Complete
      </text>
    </svg>
  );
};

const MiniBar = ({ label, value, max = 10 }) => {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-24 text-slate-500 dark:text-slate-400 capitalize">{label.replace(/_/g, ' ')}</span>
      <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-8 text-right font-semibold text-slate-700 dark:text-slate-200">{value.toFixed(1)}</span>
    </div>
  );
};


// ── GitHub-style heatmap ─────────────────────────────────────────────────

const Heatmap = ({ activity }) => {
  // 53 weeks × 7 days ending today
  const today = new Date();
  const startSunday = new Date(today);
  // Snap "today" to the end-of-week column. Start = today - 364 days, then align to Sunday.
  startSunday.setDate(today.getDate() - 52 * 7 - today.getDay());

  const weeks = 53;
  const cells = [];
  for (let w = 0; w < weeks; w++) {
    for (let d = 0; d < 7; d++) {
      const dt = new Date(startSunday);
      dt.setDate(startSunday.getDate() + w * 7 + d);
      if (dt > today) continue;
      const iso = dt.toISOString().slice(0, 10);
      const count = (activity && activity[iso]) || 0;
      cells.push({ w, d, iso, count, dt });
    }
  }

  const colorFor = (c) => {
    if (c <= 0) return 'fill-slate-200 dark:fill-slate-700';
    if (c === 1) return 'fill-green-300 dark:fill-green-700';
    if (c === 2) return 'fill-green-400 dark:fill-green-500';
    if (c >= 3) return 'fill-green-600 dark:fill-green-400';
    return 'fill-slate-200';
  };

  const cell = 12, gap = 2;
  const w = weeks * (cell + gap);
  const h = 7 * (cell + gap);
  const total = cells.reduce((a, c) => a + c.count, 0);

  return (
    <div>
      <div className="overflow-x-auto">
        <svg width={w} height={h}>
          {cells.map((c) => (
            <rect
              key={c.iso}
              x={c.w * (cell + gap)}
              y={c.d * (cell + gap)}
              width={cell}
              height={cell}
              rx={2}
              className={colorFor(c.count)}
            >
              <title>{c.iso}: {c.count} interview{c.count === 1 ? '' : 's'}</title>
            </rect>
          ))}
        </svg>
      </div>
      <div className="flex items-center justify-between mt-3">
        <div className="text-sm text-slate-600 dark:text-slate-300 font-medium">
          {total} interview{total === 1 ? '' : 's'} in the last year
        </div>
        <div className="flex items-center gap-1 text-xs text-slate-500">
          <span>Less</span>
          {[0, 1, 2, 3].map(c => (
            <span key={c} className={`inline-block w-3 h-3 rounded-sm ${colorFor(c)}`} />
          ))}
          <span>More</span>
        </div>
      </div>
    </div>
  );
};

// ── Score card ───────────────────────────────────────────────────────────

const ScoreCard = ({ icon: Icon, label, score, breakdown, feedback, cost, onScore, scoring, action, accent = 'blue' }) => {
  const colorMap = {
    blue:   'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
    slate:  'from-slate-600 to-slate-800',
  };
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${colorMap[accent]} flex items-center justify-center`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div className="font-bold text-slate-900 dark:text-white">{label}</div>
        </div>
      </div>

      {score != null ? (
        <>
          <div className="flex items-baseline gap-1 mb-3">
            <span className="text-4xl font-extrabold text-slate-900 dark:text-white">{Number(score).toFixed(1)}</span>
            <span className="text-slate-400 text-sm">/ 10</span>
          </div>
          {breakdown && (
            <div className="space-y-1.5 mb-3">
              {Object.entries(breakdown).map(([k, v]) => (
                <MiniBar key={k} label={k} value={Number(v)} />
              ))}
            </div>
          )}
          {feedback && (
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3 line-clamp-4">{feedback}</p>
          )}
        </>
      ) : (
        <div className="text-slate-400 italic text-sm mb-3 flex-1">Not scored yet</div>
      )}

      <div className="flex gap-2 mt-auto">
        <button
          onClick={onScore}
          disabled={scoring}
          className="flex-1 px-3 py-2 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-1"
        >
          {scoring ? <Loader2 className="w-4 h-4 animate-spin" /> : (score != null ? <RefreshCw className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />)}
          {scoring ? 'Scoring…' : score != null ? `Rescore (${cost})` : `Score Now (${cost})`}
        </button>
        {action}
      </div>
    </div>
  );
};

// ── Page ─────────────────────────────────────────────────────────────────

const ProfilePage = () => {
  const { user } = useAuth();
  const toast = useToast();

  const readCache = () => {
    try { return JSON.parse(localStorage.getItem('cache_profile') || '{}').data || null; } catch { return null; }
  };
  const cached = readCache();
  const [profile, setProfile] = useState(cached);
  const [loading, setLoading] = useState(!cached);  // only show skeleton if no cache
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(cached || {});
  const [newSkill, setNewSkill] = useState('');
  const [scoring, setScoring] = useState({ resume: false, github: false, linkedin: false, overall: false });
  const [reuploading, setReuploading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []); // eslint-disable-line

  const fetchProfile = async (silent = false) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/profile/me`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      localStorage.setItem('cache_profile', JSON.stringify({ data, ts: Date.now() }));
      setProfile(data);
      if (!silent) setForm(data);
    } catch (e) {
      if (!profile) toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };


  const saveProfile = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/profile/me`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      localStorage.setItem('cache_profile', JSON.stringify({ data, ts: Date.now() }));
      setProfile(data);
      setForm(data);
      setEditMode(false);
      toast.success('Profile saved!');
    } catch (e) {
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const runScore = async (kind, cost) => {
    setScoring(s => ({ ...s, [kind]: true }));
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/profile/score/${kind}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(typeof e.detail === 'string' ? e.detail : `Failed (${res.status})`);
      }
      const data = await res.json();
      toast.success(`${kind[0].toUpperCase() + kind.slice(1)} scored: ${(data[`${kind}_score`] ?? data.scores?.overall ?? '').toString().slice(0, 4)}/10`);
      await fetchProfile();
    } catch (e) {
      toast.error(e.message || `Failed to score ${kind}`);
    } finally {
      setScoring(s => ({ ...s, [kind]: false }));
    }
  };

  const onResumeDrop = useCallback(async (files) => {
    const file = files[0];
    if (!file || file.type !== 'application/pdf') {
      toast.error('Please upload a PDF');
      return;
    }
    setReuploading(true);
    try {
      const token = localStorage.getItem('token');
      const fd = new FormData();
      fd.append('file', file);
      const uploadRes = await fetch(`${API}/interview/upload-resume`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (!uploadRes.ok) throw new Error('Upload failed');
      const { resume_text } = await uploadRes.json();

      const putRes = await fetch(`${API}/profile/me`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ resume_text, resume_filename: file.name }),
      });
      const data = await putRes.json();
      setProfile(data);
      setForm(data);
      toast.success('Resume updated. Score it for fresh feedback.');
    } catch (e) {
      toast.error(e.message || 'Resume upload failed');
    } finally {
      setReuploading(false);
    }
  }, [toast]);

  const { getRootProps: getResumeRootProps, getInputProps: getResumeInputProps, isDragActive: isResumeDragActive } = useDropzone({
    onDrop: onResumeDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
    noClick: false,
  });

  const addSkill = () => {
    if (!newSkill.trim()) return;
    setForm(f => ({ ...f, skills: [...(f.skills || []), newSkill.trim()] }));
    setNewSkill('');
  };
  const removeSkill = (idx) => setForm(f => ({ ...f, skills: f.skills.filter((_, i) => i !== idx) }));
  const addTargetRole = () => {
    const role = prompt('Add target role:');
    if (role?.trim()) setForm(f => ({ ...f, target_roles: [...(f.target_roles || []), role.trim()] }));
  };
  const removeTargetRole = (idx) => setForm(f => ({ ...f, target_roles: f.target_roles.filter((_, i) => i !== idx) }));


  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4">
        <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
          {/* top bar */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-700" />
            <div className="space-y-2 flex-1">
              <div className="h-5 w-48 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-3 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
          </div>
          {/* completion + streak row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="h-40 rounded-2xl bg-slate-200 dark:bg-slate-700" />
            <div className="h-40 rounded-2xl bg-slate-200 dark:bg-slate-700" />
          </div>
          {/* score cards */}
          <div className="grid grid-cols-3 gap-4">
            {[0,1,2].map(i => <div key={i} className="h-48 rounded-2xl bg-slate-200 dark:bg-slate-700" />)}
          </div>
          {/* heatmap */}
          <div className="h-36 rounded-2xl bg-slate-200 dark:bg-slate-700" />
          {/* kpi */}
          <div className="grid grid-cols-2 gap-4">
            {[0,1,2,3].map(i => <div key={i} className="h-28 rounded-2xl bg-slate-200 dark:bg-slate-700" />)}
          </div>
        </div>
      </div>
    );
  }

  const data = editMode ? form : profile;
  const completion = profile?.profile_completion || 0;
  const missing = profile?.__missing__ || []; // populated below from /completion lazily
  const streak = profile?.streak_days || 0;
  const todayIso = new Date().toISOString().slice(0, 10);
  const didToday = (profile?.daily_activity || {})[todayIso] > 0;

  // Build missing list locally from same rules the backend uses (keeps UI snappy)
  const localMissing = (() => {
    const checks = [
      ['Full name', !!user?.full_name],
      ['Bio', !!profile?.bio],
      ['Target roles', (profile?.target_roles || []).length > 0],
      ['Skills', (profile?.skills || []).length > 0],
      ['Experience years', (profile?.experience_years || 0) > 0],
      ['Resume', !!profile?.resume_text],
      ['LinkedIn URL', !!profile?.linkedin_url],
      ['GitHub URL', !!profile?.github_url],
      ['Resume scored', profile?.resume_score != null],
      ['Overall score', profile?.profile_score != null],
    ];
    return checks;
  })();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Profile</h1>
          <div className="flex gap-3">
            <button
              onClick={() => setForm(f => ({ ...f, is_visible_to_recruiters: !f.is_visible_to_recruiters }))}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                form.is_visible_to_recruiters
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {form.is_visible_to_recruiters ? <><Eye className="w-4 h-4" /> Visible to Recruiters</> : <><EyeOff className="w-4 h-4" /> Hidden</>}
            </button>
            {editMode ? (
              <>
                <button onClick={() => { setForm(profile); setEditMode(false); }} className="px-4 py-2 rounded-xl text-sm font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  <X className="w-4 h-4" />
                </button>
                <button onClick={saveProfile} disabled={saving} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">
                  <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save'}
                </button>
              </>
            ) : (
              <button onClick={() => setEditMode(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-blue-600 text-white hover:bg-blue-700">
                <Edit3 className="w-4 h-4" /> Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Completion + Streak */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Section title="Profile Completion" icon={CheckCircle2}>
            <div className="flex flex-col items-center">
              <CompletionRing pct={completion} />
              {completion < 60 && (
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-3 text-center font-medium">
                  Reach 60% to unlock interviews.
                </p>
              )}
            </div>
          </Section>

          <Section title="What's missing" icon={Circle}>
            <ul className="space-y-2">
              {localMissing.map(([label, done]) => (
                <li key={label} className="flex items-center gap-2 text-sm">
                  {done
                    ? <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    : <Circle className="w-4 h-4 text-slate-300 dark:text-slate-600 flex-shrink-0" />}
                  <span className={done ? 'text-slate-700 dark:text-slate-200' : 'text-slate-400'}>{label}</span>
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Streak" icon={Flame}>
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="text-6xl mb-1">🔥</div>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white">{streak}</div>
              <div className="text-sm text-slate-500 dark:text-slate-400">day streak</div>
              {!didToday && (
                <p className="text-xs text-orange-600 dark:text-orange-400 mt-3 font-medium">
                  Practice today to keep your streak!
                </p>
              )}
            </div>
          </Section>
        </div>

        {/* Score Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ScoreCard
            icon={FileText}
            label="Resume"
            score={profile?.resume_score}
            breakdown={profile?.resume_score_breakdown}
            feedback={profile?.resume_feedback}
            cost="3 credits"
            scoring={scoring.resume}
            onScore={() => runScore('resume', 3)}
            accent="blue"
            action={
              <div {...getResumeRootProps()} className="px-3 py-2 rounded-xl text-sm font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 cursor-pointer flex items-center gap-1">
                <input {...getResumeInputProps()} />
                {reuploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {isResumeDragActive ? 'Drop' : 'Re-upload'}
              </div>
            }
          />
          <ScoreCard
            icon={Github}
            label="GitHub"
            score={profile?.github_score}
            breakdown={profile?.github_score_breakdown}
            feedback={profile?.github_feedback}
            cost="2 credits"
            scoring={scoring.github}
            onScore={() => runScore('github', 2)}
            accent="slate"
          />
          <ScoreCard
            icon={Linkedin}
            label="LinkedIn"
            score={profile?.linkedin_score}
            breakdown={profile?.linkedin_score_breakdown}
            feedback={profile?.linkedin_feedback}
            cost="2 credits"
            scoring={scoring.linkedin}
            onScore={() => runScore('linkedin', 2)}
            accent="blue"
          />
        </div>

        {/* Overall Profile Score */}
        <div className="bg-gradient-to-br from-indigo-600 via-blue-600 to-purple-600 rounded-3xl p-8 text-white text-center shadow-xl">
          <div className="text-sm uppercase tracking-wider text-blue-100 mb-2">Overall Profile Score</div>
          {profile?.profile_score != null ? (
            <div className="flex items-baseline justify-center gap-1 mb-4">
              <span className="text-7xl font-extrabold">{Number(profile.profile_score).toFixed(1)}</span>
              <span className="text-2xl text-blue-100">/ 10</span>
            </div>
          ) : (
            <div className="text-2xl font-bold mb-4 text-blue-100">Not generated yet</div>
          )}
          <button
            onClick={() => runScore('overall', 1)}
            disabled={scoring.overall}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-blue-700 font-bold rounded-xl text-sm hover:bg-blue-50 disabled:opacity-50"
          >
            {scoring.overall ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {profile?.profile_score != null ? 'Regenerate Score (1 credit)' : 'Generate Overall Score (1 credit)'}
          </button>
        </div>

        {/* Activity Heatmap */}
        <Section title="Activity" icon={Flame}>
          <Heatmap activity={profile?.daily_activity || {}} />
        </Section>

        {/* ── existing edit form sections ──────────────────────────────── */}

        <Section title="Basic Info" icon={User}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Full Name</label>
              <div className="text-slate-900 dark:text-white font-medium">{user?.full_name || user?.name}</div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Email</label>
              <div className="text-slate-900 dark:text-white">{user?.email}</div>
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Headline</label>
              {editMode ? (
                <input value={form.headline || ''} onChange={e => setForm(f => ({ ...f, headline: e.target.value }))} placeholder="e.g. Full Stack Engineer | 3 YoE | Open to work" className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              ) : (
                <div className="text-slate-600 dark:text-slate-300">{data?.headline || <span className="text-slate-400 italic">Not set</span>}</div>
              )}
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Location</label>
              {editMode ? (
                <input value={form.location || ''} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Bangalore, India" className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              ) : (
                <div className="text-slate-600 dark:text-slate-300">{data?.location || <span className="text-slate-400 italic">Not set</span>}</div>
              )}
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Years of Experience</label>
              {editMode ? (
                <input type="number" min="0" step="0.5" value={form.experience_years || 0} onChange={e => setForm(f => ({ ...f, experience_years: parseFloat(e.target.value) }))} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              ) : (
                <div className="text-slate-600 dark:text-slate-300">{data?.experience_years} years</div>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Bio</label>
              {editMode ? (
                <textarea rows={3} value={form.bio || ''} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} placeholder="Tell recruiters about yourself…" className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              ) : (
                <div className="text-slate-600 dark:text-slate-300 text-sm whitespace-pre-wrap">{data?.bio || <span className="text-slate-400 italic">Not set</span>}</div>
              )}
            </div>
          </div>
        </Section>

        <Section title="Target Roles" icon={Briefcase}>
          <div className="flex flex-wrap gap-2 mb-3">
            {(data?.target_roles || []).map((r, i) => (
              <span key={i} className="flex items-center gap-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-full text-sm font-medium">
                {r}
                {editMode && <button onClick={() => removeTargetRole(i)} className="hover:text-red-500 ml-1"><X className="w-3 h-3" /></button>}
              </span>
            ))}
          </div>
          {editMode && (
            <button onClick={addTargetRole} className="flex items-center gap-1 text-sm text-blue-500 hover:text-blue-700">
              <Plus className="w-4 h-4" /> Add Role
            </button>
          )}
        </Section>

        <Section title="Skills" icon={Code}>
          <div className="flex flex-wrap gap-2 mb-3">
            {(data?.skills || []).map((s, i) => (
              <span key={i} className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-full text-sm">
                {s}
                {editMode && <button onClick={() => removeSkill(i)} className="hover:text-red-500 ml-1"><X className="w-3 h-3" /></button>}
              </span>
            ))}
          </div>
          {editMode && (
            <div className="flex gap-2">
              <input
                value={newSkill}
                onChange={e => setNewSkill(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                placeholder="Add a skill…"
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button onClick={addSkill} className="px-3 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          )}
        </Section>

        <Section title="Links" icon={Globe}>
          <div className="space-y-3">
            {[
              { key: 'linkedin_url', icon: Linkedin, label: 'LinkedIn', ph: 'https://linkedin.com/in/your-profile' },
              { key: 'github_url', icon: Github, label: 'GitHub', ph: 'https://github.com/your-username' },
              { key: 'portfolio_url', icon: Globe, label: 'Portfolio', ph: 'https://yourportfolio.com' },
            ].map(({ key, icon: Icon, label, ph }) => (
              <div key={key} className="flex items-center gap-3">
                <Icon className="w-5 h-5 text-slate-400 flex-shrink-0" />
                {editMode ? (
                  <input value={form[key] || ''} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} placeholder={ph} className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                ) : data?.[key] ? (
                  <a href={data[key]} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-sm">{data[key]}</a>
                ) : (
                  <span className="text-slate-400 italic text-sm">Not set</span>
                )}
              </div>
            ))}
          </div>
        </Section>

        {/* Credits info */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white text-center">
          <div className="text-4xl font-extrabold mb-1">{user?.credits ?? profile?.credits ?? 0}</div>
          <div className="text-blue-100 mb-4">credits remaining</div>
          <a href="/pricing" className="inline-block px-6 py-2 bg-white text-blue-700 font-bold rounded-xl text-sm hover:bg-blue-50 transition-colors">
            Buy More Credits
          </a>
        </div>

      </div>
    </div>
  );
};

export default ProfilePage;
