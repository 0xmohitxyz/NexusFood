import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../../styles/shop.css';

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/order/user`, { withCredentials: true })
            .then(res => {
                setOrders(res.data.orders);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const getStatusBadge = (status) => {
        if (status === 'Complete') return <span className="order-badge success">{status}</span>;
        if (status === 'Processing') return <span className="order-badge info">{status}</span>;
        if (status === 'Cancelled') return <span className="order-badge danger">{status}</span>;
        return <span className="order-badge warning">{status}</span>;
    };

    if (loading) return <div className="orders-page container">Loading your orders...</div>;

    return (
        <div className="orders-page container">
            <button className="back-link" onClick={() => navigate('/profile')}>&larr; Back to Profile</button>
            <h1 className="orders-title">My Orders</h1>

            {orders.length === 0 ? (
                <div className="empty-orders">
                    <p>You haven't placed any orders yet.</p>
                    <button className="btn-pay" onClick={() => navigate('/shop')} style={{ maxWidth: '200px', marginTop: '15px' }}>Browse Shop</button>
                </div>
            ) : (
                <div className="orders-list">
                    {orders.map(order => (
                        <div key={order._id} className="order-card">
                            <div className="order-card-header">
                                <div>
                                    <span className="order-id">Order #{order._id.substring(order._id.length - 8)}</span>
                                    <span className="order-date">{new Date(order.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="order-status-group">
                                    {getStatusBadge(order.status)}
                                </div>
                            </div>
                            
                            <div className="order-card-body">
                                <ul>
                                    {order.items.map((item, idx) => (
                                        <li key={idx}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                {item.shopItem && <img src={item.shopItem.image} alt="product" style={{ width: 40, height: 40, borderRadius: 4, objectFit: 'cover' }}/>}
                                                <div>
                                                    <b>{item.shopItem?.title || "Unknown Product"}</b><br/>
                                                    <span style={{color: '#666', fontSize: '0.85rem'}}>Qty: {item.quantity}  •  ₹{item.priceAtPurchase || item.shopItem?.price} each</span>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            
                            <div className="order-card-footer">
                                <span className="order-delivery">
                                    <b>Delivery To:</b> {order.deliveryAddress}
                                </span>
                                <div className="order-total">
                                    Total Paid: <strong>₹{order.totalAmount}</strong>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyOrders;
