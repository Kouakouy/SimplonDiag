"use client"

// Page de création de nouveaux formulaires
import { useState } from "react"
import { useRouter } from "next/navigation"
import { apiRequest } from "@/lib/api"
import type { Form, Question } from "@/types/form"
import { Sidebar } from "@/components/layout/sidebar"
import dynamic from "next/dynamic"
const FormHeaderSection = dynamic(() => import("@/components/forms/form-header-section").then(m => m.FormHeaderSection), { ssr: false })
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Save, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function CreateFormPage() {
  const router = useRouter()
  const [form, setForm] = useState<Partial<Form>>({
    title: "",
    description: "",
    bannerTitle: "",
    bannerImageUrl: "",
    questions: [],
    isPublic: true,
    maxResponses: undefined,
    expirationDate: undefined,
  })

  // Fonction pour compresser les images base64
  const compressBase64Image = (base64: string, maxWidth = 800, quality = 0.8): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      img.onload = () => {
        // Calculer les nouvelles dimensions
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height)
        canvas.width = img.width * ratio
        canvas.height = img.height * ratio
        
        // Dessiner l'image redimensionnée
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height)
        
        // Convertir en base64 avec compression
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality)
        resolve(compressedBase64)
      }
      
      img.src = base64
    })
  }

  // Sauvegarder la configuration du formulaire
  const saveFormConfiguration = async () => {
    if (!form.title || form.title.trim().length === 0) {
      alert('Veuillez saisir un titre pour votre formulaire')
      return
    }
    
    const isValidUrl = (u?: string) => {
      if (!u) return false
      // Accepter les URLs normales ET les images base64
      if (u.startsWith('data:')) return true
      try { new URL(u); return true } catch { return false }
    }
    
    // Traiter l'image banner
    let bannerImageUrl = undefined
    if (form.bannerImageUrl && form.bannerImageUrl.startsWith('data:')) {
      try {
        console.log('Compression de l\'image base64...')
        bannerImageUrl = await compressBase64Image(form.bannerImageUrl)
        console.log(`Image compressée: ${bannerImageUrl.length} caractères`)
      } catch (error) {
        console.error('Erreur lors de la compression:', error)
        bannerImageUrl = undefined
      }
    } else {
      bannerImageUrl = isValidUrl(form.bannerImageUrl) ? form.bannerImageUrl : undefined
    }
    
    const payload = {
      title: form.title || "",
      description: form.description || "",
      is_public: form.isPublic ?? true,
      questions: [],
      max_responses: form.maxResponses,
      expiration_date: form.expirationDate ? form.expirationDate.toISOString() : undefined,
      banner_title: form.bannerTitle || undefined,
      banner_image_url: bannerImageUrl,
    }
    
    // Vérifier la taille des données
    const dataSize = JSON.stringify(payload).length
    console.log(`Taille des données: ${dataSize} caractères`)
    
    if (dataSize > 1000000) { // 1MB
      alert('Les données sont trop volumineuses. Veuillez réduire la taille de l\'image.')
      return
    }
    
    // Log pour debug
    console.log('Données à envoyer pour création:', payload)
    
    try {
      const resp = await apiRequest<{ id: string }>({ url: "/forms", method: "POST", body: payload })
      const newId = resp.id
      router.push(`/forms/${newId}/questions`)
    } catch (e: any) {
      console.error('Erreur détaillée lors de la création:', e)
      // Afficher l'erreur détaillée renvoyée par lib/api.ts
      alert(`Erreur lors de la création: ${e.message}`)
    }
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <Sidebar />

      <div className="ml-0 lg:ml-64 flex flex-col min-h-screen">
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {/* En-tête */}
          <div className="mb-6 lg:mb-8">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Créer un formulaire</h1>
            <p className="text-gray-600 mt-1">Concevez votre formulaire personnalisé</p>
          </div>
          <div className="max-w-4xl mx-auto">
            {/* Actions en haut */}
            <div className="mb-6">
              <Link href="/forms">
                <Button variant="outline" className="w-full sm:w-auto">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour aux formulaires
                </Button>
              </Link>
            </div>

            {/* Configuration du formulaire avec bannière */}
            <FormHeaderSection
              title={form.title}
              description={form.description}
              bannerTitle={form.bannerTitle}
              bannerImageUrl={form.bannerImageUrl}
              maxResponses={form.maxResponses}
              expirationDate={form.expirationDate}
              onTitleChange={(title) => setForm({ ...form, title })}
              onDescriptionChange={(description) => setForm({ ...form, description })}
              onBannerTitleChange={(bannerTitle) => setForm({ ...form, bannerTitle })}
              onBannerImageChange={(bannerImageUrl) => setForm({ ...form, bannerImageUrl: bannerImageUrl || undefined })}
              onMaxResponsesChange={(maxResponses) => setForm({ ...form, maxResponses })}
              onExpirationDateChange={(expirationDate) => setForm({ ...form, expirationDate })}
            />

            {/* Bouton d'enregistrement en bas */}
            <div className="text-center">
              <Button onClick={saveFormConfiguration} size="lg" className="bg-[#E40046] hover:bg-[#E40046]/80 text-white w-full sm:w-auto">
                <Save className="w-4 h-4 mr-2" />
                Enregistrer et continuer
              </Button>
              <p className="text-xs lg:text-sm text-gray-500 mt-2">
                Vous pourrez ajouter des questions à l'étape suivante
              </p>
            </div>
          </div>
        </main>
      </div>

    </div>
  )
}
