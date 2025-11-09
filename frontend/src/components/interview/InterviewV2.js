import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import RoboInterviewer from './RoboInterviewer';
import VoiceRecorder from '../VoiceRecorder';
import { 
  startInterviewSession, 
  submitAnswer, 
  getChatHistory, 
  getSessionStatus,
  uploadResume,
  formatChatHistory,
  calculateProgress,
  getStatusColor,
  formatScore
} from '../../services/interviewV2';

const InterviewV2 = () => {
  const { user } = useAuth();
  const [currentSession, setCurrentSession] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Interview setup state
  const [role, setRole] = useState('');
  const [company, setCompany] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [isSetupMode, setIsSetupMode] = useState(true);
  
  // Interview progress state
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [sessionStatus, setSessionStatus] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcribedAnswer, setTranscribedAnswer] = useState('');
  const videoMeetingRef = useRef(null);

  // Handle resume upload
  const handleResumeUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setError('Please upload a PDF file');
      return;
    }

    setResumeFile(file);
    setIsLoading(true);
    setError('');

    try {
      const result = await uploadResume(file);
      setResumeText(result.resume_text);
    } catch (err) {
      setError(err.message || 'Failed to upload resume');
    } finally {
      setIsLoading(false);
    }
  };

  // Start interview session
  const handleStartInterview = async () => {
    if (!role.trim() || !company.trim() || !resumeText.trim()) {
      setError('Please fill in all fields and upload a resume');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await startInterviewSession({
        role: role.trim(),
        company: company.trim(),
        resume_text: resumeText
      });

      setCurrentSession(result);
      setQuestions(result.questions || []);
      setIsSetupMode(false);
      setCurrentQuestionIndex(0);
      setSidebarOpen(true); // Open sidebar when interview starts
      
      // Load initial chat history
      await loadChatHistory(result.thread_id);
      
    } catch (err) {
      setError(err.message || 'Failed to start interview');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle voice recording
  const handleVoiceRecordingComplete = (transcribedText) => {
    setTranscribedAnswer(transcribedText);
    setCurrentAnswer(transcribedText);
  };

  const handleRecordingError = (error) => {
    setError(error);
  };

  // Submit answer
  const handleSubmitAnswer = async () => {
    if (!currentAnswer.trim()) {
      setError('Please provide an answer');
      return;
    }

    if (!currentSession) {
      setError('No active session');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await submitAnswer(
        currentSession.thread_id,
        currentQuestionIndex + 1,
        currentAnswer.trim()
      );

      setCurrentAnswer('');
      
      // Reload chat history to get feedback
      await loadChatHistory(currentSession.thread_id);
      
      // Update session status
      await loadSessionStatus(currentSession.thread_id);
      
      // Move to next question if available
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      }
      
    } catch (err) {
      setError(err.message || 'Failed to submit answer');
    } finally {
      setIsLoading(false);
    }
  };

  // Load chat history
  const loadChatHistory = async (threadId) => {
    try {
      const history = await getChatHistory(threadId);
      const formattedHistory = formatChatHistory(history);
      setChatHistory(formattedHistory);
    } catch (err) {
      console.error('Failed to load chat history:', err);
    }
  };

  // Load session status
  const loadSessionStatus = async (threadId) => {
    try {
      const status = await getSessionStatus(threadId);
      setSessionStatus(status);
    } catch (err) {
      console.error('Failed to load session status:', err);
    }
  };

  // Reset to start new interview
  const handleNewInterview = () => {
    setCurrentSession(null);
    setChatHistory([]);
    setRole('');
    setCompany('');
    setResumeFile(null);
    setResumeText('');
    setIsSetupMode(true);
    setCurrentAnswer('');
    setCurrentQuestionIndex(0);
    setQuestions([]);
    setSessionStatus(null);
    setError('');
    setSidebarOpen(false);
  };

  // Render setup form
  const renderSetupForm = () => (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-gray-800 rounded-lg shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Start AI Interview</h2>
          <p className="text-gray-400">Prepare for your dream job with AI-powered interviews</p>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-900 border border-red-700 text-red-200 rounded-lg">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Job Role *
            </label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
              placeholder="e.g., Software Engineer, Data Scientist"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Company *
            </label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
              placeholder="e.g., Google, Microsoft, Startup Inc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Resume (PDF) *
            </label>
            <div className="relative">
              <input
                type="file"
                accept=".pdf"
                onChange={handleResumeUpload}
                className="w-full px-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:cursor-pointer"
              />
            </div>
            {resumeText && (
              <div className="mt-3 p-3 bg-green-900 border border-green-700 rounded-lg flex items-center">
                <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-sm text-green-200">
                  Resume uploaded and processed successfully
                </p>
              </div>
            )}
            {isLoading && !resumeText && (
              <div className="mt-3 p-3 bg-blue-900 border border-blue-700 rounded-lg flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400 mr-2"></div>
                <p className="text-sm text-blue-200">
                  Processing resume...
                </p>
              </div>
            )}
          </div>

          <button
            onClick={handleStartInterview}
            disabled={isLoading || !role.trim() || !company.trim() || !resumeText.trim()}
            className="w-full py-4 px-6 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
          >
            {isLoading && resumeText ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Starting Interview...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
                <span>Start Interview</span>
              </>
            )}
          </button>

          <p className="text-center text-sm text-gray-400">
            The interview will consist of 3 technical questions
          </p>
        </div>
      </div>
    </div>
  );

  // Render chat sidebar
  const renderChatSidebar = () => {
    return (
      <>
        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-70 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar */}
        <div className={`
          fixed inset-y-0 right-0 w-full max-w-lg bg-gray-800 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-l border-gray-700
          ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}
          lg:relative lg:translate-x-0
          ${sidebarOpen ? 'lg:block' : 'lg:hidden'}
        `}>
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="bg-gray-900 px-4 py-4 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <h3 className="text-lg font-semibold text-white">Interview History</h3>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md p-1"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Chat Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {chatHistory.length > 0 ? (
                <div className="space-y-3">
                  {chatHistory.map((message, index) => {
                    const isUser = message.role === 'user';
                    const isSystem = message.role === 'system' || message.type === 'system';
                    
                    let bgColor = 'bg-gray-700';
                    let borderColor = 'border-gray-600';
                    
                    if (isUser) {
                      bgColor = 'bg-blue-900';
                      borderColor = 'border-blue-700';
                    } else if (message.type === 'feedback') {
                      bgColor = 'bg-green-900';
                      borderColor = 'border-green-700';
                    } else if (message.type === 'roadmap') {
                      bgColor = 'bg-purple-900';
                      borderColor = 'border-purple-700';
                    }

                    return (
                      <div key={index} className={`border rounded-lg p-3 ${bgColor} ${borderColor}`}>
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center text-xs font-medium text-gray-300">
                            {message.type === 'question' && (
                              <>
                                <svg className="w-3 h-3 mr-1 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                </svg>
                                Q{message.questionNumber}
                              </>
                            )}
                            {message.type === 'answer' && (
                              <>
                                <svg className="w-3 h-3 mr-1 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                Answer
                              </>
                            )}
                            {message.type === 'feedback' && (
                              <>
                                <svg className="w-3 h-3 mr-1 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                                Feedback
                              </>
                            )}
                            {message.type === 'roadmap' && (
                              <>
                                <svg className="w-3 h-3 mr-1 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                                </svg>
                                Roadmap
                              </>
                            )}
                            {isSystem && 'System'}
                          </div>
                          
                          {message.marks !== null && message.marks !== undefined && (
                            <div className="flex items-center text-xs">
                              <svg className="w-3 h-3 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              <span className="font-bold text-yellow-200">{message.marks}/10</span>
                            </div>
                          )}
                        </div>

                        <div className="text-sm text-gray-200">
                          {message.type === 'roadmap' ? (
                            <div 
                              className="prose prose-sm max-w-none prose-invert"
                              dangerouslySetInnerHTML={{ 
                                __html: message.content
                                  .replace(/\n/g, '<br/>')
                                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                  .replace(/\*(.*?)\*/g, '<em>$1</em>')
                              }}
                            />
                          ) : (
                            <p className="whitespace-pre-wrap">{message.content}</p>
                          )}
                        </div>
                        
                        <div className="text-xs text-gray-400 mt-2">
                          {message.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg className="w-12 h-12 text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p className="text-gray-400 text-sm">Chat history will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </>
    );
  };

  // Render interview interface
  const renderInterview = () => (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Video Meeting Interface */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar - Meeting Info */}
        <div className="bg-gray-800 px-6 py-3 flex items-center justify-between border-b border-gray-700">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h1 className="text-white font-semibold">AI Interview</h1>
              <p className="text-gray-400 text-sm">
                {currentSession?.role} at {currentSession?.company}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-400">
              Question {currentQuestionIndex + 1} of {questions.length}
            </div>
            {sessionStatus && sessionStatus.total_score > 0 && (
              <div className="px-3 py-1 bg-blue-900 rounded-full text-sm text-blue-200">
                Score: {formatScore(sessionStatus.total_score)}/30
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>Chat ({chatHistory.length})</span>
            </button>
            <button
              onClick={handleNewInterview}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              End Interview
            </button>
          </div>
        </div>

        {/* Video Grid - Main Meeting Area */}
        <div className="flex-1 p-4" ref={videoMeetingRef}>
          <RoboInterviewer 
            questionText={questions[currentQuestionIndex]}
            onRequestNextQuestion={() => {
              if (currentQuestionIndex < questions.length - 1) {
                setCurrentQuestionIndex(currentQuestionIndex + 1);
              }
            }}
            isInterviewActive={sessionStatus?.status !== 'completed'}
          />
        </div>

        {/* Bottom Control Bar - Question & Answer */}
        <div className="bg-gray-800 px-6 py-4 border-t border-gray-700">
          {error && (
            <div className="mb-4 p-3 bg-red-900 border border-red-700 text-red-200 rounded-lg text-sm">
              {error}
            </div>
          )}

          {questions.length > 0 && currentQuestionIndex < questions.length && sessionStatus?.status !== 'completed' && (
            <div className="space-y-4">
              {/* Current Question Display */}
              <div className="bg-gray-700 p-4 rounded-lg">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    Q{currentQuestionIndex + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-white">{questions[currentQuestionIndex]}</p>
                  </div>
                </div>
              </div>

              {/* Answer Input Area */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Voice Recording */}
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-white text-sm font-medium mb-3 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                    Voice Answer
                  </h3>
                  <VoiceRecorder
                    key={`recorder-${currentQuestionIndex}`}
                    questionIndex={currentQuestionIndex}
                    onRecordingComplete={handleVoiceRecordingComplete}
                    onError={handleRecordingError}
                    buttonText={transcribedAnswer ? 'Re-record Answer' : 'Record Answer'}
                  />
                  
                  {transcribedAnswer && (
                    <div className="mt-3 p-3 bg-gray-600 rounded-lg">
                      <p className="text-xs text-gray-300 mb-1">Transcribed:</p>
                      <p className="text-sm text-white">{transcribedAnswer}</p>
                    </div>
                  )}
                </div>

                {/* Text Answer */}
                <div className="bg-gray-700 p-4 rounded-lg flex flex-col">
                  <h3 className="text-white text-sm font-medium mb-3 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Type Answer (Optional)
                  </h3>
                  <textarea
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    placeholder="Or type your answer here..."
                    className="flex-1 px-3 py-2 bg-gray-600 text-white border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 resize-none"
                    rows="4"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-between items-center">
                <button
                  onClick={() => {
                    if (currentQuestionIndex > 0) {
                      setCurrentQuestionIndex(currentQuestionIndex - 1);
                      setCurrentAnswer('');
                      setTranscribedAnswer('');
                    }
                  }}
                  disabled={currentQuestionIndex === 0}
                  className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  ← Previous
                </button>

                <div className="flex-1 mx-4">
                  {/* Progress Dots */}
                  <div className="flex justify-center space-x-2">
                    {questions.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentQuestionIndex(idx)}
                        className={`w-3 h-3 rounded-full transition-all ${
                          idx === currentQuestionIndex
                            ? 'bg-blue-500 w-8'
                            : idx < currentQuestionIndex
                            ? 'bg-green-500'
                            : 'bg-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleSubmitAnswer}
                  disabled={isLoading || !currentAnswer.trim()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <span>{currentQuestionIndex === questions.length - 1 ? 'Submit Final Answer' : 'Submit & Next'}</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Completion Message */}
          {sessionStatus?.status === 'completed' && (
            <div className="bg-green-900 border border-green-700 p-6 rounded-lg text-center">
              <div className="flex flex-col items-center space-y-3">
                <svg className="w-16 h-16 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-2xl font-bold text-white">Interview Completed!</h3>
                <p className="text-green-200">
                  Final Score: {formatScore(sessionStatus.total_score)}/30 
                  (Average: {formatScore(sessionStatus.average_score)}/10)
                </p>
                <p className="text-green-300 text-sm">Check the chat history for detailed feedback and roadmap</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chat Sidebar */}
      {!isSetupMode && currentSession && renderChatSidebar()}
    </div>
  );

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <p className="text-lg text-gray-300">Please log in to access the interview.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {isSetupMode ? renderSetupForm() : renderInterview()}
    </div>
  );
};

export default InterviewV2;
