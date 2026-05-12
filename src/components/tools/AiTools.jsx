import React, { useState, useEffect, useRef } from 'react';

const AiTools = ({ onResultChange, toolId, onSubtoolChange }) => {
  const [activeTab, setActiveTab] = useState('image-gen');
  const [input, setInput] = useState('');
  const [res, setRes] = useState('');
  const [loading, setLoading] = useState(false);
  const [chat, setChat] = useState([]);
  const [style, setStyle] = useState('natural');
  const [localSentiment, setLocalSentiment] = useState(null);

  useEffect(() => {
    const labels = {
      'image-gen': 'AI Image Gen',
      'text-gen': 'AI Story Gen',
      'chat': 'AI Chat Assistant',
      'local': 'Local AI Utilities'
    };
    if (onSubtoolChange) onSubtoolChange(labels[activeTab]);
  }, [activeTab]);

  const runLocalAnalysis = () => {
    const text = input.toLowerCase();
    const positive = ['good', 'great', 'awesome', 'amazing', 'happy', 'love', 'excellent', 'fantastic', 'wonderful', 'perfect', 'epic'];
    const negative = ['bad', 'terrible', 'awful', 'sad', 'hate', 'poor', 'worst', 'horrible', 'annoying', 'broken', 'failure'];

    let score = 0;
    positive.forEach(w => { if(text.includes(w)) score++; });
    negative.forEach(w => { if(text.includes(w)) score--; });

    setLocalSentiment(score > 0 ? 'Positive' : (score < 0 ? 'Negative' : 'Neutral'));
  };

  const generateImage = async () => {
    setLoading(true);
    try {
        const prompt = style === 'natural' ? input : `${input} in ${style} style`;
        const url = `https://pollinations.ai/p/${encodeURIComponent(prompt)}?width=512&height=512&seed=${Math.floor(Math.random()*1000)}&model=flux`;
        setRes(url);
        onResultChange({ text: `AI Image for: ${input} (${style})`, filename: 'ai_image.png', url });
    } catch (e) {
        setRes('AI Image generation failed.');
    } finally {
        setLoading(false);
    }
  };

  const generateText = async () => {
      setLoading(true);
      try {
          const response = await fetch('https://text.pollinations.ai/', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ messages: [{ role: 'user', content: `Write an epic short story about: ${input}` }] })
          });
          const data = await response.text();
          setRes(data);
          onResultChange({ text: data, filename: 'ai_story.txt' });
      } catch(e) { setRes('AI Text generation failed.'); }
      finally { setLoading(false); }
  };

  const sendMessage = async () => {
      if (!input.trim()) return;
      setLoading(true);
      const newChat = [...chat, { role: 'user', content: input }];
      setChat(newChat);
      const currentInput = input;
      setInput('');
      try {
          const response = await fetch('https://text.pollinations.ai/', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ messages: newChat })
          });
          if (!response.ok) throw new Error('API failed');
          const data = await response.text();
          setChat([...newChat, { role: 'assistant', content: data }]);
      } catch(e) {
          alert("Chat failed. Please try again.");
          setInput(currentInput);
          setChat(chat);
      } finally { setLoading(false); }
  };

  return (
    <div className="tool-form">
      <div className="pill-group mb-20 scrollable-x">
        <button className={`pill ${activeTab === 'image-gen' ? 'active' : ''}`} onClick={() => {setActiveTab('image-gen'); setRes('');}}>Image Gen</button>
        <button className={`pill ${activeTab === 'text-gen' ? 'active' : ''}`} onClick={() => {setActiveTab('text-gen'); setRes('');}}>Story Gen</button>
        <button className={`pill ${activeTab === 'chat' ? 'active' : ''}`} onClick={() => {setActiveTab('chat'); setRes('');}}>Chat</button>
        <button className={`pill ${activeTab === 'local' ? 'active' : ''}`} onClick={() => {setActiveTab('local'); setRes('');}}>Local Tools</button>
      </div>

      {activeTab === 'image-gen' && (
          <div className="pill-group mb-15 scrollable-x">
              {['natural', 'anime', 'cyberpunk', 'pixel-art', '3d-render', 'sketch', 'oil-painting', 'cinematic'].map(s => (
                  <button key={s} className={`pill ${style === s ? 'active' : ''}`} onClick={() => setStyle(s)} style={{fontSize: '0.75rem', padding: '6px 12px'}}>
                      {s.replace('-', ' ')}
                  </button>
              ))}
          </div>
      )}

      {activeTab === 'local' ? (
          <div className="card p-20 grid gap-15">
              <textarea className="pill w-full" rows="4" placeholder="Enter text for local analysis..." value={input} onChange={e=>setInput(e.target.value)} />
              <button className="btn-primary w-full" onClick={runLocalAnalysis}>Analyze Sentiment (Local)</button>
              {localSentiment && (
                  <div className="tool-result text-center">
                      Sentiment: <b className={localSentiment.toLowerCase()}>{localSentiment}</b>
                  </div>
              )}
          </div>
      ) : activeTab !== 'chat' ? (
          <>
            <div className="card p-20 grid gap-15">
                <textarea className="pill w-full" rows="3" placeholder="Enter prompt..." value={input} onChange={e=>setInput(e.target.value)} />
                <button className="btn-primary w-full" onClick={activeTab === 'image-gen' ? generateImage : generateText} disabled={loading || !input}>
                    {loading ? 'Generating...' : 'Generate with AI'}
                </button>
            </div>
            {res && (
                <div className="mt-20 card p-15 text-center overflow-hidden">
                    {activeTab === 'image-gen' ? (
                        <img src={res} alt="AI Gen" style={{ width: '100%', borderRadius: '12px' }} />
                    ) : (
                        <div className="text-left font-serif line-height-1.6 whitespace-pre-wrap">{res}</div>
                    )}
                </div>
            )}
          </>
      ) : (
          <div className="grid gap-15">
              <div className="card p-15 overflow-auto" style={{ maxHeight: '400px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {chat.length === 0 && <div className="text-center opacity-5">Ask me anything...</div>}
                  {chat.map((m, i) => (
                      <div key={i} className={`p-10 rounded-12 ${m.role === 'user' ? 'bg-primary color-white ml-20' : 'bg-surface border mr-20'}`}>
                          {m.content}
                      </div>
                  ))}
              </div>
              <div className="flex-gap">
                  <input className="pill flex-1" value={input} onChange={e=>setInput(e.target.value)} placeholder="Type a message..." onKeyDown={e=>e.key==='Enter' && sendMessage()} />
                  <button className="icon-btn" onClick={sendMessage} disabled={loading}><span className="material-icons">{loading ? 'refresh' : 'send'}</span></button>
              </div>
          </div>
      )}
    </div>
  );
};

export default AiTools;
