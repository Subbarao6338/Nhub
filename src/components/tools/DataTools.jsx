import React, { useState, useEffect, useMemo } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { parquetRead } from 'hyparquet';
import ResultActionBar from './ResultActionBar';

const DataTools = ({ toolId, onResultChange, onSubtoolChange }) => {
  const tabs = [
    { id: 'viewer', label: 'Data Viewer' },
    { id: 'science', label: 'Statistics' },
    { id: 'anomaly', label: 'Anomaly Detect' },
    { id: 'quality', label: 'Data Quality' },
    { id: 'profiling', label: 'Data Profiling' },
    { id: 'anonymizer', label: 'Anonymizer' },
    { id: 'json-csv', label: 'JSON ↔ CSV' },
    { id: 'mock', label: 'Mock Data Gen' },
    { id: 'correlation', label: 'Correlation' },
    { id: 'normalization', label: 'Normalize' }
  ].sort((a, b) => a.label.localeCompare(b.label));

  const [activeTab, setActiveTab] = useState('viewer');
  const [uploadedData, setUploadedData] = useState(null);

  useEffect(() => {
    const current = tabs.find(t => t.id === activeTab);
    if (current && onSubtoolChange) onSubtoolChange(current.label);
  }, [activeTab]);

  useEffect(() => {
    if (toolId) {
      const mapping = {
        'csv-viewer': 'viewer',
        'data-visualizer': 'viewer',
        'anomaly-detect': 'anomaly',
        'stat-calc': 'science',
        'data-quality': 'quality',
        'data-anonymizer': 'anonymizer',
        'data-profiling': 'profiling',
        'json-csv': 'json-csv',
        'mock-gen': 'mock'
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

      <div className="hub-content animate-fadeIn">
        {activeTab === 'viewer' && <DataViewer onResultChange={onResultChange} setGlobalData={setUploadedData} />}
        {activeTab === 'science' && <DataScienceTool onResultChange={onResultChange} />}
        {activeTab === 'anomaly' && <AnomalyTool onResultChange={onResultChange} />}
        {activeTab === 'quality' && <DataQualityTool onResultChange={onResultChange} data={uploadedData} />}
        {activeTab === 'profiling' && <DataProfilingTool onResultChange={onResultChange} data={uploadedData} />}
        {activeTab === 'anonymizer' && <DataAnonymizer onResultChange={onResultChange} />}
        {activeTab === 'json-csv' && <JsonCsvConverter onResultChange={onResultChange} />}
        {activeTab === 'mock' && <MockDataGenerator onResultChange={onResultChange} />}
        {activeTab === 'correlation' && <CorrelationTool onResultChange={onResultChange} data={uploadedData} />}
        {activeTab === 'normalization' && <NormalizationTool onResultChange={onResultChange} data={uploadedData} />}
      </div>
    </div>
  );
};

const MockDataGenerator = ({ onResultChange }) => {
    const [rows, setRows] = useState(10);
    const [format, setFormat] = useState('json');

    const generate = () => {
        const data = [];
        const names = ['Oak', 'Pine', 'Cedar', 'Maple', 'Birch', 'Willow', 'Ash', 'Elm'];
        const types = ['Tree', 'Shrub', 'Flower', 'Grass', 'Moss', 'Fern'];

        for (let i = 0; i < rows; i++) {
            data.push({
                id: i + 1,
                name: names[Math.floor(Math.random() * names.length)] + ' ' + (i + 1),
                type: types[Math.floor(Math.random() * types.length)],
                value: Math.floor(Math.random() * 1000),
                active: Math.random() > 0.5
            });
        }

        const res = format === 'json' ? JSON.stringify(data, null, 2) : Papa.unparse(data);
        onResultChange({ text: res, filename: `mock_data.${format}` });
    };

    return (
        <div className="card p-20 text-center">
                <ResultActionBar result={format === 'json' ? {text: res, filename: 'mock_data.json'} : {text: res, filename: 'mock_data.csv'}} />
            <div className="grid grid-2 gap-10 mb-20">
                <div className="form-group">
                    <label>Rows</label>
                    <input type="number" className="pill" value={rows} onChange={e=>setRows(e.target.value)} />
                </div>
                <div className="form-group">
                    <label>Format</label>
                    <select className="pill" value={format} onChange={e=>setFormat(e.target.value)}>
                        <option value="json">JSON</option>
                        <option value="csv">CSV</option>
                    </select>
                </div>
            </div>
            <button className="btn-primary w-full" onClick={generate}>Generate Mock Data</button>
        </div>
    );
};

const DataViewer = ({ onResultChange, setGlobalData }) => {
    const [data, setData] = useState([]);
    const [headers, setHeaders] = useState([]);
    const [fileName, setFileName] = useState('');
    const [loading, setLoading] = useState(false);

    const handleFileUpload = (e) => {
        setLoading(true);
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
            <div className="card p-20 flex-column align-center text-center">
                <div className="form-group w-full">
                    <label>Upload Data File</label>
                    <input type="file" accept=".csv,.json,.xlsx,.xls,.parquet" onChange={handleFileUpload} className="pill w-full" />
                </div>
                <p className="text-muted small m-0 mt-10">
                    <span className="material-icons" style={{fontSize: '1rem', verticalAlign: 'middle', marginRight: '5px'}}>info</span>
                    Upload CSV, JSON, Excel, or Parquet to enable Profiling and Quality tools.
                </p>
                {loading && <div className="mt-10 rotating material-icons color-primary">refresh</div>}
            </div>
            {data.length > 0 && (
                <div className="card p-0 overflow-auto" style={{ maxHeight: '400px', borderRadius: 'var(--radius-lg)' }}>
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
                stats.mean = (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(2);
                // Median calculation
                const sorted = [...nums].sort((a, b) => a - b);
                const mid = Math.floor(sorted.length / 2);
                stats.median = sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
                // Standard Deviation
                const avg = parseFloat(stats.mean);
                stats.stdDev = Math.sqrt(nums.map(x => Math.pow(x - avg, 2)).reduce((a, b) => a + b) / nums.length).toFixed(2);
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
                                <div>Median: <b>{stat.median}</b></div>
                                <div>Std Dev: <b>{stat.stdDev}</b></div>
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
            const rows = rowsToUse || input.split('\n').filter(l => l.trim()).map(l => {
                try { return JSON.parse(l); }
                catch(e) { throw new Error(`Invalid JSON in line: ${l}`); }
            });
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
        <div className="grid gap-15 card p-20">
            {data ? (
                <button className="btn-primary w-full" onClick={() => checkQuality(data)}>
                    <span className="material-icons mr-10">fact_check</span>
                    Check Uploaded Data Quality ({data.length} rows)
                </button>
            ) : (
                <>
                    <div className="form-group">
                        <label>JSON Data (one object per line)</label>
                        <textarea className="pill font-mono" rows="6" value={input} onChange={e => setInput(e.target.value)} placeholder='{"id": 1, "name": "..."}' />
                    </div>
                    <button className="btn-primary w-full" onClick={() => checkQuality()}>
                        <span className="material-icons mr-10">fact_check</span>
                        Check Manual Data Quality
                    </button>
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

const JsonCsvConverter = ({ onResultChange }) => {
    const [val, setVal] = useState('{"name": "Nature", "type": "Toolbox"}');
    const toCsv = () => {
        try {
            const json = JSON.parse(val);
            const csv = Papa.unparse(Array.isArray(json) ? json : [json]);
            setVal(csv);
            onResultChange({ text: csv, filename: 'converted.csv' });
        } catch(e) { alert("Invalid JSON"); }
    };
    const toJson = () => {
        const results = Papa.parse(val, { header: true });
        const json = JSON.stringify(results.data, null, 2);
        setVal(json);
        onResultChange({ text: json, filename: 'converted.json' });
    };
    return (
        <div className="card p-20 grid gap-15">
            <div className="form-group">
                <label>Data Content (JSON or CSV)</label>
                <textarea className="pill font-mono" rows="10" value={val} onChange={e=>setVal(e.target.value)} />
            </div>
            <div className="flex-gap">
                <button className="btn-primary flex-1" onClick={toCsv}>
                    <span className="material-icons mr-10">grid_on</span>
                    TO CSV
                </button>
                <button className="pill flex-1" onClick={toJson}>
                    <span className="material-icons mr-10">data_object</span>
                    TO JSON
                </button>
            </div>
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
        <div className="grid gap-15 card p-20">
            <div className="form-group">
                <label>CSV Content to Anonymize</label>
                <textarea className="pill font-mono" rows="6" value={input} onChange={e => setInput(e.target.value)} />
            </div>
            <button className="btn-primary w-full" onClick={anonymize}>
                <span className="material-icons mr-10">privacy_tip</span>
                Anonymize PII (Names, Emails, Phones)
            </button>
        </div>
    );
};

const DataScienceTool = ({ onResultChange }) => {
    const [data, setData] = useState('1,2\n2,3\n3,5\n4,4\n5,6');
    const [res, setRes] = useState(null);
    const calc = () => {
        try {
            const pairs = data.split('\n').map(l => l.split(',').map(Number)).filter(p => p.length === 2 && !isNaN(p[0]) && !isNaN(p[1]));
            const n = pairs.length;
            if (n < 2) throw new Error("At least 2 points needed");
            let sx=0, sy=0, sxy=0, sx2=0;
            for(const [x,y] of pairs) { sx+=x; sy+=y; sxy+=x*y; sx2+=x*x; }
            const slope = (n*sxy - sx*sy) / (n*sx2 - sx*sx);
            const intercept = (sy - slope*sx) / n;
            setRes({ slope, intercept, pairs });
            onResultChange({ text: `y = ${slope.toFixed(2)}x + ${intercept.toFixed(2)}`, filename: 'regression.txt' });
        } catch(e) { alert(e.message || "Invalid format"); }
    };

    const renderChart = () => {
        if (!res) return null;
        const max_x = Math.max(...res.pairs.map(p => p[0]));
        const max_y = Math.max(...res.pairs.map(p => p[1]));
        const scale_x = 200 / (max_x || 1);
        const scale_y = 100 / (max_y || 1);

        return (
            <div className="mt-20 p-10 bg-white rounded-12 border">
                <svg viewBox="0 0 220 120" className="w-full h-auto">
                    <line x1="10" y1="10" x2="10" y2="110" stroke="#ccc" strokeWidth="1" />
                    <line x1="10" y1="110" x2="210" y2="110" stroke="#ccc" strokeWidth="1" />
                    {res.pairs.map((p, i) => (
                        <circle key={i} cx={10 + p[0]*scale_x} cy={110 - p[1]*scale_y} r="2" fill="var(--primary)" />
                    ))}
                    <line x1={10} y1={110 - res.intercept*scale_y} x2={210} y2={110 - (res.slope*(200/scale_x)+res.intercept)*scale_y} stroke="var(--danger)" strokeWidth="1" strokeDasharray="2" />
                </svg>
            </div>
        );
    };

    return (
        <div className="grid gap-15 card p-20">
            <div className="form-group">
                <label>Data Pairs (x,y per line)</label>
                <textarea className="pill font-mono" rows="5" value={data} onChange={e=>setData(e.target.value)} />
            </div>
            <button className="btn-primary w-full" onClick={calc}>
                <span className="material-icons mr-10">trending_up</span>
                Calculate Linear Regression
            </button>
            {res && (
                <>
                    <div className="tool-result text-center font-bold" style={{background: 'var(--primary-glow)'}}>y = {res.slope.toFixed(3)}x + {res.intercept.toFixed(3)}</div>
                    {renderChart()}
                </>
            )}
        </div>
    );
};

const CorrelationTool = ({ data, onResultChange }) => {
    const [cols, setCols] = useState(['', '']);
    const [matrix, setMatrix] = useState(null);

    const calculate = () => {
        if (!data || data.length < 2) return;
        const available = Object.keys(data[0]);
        const numeric = available.filter(k => !isNaN(Number(data[0][k])));

        const res = {};
        numeric.forEach(c1 => {
            res[c1] = {};
            numeric.forEach(c2 => {
                const x = data.map(d => Number(d[c1]));
                const y = data.map(d => Number(d[c2]));
                const n = x.length;
                const sumX = x.reduce((a,b)=>a+b,0), sumY = y.reduce((a,b)=>a+b,0);
                const sumXY = x.reduce((a,v,i)=>a+v*y[i],0);
                const sumX2 = x.reduce((a,b)=>a+b*b,0), sumY2 = y.reduce((a,b)=>a+b*b,0);
                const corr = (n*sumXY - sumX*sumY) / Math.sqrt((n*sumX2 - sumX*sumX) * (n*sumY2 - sumY*sumY));
                res[c1][c2] = corr.toFixed(3);
            });
        });
        setMatrix(res);
        onResultChange({ text: JSON.stringify(res, null, 2), filename: 'correlation.json' });
    };

    if (!data) return <div className="card p-20 opacity-6 text-center">Upload data in Viewer first.</div>;

    return (
        <div className="card p-20 grid gap-15">
            <button className="btn-primary" onClick={calculate}>Compute Correlation Matrix</button>
            {matrix && (
                <div className="overflow-auto">
                    <table className="w-full small font-mono">
                        <thead><tr><th></th>{Object.keys(matrix).map(k=><th key={k}>{k}</th>)}</tr></thead>
                        <tbody>
                            {Object.entries(matrix).map(([k, row]) => (
                                <tr key={k}>
                                    <td className="font-bold">{k}</td>
                                    {Object.values(row).map((v, i) => (
                                        <td key={i} style={{background: `rgba(var(--primary-rgb), ${Math.abs(v)})`, color: Math.abs(v) > 0.5 ? 'white' : 'inherit'}}>{v}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

const NormalizationTool = ({ data, onResultChange }) => {
    const [method, setMethod] = useState('minmax');
    const [res, setRes] = useState(null);

    const apply = () => {
        if (!data) return;
        const columns = Object.keys(data[0]).filter(k => !isNaN(Number(data[0][k])));
        const normalized = data.map(row => {
            const newRow = { ...row };
            columns.forEach(col => {
                const vals = data.map(d => Number(d[col]));
                const min = Math.min(...vals), max = Math.max(...vals);
                const mean = vals.reduce((a,b)=>a+b)/vals.length;
                const std = Math.sqrt(vals.map(v=>Math.pow(v-mean,2)).reduce((a,b)=>a+b)/vals.length);

                if (method === 'minmax') newRow[col] = ((Number(row[col]) - min) / (max - min || 1)).toFixed(4);
                else newRow[col] = ((Number(row[col]) - mean) / (std || 1)).toFixed(4);
            });
            return newRow;
        });
        setRes(normalized);
        onResultChange({ text: Papa.unparse(normalized), filename: 'normalized.csv' });
    };

    if (!data) return <div className="card p-20 opacity-6 text-center">Upload data in Viewer first.</div>;

    return (
        <div className="card p-20 grid gap-15">
            <div className="flex-gap">
                <select className="pill flex-1" value={method} onChange={e=>setMethod(e.target.value)}>
                    <option value="minmax">Min-Max Scaling (0 to 1)</option>
                    <option value="zscore">Z-Score (Standardization)</option>
                </select>
                <button className="btn-primary" onClick={apply}>Apply</button>
            </div>
            {res && <div className="tool-result font-mono text-xs">Normalized {res.length} rows. Ready for export.</div>}
        </div>
    );
};

const AnomalyTool = ({ onResultChange }) => {
    const [input, setInput] = useState('10,12,11,100,10,11,50');
    const [out, setOut] = useState(null);
    const detect = () => {
        const nums = input.split(',').map(Number).filter(n=>!isNaN(n));
        if (nums.length === 0) return;
        const mean = nums.reduce((a,b)=>a+b)/nums.length;
        const std = Math.sqrt(nums.map(x=>Math.pow(x-mean,2)).reduce((a,b)=>a+b)/nums.length);
        const anomalies = nums.filter(x => Math.abs(x-mean) > 2*std);
        setOut(anomalies);
        onResultChange({ text: `Anomalies detected: ${anomalies.join(', ')}`, filename: 'anomalies.txt' });
    };
    return (
        <div className="grid gap-15 card p-20">
            <div className="form-group">
                <label>Comma-separated numbers</label>
                <input className="pill" value={input} onChange={e=>setInput(e.target.value)} placeholder="10, 20, 100, 15..." />
            </div>
            <button className="btn-primary w-full" onClick={detect}>
                <span className="material-icons mr-10">warning</span>
                Detect Outliers (Z-Score &gt; 2)
            </button>
            {out && (
                <div className="tool-result" style={{borderColor: out.length > 0 ? 'var(--danger)' : 'var(--primary)'}}>
                    {out.length > 0 ? (
                        <>Found <b>{out.length}</b> outliers: <code className="ml-10">{out.join(', ')}</code></>
                    ) : (
                        'No significant outliers detected.'
                    )}
                </div>
            )}
        </div>
    );
};

export default DataTools;
