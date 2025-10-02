// Script pour vérifier si le backend en ligne a été mis à jour
// Exécutez ce script dans la console du navigateur

const API_BASE_URL = 'https://back-form-oirj.onrender.com/api'

async function checkDeployment() {
  console.log('🔍 Vérification du déploiement...')
  
  try {
    // Test 1: Endpoint de santé
    console.log('1️⃣ Test endpoint de santé...')
    const healthResponse = await fetch(`${API_BASE_URL}/health`)
    console.log(`Status: ${healthResponse.status}`)
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json()
      console.log('✅ Backend accessible:', healthData)
    }
    
    // Test 2: Endpoint de connexion
    console.log('2️⃣ Test endpoint de connexion...')
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
    console.log(`Content-Type: ${loginResponse.headers.get('content-type')}`)
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json()
      console.log('✅ Connexion réussie:', loginData)
    } else {
      const errorText = await loginResponse.text()
      console.log('❌ Erreur:', errorText.substring(0, 200))
    }
    
  } catch (error) {
    console.log('❌ Erreur réseau:', error)
  }
}

checkDeployment()
