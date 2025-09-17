"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { apiRequest } from "@/lib/api"

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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <Card className="w-full max-w-xl shadow-sm">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl font-bold text-gray-900">Réinitialiser le mot de passe</CardTitle>
          <p className="text-gray-600">Choisissez un nouveau mot de passe pour votre compte.</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="password" className="text-base">Nouveau mot de passe</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={show.p ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="mt-2 pr-20"
                  required
                />
                <button type="button" onClick={() => setShow(s => ({ ...s, p: !s.p }))} className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-600 hover:text-gray-800 px-2 py-1">{show.p ? "Masquer" : "Afficher"}</button>
              </div>
            </div>
            <div>
              <Label htmlFor="confirm" className="text-base">Confirmer le mot de passe</Label>
              <div className="relative">
                <Input
                  id="confirm"
                  type={show.c ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  className="mt-2 pr-20"
                  required
                />
                <button type="button" onClick={() => setShow(s => ({ ...s, c: !s.c }))} className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-600 hover:text-gray-800 px-2 py-1">{show.c ? "Masquer" : "Afficher"}</button>
              </div>
            </div>

            {success && <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded p-2">{success}</p>}
            {error && <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-2">{error}</p>}

            <Button type="submit" disabled={submitting} className="w-full bg-[#E40046] hover:bg-[#E40046]/80 h-11 text-base flex items-center justify-center gap-2">
              {submitting && <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>}
              <span>{submitting ? "Réinitialisation..." : "Réinitialiser"}</span>
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}


