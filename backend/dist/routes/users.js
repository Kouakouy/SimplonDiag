"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersRouter = void 0;
const express_1 = require("express");
const db_1 = require("../config/db");
const mongodb_1 = require("mongodb");
const auth_1 = require("../middleware/auth");
exports.usersRouter = (0, express_1.Router)();
// Liste des utilisateurs du dashboard
exports.usersRouter.get('/', auth_1.requireAuth, (0, auth_1.requireRole)(['owner', 'admin']), async (_req, res) => {
    try {
        const db = await (0, db_1.getDb)();
        const list = await db.collection('dashboard_users').find({}).sort({ created_at: -1 }).toArray();
        return res.json(list.map(u => ({
            id: u._id.toString(),
            email: u.email,
            name: u.name || null,
            role: u.role || 'viewer',
            created_at: u.created_at,
        })));
    }
    catch {
        return res.status(500).json({ message: 'Server error' });
    }
});
// Création/invitation d'un utilisateur du dashboard
exports.usersRouter.post('/', auth_1.requireAuth, (0, auth_1.requireRole)(['owner', 'admin']), async (req, res) => {
    const { email, name, role } = req.body || {};
    if (!email || typeof email !== 'string')
        return res.status(400).json({ message: 'Invalid email' });
    const normalizedRole = ['owner', 'admin', 'viewer'].includes(role) ? role : 'viewer';
    try {
        const db = await (0, db_1.getDb)();
        const col = db.collection('dashboard_users');
        const existing = await col.findOne({ email });
        if (existing)
            return res.status(200).json({ id: existing._id.toString() });
        const insert = await col.insertOne({ email, name: name ?? null, role: normalizedRole, created_at: new Date() });
        return res.status(201).json({ id: insert.insertedId.toString() });
    }
    catch {
        return res.status(500).json({ message: 'Server error' });
    }
});
// Suppression d'un utilisateur
exports.usersRouter.delete('/:id', auth_1.requireAuth, (0, auth_1.requireRole)(['owner', 'admin']), async (req, res) => {
    const { id } = req.params;
    if (!mongodb_1.ObjectId.isValid(id))
        return res.status(400).json({ message: 'Invalid id' });
    try {
        const db = await (0, db_1.getDb)();
        await db.collection('dashboard_users').deleteOne({ _id: new mongodb_1.ObjectId(id) });
        return res.status(204).send();
    }
    catch {
        return res.status(500).json({ message: 'Server error' });
    }
});
