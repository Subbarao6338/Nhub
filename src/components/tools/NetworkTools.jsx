import React, { useState, useEffect } from 'react';
import ToolResult from './ToolResult';

const NETWORK_TABS = [
  { id: 'ip-info', label: 'IP Information' },
  { id: 'ping', label: 'Ping Tester' },
  { id: 'dns', label: 'DNS Lookup' },
  { id: 'whois', label: 'WHOIS Record' },
  { id: 'speed', label: 'Speed Test' },
  { id: 'geo', label: 'IP Geolocation' },
  { id: 'ssl', label: 'SSL Checker' },
  { id: 'subnet', label: 'Subnet Calc' },
  { id: 'bluetooth', label: 'BT Scanner' }
].sort((a, b) => a.label.localeCompare(b.label));

const NetworkTools = ({ toolId, onSubtoolChange }) => {
  const [activeTab, setActiveTab] = useState('ip-info');

  useEffect(() => {
    const current = NETWORK_TABS.find(t => t.id === activeTab);
    if (current && onSubtoolChange) onSubtoolChange(current.label);
  }, [activeTab, onSubtoolChange]);

  useEffect(() => {
    if (toolId) {
      const mapping = {
        'ip-info': 'ip-info', 'ping': 'ping', 'dns': 'dns',
        'whois': 'whois', 'speed': 'speed', 'geo': 'geo',
        'ssl': 'ssl', 'subnet': 'subnet', 'bluetooth': 'bluetooth'
      };
      if (mapping[toolId]) setActiveTab(mapping[toolId]);
    }
  }, [toolId]);

  return (
    <div className="tool-form mt-20">
      <div className="pill-group mb-20 scrollable-x">
        {NETWORK_TABS.map(tab => (
          <button key={tab.id} className={`pill ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="hub-content animate-fadeIn">
        <div className="card p-30 glass-card text-center grid gap-15">
            <span className="material-icons text-5xl opacity-2">router</span>
            <h3>{NETWORK_TABS.find(t => t.id === activeTab)?.label}</h3>
            <p className="smallest opacity-6">Network diagnostics and connectivity analysis.</p>
            <button className="btn-primary w-full">Run Analysis</button>
        </div>
      </div>
    </div>
  );
};

export default NetworkTools;
