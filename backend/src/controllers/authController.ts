import { Request, Response } from 'express'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { getDb } from '../config/db'
import { ObjectId } from 'mongodb'
import { AuthRequest } from '../middleware/auth'

const authSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['admin', 'observer', 'creator']).optional(),
})

export const register = async (req: Request, res: Response) => {
  const parsed = authSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ message: 'Invalid payload' })
  const { name, email, password, role } = parsed.data
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
      role: role ?? 'creator',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    })
    const userId = insert.insertedId.toString()
    const token = jwt.sign({ id: userId, email, role: role ?? 'creator' }, process.env.JWT_SECRET as string, { expiresIn: '7d' })
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
    const token = jwt.sign({ 
      id: user._id.toString(), 
      email, 
      role: user.role || 'creator' 
    }, process.env.JWT_SECRET as string, { expiresIn: '7d' })
    return res.json({ token })
  } catch (e) {
    return res.status(500).json({ message: 'Server error' })
  }
}

export const getCurrentUser = async (req: AuthRequest, res: Response) => {
  try {
    const db = await getDb()
    const users = db.collection('users')
    const user = await users.findOne({ _id: new ObjectId(req.user?.id) })
    if (!user) return res.status(404).json({ message: 'User not found' })
    
    return res.json({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role || 'creator',
      isActive: user.is_active,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    })
  } catch (e) {
    return res.status(500).json({ message: 'Server error' })
  }
}

export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const db = await getDb()
    const users = db.collection('users')
    const allUsers = await users.find({}).toArray()
    
    const usersList = allUsers.map(user => ({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role || 'creator',
      isActive: user.is_active,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    }))
    
    return res.json(usersList)
  } catch (e) {
    return res.status(500).json({ message: 'Server error' })
  }
}

export const createUser = async (req: AuthRequest, res: Response) => {
  const parsed = authSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ message: 'Invalid payload' })
  const { name, email, password, role } = parsed.data
  
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
      role: role ?? 'creator',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    })
    
    return res.status(201).json({ 
      id: insert.insertedId.toString(),
      message: 'User created successfully' 
    })
  } catch (e) {
    return res.status(500).json({ message: 'Server error' })
  }
}

export const updateUser = async (req: AuthRequest, res: Response) => {
  const { id } = req.params
  const updateSchema = z.object({
    name: z.string().min(1).optional(),
    email: z.string().email().optional(),
    role: z.enum(['admin', 'observer', 'creator']).optional(),
    isActive: z.boolean().optional(),
  })
  
  const parsed = updateSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ message: 'Invalid payload' })
  
  try {
    const db = await getDb()
    const users = db.collection('users')
    
    // Vérifier que l'utilisateur existe
    const user = await users.findOne({ _id: new ObjectId(id) })
    if (!user) return res.status(404).json({ message: 'User not found' })
    
    // Vérifier que l'email n'est pas déjà utilisé par un autre utilisateur
    if (parsed.data.email && parsed.data.email !== user.email) {
      const existing = await users.findOne({ email: parsed.data.email })
      if (existing) return res.status(409).json({ message: 'Email already used' })
    }
    
    const updateData = {
      ...parsed.data,
      updated_at: new Date(),
    }
    
    await users.updateOne({ _id: new ObjectId(id) }, { $set: updateData })
    
    return res.json({ message: 'User updated successfully' })
  } catch (e) {
    return res.status(500).json({ message: 'Server error' })
  }
}

export const deleteUser = async (req: AuthRequest, res: Response) => {
  const { id } = req.params
  
  try {
    const db = await getDb()
    const users = db.collection('users')
    
    // Empêcher l'auto-suppression
    if (req.user?.id === id) {
      return res.status(400).json({ message: 'Cannot delete your own account' })
    }
    
    const result = await users.deleteOne({ _id: new ObjectId(id) })
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'User not found' })
    }
    
    return res.json({ message: 'User deleted successfully' })
  } catch (e) {
    return res.status(500).json({ message: 'Server error' })
  }
}
