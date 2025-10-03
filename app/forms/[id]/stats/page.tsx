"use client"

// Page de statistiques spécifiques à un formulaire
import { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import type { Form, FormResponse } from "@/types/form"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { apiRequest } from "@/lib/api"
import { ArrowLeft, RefreshCw, Download, Share2, BarChart3, PieChart, Users, FileText } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { hourglass } from 'ldrs'

// Enregistrer le composant hourglass
hourglass.register()

export default function FormStatsPage() {
  const params = useParams()
  const formId = params.id as string
  const [form, setForm] = useState<Form | null>(null)
  const [loading, setLoading] = useState(true)
  const [responses, setResponses] = useState<FormResponse[]>([])
  const [activeTab, setActiveTab] = useState<"overview" | "questions" | "individual">("overview")
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number>(0)
  const [selectedResponseIndex, setSelectedResponseIndex] = useState<number>(0)

  // Fonction de chargement des données
  const loadData = useCallback(async () => {
    try {
      console.log('Chargement des données pour le formulaire:', formId)
      
      const f = await apiRequest<any>({ url: `/forms/${formId}` })
      console.log('Formulaire chargé:', f)
      
      const adaptedForm: Form = {
        id: f._id || f.id || formId,
        title: f.title || "",
        description: f.description || "",
        bannerTitle: f.banner_title,
        bannerImageUrl: f.banner_image_url,
        questions: f.questions || [],
        isPublic: f.is_public ?? true,
        expirationDate: f.expiration_date ? new Date(f.expiration_date) : undefined,
        maxResponses: f.max_responses,
        createdAt: f.created_at ? new Date(f.created_at) : new Date(),
        updatedAt: f.updated_at ? new Date(f.updated_at) : new Date(),
        responses: [],
        publicSlug: f.public_slug,
      }
      setForm(adaptedForm)

      console.log('Chargement des réponses...')
      const resp = await apiRequest<any[]>({ url: `/forms/${formId}/responses` })
      console.log('Réponses chargées:', resp)
      
      const adaptedResponses: FormResponse[] = (resp || []).map((r: any) => ({
        id: r._id || r.id,
        formId: adaptedForm.id,
        respondentName: r.respondent_name || "",
        respondentEmail: r.respondent_email || "",
        answers: r.answers || {},
        submittedAt: r.submitted_at ? new Date(r.submitted_at) : new Date(),
      }))
      
      console.log('Réponses adaptées:', adaptedResponses)
      setResponses(adaptedResponses)
      
      toast.success(`Données chargées: ${adaptedResponses.length} réponses`)
    } catch (e) {
      console.error('Erreur lors du chargement:', e)
      toast.error("Erreur lors du chargement des données")
    } finally {
      setLoading(false)
    }
  }, [formId])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Fonction d'export des données
  const handleExport = () => {
    const data = {
      form: form,
      responses: responses,
      exportDate: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `form-stats-${form?.title || 'form'}-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast.success("Données exportées avec succès!")
  }

  // Fonction de partage
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Statistiques - ${form?.title}`,
          text: `Consultez les statistiques du formulaire "${form?.title}"`,
          url: window.location.href
        })
      } catch (err) {
        console.log('Erreur lors du partage:', err)
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success("Lien copié dans le presse-papiers!")
    }
  }

  // Fonction pour analyser les réponses d'une question
  const analyzeQuestionResponses = (questionId: string) => {
    const questionResponses = responses.map(r => r.answers[questionId]).filter(Boolean)
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
      totalResponses: questionResponses.length,
      responseCounts,
      uniqueResponses: Object.keys(responseCounts).length
    }
  }

  // Fonction pour générer un graphique à barres
  const renderBarChart = (questionId: string, questionTitle: string) => {
    const analysis = analyzeQuestionResponses(questionId)
    const maxCount = Math.max(...Object.values(analysis.responseCounts))
    
    return (
      <div className="space-y-3">
        {Object.entries(analysis.responseCounts).map(([response, count]) => (
          <div key={response} className="flex items-center gap-3">
            <div className="w-32 text-sm text-gray-600 truncate">{response}</div>
            <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
              <div 
                className="bg-[#E40046] h-6 rounded-full flex items-center justify-end pr-2"
                style={{ width: `${(count / maxCount) * 100}%` }}
              >
                <span className="text-white text-xs font-medium">{count}</span>
              </div>
            </div>
            <div className="w-12 text-sm text-gray-600 text-right">
              {((count / analysis.totalResponses) * 100).toFixed(1)}%
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Fonction pour générer un graphique circulaire
  const renderPieChart = (questionId: string, questionTitle: string) => {
    const analysis = analyzeQuestionResponses(questionId)
    const colors = ['#E40046', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8']
    
    return (
      <div className="flex flex-wrap gap-4">
        {Object.entries(analysis.responseCounts).map(([response, count], index) => (
          <div key={response} className="flex items-center gap-2">
            <div 
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: colors[index % colors.length] }}
            />
            <span className="text-sm text-gray-600">{response}</span>
            <span className="text-sm font-medium text-gray-800">({count})</span>
          </div>
        ))}
      </div>
    )
  }

  // Fonction pour générer un tableau de texte
  const renderTextTable = (questionId: string, questionTitle: string) => {
    const questionResponses = responses.map(r => r.answers[questionId]).filter(Boolean)
    
    return (
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {questionResponses.map((response, index) => (
          <div key={index} className="p-3 bg-gray-50 rounded-lg border">
            <div className="text-sm text-gray-600 mb-1">Réponse #{index + 1}</div>
            <div className="text-gray-800">{response}</div>
          </div>
        ))}
      </div>
    )
  }

  // Fonction pour déterminer le type de graphique selon le type de question
  const renderQuestionChart = (question: any, index: number) => {
    const analysis = analyzeQuestionResponses(question.id)
    
    if (analysis.totalResponses === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Aucune réponse pour cette question</p>
        </div>
      )
    }

    switch (question.type) {
      case 'radio':
      case 'select':
        return renderPieChart(question.id, question.title)
      case 'checkbox':
        return renderBarChart(question.id, question.title)
      case 'rating':
        return renderBarChart(question.id, question.title)
      case 'text':
      case 'textarea':
      case 'email':
      case 'number':
      case 'date':
        return renderTextTable(question.id, question.title)
      default:
        return renderBarChart(question.id, question.title)
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 flex justify-center">
              <l-hourglass
                size="60"
                bg-opacity="0.1"
                speed="1.75"
                color="#E40046"
              ></l-hourglass>
            </div>
            <p className="text-gray-600">Chargement des statistiques...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!form) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Formulaire non trouvé</p>
            <Link href="/forms">
              <Button>Retour aux formulaires</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <Sidebar />

      <div className="ml-64 flex flex-col min-h-screen">
        <main className="flex-1 p-6 overflow-y-auto">
          {/* En-tête */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Statistiques: {form.title}</h1>
              <p className="text-gray-600 mt-1">Analysez les performances de ce formulaire</p>
            </div>
            
            {/* Actions rapides */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={loadData}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Actualiser
              </Button>
              
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" />
                Exporter
              </Button>
              
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" />
                Partager
              </Button>
            </div>
          </div>
          
          <div className="max-w-7xl mx-auto">
            {/* Compteur total de réponses */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-[#E40046] mb-2">{responses.length}</div>
                    <div className="text-lg text-gray-600">Réponse{responses.length > 1 ? 's' : ''} reçue{responses.length > 1 ? 's' : ''}</div>
                    {responses.length === 0 && (
                      <div className="text-sm text-gray-500 mt-2">
                        Aucune réponse reçue pour le moment
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Onglets */}
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "overview" | "questions" | "individual")} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Vue d'ensemble
                </TabsTrigger>
                <TabsTrigger value="questions" className="flex items-center gap-2">
                  <PieChart className="w-4 h-4" />
                  Vue par question
                </TabsTrigger>
                <TabsTrigger value="individual" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Vue individuelle
                </TabsTrigger>
              </TabsList>

              {/* Vue d'ensemble */}
              <TabsContent value="overview" className="mt-6">
                {responses.length === 0 ? (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-xl font-medium text-gray-600 mb-2">Aucune donnée disponible</h3>
                      <p className="text-gray-500 mb-6">Les statistiques apparaîtront une fois que des réponses seront reçues</p>
                      <Link href={`/f/${form.publicSlug || form.id}`} target="_blank">
                        <Button className="bg-[#E40046] hover:bg-[#E40046]/80 text-white">
                          Partager le formulaire
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-6">
                    {form.questions.map((question, index) => (
                      <Card key={question.id}>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <span className="text-lg font-semibold">
                              {index + 1}. {question.title}
                            </span>
                            <Badge variant="outline">{question.type}</Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {renderQuestionChart(question, index)}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Vue par question */}
              <TabsContent value="questions" className="mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Liste des questions */}
                  <div className="lg:col-span-1">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Questions</CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="space-y-1">
                          {form.questions.map((question, index) => (
                            <button
                              key={question.id}
                              onClick={() => setSelectedQuestionIndex(index)}
                              className={`w-full text-left p-3 hover:bg-gray-50 transition-colors ${
                                selectedQuestionIndex === index ? 'bg-[#E40046]/10 border-r-2 border-[#E40046]' : ''
                              }`}
                            >
                              <div className="text-sm font-medium text-gray-900">
                                {index + 1}. {question.title}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {question.type} • {analyzeQuestionResponses(question.id).totalResponses} réponses
                              </div>
                            </button>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Détail de la question sélectionnée */}
                  <div className="lg:col-span-3">
                    {form.questions[selectedQuestionIndex] && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <span className="text-xl font-semibold">
                              {selectedQuestionIndex + 1}. {form.questions[selectedQuestionIndex].title}
                            </span>
                            <Badge variant="outline">{form.questions[selectedQuestionIndex].type}</Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {renderQuestionChart(form.questions[selectedQuestionIndex], selectedQuestionIndex)}
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* Vue individuelle */}
              <TabsContent value="individual" className="mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Liste des réponses */}
                  <div className="lg:col-span-1">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Réponses</CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="space-y-1">
                          {responses.map((response, index) => (
                            <button
                              key={response.id}
                              onClick={() => setSelectedResponseIndex(index)}
                              className={`w-full text-left p-3 hover:bg-gray-50 transition-colors ${
                                selectedResponseIndex === index ? 'bg-[#E40046]/10 border-r-2 border-[#E40046]' : ''
                              }`}
                            >
                              <div className="text-sm font-medium text-gray-900">
                                Réponse #{index + 1}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {response.submittedAt.toLocaleDateString('fr-FR')} à {response.submittedAt.toLocaleTimeString('fr-FR')}
                              </div>
                            </button>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Détail de la réponse sélectionnée */}
                  <div className="lg:col-span-3">
                    {responses[selectedResponseIndex] && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            <span>Réponse #{selectedResponseIndex + 1}</span>
                            <Badge variant="outline">
                              {responses[selectedResponseIndex].submittedAt.toLocaleDateString('fr-FR')}
                            </Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {form.questions.map((question, index) => (
                              <div key={question.id} className="border-b pb-4 last:border-b-0">
                                <h4 className="font-semibold text-gray-900 mb-2">
                                  {index + 1}. {question.title}
                                </h4>
                                <div className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                                  {responses[selectedResponseIndex].answers[question.id] || 'Aucune réponse'}
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Bouton retour */}
            <div className="mt-8 text-center">
              <Link href={`/forms/${form.id}/responses`}>
                <Button variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour aux réponses
                </Button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}