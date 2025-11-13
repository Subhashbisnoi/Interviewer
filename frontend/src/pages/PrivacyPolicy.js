import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        Privacy Policy
      </h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">Last Updated: November 13, 2024</p>
        
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          At Interviewer, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, 
          disclose, and safeguard your information when you visit our website and use our services.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">1. Information We Collect</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          We may collect personal information such as your name, email address, contact information, and payment details 
          when you use our services or interact with our website.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">2. How We Use Your Information</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          We use the information we collect to provide and improve our services, process transactions, communicate with you, 
          and comply with legal obligations.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">3. Data Security</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          We implement appropriate security measures to protect your personal information. However, no method of transmission 
          over the internet is 100% secure.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">4. Third-Party Services</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          We may use third-party services such as payment processors that have their own privacy policies. We are not 
          responsible for the practices of these third parties.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">5. Your Rights</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          You have the right to access, correct, or delete your personal information. Please contact us at 
          <a href="mailto:privacy@interviewer.com" className="text-blue-600 dark:text-blue-400 hover:underline"> privacy@interviewer.com</a> for any requests.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">6. Changes to This Policy</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new policy 
          on this page.
        </p>

        <p className="text-gray-700 dark:text-gray-300 mt-10">
          If you have any questions about this Privacy Policy, please contact us at 
          <a href="mailto:privacy@interviewer.com" className="text-blue-600 dark:text-blue-400 hover:underline"> privacy@interviewer.com</a>
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
