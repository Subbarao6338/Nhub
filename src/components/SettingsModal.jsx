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
    <div className="modal glass-card" style={{maxWidth: '600px'}}>
      <div className="modal-header-flex">
        <h2 style={{margin: 0, fontSize: '1.5rem', fontWeight: 800}}>Settings</h2>
        <button className="icon-btn" onClick={onClose}><span className="material-icons">close</span></button>
      </div>

      <div className="settings-container" style={{flex: 1, overflowY: 'auto', paddingRight: '5px', marginTop: '1rem'}}>
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

          <div className="form-group">
            <label>Backup & Restore</label>
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
          </div>

          <div className="form-group">
            <label>Advanced Recovery</label>
            <div className="grid gap-10">
                <button className="pill" onClick={() => { if(confirm("Clear local storage?")) { localStorage.clear(); window.location.reload(); } }}>
                    <span className="material-icons mr-10">history_toggle_off</span> Reset App Settings
                </button>
                <button className="pill" onClick={() => {
                    if(confirm("Refresh data from JSON files? This will reload the app.")) {
                        fetch(`${getApiBase()}/debug/reset-db`, { method: 'POST' })
                            .then(() => window.location.reload())
                            .catch(e => alert("Refresh failed: " + e.message));
                    }
                }}>
                    <span className="material-icons mr-10">refresh</span> Refresh JSON Data
                </button>
            </div>
          </div>

          <button className="pill w-full mt-10" style={{color: 'var(--danger)', borderColor: 'var(--danger)'}} onClick={resetData}>
            <span className="material-icons mr-10">delete_forever</span> Reset All Data
          </button>
        </CollapsibleSection>
      </div>

      <div className="form-actions" style={{marginTop: '1.5rem'}}>
        <button type="button" className="btn-primary w-full" onClick={onClose}>Finish</button>
      </div>

    </div>
  );
};

export default SettingsModal;
