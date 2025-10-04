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
import { Inter } from "next/font/google"
import { hourglass } from 'ldrs'

// Enregistrer le composant hourglass
hourglass.register()

const inter = Inter({ subsets: ["latin"] })

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
    <div className={`${inter.className} min-h-screen bg-gradient-to-b from-gray-50 to-white`}>
      {/* Barre d'accent en haut (style Google Forms) */}
      <div className="h-2 w-full bg-gradient-to-r from-[#E40046] via-[#E40046]/80 to-rose-500"></div>

      <div className="max-w-3xl lg:max-w-4xl mx-auto px-4 py-4 lg:py-8">
        {/* Barre de progression */}
        <div className="mb-4 lg:mb-6">
          <div className="flex items-center justify-between text-xs lg:text-sm text-gray-600 mb-2">
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
            className={`h-32 sm:h-40 lg:h-48 mb-4 lg:mb-6 relative overflow-hidden rounded-xl ${form.bannerImageUrl ? 'bg-cover bg-center' : 'bg-gradient-to-r from-[#E40046] via-[#E40046]/80 to-rose-500'}`}
            style={form.bannerImageUrl ? { backgroundImage: `url(${form.bannerImageUrl})` } : {}}
          >
            <div className="absolute inset-0 bg-black/30"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              {form.bannerTitle && (
                <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-white drop-shadow-lg text-center px-4 lg:px-6">{form.bannerTitle}</h1>
              )}
            </div>
          </div>
        ) : null}

        {/* En-tête du formulaire */}
        <Card className="mb-6 lg:mb-8 shadow-sm border border-gray-200">
          <CardHeader className="text-center pb-4 p-4 lg:p-6">
            <CardTitle className="text-xl sm:text-2xl lg:text-3xl text-balance leading-tight">{form.title}</CardTitle>
            {form.description && <p className="text-sm lg:text-base text-gray-600 text-pretty mt-2">{form.description}</p>}
          </CardHeader>
          <CardContent className="p-4 lg:p-6 pt-0">
            <div className="flex items-center justify-center gap-4 lg:gap-6 text-xs lg:text-sm text-gray-500">
                <div className="flex items-center gap-2">
                    <svg 
                      className="w-3 h-3 lg:w-4 lg:h-4 text-gray-400" 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 24 24" 
                      fill="currentColor"
                    >
                      <path d="M12 2C6.48 2 2 6 2 11c0 2.39 1.04 4.55 2.77 6.13-.27.94-1 2.84-1.06 3.02a.75.75 0 0 0 1.03.91c.29-.1 2.4-.84 3.52-1.33A10.1 10.1 0 0 0 12 20c5.52 0 10-4 10-9s-4.48-9-10-9Zm.25 5.25c1.52 0 2.75 1.04 2.75 2.33 0 .88-.53 1.55-1.52 2.06-.78.4-1.23.88-1.23 1.61v.25a.75.75 0 0 1-1.5 0v-.25c0-1.36.8-2.2 1.73-2.67.58-.3.77-.6.77-1 0-.44-.55-.83-1.25-.83s-1.25.39-1.25.83a.75.75 0 0 1-1.5 0c0-1.29 1.23-2.33 2.75-2.33Zm0 7.75a.9.9 0 1 1 0 1.8.9.9 0 0 1 0-1.8Z"/>
                    </svg>
                    <span>{form.questions.length} questions</span>
                  </div>
            </div>
          </CardContent>
        </Card>


        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
          {visibleQuestions.map((question, index) => (
            <Card key={question.id} className="shadow-sm border border-gray-200">
              <CardContent className="p-4 lg:p-6">
                <div className="space-y-3 lg:space-y-4">
                  <div className="flex items-start gap-2 lg:gap-3">
                    <div className="mt-0.5 select-none">
                      <div className="w-6 h-6 lg:w-7 lg:h-7 rounded-full bg-[#E40046]/10 text-[#E40046] flex items-center justify-center text-xs lg:text-sm font-semibold">
                        {startIndex + index + 1}
                      </div>
                    </div>
                    <div className="flex-1">
                      <Label htmlFor={question.id} className="text-sm lg:text-base font-semibold text-gray-900">
                        {question.title}
                        {question.required && <span className="text-red-500 ml-1">*</span>}
                      </Label>
                      {question.description && <p className="text-xs lg:text-sm text-gray-500 mt-1">{question.description}</p>}
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

                  {/* Champ date */}
                  {question.type === "date" && (
                    <Input
                      id={question.id}
                      type="date"
                      value={(answers[question.id] as string) || ""}
                      onChange={(e) => handleInputChange(question.id, e.target.value)}
                      className={errors[question.id] ? "border-red-500" : ""}
                    />
                  )}

                  {/* Champ nombre */}
                  {question.type === "number" && (
                    <Input
                      id={question.id}
                      type="number"
                      value={(answers[question.id] as string) || ""}
                      onChange={(e) => handleInputChange(question.id, e.target.value)}
                      placeholder={question.placeholder || "0"}
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

                  {/* Champ évaluation (rating) */}
                  {question.type === "rating" && (
                    <div className={`space-y-2 ${errors[question.id] ? "border border-red-500 rounded-lg p-3" : ""}`}>
                      <div className="flex space-x-2">
                        {question.options?.map((_, starIndex) => (
                          <button
                            key={starIndex}
                            type="button"
                            className={`w-10 h-10 inline-flex items-center justify-center text-3xl transition-colors focus:outline-none ${
                              ((answers[question.id] as string) || "").includes((starIndex + 1).toString())
                                ? "text-yellow-400"
                                : "text-gray-300 hover:text-yellow-400"
                            }`}
                            onClick={() => handleInputChange(question.id, (starIndex + 1).toString())}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Champ fichier */}
                  {question.type === "file" && (
                    <div className={`border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50 hover:bg-gray-100 transition-colors ${errors[question.id] ? "border-red-500" : ""}`}>
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">Glissez-déposez vos fichiers ici</p>
                      <p className="text-sm text-gray-500">ou cliquez pour sélectionner</p>
                      <input 
                        type="file" 
                        className="hidden" 
                        id={`file-${question.id}`}
                        multiple={question.isMultipleChoice}
                        onChange={(e) => {
                          const files = Array.from(e.target.files || [])
                          const fileNames = files.map(file => file.name)
                          handleInputChange(question.id, fileNames)
                        }}
                      />
                      <label 
                        htmlFor={`file-${question.id}`}
                        className="inline-block mt-3 px-4 py-2 bg-[#E40046] text-white rounded-lg hover:bg-[#E40046]/80 transition-colors cursor-pointer"
                      >
                        Choisir des fichiers
                      </label>
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
          <div className="sticky bottom-0 left-0 right-0 py-3 lg:py-4 bg-white/80 backdrop-blur border-t border-gray-200">
            <div className="max-w-3xl lg:max-w-4xl mx-auto px-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 lg:gap-4">
                <p className="text-xs lg:text-sm text-gray-600 hidden sm:block">
                  Vos réponses sont sécurisées et utilisées.
                </p>
                <div className="flex items-center gap-2">
                  <Button type="button" variant="outline" onClick={handlePrev} disabled={currentPage === 0 || submitting} className="flex-1 sm:flex-none text-xs lg:text-sm">
                    Précédent
                  </Button>
                  {currentPage < totalPages - 1 ? (
                    <Button type="button" onClick={handleNext} disabled={submitting} className="bg-[#E40046] hover:bg-[#E40046]/80 text-white px-4 lg:px-6 xl:px-8 py-2 flex-1 sm:flex-none text-xs lg:text-sm">
                      Suivant
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="bg-[#E40046] hover:bg-[#E40046]/80 text-white px-4 lg:px-6 xl:px-8 py-2 flex-1 sm:flex-none text-xs lg:text-sm"
                    >
                      {submitting ? (
                        <>
                          <div className="mr-1 lg:mr-2">
                            <l-hourglass size="12" bg-opacity="0.1" speed="1.75" color="white"></l-hourglass>
                          </div>
                          <span className="hidden sm:inline">Envoi en cours...</span>
                          <span className="sm:hidden">Envoi...</span>
                        </>
                      ) : (
                        <>
                          <span className="hidden sm:inline">Envoyer mes réponses</span>
                          <span className="sm:hidden">Envoyer</span>
                        </>
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
          <p>Propulsé par Simplon Africa</p>
        </div>
      </div>
    </div>
  )
}
