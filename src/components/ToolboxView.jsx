import React, { useState, useEffect, useMemo, memo, lazy, Suspense } from 'react';
import { storage } from '../utils/storage';
import CategoryNav from './CategoryNav';
import NatureEmptyState from './NatureEmptyState';
import { highlightText } from '../utils/helpers';

// Consolidated Lazy Loaded Hubs
const PdfTools = lazy(() => import('./tools/PdfTools'));
const DocTools = lazy(() => import('./tools/DocTools'));
const AudioVideoTools = lazy(() => import('./tools/AudioVideoTools'));
const VideoTools = lazy(() => import('./tools/VideoTools'));
const ImageTools = lazy(() => import('./tools/ImageTools'));
const ColorTools = lazy(() => import('./tools/ColorTools'));
const NetworkTools = lazy(() => import('./tools/NetworkTools'));
const EducationTools = lazy(() => import('./tools/EducationTools'));
const GameTools = lazy(() => import('./tools/GameTools'));
const DeviceTools = lazy(() => import('./tools/DeviceTools'));
const DataTools = lazy(() => import('./tools/DataTools'));
const DateTimeTools = lazy(() => import('./tools/DateTimeTools'));
const DevTools = lazy(() => import('./tools/DevTools'));
const HealthTools = lazy(() => import('./tools/HealthTools'));
const TextTools = lazy(() => import('./tools/TextTools'));
const WebTools = lazy(() => import('./tools/WebTools'));
const PrivacySecurityTools = lazy(() => import('./tools/PrivacySecurityTools'));
const FinanceTools = lazy(() => import('./tools/FinanceTools'));
const WeatherTools = lazy(() => import('./tools/WeatherTools'));
const TravelTools = lazy(() => import('./tools/TravelTools'));
const UnitConverterTools = lazy(() => import('./tools/UnitConverterTools'));
const AiTools = lazy(() => import('./tools/AiTools'));

const TOOLS = [
    // Media & Docs
    { id: 'pdf-main', title: 'PDF Tools', icon: 'picture_as_pdf', category: 'Media', component: PdfTools, subTools: ['pdf-merge', 'pdf-split', 'pdf-delete', 'pdf-rearrange', 'pdf-rotate', 'pdf-sign', 'pdf-watermark', 'pdf-numbers', 'pdf-crop', 'pdf-lock', 'pdf-unlock', 'pdf-metadata', 'pdf-compress', 'pdf-grayscale', 'pdf-flatten', 'pdf-img2pdf', 'pdf-translate', 'img-to-pdf', 'pdf-to-img', 'word-to-pdf', 'excel-to-pdf', 'pdf-to-word', 'pdf-to-text', 'pdf-to-zip', 'pdf-extract', 'pdf-scan', 'ppt-to-pdf'] },
    { id: 'doc-main', title: 'Doc Tools', icon: 'description', category: 'Media', component: DocTools, subTools: ['md-editor'] },
    { id: 'img-main', title: 'Image Editor', icon: 'image', category: 'Media', component: ImageTools, subTools: ['img-format', 'img-resize', 'img-blur', 'img-meta', 'img-bw', 'img-sepia', 'img-invert', 'img-crop', 'img-filters', 'img-b64'] },
    { id: 'audio-main', title: 'Audio & Sounds', icon: 'volume_up', category: 'Media', component: AudioVideoTools, subTools: ['frequency-gen', 'metronome', 'tuner', 'nature-sounds', 'audio-recorder'] },
    { id: 'video-main', title: 'Camera Tools', icon: 'videocam', category: 'Media', component: VideoTools, subTools: ['magnifier', 'mirror'] },
    { id: 'color-main', title: 'Color Hub', icon: 'palette', category: 'Media', component: ColorTools, subTools: ['color-picker', 'color-conv', 'color-harm', 'color-blend', 'color-contrast'] },

    // Communication & Web
    { id: 'web-main', title: 'Web Utilities', icon: 'public', category: 'Web', component: WebTools, subTools: ['qr-gen', 'qr-scan', 'social-downloader', 'cookies', 'omni-hub', 'web-to-md', 'web-translate', 'web-mhtml', 'web-meta', 'web-url-parser'] },
    { id: 'network-main', title: 'Network Hub', icon: 'router', category: 'Web', component: NetworkTools, subTools: ['ip-info', 'ping', 'dns', 'whois', 'speed', 'geo', 'ssl', 'subnet', 'bluetooth'] },

    // Developer
    { id: 'dev-main', title: 'Developer Hub', icon: 'terminal', category: 'Developer', component: DevTools, subTools: ['json-formatter', 'jwt-decoder', 'cron-helper', 'sql-formatter', 'regex-tester', 'base64', 'diff-viewer', 'markdown-preview', 'uuid-gen', 'url-decode', 'yaml-json', 'minify', 'xml-json'] },

    // Math & Science
    { id: 'edu-main', title: 'Education Hub', icon: 'school', category: 'Education', component: EducationTools, subTools: ['periodic-table', 'unit-circle', 'physics-constants', 'scientific-calc', 'prime-factorizer'] },
    { id: 'data-main', title: 'Data Science', icon: 'insights', category: 'Data', component: DataTools, subTools: ['csv-viewer', 'data-visualizer', 'anomaly-detect', 'stat-calc', 'data-quality', 'data-profiling', 'data-anonymizer', 'json-csv', 'mock-gen'] },
    { id: 'unit-main', title: 'Unit Converter', icon: 'balance', category: 'Education', component: UnitConverterTools, subTools: ['length-conv', 'weight-conv', 'temp-conv', 'currency-conv', 'data-conv'] },

    // System & Tools
    { id: 'device-main', title: 'Device Hub', icon: 'memory', category: 'Sensors', component: DeviceTools, subTools: ['device-info', 'android-sensors', 'luxmeter', 'soundmeter', 'magnetic-tester', 'flashlight', 'vibrometer', 'ruler', 'level-pendulum', 'protractor', 'compass', 'gps-info', 'sos'] },
    { id: 'travel-main', title: 'Travel & Outdoor', icon: 'explore', category: 'Sensors', component: TravelTools, subTools: ['world-clock', 'timezone-conv', 'packing-list'] },
    { id: 'time-main', title: 'Date & Time', icon: 'schedule', category: 'Utility', component: DateTimeTools, subTools: ['age-calculator', 'timestamp-conv', 'stopwatch', 'pomodoro-timer', 'world-clock', 'timezone-conv', 'panchangam', 'date-diff', 'countdown'] },
    { id: 'finance-main', title: 'Finance Tools', icon: 'payments', category: 'Utility', component: FinanceTools, subTools: ['currency-conv', 'vat-calc', 'inflation', 'loan-calc', 'compound-int', 'cagr', 'dcf', 'tip-split', 'investment-calc'] },
    { id: 'health-main', title: 'Health Hub', icon: 'monitor_heart', category: 'Health', component: HealthTools, subTools: ['bmr-calc', 'bmi-calc', 'calorie-calc', 'water-tracker', 'sleep-calc', 'macro-calc'] },
    { id: 'game-main', title: 'Games Hub', icon: 'casino', category: 'Games', component: GameTools, subTools: ['dice-roller', 'heads-tails', 'snake-game', '2048', 'sudoku', 'tictactoe', 'dino-jump'] },
    { id: 'security-main', title: 'Privacy & Security', icon: 'security', category: 'Security', component: PrivacySecurityTools, subTools: ['password-gen', 'hash-gen', 'rsa-gen', 'hmac-calc', 'security-info', 'privacy-audit', 'password-strength', 'data-anonymizer', 'aes-encrypt'] },
    { id: 'weather-main', title: 'Weather', icon: 'filter_drama', category: 'Sensors', component: WeatherTools, subTools: ['weather-forecast'] },
    { id: 'text-main', title: 'Text Tools', icon: 'notes', category: 'Utility', component: TextTools, subTools: ['case-converter', 'word-counter', 'lorem-ipsum', 'text-cleaner', 'word-rank', 'text-to-speech'] },
    { id: 'ai-main', title: 'AI Hub', icon: 'psychology', category: 'Productivity', component: AiTools, subTools: ['ai-image-gen', 'ai-story-gen', 'ai-chat'] },
];

const ToolboxView = ({ searchQuery, groupToolbox, showStats, recentTools, setRecentTools, hideRecentTools }) => {
  const [activeToolId, setActiveToolId] = useState(null);
  const [activeSubtoolLabel, setActiveSubtoolLabel] = useState(null);
  const [currentResult, setCurrentResult] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [pinnedTools, setPinnedTools] = useState(storage.getJSON('hub_pinned_tools', []));
  const [collapsedCategories, setCollapsedCategories] = useState({});

  const stats = useMemo(() => {
    const s = {};
    TOOLS.forEach(t => {
      s[t.category] = (s[t.category] || 0) + 1;
    });
    return s;
  }, []);

  useEffect(() => { storage.setJSON('hub_pinned_tools', pinnedTools); }, [pinnedTools]);

  const toggleCategoryCollapse = (cat) => {
    setCollapsedCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const collapseAll = (cats) => {
    const newCollapsed = {};
    cats.forEach(cat => newCollapsed[cat] = true);
    setCollapsedCategories(newCollapsed);
  };

  const expandAll = () => {
    setCollapsedCategories({});
  };

  const togglePin = (e, id) => {
    e.stopPropagation();
    let newPinned = pinnedTools.includes(id) ? pinnedTools.filter(t => t !== id) : [id, ...pinnedTools];
    setPinnedTools(newPinned);
  };

  const openTool = (id, skipHistory = false) => {
    if (activeToolId === id) return;
    setActiveToolId(id);
    setActiveSubtoolLabel(null);
    setCurrentResult(null);
    if (TOOLS.find(t => t.id === id)) {
      const newRecents = [id, ...recentTools.filter(t => t !== id)].slice(0, 4);
      setRecentTools(newRecents);
      storage.setJSON('hub_recent_tools', newRecents);
    }
    if (!skipHistory) {
      const url = new URL(window.location);
      url.searchParams.set('tab', 'toolbox');
      url.searchParams.set('tool', id);
      window.history.pushState({ toolId: id, tab: 'toolbox' }, '', url.toString());
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const toolId = params.get('tool');
      if (params.get('tab') === 'toolbox' && toolId) setActiveToolId(toolId);
      else setActiveToolId(null);
    };
    window.addEventListener('popstate', handlePopState);
    const params = new URLSearchParams(window.location.search);
    const toolId = params.get('tool');
    if (toolId) setActiveToolId(toolId);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleShare = async (e, tool) => {
    e.stopPropagation();
    const url = window.location.origin + window.location.pathname + `?tab=toolbox&tool=${tool.id}`;
    if (navigator.share) { try { await navigator.share({ title: `Epic Toolbox - ${tool.title}`, url }); } catch (err) {} }
    else { navigator.clipboard.writeText(url); alert("Link copied!"); }
  };

  const filteredTools = useMemo(() => TOOLS.filter(t => {
    let matchesSearch = true, matchesCat = true;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (query.startsWith('cat:')) matchesCat = t.category.toLowerCase().includes(query.replace('cat:', '').trim());
      else {
          matchesSearch = t.title.toLowerCase().includes(query) ||
                         t.category.toLowerCase().includes(query) ||
                         t.subTools?.some(st => st.toLowerCase().includes(query));
      }
    }
    if (!searchQuery || !searchQuery.toLowerCase().startsWith('cat:')) {
      if (activeCategory === 'Pinned') matchesCat = pinnedTools.includes(t.id);
      else if (activeCategory !== 'All') matchesCat = t.category === activeCategory;
    }
    return matchesSearch && matchesCat;
  }).sort((a, b) => a.title.localeCompare(b.title)), [searchQuery, activeCategory, pinnedTools]);

  const toolboxCategories = useMemo(() => {
    const cats = {};
    [...new Set(TOOLS.map(t => t.category))].forEach(cat => {
        if (cat) cats[cat] = getCategoryIcon(cat);
    });
    return cats;
  }, []);

  const groupedTools = useMemo(() => {
    if (!groupToolbox || (activeCategory !== 'All' && !searchQuery)) return null;
    const grouped = {};
    filteredTools.forEach(t => {
      if (!grouped[t.category]) grouped[t.category] = [];
      grouped[t.category].push(t);
    });
    return grouped;
  }, [filteredTools, groupToolbox, activeCategory, searchQuery]);

  const handleCopyResult = () => {
    if (!currentResult?.text) return;
    navigator.clipboard.writeText(currentResult.text).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const downloadResult = async (format) => {
    if (!currentResult?.text) return;
    const { text, filename = 'result' } = currentResult;
    const baseName = filename.includes('.') ? filename.substring(0, filename.lastIndexOf('.')) : filename;

    if (format === 'txt') {
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = `${baseName}.txt`; a.click();
    } else if (format === 'md') {
        const blob = new Blob([`# ${baseName}\n\n${text}`], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = `${baseName}.md`; a.click();
    } else if (format === 'pdf') {
        const { jsPDF } = await import('jspdf');
        const doc = new jsPDF();
        const splitText = doc.splitTextToSize(text, 180);
        doc.text(splitText, 10, 10);
        doc.save(`${baseName}.pdf`);
    }
  };

  if (activeToolId) {
    let tool = TOOLS.find(t => t.id === activeToolId);
    let effectiveToolId = activeToolId;

    // If not found directly, check if it's a sub-tool of any hub
    if (!tool) {
        tool = TOOLS.find(t => t.subTools?.includes(activeToolId));
        // effectiveToolId remains the sub-tool ID so the hub can activate the correct tab
    }

    if (!tool) return <div className="text-center p-20"><button className="pill" onClick={() => setActiveToolId(null)}>Back</button><h2>Not Found</h2></div>;

    return (
      <div className="tool-view">
        <div className="tool-view-header">
          <div className="breadcrumb-nav">
              <div className="breadcrumb-item cursor-pointer" onClick={() => { setActiveToolId(null); window.history.back(); }}>
                  <span className="material-icons">home</span>
                  <span>Toolbox</span>
              </div>
              <span className="breadcrumb-separator material-icons">chevron_right</span>
              <div className={`breadcrumb-item ${!activeSubtoolLabel ? 'active' : ''}`} onClick={() => { if(activeSubtoolLabel) { setActiveSubtoolLabel(null); setActiveToolId(tool.id); } }}>
                  <span className="material-icons" style={{fontSize: '1.2rem'}}>{tool.icon}</span>
                  <span>{tool.title}</span>
              </div>
              {activeSubtoolLabel && (
                  <>
                      <span className="breadcrumb-separator material-icons">chevron_right</span>
                      <div className="breadcrumb-item active">
                          <span>{activeSubtoolLabel}</span>
                      </div>
                  </>
              )}
          </div>
          <div className="flex-center" style={{ gap: '10px' }}>
            {currentResult?.text && (
                <>
                    <button className={`icon-btn ${copySuccess ? 'copy-success' : ''}`} onClick={handleCopyResult} title="Copy Result">
                        <span className="material-icons">{copySuccess ? 'check' : 'content_copy'}</span>
                    </button>
                    <div className="dropdown-container">
                        <button className="icon-btn" title="Download Result"><span className="material-icons">download</span></button>
                        <div className="dropdown-menu">
                            <button onClick={() => downloadResult('txt')}>.TXT</button>
                            <button onClick={() => downloadResult('md')}>.MD</button>
                            <button onClick={() => downloadResult('pdf')}>.PDF</button>
                        </div>
                    </div>
                </>
            )}
          </div>
        </div>
        <div className="tool-container-inner">
          <Suspense fallback={<div className="text-center p-20 rotating">refresh</div>}>
            <tool.component onResultChange={setCurrentResult} toolId={effectiveToolId} onSubtoolChange={setActiveSubtoolLabel} />
          </Suspense>
        </div>
      </div>
    );
  }

  const cats = groupedTools ? Object.keys(groupedTools).sort() : [];

  return (
    <>
      <CategoryNav
        categories={toolboxCategories}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        showStats={showStats}
        stats={stats}
        totalCount={TOOLS.length}
        extraCategories={[{ name: 'Pinned', icon: 'push_pin', count: pinnedTools.length }]}
      />
      <div className="toolbox-page-header">
        <h2>Toolbox Hubs</h2>
        <p>All tools consolidated into unified categories.</p>

        {activeCategory === 'All' && !searchQuery && pinnedTools.length > 0 && (
          <div className="p-0-10 mb-20 text-left">
            <h3 className="uppercase tracking-wider opacity-6 mb-10 flex-center gap-10" style={{ fontSize: '0.9rem', justifyContent: 'flex-start' }}>
              <span className="material-icons" style={{ fontSize: '1.2rem' }}>push_pin</span> Pinned Hubs
            </h3>
            <div className="category-grid">
              {TOOLS.filter(t => pinnedTools.includes(t.id)).map((tool, idx) => (
                <ToolCard key={`pinned-${tool.id}`} tool={tool} idx={idx} isPinned={true} togglePin={togglePin} handleShare={handleShare} openTool={openTool} searchQuery={searchQuery} highlightText={highlightText} />
              ))}
            </div>
          </div>
        )}

        {groupedTools && cats.length > 0 && (
          <div className="pill-group" style={{justifyContent: 'center', marginTop: '1rem'}}>
            <button className="pill" onClick={() => collapseAll(cats)} style={{padding: '8px 16px', fontSize: '0.8rem'}}>
              <span className="material-icons" style={{fontSize: '1.1rem'}}>unfold_less</span> Collapse All
            </button>
            <button className="pill" onClick={expandAll} style={{padding: '8px 16px', fontSize: '0.8rem'}}>
              <span className="material-icons" style={{fontSize: '1.1rem'}}>unfold_more</span> Expand All
            </button>
          </div>
        )}
      </div>

      {!groupedTools ? (
        <div className="category-grid p-0-10">
          {filteredTools.map((tool, idx) => (
            <ToolCard key={tool.id} tool={tool} idx={idx} isPinned={pinnedTools.includes(tool.id)} togglePin={togglePin} handleShare={handleShare} openTool={openTool} searchQuery={searchQuery} highlightText={highlightText} />
          ))}
        </div>
      ) : (
        cats.map(cat => (
          <div key={cat} className={`category-section ${collapsedCategories[cat] ? 'collapsed' : ''}`}>
            <div className="category-header" onClick={() => toggleCategoryCollapse(cat)}>
              <div className="category-title">
                <span className="material-icons">{toolboxCategories[cat] || 'folder'}</span>
                {cat}
                {showStats && <span className="count">{groupedTools[cat].length}</span>}
              </div>
              <span className="material-icons expand-icon">expand_more</span>
            </div>
            <div className="category-grid">
              {groupedTools[cat].map((tool, idx) => (
                <ToolCard key={tool.id} tool={tool} idx={idx} isPinned={pinnedTools.includes(tool.id)} togglePin={togglePin} handleShare={handleShare} openTool={openTool} searchQuery={searchQuery} highlightText={highlightText} />
              ))}
            </div>
          </div>
        ))
      )}
    </>
  );
};

const ToolCard = memo(({ tool, idx, isPinned, togglePin, handleShare, openTool, searchQuery, highlightText }) => {
    const onKeyDown = React.useCallback(e => {
        if (e.key === 'Enter') openTool(tool.id);
    }, [openTool, tool.id]);

    return (
        <div id={`card-${tool.id}`} className="card" style={{'--delay': idx}} onClick={() => openTool(tool.id)} tabIndex="0" onKeyDown={onKeyDown}>
           <div className="card-actions">
                <button className={`pin-btn ${isPinned ? 'active' : ''}`} onClick={(e) => togglePin(e, tool.id)} aria-label={isPinned ? 'Unpin tool' : 'Pin tool'}>
                    <span className="material-icons">push_pin</span>
                </button>
                <button onClick={(e) => handleShare(e, tool)} aria-label="Share tool">
                    <span className="material-icons">share</span>
                </button>
           </div>
           <div className="card-header">
                <div className="card-icon flex-center" style={{ background: 'var(--bg)' }}><span className="material-icons">{tool.icon}</span></div>
                <div className="card-title" dangerouslySetInnerHTML={{ __html: highlightText(tool.title, searchQuery) }} />
            </div>
        </div>
    );
});

const getCategoryIcon = (cat) => {
    const icons = {
        'Productivity': 'assignment',
        'Creative': 'brush',
        'Media': 'perm_media',
        'Web': 'public',
        'Developer': 'terminal',
        'Data': 'insights',
        'Security': 'security',
        'Sensors': 'sensors',
        'Games': 'casino',
        'Education': 'school',
        'Utility': 'more_horiz',
        'Health': 'monitor_heart'
    };
    return icons[cat] || 'folder';
};

export default ToolboxView;
