import React, { useState, useEffect, useMemo } from 'react';
import { jsPDF } from 'jspdf';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

const MarkdownEditor = ({ onResultChange }) => {
  const [md, setMd] = useState('# New Document\n\nStart typing...');
  const html = useMemo(() => DOMPurify.sanitize(marked.parse(md)), [md]);

  const stats = useMemo(() => ({
    words: md.trim() ? md.trim().split(/\s+/).length : 0,
    chars: md.length
  }), [md]);

  const exportPdf = () => {
    const doc = new jsPDF();
    const lines = doc.splitTextToSize(md, 180);
    doc.text(lines, 10, 10);
    const blob = doc.output('blob');
    onResultChange({ text: 'Exported Markdown to PDF', blob, filename: 'document.pdf' });
  };

  const exportHtml = () => {
      const blob = new Blob([`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Nature Doc</title><style>body{font-family:sans-serif;padding:40px;line-height:1.6;max-width:800px;margin:0 auto;}</style></head><body>${html}</body></html>`], { type: 'text/html' });
      onResultChange({ text: 'Exported Markdown to HTML', blob, filename: 'document.html' });
  };

  return (
    <div className="grid gap-15">
      <div className="grid grid-2-cols gap-15">
        <div className="flex-column gap-10">
            <textarea
              className="pill font-mono"
              rows="15"
              style={{height: '400px'}}
              value={md}
              onChange={e => setMd(e.target.value)}
              placeholder="Write markdown here..."
            />
            <div className="flex-center gap-15 opacity-6 smallest uppercase font-bold">
                <span>{stats.words} Words</span>
                <span>{stats.chars} Characters</span>
            </div>
        </div>
        <div className="card p-20 about-content overflow-auto glass-card" style={{ height: '400px' }} dangerouslySetInnerHTML={{ __html: html }} />
      </div>
      <div className="flex-gap">
          <button className="btn-primary flex-1" onClick={exportPdf}>Export to PDF</button>
          <button className="pill flex-1" onClick={exportHtml}>Export to HTML</button>
      </div>
    </div>
  );
};


const DocTools = ({ onResultChange, toolId, onSubtoolChange }) => {
  const tabs = [
    { id: 'md-editor', label: 'Markdown Editor' }
  ];

  const [activeTab, setActiveTab] = useState('md-editor');

  useEffect(() => {
    const current = tabs.find(t => t.id === activeTab);
    if (current && onSubtoolChange) onSubtoolChange(current.label);
  }, [activeTab]);

  useEffect(() => {
    if (toolId === 'md-editor') setActiveTab('md-editor');
  }, [toolId]);

  const isDeepLinked = !!toolId && tabs.some(t => t.id === toolId);

  return (
    <div className="tool-form">
      {!isDeepLinked && (
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
      )}

      {activeTab === 'md-editor' && (
         <MarkdownEditor onResultChange={onResultChange} />
      )}
    </div>
  );
};

export default DocTools;
