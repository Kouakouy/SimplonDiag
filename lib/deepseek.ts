// Service pour l'API DeepSeek
export interface DeepSeekAnalysisRequest {
  formTitle: string
  formDescription?: string
  questions: Array<{
    id: string
    title: string
    type: string
    options?: string[]
  }>
  responses: Array<{
    id: string
    answers: Record<string, string | string[]>
    submittedAt: string
  }>
}

export interface DeepSeekAnalysisResponse {
  summary: string
  insights: string[]
  trends: Array<{
    questionId: string
    questionTitle: string
    trend: string
    confidence: number
  }>
  recommendations: string[]
  charts: Array<{
    questionId: string
    questionTitle: string
    type: string
    data: Array<{
      label: string
      value: number
      percentage: number
    }>
  }>
}

export class DeepSeekService {
  private apiKey: string
  private baseUrl = 'https://api.deepseek.com/v1'

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY || ''
  }

  async analyzeFormData(request: DeepSeekAnalysisRequest): Promise<DeepSeekAnalysisResponse> {
    if (!this.apiKey) {
      throw new Error('API key DeepSeek non configurée')
    }

    // Préparer les données pour l'analyse
    const analysisPrompt = this.buildAnalysisPrompt(request)
    
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: `Tu es un expert en analyse de données de formulaires. Tu dois analyser les réponses d'un formulaire et fournir des insights, tendances et recommandations basés sur les données collectées. Réponds UNIQUEMENT en JSON valide selon le format spécifié.`
            },
            {
              role: 'user',
              content: analysisPrompt
            }
          ],
          temperature: 0.3,
          max_tokens: 2000
        })
      })

      if (!response.ok) {
        throw new Error(`Erreur API DeepSeek: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      const content = data.choices[0]?.message?.content

      if (!content) {
        throw new Error('Réponse vide de l\'API DeepSeek')
      }

      // Parser la réponse JSON
      try {
        return JSON.parse(content)
      } catch (parseError) {
        // Si le parsing échoue, essayer d'extraire le JSON du texte
        const jsonMatch = content.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0])
        }
        throw new Error('Impossible de parser la réponse JSON de DeepSeek')
      }
    } catch (error) {
      console.error('Erreur lors de l\'analyse DeepSeek:', error)
      throw error
    }
  }

  private buildAnalysisPrompt(request: DeepSeekAnalysisRequest): string {
    const { formTitle, formDescription, questions, responses } = request

    // Analyser les réponses par question
    const questionAnalysis = questions.map(q => {
      const questionResponses = responses.map(r => r.answers[q.id]).filter(Boolean)
      const responseCounts: Record<string, number> = {}
      
      questionResponses.forEach(response => {
        if (Array.isArray(response)) {
          response.forEach(item => {
            responseCounts[item] = (responseCounts[item] || 0) + 1
          })
        } else {
          responseCounts[response] = (responseCounts[response] || 0) + 1
        }
      })

      return {
        questionId: q.id,
        questionTitle: q.title,
        questionType: q.type,
        responseCounts,
        totalResponses: questionResponses.length
      }
    })

    return `
Tu es un expert en analyse de données de formulaires. Tu dois analyser les réponses d'un formulaire et fournir des insights, tendances et recommandations basés sur les données collectées. Réponds UNIQUEMENT en JSON valide selon le format spécifié.

FORMULAIRE: "${formTitle}"
DESCRIPTION: "${formDescription || 'Aucune description'}"

QUESTIONS ET RÉPONSES:
${JSON.stringify(questionAnalysis, null, 2)}

RÉPONSES COMPLÈTES (${responses.length} réponses):
${JSON.stringify(responses.slice(0, 10), null, 2)}${responses.length > 10 ? '\n... (autres réponses similaires)' : ''}

ANALYSE REQUISE:
En tant qu'expert, analyse ces réponses comme si tu corrigeais un examen. Identifie:
- Les bonnes réponses et les tendances positives
- Les problèmes récurrents et les erreurs communes
- Les incohérences dans les réponses
- Les opportunités d'amélioration
- Les recommandations concrètes pour améliorer le formulaire

Fournis une analyse en JSON avec cette structure exacte :
{
  "summary": "Résumé exécutif de l'analyse en 2-3 phrases, comme un correcteur qui donne son verdict global",
  "insights": [
    "Insight 1: Correction positive - ce qui fonctionne bien dans les réponses",
    "Insight 2: Problème identifié - erreur ou incohérence observée",
    "Insight 3: Tendance remarquable - pattern intéressant dans les données"
  ],
  "trends": [
    {
      "questionId": "id_question",
      "questionTitle": "Titre de la question",
      "trend": "Description de la tendance observée avec évaluation (ex: '75% des répondants choisissent l'option A, ce qui indique...')",
      "confidence": 0.85
    }
  ],
  "recommendations": [
    "Recommandation 1: Action concrète pour améliorer le formulaire basée sur l'analyse",
    "Recommandation 2: Suggestion d'amélioration des questions ou du format"
  ],
  "charts": [
    {
      "questionId": "id_question",
      "questionTitle": "Titre de la question",
      "type": "bar|pie|line",
      "data": [
        {
          "label": "Option 1",
          "value": 15,
          "percentage": 60.0
        }
      ]
    }
  ]
}

IMPORTANT: Réponds UNIQUEMENT avec le JSON valide, sans texte supplémentaire. Sois précis et actionnable dans tes analyses.
`
  }

  // Méthode pour tester la connexion
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        }
      })
      return response.ok
    } catch {
      return false
    }
  }
}

// Instance singleton
export const deepSeekService = new DeepSeekService()
