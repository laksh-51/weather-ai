# SanchAI Weather Analytics

An intelligent, safety-first weather application featuring a **React (Vite)** frontend and a **FastAPI** backend. The app uses a specialized **LangChain** agent powered by **OpenRouter** to provide real-time weather and Air Quality Index (AQI) data.

---

## 🚀 Key Features

- **Strict Weather Focus**: The AI specializes only in climate-related queries and politely refuses off-topic requests.  
- **Real-time AQI Integration**: Fetches pollution data and converts it to standardized US AQI levels (0–500) for easy understanding.  
- **Modern UI**: Animated glassmorphism interface built with **Framer Motion** and **Lucide Icons**, featuring a serene atmospheric background.  
- **Detailed Insights**: Provides precise temperature, rainfall (last 1h), humidity, and location summaries.  

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Framer Motion, Lucide-React, Axios  
- **Backend**: FastAPI, LangChain, OpenRouter (Gemini-1.5-Flash), OpenWeatherMap API  

---

## ⚙️ Setup & Installation

### 1. Backend Setup

1. Navigate to the backend folder:
   ```bash
   cd backend

2. Create a virtual environment and activate it:

python -m venv venv
# macOS/Linux
source venv/bin/activate
# Windows
venv\Scripts\activate

3. Install required Python packages:

pip install -r requirements.txt

4. Create a .env file in the backend folder with your API keys:

Create a .env file in the backend folder with your API keys:



### 2. Frontend Setup

1. Navigate to the frontend folder:

cd frontend


2. Install Node.js dependencies:

npm install


3. Start the development server:

npm run dev


