import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Thermometer, Cloud, Droplets, Wind } from 'lucide-react';

function getAqiColor(aqi) {
  if (aqi <= 50) return "#009966";        // Good (Green)
  if (aqi <= 100) return "#FFDE33";       // Moderate (Yellow)
  if (aqi <= 150) return "#FF9933";       // Unhealthy for sensitive groups (Orange)
  if (aqi <= 200) return "#CC0033";       // Unhealthy (Red)
  if (aqi <= 300) return "#660099";       // Very Unhealthy (Purple)
  return "#7E0023";                        // Hazardous (Maroon)
}

function App() {
  const [input, setInput] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSend = async () => {
  if (!input.trim()) return;

  setLoading(true);
  setError(null);
  setWeatherData(null);

  try {
    const response = await fetch('http://localhost:8000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: input })
    });

    if (!response.ok) throw new Error('Service unavailable');

    const data = await response.json();

    // ✅ STRICT CHECK
    if (!data.weatherData) {
      setError(data.response || 'Only weather-related queries are supported.');
      return;
    }

    // ✅ SET STATE ONCE
    setWeatherData(data.weatherData);

    // ✅ Correct logging
    console.log(data.weatherData.location);

  } catch (err) {
    console.error(err);
    setError('Unable to fetch weather data. Please try again.');
  } finally {
    setLoading(false);
  }
};


  const handleReset = () => {
    setInput('');
    setWeatherData(null);
    setError(null);
  };

  return (
    <div style={styles.container}>
      <AnimatePresence mode="wait">
        {!weatherData && !error ? (
          <motion.div
            key="input-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={styles.inputView}
          >
            <header style={styles.header}>
              <motion.h1 
                style={styles.title}
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                SanchAI Weather
              </motion.h1>
              <motion.p 
                style={styles.tagline}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Intelligent climate insights, powered by AI
              </motion.p>
            </header>

            <motion.div 
              style={styles.searchCard}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <input 
                style={styles.inputField}
                value={input} 
                onChange={(e) => setInput(e.target.value)} 
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Search weather (e.g., 'Weather in Pune?')"
                disabled={loading}
              />
              <motion.button 
                onClick={handleSend} 
                disabled={loading || !input.trim()}
                style={{
                  ...styles.sendBtn,
                  opacity: (loading || !input.trim()) ? 0.5 : 1,
                  cursor: (loading || !input.trim()) ? 'not-allowed' : 'pointer'
                }}
                whileHover={{ scale: (loading || !input.trim()) ? 1 : 1.05 }}
                whileTap={{ scale: (loading || !input.trim()) ? 1 : 0.95 }}
              >
                {loading ? 'Fetching...' : 'Get Weather'}
              </motion.button>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="results-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={styles.resultsView}
          >
            <motion.button
              onClick={handleReset}
              style={styles.backBtn}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              ← New Search
            </motion.button>

            {error ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={styles.errorCard}
              >
                <h3 style={styles.errorTitle}>⚠️ Error</h3>
                <p style={styles.errorText}>{error}</p>
              </motion.div>
            ) : (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  style={styles.summaryCard}
                >
                  <h2 style={styles.summaryTitle}>{weatherData?.location}</h2>
                  <p style={styles.summaryText}>{weatherData?.summary}</p>
                </motion.div>

                <div style={styles.cardsGrid}>
                  <WeatherCard
                    icon={<Thermometer size={32} />}
                    label="Temperature"
                    value={weatherData?.temperature}
                    delay={0.2}
                    color="#ef4444"
                  />
                  <WeatherCard
                    icon={<Cloud size={32} />}
                    label="Rainfall"
                    value={weatherData?.rainfall}
                    delay={0.3}
                    color="#3b82f6"
                  />
                  <WeatherCard
                    icon={<Droplets size={32} />}
                    label="Humidity"
                    value={weatherData?.humidity}
                    delay={0.4}
                    color="#06b6d4"
                  />
                  <WeatherCard
                    icon={<Wind size={32} />}
                    label="AQI"
                    value={weatherData?.aqi}
                    delay={0.5}
                    color={getAqiColor(parseInt(weatherData?.aqi))}

                  />
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function WeatherCard({ icon, label, value, delay, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.4, type: 'spring', stiffness: 100 }}
      whileHover={{ scale: 1.05, y: -5,transition: { type: 'spring', stiffness: 300, damping: 15 } }}
      style={styles.weatherCard}
    >
      <motion.div
        style={{ ...styles.iconWrapper, color }}
        initial={{ rotate: -10, scale: 0 }}
        animate={{ rotate: 0, scale: 1 }}
        transition={{ delay: delay + 0.2, type: 'spring' }}
      >
        {icon}
      </motion.div>
      <motion.h3
        style={styles.cardLabel}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: delay + 0.3 }}
      >
        {label}
      </motion.h3>
      <motion.p
        style={styles.cardValue}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: delay + 0.4 }}
      >
        {value}
      </motion.p>
    </motion.div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: '20px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  inputView: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    maxWidth: '600px'
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px'
  },
  title: {
    fontSize: '3rem',
    color: '#ffffff',
    margin: '0 0 10px 0',
    fontWeight: '800',
    textShadow: '0 2px 10px rgba(0,0,0,0.2)'
  },
  tagline: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: '1.1rem',
    margin: 0
  },
  searchCard: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    borderRadius: '20px',
    padding: '40px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  inputField: {
    width: '100%',
    padding: '16px 20px',
    fontSize: '1.1rem',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    outline: 'none',
    transition: 'border-color 0.3s',
    boxSizing: 'border-box'
  },
  sendBtn: {
    padding: '16px 32px',
    backgroundColor: '#667eea',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '1.1rem',
    fontWeight: '600',
    transition: 'all 0.3s',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
  },
  resultsView: {
    width: '100%',
    maxWidth: '1000px',
    display: 'flex',
    flexDirection: 'column',
    gap: '30px'
  },
  backBtn: {
    alignSelf: 'flex-start',
    padding: '12px 24px',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(10px)',
    color: '#fff',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '10px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s'
  },
  summaryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    borderRadius: '20px',
    padding: '30px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
    border: '1px solid rgba(255, 255, 255, 0.3)'
  },
  summaryTitle: {
    fontSize: '2rem',
    color: '#1f2937',
    margin: '0 0 15px 0',
    fontWeight: '700'
  },
  summaryText: {
    fontSize: '1.1rem',
    color: '#4b5563',
    margin: 0,
    lineHeight: '1.6'
  },
  cardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '20px'
  },
  weatherCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    borderRadius: '20px',
    padding: '30px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '15px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    transition: 'all 0.3s',
    cursor: 'pointer'
  },
  iconWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  cardLabel: {
    fontSize: '0.95rem',
    color: '#6b7280',
    margin: 0,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  cardValue: {
    fontSize: '2rem',
    color: '#1f2937',
    margin: 0,
    fontWeight: '700'
  },
  errorCard: {
    backgroundColor: 'rgba(254, 226, 226, 0.95)',
    backdropFilter: 'blur(10px)',
    borderRadius: '20px',
    padding: '30px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
    border: '1px solid rgba(239, 68, 68, 0.3)'
  },
  errorTitle: {
    fontSize: '1.5rem',
    color: '#991b1b',
    margin: '0 0 15px 0',
    fontWeight: '700'
  },
  errorText: {
    fontSize: '1.1rem',
    color: '#7f1d1d',
    margin: 0,
    lineHeight: '1.6'
  }
};

export default App;