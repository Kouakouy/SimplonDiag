"use client"

// Modal générique pour la configuration des questions
import { useState, useEffect } from "react"
import type { Question } from "@/types/form"
import { getQuestionCategory } from "@/lib/question-categories"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, Eye, Settings, Plus, Trash2 } from "lucide-react"

interface QuestionModalProps {
  categoryId: string
  onSave: (question: Question) => void
  onClose: () => void
  existingQuestion?: Question
}

export function QuestionModal({ categoryId, onSave, onClose, existingQuestion }: QuestionModalProps) {
  const [question, setQuestion] = useState<Question>({
    id: existingQuestion?.id || `q${Date.now()}`,
    categoryId,
    type: "text",
    title: existingQuestion?.title || "",
    description: existingQuestion?.description || "",
    required: existingQuestion?.required || false,
    options: existingQuestion?.options || [],
    placeholder: existingQuestion?.placeholder || "",
    validationRules: existingQuestion?.validationRules || {},
    conditionalLogic: existingQuestion?.conditionalLogic || undefined,
    isMultipleChoice: existingQuestion?.isMultipleChoice || false,
  })

  const [showPreview, setShowPreview] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [options, setOptions] = useState<string[]>(question.options || [])

  const category = getQuestionCategory(categoryId)

  useEffect(() => {
    if (category) {
      setQuestion(prev => ({
        ...prev,
        type: category.type,
        isMultipleChoice: category.isMultipleChoice,
        options: category.defaultOptions ? [...category.defaultOptions] : [],
        validationRules: category.validationRules ? { ...category.validationRules } : {},
        conditionalLogic: category.conditionalLogic ? { ...category.conditionalLogic } : undefined,
      }))
      setOptions(category.defaultOptions ? [...category.defaultOptions] : [])
    }
  }, [categoryId, category])

  const handleSave = () => {
    const finalQuestion = {
      ...question,
      options: options.length > 0 ? options : undefined,
    }
    onSave(finalQuestion)
    onClose()
  }

  const addOption = () => {
    const newOptions = [...options, `Option ${options.length + 1}`]
    setOptions(newOptions)
  }

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
  }

  const removeOption = (index: number) => {
    const newOptions = options.filter((_, i) => i !== index)
    setOptions(newOptions)
  }

  const updateValidationRule = (rule: string, value: any) => {
    setQuestion(prev => ({
      ...prev,
      validationRules: {
        ...prev.validationRules,
        [rule]: value
      }
    }))
  }

  if (!category) return null

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden bg-white shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{category.icon}</span>
            <div>
              <CardTitle className="text-xl">{category.name}</CardTitle>
              <p className="text-sm text-gray-600">{category.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
            >
              <Eye className="w-4 h-4 mr-2" />
              {showPreview ? "Éditer" : "Aperçu"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <Settings className="w-4 h-4 mr-2" />
              Avancé
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="overflow-y-auto max-h-[70vh] p-6">
          {showPreview ? (
            <QuestionPreview question={question} options={options} />
          ) : (
            <div className="space-y-6">
              {/* Configuration de base */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Configuration de base</h3>
                
                <div>
                  <Label htmlFor="title">Titre de la question *</Label>
                  <Input
                    id="title"
                    value={question.title}
                    onChange={(e) => setQuestion(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Nouvelle question"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description (optionnelle)</Label>
                  <Textarea
                    id="description"
                    value={question.description || ""}
                    onChange={(e) => setQuestion(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Ajoutez une description pour clarifier la question"
                    rows={2}
                    className="mt-1"
                  />
                </div>

                {(question.type === "text" || question.type === "textarea" || question.type === "email") && (
                  <div>
                    <Label htmlFor="placeholder">Texte d'aide</Label>
                    <Input
                      id="placeholder"
                      value={question.placeholder || ""}
                      onChange={(e) => setQuestion(prev => ({ ...prev, placeholder: e.target.value }))}
                      placeholder="Ex: Entrez votre nom complet"
                      className="mt-1"
                    />
                  </div>
                )}

                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => setQuestion(prev => ({ ...prev, required: !prev.required }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#E40046] focus:ring-offset-2 ${
                      question.required 
                        ? 'bg-[#E40046]' 
                        : 'bg-gray-300 border-2 border-gray-400'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        question.required ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <Label htmlFor="required" className="text-gray-700 font-medium">
                    Question obligatoire
                  </Label>
                </div>
              </div>

              {/* Options de réponse */}
              {category.hasOptions && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Options de réponse</h3>
                  <div className="space-y-3">
                    {options.map((option, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          value={option}
                          onChange={(e) => updateOption(index, e.target.value)}
                          placeholder={`Option ${index + 1}`}
                        />
                        {options.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeOption(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button variant="outline" onClick={addOption}>
                      <Plus className="w-4 h-4 mr-2" />
                      Ajouter une option
                    </Button>
                  </div>
                </div>
              )}

              {/* Paramètres avancés */}
              {showAdvanced && (
                <div className="space-y-4 border-t pt-6">
                  <h3 className="text-lg font-semibold">Paramètres avancés</h3>
                  
                  {/* Règles de validation */}
                  <div className="grid grid-cols-2 gap-4">
                    {question.validationRules?.minLength !== undefined && (
                      <div>
                        <Label htmlFor="minLength">Longueur minimale</Label>
                        <Input
                          id="minLength"
                          type="number"
                          value={question.validationRules.minLength || ""}
                          onChange={(e) => updateValidationRule("minLength", parseInt(e.target.value) || undefined)}
                          className="mt-1"
                        />
                      </div>
                    )}
                    {question.validationRules?.maxLength !== undefined && (
                      <div>
                        <Label htmlFor="maxLength">Longueur maximale</Label>
                        <Input
                          id="maxLength"
                          type="number"
                          value={question.validationRules.maxLength || ""}
                          onChange={(e) => updateValidationRule("maxLength", parseInt(e.target.value) || undefined)}
                          className="mt-1"
                        />
                      </div>
                    )}
                    {question.validationRules?.min !== undefined && (
                      <div>
                        <Label htmlFor="min">Valeur minimale</Label>
                        <Input
                          id="min"
                          type="number"
                          value={question.validationRules.min || ""}
                          onChange={(e) => updateValidationRule("min", parseInt(e.target.value) || undefined)}
                          className="mt-1"
                        />
                      </div>
                    )}
                    {question.validationRules?.max !== undefined && (
                      <div>
                        <Label htmlFor="max">Valeur maximale</Label>
                        <Input
                          id="max"
                          type="number"
                          value={question.validationRules.max || ""}
                          onChange={(e) => updateValidationRule("max", parseInt(e.target.value) || undefined)}
                          className="mt-1"
                        />
                      </div>
                    )}
                  </div>

                  {/* Logique conditionnelle */}
                  {question.conditionalLogic && (
                    <div>
                      <Label>Logique conditionnelle</Label>
                      <p className="text-sm text-gray-600 mt-1">
                        Cette question peut être affichée ou masquée selon les réponses à d'autres questions
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>

        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handleSave} className="bg-[#E40046] hover:bg-[#E40046]/80">
            {existingQuestion ? "Mettre à jour" : "Ajouter la question"}
          </Button>
        </div>
      </Card>
    </div>
  )
}

// Composant de prévisualisation
function QuestionPreview({ question, options }: { question: Question, options: string[] }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Aperçu de la question</h3>
      <div className="border rounded-lg p-6 bg-gray-50">
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-1">{question.title}</h4>
            {question.description && (
              <p className="text-sm text-gray-600">{question.description}</p>
            )}
          </div>

          {/* Rendu selon le type */}
          {question.type === "text" && (
            <Input placeholder={question.placeholder || "Votre réponse..."} disabled />
          )}

          {question.type === "textarea" && (
            <Textarea placeholder={question.placeholder || "Votre réponse..."} rows={3} disabled />
          )}

          {question.type === "email" && (
            <Input type="email" placeholder={question.placeholder || "exemple@email.com"} disabled />
          )}

          {question.type === "number" && (
            <Input type="number" placeholder="0" disabled />
          )}

          {question.type === "date" && (
            <Input type="date" disabled />
          )}

          {question.type === "radio" && (
            <div className="space-y-2">
              {options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input type="radio" name="preview" disabled />
                  <label className="text-sm">{option}</label>
                </div>
              ))}
            </div>
          )}

          {question.type === "checkbox" && (
            <div className="space-y-2">
              {options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input type="checkbox" disabled />
                  <label className="text-sm">{option}</label>
                </div>
              ))}
            </div>
          )}

          {question.type === "select" && (
            <select className="w-full p-2 border rounded" disabled>
              <option>Sélectionnez une option</option>
              {options.map((option, index) => (
                <option key={index}>{option}</option>
              ))}
            </select>
          )}

          {question.type === "rating" && (
            <div className="flex space-x-2">
              {options.map((_, index) => (
                <button key={index} className="w-8 h-8 border rounded text-gray-400" disabled>
                  ⭐
                </button>
              ))}
            </div>
          )}

          {question.required && (
            <p className="text-xs text-red-600">* Champ obligatoire</p>
          )}
        </div>
      </div>
    </div>
  )
}
