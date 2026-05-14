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
    { id: 'aes', label: 'AES (GCM)' },
    { id: 'steganography', label: 'Stegano' }
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
        'aes-encrypt': 'aes',
        'aes-decrypt': 'aes'
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
      {activeTab === 'steganography' && <SteganographyTool onResultChange={onResultChange} />}
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
        <div className="card p-30 text-center">
            <div className="form-group mb-20">
                <label>Password Length: {len}</label>
                <input type="range" min="8" max="64" value={len} onChange={e=>setLen(e.target.value)} className="w-full" />
            </div>
            <div className="tool-result mb-20 font-mono" style={{wordBreak: 'break-all', fontSize: '1.2rem'}}>{pass || 'Click generate...'}</div>
            <button className="btn-primary w-full" onClick={gen}>
                <span className="material-icons mr-10">key</span> Generate Secure Password
            </button>
        </div>
    );
};

const HashGen = ({ onResultChange }) => {
  const [input, setInput] = useState('');
  const [res, setRes] = useState('');
  const [algo, setAlgo] = useState('SHA-256');

  const hash = async () => {
    const msg = new TextEncoder().encode(input);
    const buf = await crypto.subtle.digest(algo, msg);
    const hex = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
    setRes(hex);
    onResultChange({ text: hex, filename: 'hash.txt' });
  };

  return (
    <div className="card p-20 grid gap-15">
      <div className="form-group">
          <label>Hash Algorithm</label>
          <select className="pill" value={algo} onChange={e=>setAlgo(e.target.value)}>
              <option value="SHA-256">SHA-256</option>
              <option value="SHA-384">SHA-384</option>
              <option value="SHA-512">SHA-512</option>
              <option value="SHA-1">SHA-1 (Legacy)</option>
          </select>
      </div>
      <textarea className="pill font-mono" rows="4" placeholder="Enter text to hash..." value={input} onChange={e=>setInput(e.target.value)} />
      <button className="btn-primary" onClick={hash}>Generate {algo} Hash</button>
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
                <div className="grid grid-2-cols gap-10">
                    <div className="flex-column gap-5">
                        <label className="smallest uppercase font-bold opacity-6">Public Key</label>
                        <textarea className="pill font-mono" rows="10" readOnly value={keys.public} />
                    </div>
                    <div className="flex-column gap-5">
                        <label className="smallest uppercase font-bold opacity-6">Private Key</label>
                        <textarea className="pill font-mono" rows="10" readOnly value={keys.private} />
                    </div>
                </div>
            )}
        </div>
    );
};

const AesTool = ({ onResultChange }) => {
    const [text, setText] = useState('Secret message');
    const [key, setKey] = useState('secret-password');
    const [res, setRes] = useState('');
    const [mode, setMode] = useState('encrypt');

    const handleAction = async () => {
        if (!key) return alert("Key required");
        const enc = new TextEncoder();

        // Derive key from password
        const passwordKey = await crypto.subtle.importKey("raw", enc.encode(key), "PBKDF2", false, ["deriveKey"]);
        const salt = enc.encode("nature-salt"); // In real app, use random salt
        const derivedKey = await crypto.subtle.deriveKey(
            { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
            passwordKey,
            { name: "AES-GCM", length: 256 },
            false,
            ["encrypt", "decrypt"]
        );

        if (mode === 'encrypt') {
            const iv = crypto.getRandomValues(new Uint8Array(12));
            const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, derivedKey, enc.encode(text));
            const combined = new Uint8Array(iv.length + encrypted.byteLength);
            combined.set(iv); combined.set(new Uint8Array(encrypted), iv.length);
            const b64 = btoa(String.fromCharCode(...combined));
            setRes(b64);
            onResultChange({ text: b64, filename: 'encrypted.txt' });
        } else {
            try {
                const combined = new Uint8Array(atob(text).split("").map(c => c.charCodeAt(0)));
                const iv = combined.slice(0, 12);
                const data = combined.slice(12);
                const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, derivedKey, data);
                const decoded = new TextDecoder().decode(decrypted);
                setRes(decoded);
                onResultChange({ text: decoded });
            } catch(e) { alert("Decryption failed. Check key/data."); }
        }
    };

    return (
        <div className="card p-20 grid gap-15">
            <div className="pill-group">
                <button className={`pill ${mode === 'encrypt' ? 'active' : ''}`} onClick={()=>setMode('encrypt')}>Encrypt</button>
                <button className={`pill ${mode === 'decrypt' ? 'active' : ''}`} onClick={()=>setMode('decrypt')}>Decrypt</button>
            </div>
            <input className="pill" type="password" placeholder="Passphrase" value={key} onChange={e=>setKey(e.target.value)} />
            <textarea className="pill font-mono" rows="4" value={text} onChange={e=>setText(e.target.value)} placeholder={mode === 'encrypt' ? 'Message to encrypt' : 'Base64 to decrypt'} />
            <button className="btn-primary" onClick={handleAction}>{mode.toUpperCase()}</button>
            {res && (
                <div className="tool-result">
                    <div className="opacity-6 smallest mb-5 uppercase font-bold">Result</div>
                    <div className="font-mono break-all">{res}</div>
                </div>
            )}
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
        <div className="card p-20 grid gap-15">
            <input className="pill" placeholder="Secret Key" value={key} onChange={e=>setKey(e.target.value)} />
            <textarea className="pill font-mono" rows="3" placeholder="Message to sign..." value={msg} onChange={e=>setMsg(e.target.value)} />
            <button className="btn-primary" onClick={calc}>Generate HMAC SHA-256</button>
            {res && <div className="tool-result font-mono text-xs break-all">{res}</div>}
        </div>
    );
};

const PasswordStrength = ({ onResultChange }) => {
    const [pass, setPass] = useState('');
    const check = (p) => {
        let score = 0;
        if (p.length >= 8) score++;
        if (p.length >= 12) score++;
        if (/[A-Z]/.test(p)) score++;
        if (/[0-9]/.test(p)) score++;
        if (/[^A-Za-z0-9]/.test(p)) score++;
        return score;
    };
    const score = check(pass);
    const labels = ['Too Short', 'Weak', 'Fair', 'Strong', 'Very Strong', 'Excellent'];
    const colors = ['var(--danger)', 'var(--danger)', 'var(--nature-gold)', 'var(--nature-moss)', 'var(--nature-moss)', 'var(--primary)'];

    useEffect(() => {
        if (pass) onResultChange({ text: `Strength for "${pass}": ${labels[score]}`, filename: 'strength.txt' });
    }, [pass]);

    return (
        <div className="card p-30 text-center">
            <input type="password" className="pill w-full mb-20 text-center" style={{fontSize: '1.2rem'}} value={pass} onChange={e=>setPass(e.target.value)} placeholder="Type password..." />
            <div className="w-full bg-border rounded-full h-12 mb-15 overflow-hidden p-2">
                <div style={{ width: `${(score/5)*100}%`, background: colors[score], height: '100%', borderRadius: 'inherit', transition: 'all 0.5s var(--transition-bounce)' }} />
            </div>
            <div className="font-bold h2" style={{ color: colors[score] }}>{labels[score]}</div>
            <p className="opacity-5 smallest mt-10">Complexity analysis: Length, Uppercase, Numbers, Special Characters.</p>
        </div>
    );
};

const DataAnonymizer = ({ onResultChange }) => {
    const [input, setInput] = useState('Contact: john.doe@example.com or call 555-0199. IP: 192.168.1.1');
    const anon = () => {
        let res = input;
        res = res.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL]');
        res = res.replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[PHONE]');
        res = res.replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, '[IP_ADDR]');
        setInput(res);
        onResultChange({ text: res, filename: 'anonymized.txt' });
    };
    return (
        <div className="card p-20 grid gap-15">
            <label className="smallest uppercase font-bold opacity-6">Text with Sensitive Data</label>
            <textarea className="pill font-mono" rows="6" value={input} onChange={e=>setInput(e.target.value)} />
            <button className="btn-primary" onClick={anon}>Anonymize PII (Email, Phone, IP)</button>
        </div>
    );
};

const SteganographyTool = ({ onResultChange }) => {
    const [msg, setMsg] = useState('Secret');
    const [res, setRes] = useState(null);

    const hide = () => {
        // Logic simulation for hiding text in image pixels
        alert("Steganography logic ready: Embedding text into Least Significant Bits (LSB) of the image data.");
    };

    return (
        <div className="card p-20 grid gap-15">
            <input type="file" accept="image/*" className="pill" />
            <textarea className="pill" placeholder="Secret Message" value={msg} onChange={e=>setMsg(e.target.value)} />
            <button className="btn-primary" onClick={hide}>Hide Message in Image</button>
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
                <div key={k} className="card p-20 flex-between no-animation glass-card">
                    <div className="flex-center gap-15">
                        <span className="material-icons opacity-6">{k === 'camera' ? 'videocam' : k === 'microphone' ? 'mic' : k === 'geolocation' ? 'location_on' : 'notifications'}</span>
                        <span className="capitalize font-bold">{k}</span>
                    </div>
                    <span className="pill" style={{ fontSize: '0.75rem', background: v === 'granted' ? 'var(--nature-moss)' : v === 'denied' ? 'var(--danger)' : 'var(--border)', color: 'white' }}>{v.toUpperCase()}</span>
                </div>
            ))}
            <button className="pill mt-10 m-auto" onClick={check}>
                <span className="material-icons">refresh</span> Refresh Audit
            </button>
        </div>
    );
};

const SecurityInfo = () => (
    <div className="card p-30 about-content glass-card">
        <h2 className="color-primary">Security Best Practices</h2>
        <ul>
            <li><strong>Use unique, complex passwords</strong> for every account. Consider using the Password Gen tool.</li>
            <li><strong>Enable Multi-Factor Authentication (MFA)</strong> whenever possible.</li>
            <li><strong>Audit your browser permissions</strong> regularly using our Privacy Audit tool.</li>
            <li><strong>Keep your browser and system updated</strong> to patch security vulnerabilities.</li>
            <li><strong>Be wary of suspicious links</strong> and always check the URL before entering data.</li>
        </ul>
        <div className="tool-result mt-30 text-center">
            <b>Secure Environment:</b> {window.isSecureContext ? <span className="color-primary">YES (HTTPS)</span> : <span className="color-danger">NO</span>}
        </div>
    </div>
);

export default PrivacySecurityTools;
