"use client"

import { ReportForm } from "@/components/report/report-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function ReportPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Barre d'accent en haut */}
      <div className="h-2 w-full bg-gradient-to-r from-[#E40046] via-[#E40046]/80 to-rose-500"></div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* En-tête */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour à l'accueil
            </Button>
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Signaler un problème
          </h1>
          <p className="text-gray-600">
            Votre retour est précieux pour améliorer notre plateforme
          </p>
        </div>

        {/* Formulaire */}
        <ReportForm
          onSuccess={() => {
            setTimeout(() => {
              router.push("/")
            }, 2000)
          }}
        />

        {/* Informations supplémentaires */}
        <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">
            💡 Conseils pour un bon rapport
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• <strong>Soyez précis</strong> : Décrivez le problème de manière détaillée</li>
            <li>• <strong>Ajoutez une capture d'écran</strong> : Une image vaut mille mots</li>
            <li>• <strong>Indiquez les étapes</strong> : Comment reproduire le problème ?</li>
            <li>• <strong>Mentionnez votre navigateur</strong> : Chrome, Firefox, Safari, etc.</li>
          </ul>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>Propulsé par Simplon Africa</p>
        </div>
      </div>
    </div>
  )
}
