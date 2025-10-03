"use client"

import { useState } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  User, 
  Save,
  Eye,
  EyeOff,
  Lock
} from "lucide-react"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile")
  const [showPassword, setShowPassword] = useState(false)
  
  // État des paramètres
  const [settings, setSettings] = useState({
    profile: {
      name: "Admin Simplon",
      email: "admin@simplonform.com",
      company: "Simplon Form"
    }
  })

  const updateSetting = (section: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [key]: value
      }
    }))
  }


  const tabs = [
    { id: "profile", label: "Profil", icon: User },
    { id: "password", label: "Mot de passe", icon: Lock },
  ]

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
                          placeholder="Nouveau mot de passe"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="confirmPassword" className="text-sm">Confirmer le mot de passe</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
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
              <Button className="bg-[#E40046] hover:bg-[#E40046]/80 w-full sm:w-auto">
                <Save className="w-4 h-4 mr-2" />
                <span className="text-sm sm:text-base">Sauvegarder les modifications</span>
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
