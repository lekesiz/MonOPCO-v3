# MonOPCO v3 - Supabase Migration Rehberi

## 📋 Genel Bakış

Bu dokuman, MonOPCO projesinin Neon PostgreSQL'den Supabase'e geçiş sürecini adım adım açıklar. Supabase, database, authentication ve storage işlevlerini tek platformda birleştirerek geliştirme sürecini basitleştirir ve güvenliği artırır.

---

## 🎯 Neden Supabase?

### Neon'daki Problemler

**Database Connection Issues:** Neon'da birden fazla database ve branch bulunması, connection string karmaşasına yol açtı. 10+ saat boyunca çözülemeyen `prenom` kolonu hatası, farklı database'lere bağlanma probleminden kaynaklandı.

**Manual Authentication:** Custom JWT implementation, güvenlik riskleri ve bakım maliyeti getirdi. Refresh token rotation, email verification ve password reset gibi temel özellikler manuel olarak implement edilmesi gerekti.

**Storage Limitations:** Vercel Blob Storage, Pro plan gerektirdiği için maliyetli. File size ve bandwidth limits, ölçeklenebilirliği kısıtladı.

**Scalability Issues:** Serverless function cold starts ve connection pooling problemleri, performansı olumsuz etkiledi.

### Supabase Avantajları

**Built-in Authentication:** JWT otomatik yönetimi, OAuth providers (Google, GitHub), email verification, password reset ve Row Level Security (RLS) out-of-the-box geliyor.

**Built-in Storage:** S3-compatible object storage, CDN integration, automatic image optimization ve daha ucuz pricing sunuyor.

**Better Developer Experience:** Auto-generated API, real-time subscriptions, TypeScript support ve comprehensive documentation sağlıyor.

**Unified Platform:** Database, auth ve storage tek platformda. Tek dashboard, tek billing ve daha az konfigürasyon.

**Better Scalability:** Connection pooling otomatik, edge functions desteği ve global CDN ile yüksek performans.

---

## 🗄️ Database Migration

### Adım 1: Supabase Project Oluşturma

1. [Supabase Dashboard](https://supabase.com/dashboard)'a git
2. "New Project" butonuna tıkla
3. Project bilgilerini doldur:
   - **Name:** monopco-v3
   - **Database Password:** Güçlü bir password belirle (kaydet!)
   - **Region:** Europe West (Paris) - Fransa'ya en yakın
   - **Pricing Plan:** Free tier (başlangıç için yeterli)
4. "Create new project" butonuna tıkla
5. Project oluşturulmasını bekle (2-3 dakika)

### Adım 2: Database Schema Migration

Supabase SQL Editor'ı kullanarak tabloları oluştur:

1. Supabase Dashboard → SQL Editor
2. "New query" butonuna tıkla
3. Aşağıdaki SQL scriptini yapıştır ve çalıştır:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (Supabase Auth ile entegre)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(320) UNIQUE NOT NULL,
  prenom VARCHAR(100),
  nom VARCHAR(100),
  role VARCHAR(20) NOT NULL DEFAULT 'entreprise',
  entreprise_siret VARCHAR(14) UNIQUE,
  entreprise_nom VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_signed_in TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_siret ON users(entreprise_siret);

-- Dossiers table
CREATE TABLE dossiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  titre VARCHAR(255) NOT NULL,
  description TEXT,
  statut VARCHAR(50) DEFAULT 'brouillon',
  date_creation TIMESTAMPTZ DEFAULT NOW(),
  date_modification TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for dossiers
CREATE INDEX idx_dossiers_user_id ON dossiers(user_id);
CREATE INDEX idx_dossiers_statut ON dossiers(statut);

-- Documents table
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dossier_id UUID REFERENCES dossiers(id) ON DELETE CASCADE,
  nom_fichier VARCHAR(255) NOT NULL,
  type_fichier VARCHAR(100),
  taille_fichier INTEGER,
  url_stockage TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  date_upload TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for documents
CREATE INDEX idx_documents_dossier_id ON documents(dossier_id);
CREATE INDEX idx_documents_uploaded_by ON documents(uploaded_by);

-- Emails table
CREATE TABLE emails (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  dossier_id UUID REFERENCES dossiers(id) ON DELETE CASCADE,
  destinataire VARCHAR(255) NOT NULL,
  sujet VARCHAR(255) NOT NULL,
  contenu TEXT NOT NULL,
  statut VARCHAR(50) DEFAULT 'en_attente',
  date_envoi TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for emails
CREATE INDEX idx_emails_user_id ON emails(user_id);
CREATE INDEX idx_emails_dossier_id ON emails(dossier_id);
CREATE INDEX idx_emails_statut ON emails(statut);

-- Logs table
CREATE TABLE logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(255) NOT NULL,
  details JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for logs
CREATE INDEX idx_logs_user_id ON logs(user_id);
CREATE INDEX idx_logs_created_at ON logs(created_at);
CREATE INDEX idx_logs_action ON logs(action);

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-update date_modification trigger
CREATE OR REPLACE FUNCTION update_date_modification_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.date_modification = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_dossiers_date_modification
  BEFORE UPDATE ON dossiers
  FOR EACH ROW
  EXECUTE FUNCTION update_date_modification_column();
```

### Adım 3: Row Level Security (RLS) Policies

RLS policies'leri enable et ve tanımla:

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE dossiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own record"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own record"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Dossiers policies
CREATE POLICY "Users can view own dossiers"
  ON dossiers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own dossiers"
  ON dossiers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own dossiers"
  ON dossiers FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own dossiers"
  ON dossiers FOR DELETE
  USING (auth.uid() = user_id);

-- Documents policies
CREATE POLICY "Users can view own documents"
  ON documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM dossiers
      WHERE dossiers.id = documents.dossier_id
      AND dossiers.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can upload documents to own dossiers"
  ON documents FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM dossiers
      WHERE dossiers.id = documents.dossier_id
      AND dossiers.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own documents"
  ON documents FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM dossiers
      WHERE dossiers.id = documents.dossier_id
      AND dossiers.user_id = auth.uid()
    )
  );

-- Emails policies
CREATE POLICY "Users can view own emails"
  ON emails FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own emails"
  ON emails FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Logs policies (admin only)
CREATE POLICY "Only admins can view logs"
  ON logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "System can insert logs"
  ON logs FOR INSERT
  WITH CHECK (true);
```

### Adım 4: Database Functions (Opsiyonel)

Kullanışlı database functions tanımla:

```sql
-- Get user's dossier count
CREATE OR REPLACE FUNCTION get_user_dossier_count(user_uuid UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER
  FROM dossiers
  WHERE user_id = user_uuid;
$$ LANGUAGE SQL STABLE;

-- Get dossier document count
CREATE OR REPLACE FUNCTION get_dossier_document_count(dossier_uuid UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER
  FROM documents
  WHERE dossier_id = dossier_uuid;
$$ LANGUAGE SQL STABLE;
```

---

## 🔐 Authentication Migration

### Adım 1: Supabase Auth Configuration

1. Supabase Dashboard → Authentication → Providers
2. **Email Provider:** Enable et (default enabled)
3. **OAuth Providers:** Google ve GitHub enable et

**Google OAuth Setup:**

1. [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials
2. "Create Credentials" → "OAuth 2.0 Client ID"
3. Application type: "Web application"
4. Authorized redirect URIs: `https://[PROJECT_ID].supabase.co/auth/v1/callback`
5. Client ID ve Client Secret'ı kopyala
6. Supabase Dashboard → Authentication → Providers → Google
7. Client ID ve Client Secret'ı yapıştır
8. "Save" butonuna tıkla

**GitHub OAuth Setup:**

1. GitHub → Settings → Developer settings → OAuth Apps → New OAuth App
2. Application name: "MonOPCO v3"
3. Homepage URL: `https://www.monopco.fr`
4. Authorization callback URL: `https://[PROJECT_ID].supabase.co/auth/v1/callback`
5. Client ID ve Client Secret'ı kopyala
6. Supabase Dashboard → Authentication → Providers → GitHub
7. Client ID ve Client Secret'ı yapıştır
8. "Save" butonuna tıkla

### Adım 2: Email Templates

1. Supabase Dashboard → Authentication → Email Templates
2. **Confirm signup** template'ini customize et
3. **Reset password** template'ini customize et
4. **Magic Link** template'ini customize et (eğer kullanılacaksa)

### Adım 3: Redirect URLs

1. Supabase Dashboard → Authentication → URL Configuration
2. **Site URL:** `https://www.monopco.fr`
3. **Redirect URLs:** 
   - `https://www.monopco.fr/auth/callback`
   - `http://localhost:3000/auth/callback` (development)

---

## 📦 Storage Migration

### Adım 1: Storage Bucket Oluşturma

1. Supabase Dashboard → Storage
2. "New bucket" butonuna tıkla
3. Bucket bilgilerini doldur:
   - **Name:** monopco-documents
   - **Public bucket:** ✅ (checked)
4. "Create bucket" butonuna tıkla

### Adım 2: Storage Policies

1. Bucket'a tıkla → Policies
2. "New policy" butonuna tıkla
3. Aşağıdaki policies'leri ekle:

**Upload Policy:**

```sql
CREATE POLICY "Users can upload to own folder"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'monopco-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

**Select Policy:**

```sql
CREATE POLICY "Users can view own files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'monopco-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

**Delete Policy:**

```sql
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'monopco-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

### Adım 3: Storage Configuration

1. Supabase Dashboard → Storage → Settings
2. **File size limit:** 50 MB (veya ihtiyaca göre)
3. **Allowed MIME types:** 
   - `application/pdf`
   - `application/msword`
   - `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
   - `application/vnd.ms-excel`
   - `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
   - `image/jpeg`
   - `image/png`

---

## 🔌 Backend Integration

### Adım 1: Supabase Client Setup

1. Supabase Dashboard → Settings → API
2. **Project URL** ve **anon public** key'i kopyala
3. `.env` dosyasına ekle:

```bash
VITE_SUPABASE_URL=https://[PROJECT_ID].supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Adım 2: Supabase Client Initialization

`client/src/lib/supabase.ts` dosyasını oluştur:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### Adım 3: Auth Hook

`client/src/hooks/useAuth.ts` dosyasını oluştur:

```typescript
import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signUp = async (email: string, password: string, metadata: any) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { data, error };
  };

  const signInWithGitHub = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { data, error };
  };

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    signInWithGitHub,
  };
}
```

### Adım 4: Database Queries

`client/src/lib/database.ts` dosyasını oluştur:

```typescript
import { supabase } from './supabase';

export const database = {
  // Dossiers
  async getDossiers() {
    const { data, error } = await supabase
      .from('dossiers')
      .select('*')
      .order('date_creation', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getDossier(id: string) {
    const { data, error } = await supabase
      .from('dossiers')
      .select(`
        *,
        documents (*),
        emails (*)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async createDossier(dossier: { titre: string; description?: string }) {
    const { data, error } = await supabase
      .from('dossiers')
      .insert(dossier)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateDossier(id: string, updates: any) {
    const { data, error } = await supabase
      .from('dossiers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteDossier(id: string) {
    const { error } = await supabase
      .from('dossiers')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Documents
  async uploadDocument(file: File, dossierId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Upload to storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `${user.id}/${dossierId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('monopco-documents')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('monopco-documents')
      .getPublicUrl(filePath);

    // Save metadata to database
    const { data, error } = await supabase
      .from('documents')
      .insert({
        dossier_id: dossierId,
        nom_fichier: file.name,
        type_fichier: file.type,
        taille_fichier: file.size,
        url_stockage: publicUrl,
        storage_path: filePath,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteDocument(id: string, storagePath: string) {
    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('monopco-documents')
      .remove([storagePath]);

    if (storageError) throw storageError;

    // Delete from database
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};
```

---

## 🎨 Frontend Integration

### Adım 1: Login Page

```typescript
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

export default function LoginPage() {
  const { signIn, signInWithGoogle, signInWithGitHub } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signIn(email, password);
    
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Login successful!');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md p-8">
        <h1 className="text-2xl font-bold mb-6">Login to MonOPCO</h1>
        
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Loading...' : 'Login'}
          </Button>
        </form>

        <div className="mt-6 space-y-2">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => signInWithGoogle()}
          >
            Login with Google
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => signInWithGitHub()}
          >
            Login with GitHub
          </Button>
        </div>
      </Card>
    </div>
  );
}
```

### Adım 2: Protected Route

```typescript
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'wouter';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}
```

---

## 🚀 Deployment

### Adım 1: Vercel Environment Variables

1. Vercel Dashboard → Project → Settings → Environment Variables
2. Aşağıdaki variables'ları ekle:

```
VITE_SUPABASE_URL=https://[PROJECT_ID].supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_APP_TITLE=MonOPCO v3
VITE_APP_LOGO=/logo.svg
```

### Adım 2: Deploy

1. GitHub'a push yap
2. Vercel otomatik olarak deploy edecek
3. Deployment tamamlandığında test et

---

## ✅ Migration Checklist

### Database
- [ ] Supabase project oluşturuldu
- [ ] Database schema migrate edildi
- [ ] RLS policies tanımlandı
- [ ] Database functions oluşturuldu (opsiyonel)

### Authentication
- [ ] Email provider enable edildi
- [ ] Google OAuth configure edildi
- [ ] GitHub OAuth configure edildi
- [ ] Email templates customize edildi
- [ ] Redirect URLs tanımlandı

### Storage
- [ ] Storage bucket oluşturuldu
- [ ] Storage policies tanımlandı
- [ ] File size limits configure edildi
- [ ] Allowed MIME types tanımlandı

### Backend
- [ ] Supabase client initialize edildi
- [ ] Auth hook oluşturuldu
- [ ] Database query functions yazıldı
- [ ] File upload logic implement edildi

### Frontend
- [ ] Login page oluşturuldu
- [ ] Protected routes implement edildi
- [ ] Dashboard UI güncellendi
- [ ] File upload UI eklendi

### Deployment
- [ ] Environment variables Vercel'e eklendi
- [ ] Production deployment yapıldı
- [ ] Tüm features test edildi

---

**Hazırlayan:** Manus AI  
**Tarih:** 26 Kasım 2025  
**Versiyon:** 1.0
