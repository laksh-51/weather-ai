# SanchAI Weather Analytics – Tech Assessment

A production-ready web application featuring a React frontend and a FastAPI backend. The application uses a LangChain agent powered by OpenRouter to fetch real-time weather data via a custom tool.

## 🚀 Features
- **Natural Language Querying**: Ask for weather in any city (e.g., "What's the weather in Pune?").
- **AI Agent logic**: Uses a ReAct agent to decide when to fetch live data.
- **Real-time Data**: Integrated with OpenWeatherMap API.
- **Modern Stack**: FastAPI, React (Vite), and LangChain.

## 🛠️ Tech Stack
- **Frontend**: React, Axios, CSS3
- **Backend**: FastAPI, LangChain, Uvicorn
- **LLM**: Gemini-1.5-Flash (via OpenRouter)
- **Weather Data**: OpenWeatherMap API

## ⚙️ Setup & Installation

### Prerequisites
- Python 3.9+
- Node.js 18+
- API Keys for [OpenRouter](https://openrouter.ai/) and [OpenWeatherMap](https://openweathermap.org/)

### 1. Backend Setup
1. Navigate to the backend folder: `cd backend`
2. Create a virtual environment: `python -m venv venv`
3. Activate venv: `.\venv\Scripts\activate` (Windows)
4. Install dependencies: `pip install -r requirements.txt`
5. Create a `.env` file with your keys:
   ```env
   OPENROUTER_API_KEY=your_key_here
   OPENWEATHER_API_KEY=your_key_here