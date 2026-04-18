import React, { useState, useEffect } from 'react';

const UuidGenerator = ({ onResultChange }) => {
  const [uuids, setUuids] = useState([]);
  const [count, setCount] = useState(1);
  const [version, setVersion] = useState(4);

  const generateUUID = () => {
    const newUuids = [];
    for (let i = 0; i < count; i++) {
      // Basic v4 UUID generator (RFC 4122)
      let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
      newUuids.push(uuid);
    }
    setUuids(newUuids);
  };

  useEffect(() => {
    generateUUID();
  }, []);

  useEffect(() => {
    if (uuids.length > 0) {
      onResultChange({
        text: uuids.join('\n'),
        filename: 'uuids.txt'
      });
    } else {
      onResultChange(null);
    }
  }, [uuids, onResultChange]);

  return (
    <div className="tool-form">
      <div className="form-group">
        <label>Number of UUIDs</label>
        <input
          type="number"
          min="1"
          max="50"
          value={count}
          onChange={(e) => setCount(parseInt(e.target.value) || 1)}
        />
      </div>
      <button className="btn-primary" onClick={generateUUID}>Generate</button>

      <div className="tool-result">
        <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
          {uuids.join('\n')}
        </pre>
      </div>
    </div>
  );
};

export default UuidGenerator;
