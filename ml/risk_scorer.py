"""
Model 2 — Inventory Risk Scorer.
Computes risk_score 0-100 and risk_flag from days_in_stock, color, features, season.
Uses formula from blueprint; can run on existing inventory table or recompute.
"""
import sys
import pandas as pd
import numpy as np
from pathlib import Path

from sqlalchemy import text

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))
from db import get_engine

# Color penalty (Qatar: white/silver preferred)
COLOR_SCORE = {
    "white": 0, "pearl white": 0,
    "silver": 10, "black": 10, "graphite grey": 10, "titanium grey": 10,
    "beige": 25, "bronze": 25, "ivory": 15, "cream": 15, "grey": 10, "brown": 20,
    "red": 45, "blue": 45, "green": 45,
}

# Feature penalties (Qatar: sunroof in summer = risk, ventilated seats = desirable)
def feature_penalty(row) -> float:
    score = 0
    if row.get("sunroof_flag") in (True, "True", 1):
        score += 25
    if row.get("tinted_glass_flag") in (False, "False", 0) and pd.notna(row.get("tinted_glass_flag")):
        score += 10
    if str(row.get("drivetrain", "")).upper() == "RWD" and "SUV" in str(row.get("body_type", "")):
        score += 15
    if row.get("ventilated_seats_flag") in (True, "True", 1):
        score -= 10
    return min(100, max(0, score))


def days_score(days: int) -> int:
    if days <= 30: return 0
    if days <= 90: return 20
    if days <= 180: return 50
    if days <= 365: return 80
    return 100


def color_score(color: str) -> int:
    if pd.isna(color):
        return 25
    c = str(color).strip().lower()
    for k, v in COLOR_SCORE.items():
        if k in c:
            return v
    return 25


def compute_risk_score(row: dict, market_demand_score: int = 50, competitor_score: int = 50) -> tuple:
    days = int(row.get("days_in_stock") or 0)
    d_score = days_score(days)
    c_score = color_score(row.get("color_exterior"))
    f_score = feature_penalty(row)
    risk = (
        d_score * 0.35 +
        c_score * 0.20 +
        min(100, f_score + 50) * 0.15 +
        market_demand_score * 0.15 +
        competitor_score * 0.05
    )
    risk = min(100, max(0, round(risk, 0)))
    if risk <= 30: flag = "healthy"
    elif risk <= 55: flag = "monitor"
    elif risk <= 75: flag = "at_risk"
    elif risk <= 89: flag = "at_risk"
    else: flag = "critical"
    return int(risk), flag


def _apply_scores(df: pd.DataFrame) -> pd.DataFrame:
    if df.empty:
        return df
    scores, flags = [], []
    for _, row in df.iterrows():
        r, f = compute_risk_score(row.to_dict())
        scores.append(r)
        flags.append(f)
    df["risk_score"] = scores
    df["risk_flag"] = flags
    return df


def score_inventory():
    """Load full inventory from DB, compute risk for each row, return DataFrame."""
    try:
        engine = get_engine()
        df = pd.read_sql("SELECT * FROM vehicle_inventory", engine)
    except Exception:
        return pd.DataFrame()
    return _apply_scores(df)


def score_inventory_filtered(
    risk_flag: str | None = None,
    body_type: str | None = None,
    make: str | None = None,
    color: str | None = None,
    days_min: int | None = None,
    days_max: int | None = None,
):
    """
    Load filtered inventory from DB using SQL WHERE clauses, then compute risk.
    This avoids loading the entire table into memory for dashboard filters.
    """
    try:
        engine = get_engine()
    except Exception:
        return pd.DataFrame()

    base = "SELECT * FROM vehicle_inventory WHERE 1=1"
    clauses: list[str] = []
    params: dict[str, object] = {}

    if risk_flag:
        clauses.append(" AND risk_flag = :risk_flag")
        params["risk_flag"] = risk_flag
    if body_type:
        clauses.append(" AND body_type ILIKE :body_type")
        params["body_type"] = f"%{body_type}%"
    if make:
        clauses.append(" AND make ILIKE :make")
        params["make"] = f"%{make}%"
    if color:
        clauses.append(" AND color_exterior ILIKE :color")
        params["color"] = f"%{color}%"
    if days_min is not None:
        clauses.append(" AND days_in_stock >= :days_min")
        params["days_min"] = days_min
    if days_max is not None:
        clauses.append(" AND days_in_stock <= :days_max")
        params["days_max"] = days_max

    query = text(base + "".join(clauses))
    try:
        engine = get_engine()
        df = pd.read_sql(query, engine, params=params)
    except Exception:
        # Fallback to unfiltered computation if SQL or column mismatch occurs
        return score_inventory()
    return _apply_scores(df)


def get_risk_summary():
    """Return counts by risk_flag for dashboard KPIs."""
    df = score_inventory()
    if df.empty:
        return {"critical": 0, "at_risk": 0, "monitor": 0, "healthy": 0}
    return df["risk_flag"].value_counts().to_dict()


if __name__ == "__main__":
    df = score_inventory()
    print("Risk summary:", get_risk_summary())
    print(df[["vehicle_id", "make", "model", "days_in_stock", "risk_score", "risk_flag"]].head(10))
