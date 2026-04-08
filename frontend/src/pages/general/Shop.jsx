import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../../styles/shop.css';

const Shop = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/shop/items`, { withCredentials: true })
            .then(res => {
                setItems(res.data.items);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const handleBuy = (item) => {
        navigate('/shop/checkout', { state: { item } });
    };

    if (loading) return <div className="shop-page container">Loading Shop...</div>;

    return (
        <div className="shop-page container">
            <header className="shop-header">
                <h1 className="shop-title">Nexus Shop</h1>
                <p className="shop-subtitle">Discover premium food ingredients, snacks, and exclusive merchandise directly from NexusFood.</p>
            </header>

            <div className="shop-grid">
                {items.length === 0 ? (
                    <div className="empty-shop">The shop is currently empty. Check back later!</div>
                ) : (
                    items.map(item => (
                        <div key={item._id} className="shop-card">
                            <div className="shop-card-image">
                                <img src={item.image} alt={item.title} />
                                {item.stock < 10 && item.stock > 0 && <span className="stock-badge low">Only {item.stock} left!</span>}
                                {item.stock <= 0 && <span className="stock-badge out">Out of stock</span>}
                            </div>
                            <div className="shop-card-content">
                                <h3 className="shop-card-title">{item.title}</h3>
                                <p className="shop-card-desc">{item.description}</p>
                                <div className="shop-card-footer">
                                    <span className="shop-card-price">₹{item.price}</span>
                                    <button 
                                        className="shop-buy-btn" 
                                        onClick={() => handleBuy(item)}
                                        disabled={item.stock <= 0}
                                    >
                                        {item.stock > 0 ? 'Buy Now' : 'Sold Out'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Shop;
