# MonOPCO v3 - Guide des Fonctionnalités Avancées (Phase 3)

## 📅 Date de mise à jour: 26 Novembre 2025

Ce document décrit les fonctionnalités avancées ajoutées à MonOPCO v3 lors de la phase 3 de développement.

---

## 🆕 Fonctionnalités Implémentées

### 1. Intégration des Templates dans l'Envoi d'Emails

**Fichiers modifiés:**
- `client/src/pages/Emails.tsx`

**Fonctionnalités:**

1. **Sélecteur de template dans le formulaire d'envoi**
   - Dropdown avec la liste de tous les templates disponibles
   - Option "Aucun template" pour composition manuelle
   - Icônes visuelles pour chaque template

2. **Remplissage automatique**
   - Sélection d'un template remplit automatiquement le sujet et le corps
   - Les champs restent éditables après sélection
   - Possibilité de personnaliser le message avant envoi

3. **Remplacement automatique des placeholders**
   - Fonction `replacePlaceholders()` qui traite le texte avant envoi
   - Placeholders supportés:
     - `{{nom}}` → Nom de famille de l'utilisateur
     - `{{prenom}}` → Prénom de l'utilisateur
     - `{{email}}` → Adresse email de l'utilisateur
     - `{{entreprise}}` → Nom de l'entreprise
     - `{{date}}` → Date actuelle au format français (JJ/MM/AAAA)
   - Remplacement global (toutes les occurrences)
   - Fallback vers les métadonnées Supabase si les champs ne sont pas remplis

4. **Expérience utilisateur**
   - Message d'aide indiquant que les placeholders seront remplacés
   - Icône "Sparkles" pour l'option "Aucun template"
   - Icône "FileText" pour chaque template

**Utilisation:**

```typescript
// Dans Emails.tsx
const [templates, setTemplates] = useState<EmailTemplate[]>([]);
const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');

// Charger les templates
const fetchTemplates = async () => {
  const { data, error } = await supabase
    .from('email_templates')
    .select('*')
    .eq('user_id', user?.id)
    .order('created_at', { ascending: false });
  
  setTemplates(data || []);
};

// Remplacer les placeholders
const replacePlaceholders = (text: string): string => {
  const replacements: Record<string, string> = {
    '{{nom}}': user.user_metadata?.nom || '',
    '{{prenom}}': user.user_metadata?.prenom || '',
    '{{email}}': user.email || '',
    '{{entreprise}}': user.user_metadata?.entreprise_nom || '',
    '{{date}}': new Date().toLocaleDateString('fr-FR'),
  };

  let result = text;
  Object.entries(replacements).forEach(([placeholder, value]) => {
    result = result.replace(new RegExp(placeholder, 'g'), value);
  });

  return result;
};
```

---

### 2. Système de Notifications en Temps Réel

**Fichiers créés:**
- `client/src/components/NotificationCenter.tsx`
- `create_notifications_table.sql`

**Fichiers modifiés:**
- `client/src/pages/Dashboard.tsx`

**Fonctionnalités:**

1. **Composant NotificationCenter**
   - Icône de cloche dans le header
   - Badge rouge avec le nombre de notifications non lues
   - Dropdown menu avec la liste des notifications
   - Scroll automatique si plus de 10 notifications

2. **Types de notifications**
   - **Document** - Nouveau document ajouté (icône FileText bleue)
   - **Email** - Email envoyé (icône Mail verte)
   - **Dossier** - Changement de statut (futur)
   - **System** - Notifications système (futur)

3. **Supabase Realtime**
   - Écoute en temps réel des INSERT sur la table `documents`
   - Écoute en temps réel des INSERT sur la table `emails`
   - Création automatique de notification lors de l'événement
   - Toast notification pour feedback immédiat

4. **Gestion des notifications**
   - Marquer une notification comme lue (clic sur la notification)
   - Marquer toutes comme lues (bouton en haut)
   - Supprimer une notification (icône X)
   - Affichage du temps relatif ("Il y a 5 min", "Il y a 2h", etc.)

5. **Interface utilisateur**
   - Design cohérent avec le reste de l'application
   - Notifications non lues avec fond bleu clair
   - Icônes colorées selon le type
   - Animations douces

**⚠️ IMPORTANT - Configuration de la base de données:**

La table `notifications` doit être créée manuellement dans Supabase:

```sql
-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('document', 'email', 'dossier', 'system')),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  related_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- RLS Policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own notifications"
  ON notifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE
  USING (auth.uid() = user_id);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
```

**Utilisation:**

```typescript
// Dans NotificationCenter.tsx
const subscribeToNotifications = () => {
  // Subscribe to new documents
  const documentsChannel = supabase
    .channel('documents-changes')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'documents',
        filter: `user_id=eq.${user?.id}`,
      },
      async (payload) => {
        const newDoc = payload.new as any;
        
        // Create notification
        await supabase.from('notifications').insert([
          {
            user_id: user?.id,
            type: 'document',
            title: 'Nouveau document',
            message: `Le document "${newDoc.nom_fichier}" a été ajouté`,
            read: false,
            related_id: newDoc.id,
          },
        ]);

        // Show toast
        toast.success('Nouveau document ajouté!');
        
        // Refresh notifications
        fetchNotifications();
      }
    )
    .subscribe();
};
```

---

### 3. Export PDF des Dossiers

**Fichiers créés:**
- `client/src/lib/pdfExport.ts`

**Fichiers modifiés:**
- `client/src/pages/DossierDetail.tsx`

**Dépendances ajoutées:**
- `jspdf@3.0.4`

**Fonctionnalités:**

1. **Fonction d'export complète**
   - Export de toutes les informations du dossier
   - Liste des documents avec métadonnées
   - Liste des emails avec détails
   - Formatage professionnel

2. **Structure du PDF**
   - **Header**: Logo MonOPCO + titre du document
   - **Section Dossier**: Titre, description, statut, dates
   - **Section Documents**: Tableau avec nom, type, taille, date
   - **Section Emails**: Cards avec destinataire, sujet, date, statut
   - **Footer**: Numérotation des pages + date de génération

3. **Design professionnel**
   - Couleurs cohérentes (bleu #3B82F6)
   - Badges de statut colorés
   - Sections avec fond gris clair
   - Espacement et marges optimisés
   - Gestion automatique des sauts de page

4. **Métadonnées**
   - Formatage des dates en français (JJ/MM/AAAA)
   - Formatage des tailles de fichiers (B, KB, MB)
   - Labels de statut traduits
   - Troncature des textes longs

5. **Bouton d'export**
   - Icône "Download" dans la page de détail du dossier
   - Position: À côté du bouton "Modifier"
   - Toast de confirmation après export
   - Gestion des erreurs avec message utilisateur

**Utilisation:**

```typescript
// Dans DossierDetail.tsx
import { exportDossierToPDF } from '@/lib/pdfExport';

<Button
  variant="outline"
  onClick={async () => {
    try {
      await exportDossierToPDF(dossier, documents, emails);
      toast.success('PDF exporté avec succès!');
    } catch (error: any) {
      toast.error('Erreur d\'export PDF', {
        description: error.message,
      });
    }
  }}
>
  <Download className="w-4 h-4 mr-2" />
  Exporter en PDF
</Button>
```

**Exemple de structure PDF:**

```
┌─────────────────────────────────────────────┐
│ [M] MonOPCO    Dossier de Formation         │
├─────────────────────────────────────────────┤
│ INFORMATIONS DU DOSSIER                     │
│ Titre: Formation React Avancé               │
│ Description: Formation sur React 19...      │
│ Statut: En cours                            │
│ Créé le: 15/11/2025                         │
│ Modifié le: 26/11/2025                      │
├─────────────────────────────────────────────┤
│ DOCUMENTS (3)                               │
│ ┌───────────────────────────────────────┐   │
│ │ Nom         Type    Taille    Date    │   │
│ │ doc1.pdf    PDF     2.5 MB    15/11   │   │
│ │ img.png     PNG     450 KB    16/11   │   │
│ │ data.xlsx   XLSX    1.2 MB    20/11   │   │
│ └───────────────────────────────────────┘   │
├─────────────────────────────────────────────┤
│ EMAILS (2)                                  │
│ ┌───────────────────────────────────────┐   │
│ │ À: client@example.com     [Envoyé]    │   │
│ │ Sujet: Confirmation d'inscription     │   │
│ │ Date: 16/11/2025                      │   │
│ └───────────────────────────────────────┘   │
│ ┌───────────────────────────────────────┐   │
│ │ À: formateur@example.com  [Envoyé]    │   │
│ │ Sujet: Demande de planning            │   │
│ │ Date: 18/11/2025                      │   │
│ └───────────────────────────────────────┘   │
├─────────────────────────────────────────────┤
│ Page 1 sur 1 - Généré le 26/11/2025        │
└─────────────────────────────────────────────┘
```

---

## 🔗 Intégration avec les Fonctionnalités Existantes

### Templates d'Emails
- Accessible depuis la page "Emails" via le bouton "Envoyer un email"
- Nécessite d'avoir créé des templates dans la page "Email Templates"
- Les placeholders sont remplacés automatiquement lors de l'envoi

### Notifications
- Apparaît dans le header de toutes les pages après connexion
- Badge rouge indique le nombre de notifications non lues
- Les notifications sont créées automatiquement lors d'actions

### Export PDF
- Accessible depuis la page de détail d'un dossier
- Bouton "Exporter en PDF" à côté du bouton "Modifier"
- Le PDF est téléchargé automatiquement dans le dossier Téléchargements

---

## 📊 Actions Requises par l'Utilisateur

### 1. Créer la table email_templates (si pas déjà fait)
```bash
# Exécuter le script SQL dans Supabase SQL Editor
cat create_email_templates.sql
```

### 2. Créer la table notifications
```bash
# Exécuter le script SQL dans Supabase SQL Editor
cat create_notifications_table.sql
```

### 3. Activer Supabase Realtime
1. Aller dans Supabase Dashboard → Database → Replication
2. Vérifier que les tables suivantes sont activées:
   - `documents`
   - `emails`
   - `notifications`

---

## 🎨 Améliorations UX

### Feedback Utilisateur
- Toast notifications pour toutes les actions importantes
- Messages d'erreur descriptifs
- Loading states pendant les opérations asynchrones

### Accessibilité
- Icônes descriptives pour chaque type de notification
- Badges colorés pour les statuts
- Temps relatif pour les notifications ("Il y a 5 min")

### Performance
- Limit de 10 notifications dans le dropdown
- Scroll automatique si plus de 10 notifications
- Chargement paresseux des templates

---

## 🔄 Workflow Complet

### Scénario: Envoi d'un email avec template

1. **Utilisateur crée un template**
   - Va dans "Email Templates"
   - Crée un template "Confirmation Formation"
   - Sujet: "Confirmation de votre inscription - {{prenom}} {{nom}}"
   - Corps: "Bonjour {{prenom}}, votre inscription à la formation {{entreprise}} est confirmée."

2. **Utilisateur envoie un email**
   - Va dans "Emails"
   - Clique sur "Envoyer un email"
   - Sélectionne le template "Confirmation Formation"
   - Le sujet et le corps sont remplis automatiquement
   - Entre l'adresse email du destinataire
   - Clique sur "Envoyer"

3. **Système traite l'envoi**
   - Les placeholders sont remplacés:
     - `{{prenom}}` → "Jean"
     - `{{nom}}` → "Dupont"
     - `{{entreprise}}` → "MonOPCO Formation"
   - L'email est enregistré dans la base de données
   - Une notification est créée en temps réel
   - Un toast apparaît: "Email envoyé avec succès!"

4. **Utilisateur voit la notification**
   - Le badge rouge sur la cloche affiche "1"
   - Clic sur la cloche ouvre le dropdown
   - Notification: "Email envoyé à client@example.com"
   - Clic sur la notification la marque comme lue
   - Le badge passe à "0"

---

## 🐛 Problèmes Connus et Solutions

### Templates d'Emails
- ⚠️ La table `email_templates` doit être créée manuellement
- ⚠️ Les métadonnées utilisateur doivent être remplies dans le profil

**Solution:** Exécuter le script SQL et compléter le profil utilisateur

### Notifications
- ⚠️ La table `notifications` doit être créée manuellement
- ⚠️ Supabase Realtime doit être activé pour les tables

**Solution:** Exécuter le script SQL et activer Realtime dans Supabase Dashboard

### Export PDF
- ⚠️ Les emails très longs peuvent être tronqués dans le PDF
- ⚠️ Le PDF peut être volumineux si beaucoup de documents/emails

**Solution:** Limitation automatique à 60 caractères pour les sujets, pagination automatique

---

## 📝 Notes Techniques

### Technologies utilisées
- **jsPDF 3.0.4** - Génération de PDF côté client
- **Supabase Realtime** - Notifications en temps réel
- **React Hooks** - Gestion d'état et effets
- **shadcn/ui** - Components UI

### Performance
- Les templates sont chargés une seule fois au montage du composant
- Les notifications sont limitées à 10 dans le dropdown
- Le PDF est généré côté client (pas de charge serveur)

### Sécurité
- RLS activé sur toutes les tables
- Les utilisateurs ne voient que leurs propres données
- Les placeholders ne peuvent pas injecter de code

---

## 🚀 Prochaines Étapes Recommandées

### Améliorations possibles:

1. **Templates d'Emails**
   - Ajouter un éditeur WYSIWYG pour le corps du template
   - Permettre l'ajout de pièces jointes aux templates
   - Créer des templates prédéfinis (onboarding, rappel, etc.)

2. **Notifications**
   - Ajouter des notifications pour les changements de statut de dossier
   - Permettre la configuration des préférences de notification
   - Ajouter des notifications par email (en plus des in-app)

3. **Export PDF**
   - Ajouter l'option d'export de plusieurs dossiers en un seul PDF
   - Permettre la personnalisation du template PDF
   - Ajouter l'export en d'autres formats (Word, Excel)

4. **Intégrations**
   - Intégrer un vrai service d'envoi d'emails (SendGrid, Mailgun)
   - Ajouter l'intégration avec un calendrier (Google Calendar)
   - Permettre l'import/export de données en masse

---

**Version:** 3.2.0  
**Date:** 26 Novembre 2025  
**Auteur:** MonOPCO Development Team
