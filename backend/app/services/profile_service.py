import json
from typing import List

from backend.app.core.db import get_session
from backend.app.models.profile import ProfileModel
from backend.app.schemas.profile import (
    CertificationItem,
    EducationItem,
    ExperienceItem,
    ProjectItem,
    UserProfile,
    UserProfileCreate,
    UserProfileUpdate,
)


class ProfileService:
    @staticmethod
    def _encode_list(values: List[str] | None) -> str | None:
        return ",".join(values) if values else None

    @staticmethod
    def _decode_list(value: str | None) -> list[str]:
        return value.split(",") if value else []

    @staticmethod
    def _encode_json(items: list[dict] | list[str] | None) -> str | None:
        return json.dumps(items, ensure_ascii=False) if items else None

    @staticmethod
    def _decode_json(value: str | None) -> list[dict]:
        if not value:
            return []
        try:
            decoded = json.loads(value)
        except json.JSONDecodeError:
            return []
        return decoded if isinstance(decoded, list) else []

    @staticmethod
    def _normalize_certifications(
        values: list[str | CertificationItem] | None,
    ) -> tuple[str | None, list[CertificationItem]]:
        if not values:
            return None, []
        normalized: list[CertificationItem] = []
        for item in values:
            if isinstance(item, str):
                normalized.append(CertificationItem(name=item))
            else:
                normalized.append(item)
        names = [item.name for item in normalized if item.name]
        return ProfileService._encode_list(names), normalized

    @staticmethod
    def _to_user_profile(profile: ProfileModel) -> UserProfile:
        certifications_raw = ProfileService._decode_list(profile.certifications)
        return UserProfile(
            user_id=profile.id,
            full_name=profile.full_name,
            email=profile.email,
            photo_url=profile.photo_url,
            phone=profile.phone,
            location=profile.location,
            summary=profile.summary,
            target_role=profile.target_role,
            seniority_level=profile.seniority_level,
            years_of_experience=profile.years_of_experience,
            linkedin_url=profile.linkedin_url,
            github_url=profile.github_url,
            portfolio_url=profile.portfolio_url,
            skills=ProfileService._decode_list(profile.skills),
            languages=ProfileService._decode_list(profile.languages),
            certifications=certifications_raw,
            experiences=[
                ExperienceItem.model_validate(item)
                for item in ProfileService._decode_json(profile.experiences)
            ],
            projects=[
                ProjectItem.model_validate(item)
                for item in ProfileService._decode_json(profile.projects)
            ],
            education=[
                EducationItem.model_validate(item)
                for item in ProfileService._decode_json(profile.education)
            ],
        )

    @staticmethod
    def create_profile(payload: UserProfileCreate) -> UserProfile:
        profile_data = payload.model_dump()
        profile_data.pop("user_id", None)
        certifications_text, certifications_structured = ProfileService._normalize_certifications(
            payload.certifications
        )
        profile_data["skills"] = ProfileService._encode_list(profile_data.get("skills"))
        profile_data["languages"] = ProfileService._encode_list(profile_data.get("languages"))
        profile_data["certifications"] = certifications_text
        profile_data["experiences"] = ProfileService._encode_json(
            [item.model_dump() for item in payload.experiences]
        )
        profile_data["projects"] = ProfileService._encode_json(
            [item.model_dump() for item in payload.projects]
        )
        profile_data["education"] = ProfileService._encode_json(
            [item.model_dump() for item in payload.education]
        )

        with get_session() as session:
            profile = ProfileModel(**profile_data)
            session.add(profile)
            session.commit()
            session.refresh(profile)
            result = ProfileService._to_user_profile(profile)
            result.certifications = (
                [item.model_dump(exclude_none=True) for item in certifications_structured]
                if certifications_structured
                else result.certifications
            )
            return result

    @staticmethod
    def get_profile(user_id: str) -> UserProfile | None:
        with get_session() as session:
            profile = session.get(ProfileModel, user_id)
            if not profile:
                return None
            return ProfileService._to_user_profile(profile)

    @staticmethod
    def update_profile(user_id: str, payload: UserProfileUpdate) -> UserProfile | None:
        with get_session() as session:
            profile = session.get(ProfileModel, user_id)
            if not profile:
                return None

            update_data = payload.model_dump(exclude_none=True)
            if "skills" in update_data:
                update_data["skills"] = ProfileService._encode_list(update_data["skills"])
            if "languages" in update_data:
                update_data["languages"] = ProfileService._encode_list(update_data["languages"])
            if "certifications" in update_data:
                certifications_text, _ = ProfileService._normalize_certifications(update_data["certifications"])
                update_data["certifications"] = certifications_text
            if "experiences" in update_data:
                update_data["experiences"] = ProfileService._encode_json(
                    [item.model_dump() if hasattr(item, "model_dump") else item for item in update_data["experiences"]]
                )
            if "projects" in update_data:
                update_data["projects"] = ProfileService._encode_json(
                    [item.model_dump() if hasattr(item, "model_dump") else item for item in update_data["projects"]]
                )
            if "education" in update_data:
                update_data["education"] = ProfileService._encode_json(
                    [item.model_dump() if hasattr(item, "model_dump") else item for item in update_data["education"]]
                )

            for key, value in update_data.items():
                setattr(profile, key, value)

            session.add(profile)
            session.commit()
            session.refresh(profile)
            return ProfileService._to_user_profile(profile)
