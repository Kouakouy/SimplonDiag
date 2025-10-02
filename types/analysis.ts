// Types pour l'analyse IA des formulaires

export interface AnalysisInsight {
  id: string
  title: string
  description: string
  confidence: number
  category: 'trend' | 'pattern' | 'recommendation' | 'warning'
}

export interface AnalysisChart {
  id: string
  questionId: string
  questionTitle: string
  type: 'bar' | 'pie' | 'line' | 'doughnut'
  data: Array<{
    label: string
    value: number
    percentage: number
    color?: string
  }>
}

export interface AnalysisTrend {
  questionId: string
  questionTitle: string
  trend: string
  confidence: number
  direction: 'up' | 'down' | 'stable'
  impact: 'high' | 'medium' | 'low'
}

export interface AnalysisRecommendation {
  id: string
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  category: 'form_improvement' | 'targeting' | 'content' | 'process'
}

export interface FormAnalysis {
  id: string
  formId: string
  summary: string
  insights: AnalysisInsight[]
  trends: AnalysisTrend[]
  recommendations: AnalysisRecommendation[]
  charts: AnalysisChart[]
  metadata: {
    totalResponses: number
    analysisDate: string
    processingTime: number
    confidence: number
  }
  rawData?: any // Données brutes de DeepSeek
  createdAt?: string // Date de création pour les analyses sauvegardées
  customPrompt?: string // Prompt personnalisé utilisé
  formTitle?: string // Titre du formulaire pour les analyses sauvegardées
}

export interface AnalysisRequest {
  formId: string
  includeCharts?: boolean
  includeRecommendations?: boolean
  analysisDepth?: 'basic' | 'detailed' | 'comprehensive'
  customPrompt?: string // Prompt personnalisé pour l'analyse
}

export interface AnalysisResponse {
  success: boolean
  analysis?: FormAnalysis
  error?: string
  processingTime?: number
}
