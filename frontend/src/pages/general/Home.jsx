import React, { useEffect, useState } from 'react'
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../../styles/reels.css'
import ReelFeed from '../../components/ReelFeed'

const Home = () => {
    const [ videos, setVideos ] = useState([])
    const navigate = useNavigate();

    // Autoplay behavior is handled inside ReelFeed

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/food`, { withCredentials: true })
            .then(response => {

                console.log(response.data);

                setVideos(response.data.foodItems)
            })
            .catch((err) => { 
                console.log(err);
                navigate("/user/register");
             })
    }, [])

    // Using local refs within ReelFeed; keeping map here for dependency parity if needed

    async function likeVideo(item) {

        const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/food/like`, { foodId: item._id }, {withCredentials: true})

        if(response.data.like){
            console.log("Video liked");
            setVideos((prev) => prev.map((v) => v._id === item._id ? { ...v, likeCount: v.likeCount + 1, isLiked: true } : v))
        }else{
            console.log("Video unliked");
            setVideos((prev) => prev.map((v) => v._id === item._id ? { ...v, likeCount: v.likeCount - 1, isLiked: false } : v))
        }
        
    }

    async function saveVideo(item) {
        const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/food/save`, { foodId: item._id }, { withCredentials: true })
        
        if(response.data.save){
            setVideos((prev) => prev.map((v) => v._id === item._id ? { ...v, savesCount: v.savesCount + 1 } : v))
        }else{
            setVideos((prev) => prev.map((v) => v._id === item._id ? { ...v, savesCount: v.savesCount - 1 } : v))
        }
    }

    async function followPartner(item) {
        const partnerId = item.foodPartner || item.partnerId?._id;
        if (!partnerId) return;

        try {
            const isFollowing = item.isFollowing;
            const url = isFollowing 
                ? `${import.meta.env.VITE_API_BASE_URL}/api/follow/unfollow/${partnerId}`
                : `${import.meta.env.VITE_API_BASE_URL}/api/follow/follow/${partnerId}`;
            
            await axios.post(url, { type: 'foodpartner' }, { withCredentials: true });
            
            // Update all videos from this partner to reflect the new follow state
            setVideos((prev) => prev.map((v) => 
                (v.foodPartner === partnerId || v.partnerId?._id === partnerId) 
                    ? { ...v, isFollowing: !isFollowing } 
                    : v
            ));
        } catch (error) {
            console.error("Error toggling follow:", error);
        }
    }

    const [categories, setCategories] = useState(["All"]);
    const [selectedCategory, setSelectedCategory] = useState("All");

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/admin/categories`)
            .then(res => {
                const names = res.data.categories.map(c => c.name);
                setCategories(["All", ...names]);
            })
            .catch(() => {}); // silently keep "All" if fetch fails
    }, []);

    const handleCommentUpdate = (foodId, newCount) => {
        setVideos((prev) => prev.map((v) => v._id === foodId ? { ...v, commentCount: newCount } : v));
    }

    return (
        <div style={{ position: 'relative', height: '100%' }}>
            {/* Category Chips Bar */}
            <div className="category-bar">
                {categories.map(cat => (
                    <button 
                        key={cat} 
                        className={`category-chip ${selectedCategory === cat ? 'is-active' : ''}`}
                        onClick={() => setSelectedCategory(cat)}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <ReelFeed
                items={videos.filter(v => selectedCategory === "All" || v.category === selectedCategory)}
                onLike={likeVideo}
                onSave={saveVideo} 
                onFollow={followPartner}
                onCommentUpdate={handleCommentUpdate}
            />
        </div>
    )
}

export default Home