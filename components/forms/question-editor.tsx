"use client"

// Éditeur de questions pour les formulaires
import { useState } from "react"
import type { Question } from "@/types/form"
import { getQuestionCategory } from "@/lib/question-categories"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trash2, Plus, GripVertical, Settings, Eye } from "lucide-react"
import { CategorySelector } from "./category-selector"

interface QuestionEditorProps {
  question: Question
  onUpdate: (question: Question) => void
  onDelete: () => void
  availableQuestions?: Question[] // Pour la logique conditionnelle
}

export function QuestionEditor({ question, onUpdate, onDelete, availableQuestions = [] }: QuestionEditorProps) {
  const [options, setOptions] = useState(question.options || [])
  const [showCategorySelector, setShowCategorySelector] = useState(false)
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false)

  const category = getQuestionCategory(question.categoryId)

  const handleCategorySelect = (updatedQuestion: Question) => {
    onUpdate(updatedQuestion)
    setOptions(updatedQuestion.options || [])
    setShowCategorySelector(false)
  }

  const addOption = () => {
    const newOptions = [...options, `Option ${options.length + 1}`]
    setOptions(newOptions)
    onUpdate({ ...question, options: newOptions })
  }

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
    onUpdate({ ...question, options: newOptions })
  }

  const removeOption = (index: number) => {
    const newOptions = options.filter((_, i) => i !== index)
    setOptions(newOptions)
    onUpdate({ ...question, options: newOptions })
  }

  const updateValidationRule = (rule: string, value: any) => {
    const newValidationRules = { ...question.validationRules, [rule]: value }
    onUpdate({ ...question, validationRules: newValidationRules })
  }

  return (
    <>
      <Card className="mb-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-2">
            <GripVertical className="w-4 h-4 text-gray-400" />
            <CardTitle className="text-base">Question</CardTitle>
            {category && (
              <Badge variant="outline" className="ml-2">
                {category.icon} {category.name}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
            >
              <Settings className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onDelete}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Sélection de catégorie */}
          <div>
            <Label>Type de question</Label>
            <div className="mt-2">
              {category ? (
                <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{category.icon}</span>
                    <div>
                      <p className="font-medium">{category.name}</p>
                      <p className="text-sm text-gray-600">{category.description}</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowCategorySelector(true)}
                  >
                    Changer
                  </Button>
                </div>
              ) : (
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setShowCategorySelector(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Choisir un type de question
                </Button>
              )}
            </div>
          </div>

          {/* Titre et description */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="title">Titre de la question</Label>
            <Input
              id="title"
              value={question.title}
              onChange={(e) => onUpdate({ ...question, title: e.target.value })}
              placeholder="Nouvelle question"
            />
            </div>
            <div>
              <Label htmlFor="description">Description (optionnelle)</Label>
              <Textarea
                id="description"
                value={question.description || ""}
                onChange={(e) => onUpdate({ ...question, description: e.target.value })}
                placeholder="Ajoutez une description pour clarifier la question"
                rows={2}
              />
            </div>
          </div>

          {/* Placeholder pour les champs texte */}
          {(question.type === "text" || question.type === "textarea" || question.type === "email") && (
            <div>
              <Label htmlFor="placeholder">Texte d'aide</Label>
              <Input
                id="placeholder"
                value={question.placeholder || ""}
                onChange={(e) => onUpdate({ ...question, placeholder: e.target.value })}
                placeholder="Ex: Entrez votre nom complet"
              />
            </div>
          )}

          {/* Options pour les questions à choix */}
          {category?.hasOptions && (
            <div>
              <Label>Options de réponse</Label>
              <div className="space-y-2 mt-2">
                {options.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                    />
                    {options.length > 1 && (
                      <Button variant="ghost" size="sm" onClick={() => removeOption(index)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addOption}>
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter une option
                </Button>
              </div>
            </div>
          )}

          {/* Paramètres de base */}
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => onUpdate({ ...question, required: !question.required })}
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

          {/* Paramètres avancés */}
          {showAdvancedSettings && (
            <div className="border-t pt-4 space-y-4">
              <h4 className="font-medium text-gray-900">Paramètres avancés</h4>
              
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
        </CardContent>
      </Card>

      {/* Sélecteur de catégories */}
      {showCategorySelector && (
        <CategorySelector
          onSelectCategory={handleCategorySelect}
          onClose={() => setShowCategorySelector(false)}
        />
      )}
    </>
  )
}
