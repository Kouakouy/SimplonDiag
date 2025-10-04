// Script de test pour vérifier la création de formulaires avec authentification
const fetch = require('node-fetch')

async function testFormCreation() {
  const baseUrl = process.env.API_URL || 'http://localhost:3001'
  
  try {
    console.log('🧪 Test de création de formulaire avec authentification...')
    
    // 1. Se connecter pour obtenir un token
    console.log('\n1. Connexion...')
    const loginResponse = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com', // Remplacez par un email valide
        password: 'password123'     // Remplacez par un mot de passe valide
      })
    })
    
    if (!loginResponse.ok) {
      console.error('❌ Échec de la connexion:', await loginResponse.text())
      return
    }
    
    const { token } = await loginResponse.json()
    console.log('✅ Connexion réussie')
    
    // 2. Créer un formulaire avec le token
    console.log('\n2. Création d\'un formulaire...')
    const formData = {
      title: `Test Formulaire ${new Date().toISOString()}`,
      description: 'Formulaire de test pour vérifier created_by',
      is_public: true,
      questions: [
        {
          id: 'q1',
          type: 'text',
          title: 'Votre nom',
          required: true
        }
      ]
    }
    
    const createResponse = await fetch(`${baseUrl}/forms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(formData)
    })
    
    if (!createResponse.ok) {
      console.error('❌ Échec de la création:', await createResponse.text())
      return
    }
    
    const { id } = await createResponse.json()
    console.log('✅ Formulaire créé avec ID:', id)
    
    // 3. Récupérer le formulaire pour vérifier created_by
    console.log('\n3. Vérification du formulaire créé...')
    const getResponse = await fetch(`${baseUrl}/forms/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (!getResponse.ok) {
      console.error('❌ Échec de la récupération:', await getResponse.text())
      return
    }
    
    const form = await getResponse.json()
    console.log('📋 Détails du formulaire:')
    console.log(`   - Titre: ${form.title}`)
    console.log(`   - user_id: ${form.user_id}`)
    console.log(`   - created_by: ${form.created_by}`)
    console.log(`   - Créé le: ${form.created_at}`)
    
    if (form.created_by && form.user_id) {
      console.log('✅ SUCCÈS: Le formulaire a bien un créateur assigné!')
    } else {
      console.log('❌ ÉCHEC: Le formulaire n\'a pas de créateur assigné')
    }
    
    // 4. Lister les formulaires pour vérifier le filtrage
    console.log('\n4. Test de la liste des formulaires...')
    const listResponse = await fetch(`${baseUrl}/forms`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (!listResponse.ok) {
      console.error('❌ Échec de la liste:', await listResponse.text())
      return
    }
    
    const forms = await listResponse.json()
    console.log(`📝 Nombre de formulaires visibles: ${forms.length}`)
    
    const userForms = forms.filter(f => f.created_by === form.created_by)
    console.log(`👤 Formulaires de l'utilisateur actuel: ${userForms.length}`)
    
    if (userForms.length > 0) {
      console.log('✅ SUCCÈS: L\'utilisateur peut voir ses propres formulaires!')
    } else {
      console.log('❌ ÉCHEC: L\'utilisateur ne peut pas voir ses formulaires')
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message)
  }
}

// Instructions d'utilisation
console.log('🚀 Script de test de création de formulaires')
console.log('📝 Instructions:')
console.log('1. Assurez-vous que le serveur backend est démarré')
console.log('2. Modifiez les credentials de connexion dans le script')
console.log('3. Exécutez: node test-form-creation.js')
console.log('')

testFormCreation()
