import React, { useState } from 'react';

const CoinFlipper = ({ onResultChange }) => {
  const [result, setResult] = useState(null);
  const [flipping, setFlipping] = useState(false);

  const flipCoin = () => {
    setFlipping(true);
    setTimeout(() => {
      const res = Math.random() < 0.5 ? 'Heads' : 'Tails';
      setResult(res);
      setFlipping(false);
      onResultChange({
        text: `Coin Flip: ${res}`,
        filename: 'coin_flip.txt'
      });
    }, 600);
  };

  return (
    <div className="tool-form" style={{ textAlign: 'center' }}>
      <div style={{ height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className={`coin ${flipping ? 'flipping' : ''}`} style={{
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          background: 'var(--primary)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.2rem',
          fontWeight: 'bold',
          boxShadow: '0 4px 15px var(--primary-glow)',
          transition: 'transform 0.6s'
        }}>
          {result || 'Flip'}
        </div>
      </div>

      <style>{`
        @keyframes flip {
          0% { transform: rotateY(0); }
          100% { transform: rotateY(1800deg); }
        }
        .coin.flipping {
          animation: flip 0.6s ease-out;
        }
      `}</style>

      <button className="btn-primary" onClick={flipCoin} disabled={flipping} style={{ width: '100%', marginTop: '20px' }}>
        Flip Coin
      </button>

      {result && !flipping && (
        <div style={{ marginTop: '20px', fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>
          It's {result}!
        </div>
      )}
    </div>
  );
};

export default CoinFlipper;
