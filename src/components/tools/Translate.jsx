import React, { useState, useEffect } from 'react';

const Translate = ({ onResultChange }) => {
  const [input, setInput] = useState('');
  const [from, setFrom] = useState('en');
  const [to, setTo] = useState('te');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (result) {
      onResultChange({
        text: result,
        filename: 'translation.txt'
      });
    } else {
      onResultChange(null);
    }
  }, [result, onResultChange]);

  const mockTranslate = () => {
    if (!input.trim()) return;
    setLoading(true);
    setResult('');

    // Using MyMemory API (Free, no key required for basic usage)
    fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(input)}&langpair=${from}|${to}`)
      .then(res => res.json())
      .then(data => {
        if (data.responseData && data.responseData.translatedText) {
          setResult(data.responseData.translatedText);
        } else {
          setResult("Translation failed. Please try again.");
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Translation API error:", err);
        setResult("Offline: Translation API unavailable.");
        setLoading(false);
      });
  };

  return (
    <div className="tool-form">
      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', alignItems: 'center' }}>
        <select
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid rgba(var(--primary-rgb), 0.2)' }}
        >
          <option value="en">English</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
          <option value="de">German</option>
          <option value="it">Italian</option>
          <option value="te">Telugu</option>
          <option value="hi">Hindi</option>
        </select>
        <span className="material-icons" style={{ opacity: 0.5 }}>sync_alt</span>
        <select
          value={to}
          onChange={(e) => setTo(e.target.value)}
          style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid rgba(var(--primary-rgb), 0.2)' }}
        >
          <option value="te">Telugu</option>
          <option value="en">English</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
          <option value="de">German</option>
          <option value="it">Italian</option>
          <option value="hi">Hindi</option>
        </select>
      </div>
      <textarea
        rows="5"
        placeholder="Enter text to translate..."
        style={{ width: '100%', marginBottom: '15px' }}
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button className="btn-primary" style={{ width: '100%' }} onClick={mockTranslate}>
        Translate
      </button>
      {(loading || result) && (
        <div className="tool-result" style={{ marginTop: '1.5rem', background: 'rgba(var(--primary-rgb), 0.05)' }}>
          <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.6, marginBottom: '8px' }}>
            Translation Result
          </div>
          <div style={{ fontSize: '1.1rem', lineHeight: '1.5' }}>
            {loading ? <i>Translating...</i> : result}
          </div>
        </div>
      )}
    </div>
  );
};

export default Translate;
