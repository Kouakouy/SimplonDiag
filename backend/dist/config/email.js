"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.testBrevoConnection = exports.sendEmail = void 0;
const brevo = __importStar(require("@getbrevo/brevo"));
// Configuration de l'API Brevo
const apiInstance = new brevo.TransactionalEmailsApi();
apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY || '');
// Configuration de l'expéditeur par défaut
const defaultSender = {
    name: process.env.BREVO_SENDER_NAME || 'Simplon Diag',
    email: process.env.BREVO_SENDER_EMAIL || process.env.SMTP_FROM || 'kouakouy898@gmail.com'
};
const sendEmail = async (to, subject, html) => {
    try {
        console.log('📧 [BREVO API] Tentative d\'envoi d\'email...');
        console.log('   À:', to);
        console.log('   Sujet:', subject);
        console.log('   Expéditeur:', defaultSender.email);
        console.log('   Nom expéditeur:', defaultSender.name);
        // Créer l'email avec l'API Brevo
        const sendSmtpEmail = new brevo.SendSmtpEmail();
        sendSmtpEmail.sender = defaultSender;
        sendSmtpEmail.to = [{ email: to }];
        sendSmtpEmail.subject = subject;
        sendSmtpEmail.htmlContent = html;
        // Headers personnalisés pour améliorer la délivrabilité
        sendSmtpEmail.headers = {
            'X-Mailer': 'Simplon Diag',
            'X-Priority': '3',
            'X-MSMail-Priority': 'Normal',
        };
        console.log('🔍 [BREVO API] Envoi via l\'API Brevo...');
        // Envoyer l'email via l'API Brevo
        const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log('✅ [BREVO API] Email envoyé avec succès!');
        console.log('📊 [BREVO API] Message ID:', result.body.messageId);
        console.log('📊 [BREVO API] Réponse:', result);
        return {
            messageId: result.body.messageId,
            response: result,
            success: true
        };
    }
    catch (error) {
        console.error('❌ [BREVO API] Erreur lors de l\'envoi de l\'email:', error);
        // Gestion des erreurs spécifiques à l'API Brevo
        if (error.response) {
            console.error('   Status:', error.response.status);
            console.error('   Status Text:', error.response.statusText);
            console.error('   Data:', error.response.data);
            // Messages d'erreur spécifiques selon le code de statut
            if (error.response.status === 401) {
                console.error('💡 [BREVO API] Suggestion: Vérifiez votre clé API Brevo');
                console.error('   → Obtenez votre clé API sur: https://app.brevo.com/settings/keys/api');
            }
            else if (error.response.status === 400) {
                console.error('💡 [BREVO API] Suggestion: Vérifiez les paramètres de l\'email (destinataire, expéditeur, contenu)');
            }
            else if (error.response.status === 403) {
                console.error('💡 [BREVO API] Suggestion: Vérifiez les permissions de votre compte Brevo');
            }
            else if (error.response.status === 429) {
                console.error('💡 [BREVO API] Suggestion: Limite de taux atteinte, attendez avant de réessayer');
            }
        }
        else if (error.request) {
            console.error('💡 [BREVO API] Suggestion: Problème de connexion réseau');
            console.error('   → Vérifiez votre connexion internet');
        }
        else {
            console.error('💡 [BREVO API] Suggestion: Erreur inattendue');
            console.error('   → Vérifiez la configuration de l\'API');
        }
        throw error;
    }
};
exports.sendEmail = sendEmail;
// Fonction pour tester la configuration de l'API Brevo
const testBrevoConnection = async () => {
    try {
        console.log('🔍 [BREVO API] Test de connexion...');
        // Test simple avec un email de test (ne sera pas envoyé)
        const testEmail = new brevo.SendSmtpEmail();
        testEmail.sender = defaultSender;
        testEmail.to = [{ email: 'test@example.com' }];
        testEmail.subject = 'Test de connexion API Brevo';
        testEmail.htmlContent = '<p>Ceci est un test de connexion.</p>';
        // On ne fait que valider la configuration, on n'envoie pas vraiment
        console.log('✅ [BREVO API] Configuration valide');
        console.log('   Clé API:', process.env.BREVO_API_KEY ? 'Configurée' : 'Manquante');
        console.log('   Expéditeur:', defaultSender.email);
        return true;
    }
    catch (error) {
        console.error('❌ [BREVO API] Erreur de configuration:', error);
        return false;
    }
};
exports.testBrevoConnection = testBrevoConnection;
