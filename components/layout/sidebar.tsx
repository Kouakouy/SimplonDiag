"use client"

// Composant sidebar réutilisable
import { FileText, Home, LogOut, Settings, Users as UsersIcon, Shield, Eye, PenTool } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/contexts/AuthContext"
import { usePermissions } from "@/lib/hooks/usePermissions"
import { ROLE_LABELS } from "@/types/user"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { canAccess } = usePermissions({ user })

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
    { icon: Home, label: "Tableau de bord", href: "/", permission: null },
    { icon: FileText, label: "Mes formulaires", href: "/forms", permission: null },
    { icon: Settings, label: "Paramètres", href: "/settings", permission: null },
    { icon: UsersIcon, label: "Utilisateurs", href: "/settings/users", permission: 'canManageUsers' },
  ].filter(item => !item.permission || canAccess(item.permission as any))

  return (
    <div className="w-64 bg-[#E40046] text-white flex flex-col fixed left-0 top-0 h-full z-10">
      <div className="p-6">
        <div className="flex items-center gap-2">
          <FileText className="w-6 h-6" />
          <h1 className="text-xl font-semibold">Simplon Form</h1>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          // Améliorer la détection de la page active pour les sous-pages
          const isActive = pathname === item.href || 
            (item.href !== "/" && pathname.startsWith(item.href))

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
      {user ? (
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
          
          {/* Bouton déconnexion */}
          <Button 
            variant="ghost" 
            onClick={logout}
            className="w-full justify-start text-pink-200 hover:text-white hover:bg-pink-700"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Déconnexion
          </Button>
        </div>
      ) : (
        <div className="p-4">
          <Link href="/auth/login" className="block">
            <Button className="w-full bg-white text-[#E40046] hover:bg-white/90">
              Se connecter
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
