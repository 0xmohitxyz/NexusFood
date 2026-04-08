import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import FollowListModal from '../../components/FollowListModal';
import '../../styles/profile.css';

const UserProfile = () => {
    const [user, setUser] = useState(null);
    const [likedVideos, setLikedVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalData, setModalData] = useState({ isOpen: false, viewType: 'followers' });
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const [profileRes, likesRes] = await Promise.all([
                    axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/auth/user/profile`, { withCredentials: true }),
                    axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/food/like`, { withCredentials: true }).catch(() => ({ data: { likedFoods: [] } }))
                ]);
                
                setUser(profileRes.data.user);
                setLikedVideos(likesRes.data.likedFoods.map(like => like.food) || []);
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
                    <div className="profile-info">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <h1 className="profile-name">{user?.fullName}</h1>
                            <button className="btn-logout" onClick={handleLogout} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                                Logout
                            </button>
                        </div>
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
            <hr className="profile-sep" />

            <section className="profile-grid">
                {likedVideos.map((video) => (
                    video && (
                        <div key={video._id} className="profile-grid-item">
                            <video 
                                src={video.video} 
                                className="profile-grid-video"
                                muted
                                loop
                                onMouseOver={event => event.target.play()}
                                onMouseOut={event => event.target.pause()}
                                playsInline
                            />
                        </div>
                    )
                ))}
            </section>
            
            <div className="profile-content" style={{ marginTop: '30px' }}>
                {/* Additional content could go here in the future */}
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