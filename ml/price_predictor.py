"""
Model 1 — Used Car Price Predictor (XGBoost).
Trains on historical_sales + optional economic context; outputs predicted price QAR + confidence.
"""
import os
import json
import sys
import pandas as pd
import numpy as np
from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import mean_absolute_percentage_error, r2_score
import xgboost as xgb

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))
from db import get_engine

MODELS_DIR = Path(__file__).resolve().parent / "models"
MODEL_PATH = MODELS_DIR / "price_predictor_v1.json"
ENCODERS_PATH = MODELS_DIR / "price_encoders.json"


def load_training_data():
    engine = get_engine()
    df = pd.read_sql("SELECT * FROM historical_sales", engine)
    try:
        econ = pd.read_sql("SELECT * FROM qatar_economic_indicators", engine)
    except Exception:
        econ = pd.DataFrame()
    if df.empty:
        raise ValueError("historical_sales is empty")
    df["date_out"] = pd.to_datetime(df["date_out"], errors="coerce")
    df = df.dropna(subset=["sale_price_qar", "make", "model", "year"])
    df["month_key"] = df["date_out"].dt.to_period("M").astype(str)
    if not econ.empty and "date" in econ.columns:
        econ["date"] = pd.to_datetime(econ["date"], errors="coerce")
        econ["month_key"] = econ["date"].dt.to_period("M").astype(str)
        merge_cols = ["oil_price_usd_barrel", "interest_rate_pct", "consumer_confidence_index", "is_peak_buying_season"]
        merge_cols = [c for c in merge_cols if c in econ.columns]
        if merge_cols:
            df = df.merge(econ[["month_key"] + merge_cols].drop_duplicates("month_key"), on="month_key", how="left")
    df["age_years"] = (pd.Timestamp.now().year - df["year"].astype(int)).clip(0, 20)
    return df, list(df.columns)


def prepare_features(df: pd.DataFrame, encoders: dict, fit: bool):
    cat_cols = ["make", "model", "trim", "color_exterior", "body_type"]
    cat_cols = [c for c in cat_cols if c in df.columns]
    X = df.copy()
    for col in cat_cols:
        if col not in X.columns:
            continue
        X[col] = X[col].astype(str).fillna("__null__")
        if fit:
            encoders[col] = LabelEncoder().fit(X[col].astype(str))
        if col in encoders:
            try:
                X[col] = encoders[col].transform(X[col].astype(str))
            except ValueError:
                X[col] = 0
    num_cols = ["year", "age_years", "displacement_cc", "color_demand_score", "feature_demand_score"]
    if "oil_price_usd_barrel" in X.columns:
        num_cols.extend(["oil_price_usd_barrel", "interest_rate_pct", "consumer_confidence_index", "is_peak_buying_season"])
    num_cols = [c for c in num_cols if c in X.columns]
    flags = ["sunroof_flag", "ventilated_seats_flag"]
    for f in flags:
        if f in X.columns:
            X[f] = (X[f] == True) | (X[f] == "True") | (X[f] == 1)
    feature_cols = [c for c in cat_cols + num_cols + flags if c in X.columns]
    X = X[feature_cols].fillna(0)
    return X, feature_cols, encoders


def train():
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    df, _ = load_training_data()
    encoders = {}
    X, feature_cols, encoders = prepare_features(df, encoders, fit=True)
    y = df["sale_price_qar"].values
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    model = xgb.XGBRegressor(n_estimators=300, max_depth=6, learning_rate=0.05, random_state=42)
    model.fit(X_train, y_train, eval_set=[(X_test, y_test)], verbose=False)
    pred = model.predict(X_test)
    mape = mean_absolute_percentage_error(y_test, pred)
    r2 = r2_score(y_test, pred)
    print(f"Price Predictor — MAPE: {mape:.2%}, R²: {r2:.4f}")
    model.save_model(str(MODEL_PATH))
    with open(ENCODERS_PATH, "w") as f:
        json.dump({k: list(v.classes_) for k, v in encoders.items()}, f, indent=2)
    with open(MODELS_DIR / "price_feature_cols.json", "w") as f:
        json.dump(feature_cols, f)
    return mape, model, encoders, feature_cols


def predict(car: dict, model=None, encoders=None, feature_cols=None):
    """Predict price for a single car. car: make, model, trim, year, color_exterior, body_type, etc."""
    if model is None and MODEL_PATH.exists():
        model = xgb.XGBRegressor()
        model.load_model(str(MODEL_PATH))
    if encoders is None and ENCODERS_PATH.exists():
        with open(ENCODERS_PATH) as f:
            classes = json.load(f)
        encoders = {k: LabelEncoder().fit(c) for k, c in classes.items()}
    if feature_cols is None and (MODELS_DIR / "price_feature_cols.json").exists():
        with open(MODELS_DIR / "price_feature_cols.json") as f:
            feature_cols = json.load(f)
    df = pd.DataFrame([car])
    if "year" in df.columns:
        df["age_years"] = (pd.Timestamp.now().year - pd.to_numeric(df["year"], errors="coerce")).clip(0, 20)
    df, _, _ = prepare_features(df, encoders or {}, fit=False)
    for c in feature_cols:
        if c not in df.columns:
            df[c] = 0
    df = df[feature_cols]
    price = float(model.predict(df)[0])
    return round(price, 0), 85  # confidence placeholder


if __name__ == "__main__":
    train()
