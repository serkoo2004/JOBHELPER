# Career Copilot Backend

Bu proje, yapay zekâ destekli kariyer asistanı platformu için Python/FastAPI tabanlı bir MVP iskeletidir.

## Özellikler

- Kullanıcı profili ve CV verisi için API uç noktaları
- AI tabanlı CV analiz ve CV üretim servisleri için stub yapı
- Modüler `app/api`, `app/services`, `app/schemas` ve `app/core` dizin yapısı

## Başlarken

1. Python 3.11 veya üzerini kurun.
2. Sanal ortam oluşturun:

```bash
python -m venv .venv
source .venv/Scripts/activate
```

3. Bağımlılıkları yükleyin:

```bash
pip install -r requirements.txt
```

4. Uygulamayı çalıştırın:

```bash
uvicorn backend.app.main:app --reload
```

## API

- `GET /api/v1/health`
- `POST /api/v1/auth/login`
- `POST /api/v1/profiles`
- `GET /api/v1/profiles/{user_id}`
- `POST /api/v1/resumes/analyze`
- `POST /api/v1/resumes/generate`
