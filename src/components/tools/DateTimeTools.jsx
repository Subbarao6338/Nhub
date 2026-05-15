import React, { useState, useEffect, useMemo } from 'react';

const DateTimeTools = ({ toolId, onResultChange, onSubtoolChange }) => {
  const tabs = [
    { id: 'stopwatch', label: 'Stopwatch', icon: 'timer' },
    { id: 'pomodoro', label: 'Pomodoro', icon: 'hourglass_empty' },
    { id: 'worldclock', label: 'World Clock', icon: 'public' },
    { id: 'age', label: 'Age Calc', icon: 'cake' },
    { id: 'timestamp', label: 'Timestamp', icon: 'code' },
    { id: 'timezone', label: 'Timezone', icon: 'schedule' },
    { id: 'panchangam', label: 'Panchangam', icon: 'event_note' },
    { id: 'datediff', label: 'Date Diff', icon: 'date_range' },
    { id: 'countdown', label: 'Countdown', icon: 'alarm' }
  ].sort((a, b) => a.label.localeCompare(b.label));

  const [activeTab, setActiveTab] = useState('stopwatch');

  useEffect(() => {
    const current = tabs.find(t => t.id === activeTab);
    if (current && onSubtoolChange) onSubtoolChange(current.label);
  }, [activeTab]);

  useEffect(() => {
    if (toolId) {
      const mapping = {
        'age-calculator': 'age', 'timestamp-conv': 'timestamp', 'stopwatch': 'stopwatch',
        'pomodoro-timer': 'pomodoro', 'world-clock': 'worldclock', 'timezone-conv': 'timezone',
        'panchangam': 'panchangam', 'date-diff': 'datediff', 'countdown': 'countdown', 'time-main': 'stopwatch'
      };
      if (mapping[toolId]) setActiveTab(mapping[toolId]);
    }
  }, [toolId]);

  return (
    <div className="tool-form">
      <div className="pill-group mb-20 scrollable-x" style={{justifyContent: 'center'}}>
        {tabs.map(tab => (
          <button key={tab.id} className={`pill ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
            <span className="material-icons" style={{fontSize:'1.1rem'}}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="hub-content animate-fadeIn">
          {activeTab === 'stopwatch' && <StopwatchTool onResultChange={onResultChange} />}
          {activeTab === 'pomodoro' && <PomodoroTool onResultChange={onResultChange} />}
          {activeTab === 'worldclock' && <WorldClockTool onResultChange={onResultChange} />}
          {activeTab === 'age' && <AgeTool onResultChange={onResultChange} />}
          {activeTab === 'timestamp' && <TimestampTool onResultChange={onResultChange} />}
          {activeTab === 'timezone' && <TimezoneTool onResultChange={onResultChange} />}
          {activeTab === 'panchangam' && <PanchangamTool onResultChange={onResultChange} />}
          {activeTab === 'datediff' && <DateDiffTool onResultChange={onResultChange} />}
          {activeTab === 'countdown' && <CountdownTool onResultChange={onResultChange} />}
      </div>
    </div>
  );
};

const StopwatchTool = () => {
    const [ms, setMs] = useState(0);
    const [active, setActive] = useState(false);
    useEffect(() => {
        let it = null;
        if(active) it = setInterval(() => setMs(m => m + 10), 10);
        return () => clearInterval(it);
    }, [active]);
    const f = (t) => {
        const s = Math.floor(t/1000), m = Math.floor(s/60);
        return `${m}:${(s%60).toString().padStart(2,'0')}.${(t%1000).toString().slice(0,2)}`;
    };
    return (
        <div className="card p-30 text-center glass-card">
            <div style={{fontSize: '5rem', fontFamily: 'monospace', fontWeight: 800}} className="mb-20 color-primary">{f(ms)}</div>
            <div className="flex-gap">
                <button className="btn-primary flex-1 h2" onClick={()=>setActive(!active)}>{active?'Pause':'Start'}</button>
                <button className="pill flex-1 h2" onClick={()=>{setActive(false); setMs(0);}}>Reset</button>
            </div>
        </div>
    );
};

const PomodoroTool = () => {
    const [sec, setSec] = useState(25 * 60);
    const [active, setActive] = useState(false);
    useEffect(() => {
        let it = null;
        if(active && sec > 0) it = setInterval(() => setSec(s => s - 1), 1000);
        else if(sec === 0) { setActive(false); if(navigator.vibrate) navigator.vibrate([200, 100, 200]); }
        return () => clearInterval(it);
    }, [active, sec]);
    return (
        <div className="card p-30 text-center glass-card">
            <div style={{fontSize: '5rem', fontWeight: 800}} className="mb-20 color-primary">{Math.floor(sec/60)}:{(sec%60).toString().padStart(2,'0')}</div>
            <div className="flex-gap">
                <button className="btn-primary flex-1 h2" onClick={()=>setActive(!active)}>{active?'Pause':'Start'}</button>
                <button className="pill h2" onClick={()=>{setActive(false); setSec(25*60);}}>Reset</button>
            </div>
        </div>
    );
};

const TimestampTool = ({ onResultChange }) => {
    const [ts, setTs] = useState(Math.floor(Date.now()/1000).toString());
    const date = useMemo(() => new Date(parseInt(ts) * 1000).toLocaleString(), [ts]);
    useEffect(() => onResultChange({ text: `TS: ${ts}\nDate: ${date}`, filename: 'timestamp.txt' }), [ts, date]);
    return (
        <div className="card p-30 text-center glass-card">
            <input className="pill h2 text-center w-full mb-20" value={ts} onChange={e=>setTs(e.target.value)} placeholder="Unix Timestamp" />
            <div className="tool-result h2 color-primary font-bold">{date}</div>
            <button className="pill mt-15" onClick={()=>setTs(Math.floor(Date.now()/1000).toString())}>Current Time</button>
        </div>
    );
};

const AgeTool = ({ onResultChange }) => {
    const [dob, setDob] = useState('');
    const [age, setAge] = useState(null);
    const calc = (val) => {
        setDob(val); if(!val) return;
        const b = new Date(val), n = new Date();
        let y = n.getFullYear() - b.getFullYear();
        let m = n.getMonth() - b.getMonth();
        let d = n.getDate() - b.getDate();
        if (d < 0) { m--; d += new Date(n.getFullYear(), n.getMonth(), 0).getDate(); }
        if (m < 0) { y--; m += 12; }
        setAge({ y, m, d });
        onResultChange({ text: `Age: ${y} years, ${m} months, ${d} days`, filename: 'age.txt' });
    };
    return (
        <div className="card p-30 text-center glass-card">
            <input type="date" className="pill w-full mb-20" value={dob} onChange={e=>calc(e.target.value)} />
            {age && <div className="tool-result h1 font-bold color-primary">{age.y} <span className="text-small opacity-6">Years Old</span></div>}
        </div>
    );
};

const WorldClockTool = () => {
    const zones = ['UTC', 'America/New_York', 'Europe/London', 'Asia/Tokyo', 'Asia/Kolkata'];
    const [time, setTime] = useState(new Date());
    useEffect(() => { const it = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(it); }, []);
    return (
        <div className="grid grid-2-cols gap-15">
            {zones.map(z => (
                <div key={z} className="card p-15 text-center glass-card">
                    <div className="opacity-6 smallest">{z.split('/').pop().replace('_', ' ')}</div>
                    <div className="font-bold h2">{time.toLocaleTimeString('en-US', { timeZone: z, hour12: false })}</div>
                </div>
            ))}
        </div>
    );
};

const TimezoneTool = ({ onResultChange }) => {
    const [time, setTime] = useState('12:00');
    const [zone, setZone] = useState('America/New_York');
    const res = useMemo(() => {
        const d = new Date(); const [h, m] = time.split(':'); d.setHours(h); d.setMinutes(m);
        return d.toLocaleTimeString('en-US', { timeZone: zone, hour12: false });
    }, [time, zone]);
    useEffect(() => onResultChange({ text: `Converted: ${res} (${zone})` }), [res]);
    return (
        <div className="card p-25 grid gap-15 glass-card text-center">
            <div className="flex-gap"><input type="time" className="pill flex-1" value={time} onChange={e=>setTime(e.target.value)} /><select className="pill flex-1" value={zone} onChange={e=>setZone(e.target.value)}><option value="UTC">UTC</option><option value="America/New_York">NY</option><option value="Asia/Tokyo">Tokyo</option></select></div>
            <div className="tool-result h1 font-bold color-primary">{res}</div>
        </div>
    );
};

const DateDiffTool = ({ onResultChange }) => {
    const [d1, setD1] = useState('');
    const [d2, setD2] = useState('');
    const diff = useMemo(() => {
        if(!d1 || !d2) return null;
        const days = Math.floor(Math.abs(new Date(d2) - new Date(d1)) / (1000*60*60*24));
        return days;
    }, [d1, d2]);
    useEffect(() => { if(diff !== null) onResultChange({ text: `Difference: ${diff} days` }); }, [diff]);
    return (
        <div className="card p-25 grid gap-15 glass-card">
            <input type="date" className="pill" value={d1} onChange={e=>setD1(e.target.value)} />
            <input type="date" className="pill" value={d2} onChange={e=>setD2(e.target.value)} />
            {diff !== null && <div className="tool-result text-center h2"><b>{diff}</b> Days Difference</div>}
        </div>
    );
};

const CountdownTool = () => {
    const [target, setTarget] = useState('');
    const [timeLeft, setTimeLeft] = useState('');
    useEffect(() => {
        if(!target) return;
        const it = setInterval(() => {
            const d = new Date(target) - new Date();
            if(d <= 0) { setTimeLeft('Done!'); clearInterval(it); return; }
            const h = Math.floor(d / 3600000); const m = Math.floor((d%3600000)/60000); const s = Math.floor((d%60000)/1000);
            setTimeLeft(`${h}h ${m}m ${s}s`);
        }, 1000);
        return () => clearInterval(it);
    }, [target]);
    return (
        <div className="card p-30 text-center glass-card">
            <input type="datetime-local" className="pill w-full mb-20" value={target} onChange={e=>setTarget(e.target.value)} />
            <div className="h1 font-bold color-primary">{timeLeft || 'Set Target'}</div>
        </div>
    );
};

const PanchangamTool = ({ onResultChange }) => {
    const [name, setName] = useState('');
    const [res, setRes] = useState(null);
    const SAMVATSARAMS = ["Prabhava", "Vibhava", "Shukla", "Pramodoota", "Prajotpatti", "Angirasa", "Srimukha", "Bhava", "Yuva", "Dhatru"];
    const calc = () => {
        const rasis = ["Mesham", "Vrushabham", "Midhunam", "Karkatakam", "Simham", "Kanya", "Thula", "Vrushchikam", "Dhanassu", "Makaram", "Kumbham", "Meenam"];
        const r = rasis[Math.floor(Math.random() * rasis.length)];
        const s = SAMVATSARAMS[Math.floor(Math.random() * SAMVATSARAMS.length)];
        setRes({ samvatsaram: s, rasi: r, tithi: 'Shukla Padyami' });
        onResultChange({ text: `Panchangam for ${name}: Rasi: ${r}, Samvatsaram: ${s}`, filename: 'panchangam.txt' });
    };
    return (
        <div className="card p-20 glass-card text-center">
            <input className="pill w-full mb-15" value={name} onChange={e=>setName(e.target.value)} placeholder="Enter first name..." />
            <button className="btn-primary w-full" onClick={calc}>Calculate Vedic Details</button>
            {res && (
                <div className="tool-result mt-20 animate-fadeIn grid grid-2-cols gap-10">
                    <div className="card p-15 bg-surface text-center"><b>Samvatsaram</b><br/><span className="color-primary">{res.samvatsaram}</span></div>
                    <div className="card p-15 bg-surface text-center"><b>Raasi</b><br/><span className="color-primary">{res.rasi}</span></div>
                    <div className="card p-15 bg-surface text-center" style={{gridColumn:'span 2'}}><b>Thidhi</b><br/><span className="color-primary">{res.tithi}</span></div>
                </div>
            )}
        </div>
    );
};

export default DateTimeTools;
