const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const adminAuth = require('../middlewares/admin.middleware');

// User operations
router.post('/create', authMiddleware.authUserMiddleware, orderController.createOrder);
router.post('/verify', authMiddleware.authUserMiddleware, orderController.verifyPayment);
router.get('/user', authMiddleware.authUserMiddleware, orderController.getUserOrders);

// Admin operations
router.get('/admin', adminAuth, orderController.getAllOrders);
router.put('/admin/:orderId', adminAuth, orderController.updateOrderStatus);

module.exports = router;
