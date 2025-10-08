"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { apiRequest } from "@/lib/api"
import Image from "next/image"
import { Mail, ArrowLeft } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [errors, setErrors] = useState<{ email?: string }>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setSuccess(null)
    setError(null)
    // validation simple
    const next: { email?: string } = {}
    if (!email.trim()) next.email = "L'email est obligatoire"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Adresse email invalide"
    setErrors(next)
    if (Object.keys(next).length > 0) { setSubmitting(false); return }
    try {
      await apiRequest({ url: "/auth/forgot-password", method: "POST", body: { email } })
      setSuccess("Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.")
    } catch (e: any) {
      setError("Une erreur est survenue. Veuillez réessayer.")
    } finally {
      setSubmitting(false)
    }
  }

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
              <h1 className="text-3xl text-[#113744] lg:text-4xl font-bold drop-shadow-lg">
                Plateforme de diagnostic de profil
                pour un programme de <br /> formation plus adaptée
              </h1>
              
              <div className="inline-block bg-[#E40046] text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                Powered by Simplon Africa
              </div>
            </div>
          </div>

          {/* Colonne Droite - Formulaire */}
          <Card className="w-full shadow-2xl drop-shadow-2xl bg-white border-0 rounded-3xl overflow-hidden" style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
            <CardHeader className="text-center space-y-3 pb-4 bg-white border-b border-gray-100">
              <CardTitle className="text-2xl font-bold text-gray-900">Mot de passe oublié</CardTitle>
              <p className="text-gray-600 text-sm">Entrez votre adresse email pour recevoir un lien de réinitialisation.</p>
            </CardHeader>
            
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Adresse email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@exemple.com"
                    className={`h-12 px-4 rounded-xl border-2 transition-all duration-300 ${
                      errors.email 
                        ? "border-red-400 bg-red-50 focus:border-red-500" 
                        : "border-gray-200 hover:border-gray-300 focus:border-[#E40046]"
                    }`}
                    required
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                      {errors.email}
                    </p>
                  )}
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
                    <span>{submitting ? "Envoi..." : "Envoyer le lien"}</span>
                  </div>
                </Button>

                {/* Retour à la connexion */}
                <div className="text-center pt-2">
                  <Link 
                    href="/auth/login" 
                    className="text-sm text-[#E40046] hover:text-[#D4003E] transition-colors duration-200 hover:underline flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Retour à la connexion
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}


