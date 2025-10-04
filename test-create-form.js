// Script de test pour créer un formulaire et vérifier le created_by
const fetch = require('node-fetch')

async function testCreateForm() {
  try {
    // Remplacez par vos vraies données
    const loginData = {
      email: 'creator@example.com', // Email d'un utilisateur créateur
      password: 'password123'       // Mot de passe
    }
    
    console.log('=== Test de création de formulaire ===')
    
    // 1. Se connecter
    console.log('1. Connexion...')
    const loginResponse = await fetch('http://localhost:3001/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginData)
    })
    
    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`)
    }
    
    const loginResult = await loginResponse.json()
    const token = loginResult.token
    
    console.log('Connexion réussie, token:', token.substring(0, 20) + '...')
    
    // 2. Créer un formulaire
    console.log('2. Création du formulaire...')
    const formData = {
      title: 'Test Formulaire',
      description: 'Formulaire de test pour vérifier created_by',
      is_public: true,
      questions: []
    }
    
    const createResponse = await fetch('http://localhost:3001/forms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(formData)
    })
    
    if (!createResponse.ok) {
      const errorText = await createResponse.text()
      throw new Error(`Create form failed: ${createResponse.status} - ${errorText}`)
    }
    
    const createResult = await createResponse.json()
    console.log('Formulaire créé avec ID:', createResult.id)
    
    // 3. Vérifier la liste des formulaires
    console.log('3. Vérification de la liste...')
    const listResponse = await fetch('http://localhost:3001/forms', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (!listResponse.ok) {
      throw new Error(`List forms failed: ${listResponse.status}`)
    }
    
    const forms = await listResponse.json()
    console.log(`Nombre de formulaires visibles: ${forms.length}`)
    
    forms.forEach((form, index) => {
      console.log(`${index + 1}. ${form.title} (created_by: ${form.created_by})`)
    })
    
    console.log('=== Test terminé ===')
    
  } catch (error) {
    console.error('Erreur:', error.message)
  }
}

testCreateForm()
