"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middleware/auth");
const authRouter = (0, express_1.Router)();
// Routes publiques
authRouter.post('/register', authController_1.register);
authRouter.post('/login', authController_1.login);
// Routes protégées
authRouter.get('/me', auth_1.requireAuth, authController_1.getCurrentUser);
// Routes pour la gestion des utilisateurs (admin seulement)
authRouter.get('/users', auth_1.requireAuth, (0, auth_1.requireRole)(['admin']), authController_1.getAllUsers);
authRouter.post('/users', auth_1.requireAuth, (0, auth_1.requireRole)(['admin']), authController_1.createUser);
authRouter.put('/users/:id', auth_1.requireAuth, (0, auth_1.requireRole)(['admin']), authController_1.updateUser);
authRouter.delete('/users/:id', auth_1.requireAuth, (0, auth_1.requireRole)(['admin']), authController_1.deleteUser);
exports.default = authRouter;
