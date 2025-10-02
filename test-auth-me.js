// Script pour tester spécifiquement l'endpoint /auth/me
// Exécutez ce script dans la console du navigateur

const API_BASE_URL = 'https://back-form-oirj.onrender.com/api'

async function testAuthMe() {
  console.log('🔍 Test spécifique de l\'endpoint /auth/me...')
  
  try {
    // Étape 1: Se connecter pour obtenir un token
    console.log('1️⃣ Connexion pour obtenir un token...')
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
    
    console.log(`Status login: ${loginResponse.status}`)
    console.log(`Content-Type: ${loginResponse.headers.get('content-type')}`)
    
    if (!loginResponse.ok) {
      const errorText = await loginResponse.text()
      console.log('❌ Erreur de connexion:', errorText.substring(0, 200))
      return
    }
    
    const loginData = await loginResponse.json()
    console.log('✅ Token obtenu:', loginData.token ? 'Oui' : 'Non')
    
    // Étape 2: Tester /auth/me avec le token
    console.log('2️⃣ Test de /auth/me avec le token...')
    const meResponse = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${loginData.token}`,
        'Content-Type': 'application/json',
      },
    })
    
    console.log(`Status /auth/me: ${meResponse.status}`)
    console.log(`Content-Type: ${meResponse.headers.get('content-type')}`)
    
    if (meResponse.ok) {
      const userData = await meResponse.json()
      console.log('✅ Endpoint /auth/me fonctionne:', userData)
    } else {
      const errorText = await meResponse.text()
      console.log('❌ Erreur /auth/me:', errorText.substring(0, 200))
    }
    
  } catch (error) {
    console.log('❌ Erreur réseau:', error)
  }
}

// Exécuter le test
testAuthMe()
