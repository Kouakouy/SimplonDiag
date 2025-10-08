"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { analysisService } from '@/lib/analysis'
import { Brain, CheckCircle, XCircle, Loader2 } from 'lucide-react'

export function DeepSeekStatus() {
  const [status, setStatus] = useState<'checking' | 'connected' | 'error'>('checking')
  const [error, setError] = useState<string>('')

  useEffect(() => {
    checkConnection()
  }, [])

  const checkConnection = async () => {
    setStatus('checking')
    setError('')
    
    try {
      const isConnected = await analysisService.testConnection()
      setStatus(isConnected ? 'connected' : 'error')
      if (!isConnected) {
        setError('Impossible d\'utiliser la fonction IA pour le moment, essayez plus tard')
      }
    } catch (err) {
      setStatus('error')
      const errorMessage = err instanceof Error ? err.message : 'Erreur de connexion'
      
      // Messages d'erreur plus conviviaux
      if (errorMessage.includes('Impossible d\'utiliser la fonction IA')) {
        setError('Impossible d\'utiliser la fonction IA pour le moment, essayez plus tard')
      } else if (errorMessage.includes('API key DeepSeek non configurée')) {
        setError('Service IA non configuré, contactez l\'administrateur')
      } else if (errorMessage.includes('Clé API DeepSeek invalide')) {
        setError('Service IA temporairement indisponible, essayez plus tard')
      } else {
        setError(errorMessage)
      }
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5" />
          Statut DeepSeek
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          {status === 'checking' && (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Vérification...</span>
            </>
          )}
          {status === 'connected' && (
            <>
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-700">Connecté</span>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Prêt
              </Badge>
            </>
          )}
          {status === 'error' && (
            <>
              <XCircle className="w-4 h-4 text-red-500" />
              <span className="text-sm text-red-700">Erreur</span>
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                Hors ligne
              </Badge>
            </>
          )}
        </div>

        {error && (
          <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
            {error}
          </div>
        )}

        <Button 
          variant="outline" 
          size="sm" 
          onClick={checkConnection}
          disabled={status === 'checking'}
        >
          {status === 'checking' ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Vérification...
            </>
          ) : (
            'Vérifier la connexion'
          )}
        </Button>

        <div className="text-xs text-gray-500">
          <p>L'analyse IA nécessite une clé API DeepSeek valide.</p>
          <p>Configurez NEXT_PUBLIC_DEEPSEEK_API_KEY dans votre environnement.</p>
        </div>
      </CardContent>
    </Card>
  )
}
