"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = exports.transporter = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
exports.transporter = nodemailer_1.default.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});
const sendEmail = async (to, subject, html) => {
    try {
        console.log('📧 Tentative d\'envoi d\'email...');
        console.log('   À:', to);
        console.log('   Sujet:', subject);
        console.log('   SMTP Host:', process.env.SMTP_HOST);
        console.log('   SMTP User:', process.env.SMTP_USER);
        console.log('   SMTP From:', process.env.SMTP_FROM);
        const result = await exports.transporter.sendMail({
            from: process.env.SMTP_FROM,
            to,
            subject,
            html
        });
        console.log('✅ Email envoyé avec succès:', result.messageId);
        return result;
    }
    catch (error) {
        console.error('❌ Erreur lors de l\'envoi de l\'email:', error);
        throw error;
    }
};
exports.sendEmail = sendEmail;
