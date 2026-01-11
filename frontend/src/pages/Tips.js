import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import {
    Lightbulb, CheckCircle, XCircle, BookOpen, Target, Users,
    Code, MessageSquare, Brain, Clock, Star, ArrowRight,
    ChevronDown, ChevronUp, Briefcase, Award, TrendingUp
} from 'lucide-react';

const InterviewTips = () => {
    const [activeCategory, setActiveCategory] = useState('all');
    const [expandedTip, setExpandedTip] = useState(null);

    const categories = [
        { id: 'all', label: 'All Tips', icon: BookOpen },
        { id: 'behavioral', label: 'Behavioral', icon: MessageSquare },
        { id: 'technical', label: 'Technical', icon: Code },
        { id: 'preparation', label: 'Preparation', icon: Target },
        { id: 'communication', label: 'Communication', icon: Users },
    ];

    const tips = [
        {
            id: 1, category: 'preparation', title: 'Research the Company Thoroughly',
            shortDesc: 'Understanding the company shows genuine interest and helps you tailor your answers.',
            fullDesc: `Before any interview, spend at least 2-3 hours researching the company. Look at:\n\n• Company website - mission, values, recent news\n• LinkedIn - company page, employees, recent posts\n• Glassdoor - interview experiences, company culture\n• News articles - recent achievements, challenges\n• Product/Service - understand what they offer`,
            icon: Target, color: 'blue'
        },
        {
            id: 2, category: 'behavioral', title: 'Master the STAR Method',
            shortDesc: 'Structure your answers using Situation, Task, Action, Result for maximum impact.',
            fullDesc: `The STAR method helps you give structured, compelling answers:\n\nS - Situation: Set the scene. Describe the context.\nT - Task: Explain your responsibility.\nA - Action: Describe what you did specifically.\nR - Result: Share the outcome with metrics if possible.\n\nPro Tips:\n• Prepare 5-7 STAR stories covering different competencies\n• Keep each story to 2-3 minutes\n• Focus 70% on Action and Result`,
            icon: Star, color: 'yellow'
        },
        {
            id: 3, category: 'technical', title: 'Think Out Loud During Problem Solving',
            shortDesc: 'Interviewers want to see your thought process, not just the final answer.',
            fullDesc: `When solving technical problems, verbalize your thinking:\n\nWhy it matters:\n• Shows how you approach problems\n• Lets interviewer guide you if needed\n• Demonstrates communication skills\n\nHow to do it:\n1. Restate the problem in your own words\n2. Discuss possible approaches\n3. Explain why you chose your approach\n4. Walk through your solution step-by-step`,
            icon: Brain, color: 'purple'
        },
        {
            id: 4, category: 'communication', title: 'Ask Clarifying Questions',
            shortDesc: "Don't assume - asking questions shows thoroughness and prevents misunderstandings.",
            fullDesc: `Asking clarifying questions is crucial:\n\nBenefits:\n• Shows attention to detail\n• Prevents wasted time on wrong solutions\n• Demonstrates real-world thinking\n\nGood questions to ask:\n• "What's the expected input size?"\n• "Should I handle edge cases like empty inputs?"\n• "Is the data sorted?"`,
            icon: MessageSquare, color: 'green'
        },
        {
            id: 5, category: 'preparation', title: 'Prepare Your Own Questions',
            shortDesc: 'Having thoughtful questions shows engagement and helps you evaluate the opportunity.',
            fullDesc: `Always prepare 5-10 questions to ask the interviewer:\n\nAbout the Role:\n• "What does success look like in this role after 90 days?"\n• "What are the biggest challenges the team is facing?"\n\nAbout the Team:\n• "How would you describe the team culture?"\n• "What's the team's approach to professional development?"`,
            icon: Lightbulb, color: 'orange'
        },
        {
            id: 6, category: 'behavioral', title: 'Prepare Stories for Common Themes',
            shortDesc: 'Have ready-to-go stories for leadership, conflict, failure, and achievement.',
            fullDesc: `Prepare specific stories for these common themes:\n\n1. Leadership - "Tell me about a time you led a team..."\n2. Conflict Resolution - "Describe a disagreement with a colleague..."\n3. Failure & Learning - "Tell me about a time you failed..."\n4. Achievement - "What's your proudest accomplishment?"\n5. Working Under Pressure - "Describe a time with a tight deadline..."`,
            icon: Briefcase, color: 'indigo'
        },
        {
            id: 7, category: 'technical', title: 'Practice Coding Without IDE',
            shortDesc: 'Whiteboard coding is different - practice writing code by hand.',
            fullDesc: `Technical interviews often require coding without an IDE:\n\nWhy it's challenging:\n• No autocomplete\n• No syntax highlighting\n• No immediate error checking\n\nHow to prepare:\n1. Use a whiteboard or paper\n2. Focus on structure first\n3. Practice talking while writing\n4. Leave space for additions`,
            icon: Code, color: 'red'
        },
        {
            id: 8, category: 'communication', title: 'Mind Your Body Language',
            shortDesc: 'Non-verbal communication matters - project confidence and engagement.',
            fullDesc: `Body language impacts how you're perceived:\n\nDo:\n• Maintain good eye contact (70-80% of time)\n• Sit up straight, lean slightly forward\n• Use natural hand gestures\n• Smile genuinely\n\nDon't:\n• Cross arms (appears defensive)\n• Fidget excessively\n• Look at clock/phone`,
            icon: Users, color: 'teal'
        },
        {
            id: 9, category: 'preparation', title: 'Arrive Early, Not Just On Time',
            shortDesc: 'Being early shows professionalism and gives you time to compose yourself.',
            fullDesc: `Timing matters in interviews:\n\nIn-Person:\n• Arrive 10-15 minutes early\n• Use restroom, check appearance\n• Review your notes one last time\n\nVirtual:\n• Log in 5 minutes early\n• Test audio/video beforehand\n• Close unnecessary applications`,
            icon: Clock, color: 'pink'
        },
        {
            id: 10, category: 'behavioral', title: 'Be Honest About Weaknesses',
            shortDesc: 'Frame weaknesses as growth opportunities and show self-awareness.',
            fullDesc: `When asked about weaknesses, be genuine:\n\nGood approach:\n1. Choose a real weakness (not fake humble)\n2. Show awareness of impact\n3. Explain steps you're taking to improve\n4. Share progress made\n\nAvoid:\n• "I'm a perfectionist" (cliché)\n• "I work too hard" (not believable)`,
            icon: TrendingUp, color: 'emerald'
        }
    ];

    const commonMistakes = [
        { mistake: 'Speaking negatively about previous employers', solution: 'Focus on what you learned and positive aspects', image: '/images/mistakes/mistake_negative_talk_1768111725481.png' },
        { mistake: 'Not preparing specific examples', solution: 'Have 5-7 detailed STAR stories ready', image: '/images/mistakes/mistake_no_examples_1768111740446.png' },
        { mistake: 'Giving vague or general answers', solution: 'Use specific numbers, dates, and outcomes', image: '/images/mistakes/mistake_vague_answers_1768111756825.png' },
        { mistake: 'Not researching the company', solution: 'Spend 2-3 hours learning about the company', image: '/images/mistakes/mistake_no_research_1768111786054.png' },
        { mistake: 'Talking too much or too little', solution: 'Aim for 2-3 minute responses, read cues', image: '/images/mistakes/mistake_talking_time_1768111802621.png' },
        { mistake: 'Forgetting to follow up', solution: 'Send thank-you email within 24 hours', image: '/images/mistakes/mistake_no_followup_1768111818603.png' }
    ];

    const filteredTips = activeCategory === 'all' ? tips : tips.filter(tip => tip.category === activeCategory);

    const colorClasses = {
        blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
        yellow: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
        purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
        green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
        orange: 'bg-blue-100 dark:bg-blue-900/30 text-orange-600 dark:text-blue-800',
        indigo: 'bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-800',
        red: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
        teal: 'bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400',
        pink: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400',
        emerald: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <SEO title="Interview Tips & Strategies" description="Master your interviews with expert tips on behavioral questions, technical interviews, preparation strategies, and communication skills." url="/tips" />

            <section className="bg-gray-50 dark:bg-slate-900 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="inline-flex items-center px-4 py-2 bg-amber-100 border border-amber-200 rounded-full text-amber-700 text-sm font-medium mb-6">
                        <Lightbulb className="w-4 h-4 mr-2 text-amber-500" />
                        Expert-curated interview strategies
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4">Interview Tips & Strategies</h1>
                    <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl">Learn from the best. Master these proven strategies to ace any interview and land your dream job.</p>
                </div>
            </section>

            <section className="py-8 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-wrap gap-3 justify-center">
                        {categories.map((cat) => (
                            <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all ${activeCategory === cat.id ? 'bg-slate-900 text-white shadow-lg' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
                                <cat.icon className="w-4 h-4 mr-2" />{cat.label}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-6">
                        {filteredTips.map((tip) => (
                            <div key={tip.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                                <div className="p-6">
                                    <div className="flex items-start gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClasses[tip.color]}`}><tip.icon className="w-6 h-6" /></div>
                                        <div className="flex-1">
                                            <span className="text-xs font-medium text-blue-900 dark:text-blue-800 uppercase tracking-wide">{tip.category}</span>
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-1">{tip.title}</h3>
                                            <p className="text-gray-600 dark:text-gray-400 mt-2">{tip.shortDesc}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setExpandedTip(expandedTip === tip.id ? null : tip.id)} className="mt-4 flex items-center text-blue-900 dark:text-blue-800 font-medium hover:text-indigo-700 dark:hover:text-blue-700">
                                        {expandedTip === tip.id ? (<><ChevronUp className="w-4 h-4 mr-1" />Show Less</>) : (<><ChevronDown className="w-4 h-4 mr-1" />Read More</>)}
                                    </button>
                                    {expandedTip === tip.id && (
                                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                            <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 font-sans bg-gray-50 dark:bg-gray-900 p-4 rounded-xl">{tip.fullDesc}</pre>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-16 bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Common Mistakes to Avoid</h2>
                        <p className="text-gray-600 dark:text-gray-400">Don't sabotage your interview. Learn what NOT to do.</p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {commonMistakes.map((item, index) => (
                            <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all hover:-translate-y-1">
                                {/* Visual illustration */}
                                <div className="h-40 bg-slate-50 dark:bg-slate-900 flex items-center justify-center overflow-hidden">
                                    <img
                                        src={item.image}
                                        alt={item.mistake}
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                                <div className="p-5">
                                    <div className="flex items-start gap-3 mb-4 pb-4 border-b border-gray-100 dark:border-gray-700">
                                        <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                        <p className="text-gray-900 dark:text-white font-semibold text-sm leading-snug">{item.mistake}</p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{item.solution}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Resources CTA Section */}
            <section className="py-12 bg-slate-100 dark:bg-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-lg border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                <BookOpen className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Free Interview Resources</h3>
                                <p className="text-gray-600 dark:text-gray-400">Guides, question banks, company prep materials & more</p>
                            </div>
                        </div>
                        <Link to="/resources" className="inline-flex items-center px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-md hover:shadow-lg">
                            Browse Resources <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                    </div>
                </div>
            </section>

            <section className="py-16 bg-slate-900">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <Award className="w-12 h-12 text-amber-400 mx-auto mb-6" />
                    <h2 className="text-3xl font-bold text-white mb-4">Ready to Put These Tips into Practice?</h2>
                    <p className="text-xl text-slate-400 mb-8">Start a mock interview and get real-time feedback on your performance.</p>
                    <Link to="/" className="inline-flex items-center px-8 py-4 bg-white text-slate-900 font-semibold rounded-lg hover:bg-slate-100 transition-all">Start Practice Interview<ArrowRight className="ml-2 h-5 w-5" /></Link>
                </div>
            </section>
        </div>
    );
};

export default InterviewTips;
