import React, { useState } from 'react';
import ToolResult from '../ToolResult';
import { copyToClipboard } from '../../../utils/helpers';

const UserScripts = () => {
    const [result, setResult] = useState(null);
    const scripts = [
        { name: 'Dark Mode Everywhere', code: "document.body.style.filter = 'invert(1) hue-rotate(180deg)';" },
        { name: 'Speed Up Videos', code: "document.querySelectorAll('video').forEach(v => v.playbackRate = 2.0);" },
        { name: 'Remove Sticky Headers', code: "document.querySelectorAll('*').forEach(el => { if(getComputedStyle(el).position === 'fixed') el.style.display = 'none'; });" }
    ];

    const handleCopy = (code) => {
        copyToClipboard(code, () => {
            setResult({ text: 'Script copied to clipboard! Paste it into your browser console to run.' });
        });
    };

    return (
        <div className="card p-30 glass-card text-center grid gap-15">
            <h3>User Scripts Gallery</h3>
            <p className="smallest opacity-6">Common scripts for browser console execution.</p>
            <div className="grid gap-10">
                {scripts.map(s => (
                    <div key={s.name} className="flex-between p-10" style={{ background: 'var(--brand-bg-light)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                        <span className="small font-bold">{s.name}</span>
                        <button className="pill" style={{fontSize: '0.7rem', padding: '4px 12px'}} onClick={() => handleCopy(s.code)}>Copy Script</button>
                    </div>
                ))}
            </div>
            <ToolResult result={result} onClear={() => setResult(null)} />
        </div>
    );
};

export default UserScripts;
