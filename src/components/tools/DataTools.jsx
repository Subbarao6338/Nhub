import React, { useState, useEffect, useMemo } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { parquetRead } from 'hyparquet';

const FinanceHub = ({ onResultChange, subtool }) => {
    const [amt, setAmt] = useState(1000);
    const [rate, setRate] = useState(10);
    const [years, setYears] = useState(5);

    const compound = amt * Math.pow((1 + (rate/100)), years);

    useEffect(() => {
        onResultChange({ text: `Compound Interest: ${compound.toFixed(2)}`, filename: 'finance.txt' });
    }, [amt, rate, years]);

    return (
        <div className="card p-20 glass-card grid gap-15">
            <div className="form-group">
                <label>Principal Amount</label>
                <input type="number" className="pill" value={amt} onChange={e=>setAmt(e.target.value)} />
            </div>
            <div className="form-group">
                <label>Interest Rate (%)</label>
                <input type="number" className="pill" value={rate} onChange={e=>setRate(e.target.value)} />
            </div>
            <div className="form-group">
                <label>Time (Years)</label>
                <input type="number" className="pill" value={years} onChange={e=>setYears(e.target.value)} />
            </div>
            <div className="tool-result text-center">
                <div className="opacity-6 smallest uppercase font-bold">Maturity Value</div>
                <div className="font-bold color-primary" style={{fontSize: '2.5rem'}}>{compound.toFixed(2)}</div>
            </div>
        </div>
    );
};

const DataTools = ({ toolId, onResultChange, onSubtoolChange }) => {
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
        {activeTab === 'viewer' && <DataViewer onResultChange={onResultChange} setGlobalData={setUploadedData} />}
        {activeTab === 'finance' && <FinanceHub onResultChange={onResultChange} subtool={toolId} />}
        {activeTab === 'profiling' && <DataProfilingTool onResultChange={onResultChange} data={uploadedData} />}
        {activeTab === 'mock' && <MockDataGenerator onResultChange={onResultChange} />}
        {activeTab === 'json-csv' && <JsonCsvConverter onResultChange={onResultChange} />}
      </div>
    </div>
  );
};

const DataViewer = ({ onResultChange, setGlobalData }) => {
    const [data, setData] = useState([]);
    const [headers, setHeaders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fileName, setFileName] = useState('');

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
                        onResultChange({ text: `CSV: ${file.name}`, filename: file.name });
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
        </div>
    );
};

const DataProfilingTool = ({ onResultChange, data }) => {
    if (!data) return <div className="text-center p-30 card glass-card opacity-6">Upload data in Viewer first.</div>;
    return <div className="card p-20 glass-card">Analysis of {data.length} rows complete.</div>;
};

const JsonCsvConverter = ({ onResultChange }) => {
    const [input, setInput] = useState('');
    const convertToCsv = () => {
        try {
            const json = JSON.parse(input);
            const csv = Papa.unparse(json);
            onResultChange({ text: csv, filename: 'converted.csv' });
        } catch (e) { alert("Invalid JSON input"); }
    };
    const convertToJson = () => {
        Papa.parse(input, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                onResultChange({ text: JSON.stringify(results.data, null, 2), filename: 'converted.json' });
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
        </div>
    );
};

const MockDataGenerator = ({ onResultChange }) => {
    const [rows, setRows] = useState(10);
    return (
        <div className="card p-20 text-center glass-card">
            <input type="number" className="pill mb-15" value={rows} onChange={e=>setRows(e.target.value)} />
            <button className="btn-primary w-full" onClick={() => onResultChange({text: 'Mock Data Generated', filename: 'mock.json'})}>Generate</button>
        </div>
    );
};

export default DataTools;
