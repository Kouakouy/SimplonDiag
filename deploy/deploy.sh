#!/bin/bash

# Script de déploiement pour Simplon Form
# Usage: ./deploy.sh [production|staging]

set -e

ENVIRONMENT=${1:-production}
DOMAIN=${2:-"votre-domaine.com"}
EMAIL=${3:-"admin@votre-domaine.com"}

echo "🚀 Déploiement de Simplon Form en mode $ENVIRONMENT"
echo "🌐 Domaine: $DOMAIN"
echo "📧 Email: $EMAIL"

# Vérifier si Docker est installé
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé. Installation..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    usermod -aG docker $USER
    rm get-docker.sh
fi

# Vérifier si Docker Compose est installé
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose n'est pas installé. Installation..."
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

# Créer le fichier .env si il n'existe pas
if [ ! -f .env ]; then
    echo "📝 Création du fichier .env..."
    cat > .env << EOF
# Configuration de production
MONGODB_URI=mongodb+srv://kouakouy898_db_user:q7EQ4jjjMtBQQW9h@cluster0.i0cliky.mongodb.net/simplonform?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=9f8a32b7c6e14d98a04c45f3f9f4b92c8e72d1ff45a7e63e09d2f143b0ae567c
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@simplonform.com
EOF
    echo "⚠️  Veuillez configurer les variables SMTP dans le fichier .env"
fi

# Mettre à jour la configuration Nginx avec le domaine
sed -i "s/votre-domaine.com/$DOMAIN/g" nginx.conf
sed -i "s/votre-domaine.com/$DOMAIN/g" docker-compose.yml

# Construire et démarrer les conteneurs
echo "🔨 Construction des images Docker..."
docker-compose build --no-cache

echo "🚀 Démarrage des services..."
docker-compose up -d

# Attendre que les services soient prêts
echo "⏳ Attente du démarrage des services..."
sleep 30

# Vérifier le statut des conteneurs
echo "📊 Statut des conteneurs:"
docker-compose ps

# Configuration SSL avec Let's Encrypt
echo "🔒 Configuration SSL..."
if [ ! -d "./ssl" ]; then
    mkdir -p ./ssl
fi

# Obtenir le certificat SSL
certbot certonly --webroot -w /var/www/certbot -d $DOMAIN -d www.$DOMAIN --email $EMAIL --agree-tos --non-interactive || {
    echo "⚠️  Impossible d'obtenir le certificat SSL automatiquement"
    echo "📝 Vous devrez configurer SSL manuellement"
}

# Copier les certificats dans le répertoire ssl
if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
    cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem ./ssl/
    cp /etc/letsencrypt/live/$DOMAIN/privkey.pem ./ssl/
    echo "✅ Certificats SSL copiés"
fi

# Redémarrer Nginx avec SSL
docker-compose restart nginx

# Configuration du renouvellement automatique des certificats
echo "🔄 Configuration du renouvellement automatique des certificats..."
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet && docker-compose restart nginx") | crontab -

echo "✅ Déploiement terminé !"
echo "🌐 Votre application est accessible sur: https://$DOMAIN"
echo "📊 Pour voir les logs: docker-compose logs -f"
echo "🛠️  Pour arrêter: docker-compose down"
