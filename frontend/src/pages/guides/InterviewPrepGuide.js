import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../../components/SEO';
import { BookOpen, ArrowLeft, Clock, Star, CheckCircle, AlertCircle, Lightbulb } from 'lucide-react';

const InterviewPrepGuide = () => {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <SEO title="Complete Interview Preparation Guide" description="A comprehensive guide covering everything from resume building to salary negotiation." url="/resources/interview-prep" />

            {/* Header */}
            <section className="bg-gradient-to-br from-blue-600 to-blue-800 py-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Link to="/resources" className="inline-flex items-center text-blue-200 hover:text-white mb-6 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Resources
                    </Link>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                            <BookOpen className="w-7 h-7 text-white" />
                        </div>
                        <span className="px-3 py-1 bg-white/20 text-white text-sm font-medium rounded-full">Comprehensive Guide</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">Complete Interview Preparation Guide</h1>
                    <p className="text-xl text-blue-100 mb-4">Everything you need to know to ace your next interview, from preparation to negotiation.</p>
                    <div className="flex items-center text-blue-200 text-sm">
                        <Clock className="w-4 h-4 mr-1" />
                        15 min read • Last updated January 2025
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
                            <a href="#understanding" className="block text-blue-600 hover:text-blue-800 dark:text-blue-400">1. Understanding the Interview Process</a>
                            <a href="#research" className="block text-blue-600 hover:text-blue-800 dark:text-blue-400">2. Research & Preparation</a>
                            <a href="#resume" className="block text-blue-600 hover:text-blue-800 dark:text-blue-400">3. Resume Optimization</a>
                            <a href="#during" className="block text-blue-600 hover:text-blue-800 dark:text-blue-400">4. During the Interview</a>
                            <a href="#questions" className="block text-blue-600 hover:text-blue-800 dark:text-blue-400">5. Answering Questions Effectively</a>
                            <a href="#after" className="block text-blue-600 hover:text-blue-800 dark:text-blue-400">6. After the Interview</a>
                            <a href="#negotiation" className="block text-blue-600 hover:text-blue-800 dark:text-blue-400">7. Salary Negotiation</a>
                        </nav>
                    </div>

                    {/* Section 1 */}
                    <section id="understanding" className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 pb-2 border-b border-gray-200 dark:border-gray-700">
                            1. Understanding the Interview Process
                        </h2>
                        <div className="prose dark:prose-invert max-w-none">
                            <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                                Modern interviews typically follow a structured process designed to evaluate candidates across multiple dimensions. Understanding this process helps you prepare more effectively and reduces anxiety.
                            </p>

                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-6 mb-3">Typical Interview Stages</h3>
                            <div className="space-y-4">
                                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                                    <h4 className="font-medium text-gray-900 dark:text-white">📞 Phone Screen (15-30 minutes)</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Initial conversation with a recruiter to verify basic qualifications, discuss the role, and assess cultural fit. Focus on your elevator pitch and key accomplishments.</p>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                                    <h4 className="font-medium text-gray-900 dark:text-white">💻 Technical Screen (45-60 minutes)</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">For technical roles, expect coding challenges, system design questions, or domain-specific assessments. Often conducted via video call with screen sharing.</p>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                                    <h4 className="font-medium text-gray-900 dark:text-white">🏢 On-site/Virtual On-site (4-6 hours)</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Multiple rounds with different interviewers covering technical skills, behavioral questions, and culture fit. Typically 4-6 separate 45-60 minute sessions.</p>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                                    <h4 className="font-medium text-gray-900 dark:text-white">👔 Final Round (30-60 minutes)</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Often with senior leadership or hiring manager. Focuses on culture fit, career goals, and ensuring mutual alignment.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Section 2 */}
                    <section id="research" className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 pb-2 border-b border-gray-200 dark:border-gray-700">
                            2. Research & Preparation
                        </h2>

                        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
                            <div className="flex items-start gap-3">
                                <Lightbulb className="w-5 h-5 text-amber-600 mt-0.5" />
                                <p className="text-sm text-amber-800 dark:text-amber-200">
                                    <strong>Pro Tip:</strong> Spend at least 2-3 hours researching before any interview. This investment pays off significantly in your confidence and the quality of your responses.
                                </p>
                            </div>
                        </div>

                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Company Research Checklist</h3>
                        <div className="grid sm:grid-cols-2 gap-4 mb-6">
                            {[
                                { title: 'Company Mission & Values', desc: 'Understand what drives the organization and align your responses accordingly' },
                                { title: 'Recent News & Announcements', desc: 'Product launches, funding rounds, leadership changes, acquisitions' },
                                { title: 'Products & Services', desc: 'Know what they sell, who their customers are, and their market position' },
                                { title: 'Competitors', desc: 'Understand the competitive landscape and the company\'s differentiators' },
                                { title: 'Company Culture', desc: 'Read Glassdoor reviews, LinkedIn posts, and company blog' },
                                { title: 'Your Interviewers', desc: 'Look up their LinkedIn profiles to find common ground' },
                            ].map((item, i) => (
                                <div key={i} className="flex items-start gap-3 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="font-medium text-gray-900 dark:text-white text-sm">{item.title}</h4>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Role-Specific Preparation</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Carefully analyze the job description and identify the top 5-7 skills or experiences they're looking for. For each one, prepare a specific example from your past that demonstrates that skill.
                        </p>
                        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                            <p className="text-sm text-gray-700 dark:text-gray-300 font-medium mb-2">Example: If the JD mentions "experience with cross-functional collaboration"</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Prepare a story about a project where you worked with designers, PMs, and engineers to ship a feature. Include the challenges, how you facilitated communication, and the outcome.
                            </p>
                        </div>
                    </section>

                    {/* Section 3 */}
                    <section id="resume" className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 pb-2 border-b border-gray-200 dark:border-gray-700">
                            3. Resume Optimization
                        </h2>

                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Your resume is your first impression. Recruiters spend an average of 6-7 seconds on initial resume screening, so every word must count.
                        </p>

                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">The Power of Quantification</h3>
                        <div className="grid sm:grid-cols-2 gap-4 mb-6">
                            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
                                <p className="text-sm font-medium text-red-700 dark:text-red-300 mb-2">❌ Weak</p>
                                <p className="text-sm text-red-600 dark:text-red-400">"Improved website performance"</p>
                            </div>
                            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                                <p className="text-sm font-medium text-green-700 dark:text-green-300 mb-2">✓ Strong</p>
                                <p className="text-sm text-green-600 dark:text-green-400">"Reduced page load time by 40%, improving user retention by 15%"</p>
                            </div>
                            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
                                <p className="text-sm font-medium text-red-700 dark:text-red-300 mb-2">❌ Weak</p>
                                <p className="text-sm text-red-600 dark:text-red-400">"Led a team of engineers"</p>
                            </div>
                            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                                <p className="text-sm font-medium text-green-700 dark:text-green-300 mb-2">✓ Strong</p>
                                <p className="text-sm text-green-600 dark:text-green-400">"Led team of 8 engineers, delivering $2M project 2 weeks early"</p>
                            </div>
                        </div>

                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">ATS Optimization Tips</h3>
                        <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                            <li className="flex items-start gap-2">
                                <span className="text-blue-500">•</span>
                                Use keywords from the job description naturally throughout your resume
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-500">•</span>
                                Avoid tables, graphics, and complex formatting that ATS can't parse
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-500">•</span>
                                Use standard section headers: "Experience", "Education", "Skills"
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-500">•</span>
                                Save as PDF unless specifically asked for Word format
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-500">•</span>
                                Keep to 1 page for &lt;10 years experience, 2 pages maximum for senior roles
                            </li>
                        </ul>
                    </section>

                    {/* Section 4 */}
                    <section id="during" className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 pb-2 border-b border-gray-200 dark:border-gray-700">
                            4. During the Interview
                        </h2>

                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">First Impressions Matter</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Research shows that interviewers often make initial judgments within the first 7 seconds. While you can recover from a weak start, it's much easier to start strong.
                        </p>

                        <div className="grid sm:grid-cols-2 gap-6 mb-6">
                            <div>
                                <h4 className="font-medium text-gray-900 dark:text-white mb-3">In-Person Interviews</h4>
                                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                    <li>• Arrive 10-15 minutes early</li>
                                    <li>• Dress one level above the company culture</li>
                                    <li>• Firm handshake and genuine smile</li>
                                    <li>• Bring copies of your resume</li>
                                    <li>• Silence your phone completely</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Virtual Interviews</h4>
                                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                    <li>• Test audio/video 30 minutes before</li>
                                    <li>• Professional, uncluttered background</li>
                                    <li>• Good lighting on your face</li>
                                    <li>• Look at camera, not screen, when speaking</li>
                                    <li>• Have backup plan (phone hotspot, phone call)</li>
                                </ul>
                            </div>
                        </div>

                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Body Language Essentials</h3>
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                            <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                                <li><strong>Eye Contact:</strong> Maintain natural eye contact 60-70% of the time</li>
                                <li><strong>Posture:</strong> Sit up straight, lean slightly forward to show engagement</li>
                                <li><strong>Hands:</strong> Keep them visible, use natural gestures when speaking</li>
                                <li><strong>Avoid:</strong> Crossing arms, fidgeting, looking at clock/phone</li>
                            </ul>
                        </div>
                    </section>

                    {/* Section 5 */}
                    <section id="questions" className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 pb-2 border-b border-gray-200 dark:border-gray-700">
                            5. Answering Questions Effectively
                        </h2>

                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">The STAR Method</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            For behavioral questions ("Tell me about a time when..."), use the STAR method to structure your responses:
                        </p>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                            {[
                                { letter: 'S', title: 'Situation', desc: 'Set the context. When, where, what was happening?' },
                                { letter: 'T', title: 'Task', desc: 'What was your responsibility or challenge?' },
                                { letter: 'A', title: 'Action', desc: 'What specific steps did YOU take?' },
                                { letter: 'R', title: 'Result', desc: 'What was the outcome? Use metrics if possible.' },
                            ].map((item) => (
                                <div key={item.letter} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md border border-gray-100 dark:border-gray-700 text-center">
                                    <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mx-auto mb-2">
                                        {item.letter}
                                    </div>
                                    <h4 className="font-medium text-gray-900 dark:text-white text-sm">{item.title}</h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.desc}</p>
                                </div>
                            ))}
                        </div>

                        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
                            <div className="flex items-start gap-3">
                                <Lightbulb className="w-5 h-5 text-amber-600 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-1">Time Allocation</p>
                                    <p className="text-sm text-amber-700 dark:text-amber-300">
                                        Spend 10% on Situation, 10% on Task, 60% on Action, and 20% on Result. Most candidates spend too much time on setup and not enough on what they actually did.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Questions to Ask Your Interviewer</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Always have 5-10 thoughtful questions prepared. This shows genuine interest and helps you evaluate the opportunity.
                        </p>
                        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                                <li>• "What does success look like in this role after 90 days?"</li>
                                <li>• "What are the biggest challenges the team is facing right now?"</li>
                                <li>• "How would you describe the team culture?"</li>
                                <li>• "What's the typical career progression for someone in this role?"</li>
                                <li>• "What do you enjoy most about working here?"</li>
                            </ul>
                        </div>
                    </section>

                    {/* Section 6 */}
                    <section id="after" className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 pb-2 border-b border-gray-200 dark:border-gray-700">
                            6. After the Interview
                        </h2>

                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">The Thank-You Email</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Send a personalized thank-you email within 24 hours to each person who interviewed you. This isn't just polite—it's a chance to reinforce your candidacy.
                        </p>

                        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md border border-gray-200 dark:border-gray-700 mb-6">
                            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Thank-You Email Template</h4>
                            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-3 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg font-mono">
                                <p>Subject: Thank you for the [Role] interview</p>
                                <p>Dear [Name],</p>
                                <p>Thank you for taking the time to speak with me today about the [Role] position. I enjoyed learning more about [specific topic discussed] and the exciting work your team is doing with [project/initiative].</p>
                                <p>Our conversation reinforced my enthusiasm for the role. I'm particularly excited about [specific aspect] and believe my experience in [relevant skill] would allow me to contribute meaningfully to the team.</p>
                                <p>Please don't hesitate to reach out if you need any additional information. I look forward to hearing from you.</p>
                                <p>Best regards,<br />[Your Name]</p>
                            </div>
                        </div>
                    </section>

                    {/* Section 7 */}
                    <section id="negotiation" className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 pb-2 border-b border-gray-200 dark:border-gray-700">
                            7. Salary Negotiation
                        </h2>

                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                                <p className="text-sm text-red-800 dark:text-red-200">
                                    <strong>Important:</strong> Never share your current salary or salary expectations early in the process. Wait until you have an offer in hand before discussing numbers.
                                </p>
                            </div>
                        </div>

                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Negotiation Framework</h3>
                        <ol className="space-y-4 text-gray-600 dark:text-gray-400">
                            <li className="flex gap-3">
                                <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
                                <div>
                                    <strong className="text-gray-900 dark:text-white">Research Market Rates</strong>
                                    <p className="text-sm mt-1">Use Levels.fyi, Glassdoor, and LinkedIn Salary to understand the market range for your role, level, and location.</p>
                                </div>
                            </li>
                            <li className="flex gap-3">
                                <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
                                <div>
                                    <strong className="text-gray-900 dark:text-white">Consider Total Compensation</strong>
                                    <p className="text-sm mt-1">Base salary, bonus, equity (RSUs/options), signing bonus, benefits, PTO, remote work flexibility all have value.</p>
                                </div>
                            </li>
                            <li className="flex gap-3">
                                <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
                                <div>
                                    <strong className="text-gray-900 dark:text-white">Counter with Confidence</strong>
                                    <p className="text-sm mt-1">Express enthusiasm, then counter 10-20% above their initial offer. Use data to justify your ask.</p>
                                </div>
                            </li>
                            <li className="flex gap-3">
                                <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">4</span>
                                <div>
                                    <strong className="text-gray-900 dark:text-white">Get It In Writing</strong>
                                    <p className="text-sm mt-1">Never accept verbally. Wait for the official offer letter with all agreed terms before giving notice at your current job.</p>
                                </div>
                            </li>
                        </ol>
                    </section>

                    {/* CTA */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 text-center">
                        <Star className="w-10 h-10 text-yellow-300 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-white mb-3">Ready to Practice?</h3>
                        <p className="text-blue-100 mb-6">Put these tips into action with our AI-powered mock interviews.</p>
                        <Link to="/" className="inline-flex items-center px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-all">
                            Start Practice Interview
                        </Link>
                    </div>
                </div>
            </article>
        </div>
    );
};

export default InterviewPrepGuide;
