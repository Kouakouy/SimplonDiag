"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    // Intégration backend volontairement non branchée pour validation ultérieure
    // Placeholder: garder la page statique pour l'instant
    setTimeout(() => setSubmitting(false), 600)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <Card className="w-full max-w-xl shadow-sm">
        <CardHeader className="text-center space-y-2">
          <div className="flex items-center justify-center">
            {/* Logo simplon style */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#E40046] text-white flex items-center justify-center text-xl font-bold">•</div>
              <div className="text-left">
                <div className="text-2xl font-semibold tracking-tight">simplon</div>
                <div className="text-[10px] text-gray-500 -mt-1">AFRICA</div>
              </div>
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900">Connexion</CardTitle>
          <p className="text-lg text-gray-700">SIMPLON FORM</p>
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
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-base">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-2"
              />
            </div>
            <Button type="submit" disabled={submitting} className="w-full bg-[#E40046] hover:bg-[#E40046]/80 h-11 text-base">
              {submitting ? "Connexion..." : "Se Connecter"}
            </Button>
            <div className="text-center">
              <Link href="/auth/forgot-password" className="text-blue-600 hover:underline text-sm">Mot de passe oublié ?</Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}


