"use client"

import type React from "react"

// Page publique pour répondre aux formulaires
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import type { Form } from "@/types/form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Select } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { apiRequest } from "@/lib/api"
import { FileText, CheckCircle, AlertCircle, Clock, Users } from "lucide-react"

export default function PublicFormPage() {
  const params = useParams()
  const router = useRouter()
  const formRouteParam = params.id as string

  const [form, setForm] = useState<Form | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({})
  const [respondentName, setRespondentName] = useState("")
  const [respondentEmail, setRespondentEmail] = useState("")
  const [currentPage, setCurrentPage] = useState(0)
  const pageSize = 5

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        // On traite désormais formId comme un slug public
        const f = await apiRequest<any>({ url: `/public/forms/${formRouteParam}` })
        const adapted: Form = {
          id: f._id || f.id || formRouteParam,
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
  }, [formRouteParam])

  const handleInputChange = (questionId: string, value: string | string[]) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
    // Supprimer l'erreur si elle existe
    if (errors[questionId]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[questionId]
        return newErrors
      })
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Validation des infos répondant (uniquement page 1)
    if (currentPage === 0) {
      if (!respondentName.trim()) {
        newErrors["__respondent_name"] = "Le nom est obligatoire"
      }
      if (!respondentEmail.trim()) {
        newErrors["__respondent_email"] = "L'email est obligatoire"
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(respondentEmail)) {
          newErrors["__respondent_email"] = "Veuillez entrer une adresse email valide"
        }
      }
    }

    const start = currentPage * pageSize
    const end = start + pageSize
    const questionsInPage = form?.questions.slice(start, end) || []

    questionsInPage.forEach((question) => {
      if (question.required) {
        const answer = answers[question.id]
        if (!answer || (Array.isArray(answer) && answer.length === 0) || answer === "") {
          newErrors[question.id] = "Cette question est obligatoire"
        }
      }

      // Validation email
      if (question.type === "email" && answers[question.id]) {
        const email = answers[question.id] as string
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
          newErrors[question.id] = "Veuillez entrer une adresse email valide"
        }
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const totalPages = Math.ceil((form?.questions.length || 0) / pageSize) || 1
  const startIndex = currentPage * pageSize
  const endIndex = startIndex + pageSize
  const visibleQuestions = form?.questions.slice(startIndex, endIndex) || []

  const handleNext = () => {
    if (!validateForm()) return
    if (currentPage < totalPages - 1) {
      setCurrentPage((p) => p + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handlePrev = () => {
    if (currentPage > 0) {
      setCurrentPage((p) => p - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return
    if (currentPage < totalPages - 1) return

    setSubmitting(true)

    try {
      await apiRequest({ url: `/forms/${form?.id}/responses`, method: 'POST', body: {
        respondent_name: respondentName.trim(),
        respondent_email: respondentEmail.trim(),
        answers,
      } })
      setSubmitted(true)
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e)
      alert('Erreur lors de la soumission')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E40046] mx-auto mb-4"></div>
          <p className="text-gray-500">Chargement du formulaire...</p>
        </div>
      </div>
    )
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Formulaire introuvable</h2>
            <p className="text-gray-500 mb-4">Le formulaire que vous cherchez n'existe pas ou n'est plus disponible.</p>
            <Button onClick={() => router.push("/")} className="bg-[#E40046] hover:bg-[#E40046]/80 text-white">
              Retour à l'accueil
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!form.isPublic) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Formulaire privé</h2>
            <p className="text-gray-500 mb-4">Ce formulaire n'est pas accessible au public.</p>
            <Button onClick={() => router.push("/")} className="bg-[#E40046] hover:bg-[#E40046]/80 text-white">
              Retour à l'accueil
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Merci !</h2>
            <p className="text-gray-600 mb-6">Votre réponse a été enregistrée avec succès.</p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-green-800">
                Nous avons bien reçu vos réponses. Elles seront analysées dans les plus brefs délais.
              </p>
            </div>
            <Button onClick={() => router.push("/")} className="bg-[#E40046] hover:bg-[#E40046]/80 text-white">
              Fermer
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Barre d'accent en haut (style Google Forms) */}
      <div className="h-2 w-full bg-gradient-to-r from-[#E40046] via-[#E40046]/80 to-rose-500"></div>

      <div className="max-w-3xl md:max-w-4xl mx-auto px-4 py-8">
        {/* Barre de progression */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Page {currentPage + 1} / {totalPages}</span>
            <span>{form.questions.length} questions</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#E40046]/10 via-[#E40046]/5 to-rose-200"
              style={{ width: `${((currentPage + 1) / totalPages) * 100}%` }}
            />
          </div>
        </div>
        {/* Bannière */}
        {(form.bannerTitle || form.bannerImageUrl) ? (
          <div 
            className={`h-40 md:h-48 mb-6 relative overflow-hidden rounded-xl ${form.bannerImageUrl ? 'bg-cover bg-center' : 'bg-gradient-to-r from-[#E40046] via-[#E40046]/80 to-rose-500'}`}
            style={form.bannerImageUrl ? { backgroundImage: `url(${form.bannerImageUrl})` } : {}}
          >
            <div className="absolute inset-0 bg-black/30"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              {form.bannerTitle && (
                <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg text-center px-6">{form.bannerTitle}</h1>
              )}
            </div>
          </div>
        ) : null}

        {/* En-tête du formulaire */}
        <Card className="mb-8 shadow-sm border border-gray-200">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-3xl text-balance leading-tight">{form.title}</CardTitle>
            {form.description && <p className="text-gray-600 text-pretty mt-2">{form.description}</p>}
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>~3 minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>{form.questions.length} questions</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Infos répondant */}
        <Card className="mb-6 shadow-sm border border-gray-200 overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-[#E40046] via-[#E40046]/80 to-rose-500" />
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#E40046]/10 text-[#E40046] flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12 12c2.761 0 5-2.239 5-5S14.761 2 12 2 7 4.239 7 7s2.239 5 5 5Zm0 2c-3.866 0-7 2.134-7 4.762V21h14v-2.238C19 16.134 15.866 14 12 14Z"/></svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Vos informations</h3>
                  <p className="text-xs text-gray-500">Utilisées pour identifier votre réponse</p>
                </div>
              </div>
              <div className="hidden md:flex items-center gap-2 text-xs text-gray-500">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                Sécurisé
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Avatar aperçu */}
              <div className="md:col-span-1">
                <div className="flex items-center gap-3 p-3 rounded-lg border bg-gray-50">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#E40046] to-rose-500 text-white flex items-center justify-center text-lg font-bold">
                    {(respondentName?.trim()?.charAt(0) || '?').toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">{respondentName || 'Nom du répondant'}</div>
                    <div className="text-xs text-gray-500 truncate">{respondentEmail || 'email@exemple.com'}</div>
                  </div>
                </div>
              </div>

              {/* Nom */}
              <div className="md:col-span-1">
                <Label htmlFor="respondent_name" className="text-sm font-medium text-gray-800">Nom</Label>
                <div className="relative mt-1">
                  <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.761 0 5-2.239 5-5S14.761 2 12 2 7 4.239 7 7s2.239 5 5 5Zm0 2c-3.866 0-7 2.134-7 4.762V21h14v-2.238C19 16.134 15.866 14 12 14Z"/></svg>
                  <Input
                    id="respondent_name"
                    value={respondentName}
                    onChange={(e) => setRespondentName(e.target.value)}
                    placeholder="Votre nom"
                    className={`${errors["__respondent_name"] ? "border-red-500" : ""} pl-9`}
                  />
                </div>
                {errors["__respondent_name"] && (
                  <p className="text-sm text-red-600 mt-1">{errors["__respondent_name"]}</p>
                )}
              </div>

              {/* Email */}
              <div className="md:col-span-1">
                <Label htmlFor="respondent_email" className="text-sm font-medium text-gray-800">Email</Label>
                <div className="relative mt-1">
                  <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm-1.4 4.25-5.64 4.23a2 2 0 0 1-2.52 0L4.8 8.25a.75.75 0 1 1 .9-1.2l5.64 4.23a.5.5 0 0 0 .62 0L18.6 7.05a.75.75 0 1 1 .9 1.2Z"/></svg>
                  <Input
                    id="respondent_email"
                    type="email"
                    value={respondentEmail}
                    onChange={(e) => setRespondentEmail(e.target.value)}
                    placeholder="exemple@email.com"
                    className={`${errors["__respondent_email"] ? "border-red-500" : ""} pl-9`}
                  />
                </div>
                {errors["__respondent_email"] && (
                  <p className="text-sm text-red-600 mt-1">{errors["__respondent_email"]}</p>
                )}
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
              <svg className="w-4 h-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1.75a6.25 6.25 0 0 0-6.25 6.25c0 4.982 5.654 9.642 5.896 9.844a.75.75 0 0 0 .708.106.75.75 0 0 0 .29-.106c.242-.202 5.856-4.862 5.856-9.844A6.25 6.25 0 0 0 12 1.75Zm0 8.5a2.25 2.25 0 1 1 0-4.5 2.25 2.25 0 0 1 0 4.5Z"/></svg>
              Vos informations ne seront jamais partagées sans votre consentement.
            </div>
          </CardContent>
        </Card>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {visibleQuestions.map((question, index) => (
            <Card key={question.id} className="shadow-sm border border-gray-200">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 select-none">
                      <div className="w-7 h-7 rounded-full bg-[#E40046]/10 text-[#E40046] flex items-center justify-center text-sm font-semibold">
                        {startIndex + index + 1}
                      </div>
                    </div>
                    <div className="flex-1">
                      <Label htmlFor={question.id} className="text-base font-semibold text-gray-900">
                        {question.title}
                        {question.required && <span className="text-red-500 ml-1">*</span>}
                      </Label>
                      {question.description && <p className="text-sm text-gray-500 mt-1">{question.description}</p>}
                    </div>
                  </div>

                  {/* Champ texte */}
                  {question.type === "text" && (
                    <Input
                      id={question.id}
                      value={(answers[question.id] as string) || ""}
                      onChange={(e) => handleInputChange(question.id, e.target.value)}
                      placeholder={question.placeholder}
                      className={errors[question.id] ? "border-red-500" : ""}
                    />
                  )}

                  {/* Champ email */}
                  {question.type === "email" && (
                    <Input
                      id={question.id}
                      type="email"
                      value={(answers[question.id] as string) || ""}
                      onChange={(e) => handleInputChange(question.id, e.target.value)}
                      placeholder={question.placeholder || "exemple@email.com"}
                      className={errors[question.id] ? "border-red-500" : ""}
                    />
                  )}

                  {/* Zone de texte */}
                  {question.type === "textarea" && (
                    <Textarea
                      id={question.id}
                      value={(answers[question.id] as string) || ""}
                      onChange={(e) => handleInputChange(question.id, e.target.value)}
                      placeholder={question.placeholder}
                      rows={4}
                      className={errors[question.id] ? "border-red-500" : ""}
                    />
                  )}

                  {/* Liste déroulante */}
                  {question.type === "select" && (
                    <Select
                      value={(answers[question.id] as string) || ""}
                      onChange={(e) => handleInputChange(question.id, e.target.value)}
                      className={errors[question.id] ? "border-red-500" : ""}
                    >
                      <option value="">Sélectionnez une option</option>
                      {question.options?.map((option, optionIndex) => (
                        <option key={optionIndex} value={option}>
                          {option}
                        </option>
                      ))}
                    </Select>
                  )}

                  {/* Boutons radio */}
                  {question.type === "radio" && (
                    <RadioGroup
                      value={(answers[question.id] as string) || ""}
                      onValueChange={(value) => handleInputChange(question.id, value)}
                      className={errors[question.id] ? "border border-red-500 rounded-lg p-3" : ""}
                    >
                      {question.options?.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex items-center space-x-2">
                          <RadioGroupItem value={option} id={`${question.id}-${optionIndex}`} />
                          <Label htmlFor={`${question.id}-${optionIndex}`} className="cursor-pointer">
                            {option}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}

                  {/* Cases à cocher */}
                  {question.type === "checkbox" && (
                    <div className={`space-y-2 ${errors[question.id] ? "border border-red-500 rounded-lg p-3" : ""}`}>
                      {question.options?.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex items-center space-x-2">
                          <Checkbox
                            id={`${question.id}-${optionIndex}`}
                            checked={((answers[question.id] as string[]) || []).includes(option)}
                            onCheckedChange={(checked) => {
                              const currentAnswers = (answers[question.id] as string[]) || []
                              if (checked) {
                                handleInputChange(question.id, [...currentAnswers, option])
                              } else {
                                handleInputChange(
                                  question.id,
                                  currentAnswers.filter((a) => a !== option),
                                )
                              }
                            }}
                          />
                          <Label htmlFor={`${question.id}-${optionIndex}`} className="cursor-pointer">
                            {option}
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Message d'erreur */}
                  {errors[question.id] && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{errors[question.id]}</AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Barre de soumission collante */}
          <div className="sticky bottom-0 left-0 right-0 py-4 bg-white/80 backdrop-blur border-t border-gray-200">
            <div className="max-w-3xl md:max-w-4xl mx-auto px-4">
              <div className="flex items-center justify-between gap-4">
                <p className="text-xs md:text-sm text-gray-600 hidden md:block">
                  Vos réponses sont sécurisées et utilisées uniquement pour cette enquête.
                </p>
                <div className="flex items-center gap-2">
                  <Button type="button" variant="outline" onClick={handlePrev} disabled={currentPage === 0 || submitting}>
                    Précédent
                  </Button>
                  {currentPage < totalPages - 1 ? (
                    <Button type="button" onClick={handleNext} disabled={submitting} className="bg-[#E40046] hover:bg-[#E40046]/80 text-white px-6 md:px-8 py-2">
                      Suivant
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="bg-[#E40046] hover:bg-[#E40046]/80 text-white px-6 md:px-8 py-2"
                    >
                      {submitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Envoi en cours...
                        </>
                      ) : (
                        "Envoyer mes réponses"
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Pied de page */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>Propulsé par Simplon Form</p>
        </div>
      </div>
    </div>
  )
}
