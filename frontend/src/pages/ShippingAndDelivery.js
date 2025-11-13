import React from 'react';

const ShippingAndDelivery = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        Shipping and Delivery Policy
      </h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">Last Updated: November 13, 2024</p>
        
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          At Interviewer, we provide digital services and do not ship physical products. This policy outlines the delivery process for our digital services.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">1. Service Delivery</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          Our services are delivered digitally through our online platform. Upon successful payment, you will receive immediate access to our services.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">2. Access to Services</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          After completing your purchase, you will receive an email with login credentials and instructions to access our platform. 
          Access is granted immediately upon account activation.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">3. Delivery Time</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          Our services are available instantly after purchase. If you experience any issues accessing your account, 
          please contact our support team at 
          <a href="mailto:support@interviewer.com" className="text-blue-600 dark:text-blue-400 hover:underline"> support@interviewer.com</a>
        </p>

        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">4. Service Availability</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          Our platform is available 24/7, except during scheduled maintenance periods. We will notify you in advance of any planned downtime.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">5. System Requirements</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-3">
          To access our services, you will need:
        </p>
        <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-6 space-y-2">
          <li>A stable internet connection</li>
          <li>An updated web browser (Chrome, Firefox, Safari, or Edge)</li>
          <li>For video interviews: A working webcam and microphone</li>
        </ul>

        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">6. Customer Support</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          Our support team is available to assist you with any issues related to service delivery. 
          Please contact us at 
          <a href="mailto:support@interviewer.com" className="text-blue-600 dark:text-blue-400 hover:underline"> support@interviewer.com</a> for assistance.
        </p>

        <p className="text-gray-700 dark:text-gray-300 mt-10">
          If you have any questions about our shipping and delivery policy, please don't hesitate to 
          <a href="/contact" className="text-blue-600 dark:text-blue-400 hover:underline"> contact us</a>.
        </p>
      </div>
    </div>
  );
};

export default ShippingAndDelivery;
