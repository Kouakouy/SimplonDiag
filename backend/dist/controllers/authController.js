"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUser = exports.createUser = exports.getAllUsers = exports.getCurrentUser = exports.login = exports.register = void 0;
const zod_1 = require("zod");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../config/db");
const mongodb_1 = require("mongodb");
const authSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).optional(),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
    role: zod_1.z.enum(['admin', 'observer', 'creator']).optional(),
});
const register = async (req, res) => {
    const parsed = authSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ message: 'Invalid payload' });
    const { name, email, password, role } = parsed.data;
    try {
        const db = await (0, db_1.getDb)();
        const users = db.collection('users');
        const existing = await users.findOne({ email });
        if (existing)
            return res.status(409).json({ message: 'Email already used' });
        const passwordHash = await bcryptjs_1.default.hash(password, 10);
        const insert = await users.insertOne({
            name: name ?? 'User',
            email,
            password_hash: passwordHash,
            role: role ?? 'creator',
            is_active: true,
            created_at: new Date(),
            updated_at: new Date(),
        });
        const userId = insert.insertedId.toString();
        const token = jsonwebtoken_1.default.sign({ id: userId, email, role: role ?? 'creator' }, process.env.JWT_SECRET, { expiresIn: '7d' });
        return res.status(201).json({ token });
    }
    catch (e) {
        return res.status(500).json({ message: 'Server error' });
    }
};
exports.register = register;
const login = async (req, res) => {
    const parsed = authSchema.pick({ email: true, password: true }).safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ message: 'Invalid payload' });
    const { email, password } = parsed.data;
    try {
        const db = await (0, db_1.getDb)();
        const users = db.collection('users');
        const user = await users.findOne({ email });
        if (!user)
            return res.status(401).json({ message: 'Invalid credentials' });
        const valid = await bcryptjs_1.default.compare(password, user.password_hash);
        if (!valid)
            return res.status(401).json({ message: 'Invalid credentials' });
        const token = jsonwebtoken_1.default.sign({
            id: user._id.toString(),
            email,
            role: user.role || 'creator'
        }, process.env.JWT_SECRET, { expiresIn: '7d' });
        return res.json({ token });
    }
    catch (e) {
        return res.status(500).json({ message: 'Server error' });
    }
};
exports.login = login;
const getCurrentUser = async (req, res) => {
    try {
        const db = await (0, db_1.getDb)();
        const users = db.collection('users');
        const user = await users.findOne({ _id: new mongodb_1.ObjectId(req.user?.id) });
        if (!user)
            return res.status(404).json({ message: 'User not found' });
        return res.json({
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role || 'creator',
            isActive: user.is_active,
            createdAt: user.created_at,
            updatedAt: user.updated_at,
        });
    }
    catch (e) {
        return res.status(500).json({ message: 'Server error' });
    }
};
exports.getCurrentUser = getCurrentUser;
const getAllUsers = async (req, res) => {
    try {
        const db = await (0, db_1.getDb)();
        const users = db.collection('users');
        const allUsers = await users.find({}).toArray();
        const usersList = allUsers.map(user => ({
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role || 'creator',
            isActive: user.is_active,
            createdAt: user.created_at,
            updatedAt: user.updated_at,
        }));
        return res.json(usersList);
    }
    catch (e) {
        return res.status(500).json({ message: 'Server error' });
    }
};
exports.getAllUsers = getAllUsers;
const createUser = async (req, res) => {
    const parsed = authSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ message: 'Invalid payload' });
    const { name, email, password, role } = parsed.data;
    try {
        const db = await (0, db_1.getDb)();
        const users = db.collection('users');
        const existing = await users.findOne({ email });
        if (existing)
            return res.status(409).json({ message: 'Email already used' });
        const passwordHash = await bcryptjs_1.default.hash(password, 10);
        const insert = await users.insertOne({
            name: name ?? 'User',
            email,
            password_hash: passwordHash,
            role: role ?? 'creator',
            is_active: true,
            created_at: new Date(),
            updated_at: new Date(),
        });
        return res.status(201).json({
            id: insert.insertedId.toString(),
            message: 'User created successfully'
        });
    }
    catch (e) {
        return res.status(500).json({ message: 'Server error' });
    }
};
exports.createUser = createUser;
const updateUser = async (req, res) => {
    const { id } = req.params;
    const updateSchema = zod_1.z.object({
        name: zod_1.z.string().min(1).optional(),
        email: zod_1.z.string().email().optional(),
        role: zod_1.z.enum(['admin', 'observer', 'creator']).optional(),
        isActive: zod_1.z.boolean().optional(),
    });
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ message: 'Invalid payload' });
    try {
        const db = await (0, db_1.getDb)();
        const users = db.collection('users');
        // Vérifier que l'utilisateur existe
        const user = await users.findOne({ _id: new mongodb_1.ObjectId(id) });
        if (!user)
            return res.status(404).json({ message: 'User not found' });
        // Vérifier que l'email n'est pas déjà utilisé par un autre utilisateur
        if (parsed.data.email && parsed.data.email !== user.email) {
            const existing = await users.findOne({ email: parsed.data.email });
            if (existing)
                return res.status(409).json({ message: 'Email already used' });
        }
        const updateData = {
            ...parsed.data,
            updated_at: new Date(),
        };
        await users.updateOne({ _id: new mongodb_1.ObjectId(id) }, { $set: updateData });
        return res.json({ message: 'User updated successfully' });
    }
    catch (e) {
        return res.status(500).json({ message: 'Server error' });
    }
};
exports.updateUser = updateUser;
const deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        const db = await (0, db_1.getDb)();
        const users = db.collection('users');
        // Empêcher l'auto-suppression
        if (req.user?.id === id) {
            return res.status(400).json({ message: 'Cannot delete your own account' });
        }
        const result = await users.deleteOne({ _id: new mongodb_1.ObjectId(id) });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.json({ message: 'User deleted successfully' });
    }
    catch (e) {
        return res.status(500).json({ message: 'Server error' });
    }
};
exports.deleteUser = deleteUser;
