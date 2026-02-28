"""
Qatar Used Car Market — AI Intelligence Platform API.
FastAPI app: pricing, inventory, market, matching, chat.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
import sys
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from api.routes import pricing, inventory, market, matching, chat, competitors

app = FastAPI(
    title="Qatar AI Platform API",
    description="Used car market intelligence: pricing, inventory risk, demand, buyer matching, AI chat",
    version="1.0",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(pricing.router)
app.include_router(inventory.router)
app.include_router(market.router)
app.include_router(matching.router)
app.include_router(chat.router)
app.include_router(competitors.router)


@app.get("/")
def root():
    return {"service": "Qatar AI Platform", "docs": "/docs", "health": "ok"}


@app.get("/health")
def health():
    return {"status": "ok"}
