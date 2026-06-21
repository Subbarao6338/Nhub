import React, { useState, useEffect, useMemo, useRef } from 'react';
import { diffLines } from 'diff';
import { create, all } from 'mathjs';
import { QRCodeSVG } from 'qrcode.react';
import JsBarcode from 'jsbarcode';
import ToolResult from './ToolResult';

const math = create(all);

const DevTools = ({ toolId, onSubtoolChange }) => {
  const tabs = [
    { id: 'json-fmt', label: 'JSON Formatter' },
    { id: 'sql', label: 'SQL Formatter' },
    { id: 'diff', label: 'Diff Viewer' },
    { id: 'converter', label: 'Unit Converter' },
    { id: 'security', label: 'Security Hub' },
    { id: 'regex', label: 'Regex Tester' },
    { id: 'otp', label: 'OTP Generator' },
    { id: 'kusto', label: 'Kusto Query Gen' },
    { id: 'base64', label: 'Base64' },
    { id: 'jwt', label: 'JWT Decoder' },
    { id: 'cron', label: 'Cron Helper' },
    { id: 'url', label: 'URL Tool' },
    { id: 'yaml', label: 'YAML Conv' },
    { id: 'minifier', label: 'Minifier' },
    { id: 'xml-json', label: 'XML ↔ JSON' },
    { id: 'xml-fmt', label: 'XML Formatter' },
    { id: 'json-ts', label: 'JSON to TS' },
    { id: 'color', label: 'Color Picker' },
    { id: 'qr-barcode', label: 'QR & Barcode' }
  ].sort((a, b) => a.label.localeCompare(b.label));

  const [activeTab, setActiveTab] = useState('json-fmt');
  useEffect(() => { if (onSubtoolChange) onSubtoolChange(tabs.find(t=>t.id===activeTab).label); }, [activeTab]);

  return (
    <div className="tool-form mt-20">
      <div className="pill-group mb-20 scrollable-x">
        {tabs.map(tab => (
          <button key={tab.id} className={`pill ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>{tab.label}</button>
        ))}
      </div>
      <div className="hub-content animate-fadeIn">
        {activeTab === 'json-fmt' && <JsonFormatter />}
        {activeTab === 'sql' && <SqlFormatter />}
        {activeTab === 'diff' && <DiffViewer />}
        {activeTab === 'converter' && <UnitConverterHub />}
        {activeTab === 'security' && <SecurityHub />}
        {activeTab === 'regex' && <RegexTester />}
        {activeTab === 'otp' && <OtpGenerator />}
        {activeTab === 'kusto' && <KustoGenerator />}
        {activeTab === 'base64' && <Base64Tool />}
        {activeTab === 'jwt' && <JwtDecoder />}
        {activeTab === 'cron' && <CronHelper />}
        {activeTab === 'url' && <UrlTool />}
        {activeTab === 'yaml' && <YamlConverter />}
        {activeTab === 'minifier' && <Minifier />}
        {activeTab === 'xml-json' && <XmlJsonConverter />}
        {activeTab === 'xml-fmt' && <XmlFormatter />}
        {activeTab === 'json-ts' && <JsonToTs />}
        {activeTab === 'color' && <ColorPicker />}
        {activeTab === 'qr-barcode' && <QrBarcodeGenerator />}
      </div>
    </div>
  );
};

const KustoGenerator = () => {
    const [table, setTable] = useState('MyLogs');
    const [fields, setFields] = useState('TimeGenerated, Level, Message');
    const [query, setQuery] = useState('');
    const handleGen = async () => {
        const response = await fetch('/api/utils/kusto-gen', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ table, fields: fields.split(',').map(f => f.trim()) })
        });
        const data = await response.json();
        setQuery(data.query);
    };
    return (
        <div className="card p-30 glass-card grid gap-15">
            <h3>Kusto Query Generator</h3>
            <input className="pill" value={table} onChange={e=>setTable(e.target.value)} placeholder="Table Name" />
            <input className="pill" value={fields} onChange={e=>setFields(e.target.value)} placeholder="Fields" />
            <button className="btn-primary" onClick={handleGen}>Generate</button>
            {query && <pre className="p-15 bg-surface rounded-lg small overflow-auto">{query}</pre>}
        </div>
    );
};

const OtpGenerator = () => {
    const [otp, setOtp] = useState('');
    const gen = () => fetch('/api/utils/generate-otp').then(r=>r.json()).then(d=>setOtp(d.otp));
    return (<div className="card p-30 glass-card text-center grid gap-15"><h3>OTP Generator</h3><button className="btn-primary" onClick={gen}>Generate OTP</button>{otp && <div className="h1 tracking-widest font-bold color-primary">{otp}</div>}</div>);
};

const RegexTester = () => {
    const [p, setP] = useState('[a-z]+');
    const [s, setS] = useState('test string');
    const load = (t) => fetch(`/api/utils/regex-gen?pattern_type=${t}`).then(r=>r.json()).then(d=>setP(d.regex));
    return (
        <div className="card p-20 glass-card grid gap-15">
            <h3>Regex Tester</h3>
            <div className="pill-group"><button className="pill" onClick={()=>load('email')}>Email</button><button className="pill" onClick={()=>load('url')}>URL</button></div>
            <input className="pill font-mono" value={p} onChange={e=>setP(e.target.value)} />
            <textarea className="pill font-mono" value={s} onChange={e=>setS(e.target.value)} />
            <ToolResult result={{text: p}} />
        </div>
    );
};

const JsonFormatter = () => {
    const [v, setV] = useState('');
    const formatted = useMemo(() => { try { return v ? JSON.stringify(JSON.parse(v), null, 2) : ''; } catch(e) { return 'Invalid JSON'; } }, [v]);
    return (<div className="card p-20 glass-card grid gap-15"><h3>JSON Formatter</h3><textarea className="pill font-mono" rows="8" value={v} onChange={e=>setV(e.target.value)} /><ToolResult result={{text: formatted}} /></div>);
};

const SqlFormatter = () => {
    const [v, setV] = useState('');
    return (<div className="card p-20 glass-card grid gap-15"><h3>SQL Formatter</h3><textarea className="pill font-mono" rows="6" value={v} onChange={e=>setV(e.target.value)} /><ToolResult result={{text: v.toUpperCase()}} /></div>);
};

const UnitConverterHub = () => {
    const [val, setVal] = useState(1);
    const [res, setRes] = useState(0);
    useEffect(() => { setRes(val * 1000); }, [val]); // Simplified
    return (<div className="card p-30 glass-card grid gap-15"><h3>Unit Converter</h3><input type="number" className="pill" value={val} onChange={e=>setVal(e.target.value)} /><div className="h2 text-center">{res}</div></div>);
};

const Base64Tool = () => {
    const [i, setI] = useState('');
    const [r, setR] = useState('');
    return (<div className="card p-20 glass-card grid gap-10"><h3>Base64</h3><textarea className="pill" value={i} onChange={e=>setI(e.target.value)} /><div className="flex-gap"><button className="pill" onClick={()=>setR(btoa(i))}>Encode</button><button className="pill" onClick={()=>setR(atob(i))}>Decode</button></div><div className="p-10 bg-surface rounded">{r}</div></div>);
};

const SecurityHub = () => (<div className="card p-30 glass-card text-center"><h3>Security Hub</h3><button className="btn-primary" onClick={()=>alert(crypto.randomUUID())}>Generate UUID</button></div>);
const JwtDecoder = () => (<div className="p-20 opacity-6">JWT Decoder Component</div>);
const CronHelper = () => (<div className="p-20 opacity-6">Cron Helper Component</div>);
const UrlTool = () => (<div className="p-20 opacity-6">URL Tool Component</div>);
const YamlConverter = () => (<div className="p-20 opacity-6">YAML Converter Component</div>);
const Minifier = () => (<div className="p-20 opacity-6">Minifier Component</div>);
const XmlJsonConverter = () => (<div className="p-20 opacity-6">XML/JSON Component</div>);
const XmlFormatter = () => (<div className="p-20 opacity-6">XML Formatter Component</div>);
const JsonToTs = () => (<div className="p-20 opacity-6">JSON to TS Component</div>);
const ColorPicker = () => (<div className="p-20 opacity-6">Color Picker Component</div>);
const DiffViewer = () => (<div className="p-20 opacity-6">Diff Viewer Component</div>);
const QrBarcodeGenerator = () => (<div className="p-20 opacity-6">QR/Barcode Component</div>);

export default DevTools;
