import React, { useState, useEffect } from 'react';
import { diffLines } from 'diff';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

const DevTools = ({ toolId, onResultChange }) => {
  const [activeTab, setActiveTab] = useState('json-fmt');

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
        'yaml-json': 'yaml'
      };
      if (mapping[toolId]) setActiveTab(mapping[toolId]); else if (tabs.length > 0) setActiveTab(tabs[0].id);
    }
  }, [toolId]);

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
    { id: 'url', label: 'URL Tool' }
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

      {activeTab === 'json-fmt' && <JsonFormatter onResultChange={onResultChange} />}
      {activeTab === 'jwt' && <JwtDecoder onResultChange={onResultChange} />}
      {activeTab === 'base64' && <Base64Tool onResultChange={onResultChange} />}
      {activeTab === 'diff' && <DiffViewer onResultChange={onResultChange} />}
      {activeTab === 'markdown' && <MarkdownPreview onResultChange={onResultChange} />}
      {activeTab === 'uuid' && <UuidGenerator onResultChange={onResultChange} />}
      {activeTab === 'url' && <UrlTool onResultChange={onResultChange} />}
      {['cron', 'sql', 'regex'].includes(activeTab) && (
          <div className="text-center p-20 card opacity-6">
              <span className="material-icons mb-10" style={{fontSize: '2rem'}}>terminal</span>
              <div>This developer tool is being refined.</div>
          </div>
      )}
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

export default DevTools;
