# AI Career Copilot Platform

Bu proje, CV oluşturma, CV analiz etme, ön yazı üretme ve kariyer koçluğu için bir yapay zekâ destekli platformun MVP iskeletini sunar.

## Amaç

Proje, kullanıcının profiline ve hedef role göre konuşma tabanlı bir asistan olarak davranacak; CV üretimi, analiz ve öneri süreçlerini modüler bir backend üzerinden destekleyecek.

## Mevcut içerik

- `backend/`: FastAPI tabanlı backend uygulama iskeleti
- `backend/app/api/v1/routes.py`: Örnek API uç nokta tanımları
- `backend/app/services/`: AI ve veri servisleri için stub uygulamalar
- `backend/app/schemas/`: Veri transfer modelleri
- `frontend/`: Next.js + Tailwind tabanlı kullanıcı arayüzü
- `frontend/public/templates/`: CV şablonları için statik varlık klasörü
- `frontend/public/photos/`: profil fotoğrafları ve görseller için statik varlık klasörü
- `http://localhost:3000/assets`: fotoğraf yükleme ve şablon yönetim sayfası

## Çalıştırma

Backend:

```bash
py -3 -m pip install -r requirements.txt
```

# Veritabanı
Uygulama varsayılan olarak lokal SQLite kullanır. Backend çalıştırıldığında proje kökünde `career_copilot.db` dosyası otomatik oluşturulur.

PostgreSQL kullanmak isterseniz `DATABASE_URL` ortam değişkenini ayarlayabilirsiniz. Kod tarafı `postgresql://...` bağlantılarını otomatik olarak `psycopg` sürücüsüyle uyumlu hale getirir.

Örnekler:

```bash
# Backend ve PostgreSQL aynı Ubuntu server üzerindeyse
DATABASE_URL=postgresql://<user>:<password>@localhost:5432/career_copilot

# Backend Docker içinde ve postgres servis adı `postgres` ise
DATABASE_URL=postgresql://<user>:<password>@postgres:5432/career_copilot

# Laptop üzerinden uzaktaki ev sunucusuna bağlanacaksanız
DATABASE_URL=postgresql://<user>:<password>@<server-ip>:5432/career_copilot
```

AI sağlayıcıları ile gerçek üretim yapmak için aşağıdaki ortam değişkenlerinden birini kullanabilirsiniz:

```bash
GOOGLE_API_KEY=<google-api-key>
GOOGLE_MODEL=gemini-2.5-flash
OPENAI_API_KEY=<openai-api-key>
OPENAI_MODEL=gpt-4o-mini
NEXT_PUBLIC_API_BASE_URL=/backend/api/v1
```

Mevcutsa `GOOGLE_API_KEY` öncelikli olarak kullanılır. Her iki anahtar da yoksa sistem varsayılan olarak stub metin üretimi yapar.

Google OAuth ve Apple Sign In için ek ortam değişkenleri aşağıdaki gibidir:

```bash
GOOGLE_CLIENT_ID=<google-client-id>
GOOGLE_CLIENT_SECRET=<google-client-secret>
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback

APPLE_CLIENT_ID=<apple-services-id>
APPLE_TEAM_ID=<apple-team-id>
APPLE_KEY_ID=<apple-key-id>
APPLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
APPLE_REDIRECT_URI=https://yourdomain.com/auth/apple/callback
```

Bu değerleri proje kökünde bir `.env` dosyası içine yazabilirsiniz. Üretim ortamında gerçek anahtar ve veritabanı şifrelerini repoya commit etmeyin.

Çalıştırmak için:

```bash
uvicorn backend.app.main:app --reload
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Doğrudan AI üretiminden indirilebilir CV dosyası almak için Swagger üzerinden şu endpoint kullanılabilir:

```text
POST /api/v1/resumes/generate-file
```

Bu uç nokta, `ai/skills/cv_builder.md` promptunu kullanarak CV metnini üretir ve seçilen formata göre doğrudan `pdf` veya `docx` dosyası döndürür. AI sağlayıcısı bağlı değilse sistem geçici fallback içerik üretir.

## Geliştirme önerileri

1. Auth servislerini gerçek JWT/OAuth ile tamamlayın.
2. Profil / CV verilerini veritabanına taşıyın.
3. AI servislerini OpenAI / Azure OpenAI / başka bir LLM entegrasyonuyla genişletin.
4. Ön uç için React/Next.js + Tailwind altyapısı ekleyin.
