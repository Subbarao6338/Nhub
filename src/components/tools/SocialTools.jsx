import React, { useState, useEffect } from 'react';

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
  const [platform, setPlatform] = useState('instagram');

  // Link Builder state
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [username, setUsername] = useState('');
  const [builderPlatform, setBuilderPlatform] = useState('whatsapp');

  // Hashtag state
  const [category, setCategory] = useState('nature');

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
        <div className="pill-group" style={{ marginBottom: '20px', overflowX: 'auto', whiteSpace: 'nowrap', display: 'flex', flexWrap: 'nowrap' }}>
          <button className={`pill ${activeTab === 'downloader' ? 'active' : ''}`} onClick={() => setActiveTab('downloader')}>Media Downloader</button>
          <button className={`pill ${activeTab === 'builder' ? 'active' : ''}`} onClick={() => setActiveTab('builder')}>Link Builder</button>
          <button className={`pill ${activeTab === 'hashtags' ? 'active' : ''}`} onClick={() => setActiveTab('hashtags')}>Hashtag Gen</button>
        </div>
      )}

      {activeTab === 'downloader' && (
        <div style={{ display: 'grid', gap: '15px' }}>
          <div className="form-group">
            <label>Platform</label>
            <select value={platform} onChange={e => setPlatform(e.target.value)} className="pill" style={{ width: '100%' }}>
              <option value="instagram">Instagram</option>
              <option value="twitter">Twitter / X</option>
              <option value="threads">Threads</option>
              <option value="pinterest">Pinterest</option>
            </select>
          </div>
          <div className="form-group">
            <label>Profile or Post URL</label>
            <input type="text" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..." className="pill" style={{ width: '100%' }} />
          </div>
          <div className="tool-result" style={{ padding: '15px', fontSize: '0.9rem' }}>
            <p><strong>Instructions:</strong></p>
            {platform === 'instagram' && <p>To download all media from an Instagram profile, you can use browser extensions like "FastSave" or web services like "Instadp". Paste the URL here to keep track.</p>}
            {platform === 'twitter' && <p>For Twitter media, "Twitter Video Downloader" or "Gallery-dl" (CLI) are recommended for bulk downloads.</p>}
            {platform === 'threads' && <p>Threads media can be saved using "Threads Downloader" services.</p>}
            {platform === 'pinterest' && <p>For Pinterest boards, use "Pinterest Downloader" or Chrome extensions that allow bulk image saving.</p>}
            <button className="btn-primary" onClick={() => window.open(`https://www.google.com/search?q=${platform}+media+downloader+${encodeURIComponent(url)}`, '_blank')} style={{ width: '100%', marginTop: '10px' }}>Search for Downloader</button>
          </div>
        </div>
      )}

      {activeTab === 'builder' && (
        <div style={{ display: 'grid', gap: '15px' }}>
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
                <input type="text" value={phone} onChange={e => setPhone(e.target.value)} placeholder="e.g. 1234567890" className="pill" style={{ width: '100%' }} />
              </div>
              <div className="form-group">
                <label>Pre-filled Message</label>
                <input type="text" value={message} onChange={e => setMessage(e.target.value)} placeholder="Hello!" className="pill" style={{ width: '100%' }} />
              </div>
              <button className="btn-primary" onClick={() => handleCopy(generateWaLink())}>Copy WhatsApp Link</button>
            </>
          ) : (
            <>
              <div className="form-group">
                <label>Username</label>
                <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="@username" className="pill" style={{ width: '100%' }} />
              </div>
              <button className="btn-primary" onClick={() => handleCopy(generateTgLink())}>Copy Telegram Link</button>
            </>
          )}
        </div>
      )}

      {activeTab === 'hashtags' && (
        <div style={{ display: 'grid', gap: '15px' }}>
          <div className="form-group">
            <label>Category</label>
            <div className="pill-group" style={{ flexWrap: 'wrap' }}>
              {Object.keys(hashtags).map(cat => (
                <button key={cat} className={`pill ${category === cat ? 'active' : ''}`} onClick={() => setCategory(cat)} style={{ textTransform: 'capitalize' }}>{cat}</button>
              ))}
            </div>
          </div>
          <div className="tool-result" style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{ marginBottom: '15px', lineHeight: '1.6' }}>{hashtags[category]}</div>
            <button className="btn-primary" onClick={() => handleCopy(hashtags[category])}>Copy All</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialTools;
