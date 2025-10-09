import { Router } from 'express'
import { 
  register, 
  login, 
  getCurrentUser, 
  getAllUsers, 
  createUser, 
  updateUser, 
  deleteUser,
  completeProfile,
  forgotPassword,
  resetPassword
} from '../controllers/authController'
import { requireAuth, requireRole } from '../middleware/auth'

const authRouter = Router()

// Routes publiques
authRouter.post('/register', register)
authRouter.post('/login', login)
authRouter.post('/complete-profile', completeProfile)
authRouter.post('/forgot-password', forgotPassword)
authRouter.post('/reset-password', resetPassword)

// Routes protégées
authRouter.get('/me', requireAuth, getCurrentUser)

// Routes pour la gestion des utilisateurs (admin seulement)
authRouter.get('/users', requireAuth, requireRole(['admin']), getAllUsers)
authRouter.post('/users', requireAuth, requireRole(['admin']), createUser)
authRouter.put('/users/:id', requireAuth, requireRole(['admin']), updateUser)
authRouter.delete('/users/:id', requireAuth, requireRole(['admin']), deleteUser)

export default authRouter