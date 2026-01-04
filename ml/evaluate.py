import pandas as pd
import joblib

# Paths
DATA_PATH = "data/processed/climate_with_anomalies.csv"
MODEL_PATH = "models/climate_risk_model.pkl"

def show_feature_importance():
    df = pd.read_csv(DATA_PATH)

    feature_cols = [
        "max_temp_anomaly",
        "min_temp_anomaly",
        "rainfall_anomaly",
        "dew_point_anomaly",
        "wind_speed_anomaly",
        "avg_temp_7d",
        "dry_spell_len",
        "GWETPROF",
        "GWETTOP"
    ]

    model = joblib.load(MODEL_PATH)

    importance = pd.Series(
        model.feature_importances_,
        index=feature_cols
    ).sort_values(ascending=False)

    print("\nClimate Feature Importance:")
    print(importance)

if __name__ == "__main__":
    show_feature_importance()
