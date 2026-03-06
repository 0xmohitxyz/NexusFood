const express = require('express')
const authController = require('../controllers/auth.controller')
const authMiddleware = require('../middlewares/auth.middleware')
const router = express.Router()

//User auth APIs
router.post('/user/register',authController.registerUser)

router.post('/user/login',authController.loginUser) 

router.get('/user/logout', authController.logoutUser)

router.get('/user/profile', authMiddleware.authUserMiddleware, authController.getUserProfile)


// FoodPartner auth APIs

router.post('/food-partner/register',authController.registerFoodPartner)

router.post('/food-partner/login',authController.loginFoodPartner) 

router.get('/food-partner/logout', authController.logoutFoodPartner)


module.exports = router;