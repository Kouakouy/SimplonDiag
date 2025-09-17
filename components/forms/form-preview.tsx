"use client"

// Composant d'aperçu du formulaire
import type { Form, Question } from "@/types/form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, FileText, Image as ImageIcon, Users, Calendar } from "lucide-react"

interface FormPreviewProps {
  form: Partial<Form>
  onClose: () => void
}

export function FormPreview({ form, onClose }: FormPreviewProps) {
  const renderQuestion = (question: Question, index: number) => {
    const questionNumber = index + 1

    return (
      <div key={question.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <div className="mb-3">
          <h4 className="font-medium text-gray-900">
            {questionNumber}. {question.title}
            {question.required && <span className="text-red-500 ml-1">*</span>}
          </h4>
          {question.description && (
            <p className="text-sm text-gray-600 mt-1">{question.description}</p>
          )}
        </div>

        {/* Rendu selon le type de question */}
        {question.type === "text" && (
          <Input 
            placeholder={question.placeholder || "Votre réponse"} 
            disabled 
            className="max-w-xl"
          />
        )}

        {question.type === "textarea" && (
          <Textarea 
            placeholder={question.placeholder || "Votre réponse"} 
            rows={4} 
            disabled 
            className="max-w-2xl"
          />
        )}

        {question.type === "email" && (
          <Input 
            type="email" 
            placeholder={question.placeholder || "exemple@email.com"} 
            disabled 
            className="max-w-md"
          />
        )}

        {question.type === "number" && (
          <Input 
            type="number" 
            placeholder="0" 
            disabled 
            className="max-w-40"
          />
        )}

        {question.type === "date" && (
          <Input 
            type="date" 
            disabled 
            className="max-w-48"
          />
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
          <select 
            className="w-full max-w-xl p-2 border rounded-md bg-white" 
            disabled
          >
            <option>Sélectionnez une option</option>
            {question.options?.map((option, optionIndex) => (
              <option key={optionIndex}>{option}</option>
            ))}
          </select>
        )}

        {question.type === "rating" && (
          <div className="flex space-x-1">
            {question.options?.map((_, starIndex) => (
              <span 
                key={starIndex} 
                className="w-8 h-8 inline-flex items-center justify-center text-yellow-300"
              >
                ★
              </span>
            ))}
          </div>
        )}

        {question.type === "file" && (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50">
            <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Zone de dépôt de fichier</p>
            <input type="file" className="hidden" disabled />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-hidden bg-white shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-pink-600" />
            <div>
              <CardTitle className="text-xl">Aperçu du formulaire</CardTitle>
              <p className="text-sm text-gray-600">Prévisualisation de votre formulaire</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        <CardContent className="overflow-y-auto max-h:[70vh] p-0">
          <div className="space-y-0">
            {/* Bannière du formulaire */}
            {(form.bannerTitle || form.bannerImageUrl) && (
              <div 
                className={`h-40 md:h-48 flex items-center justify-center relative ${
                  form.bannerImageUrl 
                    ? 'bg-cover bg-center' 
                    : 'bg-gradient-to-r from-pink-500 via-rose-500 to-red-500'
                }`}
                style={form.bannerImageUrl ? { backgroundImage: `url(${form.bannerImageUrl})` } : {}}
              >
                {/* Overlay pour améliorer la lisibilité */}
                <div className="absolute inset-0 bg-black/30"></div>
                
                {/* Contenu de la bannière */}
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

            {/* Contenu principal */}
            <div className="px-4 md:px-8 py-6">
              <div className="mx-auto max-w-2xl space-y-6">
              {/* En-tête du formulaire */}
              <div className="text-center border-b pb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {form.title || "Nouveau formulaire"}
                </h1>
                {form.description && (
                  <p className="text-gray-600 mb-4">{form.description}</p>
                )}
                
                {/* Informations sur le formulaire */}
                <div className="flex justify-center gap-4 mt-4 flex-wrap">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    {form.questions?.length || 0} question(s)
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

              {/* Questions */}
              {form.questions && form.questions.length > 0 ? (
                <div className="space-y-4">
                  {form.questions.map((question, index) => renderQuestion(question, index))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Aucune question dans ce formulaire</p>
                  <p className="text-sm">Ajoutez des questions pour voir l'aperçu</p>
                </div>
              )}

              {/* Bouton de soumission */}
              {form.questions && form.questions.length > 0 && (
                <div className="border-t pt-6 text-center">
                  <Button 
                    className="bg-[#E40046] hover:bg-pink-700 px-8 py-2"
                    disabled
                  >
                    Soumettre le formulaire
                  </Button>
                </div>
              )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}