import { Router } from 'express'
import { authRouter, formsRouter, publicRouter, usersRouter } from '../routes'

export const router = Router()

router.use('/auth', authRouter)
router.use('/forms', formsRouter)
router.use('/public', publicRouter)
router.use('/auth/users', usersRouter)


