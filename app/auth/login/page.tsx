"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/contexts/AuthContext"
import { hourglass } from 'ldrs'
import Squares from "@/components/ui/Squares"
import { Eye, EyeOff } from "lucide-react"
import Image from "next/image"

// Enregistrer le composant hourglass
hourglass.register()

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
      const user = await login(email, password)
      // Rediriger selon le rôle de l'utilisateur
      if (user.role === 'admin') {
        router.push('/') // Tableau de bord pour les admins
      } else {
        router.push('/forms') // Mes formulaires pour les créateurs et observateurs
      }
    } catch (error) {
      setErrors({ email: 'Identifiants invalides' })
    } finally {
      setSubmitting(false)
    }
  }


  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 py-10 bg-[#E40046]">
      {/* Arrière-plan animé */}
      <div className="absolute inset-0 z-0">
        <Squares 
          speed={0.3} 
          squareSize={50}
          direction='diagonal'
          borderColor='rgba(255, 255, 255, 0.3)'
          hoverFillColor='rgba(255, 255, 255, 0.1)'
        />
      </div>
      
      {/* Contenu de la page */}
      <div className="relative z-10 w-full flex justify-center">
        <Card className="w-full max-w-2xl shadow-lg bg-white">
        <CardHeader className="text-center space-y-2">
          <div className="flex items-center justify-center">
            {/* Logo Simplon Africa */}
            <Image
              src="/images/SimplonAfrica.jpg"
              alt="Simplon Africa"
              width={200}
              height={80}
              className="object-contain"
            />
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password}</p>}
            </div>
            <Button type="submit" disabled={submitting} className="w-full bg-[#E40046] hover:bg-[#E40046]/80 h-11 text-base flex items-center justify-center gap-2">
              {submitting && <l-hourglass size="16" bg-opacity="0.1" speed="1.75" color="white"></l-hourglass>}
              <span>{submitting ? "Connexion..." : "Se Connecter"}</span>
            </Button>
            <div className="text-center">
              <Link href="/auth/forgot-password" className="text-blue-600 hover:underline text-sm">Mot de passe oublié ?</Link>
            </div>
          </form>
        </CardContent>
        </Card>
      </div>
    </div>
  )
}


