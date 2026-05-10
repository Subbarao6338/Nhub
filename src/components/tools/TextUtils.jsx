import React, { useState, useEffect, useMemo } from 'react';

const TextUtils = ({ toolId, onResultChange }) => {
  const [activeTab, setActiveTab] = useState('modify');
  const [input, setInput] = useState('');
  const [caesarShift, setCaesarShift] = useState(3);
  const [loremParagraphs, setLoremParagraphs] = useState(3);
  const [rankWord, setRankWord] = useState('');

  useEffect(() => {
    if (toolId) {
      if (toolId === 'character-counter') setActiveTab('stats');
      else if (toolId === 'lorem-ipsum') setActiveTab('lorem');
      else if (toolId === 'html-entities') setActiveTab('html');
      else if (toolId === 'word-rank') setActiveTab('rank');
    }
  }, [toolId]);

  useEffect(() => {
    if (input || rankWord) {
      onResultChange({
        text: input || rankWord,
        filename: 'text_result.txt'
      });
    } else {
      onResultChange(null);
    }
  }, [input, rankWord, onResultChange]);

  const modifyText = (type) => {
    let val = input;
    if (type === 'up') val = val.toUpperCase();
    else if (type === 'low') val = val.toLowerCase();
    else if (type === 'cap') val = val.replace(/\b\w/g, l => l.toUpperCase());
    else if (type === 'trim') val = val.trim();
    else if (type === 'clean') val = val.replace(/\s+/g, ' ');
    else if (type === 'slug') val = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    else if (type === 'no-space') val = val.replace(/\s+/g, '');
    else if (type === 'rev') val = val.split('').reverse().join('');
    else if (type === 'binary') val = val.split('').map(char => char.charCodeAt(0).toString(2).padStart(8, '0')).join(' ');
    else if (type === 'hex') val = val.split('').map(char => char.charCodeAt(0).toString(16).padStart(2, '0')).join(' ');
    else if (type === 'caesar') {
      val = val.replace(/[a-z]/gi, (char) => {
        const start = char <= 'Z' ? 65 : 97;
        return String.fromCharCode(((char.charCodeAt(0) - start + caesarShift) % 26) + start);
      });
    }
    else if (type === 'braille') {
      const brailleMap = {
        'a': '⠁', 'b': '⠃', 'c': '⠉', 'd': '⠙', 'e': '⠑', 'f': '⠋', 'g': '⠛', 'h': '⠓', 'i': '⠊', 'j': '⠚',
        'k': '⠅', 'l': '⠇', 'm': '⠍', 'n': '⠝', 'o': '⠕', 'p': '⠏', 'q': '⠟', 'r': '⠗', 's': '⠎', 't': '⠞',
        'u': '⠥', 'v': '⠧', 'w': '⠺', 'x': '⠭', 'y': '⠽', 'z': '⠵', ' ': ' ',
        '1': '⠼⠁', '2': '⠼⠃', '3': '⠼⠉', '4': '⠼⠙', '5': '⠼⠑', '6': '⠼⠋', '7': '⠼⠛', '8': '⠼⠓', '9': '⠼⠊', '0': '⠼⠚'
      };
      val = val.toLowerCase().split('').map(c => brailleMap[c] || c).join('');
    }
    else if (type === 'ascii') {
      const art = `
  _   _       _
 | \\ | | __ _| |_ _   _ _ __ ___
 |  \\| |/ _' | __| | | | '__/ _ \\
 | |\\  | (_| | |_| |_| | | |  __/
 |_| \\_|\\__,_|\\__|\\__,_|_|  \\___|

        `;
      val = art + "\n\n" + val;
    }
    setInput(val);
  };

  const stats = useMemo(() => {
    const text = input.trim();
    return {
      words: text ? text.split(/\s+/).length : 0,
      chars: text.length,
      sent: text ? text.split(/[.!?]+/).filter(Boolean).length : 0,
      para: text ? text.split(/\n+/).filter(Boolean).length : 0
    };
  }, [input]);

  const generateLorem = () => {
    const text = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";
    let res = [];
    for (let i = 0; i < loremParagraphs; i++) res.push(text);
    setInput(res.join('\n\n'));
  };

  const encodeHtml = (str) => {
    return str.replace(/[\u00A0-\u9999<>&"']/g, (i) => {
      return '&#' + i.charCodeAt(0) + ';';
    });
  };

  const decodeHtml = (str) => {
    const txt = document.createElement("textarea");
    txt.innerHTML = str;
    return txt.value;
  };

  const factorial = (n) => {
    let res = 1n;
    for (let i = 2n; i <= BigInt(n); i++) res *= i;
    return res;
  };

  const wordRank = useMemo(() => {
    const input = rankWord.trim().toUpperCase();
    if (!input) return null;

    const len = input.length;
    let rank = 1n;
    let mul = factorial(len);
    const charCount = {};

    for (const ch of input) {
      charCount[ch] = (charCount[ch] || 0) + 1;
    }

    const getFactorialDivisor = (counts) => {
      let divisor = 1n;
      for (const key in counts) {
        divisor *= factorial(counts[key]);
      }
      return divisor;
    };

    const currentCounts = { ...charCount };

    for (let i = 0; i < len; i++) {
      mul /= BigInt(len - i);
      const divisor = getFactorialDivisor(currentCounts);
      let countSmaller = 0;

      for (const key in currentCounts) {
        if (key < input[i]) {
          countSmaller += currentCounts[key];
        }
      }

      rank += (BigInt(countSmaller) * mul) / divisor;

      currentCounts[input[i]]--;
      if (currentCounts[input[i]] === 0) {
        delete currentCounts[input[i]];
      }
    }
    return rank.toString();
  }, [rankWord]);

  return (
    <div className="tool-form">
      <div className="pill-group mb-20 scrollable-x">
        <button className={`pill ${activeTab === 'modify' ? 'active' : ''}`} onClick={() => setActiveTab('modify')}>Modify</button>
        <button className={`pill ${activeTab === 'stats' ? 'active' : ''}`} onClick={() => setActiveTab('stats')}>Stats</button>
        <button className={`pill ${activeTab === 'lorem' ? 'active' : ''}`} onClick={() => setActiveTab('lorem')}>Lorem Ipsum</button>
        <button className={`pill ${activeTab === 'html' ? 'active' : ''}`} onClick={() => setActiveTab('html')}>HTML Entities</button>
        <button className={`pill ${activeTab === 'rank' ? 'active' : ''}`} onClick={() => setActiveTab('rank')}>Word Rank</button>
      </div>

      {activeTab !== 'rank' && (
        <textarea
          rows="8"
          placeholder="Enter text here..."
          style={{
            width: '100%',
            marginBottom: '20px',
            padding: '12px',
            borderRadius: '12px',
            border: '1px solid var(--border)',
            background: 'var(--surface)',
            color: 'var(--on-surface)',
            fontFamily: 'inherit'
          }}
          value={input}
          onChange={e => setInput(e.target.value)}
        />
      )}

      {activeTab === 'modify' && (
        <>
          <div className="card mb-20" style={{ padding: '15px' }}>
            <label style={{ fontSize: '0.8rem', opacity: 0.7, display: 'block', marginBottom: '8px' }}>Caesar Cipher Shift: {caesarShift}</label>
            <input type="range" min="1" max="25" value={caesarShift} onChange={e => setCaesarShift(parseInt(e.target.value))} className="w-full" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px' }}>
            <button className="pill" onClick={() => modifyText('up')}>UPPERCASE</button>
            <button className="pill" onClick={() => modifyText('low')}>lowercase</button>
            <button className="pill" onClick={() => modifyText('cap')}>Capitalize</button>
            <button className="pill" onClick={() => modifyText('trim')}>Trim Edges</button>
            <button className="pill" onClick={() => modifyText('clean')}>Clean Spaces</button>
            <button className="pill" onClick={() => modifyText('slug')}>Slugify</button>
            <button className="pill" onClick={() => modifyText('rev')}>Reverse</button>
            <button className="pill" onClick={() => modifyText('binary')}>Binary</button>
            <button className="pill" onClick={() => modifyText('hex')}>Hex</button>
            <button className="pill" onClick={() => modifyText('caesar')}>Caesar Cipher</button>
            <button className="pill" onClick={() => modifyText('braille')}>Braille</button>
            <button className="pill" onClick={() => modifyText('ascii')}>ASCII Art</button>
          </div>
        </>
      )}

      {activeTab === 'stats' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
          <div className="tool-result"><div style={{ opacity: 0.5, fontSize: '0.8rem' }}>Words</div><div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.words}</div></div>
          <div className="tool-result"><div style={{ opacity: 0.5, fontSize: '0.8rem' }}>Characters</div><div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.chars}</div></div>
          <div className="tool-result"><div style={{ opacity: 0.5, fontSize: '0.8rem' }}>Sentences</div><div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.sent}</div></div>
          <div className="tool-result"><div style={{ opacity: 0.5, fontSize: '0.8rem' }}>Paragraphs</div><div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.para}</div></div>
        </div>
      )}

      {activeTab === 'lorem' && (
        <div className="grid gap-15">
          <div className="form-group"><label>Paragraphs</label><input type="number" value={loremParagraphs} onChange={e => setLoremParagraphs(parseInt(e.target.value))} min="1" max="10" /></div>
          <button className="btn-primary" onClick={generateLorem}>Generate Placeholder Text</button>
        </div>
      )}

      {activeTab === 'html' && (
        <div className="grid gap-10">
          <button className="pill" onClick={() => setInput(encodeHtml(input))}>Encode Entities</button>
          <button className="pill" onClick={() => setInput(decodeHtml(input))}>Decode Entities</button>
        </div>
      )}

      {activeTab === 'rank' && (
        <div className="grid gap-15">
          <div className="form-group">
            <label>Enter Word</label>
            <input
              type="text"
              className="pill"
              value={rankWord}
              onChange={(e) => setRankWord(e.target.value)}
              placeholder="e.g. SECRET"
              style={{ textTransform: 'uppercase' }}
            />
          </div>
          {wordRank && (
            <div className="tool-result text-center">
              <div style={{ opacity: 0.6, fontSize: '0.9rem', textTransform: 'uppercase' }}>Rank of the word</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', wordBreak: 'break-all' }}>{wordRank}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TextUtils;
