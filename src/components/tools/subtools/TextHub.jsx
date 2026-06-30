import React, { useState } from 'react';
import ToolResult from '../ToolResult';

const TextHub = () => {
    const [input, setInput] = useState('');
    const [res, setRes] = useState(null);

    const run = () => {
        if (!input.trim()) return;

        const lines = input.split(/\r\n|\r|\n/).length;
        const words = input.trim().split(/\s+/).filter(w => w.length > 0);
        const charCount = input.length;
        const charNoSpaces = input.replace(/\s/g, '').length;
        const sentenceCount = input.split(/[.!?]+/).filter(s => s.trim().length > 0).length;

        const avgWordLength = words.length > 0
            ? (words.reduce((acc, word) => acc + word.length, 0) / words.length).toFixed(2)
            : 0;

        const readingTime = Math.ceil(words.length / 200);

        // Word Frequency
        const freq = {};
        words.forEach(w => {
            const word = w.toLowerCase().replace(/[^a-z0-9]/g, '');
            if (word.length > 2) {
                freq[word] = (freq[word] || 0) + 1;
            }
        });
        const topWords = Object.entries(freq)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([word, count]) => `${word} (${count})`)
            .join(', ');

        const analytics = [
            `Lines: ${lines}`,
            `Words: ${words.length}`,
            `Sentences: ${sentenceCount}`,
            `Characters (total): ${charCount}`,
            `Characters (no spaces): ${charNoSpaces}`,
            `Average Word Length: ${avgWordLength}`,
            `Estimated Reading Time: ~${readingTime} min`,
            `Top Words: ${topWords || 'N/A'}`
        ].join('\n');

        setRes({ text: analytics });
    };

    return (
        <div className="card p-20 glass-card grid gap-15">
            <h3 className="text-center">Advanced Text Analytics</h3>
            <textarea
                className="pill w-full"
                rows="8"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Paste text here for deep analysis..."
                style={{ borderRadius: '16px', padding: '15px' }}
            />
            <button className="btn-primary" onClick={run}>
                <span className="material-icons mr-10">analytics</span>
                Analyze Text
            </button>
            <ToolResult result={res} />
        </div>
    );
};

export default TextHub;
