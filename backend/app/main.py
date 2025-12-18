import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# Modern LangChain imports
from langchain_openai import ChatOpenAI
from langchain.agents import create_react_agent, AgentExecutor
from langchain.tools import tool
from langchain import hub
import httpx

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Weather Tool ---
@tool
def get_weather(location: str):
    """Fetch real-time weather for a given city location. Input should be a city name."""
    api_key = os.getenv("OPENWEATHER_API_KEY")
    url = f"https://api.openweathermap.org/data/2.5/weather?q={location}&appid={api_key}&units=metric"
    
    try:
        response = httpx.get(url)
        data = response.json()
        if response.status_code != 200:
            return f"Could not find weather for {location}."
        
        temp = data['main']['temp']
        desc = data['weather'][0]['description']
        return f"The current temperature in {location} is {temp}°C with {desc}."
    except Exception:
        return "Weather service currently unavailable."

# --- Modern Agent Setup ---
llm = ChatOpenAI(
    model_name="google/gemini-flash-1.5",
    openai_api_key=os.getenv("OPENROUTER_API_KEY"),
    base_url="https://openrouter.ai/api/v1",
    temperature=0
)

# Pull a standard ReAct prompt from the LangChain Hub
prompt = hub.pull("hwchase17/react")

tools = [get_weather]

# Create the agent logic
agent = create_react_agent(llm, tools, prompt)

# Create the executor that actually runs the loop
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True, handle_parsing_errors=True)

class ChatRequest(BaseModel):
    message: str

@app.post("/api/chat")
async def chat(request: ChatRequest):
    try:
        # Use invoke instead of run (modern standard)
        result = agent_executor.invoke({"input": request.message})
        return {"response": result["output"]}
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)