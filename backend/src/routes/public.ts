import { Router } from 'express'
import { getDb } from '../config/db'
import { ObjectId } from 'mongodb'

export const publicRouter = Router()

// Get a public form by slug and enforce max_responses
publicRouter.get('/forms/:slug', async (req, res) => {
  const { slug } = req.params
  try {
    const db = await getDb()
    const forms = db.collection('forms')
    let form = await forms.findOne({ public_slug: slug })
    // Fallback: accepter aussi un ID MongoDB direct
    if (!form && ObjectId.isValid(slug)) {
      form = await forms.findOne({ _id: new ObjectId(slug) })
    }
    if (!form || form.is_public === false) return res.status(404).json({ message: 'Not found' })

    // enforce max responses
    if (form.max_responses && form.max_responses > 0) {
      const responsesCol = db.collection(`responses_${form._id.toString()}`)
      const count = await responsesCol.estimatedDocumentCount()
      if (count >= form.max_responses) {
        return res.status(410).json({ message: 'Form closed' })
      }
    }

    return res.json({
      id: form._id.toString(),
      title: form.title,
      description: form.description,
      is_public: form.is_public,
      questions: form.questions ?? [],
      max_responses: form.max_responses ?? null,
      expiration_date: form.expiration_date ?? null,
      created_at: form.created_at,
      updated_at: form.updated_at,
      public_slug: form.public_slug,
      banner_title: form.banner_title ?? null,
      banner_image_url: form.banner_image_url ?? null,
    })
  } catch {
    return res.status(500).json({ message: 'Server error' })
  }
})


