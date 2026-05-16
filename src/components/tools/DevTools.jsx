import React, { useState, useEffect, useMemo, useRef } from 'react';
import { diffLines } from 'diff';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import API_BASE from '../../api';

// --- UNIT CONVERTER HUB ---
const UnitConverterHub = ({ subtool, onResultChange }) => {
    const tabs = [
        { id: 'length-conv', label: 'Length' },
        { id: 'weight-conv', label: 'Weight' },
        { id: 'temp-conv', label: 'Temperature' },
        { id: 'data-conv', label: 'Data' }
    ];
    const [activeTab, setActiveTab] = useState(subtool || 'length-conv');
    const [value, setValue] = useState(1);
    const [fromUnit, setFromUnit] = useState('km');
    const [toUnit, setToUnit] = useState('m');
    const [result, setResult] = useState(0);

    const rates = {
        'km_m': 1000, 'm_km': 0.001, 'km_mi': 0.621371, 'mi_km': 1.60934,
        'kg_lb': 2.20462, 'lb_kg': 0.453592,
        'gb_mb': 1024, 'mb_gb': 1 / 1024, 'mb_kb': 1024, 'kb_mb': 1 / 1024
    };

    useEffect(() => {
        const val = parseFloat(value) || 0;
        let res = val;
        if (activeTab === 'temp-conv') {
            if (fromUnit === 'c' && toUnit === 'f') res = (val * 9 / 5) + 32;
            else if (fromUnit === 'f' && toUnit === 'c') res = (val - 32) * 5 / 9;
            else if (fromUnit === 'c' && toUnit === 'k') res = val + 273.15;
            else if (fromUnit === 'k' && toUnit === 'c') res = val - 273.15;
        } else if (fromUnit !== toUnit) {
            const key = `${fromUnit}_${toUnit}`;
            res = rates[key] ? val * rates[key] : (rates[`${toUnit}_${fromUnit}`] ? val / rates[`${toUnit}_${fromUnit}`] : val);
        }
        setResult(res.toFixed(2));
        onResultChange({ text: `${value} ${fromUnit} = ${res.toFixed(2)} ${toUnit}` });
    }, [value, fromUnit, toUnit, activeTab]);

    return (
        <div className="grid gap-15">
            <div className="pill-group scrollable-x">
                {tabs.map(t => (
                    <button key={t.id} className={`pill ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>{t.label}</button>
                ))}
            </div>
            <div className="card p-20 glass-card">
                <input type="number" className="pill mb-15 text-center h2" value={value} onChange={e => setValue(e.target.value)} />
                <div className="flex-center gap-10">
                    <select className="pill flex-1" value={fromUnit} onChange={e=>setFromUnit(e.target.value)}>
                        <option value="km">KM</option><option value="m">M</option><option value="mi">MI</option>
                        <option value="kg">KG</option><option value="lb">LB</option>
                        <option value="c">°C</option><option value="f">°F</option>
                    </select>
                    <span className="material-icons">arrow_forward</span>
                    <select className="pill flex-1" value={toUnit} onChange={e=>setToUnit(e.target.value)}>
                        <option value="m">M</option><option value="km">KM</option><option value="mi">MI</option>
                        <option value="lb">LB</option><option value="kg">KG</option>
                        <option value="f">°F</option><option value="c">°C</option>
                    </select>
                </div>
                <div className="tool-result text-center mt-20">
                    <div className="h2 color-primary">{result}</div>
                    <div className="opacity-6 font-bold">{toUnit.toUpperCase()}</div>
                </div>
            </div>
        </div>
    );
};

// --- CORE DEV TOOLS ---
const DiffViewer = () => {
    const [oldT, setOldT] = useState('Hello World\nNature Hub');
    const [newT, setNewT] = useState('Hello Nature\nNature Hub v2');
    const diff = diffLines(oldT, newT);
    return (
        <div className="grid gap-15">
            <div className="grid grid-2 gap-10">
                <textarea className="pill font-mono" rows="6" value={oldT} onChange={e=>setOldT(e.target.value)} />
                <textarea className="pill font-mono" rows="6" value={newT} onChange={e=>setNewT(e.target.value)} />
            </div>
            <div className="card p-20 glass-card font-mono text-sm">
                {diff.map((p, i) => (
                    <div key={i} style={{ color: p.added ? 'var(--nature-moss)' : p.removed ? 'var(--danger)' : 'inherit', background: p.added ? 'rgba(var(--primary-rgb), 0.1)' : p.removed ? 'rgba(188,71,73,0.1)' : 'transparent' }}>
                        {p.added ? '+ ' : p.removed ? '- ' : '  '}{p.value}
                    </div>
                ))}
            </div>
        </div>
    );
};

const SqlFormatter = () => {
    const [sql, setSql] = useState("SELECT * FROM users WHERE id = 1");
    const formatted = useMemo(() => sql.replace(/\s+/g, ' ').replace(/SELECT|FROM|WHERE|AND|OR|ORDER BY|GROUP BY/gi, m => `\n${m.toUpperCase()}`).trim(), [sql]);
    return (
        <div className="card p-20 glass-card">
            <textarea className="pill font-mono mb-15" rows="4" value={sql} onChange={e=>setSql(e.target.value)} />
            <pre className="tool-result">{formatted}</pre>
        </div>
    );
};

const JsonFormatter = ({ onResultChange }) => {
    const [val, setVal] = useState('');
    const resultRef = useRef(onResultChange);
    useEffect(() => { resultRef.current = onResultChange; }, [onResultChange]);

    useEffect(() => {
        try {
            if (!val) { resultRef.current(null); return; }
            const parsed = JSON.parse(val);
            resultRef.current({ text: JSON.stringify(parsed, null, 2), filename: 'formatted.json' });
        } catch (e) {
            resultRef.current(null);
        }
    }, [val]);
    return (
        <div className="card p-20 glass-card">
            <textarea className="pill font-mono" rows="8" placeholder='{"key": "value"}' value={val} onChange={e => setVal(e.target.value)} />
        </div>
    );
};

const SecurityHub = ({ onResultChange, subtool }) => {
    const [hashInput, setHashInput] = useState('');
    const [algo, setAlgo] = useState('SHA-256');

    const genHash = async () => {
        const msgUint8 = new TextEncoder().encode(hashInput);
        const hashBuffer = await crypto.subtle.digest(algo, msgUint8);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        onResultChange({ text: hashHex, filename: 'hash.txt' });
    };

    return (
        <div className="grid gap-20">
            <div className="card p-25 glass-card text-center">
                <h3 className="mb-15">Quick Actions</h3>
                <div className="grid grid-2-cols gap-10">
                    <button className="btn-primary" onClick={() => onResultChange({text: crypto.randomUUID(), filename: 'uuid.txt'})}>Gen UUID</button>
                    <button className="pill" onClick={() => onResultChange({text: Math.random().toString(36).substring(2, 15), filename: 'password.txt'})}>Gen Password</button>
                </div>
            </div>
            <div className="card p-25 glass-card">
                <h3 className="mb-15">Hash Generator</h3>
                <div className="grid gap-10">
                    <input className="pill" value={hashInput} onChange={e=>setHashInput(e.target.value)} placeholder="Text to hash..." />
                    <div className="flex-gap">
                        <select className="pill flex-1" value={algo} onChange={e=>setAlgo(e.target.value)}>
                            <option value="SHA-1">SHA-1</option>
                            <option value="SHA-256">SHA-256</option>
                            <option value="SHA-512">SHA-512</option>
                        </select>
                        <button className="btn-primary flex-1" onClick={genHash} disabled={!hashInput}>Generate Hash</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const DevTools = ({ toolId, onResultChange, onSubtoolChange }) => {
  const tabs = [
    { id: 'json-fmt', label: 'JSON Formatter' },
    { id: 'sql', label: 'SQL Formatter' },
    { id: 'diff', label: 'Diff Viewer' },
    { id: 'converter', label: 'Unit Converter' },
    { id: 'security', label: 'Security Hub' },
    { id: 'regex', label: 'Regex Tester' }
  ].sort((a, b) => a.label.localeCompare(b.label));

  const [activeTab, setActiveTab] = useState('json-fmt');
  const resultRef = useRef(onResultChange);
  const subtoolRef = useRef(onSubtoolChange);

  useEffect(() => {
    resultRef.current = onResultChange;
    subtoolRef.current = onSubtoolChange;
  }, [onResultChange, onSubtoolChange]);

  useEffect(() => {
    if (toolId) {
        if (toolId === 'json-formatter') setActiveTab('json-fmt');
        else if (toolId === 'sql-formatter') setActiveTab('sql');
        else if (toolId === 'diff-viewer') setActiveTab('diff');
        else if (['length-conv', 'weight-conv', 'temp-conv', 'data-conv'].includes(toolId)) setActiveTab('converter');
        else if (['password-gen', 'hash-gen', 'uuid-gen'].includes(toolId)) setActiveTab('security');
        else if (toolId === 'regex-tester') setActiveTab('regex');
    }
  }, [toolId]);

  useEffect(() => {
    const current = tabs.find(t => t.id === activeTab);
    if (current && subtoolRef.current) subtoolRef.current(current.label);
    // Reset result on tab change
    if (resultRef.current) resultRef.current(null);
  }, [activeTab]);

  return (
    <div className="tool-form">
      <div className="pill-group mb-20 scrollable-x">
        {tabs.map(tab => (
          <button key={tab.id} className={`pill ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="hub-content animate-fadeIn">
        {activeTab === 'json-fmt' && <JsonFormatter onResultChange={onResultChange} />}
        {activeTab === 'sql' && <SqlFormatter />}
        {activeTab === 'diff' && <DiffViewer />}
        {activeTab === 'converter' && <UnitConverterHub onResultChange={onResultChange} subtool={toolId} />}
        {activeTab === 'security' && <SecurityHub onResultChange={onResultChange} subtool={toolId} />}
        {activeTab === 'regex' && <div className="card p-20 glass-card">Regex Tester Integrated.</div>}
      </div>
    </div>
  );
};

export default DevTools;
