// Service d'analyse des formulaires avec DeepSeek
import { deepSeekService, DeepSeekAnalysisRequest, DeepSeekAnalysisResponse } from './deepseek'
import type { Form, FormResponse } from '@/types/form'
import type { FormAnalysis, AnalysisRequest, AnalysisResponse } from '@/types/analysis'

export class AnalysisService {
  async analyzeForm(
    form: Form, 
    responses: FormResponse[], 
    options: AnalysisRequest = { formId: form.id }
  ): Promise<AnalysisResponse> {
    const startTime = Date.now()

    try {
      if (responses.length === 0) {
        return {
          success: false,
          error: 'Aucune réponse disponible pour l\'analyse'
        }
      }

      // Préparer les données pour DeepSeek
      const deepSeekRequest: DeepSeekAnalysisRequest = {
        formTitle: form.title,
        formDescription: form.description,
        questions: form.questions.map(q => ({
          id: q.id,
          title: q.title,
          type: q.type,
          options: q.options
        })),
        responses: responses.map(r => ({
          id: r.id,
          answers: r.answers,
          submittedAt: r.submittedAt.toISOString()
        })),
        customPrompt: options.customPrompt
      }

      // Appeler l'API DeepSeek
      const deepSeekResponse = await deepSeekService.analyzeFormData(deepSeekRequest)

      // Transformer la réponse en format interne
      const analysis = this.transformDeepSeekResponse(deepSeekResponse, form, responses)

      const processingTime = Date.now() - startTime

      return {
            success: true,
            analysis: {
              ...analysis,
              metadata: {
                ...analysis.metadata,
                processingTime
              }
            },
            processingTime
          }
    } catch (error) {
      console.error('Erreur lors de l\'analyse:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue lors de l\'analyse',
        processingTime: Date.now() - startTime
      }
    }
  }

  private transformDeepSeekResponse(
    deepSeekResponse: DeepSeekAnalysisResponse,
    form: Form,
    responses: FormResponse[]
  ): FormAnalysis {
    const analysisId = `analysis_${form.id}_${Date.now()}`

    return {
      id: analysisId,
      formId: form.id,
      summary: deepSeekResponse.summary,
      insights: deepSeekResponse.insights.map((insight, index) => ({
        id: `insight_${index}`,
        title: this.extractInsightTitle(insight),
        description: insight,
        confidence: 0.8, // Valeur par défaut
        category: this.categorizeInsight(insight)
      })),
      trends: deepSeekResponse.trends.map((trend, index) => ({
        questionId: trend.questionId,
        questionTitle: trend.questionTitle,
        trend: trend.trend,
        confidence: trend.confidence,
        direction: this.extractTrendDirection(trend.trend),
        impact: this.extractTrendImpact(trend.confidence)
      })),
      recommendations: deepSeekResponse.recommendations.map((rec, index) => ({
        id: `rec_${index}`,
        title: this.extractRecommendationTitle(rec),
        description: rec,
        priority: this.extractRecommendationPriority(rec),
        category: this.categorizeRecommendation(rec)
      })),
      charts: deepSeekResponse.charts.map((chart, index) => ({
        id: `chart_${index}`,
        questionId: chart.questionId,
        questionTitle: chart.questionTitle,
        type: this.mapChartType(chart.type),
        data: chart.data.map(item => ({
          ...item,
          color: this.generateColor(item.label)
        }))
      })),
      metadata: {
        totalResponses: responses.length,
        analysisDate: new Date().toISOString(),
        processingTime: 0, // Sera mis à jour par l'appelant
        confidence: this.calculateOverallConfidence(deepSeekResponse)
      },
      rawData: deepSeekResponse
    }
  }

  private extractInsightTitle(insight: string): string {
    // Extraire le titre de l'insight (première phrase ou mots-clés)
    const sentences = insight.split('.')
    return sentences[0].trim().substring(0, 50) + (sentences[0].length > 50 ? '...' : '')
  }

  private categorizeInsight(insight: string): 'trend' | 'pattern' | 'recommendation' | 'warning' {
    const lowerInsight = insight.toLowerCase()
    if (lowerInsight.includes('recommand') || lowerInsight.includes('suggest')) {
      return 'recommendation'
    }
    if (lowerInsight.includes('tendance') || lowerInsight.includes('augment') || lowerInsight.includes('diminu')) {
      return 'trend'
    }
    if (lowerInsight.includes('attention') || lowerInsight.includes('problème') || lowerInsight.includes('risque')) {
      return 'warning'
    }
    return 'pattern'
  }

  private extractTrendDirection(trend: string): 'up' | 'down' | 'stable' {
    const lowerTrend = trend.toLowerCase()
    if (lowerTrend.includes('augment') || lowerTrend.includes('hausse') || lowerTrend.includes('croissance')) {
      return 'up'
    }
    if (lowerTrend.includes('diminu') || lowerTrend.includes('baisse') || lowerTrend.includes('déclin')) {
      return 'down'
    }
    return 'stable'
  }

  private extractTrendImpact(confidence: number): 'high' | 'medium' | 'low' {
    if (confidence >= 0.8) return 'high'
    if (confidence >= 0.6) return 'medium'
    return 'low'
  }

  private extractRecommendationTitle(rec: string): string {
    const sentences = rec.split('.')
    return sentences[0].trim().substring(0, 60) + (sentences[0].length > 60 ? '...' : '')
  }

  private extractRecommendationPriority(rec: string): 'high' | 'medium' | 'low' {
    const lowerRec = rec.toLowerCase()
    if (lowerRec.includes('important') || lowerRec.includes('urgent') || lowerRec.includes('critique')) {
      return 'high'
    }
    if (lowerRec.includes('recommand') || lowerRec.includes('suggest')) {
      return 'medium'
    }
    return 'low'
  }

  private categorizeRecommendation(rec: string): 'form_improvement' | 'targeting' | 'content' | 'process' {
    const lowerRec = rec.toLowerCase()
    if (lowerRec.includes('question') || lowerRec.includes('formulaire') || lowerRec.includes('champ')) {
      return 'form_improvement'
    }
    if (lowerRec.includes('audience') || lowerRec.includes('cible') || lowerRec.includes('public')) {
      return 'targeting'
    }
    if (lowerRec.includes('contenu') || lowerRec.includes('texte') || lowerRec.includes('message')) {
      return 'content'
    }
    return 'process'
  }

  private mapChartType(type: string): 'bar' | 'pie' | 'line' | 'doughnut' {
    switch (type.toLowerCase()) {
      case 'pie': return 'pie'
      case 'line': return 'line'
      case 'doughnut': return 'doughnut'
      default: return 'bar'
    }
  }

  private generateColor(label: string): string {
    // Générer une couleur basée sur le label
    const colors = [
      '#E40046', '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
      '#8B5CF6', '#06B6D4', '#84CC16', '#F97316', '#EC4899'
    ]
    const hash = label.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0)
      return a & a
    }, 0)
    return colors[Math.abs(hash) % colors.length]
  }

  private calculateOverallConfidence(response: DeepSeekAnalysisResponse): number {
    const confidences = response.trends.map(t => t.confidence)
    return confidences.length > 0 
      ? confidences.reduce((a, b) => a + b, 0) / confidences.length 
      : 0.7
  }

  // Méthode pour tester la connexion DeepSeek
  async testConnection(): Promise<boolean> {
    return await deepSeekService.testConnection()
  }
}

// Instance singleton
export const analysisService = new AnalysisService()
