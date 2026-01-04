// frontend/src/lib/api.ts

export type AgroShieldPredictionInput = {
  location: string;
  crop: string;
  soil_type: string;
};


export type AgroShieldPredictionResponse = {
  crop: string;
  climate_stress: "Low" | "Medium" | "High";
  crop_risk: "Low" | "Medium" | "High";
  explanation: string;
  advisory: string;
};

export async function getAgroShieldPrediction(
  payload: AgroShieldPredictionInput
): Promise<AgroShieldPredictionResponse> {
  const response = await fetch("http://127.0.0.1:8000/predict", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch AgroShield prediction");
  }

  return response.json();
}
