import React, { useState, useEffect } from 'react';

function App() {
  const [slotsTaken, setSlotsTaken] = useState(0);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');

  // Fetch current slot count from Backend
  useEffect(() => {
    fetch('/api/status') // We'll create this route in server.js next
      .then(res => res.json())
      .then(data => setSlotsTaken(data.count));
  }, []);

  const handleApply = async () => {
    const response = await fetch('/api/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
    const result = await response.json();
    setMessage(result.message);
  };

  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <h1>Teacher Holiday Portal</h1>
      <h2>Slots Taken: {slotsTaken} / 5</h2>
      
      {slotsTaken < 5 ? (
        <div>
          <input 
            placeholder="Enter your name" 
            onChange={(e) => setName(e.target.value)} 
          />
          <button onClick={handleApply}>Apply Now</button>
        </div>
      ) : (
        <h3 style={{ color: 'red' }}>System Locked: All slots full!</h3>
      )}
      
      <p>{message}</p>
    </div>
  );
}

export default App;