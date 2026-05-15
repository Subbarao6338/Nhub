import React, { useState, useEffect, useRef } from 'react';
import API_BASE from '../../api';

const AiTools = ({ onResultChange, toolId, onSubtoolChange }) => {
  const [activeTab, setActiveTab] = useState('chat');

  useEffect(() => {
    if (toolId) {
      const mapping = { 'ai-chat': 'chat', 'ai-image': 'image-gen', 'ai-text': 'text-gen' };
      if (mapping[toolId]) setActiveTab(mapping[toolId]);
    }
  }, [toolId]);

  useEffect(() => {
    const labels = { 'image-gen': 'Image Generator', 'text-gen': 'Story Assistant', 'chat': 'Chat Assistant', 'local': 'Local Utilities' };
    if (onSubtoolChange) onSubtoolChange(labels[activeTab]);
  }, [activeTab]);

  return (
    <div className="tool-form">
      <div className="pill-group mb-20 scrollable-x" style={{justifyContent: 'center'}}>
        {['chat', 'image-gen', 'text-gen', 'local'].map(t => (
            <button key={t} className={`pill ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
                <span className="material-icons" style={{fontSize:'1.1rem'}}>{t==='chat'?'forum':t==='image-gen'?'palette':t==='text-gen'?'auto_stories':'analytics'}</span>
                {t.replace('-', ' ').replace('gen', 'Gen').charAt(0).toUpperCase() + t.slice(1).replace('-', ' ').replace('gen', 'Gen')}
            </button>
        ))}
      </div>

      <div className="hub-content animate-fadeIn">
        {activeTab === 'chat' && <AiChat onResultChange={onResultChange} />}
        {activeTab === 'image-gen' && <AiImageGen onResultChange={onResultChange} />}
        {activeTab === 'text-gen' && <AiTextGen onResultChange={onResultChange} />}
        {activeTab === 'local' && <AiLocalUtils onResultChange={onResultChange} />}
      </div>
    </div>
  );
};

const AiChat = () => {
    const [input, setInput] = useState('');
    const [chat, setChat] = useState(() => {
        const saved = localStorage.getItem('ai_chat_history');
        return saved ? JSON.parse(saved) : [];
    });
    const [loading, setLoading] = useState(false);
    const endRef = useRef(null);

    useEffect(() => {
        localStorage.setItem('ai_chat_history', JSON.stringify(chat.slice(-20)));
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chat]);

    const send = async () => {
        if (!input.trim() || loading) return;
        const newChat = [...chat, { role: 'user', content: input }];
        setChat(newChat); setInput(''); setLoading(true);
        try {
            const res = await fetch('https://text.pollinations.ai/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: newChat })
            });
            const text = await res.text();
            setChat([...newChat, { role: 'assistant', content: text }]);
        } catch(e) { alert("AI Chat failed."); }
        finally { setLoading(false); }
    };

    return (
        <div className="grid gap-15">
            <div className="card p-15 overflow-auto glass-card" style={{ height: '450px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {chat.length === 0 && <div className="m-auto text-center opacity-4"><span className="material-icons" style={{fontSize:'3rem'}}>chat_bubble_outline</span><br/>Start a conversation</div>}
                {chat.map((m, i) => (
                    <div key={i} className={`p-12 animate-slide-up ${m.role === 'user' ? 'bg-primary color-white' : 'bg-surface border'}`} style={{
                        borderRadius: m.role === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                        alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                        maxWidth: '85%',
                        boxShadow: 'var(--shadow-sm)',
                        fontSize: '0.95rem'
                    }}>{m.content}</div>
                ))}
                <div ref={endRef} />
            </div>
            <div className="flex-gap p-5 bg-surface border rounded-full shadow-md">
                <input className="pill flex-1 border-none" style={{background:'none'}} value={input} onChange={e=>setInput(e.target.value)} placeholder="Message AI Assistant..." onKeyDown={e=>e.key==='Enter'&&send()} />
                <button className="icon-btn btn-primary" onClick={send} disabled={loading} style={{width:'48px', height:'48px'}}><span className="material-icons">{loading?'sync':'send'}</span></button>
            </div>
            <button className="pill m-auto text-small opacity-5" onClick={() => { if(confirm('Clear history?')) setChat([]); }}>Clear Conversation</button>
        </div>
    );
};

const AiImageGen = ({ onResultChange }) => {
    const [prompt, setPrompt] = useState('');
    const [style, setStyle] = useState('natural');
    const [res, setRes] = useState('');
    const [loading, setLoading] = useState(false);

    const generate = async () => {
        setLoading(true);
        const finalPrompt = style === 'natural' ? prompt : `${prompt} in ${style} style, high quality, 8k`;
        const url = `https://pollinations.ai/p/${encodeURIComponent(finalPrompt)}?width=1024&height=1024&seed=${Math.floor(Math.random()*10000)}&model=flux`;
        setRes(url);
        onResultChange({ text: `Generated: ${prompt}`, url, filename: 'ai_image.png' });
        setLoading(false);
    };

    const styles = ['natural', 'anime', 'cyberpunk', 'cinematic', 'creative', 'pixel-art', '3d-render', 'sketch', 'oil-painting', 'fantasy'];

    return (
        <div className="grid gap-20">
            <div className="card p-20 grid gap-15 glass-card">
                <div className="form-group">
                    <label>Image Description</label>
                    <textarea className="pill w-full" rows="3" value={prompt} onChange={e=>setPrompt(e.target.value)} placeholder="Describe what you want to see..." />
                </div>
                <div className="pill-group scrollable-x">
                    {styles.map(s => <button key={s} className={`pill smallest capitalize ${style === s ? 'active' : ''}`} onClick={() => setStyle(s)}>{s.replace('-', ' ')}</button>)}
                </div>
                <button className="btn-primary w-full" onClick={generate} disabled={loading || !prompt}><span className="material-icons mr-10">{loading?'sync':'auto_awesome'}</span>{loading?'Generating...':'Create Image'}</button>
            </div>
            {res && (
                <div className="card p-10 text-center animate-fadeIn glass-card">
                    <img src={res} alt="AI Gen" style={{width:'100%', borderRadius:'20px', boxShadow:'var(--shadow-lg)'}} />
                    <div className="mt-15 opacity-6 smallest">Long press or right-click image to save.</div>
                </div>
            )}
        </div>
    );
};

const AiTextGen = ({ onResultChange }) => {
    const [q, setQ] = useState('');
    const [res, setRes] = useState('');
    const [loading, setLoading] = useState(false);

    const generate = async () => {
        setLoading(true);
        try {
            const r = await fetch('https://text.pollinations.ai/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: [{ role: 'user', content: `Write an epic creative story about: ${q}` }] })
            });
            const text = await r.text();
            setRes(text);
            onResultChange({ text, filename: 'ai_story.txt' });
        } catch(e) { alert("Failed"); }
        finally { setLoading(false); }
    };

    return (
        <div className="grid gap-20">
            <div className="card p-20 grid gap-15 glass-card">
                <textarea className="pill w-full" rows="4" value={q} onChange={e=>setQ(e.target.value)} placeholder="Story topic..." />
                <button className="btn-primary w-full" onClick={generate} disabled={loading || !q}>{loading?'Writing...':'Generate Story'}</button>
            </div>
            {res && <div className="card p-20 about-content glass-card"><div className="whitespace-pre-wrap">{res}</div></div>}
        </div>
    );
};

const AiLocalUtils = ({ onResultChange }) => {
    const [text, setText] = useState('');
    const [score, setScore] = useState(null);

    const analyze = () => {
        const t = text.toLowerCase();
        const pos = ['good', 'great', 'amazing', 'happy', 'love', 'excellent', 'fantastic', 'pro', 'stable', 'fast'];
        const neg = ['bad', 'slow', 'error', 'worst', 'poor', 'hate', 'terrible', 'failure', 'broken', 'bug'];
        let s = 0;
        pos.forEach(w => { if(t.includes(w)) s++; });
        neg.forEach(w => { if(t.includes(w)) s--; });
        const res = s > 0 ? 'Positive' : (s < 0 ? 'Negative' : 'Neutral');
        setScore(res);
        onResultChange({ text: `Sentiment: ${res}\nScore: ${s}` });
    };

    return (
        <div className="card p-20 grid gap-15 glass-card text-center">
            <textarea className="pill w-full" rows="4" value={text} onChange={e=>setText(e.target.value)} placeholder="Text to analyze..." />
            <button className="btn-primary" onClick={analyze}>Analyze Sentiment</button>
            {score && <div className="tool-result h2 font-bold color-primary">{score}</div>}
        </div>
    );
};

export default AiTools;
