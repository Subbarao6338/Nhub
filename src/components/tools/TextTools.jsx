import React, { useState, useEffect, useMemo } from 'react';

const TextTools = ({ toolId, onResultChange }) => {
  const [activeTab, setActiveTab] = useState('modify');
  const [input, setInput] = useState('');

  useEffect(() => {
    if (toolId) {
      const mapping = {
        'character-counter': 'stats',
        'lorem-ipsum': 'lorem',
        'html-entities': 'html',
        'word-rank': 'rank',
        'translate': 'translate',
        'morse': 'morse',
        'ai-summary': 'ai',
        'web-to-md': 'web-md'
      };
      if (mapping[toolId]) setActiveTab(mapping[toolId]);
    }
  }, [toolId]);

  useEffect(() => {
    if (input) onResultChange({ text: input, filename: 'text.txt' });
  }, [input, onResultChange]);

  const tabs = [
    { id: 'modify', label: 'Modify' },
    { id: 'stats', label: 'Stats' },
    { id: 'lorem', label: 'Lorem Ipsum' },
    { id: 'html', label: 'HTML Entities' },
    { id: 'rank', label: 'Word Rank' },
    { id: 'translate', label: 'Translate' },
    { id: 'morse', label: 'Morse' },
    { id: 'ai', label: 'AI Summary' },
    { id: 'web-md', label: 'Web to MD' }
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

      <textarea rows="6" className="pill w-full mb-20" placeholder="Enter text here..." value={input} onChange={e=>setInput(e.target.value)} />

      {activeTab === 'modify' && (
          <div className="grid grid-3 gap-10">
              <button className="pill" onClick={()=>setInput(input.toUpperCase())}>UPPERCASE</button>
              <button className="pill" onClick={()=>setInput(input.toLowerCase())}>lowercase</button>
              <button className="pill" onClick={()=>setInput(input.split('').reverse().join(''))}>Reverse</button>
          </div>
      )}

      {activeTab === 'stats' && (
          <div className="grid grid-2 gap-15">
              <div className="tool-result">Chars: <b>{input.length}</b></div>
              <div className="tool-result">Words: <b>{input.trim() ? input.trim().split(/\s+/).length : 0}</b></div>
          </div>
      )}

      {['lorem', 'html', 'rank', 'translate', 'morse', 'ai', 'web-md'].includes(activeTab) && (
          <div className="text-center p-20 card opacity-6">
              <span className="material-icons mb-10" style={{fontSize: '2rem'}}>description</span>
              <div>This text tool is being integrated.</div>
          </div>
      )}
    </div>
  );
};

export default TextTools;
