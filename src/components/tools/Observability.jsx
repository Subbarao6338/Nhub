import React, { useState } from 'react';

const Observability = ({ onResultChange }) => {
  const [logInput, setLogInput] = useState('');
  const [report, setReport] = useState(null);

  const analyzeLogs = () => {
    if (!logInput.trim()) return;

    const lines = logInput.split('\n').map(l => l.trim()).filter(Boolean);
    const stats = {
      error: 0,
      warn: 0,
      info: 0,
      total: lines.length,
      patterns: {}
    };

    lines.forEach(line => {
      const lower = line.toLowerCase();
      if (lower.includes('error') || lower.includes('fail') || lower.includes('critical') || lower.includes('exception')) {
        stats.error++;
      } else if (lower.includes('warn')) {
        stats.warn++;
      } else {
        stats.info++;
      }

      // Basic pattern frequency (first 3 words)
      const words = line.split(/\s+/).slice(0, 3).join(' ');
      stats.patterns[words] = (stats.patterns[words] || 0) + 1;
    });

    const sortedPatterns = Object.entries(stats.patterns)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    setReport({ ...stats, sortedPatterns });
    onResultChange({ text: JSON.stringify(stats, null, 2), filename: 'log_report.json' });
  };

  return (
    <div className="tool-form">
      <div className="form-group">
        <label>Raw Logs</label>
        <textarea
          rows="10"
          className="pill w-full font-mono"
          placeholder="Paste log entries here..."
          value={logInput}
          onChange={e => setLogInput(e.target.value)}
        />
      </div>
      <button className="btn-primary w-full" onClick={analyzeLogs}>Analyze Log Patterns</button>

      {report && (
        <div className="tool-result">
          <div className="grid gap-12" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            <div className="card p-10 text-center" style={{ borderLeft: '4px solid #ef4444' }}>
              <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>ERRORS</div>
              <div className="font-bold">{report.error}</div>
            </div>
            <div className="card p-10 text-center" style={{ borderLeft: '4px solid #f59e0b' }}>
              <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>WARNINGS</div>
              <div className="font-bold">{report.warn}</div>
            </div>
            <div className="card p-10 text-center" style={{ borderLeft: '4px solid var(--primary)' }}>
              <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>TOTAL</div>
              <div className="font-bold">{report.total}</div>
            </div>
          </div>

          <div className="mt-20">
            <div className="font-bold mb-10 opacity-7">Top Log Signatures:</div>
            <div className="grid gap-8">
              {report.sortedPatterns.map(([pattern, count], i) => (
                <div key={i} className="flex-between p-8-16 bg-primary-light" style={{ borderRadius: '8px', fontSize: '0.85rem' }}>
                  <code className="font-mono">{pattern}...</code>
                  <span className="font-bold">{count}x</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Observability;
