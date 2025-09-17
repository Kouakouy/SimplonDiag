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

  // Sauvegarder la configuration du formulaire
  const saveFormConfiguration = async () => {
    if (!form.title || form.title.trim().length === 0) {
      alert('Veuillez saisir un titre pour votre formulaire')
      return
    }
    const isValidUrl = (u?: string) => {
      if (!u) return false
      try { new URL(u); return true } catch { return false }
    }
    const payload = {
      title: form.title || "",
      description: form.description || "",
      is_public: form.isPublic ?? true,
      questions: [],
      max_responses: form.maxResponses,
      expiration_date: form.expirationDate ? form.expirationDate.toISOString() : undefined,
      banner_title: form.bannerTitle || undefined,
      banner_image_url: isValidUrl(form.bannerImageUrl) ? form.bannerImageUrl : undefined,
    }
    try {
      const resp = await apiRequest<{ id: string }>({ url: "/forms", method: "POST", body: payload })
      const newId = resp.id
      router.push(`/forms/${newId}/questions`)
    } catch (e: any) {
      // Afficher l'erreur détaillée renvoyée par lib/api.ts
      alert(`Erreur lors de la création: ${e.message}`)
    }
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <Sidebar />

      <div className="ml-64 flex flex-col min-h-screen">
        <main className="flex-1 p-6 overflow-y-auto">
          {/* En-tête */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Créer un formulaire</h1>
              <p className="text-gray-600 mt-1">Concevez votre formulaire personnalisé</p>
            </div>
          </div>
          <div className="max-w-4xl mx-auto">
            {/* Actions en haut */}
            <div className="flex items-center justify-between mb-6">
              <Link href="/forms">
                <Button variant="outline">
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
              <Button onClick={saveFormConfiguration} size="lg" className="bg-[#E40046] hover:bg-pink-700">
                <Save className="w-4 h-4 mr-2" />
                Enregistrer et continuer
              </Button>
              <p className="text-sm text-gray-500 mt-2">
                Vous pourrez ajouter des questions à l'étape suivante
              </p>
            </div>
          </div>
        </main>
      </div>

    </div>
  )
}
