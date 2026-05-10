import React, { useState } from 'react';

const PredictiveAnalysis = ({ onResultChange }) => {
  const [input, setInput] = useState('0.5, 0.2, 0.8, 1.1, 0.4');
  const [report, setReport] = useState(null);

  const analyze = () => {
    const vals = input.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n));
    if (vals.length < 2) return;

    // Local heuristic "AI" model for telemetry classification
    // 1. Trend analysis
    const diffs = [];
    for (let i = 1; i < vals.length; i++) diffs.push(vals[i] - vals[i-1]);
    const avgDiff = diffs.reduce((a, b) => a + b, 0) / diffs.length;

    // 2. Threshold check
    const max = Math.max(...vals);
    const min = Math.min(...vals);

    let classification = 'Stable';
    let confidence = 0.85;
    let icon = 'trending_flat';

    if (avgDiff > 0.2) {
      classification = 'Increasing Trend';
      icon = 'trending_up';
    } else if (avgDiff < -0.2) {
      classification = 'Decreasing Trend';
      icon = 'trending_down';
    }

    if (max > 2.0) {
      classification = 'Critical Peak Detected';
      confidence = 0.94;
      icon = 'priority_high';
    }

    const res = {
      classification,
      confidence: (confidence * 100).toFixed(0) + '%',
      avgChange: avgDiff.toFixed(3),
      volatility: (max - min).toFixed(3)
    };

    setReport(res);
    onResultChange({ text: JSON.stringify(res, null, 2), filename: 'prediction.json' });
  };

  return (
    <div className="tool-form">
      <div className="form-group">
        <label>Telemetry Sequence (CSV)</label>
        <textarea
          className="pill w-full font-mono"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="0.5, 0.8, 1.2, 1.1..."
        />
      </div>
      <button className="btn-primary w-full" onClick={analyze}>Run Heuristic Prediction</button>

      {report && (
        <div className="tool-result text-center">
          <div className="font-bold" style={{ fontSize: '1.25rem', color: 'var(--primary)' }}>{report.classification}</div>
          <div className="mt-10 opacity-7">Confidence: {report.confidence}</div>
          <div className="grid gap-10 mt-20" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className="card p-10">
              <div style={{ fontSize: '0.7rem' }}>AVG CHANGE</div>
              <div className="font-bold">{report.avgChange}</div>
            </div>
            <div className="card p-10">
              <div style={{ fontSize: '0.7rem' }}>VOLATILITY</div>
              <div className="font-bold">{report.volatility}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PredictiveAnalysis;
