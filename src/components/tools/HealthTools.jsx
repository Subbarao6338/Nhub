import React, { useState, useEffect } from 'react';

const HealthTools = ({ onResultChange, toolId, onSubtoolChange }) => {
  const tabs = [
    { id: 'bmr', label: 'BMR' },
    { id: 'bmi', label: 'BMI' },
    { id: 'calories', label: 'Calories' },
    { id: 'macros', label: 'Macros' },
    { id: 'water', label: 'Water' },
    { id: 'sleep', label: 'Sleep' }
  ];

  const [activeTab, setActiveTab] = useState('bmr');

  useEffect(() => {
    const labels = {
      bmr: 'Basal Metabolic Rate',
      bmi: 'BMI Calculator',
      calories: 'Calorie Needs',
      macros: 'Macro Splitter',
      water: 'Water Tracker',
      sleep: 'Sleep Calculator'
    };
    if (onSubtoolChange) onSubtoolChange(labels[activeTab]);
  }, [activeTab]);

  useEffect(() => {
    if (toolId) {
      if (toolId === 'bmr-calc') setActiveTab('bmr');
      else if (toolId === 'bmi-calc') setActiveTab('bmi');
      else if (toolId === 'calorie-calc') setActiveTab('calories');
      else if (toolId === 'water-tracker') setActiveTab('water');
      else if (toolId === 'sleep-calc') setActiveTab('sleep');
      else if (toolId === 'macro-calc') setActiveTab('macros');
    }
  }, [toolId]);

  const isDeepLinked = !!toolId && tabs.some(t => t.id === toolId || toolId.includes(t.id));

  return (
    <div className="tool-form">
      {!isDeepLinked && (
          <div className="pill-group mb-20 scrollable-x">
            {tabs.map(t => (
                <button key={t.id} className={`pill ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>{t.label}</button>
            ))}
          </div>
      )}

      {activeTab === 'bmr' && <BmrTool onResultChange={onResultChange} />}
      {activeTab === 'bmi' && <BmiTool onResultChange={onResultChange} />}
      {activeTab === 'calories' && <CalorieTool onResultChange={onResultChange} />}
      {activeTab === 'macros' && <MacroTool onResultChange={onResultChange} />}
      {activeTab === 'water' && <WaterTracker onResultChange={onResultChange} />}
      {activeTab === 'sleep' && <SleepTool onResultChange={onResultChange} />}
    </div>
  );
};

const SleepTool = ({ onResultChange }) => {
    const [wakeTime, setWakeTime] = useState("07:00");
    const calculate = () => {
        const [h, m] = wakeTime.split(':').map(Number);
        const wakeDate = new Date();
        wakeDate.setHours(h, m, 0, 0);

        // 90 minute cycles
        const cycles = [6, 5, 4, 3]; // Cycles of sleep
        const bedtimes = cycles.map(c => {
            const d = new Date(wakeDate.getTime() - (c * 90 + 15) * 60000); // 15 mins to fall asleep
            return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        });

        onResultChange({ text: `Bedtimes for ${wakeTime} wake up: ${bedtimes.join(', ')}`, filename: 'sleep_schedule.txt' });
        return bedtimes;
    };

    const bedtimes = calculate();

    return (
        <div className="card p-20 text-center">
            <div className="form-group">
                <label>I want to wake up at:</label>
                <input type="time" className="pill" value={wakeTime} onChange={e=>setWakeTime(e.target.value)} />
            </div>
            <div className="tool-result">
                <p className="opacity-6 mb-10">To wake up refreshed, try to sleep at:</p>
                <div className="flex-center gap-10 flex-wrap">
                    {bedtimes.map(t => <span key={t} className="pill active">{t}</span>)}
                </div>
                <p className="smallest opacity-5 mt-10">Calculated for 90-min cycles + 15 min to fall asleep.</p>
            </div>
        </div>
    );
};

const MacroTool = ({ onResultChange }) => {
    const [calories, setCalories] = useState(2000);
    const [goal, setGoal] = useState('balanced');

    const calculate = () => {
        const ratios = {
            balanced: { p: 0.3, c: 0.4, f: 0.3 },
            lowcarb: { p: 0.4, c: 0.2, f: 0.4 },
            highprot: { p: 0.5, c: 0.3, f: 0.2 }
        };
        const r = ratios[goal];
        const p = (calories * r.p) / 4;
        const c = (calories * r.c) / 4;
        const f = (calories * r.f) / 9;

        const result = { p: p.toFixed(0), c: c.toFixed(0), f: f.toFixed(0) };
        onResultChange({ text: `Macros for ${calories}kcal (${goal}): P:${result.p}g, C:${result.c}g, F:${result.f}g`, filename: 'macros.txt' });
        return result;
    };

    const res = calculate();

    return (
        <div className="grid gap-15">
            <div className="form-group">
                <label>Daily Calories</label>
                <input type="number" className="pill" value={calories} onChange={e=>setCalories(e.target.value)} />
            </div>
            <div className="pill-group scrollable-x">
                {['balanced', 'lowcarb', 'highprot'].map(g => (
                    <button key={g} className={`pill ${goal === g ? 'active' : ''}`} onClick={()=>setGoal(g)}>{g.toUpperCase()}</button>
                ))}
            </div>
            <div className="grid grid-3 gap-10">
                <div className="card p-15 text-center">
                    <div className="opacity-6 smallest">Protein</div>
                    <div className="font-bold h2">{res.p}g</div>
                </div>
                <div className="card p-15 text-center">
                    <div className="opacity-6 smallest">Carbs</div>
                    <div className="font-bold h2">{res.c}g</div>
                </div>
                <div className="card p-15 text-center">
                    <div className="opacity-6 smallest">Fats</div>
                    <div className="font-bold h2">{res.f}g</div>
                </div>
            </div>
        </div>
    );
};

const WaterTracker = ({ onResultChange }) => {
    const [glasses, setGlasses] = useState(() => parseInt(localStorage.getItem('hub_water_glasses') || '0'));
    const goal = 8;

    useEffect(() => {
        localStorage.setItem('hub_water_glasses', glasses.toString());
        onResultChange({ text: `Water intake: ${glasses}/${goal} glasses` });
    }, [glasses]);

    return (
        <div className="card p-20 text-center">
            <div className="flex-center gap-10 mb-20 flex-wrap">
                {Array(goal).fill(0).map((_, i) => (
                    <span key={i} className="material-icons" style={{ color: i < glasses ? 'var(--blue)' : 'var(--border)', fontSize: '2rem' }}>
                        local_drink
                    </span>
                ))}
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800 }} className="mb-10">{glasses} / {goal}</div>
            <div className="flex-gap">
                <button className="btn-primary flex-1" onClick={() => setGlasses(g => Math.min(goal, g + 1))}>Add Glass</button>
                <button className="pill" onClick={() => setGlasses(0)}>Reset</button>
            </div>
        </div>
    );
};

const BmiTool = ({ onResultChange }) => {
    const [w, setW] = useState('');
    const [h, setH] = useState('');
    const [result, setResult] = useState(null);
    const calc = () => {
        const bmiVal = parseFloat(w) / ((parseFloat(h)/100)**2);
        setResult({ bmi: bmiVal.toFixed(1), weight: w, height: h });
        onResultChange({ text: `BMI: ${bmiVal.toFixed(1)}`, filename: 'bmi.txt' });
    };
    return (
        <div className="grid gap-15">
            <input type="number" placeholder="Weight (kg)" className="pill" value={w} onChange={e=>setW(e.target.value)} />
            <input type="number" placeholder="Height (cm)" className="pill" value={h} onChange={e=>setH(e.target.value)} />
            <button className="btn-primary" onClick={calc}>Calculate BMI</button>
            {result && (
                <div className="tool-result text-center">
                    <div style={{fontSize: '3rem', fontWeight: 800}}>{result.bmi}</div>
                    <div className="opacity-6">{result.bmi < 18.5 ? 'Underweight' : result.bmi < 25 ? 'Normal' : result.bmi < 30 ? 'Overweight' : 'Obese'}</div>
                </div>
            )}
        </div>
    );
};

const BmrTool = ({ onResultChange }) => {
  const [gender, setGender] = useState('male');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [bmr, setBmr] = useState(null);

  const calculate = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    const a = parseInt(age);
    if (isNaN(w) || isNaN(h) || isNaN(a)) return;

    let res;
    if (gender === 'male') {
      res = 10 * w + 6.25 * h - 5 * a + 5;
    } else {
      res = 10 * w + 6.25 * h - 5 * a - 161;
    }
    setBmr(res);
    onResultChange({ text: `BMR: ${res.toFixed(2)} kcal/day`, filename: 'bmr_result.txt' });
  };

  return (
    <div style={{ display: 'grid', gap: '15px' }}>
      <div className="pill-group scrollable-x">
        <button className={`pill ${gender === 'male' ? 'active' : ''}`} onClick={() => setGender('male')}>Male</button>
        <button className={`pill ${gender === 'female' ? 'active' : ''}`} onClick={() => setGender('female')}>Female</button>
      </div>
      <input type="number" placeholder="Weight (kg)" value={weight} onChange={e => setWeight(e.target.value)} className="pill w-full" />
      <input type="number" placeholder="Height (cm)" value={height} onChange={e => setHeight(e.target.value)} className="pill w-full" />
      <input type="number" placeholder="Age" value={age} onChange={e => setAge(e.target.value)} className="pill w-full" />
      <button className="btn-primary" onClick={calculate}>Calculate BMR</button>
      {bmr && (
        <div className="card text-center p-20">
          <div className="opacity-6" style={{ fontSize: '0.9rem' }}>Your Basal Metabolic Rate</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>{bmr.toFixed(0)}</div>
          <div className="opacity-6">kcal/day</div>
        </div>
      )}
    </div>
  );
};

const CalorieTool = ({ onResultChange }) => {
  const [bmr, setBmr] = useState('');
  const [activity, setActivity] = useState(1.2);
  const [res, setRes] = useState(null);

  const calculate = () => {
    const b = parseFloat(bmr);
    if (isNaN(b)) return;
    const maintenance = b * activity;
    setRes({
      maintenance,
      loss: maintenance - 500,
      gain: maintenance + 500
    });
    onResultChange({ text: `Maintenance Calories: ${maintenance.toFixed(0)} kcal`, filename: 'calories.txt' });
  };

  return (
    <div style={{ display: 'grid', gap: '15px' }}>
      <input type="number" placeholder="BMR (kcal/day)" value={bmr} onChange={e => setBmr(e.target.value)} className="pill w-full" />
      <select value={activity} onChange={e => setActivity(parseFloat(e.target.value))} className="pill w-full">
        <option value="1.2">Sedentary (little or no exercise)</option>
        <option value="1.375">Lightly active (light exercise/sports 1-3 days/week)</option>
        <option value="1.55">Moderately active (moderate exercise/sports 3-5 days/week)</option>
        <option value="1.725">Very active (hard exercise/sports 6-7 days a week)</option>
        <option value="1.9">Extra active (very hard exercise/physical job)</option>
      </select>
      <button className="btn-primary" onClick={calculate}>Calculate Needs</button>
      {res && (
        <div className="grid mt-20" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
          <div className="card p-15">
            <div className="opacity-6">Maintenance</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{res.maintenance.toFixed(0)} kcal</div>
          </div>
          <div className="card p-15">
            <div className="opacity-6">Weight Loss (-0.5kg/week)</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--danger)' }}>{res.loss.toFixed(0)} kcal</div>
          </div>
          <div className="card p-15">
            <div className="opacity-6">Weight Gain (+0.5kg/week)</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--nature-gold)' }}>{res.gain.toFixed(0)} kcal</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthTools;
