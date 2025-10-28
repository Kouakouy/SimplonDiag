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

// CORS: Autoriser toutes les origines et gérer les preflights avant tout
const corsOptions = {
  origin: true, // reflète l'origine de la requête
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  optionsSuccessStatus: 204,
}

app.use(cors(corsOptions))
app.options('*', cors(corsOptions))

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
  skip: (req) => req.method === 'OPTIONS',
})

// Sécurité: Rate limiting strict pour l'authentification
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 tentatives max
  message: 'Trop de tentatives de connexion, veuillez réessayer dans 15 minutes.',
  skipSuccessfulRequests: true,
  skip: (req) => req.method === 'OPTIONS',
})

app.use('/api/', limiter)
app.use('/api/auth/login', authLimiter)

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


