"use client"

// Page de partage de formulaire
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import type { Form } from "@/types/form"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { apiRequest } from "@/lib/api"
import { ArrowLeft, Share, Copy, Mail, LinkIcon, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function ShareFormPage() {
  const params = useParams()
  const formId = params.id as string
  const [form, setForm] = useState<Form | null>(null)
  const [loading, setLoading] = useState(true)
  const [shareSettings, setShareSettings] = useState({
    expirationDate: "",
    maxResponses: "",
    requireAuth: false,
    allowAnonymous: true,
  })

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const f = await apiRequest<any>({ url: `/forms/${formId}` })
        const adapted: Form = {
          id: f._id || f.id || formId,
          title: f.title || "",
          description: f.description || "",
          bannerTitle: undefined,
          bannerImageUrl: undefined,
          questions: [],
          isPublic: f.is_public ?? true,
          expirationDate: undefined,
          maxResponses: undefined,
          createdAt: f.created_at ? new Date(f.created_at) : new Date(),
          updatedAt: f.updated_at ? new Date(f.updated_at) : new Date(),
          responses: [],
        }
        setForm(adapted)
        setShareSettings((s) => ({ ...s }))
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [formId])

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/f/${formId}` : ''

  const sendShareEmail = async () => {
    const email = prompt('Adresse email du destinataire:')
    if (!email) return
    try {
      await apiRequest({ url: `/forms/${formId}/share`, method: 'POST', body: { to: email } })
      alert('Lien envoyé avec succès.')
    } catch (e: any) {
      alert(`Erreur: ${e.message || 'envoi impossible'}`)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      // TODO: Afficher une notification de succès
    } catch (err) {
      console.error('Erreur lors de la copie:', err)
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Chargement...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!form) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Formulaire non trouvé</p>
            <Link href="/forms">
              <Button>Retour aux formulaires</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <Sidebar />

      <div className="ml-64 flex flex-col min-h-screen">
        <main className="flex-1 p-6 overflow-y-auto">
          {/* En-tête */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Partager: {form.title}</h1>
              <p className="text-gray-600 mt-1">Partagez votre formulaire avec vos utilisateurs</p>
            </div>
          </div>
          <div className="max-w-4xl mx-auto">
            {/* Actions en haut */}
            <div className="flex items-center justify-between mb-6">
              <Link href={`/forms/${formId}/questions`}>
                <Button variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour aux questions
                </Button>
              </Link>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">{form.title}</span>
              </div>
            </div>

            {/* Titre */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Partager le formulaire</h2>
            </div>

            {/* Contenu de partage */}
            <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <LinkIcon className="w-5 h-5" />
                      Générer un lien de partage
                    </CardTitle>
                    <p className="text-sm text-gray-600">Créez un lien sécurisé pour partager votre formulaire</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
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
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Options de partage</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Button variant="outline" className="flex-1" onClick={sendShareEmail}>
                      <Mail className="w-4 h-4 mr-2" />
                      Envoyer par email
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Share className="w-4 h-4 mr-2" />
                      Partager sur les réseaux sociaux
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                    </div>
          </div>
        </main>
      </div>
    </div>
  )
}