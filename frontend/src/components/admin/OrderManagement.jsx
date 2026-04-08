import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../styles/admin.css';

const OrderManagement = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = () => {
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/order/admin`, { withCredentials: true })
            .then(res => {
                setOrders(res.data.orders);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const markComplete = async (orderId) => {
        if (!window.confirm("Mark order as Complete?")) return;
        try {
             await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/order/admin/${orderId}`, 
                 { status: 'Complete' }, 
                 { withCredentials: true }
             );
             fetchOrders();
        } catch (err) {
             alert("Error updating order status");
        }
    };

    const getStatusStyle = (status) => {
        switch(status) {
            case 'Complete': return { color: '#16a34a', background: 'rgba(22, 163, 74, 0.1)', padding: '2px 8px', borderRadius: '12px' };
            case 'Pending': return { color: '#ca8a04', background: 'rgba(202, 138, 4, 0.1)', padding: '2px 8px', borderRadius: '12px' };
            default: return { color: '#64748b', background: 'rgba(100, 116, 139, 0.1)', padding: '2px 8px', borderRadius: '12px' };
        }
    }

    return (
        <div className="admin-section">
            <div className="admin-section-header">
                <h2>Manage Shop Orders</h2>
            </div>
            
            <div className="admin-table-wrapper">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Order ID & Date</th>
                            <th>Customer & Address</th>
                            <th>Items & Total</th>
                            <th>Payment</th>
                            <th>Status & Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5" className="admin-empty">Loading orders...</td></tr>
                        ) : orders.length === 0 ? (
                            <tr><td colSpan="5" className="admin-empty">No orders received yet.</td></tr>
                        ) : (orders.map(o => (
                            <tr key={o._id}>
                                <td>
                                    <span style={{ fontSize: '0.8rem', color: '#888' }}>{o._id}</span><br/>
                                    {new Date(o.createdAt).toLocaleDateString()}
                                </td>
                                <td>
                                    <b>{o.user?.fullName}</b> ({o.user?.phone || o.user?.email})<br/>
                                    <span style={{ fontSize: '0.85rem' }}>{o.deliveryAddress}</span>
                                </td>
                                <td>
                                    <ul style={{ margin: 0, paddingLeft: '15px', fontSize: '0.85rem' }}>
                                        {o.items.map(i => (
                                            <li key={i.shopItem?._id || Math.random()}>
                                                {i.shopItem?.title} (x{i.quantity})
                                            </li>
                                        ))}
                                    </ul>
                                    <b>Total: ₹{o.totalAmount}</b>
                                </td>
                                <td>
                                    {o.paymentStatus === 'Success' ? '✅ Paid' : '⏳ Pending'}<br/>
                                    <span style={{ fontSize: '0.75rem', color: '#888' }}>{o.razorpayPaymentId}</span>
                                </td>
                                <td>
                                    <span style={getStatusStyle(o.status)}>{o.status}</span>
                                    {o.status !== 'Complete' && (
                                        <button 
                                            className="admin-btn-ghost sm" 
                                            style={{ display: 'block', marginTop: '8px' }}
                                            onClick={() => markComplete(o._id)}
                                        >
                                            Mark Complete
                                        </button>
                                    )}
                                </td>
                            </tr>
                        )))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default OrderManagement;
