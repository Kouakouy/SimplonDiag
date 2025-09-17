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

  // Fermer le menu d'export quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false)
      }
    }

    if (showExportMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showExportMenu])

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
                <Link href={`/forms/${form.id}/stats`}>
                  <Button variant="outline">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Statistiques
                  </Button>
                </Link>
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
                                    <Button variant="ghost" size="sm" onClick={() => openResponseModal(response)}>
                                      <Eye className="w-4 h-4" />
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
          </div>
        </main>
      </div>
    </div>
  )
}
