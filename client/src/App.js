import React, { useState, useEffect } from 'react';

function App() {
  const [slotsTaken, setSlotsTaken] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    holidayDate: '',
    reason: ''
  });
  const [message, setMessage] = useState('');

  // Fetch current slot count from Backend
  useEffect(() => {
    fetch('/api/status')
      .then(res => res.json())
      .then(data => setSlotsTaken(data.count))
      .catch(err => console.error("Error fetching status:", err));
  }, []);

  const handleApply = async (e) => {
    e.preventDefault(); // Prevents page refresh
    
    const response = await fetch('/api/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    
    const result = await response.json();
    setMessage(result.message);

    // Refresh count if successful
    if (response.status === 200) {
      const statusRes = await fetch('/api/status');
      const statusData = await statusRes.json();
      setSlotsTaken(statusData.count);
    }
  };

  return (
    <div style={{ textAlign: 'center', padding: '50px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Hoo-liday Portal</h1>
      
      {/* Status Badge */}
      <div style={{ 
        display: 'inline-block', 
        padding: '10px 20px', 
        borderRadius: '20px', 
        backgroundColor: slotsTaken < 5 ? '#e6fffa' : '#fff5f5',
        color: slotsTaken < 5 ? '#2c7a7b' : '#c53030',
        fontWeight: 'bold',
        marginBottom: '20px'
      }}>
        {slotsTaken < 5 ? "● SYSTEM OPEN" : "● SYSTEM CLOSED"}
      </div>

      <h2>Weekly Slots: {slotsTaken} / 5</h2>
      
      <hr style={{ width: '50%', margin: '20px auto' }} />

      {slotsTaken < 5 ? (
        <form onSubmit={handleApply} style={{ display: 'flex', flexDirection: 'column', maxWidth: '300px', margin: '0 auto', gap: '15px' }}>
          <input 
            type="text"
            placeholder="Your Full Name" 
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})} 
            required 
            style={{ padding: '8px' }}
          />
          
          <div style={{ textAlign: 'left' }}>
            <label style={{ fontSize: '12px' }}>Choose Holiday Date:</label>
            <input 
              type="date" 
              value={formData.holidayDate}
              onChange={(e) => setFormData({...formData, holidayDate: e.target.value})} 
              required 
              style={{ width: '100%', padding: '8px' }}
            />
          </div>

          <textarea 
            placeholder="Reasoning for holiday..."
            value={formData.reason}
            onChange={(e) => setFormData({...formData, reason: e.target.value})}
            required
            style={{ padding: '8px', minHeight: '80px' }}
          />

          <button type="submit" style={{ 
            padding: '10px', 
            backgroundColor: '#3182ce', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px',
            cursor: 'pointer' 
          }}>
            Submit Application
          </button>
        </form>
      ) : (
        <div style={{ padding: '20px', border: '2px solid red', borderRadius: '10px', backgroundColor: '#fff5f5' }}>
          <h3 style={{ color: '#c53030', margin: 0 }}>All slots full for this week!</h3>
          <p>Please come back next Monday at 7:00 AM.</p>
        </div>
      )}
      
      {message && (
        <div style={{ 
          marginTop: '20px', 
          padding: '10px', 
          backgroundColor: '#edf2f7', 
          display: 'inline-block',
          borderRadius: '5px' 
        }}>
          {message}
        </div>
      )}
    </div>
  );
}

export default App;