"use client"

import { useState } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { apiRequest } from "@/lib/api"
import { useAuth } from "@/lib/contexts/AuthContext"
import { Settings, AlertTriangle, CheckCircle, Loader2 } from "lucide-react"

export default function FixFormsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  // Vérifier si l'utilisateur
  if (user?.role !== 'admin') {
    return (
      <div className="bg-gray-50 min-h-screen">
        <Sidebar />
        <div className="ml-0 lg:ml-64 flex flex-col min-h-screen">
          <main className="flex-1 p-6">
            <Card>
              <CardContent className="p-12 text-center">
                <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Accès refusé</h2>
                <p className="text-gray-600">
                  Cette page est réservée aux administrateurs uniquement.
                </p>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    )
  }

  const fixOrphanForms = async () => {
    try {
      setLoading(true)
      setError(null)
      setResult(null)

      const response = await apiRequest({
        url: "/forms/fix-orphans",
        method: "POST"
      })

      setResult(response)
    } catch (e: any) {
      setError(e.message || "Erreur lors de la correction des formulaires")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <Sidebar />

      <div className="ml-0 lg:ml-64 flex flex-col min-h-screen">
        <main className="flex-1 p-6">
          {/* En-tête */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Settings className="w-8 h-8 text-[#E40046]" />
              <h1 className="text-3xl font-bold text-gray-900">Administration</h1>
            </div>
            <p className="text-gray-600">Outils d'administration pour la gestion des formulaires</p>
          </div>

          {/* Carte principale */}
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                Correction des formulaires orphelins
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Description */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Problème identifié</h3>
                <p className="text-blue-800 text-sm">
                  Certains formulaires existants ont un champ <code className="bg-blue-100 px-1 rounded">created_by</code> 
                  défini à <code className="bg-blue-100 px-1 rounded">null</code>, ce qui empêche les créateurs de voir leurs formulaires.
                </p>
              </div>

              {/* Action */}
              <div className="space-y-4">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h3 className="font-semibold text-orange-900 mb-2">Action de correction</h3>
                  <p className="text-orange-800 text-sm mb-3">
                    Cette action va assigner tous les formulaires orphelins (created_by: null) à votre compte administrateur.
                  </p>
                  <ul className="text-orange-800 text-sm space-y-1">
                    <li>• Les formulaires seront visibles dans votre liste</li>
                    <li>• Vous pourrez les réassigner à d'autres utilisateurs si nécessaire</li>
                    <li>• Cette action est réversible</li>
                  </ul>
                </div>

                <Button 
                  onClick={fixOrphanForms}
                  disabled={loading}
                  className="w-full bg-[#E40046] hover:bg-[#E40046]/80 text-white"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Correction en cours...
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Corriger les formulaires orphelins
                    </>
                  )}
                </Button>
              </div>

              {/* Résultats */}
              {result && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <div className="space-y-2">
                      <p className="font-semibold">{result.message}</p>
                      {result.count > 0 && (
                        <div className="text-sm">
                          <p>Formulaires corrigés : {result.count}</p>
                          {result.forms && result.forms.length > 0 && (
                            <div className="mt-2">
                              <p className="font-medium">Formulaires traités :</p>
                              <ul className="list-disc list-inside space-y-1">
                                {result.forms.map((form: any, index: number) => (
                                  <li key={index} className="text-xs">
                                    {form.title} (ID: {form.id})
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Erreur */}
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {/* Instructions supplémentaires */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Instructions</h3>
                <ol className="text-gray-700 text-sm space-y-1 list-decimal list-inside">
                  <li>Cliquez sur le bouton "Corriger les formulaires orphelins"</li>
                  <li>Attendez la confirmation que les formulaires ont été corrigés</li>
                  <li>Vérifiez que les créateurs peuvent maintenant voir leurs formulaires</li>
                  <li>Si nécessaire, réassignez les formulaires aux bons créateurs via l'interface d'administration</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
