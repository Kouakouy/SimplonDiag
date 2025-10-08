"use client"

import { FileText, Plus, BarChart3, Users, Eye, TrendingUp, ArrowRight, CheckCircle, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sidebar } from "@/components/layout/sidebar"
import { useEffect, useState } from "react"
import { apiRequest } from "@/lib/api"
import Link from "next/link"
import { useAuth } from "@/lib/contexts/AuthContext"
import Image from "next/image"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  // Si l'utilisateur n'est pas connecté, afficher la landing page
  if (!authLoading && !user) {
    return <LandingPage />
  }

  // Si l'utilisateur est connecté, afficher le dashboard
  if (user) {
    return <Dashboard />
  }

  // Pendant le chargement
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E40046]"></div>
    </div>
  )
}

function LandingPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-white">
      {/* Images de fond dupliquées avec opacité réduite */}
      <Image
        src="/images/BackgroundFade.png"
        alt="Background"
        width={800}
        height={600}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 object-cover opacity-20"
        priority
      />
      <Image
        src="/images/BackgroundFade.png"
        alt="Background Duplicate"
        width={700}
        height={525}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/3 -translate-y-1/3 object-cover opacity-15"
        priority
      />
      
      {/* Main Content - Layout en 2 colonnes */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-8 py-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Colonne Gauche - Logo et Texte */}
          <div className="text-white space-y-6 flex flex-col items-center lg:items-start text-center lg:text-left">
            <div className="relative">
              <Image
                src="/images/logo2.png"
                alt="Simplon Africa"
                width={300}
                height={120}
                className="object-contain drop-shadow-2xl"
              />
            </div>
            
            <div className="space-y-4">
              <h1 className="text-xl text-[#113744] lg:text-5xl font-bold drop-shadow-lg">
                Plateforme de diagnostic de profil
                pour un programme de formation plus adaptée
              </h1>
              
              <div className="inline-block bg-[#E40046] text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                Powered by Simplon Africa
              </div>
            </div>
          </div>

          {/* Colonne Droite - Carte de bienvenue */}
          <Card className="w-full shadow-2xl drop-shadow-2xl bg-white border-0 rounded-3xl overflow-hidden" style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
            <CardHeader className="text-center space-y-3 pb-4 bg-white border-b border-gray-100">
              <div className="flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-[#E40046]" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900 font-almarena">Bienvenue sur SIMPLON DIAG</CardTitle>
              <p className="text-gray-600 text-sm">
                Transformez votre manière de créer et gérer vos formulaires pédagogiques
              </p>
            </CardHeader>
            
            <CardContent className="p-6">
              <div className="space-y-6">
                {/* Fonctionnalités */}
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Création intuitive</h3>
                      <p className="text-sm text-gray-600">Concevez des formulaires personnalisés en quelques clics</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Analyses avancées</h3>
                      <p className="text-sm text-gray-600">Visualisez et exportez vos données facilement</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Partage simplifié</h3>
                      <p className="text-sm text-gray-600">Diffusez vos formulaires en un clic</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Collaboration en temps réel</h3>
                      <p className="text-sm text-gray-600">Travaillez en équipe sur vos projets</p>
                    </div>
                  </div>
                </div>

                {/* Bouton Se connecter */}
                <Button 
                  onClick={() => router.push('/auth/login')}
                  className="w-full h-12 rounded-xl text-base font-semibold transition-all duration-300 bg-gradient-to-r from-[#E40046] to-[#FF6B8A] hover:from-[#D4003E] hover:to-[#FF5A7A] shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                >
                  <div className="flex items-center justify-center gap-2">
                    <span>Se connecter</span>
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </Button>

                {/* Texte info */}
                <div className="text-center pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-600">
                    Vous n'avez pas encore de compte ?<br />
                    <span className="text-[#E40046] font-medium">Contactez l'Administrateur pour obtenir vos identifiants</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}

function Dashboard() {
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
  const { user } = useAuth()

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
  )
}
