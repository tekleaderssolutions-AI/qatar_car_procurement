"""GET /api/inventory — Risk-scored inventory with filters."""
from fastapi import APIRouter, Query
from typing import Optional
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))
from ml.risk_scorer import score_inventory_filtered, get_risk_summary
from api.cache import cache

router = APIRouter(prefix="/api", tags=["inventory"])


@router.get("/inventory/summary")
@cache(ttl=300, key_prefix="inventory")
def inventory_summary():
    return get_risk_summary()


@router.get("/inventory")
@cache(ttl=300, key_prefix="inventory")
def get_inventory(
    risk_flag: Optional[str] = None,
    body_type: Optional[str] = None,
    make: Optional[str] = None,
    color: Optional[str] = None,
    days_min: Optional[int] = None,
    days_max: Optional[int] = None,
    limit: int = Query(100, le=500),
    offset: int = Query(0, ge=0),
):
    df = score_inventory_filtered(
        risk_flag=risk_flag,
        body_type=body_type,
        make=make,
        color=color,
        days_min=days_min,
        days_max=days_max,
    )
    if df.empty:
        return {"items": [], "total": 0}
    total = len(df)
    df = df.iloc[offset : offset + limit]
    cols = [
        "vehicle_id",
        "make",
        "model",
        "trim",
        "year",
        "color_exterior",
        "days_in_stock",
        "list_price_qar",
        "risk_score",
        "risk_flag",
        "recommended_action",
        "body_type",
    ]
    cols = [c for c in cols if c in df.columns]
    items = df[cols].fillna("").to_dict("records")
    for r in items:
        for k, v in r.items():
            if hasattr(v, "item"):
                r[k] = v.item()
    return {"items": items, "total": total}
