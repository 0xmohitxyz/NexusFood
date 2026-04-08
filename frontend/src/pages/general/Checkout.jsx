import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../styles/shop.css';

const Checkout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const item = location.state?.item;

    const [address, setAddress] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!item) {
            navigate('/shop');
        }
        
        // Dynamically load Razorpay SDK
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        }
    }, [item, navigate]);

    if (!item) return null;

    const totalAmount = item.price * quantity;

    const handlePayment = async () => {
        if (!address.trim()) {
            setError('Delivery address is required');
            return;
        }
        
        setError('');
        setIsProcessing(true);

        try {
            // 1. Create order on backend
            const orderRes = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/order/create`, {
                items: [{ shopItemId: item._id, quantity }],
                deliveryAddress: address
            }, { withCredentials: true });

            const { order, razorpayOrderId, isDummy } = orderRes.data;

            // 2. Handle Dummy Mock (if keys aren't set)
            if (isDummy) {
                alert("This is a Test Mode purchase since Razorpay keys are not configured. We will simulate a successful payment.");
                await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/order/verify`, {
                    orderId: order._id,
                    isDummy: true
                }, { withCredentials: true });
                
                navigate('/orders');
                return;
            }

            // 3. Init Razorpay Checkout
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'dummy', // Replace via .env if strictly needed in frontend, though script can load it
                amount: totalAmount * 100,
                currency: "INR",
                name: "Nexus Food Shop",
                description: "Purchase of " + item.title,
                order_id: razorpayOrderId,
                handler: async function (response) {
                    try {
                        await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/order/verify`, {
                            orderId: order._id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        }, { withCredentials: true });

                        navigate('/orders');
                    } catch (err) {
                        alert("Payment verification failed computing signature.");
                    }
                },
                theme: { color: "#f97316" }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function () {
                alert("Payment was unsuccessful.");
                setIsProcessing(false);
            });
            rzp.open();

        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to initiate order.');
            setIsProcessing(false);
        }
    };

    return (
        <div className="checkout-page container">
            <button className="back-link" onClick={() => navigate('/shop')}>&larr; Back to Shop</button>
            <h1 className="checkout-title">Review & Pay</h1>

            <div className="checkout-layout">
                {/* Left Side: Product Summary */}
                <div className="checkout-summary">
                    <h2>Order Summary</h2>
                    <div className="bill-card">
                        <img src={item.image} alt={item.title} className="bill-img"/>
                        <div className="bill-details">
                            <h3>{item.title}</h3>
                            <p className="bill-desc">SKU: {item.productId}</p>
                            
                            <div className="qty-control">
                                <label>Quantity:</label>
                                <input 
                                    type="number" 
                                    min="1" 
                                    max={item.stock} 
                                    value={quantity} 
                                    onChange={(e) => setQuantity(Number(e.target.value))}
                                />
                            </div>
                        </div>
                        <div className="bill-price">
                            <span>₹{item.price} x {quantity}</span>
                            <strong>₹{totalAmount}</strong>
                        </div>
                    </div>
                    
                    <div className="bill-total">
                        <span>Total Amount to Pay:</span>
                        <h3>₹{totalAmount}</h3>
                    </div>
                </div>

                {/* Right Side: Address & Payment */}
                <div className="checkout-form">
                    <h2>Delivery Details</h2>
                    {error && <div className="checkout-error">{error}</div>}
                    
                    <div className="form-group">
                        <label>Complete Delivery Address</label>
                        <textarea 
                            rows="4" 
                            placeholder="House No, Building, Street, City, Pincode"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                        />
                    </div>

                    <button 
                        className="btn-pay" 
                        onClick={handlePayment}
                        disabled={isProcessing}
                    >
                        {isProcessing ? 'Initializing Secure Payment...' : `Pay ₹${totalAmount} securely`}
                    </button>
                    <p className="secure-badge">🔒 Encrypted by Razorpay</p>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
