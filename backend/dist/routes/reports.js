"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reportsController_1 = require("../controllers/reportsController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Route publique pour créer un rapport
router.post('/', reportsController_1.createReport);
// Routes admin pour gérer les rapports
router.get('/', auth_1.requireAuth, (0, auth_1.requireRole)(['admin']), reportsController_1.listReports);
router.patch('/:id/status', auth_1.requireAuth, (0, auth_1.requireRole)(['admin']), reportsController_1.updateReportStatus);
exports.default = router;
