"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react"

interface TestResult {
  name: string
  status: 'success' | 'error' | 'warning' | 'pending'
  message: string
  details?: any
}

export default function BackendTestPage() {
  const [results, setResults] = useState<TestResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [backendUrl, setBackendUrl] = useState('https://back-form-oirj.onrender.com')
  const [testCredentials, setTestCredentials] = useState({
    email: 'admin@simplon.co',
    password: 'admin123'
  })

  const addResult = (result: TestResult) => {
    setResults(prev => [...prev, result])
  }

  const clearResults = () => {
    setResults([])
  }

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />
      case 'warning': return <AlertCircle className="w-4 h-4 text-yellow-500" />
      case 'pending': return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
    }
  }

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return 'bg-green-50 border-green-200'
      case 'error': return 'bg-red-50 border-red-200'
      case 'warning': return 'bg-yellow-50 border-yellow-200'
      case 'pending': return 'bg-blue-50 border-blue-200'
    }
  }

  // Test 1: Santé du serveur
  const testServerHealth = async () => {
    addResult({ name: 'Santé du serveur', status: 'pending', message: 'Test en cours...' })
    
    try {
      const response = await fetch(`${backendUrl}/api/health`)
      const data = await response.text()
      
      if (response.ok) {
        addResult({
          name: 'Santé du serveur',
          status: 'success',
          message: 'Serveur accessible',
          details: { status: response.status, data }
        })
      } else {
        addResult({
          name: 'Santé du serveur',
          status: 'error',
          message: `Erreur ${response.status}`,
          details: { status: response.status, data }
        })
      }
    } catch (error: any) {
      addResult({
        name: 'Santé du serveur',
        status: 'error',
        message: 'Serveur inaccessible',
        details: { error: error.message }
      })
    }
  }

  // Test 2: Configuration CORS
  const testCORS = async () => {
    addResult({ name: 'Configuration CORS', status: 'pending', message: 'Test en cours...' })
    
    try {
      const response = await fetch(`${backendUrl}/api/auth/login`, {
        method: 'OPTIONS',
        headers: {
          'Origin': 'https://simplondiag.co',
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type, Authorization'
        }
      })
      
      const corsHeaders = {
        'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
        'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
        'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers'),
        'Access-Control-Allow-Credentials': response.headers.get('Access-Control-Allow-Credentials')
      }
      
      if (response.status === 200 && corsHeaders['Access-Control-Allow-Origin']) {
        addResult({
          name: 'Configuration CORS',
          status: 'success',
          message: 'CORS configuré correctement',
          details: corsHeaders
        })
      } else {
        addResult({
          name: 'Configuration CORS',
          status: 'warning',
          message: 'CORS partiellement configuré',
          details: { status: response.status, headers: corsHeaders }
        })
      }
    } catch (error: any) {
      addResult({
        name: 'Configuration CORS',
        status: 'error',
        message: 'Erreur CORS',
        details: { error: error.message }
      })
    }
  }

  // Test 3: Connexion
  const testLogin = async () => {
    addResult({ name: 'Test de connexion', status: 'pending', message: 'Test en cours...' })
    
    try {
      const response = await fetch(`${backendUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'https://simplondiag.co'
        },
        body: JSON.stringify(testCredentials)
      })
      
      const data = await response.json()
      
      if (response.ok && data.token) {
        addResult({
          name: 'Test de connexion',
          status: 'success',
          message: 'Connexion réussie',
          details: { token: data.token.substring(0, 20) + '...' }
        })
        return data.token
      } else {
        addResult({
          name: 'Test de connexion',
          status: 'error',
          message: data.message || 'Échec de la connexion',
          details: { status: response.status, data }
        })
        return null
      }
    } catch (error: any) {
      addResult({
        name: 'Test de connexion',
        status: 'error',
        message: 'Erreur de connexion',
        details: { error: error.message }
      })
      return null
    }
  }

  // Test 4: Informations utilisateur
  const testUserInfo = async (token: string) => {
    addResult({ name: 'Informations utilisateur', status: 'pending', message: 'Test en cours...' })
    
    try {
      const response = await fetch(`${backendUrl}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Origin': 'https://simplondiag.co'
        }
      })
      
      const data = await response.json()
      
      if (response.ok) {
        addResult({
          name: 'Informations utilisateur',
          status: 'success',
          message: 'Informations récupérées',
          details: data
        })
      } else {
        addResult({
          name: 'Informations utilisateur',
          status: 'error',
          message: data.message || 'Échec de récupération',
          details: { status: response.status, data }
        })
      }
    } catch (error: any) {
      addResult({
        name: 'Informations utilisateur',
        status: 'error',
        message: 'Erreur de récupération',
        details: { error: error.message }
      })
    }
  }

  // Test 5: Liste des utilisateurs (admin)
  const testUsersList = async (token: string) => {
    addResult({ name: 'Liste des utilisateurs', status: 'pending', message: 'Test en cours...' })
    
    try {
      const response = await fetch(`${backendUrl}/api/auth/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Origin': 'https://simplondiag.co'
        }
      })
      
      const data = await response.json()
      
      if (response.ok) {
        addResult({
          name: 'Liste des utilisateurs',
          status: 'success',
          message: `${data.length} utilisateurs trouvés`,
          details: data
        })
      } else {
        addResult({
          name: 'Liste des utilisateurs',
          status: 'error',
          message: data.message || 'Échec de récupération',
          details: { status: response.status, data }
        })
      }
    } catch (error: any) {
      addResult({
        name: 'Liste des utilisateurs',
        status: 'error',
        message: 'Erreur de récupération',
        details: { error: error.message }
      })
    }
  }

  // Test complet
  const runAllTests = async () => {
    setIsLoading(true)
    clearResults()
    
    // Test 1: Santé du serveur
    await testServerHealth()
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Test 2: CORS
    await testCORS()
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Test 3: Connexion
    const token = await testLogin()
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    if (token) {
      // Test 4: Informations utilisateur
      await testUserInfo(token)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Test 5: Liste des utilisateurs
      await testUsersList(token)
    }
    
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* En-tête */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🧪 Test du Backend d'Authentification
          </h1>
          <p className="text-gray-600">
            Vérification des fonctionnalités du backend Simplon Form
          </p>
        </div>

        {/* Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="backend-url">URL du Backend</Label>
              <Input
                id="backend-url"
                value={backendUrl}
                onChange={(e) => setBackendUrl(e.target.value)}
                placeholder="https://back-form-oirj.onrender.com"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="test-email">Email de test</Label>
                <Input
                  id="test-email"
                  value={testCredentials.email}
                  onChange={(e) => setTestCredentials(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="admin@simplon.co"
                />
              </div>
              <div>
                <Label htmlFor="test-password">Mot de passe</Label>
                <Input
                  id="test-password"
                  type="password"
                  value={testCredentials.password}
                  onChange={(e) => setTestCredentials(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="admin123"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Boutons de test */}
        <Card>
          <CardHeader>
            <CardTitle>Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button onClick={runAllTests} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
                {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                🚀 Tests Complets
              </Button>
              
              <Button onClick={testServerHealth} variant="outline" disabled={isLoading}>
                🏥 Santé du Serveur
              </Button>
              
              <Button onClick={testCORS} variant="outline" disabled={isLoading}>
                🌐 Test CORS
              </Button>
              
              <Button onClick={testLogin} variant="outline" disabled={isLoading}>
                🔐 Test Connexion
              </Button>
              
              <Button onClick={clearResults} variant="outline" disabled={isLoading}>
                🗑️ Effacer Résultats
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Résultats */}
        {results.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📊 Résultats des Tests
                <Badge variant="outline">{results.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${getStatusColor(result.status)}`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(result.status)}
                      <h3 className="font-semibold">{result.name}</h3>
                      <Badge variant={result.status === 'success' ? 'default' : 'destructive'}>
                        {result.status}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-2">{result.message}</p>
                    
                    {result.details && (
                      <details className="text-xs">
                        <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                          Voir les détails
                        </summary>
                        <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto">
                          {JSON.stringify(result.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>📋 Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-gray-600">
              <p><strong>1. Santé du serveur :</strong> Vérifie que le backend répond aux requêtes</p>
              <p><strong>2. Configuration CORS :</strong> Teste les headers CORS pour les requêtes cross-origin</p>
              <p><strong>3. Test de connexion :</strong> Vérifie l'authentification avec les identifiants fournis</p>
              <p><strong>4. Informations utilisateur :</strong> Teste la récupération des données utilisateur</p>
              <p><strong>5. Liste des utilisateurs :</strong> Vérifie l'accès aux fonctionnalités admin</p>
            </div>
            
          
            
            <div className="text-sm text-gray-600">
              <p><strong>🔧 En cas d'erreur :</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Vérifiez que l'URL du backend est correcte</li>
                <li>Assurez-vous que les identifiants de test sont valides</li>
                <li>Consultez les logs du serveur backend</li>
                <li>Vérifiez la configuration CORS</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}