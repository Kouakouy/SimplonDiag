// Données de test pour la plateforme
import type { Form, FormResponse, FormStats } from "@/types/form"

export const mockForms: Form[] = [
  {
    id: "1",
    title: "Enquête de satisfaction client",
    description: "Aidez-nous à améliorer nos services",
    isPublic: true,
    createdAt: new Date("2025-09-08"),
    updatedAt: new Date("2025-09-10"),
    questions: [
      {
        id: "q1",
        type: "text",
        title: "Votre nom complet",
        required: true,
        placeholder: "Entrez votre nom",
      },
      {
        id: "q2",
        type: "email",
        title: "Votre adresse email",
        required: true,
        placeholder: "exemple@email.com",
      },
      {
        id: "q3",
        type: "radio",
        title: "Comment évaluez-vous notre service ?",
        required: true,
        options: ["Excellent", "Très bien", "Bien", "Moyen", "Mauvais"],
      },
      {
        id: "q4",
        type: "textarea",
        title: "Commentaires supplémentaires",
        required: false,
        placeholder: "Partagez vos suggestions...",
      },
    ],
    responses: [],
  },
  {
    id: "2",
    title: "Formulaire sans titre",
    description: "Formulaire sans description",
    isPublic: false,
    createdAt: new Date("2025-09-10"),
    updatedAt: new Date("2025-09-10"),
    questions: [],
    responses: [],
  },
]

export const mockStats: FormStats = {
  totalForms: 4,
  createdToday: 1,
  createdThisWeek: 1,
  totalResponses: 0,
  responseRate: 0,
}

export const mockResponses: FormResponse[] = [
  {
    id: "r1",
    formId: "1",
    respondentName: "Kouassi Jean",
    respondentEmail: "kouassi.jean@email.com",
    answers: {
      q1: "Kouassi Jean",
      q2: "kouassi.jean@email.com",
      q3: "Excellent",
      q4: "Très bon service, continuez ainsi !",
    },
    submittedAt: new Date("2025-09-09T14:30:00"),
  },
  {
    id: "r2",
    formId: "1",
    respondentName: "Traoré Aminata",
    respondentEmail: "traore.aminata@email.com",
    answers: {
      q1: "Traoré Aminata",
      q2: "traore.aminata@email.com",
      q3: "Très bien",
      q4: "Service rapide et efficace",
    },
    submittedAt: new Date("2025-09-09T16:45:00"),
  },
  {
    id: "r3",
    formId: "1",
    respondentName: "Ouattara Ibrahim",
    respondentEmail: "ouattara.ibrahim@email.com",
    answers: {
      q1: "Ouattara Ibrahim",
      q2: "ouattara.ibrahim@email.com",
      q3: "Bien",
      q4: "Quelques améliorations possibles mais globalement satisfait",
    },
    submittedAt: new Date("2025-09-10T09:15:00"),
  },
]
