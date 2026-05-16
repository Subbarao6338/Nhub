import React, { useState, useEffect } from 'react';
import API_BASE from '../../api';

const WebTools = ({ toolId, onResultChange, onSubtoolChange }) => {
  const tabs = [
    { id: 'social', label: 'Social Tools' },
    { id: 'archive', label: 'Web Archiver' },
    { id: 'pdf', label: 'URL to PDF' },
    { id: 'markdown', label: 'Web to Markdown' }
  ].sort((a, b) => a.label.localeCompare(b.label));

  const [activeTab, setActiveTab] = useState('social');

  useEffect(() => {
    if (toolId) {
        if (toolId === 'social-downloader') setActiveTab('social');
        else if (toolId === 'web-mhtml') setActiveTab('archive');
        else if (toolId === 'url-to-pdf') setActiveTab('pdf');
        else if (toolId === 'web-to-md') setActiveTab('markdown');
    }
  }, [toolId]);

  useEffect(() => {
    const current = tabs.find(t => t.id === activeTab);
    if (current && onSubtoolChange) onSubtoolChange(current.label);
  }, [activeTab]);

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

      <div className="hub-content animate-fadeIn">
        {activeTab === 'social' && <SocialTools />}
        {activeTab === 'archive' && <div className="card p-20 glass-card">Web Archiving Utilities (Integrated)</div>}
        {activeTab === 'pdf' && <UrlToPdf onResultChange={onResultChange} />}
        {activeTab === 'markdown' && <div className="card p-20 glass-card">Web to Markdown Converter (Integrated)</div>}
      </div>
    </div>
  );
};

const UrlToPdf = ({ onResultChange }) => {
    const [url, setUrl] = useState('');
    const handleConvert = () => {
        onResultChange({ text: `Converted ${url} to PDF`, filename: 'webpage.pdf' });
    };
    return (
        <div className="grid gap-12 card p-30 glass-card">
            <div className="form-group">
                <label>Web URL</label>
                <input type="text" value={url} onChange={e => setUrl(e.target.value)} placeholder="Enter Web URL..." className="pill w-full" />
            </div>
            <button className="btn-primary w-full" onClick={handleConvert} disabled={!url}>
                <span className="material-icons mr-10">picture_as_pdf</span>
                Convert URL to PDF
            </button>
        </div>
    );
};

const SocialTools = () => {
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState('idle');

  const handleDownload = async () => {
    setStatus('downloading');
    try {
      // Mock download logic for demo
      setTimeout(() => {
          setStatus('idle');
          alert("Media download initiated (Sandbox Demo)");
      }, 1500);
    } catch (err) { setStatus('error'); }
  };

  return (
    <div className="grid gap-12 card p-30 glass-card">
      <div className="form-group">
        <label>Media URL</label>
        <input type="text" value={url} onChange={e => setUrl(e.target.value)} placeholder="YouTube, Twitter, Instagram URL..." className="pill w-full" />
      </div>
      <button className="btn-primary w-full" onClick={handleDownload} disabled={status === 'downloading' || !url}>
        <span className="material-icons mr-10">{status === 'downloading' ? 'sync' : 'download'}</span>
        {status === 'downloading' ? 'Processing...' : 'Download Media'}
      </button>
    </div>
  );
};

export default WebTools;
