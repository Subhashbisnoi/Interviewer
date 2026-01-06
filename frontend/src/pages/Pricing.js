import React, { useState, useEffect } from 'react';
import { Check, X, Zap, Crown, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';


const Pricing = () => {
  const [plans, setPlans] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPlans();
    if (user) {
      fetchSubscription();
    }
  }, [user]);

  const fetchPlans = async () => {
    try {
      const timestamp = new Date().getTime();
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/payment/plans?_t=${timestamp}`);
      const data = await response.json();
      console.log('Fetched plans data:', data);
      if (data.success) {
        setPlans(data);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscription = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/payment/subscription`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      const data = await response.json();
      if (data.success) {
        setSubscription(data.subscription);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    }
  };

  const handleUpgrade = async (planType) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const token = localStorage.getItem('token');

      // Create order
      const orderResponse = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/payment/create-order`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ plan_type: planType })
        }
      );

      const orderData = await orderResponse.json();

      if (!orderData.success) {
        throw new Error('Failed to create order');
      }

      // Initialize Razorpay
      const options = {
        key: orderData.key_id,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: 'AI Interviewer',
        description: orderData.order.plan_description,
        order_id: orderData.order.order_id,
        handler: async function (response) {
          // Verify payment
          const verifyResponse = await fetch(
            `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/payment/verify`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            }
          );

          const verifyData = await verifyResponse.json();

          if (verifyData.success) {
            alert('Payment successful! Your premium subscription is now active.');
            window.location.reload();
          } else {
            alert('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: user.full_name || '',
          email: user.email || '',
        },
        theme: {
          color: '#4F46E5'
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Failed to process payment. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // If user is premium, show subscription management page
  if (subscription?.tier === 'premium') {
    const expiryDate = subscription.expires_at ? new Date(subscription.expires_at) : null;
    const today = new Date();
    const daysRemaining = expiryDate ? Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : 0;

    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <Crown className="h-10 w-10 text-gray-900" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Premium Subscription Active
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Enjoy unlimited interviews and premium features
          </p>
        </div>

        {/* Subscription Details */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-8 mb-8 border border-blue-200 dark:border-blue-800">
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Current Plan</h3>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">Premium</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Status</h3>
              <p className="text-2xl font-bold text-green-600">Active</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Days Remaining</h3>
              <p className="text-2xl font-bold text-orange-600">
                {daysRemaining > 0 ? `${daysRemaining} days` : 'Expired'}
              </p>
            </div>
          </div>

          {expiryDate && (
            <div className="mt-6 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                Your subscription expires on {expiryDate.toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          )}
        </div>

        {/* Premium Features */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            Your Premium Features
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {plans?.features?.premium?.features.map((feature, index) => (
              <div key={index} className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Renewal Options */}
        {daysRemaining <= 7 && daysRemaining > 0 && (
          <div className="mt-8 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-orange-800 dark:text-orange-200 mb-4">
              🔔 Subscription Expiring Soon
            </h3>
            <p className="text-orange-700 dark:text-orange-300 mb-4">
              Your premium subscription expires in {daysRemaining} days. Renew now to continue enjoying unlimited interviews.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => handleUpgrade('monthly')}
                className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
              >
                Renew Monthly (₹{plans?.plans?.monthly?.amount_inr})
              </button>
              <button
                onClick={() => handleUpgrade('yearly')}
                className="px-6 py-2 bg-orange-800 hover:bg-orange-900 text-white rounded-lg font-medium transition-colors"
              >
                Renew Yearly (₹{plans?.plans?.yearly?.amount_inr})
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Choose Your Plan
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Start free, upgrade when you're ready
        </p>
      </div>

      {/* Current Subscription Status */}
      {subscription && (
        <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                Current Plan: {subscription.tier === 'premium' ? '👑 Premium' : '🆓 Free'}
              </p>
              <p className="text-xs text-blue-500 dark:text-blue-300 mt-1">
                {subscription.tier === 'free'
                  ? `${subscription.interviews_remaining || 0} interviews remaining this month`
                  : subscription.expires_at ? (() => {
                    const expiryDate = new Date(subscription.expires_at);
                    const today = new Date();
                    const diffTime = expiryDate.getTime() - today.getTime();
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                    if (diffDays > 0) {
                      return `Unlimited interviews • ${diffDays} days remaining`;
                    } else if (diffDays === 0) {
                      return 'Unlimited interviews • Expires today';
                    } else {
                      return 'Unlimited interviews • Subscription expired';
                    }
                  })() : 'Unlimited interviews • Active'
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {/* Free Tier */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border-2 border-gray-200 dark:border-gray-700">
          <div className="flex items-center mb-4">
            <Shield className="h-8 w-8 text-gray-500 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Free</h2>
          </div>

          <div className="mb-6">
            <span className="text-4xl font-bold text-gray-900 dark:text-white">₹0</span>
            <span className="text-gray-600 dark:text-gray-400">/month</span>
          </div>

          <ul className="space-y-3 mb-8">
            {plans?.features?.free?.features.map((feature, index) => (
              <li key={index} className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700 dark:text-gray-300">{feature}</span>
              </li>
            ))}
          </ul>

          <button
            disabled
            className="w-full py-3 px-6 rounded-lg bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400 font-semibold cursor-not-allowed"
          >
            Current Plan
          </button>
        </div>

        {/* Premium Tier */}
        <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl shadow-2xl p-8 relative">
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
            <span className="bg-yellow-400 text-gray-900 px-4 py-1 rounded-full text-sm font-bold">
              MOST POPULAR
            </span>
          </div>

          <div className="flex items-center mb-4">
            <Crown className="h-8 w-8 text-yellow-300 mr-3" />
            <h2 className="text-2xl font-bold text-white">Premium</h2>
          </div>

          <div className="mb-2">
            <span className="text-4xl font-bold text-white">
              ₹{plans?.plans?.monthly?.amount_inr}
            </span>
            <span className="text-primary-100">/month</span>
          </div>

          <p className="text-primary-100 text-sm mb-6">
            or ₹{plans?.plans?.yearly?.amount_inr}/year (Save ₹{plans?.plans?.monthly?.amount_inr ? ((plans.plans.monthly.amount_inr * 12) - plans.plans.yearly.amount_inr).toFixed(0) : '89'})
          </p>

          <ul className="space-y-3 mb-8">
            {plans?.features?.premium?.features.map((feature, index) => (
              <li key={index} className="flex items-start">
                <Check className="h-5 w-5 text-yellow-300 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-white">{feature}</span>
              </li>
            ))}
          </ul>

          <div className="space-y-3">
            <button
              onClick={() => handleUpgrade('monthly')}
              disabled={subscription?.tier === 'premium'}
              className="w-full py-3 px-6 rounded-lg bg-white text-primary-600 font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <Zap className="h-5 w-5 mr-2" />
              {subscription?.tier === 'premium' ? 'Current Plan' : 'Upgrade Monthly'}
            </button>

            <button
              onClick={() => handleUpgrade('yearly')}
              disabled={subscription?.tier === 'premium'}
              className="w-full py-3 px-6 rounded-lg bg-primary-800 text-white font-semibold hover:bg-primary-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {subscription?.tier === 'premium' ? 'Current Plan' : 'Upgrade Yearly (Save 17%)'}
            </button>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mt-16 max-w-3xl mx-auto">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
          Frequently Asked Questions
        </h3>

        <div className="space-y-4">
          <details className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <summary className="font-semibold text-gray-900 dark:text-white cursor-pointer">
              Can I cancel anytime?
            </summary>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Yes! You can cancel your subscription at any time. You'll continue to have access to premium features until the end of your billing period.
            </p>
          </details>

          <details className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <summary className="font-semibold text-gray-900 dark:text-white cursor-pointer">
              What payment methods do you accept?
            </summary>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              We accept all major credit/debit cards, UPI, net banking, and wallets through Razorpay.
            </p>
          </details>

          <details className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <summary className="font-semibold text-gray-900 dark:text-white cursor-pointer">
              Is my payment information secure?
            </summary>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Absolutely! We use Razorpay, a PCI DSS compliant payment gateway. We never store your card details.
            </p>
          </details>
        </div>
      </div>


    </div>
  );
};

export default Pricing;
