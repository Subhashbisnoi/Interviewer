import React, { useState, useEffect } from 'react';
import { Check, Shield, Zap, Crown, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Pricing = () => {
  const [plans, setPlans] = useState({
    free: {
      name: 'Free',
      price: 0,
      period: 'month',
      features: [
        '5 free interview attempts per month',
        'Basic interview feedback',
        'Access to common interview questions',
        'Limited interview history (last 5 interviews)'
      ],
      cta: 'Current Plan',
      popular: false
    },
    premium: {
      name: 'Premium',
      price: 999,
      period: 'month',
      features: [
        'Unlimited interview attempts',
        'Detailed feedback with scores',
        'Advanced analytics and insights',
        'Full interview history access',
        'Priority customer support',
        'Custom interview questions',
        'Downloadable reports'
      ],
      cta: 'Upgrade to Premium',
      popular: true
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [currentPlan, setCurrentPlan] = useState('free');
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSubscribe = async (planType) => {
    if (!user) {
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real app, you would handle the payment processing here
      // For now, we'll just show a success message
      setCurrentPlan(planType);
      
      alert('Subscription successful! Thank you for upgrading to Premium.');
    } catch (error) {
      console.error('Subscription error:', error);
      alert('Failed to process subscription. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Start with our free plan and upgrade anytime to unlock premium features
          </p>
        </div>

        {/* Current Plan Status */}
        {user && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-8 max-w-2xl mx-auto">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Shield className="h-6 w-6 text-blue-500" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Your Current Plan: <span className="font-bold">{currentPlan === 'free' ? 'Free' : 'Premium'}</span>
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  {currentPlan === 'free' 
                    ? '5 interviews remaining this month' 
                    : 'Unlimited interviews • Billed monthly'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {Object.entries(plans).map(([key, plan]) => (
            <div 
              key={key}
              className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border-2 ${
                plan.popular 
                  ? 'border-blue-500 transform md:-translate-y-2' 
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              {plan.popular && (
                <div className="bg-blue-600 text-white text-sm font-semibold py-2 text-center">
                  MOST POPULAR
                </div>
              )}
              
              <div className="p-6">
                <div className="flex items-center mb-4">
                  {plan.popular ? (
                    <Crown className="h-7 w-7 text-yellow-400 mr-2" />
                  ) : (
                    <Shield className="h-7 w-7 text-gray-500 mr-2" />
                  )}
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {plan.name}
                  </h2>
                </div>
                
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">
                    ₹{plan.price === 0 ? '0' : plan.price.toLocaleString()}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">
                    /{plan.period}
                  </span>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe(key)}
                  disabled={currentPlan === key || loading}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                    plan.popular
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : currentPlan === key
                      ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                      : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white'
                  }`}
                >
                  {loading && currentPlan !== key ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="animate-spin h-5 w-5 mr-2" />
                      Processing...
                    </div>
                  ) : (
                    currentPlan === key ? 'Current Plan' : plan.cta
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-8">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-4">
            {[
              {
                question: 'Can I cancel my subscription anytime?',
                answer: 'Yes, you can cancel your subscription at any time. Your access to premium features will continue until the end of your current billing period.'
              },
              {
                question: 'Is there a free trial for the Premium plan?',
                answer: 'We offer a 7-day money-back guarantee. If you\'re not satisfied with the Premium features, you can request a full refund within 7 days of purchase.'
              },
              {
                question: 'What payment methods do you accept?',
                answer: 'We accept all major credit and debit cards, UPI, and net banking through our secure payment gateway.'
              },
              {
                question: 'How do I upgrade from Free to Premium?',
                answer: 'Simply click the "Upgrade to Premium" button above and follow the payment process. Your account will be upgraded immediately after successful payment.'
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {faq.question}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Support */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Need help choosing a plan?
          </p>
          <a
            href="/contact"
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline"
          >
            Contact our support team
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
