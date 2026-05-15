import React, { useState, useEffect, useMemo } from 'react';
import { diffLines } from 'diff';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import API_BASE from '../../api';

const DevTools = ({ toolId, onResultChange, onSubtoolChange }) => {
  const tabs = [
    { id: 'json-fmt', label: 'JSON Formatter' },
    { id: 'jwt', label: 'JWT Decoder' },
    { id: 'cron', label: 'Cron Helper' },
    { id: 'sql', label: 'SQL Formatter' },
    { id: 'regex', label: 'Regex Tester' },
    { id: 'base64', label: 'Base64' },
    { id: 'diff', label: 'Diff Viewer' },
    { id: 'markdown', label: 'Markdown' },
    { id: 'uuid', label: 'UUID Gen' },
    { id: 'url', label: 'URL Tool' },
    { id: 'yaml', label: 'YAML Conv' },
    { id: 'minify', label: 'Minifier' },
    { id: 'xml-json', label: 'XML ↔ JSON' },
    { id: 'xml-fmt', label: 'XML Formatter' },
    { id: 'json-ts', label: 'JSON to TS' }
  ].sort((a, b) => a.label.localeCompare(b.label));

  const [activeTab, setActiveTab] = useState('json-fmt');

  useEffect(() => {
    const current = tabs.find(t => t.id === activeTab);
    if (current && onSubtoolChange) onSubtoolChange(current.label);
  }, [activeTab]);

  useEffect(() => {
    if (toolId) {
      const mapping = {
        'json-formatter': 'json-fmt',
        'json-validator': 'json-fmt',
        'jwt-decoder': 'jwt',
        'cron-helper': 'cron',
        'sql-formatter': 'sql',
        'regex-tester': 'regex',
        'base64': 'base64',
        'diff-viewer': 'diff',
        'markdown-preview': 'markdown',
        'uuid-gen': 'uuid',
        'url-decode': 'url',
        'yaml-json': 'yaml',
        'minify': 'minify',
        'xml-json': 'xml-json',
        'json-ts': 'json-ts'
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

      {activeTab === 'json-fmt' && <JsonFormatter onResultChange={onResultChange} />}
      {activeTab === 'jwt' && <JwtDecoder onResultChange={onResultChange} />}
      {activeTab === 'base64' && <Base64Tool onResultChange={onResultChange} />}
      {activeTab === 'diff' && <DiffViewer onResultChange={onResultChange} />}
      {activeTab === 'markdown' && <MarkdownPreview onResultChange={onResultChange} />}
      {activeTab === 'uuid' && <UuidGenerator onResultChange={onResultChange} />}
      {activeTab === 'url' && <UrlTool onResultChange={onResultChange} />}
      {activeTab === 'sql' && <SqlFormatter onResultChange={onResultChange} />}
      {activeTab === 'regex' && <RegexTester onResultChange={onResultChange} />}
      {activeTab === 'cron' && <CronHelper onResultChange={onResultChange} />}
      {activeTab === 'yaml' && <CodeConverter onResultChange={onResultChange} />}
      {activeTab === 'minify' && <MinifierTool onResultChange={onResultChange} />}
      {activeTab === 'xml-json' && <XmlJsonConverter onResultChange={onResultChange} />}
      {activeTab === 'xml-fmt' && <XmlFormatter onResultChange={onResultChange} />}
      {activeTab === 'json-ts' && <JsonToTs onResultChange={onResultChange} />}
    </div>
  );
};

const JsonToTs = ({ onResultChange }) => {
    const [json, setJson] = useState('{\n  "id": 1,\n  "name": "Nature Tool",\n  "active": true,\n  "tags": ["web", "utility"]\n}');
    const res = useMemo(() => {
        try {
            const obj = JSON.parse(json);
            let ts = "interface RootObject {\n";
            Object.entries(obj).forEach(([key, val]) => {
                let type = typeof val;
                if (Array.isArray(val)) {
                    type = (val.length > 0 ? typeof val[0] : "any") + "[]";
                } else if (val === null) {
                    type = "any";
                }
                ts += `  ${key}: ${type};\n`;
            });
            ts += "}";
            return ts;
        } catch(e) { return "Invalid JSON"; }
    }, [json]);

    useEffect(() => {
        if (res !== "Invalid JSON") {
            onResultChange({ text: res, filename: 'interface.ts' });
        } else {
            onResultChange(null);
        }
    }, [res, onResultChange]);

    return (
        <div className="grid gap-15">
            <textarea className="pill font-mono" rows="8" value={json} onChange={e=>setJson(e.target.value)} />
            <div className="card p-20 glass-card">
                <pre className="font-mono" style={{fontSize: '0.85rem'}}>{res}</pre>
            </div>
        </div>
    );
};

const XmlFormatter = ({ onResultChange }) => {
    const [xml, setXml] = useState('<root><item id="1">Hello</item><item id="2">World</item></root>');
    const res = useMemo(() => {
        let formatted = '';
        let indent = 0;
        const tab = '  ';
        const parts = xml.split(/(<[^>]+>)/g).filter(p => p.trim());

        parts.forEach(part => {
            if (part.startsWith('</')) {
                indent--;
                formatted += tab.repeat(indent) + part + '\n';
            } else if (part.startsWith('<') && !part.endsWith('/>') && !part.startsWith('<?')) {
                formatted += tab.repeat(indent) + part + '\n';
                indent++;
            } else {
                formatted += tab.repeat(indent) + part + '\n';
            }
        });

        return formatted.trim();
    }, [xml]);

    useEffect(() => {
        onResultChange({ text: res, filename: 'formatted.xml' });
    }, [res, onResultChange]);

    return (
        <div className="card p-15 grid gap-10">
            <textarea className="pill font-mono" rows="8" value={xml} onChange={e=>setXml(e.target.value)} />
            <div className="tool-result">
                <pre style={{fontSize: '0.8rem', whiteSpace: 'pre-wrap'}}>{res}</pre>
            </div>
        </div>
    );
};

const XmlJsonConverter = ({ onResultChange }) => {
    const [val, setVal] = useState('<root><item>Hello</item></root>');
    const convert = () => {
        // Simple mock implementation for demo
        if (val.startsWith('<')) {
            const res = JSON.stringify({ root: "Converted from XML" }, null, 2);
            setVal(res);
            onResultChange({ text: res, filename: 'converted.json' });
        } else {
            const res = '<root><message>Converted from JSON</message></root>';
            setVal(res);
            onResultChange({ text: res, filename: 'converted.xml' });
        }
    };
    return (
        <div className="card p-15 grid gap-10">
            <textarea className="pill font-mono" rows="8" value={val} onChange={e=>setVal(e.target.value)} />
            <button className="btn-primary" onClick={convert}>Convert (XML ↔ JSON)</button>
        </div>
    );
};

const MinifierTool = ({ onResultChange }) => {
    const [input, setInput] = useState('');
    const res = useMemo(() => {
        if (!input) return '';
        let min = input;
        min = min.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '$1');
        min = min.replace(/\s+([{}|:;,])\s+/g, '$1');
        min = min.replace(/\s+/g, ' ');
        return min.trim();
    }, [input]);

    useEffect(() => {
        if (res) onResultChange({ text: res, filename: 'minified.txt' });
    }, [res, onResultChange]);

    return (
        <div className="card p-15 grid gap-10">
            <textarea className="pill font-mono" rows="8" value={input} onChange={e=>setInput(e.target.value)} placeholder="CSS/JS code..." />
            {res && <div className="tool-result font-mono text-xs break-all">{res}</div>}
        </div>
    );
};

const JsonFormatter = ({ onResultChange }) => {
    const [val, setVal] = useState('{"test": "data", "array": [1,2,3]}');
    const [error, setError] = useState('');

    const res = useMemo(() => {
        try {
            return JSON.stringify(JSON.parse(val), null, 2);
        } catch(e) { return null; }
    }, [val]);

    useEffect(() => {
        if (res) {
            setError('');
            onResultChange({ text: res, filename: 'formatted.json' });
        } else {
            setError('Invalid JSON');
            onResultChange(null);
        }
    }, [res, onResultChange]);

    return (
        <div className="grid gap-15 card p-15">
            <textarea className="pill font-mono" rows="8" value={val} onChange={e=>setVal(e.target.value)} />
            {error && <div className="text-center" style={{color: 'var(--danger)'}}>{error}</div>}
            {!error && <div className="tool-result"><pre style={{fontSize: '0.85rem'}}>{res}</pre></div>}
        </div>
    );
};

const DiffViewer = ({ onResultChange }) => {
    const [oldText, setOldText] = useState('Hello World\nLine 2');
    const [newText, setNewText] = useState('Hello Nature\nLine 2\nLine 3');
    const diff = diffLines(oldText, newText);

    return (
        <div className="grid gap-15">
            <div className="grid grid-2-cols gap-10">
                <div className="flex-column gap-5">
                    <label className="smallest uppercase font-bold opacity-6">Old Version</label>
                    <textarea className="pill font-mono" rows="8" value={oldText} onChange={e=>setOldText(e.target.value)} />
                </div>
                <div className="flex-column gap-5">
                    <label className="smallest uppercase font-bold opacity-6">New Version</label>
                    <textarea className="pill font-mono" rows="8" value={newText} onChange={e=>setNewText(e.target.value)} />
                </div>
            </div>
            <div className="grid grid-2-cols gap-10">
                <div className="card p-15 font-mono glass-card overflow-auto" style={{fontSize: '0.75rem', height: '300px'}}>
                    <div className="mb-10 opacity-5 uppercase smallest">Old Text (Removed in red)</div>
                    {diff.map((part, i) => !part.added && (
                        <div key={i} style={{
                            backgroundColor: part.removed ? 'rgba(var(--red-rgb), 0.1)' : 'transparent',
                            color: part.removed ? 'var(--danger)' : 'inherit',
                            textDecoration: part.removed ? 'line-through' : 'none'
                        }}>
                            {part.value}
                        </div>
                    ))}
                </div>
                <div className="card p-15 font-mono glass-card overflow-auto" style={{fontSize: '0.75rem', height: '300px'}}>
                    <div className="mb-10 opacity-5 uppercase smallest">New Text (Added in green)</div>
                    {diff.map((part, i) => !part.removed && (
                        <div key={i} style={{
                            backgroundColor: part.added ? 'rgba(var(--green-rgb), 0.1)' : 'transparent',
                            color: part.added ? 'var(--nature-moss)' : 'inherit'
                        }}>
                            {part.value}
                        </div>
                    ))}
                </div>
            </div>
            <div className="card p-20 font-mono glass-card" style={{fontSize: '0.85rem', whiteSpace: 'pre-wrap'}}>
                <div className="mb-10 opacity-5 uppercase smallest">Unified Diff</div>
                {diff.map((part, i) => (
                    <div key={i} style={{
                        backgroundColor: part.added ? 'rgba(var(--green-rgb), 0.15)' : part.removed ? 'rgba(var(--red-rgb), 0.15)' : 'transparent',
                        color: part.added ? 'var(--nature-moss)' : part.removed ? 'var(--danger)' : 'inherit',
                        padding: '2px 5px',
                        borderLeft: part.added ? '4px solid var(--nature-moss)' : part.removed ? '4px solid var(--danger)' : 'none'
                    }}>
                        {part.added ? '+ ' : part.removed ? '- ' : '  '}{part.value}
                    </div>
                ))}
            </div>
        </div>
    );
};

const MarkdownPreview = ({ onResultChange }) => {
    const [md, setMd] = useState('# Markdown Preview\n\n- Item 1\n- Item 2\n\n**Bold Text**');
    const html = useMemo(() => DOMPurify.sanitize(marked.parse(md)), [md]);
    return (
        <div className="grid grid-2-cols gap-15">
            <textarea className="pill font-mono" rows="15" value={md} onChange={e=>setMd(e.target.value)} />
            <div className="card p-20 about-content glass-card overflow-auto" style={{height: '400px'}} dangerouslySetInnerHTML={{ __html: html }} />
        </div>
    );
};

const UuidGenerator = ({ onResultChange }) => {
    const [uuid, setUuid] = useState('');
    const gen = () => {
        const res = crypto.randomUUID();
        setUuid(res);
        onResultChange({ text: res });
    };
    return (
        <div className="grid gap-15 card p-30 text-center">
            <div className="font-mono font-bold color-primary" style={{fontSize: '1.8rem', letterSpacing: '0.05em'}}>{uuid || '---'}</div>
            <button className="btn-primary" onClick={gen}>Generate v4 UUID</button>
        </div>
    );
};

const UrlTool = ({ onResultChange }) => {
    const [val, setVal] = useState('https://example.com?q=hello nature');
    const encode = () => { const res = encodeURIComponent(val); setVal(res); onResultChange({text: res}); };
    const decode = () => { const res = decodeURIComponent(val); setVal(res); onResultChange({text: res}); };
    return (
        <div className="grid gap-15 card p-20">
            <textarea className="pill font-mono" rows="5" value={val} onChange={e=>setVal(e.target.value)} />
            <div className="flex-gap">
                <button className="btn-primary flex-1" onClick={encode}>URL Encode</button>
                <button className="pill flex-1" onClick={decode}>URL Decode</button>
            </div>
        </div>
    );
};

const JwtDecoder = ({ onResultChange }) => {
    const [input, setInput] = useState('');
    const [payload, setPayload] = useState(null);
    const decode = (val) => {
        setInput(val);
        try {
            const p = JSON.parse(atob(val.split('.')[1]));
            setPayload(p);
            onResultChange({ text: JSON.stringify(p, null, 2), filename: 'jwt.json' });
        } catch(e) { setPayload(null); }
    };
    return (
        <div className="grid gap-15 card p-20">
            <textarea className="pill font-mono" rows="4" placeholder="Paste JWT Token here..." value={input} onChange={e=>decode(e.target.value)} />
            {payload ? (
                <div className="tool-result">
                    <pre className="font-mono" style={{fontSize: '0.8rem', overflow: 'auto'}}>{JSON.stringify(payload, null, 2)}</pre>
                </div>
            ) : input && <div className="text-center color-danger small">Invalid JWT format</div>}
        </div>
    );
};

const Base64Tool = ({ onResultChange }) => {
    const [val, setVal] = useState('');
    return (
        <div className="grid gap-15 card p-20">
            <textarea className="pill font-mono" rows="6" value={val} onChange={e=>setVal(e.target.value)} placeholder="Text or Base64..." />
            <div className="flex-gap">
                <button className="btn-primary flex-1" onClick={()=>{try{const res=btoa(val); setVal(res); onResultChange({text:res});}catch(e){}}}>Encode</button>
                <button className="pill flex-1" onClick={()=>{try{const res=atob(val); setVal(res); onResultChange({text:res});}catch(e){}}}>Decode</button>
            </div>
        </div>
    );
};

const SqlFormatter = ({ onResultChange }) => {
    const [sql, setSql] = useState("SELECT * FROM users WHERE id = 1 AND status = 'active' ORDER BY created_at DESC");
    const res = useMemo(() => {
        let formatted = sql.replace(/\s+/g, ' ');
        const keywords = ['SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'ORDER BY', 'GROUP BY', 'LIMIT', 'JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'HAVING', 'VALUES', 'UPDATE', 'SET', 'INSERT INTO', 'DELETE FROM'];
        keywords.forEach(key => {
            const regex = new RegExp(`\\s${key}\\s`, 'gi');
            formatted = formatted.replace(regex, `\n${key} `);
        });
        return formatted.trim();
    }, [sql]);

    useEffect(() => {
        onResultChange({ text: res, filename: 'formatted.sql' });
    }, [res, onResultChange]);

    return (
        <div className="grid gap-15 card p-20">
            <textarea className="pill font-mono" rows="8" value={sql} onChange={e=>setSql(e.target.value)} />
            <div className="tool-result">
                <pre style={{fontSize: '0.85rem', whiteSpace: 'pre-wrap'}}>{res}</pre>
            </div>
        </div>
    );
};

const RegexTester = () => {
    const [regex, setRegex] = useState('\\d+');
    const [flags, setFlags] = useState('g');
    const [text, setText] = useState('There are 123 apples and 456 oranges.');
    const matches = useMemo(() => {
        try {
            const re = new RegExp(regex, flags);
            return [...text.matchAll(re)];
        } catch(e) { return []; }
    }, [regex, flags, text]);

    return (
        <div className="grid gap-15 card p-20">
            <div className="flex-gap">
                <div className="form-group flex-1">
                    <label>Regex Pattern</label>
                    <input className="pill font-mono" value={regex} onChange={e=>setRegex(e.target.value)} />
                </div>
                <div className="form-group" style={{width: '80px'}}>
                    <label>Flags</label>
                    <input className="pill font-mono" value={flags} onChange={e=>setFlags(e.target.value)} />
                </div>
            </div>
            <div className="form-group">
                <label>Test Text</label>
                <textarea className="pill font-mono" rows="4" value={text} onChange={e=>setText(e.target.value)} />
            </div>
            <div className="tool-result">
                <div className="font-bold mb-10 opacity-6 smallest uppercase">Matches ({matches.length})</div>
                <div className="flex-gap flex-wrap">
                    {matches.length > 0 ? matches.map((m, i) => (
                        <span key={i} className="pill" style={{fontSize: '0.8rem', background: 'var(--primary-glow)', color: 'var(--primary)'}}>{m[0]}</span>
                    )) : <span className="opacity-4">No matches found</span>}
                </div>
            </div>
        </div>
    );
};

const CodeConverter = ({ onResultChange }) => {
    const [val, setVal] = useState('{\n  "name": "Nature",\n  "active": true\n}');
    const [from, setFrom] = useState('json');
    const [to, setTo] = useState('yaml');

    const convert = async () => {
        try {
            const res = await fetch(`${API_BASE}/data/convert`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data: val, from_format: from, to_format: to })
            });
            const data = await res.json();
            if (data.result) {
                setVal(data.result);
                onResultChange({ text: data.result, filename: `converted.${to}` });
            }
        } catch(e) { alert("Conversion failed. Is the backend running?"); }
    };

    return (
        <div className="grid gap-15 card p-20">
            <div className="flex-center gap-15">
                <select className="pill flex-1" value={from} onChange={e=>setFrom(e.target.value)}>
                    <option value="json">JSON</option>
                    <option value="yaml">YAML</option>
                </select>
                <span className="material-icons opacity-4">swap_horiz</span>
                <select className="pill flex-1" value={to} onChange={e=>setTo(e.target.value)}>
                    <option value="yaml">YAML</option>
                    <option value="json">JSON</option>
                </select>
            </div>
            <textarea className="pill font-mono" rows="10" value={val} onChange={e=>setVal(e.target.value)} />
            <button className="btn-primary" onClick={convert}>Convert Now</button>
        </div>
    );
};

const CronHelper = () => {
    const [cron, setCron] = useState('0 0 * * *');
    const explain = useMemo(() => {
        const parts = cron.trim().split(/\s+/);
        if (parts.length !== 5) return 'Invalid cron expression (requires 5 parts)';
        const [m, h, dom, mon, dow] = parts;
        let res = 'At ';
        res += m === '*' ? 'every minute' : `minute ${m}`;
        res += h === '*' ? ' of every hour' : ` of hour ${h}`;
        res += dom === '*' ? '' : ` on day of month ${dom}`;
        res += mon === '*' ? '' : ` in month ${mon}`;
        res += dow === '*' ? '' : ` on day of week ${dow}`;
        return res;
    }, [cron]);

    return (
        <div className="grid gap-15 card p-30 text-center">
            <input className="pill font-mono text-center" style={{fontSize: '1.5rem'}} value={cron} onChange={e=>setCron(e.target.value)} placeholder="* * * * *" />
            <div className="tool-result">
                <div className="opacity-6 smallest mb-10 uppercase font-bold">Human Readable Schedule</div>
                <div className="font-bold color-primary" style={{fontSize: '1.2rem'}}>{explain}</div>
            </div>
        </div>
    );
};

export default DevTools;
