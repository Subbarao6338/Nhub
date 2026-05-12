import React, { useState, useEffect } from 'react';

const PrivacySecurityTools = ({ toolId, onResultChange, onSubtoolChange }) => {
  const tabs = [
    { id: 'password-gen', label: 'Password Gen' },
    { id: 'hash', label: 'Hash Gen' },
    { id: 'rsa', label: 'RSA Key Gen' },
    { id: 'hmac', label: 'HMAC Calc' },
    { id: 'info', label: 'Security Info' },
    { id: 'audit', label: 'Privacy Audit' },
    { id: 'strength', label: 'Strength' },
    { id: 'anonymizer', label: 'Anonymizer' },
    { id: 'aes', label: 'AES Encrypt' }
  ].sort((a, b) => a.label.localeCompare(b.label));

  const [activeTab, setActiveTab] = useState('password-gen');

  useEffect(() => {
    const current = tabs.find(t => t.id === activeTab);
    if (current && onSubtoolChange) onSubtoolChange(current.label);
  }, [activeTab]);

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
        'data-anonymizer': 'anonymizer',
        'aes-encrypt': 'aes'
      };
      if (mapping[toolId]) setActiveTab(mapping[toolId]); else if (tabs.length > 0) setActiveTab(tabs[0].id);
    }
  }, [toolId]);

  const isDeepLinked = !!toolId && tabs.some(t => t.id === toolId || toolId.includes(t.id));

  return (
    <div className="tool-form">
      {!isDeepLinked && (
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
      )}

      {activeTab === 'password-gen' && <PasswordGen onResultChange={onResultChange} />}
      {activeTab === 'hash' && <HashGen onResultChange={onResultChange} />}
      {activeTab === 'rsa' && <RsaGen />}
      {activeTab === 'hmac' && <HmacCalc onResultChange={onResultChange} />}
      {activeTab === 'aes' && <AesTool onResultChange={onResultChange} />}
      {activeTab === 'strength' && <PasswordStrength onResultChange={onResultChange} />}
      {activeTab === 'anonymizer' && <DataAnonymizer onResultChange={onResultChange} />}
      {activeTab === 'audit' && <PrivacyAudit />}
      {activeTab === 'info' && <SecurityInfo />}
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

const RsaGen = () => {
    const [keys, setKeys] = useState(null);
    const [loading, setLoading] = useState(false);

    const gen = async () => {
        setLoading(true);
        try {
            const pair = await crypto.subtle.generateKey({
                name: "RSA-OAEP",
                modulusLength: 2048,
                publicExponent: new Uint8Array([1, 0, 1]),
                hash: "SHA-256"
            }, true, ["encrypt", "decrypt"]);

            const pub = await crypto.subtle.exportKey("spki", pair.publicKey);
            const priv = await crypto.subtle.exportKey("pkcs8", pair.privateKey);

            const toPem = (buf, type) => {
                const b64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
                return `-----BEGIN ${type} KEY-----\n${b64.match(/.{1,64}/g).join('\n')}\n-----END ${type} KEY-----`;
            };

            setKeys({ public: toPem(pub, "PUBLIC"), private: toPem(priv, "PRIVATE") });
        } catch(e) { alert("Failed to generate RSA keys"); }
        finally { setLoading(false); }
    };

    return (
        <div className="grid gap-15">
            <button className="btn-primary" onClick={gen} disabled={loading}>{loading ? 'Generating 2048-bit keys...' : 'Generate RSA Key Pair'}</button>
            {keys && (
                <div className="grid gap-10">
                    <textarea className="pill font-mono" rows="5" readOnly value={keys.public} />
                    <textarea className="pill font-mono" rows="5" readOnly value={keys.private} />
                </div>
            )}
        </div>
    );
};

const AesTool = ({ onResultChange }) => {
    const [text, setText] = useState('Secret message');
    const [key, setKey] = useState('secret-key');
    const [res, setRes] = useState('');

    const encrypt = async () => {
        const enc = new TextEncoder();
        const keyMaterial = await crypto.subtle.importKey("raw", enc.encode(key.padEnd(32).slice(0,32)), "AES-GCM", false, ["encrypt"]);
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, keyMaterial, enc.encode(text));
        const combined = new Uint8Array(iv.length + encrypted.byteLength);
        combined.set(iv); combined.set(new Uint8Array(encrypted), iv.length);
        const b64 = btoa(String.fromCharCode(...combined));
        setRes(b64);
        onResultChange({ text: b64, filename: 'encrypted.txt' });
    };

    return (
        <div className="card p-15 grid gap-10">
            <input className="pill" placeholder="Key" value={key} onChange={e=>setKey(e.target.value)} />
            <textarea className="pill font-mono" rows="3" value={text} onChange={e=>setText(e.target.value)} />
            <button className="btn-primary" onClick={encrypt}>AES-GCM Encrypt</button>
            {res && <div className="tool-result font-mono text-xs break-all">{res}</div>}
        </div>
    );
};

const HmacCalc = ({ onResultChange }) => {
    const [msg, setMsg] = useState('');
    const [key, setKey] = useState('');
    const [res, setRes] = useState('');

    const calc = async () => {
        const enc = new TextEncoder();
        const k = await crypto.subtle.importKey("raw", enc.encode(key), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
        const sig = await crypto.subtle.sign("HMAC", k, enc.encode(msg));
        const hex = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
        setRes(hex);
        onResultChange({ text: hex, filename: 'hmac.txt' });
    };

    return (
        <div className="card p-15 grid gap-10">
            <input className="pill" placeholder="Key" value={key} onChange={e=>setKey(e.target.value)} />
            <textarea className="pill font-mono" rows="3" placeholder="Message" value={msg} onChange={e=>setMsg(e.target.value)} />
            <button className="btn-primary" onClick={calc}>HMAC SHA-256</button>
            {res && <div className="tool-result font-mono text-xs break-all">{res}</div>}
        </div>
    );
};

const PasswordStrength = ({ onResultChange }) => {
    const [pass, setPass] = useState('');
    const check = (p) => {
        let score = 0;
        if (p.length > 8) score++;
        if (p.length > 12) score++;
        if (/[A-Z]/.test(p)) score++;
        if (/[0-9]/.test(p)) score++;
        if (/[^A-Za-z0-9]/.test(p)) score++;
        return score;
    };
    const score = check(pass);
    const labels = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong', 'Excellent'];

    useEffect(() => {
        onResultChange({ text: `Strength for "${pass}": ${labels[score]}`, filename: 'strength.txt' });
    }, [pass]);

    return (
        <div className="card p-20 text-center">
            <input type="password" className="pill w-full mb-15" value={pass} onChange={e=>setPass(e.target.value)} placeholder="Type password..." />
            <div className="w-full bg-border rounded-full h-10 mb-10 overflow-hidden">
                <div style={{ width: `${(score/5)*100}%`, background: score < 2 ? 'var(--danger)' : score < 4 ? 'var(--nature-gold)' : 'var(--nature-moss)', height: '100%', transition: 'all 0.3s' }} />
            </div>
            <div className="font-bold" style={{ color: score < 2 ? 'var(--danger)' : score < 4 ? 'var(--nature-gold)' : 'var(--nature-moss)' }}>{labels[score]}</div>
        </div>
    );
};

const DataAnonymizer = ({ onResultChange }) => {
    const [input, setInput] = useState('My email is test@example.com and phone is 123-456-7890.');
    const anon = () => {
        let res = input;
        res = res.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL]');
        res = res.replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[PHONE]');
        setInput(res);
        onResultChange({ text: res, filename: 'anonymized.txt' });
    };
    return (
        <div className="card p-15 grid gap-10">
            <textarea className="pill font-mono" rows="5" value={input} onChange={e=>setInput(e.target.value)} />
            <button className="btn-primary" onClick={anon}>Anonymize PII</button>
        </div>
    );
};

const PrivacyAudit = () => {
    const [perms, setPerms] = useState({});
    const check = async () => {
        const names = ['camera', 'microphone', 'geolocation', 'notifications'];
        const res = {};
        for(const n of names) {
            try {
                const s = await navigator.permissions.query({ name: n });
                res[n] = s.state;
            } catch(e) { res[n] = 'unsupported'; }
        }
        setPerms(res);
    };
    useEffect(() => { check(); }, []);
    return (
        <div className="grid gap-10">
            {Object.entries(perms).map(([k, v]) => (
                <div key={k} className="card p-15 flex-between no-animation">
                    <span className="capitalize">{k}</span>
                    <span className="pill" style={{ fontSize: '0.75rem', background: v === 'granted' ? 'var(--nature-moss)' : v === 'denied' ? 'var(--danger)' : 'var(--border)', color: v === 'granted' ? 'white' : 'inherit' }}>{v}</span>
                </div>
            ))}
            <button className="pill mt-10" onClick={check}>Refresh Permissions</button>
        </div>
    );
};

const SecurityInfo = () => (
    <div className="card p-20 about-content">
        <h3>Security Best Practices</h3>
        <ul>
            <li>Use unique, complex passwords for every account.</li>
            <li>Enable Two-Factor Authentication (2FA) whenever possible.</li>
            <li>Be cautious of phishing attempts and unexpected links.</li>
            <li>Keep your browser and operating system updated.</li>
            <li>Use a VPN on public Wi-Fi networks.</li>
        </ul>
        <div className="tool-result mt-20">
            <b>Environment:</b> {window.isSecureContext ? 'Secure Context (HTTPS)' : 'Insecure Context'}
        </div>
    </div>
);

export default PrivacySecurityTools;
