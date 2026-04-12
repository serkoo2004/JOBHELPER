from typing import Any

from backend.app.services.ai_provider import AiProvider
from backend.app.services.ai_skill_manager import AiSkillManager


class AiChatService:
    @staticmethod
    def _compose_prompt(skill_name: str, user_request: str) -> str:
        skill_prompt = AiSkillManager.get_skill_prompt(skill_name)
        base_rules = (
            "Platform Context:\n"
            "- Bu uygulama premium bir AI kariyer danismani gibi davranir.\n"
            "- Kullaniciyi yargilama, acik ve profesyonel yonlendirme yap.\n"
            "- Bilgi eksikse bunu netce belirt ama olmayan deneyim veya basari uydurma.\n"
            "- Cikti kullaniciya dogrudan fayda saglamali; genel ve bos cumlelerden kacın.\n\n"
        )
        return f"{base_rules}{skill_prompt}\nUser Request:\n{user_request}".strip()

    @staticmethod
    def _format_resume(profile: dict[str, Any], target_role: str | None = None) -> str:
        name = profile.get("full_name", "Aday")
        effective_role = target_role or profile.get("target_role") or "Belirtilmedi"
        skills = profile.get("skills") or []
        languages = profile.get("languages") or []
        certifications = profile.get("certifications") or []
        summary = profile.get("summary") or "Profesyonel özet kullanıcı görüşmesiyle derinleştirilecek."

        sections = [
            name.upper(),
            f"Hedef Rol: {effective_role}",
            f"Iletisim: {profile.get('email', '-')} | {profile.get('phone', '-')}",
            f"Konum: {profile.get('location', 'Belirtilmedi')}",
            "",
            "PROFESYONEL OZET",
            summary,
            "",
            "ONE CIKAN YETKINLIKLER",
            ", ".join(skills) if skills else "AI gorusmesi ile netlestirilecek teknik ve davranissal yetkinlikler.",
        ]

        if languages:
            sections.extend(["", "DILLER", ", ".join(languages)])
        if certifications:
            sections.extend(["", "SERTIFIKALAR", ", ".join(certifications)])

        sections.extend(
            [
                "",
                "DENEYIM ODAKLARI",
                "- Sonuclarla desteklenmis deneyim maddeleri eklenmeli.",
                "- Her rol icin etki, kapsam ve kullanilan araclar belirtilmeli.",
                "",
                "SONRAKI ADIMLAR",
                "- Is deneyimlerini tarih ve metriklerle detaylandir.",
                "- Projeleri hedef role gore yeniden sirala.",
                "- ATS anahtar kelimelerini ilan bazli guncelle.",
            ]
        )
        return "\n".join(sections)

    @staticmethod
    def analyze_resume(content: str, target_role: str | None = None) -> dict[str, Any]:
        intro = AiSkillManager.get_skill_intro('cv_analysis')
        user_request = (
            f"Aşağıdaki CV metnini incele ve iyileştirme önerileri ver."
            f"\n\nCV Metni:\n{content}\n\n"
        )
        if target_role:
            user_request += f"Hedef rol: {target_role}."
        prompt = AiChatService._compose_prompt("cv_analysis", user_request)

        if AiProvider.available_provider():
            try:
                generated = AiProvider.generate(prompt)
                summary = f"{intro} AI destekli analiz tamamlandı."
                return {
                    "title": "CV Analiz Raporu",
                    "summary": summary,
                    "content": generated,
                    "recommendations": [
                        "AI önerilerine göre CV'nizi güncelleyin.",
                        "Hedef role uygun anahtar kelimeler kullanın.",
                    ],
                }
            except Exception:
                pass

        suggestions = [
            "Başlangıçta hedef rolünüzü netleştirin.",
            "Deneyimlerinizi etkili sonuçlarla destekleyin.",
            "ATS için anahtar kelimeleri hedef role göre uyarlayın.",
        ]
        if target_role:
            suggestions.insert(0, f"{target_role} rolüne uygun anahtar kelimeleri vurgulayın.")
        return {
            "title": "CV Analiz Raporu",
            "summary": f"{intro} CV içeriği değerlendirildi, iyileştirme önerileri hazır.",
            "content": (
                "Analiz Ozeti\n"
                f"- Hedef Rol: {target_role or 'Belirtilmedi'}\n"
                "- CV metni incelendi ve gelistirme alanlari cikartildi.\n\n"
                "Incelenen Metin\n"
                f"{content}"
            ),
            "recommendations": suggestions,
        }

    @staticmethod
    def generate_resume(profile: dict[str, Any], target_role: str | None = None) -> dict[str, Any]:
        title = f"{profile.get('full_name', 'Kullanıcı')} için Özelleştirilmiş CV"
        profile_lines = [
            f"Ad Soyad: {profile.get('full_name', '')}",
            f"Email: {profile.get('email', '')}",
        ]
        if profile.get("phone"):
            profile_lines.append(f"Telefon: {profile['phone']}")
        if profile.get("location"):
            profile_lines.append(f"Konum: {profile['location']}")
        if profile.get("summary"):
            profile_lines.append(f"Profil Özeti: {profile['summary']}")
        if profile.get("target_role"):
            profile_lines.append(f"Hedef Rol: {profile['target_role']}")
        if target_role:
            profile_lines.append(f"Talep Edilen Rol: {target_role}")
        if profile.get("skills"):
            profile_lines.append(f"Beceriler: {', '.join(profile['skills'])}")
        if profile.get("languages"):
            profile_lines.append(f"Diller: {', '.join(profile['languages'])}")
        if profile.get("certifications"):
            profile_lines.append(f"Sertifikalar: {', '.join(profile['certifications'])}")

        prompt = (
            "Aşağıdaki kullanıcı bilgilerine dayanarak profesyonel bir CV ozeti, section yapisi ve oneriler olustur."
            f"\n\n{chr(10).join(profile_lines)}\n\n"
            "Cikti; premium ama ATS-uyumlu, net, kullanima hazir ve role-ozel olsun."
        )
        prompt = AiChatService._compose_prompt("cv_builder", prompt)

        skill_intro = AiSkillManager.get_skill_intro('cv_builder')
        if AiProvider.available_provider():
            try:
                generated = AiProvider.generate(prompt)
                return {
                    "title": title,
                    "summary": f"{skill_intro} {generated.splitlines()[0] if generated else ''}",
                    "content": generated,
                    "recommendations": [
                        "CV içeriğini hedef role göre özelleştirin.",
                        "Yeteneklerinizi sonuç odaklı şekilde vurgulayın.",
                    ],
                }
            except Exception:
                pass

        summary = (
            f"{profile.get('full_name', '')} profili temel alınarak oluşturulan profesyonel özet."
        )
        return {
            "title": title,
            "summary": f"{skill_intro} {summary}",
            "content": AiChatService._format_resume(profile, target_role),
            "recommendations": [
                "Özet cümlesini hedef role özel yapın.",
                "Başarılarınızı sayısal sonuçlarla destekleyin.",
                "Deneyim bölümünü STAR mantığıyla güçlendirin.",
            ],
        }
