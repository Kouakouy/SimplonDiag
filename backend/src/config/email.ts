import nodemailer from 'nodemailer'

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_PORT === '465', // true pour le port 465, false pour les autres
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    // Ne pas échouer sur des certificats invalides
    rejectUnauthorized: false,
    // Support des anciens serveurs SMTP
    ciphers: 'SSLv3',
  },
  // Options de connexion pour éviter les timeouts
  connectionTimeout: 60000, // 60 secondes
  greetingTimeout: 30000,   // 30 secondes
  socketTimeout: 60000,     // 60 secondes
  // Retry en cas d'échec
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
  rateLimit: 10, // max 10 emails par seconde
})

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    console.log('📧 Tentative d\'envoi d\'email...')
    console.log('   À:', to)
    console.log('   Sujet:', subject)
    console.log('   SMTP Host:', process.env.SMTP_HOST)
    console.log('   SMTP Port:', process.env.SMTP_PORT)
    console.log('   SMTP User:', process.env.SMTP_USER)
    console.log('   SMTP From:', process.env.SMTP_FROM)
    console.log('   Secure:', process.env.SMTP_PORT === '465')
    
    // Vérifier la connexion avant d'envoyer
    await transporter.verify()
    console.log('✅ Connexion SMTP vérifiée avec succès')
    
    const result = await transporter.sendMail({ 
      from: process.env.SMTP_FROM, 
      to, 
      subject, 
      html 
    })
    
    console.log('✅ Email envoyé avec succès:', result.messageId)
    return result
  } catch (error: any) {
    console.error('❌ Erreur lors de l\'envoi de l\'email:', error)
    console.error('   Code d\'erreur:', error.code)
    console.error('   Commande:', error.command)
    console.error('   Message:', error.message)
    
    // Suggestions selon le type d'erreur
    if (error.code === 'ETIMEDOUT') {
      console.error('💡 Suggestion: Vérifiez la configuration SMTP et la connectivité réseau')
    } else if (error.code === 'EAUTH') {
      console.error('💡 Suggestion: Vérifiez les identifiants SMTP (user/pass)')
    } else if (error.code === 'ECONNECTION') {
      console.error('💡 Suggestion: Vérifiez l\'hôte et le port SMTP')
    }
    
    throw error
  }
}


