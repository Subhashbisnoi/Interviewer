import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Volume2, PhoneOff, Mic, MicOff, Video, VideoOff, Send } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import RoboInterviewer from './interview/RoboInterviewer';
import { invalidateDashboardCache } from '../services/interview';

const API = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const PLAN_META = {
  normal:  { label: 'Normal',  gradient: 'from-blue-500 to-cyan-500',   glow: 'rgba(59,130,246,0.35)' },
  thunder: { label: 'Thunder ⚡', gradient: 'from-violet-500 to-purple-600', glow: 'rgba(139,92,246,0.35)' },
  max:     { label: 'Max 🏆',  gradient: 'from-amber-400 to-orange-500', glow: 'rgba(251,191,36,0.35)' },
};

// Elapsed timer
const Timer = ({ startTime }) => {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000);
    return () => clearInterval(id);
  }, [startTime]);
  const m = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const s = String(elapsed % 60).padStart(2, '0');
  return <span className="font-mono tabular-nums">{m}:{s}</span>;
};

// Dimension score bar
const ScoreBar = ({ label, value }) => {
  const pct = Math.round((value / 10) * 100);
  const color = value >= 7 ? '#22c55e' : value >= 5 ? '#f59e0b' : '#ef4444';
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="text-slate-300">{label}</span>
        <span className="font-bold text-white">{value?.toFixed(1)}<span className="text-slate-500 font-normal">/10</span></span>
      </div>
      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: color, boxShadow: `0 0 8px ${color}88` }}
        />
      </div>
    </div>
  );
};

export default function Interview({ interviewData }) {
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const roboRef = useRef(null);
  const textareaRef = useRef(null);
  const startTimeRef = useRef(Date.now());

  const [currentQuestion, setCurrentQuestion] = useState(interviewData?.firstMessage || '');
  const [messageType, setMessageType] = useState('question');
  const [answer, setAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [completed, setCompleted] = useState(false);
  const [result, setResult] = useState(null);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);

  const plan = PLAN_META[interviewData?.plan_type] || PLAN_META.normal;

  // Auto-play first question
  useEffect(() => {
    if (interviewData?.firstMessage) {
      const t = setTimeout(() => roboRef.current?.playQuestion(interviewData.firstMessage), 700);
      return () => clearTimeout(t);
    }
  }, [interviewData?.firstMessage]);

  const submitAnswer = async () => {
    if (!answer.trim() || isSubmitting) return;
    setError('');
    setIsSubmitting(true);
    const sent = answer.trim();
    setAnswer('');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/interview/answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ thread_id: interviewData.thread_id, answer: sent }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Something went wrong');

      if (data.action === 'completed') {
        setCurrentQuestion(data.message);
        setMessageType('closing');
        setResult(data);
        setCompleted(true);
        invalidateDashboardCache();
        roboRef.current?.playQuestion(data.message);
        toast.success('Interview complete!');
      } else {
        const type = data.action === 'ask_followup' ? 'follow_up' : 'question';
        setCurrentQuestion(data.message);
        setMessageType(type);
        roboRef.current?.playQuestion(data.message);
        textareaRef.current?.focus();
      }
    } catch (err) {
      setError(err.message || 'Failed to submit');
      toast.error(err.message || 'Failed to submit answer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); submitAnswer(); }
  };

  // ── Results screen ──────────────────────────────────────────────────────────
  if (completed && result) {
    const overall = result.scores?.overall;
    const scoreColor = overall >= 7 ? '#22c55e' : overall >= 5 ? '#f59e0b' : '#ef4444';

    return (
      <div className="min-h-screen flex items-center justify-center p-4"
        style={{ background: 'radial-gradient(ellipse at top, #0f172a 0%, #020617 100%)' }}>
        <div className="w-full max-w-xl rounded-3xl overflow-hidden border border-white/8 shadow-2xl"
          style={{ background: 'rgba(15,23,42,0.95)', backdropFilter: 'blur(24px)' }}>

          {/* Header */}
          <div className="px-6 py-5 flex items-center gap-4 border-b border-white/8"
            style={{ background: 'linear-gradient(135deg, rgba(30,58,138,0.5) 0%, rgba(88,28,135,0.5) 100%)' }}>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-green-500/20 border border-green-500/30">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="font-bold text-white text-lg leading-tight">Interview Complete</p>
              <p className="text-slate-400 text-sm">{interviewData?.role} · {plan.label}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-xs text-slate-500 uppercase tracking-wider">Score</p>
              <p className="text-3xl font-black" style={{ color: scoreColor }}>
                {overall?.toFixed(1)}<span className="text-sm text-slate-400 font-normal">/10</span>
              </p>
            </div>
          </div>

          <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">

            {/* Dimension bars */}
            <div className="space-y-3 p-4 rounded-2xl border border-white/6"
              style={{ background: 'rgba(255,255,255,0.03)' }}>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Dimension Scores</p>
              {[
                ['Technical',        result.scores?.technical],
                ['Communication',    result.scores?.communication],
                ['Leadership',       result.scores?.leadership],
                ['Critical Thinking',result.scores?.critical_thinking],
                ['Decision Making',  result.scores?.decision_making],
                ['Project Knowledge',result.scores?.project_knowledge],
              ].filter(([, v]) => v != null).map(([label, value]) => (
                <ScoreBar key={label} label={label} value={value} />
              ))}
            </div>

            {/* Strengths */}
            {result.strengths?.length > 0 && (
              <div className="p-4 rounded-2xl border border-green-500/20"
                style={{ background: 'rgba(34,197,94,0.06)' }}>
                <p className="text-xs font-bold text-green-400 uppercase tracking-widest mb-3">Strengths</p>
                <ul className="space-y-2">
                  {result.strengths.map((s, i) => (
                    <li key={i} className="text-sm text-slate-300 flex items-start gap-2.5">
                      <span className="text-green-400 mt-0.5 flex-shrink-0 text-base leading-none">✓</span>{s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Weak areas */}
            {result.weak_areas?.length > 0 && (
              <div className="p-4 rounded-2xl border border-amber-500/20"
                style={{ background: 'rgba(245,158,11,0.06)' }}>
                <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-3">Areas to Improve</p>
                <ul className="space-y-2">
                  {result.weak_areas.map((w, i) => (
                    <li key={i} className="text-sm text-slate-300 flex items-start gap-2.5">
                      <span className="text-amber-400 mt-0.5 flex-shrink-0">→</span>{w}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Roadmap */}
            {result.roadmap && (
              <div className="p-4 rounded-2xl border border-blue-500/20"
                style={{ background: 'rgba(59,130,246,0.06)' }}>
                <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">Learning Roadmap</p>
                <p className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">{result.roadmap}</p>
              </div>
            )}

            {result.credits_used && (
              <p className="text-center text-xs text-slate-600">
                {result.credits_used} credits used · {result.credits_remaining ?? '–'} remaining
              </p>
            )}

            <button onClick={() => navigate('/')}
              className={`w-full py-3.5 bg-gradient-to-r ${plan.gradient} text-white font-bold rounded-2xl hover:opacity-90 active:scale-[0.98] transition-all shadow-lg`}>
              Start Another Interview
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Meeting UI ──────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex flex-col"
      style={{ background: 'radial-gradient(ellipse at top left, #0d1526 0%, #020617 100%)' }}>

      {/* ── Top bar ── */}
      <div className="flex-shrink-0 flex items-center justify-between px-5 py-3 border-b border-white/6"
        style={{ background: 'rgba(10,14,26,0.9)', backdropFilter: 'blur(16px)' }}>

        <div className="flex items-center gap-3">
          {/* Animated live dot */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-red-500/30 bg-red-500/10">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
            <span className="text-xs font-semibold text-red-400 tracking-wider">LIVE</span>
          </div>

          <div className="w-px h-5 bg-white/10" />

          <div>
            <p className="text-white font-semibold text-sm leading-tight">{interviewData?.role || 'Interview'}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`text-xs font-semibold bg-gradient-to-r ${plan.gradient} bg-clip-text text-transparent`}>
                {plan.label}
              </span>
              {messageType === 'follow_up' && (
                <>
                  <span className="text-white/20">·</span>
                  <span className="text-xs text-violet-400 font-medium">Follow-up</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-sm text-slate-400 flex items-center gap-2">
            <span className="text-slate-600">⏱</span>
            <Timer startTime={startTimeRef.current} />
          </div>
          <button
            onClick={() => { if (window.confirm('End this interview?')) navigate('/'); }}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/15 border border-red-500/30 text-red-400 text-sm font-semibold rounded-xl hover:bg-red-500/25 transition-all"
          >
            <PhoneOff className="w-4 h-4" /> End Interview
          </button>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">

        {/* ── Left: Video tiles ── */}
        <div className="flex-1 p-3 min-h-0 min-w-0" style={{ display: 'flex', flexDirection: 'column' }}>
          <RoboInterviewer
            ref={roboRef}
            questionText={currentQuestion}
            onRequestNextQuestion={() => {}}
            isInterviewActive={!isSubmitting}
          />
        </div>

        {/* ── Right: Question + Answer panel ── */}
        <div className="w-full lg:w-96 flex flex-col border-t lg:border-t-0 lg:border-l border-white/6 flex-shrink-0"
          style={{ background: 'rgba(10,14,26,0.7)', backdropFilter: 'blur(12px)' }}>

          {/* Panel header */}
          <div className="px-4 py-3 border-b border-white/6">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Current Question</p>
          </div>

          {/* Question card */}
          <div className="px-4 pt-4 pb-2">
            <div className="relative p-4 rounded-2xl border border-white/8 overflow-hidden"
              style={{ background: 'linear-gradient(135deg, rgba(30,58,138,0.3) 0%, rgba(15,23,42,0.5) 100%)' }}>
              {/* Decorative glow */}
              <div className="absolute top-0 right-0 w-24 h-24 rounded-full pointer-events-none"
                style={{ background: plan.glow, filter: 'blur(32px)', transform: 'translate(30%, -30%)' }} />

              <div className="flex items-start gap-3 relative">
                <div className={`flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center text-white text-xs font-bold shadow-lg`}>
                  {messageType === 'follow_up' ? '↩' : 'Q'}
                </div>
                <p className="text-slate-100 text-sm leading-relaxed flex-1">{currentQuestion}</p>
              </div>

              <button
                onClick={() => roboRef.current?.playQuestion(currentQuestion)}
                className="mt-3 ml-11 flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
              >
                <Volume2 className="w-3.5 h-3.5" /> Listen again
              </button>
            </div>
          </div>

          {/* Answer area */}
          <div className="flex-1 flex flex-col px-4 pb-4 pt-2 min-h-0">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 mt-2">Your Answer</p>

            <div className="flex-1 relative rounded-2xl border border-white/8 overflow-hidden transition-all focus-within:border-blue-500/50"
              style={{ background: 'rgba(255,255,255,0.03)' }}>
              <textarea
                ref={textareaRef}
                value={answer}
                onChange={e => setAnswer(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Type your answer here…"
                disabled={isSubmitting}
                className="absolute inset-0 w-full h-full px-4 py-3 bg-transparent text-slate-100 placeholder-slate-600 text-sm resize-none outline-none leading-relaxed"
              />
            </div>

            {error && (
              <div className="mt-2 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">{error}</div>
            )}

            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs text-slate-600 flex-1">Ctrl+Enter to send</span>
              <button
                onClick={submitAnswer}
                disabled={isSubmitting || !answer.trim()}
                className={`flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r ${plan.gradient} text-white text-sm font-bold rounded-xl disabled:opacity-40 hover:opacity-90 active:scale-[0.97] transition-all shadow-lg`}
                style={{ boxShadow: answer.trim() && !isSubmitting ? `0 0 20px ${plan.glow}` : 'none' }}
              >
                {isSubmitting ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Thinking…</>
                ) : (
                  <><Send className="w-4 h-4" /> Submit</>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom controls ── */}
      <div className="flex-shrink-0 flex items-center justify-center gap-3 py-3 border-t border-white/6"
        style={{ background: 'rgba(10,14,26,0.9)', backdropFilter: 'blur(16px)' }}>

        {[
          {
            icon: micOn ? Mic : MicOff,
            label: micOn ? 'Mute' : 'Unmuted',
            active: micOn,
            onClick: () => setMicOn(v => !v),
          },
          {
            icon: camOn ? Video : VideoOff,
            label: camOn ? 'Stop Video' : 'Start Video',
            active: camOn,
            onClick: () => setCamOn(v => !v),
          },
        ].map(({ icon: Icon, label, active, onClick }) => (
          <button key={label} onClick={onClick}
            className={`flex flex-col items-center gap-1 px-5 py-2 rounded-xl transition-all ${
              active
                ? 'bg-white/6 hover:bg-white/10 text-white'
                : 'bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/25'
            }`}>
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-medium opacity-70">{label}</span>
          </button>
        ))}

        <button
          onClick={() => roboRef.current?.playQuestion(currentQuestion)}
          className="flex flex-col items-center gap-1 px-5 py-2 rounded-xl bg-white/6 hover:bg-white/10 text-white transition-all"
        >
          <Volume2 className="w-5 h-5" />
          <span className="text-[10px] font-medium opacity-70">Replay</span>
        </button>

        <div className="w-px h-8 bg-white/10 mx-1" />

        <button
          onClick={() => { if (window.confirm('End this interview?')) navigate('/'); }}
          className="flex flex-col items-center gap-1 px-5 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white transition-all shadow-lg"
          style={{ boxShadow: '0 0 20px rgba(239,68,68,0.3)' }}
        >
          <PhoneOff className="w-5 h-5" />
          <span className="text-[10px] font-medium">End Call</span>
        </button>
      </div>
    </div>
  );
}
