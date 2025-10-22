import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'

import { router as apiRouter } from './setup/routes'
import { initializeDemoUsers } from './scripts/initDemoUsers'

const app = express()

// Sécurité: Headers HTTP sécurisés
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}))

// Sécurité: Rate limiting global
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limite de 100 requêtes par IP
  message: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.',
  standardHeaders: true,
  legacyHeaders: false,
})

// Sécurité: Rate limiting strict pour l'authentification
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 tentatives max
  message: 'Trop de tentatives de connexion, veuillez réessayer dans 15 minutes.',
  skipSuccessfulRequests: true,
})

app.use('/api/', limiter)
app.use('/api/auth/login', authLimiter)

// CORS: Autoriser toutes les origines
app.use(cors({ 
  origin: true, // Autorise toutes les origines
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


