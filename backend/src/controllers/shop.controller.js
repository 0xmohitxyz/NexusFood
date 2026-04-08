const ShopItem = require('../models/shopItem.model');
const storageService = require('../services/storage.service');
const { v4: uuid } = require('uuid');

// ─── Admin Specific ─────────────────────────────────────────────────────────

async function createItem(req, res) {
    try {
        const { title, description, price, stock, productId } = req.body;
        
        if (!title || !price || !productId || !req.file) {
            return res.status(400).json({ message: "Title, price, productId, and image required." });
        }

        const fileUploadResult = await storageService.uploadFile(req.file.buffer, uuid());

        const item = await ShopItem.create({
            title,
            description,
            price: Number(price),
            stock: Number(stock) || 0,
            productId,
            image: fileUploadResult.url
        });

        res.status(201).json({ message: "Shop item created", item });
    } catch (error) {
        console.error(error);
        if (error.code === 11000) {
            return res.status(400).json({ message: "Product ID must be unique." });
        }
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

async function deleteItem(req, res) {
    try {
        await ShopItem.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Item deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

// ─── Public/User ────────────────────────────────────────────────────────────

async function getItems(req, res) {
    try {
        const items = await ShopItem.find({});
        res.status(200).json({ items });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

module.exports = {
    createItem,
    deleteItem,
    getItems
};
