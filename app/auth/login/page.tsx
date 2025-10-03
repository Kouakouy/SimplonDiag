"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/contexts/AuthContext"
import { hourglass } from "ldrs"
import Squares from "@/components/ui/Squares"
import { Eye, EyeOff, Mail, Lock, ArrowRight, Sparkles, Shield, Zap } from "lucide-react"
import Image from "next/image"

export default function LoginPage() {
  const { login } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [isFocused, setIsFocused] = useState<{ email: boolean; password: boolean }>({ email: false, password: false })
  const [isHovered, setIsHovered] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  // ✅ On enregistre le web component côté client uniquement
  useEffect(() => {
    if (typeof window !== "undefined") {
      hourglass.register()
    }
  }, [])

  // Animation d'entrée de la carte
  useEffect(() => {
    if (cardRef.current) {
      cardRef.current.style.opacity = "0"
      cardRef.current.style.transform = "translateY(30px)"
      cardRef.current.style.transition = "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)"
      
      setTimeout(() => {
        if (cardRef.current) {
          cardRef.current.style.opacity = "1"
          cardRef.current.style.transform = "translateY(0)"
        }
      }, 100)
    }
  }, [])

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

  // Validation en temps réel
  const validateField = (field: 'email' | 'password', value: string) => {
    if (field === 'email') {
      if (!value.trim()) {
        setErrors(prev => ({ ...prev, email: undefined }))
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        setErrors(prev => ({ ...prev, email: "Adresse email invalide" }))
      } else {
        setErrors(prev => ({ ...prev, email: undefined }))
      }
    } else if (field === 'password') {
      if (!value) {
        setErrors(prev => ({ ...prev, password: undefined }))
      } else if (value.length < 6) {
        setErrors(prev => ({ ...prev, password: "Au moins 6 caractères" }))
      } else {
        setErrors(prev => ({ ...prev, password: undefined }))
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    
    try {
      const user = await login(email, password)
      if (user.role === "admin") {
        router.push("/") // Tableau de bord pour admin
      } else {
        router.push("/forms") // Page formulaires pour les autres
      }
    } catch (error) {
      setErrors({ email: "Identifiants invalides" })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 py-10 overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#E40046] via-[#FF6B8A] to-[#FF8E9B]"></div>
      
      {/* Animated Background */}
      <div className="absolute inset-0 z-0">
        <Squares 
          speed={0.2} 
          squareSize={60}
          direction="diagonal"
          borderColor="rgba(255, 255, 255, 0.15)"
          hoverFillColor="rgba(255, 255, 255, 0.05)"
        />
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-white/5 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-white/8 rounded-full blur-xl animate-pulse delay-2000"></div>
        <div className="absolute bottom-40 right-1/3 w-16 h-16 bg-white/12 rounded-full blur-lg animate-pulse delay-500"></div>
      </div>
      
      {/* Main Content */}
      <div className="relative z-10 w-full flex justify-center">
        <Card 
          ref={cardRef}
          className="w-full max-w-lg shadow-2xl bg-white backdrop-blur-sm border-0 rounded-3xl overflow-hidden"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Header blanc */}
          <CardHeader className="text-center space-y-3 pb-4 bg-white border-b border-gray-100">
            <div className="flex items-center justify-center mb-2">
              <div className="relative">
                <Image
                  src="/images/SimplonAfrica.jpg"
                  alt="Simplon Africa"
                  width={180}
                  height={70}
                  className="object-contain"
                />
                <div className="absolute -top-2 -right-2">
                  <Sparkles className="w-5 h-5 text-[#E40046] animate-pulse" />
                </div>
              </div>
            </div>
            <CardTitle className="text-xl font-bold mb-1 text-gray-900">Connexion</CardTitle>
            <p className="text-gray-600 text-sm font-medium">SIMPLON FORM</p>
          </CardHeader>

          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      validateField('email', e.target.value)
                    }}
                    onFocus={() => setIsFocused(prev => ({ ...prev, email: true }))}
                    onBlur={() => setIsFocused(prev => ({ ...prev, email: false }))}
                    placeholder="email@exemple.com"
                    className={`h-12 px-4 rounded-xl border-2 transition-all duration-300 ${
                      errors.email 
                        ? "border-red-400 bg-red-50 focus:border-red-500" 
                        : isFocused.email 
                          ? "border-[#E40046] bg-white shadow-lg" 
                          : "border-gray-200 hover:border-gray-300"
                    }`}
                  />
                  {isFocused.email && !errors.email && email && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                  )}
                </div>
                {errors.email && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Mot de passe
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      validateField('password', e.target.value)
                    }}
                    onFocus={() => setIsFocused(prev => ({ ...prev, password: true }))}
                    onBlur={() => setIsFocused(prev => ({ ...prev, password: false }))}
                    placeholder="••••••••"
                    className={`h-12 px-4 pr-12 rounded-xl border-2 transition-all duration-300 ${
                      errors.password 
                        ? "border-red-400 bg-red-50 focus:border-red-500" 
                        : isFocused.password 
                          ? "border-[#E40046] bg-white shadow-lg" 
                          : "border-gray-200 hover:border-gray-300"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-lg hover:bg-gray-100"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                  {isFocused.password && !errors.password && password && (
                    <div className="absolute right-10 top-1/2 -translate-y-1/2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                  )}
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                    {errors.password}
                  </p>
                )}
              </div>

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
                  {submitting ? (
                    <>
                      <l-hourglass size="18" bg-opacity="0.1" speed="1.75" color="white"></l-hourglass>
                      <span>Connexion...</span>
                    </>
                  ) : (
                    <>
                      <span>Se Connecter</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </div>
              </Button>

              {/* Forgot Password Link */}
              <div className="text-center pt-2">
                <Link 
                  href="/auth/forgot-password" 
                  className="text-sm text-[#E40046] hover:text-[#D4003E] transition-colors duration-200 hover:underline"
                >
                  Mot de passe oublié ?
                </Link>
              </div>

              {/* Security Badge */}
              <div className="flex items-center justify-center gap-2 pt-4 border-t border-gray-100">
                <Shield className="w-4 h-4 text-green-500" />
                <span className="text-xs text-gray-500">Connexion sécurisée</span>
                <Zap className="w-4 h-4 text-yellow-500" />
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
