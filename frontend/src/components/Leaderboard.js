import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Trophy, Medal, Award, TrendingUp, Users, Filter, Crown, Star, Target, Zap } from 'lucide-react';


const Leaderboard = () => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('all');
  const [roleFilter, setRoleFilter] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLeaderboard();
  }, [timeframe, roleFilter]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        timeframe,
        ...(roleFilter && { role_filter: roleFilter })
      });

      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/interview/leaderboard?${params}`,
        {
          headers: {
            ...(token && { 'Authorization': `Bearer ${token}` }),
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
      }

      const data = await response.json();
      setLeaderboard(data.leaderboard || []);
      setCurrentUser(data.current_user);
      setTotalUsers(data.total_users || 0);
    } catch (err) {
      setError(err.message || 'Failed to load leaderboard');
      console.error('Error fetching leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRankBadge = (rank) => {
    if (rank === 1) {
      return (
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-lg">
          <Crown className="h-6 w-6 text-white" />
        </div>
      );
    } else if (rank === 2) {
      return (
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 shadow-lg">
          <Medal className="h-6 w-6 text-white" />
        </div>
      );
    } else if (rank === 3) {
      return (
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 shadow-lg">
          <Award className="h-6 w-6 text-white" />
        </div>
      );
    } else {
      return (
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 shadow">
          <span className="text-lg font-bold text-gray-700 dark:text-gray-300">#{rank}</span>
        </div>
      );
    }
  };

  const getScoreColor = (score) => {
    if (score >= 8) return 'text-green-600 dark:text-green-400';
    if (score >= 6) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBg = (score) => {
    if (score >= 8) return 'bg-green-50 dark:bg-green-900/20';
    if (score >= 6) return 'bg-yellow-50 dark:bg-yellow-900/20';
    return 'bg-red-50 dark:bg-red-900/20';
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-8"></div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4">
              <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Trophy className="h-8 w-8 text-yellow-500" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Leaderboard</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Compare your performance with {totalUsers} other interviewees
        </p>
      </div>

      {/* Stats Cards */}
      {currentUser && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-4 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-purple-100 text-sm font-medium">Your Rank</span>
              <Target className="h-5 w-5 text-purple-200" />
            </div>
            <p className="text-3xl font-bold">#{currentUser.rank}</p>
            <p className="text-purple-100 text-xs mt-1">out of {totalUsers} users</p>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-blue-100 text-sm font-medium">Avg Score</span>
              <TrendingUp className="h-5 w-5 text-blue-200" />
            </div>
            <p className="text-3xl font-bold">{currentUser.average_score.toFixed(1)}</p>
            <p className="text-blue-100 text-xs mt-1">out of 10.0</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-green-100 text-sm font-medium">Best Score</span>
              <Star className="h-5 w-5 text-green-200" />
            </div>
            <p className="text-3xl font-bold">{currentUser.best_score.toFixed(1)}</p>
            <p className="text-green-100 text-xs mt-1">personal best</p>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-4 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-orange-100 text-sm font-medium">Total Points</span>
              <Zap className="h-5 w-5 text-orange-200" />
            </div>
            <p className="text-3xl font-bold">{currentUser.total_points}</p>
            <p className="text-orange-100 text-xs mt-1">{currentUser.total_interviews} interviews</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Filter className="inline h-4 w-4 mr-1" />
              Timeframe
            </label>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Time</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Users className="inline h-4 w-4 mr-1" />
              Filter by Role
            </label>
            <input
              type="text"
              placeholder="e.g., Frontend, Backend..."
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Leaderboard Table */}
      {error ? (
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 dark:border-red-600 p-4 rounded">
          <p className="text-red-700 dark:text-red-400">{error}</p>
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <Trophy className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No rankings yet</h3>
          <p className="text-gray-600 dark:text-gray-400">Be the first to complete an interview!</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          {/* Table Header */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
            <h2 className="text-xl font-bold text-white">Top Performers</h2>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {leaderboard.map((entry, index) => (
              <div
                key={index}
                className={`px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${entry.is_current_user ? 'bg-indigo-50 dark:bg-indigo-900/20 border-l-4 border-indigo-500' : ''
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    {/* Rank Badge */}
                    {getRankBadge(entry.rank)}

                    {/* User Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className={`text-lg font-semibold ${entry.is_current_user
                            ? 'text-indigo-700 dark:text-indigo-300'
                            : 'text-gray-900 dark:text-white'
                          }`}>
                          {entry.display_name}
                        </h3>
                        {entry.is_current_user && (
                          <span className="px-2 py-0.5 bg-indigo-500 text-white text-xs font-medium rounded-full">
                            You
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {entry.total_interviews} interview{entry.total_interviews !== 1 ? 's' : ''} completed
                      </p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-6">
                    {/* Average Score */}
                    <div className="text-right">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Avg Score</p>
                      <div className={`px-3 py-1 rounded-full ${getScoreBg(entry.average_score)}`}>
                        <span className={`text-lg font-bold ${getScoreColor(entry.average_score)}`}>
                          {entry.average_score.toFixed(1)}
                        </span>
                        <span className="text-xs text-gray-600 dark:text-gray-400">/10</span>
                      </div>
                    </div>

                    {/* Best Score */}
                    <div className="text-right">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Best</p>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                          {entry.best_score.toFixed(1)}
                        </span>
                      </div>
                    </div>

                    {/* Total Points */}
                    <div className="text-right hidden md:block">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Points</p>
                      <div className="flex items-center gap-1">
                        <Zap className="h-4 w-4 text-orange-500" />
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                          {entry.total_points}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Current User Entry (if not in top) */}
          {currentUser && !leaderboard.some(e => e.is_current_user) && (
            <>
              <div className="px-6 py-2 bg-gray-100 dark:bg-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                  ... {currentUser.rank - leaderboard.length} more users ...
                </p>
              </div>
              <div className="px-6 py-4 bg-indigo-50 dark:bg-indigo-900/20 border-l-4 border-indigo-500">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    {getRankBadge(currentUser.rank)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-indigo-700 dark:text-indigo-300">
                          You
                        </h3>
                        <span className="px-2 py-0.5 bg-indigo-500 text-white text-xs font-medium rounded-full">
                          Your Rank
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {currentUser.total_interviews} interview{currentUser.total_interviews !== 1 ? 's' : ''} completed
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Avg Score</p>
                      <div className={`px-3 py-1 rounded-full ${getScoreBg(currentUser.average_score)}`}>
                        <span className={`text-lg font-bold ${getScoreColor(currentUser.average_score)}`}>
                          {currentUser.average_score.toFixed(1)}
                        </span>
                        <span className="text-xs text-gray-600 dark:text-gray-400">/10</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Best</p>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                          {currentUser.best_score.toFixed(1)}
                        </span>
                      </div>
                    </div>

                    <div className="text-right hidden md:block">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Points</p>
                      <div className="flex items-center gap-1">
                        <Zap className="h-4 w-4 text-orange-500" />
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                          {currentUser.total_points}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Privacy Notice */}
      <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">Privacy Protected</h3>
            <p className="mt-1 text-sm text-blue-700 dark:text-blue-400">
              All usernames are anonymized for privacy. Only you can see your actual rank and stats.
            </p>
          </div>
        </div>
      </div>


    </div>
  );
};

export default Leaderboard;
