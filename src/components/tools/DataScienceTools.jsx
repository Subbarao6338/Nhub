import React, { useState } from 'react';

const DataScienceTools = () => {
  const [activeTab, setActiveTab] = useState('regression');

  return (
    <div className="tool-form">
      <div className="pill-group mb-20 scrollable-x">
        <button className={`pill ${activeTab === 'regression' ? 'active' : ''}`} onClick={() => setActiveTab('regression')}>Linear Regression</button>
        <button className={`pill ${activeTab === 'correlation' ? 'active' : ''}`} onClick={() => setActiveTab('correlation')}>Correlation</button>
        <button className={`pill ${activeTab === 'descriptive' ? 'active' : ''}`} onClick={() => setActiveTab('descriptive')}>Descriptive Stats</button>
      </div>

      {activeTab === 'regression' && <LinearRegressionTool />}
      {activeTab === 'correlation' && <CorrelationTool />}
      {activeTab === 'descriptive' && <DescriptiveStatsTool />}
    </div>
  );
};

const LinearRegressionTool = () => {
  const [data, setData] = useState('1,2\n2,3\n3,5\n4,4\n5,6');
  const [result, setResult] = useState(null);

  const calculate = () => {
    try {
      const pairs = data.split('\n').map(line => line.split(',').map(Number));
      const n = pairs.length;
      let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
      for (const [x, y] of pairs) {
        sumX += x;
        sumY += y;
        sumXY += x * y;
        sumX2 += x * x;
      }
      const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
      const intercept = (sumY - slope * sumX) / n;
      setResult({ slope, intercept });
    } catch (e) {
      alert("Invalid data format. Use x,y per line.");
    }
  };

  return (
    <div className="grid gap-15">
      <label className="font-semibold opacity-7">Input Pairs (x,y per line)</label>
      <textarea
        className="pill w-full"
        rows="6"
        value={data}
        onChange={e => setData(e.target.value)}
        style={{ fontFamily: 'monospace' }}
      />
      <button className="btn-primary" onClick={calculate}>Calculate Regression</button>
      {result && (
        <div className="tool-result text-center">
          <div className="font-bold" style={{ fontSize: '1.2rem' }}>y = {result.slope.toFixed(3)}x + {result.intercept.toFixed(3)}</div>
          <div className="mt-10 opacity-7">Slope: {result.slope.toFixed(4)} | Intercept: {result.intercept.toFixed(4)}</div>
        </div>
      )}
    </div>
  );
};

const DescriptiveStatsTool = () => {
  const [data, setData] = useState('10, 20, 30, 40, 50');
  const [result, setResult] = useState(null);

  const calculate = () => {
    const nums = data.split(',').map(Number).filter(n => !isNaN(n)).sort((a,b) => a-b);
    if (nums.length === 0) return;
    const sum = nums.reduce((a, b) => a + b, 0);
    const mean = sum / nums.length;
    const variance = nums.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / nums.length;

    let median;
    const mid = Math.floor(nums.length / 2);
    if (nums.length % 2 === 0) {
      median = (nums[mid - 1] + nums[mid]) / 2;
    } else {
      median = nums[mid];
    }

    setResult({
      mean: mean.toFixed(2),
      median: median,
      stdDev: Math.sqrt(variance).toFixed(2),
      min: nums[0],
      max: nums[nums.length - 1],
      count: nums.length
    });
  };

  return (
    <div className="grid gap-15">
      <textarea value={data} onChange={e => setData(e.target.value)} className="pill w-full" rows="3" placeholder="10, 20, 30..." />
      <button className="btn-primary" onClick={calculate}>Calculate Stats</button>
      {result && (
        <div className="tool-result grid gap-10" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <div>Mean: <b>{result.mean}</b></div>
          <div>Median: <b>{result.median}</b></div>
          <div>Std Dev: <b>{result.stdDev}</b></div>
          <div>Count: <b>{result.count}</b></div>
          <div>Min: <b>{result.min}</b></div>
          <div>Max: <b>{result.max}</b></div>
        </div>
      )}
    </div>
  );
};

const CorrelationTool = () => {
  const [data, setData] = useState('1,2,3\n2,4,6\n3,5,9');
  const [matrix, setMatrix] = useState(null);

  const calculate = () => {
    try {
      const rows = data.split('\n').map(line => line.split(',').map(Number));
      const numCols = rows[0].length;
      const res = Array.from({ length: numCols }, () => Array(numCols).fill(0));

      const getCol = (idx) => rows.map(r => r[idx]);
      const pearson = (x, y) => {
        const n = x.length;
        const meanX = x.reduce((a, b) => a + b) / n;
        const meanY = y.reduce((a, b) => a + b) / n;
        let num = 0, denX = 0, denY = 0;
        for (let i = 0; i < n; i++) {
          num += (x[i] - meanX) * (y[i] - meanY);
          denX += Math.pow(x[i] - meanX, 2);
          denY += Math.pow(y[i] - meanY, 2);
        }
        return num / Math.sqrt(denX * denY);
      };

      for (let i = 0; i < numCols; i++) {
        for (let j = 0; j < numCols; j++) {
          res[i][j] = i === j ? 1 : pearson(getCol(i), getCol(j));
        }
      }
      setMatrix(res);
    } catch (e) {
      alert("Invalid data. Ensure all rows have same number of columns.");
    }
  };

  return (
    <div className="grid gap-15">
      <label className="font-semibold opacity-7">CSV Data (one row per line)</label>
      <textarea
        className="pill w-full"
        rows="6"
        value={data}
        onChange={e => setData(e.target.value)}
        style={{ fontFamily: 'monospace' }}
      />
      <button className="btn-primary" onClick={calculate}>Generate Correlation Matrix</button>
      {matrix && (
        <div className="tool-result overflow-x-auto">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              {matrix.map((row, i) => (
                <tr key={i}>
                  {row.map((val, j) => (
                    <td key={j} style={{
                      padding: '8px',
                      border: '1px solid var(--border)',
                      textAlign: 'center',
                      background: `rgba(var(--primary-rgb), ${Math.abs(val) * 0.2})`
                    }}>
                      {val.toFixed(2)}
                    </td>
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

export default DataScienceTools;
