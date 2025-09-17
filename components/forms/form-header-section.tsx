"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DatePicker } from "@/components/ui/date-picker"
import { Upload, X, Image as ImageIcon, Link, FolderOpen, Calendar, Users } from "lucide-react"

interface FormHeaderSectionProps {
  title?: string
  description?: string
  bannerTitle?: string
  bannerImageUrl?: string
  maxResponses?: number
  expirationDate?: Date
  onTitleChange: (title: string) => void
  onDescriptionChange: (description: string) => void
  onBannerTitleChange: (title: string) => void
  onBannerImageChange: (imageUrl: string | null) => void
  onMaxResponsesChange: (maxResponses: number | undefined) => void
  onExpirationDateChange: (date: Date | undefined) => void
}

export function FormHeaderSection({
  title,
  description,
  bannerTitle,
  bannerImageUrl,
  maxResponses,
  expirationDate,
  onTitleChange,
  onDescriptionChange,
  onBannerTitleChange,
  onBannerImageChange,
  onMaxResponsesChange,
  onExpirationDateChange
}: FormHeaderSectionProps) {
  const [showImageUpload, setShowImageUpload] = useState(false)
  const [tempImageUrl, setTempImageUrl] = useState("")
  const [imageSource, setImageSource] = useState<'url' | 'gallery'>('url')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>("")


  const handleImageUpload = () => {
    if (imageSource === 'url' && tempImageUrl) {
      onBannerImageChange(tempImageUrl)
      setTempImageUrl("")
      setShowImageUpload(false)
    } else if (imageSource === 'gallery' && previewUrl) {
      onBannerImageChange(previewUrl)
      setSelectedFile(null)
      setPreviewUrl("")
      setShowImageUpload(false)
    }
  }


  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file)
      
      // Créer une URL de prévisualisation
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setPreviewUrl(result)
      }
      reader.readAsDataURL(file)
    }
  }

  const resetModal = () => {
    setShowImageUpload(false)
    setTempImageUrl("")
    setSelectedFile(null)
    setPreviewUrl("")
    setImageSource('url')
  }

  const removeImage = () => {
    onBannerImageChange(null)
  }

  return (
    <Card className="mb-6 overflow-hidden">
      {/* Bannière */}
      <div className="relative">
        <div 
          className={`h-48 flex items-center justify-center relative ${
            bannerImageUrl 
              ? 'bg-cover bg-center' 
              : 'bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500'
          }`}
          style={bannerImageUrl ? { backgroundImage: `url(${bannerImageUrl})` } : {}}
        >
          {/* Overlay pour améliorer la lisibilité */}
          <div className="absolute inset-0 bg-black bg-opacity-30"></div>
          
          {/* Contenu de la bannière */}
          <div className="relative z-10 text-center text-white px-6">
            {bannerTitle ? (
              <h1 className="text-4xl font-bold drop-shadow-lg">{bannerTitle}</h1>
            ) : (
              <div className="text-white/70">
                <ImageIcon className="w-16 h-16 mx-auto mb-4" />
                <p className="text-lg">Votre bannière de formulaire</p>
              </div>
            )}
          </div>

          {/* Boutons d'action */}
          <div className="absolute top-4 right-4 flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              onClick={() => setShowImageUpload(true)}
            >
              <Upload className="w-4 h-4 mr-1" />
              {bannerImageUrl ? 'Changer' : 'Ajouter'} image
            </Button>
            {bannerImageUrl && (
              <Button
                size="sm"
                variant="destructive"
                className="bg-red-500/80 hover:bg-red-600/80"
                onClick={removeImage}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Informations générales */}
      <CardHeader>
        <CardTitle>Configuration du formulaire</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Titre de la bannière et titre du formulaire */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="banner-title" className="text-sm font-medium text-gray-700">
              Titre de la bannière
            </Label>
            <Input
              id="banner-title"
              value={bannerTitle || ""}
              onChange={(e) => onBannerTitleChange(e.target.value)}
              placeholder="Entrez le titre qui apparaîtra sur la bannière"
            />
          </div>
          <div>
            <Label htmlFor="title">Titre du formulaire</Label>
            <Input
              id="title"
              value={title || ""}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="Nouveau formulaire"
            />
          </div>
        </div>
        
        {/* Description */}
        <div>
          <Label htmlFor="description">Description du formulaire</Label>
          <Textarea
            id="description"
            value={description || ""}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Décrivez l'objectif de votre formulaire"
            rows={3}
          />
        </div>

        {/* Nombre de soumissions et date d'expiration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="maxResponses">
              <Users className="w-4 h-4 inline mr-1" />
              Nombre maximum de soumissions
            </Label>
            <Input
              id="maxResponses"
              type="number"
              value={maxResponses || ""}
              onChange={(e) => onMaxResponsesChange(e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder="Illimité"
              min="1"
            />
          </div>
          <div>
            <Label htmlFor="expirationDate">
              <Calendar className="w-4 h-4 inline mr-1" />
              Date d'expiration
            </Label>
            <DatePicker
              value={expirationDate}
              onChange={onExpirationDateChange}
              placeholder="Sélectionner une date d'expiration"
            />
            <p className="text-sm text-gray-500 mt-1">
              Laissez vide pour un formulaire sans date limite
            </p>
          </div>
        </div>
      </CardContent>

      {/* Modal d'upload d'image */}
      {showImageUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[600px] max-w-90vw max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Choisir une image</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetModal}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Sélecteur de source */}
            <div className="flex gap-2 mb-6">
              <Button
                variant={imageSource === 'url' ? 'default' : 'outline'}
                onClick={() => setImageSource('url')}
                className={imageSource === 'url' ? 'bg-[#E40046] hover:bg-pink-700' : ''}
              >
                <Link className="w-4 h-4 mr-2" />
                URL
              </Button>
              <Button
                variant={imageSource === 'gallery' ? 'default' : 'outline'}
                onClick={() => setImageSource('gallery')}
                className={imageSource === 'gallery' ? 'bg-[#E40046] hover:bg-pink-700' : ''}
              >
                <FolderOpen className="w-4 h-4 mr-2" />
                Galerie
              </Button>
            </div>

            {/* Contenu selon la source */}
            {imageSource === 'url' ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="image-url">URL de l'image</Label>
                  <Input
                    id="image-url"
                    value={tempImageUrl}
                    onChange={(e) => setTempImageUrl(e.target.value)}
                    placeholder="https://exemple.com/image.jpg"
                  />
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={resetModal}
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={handleImageUpload}
                    disabled={!tempImageUrl}
                    className="bg-[#E40046] hover:bg-pink-700"
                  >
                    Ajouter
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Zone d'upload de fichier */}
                <div>
                  <Label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-2">
                    Sélectionner une image depuis votre ordinateur
                  </Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <input
                      id="file-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <Label
                      htmlFor="file-upload"
                      className="cursor-pointer flex flex-col items-center space-y-2"
                    >
                      <Upload className="w-8 h-8 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        Cliquez pour sélectionner une image
                      </span>
                      <span className="text-xs text-gray-400">
                        JPG, PNG, GIF jusqu'à 10MB
                      </span>
                    </Label>
                  </div>
                </div>

                {/* Prévisualisation du fichier sélectionné */}
                {selectedFile && previewUrl && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-700">Aperçu :</h4>
                    <div className="relative rounded-lg overflow-hidden border">
                      <img
                        src={previewUrl}
                        alt="Aperçu"
                        className="w-full h-32 object-cover"
                      />
                      <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
                        {selectedFile.name}
                      </div>
                    </div>
                  </div>
                )}

                
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={resetModal}
                  >
                    Annuler
                  </Button>
                  {selectedFile && previewUrl && (
                    <Button
                      onClick={handleImageUpload}
                      className="bg-[#E40046] hover:bg-pink-700"
                    >
                      Utiliser cette image
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  )
}
