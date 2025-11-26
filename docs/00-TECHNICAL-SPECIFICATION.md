# MonOPCO v3 - Teknik Spesifikasyon Dokümantasyonu

## 📋 Proje Genel Bakış

MonOPCO v3, Fransız şirketlerin OPCO (Opérateurs de Compétences) ile ilgili dosya ve belge yönetimini kolaylaştıran modern bir web uygulamasıdır. Proje, Neon PostgreSQL'den Supabase'e geçiş yaparak daha güvenli, ölçeklenebilir ve bakımı kolay bir altyapıya kavuşturulmuştur.

---

## 🎯 Proje Hedefleri

### Temel Hedefler

MonOPCO platformu, Fransız şirketlerin mesleki eğitim finansmanı için OPCO (Opérateurs de Compétences) kurumlarıyla etkileşimlerini dijitalleştirmeyi amaçlar. Platform, şirketlerin eğitim dosyalarını oluşturmasını, belgelerini yüklemesini, başvuru süreçlerini takip etmesini ve OPCO ile iletişimini merkezi bir sistemde yönetmesini sağlar.

### İş Gereksinimleri

**Kullanıcı Yönetimi:** Şirket temsilcileri platforma kayıt olabilir, SIRET numarası ile şirket bilgilerini doğrulayabilir ve profil bilgilerini yönetebilir. Sistem, kullanıcıların kimlik doğrulamasını güvenli bir şekilde gerçekleştirir ve oturum yönetimini otomatik olarak halleder.

**Dosya Yönetimi:** Kullanıcılar OPCO başvuruları için dosya oluşturabilir, her dosyaya başlık ve açıklama ekleyebilir ve dosya durumunu (taslak, devam eden, tamamlanmış) takip edebilir. Her dosya, ilgili belgeleri ve e-posta geçmişini içeren merkezi bir konteyner görevi görür.

**Belge Yönetimi:** Kullanıcılar dossier'lere PDF, Word, Excel gibi belgeleri yükleyebilir. Sistem, belge metadata'sını (dosya adı, boyut, tür, yükleme tarihi) veritabanında saklar ve dosya içeriğini güvenli cloud storage'da barındırır. Belgeler, dosya bazında organize edilir ve kolayca erişilebilir hale getirilir.

**E-posta Yönetimi:** Platform, OPCO ile yapılan e-posta iletişimini kaydeder. Kullanıcılar, gönderilen e-postaları görüntüleyebilir, e-posta durumunu (beklemede, gönderildi, başarısız) takip edebilir ve geçmiş iletişim geçmişine erişebilir.

**Audit ve Güvenlik:** Sistem, tüm kullanıcı eylemlerini (dosya oluşturma, belge yükleme, e-posta gönderme) log kaydı altına alır. Bu loglar, güvenlik denetimi ve sorun giderme için kullanılabilir. IP adresleri ve timestamp'ler otomatik olarak kaydedilir.

### Teknik Hedefler

**Modern Teknoloji Stack:** Proje, React 19, Tailwind CSS 4, tRPC 11 ve Supabase gibi güncel teknolojileri kullanarak modern bir geliştirme deneyimi sunar. TypeScript, end-to-end tip güvenliği sağlar ve geliştirme sürecini hızlandırır.

**Supabase Entegrasyonu:** Supabase, authentication, database ve storage işlevlerini tek platformda birleştirir. Built-in JWT yönetimi, OAuth provider desteği, Row Level Security (RLS) ve otomatik API generation gibi özellikler, geliştirme süresini önemli ölçüde azaltır.

**Güvenlik ve Ölçeklenebilirlik:** Row Level Security (RLS) politikaları, veritabanı seviyesinde erişim kontrolü sağlar. Kullanıcılar yalnızca kendi verilerine erişebilir. Supabase'in global CDN ve connection pooling özellikleri, yüksek trafikte bile performansı garanti eder.

**Developer Experience:** tRPC, REST API yerine type-safe prosedürler kullanarak frontend-backend iletişimini basitleştirir. Drizzle ORM, SQL sorgularını TypeScript ile yazılabilir hale getirir. Hot module replacement ve fast refresh, geliştirme döngüsünü hızlandırır.

---

## 🏗️ Sistem Mimarisi

### Genel Mimari

MonOPCO v3, modern bir **JAMstack** mimarisini takip eder. Frontend, React tabanlı bir Single Page Application (SPA) olarak çalışır ve Vercel üzerinde statik olarak host edilir. Backend, Supabase'in sunduğu PostgreSQL database, authentication servisleri ve object storage üzerine kurulmuştur. tRPC, frontend ve backend arasında type-safe bir köprü görevi görür.

**Frontend Katmanı:** React 19 ve Tailwind CSS 4 ile oluşturulmuş modern bir kullanıcı arayüzü. Wouter ile client-side routing, TanStack Query ile veri yönetimi ve shadcn/ui ile tutarlı component library sağlanır. Vite build tool, hızlı geliştirme ve optimized production build'leri sunar.

**Backend Katmanı:** Supabase PostgreSQL database, kullanıcı verilerini, dosyaları, belgeleri ve logları saklar. Supabase Auth, JWT tabanlı authentication ve OAuth provider entegrasyonunu yönetir. Supabase Storage, belge dosyalarını S3-compatible object storage'da barındırır. tRPC procedures, API endpoint'lerini type-safe bir şekilde tanımlar.

**Deployment Katmanı:** Vercel, frontend ve serverless functions'ları global edge network üzerinde host eder. Supabase, database ve storage için managed infrastructure sağlar. GitHub Actions, continuous integration ve deployment pipeline'ını otomatikleştirir.

### Veri Akışı

**Authentication Flow:** Kullanıcı, login sayfasından email/password veya OAuth provider ile giriş yapar. Supabase Auth, kullanıcıyı doğrular ve JWT access token + refresh token döner. Frontend, token'ları otomatik olarak yönetir ve her API isteğine ekler. Backend, JWT'yi doğrular ve kullanıcı bilgilerini context'e ekler.

**Data Fetching Flow:** Frontend, tRPC hook'ları (`useQuery`, `useMutation`) ile backend prosedürlerini çağırır. tRPC, HTTP POST isteği olarak `/api/trpc` endpoint'ine gönderir. Backend, JWT'yi doğrular, RLS policy'lerini uygular ve Drizzle ORM ile database sorgusunu çalıştırır. Sonuç, SuperJSON ile serialize edilir ve frontend'e döner. TanStack Query, sonucu cache'ler ve UI'ı günceller.

**File Upload Flow:** Kullanıcı, file input ile belge seçer. Frontend, dosyayı base64 veya FormData olarak backend'e gönderir. Backend, dosyayı Supabase Storage'a yükler ve public URL alır. Metadata (dosya adı, boyut, URL) database'e kaydedilir. Frontend, yükleme tamamlandığında UI'ı günceller ve kullanıcıya bildirim gösterir.

---

## 💾 Database Schema

### users Tablosu

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_siret ON users(entreprise_siret);
```

**Açıklama:** Kullanıcı bilgilerini saklar. Supabase Auth ile entegre çalışır. `id` kolonu, Supabase Auth'un `auth.users` tablosundaki `id` ile eşleşir. `role` kolonu, role-based access control için kullanılır (entreprise, admin). `entreprise_siret` kolonu, Fransız şirket doğrulama numarasıdır ve unique constraint'e sahiptir.

**RLS Policy:**
```sql
-- Kullanıcılar yalnızca kendi kayıtlarını görebilir
CREATE POLICY "Users can view own record"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Kullanıcılar kendi kayıtlarını güncelleyebilir
CREATE POLICY "Users can update own record"
  ON users FOR UPDATE
  USING (auth.uid() = id);
```

### dossiers Tablosu

```sql
CREATE TABLE dossiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  titre VARCHAR(255) NOT NULL,
  description TEXT,
  statut VARCHAR(50) DEFAULT 'brouillon',
  date_creation TIMESTAMPTZ DEFAULT NOW(),
  date_modification TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_dossiers_user_id ON dossiers(user_id);
CREATE INDEX idx_dossiers_statut ON dossiers(statut);
```

**Açıklama:** OPCO başvuru dosyalarını saklar. Her dosya bir kullanıcıya aittir ve cascade delete ile kullanıcı silindiğinde dosyalar da silinir. `statut` kolonu, dosya durumunu takip eder (brouillon, en_cours, termine). `date_modification` kolonu, her güncellemede otomatik olarak güncellenir.

**RLS Policy:**
```sql
-- Kullanıcılar yalnızca kendi dosyalarını görebilir
CREATE POLICY "Users can view own dossiers"
  ON dossiers FOR SELECT
  USING (auth.uid() = user_id);

-- Kullanıcılar kendi dosyalarını oluşturabilir
CREATE POLICY "Users can create own dossiers"
  ON dossiers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Kullanıcılar kendi dosyalarını güncelleyebilir
CREATE POLICY "Users can update own dossiers"
  ON dossiers FOR UPDATE
  USING (auth.uid() = user_id);

-- Kullanıcılar kendi dosyalarını silebilir
CREATE POLICY "Users can delete own dossiers"
  ON dossiers FOR DELETE
  USING (auth.uid() = user_id);
```

### documents Tablosu

```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dossier_id UUID REFERENCES dossiers(id) ON DELETE CASCADE,
  nom_fichier VARCHAR(255) NOT NULL,
  type_fichier VARCHAR(100),
  taille_fichier INTEGER,
  url_stockage TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  date_upload TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_documents_dossier_id ON documents(dossier_id);
CREATE INDEX idx_documents_uploaded_by ON documents(uploaded_by);
```

**Açıklama:** Dosyalara ait belgelerin metadata'sını saklar. Asıl dosya içeriği Supabase Storage'da tutulur. `url_stockage` kolonu, public URL'i saklar. `storage_path` kolonu, Supabase Storage'daki dosya yolunu saklar (silme işlemi için gerekli). `uploaded_by` kolonu, belgeyi yükleyen kullanıcıyı takip eder.

**RLS Policy:**
```sql
-- Kullanıcılar yalnızca kendi dosyalarına ait belgeleri görebilir
CREATE POLICY "Users can view own documents"
  ON documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM dossiers
      WHERE dossiers.id = documents.dossier_id
      AND dossiers.user_id = auth.uid()
    )
  );

-- Kullanıcılar kendi dosyalarına belge yükleyebilir
CREATE POLICY "Users can upload documents to own dossiers"
  ON documents FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM dossiers
      WHERE dossiers.id = documents.dossier_id
      AND dossiers.user_id = auth.uid()
    )
  );

-- Kullanıcılar kendi belgelerini silebilir
CREATE POLICY "Users can delete own documents"
  ON documents FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM dossiers
      WHERE dossiers.id = documents.dossier_id
      AND dossiers.user_id = auth.uid()
    )
  );
```

### emails Tablosu

```sql
CREATE TABLE emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  dossier_id UUID REFERENCES dossiers(id) ON DELETE CASCADE,
  destinataire VARCHAR(255) NOT NULL,
  sujet VARCHAR(255) NOT NULL,
  contenu TEXT NOT NULL,
  statut VARCHAR(50) DEFAULT 'en_attente',
  date_envoi TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_emails_user_id ON emails(user_id);
CREATE INDEX idx_emails_dossier_id ON emails(dossier_id);
CREATE INDEX idx_emails_statut ON emails(statut);
```

**Açıklama:** OPCO ile yapılan e-posta iletişimini saklar. Her e-posta bir dosyaya bağlıdır. `statut` kolonu, e-posta durumunu takip eder (en_attente, envoye, echec). `date_envoi` kolonu, e-posta gönderildiğinde doldurulur.

**RLS Policy:**
```sql
-- Kullanıcılar yalnızca kendi e-postalarını görebilir
CREATE POLICY "Users can view own emails"
  ON emails FOR SELECT
  USING (auth.uid() = user_id);

-- Kullanıcılar kendi e-postalarını oluşturabilir
CREATE POLICY "Users can create own emails"
  ON emails FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### logs Tablosu

```sql
CREATE TABLE logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(255) NOT NULL,
  details JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_logs_user_id ON logs(user_id);
CREATE INDEX idx_logs_created_at ON logs(created_at);
CREATE INDEX idx_logs_action ON logs(action);
```

**Açıklama:** Sistem audit loglarını saklar. Her kullanıcı eylemi (dosya oluşturma, belge yükleme, e-posta gönderme) kaydedilir. `details` kolonu, JSONB formatında ek bilgileri saklar. `ip_address` kolonu, güvenlik denetimi için kullanılır.

**RLS Policy:**
```sql
-- Sadece admin kullanıcılar logları görebilir
CREATE POLICY "Only admins can view logs"
  ON logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );
```

---

## 🔐 Authentication & Authorization

### Supabase Auth Entegrasyonu

MonOPCO v3, Supabase Auth'u kullanarak güvenli ve ölçeklenebilir bir authentication sistemi sağlar. Supabase Auth, JWT tabanlı session yönetimi, OAuth provider entegrasyonu, email verification ve password reset gibi özellikleri out-of-the-box sunar.

**Authentication Akışı:**

1. **Kayıt (Sign Up):** Kullanıcı, email ve password ile kayıt olur. Supabase Auth, kullanıcıyı `auth.users` tablosuna ekler ve email verification maili gönderir. Frontend, kullanıcıyı otomatik olarak login eder ve JWT token alır.

2. **Giriş (Sign In):** Kullanıcı, email ve password ile giriş yapar. Supabase Auth, credentials'ları doğrular ve JWT access token + refresh token döner. Frontend, token'ları `localStorage` veya `sessionStorage`'da saklar ve her API isteğine ekler.

3. **OAuth Login:** Kullanıcı, Google veya GitHub ile giriş yapabilir. Supabase Auth, OAuth flow'unu yönetir ve kullanıcıyı redirect eder. Callback sonrası, JWT token'lar otomatik olarak alınır ve session başlatılır.

4. **Token Refresh:** Access token'ın süresi dolduğunda, Supabase client otomatik olarak refresh token ile yeni access token alır. Bu işlem, kullanıcıya görünmez şekilde arka planda gerçekleşir.

5. **Logout:** Kullanıcı logout yaptığında, Supabase Auth session'ı sonlandırır ve token'ları invalidate eder. Frontend, local storage'ı temizler ve kullanıcıyı login sayfasına yönlendirir.

### Row Level Security (RLS)

Supabase'in Row Level Security (RLS) özelliği, veritabanı seviyesinde erişim kontrolü sağlar. RLS policy'leri, her tablo için tanımlanır ve kullanıcıların yalnızca kendi verilerine erişmesini garanti eder.

**RLS Policy Örnekleri:**

```sql
-- Kullanıcılar yalnızca kendi dosyalarını görebilir
CREATE POLICY "Users can view own dossiers"
  ON dossiers FOR SELECT
  USING (auth.uid() = user_id);

-- Kullanıcılar kendi dosyalarını oluşturabilir
CREATE POLICY "Users can create own dossiers"
  ON dossiers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admin kullanıcılar tüm logları görebilir
CREATE POLICY "Admins can view all logs"
  ON logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );
```

**RLS Avantajları:**

- **Güvenlik:** Backend kod hatası olsa bile, veritabanı seviyesinde erişim kontrolü sağlanır.
- **Basitlik:** API endpoint'lerinde manuel authorization kontrolü gerekmez.
- **Performans:** PostgreSQL, RLS policy'lerini optimize eder ve sorgu performansını artırır.

### Role-Based Access Control (RBAC)

MonOPCO v3, iki temel rol tanımlar: `entreprise` (şirket kullanıcısı) ve `admin` (yönetici). `users` tablosundaki `role` kolonu, kullanıcının rolünü saklar.

**Rol Tanımları:**

- **entreprise:** Standart şirket kullanıcısı. Kendi dosyalarını, belgelerini ve e-postalarını yönetebilir. Diğer kullanıcıların verilerine erişemez.
- **admin:** Sistem yöneticisi. Tüm kullanıcıların verilerine erişebilir, sistem loglarını görüntüleyebilir ve kullanıcı yönetimi yapabilir.

**Backend'de Rol Kontrolü:**

```typescript
// tRPC procedure'de rol kontrolü
export const adminOnlyProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
  return next({ ctx });
});

// Kullanım örneği
export const appRouter = router({
  admin: router({
    getAllUsers: adminOnlyProcedure.query(async () => {
      return await db.select().from(users);
    }),
  }),
});
```

**Frontend'de Rol Kontrolü:**

```typescript
// useAuth hook'u ile rol kontrolü
const { user } = useAuth();

if (user?.role === 'admin') {
  // Admin-only UI göster
  return <AdminPanel />;
}

return <UserDashboard />;
```

---

## 📦 Storage Architecture

### Supabase Storage

MonOPCO v3, belge dosyalarını Supabase Storage'da saklar. Supabase Storage, S3-compatible bir object storage servisidir ve CDN entegrasyonu, otomatik image optimization ve güvenli file access özellikleri sunar.

**Storage Bucket Yapısı:**

```
monopco-documents/
├── {user_id}/
│   ├── {dossier_id}/
│   │   ├── {document_id}-{filename}.pdf
│   │   ├── {document_id}-{filename}.docx
│   │   └── {document_id}-{filename}.xlsx
```

**Bucket Policy:**

```sql
-- Kullanıcılar yalnızca kendi klasörlerine dosya yükleyebilir
CREATE POLICY "Users can upload to own folder"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'monopco-documents' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Kullanıcılar yalnızca kendi dosyalarını görebilir
CREATE POLICY "Users can view own files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'monopco-documents' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Kullanıcılar yalnızca kendi dosyalarını silebilir
CREATE POLICY "Users can delete own files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'monopco-documents' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
```

### File Upload Flow

**Frontend:**

```typescript
// File upload component
const uploadDocument = async (file: File, dossierId: string) => {
  const { data, error } = await supabase.storage
    .from('monopco-documents')
    .upload(`${user.id}/${dossierId}/${uuidv4()}-${file.name}`, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) throw error;

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('monopco-documents')
    .getPublicUrl(data.path);

  // Save metadata to database
  await trpc.documents.create.mutate({
    dossierId,
    nomFichier: file.name,
    typeFichier: file.type,
    tailleFichier: file.size,
    urlStockage: publicUrl,
    storagePath: data.path,
  });
};
```

**Backend:**

```typescript
// tRPC procedure for saving document metadata
export const documentsRouter = router({
  create: protectedProcedure
    .input(z.object({
      dossierId: z.string().uuid(),
      nomFichier: z.string(),
      typeFichier: z.string(),
      tailleFichier: z.number(),
      urlStockage: z.string().url(),
      storagePath: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Verify user owns the dossier
      const dossier = await db.query.dossiers.findFirst({
        where: eq(dossiers.id, input.dossierId),
      });

      if (!dossier || dossier.userId !== ctx.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      // Insert document metadata
      const [document] = await db.insert(documents).values({
        dossierId: input.dossierId,
        nomFichier: input.nomFichier,
        typeFichier: input.typeFichier,
        tailleFichier: input.tailleFichier,
        urlStockage: input.urlStockage,
        storagePath: input.storagePath,
        uploadedBy: ctx.user.id,
      }).returning();

      return document;
    }),
});
```

---

## 🎨 Frontend Architecture

### Technology Stack

**Core Framework:** React 19 ile modern component-based architecture. Hooks, Context API ve Suspense ile state management ve data fetching.

**Styling:** Tailwind CSS 4 ile utility-first styling. shadcn/ui component library ile tutarlı ve accessible UI components. CSS variables ile theme management.

**Routing:** Wouter ile lightweight client-side routing. React Router'a göre daha küçük bundle size ve daha basit API.

**Data Fetching:** TanStack Query (React Query) ile server state management. Automatic caching, background refetching ve optimistic updates.

**Type Safety:** TypeScript ile end-to-end type safety. tRPC ile backend-frontend arasında otomatik type inference.

**Build Tool:** Vite ile fast development server ve optimized production builds. Hot Module Replacement (HMR) ile instant feedback.

### Component Structure

```
client/src/
├── components/
│   ├── ui/                    # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   ├── DashboardLayout.tsx    # Main layout with sidebar
│   ├── DossierCard.tsx        # Dossier list item
│   ├── DocumentUpload.tsx     # File upload component
│   └── EmailComposer.tsx      # Email composition form
├── pages/
│   ├── Home.tsx               # Landing page
│   ├── Dashboard.tsx          # User dashboard
│   ├── Dossiers.tsx           # Dossier list
│   ├── DossierDetail.tsx      # Single dossier view
│   ├── Profile.tsx            # User profile
│   └── Admin.tsx              # Admin panel
├── contexts/
│   ├── ThemeContext.tsx       # Theme provider
│   └── AuthContext.tsx        # Auth state (via Supabase)
├── hooks/
│   ├── useAuth.ts             # Auth hook
│   ├── useDossiers.ts         # Dossiers data hook
│   └── useDocuments.ts        # Documents data hook
├── lib/
│   ├── trpc.ts                # tRPC client setup
│   ├── supabase.ts            # Supabase client setup
│   └── utils.ts               # Utility functions
├── App.tsx                    # Route definitions
└── main.tsx                   # App entry point
```

### Design System

**Color Palette:**

MonOPCO v3, profesyonel ve modern bir görünüm için mavi tonlarını temel alır. Tailwind CSS variables ile theme management yapılır.

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96.1%;
  --secondary-foreground: 222.2 47.4% 11.2%;
  --accent: 210 40% 96.1%;
  --accent-foreground: 222.2 47.4% 11.2%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;
  --border: 214.3 31.8% 91.4%;
  --radius: 0.5rem;
}
```

**Typography:**

- **Font Family:** Inter (Google Fonts)
- **Headings:** font-semibold, tracking-tight
- **Body:** font-normal, leading-relaxed
- **Code:** font-mono

**Spacing:**

Tailwind'in default spacing scale'i kullanılır (4px base unit).

**Shadows:**

```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
```

### UI Components

**DashboardLayout:**

Sidebar navigation ile persistent layout. User profile, navigation links ve logout button içerir.

```typescript
<DashboardLayout>
  <DashboardLayout.Header>
    <h1>Dashboard</h1>
  </DashboardLayout.Header>
  <DashboardLayout.Content>
    {/* Page content */}
  </DashboardLayout.Content>
</DashboardLayout>
```

**DossierCard:**

Dossier list item component. Dossier başlığı, açıklaması, durumu ve action buttons içerir.

```typescript
<DossierCard
  dossier={dossier}
  onEdit={() => handleEdit(dossier.id)}
  onDelete={() => handleDelete(dossier.id)}
  onView={() => navigate(`/dossiers/${dossier.id}`)}
/>
```

**DocumentUpload:**

Drag-and-drop file upload component. Progress indicator ve file preview içerir.

```typescript
<DocumentUpload
  dossierId={dossierId}
  onUploadComplete={(document) => {
    toast.success('Document uploaded successfully');
    refetch();
  }}
/>
```

---

## 🔌 API Architecture

### tRPC Procedures

MonOPCO v3, tRPC ile type-safe API procedures tanımlar. REST API yerine, prosedürler frontend'den direkt olarak çağrılabilir ve TypeScript type inference otomatik olarak çalışır.

**Router Structure:**

```typescript
export const appRouter = router({
  auth: authRouter,
  dossiers: dossiersRouter,
  documents: documentsRouter,
  emails: emailsRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
```

**Example Procedures:**

```typescript
// Dossiers Router
export const dossiersRouter = router({
  // List user's dossiers
  list: protectedProcedure.query(async ({ ctx }) => {
    return await db.query.dossiers.findMany({
      where: eq(dossiers.userId, ctx.user.id),
      orderBy: [desc(dossiers.dateCreation)],
    });
  }),

  // Get single dossier
  get: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const dossier = await db.query.dossiers.findFirst({
        where: and(
          eq(dossiers.id, input.id),
          eq(dossiers.userId, ctx.user.id)
        ),
        with: {
          documents: true,
          emails: true,
        },
      });

      if (!dossier) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      return dossier;
    }),

  // Create new dossier
  create: protectedProcedure
    .input(z.object({
      titre: z.string().min(1).max(255),
      description: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const [dossier] = await db.insert(dossiers).values({
        userId: ctx.user.id,
        titre: input.titre,
        description: input.description,
        statut: 'brouillon',
      }).returning();

      // Log action
      await db.insert(logs).values({
        userId: ctx.user.id,
        action: 'dossier_created',
        details: { dossierId: dossier.id, titre: input.titre },
        ipAddress: ctx.req.ip,
      });

      return dossier;
    }),

  // Update dossier
  update: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      titre: z.string().min(1).max(255).optional(),
      description: z.string().optional(),
      statut: z.enum(['brouillon', 'en_cours', 'termine']).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const existing = await db.query.dossiers.findFirst({
        where: and(
          eq(dossiers.id, input.id),
          eq(dossiers.userId, ctx.user.id)
        ),
      });

      if (!existing) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      const [updated] = await db.update(dossiers)
        .set({
          ...input,
          dateModification: new Date(),
        })
        .where(eq(dossiers.id, input.id))
        .returning();

      return updated;
    }),

  // Delete dossier
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const existing = await db.query.dossiers.findFirst({
        where: and(
          eq(dossiers.id, input.id),
          eq(dossiers.userId, ctx.user.id)
        ),
      });

      if (!existing) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      // Delete from database (cascade will handle documents and emails)
      await db.delete(dossiers).where(eq(dossiers.id, input.id));

      // Delete documents from storage
      const docs = await db.query.documents.findMany({
        where: eq(documents.dossierId, input.id),
      });

      for (const doc of docs) {
        await supabase.storage
          .from('monopco-documents')
          .remove([doc.storagePath]);
      }

      return { success: true };
    }),
});
```

### Frontend Usage

```typescript
// List dossiers
const { data: dossiers, isLoading } = trpc.dossiers.list.useQuery();

// Create dossier
const createMutation = trpc.dossiers.create.useMutation({
  onSuccess: () => {
    toast.success('Dossier created successfully');
    trpc.useUtils().dossiers.list.invalidate();
  },
});

const handleCreate = (data: { titre: string; description?: string }) => {
  createMutation.mutate(data);
};

// Delete dossier with optimistic update
const deleteMutation = trpc.dossiers.delete.useMutation({
  onMutate: async ({ id }) => {
    // Cancel outgoing refetches
    await trpc.useUtils().dossiers.list.cancel();

    // Snapshot previous value
    const previous = trpc.useUtils().dossiers.list.getData();

    // Optimistically update
    trpc.useUtils().dossiers.list.setData(undefined, (old) =>
      old?.filter((d) => d.id !== id)
    );

    return { previous };
  },
  onError: (err, variables, context) => {
    // Rollback on error
    trpc.useUtils().dossiers.list.setData(undefined, context?.previous);
    toast.error('Failed to delete dossier');
  },
  onSettled: () => {
    // Refetch after mutation
    trpc.useUtils().dossiers.list.invalidate();
  },
});
```

---

## 🚀 Deployment

### Vercel Deployment

MonOPCO v3, Vercel üzerinde deploy edilir. Vercel, global edge network, automatic HTTPS, custom domains ve serverless functions desteği sunar.

**Deployment Steps:**

1. **GitHub Repository:** Proje GitHub'a push edilir.
2. **Vercel Project:** Vercel dashboard'da yeni project oluşturulur ve GitHub repo'su bağlanır.
3. **Environment Variables:** Supabase credentials ve diğer secrets Vercel'e eklenir.
4. **Build Configuration:** Vercel otomatik olarak Vite build komutunu algılar ve çalıştırır.
5. **Deploy:** Her commit otomatik olarak deploy edilir. Production branch (main) için production deployment, diğer branch'ler için preview deployment oluşturulur.

**Environment Variables:**

```
# Supabase
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# App Configuration
VITE_APP_TITLE=MonOPCO v3
VITE_APP_LOGO=/logo.svg
```

### Supabase Setup

**Project Creation:**

1. Supabase dashboard'da yeni project oluştur
2. Database password belirle
3. Region seç (Europe West - Paris önerilir)

**Database Setup:**

1. SQL Editor'da schema migration scriptlerini çalıştır
2. RLS policies'leri enable et
3. Storage bucket oluştur (`monopco-documents`)
4. Storage policies'leri tanımla

**Auth Configuration:**

1. Email/Password provider'ı enable et
2. OAuth providers (Google, GitHub) ekle ve credentials gir
3. Email templates'leri customize et (verification, password reset)
4. Redirect URLs'leri configure et (Vercel domain)

---

## 📊 Monitoring & Analytics

### Logging

Tüm kullanıcı eylemleri `logs` tablosuna kaydedilir. Log entry'leri şu bilgileri içerir:

- **user_id:** Eylemi gerçekleştiren kullanıcı
- **action:** Eylem tipi (dossier_created, document_uploaded, email_sent, vb.)
- **details:** JSONB formatında ek bilgiler
- **ip_address:** Kullanıcının IP adresi
- **created_at:** Eylem zamanı

**Log Actions:**

- `user_registered` - Yeni kullanıcı kaydı
- `user_logged_in` - Kullanıcı girişi
- `dossier_created` - Yeni dosya oluşturuldu
- `dossier_updated` - Dosya güncellendi
- `dossier_deleted` - Dosya silindi
- `document_uploaded` - Belge yüklendi
- `document_deleted` - Belge silindi
- `email_sent` - E-posta gönderildi

### Error Tracking

Frontend ve backend hataları, Sentry veya benzeri bir error tracking servisi ile izlenebilir (opsiyonel).

### Performance Monitoring

Vercel Analytics, sayfa yükleme süreleri, Core Web Vitals ve kullanıcı deneyimi metriklerini otomatik olarak toplar.

---

## 🧪 Testing Strategy

### Unit Tests

Vitest ile backend procedures ve utility functions test edilir.

**Example Test:**

```typescript
import { describe, it, expect } from 'vitest';
import { appRouter } from './routers';

describe('dossiers.create', () => {
  it('creates a new dossier', async () => {
    const caller = appRouter.createCaller(mockContext);
    const result = await caller.dossiers.create({
      titre: 'Test Dossier',
      description: 'Test description',
    });

    expect(result).toMatchObject({
      titre: 'Test Dossier',
      description: 'Test description',
      statut: 'brouillon',
    });
  });
});
```

### Integration Tests

tRPC procedures, gerçek database ile integration test edilir (test database kullanılır).

### E2E Tests (Opsiyonel)

Playwright veya Cypress ile critical user flows test edilir:

- User registration ve login
- Dossier oluşturma ve güncelleme
- Document upload
- Email gönderme

---

## 📚 Referanslar

1. [Supabase Documentation](https://supabase.com/docs) - Supabase resmi dokümantasyonu
2. [tRPC Documentation](https://trpc.io/docs) - tRPC resmi dokümantasyonu
3. [React 19 Documentation](https://react.dev) - React resmi dokümantasyonu
4. [Tailwind CSS Documentation](https://tailwindcss.com/docs) - Tailwind CSS resmi dokümantasyonu
5. [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview) - Drizzle ORM resmi dokümantasyonu
6. [Vercel Documentation](https://vercel.com/docs) - Vercel deployment dokümantasyonu

---

**Hazırlayan:** Manus AI  
**Tarih:** 26 Kasım 2025  
**Versiyon:** 1.0
