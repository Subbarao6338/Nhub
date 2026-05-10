import React, { useState } from 'react';

const DataAnonymizer = ({ onResultChange }) => {
  const [activeTab, setActiveTab] = useState('masking');
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState('');

  const piiRules = [
    { name: 'Emails', regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, replacement: '[EMAIL_MASKED]' },
    { name: 'Phone Numbers', regex: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, replacement: '[PHONE_MASKED]' },
    { name: 'IP Addresses', regex: /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, replacement: '[IP_MASKED]' },
    { name: 'Credit Cards', regex: /\b(?:\d[ -]*?){13,16}\b/g, replacement: '[CARD_MASKED]' },
    { name: 'SSN', regex: /\b\d{3}-\d{2}-\d{4}\b/g, replacement: '[SSN_MASKED]' }
  ];

  const anonymize = () => {
    if (!input.trim()) return;
    setIsProcessing(true);

    setTimeout(() => {
      let masked = input;
      piiRules.forEach(rule => {
        masked = masked.replace(rule.regex, rule.replacement);
      });
      setResult(masked);
      setIsProcessing(false);
      onResultChange({ text: masked, filename: 'anonymized_data.txt' });
    }, 600);
  };

  return (
    <div className="tool-form">
      <div className="pill-group mb-20">
        <button className={`pill ${activeTab === 'masking' ? 'active' : ''}`} onClick={() => setActiveTab('masking')}>PII Masking</button>
        <button className={`pill ${activeTab === 'info' ? 'active' : ''}`} onClick={() => setActiveTab('info')}>Rules Info</button>
      </div>

      {activeTab === 'masking' && (
        <div className="grid gap-15">
          <textarea
            className="pill w-full font-mono"
            rows="10"
            placeholder="Paste data containing emails, phones, IPs, etc..."
            value={input}
            onChange={e => setInput(e.target.value)}
          />
          <button className="btn-primary" onClick={anonymize} disabled={isProcessing}>
            {isProcessing ? 'Anonymizing...' : 'Mask PII Locally'}
          </button>
          {result && (
            <div className="tool-result">
              <div className="font-bold mb-10">Anonymized Result:</div>
              <pre className="font-mono" style={{ fontSize: '0.85rem', whiteSpace: 'pre-wrap' }}>{result}</pre>
            </div>
          )}
        </div>
      )}

      {activeTab === 'info' && (
        <div className="grid gap-10">
          {piiRules.map(rule => (
            <div key={rule.name} className="card p-15 flex-between">
              <span className="font-bold">{rule.name}</span>
              <code className="opacity-6" style={{ fontSize: '0.75rem' }}>{rule.replacement}</code>
            </div>
          ))}
          <p className="opacity-5 text-center mt-10" style={{ fontSize: '0.8rem' }}>
            All processing happens strictly in your browser. No data is sent to any server.
          </p>
        </div>
      )}
    </div>
  );
};

export default DataAnonymizer;
