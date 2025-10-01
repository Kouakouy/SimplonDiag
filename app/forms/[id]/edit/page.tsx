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
        
        // Log pour vérifier les données reçues
        console.log('Données reçues du serveur:', f)
        
        const adapted: Form = {
          id: f._id || f.id || formId,
          title: f.title || "",
          description: f.description || "",
          bannerTitle: f.banner_title || "",
          bannerImageUrl: f.banner_image_url || "",
          questions: f.questions || [],
          isPublic: f.is_public ?? true,
          expirationDate: f.expiration_date ? new Date(f.expiration_date) : undefined,
          maxResponses: f.max_responses || undefined,
          createdAt: f.created_at ? new Date(f.created_at) : new Date(),
          updatedAt: f.updated_at ? new Date(f.updated_at) : new Date(),
          responses: [],
          publicSlug: f.public_slug,
        }
        
        // Log pour vérifier les données adaptées
        console.log('Données adaptées pour le formulaire:', adapted)
        
        setForm(adapted)
      } catch (e) {
        console.error('Erreur lors du chargement du formulaire:', e)
        alert('Erreur lors du chargement du formulaire')
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

      // Préparer les données à envoyer (EXACTEMENT comme create/page.tsx)
      const formData = {
        title: form.title || "",
        description: form.description || "",
        is_public: form.isPublic ?? true,
        questions: [], // Comme dans create - les questions sont gérées séparément
        max_responses: form.maxResponses,
        expiration_date: form.expirationDate ? form.expirationDate.toISOString() : undefined,
        banner_title: form.bannerTitle || undefined,
        banner_image_url: isValidUrl(form.bannerImageUrl) ? form.bannerImageUrl : undefined,
      }

      // Validation simple (comme dans create/page.tsx)
      if (!formData.title || formData.title.trim().length === 0) {
        alert('Veuillez saisir un titre pour votre formulaire')
        return
      }

      // Sauvegarder les informations du formulaire (comme dans create/page.tsx)
      await apiRequest({ 
        url: `/forms/${formId}`, 
        method: 'PUT', 
        body: formData
      })

      alert('Formulaire sauvegardé avec succès !')
      router.push("/forms")
    } catch (e: any) {
      // Afficher l'erreur détaillée renvoyée par lib/api.ts (comme dans create/page.tsx)
      alert(`Erreur lors de la sauvegarde: ${e.message}`)
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
            <p className="text-gray-500">Chargement des informations du formulaire...</p>
            <p className="text-sm text-gray-400 mt-2">Récupération des données sauvegardées</p>
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

      <div className="ml-0 lg:ml-64 flex flex-col min-h-screen">
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {/* En-tête */}
          <div className="mb-6 lg:mb-8">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">Modifier: {form.title}</h1>
            <p className="text-gray-600 mt-1">Éditez votre formulaire</p>
          </div>
          <div className="max-w-4xl mx-auto">
            {/* Actions en haut */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between mb-6 gap-4">
              <Link href={`/forms/${form.id}/responses`}>
                <Button variant="outline" className="w-full sm:w-auto">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour aux réponses
                </Button>
              </Link>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <Link href={`/forms/${form.id}/share`}>
                  <Button variant="outline" className="w-full sm:w-auto text-xs sm:text-sm">
                    <Share className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Partager</span>
                  </Button>
                </Link>
                <Link href={`/f/${form.publicSlug || form.id}`} target="_blank">
                  <Button variant="outline" className="w-full sm:w-auto text-xs sm:text-sm">
                    <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Aperçu</span>
                  </Button>
                </Link>
                <Button 
                  onClick={saveForm} 
                  disabled={saving}
                  className="bg-[#E40046] hover:bg-[#E40046]/80 text-white disabled:opacity-50 w-full sm:w-auto text-xs sm:text-sm"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white mr-1 sm:mr-2"></div>
                      <span className="hidden sm:inline">Sauvegarde...</span>
                      <span className="sm:hidden">Sauvegarde...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">Sauvegarder</span>
                      <span className="sm:hidden">Sauvegarder</span>
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h3 className="text-lg font-semibold">Questions ({form.questions.length})</h3>
                <Button onClick={addQuestion} className="bg-[#E40046] hover:bg-[#E40046]/80 text-white w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter une question
                </Button>
              </div>

              {form.questions.length === 0 ? (
                <Card>
                  <CardContent className="p-6 lg:p-12 text-center">
                    <div className="text-gray-400 mb-4">
                      <Plus className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2" />
                    </div>
                    <h4 className="text-base sm:text-lg font-medium text-gray-600 mb-2">Aucune question</h4>
                    <p className="text-sm sm:text-base text-gray-500 mb-4">Commencez par ajouter votre première question</p>
                    <Button onClick={addQuestion} className="bg-[#E40046] hover:bg-[#E40046]/80 text-white w-full sm:w-auto">
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
                <Button onClick={addQuestion} variant="outline" size="lg" className="w-full sm:w-auto">
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
