// Types pour la plateforme de formulaires
export interface Question {
  id: string
  categoryId: string // ID de la catégorie de question
  type: "text" | "email" | "select" | "radio" | "checkbox" | "textarea" | "number" | "date" | "time" | "rating" | "file"
  title: string
  description?: string
  required: boolean
  position?: number // Position dans le formulaire (pour l'ordre d'affichage)
  options?: string[] // Pour les questions à choix multiples
  placeholder?: string
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
  isMultipleChoice?: boolean
}

export interface Form {
  id: string
  title: string
  description: string
  bannerTitle?: string
  bannerImageUrl?: string
  publicSlug?: string
  questions: Question[]
  isPublic: boolean
  expirationDate?: Date
  maxResponses?: number
  createdAt: Date
  updatedAt: Date
  responses: FormResponse[]
}

export interface FormResponse {
  id: string
  formId: string
  respondentName: string
  respondentEmail: string
  answers: Record<string, string | string[]>
  submittedAt: Date
}

export interface FormStats {
  totalForms: number
  createdToday: number
  createdThisWeek: number
  totalResponses: number
  responseRate: number
}
