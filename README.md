# MonOPCO v3 - Plateforme de Gestion de Formations Professionnelles

**MonOPCO v3** est une plateforme moderne et intuitive conçue pour simplifier la gestion des dossiers OPCO (Opérateurs de Compétences), des documents administratifs et des communications professionnelles. Développée avec les technologies web les plus récentes, elle offre une expérience utilisateur fluide et des fonctionnalités avancées pour optimiser les processus de formation professionnelle.

---

## 🎯 Fonctionnalités Principales

MonOPCO v3 propose un ensemble complet de fonctionnalités pour gérer efficacement vos formations professionnelles :

### Gestion des Dossiers
La plateforme permet de créer, organiser et suivre des dossiers de formation avec un système de statuts (Brouillon, En cours, Terminé, Archivé). Chaque dossier dispose d'une page de détail complète affichant les documents associés, l'historique des emails et une timeline d'activité. Les utilisateurs peuvent facilement modifier les informations et exporter l'intégralité d'un dossier en PDF pour archivage ou transmission.

### Upload et Stockage de Documents
Le système intègre un gestionnaire de documents robuste permettant l'upload sécurisé de fichiers vers Supabase Storage. Les documents sont organisés par dossier avec métadonnées complètes (nom, taille, type, date). Un système de prévisualisation et de téléchargement facilite l'accès aux fichiers, tandis que la recherche et le filtrage permettent de retrouver rapidement n'importe quel document.

### Communication par Email
MonOPCO v3 inclut un système d'envoi d'emails professionnel intégré avec Resend API. Les utilisateurs peuvent créer et gérer des templates d'emails réutilisables avec placeholders automatiques ({{nom}}, {{prenom}}, {{email}}, {{entreprise}}). Le système conserve un historique complet de toutes les communications et permet de lier les emails aux dossiers correspondants.

### Intégration API Pappers
L'intégration avec l'API Pappers simplifie considérablement la saisie des informations d'entreprise. En entrant simplement un numéro SIRET (14 chiffres), le système récupère automatiquement le nom de l'entreprise, l'adresse du siège social, la forme juridique et le code NAF. Cette fonctionnalité est disponible dans le formulaire d'inscription et la page de profil utilisateur.

### Système de Notifications Multi-Canal
La plateforme dispose d'un système de notifications professionnel combinant plusieurs canaux. Les notifications toast (Sonner) fournissent un feedback immédiat pour toutes les actions. Le centre de notifications avec Supabase Realtime permet de suivre l'historique et de recevoir des alertes en temps réel. Les emails automatiques via Resend informent les utilisateurs des événements importants avec des templates HTML professionnels.

### Gestion du Profil Utilisateur
Chaque utilisateur peut personnaliser son profil avec upload d'avatar vers Supabase Storage, mise à jour des informations personnelles (prénom, nom, email) et des informations d'entreprise. Le système affiche des statistiques personnalisées (nombre de dossiers, documents, emails) et permet le changement de mot de passe sécurisé. Une section dédiée aux préférences de notifications offre un contrôle granulaire sur les canaux (toast, email, push) et les types de notifications.

---

## 🛠️ Technologies Utilisées

MonOPCO v3 s'appuie sur un stack technologique moderne et éprouvé garantissant performance, sécurité et maintenabilité.

### Frontend
Le frontend est construit avec **React 19** pour une interface utilisateur réactive et performante. **TypeScript** assure la sécurité des types et améliore la maintenabilité du code. **Tailwind CSS 4** permet un design moderne et responsive avec un système de design cohérent. La bibliothèque de composants **shadcn/ui** fournit des composants UI professionnels et accessibles. **Wouter** gère le routing côté client de manière légère et efficace. **tRPC** assure une communication type-safe entre le frontend et le backend. **TanStack Query (React Query)** optimise la gestion du cache et des requêtes. **Sonner** affiche des notifications toast élégantes et personnalisables.

### Backend
Le backend repose sur **Node.js 22** et **Express 4** pour un serveur web robuste et performant. **tRPC 11** crée des APIs type-safe sans code boilerplate. **Drizzle ORM** gère les interactions avec la base de données de manière type-safe. **Superjson** permet la sérialisation automatique des types complexes (Date, Map, Set). **Vitest** assure la qualité du code avec des tests unitaires et d'intégration.

### Base de Données et Stockage
**Supabase (PostgreSQL)** sert de base de données principale avec authentification intégrée. **Supabase Storage** stocke les fichiers (documents, avatars) de manière sécurisée. **Supabase Realtime** permet les notifications en temps réel via WebSockets.

### Services Externes
**Resend API** gère l'envoi d'emails professionnels avec templates HTML. **Pappers API** récupère automatiquement les informations d'entreprise via SIRET/SIREN. **Manus OAuth** assure l'authentification sécurisée des utilisateurs.

### Outils de Développement
**Vite** offre un bundling ultra-rapide et un HMR (Hot Module Replacement) instantané. **ESLint & Prettier** maintiennent la qualité et la cohérence du code. **pnpm** gère les dépendances de manière efficace. **tsx** permet l'exécution TypeScript en mode watch pour le développement.

---

## 📦 Installation

### Prérequis

Avant de commencer, assurez-vous d'avoir installé les outils suivants sur votre machine :

- **Node.js** version 22.x ou supérieure
- **pnpm** version 8.x ou supérieure (gestionnaire de paquets)
- **Git** pour cloner le repository
- Un compte **Supabase** (gratuit) pour la base de données et le stockage
- Une clé API **Resend** (plan gratuit disponible)
- Une clé API **Pappers** (optionnel, pour l'intégration SIRET)

### Étapes d'Installation

Clonez le repository depuis GitHub :

```bash
git clone https://github.com/lekesiz/MonOPCO-v3.git
cd MonOPCO-v3
```

Installez les dépendances avec pnpm :

```bash
pnpm install
```

Créez un fichier `.env` à la racine du projet en copiant le fichier d'exemple :

```bash
cp .env.example .env
```

Configurez les variables d'environnement dans le fichier `.env` :

```env
# Supabase
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-clé-anon
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres

# Resend API
RESEND_API_KEY=re_votre_clé_resend

# Pappers API (optionnel)
PAPPERS_API_KEY=votre_clé_pappers

# Manus OAuth (fourni automatiquement en production)
VITE_APP_ID=votre-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://auth.manus.im
JWT_SECRET=votre-secret-jwt

# Application
VITE_APP_TITLE=MonOPCO v3
VITE_APP_LOGO=/logo.svg
```

Créez les tables dans Supabase en exécutant les scripts SQL fournis dans le dossier racine :

```bash
# Dans Supabase SQL Editor, exécutez dans l'ordre :
# 1. create_email_templates.sql
# 2. create_notifications_table.sql
# 3. create_notification_preferences.sql
```

Activez Supabase Realtime pour les tables suivantes dans le dashboard Supabase (Database → Replication) :

- `documents`
- `emails`
- `notifications`

Lancez le serveur de développement :

```bash
pnpm dev
```

L'application sera accessible à l'adresse `http://localhost:3000`.

---

## 📁 Structure du Projet

La structure du projet suit une organisation claire et modulaire facilitant la maintenance et l'évolution du code.

```
MonOPCO-v3/
├── client/                      # Application frontend React
│   ├── public/                  # Fichiers statiques (logo, favicon)
│   └── src/
│       ├── components/          # Composants réutilisables
│       │   ├── ui/             # Composants shadcn/ui
│       │   ├── AIChatBox.tsx   # Chat AI intégré
│       │   ├── DashboardLayout.tsx  # Layout principal
│       │   ├── ErrorBoundary.tsx    # Gestion des erreurs
│       │   ├── Map.tsx         # Intégration Google Maps
│       │   └── NotificationCenter.tsx  # Centre de notifications
│       ├── contexts/           # Contextes React (Theme)
│       ├── hooks/              # Hooks personnalisés
│       │   ├── useAuth.ts      # Authentification
│       │   ├── useNotifications.ts  # Notifications
│       │   └── useSupabaseAuth.ts   # Auth Supabase
│       ├── lib/                # Utilitaires et configurations
│       │   ├── supabase.ts     # Client Supabase
│       │   ├── trpc.ts         # Client tRPC
│       │   └── pdfExport.ts    # Export PDF
│       ├── pages/              # Pages de l'application
│       │   ├── Home.tsx        # Page d'accueil
│       │   ├── Dashboard.tsx   # Tableau de bord
│       │   ├── Dossiers.tsx    # Gestion des dossiers
│       │   ├── DossierDetail.tsx  # Détail d'un dossier
│       │   ├── Documents.tsx   # Gestion des documents
│       │   ├── Emails.tsx      # Gestion des emails
│       │   ├── EmailTemplates.tsx  # Templates d'emails
│       │   ├── Profile.tsx     # Profil utilisateur
│       │   ├── Login.tsx       # Connexion
│       │   └── Register.tsx    # Inscription
│       ├── App.tsx             # Routeur principal
│       ├── main.tsx            # Point d'entrée
│       ├── index.css           # Styles globaux
│       └── const.ts            # Constantes partagées
│
├── server/                     # Application backend Node.js
│   ├── _core/                  # Infrastructure backend
│   │   ├── index.ts           # Serveur Express
│   │   ├── trpc.ts            # Configuration tRPC
│   │   ├── context.ts         # Contexte des requêtes
│   │   ├── cookies.ts         # Gestion des cookies
│   │   ├── env.ts             # Variables d'environnement
│   │   ├── llm.ts             # Intégration LLM
│   │   ├── imageGeneration.ts # Génération d'images
│   │   ├── voiceTranscription.ts  # Transcription audio
│   │   ├── map.ts             # Intégration Google Maps
│   │   ├── notification.ts    # Notifications propriétaire
│   │   └── systemRouter.ts    # Routes système
│   ├── db.ts                  # Helpers base de données
│   ├── routers.ts             # Routes tRPC principales
│   ├── pappers.ts             # Service API Pappers
│   ├── resend.ts              # Service API Resend
│   ├── notifications.ts       # Helpers notifications
│   ├── *.test.ts              # Tests unitaires
│   └── storage.ts             # Helpers Supabase Storage
│
├── drizzle/                    # Schéma et migrations DB
│   └── schema.ts              # Définition des tables
│
├── shared/                     # Code partagé frontend/backend
│   └── const.ts               # Constantes partagées
│
├── docs/                       # Documentation complète
│   ├── 00-TECHNICAL-SPECIFICATION.md
│   ├── 01-DATABASE-SCHEMA.md
│   ├── 02-NEW-FEATURES-GUIDE.md
│   ├── 03-ADVANCED-FEATURES-GUIDE.md
│   ├── 04-PAPPERS-API-INTEGRATION.md
│   └── 05-NOTIFICATION-SYSTEM.md
│
├── .env                        # Variables d'environnement (non versionné)
├── .gitignore                  # Fichiers ignorés par Git
├── package.json                # Dépendances et scripts
├── tsconfig.json               # Configuration TypeScript
├── vite.config.ts              # Configuration Vite
├── vitest.config.ts            # Configuration Vitest
└── README.md                   # Ce fichier
```

---

## 🚀 Scripts Disponibles

Le projet inclut plusieurs scripts npm pour faciliter le développement, les tests et le déploiement.

### Développement

```bash
pnpm dev
```

Lance le serveur de développement avec hot-reload. Le frontend est accessible sur `http://localhost:3000` et le backend sur le même port via le proxy Vite.

### Build de Production

```bash
pnpm build
```

Compile le projet pour la production. Les fichiers optimisés sont générés dans le dossier `dist/`.

### Tests

```bash
pnpm test
```

Exécute tous les tests unitaires et d'intégration avec Vitest. Les tests couvrent les endpoints tRPC, les services API (Resend, Pappers) et l'authentification.

```bash
pnpm test:watch
```

Lance les tests en mode watch pour le développement.

### Linting et Formatage

```bash
pnpm lint
```

Vérifie la qualité du code avec ESLint.

```bash
pnpm format
```

Formate automatiquement le code avec Prettier.

### Base de Données

```bash
pnpm db:push
```

Synchronise le schéma Drizzle avec la base de données Supabase. Équivalent à `drizzle-kit generate && drizzle-kit migrate`.

```bash
pnpm db:studio
```

Ouvre Drizzle Studio pour explorer et modifier la base de données visuellement.

---

## 📸 Captures d'Écran

### Page d'Accueil
![Page d'accueil MonOPCO v3](https://via.placeholder.com/800x450/6366f1/ffffff?text=Page+d%27Accueil)

*Interface moderne avec gradient violet/bleu présentant les fonctionnalités principales de la plateforme.*

### Tableau de Bord
![Dashboard MonOPCO v3](https://via.placeholder.com/800x450/6366f1/ffffff?text=Tableau+de+Bord)

*Vue d'ensemble avec statistiques, dossiers récents et centre de notifications.*

### Gestion des Dossiers
![Gestion des dossiers](https://via.placeholder.com/800x450/6366f1/ffffff?text=Gestion+des+Dossiers)

*Liste des dossiers avec filtrage, recherche et création rapide.*

### Détail d'un Dossier
![Détail dossier](https://via.placeholder.com/800x450/6366f1/ffffff?text=D%C3%A9tail+Dossier)

*Page complète avec onglets (Documents, Emails, Timeline) et export PDF.*

### Profil Utilisateur
![Profil utilisateur](https://via.placeholder.com/800x450/6366f1/ffffff?text=Profil+Utilisateur)

*Gestion du profil avec avatar, informations personnelles et préférences de notifications.*

---

## 🔐 Sécurité

MonOPCO v3 implémente plusieurs couches de sécurité pour protéger les données des utilisateurs et garantir la confidentialité des informations.

### Authentification
L'authentification repose sur Manus OAuth avec sessions sécurisées via cookies HTTP-only. Les tokens JWT sont signés avec un secret robuste et ont une durée de vie limitée. Le système supporte plusieurs méthodes de connexion (email/mot de passe, OAuth providers) et inclut la réinitialisation sécurisée du mot de passe.

### Autorisation
Chaque endpoint tRPC vérifie l'authentification de l'utilisateur via `protectedProcedure`. Les utilisateurs ne peuvent accéder qu'à leurs propres données (isolation par `user_id`). Un système de rôles (admin/user) permet de restreindre l'accès à certaines fonctionnalités. Les requêtes Supabase utilisent Row Level Security (RLS) pour une protection au niveau base de données.

### Protection des Données
Toutes les communications utilisent HTTPS en production. Les mots de passe sont hashés avec bcrypt avant stockage. Les clés API (Resend, Pappers) sont stockées côté serveur uniquement et jamais exposées au frontend. Les uploads de fichiers sont validés (type, taille) avant acceptation. Les données sensibles sont chiffrées au repos dans Supabase.

### Bonnes Pratiques
Le projet suit les recommandations OWASP pour la sécurité des applications web. Les dépendances sont régulièrement mises à jour pour corriger les vulnérabilités. Les logs n'incluent jamais de données sensibles (mots de passe, tokens). Un système de rate limiting protège contre les abus d'API. Les erreurs retournées au client ne révèlent pas d'informations système.

---

## 🌐 Déploiement

### Déploiement sur Manus

MonOPCO v3 est optimisé pour un déploiement sur la plateforme Manus qui gère automatiquement l'infrastructure.

1. Créez un checkpoint dans l'interface Manus après avoir terminé vos modifications
2. Cliquez sur le bouton "Publish" en haut à droite du Management UI
3. Configurez votre domaine personnalisé dans Settings → Domains
4. Le déploiement est automatique avec SSL/HTTPS configuré

### Déploiement Manuel

Pour déployer sur votre propre infrastructure, suivez ces étapes :

**Prérequis serveur :**
- Node.js 22.x ou supérieur
- PostgreSQL 14+ ou accès à Supabase
- Reverse proxy (Nginx, Caddy) pour HTTPS
- PM2 ou équivalent pour la gestion des processus

**Configuration :**

```bash
# 1. Cloner le projet
git clone https://github.com/lekesiz/MonOPCO-v3.git
cd MonOPCO-v3

# 2. Installer les dépendances
pnpm install

# 3. Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos valeurs de production

# 4. Build de production
pnpm build

# 5. Lancer avec PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

**Configuration Nginx :**

```nginx
server {
    listen 80;
    server_name monopco.fr www.monopco.fr;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name monopco.fr www.monopco.fr;

    ssl_certificate /etc/letsencrypt/live/monopco.fr/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/monopco.fr/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Variables d'Environnement de Production

Assurez-vous de configurer correctement toutes les variables d'environnement en production :

```env
NODE_ENV=production
DATABASE_URL=postgresql://...  # URL de production
VITE_SUPABASE_URL=https://...
VITE_SUPABASE_ANON_KEY=...
RESEND_API_KEY=re_...
PAPPERS_API_KEY=...
JWT_SECRET=... # Générer un secret fort
VITE_APP_TITLE=MonOPCO v3
```

---

## 🤝 Contribution

Les contributions sont les bienvenues ! Si vous souhaitez améliorer MonOPCO v3, suivez ces étapes :

1. **Forkez le projet** sur GitHub
2. **Créez une branche** pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. **Committez vos changements** (`git commit -m 'Add some AmazingFeature'`)
4. **Poussez vers la branche** (`git push origin feature/AmazingFeature`)
5. **Ouvrez une Pull Request** avec une description détaillée

### Guidelines de Contribution

- Suivez les conventions de code existantes (ESLint, Prettier)
- Ajoutez des tests pour les nouvelles fonctionnalités
- Mettez à jour la documentation si nécessaire
- Assurez-vous que tous les tests passent (`pnpm test`)
- Écrivez des messages de commit clairs et descriptifs

---

## 📄 License

Ce projet est sous licence **MIT**. Vous êtes libre de l'utiliser, le modifier et le distribuer selon les termes de cette licence.

```
MIT License

Copyright (c) 2025 MonOPCO

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 📞 Support et Contact

Pour toute question, suggestion ou problème, vous pouvez :

- **Ouvrir une issue** sur GitHub : https://github.com/lekesiz/MonOPCO-v3/issues
- **Consulter la documentation** dans le dossier `/docs`
- **Contacter l'équipe** via email : support@monopco.fr

---

## 🙏 Remerciements

MonOPCO v3 a été développé avec le soutien de :

- **Manus AI** pour la plateforme de développement et d'hébergement
- **Supabase** pour la base de données et le stockage
- **Resend** pour le service d'envoi d'emails
- **Pappers** pour l'API d'informations d'entreprise
- La communauté **open-source** pour les bibliothèques et outils utilisés

---

**Développé avec ❤️ par l'équipe MonOPCO**

*Dernière mise à jour : 26 novembre 2025*
