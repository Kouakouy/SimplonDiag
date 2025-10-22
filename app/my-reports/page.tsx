"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { AuthGuard } from "@/components/auth/AuthGuard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ReportForm } from "@/components/report/report-form"
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Bug, 
  Lightbulb, 
  HelpCircle, 
  Info,
  Plus,
  X,
  Eye
} from "lucide-react"
import { apiRequest } from "@/lib/api"
import { useAuth } from "@/lib/contexts/AuthContext"

interface Report {
  _id: string
  type: "bug" | "feature" | "question" | "info"
  subject: string
  message: string
  email: string | null
  status: "pending" | "in_progress" | "resolved"
  created_at: string
  updated_at?: string
  image?: {
    data: string
    name: string
  }
}

const TYPE_CONFIG = {
  bug: { label: "Bug / Erreur", icon: Bug, color: "text-red-600 bg-red-50" },
  feature: { label: "Suggestion", icon: Lightbulb, color: "text-blue-600 bg-blue-50" },
  question: { label: "Question", icon: HelpCircle, color: "text-purple-600 bg-purple-50" },
  info: { label: "Information", icon: Info, color: "text-gray-600 bg-gray-50" }
}

const STATUS_CONFIG = {
  pending: { label: "En attente", icon: Clock, color: "bg-yellow-100 text-yellow-800" },
  in_progress: { label: "En cours", icon: AlertCircle, color: "bg-blue-100 text-blue-800" },
  resolved: { label: "Résolu", icon: CheckCircle2, color: "bg-green-100 text-green-800" }
}

function MyReportsContent() {
  const { user } = useAuth()
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)

  useEffect(() => {
    loadReports()
  }, [])

  const loadReports = async () => {
    try {
      setLoading(true)
      // Récupérer tous les rapports et filtrer par email de l'utilisateur
      const allReports = await apiRequest<Report[]>({ url: "/reports" })
      const myReports = allReports.filter(r => r.email === user?.email)
      setReports(myReports)
    } catch (err: any) {
      setError(err.message || "Erreur lors du chargement des rapports")
    } finally {
      setLoading(false)
    }
  }

  const handleReportSuccess = () => {
    setShowForm(false)
    loadReports()
  }

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <Sidebar />
        <div className="ml-64 p-8">
          <p>Chargement...</p>
        </div>
      </div>
    )
  }

  if (showForm) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <Sidebar />
        <div className="ml-64 p-8">
          <div className="max-w-4xl mx-auto">
            <ReportForm
              onSuccess={handleReportSuccess}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <Sidebar />
      
      <div className="ml-64 p-8">
        <div className="max-w-6xl mx-auto">
          {/* En-tête */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mes signalements</h1>
              <p className="text-gray-600 mt-2">
                Suivez l'état de vos rapports et signalements
              </p>
            </div>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-[#E40046] hover:bg-[#E40046]/80 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nouveau signalement
            </Button>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Liste des rapports */}
          {reports.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="text-gray-400 mb-4">
                  <AlertCircle className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Aucun signalement
                </h3>
                <p className="text-gray-600 mb-6">
                  Vous n'avez pas encore créé de signalement
                </p>
                <Button
                  onClick={() => setShowForm(true)}
                  className="bg-[#E40046] hover:bg-[#E40046]/80 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Créer mon premier signalement
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reports.map((report) => {
                const typeConfig = TYPE_CONFIG[report.type]
                const statusConfig = STATUS_CONFIG[report.status]
                const TypeIcon = typeConfig.icon
                const StatusIcon = statusConfig.icon

                return (
                  <Card key={report._id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${typeConfig.color}`}>
                            <TypeIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{report.subject}</CardTitle>
                            <p className="text-sm text-gray-500 mt-1">
                              {new Date(report.created_at).toLocaleString('fr-FR')}
                            </p>
                          </div>
                        </div>
                        <Badge className={statusConfig.color}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusConfig.label}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 mb-4 line-clamp-3">{report.message}</p>
                      
                      {report.status === "resolved" && (
                        <Alert className="mb-4 bg-green-50 border-green-200">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <AlertDescription className="text-green-800">
                            Ce signalement a été résolu par notre équipe
                          </AlertDescription>
                        </Alert>
                      )}

                      {report.status === "in_progress" && (
                        <Alert className="mb-4 bg-blue-50 border-blue-200">
                          <Clock className="h-4 w-4 text-blue-600" />
                          <AlertDescription className="text-blue-800">
                            Notre équipe travaille sur ce signalement
                          </AlertDescription>
                        </Alert>
                      )}

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedReport(report)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Voir détails
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal de détails */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">{selectedReport.subject}</CardTitle>
                  <p className="text-gray-500 mt-2">
                    {new Date(selectedReport.created_at).toLocaleString('fr-FR')}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedReport(null)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Type et statut */}
              <div className="flex gap-3">
                <Badge className={TYPE_CONFIG[selectedReport.type].color}>
                  {TYPE_CONFIG[selectedReport.type].label}
                </Badge>
                <Badge className={STATUS_CONFIG[selectedReport.status].color}>
                  {STATUS_CONFIG[selectedReport.status].label}
                </Badge>
              </div>

              {/* Message */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Message</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{selectedReport.message}</p>
              </div>

              {/* Image */}
              {selectedReport.image && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Capture d'écran</h3>
                  <img
                    src={selectedReport.image.data}
                    alt={selectedReport.image.name}
                    className="max-w-full rounded-lg border"
                  />
                </div>
              )}

              {/* Statut */}
              {selectedReport.status === "resolved" && (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <strong>Résolu</strong> - Ce signalement a été traité par notre équipe.
                    {selectedReport.updated_at && (
                      <span className="block mt-1 text-sm">
                        Résolu le {new Date(selectedReport.updated_at).toLocaleString('fr-FR')}
                      </span>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              {selectedReport.status === "in_progress" && (
                <Alert className="bg-blue-50 border-blue-200">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    <strong>En cours</strong> - Notre équipe travaille actuellement sur ce signalement.
                  </AlertDescription>
                </Alert>
              )}

              {selectedReport.status === "pending" && (
                <Alert className="bg-yellow-50 border-yellow-200">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-800">
                    <strong>En attente</strong> - Votre signalement sera traité prochainement.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default function MyReportsPage() {
  return (
    <AuthGuard requiredRole="observer">
      <MyReportsContent />
    </AuthGuard>
  )
}
