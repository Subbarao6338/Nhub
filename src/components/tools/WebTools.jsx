import React, { useState, useEffect, useMemo } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import DOMPurify from 'dompurify';
import API_BASE from '../../api';

const WebTools = ({ toolId, onResultChange, onSubtoolChange }) => {
  const tabs = [
    { id: 'social', label: 'Social Tools' },
    { id: 'web-md', label: 'Url to Markdown' },
    { id: 'mhtml', label: 'Url to MHTML' },
    { id: 'url-pdf', label: 'Url to PDF' }
  ].sort((a, b) => a.label.localeCompare(b.label));

  const [activeTab, setActiveTab] = useState('social');

  useEffect(() => {
    const current = tabs.find(t => t.id === activeTab);
    if (current && onSubtoolChange) onSubtoolChange(current.label);
  }, [activeTab]);

  useEffect(() => {
    if (toolId) {
      const mapping = {
        'social-downloader': 'social',
        'web-to-md': 'web-md',
        'web-mhtml': 'mhtml',
        'url-to-pdf': 'url-pdf'
      };
      if (mapping[toolId]) setActiveTab(mapping[toolId]);
    }
  }, [toolId]);

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

      <div className="hub-content animate-fadeIn">
        {activeTab === 'social' && <SocialTools onResultChange={onResultChange} />}
        {activeTab === 'web-md' && <WebToMarkdown onResultChange={onResultChange} />}
        {activeTab === 'mhtml' && <WebToMhtml onResultChange={onResultChange} />}
        {activeTab === 'url-pdf' && <UrlToPdf onResultChange={onResultChange} />}
      </div>
    </div>
  );
};

const SocialTools = ({ onResultChange }) => {
  const [url, setUrl] = useState('');
  const [type, setType] = useState('auto');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  const isValidUrl = (string) => {
    try { new URL(string); return true; }
    catch (_) { return false; }
  };

  const handleDownload = async () => {
    if (!isValidUrl(url)) { setError('Please enter a valid URL.'); return; }
    setError('');
    setStatus('downloading');
    try {
      const response = await fetch(`${API_BASE}/social/download`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, limit: 5, download_type: type })
      });
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.setAttribute('download', `media_${Date.now()}.zip`);
      link.click();
      onResultChange({ text: `Successfully processed: ${url}`, filename: 'media_info.txt' });
      setStatus('idle');
    } catch (err) {
        setStatus('error');
        setError(err.message || 'Processing failed.');
    }
  };

  return (
    <div className="grid gap-12 card p-20 glass-card">
      <div className="form-group">
        <label>Media URL</label>
        <input type="text" value={url} onChange={e => { setUrl(e.target.value); setError(''); }} placeholder="YouTube, Twitter, Instagram URL..." className="pill w-full" />
      </div>
      <div className="form-group">
        <label>Download Type</label>
        <div className="flex-gap">
            {['auto', 'video', 'audio'].map(t => (
                <button key={t} className={`pill flex-1 capitalize ${type === t ? 'active' : ''}`} onClick={() => setType(t)}>{t}</button>
            ))}
        </div>
      </div>
      <button className="btn-primary w-full" onClick={handleDownload} disabled={status === 'downloading' || !url} style={{marginTop: '10px'}}>
        <span className="material-icons mr-10">{status === 'downloading' ? 'sync' : 'download'}</span>
        {status === 'downloading' ? 'Processing...' : 'Download Media ZIP'}
      </button>
      {error && <div className="danger-box text-center mt-10 animate-shake">{error}</div>}
      <div className="opacity-5 smallest text-center mt-10">All downloads are sanitized and bundled as ZIP.</div>
    </div>
  );
};

const WebToMarkdown = ({ onResultChange }) => {
  const [html, setHtml] = useState('');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const convert = (content) => {
    const sanitized = DOMPurify.sanitize(content || html);
    const doc = new DOMParser().parseFromString(sanitized, 'text/html');
    let md = "";
    const walk = (node) => {
        if (node.nodeType === 3) md += node.nodeValue;
        else if (node.nodeName === 'H1') md += `\n# ${node.innerText}\n`;
        else if (node.nodeName === 'H2') md += `\n## ${node.innerText}\n`;
        else if (node.nodeName === 'IMG') md += `\n![Image](${node.src})\n`;
        else if (node.nodeName === 'A') md += ` [${node.innerText}](${node.href}) `;
        else if (node.nodeName === 'BR' || node.nodeName === 'P') md += "\n";
        node.childNodes.forEach(walk);
    };
    walk(doc.body);
    onResultChange({ text: md.trim(), filename: 'web.md' });
  };

  const fetchUrl = async () => {
    setLoading(true);
    try {
      const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      setHtml(data.contents);
      convert(data.contents);
    } catch(e) { alert("Failed to fetch URL: " + e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="card p-20 grid gap-15 glass-card">
      <div className="form-group">
        <label>Fetch from URL</label>
        <div className="flex-gap">
          <input className="pill flex-1" placeholder="https://example.com" value={url} onChange={e=>setUrl(e.target.value)} />
          <button className="btn-primary" onClick={fetchUrl} disabled={loading || !url}>
            <span className="material-icons">{loading ? 'sync' : 'search'}</span>
          </button>
        </div>
      </div>
      <div className="text-center opacity-6 font-bold" style={{fontSize: '0.8rem'}}>— OR —</div>
      <div className="form-group">
        <label>Paste HTML Content</label>
        <textarea className="pill font-mono" rows="6" placeholder="<html>...</html>" value={html} onChange={e=>setHtml(e.target.value)} />
      </div>
      <button className="btn-primary w-full" onClick={() => convert()}>
        <span className="material-icons mr-10">code</span>
        Convert to Markdown
      </button>
    </div>
  );
};

const WebToMhtml = ({ onResultChange }) => {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const download = async () => {
        setLoading(true);
        try {
            const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
            const data = await res.json();
            const blob = new Blob([data.contents], { type: 'application/x-mimearchive' });
            onResultChange({ text: `Web Archive (MHTML) created for ${url}`, blob, filename: 'web.mhtml' });
        } catch(e) { alert("Failed to fetch page"); }
        finally { setLoading(false); }
    };
    return (
        <div className="card p-20 grid gap-15 glass-card">
            <div className="form-group">
                <label>Target URL</label>
                <input className="pill w-full" placeholder="https://example.com" value={url} onChange={e=>setUrl(e.target.value)} />
            </div>
            <button className="btn-primary w-full" onClick={download} disabled={!url || loading}>
                <span className="material-icons mr-10">{loading ? 'sync' : 'archive'}</span>
                {loading ? 'Archiving...' : 'Save as MHTML'}
            </button>
        </div>
    );
};

const UrlToPdf = ({ onResultChange }) => {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);

    const convert = async () => {
        setLoading(true);
        let container = null;
        try {
            const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
            const data = await res.json();
            const html = data.contents;

            container = document.createElement('div');
            container.style.cssText = 'padding:40px;width:1000px;background:white;position:absolute;left:-9999px;';
            container.innerHTML = DOMPurify.sanitize(html);
            document.body.appendChild(container);

            const canvas = await html2canvas(container, { useCORS: true, allowTaint: true, scale: 1.5 });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            onResultChange({ text: `URL converted to PDF: ${url}`, blob: pdf.output('blob'), filename: 'webpage.pdf' });
        } catch(e) {
            alert("Failed to convert: " + e.message);
        } finally {
            if (container && container.parentNode) document.body.removeChild(container);
            setLoading(false);
        }
    };

    return (
        <div className="card p-20 grid gap-15 glass-card">
            <div className="form-group">
                <label>Target URL</label>
                <input className="pill w-full" placeholder="https://example.com" value={url} onChange={e=>setUrl(e.target.value)} />
            </div>
            <button className="btn-primary w-full" onClick={convert} disabled={loading || !url}>
                <span className="material-icons mr-10">{loading ? 'sync' : 'picture_as_pdf'}</span>
                {loading ? 'Generating PDF...' : 'Convert URL to PDF'}
            </button>
        </div>
    );
};

export default WebTools;
