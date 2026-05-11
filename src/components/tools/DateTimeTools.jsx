import React, { useState, useEffect } from 'react';

const DateTimeTools = ({ toolId, onResultChange }) => {
  const [activeTab, setActiveTab] = useState('stopwatch');

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
        'date-diff': 'datediff'
      };
      if (mapping[toolId]) setActiveTab(mapping[toolId]);
    }
  }, [toolId]);

  const tabs = [
    { id: 'age', label: 'Age' },
    { id: 'timestamp', label: 'Timestamp' },
    { id: 'stopwatch', label: 'Stopwatch' },
    { id: 'pomodoro', label: 'Pomodoro' },
    { id: 'worldclock', label: 'World Clock' },
    { id: 'timezone', label: 'Timezone' },
    { id: 'panchangam', label: 'Panchangam' },
    { id: 'datediff', label: 'Date Diff' }
  ].sort((a, b) => a.label.localeCompare(b.label));

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

      {activeTab === 'age' && <AgeTool onResultChange={onResultChange} />}
      {activeTab === 'stopwatch' && <StopwatchTool onResultChange={onResultChange} />}
      {['timestamp', 'pomodoro', 'worldclock', 'timezone', 'panchangam', 'datediff'].includes(activeTab) && (
          <div className="text-center p-20 card opacity-6">
              <span className="material-icons mb-10" style={{fontSize: '2rem'}}>schedule</span>
              <div>This date & time tool is being integrated.</div>
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
