import React, { memo } from 'react';

const Header = memo(({ appName, currentProfile, profiles, setView, onSettingsClick, hideBookmarks, hideToolbox, currentTab, searchActive, children }) => {
  const profile = profiles.find(p => p.name === currentProfile) || { icon: 'inbox' };

  return (
    <header className={`top-bar glass-card ${searchActive ? 'search-active' : ''}`}>
      <div
        className={`logo-container ${searchActive ? 'mobile-hide' : ''}`}
        onClick={() => {
          if (hideBookmarks) setView('toolbox');
          else if (hideToolbox) setView('bookmarks');
          else setView(currentTab === 'bookmarks' ? 'toolbox' : 'bookmarks');
        }}
      >
        <div className="flex-center" style={{ background: 'var(--primary-glow)', padding: '10px', borderRadius: 'var(--radius-lg)' }}>
            <span className="material-icons app-logo" style={{ fontSize: '32px' }}>
              {currentProfile === 'Default' ? 'eco' : (profile.icon || 'person')}
            </span>
        </div>
        <h1 className="page-title" style={{ fontSize: '1.5rem', fontWeight: 900 }}>
          {(appName === 'Nature Hub' || !appName) ? (currentTab.charAt(0).toUpperCase() + currentTab.slice(1)) : appName}
        </h1>
      </div>
      <div className="top-actions">
        {children}
        <button id="settings-toggle" className="icon-btn" title="Settings" onClick={onSettingsClick}>
          <span className="material-icons">settings</span>
        </button>
      </div>
    </header>
  );
});

export default Header;
