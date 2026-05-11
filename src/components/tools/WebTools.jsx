import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import API_BASE from '../../api';

const WebTools = ({ toolId, onResultChange }) => {
  const [activeTab, setActiveTab] = useState('qr-gen');

  useEffect(() => {
    if (toolId) {
      const mapping = {
        'qr-gen': 'qr-gen',
        'qr-scan': 'qr-scan',
        'social-downloader': 'social',
        'whatsapp-link': 'social',
        'telegram-link': 'social',
        'hashtag-gen': 'social',
        'cookies': 'cookies',
        'omni-hub': 'omni',
        'web-to-md': 'web-md'
      };
      if (mapping[toolId]) setActiveTab(mapping[toolId]); else if (tabs.length > 0) setActiveTab(tabs[0].id);
    }
  }, [toolId]);

  const tabs = [
    { id: 'qr-gen', label: 'QR Gen' },
    { id: 'qr-scan', label: 'QR Scanner' },
    { id: 'social', label: 'Social Media' },
    { id: 'cookies', label: 'Cookies' },
    { id: 'omni', label: 'Omni Search' },
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

      {activeTab === 'qr-gen' && <QrGenTool onResultChange={onResultChange} />}
      {activeTab === 'qr-scan' && <QrScanner onResultChange={onResultChange} />}
      {activeTab === 'social' && <SocialTools toolId={toolId} />}
      {activeTab === 'cookies' && <CookiesTool onResultChange={onResultChange} />}
      {activeTab === 'omni' && <OmniHub onResultChange={onResultChange} />}
      {activeTab === 'web-md' && <WebToMarkdown onResultChange={onResultChange} />}
    </div>
  );
};

const QrGenTool = ({ onResultChange }) => {
    const [text, setText] = useState('https://github.com');
    useEffect(() => {
        onResultChange({ text: `QR: ${text}`, filename: 'qr.txt' });
    }, [text]);
    return (
        <div className="card p-20 text-center">
            <input className="pill w-full mb-20" value={text} onChange={e=>setText(e.target.value)} />
            <div className="bg-white p-10 inline-block rounded-12 shadow-sm">
                <QRCodeSVG value={text} size={200} />
            </div>
        </div>
    );
};

const QrScanner = ({ onResultChange }) => {
  const [scanResult, setScanResult] = useState(null);
  const scannerRef = useRef(null);
  useEffect(() => {
    const scanner = new Html5QrcodeScanner('reader', { fps: 10, qrbox: { width: 250, height: 250 } });
    scanner.render((text) => {
      setScanResult(text);
      scanner.clear();
      if (onResultChange) onResultChange({ text, filename: 'qr_scan.txt' });
    }, () => {});
    scannerRef.current = scanner;
    return () => { if (scannerRef.current) scannerRef.current.clear().catch(() => {}); };
  }, []);
  return (
    <div className="text-center">
      <div id="reader" style={{ width: '100%', maxWidth: '400px', margin: '0 auto', borderRadius: '16px', overflow: 'hidden' }}></div>
      {scanResult && <div className="mt-20 card p-20"><div className="tool-result font-mono break-all">{scanResult}</div></div>}
    </div>
  );
};

const SocialTools = ({ toolId }) => {
  const [activeTab, setActiveTab] = useState('downloader');
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState('idle');
  const handleDownload = async () => {
    setStatus('downloading');
    try {
      const response = await fetch(`${API_BASE}/social/download`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, limit: 5, download_type: 'auto' })
      });
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.setAttribute('download', `social_media.zip`);
      link.click();
      setStatus('idle');
    } catch (err) { setStatus('error'); }
  };
  return (
    <div className="grid gap-15 card p-15">
      <input type="text" value={url} onChange={e => setUrl(e.target.value)} placeholder="Media URL..." className="pill w-full" />
      <button className="btn-primary w-full" onClick={handleDownload} disabled={status === 'downloading' || !url}>
        {status === 'downloading' ? 'Processing...' : 'Download Media ZIP'}
      </button>
    </div>
  );
};

const CookiesTool = ({ onResultChange }) => {
  const [cookies, setCookies] = useState(document.cookie.split(';').filter(Boolean));
  useEffect(() => { onResultChange({ text: cookies.join('\n'), filename: 'cookies.txt' }); }, [cookies]);
  return (
    <div className="card p-15">
      <div className="tool-result" style={{ maxHeight: '200px', overflowY: 'auto' }}>
        {cookies.map((c, i) => <div key={i} className="font-mono text-sm border-b p-5">{c.trim()}</div>)}
      </div>
      <button className="pill w-full mt-10 danger" onClick={() => { document.cookie.split(';').forEach(c => { document.cookie = c.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/'); }); setCookies([]); }}>Clear Cookies</button>
    </div>
  );
};

const OmniHub = ({ onResultChange }) => {
  const [query, setQuery] = useState('');
  const search = (e) => { window.open(`https://google.com/search?q=${encodeURIComponent(query)}`, '_blank'); };
  return (
    <div className="card p-15 grid gap-10">
      <input className="pill" placeholder="Search query..." value={query} onChange={e=>setQuery(e.target.value)} />
      <div className="grid grid-3 gap-5">
        {['Google', 'DuckDuckGo', 'Bing', 'Wiki', 'GitHub', 'AI'].map(eng => <button key={eng} className="pill" onClick={search}>{eng}</button>)}
      </div>
    </div>
  );
};

const WebToMarkdown = ({ onResultChange }) => {
  const [html, setHtml] = useState('');
  const convert = () => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    let md = doc.body.innerText; // Extremely simplified for brevity
    onResultChange({ text: md, filename: 'web.md' });
  };
  return (
    <div className="card p-15 grid gap-10">
      <textarea className="pill font-mono" rows="5" placeholder="Paste HTML..." value={html} onChange={e=>setHtml(e.target.value)} />
      <button className="btn-primary" onClick={convert}>Convert to MD</button>
    </div>
  );
};

export default WebTools;
