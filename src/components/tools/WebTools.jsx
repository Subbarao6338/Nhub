import React, { useState, useEffect } from 'react';
import API_BASE from '../../api';

const WebTools = ({ toolId, onResultChange, onSubtoolChange }) => {
  const tabs = [
    { id: 'social', label: 'Social Tools' },
    { id: 'archive', label: 'Web Archiver' }
  ].sort((a, b) => a.label.localeCompare(b.label));

  const [activeTab, setActiveTab] = useState('social');

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
      </div>
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
