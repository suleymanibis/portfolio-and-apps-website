# Portfolio Hub — Uygulama Vitrini & Teknik Blog

Kendi geliştirdiğiniz uygulamaları sergileyebileceğiniz ve Markdown formatında teknik makaleler yazıp paylaşabileceğiniz modern Next.js Full-Stack web uygulaması.

## Özellikler
- **Uygulama Vitrini (`/apps`):** Kategori ve teknoloji bazlı arama/filtreleme, canlı demo, GitHub ve indirme bağlantıları, sürüm ve durum rozetleri (`Yayında`, `Açık Kaynak`, `Beta`, `Geliştiriliyor`).
- **Makale & Blog Sistemi (`/articles`):** Okuma süresi hesaplama, etiketleme, kod bloğu kopyalama butonları, paylaşım desteği.
- **Dahili Yönetim Paneli (`/admin`):**
  - Tarayıcı üzerinden yeni uygulama ekleme, düzenleme ve silme.
  - Canlı yan yana (Split) Markdown önizlemeli makale editörü ve taslak sistemi.
  - Bilgisayardan doğrudan görsel/ekran görüntüsü yükleme (`public/uploads`).
  - Site başlığı, biyografi ve sosyal medya linklerini tek tıkla güncelleme.
- **Koyu / Açık Tema (Dark / Light Mode):** Üst menüden anında geçiş.

## Çalıştırma

```bash
npm install
npm run dev
```

Tarayıcıda açın:
- Site: `http://localhost:3000`
- Yönetim Paneli: `http://localhost:3000/admin` (Varsayılan şifre `.env.local` içinde `admin123` olarak tanımlıdır)
