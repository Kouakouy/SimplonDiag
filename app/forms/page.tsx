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
            <div className="grid gap-4">
              {/* Skeleton loaders pour simuler le contenu */}
              {Array.from({ length: 3 }).map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <div className="p-4">
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-16 bg-gray-200 rounded"></div>
                      ))}
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div key={i} className="w-16 h-8 bg-gray-200 rounded"></div>
                        ))}
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="bg-gray-100 rounded-lg p-4">
                        <div className="h-3 bg-gray-200 rounded w-1/4 mb-2"></div>
                        <div className="h-8 bg-gray-200 rounded"></div>
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
            <div className="grid gap-4">
              {filteredForms.map((form) => {
                const shareUrl = getShareUrl(form)
                
                return (
                  <Card key={form._id || form.id} className="hover:shadow-md transition-shadow overflow-hidden">
                    {/* Bannière du formulaire en grille */}
                    {(form.banner_title || form.banner_image_url) ? (
                      <div className="p-4">
                        <div className="grid grid-cols-3 gap-2">
                          {/* Afficher 3-4 miniatures de la bannière */}
                          {Array.from({ length: 3 }).map((_, index) => (
                            <div 
                              key={index}
                              className={`h-16 relative overflow-hidden rounded ${form.banner_image_url ? 'bg-cover bg-center' : 'bg-gradient-to-r from-[#E40046] via-[#E40046]/80 to-rose-500'}`}
                              style={form.banner_image_url ? { backgroundImage: `url(${form.banner_image_url})` } : {}}
                            >
                              <div className="absolute inset-0 bg-black/20"></div>
                              {form.banner_title && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <h3 className="text-xs font-bold text-white drop-shadow-lg text-center px-1">{form.banner_title}</h3>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="p-4">
                        <div className="grid grid-cols-3 gap-2">
                          {Array.from({ length: 3 }).map((_, index) => (
                            <div key={index} className="h-16 bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center rounded">
                              <div className="text-center">
                                <FileText className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                                <p className="text-xs text-gray-500">Aucune bannière</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <CardContent className="p-4 lg:p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-12 h-12 bg-[#E40046]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FileText className="w-6 h-6 text-[#E40046]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-gray-900 truncate">{form.title}</h4>
                            </div>
                            <p className="text-sm text-gray-500 mb-2 line-clamp-2">{form.description}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-400">
                              {form.created_at ? (
                                <span>Créé le {new Date(form.created_at).toLocaleDateString("fr-FR")}</span>
                              ) : null}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-1 lg:gap-2">
                          <Link href={`/forms/${form._id || form.id}`}>
                            <Button variant="outline" size="sm" className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300 text-xs lg:text-sm">
                              <Eye className="w-3 h-3 lg:w-4 lg:h-4 mr-1" />
                              <span className="hidden sm:inline">Aperçu</span>
                            </Button>
                          </Link>
                          <Link href={`/forms/${form._id || form.id}/responses`}>
                            <Button variant="outline" size="sm" className="text-green-600 border-green-200 hover:bg-green-50 hover:border-green-300 text-xs lg:text-sm">
                              <BarChart3 className="w-3 h-3 lg:w-4 lg:h-4 mr-1" />
                              <span className="hidden sm:inline">Résultats</span>
                            </Button>
                          </Link>
                          <Link href={`/forms/${form._id || form.id}/share`}>
                            <Button variant="outline" size="sm" className="text-purple-600 border-purple-200 hover:bg-purple-50 hover:border-purple-300 text-xs lg:text-sm">
                              <Share className="w-3 h-3 lg:w-4 lg:h-4 mr-1" />
                              <span className="hidden sm:inline">Partager</span>
                            </Button>
                          </Link>
                          <Link href={`/forms/${form._id || form.id}/edit`}>
                            <Button variant="outline" size="sm" className="text-orange-600 border-orange-200 hover:bg-orange-50 hover:border-orange-300 text-xs lg:text-sm">
                              <Edit className="w-3 h-3 lg:w-4 lg:h-4 mr-1" />
                              <span className="hidden sm:inline">Éditer</span>
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 text-xs lg:text-sm"
                            onClick={() => handleDelete(form._id || form.id)}
                            title="Supprimer le formulaire"
                          >
                            <Trash className="w-3 h-3 lg:w-4 lg:h-4 mr-1" />
                            <span className="hidden sm:inline">Supprimer</span>
                          </Button>
                        </div>
                      </div>
                      {/* Lien de partage */}
                      <div className="mt-4">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 lg:p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium text-green-800">Lien public actif</span>
                          </div>
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                            <input
                              value={shareUrl}
                              readOnly
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-white text-xs lg:text-sm"
                            />
                            <Button onClick={() => copyToClipboard(shareUrl)} size="sm" className="w-full sm:w-auto">
                              <Copy className="w-3 h-3 lg:w-4 lg:h-4 mr-1" />
                              <span className="text-xs lg:text-sm">Copier</span>
                            </Button>
                          </div>
                          {copiedLink === shareUrl && (
                            <div className="mt-2 text-xs lg:text-sm text-green-600 font-medium">
                              ✓ Lien copié dans le presse-papiers !
                            </div>
                          )}
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
