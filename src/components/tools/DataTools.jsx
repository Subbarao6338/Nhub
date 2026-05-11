import React, { useState, useEffect, useMemo } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { parquetRead } from 'hyparquet';

const DataTools = ({ toolId, onResultChange }) => {
  const [activeTab, setActiveTab] = useState('viewer');
  const [uploadedData, setUploadedData] = useState(null);

  useEffect(() => {
    if (toolId) {
      const mapping = {
        'csv-viewer': 'viewer',
        'data-visualizer': 'viewer',
        'anomaly-detect': 'anomaly',
        'stat-calc': 'science',
        'data-quality': 'quality',
        'data-anonymizer': 'anonymizer'
      };
      if (mapping[toolId]) setActiveTab(mapping[toolId]); else if (tabs.length > 0) setActiveTab(tabs[0].id);
    }
  }, [toolId]);

  const tabs = [
    { id: 'viewer', label: 'Data Viewer' },
    { id: 'science', label: 'Statistics' },
    { id: 'anomaly', label: 'Anomaly Detect' },
    { id: 'quality', label: 'Data Quality' },
    { id: 'profiling', label: 'Data Profiling' },
    { id: 'anonymizer', label: 'Anonymizer' }
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

      {activeTab === 'viewer' && <DataViewer onResultChange={onResultChange} setGlobalData={setUploadedData} />}
      {activeTab === 'science' && <DataScienceTool onResultChange={onResultChange} />}
      {activeTab === 'anomaly' && <AnomalyTool onResultChange={onResultChange} />}
      {activeTab === 'quality' && <DataQualityTool onResultChange={onResultChange} data={uploadedData} />}
      {activeTab === 'profiling' && <DataProfilingTool onResultChange={onResultChange} data={uploadedData} />}
      {activeTab === 'anonymizer' && <DataAnonymizer onResultChange={onResultChange} />}
    </div>
  );
};

const DataViewer = ({ onResultChange, setGlobalData }) => {
    const [data, setData] = useState([]);
    const [headers, setHeaders] = useState([]);
    const [fileName, setFileName] = useState('');

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setFileName(file.name);

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target.result;
            let rows = [];
            if (file.name.endsWith('.csv')) {
                Papa.parse(content, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (results) => {
                        rows = results.data;
                        setHeaders(results.meta.fields || []);
                        setData(rows);
                        setGlobalData(rows);
                        onResultChange({ text: `Viewed CSV: ${file.name} (${rows.length} rows)`, filename: file.name });
                    }
                });
            } else if (file.name.endsWith('.json')) {
                try {
                    const json = JSON.parse(content);
                    rows = Array.isArray(json) ? json : [json];
                    setData(rows);
                    setGlobalData(rows);
                    setHeaders(Object.keys(rows[0] || {}));
                    onResultChange({ text: `Viewed JSON: ${file.name}`, filename: file.name });
                } catch (err) { alert("Invalid JSON"); }
            } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
                const workbook = XLSX.read(content, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                rows = XLSX.utils.sheet_to_json(sheet);
                setData(rows);
                setGlobalData(rows);
                setHeaders(Object.keys(rows[0] || {}));
                onResultChange({ text: `Viewed Excel: ${file.name} (${rows.length} rows)`, filename: file.name });
            } else if (file.name.endsWith('.parquet')) {
                parquetRead({
                    file: content,
                    onComplete: (data) => {
                        // hyparquet returns rows as arrays or objects depending on config
                        // usually we need to map it
                        setData(data);
                        setGlobalData(data);
                        setHeaders(Object.keys(data[0] || {}));
                        onResultChange({ text: `Viewed Parquet: ${file.name} (${data.length} rows)`, filename: file.name });
                    }
                });
            }
        };

        if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
            reader.readAsBinaryString(file);
        } else if (file.name.endsWith('.parquet')) {
            reader.readAsArrayBuffer(file);
        } else {
            reader.readAsText(file);
        }
    };

    return (
        <div className="grid gap-15">
            <div className="card p-20 flex-column align-center">
                <input type="file" accept=".csv,.json,.xlsx,.xls,.parquet" onChange={handleFileUpload} className="pill w-full mb-10" />
                <p className="text-muted small m-0">Upload CSV, JSON, Excel, or Parquet to enable Profiling and Quality tools.</p>
            </div>
            {data.length > 0 && (
                <div className="card p-0 overflow-auto" style={{ maxHeight: '400px' }}>
                    <table className="w-full" style={{ borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                        <thead style={{ position: 'sticky', top: 0, background: 'var(--surface-solid)', zIndex: 1 }}>
                            <tr>
                                {headers.map(h => <th key={h} style={{ padding: '12px', borderBottom: '2px solid var(--border)', textAlign: 'left' }}>{h}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {data.slice(0, 100).map((row, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                                    {headers.map(h => <td key={h} style={{ padding: '10px' }}>{String(row[h])}</td>)}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

const DataProfilingTool = ({ onResultChange, data }) => {
    const profile = useMemo(() => {
        if (!data || data.length === 0) return null;
        const columns = Object.keys(data[0]);
        return columns.map(col => {
            const values = data.map(d => d[col]).filter(v => v !== null && v !== undefined && v !== '');
            const nums = values.map(Number).filter(n => !isNaN(n));
            const stats = {
                name: col,
                count: data.length,
                missing: data.length - values.length,
                unique: new Set(values).size,
                type: nums.length > values.length * 0.8 ? 'Numeric' : 'String'
            };
            if (stats.type === 'Numeric' && nums.length > 0) {
                stats.min = Math.min(...nums);
                stats.max = Math.max(...nums);
                stats.mean = (nums.reduce((a,b)=>a+b, 0) / nums.length).toFixed(2);
            }
            return stats;
        });
    }, [data]);

    useEffect(() => {
        if (profile) onResultChange({ text: JSON.stringify(profile, null, 2), filename: 'data_profile.json' });
    }, [profile]);

    if (!data) return <div className="text-center p-20 card opacity-6">Please upload data in the Data Viewer tab first.</div>;

    return (
        <div className="grid gap-15">
            {profile.map(stat => (
                <div key={stat.name} className="card p-15">
                    <div className="flex-between mb-10">
                        <h4 className="m-0 color-primary">{stat.name}</h4>
                        <span className="pill" style={{fontSize: '0.7rem', padding: '2px 8px'}}>{stat.type}</span>
                    </div>
                    <div className="grid grid-2-cols gap-10 small">
                        <div>Count: <b>{stat.count}</b></div>
                        <div>Missing: <b>{stat.missing}</b></div>
                        <div>Unique: <b>{stat.unique}</b></div>
                        {stat.type === 'Numeric' && (
                            <>
                                <div>Min: <b>{stat.min}</b></div>
                                <div>Max: <b>{stat.max}</b></div>
                                <div>Mean: <b>{stat.mean}</b></div>
                            </>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

const DataQualityTool = ({ onResultChange, data }) => {
    const [input, setInput] = useState('{"id": 1, "name": "John", "email": "invalid"}\n{"id": 2, "name": null, "email": "test@test.com"}');
    const [report, setReport] = useState(null);

    const checkQuality = (rowsToUse) => {
        try {
            const rows = rowsToUse || input.split('\n').filter(l => l.trim()).map(l => JSON.parse(l));
            const issues = [];
            rows.forEach((row, idx) => {
                Object.entries(row).forEach(([key, val]) => {
                    if (val === null || val === undefined || val === '') issues.push(`Row ${idx + 1}: Missing value for ${key}`);
                    if (key.toLowerCase().includes('email') && val && typeof val === 'string' && !val.includes('@')) issues.push(`Row ${idx + 1}: Invalid email format in ${key}`);
                });
            });
            setReport(issues);
            onResultChange({ text: issues.length ? issues.join('\n') : "No issues found.", filename: 'quality_report.txt' });
        } catch (e) { alert("Invalid input. Provide JSON objects per line."); }
    };

    return (
        <div className="grid gap-15 card p-15">
            {data ? (
                <button className="btn-primary" onClick={() => checkQuality(data)}>Check Uploaded Data Quality ({data.length} rows)</button>
            ) : (
                <>
                    <label className="font-bold">JSON Data (one object per line)</label>
                    <textarea className="pill font-mono" rows="5" value={input} onChange={e => setInput(e.target.value)} />
                    <button className="btn-primary" onClick={() => checkQuality()}>Check Manual Data Quality</button>
                </>
            )}
            {report && (
                <div className="tool-result">
                    <h4 className="m-0 mb-10">{report.length ? `Issues Found (${report.length})` : 'Data is Healthy'}</h4>
                    <ul className="m-0 p-0" style={{ listStyle: 'none', maxHeight: '200px', overflow: 'auto' }}>
                        {report.map((iss, i) => <li key={i} className="mb-5" style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>• {iss}</li>)}
                    </ul>
                </div>
            )}
        </div>
    );
};

const DataAnonymizer = ({ onResultChange }) => {
    const [input, setInput] = useState('name,email,phone\nJohn Doe,john@example.com,123-456-7890');
    const anonymize = () => {
        Papa.parse(input, {
            header: true,
            complete: (results) => {
                const anon = results.data.map(row => {
                    const newRow = { ...row };
                    Object.keys(newRow).forEach(key => {
                        const k = key.toLowerCase();
                        if (k.includes('name')) newRow[key] = 'User_' + Math.random().toString(36).substr(2, 5);
                        else if (k.includes('email') && typeof newRow[key] === 'string') newRow[key] = '****@' + (newRow[key].split('@')[1] || 'domain.com');
                        else if (k.includes('phone') || k.includes('mobile')) newRow[key] = '***-***-****';
                    });
                    return newRow;
                });
                const csv = Papa.unparse(anon);
                onResultChange({ text: csv, filename: 'anonymized.csv' });
            }
        });
    };
    return (
        <div className="grid gap-15 card p-15">
            <label className="font-bold">CSV to Anonymize</label>
            <textarea className="pill font-mono" rows="5" value={input} onChange={e => setInput(e.target.value)} />
            <button className="btn-primary" onClick={anonymize}>Anonymize PII (Names, Emails, Phones)</button>
        </div>
    );
};

const DataScienceTool = ({ onResultChange }) => {
    const [data, setData] = useState('1,2\n2,3\n3,5\n4,4\n5,6');
    const [res, setRes] = useState(null);
    const calc = () => {
        try {
            const pairs = data.split('\n').map(l => l.split(',').map(Number));
            const n = pairs.length;
            let sx=0, sy=0, sxy=0, sx2=0;
            for(const [x,y] of pairs) { sx+=x; sy+=y; sxy+=x*y; sx2+=x*x; }
            const slope = (n*sxy - sx*sy) / (n*sx2 - sx*sx);
            const intercept = (sy - slope*sx) / n;
            setRes({ slope, intercept });
            onResultChange({ text: `y = ${slope.toFixed(2)}x + ${intercept.toFixed(2)}`, filename: 'regression.txt' });
        } catch(e) { alert("Invalid format"); }
    };
    return (
        <div className="grid gap-15 card p-15">
            <textarea className="pill font-mono" rows="5" value={data} onChange={e=>setData(e.target.value)} />
            <button className="btn-primary" onClick={calc}>Linear Regression (x,y)</button>
            {res && <div className="tool-result text-center font-bold">y = {res.slope.toFixed(3)}x + {res.intercept.toFixed(3)}</div>}
        </div>
    );
};

const AnomalyTool = ({ onResultChange }) => {
    const [input, setInput] = useState('10,12,11,100,10,11,50');
    const [out, setOut] = useState(null);
    const detect = () => {
        const nums = input.split(',').map(Number).filter(n=>!isNaN(n));
        const mean = nums.reduce((a,b)=>a+b)/nums.length;
        const std = Math.sqrt(nums.map(x=>Math.pow(x-mean,2)).reduce((a,b)=>a+b)/nums.length);
        const anomalies = nums.filter(x => Math.abs(x-mean) > 2*std);
        setOut(anomalies);
        onResultChange({ text: `Anomalies: ${anomalies.join(', ')}`, filename: 'anomalies.txt' });
    };
    return (
        <div className="grid gap-15 card p-15">
            <input className="pill" value={input} onChange={e=>setInput(e.target.value)} />
            <button className="btn-primary" onClick={detect}>Detect Outliers (Z-Score &gt; 2)</button>
            {out && <div className="tool-result">Found {out.length} outliers: {out.join(', ')}</div>}
        </div>
    );
};

export default DataTools;
