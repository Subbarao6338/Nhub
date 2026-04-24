import React, { useState, useEffect } from 'react';
import API_BASE from '../../api';

const SocialTools = ({ toolId }) => {
  const [activeTab, setActiveTab] = useState('downloader');

  useEffect(() => {
    if (toolId) {
      if (toolId === 'whatsapp-link' || toolId === 'telegram-link') {
        setActiveTab('builder');
        setBuilderPlatform(toolId === 'whatsapp-link' ? 'whatsapp' : 'telegram');
      } else if (toolId === 'hashtag-gen') {
        setActiveTab('hashtags');
      } else {
        setActiveTab('downloader');
      }
    }
  }, [toolId]);

  // Downloader state
  const [url, setUrl] = useState('');
  const [limit, setLimit] = useState(5);
  const [isUnlimited, setIsUnlimited] = useState(false);
  const [downloadType, setDownloadType] = useState('auto');
  const [status, setStatus] = useState('idle'); // idle, downloading, error
  const [error, setError] = useState('');

  // Link Builder state
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [username, setUsername] = useState('');
  const [builderPlatform, setBuilderPlatform] = useState('whatsapp');

  // Hashtag state
  const [category, setCategory] = useState('nature');

  const handleDownload = async () => {
    setStatus('downloading');
    setError('');
    try {
      const response = await fetch(`${API_BASE}/social/download`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          limit: isUnlimited ? 0 : limit,
          download_type: downloadType
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Download failed');
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `social_media_${new Date().getTime()}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setStatus('idle');
    } catch (err) {
      console.error(err);
      setError(err.message);
      setStatus('error');
    }
  };

  const hashtags = {
    nature: "#nature #photography #naturephotography #love #landscape #travel #wildlife #outdoor #beautiful #naturelovers",
    tech: "#technology #tech #innovation #engineering #business #iphone #science #design #electronics #apple",
    travel: "#travel #nature #photography #travelphotography #love #instagood #travelgram #picoftheday #wanderlust #adventure",
    fitness: "#fitness #gym #workout #fit #fitnessmotivation #motivation #bodybuilding #training #health #lifestyle",
    food: "#food #foodporn #foodie #instafood #foodphotography #yummy #delicious #foodstagram #foodblogger #love"
  };

  const generateWaLink = () => {
    const cleanPhone = phone.replace(/\D/g, '');
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  const generateTgLink = () => {
    return `https://t.me/${username.replace('@', '')}`;
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  return (
    <div className="tool-form">
      {!toolId && (
        <div className="pill-group mb-20 scrollable-x">
          <button className={`pill ${activeTab === 'downloader' ? 'active' : ''}`} onClick={() => setActiveTab('downloader')}>Media Downloader</button>
          <button className={`pill ${activeTab === 'builder' ? 'active' : ''}`} onClick={() => setActiveTab('builder')}>Link Builder</button>
          <button className={`pill ${activeTab === 'hashtags' ? 'active' : ''}`} onClick={() => setActiveTab('hashtags')}>Hashtag Gen</button>
        </div>
      )}

      {activeTab === 'downloader' && (
        <div className="grid gap-15">
          <div className="form-group">
            <label>Video, Profile, or Playlist URL</label>
            <input
              type="text"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://youtube.com/... or https://instagram.com/..."
              className="pill w-full"
              disabled={status === 'downloading'}
            />
          </div>

          <div className="form-group">
            <label>Download Type</label>
            <select
              className="pill w-full"
              value={downloadType}
              onChange={e => setDownloadType(e.target.value)}
              disabled={status === 'downloading'}
            >
              <option value="auto">Auto (Best Quality / Media)</option>
              <option value="video">Video (With Audio)</option>
              <option value="audio">Audio Only (MP3/M4A)</option>
            </select>
          </div>

          <div className="form-group">
            <div className="flex-between mb-10">
              <label>Item Limit (Latest)</label>
              <label className="flex-center gap-5 font-semibold opacity-7 cursor-pointer" style={{ fontSize: '0.8rem' }}>
                <input
                  type="checkbox"
                  checked={isUnlimited}
                  onChange={e => setIsUnlimited(e.target.checked)}
                  disabled={status === 'downloading'}
                />
                Unlimited (Slow)
              </label>
            </div>
            {!isUnlimited && (
              <input
                type="number"
                value={limit}
                onChange={e => setLimit(parseInt(e.target.value) || 1)}
                min="1"
                max="500"
                className="pill w-full"
                disabled={status === 'downloading'}
              />
            )}
          </div>

          {status === 'downloading' ? (
            <div className="tool-result text-center p-20">
              <div className="spinner mb-10"></div>
              <p>Downloading and Zipping media...</p>
              <p className="opacity-7" style={{ fontSize: '0.8rem' }}>This may take a minute depending on the number of items.</p>
            </div>
          ) : (
            <button
              className="btn-primary w-full"
              onClick={handleDownload}
              disabled={!url}
            >
              Download Media ZIP
            </button>
          )}

          {status === 'error' && (
            <div className="tool-result p-10 font-semibold" style={{ color: 'var(--error)', border: '1px solid var(--error)', fontSize: '0.9rem' }}>
              {error}
            </div>
          )}

          <div className="tool-result p-15 opacity-8" style={{ fontSize: '0.85rem' }}>
            <p><strong>Note:</strong> Supports YouTube, Instagram, Twitter/X, Pinterest and more. Full profiles and playlists are supported. High limits or "Unlimited" may take significant time to process. Private content cannot be accessed.</p>
          </div>
        </div>
      )}

      {activeTab === 'builder' && (
        <div className="grid gap-15">
          <div className="form-group">
            <label>Platform</label>
            <div className="pill-group">
              <button className={`pill ${builderPlatform === 'whatsapp' ? 'active' : ''}`} onClick={() => setBuilderPlatform('whatsapp')}>WhatsApp</button>
              <button className={`pill ${builderPlatform === 'telegram' ? 'active' : ''}`} onClick={() => setBuilderPlatform('telegram')}>Telegram</button>
            </div>
          </div>
          {builderPlatform === 'whatsapp' ? (
            <>
              <div className="form-group">
                <label>Phone Number (with country code)</label>
                <input type="text" value={phone} onChange={e => setPhone(e.target.value)} placeholder="e.g. 1234567890" className="pill w-full" />
              </div>
              <div className="form-group">
                <label>Pre-filled Message</label>
                <input type="text" value={message} onChange={e => setMessage(e.target.value)} placeholder="Hello!" className="pill w-full" />
              </div>
              <button className="btn-primary" onClick={() => handleCopy(generateWaLink())}>Copy WhatsApp Link</button>
            </>
          ) : (
            <>
              <div className="form-group">
                <label>Username</label>
                <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="@username" className="pill w-full" />
              </div>
              <button className="btn-primary" onClick={() => handleCopy(generateTgLink())}>Copy Telegram Link</button>
            </>
          )}
        </div>
      )}

      {activeTab === 'hashtags' && (
        <div className="grid gap-15">
          <div className="form-group">
            <label>Category</label>
            <div className="pill-group flex-wrap">
              {Object.keys(hashtags).map(cat => (
                <button key={cat} className={`pill ${category === cat ? 'active' : ''}`} onClick={() => setCategory(cat)} style={{ textTransform: 'capitalize' }}>{cat}</button>
              ))}
            </div>
          </div>
          <div className="tool-result text-center p-20">
            <div className="mb-10 line-height-1-6">{hashtags[category]}</div>
            <button className="btn-primary" onClick={() => handleCopy(hashtags[category])}>Copy All</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialTools;
