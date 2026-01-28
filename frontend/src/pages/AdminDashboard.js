import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line
} from 'recharts';

const AdminDashboard = () => {
    const [interviews, setInterviews] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('admin_token');
            if (!token) {
                navigate('/admin/login');
                return;
            }

            try {
                const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
                const authHeader = { headers: { Authorization: `Bearer ${token}` } };
                
                // Parallel fetch
                const [interviewsRes, statsRes] = await Promise.all([
                    axios.get(`${API_URL}/admin/interviews`, authHeader),
                    axios.get(`${API_URL}/admin/stats`, authHeader)
                ]);

                setInterviews(interviewsRes.data);
                setStats(statsRes.data);
                setLoading(false);
            } catch (err) {
                if (err.response?.status === 401) {
                    localStorage.removeItem('admin_token');
                    navigate('/admin/login');
                } else {
                    setError('Failed to load dashboard data');
                    setLoading(false);
                }
            }
        };

        fetchData();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        navigate('/admin/login');
    };

    if (loading) return <div className="flex justify-center items-center h-screen bg-gray-50">Loading Admin Dashboard...</div>;

    return (
        <div style={{ padding: '2rem', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#111827' }}>Admin Analytics Dashboard</h1>
                <button 
                    onClick={handleLogout}
                    style={{ padding: '0.5rem 1rem', backgroundColor: '#EF4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                    Logout
                </button>
            </div>

            {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}

            {/* Stats Cards */}
            {stats && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                    <StatCard title="Total Interviews" value={stats.total_interviews} color="#4F46E5" />
                    <StatCard title="Total Users" value={stats.total_users} color="#10B981" />
                    <StatCard title="Avg Score" value={stats.average_score} color="#F59E0B" />
                </div>
            )}

            {/* Charts Section */}
            {stats && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
                    {/* Activity Line Chart */}
                    <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', color: '#374151' }}>Daily Interview Activity</h3>
                        <div style={{ height: '300px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={stats.daily_activity}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="count" stroke="#8884d8" name="Interviews" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Score Distribution Bar Chart */}
                    <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', color: '#374151' }}>Score Distribution</h3>
                        <div style={{ height: '300px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.score_distribution}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" tick={{fontSize: 10}} interval={0} />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="value" fill="#82ca9d" name="Candidates" barSize={50} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Status Pie Chart */}
                    <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', color: '#374151' }}>Interview Status</h3>
                        <div style={{ height: '300px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={stats.status_distribution}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {stats.status_distribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Mode Pie Chart */}
                    <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', color: '#374151' }}>Interview Modes</h3>
                        <div style={{ height: '300px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={stats.mode_distribution}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="value"
                                        label
                                    >
                                        {stats.mode_distribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index + 2 % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}

            {/* Recent Interviews Table */}
            <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #e5e7eb' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#111827' }}>Recent Interviews</h3>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ backgroundColor: '#f3f4f6' }}>
                            <tr>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', color: '#6B7280' }}>User</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', color: '#6B7280' }}>Role</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', color: '#6B7280' }}>Company</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', color: '#6B7280' }}>Score</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', color: '#6B7280' }}>Status</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', color: '#6B7280' }}>Date</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', color: '#6B7280' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody style={{ divideY: '1px solid #e5e7eb' }}>
                            {interviews.slice(0, 10).map((interview) => (
                                <tr key={interview.id} style={{ borderTop: '1px solid #e5e7eb' }}>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ fontWeight: '500', color: '#111827' }}>{interview.user_name}</div>
                                        <div style={{ color: '#6B7280', fontSize: '0.875rem' }}>{interview.user_email}</div>
                                    </td>
                                    <td style={{ padding: '1rem', color: '#111827' }}>{interview.role}</td>
                                    <td style={{ padding: '1rem', color: '#111827' }}>{interview.company}</td>
                                    <td style={{ padding: '1rem', fontWeight: '500' }}>
                                        {interview.score > 0 ? interview.score.toFixed(1) : '-'}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{ 
                                            padding: '0.25rem 0.5rem', 
                                            borderRadius: '9999px', 
                                            fontSize: '0.75rem', 
                                            backgroundColor: interview.status === 'completed' ? '#D1FAE5' : '#FEF3C7',
                                            color: interview.status === 'completed' ? '#065F46' : '#92400E'
                                        }}>
                                            {interview.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', color: '#6B7280' }}>
                                        {new Date(interview.created_at).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <button 
                                            onClick={() => navigate(`/admin/interviews/${interview.id}`)}
                                            style={{ padding: '0.25rem 0.75rem', backgroundColor: '#EDE9FE', color: '#6D28D9', borderRadius: '4px', border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '500' }}
                                        >
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, color }) => (
    <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: `4px solid ${color}` }}>
        <p style={{ color: '#6B7280', fontSize: '0.875rem', textTransform: 'uppercase', fontWeight: '600', marginBottom: '0.5rem' }}>{title}</p>
        <p style={{ color: '#111827', fontSize: '2rem', fontWeight: 'bold' }}>{value}</p>
    </div>
);

export default AdminDashboard;
