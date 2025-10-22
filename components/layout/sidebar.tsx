"use client"

// Composant sidebar réutilisable
import { FileText, Home, LogOut, Settings, Users as UsersIcon, Shield, Eye, PenTool, Menu, X, AlertCircle, Flag } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/contexts/AuthContext"
import { usePermissions } from "@/lib/hooks/usePermissions"
import { ROLE_LABELS } from "@/types/user"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()
  const { canAccess } = usePermissions({ user })
  const [isOpen, setIsOpen] = useState(false)

  // Fermer le drawer quand on change de page
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="w-4 h-4" />
      case 'observer':
        return <Eye className="w-4 h-4" />
      case 'creator':
        return <PenTool className="w-4 h-4" />
      default:
        return null
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800'
      case 'observer':
        return 'bg-blue-100 text-blue-800'
      case 'creator':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const menuItems = [
    { icon: Home, label: "Tableau de bord", href: "/", permission: null, restrictedRoles: ['observer', 'creator'] as string[] },
    { icon: FileText, label: "Mes formulaires", href: "/forms", permission: null, restrictedRoles: [] as string[] },
    { icon: Flag, label: "Mes signalements", href: "/my-reports", permission: null, restrictedRoles: ['admin'] as string[], allowedRoles: ['creator', 'observer'] as string[] },
    { icon: AlertCircle, label: "Gestion des rapports", href: "/admin/reports", permission: null, restrictedRoles: ['creator', 'observer'] as string[], allowedRoles: ['admin'] as string[] },
    { icon: Settings, label: "Paramètres", href: "/settings", permission: null, restrictedRoles: ['observer'] as string[] },
    { icon: UsersIcon, label: "Utilisateurs", href: "/settings/users", permission: 'canManageUsers', restrictedRoles: [] as string[] },
  ].filter(item => {
    // Vérifier les permissions spécifiques
    if (item.permission && !canAccess(item.permission as any)) return false
    // Vérifier les rôles restreints
    if (user && item.restrictedRoles?.includes(user.role)) return false
    return true
  })

  return (
    <>
      {/* Bouton hamburger pour mobile */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-[#E40046] text-white rounded-lg shadow-lg"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Overlay pour mobile */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "w-64 bg-[#E40046] text-white flex flex-col fixed right-0 top-0 h-full z-50 transition-transform duration-300 ease-in-out",
        "lg:translate-x-0 lg:left-0 lg:right-auto",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}>
        {/* Header avec bouton X pour mobile */}
        <div className="p-6 flex items-center justify-between">
          <div className="relative">
            <Image 
              src="/images/logo3.png" 
              alt="Simplon Diag Logo" 
              width={150}
              height={48}
              className="object-contain drop-shadow-lg"
            />
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-1 hover:bg-white/20 rounded"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          // Améliorer la détection de la page active pour les sous-pages
          const isActive = pathname === item.href || 
            (item.href !== "/" && pathname.startsWith(item.href) && 
             // Éviter les conflits : si on est sur une sous-page, ne pas activer le parent
             !menuItems.some(otherItem => 
               otherItem.href !== item.href && 
               otherItem.href.startsWith(item.href) && 
               pathname.startsWith(otherItem.href)
             ))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200",
                isActive 
                  ? "bg-[#E40046] text-white shadow-lg border-l-4 border-white-300" 
                  : "text-pink-200 hover:text-white hover:bg-pink-700 hover:shadow-md"
              )}
            >
              <Icon className={cn(
                "w-5 h-5 transition-colors",
                isActive ? "text-white" : "text-pink-200"
              )} />
              <span className={cn(
                "font-medium transition-colors",
                isActive ? "text-white" : "text-pink-200"
              )}>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Section utilisateur */}
      {user && (
        <div className="p-4 space-y-3">
          {/* Informations utilisateur */}
          <div className="bg-white/10 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold text-white">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">
                  {user.name}
                </div>
                <div className="text-xs text-pink-200 truncate">
                  {user.email}
                </div>
              </div>
            </div>
            <Badge className={`${getRoleColor(user.role)} flex items-center gap-1 w-fit`}>
              {getRoleIcon(user.role)}
              {ROLE_LABELS[user.role]}
            </Badge>
          </div>
          
          {/* Bouton signaler un problème - Caché pour les administrateurs */}
          {user?.role !== 'admin' && (
            <Link href="/report">
              <Button 
                variant="ghost" 
                className="w-full justify-start text-pink-200 hover:text-white hover:bg-pink-700 mb-2"
              >
                <AlertCircle className="w-4 h-4 mr-2" />
                Signaler un problème
              </Button>
            </Link>
          )}
          
          {/* Bouton déconnexion */}
          <Button 
            variant="ghost" 
            onClick={() => {
              logout()
              router.push('/auth/login')
            }}
            className="w-full justify-start text-pink-200 hover:text-white hover:bg-pink-700"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Déconnexion
          </Button>
        </div>
      )}
      </div>
    </>
  )
}
