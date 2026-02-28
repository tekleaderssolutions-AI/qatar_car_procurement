"""
Model 3 — Demand Forecaster (simplified).
Uses historical_sales monthly volume by model + optional Prophet; returns expected demand next 30/60/90 days.
"""
import sys
import pandas as pd
import numpy as np
from pathlib import Path
from datetime import datetime, timedelta

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))
from db import get_engine


def load_sales_volume():
    try:
        engine = get_engine()
        df = pd.read_sql(
            "SELECT date_out, make, model, sale_price_qar FROM historical_sales WHERE date_out IS NOT NULL AND date_out != ''",
            engine
        )
    except Exception:
        return pd.DataFrame()
    if df.empty:
        return df
    df["date_out"] = pd.to_datetime(df["date_out"], errors="coerce")
    df = df.dropna(subset=["date_out"])
    df["month"] = df["date_out"].dt.to_period("M")
    df["model_key"] = df["make"].astype(str) + "|" + df["model"].astype(str)
    return df


def forecast_demand(days_ahead: int = 30):
    """
    Simple demand: average monthly sales per model over last 12 months, scaled to days_ahead.
    Returns dict model_key -> expected_volume, expected_avg_price.
    """
    df = load_sales_volume()
    if df.empty:
        return {}
    cutoff = pd.Timestamp.now() - pd.DateOffset(months=12)
    df = df[df["date_out"] >= cutoff]
    if df.empty:
        return {}
    monthly = df.groupby(["model_key", "month"]).agg(
        volume=("sale_price_qar", "count"),
        avg_price=("sale_price_qar", "mean")
    ).reset_index()
    agg = monthly.groupby("model_key").agg(
        avg_volume=("volume", "mean"),
        avg_price=("avg_price", "mean")
    ).reset_index()
    scale = days_ahead / 30.0
    result = {}
    for _, row in agg.iterrows():
        result[row["model_key"]] = {
            "expected_volume_30d": round(float(row["avg_volume"]) * (30 / 30), 1),
            "expected_volume_60d": round(float(row["avg_volume"]) * (60 / 30), 1),
            "expected_volume_90d": round(float(row["avg_volume"]) * (90 / 30), 1),
            "expected_avg_price": round(float(row["avg_price"]), 0),
        }
    return result


def top_demand_models(limit: int = 10, days: int = 30):
    f = forecast_demand(days)
    items = [(k, v["expected_volume_30d"], v["expected_avg_price"]) for k, v in f.items()]
    items.sort(key=lambda x: -x[1])
    return [{"model_key": k, "expected_volume": vol, "expected_avg_price": price} for k, vol, price in items[:limit]]


if __name__ == "__main__":
    print(forecast_demand(30))
    print(top_demand_models(5))
