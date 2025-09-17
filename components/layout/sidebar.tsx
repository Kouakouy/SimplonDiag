"use client"


// Composant sidebar réutilisable
import { FileText, Home, LogOut, Settings, Users as UsersIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const menuItems = [
  { icon: Home, label: "Tableau de bord", href: "/" },
  { icon: FileText, label: "Mes formulaires", href: "/forms" },
  { icon: Settings, label: "Paramètres", href: "/settings" },
  { icon: UsersIcon, label: "Utilisateurs", href: "/settings/users" },
]

export function Sidebar() {
  const pathname = usePathname()

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

      <div className="p-4 space-y-2">
        <Link href="/auth/login" className="block">
          <button className="flex items-center justify-center gap-2 px-3 py-2 w-full rounded-lg bg-white text-[#E40046] hover:bg-white/90 transition-colors">
            <span className="font-medium">Se connecter</span>
          </button>
        </Link>
        <button className="flex items-center gap-3 px-3 py-2 text-white/80 hover:text-white w-full rounded-lg hover:bg-[#E40046]/80 transition-colors">
          <LogOut className="w-5 h-5" />
          <span>Déconnexion</span>
        </button>
      </div>
    </div>
  )
}
