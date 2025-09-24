"use client"

// Page de liste des formulaires
import { useEffect, useState } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { apiRequest } from "@/lib/api"
import { FileText, Plus, Search, CheckCircle, Copy, Trash2, Share } from "lucide-react"
import Link from "next/link"

export default function FormsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [forms, setForms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [formToDelete, setFormToDelete] = useState<string | null>(null)

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

  // Ajout de la fonction de copie pour le bouton
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      // TODO: Afficher une notification de succès si besoin
    } catch (err) {
      console.error('Erreur lors de la copie:', err)
    }
  }

  // Ajout de la fonction de suppression
  const handleDelete = async (formId: string) => {
    setFormToDelete(formId)
    setShowDeleteModal(true)
  }
  const confirmDelete = async () => {
    if (!formToDelete) return
    try {
      await apiRequest({ url: `/forms/${formToDelete}`, method: "DELETE" })
      setForms((prev) => prev.filter((f) => f._id !== formToDelete && f.id !== formToDelete))
    } catch (err) {
      alert("Erreur lors de la suppression du formulaire.")
    } finally {
      setShowDeleteModal(false)
      setFormToDelete(null)
    }
  }

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
              <Button className="bg-[#E40046] hover:bg-[#E40046]/80 text-white" size="lg">
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
                    <Button className="bg-[#E40046] hover:bg-[#E40046]/80 text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Créer un formulaire
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredForms.map((form) => {
                const shareUrl = typeof window !== 'undefined'
                  ? `${window.location.origin}/f/${form.public_slug || form._id || form.id}`
                  : `/f/${form.public_slug || form._id || form.id}`;
                return (
                  <Card key={form._id || form.id} className="hover:shadow-md transition-shadow overflow-hidden">
                    {/* Bannière du formulaire */}
                    {(form.banner_title || form.banner_image_url) ? (
                      <div 
                        className={`h-32 relative overflow-hidden ${form.banner_image_url ? 'bg-cover bg-center' : 'bg-gradient-to-r from-[#E40046] via-[#E40046]/80 to-rose-500'}`}
                        style={form.banner_image_url ? { backgroundImage: `url(${form.banner_image_url})` } : {}}
                      >
                        <div className="absolute inset-0 bg-black/30"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          {form.banner_title && (
                            <h3 className="text-xl font-bold text-white drop-shadow-lg text-center px-4">{form.banner_title}</h3>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="h-20 bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center">
                        <div className="text-center">
                          <FileText className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                          <p className="text-sm text-gray-500">Aucune bannière</p>
                        </div>
                      </div>
                    )}
                    
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-12 h-12 bg-[#E40046]/10 rounded-lg flex items-center justify-center">
                            <FileText className="w-6 h-6 text-[#E40046]" />
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
                          <Link href={`/forms/${form._id || form.id}/share`}>
                            <Button variant="outline" size="sm">
                              <Share className="w-4 h-4 mr-1" />
                              Partager
                            </Button>
                          </Link>
                          <Link href={`/forms/${form._id || form.id}/edit`}>
                            <Button variant="outline" size="sm">Éditer</Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-[#E40046] text-[#E40046] hover:bg-[#E40046]/10 hover:text-white hover:border-[#E40046]"
                            onClick={() => handleDelete(form._id || form.id)}
                            title="Supprimer le formulaire"
                          >
                            <Trash2 className="w-4 h-4 mr-1" /> Supprimer
                          </Button>
                        </div>
                      </div>
                      {/* Lien de partage */}
                      <div className="mt-4">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium text-green-800">Lien public actif</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              value={shareUrl}
                              readOnly
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
                            />
                            <Button onClick={() => copyToClipboard(shareUrl)} size="sm">
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </main>
      </div>
      {/* Modale de suppression */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Supprimer le formulaire</h3>
            <p className="text-gray-600 mb-6">Voulez-vous vraiment supprimer ce formulaire ? Cette action est irréversible.</p>
            <div className="flex items-center justify-end gap-3">
              <Button variant="outline" onClick={() => setShowDeleteModal(false)}>Annuler</Button>
              <Button onClick={confirmDelete} className="bg-[#E40046] text-white hover:bg-[#E40046]/80">Supprimer</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
