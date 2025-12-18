import os
import requests
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

from langchain_openai import ChatOpenAI
from langchain_core.tools import tool
from langchain_core.messages import HumanMessage

# -------------------- ENV --------------------

load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY")

if not OPENROUTER_API_KEY or not OPENWEATHER_API_KEY:
    raise RuntimeError("Missing OPENROUTER_API_KEY or OPENWEATHER_API_KEY")

# -------------------- APP --------------------

app = FastAPI(title="Weather AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------- WEATHER TOOL --------------------

@tool
def get_weather(city: str) -> str:
    """Get the current weather for a city."""
    url = (
        "https://api.openweathermap.org/data/2.5/weather"
        f"?q={city}&appid={OPENWEATHER_API_KEY}&units=metric"
    )

    try:
        response = requests.get(url, timeout=10)
        if response.status_code != 200:
            return f"I couldn't find weather information for {city}."

        data = response.json()
        temp = data["main"]["temp"]
        desc = data["weather"][0]["description"]

        return f"The temperature in {city} is {temp}°C with {desc}."
    except Exception:
        return "Weather service is currently unavailable."

# -------------------- LLM (OpenRouter) --------------------

llm = ChatOpenAI(
    model="gpt-4o-mini",
    temperature=0,
    openai_api_key=OPENROUTER_API_KEY,
    openai_api_base="https://openrouter.ai/api/v1",
)

# Bind tool to LLM (this is the key part)
llm_with_tools = llm.bind_tools([get_weather])

# -------------------- API SCHEMAS --------------------

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str

# -------------------- ENDPOINT --------------------

@app.post("/api/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    try:
        # Send user message to LLM
        response = llm_with_tools.invoke(
            [HumanMessage(content=request.message)]
        )

        # If LLM called a tool
        if response.tool_calls:
            tool_call = response.tool_calls[0]
            result = get_weather.invoke(tool_call["args"])
            return {"response": result}

        # Otherwise normal text response
        return {"response": response.content}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# -------------------- LOCAL RUN --------------------

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
