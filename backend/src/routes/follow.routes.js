const express = require('express');
const router = express.Router();
const followController = require('../controllers/follow.controller');
const jwt = require('jsonwebtoken');
const userModel = require('../models/user.model');
const foodPartnerModel = require('../models/foodpartner.model');

const checkAnyAuth = async (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Not authenticated" });
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Try to find user
        const user = await userModel.findById(decoded.id);
        if (user) {
            req.user = user;
            return next();
        }

        // Try to find partner
        const partner = await foodPartnerModel.findById(decoded.id);
        if (partner) {
            req.foodPartner = partner;
            return next();
        }

        return res.status(401).json({ message: "Invalid token" });

    } catch (err) {
        return res.status(401).json({ message: "Invalid token" });
    }
};

router.post('/follow/:id', checkAnyAuth, followController.followEntity);
router.post('/unfollow/:id', checkAnyAuth, followController.unfollowEntity);

// These don't necessarily need auth if public profiles exist, but let's keep it open or authenticated?
// Usually follower lists are public.
router.get('/followers/:id', followController.getFollowers); 
router.get('/following/:id', followController.getFollowing);

module.exports = router;
