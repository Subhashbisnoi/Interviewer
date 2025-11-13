import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Home, Download, Star, TrendingUp, Target, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import PinButton from './PinButton';
import IntegrityBadge from './IntegrityBadge';

const Result = ({ session }) => {
  const [activeTab, setActiveTab] = useState('feedback');

  const getScoreColor = (score) => {
    if (score >= 8) return 'text-green-600 dark:text-green-400';
    if (score >= 6) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreIcon = (score) => {
    if (score >= 8) return <CheckCircle className="h-5 w-5 text-green-500" />;
    if (score >= 6) return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    return <XCircle className="h-5 w-5 text-red-500" />;
  };

  const getFeedbackBorderClass = (score) => {
    if (score >= 8) return 'feedback-positive';
    if (score >= 6) return 'feedback-neutral';
    return 'feedback-negative';
  };

  const downloadResults = () => {
    const resultsText = `
AI Interview Results
===================

Role: ${session.role}
Company: ${session.company}

Total Score: ${session.total_score}/30
Average Score: ${session.average_score.toFixed(1)}/10

Questions and Answers:
${session.questions.map((q, i) => `
Question ${i + 1}: ${q}
Answer: ${session.answers[i]}
Score: ${session.feedback[i]?.marks}/10
Feedback: ${session.feedback[i]?.feedback}
`).join('\n')}

Learning Roadmap:
${session.roadmap}
    `;

    const blob = new Blob([resultsText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `interview-results-${session.role}-${session.company}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Interview Results</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              {session.role} at {session.company}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <PinButton 
              sessionId={session.thread_id} 
              isPinned={session.is_pinned || false}
              onPinChange={(sessionId, isPinned) => {
                // Update the session object if needed
                if (session.thread_id === sessionId) {
                  session.is_pinned = isPinned;
                }
              }}
            />
            <button
              onClick={downloadResults}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-600 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Download Results</span>
            </button>
            <Link
              to="/"
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Home className="h-4 w-4" />
              <span>New Interview</span>
            </Link>
          </div>
        </div>

        {/* Score Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-6 text-center">
            <div className="text-3xl font-bold mb-2">{session.total_score}/30</div>
            <div className="text-blue-100">Total Score</div>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-6 text-center">
            <div className="text-3xl font-bold mb-2">{session.average_score.toFixed(1)}/10</div>
            <div className="text-green-100">Average Score</div>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg p-6 text-center">
            <div className="text-3xl font-bold mb-2">{session.questions.length}</div>
            <div className="text-purple-100">Questions</div>
          </div>
        </div>

        {/* Integrity Badge */}
        {session.proctoring_data && (
          <IntegrityBadge proctorData={session.proctoring_data} />
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg mb-8">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-8">
            <button
              onClick={() => setActiveTab('feedback')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'feedback'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4" />
                <span>Feedback</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('roadmap')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'roadmap'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4" />
                <span>Learning Roadmap</span>
              </div>
            </button>
          </nav>
        </div>

        <div className="p-8">
          {activeTab === 'feedback' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Question-by-Question Feedback</h2>
              
              {session.questions.map((question, index) => (
                <div key={index} className={`border dark:border-gray-700 rounded-lg p-6 ${getFeedbackBorderClass(session.feedback[index]?.marks)} bg-white dark:bg-gray-800`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-primary-100 dark:bg-primary-900/30 rounded-full p-2">
                        <Target className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                      </div>
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">
                        Question {index + 1}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getScoreIcon(session.feedback[index]?.marks)}
                      <span className={`text-xl font-bold ${getScoreColor(session.feedback[index]?.marks)}`}>
                        {session.feedback[index]?.marks}/10
                      </span>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h3 className="font-medium text-gray-900 dark:text-gray-200 mb-2">Question:</h3>
                    <p className="text-gray-800 dark:text-gray-200 leading-relaxed">{question}</p>
                  </div>
                  
                  <div className="mb-4">
                    <h3 className="font-medium text-gray-900 dark:text-gray-200 mb-2">Your Answer:</h3>
                    <p className="text-gray-800 dark:text-gray-200 leading-relaxed bg-gray-50 dark:bg-gray-700 p-3 rounded">
                      {session.answers[index]}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-gray-200 mb-2">Feedback:</h3>
                    <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                      {session.feedback[index]?.feedback || 'No feedback available'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'roadmap' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Personalized Learning Roadmap</h2>
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-6">
                <div className="roadmap-content prose prose-lg dark:prose-invert max-w-none text-gray-800 dark:text-gray-200">
                  <ReactMarkdown>{session.roadmap}</ReactMarkdown>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-2">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">What You Did Well</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Based on your scores, you showed strong understanding in areas where you scored 8+ points. 
            Keep building on these strengths!
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-yellow-100 dark:bg-yellow-900/30 rounded-full p-2">
              <TrendingUp className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Areas for Improvement</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Focus on the learning roadmap above to improve areas where you scored lower. 
            Practice makes perfect!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Result;