import React, { useState, useEffect } from 'react';

const OpsTools = ({ onSubtoolChange }) => {
    const tabs = [{ id: 'status', label: 'System Status' }, { id: 'telemetry', label: 'Live Telemetry' }];
    const [activeTab, setActiveTab] = useState('status');
    useEffect(() => { if (onSubtoolChange) onSubtoolChange(tabs.find(t=>t.id===activeTab).label); }, [activeTab]);

    return (
        <div className="tool-form mt-20">
            <div className="pill-group mb-20 scrollable-x">
                {tabs.map(tab => (
                    <button key={tab.id} className={`pill ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>{tab.label}</button>
                ))}
            </div>
            <div className="hub-content animate-fadeIn">
                {activeTab === 'status' && <SystemStatus />}
                {activeTab === 'telemetry' && <TelemetryView />}
            </div>
        </div>
    );
};

const SystemStatus = () => {
    const [status, setStatus] = useState(null);
    useEffect(() => { fetch('/api/ops/status').then(r=>r.json()).then(d=>setStatus(d)); }, []);
    return (
        <div className="grid gap-15">
            <div className="card p-30 glass-card text-center"><div className="h2 color-success">{status?.system_health || 'Stable'}</div><p>CPU Usage: {status?.cpu}%</p></div>
        </div>
    );
};

const TelemetryView = () => {
    const [data, setData] = useState([]);
    const fetchTele = () => fetch('/api/ops/telemetry').then(r=>r.json()).then(d=>setData(d.data));
    useEffect(() => { fetchTele(); const i = setInterval(fetchTele, 5000); return () => clearInterval(i); }, []);

    return (
        <div className="grid gap-10">
            {data.map(d => (
                <div key={d.device_id} className="card p-15 glass-card flex-between">
                    <div><b>{d.device_id}</b><br/><span className="smallest opacity-6">{d.timestamp}</span></div>
                    <div className="text-right"><div className="font-bold">{d.temperature}°C</div><div className={d.status==='online'?'color-success':'color-error'}>{d.status.toUpperCase()}</div></div>
                </div>
            ))}
        </div>
    );
};

export default OpsTools;
