import React, { useState, useEffect } from 'react';
import { Building2, Search, Filter, User, Briefcase, Star, ArrowRight, CheckCircle, Lock, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const API = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// ── Company Login ────────────────────────────────────────────────────────────

const CompanyLogin = ({ onLogin }) => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/company/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Login failed');
      localStorage.setItem('company_token', data.access_token);
      onLogin(data.company);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 border border-slate-100 dark:border-slate-700">
        <div className="text-center mb-8">
          <Building2 className="w-12 h-12 text-blue-500 mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Recruiter Portal</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Sign in to find pre-evaluated talent</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 block">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 block">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {error && <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-all"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 text-center">
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-3">Don't have an account?</p>
          <Link to="/company/register" className="text-blue-500 hover:underline text-sm font-medium">
            Apply for recruiter access →
          </Link>
        </div>
      </div>
    </div>
  );
};

// ── Company Registration ──────────────────────────────────────────────────────

export const CompanyRegister = () => {
  const [form, setForm] = useState({ name: '', industry: '', website: '', contact_name: '', contact_email: '', password: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/company/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Registration failed');
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-md w-full text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Application Submitted!</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">Our team will review your application and contact you within 24 hours. We manually verify all companies to ensure a safe platform.</p>
          <Link to="/" className="text-blue-500 hover:underline">← Back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-16 px-4">
      <div className="max-w-xl w-full mx-auto bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 border border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-3 py-1.5 rounded-full text-xs font-medium mb-6 w-fit">
          <Lock className="w-3 h-3" /> Manual verification required
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Apply for Recruiter Access</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">We manually verify all companies to prevent scams. Your account will be activated within 24 hours after review.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { key: 'name', label: 'Company Name', ph: 'Acme Corp', required: true },
            { key: 'industry', label: 'Industry', ph: 'Technology / Finance / etc.', required: false },
            { key: 'website', label: 'Company Website', ph: 'https://acme.com', required: false },
            { key: 'contact_name', label: 'Your Full Name', ph: 'John Smith', required: true },
            { key: 'contact_email', label: 'Work Email', ph: 'john@acme.com', required: true },
            { key: 'password', label: 'Password', ph: 'Min 8 characters', required: true, type: 'password' },
          ].map(({ key, label, ph, required, type }) => (
            <div key={key}>
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 block">{label}</label>
              <input
                type={type || 'text'}
                value={form[key]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                placeholder={ph}
                required={required}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          ))}
          <div>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 block">About Your Company <span className="font-normal text-slate-400">(optional)</span></label>
            <textarea rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Tell us about your company and hiring needs…" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none" />
          </div>

          {error && <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm">{error}</div>}

          <button type="submit" disabled={loading} className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-all">
            {loading ? 'Submitting…' : 'Submit Application'}
          </button>
        </form>
      </div>
    </div>
  );
};

// ── Candidate Search Dashboard ────────────────────────────────────────────────

const CandidateSearch = ({ company, onLogout }) => {
  const [filters, setFilters] = useState({ role: '', skills: '', min_experience: '', max_experience: '', location: '' });
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selected, setSelected] = useState(null);

  const search = async () => {
    setLoading(true);
    setSearched(true);
    try {
      const token = localStorage.getItem('company_token');
      const params = new URLSearchParams();
      if (filters.role) params.set('role', filters.role);
      if (filters.skills) params.set('skills', filters.skills);
      if (filters.min_experience) params.set('min_experience', filters.min_experience);
      if (filters.max_experience) params.set('max_experience', filters.max_experience);
      if (filters.location) params.set('location', filters.location);
      params.set('limit', '20');

      const res = await fetch(`${API}/company/search/candidates?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setCandidates(data.candidates || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const viewDetail = async (userId) => {
    try {
      const token = localStorage.getItem('company_token');
      const res = await fetch(`${API}/company/candidate/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSelected(data);
    } catch (e) {
      alert('Failed to load candidate detail');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Top bar */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Building2 className="w-6 h-6 text-blue-500" />
          <div>
            <div className="font-bold text-slate-900 dark:text-white">{company.name}</div>
            <div className="text-xs text-slate-500">{company.contact_email}</div>
          </div>
        </div>
        <button onClick={onLogout} className="flex items-center gap-2 text-sm text-slate-500 hover:text-red-500">
          <LogOut className="w-4 h-4" /> Sign out
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Find Candidates</h1>

        {/* Filters */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {[
              { key: 'role', label: 'Target Role', ph: 'Backend Engineer' },
              { key: 'skills', label: 'Skills (comma-separated)', ph: 'Python, React, SQL' },
              { key: 'location', label: 'Location', ph: 'Bangalore' },
              { key: 'min_experience', label: 'Min Experience (yrs)', ph: '2' },
              { key: 'max_experience', label: 'Max Experience (yrs)', ph: '5' },
            ].map(({ key, label, ph }) => (
              <div key={key}>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">{label}</label>
                <input
                  value={filters[key]}
                  onChange={e => setFilters(f => ({ ...f, [key]: e.target.value }))}
                  placeholder={ph}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
          </div>
          <button
            onClick={search}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50"
          >
            <Search className="w-4 h-4" /> {loading ? 'Searching…' : 'Search Candidates'}
          </button>
        </div>

        {/* Results */}
        {searched && (
          candidates.length === 0 ? (
            <div className="text-center py-12 text-slate-400">No candidates matched your filters.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {candidates.map((c, i) => (
                <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">{c.full_name}</div>
                      <div className="text-sm text-slate-500">{c.headline}</div>
                    </div>
                    <div className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-lg font-medium">
                      {c.experience_years}y exp
                    </div>
                  </div>
                  {c.target_roles?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {c.target_roles.slice(0, 3).map((r, j) => (
                        <span key={j} className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full">{r}</span>
                      ))}
                    </div>
                  )}
                  {c.skills?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {c.skills.slice(0, 6).map((s, j) => (
                        <span key={j} className="text-xs bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">{s}</span>
                      ))}
                    </div>
                  )}
                  <div className="text-xs text-slate-400 mb-3">{c.location}</div>
                  <button
                    onClick={() => viewDetail(c.user_id)}
                    className="w-full flex items-center justify-center gap-2 py-2 text-sm font-semibold text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-700 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                  >
                    View Full Profile <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div
            className="bg-white dark:bg-slate-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{selected.full_name}</h2>
                <p className="text-slate-500 text-sm">{selected.headline}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-700 text-2xl leading-none">&times;</button>
            </div>

            {selected.bio && <p className="text-slate-600 dark:text-slate-300 text-sm mb-6">{selected.bio}</p>}

            {selected.interview_performance?.length > 0 && (
              <div className="mb-6">
                <h3 className="font-bold text-slate-900 dark:text-white mb-3">Interview Performance</h3>
                <div className="space-y-3">
                  {selected.interview_performance.slice(0, 5).map((p, i) => (
                    <div key={i} className="bg-slate-50 dark:bg-slate-700 rounded-xl p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-slate-900 dark:text-white text-sm">{p.role}</span>
                        <span className="text-sm font-bold text-blue-600">{p.average_score?.toFixed(1)}/10</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs text-slate-500 dark:text-slate-400">
                        {p.score_technical != null && <span>Technical: {p.score_technical?.toFixed(1)}</span>}
                        {p.score_communication != null && <span>Comm: {p.score_communication?.toFixed(1)}</span>}
                        {p.score_leadership != null && <span>Leadership: {p.score_leadership?.toFixed(1)}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              {selected.linkedin_url && <a href={selected.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 text-sm hover:underline">LinkedIn →</a>}
              {selected.github_url && <a href={selected.github_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 text-sm hover:underline">GitHub →</a>}
              {selected.portfolio_url && <a href={selected.portfolio_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 text-sm hover:underline">Portfolio →</a>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Main export ─────────────────────────────────────────────────────────────

const CompanyPortal = () => {
  const [company, setCompany] = useState(() => {
    const token = localStorage.getItem('company_token');
    return token ? JSON.parse(localStorage.getItem('company_info') || 'null') : null;
  });

  const handleLogin = (companyData) => {
    localStorage.setItem('company_info', JSON.stringify(companyData));
    setCompany(companyData);
  };

  const handleLogout = () => {
    localStorage.removeItem('company_token');
    localStorage.removeItem('company_info');
    setCompany(null);
  };

  if (!company) return <CompanyLogin onLogin={handleLogin} />;
  return <CandidateSearch company={company} onLogout={handleLogout} />;
};

export default CompanyPortal;
