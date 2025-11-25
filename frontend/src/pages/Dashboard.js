import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { DashboardSkeleton } from '../components/LoadingSkeleton';
import GoogleAd from '../components/GoogleAd';
import { 
  TrendingUp, 
  TrendingDown, 
  Award, 
  Target, 
  Calendar,
  Clock,
  CheckCircle,
  BarChart3
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalInterviews: 0,
    completedInterviews: 0,
    averageScore: 0,
    bestScore: 0,
    companies: [],
    roles: []
  });

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
      
      // Fetch analytics and sessions in parallel
      const [analyticsResponse, sessionsResponse] = await Promise.all([
        fetch(`${apiUrl}/interview/analytics`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${apiUrl}/interview/sessions`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json();
        setStats({
          totalInterviews: analyticsData.total_interviews || 0,
          completedInterviews: analyticsData.completed_interviews || 0,
          averageScore: analyticsData.average_score || 0,
          bestScore: analyticsData.best_score || 0,
          companies: analyticsData.companies || [],
          roles: analyticsData.roles || []
        });
      } else {
        toast.error('Failed to load analytics');
      }

      if (sessionsResponse.ok) {
        const sessionsData = await sessionsResponse.json();
        setSessions(sessionsData.sessions || []);
      } else {
        toast.error('Failed to load sessions');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 8) return 'text-green-600 dark:text-green-400';
    if (score >= 6) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBgColor = (score) => {
    if (score >= 8) return 'bg-green-100 dark:bg-green-900/30';
    if (score >= 6) return 'bg-yellow-100 dark:bg-yellow-900/30';
    return 'bg-red-100 dark:bg-red-900/30';
  };

  // Calculate improvement
  const calculateImprovement = () => {
    const completedSessions = sessions.filter(s => s.score && s.score > 0);
    if (completedSessions.length < 6) return 0;
    
    const firstThree = completedSessions.slice(0, 3).map(s => s.score || 0);
    const lastThree = completedSessions.slice(-3).map(s => s.score || 0);
    
    const firstAvg = firstThree.reduce((a, b) => a + b, 0) / 3;
    const lastAvg = lastThree.reduce((a, b) => a + b, 0) / 3;
    
    return ((lastAvg - firstAvg) / firstAvg) * 100;
  };

  const improvement = calculateImprovement();

  // Prepare data for performance chart
  const completedSessions = sessions.filter(s => s.score && s.score > 0);
  const performanceData = completedSessions.slice(-10).reverse().map((session, index) => ({
    session: completedSessions.length - index,
    score: session.score || 0,
    date: new Date(session.created_at).toLocaleDateString()
  }));

  const maxScore = 10;
  const chartHeight = 200;

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Performance Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Track your interview preparation progress and performance</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Interviews */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">Total Interviews</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalInterviews}</p>
          </div>

          {/* Average Score */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <Target className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">Average Score</h3>
            <p className={`text-3xl font-bold ${getScoreColor(stats.averageScore)}`}>
              {stats.averageScore.toFixed(1)}/10
            </p>
          </div>

          {/* Best Score */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <Award className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">Best Score</h3>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.bestScore.toFixed(1)}/10</p>
          </div>

          {/* Improvement */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${improvement >= 0 ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'} rounded-lg flex items-center justify-center`}>
                {improvement >= 0 ? (
                  <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                ) : (
                  <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
                )}
              </div>
            </div>
            <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">Improvement</h3>
            <p className={`text-3xl font-bold ${improvement >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {improvement >= 0 ? '+' : ''}{improvement.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Performance Chart */}
        {performanceData.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Performance Trend</h2>
            <div className="relative" style={{ height: chartHeight + 60 }}>
              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 bottom-12 w-12 flex flex-col justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>10</span>
                <span>7.5</span>
                <span>5</span>
                <span>2.5</span>
                <span>0</span>
              </div>

              {/* Chart area */}
              <div className="ml-14 mr-4 relative" style={{ height: chartHeight }}>
                {/* Grid lines */}
                <div className="absolute inset-0 flex flex-col justify-between">
                  {[0, 2.5, 5, 7.5, 10].map((line) => (
                    <div key={line} className="border-t border-gray-200 dark:border-gray-700"></div>
                  ))}
                </div>

                {/* Bar chart */}
                <div className="absolute inset-0 flex items-end justify-around">
                  {performanceData.map((data, index) => {
                    const barHeight = (data.score / maxScore) * chartHeight;
                    return (
                      <div key={index} className="flex flex-col items-center" style={{ width: `${90 / performanceData.length}%` }}>
                        <div className="relative group">
                          {/* Tooltip */}
                          <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-900 dark:bg-gray-700 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10">
                            Score: {data.score.toFixed(1)}/10
                            <div className="text-gray-400 dark:text-gray-300">{data.date}</div>
                          </div>
                          {/* Bar */}
                          <div
                            className={`w-full ${getScoreBgColor(data.score)} rounded-t transition-all hover:opacity-80 cursor-pointer`}
                            style={{ height: `${barHeight}px` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* X-axis labels */}
              <div className="ml-14 mr-4 mt-2 flex justify-around text-xs text-gray-500 dark:text-gray-400">
                {performanceData.map((data, index) => (
                  <span key={index}>#{data.session}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Recent Sessions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Recent Interview Sessions</h2>
          {sessions.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <p>No interview sessions yet. Start your first interview to see analytics!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.slice(0, 5).map((session, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {session.role} {session.company && `at ${session.company}`}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(session.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <CheckCircle className="h-4 w-4" />
                          <span>{session.questions?.length || 0} Questions</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${getScoreColor(session.score || 0)}`}>
                        {(session.score || 0).toFixed(1)}/10
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Overall Score</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Score Distribution */}
        {sessions.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mt-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Score Distribution</h2>
            <div className="space-y-4">
              {['Excellent (8-10)', 'Good (6-7.9)', 'Needs Improvement (0-5.9)'].map((category, idx) => {
                const ranges = [[8, 10], [6, 7.9], [0, 5.9]];
                const [min, max] = ranges[idx];
                const count = sessions.filter(s => {
                  const score = s.score || 0;
                  return score >= min && score <= max;
                }).length;
                const percentage = sessions.length > 0 ? (count / sessions.length) * 100 : 0;
                const colors = ['bg-green-500', 'bg-yellow-500', 'bg-red-500'];

                return (
                  <div key={category}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{category}</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{count} ({percentage.toFixed(0)}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div
                        className={`${colors[idx]} h-3 rounded-full transition-all`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Google AdSense - Bottom Banner */}
        <div className="mt-8">
          <GoogleAd 
            slot="2345678901"
            format="horizontal"
            responsive={true}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
