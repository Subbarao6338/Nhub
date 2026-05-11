import React, { useState, useEffect } from 'react';

const PrivacySecurityTools = ({ toolId, onResultChange }) => {
  const [activeTab, setActiveTab] = useState('password-gen');

  useEffect(() => {
    if (toolId) {
      const mapping = {
        'password-gen': 'password-gen',
        'hash-gen': 'hash',
        'rsa-gen': 'rsa',
        'hmac-calc': 'hmac',
        'security-info': 'info',
        'privacy-audit': 'audit',
        'password-strength': 'strength',
        'data-anonymizer': 'anonymizer'
      };
      if (mapping[toolId]) setActiveTab(mapping[toolId]);
    }
  }, [toolId]);

  const tabs = [
    { id: 'password-gen', label: 'Password Gen' },
    { id: 'hash', label: 'Hash Gen' },
    { id: 'rsa', label: 'RSA Key Gen' },
    { id: 'hmac', label: 'HMAC Calc' },
    { id: 'info', label: 'Security Info' },
    { id: 'audit', label: 'Privacy Audit' },
    { id: 'strength', label: 'Strength' },
    { id: 'anonymizer', label: 'Anonymizer' }
  ].sort((a, b) => a.label.localeCompare(b.label));

  return (
    <div className="tool-form">
      <div className="pill-group mb-20 scrollable-x">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`pill ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'password-gen' && <PasswordGen onResultChange={onResultChange} />}
      {activeTab === 'hash' && <HashGen onResultChange={onResultChange} />}
      {activeTab === 'rsa' && <RsaGen />}
      {activeTab === 'hmac' && <HmacCalc />}
      {['info', 'audit', 'strength', 'anonymizer'].includes(activeTab) && (
          <div className="text-center p-20 card opacity-6">
              <span className="material-icons mb-10" style={{fontSize: '2rem'}}>security</span>
              <div>This security tool is being integrated.</div>
          </div>
      )}
    </div>
  );
};

const PasswordGen = ({ onResultChange }) => {
    const [len, setLen] = useState(16);
    const [pass, setPass] = useState('');
    const gen = () => {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";
        let res = "";
        for(let i=0; i<len; i++) res += chars.charAt(Math.floor(Math.random()*chars.length));
        setPass(res);
        onResultChange({ text: res, filename: 'password.txt' });
    };
    return (
        <div className="card p-20 text-center">
            <div className="flex-center gap-15 mb-20">
                <label>Length: {len}</label>
                <input type="range" min="8" max="64" value={len} onChange={e=>setLen(e.target.value)} />
            </div>
            <div className="tool-result mb-20 font-mono" style={{wordBreak: 'break-all'}}>{pass || '---'}</div>
            <button className="btn-primary w-full" onClick={gen}>Generate Password</button>
        </div>
    );
};

const HashGen = ({ onResultChange }) => {
  const [input, setInput] = useState('');
  const [res, setRes] = useState('');
  const hash = async () => {
    const msg = new TextEncoder().encode(input);
    const buf = await crypto.subtle.digest('SHA-256', msg);
    const hex = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
    setRes(hex);
    onResultChange({ text: hex, filename: 'hash.txt' });
  };
  return (
    <div className="card p-15 grid gap-10">
      <textarea className="pill font-mono" rows="3" placeholder="Input..." value={input} onChange={e=>setInput(e.target.value)} />
      <button className="btn-primary" onClick={hash}>SHA-256 Hash</button>
      {res && <div className="tool-result font-mono text-xs break-all">{res}</div>}
    </div>
  );
};

const RsaGen = () => (
    <div className="text-center p-20 opacity-6">RSA generation requires complex async logic. Use the dedicated RSA tool.</div>
);

const HmacCalc = () => (
    <div className="text-center p-20 opacity-6">HMAC calculation is being integrated.</div>
);

export default PrivacySecurityTools;
