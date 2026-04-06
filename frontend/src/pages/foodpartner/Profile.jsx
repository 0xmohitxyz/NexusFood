import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import FollowListModal from '../../components/FollowListModal'
import '../../styles/profile.css'

const Profile = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [profile, setProfile] = useState(null)
    const [videos, setVideos] = useState([])
    const [stats, setStats] = useState({ posts: 0, likes: 0, saves: 0, followers: 0, following: 0 })
    const [isFollowing, setIsFollowing] = useState(false)
    const [loading, setLoading] = useState(true)
    const [modalData, setModalData] = useState({ isOpen: false, viewType: 'followers' })

    useEffect(() => {
        const getProfile = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/food-partner/${id}`, {
                    withCredentials: true // Ensures cookies are sent
                })
                const data = response.data.foodPartner
                setProfile(data)
                setIsFollowing(data.isFollowing)
                setVideos(data.foodItems || [])
                
                // Calculate stats based on fetched food items
                const totalLikes = (data.foodItems || []).reduce((acc, curr) => acc + (curr.likeCount || 0), 0)
                const totalSaves = (data.foodItems || []).reduce((acc, curr) => acc + (curr.savesCount || 0), 0)
                
                setStats({
                    posts: (data.foodItems || []).length,
                    likes: totalLikes,
                    saves: totalSaves,
                    followers: data.stats?.followers || 0,
                    following: data.stats?.following || 0
                })
            } catch (error) {
                console.error("Error fetching profile:", error)
            } finally {
                setLoading(false)
            }
        }
        getProfile()
    }, [id])

    const handleFollowToggle = async () => {
        try {
            const url = isFollowing 
                ? `${import.meta.env.VITE_API_BASE_URL}/api/follow/unfollow/${id}`
                : `${import.meta.env.VITE_API_BASE_URL}/api/follow/follow/${id}`;
            
            await axios.post(url, { type: 'foodpartner' }, { withCredentials: true });
            
            setIsFollowing(!isFollowing);
            setStats(prev => ({
                ...prev,
                followers: isFollowing ? prev.followers - 1 : prev.followers + 1
            }));
        } catch (error) {
            console.error("Error toggling follow:", error);
            alert("Action failed. Please try again.");
        }
    };

    const openFollowList = (type) => {
        setModalData({ isOpen: true, viewType: type });
    };

    const closeModal = () => {
        setModalData({ ...modalData, isOpen: false });
    };

    if (loading) return <div>Loading...</div>
    if (!profile) return <div>Profile not found</div>

    return (
        <main className="profile-page">
            <header className="profile-header">
                <button onClick={() => navigate(-1)} className="back-btn">&larr; Back</button>
                <div className="profile-meta">
                    <div className="profile-avatar-placeholder">
                        {profile.name ? profile.name.charAt(0).toUpperCase() : 'P'}
                    </div>
                   
                   <div className="profile-info">
                       <h1 className="profile-business">{profile.name}</h1>
                       <p className="profile-address">{profile.address}</p>
                       <div className="profile-contact">
                           {profile.contactName && <span>{profile.contactName} • </span>}
                           <span>{profile.phone}</span>
                       </div>
                       <button 
                           onClick={handleFollowToggle}
                           style={{
                               marginTop: '10px',
                               padding: '8px 16px',
                               backgroundColor: isFollowing ? '#ccc' : '#ff4d4f',
                               color: 'white',
                               border: 'none',
                               borderRadius: '4px',
                               cursor: 'pointer'
                           }}
                       >
                           {isFollowing ? 'Unfollow' : 'Follow'}
                       </button>
                   </div>
                </div>

                <div className="profile-stats">
                    <div 
                        className="profile-stat" 
                        style={{ cursor: 'pointer' }}
                        onClick={() => openFollowList('followers')}
                    >
                        <span className="profile-stat-value">{stats.followers}</span>
                        <span className="profile-stat-label">Followers</span>
                    </div>
                     <div 
                        className="profile-stat"
                        style={{ cursor: 'pointer' }}
                        onClick={() => openFollowList('following')}
                    >
                        <span className="profile-stat-value">{stats.following}</span>
                        <span className="profile-stat-label">Following</span>
                    </div>
                    <div className="profile-stat">
                        <span className="profile-stat-value">{stats.posts}</span>
                        <span className="profile-stat-label">Posts</span>
                    </div>
                    <div className="profile-stat">
                        <span className="profile-stat-value">{stats.likes}</span>
                        <span className="profile-stat-label">Likes</span>
                    </div>
                     <div className="profile-stat">
                        <span className="profile-stat-value">{stats.saves}</span>
                        <span className="profile-stat-label">Saves</span>
                    </div>
                </div>
            </header>
            
            <hr className="profile-sep" />

            <section className="profile-grid">
                {videos.map((video) => (
                    <div key={video._id} className="profile-grid-item">
                        <video 
                            src={video.video} 
                            className="profile-grid-video"
                            muted
                            loop
                            // Auto-play on hover is a nice touch for food videos
                            onMouseOver={event => event.target.play()}
                            onMouseOut={event => event.target.pause()}
                            playsInline
                        />
                    </div>
                ))}
            </section>

            {profile && (
                <FollowListModal 
                    isOpen={modalData.isOpen}
                    onClose={closeModal}
                    userId={profile._id}
                    viewType={modalData.viewType}
                    userType="foodpartner"
                />
            )}
        </main>
    )
}

export default Profile