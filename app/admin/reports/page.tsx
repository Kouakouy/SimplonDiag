"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { AuthGuard } from "@/components/auth/AuthGuard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Bug, 
  Lightbulb, 
  HelpCircle, 
  Info,
  Eye,
  X
} from "lucide-react"
import { apiRequest } from "@/lib/api"

interface ReportImage {
  data: string
  name: string
}

interface Report {
  _id: string
  type: "bug" | "feature" | "question" | "info"
  subject: string
  message: string
  email: string | null
  status: "pending" | "in_progress" | "resolved"
  created_at: string
  updated_at?: string
  user_agent: string | null
  ip_address: string | null
  image?: ReportImage
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

function AdminReportsContent() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [filter, setFilter] = useState<"all" | "pending" | "in_progress" | "resolved">("all")

  useEffect(() => {
    loadReports()
  }, [])

  const loadReports = async () => {
    try {
      setLoading(true)
      const data = await apiRequest<Report[]>({ url: "/reports" })
      setReports(data)
    } catch (err: any) {
      setError(err.message || "Erreur lors du chargement des rapports")
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (reportId: string, newStatus: Report["status"]) => {
    try {
      await apiRequest({
        url: `/reports/${reportId}/status`,
        method: "PATCH",
        body: { status: newStatus }
      })
      
      // Mettre à jour localement
      setReports(reports.map(r => 
        r._id === reportId ? { ...r, status: newStatus, updated_at: new Date().toISOString() } : r
      ))
      
      if (selectedReport?._id === reportId) {
        setSelectedReport({ ...selectedReport, status: newStatus, updated_at: new Date().toISOString() })
      }
    } catch (err: any) {
      setError(err.message || "Erreur lors de la mise à jour")
    }
  }

  const filteredReports = reports.filter(r => filter === "all" || r.status === filter)

  const stats = {
    total: reports.length,
    pending: reports.filter(r => r.status === "pending").length,
    in_progress: reports.filter(r => r.status === "in_progress").length,
    resolved: reports.filter(r => r.status === "resolved").length
  }

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <Sidebar />
        <div className="ml-64 p-8">
          <p>Chargement des rapports...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <Sidebar />
      
      <div className="ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          {/* En-tête */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Gestion des rapports</h1>
            <p className="text-gray-600 mt-2">
              Gérez les signalements et suggestions des utilisateurs
            </p>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                <div className="text-sm text-gray-600">Total</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                <div className="text-sm text-gray-600">En attente</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-blue-600">{stats.in_progress}</div>
                <div className="text-sm text-gray-600">En cours</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
                <div className="text-sm text-gray-600">Résolus</div>
              </CardContent>
            </Card>
          </div>

          {/* Filtres */}
          <div className="flex gap-2 mb-6">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              onClick={() => setFilter("all")}
              className={filter === "all" ? "bg-[#E40046] hover:bg-[#E40046]/80" : ""}
            >
              Tous ({stats.total})
            </Button>
            <Button
              variant={filter === "pending" ? "default" : "outline"}
              onClick={() => setFilter("pending")}
              className={filter === "pending" ? "bg-yellow-600 hover:bg-yellow-700" : ""}
            >
              En attente ({stats.pending})
            </Button>
            <Button
              variant={filter === "in_progress" ? "default" : "outline"}
              onClick={() => setFilter("in_progress")}
              className={filter === "in_progress" ? "bg-blue-600 hover:bg-blue-700" : ""}
            >
              En cours ({stats.in_progress})
            </Button>
            <Button
              variant={filter === "resolved" ? "default" : "outline"}
              onClick={() => setFilter("resolved")}
              className={filter === "resolved" ? "bg-green-600 hover:bg-green-700" : ""}
            >
              Résolus ({stats.resolved})
            </Button>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Liste des rapports */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredReports.length === 0 ? (
              <Card className="col-span-2">
                <CardContent className="p-12 text-center">
                  <p className="text-gray-500">Aucun rapport à afficher</p>
                </CardContent>
              </Card>
            ) : (
              filteredReports.map((report) => {
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
                      
                      {report.email && (
                        <p className="text-sm text-gray-600 mb-4">
                          <strong>Email:</strong> {report.email}
                        </p>
                      )}

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedReport(report)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Voir détails
                        </Button>
                        
                        {report.status !== "resolved" && (
                          <Button
                            size="sm"
                            onClick={() => updateStatus(report._id, "resolved")}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Marquer résolu
                          </Button>
                        )}
                        
                        {report.status === "pending" && (
                          <Button
                            size="sm"
                            onClick={() => updateStatus(report._id, "in_progress")}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            En cours
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        </div>
      </div>

      {/* Modal de détails */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-start justify-center p-4 z-50 overflow-y-auto">
          <Card className="max-w-3xl w-full my-8 relative bg-white border border-gray-200 shadow-2xl">
            {/* Bouton de fermeture en haut à droite */}
            <button
              onClick={() => setSelectedReport(null)}
              className="absolute right-4 top-4 rounded-full p-1 hover:bg-gray-100 transition-colors z-10"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
            <CardHeader className="pb-2">
              <div>
                <CardTitle className="text-2xl">{selectedReport.subject}</CardTitle>
                <p className="text-gray-500 mt-1">
                  {new Date(selectedReport.created_at).toLocaleString('fr-FR')}
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Type et statut */}
              <div className="flex gap-3 mb-4">
                <Badge className={`${TYPE_CONFIG[selectedReport.type].color} text-sm py-1`}>
                  {TYPE_CONFIG[selectedReport.type].label}
                </Badge>
                <Badge className={`${STATUS_CONFIG[selectedReport.status].color} text-sm py-1`}>
                  {STATUS_CONFIG[selectedReport.status].label}
                </Badge>
              </div>

              {/* Message */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Message</h3>
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <p className="text-gray-800 whitespace-pre-wrap">{selectedReport.message}</p>
                </div>
              </div>

              {/* Email */}
              {selectedReport.email && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Email de contact</h3>
                  <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                    <a 
                      href={`mailto:${selectedReport.email}`} 
                      className="text-blue-600 hover:underline break-all"
                    >
                      {selectedReport.email}
                    </a>
                  </div>
                </div>
              )}

              {/* Image */}
              {selectedReport.image && selectedReport.image.data && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Capture d'écran</h3>
                  <div className="relative bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
                    <img
                      src={`data:image/png;base64,${selectedReport.image.data}`}
                      alt={selectedReport.image.name || 'Capture d\'écran'}
                      className="max-w-full rounded-lg border"
                      onError={(e) => {
                        // En cas d'erreur de chargement de l'image
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = '/images/image-error.png'; // Chemin vers une image d'erreur par défaut
                      }}
                    />
                    <div className="mt-1 text-sm text-gray-500">
                      {selectedReport.image.name || 'screenshot.png'}
                    </div>
                  </div>
                </div>
              )}

              {/* Infos techniques */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="font-semibold text-gray-900 mb-3">Informations techniques</h3>
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm text-sm text-gray-700 space-y-2">
                  {selectedReport.user_agent && (
                    <div className="flex">
                      <span className="font-medium w-28 flex-shrink-0">User Agent:</span>
                      <span className="break-all">{selectedReport.user_agent}</span>
                    </div>
                  )}
                  {selectedReport.ip_address && (
                    <div className="flex">
                      <span className="font-medium w-28 flex-shrink-0">Adresse IP:</span>
                      <span>{selectedReport.ip_address}</span>
                    </div>
                  )}
                  <div className="flex">
                    <span className="font-medium w-28 flex-shrink-0">Créé le:</span>
                    <span>{new Date(selectedReport.created_at).toLocaleString('fr-FR')}</span>
                  </div>
                  {selectedReport.updated_at && (
                    <div className="flex">
                      <span className="font-medium w-28 flex-shrink-0">Mis à jour:</span>
                      <span>{new Date(selectedReport.updated_at).toLocaleString('fr-FR')}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-6 border-t mt-6">
                {selectedReport.status === "pending" && (
                  <Button
                    onClick={() => updateStatus(selectedReport._id, "in_progress")}
                    className="bg-blue-600 hover:bg-blue-700 text-white flex-1 sm:flex-none"
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    Marquer en cours
                  </Button>
                )}
                {selectedReport.status !== "resolved" ? (
                  <Button
                    onClick={() => updateStatus(selectedReport._id, "resolved")}
                    className="bg-green-600 hover:bg-green-700 text-white flex-1 sm:flex-none"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Marquer comme résolu
                  </Button>
                ) : (
                  <Button
                    onClick={() => updateStatus(selectedReport._id, "pending")}
                    variant="outline"
                    className="flex-1 sm:flex-none"
                  >
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Rouvrir le rapport
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedReport(null)}
                  className="flex-1 sm:flex-none"
                >
                  Fermer
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default function AdminReportsPage() {
  return (
    <AuthGuard requiredRole="admin">
      <AdminReportsContent />
    </AuthGuard>
  )
}
