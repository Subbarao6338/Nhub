import React, { useState, useEffect, useRef } from 'react';
import { useAmbientLight } from './useAmbientLight';

const DeviceTools = ({ toolId, onResultChange, onSubtoolChange }) => {
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
      {['sensors', 'sound', 'magnetic', 'flashlight', 'vibration', 'ruler', 'level', 'protractor', 'compass', 'gps'].includes(activeTab) && (
          <div className="text-center p-20 card opacity-6">
              <span className="material-icons mb-10" style={{fontSize: '2rem'}}>sensors</span>
              <div>This hardware tool is being integrated.</div>
          </div>
      )}
    </div>
  );
};

const DeviceInfo = ({ onResultChange }) => {
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
        <div className="grid gap-10 card p-15">
            {Object.entries(info).map(([k, v]) => (
                <div key={k} className="flex-between"><span className="capitalize opacity-6">{k}:</span> <b className="text-right">{v}</b></div>
            ))}
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
