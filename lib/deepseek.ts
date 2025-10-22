// Service pour l'API DeepSeek - Version optimisée pour l'analyse ciblée
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
  customPrompt?: string
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
  private maxTokens: number

  constructor(apiKey?: string, maxTokens: number = 4000) {
    this.apiKey = apiKey || process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY || ''
    this.maxTokens = maxTokens
  }

  async analyzeFormData(request: DeepSeekAnalysisRequest): Promise<DeepSeekAnalysisResponse> {
    if (!this.apiKey) {
      throw new Error('API key DeepSeek non configurée')
    }

    // Vérifier la disponibilité de l'API avant de commencer
    const isAvailable = await this.checkAvailability()
    if (!isAvailable) {
      throw new Error('Impossible d\'utiliser la fonction IA pour le moment, essayez plus tard')
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
          max_tokens: this.maxTokens
        })
      })

      if (!response.ok) {
        // Gestion spécifique des erreurs HTTP
        if (response.status === 401) {
          throw new Error('Clé API DeepSeek invalide ou expirée')
        } else if (response.status === 429) {
          throw new Error('Impossible d\'utiliser la fonction IA pour le moment, essayez plus tard')
        } else if (response.status === 503) {
          throw new Error('Service IA temporairement indisponible, essayez plus tard')
        } else if (response.status >= 500) {
          throw new Error('Service IA temporairement indisponible, essayez plus tard')
        } else {
          throw new Error(`Erreur API DeepSeek: ${response.status} ${response.statusText}`)
        }
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
      
      
      // Gestion des erreurs réseau
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Impossible d\'utiliser la fonction IA pour le moment, essayez plus tard')
      }
      
      // Relancer l'erreur avec le message approprié
      throw error
    }
  }

  private buildAnalysisPrompt(request: DeepSeekAnalysisRequest): string {
    const { formTitle, formDescription, questions, responses, customPrompt } = request

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

    const formPurpose = this.inferFormPurpose(formTitle, formDescription)
    
    let prompt = `Analyse ce formulaire et réponds en JSON:

TITRE: "${formTitle}"
DESCRIPTION: "${formDescription || 'Aucune'}"
OBJECTIF: ${formPurpose}

`

    if (customPrompt) {
      prompt += `DEMANDE: "${customPrompt}"

`
    }

    prompt += `DONNÉES:
${JSON.stringify(questionAnalysis)}

RÉPONSES (${responses.length}):
${JSON.stringify(responses.slice(0, 5))}${responses.length > 5 ? '\n...' : ''}

Réponds en JSON:
{
  "summary": "Résumé",
  "insights": ["Insight 1", "Insight 2"],
  "trends": [{"questionId": "id", "questionTitle": "titre", "trend": "description", "confidence": 0.8}],
  "recommendations": ["Rec 1", "Rec 2"],
  "charts": [{"questionId": "id", "questionTitle": "titre", "type": "bar", "data": [{"label": "option", "value": 10, "percentage": 50}]}]
}`

    return prompt
  }

  // Méthode pour inférer l'objectif du formulaire
  private inferFormPurpose(title: string, description?: string): string {
    const text = `${title} ${description || ''}`.toLowerCase()
    
    // Détection basée sur les mots-clés
    if (text.includes('satisfaction') || text.includes('client') || text.includes('service')) {
      return 'mesurer la satisfaction client et améliorer l\'expérience utilisateur'
    }
    if (text.includes('feedback') || text.includes('avis') || text.includes('commentaire')) {
      return 'collecter des retours et améliorer les produits/services'
    }
    if (text.includes('inscription') || text.includes('candidature') || text.includes('recrutement')) {
      return 'recruter et évaluer des candidats'
    }
    if (text.includes('enquête') || text.includes('sondage') || text.includes('opinion')) {
      return 'collecter des opinions et mesurer les tendances'
    }
    if (text.includes('évaluation') || text.includes('formation') || text.includes('apprentissage')) {
      return 'évaluer les connaissances et compétences'
    }
    if (text.includes('événement') || text.includes('inscription') || text.includes('réservation')) {
      return 'gérer les inscriptions et réservations d\'événements'
    }
    if (text.includes('contact') || text.includes('demande') || text.includes('information')) {
      return 'collecter des demandes d\'information et contacts'
    }
    if (text.includes('commande') || text.includes('achat') || text.includes('produit')) {
      return 'gérer les commandes et ventes'
    }
    if (text.includes('support') || text.includes('aide') || text.includes('problème')) {
      return 'fournir un support technique et résoudre les problèmes'
    }
    if (text.includes('adhésion') || text.includes('membre') || text.includes('association')) {
      return 'gérer les adhésions et membres'
    }
    
    // Par défaut
    return 'collecter des informations et données spécifiques'
  }

  // Méthode pour vérifier la disponibilité de l'API
  private async checkAvailability(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
        // Timeout de 5 secondes pour éviter d'attendre trop longtemps
        signal: AbortSignal.timeout(5000)
      })
      return response.ok
    } catch (error) {
      
      return false
    }
  }

  // Méthode pour tester la connexion (publique)
  async testConnection(): Promise<boolean> {
    return this.checkAvailability()
  }
}

// Instance singleton
export const deepSeekService = new DeepSeekService()
