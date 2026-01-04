from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import pandas as pd
from fastapi.middleware.cors import CORSMiddleware

from backend.gemini_advisor import generate_crop_advisory

# ---------------- LOAD ARTIFACTS ----------------
MODEL_PATH = "models/crop_risk_model.pkl"
ENCODER_PATH = "models/crop_risk_label_encoder.pkl"
SCALER_PATH = "models/feature_scaler.pkl"
DATA_PATH = "data/processed/climate_with_stress_features.csv"

model = joblib.load(MODEL_PATH)
label_encoder = joblib.load(ENCODER_PATH)
scaler = joblib.load(SCALER_PATH)

climate_df = pd.read_csv(DATA_PATH)

# ---------------- FASTAPI APP ----------------
app = FastAPI(title="AgroShield Climate Risk API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:9002",
        "http://127.0.0.1:9002"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- INPUT SCHEMA ----------------
class PredictionInput(BaseModel):
    location: str
    crop: str
    soil_type: str


# ---------------- CROP + SOIL ADJUSTMENT ----------------
def adjust_risk_by_crop_and_soil(base_risk: str, crop: str, soil_type: str) -> str:
    risk_score = {"Low": 1, "Medium": 2, "High": 3}[base_risk]

    crop_sensitivity = {
        "Wheat": {"heat": 1.2, "drought": 1.1},
        "Rice": {"heat": 1.0, "drought": 0.7},
        "Maize": {"heat": 1.1, "drought": 1.0},
    }

    soil_buffer = {
        "Loamy": 0.9,
        "Clay": 1.1,
        "Sandy": 1.2,
    }

    crop_factor = crop_sensitivity.get(crop, {"heat": 1.0, "drought": 1.0})
    soil_factor = soil_buffer.get(soil_type, 1.0)

    adjusted_score = risk_score * soil_factor * (
        (crop_factor["heat"] + crop_factor["drought"]) / 2
    )

    if adjusted_score >= 2.5:
        return "High"
    elif adjusted_score >= 1.5:
        return "Medium"
    else:
        return "Low"


# ---------------- API ENDPOINT ----------------
@app.post("/predict")
def predict_crop_risk(data: PredictionInput):

    # Latest climate snapshot (MVP)
    row = climate_df.iloc[-1]

    features = pd.DataFrame([{
        "heat_stress": row["heat_stress"],
        "drought_stress": row["drought_stress"],
        "flood_stress": row["flood_stress"],
        "max_temp_anomaly": row["max_temp_anomaly"],
        "rainfall_anomaly": row["rainfall_anomaly"],
        "dry_spell_len": row["dry_spell_len"],
        "avg_temp_7d": row["avg_temp_7d"],
        "GWETPROF": row["GWETPROF"],
        "GWETTOP": row["GWETTOP"]
    }])

    features_scaled = scaler.transform(features)

    prediction = model.predict(features_scaled)
    base_risk = label_encoder.inverse_transform(prediction)[0]

    final_risk = adjust_risk_by_crop_and_soil(
        base_risk,
        data.crop,
        data.soil_type
    )

    climate_context = (
        f"Heat stress index: {row['heat_stress']:.2f}, "
        f"Drought stress index: {row['drought_stress']:.2f}, "
        f"Flood stress index: {row['flood_stress']:.2f}"
    )

    ai_advisory = generate_crop_advisory(
        crop=data.crop,
        soil_type=data.soil_type,
        base_risk=base_risk,
        final_risk=final_risk,
        climate_context=climate_context
    )

    explanation = {
        "Low": "Climate conditions are within safe limits for this crop.",
        "Medium": "Moderate climate stress detected. Preventive measures recommended.",
        "High": "Severe climate stress likely to impact this crop."
    }

    return {
        "crop": data.crop,
        "climate_stress": base_risk,
        "crop_risk": final_risk,
        "explanation": explanation[final_risk],
        "advisory": ai_advisory
    }
