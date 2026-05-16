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
        'ip-info': 'ip-info',
        'ping': 'ping',
        'dns': 'dns',
        'whois': 'whois',
        'speed': 'speed',
        'geo': 'geo',
        'ssl': 'ssl',
        'subnet': 'subnet',
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
  const [publicIp, setPublicIp] = useState('Loading...');
  const [localIp, setLocalIp] = useState('Detecting...');
  const [geoInfo, setGeoInfo] = useState(null);

  useEffect(() => {
    fetch('https://ipapi.co/json/').then(res => res.json()).then(data => {
      setPublicIp(data.ip);
      setGeoInfo(data);
    }).catch(() => setPublicIp('Failed to fetch'));

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
  }, [publicIp, localIp, geoInfo]);

  return (
    <div className="grid gap-15">
      <div className="grid grid-2 gap-15">
        <div className="card p-20 glass-card">
            <div className="opacity-6 smallest uppercase font-bold mb-10">Public Address</div>
            <div className="font-mono h2 color-primary text-center">{publicIp}</div>
        </div>
        <div className="card p-20 glass-card">
            <div className="opacity-6 smallest uppercase font-bold mb-10">Local Address</div>
            <div className="font-mono h2 opacity-8 text-center">{localIp}</div>
        </div>
      </div>
      {geoInfo && (
          <div className="card p-20 glass-card grid grid-2-cols gap-10">
              <div>ISP: <b>{geoInfo.org}</b></div>
              <div>City: <b>{geoInfo.city}</b></div>
              <div>Country: <b>{geoInfo.country_name}</b></div>
              <div>Region: <b>{geoInfo.region}</b></div>
          </div>
      )}
    </div>
  );
};

const PingTool = ({ onResultChange }) => {
  const [host, setHost] = useState('google.com');
  const [results, setResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);

  const isServerless = API_BASE === 'JSON-MODE';

  const runPing = async () => {
    setIsRunning(true); setResults([`Pinging ${host}...`]);
    try {
      if (isServerless) {
          setTimeout(() => {
              setResults([
                  `PING ${host} (142.250.190.46): 56 data bytes`,
                  `64 bytes from 142.250.190.46: icmp_seq=0 ttl=117 time=14.2 ms`,
                  `64 bytes from 142.250.190.46: icmp_seq=1 ttl=117 time=15.1 ms`,
                  '',
                  `--- ${host} ping statistics ---`,
                  '2 packets transmitted, 2 packets received, 0.0% packet loss',
                  'round-trip min/avg/max/stddev = 14.2/14.6/15.1/0.4 ms',
                  '',
                  '[DEMO MODE: Simulated results as no backend is connected]'
              ]);
              setIsRunning(false);
          }, 1000);
          return;
      }
      const res = await fetch(`${API_BASE}/networking/ping?host=${host}`);
      const data = await res.json();
      if (res.ok) setResults(data.output?.split('\n') || []);
      else throw new Error("Ping command failed");
    } catch (err) {
        setResults([`Fallback: Ping ${host}`, 'Request timed out or forbidden by CORS.']);
    } finally { if(!isServerless) setIsRunning(false); }
  };
  return (
    <div className="grid gap-15">
      {isServerless && (
          <div className="danger-box" style={{ padding: '10px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="material-icons" style={{ fontSize: '1.2rem' }}>cloud_off</span>
              <span><b>Backend Required:</b> Native ping requires a server. Showing simulated results.</span>
          </div>
      )}
      <div className="flex-gap glass-card card p-10"><input type="text" value={host} onChange={e => setHost(e.target.value)} className="pill flex-1 border-none shadow-none" /><button className="btn-primary" onClick={runPing} disabled={isRunning}>{isRunning ? '...' : 'Ping'}</button></div>
      <div className="tool-result font-mono" style={{ background: '#1a1a1a', color: '#00ff00' }}>{results.map((r, i) => <div key={i}>{r}</div>)}</div>
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
            <div className="flex-gap card p-10 glass-card"><input type="text" value={domain} onChange={e => setDomain(e.target.value)} className="pill flex-1 border-none shadow-none" /><button className="btn-primary" onClick={lookup}>Lookup</button></div>
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
        } catch(e) { alert("Test failed. Check connection."); }
        finally { setLoading(false); }
    };
    return (
        <div className="card p-30 text-center glass-card">
            <span className="material-icons" style={{fontSize: '4rem', color: 'var(--primary)'}}>speed</span>
            <div style={{fontSize: '3rem', fontWeight: 800}} className="mb-20">{speed ? `${speed} Mbps` : '---'}</div>
            <button className="btn-primary w-full" onClick={run} disabled={loading}>{loading ? 'Testing...' : 'Start Test'}</button>
        </div>
    );
};

const WhoisTool = () => {
    const [domain, setDomain] = useState('example.com');
    const [out, setOut] = useState('');
    const [isRunning, setIsRunning] = useState(false);

    const isServerless = API_BASE === 'JSON-MODE';

    const run = async () => {
        setIsRunning(true);
        try {
            if (isServerless) {
                setTimeout(() => {
                    setOut(`Domain Name: ${domain.toUpperCase()}\nRegistry Domain ID: 2336796_DOMAIN_COM-VRSN\nRegistrar WHOIS Server: whois.iana.org\nRegistrar: IANA\n\n[DEMO MODE: Simulated WHOIS data]`);
                    setIsRunning(false);
                }, 1000);
                return;
            }
            const res = await fetch(`${API_BASE}/networking/whois?domain=${domain}`);
            const data = await res.json();
            setOut(data.output || 'No records found.');
        } catch(e) { setOut('WHOIS query failed.'); }
        finally { if(!isServerless) setIsRunning(false); }
    };
    return (
        <div className="grid gap-15">
            {isServerless && (
                <div className="danger-box" style={{ padding: '10px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="material-icons" style={{ fontSize: '1.2rem' }}>cloud_off</span>
                    <span><b>Backend Required:</b> WHOIS protocol requires server-side execution.</span>
                </div>
            )}
            <div className="flex-gap card p-10 glass-card"><input type="text" value={domain} onChange={e=>setDomain(e.target.value)} className="pill flex-1 border-none shadow-none" /><button className="btn-primary" onClick={run} disabled={isRunning}>{isRunning ? '...' : 'Whois'}</button></div>
            <pre className="tool-result font-mono" style={{fontSize: '0.75rem', maxHeight: '300px', overflow: 'auto'}}>{out}</pre>
        </div>
    );
};

const GeoTool = () => {
    const [ip, setIp] = useState('');
    const [info, setInfo] = useState(null);
    const run = async () => {
        try { const res = await fetch(`https://ipapi.co/${ip}/json/`); const data = await res.json(); setInfo(data); } catch(e) { alert("Geo lookup failed"); }
    };
    return (
        <div className="grid gap-15">
            <div className="flex-gap card p-10 glass-card"><input type="text" value={ip} onChange={e=>setIp(e.target.value)} className="pill flex-1 border-none shadow-none" placeholder="IP Address" /><button className="btn-primary" onClick={run}>Locate</button></div>
            {info && <div className="tool-result"><b>{info.city}, {info.country_name}</b><br/>{info.org}</div>}
        </div>
    );
};

const SslTool = () => {
    const [host, setHost] = useState('google.com');
    const [info, setInfo] = useState(null);
    const [loading, setLoading] = useState(false);

    const isServerless = API_BASE === 'JSON-MODE';

    const check = async () => {
        setLoading(true);
        try {
            if (isServerless) {
                setTimeout(() => {
                    setInfo({
                        valid: true,
                        issuer: 'GTS CA 1C3',
                        expiry: '2024-12-31',
                        days_left: 120
                    });
                    setLoading(false);
                }, 1000);
                return;
            }
            const res = await fetch(`${API_BASE}/networking/ssl?host=${host}`);
            const data = await res.json();
            setInfo(data);
        } catch(e) { alert("SSL Check failed"); }
        finally { if(!isServerless) setLoading(false); }
    };

    return (
        <div className="grid gap-15">
            {isServerless && (
                <div className="danger-box" style={{ padding: '10px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="material-icons" style={{ fontSize: '1.2rem' }}>cloud_off</span>
                    <span><b>Backend Required:</b> SSL verification requires server-side handshake.</span>
                </div>
            )}
            <div className="flex-gap card p-10 glass-card">
                <input className="pill flex-1 border-none shadow-none" value={host} onChange={e=>setHost(e.target.value)} />
                <button className="btn-primary" onClick={check} disabled={loading}>{loading ? '...' : 'Check'}</button>
            </div>
            {info && (
                <div className={`tool-result ${info.valid ? '' : 'danger-box'}`}>
                    {info.valid ? (
                        <>
                            <div className="font-bold text-lg mb-5">SSL is VALID</div>
                            <div>Issuer: {info.issuer}</div>
                            <div>Expires: {info.expiry}</div>
                            <div className="mt-10" style={{color: info.days_left < 30 ? 'var(--danger)' : 'var(--green)'}}>
                                {info.days_left} days remaining
                            </div>
                            {isServerless && <div className="mt-10 smallest opacity-6">[SIMULATED DATA]</div>}
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
      <div className="flex-gap card p-10 glass-card"><input value={ip} onChange={e=>setIp(e.target.value)} className="pill flex-1 border-none shadow-none" /><input value={mask} onChange={e=>setMask(e.target.value)} className="pill border" style={{width: '80px'}} /></div>
      <button className="btn-primary" onClick={calc}>Calculate</button>
      {res && <div className="tool-result font-mono">Net: {res.net}<br/>Broadcast: {res.br}<br/>Hosts: {res.hosts}</div>}
    </div>
  );
};

const BluetoothTool = () => (
    <div className="card p-30 text-center glass-card">
        <span className="material-icons" style={{fontSize: '4rem', color: 'var(--primary)'}}>bluetooth</span>
        <div className="mt-15 opacity-6">Web Bluetooth requires secure context and user interaction.</div>
        <button className="btn-primary mt-20" onClick={async () => {
            if (!navigator.bluetooth) {
                alert("Web Bluetooth is not supported in this browser.");
                return;
            }
            try { await navigator.bluetooth.requestDevice({acceptAllDevices: true}); } catch(e) { alert("Access denied or unsupported."); }
        }}>Scan Devices</button>
    </div>
);

export default NetworkTools;
