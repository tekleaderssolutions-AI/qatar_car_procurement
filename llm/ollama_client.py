"""Ollama API wrapper for QAUTO-AI chat."""
import requests
from typing import Optional

OLLAMA_URL = "http://localhost:11434"
# Default local LLM for QAUTO-AI.
# Using Qwen 2.5 7B for strong multilingual + reasoning.
DEFAULT_MODEL = "qwen2.5:7b"


def generate(prompt: str, system: Optional[str] = None, model: str = DEFAULT_MODEL, max_tokens: int = 512) -> str:
    """Send prompt to Ollama and return response text."""
    try:
        payload = {"model": model, "prompt": prompt, "stream": False, "options": {"num_predict": max_tokens}}
        if system:
            payload["system"] = system
        r = requests.post(f"{OLLAMA_URL}/api/generate", json=payload, timeout=60)
        if r.status_code == 200:
            return r.json().get("response", "")
        return f"Ollama error: {r.status_code}"
    except requests.exceptions.ConnectionError:
        return "Ollama is not running. Start it with: ollama serve && ollama run qwen2.5:7b"
    except Exception as e:
        return str(e)


def list_models() -> list:
    """List available Ollama models."""
    try:
        r = requests.get(f"{OLLAMA_URL}/api/tags", timeout=5)
        if r.status_code == 200:
            return [m["name"] for m in r.json().get("models", [])]
    except Exception:
        pass
    return []
