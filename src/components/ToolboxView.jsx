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

const TOOLS = [
    // Media & Docs
    { id: 'pdf-main', title: 'PDF Tools', icon: 'picture_as_pdf', category: 'Media', component: PdfTools, subTools: ['pdf-convert', 'pdf-merge', 'pdf-edit', 'pdf-unlock', 'pdf-secure'] },
    { id: 'doc-main', title: 'Doc Converter', icon: 'description', category: 'Media', component: DocTools, subTools: ['doc-convert', 'markdown-editor', 'pdf-to-word'] },
    { id: 'img-main', title: 'Image Editor', icon: 'image', category: 'Media', component: ImageTools, subTools: ['img-resize', 'img-filter', 'img-compress', 'aspect-ratio', 'color-extractor'] },
    { id: 'audio-main', title: 'Audio & Sounds', icon: 'volume_up', category: 'Media', component: AudioVideoTools, subTools: ['sound-meter', 'audio-trimmer', 'frequency-gen'] },
    { id: 'video-main', title: 'Camera Tools', icon: 'videocam', category: 'Media', component: VideoTools, subTools: ['mirror', 'flashlight', 'video-recorder'] },
    { id: 'color-main', title: 'Color Hub', icon: 'palette', category: 'Media', component: ColorTools, subTools: ['color-picker', 'palette-gen', 'contrast-checker'] },

    // Communication & Web
    { id: 'web-main', title: 'Web Utilities', icon: 'public', category: 'Web', component: WebTools, subTools: ['qr-scanner', 'url-shortener', 'cookie-manager', 'browser-info', 'whois-lookup'] },
    { id: 'network-main', title: 'Network Hub', icon: 'router', category: 'Web', component: NetworkTools, subTools: ['ping-test', 'dns-lookup', 'ip-geo', 'ssl-check', 'speed-test', 'port-scanner'] },

    // Developer
    { id: 'dev-main', title: 'Developer Hub', icon: 'terminal', category: 'Developer', component: DevTools, subTools: ['base64', 'cron-helper', 'diff-viewer', 'json-formatter', 'jwt-decoder', 'regex-tester', 'sql-formatter', 'yaml-json'] },

    // Math & Science
    { id: 'edu-main', title: 'Education Hub', icon: 'school', category: 'Education', component: EducationTools, subTools: ['flashcards', 'periodic-table', 'calculator', 'graphing-calc', 'math-solver'] },
    { id: 'data-main', title: 'Data Science', icon: 'insights', category: 'Data', component: DataTools, subTools: ['csv-viewer', 'data-visualizer', 'anomaly-detect', 'stat-calc'] },
    { id: 'unit-main', title: 'Unit Converter', icon: 'balance', category: 'Education', component: UnitConverterTools, subTools: ['length-conv', 'weight-conv', 'temp-conv', 'currency-conv'] },

    // System & Tools
    { id: 'device-main', title: 'Device Hub', icon: 'memory', category: 'Sensors', component: DeviceTools, subTools: ['battery-info', 'storage-info', 'sensor-info', 'hardware-test'] },
    { id: 'travel-main', title: 'Travel & Outdoor', icon: 'explore', category: 'Sensors', component: TravelTools, subTools: ['packing-list', 'compass', 'altimeter', 'world-clock'] },
    { id: 'time-main', title: 'Date & Time', icon: 'schedule', category: 'Utility', component: DateTimeTools, subTools: ['age-calc', 'stopwatch', 'pomodoro', 'time-diff'] },
    { id: 'finance-main', title: 'Finance Tools', icon: 'payments', category: 'Utility', component: FinanceTools, subTools: ['loan-calc', 'investment-calc', 'tax-calc', 'tip-calc'] },
    { id: 'health-main', title: 'Health Hub', icon: 'monitor_heart', category: 'Health', component: HealthTools, subTools: ['bmi-calc', 'water-tracker', 'step-counter', 'calorie-calc'] },
    { id: 'game-main', title: 'Games Hub', icon: 'casino', category: 'Games', component: GameTools, subTools: ['snake-game', 'sudoku', '2048', 'tic-tac-toe'] },
    { id: 'security-main', title: 'Privacy & Security', icon: 'security', category: 'Security', component: PrivacySecurityTools, subTools: ['hash-gen', 'password-gen', 'permission-auditor', 'encryption-tool'] },
    { id: 'weather-main', title: 'Weather', icon: 'filter_drama', category: 'Sensors', component: WeatherTools, subTools: ['current-weather', 'forecast', 'uv-index', 'air-quality'] },
    { id: 'text-main', title: 'Text Tools', icon: 'notes', category: 'Utility', component: TextTools, subTools: ['case-converter', 'word-counter', 'lorem-ipsum', 'text-cleaner'] },
];

const ToolboxView = ({ searchQuery, groupToolbox, showStats, recentTools, setRecentTools, hideRecentTools }) => {
  const [activeToolId, setActiveToolId] = useState(null);
  const [currentResult, setCurrentResult] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [pinnedTools, setPinnedTools] = useState(storage.getJSON('hub_pinned_tools', []));

  useEffect(() => { storage.setJSON('hub_pinned_tools', pinnedTools); }, [pinnedTools]);

  const togglePin = (e, id) => {
    e.stopPropagation();
    let newPinned = pinnedTools.includes(id) ? pinnedTools.filter(t => t !== id) : [id, ...pinnedTools];
    setPinnedTools(newPinned);
  };

  const openTool = (id, skipHistory = false) => {
    if (activeToolId === id) return;
    setActiveToolId(id);
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
    if (navigator.share) { try { await navigator.share({ title: `Nature Hub - ${tool.title}`, url }); } catch (err) {} }
    else { navigator.clipboard.writeText(url); alert("Link copied!"); }
  };

  const filteredTools = useMemo(() => TOOLS.filter(t => {
    let matchesSearch = true, matchesCat = true;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (query.startsWith('cat:')) matchesCat = t.category.toLowerCase().includes(query.replace('cat:', '').trim());
      else matchesSearch = t.title.toLowerCase().includes(query) || t.category.toLowerCase().includes(query);
    }
    if (!searchQuery || !searchQuery.toLowerCase().startsWith('cat:')) {
      if (activeCategory === 'Pinned') matchesCat = pinnedTools.includes(t.id);
      else if (activeCategory !== 'All') matchesCat = t.category === activeCategory;
    }
    return matchesSearch && matchesCat;
  }), [searchQuery, activeCategory, pinnedTools]);

  const toolboxCategories = useMemo(() => {
    const cats = {};
    [...new Set(TOOLS.map(t => t.category))].forEach(cat => { cats[cat] = getCategoryIcon(cat); });
    return cats;
  }, []);

  const handleCopyResult = () => {
    if (!currentResult?.text) return;
    navigator.clipboard.writeText(currentResult.text).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
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
          <div className="flex-center" style={{ gap: '12px' }}>
            <button className="icon-btn" onClick={() => { setActiveToolId(null); window.history.back(); }}><span className="material-icons">arrow_back</span></button>
            <div className="flex-center" style={{ gap: '12px' }}>
              <span className="material-icons" style={{fontSize: '2rem', color: 'var(--primary)'}}>{tool.icon}</span>
              <h2 className="m-0">{tool.title}</h2>
            </div>
          </div>
          <div className="flex-center" style={{ gap: '10px' }}>
            {currentResult?.text && <button className={`icon-btn ${copySuccess ? 'copy-success' : ''}`} onClick={handleCopyResult}><span className="material-icons">{copySuccess ? 'check' : 'content_copy'}</span></button>}
          </div>
        </div>
        <div className="tool-container-inner">
          <Suspense fallback={<div className="text-center p-20 rotating">refresh</div>}>
            <tool.component onResultChange={setCurrentResult} toolId={effectiveToolId} />
          </Suspense>
        </div>
      </div>
    );
  }

  return (
    <>
      <CategoryNav categories={toolboxCategories} activeCategory={activeCategory} setActiveCategory={setActiveCategory} totalCount={TOOLS.length} extraCategories={[{ name: 'Pinned', icon: 'push_pin', count: pinnedTools.length }]} />
      <div className="toolbox-page-header"><h2>Toolbox Hubs</h2><p>All tools consolidated into unified categories.</p></div>
      <div className="category-grid p-0-10">
        {filteredTools.map((tool, idx) => (
          <ToolCard key={tool.id} tool={tool} idx={idx} isPinned={pinnedTools.includes(tool.id)} togglePin={togglePin} handleShare={handleShare} openTool={openTool} searchQuery={searchQuery} highlightText={highlightText} />
        ))}
      </div>
    </>
  );
};

const ToolCard = memo(({ tool, idx, isPinned, togglePin, handleShare, openTool, searchQuery, highlightText }) => (
    <div id={`card-${tool.id}`} className="card" style={{'--delay': idx}} onClick={() => openTool(tool.id)}>
       <div className="card-actions">
            <button className={`pin-btn ${isPinned ? 'active' : ''}`} onClick={(e) => togglePin(e, tool.id)}><span className="material-icons">push_pin</span></button>
            <button onClick={(e) => handleShare(e, tool)}><span className="material-icons">share</span></button>
       </div>
       <div className="card-header">
            <div className="card-icon flex-center" style={{ background: 'var(--bg)' }}><span className="material-icons">{tool.icon}</span></div>
            <div className="card-title" dangerouslySetInnerHTML={{ __html: highlightText(tool.title, searchQuery) }} />
        </div>
    </div>
));

const getCategoryIcon = (cat) => {
    const icons = { 'Productivity': 'assignment', 'Creative': 'brush', 'Media': 'perm_media', 'Web': 'public', 'Developer': 'terminal', 'Data': 'insights', 'Security': 'security', 'Sensors': 'sensors', 'Games': 'casino', 'Education': 'school', 'Utility': 'more_horiz' };
    return icons[cat] || 'folder';
};

export default ToolboxView;
