import React, { useState, useEffect, useRef } from 'react';

const ColorTools = ({ toolId, onSubtoolChange }) => {
  const [activeTab, setActiveTab] = useState('picker');
  const [color, setColor] = useState('#3b82f6');

  useEffect(() => {
    const labels = { 'picker': 'Color Picker', 'converter': 'Converter', 'harmonies': 'Harmonies', 'blender': 'Blender' };
    if (onSubtoolChange) onSubtoolChange(labels[activeTab]);
  }, [activeTab]);

  useEffect(() => {
    if (toolId) {
        if (toolId === 'img-color' || toolId === 'cam-color' || toolId === 'color-picker') setActiveTab('picker');
        else if (toolId === 'color-conv') setActiveTab('converter');
        else if (toolId === 'color-harm' || toolId === 'tints-shades') setActiveTab('harmonies');
        else if (toolId === 'color-blend') setActiveTab('blender');
        else if (toolId === 'color-contrast') setActiveTab('contrast');
        else setActiveTab(toolId);
    }
  }, [toolId]);

  const isDeepLinked = !!toolId;

  return (
    <div className="tool-form">
      {!isDeepLinked && (
        <div className="pill-group mb-20 scrollable-x">
          <button className={`pill ${activeTab === 'picker' ? 'active' : ''}`} onClick={() => setActiveTab('picker')}>Picker</button>
          <button className={`pill ${activeTab === 'converter' ? 'active' : ''}`} onClick={() => setActiveTab('converter')}>Converter</button>
          <button className={`pill ${activeTab === 'harmonies' ? 'active' : ''}`} onClick={() => setActiveTab('harmonies')}>Harmonies</button>
          <button className={`pill ${activeTab === 'blender' ? 'active' : ''}`} onClick={() => setActiveTab('blender')}>Blender</button>
          <button className={`pill ${activeTab === 'contrast' ? 'active' : ''}`} onClick={() => setActiveTab('contrast')}>Contrast</button>
        </div>
      )}

      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <input type="color" value={color} onChange={e => setColor(e.target.value)} style={{ width: '100px', height: '100px', borderRadius: '50%', border: 'none', cursor: 'pointer' }} />
          <div style={{ marginTop: '10px', fontSize: '1.2rem', fontWeight: 'bold' }}>{color.toUpperCase()}</div>
      </div>

      {activeTab === 'picker' && <ImageColorPicker setColor={setColor} />}
      {activeTab === 'converter' && <ColorConverter color={color} />}
      {activeTab === 'harmonies' && <ColorHarmonies color={color} />}
      {activeTab === 'blender' && <ColorBlender colorA={color} />}
      {activeTab === 'contrast' && <ContrastChecker color={color} />}
    </div>
  );
};

const ImageColorPicker = ({ setColor }) => {
    const canvasRef = useRef(null);
    const handleUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = canvasRef.current;
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);
                };
                img.src = ev.target.result;
            };
            reader.readAsDataURL(file);
        }
    };
    const pickColor = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) * (canvasRef.current.width / rect.width);
        const y = (e.clientY - rect.top) * (canvasRef.current.height / rect.height);
        const ctx = canvasRef.current.getContext('2d');
        const [r, g, b] = ctx.getImageData(x, y, 1, 1).data;
        const hex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
        setColor(hex);
    };
    return (
        <div style={{ textAlign: 'center' }}>
            <input type="file" onChange={handleUpload} accept="image/*" className="pill" style={{ marginBottom: '10px' }} />
            <div style={{ maxWidth: '100%', overflow: 'auto' }}>
                <canvas ref={canvasRef} onClick={pickColor} style={{ maxWidth: '100%', cursor: 'crosshair' }}></canvas>
            </div>
        </div>
    );
};

const ColorConverter = ({ color }) => {
    const hexToRgb = (hex) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgb(${r}, ${g}, ${b})`;
    };
    return (
        <div style={{ textAlign: 'center' }}>
            <div className="tool-result" style={{ marginBottom: '10px' }}>HEX: {color.toUpperCase()}</div>
            <div className="tool-result">RGB: {hexToRgb(color)}</div>
        </div>
    );
};

const ColorHarmonies = ({ color }) => {
    // Basic complementary logic
    const getComp = (hex) => {
        const r = (255 - parseInt(hex.slice(1, 3), 16)).toString(16).padStart(2, '0');
        const g = (255 - parseInt(hex.slice(3, 5), 16)).toString(16).padStart(2, '0');
        const b = (255 - parseInt(hex.slice(5, 7), 16)).toString(16).padStart(2, '0');
        return `#${r}${g}${b}`;
    };
    const comp = getComp(color);
    return (
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{ width: '60px', height: '60px', background: color, borderRadius: '8px' }} />
                <div style={{ fontSize: '0.7rem' }}>Base</div>
            </div>
            <div style={{ textAlign: 'center' }}>
                <div style={{ width: '60px', height: '60px', background: comp, borderRadius: '8px' }} />
                <div style={{ fontSize: '0.7rem' }}>Comp</div>
            </div>
        </div>
    );
};

const ContrastChecker = ({ color }) => {
    const [bg, setBg] = useState('#ffffff');
    const getContrast = (hex1, hex2) => {
        const lum = (h) => {
            const r = parseInt(h.slice(1,3),16)/255, g = parseInt(h.slice(3,5),16)/255, b = parseInt(h.slice(5,7),16)/255;
            const a = [r,g,b].map(v => v <= 0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4));
            return a[0]*0.2126 + a[1]*0.7152 + a[2]*0.0722;
        };
        const l1 = lum(hex1), l2 = lum(hex2);
        return (Math.max(l1,l2)+0.05) / (Math.min(l1,l2)+0.05);
    };
    const ratio = getContrast(color, bg).toFixed(2);
    return (
        <div className="card p-15 text-center">
            <input type="color" value={bg} onChange={e=>setBg(e.target.value)} className="pill mb-15" />
            <div style={{ background: bg, color: color, padding: '20px', borderRadius: '12px', fontSize: '1.2rem', fontWeight: 800 }}>
                Sample Text
            </div>
            <div className="mt-15">Ratio: <b>{ratio}:1</b></div>
            <div className={`smallest font-bold ${ratio >= 4.5 ? 'color-primary' : 'text-danger'}`}>
                {ratio >= 4.5 ? 'WCAG AA Passed' : 'WCAG AA Failed'}
            </div>
        </div>
    );
};

const ColorBlender = ({ colorA }) => {
    const [colorB, setColorB] = useState('#ffffff');
    const blend = (c1, c2) => {
        const r1 = parseInt(c1.slice(1, 3), 16);
        const g1 = parseInt(c1.slice(3, 5), 16);
        const b1 = parseInt(c1.slice(5, 7), 16);
        const r2 = parseInt(c2.slice(1, 3), 16);
        const g2 = parseInt(c2.slice(3, 5), 16);
        const b2 = parseInt(c2.slice(5, 7), 16);
        const r = Math.round((r1 + r2) / 2).toString(16).padStart(2, '0');
        const g = Math.round((g1 + g2) / 2).toString(16).padStart(2, '0');
        const b = Math.round((b1 + b2) / 2).toString(16).padStart(2, '0');
        return `#${r}${g}${b}`;
    };
    const mixed = blend(colorA, colorB);
    return (
        <div style={{ textAlign: 'center' }}>
            <input type="color" value={colorB} onChange={e => setColorB(e.target.value)} className="pill" />
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '15px', alignItems: 'center' }}>
                <div style={{ width: '50px', height: '50px', background: colorA, borderRadius: '8px' }} />
                <span>+</span>
                <div style={{ width: '50px', height: '50px', background: colorB, borderRadius: '8px' }} />
                <span>=</span>
                <div style={{ width: '70px', height: '70px', background: mixed, borderRadius: '8px', border: '2px solid var(--primary)' }} />
            </div>
            <div style={{ marginTop: '10px' }}>Mixed: {mixed.toUpperCase()}</div>
        </div>
    );
};

export default ColorTools;
