"use client"

// Page de liste des formulaires
import { useEffect, useState } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { apiRequest } from "@/lib/api"
import { FileText, Plus, Search } from "lucide-react"
import Link from "next/link"

export default function FormsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [forms, setForms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await apiRequest<any[]>({ url: "/forms" })
        setForms(data)
      } catch (e: any) {
        setError(e.message || "Erreur de chargement")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filteredForms = forms.filter(
    (form) =>
      form.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="bg-gray-50 min-h-screen">
      <Sidebar />

      <div className="ml-64 flex flex-col min-h-screen">
        <main className="flex-1 p-6">
          {/* En-tête avec bouton de création */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mes formulaires</h1>
              <p className="text-gray-600 mt-1">Gérez tous vos formulaires</p>
            </div>
            <Link href="/forms/create">
              <Button className="bg-pink-600 hover:bg-pink-700" size="lg">
                <Plus className="w-5 h-5 mr-2" />
                Créer un formulaire
              </Button>
            </Link>
          </div>

          {/* Barre de recherche */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Rechercher des formulaires..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* États de chargement/erreur */}
          {loading ? (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-gray-500">Chargement...</p>
              </CardContent>
            </Card>
          ) : error ? (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-red-600">{error}</p>
              </CardContent>
            </Card>
          ) : filteredForms.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="text-gray-400 mb-4">
                  <FileText className="w-12 h-12 mx-auto mb-2" />
                </div>
                <h4 className="text-lg font-medium text-gray-600 mb-2">
                  {searchTerm ? "Aucun formulaire trouvé" : "Aucun formulaire"}
                </h4>
                <p className="text-gray-500 mb-4">
                  {searchTerm ? "Essayez avec d'autres mots-clés" : "Commencez par créer votre premier formulaire"}
                </p>
                {!searchTerm && (
                  <Link href="/forms/create">
                    <Button className="bg-pink-600 hover:bg-pink-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Créer un formulaire
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredForms.map((form) => (
                <Card key={form._id || form.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-6 h-6 text-pink-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-gray-900">{form.title}</h4>
                          </div>
                          <p className="text-sm text-gray-500 mb-2">{form.description}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-400">
                            {form.created_at ? (
                              <span>Créé le {new Date(form.created_at).toLocaleDateString("fr-FR")}</span>
                            ) : null}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link href={`/forms/${form._id || form.id}`}>
                          <Button variant="outline" size="sm">Voir</Button>
                        </Link>
                        <Link href={`/forms/${form._id || form.id}/responses`}>
                          <Button variant="outline" size="sm">Résultats</Button>
                        </Link>
                        <Link href={`/forms/${form._id || form.id}/edit`}>
                          <Button variant="outline" size="sm">Éditer</Button>
                        </Link>
                      </div>
                    </div>
                    {/* Lien de partage */}
                    <div className="mt-4 text-xs text-gray-600">
                      <span className="mr-1">Lien de partage:</span>
                      <Link
                        href={`/f/${form.public_slug || form._id || form.id}`}
                        target="_blank"
                        className="text-pink-600 hover:underline break-all"
                      >
                        {`/f/${form.public_slug || form._id || form.id}`}
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
