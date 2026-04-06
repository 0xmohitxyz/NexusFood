import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';

const FollowListModal = ({ isOpen, onClose, userId, viewType, userType }) => {
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!isOpen || !userId) return;

        const fetchList = async () => {
            setLoading(true);
            setError(null);
            try {
                // Determine API endpoint based on viewType
                const endpoint = viewType === 'followers' ? 'followers' : 'following';
                const url = `${import.meta.env.VITE_API_BASE_URL}/api/follow/${endpoint}/${userId}?type=${userType}`;
                
                const response = await axios.get(url, { withCredentials: true });
                setList(response.data);
            } catch (err) {
                console.error("Error fetching follow data", err);
                setError("Failed to load data.");
            } finally {
                setLoading(false);
            }
        };

        fetchList();
    }, [isOpen, userId, viewType, userType]);

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>{viewType === 'followers' ? 'Followers' : 'Following'}</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>
                <div className="follow-list">
                    {loading && <p>Loading...</p>}
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                    {!loading && !error && list.length === 0 && (
                        <p style={{ textAlign: 'center', color: '#888' }}>No {viewType} found.</p>
                    )}
                    {!loading && !error && list.map((item) => {
                        // The actual user/partner object is either item.follower or item.following
                        // Check which one based on viewType
                        const target = viewType === 'followers' ? item.follower : item.following;
                        
                        // Handle if target is somehow null (e.g. deleted account)
                        if (!target) return null;

                        const displayName = target.fullName || target.name || 'Unknown';
                        const initial = displayName.charAt(0).toUpperCase();

                        return (
                            <div key={item._id} className="follow-item">
                                <div className="follow-avatar">
                                    {initial}
                                </div>
                                <div className="follow-info">
                                    <span className="follow-name">{displayName}</span>
                                    {/* Optional: Show type (User/Partner) if available from context, 
                                        but currently target model isn't explicitly sent. 
                                        However, we know followerModel/followingModel from the item. */}
                                    <span className="follow-type">
                                        {viewType === 'followers' ? item.followerModel : item.followingModel}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

FollowListModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    userId: PropTypes.string,
    viewType: PropTypes.oneOf(['followers', 'following']).isRequired,
    userType: PropTypes.oneOf(['user', 'foodpartner']).isRequired,
};

export default FollowListModal;