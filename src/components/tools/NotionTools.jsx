import React, { useState, useEffect } from 'react';
import ToolResult from './ToolResult';

const NotionTools = ({ onSubtoolChange }) => {
    const tabs = [
        { id: 'ingest', label: 'Document Ingestion' },
        { id: 'scraper', label: 'Web to Notion' },
        { id: 'setup', label: 'Notion Setup' }
    ];

    const [activeTab, setActiveTab] = useState('ingest');
    const [token, setToken] = useState(localStorage.getItem('hub_notion_token') || '');
    const [workspaceId, setWorkspaceId] = useState(localStorage.getItem('hub_notion_workspace') || '');

    useEffect(() => {
        const current = tabs.find(t => t.id === activeTab);
        if (current && onSubtoolChange) onSubtoolChange(current.label);
    }, [activeTab]);

    return (
        <div className="tool-form mt-20">
            <div className="pill-group mb-20 scrollable-x">
                {tabs.map(tab => (
                    <button key={tab.id} className={`pill ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="hub-content animate-fadeIn">
                {activeTab === 'setup' && (
                    <div className="card p-30 glass-card grid gap-15">
                        <h3>Notion Configuration</h3>
                        <div className="form-group">
                            <label>Notion API Token</label>
                            <input type="password" title="Notion Token" className="pill w-full" value={token} onChange={e => setToken(e.target.value)} placeholder="secret_..." />
                        </div>
                        <div className="form-group">
                            <label>Workspace/Page ID</label>
                            <input type="text" title="Workspace ID" className="pill w-full" value={workspaceId} onChange={e => setWorkspaceId(e.target.value)} placeholder="32-char ID" />
                        </div>
                        <button className="btn-primary w-full" onClick={() => { localStorage.setItem('hub_notion_token', token); localStorage.setItem('hub_notion_workspace', workspaceId); alert('Saved!'); }}>Save</button>
                    </div>
                )}
                {activeTab === 'ingest' && <NotionIngest token={token} workspaceId={workspaceId} />}
                {activeTab === 'scraper' && <NotionScraper token={token} workspaceId={workspaceId} />}
            </div>
        </div>
    );
};

const NotionIngest = ({ token, workspaceId }) => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const handleUpload = async () => {
        if (!file || !token || !workspaceId) return alert('Complete setup first.');
        setLoading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('token', token);
        formData.append('workspace_id', workspaceId);
        try {
            const response = await fetch('/api/notion/upload', { method: 'POST', body: formData });
            const data = await response.json();
            if (data.success) setResult({ text: `Ingested! Page ID: ${data.page_id}` });
            else throw new Error(data.detail || 'Failed');
        } catch (err) { setResult({ error: err.message }); } finally { setLoading(false); }
    };

    return (
        <div className="card p-30 glass-card grid gap-15">
            <input type="file" onChange={e => setFile(e.target.files[0])} />
            <button className="btn-primary w-full" onClick={handleUpload} disabled={loading}>{loading ? 'Processing...' : 'Ingest to Notion'}</button>
            <ToolResult result={result} />
        </div>
    );
};

const NotionScraper = ({ token, workspaceId }) => {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const handleScrape = async () => {
        if (!url || !token || !workspaceId) return alert('Setup required.');
        setLoading(true);
        const formData = new FormData();
        formData.append('url', url);
        formData.append('token', token);
        formData.append('workspace_id', workspaceId);
        try {
            const response = await fetch('/api/notion/scrape', { method: 'POST', body: formData });
            const data = await response.json();
            if (data.success) setResult({ text: `Scraped: ${data.title}` });
            else throw new Error(data.detail || 'Failed');
        } catch (err) { setResult({ error: err.message }); } finally { setLoading(false); }
    };

    return (
        <div className="card p-30 glass-card grid gap-15">
            <input type="text" className="pill" placeholder="URL to scrape" value={url} onChange={e=>setUrl(e.target.value)} />
            <button className="btn-primary w-full" onClick={handleScrape} disabled={loading}>{loading ? 'Scraping...' : 'Scrape to Notion'}</button>
            <ToolResult result={result} />
        </div>
    );
};

export default NotionTools;
