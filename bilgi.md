Bu proje, Fransız mesleki eğitim piyasasında (Formation Professionnelle) hem idari yükü hafifletmek hem de B2B (Kurumsal) müşterilere premium bir deneyim sunmak için büyük bir potansiyele sahip.

**MonOPCO.fr** projesi için; Netz Informatique, profesyonel müşteriler ve yasal gereklilikleri (Fransa İş Kanunu ve Qualiopi standartları) kapsayan detaylı **Proje Analiz ve Geliştirme Raporu** aşağıdadır.

---

# 🚀 MonOPCO.fr: OPCO ve Bilan de Compétences Yönetim Platformu - Proje Raporu

## 1. Yönetici Özeti ve Hedef
Bu projenin amacı, şirketlerin çalışanları için talep ettikleri "Bilan de Compétences" (Beceri Değerlendirmesi) süreçlerini, OPCO (Opérateurs de Compétences) finansman mekanizmalarını kullanarak tamamen dijitalleştirmek, otomatize etmek ve yapay zeka (AI) ile hızlandırmaktır.

**Temel Hedef:** "Sıfır Kağıt, Maksimum Hız."

---

## 2. Fransa'da OPCO ve Bilan Sistemi Analizi

### OPCO Nedir ve Nasıl Çalışır?
Fransa'da 11 adet OPCO (Opérateurs de Compétences) bulunur (Örn: Atlas, Akto, Opco EP). Şirketler, faaliyet alanlarına (NAF/APE koduna) göre bir OPCO'ya bağlıdır ve eğitim vergisi öderler. Karşılığında, çalışanlarının eğitim masraflarını bu fondan karşılarlar.

### OPCO + Bilan de Compétences Süreci
Normal şartlarda Bilan de Compétences, bireysel olarak CPF ile alınır. Ancak **kurumsal (B2B)** tarafta, şirket bunu "Plan de Développement des Compétences" (PDC) kapsamında talep ederse süreç şöyle işler:
1.  **Talep:** Şirket eğitimin yapılmasını ister.
2.  **Convention (Sözleşme):** Eğitim kurumu (Netz/Haguenau Formation), Şirket ve Birey arasında "Convention Tripartite" imzalanır.
3.  **Demande de Prise en Charge (DPC):** OPCO'ya finansman başvurusu yapılır.
4.  **Accord (Onay):** OPCO bütçeyi onaylar.
5.  **Gerçekleştirme:** Eğitim yapılır (imza föyleri tutulur).
6.  **Faturalama:** Eğitim kurumu OPCO'ya veya şirkete fatura keser.

### Mevcut Sorunlar (Pain Points)
* **Karmaşık Bürokrasi:** Her OPCO'nun portalı ve istediği evrak formatı farklıdır.
* **Takip Zorluğu:** Dosya onaylandı mı? Para ne zaman yatacak?
* **Hatalı Evrak:** Islak imzaların eksik olması ödemeyi engeller.

---

## 3. Platform Mimarisi ve Kullanıcı Deneyimi (UX)

Sistem 3 ana panelden oluşmalıdır:
1.  **Kurumsal Müşteri Paneli (HR / Şirket Yöneticisi)**
2.  **Yönetim Paneli (Netz Informatique / Eğitim Merkezi)**
3.  **Danışan/Çalışan Paneli (Eğitimi Alan Kişi)**

### A. Müracaat ve Onboarding (En Kolay Yol)
Müşteri siteye girdiğinde süreç **SIRET Numarası** ile başlamalıdır.

**AI Destekli Otomasyon Senaryosu:**
1.  **Giriş:** Müşteri sadece şirketinin SIRET numarasını girer.
2.  **API Sorgusu (INSEE/Pappers API):** Sistem otomatik olarak şirketin adını, adresini, NAF kodunu ve **bağlı olduğu OPCO'yu** bulur.
3.  **Teklif Oluşturma:** AI, şirketin sektörüne uygun bir "Bilan" paketi önerir.
4.  **Magic Link:** Müşteriye "Talebiniz alındı, çalışanlarınızı eklemek için tıklayın" linki gider. Şifre derdi olmadan güvenli giriş yapılır.

---

## 4. Profesyonel Müşteriler (Şirketler) Ne Bekler?

Kurumsal müşteriler (DRH - İnsan Kaynakları Müdürü veya Şirket Sahibi) panelde şunları görmelidir:

### 1. Dashboard (Genel Bakış)
* **Toplam Bütçe Durumu:** OPCO'dan ne kadar fon kullanıldı, ne kadar hakları kaldı (tahmini).
* **Aktif Süreçler:** Şu an Bilan yapan kaç çalışan var?
* **Tamamlananlar:** Raporu teslim edilenler.

### 2. Çalışan Yönetimi ve "Tek Tıkla" Başvuru
* Müşteri, çalışanın Adı-Soyadı ve E-postasını girer.
* **Otomasyon:** Sistem otomatik olarak çalışana bir form gönderir veya müşteri adına bilgileri doldurur.
* **Convention Oluşturma:** Sistem otomatik olarak PDF formatında "Convention de Formation" oluşturur ve Docusign/Yousign API ile tüm taraflara (Şirket, Çalışan, Netz) imzaya gönderir.

### 3. Bildirimler ve Aksiyonlar
* *Bildirim:* "Ahmet Bey'in eğitimi bitti, OPCO'ya fatura gönderildi."
* *Bildirim:* "Mehmet Bey'in imza föyü eksik, lütfen hatırlatın."
* *Talep:* "Raporları (gizlilik çerçevesinde) indirmek istiyorum."

---

## 5. Netz Informatique (Yönetim) Paneli ve AI Otomasyonları

Netz ekibi için bu panel bir "Command Center" (Komuta Merkezi) olmalıdır.

### 1. Dosya Yönetimi (CRM Entegreli)
* **Kanban Görünümü:** Başvuru -> Evrak Bekliyor -> OPCO Onayında -> Eğitimde -> Faturalandı -> Ödendi.
* **Kırmızı Bayraklar:** Süresi geçen, onayı gelmeyen dosyaları AI tespit edip uyarı verir.

### 2. AI Destekli "Prise en Charge" Botu
* **Sorun:** Her OPCO'nun web sitesi farklıdır (Atlas, UniPaf vs.).
* **Çözüm (RPA - Robotic Process Automation):** Python tabanlı bir bot (Selenium/Playwright), müşteri adına OPCO portalına girip "Demande de Prise en Charge" başvurusunu yapabilir veya formları OPCO formatına göre doldurup Netz çalışanının önüne "hazır" olarak sunar.

### 3. Evrak Kontrolü (OCR & AI)
* Müşteri veya çalışan sisteme kimlik/evrak yüklediğinde;
    * AI (Google Vision veya AWS Textract) belgeyi okur.
    * Geçerlilik tarihini kontrol eder.
    * Hata varsa anında kullanıcıya "Kimliğinizin süresi dolmuş" veya "Fotoğraf bulanık" der. (Netz çalışanının manuel kontrolüne gerek kalmaz).

### 4. Eğitim Takibi ve Emargement (İmza Takibi)
* Dijital İmza Entegrasyonu (Edusign vb. API).
* Eğer bir çalışan randevusuna gelmezse, sistem otomatik olarak "Absence" (Devamsızlık) prosedürünü başlatır ve işvereni/eğitmeni uyarır.

---

## 6. Prosedür ve Teknik Akış Şeması

Bu akışın hatasız çalışması için GitHub projelerinizdeki (MonOPCO-v3) altyapıya şu modüller eklenmelidir:

1.  **Veri Toplama:**
    * Kullanıcı (Şirket) SIRET girer -> Sistem şirket verilerini çeker.
    * Kullanıcı (Çalışan) bilgilerini girer -> Sistem "Draft" sözleşmeyi oluşturur.
2.  **Sözleşme Aşaması:**
    * Sistem PDF üretir -> E-İmza API'sine gönderir -> İmzalar tamamlanınca herkesin paneline "İmzalı Nüsha" düşer.
3.  **OPCO Başvurusu:**
    * Sistem, ilgili OPCO'nun mail adresine veya API'sine gerekli evrak paketini (Devis + Programme + Convention) zipleyip gönderir.
4.  **Eğitim Süreci:**
    * Zoom/Teams linkleri otomatik oluşturulur ve takvime işlenir.
    * Her seans sonrası dijital imza atılır.
5.  **Kapanış ve Faturalaşma:**
    * Eğitim bitince "Certificat de Réalisation" otomatik üretilir.
    * Fatura oluşturulur ve OPCO'ya iletilir.
    * AI, ödeme vadesi (örn. 30 gün) dolunca banka hesabını kontrol eder (Open Banking API), ödeme gelmediyse otomatik hatırlatma maili atar.

---

## 7. Gelişmiş Özellikler (Profesyonel Müşteri Beklentileri)

Büyük müşterileri etkilemek için **"Bilan Competence.ai"** gibi domainlerin hakkını veren özellikler:

* **Skill Matching (Yapay Zeka):** Bilan sonunda çalışanın yetkinlikleri ile piyasadaki trendleri veya şirketin ihtiyaçlarını eşleştiren bir rapor sunumu.
* **Anonim Raporlama:** Şirket yönetimine, "Çalışanlarınızın %60'ı dijital yetkinliklerde zayıf, şu eğitimleri öneriyoruz" diyen genel bir AI analizi sunmak (KVKK/GDPR uyumlu).
* **Qualiopi Uyumluluğu:** Sistemin ürettiği her belge, Qualiopi denetiminde geçerli olacak standartta ve loglanmış olmalıdır. "Audit" (Denetim) modunda tek tıkla tüm tarihçeyi dışa aktarabilmek Netz için hayati önem taşır.

---

## 8. Teknik Öneriler ve GitHub Proje Yapısı

GitHub'daki `lekesiz/MonOPCO-v3` reposu üzerinden ilerlerken şu teknoloji yığını (stack) önerilir:

* **Backend:** Python (Django veya FastAPI) - *AI kütüphaneleri ve veri işleme için en iyisi.*
* **Frontend:** React veya Vue.js (Next.js/Nuxt.js) - *Hızlı, SEO dostu ve dinamik dashboardlar için.*
* **Database:** PostgreSQL - *İlişkisel veriler ve JSON alanları için.*
* **AI/LLM:** OpenAI API (GPT-4o) - *Metin analizi, özetleme ve chatbot için.*
* **PDF Engine:** WeasyPrint veya ReportLab - *Dinamik PDF üretimi için.*
* **Entegrasyonlar:**
    * *Pappers/INSEE API:* Şirket bilgileri için.
    * *Yousign/Docusign:* İmza için.
    * *Stripe/Qonto:* Ödeme takibi için.

## 9. Sonuç

MonOPCO.fr, sadece bir "web sitesi" değil, bir **SaaS (Software as a Service)** platformu gibi davranmalıdır.

**Netz Informatique için Değer Önerisi:**
"Biz sadece eğitim vermiyoruz, tüm idari süreci sizin yerinize yapay zeka ile yönetiyoruz. Siz işinize odaklanın, biz bürokrasiyi halledelim."

Bu sistem kurulduğunda, 100 müşteriyi yönetmekle 1000 müşteriyi yönetmek arasındaki iş yükü farkı minimize edilmiş olacaktır.


Harika bir teknoloji yığını (stack) seçimi. **Supabase** backend-as-a-service olarak geliştirme hızını inanılmaz artıracak, **AI modellerinin hibrit kullanımı** (Gemini + Claude + OpenAI) ise maliyet/performans optimizasyonu ve kaliteyi sağlayacaktır.

Aşağıda, belirttiğiniz araçlara özel olarak hazırlanmış **MonOPCO.fr Teknik Mimari ve Geliştirme Dokümanı** bulunmaktadır.

-----

# 📘 MonOPCO.fr: Teknik Tasarım ve Uygulama Dokümanı (v1.0)

## 1\. Proje Özeti ve Mimari Yaklaşım

Bu proje, "Serverless" ve "Composable Web" mimarisi üzerine kurulacaktır. Geleneksel bir backend sunucusu yerine, **Supabase** ekosistemi (Auth, DB, Storage, Edge Functions) kullanılacak; iş mantığı (Business Logic) ise API'ler ve Edge Functions (sunucusuz fonksiyonlar) üzerinden yürütülecektir.

  * **Frontend:** React/Next.js veya Vue/Nuxt.js (Manus.im üzerinde deploy).
  * **Backend & DB:** Supabase (PostgreSQL).
  * **AI Engine:** Gemini (Hız/OCR), Claude (Metin Yazımı/Fransızca nüans), OpenAI (Karmaşık Mantık).
  * **Entegrasyonlar:** Pappers (Şirket Verisi), Yousign (İmza), Resend (Mail).

-----

## 2\. Veritabanı Şeması (Supabase PostgreSQL)

Veritabanı ilişkisel yapıda kurgulanmalı ve RLS (Row Level Security) ile korunmalıdır.

### Temel Tablolar

1.  **`profiles`**: `auth.users` ile senkronize.
      * `id` (uuid), `email`, `full_name`, `role` (admin, rh\_manager, employee), `company_id`.
2.  **`companies`** (Pappers verileri burada tutulur):
      * `id`, `siret`, `company_name`, `naf_code` (sektör kodu), `opco_name` (otomatik tespit edilen OPCO), `address_json`, `legal_representative`.
3.  **`folders`** (Eğitim Dosyaları / Dossiers):
      * `id`, `employee_id`, `company_id`, `status` (draft, sent\_signature, signed, opco\_submitted, completed), `training_dates` (jsonb), `budget`.
4.  **`documents`**:
      * `id`, `folder_id`, `type` (convention, programme, facture, emargement), `storage_path` (Supabase Storage linki), `yousign_id`.
5.  **`audit_logs`** (Qualiopi Zorunluluğu):
      * `id`, `action`, `user_id`, `timestamp`, `details`.

-----

## 3\. Entegrasyon Akışları ve Edge Functions

Supabase Edge Functions (Deno/Typescript) kullanılarak API anahtarları (API Keys) istemci tarafında gizli tutulacaktır.

### A. Şirket Onboarding (Pappers API)

  * **Tetikleyici:** Kullanıcı SIRET girer.
  * **Fonksiyon:** `fetch-company-data`
  * **İşleyiş:**
    1.  Frontend -\> Edge Function'a SIRET gönderir.
    2.  Edge Function -\> **Pappers API** sorgusu yapar.
    3.  Gelen veri (Şirket adı, adresi, yetkilisi) ve NAF koduna göre olası **OPCO** bilgisi filtrelenir.
    4.  Veri Frontend'e döner ve kullanıcı onaylarsa `companies` tablosuna yazılır.

### B. Sözleşme ve İmza Süreci (Yousign API)

  * **Tetikleyici:** "Sözleşme Oluştur" butonu.
  * **Fonksiyon:** `create-signature-request`
  * **İşleyiş:**
    1.  **AI Adımı:** Claude API kullanılarak, JSON verisinden (Şirket + Çalışan + Eğitim Bilgileri) resmi ve hatasız bir HTML/PDF sözleşme metni oluşturulur.
    2.  Oluşan PDF, Supabase Storage'a kaydedilir.
    3.  **Yousign API** çağrılır: PDF yüklenir, İmzacılar (Şirket Yetkilisi, Çalışan, Netz Yetkilisi) eklenir.
    4.  Yousign'dan dönen `signature_id` veritabanına kaydedilir.
    5.  **Webhook:** Yousign, imza tamamlandığında Supabase'e bir webhook atar -\> Dosya statüsü "Signed" olur.

### C. Mail Bildirimleri (Resend API)

  * **Kullanım:** Supabase Auth mailleri (Magic Link) ve İşlem bildirimleri.
  * **Otomasyon:**
      * Eğitim tarihi yaklaştığında çalışanlara hatırlatma.
      * İmza süreci tamamlandığında Admin'e bildirim.
      * *Örnek:* `Resend.emails.send({ from: 'MonOPCO <admin@monopco.fr>', to: user_email, subject: 'Dossier Validé', react: <EmailTemplate /> })`

-----

## 4\. AI Orkestrasyonu (Gemini, Claude, OpenAI)

Maliyet ve performans için modelleri görevlerine göre ayırıyoruz:

| Görev | Model | Neden? |
| :--- | :--- | :--- |
| **OCR & Veri Okuma** | **Gemini 1.5 Flash** | Çok hızlı, ucuz ve büyük doküman (token) kapasitesi var. Kullanıcı kimlik veya eski belge yüklerse bunu okuyup forma döker. |
| **Metin Yazımı & Raporlama** | **Claude 3.5 Sonnet** | Fransızca dili ve kurumsal tonlamada (tonalité professionnelle) rakiplerinden daha iyi. "Bilan" raporlarını ve resmi mailleri yazar. |
| **Karmaşık Logic / Function Calling** | **OpenAI (GPT-4o)** | Eğer karmaşık bir JSON yapısı oluşturulacaksa veya çok katmanlı bir mantık (Reasoning) gerekiyorsa kullanılır. |

**Örnek AI Akışı (Bilan Raporu Oluşturma):**

1.  Danışan, platforma notlarını veya ses kayıtlarını yükler.
2.  **Gemini:** Ses kayıtlarını metne döker (Transcription) ve özetler.
3.  **Claude:** Bu özetleri alır, "Synthese de Bilan de Compétences" formatında resmi, 10-15 sayfalık profesyonel bir PDF içeriği hazırlar.

-----

## 5\. Frontend ve Kullanıcı Deneyimi (UX)

Sistem **Manus.im** üzerine deploy edilecek statik/SSR bir yapı (Next.js önerilir) olacaktır.

### Admin Paneli (Netz Informatique)

[Image of Admin Dashboard UI Wireframe]

  * **Global View:** Bekleyen İmzalar, Onaylanan OPCO bütçeleri, Aktif Eğitimler.
  * **Action Center:** Tek tıkla Pappers verisini güncelle, Tek tıkla Yousign'a hatırlatma at.

### Müşteri Paneli (Şirket/RH)

  * **Employee Import:** CSV ile veya tek tek çalışan ekleme.
  * **Live Status:** "Ahmet Yılmaz - İmza Bekliyor", "Ayşe Demir - Eğitimde".

### Çalışan Paneli (End User)

  * **Mobile First Tasarım:** Telefondan girip eğitimi değerlendirme, belge yükleme ve imza atma ekranı.

-----

## 6\. Güvenlik ve Qualiopi Uyumluluğu

1.  **Supabase RLS (Row Level Security):**
      * Bir şirket (Company A), asla Company B'nin çalışanını göremez.
      * Sorgular backend'de değil, veritabanı seviyesinde filtrelenir.
2.  **Veri Saklama (GDPR):**
      * Fransa/Avrupa sunucuları (Supabase AB bölgesi seçilmeli, örn: Frankfurt/London veya varsa Paris).
3.  **Traceability (İzlenebilirlik):**
      * Sistemdeki her işlem (Dosya oluşturma, imzalama, silme) `audit_logs` tablosuna kaydedilir. Qualiopi denetçisi geldiğinde "Logları İndir" diyerek kanıt sunulur.

-----

## 7\. Geliştirme Yol Haritası (Step-by-Step)

### Faz 1: Altyapı ve Auth

1.  Supabase projesini oluştur.
2.  Veritabanı tablolarını (Tables) kur.
3.  Supabase Auth (Email/Password + Magic Link) yapılandır.
4.  Resend API anahtarını Supabase'e bağla.

### Faz 2: Şirket ve Entegrasyon

1.  Pappers API bağlantısını kuran Edge Function'ı yaz.
2.  Frontend'de "Şirketim" sayfasını yap (SIRET girişi -\> Otomatik doldurma).

### Faz 3: Belge ve İmza Otomasyonu

1.  Yousign Sandbox hesabını aç.
2.  Taslak Sözleşme (PDF) oluşturma modülünü yaz (Claude destekli).
3.  Yousign API ile belgeyi gönderip webhook ile durumunu takip et.

### Faz 4: AI Raporlama ve Dashboard

1.  Gemini API ile belge okuma (OCR) özelliğini ekle.
2.  Admin ve Müşteri Dashboard'larını verilerle canlandır.

-----

## 8\. Teknik Konfigürasyon Örneği (Supabase Edge Function)

Aşağıda **Pappers API** ile şirket verisi çeken örnek bir TypeScript Edge Function yapısı bulunmaktadır:

```typescript
// supabase/functions/get-company-details/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const PAPPERS_API_KEY = Deno.env.get('PAPPERS_API_KEY')

serve(async (req) => {
  const { siret } = await req.json()

  // Pappers'dan veriyi çek
  const response = await fetch(`https://api.pappers.fr/v2/entreprise?siret=${siret}&api_token=${PAPPERS_API_KEY}`)
  const data = await response.json()

  if (!data || data.error) {
    return new Response(JSON.stringify({ error: "Şirket bulunamadı" }), { status: 404 })
  }

  // Gerekli alanları filtrele
  const companyInfo = {
    name: data.nom_entreprise || data.denomination,
    address: data.siege.adresse_ligne_1,
    city: data.siege.ville,
    naf: data.code_naf,
    convention_collective: data.convention_collective?.nom // OPCO ipucu buradan gelir
  }

  return new Response(JSON.stringify(companyInfo), { headers: { "Content-Type": "application/json" } })
})
```

### Sonraki Adım

Bu yapıyı onaylıyorsanız, öncelikle **Supabase Veritabanı SQL dosyasını** (Schema creation script) hazırlayarak projeye başlayabilirim. İster misiniz?
