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
