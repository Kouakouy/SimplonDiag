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
      <div key={question.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <div className="mb-3">
          <h4 className="font-medium text-gray-900">
            {num}. {question.title}
            {question.required && <span className="text-red-500 ml-1">*</span>}
          </h4>
          {question.description && (
            <p className="text-sm text-gray-600 mt-1">{question.description}</p>
          )}
        </div>
        {question.type === "text" && (
          <input disabled placeholder={question.placeholder || "Votre réponse"} className="max-w-xl w-full p-2 border rounded-md bg-gray-50" />
        )}
        {question.type === "textarea" && (
          <textarea disabled placeholder={question.placeholder || "Votre réponse"} rows={4} className="max-w-2xl w-full p-2 border rounded-md bg-gray-50" />
        )}
        {question.type === "email" && (
          <input type="email" disabled placeholder={question.placeholder || "exemple@email.com"} className="max-w-md w-full p-2 border rounded-md bg-gray-50" />
        )}
        {question.type === "number" && (
          <input type="number" disabled placeholder="0" className="max-w-40 w-full p-2 border rounded-md bg-gray-50" />
        )}
        {question.type === "date" && (
          <input type="date" disabled className="max-w-48 w-full p-2 border rounded-md bg-gray-50" />
        )}
        {question.type === "radio" && (
          <div className="space-y-2">
            {question.options?.map((option, optionIndex) => (
              <label key={optionIndex} className="flex items-center gap-2 cursor-default">
                <span className="w-4 h-4 rounded-full border border-gray-300 inline-flex items-center justify-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-gray-200"></span>
                </span>
                <span className="text-sm text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        )}
        {question.type === "checkbox" && (
          <div className="space-y-2">
            {question.options?.map((option, optionIndex) => (
              <label key={optionIndex} className="flex items-center gap-2 cursor-default">
                <span className="w-4 h-4 rounded border border-gray-300 inline-flex items-center justify-center bg-gray-100"></span>
                <span className="text-sm text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        )}
        {question.type === "select" && (
          <select className="w-full max-w-xl p-2 border rounded-md bg-white" disabled>
            <option>Sélectionnez une option</option>
            {question.options?.map((option, optionIndex) => (
              <option key={optionIndex}>{option}</option>
            ))}
          </select>
        )}
        {question.type === "rating" && (
          <div className="flex space-x-1">
            {question.options?.map((_, starIndex) => (
              <span key={starIndex} className="w-8 h-8 inline-flex items-center justify-center text-yellow-300">★</span>
            ))}
          </div>
        )}
        {question.type === "file" && (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50">
            <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Zone de dépôt de fichier</p>
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

            <div className="px-4 md:px-8 py-6">
              <div className="mx-auto max-w-5xl space-y-6">
                <div className="text-center border-b pb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{form.title || 'Nouveau formulaire'}</h2>
                  {form.description && <p className="text-gray-600 mb-4">{form.description}</p>}
                  <div className="flex justify-center gap-4 mt-4 flex-wrap">
                    <Badge variant="outline" className="flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      {form.questions.length} question(s)
                    </Badge>
                    {form.maxResponses && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        Max: {form.maxResponses} réponses
                      </Badge>
                    )}
                    {form.expirationDate && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Expire le: {form.expirationDate.toLocaleDateString('fr-FR')}
                      </Badge>
                    )}
                  </div>
                </div>

                {form.questions.length > 0 ? (
                  <div className="space-y-4">
                    {form.questions.map((q, i) => renderQuestion(q, i))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Aucune question dans ce formulaire</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action rapide: ouvrir la vue publique dans un nouvel onglet */}
          <div className="text-center mt-4">
            <Link href={shareUrl} target="_blank">
              <Button variant="outline"><Eye className="w-4 h-4 mr-2" />Ouvrir la vue publique</Button>
            </Link>
          </div>
        </main>
      </div>
    </div>
  )
}


