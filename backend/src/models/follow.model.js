const mongoose = require('mongoose');

const followSchema = new mongoose.Schema({
    follower: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'followerModel'
    },
    followerModel: {
        type: String,
        required: true,
        enum: ['user', 'foodpartner']
    },
    following: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'followingModel'
    },
    followingModel: {
        type: String,
        required: true,
        enum: ['user', 'foodpartner']
    }
}, {
    timestamps: true
});

followSchema.index({ follower: 1, following: 1, followerModel: 1, followingModel: 1 }, { unique: true });

module.exports = mongoose.model('Follow', followSchema);