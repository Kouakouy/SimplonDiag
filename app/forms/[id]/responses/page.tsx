"use client"

import { Label } from "@/components/ui/label"

// Page de visualisation des réponses du formulaire
import { useState, useEffect, useRef } from "react"
import { useParams } from "next/navigation"
import type { Form, FormResponse } from "@/types/form"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { apiRequest } from "@/lib/api"
import { analysisService } from "@/lib/analysis"
import type { FormAnalysis } from "@/types/analysis"
import { DeepSeekStatus } from "@/components/ai/DeepSeekStatus"
import {
  ArrowLeft,
  Download,
  Search,
  Calendar,
  User,
  Mail,
  Eye,
  FileSpreadsheet,
  BarChart3,
  Share,
  Edit,
  X,
  Printer,
  FileText,
  Brain,
  TrendingUp,
  CheckCircle,
  Upload,
  Settings,
  Columns,
  PieChart,
  Users,
} from "lucide-react"
import Link from "next/link"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { FormStatsCharts } from "@/components/forms/form-stats-charts"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ResponsesPage() {
  const params = useParams()
  const formId = params.id as string
  const [form, setForm] = useState<Form | null>(null)
  const [responses, setResponses] = useState<FormResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedResponse, setSelectedResponse] = useState<FormResponse | null>(null)
  const [activeTab, setActiveTab] = useState("liste")
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [showResponseModal, setShowResponseModal] = useState(false)
  const [selectedResponseForModal, setSelectedResponseForModal] = useState<FormResponse | null>(null)
  const exportMenuRef = useRef<HTMLDivElement>(null)
  const [backendStats, setBackendStats] = useState<{ views: number; submissions: number; completionRate: number } | null>(null)
  const [aiAnalysis, setAiAnalysis] = useState<FormAnalysis | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showAnalyzeMenu, setShowAnalyzeMenu] = useState(false)
  const [showAnalysisModal, setShowAnalysisModal] = useState(false)
  const analyzeMenuRef = useRef<HTMLDivElement>(null)
  const [showColumnSettings, setShowColumnSettings] = useState(false)
  const [visibleColumns, setVisibleColumns] = useState<string[]>([])
  const [showPromptModal, setShowPromptModal] = useState(false)
  const [customPrompt, setCustomPrompt] = useState("")
  const [savedAnalyses, setSavedAnalyses] = useState<FormAnalysis[]>([])
  const [showSavedAnalysesModal, setShowSavedAnalysesModal] = useState(false)
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number>(0)
  const [selectedResponseIndex, setSelectedResponseIndex] = useState<number>(0)

  // Fermer les menus quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false)
      }
      if (analyzeMenuRef.current && !analyzeMenuRef.current.contains(event.target as Node)) {
        setShowAnalyzeMenu(false)
      }
    }

    if (showExportMenu || showAnalyzeMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showExportMenu, showAnalyzeMenu])

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        // Charger le formulaire avec questions pour entêtes d'export
        const f = await apiRequest<any>({ url: `/forms/${formId}` })
        // Adapter aux types attendus côté UI (questions/réponses peuvent être vides ici)
        const adaptedForm: Form = {
          id: f._id || f.id || formId,
          title: f.title || "",
          description: f.description || "",
          bannerTitle: undefined,
          bannerImageUrl: undefined,
          questions: f.questions || [],
          isPublic: f.is_public ?? true,
          expirationDate: undefined,
          maxResponses: undefined,
          createdAt: f.created_at ? new Date(f.created_at) : new Date(),
          updatedAt: f.updated_at ? new Date(f.updated_at) : new Date(),
          responses: [],
        }
        setForm(adaptedForm)

        // Charger les réponses
        const resp = await apiRequest<any[]>({ url: `/forms/${formId}/responses` })
        const adaptedResponses: FormResponse[] = (resp || []).map((r: any) => ({
          id: r._id || r.id,
          formId: adaptedForm.id,
          respondentName: r.respondent_name || "",
          respondentEmail: r.respondent_email || "",
          answers: r.answers || {},
          submittedAt: r.submitted_at ? new Date(r.submitted_at) : new Date(),
        }))
        setResponses(adaptedResponses)

        // Charger les analyses sauvegardées
        try {
          const analyses = await apiRequest<any[]>({ url: `/forms/${formId}/analyses` })
          setSavedAnalyses(analyses || [])
        } catch {
          // ignore si non disponible
        }

        // Charger les stats backend si disponibles
        try {
          const stats = await apiRequest<any>({ url: `/forms/${formId}/stats` })
          if (stats) {
            setBackendStats({
              views: stats.views ?? 0,
              submissions: stats.submissions ?? adaptedResponses.length,
              completionRate: stats.completionRate ?? 0,
            })
          }
        } catch {
          // ignore si non disponible
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [formId])

  // Fonction pour détecter si le formulaire demande des informations personnelles
  const hasPersonalInfoFields = () => {
    if (!form) return false
    
    // Vérifier si le formulaire a des questions de type nom/prénom
    const hasNameField = form.questions.some(q => 
      q.type === 'text' && (
        q.title.toLowerCase().includes('nom') || 
        q.title.toLowerCase().includes('name') ||
        q.title.toLowerCase().includes('prénom') ||
        q.title.toLowerCase().includes('prenom') ||
        q.title.toLowerCase().includes('firstname') ||
        q.title.toLowerCase().includes('lastname')
      )
    )
    
    const hasEmailField = form.questions.some(q => 
      q.type === 'email' || (
        q.type === 'text' && (
          q.title.toLowerCase().includes('email') || 
          q.title.toLowerCase().includes('courriel') ||
          q.title.toLowerCase().includes('e-mail')
        )
      )
    )
    
    return hasNameField || hasEmailField
  }

  // Fonction pour obtenir le type de formulaire
  const getFormType = () => {
    if (!form) return 'unknown'
    
    const hasPersonalInfo = hasPersonalInfoFields()
    
    if (hasPersonalInfo) {
      return 'personal' // Formulaire avec informations personnelles
    } else {
      return 'survey' // Sondage/anonyme
    }
  }

  // Fonction pour obtenir toutes les colonnes disponibles
  const getAllAvailableColumns = () => {
    if (!form) return []
    
    const columns = []
    const formType = getFormType()
    
    // Pour les sondages (sans infos personnelles), ajouter un ID de réponse
    if (formType === 'survey') {
      columns.push({
        key: 'response_id',
        title: 'Réponse #',
        type: 'response_id',
        width: '80px',
        required: true
      })
    }
    
    // Ajouter les colonnes nom/email seulement si elles existent dans les questions
    const nameQuestion = form.questions.find(q => 
      q.type === 'text' && (
        q.title.toLowerCase().includes('nom') || 
        q.title.toLowerCase().includes('name') ||
        q.title.toLowerCase().includes('prénom') ||
        q.title.toLowerCase().includes('prenom') ||
        q.title.toLowerCase().includes('firstname') ||
        q.title.toLowerCase().includes('lastname')
      )
    )
    
    const emailQuestion = form.questions.find(q => 
      q.type === 'email' || (
        q.type === 'text' && (
          q.title.toLowerCase().includes('email') || 
          q.title.toLowerCase().includes('courriel') ||
          q.title.toLowerCase().includes('e-mail')
        )
      )
    )
    
    if (nameQuestion) {
      columns.push({
        key: 'respondent_name',
        title: nameQuestion.title,
        type: 'name',
        width: '150px',
        required: false
      })
    }
    
    if (emailQuestion) {
      columns.push({
        key: 'respondent_email',
        title: emailQuestion.title,
        type: 'email',
        width: '200px',
        required: false
      })
    }
    
    // Ajouter la colonne date (toujours visible)
    columns.push({
      key: 'submitted_at',
      title: 'Date de soumission',
      type: 'date',
      width: '150px',
      required: true
    })
    
    // Ajouter toutes les questions comme colonnes supplémentaires
    form.questions.forEach(q => {
      // Exclure les questions nom/email déjà ajoutées
      const isNameOrEmail = (q.type === 'text' && (
        q.title.toLowerCase().includes('nom') || 
        q.title.toLowerCase().includes('name') ||
        q.title.toLowerCase().includes('prénom') ||
        q.title.toLowerCase().includes('prenom') ||
        q.title.toLowerCase().includes('firstname') ||
        q.title.toLowerCase().includes('lastname') ||
        q.title.toLowerCase().includes('email') || 
        q.title.toLowerCase().includes('courriel') ||
        q.title.toLowerCase().includes('e-mail')
      )) || q.type === 'email'
      
      if (!isNameOrEmail) {
        columns.push({
          key: `question_${q.id}`,
          title: q.title.length > 25 ? q.title.substring(0, 25) + '...' : q.title,
          type: 'question',
          questionId: q.id,
          width: '120px',
          required: false
        })
      }
    })
    
    return columns
  }

  // Fonction pour obtenir les colonnes à afficher (filtrées par visibleColumns)
  const getDisplayColumns = () => {
    const allColumns = getAllAvailableColumns()
    
    // Si aucune colonne n'est sélectionnée, afficher les colonnes par défaut
    if (visibleColumns.length === 0) {
      return allColumns.filter(col => col.required || allColumns.indexOf(col) < 5)
    }
    
    return allColumns.filter(col => visibleColumns.includes(col.key))
  }

  // Fonction pour obtenir la valeur d'une cellule
  const getCellValue = (response: FormResponse, column: any) => {
    switch (column.type) {
      case 'response_id':
        return `#${responses.indexOf(response) + 1}`
      case 'name':
        return response.respondentName || 'Non renseigné'
      case 'email':
        return response.respondentEmail || 'Non renseigné'
      case 'date':
        return response.submittedAt.toLocaleDateString("fr-FR")
      case 'question':
        const answer = response.answers[column.questionId]
        if (Array.isArray(answer)) {
          return answer.join(', ')
        }
        return answer || 'Non renseigné'
      default:
        return ''
    }
  }

  const filteredResponses = responses.filter((response) => {
    if (!searchTerm) return true
    
    const searchLower = searchTerm.toLowerCase()
    
    // Rechercher dans les champs nom/email si disponibles
    if (response.respondentName?.toLowerCase().includes(searchLower)) return true
    if (response.respondentEmail?.toLowerCase().includes(searchLower)) return true
    
    // Rechercher dans les réponses aux questions
    return Object.values(response.answers).some(answer => {
      if (Array.isArray(answer)) {
        return answer.some(item => item.toLowerCase().includes(searchLower))
      }
      return String(answer).toLowerCase().includes(searchLower)
    })
  })

  const openResponseModal = (response: FormResponse) => {
    setSelectedResponseForModal(response)
    setShowResponseModal(true)
  }

  const exportSingleResponse = (response: FormResponse) => {
    if (!form) return
    
    const headers = ["Question", "Réponse"]
    const rows = form.questions.map((q) => {
      const value = response.answers[q.id]
      return [q.title, Array.isArray(value) ? value.join("; ") : (value || "Aucune réponse")]
    })
    
    const csvContent = [headers, ...rows].map((row) => row.map((field) => `"${field}"`).join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `reponse_${response.respondentName.replace(/\s+/g, '_')}_${response.submittedAt.toISOString().split('T')[0]}.csv`
    link.click()
  }

  const printSingleResponse = (response: FormResponse) => {
    if (!form) return
    
    const printWindow = window.open("", "_blank")
    if (!printWindow) return
    
    const content = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <title>Réponse - ${form.title}</title>
        <style>
          @page {
            margin: 1in;
            size: A4;
          }
          
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 0;
            color: #333;
            line-height: 1.6;
          }
          
          .header {
            background: linear-gradient(135deg, #E40046 0%, #C7003A 100%);
            color: white;
            padding: 20px;
            margin-bottom: 30px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          
          .header-content {
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          
          .logo-section {
            display: flex;
            align-items: center;
            gap: 15px;
          }
          
          .logo {
            width: 50px;
            height: 50px;
            background: white;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            color: #E40046;
            font-size: 18px;
          }
          
          .company-info h1 {
            margin: 0;
            font-size: 24px;
            font-weight: bold;
          }
          
          .company-info p {
            margin: 5px 0 0 0;
            font-size: 14px;
            opacity: 0.9;
          }
          
          .response-info {
            text-align: right;
          }
          
          .response-info .respondent {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          
          .response-info .date {
            font-size: 14px;
            opacity: 0.9;
          }
          
          .content {
            margin-bottom: 30px;
          }
          
          h2 {
            color: #E40046;
            font-size: 20px;
            margin-bottom: 20px;
            border-bottom: 2px solid #E40046;
            padding-bottom: 10px;
          }
          
          .info-card {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 30px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          
          .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
          }
          
          .info-item {
            display: flex;
            flex-direction: column;
          }
          
          .info-label {
            font-weight: bold;
            color: #E40046;
            font-size: 12px;
            text-transform: uppercase;
            margin-bottom: 5px;
          }
          
          .info-value {
            font-size: 14px;
            color: #333;
          }
          
          .questions-section {
            margin-top: 30px;
          }
          
          .question {
            margin-bottom: 20px;
            padding: 20px;
            border-left: 4px solid #E40046;
            background: #f8f9fa;
            border-radius: 0 8px 8px 0;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          
          .question-title {
            font-weight: bold;
            color: #E40046;
            font-size: 16px;
            margin-bottom: 10px;
          }
          
          .answer {
            font-size: 14px;
            color: #333;
            background: white;
            padding: 10px;
            border-radius: 4px;
            border: 1px solid #e9ecef;
          }
          
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #E40046;
            text-align: center;
            color: #666;
            font-size: 12px;
          }
          
          @media print {
            .header {
              background: #E40046 !important;
              -webkit-print-color-adjust: exact;
              color-adjust: exact;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="header-content">
            <div class="logo-section">
              <div class="logo">
                <img src="https://s10.aconvert.com/convert/p3r68-cdx67/auyhc-1st4f.jpg" alt="Simplon Logo" style="height:40px;vertical-align:middle;" />
              </div>
              <div class="company-info">
                <h1>Simplon</h1>
                <p>Plateforme de Formulaires</p>
              </div>
            </div>
            <div class="response-info">
              <div class="respondent">${response.respondentName}</div>
              <div class="date">${response.submittedAt.toLocaleDateString("fr-FR")}</div>
            </div>
          </div>
        </div>
        
        <div class="content">
          <h2>📝 Réponse au Formulaire - ${form.title}</h2>
          
          <div class="info-card">
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Nom du répondant</div>
                <div class="info-value">${response.respondentName}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Email</div>
                <div class="info-value">${response.respondentEmail}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Date de soumission</div>
                <div class="info-value">${response.submittedAt.toLocaleString("fr-FR")}</div>
              </div>
            </div>
          </div>
          
          <div class="questions-section">
            <h2>📋 Réponses aux Questions</h2>
            ${form.questions.map((q) => {
              const value = response.answers[q.id]
              const answer = Array.isArray(value) ? value.join(", ") : (value || "Aucune réponse")
              return `
                <div class="question">
                  <div class="question-title">${q.title}</div>
                  <div class="answer">${answer}</div>
                </div>
              `
            }).join("")}
          </div>
        </div>
        
        <div class="footer">
          <p>Généré le ${new Date().toLocaleString("fr-FR")} par Simplon Form Platform</p>
          <p>© ${new Date().getFullYear()} Simplon - Tous droits réservés</p>
        </div>
      </body>
      </html>
    `
    
    printWindow.document.write(content)
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
  }

  const openPromptModal = () => {
    setShowPromptModal(true)
    setShowAnalyzeMenu(false)
  }

  const generateAIAnalysis = async () => {
    if (!form) {
      alert("Formulaire non trouvé")
      return
    }
    
    if (responses.length === 0) {
      alert("Aucune réponse disponible pour l'analyse. Veuillez d'abord collecter des réponses.")
      return
    }
    
    setIsAnalyzing(true)
    setShowPromptModal(false)
    try {
      console.log("Début de l'analyse IA...", { formId: form.id, responsesCount: responses.length })
      
      // Utiliser le vrai service d'analyse avec DeepSeek
      const result = await analysisService.analyzeForm(form, responses, {
        formId: form.id,
        includeCharts: true,
        includeRecommendations: true,
        analysisDepth: 'detailed',
        customPrompt: customPrompt || undefined
      })

      console.log("Résultat de l'analyse:", result)

      if (result.success && result.analysis) {
        setAiAnalysis(result.analysis)
        // Basculer automatiquement vers l'onglet d'analyse pour voir les résultats
        setActiveTab("analyze")
        alert("Analyse générée avec succès !")
      } else {
        throw new Error(result.error || 'Erreur lors de l\'analyse')
      }
    } catch (error) {
      console.error("Erreur lors de l'analyse IA:", error)
      alert(`Erreur lors de l'analyse: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const saveAnalysis = async () => {
    if (!aiAnalysis || !form) {
      alert("Aucune analyse à sauvegarder")
      return
    }

    try {
      const analysisToSave = {
        ...aiAnalysis,
        formId: form.id,
        formTitle: form.title,
        createdAt: new Date().toISOString(),
        customPrompt: customPrompt || null
      }

      const response = await apiRequest({
        url: `/forms/${form.id}/analyses`,
        method: 'POST',
        body: analysisToSave
      })

      // Recharger les analyses sauvegardées
      const analyses = await apiRequest<any[]>({ url: `/forms/${form.id}/analyses` })
      setSavedAnalyses(analyses || [])
      
      alert("Analyse sauvegardée avec succès !")
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error)
      
      // Gestion d'erreurs plus spécifique
      let errorMessage = "Erreur inconnue"
      if (error instanceof Error) {
        if (error.message.includes("404")) {
          errorMessage = "Formulaire non trouvé"
        } else if (error.message.includes("400")) {
          errorMessage = "Données d'analyse invalides"
        } else if (error.message.includes("500")) {
          errorMessage = "Erreur serveur - veuillez réessayer"
        } else {
          errorMessage = error.message
        }
      }
      
      alert(`Erreur lors de la sauvegarde: ${errorMessage}`)
    }
  }

  const loadSavedAnalysis = (analysis: FormAnalysis) => {
    setAiAnalysis(analysis)
    setShowSavedAnalysesModal(false)
    setActiveTab("analyze")
  }

  const viewAnalysis = () => {
    if (savedAnalyses.length > 0) {
      setShowSavedAnalysesModal(true)
      setShowAnalyzeMenu(false)
    } else {
      alert("Aucune analyse sauvegardée disponible. Veuillez d'abord générer et sauvegarder une analyse.")
    }
  }

  // Fonction pour analyser les réponses d'une question
  const analyzeQuestionResponses = (questionId: string) => {
    const questionResponses = responses.map(r => r.answers[questionId]).filter(Boolean)
    const responseCounts: Record<string, number> = {}
    
    questionResponses.forEach(response => {
      if (Array.isArray(response)) {
        response.forEach(item => {
          responseCounts[item] = (responseCounts[item] || 0) + 1
        })
      } else {
        responseCounts[response] = (responseCounts[response] || 0) + 1
      }
    })

    return {
      totalResponses: questionResponses.length,
      responseCounts,
      uniqueResponses: Object.keys(responseCounts).length
    }
  }

  // Fonction pour générer un graphique à barres
  const renderBarChart = (questionId: string, questionTitle: string) => {
    const analysis = analyzeQuestionResponses(questionId)
    const maxCount = Math.max(...Object.values(analysis.responseCounts))
    
    return (
      <div className="space-y-3">
        {Object.entries(analysis.responseCounts).map(([response, count]) => (
          <div key={response} className="flex items-center gap-3">
            <div className="w-32 text-sm text-gray-600 truncate">{response}</div>
            <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
              <div 
                className="bg-[#E40046] h-6 rounded-full flex items-center justify-end pr-2"
                style={{ width: `${(count / maxCount) * 100}%` }}
              >
                <span className="text-white text-xs font-medium">{count}</span>
              </div>
            </div>
            <div className="w-12 text-sm text-gray-600 text-right">
              {((count / analysis.totalResponses) * 100).toFixed(1)}%
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Fonction pour générer un graphique circulaire
  const renderPieChart = (questionId: string, questionTitle: string) => {
    const analysis = analyzeQuestionResponses(questionId)
    const colors = ['#E40046', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8']
    
    return (
      <div className="flex flex-wrap gap-4">
        {Object.entries(analysis.responseCounts).map(([response, count], index) => (
          <div key={response} className="flex items-center gap-2">
            <div 
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: colors[index % colors.length] }}
            />
            <span className="text-sm text-gray-600">{response}</span>
            <span className="text-sm font-medium text-gray-800">({count})</span>
          </div>
        ))}
      </div>
    )
  }

  // Fonction pour générer un tableau de texte
  const renderTextTable = (questionId: string, questionTitle: string) => {
    const questionResponses = responses.map(r => r.answers[questionId]).filter(Boolean)
    
    return (
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {questionResponses.map((response, index) => (
          <div key={index} className="p-3 bg-gray-50 rounded-lg border">
            <div className="text-sm text-gray-600 mb-1">Réponse #{index + 1}</div>
            <div className="text-gray-800">{response}</div>
          </div>
        ))}
      </div>
    )
  }

  // Fonction pour déterminer le type de graphique selon le type de question
  const renderQuestionChart = (question: any, index: number) => {
    const analysis = analyzeQuestionResponses(question.id)
    
    if (analysis.totalResponses === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Aucune réponse pour cette question</p>
        </div>
      )
    }

    switch (question.type) {
      case 'radio':
      case 'select':
        return renderPieChart(question.id, question.title)
      case 'checkbox':
        return renderBarChart(question.id, question.title)
      case 'rating':
        return renderBarChart(question.id, question.title)
      case 'text':
      case 'textarea':
      case 'email':
      case 'number':
      case 'date':
        return renderTextTable(question.id, question.title)
      default:
        return renderBarChart(question.id, question.title)
    }
  }

  const showTableResults = () => {
    if (aiAnalysis) {
      setActiveTab("analyze")
      setShowAnalyzeMenu(false)
      // Scroll vers la section tableau
      setTimeout(() => {
        const tableSection = document.querySelector('[data-section="table"]')
        if (tableSection) {
          tableSection.scrollIntoView({ behavior: 'smooth' })
        }
      }, 100)
    } else {
      alert("Aucune analyse disponible. Veuillez d'abord générer une analyse.")
    }
  }

  const showChartResults = () => {
    if (aiAnalysis) {
      setActiveTab("analyze")
      setShowAnalyzeMenu(false)
      // Scroll vers la section graphiques
      setTimeout(() => {
        const chartSection = document.querySelector('[data-section="charts"]')
        if (chartSection) {
          chartSection.scrollIntoView({ behavior: 'smooth' })
        }
      }, 100)
    } else {
      alert("Aucune analyse disponible. Veuillez d'abord générer une analyse.")
    }
  }

  const exportToCSV = () => {
    if (!form || responses.length === 0) return

    // Créer les en-têtes CSV
    const headers = ["Nom", "Email", "Date de soumission", ...form.questions.map((q) => q.title)]

    // Créer les lignes de données
    const rows = responses.map((response) => [
      response.respondentName,
      response.respondentEmail,
      response.submittedAt.toLocaleDateString("fr-FR"),
      ...form.questions.map((q) => {
        const value = response.answers[q.id]
        return Array.isArray(value) ? value.join("; ") : (value || "")
      }),
    ])

    // Convertir en CSV
    const csvContent = [headers, ...rows].map((row) => row.map((field) => `"${field}"`).join(",")).join("\n")

    // Télécharger le fichier
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `${form.title}_reponses.csv`
    link.click()
  }

  const exportToExcel = () => {
    if (!form || responses.length === 0) return
    const headers = ["Nom", "Email", "Date de soumission", ...form.questions.map((q) => q.title)]
    const rows = responses.map((response) => [
      response.respondentName,
      response.respondentEmail,
      response.submittedAt.toLocaleString("fr-FR"),
      ...form.questions.map((q) => {
        const v = response.answers[q.id]
        return Array.isArray(v) ? v.join("; ") : (v || "")
      }),
    ])
    // Construire un tableau HTML compatible Excel
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8" /></head><body><table border="1">${[
      `<tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr>`,
      ...rows.map((r) => `<tr>${r.map((c) => `<td>${String(c).replace(/\n/g, '<br/>')}</td>`).join("")}</tr>`),
    ].join("")}</table></body></html>`
    const blob = new Blob([html], { type: "application/vnd.ms-excel" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `${form.title}_reponses.xls`
    link.click()
  }

  const exportToPDF = () => {
    if (!form || responses.length === 0) return
    
    const headers = ["Nom", "Email", "Date", ...form.questions.map((q) => q.title)]
    const rows = responses.map((response) => [
      response.respondentName || "Anonyme",
      response.respondentEmail || "Non renseigné",
      response.submittedAt.toLocaleString("fr-FR"),
      ...form.questions.map((q) => {
        const v = response.answers[q.id]
        return Array.isArray(v) ? v.join(", ") : (v || "Non renseigné")
      }),
    ])

    // Template HTML optimisé pour l'impression PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${form.title} - Réponses PDF</title>
        <style>
          @page {
            margin: 0.5in;
            size: A4 landscape;
          }
          
          * {
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 0;
            color: #333;
            line-height: 1.4;
            font-size: 11px;
            background: white;
          }
          
          .header {
            background: #E40046;
            color: white;
            padding: 15px 20px;
            margin-bottom: 20px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          
          .logo-section {
            display: flex;
            align-items: center;
            gap: 15px;
          }
          
          .logo {
            width: 40px;
            height: 40px;
            background: white;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            color: #E40046;
            font-size: 16px;
          }
          
          .company-info h1 {
            margin: 0;
            font-size: 18px;
            font-weight: bold;
          }
          
          .company-info p {
            margin: 2px 0 0 0;
            font-size: 12px;
            opacity: 0.9;
          }
          
          .report-info {
            text-align: right;
          }
          
          .report-info .date {
            font-size: 11px;
            opacity: 0.9;
          }
          
          .report-info .count {
            font-size: 14px;
            font-weight: bold;
            margin-top: 3px;
          }
          
          .form-title {
            font-size: 16px;
            font-weight: bold;
            color: #E40046;
            margin-bottom: 15px;
            text-align: center;
            padding: 10px;
            background: #f8f9fa;
            border-radius: 6px;
            border-left: 4px solid #E40046;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
            background: white;
            border-radius: 6px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          
          th {
            background: #E40046;
            color: white;
            padding: 8px 6px;
            text-align: left;
            font-weight: bold;
            font-size: 10px;
            white-space: nowrap;
          }
          
          td {
            padding: 6px;
            border-bottom: 1px solid #e9ecef;
            font-size: 9px;
            vertical-align: top;
            word-wrap: break-word;
            max-width: 120px;
          }
          
          tr:nth-child(even) {
            background: #f8f9fa;
          }
          
          .footer {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 2px solid #E40046;
            text-align: center;
            color: #666;
            font-size: 10px;
          }
          
          @media print {
            .header {
              background: #E40046 !important;
              -webkit-print-color-adjust: exact;
              color-adjust: exact;
            }
            
            th {
              background: #E40046 !important;
              -webkit-print-color-adjust: exact;
              color-adjust: exact;
            }
            
            body {
              -webkit-print-color-adjust: exact;
              color-adjust: exact;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo-section">
            <div class="logo">S</div>
            <div class="company-info">
              <h1>Simplon Africa</h1>
              <p>Plateforme de Formulaires</p>
            </div>
          </div>
          <div class="report-info">
            <div class="date">Généré le ${new Date().toLocaleString("fr-FR")}</div>
            <div class="count">${responses.length} réponse${responses.length > 1 ? 's' : ''}</div>
          </div>
        </div>
        
        <div class="form-title">📊 ${form.title}</div>
        
        <table>
          <thead>
            <tr>
              ${headers.map((h) => `<th>${h}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
            ${rows.map((r) => 
              `<tr>${r.map((c) => `<td>${String(c).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</td>`).join("")}</tr>`
            ).join("")}
          </tbody>
        </table>
        
        <div class="footer">
          <p>Généré le ${new Date().toLocaleString("fr-FR")} par Simplon Form Platform</p>
          <p>© ${new Date().getFullYear()} Simplon Africa - Tous droits réservés</p>
        </div>
      </body>
      </html>
    `

    // Ouvrir une nouvelle fenêtre pour l'impression PDF
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(htmlContent)
      printWindow.document.close()
      
      // Attendre que le contenu soit chargé puis déclencher l'impression
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.focus()
          printWindow.print()
          
          // Fermer la fenêtre après l'impression
          printWindow.onafterprint = () => {
            printWindow.close()
          }
        }, 500)
      }
    } else {
      // Fallback si les popups sont bloqués
      alert('Les popups sont bloqués. Veuillez autoriser les popups pour cette page et réessayer.')
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E40046] mx-auto mb-4"></div>
            <p className="text-gray-500">Chargement des réponses...</p>
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
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">Réponses: {form.title}</h1>
              {getFormType() === 'survey' && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                  <FileText className="w-3 h-3 mr-1" />
                  Sondage
                </Badge>
              )}
              {getFormType() === 'personal' && (
                <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                  <User className="w-3 h-3 mr-1" />
                  Avec identité
                </Badge>
              )}
            </div>
            <p className="text-gray-600 mt-1">
              {responses.length} réponse(s) collectée(s)
              {getFormType() === 'survey' && (
                <span className="text-sm text-gray-500 ml-2">
                  • Sondage sans informations personnelles
                </span>
              )}
              {getFormType() === 'personal' && (
                <span className="text-sm text-gray-500 ml-2">
                  • Formulaire avec informations personnelles
                </span>
              )}
            </p>
          </div>
          <div className="max-w-6xl mx-auto">
            {/* Actions en haut */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between mb-6 gap-4">
              <Link href="/forms">
                <Button variant="outline" className="w-full sm:w-auto">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour aux formulaires
                </Button>
              </Link>

              <div className="flex flex-wrap items-center gap-1 lg:gap-2">
                <Link href={`/forms/${form.id}/edit`}>
                  <Button variant="outline" className="text-xs lg:text-sm">
                    <Edit className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
                    <span className="hidden sm:inline">Éditer</span>
                  </Button>
                </Link>
                <Link href={`/forms/${form.id}/share`}>
                  <Button variant="outline" className="text-xs lg:text-sm">
                    <Share className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
                    <span className="hidden sm:inline">Partager</span>
                  </Button>
                </Link>
                <div className="relative" ref={analyzeMenuRef}>
                  <Button variant="outline" onClick={() => setShowAnalyzeMenu(!showAnalyzeMenu)} className="text-xs lg:text-sm">
                    <Brain className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
                    <span className="hidden sm:inline">Analyser avec IA</span>
                    <span className="sm:hidden">IA</span>
                  </Button>
                  
                  {showAnalyzeMenu && (
                    <div className="absolute right-0 mt-2 w-48 sm:w-56 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                      <div className="py-1">
                        <button
                          onClick={openPromptModal}
                          className="flex items-center w-full px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <Brain className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                          <span className="hidden sm:inline">Générer l'analyse</span>
                          <span className="sm:hidden">Générer</span>
                        </button>
                        <button
                          onClick={viewAnalysis}
                          className="flex items-center w-full px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                          <span className="hidden sm:inline">Voir l'analyse</span>
                          <span className="sm:hidden">Voir</span>
                        </button>
                        <button
                          onClick={showTableResults}
                          className="flex items-center w-full px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <FileText className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                          <span className="hidden sm:inline">Résultats en tableau</span>
                          <span className="sm:hidden">Tableau</span>
                        </button>
                        <button
                          onClick={showChartResults}
                          className="flex items-center w-full px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                          <span className="hidden sm:inline">Résultats en graphiques</span>
                          <span className="sm:hidden">Graphiques</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <div className="relative" ref={exportMenuRef}>
                  <Button variant="outline" onClick={() => setShowExportMenu(!showExportMenu)} className="text-xs lg:text-sm">
                    <Upload className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
                    <span className="hidden sm:inline">Exporter</span>
                    <span className="sm:hidden">Export</span>
                  </Button>
                  
                  {showExportMenu && (
                    <div className="absolute right-0 mt-2 w-40 sm:w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                      <div className="py-1">
                        <button
                          onClick={() => {
                            setShowExportMenu(false)
                            exportToCSV()
                          }}
                          className="flex items-center w-full px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <FileSpreadsheet className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                          <span className="hidden sm:inline">Exporter en CSV</span>
                          <span className="sm:hidden">CSV</span>
                        </button>
                        <button
                          onClick={() => {
                            setShowExportMenu(false)
                            exportToExcel()
                          }}
                          className="flex items-center w-full px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <FileSpreadsheet className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                          <span className="hidden sm:inline">Exporter en Excel</span>
                          <span className="sm:hidden">Excel</span>
                        </button>
                        <button
                          onClick={() => {
                            setShowExportMenu(false)
                            exportToPDF()
                          }}
                          className="flex items-center w-full px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <FileSpreadsheet className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                          <span className="hidden sm:inline">Exporter en PDF</span>
                          <span className="sm:hidden">PDF</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Statistiques rapides */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-gray-900">{responses.length}</div>
                  <div className="text-sm text-gray-600">Total réponses</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-green-600">{responses.filter(r => {
                    const d = r.submittedAt
                    const today = new Date()
                    return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()
                  }).length}</div>
                  <div className="text-sm text-gray-600">Aujourd'hui</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-blue-600">{responses.filter(r => {
                    const d = r.submittedAt.getTime()
                    const now = Date.now()
                    return d >= now - 7 * 24 * 3600 * 1000
                  }).length}</div>
                  <div className="text-sm text-gray-600">Cette semaine</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-purple-600">{backendStats ? `${Math.round(backendStats.completionRate)}%` : "—"}</div>
                  <div className="text-sm text-gray-600">Taux de complétion</div>
                </CardContent>
              </Card>
            </div>

            {/* Onglets */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex flex-wrap space-x-2 lg:space-x-8">
                <button
                  onClick={() => setActiveTab("liste")}
                  className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm ${
                    activeTab === "liste"
                      ? "border-[#E40046] text-[#E40046]"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <span className="hidden sm:inline">Liste des réponses</span>
                  <span className="sm:hidden">Liste</span>
                </button>
                <button
                  onClick={() => setActiveTab("resume")}
                  className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm ${
                    activeTab === "resume"
                      ? "border-[#E40046] text-[#E40046]"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Résumé
                </button>
                <button
                  onClick={() => setActiveTab("stats")}
                  className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm ${
                    activeTab === "stats"
                      ? "border-[#E40046] text-[#E40046]"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 inline" />
                  <span className="hidden sm:inline">Statistiques</span>
                  <span className="sm:hidden">Stats</span>
                </button>
                <button
                  onClick={() => setActiveTab("analyze")}
                  className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm ${
                    activeTab === "analyze"
                      ? "border-[#E40046] text-[#E40046]"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Brain className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 inline" />
                  <span className="hidden sm:inline">Analyse avec IA</span>
                  <span className="sm:hidden">IA</span>
                </button>
              </nav>
            </div>

            {/* Contenu conditionnel basé sur l'onglet actif */}
            {activeTab === "liste" && (
              <div className="space-y-4">
                {/* Recherche et filtres */}
                <div className="flex items-center gap-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder={getFormType() === 'survey' ? "Rechercher dans les réponses..." : "Rechercher par nom ou email..."}
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  
                  <div className="relative">
                    <Button
                      variant="outline"
                      onClick={() => setShowColumnSettings(!showColumnSettings)}
                      className="flex items-center gap-2"
                    >
                      <Columns className="w-4 h-4" />
                      Colonnes
                    </Button>
                    
                    {showColumnSettings && (
                      <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-medium text-gray-900">Colonnes à afficher</h3>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowColumnSettings(false)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                          
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                            {getAllAvailableColumns().map((column) => (
                              <div key={column.key} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id={`column-${column.key}`}
                                  checked={visibleColumns.length === 0 ? column.required : visibleColumns.includes(column.key)}
                                  onChange={(e) => {
                                    if (column.required) return // Les colonnes requises ne peuvent pas être désactivées
                                    
                                    if (e.target.checked) {
                                      setVisibleColumns([...visibleColumns, column.key])
                                    } else {
                                      setVisibleColumns(visibleColumns.filter(key => key !== column.key))
                                    }
                                  }}
                                  disabled={column.required}
                                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label 
                                  htmlFor={`column-${column.key}`}
                                  className={`text-sm ${column.required ? 'text-gray-500' : 'text-gray-700'}`}
                                >
                                  {column.title}
                                  {column.required && <span className="text-xs text-gray-400 ml-1">(requis)</span>}
                                </label>
                              </div>
                            ))}
                          </div>
                          
                          <div className="flex justify-between mt-4 pt-3 border-t">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const defaultColumns = getAllAvailableColumns()
                                  .filter(col => col.required || getAllAvailableColumns().indexOf(col) < 5)
                                  .map(col => col.key)
                                setVisibleColumns(defaultColumns)
                              }}
                            >
                              Par défaut
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const allColumns = getAllAvailableColumns().map(col => col.key)
                                setVisibleColumns(allColumns)
                              }}
                            >
                              Tout afficher
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Table des réponses */}
                {filteredResponses.length === 0 ? (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <div className="text-gray-400 mb-4">
                        <FileSpreadsheet className="w-12 h-12 mx-auto mb-2" />
                      </div>
                      <h4 className="text-lg font-medium text-gray-600 mb-2">
                        {responses.length === 0 ? "Aucune réponse" : "Aucune réponse trouvée"}
                      </h4>
                      <p className="text-gray-500">
                        {responses.length === 0
                          ? "Les réponses apparaîtront ici une fois que des utilisateurs auront rempli le formulaire"
                          : "Essayez avec d'autres mots-clés"}
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50 border-b">
                            <tr>
                              {getDisplayColumns().map((column) => (
                                <th 
                                  key={column.key} 
                                  className="text-left p-4 font-medium text-gray-900"
                                  style={{ width: column.width }}
                                >
                                  {column.title}
                                </th>
                              ))}
                              <th className="text-left p-4 font-medium text-gray-900">Statut</th>
                              <th className="text-right p-4 font-medium text-gray-900">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredResponses.map((response) => (
                              <tr key={response.id} className="border-b hover:bg-gray-50">
                                {getDisplayColumns().map((column) => (
                                  <td key={column.key} className="p-4">
                                    <div className="flex items-center gap-2">
                                      {column.type === 'response_id' && (
                                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-mono text-blue-600">
                                          #
                                        </div>
                                      )}
                                      {column.type === 'name' && (
                                        <User className="w-4 h-4 text-gray-400" />
                                      )}
                                      {column.type === 'email' && (
                                        <Mail className="w-4 h-4 text-gray-400" />
                                      )}
                                      {column.type === 'date' && (
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                      )}
                                      {column.type === 'question' && (
                                        <FileText className="w-4 h-4 text-gray-400" />
                                      )}
                                      <span className={`${
                                        column.type === 'name' ? 'font-medium' : 
                                        column.type === 'response_id' ? 'font-mono text-sm text-blue-600' :
                                        'text-gray-600'
                                      }`}>
                                        {getCellValue(response, column)}
                                      </span>
                                    </div>
                                  </td>
                                ))}
                                <td className="p-4">
                                  <Badge variant="default" className="bg-green-100 text-green-800">
                                    Complète
                                  </Badge>
                                </td>
                                <td className="p-4">
                                  <div className="flex items-center justify-end gap-2">
                                    <Button variant="ghost" size="sm" onClick={() => openResponseModal(response)} title="Voir la réponse">
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => exportSingleResponse(response)} title="Exporter la réponse">
                                      <Download className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => printSingleResponse(response)} title="Imprimer la réponse">
                                      <Printer className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}


            {activeTab === "resume" && (
                <div className="grid gap-6">
                  {form.questions.map((question) => (
                    <Card key={question.id}>
                      <CardHeader>
                        <CardTitle className="text-base">{question.title}</CardTitle>
                        <p className="text-sm text-gray-500">Type: {question.type}</p>
                      </CardHeader>
                      <CardContent>
                        {question.type === "radio" || question.type === "select" ? (
                          <div className="space-y-2">
                            {question.options?.map((option) => {
                              const count = responses.filter((r) => r.answers[question.id] === option).length
                              const percentage = responses.length > 0 ? (count / responses.length) * 100 : 0

                              return (
                                <div key={option} className="flex items-center justify-between">
                                  <span className="text-sm">{option}</span>
                                  <div className="flex items-center gap-2">
                                    <div className="w-32 bg-gray-200 rounded-full h-2">
                                      <div
                                        className="bg-[#E40046] h-2 rounded-full text-white"
                                        style={{ width: `${percentage}%` }}
                                      ></div>
                                    </div>
                                    <span className="text-sm text-gray-600 w-12 text-right">
                                      {count} ({percentage.toFixed(0)}%)
                                    </span>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-600">{responses.length} réponse(s) collectée(s)</div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
            )}

            {activeTab === "stats" && (
              <div className="space-y-6">
                {/* Statistiques avancées avec Chart.js */}
                <FormStatsCharts form={form} responses={responses} serverStats={backendStats} />
                
                {/* Statistiques détaillées avec onglets */}
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="overview" className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      Vue d'ensemble
                    </TabsTrigger>
                    <TabsTrigger value="questions" className="flex items-center gap-2">
                      <PieChart className="w-4 h-4" />
                      Vue par question
                    </TabsTrigger>
                    <TabsTrigger value="individual" className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Vue individuelle
                    </TabsTrigger>
                  </TabsList>

                  {/* Vue d'ensemble */}
                  <TabsContent value="overview" className="mt-6">
                    {responses.length === 0 ? (
                      <Card>
                        <CardContent className="p-12 text-center">
                          <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                          <h3 className="text-xl font-medium text-gray-600 mb-2">Aucune donnée disponible</h3>
                          <p className="text-gray-500 mb-6">Les statistiques apparaîtront une fois que des réponses seront reçues</p>
                          <Link href={`/f/${form.publicSlug || form.id}`} target="_blank">
                            <Button className="bg-[#E40046] hover:bg-[#E40046]/80 text-white">
                              Partager le formulaire
                            </Button>
                          </Link>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="space-y-6">
                        {form.questions.map((question, index) => (
                          <Card key={question.id}>
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                <span className="text-lg font-semibold">
                                  {index + 1}. {question.title}
                                </span>
                                <Badge variant="outline">{question.type}</Badge>
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              {renderQuestionChart(question, index)}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  {/* Vue par question */}
                  <TabsContent value="questions" className="mt-6">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                      {/* Liste des questions */}
                      <div className="lg:col-span-1">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Questions</CardTitle>
                          </CardHeader>
                          <CardContent className="p-0">
                            <div className="space-y-1">
                              {form.questions.map((question, index) => (
                                <button
                                  key={question.id}
                                  onClick={() => setSelectedQuestionIndex(index)}
                                  className={`w-full text-left p-3 hover:bg-gray-50 transition-colors ${
                                    selectedQuestionIndex === index ? 'bg-[#E40046]/10 border-r-2 border-[#E40046]' : ''
                                  }`}
                                >
                                  <div className="text-sm font-medium text-gray-900">
                                    {index + 1}. {question.title}
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    {question.type} • {analyzeQuestionResponses(question.id).totalResponses} réponses
                                  </div>
                                </button>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Détail de la question sélectionnée */}
                      <div className="lg:col-span-3">
                        {form.questions[selectedQuestionIndex] && (
                          <Card>
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                <span className="text-xl font-semibold">
                                  {selectedQuestionIndex + 1}. {form.questions[selectedQuestionIndex].title}
                                </span>
                                <Badge variant="outline">{form.questions[selectedQuestionIndex].type}</Badge>
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              {renderQuestionChart(form.questions[selectedQuestionIndex], selectedQuestionIndex)}
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  {/* Vue individuelle */}
                  <TabsContent value="individual" className="mt-6">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                      {/* Liste des réponses */}
                      <div className="lg:col-span-1">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Réponses</CardTitle>
                          </CardHeader>
                          <CardContent className="p-0">
                            <div className="space-y-1">
                              {responses.map((response, index) => (
                                <button
                                  key={response.id}
                                  onClick={() => setSelectedResponseIndex(index)}
                                  className={`w-full text-left p-3 hover:bg-gray-50 transition-colors ${
                                    selectedResponseIndex === index ? 'bg-[#E40046]/10 border-r-2 border-[#E40046]' : ''
                                  }`}
                                >
                                  <div className="text-sm font-medium text-gray-900">
                                    Réponse #{index + 1}
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    {response.submittedAt.toLocaleDateString('fr-FR')} à {response.submittedAt.toLocaleTimeString('fr-FR')}
                                  </div>
                                </button>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Détail de la réponse sélectionnée */}
                      <div className="lg:col-span-3">
                        {responses[selectedResponseIndex] && (
                          <Card>
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                <span>Réponse #{selectedResponseIndex + 1}</span>
                                <Badge variant="outline">
                                  {responses[selectedResponseIndex].submittedAt.toLocaleDateString('fr-FR')}
                                </Badge>
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                {form.questions.map((question, index) => (
                                  <div key={question.id} className="border-b pb-4 last:border-b-0">
                                    <h4 className="font-semibold text-gray-900 mb-2">
                                      {index + 1}. {question.title}
                                    </h4>
                                    <div className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                                      {responses[selectedResponseIndex].answers[question.id] || 'Aucune réponse'}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}

            {activeTab === "analyze" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="w-5 h-5" />
                      Analyse avec Intelligence Artificielle
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isAnalyzing ? (
                      <div className="text-center py-12">
                        <div className="relative mb-6">
                          <div className="animate-spin rounded-full h-20 w-20 border-4 border-gray-200 border-t-[#E40046] mx-auto"></div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Brain className="w-8 h-8 text-[#E40046]" />
                          </div>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">🤖 Analyse en cours...</h3>
                        <p className="text-lg text-gray-600 mb-6">
                          DeepSeek analyse vos réponses avec intelligence artificielle
                        </p>
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6 max-w-lg mx-auto">
                          <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                            Étapes de l'analyse
                          </h4>
                          <div className="space-y-2 text-sm text-blue-800">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span>📊 Collecte et préparation des données</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                              <span>🔍 Analyse des tendances et patterns</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                              <span>💡 Génération des insights et recommandations</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                              <span>📈 Création des graphiques et visualisations</span>
                            </div>
                          </div>
                          <div className="mt-4 text-xs text-blue-600">
                            ⏱️ Temps estimé : 10-30 secondes selon le nombre de réponses
                          </div>
                        </div>
                      </div>
                    ) : !aiAnalysis ? (
                      <div className="space-y-6">
                        <div className="text-center py-8">
                          <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune analyse disponible</h3>
                          <p className="text-gray-600 mb-6">
                            Utilisez le menu "Analyser avec IA" pour générer une nouvelle analyse.
                          </p>
                        </div>
                        
                        <div className="flex justify-center">
                          <DeepSeekStatus />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-semibold">Résultats de l'analyse</h3>
                            <div className="flex items-center gap-1 text-sm text-green-600">
                              <CheckCircle className="w-4 h-4" />
                              <span>Analyse terminée</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setAiAnalysis(null)}>
                              <X className="w-4 h-4 mr-2" />
                              Nouvelle analyse
                            </Button>
                            <Button variant="default" onClick={saveAnalysis} className="bg-green-600 hover:bg-green-700">
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Enregistrer l'analyse
                            </Button>
                            <Button variant="outline" onClick={() => {
                              const dataStr = JSON.stringify(aiAnalysis, null, 2)
                              const blob = new Blob([dataStr], { type: 'application/json' })
                              const link = document.createElement('a')
                              link.href = URL.createObjectURL(blob)
                              link.download = `analyse_${form?.title.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.json`
                              link.click()
                            }}>
                              <Download className="w-4 h-4 mr-2" />
                              Exporter l'analyse
                            </Button>
                          </div>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <h4 className="font-semibold text-blue-900 mb-2">Résumé exécutif</h4>
                          <p className="text-blue-800">{aiAnalysis.summary}</p>
                          <div className="mt-2 text-xs text-blue-600">
                            Confiance: {Math.round(aiAnalysis.metadata.confidence * 100)}% • 
                            {aiAnalysis.metadata.totalResponses} réponses analysées
                          </div>
                        </div>

                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <h4 className="font-semibold text-green-900 mb-2">Insights clés</h4>
                          <div className="space-y-2">
                            {aiAnalysis.insights.map((insight, index) => (
                              <div key={index} className="flex items-start gap-2">
                                <div className={`w-2 h-2 rounded-full mt-2 ${
                                  insight.category === 'trend' ? 'bg-blue-500' :
                                  insight.category === 'recommendation' ? 'bg-purple-500' :
                                  insight.category === 'warning' ? 'bg-red-500' : 'bg-green-500'
                                }`} />
                                <div>
                                  <p className="text-green-800 font-medium">{insight.title}</p>
                                  <p className="text-green-700 text-sm">{insight.description}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {aiAnalysis.recommendations.length > 0 && (
                          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                            <h4 className="font-semibold text-purple-900 mb-2">Recommandations</h4>
                            <div className="space-y-2">
                              {aiAnalysis.recommendations.map((rec, index) => (
                                <div key={index} className="flex items-start gap-2">
                                  <div className={`w-2 h-2 rounded-full mt-2 ${
                                    rec.priority === 'high' ? 'bg-red-500' :
                                    rec.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                                  }`} />
                                  <div>
                                    <p className="text-purple-800 font-medium">{rec.title}</p>
                                    <p className="text-purple-700 text-sm">{rec.description}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Vue tableau */}
                        <div className="space-y-4" data-section="table">
                          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            Résultats en tableau
                          </h4>
                          <Card>
                            <CardContent className="p-0">
                              <div className="overflow-x-auto">
                                <table className="w-full">
                                  <thead className="bg-gray-50 border-b">
                                    <tr>
                                      <th className="text-left p-4 font-medium text-gray-900">Question</th>
                                      <th className="text-left p-4 font-medium text-gray-900">Option</th>
                                      <th className="text-left p-4 font-medium text-gray-900">Nombre</th>
                                      <th className="text-left p-4 font-medium text-gray-900">Pourcentage</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {aiAnalysis.charts.map((chart, chartIndex: number) => 
                                      chart.data.map((item, itemIndex: number) => (
                                        <tr key={`${chartIndex}-${itemIndex}`} className="border-b hover:bg-gray-50">
                                          <td className="p-4 text-sm font-medium">{chart.questionTitle}</td>
                                          <td className="p-4 text-sm">{item.label}</td>
                                          <td className="p-4 text-sm">{item.value}</td>
                                          <td className="p-4 text-sm">
                                            {item.percentage.toFixed(1)}%
                                          </td>
                                        </tr>
                                      ))
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </CardContent>
                          </Card>
                        </div>

                        {/* Vue graphiques */}
                        <div className="space-y-4" data-section="charts">
                          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5" />
                            Résultats en graphiques
                          </h4>
                          <div className="grid gap-4">
                            {aiAnalysis.charts.map((chart, index: number) => (
                              <Card key={index}>
                                <CardHeader>
                                  <CardTitle className="text-base flex items-center gap-2">
                                    {chart.questionTitle}
                                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                      {chart.type}
                                    </span>
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="space-y-2">
                                    {chart.data.map((item, itemIndex: number) => (
                                      <div key={itemIndex} className="flex items-center justify-between">
                                        <span className="text-sm">{item.label}</span>
                                        <div className="flex items-center gap-2">
                                          <div className="w-32 bg-gray-200 rounded-full h-2">
                                            <div
                                              className="h-2 rounded-full"
                                              style={{ 
                                                width: `${item.percentage}%`,
                                                backgroundColor: item.color || '#E40046'
                                              }}
                                            ></div>
                                          </div>
                                          <span className="text-sm text-gray-600 w-12 text-right">
                                            {item.value}
                                          </span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Modal pour voir les réponses individuelles */}
            {showResponseModal && selectedResponseForModal && form && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Réponse de {selectedResponseForModal.respondentName}</h3>
                      <Button variant="outline" onClick={() => setShowResponseModal(false)}>
                        <X className="w-4 h-4 mr-2" />
                        Fermer
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                      <div>
                        <span className="font-medium text-gray-600">Nom:</span>
                        <p className="text-gray-900">{selectedResponseForModal.respondentName}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Email:</span>
                        <p className="text-gray-900">{selectedResponseForModal.respondentEmail}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Date de soumission:</span>
                        <p className="text-gray-900">{selectedResponseForModal.submittedAt.toLocaleString("fr-FR")}</p>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="font-medium text-gray-900 mb-3">Réponses aux questions</h4>
                      <div className="space-y-3">
                        {form.questions.map((question) => (
                          <div key={question.id} className="border-l-4 border-[#E40046]/20 pl-4">
                            <h5 className="font-medium text-gray-700 mb-1">{question.title}</h5>
                            <p className="text-gray-900">
                              {selectedResponseForModal.answers[question.id] || "Aucune réponse"}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Modal pour saisir le prompt personnalisé */}
            {showPromptModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg max-w-2xl w-full mx-4">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Brain className="w-5 h-5" />
                        Générer une analyse personnalisée
                      </h3>
                      <Button variant="outline" onClick={() => setShowPromptModal(false)}>
                        <X className="w-4 h-4 mr-2" />
                        Fermer
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="customPrompt" className="text-sm font-medium text-gray-700">
                          Prompt personnalisé (optionnel)
                        </Label>
                        <textarea
                          id="customPrompt"
                          className="w-full mt-2 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#E40046] focus:border-transparent"
                          rows={6}
                          placeholder="Décrivez ce que vous souhaitez analyser spécifiquement dans les réponses. Par exemple: 'Analysez les tendances de satisfaction client' ou 'Identifiez les points d'amélioration les plus fréquents'..."
                          value={customPrompt}
                          onChange={(e) => setCustomPrompt(e.target.value)}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Si vous ne spécifiez pas de prompt, l'IA effectuera une analyse générale des réponses.
                        </p>
                      </div>
                      
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-900 mb-2">Informations sur l'analyse</h4>
                        <div className="text-sm text-blue-800 space-y-1">
                          <p>• Formulaire: <strong>{form?.title}</strong></p>
                          <p>• Nombre de réponses: <strong>{responses.length}</strong></p>
                          <p>• Type d'analyse: <strong>Détaillée avec graphiques et recommandations</strong></p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end gap-3 mt-6">
                      <Button variant="outline" onClick={() => setShowPromptModal(false)}>
                        Annuler
                      </Button>
                      <Button 
                        onClick={generateAIAnalysis}
                        disabled={isAnalyzing}
                        className="bg-[#E40046] hover:bg-[#C7003A]"
                      >
                        {isAnalyzing ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Génération en cours...
                          </>
                        ) : (
                          <>
                            <Brain className="w-4 h-4 mr-2" />
                            Générer l'analyse
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Modal pour voir les analyses sauvegardées */}
            {showSavedAnalysesModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Brain className="w-5 h-5" />
                        Analyses sauvegardées - {form?.title}
                      </h3>
                      <Button variant="outline" onClick={() => setShowSavedAnalysesModal(false)}>
                        <X className="w-4 h-4 mr-2" />
                        Fermer
                      </Button>
                    </div>
                    
                    {savedAnalyses.length === 0 ? (
                      <div className="text-center py-12">
                        <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h4 className="text-lg font-medium text-gray-600 mb-2">Aucune analyse sauvegardée</h4>
                        <p className="text-gray-500">
                          Générez et sauvegardez une analyse pour la retrouver ici.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {savedAnalyses.map((analysis, index) => (
                          <Card key={index} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h4 className="font-semibold text-gray-900">
                                      Analyse #{index + 1}
                                    </h4>
                                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                                      Sauvegardée
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-gray-600 mb-2">
                                    {analysis.summary.length > 150 
                                      ? `${analysis.summary.substring(0, 150)}...` 
                                      : analysis.summary
                                    }
                                  </p>
                                  <div className="flex items-center gap-4 text-xs text-gray-500">
                                    <span>📊 {analysis.metadata.totalResponses} réponses</span>
                                    <span>🎯 {Math.round(analysis.metadata.confidence * 100)}% confiance</span>
                                    <span>📅 {new Date(analysis.createdAt || new Date()).toLocaleDateString("fr-FR")}</span>
                                    {analysis.customPrompt && (
                                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                        Prompt personnalisé
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => loadSavedAnalysis(analysis)}
                                  >
                                    <Eye className="w-4 h-4 mr-1" />
                                    Charger
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => {
                                      const dataStr = JSON.stringify(analysis, null, 2)
                                      const blob = new Blob([dataStr], { type: 'application/json' })
                                      const link = document.createElement('a')
                                      link.href = URL.createObjectURL(blob)
                                      link.download = `analyse_sauvegardee_${form?.title.replace(/[^a-zA-Z0-9]/g, '_')}_${index + 1}.json`
                                      link.click()
                                    }}
                                  >
                                    <Download className="w-4 h-4 mr-1" />
                                    Exporter
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Modal pour voir l'analyse IA */}
            {showAnalysisModal && aiAnalysis && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Brain className="w-5 h-5" />
                        Analyse IA - {form?.title}
                      </h3>
                      <Button variant="outline" onClick={() => setShowAnalysisModal(false)}>
                        <X className="w-4 h-4 mr-2" />
                        Fermer
                      </Button>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-900 mb-2">Résumé exécutif</h4>
                        <p className="text-blue-800">{aiAnalysis.summary}</p>
                        <div className="mt-2 text-xs text-blue-600">
                          Confiance: {Math.round(aiAnalysis.metadata.confidence * 100)}% • 
                          {aiAnalysis.metadata.totalResponses} réponses analysées
                        </div>
                      </div>

                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h4 className="font-semibold text-green-900 mb-2">Insights clés</h4>
                        <div className="space-y-2">
                          {aiAnalysis.insights.map((insight, index) => (
                            <div key={index} className="flex items-start gap-2">
                              <div className={`w-2 h-2 rounded-full mt-2 ${
                                insight.category === 'trend' ? 'bg-blue-500' :
                                insight.category === 'recommendation' ? 'bg-purple-500' :
                                insight.category === 'warning' ? 'bg-red-500' : 'bg-green-500'
                              }`} />
                              <div>
                                <p className="text-green-800 font-medium">{insight.title}</p>
                                <p className="text-green-700 text-sm">{insight.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {aiAnalysis.recommendations.length > 0 && (
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                          <h4 className="font-semibold text-purple-900 mb-2">Recommandations</h4>
                          <div className="space-y-2">
                            {aiAnalysis.recommendations.map((rec, index) => (
                              <div key={index} className="flex items-start gap-2">
                                <div className={`w-2 h-2 rounded-full mt-2 ${
                                  rec.priority === 'high' ? 'bg-red-500' :
                                  rec.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                                }`} />
                                <div>
                                  <p className="text-purple-800 font-medium">{rec.title}</p>
                                  <p className="text-purple-700 text-sm">{rec.description}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="grid gap-4">
                        <h4 className="font-semibold text-gray-900">Analyses par question</h4>
                        {aiAnalysis.charts.map((chart, index: number) => (
                          <Card key={index}>
                            <CardHeader>
                              <CardTitle className="text-base flex items-center gap-2">
                                {chart.questionTitle}
                                <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                  {chart.type}
                                </span>
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2">
                                {chart.data.map((item, itemIndex: number) => (
                                  <div key={itemIndex} className="flex items-center justify-between">
                                    <span className="text-sm">{item.label}</span>
                                    <div className="flex items-center gap-2">
                                      <div className="w-32 bg-gray-200 rounded-full h-2">
                                        <div
                                          className="h-2 rounded-full"
                                          style={{ 
                                            width: `${item.percentage}%`,
                                            backgroundColor: item.color || '#E40046'
                                          }}
                                        ></div>
                                      </div>
                                      <span className="text-sm text-gray-600 w-12 text-right">
                                        {item.value}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
