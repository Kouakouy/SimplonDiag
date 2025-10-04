// Script pour corriger les formulaires existants
const { MongoClient } = require('mongodb')

async function fixForms() {
  const client = new MongoClient('mongodb://localhost:27017') // Remplacez par votre URL MongoDB
  
  try {
    await client.connect()
    console.log('Connecté à MongoDB')
    
    const db = client.db('simplon_form') // Remplacez par votre nom de base de données
    const forms = db.collection('forms')
    
    // Trouver tous les formulaires avec created_by null
    const formsToFix = await forms.find({ created_by: null }).toArray()
    console.log(`Trouvé ${formsToFix.length} formulaires à corriger`)
    
    if (formsToFix.length === 0) {
      console.log('Aucun formulaire à corriger')
      return
    }
    
    // Afficher les formulaires
    formsToFix.forEach((form, index) => {
      console.log(`${index + 1}. ${form.title} (ID: ${form._id})`)
    })
    
    // Option 1: Assigner à un utilisateur admin par défaut
    // Remplacez 'ADMIN_USER_ID' par l'ID d'un vrai utilisateur admin
    const defaultUserId = 'ADMIN_USER_ID' // À remplacer
    
    console.log(`\nVoulez-vous assigner tous ces formulaires à l'utilisateur: ${defaultUserId}?`)
    console.log('Décommentez la ligne suivante pour exécuter la mise à jour:')
    console.log('// await forms.updateMany({ created_by: null }, { $set: { created_by: defaultUserId } })')
    
    // Décommentez cette ligne pour exécuter la mise à jour
    // await forms.updateMany({ created_by: null }, { $set: { created_by: defaultUserId } })
    
    console.log('\nScript terminé')
    
  } catch (error) {
    console.error('Erreur:', error)
  } finally {
    await client.close()
  }
}

fixForms()
