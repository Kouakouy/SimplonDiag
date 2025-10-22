"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, Upload, X, Bug, Info, HelpCircle, Lightbulb } from "lucide-react"
import { apiRequest } from "@/lib/api"

const REPORT_TYPES = [
  { value: "bug", label: "🐛 Bug / Erreur", icon: Bug, description: "Signaler un problème technique" },
  { value: "feature", label: "💡 Suggestion", icon: Lightbulb, description: "Proposer une amélioration" },
  { value: "question", label: "❓ Question", icon: HelpCircle, description: "Poser une question" },
  { value: "info", label: "ℹ️ Information", icon: Info, description: "Partager une information" },
]

interface ReportFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export function ReportForm({ onSuccess, onCancel }: ReportFormProps) {
  const [reportType, setReportType] = useState<string>("")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [email, setEmail] = useState("")
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Vérifier la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("L'image ne doit pas dépasser 5 Mo")
        return
      }

      // Vérifier le type
      if (!file.type.startsWith("image/")) {
        setError("Veuillez sélectionner une image valide")
        return
      }

      setImage(file)
      setError(null)

      // Créer une prévisualisation
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImage(null)
    setImagePreview(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (!reportType) {
      setError("Veuillez sélectionner un type de rapport")
      return
    }

    if (!subject.trim()) {
      setError("Veuillez saisir un sujet")
      return
    }

    if (!message.trim()) {
      setError("Veuillez saisir un message")
      return
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Veuillez saisir une adresse email valide")
      return
    }

    setSubmitting(true)

    try {
      // Préparer les données
      const reportData: any = {
        type: reportType,
        subject,
        message,
        email: email || undefined,
      }

      // Ajouter l'image en base64 si elle existe
      if (imagePreview) {
        reportData.imageData = imagePreview
        reportData.imageName = image?.name
      }

      // Envoyer le rapport
      await apiRequest({
        url: "/reports",
        method: "POST",
        body: reportData,
      })

      setSuccess(true)
      
      // Réinitialiser le formulaire après 2 secondes
      setTimeout(() => {
        setReportType("")
        setSubject("")
        setMessage("")
        setEmail("")
        setImage(null)
        setImagePreview(null)
        setSuccess(false)
        onSuccess?.()
      }, 2000)
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue lors de l'envoi du rapport")
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-12 text-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-2xl font-semibold text-gray-900 mb-2">Merci !</h3>
          <p className="text-gray-600">
            Votre rapport a été envoyé avec succès. Nous vous répondrons dans les plus brefs délais.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Signaler un problème</CardTitle>
        <CardDescription>
          Aidez-nous à améliorer la plateforme en signalant des bugs, en suggérant des améliorations ou en posant des questions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Type de rapport */}
          <div className="space-y-3">
            <Label>Type de rapport *</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {REPORT_TYPES.map((type) => {
                const Icon = type.icon
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setReportType(type.value)}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      reportType === type.value
                        ? "border-[#E40046] bg-[#E40046]/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className={`w-5 h-5 mt-0.5 ${reportType === type.value ? "text-[#E40046]" : "text-gray-400"}`} />
                      <div>
                        <div className="font-medium text-gray-900">{type.label}</div>
                        <div className="text-sm text-gray-500">{type.description}</div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Sujet */}
          <div className="space-y-2">
            <Label htmlFor="subject">Sujet *</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Résumé du problème ou de la suggestion"
              maxLength={200}
              required
            />
            <p className="text-xs text-gray-500">{subject.length}/200 caractères</p>
          </div>

          {/* Email (optionnel) */}
          <div className="space-y-2">
            <Label htmlFor="email">Email (optionnel)</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
            />
            <p className="text-xs text-gray-500">
              Pour recevoir une réponse à votre rapport
            </p>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Description détaillée *</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Décrivez le problème en détail, les étapes pour le reproduire, ou votre suggestion..."
              rows={6}
              maxLength={2000}
              required
            />
            <p className="text-xs text-gray-500">{message.length}/2000 caractères</p>
          </div>

          {/* Upload d'image */}
          <div className="space-y-2">
            <Label htmlFor="image">Capture d'écran (optionnel)</Label>
            {!imagePreview ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-1">
                  Glissez-déposez une image ou cliquez pour sélectionner
                </p>
                <p className="text-xs text-gray-500">PNG, JPG, GIF jusqu'à 5 Mo</p>
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <label
                  htmlFor="image"
                  className="inline-block mt-3 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg cursor-pointer transition-colors"
                >
                  Choisir une image
                </label>
              </div>
            ) : (
              <div className="relative border-2 border-gray-200 rounded-lg p-4">
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                <img
                  src={imagePreview}
                  alt="Aperçu"
                  className="max-h-64 mx-auto rounded"
                />
                <p className="text-sm text-gray-600 text-center mt-2">
                  {image?.name}
                </p>
              </div>
            )}
          </div>

          {/* Message d'erreur */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Boutons */}
          <div className="flex items-center gap-3 pt-4">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={submitting}
              >
                Annuler
              </Button>
            )}
            <Button
              type="submit"
              disabled={submitting}
              className="bg-[#E40046] hover:bg-[#E40046]/80 text-white flex-1"
            >
              {submitting ? "Envoi en cours..." : "Envoyer le rapport"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
