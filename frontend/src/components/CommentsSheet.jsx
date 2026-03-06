import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import '../styles/comments.css';

const CommentsSheet = ({ isOpen, onClose, foodId, onCommentAdded }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const commentsEndRef = useRef(null);

    useEffect(() => {
        if (isOpen && foodId) {
            fetchComments();
        }
    }, [isOpen, foodId]);

    const fetchComments = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/food/comments/${foodId}`, {
                withCredentials: true
            });
            setComments(response.data.comments);
        } catch (error) {
            console.error("Error fetching comments", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async () => {
        if (!newComment.trim()) return;
        setSending(true);
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/food/comment`, {
                foodId,
                text: newComment
            }, { withCredentials: true });

            const addedComment = response.data.comment;
            setComments(prev => [addedComment, ...prev]);
            setNewComment("");
            
            if (onCommentAdded) {
                onCommentAdded();
            }
            
            // Scroll to top? Or just top of list (default)
        } catch (error) {
            console.error("Error posting comment", error);
        } finally {
            setSending(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="comments-modal-overlay" onClick={onClose}>
            <div className="comments-modal" onClick={e => e.stopPropagation()}>
                <div className="comments-header">
                    <h3>Comments</h3>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>
                
                <div className="comments-list">
                    {loading ? (
                        <div className="loading-comments">Loading comments...</div>
                    ) : comments.length === 0 ? (
                        <div className="empty-comments">No comments yet. Be the first!</div>
                    ) : (
                        comments.map(comment => (
                            <div key={comment._id} className="comment-item">
                                <div className="comment-avatar">
                                    {comment.user?.fullName?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <div className="comment-content">
                                    <div className="comment-author">
                                        {comment.user?.fullName || 'User'} 
                                        <span className="comment-time"> • {new Date(comment.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className="comment-text">{comment.text}</div>
                                </div>
                            </div>
                        ))
                    )}
                    <div ref={commentsEndRef} />
                </div>

                <div className="comments-input-area">
                    <input 
                        className="comment-input"
                        type="text" 
                        placeholder="Add a comment..." 
                        value={newComment}
                        onChange={e => setNewComment(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                        disabled={sending}
                    />
                    <button 
                        className="send-btn" 
                        onClick={handleSend}
                        disabled={!newComment.trim() || sending}
                    >
                        {sending ? '...' : 'Post'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CommentsSheet;