import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import {
  Upload, FileText, Brain, BarChart3, ArrowRight, Zap,
  Target, CheckCircle, Star, TrendingUp, Award, Users,
  Sparkles, Shield, BookOpen, ChevronRight, Quote,
  Briefcase, MessageSquare, Layers, Building2, CreditCard, Cpu
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import AuthModal from './auth/AuthModal';
import SEO from './SEO';

const API = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const PLANS = {
  normal: {
    label: 'Normal',
    model: 'GPT-4o',
    icon: Zap,
    color: 'blue',
    credits: '13–17',
    bg: 'from-blue-500 to-blue-600',
    ring: 'ring-blue-500',
    textColor: 'text-blue-600 dark:text-blue-400',
    desc: 'Great for daily practice',
  },
  thunder: {
    label: 'Thunder',
    model: 'Claude Sonnet 4.5',
    icon: Cpu,
    color: 'purple',
    credits: '33–39',
    bg: 'from-purple-500 to-purple-600',
    ring: 'ring-purple-500',
    textColor: 'text-purple-600 dark:text-purple-400',
    desc: 'Deep, nuanced evaluation',
    tag: 'Popular',
  },
  max: {
    label: 'Max',
    model: 'Claude Opus 4.7',
    icon: Award,
    color: 'amber',
    credits: '55–60',
    bg: 'from-amber-500 to-orange-500',
    ring: 'ring-amber-500',
    textColor: 'text-amber-600 dark:text-amber-400',
    desc: 'Senior-level simulation',
    tag: 'Best',
  },
};

const TESTIMONIALS = [
  {
    name: 'Priya Sharma',
    role: 'SDE-2 at Swiggy',
    text: 'InterviewForge helped me crack Swiggy in 3 weeks. The adaptive questions felt just like the real thing — no memorized answers worked here.',
    stars: 5,
  },
  {
    name: 'Rahul Mehta',
    role: 'Data Engineer at PhonePe',
    text: 'The multi-dimensional feedback showed exactly where I was weak. I went from 5.2 to 8.1 overall in two weeks of practice.',
    stars: 5,
  },
  {
    name: 'Anjali Patel',
    role: 'Product Manager at Razorpay',
    text: "My recruiter told me I was the most interview-ready candidate they'd seen. I'd practiced 12 sessions on InterviewForge.",
    stars: 5,
  },
];

const FEATURES = [
  {
    icon: Brain,
    title: 'Adaptive AI Interviewer',
    desc: 'The interviewer shapes itself based on your answers — asking follow-ups when something is interesting, going deeper where you stumble.',
  },
  {
    icon: Layers,
    title: '6-Dimension Evaluation',
    desc: 'Scores across Technical, Communication, Leadership, Critical Thinking, Decision Making, and Project Knowledge.',
  },
  {
    icon: MessageSquare,
    title: 'Real Follow-Up Questions',
    desc: 'Not a rigid Q&A. The AI probes your answers naturally, just like a real senior interviewer would.',
  },
  {
    icon: TrendingUp,
    title: 'Progress Tracking',
    desc: 'Every session builds your public talent profile. Recruiters see your best scores across all 6 dimensions — live proof of your readiness.',
  },
  {
    icon: Building2,
    title: 'Get Hired — Not Just Prepared',
    desc: 'Companies browse InterviewForge\'s talent pool and reach out to top performers. Your score is your application — no cold applying needed.',
  },
  {
    icon: BookOpen,
    title: 'Personalised Roadmap',
    desc: 'After every interview, get a learning plan tailored to your weak areas — not generic advice.',
  },
];

const Home = ({ onStartInterview }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  // Read profile cache synchronously so state is correct on first render (no flicker)
  const [profileResumeText, setProfileResumeText] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cache_profile') || '{}').data?.resume_text || null; } catch { return null; }
  });
  const [profileResumeFilename, setProfileResumeFilename] = useState(() => {
    try {
      const d = JSON.parse(localStorage.getItem('cache_profile') || '{}').data || {};
      return d.resume_filename || (d.resume_text ? 'Profile resume' : null);
    } catch { return null; }
  });
  const [resumeFile, setResumeFile] = useState(null);
  const [role, setRole] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cache_profile') || '{}').data?.target_roles?.[0] || ''; } catch { return ''; }
  });
  const [jobDescription, setJobDescription] = useState('');
  const [planType, setPlanType] = useState('normal');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingSubmit, setPendingSubmit] = useState(null);
  const formRef = useRef(null);

  const scrollToForm = () => formRef.current?.scrollIntoView({ behavior: 'smooth' });

  // Refresh profile from server in background to pick up any changes
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch(`${API}/profile/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) return;
        localStorage.setItem('cache_profile', JSON.stringify({ data, ts: Date.now() }));
        if (data.resume_text) {
          setProfileResumeText(data.resume_text);
          setProfileResumeFilename(data.resume_filename || 'Profile resume');
        }
        if (data.target_roles?.length) {
          setRole(r => r || data.target_roles[0]);
        }
      })
      .catch(() => {});
  }, []); // eslint-disable-line

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file?.type === 'application/pdf') {
      setResumeFile(file);
      setError('');
    } else {
      setError('Please upload a PDF file');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
  });

  const startInterview = async (overrideUser) => {
    setIsLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

      let resume_text = profileResumeText;

      if (!resume_text) {
        // No profile resume — upload the file
        toast.info('Analysing your resume…');
        const formData = new FormData();
        formData.append('file', resumeFile);

        const uploadRes = await fetch(`${API}/interview/upload-resume`, {
          method: 'POST',
          headers: authHeaders,
          body: formData,
        });

        if (uploadRes.status === 401) { setShowAuthModal(true); return; }
        if (!uploadRes.ok) {
          const e = await uploadRes.json().catch(() => ({}));
          throw new Error(e.detail || 'Failed to process resume');
        }

        const parsed = await uploadRes.json();
        resume_text = parsed.resume_text;
        if (!resume_text) throw new Error('Failed to extract text from resume');
      }

      toast.success('Resume ready! Starting interview…');

      const startRes = await fetch(`${API}/interview/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({
          role: role.trim(),
          resume_text,
          plan_type: planType,
          job_description: jobDescription.trim() || null,
        }),
      });

      if (startRes.status === 402) {
        const e = await startRes.json().catch(() => ({}));
        throw new Error(e.detail || 'Insufficient credits. Please top up.');
      }
      if (startRes.status === 403) {
        const e = await startRes.json().catch(() => ({}));
        const inner = (e && e.detail && typeof e.detail === 'object') ? e.detail : null;
        const pct = inner?.completion ?? e?.completion;
        const msg = inner?.detail || e?.detail || 'Complete your profile first.';
        toast.error(
          pct != null
            ? `${msg} (${Math.round(pct)}% done) — opening your profile…`
            : `${msg} — opening your profile…`
        );
        navigate(inner?.redirect || '/profile');
        return;
      }
      if (startRes.status === 401) { setShowAuthModal(true); return; }
      if (!startRes.ok) {
        const e = await startRes.json().catch(() => ({}));
        throw new Error(e.detail || 'Failed to start interview');
      }

      const result = await startRes.json();

      onStartInterview({
        role: role.trim(),
        resume_text,
        plan_type: planType,
        thread_id: result.thread_id,
        session_id: result.session_id,
        firstMessage: result.message,
      });

      toast.success("Interview started! Let's go!");
      navigate('/interview');
    } catch (err) {
      setError(err.message || 'Failed to start interview. Please try again.');
      toast.error(err.message || 'Failed to start interview. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resumeFile && !profileResumeText) { setError('Please upload your resume (PDF)'); return; }
    if (!role.trim()) { setError('Please enter the target role'); return; }
    if (!user) {
      setPendingSubmit(true);
      setShowAuthModal(true);
      return;
    }
    await startInterview();
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    if (pendingSubmit) {
      setPendingSubmit(null);
      startInterview();
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <SEO
        title="InterviewForge – Practice Interviews, Get Hired by Top Companies"
        description="InterviewForge is the only platform where your practice scores become your job application. Top companies browse and hire directly from our talent pool. 20 free credits on signup."
      />

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-24 pb-20 px-4">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <Building2 className="w-4 h-4" />
            Your interview performance is your job application
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-slate-900 dark:text-white mb-6 leading-tight">
            Practice interviews &amp;<br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              get hired by top companies
            </span>
          </h1>

          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-6">
            InterviewForge is more than practice — it's your talent profile. Companies browse our top performers and reach out directly. <strong className="text-slate-800 dark:text-slate-200">Your scores become your resume.</strong>
          </p>

          {/* How it works — 3 steps */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10 text-sm">
            <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 shadow-sm">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">1</span>
              <span className="text-slate-700 dark:text-slate-300 font-medium">Practice with AI</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 hidden sm:block" />
            <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 shadow-sm">
              <span className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center">2</span>
              <span className="text-slate-700 dark:text-slate-300 font-medium">Build your talent profile</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 hidden sm:block" />
            <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 shadow-sm">
              <span className="w-6 h-6 rounded-full bg-green-600 text-white text-xs font-bold flex items-center justify-center">3</span>
              <span className="text-slate-700 dark:text-slate-300 font-medium">Companies hire you directly</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button
              onClick={scrollToForm}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-2xl text-lg hover:opacity-90 transition-all shadow-xl shadow-blue-500/25 flex items-center gap-2 justify-center"
            >
              Start Free Interview <ArrowRight className="w-5 h-5" />
            </button>
            <Link
              to="/pricing"
              className="px-8 py-4 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-2xl text-lg border border-slate-200 dark:border-slate-700 hover:border-blue-400 transition-all flex items-center gap-2 justify-center"
            >
              <CreditCard className="w-5 h-5" /> View Plans & Credits
            </Link>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 text-center">
            {[
              { val: '10,000+', label: 'Interviews done' },
              { val: '6', label: 'Dimensions evaluated' },
              { val: '3', label: 'AI models to choose from' },
              { val: '20', label: 'Free credits on signup' },
            ].map(s => (
              <div key={s.label}>
                <div className="text-3xl font-extrabold text-slate-900 dark:text-white">{s.val}</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Interview Form ─────────────────────────────────────────────── */}
      <section ref={formRef} id="start" className="py-16 px-4 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Start Your Interview</h2>
            <p className="text-slate-500 dark:text-slate-400">Upload your resume, pick a role and plan — the AI does the rest.</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 space-y-6 border border-slate-100 dark:border-slate-700">

            {/* Resume Upload */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Resume (PDF)</label>
              {!resumeFile && profileResumeText ? (
                <div className="border-2 border-green-400 bg-green-50 dark:bg-green-900/20 rounded-2xl p-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-7 h-7 text-green-500 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-green-700 dark:text-green-400">{profileResumeFilename}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">From your profile</p>
                    </div>
                  </div>
                  <div {...getRootProps()}>
                    <input {...getInputProps()} />
                    <button type="button" className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                      <Upload className="w-4 h-4" /> Use different
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                    isDragActive
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : resumeFile
                      ? 'border-green-400 bg-green-50 dark:bg-green-900/20'
                      : 'border-slate-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500'
                  }`}
                >
                  <input {...getInputProps()} />
                  {resumeFile ? (
                    <div className="flex items-center justify-center gap-3">
                      <CheckCircle className="w-8 h-8 text-green-500" />
                      <div>
                        <p className="font-semibold text-green-700 dark:text-green-400">{resumeFile.name}</p>
                        <p className="text-sm text-slate-500">Click to replace</p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                      <p className="font-medium text-slate-700 dark:text-slate-300">
                        {isDragActive ? 'Drop it here' : 'Drag & drop your resume, or click to browse'}
                      </p>
                      <p className="text-sm text-slate-500 mt-1">PDF only · max 10MB</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Target Role */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Target Role</label>
              <input
                type="text"
                value={role}
                onChange={e => setRole(e.target.value)}
                placeholder="e.g. Backend Engineer, Product Manager, Data Scientist"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
              <p className="text-xs text-slate-400 mt-1">The interview is based on your role + resume — no target company needed.</p>
            </div>

            {/* Optional JD */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Job Description <span className="font-normal text-slate-400">(optional)</span>
              </label>
              <textarea
                value={jobDescription}
                onChange={e => setJobDescription(e.target.value)}
                rows={3}
                placeholder="Paste a JD to make the interview more targeted…"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
              />
            </div>

            {/* Plan Selection */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Interview Plan</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {Object.entries(PLANS).map(([key, plan]) => {
                  const Icon = plan.icon;
                  const selected = planType === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setPlanType(key)}
                      className={`relative p-4 rounded-2xl border-2 text-left transition-all ${
                        selected
                          ? `border-${plan.color}-500 bg-${plan.color}-50 dark:bg-${plan.color}-900/20 ring-2 ${plan.ring}`
                          : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
                      }`}
                    >
                      {plan.tag && (
                        <span className={`absolute -top-2 -right-2 text-xs font-bold px-2 py-0.5 rounded-full bg-gradient-to-r ${plan.bg} text-white`}>
                          {plan.tag}
                        </span>
                      )}
                      <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${plan.bg} flex items-center justify-center mb-2`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="font-bold text-slate-900 dark:text-white">{plan.label}</div>
                      <div className={`text-xs font-medium ${plan.textColor} mb-1`}>{plan.model}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{plan.desc}</div>
                      <div className="text-xs text-slate-400 mt-1">{plan.credits} credits</div>
                    </button>
                  );
                })}
              </div>

              {/* Credit balance hint */}
              {user && (
                <p className="text-xs text-slate-400 mt-2">
                  Your balance: <span className="font-semibold text-slate-600 dark:text-slate-300">{user.credits ?? '–'} credits</span> ·{' '}
                  <Link to="/pricing" className="text-blue-500 hover:underline">Top up</Link>
                </p>
              )}
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-xl text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-2xl text-lg hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Preparing your interview…
                </>
              ) : (
                <>
                  <Brain className="w-5 h-5" /> Start Interview
                </>
              )}
            </button>

            {!user && (
              <p className="text-center text-sm text-slate-400">
                You'll be asked to sign in — new accounts get <span className="font-semibold text-blue-500">20 free credits</span>.
              </p>
            )}
          </form>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────────── */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Why InterviewForge works</h2>
            <p className="text-slate-500 dark:text-slate-400 text-lg max-w-xl mx-auto">
              We built the interview experience that actually mirrors what top companies do — not a quiz.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white mb-2">{f.title}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-20 px-4 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">How it works</h2>
          </div>
          <div className="space-y-6">
            {[
              { step: '01', title: 'Upload resume + pick role', desc: 'No target company needed. The AI creates a role-specific interview from your actual experience.' },
              { step: '02', title: 'Choose your plan', desc: 'Normal (GPT-4o) for daily practice, Thunder (Claude Sonnet) for deeper sessions, Max (Claude Opus) for the most realistic experience.' },
              { step: '03', title: 'Have a real conversation', desc: 'The AI interviews you naturally — asking follow-ups, probing answers, adapting to your level.' },
              { step: '04', title: 'Get scored across 6 dimensions', desc: 'See exactly where you excel and where to improve, with a personalised learning roadmap.' },
              { step: '05', title: 'Get discovered by recruiters', desc: 'Your performance profile is visible to verified companies searching for talent in your target roles.' },
            ].map((item, i) => (
              <div key={i} className="flex gap-6 items-start bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700">
                <div className="text-3xl font-extrabold text-blue-500/30 dark:text-blue-400/20 w-12 flex-shrink-0">{item.step}</div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white mb-1">{item.title}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── For Recruiters CTA ─────────────────────────────────────────── */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-blue-600 to-purple-700 rounded-3xl p-10 text-center text-white shadow-2xl">
          <Building2 className="w-12 h-12 mx-auto mb-4 opacity-80" />
          <h2 className="text-3xl font-bold mb-4">Hiring? Find pre-evaluated talent.</h2>
          <p className="text-blue-100 text-lg max-w-xl mx-auto mb-8">
            Our recruiter portal gives you access to candidates who've proven their skills through real AI interviews — with dimension scores, not just a CV.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/company/register"
              className="px-8 py-3 bg-white text-blue-700 font-bold rounded-xl hover:bg-blue-50 transition-colors"
            >
              Apply as a Recruiter
            </Link>
            <Link
              to="/company/login"
              className="px-8 py-3 border-2 border-white/50 text-white font-semibold rounded-xl hover:border-white transition-colors"
            >
              Sign In
            </Link>
          </div>
          <p className="text-blue-200 text-xs mt-4">Manual verification · Zero fake companies · No scam risk</p>
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white text-center mb-12">From the community</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
                <Quote className="w-6 h-6 text-blue-400 mb-3" />
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-4">"{t.text}"</p>
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(t.stars)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <div className="font-semibold text-slate-900 dark:text-white text-sm">{t.name}</div>
                <div className="text-xs text-slate-500">{t.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────────────── */}
      <section className="py-20 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <Sparkles className="w-10 h-10 text-blue-500 mx-auto mb-4" />
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Your next job starts with one interview.</h2>
          <p className="text-slate-500 dark:text-slate-400 text-lg mb-8">Sign up free, get 20 credits, and start practising in under 60 seconds.</p>
          <button
            onClick={scrollToForm}
            className="px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-2xl text-lg hover:opacity-90 transition-all shadow-xl shadow-blue-500/25 inline-flex items-center gap-2"
          >
            Start for Free <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => { setShowAuthModal(false); setPendingSubmit(null); }}
          onSuccess={handleAuthSuccess}
        />
      )}
    </div>
  );
};

export default Home;
