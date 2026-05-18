import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';
import { Link } from 'react-router-dom';
import {
  Lock, Moon, Sun, Eye, EyeOff, Save, CreditCard,
  Trash2, LogOut, ChevronRight, Shield, User,
} from 'lucide-react';

const API = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// ── reusable primitives ──────────────────────────────────────────────────────

const SectionHeader = ({ title, desc }) => (
  <div className="mb-6">
    <h2 className="text-base font-bold text-slate-900 dark:text-white">{title}</h2>
    {desc && <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{desc}</p>}
  </div>
);

const Row = ({ label, desc, children, danger }) => (
  <div className={`flex items-center justify-between py-4 border-b border-slate-100 dark:border-slate-700/60 last:border-0 ${danger ? 'opacity-90' : ''}`}>
    <div className="flex-1 min-w-0 pr-6">
      <div className={`text-sm font-semibold ${danger ? 'text-red-600 dark:text-red-400' : 'text-slate-800 dark:text-slate-200'}`}>{label}</div>
      {desc && <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{desc}</div>}
    </div>
    <div className="flex-shrink-0">{children}</div>
  </div>
);

const Toggle = ({ checked, onChange }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${checked ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-600'}`}
  >
    <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
  </button>
);

const Card = ({ children, className = '' }) => (
  <div className={`bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm px-6 py-2 ${className}`}>
    {children}
  </div>
);

const Input = ({ label, ...props }) => (
  <div>
    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">{label}</label>
    <input
      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-slate-50 dark:disabled:bg-slate-700/50 disabled:text-slate-400 disabled:cursor-not-allowed"
      {...props}
    />
  </div>
);

const Btn = ({ children, loading, danger, outline, className = '', ...props }) => (
  <button
    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50
      ${danger
        ? outline
          ? 'border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
          : 'bg-red-600 hover:bg-red-700 text-white'
        : outline
          ? 'border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
          : 'bg-blue-600 hover:bg-blue-700 text-white'
      } ${className}`}
    disabled={loading}
    {...props}
  >
    {children}
  </button>
);

// ── main ─────────────────────────────────────────────────────────────────────

const Settings = () => {
  const { user, logout, refreshUser } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const toast = useToast();

  // ── Account section ──────────────────────────────────────────────────────
  const [name, setName] = useState(user?.full_name || '');
  const [savingName, setSavingName] = useState(false);

  const saveName = async () => {
    if (!name.trim()) return;
    setSavingName(true);
    try {
      const res = await fetch(`${API}/auth/update-profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ full_name: name.trim() }),
      });
      if (!res.ok) throw new Error((await res.json()).detail || 'Failed');
      await refreshUser();
      toast.success('Name updated');
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSavingName(false);
    }
  };

  // ── Password section ─────────────────────────────────────────────────────
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  const changePassword = async (e) => {
    e.preventDefault();
    if (pw.next !== pw.confirm) { toast.error("Passwords don't match"); return; }
    if (pw.next.length < 6) { toast.error('Minimum 6 characters'); return; }
    setSavingPw(true);
    try {
      const res = await fetch(`${API}/auth/change-password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ current_password: pw.current, new_password: pw.next }),
      });
      if (!res.ok) throw new Error((await res.json()).detail || 'Failed');
      setPw({ current: '', next: '', confirm: '' });
      toast.success('Password changed');
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSavingPw(false);
    }
  };

  // ── Privacy / recruiter visibility ───────────────────────────────────────
  const [visible, setVisible] = useState(true);
  const [, setSavingVisible] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch(`${API}/profile/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setVisible(d.is_visible_to_recruiters ?? true); })
      .catch(() => {});
  }, []);

  const saveVisibility = async (val) => {
    setVisible(val);
    setSavingVisible(true);
    try {
      const res = await fetch(`${API}/profile/me`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ is_visible_to_recruiters: val }),
      });
      if (!res.ok) throw new Error('Failed');
      toast.success(val ? 'Profile visible to companies' : 'Profile hidden from companies');
    } catch {
      setVisible(!val);
      toast.error('Failed to update visibility');
    } finally {
      setSavingVisible(false);
    }
  };

  // ── Danger zone ───────────────────────────────────────────────────────────
  const [confirmDelete, setConfirmDelete] = useState('');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4">
      <div className="max-w-xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Settings</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Manage your account, privacy, and preferences</p>
        </div>

        {/* ── Account ──────────────────────────────────────────────────── */}
        <section>
          <SectionHeader
            title="Account"
            desc="Your name is shown on your public talent profile and to companies."
          />
          <Card>
            <Row label="Display Name" desc="Visible on your profile and the leaderboard">
              <div className="flex items-center gap-2">
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-36 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Btn onClick={saveName} loading={savingName}>
                  <Save className="w-3.5 h-3.5" />
                </Btn>
              </div>
            </Row>
            <Row label="Email" desc="Cannot be changed. Used for login and notifications.">
              <span className="text-sm text-slate-500 dark:text-slate-400">{user?.email}</span>
            </Row>
            <Row label="Credits" desc="Pay-as-you-go — credits never expire.">
              <Link to="/pricing"
                className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                <CreditCard className="w-4 h-4" />
                {user?.credits ?? 0} credits
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </Row>
          </Card>
        </section>

        {/* ── Appearance ───────────────────────────────────────────────── */}
        <section>
          <SectionHeader
            title="Appearance"
            desc="Choose how InterviewForge looks. Setting is saved to this device."
          />
          <Card>
            <Row
              label="Dark Mode"
              desc="Easy on the eyes during late-night prep sessions."
            >
              <div className="flex items-center gap-2">
                {isDarkMode ? <Moon className="w-4 h-4 text-slate-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
                <Toggle checked={isDarkMode} onChange={toggleTheme} />
              </div>
            </Row>
          </Card>
        </section>

        {/* ── Privacy ──────────────────────────────────────────────────── */}
        <section>
          <SectionHeader
            title="Privacy & Discoverability"
            desc="Control who can see your interview scores and talent profile."
          />
          <Card>
            <Row
              label="Visible to Companies"
              desc="When on, verified companies can find your profile in talent search and reach out to hire you. Turn off to practice privately."
            >
              <div className="flex items-center gap-2">
                {visible
                  ? <Eye className="w-4 h-4 text-emerald-500" />
                  : <EyeOff className="w-4 h-4 text-slate-400" />
                }
                <Toggle checked={visible} onChange={saveVisibility} />
              </div>
            </Row>
            <Row
              label="Profile Completion"
              desc="Companies only see profiles that are 60%+ complete. Update your profile to stay discoverable."
            >
              <Link to="/profile"
                className="flex items-center gap-1 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                <User className="w-3.5 h-3.5" />
                My Profile <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </Row>
          </Card>
        </section>

        {/* ── Password ─────────────────────────────────────────────────── */}
        <section>
          <SectionHeader
            title="Password"
            desc="Leave blank if you signed up with Google or GitHub — those accounts don't use a password."
          />
          <Card className="py-4">
            <form onSubmit={changePassword} className="space-y-4 py-2">
              <Input
                label="Current Password"
                type={showPw ? 'text' : 'password'}
                value={pw.current}
                onChange={e => setPw(p => ({ ...p, current: e.target.value }))}
                required
              />
              <Input
                label="New Password"
                type={showPw ? 'text' : 'password'}
                value={pw.next}
                onChange={e => setPw(p => ({ ...p, next: e.target.value }))}
                placeholder="Min. 6 characters"
                required
              />
              <Input
                label="Confirm New Password"
                type={showPw ? 'text' : 'password'}
                value={pw.confirm}
                onChange={e => setPw(p => ({ ...p, confirm: e.target.value }))}
                required
              />
              <div className="flex items-center justify-between pt-1">
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
                  {showPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  {showPw ? 'Hide' : 'Show'} passwords
                </button>
                <Btn type="submit" loading={savingPw}>
                  <Lock className="w-3.5 h-3.5" />
                  {savingPw ? 'Saving…' : 'Change Password'}
                </Btn>
              </div>
            </form>
          </Card>
        </section>

        {/* ── Session ──────────────────────────────────────────────────── */}
        <section>
          <SectionHeader title="Session" />
          <Card>
            <Row label="Sign Out" desc="You'll need to log back in on this device.">
              <Btn outline onClick={logout}>
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </Btn>
            </Row>
          </Card>
        </section>

        {/* ── Danger zone ──────────────────────────────────────────────── */}
        <section>
          <SectionHeader
            title="Danger Zone"
            desc="These actions are permanent and cannot be undone."
          />
          <Card className="border-red-200 dark:border-red-900">
            <Row
              danger
              label="Delete Account"
              desc='Type "DELETE" below and contact support to permanently remove your account, all interview history, scores, and profile data.'
            >
              <Shield className="w-4 h-4 text-red-400" />
            </Row>
            <div className="pb-4 space-y-3">
              <input
                value={confirmDelete}
                onChange={e => setConfirmDelete(e.target.value)}
                placeholder='Type "DELETE" to confirm'
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-red-500"
              />
              <Btn
                danger
                disabled={confirmDelete !== 'DELETE'}
                onClick={() => window.location.href = 'mailto:support@interviewforge.live?subject=Delete my account&body=Please delete my account: ' + user?.email}
              >
                <Trash2 className="w-3.5 h-3.5" />
                Request Account Deletion
              </Btn>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                This will email our support team. Deletions are processed within 48 hours.
              </p>
            </div>
          </Card>
        </section>

      </div>
    </div>
  );
};

export default Settings;
