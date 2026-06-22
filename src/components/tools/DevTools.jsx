import React, { useState, useEffect } from 'react';
import ToolResult from './ToolResult';

const DEV_TABS = [
  { id: 'json-fmt', label: 'JSON Formatter' },
  { id: 'sql', label: 'SQL Formatter' },
  { id: 'diff', label: 'Diff Viewer' },
  { id: 'converter', label: 'Unit Converter' },
  { id: 'security', label: 'Hash & HMAC' },
  { id: 'regex', label: 'Regex Tester' },
  { id: 'otp', label: 'OTP Generator' },
  { id: 'kusto', label: 'KQL Formatter' },
  { id: 'base64', label: 'Base64' },
  { id: 'jwt', label: 'JWT Debugger' },
  { id: 'cron', label: 'Cron Parser' },
  { id: 'url', label: 'URL Encoder' },
  { id: 'word-rank', label: 'Word Rank' },
  { id: 'yaml', label: 'YAML ↔ JSON' },
  { id: 'minifier', label: 'Code Minifier' },
  { id: 'xml-json', label: 'XML ↔ JSON' },
  { id: 'xml-fmt', label: 'XML Formatter' },
  { id: 'json-ts', label: 'JSON to TS' },
  { id: 'color', label: 'Color Picker' },
  { id: 'qr-barcode', label: 'QR & Barcode' }
].sort((a, b) => a.label.localeCompare(b.label));

const DevTools = ({ toolId, onSubtoolChange }) => {
  const [activeTab, setActiveTab] = useState('json-fmt');

  useEffect(() => {
    const current = DEV_TABS.find(t => t.id === activeTab);
    if (current && onSubtoolChange) onSubtoolChange(current.label);
  }, [activeTab, onSubtoolChange]);

  useEffect(() => {
    if (toolId) {
      const mapping = {
        'json-fmt': 'json-fmt', 'sql': 'sql', 'diff': 'diff',
        'converter': 'converter', 'security': 'security',
        'regex': 'regex', 'otp': 'otp', 'kusto': 'kusto',
        'base64': 'base64', 'jwt': 'jwt', 'cron': 'cron',
        'url': 'url', 'word-rank': 'word-rank', 'yaml': 'yaml', 'minifier': 'minifier',
        'xml-json': 'xml-json', 'xml-fmt': 'xml-fmt',
        'json-ts': 'json-ts', 'color': 'color', 'qr-barcode': 'qr-barcode'
      };
      if (mapping[toolId]) setActiveTab(mapping[toolId]);
    }
  }, [toolId]);

  return (
    <div className="tool-form mt-20">
      <div className="pill-group mb-20 scrollable-x">
        {DEV_TABS.map(tab => (
          <button key={tab.id} className={`pill ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="hub-content animate-fadeIn">
        <DevSubtool activeTab={activeTab} />
      </div>
    </div>
  );
};

const DevSubtool = ({ activeTab }) => {
    const [input, setInput] = useState('');
    const [result, setResult] = useState(null);

    const run = () => {
        if (!input.trim()) return;
        try {
            if (activeTab === 'json-fmt') {
                const parsed = JSON.parse(input);
                setResult({ text: JSON.stringify(parsed, null, 2), filename: 'formatted.json' });
            } else if (activeTab === 'base64') {
                setResult({ text: btoa(input), filename: 'encoded.txt' });
            } else if (activeTab === 'url') {
                setResult({ text: encodeURIComponent(input), filename: 'encoded_url.txt' });
            } else if (activeTab === 'word-rank') {
                const word = input.toUpperCase().replace(/[^A-Z]/g, '');
                if (!word) throw new Error("Please enter a valid word.");
                const factorial = (n) => {
                    let res = BigInt(1);
                    for (let i = 2n; i <= BigInt(n); i++) res *= i;
                    return res;
                };
                const len = word.length;
                let rank = BigInt(1);
                let charCount = {};
                for (const ch of word) charCount[ch] = (charCount[ch] || 0n) + 1n;
                const getFactorialDivisor = (counts) => {
                    let divisor = BigInt(1);
                    for (const key in counts) divisor *= factorial(Number(counts[key]));
                    return divisor;
                };
                for (let i = 0; i < len; i++) {
                    let countSmaller = 0n;
                    for (const key in charCount) {
                        if (key < word[i]) countSmaller += charCount[key];
                    }
                    if (countSmaller > 0n) {
                        const mul = factorial(len - 1 - i);
                        const divisor = getFactorialDivisor(charCount);
                        rank += (countSmaller * mul) / divisor;
                    }
                    charCount[word[i]]--;
                    if (charCount[word[i]] === 0n) delete charCount[word[i]];
                }
                setResult({ text: `Rank of the word: ${rank.toString()}` });
            } else {
                setResult({ text: `Simulated result for ${activeTab}:\n${input.split('').reverse().join('')}` });
            }
        } catch (e) {
            setResult({ error: e.message });
        }
    };

    return (
        <div className="card p-30 glass-card grid gap-15">
            <textarea className="pill w-full font-mono" rows="8" placeholder={`Enter input for ${activeTab}...`} value={input} onChange={e=>setInput(e.target.value)} />
            <button className="btn-primary w-full" onClick={run}>Run {activeTab}</button>
            <ToolResult result={result} />
        </div>
    );
};

export default DevTools;
