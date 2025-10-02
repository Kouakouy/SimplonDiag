import { getDb } from '../config/db'
import bcrypt from 'bcryptjs'

async function initializeDemoUsers() {
  try {
    const db = await getDb()
    const users = db.collection('users')
    
    // Vérifier si les utilisateurs existent déjà
    const existingUsers = await users.find({}).toArray()
    if (existingUsers.length > 0) {
      console.log('Users already exist, skipping initialization')
      return
    }
    
    // Créer les utilisateurs de démonstration
    const demoUsers = [
      {
        name: 'Admin Simplon',
        email: 'admin@simplon.com',
        password_hash: await bcrypt.hash('password123', 10),
        role: 'admin',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Observateur Simplon',
        email: 'observer@simplon.com',
        password_hash: await bcrypt.hash('password123', 10),
        role: 'observer',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Créateur Simplon',
        email: 'creator@simplon.com',
        password_hash: await bcrypt.hash('password123', 10),
        role: 'creator',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]
    
    await users.insertMany(demoUsers)
    console.log('Demo users initialized successfully')
    
  } catch (error) {
    console.error('Error initializing demo users:', error)
  }
}

// Exécuter seulement si ce fichier est appelé directement
if (require.main === module) {
  initializeDemoUsers().then(() => {
    console.log('Initialization complete')
    process.exit(0)
  })
}

export { initializeDemoUsers }
