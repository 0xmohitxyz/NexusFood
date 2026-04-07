import React, { useEffect, useState } from 'react'
import '../../styles/reels.css'
import axios from 'axios'
import ReelFeed from '../../components/ReelFeed'

const Saved = () => {
    const [ videos, setVideos ] = useState([])

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/food/save`, { withCredentials: true })
            .then(response => {
                const savedFoods = response.data.savedFoods.map((item) => ({
                    _id: item.food._id,
                    video: item.food.video,
                    description: item.food.description,
                    likeCount: item.food.likeCount,
                    savesCount: item.food.savesCount,
                    commentsCount: item.food.commentsCount,
                    foodPartner: item.food.foodPartner,
                }))
                setVideos(savedFoods)
            })
    }, [])

    const likeVideo = async (item) => {
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/food/like`, { foodId: item._id }, { withCredentials: true });
            if (response.data.like) {
                setVideos((prev) => prev.map((v) => v._id === item._id ? { ...v, likeCount: (v.likeCount || 0) + 1, isLiked: true } : v));
            } else {
                setVideos((prev) => prev.map((v) => v._id === item._id ? { ...v, likeCount: Math.max(0, (v.likeCount || 0) - 1), isLiked: false } : v));
            }
        } catch {
            // noop
        }
    };

    const removeSaved = async (item) => {
        try {
            await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/food/save`, { foodId: item._id }, { withCredentials: true })
            setVideos((prev) => prev.map((v) => v._id === item._id ? { ...v, savesCount: Math.max(0, (v.savesCount ?? 1) - 1) } : v))
        } catch {
            // noop
        }
    }

    const handleCommentUpdate = (foodId, newCount) => {
        setVideos((prev) => prev.map((v) => v._id === foodId ? { ...v, commentsCount: newCount } : v));
    }

    return (
        <ReelFeed
             items={videos}
             onLike={likeVideo}
             onSave={removeSaved}
             onCommentUpdate={handleCommentUpdate}
            emptyMessage="No saved videos yet."
        />
    )
}

export default Saved