import React, { useState, useMemo } from 'react';
import { ChevronDown, Search, Mail, Zap, Brain, CreditCard, User, Building2, BarChart3, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

const CATEGORIES = [
  {
    id: 'getting-started',
    label: 'Getting Started',
    icon: Zap,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    faqs: [
      {
        q: 'How do I start my first interview?',
        a: 'Go to your Profile page and complete at least 60% of your profile — upload your resume, set your target role, add your skills and bio. Once you hit 60%, head to the Home page, your resume and target role will be pre-filled. Pick a plan and hit Start Interview.',
      },
      {
        q: 'Why do I need to complete 60% of my profile first?',
        a: 'Your profile is what the AI uses to tailor the interview to you. Without your resume, target role, and experience, the interviewer can\'t ask relevant questions. A complete profile also makes you discoverable to companies looking to hire.',
      },
      {
        q: 'What should I upload as my resume?',
        a: 'Upload a text-based PDF (not a scanned image). The AI reads your resume to understand your experience, projects, and skills. A well-formatted, text-based PDF gives the best results.',
      },
    ],
  },
  {
    id: 'interview',
    label: 'Interviews',
    icon: Brain,
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-100 dark:bg-purple-900/30',
    faqs: [
      {
        q: 'How are the questions generated?',
        a: 'The AI reads your resume, target role, and job description (if provided), then crafts questions tailored to your background. It asks follow-ups based on your answers — going deeper when you\'re strong, probing where you\'re vague. No two sessions are the same.',
      },
      {
        q: 'What are the three interview plans?',
        a: 'Normal (GPT-4o, 13–17 credits) is great for regular daily practice. Thunder (Claude Sonnet 4.5, 33–39 credits) gives deep, nuanced evaluation with sharper follow-ups. Max (Claude Opus 4.7, 55–60 credits) is the most realistic senior-level simulation — closest to a real FAANG-style interview.',
      },
      {
        q: 'How am I scored across 6 dimensions?',
        a: 'After each interview the AI evaluates you on: Technical depth, Communication clarity, Leadership signals, Critical Thinking, Decision Making, and Project Knowledge. Each is scored 0–10. Your Dashboard tracks trends across all six over time.',
      },
      {
        q: 'Can I retake the same interview?',
        a: 'Yes — and you should. Each session generates fresh questions even for the same role. Practicing the same role multiple times is how you build consistency. Your Dashboard will show whether your scores are improving across sessions.',
      },
      {
        q: 'Can I add a Job Description?',
        a: 'Yes. On the interview start form there\'s an optional Job Description field. Paste the JD and the AI will tailor questions specifically to that role\'s requirements — extremely useful when preparing for a specific company or opening.',
      },
    ],
  },
  {
    id: 'profile-scoring',
    label: 'Profile & Scores',
    icon: User,
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-100 dark:bg-emerald-900/30',
    faqs: [
      {
        q: 'What is the Profile Score and how is it calculated?',
        a: 'Your profile is scored out of 10 across three signals: Resume (50% weight) — evaluates experience depth, project complexity, leadership signals, and problem-solving evidence. GitHub (25%) — activity, repo variety, maintenance. LinkedIn (25%) — profile completeness and professional presence. The overall score is a weighted average of these three.',
      },
      {
        q: 'Why does scoring cost credits?',
        a: 'Scoring uses an AI model to analyse your resume, GitHub activity, and LinkedIn profile in depth. Resume scoring costs 3 credits, GitHub and LinkedIn each cost 2, and regenerating the overall score costs 1. Credits are only deducted on success — if something fails you\'re automatically refunded.',
      },
      {
        q: 'Can I re-upload my resume to get a new score?',
        a: 'Yes. On your Profile page, the Resume card has a "Re-upload" option. Once you upload a new PDF, your old resume score is cleared and you can score again to see how your updated resume performs.',
      },
      {
        q: 'What is the Activity Heatmap?',
        a: 'It\'s a GitHub-style grid showing every day you completed at least one interview over the past year. The darker the cell, the more sessions you did that day. It\'s there to build a daily practice habit — consistency matters more than intensity.',
      },
      {
        q: 'What is the streak counter?',
        a: 'Your streak counts consecutive days on which you completed at least one interview. It resets if you miss a day. Think of it like a fitness tracker — short daily sessions compound faster than occasional marathon sessions.',
      },
    ],
  },
  {
    id: 'credits',
    label: 'Credits & Pricing',
    icon: CreditCard,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    faqs: [
      {
        q: 'How does the credit system work?',
        a: 'InterviewForge is pay-as-you-go — no subscriptions, no monthly fees. New accounts get 20 free credits. Credits are spent when you start an interview (cost varies by plan and session length) or when you run AI scoring on your profile. Unused credits never expire.',
      },
      {
        q: 'How many credits does an interview cost?',
        a: 'Normal plan: 13–17 credits. Thunder plan: 33–39 credits. Max plan: 55–60 credits. The range exists because cost scales with session length — longer, deeper conversations use more tokens. Credit balance is shown in real time in the sidebar.',
      },
      {
        q: 'Why is my balance showing 0 even though I bought credits?',
        a: 'This is usually a stale cache issue. Open browser console and run: localStorage.removeItem(\'cached_user\'); location.reload() — this forces a fresh fetch of your account from the server.',
      },
      {
        q: 'Can I get a refund?',
        a: 'Unused credits can be refunded within 7 days of purchase. Contact us at support@interviewforge.live with your purchase details.',
      },
    ],
  },
  {
    id: 'hiring',
    label: 'Getting Hired',
    icon: Building2,
    color: 'text-rose-600 dark:text-rose-400',
    bg: 'bg-rose-100 dark:bg-rose-900/30',
    faqs: [
      {
        q: 'How do companies find me on InterviewForge?',
        a: 'Companies with verified accounts can browse our talent pool — they filter by role, score, skills, and experience. If your profile is set to "Visible to Recruiters" and your scores are strong, you\'ll appear in their search results. They reach out to you directly — no cold applying needed.',
      },
      {
        q: 'What makes a profile attractive to companies?',
        a: 'High interview scores (especially consistency, not just a single peak), a complete profile (bio, skills, target roles, LinkedIn, GitHub), a strong resume score, and an active heatmap. Companies are looking for candidates who practice seriously and show steady improvement.',
      },
      {
        q: 'Can I hide my profile from companies?',
        a: 'Yes. On your Profile page, toggle "Visible to Recruiters" off. Your scores and activity will still be tracked for your own progress — they just won\'t appear in company searches.',
      },
    ],
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: BarChart3,
    color: 'text-indigo-600 dark:text-indigo-400',
    bg: 'bg-indigo-100 dark:bg-indigo-900/30',
    faqs: [
      {
        q: 'What is Consistency and why does it matter?',
        a: 'Consistency measures how stable your scores are across your last 5 sessions (lower variance = higher consistency). A high average with low consistency means you\'re unpredictable — great one day, bad the next. Companies and real interviewers want consistency. Aim for both a high average AND high consistency.',
      },
      {
        q: 'What do the trend arrows on KPI cards mean?',
        a: 'Each arrow compares your average on that dimension in your last 3 sessions vs the 3 before that. A green ↑ means you\'re actively improving in that area. A red ↓ means recent regression. This is more useful than your all-time average because it shows your current trajectory.',
      },
      {
        q: 'What is the Skill Radar?',
        a: 'The radar chart shows your average score across all 6 dimensions at a glance. A balanced, large hexagon is the goal. A lopsided shape immediately tells you which dimensions are dragging down your overall score — focus your next sessions there.',
      },
    ],
  },
  {
    id: 'privacy',
    label: 'Privacy & Security',
    icon: Shield,
    color: 'text-slate-600 dark:text-slate-400',
    bg: 'bg-slate-100 dark:bg-slate-700',
    faqs: [
      {
        q: 'Is my resume stored securely?',
        a: 'Yes. Your resume text is stored encrypted and is only used to generate interview questions and score your profile. It is never sold or shared with third parties. You can delete your account and all associated data at any time by contacting support.',
      },
      {
        q: 'Are my interview recordings stored?',
        a: 'InterviewForge does not record audio or video. Your answers are processed as text in real time. We store your text responses and scores so you can review feedback, but no audio/video is retained.',
      },
    ],
  },
];

const Help = () => {
  const [search, setSearch] = useState('');
  const [openId, setOpenId] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return activeCategory
      ? CATEGORIES.filter(c => c.id === activeCategory)
      : CATEGORIES;

    return CATEGORIES.map(cat => ({
      ...cat,
      faqs: cat.faqs.filter(f =>
        f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q)
      ),
    })).filter(cat => cat.faqs.length > 0);
  }, [search, activeCategory]);

  const totalResults = filtered.reduce((a, c) => a + c.faqs.length, 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-3">Help Center</h1>
          <p className="text-slate-500 dark:text-slate-400">Everything you need to know about InterviewForge</p>
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search questions…"
            value={search}
            onChange={e => { setSearch(e.target.value); setActiveCategory(null); }}
            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none shadow-sm"
          />
        </div>

        {/* Category pills */}
        {!search && (
          <div className="flex flex-wrap gap-2 mb-8">
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                !activeCategory
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-blue-400'
              }`}
            >
              All
            </button>
            {CATEGORIES.map(cat => {
              const Icon = cat.icon;
              const active = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(active ? null : cat.id)}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                    active
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-blue-400'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {cat.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Results count when searching */}
        {search && (
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            {totalResults} result{totalResults !== 1 ? 's' : ''} for "{search}"
          </p>
        )}

        {/* FAQ sections */}
        <div className="space-y-8">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-slate-400 dark:text-slate-500">
              <Search className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="font-medium">No results found</p>
              <p className="text-sm mt-1">Try different keywords or browse a category</p>
            </div>
          ) : filtered.map(cat => {
            const Icon = cat.icon;
            return (
              <div key={cat.id}>
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${cat.bg}`}>
                    <Icon className={`w-4 h-4 ${cat.color}`} />
                  </div>
                  <h2 className="font-bold text-slate-800 dark:text-slate-100">{cat.label}</h2>
                </div>
                <div className="space-y-2">
                  {cat.faqs.map((faq, i) => {
                    const id = `${cat.id}-${i}`;
                    const open = openId === id;
                    return (
                      <div key={i}
                        className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden shadow-sm">
                        <button
                          onClick={() => setOpenId(open ? null : id)}
                          className="w-full px-5 py-4 flex justify-between items-center text-left hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors gap-4"
                        >
                          <span className="font-semibold text-slate-800 dark:text-white text-sm">{faq.q}</span>
                          <ChevronDown className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
                        </button>
                        {open && (
                          <div className="px-5 pb-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-700 pt-3">
                            {faq.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Contact */}
        <div className="mt-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center">
          <h2 className="text-xl font-bold mb-2">Still have questions?</h2>
          <p className="text-sm text-blue-100 mb-6">Can't find what you're looking for? We're here.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="mailto:support@interviewforge.live"
              className="flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 transition-colors px-6 py-3 rounded-xl font-semibold text-sm"
            >
              <Mail className="w-4 h-4" /> support@interviewforge.live
            </a>
            <Link
              to="/pricing"
              className="flex items-center justify-center gap-2 bg-white text-blue-700 hover:bg-blue-50 transition-colors px-6 py-3 rounded-xl font-semibold text-sm"
            >
              View Plans & Credits
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Help;
