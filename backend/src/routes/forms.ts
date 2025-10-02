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
} from '../controllers'

export const formsRouter = Router()

// Auth temporarily disabled to allow running without auth setup
formsRouter.get('/', listForms)
formsRouter.post('/', createForm)
formsRouter.get('/:id', getForm)
formsRouter.put('/:id', updateForm)
formsRouter.delete('/:id', deleteForm)
formsRouter.get('/:id/responses', listResponses)
formsRouter.post('/:id/responses', submitResponse)
formsRouter.get('/:id/stats', getStats)
formsRouter.post('/:id/share', shareForm)
formsRouter.get('/:id/analyses', listAnalyses)
formsRouter.post('/:id/analyses', saveAnalysis)


