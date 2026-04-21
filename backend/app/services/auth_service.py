from uuid import uuid4


class AuthService:
    @staticmethod
    def login(email: str) -> str:
        # Bu MVP sürümünde basit token üretimi.
        return uuid4().hex

    @staticmethod
    def register(name: str | None, email: str, password: str) -> str:
        # Bu MVP sürümünde kayıt akışı token üretimiyle başlıyor.
        # Gerçek kullanıcı kayıtları ileride kalıcı auth katmanına taşınacak.
        return uuid4().hex
