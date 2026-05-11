import React from 'react';

const Header = ({ appName, currentProfile, profiles, setView, onSettingsClick, hideBookmarks, children }) => {
  const profile = profiles.find(p => p.name === currentProfile) || { icon: 'inbox' };

  return (
    <header className="top-bar">
      <div
        className="logo-container"
        onClick={() => setView(hideBookmarks ? 'toolbox' : 'bookmarks')}
      >
        <div className="flex-center" style={{ background: 'var(--primary-glow)', padding: '8px', borderRadius: 'var(--radius-md)' }}>
            <span className="material-icons app-logo" style={{ fontSize: '28px' }}>
              {currentProfile === 'Default' ? 'eco' : (profile.icon || 'person')}
            </span>
        </div>
        <h1 className="page-title" style={{ fontSize: '1.25rem' }}>{appName || 'Epic Toolbox'}</h1>
      </div>
      <div className="top-actions">
        {children}
        <button id="settings-toggle" className="icon-btn desktop-only" title="Settings" onClick={onSettingsClick}>
          <span className="material-icons">settings</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
