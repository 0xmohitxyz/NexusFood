const foodPartnerModel = require('../models/foodpartner.model');
const foodModel = require('../models/food.model');
const Follow = require('../models/follow.model');

async function getFoodPartnerById(req, res) {

    const foodPartnerId = req.params.id;

    const foodPartner = await foodPartnerModel.findById(foodPartnerId)
    const foodItemsByFoodPartner = await foodModel.find({ foodPartner: foodPartnerId })

    if (!foodPartner) {
        return res.status(404).json({ message: "Food partner not found" });
    }

    const followerCount = await Follow.countDocuments({ following: foodPartnerId, followingModel: 'foodpartner' });
    const followingCount = await Follow.countDocuments({ follower: foodPartnerId, followerModel: 'foodpartner' });

    // Check if the current user (if any) is following this partner
    let isFollowing = false;
    if (req.user) {
        const follow = await Follow.findOne({
            follower: req.user._id,
            followerModel: 'user',
            following: foodPartnerId,
            followingModel: 'foodpartner'
        });
        if (follow) isFollowing = true;
    } else if (req.foodPartner) {
         const follow = await Follow.findOne({
            follower: req.foodPartner._id,
            followerModel: 'foodpartner',
            following: foodPartnerId,
            followingModel: 'foodpartner'
        });
        if (follow) isFollowing = true;
    }

    res.status(200).json({
        message: "Food partner retrieved successfully",
        foodPartner: {
            ...foodPartner.toObject(),
            foodItems: foodItemsByFoodPartner,
            stats: {
                followers: followerCount,
                following: followingCount
            },
            isFollowing
        }

    });
}

module.exports = {
    getFoodPartnerById
};