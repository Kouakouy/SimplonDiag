// Catégories de questions prédéfinies avec toute la logique nécessaire
export interface QuestionCategory {
  id: string
  name: string
  description: string
  icon: string
  type: "text" | "email" | "select" | "radio" | "checkbox" | "textarea" | "number" | "date" | "rating" | "file"
  isMultipleChoice: boolean
  hasOptions: boolean
  defaultOptions?: string[]
  validationRules?: {
    required?: boolean
    minLength?: number
    maxLength?: number
    pattern?: string
    min?: number
    max?: number
  }
  conditionalLogic?: {
    showIf?: {
      questionId: string
      operator: "equals" | "not_equals" | "contains" | "not_contains"
      value: string
    }[]
    hideIf?: {
      questionId: string
      operator: "equals" | "not_equals" | "contains" | "not_contains"
      value: string
    }[]
  }
}

export const QUESTION_CATEGORIES: QuestionCategory[] = [
  // Informations personnelles
  {
    id: "personal-info",
    name: "Informations personnelles",
    description: "Collecte des données personnelles de base",
    icon: "👤",
    type: "text",
    isMultipleChoice: false,
    hasOptions: false,
    validationRules: {
      required: true,
      minLength: 2,
      maxLength: 100
    }
  },
  {
    id: "email-contact",
    name: "Email de contact",
    description: "Adresse email pour les communications",
    icon: "📧",
    type: "email",
    isMultipleChoice: false,
    hasOptions: false,
    validationRules: {
      required: true,
      pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
    }
  },
  {
    id: "phone-number",
    name: "Numéro de téléphone",
    description: "Numéro de téléphone pour contact",
    icon: "📞",
    type: "text",
    isMultipleChoice: false,
    hasOptions: false,
    validationRules: {
      required: false,
      pattern: "^[0-9+\\s\\-\\(\\)]{10,}$"
    }
  },

  // Choix uniques
  {
    id: "single-choice",
    name: "Choix unique",
    description: "Une seule réponse possible parmi plusieurs options",
    icon: "🔘",
    type: "radio",
    isMultipleChoice: false,
    hasOptions: true,
    defaultOptions: ["Option 1", "Option 2", "Option 3"],
    validationRules: {
      required: true
    }
  },
  {
    id: "dropdown-single",
    name: "Liste déroulante",
    description: "Sélection unique dans une liste déroulante",
    icon: "📋",
    type: "select",
    isMultipleChoice: false,
    hasOptions: true,
    defaultOptions: ["Option 1", "Option 2", "Option 3"],
    validationRules: {
      required: true
    }
  },

  // Choix multiples
  {
    id: "multiple-choice",
    name: "Choix multiples",
    description: "Plusieurs réponses possibles",
    icon: "☑️",
    type: "checkbox",
    isMultipleChoice: true,
    hasOptions: true,
    defaultOptions: ["Option 1", "Option 2", "Option 3"],
    validationRules: {
      required: false
    }
  },

  // Texte
  {
    id: "short-text",
    name: "Texte court",
    description: "Réponse courte en une ligne",
    icon: "📝",
    type: "text",
    isMultipleChoice: false,
    hasOptions: false,
    validationRules: {
      required: false,
      maxLength: 255
    }
  },
  {
    id: "long-text",
    name: "Texte long",
    description: "Réponse détaillée sur plusieurs lignes",
    icon: "📄",
    type: "textarea",
    isMultipleChoice: false,
    hasOptions: false,
    validationRules: {
      required: false,
      maxLength: 2000
    }
  },

  // Numériques
  {
    id: "number",
    name: "Nombre",
    description: "Valeur numérique",
    icon: "🔢",
    type: "number",
    isMultipleChoice: false,
    hasOptions: false,
    validationRules: {
      required: false,
      min: 0,
      max: 999999
    }
  },
  {
    id: "rating",
    name: "Évaluation",
    description: "Note sur une échelle",
    icon: "⭐",
    type: "rating",
    isMultipleChoice: false,
    hasOptions: false,
    defaultOptions: ["1", "2", "3", "4", "5"],
    validationRules: {
      required: true,
      min: 1,
      max: 5
    }
  },

  // Dates et fichiers
  {
    id: "date",
    name: "Date",
    description: "Sélection d'une date",
    icon: "📅",
    type: "date",
    isMultipleChoice: false,
    hasOptions: false,
    validationRules: {
      required: false
    }
  },
  {
    id: "file-upload",
    name: "Fichier",
    description: "Upload de fichier",
    icon: "📎",
    type: "file",
    isMultipleChoice: false,
    hasOptions: false,
    validationRules: {
      required: false
    }
  },

  // Questions conditionnelles
  {
    id: "conditional-yes-no",
    name: "Oui/Non conditionnel",
    description: "Question Oui/Non qui peut déclencher d'autres questions",
    icon: "❓",
    type: "radio",
    isMultipleChoice: false,
    hasOptions: true,
    defaultOptions: ["Oui", "Non"],
    validationRules: {
      required: true
    },
    conditionalLogic: {
      showIf: [
        {
          questionId: "",
          operator: "equals",
          value: "Oui"
        }
      ]
    }
  },

  // Satisfaction
  {
    id: "satisfaction-scale",
    name: "Échelle de satisfaction",
    description: "Évaluation de satisfaction sur une échelle",
    icon: "😊",
    type: "radio",
    isMultipleChoice: false,
    hasOptions: true,
    defaultOptions: ["Très insatisfait", "Insatisfait", "Neutre", "Satisfait", "Très satisfait"],
    validationRules: {
      required: true
    }
  },

  // Fréquence
  {
    id: "frequency",
    name: "Fréquence",
    description: "À quelle fréquence faites-vous quelque chose",
    icon: "🔄",
    type: "radio",
    isMultipleChoice: false,
    hasOptions: true,
    defaultOptions: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    validationRules: {
      required: true
    }
  }
]

// Fonction pour obtenir une catégorie par ID
export function getQuestionCategory(categoryId: string): QuestionCategory | undefined {
  return QUESTION_CATEGORIES.find(category => category.id === categoryId)
}

// Fonction pour obtenir les catégories par type
export function getCategoriesByType(type: string): QuestionCategory[] {
  return QUESTION_CATEGORIES.filter(category => category.type === type)
}

// Fonction pour obtenir les catégories avec options
export function getCategoriesWithOptions(): QuestionCategory[] {
  return QUESTION_CATEGORIES.filter(category => category.hasOptions)
}

// Fonction pour obtenir les catégories de choix multiples
export function getMultipleChoiceCategories(): QuestionCategory[] {
  return QUESTION_CATEGORIES.filter(category => category.isMultipleChoice)
}
