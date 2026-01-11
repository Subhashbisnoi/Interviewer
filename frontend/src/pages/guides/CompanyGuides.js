import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../../components/SEO';
import { Building2, ArrowLeft, Clock, Star, CheckCircle, Lightbulb, ChevronDown, ChevronUp, Users, Code, MessageSquare, Briefcase, AlertCircle } from 'lucide-react';

const CompanyGuides = () => {
    const [expandedCompany, setExpandedCompany] = useState('google');

    const companies = {
        google: {
            name: 'Google',
            logo: '🔵',
            color: 'blue',
            difficulty: 'Hard',
            roles: ['Software Engineer', 'Product Manager', 'Data Scientist', 'UX Designer'],
            overview: 'Google is known for having one of the most rigorous interview processes in tech. They emphasize problem-solving ability, coding skills, and "Googleyness" - their culture fit assessment.',
            interviewProcess: [
                { stage: 'Recruiter Screen', duration: '30 min', description: 'Initial phone call to discuss background, role interest, and logistics. Recruiter assesses basic fit and explains the process.' },
                { stage: 'Technical Phone Screen', duration: '45 min', description: 'Live coding interview via Google Meet with a Google Doc. Expect 1-2 medium difficulty LeetCode-style problems.' },
                { stage: 'On-site (5-6 rounds)', duration: '5-6 hours', description: '4 technical interviews (coding, system design for senior), 1-2 behavioral interviews. Each interviewer submits independent feedback.' },
                { stage: 'Hiring Committee', duration: '1-2 weeks', description: 'Packet goes to hiring committee who makes final decision. They look for consistent "Hire" signals across interviews.' },
                { stage: 'Team Matching', duration: '1-4 weeks', description: 'After HC approval, you match with teams. You can speak with multiple teams before deciding.' }
            ],
            interviewTypes: [
                { type: 'Coding', weight: '60%', focus: 'DSA, problem-solving, code quality, testing', tips: 'Practice on LeetCode (medium/hard). Think out loud. Write clean, testable code. Always discuss time/space complexity.' },
                { type: 'System Design', weight: '20%', focus: 'Scalability, distributed systems, trade-offs', tips: 'Use structured approach: requirements → estimation → high-level → deep dive. Focus on trade-offs.' },
                { type: 'Behavioral', weight: '20%', focus: 'Googleyness, collaboration, leadership', tips: 'Prepare stories around ambiguity, collaboration, and impact. Use STAR method with metrics.' }
            ],
            keyValues: ['Focus on the user', 'Think 10x', 'Bias towards action', 'Comfort with ambiguity'],
            topTips: [
                'Always clarify the problem before coding',
                'Write production-quality code with edge case handling',
                'Verbalize your thought process throughout',
                'For system design, back up claims with numbers',
                'Show intellectual curiosity - ask thoughtful questions'
            ],
            avgSalary: { swe: '$150K-$200K', senior: '$200K-$300K', staff: '$300K-$450K' },
            timeline: '4-8 weeks total process'
        },
        amazon: {
            name: 'Amazon',
            logo: '🟠',
            color: 'orange',
            difficulty: 'Hard',
            roles: ['SDE', 'TPM', 'Business Analyst', 'Solutions Architect'],
            overview: 'Amazon\'s interview process is heavily focused on their 16 Leadership Principles (LPs). Every interview, including technical ones, will assess your alignment with these principles.',
            interviewProcess: [
                { stage: 'Recruiter Screen', duration: '30 min', description: 'Background review and LP assessment. Come prepared with LP stories.' },
                { stage: 'Online Assessment (OA)', duration: '90-120 min', description: '2 coding problems + work simulation (LP-based scenarios). Auto-proctored.' },
                { stage: 'Phone Screen', duration: '60 min', description: '45 min coding + 15 min behavioral. Strong LP focus.' },
                { stage: 'On-site Loop', duration: '4-5 hours', description: '4-5 interviews covering coding, system design (senior+), and LPs. Includes "Bar Raiser" interview.' }
            ],
            interviewTypes: [
                { type: 'Coding', weight: '40%', focus: 'DSA, optimal solutions, code quality', tips: 'Amazon favors optimal solutions. Always optimize after brute force. Handle edge cases.' },
                { type: 'System Design', weight: '20%', focus: 'AWS services, scalability, cost', tips: 'Know AWS services (S3, DynamoDB, SQS, Lambda). Consider cost optimization.' },
                { type: 'Leadership Principles', weight: '40%', focus: '16 LPs including Customer Obsession, Ownership, Bias for Action', tips: 'Prepare 2-3 stories per LP. Use STAR. Quantify impact. Show data-driven decisions.' }
            ],
            keyValues: ['Customer Obsession', 'Ownership', 'Bias for Action', 'Dive Deep', 'Deliver Results', 'Earn Trust'],
            topTips: [
                'Know ALL 16 Leadership Principles by heart',
                'Every answer should tie back to an LP',
                'Use metrics and data in every story',
                'The Bar Raiser is critical - treat every interview equally',
                'Show ownership mindset - "I" not "we"'
            ],
            avgSalary: { swe: '$140K-$180K', senior: '$180K-$250K', staff: '$250K-$400K' },
            timeline: '3-6 weeks total process'
        },
        microsoft: {
            name: 'Microsoft',
            logo: '🟢',
            color: 'green',
            difficulty: 'Medium-Hard',
            roles: ['Software Engineer', 'PM', 'Data Engineer', 'Cloud Architect'],
            overview: 'Microsoft has a collaborative interview culture. They focus on problem-solving, communication, and growth mindset. Interviews are generally less adversarial than other FAANG companies.',
            interviewProcess: [
                { stage: 'Recruiter Screen', duration: '30 min', description: 'Background discussion, role alignment, process overview.' },
                { stage: 'Phone Screen', duration: '45-60 min', description: 'Technical screen with coding. May use collaborative coding tool.' },
                { stage: 'On-site Loop', duration: '4-5 hours', description: '4 interviews: 2-3 coding, 1 system design (senior+), 1-2 behavioral. Includes "As Appropriate" (AA) interview with senior leader.' }
            ],
            interviewTypes: [
                { type: 'Coding', weight: '50%', focus: 'Problem-solving, code structure, debugging', tips: 'Microsoft likes seeing your problem-solving process. It\'s okay to ask for hints - collaboration is valued.' },
                { type: 'System Design', weight: '25%', focus: 'Azure services, scalability, reliability', tips: 'Familiarity with Azure is a plus but not required. Focus on fundamentals.' },
                { type: 'Behavioral', weight: '25%', focus: 'Growth mindset, collaboration, customer focus', tips: 'Emphasize learning from failures and continuous improvement.' }
            ],
            keyValues: ['Growth Mindset', 'Customer Obsession', 'Diversity & Inclusion', 'One Microsoft'],
            topTips: [
                'Show genuine enthusiasm for Microsoft products',
                'Demonstrate growth mindset - talk about learning from failures',
                'Collaboration is valued - asking questions is encouraged',
                'The AA interview often determines the final decision',
                'Follow-up questions are important - show curiosity'
            ],
            avgSalary: { swe: '$130K-$170K', senior: '$170K-$240K', staff: '$240K-$350K' },
            timeline: '2-4 weeks total process'
        },
        meta: {
            name: 'Meta',
            logo: '🔵',
            color: 'blue',
            difficulty: 'Hard',
            roles: ['Software Engineer', 'Data Scientist', 'ML Engineer', 'Product Designer'],
            overview: 'Meta (Facebook) interviews focus heavily on coding speed and accuracy. They expect you to solve problems quickly and write bug-free code. System design interviews are comprehensive.',
            interviewProcess: [
                { stage: 'Recruiter Screen', duration: '30 min', description: 'Background review, role discussion, process explanation.' },
                { stage: 'Technical Screen', duration: '45 min', description: '2 coding problems in 45 minutes. Expect to fully solve both.' },
                { stage: 'On-site Loop', duration: '4-5 hours', description: '2 coding rounds (2 problems each), 1 system design, 1 behavioral.' }
            ],
            interviewTypes: [
                { type: 'Coding', weight: '50%', focus: 'Speed, accuracy, optimal solutions', tips: 'Meta expects 2 problems per 45 min. Practice speed. Code must be syntactically correct and bug-free.' },
                { type: 'System Design', weight: '25%', focus: 'News Feed, messaging systems, scale', tips: 'Know Meta\'s products deeply. Practice FB/IG-specific design questions. Think at massive scale.' },
                { type: 'Behavioral', weight: '25%', focus: 'Impact, collaboration, moving fast', tips: 'Focus on impact and moving fast. Meta values execution speed.' }
            ],
            keyValues: ['Move Fast', 'Be Bold', 'Focus on Impact', 'Be Open', 'Build Social Value'],
            topTips: [
                'Speed is critical - practice solving 2 problems in 45 mins',
                'Your code must compile and run correctly',
                'For senior+, system design is heavily weighted',
                'Know Meta\'s products and their technical challenges',
                'Show you can build things that matter at scale'
            ],
            avgSalary: { swe: '$160K-$200K', senior: '$220K-$320K', staff: '$350K-$500K' },
            timeline: '3-5 weeks total process'
        },
        apple: {
            name: 'Apple',
            logo: '⚪',
            color: 'gray',
            difficulty: 'Hard',
            roles: ['Software Engineer', 'Hardware Engineer', 'Design', 'ML/AI'],
            overview: 'Apple interviews are team-specific, meaning you interview directly for a particular team. They value deep technical expertise and attention to detail. Secrecy about projects is common.',
            interviewProcess: [
                { stage: 'Recruiter Screen', duration: '30 min', description: 'Background discussion, team matching.' },
                { stage: 'Technical Phone Screen', duration: '60 min', description: 'Coding interview focused on the specific team\'s domain.' },
                { stage: 'On-site Loop', duration: '5-8 hours', description: '5-8 interviews with the specific team. Highly technical and domain-specific.' }
            ],
            interviewTypes: [
                { type: 'Domain-Specific', weight: '60%', focus: 'Deep expertise in relevant area (iOS, macOS, ML, etc.)', tips: 'Know the specific domain deeply. iOS roles expect deep Objective-C/Swift knowledge.' },
                { type: 'System Design', weight: '20%', focus: 'Elegant solutions, attention to detail', tips: 'Apple values elegant, well-thought-out designs over quick solutions.' },
                { type: 'Behavioral', weight: '20%', focus: 'Collaboration, passion for products', tips: 'Show genuine passion for Apple products. Quality and user experience matter.' }
            ],
            keyValues: ['Attention to Detail', 'User Experience', 'Innovation', 'Secrecy'],
            topTips: [
                'Research the specific team you\'re interviewing for',
                'Show deep expertise in relevant technologies',
                'Apple values quality over speed',
                'Be prepared for NDA discussions - details about projects are confidential',
                'Demonstrate passion for Apple products and ecosystem'
            ],
            avgSalary: { swe: '$140K-$180K', senior: '$180K-$260K', staff: '$260K-$380K' },
            timeline: '4-8 weeks total process'
        },
        netflix: {
            name: 'Netflix',
            logo: '🔴',
            color: 'red',
            difficulty: 'Very Hard',
            roles: ['Senior Software Engineer', 'Data Engineer', 'ML Engineer', 'Security'],
            overview: 'Netflix only hires senior-level candidates. They have an extremely high bar and expect candidates to be "stunning colleagues" who are experts in their field.',
            interviewProcess: [
                { stage: 'Recruiter Screen', duration: '45 min', description: 'Deep dive into background and culture fit. Netflix culture is heavily discussed.' },
                { stage: 'Technical Phone Screen', duration: '60 min', description: 'Deep technical discussion with a senior engineer.' },
                { stage: 'On-site Loop', duration: '5-6 hours', description: '5-6 interviews focused on deep technical expertise and culture fit.' }
            ],
            interviewTypes: [
                { type: 'Technical Deep Dive', weight: '50%', focus: 'Expert-level knowledge in your domain', tips: 'Expect deep, probing questions. You should be able to teach the interviewer something.' },
                { type: 'System Design', weight: '25%', focus: 'Streaming architecture, high availability, resilience', tips: 'Netflix operates at massive scale. Show you can design for global distribution.' },
                { type: 'Culture', weight: '25%', focus: 'Freedom & Responsibility, Stunning Colleagues', tips: 'Read the Netflix Culture Deck thoroughly. Show independent judgment.' }
            ],
            keyValues: ['Freedom & Responsibility', 'Context not Control', 'Highly Aligned, Loosely Coupled', 'Pay Top of Market'],
            topTips: [
                'Read the Netflix Culture Deck - it\'s essential',
                'Be prepared to demonstrate senior-level expertise',
                'Netflix expects you to push back and debate',
                'Show you can operate with minimal oversight',
                'Compensation is typically top of market - research accordingly'
            ],
            avgSalary: { swe: '$250K-$400K', senior: '$350K-$500K', staff: '$450K-$700K' },
            timeline: '3-6 weeks total process'
        }
    };

    const colorClasses = {
        blue: { bg: 'bg-blue-600', light: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800' },
        orange: { bg: 'bg-orange-500', light: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-800' },
        green: { bg: 'bg-green-600', light: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-600 dark:text-green-400', border: 'border-green-200 dark:border-green-800' },
        gray: { bg: 'bg-gray-600', light: 'bg-gray-50 dark:bg-gray-800', text: 'text-gray-600 dark:text-gray-400', border: 'border-gray-200 dark:border-gray-700' },
        red: { bg: 'bg-red-600', light: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-600 dark:text-red-400', border: 'border-red-200 dark:border-red-800' }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <SEO title="Company Interview Guides" description="Detailed interview preparation guides for Google, Amazon, Microsoft, Meta, Apple, and Netflix." url="/resources/company-guides" />
            
            {/* Header */}
            <section className="bg-gradient-to-br from-slate-700 to-slate-900 py-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Link to="/resources" className="inline-flex items-center text-slate-300 hover:text-white mb-6 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Resources
                    </Link>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                            <Building2 className="w-7 h-7 text-white" />
                        </div>
                        <span className="px-3 py-1 bg-white/20 text-white text-sm font-medium rounded-full">Company-Specific</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">Company Interview Guides</h1>
                    <p className="text-xl text-slate-300 mb-4">Detailed interview preparation for top tech companies including process, question types, and insider tips.</p>
                    <div className="flex items-center text-slate-400 text-sm">
                        <Clock className="w-4 h-4 mr-1" />
                        40 min read • 6 companies covered
                    </div>
                </div>
            </section>

            {/* Company Selector */}
            <section className="py-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-wrap gap-2 justify-center">
                        {Object.entries(companies).map(([key, company]) => (
                            <button
                                key={key}
                                onClick={() => setExpandedCompany(key)}
                                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                                    expandedCompany === key
                                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                            >
                                {company.logo} {company.name}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Company Content */}
            <section className="py-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {Object.entries(companies).map(([key, company]) => {
                        if (expandedCompany !== key) return null;
                        const colors = colorClasses[company.color] || colorClasses.blue;
                        
                        return (
                            <div key={key} className="space-y-8">
                                {/* Overview */}
                                <div className={`${colors.light} rounded-xl p-6 border ${colors.border}`}>
                                    <div className="flex items-center gap-4 mb-4">
                                        <span className="text-4xl">{company.logo}</span>
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{company.name}</h2>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                                                    company.difficulty === 'Very Hard' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                    company.difficulty === 'Hard' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                                                    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                }`}>{company.difficulty}</span>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">{company.timeline}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-gray-700 dark:text-gray-300">{company.overview}</p>
                                    <div className="flex flex-wrap gap-2 mt-4">
                                        {company.roles.map((role, i) => (
                                            <span key={i} className="text-xs bg-white dark:bg-gray-800 px-3 py-1 rounded-full text-gray-600 dark:text-gray-400">{role}</span>
                                        ))}
                                    </div>
                                </div>

                                {/* Interview Process */}
                                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-100 dark:border-gray-700">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                        <Users className="w-5 h-5 text-blue-500" />
                                        Interview Process
                                    </h3>
                                    <div className="space-y-4">
                                        {company.interviewProcess.map((stage, i) => (
                                            <div key={i} className="flex gap-4">
                                                <div className="flex flex-col items-center">
                                                    <div className={`w-8 h-8 ${colors.bg} text-white rounded-full flex items-center justify-center font-bold text-sm`}>{i + 1}</div>
                                                    {i < company.interviewProcess.length - 1 && <div className="w-0.5 h-full bg-gray-200 dark:bg-gray-700 mt-2"></div>}
                                                </div>
                                                <div className="flex-1 pb-4">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="font-medium text-gray-900 dark:text-white">{stage.stage}</h4>
                                                        <span className="text-xs text-gray-500 dark:text-gray-400">{stage.duration}</span>
                                                    </div>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">{stage.description}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Interview Types */}
                                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-100 dark:border-gray-700">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                        <Code className="w-5 h-5 text-purple-500" />
                                        Interview Types & Focus
                                    </h3>
                                    <div className="space-y-4">
                                        {company.interviewTypes.map((type, i) => (
                                            <div key={i} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h4 className="font-medium text-gray-900 dark:text-white">{type.type}</h4>
                                                    <span className={`text-xs font-bold ${colors.text}`}>{type.weight}</span>
                                                </div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2"><strong>Focus:</strong> {type.focus}</p>
                                                <p className="text-sm text-green-700 dark:text-green-400"><strong>💡 Tips:</strong> {type.tips}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Key Values */}
                                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-100 dark:border-gray-700">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                        <Star className="w-5 h-5 text-amber-500" />
                                        Key Values & Culture
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {company.keyValues.map((value, i) => (
                                            <span key={i} className={`${colors.light} ${colors.text} px-3 py-1.5 rounded-lg text-sm font-medium border ${colors.border}`}>{value}</span>
                                        ))}
                                    </div>
                                </div>

                                {/* Top Tips */}
                                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-6 border border-amber-200 dark:border-amber-800">
                                    <h3 className="text-lg font-bold text-amber-900 dark:text-amber-100 mb-4 flex items-center gap-2">
                                        <Lightbulb className="w-5 h-5 text-amber-500" />
                                        Top Tips for {company.name}
                                    </h3>
                                    <ul className="space-y-2">
                                        {company.topTips.map((tip, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-amber-800 dark:text-amber-200">
                                                <CheckCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                                                {tip}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Compensation */}
                                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-100 dark:border-gray-700">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                        <Briefcase className="w-5 h-5 text-green-500" />
                                        Typical Compensation (Total Comp)
                                    </h3>
                                    <div className="grid grid-cols-3 gap-4 text-center">
                                        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Entry/Mid</p>
                                            <p className="font-bold text-gray-900 dark:text-white">{company.avgSalary.swe}</p>
                                        </div>
                                        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Senior</p>
                                            <p className="font-bold text-gray-900 dark:text-white">{company.avgSalary.senior}</p>
                                        </div>
                                        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Staff+</p>
                                            <p className="font-bold text-gray-900 dark:text-white">{company.avgSalary.staff}</p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">*Includes base, bonus, and equity. Data from levels.fyi</p>
                                </div>
                            </div>
                        );
                    })}

                    {/* CTA */}
                    <div className="bg-gradient-to-r from-slate-700 to-slate-900 rounded-2xl p-8 text-center mt-10">
                        <Star className="w-10 h-10 text-yellow-300 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-white mb-3">Practice Company-Specific Questions</h3>
                        <p className="text-slate-300 mb-6">Our AI interviewer can simulate interviews for specific companies.</p>
                        <Link to="/" className="inline-flex items-center px-6 py-3 bg-white text-slate-900 font-semibold rounded-lg hover:bg-slate-100 transition-all">
                            Start Practice Interview
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default CompanyGuides;
