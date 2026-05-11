import React, { useState, useEffect } from 'react';

const DevTools = ({ toolId, onResultChange }) => {
  const [activeTab, setActiveTab] = useState('json-fmt');

  useEffect(() => {
    if (toolId) {
      const mapping = {
        'json-formatter': 'json-fmt',
        'json-validator': 'json-val',
        'json-to-csv': 'json-conv',
        'csv-json': 'json-conv',
        'jwt-decoder': 'jwt',
        'cron-gen': 'cron',
        'sql-format': 'sql',
        'http-client': 'http',
        'regex-tester': 'regex',
        'base64-converter': 'base64',
        'cron-desc': 'cron-desc',
        'diff-viewer': 'diff',
        'inspect': 'inspect',
        'user-scripts': 'scripts',
        'markdown-preview': 'markdown',
        'markdown-table': 'md-table',
        'uuid-gen': 'uuid',
        'url-tool': 'url',
        'barcode-gen': 'barcode',
        'random-numbers': 'random',
        'fake-data': 'fake'
      };
      if (mapping[toolId]) setActiveTab(mapping[toolId]);
    }
  }, [toolId]);

  const tabs = [
    { id: 'json-fmt', label: 'JSON Format' },
    { id: 'json-val', label: 'JSON Valid' },
    { id: 'json-conv', label: 'JSON Conv' },
    { id: 'jwt', label: 'JWT' },
    { id: 'cron', label: 'Cron' },
    { id: 'sql', label: 'SQL' },
    { id: 'http', label: 'HTTP' },
    { id: 'regex', label: 'Regex' },
    { id: 'base64', label: 'Base64' },
    { id: 'diff', label: 'Diff' },
    { id: 'markdown', label: 'Markdown' },
    { id: 'uuid', label: 'UUID' },
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

      {activeTab === 'jwt' && <JwtDecoder onResultChange={onResultChange} />}
      {activeTab === 'base64' && <Base64Tool onResultChange={onResultChange} />}
      {['json-fmt', 'json-val', 'json-conv', 'cron', 'sql', 'http', 'regex', 'diff', 'markdown', 'uuid', 'url'].includes(activeTab) && (
          <div className="text-center p-20 card opacity-6">
              <span className="material-icons mb-10" style={{fontSize: '2rem'}}>terminal</span>
              <div>This developer tool is being integrated.</div>
          </div>
      )}
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
