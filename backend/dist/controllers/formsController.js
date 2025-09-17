"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.shareForm = exports.getStats = exports.submitResponse = exports.listResponses = exports.deleteForm = exports.updateForm = exports.getForm = exports.createForm = exports.listForms = void 0;
const zod_1 = require("zod");
const db_1 = require("../config/db");
const mongodb_1 = require("mongodb");
const email_1 = require("../config/email");
const crypto_1 = __importDefault(require("crypto"));
const questionSchema = zod_1.z.object({
    id: zod_1.z.string(),
    categoryId: zod_1.z.string().optional(),
    type: zod_1.z.enum(['text', 'email', 'select', 'radio', 'checkbox', 'textarea', 'number', 'date', 'rating', 'file']),
    title: zod_1.z.string(),
    description: zod_1.z.string().optional(),
    required: zod_1.z.boolean(),
    options: zod_1.z.array(zod_1.z.string()).optional(),
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
const listForms = async (_req, res) => {
    try {
        const db = await (0, db_1.getDb)();
        const forms = db.collection('forms');
        const list = await forms
            .find({})
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
        const public_slug = crypto_1.default
            .randomBytes(6)
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/g, '');
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
        await forms.updateOne({ _id: new mongodb_1.ObjectId(id) }, {
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
        const responses = db.collection(`responses_${id}`);
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
    const shareSchema = zod_1.z.object({ to: zod_1.z.string().email() });
    const parsed = shareSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ message: 'Invalid payload' });
    const { to } = parsed.data;
    try {
        const db = await (0, db_1.getDb)();
        const form = await db.collection('forms').findOne({ _id: new mongodb_1.ObjectId(id) });
        if (!form)
            return res.status(404).json({ message: 'Not found' });
        const title = form.title;
        const link = `${process.env.APP_URL || 'http://localhost:3000'}/f/${form.public_slug || id}`;
        await (0, email_1.sendEmail)(to, `Partager formulaire - ${title}`, `<h2>${title}</h2><p>Accédez au formulaire: <a href="${link}">${link}</a></p>`);
        return res.json({ ok: true });
    }
    catch {
        return res.status(500).json({ message: 'Server error' });
    }
};
exports.shareForm = shareForm;
