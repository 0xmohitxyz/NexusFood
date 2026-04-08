const adminModel = require('../models/admin.model');
const userModel = require('../models/user.model');
const foodPartnerModel = require('../models/foodpartner.model');
const categoryModel = require('../models/category.model');
const foodModel = require('../models/food.model');
const storageService = require('../services/storage.service');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuid } = require('uuid');

const isProduction = process.env.NODE_ENV === 'production';
const adminCookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'None' : 'Lax'
};

// ─── Auth ───────────────────────────────────────────────────────────────────

async function adminLogin(req, res) {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    let admin = await adminModel.findOne({ username });

    // Auto-create default admin if not exist
    if (!admin) {
        const hashed = await bcrypt.hash('123456', 10);
        admin = await adminModel.create({ username: 'admin', password: hashed });
    }

    const isValid = await bcrypt.compare(password, admin.password);
    if (!isValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: admin._id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.cookie('adminToken', token, adminCookieOptions);
    res.status(200).json({ message: 'Admin logged in successfully' });
}

function adminLogout(req, res) {
    res.clearCookie('adminToken', adminCookieOptions);
    res.status(200).json({ message: 'Admin logged out successfully' });
}

// ─── Users ───────────────────────────────────────────────────────────────────

async function getUsers(req, res) {
    const users = await userModel.find({}, '-password').sort({ createdAt: -1 });
    res.status(200).json({ users });
}

async function createUser(req, res) {
    const { fullName, email, password } = req.body;
    const exists = await userModel.findOne({ email });
    if (exists) return res.status(400).json({ message: 'User already exists' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await userModel.create({ fullName, email, password: hashedPassword });
    res.status(201).json({ message: 'User created successfully', user: { _id: user._id, fullName: user.fullName, email: user.email } });
}

async function deleteUser(req, res) {
    const { id } = req.params;
    await userModel.findByIdAndDelete(id);
    res.status(200).json({ message: 'User deleted successfully' });
}

// ─── Food Partners ────────────────────────────────────────────────────────────

async function getFoodPartners(req, res) {
    const partners = await foodPartnerModel.find({}, '-password').sort({ createdAt: -1 });
    res.status(200).json({ partners });
}

async function createFoodPartner(req, res) {
    const { name, contactName, phone, address, email, password } = req.body;
    const exists = await foodPartnerModel.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Food partner already exists' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const partner = await foodPartnerModel.create({ name, contactName, phone, address, email, password: hashedPassword });
    res.status(201).json({ message: 'Food partner created', partner: { _id: partner._id, name: partner.name, email: partner.email } });
}

async function deleteFoodPartner(req, res) {
    const { id } = req.params;
    await foodPartnerModel.findByIdAndDelete(id);
    res.status(200).json({ message: 'Food partner deleted successfully' });
}

// ─── Categories ───────────────────────────────────────────────────────────────

async function getCategories(req, res) {
    const categories = await categoryModel.find({}).sort({ createdAt: -1 });
    res.status(200).json({ categories });
}

async function createCategory(req, res) {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: 'Category name is required' });
    const exists = await categoryModel.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (exists) return res.status(400).json({ message: 'Category already exists' });
    const category = await categoryModel.create({ name, description });
    res.status(201).json({ message: 'Category created successfully', category });
}

async function updateCategory(req, res) {
    const { id } = req.params;
    const { name, description } = req.body;
    const category = await categoryModel.findByIdAndUpdate(id, { name, description }, { new: true });
    res.status(200).json({ message: 'Category updated', category });
}

async function deleteCategory(req, res) {
    const { id } = req.params;
    await categoryModel.findByIdAndDelete(id);
    res.status(200).json({ message: 'Category deleted successfully' });
}

module.exports = {
    adminLogin,
    adminLogout,
    getUsers,
    createUser,
    deleteUser,
    getFoodPartners,
    createFoodPartner,
    deleteFoodPartner,
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    adminCreateFood
};

// ─── Food (Admin) ─────────────────────────────────────────────────────────────

async function adminCreateFood(req, res) {
    if (!req.file) {
        return res.status(400).json({ message: 'Video file is required' });
    }
    const { name, description, category, foodPartnerId } = req.body;
    if (!name || !category || !foodPartnerId) {
        return res.status(400).json({ message: 'Name, category, and food partner are required' });
    }

    const partner = await foodPartnerModel.findById(foodPartnerId);
    if (!partner) return res.status(404).json({ message: 'Food partner not found' });

    const fileUploadResult = await storageService.uploadFile(req.file.buffer, uuid());

    const foodItem = await foodModel.create({
        name,
        description,
        category,
        video: fileUploadResult.url,
        foodPartner: partner._id
    });

    res.status(201).json({ message: 'Food created successfully', food: foodItem });
}
