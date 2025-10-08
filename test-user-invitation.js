// Script de test pour le système d'invitation d'utilisateurs
const fetch = require('node-fetch');

const API_URL = process.env.API_URL || 'http://localhost:3001/api';

async function testUserInvitation() {
  console.log('🧪 Test du système d\'invitation d\'utilisateurs\n');
  
  try {
    // 1. Connexion en tant qu'admin
    console.log('1. Connexion en tant qu\'admin...');
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@simplon.com',
        password: 'admin123'
      })
    });
    
    if (!loginResponse.ok) {
      console.log('❌ Échec de la connexion admin');
      const error = await loginResponse.text();
      console.log('Erreur:', error);
      return;
    }
    
    const { token } = await loginResponse.json();
    console.log('✅ Connexion admin réussie\n');
    
    // 2. Créer un utilisateur avec invitation
    console.log('2. Création d\'un utilisateur avec invitation...');
    const createUserResponse = await fetch(`${API_URL}/auth/users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'test@simplon.com',
        role: 'creator'
      })
    });
    
    if (!createUserResponse.ok) {
      console.log('❌ Échec de la création d\'utilisateur');
      const error = await createUserResponse.text();
      console.log('Erreur:', error);
      return;
    }
    
    const createResult = await createUserResponse.json();
    console.log('✅ Utilisateur créé avec invitation');
    console.log('   ID:', createResult.id);
    console.log('   Message:', createResult.message);
    console.log('   📧 Un email d\'invitation a été envoyé à test@simplon.com\n');
    
    // 3. Vérifier que l'utilisateur est dans la liste
    console.log('3. Vérification de la liste des utilisateurs...');
    const usersResponse = await fetch(`${API_URL}/auth/users`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!usersResponse.ok) {
      console.log('❌ Échec de la récupération des utilisateurs');
      return;
    }
    
    const users = await usersResponse.json();
    const newUser = users.find(u => u.email === 'test@simplon.com');
    
    if (newUser) {
      console.log('✅ Utilisateur trouvé dans la liste');
      console.log('   Email:', newUser.email);
      console.log('   Rôle:', newUser.role);
      console.log('   Actif:', newUser.isActive);
      console.log('   Nom:', newUser.name || '(non défini)');
    } else {
      console.log('❌ Utilisateur non trouvé dans la liste');
    }
    
    console.log('\n🎉 Test terminé avec succès !');
    console.log('\n📝 Prochaines étapes :');
    console.log('   - Vérifiez votre boîte email pour l\'invitation');
    console.log('   - Cliquez sur le lien dans l\'email');
    console.log('   - Complétez le profil sur la page /auth/complete-profile');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

// Exécuter le test
testUserInvitation();
