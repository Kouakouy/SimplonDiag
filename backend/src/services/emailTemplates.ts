export const EmailTemplates = {
  newResponse: (formTitle: string, responseData: any) => ({
    subject: `Nouvelle réponse - ${formTitle}`,
    html: `
      <h2>Nouvelle réponse reçue</h2>
      <p>Formulaire: ${formTitle}</p>
      <p>Nom: ${responseData.respondentName}</p>
      <p>Email: ${responseData.respondentEmail}</p>
      <p>Date: ${new Date().toLocaleString('fr-FR')}</p>
    `,
  }),
  weeklyReport: (stats: any) => ({
    subject: 'Rapport hebdomadaire - Simplon Form',
    html: `
      <h2>Rapport hebdomadaire</h2>
      <p>Formulaires créés: ${stats.formsCreated}</p>
      <p>Réponses reçues: ${stats.responsesReceived}</p>
      <p>Taux de complétion moyen: ${stats.avgCompletionRate}%</p>
    `,
  }),
}


