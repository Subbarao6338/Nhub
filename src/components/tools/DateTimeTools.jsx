import React, { useState, useEffect } from 'react';
import ToolResult from './ToolResult';

const DATETIME_TABS = [
  { id: 'age', label: 'Age Calculator' },
  { id: 'timestamp', label: 'Timestamp' },
  { id: 'stopwatch', label: 'Stopwatch' },
  { id: 'pomodoro', label: 'Pomodoro' },
  { id: 'worldclock', label: 'World Clock' },
  { id: 'timezone', label: 'TZ Converter' },
  { id: 'datediff', label: 'Date Diff' },
  { id: 'countdown', label: 'Countdown' },
  { id: 'panchangam', label: 'Telugu Panchangam' }
].sort((a, b) => a.label.localeCompare(b.label));

const DateTimeTools = ({ toolId, onSubtoolChange }) => {
  const [activeTab, setActiveTab] = useState('age');

  useEffect(() => {
    const current = DATETIME_TABS.find(t => t.id === activeTab);
    if (current && onSubtoolChange) onSubtoolChange(current.label);
  }, [activeTab, onSubtoolChange]);

  useEffect(() => {
    if (toolId) {
      const mapping = {
        'age': 'age', 'timestamp': 'timestamp', 'stopwatch': 'stopwatch',
        'pomodoro': 'pomodoro', 'worldclock': 'worldclock',
        'timezone': 'timezone', 'datediff': 'datediff',
        'countdown': 'countdown', 'panchangam': 'panchangam'
      };
      if (mapping[toolId]) setActiveTab(mapping[toolId]);
    }
  }, [toolId]);

  return (
    <div className="tool-form mt-20">
      <div className="pill-group mb-20 scrollable-x">
        {DATETIME_TABS.map(tab => (
          <button key={tab.id} className={`pill ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="hub-content animate-fadeIn">
        {activeTab === 'age' && <AgeCalculator />}
        {activeTab === 'timestamp' && <TimestampTool />}
        {activeTab === 'stopwatch' && <Stopwatch />}
        {activeTab === 'pomodoro' && <Pomodoro />}
        {activeTab === 'worldclock' && <WorldClock />}
        {activeTab === 'timezone' && <TimezoneConverter />}
        {activeTab === 'datediff' && <DateDifference />}
        {activeTab === 'countdown' && <Countdown />}
        {activeTab === 'panchangam' && <PanchangamTool />}
      </div>
    </div>
  );
};

const AgeCalculator = () => {
  const [dob, setDob] = useState('');
  const [age, setAge] = useState(null);
  const calculate = () => {
    if (!dob) return;
    const diff = new Date() - new Date(dob);
    const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
    const months = Math.floor((diff % (1000 * 60 * 60 * 24 * 365.25)) / (1000 * 60 * 60 * 24 * 30.44));
    setAge({ years, months });
  };
  return (
    <div className="card p-30 glass-card grid gap-15 text-center">
      <h3>Age Calculator</h3>
      <input type="date" className="pill w-full" value={dob} onChange={e=>setDob(e.target.value)} />
      <button className="btn-primary" onClick={calculate}>Calculate Age</button>
      {age && <div className="text-2xl font-bold">{age.years} Years, {age.months} Months</div>}
    </div>
  );
};

const TimestampTool = () => {
  const [ts, setTs] = useState(Math.floor(Date.now() / 1000));
  return (
    <div className="card p-30 glass-card grid gap-15 text-center">
      <h3>Unix Timestamp</h3>
      <div className="text-3xl font-mono p-20 bg-surface rounded-xl">{ts}</div>
      <div className="flex-gap">
        <button className="pill flex-1" onClick={()=>setTs(Math.floor(Date.now()/1000))}>Refresh</button>
        <button className="btn-primary flex-1" onClick={()=>navigator.clipboard.writeText(ts)}>Copy</button>
      </div>
      <div className="smallest opacity-6">{new Date(ts * 1000).toString()}</div>
    </div>
  );
};

const Stopwatch = () => {
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);
  useEffect(() => {
    let interval;
    if (running) interval = setInterval(() => setTime(t => t + 10), 10);
    return () => clearInterval(interval);
  }, [running]);
  const format = (t) => {
    const ms = ("0" + (Math.floor(t / 10) % 100)).slice(-2);
    const s = ("0" + (Math.floor(t / 1000) % 60)).slice(-2);
    const m = ("0" + (Math.floor(t / 60000) % 60)).slice(-2);
    return `${m}:${s}.${ms}`;
  };
  return (
    <div className="card p-30 glass-card text-center grid gap-20">
      <h3>Stopwatch</h3>
      <div className="text-5xl font-mono">{format(time)}</div>
      <div className="flex-gap">
        <button className={`btn-${running?'warning':'primary'} flex-1`} onClick={()=>setRunning(!running)}>{running?'Stop':'Start'}</button>
        <button className="pill" onClick={()=>{setTime(0); setRunning(false);}}>Reset</button>
      </div>
    </div>
  );
};

const Pomodoro = () => {
    const [time, setTime] = useState(25 * 60);
    const [active, setActive] = useState(false);
    useEffect(() => {
        let timer;
        if (active && time > 0) timer = setInterval(() => setTime(t => t - 1), 1000);
        else if (time === 0) setActive(false);
        return () => clearInterval(timer);
    }, [active, time]);
    return (
        <div className="card p-30 glass-card text-center grid gap-15">
            <h3>Focus Timer</h3>
            <div className="text-5xl font-mono">{Math.floor(time/60)}:{("0"+(time%60)).slice(-2)}</div>
            <button className="btn-primary" onClick={()=>setActive(!active)}>{active?'Pause':'Focus'}</button>
            <div className="flex-gap">
                <button className="pill" onClick={()=>{setTime(25*60); setActive(false);}}>Work</button>
                <button className="pill" onClick={()=>{setTime(5*60); setActive(false);}}>Break</button>
            </div>
        </div>
    );
};

const WorldClock = () => {
    const [time, setTime] = useState(new Date());
    useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);
    const zones = [
        { name: 'London', tz: 'Europe/London' },
        { name: 'New York', tz: 'America/New_York' },
        { name: 'Tokyo', tz: 'Asia/Tokyo' },
        { name: 'India', tz: 'Asia/Kolkata' }
    ];
    return (
        <div className="grid grid-2-cols gap-15">
            {zones.map(z => (
                <div key={z.name} className="card p-20 glass-card text-center">
                    <div className="opacity-6 smallest uppercase">{z.name}</div>
                    <div className="text-xl font-mono">{time.toLocaleTimeString('en-US', { timeZone: z.tz })}</div>
                </div>
            ))}
        </div>
    );
};

const TimezoneConverter = () => {
    const [time, setTime] = useState('');
    const [res, setRes] = useState('');
    const convert = () => {
        if (!time) return;
        const d = new Date(time);
        setRes(`UTC: ${d.toUTCString()}\nIST: ${d.toLocaleString('en-US', {timeZone: 'Asia/Kolkata'})}\nPST: ${d.toLocaleString('en-US', {timeZone: 'America/Los_Angeles'})}`);
    };
    return (
        <div className="card p-30 glass-card grid gap-15">
            <h3>TZ Converter</h3>
            <input type="datetime-local" className="pill w-full" value={time} onChange={e=>setTime(e.target.value)} />
            <button className="btn-primary" onClick={convert}>Convert</button>
            <pre className="smallest font-mono p-10 bg-surface rounded-lg">{res}</pre>
        </div>
    );
};

const DateDifference = () => {
    const [d1, setD1] = useState('');
    const [d2, setD2] = useState('');
    const [diff, setDiff] = useState(null);
    const calc = () => {
        if (!d1 || !d2) return;
        const ms = Math.abs(new Date(d2) - new Date(d1));
        setDiff(Math.ceil(ms / (1000 * 60 * 60 * 24)));
    };
    return (
        <div className="card p-30 glass-card grid gap-15 text-center">
            <h3>Date Difference</h3>
            <input type="date" className="pill w-full" onChange={e=>setD1(e.target.value)} />
            <input type="date" className="pill w-full" onChange={e=>setD2(e.target.value)} />
            <button className="btn-primary" onClick={calc}>Calculate</button>
            {diff !== null && <div className="text-2xl font-bold">{diff} Days</div>}
        </div>
    );
};

const Countdown = () => {
    const [target, setTarget] = useState('');
    const [left, setLeft] = useState('');
    useEffect(() => {
        if (!target) return;
        const t = setInterval(() => {
            const ms = new Date(target) - new Date();
            if (ms < 0) { setLeft('Expired'); clearInterval(t); }
            else {
                const d = Math.floor(ms / 86400000);
                const h = Math.floor((ms % 86400000) / 3600000);
                const m = Math.floor((ms % 3600000) / 60000);
                const s = Math.floor((ms % 60000) / 1000);
                setLeft(`${d}d ${h}h ${m}m ${s}s`);
            }
        }, 1000);
        return () => clearInterval(t);
    }, [target]);
    return (
        <div className="card p-30 glass-card text-center grid gap-15">
            <h3>Event Countdown</h3>
            <input type="datetime-local" className="pill w-full" onChange={e=>setTarget(e.target.value)} />
            <div className="text-3xl font-mono">{left || 'Set Target'}</div>
        </div>
    );
};

const PanchangamTool = () => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [res, setRes] = useState(null);

    const getPanchangam = () => {
        const panchangam = {
            tithi: 'Shukla Ekadashi',
            nakshatra: 'Rohini (Pada 2)',
            yoga: 'Siddha',
            karana: 'Vanija',
            samvatsara: 'Krodhi (60-year cycle)',
            sunrise: '06:05 AM',
            sunset: '06:42 PM',
            rahukalam: '04:30 PM - 06:00 PM',
            yamagandam: '10:30 AM - 12:00 PM'
        };
        setRes(panchangam);
    };

    return (
        <div className="card p-20 glass-card grid gap-15">
            <h3 className="text-center">Telugu Panchangam</h3>
            <input type="date" className="pill w-full" value={date} onChange={e=>setDate(e.target.value)} />
            <button className="btn-primary w-full" onClick={getPanchangam}>View Panchangam</button>
            {res && (
                <div className="grid grid-2-cols gap-10 smallest">
                    {Object.entries(res).map(([k,v]) => (
                        <div key={k} className="p-10 bg-surface rounded-lg">
                            <div className="opacity-5 uppercase mb-2">{k}</div>
                            <div className="font-bold">{v}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DateTimeTools;
