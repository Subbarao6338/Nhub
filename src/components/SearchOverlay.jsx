import React from 'react';

const SearchOverlay = ({ active, setActive, query, onChange, onClear, currentTab }) => {
  const getPlaceholder = () => {
    if (query.startsWith('cat:')) return 'Filtering by category...';
    return `Search ${currentTab.charAt(0).toUpperCase() + currentTab.slice(1)}... [/]`;
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && query.trim()) {
        // Implementation for "Search First Result" could go here if desired
    }
  };

  return (
    <div className={`search-container ${active ? 'active' : 'desktop-only'}`} style={{position: 'relative'}}>
      <span className="material-icons search-icon">search</span>
      <input
        type="search"
        id="search"
        placeholder={getPlaceholder()}
        onKeyDown={handleKeyDown}
        value={query}
        onChange={(e) => onChange(e.target.value)}
        onFocus={(e) => {
          e.target.select();
          if (setActive) setActive(true);
        }}
      />
      {!query && (
          <div className="search-hint desktop-only" style={{position: 'absolute', right: '15px', opacity: 0.3, pointerEvents: 'none', fontSize: '0.7rem', fontWeight: 800}}>
              TRY "cat:dev"
          </div>
      )}
      {query && (
        <button id="search-clear" className="search-clear-btn" title="Clear Search" onClick={onClear}>
          <span className="material-icons">close</span>
        </button>
      )}
    </div>
  );
};

export default SearchOverlay;
