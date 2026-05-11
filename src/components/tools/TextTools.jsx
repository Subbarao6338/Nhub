import React, { useState, useEffect, useMemo } from 'react';

const TextTools = ({ toolId, onResultChange, onSubtoolChange }) => {
  const tabs = [
    { id: 'modify', label: 'Modify & Clean' },
    { id: 'stats', label: 'Statistics' },
    { id: 'lorem', label: 'Lorem Ipsum' },
    { id: 'rank', label: 'Word Rank' }
  ].sort((a, b) => a.label.localeCompare(b.label));

  const [activeTab, setActiveTab] = useState('modify');
  const [input, setInput] = useState('');

  useEffect(() => {
    const current = tabs.find(t => t.id === activeTab);
    if (current && onSubtoolChange) onSubtoolChange(current.label);
  }, [activeTab]);

  useEffect(() => {
    if (toolId) {
      const mapping = {
        'case-converter': 'modify',
        'word-counter': 'stats',
        'lorem-ipsum': 'lorem',
        'text-cleaner': 'modify',
        'remove-duplicates': 'modify',
        'list-sorter': 'modify'
      };
      if (mapping[toolId]) setActiveTab(mapping[toolId]); else if (tabs.length > 0) setActiveTab(tabs[0].id);
    }
  }, [toolId]);

  const stats = useMemo(() => ({
      chars: input.length,
      words: input.trim() ? input.trim().split(/\s+/).length : 0,
      lines: input.split('\n').filter(l => l.trim()).length
  }), [input]);

  const handleAction = (type) => {
      let res = input;
      if (type === 'upper') res = input.toUpperCase();
      else if (type === 'lower') res = input.toLowerCase();
      else if (type === 'title') res = input.split(' ').map(w=>w.charAt(0).toUpperCase()+w.slice(1).toLowerCase()).join(' ');
      else if (type === 'reverse') res = input.split('').reverse().join('');
      else if (type === 'whitespace') res = input.replace(/\s+/g, ' ').trim();
      else if (type === 'dedupe') res = [...new Set(input.split('\n').filter(l => l.trim()))].join('\n');
      else if (type === 'sort') res = input.split('\n').filter(l => l.trim()).sort().join('\n');
      setInput(res);
      onResultChange({ text: res, filename: 'text_processed.txt' });
  };

  const isDeepLinked = !!toolId && tabs.some(t => t.id === toolId || toolId.includes(t.id));

  return (
    <div className="tool-form">
      {!isDeepLinked && (
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
      )}

      <textarea rows="8" className="pill w-full mb-20 font-mono" placeholder="Enter text here..." value={input} onChange={e=>setInput(e.target.value)} />

      {activeTab === 'modify' && (
          <div className="grid gap-10 mb-20">
              <button className="btn-primary w-full" onClick={() => {
                  const utterance = new SpeechSynthesisUtterance(input);
                  window.speechSynthesis.speak(utterance);
              }}>
                  <span className="material-icons">record_voice_over</span> Read Aloud (TTS)
              </button>
          </div>
      )}

      {activeTab === 'modify' && (
          <div className="flex-gap flex-wrap">
              <button className="btn-primary" onClick={()=>handleAction('upper')}>UPPERCASE</button>
              <button className="pill" onClick={()=>handleAction('lower')}>lowercase</button>
              <button className="pill" onClick={()=>handleAction('title')}>Title Case</button>
              <button className="pill" onClick={()=>handleAction('reverse')}>Reverse</button>
              <button className="pill" onClick={()=>handleAction('whitespace')}>Clean Whitespace</button>
              <button className="pill" onClick={()=>handleAction('dedupe')}>Dedupe Lines</button>
              <button className="pill" onClick={()=>handleAction('sort')}>Sort Lines</button>
          </div>
      )}

      {activeTab === 'stats' && (
          <div className="grid grid-2-cols gap-15">
              <div className="card p-20 text-center">
                  <div className="font-bold" style={{fontSize: '2rem'}}>{stats.chars}</div>
                  <div className="opacity-6">Characters</div>
              </div>
              <div className="card p-20 text-center">
                  <div className="font-bold" style={{fontSize: '2rem'}}>{stats.words}</div>
                  <div className="opacity-6">Words</div>
              </div>
              <div className="card p-20 text-center">
                  <div className="font-bold" style={{fontSize: '2rem'}}>{stats.lines}</div>
                  <div className="opacity-6">Lines</div>
              </div>
          </div>
      )}

      {activeTab === 'lorem' && <LoremGenerator onResultChange={onResultChange} setInput={setInput} />}
      {activeTab === 'rank' && <WordRankCalculator onResultChange={onResultChange} />}
    </div>
  );
};

const WordRankCalculator = ({ onResultChange }) => {
    const [word, setWord] = useState('NATURE');
    const [rank, setRank] = useState(null);

    const calculate = () => {
        const input = word.toUpperCase().replace(/[^A-Z]/g, '');
        if (!input) return;

        const factorial = (n) => {
            let res = BigInt(1);
            for (let i = 2n; i <= BigInt(n); i++) res *= i;
            return res;
        };

        const getFactorialDivisor = (counts) => {
            let divisor = BigInt(1);
            for (let key in counts) divisor *= factorial(counts[key]);
            return divisor;
        };

        const len = input.length;
        let currentRank = BigInt(1);
        let charCount = {};
        for (let ch of input) charCount[ch] = (charCount[ch] || 0) + 1;

        for (let i = 0; i < len; i++) {
            let countSmaller = 0;
            for (let key in charCount) {
                if (key < input[i]) countSmaller += charCount[key];
            }

            if (countSmaller > 0) {
                let permutations = factorial(len - 1 - i);
                let divisor = getFactorialDivisor(charCount);
                // The formula for permutations with repetitions: n! / (n1! * n2! * ...)
                // Here we want (countSmaller * (len-1-i)! / (n1! * n2! * ...))
                // But we must adjust the divisor for the character we are currently "using" at this position
                // Wait, it's easier: for each unique char 'c' smaller than input[i]:
                // rank += (len-1-i)! / (n1! * n2! * (nc-1)! * ...)

                let waysAtThisPosition = BigInt(0);
                const uniqueChars = Object.keys(charCount).sort();
                for (let char of uniqueChars) {
                    if (char < input[i]) {
                        charCount[char]--;
                        waysAtThisPosition += factorial(len - 1 - i) / getFactorialDivisor(charCount);
                        charCount[char]++;
                    }
                }
                currentRank += waysAtThisPosition;
            }
            charCount[input[i]]--;
            if (charCount[input[i]] === 0) delete charCount[input[i]];
        }

        setRank(currentRank.toString());
        onResultChange({ text: `Rank of "${input}": ${currentRank}`, filename: 'word_rank.txt' });
    };

    return (
        <div className="card p-20 grid gap-15">
            <div className="form-group">
                <label>Word (with or without duplicate letters)</label>
                <input className="pill" value={word} onChange={e => setWord(e.target.value.toUpperCase())} />
            </div>
            <button className="btn-primary" onClick={calculate}>Calculate Dictionary Rank</button>
            {rank && (
                <div className="tool-result text-center">
                    <div className="opacity-6 small">The rank of "{word}" is</div>
                    <div className="font-bold" style={{fontSize: '1.8rem', wordBreak: 'break-all'}}>{rank}</div>
                </div>
            )}
        </div>
    );
};

const LoremGenerator = ({ onResultChange, setInput }) => {
    const [count, setCount] = useState(3);
    const gen = () => {
        const text = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. ".repeat(10 * count);
        setInput(text);
        onResultChange({ text, filename: 'lorem.txt' });
    };
    return (
        <div className="card p-20 flex-gap">
            <input type="number" className="pill flex-1" value={count} onChange={e=>setCount(e.target.value)} min="1" max="50" />
            <button className="btn-primary flex-1" onClick={gen}>Generate</button>
        </div>
    );
};

export default TextTools;
