# Guide d'Installation - Système de Rapport et Améliorations de Sécurité

## 📦 Installation des Dépendances

### Backend

```bash
cd backend
npm install
```

Cela installera automatiquement :
- `helmet` : Headers de sécurité HTTP
- `express-rate-limit` : Protection contre les abus
- `multer` : Gestion des fichiers (déjà configuré)
- Toutes les autres dépendances

### Frontend

Aucune nouvelle dépendance requise. Le système utilise les packages existants.

## 🔧 Configuration

### Variables d'Environnement

Ajouter dans `backend/.env` :

```env
# Email admin pour recevoir les rapports
ADMIN_EMAIL=admin@simplon.africa

# URL du frontend (pour CORS)
FRONTEND_URL=http://localhost:3000

# Environnement
NODE_ENV=development
```

## 🚀 Démarrage

### 1. Compiler le Backend

```bash
cd backend
npm run build
```

### 2. Démarrer le Backend

```bash
npm run dev
```

Le serveur démarre sur `http://localhost:3001`

### 3. Démarrer le Frontend

```bash
cd ..
npm run dev
```

Le frontend démarre sur `http://localhost:3000`

## ✅ Vérification

### 1. Tester le Système de Rapport

1. Connectez-vous à l'application
2. Cliquez sur "Signaler un problème" dans la sidebar
3. Remplissez le formulaire
4. Vérifiez que l'email est reçu

### 2. Tester la Sécurité

#### Rate Limiting
```bash
# Tester le rate limiting (devrait bloquer après 100 requêtes)
for i in {1..110}; do curl http://localhost:3001/api/health; done
```

#### CORS
```bash
# Tester CORS avec une origine non autorisée
curl -H "Origin: http://malicious-site.com" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS http://localhost:3001/api/forms
```

#### Headers de Sécurité
```bash
# Vérifier les headers de sécurité
curl -I http://localhost:3001/api/health
```

Vous devriez voir :
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Content-Security-Policy: ...`

## 🗄️ Base de Données

### Collection `reports`

La collection sera créée automatiquement lors du premier rapport.

Structure :
```javascript
{
  _id: ObjectId,
  type: "bug" | "feature" | "question" | "info",
  subject: String,
  message: String,
  email: String | null,
  image: {
    data: String, // Base64
    name: String
  } | null,
  status: "pending" | "in_progress" | "resolved",
  created_at: Date,
  user_agent: String,
  ip_address: String
}
```

## 📧 Configuration Email

Le système utilise Brevo (anciennement SendinBlue) pour l'envoi d'emails.

Vérifiez que ces variables sont dans `.env` :
```env
BREVO_API_KEY=your_api_key
BREVO_SENDER_EMAIL=noreply@simplon.africa
BREVO_SENDER_NAME=Simplon Africa
```

## 🔍 Vérification des Fonctionnalités

### Système de Rapport
- [ ] Page `/report` accessible
- [ ] Bouton dans la sidebar visible
- [ ] Formulaire fonctionnel
- [ ] Upload d'image fonctionne
- [ ] Validation des champs
- [ ] Email admin reçu
- [ ] Email confirmation reçu (si email fourni)

### Sécurité
- [ ] Rate limiting actif
- [ ] CORS restrictif
- [ ] Headers de sécurité présents
- [ ] Validation Zod fonctionnelle
- [ ] Tentatives de connexion limitées

### Système de Positionnement
- [ ] Positions respectées dans l'éditeur
- [ ] Positions affichées correctement dans l'aperçu
- [ ] Positions affichées correctement dans le formulaire public
- [ ] Limite au nombre de questions

## 🐛 Dépannage

### Problème : Emails non reçus

**Solution** :
1. Vérifier `BREVO_API_KEY` dans `.env`
2. Vérifier `ADMIN_EMAIL` dans `.env`
3. Consulter les logs du backend
4. Vérifier les spams

### Problème : CORS bloque les requêtes

**Solution** :
1. Vérifier `FRONTEND_URL` dans `.env`
2. En développement, le mode dev autorise toutes les origines
3. Redémarrer le backend après modification

### Problème : Rate limiting trop strict

**Solution** :
Modifier dans `backend/src/server.ts` :
```typescript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200, // Augmenter la limite
  // ...
})
```

### Problème : Image trop grande

**Solution** :
L'utilisateur doit compresser l'image ou utiliser une image plus petite (< 5 Mo).

## 📊 Monitoring

### Logs Backend

Les logs sont affichés dans la console :
```
📧 [BREVO API] Tentative d'envoi d'email...
   À: admin@simplon.africa
   Sujet: [Rapport] 🐛 Bug / Erreur - ...
✅ [BREVO API] Email envoyé avec succès
```

### Logs Frontend

Ouvrir la console du navigateur (F12) pour voir les erreurs éventuelles.

## 🔐 Sécurité en Production

### Checklist Avant Déploiement

- [ ] Définir `NODE_ENV=production`
- [ ] Définir `FRONTEND_URL` avec l'URL de production
- [ ] Utiliser HTTPS uniquement
- [ ] Changer les secrets JWT
- [ ] Activer les sauvegardes MongoDB
- [ ] Configurer un monitoring (Sentry, LogRocket)
- [ ] Tester le rate limiting
- [ ] Vérifier les headers de sécurité
- [ ] Désactiver les logs de debug

### Variables d'Environnement Production

```env
NODE_ENV=production
FRONTEND_URL=https://votre-domaine.com
MONGODB_URI=mongodb+srv://...
JWT_SECRET=votre_secret_super_securise
ADMIN_EMAIL=admin@votre-domaine.com
```

## 📚 Documentation

- **Système de Rapport** : `REPORT_SYSTEM.md`
- **Audit de Sécurité** : `SECURITY_AUDIT.md`
- **Corrections de Position** : `POSITION_SYSTEM_FIXES.md`

## 🎯 Prochaines Étapes

1. **Installer les dépendances** : `cd backend && npm install`
2. **Configurer les variables** : Éditer `backend/.env`
3. **Compiler** : `npm run build`
4. **Démarrer** : `npm run dev`
5. **Tester** : Accéder à `/report`

## 💡 Conseils

- Testez d'abord en développement
- Vérifiez les emails dans les spams
- Consultez les logs en cas de problème
- Utilisez Postman pour tester l'API
- Activez le mode debug si nécessaire

## 🆘 Support

En cas de problème :
1. Consulter les logs
2. Vérifier la documentation
3. Tester avec Postman
4. Contacter l'équipe technique
