"""Async Groq client for non-streaming chat completions."""
import os
from typing import Optional

import httpx

GROQ_MODEL = "llama-3.1-70b-versatile"


async def generate_async(prompt: str, system: Optional[str] = None, max_tokens: int = 256) -> str:
    key = os.environ.get("GROQ_API_KEY", "").strip()
    if not key:
        return ""
    messages = [{"role": "user", "content": prompt}]
    if system:
        messages = [
            {"role": "system", "content": system},
            {"role": "user", "content": prompt},
        ]
    try:
        async with httpx.AsyncClient(timeout=120) as client:
            resp = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
                json={
                    "model": GROQ_MODEL,
                    "messages": messages,
                    "max_tokens": max_tokens,
                    "stream": False,
                },
            )
        if resp.status_code != 200:
            return ""
        data = resp.json()
        content = (data.get("choices") or [{}])[0].get("message", {}).get("content") or ""
        return content.strip()
    except Exception:
        return ""

