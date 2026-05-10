import React, { useState, useEffect, useMemo } from 'react';

const AiSummary = ({ onResultChange }) => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('summary');

  useEffect(() => {
    if (result) {
      const plainText = result.replace(/<[^>]*>/g, '').trim();
      onResultChange({
        text: plainText,
        filename: activeTab === 'summary' ? 'summary.txt' : 'sentiment.txt'
      });
    } else {
      onResultChange(null);
    }
  }, [result, activeTab, onResultChange]);

  const runAnalysis = () => {
    if (!input.trim()) return;
    setLoading(true);
    setResult('');

    setTimeout(() => {
      if (activeTab === 'summary') {
        setResult(generateExtractiveSummary(input));
      } else {
        setResult(analyzeSentiment(input));
      }
      setLoading(false);
    }, 800);
  };

  const analyzeSentiment = (text) => {
    const positiveWords = new Set(['good', 'great', 'excellent', 'happy', 'love', 'amazing', 'positive', 'nice', 'awesome', 'wonderful', 'joy', 'beautiful']);
    const negativeWords = new Set(['bad', 'terrible', 'awful', 'sad', 'hate', 'negative', 'poor', 'worst', 'ugly', 'depressing', 'horrible', 'angry']);

    const words = text.toLowerCase().match(/\w+/g) || [];
    let score = 0;
    const posMatches = [];
    const negMatches = [];

    words.forEach(word => {
      if (positiveWords.has(word)) {
        score++;
        posMatches.push(word);
      } else if (negativeWords.has(word)) {
        score--;
        negMatches.push(word);
      }
    });

    let sentiment = 'Neutral';
    let icon = 'sentiment_satisfied';
    let color = 'var(--text-muted)';

    if (score > 0) {
      sentiment = 'Positive';
      icon = 'sentiment_very_satisfied';
      color = '#10b981';
    } else if (score < 0) {
      sentiment = 'Negative';
      icon = 'sentiment_very_dissatisfied';
      color = '#ef4444';
    }

    return `
      <div style="text-align: center; padding: 10px;">
        <span class="material-icons" style="font-size: 3rem; color: ${color}">${icon}</span>
        <div style="font-size: 1.5rem; fontWeight: 700; color: ${color}">${sentiment}</div>
        <div style="margin-top: 10px; font-size: 0.9rem; opacity: 0.8;">
          Score: ${score} (Pos: ${posMatches.length}, Neg: ${negMatches.length})
        </div>
        ${posMatches.length > 0 ? `<div style="margin-top: 5px; color: #10b981; font-size: 0.8rem">Pos: ${[...new Set(posMatches)].join(', ')}</div>` : ''}
        ${negMatches.length > 0 ? `<div style="margin-top: 5px; color: #ef4444; font-size: 0.8rem">Neg: ${[...new Set(negMatches)].join(', ')}</div>` : ''}
      </div>
    `;
  };

  const generateExtractiveSummary = (text) => {
    // Improved extractive summarization
    const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 20);
    if (sentences.length <= 3) return `<p>${text}</p>`;

    const words = text.toLowerCase().match(/\w+/g) || [];
    const stopWords = new Set(['the', 'is', 'at', 'which', 'on', 'and', 'a', 'an', 'of', 'for', 'in', 'with', 'to', 'this', 'that', 'it', 'was', 'as', 'are', 'but', 'by']);
    const frequencies = {};

    words.forEach(word => {
      if (!stopWords.has(word)) {
        frequencies[word] = (frequencies[word] || 0) + 1;
      }
    });

    const scoredSentences = sentences.map(sentence => {
      const sentenceWords = sentence.toLowerCase().match(/\w+/g) || [];
      let score = 0;
      sentenceWords.forEach(word => {
        if (frequencies[word]) score += frequencies[word];
      });
      // Normalize by length but penalize too short sentences
      return { sentence, score: score / (sentenceWords.length || 1) };
    });

    const countToSelect = Math.max(3, Math.ceil(sentences.length * 0.25));
    const topSentences = [...scoredSentences]
      .sort((a, b) => b.score - a.score)
      .slice(0, countToSelect)
      .sort((a, b) => scoredSentences.indexOf(a) - scoredSentences.indexOf(b));

    return `
      <p><b>Local AI Extractive Summary:</b></p>
      <ul style="margin-top: 10px; padding-left: 20px;">
        ${topSentences.map(s => `<li style="margin-bottom: 8px;">${s.sentence.trim()}.</li>`).join('')}
      </ul>
      <p style="font-size: 0.75rem; opacity: 0.5; margin-top: 15px; text-align: center;">
        <span class="material-icons" style="font-size: 0.9rem; vertical-align: middle;">offline_bolt</span>
        Processed locally using frequency-ranking algorithm
      </p>
    `;
  };

  return (
    <div className="tool-form">
      <div className="pill-group mb-20">
        <button className={`pill ${activeTab === 'summary' ? 'active' : ''}`} onClick={() => setActiveTab('summary')}>Summarizer</button>
        <button className={`pill ${activeTab === 'sentiment' ? 'active' : ''}`} onClick={() => setActiveTab('sentiment')}>Sentiment Analysis</button>
      </div>

      <div className="form-group">
        <label>Input Text</label>
        <textarea
          rows="10"
          placeholder="Paste text here for local AI analysis..."
          style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--on-surface)' }}
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </div>
      <button className="btn-primary" style={{ width: '100%' }} onClick={runAnalysis} disabled={loading}>
        {loading ? 'Processing Offline...' : `Run Local ${activeTab === 'summary' ? 'Summarizer' : 'Sentiment Analysis'}`}
      </button>

      {(loading || result) && (
        <div className="tool-result" style={{ marginTop: '1.5rem' }}>
          <div style={{ fontWeight: 600, marginBottom: '10px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-icons">auto_fix_high</span> Result
          </div>
          <div style={{ lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: loading ? '<i>Analyzing patterns and structure locally...</i>' : result }} />
        </div>
      )}
    </div>
  );
};

export default AiSummary;
