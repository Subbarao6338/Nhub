import React, { useState, useEffect, useRef } from 'react';

const Measurements = ({ onResultChange, toolId }) => {
  const [activeTab, setActiveTab] = useState('ruler');

  useEffect(() => {
    if (toolId) {
        if (toolId === 'level-pendulum') setActiveTab('level');
        else if (toolId === 'tabata-timer') setActiveTab('tabata');
        else if (toolId === 'reaction-time') setActiveTab('reaction');
        else setActiveTab(toolId);
    }
  }, [toolId]);

  const [orientation, setOrientation] = useState({ beta: 0, gamma: 0 });
  const [permissionGranted, setPermissionGranted] = useState(false);

  const requestPermission = async () => {
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        const response = await DeviceOrientationEvent.requestPermission();
        if (response === 'granted') setPermissionGranted(true);
      } catch (err) { console.error(err); }
    } else {
      setPermissionGranted(true);
    }
  };

  useEffect(() => {
    if (!permissionGranted) return;
    const handleOrientation = (e) => {
      setOrientation({ beta: e.beta || 0, gamma: e.gamma || 0 });
    };
    window.addEventListener('deviceorientation', handleOrientation);

    return () => {
        window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [permissionGranted, activeTab]);

  return (
    <div className="tool-form">
      {!toolId && (
        <div className="pill-group mb-20 scrollable-x">
          <button className={`pill ${activeTab === 'ruler' ? 'active' : ''}`} onClick={() => setActiveTab('ruler')}>Ruler</button>
          <button className={`pill ${activeTab === 'level' ? 'active' : ''}`} onClick={() => setActiveTab('level')}>Level</button>
          <button className={`pill ${activeTab === 'pendulum' ? 'active' : ''}`} onClick={() => setActiveTab('pendulum')}>Pendulum</button>
          <button className={`pill ${activeTab === 'protractor' ? 'active' : ''}`} onClick={() => setActiveTab('protractor')}>Protractor</button>
          <button className={`pill ${activeTab === 'metronome' ? 'active' : ''}`} onClick={() => setActiveTab('metronome')}>Metronome</button>
          <button className={`pill ${activeTab === 'reaction' ? 'active' : ''}`} onClick={() => setActiveTab('reaction')}>Reaction</button>
          <button className={`pill ${activeTab === 'tabata' ? 'active' : ''}`} onClick={() => setActiveTab('tabata')}>Tabata</button>
        </div>
      )}

      {!permissionGranted && (['level', 'pendulum', 'protractor'].includes(activeTab)) && (
        <div className="text-center p-20">
          <button className="btn-primary" onClick={requestPermission}>Enable Sensors</button>
        </div>
      )}

      {activeTab === 'ruler' && <RulerTool />}
      {activeTab === 'level' && <LevelTool orientation={orientation} />}
      {activeTab === 'pendulum' && <PendulumTool orientation={orientation} />}
      {activeTab === 'protractor' && <ProtractorTool orientation={orientation} />}
      {activeTab === 'metronome' && <MetronomeTool />}
      {activeTab === 'reaction' && <ReactionTimeTool />}
      {activeTab === 'tabata' && <TabataTimerTool />}
    </div>
  );
};

const RulerTool = () => {
  const [unit, setUnit] = useState('cm');
  const dpi = 96; // Standard DPI
  const ppcm = dpi / 2.54;
  const ppin = dpi;

  return (
    <div className="ruler-container">
      <div className="flex-center p-10">
        <button className={`pill ${unit === 'cm' ? 'active' : ''}`} onClick={() => setUnit('cm')}>CM</button>
        <button className={`pill ${unit === 'in' ? 'active' : ''}`} onClick={() => setUnit('in')}>IN</button>
      </div>
      <div className="ruler-marks">
        {Array.from({ length: 50 }).map((_, i) => {
          const step = unit === 'cm' ? ppcm : ppin;
          const isMajor = i % (unit === 'cm' ? 10 : 8) === 0;
          const isHalf = i % (unit === 'cm' ? 5 : 4) === 0;
          return (
            <div key={i} className="ruler-mark" style={{
              left: `${i * (step / (unit === 'cm' ? 10 : 8))}px`,
              height: isMajor ? '40px' : (isHalf ? '25px' : '15px'),
              opacity: isMajor ? 1 : 0.5
            }}>
              {isMajor && <span className="ruler-label">{i / (unit === 'cm' ? 10 : 8)}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const LevelTool = ({ orientation }) => {
  const x = Math.max(-50, Math.min(50, orientation.gamma));
  const y = Math.max(-50, Math.min(50, orientation.beta));
  return (
    <div className="text-center">
      <div className="sensor-circle">
        <div className="level-bubble" style={{
          transform: `translate(calc(-50% + ${x * 1.5}px), calc(-50% + ${y * 1.5}px))`,
        }} />
        <div className="level-bubble opacity-3" style={{ border: '1px solid var(--primary)', background: 'none', width: '30px', height: '30px' }} />
      </div>
      <div className="mt-10">
        X: {orientation.gamma.toFixed(1)}° Y: {orientation.beta.toFixed(1)}°
      </div>
    </div>
  );
};

const PendulumTool = ({ orientation }) => {
    const angle = orientation.gamma;
    return (
        <div className="text-center w-full" style={{ height: '250px', position: 'relative' }}>
             <div className="pendulum-string" style={{
                transform: `translateX(-50%) rotate(${angle}deg)`,
             }}>
                 <div className="pendulum-bob" />
             </div>
             <div style={{ position: 'absolute', bottom: '0', width: '100%' }}>Angle: {angle.toFixed(1)}°</div>
        </div>
    );
};

const ProtractorTool = ({ orientation }) => {
    return (
        <div className="text-center w-full" style={{ position: 'relative', height: '250px' }}>
            <div className="protractor-semi">
                {Array.from({ length: 19 }).map((_, i) => (
                    <div key={i} className="ruler-mark" style={{
                        bottom: 0,
                        left: '50%',
                        height: i % 3 === 0 ? '20px' : '10px',
                        transformOrigin: 'bottom center',
                        transform: `rotate(${(i * 10) - 90}deg)`
                    }}>
                        {i % 3 === 0 && <span className="ruler-label" style={{ top: '25px', transform: `rotate(${90 - (i * 10)}deg)` }}>{i * 10}</span>}
                    </div>
                ))}
                <div className="protractor-needle" style={{
                    transform: `translateX(-50%) rotate(${orientation.gamma}deg)`,
                }} />
            </div>
            <div>Angle: {(orientation.gamma + 90).toFixed(1)}°</div>
        </div>
    );
};

const MetronomeTool = () => {
    const [bpm, setBpm] = useState(120);
    const [isPlaying, setIsPlaying] = useState(false);
    const intervalRef = useRef(null);
    const audioCtxRef = useRef(null);

    const playClick = () => {
        if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtxRef.current.createOscillator();
        const envelope = audioCtxRef.current.createGain();
        osc.frequency.value = 880;
        envelope.gain.value = 1;
        envelope.gain.exponentialRampToValueAtTime(0.001, audioCtxRef.current.currentTime + 0.1);
        osc.connect(envelope);
        envelope.connect(audioCtxRef.current.destination);
        osc.start();
        osc.stop(audioCtxRef.current.currentTime + 0.1);
    };

    useEffect(() => {
        if (isPlaying) {
            intervalRef.current = setInterval(playClick, (60 / bpm) * 1000);
        } else {
            clearInterval(intervalRef.current);
        }
        return () => clearInterval(intervalRef.current);
    }, [isPlaying, bpm]);

    return (
        <div className="text-center p-20">
            <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '20px' }}>{bpm} BPM</div>
            <input type="range" min="40" max="240" value={bpm} onChange={(e) => setBpm(e.target.value)} className="w-full mb-20" />
            <button className="btn-primary w-full" onClick={() => setIsPlaying(!isPlaying)}>{isPlaying ? 'Stop' : 'Start'}</button>
        </div>
    );
};

const ReactionTimeTool = () => {
    const [state, setState] = useState('idle'); // idle, waiting, click, result
    const [time, setTime] = useState(null);
    const timerRef = useRef(null);
    const startTimeRef = useRef(null);

    const startTest = () => {
        setState('waiting');
        const delay = 2000 + Math.random() * 3000;
        timerRef.current = setTimeout(() => {
            setState('click');
            startTimeRef.current = Date.now();
        }, delay);
    };

    const handleClick = () => {
        if (state === 'waiting') {
            clearTimeout(timerRef.current);
            setState('idle');
            alert('Too early!');
        } else if (state === 'click') {
            const reactionTime = Date.now() - startTimeRef.current;
            setTime(reactionTime);
            setState('result');
        }
    };

    return (
        <div onClick={handleClick} style={{
            height: '250px',
            background: state === 'waiting' ? '#ef4444' : (state === 'click' ? '#10b981' : 'var(--surface)'),
        }} className="flex-center p-20 ruler-container">
            {state === 'idle' && <button className="btn-primary" onClick={(e) => { e.stopPropagation(); startTest(); }}>Start Test</button>}
            {state === 'waiting' && <h2 style={{ color: 'white' }}>Wait for Green...</h2>}
            {state === 'click' && <h2 style={{ color: 'white' }}>CLICK NOW!</h2>}
            {state === 'result' && (
                <div className="text-center">
                    <h2>{time} ms</h2>
                    <button className="pill" onClick={(e) => { e.stopPropagation(); startTest(); }}>Try Again</button>
                </div>
            )}
        </div>
    );
};

const TabataTimerTool = () => {
    const [cycles, setCycles] = useState(8);
    const [work, setWork] = useState(20);
    const [rest, setRest] = useState(10);
    const [timeLeft, setTimeLeft] = useState(work);
    const [currentCycle, setCurrentCycle] = useState(1);
    const [mode, setMode] = useState('Work'); // Work, Rest, Done
    const [isActive, setIsActive] = useState(false);
    const timerRef = useRef(null);

    useEffect(() => {
        if (isActive && timeLeft > 0) {
            timerRef.current = setInterval(() => setTimeLeft(t => t - 1), 1000);
        } else if (isActive && timeLeft === 0) {
            if (mode === 'Work') {
                setMode('Rest');
                setTimeLeft(rest);
            } else {
                if (currentCycle < cycles) {
                    setMode('Work');
                    setCurrentCycle(c => c + 1);
                    setTimeLeft(work);
                } else {
                    setMode('Done');
                    setIsActive(false);
                }
            }
        }
        return () => clearInterval(timerRef.current);
    }, [isActive, timeLeft, mode, currentCycle, cycles, work, rest]);

    const reset = () => {
        setIsActive(false);
        setMode('Work');
        setCurrentCycle(1);
        setTimeLeft(work);
    };

    return (
        <div className="text-center p-20">
            <div className="opacity-6">Cycle {currentCycle}/{cycles}</div>
            <div style={{ fontSize: '4rem', fontWeight: 'bold', color: mode === 'Work' ? '#ef4444' : '#10b981' }}>{mode}</div>
            <div style={{ fontSize: '5rem', fontFamily: 'monospace' }}>{timeLeft}s</div>
            <div className="flex-gap mt-20">
                <button className="btn-primary" style={{ flex: 1 }} onClick={() => setIsActive(!isActive)}>{isActive ? 'Pause' : 'Start'}</button>
                <button className="pill" style={{ flex: 1 }} onClick={reset}>Reset</button>
            </div>
            {!isActive && mode === 'Work' && currentCycle === 1 && (
                <div className="mt-20" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '5px' }}>
                    <div>
                        <label style={{ fontSize: '0.7rem' }}>Cycles</label>
                        <input type="number" value={cycles} onChange={e => setCycles(parseInt(e.target.value))} className="w-full" />
                    </div>
                    <div>
                        <label style={{ fontSize: '0.7rem' }}>Work (s)</label>
                        <input type="number" value={work} onChange={e => { setWork(parseInt(e.target.value)); setTimeLeft(parseInt(e.target.value)); }} className="w-full" />
                    </div>
                    <div>
                        <label style={{ fontSize: '0.7rem' }}>Rest (s)</label>
                        <input type="number" value={rest} onChange={e => setRest(parseInt(e.target.value))} className="w-full" />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Measurements;
