"use client"

import { FileText, Plus, BarChart3, Users, Eye, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sidebar } from "@/components/layout/sidebar"
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
    <div className="bg-gray-50 min-h-screen">
      <Sidebar />

      {/* Contenu principal */}
      <div className="ml-64 flex flex-col min-h-screen">
        <main className="flex-1 p-6">
          {/* En-tête avec bouton de création */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
              <p className="text-gray-600 mt-1">Vue d'ensemble de vos formulaires</p>
            </div>
              <Link href="/forms/create">
              <Button className="bg-[#E40046] hover:bg-[#E40040] text-white" size="lg">
                <Plus className="w-5 h-5 mr-2" />
                Créer un formulaire
                </Button>
              </Link>
          </div>

          {/* Statistiques rapides */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total formulaires</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalForms}</p>
                  </div>
                  <div className="w-12 h-12 bg-[#E40046]/10 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-[#E40046]" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total réponses</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalResponses}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Créés cette semaine</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.createdThisWeek}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Taux de réponse</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.responseRate}%</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Statistiques des fonctionnalités */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Création de formulaires */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Plus className="w-5 h-5 text-white-600" />
                  Création de formulaires
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Formulaires créés</span>
                    <span className="font-semibold">{stats.totalForms}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Cette semaine</span>
                    <span className="font-semibold text-green-600">+{stats.createdThisWeek}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Taux de création</span>
                    <span className="font-semibold">—</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Gestion des réponses */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="w-5 h-5 text-blue-600" />
                  Gestion des réponses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total réponses</span>
                    <span className="font-semibold">{stats.totalResponses}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Aujourd'hui</span>
                    <span className="font-semibold text-blue-600">+{stats.createdToday}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Taux de réponse</span>
                    <span className="font-semibold">{stats.responseRate}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Analyses et statistiques */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BarChart3 className="w-5 h-5 text-green-600" />
                  Analyses et statistiques
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Graphiques générés</span>
                    <span className="font-semibold">—</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Rapports exportés</span>
                    <span className="font-semibold text-green-600">—</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Analyses complètes</span>
                    <span className="font-semibold">—</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Partage et collaboration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Eye className="w-5 h-5 text-purple-600" />
                  Partage et collaboration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Formulaires partagés</span>
                    <span className="font-semibold">—</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Liens générés</span>
                    <span className="font-semibold text-purple-600">—</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Vues totales</span>
                    <span className="font-semibold">—</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Export et données */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                  Export et données
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Exports CSV</span>
                    <span className="font-semibold">—</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Exports Excel</span>
                    <span className="font-semibold text-orange-600">—</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Exports PDF</span>
                    <span className="font-semibold">—</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance système */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="w-5 h-5 text-teal-600" />
                  Performance système
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Temps de réponse</span>
                    <span className="font-semibold text-green-600">—</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Disponibilité</span>
                    <span className="font-semibold">—</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Satisfaction utilisateur</span>
                    <span className="font-semibold text-teal-600">—</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
