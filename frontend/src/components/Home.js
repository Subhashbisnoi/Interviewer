import React, { useState, useCallback, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import {
  Upload, FileText, Brain, User, BarChart3, ArrowRight, Clock, Zap,
  Target, CheckCircle, Star, TrendingUp, Award, Users, Play,
  Sparkles, Shield, BookOpen, ChevronRight, Quote
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import AuthModal from './auth/AuthModal';
import SEO from './SEO';

const Home = ({ onStartInterview }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const [resumeFile, setResumeFile] = useState(null);
  const [formData, setFormData] = useState({
    role: '',
    company: '',
    jobDescription: ''  // Add JD field
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [formDataToSubmit, setFormDataToSubmit] = useState(null);
  const [interviewMode, setInterviewMode] = useState('short');
  const [showJDInput, setShowJDInput] = useState(false);  // Toggle for JD textarea
  const interviewFormRef = useRef(null);

  const scrollToForm = () => {
    interviewFormRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      if (file.type === 'application/pdf') {
        setResumeFile(file);
        setError('');
      } else {
        setError('Please upload a PDF file');
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!resumeFile) {
      setError('Please upload a resume');
      return;
    }

    if (!formData.role.trim()) {
      setError('Please specify the target role');
      return;
    }

    const interviewData = {
      role: formData.role.trim(),
      company: formData.company.trim(),
      resumeFile,
      interviewMode,
      jobDescription: formData.jobDescription.trim()  // Add JD to interview data
    };

    if (!user) {
      setFormDataToSubmit(interviewData);
      setShowAuthModal(true);
      return;
    }

    await startInterview(interviewData);
  };

  const startInterview = async (data) => {
    setIsLoading(true);
    setError('');

    try {
      toast.info('Uploading and analyzing your resume...');

      const uploadData = new FormData();
      uploadData.append('file', data.resumeFile);

      const token = localStorage.getItem('token');
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const uploadResponse = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/interview/upload-resume`,
        {
          method: 'POST',
          headers,
          body: uploadData
        }
      );

      if (uploadResponse.status === 401) {
        toast.error('Session expired. Please login again.');
        setShowAuthModal(true);
        return;
      }

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to process resume');
      }

      const { resume_text } = await uploadResponse.json();

      if (!resume_text) {
        throw new Error('Failed to extract text from resume');
      }

      toast.success('Resume uploaded successfully! Generating questions...');

      const interviewResponse = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/interview/start`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...headers
          },
          body: JSON.stringify({
            role: data.role,
            company: data.company,
            resume_text: resume_text,
            interview_mode: data.interviewMode || 'short',
            job_description: data.jobDescription || null  // Include JD in API request
          })
        }
      );

      if (interviewResponse.status === 401) {
        toast.error('Session expired. Please login again.');
        setShowAuthModal(true);
        return;
      }

      if (!interviewResponse.ok) {
        const errorData = await interviewResponse.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to start interview');
      }

      const interviewResult = await interviewResponse.json();

      onStartInterview({
        role: data.role,
        company: data.company,
        resume_text: resume_text,
        questions: interviewResult.questions,
        session_id: interviewResult.session_id,
        interview_mode: interviewResult.interview_mode,
        current_round: interviewResult.current_round,
        round_name: interviewResult.round_name
      });

      toast.success('Interview ready! Let\'s begin!');
      navigate('/interview');
    } catch (err) {
      setError(err.message || 'Failed to start interview. Please try again.');
      toast.error(err.message || 'Failed to start interview. Please try again.');
      console.error('Interview error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    if (formDataToSubmit) {
      startInterview(formDataToSubmit);
      setFormDataToSubmit(null);
    }
  };

  React.useEffect(() => {
    if (user && showAuthModal) {
      handleAuthSuccess();
    }
  }, [user, showAuthModal]);

  // Stats data
  const stats = [
    { number: '50,000+', label: 'Interviews Practiced', icon: Target },
    { number: '15,000+', label: 'Users Worldwide', icon: Users },
    { number: '92%', label: 'Success Rate', icon: TrendingUp },
    { number: '4.8/5', label: 'User Rating', icon: Star },
  ];

  // How it works steps
  const howItWorks = [
    {
      step: 1,
      title: 'Upload Your Resume',
      description: 'Share your experience and skills with our AI by uploading your resume in PDF format.',
      icon: Upload,
      color: 'blue'
    },
    {
      step: 2,
      title: 'Choose Your Target',
      description: 'Select the role and company you\'re preparing for. Our AI tailors questions accordingly.',
      icon: Target,
      color: 'purple'
    },
    {
      step: 3,
      title: 'Practice Interview',
      description: 'Answer AI-generated questions via voice or text in a realistic interview environment.',
      icon: Play,
      color: 'green'
    },
    {
      step: 4,
      title: 'Get Detailed Feedback',
      description: 'Receive instant, actionable feedback and a personalized roadmap to improve.',
      icon: BarChart3,
      color: 'orange'
    }
  ];

  // Benefits
  const benefits = [
    {
      title: 'AI-Powered Personalization',
      description: 'Questions tailored to your resume, target role, and company culture.',
      icon: Brain
    },
    {
      title: 'Real-Time Feedback',
      description: 'Get instant analysis of your answers with specific improvement suggestions.',
      icon: Zap
    },
    {
      title: 'Track Your Progress',
      description: 'Monitor improvement over time with detailed analytics and performance history.',
      icon: TrendingUp
    },
    {
      title: 'Learn From Experts',
      description: 'Access interview tips and strategies from industry professionals.',
      icon: BookOpen
    },
    {
      title: 'Practice Anytime',
      description: 'No scheduling needed. Practice at your convenience, 24/7 availability.',
      icon: Clock
    },
    {
      title: 'Build Confidence',
      description: 'Reduce interview anxiety through repeated practice in a safe environment.',
      icon: Shield
    }
  ];

  // Testimonials
  const testimonials = [
    {
      name: 'Priya Sharma',
      role: 'Software Engineer at Google',
      content: 'InterviewForge helped me crack my dream job! The AI questions were surprisingly similar to my actual interview.',
      rating: 5
    },
    {
      name: 'Rahul Verma',
      role: 'Data Scientist at Microsoft',
      content: 'The personalized feedback was a game-changer. I knew exactly what to improve after each practice session.',
      rating: 5
    },
    {
      name: 'Ananya Patel',
      role: 'Product Manager at Amazon',
      content: 'From nervous wreck to confident interviewer. The roadmap feature helped me structure my preparation perfectly.',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <SEO
        title="Home - AI Interview Practice"
        description="Master your technical interviews with AI-powered mock interviews. Get instant feedback, personalized roadmaps, and improve your skills."
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gray-50 dark:bg-slate-900">
        {/* Subtle pattern background */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="max-w-4xl">
            {/* Yellow badge */}
            <div className="inline-flex items-center px-4 py-2 bg-amber-100 border border-amber-200 rounded-full text-amber-700 text-sm font-medium mb-8">
              <Sparkles className="w-4 h-4 mr-2 text-amber-500" />
              AI-Powered Interview Preparation Platform
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
              Ace Your Next Interview with{' '}
              <span className="text-slate-900 dark:text-white">
                AI-Powered Practice
              </span>
            </h1>

            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mb-10 leading-relaxed">
              The intelligent platform for interview preparation. Personalized questions,
              real-time feedback, and detailed analytics — all in one system.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={scrollToForm}
                className="inline-flex items-center justify-center px-8 py-4 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-all"
              >
                Start Free Practice
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
              <Link
                to="/tips"
                className="inline-flex items-center justify-center px-8 py-4 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-700 transition-all"
              >
                <Play className="mr-2 h-5 w-5" />
                See how it works
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-shadow">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl mb-4">
                  <stat.icon className="w-6 h-6 text-blue-900 dark:text-blue-800" />
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stat.number}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose InterviewForge?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              We're not just another interview prep tool. We're your personal interview coach,
              available 24/7 to help you succeed.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="group relative bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 border border-slate-200 dark:border-slate-700">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 mb-5">
                  <benefit.icon className="w-6 h-6 text-blue-900 dark:text-blue-800" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{benefit.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Get started in minutes. No complex setup required.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((item, index) => (
              <div key={index} className="relative">
                {index < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-full w-full h-px bg-slate-300 dark:bg-slate-700" style={{ width: '100%', transform: 'translateX(-50%)' }} />
                )}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-md border border-slate-200 dark:border-slate-700 relative z-10">
                  <div className="absolute -top-4 -left-4 w-10 h-10 bg-blue-900 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    {item.step}
                  </div>
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 mb-5 mt-2">
                    <item.icon className="w-6 h-6 text-blue-900 dark:text-blue-800" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{item.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Success Stories
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400">
              Join thousands who've landed their dream jobs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 relative border border-slate-200 dark:border-slate-700">
                <Quote className="absolute top-4 right-4 w-8 h-8 text-slate-200 dark:text-slate-700" />
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-amber-400 fill-current" />
                  ))}
                </div>
                <p className="text-slate-700 dark:text-slate-300 mb-6 italic">"{testimonial.content}"</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-900 rounded-full flex items-center justify-center text-white font-bold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div className="ml-4">
                    <div className="font-semibold text-slate-900 dark:text-white">{testimonial.name}</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Free Resources CTA */}
      <section className="py-16 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">Not ready to practice yet?</h3>
              <p className="text-slate-400">Check out our free interview tips and resources to start preparing.</p>
            </div>
            <div className="flex gap-4">
              <Link
                to="/tips"
                className="inline-flex items-center px-6 py-3 bg-white text-slate-900 font-semibold rounded-lg hover:bg-slate-100 transition-all"
              >
                <BookOpen className="mr-2 h-5 w-5" />
                Interview Tips
              </Link>
              <Link
                to="/resources"
                className="inline-flex items-center px-6 py-3 bg-slate-800 text-slate-300 font-semibold rounded-lg hover:bg-slate-700 transition-all"
              >
                Free Resources
                <ChevronRight className="ml-1 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Interview Form Section */}
      <section ref={interviewFormRef} className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Ready to Start Practicing?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Upload your resume and begin your personalized mock interview
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Target Role *
                </label>
                <input
                  type="text"
                  name="role"
                  id="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-800 focus:border-blue-800 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., Software Engineer, Data Scientist, Product Manager"
                  required
                />
              </div>

              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Target Company (Optional)
                </label>
                <input
                  type="text"
                  name="company"
                  id="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-800 focus:border-blue-800 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., Google, Microsoft, Amazon"
                />
              </div>

              {/* Job Description (Optional) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Job Description (Optional)
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowJDInput(!showJDInput)}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    {showJDInput ? 'Hide' : 'Add JD'}
                    <ArrowRight className={`w-3 h-3 transition-transform ${showJDInput ? 'rotate-90' : ''}`} />
                  </button>
                </div>

                {showJDInput && (
                  <div className="space-y-2">
                    <textarea
                      name="jobDescription"
                      id="jobDescription"
                      value={formData.jobDescription}
                      onChange={handleInputChange}
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-800 focus:border-blue-800 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                      placeholder="Paste the job description here. If left empty, we'll generate one based on the role and company."
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Brain className="w-3 h-3" />
                      Providing a JD helps generate more relevant questions tailored to the actual job requirements
                    </p>
                  </div>
                )}
              </div>

              {/* Interview Mode Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Interview Mode
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setInterviewMode('short')}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${interviewMode === 'short'
                      ? 'border-blue-800 bg-indigo-50 dark:bg-blue-900/30'
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-700'
                      }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className={`w-5 h-5 ${interviewMode === 'short' ? 'text-blue-900' : 'text-gray-400'}`} />
                      <span className={`font-semibold ${interviewMode === 'short' ? 'text-blue-900 dark:text-blue-800' : 'text-gray-700 dark:text-gray-300'}`}>
                        Quick Practice
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      3 questions • ~10 minutes
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setInterviewMode('detailed')}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${interviewMode === 'detailed'
                      ? 'border-blue-800 bg-indigo-50 dark:bg-blue-900/30'
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-700'
                      }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className={`w-5 h-5 ${interviewMode === 'detailed' ? 'text-blue-900' : 'text-gray-400'}`} />
                      <span className={`font-semibold ${interviewMode === 'detailed' ? 'text-blue-900 dark:text-blue-800' : 'text-gray-700 dark:text-gray-300'}`}>
                        Full Interview
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      4 rounds • ~30-45 minutes
                    </p>
                  </button>
                </div>
                {interviewMode === 'detailed' && (
                  <p className="mt-3 text-xs text-blue-900 dark:text-blue-800 flex items-center gap-1 bg-indigo-50 dark:bg-orange-900/20 p-2 rounded-lg">
                    <Brain className="w-4 h-4" />
                    Includes: Screening → Core Skills → Problem-Solving → Bar Raiser
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Upload Resume (PDF) *
                </label>
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${isDragActive
                    ? 'border-blue-800 bg-indigo-50 dark:bg-orange-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-blue-800 dark:hover:border-blue-800'
                    }`}
                >
                  <input {...getInputProps()} />
                  {resumeFile ? (
                    <div className="space-y-2">
                      <FileText className="mx-auto h-12 w-12 text-green-500" />
                      <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                        {resumeFile.name}
                      </p>
                      <p className="text-xs text-green-500 dark:text-green-400">
                        Click or drag to replace
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {isDragActive ? 'Drop your resume here' : 'Drag and drop your resume here, or click to select'}
                      </p>
                      <p className="text-xs text-gray-500">PDF files only (max 5MB)</p>
                    </div>
                  )}
                </div>
                {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center px-6 py-4 border border-transparent rounded-xl shadow-lg text-lg font-semibold text-white bg-gradient-to-r from-blue-900 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02]"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Preparing your interview...
                  </>
                ) : (
                  <>
                    Start Your Interview
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </button>

              {!user && (
                <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                  You'll need to sign up (free) to save your results and track progress
                </p>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gray-900 dark:bg-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Award className="w-16 h-16 text-yellow-400 mx-auto mb-6" />
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Your Dream Job is One Interview Away
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Don't leave your career to chance. Practice with AI, interview with confidence.
          </p>
          <button
            onClick={scrollToForm}
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-800 to-purple-500 text-white font-bold rounded-xl hover:from-blue-900 hover:to-purple-600 transition-all transform hover:scale-105 shadow-xl"
          >
            Get Started Free
            <ArrowRight className="ml-2 h-5 w-5" />
          </button>
        </div>
      </section>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => {
          setShowAuthModal(false);
          setFormDataToSubmit(null);
        }}
        initialMode="login"
      />
    </div>
  );
};

export default Home;
