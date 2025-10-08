import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'

import { router as apiRouter } from './setup/routes'
import { initializeDemoUsers } from './scripts/initDemoUsers'

const app = express()

app.use(cors({ 
  origin: true, 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ limit: '10mb', extended: true }))
app.use(cookieParser())
app.use(morgan('dev'))

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api', apiRouter)

const port = parseInt(process.env.PORT || '3001', 10)
app.listen(port, async () => {
  // eslint-disable-next-line no-console
  console.log(`Backend listening on http://localhost:${port}`)
  
  // Initialiser les utilisateurs de démonstration
  await initializeDemoUsers()
})


