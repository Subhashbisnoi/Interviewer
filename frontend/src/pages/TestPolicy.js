import React from 'react';

const TestPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            TEST PAGE
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            This is a test to see if routing works
          </p>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8">
          <div className="space-y-6 text-gray-700 dark:text-gray-300">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              If you can see this, routing is working!
            </h2>
            <p>This test page uses the exact same structure as Help.js</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestPolicy;