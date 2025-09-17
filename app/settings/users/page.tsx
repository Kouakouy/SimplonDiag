"use client"

import { useEffect, useState } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { apiRequest } from "@/lib/api"
import { Plus, Trash2, Shield, Mail, User } from "lucide-react"

interface DashboardUser {
  id: string
  email: string
  name?: string
  role: "owner" | "admin" | "viewer"
}

export default function UsersSettingsPage() {
  const [users, setUsers] = useState<DashboardUser[]>([])
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [role, setRole] = useState<"owner" | "admin" | "viewer">("viewer")

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        // Placeholder: si backend non prêt, utiliser stockage local
        const resp = await apiRequest<any[]>({ url: "/auth/users" }).catch(() => [])
        const adapted = (resp || []).map((u: any) => ({
          id: u.id || u._id || u.email,
          email: u.email,
          name: u.name || "",
          role: (u.role as DashboardUser["role"]) || "viewer",
        }))
        setUsers(adapted)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const addUser = async () => {
    if (!email.trim()) return
    // Si l'API n'existe pas encore, on ajoute côté UI pour démo
    try {
      const body = { email: email.trim(), name: name.trim(), role }
      await apiRequest({ url: "/auth/users", method: "POST", body }).catch(() => undefined)
      setUsers((prev) => [{ id: email, email, name, role }, ...prev])
      setEmail("")
      setName("")
      setRole("viewer")
    } catch {
      // ignore
    }
  }

  const removeUser = async (id: string) => {
    try {
      await apiRequest({ url: `/auth/users/${encodeURIComponent(id)}`, method: "DELETE" }).catch(() => undefined)
      setUsers((prev) => prev.filter((u) => u.id !== id))
    } catch {
      // ignore
    }
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <Sidebar />
      <div className="ml-64 flex flex-col min-h-screen">
        <main className="flex-1 p-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Utilisateurs du Dashboard</h1>
              <p className="text-gray-600 mt-1">Gérez qui peut accéder au dashboard</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Formulaire d'ajout */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Ajouter un utilisateur</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Nom</Label>
                  <div className="relative mt-1">
                    <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nom complet" className="pl-9" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <div className="relative mt-1">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@exemple.com" className="pl-9" />
                  </div>
                </div>
                <div>
                  <Label>Rôle</Label>
                  <div className="flex items-center gap-2 mt-1">
                    {(["viewer","admin","owner"] as const).map((r) => (
                      <button key={r} type="button" onClick={() => setRole(r)} className={`px-3 py-1 rounded-full text-sm border ${role===r? 'bg-pink-600 text-white border-pink-600':'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
                <Button onClick={addUser} className="bg-pink-600 hover:bg-pink-700 w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter
                </Button>
              </CardContent>
            </Card>

            {/* Liste des utilisateurs */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Liste des utilisateurs</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="p-6 text-gray-600">Chargement...</div>
                ) : users.length === 0 ? (
                  <div className="p-6 text-gray-600">Aucun utilisateur pour le moment</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="text-left p-3">Nom</th>
                          <th className="text-left p-3">Email</th>
                          <th className="text-left p-3">Rôle</th>
                          <th className="text-right p-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((u) => (
                          <tr key={u.id} className="border-b">
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-pink-100 text-pink-700 flex items-center justify-center text-xs font-semibold">
                                  {(u.name?.trim()?.charAt(0) || u.email.charAt(0)).toUpperCase()}
                                </div>
                                <span className="font-medium text-gray-900">{u.name || '—'}</span>
                              </div>
                            </td>
                            <td className="p-3 text-gray-700">{u.email}</td>
                            <td className="p-3">
                              <Badge variant="outline" className="capitalize">{u.role}</Badge>
                            </td>
                            <td className="p-3 text-right">
                              <Button variant="ghost" onClick={() => removeUser(u.id)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}


