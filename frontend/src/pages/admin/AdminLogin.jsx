import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../../styles/admin.css';

const AdminLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/api/admin/login`,
                { username, password },
                { withCredentials: true }
            );
            navigate('/admin/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-login-page">
            <div className="admin-login-card">
                <div className="admin-login-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                </div>
                <h1 className="admin-login-title">Admin Portal</h1>
                <p className="admin-login-sub">NexusFood Control Panel</p>

                <form className="admin-login-form" onSubmit={handleSubmit}>
                    <div className="admin-field-group">
                        <label htmlFor="adminUser">Username</label>
                        <input
                            id="adminUser"
                            type="text"
                            placeholder="admin"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            autoComplete="username"
                        />
                    </div>
                    <div className="admin-field-group">
                        <label htmlFor="adminPass">Password</label>
                        <input
                            id="adminPass"
                            type="password"
                            placeholder="••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete="current-password"
                        />
                    </div>

                    {error && <p className="admin-error">{error}</p>}

                    <button className="admin-btn-primary" type="submit" disabled={loading}>
                        {loading ? 'Signing in…' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
