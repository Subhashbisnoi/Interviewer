import React from 'react';
import {
    TrendingUp,
    Users,
    Building2,
    Calendar,
    Target,
    Lightbulb,
    ArrowRight,
    CheckCircle,
    Clock,
    Star
} from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

const Insights = () => {
    const trends = [
        {
            title: "AI & Automation Skills Are in Demand",
            description: "Companies are prioritizing candidates who understand AI tools, automation, and can work alongside AI systems effectively.",
            icon: Target,
            highlight: "78% of tech roles now mention AI skills"
        },
        {
            title: "Remote Interview Skills Matter",
            description: "Virtual interviews are here to stay. Body language on camera, tech setup, and clear audio are as important as your answers.",
            icon: Users,
            highlight: "65% of first-round interviews are virtual"
        },
        {
            title: "Behavioral Questions Are Increasing",
            description: "Companies are investing more in culture fit. Expect more 'Tell me about a time...' questions even in technical roles.",
            icon: Building2,
            highlight: "40% of interview time is behavioral"
        }
    ];

    const timeline = [
        {
            week: "4+ Weeks Before",
            tasks: [
                "Research target companies and roles",
                "Update and tailor your resume",
                "Start practicing common questions daily",
                "Identify gaps in your knowledge to study"
            ]
        },
        {
            week: "2-3 Weeks Before",
            tasks: [
                "Deep dive into company research",
                "Practice with mock interviews",
                "Prepare your STAR stories",
                "Test your video/audio setup"
            ]
        },
        {
            week: "1 Week Before",
            tasks: [
                "Review job description in detail",
                "Prepare questions before",
                "Plan your interview outfit",
                "Do final mock interview runs"
            ]
        },
        {
            week: "Day Before",
            tasks: [
                "Get a good night's sleep",
                "Prepare documents and materials",
                "Review your research notes",
                "Confirm interview logistics"
            ]
        }
    ];

    const interviewerLookFor = [
        {
            quality: "Problem-Solving Approach",
            description: "How you break down complex problems into manageable parts",
            percentage: 85
        },
        {
            quality: "Communication Clarity",
            description: "Your ability to explain technical concepts simply",
            percentage: 80
        },
        {
            quality: "Cultural Fit",
            description: "How well your values align with the company",
            percentage: 75
        },
        {
            quality: "Growth Mindset",
            description: "Willingness to learn and adapt to new challenges",
            percentage: 70
        },
        {
            quality: "Technical Competence",
            description: "Actual skills and knowledge for the role",
            percentage: 65
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <SEO
                title="Career Insights & Hiring Trends"
                description="Stay ahead with the latest hiring trends, interview insights, and career preparation strategies for 2025."
            />

            {/* Hero Section */}
            <section className="bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 text-white py-16">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <TrendingUp className="w-16 h-16 mx-auto mb-6 text-cyan-300" />
                    <h1 className="text-4xl font-bold mb-4">Career Insights & Trends</h1>
                    <p className="text-xl text-indigo-200 max-w-2xl mx-auto">
                        What interviewers are looking for in 2025 and how to stand out.
                    </p>
                </div>
            </section>

            {/* Hiring Trends Section */}
            <section className="py-16">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
                        2025 Hiring Trends
                    </h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {trends.map((trend, index) => (
                            <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center mb-4">
                                    <trend.icon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{trend.title}</h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-4">{trend.description}</p>
                                <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg px-4 py-2">
                                    <span className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm">{trend.highlight}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* What Interviewers Look For */}
            <section className="py-16 bg-gray-100 dark:bg-gray-800">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-4">
                        What Interviewers Actually Look For
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 text-center mb-12">
                        Based on interviews with 500+ hiring managers across tech companies
                    </p>

                    <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg">
                        <div className="space-y-6">
                            {interviewerLookFor.map((item, index) => (
                                <div key={index}>
                                    <div className="flex justify-between mb-2">
                                        <div>
                                            <h3 className="font-semibold text-gray-900 dark:text-white">{item.quality}</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{item.description}</p>
                                        </div>
                                        <span className="text-indigo-600 dark:text-indigo-400 font-bold">{item.percentage}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                                        <div
                                            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all"
                                            style={{ width: `${item.percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-6 text-center">
                            * Note: Technical competence is expected as baseline. These percentages show what differentiates candidates.
                        </p>
                    </div>
                </div>
            </section>

            {/* Interview Prep Timeline */}
            <section className="py-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-4">
                        Your Interview Prep Timeline
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 text-center mb-12">
                        A week-by-week guide to interview preparation
                    </p>

                    <div className="space-y-6">
                        {timeline.map((phase, index) => (
                            <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-bold">
                                        {index + 1}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{phase.week}</h3>
                                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                            <Clock className="w-4 h-4" />
                                            <span>Key focus areas</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid sm:grid-cols-2 gap-3 ml-16">
                                    {phase.tasks.map((task, taskIndex) => (
                                        <div key={taskIndex} className="flex items-center gap-2">
                                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                                            <span className="text-gray-600 dark:text-gray-300">{task}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <Star className="w-12 h-12 mx-auto mb-6 opacity-80" />
                    <h2 className="text-3xl font-bold mb-4">Put These Insights Into Practice</h2>
                    <p className="text-xl text-indigo-100 mb-8">
                        Knowledge without practice is just theory. Start an interview and apply what you've learned.
                    </p>
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-white text-indigo-600 font-semibold rounded-xl hover:bg-indigo-100 transition-all"
                    >
                        Start Practice Interview
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default Insights;
