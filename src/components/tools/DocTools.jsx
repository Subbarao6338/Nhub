import React, { useState, useEffect, useMemo } from 'react';
import { jsPDF } from 'jspdf';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
const MarkdownEditor = ({ onResultChange }) => {
  const [md, setMd] = useState('# New Document\n\nStart typing...');
  const html = useMemo(() => DOMPurify.sanitize(marked.parse(md)), [md]);

  const exportPdf = () => {
    const doc = new jsPDF();
    const lines = doc.splitTextToSize(md, 180);
    doc.text(lines, 10, 10);
    const blob = doc.output('blob');
    onResultChange({ text: 'Exported Markdown to PDF', blob, filename: 'document.pdf' });
  };

  return (
    <div className="grid gap-15">
      <div className="grid grid-2-cols gap-15">
        <textarea
          className="pill font-mono"
          rows="12"
          value={md}
          onChange={e => setMd(e.target.value)}
          placeholder="Write markdown here..."
        />
        <div className="card p-20 about-content overflow-auto" style={{ maxHeight: '300px' }} dangerouslySetInnerHTML={{ __html: html }} />
      </div>
      <button className="btn-primary" onClick={exportPdf}>Export to PDF</button>
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
