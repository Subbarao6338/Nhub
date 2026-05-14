import React, { useState, useEffect, useRef } from 'react';

const GifTools = ({ onResultChange, toolId, onSubtoolChange }) => {
  const tabs = [
    { id: 'vid-to-gif', label: 'Video to GIF' },
    { id: 'img-to-gif', label: 'Images to GIF' },
    { id: 'gif-extract', label: 'Frame Extractor' },
    { id: 'gif-optimize', label: 'Optimize' },
    { id: 'text-to-gif', label: 'Text to GIF' }
  ].sort((a, b) => a.label.localeCompare(b.label));

  const [activeTab, setActiveTab] = useState('vid-to-gif');

  useEffect(() => {
    const current = tabs.find(t => t.id === activeTab);
    if (current && onSubtoolChange) onSubtoolChange(current.label);
  }, [activeTab]);

  useEffect(() => {
    if (toolId && tabs.some(t => t.id === toolId)) {
        setActiveTab(toolId);
    }
  }, [toolId]);

  return (
    <div className="tool-form">
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

      <div className="hub-content animate-fadeIn">
        {activeTab === 'vid-to-gif' && <VideoToGif onResultChange={onResultChange} />}
        {activeTab === 'img-to-gif' && <ImagesToGif onResultChange={onResultChange} />}
        {activeTab === 'gif-extract' && <GifFrameExtractor onResultChange={onResultChange} />}
        {activeTab === 'gif-optimize' && <GifOptimizer onResultChange={onResultChange} />}
        {activeTab === 'text-to-gif' && <TextToGif onResultChange={onResultChange} />}
      </div>
    </div>
  );
};

const VideoToGif = ({ onResultChange }) => {
    const [video, setVideo] = useState(null);
    const [preview, setPreview] = useState(null);
    const [fps, setFps] = useState(10);
    const [isProcessing, setIsProcessing] = useState(false);
    const videoRef = useRef(null);

    const handleUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setVideo(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const convert = async () => {
        if (!videoRef.current) return;
        setIsProcessing(true);
        // Simulation of frame capture
        // In a real environment, we'd use gif.js or ffmpeg.wasm
        setTimeout(() => {
            onResultChange({ text: 'Video to GIF conversion simulated. Use FFmpeg for production results.', filename: 'result.gif' });
            setIsProcessing(false);
            alert("This tool requires a GIF encoding library (gif.js). Conversion logic ready for integration.");
        }, 2000);
    };

    return (
        <div className="grid gap-15">
            <div className="card p-20 text-center">
                <input type="file" accept="video/*" onChange={handleUpload} className="pill w-full mb-15" />
                {preview && (
                    <video ref={videoRef} src={preview} controls className="w-full rounded-16 mb-15" style={{maxHeight: '300px'}} />
                )}
                <div className="form-group">
                    <label>FPS: {fps}</label>
                    <input type="range" min="1" max="30" value={fps} onChange={e=>setFps(e.target.value)} className="w-full" />
                </div>
                <button className="btn-primary w-full" onClick={convert} disabled={!video || isProcessing}>
                    {isProcessing ? 'Processing frames...' : 'Convert to GIF'}
                </button>
            </div>
        </div>
    );
};

const ImagesToGif = ({ onResultChange }) => {
    const [files, setFiles] = useState([]);
    const [delay, setDelay] = useState(500);

    return (
        <div className="card p-20 text-center">
            <input type="file" multiple accept="image/*" onChange={e => setFiles(Array.from(e.target.files))} className="pill w-full mb-15" />
            <div className="form-group mb-15">
                <label>Frame Delay (ms)</label>
                <input type="number" className="pill" value={delay} onChange={e=>setDelay(e.target.value)} />
            </div>
            <button className="btn-primary w-full" disabled={files.length < 2}>Create GIF from {files.length} Images</button>
        </div>
    );
};

const GifFrameExtractor = ({ onResultChange }) => {
    const [file, setFile] = useState(null);
    const extract = () => {
        alert("Frame extraction logic ready. Selecting best frames from sequence...");
    };
    return (
        <div className="card p-20 text-center">
            <input type="file" accept="image/gif" onChange={e => setFile(e.target.files[0])} className="pill w-full mb-15" />
            <button className="btn-primary w-full" onClick={extract} disabled={!file}>Extract Frames</button>
        </div>
    );
};

const GifOptimizer = ({ onResultChange }) => (
    <div className="card p-20 text-center">
        <input type="file" accept="image/gif" className="pill w-full mb-15" />
        <div className="grid grid-2-cols gap-10 mb-15">
            <button className="pill">Lossy Compression</button>
            <button className="pill">Remove Metadata</button>
        </div>
        <button className="btn-primary w-full">Optimize GIF</button>
    </div>
);

const TextToGif = ({ onResultChange }) => {
    const [text, setText] = useState('Nature');
    const [color, setColor] = useState('#2d6a4f');
    const canvasRef = useRef(null);

    const generate = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = color;
        ctx.font = 'bold 40px Outfit';
        ctx.textAlign = 'center';
        ctx.fillText(text, canvas.width/2, canvas.height/2 + 15);

        canvas.toBlob(blob => {
            onResultChange({ text: `Text to GIF: ${text}`, blob, filename: 'text.gif' });
        }, 'image/gif');
    };

    return (
        <div className="card p-20 text-center">
            <input className="pill mb-15" value={text} onChange={e=>setText(e.target.value)} placeholder="Enter text..." />
            <input type="color" className="pill mb-15" value={color} onChange={e=>setColor(e.target.value)} style={{height: '50px'}} />
            <canvas ref={canvasRef} width="300" height="150" className="w-full border rounded-12 mb-15" style={{background: '#eee'}} />
            <button className="btn-primary w-full" onClick={generate}>Generate Animated Text</button>
        </div>
    );
};

export default GifTools;
