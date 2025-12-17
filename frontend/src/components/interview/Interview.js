import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, ArrowRight, Brain } from 'lucide-react';
import RoboInterviewer from './RoboInterviewer';
import VoiceRecorder from '../VoiceRecorder';
import useInterviewProctor from '../../hooks/useInterviewProctor';
import ProctorWarning from '../ProctorWarning';

const Interview = ({ interviewData, onSessionCreated }) => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState(Array(interviewData.questions?.length).fill(''));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  // Initialize proctoring
  const {
    proctorData,
    showWarning,
    currentWarning,
    getIntegrityScore,
    getIntegrityLevel,
    dismissWarning
  } = useInterviewProctor(true);

  const questions = interviewData.questions || [];

  const handleAnswerChange = (value) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = value;
    setAnswers(newAnswers);
  };

  const handleVoiceRecordingComplete = (transcribedText) => {
    handleAnswerChange(transcribedText);
  };

  const handleRecordingError = (error) => {
    setError(error);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const submitInterview = async () => {
    if (answers.some(answer => !answer.trim())) {
      setError('Please answer all questions before submitting');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/interview/submit-answers`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          session_id: interviewData.session_id,
          answers: answers,
          proctoring_data: proctorData // Include proctoring data
        })
      });

      if (response.status === 401) {
        setError('Session expired. Please login again.');
        setTimeout(() => navigate('/'), 2000);
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to submit interview');
      }

      const result = await response.json();

      onSessionCreated({
        ...interviewData,
        thread_id: interviewData.session_id,
        answers: answers,
        feedback: result.feedback,
        roadmap: result.roadmap,
        total_score: result.total_score,
        average_score: result.average_score,
        is_pinned: false
      });

      navigate('/results');
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getProgressPercentage = () => {
    return ((currentQuestion + 1) / questions.length) * 100;
  };

  const getQuestionNumber = (index) => {
    return index + 1;
  };

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto px-2 sm:px-4 md:px-6 overflow-x-hidden" style={{ height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Proctoring Warning */}
      <ProctorWarning
        show={showWarning}
        message={currentWarning}
        onDismiss={dismissWarning}
      />

      {/* Interview Video UI */}
      <RoboInterviewer
        questionText={questions[currentQuestion]}
        onRequestNextQuestion={nextQuestion}
      />

      {/* Scrollable Content Area - Compact on mobile */}
      <div className="flex-1 overflow-y-auto p-0 sm:p-4">
        {/* Progress and Info - Hidden on mobile for compact layout */}
        <div className="hidden sm:block bg-white rounded-lg shadow-lg p-3 sm:p-6 mb-4 sm:mb-8 mt-4 sm:mt-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
            <div>
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900">AI Interview</h1>
              <p className="text-sm sm:text-base text-gray-600">
                {interviewData.role} at {interviewData.company}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
              {/* Integrity Score Badge */}
              <div className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${getIntegrityLevel().color === 'green' ? 'bg-green-100 text-green-800' :
                getIntegrityLevel().color === 'blue' ? 'bg-blue-100 text-blue-800' :
                  getIntegrityLevel().color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                    getIntegrityLevel().color === 'orange' ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                }`}>
                Integrity: {getIntegrityLevel().label} ({getIntegrityScore()}%)
              </div>
              <div className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm text-gray-500">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Question {currentQuestion + 1} of {questions.length}</span>
              </div>
            </div>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${getProgressPercentage()}%` }}
            ></div>
          </div>
        </div>

        {/* Mobile: Single compact card with question + recorder */}
        <div className="sm:hidden bg-gray-800 rounded-lg p-3 mb-2">
          {/* Question */}
          <div className="flex items-start gap-2 mb-3">
            <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded shrink-0">Q{currentQuestion + 1}</span>
            <p className="text-xs text-gray-200 flex-1 line-clamp-4">{questions[currentQuestion]}</p>
          </div>
          {/* Voice Recorder */}
          <VoiceRecorder
            key={`recorder-${currentQuestion}`}
            questionIndex={currentQuestion}
            onRecordingComplete={handleVoiceRecordingComplete}
            onError={handleRecordingError}
            buttonText={answers[currentQuestion] ? 'Re-record' : 'Record'}
          />
          {answers[currentQuestion] && (
            <div className="mt-2 p-2 bg-gray-700 rounded text-xs text-gray-200 line-clamp-2">
              {answers[currentQuestion]}
            </div>
          )}
        </div>

        {/* Desktop: Full Answer Section */}
        <div className="hidden sm:block bg-gray-800 rounded-lg p-3 sm:p-6 md:p-8 mb-2 sm:mb-8">
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
              <div className="bg-primary-100 rounded-full p-1.5 sm:p-2">
                <Brain className="h-4 w-4 sm:h-6 sm:w-6 text-primary-600" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-primary-600">
                Question {getQuestionNumber(currentQuestion)}
              </span>
            </div>
          </div>

          {/* Voice Recorder */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Your Answer</h3>
            <VoiceRecorder
              key={`recorder-desktop-${currentQuestion}`}
              questionIndex={currentQuestion}
              onRecordingComplete={handleVoiceRecordingComplete}
              onError={handleRecordingError}
              buttonText={answers[currentQuestion] ? 'Re-record Answer' : 'Record Answer'}
            />

            {answers[currentQuestion] && (
              <div className="mt-4 p-3 bg-white border border-gray-200 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Transcribed:</p>
                <p className="text-gray-800">{answers[currentQuestion]}</p>
              </div>
            )}
          </div>
        </div>

        {/* Question Navigation - Hidden on mobile */}
        <div className="hidden sm:block bg-white rounded-lg shadow-lg p-3 sm:p-6 mb-4 sm:mb-8">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Question Progress</h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-4">
            {questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestion(index)}
                className={`p-4 rounded-lg border-2 transition-all ${index === currentQuestion
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : answers[index]?.trim()
                    ? 'border-green-300 bg-green-50 text-green-700'
                    : 'border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300'
                  }`}
              >
                <div className="text-center">
                  <div className="text-lg font-semibold">{index + 1}</div>
                  <div className="text-xs">
                    {answers[index]?.trim() ? 'Answered' : 'Pending'}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Fixed Navigation Buttons at Bottom */}
      <div className="bg-gray-900 border-t border-gray-700 py-3 px-2 sm:px-4" style={{ flexShrink: 0 }}>
        {/* Mobile: Stack buttons in rows */}
        <div className="flex flex-col gap-2 sm:hidden">
          {/* Row 1: Navigation */}
          <div className="flex justify-between gap-2">
            <button
              onClick={previousQuestion}
              disabled={currentQuestion === 0}
              className="flex-1 flex items-center justify-center py-2 text-sm text-gray-300 bg-gray-800 rounded-lg disabled:opacity-50"
            >
              <ArrowRight className="h-4 w-4 rotate-180 mr-1" />
              Prev
            </button>
            <button
              onClick={nextQuestion}
              disabled={currentQuestion >= questions.length - 1 || !answers[currentQuestion]?.trim()}
              className="flex-1 flex items-center justify-center py-2 text-sm text-white bg-blue-600 rounded-lg disabled:opacity-50"
            >
              Next
              <ArrowRight className="h-4 w-4 ml-1" />
            </button>
          </div>
          {/* Row 2: Actions */}
          <div className="flex justify-between gap-2">
            <button
              onClick={() => setCurrentQuestion(currentQuestion)}
              className="flex-1 flex items-center justify-center py-2 text-sm text-white bg-gray-700 rounded-lg"
            >
              🔊 Ask
            </button>
            {currentQuestion === questions.length - 1 ? (
              <button
                onClick={submitInterview}
                disabled={isSubmitting || answers.some(answer => !answer?.trim())}
                className="flex-1 flex items-center justify-center py-2 text-sm text-white bg-green-600 rounded-lg disabled:opacity-50"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            ) : null}
            <button
              onClick={() => window.confirm('End interview?') && window.location.reload()}
              className="flex-1 flex items-center justify-center py-2 text-sm text-white bg-red-600 rounded-lg"
            >
              End
            </button>
          </div>
        </div>

        {/* Desktop: Original horizontal layout */}
        <div className="hidden sm:flex items-center justify-between">
          <button
            onClick={previousQuestion}
            disabled={currentQuestion === 0}
            className="flex items-center space-x-2 px-4 py-2 text-gray-300 hover:text-white disabled:opacity-50"
          >
            <ArrowRight className="h-4 w-4 rotate-180" />
            <span>Previous</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentQuestion(currentQuestion)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
            >
              <span>🔊</span>
              <span>Ask Question</span>
            </button>

            {currentQuestion < questions.length - 1 && (
              <button
                onClick={nextQuestion}
                disabled={!answers[currentQuestion]?.trim()}
                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <span>Next</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            )}

            <button
              onClick={() => window.confirm('End interview?') && window.location.reload()}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <span>End Call</span>
            </button>

            {currentQuestion === questions.length - 1 && (
              <button
                onClick={submitInterview}
                disabled={isSubmitting || answers.some(answer => !answer?.trim())}
                className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                <CheckCircle className="h-4 w-4" />
                <span>{isSubmitting ? 'Submitting...' : 'Submit'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-50 border border-red-200 rounded-lg p-4 max-w-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
};

export default Interview;