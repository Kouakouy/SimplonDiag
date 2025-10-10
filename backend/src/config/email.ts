import nodemailer from 'nodemailer'

export const transporter = nodemailer.createTransport({
  // Configuration optimisée pour Brevo (ex-Sendinblue)
  host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_PORT === '465', // true pour le port 465 (SSL), false pour 587 (TLS)
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS, // Utilisez votre clé SMTP Brevo
  },
  tls: {
    // Configuration TLS optimisée pour Brevo
    rejectUnauthorized: true, // Brevo utilise des certificats valides
    ciphers: 'TLSv1.2', // Support TLS moderne
    minVersion: 'TLSv1.2',
    maxVersion: 'TLSv1.3',
  },
  // Options de connexion optimisées pour Brevo
  connectionTimeout: 30000, // 30 secondes (Brevo est rapide)
  greetingTimeout: 15000,  // 15 secondes
  socketTimeout: 30000,    // 30 secondes
  // Pool de connexions pour Brevo
  pool: true,
  maxConnections: 3, // Brevo limite à 3 connexions simultanées
  maxMessages: 50,   // 50 messages par connexion
  rateLimit: 5,      // 5 emails par seconde (respecter les limites Brevo)
  // Options spécifiques Brevo
  debug: process.env.NODE_ENV === 'development', // Debug en dev
  logger: process.env.NODE_ENV === 'development', // Logs en dev
})

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    console.log('📧 [BREVO] Tentative d\'envoi d\'email...')
    console.log('   À:', to)
    console.log('   Sujet:', subject)
    console.log('   SMTP Host:', process.env.SMTP_HOST || 'smtp-relay.brevo.com')
    console.log('   SMTP Port:', process.env.SMTP_PORT || '587')
    console.log('   SMTP User:', process.env.SMTP_USER)
    console.log('   SMTP From:', process.env.SMTP_FROM)
    console.log('   Mode:', process.env.SMTP_PORT === '465' ? 'SSL' : 'TLS')
    
    // Vérifier la connexion Brevo avant d'envoyer
    console.log('🔍 [BREVO] Vérification de la connexion...')
    await transporter.verify()
    console.log('✅ [BREVO] Connexion vérifiée avec succès')
    
    const result = await transporter.sendMail({ 
      from: process.env.SMTP_FROM, 
      to, 
      subject, 
      html,
      // Headers spécifiques Brevo pour améliorer la délivrabilité
      headers: {
        'X-Mailer': 'Simplon Diag',
        'X-Priority': '3',
        'X-MSMail-Priority': 'Normal',
      }
    })
    
    console.log('✅ [BREVO] Email envoyé avec succès:', result.messageId)
    console.log('📊 [BREVO] Réponse:', result.response)
    return result
  } catch (error: any) {
    console.error('❌ [BREVO] Erreur lors de l\'envoi de l\'email:', error)
    console.error('   Code d\'erreur:', error.code)
    console.error('   Commande:', error.command)
    console.error('   Message:', error.message)
    
    // Suggestions spécifiques Brevo
    if (error.code === 'ETIMEDOUT') {
      console.error('💡 [BREVO] Suggestion: Vérifiez votre connexion internet et les paramètres SMTP')
    } else if (error.code === 'EAUTH') {
      console.error('💡 [BREVO] Suggestion: Vérifiez votre email Brevo et votre clé SMTP')
      console.error('   → Obtenez votre clé SMTP sur: https://app.brevo.com/settings/keys/api')
    } else if (error.code === 'ECONNECTION') {
      console.error('💡 [BREVO] Suggestion: Vérifiez l\'hôte (smtp-relay.brevo.com) et le port (587)')
    } else if (error.code === 'EENVELOPE') {
      console.error('💡 [BREVO] Suggestion: Vérifiez l\'adresse email de l\'expéditeur (SMTP_FROM)')
    }
    
    throw error
  }
}


