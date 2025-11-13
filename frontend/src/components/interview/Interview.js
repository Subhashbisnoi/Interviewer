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
    <div className="max-w-6xl mx-auto px-4">
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

      {/* Progress and Info */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8 mt-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI Interview</h1>
            <p className="text-gray-600">
              {interviewData.role} at {interviewData.company}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {/* Integrity Score Badge */}
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              getIntegrityLevel().color === 'green' ? 'bg-green-100 text-green-800' :
              getIntegrityLevel().color === 'blue' ? 'bg-blue-100 text-blue-800' :
              getIntegrityLevel().color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
              getIntegrityLevel().color === 'orange' ? 'bg-orange-100 text-orange-800' :
              'bg-red-100 text-red-800'
            }`}>
              Integrity: {getIntegrityLevel().label} ({getIntegrityScore()}%)
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
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

      {/* Answer Section */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
        <div className="mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-primary-100 rounded-full p-2">
              <Brain className="h-6 w-6 text-primary-600" />
            </div>
            <span className="text-sm font-medium text-primary-600">
              Question {getQuestionNumber(currentQuestion)}
            </span>
          </div>
        </div>

        <div className="mb-6">
          <div className="space-y-6">
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Your Answer</h3>
              <VoiceRecorder
                key={`recorder-${currentQuestion}`}
                questionIndex={currentQuestion}
                onRecordingComplete={handleVoiceRecordingComplete}
                onError={handleRecordingError}
                buttonText={answers[currentQuestion] ? 'Re-record Answer' : 'Record Answer'}
              />
              
              {answers[currentQuestion] && (
                <div className="mt-4 p-3 bg-white border border-gray-200 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Your transcribed answer:</p>
                  <p className="text-gray-800">{answers[currentQuestion]}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={previousQuestion}
            disabled={currentQuestion === 0}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowRight className="h-4 w-4 rotate-180" />
            <span>Previous</span>
          </button>

          {currentQuestion < questions.length - 1 ? (
            <button
              onClick={nextQuestion}
              disabled={!answers[currentQuestion].trim()}
              className="flex items-center space-x-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span>Next</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={submitInterview}
              disabled={isSubmitting || answers.some(answer => !answer.trim())}
              className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  <span>Submit Interview</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Question Navigation */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Question Progress</h3>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
          {questions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentQuestion(index)}
              className={`p-4 rounded-lg border-2 transition-all ${
                index === currentQuestion
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : answers[index].trim()
                  ? 'border-green-300 bg-green-50 text-green-700'
                  : 'border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300'
              }`}
            >
              <div className="text-center">
                <div className="text-lg font-semibold">{index + 1}</div>
                <div className="text-xs">
                  {answers[index].trim() ? 'Answered' : 'Pending'}
                </div>
              </div>
            </button>
          ))}
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