"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fixOrphanForms = exports.saveAnalysis = exports.listAnalyses = exports.shareForm = exports.getStats = exports.submitResponse = exports.listResponses = exports.deleteForm = exports.updateForm = exports.getForm = exports.createForm = exports.listForms = void 0;
const zod_1 = require("zod");
const db_1 = require("../config/db");
const mongodb_1 = require("mongodb");
const email_1 = require("../config/email");
const crypto_1 = __importDefault(require("crypto"));
const optionItemSchema = zod_1.z.union([
    zod_1.z.string(),
    zod_1.z.object({ label: zod_1.z.string(), value: zod_1.z.string().optional() })
]);
const questionSchema = zod_1.z.object({
    id: zod_1.z.string(),
    categoryId: zod_1.z.string().optional(),
    type: zod_1.z.enum(['text', 'email', 'select', 'radio', 'checkbox', 'textarea', 'number', 'date', 'time', 'rating', 'file']),
    title: zod_1.z.string(),
    description: zod_1.z.string().optional(),
    required: zod_1.z.boolean(),
    position: zod_1.z.number().int().optional(), // Position de la question dans le formulaire
    options: zod_1.z.array(optionItemSchema).optional(),
    placeholder: zod_1.z.string().optional(),
    validationRules: zod_1.z.any().optional(),
    conditionalLogic: zod_1.z.any().optional(),
    isMultipleChoice: zod_1.z.boolean().optional(),
});
const formSchema = zod_1.z.object({
    title: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
    is_public: zod_1.z.boolean().optional().default(true),
    questions: zod_1.z.array(questionSchema).optional().default([]),
    max_responses: zod_1.z.number().int().optional(),
    expiration_date: zod_1.z.string().datetime().optional(),
    banner_title: zod_1.z.string().optional(),
    banner_image_url: zod_1.z.string().url().optional(),
});
const listForms = async (req, res) => {
    try {
        const db = await (0, db_1.getDb)();
        const forms = db.collection('forms');
        // Construire le filtre selon le rôle
        let filter = {};
        if (req.user?.role === 'admin') {
            // Admin peut voir tous les formulaires
            filter = {};
        }
        else if (req.user?.role === 'observer') {
            // Observateur peut voir tous les formulaires
            filter = {};
        }
        else if (req.user?.role === 'creator') {
            // Créateur ne peut voir que ses propres formulaires
            filter = { created_by: req.user.id };
        }
        const list = await forms
            .find(filter)
            .sort({ created_at: -1 })
            .toArray();
        return res.json(list);
    }
    catch (e) {
        // eslint-disable-next-line no-console
        console.error('listForms server error', e);
        return res.status(500).json({ message: 'Server error' });
    }
};
exports.listForms = listForms;
const createForm = async (req, res) => {
    const parsed = formSchema.safeParse(req.body);
    if (!parsed.success) {
        // eslint-disable-next-line no-console
        console.error('createForm validation error', parsed.error.flatten());
        return res.status(400).json({ message: 'Invalid payload', details: parsed.error.flatten() });
    }
    const { title, description, is_public, questions, max_responses, expiration_date, banner_title, banner_image_url } = parsed.data;
    try {
        const db = await (0, db_1.getDb)();
        const forms = db.collection('forms');
        // Normaliser les options pour les questions à choix
        const normalizedQuestions = (questions ?? []).map(q => {
            if (['select', 'radio', 'checkbox'].includes(q.type)) {
                const opts = Array.isArray(q.options) ? q.options : [];
                const normalized = opts
                    .map(opt => {
                    if (typeof opt === 'string')
                        return opt;
                    return opt.value ?? opt.label;
                })
                    .filter(v => typeof v === 'string' && v.trim().length > 0);
                return { ...q, options: normalized };
            }
            return q;
        });
        const public_slug = crypto_1.default
            .randomBytes(6)
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/g, '');
        const insert = await forms.insertOne({
            user_id: req.user?.id, // Corriger : utiliser l'ID de l'utilisateur connecté
            created_by: req.user?.id, // Ajouter le créateur
            title,
            description: description ?? null,
            is_public: is_public ?? true,
            questions: normalizedQuestions,
            max_responses: max_responses ?? null,
            expiration_date: expiration_date ? new Date(expiration_date) : null,
            public_slug,
            banner_title: banner_title ?? null,
            banner_image_url: banner_image_url ?? null,
            created_at: new Date(),
            updated_at: new Date(),
        });
        return res.status(201).json({ id: insert.insertedId.toString() });
    }
    catch (e) {
        // eslint-disable-next-line no-console
        console.error('createForm server error', e);
        const message = e instanceof Error ? e.message : 'Server error';
        return res.status(500).json({ message, code: 'CREATE_FORM_FAILED' });
    }
};
exports.createForm = createForm;
const getForm = async (req, res) => {
    const id = req.params.id;
    try {
        const db = await (0, db_1.getDb)();
        const forms = db.collection('forms');
        const form = await forms.findOne({ _id: new mongodb_1.ObjectId(id) });
        if (!form)
            return res.status(404).json({ message: 'Not found' });
        // Vérifier les permissions
        if (req.user?.role === 'creator' && form.created_by !== req.user.id) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        return res.json(form);
    }
    catch {
        return res.status(500).json({ message: 'Server error' });
    }
};
exports.getForm = getForm;
const updateForm = async (req, res) => {
    const id = req.params.id;
    const parsed = formSchema.partial().safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ message: 'Invalid payload' });
    const { title, description, is_public, questions, max_responses, expiration_date, banner_title, banner_image_url } = parsed.data;
    try {
        const db = await (0, db_1.getDb)();
        const forms = db.collection('forms');
        // Vérifier que le formulaire existe et les permissions
        const form = await forms.findOne({ _id: new mongodb_1.ObjectId(id) });
        if (!form)
            return res.status(404).json({ message: 'Not found' });
        // Vérifier les permissions de modification
        if (req.user?.role === 'observer') {
            return res.status(403).json({ message: 'Observers cannot modify forms' });
        }
        if (req.user?.role === 'creator' && form.created_by !== req.user.id) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        // Normaliser également lors de la mise à jour
        const normalizedQuestions = questions === undefined ? undefined : (questions ?? []).map(q => {
            if (['select', 'radio', 'checkbox'].includes(q.type)) {
                const opts = Array.isArray(q.options) ? q.options : [];
                const normalized = opts
                    .map(opt => typeof opt === 'string' ? opt : (opt.value ?? opt.label))
                    .filter(v => typeof v === 'string' && v.trim().length > 0);
                return { ...q, options: normalized };
            }
            return q;
        });
        await forms.updateOne({ _id: new mongodb_1.ObjectId(id) }, {
            $set: {
                ...(title !== undefined ? { title } : {}),
                ...(description !== undefined ? { description } : {}),
                ...(is_public !== undefined ? { is_public } : {}),
                ...(normalizedQuestions !== undefined ? { questions: normalizedQuestions } : {}),
                ...(max_responses !== undefined ? { max_responses } : {}),
                ...(expiration_date !== undefined ? { expiration_date: expiration_date ? new Date(expiration_date) : null } : {}),
                ...(banner_title !== undefined ? { banner_title } : {}),
                ...(banner_image_url !== undefined ? { banner_image_url } : {}),
                updated_at: new Date(),
            },
        });
        return res.json({ ok: true });
    }
    catch {
        return res.status(500).json({ message: 'Server error' });
    }
};
exports.updateForm = updateForm;
const deleteForm = async (req, res) => {
    const id = req.params.id;
    try {
        const db = await (0, db_1.getDb)();
        const forms = db.collection('forms');
        // Vérifier que le formulaire existe et les permissions
        const form = await forms.findOne({ _id: new mongodb_1.ObjectId(id) });
        if (!form)
            return res.status(404).json({ message: 'Not found' });
        // Vérifier les permissions de suppression
        if (req.user?.role === 'observer') {
            return res.status(403).json({ message: 'Observers cannot delete forms' });
        }
        if (req.user?.role === 'creator') {
            return res.status(403).json({ message: 'Creators cannot delete forms' });
        }
        // Seuls les admins peuvent supprimer
        await forms.deleteOne({ _id: new mongodb_1.ObjectId(id) });
        return res.status(204).send();
    }
    catch {
        return res.status(500).json({ message: 'Server error' });
    }
};
exports.deleteForm = deleteForm;
const listResponses = async (req, res) => {
    const id = req.params.id;
    try {
        const db = await (0, db_1.getDb)();
        const forms = db.collection('forms');
        const responses = db.collection(`responses_${id}`);
        // Vérifier que le formulaire existe et les permissions
        const form = await forms.findOne({ _id: new mongodb_1.ObjectId(id) });
        if (!form)
            return res.status(404).json({ message: 'Not found' });
        // Vérifier les permissions pour voir les réponses
        if (req.user?.role === 'creator' && form.created_by !== req.user.id) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        const list = await responses
            .find({})
            .sort({ submitted_at: -1 })
            .toArray();
        return res.json(list);
    }
    catch {
        return res.status(500).json({ message: 'Server error' });
    }
};
exports.listResponses = listResponses;
const responseSchema = zod_1.z.object({
    respondent_name: zod_1.z.string().optional(),
    respondent_email: zod_1.z.string().email().optional(),
    answers: zod_1.z.record(zod_1.z.any()),
});
const submitResponse = async (req, res) => {
    const { id } = req.params;
    const parsed = responseSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ message: 'Invalid payload' });
    const { respondent_name, respondent_email, answers } = parsed.data;
    try {
        const db = await (0, db_1.getDb)();
        const form = await db.collection('forms').findOne({ _id: new mongodb_1.ObjectId(id) });
        if (!form)
            return res.status(404).json({ message: 'Not found' });
        if (form.max_responses && form.max_responses > 0) {
            const responsesCol = db.collection(`responses_${id}`);
            const count = await responsesCol.estimatedDocumentCount();
            if (count >= form.max_responses)
                return res.status(410).json({ message: 'Form closed' });
        }
        await db.collection(`responses_${id}`).insertOne({
            form_id: id,
            respondent_name: respondent_name ?? null,
            respondent_email: respondent_email ?? null,
            answers,
            submitted_at: new Date(),
        });
        await db.collection('activity_logs').insertOne({
            userId: null,
            action: 'response_submitted',
            resourceId: id,
            metadata: { respondent_email, respondent_name },
            timestamp: new Date(),
        });
        return res.status(201).json({ ok: true });
    }
    catch {
        return res.status(500).json({ message: 'Server error' });
    }
};
exports.submitResponse = submitResponse;
const getStats = async (req, res) => {
    const { id } = req.params;
    try {
        const db = await (0, db_1.getDb)();
        const stats = await db.collection('realtime_stats').findOne({ formId: id });
        return res.json(stats ?? { views: 0, submissions: 0, completionRate: 0 });
    }
    catch {
        return res.status(500).json({ message: 'Server error' });
    }
};
exports.getStats = getStats;
const shareForm = async (req, res) => {
    const { id } = req.params;
    const shareSchema = zod_1.z.object({
        to: zod_1.z.string().email(),
        subject: zod_1.z.string().min(1).optional(),
        message: zod_1.z.string().min(1).optional(),
    });
    const parsed = shareSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ message: 'Invalid payload' });
    const { to, subject: customSubject, message: customMessage } = parsed.data;
    try {
        const db = await (0, db_1.getDb)();
        const form = await db.collection('forms').findOne({ _id: new mongodb_1.ObjectId(id) });
        if (!form)
            return res.status(404).json({ message: 'Not found' });
        const title = form.title;
        const appUrl = process.env.APP_URL || 'http://localhost:3000';
        const link = `${appUrl}/f/${form.public_slug || id}`;
        const logoUrl = `${appUrl}/images/logo2.png`;
        // Sujet par défaut conforme à la demande
        const subject = customSubject ?? `Formulaire: ${title}`;
        // Message texte par défaut conforme à la demande (servira aussi de base HTML)
        const defaultText = `Bonjour,\n\nJe vous invite à répondre à ce formulaire : ${title}\n\nLien : ${link}\n\nCordialement`;
        const textToRender = customMessage ?? defaultText;
        // Template HTML avec branding (logo, bouton, styles)
        const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
  <style>
    body { margin:0; padding:0; background:#f5f7fb; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif; color:#333; }
    .container { max-width:640px; margin:0 auto; padding:24px; }
    .card { background:#ffffff; border-radius:12px; box-shadow:0 2px 10px rgba(0,0,0,0.06); overflow:hidden; }
    .header { background:linear-gradient(135deg,#E40046 0%,#C7003A 100%); color:#fff; padding:20px 24px; display:flex; align-items:center; gap:12px; }
    .logo { background:#fff; border-radius:8px; width:120px; height:40px; display:flex; align-items:center; justify-content:center; }
    .logo img { max-width:100%; max-height:100%; object-fit:contain; }
    .title { font-weight:700; font-size:16px; margin:0; }
    .content { padding:24px; line-height:1.6; font-size:15px; }
    .btn { display:inline-block; background:#E40046; color:#fff !important; text-decoration:none; padding:12px 18px; border-radius:8px; font-weight:600; }
    .muted { color:#6b7280; font-size:12px; margin-top:16px; }
    .footer { text-align:center; color:#9ca3af; font-size:12px; padding:16px; }
  </style>
  <!--[if mso]><style type="text/css">.btn{padding:0 !important;} .btn a{background:#E40046;color:#fff !important;padding:12px 18px;display:inline-block;border-radius:8px;text-decoration:none;}</style><![endif]-->
  </head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <div class="logo"><img src="${logoUrl}" alt="Simplon" /></div>
        <h1 class="title">Invitation à répondre à un formulaire</h1>
      </div>
      <div class="content">
        <p>${textToRender.replace(/\n/g, '<br/>')}</p>
        <p style="margin:24px 0 8px 0;">
          <a href="${link}" class="btn" target="_blank" rel="noopener noreferrer">Ouvrir le formulaire</a>
        </p>
        <p class="muted">Si le bouton ne fonctionne pas, copiez-collez ce lien dans votre navigateur:<br/>
          <a href="${link}">${link}</a>
        </p>
      </div>
      <div class="footer">
        © ${new Date().getFullYear()} Simplon • Tous droits réservés
      </div>
    </div>
  </div>
</body>
</html>`;
        await (0, email_1.sendEmail)(to, subject, html);
        return res.json({ ok: true });
    }
    catch {
        return res.status(500).json({ message: 'Server error' });
    }
};
exports.shareForm = shareForm;
// Fonctions pour gérer les analyses IA
const listAnalyses = async (req, res) => {
    const { id } = req.params;
    try {
        const db = await (0, db_1.getDb)();
        // Vérifier que le formulaire existe
        const form = await db.collection('forms').findOne({ _id: new mongodb_1.ObjectId(id) });
        if (!form)
            return res.status(404).json({ message: 'Form not found' });
        const analyses = await db.collection('form_analyses').find({ formId: id }).sort({ createdAt: -1 }).toArray();
        return res.json(analyses);
    }
    catch (error) {
        console.error('Error listing analyses:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};
exports.listAnalyses = listAnalyses;
const saveAnalysis = async (req, res) => {
    const { id } = req.params;
    // Validation basique des données requises
    if (!req.body || !req.body.summary) {
        return res.status(400).json({ message: 'Analysis data is required' });
    }
    try {
        const db = await (0, db_1.getDb)();
        // Vérifier que le formulaire existe
        const form = await db.collection('forms').findOne({ _id: new mongodb_1.ObjectId(id) });
        if (!form)
            return res.status(404).json({ message: 'Form not found' });
        // Préparer l'analyse à sauvegarder avec validation
        const analysisData = {
            ...req.body,
            formId: id,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        // Insérer l'analyse dans la base de données
        const result = await db.collection('form_analyses').insertOne(analysisData);
        // Ajouter l'ID généré à l'analyse
        const savedAnalysis = {
            ...analysisData,
            _id: result.insertedId
        };
        return res.status(201).json(savedAnalysis);
    }
    catch (error) {
        console.error('Error saving analysis:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};
exports.saveAnalysis = saveAnalysis;
// Endpoint pour corriger les formulaires existants avec created_by null
const fixOrphanForms = async (req, res) => {
    try {
        // Seuls les admins peuvent exécuter cette action
        if (req.user?.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }
        const db = await (0, db_1.getDb)();
        const forms = db.collection('forms');
        // Trouver tous les formulaires avec created_by null
        const orphanForms = await forms.find({ created_by: null }).toArray();
        if (orphanForms.length === 0) {
            return res.json({
                message: 'No orphan forms found',
                count: 0,
                forms: []
            });
        }
        // Assigner tous les formulaires orphelins à l'utilisateur admin actuel
        const result = await forms.updateMany({ created_by: null }, {
            $set: {
                created_by: req.user.id,
                user_id: req.user.id,
                updated_at: new Date()
            }
        });
        return res.json({
            message: `Fixed ${result.modifiedCount} orphan forms`,
            count: result.modifiedCount,
            forms: orphanForms.map(form => ({
                id: form._id,
                title: form.title,
                created_at: form.created_at
            }))
        });
    }
    catch (error) {
        console.error('Error fixing orphan forms:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};
exports.fixOrphanForms = fixOrphanForms;
