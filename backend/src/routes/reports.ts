import { Router } from 'express'
import { createReport, listReports, updateReportStatus } from '../controllers/reportsController'
import { requireAuth, requireRole } from '../middleware/auth'

const router = Router()

// Route publique pour créer un rapport
router.post('/', createReport)

// Routes admin pour gérer les rapports
router.get('/', requireAuth, requireRole(['admin']), listReports)
router.patch('/:id/status', requireAuth, requireRole(['admin']), updateReportStatus)

export default router
