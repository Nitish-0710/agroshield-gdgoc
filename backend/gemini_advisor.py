import os
from google import genai
from dotenv import load_dotenv

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))


def generate_crop_advisory(
    crop: str,
    soil_type: str,
    base_risk: str,
    final_risk: str,
    climate_context: str
) -> str:
    """
    Generate farmer-friendly advisory using Gemini
    """

    prompt = f"""
You are an agricultural expert helping Indian farmers.

Crop: {crop}
Soil type: {soil_type}

Climate risk (weather-based): {base_risk}
Final crop risk (after soil & crop sensitivity): {final_risk}

Climate details:
{climate_context}

Give a short, practical advisory.
Use simple language.
Mention irrigation, fertilizer, or protection steps.
Do NOT use technical jargon.
"""

    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=prompt
    )

    return response.text.strip()
