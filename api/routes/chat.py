"""POST /api/chat — LLM conversation (Ollama) with context from datasets."""
import sys
from pathlib import Path
from fastapi import APIRouter
from sqlalchemy import text

ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(ROOT))
from db import get_engine, is_postgres
from api.schemas import ChatRequest, ChatResponse
from ml.market_analyzer import compute_scores, generate_briefing

LLM_DIR = ROOT / "llm"

router = APIRouter(prefix="/api", tags=["chat"])


def get_db_context(limit_per_table: int = 50) -> str:
    """Build a short context string from DB for LLM (PostgreSQL or SQLite)."""
    try:
        engine = get_engine()
    except Exception:
        return "No database loaded."
    with engine.connect() as conn:
        if is_postgres():
            tables = [r[0] for r in conn.execute(text(
                "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"
            )).fetchall()]
        else:
            tables = [r[0] for r in conn.execute(text("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")).fetchall()]
    parts = []
    for t in tables:
        try:
            with engine.connect() as conn:
                rows = conn.execute(text(f'SELECT * FROM "{t}" LIMIT :lim'), {"lim": limit_per_table}).fetchall()
                if is_postgres():
                    cols = [r[0] for r in conn.execute(text(
                        "SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = :t"
                    ), {"t": t}).fetchall()]
                else:
                    cols = [r[1] for r in conn.execute(text(f"PRAGMA table_info([{t}])")).fetchall()]
                if rows and cols:
                    parts.append(f"[{t}] columns: {', '.join(cols)}. Sample row count: {len(rows)}.")
        except Exception:
            pass
    return "\n".join(parts) if parts else "No data."


def call_ollama(prompt: str, system: str) -> str:
    """Call Ollama API if available; else return rule-based reply."""
    try:
        if str(ROOT) not in sys.path:
            sys.path.insert(0, str(ROOT))
        from llm.ollama_client import generate
        out = generate(prompt, system=system)
        if out and "Ollama is not running" not in out:
            return out
    except Exception:
        pass
    return (
        "I'm QAUTO-AI. Based on the loaded data: Market health is in qatar_economic_indicators. "
        "Inventory risk is in vehicle_inventory (risk_flag, risk_score). "
        "For pricing use the /api/price endpoint. "
        "For full AI answers, start Ollama: ollama serve && ollama run llama3.2"
    )


@router.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    system_path = LLM_DIR / "system_prompt.txt"
    system = system_path.read_text(encoding="utf-8", errors="replace") if system_path.exists() else "You are QAUTO-AI, Qatar used car market advisor."
    context = get_db_context(limit_per_table=30)
    # Enrich context with top market demand signals if available.
    try:
        top_models = compute_scores(limit=5)
        if top_models:
            signals = "; ".join(
                f"{m['make']} {m['model']} ({m['demand_confidence_score']:.0f}/100)"
                for m in top_models
            )
            market_brief = generate_briefing(top_n=5)
            extra = f"\n\nLatest market demand signals: {signals}.\nBriefing: {market_brief}"
        else:
            extra = ""
    except Exception:
        extra = ""
    prompt = (
        f"Context from datasets:\n{context}{extra}\n\n"
        f"User question: {req.message}\n\n"
        "Answer briefly and with specific numbers if available."
    )
    reply = call_ollama(prompt, system)
    return ChatResponse(reply=reply, sources=["vehicle_inventory", "historical_sales", "qatar_economic_indicators"])
