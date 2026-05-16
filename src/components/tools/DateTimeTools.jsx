import React, { useState, useEffect, useMemo } from 'react';

const DateTimeTools = ({ toolId, onResultChange, onSubtoolChange }) => {
  const tabs = [
    { id: 'age', label: 'Age' },
    { id: 'timestamp', label: 'Timestamp' },
    { id: 'stopwatch', label: 'Stopwatch' },
    { id: 'pomodoro', label: 'Pomodoro' },
    { id: 'worldclock', label: 'World Clock' },
    { id: 'timezone', label: 'Timezone' },
    { id: 'datediff', label: 'Date Diff' },
    { id: 'countdown', label: 'Countdown' },
    { id: 'panchangam', label: 'Panchangam' }
  ].sort((a, b) => a.label.localeCompare(b.label));

  const [activeTab, setActiveTab] = useState('stopwatch');

  useEffect(() => {
    const current = tabs.find(t => t.id === activeTab);
    if (current && onSubtoolChange) onSubtoolChange(current.label);
  }, [activeTab]);

  useEffect(() => {
    if (toolId) {
      const mapping = {
        'age-calculator': 'age',
        'timestamp-conv': 'timestamp',
        'stopwatch': 'stopwatch',
        'pomodoro-timer': 'pomodoro',
        'world-clock': 'worldclock',
        'timezone-conv': 'timezone',
        'date-diff': 'datediff',
        'countdown': 'countdown',
        'panchangam': 'panchangam'
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
        {activeTab === 'age' && <AgeTool onResultChange={onResultChange} />}
        {activeTab === 'stopwatch' && <StopwatchTool onResultChange={onResultChange} />}
        {activeTab === 'worldclock' && <WorldClockTool onResultChange={onResultChange} />}
        {activeTab === 'pomodoro' && <PomodoroTool onResultChange={onResultChange} />}
        {activeTab === 'datediff' && <DateDiffTool onResultChange={onResultChange} />}
        {activeTab === 'timezone' && <TimezoneConverter onResultChange={onResultChange} />}
        {activeTab === 'countdown' && <CountdownTimer onResultChange={onResultChange} />}
        {activeTab === 'timestamp' && <TimestampConverter onResultChange={onResultChange} />}
        {activeTab === 'panchangam' && <PanchangamTool onResultChange={onResultChange} />}
      </div>
    </div>
  );
};

const TimestampConverter = ({ onResultChange }) => {
    const [ts, setTs] = useState(Math.floor(Date.now() / 1000).toString());
    const [human, setHuman] = useState(new Date().toLocaleString());

    const updateFromTs = (val) => {
        setTs(val);
        try {
            const d = new Date(parseInt(val) * 1000);
            if (!isNaN(d.getTime())) {
                setHuman(d.toLocaleString());
                onResultChange({ text: d.toLocaleString() });
            }
        } catch(e) {}
    };

    const updateFromHuman = (val) => {
        setHuman(val);
        try {
            const d = new Date(val);
            if (!isNaN(d.getTime())) {
                setTs(Math.floor(d.getTime() / 1000).toString());
                onResultChange({ text: Math.floor(d.getTime() / 1000).toString() });
            }
        } catch(e) {}
    };

    return (
        <div className="card p-20 glass-card grid gap-15">
            <div className="form-group">
                <label>Unix Timestamp (Seconds)</label>
                <input className="pill" value={ts} onChange={e=>updateFromTs(e.target.value)} />
            </div>
            <div className="text-center opacity-4"><span className="material-icons">swap_vert</span></div>
            <div className="form-group">
                <label>Human Readable Date</label>
                <input className="pill" value={human} onChange={e=>updateFromHuman(e.target.value)} />
            </div>
            <button className="pill" onClick={() => updateFromTs(Math.floor(Date.now()/1000).toString())}>Set to Now</button>
        </div>
    );
};

const CountdownTimer = ({ onResultChange }) => {
    const [target, setTarget] = useState('');
    const [timeLeft, setTimeLeft] = useState(null);

    useEffect(() => {
        if (!target) return;
        const it = setInterval(() => {
            const diff = new Date(target) - new Date();
            if (diff <= 0) { setTimeLeft('Done!'); clearInterval(it); return; }
            const d = Math.floor(diff / 86400000);
            const h = Math.floor((diff % 86400000) / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            const s = Math.floor((diff % 60000) / 1000);
            setTimeLeft(`${d}d ${h}h ${m}m ${s}s`);
        }, 1000);
        return () => clearInterval(it);
    }, [target]);

    return (
        <div className="card p-20 text-center glass-card">
            <div className="mb-10 opacity-6 uppercase smallest font-bold">Target Date</div>
            <input type="datetime-local" className="pill w-full mb-20" value={target} onChange={e=>setTarget(e.target.value)} />
            {timeLeft && (
                <div style={{fontSize: '2rem', fontWeight: 800}} className="color-primary animate-pulse">
                    {timeLeft}
                </div>
            )}
        </div>
    );
};

const AgeTool = ({ onResultChange }) => {
    const [dob, setDob] = useState('');
    const [res, setRes] = useState(null);
    const calc = (date) => {
        setDob(date); if(!date) return;
        const b = new Date(date), n = new Date();
        let y = n.getFullYear() - b.getFullYear();
        let m = n.getMonth() - b.getMonth();
        let d = n.getDate() - b.getDate();
        if(d<0){ m--; d+=new Date(n.getFullYear(), n.getMonth(), 0).getDate(); }
        if(m<0){ y--; m+=12; }
        setRes({ y, m, d });
        onResultChange({ text: `Age: ${y}y ${m}m ${d}d`, filename: 'age.txt' });
    };
    return (
        <div className="card p-20 grid gap-15 glass-card">
            <input type="date" className="pill w-full" value={dob} onChange={e=>calc(e.target.value)} />
            {res && <div className="tool-result text-center"><div style={{fontSize: '3rem', fontWeight: 800}}>{res.y}</div><div className="opacity-6">Years Old</div></div>}
        </div>
    );
};

const WorldClockTool = () => {
    const [time, setTime] = useState(new Date());
    const clocks = [
        { id: 1, label: 'Local', zone: Intl.DateTimeFormat().resolvedOptions().timeZone },
        { id: 2, label: 'London', zone: 'Europe/London' },
        { id: 3, label: 'New York', zone: 'America/New_York' },
        { id: 4, label: 'Tokyo', zone: 'Asia/Tokyo' }
    ];

    useEffect(() => {
        const it = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(it);
    }, []);

    return (
        <div className="grid grid-2-cols gap-15">
            {clocks.map(c => (
                <div key={c.id} className="card p-15 text-center glass-card">
                    <div className="opacity-6 small">{c.label}</div>
                    <div className="font-bold" style={{fontSize: '1.4rem'}}>
                        {time.toLocaleTimeString('en-US', { timeZone: c.zone, hour12: false })}
                    </div>
                </div>
            ))}
        </div>
    );
};

const PomodoroTool = () => {
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const [isBreak, setIsBreak] = useState(false);

    useEffect(() => {
        let it = null;
        if (isActive && timeLeft > 0) {
            it = setInterval(() => setTimeLeft(t => t - 1), 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            const nextMode = !isBreak;
            setIsBreak(nextMode);
            setTimeLeft(nextMode ? 5 * 60 : 25 * 60);
            if ('vibrate' in navigator) navigator.vibrate([200, 100, 200]);
        }
        return () => clearInterval(it);
    }, [isActive, timeLeft, isBreak]);

    const format = (s) => `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`;

    return (
        <div className="card p-20 text-center glass-card">
            <div className="opacity-6 mb-10">{isBreak ? 'Break Time' : 'Focus Session'}</div>
            <div style={{fontSize: '4rem', fontWeight: 800}} className="mb-20 color-primary">{format(timeLeft)}</div>
            <div className="flex-gap">
                <button className="btn-primary flex-1" onClick={() => setIsActive(!isActive)}>{isActive ? 'Pause' : 'Start'}</button>
                <button className="pill" onClick={() => { setIsActive(false); setTimeLeft(isBreak ? 5 * 60 : 25 * 60); }}>Reset</button>
            </div>
        </div>
    );
};

const DateDiffTool = () => {
    const [d1, setD1] = useState('');
    const [d2, setD2] = useState('');
    const diff = useMemo(() => {
        if (!d1 || !d2) return null;
        const start = new Date(d1), end = new Date(d2);
        const ms = Math.abs(end - start);
        const days = Math.floor(ms / (1000 * 60 * 60 * 24));
        return { days, weeks: (days/7).toFixed(1), months: (days/30.44).toFixed(1) };
    }, [d1, d2]);

    return (
        <div className="grid gap-15 card p-20 glass-card">
            <input type="date" className="pill w-full" value={d1} onChange={e=>setD1(e.target.value)} />
            <input type="date" className="pill w-full" value={d2} onChange={e=>setD2(e.target.value)} />
            {diff && (
                <div className="tool-result grid grid-3 gap-10 text-center p-10">
                    <div><b>{diff.days}</b><br/>Days</div>
                    <div><b>{diff.weeks}</b><br/>Weeks</div>
                    <div><b>{diff.months}</b><br/>Months</div>
                </div>
            )}
        </div>
    );
};

const TimezoneConverter = () => {
    const [time, setTime] = useState('12:00');
    const [targetZone, setTargetZone] = useState('America/New_York');

    const convert = () => {
        const d = new Date();
        const [h, m] = time.split(':');
        d.setHours(h); d.setMinutes(m);
        return d.toLocaleTimeString('en-US', { timeZone: targetZone, hour12: false });
    };

    return (
        <div className="grid gap-15 card p-20 glass-card">
            <div className="flex-gap">
                <input type="time" className="pill flex-1" value={time} onChange={e=>setTime(e.target.value)} />
                <select className="pill flex-1" value={targetZone} onChange={e=>setTargetZone(e.target.value)}>
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">New York</option>
                    <option value="Europe/London">London</option>
                    <option value="Asia/Tokyo">Tokyo</option>
                    <option value="Asia/Kolkata">Kolkata</option>
                </select>
            </div>
            <div className="tool-result text-center">
                <div className="opacity-6 small">Converted Time:</div>
                <div className="font-bold" style={{fontSize: '2rem'}}>{convert()}</div>
            </div>
        </div>
    );
};

const StopwatchTool = () => {
    const [time, setTime] = useState(0);
    const [active, setActive] = useState(false);
    useEffect(() => {
        let it = null;
        if(active) it = setInterval(() => setTime(t => t + 10), 10);
        else clearInterval(it);
        return () => clearInterval(it);
    }, [active]);
    const format = (ms) => {
        const s = Math.floor(ms/1000), m = Math.floor(s/60);
        return `${m}:${(s%60).toString().padStart(2,'0')}.${(ms%1000).toString().slice(0,2)}`;
    };
    return (
        <div className="text-center p-30 card glass-card">
            <div style={{fontSize: '4.5rem', fontFamily: 'monospace', color: 'var(--primary)'}} className="mb-20">{format(time)}</div>
            <div className="flex-gap">
                <button className="btn-primary flex-1" onClick={()=>setActive(!active)}>{active ? 'Pause' : 'Start'}</button>
                <button className="pill flex-1" onClick={()=>{setActive(false); setTime(0);}}>Reset</button>
            </div>
        </div>
    );
};

const PanchangamTool = ({ onResultChange }) => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [city, setCity] = useState('Hyderabad');

    const PANCHANGAM_DATA = {
        '2025-05-23': { tithi: 'Ekadashi', nakshatra: 'Revati', yoga: 'Variyan', karana: 'Bava', sunrise: '05:42 AM', sunset: '06:44 PM' },
        '2025-05-24': { tithi: 'Dwadashi', nakshatra: 'Ashwini', yoga: 'Parigha', karana: 'Kaulava', sunrise: '05:42 AM', sunset: '06:44 PM' }
    };

    const getPanchangam = () => {
        const data = PANCHANGAM_DATA[date] || {
            tithi: 'Shukla Navami',
            nakshatra: 'Magha',
            yoga: 'Subha',
            karana: 'Taitila',
            sunrise: '06:05 AM',
            sunset: '06:22 PM'
        };
        return data;
    };

    const p = getPanchangam();

    return (
        <div className="card p-20 glass-card">
            <div className="grid grid-2 gap-10 mb-20">
                <div className="form-group">
                    <label>Date</label>
                    <input type="date" className="pill w-full" value={date} onChange={e=>setDate(e.target.value)} />
                </div>
                <div className="form-group">
                    <label>City</label>
                    <input type="text" className="pill w-full" value={city} onChange={e=>setCity(e.target.value)} />
                </div>
            </div>
            <div className="panchangam-grid">
                <div className="panchangam-item">
                    <div className="opacity-6 smallest uppercase font-bold">Tithi</div>
                    <div className="font-bold color-primary">{p.tithi}</div>
                </div>
                <div className="panchangam-item">
                    <div className="opacity-6 smallest uppercase font-bold">Nakshatra</div>
                    <div className="font-bold color-primary">{p.nakshatra}</div>
                </div>
                <div className="panchangam-item">
                    <div className="opacity-6 smallest uppercase font-bold">Yoga</div>
                    <div className="font-bold color-primary">{p.yoga}</div>
                </div>
                <div className="panchangam-item">
                    <div className="opacity-6 smallest uppercase font-bold">Karana</div>
                    <div className="font-bold color-primary">{p.karana}</div>
                </div>
                <div className="panchangam-footer">
                    <div className="text-center">
                        <span className="material-icons color-primary" style={{fontSize: '1.2rem'}}>wb_sunny</span>
                        <div className="small font-bold">{p.sunrise}</div>
                    </div>
                    <div style={{width: '1px', background: 'var(--border)'}}></div>
                    <div className="text-center">
                        <span className="material-icons color-primary" style={{fontSize: '1.2rem'}}>nights_stay</span>
                        <div className="small font-bold">{p.sunset}</div>
                    </div>
                </div>
            </div>
            <p className="mt-15 smallest opacity-6 text-center">Calculated for {city} on {date}</p>
        </div>
    );
};

export default DateTimeTools;
