import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import CategoryNav from './CategoryNav';
import EmptyState from './EmptyState';
import API_BASE from '../api';
import { highlightText } from '../utils/helpers';

const BookmarksView = ({ profileId, searchQuery, onEdit, onDelete, onPin, refreshTrigger, hideUrls, hideIcons, showStats, openInNewTab }) => {
  const [links, setLinks] = useState([]);
  const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);
  const [selectedLinkForUrls, setSelectedLinkForUrls] = useState(null);
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
  const [copiedId, setCopiedId] = useState(null);

  const handleLongPress = (link, coords) => {
    setSelectedLinkForUrls(link);
    setModalPosition(coords || { x: window.innerWidth / 2, y: window.innerHeight / 2 });
    setIsUrlModalOpen(true);
  };

  const handleShare = async (link) => {
    if (navigator.share) {
      try {
        await navigator.share({ title: link.title, url: link.url });
      } catch (err) { console.error("Share failed:", err); }
    } else {
      navigator.clipboard.writeText(`${link.title}: ${link.url}`);
      alert("Link copied to clipboard!");
    }
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };
  const [categories, setCategories] = useState({});
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [collapsedCategories, setCollapsedCategories] = useState({});
  const prevProfileIdRef = React.useRef(profileId);

  useEffect(() => {
    if (!profileId) return;
    const isProfileChange = prevProfileIdRef.current !== profileId;
    prevProfileIdRef.current = profileId;

    setLoading(true);
    Promise.all([
      fetch(`${API_BASE}/links?profile_id=${profileId}`).then(res => res.json()),
      fetch(`${API_BASE}/categories?profile_id=${profileId}`).then(res => res.json())
    ]).then(([linksData, catsData]) => {
      setLinks(Array.isArray(linksData) ? linksData : []);
      const catsMap = {};
      if (Array.isArray(catsData)) {
        catsData.forEach(c => catsMap[c.name] = c.icon);
      }
      setCategories(catsMap);
      setLoading(false);
      if (isProfileChange) {
        setActiveCategory('All');
      }
    }).catch(err => {
      console.error("Failed to fetch bookmarks:", err);
      setLoading(false);
      setLinks(null); // Set to null to indicate error
      setCategories({});
    });
  }, [profileId, refreshTrigger]);

  const currentLinks = Array.isArray(links) ? links : [];
  const filteredLinks = currentLinks.filter(l => {
    if (l.is_internal) return false;

    let matchesSearch = true;
    let matchesCat = true;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (query.startsWith('cat:')) {
        const catQuery = query.replace('cat:', '').trim();
        matchesCat = l.category.toLowerCase().includes(catQuery);
        matchesSearch = true; // category match is the search match
      } else {
        matchesSearch = l.title.toLowerCase().includes(query) ||
          l.category.toLowerCase().includes(query) ||
          l.url.toLowerCase().includes(query) ||
          (l.urls && l.urls.some(u => u.toLowerCase().includes(query)));
      }
    }

    if (!searchQuery || !searchQuery.toLowerCase().startsWith('cat:')) {
      if (activeCategory === 'Pinned') matchesCat = l.is_pinned;
      else if (activeCategory !== 'All') matchesCat = l.category === activeCategory;
    }

    return matchesSearch && matchesCat;
  });

  const grouped = {};
  filteredLinks.forEach(l => {
    (grouped[l.category] || (grouped[l.category] = [])).push(l);
  });

  // Sort bookmarks within each category: Pinned first
  Object.keys(grouped).forEach(cat => {
    grouped[cat].sort((a, b) => {
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      return a.title.localeCompare(b.title);
    });
  });

  const cats = Object.keys(grouped).sort();

  const toggleCategoryCollapse = (cat) => {
    setCollapsedCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const collapseAll = () => {
    const newCollapsed = {};
    cats.forEach(cat => newCollapsed[cat] = true);
    setCollapsedCategories(newCollapsed);
  };

  const expandAll = () => {
    setCollapsedCategories({});
  };

  const stats = {};
  const visibleCategories = {};
  currentLinks.forEach(l => {
    if (l.is_internal) return;
    stats[l.category] = (stats[l.category] || 0) + 1;
    visibleCategories[l.category] = categories[l.category] || 'folder';
  });
  const totalCount = Object.values(stats).reduce((a, b) => a + b, 0);
  const pinnedCount = currentLinks.filter(l => l.is_pinned).length;

  if (loading) return (
    <div style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '2rem', overflowX: 'auto' }}>
            {[1,2,3,4,5].map(i => <div key={i} className="skeleton" style={{ width: '100px', height: '40px', borderRadius: '20px', flexShrink: 0 }} />)}
        </div>
        <div className="category-grid">
            {[1,2,3,4,5,6].map(i => (
                <div key={i} className="card skeleton" style={{ height: '120px' }}></div>
            ))}
        </div>
        <style>{`
            .skeleton {
                background: linear-gradient(90deg, var(--surface) 25%, var(--border) 50%, var(--surface) 75%);
                background-size: 200% 100%;
                animation: skeleton-loading 1.5s infinite;
            }
            @keyframes skeleton-loading {
                0% { background-position: 200% 0; }
                100% { background-position: -200% 0; }
            }
        `}</style>
    </div>
  );

  if (links === null) return (
    <div style={{textAlign:'center', padding:'3rem'}}>
      <span className="material-icons" style={{fontSize: '3rem', color: 'var(--danger)', marginBottom: '1rem'}}>error_outline</span>
      <h3 style={{marginBottom: '0.5rem'}}>Failed to load bookmarks</h3>
      <p style={{opacity: 0.7, marginBottom: '1rem'}}>Could not connect to the server.</p>
      <div style={{background: 'var(--surface)', padding: '1rem', borderRadius: '12px', fontSize: '0.8rem', marginBottom: '1.5rem', wordBreak: 'break-all', textAlign: 'left'}}>
        <strong>API Base:</strong> {API_BASE}
      </div>
      <button className="btn-primary" onClick={() => window.location.reload()}>
        <span className="material-icons" style={{fontSize: '1.1rem', verticalAlign: 'middle', marginRight: '4px'}}>refresh</span>
        Retry
      </button>
    </div>
  );

  if (!profileId) return (
    <div style={{textAlign:'center', padding:'3rem', opacity:0.5}}>
      <p>No profile selected.</p>
      <button className="btn-primary" style={{marginTop: '1rem'}} onClick={() => window.location.reload()}>Retry</button>
    </div>
  );

  const copyAllUrls = () => {
    if (!selectedLinkForUrls) return;
    const allUrls = selectedLinkForUrls.urls || [selectedLinkForUrls.url];
    navigator.clipboard.writeText(allUrls.join('\n'));
    alert("All URLs copied to clipboard!");
  };

  const getModalStyle = () => {
    if (window.innerWidth <= 768) return { display: 'block' }; // Center on mobile

    const modalWidth = 500;
    const padding = 20;
    let left = modalPosition.x;
    let top = modalPosition.y;

    // Boundary checks for width
    if (left + modalWidth > window.innerWidth) {
      left = window.innerWidth - modalWidth - padding;
    }

    // Rough boundary check for height (assuming max-height is 90vh)
    const estimatedMaxHeight = window.innerHeight * 0.8;
    if (top + estimatedMaxHeight > window.innerHeight) {
      top = window.innerHeight - estimatedMaxHeight - padding;
    }

    if (left < padding) left = padding;
    if (top < padding) top = padding;

    return {
      display: 'block',
      position: 'fixed',
      left: `${left}px`,
      top: `${top}px`,
      transform: 'none',
      margin: 0,
      maxWidth: `${modalWidth}px`,
      maxHeight: '90vh'
    };
  };

  return (
    <>
      {isUrlModalOpen && selectedLinkForUrls && createPortal(
        <>
          <div className="modal-overlay" style={{display: 'block'}} onClick={() => { setIsUrlModalOpen(false); }}></div>
          <div className="modal modal-multi-url" style={getModalStyle()}>
            <div className="modal-header-flex">
              <h2>Multiple URLs</h2>
              <button className="icon-btn" onClick={() => setIsUrlModalOpen(false)}>
                <span className="material-icons">close</span>
              </button>
            </div>
            <p className="modal-subtitle">
              Select a URL to open from "<strong>{selectedLinkForUrls.title}</strong>"
            </p>
            <div className="url-list">
              {(selectedLinkForUrls.urls || [selectedLinkForUrls.url]).map((url, i) => (
                <div key={i} className="url-btn-row">
                  <a href={url} target={openInNewTab ? '_blank' : '_self'} className="url-btn" onClick={() => setIsUrlModalOpen(false)}>
                    <span className="material-icons url-btn-icon">link</span>
                    <span className="url-btn-content">{url}</span>
                    <span className="material-icons url-btn-arrow">open_in_new</span>
                  </a>
                  <button className="icon-btn" onClick={() => handleCopy(i, url)} title="Copy URL">
                    <span className="material-icons">{copiedId === i ? 'check' : 'content_copy'}</span>
                  </button>
                </div>
              ))}
            </div>
            <div className="modal-footer-actions">
              <button type="button" className="pill copy-all-btn" onClick={copyAllUrls}>
                <span className="material-icons">content_copy</span> Copy All URLs
              </button>
              <button type="button" className="dismiss-btn" onClick={() => { setIsUrlModalOpen(false); }}>Dismiss</button>
            </div>
          </div>
        </>,
        document.body
      )}

      <CategoryNav
        categories={visibleCategories}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        showStats={showStats}
        stats={stats}
        totalCount={totalCount}
        extraCategories={[
          { name: 'Pinned', icon: 'push_pin', count: pinnedCount }
        ]}
      />

      <div className="toolbox-page-header">
        <h2>Bookmarks</h2>
        <p>Access your favorite links and resources.</p>

        {activeCategory === 'All' && !searchQuery && pinnedCount > 0 && (
          <div className="p-0-10 mb-20 text-left">
            <h3 className="uppercase tracking-wider opacity-6 mb-10 flex-center gap-10" style={{ fontSize: '0.9rem', justifyContent: 'flex-start' }}>
              <span className="material-icons" style={{ fontSize: '1.2rem' }}>push_pin</span> Pinned Bookmarks
            </h3>
            <div className="category-grid">
              {currentLinks.filter(l => l.is_pinned).map((link, idx) => (
                <BookmarkCard
                  key={`pinned-${link.id}`}
                  link={link}
                  idx={idx}
                  openInNewTab={openInNewTab}
                  onPin={onPin}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  handleShare={handleShare}
                  handleCopy={handleCopy}
                  isCopied={copiedId === link.id}
                  onLongPress={(coords) => handleLongPress(link, coords)}
                  categoryIcon={categories[link.category]}
                  hideIcons={hideIcons}
                  hideUrls={hideUrls}
                  searchQuery={searchQuery}
                  noAnimation={!!searchQuery}
                />
              ))}
            </div>
          </div>
        )}

        {cats.length > 0 && (
          <div className="pill-group" style={{justifyContent: 'center', marginTop: '1rem'}}>
            <button className="pill" onClick={collapseAll} style={{padding: '8px 16px', fontSize: '0.8rem'}}>
              <span className="material-icons" style={{fontSize: '1.1rem'}}>unfold_less</span> Collapse All
            </button>
            <button className="pill" onClick={expandAll} style={{padding: '8px 16px', fontSize: '0.8rem'}}>
              <span className="material-icons" style={{fontSize: '1.1rem'}}>unfold_more</span> Expand All
            </button>
          </div>
        )}
      </div>

      {cats.length === 0 ? (
    <EmptyState
      title={searchQuery ? "No matching bookmarks" : "No bookmarks here yet"}
      body={searchQuery ? `We couldn't find any bookmarks matching "${searchQuery}".` : "Start by adding some of your favorite links!"}
    />
      ) : (
        cats.map(cat => (
          <div key={cat} className={`category-section ${collapsedCategories[cat] ? 'collapsed' : ''}`}>
            <div className="category-header" onClick={() => toggleCategoryCollapse(cat)}>
              <div className="category-title">
                <span className="material-icons">{categories[cat] || 'folder'}</span>
                {cat}
                {showStats && <span className="count">{grouped[cat].length}</span>}
              </div>
              <span className="material-icons expand-icon">expand_more</span>
            </div>
            <div className="category-grid">
              {grouped[cat].map((link, idx) => (
                <BookmarkCard
                  key={link.id}
                  link={link}
                  idx={idx}
                  openInNewTab={openInNewTab}
                  onPin={onPin}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  handleShare={handleShare}
                  handleCopy={handleCopy}
                  isCopied={copiedId === link.id}
                  onLongPress={(coords) => handleLongPress(link, coords)}
                  categoryIcon={categories[cat]}
                  hideIcons={hideIcons}
                  hideUrls={hideUrls}
                  searchQuery={searchQuery}
                  noAnimation={!!searchQuery}
                />
              ))}
            </div>
          </div>
        ))
      )}
    </>
  );
};

const BookmarkCard = ({ link, idx, openInNewTab, onPin, onEdit, onDelete, handleShare, handleCopy, isCopied, onLongPress, categoryIcon, hideIcons, hideUrls, searchQuery, noAnimation }) => {
  const pressTimer = React.useRef(null);
  const [isPressing, setIsPressing] = useState(false);
  const isLongPressActive = React.useRef(false);
  const cardRef = React.useRef(null);

  const startPress = (e) => {
    const coords = {
      x: e.clientX || (e.touches ? e.touches[0].clientX : 0),
      y: e.clientY || (e.touches ? e.touches[0].clientY : 0)
    };
    isLongPressActive.current = false;
    setIsPressing(true);
    pressTimer.current = setTimeout(() => {
      isLongPressActive.current = true;
      if (link.urls && link.urls.length > 1) {
        onLongPress(coords);
        setIsPressing(false); // Snap back when modal opens
      }
    }, 400); // 400ms for better responsiveness
  };

  const cancelPress = () => {
    setIsPressing(false);
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  };

  const handleClick = (e) => {
    if (isLongPressActive.current) {
      isLongPressActive.current = false;
      return;
    }
    window.open(link.url, openInNewTab ? '_blank' : '_self');
  };

  const handleContextMenu = (e) => {
    if (link.urls && link.urls.length > 1) {
        e.preventDefault(); // Prevent native context menu to avoid collision
    }
  };

  let hostname = '';
  try {
    hostname = new URL(link.url.startsWith('http') ? link.url : 'http://' + link.url).hostname;
  } catch (e) {
    hostname = 'invalid-url';
  }

  return (
    <div
      ref={cardRef}
      className={`card ${noAnimation ? 'no-animation' : ''} ${isPressing ? 'is-pressing' : ''}`}
      style={{'--delay': idx}}
      onClick={handleClick}
      onMouseDown={startPress}
      onMouseUp={cancelPress}
      onMouseLeave={cancelPress}
      onTouchStart={startPress}
      onTouchEnd={cancelPress}
      onTouchMove={cancelPress}
      onContextMenu={handleContextMenu}
    >
      {link.urls && link.urls.length > 1 && (
        <span className="fallback-badge card-badge-top" title="Long-press to see all URLs">
          <span className="material-icons">layers</span>
          {link.urls.length}
        </span>
      )}
      <div className="card-header">
        {!hideIcons && <BookmarkIcon link={link} categoryIcon={categoryIcon || 'link'} />}
        <div className="card-title" dangerouslySetInnerHTML={{ __html: highlightText(link.title, searchQuery) }} />
      </div>
      {!hideUrls && (
        <div className="card-url">
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{hostname}</span>
        </div>
      )}
      <div className="card-actions" onClick={e => e.stopPropagation()}>
        <button className={`pin-btn ${link.is_pinned ? 'active' : ''}`} onClick={() => onPin(link)} title={link.is_pinned ? 'Unpin' : 'Pin to Top'}>
          <span className="material-icons">push_pin</span>
        </button>
        <button onClick={() => handleShare(link)} title="Share Bookmark">
          <span className="material-icons">share</span>
        </button>
        <button onClick={() => handleCopy(link.id, link.url)} title="Copy URL">
          <span className="material-icons" style={{color: isCopied ? 'var(--accent-green)' : 'inherit'}}>
            {isCopied ? 'check' : 'content_copy'}
          </span>
        </button>
        <button onClick={() => onEdit(link)} title="Edit">
          <span className="material-icons">edit</span>
        </button>
        <button className="btn-delete" onClick={() => onDelete(link.id)} title="Delete">
          <span className="material-icons">delete</span>
        </button>
      </div>
    </div>
  );
};

const BookmarkIcon = ({ link, categoryIcon }) => {
  const getHostname = (url) => {
    try {
      return new URL(url.startsWith('http') ? url : 'http://' + url).hostname;
    } catch (e) {
      return '';
    }
  };

  const [src, setSrc] = useState(link.icon || `https://www.google.com/s2/favicons?domain=${getHostname(link.url)}&sz=64`);
  const [errorCount, setErrorCount] = useState(0);

  const handleError = () => {
    if (errorCount === 0 && link.optional_icon) {
      setSrc(link.optional_icon);
    } else if (errorCount === 1) {
      const hostname = getHostname(link.url);
      setSrc(hostname ? `https://icons.duckduckgo.com/ip3/${hostname}.ico` : null);
    } else {
      setSrc(null); // Will render fallback
    }
    setErrorCount(errorCount + 1);
  };

  if (!src) return <div className="card-icon" style={{display:'grid', placeItems:'center', background:'var(--bg)'}}><span className="material-icons">{categoryIcon}</span></div>;

  if (src.length < 5 && !src.includes('/') && !src.includes('.')) {
    // Likely emoji or material icon name
    const isMaterialIcon = /^[a-z0-9_]+$/.test(src);
    return (
      <div className="card-icon" style={{display:'grid', placeItems:'center', background:'var(--bg)', fontSize: isMaterialIcon ? 'inherit' : '24px'}}>
        {isMaterialIcon ? <span className="material-icons">{src}</span> : src}
      </div>
    );
  }

  return <img src={src} className="card-icon" loading="lazy" onError={handleError} alt="" />;
};

export default BookmarksView;
