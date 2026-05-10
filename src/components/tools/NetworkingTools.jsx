import React, { useState, useEffect } from 'react';
import API_BASE from '../../api';

const NetworkingTools = ({ toolId }) => {
  const [activeTab, setActiveTab] = useState('ip-info');

  useEffect(() => {
    if (toolId) {
      if (toolId === 'networking-main') setActiveTab('ip-info');
      else setActiveTab(toolId);
    }
  }, [toolId]);

  return (
    <div className="tool-form">
      {!toolId && (
        <div className="pill-group mb-20 scrollable-x">
          <button className={`pill ${activeTab === 'ip-info' ? 'active' : ''}`} onClick={() => setActiveTab('ip-info')}>IP Info</button>
          <button className={`pill ${activeTab === 'ping' ? 'active' : ''}`} onClick={() => setActiveTab('ping')}>Ping</button>
          <button className={`pill ${activeTab === 'dns' ? 'active' : ''}`} onClick={() => setActiveTab('dns')}>DNS Lookup</button>
          <button className={`pill ${activeTab === 'whois' ? 'active' : ''}`} onClick={() => setActiveTab('whois')}>Whois</button>
          <button className={`pill ${activeTab === 'subnet-calc' ? 'active' : ''}`} onClick={() => setActiveTab('subnet-calc')}>Subnet Calc</button>
        </div>
      )}

      {activeTab === 'ip-info' && <IpInfoTool />}
      {activeTab === 'ping' && <PingTool />}
      {activeTab === 'dns' && <DnsTool />}
      {activeTab === 'whois' && <WhoisTool />}
      {activeTab === 'subnet-calc' && <SubnetCalculator />}
    </div>
  );
};

const IpInfoTool = () => {
  const [publicIp, setPublicIp] = useState('Loading...');
  const [localIp, setLocalIp] = useState('Detecting...');
  const [geoInfo, setGeoInfo] = useState(null);

  useEffect(() => {
    // Public IP
    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => {
        setPublicIp(data.ip);
        setGeoInfo(data);
      })
      .catch(() => setPublicIp('Failed to fetch'));

    // Local IP via WebRTC
    const pc = new RTCPeerConnection({ iceServers: [] });
    pc.createDataChannel('');
    pc.createOffer().then(offer => pc.setLocalDescription(offer));
    pc.onicecandidate = (ice) => {
      if (!ice || !ice.candidate || !ice.candidate.candidate) return;
      const myIp = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/.exec(ice.candidate.candidate)[1];
      setLocalIp(myIp);
      pc.onicecandidate = () => {};
    };
  }, []);

  return (
    <div className="grid gap-15">
      <div className="card p-15">
        <h3 className="font-bold mb-10">Public IP Address</h3>
        <div className="font-mono text-center" style={{ fontSize: '1.5rem', color: 'var(--primary)' }}>{publicIp}</div>
      </div>
      <div className="card p-15">
        <h3 className="font-bold mb-10">Local IP Address</h3>
        <div className="font-mono text-center" style={{ fontSize: '1.5rem', opacity: 0.8 }}>{localIp}</div>
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

const PingTool = () => {
  const [host, setHost] = useState('google.com');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const runPing = async () => {
    setLoading(true);
    setResults([]);
    try {
      const res = await fetch(`${API_BASE}/networking/ping?host=${host}`);
      const data = await res.json();
      if (res.ok) {
        setResults(data.output.split('\n'));
      } else {
        setResults(['Error: ' + (data.detail || 'Ping failed')]);
      }
    } catch (err) {
      setResults(['Error: Connection failed']);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-15">
      <div className="flex-gap">
        <input type="text" value={host} onChange={e => setHost(e.target.value)} placeholder="google.com" className="pill flex-1" />
        <button className="btn-primary" onClick={runPing} disabled={loading}>{loading ? '...' : 'Ping'}</button>
      </div>
      <div className="tool-result font-mono" style={{ fontSize: '0.8rem', minHeight: '100px', whiteSpace: 'pre-wrap' }}>
        {results.length > 0 ? results.join('\n') : 'Ready to ping...'}
      </div>
    </div>
  );
};

const DnsTool = () => {
  const [domain, setDomain] = useState('github.com');
  const [records, setRecords] = useState(null);
  const [loading, setLoading] = useState(false);

  const lookup = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/networking/dns?domain=${domain}`);
      const data = await res.json();
      setRecords(data);
    } catch (err) {
      alert("DNS lookup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-15">
      <div className="flex-gap">
        <input type="text" value={domain} onChange={e => setDomain(e.target.value)} placeholder="domain.com" className="pill flex-1" />
        <button className="btn-primary" onClick={lookup} disabled={loading}>{loading ? '...' : 'Lookup'}</button>
      </div>
      {records && (
        <div className="tool-result font-mono" style={{ fontSize: '0.85rem' }}>
          {Object.entries(records).map(([type, vals]) => (
            <div key={type} className="mb-10">
              <div className="font-bold uppercase color-primary">{type}</div>
              {vals.map((v, i) => <div key={i} style={{ paddingLeft: '10px' }}>{v}</div>)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const SubnetCalculator = () => {
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

      setResult({
        network: toIp(networkNum),
        broadcast: toIp(broadcastNum),
        hosts: Math.pow(2, 32 - m) - 2,
        range: `${toIp(networkNum + 1)} - ${toIp(broadcastNum - 1)}`
      });
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

const WhoisTool = () => {
  const [domain, setDomain] = useState('example.com');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  const runWhois = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/networking/whois?domain=${domain}`);
      const data = await res.json();
      setOutput(data.output || 'No data found');
    } catch (err) {
      setOutput('Whois failed');
    } finally {
      setLoading(false);
    }
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

export default NetworkingTools;
