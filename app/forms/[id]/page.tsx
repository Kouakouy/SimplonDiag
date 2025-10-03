"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import type { Form, Question } from "@/types/form"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { apiRequest } from "@/lib/api"
import { Eye, Pencil, BarChart2, Lock, Trash2, FileText, Image as ImageIcon, Users, Calendar, AlertCircle } from "lucide-react"
import { hourglass } from 'ldrs'

// Enregistrer le composant hourglass
hourglass.register()

export default function FormOverviewPage() {
  const params = useParams()
  const router = useRouter()
  const formId = params.id as string

  const [form, setForm] = useState<Form | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [deleting, setDeleting] = useState(false)

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

  const handleCloseForm = async () => {
    if (!form || !form.isPublic) return
    try {
      setUpdating(true)
      await apiRequest({ url: `/forms/${form.id}`, method: 'PUT', body: { is_public: false } })
      setForm({ ...form, isPublic: false })
    } catch (e) {
      // eslint-disable-next-line no-alert
      alert("Erreur lors de la fermeture du formulaire")
    } finally {
      setUpdating(false)
    }
  }

  const handleDelete = async () => {
    if (!form) return
    const confirmDelete = window.confirm("Supprimer ce formulaire ? Cette action est définitive.")
    if (!confirmDelete) return
    try {
      setDeleting(true)
      await apiRequest({ url: `/forms/${form.id}`, method: 'DELETE' })
      router.push('/forms')
    } catch (e) {
      // eslint-disable-next-line no-alert
      alert("Erreur lors de la suppression")
      setDeleting(false)
    }
  }

  const renderQuestion = (question: Question, index: number) => {
    const num = index + 1
    return (
      <div key={question.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
        <div className="mb-4">
          <h4 className="font-semibold text-gray-900 text-lg">
            {num}. {question.title}
            {question.required && <span className="text-red-500 ml-1">*</span>}
          </h4>
          {question.description && (
            <p className="text-sm text-gray-600 mt-2">{question.description}</p>
          )}
        </div>
        
        {question.type === "text" && (
          <input 
            placeholder={question.placeholder || "Votre réponse"} 
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E40046] focus:border-transparent transition-all" 
          />
        )}
        
        {question.type === "textarea" && (
          <textarea 
            placeholder={question.placeholder || "Votre réponse"} 
            rows={4} 
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E40046] focus:border-transparent transition-all resize-vertical" 
          />
        )}
        
        {question.type === "email" && (
          <input 
            type="email" 
            placeholder={question.placeholder || "exemple@email.com"} 
            className="w-full max-w-md p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E40046] focus:border-transparent transition-all" 
          />
        )}
        
        {question.type === "number" && (
          <input 
            type="number" 
            placeholder="0" 
            className="w-full max-w-40 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E40046] focus:border-transparent transition-all" 
          />
        )}
        
        {question.type === "date" && (
          <input 
            type="date" 
            className="w-full max-w-48 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E40046] focus:border-transparent transition-all" 
          />
        )}
        
        {question.type === "radio" && (
          <div className="space-y-3">
            {question.options?.map((option, optionIndex) => (
              <label key={optionIndex} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                <input 
                  type="radio" 
                  name={`question-${question.id}`}
                  value={option}
                  className="w-4 h-4 text-[#E40046] focus:ring-[#E40046] border-gray-300" 
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        )}
        
        {question.type === "checkbox" && (
          <div className="space-y-3">
            {question.options?.map((option, optionIndex) => (
              <label key={optionIndex} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                <input 
                  type="checkbox" 
                  value={option}
                  className="w-4 h-4 text-[#E40046] focus:ring-[#E40046] border-gray-300 rounded" 
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        )}
        
        {question.type === "select" && (
          <select className="w-full max-w-xl p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E40046] focus:border-transparent transition-all bg-white">
            <option value="">Sélectionnez une option</option>
            {question.options?.map((option, optionIndex) => (
              <option key={optionIndex} value={option}>{option}</option>
            ))}
          </select>
        )}
        
        {question.type === "rating" && (
          <div className="flex space-x-2">
            {question.options?.map((_, starIndex) => (
              <button 
                key={starIndex} 
                className="w-10 h-10 inline-flex items-center justify-center text-3xl text-gray-300 hover:text-yellow-400 transition-colors focus:outline-none focus:text-yellow-400"
                type="button"
              >
                ★
              </button>
            ))}
          </div>
        )}
        
        {question.type === "file" && (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50 hover:bg-gray-100 transition-colors">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">Glissez-déposez vos fichiers ici</p>
            <p className="text-sm text-gray-500">ou cliquez pour sélectionner</p>
            <input 
              type="file" 
              className="hidden" 
              id={`file-${question.id}`}
              multiple={question.isMultipleChoice}
            />
            <label 
              htmlFor={`file-${question.id}`}
              className="inline-block mt-3 px-4 py-2 bg-[#E40046] text-white rounded-lg hover:bg-[#E40046]/80 transition-colors cursor-pointer"
            >
              Choisir des fichiers
            </label>
          </div>
        )}
      </div>
    )
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
          <Card className="max-w-md mx-auto">
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Formulaire introuvable</h2>
              <Button onClick={() => router.push("/forms")} variant="outline">Retour</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const shareUrl = `/f/${form.publicSlug || form.id}`

  return (
    <div className="bg-gray-50 min-h-screen">
      <Sidebar />
      <div className="ml-64 flex flex-col min-h-screen">
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{form.title}</h1>
              <p className="text-gray-600 mt-1">Aperçu du formulaire</p>
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/forms/${form.id}/edit`}>
                <Button variant="outline"><Pencil className="w-4 h-4 mr-2" />Éditer</Button>
              </Link>
              <Link href={`/forms/${form.id}/responses`}>
                <Button variant="outline"><BarChart2 className="w-4 h-4 mr-2" />Résultats</Button>
              </Link>
              <Button variant="outline" disabled={!form.isPublic || updating} onClick={handleCloseForm}>
                <Lock className="w-4 h-4 mr-2" />{form.isPublic ? 'Fermer' : 'Fermé'}
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
                <Trash2 className="w-4 h-4 mr-2" />Supprimer
              </Button>
            </div>
          </div>

          {/* Lien de partage rapide */}
          <div className="mb-6 text-sm">
            <span className="text-gray-600">Lien de partage: </span>
            <Link href={shareUrl} target="_blank" className="text-[#E40046] hover:underline break-all">{shareUrl}</Link>
          </div>

          <div className="space-y-0">
            {(form.bannerTitle || form.bannerImageUrl) && (
              <div 
                className={`h-40 md:h-48 flex items-center justify-center relative ${
                  form.bannerImageUrl ? 'bg-cover bg-center' : 'bg-gradient-to-r from-[#E40046] via-[#E40046]/80 to-red-500'
                }`}
                style={form.bannerImageUrl ? { backgroundImage: `url(${form.bannerImageUrl})` } : {}}
              >
                <div className="absolute inset-0 bg-black/30"></div>
                <div className="relative z-10 text-center text-white px-6">
                  {form.bannerTitle ? (
                    <h1 className="text-4xl font-bold drop-shadow-lg">{form.bannerTitle}</h1>
                  ) : (
                    <div className="text-white/70">
                      <ImageIcon className="w-16 h-16 mx-auto mb-4" />
                      <p className="text-lg">Bannière du formulaire</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="px-4 md:px-8 py-8">
              <div className="mx-auto max-w-4xl">
                {/* En-tête du formulaire */}
                <div className="text-center border-b pb-8 mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-3">{form.title || 'Nouveau formulaire'}</h2>
                  {form.description && (
                    <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">{form.description}</p>
                  )}
                  <div className="flex justify-center gap-4 mt-6 flex-wrap">
                    <Badge variant="outline" className="flex items-center gap-2 px-3 py-1">
                      <FileText className="w-4 h-4" />
                      {form.questions.length} question{form.questions.length > 1 ? 's' : ''}
                    </Badge>
                    {form.maxResponses && (
                      <Badge variant="outline" className="flex items-center gap-2 px-3 py-1">
                        <Users className="w-4 h-4" />
                        Max: {form.maxResponses} réponses
                      </Badge>
                    )}
                    {form.expirationDate && (
                      <Badge variant="outline" className="flex items-center gap-2 px-3 py-1">
                        <Calendar className="w-4 h-4" />
                        Expire le: {form.expirationDate.toLocaleDateString('fr-FR')}
                      </Badge>
                    )}
                    <Badge variant="outline" className="flex items-center gap-2 px-3 py-1">
                      <Eye className="w-4 h-4" />
                      Mode aperçu
                    </Badge>
                  </div>
                </div>

                {/* Formulaire interactif */}
                {form.questions.length > 0 ? (
                  <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                      <div className="flex items-center gap-2 text-blue-800">
                        <Eye className="w-5 h-5" />
                        <span className="font-medium">Mode aperçu interactif</span>
                      </div>
                      <p className="text-blue-700 text-sm mt-1">
                        Vous pouvez tester tous les champs du formulaire. Les données ne seront pas sauvegardées.
                      </p>
                    </div>
                    
                    {form.questions.map((q, i) => renderQuestion(q, i))}
                    
                    {/* Bouton de soumission simulé */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                      <Button 
                        size="lg" 
                        className="bg-[#E40046] hover:bg-[#E40046]/80 text-white px-8 py-3"
                        disabled
                      >
                        Soumettre le formulaire
                      </Button>
                      <p className="text-sm text-gray-500 mt-2">
                        Bouton désactivé en mode aperçu
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16 text-gray-500">
                    <FileText className="w-16 h-16 mx-auto mb-6 text-gray-300" />
                    <h3 className="text-xl font-medium text-gray-600 mb-2">Aucune question dans ce formulaire</h3>
                    <p className="text-gray-500 mb-6">Commencez par ajouter des questions à votre formulaire</p>
                    <Link href={`/forms/${form.id}/questions`}>
                      <Button className="bg-[#E40046] hover:bg-[#E40046]/80 text-white">
                        <Pencil className="w-4 h-4 mr-2" />
                        Ajouter des questions
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action rapide: ouvrir la vue publique */}
          <div className="text-center mt-8">
            <Link href={shareUrl} target="_blank">
              <Button className="bg-[#E40046] hover:bg-[#E40046]/80 text-white px-6 py-3">
                <Eye className="w-4 h-4 mr-2" />
                Ouvrir la vue publique
              </Button>
            </Link>
          </div>
        </main>
      </div>
    </div>
  )
}


