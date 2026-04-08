const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description: {
        type: String,
        default: ''
    }
}, { timestamps: true });

const categoryModel = mongoose.model('category', categorySchema);

module.exports = categoryModel;
