from typing import Any

from backend.app.services.ai_provider import AiProvider
from backend.app.services.ai_skill_manager import AiSkillManager


class AiChatService:
    TEMPLATE_HINTS = {
        "modern_sidebar": "Teknik profili güçlü, sidebar dostu, hızlı taranan premium iki bölgeli düzen.",
        "executive_grid": "Daha kurumsal, dengeli ve üst düzey başvurulara uygun düzen.",
        "minimal_ats": "ATS okunabilirliği ve sade metin hiyerarşisi öncelikli düzen.",
        "edinburgh_profile": "Fotoğraflı editorial profil paneli ve güçlü görsel hiyerarşi sunan düzen.",
        "royal_timeline": "Mavi tonlu panel ve zaman çizgisi vurgulu klasik premium düzen.",
        "classic_timeline": "Temiz beyaz zeminli, sade ve kurumsal timeline yerleşimi.",
        "burgundy_panel": "Bordo tonlu güçlü panel ve blok başlıklar kullanan dikkat çekici düzen.",
        "crimson_edge": "Sağ tarafta vurgu paneli olan modern, net ve temiz düzen.",
        "onyx_accent": "Koyu panel ve sıcak vurgu rengiyle daha iddialı modern düzen.",
        "smart": "Sistem tarafından seçilecek en uygun premium düzen.",
    }
    SMART_REFERENCE_SET = {
        "royal_timeline": "Mavi panel, fotoğraf, klasik zaman çizgisi ve güven veren premium görünüm.",
        "classic_timeline": "Bembeyaz zemin, daha resmi ve sade timeline odaklı yapı.",
        "burgundy_panel": "Bordo panel, güçlü başlık şeritleri ve sıcak kurumsal görünüm.",
        "crimson_edge": "Sağda kırmızı vurgu paneli, modern ve net kurumsal sunum.",
        "onyx_accent": "Siyah panel, sıcak accent rengi ve daha iddialı premium görünüm.",
        "edinburgh_profile": "Editorial profil paneli, puanlı alanlar ve portre odaklı CV karakteri.",
    }

    @staticmethod
    def _stringify_certifications(certifications: Any) -> list[str]:
        if not certifications:
            return []
        normalized: list[str] = []
        for item in certifications:
            if isinstance(item, str):
                normalized.append(item)
                continue
            if isinstance(item, dict):
                name = item.get("name")
                issuer = item.get("issuer")
                year = item.get("year")
                line = " - ".join(part for part in [name, issuer, year] if part)
                if line:
                    normalized.append(line)
        return normalized

    @staticmethod
    def _compose_prompt(skill_name: str, input_data: str) -> str:
        platform_rules = (
            "PLATFORM RULES\n"
            "- Bu uygulama premium bir AI kariyer danışmanı gibi davranır.\n"
            "- Bilgi eksikse bunu net belirt ama olmayan deneyim veya başarı uydurma.\n"
            "- Verilen bilgiyi körü körüne tekrar etme; analiz et, önem sırasına koy ve daha iyi bir belge stratejisi kur.\n"
            "- İnsan danışman gibi düşün: adayın güçlü yönlerini yorumla, riskleri fark et ve en iyi sunumu seç.\n"
            "- Çıktı kullanıcıya doğrudan fayda sağlamalı.\n\n"
        )
        primary_prompt = AiSkillManager.render_primary_prompt(skill_name, input_data)
        return f"{platform_rules}{primary_prompt}".strip()

    @staticmethod
    def suggest_template(
        profile: dict[str, Any],
        target_role: str | None = None,
        generation_context: dict[str, str] | None = None,
    ) -> tuple[str, str]:
        context = generation_context or {}
        role = (target_role or profile.get("target_role") or "").lower()
        visual = (context.get("visual_preferences") or "").lower()
        goal = (context.get("cv_goal") or "").lower()
        optimization = (context.get("optimization_target") or "").lower()
        has_photo = bool(profile.get("photo_url"))
        skills = profile.get("skills") or []
        experiences = profile.get("experiences") or []

        if "ats" in optimization:
            return "minimal_ats", "ATS önceliği vurgulandığı için sistem sade ve makine-okur bir düzen seçti."
        if any(keyword in visual for keyword in ["bordo", "burgundy", "maroon"]):
            return "burgundy_panel", "Renkli panel ve vurgu beklentisi nedeniyle bordo panel düzeni seçildi."
        if any(keyword in visual for keyword in ["kırmızı", "red", "crimson", "sağ panel", "edge"]):
            return "crimson_edge", "Sağ vurgu paneli ve modern kırmızı ton beklentisi nedeniyle crimson edge seçildi."
        if any(keyword in visual for keyword in ["siyah", "black", "onyx", "gold", "altın"]):
            return "onyx_accent", "Daha iddialı koyu vurgu beklentisi nedeniyle onyx accent düzeni seçildi."
        if any(keyword in visual for keyword in ["mavi", "blue", "royal"]):
            return "royal_timeline", "Mavi panel ve premium timeline beklentisi nedeniyle royal timeline seçildi."
        if has_photo or any(keyword in visual for keyword in ["foto", "portrait", "editorial"]):
            return "edinburgh_profile", "Fotoğraf ve editorial panel beklentisi nedeniyle profil odaklı düzen seçildi."
        if "timeline" in visual:
            return "classic_timeline", "Timeline vurgusu istendiği için sade klasik timeline düzeni seçildi."
        if any(keyword in role for keyword in ["manager", "lead", "director", "head", "principal"]) or "premium üst düzey" in goal:
            return "executive_grid", "Üst düzey ve kurumsal etki beklentisi nedeniyle executive grid seçildi."
        if len(skills) >= 10 or len(experiences) >= 2:
            return "modern_sidebar", "Teknik yoğunluk ve hızlı tarama ihtiyacı nedeniyle modern sidebar seçildi."
        return "classic_timeline", "Daha dengeli ve genel kullanım için sade timeline düzeni seçildi."

    @staticmethod
    def _build_resume_consultant_brief(
        profile: dict[str, Any],
        target_role: str | None,
        template: str | None,
        tone: str | None,
        generation_context: dict[str, str] | None,
    ) -> str:
        context = generation_context or {}
        chosen_template, template_reason = AiChatService.suggest_template(profile, target_role, context)
        requested_template = template or "smart"
        active_template = chosen_template if requested_template in {None, "", "smart"} else requested_template
        strengths: list[str] = []
        risks: list[str] = []
        profile_signals: list[str] = []

        if profile.get("experiences"):
            strengths.append("Gerçek deneyim blokları mevcut; deneyim bölümü ana taşıyıcı yapılmalı.")
        else:
            risks.append("Deneyim verisi sınırlı; proje ve özet tarafı daha stratejik kurulmalı.")
        if profile.get("projects"):
            strengths.append("Projeler güçlü destek sinyali veriyor; ürün ve teknik karar dili yukarı çekilebilir.")
        if profile.get("skills") and len(profile["skills"]) >= 8:
            strengths.append("Yetenek seti geniş; gruplanmış teknik yetkinlik alanı güçlü kullanılmalı.")
        if profile.get("certifications"):
            strengths.append("Sertifikalar güven sinyali veriyor; sertifika alanı kısa ama görünür olmalı.")
        if profile.get("photo_url"):
            profile_signals.append("Fotoğraf mevcut; görsel profile uygun template kullanılabilir.")
        if context.get("optimization_target"):
            profile_signals.append(f"Optimizasyon odağı: {context['optimization_target']}.")
        if context.get("visual_preferences"):
            profile_signals.append(f"Görsel beklenti: {context['visual_preferences']}.")
        if not profile.get("summary"):
            risks.append("Hazır özet yok; AI güçlü ama dürüst bir konumlandırma paragrafı kurmalı.")

        lines = [
            "CONSULTANT ANALYSIS",
            f"- Hedef rol: {target_role or profile.get('target_role') or 'Belirtilmedi'}",
            f"- Talep edilen ton: {tone or 'professional'}",
            f"- Talep edilen/aktif template: {requested_template} -> {active_template}",
            f"- Template gerekçesi: {context.get('template_reason') or template_reason}",
        ]
        if context.get("resume_review_notes"):
            lines.append(f"- Editoryal uyarılar: {context['resume_review_notes']}")
        if requested_template in {None, "", "smart"}:
            lines.append(
                "- Kullanılabilir AI template ailesi: "
                + "; ".join(f"{key} = {value}" for key, value in AiChatService.SMART_REFERENCE_SET.items())
            )
        if context.get("cv_goal"):
            lines.append(f"- Başvuru amacı: {context['cv_goal']}")
        lines.extend(f"- Güçlü sinyal: {item}" for item in strengths)
        lines.extend(f"- Risk/gelişim alanı: {item}" for item in risks)
        lines.extend(f"- Yorum: {item}" for item in profile_signals)
        lines.extend(
            [
                "",
                "EDITORIAL INSTRUCTION",
                "- Veriyi kopyalama; en değerli sinyalleri yukarı taşı.",
                "- Bilgi sıralamasını recruiter taramasına göre yeniden kur.",
                "- Gerekirse bazı girdileri kısalt, bazılarını güçlendir, ama gerçek dışı bilgi ekleme.",
                "- Çıktı hazır template içine girdiğinde premium görünmeli.",
                "- Eğer template smart ise referans ailelerden ilham al ama birebir kopyalama; yeniden yorumla.",
            ]
        )
        return "\n".join(lines), active_template

    @staticmethod
    def _clean_generated_resume(generated: str, profile: dict[str, Any], target_role: str | None = None) -> str:
        banned_starts = (
            "PLATFORM RULES",
            "PRIMARY SKILL PROMPT",
            "INPUT DATA",
            "CONSULTANT ANALYSIS",
            "EDITORIAL INSTRUCTION",
            "Task:",
            "You are the CV generation engine",
            "##",
            "# CV Builder",
            "## Core mission",
            "## Quality standard",
            "## Product behavior",
            "## What to optimize for",
            "## Section strategy",
            "## Writing rules",
            "## Template-aware behavior",
            "## Output format",
            "## Hidden quality goals",
            "## Forbidden behavior",
        )
        cleaned_lines: list[str] = []
        for raw_line in generated.splitlines():
            line = raw_line.strip()
            if not line:
                if cleaned_lines and cleaned_lines[-1] != "":
                    cleaned_lines.append("")
                continue
            if any(line.startswith(prefix) for prefix in banned_starts):
                continue
            if line.startswith("- ") and any(keyword in line.lower() for keyword in ["güçlü sinyal", "risk/gelişim", "yorum", "template gerekçesi"]):
                continue
            cleaned_lines.append(line)

        cleaned = "\n".join(cleaned_lines).strip()
        if "PROFESSIONAL SUMMARY" not in cleaned and "PROFESYONEL ÖZET" not in cleaned:
            return AiChatService._format_resume(profile, target_role)
        return cleaned

    @staticmethod
    def _extract_resume_summary(content: str, fallback: str) -> str:
        lines = [line.strip() for line in content.splitlines() if line.strip()]
        for index, line in enumerate(lines):
            upper = line.upper()
            if upper in {"PROFESSIONAL SUMMARY", "PROFESYONEL ÖZET"}:
                for candidate in lines[index + 1:]:
                    if candidate.isupper() and len(candidate) < 40:
                        break
                    return candidate[:260]
        for candidate in lines:
            if not candidate.isupper():
                return candidate[:260]
        return fallback

    @staticmethod
    def _build_resume_recommendations(profile: dict[str, Any], target_role: str | None = None) -> list[str]:
        recommendations: list[str] = []
        if not profile.get("experiences"):
            recommendations.append("Deneyim azsa proje etkisini ve kapsamını daha görünür hale getirin.")
        else:
            recommendations.append("En güçlü deneyim maddelerini ölçülebilir etkiyle destekleyin.")
        if not profile.get("projects"):
            recommendations.append("Rolü destekleyen 1-2 proje eklemek CV’yi daha ikna edici hale getirir.")
        if target_role:
            recommendations.append(f"{target_role} rolüne göre anahtar kelime yoğunluğunu ilan bazında güncelleyin.")
        else:
            recommendations.append("Hedef rol netleşince başlık ve özet kısmını daha da keskinleştirin.")
        return recommendations[:3]

    @staticmethod
    def review_profile_for_resume(
        profile: dict[str, Any],
        target_role: str | None = None,
        generation_context: dict[str, str] | None = None,
    ) -> list[str]:
        context = generation_context or {}
        profile_snapshot = [
            f"Ad Soyad: {profile.get('full_name', '')}",
            f"Hedef Rol: {target_role or profile.get('target_role') or '-'}",
            f"Kıdem: {profile.get('seniority_level') or '-'}",
            f"Özet: {profile.get('summary') or '-'}",
            f"Skills: {', '.join(profile.get('skills') or []) or '-'}",
            f"Diller: {', '.join(profile.get('languages') or []) or '-'}",
            f"Deneyim sayısı: {len(profile.get('experiences') or [])}",
            f"Proje sayısı: {len(profile.get('projects') or [])}",
            f"Eğitim sayısı: {len(profile.get('education') or [])}",
            f"Optimizasyon hedefi: {context.get('optimization_target') or '-'}",
            f"Görsel tercih: {context.get('visual_preferences') or '-'}",
        ]
        prompt = (
            "Task: Kullanıcının CV profilini işe alım danışmanı gibi incele ve sadece düzeltilmesi/güçlendirilmesi gereken noktaları kısa maddeler halinde çıkar.\n"
            "- En fazla 5 madde dön.\n"
            "- Her madde kullanıcıya gösterilecek kadar net ve yapıcı olsun.\n"
            "- Uydurma yapma.\n"
            "- Sadece eksik, riskli veya güçlendirilebilir alanları yaz.\n\n"
            + "\n".join(profile_snapshot)
        )
        full_prompt = AiChatService._compose_prompt("career_coach", prompt)
        if AiProvider.available_provider():
            try:
                generated = AiProvider.generate(full_prompt)
                warnings: list[str] = []
                for raw_line in generated.splitlines():
                    line = raw_line.strip("- ").strip()
                    if not line:
                        continue
                    if len(line) < 8:
                        continue
                    warnings.append(line)
                if warnings:
                    return warnings[:5]
            except Exception:
                pass

        warnings: list[str] = []
        if not profile.get("target_role"):
            warnings.append("Hedef rol net değil; CV başlığını güçlendirmek için rol daha açık tanımlanmalı.")
        if not profile.get("summary"):
            warnings.append("Profil özeti eksik; kısa ama güçlü bir değer önerisi CV’yi daha premium gösterebilir.")
        if not profile.get("skills"):
            warnings.append("Yetkinlik alanı zayıf; recruiter taramasını hızlandırmak için beceriler net gruplanmalı.")
        if not profile.get("experiences"):
            warnings.append("Deneyim yoksa projeler ve problem/çözüm anlatısı daha güçlü kurulmalı.")
        if profile.get("experiences") and not any(item.get("bullets") for item in profile.get("experiences") or []):
            warnings.append("Deneyim maddelerinde etkiyi gösteren bullet satırları eksik; sonuç dili güçlendirilmeli.")
        if not profile.get("projects"):
            warnings.append("Proje vitrini eksik; özellikle teknik roller için 1-2 güçlü proje çok faydalı olur.")
        return warnings[:5]

    @staticmethod
    def review_draft_for_resume(
        profile: dict[str, Any],
        summary: str,
        content: str,
        target_role: str | None = None,
        generation_context: dict[str, str] | None = None,
    ) -> list[str]:
        context = generation_context or {}
        content_lower = content.lower()
        warnings = AiChatService.review_profile_for_resume(profile, target_role, context)

        if len(summary.strip()) < 80:
            warnings.insert(0, "Özet bölümü hâlâ kısa kalıyor; değer önerisini ve etki alanını biraz daha netleştir.")

        experience_count = len(profile.get("experiences") or [])
        bullet_count = sum(1 for line in content.splitlines() if line.strip().startswith("- "))
        if experience_count and bullet_count < experience_count * 2:
            warnings.append("Deneyim bölümü daha güçlü olabilir; her rol için sonuç ve etkiyi gösteren ek bullet’lar faydalı olur.")

        if "professional summary" not in content_lower and "profesyonel özet" not in content_lower:
            warnings.append("CV içinde net bir özet başlığı görünmüyor; recruiter taraması için summary alanı daha belirgin olmalı.")

        skills = [str(skill).lower() for skill in (profile.get("skills") or [])]
        visible_skills = sum(1 for skill in skills if skill and skill in content_lower)
        if skills and visible_skills < max(2, min(4, len(skills) // 3 or 1)):
            warnings.append("Temel yetkinlikler içerikte yeterince görünür değil; ana skill grupları daha belirgin sergilenmeli.")

        if profile.get("projects") and "project" not in content_lower and "proje" not in content_lower:
            warnings.append("Projeler profilinde var ama draft içinde yeterince görünmüyor; proje vitrini daha açık gösterilmeli.")

        deduped: list[str] = []
        for item in warnings:
            clean = item.strip()
            if clean and clean not in deduped:
                deduped.append(clean)
        return deduped[:6]

    @staticmethod
    def _format_resume(profile: dict[str, Any], target_role: str | None = None) -> str:
        name = profile.get("full_name", "Aday")
        effective_role = target_role or profile.get("target_role") or "Belirtilmedi"
        skills = profile.get("skills") or []
        languages = profile.get("languages") or []
        certifications = AiChatService._stringify_certifications(profile.get("certifications"))
        summary = profile.get("summary") or "Profesyonel özet kullanıcı görüşmesiyle derinleştirilecek."
        experiences = profile.get("experiences") or []
        projects = profile.get("projects") or []
        education = profile.get("education") or []

        sections = [
            name.upper(),
            f"Hedef Rol: {effective_role}",
            f"İletişim: {profile.get('email', '-')} | {profile.get('phone', '-')}",
            f"Konum: {profile.get('location', 'Belirtilmedi')}",
            "",
            "PROFESYONEL ÖZET",
            summary,
            "",
            "ÖNE ÇIKAN YETKİNLİKLER",
            ", ".join(skills) if skills else "AI görüşmesi ile netleştirilecek teknik ve davranışsal yetkinlikler.",
        ]

        if languages:
            sections.extend(["", "DİLLER", ", ".join(languages)])
        if certifications:
            sections.extend(["", "SERTİFİKALAR", ", ".join(certifications)])
        if experiences:
            sections.extend(["", "DENEYİM"])
            for experience in experiences:
                title = experience.get("title", "Rol")
                company = experience.get("company", "Şirket")
                date_range = " - ".join(
                    part for part in [experience.get("start_date"), experience.get("end_date")] if part
                )
                sections.append(f"{title} | {company}{f' | {date_range}' if date_range else ''}")
                for bullet in experience.get("bullets") or []:
                    sections.append(f"- {bullet}")
        if projects:
            sections.extend(["", "PROJELER"])
            for project in projects:
                subtitle = project.get("subtitle")
                sections.append(
                    f"{project.get('name', 'Proje')}{f' | {subtitle}' if subtitle else ''}"
                )
                for bullet in project.get("bullets") or []:
                    sections.append(f"- {bullet}")
        if education:
            sections.extend(["", "EĞİTİM"])
            for item in education:
                line = " | ".join(
                    part for part in [item.get("degree"), item.get("school"), item.get("end_date")] if part
                )
                if line:
                    sections.append(line)

        sections.extend(
            [
                "",
                "DENEYİM ODAKLARI",
                "- Sonuçlarla desteklenmiş deneyim maddeleri eklenmeli.",
                "- Her rol için etki, kapsam ve kullanılan araçlar belirtilmeli.",
                "",
                "SONRAKİ ADIMLAR",
                "- İş deneyimlerini tarih ve metriklerle detaylandır.",
                "- Projeleri hedef role göre yeniden sırala.",
                "- ATS anahtar kelimelerini ilan bazlı güncelle.",
            ]
        )
        return "\n".join(sections)

    @staticmethod
    def analyze_resume(content: str, target_role: str | None = None) -> dict[str, Any]:
        intro = AiSkillManager.get_skill_intro('cv_analysis')
        user_request = (
            "Task: CV analizi yap.\n"
            f"CV Metni:\n{content}\n\n"
        )
        if target_role:
            user_request += f"Hedef Rol: {target_role}\n"
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
                "Analiz Özeti\n"
                f"- Hedef Rol: {target_role or 'Belirtilmedi'}\n"
                "- CV metni incelendi ve geliştirme alanları çıkartıldı.\n\n"
                "İncelenen Metin\n"
                f"{content}"
            ),
            "recommendations": suggestions,
        }

    @staticmethod
    def generate_resume(
        profile: dict[str, Any],
        target_role: str | None = None,
        template: str | None = None,
        tone: str | None = None,
        generation_context: dict[str, str] | None = None,
    ) -> dict[str, Any]:
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
            profile_lines.append(
                f"Sertifikalar: {', '.join(AiChatService._stringify_certifications(profile['certifications']))}"
            )
        if profile.get("experiences"):
            experience_blocks = []
            for experience in profile["experiences"]:
                header = " | ".join(
                    part
                    for part in [
                        experience.get("title"),
                        experience.get("company"),
                        experience.get("location"),
                        " - ".join(
                            part
                            for part in [experience.get("start_date"), experience.get("end_date")]
                            if part
                        ),
                    ]
                    if part
                )
                bullets = experience.get("bullets") or []
                tech = experience.get("technologies") or []
                block_lines = [header] if header else []
                block_lines.extend(f"- {bullet}" for bullet in bullets)
                if tech:
                    block_lines.append(f"Teknolojiler: {', '.join(tech)}")
                experience_blocks.append("\n".join(block_lines))
            profile_lines.append("Deneyimler:\n" + "\n\n".join(experience_blocks))
        if profile.get("projects"):
            project_blocks = []
            for project in profile["projects"]:
                header = " | ".join(
                    part for part in [project.get("name"), project.get("subtitle")] if part
                )
                bullets = project.get("bullets") or []
                tech = project.get("technologies") or []
                block_lines = [header] if header else []
                block_lines.extend(f"- {bullet}" for bullet in bullets)
                if tech:
                    block_lines.append(f"Teknolojiler: {', '.join(tech)}")
                if project.get("link"):
                    block_lines.append(f"Link: {project['link']}")
                project_blocks.append("\n".join(block_lines))
            profile_lines.append("Projeler:\n" + "\n\n".join(project_blocks))
        if profile.get("education"):
            education_blocks = []
            for item in profile["education"]:
                header = " | ".join(
                    part
                    for part in [item.get("degree"), item.get("school"), item.get("location")]
                    if part
                )
                date_range = " - ".join(
                    part for part in [item.get("start_date"), item.get("end_date")] if part
                )
                block_lines = [header] if header else []
                if date_range:
                    block_lines.append(f"Tarih: {date_range}")
                block_lines.extend(f"- {detail}" for detail in item.get("details") or [])
                education_blocks.append("\n".join(block_lines))
            profile_lines.append("Eğitim:\n" + "\n\n".join(education_blocks))

        consultant_brief, active_template = AiChatService._build_resume_consultant_brief(
            profile,
            target_role,
            template,
            tone,
            generation_context,
        )

        input_data = (
            "Task: Yeni CV oluştur.\n"
            f"{chr(10).join(profile_lines)}\n\n"
            f"{consultant_brief}\n\n"
            "Beklenti:\n"
            "- Çıktı role-özel, ATS uyumlu, net ve premium olsun.\n"
            "- CV içeriği modern premium bir tek sayfalık teknik CV kalitesine yakın olsun.\n"
            "- Teknik beceriler mümkünse kategori bazlı gruplanmalı.\n"
            "- Özet bölümü kısa ama güçlü olmalı.\n"
            "- Deneyim maddeleri aksiyon + kapsam + sonuç mantığıyla yazılmalı.\n"
            "- Kullanıcı veri vermediyse uydurma yapma; bunun yerine yapıyı güçlü kur.\n"
            "- Çıktı daha sonra şablona veya export sistemine kolay yerleşecek kadar temiz olmalı.\n"
            "- Sadece plain text CV içeriği döndür; prompt, analiz notu veya sistem talimatı döndürme.\n"
            f"- Aktif template bağlamı: {active_template} / {AiChatService.TEMPLATE_HINTS.get(active_template, '')}"
        )
        prompt = AiChatService._compose_prompt("cv_builder", input_data)
        if AiProvider.available_provider():
            try:
                generated = AiProvider.generate(prompt)
                cleaned = AiChatService._clean_generated_resume(generated, profile, target_role)
                summary = AiChatService._extract_resume_summary(
                    cleaned,
                    f"{profile.get('full_name', '')} için role özel profesyonel özet oluşturuldu.",
                )
                return {
                    "title": title,
                    "summary": summary,
                    "content": cleaned,
                    "recommendations": AiChatService._build_resume_recommendations(profile, target_role),
                    "template": active_template,
                }
            except Exception:
                pass

        summary = (
            f"{profile.get('full_name', '')} profili temel alınarak oluşturulan profesyonel özet."
        )
        return {
            "title": title,
            "summary": summary,
            "content": AiChatService._format_resume(profile, target_role),
            "recommendations": AiChatService._build_resume_recommendations(profile, target_role),
            "template": active_template,
        }
