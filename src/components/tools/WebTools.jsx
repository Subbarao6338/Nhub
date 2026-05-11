import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import API_BASE from '../../api';

const WebTools = ({ toolId, onResultChange, onSubtoolChange }) => {
  const [activeTab, setActiveTab] = useState('qr-gen');

  useEffect(() => {
    const current = tabs.find(t => t.id === activeTab);
    if (current && onSubtoolChange) onSubtoolChange(current.label);
  }, [activeTab]);

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
        'web-to-md': 'web-md',
        'web-translate': 'translate',
        'web-mhtml': 'mhtml',
        'web-meta': 'meta'
      };
      if (mapping[toolId]) setActiveTab(mapping[toolId]); else if (tabs.length > 0) setActiveTab(tabs[0].id);
    }
  }, [toolId]);

  const tabs = [
    { id: 'qr-gen', label: 'QR Gen' },
    { id: 'qr-scan', label: 'QR Scanner' },
    { id: 'social', label: 'Social' },
    { id: 'cookies', label: 'Cookies' },
    { id: 'omni', label: 'Search' },
    { id: 'web-md', label: 'Web to MD' },
    { id: 'translate', label: 'Translate' },
    { id: 'mhtml', label: 'MHTML' },
    { id: 'meta', label: 'Meta Gen' },
    { id: 'url-parser', label: 'URL Parser' }
  ].sort((a, b) => a.label.localeCompare(b.label));

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

      {activeTab === 'qr-gen' && <QrGenTool onResultChange={onResultChange} />}
      {activeTab === 'qr-scan' && <QrScanner onResultChange={onResultChange} />}
      {activeTab === 'social' && <SocialTools toolId={toolId} />}
      {activeTab === 'cookies' && <CookiesTool onResultChange={onResultChange} />}
      {activeTab === 'omni' && <OmniHub onResultChange={onResultChange} />}
      {activeTab === 'web-md' && <WebToMarkdown onResultChange={onResultChange} />}
      {activeTab === 'translate' && <WebTranslator onResultChange={onResultChange} />}
      {activeTab === 'mhtml' && <WebToMhtml onResultChange={onResultChange} />}
      {activeTab === 'meta' && <MetaTagGenerator onResultChange={onResultChange} />}
      {activeTab === 'url-parser' && <UrlParser onResultChange={onResultChange} />}
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
      <button className="btn-primary" onClick={() => convert()}>Convert HTML to MD</button>
    </div>
  );
};

const WebTranslator = ({ onResultChange }) => {
    const [url, setUrl] = useState('');
    const [lang, setLang] = useState('en');
    const translate = () => { window.open(`https://translate.google.com/translate?sl=auto&tl=${lang}&u=${encodeURIComponent(url)}`, '_blank'); };
    return (
        <div className="card p-15 grid gap-15">
            <input className="pill w-full" placeholder="Enter Web URL..." value={url} onChange={e=>setUrl(e.target.value)} />
            <select className="pill w-full" value={lang} onChange={e=>setLang(e.target.value)}>
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="hi">Hindi</option>
            </select>
            <button className="btn-primary" onClick={translate} disabled={!url}>Translate Page</button>
        </div>
    );
};

const UrlParser = ({ onResultChange }) => {
    const [url, setUrl] = useState('https://example.com:8080/path/to/page?q=search#hash');
    const parts = useMemo(() => {
        try {
            const u = new URL(url);
            return {
                protocol: u.protocol,
                host: u.host,
                pathname: u.pathname,
                search: u.search,
                hash: u.hash
            };
        } catch(e) { return null; }
    }, [url]);

    useEffect(() => { if(parts) onResultChange({ text: JSON.stringify(parts, null, 2), filename: 'url_parts.json' }); }, [parts]);

    return (
        <div className="card p-15 grid gap-10">
            <input className="pill" value={url} onChange={e=>setUrl(e.target.value)} placeholder="Enter URL..." />
            {parts && (
                <div className="tool-result font-mono text-xs">
                    {Object.entries(parts).map(([k,v]) => <div key={k}><b>{k}:</b> {v}</div>)}
                </div>
            )}
        </div>
    );
};

const MetaTagGenerator = ({ onResultChange }) => {
    const [meta, setMeta] = useState({ title: '', description: '', author: '', keywords: '' });
    const res = useMemo(() => {
        return `<title>${meta.title}</title>\n<meta name="description" content="${meta.description}">\n<meta name="author" content="${meta.author}">\n<meta name="keywords" content="${meta.keywords}">`;
    }, [meta]);
    useEffect(() => { onResultChange({ text: res, filename: 'meta.txt' }); }, [res]);
    return (
        <div className="card p-15 grid gap-10">
            <input className="pill" placeholder="Title" value={meta.title} onChange={e=>setMeta({...meta, title: e.target.value})} />
            <textarea className="pill" placeholder="Description" rows="2" value={meta.description} onChange={e=>setMeta({...meta, description: e.target.value})} />
            <input className="pill" placeholder="Author" value={meta.author} onChange={e=>setMeta({...meta, author: e.target.value})} />
            <input className="pill" placeholder="Keywords (comma separated)" value={meta.keywords} onChange={e=>setMeta({...meta, keywords: e.target.value})} />
            <pre className="tool-result font-mono text-xs">{res}</pre>
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

export default WebTools;
