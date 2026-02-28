"""GET /api/market — Market signals, KPIs, economic snapshot."""
import sys
from pathlib import Path
from fastapi import APIRouter, Query
from sqlalchemy import text
import pandas as pd

ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(ROOT))
from db import get_engine, is_postgres
from ml.market_analyzer import compute_scores, generate_briefing

router = APIRouter(prefix="/api", tags=["market"])


def _run(engine, stmt, params=None):
    with engine.connect() as conn:
        return conn.execute(text(stmt), params or {}).fetchall()


@router.get("/market/kpis")
def market_kpis():
    out = {}
    try:
        engine = get_engine()
    except Exception:
        return out
    date_90 = "(CURRENT_DATE - INTERVAL '90 days')" if is_postgres() else "date('now','-90 days')"
    try:
        r = _run(engine, "SELECT overall_market_health_score FROM qatar_economic_indicators ORDER BY date DESC LIMIT 1")
        out["market_health_score"] = r[0][0] if r else 75
    except Exception:
        out["market_health_score"] = 75
    try:
        r = _run(engine, f"SELECT AVG(days_to_sell) FROM historical_sales WHERE body_type LIKE '%%SUV%%' AND date_out >= {date_90}")
        out["avg_days_to_sell_suv"] = round(r[0][0], 0) if r and r[0][0] is not None else 45
    except Exception:
        out["avg_days_to_sell_suv"] = 45
    try:
        r = _run(engine, "SELECT COUNT(*) FROM vehicle_inventory WHERE risk_flag = 'critical'")
        out["critical_inventory_count"] = r[0][0]
    except Exception:
        out["critical_inventory_count"] = 0
    try:
        if is_postgres():
            r = _run(engine, "SELECT COUNT(*) FROM customers WHERE next_upgrade_prediction <= CURRENT_DATE + INTERVAL '60 days' AND next_upgrade_prediction >= CURRENT_DATE")
        else:
            r = _run(engine, "SELECT COUNT(*) FROM customers WHERE next_upgrade_prediction <= date('now','+60 days') AND next_upgrade_prediction >= date('now')")
        out["active_buyers_60d"] = r[0][0]
    except Exception:
        out["active_buyers_60d"] = 0
    try:
        r = _run(engine, "SELECT oil_price_usd_barrel, interest_rate_pct, consumer_confidence_index FROM qatar_economic_indicators ORDER BY date DESC LIMIT 1")
        if r:
            out["oil_price_usd"] = r[0][0]
            out["interest_rate_pct"] = r[0][1]
            out["consumer_confidence_index"] = r[0][2]
    except Exception:
        pass
    return out


@router.get("/market/trends")
def market_trends():
    """Simple trend: last 12 months sales volume."""
    try:
        engine = get_engine()
        if is_postgres():
            df = pd.read_sql(
                "SELECT to_char(date_out, 'YYYY-MM') as month, COUNT(*) as volume FROM historical_sales WHERE date_out IS NOT NULL GROUP BY 1 ORDER BY 1",
                engine
            )
        else:
            df = pd.read_sql(
                "SELECT strftime('%Y-%m', date_out) as month, COUNT(*) as volume FROM historical_sales WHERE date_out IS NOT NULL GROUP BY 1 ORDER BY 1",
                engine
            )
        return {"months": df["month"].tolist(), "volumes": df["volume"].tolist()}
    except Exception:
        return {"months": [], "volumes": []}


@router.get("/market/events")
def upcoming_events(limit: int = 10):
    try:
        engine = get_engine()
        with engine.connect() as conn:
            if is_postgres():
                rows = conn.execute(text(
                    "SELECT event_name, start_date, end_date, demand_multiplier FROM qatar_events_calendar WHERE start_date >= CURRENT_DATE ORDER BY start_date LIMIT :limit"
                ), {"limit": limit}).fetchall()
            else:
                rows = conn.execute(text(
                    "SELECT event_name, start_date, end_date, demand_multiplier FROM qatar_events_calendar WHERE start_date >= date('now') ORDER BY start_date LIMIT :limit"
                ), {"limit": limit}).fetchall()
        return [{"event_name": r[0], "start_date": str(r[1]), "end_date": str(r[2]), "demand_multiplier": float(r[3]) if r[3] is not None else 0} for r in rows]
    except Exception:
        return []


@router.get("/market/analysis")
def market_analysis(limit: int = Query(20, le=100)):
    """
    Aggregate market, Google Trends, and social data into model-level demand scores.
    Used by dashboards and AI Advisor for high-level signals.
    """
    models = compute_scores(limit=limit)
    briefing = generate_briefing(top_n=min(5, len(models)))
    return {"models": models, "briefing": briefing}
