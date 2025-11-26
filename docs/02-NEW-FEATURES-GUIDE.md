# MonOPCO v3 - Guide des Nouvelles Fonctionnalités

## 📅 Date de mise à jour: 26 Novembre 2025

Ce document décrit les nouvelles fonctionnalités ajoutées à MonOPCO v3 lors de la phase 2 de développement.

---

## 🆕 Fonctionnalités Implémentées

### 1. Page de Détail des Dossiers

**Route:** `/dossiers/:id`

**Composant:** `client/src/pages/DossierDetail.tsx`

**Fonctionnalités:**
- Vue détaillée complète d'un dossier spécifique
- Affichage des informations du dossier (titre, description, statut, dates)
- Badge de statut visuel (brouillon, en cours, terminé, archivé)
- Système d'onglets pour organiser l'information

**Onglets disponibles:**

1. **Documents** - Liste des documents associés au dossier
   - Nom du fichier
   - Type de fichier
   - Taille du fichier
   - Date d'upload
   - Actions: Télécharger, Supprimer

2. **Emails** - Liste des emails liés au dossier
   - Destinataire
   - Sujet
   - Statut (en attente, envoyé, échec)
   - Date d'envoi

3. **Timeline** - Historique d'activité du dossier
   - Création du dossier
   - Ajout de documents
   - Envoi d'emails
   - Modifications du statut
   - Tri chronologique inversé (plus récent en premier)

**Fonctionnalités supplémentaires:**
- Modal de modification du dossier
- Suppression de documents avec confirmation
- Navigation facile avec bouton "Retour"

---

### 2. Système de Templates d'Emails

**Route:** `/email-templates`

**Composant:** `client/src/pages/EmailTemplates.tsx`

**Base de données:** Table `email_templates` (voir instructions de création ci-dessous)

**Fonctionnalités:**

1. **Création de templates**
   - Nom du template
   - Sujet de l'email
   - Corps du message
   - Détection automatique des placeholders

2. **Système de placeholders**
   - Format: `{{nom_variable}}`
   - Placeholders disponibles:
     - `{{nom}}` - Nom de famille
     - `{{prenom}}` - Prénom
     - `{{email}}` - Adresse email
     - `{{entreprise}}` - Nom de l'entreprise
     - `{{date}}` - Date actuelle
   - Extraction automatique des placeholders depuis le sujet et le corps

3. **Gestion des templates**
   - Liste de tous les templates créés
   - Recherche et filtrage
   - Aperçu (preview) du template
   - Copie dans le presse-papiers
   - Suppression avec confirmation

4. **Interface utilisateur**
   - Formulaire de création intuitif
   - Tableau de liste avec pagination
   - Badges pour afficher les placeholders
   - Modal de prévisualisation

**⚠️ IMPORTANT - Configuration de la base de données:**

La table `email_templates` doit être créée manuellement dans Supabase. Suivez ces étapes:

1. Connectez-vous à [Supabase Dashboard](https://supabase.com/dashboard/project/kblnyssyrmmuedpwrtup)
2. Allez dans **SQL Editor**
3. Cliquez sur **New query**
4. Copiez et exécutez le script SQL suivant:

```sql
-- Email Templates table for MonOPCO v3
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nom VARCHAR(255) NOT NULL,
  sujet TEXT NOT NULL,
  corps TEXT NOT NULL,
  placeholders TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_email_templates_user_id ON email_templates(user_id);

-- RLS Policies
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

-- Users can view own templates
CREATE POLICY "Users can view own email templates"
  ON email_templates FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create own templates
CREATE POLICY "Users can create own email templates"
  ON email_templates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update own templates
CREATE POLICY "Users can update own email templates"
  ON email_templates FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete own templates
CREATE POLICY "Users can delete own email templates"
  ON email_templates FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_email_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER email_templates_updated_at
  BEFORE UPDATE ON email_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_email_templates_updated_at();
```

5. Cliquez sur **Run** pour exécuter le script
6. Vérifiez dans **Table Editor** que la table `email_templates` a été créée

---

### 3. Gestion du Profil Utilisateur

**Route:** `/profile`

**Composant:** `client/src/pages/Profile.tsx`

**Fonctionnalités:**

1. **Informations du compte**
   - Avatar de profil
   - Upload d'avatar vers Supabase Storage
   - Validation du type de fichier (images uniquement)
   - Validation de la taille (max 2MB)
   - Affichage des initiales si pas d'avatar

2. **Statistiques utilisateur**
   - Nombre total de dossiers
   - Nombre total de documents
   - Nombre total d'emails envoyés
   - Affichage visuel avec cartes colorées

3. **Informations personnelles**
   - Prénom
   - Nom
   - Nom de l'entreprise
   - SIRET (14 caractères max)
   - Mise à jour en temps réel

4. **Changement de mot de passe**
   - Nouveau mot de passe
   - Confirmation du mot de passe
   - Validation de la longueur (min 6 caractères)
   - Vérification de la correspondance

5. **Affichage des métadonnées**
   - Email de l'utilisateur
   - Date d'inscription
   - Dernière connexion

**Sécurité:**
- Toutes les données sont protégées par RLS (Row Level Security)
- Les utilisateurs ne peuvent voir et modifier que leurs propres données
- Les avatars sont stockés dans Supabase Storage avec des chemins sécurisés

---

## 🔗 Navigation

Les nouvelles pages sont accessibles depuis:

1. **Dashboard** - Liens vers toutes les fonctionnalités
2. **Menu de navigation** - Ajoutez des liens dans le header si nécessaire
3. **URLs directes:**
   - `/dossiers/:id` - Détail d'un dossier (cliquez sur un dossier dans la liste)
   - `/email-templates` - Gestion des templates
   - `/profile` - Profil utilisateur

---

## 📊 Structure des Données

### Table: email_templates

```typescript
type EmailTemplate = {
  id: string;                    // UUID auto-généré
  user_id: string;               // Référence à auth.users
  nom: string;                   // Nom du template
  sujet: string;                 // Sujet de l'email
  corps: string;                 // Corps du message
  placeholders: string[];        // Liste des placeholders détectés
  created_at: string;            // Date de création
  updated_at: string;            // Date de modification
};
```

### Table: users (champs pour le profil)

```typescript
type UserProfile = {
  id: string;
  email: string;
  prenom?: string;
  nom?: string;
  entreprise_nom?: string;
  entreprise_siret?: string;
  avatar_url?: string;           // URL de l'avatar dans Supabase Storage
  created_at: string;
  updated_at: string;
};
```

---

## 🎨 Design et UX

Toutes les nouvelles pages suivent le design system existant:

- **Gradient background:** `from-blue-50 via-white to-purple-50`
- **Header cohérent:** Logo MonOPCO + navigation
- **Cards:** Utilisation de shadcn/ui components
- **Couleurs primaires:** Bleu (#3B82F6) et Violet (#8B5CF6)
- **Responsive:** Adaptation mobile et desktop
- **Animations:** Transitions douces et loading states

---

## 🔄 Intégration avec les Fonctionnalités Existantes

### Dossiers
- La page de détail est accessible depuis la liste des dossiers
- Cliquez sur le bouton "👁️" (œil) pour voir les détails
- Les documents et emails sont automatiquement liés au dossier

### Documents
- Les documents uploadés apparaissent dans l'onglet "Documents" du dossier
- Téléchargement direct depuis la page de détail
- Suppression avec mise à jour automatique

### Emails
- Les emails envoyés apparaissent dans l'onglet "Emails" du dossier
- Affichage du statut en temps réel
- Historique complet de la communication

---

## 🚀 Prochaines Étapes Recommandées

### Fonctionnalités à compléter:

1. **Email Templates - Édition**
   - Ajouter un modal de modification pour les templates existants
   - Permettre la mise à jour du nom, sujet et corps

2. **Email Templates - Utilisation**
   - Intégrer la sélection de template dans la page d'envoi d'emails
   - Remplacer automatiquement les placeholders avec les données réelles

3. **Dossier - Édition avancée**
   - Améliorer le modal de modification
   - Ajouter la possibilité de changer le statut directement

4. **Notifications**
   - Ajouter des notifications en temps réel
   - Alertes pour les nouveaux documents ou emails

5. **Recherche globale**
   - Recherche unifiée dans tous les dossiers, documents et emails
   - Filtres avancés

6. **Export de données**
   - Export PDF des dossiers complets
   - Export CSV des listes

---

## 🐛 Problèmes Connus

### Email Templates
- ⚠️ La table `email_templates` doit être créée manuellement dans Supabase
- ⚠️ L'édition des templates n'est pas encore implémentée
- ⚠️ L'intégration avec l'envoi d'emails n'est pas encore faite

### Solutions:
1. Exécutez le script SQL fourni dans Supabase SQL Editor
2. L'édition sera ajoutée dans une prochaine version
3. L'intégration sera développée après validation des templates

---

## 📝 Notes de Développement

### Technologies utilisées:
- **React 19** - Framework frontend
- **TypeScript** - Type safety
- **Supabase** - Backend (Auth, Database, Storage)
- **shadcn/ui** - Component library
- **Tailwind CSS 4** - Styling
- **Wouter** - Routing
- **Sonner** - Toast notifications

### Bonnes pratiques appliquées:
- ✅ Row Level Security (RLS) sur toutes les tables
- ✅ TypeScript strict mode
- ✅ Validation des données côté client et serveur
- ✅ Gestion des erreurs avec messages utilisateur
- ✅ Loading states pour toutes les opérations async
- ✅ Responsive design
- ✅ Accessibilité (ARIA labels, keyboard navigation)

---

## 📞 Support

Pour toute question ou problème:
1. Consultez la documentation technique dans `/docs`
2. Vérifiez les logs Supabase pour les erreurs backend
3. Utilisez les DevTools du navigateur pour déboguer le frontend

---

**Version:** 3.1.0  
**Date:** 26 Novembre 2025  
**Auteur:** MonOPCO Development Team
