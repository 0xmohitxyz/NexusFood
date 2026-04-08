const mongoose = require('mongoose');

const shopItemSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    stock: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    },
    productId: {
        type: String,
        required: true,
        unique: true
    },
    image: {
        type: String, // URL from ImageKit
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('ShopItem', shopItemSchema);
