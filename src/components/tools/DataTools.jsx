import React, { useState, useEffect, useMemo } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

const DataTools = ({ toolId, onResultChange, onSubtoolChange }) => {
  const [activeTab, setActiveTab] = useState('data');
  const [activeSubTab, setActiveSubTab] = useState('viewer');
  const [uploadedData, setUploadedData] = useState(null);

  const mainTabs = [
    { id: 'data', label: 'Data Hub', icon: 'insights' },
    { id: 'stats', label: 'Statistics', icon: 'query_stats' },
    { id: 'finance', label: 'Finance', icon: 'payments' },
    { id: 'mock', label: 'Mock Gen', icon: 'auto_fix_high' }
  ];

  useEffect(() => {
    if (toolId) {
        const dataSub = ['csv-viewer', 'data-visualizer', 'data-quality', 'data-profiling', 'data-anonymizer', 'json-csv'];
        const statSub = ['anomaly-detect', 'stat-calc'];
        const finSub = ['currency-conv', 'vat-calc', 'inflation', 'loan-calc', 'compound-int', 'cagr', 'dcf', 'tip-split', 'investment-calc'];
        const mockSub = ['mock-gen'];

        if (dataSub.includes(toolId)) { setActiveTab('data'); setActiveSubTab(toolId === 'csv-viewer' ? 'viewer' : toolId); }
        else if (statSub.includes(toolId)) { setActiveTab('stats'); setActiveSubTab(toolId === 'anomaly-detect' ? 'anomaly' : 'science'); }
        else if (finSub.includes(toolId)) { setActiveTab('finance'); setActiveSubTab(toolId); }
        else if (mockSub.includes(toolId)) { setActiveTab('mock'); setActiveSubTab('mock'); }
    }
  }, [toolId]);

  return (
    <div className="tool-form">
      <div className="pill-group mb-20 scrollable-x" style={{justifyContent: 'center'}}>
        {mainTabs.map(tab => (
          <button key={tab.id} className={`pill ${activeTab === tab.id ? 'active' : ''}`} onClick={() => { setActiveTab(tab.id); setActiveSubTab(''); }}>
            <span className="material-icons" style={{fontSize: '1.2rem'}}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="hub-content animate-fadeIn">
        {activeTab === 'data' && <DataHub activeSubTab={activeSubTab} setActiveSubTab={setActiveSubTab} onResultChange={onResultChange} setGlobalData={setUploadedData} uploadedData={uploadedData} onSubtoolChange={onSubtoolChange} />}
        {activeTab === 'stats' && <StatsHub activeSubTab={activeSubTab} setActiveSubTab={setActiveSubTab} onResultChange={onResultChange} onSubtoolChange={onSubtoolChange} />}
        {activeTab === 'finance' && <FinanceHub activeSubTab={activeSubTab} setActiveSubTab={setActiveSubTab} onResultChange={onResultChange} onSubtoolChange={onSubtoolChange} />}
        {activeTab === 'mock' && <MockDataGenerator onResultChange={onResultChange} onSubtoolChange={onSubtoolChange} />}
      </div>
    </div>
  );
};

// --- Data Hub ---
const DataHub = ({ activeSubTab, setActiveSubTab, onResultChange, setGlobalData, uploadedData, onSubtoolChange }) => {
    const tabs = [{ id: 'viewer', label: 'Viewer' }, { id: 'data-quality', label: 'Quality' }, { id: 'data-profiling', label: 'Profiling' }, { id: 'data-anonymizer', label: 'Anonymizer' }, { id: 'json-csv', label: 'JSON ↔ CSV' }];
    useEffect(() => { if(!activeSubTab) setActiveSubTab('viewer'); }, []);
    useEffect(() => { const t = tabs.find(x => x.id === activeSubTab); if(t && onSubtoolChange) onSubtoolChange(t.label); }, [activeSubTab]);

    return (
        <div className="grid gap-15">
            <div className="pill-group scrollable-x">
                {tabs.map(t => <button key={t.id} className={`pill ${activeSubTab === t.id ? 'active' : ''}`} onClick={() => setActiveSubTab(t.id)}>{t.label}</button>)}
            </div>
            {activeSubTab === 'viewer' && <DataViewer onResultChange={onResultChange} setGlobalData={setGlobalData} />}
            {activeSubTab === 'data-quality' && <DataQualityTool onResultChange={onResultChange} data={uploadedData} />}
            {activeSubTab === 'data-profiling' && <DataProfilingTool onResultChange={onResultChange} data={uploadedData} />}
            {activeSubTab === 'data-anonymizer' && <DataAnonymizer onResultChange={onResultChange} />}
            {activeSubTab === 'json-csv' && <JsonCsvConverter onResultChange={onResultChange} />}
        </div>
    );
};

// --- Stats Hub ---
const StatsHub = ({ activeSubTab, setActiveSubTab, onResultChange, onSubtoolChange }) => {
    const tabs = [{ id: 'science', label: 'Regression' }, { id: 'anomaly', label: 'Anomalies' }];
    useEffect(() => { if(!activeSubTab) setActiveSubTab('science'); }, []);
    useEffect(() => { const t = tabs.find(x => x.id === activeSubTab); if(t && onSubtoolChange) onSubtoolChange(t.label); }, [activeSubTab]);
    return (
        <div className="grid gap-15">
            <div className="pill-group">
                {tabs.map(t => <button key={t.id} className={`pill ${activeSubTab === t.id ? 'active' : ''}`} onClick={() => setActiveSubTab(t.id)}>{t.label}</button>)}
            </div>
            {activeSubTab === 'science' && <DataScienceTool onResultChange={onResultChange} />}
            {activeSubTab === 'anomaly' && <AnomalyTool onResultChange={onResultChange} />}
        </div>
    );
};

// --- Finance Hub ---
const FinanceHub = ({ activeSubTab, setActiveSubTab, onResultChange, onSubtoolChange }) => {
    const tabs = [
        { id: 'currency-conv', label: 'Currency' }, { id: 'loan-calc', label: 'Loan' },
        { id: 'compound-int', label: 'Compound' }, { id: 'investment-calc', label: 'SIP' },
        { id: 'vat-calc', label: 'VAT' }, { id: 'inflation', label: 'Inflation' },
        { id: 'cagr', label: 'CAGR' }, { id: 'dcf', label: 'DCF' }, { id: 'tip-split', label: 'Tip' }
    ].sort((a,b) => a.label.localeCompare(b.label));

    useEffect(() => { if(!activeSubTab) setActiveSubTab('currency-conv'); }, []);
    useEffect(() => { const t = tabs.find(x => x.id === activeSubTab); if(t && onSubtoolChange) onSubtoolChange(`Finance ${t.label}`); }, [activeSubTab]);

    return (
        <div className="grid gap-15">
            <div className="pill-group scrollable-x">
                {tabs.map(t => <button key={t.id} className={`pill ${activeSubTab === t.id ? 'active' : ''}`} onClick={() => setActiveSubTab(t.id)}>{t.label}</button>)}
            </div>
            <FinanceCore activeTab={activeSubTab} onResultChange={onResultChange} />
        </div>
    );
};

// --- LOGIC COMPONENTS ---

const DataViewer = ({ onResultChange, setGlobalData }) => {
    const [data, setData] = useState([]);
    const [headers, setHeaders] = useState([]);
    const handleFileUpload = (e) => {
        const file = e.target.files[0]; if(!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            if(file.name.endsWith('.csv')) {
                Papa.parse(event.target.result, { header: true, skipEmptyLines: true, complete: (res) => { setData(res.data); setHeaders(res.meta.fields || []); setGlobalData(res.data); onResultChange({text:`CSV Loaded: ${res.data.length} rows`, filename: file.name}); } });
            } else if(file.name.endsWith('.json')) {
                try {
                    const j = JSON.parse(event.target.result); const rows = Array.isArray(j) ? j : [j];
                    setData(rows); setHeaders(Object.keys(rows[0]||{})); setGlobalData(rows); onResultChange({text:`JSON Loaded: ${rows.length} records`, filename: file.name});
                } catch(e) { alert("Invalid JSON"); }
            }
        };
        reader.readAsText(file);
    };
    return (
        <div className="grid gap-15">
            <div className="card p-20 text-center glass-card"><input type="file" accept=".csv,.json" onChange={handleFileUpload} className="pill w-full" /></div>
            {data.length > 0 && (
                <div className="card p-0 overflow-auto glass-card" style={{maxHeight:'350px'}}>
                    <table className="w-full text-small">
                        <thead className="sticky top-0 bg-surface"><tr>{headers.map(h => <th key={h} className="p-10 border-b text-left">{h}</th>)}</tr></thead>
                        <tbody>{data.slice(0, 100).map((r, i) => <tr key={i}>{headers.map(h => <td key={h} className="p-8 border-b opacity-8">{String(r[h])}</td>)}</tr>)}</tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

const DataProfilingTool = ({ data, onResultChange }) => {
    const profile = useMemo(() => {
        if (!data || data.length === 0) return null;
        return Object.keys(data[0]).map(col => {
            const vals = data.map(d => d[col]).filter(v => v !== null && v !== undefined && v !== '');
            const nums = vals.map(Number).filter(n => !isNaN(n));
            const mean = nums.length ? (nums.reduce((a,b)=>a+b,0)/nums.length).toFixed(2) : '-';
            const std = nums.length ? Math.sqrt(nums.map(x=>Math.pow(x-parseFloat(mean),2)).reduce((a,b)=>a+b,0)/nums.length).toFixed(2) : '-';
            const sorted = [...nums].sort((a,b)=>a-b);
            const median = sorted.length ? (sorted.length % 2 !== 0 ? sorted[Math.floor(sorted.length/2)] : (sorted[sorted.length/2-1] + sorted[sorted.length/2])/2) : '-';
            return { name: col, count: data.length, unique: new Set(vals).size, type: nums.length > vals.length * 0.8 ? 'Numeric' : 'String', mean, std, median };
        });
    }, [data]);

    useEffect(() => { if(profile) onResultChange({text: JSON.stringify(profile, null, 2), filename: 'data_profile.json'}); }, [profile]);

    if(!data) return <div className="card p-30 text-center opacity-6 glass-card">Please upload data in the Viewer tab first.</div>;
    return (
        <div className="grid gap-10">
            {profile.map(p => (
                <div key={p.name} className="card p-15 flex-between glass-card animate-slide-up">
                    <div><b className="color-primary">{p.name}</b> <span className="opacity-5 ml-10 smallest uppercase">{p.type}</span></div>
                    <div className="text-small">Mean: <b>{p.mean}</b> | Median: <b>{p.median}</b> | Std: <b>{p.std}</b> | Unique: <b>{p.unique}</b></div>
                </div>
            ))}
        </div>
    );
};

const DataQualityTool = ({ data }) => {
    if(!data) return <div className="card p-30 text-center opacity-6 glass-card">Please upload data first.</div>;
    const issues = [];
    data.forEach((row, i) => {
        Object.entries(row).forEach(([k,v]) => {
            if(v === null || v === undefined || v === '') issues.push(`Row ${i+1}: Missing value in ${k}`);
        });
    });
    return (
        <div className="card p-20 glass-card">
            <div className="h2 font-bold mb-15">{issues.length ? 'Issues Found' : 'Data is Healthy'}</div>
            <div className="overflow-auto" style={{maxHeight:'200px'}}>
                {issues.length > 0 ? issues.map((iss, i) => <div key={i} className="mb-5 color-danger text-small">• {iss}</div>) : <div className="color-primary">No critical errors detected across {data.length} rows.</div>}
            </div>
        </div>
    );
};

const JsonCsvConverter = ({ onResultChange }) => {
    const [val, setVal] = useState('{"id":1,"name":"Nature"}');
    const convert = (to) => {
        try {
            const res = to === 'csv' ? Papa.unparse(JSON.parse(val)) : JSON.stringify(Papa.parse(val, {header:true}).data, null, 2);
            setVal(res); onResultChange({ text: res, filename: `converted.${to}` });
        } catch(e) { alert("Invalid input format."); }
    };
    return (
        <div className="grid gap-15">
            <textarea className="pill font-mono" rows="8" value={val} onChange={e=>setVal(e.target.value)} placeholder="JSON or CSV content..." />
            <div className="flex-gap">
                <button className="btn-primary flex-1" onClick={()=>convert('csv')}>Convert to CSV</button>
                <button className="pill flex-1" onClick={()=>convert('json')}>Convert to JSON</button>
            </div>
        </div>
    );
};

const DataAnonymizer = ({ onResultChange }) => {
    const [val, setVal] = useState('John Doe, john@example.com, 555-0123');
    const run = () => {
        let res = val.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL]');
        res = res.replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[PHONE]');
        setVal(res); onResultChange({text:res, filename:'anonymized.txt'});
    };
    return (
        <div className="grid gap-15 card p-20 glass-card">
            <textarea className="pill font-mono" rows="4" value={val} onChange={e=>setVal(e.target.value)} />
            <button className="btn-primary" onClick={run}>Anonymize PII</button>
        </div>
    );
};

const DataScienceTool = ({ onResultChange }) => {
    const [pts, setPts] = useState('1,2\n2,3\n3,5\n4,4\n5,6');
    const [res, setRes] = useState(null);
    const calc = () => {
        const pairs = pts.split('\n').map(l => l.split(',').map(Number)).filter(p => p.length === 2 && !p.some(isNaN));
        const n = pairs.length; if(n<2) return alert("Need at least 2 points");
        let sx=0, sy=0, sxy=0, sx2=0;
        pairs.forEach(([x,y]) => { sx+=x; sy+=y; sxy+=x*y; sx2+=x*x; });
        const m = (n*sxy - sx*sy) / (n*sx2 - sx*sx);
        const b = (sy - m*sx) / n;
        setRes({m, b});
        onResultChange({ text: `y = ${m.toFixed(2)}x + ${b.toFixed(2)}`, filename: 'regression.txt' });
    };
    return (
        <div className="grid gap-15 card p-20 glass-card">
            <label className="smallest opacity-6 font-bold uppercase">Data Points (x,y per line)</label>
            <textarea className="pill font-mono" rows="5" value={pts} onChange={e=>setPts(e.target.value)} />
            <button className="btn-primary" onClick={calc}>Calculate Linear Regression</button>
            {res && <div className="tool-result text-center h2 font-bold color-primary">y = {res.m.toFixed(3)}x + {res.b.toFixed(3)}</div>}
        </div>
    );
};

const AnomalyTool = ({ onResultChange }) => {
    const [val, setVal] = useState('10,12,11,100,10,11,9,12');
    const run = () => {
        const n = val.split(',').map(Number).filter(x=>!isNaN(x));
        if(!n.length) return;
        const mean = n.reduce((a,b)=>a+b)/n.length;
        const std = Math.sqrt(n.map(x=>Math.pow(x-mean,2)).reduce((a,b)=>a+b)/n.length);
        const anomalies = n.filter(x => Math.abs(x-mean) > 2 * std);
        onResultChange({ text: `Anomalies: ${anomalies.join(', ')}`, filename: 'anomalies.txt' });
        alert(`Detected ${anomalies.length} outliers (Z-Score > 2)`);
    };
    return (
        <div className="grid gap-15 card p-20 glass-card">
            <label className="smallest opacity-6 uppercase font-bold">Value Series (Comma Separated)</label>
            <input className="pill" value={val} onChange={e=>setVal(e.target.value)} />
            <button className="btn-primary" onClick={run}>Detect Outliers</button>
        </div>
    );
};

const FinanceCore = ({ activeTab, onResultChange }) => {
    const [p, setP] = useState(1000);
    const [r, setR] = useState(12);
    const [t, setT] = useState(10);

    const res = useMemo(() => {
        const amount = parseFloat(p) || 0;
        const rate = parseFloat(r) || 0;
        const time = parseFloat(t) || 0;
        if(activeTab === 'currency-conv') return (amount * 0.92).toFixed(2) + ' EUR';
        if(activeTab === 'compound-int') return (amount * Math.pow(1 + rate/100, time)).toFixed(2);
        if(activeTab === 'loan-calc') { const ir = rate/12/100; return (amount * ir * Math.pow(1+ir, time*12) / (Math.pow(1+ir, time*12)-1)).toFixed(2); }
        if(activeTab === 'investment-calc') { const ir = rate/100/12; return (amount * ((Math.pow(1+ir, time*12)-1)/ir) * (1+ir)).toFixed(0); }
        if(activeTab === 'vat-calc') return (amount * (1 + rate/100)).toFixed(2);
        if(activeTab === 'inflation') return (amount * Math.pow(1 + 0.05, time)).toFixed(2);
        if(activeTab === 'cagr') { const end=2000; return ((Math.pow(end/amount, 1/time)-1)*100).toFixed(2) + '%'; }
        return amount.toFixed(2);
    }, [p, r, t, activeTab]);

    useEffect(() => onResultChange({text: `Calculation Result: ${res}`, filename: 'finance_result.txt'}), [res]);

    return (
        <div className="card p-25 grid gap-15 glass-card">
            <div className="form-group"><label>{activeTab==='investment-calc'?'Monthly SIP':'Principal/Base Amount'}</label><input type="number" className="pill h2 text-center" value={p} onChange={e=>setP(e.target.value)} /></div>
            <div className="grid grid-2-cols gap-15">
                <div className="form-group"><label>Rate (%)</label><input type="number" className="pill" value={r} onChange={e=>setR(e.target.value)} /></div>
                <div className="form-group"><label>Years</label><input type="number" className="pill" value={t} onChange={e=>setT(e.target.value)} /></div>
            </div>
            <div className="tool-result h1 color-primary font-bold text-center mt-10">{res}</div>
        </div>
    );
};

const MockDataGenerator = ({ onResultChange }) => {
    const gen = () => {
        const d = Array.from({length:10}, (_, i) => ({id:i+1, name:'Eco_'+(i+1), category:'Nature', score: Math.floor(Math.random()*100)}));
        const res = JSON.stringify(d, null, 2);
        onResultChange({text:res, filename:'mock_data.json'});
    };
    return (
        <div className="card p-40 text-center glass-card">
            <span className="material-icons color-primary" style={{fontSize:'4rem'}}>auto_fix_high</span>
            <div className="mv-15 opacity-6 h2">Data Mocking Engine</div>
            <p className="mb-20 opacity-5">Generate high-quality mock datasets for testing and prototyping.</p>
            <button className="btn-primary w-full h2" onClick={gen}>Generate JSON Dataset</button>
        </div>
    );
};

export default DataTools;
