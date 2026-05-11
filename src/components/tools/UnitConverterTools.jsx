import React, { useState, useEffect } from 'react';

const UnitConverterTools = ({ onResultChange, toolId, onSubtoolChange }) => {
  const [value, setValue] = useState(1);
  const [fromUnit, setFromUnit] = useState('km');
  const [toUnit, setToUnit] = useState('m');
  const [result, setResult] = useState(0);

  const rates = {
    'km_m': 1000, 'm_km': 0.001, 'km_mi': 0.621371, 'mi_km': 1.60934,
    'kg_lb': 2.20462, 'lb_kg': 0.453592,
    'mps_kph': 3.6, 'kph_mps': 1/3.6
  };

  useEffect(() => {
    if (onSubtoolChange) onSubtoolChange('Unit Converter');
  }, []);

  useEffect(() => {
    const val = parseFloat(value) || 0;
    let res = val;
    if (fromUnit !== toUnit) {
      const key = `${fromUnit}_${toUnit}`;
      res = rates[key] ? val * rates[key] : (rates[`${toUnit}_${fromUnit}`] ? val / rates[`${toUnit}_${fromUnit}`] : val);
    }
    setResult(res.toFixed(4));
    onResultChange({ text: `${value} ${fromUnit} = ${res.toFixed(4)} ${toUnit}` });
  }, [value, fromUnit, toUnit]);

  return (
    <div className="tool-form card p-20">
      <div className="form-group mb-15">
        <label className="opacity-6">Value</label>
        <input type="number" className="pill w-full" value={value} onChange={e=>setValue(e.target.value)} />
      </div>
      <div className="flex-gap align-center">
        <select className="pill flex-1" value={fromUnit} onChange={e=>setFromUnit(e.target.value)}>
          <option value="km">KM</option><option value="m">M</option><option value="mi">MI</option>
          <option value="kg">KG</option><option value="lb">LB</option>
        </select>
        <span className="material-icons opacity-3">arrow_forward</span>
        <select className="pill flex-1" value={toUnit} onChange={e=>setToUnit(e.target.value)}>
          <option value="m">M</option><option value="km">KM</option><option value="mi">MI</option>
          <option value="lb">LB</option><option value="kg">KG</option>
        </select>
      </div>
      <div className="tool-result text-center mt-20" style={{fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)'}}>{result}</div>
    </div>
  );
};

export default UnitConverterTools;
