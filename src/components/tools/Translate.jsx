import React, { useState, useEffect } from 'react';

const Translate = ({ onResultChange }) => {
  const [input, setInput] = useState('');
  const [from, setFrom] = useState('en');
  const [to, setTo] = useState('te');
  const [result, setResult] = useState('');

  // Local dictionary for offline translation (common phrases and words)
  const dictionary = {
    'en-te': {
      'hello': 'నమస్కారం (Namaskaram)',
      'world': 'ప్రపంచం (Prapancham)',
      'nature': 'ప్రకృతి (Prakruthi)',
      'water': 'నీరు (Neeru)',
      'earth': 'భూమి (Bhumi)',
      'sky': 'ఆకాశం (Akasham)',
      'friend': 'స్నేహితుడు (Snehitudu)',
      'thank you': 'ధన్యవాదాలు (Dhanyavadalu)',
      'good morning': 'శుభోదయం (Shubhodayam)',
      'how are you?': 'మీరు ఎలా ఉన్నారు? (Meeru ela unnaru?)',
      'i love nature': 'నాకు ప్రకృతి అంటే ఇష్టం (Naaku prakruthi ante ishtam)',
      'where is': 'ఎక్కడ ఉంది (Ekkada undi)',
      'food': 'ఆహారం (Aharam)',
      'tree': 'చెట్టు (Chettu)',
      'sun': 'సూర్యుడు (Suryudu)',
      'moon': 'చంద్రుడు (Chandrudu)',
    },
    'te-en': {
      'నమస్కారం': 'Hello',
      'ధన్యవాదాలు': 'Thank you',
      'ప్రకృతి': 'Nature',
      'నీరు': 'Water',
      'ఆహారం': 'Food',
    }
    // Expandable for other pairs
  };

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

  const handleTranslate = () => {
    if (!input.trim()) return;

    const pair = `${from}-${to}`;
    const text = input.toLowerCase().trim();

    if (dictionary[pair] && dictionary[pair][text]) {
      setResult(dictionary[pair][text]);
    } else {
      // Fallback for offline mode when word is not in dictionary
      setResult(`[Offline] No local translation for "${input}". In a real app, this would use a local WASM model like MarianMT or a larger embedded dictionary.`);
    }
  };

  return (
    <div className="tool-form">
      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', alignItems: 'center' }}>
        <select
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--on-surface)' }}
        >
          <option value="en">English</option>
          <option value="te">Telugu</option>
        </select>
        <span className="material-icons" style={{ opacity: 0.5 }}>sync_alt</span>
        <select
          value={to}
          onChange={(e) => setTo(e.target.value)}
          style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--on-surface)' }}
        >
          <option value="te">Telugu</option>
          <option value="en">English</option>
        </select>
      </div>
      <textarea
        rows="5"
        placeholder="Enter word or phrase (e.g. 'nature', 'hello')..."
        style={{ width: '100%', marginBottom: '15px', padding: '12px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--on-surface)' }}
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button className="btn-primary" style={{ width: '100%' }} onClick={handleTranslate}>
        Local Translate
      </button>
      <div style={{ fontSize: '0.75rem', opacity: 0.5, marginTop: '8px', textAlign: 'center' }}>
        <span className="material-icons" style={{ fontSize: '0.9rem', verticalAlign: 'middle' }}>wifi_off</span> Fully Offline Local Dictionary
      </div>
      {result && (
        <div className="tool-result" style={{ marginTop: '1.5rem' }}>
          <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.6, marginBottom: '8px' }}>
            Translation Result
          </div>
          <div style={{ fontSize: '1.1rem', lineHeight: '1.5' }}>
            {result}
          </div>
        </div>
      )}
    </div>
  );
};

export default Translate;
