"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { apiRequest } from "@/lib/api"
import Image from "next/image"
import { Lock, Eye, EyeOff } from "lucide-react"

export default function ResetPasswordPage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [show, setShow] = useState<{ p: boolean; c: boolean }>({ p: false, c: false })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.")
      return
    }
    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas.")
      return
    }
    setSubmitting(true)
    try {
      await apiRequest({ url: "/auth/reset-password", method: "POST", body: { token, password } })
      setSuccess("Votre mot de passe a été réinitialisé avec succès. Redirection en cours...")
      setTimeout(() => router.push("/auth/login"), 1200)
    } catch (e: any) {
      setError("Lien invalide ou expiré. Veuillez refaire une demande.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center">
      {/* Image de fond avec flou */}
      <Image
        src="/images/fond.png"
        alt="Background"
        fill
        className="object-cover blur-sm"
        priority
      />
      
      {/* Overlay pour améliorer la lisibilité */}
      <div className="absolute inset-0 bg-black/30"></div>
      
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
              <h1 className="text-3xl lg:text-4xl font-bold drop-shadow-lg">
                Plateforme de diagnostic de profil<br />
                pour un programme de formation plus adaptée
              </h1>
              
              <div className="inline-block bg-[#E40046] text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                Powered by Simplon Africa
              </div>
            </div>
          </div>

          {/* Colonne Droite - Formulaire */}
          <Card className="w-full shadow-2xl drop-shadow-2xl bg-white border-0 rounded-3xl overflow-hidden" style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
            <CardHeader className="text-center space-y-3 pb-4 bg-white border-b border-gray-100">
              <CardTitle className="text-2xl font-bold text-gray-900">Réinitialiser le mot de passe</CardTitle>
              <p className="text-gray-600 text-sm">Choisissez un nouveau mot de passe pour votre compte.</p>
            </CardHeader>
            
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Nouveau mot de passe */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Nouveau mot de passe
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={show.p ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="h-12 px-4 pr-12 rounded-xl border-2 transition-all duration-300 border-gray-200 hover:border-gray-300 focus:border-[#E40046]"
                      required
                    />
                    <button 
                      type="button" 
                      onClick={() => setShow(s => ({ ...s, p: !s.p }))} 
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-lg hover:bg-gray-100"
                    >
                      {show.p ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Confirmer le mot de passe */}
                <div className="space-y-2">
                  <Label htmlFor="confirm" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Confirmer le mot de passe
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirm"
                      type={show.c ? "text" : "password"}
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="••••••••"
                      className="h-12 px-4 pr-12 rounded-xl border-2 transition-all duration-300 border-gray-200 hover:border-gray-300 focus:border-[#E40046]"
                      required
                    />
                    <button 
                      type="button" 
                      onClick={() => setShow(s => ({ ...s, c: !s.c }))} 
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-lg hover:bg-gray-100"
                    >
                      {show.c ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Messages de succès/erreur */}
                {success && (
                  <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl p-3">
                    {success}
                  </div>
                )}
                {error && (
                  <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">
                    {error}
                  </div>
                )}

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  disabled={submitting} 
                  className={`w-full h-12 rounded-xl text-base font-semibold transition-all duration-300 ${
                    submitting 
                      ? "bg-gray-400 cursor-not-allowed" 
                      : "bg-gradient-to-r from-[#E40046] to-[#FF6B8A] hover:from-[#D4003E] hover:to-[#FF5A7A] shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    {submitting && <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>}
                    <span>{submitting ? "Réinitialisation..." : "Réinitialiser"}</span>
                  </div>
                </Button>
              </form>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}


