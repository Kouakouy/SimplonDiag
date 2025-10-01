"use client"

// Page d'édition d'un formulaire existant
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import type { Form, Question } from "@/types/form"
import { Sidebar } from "@/components/layout/sidebar"
import dynamic from "next/dynamic"
const QuestionEditor = dynamic(() => import("@/components/forms/question-editor").then(m => m.QuestionEditor), { ssr: false })
const FormHeaderSection = dynamic(() => import("@/components/forms/form-header-section").then(m => m.FormHeaderSection), { ssr: false })
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Save, Eye, ArrowLeft, Share } from "lucide-react"
import { apiRequest } from "@/lib/api"
import Link from "next/link"

export default function EditFormPage() {
  const router = useRouter()
  const params = useParams()
  const formId = params.id as string

  const [form, setForm] = useState<Form | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  

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
          questions: f.questions || [],
          isPublic: f.is_public ?? true,
          expirationDate: f.expiration_date ? new Date(f.expiration_date) : undefined,
          maxResponses: f.max_responses,
          createdAt: f.created_at ? new Date(f.created_at) : new Date(),
          updatedAt: f.updated_at ? new Date(f.updated_at) : new Date(),
          responses: [],
          publicSlug: f.public_slug,
        }
        setForm(adapted)
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [formId])

  // Ajouter une nouvelle question
  const addQuestion = () => {
    if (!form) return

    const newQuestion: Question = {
      id: `q${Date.now()}`,
      categoryId: "short-text",
      type: "text",
      title: "Nouvelle question",
      required: false,
    }
    setForm({
      ...form,
      questions: [...form.questions, newQuestion],
    })
  }

  // Mettre à jour une question
  const updateQuestion = (index: number, updatedQuestion: Question) => {
    if (!form) return

    const questions = [...form.questions]
    questions[index] = updatedQuestion
    setForm({ ...form, questions })
  }

  // Supprimer une question
  const deleteQuestion = (index: number) => {
    if (!form) return

    const questions = form.questions.filter((_, i) => i !== index)
    setForm({ ...form, questions })
  }

  // Sauvegarder le formulaire
  const saveForm = async () => {
    if (!form || saving) return
    
    setSaving(true)
    try {
      const isValidUrl = (u?: string) => {
        if (!u) return false
        try { new URL(u); return true } catch { return false }
      }

      console.log('Sauvegarde du formulaire:', {
        formId,
        title: form.title,
        questionsCount: form.questions.length
      })

      // Préparer les données à envoyer
      const formData = {
        title: form.title,
        description: form.description,
        is_public: form.isPublic,
        banner_title: form.bannerTitle || null,
        banner_image_url: isValidUrl(form.bannerImageUrl) ? form.bannerImageUrl : null,
        max_responses: form.maxResponses || null,
        expiration_date: form.expirationDate ? form.expirationDate.toISOString() : null,
        questions: form.questions.map(q => ({
          id: q.id,
          type: q.type,
          title: q.title,
          required: q.required || false,
          options: q.options || null,
          categoryId: q.categoryId || null
        }))
      }

      console.log('Données à envoyer:', JSON.stringify(formData, null, 2))

      // Sauvegarder les informations du formulaire ET les questions
      await apiRequest({ 
        url: `/forms/${formId}`, 
        method: 'PUT', 
        body: formData
      })

      console.log('Formulaire sauvegardé avec succès')
      alert('Formulaire sauvegardé avec succès !')
      router.push("/forms")
    } catch (e: any) {
      console.error('Erreur lors de la sauvegarde:', e)
      
      // Essayer d'extraire plus de détails de l'erreur
      let errorMessage = 'Erreur inconnue'
      
      if (e.message) {
        errorMessage = e.message
      } else if (e.status) {
        errorMessage = `Erreur HTTP ${e.status}: ${e.url || 'Requête échouée'}`
      } else if (typeof e === 'string') {
        errorMessage = e
      }
      
      // Afficher les détails de l'erreur dans la console pour le debugging
      console.error('Détails de l\'erreur:', {
        status: e.status,
        url: e.url,
        message: e.message,
        response: e.response
      })
      
      alert(`Erreur lors de la sauvegarde:\n${errorMessage}\n\nVérifiez la console pour plus de détails.`)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E40046] mx-auto mb-4"></div>
            <p className="text-gray-500">Chargement du formulaire...</p>
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
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Formulaire introuvable</h2>
            <p className="text-gray-500 mb-4">Le formulaire demandé n'existe pas.</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Modifier: {form.title}</h1>
              <p className="text-gray-600 mt-1">Éditez votre formulaire</p>
            </div>
          </div>
          <div className="max-w-4xl mx-auto">
            {/* Actions en haut */}
            <div className="flex items-center justify-between mb-6">
              <Link href={`/forms/${form.id}/responses`}>
                <Button variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour aux réponses
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <Link href={`/forms/${form.id}/share`}>
                  <Button variant="outline">
                    <Share className="w-4 h-4 mr-2" />
                    Partager
                  </Button>
                </Link>
                <Link href={`/f/${form.publicSlug || form.id}`} target="_blank">
                  <Button variant="outline">
                    <Eye className="w-4 h-4 mr-2" />
                    Aperçu
                  </Button>
                </Link>
                <Button 
                  onClick={saveForm} 
                  disabled={saving}
                  className="bg-[#E40046] hover:bg-[#E40046]/80 text-white disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sauvegarde...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Sauvegarder
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Informations du formulaire (alignées avec la création) */}
            <FormHeaderSection
              title={form.title}
              description={form.description}
              bannerTitle={form.bannerTitle}
              bannerImageUrl={form.bannerImageUrl}
              maxResponses={form.maxResponses}
              expirationDate={form.expirationDate}
              onTitleChange={(title) => setForm({ ...form, title })}
              onDescriptionChange={(description) => setForm({ ...form, description })}
              onBannerTitleChange={(bannerTitle) => setForm({ ...form, bannerTitle })}
              onBannerImageChange={(bannerImageUrl) => setForm({ ...form, bannerImageUrl: bannerImageUrl || undefined })}
              onMaxResponsesChange={(maxResponses) => setForm({ ...form, maxResponses })}
              onExpirationDateChange={(expirationDate) => setForm({ ...form, expirationDate })}
            />

            {/* Questions */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Questions ({form.questions.length})</h3>
                <Button onClick={addQuestion} className="bg-[#E40046] hover:bg-[#E40046]/80 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter une question
                </Button>
              </div>

              {form.questions.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <div className="text-gray-400 mb-4">
                      <Plus className="w-12 h-12 mx-auto mb-2" />
                    </div>
                    <h4 className="text-lg font-medium text-gray-600 mb-2">Aucune question</h4>
                    <p className="text-gray-500 mb-4">Commencez par ajouter votre première question</p>
                    <Button onClick={addQuestion} className="bg-[#E40046] hover:bg-[#E40046]/80 text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Ajouter une question
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                form.questions.map((question, index) => (
                  <QuestionEditor
                    key={question.id}
                    question={question}
                    onUpdate={(updatedQuestion) => updateQuestion(index, updatedQuestion)}
                    onDelete={() => deleteQuestion(index)}
                  />
                ))
              )}
            </div>

            {/* Bouton d'ajout en bas */}
            {form.questions.length > 0 && (
              <div className="text-center">
                <Button onClick={addQuestion} variant="outline" size="lg">
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter une question
                </Button>
              </div>
            )}

            
          </div>
        </main>
      </div>
    </div>
  )
}
