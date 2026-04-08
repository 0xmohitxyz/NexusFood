const express = require('express');
const multer = require('multer');
const adminController = require('../controllers/admin.controller');
const adminAuth = require('../middlewares/admin.middleware');
const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Auth
router.post('/login', adminController.adminLogin);
router.get('/logout', adminAuth, adminController.adminLogout);

// Users
router.get('/users', adminAuth, adminController.getUsers);
router.post('/users', adminAuth, adminController.createUser);
router.delete('/users/:id', adminAuth, adminController.deleteUser);

// Food Partners
router.get('/food-partners', adminAuth, adminController.getFoodPartners);
router.post('/food-partners', adminAuth, adminController.createFoodPartner);
router.delete('/food-partners/:id', adminAuth, adminController.deleteFoodPartner);

// Categories
router.get('/categories', adminController.getCategories); // Public - for create food page
router.post('/categories', adminAuth, adminController.createCategory);
router.put('/categories/:id', adminAuth, adminController.updateCategory);
router.delete('/categories/:id', adminAuth, adminController.deleteCategory);

// Food (Admin creates on behalf of food partner)
router.post('/foods', adminAuth, upload.single('mama'), adminController.adminCreateFood);

module.exports = router;
