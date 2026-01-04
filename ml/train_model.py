import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report

# ---------------- PATHS ----------------
DATA_PATH = "data/processed/climate_with_stress_features.csv"
MODEL_PATH = "models/crop_risk_model.pkl"
ENCODER_PATH = "models/crop_risk_label_encoder.pkl"
SCALER_PATH = "models/feature_scaler.pkl"

# ---------------- LOAD DATA ----------------
df = pd.read_csv(DATA_PATH)

# ---------------- FEATURE SELECTION ----------------
FEATURES = [
    # Stress features (core intelligence)
    "heat_stress",
    "drought_stress",
    "flood_stress",

    # Supporting climate context
    "max_temp_anomaly",
    "rainfall_anomaly",
    "dry_spell_len",
    "avg_temp_7d",
    "GWETPROF",
    "GWETTOP"
]

TARGET = "crop_risk"

X = df[FEATURES]
y = df[TARGET]

# ---------------- ENCODE TARGET ----------------
label_encoder = LabelEncoder()
y_encoded = label_encoder.fit_transform(y)

# ---------------- TRAIN / TEST SPLIT ----------------
X_train, X_test, y_train, y_test = train_test_split(
    X, y_encoded,
    test_size=0.2,
    random_state=42,
    stratify=y_encoded
)

# ---------------- FEATURE SCALING ----------------
# (Important because heat_stress dominates numerically)
scaler = StandardScaler()

X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# ---------------- MODEL ----------------
model = RandomForestClassifier(
    n_estimators=300,
    max_depth=12,
    random_state=42,
    class_weight="balanced"
)

model.fit(X_train_scaled, y_train)

# ---------------- EVALUATION ----------------
y_pred = model.predict(X_test_scaled)

accuracy = accuracy_score(y_test, y_pred)

print("\n✅ Model Training Completed")
print("Accuracy:", round(accuracy * 100, 2), "%\n")

print("Classification Report:")
print(classification_report(
    y_test,
    y_pred,
    target_names=label_encoder.classes_
))

# ---------------- SAVE ARTIFACTS ----------------
joblib.dump(model, MODEL_PATH)
joblib.dump(label_encoder, ENCODER_PATH)
joblib.dump(scaler, SCALER_PATH)

print("\n💾 Model, encoder, and scaler saved successfully!")
