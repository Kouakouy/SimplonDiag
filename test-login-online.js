// Script pour tester la connexion avec le backend en ligne
// Exécutez ce script dans la console du navigateur

const API_BASE_URL = 'https://back-form-oirj.onrender.com/api'

// Test de connexion
async function testLogin(email, password) {
  try {
    console.log(`🔐 Test de connexion pour ${email}...`)
    
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })
    
    console.log(`📊 Status: ${response.status}`)
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ Connexion réussie!', data)
      
      // Tester l'endpoint /auth/me
      if (data.token) {
        console.log('🔍 Test de l\'endpoint /auth/me...')
        const meResponse = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${data.token}`,
            'Content-Type': 'application/json',
          },
        })
        
        console.log(`📊 Status /auth/me: ${meResponse.status}`)
        
        if (meResponse.ok) {
          const userData = await meResponse.json()
          console.log('✅ Informations utilisateur:', userData)
        } else {
          console.log('❌ Endpoint /auth/me non disponible')
        }
      }
    } else {
      const error = await response.json()
      console.log('❌ Erreur de connexion:', error)
    }
  } catch (error) {
    console.log('❌ Erreur réseau:', error)
  }
}

// Tester avec les comptes de démonstration
console.log('🚀 Test des connexions...')

// Test avec admin@simplon.com
testLogin('admin@simplon.com', 'password123')

// Attendre un peu puis tester avec observer
setTimeout(() => {
  testLogin('observer@simplon.com', 'password123')
}, 2000)

// Attendre un peu puis tester avec creator
setTimeout(() => {
  testLogin('creator@simplon.com', 'password123')
}, 4000)
