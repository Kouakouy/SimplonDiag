"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailTemplates = void 0;
exports.EmailTemplates = {
    newResponse: (formTitle, responseData) => ({
        subject: `Nouvelle réponse - ${formTitle}`,
        html: `
      <h2>Nouvelle réponse reçue</h2>
      <p>Formulaire: ${formTitle}</p>
      <p>Nom: ${responseData.respondentName}</p>
      <p>Email: ${responseData.respondentEmail}</p>
      <p>Date: ${new Date().toLocaleString('fr-FR')}</p>
    `,
    }),
    weeklyReport: (stats) => ({
        subject: 'Rapport hebdomadaire - Simplon Diag',
        html: `
      <h2>Rapport hebdomadaire</h2>
      <p>Formulaires créés: ${stats.formsCreated}</p>
      <p>Réponses reçues: ${stats.responsesReceived}</p>
      <p>Taux de complétion moyen: ${stats.avgCompletionRate}%</p>
    `,
    }),
    passwordReset: (email, resetToken, appUrl) => ({
        subject: 'Réinitialisation de votre mot de passe - Simplon Diag',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #E40046, #C70039); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Réinitialisation du mot de passe</h1>
          <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Simplon Diag</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-bottom: 20px;">Demande de réinitialisation</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Bonjour,<br><br>
            Vous avez demandé la réinitialisation de votre mot de passe pour votre compte Simplon Diag.
          </p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #E40046;">
            <h3 style="color: #E40046; margin: 0 0 10px 0;">Sécurité de votre compte</h3>
            <p style="color: #666; margin: 0; font-size: 14px;">
              Si vous n'avez pas demandé cette réinitialisation, ignorez cet email. Votre mot de passe restera inchangé.
            </p>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 30px;">
            Pour définir un nouveau mot de passe, cliquez sur le bouton ci-dessous :
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${appUrl}/auth/reset-password/${resetToken}" 
               style="background: linear-gradient(135deg, #E40046, #C70039); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 8px; 
                      font-weight: bold; 
                      display: inline-block;
                      box-shadow: 0 4px 6px rgba(228, 0, 70, 0.3);">
              Réinitialiser mon mot de passe
            </a>
          </div>
          
          <div style="background: #fff3cd; padding: 15px; border-radius: 6px; margin: 20px 0; border: 1px solid #ffeaa7;">
            <p style="color: #856404; margin: 0; font-size: 14px;">
              <strong>Note :</strong> Ce lien est valide pendant 24 heures. Après expiration, vous devrez refaire une demande de réinitialisation.
            </p>
          </div>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
            Si vous ne pouvez pas cliquer sur le bouton, copiez et collez ce lien dans votre navigateur :<br>
            <a href="${appUrl}/auth/reset-password/${resetToken}" style="color: #E40046; word-break: break-all;">
              ${appUrl}/auth/reset-password/${resetToken}
            </a>
          </p>
        </div>
      </div>
    `,
    }),
    userInvitation: (email, role, invitationToken, appUrl) => ({
        subject: 'Invitation à rejoindre Simplon Diag',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #E40046, #C70039); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Bienvenue sur Simplon Form</h1>
          <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Plateforme de gestion de formulaires</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-bottom: 20px;">Invitation à rejoindre l'équipe</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Bonjour,<br><br>
            Vous avez été invité à rejoindre la plateforme Simplon Form en tant que <strong>${role === 'admin' ? 'Administrateur' : role === 'observer' ? 'Observateur' : 'Créateur'}</strong>.
          </p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #E40046;">
            <h3 style="color: #E40046; margin: 0 0 10px 0;">Votre rôle : ${role === 'admin' ? 'Administrateur' : role === 'observer' ? 'Observateur' : 'Créateur'}</h3>
            <p style="color: #666; margin: 0; font-size: 14px;">
              ${role === 'admin' ? 'Accès complet à toutes les fonctionnalités de la plateforme' :
            role === 'observer' ? 'Accès en lecture seule aux formulaires et statistiques' :
                'Création et gestion de vos propres formulaires'}
            </p>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 30px;">
            Pour activer votre compte et définir votre mot de passe, cliquez sur le bouton ci-dessous :
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${appUrl}/auth/complete-profile?token=${invitationToken}" 
               style="background: linear-gradient(135deg, #E40046, #C70039); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 8px; 
                      font-weight: bold; 
                      display: inline-block;
                      box-shadow: 0 4px 6px rgba(228, 0, 70, 0.3);">
              Compléter mon profil
            </a>
          </div>
          
          <div style="background: #fff3cd; padding: 15px; border-radius: 6px; margin: 20px 0; border: 1px solid #ffeaa7;">
            <p style="color: #856404; margin: 0; font-size: 14px;">
              <strong>Note :</strong> Ce lien est valide pendant 7 jours. Si vous ne complétez pas votre profil dans ce délai, contactez votre administrateur.
            </p>
          </div>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
            Si vous ne pouvez pas cliquer sur le bouton, copiez et collez ce lien dans votre navigateur :<br>
            <a href="${appUrl}/auth/complete-profile?token=${invitationToken}" style="color: #E40046; word-break: break-all;">
              ${appUrl}/auth/complete-profile?token=${invitationToken}
            </a>
          </p>
        </div>
      </div>
    `,
    }),
};
