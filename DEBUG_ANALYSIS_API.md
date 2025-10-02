# 🔧 Dépannage - API des Analyses

## ❌ Problème identifié
```
Cannot POST /api/forms/68dd71af68b7af45d2efae98/analyses
```

## 🎯 Cause probable
Le backend n'a pas été redémarré avec les nouvelles routes d'analyses.

## ✅ Solutions

### 1. **Redémarrer le backend**
```bash
cd backend
npm run build  # Compiler les nouvelles routes
npm start      # Redémarrer le serveur
```

### 2. **Vérifier que les routes sont disponibles**
```bash
node test-routes.js
```

### 3. **Vérifier manuellement**
```bash
# Test GET
curl http://localhost:3001/api/forms

# Test POST (remplacer FORM_ID par un vrai ID)
curl -X POST http://localhost:3001/api/forms/FORM_ID/analyses \
  -H "Content-Type: application/json" \
  -d '{"summary": "Test"}'
```

## 🔍 Vérifications

### Backend en cours d'exécution ?
```bash
# Vérifier les processus sur le port 3001
netstat -an | grep 3001
# ou
lsof -i :3001
```

### Routes compilées ?
Vérifier que le fichier `backend/dist/routes/forms.js` contient :
```javascript
formsRouter.get('/:id/analyses', listAnalyses)
formsRouter.post('/:id/analyses', saveAnalysis)
```

### MongoDB accessible ?
Vérifier que MongoDB est démarré et accessible.

## 🚀 Test complet

1. **Démarrer le backend** :
   ```bash
   cd backend
   npm start
   ```

2. **Tester les routes** :
   ```bash
   node test-routes.js
   ```

3. **Tester via l'interface** :
   - Aller sur `/forms/[ID]/responses`
   - Générer une analyse
   - Cliquer sur "Enregistrer l'analyse"

## 📝 Logs utiles

Vérifier les logs du serveur backend pour voir :
- Les routes chargées au démarrage
- Les erreurs de connexion MongoDB
- Les erreurs de compilation TypeScript

## ⚡ Solution rapide

Si le problème persiste :
1. Arrêter le serveur backend (Ctrl+C)
2. Supprimer le dossier `backend/dist`
3. Recompiler : `npm run build`
4. Redémarrer : `npm start`
