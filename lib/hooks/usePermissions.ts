"use client"

import { useMemo } from 'react'
import type { User, UserRole, UserPermissions } from '@/types/user'
import { ROLE_PERMISSIONS } from '@/types/user'

interface UsePermissionsProps {
  user: User | null
}

export function usePermissions({ user }: UsePermissionsProps) {
  const permissions = useMemo((): UserPermissions => {
    if (!user) {
      return {
        canCreateForms: false,
        canEditForms: false,
        canDeleteForms: false,
        canViewAllForms: false,
        canManageUsers: false,
        canShareForms: false,
        canViewResponses: false,
        canExportData: false,
      }
    }

    return ROLE_PERMISSIONS[user.role]
  }, [user])

  const canAccess = (permission: keyof UserPermissions): boolean => {
    return permissions[permission]
  }

  const canManageForm = (formCreatorId: string): boolean => {
    if (!user) return false
    
    // Admin peut gérer tous les formulaires
    if (user.role === 'admin') return true
    
    // Creator peut gérer seulement ses formulaires
    if (user.role === 'creator') return user.id === formCreatorId
    
    // Observer ne peut gérer aucun formulaire
    return false
  }

  const canViewForm = (formCreatorId: string): boolean => {
    if (!user) return false
    
    // Admin et Observer peuvent voir tous les formulaires
    if (user.role === 'admin' || user.role === 'observer') return true
    
    // Creator peut voir seulement ses formulaires
    if (user.role === 'creator') return user.id === formCreatorId
    
    return false
  }

  return {
    permissions,
    canAccess,
    canManageForm,
    canViewForm,
    userRole: user?.role || null,
    isAdmin: user?.role === 'admin',
    isObserver: user?.role === 'observer',
    isCreator: user?.role === 'creator',
  }
}
