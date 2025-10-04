// Script pour corriger les formulaires existants avec created_by: null
const { MongoClient } = require('mongodb')

async function fixExistingForms() {
  // Remplacez par votre URL MongoDB
  const mongoUrl = process.env.MONGODB_URL || 'mongodb://localhost:27017'
  const dbName = process.env.DB_NAME || 'simplon_form'
  
  const client = new MongoClient(mongoUrl)
  
  try {
    await client.connect()
    console.log('Connecté à MongoDB')
    
    const db = client.db(dbName)
    const forms = db.collection('forms')
    
    // Trouver tous les formulaires avec created_by null
    const formsToFix = await forms.find({ created_by: null }).toArray()
    console.log(`Trouvé ${formsToFix.length} formulaires à corriger`)
    
    if (formsToFix.length === 0) {
      console.log('Aucun formulaire à corriger')
      return
    }
    
    // Afficher les formulaires
    console.log('\nFormulaires à corriger:')
    formsToFix.forEach((form, index) => {
      console.log(`${index + 1}. ${form.title} (ID: ${form._id})`)
      console.log(`   - user_id: ${form.user_id}`)
      console.log(`   - created_by: ${form.created_by}`)
      console.log(`   - created_at: ${form.created_at}`)
    })
    
    // Demander confirmation
    console.log('\n⚠️  ATTENTION: Ce script va modifier les formulaires existants.')
    console.log('Assurez-vous d\'avoir une sauvegarde de votre base de données.')
    console.log('\nOptions:')
    console.log('1. Assigner tous les formulaires à un utilisateur admin spécifique')
    console.log('2. Supprimer les formulaires orphelins')
    console.log('3. Annuler')
    
    // Pour l'instant, on va assigner à un utilisateur admin par défaut
    // Vous devrez remplacer 'ADMIN_USER_ID' par un vrai ID d'utilisateur
    const defaultUserId = 'ADMIN_USER_ID' // À remplacer par un vrai ID
    
    console.log(`\nPour assigner tous ces formulaires à l'utilisateur: ${defaultUserId}`)
    console.log('Décommentez la ligne suivante dans le script:')
    console.log('// await forms.updateMany({ created_by: null }, { $set: { created_by: defaultUserId, user_id: defaultUserId } })')
    
    // Décommentez cette ligne pour exécuter la mise à jour
    // await forms.updateMany({ created_by: null }, { $set: { created_by: defaultUserId, user_id: defaultUserId } })
    
    console.log('\n✅ Script terminé')
    console.log('💡 Conseil: Après avoir corrigé les formulaires existants, testez la création d\'un nouveau formulaire pour vérifier que le problème est résolu.')
    
  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await client.close()
  }
}

// Exécuter le script
fixExistingForms()
