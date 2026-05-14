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
        'networking-main': 'ip-info',
        'network-tools': 'ip-info',
        'ping': 'ping',
        'dns': 'dns',
        'whois': 'whois',
        'speed': 'speed',
        'geo': 'geo',
        'ssl': 'ssl',
        'subnet-calc': 'subnet',
        'bluetooth': 'bluetooth'
      };
      if (mapping[toolId]) setActiveTab(mapping[toolId]); else if (tabs.length > 0) setActiveTab(tabs[0].id);
    }
  }, [toolId]);

  return (
    <div className="tool-form">
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
  );
};

const IpInfoTool = ({ onResultChange }) => {
  const [publicIp, setPublicIp] = useState('Loading...');
  const [localIp, setLocalIp] = useState('Detecting...');
  const [geoInfo, setGeoInfo] = useState(null);
  const [battery, setBattery] = useState(null);

  useEffect(() => {
    fetch('https://ipapi.co/json/').then(res => res.json()).then(data => {
      setPublicIp(data.ip);
      setGeoInfo(data);
    }).catch(() => setPublicIp('Failed to fetch'));

    if ('getBattery' in navigator) {
        navigator.getBattery().then(batt => {
            setBattery({ level: batt.level * 100, charging: batt.charging });
        });
    }
    const pc = new RTCPeerConnection({ iceServers: [] });
    pc.createDataChannel('');
    pc.createOffer().then(offer => pc.setLocalDescription(offer));
    pc.onicecandidate = (ice) => {
      if (!ice || !ice.candidate || !ice.candidate.candidate) return;
      const match = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/.exec(ice.candidate.candidate);
      if (match) setLocalIp(match[1]);
      pc.onicecandidate = () => {};
    };
  }, []);

  useEffect(() => {
    onResultChange({
      text: `Public IP: ${publicIp}\nLocal IP: ${localIp}\nCity: ${geoInfo?.city || 'N/A'}\nISP: ${geoInfo?.org || 'N/A'}`,
      filename: 'ip_info.txt'
    });
  }, [publicIp, localIp, geoInfo, onResultChange]);

  return (
    <div className="grid gap-15">
      <div className="grid grid-2 gap-15">
          <div className="card p-20 text-center">
             <div style={{ opacity: 0.5, marginBottom: '10px' }}>Connection</div>
             <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--nature-moss)' }}>ESTABLISHED</div>
          </div>
          {battery && (
              <div className="card p-20 text-center">
                  <div style={{ opacity: 0.5, marginBottom: '10px' }}>Battery</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{Math.round(battery.level)}% {battery.charging ? '⚡' : ''}</div>
              </div>
          )}
      </div>
      <div className="grid grid-2 gap-15">
        <div className="card p-15"><h3>Public IP</h3><div className="font-mono text-center color-primary">{publicIp}</div></div>
        <div className="card p-15"><h3>Local IP</h3><div className="font-mono text-center opacity-8">{localIp}</div></div>
      </div>
    </div>
  );
};

const PingTool = ({ onResultChange }) => {
  const [host, setHost] = useState('google.com');
  const [results, setResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const runPing = async () => {
    setIsRunning(true); setResults([`Pinging ${host}...`]);
    try {
      const res = await fetch(`${API_BASE}/networking/ping?host=${host}`);
      const data = await res.json();
      if (res.ok) setResults(data.output?.split('\n') || []);
      else {
        const start = Date.now(); await fetch(`https://${host}`, { mode: 'no-cors' });
        const end = Date.now(); setResults([`Pinging ${host} [Fallback]`, `Reply from ${host}: time=${end - start}ms`]);
      }
    } catch (err) { setResults(['Error: Ping failed.']); }
    finally { setIsRunning(false); }
  };
  return (
    <div className="grid gap-15">
      <div className="flex-gap"><input type="text" value={host} onChange={e => setHost(e.target.value)} className="pill flex-1" /><button className="btn-primary" onClick={runPing} disabled={isRunning}>{isRunning ? '...' : 'Ping'}</button></div>
      <div className="tool-result font-mono" style={{ background: '#1a1a1a', color: '#00ff00', padding: '15px', borderRadius: '12px' }}>{results.map((r, i) => <div key={i}>{r}</div>)}</div>
    </div>
  );
};

const DnsTool = ({ onResultChange }) => {
    const [domain, setDomain] = useState('github.com');
    const [records, setRecords] = useState(null);
    const lookup = async () => {
        try {
            const res = await fetch(`https://dns.google/resolve?name=${domain}`);
            const data = await res.json();
            if (data.Answer) {
                const formatted = {};
                data.Answer.forEach(ans => {
                    const type = ans.type === 1 ? 'A' : (ans.type === 28 ? 'AAAA' : (ans.type === 15 ? 'MX' : 'TXT'));
                    (formatted[type] || (formatted[type] = [])).push(ans.data);
                });
                setRecords(formatted);
            } else setRecords({'Error': ['No records found']});
        } catch(e) { setRecords({'Error': ['Lookup failed']}); }
    };
    return (
        <div className="grid gap-15">
            <div className="flex-gap"><input type="text" value={domain} onChange={e => setDomain(e.target.value)} className="pill flex-1" /><button className="btn-primary" onClick={lookup}>Lookup</button></div>
            {records && <div className="tool-result font-mono">{Object.entries(records).map(([t,v])=>(<div key={t} className="mb-10"><div className="font-bold color-primary">{t}</div>{v.map((val,i)=><div key={i} style={{paddingLeft: '10px'}}>{val}</div>)}</div>))}</div>}
        </div>
    );
};

const SpeedTestTool = () => {
    const [speed, setSpeed] = useState(null);
    const [loading, setLoading] = useState(false);
    const run = async () => {
        setLoading(true); const start = Date.now();
        try {
            const res = await fetch('https://upload.wikimedia.org/wikipedia/commons/3/3f/Fronalpstock_big.jpg', { cache: 'no-store' });
            const blob = await res.blob();
            const duration = (Date.now() - start) / 1000;
            const mbps = ((blob.size * 8) / (duration * 1024 * 1024)).toFixed(2);
            setSpeed(mbps);
        } catch(e) { alert("Failed"); }
        finally { setLoading(false); }
    };
    return (
        <div className="card p-20 text-center">
            <span className="material-icons" style={{fontSize: '3rem', color: 'var(--primary)'}}>speed</span>
            <div style={{fontSize: '2rem', fontWeight: 800}} className="mv-15">{speed ? `${speed} Mbps` : '---'}</div>
            <button className="btn-primary w-full" onClick={run} disabled={loading}>{loading ? 'Testing...' : 'Start Test'}</button>
        </div>
    );
};

const WhoisTool = () => {
    const [domain, setDomain] = useState('example.com');
    const [out, setOut] = useState('');
    const run = async () => {
        try {
            const res = await fetch(`${API_BASE}/networking/whois?domain=${domain}`);
            const data = await res.json();
            setOut(data.output || 'No data');
        } catch(e) { setOut('Failed'); }
    };
    return (
        <div className="grid gap-15">
            <div className="flex-gap"><input type="text" value={domain} onChange={e=>setDomain(e.target.value)} className="pill flex-1" /><button className="btn-primary" onClick={run}>Whois</button></div>
            <pre className="tool-result font-mono" style={{fontSize: '0.7rem', maxHeight: '200px', overflow: 'auto'}}>{out}</pre>
        </div>
    );
};

const GeoTool = () => {
    const [ip, setIp] = useState('');
    const [info, setInfo] = useState(null);
    const run = async () => {
        try { const res = await fetch(`https://ipapi.co/${ip}/json/`); const data = await res.json(); setInfo(data); } catch(e) {}
    };
    return (
        <div className="grid gap-15">
            <div className="flex-gap"><input type="text" value={ip} onChange={e=>setIp(e.target.value)} className="pill flex-1" placeholder="IP Address" /><button className="btn-primary" onClick={run}>Locate</button></div>
            {info && <div className="tool-result"><b>{info.city}, {info.country_name}</b><br/>{info.org}</div>}
        </div>
    );
};

const SslTool = () => {
    const [host, setHost] = useState('google.com');
    const [info, setInfo] = useState(null);
    const [loading, setLoading] = useState(false);

    const check = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/networking/ssl?host=${host}`);
            const data = await res.json();
            setInfo(data);
        } catch(e) { alert("SSL Check failed"); }
        finally { setLoading(false); }
    };

    return (
        <div className="grid gap-15">
            <div className="flex-gap">
                <input className="pill flex-1" value={host} onChange={e=>setHost(e.target.value)} />
                <button className="btn-primary" onClick={check} disabled={loading}>{loading ? '...' : 'Check'}</button>
            </div>
            {info && (
                <div className={`tool-result ${info.valid ? '' : 'danger-box'}`}>
                    {info.valid ? (
                        <>
                            <div className="font-bold text-lg mb-5">SSL is VALID</div>
                            <div>Issuer: {info.issuer}</div>
                            <div>Expires: {info.expiry}</div>
                            <div className="mt-10" style={{color: info.days_left < 30 ? 'var(--danger)' : 'var(--nature-moss)'}}>
                                {info.days_left} days remaining
                            </div>
                        </>
                    ) : (
                        <div>Error: {info.error}</div>
                    )}
                </div>
            )}
        </div>
    );
};

const SubnetCalculator = () => {
  const [ip, setIp] = useState('192.168.1.1');
  const [mask, setMask] = useState('24');
  const [res, setRes] = useState(null);
  const calc = () => {
    try {
      const parts = ip.split('.').map(Number);
      const m = parseInt(mask);
      const ipNum = ((parts[0]<<24)|(parts[1]<<16)|(parts[2]<<8)|parts[3])>>>0;
      const maskNum = m===0?0:(-1<<(32-m))>>>0;
      const netNum = (ipNum & maskNum)>>>0;
      const brNum = (netNum | ~maskNum)>>>0;
      const toIp = n => [(n>>>24)&255, (n>>>16)&255, (n>>>8)&255, n&255].join('.');
      setRes({ net: toIp(netNum), br: toIp(brNum), hosts: Math.pow(2, 32-m)-2 });
    } catch(e) {}
  };
  return (
    <div className="grid gap-15">
      <div className="flex-gap"><input value={ip} onChange={e=>setIp(e.target.value)} className="pill flex-1" /><input value={mask} onChange={e=>setMask(e.target.value)} className="pill" style={{width: '60px'}} /></div>
      <button className="btn-primary" onClick={calc}>Calculate</button>
      {res && <div className="tool-result font-mono">Net: {res.net}<br/>Broadcast: {res.br}<br/>Hosts: {res.hosts}</div>}
    </div>
  );
};

const BluetoothTool = () => (
    <div className="card p-20 text-center">
        <span className="material-icons" style={{fontSize: '3rem', color: 'var(--primary)'}}>bluetooth</span>
        <div className="mt-15 opacity-6">Web Bluetooth requires secure context and user interaction.</div>
        <button className="btn-primary mt-15" onClick={async () => {
            if (!navigator.bluetooth) {
                alert("Web Bluetooth is not supported in this browser.");
                return;
            }
            try { await navigator.bluetooth.requestDevice({acceptAllDevices: true}); } catch(e) { alert("Access denied or unsupported."); }
        }}>Scan</button>
    </div>
);

export default NetworkTools;
