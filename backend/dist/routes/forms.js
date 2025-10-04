"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formsRouter = void 0;
const express_1 = require("express");
const controllers_1 = require("../controllers");
const auth_1 = require("../middleware/auth");
exports.formsRouter = (0, express_1.Router)();
// Routes protégées par authentification
exports.formsRouter.get('/', auth_1.requireAuth, controllers_1.listForms);
exports.formsRouter.post('/', auth_1.requireAuth, controllers_1.createForm);
exports.formsRouter.get('/:id', auth_1.requireAuth, controllers_1.getForm);
exports.formsRouter.put('/:id', auth_1.requireAuth, controllers_1.updateForm);
exports.formsRouter.delete('/:id', auth_1.requireAuth, controllers_1.deleteForm);
exports.formsRouter.get('/:id/responses', auth_1.requireAuth, controllers_1.listResponses);
exports.formsRouter.post('/:id/responses', controllers_1.submitResponse); // Pas d'auth pour les réponses publiques
exports.formsRouter.get('/:id/stats', auth_1.requireAuth, controllers_1.getStats);
exports.formsRouter.post('/:id/share', auth_1.requireAuth, controllers_1.shareForm);
exports.formsRouter.get('/:id/analyses', auth_1.requireAuth, controllers_1.listAnalyses);
exports.formsRouter.post('/:id/analyses', auth_1.requireAuth, controllers_1.saveAnalysis);
// Route spéciale pour corriger les formulaires orphelins (admin seulement)
exports.formsRouter.post('/fix-orphans', auth_1.requireAuth, controllers_1.fixOrphanForms);
