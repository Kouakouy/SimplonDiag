export type UserRole = 'admin' | 'observer' | 'creator'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  createdAt: Date
  updatedAt: Date
  isActive: boolean
}

export interface UserPermissions {
  canCreateForms: boolean
  canEditForms: boolean
  canDeleteForms: boolean
  canViewAllForms: boolean
  canManageUsers: boolean
  canShareForms: boolean
  canViewResponses: boolean
  canExportData: boolean
}

export const ROLE_PERMISSIONS: Record<UserRole, UserPermissions> = {
  admin: {
    canCreateForms: true,
    canEditForms: true,
    canDeleteForms: true,
    canViewAllForms: true,
    canManageUsers: true,
    canShareForms: true,
    canViewResponses: true,
    canExportData: true,
  },
  observer: {
    canCreateForms: false,
    canEditForms: false,
    canDeleteForms: false,
    canViewAllForms: true,
    canManageUsers: false,
    canShareForms: false,
    canViewResponses: true,
    canExportData: false,
  },
  creator: {
    canCreateForms: true,
    canEditForms: true,
    canDeleteForms: false,
    canViewAllForms: false,
    canManageUsers: false,
    canShareForms: true,
    canViewResponses: true,
    canExportData: true,
  },
}

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrateur',
  observer: 'Observateur',
  creator: 'Créateur',
}

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  admin: 'Accès complet à toutes les fonctionnalités et gestion des utilisateurs',
  observer: 'Peut voir tous les formulaires et réponses mais ne peut pas les modifier',
  creator: 'Peut créer et gérer ses propres formulaires uniquement',
}
