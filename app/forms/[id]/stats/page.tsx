"use client"

// Page de statistiques spécifiques à un formulaire
import { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import type { Form, FormResponse } from "@/types/form"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { apiRequest } from "@/lib/api"
import { ArrowLeft, RefreshCw, Download, Share2, Bell, Calendar, Filter } from "lucide-react"
import Link from "next/link"
import { FormStatsCharts } from "@/components/forms/form-stats-charts"
import { RealTimeMetrics } from "@/components/forms/real-time-metrics"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
// import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
// import { motion } from "framer-motion"

export default function FormStatsPage() {
  const params = useParams()
  const formId = params.id as string
  const [form, setForm] = useState<Form | null>(null)
  const [loading, setLoading] = useState(true)
  const [responses, setResponses] = useState<FormResponse[]>([])
  const [serverStats, setServerStats] = useState<{ views: number; submissions: number; completionRate: number } | null>(null)
  
  // États pour la dynamisation
  const [refreshing, setRefreshing] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "all">("30d")
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [newResponsesCount, setNewResponsesCount] = useState(0)
  const [isLive, setIsLive] = useState(false)

  // Fonction de chargement des données
  const loadData = useCallback(async (showToast = false) => {
    try {
      if (showToast) {
        setRefreshing(true)
        toast.loading("Actualisation des données...")
      }
      
      const f = await apiRequest<any>({ url: `/forms/${formId}` })
      const adaptedForm: Form = {
        id: f._id || f.id || formId,
        title: f.title || "",
        description: f.description || "",
        bannerTitle: undefined,
        bannerImageUrl: undefined,
        questions: [],
        isPublic: f.is_public ?? true,
        expirationDate: undefined,
        maxResponses: undefined,
        createdAt: f.created_at ? new Date(f.created_at) : new Date(),
        updatedAt: f.updated_at ? new Date(f.updated_at) : new Date(),
        responses: [],
      }
      setForm(adaptedForm)

      // Charger réponses pour les métriques avec filtres temporels
      const queryParams = new URLSearchParams()
      if (timeRange !== "all") {
        const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - days)
        queryParams.set("start_date", startDate.toISOString())
      }
      if (startDate) queryParams.set("start_date", startDate)
      if (endDate) queryParams.set("end_date", endDate)

      const resp = await apiRequest<any[]>({ 
        url: `/forms/${formId}/responses${queryParams.toString() ? `?${queryParams.toString()}` : ""}` 
      })
      
      const adaptedResponses: FormResponse[] = (resp || []).map((r: any) => ({
        id: r._id || r.id,
        formId: adaptedForm.id,
        respondentName: r.respondent_name || "",
        respondentEmail: r.respondent_email || "",
        answers: r.answers || {},
        submittedAt: r.submitted_at ? new Date(r.submitted_at) : new Date(),
      }))
      
      // Détecter les nouvelles réponses
      const previousCount = responses.length
      const newCount = adaptedResponses.length - previousCount
      if (newCount > 0 && previousCount > 0) {
        setNewResponsesCount(newCount)
        if (notificationsEnabled) {
          toast.success(`${newCount} nouvelle${newCount > 1 ? 's' : ''} réponse${newCount > 1 ? 's' : ''} reçue${newCount > 1 ? 's' : ''}!`)
        }
      }
      
      setResponses(adaptedResponses)

      // Stats backend si dispo
      try {
        const stats = await apiRequest<any>({ url: `/forms/${formId}/stats` })
        if (stats) setServerStats({
          views: stats.views ?? 0,
          submissions: stats.submissions ?? adaptedResponses.length,
          completionRate: stats.completionRate ?? 0,
        })
      } catch {
        // ignore
      }

      setLastRefresh(new Date())
      setIsLive(true)
      
      if (showToast) {
        toast.success("Données actualisées avec succès!")
      }
    } catch (e) {
      console.error(e)
      if (showToast) {
        toast.error("Erreur lors de l'actualisation des données")
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [formId, timeRange, startDate, endDate, responses.length, notificationsEnabled])

  // Chargement initial
  useEffect(() => {
    loadData()
  }, [formId])

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      loadData(true)
    }, 30000) // 30 secondes

    return () => clearInterval(interval)
  }, [autoRefresh, loadData])

  // Fonction de rafraîchissement manuel
  const handleRefresh = () => {
    loadData(true)
  }

  // Fonction d'export des données
  const handleExport = () => {
    const data = {
      form: form,
      responses: responses,
      stats: serverStats,
      exportDate: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `form-stats-${form?.title || 'form'}-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast.success("Données exportées avec succès!")
  }

  // Fonction de partage
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Statistiques - ${form?.title}`,
          text: `Consultez les statistiques du formulaire "${form?.title}"`,
          url: window.location.href
        })
      } catch (err) {
        console.log('Erreur lors du partage:', err)
      }
    } else {
      // Fallback: copier le lien
      navigator.clipboard.writeText(window.location.href)
      toast.success("Lien copié dans le presse-papiers!")
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E40046] mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des statistiques...</p>
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
            <p className="text-gray-600 mb-4">Formulaire non trouvé</p>
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
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">Statistiques: {form.title}</h1>
                {isLive && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                    En direct
                  </Badge>
                )}
                {newResponsesCount > 0 && (
                  <Badge variant="destructive" className="animate-bounce">
                    <Bell className="w-3 h-3 mr-1" />
                    {newResponsesCount} nouvelle{newResponsesCount > 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
              <p className="text-gray-600 mt-1">
                Analysez les performances de ce formulaire
                {lastRefresh && (
                  <span className="text-sm text-gray-500 ml-2">
                    • Dernière mise à jour: {lastRefresh.toLocaleTimeString()}
                  </span>
                )}
              </p>
            </div>
            
            {/* Actions rapides */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
                className="transition-all duration-200 hover:scale-105"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Actualiser
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="transition-all duration-200 hover:scale-105"
              >
                <Download className="w-4 h-4 mr-2" />
                Exporter
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="transition-all duration-200 hover:scale-105"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Partager
              </Button>
            </div>
          </div>
          
          <div className="max-w-7xl mx-auto">
            {/* Filtres et contrôles */}
            <div>
              <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filtres et contrôles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Période */}
                  <div className="space-y-2">
                    <Label htmlFor="timeRange">Période</Label>
                    <Select value={timeRange} onValueChange={(value) => setTimeRange(value as "7d" | "30d" | "90d" | "all")}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une période" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7d">7 derniers jours</SelectItem>
                        <SelectItem value="30d">30 derniers jours</SelectItem>
                        <SelectItem value="90d">90 derniers jours</SelectItem>
                        <SelectItem value="all">Toutes les données</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Date de début */}
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Date de début</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="transition-all duration-200"
                    />
                  </div>

                  {/* Date de fin */}
                  <div className="space-y-2">
                    <Label htmlFor="endDate">Date de fin</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="transition-all duration-200"
                    />
                  </div>

                  {/* Contrôles */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="autoRefresh"
                        checked={autoRefresh}
                        onChange={(e) => setAutoRefresh(e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <Label htmlFor="autoRefresh" className="text-sm">
                        Actualisation auto (30s)
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="notifications"
                        checked={notificationsEnabled}
                        onChange={(e) => setNotificationsEnabled(e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <Label htmlFor="notifications" className="text-sm">
                        Notifications
                      </Label>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between mt-6 pt-4 border-t">
                  <Link href={`/forms/${form.id}/responses`}>
                    <Button variant="outline" className="transition-all duration-200 hover:scale-105">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Retour aux réponses
                    </Button>
                  </Link>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setStartDate("")
                        setEndDate("")
                        setTimeRange("30d")
                      }}
                      className="transition-all duration-200 hover:scale-105"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Réinitialiser
                    </Button>
                    
                    <Button
                      onClick={handleRefresh}
                      disabled={refreshing}
                      className="transition-all duration-200 hover:scale-105"
                    >
                      <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                      Appliquer les filtres
                    </Button>
                  </div>
                </div>
              </CardContent>
              </Card>
            </div>

            {/* Métriques en temps réel */}
            <div>
              <RealTimeMetrics 
                responses={responses} 
                serverStats={serverStats} 
                timeRange={timeRange}
                lastRefresh={lastRefresh}
              />
            </div>

            {/* Composant de statistiques avec données réelles */}
            <div>
              <FormStatsCharts form={form} responses={responses} serverStats={serverStats} />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}