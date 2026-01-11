import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../../components/SEO';
import { Briefcase, ArrowLeft, Clock, Star, CheckCircle, Lightbulb, AlertCircle, Server, Database, Globe, Shield, Zap } from 'lucide-react';

const SystemDesignGuide = () => {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <SEO title="System Design Basics" description="Learn how to approach system design interviews step-by-step." url="/resources/system-design" />
            
            {/* Header */}
            <section className="bg-gradient-to-br from-orange-500 to-orange-700 py-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Link to="/resources" className="inline-flex items-center text-orange-200 hover:text-white mb-6 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Resources
                    </Link>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                            <Briefcase className="w-7 h-7 text-white" />
                        </div>
                        <span className="px-3 py-1 bg-white/20 text-white text-sm font-medium rounded-full">Comprehensive Guide</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">System Design Interview Guide</h1>
                    <p className="text-xl text-orange-100 mb-4">Master the framework and concepts to ace any system design interview at top tech companies.</p>
                    <div className="flex items-center text-orange-200 text-sm">
                        <Clock className="w-4 h-4 mr-1" />
                        35 min read • Complete framework + core concepts
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
                            <a href="#what-they-evaluate" className="block text-orange-600 hover:text-orange-800 dark:text-orange-400">1. What Interviewers Evaluate</a>
                            <a href="#framework" className="block text-orange-600 hover:text-orange-800 dark:text-orange-400">2. The 5-Step Framework</a>
                            <a href="#estimation" className="block text-orange-600 hover:text-orange-800 dark:text-orange-400">3. Back-of-Envelope Estimation</a>
                            <a href="#load-balancing" className="block text-orange-600 hover:text-orange-800 dark:text-orange-400">4. Load Balancing</a>
                            <a href="#caching" className="block text-orange-600 hover:text-orange-800 dark:text-orange-400">5. Caching Strategies</a>
                            <a href="#databases" className="block text-orange-600 hover:text-orange-800 dark:text-orange-400">6. Database Design & Scaling</a>
                            <a href="#common-systems" className="block text-orange-600 hover:text-orange-800 dark:text-orange-400">7. Common System Design Questions</a>
                        </nav>
                    </div>

                    {/* Section 1 */}
                    <section id="what-they-evaluate" className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 pb-2 border-b border-gray-200 dark:border-gray-700">
                            1. What Interviewers Evaluate
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            System design interviews test much more than technical knowledge. Understanding what interviewers are looking for helps you focus your preparation.
                        </p>

                        <div className="grid sm:grid-cols-2 gap-4">
                            {[
                                { title: 'Communication', desc: 'Can you explain complex systems clearly? Do you check for understanding?' },
                                { title: 'Requirement Gathering', desc: 'Do you ask the right questions before diving in? Never assume - always clarify.' },
                                { title: 'Trade-off Analysis', desc: 'Can you reason about pros/cons? Every design decision has trade-offs.' },
                                { title: 'Technical Depth', desc: 'Do you understand how components actually work, not just what they do?' },
                                { title: 'Practical Thinking', desc: 'Have you considered real-world constraints like cost, latency, and failure modes?' },
                                { title: 'Problem Decomposition', desc: 'Can you break a large problem into manageable components?' },
                            ].map((item, i) => (
                                <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                                    <div className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <h4 className="font-medium text-gray-900 dark:text-white text-sm">{item.title}</h4>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.desc}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Section 2 - Framework */}
                    <section id="framework" className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 pb-2 border-b border-gray-200 dark:border-gray-700">
                            2. The 5-Step Framework (45-min Interview)
                        </h2>

                        <div className="space-y-6">
                            {/* Step 1 */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md border border-gray-100 dark:border-gray-700">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">1</div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="font-semibold text-gray-900 dark:text-white text-lg">Clarify Requirements</h3>
                                            <span className="text-xs text-orange-600 bg-orange-100 dark:bg-orange-900/30 px-2 py-1 rounded">3-5 min</span>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Never assume. Ask questions to understand scope and constraints.</p>
                                        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                                            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Questions to ask:</p>
                                            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                                                <li>• What are the main features/use cases?</li>
                                                <li>• How many users? DAU, MAU, concurrent?</li>
                                                <li>• What is the read/write ratio?</li>
                                                <li>• What are the latency requirements?</li>
                                                <li>• Is consistency or availability more important?</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Step 2 */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md border border-gray-100 dark:border-gray-700">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">2</div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="font-semibold text-gray-900 dark:text-white text-lg">Estimate Scale</h3>
                                            <span className="text-xs text-orange-600 bg-orange-100 dark:bg-orange-900/30 px-2 py-1 rounded">3-5 min</span>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Back-of-envelope calculations to size the system.</p>
                                        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                                            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Key metrics to calculate:</p>
                                            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                                                <li>• QPS: 100M DAU / 86400 ≈ 1,200 QPS, peak 3x = 3,600 QPS</li>
                                                <li>• Storage: 100M users × 1KB = 100GB, 5 years = 500GB</li>
                                                <li>• Bandwidth: 1,200 QPS × 10KB = 12 MB/s</li>
                                                <li>• Cache: 20% of hot data = ~20GB Redis</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Step 3 */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md border border-gray-100 dark:border-gray-700">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">3</div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="font-semibold text-gray-900 dark:text-white text-lg">High-Level Design</h3>
                                            <span className="text-xs text-orange-600 bg-orange-100 dark:bg-orange-900/30 px-2 py-1 rounded">10-15 min</span>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Draw the main components and data flow.</p>
                                        <div className="flex flex-wrap gap-2">
                                            {['Clients', 'CDN', 'Load Balancer', 'API Gateway', 'Web Servers', 'Cache', 'Database', 'Message Queue', 'Workers'].map((comp) => (
                                                <span key={comp} className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-xs rounded">{comp}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Step 4 */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md border border-gray-100 dark:border-gray-700">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">4</div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="font-semibold text-gray-900 dark:text-white text-lg">Deep Dive</h3>
                                            <span className="text-xs text-orange-600 bg-orange-100 dark:bg-orange-900/30 px-2 py-1 rounded">10-15 min</span>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Focus on 2-3 critical components. Discuss trade-offs.</p>
                                        <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                                            <li>• Let the interviewer guide which components to explore</li>
                                            <li>• Discuss data models and API design</li>
                                            <li>• Explain trade-offs for each decision</li>
                                            <li>• Consider edge cases and failure scenarios</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Step 5 */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md border border-gray-100 dark:border-gray-700">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">5</div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="font-semibold text-gray-900 dark:text-white text-lg">Address Bottlenecks</h3>
                                            <span className="text-xs text-orange-600 bg-orange-100 dark:bg-orange-900/30 px-2 py-1 rounded">5 min</span>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Identify and resolve potential issues.</p>
                                        <div className="flex flex-wrap gap-2">
                                            {['Single point of failure', 'Hot spots', 'Data consistency', 'Cache invalidation', 'Network latency'].map((issue) => (
                                                <span key={issue} className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs rounded">{issue}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Section 3 - Estimation */}
                    <section id="estimation" className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 pb-2 border-b border-gray-200 dark:border-gray-700">
                            3. Back-of-Envelope Estimation
                        </h2>

                        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
                            <div className="flex items-start gap-3">
                                <Lightbulb className="w-5 h-5 text-amber-600 mt-0.5" />
                                <p className="text-sm text-amber-800 dark:text-amber-200">
                                    <strong>Key Numbers to Memorize:</strong> 86,400 seconds/day, 2.5M seconds/month, ~1 billion = 10^9, 1 KB text, 300 KB image, 10 MB video/min
                                </p>
                            </div>
                        </div>

                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Example: Twitter-like System</h3>
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-700 space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Daily Active Users (DAU)</span>
                                <span className="font-mono text-gray-900 dark:text-white">300 million</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Tweets per user per day</span>
                                <span className="font-mono text-gray-900 dark:text-white">2</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Total tweets per day</span>
                                <span className="font-mono text-gray-900 dark:text-white">600 million</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Tweets per second (average)</span>
                                <span className="font-mono text-gray-900 dark:text-white">600M / 86400 ≈ 7,000 TPS</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Peak TPS (3x average)</span>
                                <span className="font-mono text-gray-900 dark:text-white">21,000 TPS</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Storage per tweet</span>
                                <span className="font-mono text-gray-900 dark:text-white">~1 KB</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Daily storage</span>
                                <span className="font-mono text-gray-900 dark:text-white">600 GB/day</span>
                            </div>
                            <div className="flex justify-between text-sm border-t border-gray-200 dark:border-gray-700 pt-3">
                                <span className="text-gray-600 dark:text-gray-400"><strong>5-year storage</strong></span>
                                <span className="font-mono text-gray-900 dark:text-white font-bold">~1 PB</span>
                            </div>
                        </div>
                    </section>

                    {/* Section 4 - Load Balancing */}
                    <section id="load-balancing" className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 pb-2 border-b border-gray-200 dark:border-gray-700">
                            <Server className="w-6 h-6 inline mr-2 text-orange-500" />
                            4. Load Balancing
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Distributes incoming traffic across multiple servers to ensure no single server is overwhelmed and to eliminate single points of failure.
                        </p>

                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Load Balancing Algorithms</h3>
                        <div className="grid sm:grid-cols-2 gap-4 mb-6">
                            {[
                                { name: 'Round Robin', desc: 'Requests distributed equally in rotation. Simple but doesn\'t account for server load.', best: 'Homogeneous servers' },
                                { name: 'Least Connections', desc: 'Routes to server with fewest active connections. Better for varying request times.', best: 'Variable request durations' },
                                { name: 'IP Hash', desc: 'Routes based on client IP hash. Ensures session persistence.', best: 'Stateful applications' },
                                { name: 'Weighted', desc: 'Assigns weights based on server capacity. Powerful servers get more traffic.', best: 'Mixed server capacities' },
                            ].map((algo) => (
                                <div key={algo.name} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                                    <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1">{algo.name}</h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{algo.desc}</p>
                                    <p className="text-xs text-orange-600 dark:text-orange-400">Best for: {algo.best}</p>
                                </div>
                            ))}
                        </div>

                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Layer 4 vs Layer 7</h3>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                                <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-2">Layer 4 (Transport)</h4>
                                <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                                    <li>• Routes based on IP & port</li>
                                    <li>• Faster, less CPU intensive</li>
                                    <li>• Cannot inspect content</li>
                                    <li>• Example: HAProxy TCP mode</li>
                                </ul>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                                <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-2">Layer 7 (Application)</h4>
                                <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                                    <li>• Can inspect HTTP headers/content</li>
                                    <li>• Smart routing by URL, cookies</li>
                                    <li>• SSL termination</li>
                                    <li>• Example: NGINX, AWS ALB</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Section 5 - Caching */}
                    <section id="caching" className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 pb-2 border-b border-gray-200 dark:border-gray-700">
                            <Zap className="w-6 h-6 inline mr-2 text-orange-500" />
                            5. Caching Strategies
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Store frequently accessed data in fast storage to reduce latency and database load. Caching is critical for read-heavy systems.
                        </p>

                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Cache Strategies</h3>
                        <div className="space-y-4 mb-6">
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                                <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1">Cache-Aside (Lazy Loading)</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">App checks cache first. On miss, loads from DB and writes to cache.</p>
                                <p className="text-xs text-green-600">✓ Only caches what's needed ✓ Cache failures don't break system</p>
                                <p className="text-xs text-red-600">✗ Cache miss = slower ✗ Data can become stale</p>
                            </div>
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                                <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1">Write-Through</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Data written to cache and DB simultaneously.</p>
                                <p className="text-xs text-green-600">✓ Cache always consistent ✓ Good for read-heavy</p>
                                <p className="text-xs text-red-600">✗ Higher write latency ✗ May cache unused data</p>
                            </div>
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                                <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1">Write-Back (Write-Behind)</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Write to cache immediately, async write to DB later.</p>
                                <p className="text-xs text-green-600">✓ Fast writes ✓ Reduced DB load</p>
                                <p className="text-xs text-red-600">✗ Risk of data loss ✗ Complex to implement</p>
                            </div>
                        </div>

                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-red-800 dark:text-red-200">Cache Stampede Problem</p>
                                    <p className="text-sm text-red-700 dark:text-red-300">
                                        When a popular cache entry expires, many requests hit the DB simultaneously. Solution: Use locking, stale-while-revalidate, or randomized TTL.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Section 6 - Databases */}
                    <section id="databases" className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 pb-2 border-b border-gray-200 dark:border-gray-700">
                            <Database className="w-6 h-6 inline mr-2 text-orange-500" />
                            6. Database Design & Scaling
                        </h2>

                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">SQL vs NoSQL</h3>
                        <div className="grid sm:grid-cols-2 gap-4 mb-6">
                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                                <h4 className="font-medium text-blue-900 dark:text-blue-100 text-sm mb-2">SQL (PostgreSQL, MySQL)</h4>
                                <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
                                    <li>✓ ACID transactions</li>
                                    <li>✓ Complex queries & joins</li>
                                    <li>✓ Strong consistency</li>
                                    <li>✓ Well-defined schema</li>
                                    <li className="text-blue-600 dark:text-blue-400">Best for: Financial, ERP, CRM</li>
                                </ul>
                            </div>
                            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                                <h4 className="font-medium text-green-900 dark:text-green-100 text-sm mb-2">NoSQL (MongoDB, Cassandra)</h4>
                                <ul className="text-xs text-green-800 dark:text-green-200 space-y-1">
                                    <li>✓ Flexible schema</li>
                                    <li>✓ Horizontal scaling</li>
                                    <li>✓ High throughput</li>
                                    <li>✓ Eventual consistency option</li>
                                    <li className="text-green-600 dark:text-green-400">Best for: Social, IoT, Real-time</li>
                                </ul>
                            </div>
                        </div>

                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Scaling Strategies</h3>
                        <div className="space-y-3">
                            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                                <h4 className="font-medium text-gray-900 dark:text-white text-sm">Replication (Master-Slave)</h4>
                                <p className="text-xs text-gray-600 dark:text-gray-400">Master handles writes, replicas handle reads. Improves read scalability and provides redundancy.</p>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                                <h4 className="font-medium text-gray-900 dark:text-white text-sm">Sharding (Horizontal Partitioning)</h4>
                                <p className="text-xs text-gray-600 dark:text-gray-400">Split data across multiple databases. Strategies: Range-based, Hash-based, Directory-based. Trade-off: Cross-shard queries become complex.</p>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                                <h4 className="font-medium text-gray-900 dark:text-white text-sm">Denormalization</h4>
                                <p className="text-xs text-gray-600 dark:text-gray-400">Store redundant data to avoid joins. Trade storage for read speed. Common in read-heavy systems.</p>
                            </div>
                        </div>
                    </section>

                    {/* Section 7 - Common Systems */}
                    <section id="common-systems" className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 pb-2 border-b border-gray-200 dark:border-gray-700">
                            7. Common System Design Questions
                        </h2>

                        <div className="grid sm:grid-cols-2 gap-4">
                            {[
                                { name: 'URL Shortener (bit.ly)', difficulty: 'Easy', concepts: ['Hash generation', 'KV store', 'Caching', 'Analytics'] },
                                { name: 'Twitter/News Feed', difficulty: 'Hard', concepts: ['Fan-out', 'Timeline', 'Sharding', 'Cache'] },
                                { name: 'Chat System (WhatsApp)', difficulty: 'Medium', concepts: ['WebSockets', 'Message queue', 'Presence', 'Delivery receipts'] },
                                { name: 'Video Streaming (YouTube)', difficulty: 'Hard', concepts: ['CDN', 'Encoding', 'Adaptive bitrate', 'Storage'] },
                                { name: 'Ride Sharing (Uber)', difficulty: 'Hard', concepts: ['Real-time location', 'Matching', 'ETA', 'Surge pricing'] },
                                { name: 'Rate Limiter', difficulty: 'Medium', concepts: ['Token bucket', 'Sliding window', 'Distributed counting'] },
                            ].map((system) => (
                                <div key={system.name} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-medium text-gray-900 dark:text-white text-sm">{system.name}</h4>
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                            system.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                                            system.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-red-100 text-red-700'
                                        }`}>{system.difficulty}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                        {system.concepts.map((concept) => (
                                            <span key={concept} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded">{concept}</span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* CTA */}
                    <div className="bg-gradient-to-r from-orange-500 to-orange-700 rounded-2xl p-8 text-center">
                        <Star className="w-10 h-10 text-yellow-300 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-white mb-3">Practice System Design</h3>
                        <p className="text-orange-100 mb-6">Test your system design skills with our AI interview practice sessions.</p>
                        <Link to="/" className="inline-flex items-center px-6 py-3 bg-white text-orange-600 font-semibold rounded-lg hover:bg-orange-50 transition-all">
                            Start Practice Interview
                        </Link>
                    </div>
                </div>
            </article>
        </div>
    );
};

export default SystemDesignGuide;
