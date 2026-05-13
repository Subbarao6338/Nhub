import React, { useState, useEffect, useMemo } from 'react';
import { jsPDF } from 'jspdf';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

const DocTranslator = ({ onResultChange }) => {
    const [file, setFile] = useState(null);
    const [targetLang, setTargetLang] = useState('te');
    const [isProcessing, setIsProcessing] = useState(false);
    const [result, setResult] = useState('');

    const handleTranslate = async () => {
        if (!file) return;
        setIsProcessing(true);
        setResult('');

        const formData = new FormData();
        formData.append('file', file);
        formData.append('target_lang', targetLang);

        try {
            const response = await fetch('/api/docs/translate', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.detail || 'Translation failed');
            }

            const data = await response.json();
            setResult(data.translated_text);

            const blob = new Blob([data.translated_text], { type: 'text/plain' });
            onResultChange({
                text: 'Translation complete',
                blob,
                filename: `translated_${file.name}.txt`
            });
        } catch (e) {
            alert("Error: " + e.message);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="grid gap-15">
            <div className="card no-animation p-20 glass-card grid gap-15">
                <div className="form-group">
                    <label>Select Document (PDF, DOCX, EPUB, HTML, MD, TXT)</label>
                    <input
                        type="file"
                        className="pill w-full"
                        onChange={e => setFile(e.target.files[0])}
                        accept=".pdf,.docx,.epub,.html,.htm,.mhtml,.md,.txt"
                    />
                </div>
                <div className="form-group">
                    <label>Target Language</label>
                    <select
                        className="pill w-full"
                        value={targetLang}
                        onChange={e => setTargetLang(e.target.value)}
                    >
                        <option value="te">Telugu</option>
                        <option value="en">English</option>
                    </select>
                </div>
                <button
                    className="btn-primary w-full"
                    onClick={handleTranslate}
                    disabled={!file || isProcessing}
                >
                    {isProcessing ? 'Translating...' : 'Translate Document'}
                </button>
            </div>

            {result && (
                <div className="card no-animation p-20 glass-card">
                    <div className="flex-between mb-10">
                        <span className="font-bold uppercase smallest opacity-6">Translated Text</span>
                        <button className="pill smallest" onClick={() => {
                            const blob = new Blob([result], { type: 'text/plain' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `translated_${file.name}.txt`;
                            a.click();
                        }}>Download TXT</button>
                    </div>
                    <textarea
                        className="pill w-full font-mono text-small"
                        rows="10"
                        readOnly
                        value={result}
                    />
                </div>
            )}
        </div>
    );
};

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
    { id: 'md-editor', label: 'Markdown Editor' },
    { id: 'doc-translator', label: 'Doc Translator' }
  ].sort((a, b) => a.label.localeCompare(b.label));

  const [activeTab, setActiveTab] = useState('doc-translator');

  useEffect(() => {
    const current = tabs.find(t => t.id === activeTab);
    if (current && onSubtoolChange) onSubtoolChange(current.label);
  }, [activeTab]);

  useEffect(() => {
    if (toolId === 'md-editor') setActiveTab('md-editor');
    if (toolId === 'doc-translator') setActiveTab('doc-translator');
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

      {activeTab === 'doc-translator' && (
         <DocTranslator onResultChange={onResultChange} />
      )}
    </div>
  );
};

export default DocTools;
