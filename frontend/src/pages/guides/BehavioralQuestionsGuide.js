import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../../components/SEO';
import { MessageSquare, ArrowLeft, Clock, Star, CheckCircle, AlertCircle, Lightbulb } from 'lucide-react';

const BehavioralQuestionsGuide = () => {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <SEO title="Behavioral Interview Questions Bank" description="50+ most common behavioral questions with sample answers using STAR method." url="/resources/behavioral-questions" />
            
            {/* Header */}
            <section className="bg-gradient-to-br from-green-600 to-green-800 py-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Link to="/resources" className="inline-flex items-center text-green-200 hover:text-white mb-6 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Resources
                    </Link>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                            <MessageSquare className="w-7 h-7 text-white" />
                        </div>
                        <span className="px-3 py-1 bg-white/20 text-white text-sm font-medium rounded-full">Comprehensive Guide</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">Behavioral Interview Questions Bank</h1>
                    <p className="text-xl text-green-100 mb-4">Master the most common behavioral questions with proven STAR-format answers and expert tips.</p>
                    <div className="flex items-center text-green-200 text-sm">
                        <Clock className="w-4 h-4 mr-1" />
                        25 min read • 50+ questions with examples
                    </div>
                </div>
            </section>

            {/* Content */}
            <article className="py-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Table of Contents */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md mb-10 border border-gray-100 dark:border-gray-700">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">📋 Table of Contents</h2>
                        <nav className="space-y-2 text-sm">
                            <a href="#star-method" className="block text-green-600 hover:text-green-800 dark:text-green-400">1. Mastering the STAR Method</a>
                            <a href="#leadership" className="block text-green-600 hover:text-green-800 dark:text-green-400">2. Leadership & Initiative Questions</a>
                            <a href="#problem-solving" className="block text-green-600 hover:text-green-800 dark:text-green-400">3. Problem Solving & Analysis Questions</a>
                            <a href="#conflict" className="block text-green-600 hover:text-green-800 dark:text-green-400">4. Conflict & Challenges Questions</a>
                            <a href="#teamwork" className="block text-green-600 hover:text-green-800 dark:text-green-400">5. Teamwork & Collaboration Questions</a>
                            <a href="#common-mistakes" className="block text-green-600 hover:text-green-800 dark:text-green-400">6. Common Mistakes to Avoid</a>
                            <a href="#preparation" className="block text-green-600 hover:text-green-800 dark:text-green-400">7. How to Prepare Your Stories</a>
                        </nav>
                    </div>

                    {/* Section 1 - STAR Method */}
                    <section id="star-method" className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 pb-2 border-b border-gray-200 dark:border-gray-700">
                            1. Mastering the STAR Method
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                            The STAR method is the gold standard for answering behavioral interview questions. It provides a clear structure that helps you deliver complete, compelling answers while showcasing your skills and accomplishments.
                        </p>
                        
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                            {[
                                { letter: 'S', title: 'Situation', time: '10%', desc: 'Set the scene. Provide context about where you were, your role, and what was happening.' },
                                { letter: 'T', title: 'Task', time: '10%', desc: 'Explain your specific responsibility or the challenge you needed to address.' },
                                { letter: 'A', title: 'Action', time: '60%', desc: 'Detail the specific steps YOU took. Use "I" not "we". This is the most important part.' },
                                { letter: 'R', title: 'Result', time: '20%', desc: 'Share the outcome with specific metrics. What did you learn? What was the impact?' },
                            ].map((item) => (
                                <div key={item.letter} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md border border-gray-100 dark:border-gray-700">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                                            {item.letter}
                                        </div>
                                        <span className="text-xs text-green-600 font-medium">{item.time}</span>
                                    </div>
                                    <h4 className="font-medium text-gray-900 dark:text-white text-sm">{item.title}</h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.desc}</p>
                                </div>
                            ))}
                        </div>

                        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <Lightbulb className="w-5 h-5 text-amber-600 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-amber-800 dark:text-amber-200">Pro Tip: The 2-Minute Rule</p>
                                    <p className="text-sm text-amber-700 dark:text-amber-300">
                                        Keep your answers between 1.5-2.5 minutes. Practice timing yourself. Shorter loses detail; longer loses attention.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Section 2 - Leadership Questions */}
                    <section id="leadership" className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 pb-2 border-b border-gray-200 dark:border-gray-700">
                            2. Leadership & Initiative Questions
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            These questions assess your ability to take ownership, inspire others, and drive results. Even individual contributors should have leadership examples.
                        </p>

                        {/* Question 1 */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-100 dark:border-gray-700 mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                                "Tell me about a time you led a project from start to finish."
                            </h3>
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mb-4">
                                <p className="text-sm text-blue-800 dark:text-blue-200">
                                    <strong>🎯 What they're evaluating:</strong> Project management, ownership, ability to deliver results, handling obstacles
                                </p>
                            </div>
                            <div className="space-y-4 text-sm">
                                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                                    <span className="inline-block px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded text-xs font-medium mb-2">Situation</span>
                                    <p className="text-gray-600 dark:text-gray-400">Our engineering team was falling behind on a critical product launch. Two senior developers had just left, and morale was low. The project was at risk of missing a $500K revenue deadline.</p>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                                    <span className="inline-block px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded text-xs font-medium mb-2">Task</span>
                                    <p className="text-gray-600 dark:text-gray-400">As the most senior remaining engineer, I volunteered to lead the recovery effort with the goal of launching within the original deadline.</p>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                                    <span className="inline-block px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded text-xs font-medium mb-2">Action</span>
                                    <p className="text-gray-600 dark:text-gray-400">I organized a requirements session with the PM to cut non-essential features. I broke work into 2-week sprints with clear milestones. I held daily 15-minute standups to identify blockers quickly. I personally mentored two junior developers on critical components. When we hit a technical roadblock, I evaluated three solutions and made the final architectural decision.</p>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                                    <span className="inline-block px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded text-xs font-medium mb-2">Result</span>
                                    <p className="text-gray-600 dark:text-gray-400">We launched on time with 98% feature completeness. The project generated $1.2M in the first quarter. I was promoted to Tech Lead based on this performance, and the two junior developers became strong contributors.</p>
                                </div>
                            </div>
                        </div>

                        {/* Question 2 */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-100 dark:border-gray-700 mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                                "Describe a time you took initiative beyond your normal responsibilities."
                            </h3>
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mb-4">
                                <p className="text-sm text-blue-800 dark:text-blue-200">
                                    <strong>🎯 What they're evaluating:</strong> Proactivity, ownership mindset, ability to identify and solve problems independently
                                </p>
                            </div>
                            <div className="space-y-4 text-sm">
                                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                                    <span className="inline-block px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded text-xs font-medium mb-2">Situation</span>
                                    <p className="text-gray-600 dark:text-gray-400">I noticed our customer support team was overwhelmed with the same 15-20 questions every day, spending hours on repetitive responses while customers waited for answers.</p>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                                    <span className="inline-block px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded text-xs font-medium mb-2">Task</span>
                                    <p className="text-gray-600 dark:text-gray-400">Though documentation wasn't my responsibility as a frontend developer, I decided to tackle this problem proactively to help the team and improve customer experience.</p>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                                    <span className="inline-block px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded text-xs font-medium mb-2">Action</span>
                                    <p className="text-gray-600 dark:text-gray-400">I analyzed 500 support tickets over two weeks to identify the top recurring questions. I created a comprehensive FAQ page with clear screenshots and video tutorials. I worked with the support team to ensure accuracy and implemented a search feature to help users find answers quickly. I also integrated analytics to track which articles were most helpful.</p>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                                    <span className="inline-block px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded text-xs font-medium mb-2">Result</span>
                                    <p className="text-gray-600 dark:text-gray-400">Support ticket volume decreased by 35% within the first month. Customer satisfaction scores improved from 3.8 to 4.4 out of 5. The support team saved approximately 20 hours per week, and I received a spot bonus for the initiative.</p>
                                </div>
                            </div>
                        </div>

                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">More Leadership Questions to Prepare</h3>
                        <ul className="space-y-2 text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                            <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" /> Tell me about a time you influenced others without direct authority.</li>
                            <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" /> Describe a situation where you had to make a difficult decision quickly.</li>
                            <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" /> Tell me about a time you motivated a struggling team member.</li>
                            <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" /> Describe when you had to delegate effectively under time pressure.</li>
                        </ul>
                    </section>

                    {/* Section 3 - Problem Solving */}
                    <section id="problem-solving" className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 pb-2 border-b border-gray-200 dark:border-gray-700">
                            3. Problem Solving & Analysis Questions
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            These questions reveal your analytical thinking, debugging skills, and approach to complex challenges. Technical and non-technical roles both need strong problem-solving examples.
                        </p>

                        {/* Question 1 */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-100 dark:border-gray-700 mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                                "Tell me about the most difficult problem you've solved."
                            </h3>
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mb-4">
                                <p className="text-sm text-blue-800 dark:text-blue-200">
                                    <strong>🎯 What they're evaluating:</strong> Analytical depth, persistence, systematic approach, technical competence
                                </p>
                            </div>
                            <div className="space-y-4 text-sm">
                                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                                    <span className="inline-block px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded text-xs font-medium mb-2">Situation</span>
                                    <p className="text-gray-600 dark:text-gray-400">Our production application was experiencing intermittent failures affecting 5% of user requests, but only during peak hours. Traditional logging showed nothing abnormal, and the issue had been open for 3 weeks.</p>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                                    <span className="inline-block px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded text-xs font-medium mb-2">Task</span>
                                    <p className="text-gray-600 dark:text-gray-400">As the on-call engineer, I was responsible for identifying the root cause and implementing a fix within our 48-hour SLA before it escalated to leadership.</p>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                                    <span className="inline-block px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded text-xs font-medium mb-2">Action</span>
                                    <p className="text-gray-600 dark:text-gray-400">I implemented detailed request tracing across all microservices using distributed tracing. After analyzing patterns, I noticed failures correlated with specific database connection pool exhaustion. I discovered a race condition in our connection handling code where connections weren't being released under specific concurrent access patterns. I wrote a reproduction test to confirm the issue, fixed the race condition using proper locking mechanisms, and added monitoring alerts for connection pool health.</p>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                                    <span className="inline-block px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded text-xs font-medium mb-2">Result</span>
                                    <p className="text-gray-600 dark:text-gray-400">Error rate dropped from 5% to 0.01%. I documented the investigation process and created a runbook for similar issues. The fix was backported to two other services with the same pattern, preventing future outages. I presented the case study at our engineering all-hands.</p>
                                </div>
                            </div>
                        </div>

                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">More Problem Solving Questions to Prepare</h3>
                        <ul className="space-y-2 text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                            <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" /> Describe a time when you had to make a decision with incomplete information.</li>
                            <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" /> Tell me about a time you had to learn something new quickly.</li>
                            <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" /> Describe a time you analyzed data to make a business decision.</li>
                            <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" /> Tell me about a time you simplified a complex problem.</li>
                        </ul>
                    </section>

                    {/* Section 4 - Conflict */}
                    <section id="conflict" className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 pb-2 border-b border-gray-200 dark:border-gray-700">
                            4. Conflict & Challenges Questions
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Interviewers want to see how you handle difficult situations professionally. These questions reveal your emotional intelligence, resilience, and self-awareness.
                        </p>

                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-red-800 dark:text-red-200">Critical Rule</p>
                                    <p className="text-sm text-red-700 dark:text-red-300">
                                        Never badmouth previous employers, managers, or colleagues. Focus on the situation, not personalities. Show how you handled it professionally.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Question 1 */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-100 dark:border-gray-700 mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                                "Tell me about a time you disagreed with your manager."
                            </h3>
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mb-4">
                                <p className="text-sm text-blue-800 dark:text-blue-200">
                                    <strong>🎯 What they're evaluating:</strong> Communication skills, professional disagreement, ability to advocate while respecting hierarchy
                                </p>
                            </div>
                            <div className="space-y-4 text-sm">
                                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                                    <span className="inline-block px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded text-xs font-medium mb-2">Situation</span>
                                    <p className="text-gray-600 dark:text-gray-400">My manager wanted to skip the code review process for a critical feature to meet an aggressive deadline. I was concerned this posed significant risk to system stability.</p>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                                    <span className="inline-block px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded text-xs font-medium mb-2">Task</span>
                                    <p className="text-gray-600 dark:text-gray-400">I needed to express my concerns professionally while respecting the legitimate timeline pressure my manager was under.</p>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                                    <span className="inline-block px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded text-xs font-medium mb-2">Action</span>
                                    <p className="text-gray-600 dark:text-gray-400">I requested a private 15-minute meeting rather than discussing in front of the team. I came prepared with data showing the last three rushed releases had resulted in 40+ hours of production issues. I proposed a compromise: a lightweight review process focusing only on critical paths that would add just 4 hours to the timeline. I offered to personally conduct all reviews to minimize delays.</p>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                                    <span className="inline-block px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded text-xs font-medium mb-2">Result</span>
                                    <p className="text-gray-600 dark:text-gray-400">My manager agreed to the modified review process. The reviews caught two significant bugs that would have caused outages. After this, my manager cited this example in my performance review as evidence of good judgment, and we adopted the lightweight review as a standard practice for time-sensitive releases.</p>
                                </div>
                            </div>
                        </div>

                        {/* Question 2 */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-100 dark:border-gray-700 mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                                "Describe a time when you failed. What did you learn?"
                            </h3>
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mb-4">
                                <p className="text-sm text-blue-800 dark:text-blue-200">
                                    <strong>🎯 What they're evaluating:</strong> Self-awareness, accountability, growth mindset, ability to learn from mistakes
                                </p>
                            </div>
                            <div className="space-y-4 text-sm">
                                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                                    <span className="inline-block px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded text-xs font-medium mb-2">Situation</span>
                                    <p className="text-gray-600 dark:text-gray-400">I was leading the migration of our authentication system to a new provider. I underestimated the complexity and confidently promised a 6-week timeline to stakeholders.</p>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                                    <span className="inline-block px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded text-xs font-medium mb-2">Task</span>
                                    <p className="text-gray-600 dark:text-gray-400">When it became clear at week 4 that we would miss the deadline by 3+ weeks, I had to manage the consequences and maintain stakeholder trust.</p>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                                    <span className="inline-block px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded text-xs font-medium mb-2">Action</span>
                                    <p className="text-gray-600 dark:text-gray-400">I immediately informed my manager and stakeholders about the delay and took full responsibility for the poor estimate. I analyzed what went wrong: I hadn't accounted for legacy integrations and had been overconfident about the new provider's documentation quality. I created a detailed revised timeline with buffer for unknowns. I started holding weekly stakeholder updates to maintain visibility and trust.</p>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                                    <span className="inline-block px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded text-xs font-medium mb-2">Result</span>
                                    <p className="text-gray-600 dark:text-gray-400">We delivered 2.5 weeks late, but with zero production issues. I rebuilt stakeholder trust through transparency. I changed my estimation process: I now add 40% buffer for projects involving legacy systems and always do a technical spike before committing to timelines. My estimates have been within 10% accuracy since then.</p>
                                </div>
                            </div>
                        </div>

                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">More Conflict Questions to Prepare</h3>
                        <ul className="space-y-2 text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                            <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" /> Tell me about a time you received difficult feedback.</li>
                            <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" /> Describe a situation where you had to deal with an unhappy customer or stakeholder.</li>
                            <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" /> Tell me about a time you had to adapt to a significant change at work.</li>
                            <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" /> Describe a time you missed a deadline. What happened?</li>
                        </ul>
                    </section>

                    {/* Section 5 - Teamwork */}
                    <section id="teamwork" className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 pb-2 border-b border-gray-200 dark:border-gray-700">
                            5. Teamwork & Collaboration Questions
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Every role requires collaboration. These questions assess your interpersonal skills, ability to work with diverse personalities, and contribution to team success.
                        </p>

                        {/* Question 1 */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-100 dark:border-gray-700 mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                                "Tell me about a time you worked with a difficult team member."
                            </h3>
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mb-4">
                                <p className="text-sm text-blue-800 dark:text-blue-200">
                                    <strong>🎯 What they're evaluating:</strong> Interpersonal skills, empathy, conflict resolution, ability to find common ground
                                </p>
                            </div>
                            <div className="space-y-4 text-sm">
                                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                                    <span className="inline-block px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded text-xs font-medium mb-2">Situation</span>
                                    <p className="text-gray-600 dark:text-gray-400">A senior engineer on my team was dismissive of my suggestions in meetings and often took credit for ideas I had shared earlier. This was affecting my confidence and the team's dynamics.</p>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                                    <span className="inline-block px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded text-xs font-medium mb-2">Task</span>
                                    <p className="text-gray-600 dark:text-gray-400">I needed to address this without creating more conflict or appearing to complain to management.</p>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                                    <span className="inline-block px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded text-xs font-medium mb-2">Action</span>
                                    <p className="text-gray-600 dark:text-gray-400">I scheduled a casual coffee chat and approached it with curiosity rather than accusation. I said, "I value your experience, and I want to make sure we're collaborating effectively. I've noticed some tension and want to understand your perspective." I discovered he felt threatened by a newer team member getting visibility. We discussed how we could highlight each other's contributions. I also started documenting my ideas in writing before meetings to establish a clear record.</p>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                                    <span className="inline-block px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded text-xs font-medium mb-2">Result</span>
                                    <p className="text-gray-600 dark:text-gray-400">Our relationship transformed. He became a mentor and publicly advocated for my promotion. The team noticed our improved dynamic, which helped overall team morale. I learned that difficult behavior often comes from insecurity, and addressing it with empathy is more effective than confrontation.</p>
                                </div>
                            </div>
                        </div>

                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">More Teamwork Questions to Prepare</h3>
                        <ul className="space-y-2 text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                            <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" /> Describe your most successful team project.</li>
                            <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" /> Tell me about a time you helped a colleague succeed.</li>
                            <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" /> Describe a time you had to work with someone from a different department.</li>
                            <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" /> Tell me about a time you had to give constructive feedback to a peer.</li>
                        </ul>
                    </section>

                    {/* Section 6 - Common Mistakes */}
                    <section id="common-mistakes" className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 pb-2 border-b border-gray-200 dark:border-gray-700">
                            6. Common Mistakes to Avoid
                        </h2>

                        <div className="grid sm:grid-cols-2 gap-4">
                            {[
                                { mistake: 'Being too vague', fix: 'Use specific numbers, dates, and outcomes. "Improved performance by 40%" not "made things better"' },
                                { mistake: 'Saying "we" instead of "I"', fix: 'Interviewers want to know YOUR contribution. Say "I did X" even when describing team projects.' },
                                { mistake: 'Rambling too long', fix: 'Practice the 2-minute rule. If you go over 3 minutes, you\'re losing them.' },
                                { mistake: 'Not preparing enough stories', fix: 'Have 6-8 diverse stories ready. Each should be adaptable to multiple question types.' },
                                { mistake: 'Picking weak examples', fix: 'Choose stories with real challenges, meaningful actions, and impressive results.' },
                                { mistake: 'Forgetting the result', fix: 'Always end with measurable impact. "So what?" is the question you must answer.' },
                            ].map((item, i) => (
                                <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                                    <p className="text-sm font-medium text-red-600 mb-2">❌ {item.mistake}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">✓ {item.fix}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Section 7 - Preparation */}
                    <section id="preparation" className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 pb-2 border-b border-gray-200 dark:border-gray-700">
                            7. How to Prepare Your Stories
                        </h2>

                        <ol className="space-y-4 text-gray-600 dark:text-gray-400">
                            <li className="flex gap-3">
                                <span className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
                                <div>
                                    <strong className="text-gray-900 dark:text-white">Brainstorm 10-15 experiences</strong>
                                    <p className="text-sm mt-1">Think about projects, challenges, achievements, failures, and interactions from your career.</p>
                                </div>
                            </li>
                            <li className="flex gap-3">
                                <span className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
                                <div>
                                    <strong className="text-gray-900 dark:text-white">Select the 6-8 strongest</strong>
                                    <p className="text-sm mt-1">Choose stories with clear challenges, significant actions, and measurable results.</p>
                                </div>
                            </li>
                            <li className="flex gap-3">
                                <span className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
                                <div>
                                    <strong className="text-gray-900 dark:text-white">Write them out in STAR format</strong>
                                    <p className="text-sm mt-1">Document each component. This helps you remember details and structure.</p>
                                </div>
                            </li>
                            <li className="flex gap-3">
                                <span className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">4</span>
                                <div>
                                    <strong className="text-gray-900 dark:text-white">Practice out loud</strong>
                                    <p className="text-sm mt-1">Rehearse until each story is 1.5-2 minutes. Record yourself and listen back.</p>
                                </div>
                            </li>
                            <li className="flex gap-3">
                                <span className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">5</span>
                                <div>
                                    <strong className="text-gray-900 dark:text-white">Map stories to common questions</strong>
                                    <p className="text-sm mt-1">Each story should be adaptable to 3-4 different question types.</p>
                                </div>
                            </li>
                        </ol>
                    </section>

                    {/* CTA */}
                    <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-2xl p-8 text-center">
                        <Star className="w-10 h-10 text-yellow-300 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-white mb-3">Practice Makes Perfect</h3>
                        <p className="text-green-100 mb-6">Practice answering these questions with our AI interviewer who provides real-time feedback.</p>
                        <Link to="/" className="inline-flex items-center px-6 py-3 bg-white text-green-600 font-semibold rounded-lg hover:bg-green-50 transition-all">
                            Start Practice Interview
                        </Link>
                    </div>
                </div>
            </article>
        </div>
    );
};

export default BehavioralQuestionsGuide;
