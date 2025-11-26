# Guide de Développement - MonOPCO v3

Ce document fournit toutes les informations nécessaires pour contribuer au développement de MonOPCO v3, comprendre l'architecture du projet et suivre les meilleures pratiques.

---

## Architecture du Projet

MonOPCO v3 suit une architecture moderne full-stack TypeScript avec séparation claire entre le frontend et le backend.

### Stack Technologique

Le projet repose sur un stack carefully chosen pour garantir performance, maintenabilité et expérience développeur optimale. Le frontend utilise React 19 avec TypeScript pour une interface utilisateur type-safe et performante. Tailwind CSS 4 assure un design cohérent et responsive sans CSS custom excessif. La bibliothèque shadcn/ui fournit des composants UI accessibles et personnalisables. Wouter gère le routing côté client de manière légère (seulement 1.2KB gzippé).

Le backend s'appuie sur Node.js 22 et Express 4 pour un serveur robuste. tRPC 11 crée une couche API type-safe end-to-end sans code boilerplate. Drizzle ORM gère les interactions avec PostgreSQL de manière type-safe avec excellent support TypeScript. Superjson permet la sérialisation automatique des types complexes (Date, Map, Set) entre client et serveur.

La base de données Supabase (PostgreSQL) offre authentification intégrée, stockage de fichiers et Realtime via WebSockets. Les services externes incluent Resend pour les emails professionnels et Pappers pour les données d'entreprise.

### Flux de Données

Le flux de données dans MonOPCO v3 suit un pattern unidirectionnel clair. L'utilisateur interagit avec l'interface React qui déclenche des actions. Ces actions appellent des hooks tRPC (`useQuery` ou `useMutation`) qui communiquent avec le backend via HTTP. Le serveur tRPC exécute la logique métier, valide les données avec Zod et interagit avec la base de données via Drizzle ORM. Les résultats remontent au frontend où TanStack Query gère le cache et les mises à jour de l'UI.

Pour les notifications en temps réel, Supabase Realtime écoute les changements dans la base de données (INSERT, UPDATE, DELETE) et notifie instantanément le frontend via WebSocket. Le composant `NotificationCenter` reçoit ces événements et met à jour l'UI sans rechargement de page.

### Structure des Dossiers

Le projet est organisé en modules logiques facilitant la navigation et la maintenance. Le dossier `client/` contient tout le code frontend React. `client/src/components/` héberge les composants réutilisables, avec `client/src/components/ui/` pour les composants shadcn/ui. `client/src/pages/` contient les pages de l'application (une page = une route). `client/src/hooks/` regroupe les hooks personnalisés comme `useAuth` et `useNotifications`. `client/src/lib/` contient les utilitaires et configurations (Supabase, tRPC, PDF export).

Le dossier `server/` contient tout le code backend Node.js. `server/_core/` héberge l'infrastructure (Express, tRPC, OAuth, LLM, etc.). `server/routers.ts` définit tous les endpoints tRPC de l'application. `server/db.ts` contient les helpers de base de données réutilisables. `server/*.ts` regroupe les services externes (Resend, Pappers, notifications).

Le dossier `drizzle/` contient le schéma de base de données et les migrations. `shared/` héberge le code partagé entre frontend et backend (constantes, types). `docs/` contient toute la documentation du projet.

---

## Configuration de l'Environnement de Développement

### Installation Initiale

Clonez le repository et installez les dépendances :

```bash
git clone https://github.com/lekesiz/MonOPCO-v3.git
cd MonOPCO-v3
pnpm install
```

Créez un fichier `.env` en copiant le template :

```bash
cp .env.example .env
```

Configurez les variables d'environnement minimales pour le développement :

```env
# Supabase (créez un projet gratuit sur supabase.com)
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-clé-anon
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres

# Resend (créez un compte gratuit sur resend.com)
RESEND_API_KEY=re_votre_clé

# Pappers (optionnel, créez un compte sur pappers.fr)
PAPPERS_API_KEY=votre_clé

# Manus OAuth (fourni automatiquement en production)
VITE_APP_ID=dev-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://auth.manus.im
JWT_SECRET=dev-secret-change-in-production

# Application
VITE_APP_TITLE=MonOPCO v3 Dev
VITE_APP_LOGO=/logo.svg
```

Créez les tables dans Supabase en exécutant les scripts SQL fournis dans le dossier racine via le SQL Editor de Supabase.

Lancez le serveur de développement :

```bash
pnpm dev
```

L'application sera accessible à `http://localhost:3000` avec hot-reload activé.

### Outils Recommandés

Pour une expérience de développement optimale, installez les outils suivants :

**Visual Studio Code** est l'éditeur recommandé avec les extensions suivantes :
- **ESLint** : Linting en temps réel
- **Prettier** : Formatage automatique du code
- **Tailwind CSS IntelliSense** : Autocomplétion pour Tailwind
- **TypeScript Vue Plugin (Volar)** : Support TypeScript amélioré
- **Error Lens** : Affichage inline des erreurs
- **GitLens** : Informations Git enrichies

**Navigateur** : Chrome ou Firefox avec les extensions :
- **React Developer Tools** : Inspection des composants React
- **Redux DevTools** : Inspection du state (TanStack Query)

**Terminal** : iTerm2 (macOS), Windows Terminal (Windows) ou Terminator (Linux) pour un meilleur confort.

### Configuration VS Code

Créez un fichier `.vscode/settings.json` à la racine du projet :

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"],
    ["cn\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ]
}
```

---

## Développement Frontend

### Création d'une Nouvelle Page

Pour créer une nouvelle page dans l'application, suivez ces étapes :

1. **Créez le fichier de page** dans `client/src/pages/NomPage.tsx` :

```tsx
import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { trpc } from '@/lib/trpc';

export default function NomPage() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, loading: authLoading } = useSupabaseAuth();

  // Redirection si non authentifié
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation('/login');
    }
  }, [authLoading, isAuthenticated, setLocation]);

  // Chargement des données via tRPC
  const { data, isLoading } = trpc.nomEndpoint.useQuery();

  if (authLoading || isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Titre de la Page</h1>
      <Card>
        <CardHeader>
          <CardTitle>Contenu</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Votre contenu ici */}
        </CardContent>
      </Card>
    </div>
  );
}
```

2. **Ajoutez la route** dans `client/src/App.tsx` :

```tsx
import NomPage from './pages/NomPage';

function Router() {
  return (
    <Switch>
      {/* Routes existantes */}
      <Route path="/nom-page" component={NomPage} />
      {/* ... */}
    </Switch>
  );
}
```

3. **Ajoutez un lien de navigation** si nécessaire (dans le Dashboard ou le menu) :

```tsx
<Link href="/nom-page">
  <Button variant="outline">Nom Page</Button>
</Link>
```

### Utilisation de tRPC

tRPC permet d'appeler le backend de manière type-safe sans définir manuellement les types.

**Requête de données (Query)** :

```tsx
const { data, isLoading, error, refetch } = trpc.dossiers.list.useQuery({
  limit: 10,
  offset: 0,
});

if (isLoading) return <div>Chargement...</div>;
if (error) return <div>Erreur: {error.message}</div>;

return <div>{data.map(dossier => <div key={dossier.id}>{dossier.titre}</div>)}</div>;
```

**Mutation de données (Mutation)** :

```tsx
const createDossierMutation = trpc.dossiers.create.useMutation({
  onSuccess: () => {
    toast.success('Dossier créé !');
    // Invalider le cache pour recharger la liste
    trpc.useUtils().dossiers.list.invalidate();
  },
  onError: (error) => {
    toast.error('Erreur', { description: error.message });
  },
});

const handleCreate = () => {
  createDossierMutation.mutate({
    titre: 'Nouveau dossier',
    description: 'Description',
  });
};

return <Button onClick={handleCreate} disabled={createDossierMutation.isLoading}>
  {createDossierMutation.isLoading ? 'Création...' : 'Créer'}
</Button>;
```

**Optimistic Updates** (pour une UI réactive) :

```tsx
const deleteDossierMutation = trpc.dossiers.delete.useMutation({
  onMutate: async (deletedId) => {
    // Annuler les requêtes en cours
    await trpc.useUtils().dossiers.list.cancel();
    
    // Snapshot de l'état actuel
    const previousData = trpc.useUtils().dossiers.list.getData();
    
    // Mise à jour optimiste
    trpc.useUtils().dossiers.list.setData(undefined, (old) =>
      old?.filter(d => d.id !== deletedId)
    );
    
    return { previousData };
  },
  onError: (err, deletedId, context) => {
    // Rollback en cas d'erreur
    trpc.useUtils().dossiers.list.setData(undefined, context?.previousData);
  },
  onSettled: () => {
    // Revalider après succès ou erreur
    trpc.useUtils().dossiers.list.invalidate();
  },
});
```

### Composants shadcn/ui

MonOPCO v3 utilise shadcn/ui pour les composants UI. Ces composants sont copiés dans `client/src/components/ui/` et peuvent être personnalisés.

**Ajouter un nouveau composant shadcn/ui** :

```bash
npx shadcn-ui@latest add dialog
```

**Utilisation d'un composant** :

```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

<Dialog>
  <DialogTrigger asChild>
    <Button>Ouvrir</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Titre du Dialog</DialogTitle>
    </DialogHeader>
    <p>Contenu du dialog</p>
  </DialogContent>
</Dialog>
```

### Styling avec Tailwind CSS

Tailwind CSS 4 est configuré avec un système de design cohérent défini dans `client/src/index.css`.

**Classes utilitaires courantes** :

```tsx
// Layout
<div className="container mx-auto px-4 py-8">
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
<div className="flex items-center justify-between">

// Spacing
<div className="space-y-4"> {/* Espacement vertical entre enfants */}
<div className="space-x-2"> {/* Espacement horizontal entre enfants */}

// Typography
<h1 className="text-3xl font-bold">
<p className="text-muted-foreground">

// Colors (utiliser les variables CSS)
<div className="bg-background text-foreground">
<div className="bg-primary text-primary-foreground">
<div className="bg-card text-card-foreground">

// Responsive
<div className="hidden md:block"> {/* Caché sur mobile, visible sur desktop */}
<div className="grid-cols-1 md:grid-cols-2"> {/* 1 colonne mobile, 2 desktop */}
```

**Personnalisation du thème** :

Les couleurs et variables CSS sont définies dans `client/src/index.css` :

```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    /* ... */
  }
}
```

Modifiez ces valeurs pour changer le thème global.

---

## Développement Backend

### Création d'un Nouveau Endpoint tRPC

Pour ajouter un nouvel endpoint API, modifiez `server/routers.ts` :

```typescript
import { z } from 'zod';
import { publicProcedure, protectedProcedure, router } from './_core/trpc';

export const appRouter = router({
  // Endpoints existants...
  
  // Nouvel endpoint public
  monEndpoint: router({
    list: publicProcedure
      .input(z.object({
        limit: z.number().min(1).max(100).default(10),
        offset: z.number().min(0).default(0),
      }))
      .query(async ({ input }) => {
        // Logique de récupération des données
        const items = await db.select().from(table).limit(input.limit).offset(input.offset);
        return items;
      }),
    
    // Endpoint protégé (nécessite authentification)
    create: protectedProcedure
      .input(z.object({
        titre: z.string().min(1).max(255),
        description: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        // ctx.user contient l'utilisateur authentifié
        const result = await db.insert(table).values({
          ...input,
          user_id: ctx.user.id,
        });
        
        return { success: true, id: result.insertId };
      }),
  }),
});
```

**Validation avec Zod** :

Zod assure la validation type-safe des entrées :

```typescript
const schema = z.object({
  email: z.string().email('Email invalide'),
  age: z.number().min(18, 'Doit avoir au moins 18 ans'),
  role: z.enum(['admin', 'user']),
  metadata: z.record(z.string()).optional(),
});
```

### Interaction avec la Base de Données

Drizzle ORM fournit une API type-safe pour interagir avec PostgreSQL.

**Définir un schéma** dans `drizzle/schema.ts` :

```typescript
import { pgTable, uuid, text, timestamp, boolean } from 'drizzle-orm/pg-core';

export const maTable = pgTable('ma_table', {
  id: uuid('id').defaultRandom().primaryKey(),
  titre: text('titre').notNull(),
  description: text('description'),
  actif: boolean('actif').default(true).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
  user_id: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
});

export type MaTable = typeof maTable.$inferSelect;
export type InsertMaTable = typeof maTable.$inferInsert;
```

**Requêtes courantes** :

```typescript
import { eq, and, or, like, desc } from 'drizzle-orm';
import { getDb } from './db';
import { maTable } from '../drizzle/schema';

const db = await getDb();

// SELECT
const items = await db.select().from(maTable).where(eq(maTable.actif, true));

// SELECT avec JOIN
const itemsWithUser = await db
  .select()
  .from(maTable)
  .leftJoin(users, eq(maTable.user_id, users.id));

// INSERT
const result = await db.insert(maTable).values({
  titre: 'Titre',
  description: 'Description',
  user_id: 'uuid-user',
}).returning();

// UPDATE
await db.update(maTable)
  .set({ titre: 'Nouveau titre', updated_at: new Date() })
  .where(eq(maTable.id, 'uuid-item'));

// DELETE
await db.delete(maTable).where(eq(maTable.id, 'uuid-item'));

// Recherche avec LIKE
const results = await db.select()
  .from(maTable)
  .where(like(maTable.titre, '%recherche%'));

// Tri et pagination
const paginated = await db.select()
  .from(maTable)
  .orderBy(desc(maTable.created_at))
  .limit(10)
  .offset(20);
```

### Envoi d'Emails avec Resend

Le service Resend est configuré dans `server/resend.ts`. Pour envoyer un email :

```typescript
import { sendEmail, sendWelcomeEmail, sendNewDocumentEmail } from './resend';

// Email simple
await sendEmail({
  to: 'user@example.com',
  subject: 'Sujet de l\'email',
  html: '<h1>Contenu HTML</h1>',
  text: 'Contenu texte',
});

// Email avec template prédéfini
await sendWelcomeEmail('user@example.com', 'Jean Dupont');

await sendNewDocumentEmail({
  to: 'user@example.com',
  userName: 'Jean Dupont',
  documentName: 'Contrat.pdf',
  dossierName: 'Formation 2025',
  dossierUrl: 'https://monopco.fr/dossiers/123',
});
```

### Recherche d'Entreprise avec Pappers

Le service Pappers est configuré dans `server/pappers.ts`. Pour rechercher une entreprise :

```typescript
import { searchBySiret, searchBySiren } from './pappers';

// Recherche par SIRET (14 chiffres)
const entreprise = await searchBySiret('12345678901234');

if (entreprise) {
  console.log(entreprise.nom); // Nom de l'entreprise
  console.log(entreprise.siege.adresse); // Adresse du siège
  console.log(entreprise.forme_juridique); // Forme juridique
  console.log(entreprise.code_naf); // Code NAF
}

// Recherche par SIREN (9 chiffres)
const entreprise2 = await searchBySiren('123456789');
```

---

## Tests

MonOPCO v3 utilise Vitest pour les tests unitaires et d'intégration.

### Écrire un Test

Créez un fichier `*.test.ts` dans le dossier `server/` :

```typescript
import { describe, it, expect } from 'vitest';
import { appRouter } from './routers';
import type { TrpcContext } from './_core/context';

describe('monEndpoint', () => {
  it('should return a list of items', async () => {
    // Créer un contexte de test
    const ctx: TrpcContext = {
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        // ...
      },
      req: {} as any,
      res: {} as any,
    };

    // Créer un caller tRPC
    const caller = appRouter.createCaller(ctx);

    // Appeler l'endpoint
    const result = await caller.monEndpoint.list({ limit: 10, offset: 0 });

    // Assertions
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeLessThanOrEqual(10);
  });

  it('should create an item', async () => {
    const ctx: TrpcContext = { /* ... */ };
    const caller = appRouter.createCaller(ctx);

    const result = await caller.monEndpoint.create({
      titre: 'Test Item',
      description: 'Test Description',
    });

    expect(result.success).toBe(true);
    expect(result.id).toBeDefined();
  });
});
```

### Exécuter les Tests

```bash
# Tous les tests
pnpm test

# Tests en mode watch
pnpm test:watch

# Tests avec coverage
pnpm test:coverage

# Test spécifique
pnpm test monEndpoint.test.ts
```

### Bonnes Pratiques de Tests

- **Testez les cas normaux et les cas d'erreur** : Vérifiez que les validations fonctionnent correctement
- **Utilisez des données de test réalistes** : Évitez les valeurs trop simples comme "test" ou "123"
- **Nettoyez après les tests** : Supprimez les données créées en base de données
- **Moquez les services externes** : Ne faites pas d'appels réels à Resend ou Pappers dans les tests
- **Testez l'isolation** : Chaque test doit être indépendant et pouvoir s'exécuter seul

---

## Conventions de Code

### Nommage

Suivez ces conventions pour maintenir la cohérence du code :

- **Fichiers** : `PascalCase` pour les composants React (`DossierDetail.tsx`), `camelCase` pour les utilitaires (`pdfExport.ts`)
- **Composants React** : `PascalCase` (`function DossierDetail()`)
- **Fonctions** : `camelCase` (`function fetchDossiers()`)
- **Variables** : `camelCase` (`const userName = 'Jean'`)
- **Constantes** : `UPPER_SNAKE_CASE` (`const MAX_FILE_SIZE = 10 * 1024 * 1024`)
- **Types/Interfaces** : `PascalCase` (`type User = {...}`, `interface DossierProps {...}`)
- **Endpoints tRPC** : `camelCase` (`trpc.dossiers.list.useQuery()`)

### Structure des Composants React

Organisez vos composants dans cet ordre :

```tsx
// 1. Imports
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';

// 2. Types/Interfaces
type Props = {
  dossierId: string;
};

// 3. Composant
export default function MonComposant({ dossierId }: Props) {
  // 3.1. Hooks (useState, useEffect, custom hooks)
  const [data, setData] = useState(null);
  const { user } = useAuth();
  
  // 3.2. Queries/Mutations tRPC
  const { data: dossier } = trpc.dossiers.get.useQuery({ id: dossierId });
  const updateMutation = trpc.dossiers.update.useMutation();
  
  // 3.3. Effects
  useEffect(() => {
    // ...
  }, []);
  
  // 3.4. Handlers
  const handleUpdate = () => {
    updateMutation.mutate({ id: dossierId, titre: 'Nouveau titre' });
  };
  
  // 3.5. Render helpers
  const renderStatus = () => {
    // ...
  };
  
  // 3.6. Early returns (loading, error)
  if (!dossier) return <div>Chargement...</div>;
  
  // 3.7. Main render
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

### Commentaires

Ajoutez des commentaires pour expliquer le "pourquoi", pas le "quoi" :

```typescript
// ❌ Mauvais : explique ce que fait le code (évident)
// Incrémente le compteur
count++;

// ✅ Bon : explique pourquoi on fait ça
// On incrémente après l'envoi pour éviter les doublons lors du retry
count++;

// ✅ Bon : documente une fonction complexe
/**
 * Calcule le prix total d'un dossier incluant les frais OPCO
 * @param dossier - Le dossier à calculer
 * @param tauxOPCO - Taux de prise en charge OPCO (0-1)
 * @returns Prix total après déduction OPCO
 */
function calculateTotal(dossier: Dossier, tauxOPCO: number): number {
  // ...
}
```

### Gestion des Erreurs

Gérez toujours les erreurs de manière explicite :

```typescript
// ❌ Mauvais : erreur silencieuse
try {
  await sendEmail();
} catch (e) {}

// ✅ Bon : log et feedback utilisateur
try {
  await sendEmail();
  toast.success('Email envoyé');
} catch (error) {
  console.error('Failed to send email:', error);
  toast.error('Erreur d\'envoi', {
    description: error instanceof Error ? error.message : 'Erreur inconnue',
  });
}

// ✅ Bon : gestion spécifique des erreurs
try {
  await uploadFile(file);
} catch (error) {
  if (error.code === 'FILE_TOO_LARGE') {
    toast.error('Fichier trop volumineux (max 10MB)');
  } else if (error.code === 'INVALID_FORMAT') {
    toast.error('Format de fichier non supporté');
  } else {
    toast.error('Erreur d\'upload');
  }
}
```

---

## Workflow Git

### Branches

Utilisez un workflow Git Flow simplifié :

- **`main`** : Code en production, toujours stable
- **`develop`** : Code en développement, intégration continue
- **`feature/nom-feature`** : Nouvelles fonctionnalités
- **`fix/nom-bug`** : Corrections de bugs
- **`hotfix/nom-urgence`** : Corrections urgentes en production

### Commits

Écrivez des messages de commit clairs et descriptifs :

```bash
# ❌ Mauvais
git commit -m "fix"
git commit -m "update"

# ✅ Bon
git commit -m "fix: Corriger l'erreur 500 lors de l'upload de fichiers > 5MB"
git commit -m "feat: Ajouter la page de préférences de notifications"
git commit -m "refactor: Extraire la logique de validation dans un helper"
git commit -m "docs: Mettre à jour le guide de déploiement"
```

Utilisez les préfixes conventionnels :
- `feat:` Nouvelle fonctionnalité
- `fix:` Correction de bug
- `refactor:` Refactoring sans changement de fonctionnalité
- `docs:` Documentation
- `style:` Formatage, point-virgules manquants, etc.
- `test:` Ajout ou modification de tests
- `chore:` Tâches de maintenance (dépendances, config, etc.)

### Pull Requests

Avant de créer une Pull Request :

1. Assurez-vous que tous les tests passent : `pnpm test`
2. Vérifiez le linting : `pnpm lint`
3. Formatez le code : `pnpm format`
4. Mettez à jour la documentation si nécessaire
5. Créez un checkpoint (sur Manus) ou un tag Git

Dans la description de la PR, incluez :
- **Contexte** : Pourquoi ce changement est nécessaire
- **Changements** : Liste des modifications apportées
- **Tests** : Comment tester les changements
- **Screenshots** : Si changements UI

---

## Debugging

### Outils de Debugging

**Frontend** :
- **React DevTools** : Inspecter les composants et leur state
- **TanStack Query DevTools** : Visualiser le cache et les requêtes (déjà intégré)
- **Console du navigateur** : `console.log()`, `console.table()`, `console.error()`
- **Breakpoints** : Utilisez les DevTools du navigateur pour mettre des breakpoints

**Backend** :
- **Logs** : Utilisez `console.log()` pour débugger (visible dans le terminal)
- **Debugger Node.js** : Lancez avec `node --inspect` et connectez Chrome DevTools
- **PM2 Logs** : `pm2 logs monopco-v3` pour voir les logs en production

### Problèmes Courants

**Erreur : "Cannot find module"**
- Solution : Vérifiez que le chemin d'import est correct et que le module est installé (`pnpm install`)

**Erreur : "tRPC endpoint not found"**
- Solution : Vérifiez que l'endpoint existe dans `server/routers.ts` et que le serveur est redémarré

**Erreur : "Supabase connection failed"**
- Solution : Vérifiez que `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` sont corrects dans `.env`

**Erreur : "Resend API error"**
- Solution : Vérifiez que `RESEND_API_KEY` est valide et que vous n'avez pas dépassé le rate limit (2 req/sec)

**Erreur : "Database migration failed"**
- Solution : Vérifiez que `DATABASE_URL` est correct et que la base de données est accessible

---

## Performance

### Optimisation Frontend

- **Code splitting** : Utilisez `React.lazy()` pour charger les pages à la demande
- **Memoization** : Utilisez `useMemo` et `useCallback` pour éviter les recalculs inutiles
- **Virtualisation** : Pour les longues listes, utilisez `react-virtual` ou `react-window`
- **Images** : Optimisez les images (WebP, compression) et utilisez `loading="lazy"`
- **Bundle size** : Analysez avec `pnpm build && npx vite-bundle-visualizer`

### Optimisation Backend

- **Indexes** : Ajoutez des index sur les colonnes fréquemment recherchées
- **Pagination** : Toujours paginer les listes (limit/offset)
- **Cache** : Utilisez TanStack Query côté client pour cacher les données
- **N+1 queries** : Utilisez les JOINs Drizzle pour éviter les requêtes multiples
- **Rate limiting** : Implémentez un rate limiter pour protéger les endpoints sensibles

---

## Ressources

### Documentation Officielle

- **React** : https://react.dev
- **TypeScript** : https://www.typescriptlang.org/docs
- **tRPC** : https://trpc.io/docs
- **Drizzle ORM** : https://orm.drizzle.team/docs
- **Tailwind CSS** : https://tailwindcss.com/docs
- **shadcn/ui** : https://ui.shadcn.com
- **Supabase** : https://supabase.com/docs
- **Resend** : https://resend.com/docs
- **Vitest** : https://vitest.dev

### Communauté

- **GitHub Issues** : https://github.com/lekesiz/MonOPCO-v3/issues
- **Discussions** : https://github.com/lekesiz/MonOPCO-v3/discussions

---

**Date de mise à jour** : 26 novembre 2025  
**Version** : 1.0.0
