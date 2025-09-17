import { Router } from 'express'
import { getDb } from '../config/db'
import { ObjectId } from 'mongodb'
import { requireAuth, requireRole } from '../middleware/auth'

export const usersRouter = Router()

// Liste des utilisateurs du dashboard
usersRouter.get('/', requireAuth, requireRole(['owner','admin']), async (_req, res) => {
  try {
    const db = await getDb()
    const list = await db.collection('dashboard_users').find({}).sort({ created_at: -1 }).toArray()
    return res.json(list.map(u => ({
      id: u._id.toString(),
      email: u.email,
      name: u.name || null,
      role: u.role || 'viewer',
      created_at: u.created_at,
    })))
  } catch {
    return res.status(500).json({ message: 'Server error' })
  }
})

// Création/invitation d'un utilisateur du dashboard
usersRouter.post('/', requireAuth, requireRole(['owner','admin']), async (req, res) => {
  const { email, name, role } = req.body || {}
  if (!email || typeof email !== 'string') return res.status(400).json({ message: 'Invalid email' })
  const normalizedRole = ['owner','admin','viewer'].includes(role) ? role : 'viewer'
  try {
    const db = await getDb()
    const col = db.collection('dashboard_users')
    const existing = await col.findOne({ email })
    if (existing) return res.status(200).json({ id: existing._id.toString() })
    const insert = await col.insertOne({ email, name: name ?? null, role: normalizedRole, created_at: new Date() })
    return res.status(201).json({ id: insert.insertedId.toString() })
  } catch {
    return res.status(500).json({ message: 'Server error' })
  }
})

// Suppression d'un utilisateur
usersRouter.delete('/:id', requireAuth, requireRole(['owner','admin']), async (req, res) => {
  const { id } = req.params
  if (!ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid id' })
  try {
    const db = await getDb()
    await db.collection('dashboard_users').deleteOne({ _id: new ObjectId(id) })
    return res.status(204).send()
  } catch {
    return res.status(500).json({ message: 'Server error' })
  }
})


