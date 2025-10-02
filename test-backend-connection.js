// Script de diagnostic pour tester la communication avec le backend
// Exécutez ce script dans la console du navigateur

const API_BASE_URL = 'https://back-form-oirj.onrender.com/api'

async function testBackendConnection() {
  console.log('🔍 Test de connexion avec le backend...')
  
  try {
    // Test 1: Vérifier que le backend répond
    console.log('1️⃣ Test de l\'endpoint de santé...')
    const healthResponse = await fetch(`${API_BASE_URL}/health`)
    console.log(`Status: ${healthResponse.status}`)
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json()
      console.log('✅ Backend accessible:', healthData)
    } else {
      console.log('❌ Backend non accessible')
      return
    }
    
    // Test 2: Test de connexion avec admin@simplon.com
    console.log('2️⃣ Test de connexion avec admin@simplon.com...')
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
    
    console.log(`Status: ${loginResponse.status}`)
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json()
      console.log('✅ Connexion réussie:', loginData)
      
      // Test 3: Test de l'endpoint /auth/me
      if (loginData.token) {
        console.log('3️⃣ Test de l\'endpoint /auth/me...')
        const meResponse = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${loginData.token}`,
            'Content-Type': 'application/json',
          },
        })
        
        console.log(`Status: ${meResponse.status}`)
        
        if (meResponse.ok) {
          const userData = await meResponse.json()
          console.log('✅ Informations utilisateur:', userData)
        } else {
          const errorData = await meResponse.json()
          console.log('❌ Erreur /auth/me:', errorData)
        }
      }
    } else {
      const errorData = await loginResponse.json()
      console.log('❌ Erreur de connexion:', errorData)
    }
    
  } catch (error) {
    console.log('❌ Erreur réseau:', error)
  }
}

// Exécuter le test
testBackendConnection()
