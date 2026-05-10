import React, { useState, useEffect } from 'react';
import { STRINGS } from '../../strings';
import { NATURE_THEME } from '../../constants';

const SystemTools = ({ toolId, onResultChange }) => {
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    if (toolId) {
        if (toolId === 'device-info') setActiveTab('info');
        else if (toolId === 'android-sensors') setActiveTab('sensors');
        else if (toolId === 'system-management') setActiveTab('apps');
        else if (toolId === 'system-thermal') setActiveTab('thermal');
        else setActiveTab(toolId);
    }
  }, [toolId]);

  return (
    <div className="tool-form">
      <div className="pill-group mb-20 scrollable-x">
        <button className={`pill ${activeTab === 'info' ? 'active' : ''}`} onClick={() => setActiveTab('info')}>Device Info</button>
        <button className={`pill ${activeTab === 'sensors' ? 'active' : ''}`} onClick={() => setActiveTab('sensors')}>Sensors</button>
        <button className={`pill ${activeTab === 'apps' ? 'active' : ''}`} onClick={() => setActiveTab('apps')}>App Manager</button>
        <button className={`pill ${activeTab === 'thermal' ? 'active' : ''}`} onClick={() => setActiveTab('thermal')}>Thermal</button>
        <button className={`pill ${activeTab === 'battery' ? 'active' : ''}`} onClick={() => setActiveTab('battery')}>Battery</button>
      </div>

      {activeTab === 'info' && <DeviceInfoTab onResultChange={onResultChange} />}
      {activeTab === 'sensors' && <SensorsTab onResultChange={onResultChange} />}
      {activeTab === 'apps' && <AppManagerTab onResultChange={onResultChange} />}
      {activeTab === 'thermal' && <ThermalTab onResultChange={onResultChange} />}
      {activeTab === 'battery' && <BatteryTab onResultChange={onResultChange} />}
    </div>
  );
};

const DeviceInfoTab = ({ onResultChange }) => {
  const [memory, setMemory] = useState(navigator.deviceMemory ? `${navigator.deviceMemory} GB` : 'N/A');

  const info = [
    { l: 'Platform', v: navigator.platform },
    { l: 'Language', v: navigator.language },
    { l: 'Screen', v: `${window.screen.width}x${window.screen.height} (${window.screen.orientation?.type || 'N/A'})` },
    { l: 'Pixel Ratio', v: window.devicePixelRatio },
    { l: 'CPU Cores', v: navigator.hardwareConcurrency || 'N/A' },
    { l: 'Device Memory', v: memory },
    { l: 'Dark Mode', v: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'Enabled' : 'Disabled' },
    { l: 'Cookies Enabled', v: navigator.cookieEnabled ? 'Yes' : 'No' }
  ];

  useEffect(() => {
    onResultChange({
      text: info.map(i => `${i.l}: ${i.v}`).join('\n') + `\nUser Agent: ${navigator.userAgent}`,
      filename: 'device_info.txt'
    });
  }, [onResultChange, memory]);

  return (
    <div className="grid gap-10" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        {info.map(i => (
          <div key={i.l} className="tool-result" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px' }}>
            <span style={{ opacity: 0.7, fontSize: '0.85rem' }}>{i.l}</span>
            <b style={{ fontSize: '0.9rem' }}>{i.v}</b>
          </div>
        ))}
        <div className="tool-result" style={{ gridColumn: '1 / -1', marginTop: '10px', fontSize: '0.8rem', padding: '15px' }}>
            <div style={{ opacity: 0.5, marginBottom: '5px' }}>User Agent</div>
            <code style={{ color: 'var(--primary)', wordBreak: 'break-all' }}>{navigator.userAgent}</code>
        </div>
    </div>
  );
};

const SensorsTab = ({ onResultChange }) => {
  const [motion, setMotion] = useState({ acc: { x: 0, y: 0, z: 0 }, gyro: { alpha: 0, beta: 0, gamma: 0 } });
  const [orientation, setOrientation] = useState({ alpha: 0, beta: 0, gamma: 0 });
  const [ambient, setAmbient] = useState({ light: 'N/A' });
  const [permissionGranted, setPermissionGranted] = useState(false);

  const requestPermission = async () => {
    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
      try {
        const response = await DeviceMotionEvent.requestPermission();
        if (response === 'granted') setPermissionGranted(true);
      } catch (err) { alert(err.message); }
    } else { setPermissionGranted(true); }
  };

  useEffect(() => {
    if (!permissionGranted) return;
    const handleMotion = (e) => {
        setMotion({
            acc: { x: e.accelerationIncludingGravity?.x?.toFixed(2) || 0, y: e.accelerationIncludingGravity?.y?.toFixed(2) || 0, z: e.accelerationIncludingGravity?.z?.toFixed(2) || 0 },
            gyro: { alpha: e.rotationRate?.alpha?.toFixed(2) || 0, beta: e.rotationRate?.beta?.toFixed(2) || 0, gamma: e.rotationRate?.gamma?.toFixed(2) || 0 }
        });
    };
    const handleOrientation = (e) => {
        setOrientation({ alpha: e.alpha?.toFixed(2) || 0, beta: e.beta?.toFixed(2) || 0, gamma: e.gamma?.toFixed(2) || 0 });
    };
    window.addEventListener('devicemotion', handleMotion);
    window.addEventListener('deviceorientation', handleOrientation);

    let lightSensor;
    if ('AmbientLightSensor' in window) {
        try {
            lightSensor = new window.AmbientLightSensor();
            lightSensor.onreading = () => setAmbient({ light: lightSensor.illuminance.toFixed(1) + ' lx' });
            lightSensor.start();
        } catch (e) { console.warn("Light sensor failed", e); }
    }

    return () => {
        window.removeEventListener('devicemotion', handleMotion);
        window.removeEventListener('deviceorientation', handleOrientation);
        lightSensor?.stop();
    };
  }, [permissionGranted]);

  useEffect(() => {
      onResultChange({
          text: `Acc: ${motion.acc.x}, ${motion.acc.y}, ${motion.acc.z}\nGyro: ${motion.gyro.alpha}, ${motion.gyro.beta}, ${motion.gyro.gamma}\nOri: ${orientation.alpha}, ${orientation.beta}, ${orientation.gamma}\nLight: ${ambient.light}`,
          filename: 'sensors.txt'
      });
  }, [motion, orientation, ambient, onResultChange]);

  if (!permissionGranted) {
      return (
          <div className="card p-20 text-center">
              <span className="material-icons" style={{ fontSize: '3rem', color: 'var(--primary)', marginBottom: '1rem' }}>sensors</span>
              <p className="mb-20">Permission required for sensor data</p>
              <button className="btn-primary" onClick={requestPermission}>Enable Sensors</button>
          </div>
      );
  }

  return (
      <div className="grid gap-15" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <div className="card p-15">
              <h5 className="mb-10 opacity-6 uppercase">Accelerometer</h5>
              <div className="grid gap-5">
                  <div className="flex-between"><span>X</span><b>{motion.acc.x}</b></div>
                  <div className="flex-between"><span>Y</span><b>{motion.acc.y}</b></div>
                  <div className="flex-between"><span>Z</span><b>{motion.acc.z}</b></div>
              </div>
          </div>
          <div className="card p-15">
              <h5 className="mb-10 opacity-6 uppercase">Orientation</h5>
              <div className="grid gap-5">
                  <div className="flex-between"><span>Yaw</span><b>{orientation.alpha}°</b></div>
                  <div className="flex-between"><span>Pitch</span><b>{orientation.beta}°</b></div>
                  <div className="flex-between"><span>Roll</span><b>{orientation.gamma}°</b></div>
              </div>
          </div>
          <div className="card p-15">
              <h5 className="mb-10 opacity-6 uppercase">Environment</h5>
              <div className="grid gap-5">
                  <div className="flex-between"><span>Light</span><b>{ambient.light}</b></div>
              </div>
          </div>
      </div>
  );
};

const AppManagerTab = ({ onResultChange }) => {
    const [apps, setApps] = useState([]);
    const [storage, setStorage] = useState(null);

    useEffect(() => {
        // Mocking app management
        setApps([
            { name: 'Nature Toolbox', package: 'com.nature.toolbox', size: '24 MB' },
            { name: 'System Settings', package: 'com.android.settings', size: '12 MB' },
            { name: 'Browser', package: 'com.android.chrome', size: '150 MB' }
        ]);

        if (navigator.storage && navigator.storage.estimate) {
            navigator.storage.estimate().then(estimate => {
                setStorage({
                    used: (estimate.usage / (1024 * 1024)).toFixed(1),
                    quota: (estimate.quota / (1024 * 1024 * 1024)).toFixed(1)
                });
            });
        }
    }, []);

    useEffect(() => {
        onResultChange({ text: apps.map(a => `${a.name}: ${a.size}`).join('\n'), filename: 'apps.txt' });
    }, [apps, onResultChange]);

    return (
        <div className="grid gap-10">
            {storage && (
                <div className="card p-15 mb-10">
                    <h5 className="mb-10 opacity-6 uppercase">Browser Storage</h5>
                    <div className="flex-between mb-5">
                        <span>Used</span>
                        <b>{storage.used} MB</b>
                    </div>
                    <div className="flex-between">
                        <span>Quota</span>
                        <b>{storage.quota} GB</b>
                    </div>
                </div>
            )}
            {apps.map(app => (
                <div key={app.package} className="card p-12 flex-between">
                    <div className="flex-center gap-12">
                        <span className="material-icons opacity-5">apps</span>
                        <div>
                            <div className="font-bold">{app.name}</div>
                            <div style={{ fontSize: '0.7rem', opacity: 0.5 }}>{app.package}</div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="font-bold">{app.size}</div>
                    </div>
                </div>
            ))}
        </div>
    );
};

const ThermalTab = ({ onResultChange }) => {
    const [temp, setTemp] = useState(35.5);
    const levels = NATURE_THEME.thermalLevels;
    const level = temp < 35 ? levels[0] : (temp < 38 ? levels[1] : (temp < 40 ? levels[2] : levels[3]));

    useEffect(() => {
        const i = setInterval(() => setTemp(t => +(t + (Math.random() * 0.4 - 0.2)).toFixed(1)), 3000);
        return () => clearInterval(i);
    }, []);

    useEffect(() => {
        onResultChange({ text: `Thermal: ${temp}°C (${level.label})`, filename: 'thermal.txt' });
    }, [temp, level, onResultChange]);

    return (
        <div className="card p-20 text-center">
            <div style={{ fontSize: '3rem', color: level.color, marginBottom: '10px' }}>
                <span className="material-icons" style={{ fontSize: 'inherit' }}>thermostat</span>
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800 }}>{temp}°C</div>
            <div className="uppercase tracking-wider font-bold" style={{ color: level.color }}>{level.label}</div>
        </div>
    );
};

const BatteryTab = ({ onResultChange }) => {
    const [battery, setBattery] = useState({ level: 0, charging: false });

    useEffect(() => {
        if (navigator.getBattery) {
            navigator.getBattery().then(batt => {
                const update = () => setBattery({ level: batt.level, charging: batt.charging });
                update();
                batt.onlevelchange = update;
                batt.onchargingchange = update;
            });
        }
    }, []);

    useEffect(() => {
        onResultChange({ text: `Battery: ${Math.round(battery.level * 100)}% (${battery.charging ? 'Charging' : 'Discharging'})`, filename: 'battery.txt' });
    }, [battery, onResultChange]);

    return (
        <div className="card p-20 text-center">
            <div style={{ fontSize: '3rem', color: battery.level > 0.2 ? 'var(--primary)' : 'var(--danger)', marginBottom: '10px' }}>
                <span className="material-icons" style={{ fontSize: 'inherit' }}>
                    {battery.charging ? 'battery_charging_full' : (battery.level > 0.9 ? 'battery_full' : (battery.level > 0.5 ? 'battery_5_bar' : 'battery_1_bar'))}
                </span>
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800 }}>{Math.round(battery.level * 100)}%</div>
            <div className="font-bold opacity-7">{battery.charging ? 'Charging' : 'Discharging'}</div>
        </div>
    );
};

export default SystemTools;
