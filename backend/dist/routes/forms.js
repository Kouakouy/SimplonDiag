"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formsRouter = void 0;
const express_1 = require("express");
const controllers_1 = require("../controllers");
exports.formsRouter = (0, express_1.Router)();
// Auth temporarily disabled to allow running without auth setup
exports.formsRouter.get('/', controllers_1.listForms);
exports.formsRouter.post('/', controllers_1.createForm);
exports.formsRouter.get('/:id', controllers_1.getForm);
exports.formsRouter.put('/:id', controllers_1.updateForm);
exports.formsRouter.delete('/:id', controllers_1.deleteForm);
exports.formsRouter.get('/:id/responses', controllers_1.listResponses);
exports.formsRouter.post('/:id/responses', controllers_1.submitResponse);
exports.formsRouter.get('/:id/stats', controllers_1.getStats);
exports.formsRouter.post('/:id/share', controllers_1.shareForm);
exports.formsRouter.get('/:id/analyses', controllers_1.listAnalyses);
exports.formsRouter.post('/:id/analyses', controllers_1.saveAnalysis);
