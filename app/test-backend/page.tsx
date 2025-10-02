"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function TestBackendPage() {
  const [results, setResults] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const testBackendConnection = async () => {
    setLoading(true)
    setResults([])
    
    const API_BASE_URL = 'https://back-form-oirj.onrender.com/api'
    
    try {
      addResult('🔍 Test de connexion avec le backend...')
      
      // Test 1: Vérifier que le backend répond
      addResult('1️⃣ Test de l\'endpoint de santé...')
      const healthResponse = await fetch(`${API_BASE_URL}/health`)
      addResult(`Status: ${healthResponse.status}`)
      
      if (healthResponse.ok) {
        const healthData = await healthResponse.json()
        addResult(`✅ Backend accessible: ${JSON.stringify(healthData)}`)
      } else {
        addResult('❌ Backend non accessible')
        return
      }
      
      // Test 2: Test de connexion avec admin@simplon.com
      addResult('2️⃣ Test de connexion avec admin@simplon.com...')
      const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'admin@simplon.com',
          password: 'password123'
        }),
      })
      
      addResult(`Status: ${loginResponse.status}`)
      
      if (loginResponse.ok) {
        const loginData = await loginResponse.json()
        addResult(`✅ Connexion réussie: ${JSON.stringify(loginData)}`)
        
        // Test 3: Test de l'endpoint /auth/me
        if (loginData.token) {
          addResult('3️⃣ Test de l\'endpoint /auth/me...')
          const meResponse = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: {
              'Authorization': `Bearer ${loginData.token}`,
              'Content-Type': 'application/json',
            },
          })
          
          addResult(`Status: ${meResponse.status}`)
          
          if (meResponse.ok) {
            const userData = await meResponse.json()
            addResult(`✅ Informations utilisateur: ${JSON.stringify(userData)}`)
          } else {
            const errorData = await meResponse.json()
            addResult(`❌ Erreur /auth/me: ${JSON.stringify(errorData)}`)
          }
        }
      } else {
        const errorData = await loginResponse.json()
        addResult(`❌ Erreur de connexion: ${JSON.stringify(errorData)}`)
      }
      
    } catch (error) {
      addResult(`❌ Erreur réseau: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const testCreateUser = async () => {
    setLoading(true)
    addResult('👤 Test de création d\'utilisateur...')
    
    const API_BASE_URL = 'https://back-form-oirj.onrender.com/api'
    
    try {
      // D'abord, se connecter en tant qu'admin
      addResult('1️⃣ Connexion en tant qu\'admin...')
      const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'admin@simplon.com',
          password: 'password123'
        }),
      })
      
      if (!loginResponse.ok) {
        addResult('❌ Impossible de se connecter en tant qu\'admin')
        return
      }
      
      const loginData = await loginResponse.json()
      addResult('✅ Connexion admin réussie')
      
      // Maintenant, essayer de créer un utilisateur
      addResult('2️⃣ Création d\'un nouvel utilisateur...')
      const createResponse = await fetch(`${API_BASE_URL}/auth/users`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${loginData.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@simplon.com',
          password: 'password123',
          role: 'creator'
        }),
      })
      
      addResult(`📊 Status création: ${createResponse.status}`)
      
      if (createResponse.ok) {
        const createData = await createResponse.json()
        addResult(`✅ Utilisateur créé avec succès: ${JSON.stringify(createData)}`)
      } else {
        const errorData = await createResponse.json()
        addResult(`❌ Erreur lors de la création: ${JSON.stringify(errorData)}`)
      }
      
    } catch (error) {
      addResult(`❌ Erreur réseau: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Test de connexion Backend</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button 
                onClick={testBackendConnection}
                disabled={loading}
                className="bg-[#E40046] hover:bg-[#E40046]/80 text-white"
              >
                {loading ? 'Test en cours...' : 'Test Connexion Backend'}
              </Button>
              
              <Button 
                onClick={testCreateUser}
                disabled={loading}
                variant="outline"
              >
                {loading ? 'Test en cours...' : 'Test Création Utilisateur'}
              </Button>
            </div>
            
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
              {results.length === 0 ? (
                <div className="text-gray-500">Cliquez sur un bouton pour commencer les tests...</div>
              ) : (
                results.map((result, index) => (
                  <div key={index} className="mb-1">{result}</div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
