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
        url = f"https://generativelanguage.googleapis.com/v1beta2/models/{model}:generateText"
        params = {"key": settings.google_api_key}
        payload = {
            "prompt": {"text": prompt},
            "temperature": 0.7,
            "maxOutputTokens": 500,
        }
        response = requests.post(url, params=params, json=payload, timeout=30)
        response.raise_for_status()
        data = response.json()
        return data.get("candidates", [{}])[0].get("output", "")

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
