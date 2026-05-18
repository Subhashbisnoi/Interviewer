import React, { useState, useEffect } from 'react';
import { Zap, Cpu, Award, CreditCard, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import AuthModal from './auth/AuthModal';

const API = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const PLAN_META = {
  normal: { icon: Zap, gradient: 'from-blue-500 to-blue-600', light: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-700' },
  thunder: { icon: Cpu, gradient: 'from-purple-500 to-purple-600', light: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-200 dark:border-purple-700', tag: 'Popular' },
  max: { icon: Award, gradient: 'from-amber-500 to-orange-500', light: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-700', tag: 'Best' },
};

const PKG_META = {
  credits_50: { tag: null },
  credits_100: { tag: 'Popular' },
  credits_200: { tag: 'Best Value' },
};

const Pricing = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [pendingPkg, setPendingPkg] = useState(null);

  useEffect(() => {
    if (user) refreshUser();
    fetch(`${API}/payment/plans`)
      .then(r => r.json())
      .then(d => { if (d.success) setPlans(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line

  const loadRazorpay = () =>
    new Promise(resolve => {
      if (window.Razorpay) return resolve(true);
      const s = document.createElement('script');
      s.src = 'https://checkout.razorpay.com/v1/checkout.js';
      s.onload = () => resolve(true);
      s.onerror = () => resolve(false);
      document.body.appendChild(s);
    });

  const handlePurchase = async (pkgKey) => {
    if (!user) {
      setPendingPkg(pkgKey);
      setShowAuth(true);
      return;
    }
    await doPurchase(pkgKey);
  };

  const doPurchase = async (pkgKey) => {
    setPurchasing(pkgKey);
    try {
      const loaded = await loadRazorpay();
      if (!loaded) throw new Error('Payment gateway failed to load');

      const token = localStorage.getItem('token');
      const orderRes = await fetch(`${API}/credits/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ package_type: pkgKey }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.detail || 'Failed to create order');

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: 'INR',
        name: 'InterviewForge',
        description: `${orderData.package.name} – ${orderData.package.credits} Credits`,
        order_id: orderData.order_id,
        handler: async (response) => {
          const verifyRes = await fetch(`${API}/credits/verify-payment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              package_type: pkgKey,
            }),
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            alert(`✅ ${verifyData.message}`);
            window.location.reload();
          } else {
            alert('Payment verification failed. Please contact support.');
          }
        },
        prefill: { email: user?.email || '' },
        theme: { color: '#6366f1' },
      };

      new window.Razorpay(options).open();
    } catch (err) {
      alert(err.message || 'Payment failed. Please try again.');
    } finally {
      setPurchasing(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const interviewPlans = plans?.interview_plans || {};
  const creditPackages = plans?.credit_packages || {};

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 py-16 px-4">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
          <CreditCard className="w-4 h-4" /> Credit-based pricing
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-4">
          Pay only for what you use
        </h1>
        <p className="text-lg text-slate-500 dark:text-slate-400">
          Buy credits once, use them for any interview plan. No subscriptions, no monthly fees.
          New accounts get <span className="font-bold text-blue-500">20 free credits</span>.
        </p>
        {user && (
          <div className="mt-4 inline-flex items-center gap-2 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-4 py-2 rounded-xl text-sm font-semibold border border-green-200 dark:border-green-700">
            <CheckCircle className="w-4 h-4" />
            Your balance: {user.credits ?? 0} credits
          </div>
        )}
      </div>

      {/* Interview Plans */}
      <div className="max-w-5xl mx-auto mb-20">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white text-center mb-8">Interview Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(interviewPlans).map(([key, plan]) => {
            const meta = PLAN_META[key] || {};
            const Icon = meta.icon || Zap;
            return (
              <div
                key={key}
                className={`relative rounded-3xl p-6 border-2 ${meta.border} ${meta.light} transition-all hover:scale-[1.02]`}
              >
                {meta.tag && (
                  <span className={`absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-1 rounded-full bg-gradient-to-r ${meta.gradient} text-white`}>
                    {meta.tag}
                  </span>
                )}
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${meta.gradient} flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{plan.name}</h3>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Powered by {plan.model}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{plan.description}</p>
                <div className="text-lg font-bold text-slate-900 dark:text-white">{plan.credit_range}</div>
                <div className="text-xs text-slate-400">per interview (varies by length)</div>

                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-600 space-y-2">
                  {[
                    'Adaptive follow-up questions',
                    '6-dimension evaluation',
                    'Personalised roadmap',
                    'Performance stored in profile',
                  ].map(f => (
                    <div key={f} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Credit Packages */}
      <div className="max-w-4xl mx-auto mb-16">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white text-center mb-2">Buy Credits</h2>
        <p className="text-center text-slate-400 mb-8 text-sm">Credits never expire. Buy once, use anytime.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {Object.entries(creditPackages).map(([key, pkg]) => {
            const pkgMeta = PKG_META[key] || {};
            const isPopular = pkgMeta.tag === 'Popular';
            return (
              <div
                key={key}
                className={`relative rounded-3xl p-6 border-2 transition-all hover:scale-[1.02] ${
                  isPopular
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-xl shadow-blue-500/20'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                }`}
              >
                {pkgMeta.tag && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                    {pkgMeta.tag}
                  </span>
                )}
                <div className="text-center mb-4">
                  <Sparkles className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <div className="text-3xl font-extrabold text-slate-900 dark:text-white">{pkg.credits}</div>
                  <div className="text-slate-500 dark:text-slate-400 text-sm">credits</div>
                </div>
                <div className="text-center mb-2">
                  <span className="text-4xl font-extrabold text-slate-900 dark:text-white">₹{pkg.price_inr}</span>
                </div>
                <p className="text-center text-slate-500 dark:text-slate-400 text-sm mb-6">{pkg.description}</p>

                <button
                  onClick={() => handlePurchase(key)}
                  disabled={purchasing === key}
                  className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                    isPopular
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90 shadow-lg'
                      : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90'
                  } disabled:opacity-50`}
                >
                  {purchasing === key ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>Buy Credits <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white text-center mb-8">Common questions</h2>
        <div className="space-y-4">
          {[
            { q: 'Do credits expire?', a: 'No. Credits you purchase never expire — use them at your own pace.' },
            { q: 'Why do interviews cost different credits?', a: 'The AI adapts to each session. Longer, more complex conversations use more tokens and therefore more credits. Normal interviews cost 13–17, Thunder 33–39, Max 55–60.' },
            { q: 'Can I get a refund?', a: 'Unused credits can be refunded within 7 days of purchase. Contact us at support@interviewforge.live.' },
            { q: 'How do recruiters see my profile?', a: 'Once you complete interviews, your scores are added to your profile. Verified recruiters can search by role, skills, and score — you control visibility in your profile settings.' },
          ].map((item, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700">
              <div className="font-semibold text-slate-900 dark:text-white mb-1">{item.q}</div>
              <div className="text-slate-500 dark:text-slate-400 text-sm">{item.a}</div>
            </div>
          ))}
        </div>
      </div>

      {showAuth && (
        <AuthModal
          isOpen={showAuth}
          onClose={() => { setShowAuth(false); setPendingPkg(null); }}
          onSuccess={() => {
            setShowAuth(false);
            if (pendingPkg) { doPurchase(pendingPkg); setPendingPkg(null); }
          }}
        />
      )}
    </div>
  );
};

export default Pricing;
