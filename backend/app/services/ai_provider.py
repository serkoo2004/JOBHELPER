import json
from typing import Any

import requests

from backend.app.core.config import settings


class AiProvider:
    @staticmethod
    def available_provider() -> str | None:
        if settings.google_api_key:
            return "google"
        if settings.openai_api_key:
            return "openai"
        return None

    @staticmethod
    def generate(prompt: str, model: str | None = None) -> str:
        provider = AiProvider.available_provider()
        if provider == "google":
            return AiProvider._generate_google(prompt, model or settings.google_model)
        if provider == "openai":
            return AiProvider._generate_openai(prompt, model or settings.openai_model)
        raise RuntimeError("No AI provider configured")

    @staticmethod
    def _generate_google(prompt: str, model: str) -> str:
        normalized_model = AiProvider._normalize_google_model(model)
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{normalized_model}:generateContent"
        headers = {
            "Content-Type": "application/json",
            "x-goog-api-key": settings.google_api_key or "",
        }
        payload = {
            "contents": [
                {
                    "role": "user",
                    "parts": [{"text": prompt}],
                }
            ],
            "generationConfig": {
                "temperature": 0.7,
                "maxOutputTokens": 1200,
            },
        }
        response = requests.post(url, headers=headers, json=payload, timeout=45)
        response.raise_for_status()
        data = response.json()
        parts = (
            data.get("candidates", [{}])[0]
            .get("content", {})
            .get("parts", [])
        )
        text_parts = [part.get("text", "") for part in parts if part.get("text")]
        if text_parts:
            return "\n".join(text_parts).strip()
        raise RuntimeError(f"Google AI empty response: {json.dumps(data)[:500]}")

    @staticmethod
    def _normalize_google_model(model: str) -> str:
        legacy_models = {
            "text-bison-001",
            "gemini-pro",
            "gemini-1.0-pro",
            "gemini-1.5-pro",
            "gemini-1.5-flash",
            "gemini-2.0-flash",
        }
        cleaned = (model or "").strip()
        if not cleaned or cleaned in legacy_models:
            return "gemini-2.5-flash"
        return cleaned

    @staticmethod
    def _generate_openai(prompt: str, model: str) -> str:
        url = "https://api.openai.com/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {settings.openai_api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": model,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.7,
            "max_tokens": 500,
        }
        response = requests.post(url, headers=headers, json=payload, timeout=30)
        response.raise_for_status()
        data = response.json()
        return data.get("choices", [{}])[0].get("message", {}).get("content", "")
