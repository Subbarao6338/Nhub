import React, { useState, useEffect } from 'react';

const AndroidSensors = ({ onResultChange }) => {
  const [motion, setMotion] = useState({ acc: { x: 0, y: 0, z: 0 }, gyro: { alpha: 0, beta: 0, gamma: 0 } });
  const [orientation, setOrientation] = useState({ alpha: 0, beta: 0, gamma: 0 });
  const [ambient, setAmbient] = useState({ light: 'N/A', proximity: 'N/A' });
  const [error, setError] = useState(null);
  const [permissionGranted, setPermissionGranted] = useState(false);

  const requestPermission = async () => {
    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
      try {
        const response = await DeviceMotionEvent.requestPermission();
        if (response === 'granted') {
          setPermissionGranted(true);
        } else {
          setError('Permission denied');
        }
      } catch (err) {
        setError('Error requesting permission: ' + err.message);
      }
    } else {
      // For browsers that don't need explicit permission request or don't support it
      setPermissionGranted(true);
    }
  };

  useEffect(() => {
    if (!permissionGranted) return;

    const handleMotion = (event) => {
      setMotion({
        acc: {
          x: event.accelerationIncludingGravity?.x?.toFixed(2) || 0,
          y: event.accelerationIncludingGravity?.y?.toFixed(2) || 0,
          z: event.accelerationIncludingGravity?.z?.toFixed(2) || 0,
        },
        gyro: {
          alpha: event.rotationRate?.alpha?.toFixed(2) || 0,
          beta: event.rotationRate?.beta?.toFixed(2) || 0,
          gamma: event.rotationRate?.gamma?.toFixed(2) || 0,
        }
      });
    };

    const handleOrientation = (event) => {
      setOrientation({
        alpha: event.alpha?.toFixed(2) || 0,
        beta: event.beta?.toFixed(2) || 0,
        gamma: event.gamma?.toFixed(2) || 0,
      });
    };

    window.addEventListener('devicemotion', handleMotion);
    window.addEventListener('deviceorientation', handleOrientation);

    // Generic Sensor API (Chrome/Android)
    let lightSensor, proximitySensor;
    try {
      if ('AmbientLightSensor' in window) {
        lightSensor = new window.AmbientLightSensor();
        lightSensor.onreading = () => setAmbient(prev => ({ ...prev, light: lightSensor.illuminance.toFixed(1) + ' lx' }));
        lightSensor.start();
      }
      if ('ProximitySensor' in window) {
        proximitySensor = new window.ProximitySensor();
        proximitySensor.onreading = () => setAmbient(prev => ({ ...prev, proximity: (proximitySensor.distance || 'Near') + ' cm' }));
        proximitySensor.start();
      }
    } catch (e) {
      console.warn('Generic Sensor API not supported:', e);
    }

    return () => {
      window.removeEventListener('devicemotion', handleMotion);
      window.removeEventListener('deviceorientation', handleOrientation);
      lightSensor?.stop();
      proximitySensor?.stop();
    };
  }, [permissionGranted]);

  useEffect(() => {
    onResultChange({
      text: `Sensor Data:\n` +
            `Accelerometer: X:${motion.acc.x} Y:${motion.acc.y} Z:${motion.acc.z}\n` +
            `Gyroscope: A:${motion.gyro.alpha} B:${motion.gyro.beta} G:${motion.gyro.gamma}\n` +
            `Orientation: A:${orientation.alpha} B:${orientation.beta} G:${orientation.gamma}\n` +
            `Light: ${ambient.light}, Proximity: ${ambient.proximity}`,
      filename: 'sensor_data.txt'
    });
  }, [motion, orientation, ambient, onResultChange]);

  const SensorValue = ({ label, value, unit = '' }) => (
    <div className="tool-result" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
      <span>{label}</span>
      <b>{value}{unit}</b>
    </div>
  );

  return (
    <div className="tool-form">
      {!permissionGranted ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <span className="material-icons" style={{ fontSize: '3rem', color: 'var(--primary)', marginBottom: '15px' }}>sensors</span>
          <h4>Sensor Access Required</h4>
          <p style={{ opacity: 0.7, marginBottom: '20px' }}>Enable access to see real-time motion and orientation data from your device sensors.</p>
          <button className="btn-primary" onClick={requestPermission} style={{ padding: '10px 25px' }}>Enable Sensors</button>
          {error && <div style={{ color: 'var(--danger)', marginTop: '15px' }}>{error}</div>}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          <div className="sensor-card" style={{ padding: '15px', background: 'rgba(var(--primary-rgb), 0.03)', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
              <span className="material-icons" style={{ color: 'var(--primary)' }}>speed</span>
              <h5 style={{ margin: 0 }}>Accelerometer</h5>
            </div>
            <SensorValue label="X-axis" value={motion.acc.x} unit=" m/s²" />
            <SensorValue label="Y-axis" value={motion.acc.y} unit=" m/s²" />
            <SensorValue label="Z-axis" value={motion.acc.z} unit=" m/s²" />
          </div>

          <div className="sensor-card" style={{ padding: '15px', background: 'rgba(var(--primary-rgb), 0.03)', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
              <span className="material-icons" style={{ color: 'var(--primary)' }}>sync</span>
              <h5 style={{ margin: 0 }}>Gyroscope</h5>
            </div>
            <SensorValue label="Alpha" value={motion.gyro.alpha} unit=" °/s" />
            <SensorValue label="Beta" value={motion.gyro.beta} unit=" °/s" />
            <SensorValue label="Gamma" value={motion.gyro.gamma} unit=" °/s" />
          </div>

          <div className="sensor-card" style={{ padding: '15px', background: 'rgba(var(--primary-rgb), 0.03)', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
              <span className="material-icons" style={{ color: 'var(--primary)' }}>explore</span>
              <h5 style={{ margin: 0 }}>Orientation</h5>
            </div>
            <SensorValue label="Alpha (Yaw)" value={orientation.alpha} unit="°" />
            <SensorValue label="Beta (Pitch)" value={orientation.beta} unit="°" />
            <SensorValue label="Gamma (Roll)" value={orientation.gamma} unit="°" />
          </div>

          <div className="sensor-card" style={{ padding: '15px', background: 'rgba(var(--primary-rgb), 0.03)', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
              <span className="material-icons" style={{ color: 'var(--primary)' }}>visibility</span>
              <h5 style={{ margin: 0 }}>Environment</h5>
            </div>
            <SensorValue label="Light" value={ambient.light} />
            <SensorValue label="Proximity" value={ambient.proximity} />
          </div>
        </div>
      )}
    </div>
  );
};

export default AndroidSensors;
