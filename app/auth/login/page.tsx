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
import { Eye, EyeOff, Mail, Lock, ArrowRight, Sparkles, Shield, Zap } from "lucide-react"
import Image from "next/image"

function LoginPageContent() {
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
    <div className="min-h-screen relative flex items-center justify-center bg-white">
      {/* Image de fond */}
      <Image
        src="/images/BackgroundFade.jpg"
        alt="Background"
        fill
        className="absolute inset-0 w-full h-full object-cover opacity-20"
        priority
      />
      
      {/* Contenu principal - Mise en page en 2 colonnes */}
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
              <h1 className="text-xl lg:text-4xl font-bold drop-shadow-lg text-[#113744] ">
                Plateforme de diagnostic de profil<br />
                pour un programme de formation plus adaptée
              </h1>
            
              <div className="inline-block bg-[#E40046] text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                Powered by Simplon Africa
              </div>
            </div>
          </div>
          {/* Colonne Droite - Formulaire */}
          <Card 
            ref={cardRef}
            className="w-full shadow-2xl drop-shadow-2xl bg-white border-0 rounded-3xl overflow-hidden" 
            style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}
          >
            {/* Header */}
            <CardHeader className="text-center space-y-3 pb-0">
              <CardTitle className="text-2xl font-bold text-gray-900">Connexion</CardTitle>
            </CardHeader>

            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Adresse email
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
    </div>
  )
}

// Styles globaux pour les animations de la carte
const styles = `
  /* Animation d'entrée de la carte */
  @keyframes fadeInUp {
    0% {
      opacity: 0;
      transform: translateY(20px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .card-enter {
    animation-name: fadeInUp;
    animation-duration: 0.6s;
    animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    animation-fill-mode: forwards;
  }
`;

// Composant principal de la page de connexion
const LoginPage = () => {
  return (
    <>
      <style jsx global>{styles}</style>
      <LoginPageContent />
    </>
  );
};

export default LoginPage;