import React, { useState, useEffect, useRef } from 'react';

const VideoTools = ({ toolId, onResultChange, onSubtoolChange }) => {
  const [activeTab, setActiveTab] = useState('magnifier');

  useEffect(() => {
    const current = tabs.find(t => t.id === activeTab);
    if (current && onSubtoolChange) onSubtoolChange(current.label);
  }, [activeTab]);

  useEffect(() => {
    if (toolId) {
      const mapping = {
        'magnifier': 'magnifier',
        'mirror': 'mirror'
      };
      if (mapping[toolId]) setActiveTab(mapping[toolId]); else if (tabs.length > 0) setActiveTab(tabs[0].id);
    }
  }, [toolId]);

  const tabs = [
    { id: 'magnifier', label: 'Magnifier' },
    { id: 'mirror', label: 'Mirror' }
  ].sort((a, b) => a.label.localeCompare(b.label));

  const isDeepLinked = !!toolId && tabs.some(t => t.id === toolId || toolId.includes(t.id));

  return (
    <div className="tool-form">
      {!isDeepLinked && (
          <div className="pill-group mb-20 scrollable-x">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`pill ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
      )}

      {activeTab === 'magnifier' && <MagnifierTool />}
      {activeTab === 'mirror' && <MirrorTool />}
    </div>
  );
};

const MagnifierTool = () => {
    const videoRef = useRef(null);
    const [zoom, setZoom] = useState(1);
    const [facingMode, setFacingMode] = useState('environment');

    useEffect(() => {
        let videoStream;
        navigator.mediaDevices.getUserMedia({ video: { facingMode } }).then(stream => {
            videoStream = stream;
            if (videoRef.current) videoRef.current.srcObject = stream;
        }).catch(err => console.error(err));
        return () => {
            if (videoStream) videoStream.getTracks().forEach(track => track.stop());
        };
    }, [facingMode]);

    return (
        <div className="text-center card p-20">
            <div style={{ width: '100%', height: '300px', borderRadius: '16px', overflow: 'hidden', position: 'relative', background: '#000' }}>
                <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${zoom})`, transition: 'transform 0.1s ease-out' }} />
            </div>
            <div className="mt-20 grid gap-10">
                <div className="flex-gap">
                    <button className="pill flex-1" onClick={() => setFacingMode(prev => prev === 'user' ? 'environment' : 'user')}>
                        <span className="material-icons">flip_camera_ios</span> Flip
                    </button>
                    <button className="btn-primary flex-1" onClick={() => {
                        const canvas = document.createElement('canvas');
                        canvas.width = videoRef.current.videoWidth;
                        canvas.height = videoRef.current.videoHeight;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(videoRef.current, 0, 0);
                        canvas.toBlob(blob => {
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = 'capture.png';
                            a.click();
                        });
                    }}>
                        <span className="material-icons">photo_camera</span> Capture
                    </button>
                </div>
                <label style={{ display: 'block' }} className="opacity-6">Zoom: {zoom}x</label>
                <input type="range" min="1" max="5" step="0.1" value={zoom} onChange={e => setZoom(parseFloat(e.target.value))} className="w-full" />
            </div>
        </div>
    );
};

const MirrorTool = () => {
    const videoRef = useRef(null);
    useEffect(() => {
        let videoStream;
        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } }).then(stream => {
            videoStream = stream;
            if (videoRef.current) videoRef.current.srcObject = stream;
        }).catch(err => console.error(err));
        return () => {
            if (videoStream) videoStream.getTracks().forEach(track => track.stop());
        };
    }, []);
    return (
        <div className="text-center card p-20">
            <video ref={videoRef} autoPlay playsInline style={{ width: '100%', borderRadius: '16px', transform: 'scaleX(-1)' }} />
            <p className="mt-15 opacity-6">Front camera mirrored</p>
        </div>
    );
};

export default VideoTools;
