import React from 'react';
import { storage } from '../utils/storage';

const ProfileModal = ({ profiles, currentProfile, onSelect, onCancel }) => {
  const [startupProfile, setStartupProfile] = React.useState(storage.get('hub_startup_profile', 'Default'));

  const toggleStartup = (e, name) => {
    e.stopPropagation();
    storage.set('hub_startup_profile', name);
    setStartupProfile(name);
  };

  return (
    <div className="modal">
      <div className="modal-header-flex">
        <h2 style={{margin: 0}}>Select Profile</h2>
        <button className="icon-btn" onClick={onCancel}><span className="material-icons">close</span></button>
      </div>
      <div className="profile-list modal-content">
        {profiles.map(p => (
          <div key={p.id} className="profile-item-row">
            <button
              className={`pill ${currentProfile === p.name ? 'active' : ''}`}
              onClick={() => onSelect(p.name)}
              style={{ flex: 1, justifyContent: 'flex-start', padding: '12px 18px' }}
            >
              <span className="material-icons" style={{ fontSize: '1.4rem' }}>{p.icon}</span>
              <span style={{ fontSize: '1rem' }}>{p.name} Profile</span>
            </button>
            <button
              className={`icon-btn ${startupProfile === p.name ? 'copy-success' : ''}`}
              onClick={(e) => toggleStartup(e, p.name)}
              title="Set as Default Startup Profile"
              style={{ width: '48px', height: '48px' }}
            >
              <span className="material-icons">{startupProfile === p.name ? 'star' : 'star_border'}</span>
            </button>
          </div>
        ))}
      </div>
      <div className="form-actions">
        <button type="button" className="pill" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
};

export default ProfileModal;
