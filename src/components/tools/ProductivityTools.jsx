import React, { useState, useEffect } from 'react';
import { storage } from '../../utils/storage';

const HabitTracker = () => {
  const [habits, setHabits] = useState(storage.getJSON('hub_productivity_habits', []));
  const [newHabit, setNewHabit] = useState('');

  useEffect(() => {
    storage.setJSON('hub_productivity_habits', habits);
  }, [habits]);

  const addHabit = () => {
    if (!newHabit.trim()) return;
    setHabits([...habits, { id: Date.now(), name: newHabit, streak: 0, lastDone: null, history: [] }]);
    setNewHabit('');
  };

  const toggleHabit = (id) => {
    const today = new Date().toISOString().split('T')[0];
    setHabits(habits.map(h => {
      if (h.id === id) {
        const isDone = h.lastDone === today;
        if (isDone) {
          return { ...h, lastDone: null, streak: Math.max(0, h.streak - 1), history: h.history.filter(d => d !== today) };
        } else {
          return { ...h, lastDone: today, streak: h.streak + 1, history: [...h.history, today] };
        }
      }
      return h;
    }));
  };

  const deleteHabit = (id) => {
    setHabits(habits.filter(h => h.id !== id));
  };

  return (
    <div className="habit-tracker card glass-card p-20">
      <div className="flex-center gap-10 mb-20">
        <input
          type="text"
          className="pill w-100 p-12"
          placeholder="Enter new habit..."
          value={newHabit}
          onChange={(e) => setNewHabit(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addHabit()}
        />
        <button className="icon-btn p-12" style={{ background: 'var(--primary)', color: 'white' }} onClick={addHabit}>
          <span className="material-icons">add</span>
        </button>
      </div>

      <div className="grid gap-12">
        {habits.map(h => {
          const isDone = h.lastDone === new Date().toISOString().split('T')[0];
          return (
            <div key={h.id} className={`card p-15 flex-between ${isDone ? 'opacity-6' : ''}`} style={{ borderLeft: `4px solid ${isDone ? 'var(--nature-gold)' : 'var(--primary)'}` }}>
              <div>
                <div className="font-semibold">{h.name}</div>
                <div className="text-muted small">Streak: {h.streak} days</div>
              </div>
              <div className="flex-center gap-10">
                <button className={`icon-btn ${isDone ? 'bg-primary text-white' : ''}`} onClick={() => toggleHabit(h.id)}>
                  <span className="material-icons">{isDone ? 'check_circle' : 'radio_button_unchecked'}</span>
                </button>
                <button className="icon-btn opacity-4" onClick={() => deleteHabit(h.id)}>
                  <span className="material-icons">delete</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
      {habits.length === 0 && <div className="text-center p-20 opacity-5">No habits tracked yet. Start small!</div>}
    </div>
  );
};

const StickyNotes = () => {
  const [notes, setNotes] = useState(storage.getJSON('hub_productivity_sticky', []));

  useEffect(() => {
    storage.setJSON('hub_productivity_sticky', notes);
  }, [notes]);

  const addNote = () => {
    setNotes([{ id: Date.now(), text: '', color: '#fff9c4' }, ...notes]);
  };

  const updateNote = (id, text) => {
    setNotes(notes.map(n => n.id === id ? { ...n, text } : n));
  };

  const deleteNote = (id) => {
    setNotes(notes.filter(n => n.id !== id));
  };

  return (
    <div className="sticky-notes">
      <button className="pill w-100 p-12 mb-20 flex-center gap-10" onClick={addNote}>
        <span className="material-icons">add</span> Add Note
      </button>
      <div className="grid gap-15" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }}>
        {notes.map(n => (
          <div key={n.id} className="card p-15" style={{ background: n.color, minHeight: '160px', color: '#333' }}>
            <textarea
              className="w-100 h-100 border-none bg-transparent"
              style={{ resize: 'none', outline: 'none', color: 'inherit' }}
              value={n.text}
              onChange={(e) => updateNote(n.id, e.target.value)}
              placeholder="Write something..."
            />
            <button className="icon-btn" style={{ position: 'absolute', bottom: '5px', right: '5px', opacity: 0.5 }} onClick={() => deleteNote(n.id)}>
              <span className="material-icons" style={{ fontSize: '1.2rem' }}>delete</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const ProductivityTools = ({ toolId }) => {
  const [activeTab, setActiveTab] = useState(toolId === 'sticky-notes' ? 'notes' : 'habits');

  return (
    <div className="productivity-tools">
      {!toolId && (
        <div className="pill-group scrollable-x mb-20">
          <button className={`pill ${activeTab === 'habits' ? 'active' : ''}`} onClick={() => setActiveTab('habits')}>Habit Tracker</button>
          <button className={`pill ${activeTab === 'notes' ? 'active' : ''}`} onClick={() => setActiveTab('notes')}>Sticky Notes</button>
        </div>
      )}

      {activeTab === 'habits' || toolId === 'habit-tracker' ? <HabitTracker /> : null}
      {activeTab === 'notes' || toolId === 'sticky-notes' ? <StickyNotes /> : null}
    </div>
  );
};

export default ProductivityTools;
