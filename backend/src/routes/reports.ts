import { Router } from 'express'
import { createReport, listReports, updateReportStatus } from '../controllers/reportsController'
import { requireAuth, requireRole } from '../middleware/auth'

const router = Router()

// Route publique pour créer un rapport (accessible à tous les utilisateurs authentifiés)
router.post('/', requireAuth, createReport)

// Routes pour lister les rapports (admin voit tout, autres voient leurs propres rapports)
router.get('/', requireAuth, requireRole(['admin', 'creator', 'observer']), listReports)

// Route admin uniquement pour mettre à jour le statut
router.patch('/:id/status', requireAuth, requireRole(['admin']), updateReportStatus)

export default router
