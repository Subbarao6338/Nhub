import React, { useState } from 'react';
import { getApiBase } from '../api';

const CollapsibleSection = ({ id, title, icon, isOpen, onToggle, children }) => {
  return (
    <div className={`settings-collapsible ${isOpen ? 'is-open' : ''}`}>
      <div className="collapsible-header" onClick={() => onToggle(id)}>
        <div className="header-left">
          <span className="material-icons">{icon}</span>
          <span>{title}</span>
        </div>
        <span className="material-icons toggle-icon">
          {isOpen ? 'expand_less' : 'expand_more'}
        </span>
      </div>
      <div className="collapsible-content">
        <div className="collapsible-inner">
          {children}
        </div>
      </div>
    </div>
  );
};

const THEME_COLORS = [
  'indigo', 'blue', 'sky', 'teal', 'green', 'amber', 'orange', 'red', 'rose', 'purple', 'violet', 'slate'
];

const SettingsModal = ({
  deferredPrompt, setDeferredPrompt,
  appName, setAppName,
  enableProfiles, setEnableProfiles,
  showProjectsTab, setShowProjectsTab,
  startupTab, setStartupTab,
  enableHoverEffects, setEnableHoverEffects,
  theme, setTheme,
  accentColor, setAccentColor,
  isCompact, setIsCompact,
  hideBookmarks, setHideBookmarks,
  hideToolbox, setHideToolbox,
  hideUrls, setHideUrls,
  hideIcons, setHideIcons,
  showStats, setShowStats,
  autoFocusSearch, setAutoFocusSearch,
  openInNewTab, setOpenInNewTab,
  disableGlass, setDisableGlass,
  disableAnimations, setDisableAnimations,
  reducedMotion, setReducedMotion,
  confirmDelete, setConfirmDelete,
  groupToolbox, setGroupToolbox,
  hideRecentTools, setHideRecentTools,
  clearRecentTools,
  onClose,
  resetData
}) => {
  const [openSections, setOpenSections] = useState(['global', 'tabs', 'appearance', 'performance', 'data']);

  const toggleSection = (id) => {
    setOpenSections(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleExport = () => {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('hub_')) {
        data[key] = localStorage.getItem(key);
      }
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `epic_toolbox_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  const Toggle = ({ label, value, onChange, icon }) => (
    <div className="settings-row">
      <div className="settings-row-label">
        {icon && <span className="material-icons mr-10" style={{fontSize: '1.2rem', opacity: 0.7}}>{icon}</span>}
        <span>{label}</span>
      </div>
      <label className="switch">
        <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} />
        <span className="slider round"></span>
      </label>
    </div>
  );

  return (
    <div className="modal glass-card" style={{display: 'block', maxWidth: '600px'}}>
      <div className="modal-header-flex">
        <h2 style={{margin: 0, fontSize: '1.5rem', fontWeight: 800}}>Settings</h2>
        <button className="icon-btn" onClick={onClose}><span className="material-icons">close</span></button>
      </div>

      <div className="settings-container" style={{maxHeight: '70vh', overflowY: 'auto', paddingRight: '5px'}}>
        <CollapsibleSection id="global" title="General" icon="settings" isOpen={openSections.includes('global')} onToggle={toggleSection}>
          <div className="form-group">
            <label>Application Name</label>
            <input type="text" className="pill" value={appName} onChange={(e) => setAppName(e.target.value)} />
          </div>
          <Toggle label="Enable Profiles" value={enableProfiles} onChange={setEnableProfiles} icon="account_circle" />
          <Toggle label="Auto-focus Search" value={autoFocusSearch} onChange={setAutoFocusSearch} icon="search" />
          <Toggle label="Open links in new tab" value={openInNewTab} onChange={setOpenInNewTab} icon="open_in_new" />
          <Toggle label="Confirm Deletion" value={confirmDelete} onChange={setConfirmDelete} icon="delete" />
        </CollapsibleSection>

        <CollapsibleSection id="tabs" title="Tabs & Navigation" icon="tab" isOpen={openSections.includes('tabs')} onToggle={toggleSection}>
           <div className="form-group">
            <label>Startup Tab</label>
            <div className="pill-group">
              {['toolbox', 'bookmarks', 'projects'].map(tab => (
                <button key={tab} className={`pill ${startupTab === tab ? 'active' : ''}`} onClick={() => setStartupTab(tab)} disabled={tab === 'projects' && !showProjectsTab}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <Toggle label="Show Toolbox" value={!hideToolbox} onChange={(v) => setHideToolbox(!v)} icon="handyman" />
          <Toggle label="Show Bookmarks" value={!hideBookmarks} onChange={(v) => setHideBookmarks(!v)} icon="bookmarks" />
          <Toggle label="Show Projects Tab" value={showProjectsTab} onChange={setShowProjectsTab} icon="architecture" />
        </CollapsibleSection>

        <CollapsibleSection id="appearance" title="UI Customization" icon="palette" isOpen={openSections.includes('appearance')} onToggle={toggleSection}>
          <div className="form-group">
            <label>Theme Mode</label>
            <div className="pill-group">
              {['light', 'dark', 'system'].map(t => (
                <button key={t} className={`pill ${theme === t ? 'active' : ''}`} onClick={() => setTheme(t)}>
                  <span className="material-icons mr-10" style={{fontSize: '1.1rem'}}>{t === 'light' ? 'light_mode' : t === 'dark' ? 'dark_mode' : 'settings_brightness'}</span>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label>Accent Color</label>
            <div className="scrollable-x" style={{padding: '5px 0'}}>
              <div className="flex-gap">
                {THEME_COLORS.map(color => (
                  <button key={color} className={`color-circle ${accentColor === color ? 'active' : ''}`} style={{background: `var(--${color})` || color}} onClick={() => setAccentColor(color)} title={color} />
                ))}
              </div>
            </div>
          </div>
          <Toggle label="Compact View" value={isCompact} onChange={setIsCompact} icon="view_headline" />
          <Toggle label="Hide URLs" value={hideUrls} onChange={setHideUrls} icon="link_off" />
          <Toggle label="Hide Icons" value={hideIcons} onChange={setHideIcons} icon="image_not_supported" />
          <Toggle label="Show Statistics" value={showStats} onChange={setShowStats} icon="bar_chart" />
          <Toggle label="Group Toolbox by Category" value={groupToolbox} onChange={setGroupToolbox} icon="grid_view" />
          <Toggle label="Hide Recent Tools" value={hideRecentTools} onChange={setHideRecentTools} icon="history" />
          <button className="pill w-full mt-10" onClick={clearRecentTools}><span className="material-icons mr-10">history_toggle_off</span> Clear Recent Tools</button>
        </CollapsibleSection>

        <CollapsibleSection id="performance" title="Effects & Performance" icon="speed" isOpen={openSections.includes('performance')} onToggle={toggleSection}>
          <Toggle label="Enable Glass Morphism" value={!disableGlass} onChange={(v) => setDisableGlass(!v)} icon="blur_on" />
          <Toggle label="Enable Animations" value={!disableAnimations} onChange={(v) => setDisableAnimations(!v)} icon="auto_awesome" />
          <Toggle label="Reduced Motion" value={reducedMotion} onChange={setReducedMotion} icon="motion_photos_off" />
          <Toggle label="Hover Effects" value={enableHoverEffects} onChange={setEnableHoverEffects} icon="mouse" />
        </CollapsibleSection>

        <CollapsibleSection id="data" title="Maintenance & Data" icon="storage" isOpen={openSections.includes('data')} onToggle={toggleSection}>
          {deferredPrompt && (
            <button className="btn-primary w-full mb-15" onClick={() => deferredPrompt.prompt()}>
              <span className="material-icons mr-10">install_desktop</span> Install App
            </button>
          )}
          <div className="grid grid-2 gap-10">
            <button className="pill" onClick={handleExport}><span className="material-icons mr-10">download</span> Export</button>
            <label className="pill" style={{cursor: 'pointer'}}>
              <span className="material-icons mr-10">upload</span> Import
              <input type="file" hidden accept=".json" onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                        try {
                            const json = JSON.parse(ev.target.result);
                            Object.keys(json).forEach(k => localStorage.setItem(k, json[k]));
                            window.location.reload();
                        } catch(e) { alert("Invalid backup file"); }
                    };
                    reader.readAsText(file);
                }
              }} />
            </label>
          </div>
          <button className="pill w-full mt-10" style={{color: 'var(--danger)', borderColor: 'var(--danger)'}} onClick={resetData}>
            <span className="material-icons mr-10">delete_forever</span> Reset All Data
          </button>
        </CollapsibleSection>
      </div>

      <div className="form-actions" style={{marginTop: '1.5rem'}}>
        <button type="button" className="btn-primary w-full" onClick={onClose}>Finish</button>
      </div>

      <style>{`
        .settings-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--border); }
        .settings-row:last-child { border-bottom: none; }
        .settings-row-label { display: flex; align-items: center; font-weight: 500; }
        .color-circle { width: 32px; height: 32px; border-radius: 50%; border: 2px solid transparent; cursor: pointer; transition: transform 0.2s; }
        .color-circle:hover { transform: scale(1.1); }
        .color-circle.active { border-color: var(--on-surface); transform: scale(1.1); }
        .switch { position: relative; display: inline-block; width: 44px; height: 24px; }
        .switch input { opacity: 0; width: 0; height: 0; }
        .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: var(--border); transition: .4s; border-radius: 24px; }
        .slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background-color: white; transition: .4s; border-radius: 50%; }
        input:checked + .slider { background-color: var(--primary); }
        input:checked + .slider:before { transform: translateX(20px); }
        .settings-collapsible { margin-bottom: 8px; border: 1px solid var(--border); border-radius: var(--radius-md); overflow: hidden; background: var(--brand-bg-light); }
        .collapsible-header { padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; font-weight: 700; transition: background 0.2s; }
        .collapsible-header:hover { background: var(--primary-glow); }
        .header-left { display: flex; align-items: center; gap: 10px; color: var(--primary); }
        .collapsible-content { max-height: 0; overflow: hidden; transition: max-height 0.3s ease-out; background: var(--surface-solid); }
        .settings-collapsible.is-open .collapsible-content { max-height: 1000px; transition: max-height 0.5s ease-in; }
        .collapsible-inner { padding: 16px; border-top: 1px solid var(--border); }
      `}</style>
    </div>
  );
};

export default SettingsModal;
