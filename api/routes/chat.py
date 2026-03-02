"""POST /api/chat — LLM conversation (Groq) with context from datasets."""
import sys
from pathlib import Path
from fastapi import APIRouter, Query
from fastapi.responses import StreamingResponse
from sqlalchemy import text
from fastapi import Request
from api.limiter import limiter

ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(ROOT))
from db import get_engine, get_async_engine
from api.schemas import ChatRequest, ChatResponse
from ml.market_analyzer import compute_scores, generate_briefing

LLM_DIR = ROOT / "llm"

router = APIRouter(prefix="/api", tags=["chat"])


async def get_db_context(limit_per_table: int = 50) -> str:
    """Build a short context string from DB for LLM (PostgreSQL)."""
    try:
        engine = get_async_engine()
    except Exception:
        return "No database loaded."
    try:
        async with engine.connect() as conn:
            tables_rows = await conn.execute(
                text(
                    "SELECT table_name FROM information_schema.tables "
                    "WHERE table_schema = 'public' ORDER BY table_name"
                )
            )
            tables = [r[0] for r in tables_rows.fetchall()]
    except Exception:
        return "No data."

    parts: list[str] = []
    for t in tables:
        try:
            async with engine.connect() as conn:
                rows = (await conn.execute(text(f'SELECT * FROM "{t}" LIMIT :lim'), {"lim": limit_per_table})).fetchall()
                cols_rows = await conn.execute(
                    text(
                        "SELECT column_name FROM information_schema.columns "
                        "WHERE table_schema = 'public' AND table_name = :t"
                    ),
                    {"t": t},
                )
                cols = [r[0] for r in cols_rows.fetchall()]
                if rows and cols:
                    parts.append(f"[{t}] columns: {', '.join(cols)}. Sample row count: {len(rows)}.")
        except Exception:
            continue
    return "\n".join(parts) if parts else "No data."


def call_llm(prompt: str, system: str) -> str:
    """Call Groq API. Set GROQ_API_KEY in .env for AI replies."""
    try:
        if str(ROOT) not in sys.path:
            sys.path.insert(0, str(ROOT))
        from llm.groq_client import generate as groq_gen
        out = groq_gen(prompt, system=system, max_tokens=256)
        if out:
            return out
    except Exception:
        pass
    return (
        "I'm QAUTO-AI. Set GROQ_API_KEY in .env for AI answers. "
        "Market health is in qatar_economic_indicators. Inventory risk in vehicle_inventory. "
        "For pricing use the /api/price endpoint."
    )


@router.get("/chat/stream")
async def chat_stream(message: str = Query(..., min_length=1)):
    """SSE streaming endpoint — use GET /api/chat/stream?message=... for EventSource."""
    system_path = LLM_DIR / "system_prompt.txt"
    system = system_path.read_text(encoding="utf-8", errors="replace") if system_path.exists() else "You are QAUTO-AI, Qatar used car market advisor."
    context = await get_db_context(limit_per_table=30)
    try:
        top_models = compute_scores(limit=5)
        if top_models:
            signals = "; ".join(f"{m['make']} {m['model']} ({m['demand_confidence_score']:.0f}/100)" for m in top_models)
            market_brief = generate_briefing(top_n=5)
            extra = f"\n\nLatest market demand signals: {signals}.\nBriefing: {market_brief}"
        else:
            extra = ""
    except Exception:
        extra = ""
    prompt = f"Context from datasets:\n{context}{extra}\n\nUser question: {message}\n\nAnswer briefly and with specific numbers if available."
    from llm.groq_stream import stream_groq
    return StreamingResponse(
        stream_groq(prompt, system=system),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@router.post("/chat", response_model=ChatResponse)
@limiter.limit("10/minute")
async def chat(req: ChatRequest, request: Request):
    system_path = LLM_DIR / "system_prompt.txt"
    system = system_path.read_text(encoding="utf-8", errors="replace") if system_path.exists() else "You are QAUTO-AI, Qatar used car market advisor."
    context = await get_db_context(limit_per_table=30)
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
    from llm.groq_async import generate_async

    reply = await generate_async(prompt, system=system, max_tokens=256)
    if not reply:
        reply = (
            "I'm QAUTO-AI. Set GROQ_API_KEY in .env for AI answers. "
            "Market health is in qatar_economic_indicators. Inventory risk in vehicle_inventory. "
            "For pricing use the /api/price endpoint."
        )
    return ChatResponse(reply=reply, sources=["vehicle_inventory", "historical_sales", "qatar_economic_indicators"])
