import React, { useState, useEffect } from 'react';
import API_BASE from '../../api';

const NetworkTools = ({ toolId, onResultChange, onSubtoolChange }) => {
  const tabs = [
    { id: 'ip-info', label: 'IP Info' },
    { id: 'ping', label: 'Ping' },
    { id: 'dns', label: 'DNS' },
    { id: 'whois', label: 'Whois' },
    { id: 'speed', label: 'Speed' },
    { id: 'geo', label: 'Geo' },
    { id: 'ssl', label: 'SSL' },
    { id: 'subnet', label: 'Subnet' },
    { id: 'bluetooth', label: 'Bluetooth' }
  ].sort((a, b) => a.label.localeCompare(b.label));

  const [activeTab, setActiveTab] = useState('ip-info');

  useEffect(() => {
    const current = tabs.find(t => t.id === activeTab);
    if (current && onSubtoolChange) onSubtoolChange(current.label);
  }, [activeTab]);

  useEffect(() => {
    if (toolId) {
      const mapping = {
        'ip-info': 'ip-info', 'ping': 'ping', 'dns': 'dns', 'whois': 'whois',
        'speed': 'speed', 'geo': 'geo', 'ssl': 'ssl', 'subnet': 'subnet', 'bluetooth': 'bluetooth'
      };
      if (mapping[toolId]) setActiveTab(mapping[toolId]);
    }
  }, [toolId]);

  return (
    <div className="tool-form">
      <div className="pill-group mb-20 scrollable-x">
        {tabs.map(tab => (
          <button key={tab.id} className={`pill ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="hub-content animate-fadeIn">
        {activeTab === 'ip-info' && <IpInfoTool onResultChange={onResultChange} />}
        {activeTab === 'ping' && <PingTool onResultChange={onResultChange} />}
        {activeTab === 'dns' && <DnsTool onResultChange={onResultChange} />}
        {activeTab === 'whois' && <WhoisTool onResultChange={onResultChange} />}
        {activeTab === 'speed' && <SpeedTestTool onResultChange={onResultChange} />}
        {activeTab === 'geo' && <GeoTool onResultChange={onResultChange} />}
        {activeTab === 'ssl' && <SslTool onResultChange={onResultChange} />}
        {activeTab === 'subnet' && <SubnetCalculator onResultChange={onResultChange} />}
        {activeTab === 'bluetooth' && <BluetoothTool onResultChange={onResultChange} />}
      </div>
    </div>
  );
};

const IpInfoTool = ({ onResultChange }) => {
  const [data, setData] = useState(null);
  useEffect(() => {
    fetch('https://ipapi.co/json/').then(res => res.json()).then(d => {
        setData(d); onResultChange({ text: `IP: ${d.ip}\nISP: ${d.org}\nLoc: ${d.city}, ${d.country_name}`, filename: 'ip_info.txt' });
    }).catch(() => setData({ip: 'Failed to fetch'}));
  }, []);
  if (!data) return <div className="text-center p-20 rotating material-icons">refresh</div>;
  return (
    <div className="grid gap-15">
      <div className="card p-30 text-center glass-card"><div style={{ opacity: 0.5 }}>Current IP</div><div className="font-mono h1 color-primary" style={{fontSize: '3rem'}}>{data.ip}</div></div>
      <div className="grid grid-2-cols gap-15">
        <div className="card p-15 glass-card"><h3>ISP</h3><div className="opacity-7">{data.org}</div></div>
        <div className="card p-15 glass-card"><h3>Details</h3><div className="opacity-7">{data.city}, {data.region}</div></div>
      </div>
    </div>
  );
};

const PingTool = () => {
    const [host, setHost] = useState('google.com');
    const [res, setRes] = useState([]);
    const run = async () => {
        setRes(['Pinging...']);
        try {
            const r = await fetch(`${API_BASE}/networking/ping?host=${host}`);
            const d = await r.json();
            setRes(d.output?.split('\n') || ['Failed']);
        } catch(e) { setRes(['Error connecting to API.']); }
    };
    return (
        <div className="grid gap-15">
            <div className="flex-gap"><input className="pill flex-1" value={host} onChange={e=>setHost(e.target.value)} /><button className="btn-primary" onClick={run}>Ping</button></div>
            <div className="tool-result font-mono text-small" style={{background:'#1a1a1a', color:'#0f0', padding:'15px', borderRadius:'12px'}}>{res.map((l,i)=><div key={i}>{l}</div>)}</div>
        </div>
    );
};

const SslTool = () => {
    const [host, setHost] = useState('google.com');
    const [info, setInfo] = useState(null);
    const check = async () => {
        try {
            const res = await fetch(`${API_BASE}/networking/ssl?host=${host}`);
            const data = await res.json();
            setInfo(data);
        } catch(e) { alert("SSL Check failed"); }
    };
    return (
        <div className="grid gap-15">
            <div className="flex-gap"><input className="pill flex-1" value={host} onChange={e=>setHost(e.target.value)} /><button className="btn-primary" onClick={check}>Check SSL</button></div>
            {info && (
                <div className={`tool-result glass-card ${info.valid ? '' : 'danger-box'}`}>
                    <div className="font-bold h2 mb-10">{info.valid ? '✅ VALID' : '❌ INVALID'}</div>
                    <div className="grid gap-5 text-small">
                        <div><b>Issuer:</b> {info.issuer}</div>
                        <div><b>Expiry:</b> {info.expiry}</div>
                        <div style={{color: info.days_left < 30 ? 'var(--danger)' : 'var(--nature-moss)'}}><b>Days Left:</b> {info.days_left}</div>
                    </div>
                </div>
            )}
        </div>
    );
};

const WhoisTool = () => {
    const [domain, setDomain] = useState('example.com');
    const [res, setRes] = useState('');
    const run = async () => {
        try {
            const r = await fetch(`${API_BASE}/networking/whois?domain=${domain}`);
            const d = await r.json();
            setRes(d.output || 'No data');
        } catch(e) { setRes('API Error'); }
    };
    return (
        <div className="grid gap-15">
            <div className="flex-gap"><input className="pill flex-1" value={domain} onChange={e=>setDomain(e.target.value)} /><button className="btn-primary" onClick={run}>Whois</button></div>
            <pre className="tool-result font-mono text-xs overflow-auto" style={{maxHeight:'250px'}}>{res}</pre>
        </div>
    );
};

const GeoTool = () => {
    const [ip, setIp] = useState('');
    const [res, setRes] = useState(null);
    const run = async () => {
        try {
            const r = await fetch(`https://ipapi.co/${ip}/json/`);
            setRes(await r.json());
        } catch(e) { alert("Error"); }
    };
    return (
        <div className="grid gap-15">
            <div className="flex-gap"><input className="pill flex-1" placeholder="IP Address" value={ip} onChange={e=>setIp(e.target.value)} /><button className="btn-primary" onClick={run}>Locate</button></div>
            {res && <div className="tool-result glass-card"><b>{res.city}, {res.country_name}</b><br/>{res.org} (ASN: {res.asn})</div>}
        </div>
    );
};

const SpeedTestTool = () => {
    const [speed, setSpeed] = useState(null);
    const [loading, setLoading] = useState(false);
    const run = async () => {
        setLoading(true); setSpeed(null);
        const start = Date.now();
        try {
            const res = await fetch('https://upload.wikimedia.org/wikipedia/commons/3/3f/Fronalpstock_big.jpg', { cache: 'no-store' });
            const blob = await res.blob();
            const mbps = ((blob.size * 8) / ((Date.now() - start) / 1000) / (1024 * 1024)).toFixed(2);
            setSpeed(mbps);
        } catch(e) { alert("Failed"); }
        finally { setLoading(false); }
    };
    return (
        <div className="card p-30 text-center glass-card">
            <div className="font-bold h1 mb-20">{speed ? `${speed} Mbps` : '---'}</div>
            <button className="btn-primary w-full h2" onClick={run} disabled={loading}>{loading ? 'Testing...' : 'Test Download Speed'}</button>
        </div>
    );
};

const DnsTool = () => {
    const [q, setQ] = useState('github.com');
    const [res, setRes] = useState(null);
    const lookup = async () => {
        try {
            const r = await fetch(`https://dns.google/resolve?name=${q}`);
            setRes(await r.json());
        } catch(e) { alert("Lookup failed"); }
    };
    return (
        <div className="grid gap-15">
            <div className="flex-gap"><input className="pill flex-1" value={q} onChange={e=>setQ(e.target.value)} /><button className="btn-primary" onClick={lookup}>DNS Lookup</button></div>
            {res && <div className="tool-result font-mono text-xs overflow-auto" style={{maxHeight:'200px'}}>{res.Answer?.map((a,i)=><div key={i} className="mb-5">{a.data} ({a.type===1?'A':'TXT'})</div>)}</div>}
        </div>
    );
};

const SubnetCalculator = () => {
    const [ip, setIp] = useState('192.168.1.1');
    const [mask, setMask] = useState('24');
    const [res, setRes] = useState(null);
    const calc = () => {
        const m = parseInt(mask);
        const hosts = m >= 31 ? 0 : Math.pow(2, 32-m) - 2;
        setRes({ hosts });
    };
    return (
        <div className="grid gap-15 card p-25 glass-card">
            <div className="flex-gap"><input className="pill flex-1 h2" value={ip} onChange={e=>setIp(e.target.value)} /><input className="pill h2" style={{width:'80px'}} value={mask} onChange={e=>setMask(e.target.value)} /></div>
            <button className="btn-primary w-full h2" onClick={calc}>Calculate Subnet</button>
            {res && <div className="tool-result font-bold h2 text-center">Usable Hosts: <span className="color-primary">{res.hosts.toLocaleString()}</span></div>}
        </div>
    );
};

const BluetoothTool = () => (
    <div className="card p-40 text-center glass-card">
        <span className="material-icons color-primary" style={{fontSize: '4rem'}}>bluetooth</span>
        <div className="mv-15 opacity-6 h2">Web Bluetooth Discovery</div>
        <p className="mb-20 opacity-5">Connect and interact with nearby Bluetooth Low Energy devices.</p>
        <button className="btn-primary w-full h2" onClick={() => navigator.bluetooth?.requestDevice({acceptAllDevices:true})}>Scan for Devices</button>
    </div>
);

export default NetworkTools;
