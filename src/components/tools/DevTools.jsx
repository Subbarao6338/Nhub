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
    const [oldT, setOldT] = useState('Hello World\nEpic Toolbox');
    const [newT, setNewT] = useState('Hello Epic Toolbox\nEpic Toolbox v2');
    const diff = diffLines(oldT, newT);
    return (
        <div className="grid gap-15">
            <div className="grid grid-2 gap-10">
                <textarea className="pill font-mono" rows="6" value={oldT} onChange={e=>setOldT(e.target.value)} />
                <textarea className="pill font-mono" rows="6" value={newT} onChange={e=>setNewT(e.target.value)} />
            </div>
            <div className="card p-20 glass-card font-mono text-sm">
                {diff.map((p, i) => (
                    <div key={i} style={{ color: p.added ? 'var(--green)' : p.removed ? 'var(--danger)' : 'inherit', background: p.added ? 'rgba(var(--green-rgb), 0.1)' : p.removed ? 'rgba(var(--red-rgb), 0.1)' : 'transparent' }}>
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

const Base64Tool = ({ onResultChange }) => {
    const [input, setInput] = useState('');
    const process = (mode) => {
        try {
            let res;
            if (mode === 'encode') {
                const uint8 = new TextEncoder().encode(input);
                res = btoa(String.fromCharCode(...uint8));
            } else {
                const bin = atob(input);
                const uint8 = new Uint8Array(bin.length);
                for (let i = 0; i < bin.length; i++) uint8[i] = bin.charCodeAt(i);
                res = new TextDecoder().decode(uint8);
            }
            onResultChange({ text: res, filename: `base64_${mode}.txt` });
        } catch (e) { alert("Invalid input for " + mode); }
    };
    return (
        <div className="card p-20 glass-card">
            <textarea className="pill font-mono mb-15" rows="5" value={input} onChange={e => setInput(e.target.value)} placeholder="Enter text..." />
            <div className="flex-gap">
                <button className="btn-primary flex-1" onClick={() => process('encode')}>Encode</button>
                <button className="pill flex-1" onClick={() => process('decode')}>Decode</button>
            </div>
        </div>
    );
};

const UrlTool = ({ onResultChange }) => {
    const [input, setInput] = useState('');
    const encode = () => onResultChange({ text: encodeURIComponent(input) });
    const decode = () => { try { onResultChange({ text: decodeURIComponent(input) }); } catch(e) { alert("Invalid URI"); } };
    return (
        <div className="card p-20 glass-card">
            <textarea className="pill font-mono mb-15" rows="5" value={input} onChange={e => setInput(e.target.value)} placeholder="URL or text..." />
            <div className="flex-gap">
                <button className="btn-primary flex-1" onClick={encode}>Encode</button>
                <button className="pill flex-1" onClick={decode}>Decode</button>
            </div>
        </div>
    );
};

const YamlConverter = ({ onResultChange }) => {
    const [val, setVal] = useState('');
    const convert = () => {
        try {
            if (val.trim().startsWith('{') || val.trim().startsWith('[')) {
                const obj = JSON.parse(val);
                const toYaml = (o, indent = '') => {
                    let yaml = '';
                    for (let key in o) {
                        if (typeof o[key] === 'object' && o[key] !== null) {
                            yaml += `${indent}${key}:\n${toYaml(o[key], indent + '  ')}`;
                        } else {
                            yaml += `${indent}${key}: ${o[key]}\n`;
                        }
                    }
                    return yaml;
                };
                onResultChange({ text: toYaml(obj), filename: 'converted.yaml' });
            } else {
                const lines = val.split('\n');
                const obj = {};
                lines.forEach(line => {
                    const parts = line.split(':');
                    if (parts.length >= 2) obj[parts[0].trim()] = parts.slice(1).join(':').trim();
                });
                onResultChange({ text: JSON.stringify(obj, null, 2), filename: 'converted.json' });
            }
        } catch(e) { alert("Invalid format: " + e.message); }
    };
    return (
        <div className="card p-20 glass-card">
            <textarea className="pill font-mono mb-15" rows="8" value={val} onChange={e=>setVal(e.target.value)} placeholder="JSON or basic YAML..." />
            <button className="btn-primary w-full" onClick={convert}>Convert (Basic)</button>
        </div>
    );
};

const XmlJsonConverter = ({ onResultChange }) => {
    const [val, setVal] = useState('');
    const convert = (mode) => {
        try {
            if (mode === 'xml2json') {
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(val, "text/xml");
                const toJson = (node) => {
                    const obj = {};
                    if (node.nodeType === 1) {
                        if (node.attributes.length > 0) {
                            obj["@attributes"] = {};
                            for (let i = 0; i < node.attributes.length; i++) {
                                const attr = node.attributes.item(i);
                                obj["@attributes"][attr.nodeName] = attr.nodeValue;
                            }
                        }
                    } else if (node.nodeType === 3) {
                        return node.nodeValue.trim();
                    }
                    if (node.hasChildNodes()) {
                        for (let i = 0; i < node.childNodes.length; i++) {
                            const item = node.childNodes.item(i);
                            const nodeName = item.nodeName;
                            const res = toJson(item);
                            if (res === "" && item.nodeType === 3) continue;
                            if (typeof obj[nodeName] === "undefined") {
                                obj[nodeName] = res;
                            } else {
                                if (!Array.isArray(obj[nodeName])) obj[nodeName] = [obj[nodeName]];
                                obj[nodeName].push(res);
                            }
                        }
                    }
                    return Object.keys(obj).length === 0 ? "" : obj;
                };
                const result = toJson(xmlDoc.documentElement);
                onResultChange({ text: JSON.stringify(result, null, 2), filename: 'converted.json' });
            } else {
                const obj = JSON.parse(val);
                const toXml = (o, name) => {
                    let xml = `<${name}>`;
                    for (let key in o) {
                        if (Array.isArray(o[key])) o[key].forEach(item => xml += toXml(item, key));
                        else if (typeof o[key] === 'object' && o[key] !== null) xml += toXml(o[key], key);
                        else xml += `<${key}>${o[key]}</${key}>`;
                    }
                    xml += `</${name}>`;
                    return xml;
                };
                onResultChange({ text: toXml(obj, 'root'), filename: 'converted.xml' });
            }
        } catch(e) { alert("Conversion failed: " + e.message); }
    };
    return (
        <div className="card p-20 glass-card">
            <textarea className="pill font-mono mb-15" rows="8" value={val} onChange={e=>setVal(e.target.value)} placeholder="XML or JSON..." />
            <div className="flex-gap">
                <button className="btn-primary flex-1" onClick={() => convert('xml2json')}>XML to JSON</button>
                <button className="pill flex-1" onClick={() => convert('json2xml')}>JSON to XML</button>
            </div>
        </div>
    );
};

const XmlFormatter = ({ onResultChange }) => {
    const [xml, setXml] = useState('');
    const format = () => {
        let formatted = '', indent= '';
        const nodes = xml.replace(/>\s*</g, '><').split(/(?=<)|(?<=>)/);
        nodes.forEach(node => {
            if (node.startsWith('</')) indent = indent.substring(2);
            if (node.trim()) formatted += indent + node + '\r\n';
            if (node.startsWith('<') && !node.startsWith('</') && !node.endsWith('/>') && !node.startsWith('<?')) indent += '  ';
        });
        onResultChange({ text: formatted.trim(), filename: 'formatted.xml' });
    };
    return (
        <div className="card p-20 glass-card">
            <textarea className="pill font-mono mb-15" rows="8" value={xml} onChange={e=>setXml(e.target.value)} placeholder="<xml>...</xml>" />
            <button className="btn-primary w-full" onClick={format}>Format XML</button>
        </div>
    );
};

const JsonToTs = ({ onResultChange }) => {
    const [json, setJson] = useState('');
    const generate = () => {
        try {
            const obj = JSON.parse(json);
            const getType = (v) => {
                if (Array.isArray(v)) return v.length > 0 ? `${getType(v[0])}[]` : 'any[]';
                if (v === null) return 'any';
                if (typeof v === 'object') return 'Record<string, any>';
                return typeof v;
            };
            let ts = "interface RootObject {\n";
            Object.keys(obj).forEach(key => {
                ts += `  ${key}: ${getType(obj[key])};\n`;
            });
            ts += "}";
            onResultChange({ text: ts, filename: 'types.ts' });
        } catch(e) { alert("Invalid JSON"); }
    };
    return (
        <div className="card p-20 glass-card">
            <textarea className="pill font-mono mb-15" rows="8" value={json} onChange={e=>setJson(e.target.value)} placeholder='{"id": 1}' />
            <button className="btn-primary w-full" onClick={generate}>Generate TypeScript</button>
        </div>
    );
};

const CronHelper = ({ onResultChange }) => {
    const [exp, setExp] = useState('* * * * *');
    const [desc, setDesc] = useState('Runs every minute');
    const update = (v) => {
        setExp(v);
        // Simple mock description
        if (v === '0 0 * * *') setDesc('Daily at midnight');
        else if (v === '*/5 * * * *') setDesc('Every 5 minutes');
        else setDesc('Custom schedule');
        onResultChange({ text: `Cron: ${v}\nDesc: ${desc}` });
    };
    return (
        <div className="card p-20 glass-card text-center">
            <input className="pill text-center h3 mb-10 w-full" value={exp} onChange={e=>update(e.target.value)} />
            <div className="opacity-6 mb-15">{desc}</div>
            <div className="pill-group" style={{justifyContent: 'center'}}>
                <button className="pill" onClick={()=>update('0 0 * * *')}>Daily</button>
                <button className="pill" onClick={()=>update('*/5 * * * *')}>5 Min</button>
                <button className="pill" onClick={()=>update('0 * * * *')}>Hourly</button>
            </div>
        </div>
    );
};

const ColorPicker = ({ onResultChange }) => {
    const [color, setColor] = useState('#00ff00');
    useEffect(() => {
        onResultChange({ text: `HEX: ${color}\nRGB: ${hexToRgb(color)}` });
    }, [color]);
    const hexToRgb = (hex) => {
        const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
        return `rgb(${r}, ${g}, ${b})`;
    };
    return (
        <div className="card p-20 glass-card text-center">
            <input type="color" className="w-full mb-15" style={{height: '100px', border: 'none', borderRadius: '12px'}} value={color} onChange={e=>setColor(e.target.value)} />
            <div className="h3 font-mono">{color.toUpperCase()}</div>
            <div className="opacity-6">{hexToRgb(color)}</div>
        </div>
    );
};

const Minifier = ({ onResultChange }) => {
    const [input, setInput] = useState('');
    const [mode, setMode] = useState('json');
    const minify = () => {
        let res = input;
        if (mode === 'json') { try { res = JSON.stringify(JSON.parse(input)); } catch(e) {} }
        else if (mode === 'css') res = input.replace(/\/\*[\s\S]*?\*\/|(?:\s+|(\s*\{\s*|\s*\}\s*|\s*:\s*|\s*;\s*))/g, '$1');
        else res = input.replace(/\s+/g, ' ').trim();
        onResultChange({ text: res, filename: `minified.${mode}` });
    };
    return (
        <div className="card p-20 glass-card">
            <div className="flex-gap mb-10">
                <select className="pill flex-1" value={mode} onChange={e=>setMode(e.target.value)}>
                    <option value="json">JSON</option>
                    <option value="css">CSS</option>
                    <option value="html">HTML</option>
                </select>
                <button className="btn-primary flex-1" onClick={minify}>Minify</button>
            </div>
            <textarea className="pill font-mono" rows="8" value={input} onChange={e=>setInput(e.target.value)} />
        </div>
    );
};

const JwtDecoder = ({ onResultChange }) => {
    const [jwt, setJwt] = useState('');
    const decode = () => {
        try {
            const parts = jwt.split('.');
            if (parts.length !== 3) throw new Error("Invalid JWT");
            const header = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')));
            const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
            onResultChange({ text: JSON.stringify({ header, payload }, null, 2), filename: 'jwt_decoded.json' });
        } catch (e) { alert("Invalid JWT format"); }
    };
    return (
        <div className="card p-20 glass-card">
            <textarea className="pill font-mono mb-15" rows="5" value={jwt} onChange={e => setJwt(e.target.value)} placeholder="Paste JWT here..." />
            <button className="btn-primary w-full" onClick={decode}>Decode JWT</button>
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
    { id: 'regex', label: 'Regex Tester' },
    { id: 'base64', label: 'Base64' },
    { id: 'jwt', label: 'JWT Decoder' },
    { id: 'cron', label: 'Cron Helper' },
    { id: 'url', label: 'URL Tool' },
    { id: 'yaml', label: 'YAML Conv' },
    { id: 'minifier', label: 'Minifier' },
    { id: 'xml-json', label: 'XML ↔ JSON' },
    { id: 'xml-fmt', label: 'XML Formatter' },
    { id: 'json-ts', label: 'JSON to TS' },
    { id: 'color', label: 'Color Picker' }
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
        else if (toolId === 'base64') setActiveTab('base64');
        else if (toolId === 'jwt-decoder') setActiveTab('jwt');
        else if (toolId === 'cron-helper') setActiveTab('cron');
        else if (toolId === 'url-tool') setActiveTab('url');
        else if (toolId === 'yaml-conv') setActiveTab('yaml');
        else if (toolId === 'minifier') setActiveTab('minifier');
        else if (toolId === 'xml-json') setActiveTab('xml-json');
        else if (toolId === 'xml-formatter') setActiveTab('xml-fmt');
        else if (toolId === 'json-to-ts') setActiveTab('json-ts');
        else if (toolId === 'color-picker') setActiveTab('color');
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
        {activeTab === 'base64' && <Base64Tool onResultChange={onResultChange} />}
        {activeTab === 'jwt' && <JwtDecoder onResultChange={onResultChange} />}
        {activeTab === 'cron' && <CronHelper onResultChange={onResultChange} />}
        {activeTab === 'url' && <UrlTool onResultChange={onResultChange} />}
        {activeTab === 'yaml' && <YamlConverter onResultChange={onResultChange} />}
        {activeTab === 'minifier' && <Minifier onResultChange={onResultChange} />}
        {activeTab === 'xml-json' && <XmlJsonConverter onResultChange={onResultChange} />}
        {activeTab === 'xml-fmt' && <XmlFormatter onResultChange={onResultChange} />}
        {activeTab === 'json-ts' && <JsonToTs onResultChange={onResultChange} />}
        {activeTab === 'color' && <ColorPicker onResultChange={onResultChange} />}
      </div>
    </div>
  );
};

export default DevTools;
