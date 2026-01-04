import pandas as pd
import numpy as np

# ---------------- PATHS ----------------
RAW_30YR_PATH = "data/raw/nasa_pune_30yr_expanded.csv"
PROCESSED_30YR_PATH = "data/processed/climate_with_stress_features.csv"

# ---------------- CONFIG ----------------

# Crop growing season length (FACTUAL, not tolerance)
CROP_SEASON_LENGTH = {
    "Wheat": 120,
    "Rice": 150,
    "Maize": 100
}

# ---------------- HELPER FUNCTIONS ----------------

def assign_climate_risk_from_stress(row):
    """
    Final risk label based on combined stress indices.
    This is still rule-based labeling for supervised learning.
    """

    stress_score = (
        row["heat_stress"] +
        row["drought_stress"] +
        row["flood_stress"]
    )

    if stress_score >= 2.5:
        return "High"
    elif stress_score >= 1.2:
        return "Medium"
    else:
        return "Low"


def compute_heat_stress(row):
    """
    Heat stress derived from:
    - temperature anomaly
    - persistence (7-day avg)
    - normalized using historical extremes
    """

    if row["max_temp_anomaly"] <= 0:
        return 0.0

    return round(
        (row["max_temp_anomaly"] * row["avg_temp_7d"]) /
        row["heat_norm"],
        3
    )


def compute_drought_stress(row):
    """
    Drought stress derived from:
    - rainfall deficit
    - dry spell persistence
    - soil moisture proxy (GWETPROF)
    """

    if row["rainfall_anomaly"] >= 0:
        return 0.0

    soil_dryness = 1 - row["GWETPROF"]  # fully data-driven

    return round(
        (abs(row["rainfall_anomaly"]) *
         row["dry_spell_len"] *
         soil_dryness) /
        row["drought_norm"],
        3
    )


def compute_flood_stress(row):
    """
    Flood stress derived from:
    - excess rainfall
    - surface wetness (GWETTOP)
    """

    if row["rainfall_anomaly"] <= 0:
        return 0.0

    return round(
        (row["rainfall_anomaly"] * row["GWETTOP"]) /
        row["flood_norm"],
        3
    )


# ---------------- MAIN PIPELINE ----------------

def compute_climate_stress_features():

    # -------- LOAD DATA --------
    df = pd.read_csv(RAW_30YR_PATH)

    # -------- DATE HANDLING --------
    df["date"] = pd.to_datetime(
        df["YEAR"].astype(str), format="%Y"
    ) + pd.to_timedelta(df["DOY"] - 1, unit="D")

    df["month"] = df["date"].dt.month
    df["month_day"] = df["date"].dt.strftime("%m-%d")

    # -------- CLIMATE NORMALS --------
    climate_vars = [
        "T2M_MAX", "T2M_MIN",
        "PRECTOTCORR", "T2MDEW", "WS2M"
    ]

    normals = (
        df.groupby("month_day")[climate_vars]
        .mean()
        .reset_index()
    )

    normals.columns = [
        "month_day",
        "normal_max_temp",
        "normal_min_temp",
        "normal_rainfall",
        "normal_dew_point",
        "normal_wind_speed"
    ]

    df = df.merge(normals, on="month_day", how="left")

    # -------- ANOMALIES --------
    df["max_temp_anomaly"] = df["T2M_MAX"] - df["normal_max_temp"]
    df["min_temp_anomaly"] = df["T2M_MIN"] - df["normal_min_temp"]
    df["rainfall_anomaly"] = df["PRECTOTCORR"] - df["normal_rainfall"]
    df["dew_point_anomaly"] = df["T2MDEW"] - df["normal_dew_point"]
    df["wind_speed_anomaly"] = df["WS2M"] - df["normal_wind_speed"]

    # -------- TEMPORAL FEATURES --------
    df = df.sort_values("date").reset_index(drop=True)

    dry = (df["PRECTOTCORR"] < 1).astype(int)
    df["dry_spell_len"] = dry.groupby(
        (dry != dry.shift()).cumsum()
    ).cumcount() + 1

    df["avg_temp_7d"] = df["T2M_MAX"].rolling(7).mean().bfill()

    # -------- NORMALIZATION CONSTANTS (DATA-DRIVEN) --------
    df["heat_norm"] = df["max_temp_anomaly"].quantile(0.95)
    df["drought_norm"] = (
        abs(df["rainfall_anomaly"]) *
        df["dry_spell_len"]
    ).quantile(0.95)
    df["flood_norm"] = (
        df["rainfall_anomaly"] *
        df["GWETTOP"]
    ).quantile(0.95)

    # Avoid division by zero
    df[["heat_norm", "drought_norm", "flood_norm"]] = (
        df[["heat_norm", "drought_norm", "flood_norm"]]
        .replace(0, 1)
    )

    # -------- CROP & SOIL (STATIC FOR TRAINING) --------
    df["crop"] = "Wheat"        # Later dynamic
    df["soil_type"] = "Loamy"   # Later dynamic

    # -------- STRESS FEATURES --------
    df["heat_stress"] = df.apply(compute_heat_stress, axis=1)
    df["drought_stress"] = df.apply(compute_drought_stress, axis=1)
    df["flood_stress"] = df.apply(compute_flood_stress, axis=1)

    # -------- FINAL RISK LABEL --------
    df["crop_risk"] = df.apply(assign_climate_risk_from_stress, axis=1)

    # -------- SAVE --------
    df.to_csv(PROCESSED_30YR_PATH, index=False)

    print("✅ Climate stress preprocessing completed")
    print("Final shape:", df.shape)
    print("Key columns:")
    print([
        "heat_stress",
        "drought_stress",
        "flood_stress",
        "crop_risk"
    ])


# ---------------- RUN ----------------
if __name__ == "__main__":
    compute_climate_stress_features()
    df = pd.read_csv("data/processed/climate_with_stress_features.csv")
    print(df[["heat_stress","drought_stress","flood_stress","crop_risk"]].describe())
