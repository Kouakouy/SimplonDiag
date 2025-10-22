"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { apiRequest } from "@/lib/api"
import { useAuth } from "@/lib/contexts/AuthContext"
import { Sidebar } from "@/components/layout/sidebar"
import { 
  Database, 
  User, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  RefreshCw,
  Trash2,
  Edit
} from "lucide-react"

interface FormData {
  _id: string
  title: string
  created_by: string | null
  user_id: string | null
  created_at: string
  is_public: boolean
}

export default function TestFormsPage() {
  const { user } = useAuth()
  const [forms, setForms] = useState<FormData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [stats, setStats] = useState({
    total: 0,
    withCreatedBy: 0,
    withoutCreatedBy: 0,
    public: 0,
    private: 0
  })

  const loadForms = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Charger tous les formulaires (sans filtre backend)
      const data = await apiRequest<any[]>({ url: "/forms" })
      setForms(data || [])
      
      // Calculer les statistiques
      const total = data?.length || 0
      const withCreatedBy = data?.filter(f => f.created_by)?.length || 0
      const withoutCreatedBy = total - withCreatedBy
      const publicForms = data?.filter(f => f.is_public)?.length || 0
      const privateForms = total - publicForms
      
      setStats({
        total,
        withCreatedBy,
        withoutCreatedBy,
        public: publicForms,
        private: privateForms
      })
      
    } catch (e: any) {
      setError(e.message || "Erreur lors du chargement")
    } finally {
      setLoading(false)
    }
  }

  const createTestForm = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const testForm = {
        title: `Test Formulaire ${new Date().toLocaleString()}`,
        description: "Formulaire de test pour vérifier created_by",
        is_public: true,
        questions: []
      }
      
      const result = await apiRequest({ 
        url: "/forms", 
        method: "POST", 
        body: testForm 
      })
      
      setSuccess(`Formulaire créé avec ID: ${result.id}`)
      await loadForms() // Recharger la liste
      
    } catch (e: any) {
      setError(e.message || "Erreur lors de la création")
    } finally {
      setLoading(false)
    }
  }

  const fixForm = async (formId: string) => {
    try {
      setLoading(true)
      setError(null)
      
      // Mettre à jour le formulaire avec l'ID de l'utilisateur actuel
      await apiRequest({ 
        url: `/forms/${formId}`, 
        method: "PUT", 
        body: { 
          created_by: user?.id,
          user_id: user?.id 
        } 
      })
      
      setSuccess(`Formulaire ${formId} corrigé avec created_by: ${user?.id}`)
      await loadForms() // Recharger la liste
      
    } catch (e: any) {
      setError(e.message || "Erreur lors de la correction")
    } finally {
      setLoading(false)
    }
  }

  const deleteForm = async (formId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce formulaire ?")) return
    
    try {
      setLoading(true)
      setError(null)
      
      await apiRequest({ 
        url: `/forms/${formId}`, 
        method: "DELETE" 
      })
      
      setSuccess(`Formulaire ${formId} supprimé`)
      await loadForms() // Recharger la liste
      
    } catch (e: any) {
      setError(e.message || "Erreur lors de la suppression")
    } finally {
      setLoading(false)
    }
  }

  const fixAllForms = async () => {
    if (!confirm("Corriger tous les formulaires sans created_by ?")) return
    
    try {
      setLoading(true)
      setError(null)
      
      const formsToFix = forms.filter(f => !f.created_by)
      let fixedCount = 0
      
      for (const form of formsToFix) {
        try {
          await apiRequest({ 
            url: `/forms/${form._id}`, 
            method: "PUT", 
            body: { 
              created_by: user?.id,
              user_id: user?.id 
            } 
          })
          fixedCount++
        } catch (e) {
        
        }
      }
      
      setSuccess(`${fixedCount} formulaires corrigés sur ${formsToFix.length}`)
      await loadForms() // Recharger la liste
      
    } catch (e: any) {
      setError(e.message || "Erreur lors de la correction en masse")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadForms()
  }, [])

  return (
    <div className="bg-gray-50 min-h-screen">
      <Sidebar />
      <div className="ml-0 lg:ml-64 flex flex-col min-h-screen">
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Test des Formulaires</h1>
              <p className="text-gray-600">Page de diagnostic et correction des formulaires</p>
            </div>

            {/* Informations utilisateur */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Informations Utilisateur
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">ID</label>
                    <p className="text-lg font-mono">{user?.id || "Non connecté"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="text-lg">{user?.email || "Non connecté"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Rôle</label>
                    <Badge variant={user?.role === 'admin' ? 'default' : 'secondary'}>
                      {user?.role || "Non connecté"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Statistiques */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Statistiques des Formulaires
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                    <div className="text-sm text-gray-500">Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{stats.withCreatedBy}</div>
                    <div className="text-sm text-gray-500">Avec created_by</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{stats.withoutCreatedBy}</div>
                    <div className="text-sm text-gray-500">Sans created_by</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats.public}</div>
                    <div className="text-sm text-gray-500">Publics</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-600">{stats.private}</div>
                    <div className="text-sm text-gray-500">Privés</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  <Button onClick={loadForms} disabled={loading}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Recharger
                  </Button>
                  <Button onClick={createTestForm} disabled={loading}>
                    <FileText className="w-4 h-4 mr-2" />
                    Créer Test
                  </Button>
                  {stats.withoutCreatedBy > 0 && (
                    <Button onClick={fixAllForms} disabled={loading} variant="outline">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Corriger Tous ({stats.withoutCreatedBy})
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Messages */}
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {success && (
              <Alert className="mb-6">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            {/* Liste des formulaires */}
            <Card>
              <CardHeader>
                <CardTitle>Liste des Formulaires</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
                    <p>Chargement...</p>
                  </div>
                ) : forms.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-4" />
                    <p>Aucun formulaire trouvé</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {forms.map((form) => (
                      <div key={form._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold">{form.title}</h3>
                            <Badge variant={form.is_public ? "default" : "secondary"}>
                              {form.is_public ? "Public" : "Privé"}
                            </Badge>
                            {form.created_by ? (
                              <Badge variant="outline" className="text-green-600">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                OK
                              </Badge>
                            ) : (
                              <Badge variant="destructive">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                Problème
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-gray-500 space-y-1">
                            <div>ID: <code className="bg-gray-100 px-1 rounded">{form._id}</code></div>
                            <div>created_by: <code className="bg-gray-100 px-1 rounded">{form.created_by || "NULL"}</code></div>
                            <div>user_id: <code className="bg-gray-100 px-1 rounded">{form.user_id || "NULL"}</code></div>
                            <div>Créé le: {new Date(form.created_at).toLocaleString()}</div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {!form.created_by && (
                            <Button 
                              size="sm" 
                              onClick={() => fixForm(form._id)}
                              disabled={loading}
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Corriger
                            </Button>
                          )}
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => deleteForm(form._id)}
                            disabled={loading}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Supprimer
                          </Button>
                        </div>
                      </div>
                    ))}
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
