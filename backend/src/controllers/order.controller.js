const Order = require('../models/order.model');
const ShopItem = require('../models/shopItem.model');
const Razorpay = require('razorpay');
const crypto = require('crypto');

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || "dummy_key";
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "dummy_secret";

const instance = new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET
});

// ─── User Customer Facing ───────────────────────────────────────────────────

async function createOrder(req, res) {
    try {
        const { items, deliveryAddress } = req.body;
        const user = req.user;

        if (!items || items.length === 0 || !deliveryAddress) {
            return res.status(400).json({ message: "Items and delivery address required." });
        }

        let totalAmount = 0;
        const orderItems = [];

        // Verify items and calculate total amount
        for (const item of items) {
            const shopItem = await ShopItem.findById(item.shopItemId);
            if (!shopItem) return res.status(404).json({ message: `Item ${item.shopItemId} not found` });
            
            if (shopItem.stock < item.quantity) {
                 return res.status(400).json({ message: `Insufficient stock for ${shopItem.title}` });
            }

            totalAmount += shopItem.price * item.quantity;
            orderItems.push({
                shopItem: shopItem._id,
                quantity: item.quantity,
                priceAtPurchase: shopItem.price
            });
        }

        // Create Database Order
        const newOrder = await Order.create({
            user: user._id,
            items: orderItems,
            totalAmount,
            deliveryAddress
        });

        // Mock Razorpay if keys are dummy
        if (RAZORPAY_KEY_ID === "dummy_key") {
            newOrder.razorpayOrderId = "order_dummy_" + newOrder._id;
            await newOrder.save();
            return res.status(201).json({
                message: "Order placed. Displaying dummy payment gateway.",
                order: newOrder,
                razorpayOrderId: newOrder.razorpayOrderId,
                amount: totalAmount,
                isDummy: true
            });
        }

        // Create Actual Razorpay Order
        const options = {
            amount: totalAmount * 100, // Amount in paise
            currency: "INR",
            receipt: "order_rcptid_" + newOrder._id.toString().substring(12,24)
        };

        const razorpayOrder = await instance.orders.create(options);

        newOrder.razorpayOrderId = razorpayOrder.id;
        await newOrder.save();

        res.status(201).json({
            message: "Order initiated",
            order: newOrder,
            razorpayOrderId: razorpayOrder.id,
            amount: totalAmount,
            isDummy: false
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

async function verifyPayment(req, res) {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId, isDummy } = req.body;

        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ message: "Order not found" });

        if (isDummy) {
            order.paymentStatus = 'Success';
            order.razorpayPaymentId = 'pay_dummy_success';
            await order.save();
            
            // Deduct Stock
            for (const item of order.items) {
                await ShopItem.findByIdAndUpdate(item.shopItem, { $inc: { stock: -item.quantity } });
            }
            
            return res.status(200).json({ message: "Mock Payment verified successfully" });
        }

        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto.createHmac("sha256", RAZORPAY_KEY_SECRET)
                                   .update(sign.toString())
                                   .digest("hex");

        if (razorpay_signature === expectedSign) {
            order.paymentStatus = 'Success';
            order.razorpayPaymentId = razorpay_payment_id;
            await order.save();

            // Deduct Stock
            for (const item of order.items) {
                await ShopItem.findByIdAndUpdate(item.shopItem, { $inc: { stock: -item.quantity } });
            }

            res.status(200).json({ message: "Payment verified successfully" });
        } else {
            order.paymentStatus = 'Failed';
            await order.save();
            res.status(400).json({ message: "Invalid signature" });
        }

    } catch (error) {
        console.error("Payment verify issue:", error);
        res.status(500).json({ message: "Failed to verify payment" });
    }
}

async function getUserOrders(req, res) {
    try {
        const orders = await Order.find({ user: req.user._id })
            .populate('items.shopItem', 'title image price productId')
            .sort({ createdAt: -1 });

        res.status(200).json({ orders });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
}

// ─── Admin Facing ───────────────────────────────────────────────────────────

async function getAllOrders(req, res) {
    try {
        const orders = await Order.find({})
            .populate('user', 'fullName email phone')
            .populate('items.shopItem', 'title price productId')
            .sort({ createdAt: -1 });

        res.status(200).json({ orders });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
}

async function updateOrderStatus(req, res) {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        const order = await Order.findByIdAndUpdate(orderId, { status }, { new: true });
        
        if (!order) return res.status(404).json({ message: "Order not found" });

        res.status(200).json({ message: "Order status updated", order });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
}


module.exports = {
    createOrder,
    verifyPayment,
    getUserOrders,
    getAllOrders,
    updateOrderStatus
};
