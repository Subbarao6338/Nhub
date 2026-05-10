import React, { useState, useRef, useEffect } from 'react';

const DrawingCanvas = () => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#4A6741');
  const [brushSize, setBrushSize] = useState(5);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const setupCanvas = () => {
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    };

    const resize = () => {
      const parent = canvas.parentElement;
      const tempImage = ctx.getImageData(0, 0, canvas.width, canvas.height);
      canvas.width = parent.clientWidth;
      canvas.height = 400;
      ctx.putImageData(tempImage, 0, 0);
      setupCanvas();
    };

    setupCanvas();
    const parent = canvas.parentElement;
    canvas.width = parent.clientWidth;
    canvas.height = 400;

    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  const startDrawing = (e) => {
    const { offsetX, offsetY } = getCoordinates(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY);
    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = getCoordinates(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.lineTo(offsetX, offsetY);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    if (e.touches && e.touches[0]) {
      return {
        offsetX: e.touches[0].clientX - rect.left,
        offsetY: e.touches[0].clientY - rect.top
      };
    }
    return {
      offsetX: e.nativeEvent.offsetX,
      offsetY: e.nativeEvent.offsetY
    };
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const downloadCanvas = () => {
    const link = document.createElement('a');
    link.download = 'nature-sketch.png';
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  return (
    <div className="drawing-canvas-container">
      <div className="canvas-controls flex-center gap-10 mb-15 flex-wrap">
        <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="color-swatch" />
        <input type="range" min="1" max="50" value={brushSize} onChange={(e) => setBrushSize(e.target.value)} />
        <button className="pill p-8-16" onClick={clearCanvas}>Clear</button>
        <button className="pill p-8-16" onClick={downloadCanvas}>Save</button>
      </div>
      <div className="canvas-wrapper card p-0 overflow-hidden" style={{ height: '400px', cursor: 'crosshair', touchAction: 'none' }}>
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseOut={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>
    </div>
  );
};

const PaletteGenerator = () => {
  const [palette, setPalette] = useState([]);

  const generatePalette = () => {
    const newPalette = Array.from({ length: 5 }, () => {
      const h = Math.floor(Math.random() * 360);
      const s = 30 + Math.floor(Math.random() * 40); // Muted nature colors
      const l = 40 + Math.floor(Math.random() * 30);
      return `hsl(${h}, ${s}%, ${l}%)`;
    });
    setPalette(newPalette);
  };

  useEffect(() => {
    generatePalette();
  }, []);

  const copyToClipboard = (color) => {
    navigator.clipboard.writeText(color);
    alert(`Copied ${color} to clipboard!`);
  };

  return (
    <div className="palette-gen-container">
      <div className="grid gap-15 mb-20" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))' }}>
        {palette.map((color, idx) => (
          <div key={idx} className="card p-0 flex-center flex-column overflow-hidden" style={{ height: '150px' }}>
            <div style={{ background: color, width: '100%', flex: 1 }} />
            <div className="p-10 w-100 flex-center flex-column bg-glass">
              <code style={{ fontSize: '0.8rem' }}>{color}</code>
              <button className="icon-btn mt-5" onClick={() => copyToClipboard(color)}>
                <span className="material-icons" style={{ fontSize: '1.2rem' }}>content_copy</span>
              </button>
            </div>
          </div>
        ))}
      </div>
      <button className="pill w-100 p-12" onClick={generatePalette}>Generate New Nature Palette</button>
    </div>
  );
};

const CreativeTools = ({ toolId }) => {
  const [activeTab, setActiveTab] = useState(toolId === 'palette-gen' ? 'palette' : 'draw');

  return (
    <div className="creative-tools">
      {!toolId && (
        <div className="pill-group scrollable-x mb-20">
          <button className={`pill ${activeTab === 'draw' ? 'active' : ''}`} onClick={() => setActiveTab('draw')}>Sketchbook</button>
          <button className={`pill ${activeTab === 'palette' ? 'active' : ''}`} onClick={() => setActiveTab('palette')}>Palette Gen</button>
        </div>
      )}

      {activeTab === 'draw' || toolId === 'canvas-draw' ? <DrawingCanvas /> : null}
      {activeTab === 'palette' || toolId === 'palette-gen' ? <PaletteGenerator /> : null}
    </div>
  );
};

export default CreativeTools;
