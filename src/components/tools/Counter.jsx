import React, { useState, useEffect } from 'react';

const Counter = ({ onResultChange }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    onResultChange({
      text: `Counter value: ${count}`,
      filename: 'counter.txt'
    });
  }, [count, onResultChange]);

  return (
    <div className="tool-form" style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '5rem', fontWeight: 'bold', margin: '20px 0', color: 'var(--primary)' }}>
        {count}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        <button className="pill" onClick={() => setCount(count - 1)} style={{ fontSize: '1.5rem', padding: '15px' }}>-</button>
        <button className="pill" onClick={() => setCount(count + 1)} style={{ fontSize: '1.5rem', padding: '15px' }}>+</button>
      </div>

      <button className="pill" onClick={() => setCount(0)} style={{ width: '100%', marginTop: '15px', color: 'var(--danger)' }}>
        Reset
      </button>
    </div>
  );
};

export default Counter;
