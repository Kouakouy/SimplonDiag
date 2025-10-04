import { Router } from 'express'
import {
  listForms,
  createForm,
  getForm,
  updateForm,
  deleteForm,
  listResponses,
  submitResponse,
  getStats,
  shareForm,
  listAnalyses,
  saveAnalysis,
  fixOrphanForms,
} from '../controllers'
import { requireAuth } from '../middleware/auth'

export const formsRouter = Router()

// Routes protégées par authentification
formsRouter.get('/', requireAuth, listForms)
formsRouter.post('/', requireAuth, createForm)
formsRouter.get('/:id', requireAuth, getForm)
formsRouter.put('/:id', requireAuth, updateForm)
formsRouter.delete('/:id', requireAuth, deleteForm)
formsRouter.get('/:id/responses', requireAuth, listResponses)
formsRouter.post('/:id/responses', submitResponse) // Pas d'auth pour les réponses publiques
formsRouter.get('/:id/stats', requireAuth, getStats)
formsRouter.post('/:id/share', requireAuth, shareForm)
formsRouter.get('/:id/analyses', requireAuth, listAnalyses)
formsRouter.post('/:id/analyses', requireAuth, saveAnalysis)

// Route spéciale pour corriger les formulaires orphelins (admin seulement)
formsRouter.post('/fix-orphans', requireAuth, fixOrphanForms)


