import { Request, Response } from 'express'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { getDb } from '../config/db'

const authSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email(),
  password: z.string().min(6),
})

export const register = async (req: Request, res: Response) => {
  const parsed = authSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ message: 'Invalid payload' })
  const { name, email, password } = parsed.data
  try {
    const db = await getDb()
    const users = db.collection('users')
    const existing = await users.findOne({ email })
    if (existing) return res.status(409).json({ message: 'Email already used' })
    const passwordHash = await bcrypt.hash(password, 10)
    const insert = await users.insertOne({
      name: name ?? 'User',
      email,
      password_hash: passwordHash,
      created_at: new Date(),
      updated_at: new Date(),
    })
    const userId = insert.insertedId.toString()
    const token = jwt.sign({ id: userId, email }, process.env.JWT_SECRET as string, { expiresIn: '7d' })
    return res.status(201).json({ token })
  } catch (e) {
    return res.status(500).json({ message: 'Server error' })
  }
}

export const login = async (req: Request, res: Response) => {
  const parsed = authSchema.pick({ email: true, password: true }).safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ message: 'Invalid payload' })
  const { email, password } = parsed.data
  try {
    const db = await getDb()
    const users = db.collection('users')
    const user = await users.findOne({ email })
    if (!user) return res.status(401).json({ message: 'Invalid credentials' })
    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' })
    const token = jwt.sign({ id: user._id.toString(), email }, process.env.JWT_SECRET as string, { expiresIn: '7d' })
    return res.json({ token })
  } catch (e) {
    return res.status(500).json({ message: 'Server error' })
  }
}


