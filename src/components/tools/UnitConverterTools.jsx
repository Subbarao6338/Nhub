import React, { useState, useEffect } from 'react';

const UnitConverterTools = ({ onResultChange, toolId, onSubtoolChange }) => {
  const tabs = [
    { id: 'length-conv', label: 'Length' },
    { id: 'weight-conv', label: 'Weight' },
    { id: 'temp-conv', label: 'Temperature' },
    { id: 'data-conv', label: 'Data' },
    { id: 'area-conv', label: 'Area' },
    { id: 'volume-conv', label: 'Volume' }
  ];

  const [activeTab, setActiveTab] = useState('length-conv');
  const [value, setValue] = useState(1);
  const [fromUnit, setFromUnit] = useState('km');
  const [toUnit, setToUnit] = useState('m');
  const [result, setResult] = useState(0);

  const rates = {
    'km_m': 1000, 'm_km': 0.001, 'km_mi': 0.621371, 'mi_km': 1.60934,
    'kg_lb': 2.20462, 'lb_kg': 0.453592,
    'gb_mb': 1024, 'mb_gb': 1/1024, 'mb_kb': 1024, 'kb_mb': 1/1024
  };

  useEffect(() => {
    const labels = {
        'length-conv': 'Length Converter',
        'weight-conv': 'Weight Converter',
        'temp-conv': 'Temperature Converter',
        'data-conv': 'Data Converter'
    };
    if (onSubtoolChange) onSubtoolChange(labels[activeTab] || 'Unit Converter');
  }, [activeTab]);

  useEffect(() => {
    if (toolId) {
        if (tabs.some(t => t.id === toolId)) setActiveTab(toolId);
        if (toolId === 'data-conv') { setFromUnit('gb'); setToUnit('mb'); }
        else if (toolId === 'length-conv') { setFromUnit('km'); setToUnit('m'); }
        else if (toolId === 'weight-conv') { setFromUnit('kg'); setToUnit('lb'); }
        else if (toolId === 'temp-conv') { setFromUnit('c'); setToUnit('f'); }
    }
  }, [toolId]);

  useEffect(() => {
    const val = parseFloat(value) || 0;
    let res = val;

    if (activeTab === 'temp-conv') {
        if (fromUnit === 'c' && toUnit === 'f') res = (val * 9/5) + 32;
        else if (fromUnit === 'f' && toUnit === 'c') res = (val - 32) * 5/9;
        else if (fromUnit === 'c' && toUnit === 'k') res = val + 273.15;
        else if (fromUnit === 'k' && toUnit === 'c') res = val - 273.15;
        else if (fromUnit === 'f' && toUnit === 'k') res = (val - 32) * 5/9 + 273.15;
        else if (fromUnit === 'k' && toUnit === 'f') res = (val - 273.15) * 9/5 + 32;
    } else if (fromUnit !== toUnit) {
      const key = `${fromUnit}_${toUnit}`;
      res = rates[key] ? val * rates[key] : (rates[`${toUnit}_${fromUnit}`] ? val / rates[`${toUnit}_${fromUnit}`] : val);
    }

    setResult(res.toFixed(activeTab === 'temp-conv' ? 2 : 4));
    onResultChange({ text: `${value} ${fromUnit.toUpperCase()} = ${res.toFixed(4)} ${toUnit.toUpperCase()}` });
  }, [value, fromUnit, toUnit, activeTab]);

  const isDeepLinked = !!toolId && tabs.some(t => t.id === toolId);

  return (
    <div className="tool-form">
      {!isDeepLinked && (
        <div className="pill-group mb-20 scrollable-x">
          {tabs.map(t => (
              <button key={t.id} className={`pill ${activeTab === t.id ? 'active' : ''}`} onClick={() => {
                  setActiveTab(t.id);
                  if (t.id === 'data-conv') { setFromUnit('gb'); setToUnit('mb'); }
                  else if (t.id === 'length-conv') { setFromUnit('km'); setToUnit('m'); }
                  else if (t.id === 'weight-conv') { setFromUnit('kg'); setToUnit('lb'); }
                  else if (t.id === 'temp-conv') { setFromUnit('c'); setToUnit('f'); }
              }}>{t.label}</button>
          ))}
        </div>
      )}

      <div className="card p-20 glass-card">
          <div className="form-group mb-20">
            <label className="smallest uppercase font-bold opacity-6">Value to Convert</label>
            <input type="number" className="pill w-full text-center" style={{fontSize: '1.5rem'}} value={value} onChange={e=>setValue(e.target.value)} />
          </div>
          <div className="flex-center gap-15 align-center mb-20">
            <select className="pill flex-1" value={fromUnit} onChange={e=>setFromUnit(e.target.value)}>
              {activeTab === 'length-conv' && <><option value="km">Kilometers (km)</option><option value="m">Meters (m)</option><option value="mi">Miles (mi)</option></>}
              {activeTab === 'weight-conv' && <><option value="kg">Kilograms (kg)</option><option value="lb">Pounds (lb)</option></>}
              {activeTab === 'data-conv' && <><option value="gb">Gigabytes (GB)</option><option value="mb">Megabytes (MB)</option><option value="kb">Kilobytes (KB)</option></>}
              {activeTab === 'temp-conv' && <><option value="c">Celsius (°C)</option><option value="f">Fahrenheit (°F)</option><option value="k">Kelvin (K)</option></>}
      {activeTab === 'area-conv' && <><option value="sqm">Sq Meters</option><option value="sqkm">Sq Km</option><option value="acre">Acres</option></>}
      {activeTab === 'volume-conv' && <><option value="l">Liters</option><option value="ml">Milliliters</option><option value="gal">Gallons</option></>}
            </select>
            <span className="material-icons opacity-4">swap_horiz</span>
            <select className="pill flex-1" value={toUnit} onChange={e=>setToUnit(e.target.value)}>
                {activeTab === 'length-conv' && <><option value="m">Meters (m)</option><option value="km">Kilometers (km)</option><option value="mi">Miles (mi)</option></>}
                {activeTab === 'weight-conv' && <><option value="lb">Pounds (lb)</option><option value="kg">Kilograms (kg)</option></>}
                {activeTab === 'data-conv' && <><option value="mb">Megabytes (MB)</option><option value="gb">Gigabytes (GB)</option><option value="kb">Kilobytes (KB)</option></>}
                {activeTab === 'temp-conv' && <><option value="f">Fahrenheit (°F)</option><option value="c">Celsius (°C)</option><option value="k">Kelvin (K)</option></>}
        {activeTab === 'area-conv' && <><option value="acre">Acres</option><option value="sqm">Sq Meters</option><option value="sqkm">Sq Km</option></>}
        {activeTab === 'volume-conv' && <><option value="gal">Gallons</option><option value="l">Liters</option><option value="ml">Milliliters</option></>}
            </select>
          </div>
          <div className="tool-result text-center">
            <div className="opacity-6 smallest uppercase font-bold mb-5">Result</div>
            <div style={{fontSize: '3.5rem', fontWeight: 800, color: 'var(--primary)', lineHeight: 1}}>{result}</div>
            <div className="opacity-7 font-bold mt-10 uppercase">{toUnit}</div>
          </div>
      </div>
    </div>
  );
};

export default UnitConverterTools;
