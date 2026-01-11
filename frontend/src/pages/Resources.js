import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { BookOpen, FileText, TrendingUp, Users, Briefcase, Code, MessageSquare, ArrowRight, Star, Clock } from 'lucide-react';

const Resources = () => {
    const guides = [
        { title: 'Complete Interview Preparation Guide', description: 'A comprehensive guide covering everything from resume building to salary negotiation.', icon: BookOpen, readTime: '15 min read', category: 'Guide', color: 'blue', url: '/resources/interview-prep' },
        { title: 'Behavioral Interview Questions Bank', description: '50+ most common behavioral questions with sample answers using STAR method.', icon: MessageSquare, readTime: '20 min read', category: 'Questions', color: 'green', url: '/resources/behavioral-questions' },
        { title: 'Technical Interview Patterns', description: 'Master the most common coding patterns asked in FAANG interviews.', icon: Code, readTime: '25 min read', category: 'Technical', color: 'purple', url: '/resources/technical-patterns' },
        { title: 'System Design Basics', description: 'Learn how to approach system design interviews step-by-step.', icon: Briefcase, readTime: '30 min read', category: 'Technical', color: 'orange', url: '/resources/system-design' }
    ];

    const industryInsights = [
        { title: '2025 Tech Hiring Trends', excerpt: 'AI and ML roles see 150% increase in demand. Remote-first companies now offering competitive packages...', date: 'Aug 2025', tag: 'Trending' },
        { title: 'What Recruiters Really Look For', excerpt: 'We interviewed 50 tech recruiters to understand what makes candidates stand out in 2025...', date: 'Aug 2025', tag: 'Insights' },
        { title: 'Salary Negotiation Strategies', excerpt: 'Learn how to negotiate your offer effectively. Real data from successful negotiations...', date: 'Jul 2025', tag: 'Career' },
        { title: 'Remote Interview Best Practices', excerpt: 'With 70% of interviews now virtual, here\'s how to make a great impression online...', date: 'Jul 2025', tag: 'Tips' }
    ];

    const companyGuides = [
        { name: 'Google', roles: 'SWE, PM, DS', difficulty: 'Hard', logo: '🔵' },
        { name: 'Amazon', roles: 'SDE, TPM, BA', difficulty: 'Hard', logo: '🟠' },
        { name: 'Microsoft', roles: 'SWE, PM, DE', difficulty: 'Medium-Hard', logo: '🟢' },
        { name: 'Meta', roles: 'SWE, DS, MLE', difficulty: 'Hard', logo: '🔵' },
        { name: 'Apple', roles: 'SWE, HW, Design', difficulty: 'Hard', logo: '⚪' },
        { name: 'Netflix', roles: 'SWE, Data, ML', difficulty: 'Very Hard', logo: '🔴' },
    ];

    const freeTools = [
        { name: 'Resume ATS Checker', description: 'Check if your resume passes Applicant Tracking Systems', icon: FileText, status: 'Coming Soon' },
        { name: 'Salary Calculator', description: 'Compare salaries across companies and locations', icon: TrendingUp, status: 'Coming Soon' },
        { name: 'Mock Interview Scheduler', description: 'Connect with peers for practice interviews', icon: Users, status: 'Coming Soon' }
    ];

    const colorClasses = {
        blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
        green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
        purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
        orange: 'bg-blue-100 dark:bg-blue-900/30 text-orange-600 dark:text-blue-800',
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <SEO title="Free Resources - Interview Prep" description="Access free interview preparation resources including guides, question banks, industry insights, and company-specific preparation tips." url="/resources" />

            <section className="bg-gray-50 dark:bg-slate-900 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="inline-flex items-center px-4 py-2 bg-emerald-100 border border-emerald-200 rounded-full text-emerald-700 text-sm font-medium mb-6">
                        <BookOpen className="w-4 h-4 mr-2 text-emerald-500" />100% Free Resources
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4">Interview Preparation Resources</h1>
                    <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl">Everything you need to prepare for your next interview. Guides, question banks, industry insights, and more.</p>
                </div>
            </section>

            <section className="py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-10">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Preparation Guides</h2>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">In-depth guides to master every aspect of interviewing</p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                        {guides.map((guide, index) => (
                            <Link to={guide.url} key={index} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group block">
                                <div className="flex items-start gap-5">
                                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClasses[guide.color]}`}>
                                        <guide.icon className="w-7 h-7" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <span className="text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-full">{guide.category}</span>
                                            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center">
                                                <Clock className="w-3.5 h-3.5 mr-1" />
                                                {guide.readTime}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{guide.title}</h3>
                                        <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm leading-relaxed">{guide.description}</p>
                                        <span className="mt-4 text-blue-600 dark:text-blue-400 font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                                            Read Guide <ArrowRight className="w-4 h-4" />
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-16 bg-white dark:bg-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-8">
                        <div><h2 className="text-2xl font-bold text-gray-900 dark:text-white">Industry Insights</h2><p className="text-gray-600 dark:text-gray-400">Stay updated with the latest hiring trends</p></div>
                        <Link to="#" className="text-blue-900 dark:text-blue-800 font-medium flex items-center hover:gap-2 transition-all">View All<ArrowRight className="w-4 h-4 ml-1" /></Link>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {industryInsights.map((article, index) => (
                            <article key={index} className="bg-gray-50 dark:bg-gray-900 rounded-xl p-5 hover:shadow-lg transition-shadow cursor-pointer group">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs font-medium text-blue-900 dark:text-blue-800 bg-indigo-50 dark:bg-blue-900/30 px-2 py-1 rounded">{article.tag}</span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">{article.date}</span>
                                </div>
                                <h3 className="font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-900 dark:group-hover:text-blue-800 transition-colors">{article.title}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">{article.excerpt}</p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12"><h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Company Interview Guides</h2><p className="text-gray-600 dark:text-gray-400">Prepare for interviews at top tech companies</p></div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {companyGuides.map((company, index) => (
                            <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow hover:shadow-lg transition-shadow cursor-pointer group">
                                <div className="flex items-center gap-4">
                                    <div className="text-3xl">{company.logo}</div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-blue-900 dark:group-hover:text-blue-800">{company.name}</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{company.roles}</p>
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded ${company.difficulty === 'Very Hard' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : company.difficulty === 'Hard' ? 'bg-blue-100 text-orange-600 dark:bg-blue-900/30 dark:text-blue-800' : 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>{company.difficulty}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-16 bg-white dark:bg-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12"><h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Free Tools</h2><p className="text-gray-600 dark:text-gray-400">Helpful tools to boost your job search</p></div>
                    <div className="grid md:grid-cols-3 gap-6">
                        {freeTools.map((tool, index) => (
                            <div key={index} className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 relative overflow-hidden">
                                <div className="absolute top-3 right-3"><span className="text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-800 px-2 py-1 rounded">{tool.status}</span></div>
                                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-4"><tool.icon className="w-6 h-6 text-blue-900 dark:text-blue-800" /></div>
                                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{tool.name}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{tool.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-16 bg-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="text-center md:text-left"><h3 className="text-2xl font-bold text-white mb-2">Want More Interview Tips?</h3><p className="text-slate-400">Check out our comprehensive interview tips section with detailed strategies.</p></div>
                        <Link to="/tips" className="inline-flex items-center px-6 py-3 bg-white text-slate-900 font-semibold rounded-lg hover:bg-slate-100 transition-all">View Interview Tips<ArrowRight className="ml-2 h-5 w-5" /></Link>
                    </div>
                </div>
            </section>

            <section className="py-16 bg-slate-900">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <Star className="w-12 h-12 text-amber-400 mx-auto mb-6" />
                    <h2 className="text-3xl font-bold text-white mb-4">Ready to Put Your Knowledge to the Test?</h2>
                    <p className="text-xl text-slate-400 mb-8">Practice makes perfect. Start a mock interview and see how you do.</p>
                    <Link to="/" className="inline-flex items-center px-8 py-4 bg-white text-slate-900 font-semibold rounded-lg hover:bg-slate-100 transition-all">Start Practice Interview<ArrowRight className="ml-2 h-5 w-5" /></Link>
                </div>
            </section>
        </div>
    );
};

export default Resources;
