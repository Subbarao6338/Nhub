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
    { id: 'md-editor', label: 'Markdown Editor' },
    { id: 'img-to-pdf', label: 'Img to PDF' },
    { id: 'pdf-to-img', label: 'PDF to Img' },
    { id: 'word-to-pdf', label: 'Word to PDF' },
    { id: 'excel-to-pdf', label: 'Excel to PDF' },
    { id: 'ppt-to-pdf', label: 'PPT to PDF' },
    { id: 'pdf-to-word', label: 'PDF to Word' },
    { id: 'pdf-to-text', label: 'PDF to Text' },
    { id: 'pdf-to-zip', label: 'PDF to ZIP' },
    { id: 'pdf-extract', label: 'Extract Assets' },
    { id: 'pdf-scan', label: 'Scan PDF (OCR)' }
  ].sort((a, b) => a.label.localeCompare(b.label));

  const [activeTab, setActiveTab] = useState('md-editor');
  const [files, setFiles] = useState([]);

  useEffect(() => {
    const current = tabs.find(t => t.id === activeTab);
    if (current && onSubtoolChange) onSubtoolChange(current.label);
  }, [activeTab]);

  useEffect(() => {
    if (toolId) {
      const mapping = {
        'md-editor': 'md-editor',
        'pdf-to-img': 'pdf-to-img',
        'img-to-pdf': 'img-to-pdf',
        'pdf-to-zip': 'pdf-to-zip',
        'pdf-extract': 'pdf-extract',
        'pdf-to-text': 'pdf-to-text',
        'word-to-pdf': 'word-to-pdf',
        'excel-to-pdf': 'excel-to-pdf',
        'ppt-to-pdf': 'ppt-to-pdf',
        'pdf-to-word': 'pdf-to-word',
        'pdf-scan': 'pdf-scan'
      };
      if (mapping[toolId]) setActiveTab(mapping[toolId]); else if (tabs.length > 0) setActiveTab(tabs[0].id);
    }
  }, [toolId]);

  const handleFileUpload = (e) => setFiles(Array.from(e.target.files));

  const imgToPdf = async () => {
    if (files.length === 0) return;
    const doc = new jsPDF();
    for (let i = 0; i < files.length; i++) {
      if (i > 0) doc.addPage();
      const imgData = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(files[i]);
      });
      doc.addImage(imgData, 'PNG', 10, 10, 190, 150);
    }
    const pdfBlob = doc.output('blob');
    onResultChange({ text: 'Images to PDF', blob: pdfBlob, filename: 'converted.pdf' });
  };

  const isDeepLinked = !!toolId && tabs.some(t => t.id === toolId || toolId.includes(t.id));

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

      {activeTab === 'md-editor' ? (
         <MarkdownEditor onResultChange={onResultChange} />
      ) : (
        <>
          <div className="form-group">
            <label>Upload Document(s)</label>
            <input type="file" multiple onChange={handleFileUpload} className="pill w-full" />
          </div>

          {activeTab === 'img-to-pdf' && (
            <button className="btn-primary w-full mt-20" onClick={imgToPdf} disabled={files.length === 0}>
              Convert {files.length} Images to PDF
            </button>
          )}

          {activeTab === 'translate' && (
              <div className="card p-15 grid gap-15">
                  <select className="pill w-full">
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                  </select>
                  <button className="btn-primary" onClick={() => alert("Docx translation is being processed...")}>Translate Docx</button>
              </div>
          )}

          {!['img-to-pdf', 'translate'].includes(activeTab) && (
            <div className="text-center p-20 mt-20 opacity-6 card">
              <span className="material-icons mb-10" style={{ fontSize: '2rem' }}>construction</span>
              <div>This conversion feature is coming soon.</div>
              <div style={{ fontSize: '0.8rem' }}>(Requires complex local WASM libraries)</div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DocTools;
