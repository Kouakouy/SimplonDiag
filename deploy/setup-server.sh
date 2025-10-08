#!/bin/bash

# Script de configuration du serveur VPS pour Simplon Form
# À exécuter en tant que root ou avec sudo

echo "🚀 Configuration du serveur VPS pour Simplon Form..."

# Mise à jour du système
apt update && apt upgrade -y

# Installation des dépendances de base
apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release

# Installation de Node.js 18 LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Installation de PM2 pour la gestion des processus
npm install -g pm2

# Installation de Nginx
apt install -y nginx

# Installation de UFW (firewall)
apt install -y ufw

# Configuration du firewall
ufw allow ssh
ufw allow 80
ufw allow 443
ufw --force enable

# Installation de Certbot pour SSL
apt install -y certbot python3-certbot-nginx

# Création de l'utilisateur pour l'application
useradd -m -s /bin/bash simplonform
usermod -aG sudo simplonform

# Création des répertoires
mkdir -p /var/www/simplonform
mkdir -p /var/log/simplonform
chown -R simplonform:simplonform /var/www/simplonform
chown -R simplonform:simplonform /var/log/simplonform

echo "✅ Configuration du serveur terminée !"
echo "📝 Prochaines étapes :"
echo "1. Cloner le repository dans /var/www/simplonform"
echo "2. Configurer les variables d'environnement"
echo "3. Installer les dépendances et construire l'application"
echo "4. Configurer Nginx"
echo "5. Démarrer les services"
