"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/contexts/AuthContext'

interface AuthGuardProps {
  children: React.ReactNode
  requiredRole?: 'admin' | 'observer' | 'creator'
  fallbackUrl?: string
}

export function AuthGuard({ children, requiredRole, fallbackUrl = '/auth/login' }: AuthGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      // Si pas d'utilisateur connecté, rediriger vers la page de connexion
      if (!user) {
        router.push(fallbackUrl)
        return
      }

      // Si un rôle spécifique est requis, vérifier les permissions
      if (requiredRole) {
        const hasPermission = checkRolePermission(user.role, requiredRole)
        if (!hasPermission) {
          // Rediriger vers une page d'erreur ou la page d'accueil
          router.push('/')
          return
        }
      }
    }
  }, [user, loading, router, requiredRole, fallbackUrl])

  // Afficher un loader pendant la vérification
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#E40046] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification de l'authentification...</p>
        </div>
      </div>
    )
  }

  // Si pas d'utilisateur, ne rien afficher (redirection en cours)
  if (!user) {
    return null
  }

  // Si un rôle est requis et que l'utilisateur n'a pas les permissions
  if (requiredRole && !checkRolePermission(user.role, requiredRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Accès refusé</h2>
          <p className="text-gray-600 mb-4">Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-[#E40046] text-white rounded-lg hover:bg-[#C70039] transition-colors"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

// Fonction pour vérifier les permissions de rôle
function checkRolePermission(userRole: string, requiredRole: string): boolean {
  // Admin a accès à tout
  if (userRole === 'admin') return true
  
  // Observer peut voir les formulaires mais pas les créer/modifier
  if (userRole === 'observer') {
    return requiredRole === 'observer'
  }
  
  // Creator peut créer et voir ses propres formulaires
  if (userRole === 'creator') {
    return requiredRole === 'creator' || requiredRole === 'observer'
  }
  
  return false
}
