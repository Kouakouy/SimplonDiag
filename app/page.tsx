"use client"

import { FileText, Plus, BarChart3, Users, Eye, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sidebar } from "@/components/layout/sidebar"
import { AuthGuard } from "@/components/auth/AuthGuard"
import { useEffect, useState } from "react"
import { apiRequest } from "@/lib/api"
import Link from "next/link"

export default function Dashboard() {
  const [forms, setForms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({
    totalForms: 0,
    totalResponses: 0,
    createdToday: 0,
    createdThisWeek: 0,
    responseRate: 0,
  })

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await apiRequest<any[]>({ url: "/forms" })
        setForms(data)
        // Statistiques dynamiques
        const now = new Date()
        const startOfWeek = new Date(now)
        startOfWeek.setDate(now.getDate() - now.getDay())
        let totalResponses = 0
        let createdToday = 0
        let createdThisWeek = 0
        data.forEach(form => {
          const createdAt = new Date(form.created_at || form.createdAt)
          if (
            createdAt.getDate() === now.getDate() &&
            createdAt.getMonth() === now.getMonth() &&
            createdAt.getFullYear() === now.getFullYear()
          ) {
            createdToday++
          }
          if (createdAt >= startOfWeek) {
            createdThisWeek++
          }
          if (Array.isArray(form.responses)) {
            totalResponses += form.responses.length
          }
        })
        setStats({
          totalForms: data.length,
          totalResponses,
          createdToday,
          createdThisWeek,
          responseRate: data.length > 0 ? Math.round((totalResponses / data.length) * 100) : 0,
        })
      } catch (e: any) {
        setError(e.message || "Erreur de chargement")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <AuthGuard>
      <div className="bg-gray-50 min-h-screen">
        <Sidebar />

        {/* Contenu principal */}
        <div className="ml-0 lg:ml-64 flex flex-col min-h-screen">
          <main className="flex-1 p-3 sm:p-4 lg:p-6">
          {/* En-tête avec bouton de création */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 lg:mb-8 gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Tableau de bord</h1>
              <p className="text-gray-600 mt-1">Vue d'ensemble de vos formulaires</p>
            </div>
              <Link href="/forms/create">
              <Button className="bg-[#E40046] hover:bg-[#E40040] text-white w-full sm:w-auto" size="lg">
                <Plus className="w-5 h-5 mr-2" />
                Créer un formulaire
                </Button>
              </Link>
          </div>

          {/* Statistiques rapides */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 lg:mb-8">
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total formulaires</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalForms}</p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#E40046]/10 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-[#E40046]" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total réponses</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalResponses}</p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Créés cette semaine</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.createdThisWeek}</p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Taux de réponse</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.responseRate}%</p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Statistiques des fonctionnalités */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Création de formulaires */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-white-600" />
                  <span className="text-sm sm:text-base">Création de formulaires</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-gray-600">Formulaires créés</span>
                    <span className="font-semibold text-sm sm:text-base">{stats.totalForms}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-gray-600">Cette semaine</span>
                    <span className="font-semibold text-green-600 text-sm sm:text-base">+{stats.createdThisWeek}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-gray-600">Taux de création</span>
                    <span className="font-semibold text-sm sm:text-base">—</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Gestion des réponses */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                  <span className="text-sm sm:text-base">Gestion des réponses</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-gray-600">Total réponses</span>
                    <span className="font-semibold text-sm sm:text-base">{stats.totalResponses}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-gray-600">Aujourd'hui</span>
                    <span className="font-semibold text-blue-600 text-sm sm:text-base">+{stats.createdToday}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-gray-600">Taux de réponse</span>
                    <span className="font-semibold text-sm sm:text-base">{stats.responseRate}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Analyses et statistiques */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                  <span className="text-sm sm:text-base">Analyses et statistiques</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-gray-600">Graphiques générés</span>
                    <span className="font-semibold text-sm sm:text-base">—</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-gray-600">Rapports exportés</span>
                    <span className="font-semibold text-green-600 text-sm sm:text-base">—</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-gray-600">Analyses complètes</span>
                    <span className="font-semibold text-sm sm:text-base">—</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Partage et collaboration */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                  <span className="text-sm sm:text-base">Partage et collaboration</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-gray-600">Formulaires partagés</span>
                    <span className="font-semibold text-sm sm:text-base">—</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-gray-600">Liens générés</span>
                    <span className="font-semibold text-purple-600 text-sm sm:text-base">—</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-gray-600">Vues totales</span>
                    <span className="font-semibold text-sm sm:text-base">—</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Export et données */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                  <span className="text-sm sm:text-base">Export et données</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-gray-600">Exports CSV</span>
                    <span className="font-semibold text-sm sm:text-base">—</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-gray-600">Exports Excel</span>
                    <span className="font-semibold text-orange-600 text-sm sm:text-base">—</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-gray-600">Exports PDF</span>
                    <span className="font-semibold text-sm sm:text-base">—</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance système */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600" />
                  <span className="text-sm sm:text-base">Performance système</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-gray-600">Temps de réponse</span>
                    <span className="font-semibold text-green-600 text-sm sm:text-base">—</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-gray-600">Disponibilité</span>
                    <span className="font-semibold text-sm sm:text-base">—</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-gray-600">Satisfaction utilisateur</span>
                    <span className="font-semibold text-teal-600 text-sm sm:text-base">—</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  )
}
