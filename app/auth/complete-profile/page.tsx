"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { apiRequest } from "@/lib/api"
import Image from "next/image"
import { User, Lock, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react"

export default function CompleteProfilePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')
  
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    confirmPassword: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<{
    name?: string
    password?: string
    confirmPassword?: string
  }>({})

  useEffect(() => {
    if (!token) {
      setError('Token d\'invitation manquant ou invalide')
    }
  }, [token])

  const validateForm = () => {
    const newErrors: typeof errors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Le nom complet est obligatoire'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Le nom doit contenir au moins 2 caractères'
    }
    
    if (!formData.password) {
      newErrors.password = 'Le mot de passe est obligatoire'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères'
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'La confirmation du mot de passe est obligatoire'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    
    if (!validateForm()) {
      return
    }
    
    if (!token) {
      setError('Token d\'invitation manquant')
      return
    }
    
    setSubmitting(true)
    
    try {
      await apiRequest({
        url: "/auth/complete-profile",
        method: "POST",
        body: {
          token,
          name: formData.name.trim(),
          password: formData.password
        }
      })
      
      setSuccess("Profil complété avec succès ! Redirection vers la page de connexion...")
      
      // Rediriger vers la page de connexion après 2 secondes
      setTimeout(() => {
        router.push("/auth/login")
      }, 2000)
      
    } catch (e: any) {
      console.error('Erreur complétion profil:', e)
      if (e.message?.includes('Invalid or expired')) {
        setError('Lien d\'invitation invalide ou expiré. Contactez votre administrateur.')
      } else if (e.message?.includes('already completed')) {
        setError('Ce profil a déjà été complété. Vous pouvez vous connecter.')
        setTimeout(() => {
          router.push("/auth/login")
        }, 2000)
      } else {
        setError('Une erreur est survenue. Veuillez réessayer.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen relative flex items-center justify-center bg-white">
        <div className="absolute inset-0 bg-gradient-to-br from-[#E40046]/5 to-[#C70039]/5"></div>
        
        <Card className="w-full max-w-md mx-4 relative z-10 shadow-xl border-0 bg-white/95 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Lien invalide</h2>
            <p className="text-gray-600 mb-6">
              Le lien d'invitation est manquant ou invalide. Contactez votre administrateur pour obtenir un nouveau lien.
            </p>
            <Button 
              onClick={() => router.push('/auth/login')}
              className="w-full bg-[#E40046] hover:bg-[#E40046]/80 text-white"
            >
              Retour à la connexion
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-white">
      <div className="absolute inset-0 bg-gradient-to-br from-[#E40046]/5 to-[#C70039]/5"></div>
      
      {/* Logo Simplon */}
      <div className="absolute top-6 left-6 z-20">
        <Image
          src="/images/logo2.png"
          alt="Simplon Logo"
          width={120}
          height={40}
          className="h-8 w-auto"
        />
      </div>
      
      <Card className="w-full max-w-md mx-4 relative z-10 shadow-xl border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center pb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-[#E40046] to-[#C70039] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <User className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Compléter votre profil
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Finalisez votre inscription en remplissant les informations manquantes
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle className="w-5 h-5" />
                <p className="text-sm font-medium">{success}</p>
              </div>
            </div>
          )}
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="w-5 h-5" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                Nom complet *
              </Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Votre nom complet"
                className={`mt-1 ${errors.name ? 'border-red-500 focus:border-red-500' : ''}`}
                disabled={submitting}
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Mot de passe *
              </Label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Choisissez un mot de passe sécurisé"
                  className={`pr-10 ${errors.password ? 'border-red-500 focus:border-red-500' : ''}`}
                  disabled={submitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={submitting}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-xs text-blue-700 font-medium mb-1">Exigences du mot de passe :</p>
                <ul className="text-xs text-blue-600 space-y-0.5">
                  <li className="flex items-center gap-1">
                    <span className="w-1 h-1 bg-blue-500 rounded-full"></span>
                    Minimum 6 caractères
                  </li>
                  <li className="flex items-center gap-1">
                    <span className="w-1 h-1 bg-blue-500 rounded-full"></span>
                    Lettres et chiffres recommandés
                  </li>
                </ul>
              </div>
            </div>
            
            <div>
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                Confirmer le mot de passe *
              </Label>
              <div className="relative mt-1">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Confirmez votre mot de passe"
                  className={`pr-10 ${errors.confirmPassword ? 'border-red-500 focus:border-red-500' : ''}`}
                  disabled={submitting}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={submitting}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
              )}
            </div>
            
            <Button
              type="submit"
              className="w-full bg-[#E40046] hover:bg-[#E40046]/80 text-white font-semibold py-3 shadow-lg hover:shadow-xl transition-all duration-200"
              disabled={submitting}
            >
              {submitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Finalisation...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Finaliser mon profil
                </div>
              )}
            </Button>
          </form>
          
          <div className="text-center">
            <p className="text-xs text-gray-500">
              En complétant votre profil, vous acceptez les conditions d'utilisation de Simplon Form.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
