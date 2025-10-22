"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { User } from '@/types/user'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<User>
  logout: () => void
  updateUser: (user: User) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté au chargement
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token')
        const savedUser = localStorage.getItem('user_data')
        
        if (token) {
          // D'abord, essayer de récupérer les données utilisateur depuis le localStorage
          if (savedUser) {
            try {
              const userData = JSON.parse(savedUser)
              setUser(userData)
             
            } catch (parseError) {
             
            }
          }
          
          // Ensuite, essayer de vérifier avec l'API
          try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/auth/me`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            })
            
            if (response.ok) {
              const userData = await response.json()
              setUser(userData)
              // Sauvegarder les données utilisateur dans localStorage
              localStorage.setItem('user_data', JSON.stringify(userData))
              
            } else {
              
              // Si pas de données sauvegardées et pas d'API, nettoyer le token
              if (!savedUser) {
                localStorage.removeItem('auth_token')
                setUser(null)
              }
            }
          } catch (apiError) {
            
            // Si pas de données sauvegardées et erreur API, nettoyer le token
            if (!savedUser) {
              localStorage.removeItem('auth_token')
              setUser(null)
            }
          }
        } else {
          // Pas de token, nettoyer les données sauvegardées
          localStorage.removeItem('user_data')
          setUser(null)
        }
      } catch (error) {
       
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user_data')
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string): Promise<User> => {
    setLoading(true)
    try {
      
      
      // Appel API de connexion
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })
      
     
      
      if (!response.ok) {
        const errorData = await response.json()
        
        throw new Error(errorData.message || 'Identifiants invalides')
      }
      
      const { token } = await response.json()
      
      localStorage.setItem('auth_token', token)
      
      // Essayer de récupérer les informations utilisateur
      try {
        
        const userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
        
        
        
        if (userResponse.ok) {
          const userData = await userResponse.json()
         
          setUser(userData)
          // Sauvegarder les données utilisateur dans localStorage
          localStorage.setItem('user_data', JSON.stringify(userData))
          return userData
        } else {
          const errorData = await userResponse.json()
          
          // Si l'endpoint /auth/me n'existe pas, créer un utilisateur mock basé sur l'email
         
          const mockUser: User = {
            id: '1',
            email: email,
            name: email.split('@')[0],
            role: email.includes('admin') ? 'admin' : email.includes('observer') ? 'observer' : 'creator',
            createdAt: new Date(),
            updatedAt: new Date(),
            isActive: true,
          }
          setUser(mockUser)
          // Sauvegarder les données mock dans localStorage
          localStorage.setItem('user_data', JSON.stringify(mockUser))
          return mockUser
        }
      } catch (userError) {
        
        // Fallback avec des données mock basées sur l'email
        const mockUser: User = {
          id: '1',
          email: email,
          name: email.split('@')[0],
          role: email.includes('admin') ? 'admin' : email.includes('observer') ? 'observer' : 'creator',
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: true,
        }
        setUser(mockUser)
        // Sauvegarder les données mock dans localStorage
        localStorage.setItem('user_data', JSON.stringify(mockUser))
        return mockUser
      }
    } catch (error) {
      
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_data')
    setUser(null)
  }

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser)
    // Synchroniser avec le localStorage
    localStorage.setItem('user_data', JSON.stringify(updatedUser))
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
