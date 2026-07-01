import React, { useState } from 'react';
import ToolResult from '../ToolResult';

const AiLocal = () => {
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [sentiment, setSentiment] = useState(null);
    const [toolResult, setToolResult] = useState(null);

    const runAnalysis = async () => {
        if (!input.trim()) return;
        setLoading(true);
        try {
            // Expanded offline sentiment dictionary
            const positiveWords = [
                'good', 'great', 'awesome', 'happy', 'excellent', 'love', 'amazing', 'best',
                'wonderful', 'fantastic', 'perfect', 'brilliant', 'glad', 'joy', 'excited',
                'pleased', 'satisfied', 'thanks', 'thank', 'beautiful', 'nice', 'cool',
                'superb', 'outstanding', 'impressive', 'lovely', 'fabulous', 'terrific'
            ];
            const negativeWords = [
                'bad', 'awful', 'sad', 'hate', 'terrible', 'worst', 'poor', 'stupid',
                'disappointed', 'angry', 'annoyed', 'horrible', 'miserable', 'nasty',
                'useless', 'broken', 'failure', 'sucks', 'boring', 'weird', 'wrong',
                'difficult', 'hard', 'painful', 'scary', 'ugly', 'unhappy', 'rubbish'
            ];
            const negations = ['not', 'no', 'never', 'neither', 'none', "can't", "don't", "won't", "isn't", "wasn't", "couldn't"];

            const tokens = input.toLowerCase().split(/\s+/).map(t => t.replace(/[^a-z']/g, ''));
            let score = 0;
            let isNegated = false;

            tokens.forEach((token, index) => {
                if (negations.includes(token)) {
                    isNegated = true;
                    return;
                }

                let currentScore = 0;
                if (positiveWords.includes(token)) currentScore = 1;
                else if (negativeWords.includes(token)) currentScore = -1;

                if (currentScore !== 0) {
                    if (isNegated) {
                        score -= currentScore;
                        isNegated = false; // Reset negation after applying to one word
                    } else {
                        score += currentScore;
                    }
                }

                // Reset negation if it was set but didn't apply to a sentiment word (very basic logic)
                if (isNegated && !positiveWords.includes(token) && !negativeWords.includes(token) && token.length > 0) {
                    // if we have multiple words after negation, we might want to keep it or clear it.
                    // For this simple version, we clear it if it's not immediately preceding.
                }
            });

            const result = score > 0.5 ? 'Positive' : score < -0.5 ? 'Negative' : 'Neutral';
            setSentiment(result);
            setToolResult({
                text: `Sentiment Analysis Result:\nSentiment: ${result} (Score: ${score})\nText: ${input.substring(0, 100)}${input.length > 100 ? '...' : ''}`
            });
        } catch (e) {
            setSentiment('Neutral');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card p-20 grid gap-15 glass-card">
            <h3 className="text-center">Local Sentiment Analysis</h3>
            <p className="smallest opacity-6 text-center">Privacy-first sentiment detection using local dictionary and negation handling.</p>
            <div className="form-group">
                <label>Text for Local Analysis</label>
                <textarea
                    className="pill w-full font-mono"
                    rows="4"
                    placeholder="e.g. 'This is not a bad tool, I actually love it!'"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                />
            </div>
            <button className="btn-primary w-full" onClick={runAnalysis} disabled={loading}>
                <span className="material-icons mr-10">{loading ? 'sync' : 'analytics'}</span>
                {loading ? 'Analyzing...' : 'Analyze Sentiment'}
            </button>
            {sentiment && (
                <div className="tool-result text-center mt-10">
                    <span className="smallest uppercase opacity-6 block">Detected Sentiment</span>
                    <b className={sentiment.toLowerCase()} style={{ fontSize: '1.2rem', color: sentiment === 'Positive' ? 'var(--success)' : sentiment === 'Negative' ? 'var(--error)' : 'inherit' }}>
                        {sentiment}
                    </b>
                </div>
            )}
            <ToolResult result={toolResult} />
        </div>
    );
};

export default AiLocal;
