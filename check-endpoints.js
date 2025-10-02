// Script pour vérifier les endpoints disponibles sur le backend en ligne
// Exécutez ce script dans la console du navigateur

const API_BASE_URL = 'https://back-form-oirj.onrender.com/api'

async function checkEndpoints() {
  console.log('🔍 Vérification des endpoints disponibles...')
  
  const endpoints = [
    '/health',
    '/auth/login',
    '/auth/register', 
    '/auth/me',
    '/auth/users',
    '/forms',
    '/public'
  ]
  
  for (const endpoint of endpoints) {
    try {
      console.log(`\n📍 Test de ${endpoint}...`)
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      console.log(`   Status: ${response.status}`)
      console.log(`   Content-Type: ${response.headers.get('content-type')}`)
      
      if (response.status === 404) {
        console.log(`   ❌ Endpoint non trouvé`)
      } else if (response.status === 405) {
        console.log(`   ⚠️ Méthode non autorisée (endpoint existe mais pas GET)`)
      } else if (response.status === 200) {
        console.log(`   ✅ Endpoint accessible`)
      } else {
        console.log(`   ⚠️ Status inattendu`)
      }
      
    } catch (error) {
      console.log(`   ❌ Erreur: ${error.message}`)
    }
  }
}

// Exécuter la vérification
checkEndpoints()
