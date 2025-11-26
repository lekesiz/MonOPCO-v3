# Guide de Déploiement - MonOPCO v3

Ce document fournit des instructions détaillées pour déployer MonOPCO v3 en production, que ce soit sur la plateforme Manus ou sur votre propre infrastructure.

---

## Déploiement sur Manus (Recommandé)

La plateforme Manus offre le déploiement le plus simple avec gestion automatique de l'infrastructure, SSL/HTTPS, et scaling.

### Étapes de Déploiement

Le processus de déploiement sur Manus suit un workflow simple et intuitif. Après avoir terminé vos modifications dans le projet, la première étape consiste à créer un checkpoint. Dans l'interface Manus, utilisez la fonction `webdev_save_checkpoint` ou cliquez sur "Save Checkpoint" dans le Management UI. Ce checkpoint capture l'état complet de votre projet à un instant T, incluant le code, les dépendances et la configuration.

Une fois le checkpoint créé, accédez au Management UI en cliquant sur l'icône en haut à droite de l'interface de chat. Dans le header du Management UI, vous trouverez le bouton "Publish". Ce bouton n'est activé que si un checkpoint existe. Cliquez dessus pour lancer le processus de déploiement automatique.

Le système Manus va alors compiler votre projet, optimiser les assets, configurer automatiquement le SSL/HTTPS via Let's Encrypt, et déployer l'application sur l'infrastructure cloud. Le processus prend généralement entre 2 et 5 minutes selon la taille du projet.

### Configuration du Domaine

Par défaut, votre application sera accessible via un sous-domaine Manus au format `votre-projet.manus.space`. Pour utiliser votre propre domaine personnalisé, naviguez dans le Management UI vers Settings → Domains. Cliquez sur "Add Custom Domain" et entrez votre nom de domaine (par exemple `monopco.fr`).

Manus vous fournira alors les enregistrements DNS à configurer chez votre registrar. Pour un domaine racine, vous devrez généralement créer un enregistrement A pointant vers l'adresse IP fournie, ou un enregistrement CNAME si votre registrar le supporte. Pour un sous-domaine comme `app.monopco.fr`, un simple enregistrement CNAME suffit.

La propagation DNS peut prendre de quelques minutes à 48 heures selon votre registrar. Une fois la propagation terminée, Manus configurera automatiquement le certificat SSL pour votre domaine personnalisé.

### Gestion des Secrets

Les secrets (clés API, tokens) sont gérés de manière sécurisée dans Manus. Pour ajouter de nouveaux secrets, utilisez la fonction `webdev_request_secrets` qui créera une carte d'input dans l'interface utilisateur. Les secrets existants peuvent être consultés et modifiés dans Settings → Secrets du Management UI.

Les secrets sont automatiquement injectés dans les variables d'environnement de votre application déployée. Ils ne sont jamais exposés dans le code source ou les logs. Pour MonOPCO v3, assurez-vous que les secrets suivants sont configurés : `RESEND_API_KEY`, `PAPPERS_API_KEY`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `DATABASE_URL`, et `JWT_SECRET`.

### Rollback et Versions

Chaque checkpoint créé représente une version déployable de votre application. Si vous rencontrez un problème après un déploiement, vous pouvez facilement revenir à une version antérieure. Dans le Management UI, accédez à la liste des checkpoints. Chaque checkpoint affiche une capture d'écran et une description. Cliquez sur le bouton "Rollback" à côté du checkpoint souhaité pour restaurer cette version en production.

Le rollback est instantané et ne nécessite aucune intervention manuelle. L'application revient exactement à l'état capturé dans le checkpoint sélectionné.

---

## Déploiement Manuel sur VPS

Si vous préférez héberger MonOPCO v3 sur votre propre infrastructure, suivez ces instructions détaillées.

### Prérequis Serveur

Votre serveur doit répondre aux exigences minimales suivantes pour garantir des performances optimales. Un serveur Linux (Ubuntu 22.04 LTS ou Debian 11+) est recommandé pour sa stabilité et son support à long terme. Le processeur doit disposer d'au moins 2 vCPUs pour gérer les requêtes concurrentes efficacement. La mémoire RAM minimale est de 2 Go, mais 4 Go sont recommandés pour un environnement de production avec plusieurs utilisateurs simultanés. L'espace disque requis est d'au moins 20 Go pour l'application, les logs et la croissance future.

Node.js version 22.x ou supérieure est nécessaire pour exécuter l'application. PostgreSQL 14+ peut être installé localement ou vous pouvez utiliser Supabase en mode cloud. Un reverse proxy comme Nginx ou Caddy est indispensable pour gérer le SSL/HTTPS et servir les fichiers statiques efficacement. Enfin, un gestionnaire de processus comme PM2 ou systemd assure que l'application redémarre automatiquement en cas de crash ou de redémarrage serveur.

### Installation Initiale

Commencez par vous connecter à votre serveur via SSH et mettez à jour le système. Sur Ubuntu, exécutez `sudo apt update && sudo apt upgrade -y`. Installez ensuite Node.js 22 en utilisant NodeSource : `curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -` suivi de `sudo apt install -y nodejs`.

Installez pnpm globalement avec `sudo npm install -g pnpm`. Si vous souhaitez utiliser PostgreSQL en local plutôt que Supabase, installez-le avec `sudo apt install -y postgresql postgresql-contrib`. Installez également Nginx pour le reverse proxy : `sudo apt install -y nginx`.

Créez un utilisateur dédié pour l'application afin de renforcer la sécurité : `sudo adduser monopco`. Passez ensuite à cet utilisateur avec `sudo su - monopco` et clonez le repository : `git clone https://github.com/lekesiz/MonOPCO-v3.git && cd MonOPCO-v3`.

### Configuration de l'Application

Installez les dépendances du projet avec `pnpm install`. Créez le fichier de configuration d'environnement en copiant le template : `cp .env.example .env`. Éditez ce fichier avec vos valeurs de production en utilisant `nano .env` ou votre éditeur préféré.

Les variables d'environnement critiques à configurer sont `NODE_ENV=production`, `DATABASE_URL` pointant vers votre base PostgreSQL ou Supabase, `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` pour l'authentification, `RESEND_API_KEY` pour l'envoi d'emails, `PAPPERS_API_KEY` pour la recherche SIRET, et `JWT_SECRET` qui doit être une chaîne aléatoire forte générée avec `openssl rand -base64 32`.

Compilez l'application pour la production avec `pnpm build`. Cette commande génère les fichiers optimisés dans le dossier `dist/`.

### Configuration de PostgreSQL (si local)

Si vous utilisez PostgreSQL en local plutôt que Supabase, créez une base de données dédiée. Connectez-vous à PostgreSQL avec `sudo -u postgres psql` et exécutez les commandes SQL suivantes :

```sql
CREATE DATABASE monopco;
CREATE USER monopco_user WITH ENCRYPTED PASSWORD 'votre_mot_de_passe_fort';
GRANT ALL PRIVILEGES ON DATABASE monopco TO monopco_user;
\q
```

Mettez à jour la variable `DATABASE_URL` dans votre fichier `.env` avec la chaîne de connexion : `postgresql://monopco_user:votre_mot_de_passe_fort@localhost:5432/monopco`.

Exécutez les scripts de migration pour créer les tables nécessaires. Vous pouvez utiliser Drizzle Kit avec `pnpm db:push` ou exécuter manuellement les scripts SQL fournis dans le dossier racine du projet.

### Configuration de PM2

PM2 est un gestionnaire de processus robuste qui maintient votre application en ligne 24/7. Installez PM2 globalement avec `sudo npm install -g pm2`. Créez un fichier de configuration PM2 nommé `ecosystem.config.js` à la racine du projet :

```javascript
module.exports = {
  apps: [{
    name: 'monopco-v3',
    script: 'node_modules/.bin/tsx',
    args: 'server/_core/index.ts',
    cwd: '/home/monopco/MonOPCO-v3',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    max_memory_restart: '500M'
  }]
};
```

Créez le dossier de logs avec `mkdir -p logs`. Démarrez l'application avec `pm2 start ecosystem.config.js`. Vérifiez que l'application tourne correctement avec `pm2 status` et `pm2 logs monopco-v3`.

Pour que PM2 redémarre automatiquement au démarrage du serveur, exécutez `pm2 startup` et suivez les instructions affichées (généralement une commande sudo à copier-coller). Ensuite, sauvegardez la configuration actuelle avec `pm2 save`.

### Configuration de Nginx

Nginx sert de reverse proxy entre Internet et votre application Node.js. Il gère également le SSL/HTTPS et peut servir les fichiers statiques directement pour de meilleures performances.

Créez un fichier de configuration Nginx pour votre site avec `sudo nano /etc/nginx/sites-available/monopco`. Copiez-y la configuration suivante en adaptant le nom de domaine :

```nginx
# Redirection HTTP vers HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name monopco.fr www.monopco.fr;
    
    # Redirection permanente vers HTTPS
    return 301 https://$server_name$request_uri;
}

# Configuration HTTPS
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name monopco.fr www.monopco.fr;

    # Certificats SSL (à configurer avec Certbot)
    ssl_certificate /etc/letsencrypt/live/monopco.fr/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/monopco.fr/privkey.pem;
    
    # Configuration SSL moderne
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Headers de sécurité
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Taille maximale des uploads
    client_max_body_size 10M;

    # Logs
    access_log /var/log/nginx/monopco_access.log;
    error_log /var/log/nginx/monopco_error.log;

    # Proxy vers l'application Node.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        
        # Headers pour WebSocket (Supabase Realtime)
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        
        # Headers standards
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Pas de cache pour les requêtes dynamiques
        proxy_cache_bypass $http_upgrade;
    }

    # Cache pour les assets statiques
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Activez le site en créant un lien symbolique : `sudo ln -s /etc/nginx/sites-available/monopco /etc/nginx/sites-enabled/`. Testez la configuration Nginx avec `sudo nginx -t`. Si le test réussit, rechargez Nginx avec `sudo systemctl reload nginx`.

### Configuration SSL avec Let's Encrypt

Let's Encrypt fournit des certificats SSL gratuits et automatiquement renouvelables. Installez Certbot avec `sudo apt install -y certbot python3-certbot-nginx`. Obtenez un certificat pour votre domaine avec `sudo certbot --nginx -d monopco.fr -d www.monopco.fr`.

Suivez les instructions interactives de Certbot. Il configurera automatiquement Nginx pour utiliser HTTPS. Le renouvellement automatique est configuré par défaut via un cron job. Vous pouvez tester le renouvellement avec `sudo certbot renew --dry-run`.

### Firewall et Sécurité

Configurez le firewall UFW pour n'autoriser que les ports nécessaires. Activez UFW avec `sudo ufw enable`. Autorisez SSH pour ne pas vous bloquer : `sudo ufw allow OpenSSH`. Autorisez HTTP et HTTPS : `sudo ufw allow 'Nginx Full'`. Vérifiez le statut avec `sudo ufw status`.

Pour renforcer la sécurité, désactivez l'authentification par mot de passe SSH et utilisez uniquement les clés SSH. Configurez fail2ban pour bloquer les tentatives de connexion malveillantes : `sudo apt install -y fail2ban`. Maintenez le système à jour régulièrement avec `sudo apt update && sudo apt upgrade`.

### Monitoring et Logs

Surveillez les logs de l'application avec `pm2 logs monopco-v3`. Les logs Nginx sont disponibles dans `/var/log/nginx/`. Pour un monitoring avancé, installez des outils comme Netdata (`bash <(curl -Ss https://my-netdata.io/kickstart.sh)`) ou configurez des alertes avec PM2 Plus.

Configurez la rotation des logs pour éviter qu'ils ne remplissent le disque. PM2 gère automatiquement la rotation de ses logs. Pour Nginx, logrotate est généralement déjà configuré par défaut.

---

## Déploiement avec Docker

Docker offre une alternative portable et reproductible pour déployer MonOPCO v3.

### Dockerfile

Créez un fichier `Dockerfile` à la racine du projet :

```dockerfile
FROM node:22-alpine AS builder

# Installation de pnpm
RUN npm install -g pnpm

# Répertoire de travail
WORKDIR /app

# Copie des fichiers de dépendances
COPY package.json pnpm-lock.yaml ./

# Installation des dépendances
RUN pnpm install --frozen-lockfile

# Copie du code source
COPY . .

# Build de production
RUN pnpm build

# Image de production
FROM node:22-alpine

# Installation de pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copie des dépendances de production uniquement
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile

# Copie des fichiers buildés
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/shared ./shared

# Exposition du port
EXPOSE 3000

# Variables d'environnement par défaut
ENV NODE_ENV=production
ENV PORT=3000

# Démarrage de l'application
CMD ["pnpm", "start"]
```

### Docker Compose

Créez un fichier `docker-compose.yml` pour orchestrer l'application et ses dépendances :

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
      - VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}
      - RESEND_API_KEY=${RESEND_API_KEY}
      - PAPPERS_API_KEY=${PAPPERS_API_KEY}
      - JWT_SECRET=${JWT_SECRET}
    volumes:
      - ./logs:/app/logs
    restart: unless-stopped
    depends_on:
      - postgres

  postgres:
    image: postgres:14-alpine
    environment:
      - POSTGRES_DB=monopco
      - POSTGRES_USER=monopco_user
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - app
    restart: unless-stopped

volumes:
  postgres_data:
```

Créez un fichier `.env` avec vos variables d'environnement et démarrez les services avec `docker-compose up -d`. Les logs sont accessibles via `docker-compose logs -f app`.

---

## Checklist de Déploiement

Avant de mettre en production, vérifiez les points suivants :

**Configuration**
- [ ] Toutes les variables d'environnement sont configurées correctement
- [ ] `NODE_ENV=production` est défini
- [ ] `JWT_SECRET` est une chaîne forte et unique
- [ ] Les clés API (Resend, Pappers) sont valides et fonctionnelles
- [ ] La connexion à la base de données fonctionne

**Base de Données**
- [ ] Toutes les tables sont créées (dossiers, documents, emails, notifications, etc.)
- [ ] Les scripts SQL ont été exécutés (email_templates, notifications_table, notification_preferences)
- [ ] Supabase Realtime est activé pour les tables nécessaires (documents, emails, notifications)
- [ ] Row Level Security (RLS) est configuré si nécessaire

**Sécurité**
- [ ] SSL/HTTPS est configuré et fonctionne
- [ ] Les certificats SSL sont valides et renouvelables automatiquement
- [ ] Le firewall autorise uniquement les ports nécessaires (22, 80, 443)
- [ ] Les secrets ne sont jamais exposés dans le code ou les logs
- [ ] Les headers de sécurité sont configurés (HSTS, X-Frame-Options, etc.)

**Performance**
- [ ] Les assets statiques sont servis avec cache long (1 an)
- [ ] Gzip/Brotli est activé pour la compression
- [ ] Les images sont optimisées
- [ ] Le build de production est optimisé (minification, tree-shaking)

**Monitoring**
- [ ] Les logs sont configurés et rotationnés
- [ ] Un système de monitoring est en place (PM2, Netdata, etc.)
- [ ] Les alertes sont configurées pour les erreurs critiques
- [ ] Les backups de la base de données sont automatisés

**Tests**
- [ ] Tous les tests unitaires passent (`pnpm test`)
- [ ] L'application démarre sans erreur
- [ ] Les fonctionnalités principales ont été testées manuellement
- [ ] Les emails de test sont reçus correctement
- [ ] L'authentification fonctionne
- [ ] Les uploads de fichiers fonctionnent

**Documentation**
- [ ] Le README.md est à jour
- [ ] La documentation dans /docs est complète
- [ ] Les variables d'environnement sont documentées
- [ ] Les procédures de rollback sont documentées

---

## Maintenance et Mises à Jour

### Mises à Jour de l'Application

Pour mettre à jour l'application en production, suivez ce processus :

1. **Testez en local** : Assurez-vous que toutes les modifications fonctionnent correctement en développement
2. **Créez un checkpoint** (sur Manus) ou un tag Git : `git tag -a v1.2.0 -m "Version 1.2.0" && git push origin v1.2.0`
3. **Déployez** : Sur Manus, cliquez sur "Publish". Sur VPS, exécutez :
   ```bash
   cd /home/monopco/MonOPCO-v3
   git pull origin main
   pnpm install
   pnpm build
   pm2 restart monopco-v3
   ```
4. **Vérifiez** : Consultez les logs avec `pm2 logs monopco-v3` et testez les fonctionnalités critiques

### Backups

Configurez des backups automatiques de la base de données. Pour PostgreSQL local, créez un script de backup :

```bash
#!/bin/bash
BACKUP_DIR="/home/monopco/backups"
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -U monopco_user monopco > "$BACKUP_DIR/monopco_$DATE.sql"
# Garder seulement les 30 derniers backups
find "$BACKUP_DIR" -name "monopco_*.sql" -mtime +30 -delete
```

Ajoutez ce script au crontab pour l'exécuter quotidiennement : `0 2 * * * /home/monopco/backup.sh`.

Pour Supabase, utilisez la fonctionnalité de backup automatique intégrée dans le dashboard.

### Monitoring des Performances

Surveillez régulièrement les métriques suivantes :
- **Utilisation CPU et RAM** : Ne devrait pas dépasser 80% en moyenne
- **Temps de réponse** : Doit rester sous 500ms pour les requêtes API
- **Taux d'erreur** : Doit être inférieur à 1%
- **Espace disque** : Maintenir au moins 20% d'espace libre

Utilisez des outils comme PM2 Plus, Netdata ou Grafana pour visualiser ces métriques.

---

## Dépannage

### L'application ne démarre pas

Vérifiez les logs avec `pm2 logs monopco-v3` ou `docker-compose logs app`. Les erreurs courantes incluent :
- Variables d'environnement manquantes ou incorrectes
- Connexion à la base de données impossible (vérifiez `DATABASE_URL`)
- Port 3000 déjà utilisé (changez le port dans la configuration)
- Permissions insuffisantes sur les fichiers

### Erreurs 502 Bad Gateway

Cela indique généralement que Nginx ne peut pas se connecter à l'application Node.js. Vérifiez que :
- L'application tourne bien : `pm2 status`
- Le port est correct dans la configuration Nginx (3000 par défaut)
- Le firewall n'est pas trop restrictif

### Les emails ne sont pas envoyés

Vérifiez que :
- La clé API Resend est correcte et valide
- Le domaine d'envoi est vérifié dans Resend
- Les logs ne montrent pas d'erreurs liées à Resend
- Le rate limit n'est pas atteint (2 req/sec pour Resend)

### Les notifications Realtime ne fonctionnent pas

Assurez-vous que :
- Supabase Realtime est activé pour les tables concernées
- Les WebSockets passent correctement à travers Nginx (headers `Upgrade` et `Connection`)
- Le client Supabase est correctement configuré avec les bonnes clés

---

**Date de mise à jour** : 26 novembre 2025  
**Version** : 1.0.0
