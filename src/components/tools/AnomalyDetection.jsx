import React, { useState } from 'react';

const AnomalyDetection = ({ onResultChange }) => {
  const [dataInput, setDataInput] = useState('10, 12, 11, 10, 100, 10, 11, 12, 9, 10, 50, 11');
  const [sensitivity, setSensitivity] = useState(2); // Z-score threshold
  const [isDetecting, setIsDetecting] = useState(false);
  const [results, setResults] = useState(null);

  const startDetection = () => {
    if (!dataInput) return;
    setIsDetecting(true);
    setResults(null);

    setTimeout(() => {
      try {
        const numbers = dataInput.split(/[\n,]/).map(s => parseFloat(s.trim())).filter(n => !isNaN(n));
        if (numbers.length < 3) throw new Error("Need at least 3 data points");

        // 1. Z-Score Calculation
        const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
        const stdDev = Math.sqrt(numbers.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b, 0) / numbers.length);

        const zScoreAnomalies = numbers.map((x, idx) => ({
          value: x,
          index: idx,
          zScore: Math.abs((x - mean) / (stdDev || 1))
        })).filter(item => item.zScore > sensitivity);

        // 2. IQR (Interquartile Range) Method
        const sorted = [...numbers].sort((a, b) => a - b);
        const q1 = sorted[Math.floor(sorted.length * 0.25)];
        const q3 = sorted[Math.floor(sorted.length * 0.75)];
        const iqr = q3 - q1;
        const lowerBound = q1 - 1.5 * iqr;
        const upperBound = q3 + 1.5 * iqr;

        const iqrAnomalies = numbers.map((x, idx) => ({
          value: x,
          index: idx,
          isAnomaly: x < lowerBound || x > upperBound
        })).filter(item => item.isAnomaly);

        const res = {
          totalPoints: numbers.length,
          mean: mean.toFixed(2),
          stdDev: stdDev.toFixed(2),
          zScoreAnomalies: zScoreAnomalies,
          iqrAnomalies: iqrAnomalies,
          zScoreThreshold: sensitivity,
          iqrBounds: `[${lowerBound.toFixed(2)}, ${upperBound.toFixed(2)}]`
        };

        setResults(res);
        setIsDetecting(false);

        onResultChange({
          text: JSON.stringify(res, null, 2),
          filename: `anomaly_report.json`
        });
      } catch (e) {
        alert(e.message);
        setIsDetecting(false);
      }
    }, 800);
  };

  return (
    <div className="tool-form">
      <div className="form-group">
        <label>Data Points (comma or line separated)</label>
        <textarea
          value={dataInput}
          onChange={e => setDataInput(e.target.value)}
          placeholder="10, 12, 11, 100, 10..."
          className="pill"
          style={{ width: '100%', height: '120px', padding: '12px' }}
        />
      </div>

      <div className="form-group">
        <label>Z-Score Sensitivity: {sensitivity}σ</label>
        <input
          type="range"
          min="1"
          max="5"
          step="0.5"
          value={sensitivity}
          onChange={(e) => setSensitivity(parseFloat(e.target.value))}
          style={{ width: '100%' }}
        />
        <div className="flex-between opacity-5" style={{ fontSize: '0.7rem' }}>
          <span>High Sensitivity (1σ)</span>
          <span>Low Sensitivity (5σ)</span>
        </div>
      </div>

      <button className="btn-primary w-full mt-10" onClick={startDetection} disabled={isDetecting}>
        {isDetecting ? 'Running Math...' : 'Detect Outliers Locally'}
      </button>

      {results && (
        <div className="tool-result">
          <div className="grid gap-12" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}>
            <div className="card p-10 text-center">
              <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>MEAN</div>
              <div className="font-bold">{results.mean}</div>
            </div>
            <div className="card p-10 text-center">
              <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>STD DEV</div>
              <div className="font-bold">{results.stdDev}</div>
            </div>
            <div className="card p-10 text-center">
              <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>Z-SCORE OUTLIERS</div>
              <div className="font-bold" style={{ color: results.zScoreAnomalies.length > 0 ? '#ef4444' : 'inherit' }}>
                {results.zScoreAnomalies.length}
              </div>
            </div>
            <div className="card p-10 text-center">
              <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>IQR OUTLIERS</div>
              <div className="font-bold" style={{ color: results.iqrAnomalies.length > 0 ? '#ef4444' : 'inherit' }}>
                {results.iqrAnomalies.length}
              </div>
            </div>
          </div>

          {results.zScoreAnomalies.length > 0 && (
            <div className="mt-20">
              <div className="font-semibold mb-10 opacity-7">Detected Anomalies:</div>
              <div className="flex-wrap gap-10">
                {results.zScoreAnomalies.map((a, i) => (
                  <span key={i} className="pill" style={{ background: 'rgba(239, 68, 68, 0.1)', borderColor: '#ef4444', color: '#ef4444' }}>
                    {a.value} (Idx {a.index})
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AnomalyDetection;
