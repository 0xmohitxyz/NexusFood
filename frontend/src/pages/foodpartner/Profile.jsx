import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import '../../styles/profile.css'

const Profile = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [profile, setProfile] = useState(null)
    const [videos, setVideos] = useState([])
    const [stats, setStats] = useState({ posts: 0, likes: 0, saves: 0 })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const getProfile = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/food-partner/${id}`, { 
                    withCredentials: true 
                })
                const data = response.data.foodPartner
                setProfile(data)
                setVideos(data.foodItems || [])
                
                // Calculate stats based on fetched food items
                const totalLikes = (data.foodItems || []).reduce((acc, curr) => acc + (curr.likeCount || 0), 0)
                const totalSaves = (data.foodItems || []).reduce((acc, curr) => acc + (curr.savesCount || 0), 0)
                
                setStats({
                    posts: (data.foodItems || []).length,
                    likes: totalLikes,
                    saves: totalSaves
                })
            } catch (error) {
                console.error("Error fetching profile:", error)
            } finally {
                setLoading(false)
            }
        }
        getProfile()
    }, [id])

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
                   </div>
                </div>

                <div className="profile-stats">
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
        </main>
    )
}

export default Profile