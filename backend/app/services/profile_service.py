from typing import List
from backend.app.schemas.profile import UserProfile, UserProfileCreate
from backend.app.core.db import get_session
from backend.app.models.profile import ProfileModel


class ProfileService:
    @staticmethod
    def _encode_list(values: List[str] | None) -> str | None:
        return ",".join(values) if values else None

    @staticmethod
    def _decode_list(value: str | None) -> list[str]:
        return value.split(",") if value else []

    @staticmethod
    def create_profile(payload: UserProfileCreate) -> UserProfile:
        profile_data = payload.model_dump()
        profile_data.pop("user_id", None)
        profile_data["skills"] = ProfileService._encode_list(profile_data.get("skills"))
        profile_data["languages"] = ProfileService._encode_list(profile_data.get("languages"))
        profile_data["certifications"] = ProfileService._encode_list(profile_data.get("certifications"))
        with get_session() as session:
            profile = ProfileModel(**profile_data)
            session.add(profile)
            session.commit()
            session.refresh(profile)
            return UserProfile(
                user_id=profile.id,
                full_name=profile.full_name,
                email=profile.email,
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
                certifications=ProfileService._decode_list(profile.certifications),
            )

    @staticmethod
    def get_profile(user_id: str) -> UserProfile | None:
        with get_session() as session:
            profile = session.get(ProfileModel, user_id)
            if not profile:
                return None
            return UserProfile(
                user_id=profile.id,
                full_name=profile.full_name,
                email=profile.email,
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
                certifications=ProfileService._decode_list(profile.certifications),
            )
