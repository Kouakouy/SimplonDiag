// Script de test pour vérifier la configuration email
const nodemailer = require('nodemailer');
require('dotenv').config();

async function testEmailConfiguration() {
  console.log('🧪 Test de la configuration email\n');
  
  // Vérifier les variables d'environnement
  console.log('📋 Variables d\'environnement:');
  console.log('   SMTP_HOST:', process.env.SMTP_HOST || 'NON DÉFINI');
  console.log('   SMTP_PORT:', process.env.SMTP_PORT || 'NON DÉFINI');
  console.log('   SMTP_USER:', process.env.SMTP_USER || 'NON DÉFINI');
  console.log('   SMTP_PASS:', process.env.SMTP_PASS ? '***' : 'NON DÉFINI');
  console.log('   SMTP_FROM:', process.env.SMTP_FROM || 'NON DÉFINI');
  console.log('   APP_URL:', process.env.APP_URL || 'NON DÉFINI');
  console.log('');
  
  // Vérifier si toutes les variables sont définies
  const requiredVars = ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.log('❌ Variables d\'environnement manquantes:', missingVars.join(', '));
    console.log('\n📝 Veuillez définir ces variables dans votre fichier .env:');
    missingVars.forEach(varName => {
      console.log(`   ${varName}=votre_valeur`);
    });
    return;
  }
  
  // Créer le transporteur
  console.log('🔧 Création du transporteur email...');
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  
  // Tester la connexion
  console.log('🔌 Test de connexion SMTP...');
  try {
    await transporter.verify();
    console.log('✅ Connexion SMTP réussie\n');
  } catch (error) {
    console.log('❌ Échec de la connexion SMTP:', error.message);
    console.log('\n💡 Solutions possibles:');
    console.log('   - Vérifiez vos identifiants SMTP');
    console.log('   - Activez l\'authentification à 2 facteurs et utilisez un mot de passe d\'application');
    console.log('   - Vérifiez que le port SMTP est correct');
    return;
  }
  
  // Envoyer un email de test
  console.log('📧 Envoi d\'un email de test...');
  const testEmail = process.env.SMTP_USER; // Envoyer à soi-même pour le test
  
  try {
    const result = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: testEmail,
      subject: 'Test Simplon Diag - Configuration Email',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #E40046, #C70039); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Test Email Simplon Diag</h1>
            <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Configuration email fonctionnelle</p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-bottom: 20px;">✅ Configuration Email Validée</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Félicitations ! Votre configuration email fonctionne correctement.
            </p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #E40046;">
              <h3 style="color: #E40046; margin: 0 0 10px 0;">Détails de la configuration</h3>
              <p style="color: #666; margin: 0; font-size: 14px;">
                Serveur SMTP: ${process.env.SMTP_HOST}<br>
                Port: ${process.env.SMTP_PORT || '587'}<br>
                Utilisateur: ${process.env.SMTP_USER}<br>
                Expéditeur: ${process.env.SMTP_FROM}
              </p>
            </div>
            
            <p style="color: #666; line-height: 1.6;">
              Vous pouvez maintenant utiliser le système d'invitation d'utilisateurs.
            </p>
          </div>
        </div>
      `
    });
    
    console.log('✅ Email de test envoyé avec succès');
    console.log('   Message ID:', result.messageId);
    console.log('   Destinataire:', testEmail);
    console.log('\n📬 Vérifiez votre boîte email pour confirmer la réception.');
    
  } catch (error) {
    console.log('❌ Erreur lors de l\'envoi de l\'email de test:', error.message);
    console.log('\n💡 Solutions possibles:');
    console.log('   - Vérifiez que l\'adresse email destinataire est valide');
    console.log('   - Vérifiez les paramètres SMTP');
    console.log('   - Vérifiez que votre fournisseur email autorise l\'envoi depuis cette application');
  }
}

// Exécuter le test
testEmailConfiguration();
