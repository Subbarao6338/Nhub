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
      <h2>Select Profile</h2>
      <div className="profile-list">
        {profiles.map(p => (
          <div key={p.id} className="profile-item-row">
            <button
              className={`pill ${currentProfile === p.name ? 'active' : ''}`}
              onClick={() => onSelect(p.name)}
            >
              <span className="material-icons">{p.icon}</span>
              <span>{p.name} Profile</span>
            </button>
            <button
              className={`startup-toggle ${startupProfile === p.name ? 'active' : ''}`}
              onClick={(e) => toggleStartup(e, p.name)}
              title="Set as Default Startup Profile"
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
