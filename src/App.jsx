import React, { useState, useEffect } from 'react';

    function App() {
      const [messages, setMessages] = useState([]);
      const [input, setInput] = useState('');
      const [apiKey, setApiKey] = useState('');
      const [loading, setLoading] = useState(false);
      const [bangkokDateTime, setBangkokDateTime] = useState('');

      useEffect(() => {
        const updateTime = () => {
          const now = new Date();
          const bangkokFormatter = new Intl.DateTimeFormat('en-US', {
            timeZone: 'Asia/Bangkok',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
          });
          setBangkokDateTime(bangkokFormatter.format(now));
        };

        updateTime();
        const intervalId = setInterval(updateTime, 1000);

        return () => clearInterval(intervalId);
      }, []);

      const formatText = (text) => {
        let formattedText = text;
        // Replace **bold** with <strong>bold</strong>
        formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // Replace *italic* with <em>italic</em>
        formattedText = formattedText.replace(/\*(.*?)\*/g, '<em>$1</em>');
        return formattedText;
      };

      const sendMessage = async () => {
        if (!input.trim()) return;

        setMessages([...messages, { text: input, sender: 'user' }]);
        setInput('');
        setLoading(true);

        if (!apiKey.trim()) {
          setMessages(prevMessages => [...prevMessages, { text: 'Please provide a valid Gemini API key.', sender: 'ai' }]);
          setLoading(false);
          return;
        }

        try {
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                contents: [{ parts: [{ text: input }] }],
              }),
            },
          );

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          let aiResponse = data.candidates[0].content.parts[0].text;
          setMessages(prevMessages => [...prevMessages, { text: aiResponse, sender: 'ai', formatted: formatText(aiResponse) }]);
        } catch (error) {
          console.error('Error fetching Gemini API:', error);
          setMessages(prevMessages => [...prevMessages, { text: 'Error fetching response', sender: 'ai' }]);
        } finally {
          setLoading(false);
        }
      };

      return (
        <div className="chat-container">
          <label htmlFor="api-key-input" style={{ display: 'block', marginBottom: '5px', textAlign: 'left' }}>
            Gemini API Key:
          </label>
          <input
            type="text"
            id="api-key-input"
            className="chat-input"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your Gemini API key"
            style={{ marginBottom: '10px' }}
          />
          <div className="chat-output">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`message ${message.sender === 'user' ? 'user-message' : 'ai-message'}`}
                dangerouslySetInnerHTML={{ __html: message.formatted || message.text }}
              />
            ))}
            {loading && <div className="loading-message">Loading...</div>}
          </div>
          <div className="chat-input-area">
            <input
              type="text"
              className="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  sendMessage();
                }
              }}
              placeholder="Type your message..."
            />
            <button className="chat-button" onClick={sendMessage}>
              Send
            </button>
          </div>
          <div className="time-info">
            <br />
            {bangkokDateTime}
          </div>
        </div>
      );
    }

    export default App;
