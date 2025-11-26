# 🔔 Système de Notifications Complet - Guide

## Vue d'ensemble

MonOPCO v3 dispose d'un système de notifications professionnel multi-canal qui combine :
- **Notifications Toast** - Feedback immédiat dans l'interface (Sonner)
- **Centre de Notifications** - Historique et suivi en temps réel (Supabase Realtime)
- **Emails professionnels** - Notifications importantes par email (Resend API)

---

## 🎯 Architecture

### Flux de Notification

```
Action Utilisateur
    ↓
useNotifications Hook
    ↓
┌─────────────┬──────────────┬────────────────┐
│   Toast     │  Backend     │    Email       │
│  (Immédiat) │  (Async DB)  │  (Async Resend)│
└─────────────┴──────────────┴────────────────┘
```

### Composants Principaux

1. **`useNotifications` Hook** (`client/src/hooks/useNotifications.ts`)
   - Interface centralisée pour toutes les notifications
   - Gère automatiquement toast + backend + email

2. **Backend Services** (`server/`)
   - `resend.ts` - Service d'envoi d'emails professionnels
   - `notifications.ts` - Helpers pour créer des notifications en DB
   - `routers.ts` - Endpoints tRPC pour notifications et emails

3. **Frontend Components**
   - `NotificationCenter.tsx` - Centre de notifications avec Realtime
   - Toast (Sonner) - Intégré dans tout le projet

---

## 📝 Utilisation

### 1. Hook useNotifications

```tsx
import { useNotifications } from '@/hooks/useNotifications';

function MyComponent() {
  const notifications = useNotifications();

  // Toast simple
  notifications.success('Opération réussie');
  notifications.error('Une erreur est survenue');
  notifications.info('Information importante');
  notifications.warning('Attention !');

  // Notification complète (toast + DB + email)
  await notifications.notifyNewDocument({
    documentName: 'Contrat.pdf',
    dossierName: 'Formation 2025',
    dossierId: 'abc123',
  });

  await notifications.notifyStatusChange({
    dossierName: 'Formation 2025',
    dossierId: 'abc123',
    oldStatus: 'en_cours',
    newStatus: 'valide',
  });

  await notifications.notifyNewDossier({
    dossierName: 'Formation 2025',
    dossierId: 'abc123',
  });

  await notifications.notifyEmailSent({
    recipient: 'client@example.com',
    subject: 'Confirmation de dossier',
  });
}
```

### 2. Toast avec Actions Cliquables

Les notifications toast incluent automatiquement des actions cliquables :

```tsx
// Exemple : Notification de nouveau document
toast.success('📄 Document ajouté', {
  description: '"Contrat.pdf" ajouté au dossier "Formation 2025"',
  action: {
    label: 'Voir',
    onClick: () => window.location.href = '/dossiers/abc123',
  },
});
```

### 3. Endpoints tRPC Disponibles

```typescript
// Emails
trpc.email.sendWelcome.useMutation()
trpc.email.sendNewDocument.useMutation()
trpc.email.sendStatusChange.useMutation()
trpc.email.sendCustom.useMutation()

// Notifications
trpc.notifications.create.useMutation()
trpc.notifications.notifyNewDocument.useMutation()
trpc.notifications.notifyStatusChange.useMutation()
trpc.notifications.notifyNewDossier.useMutation()
trpc.notifications.notifyEmailSent.useMutation()
```

---

## 🎨 Types de Notifications

### Toast (Feedback Immédiat)

| Type | Couleur | Icône | Durée | Utilisation |
|------|---------|-------|-------|-------------|
| `success` | Vert | ✅ | 3s | Action réussie |
| `error` | Rouge | ❌ | 5s | Erreur |
| `info` | Bleu | ℹ️ | 4s | Information |
| `warning` | Orange | ⚠️ | 4s | Avertissement |

### Emails Professionnels

| Template | Déclencheur | Contenu |
|----------|-------------|---------|
| **Bienvenue** | Inscription | Logo, message d'accueil, lien dashboard |
| **Nouveau Document** | Upload | Nom document, dossier, lien direct |
| **Changement Statut** | Update statut | Badge coloré selon statut, lien dossier |
| **Personnalisé** | Manuel | Utilise templates DB avec placeholders |

---

## ⚙️ Configuration

### Variables d'Environnement

```env
# Resend API
RESEND_API_KEY=re_fqArDpFB_8RiZ7sPskQEqyoSXKwKjb8fc

# Supabase (pour Realtime notifications)
VITE_SUPABASE_URL=https://kblnyssyrmmuedpwrtup.supabase.co
VITE_SUPABASE_ANON_KEY=...
```

### Domaine d'Envoi

Par défaut : `MonOPCO <noreply@monopco.fr>`

Pour changer, modifier dans `server/resend.ts` :

```typescript
const FROM_EMAIL = 'MonOPCO <noreply@votre-domaine.fr>';
```

---

## 🔄 Déclencheurs Automatiques

### 1. Création de Dossier

**Fichier:** `client/src/pages/Dossiers.tsx`

```typescript
const { data } = await supabase.from('dossiers').insert([...]).select().single();

await notifications.notifyNewDossier({
  dossierName: formData.titre,
  dossierId: data.id,
});
```

**Résultat:**
- ✅ Toast : "Dossier créé" avec lien
- 📧 Pas d'email (notification interne uniquement)

### 2. Upload de Document

**Fichier:** `client/src/pages/Documents.tsx`

```typescript
await supabase.from('documents').insert([...]);

await notifications.notifyNewDocument({
  documentName: selectedFile.name,
  dossierName: 'Nom du dossier',
  dossierId: 'id_dossier',
});
```

**Résultat:**
- ✅ Toast : "Document ajouté" avec lien
- 📧 Email professionnel avec détails
- 🔔 Notification en DB

### 3. Changement de Statut

**Fichier:** `client/src/pages/DossierDetail.tsx`

```typescript
await supabase.from('dossiers').update({ statut: newStatus }).eq('id', dossierId);

await notifications.notifyStatusChange({
  dossierName: dossier.titre,
  dossierId: dossier.id,
  oldStatus: oldStatus,
  newStatus: newStatus,
});
```

**Résultat:**
- ✅ Toast : "Statut mis à jour" (couleur selon statut)
- 📧 Email avec badge coloré
- 🔔 Notification en DB

### 4. Envoi d'Email

**Fichier:** `client/src/pages/Emails.tsx`

```typescript
await supabase.from('emails').insert([...]);

await notifications.notifyEmailSent({
  recipient: emailData.destinataire,
  subject: emailData.objet,
});
```

**Résultat:**
- ✅ Toast : "Email envoyé"
- 🔔 Notification en DB

---

## 📧 Templates HTML

### Structure des Emails

Tous les emails suivent le même design professionnel :

1. **Header** - Gradient violet/bleu avec titre et emoji
2. **Contenu** - Texte clair avec informations clés en encadré
3. **CTA** - Bouton d'action avec gradient
4. **Footer** - Copyright et informations légales

### Personnalisation

Pour modifier un template, éditer `server/resend.ts` :

```typescript
export async function sendWelcomeEmail(to: string, userName: string) {
  const html = `
    <!DOCTYPE html>
    <html>
      <!-- Votre HTML personnalisé -->
    </html>
  `;
  
  return sendEmail({ to, subject, html });
}
```

---

## 🔔 Centre de Notifications

### Fonctionnalités

- **Temps réel** - Écoute Supabase Realtime
- **Badge compteur** - Nombre de non-lus
- **Actions** - Marquer comme lu, supprimer
- **Liens directs** - Clic → redirection vers le dossier/document
- **Icônes** - Selon le type de notification

### Intégration

Le `NotificationCenter` est déjà intégré dans le Dashboard :

```tsx
import NotificationCenter from '@/components/NotificationCenter';

<NotificationCenter />
```

---

## 🧪 Tests

### Tests Automatisés

```bash
pnpm test
```

**Fichiers de test:**
- `server/resend.test.ts` - Tests API Resend (4 tests)
- `server/pappers.test.ts` - Tests API Pappers (5 tests)
- `server/auth.logout.test.ts` - Tests authentification
- `server/supabase.test.ts` - Tests Supabase

**Résultats:**
```
✓ server/resend.test.ts (4) 3021ms
✓ server/pappers.test.ts (5) 7568ms
✓ server/auth.logout.test.ts (1)
✓ server/supabase.test.ts (1)

Test Files  4 passed (4)
Tests  11 passed (11)
```

### Test Manuel

1. **Créer un dossier** → Vérifier toast + notification
2. **Uploader un document** → Vérifier toast + email
3. **Changer un statut** → Vérifier toast + email + badge coloré
4. **Ouvrir le NotificationCenter** → Vérifier compteur et liste

---

## 📊 Statistiques et Tracking

### Resend Dashboard

Accédez à https://resend.com/emails pour voir :
- Emails envoyés
- Taux d'ouverture
- Taux de clics
- Erreurs (bounces, spam)

### Tags Automatiques

Tous les emails incluent des tags pour le tracking :

```typescript
tags: [
  { name: 'category', value: 'welcome' },
  { name: 'user_type', value: 'new' },
]
```

---

## 🚀 Prochaines Améliorations

1. **Préférences utilisateur** - Permettre de désactiver certains types de notifications
2. **Digest quotidien** - Résumé quotidien des notifications par email
3. **Notifications push** - Web Push API pour notifications navigateur
4. **Templates personnalisables** - Interface admin pour modifier les templates
5. **Webhooks Resend** - Écouter les événements (ouverture, clic, bounce)

---

## 🔒 Sécurité

### Bonnes Pratiques

1. ✅ **Clé API côté serveur uniquement** - Jamais exposée au frontend
2. ✅ **Rate limiting** - Respect des limites Resend (2 req/sec)
3. ✅ **Validation des emails** - Format vérifié avant envoi
4. ✅ **Protection CSRF** - tRPC protectedProcedure
5. ✅ **Logs sécurisés** - Pas de données sensibles dans les logs

### Limites Resend

- **Plan gratuit** : 100 emails/jour, 3000/mois
- **Rate limit** : 2 requêtes/seconde
- **Taille max** : 40MB par email (avec pièces jointes)

---

## 📞 Support

- **Documentation Resend** : https://resend.com/docs
- **Documentation Supabase Realtime** : https://supabase.com/docs/guides/realtime
- **Documentation Sonner** : https://sonner.emilkowal.ski

---

**Date de mise à jour:** 26 novembre 2025  
**Version:** 1.0.0
