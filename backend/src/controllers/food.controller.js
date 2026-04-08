
const foodModel = require('../models/food.model');
const storageService = require('../services/storage.service');
const likeModel = require("../models/likes.model")
const saveModel = require("../models/save.model")
const commentModel = require("../models/comment.model")
const { v4: uuid } = require("uuid")


async function createFood(req, res) {
    const fileUploadResult = await storageService.uploadFile(req.file.buffer, uuid())

    const foodItem = await foodModel.create({
        name: req.body.name,
        description: req.body.description,
        category: req.body.category,
        video: fileUploadResult.url,
        foodPartner: req.foodPartner._id
    })

    res.status(201).json({
        message: "food created successfully",
        food: foodItem
    })

}

async function getFoodItems(req, res) {
    const foodItems = await foodModel.find({})
    res.status(200).json({
        message: "Food items fetched successfully",
        foodItems
    })
}


async function likeFood(req, res) {
    const { foodId } = req.body;
    const user = req.user;

    const isAlreadyLiked = await likeModel.findOne({
        user: user._id,
        food: foodId
    })

    if (isAlreadyLiked) {
        await likeModel.deleteOne({
            user: user._id,
            food: foodId
        })

        await foodModel.findByIdAndUpdate(foodId, {
            $inc: { likeCount: -1 }
        })

        return res.status(200).json({
            message: "Food unliked successfully"
        })
    }

    const like = await likeModel.create({
        user: user._id,
        food: foodId
    })

    await foodModel.findByIdAndUpdate(foodId, {
        $inc: { likeCount: 1 }
    })

    res.status(201).json({
        message: "Food liked successfully",
        like
    })

}

async function saveFood(req, res) {

    const { foodId } = req.body;
    const user = req.user;

    const isAlreadySaved = await saveModel.findOne({
        user: user._id,
        food: foodId
    })

    if (isAlreadySaved) {
        await saveModel.deleteOne({
            user: user._id,
            food: foodId
        })

        await foodModel.findByIdAndUpdate(foodId, {
            $inc: { savesCount: -1 }
        })

        return res.status(200).json({
            message: "Food unsaved successfully"
        })
    }

    const save = await saveModel.create({
        user: user._id,
        food: foodId
    })

    await foodModel.findByIdAndUpdate(foodId, {
        $inc: { savesCount: 1 }
    })

    res.status(201).json({
        message: "Food saved successfully",
        save
    })

}

async function getSaveFood(req, res) {

    const user = req.user;

    const savedFoods = await saveModel.find({ user: user._id }).populate('food');

    if (!savedFoods || savedFoods.length === 0) {
        return res.status(404).json({ message: "No saved foods found" });
    }

    res.status(200).json({
        message: "Saved foods retrieved successfully",
        savedFoods
    });

}

async function commentFood(req, res) {
    const { foodId, text } = req.body;
    const user = req.user;

    if (!text || !text.trim()) {
        return res.status(400).json({ message: "Comment text is required" });
    }

    const comment = await commentModel.create({
        user: user._id,
        food: foodId,
        text: text
    });

    await foodModel.findByIdAndUpdate(foodId, {
        $inc: { commentCount: 1 }
    });
    
    // Populate user to return displaying info
    await comment.populate('user', 'fullName email');

    res.status(201).json({
        message: "Comment added successfully",
        comment
    });
}

async function getComments(req, res) {
    const { foodId } = req.params;

    const comments = await commentModel.find({ food: foodId })
        .populate('user', 'fullName email')
        .sort({ createdAt: -1 }); // Newest first

    res.status(200).json({
        message: "Comments retrieved successfully",
        comments
    });
}


async function getLikedFood(req, res) {
    const user = req.user;
    
    const likedFoods = await likeModel.find({ user: user._id }).populate('food').sort({ createdAt: -1 });

    if (!likedFoods || likedFoods.length === 0) {
        return res.status(404).json({ message: "No liked foods found" });
    }

    res.status(200).json({
        message: "Liked foods retrieved successfully",
        likedFoods
    });
}

module.exports = {
    createFood,
    getFoodItems,
    likeFood,
    saveFood,
    getSaveFood,
    commentFood,
    getComments,
    getLikedFood
}
