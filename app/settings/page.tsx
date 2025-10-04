"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/contexts/AuthContext"
import { apiRequest } from "@/lib/api"
import { hourglass } from "ldrs"
import { useToast, Toast } from "@/components/ui/toast"
import { 
  User, 
  Save,
  Eye,
  EyeOff,
  Lock,
  Loader2
} from "lucide-react"

// Enregistrer le composant hourglass côté client
if (typeof window !== "undefined") {
  hourglass.register()
}

export default function SettingsPage() {
  const { user, updateUser } = useAuth()
  const { toasts, success, error, removeToast } = useToast()
  const [activeTab, setActiveTab] = useState("profile")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  
  // État des paramètres
  const [settings, setSettings] = useState({
    profile: {
      name: "",
      email: "",
      company: ""
    },
    password: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    }
  })

  // Charger les données utilisateur au montage
  useEffect(() => {
    if (user) {
      setSettings(prev => ({
        ...prev,
        profile: {
          name: user.name || "",
          email: user.email || "",
          company: "Simplon Form" // Valeur par défaut
        }
      }))
    }
  }, [user])

  const updateSetting = (section: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [key]: value
      }
    }))
  }

  // Validation des données
  const validateProfile = () => {
    if (!settings.profile.name.trim()) {
      error('Erreur de validation', 'Le nom est obligatoire')
      return false
    }
    if (!settings.profile.email.trim()) {
      error('Erreur de validation', 'L\'email est obligatoire')
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.profile.email)) {
      error('Erreur de validation', 'Adresse email invalide')
      return false
    }
    return true
  }

  const validatePassword = () => {
    if (!settings.password.currentPassword) {
      error('Erreur de validation', 'Le mot de passe actuel est obligatoire')
      return false
    }
    if (!settings.password.newPassword) {
      error('Erreur de validation', 'Le nouveau mot de passe est obligatoire')
      return false
    }
    if (settings.password.newPassword.length < 6) {
      error('Erreur de validation', 'Le nouveau mot de passe doit contenir au moins 6 caractères')
      return false
    }
    if (settings.password.newPassword !== settings.password.confirmPassword) {
      error('Erreur de validation', 'Les mots de passe ne correspondent pas')
      return false
    }
    return true
  }

  // Sauvegarder les paramètres
  const handleSave = async () => {
    setSaving(true)

    try {
      if (activeTab === "profile") {
        if (!validateProfile()) return

        // Mettre à jour le profil
        const updatedUser = {
          ...user!,
          name: settings.profile.name,
          email: settings.profile.email
        }

        // Appel API pour mettre à jour le profil
        await apiRequest({
          url: '/auth/profile',
          method: 'PUT',
          body: {
            name: settings.profile.name,
            email: settings.profile.email
          }
        })

        // Mettre à jour le contexte utilisateur
        updateUser(updatedUser)
        success('Succès', 'Profil mis à jour avec succès')

      } else if (activeTab === "password") {
        if (!validatePassword()) return

        // Changer le mot de passe
        await apiRequest({
          url: '/auth/change-password',
          method: 'PUT',
          body: {
            currentPassword: settings.password.currentPassword,
            newPassword: settings.password.newPassword
          }
        })

        // Réinitialiser le formulaire de mot de passe
        setSettings(prev => ({
          ...prev,
          password: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: ""
          }
        }))
        success('Succès', 'Mot de passe modifié avec succès')
      }
    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde:', error)
      error('Erreur', error.message || 'Erreur lors de la sauvegarde des paramètres')
    } finally {
      setSaving(false)
    }
  }

  const tabs = [
    { id: "profile", label: "Profil", icon: User },
    { id: "password", label: "Mot de passe", icon: Lock },
  ]

  // État de chargement initial
  if (!user) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <Sidebar />
        <div className="ml-0 lg:ml-64 flex flex-col min-h-screen">
          <main className="flex-1 p-3 sm:p-4 lg:p-6 overflow-y-auto flex items-center justify-center">
            <div className="text-center">
              <l-hourglass size="40" bg-opacity="0.1" speed="1.75" color="#E40046"></l-hourglass>
              <p className="text-gray-500 mt-4">Chargement des paramètres...</p>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <Sidebar />

      <div className="ml-0 lg:ml-64 flex flex-col min-h-screen">
        <main className="flex-1 p-3 sm:p-4 lg:p-6 overflow-y-auto">
          {/* En-tête */}
          <div className="flex items-center justify-between mb-6 lg:mb-8">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Paramètres</h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">Gérez vos préférences et paramètres de compte</p>
            </div>
          </div>

          <div className="max-w-6xl mx-auto">
            {/* Navigation par onglets */}
            <div className="flex space-x-1 mb-6 lg:mb-8 bg-gray-100 p-1 rounded-lg overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? "bg-white text-[#E40046] shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                    {tab.label}
                  </button>
                )
              })}
            </div>

            {/* Contenu des onglets */}
            {activeTab === "profile" && (
              <div className="space-y-4 sm:space-y-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <User className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="text-sm sm:text-base">Informations personnelles</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-0">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name" className="text-sm">Nom complet</Label>
                        <Input
                          id="name"
                          value={settings.profile.name}
                          onChange={(e) => updateSetting("profile", "name", e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email" className="text-sm">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={settings.profile.email}
                          onChange={(e) => updateSetting("profile", "email", e.target.value)}
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="company" className="text-sm">Entreprise</Label>
                      <Input
                        id="company"
                        value={settings.profile.company}
                        onChange={(e) => updateSetting("profile", "company", e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "password" && (
              <div className="space-y-4 sm:space-y-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="text-sm sm:text-base">Changer le mot de passe</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-0">
                    <div>
                      <Label htmlFor="currentPassword" className="text-sm">Mot de passe actuel</Label>
                      <div className="relative mt-1">
                        <Input
                          id="currentPassword"
                          type={showPassword ? "text" : "password"}
                          value={settings.password.currentPassword}
                          onChange={(e) => updateSetting("password", "currentPassword", e.target.value)}
                          placeholder="Entrez votre mot de passe actuel"
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="newPassword" className="text-sm">Nouveau mot de passe</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          value={settings.password.newPassword}
                          onChange={(e) => updateSetting("password", "newPassword", e.target.value)}
                          placeholder="Nouveau mot de passe"
                          className="mt-1"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Minimum 6 caractères requis
                        </p>
                      </div>
                      <div>
                        <Label htmlFor="confirmPassword" className="text-sm">Confirmer le mot de passe</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={settings.password.confirmPassword}
                          onChange={(e) => updateSetting("password", "confirmPassword", e.target.value)}
                          placeholder="Confirmer le nouveau mot de passe"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Bouton de sauvegarde */}
            <div className="mt-6 lg:mt-8 flex justify-end">
              <Button 
                onClick={handleSave}
                disabled={saving}
                className="bg-[#E40046] hover:bg-[#E40046]/80 w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    <span className="text-sm sm:text-base">Sauvegarde...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    <span className="text-sm sm:text-base">Sauvegarder les modifications</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </main>
      </div>

      {/* Toasts */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          type={toast.type}
          title={toast.title}
          message={toast.message}
          duration={toast.duration}
        />
      ))}
    </div>
  )
}
