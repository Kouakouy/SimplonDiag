// Script pour créer les utilisateurs de démonstration sur le backend en ligne
// Exécutez ce script dans la console du navigateur ou via Postman

const API_BASE_URL = 'https://back-form-oirj.onrender.com/api'

const demoUsers = [
  {
    name: 'Admin Simplon',
    email: 'admin@simplon.com',
    password: 'password123',
    role: 'admin'
  },
  {
    name: 'Observateur Simplon',
    email: 'observer@simplon.com', 
    password: 'password123',
    role: 'observer'
  },
  {
    name: 'Créateur Simplon',
    email: 'creator@simplon.com',
    password: 'password123', 
    role: 'creator'
  }
]

// Fonction pour créer un utilisateur
async function createUser(userData) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    })
    
    if (response.ok) {
      console.log(`✅ Utilisateur créé : ${userData.email}`)
    } else {
      const error = await response.json()
      console.log(`❌ Erreur pour ${userData.email}:`, error.message)
    }
  } catch (error) {
    console.log(`❌ Erreur réseau pour ${userData.email}:`, error)
  }
}

// Créer tous les utilisateurs
console.log('🚀 Création des utilisateurs de démonstration...')
demoUsers.forEach(createUser)
