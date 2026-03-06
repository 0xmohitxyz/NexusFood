import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../../styles/profile.css';

const UserProfile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/auth/user/profile`, {
                    withCredentials: true
                });
                setUser(response.data.user);
                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch profile", error);
                navigate("/user/login");
            }
        };

        fetchProfile();
    }, [navigate]);

    const handleLogout = async () => {
        try {
            await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/auth/user/logout`, { withCredentials: true });
            localStorage.removeItem("userType");
            navigate("/user/login");
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    if (loading) return <div className="profile-page">Loading...</div>;

    return (
        <div className="profile-page">
            <header className="profile-header">
                <div className="profile-meta">
                    <div className="profile-avatar" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', color: '#555', backgroundColor: '#eee'}}>
                         {user?.fullName?.charAt(0).toUpperCase()}
                    </div>
                    <div className="profile-info">
                        <h1 style={{fontSize:'1.5rem'}}>{user?.fullName}</h1>
                        <p className="profile-email">{user?.email}</p>
                    </div>
                </div>
            </header>
            
            <div className="profile-content">
                <div className="profile-actions" style={{marginTop:'2rem'}}>
                    <button className="logout-btn" onClick={handleLogout} style={{padding:'10px 20px', cursor:'pointer'}}>
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;