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
      if (mapping[toolId]) setActiveTab(mapping[toolId]); else if (tabs.length > 0) setActiveTab(tabs[0].id);
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

      {activeTab === 'social' && <SocialTools toolId={toolId} />}
      {activeTab === 'web-md' && <WebToMarkdown onResultChange={onResultChange} />}
      {activeTab === 'mhtml' && <WebToMhtml onResultChange={onResultChange} />}
      {activeTab === 'url-pdf' && <UrlToPdf onResultChange={onResultChange} />}
    </div>
  );
};

const SocialTools = ({ toolId }) => {
  const [url, setUrl] = useState('');
  const [type, setType] = useState('auto');
  const [status, setStatus] = useState('idle');
  const handleDownload = async () => {
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
      link.setAttribute('download', `social_media.zip`);
      link.click();
      setStatus('idle');
    } catch (err) { setStatus('error'); }
  };
  return (
    <div className="grid gap-15 card p-15">
      <input type="text" value={url} onChange={e => setUrl(e.target.value)} placeholder="Media URL (YouTube, Twitter, Insta)..." className="pill w-full" />
      <div className="flex-gap">
          <button className={`pill flex-1 ${type === 'auto' ? 'active' : ''}`} onClick={() => setType('auto')}>Auto</button>
          <button className={`pill flex-1 ${type === 'video' ? 'active' : ''}`} onClick={() => setType('video')}>Video</button>
          <button className={`pill flex-1 ${type === 'audio' ? 'active' : ''}`} onClick={() => setType('audio')}>Audio</button>
      </div>
      <button className="btn-primary w-full" onClick={handleDownload} disabled={status === 'downloading' || !url}>
        {status === 'downloading' ? 'Processing...' : 'Download Media ZIP'}
      </button>
      {status === 'error' && <div className="text-danger small text-center">Download failed. Please check the URL.</div>}
    </div>
  );
};

const WebToMarkdown = ({ onResultChange }) => {
  const [html, setHtml] = useState('');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const convert = (content) => {
    const doc = new DOMParser().parseFromString(content || html, 'text/html');
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
    onResultChange({ text: md, filename: 'web.md' });
  };

  const fetchUrl = async () => {
    setLoading(true);
    try {
      const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      setHtml(data.contents);
      convert(data.contents);
    } catch(e) { alert("Failed to fetch URL"); }
    finally { setLoading(false); }
  };

  return (
    <div className="card p-15 grid gap-10">
      <div className="flex-gap">
        <input className="pill flex-1" placeholder="Enter URL..." value={url} onChange={e=>setUrl(e.target.value)} />
        <button className="btn-primary" onClick={fetchUrl} disabled={loading || !url}>{loading ? '...' : 'Fetch'}</button>
      </div>
      <div className="text-center opacity-5">OR</div>
      <textarea className="pill font-mono" rows="5" placeholder="Paste HTML..." value={html} onChange={e=>setHtml(e.target.value)} />
      <button className="btn-primary" onClick={() => convert()}>Convert HTML to Markdown</button>
    </div>
  );
};

const WebToMhtml = ({ onResultChange }) => {
    const [url, setUrl] = useState('');
    const download = async () => {
        try {
            const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
            const data = await res.json();
            const blob = new Blob([data.contents], { type: 'application/x-mimearchive' });
            onResultChange({ text: 'Web Archive (MHTML)', blob, filename: 'web.mhtml' });
        } catch(e) { alert("Failed to fetch page"); }
    };
    return (
        <div className="card p-15 grid gap-15">
            <input className="pill w-full" placeholder="Enter Web URL..." value={url} onChange={e=>setUrl(e.target.value)} />
            <button className="btn-primary" onClick={download} disabled={!url}>Save as MHTML</button>
        </div>
    );
};

const UrlToPdf = ({ onResultChange }) => {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);

    const convert = async () => {
        setLoading(true);
        try {
            const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
            const data = await res.json();
            const html = data.contents;

            const container = document.createElement('div');
            container.style.padding = '40px';
            container.style.width = '1000px';
            container.style.background = 'white';
            container.style.position = 'absolute';
            container.style.left = '-9999px';

            // Sanitize HTML to prevent XSS before injecting into DOM
            container.innerHTML = DOMPurify.sanitize(html);
            document.body.appendChild(container);

            const canvas = await html2canvas(container, {
                useCORS: true,
                allowTaint: true,
                scale: 1.5
            });
            document.body.removeChild(container);

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            onResultChange({ text: 'Converted URL to PDF', blob: pdf.output('blob'), filename: 'webpage.pdf' });
        } catch(e) {
            alert("Failed to convert URL to PDF: " + e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card p-15 grid gap-15">
            <input className="pill w-full" placeholder="Enter Web URL..." value={url} onChange={e=>setUrl(e.target.value)} />
            <button className="btn-primary" onClick={convert} disabled={loading || !url}>
                {loading ? 'Converting...' : 'Convert URL to PDF'}
            </button>
        </div>
    );
};

export default WebTools;
