import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { Target, Users, Award, Zap } from 'lucide-react';


const About = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <SEO
        title="About Us"
        description="Learn about AI Interviewer's mission to democratize technical interview preparation with advanced AI technology."
        url="/about"
      />
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            About AI Interviewer
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Empowering job seekers to excel in interviews through AI-powered practice and personalized feedback
          </p>
        </div>

        {/* Mission Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-12">
          <div className="flex items-start space-x-4 mb-6">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Our Mission</h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                At AI Interviewer, we believe that everyone deserves the opportunity to succeed in their career journey.
                Our mission is to democratize interview preparation by providing accessible, AI-powered tools that help
                job seekers practice, improve, and gain confidence before their real interviews.
              </p>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
              <Zap className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">AI-Powered</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Leveraging advanced AI technology to provide realistic interview simulations and intelligent feedback.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">User-Centric</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Designed with job seekers in mind, providing an intuitive and supportive learning environment.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mb-4">
              <Award className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Results-Driven</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Focused on helping you improve with detailed feedback, personalized roadmaps, and progress tracking.
            </p>
          </div>
        </div>

        {/* Story Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-8 md:p-12 text-white mb-12">
          <h2 className="text-3xl font-bold mb-6">Our Story</h2>
          <div className="space-y-4 text-lg">
            <p>
              AI Interviewer was born from the recognition that traditional interview preparation methods
              are often expensive, time-consuming, and not accessible to everyone.
            </p>
            <p>
              We set out to create a platform that combines cutting-edge AI technology with best practices
              in interview coaching, making high-quality interview preparation available to job seekers
              anywhere, anytime.
            </p>
            <p>
              Today, we're proud to help thousands of job seekers practice their interview skills,
              gain confidence, and land their dream jobs.
            </p>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border-l-4 border-blue-600 dark:border-blue-500">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Accessibility</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Making quality interview preparation accessible to everyone, regardless of their background or location.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border-l-4 border-green-600 dark:border-green-500">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Innovation</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Continuously improving our AI technology to provide the most realistic and helpful interview experience.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border-l-4 border-purple-600 dark:border-purple-500">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Empowerment</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Giving job seekers the tools and confidence they need to succeed in their career journey.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border-l-4 border-orange-600 dark:border-orange-500">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Continuous Improvement</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Always learning and evolving based on user feedback to deliver the best possible experience.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gray-100 dark:bg-gray-800 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Ready to Start Practicing?</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Join thousands of job seekers who are improving their interview skills with AI Interviewer
          </p>
          <button className="px-8 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors font-semibold">
            Get Started Now
          </button>
        </div>


      </div>
    </div>
  );
};

export default About;
