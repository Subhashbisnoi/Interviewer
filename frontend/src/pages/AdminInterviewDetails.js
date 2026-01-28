import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

const AdminInterviewDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDetails = async () => {
            const token = localStorage.getItem('admin_token');
            if (!token) {
                navigate('/admin/login');
                return;
            }

            try {
                const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
                const response = await axios.get(`${API_URL}/admin/interviews/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setDetails(response.data);
                setLoading(false);
            } catch (err) {
                if (err.response?.status === 401) {
                    localStorage.removeItem('admin_token');
                    navigate('/admin/login');
                } else {
                    setError('Failed to load interview details');
                    setLoading(false);
                }
            }
        };

        fetchDetails();
    }, [id, navigate]);

    if (loading) return <div className="p-8 text-center text-gray-500">Loading interview details...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
    if (!details) return null;

    const { session, messages } = details;

    return (
        <div style={{ padding: '2rem', backgroundColor: '#f9fafb', minHeight: '100vh', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <button 
                    onClick={() => navigate('/admin/dashboard')}
                    style={{ marginBottom: '1rem', color: '#4F46E5', cursor: 'pointer', border: 'none', background: 'none', fontWeight: '500' }}
                >
                    &larr; Back to Dashboard
                </button>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                        <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>
                            Interview details #{session.id}
                        </h1>
                        <p style={{ color: '#6B7280' }}>
                            {session.user_name} ({session.user_email}) &bull; {new Date(session.created_at).toLocaleString()}
                        </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#4F46E5' }}>
                            {session.score > 0 ? session.score.toFixed(1) : '-'}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#6B7280', textTransform: 'uppercase' }}>Average Score</div>
                    </div>
                </div>
            </div>

            {/* Metadata Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <InfoCard label="Role" value={session.role} />
                <InfoCard label="Company" value={session.company} />
                <InfoCard label="Mode" value={session.interview_mode} />
                <InfoCard label="Status" value={session.status} />
            </div>

            {/* Resume & JD Section (Collapsible could be better, but simple for now) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
                <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', maxHeight: '300px', overflowY: 'auto' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>Resume Text</h3>
                    <p style={{ fontSize: '0.875rem', color: '#4B5563', whiteSpace: 'pre-wrap' }}>{session.resume_text?.substring(0, 500)}...</p>
                </div>
                <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', maxHeight: '300px', overflowY: 'auto' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>Job Description</h3>
                    <p style={{ fontSize: '0.875rem', color: '#4B5563', whiteSpace: 'pre-wrap' }}>{session.job_description || 'N/A'}</p>
                </div>
            </div>

            {/* Transcript */}
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '1.5rem' }}>Full Transcript</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {messages.map((msg) => (
                    <div key={msg.id} style={{ 
                        display: 'flex', 
                        flexDirection: 'column',
                        alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start'
                    }}>
                        <div style={{ 
                            maxWidth: '80%', 
                            padding: '1rem 1.5rem', 
                            borderRadius: '12px',
                            backgroundColor: msg.role === 'user' ? '#EEF2FF' : 'white',
                            border: msg.role === 'user' ? '1px solid #C7D2FE' : '1px solid #E5E7EB',
                            color: '#1F2937',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                        }}>
                            <div style={{ marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: '600', color: msg.role === 'user' ? '#4F46E5' : '#6B7280', textTransform: 'uppercase' }}>
                                {msg.role === 'user' ? 'Candidate' : 'Interviewer'}
                            </div>
                            <div className="prose prose-sm max-w-none">
                                <ReactMarkdown>{msg.content}</ReactMarkdown>
                            </div>
                            {msg.marks !== null && (
                                <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(0,0,0,0.1)', fontSize: '0.875rem', fontWeight: '600', color: msg.marks >= 7 ? '#059669' : '#D97706' }}>
                                    Score: {msg.marks}/10
                                </div>
                            )}
                            {msg.metadata?.feedback && (
                                <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#4B5563', fontStyle: 'italic' }}>
                                    Feedback: {msg.metadata.feedback}
                                </div>
                            )}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: '0.25rem', padding: '0 0.5rem' }}>
                            {new Date(msg.created_at).toLocaleTimeString()}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const InfoCard = ({ label, value }) => (
    <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
        <div style={{ fontSize: '0.75rem', color: '#6B7280', textTransform: 'uppercase', fontWeight: '600' }}>{label}</div>
        <div style={{ fontSize: '1rem', fontWeight: '500', color: '#111827', marginTop: '0.25rem' }}>{value || '-'}</div>
    </div>
);

export default AdminInterviewDetails;
