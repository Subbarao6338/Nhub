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
    { id: 'xml-json', label: 'XML ↔ JSON' }
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
        'xml-json': 'xml-json'
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
    const minify = () => {
        const res = input.replace(/\s+/g, ' ').replace(/\/\*.*?\*\//g, '').trim();
        setInput(res);
        onResultChange({ text: res, filename: 'minified.txt' });
    };
    return (
        <div className="card p-15 grid gap-10">
            <textarea className="pill font-mono" rows="8" value={input} onChange={e=>setInput(e.target.value)} placeholder="CSS/JS code..." />
            <button className="btn-primary" onClick={minify}>Basic Minify</button>
        </div>
    );
};

const JsonFormatter = ({ onResultChange }) => {
    const [val, setVal] = useState('{"test": "data", "array": [1,2,3]}');
    const [error, setError] = useState('');
    const format = () => {
        try {
            const res = JSON.stringify(JSON.parse(val), null, 2);
            setVal(res);
            setError('');
            onResultChange({ text: res, filename: 'formatted.json' });
        } catch(e) { setError('Invalid JSON'); }
    };
    return (
        <div className="grid gap-15 card p-15">
            <textarea className="pill font-mono" rows="8" value={val} onChange={e=>setVal(e.target.value)} />
            <button className="btn-primary" onClick={format}>Format JSON</button>
            {error && <div className="text-center" style={{color: 'var(--danger)'}}>{error}</div>}
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
                <textarea className="pill font-mono" rows="5" placeholder="Old Text" value={oldText} onChange={e=>setOldText(e.target.value)} />
                <textarea className="pill font-mono" rows="5" placeholder="New Text" value={newText} onChange={e=>setNewText(e.target.value)} />
            </div>
            <div className="card p-15 font-mono" style={{fontSize: '0.8rem', whiteSpace: 'pre-wrap'}}>
                {diff.map((part, i) => (
                    <div key={i} style={{
                        backgroundColor: part.added ? 'rgba(var(--green-rgb), 0.2)' : part.removed ? 'rgba(var(--red-rgb), 0.2)' : 'transparent',
                        color: part.added ? 'var(--green)' : part.removed ? 'var(--red)' : 'inherit'
                    }}>
                        {part.value}
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
        <div className="grid gap-15">
            <textarea className="pill font-mono" rows="6" value={md} onChange={e=>setMd(e.target.value)} />
            <div className="card p-20 about-content" dangerouslySetInnerHTML={{ __html: html }} />
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
        <div className="grid gap-15 card p-20 text-center">
            <div className="font-mono font-bold" style={{fontSize: '1.2rem'}}>{uuid || 'Click to Generate'}</div>
            <button className="btn-primary" onClick={gen}>Generate v4 UUID</button>
        </div>
    );
};

const UrlTool = ({ onResultChange }) => {
    const [val, setVal] = useState('https://example.com?q=hello world');
    const encode = () => { const res = encodeURIComponent(val); setVal(res); onResultChange({text: res}); };
    const decode = () => { const res = decodeURIComponent(val); setVal(res); onResultChange({text: res}); };
    return (
        <div className="grid gap-15 card p-15">
            <textarea className="pill font-mono" rows="4" value={val} onChange={e=>setVal(e.target.value)} />
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
        <div className="grid gap-15 card p-15">
            <textarea className="pill font-mono" rows="3" placeholder="JWT Token..." value={input} onChange={e=>decode(e.target.value)} />
            {payload && <pre className="tool-result font-mono" style={{fontSize: '0.7rem', overflow: 'auto'}}>{JSON.stringify(payload, null, 2)}</pre>}
        </div>
    );
};

const Base64Tool = ({ onResultChange }) => {
    const [val, setVal] = useState('');
    return (
        <div className="grid gap-15 card p-15">
            <textarea className="pill font-mono" rows="4" value={val} onChange={e=>setVal(e.target.value)} />
            <div className="flex-gap">
                <button className="btn-primary flex-1" onClick={()=>{try{const res=btoa(val); setVal(res); onResultChange({text:res});}catch(e){}}}>Encode</button>
                <button className="pill flex-1" onClick={()=>{try{const res=atob(val); setVal(res); onResultChange({text:res});}catch(e){}}}>Decode</button>
            </div>
        </div>
    );
};

const SqlFormatter = ({ onResultChange }) => {
    const [sql, setSql] = useState("SELECT * FROM users WHERE id = 1 AND status = 'active' ORDER BY created_at DESC");
    const format = () => {
        let res = sql.replace(/\s+/g, ' ');
        const keywords = ['SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'ORDER BY', 'GROUP BY', 'LIMIT', 'JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'HAVING', 'VALUES', 'UPDATE', 'SET', 'INSERT INTO', 'DELETE FROM'];
        keywords.forEach(key => {
            const regex = new RegExp(`\\s${key}\\s`, 'gi');
            res = res.replace(regex, `\n${key} `);
        });
        setSql(res.trim());
        onResultChange({ text: res.trim(), filename: 'formatted.sql' });
    };
    return (
        <div className="grid gap-15 card p-15">
            <textarea className="pill font-mono" rows="8" value={sql} onChange={e=>setSql(e.target.value)} />
            <button className="btn-primary" onClick={format}>Format SQL</button>
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
        <div className="grid gap-15 card p-15">
            <div className="flex-gap">
                <input className="pill font-mono flex-1" value={regex} onChange={e=>setRegex(e.target.value)} placeholder="Regex pattern" />
                <input className="pill font-mono" style={{width: '60px'}} value={flags} onChange={e=>setFlags(e.target.value)} placeholder="flags" />
            </div>
            <textarea className="pill font-mono" rows="4" value={text} onChange={e=>setText(e.target.value)} placeholder="Test text" />
            <div className="tool-result">
                <div className="font-bold mb-5">Matches ({matches.length}):</div>
                <div className="flex-gap flex-wrap">
                    {matches.map((m, i) => (
                        <span key={i} className="pill" style={{fontSize: '0.8rem', background: 'var(--primary-glow)'}}>{m[0]}</span>
                    ))}
                </div>
            </div>
        </div>
    );
};

const CodeConverter = ({ onResultChange }) => {
    const [val, setVal] = useState('{"name": "Nature", "active": true}');
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
        } catch(e) { alert("Conversion failed"); }
    };

    return (
        <div className="grid gap-15 card p-15">
            <div className="flex-gap">
                <select className="pill flex-1" value={from} onChange={e=>setFrom(e.target.value)}>
                    <option value="json">JSON</option>
                    <option value="yaml">YAML</option>
                </select>
                <span className="material-icons flex-center">arrow_forward</span>
                <select className="pill flex-1" value={to} onChange={e=>setTo(e.target.value)}>
                    <option value="yaml">YAML</option>
                    <option value="json">JSON</option>
                </select>
            </div>
            <textarea className="pill font-mono" rows="8" value={val} onChange={e=>setVal(e.target.value)} />
            <button className="btn-primary" onClick={convert}>Convert</button>
        </div>
    );
};

const CronHelper = () => {
    const [cron, setCron] = useState('0 0 * * *');
    const explain = useMemo(() => {
        const parts = cron.split(' ');
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
        <div className="grid gap-15 card p-15">
            <input className="pill font-mono" value={cron} onChange={e=>setCron(e.target.value)} placeholder="* * * * *" />
            <div className="tool-result text-center">
                <div className="opacity-6 small mb-5">Human Readable:</div>
                <div className="font-bold">{explain}</div>
            </div>
        </div>
    );
};

export default DevTools;
