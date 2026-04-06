import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import FollowListModal from '../../components/FollowListModal';
import '../../styles/profile.css';

const UserProfile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [modalData, setModalData] = useState({ isOpen: false, viewType: 'followers' });
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

    const openFollowList = (type) => {
        setModalData({ isOpen: true, viewType: type });
    };

    const closeModal = () => {
        setModalData({ ...modalData, isOpen: false });
    };

    if (loading) return <div className="profile-page">Loading...</div>;

    return (
        <div className="profile-page">
            <header className="profile-header">
                <div className="profile-meta">
                    <div className="profile-avatar-placeholder">
                         {user?.fullName?.charAt(0).toUpperCase()}
                    </div>
                    <div className="profile-info">
                        <h1 className="profile-name">{user?.fullName}</h1>
                        <p className="profile-email">{user?.email}</p>
                        <p className="profile-joined">
                            Member since: {new Date(user?.joinedAt).toLocaleDateString()}
                        </p>
                        <div className="profile-stats">
                            <div 
                                className="profile-stat" 
                                onClick={() => openFollowList('followers')}
                            >
                                <span className="profile-stat-value">{user?.stats?.followers || 0}</span>
                                <span className="profile-stat-label">Followers</span>
                            </div>
                            <div 
                                className="profile-stat" 
                                onClick={() => openFollowList('following')}
                            >
                                <span className="profile-stat-value">{user?.stats?.following || 0}</span>
                                <span className="profile-stat-label">Following</span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
            
            <div className="profile-content">
                <div className="profile-actions-footer">
                    <button className="btn-logout" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </div>

            {user && (
                <FollowListModal 
                    isOpen={modalData.isOpen}
                    onClose={closeModal}
                    userId={user._id}
                    viewType={modalData.viewType}
                    userType="user"
                />
            )}
        </div>
    );
};

export default UserProfile;