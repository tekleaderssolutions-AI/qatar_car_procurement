"""
Qatar AI Platform - Data validation. Checks row counts and key columns.
Works with PostgreSQL and SQLite.
"""
import sys
from pathlib import Path
from sqlalchemy import text

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))
from db import get_engine, is_postgres

EXPECTED_TABLES = {
    "vehicle_inventory": ["vehicle_id", "make", "model", "list_price_qar", "days_in_stock", "risk_score", "risk_flag"],
    "historical_sales": ["historical_id", "make", "model", "sale_price_qar", "days_to_sell", "date_out"],
    "customers": ["customer_id", "preferred_body_type", "preferred_color", "next_upgrade_prediction", "lifetime_value_qar"],
    "purchase_orders": ["po_id", "make", "model", "quantity", "status"],
    "competitor_pricing": ["listing_id", "make", "model", "listed_price_qar", "platform"],
    "qatar_events_calendar": ["event_id", "event_name", "start_date", "demand_multiplier"],
    "qatar_market_reports": [],
    "qatar_economic_indicators": [],
    "social_media_trends": [],
    "google_trends": [],
}


def validate():
    engine = get_engine()
    try:
        with engine.connect() as conn:
            if is_postgres():
                result = conn.execute(text(
                    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"
                ))
            else:
                result = conn.execute(text("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"))
            tables = [row[0] for row in result]
    except Exception as e:
        print(f"Database connection failed: {e}")
        return False

    ok = True
    for table, key_cols in EXPECTED_TABLES.items():
        if table not in tables:
            print(f"  Missing table: {table}")
            ok = False
            continue
        with engine.connect() as conn:
            n = conn.execute(text(f'SELECT COUNT(*) FROM "{table}"')).scalar()
            if key_cols:
                if is_postgres():
                    result = conn.execute(text(
                        "SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = :t"
                    ), {"t": table})
                else:
                    result = conn.execute(text(f"PRAGMA table_info([{table}])"))
                cols = [row[1] if not is_postgres() else row[0] for row in result]
                missing = [c for c in key_cols if c not in cols]
                if missing:
                    print(f"  {table}: missing columns {missing} (rows={n})")
                    ok = False
                else:
                    print(f"  {table}: {n} rows OK")
            else:
                print(f"  {table}: {n} rows")
    return ok


if __name__ == "__main__":
    print("Qatar AI Platform — Validation")
    validate()
