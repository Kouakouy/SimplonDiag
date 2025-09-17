"use client"

// Page de statistiques spécifiques à un formulaire
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import type { Form, FormResponse } from "@/types/form"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { apiRequest } from "@/lib/api"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { FormStatsCharts } from "@/components/forms/form-stats-charts"

export default function FormStatsPage() {
  const params = useParams()
  const formId = params.id as string
  const [form, setForm] = useState<Form | null>(null)
  const [loading, setLoading] = useState(true)
  const [responses, setResponses] = useState<FormResponse[]>([])
  const [serverStats, setServerStats] = useState<{ views: number; submissions: number; completionRate: number } | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const f = await apiRequest<any>({ url: `/forms/${formId}` })
        const adaptedForm: Form = {
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
        setForm(adaptedForm)

        // Charger réponses pour les métriques
        const resp = await apiRequest<any[]>({ url: `/forms/${formId}/responses` })
        const adaptedResponses: FormResponse[] = (resp || []).map((r: any) => ({
          id: r._id || r.id,
          formId: adaptedForm.id,
          respondentName: r.respondent_name || "",
          respondentEmail: r.respondent_email || "",
          answers: r.answers || {},
          submittedAt: r.submitted_at ? new Date(r.submitted_at) : new Date(),
        }))
        setResponses(adaptedResponses)

        // Stats backend si dispo
        try {
          const stats = await apiRequest<any>({ url: `/forms/${formId}/stats` })
          if (stats) setServerStats({
            views: stats.views ?? 0,
            submissions: stats.submissions ?? adaptedResponses.length,
            completionRate: stats.completionRate ?? 0,
          })
        } catch {
          // ignore
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [formId])

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E40046] mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des statistiques...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Statistiques: {form.title}</h1>
              <p className="text-gray-600 mt-1">Analysez les performances de ce formulaire</p>
            </div>
          </div>
          <div className="max-w-7xl mx-auto">
            {/* Actions en haut */}
            <div className="flex items-center justify-between mb-6">
              <Link href={`/forms/${form.id}/responses`}>
                <Button variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour aux réponses
                </Button>
              </Link>

              <div className="flex items-center gap-2">
              </div>
            </div>

            {/* Composant de statistiques avec données réelles */}
            <FormStatsCharts form={form} responses={responses} serverStats={serverStats} />
          </div>
        </main>
      </div>
    </div>
  )
}