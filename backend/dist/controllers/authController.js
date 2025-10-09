"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUser = exports.completeProfile = exports.createUser = exports.getAllUsers = exports.getCurrentUser = exports.login = exports.register = void 0;
const zod_1 = require("zod");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../config/db");
const mongodb_1 = require("mongodb");
const email_1 = require("../config/email");
const crypto_1 = __importDefault(require("crypto"));
const authSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).optional(),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6).optional(),
    role: zod_1.z.enum(['admin', 'observer', 'creator']).optional(),
});
const inviteUserSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    role: zod_1.z.enum(['admin', 'observer', 'creator']),
});
const register = async (req, res) => {
    const parsed = authSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ message: 'Invalid payload' });
    const { name, email, password, role } = parsed.data;
    // Vérifier que le mot de passe est fourni pour l'inscription
    if (!password) {
        return res.status(400).json({ message: 'Password is required for registration' });
    }
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
        if (!user.password_hash)
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
    // Accepter soit le schéma d'invitation soit le schéma complet
    const inviteData = inviteUserSchema.safeParse(req.body);
    const fullData = authSchema.safeParse(req.body);
    if (!inviteData.success && !fullData.success) {
        return res.status(400).json({ message: 'Invalid payload' });
    }
    const parsedData = inviteData.success ? inviteData.data : fullData.data;
    if (!parsedData) {
        return res.status(400).json({ message: 'Invalid payload' });
    }
    const { email, role } = parsedData;
    const name = 'name' in parsedData ? parsedData.name : undefined;
    const password = 'password' in parsedData ? parsedData.password : undefined;
    try {
        const db = await (0, db_1.getDb)();
        const users = db.collection('users');
        const existing = await users.findOne({ email });
        if (existing)
            return res.status(409).json({ message: 'Email already used' });
        // Déterminer le mode de création
        const isDirectCreation = name && password;
        if (isDirectCreation) {
            // Mode création directe
            const passwordHash = await bcryptjs_1.default.hash(password, 10);
            const insert = await users.insertOne({
                name: name,
                email,
                password_hash: passwordHash,
                role,
                is_active: true,
                created_at: new Date(),
                updated_at: new Date(),
            });
            return res.status(201).json({
                id: insert.insertedId.toString(),
                message: 'User created successfully'
            });
        }
        else {
            // Mode invitation
            const invitationToken = crypto_1.default.randomBytes(32).toString('hex');
            const invitationExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 jours
            const insert = await users.insertOne({
                name: '', // Sera complété par l'utilisateur
                email,
                password_hash: '', // Sera défini par l'utilisateur
                role,
                is_active: false, // Inactif jusqu'à complétion du profil
                invitation_token: invitationToken,
                invitation_expires: invitationExpires,
                created_at: new Date(),
                updated_at: new Date(),
            });
            // Envoyer l'email d'invitation
            try {
                console.log('📧 Préparation de l\'envoi d\'email d\'invitation...');
                console.log('   Email destinataire:', email);
                console.log('   Rôle:', role);
                console.log('   Token:', invitationToken.substring(0, 10) + '...');
                const { EmailTemplates } = await Promise.resolve().then(() => __importStar(require('../services/emailTemplates')));
                const appUrl = process.env.APP_URL || 'http://localhost:3000';
                console.log('   URL de l\'app:', appUrl);
                const emailTemplate = EmailTemplates.userInvitation(email, role, invitationToken, appUrl);
                console.log('   Template généré:', emailTemplate.subject);
                await (0, email_1.sendEmail)(email, emailTemplate.subject, emailTemplate.html);
                console.log('✅ Email d\'invitation envoyé avec succès');
            }
            catch (emailError) {
                console.error('❌ Erreur envoi email:', emailError);
                // Ne pas faire échouer la création si l'email échoue
            }
            return res.status(201).json({
                id: insert.insertedId.toString(),
                message: 'User invitation sent successfully'
            });
        }
    }
    catch (e) {
        return res.status(500).json({ message: 'Server error' });
    }
};
exports.createUser = createUser;
const completeProfile = async (req, res) => {
    const completeProfileSchema = zod_1.z.object({
        token: zod_1.z.string(),
        name: zod_1.z.string().min(1),
        password: zod_1.z.string().min(6),
    });
    const parsed = completeProfileSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ message: 'Invalid payload' });
    const { token, name, password } = parsed.data;
    try {
        const db = await (0, db_1.getDb)();
        const users = db.collection('users');
        // Trouver l'utilisateur avec le token d'invitation
        const user = await users.findOne({
            invitation_token: token,
            invitation_expires: { $gt: new Date() }
        });
        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired invitation token' });
        }
        // Vérifier si le profil n'est pas déjà complété
        if (user.is_active && user.password_hash) {
            return res.status(400).json({ message: 'Profile already completed' });
        }
        // Hasher le mot de passe
        const passwordHash = await bcryptjs_1.default.hash(password, 10);
        // Mettre à jour l'utilisateur
        await users.updateOne({ _id: user._id }, {
            $set: {
                name,
                password_hash: passwordHash,
                is_active: true,
                updated_at: new Date(),
            },
            $unset: {
                invitation_token: 1,
                invitation_expires: 1,
            }
        });
        return res.status(200).json({
            message: 'Profile completed successfully',
            user: {
                id: user._id.toString(),
                name,
                email: user.email,
                role: user.role
            }
        });
    }
    catch (e) {
        return res.status(500).json({ message: 'Server error' });
    }
};
exports.completeProfile = completeProfile;
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
