import React, { useState, useRef, memo } from 'react';

const TabBar = memo(({ currentTab, setTab, onAddClick, onBookmarksLongPress, onSettingsClick, onSearchClick, searchActive, enableProfiles, hideBookmarks, hideToolbox, showProjectsTab }) => {
  const [pressTimer, setPressTimer] = useState(null);
  const isLongPress = useRef(false);

  const startPress = () => {
    if (!enableProfiles) return;
    isLongPress.current = false;
    const timer = setTimeout(() => {
      isLongPress.current = true;
      if (onBookmarksLongPress) onBookmarksLongPress();
    }, 500);
    setPressTimer(timer);
  };

  const cancelPress = () => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      setPressTimer(null);
    }
  };

  const handleBookmarksClick = () => {
    if (isLongPress.current) {
      isLongPress.current = false;
      return;
    }
    if ('vibrate' in navigator) navigator.vibrate([10, 5, 10]);
    setTab('bookmarks');
  };

  const handleTabClick = (tab) => {
    if ('vibrate' in navigator) navigator.vibrate([10, 5, 10]);
    setTab(tab);
  };

  return (
    <nav className="tab-bar">
      <div className="tab-group glass-card">
        {!hideToolbox && (
          <div
            id="tab-toolbox"
            className={`tab-item ${currentTab === 'toolbox' ? 'active' : ''}`}
            onClick={() => handleTabClick('toolbox')}
            title="Toolbox"
          >
            <span className="material-icons-outlined">handyman</span>
            <span className="tab-name desktop-only">Toolbox</span>
          </div>
        )}

        {!hideBookmarks && (
          <div
            id="tab-bookmarks"
            className={`tab-item ${currentTab === 'bookmarks' ? 'active' : ''}`}
            onClick={handleBookmarksClick}
            onMouseDown={startPress}
            onMouseUp={cancelPress}
            onMouseLeave={cancelPress}
            onTouchStart={startPress}
            onTouchEnd={cancelPress}
            onContextMenu={(e) => e.preventDefault()}
            title="Bookmarks"
          >
            <span className="material-icons-outlined">bookmarks</span>
            <span className="tab-name desktop-only">Bookmarks</span>
          </div>
        )}

        {showProjectsTab && (
          <div
            id="tab-projects"
            className={`tab-item ${currentTab === 'projects' ? 'active' : ''}`}
            onClick={() => handleTabClick('projects')}
            title="Projects"
          >
            <span className="material-icons-outlined">architecture</span>
            <span className="tab-name desktop-only">Projects</span>
          </div>
        )}

        <div
          id="tab-search"
          className={`tab-item ${searchActive ? 'active' : ''}`}
          onClick={onSearchClick}
          title="Search"
        >
          <span className="material-icons-outlined">search</span>
          <span className="tab-name desktop-only">Search</span>
        </div>

        <div
          className="tab-item"
          onClick={onSettingsClick}
          title="Settings"
        >
          <span className="material-icons-outlined">settings</span>
          <span className="tab-name desktop-only">Settings</span>
        </div>
      </div>
    </nav>
  );
});

export default TabBar;
