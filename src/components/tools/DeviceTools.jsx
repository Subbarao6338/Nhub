import React, { useState, useEffect, useRef } from 'react';
import { useAmbientLight } from './useAmbientLight';

const DeviceTools = ({ toolId, onResultChange, onSubtoolChange }) => {
  const tabs = [
    { id: 'info', label: 'Device Info' },
    { id: 'sensors', label: 'Sensors' },
    { id: 'lux', label: 'Luxmeter' },
    { id: 'sound', label: 'Sound Meter' },
    { id: 'magnetic', label: 'Magnetic' },
    { id: 'flashlight', label: 'Flashlight' },
    { id: 'vibration', label: 'Vibrometer' },
    { id: 'ruler', label: 'Ruler' },
    { id: 'level', label: 'Level' },
    { id: 'protractor', label: 'Protractor' },
    { id: 'compass', label: 'Compass' },
    { id: 'gps', label: 'GPS' },
    { id: 'sos', label: 'SOS' }
  ].sort((a, b) => a.label.localeCompare(b.label));

  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    const current = tabs.find(t => t.id === activeTab);
    if (current && onSubtoolChange) onSubtoolChange(current.label);
  }, [activeTab]);

  useEffect(() => {
    if (toolId) {
      const mapping = {
        'device-info': 'info',
        'android-sensors': 'sensors',
        'luxmeter': 'lux',
        'soundmeter': 'sound',
        'magnetic-tester': 'magnetic',
        'flashlight': 'flashlight',
        'vibrometer': 'vibration',
        'ruler': 'ruler',
        'level-pendulum': 'level',
        'protractor': 'protractor',
        'compass': 'compass',
        'gps-info': 'gps',
        'sos': 'sos'
      };
      if (mapping[toolId]) setActiveTab(mapping[toolId]); else if (tabs.length > 0) setActiveTab(tabs[0].id);
    }
  }, [toolId]);

  const isDeepLinked = !!toolId && tabs.some(t => t.id === toolId || toolId.includes(t.id));

  return (
    <div className="tool-form">
      {!isDeepLinked && (
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
      )}

      {activeTab === 'info' && <DeviceInfo onResultChange={onResultChange} />}
      {activeTab === 'lux' && <Luxmeter onResultChange={onResultChange} />}
      {activeTab === 'sos' && <SosTool />}
      {activeTab === 'flashlight' && <FlashlightTool />}
      {activeTab === 'vibration' && <VibrometerTool />}
      {activeTab === 'compass' && <CompassTool />}
      {activeTab === 'level' && <LevelTool />}
      {activeTab === 'gps' && <GpsTool onResultChange={onResultChange} />}
      {activeTab === 'sound' && <SoundMeter onResultChange={onResultChange} />}
      {activeTab === 'sensors' && <SensorGraph title="Accelerometer" type="devicemotion" property="acceleration" />}
      {activeTab === 'magnetic' && <SensorGraph title="Magnetometer" type="deviceorientation" property="magnetic" />}
      {['ruler', 'protractor'].includes(activeTab) && (
          <div className="text-center p-20 card opacity-6">
              <span className="material-icons mb-10" style={{fontSize: '2rem'}}>sensors</span>
              <div>This hardware tool is being integrated.</div>
          </div>
      )}
    </div>
  );
};

const DeviceInfo = ({ onResultChange }) => {
    const [battery, setBattery] = useState(null);
    useEffect(() => {
        if ('getBattery' in navigator) {
            navigator.getBattery().then(b => setBattery({ level: b.level * 100, charging: b.charging }));
        }
    }, []);

    const info = {
        agent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        cores: navigator.hardwareConcurrency,
        memory: navigator.deviceMemory,
        touch: navigator.maxTouchPoints
    };
    useEffect(() => {
        onResultChange({ text: JSON.stringify(info, null, 2), filename: 'device_info.txt' });
    }, []);
    return (
        <div className="grid gap-15">
            {battery && (
                <div className="card p-20 text-center">
                    <div className="sensor-circle" style={{
                        width: '120px', height: '120px',
                        border: '10px solid var(--border)',
                        borderTopColor: 'var(--nature-moss)'
                    }}>
                        <div style={{fontSize: '1.5rem', fontWeight: 800}}>{Math.round(battery.level)}%</div>
                        <div className="smallest opacity-6">{battery.charging ? 'Charging' : 'Discharging'}</div>
                    </div>
                </div>
            )}
            <div className="grid gap-10 card p-15">
                {Object.entries(info).map(([k, v]) => (
                    <div key={k} className="flex-between"><span className="capitalize opacity-6">{k}:</span> <b className="text-right" style={{fontSize: '0.8rem', wordBreak: 'break-all', maxWidth: '60%'}}>{v}</b></div>
                ))}
            </div>
        </div>
    );
};

const Luxmeter = ({ onResultChange }) => {
    const { lux } = useAmbientLight();
    useEffect(() => {
        if (lux !== null) onResultChange({ text: `Light level: ${lux} lux`, filename: 'lux.txt' });
    }, [lux]);
    return (
        <div className="text-center p-20 card">
            <span className="material-icons" style={{fontSize: '3rem', color: 'var(--nature-gold)'}}>wb_sunny</span>
            <div style={{fontSize: '3rem', fontWeight: 800}} className="mv-10">{lux !== null ? Math.round(lux) : '---'}</div>
            <div className="opacity-6">Lux</div>
        </div>
    );
};

const SoundMeter = ({ onResultChange }) => {
    const [db, setDb] = useState(0);
    const [active, setActive] = useState(false);
    const audioCtxRef = useRef(null);
    const streamRef = useRef(null);

    const start = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            audioCtxRef.current = new AudioContext();
            const source = audioCtxRef.current.createMediaStreamSource(stream);
            const processor = audioCtxRef.current.createAnalyser();
            source.connect(processor);
            processor.fftSize = 256;
            const data = new Uint8Array(processor.frequencyBinCount);
            setActive(true);
            const update = () => {
                if(!streamRef.current) return;
                processor.getByteFrequencyData(data);
                const avg = data.reduce((a,b)=>a+b)/data.length;
                setDb(Math.round(avg));
                requestAnimationFrame(update);
            };
            update();
        } catch(e) { alert("Mic required"); }
    };

    const stop = async () => {
        if(streamRef.current) streamRef.current.getTracks().forEach(t=>t.stop());
        streamRef.current = null;
        if(audioCtxRef.current) {
            await audioCtxRef.current.close();
            audioCtxRef.current = null;
        }
        setActive(false);
    };

    useEffect(()=>()=>stop(), []);

    return (
        <div className="card p-20 text-center">
            <div className="sensor-circle" style={{
                width: '150px', height: '150px',
                border: '10px solid var(--border)',
                borderTopColor: db > 60 ? 'var(--danger)' : 'var(--nature-moss)'
            }}>
                <div style={{fontSize: '3rem', fontWeight: 800}}>{db}</div>
                <div className="smallest opacity-6">Avg Level</div>
            </div>
            <button className="btn-primary w-full mt-20" onClick={active?stop:start}>{active?'Stop':'Start'}</button>
        </div>
    );
};

const FlashlightTool = () => {
    const [on, setOn] = useState(false);
    const streamRef = useRef(null);
    const toggle = async () => {
        try {
            if (on) {
                streamRef.current.getTracks().forEach(t=>t.stop());
                setOn(false);
            } else {
                const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                streamRef.current = stream;
                const track = stream.getVideoTracks()[0];
                await track.applyConstraints({ advanced: [{ torch: true }] });
                setOn(true);
            }
        } catch(e) { alert("Flashlight not supported or denied."); }
    };
    useEffect(()=>()=>streamRef.current?.getTracks().forEach(t=>t.stop()), []);
    return (
        <div className="card p-20 text-center">
            <span className="material-icons mb-15" style={{fontSize: '5rem', color: on?'var(--nature-gold)':'inherit'}}>flashlight_{on?'on':'off'}</span>
            <button className="btn-primary w-full" onClick={toggle}>{on?'Turn OFF':'Turn ON'}</button>
        </div>
    );
};

const VibrometerTool = () => {
    const [vibrating, setVibrating] = useState(false);
    const toggle = () => {
        if (vibrating) { navigator.vibrate(0); setVibrating(false); }
        else { navigator.vibrate([200, 100, 200, 100, 500]); setVibrating(true); setTimeout(()=>setVibrating(false), 1100); }
    };
    return (
        <div className="card p-20 text-center">
            <span className="material-icons mb-15" style={{fontSize: '5rem'}}>vibration</span>
            <button className="btn-primary w-full" onClick={toggle}>{vibrating?'Vibrating...':'Test Vibration'}</button>
        </div>
    );
};

const CompassTool = () => {
    const [heading, setHeading] = useState(0);
    useEffect(() => {
        const handle = (e) => {
            if (e.webkitCompassHeading) setHeading(e.webkitCompassHeading);
            else if (e.alpha) setHeading(360 - e.alpha);
        };
        window.addEventListener('deviceorientation', handle, true);
        return () => window.removeEventListener('deviceorientation', handle);
    }, []);
    return (
        <div className="card p-20 text-center">
            <div className="m-auto" style={{ width: '200px', height: '200px', border: '4px solid var(--border)', borderRadius: '50%', position: 'relative', transform: `rotate(${-heading}deg)`, transition: 'transform 0.1s' }}>
                <span className="material-icons" style={{ position: 'absolute', top: '10px', left: '50%', transform: 'translateX(-50%)', color: 'var(--danger)' }}>navigation</span>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(${heading}deg)', fontWeight: 800 }}>{Math.round(heading)}°</div>
            </div>
            <p className="mt-15 opacity-6">Compass heading (Device Orientation)</p>
        </div>
    );
};

const LevelTool = () => {
    const [tilt, setTilt] = useState({ x: 0, y: 0 });
    useEffect(() => {
        const handle = (e) => setTilt({ x: e.beta, y: e.gamma });
        window.addEventListener('deviceorientation', handle);
        return () => window.removeEventListener('deviceorientation', handle);
    }, []);
    return (
        <div className="card p-20 text-center">
            <div className="m-auto" style={{ width: '200px', height: '100px', border: '2px solid var(--border)', borderRadius: '50px', position: 'relative', background: 'var(--nature-mist)' }}>
                <div style={{
                    position: 'absolute', top: '50%', left: `${50 + (tilt.y/45)*50}%`,
                    width: '30px', height: '30px', background: 'var(--nature-moss)', borderRadius: '50%',
                    transform: 'translate(-50%, -50%)', transition: 'left 0.1s'
                }} />
            </div>
            <div className="mt-15 font-mono">X: {Math.round(tilt.x)}° | Y: {Math.round(tilt.y)}°</div>
        </div>
    );
};

const GpsTool = ({ onResultChange }) => {
    const [pos, setPos] = useState(null);
    const get = () => {
        navigator.geolocation.getCurrentPosition(p => {
            const data = { lat: p.coords.latitude, lng: p.coords.longitude, alt: p.coords.altitude, speed: p.coords.speed };
            setPos(data);
            onResultChange({ text: `GPS: Lat ${data.lat}, Lng ${data.lng}`, filename: 'gps.txt' });
        });
    };
    return (
        <div className="card p-20 text-center">
            {pos ? (
                <div className="grid gap-10">
                    <div>Latitude: <b>{pos.lat.toFixed(6)}</b></div>
                    <div>Longitude: <b>{pos.lng.toFixed(6)}</b></div>
                    <div className="opacity-6">Accuracy: {pos.acc}m</div>
                </div>
            ) : <span className="material-icons opacity-3" style={{fontSize: '4rem'}}>location_on</span>}
            <button className="btn-primary w-full mt-20" onClick={get}>Get Current Location</button>
        </div>
    );
};

const SensorGraph = ({ title, type, property }) => {
    const [data, setData] = useState({ x: 0, y: 0, z: 0 });
    const [history, setHistory] = useState([]);

    useEffect(() => {
        const handle = (e) => {
            let next = { x: 0, y: 0, z: 0 };
            if (type === 'devicemotion' && e.acceleration) {
                next = { x: e.acceleration.x || 0, y: e.acceleration.y || 0, z: e.acceleration.z || 0 };
            } else if (type === 'deviceorientation') {
                next = { x: e.beta || 0, y: e.gamma || 0, z: e.alpha || 0 };
            }
            setData(next);
            setHistory(h => [next, ...h].slice(0, 50));
        };
        window.addEventListener(type, handle);
        return () => window.removeEventListener(type, handle);
    }, [type]);

    return (
        <div className="card p-20">
            <h3 className="mb-15">{title}</h3>
            <div className="grid grid-3 gap-10 mb-20 text-center">
                <div className="pill">X: {data.x.toFixed(2)}</div>
                <div className="pill">Y: {data.y.toFixed(2)}</div>
                <div className="pill">Z: {data.z.toFixed(2)}</div>
            </div>
            <div className="border rounded-16 p-10 bg-white" style={{height: '150px'}}>
                <svg viewBox="0 0 100 50" className="w-full h-full" preserveAspectRatio="none">
                    <polyline fill="none" stroke="var(--primary)" strokeWidth="0.5" points={history.map((h, i) => `${i*2},${25 - h.x}`).join(' ')} />
                    <polyline fill="none" stroke="var(--danger)" strokeWidth="0.5" points={history.map((h, i) => `${i*2},${25 - h.y}`).join(' ')} />
                    <polyline fill="none" stroke="var(--nature-moss)" strokeWidth="0.5" points={history.map((h, i) => `${i*2},${25 - h.z}`).join(' ')} />
                </svg>
            </div>
        </div>
    );
};

const SosTool = () => {
    const [active, setActive] = useState(false);
    const timeoutRef = useRef(null);
    const toggle = () => {
        if (active) { clearTimeout(timeoutRef.current); document.body.style.background = ''; setActive(false); }
        else {
            setActive(true); let step = 0;
            const pattern = [200, 200, 200, 200, 200, 600, 600, 200, 600, 200, 600, 600, 200, 200, 200, 200, 200, 1000];
            const run = () => {
                document.body.style.background = step % 2 === 0 ? 'white' : 'black';
                timeoutRef.current = setTimeout(run, pattern[step % pattern.length]);
                step++;
            };
            run();
        }
    };
    useEffect(() => () => { clearTimeout(timeoutRef.current); document.body.style.background = ''; }, []);
    return (
        <div className="text-center p-20 card">
            <button className={`btn-primary w-full ${active ? 'danger' : ''}`} onClick={toggle} style={{ height: '100px', fontSize: '2rem' }}>{active ? 'STOP SOS' : 'START SOS'}</button>
            <p className="mt-15 opacity-6">Flashes screen in Morse SOS</p>
        </div>
    );
};

export default DeviceTools;
