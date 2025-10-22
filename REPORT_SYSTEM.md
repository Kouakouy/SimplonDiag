# Système de Rapport de Problèmes

## 📋 Vue d'ensemble

Le système de rapport permet aux utilisateurs de signaler des bugs, suggérer des améliorations, poser des questions ou partager des informations concernant la plateforme.

## 🎯 Fonctionnalités

### Types de Rapports
- **🐛 Bug / Erreur** : Signaler un problème technique
- **💡 Suggestion** : Proposer une amélioration
- **❓ Question** : Poser une question
- **ℹ️ Information** : Partager une information

### Champs du Formulaire
1. **Type de rapport** (obligatoire) : Sélection parmi les 4 types
2. **Sujet** (obligatoire) : Résumé en 200 caractères max
3. **Email** (optionnel) : Pour recevoir une réponse
4. **Description** (obligatoire) : Message détaillé (2000 caractères max)
5. **Capture d'écran** (optionnel) : Image jusqu'à 5 Mo

## 🔧 Architecture Technique

### Frontend
- **Page** : `/app/report/page.tsx`
- **Composant** : `/components/report/report-form.tsx`
- **Accès** : Bouton dans la sidebar + route `/report`

### Backend
- **Controller** : `/backend/src/controllers/reportsController.ts`
- **Routes** : `/backend/src/routes/reports.ts`
- **Collection MongoDB** : `reports`

### Flux de Données
```
1. Utilisateur remplit le formulaire
2. Image convertie en base64 (si présente)
3. Validation côté client (Zod)
4. Envoi POST /api/reports
5. Validation côté serveur (Zod)
6. Sauvegarde en base de données
7. Envoi email admin + confirmation utilisateur
8. Affichage message de succès
```

## 📧 Notifications Email

### Email Admin
- **Destinataire** : `process.env.ADMIN_EMAIL` ou `admin@simplon.africa`
- **Contenu** :
  - Type de rapport
  - Sujet
  - Email de l'utilisateur (si fourni)
  - Date
  - Message complet
  - Capture d'écran (si fournie)
  - Informations techniques (User Agent, IP)

### Email Utilisateur
- **Condition** : Si l'utilisateur a fourni son email
- **Contenu** : Confirmation de réception du rapport

## 🗄️ Structure de la Base de Données

```typescript
{
  _id: ObjectId,
  type: 'bug' | 'feature' | 'question' | 'info',
  subject: string,
  message: string,
  email: string | null,
  image: {
    data: string, // Base64
    name: string
  } | null,
  status: 'pending' | 'in_progress' | 'resolved',
  created_at: Date,
  user_agent: string | null,
  ip_address: string | null
}
```

## 🔒 Sécurité

### Validations
- ✅ Type de rapport : Enum strict
- ✅ Sujet : 1-200 caractères
- ✅ Message : 1-2000 caractères
- ✅ Email : Format valide (regex)
- ✅ Image : Type MIME vérifié (jpeg, jpg, png, gif, webp)
- ✅ Image : Taille max 5 Mo

### Protection
- ✅ Rate limiting : 100 requêtes/15min par IP
- ✅ Validation Zod côté serveur
- ✅ Pas d'upload de fichiers malveillants (base64)
- ✅ Sanitisation des entrées

## 🎨 Interface Utilisateur

### Design
- Formulaire en carte avec titre et description
- Sélection visuelle des types de rapport
- Compteurs de caractères
- Prévisualisation de l'image
- Messages d'erreur clairs
- Animation de succès

### Responsive
- ✅ Mobile-friendly
- ✅ Tablette optimisée
- ✅ Desktop complet

## 🚀 Utilisation

### Pour les Utilisateurs
1. Cliquer sur "Signaler un problème" dans la sidebar
2. Sélectionner le type de rapport
3. Remplir le formulaire
4. (Optionnel) Ajouter une capture d'écran
5. Envoyer

### Pour les Administrateurs
Les rapports sont accessibles via l'API :
- **GET** `/api/reports` : Liste tous les rapports (admin uniquement)
- **PATCH** `/api/reports/:id/status` : Mettre à jour le statut (admin uniquement)

## 📝 Conseils pour un Bon Rapport

1. **Soyez précis** : Décrivez le problème en détail
2. **Ajoutez une capture d'écran** : Une image vaut mille mots
3. **Indiquez les étapes** : Comment reproduire le problème ?
4. **Mentionnez votre navigateur** : Chrome, Firefox, Safari, etc.

## 🔄 Statuts des Rapports

- **pending** : En attente de traitement
- **in_progress** : En cours de traitement
- **resolved** : Résolu

## 📊 Métriques

Les informations suivantes sont collectées pour chaque rapport :
- User Agent (navigateur)
- Adresse IP
- Date et heure
- Type de rapport
- Présence d'une capture d'écran

## 🛠️ Installation

### Dépendances Backend
```bash
cd backend
npm install
```

Les packages nécessaires sont déjà dans `package.json` :
- `zod` : Validation des données
- `nodemailer` / `@getbrevo/brevo` : Envoi d'emails

### Configuration
Ajouter dans `.env` :
```env
ADMIN_EMAIL=admin@simplon.africa
```

## 🧪 Tests

### Test Manuel
1. Accéder à `/report`
2. Tester chaque type de rapport
3. Tester avec/sans email
4. Tester avec/sans image
5. Vérifier les validations
6. Vérifier les emails reçus

### Cas de Test
- [ ] Rapport sans email
- [ ] Rapport avec email
- [ ] Rapport avec image
- [ ] Rapport sans image
- [ ] Sujet trop long (>200)
- [ ] Message trop long (>2000)
- [ ] Image trop grande (>5Mo)
- [ ] Format d'image invalide
- [ ] Email invalide

## 🎯 Améliorations Futures

- [ ] Interface admin pour gérer les rapports
- [ ] Système de tickets avec numéro de suivi
- [ ] Réponses directes depuis l'interface
- [ ] Statistiques des rapports
- [ ] Catégorisation automatique
- [ ] Recherche et filtres
- [ ] Export des rapports (CSV, PDF)
- [ ] Intégration avec un système de ticketing (Jira, Trello)

## 📞 Support

Pour toute question concernant le système de rapport :
- Email : admin@simplon.africa
- Documentation : Ce fichier
