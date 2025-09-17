"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { apiRequest } from "@/lib/api"

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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <Card className="w-full max-w-xl shadow-sm">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl font-bold text-gray-900">Mot de passe oublié</CardTitle>
          <p className="text-gray-600">Entrez votre adresse email pour recevoir un lien de réinitialisation.</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="email" className="text-base">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@exemple.com"
                className={`mt-2 ${errors.email ? "border-red-500" : ""}`}
                required
              />
              {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
            </div>

            {success && <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded p-2">{success}</p>}
            {error && <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-2">{error}</p>}

            <Button type="submit" disabled={submitting} className="w-full bg-[#E40046] hover:bg-[#E40046]/80 h-11 text-base flex items-center justify-center gap-2">
              {submitting && <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>}
              <span>{submitting ? "Envoi..." : "Envoyer le lien"}</span>
            </Button>
            <div className="text-center">
              <Link href="/auth/login" className="text-blue-600 hover:underline text-sm">Retour à la connexion</Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}


