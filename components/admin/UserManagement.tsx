"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { apiRequest } from '@/lib/api'
import { useAuth } from '@/lib/contexts/AuthContext'
import { usePermissions } from '@/lib/hooks/usePermissions'
import type { User, UserRole } from '@/types/user'
import { ROLE_LABELS, ROLE_DESCRIPTIONS } from '@/types/user'
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Shield, 
  Eye, 
  PenTool,
  Mail,
  User as UserIcon,
  Calendar
} from 'lucide-react'

export function UserManagement() {
  const { user: currentUser } = useAuth()
  const { canAccess } = usePermissions({ user: currentUser })
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  // Formulaire de création/édition
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'creator' as UserRole,
    password: '',
  })

  useEffect(() => {
    if (canAccess('canManageUsers')) {
      loadUsers()
    }
  }, [canAccess])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/auth/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        const usersData = await response.json()
        setUsers(usersData)
      } else {
        console.error('Erreur lors du chargement des utilisateurs')
      }
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/auth/users`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      
      if (response.ok) {
        await loadUsers() // Recharger la liste
        setShowCreateForm(false)
        resetForm()
      } else {
        const errorData = await response.json()
        alert(`Erreur: ${errorData.message}`)
      }
    } catch (error) {
      console.error('Erreur lors de la création de l\'utilisateur:', error)
      alert('Erreur lors de la création de l\'utilisateur')
    }
  }

  const handleUpdateUser = async (userId: string) => {
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/auth/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      
      if (response.ok) {
        await loadUsers() // Recharger la liste
        setEditingUser(null)
        resetForm()
      } else {
        const errorData = await response.json()
        alert(`Erreur: ${errorData.message}`)
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'utilisateur:', error)
      alert('Erreur lors de la mise à jour de l\'utilisateur')
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      try {
        const token = localStorage.getItem('auth_token')
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/auth/users/${userId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
        
        if (response.ok) {
          await loadUsers() // Recharger la liste
        } else {
          const errorData = await response.json()
          alert(`Erreur: ${errorData.message}`)
        }
      } catch (error) {
        console.error('Erreur lors de la suppression de l\'utilisateur:', error)
        alert('Erreur lors de la suppression de l\'utilisateur')
      }
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      role: 'creator',
      password: '',
    })
  }

  const openEditForm = (user: User) => {
    setEditingUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      password: '',
    })
  }

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return <Shield className="w-4 h-4" />
      case 'observer':
        return <Eye className="w-4 h-4" />
      case 'creator':
        return <PenTool className="w-4 h-4" />
    }
  }

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800'
      case 'observer':
        return 'bg-blue-100 text-blue-800'
      case 'creator':
        return 'bg-green-100 text-green-800'
    }
  }

  if (!canAccess('canManageUsers')) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Shield className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-medium text-gray-600 mb-2">Accès refusé</h3>
          <p className="text-gray-500">Vous n'avez pas les permissions pour gérer les utilisateurs.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des utilisateurs</h1>
          <p className="text-gray-600 mt-1">Gérez les utilisateurs et leurs permissions</p>
        </div>
        <Button 
          onClick={() => setShowCreateForm(true)}
          className="bg-[#E40046] hover:bg-[#E40046]/80 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouvel utilisateur
        </Button>
      </div>

      {/* Formulaire de création/édition */}
      {(showCreateForm || editingUser) && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingUser ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nom complet</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nom de l'utilisateur"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@simplon.com"
                />
              </div>
              <div>
                <Label htmlFor="role">Rôle</Label>
                <Select value={formData.role} onValueChange={(value: string) => setFormData({ ...formData, role: value as UserRole })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrateur</SelectItem>
                    <SelectItem value="observer">Observateur</SelectItem>
                    <SelectItem value="creator">Créateur</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="password">
                  {editingUser ? 'Nouveau mot de passe (optionnel)' : 'Mot de passe'}
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Mot de passe"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={editingUser ? () => handleUpdateUser(editingUser.id) : handleCreateUser}
                className="bg-[#E40046] hover:bg-[#E40046]/80 text-white"
              >
                {editingUser ? 'Mettre à jour' : 'Créer'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowCreateForm(false)
                  setEditingUser(null)
                  resetForm()
                }}
              >
                Annuler
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Liste des utilisateurs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Utilisateurs ({users.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E40046] mx-auto mb-4"></div>
              <p className="text-gray-500">Chargement des utilisateurs...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#E40046]/10 rounded-full flex items-center justify-center">
                      <UserIcon className="w-5 h-5 text-[#E40046]" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{user.name}</h4>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="w-3 h-3" />
                        <span>{user.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                        <Calendar className="w-3 h-3" />
                        <span>Créé le {user.createdAt.toLocaleDateString('fr-FR')}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Badge className={`${getRoleColor(user.role)} flex items-center gap-1`}>
                      {getRoleIcon(user.role)}
                      {ROLE_LABELS[user.role]}
                    </Badge>
                    
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => openEditForm(user)}
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      {user.id !== currentUser?.id && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                          title="Supprimer"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Informations sur les rôles */}
      <Card>
        <CardHeader>
          <CardTitle>Informations sur les rôles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-red-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-red-600" />
                <h4 className="font-semibold text-red-900">Administrateur</h4>
              </div>
              <p className="text-sm text-red-800">{ROLE_DESCRIPTIONS.admin}</p>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-5 h-5 text-blue-600" />
                <h4 className="font-semibold text-blue-900">Observateur</h4>
              </div>
              <p className="text-sm text-blue-800">{ROLE_DESCRIPTIONS.observer}</p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <PenTool className="w-5 h-5 text-green-600" />
                <h4 className="font-semibold text-green-900">Créateur</h4>
              </div>
              <p className="text-sm text-green-800">{ROLE_DESCRIPTIONS.creator}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
