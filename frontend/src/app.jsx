import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const { data } = await axios.post('http://localhost:8000/api/chat', { message: input });
      setMessages(prev => [...prev, { role: 'ai', text: data.response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: "Error: Could not connect to backend." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '50px auto', fontFamily: 'Arial' }}>
      <h2>SanchAI Weather Analytics</h2>
      <div style={{ border: '1px solid #ccc', height: '400px', overflowY: 'auto', padding: '20px', marginBottom: '10px' }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ textAlign: msg.role === 'user' ? 'right' : 'left', margin: '10px 0' }}>
            <p style={{ background: msg.role === 'user' ? '#e3f2fd' : '#f5f5f5', display: 'inline-block', padding: '10px', borderRadius: '8px' }}>
              <strong>{msg.role === 'user' ? 'You: ' : 'AI: '}</strong> {msg.text}
            </p>
          </div>
        ))}
        {loading && <p>AI is thinking...</p>}
      </div>
      <div style={{ display: 'flex', gap: '10px' }}>
        <input 
          style={{ flex: 1, padding: '10px' }}
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask about the weather in any city..."
        />
        <button onClick={handleSend} disabled={loading} style={{ padding: '10px 20px', cursor: 'pointer' }}>Send</button>
      </div>
    </div>
  );
}

export default App;