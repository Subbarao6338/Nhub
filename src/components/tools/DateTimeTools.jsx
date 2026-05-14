import React, { useState, useEffect, useMemo } from 'react';

const DateTimeTools = ({ toolId, onResultChange, onSubtoolChange }) => {
  const tabs = [
    { id: 'age', label: 'Age' },
    { id: 'timestamp', label: 'Timestamp' },
    { id: 'stopwatch', label: 'Stopwatch' },
    { id: 'pomodoro', label: 'Pomodoro' },
    { id: 'worldclock', label: 'World Clock' },
    { id: 'timezone', label: 'Timezone' },
    { id: 'panchangam', label: 'Panchangam' },
    { id: 'datediff', label: 'Date Diff' },
    { id: 'countdown', label: 'Countdown' }
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
        'panchangam': 'panchangam',
        'date-diff': 'datediff',
        'countdown': 'countdown',
        'time-main': 'stopwatch'
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

      {activeTab === 'age' && <AgeTool onResultChange={onResultChange} />}
      {activeTab === 'stopwatch' && <StopwatchTool onResultChange={onResultChange} />}
      {activeTab === 'worldclock' && <WorldClockTool onResultChange={onResultChange} />}
      {activeTab === 'pomodoro' && <PomodoroTool onResultChange={onResultChange} />}
      {activeTab === 'datediff' && <DateDiffTool onResultChange={onResultChange} />}
      {activeTab === 'timezone' && <TimezoneConverter onResultChange={onResultChange} />}
      {activeTab === 'countdown' && <CountdownTimer onResultChange={onResultChange} />}
      {activeTab === 'panchangam' && <PanchangamTool onResultChange={onResultChange} />}
      {activeTab === 'timestamp' && <TimestampTool onResultChange={onResultChange} />}
    </div>
  );
};

const PanchangamTool = ({ onResultChange }) => {
    const [mode, setMode] = useState('datetime');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [time, setTime] = useState(new Date().toTimeString().split(' ')[0].substring(0, 5));
    const [lat, setLat] = useState('17.3850');
    const [lng, setLng] = useState('78.4867');
    const [tz, setTz] = useState('5.5');
    const [name, setName] = useState('');
    const [result, setResult] = useState(null);

    const SAMVATSARAMS = [
        "Prabhava", "Vibhava", "Shukla", "Pramodoota", "Prajotpatti", "Angirasa", "Srimukha", "Bhava", "Yuva", "Dhatru",
        "Eswara", "Bahudhanya", "Pramadhi", "Vikrama", "Vrisha", "Chitrabhanu", "Swabhannu", "Tarana", "Parthiva", "Vyaya",
        "Sarvajit", "Sarvadhari", "Virodhi", "Vikruti", "Khara", "Nandana", "Vijaya", "Jaya", "Manmadha", "Durmukhi",
        "Hevilambi", "Vilambi", "Vikari", "Sarvari", "Plava", "Subhakrutu", "Sobhakrutu", "Krodhi", "Viswavasu", "Parabhava",
        "Plavanga", "Keelaka", "Saumya", "Sadharana", "Virodhakrutu", "Paridhavi", "Pramadicha", "Ananda", "Rakshasa", "Anala",
        "Pingala", "Kalayukti", "Siddharti", "Raudri", "Durmati", "Dundubhi", "Rudhirodgari", "Raktakshi", "Krodhana", "Akshaya"
    ];

    const LUCKY_INFO = {
        "Mesham": { num: "1, 8", color: "Red", day: "Tuesday" },
        "Vrushabham": { num: "2, 7", color: "White, Pink", day: "Friday" },
        "Midhunam": { num: "3, 6", color: "Green, Yellow", day: "Wednesday" },
        "Karkatakam": { num: "4", color: "White, Silver", day: "Monday" },
        "Simham": { num: "5", color: "Gold, Orange", day: "Sunday" },
        "Kanya": { num: "3, 6", color: "Green", day: "Wednesday" },
        "Thula": { num: "2, 7", color: "White, Blue", day: "Friday" },
        "Vrushchikam": { num: "1, 8", color: "Red, Maroon", day: "Tuesday" },
        "Dhanassu": { num: "3, 5, 9", color: "Yellow", day: "Thursday" },
        "Makaram": { num: "4, 8", color: "Black, Dark Blue", day: "Saturday" },
        "Kumbham": { num: "8", color: "Blue", day: "Saturday" },
        "Meenam": { num: "3, 7, 9", color: "Yellow, Sea Green", day: "Thursday" }
    };

    const NAMA_RAASI = [
        { regex: /^[AEIL]/i, rasi: "Mesham", nak: "Aswini/Bharani" },
        { regex: /^[UV]/i, rasi: "Vrushabham", nak: "Krittika/Rohini" },
        { regex: /^[KCHGH]/i, rasi: "Midhunam", nak: "Mrigasira/Arudra" },
        { regex: /^[DH]/i, rasi: "Karkatakam", nak: "Punarvasu/Pushyami" },
        { regex: /^[MT]/i, rasi: "Simham", nak: "Makha/Pubba" },
        { regex: /^[PSHN]/i, rasi: "Kanya", nak: "Uttara/Hasta" },
        { regex: /^[RT]/i, rasi: "Thula", nak: "Chitra/Swati" },
        { regex: /^[NY]/i, rasi: "Vrushchikam", nak: "Anuradha/Jyeshta" },
        { regex: /^[B]/i, rasi: "Dhanassu", nak: "Moola/Poorvashada" },
        { regex: /^[JKH]/i, rasi: "Makaram", nak: "Uttarashada/Sravanam" },
        { regex: /^[GS]/i, rasi: "Kumbham", nak: "Dhanishta/Satabhisham" },
        { regex: /^[D]/i, rasi: "Meenam", nak: "Poorvabhadra/Uttarabhadra" }
    ];

    const getJulianDate = (dt) => (dt.getTime() / 86400000) - (dt.getTimezoneOffset() / 1440) + 2440587.5;
    const rev = (angle) => angle - Math.floor(angle / 360.0) * 360.0;

    const getSunLong = (jd) => {
        const d = jd - 2451543.5;
        const M = rev(356.0470 + 0.9856002585 * d);
        const w = 282.9404 + 4.70935e-5 * d;
        const e = 0.016709 - 1.151e-9 * d;
        const E = M + (180/Math.PI) * e * Math.sin(M * Math.PI/180) * (1 + e * Math.cos(M * Math.PI/180));
        const x = Math.cos(E * Math.PI/180) - e;
        const y = Math.sin(E * Math.PI/180) * Math.sqrt(1 - e*e);
        const v = Math.atan2(y, x) * 180/Math.PI;
        return rev(v + w);
    };

    const getMoonLong = (jd) => {
        const d = jd - 2451543.5;
        const N = rev(125.1228 - 0.0529538083 * d);
        const M = rev(115.3654 + 13.0649929509 * d);
        const a = 60.2666, e = 0.0549, i = 5.1454, w = rev(318.0634 + 0.1643573223 * d);
        let E = M + (180/Math.PI) * e * Math.sin(M * Math.PI/180);
        for(let j=0; j<3; j++) E = E - (E - (180/Math.PI) * e * Math.sin(E * Math.PI/180) - M) / (1 - e * Math.cos(E * Math.PI/180));
        const x = a * (Math.cos(E * Math.PI/180) - e), y = a * Math.sqrt(1 - e*e) * Math.sin(E * Math.PI/180);
        const v = Math.atan2(y, x) * 180/Math.PI;
        const xecl = Math.cos(N * Math.PI/180) * Math.cos((v+w) * Math.PI/180) - Math.sin(N * Math.PI/180) * Math.sin((v+w) * Math.PI/180) * Math.cos(i * Math.PI/180);
        const yecl = Math.sin(N * Math.PI/180) * Math.cos((v+w) * Math.PI/180) + Math.cos(N * Math.PI/180) * Math.sin((v+w) * Math.PI/180) * Math.cos(i * Math.PI/180);
        return rev(Math.atan2(yecl, xecl) * 180/Math.PI);
    };

    const calculate = () => {
        if (mode === 'name') {
            if (!name) return;
            const char = name.trim().charAt(0).toUpperCase();
            const match = NAMA_RAASI.find(m => m.regex.test(char)) || NAMA_RAASI[0];
            const res = {
                rasi: match.rasi,
                nakshatra: match.nak,
                samvatsaram: SAMVATSARAMS[((new Date().getFullYear() - 1987) % 60 + 60) % 60],
                lucky: LUCKY_INFO[match.rasi]
            };
            setResult(res);
            onResultChange({ text: `Panchangam for ${name}: ${res.rasi}, ${res.nakshatra}`, filename: 'panchangam.txt' });
            return;
        }

        const dt = new Date(`${date}T${time}`);
        const jdUT = getJulianDate(dt) - (parseFloat(tz) / 24.0);
        const sunL = getSunLong(jdUT), moonL = getMoonLong(jdUT), aya = 23.85 + 1.397 * ((jdUT - 2451545.0) / 36525);
        const nMoon = rev(moonL - aya);

        const tithis = ["Padyami", "Vidiya", "Tadiya", "Chavithi", "Panchami", "Shashti", "Saptami", "Ashtami", "Navami", "Dashami", "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Pournami", "Padyami (B)", "Vidiya (B)", "Tadiya (B)", "Chavithi (B)", "Panchami (B)", "Shashti (B)", "Saptami (B)", "Ashtami (B)", "Navami (B)", "Dashami (B)", "Ekadashi (B)", "Dwadashi (B)", "Trayodashi (B)", "Chaturdashi (B)", "Amavasya"];
        const naks = ["Aswini", "Bharani", "Krittika", "Rohini", "Mrigasira", "Arudra", "Punarvasu", "Pushyami", "Aslesha", "Makha", "Pubba", "Uttara", "Hasta", "Chitra", "Swati", "Visakha", "Anuradha", "Jyeshta", "Moola", "Poorvashada", "Uttarashada", "Sravanam", "Dhanishta", "Satabhisham", "Poorvabhadra", "Uttarabhadra", "Revati"];
        const rasis = ["Mesham", "Vrushabham", "Midhunam", "Karkatakam", "Simham", "Kanya", "Thula", "Vrushchikam", "Dhanassu", "Makaram", "Kumbham", "Meenam"];

        let diff = moonL - sunL; if (diff < 0) diff += 360;
        const rasiIdx = Math.floor(nMoon / 30);
        const res = {
            tithi: tithis[Math.floor(diff / 12)],
            nakshatra: naks[Math.floor(nMoon / (360/27))],
            pada: Math.floor((nMoon % (360/27)) / (360/108)) + 1,
            rasi: rasis[rasiIdx],
            samvatsaram: SAMVATSARAMS[((dt.getFullYear() - 1987) % 60 + 60) % 60],
            vara: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][dt.getDay()],
            lucky: LUCKY_INFO[rasis[rasiIdx]]
        };
        setResult(res);
        onResultChange({ text: `Panchangam: ${res.tithi}, ${res.nakshatra}, ${res.rasi}`, filename: 'panchangam.txt' });
    };

    return (
        <div className="card p-20">
            <div className="pill-group mb-20">
                <button className={`pill ${mode === 'datetime' ? 'active' : ''}`} onClick={() => {setMode('datetime'); setResult(null);}}>By DateTime</button>
                <button className={`pill ${mode === 'name' ? 'active' : ''}`} onClick={() => {setMode('name'); setResult(null);}}>By Name</button>
            </div>

            {mode === 'datetime' ? (
                <div className="grid gap-15">
                    <div className="grid grid-2-cols gap-10">
                        <input type="date" className="pill w-full" value={date} onChange={e=>setDate(e.target.value)} />
                        <input type="time" className="pill w-full" value={time} onChange={e=>setTime(e.target.value)} />
                    </div>
                    <div className="grid grid-2-cols gap-10">
                        <input type="text" className="pill w-full" placeholder="Lat (17.38)" value={lat} onChange={e=>setLat(e.target.value)} />
                        <input type="text" className="pill w-full" placeholder="Lng (78.48)" value={lng} onChange={e=>setLng(e.target.value)} />
                    </div>
                </div>
            ) : (
                <input type="text" className="pill w-full mb-15" placeholder="Enter first name..." value={name} onChange={e=>setName(e.target.value)} />
            )}

            <button className="btn-primary w-full mt-15" onClick={calculate}>Calculate Details</button>

            {result && (
                <div className="tool-result mt-20 animate-fadeIn">
                    <div className="text-center mb-15">
                        <div className="opacity-6 smallest uppercase font-bold">Telugu Samvatsaram</div>
                        <div className="h2 color-primary">{result.samvatsaram} Nama Samvatsaram</div>
                    </div>
                    <div className="grid grid-2-cols gap-10">
                        <div className="card p-10 text-center no-animation bg-surface">
                            <div className="smallest opacity-6">Raasi</div>
                            <div className="font-bold">{result.rasi}</div>
                        </div>
                        <div className="card p-10 text-center no-animation bg-surface">
                            <div className="smallest opacity-6">Nakshatram</div>
                            <div className="font-bold">{result.nakshatra} {result.pada ? `(${result.pada} Pada)` : ''}</div>
                        </div>
                        {result.tithi && (
                            <div className="card p-10 text-center no-animation bg-surface">
                                <div className="smallest opacity-6">Thidhi</div>
                                <div className="font-bold">{result.tithi}</div>
                            </div>
                        )}
                        {result.vara && (
                            <div className="card p-10 text-center no-animation bg-surface">
                                <div className="smallest opacity-6">Vaaram</div>
                                <div className="font-bold">{result.vara}</div>
                            </div>
                        )}
                    </div>
                    <div className="mt-15 p-15 card bg-primary-container no-animation">
                        <div className="smallest opacity-6 mb-10 font-bold uppercase">Personalized Lucky Details</div>
                        <div className="grid gap-5">
                            <div className="flex-between"><span>Lucky Numbers:</span> <span className="font-bold">{result.lucky.num}</span></div>
                            <div className="flex-between"><span>Lucky Colors:</span> <span className="font-bold">{result.lucky.color}</span></div>
                            <div className="flex-between"><span>Lucky Days:</span> <span className="font-bold">{result.lucky.day}</span></div>
                        </div>
                    </div>
                </div>
            )}
            <style dangerouslySetInnerHTML={{ __html: `
                .bg-surface { background: var(--bg); border: 1px solid var(--border); }
                .bg-primary-container { background: var(--primary); color: white; border-radius: 20px; }
                .bg-primary-container span { color: rgba(255,255,255,0.8); }
                .bg-primary-container .font-bold { color: white; }
                .flex-between { display: flex; justify-content: space-between; align-items: center; }
            `}} />
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
        <div className="card p-20 text-center">
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
        <div className="card p-15 grid gap-15">
            <input type="date" className="pill w-full" value={dob} onChange={e=>calc(e.target.value)} />
            {res && <div className="tool-result text-center"><div style={{fontSize: '3rem', fontWeight: 800}}>{res.y}</div><div className="opacity-6">Years Old</div></div>}
        </div>
    );
};

const WorldClockTool = () => {
    const [clocks, setClocks] = useState([
        { id: 1, label: 'Local', zone: Intl.DateTimeFormat().resolvedOptions().timeZone },
        { id: 2, label: 'London', zone: 'Europe/London' },
        { id: 3, label: 'New York', zone: 'America/New_York' },
        { id: 4, label: 'Tokyo', zone: 'Asia/Tokyo' }
    ]);
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const it = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(it);
    }, []);

    return (
        <div className="grid grid-2-cols gap-15">
            {clocks.map(c => (
                <div key={c.id} className="card p-15 text-center">
                    <div className="opacity-6 small">{c.label}</div>
                    <div className="font-bold" style={{fontSize: '1.4rem'}}>
                        {time.toLocaleTimeString('en-US', { timeZone: c.zone, hour12: false })}
                    </div>
                    <div className="opacity-5 smallest">{c.zone}</div>
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
        <div className="card p-20 text-center">
            <div className="opacity-6 mb-10">{isBreak ? 'Break Time' : 'Focus Session'}</div>
            <div style={{fontSize: '4rem', fontWeight: 800}} className="mb-20">{format(timeLeft)}</div>
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
        <div className="grid gap-15 card p-15">
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
        <div className="grid gap-15 card p-15">
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

const TimestampTool = ({ onResultChange }) => {
    const [ts, setTs] = useState(Math.floor(Date.now() / 1000));
    const [dateStr, setDateStr] = useState(new Date().toISOString());

    const toDate = () => {
        const d = new Date(ts * 1000);
        setDateStr(d.toLocaleString());
        onResultChange({ text: d.toLocaleString() });
    };

    const toTs = () => {
        const t = Math.floor(new Date(dateStr).getTime() / 1000);
        setTs(t);
        onResultChange({ text: t.toString() });
    };

    return (
        <div className="card p-20 grid gap-15">
            <div className="form-group">
                <label>Unix Timestamp (Seconds)</label>
                <div className="flex-gap">
                    <input className="pill flex-1" value={ts} onChange={e=>setTs(e.target.value)} />
                    <button className="btn-primary" onClick={toDate}>To Date</button>
                </div>
            </div>
            <div className="form-group">
                <label>Date String</label>
                <div className="flex-gap">
                    <input className="pill flex-1" value={dateStr} onChange={e=>setDateStr(e.target.value)} />
                    <button className="btn-primary" onClick={toTs}>To Timestamp</button>
                </div>
            </div>
            <button className="pill" onClick={()=>{setTs(Math.floor(Date.now()/1000)); setDateStr(new Date().toISOString());}}>Current Time</button>
        </div>
    );
};

const StopwatchTool = ({ onResultChange }) => {
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
        <div className="text-center p-20 card">
            <div style={{fontSize: '4rem', fontFamily: 'monospace'}} className="mb-20">{format(time)}</div>
            <div className="flex-gap">
                <button className="btn-primary flex-1" onClick={()=>setActive(!active)}>{active ? 'Pause' : 'Start'}</button>
                <button className="pill flex-1" onClick={()=>{setActive(false); setTime(0);}}>Reset</button>
            </div>
        </div>
    );
};

export default DateTimeTools;
