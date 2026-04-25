import React, { useState, useEffect } from 'react';

const DevOpsTools = ({ toolId }) => {
  const [activeTab, setActiveTab] = useState('jwt');

  useEffect(() => {
    if (toolId) {
      if (toolId === 'devops-main' || toolId === 'jwt-decoder') setActiveTab('jwt');
      else if (toolId === 'cron-gen') setActiveTab('cron');
      else if (toolId === 'sql-format') setActiveTab('sql');
      else setActiveTab(toolId);
    }
  }, [toolId]);

  return (
    <div className="tool-form">
      {!toolId && (
        <div className="pill-group mb-20 scrollable-x">
          <button className={`pill ${activeTab === 'jwt' ? 'active' : ''}`} onClick={() => setActiveTab('jwt')}>JWT Decoder</button>
          <button className={`pill ${activeTab === 'cron' ? 'active' : ''}`} onClick={() => setActiveTab('cron')}>Cron Gen</button>
          <button className={`pill ${activeTab === 'sql' ? 'active' : ''}`} onClick={() => setActiveTab('sql')}>SQL Formatter</button>
        </div>
      )}

      {activeTab === 'jwt' && <JwtDecoder />}
      {activeTab === 'cron' && <CronGenerator />}
      {activeTab === 'sql' && <SqlFormatter />}
    </div>
  );
};

const JwtDecoder = () => {
  const [token, setToken] = useState('');
  const [header, setHeader] = useState(null);
  const [payload, setPayload] = useState(null);
  const [error, setError] = useState(null);

  const decode = (val) => {
    setToken(val);
    setError(null);
    if (!val) {
      setHeader(null);
      setPayload(null);
      return;
    }
    try {
      const parts = val.split('.');
      if (parts.length !== 3) throw new Error("Invalid JWT format");
      setHeader(JSON.parse(atob(parts[0])));
      setPayload(JSON.parse(atob(parts[1])));
    } catch (e) {
      setError(e.message);
      setHeader(null);
      setPayload(null);
    }
  };

  return (
    <div className="grid gap-15">
      <textarea
        className="pill w-full"
        rows="4"
        placeholder="Paste JWT here..."
        value={token}
        onChange={e => decode(e.target.value)}
        style={{ fontFamily: 'monospace', borderRadius: '12px' }}
      />
      {error && <div className="danger p-10">{error}</div>}
      {header && (
        <div className="card p-15">
          <h3 className="font-bold mb-10">Header</h3>
          <pre className="font-mono" style={{ fontSize: '0.8rem' }}>{JSON.stringify(header, null, 2)}</pre>
        </div>
      )}
      {payload && (
        <div className="card p-15">
          <h3 className="font-bold mb-10">Payload</h3>
          <pre className="font-mono" style={{ fontSize: '0.8rem' }}>{JSON.stringify(payload, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

const CronGenerator = () => {
  const [cron, setCron] = useState('* * * * *');
  const [desc, setDesc] = useState('Every minute');

  const updateCron = (val) => {
    setCron(val);
    // Simple mock logic for description, usually requires a library like cronstrue
    setDesc("Cron expression updated: " + val);
  };

  return (
    <div className="grid gap-15">
      <div className="card p-15 text-center">
        <div className="font-mono" style={{ fontSize: '2rem', color: 'var(--primary)' }}>{cron}</div>
        <div className="mt-10 opacity-7">{desc}</div>
      </div>
      <div className="grid gap-10">
        <div className="flex-between">
          <span>Minutes</span>
          <input className="pill" style={{ width: '80px' }} value={cron.split(' ')[0]} onChange={e => {
            const p = cron.split(' '); p[0] = e.target.value; updateCron(p.join(' '));
          }} />
        </div>
        <div className="flex-between">
          <span>Hours</span>
          <input className="pill" style={{ width: '80px' }} value={cron.split(' ')[1]} onChange={e => {
            const p = cron.split(' '); p[1] = e.target.value; updateCron(p.join(' '));
          }} />
        </div>
        <div className="flex-between">
          <span>Day of Month</span>
          <input className="pill" style={{ width: '80px' }} value={cron.split(' ')[2]} onChange={e => {
            const p = cron.split(' '); p[2] = e.target.value; updateCron(p.join(' '));
          }} />
        </div>
        <div className="flex-between">
          <span>Month</span>
          <input className="pill" style={{ width: '80px' }} value={cron.split(' ')[3]} onChange={e => {
            const p = cron.split(' '); p[3] = e.target.value; updateCron(p.join(' '));
          }} />
        </div>
        <div className="flex-between">
          <span>Day of Week</span>
          <input className="pill" style={{ width: '80px' }} value={cron.split(' ')[4]} onChange={e => {
            const p = cron.split(' '); p[4] = e.target.value; updateCron(p.join(' '));
          }} />
        </div>
      </div>
    </div>
  );
};

const SqlFormatter = () => {
  const [sql, setSql] = useState('');
  const [formatted, setFormatted] = useState('');

  const format = () => {
    // Simple naive formatter logic
    let res = sql
      .replace(/\s+/g, ' ')
      .replace(/\s*SELECT\s*/gi, '\nSELECT ')
      .replace(/\s*FROM\s*/gi, '\nFROM ')
      .replace(/\s*WHERE\s*/gi, '\nWHERE ')
      .replace(/\s*AND\s*/gi, '\n  AND ')
      .replace(/\s*OR\s*/gi, '\n  OR ')
      .replace(/\s*ORDER BY\s*/gi, '\nORDER BY ')
      .replace(/\s*GROUP BY\s*/gi, '\nGROUP BY ')
      .replace(/\s*LIMIT\s*/gi, '\nLIMIT ')
      .trim();
    setFormatted(res);
  };

  return (
    <div className="grid gap-15">
      <textarea
        className="pill w-full"
        rows="6"
        placeholder="Enter messy SQL..."
        value={sql}
        onChange={e => setSql(e.target.value)}
        style={{ fontFamily: 'monospace' }}
      />
      <button className="btn-primary" onClick={format}>Format SQL</button>
      {formatted && (
        <pre className="tool-result font-mono" style={{ fontSize: '0.85rem' }}>{formatted}</pre>
      )}
    </div>
  );
};

export default DevOpsTools;
