import React, { useState } from 'react';
import ToolResult from '../ToolResult';

const SocialAudit = () => {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [data, setData] = useState(null);

    const runAudit = async () => {
        if (!url) return;
        setLoading(true);
        setData(null);
        setResult(null);
        try {
            const res = await fetch(`/api/social/info?url=${encodeURIComponent(url)}`);
            const json = await res.json();
            if (res.ok) {
                setData(json);
                setResult({ text: 'Media analysis complete.' });
            } else {
                throw new Error(json.detail || 'Audit failed. (Online backend required)');
            }
        } catch (e) {
            setResult({ error: e.message });
        } finally {
            setLoading(false);
        }
    };

    const formatDuration = (seconds) => {
        if (!seconds) return 'N/A';
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs > 0 ? hrs + ':' : ''}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="card p-30 glass-card text-center grid gap-15">
            <h3>Social Media Audit</h3>
            <p className="smallest opacity-6">Extract metadata, duration, and formats from social media URLs.</p>
            <input className="pill w-full" placeholder="Paste Video/Profile URL..." value={url} onChange={e=>setUrl(e.target.value)} />
            <button className="btn-primary w-full" onClick={runAudit} disabled={loading}>{loading ? 'Analyzing...' : 'Analyze Media'}</button>

            {data && (
                <div className="text-left mt-20 animate-fadeIn grid gap-15" style={{ background: 'var(--surface-solid)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border)' }}>
                    <div className="flex gap-20" style={{ display: 'flex', flexWrap: 'wrap' }}>
                        {data.thumbnail && (
                            <img src={data.thumbnail} alt="Thumbnail" style={{ width: '150px', height: '100px', borderRadius: '12px', objectFit: 'cover', background: 'var(--brand-bg-light)' }} />
                        )}
                        <div className="flex-column gap-5" style={{ flex: 1, minWidth: '200px' }}>
                            <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{data.title}</h4>
                            <div className="small opacity-7" style={{ marginTop: '5px' }}>
                                <span className="font-bold">{data.uploader}</span> • {formatDuration(data.duration)}
                            </div>
                            <div className="smallest opacity-5">ID: {data.id}</div>
                        </div>
                    </div>
                    {data.description && (
                        <div className="small opacity-8" style={{ maxHeight: '120px', overflowY: 'auto', background: 'var(--brand-bg-light)', padding: '12px', borderRadius: '12px', border: '1px solid var(--border)', whiteSpace: 'pre-wrap' }}>
                            {data.description}
                        </div>
                    )}
                </div>
            )}

            <ToolResult result={result} />
        </div>
    );
};

export default SocialAudit;
