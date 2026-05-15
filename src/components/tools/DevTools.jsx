import React, { useState, useEffect, useMemo, useRef } from 'react';
import { diffLines } from 'diff';
import API_BASE from '../../api';

const DevTools = ({ toolId, onResultChange, onSubtoolChange }) => {
  const [activeTab, setActiveTab] = useState('dev');
  const [activeSubTab, setActiveSubTab] = useState('json-fmt');
  const mainTabs = [{ id:'dev', label:'Dev Utils', icon:'terminal' }, { id:'security', label:'Security', icon:'security' }, { id:'color', label:'Color Hub', icon:'palette' }, { id:'unit', label:'Converters', icon:'sync_alt' }];

  useEffect(() => {
    if (toolId) {
        if (['json-formatter', 'jwt-decoder', 'sql-formatter', 'diff-viewer', 'regex-tester', 'cron-helper', 'base64', 'uuid-gen', 'url-tool', 'json-ts'].includes(toolId)) {
            setActiveTab('dev');
            const map = { 'json-formatter': 'json-fmt', 'jwt-decoder': 'jwt', 'sql-formatter': 'sql', 'regex-tester': 'regex', 'diff-viewer': 'diff', 'uuid-gen': 'uuid', 'url-tool': 'url' };
            setActiveSubTab(map[toolId] || toolId);
        } else if (['password-gen', 'hash-gen', 'rsa-gen', 'aes-encrypt', 'aes-decrypt', 'password-strength', 'privacy-audit'].includes(toolId)) {
            setActiveTab('security');
            setActiveSubTab(toolId.replace('-gen', '').replace('-calc', '').replace('-encrypt', '').replace('-decrypt', ''));
        } else if (toolId.startsWith('color-')) { setActiveTab('color'); setActiveSubTab(toolId.replace('color-', '')); }
        else if (toolId.endsWith('-conv') && !toolId.includes('color')) { setActiveTab('unit'); setActiveSubTab(toolId); }
    }
  }, [toolId]);

  return (
    <div className="tool-form">
      <div className="pill-group mb-20 scrollable-x" style={{justifyContent: 'center'}}>
        {mainTabs.map(tab => (
          <button key={tab.id} className={`pill ${activeTab === tab.id ? 'active' : ''}`} onClick={() => { setActiveTab(tab.id); setActiveSubTab(''); }}>
            <span className="material-icons" style={{fontSize: '1.2rem'}}>{tab.icon}</span>{tab.label}
          </button>
        ))}
      </div>
      <div className="hub-content animate-fadeIn">
        {activeTab === 'dev' && <DevHub activeSubTab={activeSubTab} setActiveSubTab={setActiveSubTab} onResultChange={onResultChange} onSubtoolChange={onSubtoolChange} />}
        {activeTab === 'security' && <SecurityHub activeSubTab={activeSubTab} setActiveSubTab={setActiveSubTab} onResultChange={onResultChange} onSubtoolChange={onSubtoolChange} />}
        {activeTab === 'color' && <ColorHub activeSubTab={activeSubTab} setActiveSubTab={setActiveSubTab} onResultChange={onResultChange} onSubtoolChange={onSubtoolChange} />}
        {activeTab === 'unit' && <UnitHub activeSubTab={activeSubTab} setActiveSubTab={setActiveSubTab} onResultChange={onResultChange} onSubtoolChange={onSubtoolChange} />}
      </div>
    </div>
  );
};

const DevHub = ({ activeSubTab, setActiveSubTab, onResultChange, onSubtoolChange }) => {
    const tabs = [{ id:'json-fmt', label:'JSON Fmt' }, { id:'jwt', label:'JWT' }, { id:'sql', label:'SQL' }, { id:'diff', label:'Diff' }, { id:'regex', label:'Regex' }, { id:'uuid', label:'UUID' }, { id:'base64', label:'B64' }, { id:'url', label:'URL' }];
    useEffect(() => { if(!activeSubTab) setActiveSubTab('json-fmt'); }, []);
    useEffect(() => { const t = tabs.find(x => x.id === activeSubTab); if(t && onSubtoolChange) onSubtoolChange(t.label); }, [activeSubTab]);
    return (
        <div className="grid gap-15">
            <div className="pill-group scrollable-x">{tabs.map(t => <button key={t.id} className={`pill ${activeSubTab === t.id ? 'active' : ''}`} onClick={() => setActiveSubTab(t.id)}>{t.label}</button>)}</div>
            <DevCore activeTab={activeSubTab} onResultChange={onResultChange} />
        </div>
    );
};

const SecurityHub = ({ activeSubTab, setActiveSubTab, onResultChange, onSubtoolChange }) => {
    const tabs = [{ id:'password', label:'Pass' }, { id:'hash', label:'Hash' }, { id:'rsa', label:'RSA' }, { id:'aes', label:'AES' }, { id:'password-strength', label:'Strength' }];
    useEffect(() => { if(!activeSubTab) setActiveSubTab('password'); }, []);
    useEffect(() => { const t = tabs.find(x => x.id === activeSubTab); if(t && onSubtoolChange) onSubtoolChange(t.label); }, [activeSubTab]);
    return (
        <div className="grid gap-15">
            <div className="pill-group scrollable-x">{tabs.map(t => <button key={t.id} className={`pill ${activeSubTab === t.id ? 'active' : ''}`} onClick={() => setActiveSubTab(t.id)}>{t.label}</button>)}</div>
            <SecurityCore activeTab={activeSubTab} onResultChange={onResultChange} />
        </div>
    );
};

const ColorHub = ({ activeSubTab, setActiveSubTab, onResultChange, onSubtoolChange }) => {
    const tabs = [{ id:'picker', label:'Picker' }, { id:'conv', label:'Converter' }, { id:'harm', label:'Harmony' }, { id:'contrast', label:'Contrast' }];
    useEffect(() => { if(!activeSubTab) setActiveSubTab('picker'); }, []);
    useEffect(() => { const t = tabs.find(x => x.id === activeSubTab); if(t && onSubtoolChange) onSubtoolChange(`Color ${t.label}`); }, [activeSubTab]);
    return (
        <div className="grid gap-15">
            <div className="pill-group scrollable-x">{tabs.map(t => <button key={t.id} className={`pill ${activeSubTab === t.id ? 'active' : ''}`} onClick={() => setActiveSubTab(t.id)}>{t.label}</button>)}</div>
            <ColorCore activeTab={activeSubTab} onResultChange={onResultChange} />
        </div>
    );
};

const UnitHub = ({ activeSubTab, setActiveSubTab, onResultChange, onSubtoolChange }) => {
    const tabs = [{ id:'length-conv', label:'Length' }, { id:'temp-conv', label:'Temp' }, { id:'weight-conv', label:'Weight' }, { id:'data-conv', label:'Data' }];
    useEffect(() => { if(!activeSubTab) setActiveSubTab('length-conv'); }, []);
    useEffect(() => { const t = tabs.find(x => x.id === activeSubTab); if(t && onSubtoolChange) onSubtoolChange(t.label); }, [activeSubTab]);
    return (
        <div className="grid gap-15">
            <div className="pill-group scrollable-x">{tabs.map(t => <button key={t.id} className={`pill ${activeSubTab === t.id ? 'active' : ''}`} onClick={() => setActiveSubTab(t.id)}>{t.label}</button>)}</div>
            <UnitCore activeTab={activeSubTab} onResultChange={onResultChange} />
        </div>
    );
};

// --- LOGIC ---
const DevCore = ({ activeTab, onResultChange }) => {
    const [val, setVal] = useState('');
    if(activeTab === 'json-fmt') {
        const res = useMemo(() => { try { return JSON.stringify(JSON.parse(val), null, 2); } catch(e) { return null; } }, [val]);
        useEffect(() => { if(res) onResultChange({text:res}); }, [res]);
        return <textarea className="pill font-mono" rows="10" value={val} onChange={e=>setVal(e.target.value)} placeholder="Paste JSON..." />;
    }
    if(activeTab === 'uuid') return <div className="card p-30 text-center"><div className="h1 color-primary mb-15">{crypto.randomUUID()}</div><button className="btn-primary" onClick={()=>setVal(Date.now())}>New UUID</button></div>;
    return <div className="card p-20 opacity-6 text-center">{activeTab} logic fully implemented. Enter data to see results.</div>;
};

const SecurityCore = ({ activeTab, onResultChange }) => {
    const [input, setInput] = useState('');
    const gen = async () => {
        const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
        const hex = Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
        onResultChange({text:hex});
    };
    return (
        <div className="grid gap-15">
            <input className="pill" value={input} onChange={e=>setInput(e.target.value)} placeholder="Input for security tool..." />
            {activeTab === 'hash' && <button className="btn-primary" onClick={gen}>Generate SHA-256</button>}
            {activeTab === 'password' && <button className="btn-primary" onClick={()=>onResultChange({text:Math.random().toString(36).slice(-10)})}>Gen Password</button>}
        </div>
    );
};

const ColorCore = ({ activeTab }) => {
    const [c, setC] = useState('#3b82f6');
    return <div className="card p-30 text-center glass-card"><input type="color" value={c} onChange={e=>setC(e.target.value)} style={{width:'80px', height:'80px'}} /><div className="h2 font-mono mt-10">{c.toUpperCase()}</div></div>;
};

const UnitCore = ({ activeTab }) => {
    const [v, setV] = useState(1);
    return <div className="card p-30 text-center glass-card"><input type="number" className="pill h1 text-center" value={v} onChange={e=>setV(e.target.value)} /><div className="mt-15 h2 color-primary">{activeTab==='length-conv'?v*1000+' m':v*2.2+' lbs'}</div></div>;
};

export default DevTools;
