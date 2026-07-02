import React, { useState } from 'react';
import ToolResult from '../ToolResult';

const KqlFormatter = () => {
    const [input, setInput] = useState('');
    const [result, setResult] = useState(null);

    const formatKql = () => {
        if (!input.trim()) return;
        try {
            // Normalize spaces around pipes
            let kql = input.replace(/\s*\|\s*/g, '\n| ').trim();

            // Standard KQL operators to capitalize
            const operators = [
                'where', 'project', 'summarize', 'extend', 'sort by', 'take', 'top',
                'join', 'union', 'render', 'distinct', 'parse', 'mvexpand', 'evaluate',
                'lookup', 'make-series', 'mv-expand', 'order by', 'count', 'limit'
            ];

            operators.forEach(op => {
                const regex = new RegExp(`\\|\\s+${op}\\b`, 'gi');
                kql = kql.replace(regex, `| ${op.toLowerCase()}`);
            });

            // Special handling for commas inside clauses (like project or summarize)
            const lines = kql.split('\n').flatMap(line => {
                if (line.match(/\|\s*(project|summarize|extend|where|order by|sort by)\b/i)) {
                    const parts = line.split(/,\s*/);
                    if (parts.length > 1) {
                        return [parts[0], ...parts.slice(1).map(p => `    ${p}`)];
                    }
                }
                return [line];
            });

            setResult({ text: lines.join('\n'), filename: 'formatted.kql' });
        } catch (e) {
            setResult({ error: e.message });
        }
    };

    return (
        <div className="grid gap-15">
            <div className="alert-info smallest p-10 rounded-lg opacity-8">
                <span className="material-icons v-middle mr-5" style={{fontSize:'1rem'}}>info</span>
                Kusto Query Language (KQL) formatter for Azure Data Explorer / Log Analytics.
            </div>
            <textarea className="pill w-full font-mono text-sm" rows="12" style={{lineHeight: '1.6', borderRadius: '16px', padding: '15px'}} placeholder="SecurityEvent | where EventID == 4624 | project TimeGenerated, Account..." value={input} onChange={e=>setInput(e.target.value)} />
            <div className="flex gap-10">
                <button className="btn-primary flex-1" onClick={formatKql}>
                    <span className="material-icons mr-10">auto_awesome</span>
                    Format KQL
                </button>
                <button className="pill" onClick={() => { setInput(''); setResult(null); }}>Clear</button>
            </div>
            <ToolResult result={result} />
        </div>
    );
};

export default KqlFormatter;
