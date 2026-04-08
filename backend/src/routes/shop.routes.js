const express = require('express');
const router = express.Router();
const multer = require('multer');
const shopController = require('../controllers/shop.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const adminAuth = require('../middlewares/admin.middleware');

const upload = multer({
    storage: multer.memoryStorage(),
});

// User and Admin facing (Public)
router.get('/items', shopController.getItems);

// Admin facing
router.post('/admin/items', adminAuth, upload.single('image'), shopController.createItem);
router.delete('/admin/items/:id', adminAuth, shopController.deleteItem);

module.exports = router;
