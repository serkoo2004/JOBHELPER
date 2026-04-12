from uuid import uuid4


class AuthService:
    @staticmethod
    def login(email: str) -> str:
        # Bu MVP sürümünde basit token üretimi.
        return uuid4().hex
