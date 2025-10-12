import { sendEmail, testBrevoConnection } from './src/config/email.js'
import dotenv from 'dotenv'

// Charger les variables d'environnement
dotenv.config({ path: './env' })

async function testBrevoAPI() {
  console.log('🧪 Test de l\'API Brevo')
  console.log('========================')
  
  // Test de connexion
  console.log('\n1. Test de connexion...')
  const connectionTest = await testBrevoConnection()
  
  if (!connectionTest) {
    console.error('❌ Test de connexion échoué')
    return
  }
  
  // Test d'envoi d'email
  console.log('\n2. Test d\'envoi d\'email...')
  try {
    const testEmail = {
      to: 'lordwhite863@gmail.com', // Email de test
      subject: 'Test API Brevo - Simplon Diag',
      html: `
        <h2>Test de l'API Brevo</h2>
        <p>Ceci est un email de test envoyé via l'API Brevo.</p>
        <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Service:</strong> Simplon Diag</p>
        <hr>
        <p><em>Si vous recevez cet email, l'API Brevo fonctionne correctement !</em></p>
      `
    }
    
    const result = await sendEmail(testEmail.to, testEmail.subject, testEmail.html)
    
    if (result.success) {
      console.log('✅ Email de test envoyé avec succès!')
      console.log('   Message ID:', result.messageId)
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test d\'envoi:', error.message)
  }
  
  console.log('\n========================')
  console.log('🏁 Test terminé')
}

// Exécuter le test
testBrevoAPI().catch(console.error)
