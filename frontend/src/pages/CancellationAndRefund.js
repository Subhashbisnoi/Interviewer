import React from 'react';

const CancellationAndRefund = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        Cancellation and Refund Policy
      </h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">Last Updated: November 13, 2024</p>
        
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          At Interviewer, we strive to provide the best service possible. Please read our cancellation and refund policy carefully before making a purchase.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">1. Cancellation Policy</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          You may cancel your subscription at any time. The cancellation will take effect at the end of the current billing cycle. 
          No refunds will be provided for the current billing period.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">2. Refund Policy</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          We offer a 7-day money-back guarantee for new subscribers. If you are not satisfied with our service, 
          you may request a full refund within 7 days of your initial purchase.
        </p>
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          To be eligible for a refund, you must not have used more than 2 interview sessions. 
          Refund requests after 7 days of purchase will not be considered.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">3. How to Request a Refund</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          To request a refund, please contact our support team at 
          <a href="mailto:support@interviewer.com" className="text-blue-600 dark:text-blue-400 hover:underline"> support@interviewer.com</a> 
          with your order number and reason for the refund request. We will process your refund within 5-7 business days.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">4. Non-Refundable Items</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-3">
          The following are not eligible for refunds:
        </p>
        <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-6 space-y-2">
          <li>Services used beyond the trial period</li>
          <li>Subscription renewals</li>
          <li>Special promotional offers</li>
          <li>Services purchased during sales or special promotions</li>
        </ul>

        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">5. Processing Time</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          Refunds may take 5-10 business days to appear on your credit card statement, depending on your bank's processing time.
        </p>

        <p className="text-gray-700 dark:text-gray-300 mt-10">
          If you have any questions about our cancellation and refund policy, please contact us at 
          <a href="mailto:support@interviewer.com" className="text-blue-600 dark:text-blue-400 hover:underline"> support@interviewer.com</a>
        </p>
      </div>
    </div>
  );
};

export default CancellationAndRefund;
