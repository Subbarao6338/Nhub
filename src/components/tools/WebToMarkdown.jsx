import React, { useState } from 'react';

const WebToMarkdown = ({ onResultChange }) => {
  const [input, setInput] = useState('');
  const [inputType, setInputType] = useState('url'); // 'url' or 'html'
  const [result, setResult] = useState('');

  const convertHtmlToMarkdown = (html) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Basic conversion logic
    let md = '';

    const walk = (node) => {
      if (node.nodeType === 3) { // Text
        md += node.textContent;
        return;
      }

      const tag = node.tagName?.toLowerCase();

      switch (tag) {
        case 'h1': md += '\n# '; break;
        case 'h2': md += '\n## '; break;
        case 'h3': md += '\n### '; break;
        case 'h4': md += '\n#### '; break;
        case 'p': md += '\n\n'; break;
        case 'br': md += '\n'; break;
        case 'strong': case 'b': md += '**'; break;
        case 'em': case 'i': md += '_'; break;
        case 'a': md += '['; break;
        case 'img': md += `![${node.alt || 'image'}](${node.src})`; break;
        case 'ul': md += '\n'; break;
        case 'ol': md += '\n'; break;
        case 'li': md += '\n- '; break;
        case 'code': md += '`'; break;
        case 'pre': md += '\n```\n'; break;
        default: break;
      }

      for (let child of node.childNodes) {
        walk(child);
      }

      switch (tag) {
        case 'strong': case 'b': md += '**'; break;
        case 'em': case 'i': md += '_'; break;
        case 'a': md += `](${node.href})`; break;
        case 'pre': md += '\n```\n'; break;
        case 'code': if (node.parentNode.tagName !== 'PRE') md += '`'; break;
        default: break;
      }
    };

    walk(doc.body);
    return md.trim();
  };

  const handleConvert = () => {
    if (inputType === 'url') {
      // Direct URL fetching is restricted by CORS in browser, guide user to paste HTML
      alert("Due to browser security (CORS), direct URL fetching is restricted. Please copy the page source or use 'Inspect' -> 'Copy outerHTML' and paste it in 'Raw HTML' mode.");
      setInputType('html');
    } else {
      const md = convertHtmlToMarkdown(input);
      setResult(md);
      if (onResultChange) {
        onResultChange({ text: md, filename: 'webpage.md' });
      }
    }
  };

  return (
    <div className="tool-form">
      <div className="pill-group" style={{ marginBottom: '20px' }}>
        <button className={`pill ${inputType === 'url' ? 'active' : ''}`} onClick={() => setInputType('url')}>URL Mode</button>
        <button className={`pill ${inputType === 'html' ? 'active' : ''}`} onClick={() => setInputType('html')}>Raw HTML Mode</button>
      </div>

      <div className="form-group">
        <label>{inputType === 'url' ? 'Page URL' : 'Paste HTML Content'}</label>
        {inputType === 'url' ? (
          <input type="text" value={input} onChange={e => setInput(e.target.value)} placeholder="https://..." className="pill" style={{ width: '100%' }} />
        ) : (
          <textarea rows="10" value={input} onChange={e => setInput(e.target.value)} placeholder="<html>...</html>" style={{ width: '100%', fontFamily: 'monospace' }} />
        )}
      </div>

      <button className="btn-primary" onClick={handleConvert} style={{ width: '100%', marginTop: '10px' }}>Convert to Markdown</button>

      {result && (
        <div className="form-group" style={{ marginTop: '20px' }}>
          <label>Markdown Result</label>
          <textarea rows="10" value={result} readOnly style={{ width: '100%', fontFamily: 'monospace', background: 'rgba(var(--primary-rgb), 0.05)' }} />
        </div>
      )}
    </div>
  );
};

export default WebToMarkdown;
