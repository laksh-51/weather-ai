import os
import requests
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

from langchain_openai import ChatOpenAI
from langchain_core.tools import tool
from langchain_core.messages import HumanMessage, SystemMessage

# -------------------- ENV --------------------
load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY")

if not OPENROUTER_API_KEY or not OPENWEATHER_API_KEY:
    raise RuntimeError("Missing API keys")

# -------------------- APP --------------------
app = FastAPI(title="Weather AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

def convert_aqi_to_us(aqi: int) -> int:
    """
    Convert OpenWeather AQI (1–5) to approximate US AQI (0–500)
    """
    mapping = {
        1: 25,    # Good
        2: 75,    # Fair
        3: 125,   # Moderate
        4: 175,   # Poor
        5: 250,   # Very Poor
    }
    return mapping.get(aqi, 0)


# -------------------- WEATHER TOOL --------------------
@tool
def get_weather(city: str) -> dict:
    """
    Fetch current weather and AQI for a given city using OpenWeather APIs.
    """
    weather_url = (
        "https://api.openweathermap.org/data/2.5/weather"
        f"?q={city}&appid={OPENWEATHER_API_KEY}&units=metric"
    )

    weather_res = requests.get(weather_url, timeout=10)

    if weather_res.status_code != 200:
        return {"error": "City not found"}

    data = weather_res.json()

    temp = data["main"]["temp"]
    humidity = data["main"]["humidity"]
    desc = data["weather"][0]["description"]
    rainfall = data.get("rain", {}).get("1h", 0)

    lat = data["coord"]["lat"]
    lon = data["coord"]["lon"]

    # AQI API
    try:
        aqi_url = f"http://api.openweathermap.org/data/2.5/air_pollution?lat={data['coord']['lat']}&lon={data['coord']['lon']}&appid={OPENWEATHER_API_KEY}"
        aqi_res = requests.get(aqi_url, timeout=10).json()
        ow_aqi = aqi_res["list"][0]["main"]["aqi"]  # 1–5 scale
        aqi = convert_aqi_to_us(ow_aqi)             # Convert to US AQI
    except Exception:
        aqi = 0  # fallback if AQI service fails

    return {
        "location": city,
        "summary": f"The current weather in {city} is {temp}°C with {desc}.",
        "temperature": f"{temp}°C",
        "rainfall": f"{rainfall} mm",
        "humidity": f"{humidity}%",
        "aqi": str(aqi),
    }


# -------------------- LLM --------------------
llm = ChatOpenAI(
    model="gpt-4o-mini",
    temperature=0,
    openai_api_key=OPENROUTER_API_KEY,
    openai_api_base="https://openrouter.ai/api/v1",
)

llm_with_tools = llm.bind_tools([get_weather])


# -------------------- SCHEMAS --------------------
class ChatRequest(BaseModel):
    message: str


# -------------------- ENDPOINT --------------------
@app.post("/api/chat")
async def chat(request: ChatRequest):
    try:
        system_prompt = SystemMessage(
            content=(
                "You are a weather assistant. "
                "Only answer weather-related queries. "
                "If not weather-related, refuse."
            )
        )

        messages = [system_prompt, HumanMessage(content=request.message)]
        response = llm_with_tools.invoke(messages)

        # If LLM calls weather tool
        if response.tool_calls:
            tool_call = response.tool_calls[0]
            weather = get_weather.invoke(tool_call["args"])

            if "error" in weather:
                return {"response": weather["error"]}

            # ✅ ALWAYS return structured data
            return {"weatherData": weather}

        # Non-weather query
        return {"response": "I can only help with weather-related questions."}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# -------------------- RUN --------------------
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
