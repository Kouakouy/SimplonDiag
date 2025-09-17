"use client"

// Sélecteur de catégories de questions
import { useState } from "react"
import { QUESTION_CATEGORIES, type QuestionCategory } from "@/lib/question-categories"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Plus } from "lucide-react"
import { QuestionModal } from "./question-modal"
import type { Question } from "@/types/form"

interface CategorySelectorProps {
  onSelectCategory: (question: Question) => void
  onClose: () => void
}

export function CategorySelector({ onSelectCategory, onClose }: CategorySelectorProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [showQuestionModal, setShowQuestionModal] = useState(false)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("")

  // Filtrer les catégories
  const filteredCategories = QUESTION_CATEGORIES.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         category.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedType === "all" || category.type === selectedType
    return matchesSearch && matchesType
  })

  // Grouper par type
  const categoriesByType = filteredCategories.reduce((acc, category) => {
    if (!acc[category.type]) {
      acc[category.type] = []
    }
    acc[category.type].push(category)
    return acc
  }, {} as Record<string, QuestionCategory[]>)

  const typeLabels = {
    text: "Texte",
    email: "Email",
    select: "Liste déroulante",
    radio: "Choix unique",
    checkbox: "Choix multiples",
    textarea: "Texte long",
    number: "Nombre",
    date: "Date",
    rating: "Évaluation",
    file: "Fichier"
  }

  const handleCategoryClick = (category: QuestionCategory) => {
    setSelectedCategoryId(category.id)
    setShowQuestionModal(true)
  }

  const handleQuestionSave = (question: Question) => {
    onSelectCategory(question)
    setShowQuestionModal(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[85vh] overflow-hidden bg-white shadow-2xl border-0">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Choisir un type de question</CardTitle>
          <Button variant="ghost" onClick={onClose}>
            ✕
          </Button>
        </CardHeader>
        <CardContent className="overflow-y-auto max-h-[65vh] bg-white">
          {/* Barre de recherche et filtres */}
          <div className="mb-6 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Rechercher un type de question..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedType === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedType("all")}
              >
                Tous
              </Button>
              {Object.entries(typeLabels).map(([type, label]) => (
                <Button
                  key={type}
                  variant={selectedType === type ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedType(type)}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>

          {/* Liste des catégories */}
          <div className="space-y-6">
            {Object.entries(categoriesByType).map(([type, categories]) => (
              <div key={type}>
                <h3 className="text-lg font-semibold mb-3 text-gray-700">
                  {typeLabels[type as keyof typeof typeLabels]}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {categories.map((category) => (
                    <Card
                      key={category.id}
                      className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-[#E40046] bg-white hover:bg-[#E40046]/5"
                      onClick={() => handleCategoryClick(category)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="text-2xl">{category.icon}</div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 mb-1">
                              {category.name}
                            </h4>
                            <p className="text-sm text-gray-600 mb-2">
                              {category.description}
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {category.isMultipleChoice && (
                                <Badge variant="secondary" className="text-xs">
                                  Choix multiples
                                </Badge>
                              )}
                              {category.hasOptions && (
                                <Badge variant="outline" className="text-xs">
                                  Avec options
                                </Badge>
                              )}
                              {category.validationRules?.required && (
                                <Badge variant="destructive" className="text-xs">
                                  Obligatoire
                                </Badge>
                              )}
                            </div>
                          </div>
                          <Button size="sm" className="bg-[#E40046] hover:bg-[#E40046]/80 text-white">
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {filteredCategories.length === 0 && (
            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
              <p>Aucune catégorie trouvée pour "{searchTerm}"</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de configuration de question */}
      {showQuestionModal && selectedCategoryId && (
        <QuestionModal
          categoryId={selectedCategoryId}
          onSave={handleQuestionSave}
          onClose={() => setShowQuestionModal(false)}
        />
      )}
    </div>
  )
}
