# MonOPCO v3 - TODO List

## 📋 Phase 1: Dokümantasyon
- [x] Proje teknik spesifikasyonu
- [x] Database schema dokümantasyonu
- [x] API endpoint dokümantasyonu
- [x] Frontend component dokümantasyonu
- [x] Deployment rehberi

## 🗄️ Phase 2: Supabase Backend
- [x] Supabase project oluşturma
- [x] Database tables (users, dossiers, documents, emails, logs)
- [x] Row Level Security (RLS) policies
- [x] Storage buckets konfigürasyonu
- [x] Database migrations

## 🔐 Phase 3: Authentication
- [x] Supabase Auth entegrasyonu
- [x] Email/Password authentication
- [x] OAuth providers (Google, GitHub)
- [x] Protected routes middleware
- [x] User profile management

## 🎨 Phase 4: Frontend Development
- [x] Modern landing page
- [x] Dashboard layout
- [ ] Dossier management UI
- [ ] Document upload/management
- [ ] Email management interface
- [ ] User profile page
- [ ] Admin panel (eğer gerekirse)

## 🧪 Phase 5: Testing & Deployment
- [ ] Unit tests (Vitest)
- [ ] Integration tests
- [ ] E2E tests (eğer gerekirse)
- [ ] Vercel deployment
- [ ] Production testing
- [ ] Checkpoint oluşturma

## 🚀 Future Enhancements
- [ ] Real-time notifications
- [ ] Advanced search
- [ ] Analytics dashboard
- [ ] Mobile responsive improvements


## 🆕 Yeni Özellikler (Devam Eden)

### Dossier Management
- [x] Dossier listesi sayfası (tablo view)
- [x] Dossier oluşturma formu
- [x] Dossier detay sayfası
- [ ] Dossier düzenleme
- [x] Dossier silme
- [x] Dossier filtreleme ve arama

### Document Upload & Storage
- [x] Document upload component (drag-drop)
- [x] Supabase Storage bucket konfigürasyonu
- [x] Document listesi ve preview
- [x] Document download
- [x] Document silme
- [x] File type validasyonu

### Email Management
- [x] Email gönderme formu
- [x] Email template yönetimi
- [x] Gönderim geçmişi
- [ ] Email tracking (açılma, tıklama)
- [x] Email filtreleme ve arama


## 🆕 Phase 2: İleri Seviye Özellikler

### Dossier Detay Sayfası
- [x] Dossier detay route (/dossiers/:id)
- [x] Dossier bilgileri görüntüleme
- [x] İlişkili documents listesi
- [x] İlişkili emails listesi
- [x] Dossier timeline/activity log
- [x] Dossier düzenleme modal

### Email Template Sistemi
- [x] Email templates tablosu (database) - SQL script hazır
- [x] Template oluşturma formu
- [x] Template listesi sayfası
- [ ] Template düzenleme
- [x] Template silme
- [x] Placeholder sistemi ({{nom}}, {{prenom}}, {{email}})
- [x] Template preview
- [ ] Email gönderirken template seçme

### User Profile Management
- [x] Profile sayfası (/profile)
- [x] Avatar upload (Supabase Storage)
- [x] Kullanıcı bilgileri görüntüleme
- [x] Bilgi güncelleme formu (prenom, nom, email)
- [x] Şifre değiştirme fonksiyonu
- [x] Profile avatar preview
- [x] User statistics (dossiers, documents, emails count)


## ⚠️ MANUEL ADIMLAR (Kullanıcı Tarafından Yapılacak)

### Email Templates Tablosu Oluşturma
**ÖNEMLI:** Aşağıdaki SQL script'ini Supabase Dashboard > SQL Editor'da çalıştırın:

```sql
-- Dosya: create_email_templates.sql
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

CREATE INDEX IF NOT EXISTS idx_email_templates_user_id ON email_templates(user_id);

ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own email templates"
  ON email_templates FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own email templates"
  ON email_templates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own email templates"
  ON email_templates FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own email templates"
  ON email_templates FOR DELETE
  USING (auth.uid() = user_id);

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

**Adımlar:**
1. https://supabase.com/dashboard/project/kblnyssyrmmuedpwrtup adresine gidin
2. Sol menüden "SQL Editor" seçin
3. "New query" butonuna tıklayın
4. Yukarıdaki SQL script'ini yapıştırın
5. "Run" butonuna tıklayın
6. Başarılı olduğunu doğrulamak için "Table Editor" > "email_templates" kontrol edin


## 🆕 Phase 3: Fonctionnalités Avancées

### Intégration des Templates dans l'Envoi d'Emails
- [x] Ajouter un sélecteur de template dans la page Emails
- [x] Charger la liste des templates depuis la base de données
- [x] Remplir automatiquement le sujet et le corps avec le template sélectionné
- [x] Remplacer les placeholders avec les données réelles (nom, prénom, email, entreprise)
- [x] Permettre l'édition après sélection du template
- [x] Afficher les placeholders disponibles dans l'interface

### Notifications en Temps Réel
- [x] Configurer Supabase Realtime pour les tables documents et emails
- [x] Créer un composant NotificationCenter
- [x] Afficher les notifications dans le header
- [x] Badge avec le nombre de notifications non lues
- [x] Marquer les notifications comme lues
- [x] Stocker les notifications dans une table dédiée
- [x] Écouter les changements en temps réel (INSERT sur documents/emails)

### Export PDF des Dossiers
- [x] Installer la bibliothèque jsPDF ou similaire
- [x] Créer une fonction d'export PDF pour un dossier
- [x] Inclure les informations du dossier (titre, description, statut, dates)
- [x] Inclure la liste des documents avec métadonnées
- [x] Inclure la liste des emails avec détails
- [x] Ajouter un bouton "Exporter en PDF" dans la page de détail du dossier
- [x] Générer un PDF bien formaté avec logo et style
- [x] Télécharger automatiquement le PDF généré


## 🆕 Phase 4: Intégration API Pappers

### Configuration API Pappers
- [x] Créer un service client pour l'API Pappers
- [x] Ajouter la clé API dans les secrets (PAPPERS_API_KEY)
- [x] Créer une fonction de recherche par SIRET
- [x] Gérer les erreurs et les cas limites (SIRET invalide, entreprise non trouvée)

### Intégration Frontend
- [x] Ajouter un champ SIRET dans le formulaire d'inscription
- [x] Bouton "Rechercher" pour récupérer les infos automatiquement
- [x] Pré-remplir les champs: nom entreprise, adresse, forme juridique
- [x] Afficher un loader pendant la recherche
- [x] Afficher les erreurs si SIRET invalide ou non trouvé
- [x] Intégrer dans la page Profile pour mise à jour

### Améliorations UX
- [x] Validation du format SIRET (14 chiffres)
- [x] Afficher un aperçu des informations trouvées avant validation
- [x] Permettre la modification manuelle après auto-remplissage
- [x] Sauvegarder les données Pappers dans la base de données


## 🆕 Phase 5: Intégration API Resend.com

### Configuration API Resend
- [x] Ajouter la clé API dans les secrets (RESEND_API_KEY)
- [x] Créer un service client pour l'API Resend
- [x] Configurer le domaine d'envoi (from email)
- [x] Tester l'envoi basique d'email

### Templates HTML Professionnels
- [x] Template de bienvenue (inscription)
- [ ] Template de confirmation d'email
- [ ] Template de réinitialisation de mot de passe
- [x] Template de notification (nouveau document)
- [x] Template de changement de statut de dossier
- [x] Template personnalisé (utilisant les templates DB)

### Emails Transactionnels
- [ ] Email de bienvenue après inscription
- [ ] Email de confirmation d'email
- [ ] Email de réinitialisation de mot de passe
- [ ] Email de notification de nouveau document
- [ ] Email de changement de statut de dossier

### Intégration Workflow
- [ ] Trigger email lors de la création d'un dossier
- [ ] Trigger email lors de l'upload d'un document
- [ ] Trigger email lors du changement de statut
- [ ] Intégrer avec les templates d'emails existants en DB
- [ ] Permettre l'envoi d'emails personnalisés depuis la page Emails

### Fonctionnalités Avancées
- [ ] Tracking des ouvertures d'emails
- [ ] Tracking des clics dans les emails
- [ ] File d'attente pour les envois en masse
- [ ] Logs des emails envoyés
- [ ] Gestion des erreurs d'envoi (bounce, spam)


## 🆕 Phase 6: Système de Notifications Complet

### Endpoints tRPC
- [x] Endpoint pour créer une notification
- [ ] Endpoint pour marquer comme lu
- [ ] Endpoint pour supprimer une notification
- [ ] Endpoint pour récupérer les notifications non lues
- [x] Endpoint pour envoyer un email personnalisé

### Triggers Automatiques
- [x] Trigger: Création de dossier → Notification + Email
- [x] Trigger: Upload de document → Notification + Email
- [x] Trigger: Changement de statut → Notification + Email
- [x] Trigger: Envoi d'email → Toast de confirmation
- [x] Trigger: Inscription → Email de bienvenue

### Amélioration Frontend
- [x] Améliorer le NotificationCenter avec actions cliquables
- [x] Ajouter des icônes personnalisées par type
- [x] Implémenter le badge de compteur non-lus
- [x] Ajouter des toasts pour feedback immédiat
- [x] Créer un hook useNotifications centralisé

### Intégration Emails Resend
- [x] Intégrer sendWelcomeEmail lors de l'inscription
- [x] Intégrer sendNewDocumentEmail lors de l'upload
- [x] Intégrer sendStatusChangeEmail lors du changement de statut
- [x] Créer un endpoint pour emails personnalisés avec templates DB


## 🆕 Phase 7: Préférences de Notifications + GitHub + Documentation

### Préférences de Notifications
- [x] Créer une table notification_preferences dans Supabase
- [x] Ajouter une section dans Profile.tsx pour les préférences
- [x] Toggle pour activer/désactiver les notifications toast
- [x] Toggle pour activer/désactiver les notifications email
- [x] Toggle pour activer/désactiver les notifications push
- [x] Sauvegarder les préférences dans la base de données
- [ ] Respecter les préférences dans useNotifications hook

### README.md
- [x] Introduction et description du projet
- [x] Technologies utilisées
- [x] Installation et configuration
- [x] Structure du projet
- [x] Fonctionnalités principales
- [x] Screenshots
- [x] Guide de déploiement
- [x] Contribution et license

### Documentation /docs
- [x] Améliorer 00-TECHNICAL-SPECIFICATION.md
- [x] Améliorer 01-DATABASE-SCHEMA.md
- [x] Améliorer 02-NEW-FEATURES-GUIDE.md
- [x] Améliorer 03-ADVANCED-FEATURES-GUIDE.md
- [x] Améliorer 04-PAPPERS-API-INTEGRATION.md
- [x] Améliorer 05-NOTIFICATION-SYSTEM.md
- [x] Créer 06-DEPLOYMENT-GUIDE.md
- [x] Créer 07-DEVELOPMENT-GUIDE.md

### GitHub
- [ ] Initialiser le repository Git
- [ ] Configurer .gitignore
- [ ] Ajouter remote GitHub
- [ ] Push initial
- [ ] Créer .github/workflows pour CI/CD (optionnel)
