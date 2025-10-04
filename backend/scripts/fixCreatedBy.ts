import { getDb } from '../src/config/db'

async function fixCreatedBy() {
  try {
    const db = await getDb()
    const forms = db.collection('forms')
    
    console.log('=== Fixing created_by field ===')
    
    // Trouver tous les formulaires avec created_by null
    const formsWithNullCreatedBy = await forms.find({ created_by: null }).toArray()
    console.log(`Found ${formsWithNullCreatedBy.length} forms with created_by: null`)
    
    if (formsWithNullCreatedBy.length === 0) {
      console.log('No forms to fix')
      return
    }
    
    // Pour chaque formulaire, on va essayer de déterminer le créateur
    // Si on ne peut pas le déterminer, on va les assigner à un utilisateur par défaut
    // ou les supprimer selon votre préférence
    
    console.log('Forms to fix:')
    formsWithNullCreatedBy.forEach((form, index) => {
      console.log(`${index + 1}. ${form.title} (ID: ${form._id})`)
    })
    
    // Option 1: Assigner tous les formulaires à un utilisateur admin par défaut
    // Remplacez 'ADMIN_USER_ID' par l'ID d'un utilisateur admin réel
    const defaultAdminId = 'ADMIN_USER_ID' // À remplacer par un vrai ID
    
    // Option 2: Supprimer les formulaires sans créateur
    // await forms.deleteMany({ created_by: null })
    
    // Option 3: Mettre à jour avec un ID par défaut (décommentez si nécessaire)
    // await forms.updateMany(
    //   { created_by: null },
    //   { $set: { created_by: defaultAdminId } }
    // )
    
    console.log('=== Fix completed ===')
    
  } catch (error) {
    console.error('Error fixing created_by:', error)
  }
}

// Exécuter le script
fixCreatedBy().then(() => {
  console.log('Script completed')
  process.exit(0)
}).catch((error) => {
  console.error('Script failed:', error)
  process.exit(1)
})
