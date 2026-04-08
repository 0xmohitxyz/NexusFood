const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    shopItem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ShopItem',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    priceAtPurchase: {
        type: Number,
        required: true
    }
}, { _id: false });

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    items: [orderItemSchema],
    totalAmount: {
        type: Number,
        required: true
    },
    deliveryAddress: {
        type: String,
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Success', 'Failed'],
        default: 'Pending'
    },
    razorpayOrderId: {
        type: String,
        // Optional until initialized by razorpay
    },
    razorpayPaymentId: {
        type: String
    },
    status: {
        type: String,
        enum: ['Pending', 'Processing', 'Complete', 'Cancelled'],
        default: 'Pending'
    }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
