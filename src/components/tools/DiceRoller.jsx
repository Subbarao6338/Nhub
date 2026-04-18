import React, { useState } from 'react';

const DiceRoller = ({ onResultChange }) => {
  const [dice, setDice] = useState([1]);
  const [sides, setSides] = useState(6);

  const rollDice = () => {
    const newDice = dice.map(() => Math.floor(Math.random() * sides) + 1);
    setDice(newDice);
    onResultChange({
      text: `Rolled ${newDice.length}d${sides}: ${newDice.join(', ')} (Total: ${newDice.reduce((a, b) => a + b, 0)})`,
      filename: 'dice_roll.txt'
    });
  };

  const addDie = () => {
    if (dice.length < 10) setDice([...dice, 1]);
  };

  const removeDie = () => {
    if (dice.length > 1) setDice(dice.slice(0, -1));
  };

  return (
    <div className="tool-form" style={{ textAlign: 'center' }}>
      <div className="form-group">
        <label>Sides</label>
        <select
          className="pill"
          value={sides}
          onChange={(e) => setSides(parseInt(e.target.value))}
          style={{ width: '100%', padding: '10px' }}
        >
          {[4, 6, 8, 10, 12, 20, 100].map(s => <option key={s} value={s}>{s} Sides</option>)}
        </select>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
        <button className="pill" onClick={removeDie} disabled={dice.length <= 1}>-</button>
        <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{dice.length} Dice</span>
        <button className="pill" onClick={addDie} disabled={dice.length >= 10}>+</button>
      </div>

      <button className="btn-primary" onClick={rollDice} style={{ width: '100%' }}>Roll Dice</button>

      <div className="result-grid" style={{ marginTop: '20px', justifyContent: 'center' }}>
        {dice.map((d, i) => (
          <div key={i} className="pill active" style={{ width: '60px', height: '60px', fontSize: '1.5rem', justifyContent: 'center' }}>
            {d}
          </div>
        ))}
      </div>

      {dice.length > 1 && (
        <div style={{ marginTop: '15px', fontSize: '1.2rem', fontWeight: 'bold' }}>
          Total: {dice.reduce((a, b) => a + b, 0)}
        </div>
      )}
    </div>
  );
};

export default DiceRoller;
