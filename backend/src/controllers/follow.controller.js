const Follow = require('../models/follow.model');
const User = require('../models/user.model');
const FoodPartner = require('../models/foodpartner.model');

// Helper to determine the "actor" (follower) from the request
const getActor = (req) => {
    if (req.user) return { id: req.user._id, model: 'user' };
    if (req.foodPartner) return { id: req.foodPartner._id, model: 'foodpartner' };
    return null;
};

exports.followEntity = async (req, res) => {
    try {
        const actor = getActor(req);
        if (!actor) return res.status(401).json({ message: "Unauthorized" });

        const { id } = req.params; // ID of the entity to follow
        const { type } = req.body; // 'user' or 'foodpartner'

        if (!['user', 'foodpartner'].includes(type)) {
            return res.status(400).json({ message: "Invalid type to follow" });
        }

        if (actor.id.toString() === id) {
            return res.status(400).json({ message: "You cannot follow yourself" });
        }

        // Check if target exists
        const Model = type === 'user' ? User : FoodPartner;
        const targetExists = await Model.findById(id);
        if (!targetExists) {
            return res.status(404).json({ message: "Entity not found" });
        }

        const existingFollow = await Follow.findOne({
            follower: actor.id,
            followerModel: actor.model,
            following: id,
            followingModel: type
        });

        if (existingFollow) {
            return res.status(400).json({ message: "Already following" });
        }

        await Follow.create({
            follower: actor.id,
            followerModel: actor.model,
            following: id,
            followingModel: type
        });

        res.status(200).json({ message: "Followed successfully" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

exports.unfollowEntity = async (req, res) => {
    try {
        const actor = getActor(req);
        if (!actor) return res.status(401).json({ message: "Unauthorized" });

        const { id } = req.params;
        const { type } = req.body;

        const result = await Follow.findOneAndDelete({
            follower: actor.id,
            followerModel: actor.model,
            following: id,
            followingModel: type // We need to be specific about who we are unfollowing
        });

        if (!result) {
            return res.status(400).json({ message: "Not following" });
        }

        res.status(200).json({ message: "Unfollowed successfully" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

exports.getFollowers = async (req, res) => {
    try {
        const { id } = req.params;
        const { type } = req.query; // type of the entity whose followers we want to see

        if (!['user', 'foodpartner'].includes(type)) {
            return res.status(400).json({ message: "Invalid type" });
        }

        const followers = await Follow.find({
            following: id,
            followingModel: type
        }).populate('follower', 'fullName name email profileImage'); // select fields to return

        res.status(200).json(followers);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

exports.getFollowing = async (req, res) => {
    try {
        const { id } = req.params;
        const { type } = req.query; // type of the entity whose following list we want to see

        if (!['user', 'foodpartner'].includes(type)) {
            return res.status(400).json({ message: "Invalid type" });
        }

        const following = await Follow.find({
            follower: id,
            followerModel: type
        }).populate('following', 'fullName name email profileImage');

        res.status(200).json(following);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};
