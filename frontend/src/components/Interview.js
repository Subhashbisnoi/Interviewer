import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, ArrowRight } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import RoboInterviewer from './interview/RoboInterviewer';
import VoiceRecorder from './VoiceRecorder';

const Interview = ({ interviewData, onSessionCreated }) => {
  const navigate = useNavigate();
  const toast = useToast();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [questions, setQuestions] = useState(interviewData.questions || []);
  const [answers, setAnswers] = useState(Array(interviewData.questions?.length || 0).fill(''));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [transcribedAnswer, setTranscribedAnswer] = useState('');
  const videoMeetingRef = useRef(null);
  const roboInterviewerRef = useRef(null);

  // Track current round for detailed mode
  const [currentRound, setCurrentRound] = useState(interviewData.current_round || 1);
  const [roundName, setRoundName] = useState(interviewData.round_name || 'Screening');

  const handleAnswerChange = (value) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = value;
    setAnswers(newAnswers);
    setTranscribedAnswer(value);
  };

  const handleVoiceRecordingComplete = (transcribedText) => {
    handleAnswerChange(transcribedText);
  };

  const handleRecordingError = (error) => {
    setError(error);
  };

  const submitInterview = async () => {
    if (answers.some(answer => !answer?.trim())) {
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

      const isDetailed = interviewData.interview_mode === 'detailed';
      const endpoint = isDetailed
        ? `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/interview/submit-round`
        : `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/interview/submit-answers`;

      const payload = {
        session_id: interviewData.session_id,
        answers: answers
      };

      if (isDetailed) {
        payload.round_number = currentRound;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Failed to submit interview');
      }

      const result = await response.json();

      if (isDetailed && result.interview_continues) {
        // Handle transition to next round
        toast.success(result.message || `Round ${currentRound} Complete! Moving to next round...`);

        // Update state for next round
        setQuestions(result.next_questions);
        setCurrentRound(result.next_round);
        setRoundName(result.next_round_name);

        // Reset answers for new questions
        setAnswers(Array(result.next_questions.length).fill(''));
        setCurrentQuestion(0);
        setTranscribedAnswer('');

        // Scroll to top
        window.scrollTo(0, 0);
      } else {
        // Interview complete (or failed round)
        if (isDetailed && result.message) {
          if (result.passed) {
            toast.success(result.message);
          } else {
            toast.info(result.message);
          }
        }

        onSessionCreated({
          ...interviewData,
          thread_id: interviewData.session_id,
          answers: answers,
          feedback: isDetailed && result.scores ? result.scores.map(s => ({
            marks: (s.correctness + s.clarity + s.structure + s.depth) / 4 * 10, // Assuming 0-10 scale for each, multiply by 10/10? No wait, backend returns 0-10.
            // Wait, QuestionScore has 0-10. Average property returns 0-10.
            // But Result.js expects marks to be comparable. getScoreColor checks >=8.
            // Let's explicitly calculate average if not present.
            marks: Math.round(((s.correctness + s.clarity + s.structure + s.depth) / 4) * 10) / 10,
            feedback: s.feedback
          })) : result.feedback,
          roadmap: result.roadmap,
          total_score: result.total_score || (result.scores ? result.scores.reduce((acc, s) => acc + ((s.correctness + s.clarity + s.structure + s.depth) / 4), 0) : 0),
          average_score: result.average_score,
          is_pinned: false,
          fit_percentage: result.fit_percentage,
          questions: questions
        });

        navigate('/results');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
      toast.error(err.message || 'Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col fixed inset-0 z-50">
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-gray-800 px-6 py-3 flex items-center justify-between border-b border-gray-700 flex-shrink-0">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h1 className="text-white font-semibold flex items-center gap-2">
                {interviewData.interview_mode === 'detailed' ? (
                  <>
                    <span className="bg-blue-900 text-blue-200 px-2 py-0.5 rounded text-xs uppercase tracking-wider">
                      Round {currentRound}
                    </span>
                    {roundName}
                  </>
                ) : (
                  'AI Interview'
                )}
              </h1>
              <p className="text-gray-400 text-sm">
                {interviewData.role} {interviewData.company && `at ${interviewData.company}`}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-400 flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>Question {currentQuestion + 1} of {questions.length}</span>
            </div>
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to end this interview?')) {
                  navigate('/');
                }
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              End Interview
            </button>
          </div>
        </div>

        <div className="p-2 sm:p-4 sm:flex-1 overflow-auto" ref={videoMeetingRef}>
          <RoboInterviewer
            ref={roboInterviewerRef}
            questionText={questions[currentQuestion]}
            onRequestNextQuestion={() => {
              if (currentQuestion < questions.length - 1) {
                setCurrentQuestion(currentQuestion + 1);
                setTranscribedAnswer('');
              }
            }}
            isInterviewActive={!isSubmitting}
          />
        </div>

        <div className="bg-gray-800 px-3 sm:px-6 py-3 sm:py-4 border-t border-gray-700 flex-1 overflow-y-auto">
          {error && (
            <div className="mb-4 p-3 bg-red-900 border border-red-700 text-red-200 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="bg-gray-700 p-4 rounded-lg">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  Q{currentQuestion + 1}
                </div>
                <div className="flex-1">
                  <p className="text-white">{questions[currentQuestion]}</p>
                </div>
                <button
                  onClick={() => {
                    if (roboInterviewerRef.current) {
                      roboInterviewerRef.current.playQuestion(questions[currentQuestion]);
                    }
                  }}
                  className="flex-shrink-0 text-gray-400 hover:text-white"
                  title="Listen to question"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="text-white text-sm font-medium mb-3 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                  Voice Answer
                </h3>
                <VoiceRecorder
                  key={`recorder-${currentQuestion}`}
                  questionIndex={currentQuestion}
                  onRecordingComplete={handleVoiceRecordingComplete}
                  onError={handleRecordingError}
                  buttonText={answers[currentQuestion] ? 'Re-record Answer' : 'Record Answer'}
                />

                {transcribedAnswer && (
                  <div className="mt-3 p-3 bg-gray-600 rounded-lg">
                    <p className="text-xs text-gray-300 mb-1">Transcribed:</p>
                    <p className="text-sm text-white">{transcribedAnswer}</p>
                  </div>
                )}
              </div>

              <div className="bg-gray-700 p-4 rounded-lg flex flex-col">
                <h3 className="text-white text-sm font-medium mb-3 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Type Answer (Optional)
                </h3>
                <textarea
                  value={answers[currentQuestion]}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  placeholder="Or type your answer here..."
                  className="flex-1 px-3 py-2 bg-gray-600 text-white border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 resize-none"
                  rows="4"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation - Fixed at Bottom */}
        <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 p-2 space-y-2 z-50">
          {/* Row 1: Previous / Next */}
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (currentQuestion > 0) {
                  setCurrentQuestion(currentQuestion - 1);
                  setTranscribedAnswer('');
                }
              }}
              disabled={currentQuestion === 0}
              className="flex-1 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 flex items-center justify-center gap-1 text-sm"
            >
              <ArrowRight className="h-4 w-4 rotate-180" />
              Prev
            </button>
            <button
              onClick={() => {
                if (currentQuestion < questions.length - 1) {
                  setCurrentQuestion(currentQuestion + 1);
                  setTranscribedAnswer('');
                }
              }}
              disabled={currentQuestion >= questions.length - 1}
              className="flex-1 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 flex items-center justify-center gap-1 text-sm"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {/* Row 2: Ask Question / End Call / Submit */}
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (roboInterviewerRef.current) {
                  roboInterviewerRef.current.playQuestion(questions[currentQuestion]);
                }
              }}
              className="flex-1 py-2 bg-blue-500 text-white rounded-lg text-sm"
            >
              🔊 Ask
            </button>
            {currentQuestion < questions.length - 1 ? (
              <button
                onClick={() => {
                  if (currentQuestion < questions.length - 1) {
                    setCurrentQuestion(currentQuestion + 1);
                    setTranscribedAnswer('');
                  }
                }}
                disabled={!answers[currentQuestion]?.trim()}
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 text-sm"
              >
                Submit →
              </button>
            ) : (
              <button
                onClick={submitInterview}
                disabled={isSubmitting || answers.some(answer => !answer?.trim())}
                className="flex-1 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50 text-sm"
              >
                {isSubmitting ? '...' : 'Submit ✓'}
              </button>
            )}
            <button
              onClick={() => {
                if (window.confirm('End interview?')) {
                  navigate('/');
                }
              }}
              className="flex-1 py-2 bg-red-600 text-white rounded-lg text-sm"
            >
              End
            </button>
          </div>
        </div>

        {/* Desktop Navigation - Horizontal */}
        <div className="hidden sm:flex justify-between items-center">
          <button
            onClick={() => {
              if (currentQuestion > 0) {
                setCurrentQuestion(currentQuestion - 1);
                setTranscribedAnswer('');
              }
            }}
            disabled={currentQuestion === 0}
            className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 flex items-center space-x-2"
          >
            <ArrowRight className="h-4 w-4 rotate-180" />
            <span>Previous</span>
          </button>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                if (roboInterviewerRef.current) {
                  roboInterviewerRef.current.playQuestion(questions[currentQuestion]);
                }
              }}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
              title="Replay question"
            >
              🔊
            </button>
            <button
              onClick={() => {
                if (roboInterviewerRef.current) {
                  roboInterviewerRef.current.playQuestion(questions[currentQuestion]);
                }
              }}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
            >
              Ask Question
            </button>
            <button
              onClick={() => {
                if (currentQuestion < questions.length - 1) {
                  setCurrentQuestion(currentQuestion + 1);
                  setTranscribedAnswer('');
                }
              }}
              disabled={currentQuestion >= questions.length - 1}
              className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 flex items-center space-x-2"
            >
              <span>Next</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to end this interview?')) {
                  navigate('/');
                }
              }}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
            >
              End Call
            </button>
          </div>

          {currentQuestion < questions.length - 1 ? (
            <button
              onClick={() => {
                if (currentQuestion < questions.length - 1) {
                  setCurrentQuestion(currentQuestion + 1);
                  setTranscribedAnswer('');
                }
              }}
              disabled={!answers[currentQuestion]?.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
            >
              <span>Submit & Next</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={submitInterview}
              disabled={isSubmitting || answers.some(answer => !answer?.trim())}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
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
    </div>
  );
};

export default Interview;
