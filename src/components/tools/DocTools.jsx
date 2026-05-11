import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';

const DocTools = ({ onResultChange, toolId }) => {
  const [activeTab, setActiveTab] = useState('img-to-pdf');
  const [files, setFiles] = useState([]);

  useEffect(() => {
    if (toolId) {
      const mapping = {
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

  const tabs = [
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

      <div className="form-group">
        <label>Upload Document(s)</label>
        <input type="file" multiple onChange={handleFileUpload} className="pill w-full" />
      </div>

      {activeTab === 'img-to-pdf' ? (
        <button className="btn-primary w-full mt-20" onClick={imgToPdf} disabled={files.length === 0}>
          Convert {files.length} Images to PDF
        </button>
      ) : (
        <div className="text-center p-20 mt-20 opacity-6 card">
          <span className="material-icons mb-10" style={{ fontSize: '2rem' }}>construction</span>
          <div>This conversion feature is coming soon.</div>
          <div style={{ fontSize: '0.8rem' }}>(Requires complex local WASM libraries)</div>
        </div>
      )}
    </div>
  );
};

export default DocTools;
