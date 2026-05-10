import React, { useState, useEffect, useCallback } from 'react';
import API_BASE from '../../api';

const NetworkingTools = ({ toolId, onResultChange }) => {
  const [activeTab, setActiveTab] = useState('ip-info');

  useEffect(() => {
    if (toolId) {
      if (toolId === 'networking-main' || toolId === 'network-tools') setActiveTab('ip-info');
      else if (toolId === 'ping') setActiveTab('ping');
      else if (toolId === 'dns') setActiveTab('dns');
      else if (toolId === 'whois') setActiveTab('whois');
      else if (toolId === 'speed') setActiveTab('speed');
      else if (toolId === 'bluetooth') setActiveTab('bluetooth');
      else setActiveTab(toolId);
    }
  }, [toolId]);

  return (
    <div className="tool-form">
      <div className="pill-group mb-20 scrollable-x">
        <button className={`pill ${activeTab === 'ip-info' ? 'active' : ''}`} onClick={() => setActiveTab('ip-info')}>IP Info</button>
        <button className={`pill ${activeTab === 'ping' ? 'active' : ''}`} onClick={() => setActiveTab('ping')}>Ping</button>
        <button className={`pill ${activeTab === 'dns' ? 'active' : ''}`} onClick={() => setActiveTab('dns')}>DNS</button>
        <button className={`pill ${activeTab === 'whois' ? 'active' : ''}`} onClick={() => setActiveTab('whois')}>Whois</button>
        <button className={`pill ${activeTab === 'speed' ? 'active' : ''}`} onClick={() => setActiveTab('speed')}>Speed</button>
        <button className={`pill ${activeTab === 'geo' ? 'active' : ''}`} onClick={() => setActiveTab('geo')}>Geo</button>
        <button className={`pill ${activeTab === 'ssl' ? 'active' : ''}`} onClick={() => setActiveTab('ssl')}>SSL</button>
        <button className={`pill ${activeTab === 'subnet-calc' ? 'active' : ''}`} onClick={() => setActiveTab('subnet-calc')}>Subnet</button>
        <button className={`pill ${activeTab === 'bluetooth' ? 'active' : ''}`} onClick={() => setActiveTab('bluetooth')}>Bluetooth</button>
      </div>

      {activeTab === 'ip-info' && <IpInfoTool onResultChange={onResultChange} />}
      {activeTab === 'ping' && <PingTool onResultChange={onResultChange} />}
      {activeTab === 'dns' && <DnsTool onResultChange={onResultChange} />}
      {activeTab === 'whois' && <WhoisTool onResultChange={onResultChange} />}
      {activeTab === 'speed' && <SpeedTestTool onResultChange={onResultChange} />}
      {activeTab === 'geo' && <GeoTool onResultChange={onResultChange} />}
      {activeTab === 'ssl' && <SslTool onResultChange={onResultChange} />}
      {activeTab === 'subnet-calc' && <SubnetCalculator onResultChange={onResultChange} />}
      {activeTab === 'bluetooth' && <BluetoothTool onResultChange={onResultChange} />}
    </div>
  );
};

const IpInfoTool = ({ onResultChange }) => {
  const [publicIp, setPublicIp] = useState('Loading...');
  const [localIp, setLocalIp] = useState('Detecting...');
  const [geoInfo, setGeoInfo] = useState(null);
  const isOnline = navigator.onLine;

  useEffect(() => {
    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => {
        setPublicIp(data.ip);
        setGeoInfo(data);
      })
      .catch(() => setPublicIp('Failed to fetch'));

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
      text: `Status: ${isOnline ? 'ONLINE' : 'OFFLINE'}\nPublic IP: ${publicIp}\nLocal IP: ${localIp}\nCity: ${geoInfo?.city || 'N/A'}\nISP: ${geoInfo?.org || 'N/A'}`,
      filename: 'ip_info.txt'
    });
  }, [publicIp, localIp, geoInfo, isOnline, onResultChange]);

  return (
    <div className="grid gap-15">
      <div className="card p-20 text-center">
         <div style={{ opacity: 0.5, marginBottom: '10px' }}>Connection Status</div>
         <div style={{ fontSize: '2rem', fontWeight: 'bold', color: isOnline ? 'var(--nature-moss)' : 'var(--danger)' }}>
            {isOnline ? 'ONLINE' : 'OFFLINE'}
         </div>
      </div>
      <div className="grid gap-15" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
        <div className="card p-15">
            <h3 className="font-bold mb-10">Public IP</h3>
            <div className="font-mono text-center color-primary" style={{ fontSize: '1.25rem' }}>{publicIp}</div>
        </div>
        <div className="card p-15">
            <h3 className="font-bold mb-10">Local IP</h3>
            <div className="font-mono text-center" style={{ fontSize: '1.25rem', opacity: 0.8 }}>{localIp}</div>
        </div>
      </div>
      {geoInfo && (
        <div className="tool-result">
          <div className="grid gap-5">
            <div className="flex-between"><span>City:</span> <b>{geoInfo.city}</b></div>
            <div className="flex-between"><span>Region:</span> <b>{geoInfo.region}</b></div>
            <div className="flex-between"><span>Country:</span> <b>{geoInfo.country_name}</b></div>
            <div className="flex-between"><span>ISP:</span> <b>{geoInfo.org}</b></div>
          </div>
        </div>
      )}
    </div>
  );
};

const PingTool = ({ onResultChange }) => {
  const [host, setHost] = useState('google.com');
  const [results, setResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);

  const runPing = async () => {
    setIsRunning(true);
    setResults([`Pinging ${host}...`]);
    try {
      // Backend Ping
      const res = await fetch(`${API_BASE}/networking/ping?host=${host}`);
      const data = await res.json();
      if (res.ok) {
        setResults(data.output.split('\n'));
      } else {
        // Frontend Fallback (Simple Latency)
        const start = Date.now();
        await fetch(`https://${host}`, { mode: 'no-cors' });
        const end = Date.now();
        setResults([`Pinging ${host} [Frontend Fallback]`, `Reply from ${host}: time=${end - start}ms`]);
      }
    } catch (err) {
      setResults(['Error: Ping failed. Check console for details.']);
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    onResultChange({ text: results.join('\n'), filename: 'ping_results.txt' });
  }, [results, onResultChange]);

  return (
    <div className="grid gap-15">
      <div className="flex-gap">
        <input type="text" value={host} onChange={e => setHost(e.target.value)} placeholder="google.com" className="pill flex-1" />
        <button className="btn-primary" onClick={runPing} disabled={isRunning}>
            {isRunning ? <span className="material-icons rotating">refresh</span> : 'Ping'}
        </button>
      </div>
      <div className="tool-result font-mono" style={{ fontSize: '0.8rem', minHeight: '150px', background: '#1a1a1a', color: '#00ff00', padding: '15px', borderRadius: '12px' }}>
        {results.map((r, i) => <div key={i}>{r}</div>)}
      </div>
    </div>
  );
};

const DnsTool = ({ onResultChange }) => {
  const [domain, setDomain] = useState('github.com');
  const [records, setRecords] = useState(null);
  const [loading, setLoading] = useState(false);

  const lookup = async () => {
    setLoading(true);
    try {
      // Try backend first
      const res = await fetch(`${API_BASE}/networking/dns?domain=${domain}`);
      if (res.ok) {
        const data = await res.json();
        setRecords(data);
      } else {
        // Frontend fallback via Google DoH
        const res2 = await fetch(`https://dns.google/resolve?name=${domain}`);
        const data2 = await res2.json();
        if (data2.Answer) {
            const formatted = {};
            data2.Answer.forEach(ans => {
                const type = ans.type === 1 ? 'A' : (ans.type === 28 ? 'AAAA' : (ans.type === 15 ? 'MX' : 'TXT'));
                (formatted[type] || (formatted[type] = [])).push(ans.data);
            });
            setRecords(formatted);
        } else {
            setRecords({ 'Error': ['No records found'] });
        }
      }
    } catch (err) {
      setRecords({ 'Error': ['Lookup failed'] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (records) {
        onResultChange({
            text: Object.entries(records).map(([t, v]) => `${t}:\n  ${v.join('\n  ')}`).join('\n'),
            filename: 'dns_lookup.txt'
        });
    }
  }, [records, onResultChange]);

  return (
    <div className="grid gap-15">
      <div className="flex-gap">
        <input type="text" value={domain} onChange={e => setDomain(e.target.value)} placeholder="domain.com" className="pill flex-1" />
        <button className="btn-primary" onClick={lookup} disabled={loading}>{loading ? '...' : 'Lookup'}</button>
      </div>
      {records && (
        <div className="tool-result font-mono">
          {Object.entries(records).map(([type, vals]) => (
            <div key={type} className="mb-10">
              <div className="font-bold uppercase color-primary">{type}</div>
              {vals.map((v, i) => <div key={i} style={{ paddingLeft: '10px', opacity: 0.8 }}>{v}</div>)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const SpeedTestTool = ({ onResultChange }) => {
  const [status, setStatus] = useState('Ready');
  const [speed, setSpeed] = useState(null);
  const [progress, setProgress] = useState(0);

  const runTest = async () => {
    setStatus('Testing...');
    setProgress(10);
    const start = Date.now();
    try {
      // Test with a ~5MB image
      const res = await fetch('https://upload.wikimedia.org/wikipedia/commons/3/3f/Fronalpstock_big.jpg', { cache: 'no-store' });
      const reader = res.body.getReader();
      let loaded = 0;
      while(true) {
        const {done, value} = await reader.read();
        if (done) break;
        loaded += value.length;
        setProgress(Math.min(90, 10 + (loaded / 5000000) * 80));
      }
      const end = Date.now();
      const duration = (end - start) / 1000;
      const mbps = ((loaded * 8) / (duration * 1024 * 1024)).toFixed(2);
      setSpeed(mbps);
      setStatus('Complete');
      setProgress(100);
      onResultChange({ text: `Download Speed: ${mbps} Mbps\nDuration: ${duration.toFixed(2)}s`, filename: 'speedtest.txt' });
    } catch (err) {
      setStatus('Failed');
      console.error(err);
    }
  };

  return (
    <div className="card p-20 text-center">
      <div style={{ fontSize: '3rem', color: 'var(--primary)', marginBottom: '10px' }}>
        <span className="material-icons" style={{ fontSize: 'inherit' }}>speed</span>
      </div>
      <h3 className="mb-10">Bandwidth Speed Test</h3>
      {speed && <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)' }}>{speed} <span style={{ fontSize: '1rem' }}>Mbps</span></div>}
      <div style={{ margin: '20px 0', height: '8px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${progress}%`, background: 'var(--primary)', transition: 'width 0.3s' }} />
      </div>
      <button className="btn-primary w-full" onClick={runTest} disabled={status === 'Testing...'}>{status === 'Testing...' ? 'Testing...' : 'Start Test'}</button>
    </div>
  );
};

const WhoisTool = ({ onResultChange }) => {
  const [domain, setDomain] = useState('example.com');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  const runWhois = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/networking/whois?domain=${domain}`);
      const data = await res.json();
      setOutput(data.output || 'No data found');
      onResultChange({ text: data.output, filename: `whois_${domain}.txt` });
    } catch (err) { setOutput('Whois failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="grid gap-15">
      <div className="flex-gap">
        <input type="text" value={domain} onChange={e => setDomain(e.target.value)} placeholder="domain.com" className="pill flex-1" />
        <button className="btn-primary" onClick={runWhois} disabled={loading}>{loading ? '...' : 'Whois'}</button>
      </div>
      <div className="tool-result font-mono" style={{ fontSize: '0.75rem', maxHeight: '300px', overflowY: 'auto', whiteSpace: 'pre-wrap' }}>
        {output || 'Ready for Whois...'}
      </div>
    </div>
  );
};

const GeoTool = ({ onResultChange }) => {
    const [target, setTarget] = useState('');
    const [info, setInfo] = useState(null);
    const [loading, setLoading] = useState(false);

    const lookup = async () => {
        setLoading(true);
        try {
            const res = await fetch(`https://ipapi.co/${target}/json/`);
            const data = await res.json();
            setInfo(data);
            onResultChange({ text: JSON.stringify(data, null, 2), filename: `geo_${target || 'me'}.txt` });
        } catch (e) { alert('Failed'); }
        finally { setLoading(false); }
    };

    return (
        <div className="grid gap-15">
            <div className="flex-gap">
                <input type="text" value={target} onChange={e => setTarget(e.target.value)} placeholder="IP Address (optional)" className="pill flex-1" />
                <button className="btn-primary" onClick={lookup} disabled={loading}>Locate</button>
            </div>
            {info && (
                <div className="tool-result">
                    <div className="grid gap-5">
                        <div className="flex-between"><span>Location:</span> <b>{info.city}, {info.country_name}</b></div>
                        <div className="flex-between"><span>Lat/Long:</span> <b>{info.latitude}, {info.longitude}</b></div>
                        <div className="flex-between"><span>ISP:</span> <b>{info.org}</b></div>
                        <div className="flex-between"><span>ASN:</span> <b>{info.asn}</b></div>
                    </div>
                </div>
            )}
        </div>
    );
};

const SslTool = ({ onResultChange }) => {
    const [host, setHost] = useState('google.com');
    const [info, setInfo] = useState('');
    const [loading, setLoading] = useState(false);

    const check = async () => {
        setLoading(true);
        setInfo('Starting SSL analysis...');
        try {
            const res = await fetch(`https://api.ssllabs.com/api/v3/analyze?host=${host}`);
            const data = await res.json();
            setInfo(`Status: ${data.status}\nGrade: ${data.endpoints?.[0]?.grade || 'Pending...'}\nIP: ${data.endpoints?.[0]?.ipAddress || 'N/A'}`);
            onResultChange({ text: JSON.stringify(data, null, 2), filename: `ssl_${host}.txt` });
        } catch (e) { setInfo('Failed to check SSL'); }
        finally { setLoading(false); }
    };

    return (
        <div className="grid gap-15">
             <div className="flex-gap">
                <input type="text" value={host} onChange={e => setHost(e.target.value)} placeholder="domain.com" className="pill flex-1" />
                <button className="btn-primary" onClick={check} disabled={loading}>Check SSL</button>
            </div>
            <div className="tool-result font-mono" style={{ whiteSpace: 'pre-wrap' }}>
                {info || 'Ready to analyze SSL certificates...'}
            </div>
        </div>
    );
};

const SubnetCalculator = ({ onResultChange }) => {
  const [ip, setIp] = useState('192.168.1.1');
  const [mask, setMask] = useState('24');
  const [result, setResult] = useState(null);

  const calculate = () => {
    try {
      const ipParts = ip.split('.').map(Number);
      if (ipParts.length !== 4 || ipParts.some(p => p < 0 || p > 255)) throw new Error("Invalid IP");
      const m = parseInt(mask);
      if (isNaN(m) || m < 0 || m > 32) throw new Error("Invalid Mask");

      const ipNum = ((ipParts[0] << 24) >>> 0) | (ipParts[1] << 16) | (ipParts[2] << 8) | ipParts[3];
      const maskNum = m === 0 ? 0 : ((-1 << (32 - m)) >>> 0);
      const networkNum = (ipNum & maskNum) >>> 0;
      const broadcastNum = (networkNum | ~maskNum) >>> 0;

      const toIp = (num) => [
        (num >>> 24) & 0xFF,
        (num >>> 16) & 0xFF,
        (num >>> 8) & 0xFF,
        num & 0xFF
      ].join('.');

      const res = {
        network: toIp(networkNum),
        broadcast: toIp(broadcastNum),
        hosts: Math.pow(2, 32 - m) - 2,
        range: `${toIp(networkNum + 1)} - ${toIp(broadcastNum - 1)}`
      };
      setResult(res);
      onResultChange({ text: JSON.stringify(res, null, 2), filename: 'subnet.txt' });
    } catch (e) { alert(e.message); }
  };

  return (
    <div className="grid gap-15">
      <div className="flex-gap">
        <input type="text" value={ip} onChange={e => setIp(e.target.value)} placeholder="192.168.1.1" className="pill flex-1" />
        <input type="number" value={mask} onChange={e => setMask(e.target.value)} placeholder="24" className="pill" style={{ width: '80px' }} />
      </div>
      <button className="btn-primary" onClick={calculate}>Calculate Subnet</button>
      {result && (
        <div className="tool-result font-mono" style={{ fontSize: '0.9rem' }}>
          <div className="flex-between"><span>Network:</span> <b>{result.network}</b></div>
          <div className="flex-between"><span>Broadcast:</span> <b>{result.broadcast}</b></div>
          <div className="flex-between"><span>Usable Hosts:</span> <b>{result.hosts}</b></div>
          <div className="flex-between"><span>IP Range:</span> <b>{result.range}</b></div>
        </div>
      )}
    </div>
  );
};

const BluetoothTool = ({ onResultChange }) => {
  const [status, setStatus] = useState('Idle');

  const scan = async () => {
    if (!navigator.bluetooth) {
      setStatus('Web Bluetooth not supported');
      return;
    }
    setStatus('Scanning...');
    try {
      const device = await navigator.bluetooth.requestDevice({ acceptAllDevices: true });
      setStatus(`Found: ${device.name || 'Unknown Device'}`);
      onResultChange({ text: `Bluetooth Device: ${device.name}\nID: ${device.id}`, filename: 'bluetooth.txt' });
    } catch (err) { setStatus(`Scan failed: ${err.message}`); }
  };

  return (
    <div className="card p-20 text-center">
      <span className="material-icons" style={{ fontSize: '3rem', color: 'var(--primary)', marginBottom: '1rem' }}>bluetooth</span>
      <h3>Bluetooth Scanner</h3>
      <p style={{ opacity: 0.7 }}>{status}</p>
      <button className="btn-primary" onClick={scan} style={{ marginTop: '20px' }}>Scan for Devices</button>
    </div>
  );
};

export default NetworkingTools;
