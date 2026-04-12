from typing import Any
from backend.app.schemas.cover_letter import CoverLetterRequest
from backend.app.services.ai_provider import AiProvider
from backend.app.services.ai_skill_manager import AiSkillManager


class CoverLetterService:
    @staticmethod
    def generate_cover_letter(payload: CoverLetterRequest) -> dict[str, Any]:
        full_name = payload.profile.full_name
        company = payload.company_name
        position = payload.position
        tone = payload.tone or "professional"

        prompt = (
            "Platform Context:\n"
            "- Bu uygulama siradan metin ureten bir bot degil, premium kariyer danismani gibi davranir.\n"
            "- On yazi role ve sirkete ozel olmali, genel kaliplara dusmemeli.\n"
            "- Uydurma basari, uydurma sirket bilgisi veya asiri iddiali ifadeler kullanma.\n\n"
            f"{AiSkillManager.get_skill_prompt('cover_letter_writer')}\n"
            f"Gorev:\n"
            f"Asagidaki bilgilerle profesyonel bir on yazi olustur.\n\n"
            f"Ad Soyad: {full_name}\n"
            f"Sirket: {company}\n"
            f"Pozisyon: {position}\n"
            f"Ton: {tone}\n"
        )
        if payload.job_description:
            prompt += f"Is Ilani Aciklamasi: {payload.job_description}\n"

        if AiProvider.available_provider():
            try:
                generated = AiProvider.generate(prompt)
                return {
                    "title": f"{company} için {position} Cover Letter",
                    "summary": "Pozisyona ve şirkete özel yazılmış AI destekli ön yazı.",
                    "content": generated,
                    "recommendations": [
                        "AI tarafından uyarlanmış bir ön yazı hazırlandı.",
                        "Şirket ve pozisyon bilgilerine göre kişiselleştirildi.",
                    ],
                }
            except Exception:
                pass

        base = (
            f"Merhaba {company} işe alım ekibi,\n\n"
            f"Ben {full_name}, {position} pozisyonuna başvurmak istiyorum."
        )
        if payload.job_description:
            base += (
                "\n\n" +
                "Şirketinizin iş ilanında yer alan ana gereksinimleri inceledim ve "
                "bu rol için güçlü bir uyum sağladığımı düşünüyorum."
            )
        if tone == "warm":
            base += "\n\nTakım çalışmasına ve öğrenmeye açık bir profesyonelim."
        else:
            base += "\n\nProfesyonel tecrübelerimi ve sonuç odaklı yaklaşımımı bu role taşıyabileceğime inanıyorum."
        base += "\n\nSaygılarımla,\n" + full_name

        return {
            "title": f"{company} için {position} Cover Letter",
            "summary": "Pozisyona ve şirkete özel yazılmış ön yazı metni.",
            "content": base,
            "recommendations": [
                "Şirket ve pozisyon bilgilerini özelleştirdim.",
                "Ton seçimine göre profesyonel bir anlatım kullanıldı.",
            ],
        }
