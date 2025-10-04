"use client"

// Page de liste des formulaires
import { useEffect, useState, useMemo } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { apiRequest } from "@/lib/api"
import { FileText, Plus, Search, CheckCircle, Copy, Trash2, Share, Eye, BarChart3, Edit, Trash, Grid3X3, List } from "lucide-react"
import { hourglass } from 'ldrs'
import Link from "next/link"
import { useAuth } from "@/lib/contexts/AuthContext"


// Enregistrer le composant hourglass seulement côté client
if (typeof window !== 'undefined') {
  hourglass.register()
}

export default function FormsPage() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [forms, setForms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [formToDelete, setFormToDelete] = useState<string | null>(null)
  const [copiedLink, setCopiedLink] = useState<string | null>(null)
  const [formStats, setFormStats] = useState<Record<string, { submissions: number; views: number }>>({})
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  
  // Vérifier si l'utilisateur est un observateur
  const isObserver = user?.role === 'observer'
  // Vérifier si l'utilisateur est un créateur
  const isCreator = user?.role === 'creator'
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const formsPerPage = viewMode === 'grid' ? 9 : 6 // 3 lignes × 3 colonnes pour grille, 6 pour liste

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Charger les formulaires
        const data = await apiRequest<any[]>({ url: "/forms" })
        setForms(data || [])
        
        // Charger les statistiques pour chaque formulaire
        const statsPromises = (data || []).map(async (form) => {
          try {
            // Charger les réponses pour compter les soumissions
            const responses = await apiRequest<any[]>({ url: `/forms/${form._id || form.id}/responses` })
            const submissionsCount = responses?.length || 0
            
            // Pour les vues, on peut utiliser une estimation basée sur les soumissions
            // ou laisser 0 si pas de données disponibles
            const estimatedViews = submissionsCount > 0 ? Math.max(submissionsCount * 3, 10) : 0
            
            return {
              formId: form._id || form.id,
              stats: {
                submissions: submissionsCount,
                views: estimatedViews
              }
            }
          } catch (error) {
            console.log(`Pas de réponses pour le formulaire ${form._id || form.id}:`, error)
            return {
              formId: form._id || form.id,
              stats: { submissions: 0, views: 0 }
            }
          }
        })
        
        const statsResults = await Promise.all(statsPromises)
        const statsMap = statsResults.reduce((acc, { formId, stats }) => {
          acc[formId] = stats
          return acc
        }, {} as Record<string, { submissions: number; views: number }>)
        
        setFormStats(statsMap)
      } catch (e: any) {
        console.error('Erreur lors du chargement des formulaires:', e)
        setError(e.message || "Erreur de chargement")
        setForms([])
        setFormStats({})
      } finally {
        setLoading(false)
      }
    }
    
    load()
  }, [])

  // Optimiser le filtrage avec useMemo
  const filteredForms = useMemo(() => {
    let filtered = forms
    
    // Si l'utilisateur est un créateur, ne montrer que ses propres formulaires
    if (isCreator && user?.id) {
      filtered = forms.filter(form => form.created_by === user.id)
    }
    
    // Appliquer le filtre de recherche si nécessaire
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (form) =>
          form.title?.toLowerCase().includes(term) ||
          form.description?.toLowerCase().includes(term)
      )
    }
    
    return filtered
  }, [forms, searchTerm, isCreator, user?.id])

  // Pagination
  const totalPages = Math.ceil(filteredForms.length / formsPerPage)
  const startIndex = (currentPage - 1) * formsPerPage
  const endIndex = startIndex + formsPerPage
  const currentForms = filteredForms.slice(startIndex, endIndex)

  // Reset pagination when search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

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
        <main className="flex-1 p-3 sm:p-4 lg:p-6">
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

          {/* Barre de recherche avec boutons de filtre alignés à droite */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Rechercher des formulaires..."
                className="pl-10 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {/* Bouton filtre d'affichage aligné à droite */}
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-1 w-fit">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className={`h-8 px-2 sm:px-3 text-xs sm:text-sm ${viewMode === 'grid' ? 'bg-[#E40046] text-white hover:bg-[#E40046]/80' : 'hover:bg-gray-100'}`}
              >
                <Grid3X3 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                <span className="hidden sm:inline">Grille</span>
                <span className="sm:hidden">Grid</span>
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className={`h-8 px-2 sm:px-3 text-xs sm:text-sm ${viewMode === 'list' ? 'bg-[#E40046] text-white hover:bg-[#E40046]/80' : 'hover:bg-gray-100'}`}
              >
                <List className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                <span className="hidden sm:inline">Liste</span>
                <span className="sm:hidden">List</span>
              </Button>
            </div>
          </div>

          {/* États de chargement/erreur */}
          {loading ? (
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center">
                <div className="mx-auto mb-6 flex justify-center">
                  <l-hourglass
                    size="80"
                    bg-opacity="0.1"
                    speed="1.75"
                    color="#E40046"
                  ></l-hourglass>
                </div>
                <p className="text-gray-600">Patientez un instant, vos formulaires sont en cours de chargement</p>
              </div>
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
            <>
              <div className={viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6" 
                : "space-y-3 sm:space-y-4"
              }>
                {currentForms.map((form) => {
                const shareUrl = getShareUrl(form)
                
                return (
                  <Card key={form._id || form.id} className={`hover:shadow-lg transition-all duration-200 overflow-hidden group ${
                    viewMode === 'list' ? 'hover:scale-[1.01]' : 'hover:scale-[1.02]'
                  }`}>
                    {viewMode === 'grid' ? (
                      <>
                        {/* Bannière du formulaire */}
                        {(form.banner_title || form.banner_image_url) ? (
                          <div className="h-32 relative overflow-hidden">
                            {form.banner_image_url ? (
                              <div 
                                className="w-full h-full bg-cover bg-center"
                                style={{ backgroundImage: `url(${form.banner_image_url})` }}
                              >
                                <div className="absolute inset-0 bg-black/30"></div>
                                {form.banner_title && (
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <h3 className="text-lg font-bold text-white drop-shadow-lg text-center px-4">{form.banner_title}</h3>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="w-full h-full bg-gradient-to-r from-[#E40046] via-[#E40046]/80 to-rose-500 flex items-center justify-center">
                                {form.banner_title && (
                                  <h3 className="text-lg font-bold text-white drop-shadow-lg text-center px-4">{form.banner_title}</h3>
                                )}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="h-24 bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center">
                            <div className="text-center">
                              <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                              <p className="text-sm text-gray-500">Aucune bannière</p>
                            </div>
                          </div>
                        )}
                      </>
                    ) : null}
                    
                    <CardContent className={viewMode === 'list' ? "p-3 sm:p-4" : "p-4 sm:p-6"}>
                      {viewMode === 'list' ? (
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                          {/* Section principale avec icône et texte */}
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#E40046]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                              <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-[#E40046]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 text-base sm:text-lg mb-1 line-clamp-1">{form.title}</h4>
                              <p className="text-sm text-gray-500 line-clamp-1">{form.description || "Aucune description"}</p>
                            </div>
                          </div>
                          
                          {/* Statistiques - responsive */}
                          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span>{formStats[form._id || form.id]?.submissions || 0} réponse{(formStats[form._id || form.id]?.submissions || 0) > 1 ? 's' : ''}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span>{formStats[form._id || form.id]?.views || 0} vue{(formStats[form._id || form.id]?.views || 0) > 1 ? 's' : ''}</span>
                            </div>
                            {form.created_at && (
                              <span className="hidden sm:inline">Créé le {new Date(form.created_at).toLocaleDateString("fr-FR")}</span>
                            )}
                            {form.expiration_date && (
                              <span className="hidden sm:inline">Expire le {new Date(form.expiration_date).toLocaleDateString("fr-FR")}</span>
                            )}
                          </div>
                          
                          {/* Dates sur mobile */}
                          <div className="flex flex-wrap gap-2 text-xs text-gray-500 sm:hidden">
                            {form.created_at && (
                              <span>Créé le {new Date(form.created_at).toLocaleDateString("fr-FR")}</span>
                            )}
                            {form.expiration_date && (
                              <span>Expire le {new Date(form.expiration_date).toLocaleDateString("fr-FR")}</span>
                            )}
                          </div>
                          
                          {/* Actions */}
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {!isObserver && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-blue-600 hover:bg-blue-50" 
                                title="Aperçu"
                                onClick={() => window.open(`/forms/${form._id || form.id}`)}
                              >
                                <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                              </Button>
                            )}
                            <Link href={`/forms/${form._id || form.id}/responses`}>
                              <Button variant="ghost" size="sm" className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-green-600 hover:bg-green-50" title="Résultats">
                                <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4" />
                              </Button>
                            </Link>
                            {!isObserver && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-red-600 hover:bg-red-50"
                                onClick={() => handleDelete(form._id || form.id)}
                                title="Supprimer"
                              >
                                <Trash className="w-3 h-3 sm:w-4 sm:h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3 flex-1">
                            <div className="w-12 h-12 bg-[#E40046]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                              <FileText className="w-6 h-6 text-[#E40046]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 text-lg mb-1 line-clamp-1">{form.title}</h4>
                              <p className="text-sm text-gray-500 line-clamp-2">{form.description || "Aucune description"}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {!isObserver && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-50" 
                                title="Aperçu"
                                onClick={() => window.open(`/forms/${form._id || form.id}`)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            )}
                            <Link href={`/forms/${form._id || form.id}/responses`}>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-green-600 hover:bg-green-50" title="Résultats">
                                <BarChart3 className="w-4 h-4" />
                              </Button>
                            </Link>
                            {!isObserver && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                                onClick={() => handleDelete(form._id || form.id)}
                                title="Supprimer"
                              >
                                <Trash className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      )}

                      {viewMode === 'grid' && (
                        <>
                          {/* Informations et statut */}
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-4 text-xs text-gray-400">
                              {form.created_at && (
                                <span>Créé le {new Date(form.created_at).toLocaleDateString("fr-FR")}</span>
                              )}
                              {form.expiration_date && (
                                <span>Expire le {new Date(form.expiration_date).toLocaleDateString("fr-FR")}</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-xs text-green-600 font-medium">Actif</span>
                            </div>
                          </div>

                          {/* Statistiques */}
                          <div className="flex items-center justify-between mb-4 p-3 bg-blue-50 rounded-lg">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1">
                                <BarChart3 className="w-4 h-4 text-blue-600" />
                                <span className="text-sm font-medium text-blue-900">
                                  {formStats[form._id || form.id]?.submissions || 0} réponse{(formStats[form._id || form.id]?.submissions || 0) > 1 ? 's' : ''}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Eye className="w-4 h-4 text-gray-600" />
                                <span className="text-sm text-gray-700">
                                  {formStats[form._id || form.id]?.views || 0} vue{(formStats[form._id || form.id]?.views || 0) > 1 ? 's' : ''}
                                </span>
                              </div>
                            </div>
                            <div className="text-xs text-gray-500">
                              {formStats[form._id || form.id]?.submissions > 0 
                                ? `${formStats[form._id || form.id]?.submissions} réponse${(formStats[form._id || form.id]?.submissions || 0) > 1 ? 's' : ''} reçue${(formStats[form._id || form.id]?.submissions || 0) > 1 ? 's' : ''}`
                                : 'Aucune réponse'
                              }
                            </div>
                          </div>

                          {/* Lien de partage */}
                          <div className="bg-gray-50 rounded-lg p-3 mb-4">
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
                                ✓ Lien copié dans le presse-papiers !
                              </div>
                            )}
                          </div>

                          {/* Actions principales */}
                          {!isObserver && (
                            <div className="flex gap-2">
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
                          )}
                        </>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center mt-8 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Précédent
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 p-0 ${
                          currentPage === page 
                            ? "bg-[#E40046] text-white hover:bg-[#E40046]/80" 
                            : "hover:bg-gray-100"
                        }`}
                      >
                        {page}
                      </Button>
                    ))}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-1"
                  >
                    Suivant
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Button>
                </div>
              )}

              {/* Informations de pagination */}
              {filteredForms.length > 0 && (
                <div className="text-center mt-4 text-sm text-gray-500">
                  Affichage de {startIndex + 1} à {Math.min(endIndex, filteredForms.length)} sur {filteredForms.length} formulaire{filteredForms.length > 1 ? 's' : ''}
                </div>
              )}
            </>
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
