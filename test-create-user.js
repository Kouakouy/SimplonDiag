// Script pour tester la création d'utilisateur
// Exécutez ce script dans la console du navigateur

const API_BASE_URL = 'https://back-form-oirj.onrender.com/api'

async function testCreateUser() {
  console.log('👤 Test de création d\'utilisateur...')
  
  try {
    // D'abord, se connecter en tant qu'admin
    console.log('1️⃣ Connexion en tant qu\'admin...')
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
      console.log('❌ Impossible de se connecter en tant qu\'admin')
      return
    }
    
    const loginData = await loginResponse.json()
    console.log('✅ Connexion admin réussie')
    
    // Maintenant, essayer de créer un utilisateur
    console.log('2️⃣ Création d\'un nouvel utilisateur...')
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
    
    console.log(`📊 Status création: ${createResponse.status}`)
    
    if (createResponse.ok) {
      const createData = await createResponse.json()
      console.log('✅ Utilisateur créé avec succès:', createData)
    } else {
      const errorData = await createResponse.json()
      console.log('❌ Erreur lors de la création:', errorData)
    }
    
  } catch (error) {
    console.log('❌ Erreur réseau:', error)
  }
}

// Exécuter le test
testCreateUser()
