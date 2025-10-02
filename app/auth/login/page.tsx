"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/contexts/AuthContext"
import { Shield, Eye, PenTool } from "lucide-react"

export default function LoginPage() {
  const { login } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})

  const validate = () => {
    const next: { email?: string; password?: string } = {}
    if (!email.trim()) {
      next.email = "L'email est obligatoire"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      next.email = "Adresse email invalide"
    }
    if (!password) {
      next.password = "Le mot de passe est obligatoire"
    } else if (password.length < 6) {
      next.password = "Au moins 6 caractères"
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    
    try {
      await login(email, password)
      router.push('/forms')
    } catch (error) {
      setErrors({ email: 'Identifiants invalides' })
    } finally {
      setSubmitting(false)
    }
  }

  const quickLogin = (userEmail: string) => {
    setEmail(userEmail)
    setPassword('password123')
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
                className={`mt-2 ${errors.email ? "border-red-500" : ""}`}
              />
              {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
            </div>
            <div>
              <Label htmlFor="password" className="text-base">Mot de passe</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`mt-2 pr-20 ${errors.password ? "border-red-500" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-600 hover:text-gray-800 px-2 py-1"
                >
                  {showPassword ? "Masquer" : "Afficher"}
                </button>
              </div>
              {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password}</p>}
            </div>
            <Button type="submit" disabled={submitting} className="w-full bg-[#E40046] hover:bg-[#E40046]/80 h-11 text-base flex items-center justify-center gap-2">
              {submitting && <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>}
              <span>{submitting ? "Connexion..." : "Se Connecter"}</span>
            </Button>
            <div className="text-center">
              <Link href="/auth/forgot-password" className="text-blue-600 hover:underline text-sm">Mot de passe oublié ?</Link>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Comptes de démonstration */}
      <Card className="w-full max-w-xl shadow-sm mt-6">
        <CardHeader>
          <CardTitle className="text-center">Comptes de démonstration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-red-600" />
                <div>
                  <div className="font-medium text-red-900">Administrateur</div>
                  <div className="text-sm text-red-700">admin@simplon.com</div>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => quickLogin('admin@simplon.com')}
                className="text-red-600 border-red-200 hover:bg-red-100"
              >
                Utiliser
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="font-medium text-blue-900">Observateur</div>
                  <div className="text-sm text-blue-700">observer@simplon.com</div>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => quickLogin('observer@simplon.com')}
                className="text-blue-600 border-blue-200 hover:bg-blue-100"
              >
                Utiliser
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <PenTool className="w-5 h-5 text-green-600" />
                <div>
                  <div className="font-medium text-green-900">Créateur</div>
                  <div className="text-sm text-green-700">creator@simplon.com</div>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => quickLogin('creator@simplon.com')}
                className="text-green-600 border-green-200 hover:bg-green-100"
              >
                Utiliser
              </Button>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 text-center">
              <strong>Mot de passe pour tous les comptes :</strong> password123
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


