import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../../components/SEO';
import { Code, ArrowLeft, Clock, Star, CheckCircle, Lightbulb, ExternalLink } from 'lucide-react';

const TechnicalPatternsGuide = () => {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <SEO title="Technical Interview Patterns" description="Master the most common coding patterns asked in FAANG interviews." url="/resources/technical-patterns" />
            
            {/* Header */}
            <section className="bg-gradient-to-br from-purple-600 to-purple-800 py-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Link to="/resources" className="inline-flex items-center text-purple-200 hover:text-white mb-6 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Resources
                    </Link>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                            <Code className="w-7 h-7 text-white" />
                        </div>
                        <span className="px-3 py-1 bg-white/20 text-white text-sm font-medium rounded-full">Technical Guide</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">Technical Interview Patterns</h1>
                    <p className="text-xl text-purple-100 mb-4">Master the 8 essential coding patterns that appear in 90% of technical interviews at top companies.</p>
                    <div className="flex items-center text-purple-200 text-sm">
                        <Clock className="w-4 h-4 mr-1" />
                        30 min read • 8 patterns with code templates
                    </div>
                </div>
            </section>

            {/* Content */}
            <article className="py-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Table of Contents */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md mb-10 border border-gray-100 dark:border-gray-700">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">📋 Table of Contents</h2>
                        <nav className="grid sm:grid-cols-2 gap-2 text-sm">
                            <a href="#two-pointers" className="text-purple-600 hover:text-purple-800 dark:text-purple-400">1. Two Pointers</a>
                            <a href="#sliding-window" className="text-purple-600 hover:text-purple-800 dark:text-purple-400">2. Sliding Window</a>
                            <a href="#binary-search" className="text-purple-600 hover:text-purple-800 dark:text-purple-400">3. Binary Search</a>
                            <a href="#bfs" className="text-purple-600 hover:text-purple-800 dark:text-purple-400">4. BFS (Breadth-First Search)</a>
                            <a href="#dfs" className="text-purple-600 hover:text-purple-800 dark:text-purple-400">5. DFS (Depth-First Search)</a>
                            <a href="#dp" className="text-purple-600 hover:text-purple-800 dark:text-purple-400">6. Dynamic Programming</a>
                            <a href="#backtracking" className="text-purple-600 hover:text-purple-800 dark:text-purple-400">7. Backtracking</a>
                            <a href="#hashmap" className="text-purple-600 hover:text-purple-800 dark:text-purple-400">8. Hash Map Patterns</a>
                        </nav>
                    </div>

                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-10">
                        <div className="flex items-start gap-3">
                            <Lightbulb className="w-5 h-5 text-amber-600 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-amber-800 dark:text-amber-200">How to Use This Guide</p>
                                <p className="text-sm text-amber-700 dark:text-amber-300">
                                    For each pattern: (1) Understand when to use it, (2) Memorize the template, (3) Solve 4-5 practice problems, (4) Explain it out loud as if teaching someone.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Pattern 1: Two Pointers */}
                    <section id="two-pointers" className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="w-8 h-8 bg-purple-600 text-white rounded-lg flex items-center justify-center font-bold">1</span>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Two Pointers</h2>
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded text-xs font-medium">Easy-Medium</span>
                        </div>
                        
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Use two pointers to traverse an array or string from different positions or at different speeds. This pattern reduces O(n²) brute force to O(n) by eliminating redundant comparisons.
                        </p>

                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">When to Use</h3>
                        <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400 mb-4">
                            <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5" /> Sorted array problems (find pair with target sum)</li>
                            <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5" /> Removing duplicates from sorted array</li>
                            <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5" /> Palindrome verification</li>
                            <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5" /> Container with most water</li>
                            <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5" /> 3Sum, 4Sum problems</li>
                        </ul>

                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Code Template</h3>
                        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm mb-4">
{`function twoPointers(arr, target) {
    let left = 0;
    let right = arr.length - 1;
    
    while (left < right) {
        const sum = arr[left] + arr[right];
        
        if (sum === target) {
            return [left, right];
        } else if (sum < target) {
            left++;   // Need larger sum
        } else {
            right--;  // Need smaller sum
        }
    }
    return null;
}

// Time: O(n), Space: O(1)`}
                        </pre>

                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Practice Problems</h3>
                        <div className="flex flex-wrap gap-2">
                            <a href="https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 rounded-lg text-xs text-green-700 dark:text-green-400 hover:bg-green-200 transition-colors">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span> Two Sum II <ExternalLink className="w-3 h-3" />
                            </a>
                            <a href="https://leetcode.com/problems/container-with-most-water/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg text-xs text-yellow-700 dark:text-yellow-400 hover:bg-yellow-200 transition-colors">
                                <span className="w-2 h-2 rounded-full bg-yellow-500"></span> Container With Most Water <ExternalLink className="w-3 h-3" />
                            </a>
                            <a href="https://leetcode.com/problems/3sum/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg text-xs text-yellow-700 dark:text-yellow-400 hover:bg-yellow-200 transition-colors">
                                <span className="w-2 h-2 rounded-full bg-yellow-500"></span> 3Sum <ExternalLink className="w-3 h-3" />
                            </a>
                            <a href="https://leetcode.com/problems/trapping-rain-water/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-100 dark:bg-red-900/30 rounded-lg text-xs text-red-700 dark:text-red-400 hover:bg-red-200 transition-colors">
                                <span className="w-2 h-2 rounded-full bg-red-500"></span> Trapping Rain Water <ExternalLink className="w-3 h-3" />
                            </a>
                        </div>
                    </section>

                    {/* Pattern 2: Sliding Window */}
                    <section id="sliding-window" className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="w-8 h-8 bg-purple-600 text-white rounded-lg flex items-center justify-center font-bold">2</span>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Sliding Window</h2>
                            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 rounded text-xs font-medium">Medium</span>
                        </div>
                        
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Maintain a window that slides through data to find optimal contiguous subarrays or substrings. The window expands by adding elements and contracts by removing elements.
                        </p>

                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">When to Use</h3>
                        <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400 mb-4">
                            <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5" /> Maximum/minimum sum subarray of size K</li>
                            <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5" /> Longest substring with K distinct characters</li>
                            <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5" /> Finding anagrams or permutations</li>
                            <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5" /> Minimum window substring</li>
                            <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5" /> Maximum consecutive ones</li>
                        </ul>

                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Code Template</h3>
                        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm mb-4">
{`function slidingWindow(s) {
    const charCount = {};
    let left = 0;
    let maxLength = 0;
    
    for (let right = 0; right < s.length; right++) {
        // Expand window: add s[right]
        charCount[s[right]] = (charCount[s[right]] || 0) + 1;
        
        // Contract window if invalid
        while (Object.keys(charCount).length > k) {
            charCount[s[left]]--;
            if (charCount[s[left]] === 0) {
                delete charCount[s[left]];
            }
            left++;
        }
        
        // Update result
        maxLength = Math.max(maxLength, right - left + 1);
    }
    return maxLength;
}

// Time: O(n), Space: O(k)`}
                        </pre>

                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Practice Problems</h3>
                        <div className="flex flex-wrap gap-2">
                            <a href="https://leetcode.com/problems/longest-substring-without-repeating-characters/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg text-xs text-yellow-700 dark:text-yellow-400 hover:bg-yellow-200 transition-colors">
                                <span className="w-2 h-2 rounded-full bg-yellow-500"></span> Longest Substring Without Repeating <ExternalLink className="w-3 h-3" />
                            </a>
                            <a href="https://leetcode.com/problems/minimum-window-substring/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-100 dark:bg-red-900/30 rounded-lg text-xs text-red-700 dark:text-red-400 hover:bg-red-200 transition-colors">
                                <span className="w-2 h-2 rounded-full bg-red-500"></span> Minimum Window Substring <ExternalLink className="w-3 h-3" />
                            </a>
                            <a href="https://leetcode.com/problems/permutation-in-string/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg text-xs text-yellow-700 dark:text-yellow-400 hover:bg-yellow-200 transition-colors">
                                <span className="w-2 h-2 rounded-full bg-yellow-500"></span> Permutation in String <ExternalLink className="w-3 h-3" />
                            </a>
                        </div>
                    </section>

                    {/* Pattern 3: Binary Search */}
                    <section id="binary-search" className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="w-8 h-8 bg-purple-600 text-white rounded-lg flex items-center justify-center font-bold">3</span>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Binary Search</h2>
                            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 rounded text-xs font-medium">Medium</span>
                        </div>
                        
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Divide the search space in half each iteration. Works not just on sorted arrays but any problem where you can eliminate half the possibilities based on a condition.
                        </p>

                        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-4">
                            <p className="text-sm text-amber-800 dark:text-amber-200">
                                <strong>💡 Key Insight:</strong> Binary search isn't just for "find element X". It's for any problem where you can answer "is the answer &gt;= mid?" and that answer is monotonic.
                            </p>
                        </div>

                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Code Template</h3>
                        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm mb-4">
{`function binarySearch(arr, target) {
    let left = 0;
    let right = arr.length - 1;
    
    while (left <= right) {
        const mid = left + Math.floor((right - left) / 2);
        
        if (arr[mid] === target) {
            return mid;
        } else if (arr[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    return -1;
}

// Time: O(log n), Space: O(1)`}
                        </pre>

                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Practice Problems</h3>
                        <div className="flex flex-wrap gap-2">
                            <a href="https://leetcode.com/problems/binary-search/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 rounded-lg text-xs text-green-700 dark:text-green-400 hover:bg-green-200 transition-colors">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span> Binary Search <ExternalLink className="w-3 h-3" />
                            </a>
                            <a href="https://leetcode.com/problems/search-in-rotated-sorted-array/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg text-xs text-yellow-700 dark:text-yellow-400 hover:bg-yellow-200 transition-colors">
                                <span className="w-2 h-2 rounded-full bg-yellow-500"></span> Search in Rotated Array <ExternalLink className="w-3 h-3" />
                            </a>
                            <a href="https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg text-xs text-yellow-700 dark:text-yellow-400 hover:bg-yellow-200 transition-colors">
                                <span className="w-2 h-2 rounded-full bg-yellow-500"></span> Find First and Last Position <ExternalLink className="w-3 h-3" />
                            </a>
                        </div>
                    </section>

                    {/* Pattern 4: BFS */}
                    <section id="bfs" className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="w-8 h-8 bg-purple-600 text-white rounded-lg flex items-center justify-center font-bold">4</span>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">BFS (Breadth-First Search)</h2>
                            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 rounded text-xs font-medium">Medium</span>
                        </div>
                        
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Explore all neighbors at current depth before moving to the next level. BFS guarantees shortest path in unweighted graphs because it explores level by level.
                        </p>

                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">When to Use</h3>
                        <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400 mb-4">
                            <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5" /> Shortest path in unweighted graphs</li>
                            <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5" /> Level-order tree traversal</li>
                            <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5" /> Minimum steps to reach target</li>
                            <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5" /> Word ladder, rotten oranges problems</li>
                        </ul>

                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Code Template</h3>
                        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm mb-4">
{`function bfs(graph, start) {
    const queue = [start];
    const visited = new Set([start]);
    let level = 0;
    
    while (queue.length > 0) {
        const levelSize = queue.length;
        
        for (let i = 0; i < levelSize; i++) {
            const node = queue.shift();
            // Process node here
            
            for (const neighbor of graph[node]) {
                if (!visited.has(neighbor)) {
                    visited.add(neighbor);
                    queue.push(neighbor);
                }
            }
        }
        level++;
    }
}

// Time: O(V + E), Space: O(V)`}
                        </pre>

                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Practice Problems</h3>
                        <div className="flex flex-wrap gap-2">
                            <a href="https://leetcode.com/problems/binary-tree-level-order-traversal/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg text-xs text-yellow-700 dark:text-yellow-400 hover:bg-yellow-200 transition-colors">
                                <span className="w-2 h-2 rounded-full bg-yellow-500"></span> Level Order Traversal <ExternalLink className="w-3 h-3" />
                            </a>
                            <a href="https://leetcode.com/problems/rotting-oranges/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg text-xs text-yellow-700 dark:text-yellow-400 hover:bg-yellow-200 transition-colors">
                                <span className="w-2 h-2 rounded-full bg-yellow-500"></span> Rotting Oranges <ExternalLink className="w-3 h-3" />
                            </a>
                            <a href="https://leetcode.com/problems/word-ladder/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-100 dark:bg-red-900/30 rounded-lg text-xs text-red-700 dark:text-red-400 hover:bg-red-200 transition-colors">
                                <span className="w-2 h-2 rounded-full bg-red-500"></span> Word Ladder <ExternalLink className="w-3 h-3" />
                            </a>
                        </div>
                    </section>

                    {/* Pattern 5: DFS */}
                    <section id="dfs" className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="w-8 h-8 bg-purple-600 text-white rounded-lg flex items-center justify-center font-bold">5</span>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">DFS (Depth-First Search)</h2>
                            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 rounded text-xs font-medium">Medium</span>
                        </div>
                        
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Explore as far as possible along each branch before backtracking. DFS is great for exhaustive search and when you need to explore all possible paths.
                        </p>

                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Code Template</h3>
                        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm mb-4">
{`// Recursive DFS
function dfs(graph, node, visited) {
    visited.add(node);
    // Process node here
    
    for (const neighbor of graph[node]) {
        if (!visited.has(neighbor)) {
            dfs(graph, neighbor, visited);
        }
    }
}

// Iterative DFS (using stack)
function dfsIterative(graph, start) {
    const stack = [start];
    const visited = new Set();
    
    while (stack.length > 0) {
        const node = stack.pop();
        if (visited.has(node)) continue;
        visited.add(node);
        
        for (const neighbor of graph[node]) {
            stack.push(neighbor);
        }
    }
}

// Time: O(V + E), Space: O(V)`}
                        </pre>

                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Practice Problems</h3>
                        <div className="flex flex-wrap gap-2">
                            <a href="https://leetcode.com/problems/number-of-islands/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg text-xs text-yellow-700 dark:text-yellow-400 hover:bg-yellow-200 transition-colors">
                                <span className="w-2 h-2 rounded-full bg-yellow-500"></span> Number of Islands <ExternalLink className="w-3 h-3" />
                            </a>
                            <a href="https://leetcode.com/problems/course-schedule/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg text-xs text-yellow-700 dark:text-yellow-400 hover:bg-yellow-200 transition-colors">
                                <span className="w-2 h-2 rounded-full bg-yellow-500"></span> Course Schedule <ExternalLink className="w-3 h-3" />
                            </a>
                            <a href="https://leetcode.com/problems/clone-graph/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg text-xs text-yellow-700 dark:text-yellow-400 hover:bg-yellow-200 transition-colors">
                                <span className="w-2 h-2 rounded-full bg-yellow-500"></span> Clone Graph <ExternalLink className="w-3 h-3" />
                            </a>
                        </div>
                    </section>

                    {/* Pattern 6: Dynamic Programming */}
                    <section id="dp" className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="w-8 h-8 bg-purple-600 text-white rounded-lg flex items-center justify-center font-bold">6</span>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dynamic Programming</h2>
                            <span className="px-2 py-0.5 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded text-xs font-medium">Hard</span>
                        </div>
                        
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Break problems into overlapping subproblems and store solutions to avoid recomputation. DP is the most important pattern for optimization problems.
                        </p>

                        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-4">
                            <p className="text-sm text-amber-800 dark:text-amber-200">
                                <strong>💡 DP Framework:</strong> (1) Define state - what variables define a subproblem? (2) Write recurrence relation - how do states relate? (3) Identify base cases (4) Determine order of computation.
                            </p>
                        </div>

                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Code Template</h3>
                        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm mb-4">
{`// Bottom-up DP
function dp(n) {
    const dp = new Array(n + 1).fill(0);
    dp[0] = 1;  // Base case
    dp[1] = 1;  // Base case
    
    for (let i = 2; i <= n; i++) {
        dp[i] = dp[i-1] + dp[i-2];  // Recurrence
    }
    
    return dp[n];
}

// Memoization (Top-down)
function dpMemo(n, memo = {}) {
    if (n in memo) return memo[n];
    if (n <= 1) return 1;
    
    memo[n] = dpMemo(n-1, memo) + dpMemo(n-2, memo);
    return memo[n];
}

// Time: O(n), Space: O(n) or O(1) with optimization`}
                        </pre>

                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Practice Problems</h3>
                        <div className="flex flex-wrap gap-2">
                            <a href="https://leetcode.com/problems/climbing-stairs/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 rounded-lg text-xs text-green-700 dark:text-green-400 hover:bg-green-200 transition-colors">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span> Climbing Stairs <ExternalLink className="w-3 h-3" />
                            </a>
                            <a href="https://leetcode.com/problems/house-robber/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg text-xs text-yellow-700 dark:text-yellow-400 hover:bg-yellow-200 transition-colors">
                                <span className="w-2 h-2 rounded-full bg-yellow-500"></span> House Robber <ExternalLink className="w-3 h-3" />
                            </a>
                            <a href="https://leetcode.com/problems/longest-increasing-subsequence/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg text-xs text-yellow-700 dark:text-yellow-400 hover:bg-yellow-200 transition-colors">
                                <span className="w-2 h-2 rounded-full bg-yellow-500"></span> Longest Increasing Subsequence <ExternalLink className="w-3 h-3" />
                            </a>
                            <a href="https://leetcode.com/problems/edit-distance/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-100 dark:bg-red-900/30 rounded-lg text-xs text-red-700 dark:text-red-400 hover:bg-red-200 transition-colors">
                                <span className="w-2 h-2 rounded-full bg-red-500"></span> Edit Distance <ExternalLink className="w-3 h-3" />
                            </a>
                        </div>
                    </section>

                    {/* Pattern 7: Backtracking */}
                    <section id="backtracking" className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="w-8 h-8 bg-purple-600 text-white rounded-lg flex items-center justify-center font-bold">7</span>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Backtracking</h2>
                            <span className="px-2 py-0.5 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded text-xs font-medium">Hard</span>
                        </div>
                        
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Build solutions incrementally, abandoning paths that fail to satisfy constraints. Backtracking = DFS + pruning. Essential for combinatorial problems.
                        </p>

                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">When to Use</h3>
                        <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400 mb-4">
                            <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5" /> Generating permutations/combinations</li>
                            <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5" /> Sudoku, N-Queens solvers</li>
                            <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5" /> Word search in grid</li>
                            <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5" /> Subset sum problems</li>
                        </ul>

                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Code Template</h3>
                        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm mb-4">
{`function backtrack(candidates, path, results) {
    // Base case: valid solution found
    if (isComplete(path)) {
        results.push([...path]);
        return;
    }
    
    for (let i = startIndex; i < candidates.length; i++) {
        // Pruning: skip invalid choices
        if (!isValid(candidates[i], path)) continue;
        
        // Make choice
        path.push(candidates[i]);
        
        // Recurse
        backtrack(candidates, path, results, i + 1);
        
        // Undo choice (backtrack)
        path.pop();
    }
}

// Time: O(2^n) or O(n!), Space: O(n)`}
                        </pre>

                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Practice Problems</h3>
                        <div className="flex flex-wrap gap-2">
                            <a href="https://leetcode.com/problems/subsets/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg text-xs text-yellow-700 dark:text-yellow-400 hover:bg-yellow-200 transition-colors">
                                <span className="w-2 h-2 rounded-full bg-yellow-500"></span> Subsets <ExternalLink className="w-3 h-3" />
                            </a>
                            <a href="https://leetcode.com/problems/permutations/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg text-xs text-yellow-700 dark:text-yellow-400 hover:bg-yellow-200 transition-colors">
                                <span className="w-2 h-2 rounded-full bg-yellow-500"></span> Permutations <ExternalLink className="w-3 h-3" />
                            </a>
                            <a href="https://leetcode.com/problems/n-queens/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-100 dark:bg-red-900/30 rounded-lg text-xs text-red-700 dark:text-red-400 hover:bg-red-200 transition-colors">
                                <span className="w-2 h-2 rounded-full bg-red-500"></span> N-Queens <ExternalLink className="w-3 h-3" />
                            </a>
                        </div>
                    </section>

                    {/* Pattern 8: Hash Map */}
                    <section id="hashmap" className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="w-8 h-8 bg-purple-600 text-white rounded-lg flex items-center justify-center font-bold">8</span>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Hash Map Patterns</h2>
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded text-xs font-medium">Easy-Medium</span>
                        </div>
                        
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Use hash-based data structures for O(1) lookup, counting, and grouping. Trade space for time: O(n) space to improve from O(n²) to O(n) time.
                        </p>

                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Common Patterns</h3>
                        <div className="grid sm:grid-cols-2 gap-4 mb-4">
                            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                                <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-2">Frequency Counting</h4>
                                <pre className="text-xs text-gray-600 dark:text-gray-400 overflow-x-auto">
{`const freq = {};
for (const num of arr) {
    freq[num] = (freq[num] || 0) + 1;
}`}
                                </pre>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                                <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-2">Two Sum Pattern</h4>
                                <pre className="text-xs text-gray-600 dark:text-gray-400 overflow-x-auto">
{`const seen = {};
for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (complement in seen) {
        return [seen[complement], i];
    }
    seen[nums[i]] = i;
}`}
                                </pre>
                            </div>
                        </div>

                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Practice Problems</h3>
                        <div className="flex flex-wrap gap-2">
                            <a href="https://leetcode.com/problems/two-sum/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 rounded-lg text-xs text-green-700 dark:text-green-400 hover:bg-green-200 transition-colors">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span> Two Sum <ExternalLink className="w-3 h-3" />
                            </a>
                            <a href="https://leetcode.com/problems/group-anagrams/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg text-xs text-yellow-700 dark:text-yellow-400 hover:bg-yellow-200 transition-colors">
                                <span className="w-2 h-2 rounded-full bg-yellow-500"></span> Group Anagrams <ExternalLink className="w-3 h-3" />
                            </a>
                            <a href="https://leetcode.com/problems/subarray-sum-equals-k/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg text-xs text-yellow-700 dark:text-yellow-400 hover:bg-yellow-200 transition-colors">
                                <span className="w-2 h-2 rounded-full bg-yellow-500"></span> Subarray Sum Equals K <ExternalLink className="w-3 h-3" />
                            </a>
                        </div>
                    </section>

                    {/* CTA */}
                    <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-2xl p-8 text-center">
                        <Star className="w-10 h-10 text-yellow-300 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-white mb-3">Practice These Patterns</h3>
                        <p className="text-purple-100 mb-6">Test your pattern recognition skills in our technical interview practice sessions.</p>
                        <Link to="/" className="inline-flex items-center px-6 py-3 bg-white text-purple-600 font-semibold rounded-lg hover:bg-purple-50 transition-all">
                            Start Practice Interview
                        </Link>
                    </div>
                </div>
            </article>
        </div>
    );
};

export default TechnicalPatternsGuide;
