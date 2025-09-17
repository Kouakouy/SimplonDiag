"use client"

// Page d'édition des questions du formulaire
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import type { Form, Question } from "@/types/form"
import { Sidebar } from "@/components/layout/sidebar"
import { GoogleQuestionEditor } from "@/components/forms/google-question-editor"
import { apiRequest } from "@/lib/api"
import { FormPreview } from "@/components/forms/form-preview"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Save, Eye, ArrowLeft, Settings, Share2 } from "lucide-react"
import Link from "next/link"

export default function FormQuestionsPage() {
  const router = useRouter()
  const params = useParams()
  const formId = params.id as string
  
  const [form, setForm] = useState<Form | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [loading, setLoading] = useState(true)

  // Charger le formulaire depuis l'API
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const f = await apiRequest<any>({ url: `/forms/${formId}` })
        const adapted: Form = {
          id: f._id || f.id || formId,
          title: f.title || "",
          description: f.description || "",
          bannerTitle: f.banner_title,
          bannerImageUrl: f.banner_image_url,
          publicSlug: f.public_slug,
          questions: f.questions || [],
          isPublic: f.is_public ?? true,
          expirationDate: f.expiration_date ? new Date(f.expiration_date) : undefined,
          maxResponses: f.max_responses,
          createdAt: f.created_at ? new Date(f.created_at) : new Date(),
          updatedAt: f.updated_at ? new Date(f.updated_at) : new Date(),
          responses: [],
        }
        setForm(adapted)
      } catch (e) {
        router.push('/forms')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [formId, router])

  // Ajouter une nouvelle question
  const addQuestion = () => {
    if (!form) return

    const newQuestion: Question = {
      id: Date.now().toString(),
      categoryId: "short-text",
      type: "text",
      title: "",
      required: false
    }
    
    const updatedForm = {
      ...form,
      questions: [...(form.questions || []), newQuestion],
      updatedAt: new Date()
    }
    setForm(updatedForm)
    // Persist backend
    apiRequest({ url: `/forms/${formId}`, method: 'PUT', body: { questions: updatedForm.questions } }).catch(() => {})
  }

  // Mettre à jour une question
  const updateQuestion = (index: number, updatedQuestion: Question) => {
    if (!form) return
    
    const questions = [...(form.questions || [])]
    questions[index] = updatedQuestion
    const updatedForm = {
      ...form,
      questions,
      updatedAt: new Date()
    }
    setForm(updatedForm)
    apiRequest({ url: `/forms/${formId}`, method: 'PUT', body: { questions } }).catch(() => {})
  }

  // Supprimer une question
  const deleteQuestion = (index: number) => {
    if (!form) return
    
    const questions = form.questions?.filter((_, i) => i !== index) || []
    const updatedForm = {
      ...form,
      questions,
      updatedAt: new Date()
    }
    setForm(updatedForm)
    apiRequest({ url: `/forms/${formId}`, method: 'PUT', body: { questions } }).catch(() => {})
  }

  // Dupliquer une question
  const duplicateQuestion = (index: number) => {
    if (!form || !form.questions) return
    
    const questionToDuplicate = form.questions[index]
    const duplicatedQuestion: Question = {
      ...questionToDuplicate,
      id: Date.now().toString(),
      title: questionToDuplicate.title + " (copie)"
    }
    
    const questions = [...form.questions]
    questions.splice(index + 1, 0, duplicatedQuestion)
    
    const updatedForm = {
      ...form,
      questions,
      updatedAt: new Date()
    }
    setForm(updatedForm)
    apiRequest({ url: `/forms/${formId}`, method: 'PUT', body: { questions } }).catch(() => {})
  }

  // Sauvegarder et terminer
  const finishForm = async () => {
    if (!form) return
    
    const finalForm = {
      ...form,
      updatedAt: new Date()
    }
    try {
      const isValidUrl = (u?: string) => {
        if (!u) return false
        try { new URL(u); return true } catch { return false }
      }
      await apiRequest({ url: `/forms/${formId}`, method: 'PUT', body: {
        title: finalForm.title,
        description: finalForm.description,
        is_public: finalForm.isPublic,
        questions: finalForm.questions,
        max_responses: finalForm.maxResponses,
        expiration_date: finalForm.expirationDate ? finalForm.expirationDate.toISOString() : undefined,
        banner_title: finalForm.bannerTitle,
        banner_image_url: isValidUrl(finalForm.bannerImageUrl) ? finalForm.bannerImageUrl : undefined,
      } })
      router.push("/forms")
    } catch (e) {
      // eslint-disable-next-line no-alert
      alert('Erreur de sauvegarde')
    }
  }

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <Sidebar />
        <div className="ml-64 flex flex-col min-h-screen">
          <main className="flex-1 p-6">
            <div className="text-center">
              <p>Chargement...</p>
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (!form) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <Sidebar />
        <div className="ml-64 flex flex-col min-h-screen">
          <main className="flex-1 p-6">
            <div className="text-center">
              <p>Formulaire non trouvé</p>
              <Link href="/forms">
                <Button className="mt-4">Retour aux formulaires</Button>
              </Link>
            </div>
          </main>
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
              <h1 className="text-3xl font-bold text-gray-900">Éditer les questions</h1>
              <p className="text-gray-600 mt-1">
                Formulaire : <span className="font-medium">{form.title}</span>
              </p>
            </div>
          </div>
          
          <div className="max-w-4xl mx-auto">
            {/* Actions en haut */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Link href="/forms">
                  <Button variant="outline">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Retour aux formulaires
                  </Button>
                </Link>
                <Link href={`/forms/${formId}/edit`}>
                  <Button variant="outline">
                    <Settings className="w-4 h-4 mr-2" />
                    Modifier
                  </Button>
                </Link>
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/f/${form.publicSlug || formId}`} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline">
                    <Eye className="w-4 h-4 mr-2" />
                    Aperçu
                  </Button>
                </Link>
                <Link href={`/forms/${formId}/share`}>
                  <Button className="bg-[#E40046] hover:bg-pink-700">
                    <Share2 className="w-4 h-4 mr-2" />
                    Partager
                  </Button>
                </Link>
              </div>
            </div>

            {/* Résumé de la configuration + bannière */}
            <Card className="mb-6 overflow-hidden border-pink-200">
              <div
                className={
                  "relative h-32 md:h-40 w-full " +
                  (form.bannerImageUrl
                    ? "bg-center bg-cover"
                    : "bg-gradient-to-r from-pink-200 via-rose-200 to-red-200")
                }
                style={
                  form.bannerImageUrl
                    ? { backgroundImage: `url(${form.bannerImageUrl})` }
                    : undefined
                }
              >
                <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-black/10" />
                <div className="absolute inset-0 p-4 md:p-6 flex items-end">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="bg-white/80 text-gray-800 backdrop-blur">
                        {form.isPublic ? "Public" : "Privé"}
                      </Badge>
                      {form.expirationDate && (
                        <Badge variant="secondary" className="bg-white/80 text-gray-800 backdrop-blur">
                          Expire le {form.expirationDate.toLocaleDateString('fr-FR')}
                        </Badge>
                      )}
                      {typeof form.maxResponses === 'number' && (
                        <Badge variant="secondary" className="bg-white/80 text-gray-800 backdrop-blur">
                          Max {form.maxResponses}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <CardContent className="p-4 md:p-5">
                <div className="mb-3">
                  <h3 className="text-xl md:text-2xl font-semibold text-gray-900">{form.title || "Sans titre"}</h3>
                  {form.description && (
                    <p className="text-gray-600 mt-1">{form.description}</p>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-800">Statut:</span>
                    <span className="text-gray-700">{form.isPublic ? "Visible publiquement" : "Visible uniquement via lien"}</span>
                  </div>
                  {typeof form.maxResponses === 'number' && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-800">Limite:</span>
                      <span className="text-gray-700">{form.maxResponses} réponses</span>
                    </div>
                  )}
                  {form.expirationDate && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-800">Expiration:</span>
                      <span className="text-gray-700">{form.expirationDate.toLocaleDateString('fr-FR')}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Questions */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Questions du formulaire</h3>
              </div>

              {form.questions?.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <div className="text-gray-400 mb-4">
                      <Plus className="w-12 h-12 mx-auto mb-2" />
                    </div>
                    <h4 className="text-lg font-medium text-gray-600 mb-2">Aucune question</h4>
                    <p className="text-gray-500 mb-4">Commencez par ajouter votre première question</p>
                    <Button onClick={addQuestion} className="bg-[#E40046] hover:bg-pink-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Ajouter une question
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                form.questions?.map((question, index) => (
                  <GoogleQuestionEditor
                    key={question.id}
                    question={question}
                    onUpdate={(updatedQuestion) => updateQuestion(index, updatedQuestion)}
                    onDelete={() => deleteQuestion(index)}
                    onDuplicate={() => duplicateQuestion(index)}
                  />
                ))
              )}

              {/* Bouton d'ajout de question */}
              {form.questions && form.questions.length > 0 && (
                <div className="flex justify-center">
                  <Button
                    onClick={addQuestion}
                    className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 shadow-md"
                    size="lg"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Ajouter une question
                  </Button>
                </div>
              )}
            </div>

            {/* Bouton de finalisation */}
            <div className="text-center">
              <Button onClick={finishForm} size="lg" className="bg-[#E40046] hover:bg-pink-700">
                <Save className="w-4 h-4 mr-2" />
                Terminer le formulaire
              </Button>
              <p className="text-sm text-gray-500 mt-2">
                Le formulaire sera sauvegardé et disponible dans votre liste
              </p>
            </div>
          </div>
        </main>
      </div>


      {/* Aperçu du formulaire */}
      {showPreview && (
        <FormPreview
          form={form}
          onClose={() => setShowPreview(false)}
        />
      )}

    </div>
  )
}
