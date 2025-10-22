"use client"

import { useState } from "react"
import type { Question } from "@/types/form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Copy, 
  Trash2, 
  MoreVertical, 
  Image as ImageIcon,
  Plus,
  X,
  ArrowUpDown
} from "lucide-react"

interface GoogleQuestionEditorProps {
  question: Question
  onUpdate: (question: Question) => void
  onDelete: () => void
  onDuplicate: () => void
  totalQuestions?: number
}

const QUESTION_TYPES = [
  { value: "text", label: "Réponse courte", icon: "📝" },
  { value: "textarea", label: "Paragraphe", icon: "📄" },
  { value: "radio", label: "Choix multiples", icon: "🔘" },
  { value: "checkbox", label: "Cases à cocher", icon: "☑️" },
  { value: "select", label: "Liste déroulante", icon: "📋" },
  { value: "file", label: "Importer un fichier", icon: "📎" },
  { value: "rating", label: "Échelle linéaire", icon: "📏" },
  { value: "number", label: "Avis", icon: "⭐" },
  { value: "date", label: "Date", icon: "📅" },
  { value: "time", label: "Heure", icon: "🕐" }
]

export function GoogleQuestionEditor({ 
  question, 
  onUpdate, 
  onDelete, 
  onDuplicate,
  totalQuestions = 1
}: GoogleQuestionEditorProps) {
  const [options, setOptions] = useState(question.options || ["Option n° 1"])
  const [focused, setFocused] = useState(false)

  const updateQuestion = (updates: Partial<Question>) => {
    onUpdate({ ...question, ...updates })
  }

  const addOption = () => {
    const newOptions = [...options, `Option n° ${options.length + 1}`]
    setOptions(newOptions)
    updateQuestion({ options: newOptions })
  }

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
    updateQuestion({ options: newOptions })
  }

  const removeOption = (index: number) => {
    if (options.length > 1) {
      const newOptions = options.filter((_, i) => i !== index)
      setOptions(newOptions)
      updateQuestion({ options: newOptions })
    }
  }

  const addOtherOption = () => {
    const newOptions = [...options, "Autre"]
    setOptions(newOptions)
    updateQuestion({ options: newOptions })
  }

  const hasOptions = question.type === "radio" || question.type === "checkbox" || question.type === "select"
  const currentType = QUESTION_TYPES.find(type => type.value === question.type) || QUESTION_TYPES[0]

  const handleFocus = () => {
    setFocused(true)
  }

  const handleBlur = (e: React.FocusEvent) => {
    // Ne pas perdre le focus si on clique sur un élément à l'intérieur de la carte
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setFocused(false)
    }
  }

  return (
    <Card 
      className={`mb-6 transition-all duration-200 border-l-4 ${
        focused ? 'border-l-[#E40046] shadow-lg' : 'border-l-gray-200'
      } cursor-pointer`}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onClick={handleFocus}
      tabIndex={0}
    >
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Contenu principal */}
          <div className="flex-1 space-y-4">
            {/* Titre et type de question */}
            <div className="flex items-center gap-4">
              <Input
                value={question.title}
                onChange={(e) => updateQuestion({ title: e.target.value })}
                placeholder="Question sans titre"
                className="flex-1 text-lg font-medium border-0 border-b-2 border-gray-200 rounded-none px-0 focus:border-[#E40046] focus:ring-0"
              />
              
              <select
                value={question.type}
                onChange={(e) => updateQuestion({ 
                  type: e.target.value as Question['type'],
                  options: hasOptions ? options : undefined
                })}
                className="w-48 h-10 px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#E40046] focus:border-transparent"
              >
                {QUESTION_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Position dans le formulaire */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">Position:</span>
              </div>
              <Input
                type="number"
                min="1"
                max={totalQuestions}
                value={question.position || ''}
                onChange={(e) => {
                  const value = e.target.value
                  if (value === '') {
                    updateQuestion({ position: undefined })
                    return
                  }
                  const newPosition = parseInt(value)
                  if (!isNaN(newPosition) && newPosition >= 1 && newPosition <= totalQuestions) {
                    updateQuestion({ position: newPosition })
                  }
                }}
                placeholder="Auto"
                className="w-24 h-8 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#E40046] focus:border-transparent"
              />
              <span className="text-sm text-gray-500">sur {totalQuestions}</span>
              {question.position && (
                <span className="text-xs text-gray-400">
                  {question.position > totalQuestions ? 'Hors limite' : `Page ${Math.ceil(question.position / 5)}`}
                </span>
              )}
            </div>

            {/* Description optionnelle */}
            {question.description !== undefined && (
              <Input
                value={question.description}
                onChange={(e) => updateQuestion({ description: e.target.value })}
                placeholder="Description"
                className="border-0 border-b border-gray-200 rounded-none px-0 text-sm text-gray-600"
              />
            )}

            {/* Options pour les questions à choix */}
            {hasOptions && (
              <div className="space-y-3 mt-6">
                {options.map((option, index) => (
                  <div key={index} className="flex items-center gap-3">
                    {/* Icône du type de choix */}
                    <div className="flex-shrink-0">
                      {question.type === "radio" && (
                        <div className="w-4 h-4 rounded-full border-2 border-gray-400"></div>
                      )}
                      {question.type === "checkbox" && (
                        <div className="w-4 h-4 border-2 border-gray-400 rounded"></div>
                      )}
                      {question.type === "select" && (
                        <span className="text-gray-400">{index + 1}.</span>
                      )}
                    </div>

                    {/* Champ d'option */}
                    <Input
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      className="flex-1 border-0 border-b border-gray-200 rounded-none px-2 py-1"
                      placeholder={`Option n° ${index + 1}`}
                    />

                    {/* Bouton supprimer */}
                    {options.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeOption(index)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}

                {/* Ajouter une option */}
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    {question.type === "radio" && (
                      <div className="w-4 h-4 rounded-full border-2 border-gray-300"></div>
                    )}
                    {question.type === "checkbox" && (
                      <div className="w-4 h-4 border-2 border-gray-300 rounded"></div>
                    )}
                    {question.type === "select" && (
                      <span className="text-gray-300">{options.length + 1}.</span>
                    )}
                  </div>
                  
                  <Button
                    variant="ghost"
                    onClick={addOption}
                    className="justify-start text-gray-500 hover:text-gray-700 px-2"
                  >
                    Ajouter une option
                  </Button>
                  
                  <span className="text-gray-400">ou</span>
                  
                  <Button
                    variant="ghost"
                    onClick={addOtherOption}
                    className="text-[#E40046] hover:text-[#E40046]/80 px-2"
                  >
                    ajouter "Autre"
                  </Button>
                </div>
              </div>
            )}

            {/* Aperçu pour les autres types de questions */}
            {!hasOptions && (
              <div className="mt-6 text-gray-400">
                {question.type === "text" && (
                  <div className="border-b border-dotted border-gray-300 py-2">
                    Réponse courte
                  </div>
                )}
                {question.type === "textarea" && (
                  <div className="border border-dotted border-gray-300 p-3 rounded">
                    Réponse longue
                  </div>
                )}
                {question.type === "date" && (
                  <div className="flex items-center gap-2 text-gray-400">
                    <span>jj/mm/aaaa</span>
                  </div>
                )}
                {question.type === "time" && (
                  <div className="flex items-center gap-2 text-gray-400">
                    <span>hh:mm</span>
                  </div>
                )}
                {question.type === "number" && (
                  <div className="border-b border-dotted border-gray-300 py-2">
                    Votre réponse
                  </div>
                )}
                {question.type === "file" && (
                  <div className="border-2 border-dashed border-gray-300 p-6 rounded text-center">
                    <ImageIcon className="w-8 h-8 mx-auto mb-2" />
                    <p>Ajouter un fichier</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Actions à droite */}
          <div className="flex flex-col gap-2">
            <Button variant="ghost" size="sm" onClick={onDuplicate}>
              <Copy className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onDelete}>
              <Trash2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Barre d'actions en bas */}
        <div className="flex items-center justify-end mt-6 pt-4 border-t">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={question.required}
                onChange={(e) => updateQuestion({ required: e.target.checked })}
                className="rounded border-gray-300 text-[#E40046] focus:ring-[#E40046]"
              />
              Obligatoire
            </label>
            
            <Button variant="ghost" size="sm">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
