import React, { useState, useEffect } from 'react';
import ToolResult from './ToolResult';

const NOTION_TABS = [
    { id: 'ingest', label: 'Notion Ingest' },
    { id: 'folder', label: 'Folder Sync' },
    { id: 'scraper', label: 'Web Scraper' },
    { id: 'history', label: 'Sync History' },
    { id: 'setup', label: 'Integration' }
];

const NotionTools = ({ toolId, onSubtoolChange }) => {
    const [activeTab, setActiveTab] = useState('ingest');

    useEffect(() => {
        const current = NOTION_TABS.find(t => t.id === activeTab);
        if (current && onSubtoolChange) onSubtoolChange(current.label);
    }, [activeTab, onSubtoolChange]);

    useEffect(() => {
        if (toolId) {
            const mapping = { 'ingest': 'ingest', 'folder': 'folder', 'scraper': 'scraper', 'history': 'history', 'setup': 'setup' };
            if (mapping[toolId]) setActiveTab(mapping[toolId]);
        }
    }, [toolId]);

    return (
        <div className="tool-form mt-20">
            <div className="pill-group mb-20 scrollable-x">
                {NOTION_TABS.map(tab => (
                    <button key={tab.id} className={`pill ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="hub-content animate-fadeIn">
                <div className="card p-30 glass-card text-center grid gap-15">
                    <span className="material-icons text-5xl opacity-2">auto_stories</span>
                    <h3>{NOTION_TABS.find(t => t.id === activeTab)?.label}</h3>
                    <p className="smallest opacity-6">Knowledge management and Notion synchronization.</p>
                    <button className="btn-primary w-full">Connect Notion</button>
                </div>
            </div>
        </div>
    );
};

export default NotionTools;
