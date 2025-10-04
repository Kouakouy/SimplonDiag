// Test simple pour vérifier l'authentification
const jwt = require('jsonwebtoken')

// Simuler un token JWT
const testUser = {
  id: 'test-user-123',
  email: 'creator@test.com',
  role: 'creator'
}

const token = jwt.sign(testUser, 'your-jwt-secret') // Remplacez par votre vraie clé secrète

console.log('=== Test Token JWT ===')
console.log('User:', testUser)
console.log('Token:', token)

// Décoder le token pour vérifier
const decoded = jwt.verify(token, 'your-jwt-secret')
console.log('Decoded:', decoded)

console.log('=== Test terminé ===')
