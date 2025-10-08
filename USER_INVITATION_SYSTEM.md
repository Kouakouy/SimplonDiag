# Système de Notification par Email - Invitation d'Utilisateurs

## 🎯 Objectif
Implémenter un système où l'administrateur peut créer un utilisateur avec seulement l'email et le rôle. L'utilisateur reçoit ensuite un email avec un lien pour compléter son profil (nom complet, mot de passe).

## ✅ Fonctionnalités Implémentées

### 1. Backend - Contrôleur d'Authentification
- **Nouveau schéma `inviteUserSchema`** : Validation avec seulement email et rôle
- **Fonction `createUser` modifiée** : 
  - Génère un token d'invitation unique
  - Crée l'utilisateur avec `is_active: false`
  - Envoie un email d'invitation automatiquement
- **Nouvelle fonction `completeProfile`** :
  - Valide le token d'invitation
  - Permet à l'utilisateur de définir son nom et mot de passe
  - Active le compte après complétion

### 2. Templates d'Email
- **Template `userInvitation`** dans `emailTemplates.ts` :
  - Design professionnel avec les couleurs Simplon
  - Informations sur le rôle assigné
  - Lien sécurisé vers la page de complétion
  - Instructions claires pour l'utilisateur

### 3. Interface Utilisateur
- **Page de complétion du profil** (`/auth/complete-profile`) :
  - Formulaire sécurisé avec validation
  - Gestion des erreurs (token invalide, expiré, etc.)
  - Redirection automatique vers la connexion
- **Interface d'administration modifiée** :
  - Champs nom et mot de passe optionnels lors de la création
  - Messages informatifs sur le mode invitation
  - Bouton "Envoyer l'invitation" au lieu de "Créer"

### 4. Routes API
- **Route publique** : `POST /auth/complete-profile`
- **Route protégée** : `POST /auth/users` (admin seulement)

## 🔧 Configuration Requise

### Variables d'environnement
```env
# Email SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@simplonform.com

# Application
APP_URL=http://localhost:3000
```

## 🚀 Flux d'Utilisation

### Pour l'Administrateur
1. Se connecter en tant qu'admin
2. Aller dans Settings > Users
3. Cliquer sur "Inviter un utilisateur"
4. Remplir seulement l'email et le rôle
5. Cliquer sur "Envoyer l'invitation"

### Pour l'Utilisateur Invité
1. Recevoir l'email d'invitation
2. Cliquer sur le lien "Compléter mon profil"
3. Remplir le nom complet et mot de passe
4. Valider le formulaire
5. Être redirigé vers la page de connexion

## 🔒 Sécurité

- **Token d'invitation** : Généré avec `crypto.randomBytes(32)`
- **Expiration** : 7 jours maximum
- **Validation** : Vérification du token et de l'expiration
- **Comptes inactifs** : `is_active: false` jusqu'à complétion
- **Nettoyage** : Suppression du token après utilisation

## 📧 Template d'Email

L'email d'invitation inclut :
- Header avec logo Simplon
- Message personnalisé selon le rôle
- Bouton d'action stylisé
- Instructions claires
- Lien de secours si le bouton ne fonctionne pas
- Note sur la validité du lien (7 jours)

## 🧪 Test

Un script de test est disponible : `test-user-invitation.js`

```bash
node test-user-invitation.js
```

## 📁 Fichiers Modifiés

### Backend
- `backend/src/controllers/authController.ts`
- `backend/src/services/emailTemplates.ts`
- `backend/src/routes/users.ts`

### Frontend
- `components/admin/UserManagement.tsx`
- `app/auth/complete-profile/page.tsx` (nouveau)

### Test
- `test-user-invitation.js` (nouveau)

## 🎨 Design

- Interface cohérente avec le design existant
- Couleurs Simplon (#E40046)
- Messages informatifs et guides utilisateur
- Responsive design
- Animations et transitions fluides
