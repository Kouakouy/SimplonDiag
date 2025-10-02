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
    
    let prompt = `Tu es un expert en analyse de données de formulaires. Réponds UNIQUEMENT en JSON valide.

CONTEXTE DU FORMULAIRE:
📋 TITRE: "${formTitle}"
📝 DESCRIPTION: "${formDescription || 'Aucune description fournie'}"
🎯 OBJECTIF: ${formPurpose}

`

    if (customPrompt) {
      prompt += `ANALYSE PERSONNALISÉE DEMANDÉE:
"${customPrompt}"

Concentre-toi UNIQUEMENT sur cette demande. Analyse les données pour identifier les patterns qui répondent directement à cette question.

`
    }

    prompt += `DONNÉES À ANALYSER:
QUESTIONS ET RÉPONSES:
${JSON.stringify(questionAnalysis, null, 2)}

RÉPONSES COMPLÈTES (${responses.length} réponses):
${JSON.stringify(responses.slice(0, 10), null, 2)}${responses.length > 10 ? '\n... (autres réponses similaires)' : ''}

Fournis une analyse en JSON avec cette structure exacte :
{
  "summary": "Résumé de l'analyse ${customPrompt ? 'ciblée répondant à la demande personnalisée' : 'des données du formulaire'}",
  "insights": [
    "Insight 1: Analyse basée sur les données",
    "Insight 2: Pattern ou tendance identifiée",
    "Insight 3: Données significatives observées"
  ],
  "trends": [
    {
      "questionId": "id_question",
      "questionTitle": "Titre de la question",
      "trend": "Description de la tendance observée avec évaluation quantitative",
      "confidence": 0.85
    }
  ],
  "recommendations": [
    "Recommandation 1: Action concrète basée sur l'analyse",
    "Recommandation 2: Suggestion d'amélioration"
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

IMPORTANT: Réponds UNIQUEMENT avec le JSON valide, sans texte supplémentaire.`

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
