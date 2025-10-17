"use client"

// Page de partage de formulaire
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import type { Form } from "@/types/form"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { apiRequest } from "@/lib/api"
import { ArrowLeft, Share, Copy, Mail, LinkIcon, CheckCircle, X, Send, Plus } from "lucide-react"
import Link from "next/link"
import { hourglass } from 'ldrs'
import { useAuth } from "@/lib/contexts/AuthContext"
import { usePermissions } from "@/lib/hooks/usePermissions"

// Enregistrer le composant hourglass
hourglass.register()

export default function ShareFormPage() {
  const params = useParams()
  const formId = params.id as string
  const { user } = useAuth()
  const { canAccess } = usePermissions({ user })
  const [form, setForm] = useState<Form | null>(null)
  const [loading, setLoading] = useState(true)
  const [shareSettings, setShareSettings] = useState({
    expirationDate: "",
    maxResponses: "",
    requireAuth: false,
    allowAnonymous: true,
  })
  const [emailRecipients, setEmailRecipients] = useState<string[]>([])
  const [emailInput, setEmailInput] = useState("")
  const [emailSubject, setEmailSubject] = useState("")
  const [emailMessage, setEmailMessage] = useState("")
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [isSendingEmail, setIsSendingEmail] = useState(false)

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

  const addEmailRecipient = () => {
    if (emailInput.trim() && !emailRecipients.includes(emailInput.trim())) {
      setEmailRecipients([...emailRecipients, emailInput.trim()])
      setEmailInput("")
    }
  }

  const removeEmailRecipient = (email: string) => {
    setEmailRecipients(emailRecipients.filter(e => e !== email))
  }

  const handleEmailKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addEmailRecipient()
    }
  }

  const sendShareEmail = async () => {
    const typedEmail = emailInput.trim()
    const recipients = Array.from(new Set([
      ...emailRecipients,
      ...(typedEmail ? [typedEmail] : [])
    ]))

    if (recipients.length === 0) return
    
    setIsSendingEmail(true)
    try {
      // Utiliser le template backend: n'envoyer que 'to'
      await Promise.all(
        recipients.map((to) =>
          apiRequest({
            url: `/forms/${formId}/share`,
            method: 'POST',
            body: { 
              to,
              subject: emailSubject || `Formulaire: ${form?.title}`,
              message: emailMessage || `Bonjour,\n\nJe vous invite à répondre à ce formulaire : ${form?.title}\n\nLien : ${shareUrl}\n\nCordialement`
            },
          })
        )
      )
      alert(`Email(s) envoyé(s) avec succès (${recipients.length}).`)
      setShowEmailModal(false)
      setEmailRecipients([])
      setEmailSubject("")
      setEmailMessage("")
      setEmailInput("")
    } catch (e: any) {
      alert(`Erreur: ${e.message || 'envoi impossible'}`)
    } finally {
      setIsSendingEmail(false)
    }
  }

  const shareOnSocialMedia = (platform: string) => {
    const encodedUrl = encodeURIComponent(shareUrl)
    const encodedTitle = encodeURIComponent(form?.title || '')
    const encodedDescription = encodeURIComponent(form?.description || '')
    
    let socialShareUrl = ''
    
    switch (platform) {
      case 'facebook':
        socialShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
        break
      case 'twitter':
        socialShareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`
        break
      case 'linkedin':
        socialShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
        break
      case 'whatsapp':
        socialShareUrl = `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`
        break
      case 'telegram':
        socialShareUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`
        break
      default:
        return
    }
    
    window.open(socialShareUrl, '_blank', 'width=600,height=400')
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
            <div className="mx-auto mb-4 flex justify-center">
              <l-hourglass
                size="60"
                bg-opacity="0.1"
                speed="1.75"
                color="#E40046"
              ></l-hourglass>
            </div>
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

      <div className="ml-0 lg:ml-64 flex flex-col min-h-screen">
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {/* En-tête */}
          <div className="mb-6 lg:mb-8">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">Partager: {form.title}</h1>
            <p className="text-gray-600 mt-1">Partagez votre formulaire avec vos utilisateurs</p>
          </div>
          <div className="max-w-4xl mx-auto">
            {/* Actions en haut */}
            <div className="mb-6">
              {canAccess('canShareForms') && (
                <Link href={`/forms/${formId}/questions`}>
                  <Button variant="outline" className="w-full sm:w-auto">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Retour aux questions
                  </Button>
                </Link>
              )}

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">{form.title}</span>
              </div>
            </div>

            {/* Titre */}
            <div className="mb-6">
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Partager le formulaire</h2>
            </div>

            {/* Contenu de partage */}
            <div className="space-y-4 lg:space-y-6">
                <Card>
                  <CardHeader className="p-4 lg:p-6">
                    <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                      <LinkIcon className="w-4 h-4 lg:w-5 lg:h-5" />
                      Générer un lien de partage
                    </CardTitle>
                    <p className="text-xs lg:text-sm text-gray-600">Créez un lien sécurisé pour partager votre formulaire</p>
                  </CardHeader>
                  <CardContent className="space-y-4 p-4 lg:p-6">
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
                      </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="p-4 lg:p-6">
                    <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                      <Mail className="w-4 h-4 lg:w-5 lg:h-5" />
                      Partager par email
                    </CardTitle>
                    <p className="text-xs lg:text-sm text-gray-600">Envoyez le formulaire à une ou plusieurs personnes par email</p>
                  </CardHeader>
                  <CardContent className="space-y-4 p-4 lg:p-6">
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      onClick={() => setShowEmailModal(true)}
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Envoyer par email
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="p-4 lg:p-6">
                    <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                      <Share className="w-4 h-4 lg:w-5 lg:h-5" />
                      Partager sur les réseaux sociaux
                    </CardTitle>
                    <p className="text-xs lg:text-sm text-gray-600">Partagez votre formulaire sur vos réseaux sociaux préférés</p>
                  </CardHeader>
                  <CardContent className="space-y-4 p-4 lg:p-6">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 lg:gap-3">
                      <Button 
                        variant="outline" 
                        className="flex flex-col items-center gap-1 lg:gap-2 h-16 lg:h-20"
                        onClick={() => shareOnSocialMedia('facebook')}
                      >
                        <div className="w-5 h-5 lg:w-6 lg:h-6 bg-blue-600 rounded text-white flex items-center justify-center text-xs font-bold">f</div>
                        <span className="text-xs">Facebook</span>
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="flex flex-col items-center gap-1 lg:gap-2 h-16 lg:h-20"
                        onClick={() => shareOnSocialMedia('twitter')}
                      >
                        <div className="w-5 h-5 lg:w-6 lg:h-6 bg-sky-500 rounded text-white flex items-center justify-center text-xs font-bold">𝕏</div>
                        <span className="text-xs">Twitter</span>
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="flex flex-col items-center gap-1 lg:gap-2 h-16 lg:h-20"
                        onClick={() => shareOnSocialMedia('linkedin')}
                      >
                        <div className="w-5 h-5 lg:w-6 lg:h-6 bg-blue-700 rounded text-white flex items-center justify-center text-xs font-bold">in</div>
                        <span className="text-xs">LinkedIn</span>
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="flex flex-col items-center gap-1 lg:gap-2 h-16 lg:h-20"
                        onClick={() => shareOnSocialMedia('whatsapp')}
                      >
                        <div className="w-5 h-5 lg:w-6 lg:h-6 bg-green-500 rounded text-white flex items-center justify-center text-xs font-bold">W</div>
                        <span className="text-xs">WhatsApp</span>
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="flex flex-col items-center gap-1 lg:gap-2 h-16 lg:h-20"
                        onClick={() => shareOnSocialMedia('telegram')}
                      >
                        <div className="w-5 h-5 lg:w-6 lg:h-6 bg-blue-500 rounded text-white flex items-center justify-center text-xs font-bold">T</div>
                        <span className="text-xs">Telegram</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                    </div>
          </div>
        </main>
      </div>

      {/* Modal d'envoi d'email */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Envoyer par email
                </h3>
                <Button variant="outline" onClick={() => setShowEmailModal(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                {/* Destinataires */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Destinataires
                  </label>
                  <div className="border border-gray-300 rounded-md p-2 min-h-[40px] flex flex-wrap gap-2">
                    {emailRecipients.map((email, index) => (
                      <div key={index} className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                        <span>{email}</span>
                        <button
                          onClick={() => removeEmailRecipient(email)}
                          className="hover:bg-blue-200 rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      onKeyPress={handleEmailKeyPress}
                      placeholder="Ajouter un email..."
                      className="flex-1 min-w-[200px] border-none outline-none text-sm"
                    />
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Button size="sm" onClick={addEmailRecipient} disabled={!emailInput.trim()}>
                      <Plus className="w-4 h-4 mr-1" />
                      Ajouter
                    </Button>
                    <span className="text-xs text-gray-500">
                      Appuyez sur Entrée ou virgule pour ajouter
                    </span>
                  </div>
                </div>

                {/* Sujet */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sujet
                  </label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder={`Formulaire: ${form?.title}`}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    value={emailMessage}
                    onChange={(e) => setEmailMessage(e.target.value)}
                    placeholder="Bonjour,

Je vous invite à répondre à ce formulaire : [Titre du formulaire]

Lien : [Lien du formulaire]

Cordialement"
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none"
                  />
                </div>

                {/* Aperçu du lien */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <p className="text-sm text-gray-600 mb-1">Lien qui sera inclus :</p>
                  <p className="text-sm font-mono text-blue-600 break-all">{shareUrl}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t">
                  <Button variant="outline" onClick={() => setShowEmailModal(false)}>
                    Annuler
                  </Button>
                  <Button 
                    onClick={sendShareEmail} 
                    disabled={(emailRecipients.length === 0 && emailInput.trim().length === 0) || isSendingEmail}
                    className="bg-[#E40046] hover:bg-[#E40046]/80 text-white"
                  >
                    {isSendingEmail ? (
                      <>
                        <span className="mr-2">
                          <l-hourglass size="16" bg-opacity="0.1" speed="1.75" color="white"></l-hourglass>
                        </span>
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Envoyer ({emailRecipients.length} destinataire{emailRecipients.length > 1 ? 's' : ''})
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}