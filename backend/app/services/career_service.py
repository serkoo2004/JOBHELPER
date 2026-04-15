from __future__ import annotations

from typing import Any

from backend.app.schemas.career_tools import (
    CareerRoadmapRequest,
    CareerToolResponse,
    InterviewPrepRequest,
    JobMatchRequest,
    LinkedInOptimizeRequest,
    PhotoAssistantRequest,
    PortfolioSummaryRequest,
)
from backend.app.schemas.tracker import JobApplication
from backend.app.services.ai_provider import AiProvider
from backend.app.services.ai_skill_manager import AiSkillManager


class CareerService:
    @staticmethod
    def _compose_prompt(skill_name: str, input_data: str) -> str:
        return (
            "PLATFORM RULES\n"
            "- Premium bir AI kariyer danışmanı gibi davran.\n"
            "- Kullanıcıyı yönlendir, kör kopyalama yapma.\n"
            "- Eksik veri varsa uydurma; bunun yerine en iyi profesyonel öneriyi üret.\n"
            "- Yanıtlar recruiter, hiring manager ve aday deneyimi açısından gerçek fayda üretmeli.\n\n"
            f"{AiSkillManager.render_primary_prompt(skill_name, input_data)}"
        )

    @staticmethod
    def _profile_snapshot(profile: dict[str, Any]) -> str:
        skills = ", ".join(profile.get("skills") or [])
        languages = ", ".join(profile.get("languages") or [])
        certifications = ", ".join(
            item if isinstance(item, str) else " - ".join(
                str(part) for part in [item.get("name"), item.get("issuer"), item.get("year")] if part
            )
            for item in (profile.get("certifications") or [])
        )
        return (
            f"Ad Soyad: {profile.get('full_name')}\n"
            f"Hedef Rol: {profile.get('target_role') or '-'}\n"
            f"Kıdem: {profile.get('seniority_level') or '-'}\n"
            f"Özet: {profile.get('summary') or '-'}\n"
            f"Yetenekler: {skills or '-'}\n"
            f"Diller: {languages or '-'}\n"
            f"Sertifikalar: {certifications or '-'}\n"
        )

    @staticmethod
    def _run_skill(
        *,
        skill_name: str,
        title: str,
        summary: str,
        input_data: str,
        fallback_content: str,
        recommendations: list[str],
    ) -> CareerToolResponse:
        prompt = CareerService._compose_prompt(skill_name, input_data)
        if AiProvider.available_provider():
            try:
                generated = AiProvider.generate(prompt)
                return CareerToolResponse(
                    title=title,
                    summary=summary,
                    content=generated,
                    recommendations=recommendations,
                )
            except Exception:
                pass
        return CareerToolResponse(
            title=title,
            summary=summary,
            content=fallback_content,
            recommendations=recommendations,
        )

    @staticmethod
    def match_job(payload: JobMatchRequest) -> CareerToolResponse:
        profile = payload.profile.model_dump()
        input_data = (
            "Task: Kullanıcının profilini iş ilanıyla eşleştir.\n"
            f"{CareerService._profile_snapshot(profile)}"
            f"Şirket: {payload.company_name or '-'}\n"
            f"Hedef Rol: {payload.target_role or profile.get('target_role') or '-'}\n"
            f"İş İlanı:\n{payload.job_description}\n"
        )
        fallback = (
            "EŞLEŞME ÖZETİ\n"
            "- Profilin teknik yeterlilikleri rol ile kısmen uyumlu görünüyor.\n"
            "- CV içinde ilanla birebir eşleşen beceriler üst sıraya alınmalı.\n"
            "- Deneyim maddeleri sonuç ve etki vurgusuyla yeniden yazılmalı.\n\n"
            "ÖNERİLEN ADIMLAR\n"
            "1. İlandaki anahtar becerileri CV başlığında ve yetkinliklerde görünür yap.\n"
            "2. İlgili projeleri daha yukarı taşı.\n"
            "3. Ön yazıda şirket/rol bağlamını daha net kur."
        )
        return CareerService._run_skill(
            skill_name="job_matcher",
            title="İş İlanı Eşleşme Analizi",
            summary="Profil ile iş ilanı arasındaki uyumu ve iyileştirme alanlarını çıkarır.",
            input_data=input_data,
            fallback_content=fallback,
            recommendations=[
                "İlan anahtar kelimelerini CV ve ön yazıda görünür kullan.",
                "En ilgili projeleri ve ölçülebilir başarıları yukarı taşı.",
                "Başvuru mesajını şirket bağlamına göre özelleştir.",
            ],
        )

    @staticmethod
    def optimize_linkedin(payload: LinkedInOptimizeRequest) -> CareerToolResponse:
        profile = payload.profile.model_dump()
        input_data = (
            "Task: LinkedIn headline, about ve experience yaklaşımı üret.\n"
            f"{CareerService._profile_snapshot(profile)}"
            f"Ton: {payload.tone or 'professional'}\n"
            f"Hedef Rol: {payload.target_role or profile.get('target_role') or '-'}\n"
        )
        fallback = (
            "LINKEDIN HEADLINE\n"
            f"{payload.target_role or profile.get('target_role') or 'Profesyonel'} | Scalable products | AI-ready profile\n\n"
            "ABOUT\n"
            "Sonuç odaklı, teknik derinliği olan ve iş etkisi üreten bir profesyonel olarak ürün, sistem ve ekip tarafında güçlü katkı sunuyorum.\n\n"
            "EXPERIENCE YAKLAŞIMI\n"
            "- Her deneyimde etki, ölçek ve teknoloji üçlüsünü öne çıkar.\n"
            "- Başarıları sayısal sonuçlarla destekle.\n"
            "- İlk iki deneyim maddesini recruiter taramasına göre optimize et."
        )
        return CareerService._run_skill(
            skill_name="linkedin_optimizer",
            title="LinkedIn Optimizasyonu",
            summary="LinkedIn headline, about ve deneyim anlatısını optimize eder.",
            input_data=input_data,
            fallback_content=fallback,
            recommendations=[
                "Headline içinde hedef rol ve değer önerisini birlikte kullan.",
                "About bölümünü 3 kısa paragraf halinde tut.",
                "Experience maddelerinde metrik ve etki dilini güçlendir.",
            ],
        )

    @staticmethod
    def build_portfolio(payload: PortfolioSummaryRequest) -> CareerToolResponse:
        profile = payload.profile.model_dump()
        input_data = (
            "Task: Kullanıcının portföy/proje vitrini için profesyonel metin üret.\n"
            f"{CareerService._profile_snapshot(profile)}"
            f"Odak: {payload.focus or '-'}\n"
            f"Hedef Kitle: {payload.target_audience or '-'}\n"
        )
        fallback = (
            "PORTFÖY AÇILIŞ METNİ\n"
            "Teknik kaliteyi, ürün bakışını ve iş etkisini birlikte taşıyan projeler geliştiriyorum.\n\n"
            "PROJE VİTRİN KURGUSU\n"
            "- En güçlü 3 projeyi seç.\n"
            "- Her proje için problem, çözüm, teknoloji ve etki yapısı kur.\n"
            "- Teknik detay ile iş sonucunu birlikte göster."
        )
        return CareerService._run_skill(
            skill_name="portfolio_writer",
            title="Portföy / Proje Özeti",
            summary="Portföy vitrini için daha profesyonel proje anlatısı üretir.",
            input_data=input_data,
            fallback_content=fallback,
            recommendations=[
                "Projeleri sadece teknik değil iş problemi üzerinden anlat.",
                "Her proje için kısa etki cümlesi ekle.",
                "Öne çıkan teknolojileri tutarlı kategori diliyle göster.",
            ],
        )

    @staticmethod
    def prepare_interview(payload: InterviewPrepRequest) -> CareerToolResponse:
        profile = payload.profile.model_dump()
        input_data = (
            "Task: Profil ve role göre mülakat hazırlık notları üret.\n"
            f"{CareerService._profile_snapshot(profile)}"
            f"Şirket: {payload.company_name or '-'}\n"
            f"Hedef Rol: {payload.target_role or profile.get('target_role') or '-'}\n"
            f"İş İlanı: {payload.job_description or '-'}\n"
        )
        fallback = (
            "MUHTEMEL SORULAR\n"
            "1. En güçlü deneyiminin bu role etkisi neydi?\n"
            "2. Zor bir teknik problemi nasıl çözdün?\n"
            "3. Önceliklendirme ve ekip çalışmasında nasıl ilerliyorsun?\n\n"
            "HAZIRLIK NOTLARI\n"
            "- Son 2 deneyimini STAR mantığında anlatmaya hazır ol.\n"
            "- Ölçülebilir başarı örneklerini netleştir.\n"
            "- Şirket ve rol için neden uygun olduğunu 60 saniyelik kısa anlatı haline getir."
        )
        return CareerService._run_skill(
            skill_name="interview_prep",
            title="Mülakat Hazırlığı",
            summary="Role ve profile göre olası mülakat soruları ve cevap stratejisi üretir.",
            input_data=input_data,
            fallback_content=fallback,
            recommendations=[
                "STAR formatında 3 güçlü örnek hazırla.",
                "Teknik başarıları iş etkisiyle birlikte anlat.",
                "Şirket özelinde neden uygun olduğunu kısa ve net kur.",
            ],
        )

    @staticmethod
    def build_career_roadmap(payload: CareerRoadmapRequest) -> CareerToolResponse:
        profile = payload.profile.model_dump()
        target_role = payload.target_role or profile.get("target_role") or "hedef rol"
        input_data = (
            "Task: Profildeki boşlukları analiz et ve kısa dönem kariyer yol haritası çıkar.\n"
            f"{CareerService._profile_snapshot(profile)}"
            f"Hedef Rol: {target_role}\n"
            f"Hedef Ülke: {payload.target_country or '-'}\n"
            f"Zaman Çizelgesi (ay): {payload.timeline_months or 3}\n"
        )
        fallback = (
            "KARİYER BOŞLUK ANALİZİ\n"
            "- Profilde rol odaklı başarı anlatısı güçlendirilmeli.\n"
            "- Daha görünür proje etkisi ve ilan uyumu eklenmeli.\n\n"
            "90 GÜNLÜK PLAN\n"
            "1. CV ve LinkedIn ana anlatısını hedef role göre keskinleştir.\n"
            "2. 1 güçlü proje vitrini hazırla.\n"
            "3. Eksik görünen beceri veya sertifika alanını kapat.\n"
        )
        return CareerService._run_skill(
            skill_name="career_coach",
            title="Kariyer Yol Haritası",
            summary="Profil boşluklarını ve kısa dönem gelişim planını çıkarır.",
            input_data=input_data,
            fallback_content=fallback,
            recommendations=[
                "Rol hedefini daha net anahtar kelimelerle tanımla.",
                "Ölçülebilir etki örneklerini artır.",
                "Eksik beceri alanları için kısa öğrenme planı oluştur.",
            ],
        )

    @staticmethod
    def assist_photo(payload: PhotoAssistantRequest) -> CareerToolResponse:
        profile = payload.profile.model_dump()
        requested_style = payload.style or "professional dark background"
        desired_output = payload.desired_output or "black_white_cv_headshot"
        suggested_style = (
            "black and white premium CV headshot"
            if any(keyword in f"{requested_style} {desired_output}".lower() for keyword in ["black", "white", "bw", "grayscale", "siyah", "beyaz"])
            else requested_style
        )
        input_data = (
            "Task: Profesyonel CV fotoğrafı için prompt, kalite uyarısı ve yerleşim önerisi üret.\n"
            f"{CareerService._profile_snapshot(profile)}"
            f"Fotoğraf yolu: {payload.photo_path or '-'}\n"
            f"Template: {payload.template or '-'}\n"
            f"Stil: {requested_style}\n"
            f"İstenen çıktı: {desired_output}\n"
            f"Mevcut fotoğraf notu: {payload.existing_photo_notes or '-'}\n"
        )
        fallback = (
            "KALİTE DEĞERLENDİRMESİ\n"
            "- Fotoğraf CV için kullanılacaksa omuz üstü, sakin ifade ve temiz yüz görünürlüğü korunmalı.\n"
            "- Göz hizası, kırpma ve arka plan dikkat dağıtmamalı.\n\n"
            "IMAGE EDIT / GENERATION PROMPT\n"
            f"- Create a {suggested_style}, recruiter-friendly studio portrait, shoulders-up composition, clean facial detail, balanced contrast, dark minimal background, professional wardrobe, no beauty filter, no cinematic exaggeration, realistic skin texture, CV-ready framing.\n\n"
            "FOTOĞRAF YÖNERGESİ\n"
            "- Düzgün kadrajlı, omuz hizasında, profesyonel kıyafetli, koyu ama temiz arka planlı bir portre kullan.\n"
            "- Aşırı parlak ışık, düşük çözünürlük ve doğal olmayan filtrelerden kaçın.\n\n"
            "CV YERLEŞİMİ\n"
            "- Fotoğraf kullanılacaksa sade ve premium template içinde kontrollü boyutta yerleştir.\n"
            f"- {payload.template or 'Seçilen template'} için shape/align/size kararını kontrollü ver.\n"
            "- ATS-safe şablonlarda fotoğrafı opsiyonel bırak."
        )
        return CareerService._run_skill(
            skill_name="profile_photo_assistant",
            title="Profil Fotoğrafı Asistanı",
            summary="CV’ye uygun profesyonel fotoğraf üretim/düzenleme yönergesi sunar.",
            input_data=input_data,
            fallback_content=fallback,
            recommendations=[
                "Vesikalık kadrajı omuz üstü ve temiz arka planla kur.",
                "Koyu tonlar kullan ama yüz detayını kaybetme.",
                "Fotoğrafı template’e göre dengeli boyutta yerleştir.",
            ],
        )

    @staticmethod
    def coach_application(application: JobApplication) -> CareerToolResponse:
        input_data = (
            "Task: Başvuru durumu için sonraki aksiyon ve takip önerisi üret.\n"
            f"Şirket: {application.company_name}\n"
            f"Rol: {application.role_name}\n"
            f"Durum: {application.status}\n"
            f"Kaynak: {application.source or '-'}\n"
            f"Başvuru Linki: {application.job_url or '-'}\n"
            f"Notlar: {application.notes or '-'}\n"
            f"Sonraki Aksiyon: {application.next_action or '-'}\n"
        )
        fallback = (
            "SONRAKİ ADIMLAR\n"
            "- Başvuru tarihinden birkaç gün sonra nazik bir takip mesajı planla.\n"
            "- Mülakat aşamasındaysa teşekkür ve hazırlık notu oluştur.\n"
            "- Notlarını düzenleyip sonraki aksiyonu tarihli hale getir."
        )
        return CareerService._run_skill(
            skill_name="application_tracker",
            title="Başvuru Koçu",
            summary="Başvuru durumu için takip ve sonraki aksiyon önerileri sunar.",
            input_data=input_data,
            fallback_content=fallback,
            recommendations=[
                "Sonraki aksiyonu tarihli ve ölçülebilir yaz.",
                "Takip mesajını çok erken veya çok geç göndermemeye dikkat et.",
                "Mülakat öncesi şirket notlarını başvuru kaydına ekle.",
            ],
        )
