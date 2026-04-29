import React, { useState, useEffect } from 'react';
import { storage } from '../../utils/storage';

const Flashcards = () => {
  const [sets, setSets] = useState(storage.getJSON('hub_flashcards', []));
  const [activeSetIdx, setActiveSetIdx] = useState(null);
  const [currentCardIdx, setCurrentCardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const [newName, setNewName] = useState('');
  const [cardsInput, setCardsInput] = useState('');

  useEffect(() => {
    storage.setJSON('hub_flashcards', sets);
  }, [sets]);

  const createSet = () => {
    const lines = cardsInput.split('\n').filter(l => l.includes('|'));
    const cards = lines.map(line => {
      const [front, back] = line.split('|');
      return { front: front.trim(), back: back.trim() };
    });
    if (cards.length > 0) {
      setSets([...sets, { name: newName || 'New Set', cards }]);
      setIsCreating(false);
      setNewName('');
      setCardsInput('');
    }
  };

  const deleteSet = (idx) => {
    const newSets = [...sets];
    newSets.splice(idx, 1);
    setSets(newSets);
  };

  if (activeSetIdx !== null) {
    const activeSet = sets[activeSetIdx];
    const card = activeSet.cards[currentCardIdx];

    return (
      <div className="text-center">
        <div className="flex-between mb-20">
          <button className="icon-btn" onClick={() => { setActiveSetIdx(null); setIsFlipped(false); setCurrentCardIdx(0); }}>
            <span className="material-icons">arrow_back</span>
          </button>
          <span className="font-semibold">{activeSet.name} ({currentCardIdx + 1}/{activeSet.cards.length})</span>
          <div style={{ width: '40px' }} />
        </div>

        <div
          className={`card flashcard-main mb-20 ${isFlipped ? 'flipped' : ''}`}
          onClick={() => setIsFlipped(!isFlipped)}
          style={{ height: '250px', cursor: 'pointer', perspective: '1000px', position: 'relative', transformStyle: 'preserve-3d', transition: 'transform 0.6s' }}
        >
          <div className="flashcard-front flex-center" style={{ position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden', padding: '20px', fontSize: '1.5rem', background: 'var(--surface)', borderRadius: '24px' }}>
            {card.front}
          </div>
          <div className="flashcard-back flex-center" style={{ position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', padding: '20px', fontSize: '1.5rem', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '24px' }}>
            {card.back}
          </div>
        </div>

        <div className="flex-gap">
          <button className="pill active flex-1" onClick={() => { setIsFlipped(false); setCurrentCardIdx(prev => (prev - 1 + activeSet.cards.length) % activeSet.cards.length); }}>Prev</button>
          <button className="pill active flex-1" onClick={() => setIsFlipped(!isFlipped)}>Flip</button>
          <button className="pill active flex-1" onClick={() => { setIsFlipped(false); setCurrentCardIdx(prev => (prev + 1) % activeSet.cards.length); }}>Next</button>
        </div>

        <style>{`
          .flashcard-main.flipped { transform: rotateY(180deg); }
        `}</style>
      </div>
    );
  }

  return (
    <div className="tool-form">
      {isCreating ? (
        <div className="grid gap-15">
          <input type="text" placeholder="Set Name (e.g. Spanish Basics)" value={newName} onChange={e => setNewName(e.target.value)} className="pill w-full" />
          <textarea
            rows="8"
            placeholder="Front | Back (One per line)"
            value={cardsInput}
            onChange={e => setCardsInput(e.target.value)}
            className="pill w-full"
            style={{ borderRadius: '16px' }}
          />
          <div className="flex-gap">
            <button className="pill flex-1" onClick={() => setIsCreating(false)}>Cancel</button>
            <button className="btn-primary flex-1" onClick={createSet}>Create Set</button>
          </div>
        </div>
      ) : (
        <>
          <button className="btn-primary w-full mb-20" onClick={() => setIsCreating(true)}>
            <span className="material-icons">add</span> Create New Flashcard Set
          </button>
          {sets.length === 0 ? (
            <div className="text-center opacity-5 p-40">No card sets yet.</div>
          ) : (
            <div className="grid gap-10">
              {sets.map((set, i) => (
                <div key={i} className="card p-15 flex-between" onClick={() => setActiveSetIdx(i)}>
                  <div className="flex-center gap-10">
                    <span className="material-icons opacity-6">style</span>
                    <span className="font-semibold">{set.name}</span>
                    <span className="opacity-5" style={{ fontSize: '0.8rem' }}>({set.cards.length} cards)</span>
                  </div>
                  <button className="icon-btn danger" onClick={(e) => { e.stopPropagation(); deleteSet(i); }}>
                    <span className="material-icons">delete</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Flashcards;
