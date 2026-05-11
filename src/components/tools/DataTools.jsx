import React, { useState, useEffect } from 'react';

const DataTools = ({ toolId, onResultChange }) => {
  const [activeTab, setActiveTab] = useState('science');

  useEffect(() => {
    if (toolId) {
      const mapping = {
        'regression': 'science',
        'correlation': 'science',
        'descriptive-stats': 'science',
        'anomaly-detection': 'anomaly',
        'data-quality': 'quality',
        'data-portal': 'portal',
        'predictive-analysis': 'predictive',
        'observability': 'observability',
        'specialized-tools': 'specialized',
        'data-anonymizer': 'anonymizer'
      };
      if (mapping[toolId]) setActiveTab(mapping[toolId]);
    }
  }, [toolId]);

  const tabs = [
    { id: 'science', label: 'Data Science' },
    { id: 'anomaly', label: 'Anomaly Detect' },
    { id: 'quality', label: 'Data Quality' },
    { id: 'portal', label: 'Data Portal' },
    { id: 'predictive', label: 'Predictive' },
    { id: 'observability', label: 'Observability' },
    { id: 'specialized', label: 'Specialized' },
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

      {activeTab === 'science' && <DataScienceTool onResultChange={onResultChange} />}
      {activeTab === 'anomaly' && <AnomalyTool onResultChange={onResultChange} />}
      {['quality', 'portal', 'predictive', 'observability', 'specialized', 'anonymizer'].includes(activeTab) && (
          <div className="text-center p-20 card opacity-6">
              <span className="material-icons mb-10" style={{fontSize: '2rem'}}>insights</span>
              <div>This data science tool is being integrated.</div>
          </div>
      )}
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
            <button className="btn-primary" onClick={calc}>Linear Regression</button>
            {res && <div className="tool-result text-center font-bold">y = {res.slope.toFixed(3)}x + {res.intercept.toFixed(3)}</div>}
        </div>
    );
};

const AnomalyTool = ({ onResultChange }) => {
    const [input, setInput] = useState('10,12,11,100,10,11,50');
    const [out, setOut] = useState(null);
    const detect = () => {
        const nums = input.split(',').map(Number);
        const mean = nums.reduce((a,b)=>a+b)/nums.length;
        const std = Math.sqrt(nums.map(x=>Math.pow(x-mean,2)).reduce((a,b)=>a+b)/nums.length);
        const anomalies = nums.filter(x => Math.abs(x-mean) > 2*std);
        setOut(anomalies);
        onResultChange({ text: `Anomalies: ${anomalies.join(', ')}`, filename: 'anomalies.txt' });
    };
    return (
        <div className="grid gap-15 card p-15">
            <input className="pill" value={input} onChange={e=>setInput(e.target.value)} />
            <button className="btn-primary" onClick={detect}>Detect Anomalies</button>
            {out && <div className="tool-result">Found {out.length} outliers: {out.join(', ')}</div>}
        </div>
    );
};

export default DataTools;
