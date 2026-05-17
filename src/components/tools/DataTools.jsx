import React, { useState, useEffect, useMemo } from 'react';
import Papa from 'papaparse';
import ToolResult from './ToolResult';

const FinanceHub = ({ subtool }) => {
    const [amt, setAmt] = useState(100000);
    const [rate, setRate] = useState(8.5);
    const [tenure, setTenure] = useState(20);
    const [mode, setMode] = useState(subtool === 'emi-calc' || subtool === 'loan-calc' ? 'EMI' : 'Compound');

    const calculate = () => {
        if (mode === 'EMI') {
            const r = rate / (12 * 100);
            const n = tenure * 12;
            const emi = (amt * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
            const totalPayable = emi * n;
            const totalInterest = totalPayable - amt;
            return { result: emi.toFixed(2), total: totalPayable.toFixed(2), interest: totalInterest.toFixed(2) };
        } else if (mode === 'ROI') {
             const gain = amt * (rate/100);
             return { result: (amt + gain).toFixed(2), profit: gain.toFixed(2) };
        } else {
            const compound = amt * Math.pow((1 + (rate/100)), tenure);
            return { result: compound.toFixed(2), interest: (compound - amt).toFixed(2) };
        }
    };

    const res = calculate();

    return (
        <div className="grid gap-15">
            <div className="pill-group">
                {['EMI', 'Compound', 'ROI'].map(m => (
                    <button key={m} className={`pill ${mode === m ? 'active' : ''}`} onClick={() => setMode(m)}>{m}</button>
                ))}
            </div>
            <div className="card p-20 glass-card grid gap-15">
                <div className="form-group">
                    <label>{mode === 'ROI' ? 'Investment' : 'Principal Amount'}</label>
                    <input type="number" className="pill" value={amt} onChange={e=>setAmt(e.target.value)} />
                </div>
                <div className="form-group">
                    <label>Rate (%)</label>
                    <input type="number" className="pill" value={rate} onChange={e=>setRate(e.target.value)} />
                </div>
                <div className="form-group">
                    <label>{mode === 'ROI' ? 'Mode (Info only)' : 'Time (Years)'}</label>
                    <input type="number" className="pill" value={tenure} onChange={e=>setTenure(e.target.value)} />
                </div>
                <div className="tool-result text-center">
                    <div className="opacity-6 smallest uppercase font-bold">{mode} Result</div>
                    <div className="font-bold color-primary" style={{fontSize: '2.5rem'}}>{res.result}</div>
                    {res.interest && <div className="smallest opacity-6">Total Interest: {res.interest}</div>}
                    {res.total && <div className="smallest opacity-6">Total Payable: {res.total}</div>}
                </div>
                <ToolResult result={{ text: `${mode} Result: ${res.result}`, filename: 'finance.txt' }} />
            </div>
        </div>
    );
};

const DataTools = React.memo(({ toolId, onSubtoolChange }) => {
  const tabs = [
    { id: 'viewer', label: 'Data Viewer' },
    { id: 'finance', label: 'Finance Hub' },
    { id: 'science', label: 'Statistics' },
    { id: 'quality', label: 'Data Quality' },
    { id: 'profiling', label: 'Data Profiling' },
    { id: 'anonymizer', label: 'Anonymizer' },
    { id: 'json-csv', label: 'JSON ↔ CSV' },
    { id: 'mock', label: 'Mock Data Gen' }
  ].sort((a, b) => a.label.localeCompare(b.label));

  const [activeTab, setActiveTab] = useState('viewer');
  const [uploadedData, setUploadedData] = useState(null);

  useEffect(() => {
    const current = tabs.find(t => t.id === activeTab);
    if (current && onSubtoolChange) onSubtoolChange(current.label);
  }, [activeTab]);

  useEffect(() => {
    if (toolId) {
      if (['currency-conv', 'compound-int', 'loan-calc'].includes(toolId)) setActiveTab('finance');
      else if (['csv-viewer', 'data-visualizer'].includes(toolId)) setActiveTab('viewer');
    }
  }, [toolId]);

  return (
    <div className="tool-form mt-20">
      <div className="pill-group mb-20 scrollable-x">
        {tabs.map(tab => (
          <button key={tab.id} className={`pill ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="hub-content animate-fadeIn">
        {activeTab === 'viewer' && <DataViewer setGlobalData={setUploadedData} />}
        {activeTab === 'finance' && <FinanceHub subtool={toolId} />}
        {activeTab === 'profiling' && <DataProfilingTool data={uploadedData} />}
        {activeTab === 'mock' && <MockDataGenerator />}
        {activeTab === 'json-csv' && <JsonCsvConverter />}
      </div>
    </div>
  );
};

const DataViewer = ({ setGlobalData }) => {
    const [data, setData] = useState([]);
    const [headers, setHeaders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fileName, setFileName] = useState('');
    const [result, setResult] = useState(null);

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setLoading(true);

        setFileName(file.name);
        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target.result;
            if (file.name.endsWith('.csv')) {
                Papa.parse(content, {
                    header: true,
                    complete: (results) => {
                        setHeaders(results.meta.fields || []);
                        setData(results.data);
                        setGlobalData(results.data);
                        setResult({ text: content, filename: file.name });
                        setLoading(false);
                    }
                });
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="grid gap-15">
            <div className="card p-20 flex-column align-center text-center glass-card">
                <div className="file-input-wrapper">
                    <input type="file" accept=".csv" onChange={handleFileUpload} />
                    <div className="file-input-label">
                        <span className="material-icons">{fileName ? 'description' : 'cloud_upload'}</span>
                        <span>{fileName || 'Click or drag CSV file to browse'}</span>
                    </div>
                </div>
                {loading && <div className="mt-10 rotating material-icons color-primary">refresh</div>}
            </div>
            {data.length > 0 && (
                <div className="card p-0 overflow-auto glass-card" style={{ maxHeight: '400px' }}>
                    <table className="w-full">
                        <thead style={{ position: 'sticky', top: 0, background: 'var(--surface-solid)' }}>
                            <tr>{headers.map(h => <th key={h} style={{ padding: '12px', textAlign: 'left' }}>{h}</th>)}</tr>
                        </thead>
                        <tbody>
                            {data.slice(0, 50).map((row, i) => (
                                <tr key={i} style={{ borderTop: '1px solid var(--border)' }}>
                                    {headers.map(h => <td key={h} style={{ padding: '10px' }}>{String(row[h])}</td>)}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            <ToolResult result={result} />
        </div>
    );
};

const DataProfilingTool = ({ data }) => {
    if (!data) return <div className="text-center p-30 card glass-card opacity-6">Upload data in Viewer first.</div>;

    const stats = useMemo(() => {
        const results = {};
        if (data.length === 0) return results;
        const keys = Object.keys(data[0]);

        keys.forEach(key => {
            const values = data.map(d => parseFloat(d[key])).filter(v => !isNaN(v));
            if (values.length > 0) {
                values.sort((a, b) => a - b);
                const sum = values.reduce((a, b) => a + b, 0);
                const mean = sum / values.length;
                const median = values[Math.floor(values.length / 2)];
                const min = values[0];
                const max = values[values.length - 1];

                // Mode
                const counts = {};
                values.forEach(v => counts[v] = (counts[v] || 0) + 1);
                let mode = values[0], maxCount = 0;
                for (let v in counts) {
                    if (counts[v] > maxCount) {
                        maxCount = counts[v];
                        mode = v;
                    }
                }

                // Std Dev
                const sqDiffs = values.map(v => Math.pow(v - mean, 2));
                const stdDev = Math.sqrt(sqDiffs.reduce((a, b) => a + b, 0) / values.length);

                results[key] = { mean: mean.toFixed(2), median, mode, min, max, stdDev: stdDev.toFixed(2), count: values.length };
            }
        });
        return results;
    }, [data]);

    return (
        <div className="grid gap-15">
            <div className="card p-20 glass-card">
                <h3 className="mb-10">Data Summary ({data.length} rows)</h3>
                <div className="grid gap-10">
                    {Object.entries(stats).map(([col, s]) => (
                        <div key={col} className="p-10 border rounded" style={{background: 'var(--primary-glow)'}}>
                            <div className="font-bold color-primary uppercase smallest mb-5">{col}</div>
                            <div className="grid grid-3 smallest">
                                <div>Mean: <b>{s.mean}</b></div>
                                <div>Median: <b>{s.median}</b></div>
                                <div>Mode: <b>{s.mode}</b></div>
                                <div>Min: <b>{s.min}</b></div>
                                <div>Max: <b>{s.max}</b></div>
                                <div>StdDev: <b>{s.stdDev}</b></div>
                            </div>
                        </div>
                    ))}
                    {Object.keys(stats).length === 0 && <div className="opacity-5">No numerical columns found to analyze.</div>}
                </div>
            </div>
            <ToolResult result={JSON.stringify(stats, null, 2)} />
        </div>
    );
};

const JsonCsvConverter = () => {
    const [input, setInput] = useState('');
    const [result, setResult] = useState(null);
    const convertToCsv = () => {
        try {
            const json = JSON.parse(input);
            const csv = Papa.unparse(json);
            setResult({ text: csv, filename: 'converted.csv' });
        } catch (e) { alert("Invalid JSON input"); }
    };
    const convertToJson = () => {
        Papa.parse(input, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                setResult({ text: JSON.stringify(results.data, null, 2), filename: 'converted.json' });
            },
            error: (e) => alert("Invalid CSV input: " + e.message)
        });
    };
    return (
        <div className="card p-20 glass-card grid gap-15">
            <textarea className="pill font-mono" rows="8" value={input} onChange={e => setInput(e.target.value)} placeholder="Paste JSON or CSV here..." />
            <div className="flex-gap">
                <button className="btn-primary flex-1" onClick={convertToCsv}>JSON to CSV</button>
                <button className="pill flex-1" onClick={convertToJson}>CSV to JSON</button>
            </div>
            <ToolResult result={result} />
        </div>
    );
};

const MockDataGenerator = () => {
    const [rows, setRows] = useState(10);
    const [result, setResult] = useState(null);
    const generate = () => {
        const data = Array.from({ length: rows }, (_, i) => ({
            id: i + 1,
            name: `User ${i + 1}`,
            email: `user${i + 1}@example.com`,
            score: Math.floor(Math.random() * 100)
        }));
        setResult({ text: JSON.stringify(data, null, 2), filename: 'mock_data.json' });
    };
    return (
        <div className="card p-20 text-center glass-card">
            <div className="form-group">
                <label>Number of Rows</label>
                <input type="number" className="pill mb-15" value={rows} onChange={e=>setRows(e.target.value)} />
            </div>
            <button className="btn-primary w-full" onClick={generate}>Generate Mock Data</button>
            <ToolResult result={result} />
        </div>
    );
});

export default DataTools;
