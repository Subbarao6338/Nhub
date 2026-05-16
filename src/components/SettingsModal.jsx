import React, { useState, useEffect } from 'react';
import { getApiBase, setApiBase } from '../api';

const markdownToHTML = (markdown) => {
  if (!markdown) return '';
  const lines = markdown.split('\n');
  let html = '';
  let inCodeBlock = false;
  let codeContent = '';
  let inList = false;

  const parseInline = (text) => {
    return text
      .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/__(.*?)__/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/_(.*?)_/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/!\[(.*?)\]\((.*?)\)/g, "<img alt='$1' src='$2' />")
      .replace(/\[(.*?)\]\((.*?)\)/g, "<a href='$2' target='_blank' rel='noopener noreferrer'>$1</a>");
  };

  for (let line of lines) {
    const trimmedLine = line.trim();

    if (trimmedLine.startsWith('```')) {
      if (inCodeBlock) {
        html += `<pre><code>${codeContent}</code></pre>`;
        codeContent = '';
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeContent += line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + '\n';
      continue;
    }

    if (trimmedLine.startsWith('# ')) {
      if (inList) { html += '</ul>'; inList = false; }
      html += `<h1>${parseInline(trimmedLine.substring(2))}</h1>`;
    } else if (trimmedLine.startsWith('## ')) {
      if (inList) { html += '</ul>'; inList = false; }
      html += `<h2>${parseInline(trimmedLine.substring(3))}</h2>`;
    } else if (trimmedLine.startsWith('### ')) {
      if (inList) { html += '</ul>'; inList = false; }
      html += `<h3>${parseInline(trimmedLine.substring(4))}</h3>`;
    } else if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
      if (!inList) { html += '<ul>'; inList = true; }
      html += `<li>${parseInline(trimmedLine.substring(2))}</li>`;
    } else if (trimmedLine === '') {
      if (inList) { html += '</ul>'; inList = false; }
      html += '<div class="md-spacer"></div>';
    } else {
      if (inList) { html += '</ul>'; inList = false; }
      html += `<p>${parseInline(line)}</p>`;
    }
  }
  if (inList) html += '</ul>';
  return html;
};

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
  'indigo', 'blue', 'sky', 'cyan', 'teal', 'green', 'lime', 'yellow', 'amber', 'orange', 'deep-orange', 'red', 'pink', 'rose', 'purple', 'violet', 'lavender', 'slate', 'grey', 'brown', 'black', 'white',
  'ocean', 'earth', 'mountain', 'desert', 'sunset', 'winter', 'autumn', 'galaxy', 'blackhole',
  'midnight', 'canyon', 'glacier', 'sunlight', 'breeze', 'mist'
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
  onAddBookmark,
  onClose,
  resetData
}) => {
  const [openSections, setOpenSections] = useState(['global']);
  const [tempApiBase, setTempApiBase] = useState(getApiBase());

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

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        if (window.confirm("Importing will overwrite existing settings. Continue?")) {
          Object.keys(json).forEach(key => {
            if (key.startsWith('hub_')) {
              localStorage.setItem(key, json[key]);
            }
          });
          window.location.reload();
        }
      } catch (err) {
        alert("Invalid backup file.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="modal glass-card" style={{display: 'block'}}>
      <h2 style={{marginTop: 0, marginBottom: '2rem', fontSize: '2rem', fontWeight: 900}}>Settings</h2>

      <div className="settings-container">
        <CollapsibleSection
          id="global"
          title="Global"
          icon="settings"
          isOpen={openSections.includes('global')}
          onToggle={toggleSection}
        >
          {deferredPrompt && (
            <div className="form-group">
              <label>PWA Installation</label>
              <button
                className="btn-primary w-full"
                onClick={async () => {
                  deferredPrompt.prompt();
                  const { outcome } = await deferredPrompt.userChoice;
                  if (outcome === 'accepted') {
                    setDeferredPrompt(null);
                  }
                }}
              >
                <span className="material-icons mr-10">download_for_offline</span>
                Install Epic Toolbox
              </button>
            </div>
          )}
          <div className="form-group">
            <label>Application Name</label>
            <input
              type="text"
              className="pill"
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              placeholder="Epic Toolbox"
            />
          </div>
          <div className="form-group">
            <label>Startup Tab</label>
            <div className="pill-group">
              {['toolbox', 'bookmarks', 'projects'].map(tab => {
                if (tab === 'projects' && !showProjectsTab) return null;
                return (
                  <button
                    key={tab}
                    className={`pill ${startupTab === tab ? 'active' : ''}`}
                    onClick={() => setStartupTab(tab)}
                  >
                    <span>{tab.charAt(0).toUpperCase() + tab.slice(1)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          id="themes"
          title="Appearance"
          icon="palette"
          isOpen={openSections.includes('themes')}
          onToggle={toggleSection}
        >
          <div className="form-group">
            <label>Color Mode</label>
            <div className="pill-group">
              {['light', 'dark', 'system'].map(t => (
                <button
                  key={t}
                  className={`pill ${theme === t ? 'active' : ''}`}
                  onClick={() => setTheme(t)}
                >
                  <span className="material-icons mr-10">{t === 'light' ? 'light_mode' : t === 'dark' ? 'dark_mode' : 'settings_brightness'}</span>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label>Accent Color</label>
            <div className="scrollable-x" style={{padding: '10px 0'}}>
              <div className="flex-gap">
                {THEME_COLORS.map(color => (
                    <button
                    key={color}
                    className={`color-pill ${accentColor === color ? 'active' : ''}`}
                    style={{background: getHex(color), minWidth: '40px', height: '40px', borderRadius: '50%', border: accentColor === color ? '3px solid var(--on-surface)' : 'none'}}
                    onClick={() => setAccentColor(color)}
                    title={color}
                    />
                ))}
              </div>
            </div>
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          id="data"
          title="Maintenance"
          icon="storage"
          isOpen={openSections.includes('data')}
          onToggle={toggleSection}
        >
          <div className="grid gap-10">
            <button className="btn-primary" onClick={handleExport}>
              <span className="material-icons mr-10">download</span> Export Backup
            </button>
            <button className="pill" style={{color: 'var(--danger)'}} onClick={resetData}>
              <span className="material-icons mr-10">delete_forever</span> Reset Application
            </button>
          </div>
        </CollapsibleSection>
      </div>

      <div className="form-actions" style={{marginTop: '2rem'}}>
        <button type="button" className="btn-primary w-full" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

const getHex = (color) => {
    const map = {
        indigo: '#6366f1', blue: '#3b82f6', sky: '#0ea5e9', cyan: '#06b6d4', teal: '#14b8a6', green: '#10b981',
        mountain: '#475569', desert: '#dda15e', sunset: '#fb8500', winter: '#0369a1',
        autumn: '#bc4749', lavender: '#7c3aed', spring: '#166534', galaxy: '#c084fc',
        blackhole: '#1a1a1a', midnight: '#0f172a', blossom: '#e11d48',
        canyon: '#7c2d12', glacier: '#0284c7', meadow: '#4d7c0f', sunlight: '#92400e',
        breeze: '#0ea5e9', seedling: '#15803d', mist: '#64748b'
    };
    return map[color] || color;
}

export default SettingsModal;
