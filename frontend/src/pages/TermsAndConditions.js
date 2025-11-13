import React from 'react';

const TermsAndConditions = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        Terms and Conditions
      </h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">Last Updated: November 13, 2024</p>
        
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          Welcome to Interviewer. These Terms and Conditions outline the rules and regulations for the use of our website and services.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">1. Acceptance of Terms</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          By accessing or using our website and services, you agree to be bound by these Terms and Conditions. 
          If you disagree with any part of these terms, you may not access the service.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">2. User Accounts</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          When you create an account with us, you must provide accurate and complete information. 
          You are responsible for maintaining the confidentiality of your account and password.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">3. Services</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          We provide interview preparation services. We reserve the right to modify or discontinue any service at any time without notice.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">4. Payments and Refunds</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          All fees are non-refundable except as required by law. Please refer to our 
          <a href="/refund-policy" className="text-blue-600 dark:text-blue-400 hover:underline"> Refund Policy</a> for more details.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">5. Intellectual Property</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          All content included on our website, including text, graphics, logos, and software, 
          is the property of Interviewer and protected by copyright laws.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">6. Limitation of Liability</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          Interviewer shall not be liable for any indirect, incidental, special, consequential, 
          or punitive damages resulting from your use of our services.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">7. Governing Law</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          These Terms shall be governed by and construed in accordance with the laws of India, 
          without regard to its conflict of law provisions.
        </p>

        <p className="text-gray-700 dark:text-gray-300 mt-10">
          If you have any questions about these Terms and Conditions, please contact us at 
          <a href="mailto:support@interviewer.com" className="text-blue-600 dark:text-blue-400 hover:underline"> support@interviewer.com</a>
        </p>
      </div>
    </div>
  );
};

export default TermsAndConditions;
