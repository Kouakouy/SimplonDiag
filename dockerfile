# Étape 1 : Build
FROM node:20-alpine AS builder

# Définir le dossier de travail
WORKDIR /app

# Copier package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances
RUN npm ci

# Copier tout le code
COPY . .

# Builder l'application Next.js pour la production
RUN npm run build

# Étape 2 : Production
FROM node:20-alpine AS runner

# Créer un dossier pour l'app
WORKDIR /app

# Installer seulement les dépendances nécessaires pour production
COPY package*.json ./
RUN npm ci --omit=dev

# Copier les fichiers build depuis l'étape builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/node_modules ./node_modules

# Définir la variable d'environnement
ENV NODE_ENV=production
ENV PORT=3008

# Exposer le port
EXPOSE 3008

# Lancer l'application
CMD ["npm", "start"]
