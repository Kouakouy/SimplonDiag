import { Request, Response } from 'express'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { getDb } from '../config/db'
import { ObjectId } from 'mongodb'
import { AuthRequest } from '../middleware/auth'
import { sendEmail } from '../config/email'
import crypto from 'crypto'

const authSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email(),
  password: z.string().min(6).optional(),
  role: z.enum(['admin', 'observer', 'creator']).optional(),
})

const inviteUserSchema = z.object({
  email: z.string().email(),
  role: z.enum(['admin', 'observer', 'creator']),
})

export const register = async (req: Request, res: Response) => {
  const parsed = authSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ message: 'Invalid payload' })
  const { name, email, password, role } = parsed.data
  
  // Vérifier que le mot de passe est fourni pour l'inscription
  if (!password) {
    return res.status(400).json({ message: 'Password is required for registration' })
  }
  
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
    if (!user.password_hash) return res.status(401).json({ message: 'Invalid credentials' })
    const valid = await bcrypt.compare(password as string, user.password_hash as string)
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
  // Accepter soit le schéma d'invitation soit le schéma complet
  const inviteData = inviteUserSchema.safeParse(req.body)
  const fullData = authSchema.safeParse(req.body)
  
  if (!inviteData.success && !fullData.success) {
    return res.status(400).json({ message: 'Invalid payload' })
  }
  
  const parsedData = inviteData.success ? inviteData.data : fullData.data
  if (!parsedData) {
    return res.status(400).json({ message: 'Invalid payload' })
  }
  
  const { email, role } = parsedData
  const name = 'name' in parsedData ? parsedData.name : undefined
  const password = 'password' in parsedData ? parsedData.password : undefined
  
  try {
    const db = await getDb()
    const users = db.collection('users')
    const existing = await users.findOne({ email })
    if (existing) return res.status(409).json({ message: 'Email already used' })
    
    // Déterminer le mode de création
    const isDirectCreation = name && password
    
    if (isDirectCreation) {
      // Mode création directe
      const passwordHash = await bcrypt.hash(password as string, 10)
      const insert = await users.insertOne({
        name: name as string,
        email,
        password_hash: passwordHash,
        role,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      })
      
      return res.status(201).json({ 
        id: insert.insertedId.toString(),
        message: 'User created successfully' 
      })
    } else {
      // Mode invitation
      const invitationToken = crypto.randomBytes(32).toString('hex')
      const invitationExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 jours
      
      const insert = await users.insertOne({
        name: '', // Sera complété par l'utilisateur
        email,
        password_hash: '', // Sera défini par l'utilisateur
        role,
        is_active: false, // Inactif jusqu'à complétion du profil
        invitation_token: invitationToken,
        invitation_expires: invitationExpires,
        created_at: new Date(),
        updated_at: new Date(),
      })
      
      // Envoyer l'email d'invitation
      try {
        console.log('📧 Préparation de l\'envoi d\'email d\'invitation...')
        console.log('   Email destinataire:', email)
        console.log('   Rôle:', role)
        console.log('   Token:', invitationToken.substring(0, 10) + '...')
        
        const { EmailTemplates } = await import('../services/emailTemplates')
        const appUrl = process.env.APP_URL || 'http://localhost:3000'
        console.log('   URL de l\'app:', appUrl)
        
        const emailTemplate = EmailTemplates.userInvitation(email, role as string, invitationToken, appUrl)
        console.log('   Template généré:', emailTemplate.subject)
        
        await sendEmail(email, emailTemplate.subject, emailTemplate.html)
        console.log('✅ Email d\'invitation envoyé avec succès')
      } catch (emailError) {
        console.error('❌ Erreur envoi email:', emailError)
        // Ne pas faire échouer la création si l'email échoue
      }
      
      return res.status(201).json({ 
        id: insert.insertedId.toString(),
        message: 'User invitation sent successfully' 
      })
    }
  } catch (e) {
    return res.status(500).json({ message: 'Server error' })
  }
}

export const completeProfile = async (req: Request, res: Response) => {
  const completeProfileSchema = z.object({
    token: z.string(),
    name: z.string().min(1),
    password: z.string().min(6),
  })
  
  const parsed = completeProfileSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ message: 'Invalid payload' })
  const { token, name, password } = parsed.data
  
  try {
    const db = await getDb()
    const users = db.collection('users')
    
    // Trouver l'utilisateur avec le token d'invitation
    const user = await users.findOne({ 
      invitation_token: token,
      invitation_expires: { $gt: new Date() }
    })
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired invitation token' })
    }
    
    // Vérifier si le profil n'est pas déjà complété
    if (user.is_active && user.password_hash) {
      return res.status(400).json({ message: 'Profile already completed' })
    }
    
    // Hasher le mot de passe
    const passwordHash = await bcrypt.hash(password, 10)
    
    // Mettre à jour l'utilisateur
    await users.updateOne(
      { _id: user._id },
      {
        $set: {
          name,
          password_hash: passwordHash,
          is_active: true,
          updated_at: new Date(),
        },
        $unset: {
          invitation_token: 1,
          invitation_expires: 1,
        }
      }
    )
    
    return res.status(200).json({ 
      message: 'Profile completed successfully',
      user: {
        id: user._id.toString(),
        name,
        email: user.email,
        role: user.role
      }
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
