import { Router } from 'express'
import { authRouter, formsRouter, publicRouter } from '../routes'

export const router = Router()

router.use('/auth', authRouter) // authRouter pointe maintenant vers usersRouter
router.use('/forms', formsRouter)
router.use('/public', publicRouter)


