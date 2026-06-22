import React, { useState, useEffect } from 'react';
import ToolResult from './ToolResult';

const OPS_TABS = [
  { id: 'status', label: 'System Status' },
  { id: 'telemetry', label: 'Live Telemetry' },
  { id: 'lineage', label: 'Data Lineage' }
];

const OpsTools = ({ toolId, onSubtoolChange }) => {
    const [activeTab, setActiveTab] = useState('status');

    useEffect(() => {
        const current = OPS_TABS.find(t => t.id === activeTab);
        if (current && onSubtoolChange) onSubtoolChange(current.label);
    }, [activeTab, onSubtoolChange]);

    useEffect(() => {
        if (toolId) {
            const mapping = { 'status': 'status', 'telemetry': 'telemetry', 'lineage': 'lineage' };
            if (mapping[toolId]) setActiveTab(mapping[toolId]);
        }
    }, [toolId]);

    return (
        <div className="tool-form mt-20">
            <div className="pill-group mb-20 scrollable-x">
                {OPS_TABS.map(tab => (
                    <button key={tab.id} className={`pill ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="hub-content animate-fadeIn">
                <div className="card p-30 glass-card text-center grid gap-15">
                    <span className="material-icons text-5xl opacity-2">settings_input_component</span>
                    <h3>{OPS_TABS.find(t => t.id === activeTab)?.label}</h3>
                    <p className="smallest opacity-6">Operations center for pipeline monitoring and health checks.</p>
                    <button className="btn-primary w-full">View Dashboard</button>
                </div>
            </div>
        </div>
    );
};

export default OpsTools;
