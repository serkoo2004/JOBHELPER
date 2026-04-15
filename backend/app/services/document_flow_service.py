from __future__ import annotations

import json
from dataclasses import dataclass
from datetime import datetime
from uuid import uuid4

from backend.app.core.db import get_session
from backend.app.models.document_flow import DocumentFlowModel
from backend.app.schemas.document_flow import (
    DocumentFlowResponse,
    DocumentFlowStartRequest,
    FlowQuestion,
    FlowSummary,
)
from backend.app.schemas.profile import EducationItem, ExperienceItem, ProjectItem, UserProfileCreate
from backend.app.schemas.resume import ResumeDraftCreateRequest, ResumeDraftResponse
from backend.app.services.ai_chat_service import AiChatService
from backend.app.services.in_memory_store import database
from backend.app.services.profile_service import ProfileService
from backend.app.services.resume_service import ResumeService


@dataclass(frozen=True)
class StepDefinition:
    key: str
    title: str
    description: str
    input_hint: str | None = None
    choices: list[str] | None = None


CV_TEMPLATE_CHOICES = [item["name"] for item in ResumeService.TEMPLATE_LIBRARY] + ["AI karar versin"]


FLOW_DEFINITIONS: dict[str, list[StepDefinition]] = {
    "cv": [
        StepDefinition(
            key="cv_goal",
            title="Bu CV hangi amaç için kullanılacak?",
            description="İlk adımda kullanım amacını netleştiriyoruz.",
            choices=["Kurumsal iş başvurusu", "Şahsi / genel CV", "Premium üst düzey firma başvurusu"],
        ),
        StepDefinition(
            key="target_role",
            title="Hedef rolün ne?",
            description="CV metni bu role göre odaklanacak.",
            input_hint="Örnek: Full Stack Developer, Backend Developer, Product Designer",
        ),
        StepDefinition(
            key="experience_level",
            title="Deneyim seviyeni nasıl tarif edelim?",
            description="Seviye özeti ve içerik önceliğini etkiler.",
            choices=["Junior", "Mid-Level", "Senior", "Lead / Manager"],
        ),
        StepDefinition(
            key="template_mode",
            title="Hazır bir şablon mu seçmek istersin, yoksa AI kendi şablon mantığını mı kursun?",
            description="Hazır şablon seçersen içerik ona göre sıkıştırılır. AI seçeneğinde sistem kendi premium yapısını kurar.",
            choices=["Hazır şablon seç", "AI şablon önerisi"],
        ),
        StepDefinition(
            key="template_choice",
            title="Şablon tercihini belirt.",
            description="Hazır şablon seçiyorsan aşağıdan seç. AI karar verecekse son seçeneği kullan.",
            choices=CV_TEMPLATE_CHOICES,
        ),
        StepDefinition(
            key="visual_preferences",
            title="Görsel tercihlerini belirt.",
            description="Renk, fotoğraf, başlık stili ve genel hissi bu adımda topluyoruz.",
            input_hint="Örnek: Fotoğraf olsun, koyu lacivert başlıklar, sade ama premium görünüm.",
        ),
        StepDefinition(
            key="experience_snapshot",
            title="En güçlü deneyim özeti nedir?",
            description="En önemli 1-3 deneyimi kısa ama değerli şekilde yaz.",
            input_hint="Rol | Şirket | Tarih. Altına en güçlü etkini ve sonucu yaz.",
        ),
        StepDefinition(
            key="project_snapshot",
            title="Öne çıkmasını istediğin projeler neler?",
            description="Deneyim azsa projeler daha çok yük taşıyacak.",
            input_hint="Proje adı | Teknolojiler | Ne yaptın | Neden önemli",
        ),
        StepDefinition(
            key="education_snapshot",
            title="Eğitim ve sertifika özetini yaz.",
            description="Okul, bölüm, mezuniyet, önemli sertifikalar gibi temel bilgileri topla.",
            input_hint="Örnek: X Üniversitesi Bilgisayar Mühendisliği 2022, AWS Certified Developer 2023",
        ),
        StepDefinition(
            key="optimization_target",
            title="İşe alınma şansını artırmak için neye odaklanalım?",
            description="AI çıktıyı bu odağa göre optimize edecek.",
            choices=["ATS uyumu", "Kurumsal görünüm", "Daha güçlü başarı cümleleri", "Yurt dışı uyumu"],
        ),
    ],
    "cover_letter": [
        StepDefinition(
            key="letter_goal",
            title="Nasıl bir metin istiyorsun?",
            description="Ön yazı mı, şirkete sunulacak daha kurumsal bir metin mi, yoksa tanıtım odaklı bir belge mi istediğini seç.",
            choices=["Kurumsal ön yazı", "Kısa ön yazı", "Firma tanıtım / sunum metni"],
        ),
        StepDefinition(
            key="delivery_format",
            title="Çıktı hangi format mantığında düşünülsün?",
            description="Tanıtım veya sunum gibi bir senaryo varsa PPTX mantığı, klasik ön yazı ise DOCX mantığı önerilir.",
            choices=["DOCX mantığı", "PPTX mantığı", "AI karar versin"],
        ),
        StepDefinition(
            key="audience",
            title="Bu metni kim okuyacak?",
            description="Alıcı tipi tonu ve yapıyı değiştirir.",
            choices=["İK / recruiter", "Hiring manager", "Müşteri / partner", "Genel tanıtım kitlesi"],
        ),
        StepDefinition(
            key="tone",
            title="Ton tercihini belirt.",
            description="Tek bir adımda ton seçelim; sonrasında AI buna göre yazsın.",
            choices=["Kurumsal", "Premium", "Sıcak ama profesyonel", "Kısa ve direkt"],
        ),
    ],
    "presentation": [
        StepDefinition(
            key="presentation_goal",
            title="Sunumun amacı ne?",
            description="PPTX senaryosunu önce amaç üzerinden netleştiriyoruz.",
            choices=["Kendini tanıtma", "Firma / proje sunumu", "İş başvurusu sunumu"],
        ),
        StepDefinition(
            key="presentation_audience",
            title="Sunum kime yapılacak?",
            description="Kitleye göre slide dili ve detay seviyesi değişir.",
            choices=["Kurumsal firma", "Startup", "Müşteri", "Genel tanıtım"],
        ),
        StepDefinition(
            key="presentation_style",
            title="Sunum stili nasıl olsun?",
            description="Görsel ton ve slide hissini belirliyoruz.",
            choices=["Kurumsal sade", "Premium modern", "Koyu ton sunum", "Minimal temiz"],
        ),
    ],
    "spreadsheet": [
        StepDefinition(
            key="sheet_need",
            title="Excel ihtiyacının tipi ne?",
            description="Bu senaryoda sistemi kendisi yönlendirecek; önce tablo amacını netleştiriyoruz.",
            choices=["Başvuru takibi", "Bütçe / planlama", "Aday / proje listesi", "AI bana uygun olanı önersin"],
        ),
        StepDefinition(
            key="sheet_columns",
            title="Takip etmek istediğin ana alanlar neler?",
            description="Kolon yapısını buradan belirleriz.",
            input_hint="Örnek: Şirket, rol, tarih, durum, not, sonraki adım",
        ),
        StepDefinition(
            key="sheet_usage",
            title="Bu tabloyu nasıl kullanacaksın?",
            description="Kişisel takip mi, sunum / raporlama mı, ekip içi kullanım mı?",
            choices=["Kişisel takip", "Raporlama", "Ekip içi kullanım"],
        ),
    ],
}


FORMAT_BY_INTENT = {
    "cv": "DOCX / PDF",
    "cover_letter": "DOCX",
    "presentation": "PPTX",
    "spreadsheet": "XLSX",
}


class DocumentFlowService:
    @staticmethod
    def start_flow(payload: DocumentFlowStartRequest) -> DocumentFlowResponse:
        session_id = uuid4().hex
        base_profile = DocumentFlowService._load_base_profile(payload.profile_id, payload.context)
        steps = DocumentFlowService._build_steps(payload.intent, base_profile)
        flow = {
            "intent": payload.intent,
            "profile_id": payload.profile_id,
            "context": payload.context,
            "base_profile": base_profile,
            "steps": [step.__dict__ for step in steps],
            "step_index": 0,
            "answers": {},
            "generated_draft_id": None,
        }
        DocumentFlowService._save_flow(session_id, flow)
        return DocumentFlowService._question_response(
            session_id=session_id,
            intent=payload.intent,
            steps=steps,
            step_index=0,
            message=(
                "Kayıtlı profil verisi bulundu, eksik olmayan alanları tekrar sormayacağız."
                if base_profile
                else "Akış başlatıldı. Her şeyi tek seferde değil, adım adım toplayacağız."
            ),
        )

    @staticmethod
    def answer_step(session_id: str, answer: str) -> DocumentFlowResponse | None:
        flow = DocumentFlowService._get_flow_data(session_id)
        if not flow:
            return None

        intent = flow["intent"]
        steps = DocumentFlowService._hydrate_steps(flow)
        step_index = flow["step_index"]
        current_step = steps[step_index]
        flow["answers"][current_step.key] = answer
        flow["step_index"] += 1
        DocumentFlowService._save_flow(session_id, flow)

        if flow["step_index"] >= len(steps):
            summary = DocumentFlowService._build_summary(intent, flow["answers"])
            return DocumentFlowResponse(
                session_id=session_id,
                intent=intent,
                completed=True,
                current_step=len(steps),
                total_steps=len(steps),
                message="Bu aşamanın tüm zorunlu adımları tamamlandı. Artık oluşturma veya düzenleme safhasına geçilebilir.",
                summary=summary,
            )

        return DocumentFlowService._question_response(
            session_id=session_id,
            intent=intent,
            steps=steps,
            step_index=flow["step_index"],
            message="Adım tamamlandı. Şimdi sıradaki tek soruya geçiyoruz.",
        )

    @staticmethod
    def get_flow(session_id: str) -> DocumentFlowResponse | None:
        flow = DocumentFlowService._get_flow_data(session_id)
        if not flow:
            return None

        intent = flow["intent"]
        steps = DocumentFlowService._hydrate_steps(flow)
        step_index = flow["step_index"]
        if step_index >= len(steps):
            return DocumentFlowResponse(
                session_id=session_id,
                intent=intent,
                completed=True,
                current_step=len(steps),
                total_steps=len(steps),
                message="Akış tamamlanmış durumda.",
                summary=DocumentFlowService._build_summary(intent, flow["answers"]),
            )

        return DocumentFlowService._question_response(
            session_id=session_id,
            intent=intent,
            steps=steps,
            step_index=step_index,
            message="Akış devam ediyor.",
        )

    @staticmethod
    def generate_resume_draft(session_id: str) -> ResumeDraftResponse | None:
        flow = DocumentFlowService._get_flow_data(session_id)
        if not flow or flow["intent"] != "cv":
            return None

        steps = DocumentFlowService._hydrate_steps(flow)
        if flow["step_index"] < len(steps):
            return None

        answers = flow["answers"]
        context = flow.get("context", {}) or {}
        merged_profile = {**(flow.get("base_profile") or {})}
        profile_context = context.get("profile", {}) if isinstance(context.get("profile"), dict) else {}
        merged_profile.update(profile_context)

        template_choice = answers.get("template_choice", "AI karar versin")
        template_key = "smart"
        template_reason = ""
        if template_choice != "AI karar versin":
            for item in ResumeService.TEMPLATE_LIBRARY:
                if item["name"] == template_choice:
                    template_key = item["key"]
                    template_reason = f"Kullanıcı doğrudan {item['name']} şablonunu seçti."
                    break

        merged_profile.setdefault("full_name", context.get("full_name") or "CV Draft User")
        merged_profile.setdefault("email", context.get("email") or "draft@jobhelper.local")
        merged_profile.setdefault("phone", context.get("phone"))
        merged_profile.setdefault("location", context.get("location"))
        merged_profile["target_role"] = answers.get("target_role") or merged_profile.get("target_role")
        merged_profile["seniority_level"] = answers.get("experience_level") or merged_profile.get("seniority_level")
        merged_profile["summary"] = DocumentFlowService._build_summary_text(answers, merged_profile)
        merged_profile.setdefault("skills", context.get("skills") or merged_profile.get("skills") or [])
        merged_profile.setdefault("languages", context.get("languages") or merged_profile.get("languages") or [])
        merged_profile.setdefault("certifications", merged_profile.get("certifications") or [])

        parsed_experiences = DocumentFlowService._parse_experience_answer(answers.get("experience_snapshot", ""))
        if parsed_experiences:
            merged_profile["experiences"] = parsed_experiences
        else:
            merged_profile.setdefault("experiences", merged_profile.get("experiences") or [])

        parsed_projects = DocumentFlowService._parse_project_answer(answers.get("project_snapshot", ""))
        if parsed_projects:
            merged_profile["projects"] = parsed_projects
        else:
            merged_profile.setdefault("projects", merged_profile.get("projects") or [])

        parsed_education = DocumentFlowService._parse_education_answer(answers.get("education_snapshot", ""))
        if parsed_education:
            merged_profile["education"] = parsed_education
        else:
            merged_profile.setdefault("education", merged_profile.get("education") or [])

        generation_context = {
            "cv_goal": answers.get("cv_goal", ""),
            "template_mode": answers.get("template_mode", ""),
            "template_choice": answers.get("template_choice", ""),
            "visual_preferences": answers.get("visual_preferences", ""),
            "optimization_target": answers.get("optimization_target", ""),
        }
        if template_choice == "AI karar versin" or answers.get("template_mode") == "AI şablon önerisi":
            template_key, template_reason = AiChatService.suggest_template(
                merged_profile,
                answers.get("target_role"),
                generation_context,
            )
        generation_context["template_reason"] = template_reason

        draft = ResumeService.create_draft(
            ResumeDraftCreateRequest(
                profile=UserProfileCreate.model_validate(merged_profile),
                template=template_key,
                tone="professional",
                target_role=answers.get("target_role"),
                generation_context=generation_context,
            )
        )
        flow["generated_draft_id"] = draft.draft_id
        DocumentFlowService._save_flow(session_id, flow)
        return draft

    @staticmethod
    def _question_response(
        session_id: str,
        intent: str,
        steps: list[StepDefinition],
        step_index: int,
        message: str,
    ) -> DocumentFlowResponse:
        active_step = steps[step_index]
        return DocumentFlowResponse(
            session_id=session_id,
            intent=intent,  # type: ignore[arg-type]
            completed=False,
            current_step=step_index + 1,
            total_steps=len(steps),
            message=message,
            question=FlowQuestion(
                key=active_step.key,
                title=active_step.title,
                description=active_step.description,
                input_hint=active_step.input_hint,
                choices=active_step.choices or [],
            ),
        )

    @staticmethod
    def _load_base_profile(profile_id: str | None, context: dict) -> dict:
        if profile_id:
            profile = ProfileService.get_profile(profile_id)
            if profile:
                return profile.model_dump()
        profile_context = context.get("profile")
        if isinstance(profile_context, dict):
            return profile_context
        return {}

    @staticmethod
    def _build_steps(intent: str, base_profile: dict) -> list[StepDefinition]:
        steps = list(FLOW_DEFINITIONS[intent])
        if intent != "cv" or not base_profile:
            return steps

        filtered: list[StepDefinition] = []
        for step in steps:
            if step.key == "target_role" and base_profile.get("target_role"):
                continue
            if step.key == "experience_level" and base_profile.get("seniority_level"):
                continue
            if step.key == "experience_snapshot" and base_profile.get("experiences"):
                continue
            if step.key == "project_snapshot" and base_profile.get("projects"):
                continue
            if step.key == "education_snapshot" and (base_profile.get("education") or base_profile.get("certifications")):
                continue
            filtered.append(step)
        return filtered

    @staticmethod
    def _hydrate_steps(flow: dict) -> list[StepDefinition]:
        return [StepDefinition(**step) for step in flow.get("steps", [])]

    @staticmethod
    def _get_flow_data(session_id: str) -> dict | None:
        cached = database["document_flows"].get(session_id)
        if cached:
            return cached

        with get_session() as session:
            record = session.get(DocumentFlowModel, session_id)
            if not record:
                return None
            flow = DocumentFlowService._record_to_flow(record)
            database["document_flows"][session_id] = flow
            return flow

    @staticmethod
    def _save_flow(session_id: str, flow: dict) -> None:
        database["document_flows"][session_id] = flow
        serialized = DocumentFlowService._serialize_flow(flow)
        with get_session() as session:
            record = session.get(DocumentFlowModel, session_id)
            if record is None:
                record = DocumentFlowModel(id=session_id, **serialized)
                session.add(record)
            else:
                for key, value in serialized.items():
                    setattr(record, key, value)
                record.updated_at = datetime.utcnow()
            session.commit()

    @staticmethod
    def _serialize_flow(flow: dict) -> dict:
        return {
            "intent": str(flow["intent"]),
            "profile_id": flow.get("profile_id"),
            "context": json.dumps(flow.get("context", {}), ensure_ascii=False),
            "base_profile": json.dumps(flow.get("base_profile", {}), ensure_ascii=False),
            "steps": json.dumps(flow.get("steps", []), ensure_ascii=False),
            "step_index": int(flow.get("step_index", 0)),
            "answers": json.dumps(flow.get("answers", {}), ensure_ascii=False),
            "generated_draft_id": flow.get("generated_draft_id"),
        }

    @staticmethod
    def _record_to_flow(record: DocumentFlowModel) -> dict:
        return {
            "intent": record.intent,
            "profile_id": record.profile_id,
            "context": DocumentFlowService._load_json(record.context, {}),
            "base_profile": DocumentFlowService._load_json(record.base_profile, {}),
            "steps": DocumentFlowService._load_json(record.steps, []),
            "step_index": record.step_index,
            "answers": DocumentFlowService._load_json(record.answers, {}),
            "generated_draft_id": record.generated_draft_id,
        }

    @staticmethod
    def _load_json(raw: str | None, default):
        if not raw:
            return default
        try:
            loaded = json.loads(raw)
        except json.JSONDecodeError:
            return default
        return loaded if isinstance(loaded, type(default)) else default

    @staticmethod
    def _build_summary(intent: str, answers: dict[str, str]) -> FlowSummary:
        notes = [
            "Kullanıcıya her şeyi tek seferde değil, sırayla sorma mantığı uygulandı.",
            "Bir adım tamamlanmadan sonraki zorunlu adıma geçilmedi.",
        ]
        next_actions = {
            "cv": [
                "Toplanan verilere göre düzenlenebilir CV draft oluşturulmalı.",
                "Şablon seçildiyse içerik o yapıya göre sıkıştırılmalı.",
                "Gerekirse kullanıcı son dokunuşları yaptıktan sonra finalize ve export akışına geçilmeli.",
            ],
            "cover_letter": [
                "Seçilen role göre docx ya da pptx mantığında içerik üretilmeli.",
                "Alıcı tipine göre ton son kez kontrol edilmeli.",
            ],
            "presentation": [
                "Slide yapısı amaca göre kurulmalı.",
                "PPTX oluşumu için bölümler ve görsel ton planlanmalı.",
            ],
            "spreadsheet": [
                "Seçilen ihtiyaca göre kolon yapısı oluşturulmalı.",
                "XLSX senaryosu otomatik tablo mantığına çevrilmeli.",
            ],
        }
        return FlowSummary(
            intent=intent,  # type: ignore[arg-type]
            recommended_format=FORMAT_BY_INTENT[intent],
            workflow_notes=notes,
            collected_answers=answers,
            next_actions=next_actions[intent],
        )

    @staticmethod
    def _build_summary_text(answers: dict[str, str], profile: dict) -> str:
        role = answers.get("target_role") or profile.get("target_role") or "profesyonel rol"
        level = answers.get("experience_level") or profile.get("seniority_level") or "güçlü"
        optimization = answers.get("optimization_target", "ATS uyumu")
        goal = answers.get("cv_goal", "iş başvurusu")
        return (
            f"{level} seviyede {role} odağında konumlanan aday. "
            f"{goal} için hazırlanan bu CV, {optimization.lower()} ve premium recruiter okunabilirliği önceliğiyle yapılandırıldı."
        )

    @staticmethod
    def _parse_experience_answer(answer: str) -> list[ExperienceItem]:
        if not answer.strip():
            return []
        blocks = [block.strip() for block in answer.split("\n\n") if block.strip()]
        items: list[ExperienceItem] = []
        for block in blocks:
            lines = [line.strip("- ").strip() for line in block.splitlines() if line.strip()]
            if not lines:
                continue
            header_parts = [part.strip() for part in lines[0].split("|")]
            bullets = lines[1:] if len(lines) > 1 else []
            items.append(
                ExperienceItem(
                    title=header_parts[0] if len(header_parts) > 0 else "Deneyim",
                    company=header_parts[1] if len(header_parts) > 1 else "Belirtilmedi",
                    start_date=header_parts[2] if len(header_parts) > 2 else None,
                    bullets=bullets,
                )
            )
        return items

    @staticmethod
    def _parse_project_answer(answer: str) -> list[ProjectItem]:
        if not answer.strip():
            return []
        blocks = [block.strip() for block in answer.split("\n\n") if block.strip()]
        items: list[ProjectItem] = []
        for block in blocks:
            lines = [line.strip("- ").strip() for line in block.splitlines() if line.strip()]
            if not lines:
                continue
            header_parts = [part.strip() for part in lines[0].split("|")]
            items.append(
                ProjectItem(
                    name=header_parts[0] if len(header_parts) > 0 else "Proje",
                    subtitle=header_parts[1] if len(header_parts) > 1 else None,
                    bullets=lines[1:] if len(lines) > 1 else [],
                    technologies=[
                        tech.strip() for tech in header_parts[2].split(",")
                    ] if len(header_parts) > 2 and header_parts[2] else [],
                )
            )
        return items

    @staticmethod
    def _parse_education_answer(answer: str) -> list[EducationItem]:
        if not answer.strip():
            return []
        items: list[EducationItem] = []
        for raw_line in [line.strip() for line in answer.splitlines() if line.strip()]:
            parts = [part.strip() for part in raw_line.split("|")]
            if len(parts) >= 2:
                items.append(
                    EducationItem(
                        degree=parts[0],
                        school=parts[1],
                        end_date=parts[2] if len(parts) > 2 else None,
                    )
                )
        return items
