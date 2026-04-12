# Career Copilot Frontend

Next.js + Tailwind tabanlı frontend uygulaması, AI Career Copilot MVP için modern bir landing sayfası ve CV oluşturma arayüzü sunar.

## Çalıştırma

```bash
cd frontend
npm install
npm run dev
```

Frontend, `http://localhost:3000` adresinde çalışır. Backend API istekleri `http://localhost:8000/api/v1` adresine gönderilir.

## Şablon ve Fotoğraf Varlıkları

- Şablon dosyaları için `frontend/public/templates/` klasörünü kullanın.
- Profil fotoğrafları ve CV görselleri için `frontend/public/photos/` klasörünü kullanın.
- Bu klasöre eklenen dosyalar Next.js tarafından statik olarak servis edilecektir.
- Yönetim sayfasına `http://localhost:3000/assets` adresinden erişebilirsiniz.
