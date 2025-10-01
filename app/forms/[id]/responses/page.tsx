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
} from "lucide-react"
import Link from "next/link"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

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

  const filteredResponses = responses.filter(
    (response) =>
      response.respondentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      response.respondentEmail.toLowerCase().includes(searchTerm.toLowerCase()),
  )

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
      <html>
        <head>
          <title>Réponse - ${form.title}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { border-bottom: 2px solid #E40046; padding-bottom: 10px; margin-bottom: 20px; }
            .question { margin-bottom: 15px; padding: 10px; border-left: 4px solid #E40046; background: #f9f9f9; }
            .answer { margin-top: 5px; font-weight: bold; }
            .info { background: #f0f0f0; padding: 10px; margin-bottom: 20px; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${form.title}</h1>
            <p>Réponse de ${response.respondentName}</p>
          </div>
          <div class="info">
            <p><strong>Nom:</strong> ${response.respondentName}</p>
            <p><strong>Email:</strong> ${response.respondentEmail}</p>
            <p><strong>Date de soumission:</strong> ${response.submittedAt.toLocaleString("fr-FR")}</p>
          </div>
          ${form.questions.map((q) => {
            const value = response.answers[q.id]
            const answer = Array.isArray(value) ? value.join(", ") : (value || "Aucune réponse")
            return `
              <div class="question">
                <div><strong>${q.title}</strong></div>
                <div class="answer">${answer}</div>
              </div>
            `
          }).join("")}
        </body>
      </html>
    `
    
    printWindow.document.write(content)
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
  }

  const generateAIAnalysis = async () => {
    if (!form || responses.length === 0) return
    
    setIsAnalyzing(true)
    setShowAnalyzeMenu(false)
    try {
      // Utiliser le vrai service d'analyse avec DeepSeek
      const result = await analysisService.analyzeForm(form, responses, {
        formId: form.id,
        includeCharts: true,
        includeRecommendations: true,
        analysisDepth: 'detailed'
      })

      if (result.success && result.analysis) {
        setAiAnalysis(result.analysis)
        // Basculer automatiquement vers l'onglet d'analyse pour voir les résultats
        setActiveTab("analyze")
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

  const viewAnalysis = () => {
    if (aiAnalysis) {
      setShowAnalysisModal(true)
      setShowAnalyzeMenu(false)
    } else {
      alert("Aucune analyse disponible. Veuillez d'abord générer une analyse.")
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
      response.respondentName,
      response.respondentEmail,
      response.submittedAt.toLocaleString("fr-FR"),
      ...form.questions.map((q) => {
        const v = response.answers[q.id]
        return Array.isArray(v) ? v.join(", ") : (v || "")
      }),
    ])
    const win = window.open("", "_blank")
    if (!win) return
    const style = `
      body{font-family: ui-sans-serif,system-ui,Segoe UI,Roboto,Helvetica,Arial; padding:24px;}
      h1{font-size:18px;margin:0 0 12px}
      table{width:100%;border-collapse:collapse}
      th,td{border:1px solid #ddd;padding:6px;font-size:12px;vertical-align:top}
      th{background:#f3f4f6;text-align:left}
    `
    win.document.write(`<!doctype html><html><head><meta charset="utf-8"/><title>${form.title} - Réponses</title><style>${style}</style></head><body>`)
    win.document.write(`<h1>${form.title} - Réponses</h1>`)
    win.document.write(`<table><thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>`)
    rows.forEach((r) => {
      win!.document.write(`<tr>${r.map((c) => `<td>${String(c).replace(/&/g,'&amp;').replace(/</g,'&lt;')}</td>`).join("")}</tr>`)
    })
    win.document.write(`</tbody></table></body></html>`)
    win.document.close()
    win.focus()
    win.print()
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

      <div className="ml-64 flex flex-col min-h-screen">
        <main className="flex-1 p-6 overflow-y-auto">
          {/* En-tête */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Réponses: {form.title}</h1>
              <p className="text-gray-600 mt-1">{responses.length} réponse(s) collectée(s)</p>
            </div>
          </div>
          <div className="max-w-6xl mx-auto">
            {/* Actions en haut */}
            <div className="flex items-center justify-between mb-6">
              <Link href="/forms">
                <Button variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour aux formulaires
                </Button>
              </Link>

              <div className="flex items-center gap-2">
                <Link href={`/forms/${form.id}/edit`}>
                  <Button variant="outline">
                    <Edit className="w-4 h-4 mr-2" />
                    Éditer
                  </Button>
                </Link>
                <Link href={`/forms/${form.id}/share`}>
                  <Button variant="outline">
                    <Share className="w-4 h-4 mr-2" />
                    Partager
                  </Button>
                </Link>
                <div className="relative" ref={analyzeMenuRef}>
                  <Button variant="outline" onClick={() => setShowAnalyzeMenu(!showAnalyzeMenu)}>
                    <Brain className="w-4 h-4 mr-2" />
                    Analyser avec IA
                  </Button>
                  
                  {showAnalyzeMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                      <div className="py-1">
                        <button
                          onClick={generateAIAnalysis}
                          disabled={isAnalyzing || responses.length === 0}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isAnalyzing ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                              Génération en cours...
                            </>
                          ) : (
                            <>
                              <Brain className="w-4 h-4 mr-2" />
                              Générer l'analyse
                            </>
                          )}
                        </button>
                        <button
                          onClick={viewAnalysis}
                          disabled={!aiAnalysis}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Voir l'analyse
                        </button>
                        <button
                          onClick={showTableResults}
                          disabled={!aiAnalysis}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Résultats en tableau
                        </button>
                        <button
                          onClick={showChartResults}
                          disabled={!aiAnalysis}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <TrendingUp className="w-4 h-4 mr-2" />
                          Résultats en graphiques
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <div className="relative" ref={exportMenuRef}>
                  <Button variant="outline" onClick={() => setShowExportMenu(!showExportMenu)}>
                    <Download className="w-4 h-4 mr-2" />
                    Exporter
                  </Button>
                  
                  {showExportMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                      <div className="py-1">
                        <button
                          onClick={() => {
                            setShowExportMenu(false)
                            exportToCSV()
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <FileSpreadsheet className="w-4 h-4 mr-2" />
                          Exporter en CSV
                        </button>
                        <button
                          onClick={() => {
                            setShowExportMenu(false)
                            exportToExcel()
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <FileSpreadsheet className="w-4 h-4 mr-2" />
                          Exporter en Excel
                        </button>
                        <button
                          onClick={() => {
                            setShowExportMenu(false)
                            exportToPDF()
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <FileSpreadsheet className="w-4 h-4 mr-2" />
                          Exporter en PDF
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Statistiques rapides */}
            <div className="grid grid-cols-4 gap-4 mb-6">
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
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab("liste")}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "liste"
                      ? "border-[#E40046] text-[#E40046]"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Liste des réponses
                </button>
                <button
                  onClick={() => setActiveTab("resume")}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "resume"
                      ? "border-[#E40046] text-[#E40046]"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Résumé
                </button>
                <button
                  onClick={() => setActiveTab("stats")}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "stats"
                      ? "border-[#E40046] text-[#E40046]"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <BarChart3 className="w-4 h-4 mr-2 inline" />
                  Statistiques
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
                      placeholder="Rechercher par nom ou email..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
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
                              <th className="text-left p-4 font-medium text-gray-900">Répondant</th>
                              <th className="text-left p-4 font-medium text-gray-900">Email</th>
                              <th className="text-left p-4 font-medium text-gray-900">Date</th>
                              <th className="text-left p-4 font-medium text-gray-900">Statut</th>
                              <th className="text-right p-4 font-medium text-gray-900">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredResponses.map((response) => (
                              <tr key={response.id} className="border-b hover:bg-gray-50">
                                <td className="p-4">
                                  <div className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-gray-400" />
                                    <span className="font-medium">{response.respondentName}</span>
                                  </div>
                                </td>
                                <td className="p-4">
                                  <div className="flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-600">{response.respondentEmail}</span>
                                  </div>
                                </td>
                                <td className="p-4">
                                  <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-600">
                                      {response.submittedAt.toLocaleDateString("fr-FR")} à{" "}
                                      {response.submittedAt.toLocaleTimeString("fr-FR", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </span>
                                  </div>
                                </td>
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
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Statistiques détaillées
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-3xl font-bold text-blue-600">{responses.length}</div>
                        <div className="text-sm text-blue-800">Total des réponses</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-3xl font-bold text-green-600">
                          {responses.filter(r => {
                            const today = new Date()
                            const responseDate = r.submittedAt
                            return responseDate.getDate() === today.getDate() && 
                                   responseDate.getMonth() === today.getMonth() && 
                                   responseDate.getFullYear() === today.getFullYear()
                          }).length}
                        </div>
                        <div className="text-sm text-green-800">Aujourd'hui</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-3xl font-bold text-purple-600">
                          {responses.filter(r => {
                            const weekAgo = new Date()
                            weekAgo.setDate(weekAgo.getDate() - 7)
                            return r.submittedAt >= weekAgo
                          }).length}
                        </div>
                        <div className="text-sm text-purple-800">Cette semaine</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Réponses par jour</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center text-gray-500 py-8">
                      Graphique des réponses par jour (à implémenter avec Chart.js)
                    </div>
                  </CardContent>
                </Card>
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
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#E40046] mx-auto mb-4"></div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Analyse en cours...</h3>
                        <p className="text-gray-600 mb-4">
                          DeepSeek analyse vos réponses. Cela peut prendre quelques secondes.
                        </p>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                          <p className="text-sm text-blue-800">
                            <strong>Étapes :</strong><br/>
                            1. Analyse des données...<br/>
                            2. Identification des tendances...<br/>
                            3. Génération des insights...<br/>
                            4. Création des graphiques...
                          </p>
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
                            <Button variant="outline" onClick={() => {
                              const dataStr = JSON.stringify(aiAnalysis, null, 2)
                              const blob = new Blob([dataStr], { type: 'application/json' })
                              const link = document.createElement('a')
                              link.href = URL.createObjectURL(blob)
                              link.download = 'analyse_ia.json'
                              link.click()
                            }}>
                              <Download className="w-4 h-4 mr-2" />
                              Exporter
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
