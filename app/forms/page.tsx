"use client"

// Page de liste des formulaires
import { useEffect, useState, useMemo } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { apiRequest } from "@/lib/api"
import { FileText, Plus, Search, CheckCircle, Copy, Trash2, Share, Eye, BarChart3, Edit, Trash } from "lucide-react"
import Link from "next/link"

export default function FormsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [forms, setForms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [formToDelete, setFormToDelete] = useState<string | null>(null)
  const [copiedLink, setCopiedLink] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Charger les données en parallèle si possible
        const data = await apiRequest<any[]>({ url: "/forms" })
        
        // Optimiser le rendu en mettant à jour l'état immédiatement
        setForms(data || [])
      } catch (e: any) {
        console.error('Erreur lors du chargement des formulaires:', e)
        setError(e.message || "Erreur de chargement")
        setForms([]) // S'assurer qu'on a un tableau vide en cas d'erreur
      } finally {
        setLoading(false)
      }
    }
    
    // Démarrer le chargement immédiatement
    load()
  }, [])

  // Optimiser le filtrage avec useMemo
  const filteredForms = useMemo(() => {
    if (!searchTerm.trim()) return forms
    
    const term = searchTerm.toLowerCase()
    return forms.filter(
      (form) =>
        form.title?.toLowerCase().includes(term) ||
        form.description?.toLowerCase().includes(term)
    )
  }, [forms, searchTerm])

  // Fonction utilitaire pour générer l'URL de partage
  const getShareUrl = (form: any) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
    return `${baseUrl}/f/${form.public_slug || form._id || form.id}`
  }

  // Ajout de la fonction de copie pour le bouton
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedLink(text)
      // Masquer le message après 2 secondes
      setTimeout(() => setCopiedLink(null), 2000)
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

      <div className="ml-0 lg:ml-64 flex flex-col min-h-screen">
        <main className="flex-1 p-4 lg:p-6">
          {/* En-tête avec bouton de création */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 lg:mb-8 gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Mes formulaires</h1>
              <p className="text-gray-600 mt-1">Gérez tous vos formulaires</p>
            </div>
            <Link href="/forms/create">
              <Button className="bg-[#E40046] hover:bg-[#E40046]/80 text-white w-full sm:w-auto" size="lg">
                <Plus className="w-5 h-5 mr-2" />
                Créer un formulaire
              </Button>
            </Link>
          </div>

          {/* Barre de recherche */}
          <div className="mb-6">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Rechercher des formulaires..."
                className="pl-10 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* États de chargement/erreur */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {/* Skeleton loaders pour simuler le contenu */}
              {Array.from({ length: 8 }).map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <CardContent className="p-6">
                    {/* En-tête skeleton */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <div key={i} className="w-8 h-8 bg-gray-200 rounded"></div>
                        ))}
                      </div>
                    </div>

                    {/* Contenu skeleton */}
                    <div className="space-y-3">
                      <div>
                        <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      </div>

                      <div className="space-y-2">
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-gray-200 rounded-full"></div>
                          <div className="h-3 bg-gray-200 rounded w-12"></div>
                        </div>
                      </div>

                      {/* Lien de partage skeleton */}
                      <div className="bg-gray-100 rounded-lg p-3 mt-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-3 h-3 bg-gray-200 rounded"></div>
                          <div className="h-3 bg-gray-200 rounded w-20"></div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-6 bg-gray-200 rounded"></div>
                          <div className="w-6 h-6 bg-gray-200 rounded"></div>
                        </div>
                      </div>

                      {/* Actions skeleton */}
                      <div className="flex gap-2 pt-2">
                        <div className="flex-1 h-8 bg-gray-200 rounded"></div>
                        <div className="flex-1 h-8 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredForms.map((form) => {
                const shareUrl = getShareUrl(form)
                
                return (
                  <Card key={form._id || form.id} className="hover:shadow-lg transition-all duration-200 hover:scale-105 overflow-hidden group">
                    <CardContent className="p-6">
                      {/* En-tête du formulaire */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 bg-[#E40046]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText className="w-6 h-6 text-[#E40046]" />
                        </div>
                        <div className="flex items-center gap-1">
                          <Link href={`/forms/${form._id || form.id}`}>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-50">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Link href={`/forms/${form._id || form.id}/responses`}>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-green-600 hover:bg-green-50">
                              <BarChart3 className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                            onClick={() => handleDelete(form._id || form.id)}
                            title="Supprimer"
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Contenu principal */}
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-semibold text-gray-900 text-lg mb-1 line-clamp-2">{form.title}</h4>
                          <p className="text-sm text-gray-500 line-clamp-3">{form.description || "Aucune description"}</p>
                        </div>

                        {/* Informations du formulaire */}
                        <div className="space-y-2">
                          {form.created_at && (
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                              <span>Créé le {new Date(form.created_at).toLocaleDateString("fr-FR")}</span>
                            </div>
                          )}
                          
                          {/* Statut du formulaire */}
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-xs text-green-600 font-medium">Actif</span>
                          </div>
                        </div>

                        {/* Lien de partage compact */}
                        <div className="bg-gray-50 rounded-lg p-3 mt-4">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="w-3 h-3 text-green-600" />
                            <span className="text-xs font-medium text-gray-700">Lien public</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              value={shareUrl}
                              readOnly
                              className="flex-1 px-2 py-1 border border-gray-200 rounded text-xs bg-white truncate"
                            />
                            <Button 
                              onClick={() => copyToClipboard(shareUrl)} 
                              size="sm" 
                              variant="ghost"
                              className="h-6 w-6 p-0 text-gray-600 hover:bg-gray-200"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                          {copiedLink === shareUrl && (
                            <div className="mt-1 text-xs text-green-600 font-medium">
                              ✓ Copié !
                            </div>
                          )}
                        </div>

                        {/* Actions principales */}
                        <div className="flex gap-2 pt-2">
                          <Link href={`/forms/${form._id || form.id}/edit`} className="flex-1">
                            <Button variant="outline" size="sm" className="w-full text-xs">
                              <Edit className="w-3 h-3 mr-1" />
                              Éditer
                            </Button>
                          </Link>
                          <Link href={`/forms/${form._id || form.id}/share`} className="flex-1">
                            <Button variant="outline" size="sm" className="w-full text-xs">
                              <Share className="w-3 h-3 mr-1" />
                              Partager
                            </Button>
                          </Link>
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
