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
};
