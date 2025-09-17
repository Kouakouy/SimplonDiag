"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const zod_1 = require("zod");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../config/db");
const authSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).optional(),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
});
const register = async (req, res) => {
    const parsed = authSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ message: 'Invalid payload' });
    const { name, email, password } = parsed.data;
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
            created_at: new Date(),
            updated_at: new Date(),
        });
        const userId = insert.insertedId.toString();
        const token = jsonwebtoken_1.default.sign({ id: userId, email }, process.env.JWT_SECRET, { expiresIn: '7d' });
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
        const token = jsonwebtoken_1.default.sign({ id: user._id.toString(), email }, process.env.JWT_SECRET, { expiresIn: '7d' });
        return res.json({ token });
    }
    catch (e) {
        return res.status(500).json({ message: 'Server error' });
    }
};
exports.login = login;
