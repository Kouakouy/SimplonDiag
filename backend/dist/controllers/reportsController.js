"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateReportStatus = exports.listReports = exports.createReport = void 0;
const zod_1 = require("zod");
const db_1 = require("../config/db");
const email_1 = require("../config/email");
const reportSchema = zod_1.z.object({
    type: zod_1.z.enum(['bug', 'feature', 'question', 'info']),
    subject: zod_1.z.string().min(1).max(200),
    message: zod_1.z.string().min(1).max(2000),
    email: zod_1.z.string().email().optional().or(zod_1.z.literal('')),
    imageData: zod_1.z.string().optional(), // Base64 de l'image
    imageName: zod_1.z.string().optional(), // Nom du fichier
});
const createReport = async (req, res) => {
    try {
        // Valider les données
        const parsed = reportSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                message: 'Données invalides',
                details: parsed.error.flatten()
            });
        }
        const { type, subject, message, email, imageData, imageName } = parsed.data;
        // Récupérer l'image si elle existe
        const image = imageData ? {
            data: imageData,
            name: imageName || 'screenshot.png',
        } : null;
        // Sauvegarder le rapport dans la base de données
        const db = await (0, db_1.getDb)();
        const reports = db.collection('reports');
        const report = {
            type,
            subject,
            message,
            email: email || null,
            image,
            status: 'pending', // pending, in_progress, resolved
            created_at: new Date(),
            user_agent: req.headers['user-agent'] || null,
            ip_address: req.ip || null,
        };
        const result = await reports.insertOne(report);
        // Envoyer un email de notification aux administrateurs
        try {
            const typeLabels = {
                bug: '🐛 Bug / Erreur',
                feature: '💡 Suggestion',
                question: '❓ Question',
                info: 'ℹ️ Information'
            };
            await (0, email_1.sendEmail)(process.env.ADMIN_EMAIL || 'admin@simplon.africa', `[Rapport] ${typeLabels[type]} - ${subject}`, `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #E40046;">Nouveau rapport reçu</h2>
            
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Type:</strong> ${typeLabels[type]}</p>
              <p><strong>Sujet:</strong> ${subject}</p>
              ${email ? `<p><strong>Email:</strong> ${email}</p>` : ''}
              <p><strong>Date:</strong> ${new Date().toLocaleString('fr-FR')}</p>
            </div>
            
            <div style="background-color: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
              <h3>Message:</h3>
              <p style="white-space: pre-wrap;">${message}</p>
            </div>
            
            ${image ? `
              <div style="margin-top: 20px;">
                <p><strong>Capture d'écran jointe:</strong> ${image.name}</p>
                <img src="${image.data}" style="max-width: 600px; border: 1px solid #ddd; border-radius: 4px; margin-top: 10px;" />
              </div>
            ` : ''}
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
              <p><strong>Informations techniques:</strong></p>
              <p>User Agent: ${req.headers['user-agent']}</p>
              <p>IP: ${req.ip}</p>
            </div>
          </div>
        `);
        }
        catch (emailError) {
            console.error('Erreur lors de l\'envoi de l\'email:', emailError);
            // Ne pas bloquer la création du rapport si l'email échoue
        }
        // Envoyer un email de confirmation à l'utilisateur s'il a fourni son email
        if (email) {
            try {
                await (0, email_1.sendEmail)(email, 'Confirmation de réception de votre rapport', `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #E40046;">Merci pour votre rapport !</h2>
              
              <p>Nous avons bien reçu votre rapport concernant :</p>
              
              <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Sujet:</strong> ${subject}</p>
              </div>
              
              <p>Notre équipe va l'examiner et vous répondra dans les plus brefs délais.</p>
              
              <p style="margin-top: 30px;">Cordialement,<br>L'équipe Simplon Africa</p>
            </div>
          `);
            }
            catch (emailError) {
                console.error('Erreur lors de l\'envoi de l\'email de confirmation:', emailError);
            }
        }
        return res.status(201).json({
            message: 'Rapport créé avec succès',
            id: result.insertedId.toString()
        });
    }
    catch (error) {
        console.error('Erreur lors de la création du rapport:', error);
        return res.status(500).json({
            message: 'Erreur serveur',
            error: error.message
        });
    }
};
exports.createReport = createReport;
// Lister tous les rapports (admin uniquement)
const listReports = async (req, res) => {
    try {
        const db = await (0, db_1.getDb)();
        const reports = db.collection('reports');
        const list = await reports
            .find({})
            .sort({ created_at: -1 })
            .toArray();
        return res.json(list);
    }
    catch (error) {
        console.error('Erreur lors de la récupération des rapports:', error);
        return res.status(500).json({
            message: 'Erreur serveur',
            error: error.message
        });
    }
};
exports.listReports = listReports;
// Mettre à jour le statut d'un rapport (admin uniquement)
const updateReportStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (!['pending', 'in_progress', 'resolved'].includes(status)) {
            return res.status(400).json({ message: 'Statut invalide' });
        }
        const db = await (0, db_1.getDb)();
        const reports = db.collection('reports');
        const result = await reports.updateOne({ _id: new (require('mongodb').ObjectId)(id) }, { $set: { status, updated_at: new Date() } });
        if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'Rapport non trouvé' });
        }
        return res.json({ message: 'Statut mis à jour avec succès' });
    }
    catch (error) {
        console.error('Erreur lors de la mise à jour du rapport:', error);
        return res.status(500).json({
            message: 'Erreur serveur',
            error: error.message
        });
    }
};
exports.updateReportStatus = updateReportStatus;
