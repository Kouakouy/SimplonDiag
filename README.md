# Simplon Form

Plateforme de création et gestion de formulaires en ligne.

## Architecture

### Frontend

**Framework:** Next.js 14 avec App Router
**Langage:** TypeScript
**Styling:** Tailwind CSS
**Composants UI:** shadcn/ui
**Charts:** Chart.js avec react-chartjs-2

**Structure:**
```
backend/
app/
├── layout.tsx (Layout principal)
├── page.tsx (Dashboard)
├── globals.css (Styles globaux)
├── forms/
│   ├── page.tsx (Liste des formulaires)
│   ├── create/page.tsx (Création de formulaire)
│   └── [id]/
│       ├── edit/page.tsx (Édition)
│       ├── responses/page.tsx (Réponses)
│       ├── share/page.tsx (Partage)
│       └── stats/page.tsx (Statistiques)
├── settings/page.tsx (Paramètres)
└── f/[id]/page.tsx (Formulaire public)

components/
├── layout/sidebar.tsx (Navigation)
├── forms/ (Composants de formulaires)
└── ui/ (Composants UI de base)
```

### Backend

**Framework:** Node.js avec Express.js
**Langage:** TypeScript
**Authentification:** JWT
**Validation:** Joi ou Zod

**Structure:**
```
src/
├── controllers/ (Logique métier)
├── models/ (Modèles de données)
├── routes/ (Routes API)
├── middleware/ (Authentification, validation)
├── services/ (Services externes)
├── utils/ (Utilitaires)
└── config/ (Configuration)
```

**API Endpoints:**
```
POST   /api/auth/login
POST   /api/auth/register
GET    /api/forms (Liste des formulaires)
POST   /api/forms (Créer un formulaire)
GET    /api/forms/:id (Détails du formulaire)
PUT    /api/forms/:id (Modifier le formulaire)
DELETE /api/forms/:id (Supprimer le formulaire)
GET    /api/forms/:id/responses (Réponses du formulaire)
POST   /api/forms/:id/responses (Soumettre une réponse)
GET    /api/forms/:id/stats (Statistiques)
POST   /api/forms/:id/share (Partager le formulaire)
```

### Base de Données

#### MySQL (Production)

**Tables principales:**

```sql
-- Utilisateurs
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Formulaires
CREATE TABLE forms (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Questions
CREATE TABLE questions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    form_id INT NOT NULL,
    category_id VARCHAR(100),
    type ENUM('text', 'email', 'select', 'radio', 'checkbox', 'textarea', 'number', 'date', 'rating', 'file'),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    required BOOLEAN DEFAULT FALSE,
    options JSON,
    validation_rules JSON,
    conditional_logic JSON,
    is_multiple_choice BOOLEAN DEFAULT FALSE,
    order_index INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE
);

-- Réponses
CREATE TABLE responses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    form_id INT NOT NULL,
    respondent_name VARCHAR(255),
    respondent_email VARCHAR(255),
    answers JSON NOT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE
);

-- Sessions
CREATE TABLE sessions (
    id VARCHAR(255) PRIMARY KEY,
    user_id INT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### MongoDB (Analytics et Logs)

**Collections:**

```javascript
// Logs d'activité
{
  _id: ObjectId,
  userId: String,
  action: String, // 'form_created', 'response_submitted', 'form_shared'
  resourceId: String,
  metadata: Object,
  timestamp: Date
}

// Statistiques en temps réel
{
  _id: ObjectId,
  formId: String,
  date: Date,
  views: Number,
  submissions: Number,
  completionRate: Number,
  deviceStats: Object,
  locationStats: Object
}

// Cache de données
{
  _id: ObjectId,
  key: String,
  value: Object,
  expiresAt: Date
}
```

### Connexion API Frontend-Backend

**Configuration:**
```typescript
// lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Intercepteur pour l'authentification
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
```

**Gestion des erreurs:**
```typescript
// hooks/useApi.ts
export const useApi = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const request = async (config: AxiosRequestConfig) => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiClient(config)
      return response.data
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur de connexion')
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { request, loading, error }
}
```

### Nodemailer Configuration

**Setup:**
```typescript
// config/email.ts
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      html,
    })
  } catch (error) {
    console.error('Erreur envoi email:', error)
    throw error
  }
}
```

**Templates d'emails:**
```typescript
// services/emailService.ts
export const EmailTemplates = {
  newResponse: (formTitle: string, responseData: any) => ({
    subject: `Nouvelle réponse - ${formTitle}`,
    html: `
      <h2>Nouvelle réponse reçue</h2>
      <p>Formulaire: ${formTitle}</p>
      <p>Nom: ${responseData.respondentName}</p>
      <p>Email: ${responseData.respondentEmail}</p>
      <p>Date: ${new Date().toLocaleString('fr-FR')}</p>
    `
  }),

  weeklyReport: (stats: any) => ({
    subject: 'Rapport hebdomadaire - Simplon Form',
    html: `
      <h2>Rapport hebdomadaire</h2>
      <p>Formulaires créés: ${stats.formsCreated}</p>
      <p>Réponses reçues: ${stats.responsesReceived}</p>
      <p>Taux de complétion moyen: ${stats.avgCompletionRate}%</p>
    `
  })
}
```

## Installation

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
npm install
npm run dev
```

### Base de données
```bash
# MySQL
mysql -u root -p < database/schema.sql

# MongoDB
mongod --dbpath ./data
```

## Variables d'environnement

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Backend (.env)
```
DATABASE_URL=mysql://user:password@localhost:3306/simplon_form
MONGODB_URI=mongodb://localhost:27017/simplon_form_analytics
JWT_SECRET=your-secret-key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@simplonform.com
```

## Déploiement

### Production
- Frontend: Vercel ou Netlify
- Backend: DigitalOcean ou AWS
- MySQL: AWS RDS ou DigitalOcean Managed Database
- MongoDB: MongoDB Atlas

### Docker
```dockerfile
# Dockerfile pour le backend
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

.env backend
PORT=3001
MONGODB_URI=mongodb+srv://kouakouy898_db_user:q7EQ4jjjMtBQQW9h@cluster0.i0cliky.mongodb.net/simplonform?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=9f8a32b7c6e14d98a04c45f3f9f4b92c8e72d1ff45a7e63e09d2f143b0ae567c
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@simplonform.com
APP_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000


.env.local
NEXT_PUBLIC_API_URL=http://localhost:3001/api
