# Test de l'API des Analyses IA

## 🎯 Objectif
Vérifier que la fonctionnalité de sauvegarde des analyses IA fonctionne correctement.

## 📋 Étapes de test

### 1. Démarrer le backend
```bash
cd backend
npm start
```

### 2. Tester l'API directement
```bash
node test-analysis-api.js
```

### 3. Tester via l'interface utilisateur

1. **Aller sur la page des réponses d'un formulaire**
   - URL: `http://localhost:3000/forms/[ID]/responses`

2. **Générer une analyse**
   - Cliquer sur "Analyser avec IA" → "Générer l'analyse"
   - Remplir le prompt personnalisé (optionnel)
   - Cliquer sur "Générer l'analyse"
   - Attendre la fin de l'analyse

3. **Sauvegarder l'analyse**
   - Cliquer sur "Enregistrer l'analyse" (bouton vert)
   - Vérifier le message de succès

4. **Vérifier la sauvegarde**
   - Cliquer sur "Voir l'analyse"
   - Vérifier que l'analyse apparaît dans la liste
   - Tester le bouton "Charger" pour récupérer l'analyse

## 🔍 Vérifications

### Base de données MongoDB
```javascript
// Se connecter à MongoDB et vérifier la collection
db.form_analyses.find().pretty()
```

### Logs du serveur
Vérifier les logs du serveur backend pour s'assurer qu'il n'y a pas d'erreurs.

### Réponses API
- `GET /api/forms/:id/analyses` → Liste des analyses
- `POST /api/forms/:id/analyses` → Sauvegarde d'une analyse

## 🐛 Problèmes possibles

1. **Erreur 404** : Le formulaire n'existe pas
2. **Erreur 500** : Problème de connexion à la base de données
3. **CORS** : Problème de configuration CORS
4. **Auth** : Problème d'authentification (si activée)

## ✅ Critères de succès

- [ ] L'analyse se sauvegarde sans erreur
- [ ] L'analyse apparaît dans la liste des analyses sauvegardées
- [ ] L'analyse peut être rechargée depuis la liste
- [ ] L'export fonctionne correctement
- [ ] Les métadonnées (date, prompt personnalisé) sont conservées
