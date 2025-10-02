import { Request, Response } from 'express'
import { z } from 'zod'
import { getDb } from '../config/db'
import { ObjectId } from 'mongodb'
import { AuthRequest } from '../middleware/auth'
import { sendEmail } from '../config/email'
import crypto from 'crypto'

const questionSchema = z.object({
  id: z.string(),
  categoryId: z.string().optional(),
  type: z.enum(['text','email','select','radio','checkbox','textarea','number','date','rating','file']),
  title: z.string(),
  description: z.string().optional(),
  required: z.boolean(),
  options: z.array(z.string()).optional(),
  placeholder: z.string().optional(),
  validationRules: z.any().optional(),
  conditionalLogic: z.any().optional(),
  isMultipleChoice: z.boolean().optional(),
})

const formSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  is_public: z.boolean().optional().default(true),
  questions: z.array(questionSchema).optional().default([]),
  max_responses: z.number().int().optional(),
  expiration_date: z.string().datetime().optional(),
  banner_title: z.string().optional(),
  banner_image_url: z.string().url().optional(),
})

export const listForms = async (_req: AuthRequest, res: Response) => {
  try {
    const db = await getDb()
    const forms = db.collection('forms')
    const list = await forms
      .find({})
      .sort({ created_at: -1 })
      .toArray()
    return res.json(list)
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('listForms server error', e)
    return res.status(500).json({ message: 'Server error' })
  }
}

export const createForm = async (req: AuthRequest, res: Response) => {
  const parsed = formSchema.safeParse(req.body)
  if (!parsed.success) {
    // eslint-disable-next-line no-console
    console.error('createForm validation error', parsed.error.flatten())
    return res.status(400).json({ message: 'Invalid payload', details: parsed.error.flatten() })
  }
  const { title, description, is_public, questions, max_responses, expiration_date, banner_title, banner_image_url } = parsed.data
  try {
    const db = await getDb()
    const forms = db.collection('forms')
    const public_slug = crypto
      .randomBytes(6)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/g, '')
    const insert = await forms.insertOne({
      user_id: null,
      title,
      description: description ?? null,
      is_public: is_public ?? true,
      questions: questions ?? [],
      max_responses: max_responses ?? null,
      expiration_date: expiration_date ? new Date(expiration_date) : null,
      public_slug,
      banner_title: banner_title ?? null,
      banner_image_url: banner_image_url ?? null,
      created_at: new Date(),
      updated_at: new Date(),
    })
    return res.status(201).json({ id: insert.insertedId.toString() })
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('createForm server error', e)
    const message = e instanceof Error ? e.message : 'Server error'
    return res.status(500).json({ message, code: 'CREATE_FORM_FAILED' })
  }
}

export const getForm = async (req: AuthRequest, res: Response) => {
  const id = req.params.id
  try {
    const db = await getDb()
    const forms = db.collection('forms')
    const form = await forms.findOne({ _id: new ObjectId(id) })
    if (!form) return res.status(404).json({ message: 'Not found' })
    return res.json(form)
  } catch {
    return res.status(500).json({ message: 'Server error' })
  }
}

export const updateForm = async (req: AuthRequest, res: Response) => {
  const id = req.params.id
  const parsed = formSchema.partial().safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ message: 'Invalid payload' })
  const { title, description, is_public, questions, max_responses, expiration_date, banner_title, banner_image_url } = parsed.data
  try {
    const db = await getDb()
    const forms = db.collection('forms')
    await forms.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...(title !== undefined ? { title } : {}),
          ...(description !== undefined ? { description } : {}),
          ...(is_public !== undefined ? { is_public } : {}),
          ...(questions !== undefined ? { questions } : {}),
          ...(max_responses !== undefined ? { max_responses } : {}),
          ...(expiration_date !== undefined ? { expiration_date: expiration_date ? new Date(expiration_date) : null } : {}),
          ...(banner_title !== undefined ? { banner_title } : {}),
          ...(banner_image_url !== undefined ? { banner_image_url } : {}),
          updated_at: new Date(),
        },
      }
    )
    return res.json({ ok: true })
  } catch {
    return res.status(500).json({ message: 'Server error' })
  }
}

export const deleteForm = async (req: AuthRequest, res: Response) => {
  const id = req.params.id
  try {
    const db = await getDb()
    const forms = db.collection('forms')
    await forms.deleteOne({ _id: new ObjectId(id) })
    return res.status(204).send()
  } catch {
    return res.status(500).json({ message: 'Server error' })
  }
}

export const listResponses = async (req: AuthRequest, res: Response) => {
  const id = req.params.id
  try {
    const db = await getDb()
    const responses = db.collection(`responses_${id}`)
    const list = await responses
      .find({})
      .sort({ submitted_at: -1 })
      .toArray()
    return res.json(list)
  } catch {
    return res.status(500).json({ message: 'Server error' })
  }
}

const responseSchema = z.object({
  respondent_name: z.string().optional(),
  respondent_email: z.string().email().optional(),
  answers: z.record(z.any()),
})

export const submitResponse = async (req: Request, res: Response) => {
  const { id } = req.params
  const parsed = responseSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ message: 'Invalid payload' })
  const { respondent_name, respondent_email, answers } = parsed.data
  try {
    const db = await getDb()
    const form = await db.collection('forms').findOne({ _id: new ObjectId(id) })
    if (!form) return res.status(404).json({ message: 'Not found' })
    if (form.max_responses && form.max_responses > 0) {
      const responsesCol = db.collection(`responses_${id}`)
      const count = await responsesCol.estimatedDocumentCount()
      if (count >= form.max_responses) return res.status(410).json({ message: 'Form closed' })
    }
    await db.collection(`responses_${id}`).insertOne({
      form_id: id,
      respondent_name: respondent_name ?? null,
      respondent_email: respondent_email ?? null,
      answers,
      submitted_at: new Date(),
    })

    await db.collection('activity_logs').insertOne({
      userId: null,
      action: 'response_submitted',
      resourceId: id,
      metadata: { respondent_email, respondent_name },
      timestamp: new Date(),
    })

    return res.status(201).json({ ok: true })
  } catch {
    return res.status(500).json({ message: 'Server error' })
  }
}

export const getStats = async (req: AuthRequest, res: Response) => {
  const { id } = req.params
  try {
    const db = await getDb()
    const stats = await db.collection('realtime_stats').findOne({ formId: id })
    return res.json(stats ?? { views: 0, submissions: 0, completionRate: 0 })
  } catch {
    return res.status(500).json({ message: 'Server error' })
  }
}

export const shareForm = async (req: AuthRequest, res: Response) => {
  const { id } = req.params
  const shareSchema = z.object({ to: z.string().email() })
  const parsed = shareSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ message: 'Invalid payload' })
  const { to } = parsed.data
  try {
    const db = await getDb()
    const form = await db.collection('forms').findOne({ _id: new ObjectId(id) })
    if (!form) return res.status(404).json({ message: 'Not found' })
    const title = form.title as string
    const link = `${process.env.APP_URL || 'http://localhost:3000'}/f/${form.public_slug || id}`
    await sendEmail(
      to,
      `Partager formulaire - ${title}`,
      `<h2>${title}</h2><p>Accédez au formulaire: <a href="${link}">${link}</a></p>`
    )
    return res.json({ ok: true })
  } catch {
    return res.status(500).json({ message: 'Server error' })
  }
}

// Fonctions pour gérer les analyses IA
export const listAnalyses = async (req: AuthRequest, res: Response) => {
  const { id } = req.params
  try {
    const db = await getDb()
    
    // Vérifier que le formulaire existe
    const form = await db.collection('forms').findOne({ _id: new ObjectId(id) })
    if (!form) return res.status(404).json({ message: 'Form not found' })
    
    const analyses = await db.collection('form_analyses').find({ formId: id }).sort({ createdAt: -1 }).toArray()
    return res.json(analyses)
  } catch (error) {
    console.error('Error listing analyses:', error)
    return res.status(500).json({ message: 'Server error' })
  }
}

export const saveAnalysis = async (req: AuthRequest, res: Response) => {
  const { id } = req.params
  
  // Validation basique des données requises
  if (!req.body || !req.body.summary) {
    return res.status(400).json({ message: 'Analysis data is required' })
  }
  
  try {
    const db = await getDb()
    
    // Vérifier que le formulaire existe
    const form = await db.collection('forms').findOne({ _id: new ObjectId(id) })
    if (!form) return res.status(404).json({ message: 'Form not found' })
    
    // Préparer l'analyse à sauvegarder avec validation
    const analysisData = {
      ...req.body,
      formId: id,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    // Insérer l'analyse dans la base de données
    const result = await db.collection('form_analyses').insertOne(analysisData)
    
    // Ajouter l'ID généré à l'analyse
    const savedAnalysis = {
      ...analysisData,
      _id: result.insertedId
    }
    
    return res.status(201).json(savedAnalysis)
  } catch (error) {
    console.error('Error saving analysis:', error)
    return res.status(500).json({ message: 'Server error' })
  }
}


