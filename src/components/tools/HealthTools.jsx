import React, { useState, useEffect } from 'react';

const HealthTools = ({ onResultChange, toolId, onSubtoolChange }) => {
  const [activeTab, setActiveTab] = useState('bmr');

  useEffect(() => {
    const labels = { bmr: 'Basal Metabolic Rate', bmi: 'BMI Calculator', calories: 'Calorie Needs' };
    if (onSubtoolChange) onSubtoolChange(labels[activeTab]);
  }, [activeTab]);

  useEffect(() => {
    if (toolId) {
      if (toolId === 'bmr-calc') setActiveTab('bmr');
      else if (toolId === 'calorie-calc') setActiveTab('calories');
    }
  }, [toolId]);

  const isDeepLinked = !!toolId;

  return (
    <div className="tool-form">
      {!isDeepLinked && (
          <div className="pill-group mb-20 scrollable-x">
            <button className={`pill ${activeTab === 'bmr' ? 'active' : ''}`} onClick={() => setActiveTab('bmr')}>BMR</button>
            <button className={`pill ${activeTab === 'bmi' ? 'active' : ''}`} onClick={() => setActiveTab('bmi')}>BMI</button>
            <button className={`pill ${activeTab === 'calories' ? 'active' : ''}`} onClick={() => setActiveTab('calories')}>Calories</button>
          </div>
      )}

      {activeTab === 'bmr' && <BmrTool onResultChange={onResultChange} />}
      {activeTab === 'bmi' && <BmiTool onResultChange={onResultChange} />}
      {activeTab === 'calories' && <CalorieTool onResultChange={onResultChange} />}
    </div>
  );
};

const BmiTool = ({ onResultChange }) => {
    const [w, setW] = useState('');
    const [h, setH] = useState('');
    const [bmi, setBmi] = useState(null);
    const calc = () => {
        const res = parseFloat(w) / ((parseFloat(h)/100)**2);
        setBmi(res.toFixed(1));
        onResultChange({ text: `BMI: ${res.toFixed(1)}`, filename: 'bmi.txt' });
    };
    return (
        <div className="grid gap-15">
            <input type="number" placeholder="Weight (kg)" className="pill" value={w} onChange={e=>setW(e.target.value)} />
            <input type="number" placeholder="Height (cm)" className="pill" value={h} onChange={e=>setH(e.target.value)} />
            <button className="btn-primary" onClick={calc}>Calculate BMI</button>
            {bmi && (
                <div className="tool-result text-center">
                    <div style={{fontSize: '3rem', fontWeight: 800}}>{bmi}</div>
                    <div className="opacity-6">{bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese'}</div>
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
      <div className="pill-group" style={{ justifyContent: 'center' }}>
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
        <div className="grid-2 mt-20" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
          <div className="card p-15">
            <div className="opacity-6">Maintenance</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{res.maintenance.toFixed(0)} kcal</div>
          </div>
          <div className="card p-15">
            <div className="opacity-6">Weight Loss (-0.5kg/week)</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-green)' }}>{res.loss.toFixed(0)} kcal</div>
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
