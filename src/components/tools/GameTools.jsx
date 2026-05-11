import React, { useState, useEffect } from 'react';

const GameTools = ({ toolId, onResultChange }) => {
  const [activeTab, setActiveTab] = useState('dice');

  useEffect(() => {
    if (toolId) {
      const mapping = {
        'dice-roller': 'dice',
        'heads-tails': 'coin',
        'magic-8ball': 'magic8',
        'spin-wheel': 'spin-wheel',
        'spin-bottle': 'spin-bottle',
        'team-maker': 'team-maker',
        'tournament-maker': 'tournament',
        'scoreboard': 'scoreboard',
        'chess-clock': 'chess-clock',
        'chess960': 'chess960',
        'darts-scoreboard': 'darts',
        'tictactoe': 'tictactoe'
      };
      if (mapping[toolId]) setActiveTab(mapping[toolId]); else if (tabs.length > 0) setActiveTab(tabs[0].id);
    }
  }, [toolId]);

  const tabs = [
    { id: 'dice', label: 'Dice Roller' },
    { id: 'coin', label: 'Heads or Tails' },
    { id: 'magic8', label: 'Magic 8-Ball' },
    { id: 'spin-wheel', label: 'Spin Wheel' },
    { id: 'spin-bottle', label: 'Spin Bottle' },
    { id: 'team-maker', label: 'Team Maker' },
    { id: 'tournament', label: 'Tournament' },
    { id: 'scoreboard', label: 'Scoreboard' },
    { id: 'chess-clock', label: 'Chess Clock' },
    { id: 'chess960', label: 'Chess960' },
    { id: 'darts', label: 'Darts' },
    { id: 'tictactoe', label: 'Tic-Tac-Toe' }
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

      {activeTab === 'dice' && <DiceRoller onResultChange={onResultChange} />}
      {activeTab === 'coin' && <CoinFlipper onResultChange={onResultChange} />}
      {['magic8', 'spin-wheel', 'spin-bottle', 'team-maker', 'tournament', 'scoreboard', 'chess-clock', 'chess960', 'darts', 'tictactoe'].includes(activeTab) && (
          <div className="text-center p-20 card opacity-6">
              <span className="material-icons mb-10" style={{fontSize: '2rem'}}>casino</span>
              <div>This game tool is being integrated.</div>
          </div>
      )}
    </div>
  );
};

const DiceRoller = ({ onResultChange }) => {
    const [result, setResult] = useState(1);
    const roll = () => {
        const r = Math.floor(Math.random() * 6) + 1;
        setResult(r);
        onResultChange({ text: `Dice Roll: ${r}`, filename: 'dice.txt' });
    };
    return (
        <div className="text-center p-20 card">
            <div style={{fontSize: '5rem', color: 'var(--primary)'}} className="mb-20">
                <span className="material-icons" style={{fontSize: 'inherit'}}>casino</span>
                <div style={{marginTop: '-20px'}}>{result}</div>
            </div>
            <button className="btn-primary w-full" onClick={roll}>Roll Dice</button>
        </div>
    );
};

const CoinFlipper = ({ onResultChange }) => {
    const [res, setRes] = useState('Heads');
    const flip = () => {
        const r = Math.random() < 0.5 ? 'Heads' : 'Tails';
        setRes(r);
        onResultChange({ text: `Coin Flip: ${r}`, filename: 'coin.txt' });
    };
    return (
        <div className="text-center p-20 card">
            <div style={{fontSize: '2rem', fontWeight: 800, color: 'var(--primary)'}} className="mb-20">{res}</div>
            <button className="btn-primary w-full" onClick={flip}>Flip Coin</button>
        </div>
    );
};

export default GameTools;
